'use strict';

const Utils = require('./Utils')();

const SocketManager = (enums, Logger) => {
	const machineSockets = {};
	const userSockets = {};
	const channels = {};


	const createChannel = (channelId) => {
		channelId = String(channelId);
		if (channels.hasOwnProperty(channelId)) {
			return false;
		}
		channels[channelId] = [];
	};

	const removeChannel = (channelId) => {
		channelId = String(channelId);
		delete channels[channelId];
	};

	const joinChannel = (socket, channelId) => {
		channelId = String(channelId);
		if (!channels.hasOwnProperty(channelId)) {
			return;
		}
		socket.join(channelId);
		channels[channelId].push(socket.id);
	};

	const leaveChannel = (socket, channelId) => {
		channelId = String(channelId);
		const index = channels[channelId].findIndex(socketId => socketId === socket.id);
		if (index) {
			channels[channelId].splice(index, 1);
		}
	}

	const leaveAllChannels = (socket) => {
		Object.keys(channels).forEach(channelId => {
			leaveChannel(socket, channelId);
		})
	};

	const switchToChannel = (socket, channelId) => {
		channelId = String(channelId);
		leaveAllChannels(socket);
		joinChannel(socket, channelId);
	};

	const getChannelStatus = () => {
		return channels;
	};


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


	/*
	**	Register a new user connection
	*/
	const registerUser = async (socket) => {

		// DEV: warn on null sockets
		if (!socket) {
			Logger.warn(`SocketManager :: registerUser invoked with null socket`);
			return false;
		}

		const userId = socket.userProfile.id;
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
			delete userSockets[socket.userProfile.id];
		} else {
			delete machineSockets[socket.machineProfile.id];
		}
	};

	return {
		getMachineSocket,
		registerMachine,
		registerUser,
		remove,
		getStatus,

		getChannelStatus,
		switchToChannel,
		createChannel,
		removeChannel,
		joinChannel,
		leaveChannel,
		leaveAllChannels,
		switchToChannel
	};
}

module.exports = SocketManager;
