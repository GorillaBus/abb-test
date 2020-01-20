//const Queue = require("queue");
'use strict'

const Registry = (appSettings, Logger, mongoose, models) => {

	const test = () => {

		return registerControl({
			dev_x: 0.02,
			dev_y: 0.03,
			dev_z: 0.01,
			dev_out_x: 0.04,
			dev_out_y: 0.06,
			dev_out_z: 0.05,
			diameter: 1.452
		});
	};

	const registerControl = (controlData) => {
		return models.Control.create(controlData);
	};

	return {
		test: test
	}
};

module.exports = Registry;
