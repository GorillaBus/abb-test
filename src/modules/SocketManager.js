'use strict';

const Utils = require('./Utils')();

const SocketManager = (appSettings, Logger) => {
	const machineSockets = {};
	const userSockets = {};


	/*
	**	Register a new machine connection
	*/
	const registerMachine = async (socket) => {

		// DEV: warn on null sockets
		if (!socket) {
			Logger.warn(`SocketManager :: addMachineSocket invoked with null socket`);
			return false;
		}

		const machineId = socket.machineProfile.id;
		machineSockets[machineId] = socket;
	};

	const getMachineSocket = (machineId) => {
		return machineSockets[machineId];
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
		getMachineSocket,
		registerMachine,
		remove
	};
}

module.exports = SocketManager;
