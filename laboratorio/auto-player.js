/* Automatic, disposable demonstrations with an explicit pause and static alternative. */
(() => {
  "use strict";
  const model = window.AutoLabPlayback;
  const text = (value, en) =>
    Array.isArray(value) ? value[en ? 1 : 0] : String(value ?? "");
  function element(tag, cls, value) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value !== undefined) n.textContent = value;
    return n;
  }
  function icon(name) {
    const wrap = element("span", "av-icon");
    wrap.dataset.technology = name;
    wrap.setAttribute("aria-hidden", "true");
    if (window.AutoLabIcons?.[name]) wrap.innerHTML = window.AutoLabIcons[name];
    else {
      const labels = {
        apps: "AP",
        automate: "PA",
        bi: "BI",
        dataverse: "DV",
        teams: "T",
        sharepoint: "S",
        excel: "X",
        sql: "SQL",
        python: "Py",
        ai: "IA",
        whatsapp: "WA",
        outlook: "O",
        cloud: "AZ",
        code: "</>",
        check: "✓",
        document: "DOC",
        api: "API",
        docker: "DK",
        github: "GH",
        map: "MAP",
      };
      wrap.textContent = labels[name] || "→";
    }
    return wrap;
  }
  function mount(
    host,
    { demo, language = "es", headingLevel = 3, onComplete } = {},
  ) {
    if (
      !demo?.scenarios?.length ||
      demo.scenarios.some((s) => !s.steps?.length)
    )
      throw new Error("Missing demonstration scenes");
    const en = language === "en",
      t = (es, english) => (en ? english : es);
    const abort = new AbortController(),
      signal = abort.signal;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    let persisted = false;
    try {
      persisted =
        localStorage.getItem("hh-demo-paused") === "true" ||
        localStorage.getItem("hh-motion-paused") === "true";
    } catch {
      /* Optional storage. */
    }
    let paused = persisted,
      visible = false,
      destroyed = false,
      explicitPlay = false;
    let timer = 0,
      deadline = 0,
      remaining = 0,
      previewCleanup = null;
    const lengths = demo.scenarios.map((s) => s.steps.length);
    let state = model.initial();
    const blocked = () =>
      !explicitPlay &&
      (preference.matches ||
        !!connection?.saveData ||
        !!window.hhMotion?.paused);
    if (blocked() || paused) state = model.finish(state, lengths);
    const shell = element("section", "av-showcase");
    shell.setAttribute(
      "aria-label",
      t("Demostración automática", "Automatic demonstration"),
    );
    const top = element("div", "av-window-bar");
    const dots = element("span", "av-window-dots");
    dots.setAttribute("aria-hidden", "true");
    dots.append(element("i"), element("i"), element("i"));
    const title = element(headingLevel === 2 ? "h2" : "h3", "av-window-title");
    const badge = element(
      "span",
      "av-demo-badge",
      t("Datos de ejemplo", "Sample data"),
    );
    top.append(dots, title, badge);
    const toolbar = element("div", "av-toolbar");
    const context = element("span", "av-context");
    const buttons = element("div", "av-controls");
    function button(label, fn) {
      const b = element("button", "av-control", label);
      b.type = "button";
      b.addEventListener("click", fn, { signal });
      buttons.append(b);
      return b;
    }
    const toggle = button(t("Pausar", "Pause"), () => {
      if (paused || blocked()) {
        paused = false;
        explicitPlay = true;
        if (blocked() || state.phase === "result") {
          state = model.initial(state.scenario);
          render();
        }
      } else paused = true;
      try {
        localStorage.setItem("hh-demo-paused", String(paused));
      } catch {
        /* Optional storage. */
      }
      sync();
    });
    const replay = button(t("Repetir", "Replay"), () => {
      state = model.initial(state.scenario);
      render();
      sync();
    });
    const next = button(t("Otro escenario", "Next scenario"), () => {
      state = model.initial((state.scenario + 1) % lengths.length);
      if (blocked() || paused) state = model.finish(state, lengths);
      render();
      sync();
    });
    next.hidden = lengths.length < 2;
    toolbar.append(context, buttons);
    const content = element("div", "av-content");
    const flow = element("div", "av-flow-panel");
    const intro = element("div", "av-flow-intro");
    intro.append(
      element(
        "span",
        "av-eyebrow",
        t("Así avanza el proceso", "How the process unfolds"),
      ),
    );
    const list = element("ol", "av-steps");
    flow.append(intro, list);
    const preview = element("div", "av-preview");
    preview.setAttribute("aria-live", "off");
    content.append(flow, preview);
    const result = element("div", "av-result");
    const resultIcon = element("span", "av-result-icon", "→");
    resultIcon.setAttribute("aria-hidden", "true");
    const resultText = element("p");
    const progress = element("span", "av-progress");
    result.append(resultIcon, resultText, progress);
    const foot = element(
      "p",
      "av-disclaimer",
      t(
        "Representación visual del proceso. No se conecta a sistemas reales.",
        "Visual representation of the process. No real systems are connected.",
      ),
    );
    shell.append(top, toolbar, content, result, foot);
    host.replaceChildren(shell);
    function stop() {
      if (timer) {
        clearTimeout(timer);
        timer = 0;
        remaining = Math.max(0, deadline - performance.now());
      }
    }
    function duration() {
      return state.phase === "result"
        ? 5500
        : Math.max(
            1800,
            demo.scenarios[state.scenario].steps[state.step].duration || 2900,
          );
    }
    function render() {
      stop();
      remaining = duration();
      const scenario = demo.scenarios[state.scenario];
      const current = scenario.steps[state.step];
      shell.dataset.phase = state.phase;
      shell.dataset.kind = scenario.preview.kind;
      shell.dataset.scenario = scenario.id;
      shell.dataset.step = String(state.step);
      title.textContent = text(scenario.title, en);
      list.replaceChildren();
      scenario.steps.forEach((step, index) => {
        const done = state.phase === "result" || index < state.step;
        const active = state.phase !== "result" && index === state.step;
        const item = element("li", "av-step");
        item.dataset.state = done ? "done" : active ? "active" : "pending";
        if (active) item.setAttribute("aria-current", "step");
        const body = element("div", "av-step-copy");
        const name = element("strong", null, text(step.title, en));
        const tech = element("span", "av-step-tech", step.technology);
        const status = element(
          "span",
          "av-step-status",
          done
            ? "✓ " + text(step.done, en)
            : active
              ? text(step.active, en)
              : t("En espera", "Waiting"),
        );
        body.append(name, tech, status);
        item.append(icon(step.icon), body);
        list.append(item);
      });
      if (typeof previewCleanup === "function") previewCleanup();
      previewCleanup = window.AutoLabPreview.render(
        preview,
        { ...scenario.preview, ...current.view },
        language,
      );
      result.dataset.complete = String(state.phase === "result");
      resultIcon.textContent = state.phase === "result" ? "✓" : "→";
      resultText.textContent =
        state.phase === "result"
          ? text(scenario.outcome, en)
          : text(current.active, en);
      progress.textContent =
        state.phase === "result"
          ? t("Proceso completo", "Process complete")
          : `${t("Paso", "Step")} ${state.step + 1} / ${scenario.steps.length}`;
    }
    function schedule() {
      if (timer) return;
      deadline = performance.now() + remaining;
      timer = setTimeout(() => {
        timer = 0;
        if (destroyed) return;
        if (
          state.phase === "result" &&
          state.scenario === lengths.length - 1 &&
          typeof onComplete === "function" &&
          onComplete() === true
        )
          return;
        state = model.advance(state, lengths);
        render();
        sync();
      }, remaining);
    }
    function sync() {
      if (destroyed) return;
      const running = model.canRun({
        paused,
        visible,
        hidden: document.hidden,
        blocked: blocked(),
        destroyed,
      });
      shell.dataset.running = String(running);
      replay.disabled = blocked();
      toggle.textContent =
        paused || blocked() ? t("Reproducir", "Play") : t("Pausar", "Pause");
      toggle.setAttribute(
        "aria-label",
        paused || blocked()
          ? t("Reproducir demostración", "Play demonstration")
          : t("Pausar demostración", "Pause demonstration"),
      );
      toggle.setAttribute("aria-pressed", String(paused || blocked()));
      context.textContent = blocked()
        ? t("Vista estática", "Static view")
        : paused
          ? t("En pausa", "Paused")
          : `${t("Reproducción automática", "Playing automatically")} · ${state.scenario + 1}/${lengths.length}`;
      if (running) schedule();
      else stop();
    }
    function preferencesChanged() {
      explicitPlay = false;
      if (blocked()) {
        state = model.finish(state, lengths);
        render();
      }
      sync();
    }
    document.addEventListener("visibilitychange", sync, { signal });
    window.addEventListener("hh:motion", preferencesChanged, { signal });
    preference.addEventListener("change", preferencesChanged, { signal });
    connection?.addEventListener("change", preferencesChanged, { signal });
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.05 },
    );
    render();
    sync();
    observer.observe(shell);
    const controller = {
      destroy() {
        if (destroyed) return;
        destroyed = true;
        stop();
        abort.abort();
        observer.disconnect();
        if (typeof previewCleanup === "function") previewCleanup();
      },
      getState() {
        return {
          ...state,
          paused,
          visible,
          running: shell.dataset.running === "true",
        };
      },
    };
    return controller;
  }
  window.AutoLabPlayer = { mount };
})();
