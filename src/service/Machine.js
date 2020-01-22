'use strict'

const MachineSvc = (appSettings, Logger, mongoose, models) => {

	const add = (data) => {
		return models.Machine.create(data);
	};

	const findByToken = (token) => {
		return models.Machine.findOne({
			token: token
		}).select({
			token: 0,
			__v: 0
		});
	};


	/*
	**	Validates a token and returns a machine profile or false
	*/
	const getProfileByToken = async (token) => {
		const machine = await findByToken(token);
		if (!machine) {
			return false;
		}
		const controls = await models.Control.find({
				machine_id: machine._id
			}).sort({
				feature_id: 1,
				ord: 1
			}).select({
				machine_id: 0,
				__v: 0
			});

		// Warn if no controls where found for this machine
		if (controls.length === 0) {
			Logger.warn(`Connected machine ${machine._id} has no controls`)
		}

		const profile = {
			id: machine._id,
			name: machine.name,
			description: machine.description,
			controls: controls
		};

		return profile;
	};


	return {
		add,
		findByToken,
		getProfile: getProfileByToken
	}
};

module.exports = MachineSvc;
