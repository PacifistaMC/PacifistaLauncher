window.onload = function () {
  const { REPLY_TYPES, VIEWS } = window.bridge.constants;

  let loginMicrosoftBtn = document.getElementById("login");

  loginMicrosoftBtn.addEventListener('click', () => {
    loginMicrosoftBtn.disabled = true;
    window.bridge.login().then(({ reply_type }) => {
      if (reply_type === REPLY_TYPES.SUCCESS) {
        window.bridge.switchView(VIEWS.APP);
      }

      loginMicrosoftBtn.disabled = false;
    });
  });
}