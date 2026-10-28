/* Visual catalogue: bilingual navigation, filtering and disposable examples. */
(() => {
  "use strict";
  const lab = window.LAB;
  if (!lab) return;
  const en = document.documentElement.lang === "en";
  const words = en
    ? {
        all: "All",
        microsoft: "Microsoft",
        data: "Data",
        ai: "AI & agents",
        web: "Development",
        tech: "Technologies illustrated",
        details: "How this example works",
        reset: "Example reset",
        empty: "No matches",
        result: "examples",
        source: "View source",
        local:
          "The example runs locally in your browser. Its records and actions are simulated.",
      }
    : {
        all: "Todas",
        microsoft: "Microsoft",
        data: "Datos",
        ai: "IA y agentes",
        web: "Desarrollo",
        tech: "Tecnologías representadas",
        details: "Cómo funciona este ejemplo",
        reset: "Ejemplo reiniciado",
        empty: "Sin coincidencias",
        result: "ejemplos",
        source: "Ver código",
        local:
          "El ejemplo se ejecuta en tu navegador. Sus registros y acciones son simulados.",
      };
  const definitions = [
    [
      "power-apps",
      "Solicitudes de equipo",
      "Equipment requests",
      "Crea una solicitud y sigue su aprobación.",
      "Create a request and follow its approval.",
      "microsoft",
      ["Power Apps", "Dataverse", "Power Automate"],
      "AP",
    ],
    [
      "power-automate",
      "Flujo de aprobación",
      "Approval workflow",
      "Cambia el importe y observa la ruta del flujo.",
      "Change the amount and follow the workflow.",
      "microsoft",
      ["Power Automate", "SharePoint"],
      "PA",
    ],
    [
      "power-bi",
      "Tablero de ventas",
      "Sales dashboard",
      "Filtra los datos y compara el resultado.",
      "Filter the data and compare the result.",
      "data",
      ["Power BI", "SQL Server", "Python"],
      "BI",
    ],
    [
      "pulso",
      "Supervisión de flujos",
      "Workflow monitoring",
      "Provoca un fallo y decide cómo recuperarlo.",
      "Trigger a failure and choose how to recover.",
      "microsoft",
      ["Power Automate", "Azure", "Python"],
      "PU",
    ],
    [
      "canal",
      "Preguntas con evidencia",
      "Questions with evidence",
      "Consulta los datos y comprueba los permisos.",
      "Query the data and check permissions.",
      "ai",
      ["Copilot Studio", "Dataverse", "LangChain · RAG"],
      "CA",
    ],
    [
      "reloj",
      "Consolidación de datos",
      "Data consolidation",
      "Une cuatro fuentes y decide qué publicar.",
      "Combine four sources and decide what to publish.",
      "data",
      ["Power BI", "SQL Server", "SharePoint", "Python"],
      "RE",
    ],
    [
      "integraciones",
      "Un pedido, varios sistemas",
      "One order, several systems",
      "Envía un pedido de prueba sin duplicarlo.",
      "Send a sample order without duplicating it.",
      "web",
      [
        "React · Next.js",
        "TypeScript",
        "FastAPI",
        "NestJS · Node",
        "PostgreSQL",
        "n8n",
      ],
      "API",
    ],
    [
      "despliegue",
      "Publicación con controles",
      "Deployment with checks",
      "Prueba, publica y revierte una versión simulada.",
      "Test, release and roll back a simulated version.",
      "web",
      ["GitHub Actions", "Docker", "Azure", "Cloudflare"],
      "CI",
    ],
    [
      "prisma",
      "De archivo a tablero",
      "From file to dashboard",
      "Prueba el archivo de ejemplo o carga un CSV.",
      "Try the sample file or upload a CSV.",
      "data",
      ["Excel", "Power BI", "Python"],
      "XL",
    ],
    [
      "orquesta",
      "Quién aprueba una compra",
      "Who approves a purchase",
      "Cambia el monto y revisa la cadena de firmas.",
      "Change the amount and inspect the approval chain.",
      "microsoft",
      ["Power Automate", "Power Apps", "Dataverse"],
      "OR",
    ],
    [
      "centinela",
      "Revisar una factura",
      "Check an invoice",
      "Ajusta la tolerancia y detecta diferencias.",
      "Adjust tolerance and find discrepancies.",
      "microsoft",
      ["Power Automate", "SQL Server"],
      "CE",
    ],
    [
      "relevo",
      "Alta de un colaborador",
      "Employee onboarding",
      "Explora las tareas y sus dependencias.",
      "Explore the tasks and their dependencies.",
      "microsoft",
      ["Power Automate", "Microsoft 365"],
      "AL",
    ],
    [
      "boveda",
      "Captura documental",
      "Document capture",
      "Decide qué campos requieren revisión.",
      "Choose which fields need a review.",
      "ai",
      ["IA documental", "Power Apps", "Python"],
      "DO",
    ],
    [
      "cartero",
      "Entrega de reportes",
      "Report delivery",
      "Simula un fallo y sigue los reintentos.",
      "Simulate a failure and follow the retries.",
      "microsoft",
      ["Power Automate", "Microsoft 365"],
      "CO",
    ],
    [
      "oraculo",
      "Pronóstico de ventas",
      "Sales forecast",
      "Cambia el horizonte y observa la incertidumbre.",
      "Change the horizon and observe uncertainty.",
      "data",
      ["Python", "Power BI"],
      "PR",
    ],
    [
      "escudo",
      "Calidad de los datos",
      "Data quality",
      "Activa reglas y detecta registros inválidos.",
      "Enable rules and detect invalid records.",
      "data",
      ["Python", "SQL Server", "PostgreSQL"],
      "DQ",
    ],
    [
      "torre",
      "Clasificar solicitudes",
      "Classify requests",
      "Escribe una solicitud y revisa su clasificación.",
      "Write a request and review its classification.",
      "ai",
      ["Copilot Studio", "Dataverse"],
      "CL",
    ],
    [
      "ruta",
      "Planificar una ruta",
      "Plan a route",
      "Cambia las paradas y prueba el modo sin conexión.",
      "Change the stops and try offline mode.",
      "web",
      ["React · Next.js", "PostgreSQL", "APIs"],
      "RU",
    ],
  ];
  const systems = definitions
    .map((row) => ({
      ...lab.systems.find((s) => s.id === row[0]),
      id: row[0],
      label: row[en ? 2 : 1],
      summary: row[en ? 4 : 3],
      group: row[5],
      technologies: row[6],
      icon: row[7],
    }))
    .filter((s) => typeof s.render === "function");
  const node = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const stage = document.getElementById("stage");
  const list = document.getElementById("demoList");
  const search = document.getElementById("demoSearch");
  const tech = document.getElementById("technologyFilter");
  const select = document.getElementById("demoSelect");
  const picker = document.querySelector(".lab-picker");
  const mobile = matchMedia("(max-width: 900px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let family = "all",
    active = "",
    cleanup = null;
  const buttons = [];
  const normalized = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function filter() {
    const q = normalized(search.value.trim());
    let count = 0;
    for (const { sys, button } of buttons) {
      const matches =
        (family === "all" || sys.group === family) &&
        (!tech.value || sys.technologies.includes(tech.value)) &&
        (!q ||
          normalized(
            [sys.label, sys.id, ...sys.technologies].join(" "),
          ).includes(q));
      button.hidden = !matches;
      if (matches) count++;
    }
    document.getElementById("demoCount").textContent =
      `${count} ${words.result}`;
    document.getElementById("noDemos").hidden = count !== 0;
  }
  function teardown() {
    if (typeof cleanup === "function") cleanup();
    cleanup = null;
    if (window.Chart)
      Object.values(window.Chart.instances || {}).forEach((c) => {
        if (stage.contains(c.canvas)) lab.killChart(c);
      });
    lab.disposeCharts();
  }
  function open(
    id,
    { focus = false, reset = false, historyMode = "push" } = {},
  ) {
    const sys = systems.find((s) => s.id === id);
    if (!sys) return;
    if (active === id && !reset) {
      if (focus) document.getElementById("demo-title")?.focus();
      return;
    }
    teardown();
    active = id;
    stage.replaceChildren();
    for (const entry of buttons)
      entry.button.setAttribute("aria-current", String(entry.sys.id === id));
    select.value = id;
    const head = node("header", "lab-demo-heading");
    const title = node("h2", null, sys.label);
    title.id = "demo-title";
    title.tabIndex = -1;
    head.append(title, node("p", null, sys.summary));
    const tags = node("ul", "lab-tech-tags");
    tags.setAttribute("aria-label", words.tech);
    sys.technologies.forEach((t) => tags.append(node("li", null, t)));
    head.append(node("span", "lab-tech-label", words.tech), tags);
    stage.append(head);
    const host = node("div", "lab-example-host");
    host.dataset.demo = id;
    stage.append(host);
    try {
      cleanup = sys.render(host, lab.kit);
    } catch (error) {
      host.replaceChildren(
        node(
          "p",
          "lab-load-error",
          en
            ? "This example could not load. Try another example."
            : "No se pudo cargar este ejemplo. Prueba otra demostración.",
        ),
      );
      console.error("Laboratory example failed", id, error);
    }
    const details = node("details", "lab-explanation");
    details.append(node("summary", null, words.details));
    const body = node("div", null);
    body.append(node("p", null, words.local));
    const techCopy = node(
      "p",
      null,
      `${words.tech}: ${sys.technologies.join(", ")}.`,
    );
    body.append(techCopy);
    if (id === "canal" || id === "torre")
      body.append(
        node(
          "p",
          null,
          en
            ? "Responses are selected with local example rules. No language model is called."
            : "Las respuestas se seleccionan con reglas locales del ejemplo. No se consulta un modelo de lenguaje.",
        ),
      );
    if (id === "prisma")
      body.append(
        node(
          "p",
          null,
          en
            ? "Excel or CSV with a header row. First sheet only; up to 10 MB and 10,000 data rows. Your file stays in this browser."
            : "Excel o CSV con encabezados. Primera hoja; hasta 10 MB y 10.000 filas. Tu archivo permanece en este navegador.",
        ),
      );
    if (id === "reloj") {
      const a = node(
        "a",
        null,
        en ? "Explore the illustrated case" : "Explorar el caso ilustrado",
      );
      a.href = `/${en ? "en/" : ""}proyectos/consolidacion-datos/`;
      body.append(a);
    }
    const sources = {
      "power-apps":
        "https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started",
      "power-automate":
        "https://learn.microsoft.com/en-us/power-automate/get-started-approvals",
      "power-bi":
        "https://learn.microsoft.com/en-us/power-bi/explore-reports/end-user-interactions",
    };
    if (sources[id]) {
      const a = node(
        "a",
        null,
        en
          ? "Official technology documentation"
          : "Documentación oficial de la tecnología",
      );
      a.href = sources[id];
      a.target = "_blank";
      a.rel = "noopener";
      body.append(a);
    }
    details.append(body);
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
      document.getElementById("escenario").scrollIntoView({
        behavior: reduced.matches ? "instant" : "smooth",
        block: "start",
      });
    }
  }
  const technologies = [
    ...new Set(systems.flatMap((s) => s.technologies)),
  ].sort((a, b) => a.localeCompare(b));
  technologies.forEach((t) => {
    const option = node("option", null, t);
    option.value = t;
    tech.append(option);
  });
  for (const key of ["all", "microsoft", "data", "ai", "web"]) {
    const b = node("button", null, words[key]);
    b.type = "button";
    b.setAttribute("aria-pressed", String(key === "all"));
    b.addEventListener("click", () => {
      family = key;
      document
        .querySelectorAll("#familyFilters button")
        .forEach((n) => n.setAttribute("aria-pressed", String(n === b)));
      filter();
    });
    document.getElementById("familyFilters").append(b);
  }
  for (const sys of systems) {
    const button = node("button", "lab-demo-choice");
    button.type = "button";
    button.dataset.id = sys.id;
    const icon = node("span", `lab-mini-icon ${sys.group}`, sys.icon);
    icon.setAttribute("aria-hidden", "true");
    const text = node("span");
    text.append(
      node("strong", null, sys.label),
      node("small", null, sys.technologies.slice(0, 2).join(" · ")),
    );
    button.append(icon, text);
    button.addEventListener("click", () => open(sys.id, { focus: true }));
    buttons.push({ sys, button });
    list.append(button);
    const option = node("option", null, sys.label);
    option.value = sys.id;
    select.append(option);
  }
  search.addEventListener("input", filter);
  tech.addEventListener("change", filter);
  select.addEventListener("change", () => open(select.value, { focus: true }));
  document
    .getElementById("resetDemo")
    .addEventListener("click", () =>
      open(active, { focus: true, reset: true, historyMode: "none" }),
    );
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
    if (!id && systems.length) open(systems[0].id, { historyMode: "none" });
    else if (systems.some((s) => s.id === id))
      open(id, { focus: true, historyMode: "none" });
  };
  addEventListener("popstate", hash);
  addEventListener("hashchange", hash);
  const setPicker = () => {
    picker.open = !mobile.matches;
  };
  mobile.addEventListener("change", setPicker);
  setPicker();
  picker.dataset.ready = "true";
  document.querySelectorAll(".lab-languages a").forEach((a) => {
    a.addEventListener("click", () => {
      a.hash = active;
    });
  });
  reduced.addEventListener("change", () => {
    lab.reduce = reduced.matches;
    lab.kit.reduce = reduced.matches;
  });
  const initial = location.hash.slice(1);
  open(systems.some((s) => s.id === initial) ? initial : systems[0]?.id, {
    historyMode: "none",
  });
  filter();
  if (initial && systems.some((s) => s.id === initial))
    requestAnimationFrame(() =>
      document
        .getElementById("escenario")
        .scrollIntoView({ behavior: "instant", block: "start" }),
    );
  document.querySelectorAll(".rv").forEach((el) => el.classList.add("in"));
})();
