'use strict'

const UserSvc = (appSettings, Logger, mongoose, models) => {

	const findByToken = (token) => {
		return models.User.findOne({
			token: token
		})
		.lean();
	};

	return {
		findByToken
	}
};

module.exports = UserSvc;
