const { OPCODES } = require("./assets/js/constants");
const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { handleLogin, handleLogout } = require("./assets/js/microsoftauth");
const configManager = require("./assets/js/configmanager");
const { refreshAccount } = require('./assets/js/authmanager');
const javaUtils = require('./assets/js/java');
const launcher = require('./assets/js/launcher');
const rpc = require('./assets/js/discordRPC');
const { load } = require('./assets/js/logger');

load();
configManager.load();

const APP_ICON_PATH = path.join(__dirname, "../build/icon.ico");

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Pacifista Launcher",
    icon: APP_ICON_PATH,
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  let pagePath;
  if (configManager.isFirstLaunch()) pagePath = "pages/welcome.html";
  else if (await refreshAccount()) pagePath = "pages/app.html"
  else pagePath = "pages/index.html";

  mainWindow.loadURL(path.join(__dirname, pagePath));
  mainWindow.webContents.on('did-finish-load', () => {
    rpc.loadRPC();
  });
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on(OPCODES.SWITCH_VIEW, (arg1, arg2) => {
  if (typeof arg1 === "string") mainWindow.loadURL(path.join(__dirname, arg1));
  else mainWindow.loadURL(path.join(__dirname, arg2));
});

ipcMain.handle(OPCODES.LOGIN, async () => {
  return await handleLogin(APP_ICON_PATH);
});

ipcMain.handle(OPCODES.LOGOUT, async () => {
  return await handleLogout(APP_ICON_PATH);
});

ipcMain.handle(OPCODES.GET_CONFIG, () => {
  return configManager.getConfig();
});

ipcMain.on(OPCODES.SET_CONFIG, (_event, newConfig) => {
  configManager.setConfig(JSON.parse(newConfig));
});

ipcMain.on(OPCODES.PLAY, () => {
  javaUtils.fullJavaCheck();
  launcher.launchGame();
});

ipcMain.on(OPCODES.MC_STARTED, () => {
  const config = configManager.getConfig();
  if (config.settings.launcher.hideLauncherOnGameStart) mainWindow.hide();
});

ipcMain.on(OPCODES.MC_STOPPED, () => {
  const config = configManager.getConfig();
  if (config.settings.launcher.hideLauncherOnGameStart) mainWindow.show();
});

ipcMain.on(OPCODES.ERROR, (err) => {
  mainWindow.webContents.send(OPCODES.ERROR, err);
});