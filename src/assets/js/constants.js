exports.AZURE_CLIENT_ID = "fcc03b46-3ce2-4666-a548-d2a34b7a8815";
exports.DISCORD_RPC_CLIENT_ID = "1175831066976735332"; // Discord app's client ID. Test purposes. App owner: Discord @gamecreep35 & GitHub @iGameCreep

exports.URL = {
  PACIFISTA_INFO: "http://beta.pacifista.fr:25550/",
}

// Opcodes
exports.OPCODES = {
  LOGIN: "MSFT_AUTH_LOGIN",
  LOGOUT: "MSFT_AUTH_LOGOUT",
  GET_CONFIG: "GET_CONFIG",
  SET_CONFIG: "SET_CONFIG",
  SWITCH_VIEW: "SWITCH_VIEW",
  PLAY: "PLAY",
  MC_STARTED: "MC_STARTED",
  MC_STOPPED: "MC_STOPPED",
  ERROR: "ERROR",
};

// Reply types for REPLY opcode.
exports.REPLY_TYPES = {
  SUCCESS: "REPLY_SUCCESS",
  ERROR: "REPLY_ERROR",
};

// Error types for ERROR reply.
exports.ERRORS = {
  MSFT_ALREADY_OPEN: "La fenêtre de connexion est déjà ouverte !",
  MSFT_NOT_FINISHED: "La connexion en cours n'est pas terminée !",
  MSFT_OTHER: "Une erreur inconnue est survenue.",
  MSFT_UNABLE_TO_REFRESH: "Impossible de reconnecter le compte enregistré.",

  RCP_NOT_LOADED: "Impossible de charger la Rich Presence Discord.",

  JAVA_NOT_INSTALLED: "Java 17 isn't installed on this system. Starting installation...",
  JAVA_UNABLE_TO_INSTALL: "Impossible d'installer Java 17. Erreur: ",
  JAVA_NO_SUITABLE_BINARY: "Impossible de trouver une version de java à installer.",
  JAVA_FAILED_TO_INSTALL: "Erreur lors de l'installation de Java: ",
  JAVA_UNABLE_TO_GET_VERSION: "Impossible de récupérer une version de Java.",

  FILE_DOWNLOAD_FAILED: "Une erreur est survenue lors du téléchargement d'un fichier: ",
  FILE_HASH_CALCULATING_FAILED: "Une erreur est survenue lors de la vérification d'un fichier: ",
  FILE_EXTRACT_TARGZ: "Une erreur est survenue lors de l'extraction d'un fichier tar.gz: ",
};

exports.VIEWS = {
  INDEX: "pages/index.html",
  APP: "pages/app.html",
  SETTINGS: "pages/settings.html",
};

exports.TOAST_OPTIONS = {
  position: ""
}
