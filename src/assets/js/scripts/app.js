window.onload = async function () {
    const { VIEWS } = window.bridge.ipcConstants;
    const config = await window.bridge.getConfig();
    const user = config.authenticationDatabase[config.selectedAccount];

    const avatar = document.getElementById("avatar");
    const pseudo = document.getElementById("pseudo");
    const settings = document.getElementById("settings");
    const play = document.getElementById("play");
    const logout = document.getElementById("logout");

    avatar.style.backgroundImage = `url('https://mc-heads.net/body/${user.uuid}/right')`;
    pseudo.innerHTML = user.name;

    play.addEventListener("click", () => {
        window.bridge.play();
    });

    settings.addEventListener("click", () => {
        window.bridge.switchView(VIEWS.SETTINGS);
    });

    logout.addEventListener("click", () => {
        window.bridge.logout();
    });
}