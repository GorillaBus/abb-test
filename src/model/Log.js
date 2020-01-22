'use strict'

const model = (mongoose) => {

	const LogSchema = new mongoose.Schema({
		machine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
		control_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Control', required: true },

		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true },
		d: { type: Number, required: true },

		dx: { type: Number, required: false },
		dy: { type: Number, required: false },
		dz: { type: Number, required: false },
		dd: { type: Number, required: false },

		date: { type: Date, required: true, default: Date.now }
	});

	const model = mongoose.model("Log", LogSchema);

	return model;
};

module.exports = model;
