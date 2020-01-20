'use strict'

const MachineSvc = (appSettings, Logger, mongoose, models) => {

	const add = (data) => {
		return models.Machine.create(data);
	};

	const findByToken = (token) => {
		return models.Machine.find({
			token: token
		});
	};

	return {
		add,
		findByToken
	}
};

module.exports = MachineSvc;
