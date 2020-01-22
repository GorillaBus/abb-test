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
				x: Math.abs(values.x - reference.x),
				y: Math.abs(values.y - reference.y),
				z: Math.abs(values.z - reference.z),
				d: Math.abs(values.d - reference.d)
			};

			// Validation
			const validation = {
				x_valid: deviations.x <= reference.tx,
				y_valid: deviations.y <= reference.ty,
				z_valid: deviations.z <= reference.tz,
				d_valid: deviations.d <= reference.td
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
