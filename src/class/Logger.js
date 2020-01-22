const log4js = require('log4js');

const Logger = (appSettings) => {

  /* Logging setup */
  log4js.configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: appSettings.logging.file, maxLogSize: appSettings.logging.max_size, compress: appSettings.logging.compress, keepFileExt: true }
    },
    categories: {
      default: { appenders: [ 'out' ], level: 'debug' },
      app: { appenders: [ 'app' ], level: 'debug' },
      out: { appenders: [ 'out', 'app' ], level: 'debug' }
    }
  });

  const channel = appSettings.logging.stdout === true ? 'out':'app';
  const logger = log4js.getLogger(channel);
  const trace = (message) => { logger.trace(message); };
  const debug = (message) => { logger.debug(message); };
  const info = (message) => { logger.info(message); };
  const warn = (message) => { logger.warn(message); };
  const error = (message) => { logger.error(message); };
  const fatal = (message) => { logger.fatal(message); };

  const close = () => {
    log4js.shutdown();
  };

  return {
    trace: trace,
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    fatal: fatal,
    close: close
  }
};

module.exports = Logger;
