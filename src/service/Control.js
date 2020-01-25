'use strict'

const ControlSvc = (appSettings, Logger, mongoose, models) => {

	const add = (data) => {
		return models.Control.create(data);
	};

	/*
	**	Computes deviations in part features by comparing payload
	**	values with a part's control profile. This last is passed by reference
	**	as it is persisted in memory to minimize db queries of data that is note
	**	supossed to change frequently (or ever).
	*/
	const validateControlData = (payload, profile) => {
		return profile.controls.map(reference => {

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
			const validations = {
				x_valid: deviations.x_dev < 0.1 ? 0 : deviations.x_dev <= reference.x_tol ? 1 : 2,
				y_valid: deviations.y_dev < 0.1 ? 0 : deviations.y_dev <= reference.y_tol ? 1 : 2,
				z_valid: deviations.z_dev < 0.1 ? 0 : deviations.z_dev <= reference.z_tol ? 1 : 2,
				d_valid: deviations.d_dev < 0.1 ? 0 : deviations.d_dev <= reference.d_tol ? 1 : 2
			};

			return {
				machine_id: profile.id,
				feature_id: values.feature_id,
				control_id: values.control_id,
				feature_title: reference.feature_title,
				x: values.x,
				y: values.y,
				z: values.z,
				d: values.d,
				...deviations,
				...validations
			}
		});
	};

	return {
		validateControlData
	}
};

module.exports = ControlSvc;
