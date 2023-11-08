const { BrowserWindow, ipcMain } = require("electron");
const { AZURE_CLIENT_ID, REPLY_TYPES, ERRORS } = require("./ipcconstants");
const { addMicrosoftAccount, removeMicrosoftAccount } = require('./authmanager');

const REDIRECT_URI_PREFIX =
  "https://login.microsoftonline.com/common/oauth2/nativeclient?";

let msftAuthWindow;
let msftAuthSuccess;
exports.handleLogin = async function (APP_ICON_PATH) {
  return new Promise((resolve) => {
    if (msftAuthWindow) {
      resolve({
        reply_type: REPLY_TYPES.ERROR,
        error: ERRORS.MSFT_ALREADY_OPEN,
      });
    }
    msftAuthSuccess = false;
    msftAuthWindow = new BrowserWindow({
      title: "Microsoft Login",
      backgroundColor: "#222222",
      width: 520,
      height: 600,
      frame: true,
      icon: APP_ICON_PATH,
    });

    msftAuthWindow.on("closed", () => {
      msftAuthWindow = undefined;
    });

    msftAuthWindow.on("close", () => {
      if (!msftAuthSuccess) {
        resolve({
          reply_type: REPLY_TYPES.ERROR,
          error: ERRORS.MSFT_NOT_FINISHED,
        });
      }
    });

    msftAuthWindow.webContents.on("did-navigate", async (_, uri) => {
      if (uri.startsWith(REDIRECT_URI_PREFIX)) {
        const url = new URL(uri);
        const code = url.searchParams.get('code');

        addMicrosoftAccount(code).then((response) => {
          if (response.success) {
            resolve({ reply_type: REPLY_TYPES.SUCCESS });
          } else {
            resolve({
              reply_type: REPLY_TYPES.ERROR,
              error: ERRORS.OTHER,
              message: response.error,
            });
          }
        });

        if (!msftAuthWindow) return;

        msftAuthSuccess = true;
        msftAuthWindow.close();
        msftAuthWindow = undefined;
      }
    });

    msftAuthWindow.removeMenu();
    msftAuthWindow.loadURL(
      `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?prompt=select_account&client_id=${AZURE_CLIENT_ID}&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient`
    );
  });
};

let msftLogoutWindow;
let msftLogoutSuccess;
let msftLogoutSuccessSent;
exports.handleLogout = function (APP_ICON_PATH) {
  return new Promise((resolve) => {
    if (msftLogoutWindow) {
      resolve({
        reply_type: REPLY_TYPES.ERROR,
        error: ERRORS.MSFT_ALREADY_OPEN,
      });
    }

    msftLogoutSuccess = false;
    msftLogoutSuccessSent = false;
    msftLogoutWindow = new BrowserWindow({
      title: "Microsoft Logout",
      backgroundColor: "#222222",
      width: 520,
      height: 600,
      frame: true,
      icon: APP_ICON_PATH,
    });

    msftLogoutWindow.on("closed", () => {
      msftLogoutWindow = null;
    });

    msftLogoutWindow.on("close", () => {
      if (!msftLogoutSuccess) {
        resolve({
          reply_type: REPLY_TYPES.ERROR,
          error: ERRORS.MSFT_NOT_FINISHED,
        });
      } else if (!msftLogoutSuccessSent) {
        msftLogoutSuccessSent = true;
        resolve({ reply_type: REPLY_TYPES.SUCCESS });
      }
    });

    msftLogoutWindow.webContents.on("did-navigate", (_, uri) => {
      const logoutUri = "https://login.microsoftonline.com/common/oauth2/v2.0/logoutsession";
      if (uri.startsWith(logoutUri)) {
        removeMicrosoftAccount();
        msftLogoutSuccess = true;
        setTimeout(() => {
          if (!msftLogoutSuccessSent) {
            msftLogoutSuccessSent = true;
            resolve({ reply_type: REPLY_TYPES.SUCCESS });
          }

          if (msftLogoutWindow) {
            msftLogoutWindow.close();
            msftLogoutWindow = null;
          }
        }, 5000);
      }
    });

    msftLogoutWindow.removeMenu();
    msftLogoutWindow.loadURL(
      "https://login.microsoftonline.com/common/oauth2/v2.0/logout"
    );
  });
};
