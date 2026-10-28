/* The case and the laboratory share the same illustrated consolidation scenes. */
(() => {
  "use strict";
  const host = document.getElementById("consolidationDemo");
  const demo = window.AutoLabScenes?.demos.find((d) => d.id === "reloj");
  if (!host || !demo) return;
  let player;
  const mount = () => {
    player?.destroy();
    player = window.AutoLabPlayer.mount(host, {
      demo,
      headingLevel: 2,
      language: document.documentElement.lang === "en" ? "en" : "es",
    });
  };
  mount();
  addEventListener("pagehide", () => player?.destroy());
  addEventListener("pageshow", (event) => {
    if (event.persisted) mount();
  });
})();
