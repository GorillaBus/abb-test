'use strict';

const Utils = require('./Utils')();

const SocketManager = (enums, Logger) => {
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

		const machineId = socket.profile.id;
		machineSockets[machineId] = socket;
	};

	/*
	**	Returns a list of connected machines
	*/
	const getConnectedMachines = () => {
		return Object.keys(machineSockets);
	};


	/*
	**	Register a new user connection
	*/
	const registerUser = async (socket) => {

		// DEV: warn on null sockets
		if (!socket) {
			Logger.warn(`SocketManager :: registerUser invoked with null socket`);
			return false;
		}

		const userId = socket.profile.id;
		userSockets[userId] = socket;
	};


	const getStatus = () => {
		return {
			machines: {machineSockets},
			users: {userSockets}
		}
	};


	const getMachineSocket = (machineId) => {
		return machineSockets[machineId];
	};


	/*
	**	Remove existing socket
	*/
	const remove = (socket, callback) => {
		if (socket.agent === enums.Agents.User) {
			delete userSockets[socket.profile.id];
		} else {
			delete machineSockets[socket.profile.id];
		}
	};

	return {
		getMachineSocket,
		registerMachine,
		registerUser,
		remove,
		getStatus,
		getConnectedMachines
	};
}

module.exports = SocketManager;
