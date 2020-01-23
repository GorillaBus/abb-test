'use strict';

module.exports = (appSettings, enums, Logger, services) => {
	const io = require("socket.io");
	const SocketManager = require('./SocketManager')(enums, Logger);
	const SocketAuthenticator = require('./SocketAuthenticator')(enums, Logger, services);
	const SocketChannelManager = require('./SocketChannelManager')(enums, Logger);

	let server = null;


	/*
	**	Initialization: starts the socket.io server, handles authentification
	**	with middleware and delegates connection handling by agent type
	*/
	const init = () => {

		// Start listening
		server = io.listen(appSettings.app.port);

		// Authentification middleware
		server.use(SocketAuthenticator.verify);

		// Handle connection events
		server.on('connection', handleConnection);
	};



	/*
	**	Socket connection by agent type: user / machine
	*/
	const handleConnection = (socket) => {
		socket.on('disconnect', handleDisconnect);

		// Standard user connection
		if (socket.agent === enums.Agents.User) {
			handleUserConnection(socket);

		// Machine user connection
		} else if (socket.agent ===  enums.Agents.Machine) {
			handleMachineConnection(socket);

		// Discard any other unrecognized agent
		} else {

			Logger.warn(`CONNECT unrecognized agent, socket ${socket.id} at ${new Date().toISOString()}`);
			socket.disconnect();
		}
	};


	/* Socket event handlers */


	/*
	**	Handle new machine connections
	*/
	const handleMachineConnection = (socket) => {
		SocketManager.registerMachine(socket);

		// Send machine controls profile to client
		const machineControls = socket.machineProfile.controls.map(c => {
			return { feature_id: c.feature_id, control_id: c._id, x: c.x, y: c.y, z: c.z, d: c.d }
		});

		socket.emit('auth_succed', machineControls);

		// Bind machine socket events
		socket.on('part', handlePart);

		// Create machine channel
		SocketChannelManager.createChannel(String(socket.machineProfile.id));

		Logger.info(`CONNECT (machine) id: ${socket.machineProfile.id}, sid ${socket.id} at ${new Date().toISOString()}, transport: ${socket.conn.transport.name}`);
	};

	/*
	**	Handle new user connections
	*/
	const handleUserConnection = (socket) => {
		Logger.info(`CONNECT (user) id: ${socket.userProfile.id}, sid ${socket.id} at ${new Date().toISOString()}, transport: ${socket.conn.transport.name}`);
		SocketManager.registerUser(socket);
	};

	/*
	**	Handle socket disconnection by agent type
	*/
	const handleDisconnect = function() {
		if (this.agent === enums.Agents.User) {
			disconnectUserSocket(this);
		} else if (this.agent === enums.Agents.Machine) {
			disconnectMachineSocket(this);
		}
		SocketManager.remove(this);
	};

	/*
	**	Machine disconnection
	*/
	const disconnectMachineSocket = (socket) => {
		SocketChannelManager.removeChannel(socket.machineProfile.id);

		Logger.info(`DISCONNECT (machine) id: ${socket.machineProfile.id}, sid: ${socket.id}, host: ${socket.handshake.headers.host}`);
	};

	/*
	**	User disconnection
	*/
	const disconnectUserSocket = (socket) => {
		SocketChannelManager.leaveAllChannels(socket);

		Logger.info(`DISCONNECT (user) id: ${socket.userProfile.id}, sid: ${socket.id}, host: ${socket.handshake.headers.host}`);
	};



	/*
	**	Handle addition of new Part to a machine:
	**	Validates all controles for each part feature by computing
	**	the differences between the produced part and the part profile.
	**
	**	Saves the report to DB
	**
	*/
	const handlePart = async function(payload) {

		// Validate part controls and get a report
		const report = services.Control.validateControlData(payload, this.machineProfile);

		// Save log to db
		const log = await services.Registry.save(report);

		// Get aggregated sum of deviations per control per part
		const aggDeviations = await services.Registry.getAggregatedDeviations(this.machineProfile);

		// Combine log with aggregation results
		const combined = log.map(currLog => {
			currLog = currLog.toObject();
			const currDevs = aggDeviations.filter(controlDevs => {
				return String(controlDevs._id) === String(currLog.control_id)
			})[0];
			delete currLog.__v;
			return {
				...currLog,
				...currDevs
			}
		});

		// Emit push message to machine's channel
		server.to(this.machineProfile.id).emit('push', combined);

		Logger.info(`PART payload received from machine: ${this.machineProfile.id}`);
	};


	return {
		init: init
	}
}
