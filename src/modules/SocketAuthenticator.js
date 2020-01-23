'use strict';

const md5 = require("md5");

module.exports = (enums, Logger, services) => {

	const verify = async (socket, next) => {
		const token = socket.handshake.headers.token || socket.handshake.query.token || null;
		const agent = parseInt(socket.handshake.headers.agent) || enums.Agents.User;

		if(!token) {
			socket.disconnect();
			Logger.error(`No token received, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
			return next(new Error());
		}

		// Get user by Token (fake auth)
		const user = await services.User.findByToken(token);
		if (!user) {
			socket.disconnect();
			Logger.error(`Invalid session, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
			return next(new Error());
		}

		// Set the agent into the socket
		socket.agent = user.agent;

		// Handle Agnet types
		if (socket.agent === enums.Agents.Machine) {

			const profile = await services.Machine.getProfile(user._id);
			if (!profile) {
				socket.disconnect();
				Logger.error(`Invalid token received, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
				return next(new Error());
			}

			// Save machine profile into socket
			socket.profile = profile;

		// Handle user client
		} else if (socket.agent === enums.Agents.User) {

			socket.profile = {
				id: user._id,
				name: user.name
			};
		}

		return next();
	};

	return {
		verify: verify
	};
}
