'use strict';

const SocketChannelManager = (enums, Logger) => {
	const channels = {};

	const createChannel = (channelId) => {
		channelId = String(channelId);
		if (channels.hasOwnProperty(channelId)) {
			return false;
		}
		channels[channelId] = [];

		Logger.info(`CHANNEL id ${channelId} created`);
	};

	const removeChannel = (channelId) => {
		channelId = String(channelId);
		delete channels[channelId];

		Logger.info(`CHANNEL id ${channelId} removed`);
	};

	const joinChannel = (socket, channelId) => {
		channelId = String(channelId);
		if (!channels.hasOwnProperty(channelId)) {
			return;
		}
		socket.join(channelId);
		channels[channelId].push(socket.id);

		Logger.info(`CHANNEL id ${channelId}, socket ${socket.id} joined`);
	};

	const leaveChannel = (socket, channelId) => {
		channelId = String(channelId);
		const index = channels[channelId].findIndex(socketId => socketId === socket.id);
		if (index) {
			channels[channelId].splice(index, 1);
		}
		socket.leave(channelId);

		Logger.info(`CHANNEL id ${channelId}, socket ${socket.id} left`);
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

	const getStatus = () => {
		return channels;
	};

	return {
		getStatus,
		switchToChannel,
		createChannel,
		removeChannel,
		joinChannel,
		leaveChannel,
		leaveAllChannels,
		switchToChannel
	};
}

module.exports = SocketChannelManager;
