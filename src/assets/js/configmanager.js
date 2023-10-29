const { app } = require("electron");
const { getLogger } = require("./logger");
const os = require("os");
const path = require("path");
const fs = require("fs-extra");

const logger = getLogger("Config Manager");
const sysRoot =
  process.env.APPDATA ??
  (process.platform == "darwin"
    ? process.env.HOME + "/Library/Application Support"
    : process.env.HOME);
const dataPath = path.join(sysRoot, ".pacifistalauncher");
const launcherDir = app.getPath("userData");
const configPath = path.join(launcherDir, "config.json");
const firstLaunch = !fs.existsSync(configPath);

if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

let config;

const DEFAULT_CONFIG = {
  settings: {
    game: {
      resWidth: 1280,
      resHeight: 720,
      fullscreen: false,
      autoConnect: true,
      launchDetached: true,
    },
    launcher: {
      allowPrerelease: false,
      dataDirectory: dataPath,
    },
  },
  clientToken: null,
  selectedAccount: null,
  authenticationDatabase: {},
  modConfiguration: {},
  javaConfig: {
    minRAM: getAbsoluteMinRAM(),
    maxRAM: getAbsoluteMaxRAM(),
    executable: "",
    jvmOptions: [],
  },
};

/**
 * Get the absolute minimum RAM required for JVM initialization.
 *
 * @returns {number} The absolute minimum RAM in GB.
 */
function getAbsoluteMinRAM() {
  const mem = os.totalmem();
  if (mem >= 8 * 1073741824) return 4;
  else if (mem >= 6 * 1073741824) return 3;
  else return 2;
};

/**
 * Get the absolute maximum RAM available for JVM initialization.
 *
 * @returns {number} The absolute maximum RAM in GB.
 */
function getAbsoluteMaxRAM() {
  return os.totalmem() / 1073741824;
};

/**
 * Save the configuration to a file.
 */
exports.save = function () {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 4), { encoding: "utf-8" });
}

/**
 * Load the configuration from a file.
 */
exports.load = function () {
  let doLoad = true;

  if (firstLaunch) {
    fs.ensureDirSync(path.join(configPath, ".."));
    doLoad = false;
    config = DEFAULT_CONFIG;
    exports.save();
  }
  if (doLoad) {
    let doValidate = false;
    try {
      config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));
      doValidate = true;
    } catch (err) {
      logger.error(err);
      logger.info("Configuration file contains malformed JSON or is corrupt.");
      logger.info("Generating a new configuration file.");
      fs.ensureDirSync(path.join(configPath, ".."));
      config = DEFAULT_CONFIG;
      exports.save();
    }
    if (doValidate) {
      config = validateKeySet(DEFAULT_CONFIG, config);
      exports.save();
    }
  }
  logger.info("Successfully Loaded");
};

/**
 * Check if this is the first launch of the application.
 *
 * @returns {boolean} `true` if it's the first launch, `false` otherwise.
 */
exports.isFirstLaunch = function () {
  return firstLaunch;
};

/**
 * Get the current configuration.
 *
 * @returns {Object} The current configuration.
 */
exports.getConfig = function () {
  return config;
};

/**
 * Update the configuration.
 * @param {Object} newConfig The new configuration.
 */
exports.setConfig = function (newConfig) {
  config = newConfig;
}

/**
 * Validate that the destination object has at least every field present in the source object.
 * Assign a default value otherwise.
 *
 * @param {Object} srcObj - The source object to reference against.
 * @param {Object} destObj - The destination object.
 * @returns {Object} - A validated destination object.
 */
function validateKeySet(srcObj, destObj) {
  if (srcObj == null) {
    srcObj = {};
  }
  const validationBlacklist = ["authenticationDatabase", "javaConfig"];
  for (const key of Object.keys(srcObj)) {
    if (typeof destObj[key] === "undefined") {
      destObj[key] = srcObj[key];
    } else if (
      typeof srcObj[key] === "object" &&
      srcObj[key] != null &&
      !(srcObj[key] instanceof Array) &&
      validationBlacklist.indexOf(key) === -1
    ) {
      destObj[key] = validateKeySet(srcObj[key], destObj[key]);
    }
  }
  return destObj;
}

/**
 * Get the data directory.
 *
 * @returns {string} The data directory path.
 */
exports.getDataDirectory = function () {
  return dataPath;
};

/**
 * Get the instance directory.
 *
 * @returns {string} The instance directory path.
 */
exports.getInstanceDirectory = function () {
  return path.join(exports.getDataDirectory(), "instances");
};