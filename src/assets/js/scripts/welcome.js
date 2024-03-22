window.onload = function () {
  const { VIEWS } = window.bridge.constants;
  document.getElementById("play").addEventListener("click", () => {
    window.bridge.switchView(VIEWS.INDEX);
  });
}