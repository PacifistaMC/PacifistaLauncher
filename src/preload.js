const { contextBridge, ipcRenderer, shell } = require("electron");
const constants = require("./assets/js/constants");
const requests = require('./assets/js/requests');

contextBridge.exposeInMainWorld("bridge", {
  constants,
  login: () => ipcRenderer.invoke(constants.OPCODES.LOGIN),
  logout: () => ipcRenderer.invoke(constants.OPCODES.LOGOUT),
  switchView: (view) => ipcRenderer.send(constants.OPCODES.SWITCH_VIEW, view),
  getConfig: () => ipcRenderer.invoke(constants.OPCODES.GET_CONFIG),
  setConfig: (newConfig) => ipcRenderer.send(constants.OPCODES.SET_CONFIG, newConfig),
  play: () => ipcRenderer.send(constants.OPCODES.PLAY),
  openInBrowser: (url) => shell.openExternal(url),
  getData: (url, method) => requests.getData(url, method),
});
