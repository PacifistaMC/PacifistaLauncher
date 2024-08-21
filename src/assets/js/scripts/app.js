let progressContainer;
let progressBar;
let progressType;

window.onload = async function () {
    toast.success({
        title: "Succès !",
        message: "Connexion avec Microsoft réussie",
        position: "topRight",
        transitionIn: "fadeInUp"
    });

    const { VIEWS, URL } = constants;
    const config = await window.bridge.getConfig();
    const user = config.authenticationDatabase[config.selectedAccount];
    const info = await window.bridge.getData(URL.PACIFISTA_INFO);

    if (!info.success) {
        toast.error({
            title: "Erreur",
            message: "Impossible de récupérer les informations de Pacifista.",
            position: "topRight",
            transitionIn: "fadeInUp"
        });
    }

    const avatar = document.getElementById("avatar");
    const pseudo = document.getElementById("pseudo");
    const settings = document.getElementById("settings");
    const play = document.getElementById("play");
    const shop = document.getElementById("shop");
    const wiki = document.getElementById("wiki");
    const discord = document.getElementById("discord");
    const logout = document.getElementById("logout");
    const onlinePlayers = document.getElementById("online-players");
    const serverStatus = document.getElementById("server-status");

    progressContainer = document.getElementById("progress-container");
    progressBar = document.getElementById("progress-bar");
    progressType = document.getElementById("progress-type");

    avatar.style.backgroundImage = `url('https://mc-heads.net/body/${user.uuid}/right')`;
    pseudo.textContent = user.name;

    play.addEventListener("click", () => {
        window.bridge.play();
        toast.info({
            title: "Lancement...",
            message: "Lancement de Minecraft...",
            position: "topRight",
            transitionIn: "fadeInUp"
        });
    });

    settings.addEventListener("click", () => {
        window.bridge.switchView(VIEWS.SETTINGS);
    });

    logout.addEventListener("click", () => {
        window.bridge.logout();
    });

    shop.addEventListener("click", () => {
        window.bridge.openInBrowser(URL.PACIFISTA_SHOP);
    });

    wiki.addEventListener("click", () => {
        window.bridge.openInBrowser(URL.PACIFISTA_WIKI);
    });

    discord.addEventListener("click", () => {
        window.bridge.openInBrowser(URL.PACIFISTA_DISCORD);
    });

    if (info.success) {
        onlinePlayers.textContent = `${info.onlinePlayers}/${info.playerSlots}`;

        info.servers.forEach(server => {
            const statusNode = getStatusNode();
            statusNode.textContent = server.name;
            statusNode.classList.add(server.online ? "online" : "offline");

            serverStatus.appendChild(statusNode);
        });
    } else {
        onlinePlayers.textContent = "???";

        const statusNode = getStatusNode();
        statusNode.textContent = "???"
        serverStatus.appendChild(statusNode);
    }
}

const done = [];
on(constants.OPCODES.PROGRESS, (data) => {
    console.log(data)
    if (!done.includes(data.type) && progressContainer.style.visibility == "hidden") {
        progressContainer.style.visibility = "visible";
    }

    progressType.textContent = data.type;
    progressBar.style.width = `${data.progress}%`;

    if (data.progress == 100) {
        done.push(data.type);
        progressContainer.style.visibility = "hidden";
    }
});

function getStatusNode() {
    const statusNode = document.createElement("p");
    statusNode.classList.add("status", "outfit");

    return statusNode;
}