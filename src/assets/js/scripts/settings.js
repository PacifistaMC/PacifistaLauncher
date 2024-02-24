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
    document.getElementById('hideLauncherOnGameStart').checked = config.settings.launcher.hideLauncherOnGameStart;

    const allocatedRam = document.getElementById('allocated-ram');
    allocatedRam.setAttribute("min", config.javaConfig.minRAM);
    allocatedRam.setAttribute("max", config.javaConfig.maxRAM);
    allocatedRam.value = config.javaConfig.allocatedRAM;
    document.getElementById('total-ram').innerHTML = `RAM totale: ${config.javaConfig.maxRAM} GB`;
    setAllocatedRamValue(config.javaConfig.allocatedRAM);

    allocatedRam.addEventListener('input', () => setAllocatedRamValue());

    function setAllocatedRamValue(value) {
        document.getElementById('allocated-ram-value').innerHTML = `${value ?? allocatedRam.value} GB`;
    }

    document.getElementById("save-btn").addEventListener("click", () => {
        const resolutionWidth = document.getElementById("resolution-width").value;
        const resolutionHeight = document.getElementById("resolution-height").value;
        const fullscreen = document.getElementById("fullscreen").checked;
        const detached = document.getElementById("detached").checked;
        const allocatedRam = Number(document.getElementById("allocated-ram").value);

        config.settings.game.resWidth = resolutionWidth;
        config.settings.game.resHeight = resolutionHeight;
        config.settings.game.fullscreen = fullscreen;
        config.settings.game.launchDetached = detached;
        config.javaConfig.allocatedRAM = allocatedRam;

        window.bridge.setConfig(JSON.stringify(config));
        window.bridge.switchView(VIEWS.APP);
    });

    document.getElementById("cancel-btn").addEventListener("click", () => {
        window.bridge.switchView(VIEWS.APP);
    });
}