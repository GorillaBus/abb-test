'use strict';

module.exports = (appSettings, enums, Logger, services) => {
	const io = require("socket.io");
	const SocketManager = require('./SocketManager')(appSettings, Logger);
	const SocketAuthenticator = require('./SocketAuthenticator')(enums, Logger, services);

	let server = null;


	/*
	**	Initialization
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
	**	Socket connection handler
	*/
	const handleConnection = (socket) => {

		if (socket.agent === enums.Agents.User) {
			handleUserConnection(socket);

		} else if (socket.agent ===  enums.Agents.Machine) {
			handleMachineConnection(socket);

		} else {

			Logger.warn(`CONNECT unrecognized agent, socket ${socket.id} at ${new Date().toISOString()}`);
			socket.disconnect();
		}
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
		socket.on('disconnect', handleMachineDisconnect.bind(this));
		socket.on('part', handlePart.bind(this));

		Logger.info(`CONNECT machine ${socket.machineID} with socket ${socket.id} at ${new Date().toISOString()}`);
	};


	/*
	**	Handle disconnection
	*/
	const handleMachineDisconnect = () => {
		Logger.info(`DISCONNECT sid: ${this.socket.id}, host: ${this.socket.handshake.headers.host}, mid: ${this.socket.machineProfile.id}`);
		SocketManager.remove(this.socket);
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
