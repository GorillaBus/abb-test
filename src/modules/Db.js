let Db = (appSettings, Logger) => {
	const mongoose = require('mongoose');
	let connected = false;
	let conn = null;

	const buildConnString = () => {
		if (appSettings.mongodb.user && appSettings.mongodb.password) {
			connString = "mongodb://"+ appSettings.mongodb.user +":"+ appSettings.mongodb.password +"@" + appSettings.mongodb.host +":"+ appSettings.mongodb.port + "/" + appSettings.mongodb.db + "?authSource=admin";
		} else {
			connString = "mongodb://"+ appSettings.mongodb.host +":"+ appSettings.mongodb.port + "/" + appSettings.mongodb.db;
		}
		return connString;
	}

	const connect = () => {
		const connString = buildConnString()
		return new Promise((resolve, reject) => {
			mongoose.connect(connString, appSettings.mongodb.connSettings, (err) => {
				if (err) { return reject(err.message); }
			});

			conn = mongoose.connection;

			conn.on('error', (err) => {
				Logger.error(err);
				connected = false;
				reject(err);
			});

			conn.on('connected', () => {
				Logger.info('MongoDB connected to: '+ appSettings.mongodb.host +":"+ appSettings.mongodb.port);
				connected = true;
				resolve(mongoose);
			});

			conn.on('disconnected', () => {
				Logger.info('MongoDB disconnected');
				conn.removeAllListeners();
				connected = false;
			});
		});
	};

	let close = () => {
		if (connected) {
			conn.close();
		}
		return;
	};

	return {
		connect: connect,
		close: close
	}
};

module.exports = Db;
