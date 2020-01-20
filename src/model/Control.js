'use strict'

const model = (mongoose) => {

	const ControlSchema = new mongoose.Schema({
		dev_x: { type: Number, required: true },
		dev_y: { type: Number, required: true },
		dev_z: { type: Number, required: true },
		dev_out_x: { type: Number, required: true },
		dev_out_y: { type: Number, required: true },
		dev_out_z: { type: Number, required: true },
		diameter: { type: Number, required: true }
	});

	const model = mongoose.model("Control", ControlSchema);

	return model;
};

module.exports = model;
