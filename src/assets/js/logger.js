const { app } = require('electron');
const { createLogger, format, transports } = require("winston");
const { DateTime } = require("luxon");
const { join } = require('path');
const fs = require('fs');
const { ensureDirSync } = require('fs-extra');
const { LOGS } = require('./constants');

let loaded = false;
let logFilePath;

const launcherDir = app.getPath("userData");
const logsDir = join(launcherDir, 'logs');

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
      new transports.File({ filename: logFilePath })
    ],
  });
};

exports.load = function () {
  ensureDirSync(logsDir);
  checkLogFiles();
  const formattedTime = DateTime.local().toFormat("yyyy-MM-dd'_'HH-mm-ss").trim().replace(' ', '');
  const logFileName = `${formattedTime}_launcher.log`;
  logFilePath = join(logsDir, logFileName);

  loaded = true;
}

function checkLogFiles() {
  const files = fs.readdirSync(logsDir).map((file) => ({
    name: file,
    time: fs.statSync(join(logsDir, file)).mtime.getTime()
  }))
  .sort((a, b) => b.time - a.time)
  .map((file) => file.name);

  if (files.length == LOGS.MAX_FILES) {
    fs.rmSync(join(logsDir, files[LOGS.MAX_FILES - 1]));
  }
}
