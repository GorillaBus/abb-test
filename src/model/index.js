'use strict'

let Models = (mongoose) => {
	const Log = require('./Log')(mongoose);
	const Control = require('./Control')(mongoose);
	const Machine = require('./Machine')(mongoose);

	return {
		Machine,
		Control,
		Log
	};

};

module.exports = Models;
