'use strict'

const Services = (appSettings, Logger, mongoose, models) => {

  const Registry = require("./Registry")(appSettings, Logger, mongoose, models);
  const Machine = require("./Machine")(appSettings, Logger, mongoose, models);

  return {
    Registry,
	Machine
  };
};

module.exports = Services;
