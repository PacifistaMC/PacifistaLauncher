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
const dataPath = path.join(sysRoot, ".pacifista");
const launcherDir = app.getPath("userData");
const configPath = path.join(launcherDir, "config.json");
const firstLaunch = !fs.existsSync(configPath);

fs.ensureDirSync(dataPath);

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
            hideLauncherOnGameStart: true,
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
        allocatedRAM: getAbsoluteMinRAM(),
        executable: "",
        jvmOptions: [],
    },
    server: {
        host: "play.pacifista.fr",
        version: "1.20.1",
        type: "release",
    }
}

function getAbsoluteMinRAM() {
    const mem = os.totalmem();
    if (mem >= 8 * 1073741824) return 4;
    else if (mem >= 6 * 1073741824) return 3;
    else return 2;
}

function getAbsoluteMaxRAM() {
    const fullRam = os.totalmem() / 1073741824;
    return Math.round(Math.round((fullRam + Number.EPSILON) * 100) / 100);
}

exports.save = function () {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: "utf-8" });
}

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
            logger.error("Error while loading config file:" + err);
            logger.info("Configuration file contains malformed JSON or is corrupt.");
            logger.info("Generating a new configuration file.");
            fs.ensureDirSync(path.join(configPath, ".."));
            config = DEFAULT_CONFIG;
            exports.save();
        }
        if (doValidate) {
            config = exports.validateKeySet(DEFAULT_CONFIG, config);
            exports.save();
        }
    }
    logger.info("Successfully Loaded");
}

exports.isFirstLaunch = function () {
    return firstLaunch;
}

exports.getConfig = function () {
    return config;
}

exports.setConfig = function (newConfig) {
    config = newConfig;
    exports.save();
}

/**
 * Validate that the destination object has at least every field present in the source object.
 * Assign a default value otherwise.
 *
 * @param {Object} srcObj - The source object to reference against.
 * @param {Object} destObj - The destination object.
 * @returns {Object} - A validated destination object.
 */
exports.validateKeySet = function (srcObj, destObj) {
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
            destObj[key] = exports.validateKeySet(srcObj[key], destObj[key]);
        }
    }
    return destObj;
}

exports.getDirectories = function () {
    const instanceDir = fs.ensureDirSync(path.join(dataPath, "instances", config.server.version));
    return {
        data: dataPath,
        instance: instanceDir,
        runtime: fs.ensureDirSync(path.join(dataPath, "runtime")),
        mods: fs.ensureDirSync(path.join(instanceDir, "mods")),
        launcher: launcherDir
    }
}
