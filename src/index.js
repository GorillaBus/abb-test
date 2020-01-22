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

const enums = require('./config/enums.json');
const Logger = require('./modules/Logger')(appSettings);
const Db = require('./modules/Db')(appSettings, Logger);

/* Server init */
const init = async () => {

	Logger.info("Initializing "+ appSettings.app.name);

	/* Connect to DB server */
	const mongoose = await Db.connect()

	/* Load dependencies */
	const models = require("./model")(mongoose);
	const services = require("./service")(appSettings, Logger, mongoose, models);
	const SocketServer = require('./modules/SocketServer')(appSettings, enums, Logger, services);

	/* Init Socket Server */
	SocketServer.init();
};

init()
	.catch(err => console.log("error", err));
