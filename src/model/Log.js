'use strict'

const model = (mongoose) => {

	const LogSchema = new mongoose.Schema({
		machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
		control_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Control', required: true },
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true },
		d: { type: Number, required: true },
		x_dev: { type: Number, required: false },
		y_dev: { type: Number, required: false },
		z_dev: { type: Number, required: false },
		d_dev: { type: Number, required: false },
		x_valid: { type: Boolean, required: false },
		y_valid: { type: Boolean, required: false },
		z_valid: { type: Boolean, required: false },
		d_valid: { type: Boolean, required: false },
		date: { type: Date, required: true, default: Date.now }
	});

	const model = mongoose.model("Log", LogSchema);

	return model;
};

module.exports = model;
