'use strict'

const MachineSvc = (appSettings, Logger, mongoose, models) => {

	const add = (data) => {
		return models.Machine.create(data);
	};


	/*
	**	Finds a machine and updates it's online status. True by default
	*/
	const setOnlineStatus = (machineId, status) => {
		return models.Machine.findOneAndUpdate({ _id: machineId }, { online: status });
	}

	const getOnlineMachines = () => {
		return models.Machine.find({
			online: true
		})
		.select({
			_id: 1,
			description: 1,
			model: 1
		})
		.lean();
	};

	/*
	**	Finds a machine profile by it's user ID
	*/
	const getProfile = async (userId) => {
		const machine = await models.Machine.findOne({
			user_id: userId
		})
		.populate({ path: 'user_id', select: { name: 1 } })
		.lean();

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
			})
			.lean();

		// Warn if no controls where found for this machine
		if (controls.length === 0) {
			Logger.warn(`Connected machine ${machine._id} has no controls`);
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
		getProfile,
		getOnlineMachines,
		setOnlineStatus
	}
};

module.exports = MachineSvc;
