'use strict';

module.exports = (appSettings, enums, Logger, services) => {
	const io = require("socket.io");
	const SocketError = require('./SocketError')(Logger);
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
		server = io.listen(appSettings.socket.port);

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

			SocketError.dispatch(socket, enums.SocketErrors.Agent);
		}
	};


	/* Socket event handlers */


	/*
	**	Handle new machine connections
	*/
	const handleMachineConnection = async (socket) => {

		// Set machine "online" status
		await services.Machine.setOnlineStatus(socket.profile.id, true);
		socket.profile.online = true;

		SocketManager.registerMachine(socket);

		// Send machine controls profile to client
		const machineControls = socket.profile.controls.map(c => {
			return { feature_id: c.feature_id, control_id: c._id, x: c.x, y: c.y, z: c.z, d: c.d }
		});

		socket.emit('auth_succed', machineControls);

		// Bind machine socket events
		socket.on('part', handlePart);

		// Create machine channel
		SocketChannelManager.createChannel(String(socket.profile.id));

		// Broadcast all clients with machine online event
		broadcastMachineList(socket);

		Logger.info(`CONNECT (machine) id: ${socket.profile.id}, sid ${socket.id} at ${new Date().toISOString()}, transport: ${socket.conn.transport.name}`);
	};

	/*
	**	Handle new user connections
	*/
	const handleUserConnection = (socket) => {
		SocketManager.registerUser(socket);

		socket.on('list_machines', handleListMachines);
		socket.on('switch_channel', handleSwitchChannel);

		Logger.info(`CONNECT (user) id: ${socket.profile.id}, sid ${socket.id} at ${new Date().toISOString()}, transport: ${socket.conn.transport.name}`);
	};

	/*
	**	Switches the client to a specified machine channel
	*/
	const handleSwitchChannel = function(payload, ackFn) {
		const { channel_id } = payload;
		SocketChannelManager.switchToChannel(this, channel_id);

		ackFn({
			error: 0,
			data: {
				channel_id: channel_id
			}
		});
	};

	/*
	**	Responds with a list of all available machines
	*/
	const handleListMachines = async function(payload, ack) {
		const machines = await services.Machine.getOnlineMachines();
		ack(machines);

		Logger.warn(`LIST MACHINES from ${this.agent === enums.Agents.User ? "user":"machine"} id ${this.profile.id}`);
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
	const disconnectMachineSocket = async (socket) => {
		await services.Machine.setOnlineStatus(socket.profile.id, false);
		SocketChannelManager.removeChannel(socket.profile.id);

		broadcastMachineList(socket);

		Logger.info(`DISCONNECT (machine) id: ${socket.profile.id}, sid: ${socket.id}, host: ${socket.handshake.headers.host}`);
	};

	/*
	**	User disconnection
	*/
	const disconnectUserSocket = (socket) => {
		SocketChannelManager.leaveAllChannels(socket);

		Logger.info(`DISCONNECT (user) id: ${socket.profile.id}, sid: ${socket.id}, host: ${socket.handshake.headers.host}`);
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
		const report = services.Control.validateControlData(payload, this.profile);

		// Save log to db
		const log = await services.Log.save(report);

		// Get aggregated sum of deviations per control per part
		const aggDeviations = await services.Log.getAggregatedDeviations(this.profile);

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
		server.to(this.profile.id).emit('push', combined);

		Logger.info(`PART payload received from machine: ${this.profile.id}`);
	};


	/*
	**	Send machine list update broadcast event to all clients
	*/
	const broadcastMachineList = async (socket) => {
		const machines = await services.Machine.getOnlineMachines();
		socket.broadcast.emit('update_machines', machines);
	};

	return {
		init: init
	}
}
