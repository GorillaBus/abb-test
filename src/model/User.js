'use strict'

const model = (mongoose, enums) => {

	const UserSchema = new mongoose.Schema({
		name: { type: String, required: true, unique: true },
		agent: { type: Number, required: true, default: enums.Agents.User },
		token: { type: String, required: false }
	});

	const model = mongoose.model("User", UserSchema);

	return model;
};

module.exports = model;
