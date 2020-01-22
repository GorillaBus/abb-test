'use strict'

const ControlSvc = (appSettings, Logger, mongoose, models) => {

	const add = (data) => {
		return models.Control.create(data);
	};

	/*
	**	Computes deviations in part creation by comparing payload
	** 	 values with some part's control profile.
	*/
	const computeDeviations = (payload, controls) => {
		return controls.map(reference => {

			// Get corresponding payload control
			const values = payload.find((paylodItem) => {
			    return paylodItem.control_id == reference._id;
			});

			// Deviations
			const deviations = {
				x_dev: Math.abs(values.x - reference.x),
				y_dev: Math.abs(values.y - reference.y),
				z_dev: Math.abs(values.z - reference.z),
				d_dev: Math.abs(values.d - reference.d)
			};

			// Validation
			const validation = {
				x_valid: deviations.x <= reference.x_tol,
				y_valid: deviations.y <= reference.y_tol,
				z_valid: deviations.z <= reference.z_tol,
				d_valid: deviations.d <= reference.d_tol
			};

			return {
				...deviations,
				...validation
			}
		});
	};

	return {
		computeDeviations
	}
};

module.exports = ControlSvc;
