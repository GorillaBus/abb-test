'use strict'

const LogSvc = (appSettings, Logger, mongoose, models) => {

	const save = (report) => {
		return models.Log.create(report);
	};

	/*
	**	Get aggregated maximum of deviations per control per part using mongo's
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
	            x_total_dev: { $max: "$x_dev" },
	            y_total_dev: { $max: "$y_dev" },
	            z_total_dev: { $max: "$z_dev" },
	            d_total_dev: { $max: "$d_dev" }
			}
		}]);
	};

	return {
		save,
		getAggregatedDeviations
	}
};

module.exports = LogSvc;
