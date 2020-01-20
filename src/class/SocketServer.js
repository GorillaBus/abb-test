'use strict';


module.exports = (appSettings, Logger, services) => {

	const SocketManager = require('./SocketManager')(appSettings, Logger);
	//const errors = require('../error/');
	//const events = require('../config/events');
	//const errorCodes = require('../config/errorCodes');
	const SocketAuthenticator = require('./SocketAuthenticator')(appSettings, Logger, services);
	const io = require("socket.io");
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
		server.on('connection', connectionHandler);
	}


	/*
	**	Socket connection handler
	*/
	const connectionHandler = (socket) => {

		bindSocketEvents(socket);

		SocketManager.add(socket);

		// if (socketManager.getUserSockets(socket.userId).length == 1) {
		// 	emitPresence(user);
		// }

		// echo globally (all clients) that a person has connected
		// user.rooms.forEach(function(room) {
		// 	socket.join(room);
		// });

		Logger.info(`CONNECT machine ${socket.machineID} with socket ${socket.id} at ${new Date().toISOString()}`);
	};


	/*
	**	Initialize event listeners on new socket
	*/
	const bindSocketEvents = (socket) => {

		socket.on('disconnect', () => {
			Logger.info(`DISCONNECT sid: ${socket.id}, host: ${socket.handshake.headers.host}, mid: ${socket.machineID}`);
			SocketManager.remove(socket);
		});

		socket.on('part', handleCreatePart);
	}


	const handleCreatePart = (data) => {
		console.log("Create part data:", data);
	};


	return {
		init: init
	}
}
