const { contextBridge, ipcRenderer, shell } = require("electron");
const ipcConstants = require("./assets/js/constants");

contextBridge.exposeInMainWorld("bridge", {
  ipcConstants,
  login: () => ipcRenderer.invoke(ipcConstants.OPCODES.LOGIN),
  logout: () => ipcRenderer.invoke(ipcConstants.OPCODES.LOGOUT),
  switchView: (view) => ipcRenderer.send(ipcConstants.OPCODES.SWITCH_VIEW, view),
  getConfig: () => ipcRenderer.invoke(ipcConstants.OPCODES.GET_CONFIG),
  setConfig: (newConfig) => ipcRenderer.send(ipcConstants.OPCODES.SET_CONFIG, newConfig),
  play: () => ipcRenderer.send(ipcConstants.OPCODES.PLAY),
  openInBrowser: (url) => shell.openExternal(url),
});
