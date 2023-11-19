const path = require('path');
const fs = require('fs');
const configManager = require('./configmanager');
const fileUtils = require('./fileUtils');
const { getLogger } = require('./logger');
const { Client } = require('minecraft-launcher-core');
const rpc = require('./discordRPC');

const logger = getLogger("Minecraft");
const launcher = new Client();
launcher.on('debug', (info) => logger.debug(info));
launcher.on('data', (info) => logger.info(info));
launcher.on('close', () => rpc.setActivity({
    details: "Dans le lanceur",
    startTimestamp: new Date(),
}));

exports.launchGame = async function () {
    const config = configManager.getConfig();
    await installMinecraft(config);
    await installMods();

    launcher.launch({
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
        },
        quickPlay: {
            type: "legacy",
            identifier: config.server.host
        },
    });

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
        "voicechat-fabric-1.20.1-2.4.28.jar": "https://cdn.modrinth.com/data/9eGKb6K1/versions/p8zEH7oT/voicechat-fabric-1.20.1-2.4.28.jar"
    };

    for (let mod in mods) {
        const modPath = path.join(modsPath, mod);
        await fileUtils.downloadFile(mods[mod], modPath);
        await fileUtils.validateInstallation(modPath);
    }
}