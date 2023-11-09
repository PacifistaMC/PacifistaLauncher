window.onload = async function () {
    const { VIEWS } = window.bridge.ipcConstants;
    let config = await window.bridge.getConfig();

    const selectedAccount = config.authenticationDatabase[config.selectedAccount];
    document.getElementById('username').innerHTML = selectedAccount.name;
    document.getElementById('user-avatar').style.backgroundImage = `url('https://mc-heads.net/body/${selectedAccount.uuid}/right')`;
    document.getElementById('uuid').innerHTML = `UUID: ${selectedAccount.uuid}`;

    document.getElementById('resolution-width').value = config.settings.game.resWidth;
    document.getElementById('resolution-height').value = config.settings.game.resHeight;

    document.getElementById('fullscreen').checked = config.settings.game.fullscreen;
    document.getElementById('detached').checked = config.settings.game.launchDetached;

    const allocatedRam = document.getElementById('allocated-ram');
    allocatedRam.min = config.javaConfig.minRAM;
    allocatedRam.max = config.javaConfig.maxRAM;
    allocatedRam.value = config.javaConfig.minRAM;
    document.getElementById('total-ram').innerHTML = `RAM totale: ${config.javaConfig.maxRAM} GB`;

    allocatedRam.addEventListener('input', () => {
        document.getElementById('allocated-ram-value').innerHTML = `${allocatedRam.value} GB`;
    });

    document.getElementById("save-btn").addEventListener("click", () => {
        const resolutionWidth = document.getElementById("resolution-width").value;
        const resolutionHeight = document.getElementById("resolution-height").value;
        const fullscreen = document.getElementById("fullscreen").checked;
        const detached = document.getElementById("detached").checked;
        const maxRam = document.getElementById("allocated-ram").value;

        config.settings.game.resWidth = resolutionWidth;
        config.settings.game.resHeight = resolutionHeight;
        config.settings.game.fullscreen = fullscreen;
        config.settings.game.launchDetached = detached;
        config.javaConfig.maxRAM = maxRam;

        window.bridge.setConfig(JSON.stringify(config));
        window.bridge.switchView(VIEWS.APP);
    });
}