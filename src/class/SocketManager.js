'use strict';

const Utils = require('./Utils')();

const SocketManager = (appSettings, Logger) => {
	const sockets = {};

	/*
	**	Register a new socket
	*/
	const add = async (socket) => {

		if (!socket) {
			Logger.info(`SocketManager :: add invoked with an invalid socket`);
			return false;
		}

		if (sockets[socket.machineID]) {
			Logger.info(`Socket ${socket.machineID} already exist, updating connection`);
		}

		// Debug
		// const socks = Object.keys(sockets);
		// console.log("Current sockets: ", socks.length, socks);

		// Add socket to dictionary
		sockets[socket.machineID] = socket;
		return true;
	};


	/*
	**	Remove existing socket
	*/
	const remove = (socket, callback) => {
		var userId = socket.userId;
		// Deleting socket identifier;
		if (socket.machineID) {
			delete sockets[socket.machineID];
		}
	};

	return {
		add,
		remove
	};
}

module.exports = SocketManager;
