window.onload = function () {
  const { VIEWS } = window.bridge.ipcConstants;
  document.getElementById("play").addEventListener("click", () => {
    window.bridge.switchView(VIEWS.INDEX);
  });
}