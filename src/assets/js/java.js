const { spawn } = require('child_process');
const { getLogger } = require('./logger');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const configManager = require('./configmanager');
const fileUtils = require('./fileUtils');

const logger = getLogger("Java Utils");

const desiredJavaVersion = '17';

exports.fullJavaCheck = async function () {
    if (!await hasJavaOnCorrectVersion()) {
        logger.error("Java 17 isn't installed on this system. Starting installation...");

        let distribution;
        if (process.platform === "darwin") distribution = await getLatestCorretto();
        else distribution = await getLatestAdoptium();

        try {
            logger.info("Downloading Java 17 archive...");
            await fileUtils.downloadFile(distribution.url, distribution.path);
            logger.info("Verifying installation...");
            await fileUtils.validateInstallation(distribution.path, distribution.algo, distribution.hash);
            logger.info("Extracting archive...");
            await fileUtils.extractFile(distribution.path);
        } catch (err) {
            logger.error("Unable to install Java 17 on the system. Error: " + err);
        }

        logger.info("Successfully installed Java 17.");
    } else {
        logger.info("Java 17 is installed on this system.");
    }
}

function hasJavaOnCorrectVersion() {
    return new Promise((resolve) => {
        const result = spawn('java', ['-version']);

        result.on('error', function (err) {
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

    const url = `https://api.adoptium.net/v3/assets/latest/${desiredJavaVersion}/hotspot?vendor=eclipse&os=${opts.sanitizedOS}&image_type=jdk&architecture=${opts.arch}`;
    try {
        const res = await axios.default.get(url);

        if (res.status === 200 && res.data.length > 0) {
            const binaryPackage = res.data[0].binary.package;
            return {
                url: binaryPackage.link,
                size: binaryPackage.size,
                id: binaryPackage.name,
                hash: binaryPackage.checksum,
                algo: "sha256",
                path: path.join(getLauncherRuntimeDir(), binaryPackage.name)
            }
        } else {
            logger.error(`Failed to find a suitable Adoptium binary for JDK ${desiredJavaVersion} (${opts.sanitizedOS} ${opts.arch}).`);
            return null;
        }
    } catch (err) {
        logger.error("Failed to get latest Adoptium. Error: " + err);
        return null;
    }
}

async function getLatestCorretto() {
    const opts = getPropertiesOfOS();

    const fileName = `amazon-corretto-${desiredJavaVersion}-${opts.arch}-${opts.sanitizedOS}-jdk.${opts.extension}`;
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
            logger.error(`Error while retrieving latest Corretto JDK ${desiredJavaVersion} (${opts.sanitizedOS} ${opts.arch}): ${res.status} ${res.statusText ?? ''}`);
            return null;
        }
    } catch (err) {
        logger.error("Failed to get latest Corretto. Error: " + err);
        return null;
    }
}

function getLauncherRuntimeDir() {
    const runtimeDirPath = configManager.getDirectories().runtime;
    const runtimePath = path.join(runtimeDirPath, process.arch);
    if (!fs.existsSync(runtimePath)) fs.mkdirSync(runtimePath);

    return runtimePath;
}
