'use strict'

const errors = require('../config/socket_errors.json');

module.exports = (Logger) => {

	const dispatch = (socket, code) => {
		const { message, disconnect } = errors[code];

		// Emit error to socket client
		socket.error({
			code,
			message
		});

		// Log error
		Logger.error(`ERROR (${code}) ${message} socket: ${socket.id} host: ${socket.handshake.headers.host}`);

		// Disconnect client?
		if (disconnect) {
			socket.disconnect();
		}

	};

	return {
		dispatch
	}
}
