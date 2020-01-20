'use strict'

const model = (mongoose) => {

	const PartSchema = new mongoose.Schema({
		name: { type: String, required: true },
		features: [ 'Feature' ]
	});

	const model = mongoose.model("Part", PartSchema);

	return model;
};

module.exports = model;
