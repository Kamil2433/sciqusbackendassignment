const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const colors = require('colors');
const util = require('util');

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};

// Define colors for log levels
colors.setTheme({
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  verbose: 'cyan',
  debug: 'green',
});

// Configure Winston logger
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => {
      const servertimestamp = info.timestamp;
      const level = info.level.toUpperCase();
      const message = info.message;
      return `[${servertimestamp}] - [${level}] ${message}`;
    })
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
    // DailyRotateFile transport for log rotation
    new DailyRotateFile({
      filename: 'logs/nodejs-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
    }),
  ],
});

const reactLogger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => {
      const timestamp = info.timestamp;
      const level = info.level.toUpperCase();
      const message = info.message;
      return `[${timestamp}] - [${level}] ${message}`;
    })
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
    // DailyRotateFile transport for log rotation
    new DailyRotateFile({
      filename: 'logs/reactjs-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
    }),
  ],
});

// Handling unhandled rejections and unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}. Reason: ${reason}`);
  // You may also want to exit the process or perform other actions here
});

process.on('uncaughtException', error => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  // You may also want to exit the process or perform other actions here
});

// Utility function to extract user ID and class ID from the request
function extractUserDetails(req) {
  const user = req?.session?.user;
  const userId = user?.id || null;
  const classId = user?.class_id || null;
  const appRole = user?.app_role || null;
  return { userId, classId , appRole};
}

function processLog(loggerMethod, ...args) {
  let message = '';
  let req = null;

  try {
    // Iterate through all arguments
    for (let arg of args) {
      // Check if the argument is an object
      if (typeof arg === 'object') {
        // Check if the object contains .session?.user and .session?.app_role
        if (arg?.session?.user && arg?.session?.user?.app_role) {
          req = arg;
        } else if (arg?.session){
          message += 'sessionID: ' + arg.sessionID + ' ';
          message += util.inspect(arg.session) + ' ';
        }
        else {
          // Print the entire object using util.inspect
          message += util.inspect(arg) + ' ';
        }
      } else if (typeof arg === 'string') {
        // Construct the message from string arguments
        message += arg + ' ';
      }
    }

    const { userId, classId, appRole } = req ? extractUserDetails(req) : { userId: null, classId: null, appRole: null };

    loggerMethod(message.trim(), { userId, classId, appRole });
  } catch (error) {
    // Handle any errors that occur during logging
    console.error('Error occurred during logging:', error.message);
  }
}

function logInfo(...args) {
  processLog(logger.info, ...args);
}

function logWarn(...args) {
  processLog(logger.warn, ...args);
}

function logError(...args) {
  processLog(logger.error, ...args);
}

function reactLogInfo(...args) {
  reactLogger.info(...args);
}

function reactLogError(...args) {
  reactLogger.error(...args);
}

function reactLogWarn(...args) {
  reactLogger.warn(...args);
}

module.exports = { logInfo, logWarn, logError, reactLogInfo, reactLogError, reactLogWarn, logger };