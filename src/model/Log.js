'use strict'

const model = (mongoose) => {

	const LogSchema = new mongoose.Schema({
		machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
		control_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Control', required: true },
		feature_id: { type: Number, required: true },
		feature_title: { type: String, required: true },
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true },
		d: { type: Number, required: true },
		x_dev: { type: Number, required: false },
		y_dev: { type: Number, required: false },
		z_dev: { type: Number, required: false },
		d_dev: { type: Number, required: false },
		x_valid: { type: Number, required: false },
		y_valid: { type: Number, required: false },
		z_valid: { type: Number, required: false },
		d_valid: { type: Number, required: false },
		date: { type: Date, required: true, default: Date.now }
	});

	LogSchema.index({ date: 1 }, { unique: false, name: "date_index" });
	LogSchema.index({ machine_id: 1, date: 1 }, { unique: false, name: "machine_date_index" });

	LogSchema.set('autoIndex', true); // Should change to False on production environment

	const model = mongoose.model("Log", LogSchema);

	return model;
};

module.exports = model;
