const path = require('path');
const fs = require('fs');
const configManager = require('./configmanager');
const fileUtils = require('./fileUtils');
const { getLogger } = require('./logger');
const { Client } = require('minecraft-launcher-core');
const rpc = require('./discordRPC');
const { ipcMain } = require('electron');
const { OPCODES } = require('./constants');

const logger = getLogger("Minecraft");
const launcher = new Client();

launcher.on('data', (info) => {
    const config = configManager.getConfig();
    const selectedAccount = config.authenticationDatabase[config.selectedAccount];

    if (info.includes(selectedAccount.name)) {
        ipcMain.emit(OPCODES.MC_STARTED);
        logger.info("Minecraft s'est lancé.");
    }
});

launcher.on('close', () => {
    ipcMain.emit(OPCODES.MC_STOPPED);
    logger.info("Minecraft s'est arrêté.");
    rpc.setActivity({
        details: "Dans le lanceur",
        startTimestamp: new Date(),
    });
});


let lastProgress;
launcher.on('progress', (data) => {
    const progress = Math.floor((data.task / data.total) * 100);
    if (lastProgress && lastProgress == progress) return;

    ipcMain.emit(OPCODES.PROGRESS, {
        type: data.type,
        progress: progress
    });

    lastProgress = progress;
});

exports.launchGame = async function () {
    const config = configManager.getConfig();
    await installMinecraft(config);
    await installMods();

    const opts = {
        authorization: config.authenticationDatabase[config.selectedAccount],
        root: configManager.getDirectories().instance,
        version: {
            number: config.server.version,
            type: config.server.type,
            custom: `${config.server.version}-fabric`,
        },
        memory: {
            max: `${config.javaConfig.allocatedRAM}G`,
            min: `${config.javaConfig.minRAM}G`,
        },
        features: [
            "has_custom_resolution",
        ],
        window: {
            width: config.settings.game.resWidth,
            height: config.settings.game.resHeight,
            fullscreen: config.settings.game.fullscreen,
        },
        overrides: {
            detached: config.settings.game.launchDetached,
        }
    }

    const javaExec = config.javaConfig.executable;
    if (javaExec) opts.javaPath = javaExec;

    launcher.launch(opts);

    rpc.setActivity({
        details: "En jeu",
        startTimestamp: new Date(),
    });
}

async function installMinecraft(config) {
    const jsonUrl = `https://meta.fabricmc.net/v2/versions/loader/${config.server.version}/0.14.24/profile/json`;
    const instanceDirectory = configManager.getDirectories().instance;
    const versionDirectory = path.join(instanceDirectory, "versions", `${config.server.version}-fabric`);
    if (!fs.existsSync(versionDirectory)) fs.mkdirSync(versionDirectory, { recursive: true });
    const filePath = path.join(versionDirectory, `${config.server.version}-fabric.json`);

    await fileUtils.downloadFile(jsonUrl, filePath);
    await fileUtils.validateInstallation(filePath);
}

async function installMods() {
    const modsPath = configManager.getDirectories().mods;
    const mods = {
        // TODO: Replace this example mod with one retreived from an API endpoint.
        "voicechat-fabric-1.20.1-2.4.28.jar": "https://cdn.modrinth.com/data/9eGKb6K1/versions/p8zEH7oT/voicechat-fabric-1.20.1-2.4.28.jar"
    };

    for (let mod in mods) {
        const modPath = path.join(modsPath, mod);
        await fileUtils.downloadFile(mods[mod], modPath);
        await fileUtils.validateInstallation(modPath);
    }
}