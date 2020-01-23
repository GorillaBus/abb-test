'use strict'

const Services = (appSettings, Logger, mongoose, models) => {

  const Registry = require("./Registry")(appSettings, Logger, mongoose, models);
  const Machine = require("./Machine")(appSettings, Logger, mongoose, models);
  const Control = require("./Control")(appSettings, Logger, mongoose, models);
  const User = require("./User")(appSettings, Logger, mongoose, models);

  return {
	User,
    Registry,
	Machine,
	Control
  };
};

module.exports = Services;
