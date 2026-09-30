/* The portfolio remains usable without the optional observatory. */
(() => {
  "use strict";
  const root = document.documentElement;
  const dialog = document.getElementById("galaxy-observatory");
  const trigger = document.getElementById("galaxy-explore");
  const close = document.getElementById("galaxy-close");
  const motion = document.getElementById("galaxy-motion");
  const stage = document.getElementById("galaxy-view");
  const english = root.lang === "en";
  if (!dialog || !trigger || !close || !stage) return;

  let opener = null;
  let keyboardX = 0;
  let keyboardY = 0;
  const dispatch = (name, detail) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  function syncMotion() {
    const paused = !!window.hhMotion?.paused;
    motion.setAttribute("aria-pressed", String(paused));
    motion.textContent = english
      ? paused
        ? "Resume motion"
        : "Pause motion"
      : paused
        ? "Reanudar movimiento"
        : "Pausar movimiento";
  }

  function openObservatory(event) {
    if (!root.classList.contains("galaxy-ready") || dialog.open) return;
    opener = event.currentTarget;
    dialog.showModal();
    root.classList.add("galaxy-exploring");
    dispatch("hh:galaxy-explore", { active: true });
    syncMotion();
    close.focus({ preventScroll: true });
  }

  trigger.addEventListener("click", openObservatory);
  document.querySelectorAll("[data-galaxy-open]").forEach((button) => {
    button.addEventListener("click", openObservatory);
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    root.classList.remove("galaxy-exploring");
    dispatch("hh:galaxy-explore", { active: false });
    opener?.focus({ preventScroll: true });
  });
  // Keep Escape within the top-layer dialog; other page widgets also use it.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    dialog.close();
  });
  motion.addEventListener("click", () => {
    document.getElementById("motionToggle")?.click();
    syncMotion();
  });
  window.addEventListener("hh:motion", syncMotion);
  document.getElementById("galaxy-reset")?.addEventListener("click", () => {
    keyboardX = 0;
    keyboardY = 0;
    dispatch("hh:galaxy-reset");
  });
  stage.addEventListener("keydown", (event) => {
    const direction = {
      ArrowLeft: [-0.2, 0],
      ArrowRight: [0.2, 0],
      ArrowUp: [0, 0.2],
      ArrowDown: [0, -0.2],
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    keyboardX = Math.max(-1, Math.min(1, keyboardX + direction[0]));
    keyboardY = Math.max(-1, Math.min(1, keyboardY + direction[1]));
    dispatch("hh:galaxy-navigate", { x: keyboardX, y: keyboardY });
  });
  // A context loss or an OS preference change must never strand a modal.
  new MutationObserver(() => {
    if (dialog.open && !root.classList.contains("galaxy-ready")) dialog.close();
  }).observe(root, { attributes: true, attributeFilter: ["class"] });
  syncMotion();
})();
