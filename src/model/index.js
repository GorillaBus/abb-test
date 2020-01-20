'use strict'

let Models = (mongoose) => {
  const Machine = require('./Machine')(mongoose);
  const Control = require('./Control')(mongoose);
  const Feature = require('./Feature')(mongoose);

  return {
    Control,
	Machine
  };

};

module.exports = Models;
