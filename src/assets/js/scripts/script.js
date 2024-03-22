const { on, constants } = window.bridge;

on(constants.OPCODES.ERROR, (err) => {
  iziToast.error({
    title: "Erreur",
    message: err,
    position: "topRight",
    transitionIn: "fadeInUp"
  });
});