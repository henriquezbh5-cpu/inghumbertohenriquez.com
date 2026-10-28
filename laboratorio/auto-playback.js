/* Pure scene transitions; time and browser visibility belong to the player. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.AutoLabPlayback = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";
  function initial(scenario = 0) {
    return { scenario, step: 0, phase: "active" };
  }
  function advance(state, lengths) {
    if (!lengths.length || lengths.some((n) => !Number.isInteger(n) || n < 1))
      throw new Error("A scene needs steps");
    if (state.phase === "result")
      return initial((state.scenario + 1) % lengths.length);
    if (state.step + 1 < lengths[state.scenario])
      return { ...state, step: state.step + 1 };
    return { ...state, phase: "result" };
  }
  function finish(state, lengths) {
    return { ...state, step: lengths[state.scenario] - 1, phase: "result" };
  }
  function canRun({ paused, visible, hidden, blocked, destroyed }) {
    return !paused && visible && !hidden && !blocked && !destroyed;
  }
  return { initial, advance, finish, canRun };
});
