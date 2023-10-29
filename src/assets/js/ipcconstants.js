exports.AZURE_CLIENT_ID = "fcc03b46-3ce2-4666-a548-d2a34b7a8815";

// Opcodes
exports.OPCODES = {
  LOGIN: "MSFT_AUTH_LOGIN",
  LOGOUT: "MSFT_AUTH_LOGOUT",
  GET_CONFIG: "GET_CONFIG",
  SWITCH_VIEW: "SWITCH_VIEW",
  PLAY: "PLAY",
};

// Reply types for REPLY opcode.
exports.REPLY_TYPES = {
  SUCCESS: "REPLY_SUCCESS",
  ERROR: "REPLY_ERROR",
};

// Error types for ERROR reply.
exports.ERRORS = {
  MSFT_ALREADY_OPEN: "MSFT_AUTH_ERR_ALREADY_OPEN",
  MSFT_NOT_FINISHED: "MSFT_AUTH_ERR_NOT_FINISHED",
  OTHER: "MSFT_AUTH_ERR_OTHER",
};

exports.VIEWS = {
  INDEX: "pages/index.html",
  APP: "pages/app.html",
};
