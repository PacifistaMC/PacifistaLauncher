window.onload = async function () {
  const config = await window.bridge.getConfig();
  const user = config.authenticationDatabase[config.selectedAccount];

  const avatar = document.getElementById("avatar");
  const pseudo = document.getElementById("pseudo");
  const settings = document.getElementById("settings");
  const play = document.getElementById("play");

  avatar.style.backgroundImage = `url('https://mc-heads.net/body/${user.minecraft.uuid}/right')`;
  pseudo.innerHTML = user.minecraft.username;

  play.addEventListener("click", () => {
    window.bridge.play();
  });
}