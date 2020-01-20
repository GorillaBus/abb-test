'use strict';

const md5 = require("md5");

module.exports = (auth, Logger, services, errors) => {

	const verify = async (socket, next) => {

		/*
		**	This is just a validation simulation. In a real case scenario we would
		**	be expecting to receive and validate a real token-
		*/
		const token = socket.handshake.headers.token || null;
		if(!token) {
			socket.emit("info", {
				type: "error",
				message: "Invalid token"
			});
			socket.disconnect();
			Logger.error(`No token received, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
			return next(new Error());
		}


		/*
		**	Here we are faking a token authentication pŕocess:
		**	With the "real token" we would gather profile data for the
		**	machine (the production "robot") to be added into the socket Object
		**	for later use.
		**	For simplicty, tokens are compared to a "token" field in the "machine"
		**	document.
		**
		**	Normally all this stuff would be done with OAuth2, JWT or something the like
		*/

		const machine = await services.Machine.findByToken(token);

		if (machine.length === 0) {
			socket.emit("info", {
				type: "error",
				message: "Invalid token"
			});
			socket.disconnect();
			Logger.error(`Invalid token received, sid: ${socket.id}, host: ${socket.handshake.headers.host}, token: ${token}`);
			return next(new Error());
		}

		socket.machineID = machine[0].mid;
		socket.machineModel = machine[0].model;
		socket.machineDescription = machine[0].description;

		return next();
	};

	return {
		verify: verify
	};
}
