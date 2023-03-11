const { createLogger, transports, format } = require("winston");
const { existsSync, mkdirSync } = require("fs");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");
const { environment, logDirectory } = require("../config.js");

let dir = logDirectory;
if (!dir) dir = path.resolve("logs");

// create directory if it is not present
if (!existsSync(dir)) {
  // Create the directory if it does not exist
  mkdirSync(dir);
}

// const logLevel = environment === 'development' ? 'debug' : 'warn';
const logLevel = "debug";
const options = {
  errFile: {
    level: "error",
    filename: dir + "/%DATE%.error.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    prettyPrint: true,
    json: true,
    maxSize: "20m",
    colorize: true,
    maxFiles: "14d",
  },
  normalFile: {
    level: logLevel,
    filename: dir + "/%DATE%.info.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    prettyPrint: true,
    json: true,
    maxSize: "20m",
    colorize: true,
    maxFiles: "14d",
  },
};

module.exports = createLogger({
  transports: [
    new transports.Console({
      level: logLevel,
      format: format.combine(
        format.errors({ stack: true }),
        // format.colorize(),
        format.prettyPrint()
        // format.printf((info) => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`),
      ),
    }),
    new DailyRotateFile(options.normalFile),
  ],
  exceptionHandlers: [new DailyRotateFile(options.errFile)],
  exitOnError: false, // do not exit on handled exceptions
});
