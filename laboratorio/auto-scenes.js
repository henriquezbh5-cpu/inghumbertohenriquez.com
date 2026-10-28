/* Sample scenarios for the automatic technology demonstrations. */
((root, factory) => {
  const scenes = factory();
  if (typeof module === "object" && module.exports) module.exports = scenes;
  else root.AutoLabScenes = scenes;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  "use strict";
  const L = (es, en) => [es, en];
  const field = (label, value, highlight = false) => ({
    label,
    value,
    highlight,
  });
  const row = (label, value, status) => ({
    label,
    value,
    ...(status ? { status } : {}),
  });
  const metric = (label, value) => ({ label, value });
  const msg = (text, from = "in") => ({ text, from });
  const step = (title, technology, icon, active, done, view) => ({
    title,
    technology,
    icon,
    active,
    done,
    view,
  });
  const scene = (id, title, outcome, preview, steps) => ({
    id,
    title,
    outcome,
    preview,
    steps,
  });
  const demo = (id, label, summary, family, technologies, scenarios) => ({
    id,
    label,
    summary,
    family,
    technologies,
    scenarios,
  });
  const S = {
    empty: L("Sin iniciar", "Not started"),
    draft: L("Borrador", "Draft"),
    pending: L("Pendiente", "Pending"),
    review: L("En revisión", "Under review"),
    approved: L("Aprobado", "Approved"),
    saved: L("Guardado", "Saved"),
    ready: L("Preparado", "Ready"),
    done: L("Completado", "Completed"),
    sent: L("Enviado", "Sent"),
    blocked: L("Detenido", "Stopped"),
  };
  const start = (kind, title, extra = {}) => ({
    kind,
    title,
    subtitle: L("Datos de ejemplo", "Sample data"),
    status: S.empty,
    ...extra,
  });
  const appRows = (id, subject, status) => [row(id, subject, status)];
  function appScene(id, title, labels, values, recordId, subject, outcome) {
    const blank = labels.map((label) =>
      field(label, L("Por completar", "Not entered")),
    );
    const filled = labels.map((label, i) => field(label, values[i], true));
    const first = blank.map((item, i) =>
      i === 0 ? field(item.label, values[0], true) : item,
    );
    return scene(
      id,
      title,
      outcome,
      start("app", L("Solicitudes internas", "Internal requests"), {
        fields: blank,
        rows: [],
        action: L("Nueva solicitud", "New request"),
      }),
      [
        step(
          L("Abre una solicitud", "Open a request"),
          "Power Apps",
          "apps",
          L("Se abre el formulario…", "Opening the form…"),
          L("Formulario preparado", "Form ready"),
          {
            status: S.draft,
            fields: blank,
            action: L("Formulario abierto", "Form open"),
          },
        ),
        step(
          L("Completa los datos", "Fill in the details"),
          "Power Apps",
          "apps",
          L("Se completa el primer campo…", "Filling in the first field…"),
          L("Solicitud identificada", "Request identified"),
          {
            status: S.draft,
            fields: first,
            action: L("Completando datos", "Entering details"),
          },
        ),
        step(
          L("Comprueba los campos", "Check the fields"),
          "Power Apps",
          "check",
          L(
            "Se completan y validan los campos…",
            "Completing and validating fields…",
          ),
          L("Datos listos para enviar", "Details ready to submit"),
          {
            status: L("Datos completos", "Details complete"),
            fields: filled,
            action: L("Enviar solicitud", "Submit request"),
          },
        ),
        step(
          L("Guarda la solicitud", "Save the request"),
          "Dataverse",
          "dataverse",
          L("Se registra la solicitud…", "Recording the request…"),
          L("Registro creado", "Record created"),
          {
            status: S.saved,
            fields: filled,
            rows: appRows(recordId, subject, S.pending),
            action: L("Solicitud guardada", "Request saved"),
          },
        ),
        step(
          L("Solicita aprobación", "Request approval"),
          "Power Automate · Teams",
          "teams",
          L("Se avisa al responsable…", "Notifying the reviewer…"),
          L("Responsable notificado", "Reviewer notified"),
          {
            status: S.review,
            fields: filled,
            rows: appRows(recordId, subject, S.review),
            action: L("Revisión del responsable", "Manager review"),
          },
        ),
        step(
          L("Actualiza la aplicación", "Update the application"),
          "Power Apps · Dataverse",
          "apps",
          L(
            "La decisión vuelve a la app…",
            "Returning the decision to the app…",
          ),
          L(
            "Aprobación visible en el registro",
            "Approval visible in the record",
          ),
          {
            status: S.approved,
            fields: filled.map((f) => ({ ...f, highlight: false })),
            rows: appRows(recordId, subject, S.approved),
            action: L("Aprobación registrada", "Approval recorded"),
          },
        ),
      ],
    );
  }
  function approval(id, amount, manual) {
    const fields = [
      field(L("Importe", "Amount"), amount),
      field(L("Límite del ejemplo", "Sample limit"), "$500"),
    ];
    return scene(
      id,
      manual
        ? L("Compra con aprobación", "Purchase requiring approval")
        : L("Gasto dentro del límite", "Expense within the limit"),
      manual
        ? L(
            "La compra se aprueba tras la revisión del responsable.",
            "The purchase is approved after the manager reviews it.",
          )
        : L(
            "El gasto continúa porque cumple la regla del ejemplo.",
            "The expense continues because it meets the sample rule.",
          ),
      start("records", L("Aprobación de gastos", "Expense approval"), {
        fields,
        rows: [],
      }),
      [
        step(
          L("Recibe la solicitud", "Receive the request"),
          "SharePoint",
          "sharepoint",
          L("Llega una nueva solicitud…", "A new request arrives…"),
          L("Solicitud recibida", "Request received"),
          {
            status: S.pending,
            fields,
            rows: [row("G-041", amount, S.pending)],
          },
        ),
        step(
          L("Comprueba el importe", "Check the amount"),
          "Power Automate",
          "automate",
          L("Se compara con el límite…", "Comparing with the limit…"),
          manual
            ? L("Supera $500: requiere revisión", "Over $500: review required")
            : L("No supera $500: cumple la regla", "$500 or less: rule met"),
          {
            status: manual
              ? L("Requiere aprobación", "Approval required")
              : L("Regla cumplida", "Rule met"),
            fields: [
              ...fields,
              field(
                L("Ruta elegida", "Selected path"),
                manual
                  ? L("Responsable", "Reviewer")
                  : L("Automática", "Automatic"),
                true,
              ),
            ],
            rows: [row("G-041", amount, S.review)],
          },
        ),
        step(
          manual
            ? L("Revisa el responsable", "Reviewer checks the request")
            : L("Autoriza el flujo", "Workflow authorizes the request"),
          manual ? "Teams" : "Power Automate",
          manual ? "teams" : "automate",
          manual
            ? L(
                "Se muestra la solicitud al responsable…",
                "Showing the request to the reviewer…",
              )
            : L(
                "Se registra la decisión de la regla…",
                "Recording the rule decision…",
              ),
          manual
            ? L("Aprobación simulada recibida", "Simulated approval received")
            : L(
                "Aprobado por la regla del ejemplo",
                "Approved by the sample rule",
              ),
          {
            status: S.approved,
            fields,
            rows: [row("G-041", amount, S.approved)],
          },
        ),
        step(
          L("Notifica el resultado", "Notify the result"),
          "Outlook",
          "outlook",
          L("Se prepara la confirmación…", "Preparing the confirmation…"),
          L(
            "Confirmación registrada en el ejemplo",
            "Confirmation recorded in the example",
          ),
          {
            status: S.done,
            fields,
            rows: [row("G-041", amount, S.approved)],
            messages: [
              msg(
                L(
                  "Tu solicitud ha sido aprobada.",
                  "Your request has been approved.",
                ),
                "out",
              ),
            ],
          },
        ),
      ],
    );
  }
  const salesBars = [
    { label: L("Norte", "North"), value: 2050 },
    { label: L("Sur", "South"), value: 1500 },
    { label: L("Occidente", "West"), value: 1650 },
  ];
  const sources = (offline) => [
    row("SQL Server", L("3 filas", "3 rows"), L("Al día", "Current")),
    row("SharePoint", L("3 filas", "3 rows"), L("Al día", "Current")),
    row(
      "API",
      offline ? L("Sin respuesta", "No response") : L("2 filas", "2 rows"),
      offline ? S.blocked : L("Al día", "Current"),
    ),
    row("Excel", L("2 filas", "2 rows"), L("Al día", "Current")),
  ];
  function consolidation(id, mode) {
    const full = sources(false),
      partial = sources(true);
    const finished = {
      status: L("Publicado en el ejemplo", "Published in the example"),
      rows: full,
      metrics: [
        metric(L("Total", "Total"), "$5,200"),
        metric(L("Registros únicos", "Unique records"), "9"),
        metric(L("Duplicados retirados", "Duplicates removed"), "1"),
      ],
      bars: salesBars,
    };
    let steps;
    if (mode === "current")
      steps = [
        step(
          L("Recoge cuatro fuentes", "Collect four sources"),
          "Power Automate",
          "automate",
          L("Se consultan los datos de ejemplo…", "Reading the sample data…"),
          L("10 filas recogidas", "10 rows collected"),
          {
            status: L("Fuentes recibidas", "Sources received"),
            rows: full,
            metrics: [metric(L("Filas recibidas", "Rows received"), "10")],
            bars: [],
          },
        ),
        step(
          L("Une los registros", "Combine the records"),
          "Python · SQL Server",
          "python",
          L(
            "Se normalizan las cuatro fuentes…",
            "Normalizing the four sources…",
          ),
          L("Las columnas ya coinciden", "Columns now match"),
          {
            status: L("Estructura unificada", "Structure unified"),
            rows: full,
            metrics: [metric(L("Filas unificadas", "Rows combined"), "10")],
            fields: [
              field(
                L("Clave común", "Common key"),
                L("ID de operación", "Transaction ID"),
                true,
              ),
            ],
          },
        ),
        step(
          L("Elimina el duplicado", "Remove the duplicate"),
          "SQL Server",
          "sql",
          L("Se compara la clave de cada fila…", "Comparing each row key…"),
          L("10 filas → 9 registros únicos", "10 rows → 9 unique records"),
          {
            status: L("Duplicado retirado", "Duplicate removed"),
            rows: full,
            metrics: [
              metric(L("Registros únicos", "Unique records"), "9"),
              metric(L("Duplicados", "Duplicates"), "1"),
            ],
            bars: [],
          },
        ),
        step(
          L("Comprueba la calidad", "Check data quality"),
          "Python",
          "check",
          L("Se revisan fuentes y totales…", "Checking sources and totals…"),
          L("Las cuatro fuentes están al día", "All four sources are current"),
          {
            status: L("Validación superada", "Validation passed"),
            rows: full,
            metrics: [
              metric(L("Total validado", "Validated total"), "$5,200"),
              metric(L("Registros", "Records"), "9"),
            ],
            bars: [],
          },
        ),
        step(
          L("Actualiza el tablero", "Update the dashboard"),
          "Power BI",
          "bi",
          L(
            "Se dibuja el resultado por región…",
            "Drawing the regional result…",
          ),
          L("Total y origen visibles", "Total and sources visible"),
          finished,
        ),
      ];
    else if (mode === "recovery")
      steps = [
        step(
          L("Detecta la fuente caída", "Detect the unavailable source"),
          "Power Automate",
          "automate",
          L("La API todavía no responde…", "The API is not responding yet…"),
          L("El cierre sigue detenido", "The close remains stopped"),
          {
            status: S.blocked,
            rows: partial,
            metrics: [metric(L("Filas disponibles", "Available rows"), "8")],
            bars: [],
          },
        ),
        step(
          L("Reintenta la consulta", "Retry the query"),
          "API",
          "api",
          L("Se vuelve a consultar la fuente…", "Querying the source again…"),
          L("La API devuelve sus 2 filas", "The API returns its 2 rows"),
          {
            status: L("Fuente recuperada", "Source recovered"),
            rows: full,
            metrics: [metric(L("Filas recibidas", "Rows received"), "10")],
            bars: [],
          },
        ),
        step(
          L("Vuelve a consolidar", "Consolidate again"),
          "Python · SQL Server",
          "python",
          L(
            "Se reconstruye el conjunto completo…",
            "Rebuilding the complete dataset…",
          ),
          L(
            "9 registros únicos después de deduplicar",
            "9 unique records after deduplication",
          ),
          {
            status: L("Conjunto completo", "Complete dataset"),
            rows: full,
            metrics: [
              metric(L("Registros únicos", "Unique records"), "9"),
              metric(L("Duplicados retirados", "Duplicates removed"), "1"),
            ],
            bars: [],
          },
        ),
        step(
          L("Valida y publica", "Validate and publish"),
          "Power BI",
          "bi",
          L(
            "Se valida el cierre recuperado…",
            "Validating the recovered close…",
          ),
          L("Resultado completo: $5,200", "Complete result: $5,200"),
          finished,
        ),
      ];
    else
      steps = [
        step(
          L("Recoge las fuentes", "Collect the sources"),
          "Power Automate",
          "automate",
          L(
            "Se consultan SQL, SharePoint, API y Excel…",
            "Reading SQL, SharePoint, API and Excel…",
          ),
          L("La API no devuelve datos", "The API returns no data"),
          {
            status: L("Fuente pendiente", "Source pending"),
            rows: partial,
            metrics: [metric(L("Filas disponibles", "Available rows"), "8")],
            bars: [],
          },
        ),
        step(
          L("Comprueba la integridad", "Check completeness"),
          "Python",
          "python",
          L(
            "Se compara lo esperado con lo recibido…",
            "Comparing expected and received data…",
          ),
          L(
            "Falta una de las cuatro fuentes",
            "One of four sources is missing",
          ),
          {
            status: L("Cierre incompleto", "Incomplete close"),
            rows: partial,
            fields: [
              field(L("Fuentes recibidas", "Sources received"), "3 / 4", true),
            ],
            metrics: [
              metric(
                L("Total publicado", "Published total"),
                L("No calculado", "Not calculated"),
              ),
            ],
          },
        ),
        step(
          L("Detiene la publicación", "Stop publication"),
          "Power BI",
          "bi",
          L(
            "La regla bloquea el cierre incompleto…",
            "The rule blocks the incomplete close…",
          ),
          L(
            "El tablero no presenta un total parcial",
            "The dashboard does not present a partial total",
          ),
          {
            status: S.blocked,
            rows: partial,
            metrics: [
              metric(
                L("Total publicado", "Published total"),
                L("Sin publicar", "Not published"),
              ),
            ],
            bars: [],
            action: L(
              "Esperando recuperación de la API",
              "Waiting for API recovery",
            ),
          },
        ),
      ];
    return scene(
      id,
      mode === "current"
        ? L("Cierre con todas las fuentes", "Close with all sources")
        : mode === "recovery"
          ? L("Recuperación de una fuente", "Source recovery")
          : L("Una fuente no responde", "A source does not respond"),
      mode === "blocked"
        ? L(
            "El cierre se detiene para evitar publicar información incompleta.",
            "The close stops to avoid publishing incomplete information.",
          )
        : L(
            "Cuatro fuentes, un total comprobable y el duplicado retirado.",
            "Four sources, one checkable total and the duplicate removed.",
          ),
      start("dashboard", L("Cierre por región", "Regional close"), {
        rows: [],
        metrics: [],
        bars: [],
      }),
      steps,
    );
  }
  const demos = [
    demo(
      "power-apps",
      L("Una app que gestiona solicitudes", "An app that manages requests"),
      L(
        "El formulario se completa, se aprueba y actualiza sus registros.",
        "The form fills itself, receives approval and updates its records.",
      ),
      "microsoft",
      ["Power Apps", "Dataverse", "Power Automate", "Teams"],
      [
        appScene(
          "equipment",
          L("Solicitud de equipo", "Equipment request"),
          [
            L("Tipo de solicitud", "Request type"),
            L("Equipo", "Equipment"),
            L("Cantidad", "Quantity"),
            L("Área", "Department"),
          ],
          [
            L("Equipo de trabajo", "Work equipment"),
            L("Portátil", "Laptop"),
            "2",
            L("Operaciones", "Operations"),
          ],
          "SOL-021",
          L("2 portátiles", "2 laptops"),
          L(
            "Dos equipos solicitados y aprobación visible en la aplicación.",
            "Two devices requested and approval visible in the application.",
          ),
        ),
        appScene(
          "expense",
          L("Reembolso de un gasto", "Expense reimbursement"),
          [
            L("Tipo de solicitud", "Request type"),
            L("Concepto", "Description"),
            L("Importe", "Amount"),
            L("Comprobante", "Receipt"),
          ],
          [
            L("Reembolso", "Reimbursement"),
            L("Material de oficina", "Office supplies"),
            "$85",
            L("Recibo de ejemplo adjunto", "Sample receipt attached"),
          ],
          "GAS-014",
          L("Material de oficina · $85", "Office supplies · $85"),
          L(
            "El gasto queda revisado y su estado se actualiza en la app.",
            "The expense is reviewed and its status updates in the app.",
          ),
        ),
        appScene(
          "leave",
          L("Solicitud de permiso", "Leave request"),
          [
            L("Tipo de solicitud", "Request type"),
            L("Inicio", "Start"),
            L("Fin", "End"),
            L("Duración", "Duration"),
          ],
          [
            L("Permiso personal", "Personal leave"),
            L("Lunes del ejemplo", "Sample Monday"),
            L("Martes del ejemplo", "Sample Tuesday"),
            L("2 días", "2 days"),
          ],
          "PER-008",
          L("Permiso de 2 días", "2-day leave"),
          L(
            "El permiso aprobado queda visible sin volver a escribir los datos.",
            "Approved leave becomes visible without entering the data again.",
          ),
        ),
      ],
    ),
    demo(
      "power-automate",
      L("Aprobaciones que siguen una regla", "Approvals that follow a rule"),
      L(
        "El importe decide si el flujo continúa o pide revisión.",
        "The amount decides whether the workflow continues or requests review.",
      ),
      "microsoft",
      ["Power Automate", "SharePoint", "Teams", "Outlook"],
      [
        approval("within-limit", "$240", false),
        approval("review-required", "$1,200", true),
      ],
    ),

    demo(
      "power-bi",
      L("Un tablero que se actualiza", "A dashboard that updates"),
      L(
        "Los datos llegan y se convierten en indicadores comprensibles.",
        "Incoming data becomes understandable indicators.",
      ),
      "data",
      ["Power BI", "SQL Server", "Python"],
      [
        scene(
          "regional-sales",
          L("Ventas por región", "Sales by region"),
          L(
            "El total se puede contrastar con las tres regiones.",
            "The total can be checked against the three regions.",
          ),
          start("dashboard", L("Ventas del ejemplo", "Sample sales"), {
            metrics: [],
            bars: [],
          }),
          [
            step(
              L("Recibe las ventas", "Receive sales"),
              "SQL Server",
              "sql",
              L(
                "Llegan los registros de tres regiones…",
                "Records arrive from three regions…",
              ),
              L("Tres regiones disponibles", "Three regions available"),
              {
                status: L("Datos recibidos", "Data received"),
                rows: salesBars.map((b) =>
                  row(b.label, "$" + b.value.toLocaleString("en-US")),
                ),
              },
            ),
            step(
              L("Calcula los indicadores", "Calculate indicators"),
              "Power BI",
              "bi",
              L("Se suman los importes…", "Adding the amounts…"),
              L("Total del ejemplo: $5,200", "Sample total: $5,200"),
              {
                status: L("Indicadores calculados", "Indicators calculated"),
                metrics: [
                  metric(L("Ventas", "Sales"), "$5,200"),
                  metric(L("Regiones", "Regions"), "3"),
                ],
              },
            ),
            step(
              L("Muestra la distribución", "Show the distribution"),
              "Power BI",
              "bi",
              L("Se actualizan las barras…", "Updating the bars…"),
              L(
                "Cada región conserva su importe",
                "Each region retains its amount",
              ),
              {
                status: L("Vista general", "Overview"),
                metrics: [metric(L("Ventas", "Sales"), "$5,200")],
                bars: salesBars,
              },
            ),
            step(
              L("Enfoca una región", "Focus on one region"),
              "Power BI",
              "bi",
              L(
                "El ejemplo filtra la región Norte…",
                "The example filters the North region…",
              ),
              L(
                "El indicador cambia con el filtro",
                "The indicator follows the filter",
              ),
              {
                status: L("Filtro: Norte", "Filter: North"),
                metrics: [
                  metric(L("Ventas del Norte", "North sales"), "$2,050"),
                ],
                bars: [salesBars[0]],
              },
            ),
          ],
        ),
        scene(
          "inventory",
          L("Existencias y reposición", "Stock and replenishment"),
          L(
            "El tablero señala el artículo que queda por debajo de su mínimo.",
            "The dashboard flags the item that falls below its minimum.",
          ),
          start("dashboard", L("Inventario del ejemplo", "Sample inventory"), {
            rows: [],
            metrics: [],
            bars: [],
          }),
          [
            step(
              L("Recibe las existencias", "Receive stock levels"),
              "SQL Server",
              "sql",
              L("Se leen tres artículos…", "Reading three items…"),
              L("Stock recibido", "Stock received"),
              {
                status: L("Stock disponible", "Stock available"),
                rows: [
                  row(L("Teclados", "Keyboards"), "18"),
                  row(L("Ratones", "Mice"), "6"),
                  row(L("Monitores", "Monitors"), "12"),
                ],
              },
            ),
            step(
              L("Compara con el mínimo", "Compare with the minimum"),
              "Power BI",
              "bi",
              L(
                "Cada artículo se compara con 10 unidades…",
                "Comparing each item with 10 units…",
              ),
              L("Ratones: 6 unidades, mínimo 10", "Mice: 6 units, minimum 10"),
              {
                status: L("Reposición detectada", "Replenishment detected"),
                rows: [
                  row(
                    L("Teclados", "Keyboards"),
                    "18",
                    L("Suficiente", "Sufficient"),
                  ),
                  row(L("Ratones", "Mice"), "6", L("Reponer", "Replenish")),
                  row(
                    L("Monitores", "Monitors"),
                    "12",
                    L("Suficiente", "Sufficient"),
                  ),
                ],
                metrics: [
                  metric(L("Artículos a reponer", "Items to replenish"), "1"),
                ],
              },
            ),
            step(
              L("Muestra la prioridad", "Show the priority"),
              "Power BI",
              "bi",
              L(
                "El tablero resume las existencias…",
                "The dashboard summarizes stock…",
              ),
              L("Una prioridad visible", "One visible priority"),
              {
                status: L("Reponer ratones", "Replenish mice"),
                metrics: [
                  metric(L("Unidades totales", "Total units"), "36"),
                  metric(
                    L("Faltan para el mínimo", "Units short of minimum"),
                    "4",
                  ),
                ],
                bars: [
                  { label: L("Teclados", "Keyboards"), value: 18 },
                  { label: L("Ratones", "Mice"), value: 6 },
                  { label: L("Monitores", "Monitors"), value: 12 },
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "pulso",
      L("Un flujo se recupera de un fallo", "A workflow recovers from failure"),
      L(
        "Detecta una incidencia, reintenta y deja constancia del resultado.",
        "A failure is detected, retried and recorded.",
      ),
      "microsoft",
      ["Power Automate", "Azure", "Python"],
      [
        scene(
          "recover-service",
          L("Recuperar el informe diario", "Recover the daily report"),
          L(
            "El flujo termina y conserva el registro del fallo y del reintento.",
            "The workflow finishes and retains its failure and retry history.",
          ),
          start("monitor", L("Supervisión de flujos", "Workflow monitoring"), {
            rows: [
              row(
                L("Informe diario", "Daily report"),
                L("Esperando inicio", "Waiting to start"),
                S.ready,
              ),
            ],
          }),
          [
            step(
              L("Inicia el flujo", "Start the workflow"),
              "Power Automate",
              "automate",
              L("Comienza la lectura de datos…", "Starting the data read…"),
              L("Ejecución iniciada", "Execution started"),
              {
                status: L("En ejecución", "Running"),
                rows: [
                  row(
                    L("Informe diario", "Daily report"),
                    L("Intento 1", "Attempt 1"),
                    L("Leyendo datos", "Reading data"),
                  ),
                ],
                metrics: [metric(L("Incidencias", "Incidents"), "0")],
              },
            ),
            step(
              L("Detecta la incidencia", "Detect the incident"),
              "Azure",
              "cloud",
              L(
                "El servicio de ejemplo no responde…",
                "The sample service does not respond…",
              ),
              L("Fallo registrado", "Failure recorded"),
              {
                status: L("Servicio sin respuesta", "Service not responding"),
                rows: [
                  row(
                    L("Informe diario", "Daily report"),
                    L("Intento 1", "Attempt 1"),
                    S.blocked,
                  ),
                ],
                metrics: [metric(L("Incidencias", "Incidents"), "1")],
              },
            ),
            step(
              L("Reintenta la operación", "Retry the operation"),
              "Power Automate",
              "automate",
              L("Se realiza un segundo intento…", "Making a second attempt…"),
              L("El servicio vuelve a responder", "The service responds again"),
              {
                status: L("Conexión recuperada", "Connection recovered"),
                rows: [
                  row(
                    L("Informe diario", "Daily report"),
                    L("Intento 2", "Attempt 2"),
                    L("Datos recibidos", "Data received"),
                  ),
                ],
                metrics: [metric(L("Intentos", "Attempts"), "2")],
              },
            ),
            step(
              L("Cierra y documenta", "Finish and record"),
              "Python · Azure",
              "python",
              L(
                "Se registra el resultado final…",
                "Recording the final result…",
              ),
              L(
                "Informe completado tras el reintento",
                "Report completed after retry",
              ),
              {
                status: S.done,
                rows: [
                  row(
                    L("Intento 1", "Attempt 1"),
                    L("Servicio sin respuesta", "Service not responding"),
                    S.blocked,
                  ),
                  row(
                    L("Intento 2", "Attempt 2"),
                    L("Informe generado", "Report generated"),
                    S.done,
                  ),
                ],
                metrics: [
                  metric(L("Intentos", "Attempts"), "2"),
                  metric(L("Incidencias abiertas", "Open incidents"), "0"),
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "canal",
      L("Respuestas con datos y permisos", "Answers with data and permissions"),
      L(
        "Una consulta muestra su fuente y respeta el alcance del rol.",
        "A query shows its source and respects the role scope.",
      ),
      "ai",
      ["Copilot Studio", "Dataverse", "LangChain · RAG"],
      [
        scene(
          "sales-evidence",
          L("Consulta de ventas", "Sales query"),
          L(
            "La respuesta del ejemplo muestra el total y los datos que lo sostienen.",
            "The sample answer shows the total and its supporting data.",
          ),
          start("messages", L("Asistente de datos", "Data assistant"), {
            messages: [],
          }),
          [
            step(
              L("Recibe una pregunta", "Receive a question"),
              "Copilot Studio",
              "ai",
              L("Llega la consulta del ejemplo…", "The sample query arrives…"),
              L("Pregunta recibida", "Question received"),
              {
                status: L("Consulta recibida", "Query received"),
                messages: [
                  msg(
                    L(
                      "¿Cuánto vendimos por país?",
                      "How much did we sell by country?",
                    ),
                  ),
                ],
              },
            ),
            step(
              L("Comprueba el permiso", "Check permission"),
              "Dataverse",
              "dataverse",
              L(
                "Se revisa el rol de Dirección…",
                "Checking the Management role…",
              ),
              L("El rol puede consultar ventas", "The role can query sales"),
              {
                status: L("Acceso permitido", "Access allowed"),
                fields: [
                  field(
                    L("Rol del ejemplo", "Sample role"),
                    L("Dirección", "Management"),
                  ),
                ],
                messages: [
                  msg(
                    L(
                      "¿Cuánto vendimos por país?",
                      "How much did we sell by country?",
                    ),
                  ),
                ],
              },
            ),
            step(
              L("Consulta la fuente", "Query the source"),
              "Dataverse",
              "dataverse",
              L(
                "Se leen seis registros de ejemplo…",
                "Reading six sample records…",
              ),
              L("Seis registros disponibles", "Six records available"),
              {
                status: L("Datos encontrados", "Data found"),
                rows: [
                  row("El Salvador", "$8,000"),
                  row("Guatemala", "$11,300"),
                  row("Costa Rica", "$8,500"),
                ],
                metrics: [
                  metric(L("Registros de origen", "Source records"), "6"),
                ],
              },
            ),
            step(
              L("Responde con evidencia", "Answer with evidence"),
              "Copilot Studio",
              "ai",
              L(
                "Se presenta la respuesta preparada…",
                "Presenting the prepared answer…",
              ),
              L("Total y fuente visibles", "Total and source visible"),
              {
                status: L("Respuesta del ejemplo", "Sample answer"),
                messages: [
                  msg(
                    L(
                      "¿Cuánto vendimos por país?",
                      "How much did we sell by country?",
                    ),
                  ),
                  msg(
                    L(
                      "Total: $27,800. Fuente: 6 registros de la demo.",
                      "Total: $27,800. Source: 6 demo records.",
                    ),
                    "out",
                  ),
                ],
                rows: [
                  row("El Salvador", "$8,000"),
                  row("Guatemala", "$11,300"),
                  row("Costa Rica", "$8,500"),
                ],
              },
            ),
          ],
        ),
        scene(
          "restricted-query",
          L("Consulta fuera del permiso", "Query outside the permission"),
          L(
            "El rol de Operaciones ve sus solicitudes; no recibe datos de ventas.",
            "The Operations role sees its requests; it does not receive sales data.",
          ),
          start(
            "messages",
            L("Consulta con permisos", "Query with permissions"),
            { messages: [] },
          ),
          [
            step(
              L("Recibe una consulta de ventas", "Receive a sales query"),
              "Copilot Studio",
              "ai",
              L(
                "El rol de Operaciones pregunta por ventas…",
                "The Operations role asks about sales…",
              ),
              L("Consulta recibida", "Query received"),
              {
                status: L("Comprobando alcance", "Checking scope"),
                fields: [
                  field(L("Rol", "Role"), L("Operaciones", "Operations")),
                ],
                messages: [
                  msg(L("Muéstrame las ventas.", "Show me the sales.")),
                ],
              },
            ),
            step(
              L("Protege el alcance del rol", "Protect the role scope"),
              "Dataverse",
              "dataverse",
              L(
                "Se comprueba la regla del ejemplo…",
                "Checking the sample rule…",
              ),
              L(
                "Ventas no está permitido para este rol",
                "Sales is not allowed for this role",
              ),
              {
                status: L("Consulta no permitida", "Query not allowed"),
                messages: [
                  msg(L("Muéstrame las ventas.", "Show me the sales.")),
                  msg(
                    L(
                      "Este rol no puede consultar ventas.",
                      "This role cannot query sales.",
                    ),
                    "out",
                  ),
                ],
                metrics: [],
              },
            ),
            step(
              L("Consulta un dato permitido", "Query an allowed dataset"),
              "Copilot Studio · Dataverse",
              "ai",
              L(
                "La demostración cambia a solicitudes pendientes…",
                "The demonstration switches to pending requests…",
              ),
              L("Dos solicitudes de Operaciones", "Two Operations requests"),
              {
                status: L("Consulta permitida", "Query allowed"),
                messages: [
                  msg(
                    L(
                      "¿Qué solicitudes tengo pendientes?",
                      "Which requests are pending?",
                    ),
                  ),
                  msg(
                    L(
                      "Hay 2 solicitudes de Operaciones pendientes.",
                      "There are 2 pending Operations requests.",
                    ),
                    "out",
                  ),
                ],
                rows: [
                  row("S-201", L("Operaciones", "Operations"), S.pending),
                  row("S-203", L("Operaciones", "Operations"), S.pending),
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "reloj",
      L("Cuatro fuentes, un cierre", "Four sources, one close"),
      L(
        "Los datos se unen, se validan y muestran cuándo publicar o detenerse.",
        "Data is combined and checked, showing when to publish or stop.",
      ),
      "data",
      ["Power Automate", "Power BI", "SQL Server", "SharePoint", "Python"],
      [
        consolidation("complete-close", "current"),
        consolidation("missing-source", "blocked"),
        consolidation("source-recovery", "recovery"),
      ],
    ),
    demo(
      "integraciones",
      L("Un pedido, varios sistemas", "One order, several systems"),
      L(
        "El pedido llega a la API y sus reintentos no crean duplicados.",
        "The order reaches the API and retries do not create duplicates.",
      ),
      "web",
      [
        "React · Next.js",
        "TypeScript",
        "FastAPI",
        "NestJS · Node",
        "PostgreSQL",
        "n8n",
      ],
      [
        scene(
          "order-once",
          L("Registrar una orden una sola vez", "Record an order only once"),
          L(
            "El mismo pedido conserva un único registro aunque se reintente.",
            "The same order retains one record even after a retry.",
          ),
          start("records", L("Seguimiento de pedidos", "Order tracking"), {
            rows: [],
          }),
          [
            step(
              L("Recibe el pedido web", "Receive the web order"),
              "React · Next.js",
              "code",
              L(
                "Se completa el pedido de ejemplo…",
                "Completing the sample order…",
              ),
              L("Pedido WEB-032 preparado", "Order WEB-032 ready"),
              {
                status: S.pending,
                fields: [
                  field(L("Pedido", "Order"), "WEB-032"),
                  field(L("Importe", "Amount"), "$180"),
                ],
              },
            ),
            step(
              L("Valida y registra", "Validate and record"),
              "FastAPI · PostgreSQL",
              "api",
              L(
                "La API comprueba la clave del pedido…",
                "The API checks the order key…",
              ),
              L("Se crea un registro", "One record created"),
              {
                status: S.saved,
                rows: [row("WEB-032", "$180", S.saved)],
                metrics: [metric(L("Registros", "Records"), "1")],
              },
            ),
            step(
              L(
                "Recibe el mismo pedido otra vez",
                "Receive the same order again",
              ),
              "n8n · API",
              "api",
              L(
                "Un reintento trae la misma clave…",
                "A retry brings the same key…",
              ),
              L("La clave ya existe", "The key already exists"),
              {
                status: L("Reintento identificado", "Retry identified"),
                rows: [
                  row(
                    "WEB-032",
                    "$180",
                    L("Ya registrado", "Already recorded"),
                  ),
                ],
                metrics: [
                  metric(L("Intentos", "Attempts"), "2"),
                  metric(L("Registros", "Records"), "1"),
                ],
              },
            ),
            step(
              L("Confirma sin duplicar", "Confirm without duplicating"),
              "PostgreSQL",
              "sql",
              L(
                "Se devuelve el registro existente…",
                "Returning the existing record…",
              ),
              L("Un pedido, un registro", "One order, one record"),
              {
                status: S.done,
                rows: [row("WEB-032", "$180", L("Confirmado", "Confirmed"))],
                metrics: [
                  metric(L("Intentos", "Attempts"), "2"),
                  metric(L("Registros", "Records"), "1"),
                ],
                action: L(
                  "Duplicado evitado en el ejemplo",
                  "Duplicate avoided in the example",
                ),
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "despliegue",
      L("Una versión pasa por controles", "A release passes through checks"),
      L(
        "Se ejecutan pruebas, se muestra una versión y se simula su reversión.",
        "Tests run, a version is displayed and its rollback is simulated.",
      ),
      "web",
      ["GitHub Actions", "Docker", "Azure", "Cloudflare"],
      [
        scene(
          "release-rollback",
          L(
            "Publicación y vuelta a una versión estable",
            "Release and return to a stable version",
          ),
          L(
            "La simulación termina en la versión anterior tras detectar una incidencia.",
            "The simulation returns to the previous version after detecting an incident.",
          ),
          start(
            "deployment",
            L("Entrega de la aplicación", "Application delivery"),
            {
              rows: [
                row(
                  L("Versión visible", "Visible version"),
                  "1.0",
                  L("Estable", "Stable"),
                ),
              ],
            },
          ),
          [
            step(
              L("Comprueba los cambios", "Check the changes"),
              "GitHub Actions",
              "github",
              L(
                "Se ejecutan las pruebas del ejemplo…",
                "Running the sample checks…",
              ),
              L("Tres controles superados", "Three checks passed"),
              {
                status: L("Pruebas superadas", "Checks passed"),
                rows: [
                  row(L("Sintaxis", "Syntax"), L("Correcta", "Valid"), S.done),
                  row(L("Pruebas", "Tests"), L("Correctas", "Passing"), S.done),
                  row(
                    L("Accesibilidad", "Accessibility"),
                    L("Comprobada", "Checked"),
                    S.done,
                  ),
                ],
              },
            ),
            step(
              L("Prepara la versión", "Prepare the version"),
              "Docker",
              "docker",
              L(
                "Se prepara el paquete de ejemplo…",
                "Preparing the sample package…",
              ),
              L("Paquete 1.1 preparado", "Package 1.1 ready"),
              {
                status: S.ready,
                rows: [
                  row(
                    L("Versión actual", "Current version"),
                    "1.0",
                    L("Estable", "Stable"),
                  ),
                  row(L("Nueva versión", "New version"), "1.1", S.ready),
                ],
              },
            ),
            step(
              L("Muestra la nueva versión", "Show the new version"),
              "Azure · Cloudflare",
              "cloud",
              L(
                "La vista de la demo cambia de versión…",
                "The demo view changes version…",
              ),
              L(
                "Versión 1.1 visible en la demo",
                "Version 1.1 visible in the demo",
              ),
              {
                status: L("Versión 1.1", "Version 1.1"),
                rows: [
                  row(
                    L("Versión visible", "Visible version"),
                    "1.1",
                    L("En observación", "Under observation"),
                  ),
                ],
              },
            ),
            step(
              L("Detecta una incidencia", "Detect an incident"),
              "Azure",
              "cloud",
              L(
                "Un control detecta un fallo simulado…",
                "A check detects a simulated failure…",
              ),
              L(
                "Se solicita volver a la versión anterior",
                "A return to the previous version is requested",
              ),
              {
                status: L("Incidencia detectada", "Incident detected"),
                rows: [
                  row(
                    L("Versión visible", "Visible version"),
                    "1.1",
                    S.blocked,
                  ),
                ],
                action: L("Reversión preparada", "Rollback prepared"),
              },
            ),
            step(
              L("Restaura la versión anterior", "Restore the previous version"),
              "GitHub Actions",
              "github",
              L(
                "La demo vuelve a la versión 1.0…",
                "The demo returns to version 1.0…",
              ),
              L("Versión anterior restaurada", "Previous version restored"),
              {
                status: L(
                  "Versión estable restaurada",
                  "Stable version restored",
                ),
                rows: [
                  row(
                    L("Versión visible", "Visible version"),
                    "1.0",
                    L("Estable", "Stable"),
                  ),
                  row(
                    L("Versión retirada", "Removed version"),
                    "1.1",
                    L("Revisión pendiente", "Review pending"),
                  ),
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "prisma",
      L("De una hoja a un tablero", "From spreadsheet to dashboard"),
      L(
        "Un archivo de muestra se organiza y se transforma en una vista de datos.",
        "A sample file is organized and transformed into a data view.",
      ),
      "data",
      ["Excel", "Power BI", "Python"],
      [
        scene(
          "spreadsheet-dashboard",
          L("Resumen de una hoja de ventas", "Spreadsheet sales summary"),
          L(
            "Los cuatro registros quedan resumidos sin perder sus importes.",
            "The four records are summarized without losing their amounts.",
          ),
          start("dashboard", L("Resumen del archivo", "File summary"), {
            rows: [],
            metrics: [],
            bars: [],
          }),
          [
            step(
              L("Recibe la hoja", "Receive the spreadsheet"),
              "Excel",
              "excel",
              L("Se abre el archivo de muestra…", "Opening the sample file…"),
              L("Cuatro filas disponibles", "Four rows available"),
              {
                status: L("Archivo recibido", "File received"),
                rows: [
                  row("V-01", "$100"),
                  row("V-02", "$150"),
                  row("V-03", "$200"),
                  row("V-04", "$50"),
                ],
              },
            ),
            step(
              L("Ordena las columnas", "Organize the columns"),
              "Python",
              "python",
              L(
                "Se reconocen categoría e importe…",
                "Recognizing category and amount…",
              ),
              L("Importes listos para sumar", "Amounts ready to add"),
              {
                status: L("Datos estructurados", "Structured data"),
                fields: [
                  field(L("Filas válidas", "Valid rows"), "4"),
                  field(
                    L("Columnas utilizadas", "Columns used"),
                    L("Categoría · Importe", "Category · Amount"),
                  ),
                ],
                rows: [
                  row(L("Productos", "Products"), "$250"),
                  row(L("Servicios", "Services"), "$250"),
                ],
              },
            ),
            step(
              L("Dibuja el resumen", "Draw the summary"),
              "Power BI",
              "bi",
              L(
                "Se presenta el total y sus categorías…",
                "Presenting the total and categories…",
              ),
              L("Total del archivo: $500", "File total: $500"),
              {
                status: L("Tablero preparado", "Dashboard ready"),
                metrics: [
                  metric(L("Importe", "Amount"), "$500"),
                  metric(L("Registros", "Records"), "4"),
                ],
                bars: [
                  { label: L("Productos", "Products"), value: 250 },
                  { label: L("Servicios", "Services"), value: 250 },
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "orquesta",
      L("La compra llega a quien aprueba", "The purchase reaches its approver"),
      L(
        "Una solicitud recorre la cadena de revisión correspondiente.",
        "A request follows the appropriate review chain.",
      ),
      "microsoft",
      ["Power Apps", "Power Automate", "Dataverse", "Teams"],
      [
        scene(
          "purchase-chain",
          L("Compra con dos revisiones", "Purchase with two reviews"),
          L(
            "Las dos decisiones quedan asociadas a la solicitud.",
            "Both decisions remain attached to the request.",
          ),
          start("records", L("Solicitud de compra", "Purchase request"), {
            rows: [],
          }),
          [
            step(
              L("Registra la compra", "Record the purchase"),
              "Power Apps",
              "apps",
              L("La app registra el pedido…", "The app records the request…"),
              L("Solicitud de $2,400 registrada", "$2,400 request recorded"),
              {
                status: S.pending,
                fields: [
                  field(L("Solicitud", "Request"), "COM-018"),
                  field(L("Importe", "Amount"), "$2,400"),
                ],
              },
            ),
            step(
              L("Determina los revisores", "Determine the reviewers"),
              "Power Automate",
              "automate",
              L("Se aplica la regla del ejemplo…", "Applying the sample rule…"),
              L(
                "Requiere Operaciones y Finanzas",
                "Operations and Finance required",
              ),
              {
                status: L("Ruta definida", "Route defined"),
                rows: [
                  row(
                    L("Operaciones", "Operations"),
                    L("Primera revisión", "First review"),
                    S.pending,
                  ),
                  row(
                    L("Finanzas", "Finance"),
                    L("Segunda revisión", "Second review"),
                    S.pending,
                  ),
                ],
              },
            ),
            step(
              L("Revisa Operaciones", "Operations reviews"),
              "Teams",
              "teams",
              L(
                "Se presenta la justificación…",
                "Presenting the business reason…",
              ),
              L("Primera aprobación recibida", "First approval received"),
              {
                status: S.review,
                rows: [
                  row(
                    L("Operaciones", "Operations"),
                    L("Necesidad validada", "Need validated"),
                    S.approved,
                  ),
                  row(
                    L("Finanzas", "Finance"),
                    L("Presupuesto pendiente", "Budget pending"),
                    S.pending,
                  ),
                ],
              },
            ),
            step(
              L("Revisa Finanzas", "Finance reviews"),
              "Teams · Dataverse",
              "dataverse",
              L(
                "Se revisa el presupuesto del ejemplo…",
                "Reviewing the sample budget…",
              ),
              L(
                "Las dos aprobaciones quedan registradas",
                "Both approvals recorded",
              ),
              {
                status: S.approved,
                rows: [
                  row(
                    L("Operaciones", "Operations"),
                    L("Necesidad validada", "Need validated"),
                    S.approved,
                  ),
                  row(
                    L("Finanzas", "Finance"),
                    L("Presupuesto validado", "Budget validated"),
                    S.approved,
                  ),
                ],
                metrics: [metric(L("Aprobaciones", "Approvals"), "2 / 2")],
              },
            ),
          ],
        ),
      ],
    ),

    demo(
      "centinela",
      L("Una factura se comprueba sola", "An invoice checks itself"),
      L(
        "La factura se compara con la orden antes de continuar.",
        "The invoice is compared with the order before continuing.",
      ),
      "microsoft",
      ["Power Automate", "SQL Server", "Teams"],
      [
        scene(
          "invoice-mismatch",
          L(
            "Una diferencia requiere revisión",
            "A discrepancy requires review",
          ),
          L(
            "La diferencia se revisa antes de aceptar la factura del ejemplo.",
            "The discrepancy is reviewed before accepting the sample invoice.",
          ),
          start("document", L("Factura de ejemplo", "Sample invoice"), {
            fields: [],
          }),
          [
            step(
              L("Recibe la factura", "Receive the invoice"),
              "Power Automate",
              "automate",
              L(
                "Llega el documento de ejemplo…",
                "The sample document arrives…",
              ),
              L("Factura FAC-016 recibida", "Invoice FAC-016 received"),
              {
                status: L("Recibida", "Received"),
                fields: [
                  field(L("Factura", "Invoice"), "FAC-016"),
                  field(L("Total", "Total"), "$105"),
                ],
              },
            ),
            step(
              L("Compara con la orden", "Compare with the order"),
              "SQL Server",
              "sql",
              L(
                "Se consulta el importe autorizado…",
                "Looking up the authorized amount…",
              ),
              L("Orden: $100 · factura: $105", "Order: $100 · invoice: $105"),
              {
                status: L("Diferencia detectada", "Discrepancy detected"),
                fields: [
                  field(L("Orden de compra", "Purchase order"), "$100"),
                  field(L("Factura", "Invoice"), "$105", true),
                  field(L("Diferencia", "Difference"), "$5", true),
                ],
                metrics: [
                  metric(L("Tolerancia del ejemplo", "Sample tolerance"), "$2"),
                ],
              },
            ),
            step(
              L("Pide una revisión", "Request a review"),
              "Teams",
              "teams",
              L(
                "La diferencia supera la tolerancia…",
                "The discrepancy exceeds tolerance…",
              ),
              L(
                "La factura no se acepta todavía",
                "The invoice is not accepted yet",
              ),
              {
                status: S.review,
                fields: [
                  field(L("Factura", "Invoice"), "FAC-016"),
                  field(L("Diferencia", "Difference"), "$5", true),
                ],
                action: L(
                  "Responsable revisando el importe",
                  "Reviewer checking the amount",
                ),
              },
            ),
            step(
              L("Registra la corrección", "Record the correction"),
              "Power Automate · SQL Server",
              "sql",
              L(
                "El ejemplo recibe el importe corregido…",
                "The example receives the corrected amount…",
              ),
              L("Orden y factura coinciden", "Order and invoice match"),
              {
                status: S.approved,
                fields: [
                  field(L("Orden", "Order"), "$100"),
                  field(
                    L("Factura corregida", "Corrected invoice"),
                    "$100",
                    true,
                  ),
                  field(L("Diferencia", "Difference"), "$0"),
                ],
                action: L(
                  "Factura validada en el ejemplo",
                  "Invoice validated in the example",
                ),
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "relevo",
      L(
        "Un alta coordina varias tareas",
        "One onboarding coordinates several tasks",
      ),
      L(
        "El alta prepara accesos, equipo y bienvenida en una misma secuencia.",
        "Onboarding prepares access, equipment and welcome in one sequence.",
      ),
      "microsoft",
      ["Power Automate", "Microsoft 365", "Teams", "SharePoint"],
      [
        scene(
          "onboarding",
          L("Alta de un nuevo puesto", "Onboarding a new role"),
          L(
            "Las tareas del alta quedan registradas y su estado es visible.",
            "Onboarding tasks are recorded and their status is visible.",
          ),
          start("records", L("Plan de incorporación", "Onboarding plan"), {
            rows: [],
          }),
          [
            step(
              L("Recibe el alta", "Receive the onboarding request"),
              "SharePoint",
              "sharepoint",
              L(
                "Se registra un nuevo puesto de ejemplo…",
                "Recording a new sample role…",
              ),
              L("Puesto de soporte registrado", "Support role recorded"),
              {
                status: S.pending,
                fields: [
                  field(
                    L("Puesto", "Role"),
                    L("Soporte interno", "Internal support"),
                  ),
                  field(
                    L("Área", "Department"),
                    L("Operaciones", "Operations"),
                  ),
                ],
              },
            ),
            step(
              L("Crea las tareas", "Create the tasks"),
              "Power Automate",
              "automate",
              L(
                "Se asignan las tareas por responsable…",
                "Assigning tasks by responsible role…",
              ),
              L("Tres tareas preparadas", "Three tasks prepared"),
              {
                status: L("Tareas creadas", "Tasks created"),
                rows: [
                  row(
                    L("Accesos", "Access"),
                    L("Administración TI", "IT administration"),
                    S.pending,
                  ),
                  row(
                    L("Equipo", "Equipment"),
                    L("Soporte", "Support"),
                    S.pending,
                  ),
                  row(
                    L("Bienvenida", "Welcome"),
                    L("Coordinación", "Coordination"),
                    S.pending,
                  ),
                ],
              },
            ),
            step(
              L("Prepara accesos y equipo", "Prepare access and equipment"),
              "Microsoft 365",
              "cloud",
              L(
                "El ejemplo completa las tareas previas…",
                "The example completes prerequisite tasks…",
              ),
              L("Accesos y equipo preparados", "Access and equipment ready"),
              {
                status: L("Preparación completada", "Preparation completed"),
                rows: [
                  row(
                    L("Accesos", "Access"),
                    L("Administración TI", "IT administration"),
                    S.done,
                  ),
                  row(
                    L("Equipo", "Equipment"),
                    L("Soporte", "Support"),
                    S.done,
                  ),
                  row(
                    L("Bienvenida", "Welcome"),
                    L("Coordinación", "Coordination"),
                    S.pending,
                  ),
                ],
              },
            ),
            step(
              L("Envía la bienvenida", "Send the welcome"),
              "Teams",
              "teams",
              L(
                "Se prepara la bienvenida del ejemplo…",
                "Preparing the sample welcome…",
              ),
              L(
                "Las tres tareas están completadas",
                "All three tasks completed",
              ),
              {
                status: S.done,
                rows: [
                  row(L("Accesos", "Access"), L("Preparados", "Ready"), S.done),
                  row(
                    L("Equipo", "Equipment"),
                    L("Preparado", "Ready"),
                    S.done,
                  ),
                  row(
                    L("Bienvenida", "Welcome"),
                    L("Registrada", "Recorded"),
                    S.done,
                  ),
                ],
                metrics: [metric(L("Tareas", "Tasks"), "3 / 3")],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "boveda",
      L("Un documento se convierte en datos", "A document becomes data"),
      L(
        "Los campos aparecen en una ficha y el dato dudoso pasa a revisión.",
        "Fields appear in a record and uncertain data goes to review.",
      ),
      "ai",
      ["Document AI", "Power Apps", "Python"],
      [
        scene(
          "document-review",
          L("Captura y revisión documental", "Document capture and review"),
          L(
            "El campo dudoso se confirma antes de guardar la ficha.",
            "The uncertain field is confirmed before the record is saved.",
          ),
          start("document", L("Ficha del documento", "Document record"), {
            fields: [],
          }),
          [
            step(
              L("Recibe el documento", "Receive the document"),
              "Power Apps",
              "apps",
              L(
                "La demo incorpora un documento de muestra…",
                "The demo adds a sample document…",
              ),
              L("Documento preparado", "Document ready"),
              {
                status: L("Documento recibido", "Document received"),
                fields: [
                  field(L("Archivo", "File"), "documento-021.pdf"),
                  field(
                    L("Estado", "Status"),
                    L("Por revisar", "Awaiting review"),
                  ),
                ],
              },
            ),
            step(
              L("Muestra los campos detectados", "Show detected fields"),
              "Document AI",
              "ai",
              L(
                "Se muestran los campos preparados para el ejemplo…",
                "Showing the fields prepared for the example…",
              ),
              L(
                "Dos campos claros y uno por revisar",
                "Two clear fields and one to review",
              ),
              {
                status: L("Revisión de un campo", "One field needs review"),
                fields: [
                  field(L("Referencia", "Reference"), "DOC-021"),
                  field(L("Importe", "Amount"), "$320"),
                  field(
                    L("Fecha", "Date"),
                    L("Lectura dudosa", "Uncertain reading"),
                    true,
                  ),
                ],
              },
            ),
            step(
              L("Revisa el dato dudoso", "Review the uncertain field"),
              "Power Apps",
              "apps",
              L(
                "El ejemplo confirma el campo marcado…",
                "The example confirms the marked field…",
              ),
              L("Fecha confirmada en la ficha", "Date confirmed in the record"),
              {
                status: L("Campos confirmados", "Fields confirmed"),
                fields: [
                  field(L("Referencia", "Reference"), "DOC-021"),
                  field(L("Importe", "Amount"), "$320"),
                  field(
                    L("Fecha", "Date"),
                    L("15 de marzo · ejemplo", "March 15 · sample"),
                    true,
                  ),
                ],
              },
            ),
            step(
              L("Guarda la ficha", "Save the record"),
              "Python",
              "python",
              L(
                "Se prepara el registro estructurado…",
                "Preparing the structured record…",
              ),
              L(
                "Ficha disponible para el siguiente proceso",
                "Record ready for the next process",
              ),
              {
                status: S.saved,
                fields: [
                  field(L("Referencia", "Reference"), "DOC-021"),
                  field(L("Importe", "Amount"), "$320"),
                  field(
                    L("Fecha", "Date"),
                    L("15 de marzo · ejemplo", "March 15 · sample"),
                  ),
                ],
                rows: [
                  row(
                    "DOC-021",
                    L("Campos revisados", "Fields reviewed"),
                    S.saved,
                  ),
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "cartero",
      L("El informe llega a cada área", "The report reaches each department"),
      L(
        "La entrega registra sus resultados y reintenta solo el envío pendiente.",
        "Delivery records its results and retries only the pending send.",
      ),
      "microsoft",
      ["Power Automate", "Outlook", "SharePoint"],
      [
        scene(
          "report-delivery",
          L("Entrega de un informe", "Report delivery"),
          L(
            "El reintento completa la entrega pendiente sin repetir las otras.",
            "The retry completes the pending delivery without repeating the others.",
          ),
          start("records", L("Entrega del cierre", "Close report delivery"), {
            rows: [],
          }),
          [
            step(
              L("Prepara el informe", "Prepare the report"),
              "SharePoint",
              "sharepoint",
              L(
                "Se selecciona el archivo del ejemplo…",
                "Selecting the sample file…",
              ),
              L("Informe preparado", "Report ready"),
              {
                status: S.ready,
                fields: [field(L("Archivo", "File"), "cierre-ejemplo.pdf")],
                metrics: [
                  metric(
                    L("Áreas destinatarias", "Recipient departments"),
                    "3",
                  ),
                ],
              },
            ),
            step(
              L("Distribuye por área", "Distribute by department"),
              "Power Automate · Outlook",
              "outlook",
              L(
                "Se simula la entrega a tres áreas…",
                "Simulating delivery to three departments…",
              ),
              L(
                "Dos entregas y una pendiente",
                "Two delivered and one pending",
              ),
              {
                status: L("Una entrega pendiente", "One delivery pending"),
                rows: [
                  row(
                    L("Operaciones", "Operations"),
                    L("Informe", "Report"),
                    S.sent,
                  ),
                  row(L("Finanzas", "Finance"), L("Informe", "Report"), S.sent),
                  row(
                    L("Dirección", "Management"),
                    L("Informe", "Report"),
                    S.pending,
                  ),
                ],
              },
            ),
            step(
              L(
                "Reintenta solo la pendiente",
                "Retry only the pending delivery",
              ),
              "Power Automate",
              "automate",
              L(
                "Se procesa el envío a Dirección…",
                "Processing the send to Management…",
              ),
              L("El reintento completa la entrega", "Retry completes delivery"),
              {
                status: L("Entrega recuperada", "Delivery recovered"),
                rows: [
                  row(
                    L("Operaciones", "Operations"),
                    L("Sin reenvío", "Not resent"),
                    S.sent,
                  ),
                  row(
                    L("Finanzas", "Finance"),
                    L("Sin reenvío", "Not resent"),
                    S.sent,
                  ),
                  row(
                    L("Dirección", "Management"),
                    L("Segundo intento", "Second attempt"),
                    S.sent,
                  ),
                ],
              },
            ),
            step(
              L("Registra el resultado", "Record the result"),
              "SharePoint",
              "sharepoint",
              L(
                "Se cierra la bitácora del ejemplo…",
                "Closing the sample delivery log…",
              ),
              L(
                "Tres áreas con entrega registrada",
                "Delivery recorded for three departments",
              ),
              {
                status: S.done,
                rows: [
                  row(
                    L("Operaciones", "Operations"),
                    L("1 intento", "1 attempt"),
                    S.sent,
                  ),
                  row(
                    L("Finanzas", "Finance"),
                    L("1 intento", "1 attempt"),
                    S.sent,
                  ),
                  row(
                    L("Dirección", "Management"),
                    L("2 intentos", "2 attempts"),
                    S.sent,
                  ),
                ],
                metrics: [metric(L("Entregas", "Deliveries"), "3 / 3")],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "oraculo",
      L("Un pronóstico muestra su rango", "A forecast shows its range"),
      L(
        "Una serie de muestra ilustra la tendencia y su incertidumbre.",
        "A sample series illustrates its trend and uncertainty.",
      ),
      "data",
      ["Python", "Power BI"],
      [
        scene(
          "sample-forecast",
          L("Tendencia e incertidumbre", "Trend and uncertainty"),
          L(
            "La proyección ilustrativa se presenta como un rango, no como una certeza.",
            "The illustrative projection is presented as a range, not a certainty.",
          ),
          start(
            "dashboard",
            L("Proyección ilustrativa", "Illustrative projection"),
            { bars: [], metrics: [] },
          ),
          [
            step(
              L("Recibe la serie de muestra", "Receive the sample series"),
              "Python",
              "python",
              L(
                "Se leen tres periodos de ejemplo…",
                "Reading three sample periods…",
              ),
              L("Serie disponible", "Series available"),
              {
                status: L(
                  "Datos históricos de ejemplo",
                  "Sample historical data",
                ),
                bars: [
                  { label: L("Periodo 1", "Period 1"), value: 80 },
                  { label: L("Periodo 2", "Period 2"), value: 100 },
                  { label: L("Periodo 3", "Period 3"), value: 120 },
                ],
              },
            ),
            step(
              L("Ilustra la tendencia", "Illustrate the trend"),
              "Python",
              "python",
              L(
                "El ejemplo prolonga una tendencia sencilla…",
                "The example extends a simple trend…",
              ),
              L(
                "Valor central ilustrativo: 140",
                "Illustrative central value: 140",
              ),
              {
                status: L("Proyección de ejemplo", "Sample projection"),
                metrics: [metric(L("Siguiente periodo", "Next period"), "140")],
                bars: [
                  { label: L("Último periodo", "Latest period"), value: 120 },
                  { label: L("Proyección", "Projection"), value: 140 },
                ],
              },
            ),
            step(
              L("Muestra la incertidumbre", "Show uncertainty"),
              "Power BI",
              "bi",
              L(
                "Se presenta un rango de muestra…",
                "Presenting a sample range…",
              ),
              L(
                "Rango ilustrativo: de 110 a 170",
                "Illustrative range: 110 to 170",
              ),
              {
                status: L(
                  "Rango ilustrativo, sin garantía",
                  "Illustrative range, no guarantee",
                ),
                metrics: [
                  metric(L("Límite inferior", "Lower bound"), "110"),
                  metric(L("Valor central", "Central value"), "140"),
                  metric(L("Límite superior", "Upper bound"), "170"),
                ],
                bars: [
                  { label: L("Inferior", "Lower"), value: 110 },
                  { label: L("Central", "Central"), value: 140 },
                  { label: L("Superior", "Upper"), value: 170 },
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "escudo",
      L("Los datos pasan por controles", "Data passes through checks"),
      L(
        "Un duplicado y un registro incompleto se separan antes de continuar.",
        "A duplicate and an incomplete record are separated before continuing.",
      ),
      "data",
      ["Python", "SQL Server", "PostgreSQL"],
      [
        scene(
          "quality-gate",
          L("Limpiar una carga de datos", "Clean a data load"),
          L(
            "Tres registros válidos continúan; las incidencias quedan identificadas.",
            "Three valid records continue; issues remain identified.",
          ),
          start("records", L("Control de calidad", "Data quality check"), {
            rows: [],
            metrics: [],
          }),
          [
            step(
              L("Recibe cinco filas", "Receive five rows"),
              "SQL Server",
              "sql",
              L("La carga entra en revisión…", "The load enters review…"),
              L("Cinco filas recibidas", "Five rows received"),
              {
                status: L("Carga recibida", "Load received"),
                rows: [
                  row("D-01", "$100"),
                  row("D-02", "$50"),
                  row("D-02", "$50"),
                  row("D-03", L("Importe vacío", "Amount missing")),
                  row("D-04", "$75"),
                ],
                metrics: [metric(L("Filas recibidas", "Rows received"), "5")],
              },
            ),
            step(
              L("Detecta la clave repetida", "Find the repeated key"),
              "Python",
              "python",
              L("Se comparan los identificadores…", "Comparing identifiers…"),
              L("D-02 aparece dos veces", "D-02 appears twice"),
              {
                status: L("Duplicado detectado", "Duplicate detected"),
                rows: [
                  row("D-01", "$100", S.ready),
                  row("D-02", "$50", S.ready),
                  row("D-02", "$50", L("Duplicado", "Duplicate")),
                  row("D-03", L("Importe vacío", "Amount missing"), S.pending),
                  row("D-04", "$75", S.ready),
                ],
              },
            ),
            step(
              L("Comprueba campos obligatorios", "Check required fields"),
              "Python",
              "check",
              L(
                "Se valida el importe de cada registro…",
                "Validating each record amount…",
              ),
              L("D-03 requiere corrección", "D-03 needs correction"),
              {
                status: L("Dos incidencias separadas", "Two issues separated"),
                rows: [
                  row(
                    "D-02",
                    L("Copia repetida", "Repeated copy"),
                    L("Retirada", "Removed"),
                  ),
                  row("D-03", L("Importe vacío", "Amount missing"), S.review),
                ],
                metrics: [
                  metric(L("Duplicados", "Duplicates"), "1"),
                  metric(L("Por corregir", "To correct"), "1"),
                ],
              },
            ),
            step(
              L("Entrega los registros válidos", "Deliver valid records"),
              "PostgreSQL",
              "sql",
              L(
                "Solo continúa el conjunto validado…",
                "Only the validated set continues…",
              ),
              L("Tres registros, total $225", "Three records, total $225"),
              {
                status: L("Carga validada", "Validated load"),
                rows: [
                  row("D-01", "$100", S.done),
                  row("D-02", "$50", S.done),
                  row("D-04", "$75", S.done),
                ],
                metrics: [
                  metric(L("Registros válidos", "Valid records"), "3"),
                  metric(L("Total", "Total"), "$225"),
                ],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "torre",
      L(
        "La solicitud llega al equipo correcto",
        "The request reaches the right team",
      ),
      L(
        "El ejemplo clasifica el motivo y prepara la derivación.",
        "The example classifies the reason and prepares the handoff.",
      ),
      "ai",
      ["Copilot Studio", "Dataverse", "Teams"],
      [
        scene(
          "request-routing",
          L("Clasificar una solicitud de acceso", "Classify an access request"),
          L(
            "El caso queda asignado a soporte con el motivo de la derivación.",
            "The case is assigned to support with the reason for the handoff.",
          ),
          start("messages", L("Recepción de solicitudes", "Request intake"), {
            messages: [],
          }),
          [
            step(
              L("Recibe la solicitud", "Receive the request"),
              "Copilot Studio",
              "ai",
              L("Llega un mensaje de ejemplo…", "A sample message arrives…"),
              L("Solicitud recibida", "Request received"),
              {
                status: L("Mensaje recibido", "Message received"),
                messages: [
                  msg(
                    L(
                      "No puedo acceder a mi cuenta.",
                      "I cannot access my account.",
                    ),
                  ),
                ],
              },
            ),
            step(
              L("Reconoce el motivo", "Identify the reason"),
              "Copilot Studio",
              "ai",
              L(
                "La escena muestra la clasificación preparada de un problema de acceso…",
                "The scene shows the prepared classification of an access issue…",
              ),
              L("Motivo: acceso a una cuenta", "Reason: account access"),
              {
                status: L("Clasificación del ejemplo", "Sample classification"),
                fields: [
                  field(
                    L("Categoría", "Category"),
                    L("Accesos", "Access"),
                    true,
                  ),
                  field(
                    L("Origen", "Source"),
                    L("Clasificación preparada", "Prepared classification"),
                  ),
                ],
              },
            ),
            step(
              L("Registra el caso", "Record the case"),
              "Dataverse",
              "dataverse",
              L("Se prepara la ficha del caso…", "Preparing the case record…"),
              L(
                "Caso CAS-025 creado en la demo",
                "Case CAS-025 created in the demo",
              ),
              {
                status: S.saved,
                rows: [
                  row(
                    "CAS-025",
                    L("Acceso a cuenta", "Account access"),
                    L("Soporte", "Support"),
                  ),
                ],
                fields: [
                  field(L("Categoría", "Category"), L("Accesos", "Access")),
                ],
              },
            ),
            step(
              L("Avisa al equipo", "Notify the team"),
              "Teams",
              "teams",
              L(
                "Se prepara el aviso para soporte…",
                "Preparing the support notice…",
              ),
              L("Equipo y motivo visibles", "Team and reason visible"),
              {
                status: L("Derivación preparada", "Handoff prepared"),
                messages: [
                  msg(
                    L(
                      "CAS-025 · Acceso a cuenta · Equipo de soporte.",
                      "CAS-025 · Account access · Support team.",
                    ),
                    "out",
                  ),
                ],
                rows: [row("CAS-025", L("Soporte", "Support"), S.pending)],
              },
            ),
          ],
        ),
      ],
    ),
    demo(
      "ruta",
      L(
        "Una visita sigue aunque no haya conexión",
        "A visit continues without a connection",
      ),
      L(
        "Las visitas cambian de estado y se sincronizan al recuperar la conexión.",
        "Visits change status and synchronize when the connection returns.",
      ),
      "web",
      ["React · Next.js", "PostgreSQL", "APIs"],
      [
        scene(
          "offline-visits",
          L(
            "Visitas con registro sin conexión",
            "Visits with offline recording",
          ),
          L(
            "El registro local se sincroniza sin duplicar la visita completada.",
            "The local record synchronizes without duplicating the completed visit.",
          ),
          start("app", L("Visitas del día", "Daily visits"), { rows: [] }),
          [
            step(
              L("Carga las visitas", "Load the visits"),
              "React · Next.js",
              "map",
              L(
                "La app muestra las visitas del ejemplo…",
                "The app shows the sample visits…",
              ),
              L("Tres paradas preparadas", "Three stops ready"),
              {
                status: L("Con conexión", "Online"),
                rows: [
                  row(
                    L("Parada 1", "Stop 1"),
                    L("Zona Norte", "North area"),
                    S.pending,
                  ),
                  row(
                    L("Parada 2", "Stop 2"),
                    L("Zona Centro", "Central area"),
                    S.pending,
                  ),
                  row(
                    L("Parada 3", "Stop 3"),
                    L("Zona Sur", "South area"),
                    S.pending,
                  ),
                ],
              },
            ),
            step(
              L("Pierde la conexión", "Lose the connection"),
              "React · Next.js",
              "code",
              L(
                "El ejemplo pasa a modo sin conexión…",
                "The example switches to offline mode…",
              ),
              L("Las visitas siguen disponibles", "Visits remain available"),
              {
                status: L("Sin conexión", "Offline"),
                rows: [
                  row(
                    L("Parada 1", "Stop 1"),
                    L("Zona Norte", "North area"),
                    S.pending,
                  ),
                  row(
                    L("Parada 2", "Stop 2"),
                    L("Zona Centro", "Central area"),
                    S.pending,
                  ),
                  row(
                    L("Parada 3", "Stop 3"),
                    L("Zona Sur", "South area"),
                    S.pending,
                  ),
                ],
                action: L(
                  "Datos guardados en el ejemplo",
                  "Data saved in the example",
                ),
              },
            ),
            step(
              L("Registra una visita", "Record a visit"),
              "React · Next.js",
              "check",
              L(
                "La demo completa la primera parada…",
                "The demo completes the first stop…",
              ),
              L("Cambio guardado localmente", "Change saved locally"),
              {
                status: L(
                  "Un cambio por sincronizar",
                  "One change to synchronize",
                ),
                rows: [
                  row(
                    L("Parada 1", "Stop 1"),
                    L("Guardada localmente", "Saved locally"),
                    S.done,
                  ),
                  row(
                    L("Parada 2", "Stop 2"),
                    L("Zona Centro", "Central area"),
                    S.pending,
                  ),
                  row(
                    L("Parada 3", "Stop 3"),
                    L("Zona Sur", "South area"),
                    S.pending,
                  ),
                ],
                metrics: [
                  metric(L("Cambios pendientes", "Pending changes"), "1"),
                ],
              },
            ),
            step(
              L("Recupera y sincroniza", "Reconnect and synchronize"),
              "API · PostgreSQL",
              "api",
              L(
                "La conexión vuelve y se envía el cambio…",
                "The connection returns and the change is sent…",
              ),
              L(
                "Una visita sincronizada, sin duplicados",
                "One visit synchronized, no duplicates",
              ),
              {
                status: L("Sincronizado", "Synchronized"),
                rows: [
                  row(
                    L("Parada 1", "Stop 1"),
                    L("Sincronizada", "Synchronized"),
                    S.done,
                  ),
                  row(
                    L("Parada 2", "Stop 2"),
                    L("Zona Centro", "Central area"),
                    S.pending,
                  ),
                  row(
                    L("Parada 3", "Stop 3"),
                    L("Zona Sur", "South area"),
                    S.pending,
                  ),
                ],
                metrics: [
                  metric(L("Visitas completadas", "Completed visits"), "1 / 3"),
                  metric(L("Cambios pendientes", "Pending changes"), "0"),
                ],
              },
            ),
          ],
        ),
      ],
    ),

    demo(
      "pedido-whatsapp",
      L("De un mensaje a una orden", "From a message to an order"),
      L(
        "Un pedido recorre interpretación, inventario, aprobación y confirmación.",
        "An order moves through interpretation, stock, approval and confirmation.",
      ),
      "ai",
      ["WhatsApp", "AI agents", "Excel", "Teams", "Power Automate"],
      [whatsapp("available-stock", false), whatsapp("limited-stock", true)],
    ),
    demo(
      "agenda",
      L("Una cita organiza sus avisos", "An appointment organizes its notices"),
      L(
        "La reserva se registra y prepara confirmación y recordatorio.",
        "The booking is recorded and prepares confirmation and a reminder.",
      ),
      "microsoft",
      ["Power Apps", "Power Automate", "Outlook", "SharePoint"],
      [
        scene(
          "appointment",
          L(
            "Reserva y recordatorio de una cita",
            "Appointment booking and reminder",
          ),
          L(
            "La cita y sus avisos quedan vinculados a una misma reserva.",
            "The appointment and its notices remain linked to the same booking.",
          ),
          start("app", L("Agenda de servicios", "Service appointments"), {
            fields: [],
            rows: [],
          }),
          [
            step(
              L("Completa la reserva", "Fill in the booking"),
              "Power Apps",
              "apps",
              L(
                "La demo completa una cita de muestra…",
                "The demo fills in a sample appointment…",
              ),
              L("Datos de reserva preparados", "Booking details ready"),
              {
                status: S.draft,
                fields: [
                  field(
                    L("Servicio", "Service"),
                    L("Revisión de equipo", "Equipment check"),
                    true,
                  ),
                  field(
                    L("Día", "Day"),
                    L("Miércoles del ejemplo", "Sample Wednesday"),
                    true,
                  ),
                  field(L("Hora", "Time"), "10:00", true),
                ],
                action: L("Registrar cita", "Record appointment"),
              },
            ),
            step(
              L("Comprueba el espacio", "Check the slot"),
              "Outlook",
              "outlook",
              L(
                "Se consulta el calendario del ejemplo…",
                "Checking the sample calendar…",
              ),
              L("El espacio está disponible", "The slot is available"),
              {
                status: L("Espacio disponible", "Slot available"),
                fields: [
                  field(
                    L("Día", "Day"),
                    L("Miércoles del ejemplo", "Sample Wednesday"),
                  ),
                  field(L("Hora", "Time"), "10:00"),
                ],
                rows: [
                  row(
                    "10:00",
                    L("Revisión de equipo", "Equipment check"),
                    L("Disponible", "Available"),
                  ),
                ],
              },
            ),
            step(
              L("Registra la cita", "Record the appointment"),
              "SharePoint · Outlook",
              "sharepoint",
              L(
                "La reserva se añade al registro…",
                "Adding the booking to the register…",
              ),
              L("Reserva CIT-012 registrada", "Booking CIT-012 recorded"),
              {
                status: S.saved,
                rows: [
                  row(
                    "CIT-012",
                    L("Miércoles · 10:00", "Wednesday · 10:00"),
                    L("Confirmada", "Confirmed"),
                  ),
                ],
                fields: [
                  field(
                    L("Servicio", "Service"),
                    L("Revisión de equipo", "Equipment check"),
                  ),
                ],
              },
            ),
            step(
              L("Prepara la confirmación", "Prepare the confirmation"),
              "Power Automate · Outlook",
              "outlook",
              L(
                "Se prepara el aviso de la cita…",
                "Preparing the appointment notice…",
              ),
              L(
                "Confirmación registrada en la demo",
                "Confirmation recorded in the demo",
              ),
              {
                status: L("Confirmación preparada", "Confirmation prepared"),
                rows: [
                  row(
                    "CIT-012",
                    L("Miércoles · 10:00", "Wednesday · 10:00"),
                    L("Confirmada", "Confirmed"),
                  ),
                ],
                messages: [
                  msg(
                    L(
                      "Tu cita de ejemplo está confirmada para el miércoles a las 10:00.",
                      "Your sample appointment is confirmed for Wednesday at 10:00.",
                    ),
                    "out",
                  ),
                ],
              },
            ),
            step(
              L("Programa el recordatorio", "Schedule the reminder"),
              "Power Automate",
              "automate",
              L(
                "Se vincula el recordatorio a la reserva…",
                "Linking the reminder to the booking…",
              ),
              L(
                "Recordatorio preparado para el día anterior",
                "Reminder prepared for the previous day",
              ),
              {
                status: L("Avisos preparados", "Notices ready"),
                rows: [
                  row(L("Confirmación", "Confirmation"), "CIT-012", S.ready),
                  row(
                    L("Recordatorio", "Reminder"),
                    L("Día anterior · 10:00", "Previous day · 10:00"),
                    S.ready,
                  ),
                ],
                action: L(
                  "Reserva y avisos vinculados",
                  "Booking and notices linked",
                ),
              },
            ),
          ],
        ),
      ],
    ),
  ];
  function whatsapp(id, limited) {
    const order = L(
      "Pedido: 8 cuadernos y 4 bolígrafos.",
      "Order: 8 notebooks and 4 pens.",
    );
    const articles = [
      row(L("Cuadernos", "Notebooks"), "8 × $3"),
      row(L("Bolígrafos", "Pens"), "4 × $1"),
    ];
    const stock = [
      row(
        L("Cuadernos", "Notebooks"),
        limited
          ? L("4 disponibles · 8 solicitados", "4 available · 8 requested")
          : L("20 disponibles · 8 solicitados", "20 available · 8 requested"),
        limited ? S.review : S.ready,
      ),
      row(
        L("Bolígrafos", "Pens"),
        L("15 disponibles · 4 solicitados", "15 available · 4 requested"),
        S.ready,
      ),
    ];
    return scene(
      id,
      limited
        ? L(
            "Pedido con disponibilidad parcial",
            "Order with partial availability",
          )
        : L("Pedido con existencias disponibles", "Order with available stock"),
      limited
        ? L(
            "El pedido queda pendiente y la falta de existencias se comunica en la demo.",
            "The order stays pending and the stock shortage is communicated in the demo.",
          )
        : L(
            "El pedido queda registrado y su confirmación aparece en la conversación.",
            "The order is recorded and its confirmation appears in the conversation.",
          ),
      start("messages", L("Pedido por WhatsApp", "WhatsApp order"), {
        messages: [],
      }),
      [
        step(
          L("Llega un pedido", "An order arrives"),
          "WhatsApp",
          "whatsapp",
          L(
            "Se recibe el mensaje de ejemplo…",
            "Receiving the sample message…",
          ),
          L("Pedido recibido: 12 artículos", "Order received: 12 items"),
          {
            status: L("Pedido recibido", "Order received"),
            messages: [msg(order)],
          },
        ),
        step(
          L("Interpreta el pedido", "Interpret the order"),
          "AI agent",
          "ai",
          L(
            "Se presenta la interpretación preparada…",
            "Showing the prepared interpretation…",
          ),
          L(
            "12 artículos · precios de muestra aplicados",
            "12 items · sample prices applied",
          ),
          {
            status: L("Pedido estructurado", "Structured order"),
            messages: [msg(order)],
            rows: articles,
            metrics: [
              metric(L("Artículos", "Items"), "12"),
              metric(L("Total de muestra", "Sample total"), "$28"),
            ],
          },
        ),
        step(
          L("Verifica inventario", "Check inventory"),
          "ERP · Excel",
          "excel",
          L(
            "Se consultan las existencias de ejemplo…",
            "Checking sample stock…",
          ),
          limited
            ? L("Faltan 4 cuadernos", "4 notebooks are missing")
            : L("Hay existencias para el pedido", "Stock covers the order"),
          {
            status: limited
              ? L("Disponibilidad parcial", "Partial availability")
              : L("Existencias suficientes", "Sufficient stock"),
            rows: stock,
            metrics: [
              metric(L("Artículos solicitados", "Requested items"), "12"),
              metric(
                L("Artículos cubiertos", "Items covered"),
                limited ? "8" : "12",
              ),
            ],
          },
        ),
        step(
          L("Solicita aprobación", "Request approval"),
          "Teams",
          "teams",
          L(
            "Se prepara la revisión del responsable…",
            "Preparing the manager review…",
          ),
          limited
            ? L(
                "El responsable recibe la falta de existencias",
                "The manager receives the stock shortage",
              )
            : L(
                "Aprobación recibida en el ejemplo",
                "Approval received in the example",
              ),
          {
            status: limited ? S.review : S.approved,
            fields: [
              field(L("Pedido", "Order"), "PED-024"),
              field(L("Importe", "Amount"), "$28"),
              field(
                L("Decisión del ejemplo", "Sample decision"),
                limited
                  ? L("Esperar reposición", "Wait for replenishment")
                  : L("Aprobar el pedido", "Approve the order"),
                true,
              ),
            ],
            messages: [
              msg(
                limited
                  ? L(
                      "Faltan 4 cuadernos. Revisar antes de confirmar.",
                      "4 notebooks are missing. Review before confirming.",
                    )
                  : L(
                      "Pedido revisado y aprobado en la demo.",
                      "Order reviewed and approved in the demo.",
                    ),
                "out",
              ),
            ],
          },
        ),
        step(
          limited
            ? L("Conserva el pedido pendiente", "Keep the order pending")
            : L("Registra la orden", "Record the order"),
          "Power Automate · ERP",
          "automate",
          limited
            ? L(
                "El pedido espera la revisión del stock…",
                "The order waits for the stock review…",
              )
            : L("Se crea la orden del ejemplo…", "Creating the sample order…"),
          limited
            ? L(
                "No se confirma una entrega sin stock",
                "No delivery is confirmed without stock",
              )
            : L("Orden PED-024 registrada", "Order PED-024 recorded"),
          {
            status: limited ? S.pending : S.saved,
            rows: [
              row(
                "PED-024",
                L("12 artículos · $28", "12 items · $28"),
                limited
                  ? L("Pendiente de stock", "Awaiting stock")
                  : L("Orden registrada", "Order recorded"),
              ),
            ],
            metrics: [
              metric(
                L("Órdenes confirmadas", "Confirmed orders"),
                limited ? "0" : "1",
              ),
            ],
          },
        ),
        step(
          limited
            ? L("Informa del estado", "Report the status")
            : L("Confirma al cliente", "Confirm to the customer"),
          "WhatsApp",
          "whatsapp",
          L(
            "Se muestra la respuesta del ejemplo…",
            "Showing the sample reply…",
          ),
          limited
            ? L(
                "Disponibilidad parcial comunicada",
                "Partial availability communicated",
              )
            : L(
                "Confirmación visible en la conversación",
                "Confirmation visible in the conversation",
              ),
          {
            status: limited
              ? L("Revisión pendiente", "Review pending")
              : L("Pedido confirmado", "Order confirmed"),
            messages: [
              msg(order),
              msg(
                limited
                  ? L(
                      "Tu pedido está pendiente: faltan 4 cuadernos. Se revisará antes de confirmarlo.",
                      "Your order is pending: 4 notebooks are missing. It will be reviewed before confirmation.",
                    )
                  : L(
                      "Pedido PED-024 confirmado: 12 artículos, total $28.",
                      "Order PED-024 confirmed: 12 items, total $28.",
                    ),
                "out",
              ),
            ],
            rows: [row("PED-024", "$28", limited ? S.pending : S.done)],
          },
        ),
      ],
    );
  }
  return { demos };
});
