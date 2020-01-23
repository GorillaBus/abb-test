'use strict'

let Models = (mongoose, enums) => {
	const Log = require('./Log')(mongoose);
	const Control = require('./Control')(mongoose);
	const Machine = require('./Machine')(mongoose);
	const User = require('./User')(mongoose, enums);

	return {
		User,
		Machine,
		Control,
		Log
	};

};

module.exports = Models;
