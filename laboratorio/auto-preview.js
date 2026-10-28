/* Read-only application views for the automatic laboratory stories. */
(() => {
  "use strict";

  const kinds = new Set([
    "app",
    "dashboard",
    "messages",
    "document",
    "records",
    "deployment",
    "monitor",
  ]);
  const paths = {
    app: ["M4 5h7v7H4z", "M14 5h6v7h-6z", "M4 15h7v5H4z", "M14 15h6v5h-6z"],
    dashboard: ["M4 20V11h4v9z", "M10 20V4h4v16z", "M16 20V8h4v12z"],
    messages: ["M4 5h16v12H9l-5 3z", "M8 9h8", "M8 13h5"],
    document: ["M6 3h8l4 4v14H6z", "M14 3v5h4", "M9 12h6", "M9 16h6"],
    records: ["M4 5h16v15H4z", "M4 10h16", "M9 10v10", "M4 15h16"],
    deployment: [
      "M5 6h14v12H5z",
      "M9 10l-2 2 2 2",
      "M15 10l2 2-2 2",
      "M13 9l-2 6",
    ],
    monitor: ["M3 6h18v13H3z", "M7 14l3-4 3 5 4-6", "M9 22h6"],
    check: ["M5 12l4 4L19 6"],
    grid: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
    list: [
      "M8 6h12",
      "M8 12h12",
      "M8 18h12",
      "M4 6h.01",
      "M4 12h.01",
      "M4 18h.01",
    ],
    arrow: ["M5 12h14", "M14 7l5 5-5 5"],
  };

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.65");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    for (const d of paths[name] || paths.records) {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", d);
      svg.append(path);
    }
    return svg;
  }

  function localize(value, language) {
    if (Array.isArray(value))
      return String(value[language === "en" ? 1 : 0] ?? value[0] ?? "");
    return value === null || value === undefined ? "" : String(value);
  }

  function tone(value) {
    const text = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (
      /error|bloque|fall|rechaz|failed|blocked|reject|deten|stopped/.test(text)
    )
      return "error";
    if (
      /pendiente|pending|revisi|review|espera|waiting|aviso|warning|validando|checking/.test(
        text,
      )
    )
      return "pending";
    return "neutral";
  }

  function status(text, className = "avp-status") {
    const element = node("span", className, text);
    element.dataset.tone = tone(text);
    return element;
  }

  function addFields(body, view, t, word) {
    if (!view.fields?.length) return;
    const list = node("dl", "avp-fields");
    list.setAttribute(
      "aria-label",
      word("Campos del ejemplo", "Sample fields"),
    );
    view.fields.forEach((field) => {
      const group = node("div", "avp-field");
      if (field.highlight) group.classList.add("avp-field-highlight");
      const value = t(field.value);
      group.append(
        node("dt", null, t(field.label)),
        node(
          "dd",
          value ? "avp-field-value" : "avp-field-value avp-field-empty",
          value || "—",
        ),
      );
      list.append(group);
    });
    body.append(list);
  }

  function addMetrics(body, view, t, word) {
    if (!view.metrics?.length) return;
    const list = node("dl", "avp-metrics");
    list.setAttribute(
      "aria-label",
      word("Indicadores del ejemplo", "Sample metrics"),
    );
    view.metrics.forEach((metric) => {
      const group = node("div", "avp-metric");
      group.append(
        node("dt", null, t(metric.label)),
        node("dd", null, t(metric.value) || "—"),
      );
      list.append(group);
    });
    body.append(list);
  }

  function addBars(body, view, t, word) {
    if (!view.bars?.length) return;
    const chart = node("figure", "avp-chart");
    chart.append(
      node(
        "figcaption",
        null,
        word("Distribución del ejemplo", "Sample breakdown"),
      ),
    );
    const max = Math.max(
      1,
      ...view.bars.map((bar) =>
        Number.isFinite(bar.value) ? Math.max(0, bar.value) : 0,
      ),
    );
    const list = node("ul", "avp-bar-list");
    view.bars.forEach((bar) => {
      const row = node("li", "avp-bar-row");
      const value = Number.isFinite(bar.value) ? bar.value : 0;
      const label = node("div", "avp-bar-label");
      label.append(
        node("span", null, t(bar.label)),
        node("strong", null, value.toLocaleString(t(["es-SV", "en-US"]))),
      );
      const track = node("div", "avp-bar-track");
      track.setAttribute("aria-hidden", "true");
      const fill = node("span", "avp-bar-fill");
      fill.style.width = `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
      track.append(fill);
      row.append(label, track);
      list.append(row);
    });
    chart.append(list);
    body.append(chart);
  }

  function addRows(body, view, t, word) {
    if (!view.rows?.length) return;
    const section = node("section", "avp-records");
    section.setAttribute(
      "aria-label",
      word("Registros del ejemplo", "Sample records"),
    );
    const head = node("div", "avp-records-head");
    head.append(
      icon("list"),
      node("span", null, word("Registros", "Records")),
      node("small", null, String(view.rows.length)),
    );
    const list = node("ul", "avp-record-list");
    view.rows.forEach((row) => {
      const item = node("li", "avp-record");
      const main = node("div", "avp-record-main");
      main.append(node("strong", null, t(row.label)));
      if (t(row.value)) main.append(node("span", null, t(row.value)));
      item.append(main);
      if (t(row.status))
        item.append(status(t(row.status), "avp-record-status"));
      list.append(item);
    });
    section.append(head, list);
    body.append(section);
  }

  function addMessages(body, view, t, word) {
    if (!view.messages?.length) return;
    const list = node("ol", "avp-messages");
    list.setAttribute(
      "aria-label",
      word("Conversación de ejemplo", "Sample conversation"),
    );
    view.messages.forEach((message) => {
      const item = node(
        "li",
        `avp-message avp-message-${message.from === "out" ? "out" : "in"}`,
      );
      item.append(
        node(
          "span",
          "avp-message-origin",
          message.from === "out"
            ? word("Respuesta", "Reply")
            : word("Entrada", "Incoming"),
        ),
        node("p", null, t(message.text)),
      );
      list.append(item);
    });
    body.append(list);
  }

  function render(host, view = {}, language = "es") {
    if (!host || host.nodeType !== 1)
      throw new TypeError("A preview host element is required.");
    const t = (value) => localize(value, language);
    const word = (es, en) => (language === "en" ? en : es);
    const kind = kinds.has(view.kind) ? view.kind : "records";
    const root = node("section", `avp-root avp-${kind}`);
    root.dataset.kind = kind;
    root.setAttribute(
      "aria-label",
      word("Vista simulada de la aplicación", "Simulated application view"),
    );
    const shell = node("div", "avp-window");
    const header = node("header", "avp-header");
    const brand = node("span", "avp-brand-icon");
    brand.append(icon(kind));
    const title = node("div", "avp-title");
    title.append(
      node("span", "avp-overline", word("Vista de ejemplo", "Sample view")),
      node("h3", null, t(view.title) || word("Aplicación", "Application")),
    );
    header.append(brand, title);
    const dots = node("span", "avp-window-dots");
    dots.setAttribute("aria-hidden", "true");
    dots.append(node("i"), node("i"), node("i"));
    header.append(dots);
    shell.append(header);

    const workspace = node("div", "avp-workspace");
    if (kind === "app") {
      const rail = node("div", "avp-app-rail");
      rail.setAttribute("aria-hidden", "true");
      ["grid", "document", "list"].forEach((name, index) => {
        const marker = node(
          "span",
          index === 1 ? "avp-rail-item avp-rail-current" : "avp-rail-item",
        );
        marker.append(icon(name));
        rail.append(marker);
      });
      workspace.append(rail);
    }
    const body = node("div", "avp-body");
    const context = node("div", "avp-context");
    if (t(view.subtitle))
      context.append(node("p", "avp-subtitle", t(view.subtitle)));
    if (t(view.status)) context.append(status(t(view.status)));
    if (context.childNodes.length) body.append(context);

    if (kind === "document") {
      const documentTop = node("div", "avp-document-heading");
      documentTop.append(
        icon("document"),
        node("span", null, word("Documento de ejemplo", "Sample document")),
      );
      body.append(documentTop);
    }
    if (kind === "dashboard" || kind === "monitor" || kind === "deployment")
      addMetrics(body, view, t, word);
    addFields(body, view, t, word);
    addMessages(body, view, t, word);
    addBars(body, view, t, word);
    addRows(body, view, t, word);
    if (kind !== "dashboard" && kind !== "monitor" && kind !== "deployment")
      addMetrics(body, view, t, word);
    if (
      !view.fields?.length &&
      !view.rows?.length &&
      !view.metrics?.length &&
      !view.messages?.length &&
      !view.bars?.length
    ) {
      const empty = node("div", "avp-empty");
      empty.append(
        icon(kind),
        node(
          "p",
          null,
          word(
            "Los datos aparecen mientras avanza el proceso.",
            "Data appears as the process advances.",
          ),
        ),
      );
      body.append(empty);
    }
    if (t(view.action)) {
      const action = node("div", "avp-action");
      action.append(icon("arrow"), node("span", null, t(view.action)));
      body.append(action);
    }
    workspace.append(body);
    shell.append(workspace);
    const footer = node("footer", "avp-footer");
    footer.append(
      node("span", "avp-sample-dot"),
      node(
        "span",
        null,
        word(
          "Datos de ejemplo · Vista automática",
          "Sample data · Automatic view",
        ),
      ),
    );
    shell.append(footer);
    root.append(shell);
    host.replaceChildren(root);
    return () => {
      if (root.parentNode === host) root.remove();
    };
  }

  window.AutoLabPreview = { render };
})();
