window.onload = function () {
    const { REPLY_TYPES, ERRORS } = window.bridge.ipcConstants;

    let loginMicrosoftBtn = document.getElementById("login");

    loginMicrosoftBtn.addEventListener('click', () => {
        loginMicrosoftBtn.disabled = true;
        window.bridge.login().then(({ reply_type, error, message }) => {
            if (reply_type === REPLY_TYPES.ERROR) {
                let errorMessage;
                switch (error) {
                    case ERRORS.MSFT_ALREADY_OPEN:
                        errorMessage = "La fenêtre de connexion est déjà ouverte !";
                        break;
                    case ERRORS.MSFT_NOT_FINISHED:
                        errorMessage = "La connexion en cours n'est pas terminée !";
                        break;
                    case ERRORS.OTHER:
                        errorMessage = message;
                        break;
                    default:
                        errorMessage = "Une erreur inconnue est survenue.";
                        break;
                }

                iziToast.error({
                    title: "Erreur",
                    message: errorMessage,
                    position: "bottomRight",
                    transitionIn: "fadeInDown"
                });
            } else if (reply_type === REPLY_TYPES.SUCCESS) {
                iziToast.success({
                    title: "Succès !",
                    message: "Connexion avec Microsoft réussie",
                    position: "bottomRight",
                    transitionIn: "fadeInDown"
                });
            }

            loginMicrosoftBtn.disabled = false;
        });
    });
}