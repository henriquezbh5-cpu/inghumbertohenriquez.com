/* Guided visual examples: state changes stay local and are safe to reset. */
(() => {
  "use strict";
  const lab = window.LAB,
    models = window.GuidedLabModels;
  if (!lab || !models) return;
  const en = document.documentElement.lang === "en";
  const t = (es, english) => (en ? english : es);
  const node = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const money = (n) =>
    new Intl.NumberFormat(en ? "en-US" : "es-SV", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  function panel(title) {
    const p = node("section", "gv-panel");
    if (title) p.append(node("h3", null, title));
    return p;
  }
  function button(text, fn, signal, secondary = false) {
    const b = node("button", `gv-button${secondary ? " secondary" : ""}`, text);
    b.type = "button";
    b.addEventListener("click", fn, { signal });
    return b;
  }
  function select(label, options, id) {
    const wrap = node("label", "gv-field", label);
    const s = node("select");
    s.id = id;
    options.forEach(([value, text]) => {
      const o = node("option", null, text);
      o.value = value;
      s.append(o);
    });
    wrap.append(s);
    return { wrap, input: s };
  }
  function flow(labels) {
    const list = node("ol", "gv-flow");
    const nodes = labels.map((label, i) => {
      const item = node("li", "gv-step");
      item.dataset.state = "idle";
      item.append(
        node("span", null, `${t("Paso", "Step")} ${i + 1}`),
        node("b", null, label),
        node("small", "gv-step-status", t("Pendiente", "Pending")),
      );
      list.append(item);
      return item;
    });
    return { list, nodes };
  }
  function setStep(item, state) {
    item.dataset.state = state;
    item.querySelector(".gv-step-status").textContent = {
      idle: t("Pendiente", "Pending"),
      done: t("Hecho", "Done"),
      error: t("Detenido", "Stopped"),
      warning: t("Con aviso", "With warning"),
    }[state];
  }
  function table(headers, rows) {
    const wrap = node("div");
    const el = node("table");
    const head = node("thead");
    const tr = node("tr");
    headers.forEach((h) => {
      const th = node("th", null, h);
      th.scope = "col";
      tr.append(th);
    });
    head.append(tr);
    el.append(head);
    const body = node("tbody");
    rows.forEach((row) => {
      const tr = node("tr");
      row.forEach((cell) => tr.append(node("td", null, String(cell))));
      body.append(tr);
    });
    el.append(body);
    wrap.append(el);
    return wrap;
  }
  function evidence(title) {
    const details = node("details", "gv-evidence");
    details.append(node("summary", null, title));
    return details;
  }

  lab.register({
    id: "pulso",
    name: "PULSO",
    family: "agentes",
    impact: [],
    render(host) {
      const controller = new AbortController(),
        signal = controller.signal;
      let state = models.createMonitor();
      const layout = node("div", "gv-layout");
      const controls = panel(t("Prueba una incidencia", "Try an incident"));
      const board = panel(t("Estado de los flujos", "Workflow status"));
      const pick = select(
        t("Flujo del ejemplo", "Sample workflow"),
        state.jobs.map((j) => [j.id, en ? j.en : j.es]),
        "monitorJob",
      );
      controls.append(pick.wrap);
      const actions = node("div", "gv-row");
      const update = (action) => {
        state = models.updateMonitor(
          state,
          pick.input.value,
          action,
          persistent.checked,
        );
        render();
      };
      const run = button(t("Ejecutar", "Run"), () => update("run"), signal);
      const fail = button(
        t("Provocar fallo", "Trigger failure"),
        () => update("fail"),
        signal,
        true,
      );
      actions.append(run, fail);
      controls.append(actions);
      const check = node("label", "gv-check");
      const persistent = node("input");
      persistent.type = "checkbox";
      persistent.id = "persistentFailure";
      check.append(
        persistent,
        document.createTextNode(
          t("Mantener el servicio caído", "Keep the service offline"),
        ),
      );
      controls.append(check);
      const recovery = node("div", "gv-row");
      const retry = button(
        t("Reintentar", "Retry"),
        () => update("retry"),
        signal,
      );
      const escalate = button(
        t("Pedir revisión", "Request review"),
        () => update("escalate"),
        signal,
        true,
      );
      recovery.append(retry, escalate);
      controls.append(recovery);
      const status = node(
        "p",
        "gv-status",
        t(
          "Elige un flujo y ejecútalo o provoca un fallo.",
          "Choose a workflow and run it or trigger a failure.",
        ),
      );
      status.setAttribute("role", "status");
      controls.append(status);
      const counts = node("dl", "gv-metrics"),
        fleet = node("div", "gv-fleet");
      board.append(counts, fleet);
      layout.append(controls, board);
      host.append(layout);
      const process = flow([
        t("Detectar", "Detect"),
        t("Reintentar", "Retry"),
        t("Resolver o revisar", "Resolve or review"),
      ]);
      host.append(process.list);
      const logDetails = evidence(
        t("Ver la secuencia del ejemplo", "View the example sequence"),
      );
      const log = node("ol", "gv-log");
      logDetails.append(log);
      host.append(logDetails);
      const labels = {
        ready: t("Preparado", "Ready"),
        done: t("Correcto", "Successful"),
        failed: t("Con fallo", "Failed"),
        review: t("En revisión", "Under review"),
      };
      const messages = {
        run: t(
          "El flujo terminó correctamente en esta demo.",
          "The workflow completed successfully in this demo.",
        ),
        fail: t(
          "Se detectó un fallo. Reintenta o pide revisión.",
          "A failure was detected. Retry or request a review.",
        ),
        retry: t(
          "El reintento terminó correctamente.",
          "The retry completed successfully.",
        ),
        escalate: t(
          "Incidencia marcada para revisión en esta demo.",
          "Incident marked for review in this demo.",
        ),
      };
      function render() {
        const selected = state.jobs.find((j) => j.id === pick.input.value);
        retry.disabled = escalate.disabled = selected.state !== "failed";
        counts.replaceChildren();
        [
          [state.jobs.length, t("Flujos de ejemplo", "Sample workflows")],
          [
            state.jobs.filter((j) => j.state === "failed").length,
            t("Con fallo", "Failed"),
          ],
          [
            state.jobs.filter((j) => j.state === "review").length,
            t("En revisión", "Under review"),
          ],
        ].forEach(([value, label]) => {
          const item = node("div");
          item.append(node("dd", null, String(value)), node("dt", null, label));
          counts.append(item);
        });
        fleet.replaceChildren();
        state.jobs.forEach((j) => {
          const card = node("div", "gv-job");
          card.dataset.state = j.state;
          card.append(
            node("strong", null, en ? j.en : j.es),
            node("span", null, labels[j.state]),
          );
          fleet.append(card);
        });
        const event = [...state.events]
          .reverse()
          .find((e) => e.id === selected.id);
        process.nodes.forEach((n) => setStep(n, "idle"));
        if (event) {
          status.textContent =
            event.state === "failed" && event.action !== "fail"
              ? t(
                  "El servicio sigue caído. Puedes pedir revisión.",
                  "The service is still offline. You can request a review.",
                )
              : messages[event.action];
          status.dataset.tone =
            selected.state === "failed"
              ? "error"
              : selected.state === "review"
                ? "warning"
                : "success";
          setStep(process.nodes[0], "done");
          if (event.action === "retry")
            setStep(
              process.nodes[1],
              event.state === "failed" ? "error" : "done",
            );
          if (selected.state === "done" || selected.state === "review")
            setStep(
              process.nodes[2],
              selected.state === "review" ? "warning" : "done",
            );
        } else {
          status.textContent = t(
            "Elige un flujo y ejecútalo o provoca un fallo.",
            "Choose a workflow and run it or trigger a failure.",
          );
          status.dataset.tone = "success";
        }
        log.replaceChildren();
        state.events.forEach((e) => {
          const j = state.jobs.find((j) => j.id === e.id);
          log.append(
            node(
              "li",
              null,
              `${en ? j.en : j.es}: ${labels[e.state]} · ${t("intentos", "attempts")}: ${e.attempts}`,
            ),
          );
        });
        if (!state.events.length)
          log.append(
            node(
              "li",
              null,
              t(
                "Aún no has ejecutado ninguna acción.",
                "No actions have run yet.",
              ),
            ),
          );
      }
      pick.input.addEventListener("change", render, { signal });
      render();
      return () => controller.abort();
    },
  });

  lab.register({
    id: "canal",
    name: "CANAL",
    family: "agentes",
    impact: [],
    render(host) {
      const controller = new AbortController(),
        signal = controller.signal;
      const layout = node("div", "gv-layout"),
        controls = panel(t("Haz una pregunta", "Ask a question")),
        answer = panel(t("Respuesta y evidencia", "Answer and evidence"));
      const role = select(
        t("Permiso del usuario", "User permission"),
        [
          [
            "management",
            t(
              "Dirección: ventas y solicitudes",
              "Management: sales and requests",
            ),
          ],
          [
            "operations",
            t(
              "Operaciones: solo sus solicitudes",
              "Operations: its requests only",
            ),
          ],
        ],
        "queryRole",
      );
      controls.append(role.wrap);
      const presets = node("div", "gv-prompt-list");
      const form = node("form");
      const label = node(
        "label",
        "gv-field",
        t("Pregunta del ejemplo", "Example question"),
      );
      const input = node("input");
      input.type = "text";
      input.id = "dataQuestion";
      input.maxLength = 180;
      input.required = true;
      input.placeholder = t(
        "¿Cuáles son las ventas por país?",
        "What are the sales by country?",
      );
      label.append(input);
      form.append(label);
      const send = node(
        "button",
        "gv-button",
        t("Consultar datos", "Query data"),
      );
      send.type = "submit";
      form.append(send);
      [
        t("Ventas por país", "Sales by country"),
        t("Solicitudes pendientes", "Pending requests"),
        t("Una pregunta fuera del ejemplo", "A question outside this example"),
      ].forEach((q) =>
        presets.append(
          button(
            q,
            () => {
              input.value = q;
              run();
            },
            signal,
            true,
          ),
        ),
      );
      controls.append(
        presets,
        form,
        node(
          "p",
          "gv-note",
          t(
            "Consulta guiada con reglas locales; no llama a una IA externa.",
            "Guided query using local rules; no external AI call.",
          ),
        ),
      );
      const status = node(
        "p",
        "gv-status",
        t(
          "Prueba una pregunta para ver de dónde sale la respuesta.",
          "Try a question to see where the answer comes from.",
        ),
      );
      status.setAttribute("role", "status");
      const output = node("div");
      answer.append(status, output);
      layout.append(controls, answer);
      host.append(layout);
      function run() {
        const result = models.query(input.value, role.input.value);
        output.replaceChildren();
        status.dataset.tone = "success";
        if (result.kind === "unknown") {
          status.textContent = t(
            "Esta demo responde sobre ventas y solicitudes. Prueba una pregunta de arriba.",
            "This demo covers sales and requests. Try one of the questions above.",
          );
          status.dataset.tone = "warning";
          return;
        }
        if (result.kind === "denied") {
          status.textContent = t(
            "Este permiso no permite consultar ventas. Prueba las solicitudes o cambia a Dirección.",
            "This permission does not allow sales queries. Try requests or switch to Management.",
          );
          status.dataset.tone = "warning";
          return;
        }
        status.textContent =
          result.kind === "sales"
            ? t(
                "Ventas calculadas a partir de 6 registros del ejemplo.",
                "Sales calculated from 6 sample records.",
              )
            : t(
                "Solicitudes pendientes visibles con el permiso seleccionado.",
                "Pending requests visible under the selected permission.",
              );
        output.append(
          node(
            "p",
            "gv-big-value",
            result.kind === "sales"
              ? money(result.total)
              : String(result.total),
          ),
        );
        if (result.kind === "sales") {
          const bars = node("div", "gv-bars");
          const max = Math.max(...Object.values(result.groups));
          Object.entries(result.groups).forEach(([country, value]) => {
            const row = node("div", "gv-bar-row");
            const track = node("div", "gv-bar-track"),
              fill = node("div", "gv-bar-fill");
            fill.style.width = `${(value / max) * 100}%`;
            track.setAttribute("aria-hidden", "true");
            track.append(fill);
            row.append(
              node("span", null, country),
              track,
              node("strong", null, money(value)),
            );
            bars.append(row);
          });
          output.append(bars);
        }
        const details = evidence(
          t("Comprobar los registros de origen", "Check the source records"),
        );
        details.append(
          node(
            "p",
            "gv-note",
            t(
              "Fuente: datos sintéticos incluidos en esta demo.",
              "Source: synthetic data included in this demo.",
            ),
          ),
        );
        details.append(
          result.kind === "sales"
            ? table(
                ["ID", t("País", "Country"), t("Venta", "Sale")],
                result.rows.map((row) => [
                  row.id,
                  row.country,
                  money(row.amount),
                ]),
              )
            : table(
                ["ID", t("Área", "Area"), t("Estado", "Status")],
                result.rows.map((row) => [
                  row.id,
                  en
                    ? row.area
                    : row.area === "Operations"
                      ? "Operaciones"
                      : "Finanzas",
                  t("Pendiente", "Pending"),
                ]),
              ),
        );
        output.append(details);
      }
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();
          if (form.reportValidity()) run();
        },
        { signal },
      );
      role.input.addEventListener(
        "change",
        () => {
          output.replaceChildren();
          status.textContent = t(
            "Permiso cambiado. Vuelve a consultar para aplicar el nuevo alcance.",
            "Permission changed. Query again to apply the new scope.",
          );
          status.dataset.tone = "success";
        },
        { signal },
      );
      return () => controller.abort();
    },
  });

  lab.register({
    id: "reloj",
    name: "RELOJ",
    family: "datos",
    impact: [],
    render(host) {
      const controller = new AbortController(),
        signal = controller.signal,
        model = window.ConsolidationModel;
      if (!model) throw new Error("Consolidation model is not loaded");
      const stack = node("div", "gv-stack"),
        controls = panel(t("Decide qué publicar", "Decide what to publish"));
      const layout = node("div", "gv-layout");
      const scenario = select(
        t("Escenario", "Scenario"),
        [
          ["current", t("Todas las fuentes al día", "All sources up to date")],
          [
            "stale",
            t("Excel del periodo anterior", "Excel from the previous period"),
          ],
          [
            "offline",
            t("Servicio de tesorería caído", "Treasury service offline"),
          ],
        ],
        "relojScenario",
      );
      const policy = select(
        t("Si una fuente tiene problemas", "If a source has a problem"),
        [
          ["stop", t("Detener y revisar", "Stop and review")],
          ["warn", t("Publicar con aviso", "Publish with a warning")],
        ],
        "relojPolicy",
      );
      layout.append(scenario.wrap, policy.wrap);
      controls.append(layout);
      const run = button(
        t("Consolidar datos", "Consolidate data"),
        execute,
        signal,
      );
      controls.append(run);
      stack.append(controls);
      const origins = node("div", "gv-origin-grid");
      stack.append(origins);
      const process = flow([
        t("Recibir fuentes", "Receive sources"),
        t("Quitar duplicados", "Remove duplicates"),
        t("Validar", "Validate"),
        t("Publicar", "Publish"),
      ]);
      stack.append(process.list);
      const output = panel(t("Resultado del ejemplo", "Example result"));
      const status = node(
        "p",
        "gv-status",
        t(
          "Elige un escenario y consolida los datos.",
          "Choose a scenario and consolidate the data.",
        ),
      );
      status.setAttribute("role", "status");
      const result = node("div");
      output.append(status, result);
      stack.append(output);
      host.append(stack);
      const sourceNames = {
        sql: "SQL Server",
        sp: "SharePoint",
        api: t("API de tesorería", "Treasury API"),
        excel: "Excel",
      };
      function preview() {
        const data = model.run(scenario.input.value, policy.input.value);
        origins.replaceChildren();
        data.sources.forEach((source) => {
          const card = node("div", "gv-origin");
          card.dataset.state =
            source.state === "offline"
              ? "error"
              : source.state === "stale"
                ? "warning"
                : "done";
          card.append(
            node("strong", null, sourceNames[source.id] || source.name),
            node(
              "span",
              null,
              source.state === "offline"
                ? t("Sin respuesta", "No response")
                : source.state === "stale"
                  ? t("Datos atrasados", "Stale data")
                  : t("Al día", "Up to date"),
            ),
            node(
              "span",
              null,
              `${source.rows.length} ${t("registros de ejemplo", "sample records")}`,
            ),
          );
          origins.append(card);
        });
        return data;
      }
      function clear() {
        preview();
        result.replaceChildren();
        status.textContent = t(
          "Configuración actualizada. Consolida para ver el resultado.",
          "Settings updated. Consolidate to see the result.",
        );
        status.dataset.tone = "success";
        process.nodes.forEach((n) => setStep(n, "idle"));
      }
      function execute() {
        const data = preview();
        result.replaceChildren();
        process.nodes.forEach((n, i) =>
          setStep(
            n,
            data.state === "blocked"
              ? i < 2
                ? "done"
                : i === 2
                  ? "error"
                  : "idle"
              : data.state === "warning" && i === 3
                ? "warning"
                : "done",
          ),
        );
        status.dataset.tone =
          data.state === "blocked"
            ? "error"
            : data.state === "warning"
              ? "warning"
              : "success";
        status.textContent =
          data.state === "blocked"
            ? t(
                "Publicación detenida. Revisa la fuente marcada o cambia la política.",
                "Publication stopped. Check the marked source or change the policy.",
              )
            : data.state === "warning"
              ? t(
                  "Publicado con aviso dentro de la demo. Revisa las fuentes antes de usar el total.",
                  "Published with a warning within the demo. Check the sources before using the total.",
                )
              : t(
                  "Datos consolidados y publicados en esta demo.",
                  "Data consolidated and published in this demo.",
                );
        if (data.amount !== null)
          result.append(node("p", "gv-big-value", money(data.amount)));
        const metrics = node("dl", "gv-metrics");
        [
          [data.readCount, t("Leídos", "Read")],
          [data.duplicates, t("Duplicados retirados", "Duplicates removed")],
          [data.publishedCount, t("Publicados", "Published")],
        ].forEach(([value, label]) => {
          const item = node("div");
          item.append(node("dd", null, String(value)), node("dt", null, label));
          metrics.append(item);
        });
        result.append(metrics);
        const details = evidence(
          t("Ver los registros del resultado", "View result records"),
        );
        details.append(
          table(
            [
              t("Fuente", "Source"),
              t("Registros", "Records"),
              t("Estado", "Status"),
            ],
            data.sources.map((s) => [
              sourceNames[s.id] || s.name,
              s.rows.length,
              s.state === "offline"
                ? t("Sin respuesta", "No response")
                : s.state === "stale"
                  ? t("Atrasado", "Stale")
                  : t("Al día", "Up to date"),
            ]),
          ),
        );
        result.append(details);
      }
      scenario.input.addEventListener("change", clear, { signal });
      policy.input.addEventListener("change", clear, { signal });
      preview();
      return () => controller.abort();
    },
  });
})();
