'use strict'

const model = (mongoose) => {

	const MachineSchema = new mongoose.Schema({
		mid: { type: String, required: true, unique: true },
		model: { type: String, required: true },
		description: { type: String, required: false },
		token: { type: String, required: false }
	});

	const model = mongoose.model("Machine", MachineSchema);

	return model;
};

module.exports = model;
