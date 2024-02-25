window.onload = async function () {
  const { VIEWS, URL } = window.bridge.constants;
  const config = await window.bridge.getConfig();
  const user = config.authenticationDatabase[config.selectedAccount];
  const info = await window.bridge.getData(URL.PACIFISTA_INFO);

  const avatar = document.getElementById("avatar");
  const pseudo = document.getElementById("pseudo");
  const settings = document.getElementById("settings");
  const play = document.getElementById("play");
  const logout = document.getElementById("logout");
  const shop = document.getElementById("shop");

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

  shop.addEventListener("click", () => {
    window.bridge.openInBrowser("https://pacifista.fr/shop");
  });

  info.servers.forEach((server) => {
    const card = generateServerCard(server);
    document.getElementById("servers").innerHTML += card;
  });
}

function generateServerCard(data) {
  const status = data.online ? {
    class: "online",
    text: "EN LIGNE"
  } : {
    class: "offline",
    text: "HORS LIGNE"
  };
  const onlinePlayers = `${data.onlinePlayers}/${data.playerSlots}`;

  return `<div class="card server-card">
  <h1>${data.name}</h1>
  <p class="status ${status.class}">${status.text}</p>
  <p><b>${onlinePlayers}</b> Joueurs Connectés</p>
</div>`
}