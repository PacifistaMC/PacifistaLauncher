const { app } = require('electron');
const { createLogger, format, transports } = require("winston");
const { DateTime } = require("luxon");
const { join } = require('path');
const { ensureDirSync } = require('fs-extra');

let loaded = false;
let logFilePath;

exports.getLogger = function (label) {
  if (!loaded) exports.load();
  return createLogger({
    format: format.combine(
      format.label(),
      format.label({ label: label }),
      format.printf((info) => {
        return `[${DateTime.local().toFormat("yyyy-MM-dd TT").trim()}] [${info.level
          }] [${info.label}]: ${info.message}${info.stack ? "\n" + info.stack : ""
          }`;
      })
    ),
    transports: [
      new transports.Console({ level: 'debug' }),
      new transports.File({ level: 'debug', filename: logFilePath })
    ],
  });
};

exports.load = function () {
  const launcherDir = app.getPath("userData");
  const logsDir = join(launcherDir, 'logs');
  ensureDirSync(logsDir);
  const formattedTime = DateTime.local().toFormat("yyyy-MM-dd'_'HH-mm-ss").trim().replace(' ', '');
  const logFileName = `${formattedTime}_launcher.log`;
  logFilePath = join(logsDir, logFileName);

  loaded = true;
}
