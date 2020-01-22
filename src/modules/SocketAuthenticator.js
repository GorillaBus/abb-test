'use strict';

const md5 = require("md5");

module.exports = (enums, Logger, services) => {

	const verify = async (socket, next) => {

		console.log("************** VERIFYING")

		const token = socket.handshake.headers.token || null;
		const agent = parseInt(socket.handshake.headers.agent) || enums.Agents.User;

		if(!token) {
			socket.disconnect();
			Logger.error(`No token received, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
			return next(new Error());
		}

		if (agent === enums.Agents.Machine) {

			const machineProfile = await services.Machine.getProfile(token);
			if (!machineProfile) {
				socket.disconnect();
				Logger.error(`Invalid token received, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
				return next(new Error());
			}

			// Save machine profile into socket
			socket.agent = agent;
			socket.machineProfile = machineProfile;

		} else if (agent === enums.Agents.User) {

			socket.disconnect();
			Logger.error(`Users not allowed for now...`);
			return next(new Error());
		}

		else {

			console.log("Nothing....")
		}

		return next();
	};

	return {
		verify: verify
	};
}
