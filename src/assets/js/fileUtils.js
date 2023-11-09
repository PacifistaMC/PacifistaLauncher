const { getLogger } = require('./logger');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const fs_extra = require('fs-extra');
const crypto = require('crypto');
const StreamZip = require('node-stream-zip');
const tar = require('tar-fs');
const zlib = require('zlib');

const logger = getLogger("Files Utils");

exports.downloadFile = function (url, downloadPath) {
    return new Promise(async (resolve, reject) => {
        axios.default({
            url,
            method: 'GET',
            responseType: 'stream'
        }).then((res) => {
            const fileStream = fs.createWriteStream(downloadPath);
            res.data.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                logger.info("Successfully downloaded file");
                resolve();
            });

            fileStream.on('error', (err) => {
                logger.error("An error has occurred while downloading the file: " + err);
                reject(err);
            });
        }).catch((err) => {
            logger.error("Error downloading the file: " + err);
            reject(err);
        });
    });
}

exports.validateInstallation = async function (filePath, algo, hash) {
    if ((await fs_extra.pathExists(filePath)) && !hash) return true;

    try {
        const calculatedHash = await calculateHash(filePath, algo);
        return calculatedHash === hash;
    } catch (err) {
        logger.error("Failed to calculate hash. Error: " + err);
    }
    return false;
}

function calculateHash(filePath, algo) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algo);
        const input = fs.createReadStream(filePath);

        input.on('error', reject);
        input.on('data', chunk => hash.update(chunk));
        input.on('close', () => resolve(hash.digest('hex')));
    });
}

exports.extractFile = async function (archivePath) {
    if (archivePath.endsWith('zip')) {
        await extractZip(archivePath);
    } else {
        await extractTarGz(archivePath);
    }
}

async function extractZip(zipPath) {
    const zip = new StreamZip.async({
        file: zipPath,
        storeEntries: true
    });

    try {
        logger.info(`Extracting ${zipPath} ...`);
        await zip.extract(null, path.dirname(zipPath));
        logger.info(`Removing ${zipPath} ...`);
        await fs_extra.remove(zipPath);
        logger.info(`Successfully unzipped ${zipPath}`);
    } catch (err) {
        logger.info("Zip extraction failed. Error: " + err);
    } finally {
        await zip.close();
    }
}

async function extractTarGz(tarGzPath) {
    return new Promise((resolve, reject) => {
        fs_extra.createReadStream(tarGzPath)
            .on('error', err => logger.error(err))
            .pipe(zlib.createGunzip())
            .on('error', err => logger.error(err))
            .pipe(tar.extract(path.dirname(tarGzPath), {
                map: (header) => {
                    return header;
                }
            }))
            .on('error', err => {
                logger.error(err);
                reject(err);
            })
            .on('finish', () => {
                fs_extra.unlink(tarGzPath, err => {
                    if (err) {
                        logger.error(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
    })
}