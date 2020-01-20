'use strict';

var appSettings = null;

try {
    appSettings = require('./config/config.json');
} catch (e) {

    if(e.code === 'MODULE_NOT_FOUND'){
        console.log('ERROR: config file missing src/config/config.json');
    } else {
        console.error(e);
    }

    process.exit();
}

/* Init Logger */
const Logger = require('./class/Logger')(appSettings);
const Db = require('./class/Db')(appSettings, Logger);


const init = async () => {

	Logger.info("Initializing "+ appSettings.app.name);

	/* Connect to DB server */
	await Db.connect().then(async mongoose => {

		const models = require("./model")(mongoose);
		const services = require("./service")(appSettings, Logger, mongoose, models);
		const SocketServer = require('./class/SocketServer')(appSettings, Logger, services);



		// const md5 = require('md5')
		// services.Machine.add({
		// 	mid: '9fdfdbc0-3bbc-11ea-8e66-33e9f80ea27e',
		// 	model: 'xt-80',
		// 	description: 'A machine that produces some sort of part',
		// 	token: md5('9fdfdbc0-3bbc-11ea-8e66-33e9f80ea27e')
		// })
		// .then(m => {
		// 	console.log("Added new machine", m);
		// });


		/* Init Socket Server */
		SocketServer.init();

	})
}



init()
	.catch(err => console.log(err));
