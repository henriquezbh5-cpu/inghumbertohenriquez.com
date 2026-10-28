/* Deterministic sample data. Technology labels describe roles, not live integrations. */
(() => {
  "use strict";
  const sources = [
    {
      id: "sql",
      name: "SQL Server",
      age: 1,
      rows: [
        { id: "A001", region: "north", amount: 1200 },
        { id: "A002", region: "south", amount: 800 },
        { id: "A003", region: "west", amount: 600 },
      ],
    },
    {
      id: "sp",
      name: "SharePoint",
      age: 2,
      rows: [
        { id: "B001", region: "north", amount: 400 },
        { id: "B002", region: "south", amount: 500 },
        { id: "A002", region: "south", amount: 800 },
      ],
    },
    {
      id: "api",
      name: "API",
      age: 1,
      rows: [
        { id: "C001", region: "north", amount: 450 },
        { id: "C002", region: "west", amount: 750 },
      ],
    },
    {
      id: "excel",
      name: "Excel",
      age: 3,
      rows: [
        { id: "D001", region: "west", amount: 300 },
        { id: "D002", region: "south", amount: 200 },
      ],
    },
  ];

  function calculate(scenario, policy) {
    if (
      !["current", "stale", "offline"].includes(scenario) ||
      !["stop", "warn"].includes(policy)
    ) {
      throw new RangeError(
        "Unknown consolidation scenario or publication policy.",
      );
    }
    const states = sources.map((source) => {
      const offline = scenario === "offline" && source.id === "api";
      const age =
        scenario === "stale" && source.id === "excel" ? 36 : source.age;
      return {
        ...source,
        age,
        state: offline ? "offline" : age > 24 ? "stale" : "current",
        rows: offline ? [] : source.rows.map((row) => ({ ...row })),
      };
    });
    const readRows = states.flatMap((source) => source.rows);
    const unique = new Map();
    for (const row of readRows)
      if (!unique.has(row.id)) unique.set(row.id, row);
    const rows = [...unique.values()];
    const issues = states.filter((source) => source.state !== "current");
    const blocked = issues.length > 0 && policy === "stop";
    const regions = { north: 0, south: 0, west: 0 };
    for (const row of rows) regions[row.region] += row.amount;
    return {
      scenario,
      policy,
      sources: states,
      issues,
      state: blocked ? "blocked" : issues.length ? "warning" : "published",
      readCount: readRows.length,
      duplicates: readRows.length - rows.length,
      uniqueCount: rows.length,
      publishedCount: blocked ? 0 : rows.length,
      amount: blocked
        ? null
        : rows.reduce((total, row) => total + row.amount, 0),
      regions: blocked ? { north: 0, south: 0, west: 0 } : regions,
    };
  }

  // The pure calculation can also be checked in Node without a browser or network.
  if (typeof module !== "undefined" && module.exports)
    module.exports = { calculate };
  if (typeof window !== "undefined") {
    window.ConsolidationModel = Object.freeze({ run: calculate });
  }
  if (typeof document === "undefined") return;
  const root = document.getElementById("consolidationDemo");
  if (!root) return;
  const english = document.documentElement.lang === "en";
  const copy = english
    ? {
        current: "Up to date",
        stale: "36 h old",
        offline: "Unavailable",
        noResponse: "No response",
        age: (age) => `${age} h since update`,
        ready: "Ready to consolidate",
        readyDescription: "Choose a scenario, then select Consolidate data.",
        published: "Published in the demo",
        publishedDescription:
          "All sources are up to date. One duplicate was removed before calculating the total.",
        blocked: "Publication stopped",
        staleBlocked:
          "Excel is more than 24 hours old. Update it, or choose Publish with a warning.",
        offlineBlocked:
          "The API is unavailable. Restore it, or choose Publish with a warning.",
        warning: "Published with a warning",
        staleWarning:
          "The total includes two outdated Excel records. The warning stays with the result.",
        offlineWarning:
          "Partial result: the two API records are excluded. Their amounts are not estimated.",
        rule: "The freshness limit in this example is 24 hours.",
        waiting: "Waiting",
        done: "Done",
        stopped: "Stopped",
        withWarning: "With warning",
        read: (count) => `${count} rows collected`,
        combined: (count) => `${count} unique records`,
        sourceTrace: (name, count) => `${name}: ${count} sample rows read.`,
        staleTrace: "Excel: 2 rows included from a 36-hour-old sample.",
        offlineTrace:
          "API: no rows received; the missing amounts are not estimated.",
        duplicateTrace: (count) => `${count} duplicate removed by record ID.`,
        blockedTrace:
          "Validation stopped publication. No amount was published.",
        publishedTrace: (count, amount) =>
          `${count} records published in this demo. Total: ${amount}.`,
        warningTrace:
          "The result retains a visible warning about the affected source.",
      }
    : {
        current: "Al día",
        stale: "Atrasado · 36 h",
        offline: "Sin respuesta",
        noResponse: "Sin respuesta",
        age: (age) => `${age} h desde actualización`,
        ready: "Listo para consolidar",
        readyDescription: "Elige un escenario y pulsa Consolidar datos.",
        published: "Publicado en la demo",
        publishedDescription:
          "Todas las fuentes están al día. Se eliminó un duplicado antes de calcular el total.",
        blocked: "Publicación detenida",
        staleBlocked:
          "Excel supera el límite de 24 horas. Actualízalo o elige Publicar con aviso.",
        offlineBlocked:
          "La API no responde. Recupérala o elige Publicar con aviso.",
        warning: "Publicado con aviso",
        staleWarning:
          "El total incluye dos registros atrasados de Excel. El aviso acompaña al resultado.",
        offlineWarning:
          "Resultado parcial: se excluyen los dos registros de la API. Sus importes no se estiman.",
        rule: "El límite de frescura en este ejemplo es de 24 horas.",
        waiting: "Pendiente",
        done: "Hecho",
        stopped: "Detenido",
        withWarning: "Con aviso",
        read: (count) => `${count} filas recogidas`,
        combined: (count) => `${count} registros únicos`,
        sourceTrace: (name, count) =>
          `${name}: ${count} filas de ejemplo leídas.`,
        staleTrace:
          "Excel: 2 filas incluidas de una muestra con 36 horas de antigüedad.",
        offlineTrace:
          "API: no se recibieron filas; los importes ausentes no se estiman.",
        duplicateTrace: (count) =>
          `${count} duplicado eliminado por identificador de registro.`,
        blockedTrace:
          "La validación detuvo la publicación. No se publicó ningún importe.",
        publishedTrace: (count, amount) =>
          `${count} registros publicados en esta demo. Total: ${amount}.`,
        warningTrace:
          "El resultado conserva un aviso visible sobre la fuente afectada.",
      };
  const form = document.getElementById("consolidationForm");
  const policy = document.getElementById("publicationPolicy");
  const runButton = document.getElementById("consolidateButton");
  const resetButton = document.getElementById("consolidationReset");
  const status = document.getElementById("consolidationStatus");
  const trace = document.getElementById("consolidationTrace");
  const number = new Intl.NumberFormat(english ? "en-US" : "es-SV", {
    maximumFractionDigits: 0,
  });
  const money = (value) => "$" + number.format(value);
  const selected = () => calculate(form.elements.scenario.value, policy.value);

  function updateSources(result) {
    for (const source of result.sources) {
      const card = root.querySelector(`[data-source="${source.id}"]`);
      card.dataset.state = source.state;
      card.querySelector("[data-source-status]").textContent =
        copy[source.state];
      card.querySelector("[data-source-rows]").textContent = source.rows.length;
      card.querySelector("[data-source-age]").textContent =
        source.state === "offline" ? copy.noResponse : copy.age(source.age);
    }
  }
  function updateStatus(state, title, description) {
    status.dataset.state = state;
    status.querySelector("strong").textContent = title;
    status.querySelector("p").textContent = description;
  }
  function updateStep(id, state, label) {
    const step = root.querySelector(`[data-step="${id}"]`);
    step.dataset.state = state;
    step.querySelector("[data-step-status]").textContent = label;
  }
  function updateChart(result) {
    const max = Math.max(...Object.values(result?.regions || {}), 1);
    for (const region of ["north", "south", "west"]) {
      const value = result?.regions[region] || 0;
      root
        .querySelector(`[data-bar="${region}"]`)
        .style.setProperty("--amount", `${(value / max) * 100}%`);
      root.querySelector(`[data-region="${region}"]`).textContent =
        !result || result.state === "blocked" ? "—" : money(value);
    }
  }
  function setTrace(lines) {
    trace.replaceChildren(
      ...lines.map((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        return item;
      }),
    );
  }
  function preview() {
    updateSources(selected());
    updateStatus("ready", copy.ready, copy.readyDescription);
    for (const step of ["collect", "prepare", "validate"])
      updateStep(step, "waiting", copy.waiting);
    for (const id of [
      "consolidationAmount",
      "consolidationRecords",
      "consolidationDuplicates",
    ])
      document.getElementById(id).textContent = "—";
    updateChart(null);
    setTrace([copy.readyDescription]);
  }
  form.addEventListener("change", preview);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = selected();
    updateSources(result);
    const description =
      result.state === "published"
        ? copy.publishedDescription
        : result.state === "blocked"
          ? copy[result.scenario + "Blocked"]
          : copy[result.scenario + "Warning"];
    updateStatus(result.state, copy[result.state], description);
    updateStep(
      "collect",
      result.scenario === "offline" ? "warning" : "done",
      copy.read(result.readCount),
    );
    updateStep("prepare", "done", copy.combined(result.uniqueCount));
    updateStep(
      "validate",
      result.state === "blocked"
        ? "blocked"
        : result.state === "warning"
          ? "warning"
          : "done",
      result.state === "blocked"
        ? copy.stopped
        : result.state === "warning"
          ? copy.withWarning
          : copy.done,
    );
    document.getElementById("consolidationAmount").textContent =
      result.amount === null ? "—" : money(result.amount);
    document.getElementById("consolidationRecords").textContent =
      result.publishedCount;
    document.getElementById("consolidationDuplicates").textContent =
      result.duplicates;
    updateChart(result);
    const lines = result.sources.map((source) =>
      source.state === "offline"
        ? copy.offlineTrace
        : source.state === "stale"
          ? copy.staleTrace
          : copy.sourceTrace(source.name, source.rows.length),
    );
    lines.push(copy.duplicateTrace(result.duplicates));
    if (result.state === "blocked") lines.push(copy.blockedTrace);
    else {
      lines.push(
        copy.publishedTrace(result.publishedCount, money(result.amount)),
      );
      if (result.state === "warning") lines.push(copy.warningTrace);
    }
    setTrace(lines);
  });
  form.addEventListener("reset", () => {
    // A native reset applies defaults after this event, so render on the next microtask.
    queueMicrotask(preview);
  });
  document.getElementById("consolidationRule").textContent = copy.rule;
  runButton.disabled = false;
  resetButton.disabled = false;
  preview();
})();
