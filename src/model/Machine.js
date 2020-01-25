'use strict'

const model = (mongoose) => {

	const MachineSchema = new mongoose.Schema({
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		model: { type: String, required: false },
		description: { type: String, required: false },
		online: { type: Boolean, default: false }
	});

	const model = mongoose.model("Machine", MachineSchema);

	return model;
};

module.exports = model;
