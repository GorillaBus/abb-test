'use strict'

const Registry = (appSettings, Logger, mongoose, models) => {

	const save = (report) => {
		return models.Log.create(report);
	};

	/*
	**	Get aggregated sum of deviations per control per part using mongo's
	**	aggregation framwork.
	**	We can bring all logged control values together knowing they are saved
	**	in batches of continuous logs.
	*/
	const getAggregatedDeviations = (profile, lastN) => {
		lastN = lastN || appSettings.reports.show_last_n_aggregated_devs || 100;
		const totalControls = profile.controls.length;
		return models.Log.aggregate([
			{ $match: { machine_id: profile.id } },
			{ $sort: { date: -1 } },
			{ $limit:  totalControls * lastN },
			{ $group: {
				_id: "$control_id",
	            total_dx: { $sum: "$x_dev" },
	            total_dy: { $sum: "$y_dev" },
	            total_dz: { $sum: "$z_dev" },
	            total_dd: { $sum: "$d_dev" }
			}
		}]);
	};

	return {
		save,
		getAggregatedDeviations
	}
};

module.exports = Registry;
