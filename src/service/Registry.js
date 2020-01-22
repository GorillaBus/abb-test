'use strict'

const Registry = (appSettings, Logger, mongoose, models) => {

	const save = (report) => {
		return models.Log.create(report);
	};

	return {
		save
	}
};

module.exports = Registry;
