window.onload = function () {
  const { REPLY_TYPES } = window.bridge.constants;

  let loginMicrosoftBtn = document.getElementById("login");

  loginMicrosoftBtn.addEventListener('click', () => {
    loginMicrosoftBtn.disabled = true;
    window.bridge.login().then(({ reply_type }) => {
      if (reply_type === REPLY_TYPES.SUCCESS) {
        iziToast.success({
          title: "Succès !",
          message: "Connexion avec Microsoft réussie",
          position: "topRight",
          transitionIn: "fadeInUp"
        });
      }

      loginMicrosoftBtn.disabled = false;
    });
  });
}