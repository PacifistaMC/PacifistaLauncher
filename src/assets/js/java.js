const { spawn } = require('child_process');
const { getLogger } = require('./logger');
const fs = require('fs');
const fs_extra = require('fs-extra');
const axios = require('axios');
const path = require('path');
const configManager = require('./configmanager');
const fileUtils = require('./fileUtils');
const { ERRORS } = require('./constants');
const { ipcMain } = require('electron');

const logger = getLogger("Java Utils");

//TODO: Endpoint API to get real version
const desiredJavaVersion = '17';

exports.fullJavaCheck = async function () {
    if (!await hasJavaOnCorrectVersion()) {
        logger.error(ERRORS.JAVA_NOT_INSTALLED);
        ipcMain.emit(ERRORS.JAVA_NOT_INSTALLED);

        // Utilisation de Adoptium prioritairement: plus de choix pour les JRE. Si jamais future utilisation de Corretto, modifier le code pour récupérer et sauvegarder l'exécutable.
        // let distribution;
        // if (process.platform === "darwin") distribution = await getLatestCorretto();
        // else distribution = await getLatestAdoptium();
        const distribution = await getLatestAdoptium();

        try {
            logger.info("Installation de l'archive Java...");
            await fileUtils.downloadFile(distribution.url, distribution.path);
            logger.info("Vérification de l'installation...");
            await fileUtils.validateInstallation(distribution.path, distribution.algo, distribution.hash);
            logger.info("Extraction de l'archive...");
            await fileUtils.extractFile(distribution.path);

            const javaPath = path.join(distribution.finalPath, "bin", "java.exe");
            const config = configManager.getConfig();
            config.javaConfig.executable = javaPath;
            config.javaConfig.version = desiredJavaVersion;
            configManager.setConfig(config);
        } catch (err) {
            logger.error(ERRORS.JAVA_UNABLE_TO_INSTALL + err);
            ipcMain.emit(ERRORS.JAVA_UNABLE_TO_INSTALL + err);
        }

        logger.info("Java a bien été installé.");
    } else {
        logger.info("Java est déjà installé.");
    }
}

/**
 * Vérifie si Java est installé sur la machine de l'utilisateur avec la bonne version.
 * Le Regex récupère la version de Java dans la réponse de la commande "java -version".
 * @returns {boolean} - Java est déjà installé avec la bonne version.
 */
function hasJavaOnCorrectVersion() {
    const { javaConfig } = configManager.getConfig();
    if (javaConfig.version == desiredJavaVersion && fs.existsSync(javaConfig.executable)) return true;

    return new Promise((resolve) => {
        const result = spawn('java', ['-version']);

        result.on('error', function () {
            resolve(false);
        });

        result.stderr.on('data', function (data) {
            const result = data.toString();
            const javaVersion = /version/.test(result) ? result.split(' ')[2].replace(/"/g, '') : false;

            if (javaVersion !== false) {
                const version = javaVersion.split('.')[0];
                resolve(version === desiredJavaVersion);
            } else {
                resolve(false);
            }
        });
    });
}

function getPropertiesOfOS() {
    const arch = process.arch === "arm64" ? 'aarch64' : "x64";
    let sanitizedOS;
    let ext;
    switch (process.platform) {
        case "win32":
            sanitizedOS = "windows";
            ext = "zip";
            break;
        case "darwin":
            sanitizedOS = "macos";
            ext = "tar.gz";
            break;
        case "linux":
            sanitizedOS = "linux";
            ext = "tar.gz";
            break;
        default:
            sanitizedOS = process.platform;
            ext = "tar.gz";
            break;
    }

    return {
        sanitizedOS,
        extension: ext,
        arch
    }
}

async function getLatestAdoptium() {
    const opts = getPropertiesOfOS();

    const url = `https://api.adoptium.net/v3/assets/latest/${desiredJavaVersion}/hotspot?vendor=eclipse&os=${opts.sanitizedOS}&image_type=jre&architecture=${opts.arch}`;
    try {
        const res = await axios.default.get(url);

        if (res.status === 200 && res.data.length > 0) {
            const data = res.data[0];
            const binary = data.binary;
            const binaryPackage = binary.package;
            return {
                url: binaryPackage.link,
                size: binaryPackage.size,
                id: binaryPackage.name,
                hash: binaryPackage.checksum,
                algo: "sha256",
                path: path.join(getLauncherRuntimeDir(), binaryPackage.name),
                finalPath: path.join(getLauncherRuntimeDir(), `${data.release_name}-${binary.image_type}`)
            }
        } else if (res.data.length <= 0) {
            logger.error(`Impossible de récupérer un JRE Adoptium. Recherche: ${desiredJavaVersion} (${opts.sanitizedOS} ${opts.arch}).`);
            ipcMain.emit(ERRORS.JAVA_NO_SUITABLE_BINARY);
            return null;
        } else {
            logger.error(`Une erreur est survenue lors de la réception du JRE Adoptium: ${desiredJavaVersion} (${opts.sanitizedOS} ${opts.arch}): ${res.status} ${res.statusText ?? ''}`);
            ipcMain.emit(ERRORS.JAVA_UNABLE_TO_GET_VERSION);
        }
    } catch (err) {
        logger.error("Impossible d'installer un JRE Adoptium. Erreur: " + err);
        ipcMain.emit(ERRORS.JAVA_FAILED_TO_INSTALL + err);
        return null;
    }
}

async function getLatestCorretto() {
    const opts = getPropertiesOfOS();

    const fileName = `amazon-corretto-${desiredJavaVersion}-${opts.arch}-${opts.sanitizedOS}-jre.${opts.extension}`;
    const url = `https://corretto.aws/downloads/latest/${fileName}`;
    const md5url = `https://corretto.aws/downloads/latest_checksum/${fileName}`;

    try {
        const res = await axios.default.head(url);
        const checksum = await axios.default.get(md5url);

        if (res.status === 200) {
            return {
                url: url,
                size: parseInt(res.headers['content-length']),
                id: fileName,
                hash: checksum.body,
                algo: "md5",
                path: path.join(getLauncherRuntimeDir(), fileName)
            }
        } else {
            logger.error(`Une erreur est survenue lors de la réception du JRE Corretto: ${desiredJavaVersion} (${opts.sanitizedOS} ${opts.arch}): ${res.status} ${res.statusText ?? ''}`);
            ipcMain.emit(ERRORS.JAVA_UNABLE_TO_GET_VERSION);
            return null;
        }
    } catch (err) {
        logger.error("Impossible d'installer un JRE Corretto. Erreur: " + err);
        ipcMain.emit(ERRORS.JAVA_FAILED_TO_INSTALL + err);
        return null;
    }
}

function getLauncherRuntimeDir() {
    const runtimeDirPath = configManager.getDirectories().runtime;
    const runtimePath = path.join(runtimeDirPath, process.arch);
    fs_extra.ensureDirSync(runtimePath)

    return runtimePath;
}
