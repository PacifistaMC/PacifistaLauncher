const { createLogger, format, transports } = require("winston");
const { DateTime } = require("luxon");

exports.getLogger = function (label) {
  return createLogger({
    format: format.combine(
      format.label(),
      format.colorize(),
      format.label({ label: label }),
      format.printf((info) => {
        return `[${DateTime.local().toFormat("yyyy-MM-dd TT").trim()}] [${
          info.level
        }] [${info.label}]: ${info.message}${
          info.stack ? "\n" + info.stack : ""
        }`;
      })
    ),
    transports: [new transports.Console({ level: 'debug' })],
  });
};
