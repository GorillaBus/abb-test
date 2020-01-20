'use strict'

const model = (mongoose) => {

	const FeatureSchema = new mongoose.Schema({
		name: { type: String, required: true },
		description: { type: String, required: true },
		controls: [ 'Control' ]
	});

	const model = mongoose.model("Feature", FeatureSchema);

	return model;
};

module.exports = model;
