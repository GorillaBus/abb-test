'use strict';

module.exports = (appSettings, enums, Logger, services) => {
	const io = require("socket.io");
	const SocketManager = require('./SocketManager')(enums, Logger);
	const SocketAuthenticator = require('./SocketAuthenticator')(enums, Logger, services);

	let server = null;


	/*
	**	Initialization: starts the socket.io server, handles authentification
	**	of incoming connections and delegates connection handling by agent type
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
		this.socket = socket;

		socket.on('disconnect', handleDisconnect.bind(this));

		if (socket.agent === enums.Agents.User) {
			handleUserConnection(socket);

		} else if (socket.agent ===  enums.Agents.Machine) {
			handleMachineConnection(socket);

		} else {

			Logger.warn(`CONNECT unrecognized agent, socket ${socket.id} at ${new Date().toISOString()}`);
			socket.disconnect();
		}

		setTimeout(() => {
			const status = SocketManager.getStatus();
			console.log(status);
		})
	};


	/* Handlers for socket events */


	/*
	**	Handle new machine connections
	*/
	const handleMachineConnection = (socket) => {
		this.socket = socket;

		SocketManager.registerMachine(socket);

		// Send machine controls profile to client
		const machineControls = socket.machineProfile.controls.map(c => {
			return { feature_id: c.feature_id, control_id: c._id, x: c.x, y: c.y, z: c.z, d: c.d }
		});
		socket.emit('auth_succed', machineControls);

		// Bind machine socket events
		socket.on('part', handlePart.bind(this));



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
	const handleDisconnect = () => {
		const {socket} = this;

		if (socket.agent === enums.Agents.User) {
			disconnectUserSocket(socket);
		} else if (socket.agent === enums.Agents.Machine) {
			disconnectMachineSocket(socket);
		}

		SocketManager.remove(socket);
	};

	/*
	**	Machine disconnection
	*/
	const disconnectMachineSocket = (socket) => {
		Logger.info(`DISCONNECT (machine) id: ${socket.machineProfile.id}, sid: ${socket.id}, host: ${socket.handshake.headers.host}`);
	};

	/*
	**	User disconnection
	*/
	const disconnectUserSocket = (socket) => {
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
	const handlePart = async (payload) => {
		Logger.info(`PART payload received from machine: ${this.socket.machineProfile.id}`);

		// Validate part controls and get a report
		const report = services.Control.validateControlData(payload, this.socket.machineProfile);

		// Save log to db
		const log = await services.Registry.save(report);

		// Get aggregated sum of deviations per control per part
		const aggDeviations = await services.Registry.getAggregatedDeviations(this.socket.machineProfile);

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
		this.socket.to(this.socket.machineProfile.id).emit('push', combined);
	};


	return {
		init: init
	}
}
