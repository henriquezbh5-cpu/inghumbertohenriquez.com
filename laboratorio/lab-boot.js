/* Bilingual catalogue of automatic demonstrations. Existing fragment routes remain valid. */
(() => {
  "use strict";
  const demos = window.AutoLabScenes?.demos;
  if (!demos?.length) return;
  const en = document.documentElement.lang === "en",
    language = en ? "en" : "es";
  const t = (value) => (Array.isArray(value) ? value[en ? 1 : 0] : value);
  const words = {
    all: t(["Todas", "All"]),
    microsoft: "Microsoft",
    data: t(["Datos", "Data"]),
    ai: t(["IA y agentes", "AI & agents"]),
    web: t(["Desarrollo", "Development"]),
  };
  function node(tag, cls, value) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value !== undefined) n.textContent = value;
    return n;
  }
  const stage = document.getElementById("stage"),
    list = document.getElementById("demoList"),
    search = document.getElementById("demoSearch"),
    tech = document.getElementById("technologyFilter"),
    select = document.getElementById("demoSelect"),
    picker = document.querySelector(".lab-picker"),
    tour = document.getElementById("autoTour");
  const mobile = matchMedia("(max-width:900px)");
  let active = "",
    family = "all",
    controller = null;
  const buttons = [];
  const normalize = (s) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function filter() {
    let count = 0;
    const q = normalize(search.value.trim());
    for (const { demo, button } of buttons) {
      const match =
        (family === "all" || demo.family === family) &&
        (!tech.value || demo.technologies.includes(tech.value)) &&
        (!q ||
          normalize(
            [t(demo.label), demo.id, ...demo.technologies].join(" "),
          ).includes(q));
      button.hidden = !match;
      if (match) count++;
    }
    document.getElementById("demoCount").textContent =
      `${count} ${t(["ejemplos", "examples"])}`;
    document.getElementById("noDemos").hidden = count !== 0;
  }
  function open(id, { focus = false, historyMode = "push" } = {}) {
    const demo = demos.find((d) => d.id === id);
    if (!demo || active === id) return;
    controller?.destroy();
    active = id;
    stage.replaceChildren();
    select.value = id;
    buttons.forEach(({ demo: d, button }) =>
      button.setAttribute("aria-current", String(d.id === id)),
    );
    const head = node("header", "lab-demo-heading"),
      title = node("h2", null, t(demo.label));
    title.id = "demo-title";
    title.tabIndex = -1;
    head.append(title, node("p", null, t(demo.summary)));
    const tags = node("ul", "lab-tech-tags");
    demo.technologies.forEach((name) => tags.append(node("li", null, name)));
    head.append(
      node(
        "span",
        "lab-tech-label",
        t(["Tecnologías representadas", "Technologies illustrated"]),
      ),
      tags,
    );
    stage.append(head);
    const host = node("div", "lab-example-host");
    host.dataset.demo = id;
    stage.append(host);
    controller = window.AutoLabPlayer.mount(host, {
      demo,
      language,
      onComplete() {
        if (!tour.checked) return false;
        if (
          stage.contains(document.activeElement) &&
          document.activeElement.matches("button, a, summary, input, select")
        ) {
          tour.checked = false;
          return false;
        }
        const next =
          (demos.findIndex((d) => d.id === active) + 1) % demos.length;
        open(demos[next].id, { historyMode: "replace" });
        return true;
      },
    });
    const details = node("details", "lab-explanation");
    details.append(
      node(
        "summary",
        null,
        t(["Sobre esta demostración", "About this demonstration"]),
      ),
      node(
        "p",
        null,
        t([
          "Los datos y las acciones están preparados para explicar el proceso. Las pantallas representan el papel de cada tecnología; no son aplicaciones conectadas a tu entorno.",
          "The data and actions are prepared to explain the process. Screens illustrate each technology's role; they are not apps connected to your environment.",
        ]),
      ),
    );
    if (id === "canal" || id === "torre" || id === "pedido-whatsapp")
      details.append(
        node(
          "p",
          null,
          t([
            "Las respuestas están guionizadas. No se llama a un modelo de IA.",
            "Responses are scripted. No AI model is called.",
          ]),
        ),
      );
    if (id === "reloj") {
      const a = node(
        "a",
        null,
        t(["Ver el caso de consolidación", "View the consolidation case"]),
      );
      a.href = `/${en ? "en/" : ""}proyectos/consolidacion-datos/`;
      details.append(a);
    }
    stage.append(details);
    if (historyMode !== "none" && location.hash !== `#${id}`)
      history[historyMode === "replace" ? "replaceState" : "pushState"](
        null,
        "",
        `#${id}`,
      );
    if (focus) {
      if (mobile.matches) picker.open = false;
      title.focus({ preventScroll: true });
      document
        .getElementById("escenario")
        .scrollIntoView({ behavior: "instant", block: "start" });
    }
  }
  [...new Set(demos.flatMap((d) => d.technologies))]
    .sort((a, b) => a.localeCompare(b))
    .forEach((name) => {
      const o = node("option", null, name);
      o.value = name;
      tech.append(o);
    });
  Object.entries(words).forEach(([key, label]) => {
    const b = node("button", null, label);
    b.type = "button";
    b.setAttribute("aria-pressed", String(key === family));
    b.addEventListener("click", () => {
      family = key;
      document
        .querySelectorAll("#familyFilters button")
        .forEach((n) => n.setAttribute("aria-pressed", String(n === b)));
      filter();
    });
    document.getElementById("familyFilters").append(b);
  });
  demos.forEach((demo) => {
    const b = node("button", "lab-demo-choice");
    b.type = "button";
    b.dataset.id = demo.id;
    const icon = node(
      "span",
      `lab-mini-icon ${demo.family}`,
      demo.technologies[0]
        .split(" ")
        .map((x) => x[0])
        .join("")
        .slice(0, 3),
    );
    icon.setAttribute("aria-hidden", "true");
    const copy = node("span");
    copy.append(
      node("strong", null, t(demo.label)),
      node("small", null, demo.technologies.slice(0, 2).join(" · ")),
    );
    b.append(icon, copy);
    b.addEventListener("click", () => open(demo.id, { focus: true }));
    buttons.push({ demo, button: b });
    list.append(b);
    const o = node("option", null, t(demo.label));
    o.value = demo.id;
    select.append(o);
  });
  search.addEventListener("input", filter);
  tech.addEventListener("change", filter);
  select.addEventListener("change", () => open(select.value, { focus: true }));
  document.querySelectorAll('.lab-intro-flow a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      open(a.hash.slice(1), { focus: true });
    }),
  );
  const hash = () => {
    let id;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    if (!id) open(demos[0].id, { historyMode: "none" });
    else if (demos.some((d) => d.id === id))
      open(id, { focus: true, historyMode: "none" });
  };
  addEventListener("popstate", hash);
  addEventListener("hashchange", hash);
  addEventListener("pagehide", () => controller?.destroy());
  addEventListener("pageshow", (event) => {
    if (event.persisted) {
      const id = active;
      active = "";
      open(id, { historyMode: "none" });
    }
  });
  const setPicker = () => {
    picker.open = !mobile.matches;
    picker.dataset.ready = "true";
  };
  mobile.addEventListener("change", setPicker);
  setPicker();
  document.querySelectorAll(".lab-languages a").forEach((a) =>
    a.addEventListener("click", () => {
      a.hash = active;
    }),
  );
  const initial = location.hash.slice(1);
  open(demos.some((d) => d.id === initial) ? initial : demos[0].id, {
    historyMode: "none",
  });
  filter();
  if (demos.some((d) => d.id === initial))
    requestAnimationFrame(() =>
      document
        .getElementById("escenario")
        .scrollIntoView({ behavior: "instant", block: "start" }),
    );
})();
