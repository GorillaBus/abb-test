'use strict'

const model = (mongoose) => {

	const ControlSchema = new mongoose.Schema({
		machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
		feature_id: { type: Number, required: true },
		feature_title: { type: String, required: true },

		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true },
		d: { type: Number, required: true },

		tx: { type: Number, required: true },
		ty: { type: Number, required: true },
		tz: { type: Number, required: true },
		td: { type: Number, required: true },

		ord: { type: Number, required: true }
	});

	const model = mongoose.model("Control", ControlSchema);

	return model;
};

module.exports = model;
