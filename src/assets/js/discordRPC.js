const configManager = require('./configmanager');
const DiscordRPC = require('discord-rpc');
const { DISCORD_RPC_CLIENT_ID } = require('./constants');
const { getLogger } = require('./logger');

const logger = getLogger("Discord RPC");

let rpc;
let options = {
  details: `Dans le lanceur`,
  state: 'IP: play.pacifista.fr',
  startTimestamp: null,
  largeImageKey: 'pacifista_logo_large',
  largeImageText: 'Pacifista Logo 768x768',
  smallImageKey: 'pacifista_logo_small',
  smallImageText: 'Pacifista Logo 512x512',
  instance: false,
};

exports.loadRPC = function () {
  logger.info("Loading Discord RPC");
  DiscordRPC.register(DISCORD_RPC_CLIENT_ID);

  rpc = new DiscordRPC.Client({ transport: 'ipc' });
  options.startTimestamp = new Date();

  rpc.on('ready', () => {
    logger.info("Discord RPC Ready !");
    exports.setActivity();

    setInterval(() => {
      exports.setActivity();
    }, 15e3);
  });

  rpc.login({ clientId: DISCORD_RPC_CLIENT_ID }).catch(() => {
    rpc = null;
    logger.error("Could not connect to Discord.");
  });
}

exports.setActivity = function (customOptions = {}) {
  if (rpc === null) return;
  options = configManager.validateKeySet(options, customOptions);
  rpc.setActivity(options);
}