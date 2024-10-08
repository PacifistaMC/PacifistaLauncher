const { getLogger } = require('./logger');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const fs_extra = require('fs-extra');
const crypto = require('crypto');
const StreamZip = require('node-stream-zip');
const tar = require('tar-fs');
const zlib = require('zlib');
const { ipcMain } = require('electron');
const { ERRORS, OPCODES } = require('./constants');

const logger = getLogger("Files Utils");

const ERROR_DL_FILE_MSG = "Une erreur est survenue lors du téléchargement du fichier: ";

exports.downloadFile = function (url, downloadPath) {
    return new Promise((resolve, reject) => {
        axios.default({
            url,
            method: 'GET',
            responseType: 'stream',
            onDownloadProgress: (progressEvent) => {
                const { progress } = progressEvent;

                if (progress) {
                    ipcMain.emit(OPCODES.PROGRESS, {
                        type: "Téléchargement",
                        progress: Math.floor(progress * 100)
                    });
                }
            }
        }).then((res) => {
            const fileStream = fs.createWriteStream(downloadPath);
            res.data.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                logger.info("Ficher téléchargé avec succès.");
                resolve();
            });

            fileStream.on('error', (err) => {
                logger.error(ERROR_DL_FILE_MSG + err);
                ipcMain.emit(ERRORS.FILE_DOWNLOAD_FAILED + err);
                reject(err);
            });
        }).catch((err) => {
            logger.error(ERROR_DL_FILE_MSG + err);
            ipcMain.emit(ERRORS.FILE_DOWNLOAD_FAILED + err);
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
        logger.error("Impossible de calculer le hash. Error: " + err);
        ipcMain.emit(ERRORS.FILE_HASH_CALCULATING_FAILED);
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
        logger.info(`Extraction de ${zipPath} ...`);
        await zip.extract(null, path.dirname(zipPath));
        logger.info(`Suppression de ${zipPath} ...`);
        fs_extra.removeSync(zipPath);
        logger.info(`Extraction ZIP réussie: ${zipPath}`);
    } catch (err) {
        logger.info("Extraction ZIP ratée. Error: " + err);
    } finally {
        await zip.close();
    }
}

async function extractTarGz(tarGzPath) {
    return new Promise((resolve, reject) => {
        fs_extra.createReadStream(tarGzPath)
            .on('error', (err) => handleTarGzError(err))
            .pipe(zlib.createGunzip())
            .on('error', (err) => handleTarGzError(err))
            .pipe(tar.extract(path.dirname(tarGzPath), {
                map: (header) => {
                    return header;
                }
            }))
            .on('error', (err) => {
                handleTarGzError(err);
                reject(err);
            })
            .on('finish', () => {
                fs_extra.unlink(tarGzPath, (err) => {
                    if (err) {
                        handleTarGzError(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
    })
}

function handleTarGzError(err) {
    logger.error(err);
    ipcMain.emit(ERRORS.FILE_EXTRACT_TARGZ + err);
}