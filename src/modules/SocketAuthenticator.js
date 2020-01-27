'use strict';

module.exports = (enums, Logger, services) => {
	const SocketError = require('./SocketError')(Logger);

	const verify = async (socket, next) => {
		const token = socket.handshake.headers.token || socket.handshake.query.token || null;
		const agent = parseInt(socket.handshake.headers.agent) || enums.Agents.User;

		if(!token) {
			SocketError.dispatch(socket, enums.SocketErrors.Auth);
			return next(new Error(enums.SocketErrors.Auth));
		}

		// Get user by Token (fake auth)
		const user = await services.User.findByToken(token);
		if (!user) {

			SocketError.dispatch(socket, enums.SocketErrors.Auth);
			return next(new Error(enums.SocketErrors.Auth));
		}


		// Set the agent into the socket
		socket.agent = user.agent;

		// Handle Agnet types
		if (socket.agent === enums.Agents.Machine) {

			const profile = await services.Machine.getProfile(user._id);
			if (!profile) {
				SocketError.dispatch(socket, enums.SocketErrors.Auth);
				return next(new Error(enums.SocketErrors.Auth));
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
