const { ipcMain } = require("electron");
const { AZURE_CLIENT_ID, OPCODES, VIEWS, ERRORS } = require("./constants");
const { Auth, assets } = require('msmc');
const { getLogger } = require("./logger");
const configManager = require("./configmanager");

const logger = getLogger("Microsoft Authenticator");

const lexiPack = assets.loadLexiPack("./src/assets/lexiPacks/french.json");

const auth = new Auth({
  client_id: AZURE_CLIENT_ID,
  redirect: 'https://login.microsoftonline.com/common/oauth2/nativeclient'
});

auth.on('load', (_id, info) => {
  logger.info(info);
});

exports.addMicrosoftAccount = async function (code) {
  const config = configManager.getConfig();

  try {
    const xboxData = await auth.login(code);
    await saveUserData(xboxData);
  } catch (err) {
    const errMsg = lexiPack[err] ?? "Erreur inconnue lors de la connexion.";
    logger.error(errMsg);
    ipcMain.emit(OPCODES.ERROR, errMsg)
    return { success: false };
  }

  configManager.setConfig(config);
  ipcMain.emit(OPCODES.SWITCH_VIEW, VIEWS.APP);

  return { success: true };
}

exports.removeMicrosoftAccount = function () {
  const config = configManager.getConfig();

  delete config.authenticationDatabase[config.selectedAccount];
  config.selectedAccount = null;

  configManager.setConfig(config);
  ipcMain.emit(OPCODES.SWITCH_VIEW, VIEWS.INDEX);

  return { success: true };
}

exports.refreshAccount = async function () {
  const config = configManager.getConfig();

  if (!config.selectedAccount) return false;
  const user = config.authenticationDatabase[config.selectedAccount];

  try {
    await auth.refresh(user.meta.refresh);
  } catch (err) {
    logger.error(ERRORS.MSFT_UNABLE_TO_REFRESH);
    ipcMain.emit(ERRORS.MSFT_UNABLE_TO_REFRESH);
    return false;
  }

  return true;
}

async function saveUserData(xboxData) {
  const config = configManager.getConfig();
  const mcData = await xboxData.getMinecraft();
  const mclcData = mcData.mclc();

  mclcData.meta.refresh = xboxData.msToken.refresh_token;

  config.selectedAccount = mclcData.uuid;
  config.authenticationDatabase[mclcData.uuid] = mclcData;

  configManager.setConfig(config);
}
