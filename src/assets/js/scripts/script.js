const { on, constants } = window.bridge;

const toast = {
  info: function({ title, message }) {
    loadToast(title, message, getColor('--primary-color'));
  },
  error: function({ title, message }) {
    loadToast(title, message, getColor('--danger-primary-color'));
  },
  success: function({ title, message }) {
    loadToast(title, message, getColor('--success-primary-color'));
  }
}

function getColor(varName) {
  const style = getComputedStyle(document.body);
  return style.getPropertyValue(varName);
}

iziToast.settings({
  position: "topRight",
  transitionIn: "fadeInUp"
});

function loadToast(title, message, color) {
  iziToast.show({
    title,
    message,
    backgroundColor: color,
    position: "topRight",
    transitionIn: "fadeInUp"
  });
}

on(constants.OPCODES.ERROR, (err) => {
  toast.error({
    title: "Erreur",
    message: err
  });
});