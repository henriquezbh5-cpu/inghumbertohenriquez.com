/* Visual, bilingual simulations. No product sessions or remote requests are made. */
(() => {
  "use strict";
  const models = window.PlatformLabModels;
  if (!window.LAB || !models) return;
  const en = document.documentElement.lang === "en";
  const t = (es, english) => (en ? english : es);
  const number = (value, digits = 0) =>
    value.toLocaleString(en ? "en-US" : "es-SV", {
      maximumFractionDigits: digits,
    });
  const money = (value) =>
    new Intl.NumberFormat(en ? "en-US" : "es-SV", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  const productNames = {
    laptop: t("Portátil", "Laptop"),
    monitor: "Monitor",
    headset: t("Auriculares", "Headset"),
  };
  const statusNames = {
    pending: t("Por aprobar", "Pending approval"),
    approved: t("Aprobada", "Approved"),
    rejected: t("Rechazada", "Rejected"),
  };
  let instance = 0;
  function node(tag, className = "", text = "") {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== "") element.textContent = text;
    return element;
  }
  function mount(host, name) {
    const abort = new AbortController();
    const root = node("div", "pd-demo");
    root.dataset.demo = name;
    root.dataset.instance = String(++instance);
    host.append(root);
    const on = (target, event, handler) =>
      target.addEventListener(event, handler, { signal: abort.signal });
    return { root, on, cleanup: () => abort.abort() };
  }
  function button(text, action, secondary = false) {
    const element = node(
      "button",
      secondary ? "pd-button pd-secondary" : "pd-button",
      text,
    );
    element.type = "button";
    element.dataset.pdAction = action;
    return element;
  }
  function selectField(root, text, name, options) {
    const wrap = node("label", "pd-field");
    const input = node("select");
    input.name = name;
    input.id = `pd-${instance}-${name}`;
    for (const [value, label] of options) {
      const option = node("option", "", label);
      option.value = value;
      input.append(option);
    }
    wrap.append(node("span", "", text), input);
    root.append(wrap);
    return input;
  }
  function numberField(root, text, name, value, min, max) {
    const wrap = node("label", "pd-field");
    const input = node("input");
    input.type = "number";
    input.name = name;
    input.id = `pd-${instance}-${name}`;
    input.value = String(value);
    input.defaultValue = String(value);
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.required = true;
    wrap.append(node("span", "", text), input);
    root.append(wrap);
    return input;
  }
  function checkField(root, text, name, checked = false) {
    const wrap = node("label", "pd-check");
    const input = node("input");
    input.type = "checkbox";
    input.name = name;
    input.checked = checked;
    input.defaultChecked = checked;
    wrap.append(input, node("span", "", text));
    root.append(wrap);
    return input;
  }
  function panel(title, subtitle = "", className = "") {
    const element = node("section", `pd-panel ${className}`.trim());
    element.append(node("h3", "pd-panel-title", title));
    if (subtitle) element.append(node("p", "pd-hint", subtitle));
    return element;
  }
  function flow(items) {
    const list = node("ol", "pd-flow");
    list.setAttribute("aria-label", t("Pasos del ejemplo", "Example steps"));
    const steps = items.map(([title, subtitle], index) => {
      const step = node("li", "pd-step");
      step.dataset.state = "idle";
      step.append(
        node("span", "pd-step-number", String(index + 1)),
        node("strong", "", title),
        node("small", "", subtitle),
      );
      list.append(step);
      return step;
    });
    return {
      element: list,
      set(states) {
        steps.forEach((step, index) => {
          step.dataset.state = states[index] || "idle";
        });
      },
    };
  }
  function result() {
    const element = node("div", "pd-result");
    element.setAttribute("role", "status");
    element.tabIndex = -1;
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    return {
      element,
      set(title, description, tone = "idle") {
        element.dataset.tone = tone;
        element.replaceChildren(
          node("strong", "", title),
          node("p", "", description),
        );
      },
    };
  }
  function metric(label, value) {
    const box = node("div", "pd-metric");
    box.append(node("strong", "", value), node("span", "", label));
    return box;
  }
  function details(title, description) {
    const element = node("details", "pd-details");
    element.append(node("summary", "", title), node("p", "", description));
    return element;
  }
  function register(definition) {
    window.LAB.register({ intro: "", spec: [], impact: [], ...definition });
  }

  register({
    id: "power-apps",
    name: "Power Apps",
    family: "procesos",
    title: t("De una solicitud a un registro", "From request to record"),
    tagline: t(
      "Crea una solicitud y decide qué ocurre después.",
      "Create a request and decide what happens next.",
    ),
    technologies: ["Power Apps", "Dataverse", "Power Automate"],
    render(host) {
      const { root, on, cleanup } = mount(host, "power-apps");
      let state = models.emptyRequests();
      const path = flow([
        [t("Solicitar", "Request"), "Power Apps"],
        [t("Guardar", "Save"), "Dataverse"],
        [t("Decidir", "Decide"), "Power Automate"],
      ]);
      root.append(path.element);
      const layout = node("div", "pd-app-layout");
      const app = panel(
        t("Solicitud de equipo", "Equipment request"),
        t("Completa la app de ejemplo.", "Complete the sample app."),
        "pd-app-screen",
      );
      app.prepend(node("span", "pd-app-brand", "Power Apps"));
      const form = node("form", "pd-form");
      const product = selectField(
        form,
        t("Equipo", "Equipment"),
        "product",
        Object.entries(productNames),
      );
      const quantity = numberField(
        form,
        t("Unidades", "Units"),
        "quantity",
        1,
        1,
        8,
      );
      const cost = node("p", "pd-cost");
      const updateCost = () => {
        cost.textContent = `${t("Importe del ejemplo", "Sample amount")}: ${money(models.equipment[product.value] * (Number(quantity.value) || 0))}`;
      };
      on(product, "change", updateCost);
      on(quantity, "input", updateCost);
      updateCost();
      const save = button(
        t("Crear solicitud", "Create request"),
        "create-request",
      );
      save.type = "submit";
      form.append(cost, save);
      app.append(form);
      const registry = panel(
        t("Registro de solicitudes", "Request records"),
        t(
          "Cada envío crea una fila en este ejemplo.",
          "Each submission creates a row in this example.",
        ),
        "pd-registry",
      );
      const metrics = node("div", "pd-metrics");
      const records = node("div", "pd-records");
      const feedback = result();
      const reset = button(
        t("Reiniciar ejemplo", "Reset example"),
        "reset",
        true,
      );
      registry.append(metrics, records, feedback.element, reset);
      layout.append(app, registry);
      root.append(
        layout,
        details(
          t("Qué representa", "What this illustrates"),
          t(
            "Una app recoge los datos; Dataverse representa el registro compartido; una aprobación decide el estado. Aquí todo ocurre en la memoria del navegador.",
            "An app collects data; Dataverse represents the shared record; an approval determines the status. Here, everything stays in browser memory.",
          ),
        ),
      );
      function paint() {
        metrics.replaceChildren(
          metric(t("Solicitudes", "Requests"), number(state.records.length)),
          metric(
            t("Aprobadas", "Approved"),
            number(
              state.records.filter((item) => item.status === "approved").length,
            ),
          ),
        );
        records.replaceChildren();
        if (!state.records.length) {
          const empty = node("div", "pd-empty");
          empty.append(
            node(
              "strong",
              "",
              t(
                "Tu primera solicitud aparecerá aquí",
                "Your first request will appear here",
              ),
            ),
            node(
              "span",
              "",
              t(
                "Elige un equipo y pulsa Crear solicitud.",
                "Choose equipment and select Create request.",
              ),
            ),
          );
          records.append(empty);
        }
        for (const record of state.records) {
          const row = node("article", "pd-record");
          row.dataset.record = record.id;
          row.tabIndex = -1;
          const info = node("div", "pd-record-info");
          info.append(
            node("small", "", record.id),
            node(
              "strong",
              "",
              `${record.quantity} × ${productNames[record.product]}`,
            ),
            node("span", "", money(record.total)),
          );
          const badge = node("span", "pd-badge", statusNames[record.status]);
          badge.dataset.tone =
            record.status === "approved"
              ? "success"
              : record.status === "rejected"
                ? "error"
                : "pending";
          const actions = node("div", "pd-record-actions");
          actions.append(badge);
          if (record.status === "pending") {
            for (const [decision, label] of [
              ["approved", t("Aprobar", "Approve")],
              ["rejected", t("Rechazar", "Reject")],
            ]) {
              const control = button(label, decision, true);
              control.dataset.recordId = record.id;
              actions.append(control);
            }
          }
          row.append(info, actions);
          records.append(row);
        }
      }
      on(records, "click", (event) => {
        const control = event.target.closest("button[data-record-id]");
        if (!control || !records.contains(control)) return;
        const id = control.dataset.recordId;
        const decision = control.dataset.pdAction;
        const changed = models.decideRequest(state, id, decision);
        if (!changed.ok) return;
        state = changed.state;
        paint();
        feedback.set(
          `${id}: ${statusNames[decision].toLowerCase()}`,
          t(
            "El estado cambió en el registro del ejemplo.",
            "The status changed in the sample record.",
          ),
          decision === "approved" ? "success" : "error",
        );
        path.set(["done", "done", decision === "approved" ? "done" : "error"]);
        records
          .querySelector(`[data-record="${id}"]`)
          ?.focus({ preventScroll: true });
      });
      on(form, "submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const created = models.createRequest(
          state,
          product.value,
          quantity.value,
        );
        if (!created.ok) {
          feedback.set(
            t("Revisa la cantidad", "Check the quantity"),
            t(
              "Elige entre 1 y 8 unidades enteras.",
              "Choose between 1 and 8 whole units.",
            ),
            "error",
          );
          return;
        }
        state = created.state;
        paint();
        path.set(["done", "done", "active"]);
        feedback.set(
          `${created.record.id} ${t("creada", "created")}`,
          t(
            "Ahora puedes aprobarla o rechazarla en el registro.",
            "Now approve or reject it in the record list.",
          ),
          "pending",
        );
      });
      on(reset, "click", () => {
        state = models.emptyRequests();
        form.reset();
        updateCost();
        path.set([]);
        paint();
        feedback.set(
          t("Ejemplo reiniciado", "Example reset"),
          t("El registro está vacío.", "The record list is empty."),
        );
      });
      paint();
      feedback.set(
        t("Lista para probar", "Ready to try"),
        t(
          "No se guarda información fuera de esta página.",
          "No information is saved outside this page.",
        ),
      );
      return cleanup;
    },
  });
  register({
    id: "power-automate",
    name: "Power Automate",
    family: "procesos",
    title: t("Una regla, dos caminos", "One rule, two paths"),
    tagline: t(
      "Cambia el importe y observa quién debe aprobar.",
      "Change the amount and see who must approve.",
    ),
    technologies: ["Power Automate", "SharePoint", "Teams"],
    render(host) {
      const { root, on, cleanup } = mount(host, "power-automate");
      let state = { status: "idle" };
      const layout = node("div", "pd-layout");
      const controls = panel(t("Configura la solicitud", "Set up the request"));
      const form = node("form", "pd-form");
      const amount = numberField(
        form,
        t("Importe solicitado (USD)", "Requested amount (USD)"),
        "amount",
        1200,
        1,
        100000,
      );
      const threshold = numberField(
        form,
        t(
          "Aprobación automática hasta (USD)",
          "Automatic approval up to (USD)",
        ),
        "threshold",
        1000,
        0,
        100000,
      );
      const fail = checkField(
        form,
        t("Simular fallo del aviso", "Simulate a notification failure"),
        "fail-notification",
      );
      const run = button(t("Ejecutar flujo", "Run flow"), "run-flow");
      run.type = "submit";
      const reset = button(t("Reiniciar", "Reset"), "reset", true);
      const actions = node("div", "pd-actions");
      actions.append(run, reset);
      form.append(actions);
      controls.append(form);
      const board = panel(t("Así se resuelve", "How it resolves"));
      const path = flow([
        [t("Solicitud", "Request"), "SharePoint"],
        [t("Evaluar importe", "Check amount"), "Power Automate"],
        [
          t("Aprobación", "Approval"),
          t("Automática o manual", "Automatic or manual"),
        ],
        [t("Aviso", "Notification"), "Teams"],
      ]);
      const condition = node("div", "pd-condition");
      const decision = node("div", "pd-actions");
      const approve = button(
        t("Aprobar solicitud", "Approve request"),
        "approve-flow",
      );
      const reject = button(t("Rechazar", "Reject"), "reject-flow", true);
      const retry = button(
        t("Reintentar aviso", "Retry notification"),
        "retry-flow",
      );
      decision.append(approve, reject, retry);
      const feedback = result();
      board.append(path.element, condition, decision, feedback.element);
      layout.append(controls, board);
      root.append(layout);
      root.append(
        details(
          t("Qué representa", "What this illustrates"),
          t(
            "Una condición dirige el flujo. La aprobación puede detenerlo; un fallo del aviso puede reintentarse sin pedir otra aprobación. No se envían mensajes reales.",
            "A condition directs the flow. An approval can stop it; a failed notification can be retried without another approval. No real messages are sent.",
          ),
        ),
      );
      function paint() {
        const pending = state.status === "pending";
        approve.hidden = reject.hidden = !pending;
        retry.hidden = state.status !== "notification-error";
        condition.textContent =
          state.status === "idle"
            ? t(
                "Ejecuta para ver la rama elegida.",
                "Run to see the chosen branch.",
              )
            : state.status === "invalid"
              ? t("Introduce importes válidos.", "Enter valid amounts.")
              : `${money(state.amount)} ${state.manual ? ">" : "≤"} ${money(state.threshold)} → ${state.manual ? t("Aprobación manual", "Manual approval") : t("Aprobación automática", "Automatic approval")}`;
        const copy = {
          idle: [
            t(
              "El flujo espera una solicitud",
              "The flow is waiting for a request",
            ),
            t(
              "Prueba un importe mayor y uno menor al límite.",
              "Try an amount above and below the limit.",
            ),
            "idle",
          ],
          pending: [
            t("Necesita una decisión", "A decision is needed"),
            t(
              "El importe supera el límite automático. Aprueba o rechaza aquí.",
              "The amount exceeds the automatic limit. Approve or reject here.",
            ),
            "pending",
          ],
          complete: [
            t(
              "Solicitud aprobada y aviso simulado",
              "Request approved and notification simulated",
            ),
            state.retries
              ? t(
                  "El reintento recuperó el aviso, sin repetir la aprobación.",
                  "The retry recovered the notification without repeating approval.",
                )
              : t(
                  "La solicitud recorrió la rama correspondiente a su importe.",
                  "The request followed the branch for its amount.",
                ),
            "success",
          ],
          rejected: [
            t("Solicitud rechazada", "Request rejected"),
            t(
              "El flujo se detuvo antes del aviso de aprobación.",
              "The flow stopped before the approval notification.",
            ),
            "error",
          ],
          "notification-error": [
            t("Aprobada; el aviso falló", "Approved; notification failed"),
            t(
              "Reintenta el aviso para completar el ejemplo.",
              "Retry the notification to complete the example.",
            ),
            "error",
          ],
          invalid: [
            t("Revisa los importes", "Check the amounts"),
            t(
              "La solicitud debe ser positiva y el límite no puede ser negativo.",
              "The request must be positive and the limit cannot be negative.",
            ),
            "error",
          ],
        };
        feedback.set(...copy[state.status]);
        path.set(
          state.status === "idle" || state.status === "invalid"
            ? []
            : [
                "done",
                "done",
                pending
                  ? "active"
                  : state.status === "rejected"
                    ? "error"
                    : "done",
                state.status === "complete"
                  ? "done"
                  : state.status === "notification-error"
                    ? "error"
                    : "idle",
              ],
        );
      }
      on(form, "submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        state = models.startFlow(amount.value, threshold.value, fail.checked);
        paint();
        if (root.clientWidth <= 660) feedback.element.focus();
      });
      on(approve, "click", () => {
        state = models.decideFlow(state, "approve");
        paint();
        feedback.element.focus({ preventScroll: true });
      });
      on(reject, "click", () => {
        state = models.decideFlow(state, "reject");
        paint();
        feedback.element.focus({ preventScroll: true });
      });
      on(retry, "click", () => {
        state = models.retryFlow(state);
        paint();
        feedback.element.focus({ preventScroll: true });
      });
      on(reset, "click", () => {
        form.reset();
        state = { status: "idle" };
        paint();
      });
      paint();
      return cleanup;
    },
  });

  register({
    id: "power-bi",
    name: "Power BI",
    family: "datos",
    title: t("Del filtro a la decisión", "From filter to decision"),
    tagline: t(
      "Filtra las ventas de ejemplo y comprueba cada cifra.",
      "Filter sample sales and inspect every number.",
    ),
    technologies: ["Power BI", "SQL Server", "Python", "Excel"],
    render(host) {
      const { root, on, cleanup } = mount(host, "power-bi");
      const regions = {
        north: t("Norte", "North"),
        central: t("Centro", "Central"),
        south: t("Sur", "South"),
      };
      const months = {
        "2026-01": t("Enero", "January"),
        "2026-02": t("Febrero", "February"),
        "2026-03": t("Marzo", "March"),
      };
      const controls = node("div", "pd-filters");
      const region = selectField(controls, t("Región", "Region"), "region", [
        ["all", t("Todas las regiones", "All regions")],
        ...Object.entries(regions),
      ]);
      const month = selectField(controls, t("Mes", "Month"), "month", [
        ["all", t("Todos los meses", "All months")],
        ...Object.entries(months),
      ]);
      const reset = button(t("Quitar filtros", "Clear filters"), "reset", true);
      controls.append(reset);
      const board = panel(
        t("Ventas del escenario", "Scenario sales"),
        t(
          "Los indicadores y las barras usan las mismas filas.",
          "Indicators and bars use the same rows.",
        ),
        "pd-report",
      );
      const metrics = node("div", "pd-metrics pd-metrics-three");
      const chart = node("div", "pd-chart");
      chart.setAttribute("role", "group");
      chart.setAttribute(
        "aria-label",
        t("Importe por región", "Amount by region"),
      );
      const feedback = result();
      const data = details(
        t("Ver filas del ejemplo", "View sample rows"),
        t(
          "Datos sintéticos; no representan ventas de una empresa.",
          "Synthetic data; these are not company sales.",
        ),
      );
      const tableWrap = node("div", "pd-table-wrap");
      tableWrap.tabIndex = 0;
      tableWrap.setAttribute("role", "region");
      tableWrap.setAttribute(
        "aria-label",
        t("Detalle de ventas de ejemplo", "Sample sales details"),
      );
      const table = node("table", "pd-table");
      const caption = node(
        "caption",
        "",
        t("Filas incluidas en el filtro", "Rows included in the filter"),
      );
      const head = node("thead");
      const tr = node("tr");
      for (const text of [
        t("Mes", "Month"),
        t("Región", "Region"),
        t("Categoría", "Category"),
        t("Importe", "Amount"),
      ]) {
        const th = node("th", "", text);
        th.scope = "col";
        tr.append(th);
      }
      head.append(tr);
      const body = node("tbody");
      table.append(caption, head, body);
      tableWrap.append(table);
      const download = button(
        t("Descargar estas filas", "Download these rows"),
        "export-csv",
        true,
      );
      data.append(tableWrap, download);
      board.append(metrics, chart, feedback.element);
      root.append(controls, board, data);
      let current = models.summarizeSales();
      function paint() {
        current = models.summarizeSales(region.value, month.value);
        metrics.replaceChildren(
          metric(t("Total del ejemplo", "Sample total"), money(current.total)),
          metric(t("Filas incluidas", "Included rows"), number(current.count)),
          metric(
            t("Promedio por fila", "Average per row"),
            money(current.average),
          ),
        );
        chart.replaceChildren();
        const scale = Math.max(
          ...current.grouped.map((item) => item.amount),
          1,
        );
        for (const item of current.grouped) {
          const bar = node("div", "pd-bar-row");
          const label = node("div", "pd-bar-label");
          label.append(
            node("span", "", regions[item.region]),
            node("strong", "", money(item.amount)),
          );
          const track = node("div", "pd-bar-track");
          track.setAttribute("aria-hidden", "true");
          const fill = node("div", "pd-bar-fill");
          fill.style.width = `${(item.amount / scale) * 100}%`;
          track.append(fill);
          bar.append(label, track);
          chart.append(bar);
        }
        body.replaceChildren();
        for (const row of current.rows) {
          const line = node("tr");
          for (const value of [
            months[row.month],
            regions[row.region],
            row.category === "devices"
              ? t("Equipos", "Devices")
              : t("Servicios", "Services"),
            money(row.amount),
          ])
            line.append(node("td", "", value));
          body.append(line);
        }
        feedback.set(
          `${number(current.count)} ${t("filas →", "rows →")} ${money(current.total)}`,
          t(
            "Cambia un filtro y observa cómo se recalcula el tablero.",
            "Change a filter and watch the dashboard recalculate.",
          ),
          "success",
        );
      }
      on(region, "change", paint);
      on(month, "change", paint);
      on(reset, "click", () => {
        region.value = month.value = "all";
        paint();
      });
      const urls = new Set();
      on(download, "click", () => {
        const text = [
          "month,region,category,amount",
          ...current.rows.map(
            (row) => `${row.month},${row.region},${row.category},${row.amount}`,
          ),
        ].join("\r\n");
        const url = window.URL.createObjectURL(
          new window.Blob([text], { type: "text/csv;charset=utf-8" }),
        );
        urls.add(url);
        const anchor = node("a");
        anchor.href = url;
        anchor.download = "sample-sales.csv";
        root.append(anchor);
        anchor.click();
        anchor.remove();
      });
      paint();
      return () => {
        cleanup();
        urls.forEach((url) => window.URL.revokeObjectURL(url));
      };
    },
  });
  register({
    id: "integraciones",
    name: t("Integraciones", "Integrations"),
    family: "procesos",
    title: t("Un pedido, un solo registro", "One order, one record"),
    tagline: t(
      "Envía, repite y recupera un pedido sin duplicarlo.",
      "Send, repeat and recover an order without duplicating it.",
    ),
    technologies: [
      "React",
      "TypeScript",
      "FastAPI",
      "NestJS",
      "PostgreSQL",
      "SQL Server",
      "n8n",
    ],
    render(host) {
      const { root, on, cleanup } = mount(host, "integraciones");
      let state = models.emptyIntegration(),
        eventNumber = 1,
        lastStatus = "idle";
      const path = flow([
        [t("App", "App"), "React · TypeScript"],
        ["API", "FastAPI / NestJS"],
        [t("Registro", "Record"), "SQL / PostgreSQL"],
        [t("Continuación", "Next step"), "n8n"],
      ]);
      root.append(path.element);
      const layout = node("div", "pd-layout");
      const controls = panel(t("Pedido de ejemplo", "Sample order"));
      const form = node("form", "pd-form");
      const eventLabel = node("div", "pd-event-key");
      const product = selectField(
        form,
        t("Producto", "Product"),
        "product",
        Object.entries(productNames),
      );
      const quantity = numberField(
        form,
        t("Unidades", "Units"),
        "quantity",
        2,
        1,
        20,
      );
      const failure = checkField(
        form,
        t("Simular base no disponible", "Simulate database unavailable"),
        "database-failure",
      );
      const send = button(t("Enviar pedido", "Send order"), "send-order");
      send.type = "submit";
      const repeat = button(
        t("Repetir envío", "Repeat delivery"),
        "repeat-order",
        true,
      );
      const next = button(t("Nuevo pedido", "New order"), "new-order", true);
      const reset = button(t("Reiniciar", "Reset"), "reset", true);
      const actions = node("div", "pd-actions");
      actions.append(send, repeat, next, reset);
      form.append(actions);
      controls.append(eventLabel, form);
      const registry = panel(
        t("Qué llegó al registro", "What reached the records"),
      );
      const metrics = node("div", "pd-metrics");
      const feedback = result();
      const records = node("div", "pd-records");
      registry.append(metrics, feedback.element, records);
      layout.append(controls, registry);
      root.append(
        layout,
        details(
          t("Por qué no se duplica", "Why it is not duplicated"),
          t(
            "Cada envío conserva una clave. Si vuelve con los mismos datos, se devuelve el registro existente. Si cambia los datos con esa misma clave, se bloquea el conflicto. El fallo de base puede recuperarse reintentando.",
            "Each delivery keeps a key. If the same data returns, the existing record is returned. Changed data with the same key is blocked as a conflict. A database failure can be recovered by retrying.",
          ),
        ),
      );
      const key = () => `EVT-${String(eventNumber).padStart(3, "0")}`;
      function paint() {
        eventLabel.textContent = `${t("Clave de envío", "Delivery key")}: ${key()}`;
        metrics.replaceChildren(
          metric(t("Intentos", "Attempts"), number(state.attempts)),
          metric(
            t("Registros creados", "Created records"),
            number(state.orders.length),
          ),
        );
        records.replaceChildren();
        if (!state.orders.length)
          records.append(
            node(
              "div",
              "pd-empty",
              t(
                "Todavía no hay pedidos guardados.",
                "No orders have been saved yet.",
              ),
            ),
          );
        for (const order of state.orders) {
          const row = node("article", "pd-record");
          const info = node("div", "pd-record-info");
          info.append(
            node("small", "", `${order.id} · ${order.eventId}`),
            node(
              "strong",
              "",
              `${order.quantity} × ${productNames[order.product]}`,
            ),
          );
          row.append(info, node("strong", "", money(order.total)));
          records.append(row);
        }
        const copies = {
          idle: [
            t("Listo para enviar", "Ready to send"),
            t(
              "Prueba primero el envío y después repítelo.",
              "Try a delivery, then repeat it.",
            ),
            "idle",
          ],
          complete: [
            t("Pedido guardado en el ejemplo", "Order saved in the example"),
            t(
              "La API validó, el registro se creó y el flujo puede continuar.",
              "The API validated it, the record was created and the flow can continue.",
            ),
            "success",
          ],
          duplicate: [
            t(
              "Repetición detectada: ningún duplicado",
              "Repeated delivery: no duplicate",
            ),
            t(
              "El registro existente responde al mismo envío.",
              "The existing record handles the same delivery.",
            ),
            "success",
          ],
          conflict: [
            t("Misma clave, datos diferentes", "Same key, different data"),
            t(
              "Elige Nuevo pedido para guardar otra solicitud.",
              "Choose New order to save a different request.",
            ),
            "error",
          ],
          error: [
            t(
              "Base no disponible; nada se guardó",
              "Database unavailable; nothing saved",
            ),
            t(
              "Desactiva el fallo y repite el envío con la misma clave.",
              "Turn off the failure and repeat delivery with the same key.",
            ),
            "error",
          ],
          invalid: [
            t("Revisa el pedido", "Check the order"),
            t(
              "Elige un producto y entre 1 y 20 unidades.",
              "Choose a product and between 1 and 20 units.",
            ),
            "error",
          ],
        };
        feedback.set(...copies[lastStatus]);
        path.set(
          lastStatus === "idle" || lastStatus === "invalid"
            ? []
            : lastStatus === "error"
              ? ["done", "done", "error", "idle"]
              : lastStatus === "conflict"
                ? ["done", "error", "idle", "idle"]
                : ["done", "done", "done", "done"],
        );
        repeat.disabled = state.attempts === 0;
      }
      function submit() {
        if (!form.reportValidity()) return;
        const outcome = models.processOrder(
          state,
          { id: key(), product: product.value, quantity: quantity.value },
          failure.checked,
        );
        state = outcome.state;
        lastStatus = outcome.status;
        paint();
        if (root.clientWidth <= 660) feedback.element.focus();
      }
      on(form, "submit", (event) => {
        event.preventDefault();
        submit();
      });
      on(repeat, "click", submit);
      on(next, "click", () => {
        eventNumber += 1;
        lastStatus = "idle";
        paint();
      });
      on(reset, "click", () => {
        form.reset();
        state = models.emptyIntegration();
        eventNumber = 1;
        lastStatus = "idle";
        paint();
      });
      paint();
      return cleanup;
    },
  });

  register({
    id: "despliegue",
    name: t("Entrega de aplicaciones", "Application delivery"),
    family: "procesos",
    title: t("Publicar con una salida de vuelta", "Release with a way back"),
    tagline: t(
      "Bloquea un fallo, publica una versión y vuelve a la anterior.",
      "Block a failure, release a version and return to the previous one.",
    ),
    technologies: ["GitHub Actions", "Docker", "Azure", "Cloudflare"],
    render(host) {
      const { root, on, cleanup } = mount(host, "despliegue");
      let state = models.emptyDeployment();
      const layout = node("div", "pd-layout");
      const controls = panel(t("Preparar la entrega", "Prepare the release"));
      const target = selectField(
        controls,
        t("Destino representado", "Illustrated destination"),
        "target",
        [
          ["azure", "Azure"],
          ["cloudflare", "Cloudflare"],
        ],
      );
      const failure = checkField(
        controls,
        t("Simular una prueba fallida", "Simulate a failing test"),
        "test-failure",
        true,
      );
      const run = button(t("Ejecutar entrega", "Run release"), "run-release");
      const back = button(
        t("Volver a la versión anterior", "Return to previous version"),
        "rollback",
        true,
      );
      const reset = button(t("Reiniciar", "Reset"), "reset", true);
      const actions = node("div", "pd-actions");
      actions.append(run, back, reset);
      controls.append(actions);
      const board = panel(t("Estado de la aplicación", "Application state"));
      const path = flow([
        [t("Pruebas", "Tests"), "GitHub Actions"],
        [
          t("Empaquetado", "Package"),
          t("Docker / archivos web", "Docker / web assets"),
        ],
        [
          t("Publicación", "Release"),
          t("Destino elegido", "Chosen destination"),
        ],
      ]);
      const preview = node("div", "pd-release-preview");
      const version = node("strong", "pd-release-version");
      const location = node("span", "pd-hint");
      preview.append(
        node(
          "span",
          "pd-release-label",
          t("Aplicación de ejemplo", "Sample application"),
        ),
        version,
        location,
      );
      const feedback = result();
      board.append(path.element, preview, feedback.element);
      layout.append(controls, board);
      root.append(
        layout,
        details(
          t("Qué representa", "What this illustrates"),
          t(
            "Una prueba fallida bloquea la entrega. El ejemplo representa un contenedor hacia Azure o archivos web hacia Cloudflare. Volver atrás recupera la versión previa del escenario; no se modifica ningún servicio real.",
            "A failing test blocks release. The example illustrates a container to Azure or web assets to Cloudflare. Rolling back restores the scenario's previous version; no real service is changed.",
          ),
        ),
      );
      function paint() {
        version.textContent = `v${state.version}.0`;
        location.textContent = `${t("Destino representado", "Illustrated destination")}: ${target.options[target.selectedIndex].textContent}`;
        back.disabled = state.previous === null;
        const messages = {
          idle: [
            t(
              "La versión inicial sigue disponible",
              "The initial version is still available",
            ),
            t(
              "La prueba fallida viene activada: ejecuta para ver el bloqueo.",
              "The failing test is enabled: run to see it block release.",
            ),
            "idle",
          ],
          blocked: [
            t("Entrega bloqueada", "Release blocked"),
            t(
              "La prueba falló y la versión publicada no cambió. Desactiva el fallo y vuelve a ejecutar.",
              "The test failed and the released version did not change. Turn off the failure and run again.",
            ),
            "error",
          ],
          deployed: [
            t("Nueva versión en el escenario", "New version in the scenario"),
            `${t("Puedes recuperar", "You can restore")} v${state.previous}.0 ${t("con el botón de volver atrás.", "with the rollback button.")}`,
            "success",
          ],
          "rolled-back": [
            t("Versión anterior recuperada", "Previous version restored"),
            t(
              "La aplicación vuelve al estado anterior de este ejemplo.",
              "The application returns to this example's previous state.",
            ),
            "success",
          ],
        };
        feedback.set(...messages[state.status]);
        path.set(
          state.status === "idle"
            ? []
            : state.status === "blocked"
              ? ["error", "idle", "idle"]
              : ["done", "done", "done"],
        );
      }
      on(run, "click", () => {
        state = models.deploy(state, failure.checked);
        paint();
        if (root.clientWidth <= 660) feedback.element.focus();
      });
      on(back, "click", () => {
        state = models.rollback(state);
        paint();
      });
      on(target, "change", () => {
        state = models.emptyDeployment();
        paint();
      });
      on(reset, "click", () => {
        target.value = "azure";
        failure.checked = true;
        state = models.emptyDeployment();
        paint();
      });
      paint();
      return cleanup;
    },
  });
})();
