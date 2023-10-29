const axios = require("axios");
const { ipcMain } = require("electron");
const { OPCODES, VIEWS } = require("./ipcconstants");
const { getLogger } = require("./logger");
const configManager = require("./configmanager");

const logger = getLogger("Auth Manager");

exports.addMicrosoftAccount = async function (code) {
  const response = await getAccount(code);

  if (response.success) {
    const account = response.data;
    configManager.addAuthAccount(account);
    return response;
  }

  return { success: response.success, error: response.error };
}

async function getAccount(code) {
  const defaultErrorMessage = "Erreur inconnue lors de la requête à l'API.";
  let errorMessage = "";

  const response = await axios
    .get(
      `https://funixproddevpcftalauncherimpl.gamecreep35.repl.co/authflow?code=${code}`
    )
    .catch((err) => {
      if (err instanceof axios.AxiosError) {
        errorMessage = `Erreur inconnue lors de la requête à l'API. Status: ${err.status}, Cause: "${err.cause}", Message: "${err.message}".`;
      } else {
        errorMessage = defaultErrorMessage;
      }
    });

  if (!response)
    return { success: false, error: errorMessage || defaultErrorMessage };

  if (!response.data.success) {
    errorMessage = response.data.error ?? defaultErrorMessage;
  }

  if (errorMessage && errorMessage !== "") {
    logger.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }

  ipcMain.emit(OPCODES.SWITCH_VIEW, VIEWS.APP);
  return response.data;
}
