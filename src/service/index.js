'use strict'

const Services = (appSettings, Logger, mongoose, models) => {

  const Log = require("./Log")(appSettings, Logger, mongoose, models);
  const Machine = require("./Machine")(appSettings, Logger, mongoose, models);
  const Control = require("./Control")(appSettings, Logger, mongoose, models);
  const User = require("./User")(appSettings, Logger, mongoose, models);

  return {
	User,
    Log,
	Machine,
	Control
  };
};

module.exports = Services;
