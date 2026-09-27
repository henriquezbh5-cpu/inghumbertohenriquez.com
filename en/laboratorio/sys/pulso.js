/* ============================================================
   PULSO — supervisión por excepción de una flota de bots
   Ciento setenta automatizaciones vigiladas desde una consola:
   qué corre, qué falla, qué se recupera solo y qué exige a una
   persona. Todos los datos son sintéticos y con semilla fija.
   ============================================================ */
(function () {
  "use strict";
  var LAB = window.LAB;

  var AREAS = [
    "Finance",
    "Procurement",
    "Human Resources",
    "Operations",
    "Service",
    "Technology",
  ];
  var CUPO = [34, 28, 22, 36, 24, 26];
  var PAISES = ["SV", "GT", "HN", "CR"];
  var ESTADOS = ["Stable", "With retries", "Degraded"];
  var PROC = {
    Finance: [
      "Daily bank reconciliation",
      "Vendor invoice import",
      "Monthly accounting close",
      "Expense accruals",
      "Cash flow report",
      "Preventive collections",
      "Withholding validation",
    ],
    Procurement: [
      "Vendor onboarding",
      "Three-vendor quote comparison",
      "Purchase order tracking",
      "Goods receipt",
      "Framework agreement renewal",
      "Agreed-price controls",
    ],
    "Human Resources": [
      "Employee onboarding",
      "Biweekly payroll",
      "Leave tracking",
      "Certificate delivery",
      "Performance review close",
      "Access removal",
    ],
    Operations: [
      "Route scheduling",
      "Delivery confirmation",
      "Cycle counting",
      "Branch replenishment",
      "Shift close",
      "Dispatch consolidation",
    ],
    Service: [
      "Ticket classification",
      "Satisfaction survey",
      "Appointment notification",
      "SLA escalation",
      "First-contact response",
    ],
    Technology: [
      "Verified backup",
      "Credential rotation",
      "Certificate monitoring",
      "Temporary-file cleanup",
      "Directory synchronization",
      "Release publication",
    ],
  };

  /* Ventana móvil de 30 días. El día de la semana sale del índice y no del
       reloj del visitante: así el valle de fin de semana siempre cae en el
       mismo punto de la gráfica. */
  function esFinde(d) {
    var dow = (d + 3) % 7;
    return dow === 5 || dow === 6;
  }

  function datos() {
    var r = LAB.kit.rng(9021);
    var bots = [],
      n = 0;
    AREAS.forEach(function (area, a) {
      var procs = PROC[area];
      for (var j = 0; j < CUPO[a]; j++) {
        n++;
        var cad = r();
        var cadencia = cad < 0.26 ? "hourly" : cad < 0.72 ? "daily" : "weekly";
        var diaFijo = Math.floor(r() * 5);
        var picoH = 6 + Math.floor(r() * 18),
          picoD = 1 + Math.floor(r() * 4),
          picoS = 1 + Math.floor(r() * 3);
        var dia = [],
          ejec = 0,
          d,
          v;
        for (d = 0; d < 30; d++) {
          var finde = esFinde(d);
          if (cadencia === "hourly")
            v = finde
              ? Math.round(picoH * 0.18)
              : Math.max(1, picoH + Math.round((r() - 0.5) * 4));
          else if (cadencia === "daily")
            v = finde
              ? r() < 0.25
                ? 1
                : 0
              : Math.max(1, picoD + (r() < 0.3 ? 1 : 0));
          else v = (d + 3) % 7 === diaFijo ? picoS : 0;
          dia.push(v);
          ejec += v;
        }
        /* Tasa de fallo con cola larga: la mayoría de la flota es sana y
                   unos pocos concentran el ruido. Eso es lo que se supervisa. */
        var q = r(),
          tf;
        if (q < 0.7) tf = r() * 0.008;
        else if (q < 0.9) tf = 0.008 + r() * 0.022;
        else tf = 0.03 + r() * 0.08;
        var fallos = Math.min(ejec, Math.round(ejec * tf));
        if (tf > 0.03 && fallos === 0) fallos = 1;
        /* Los fallos caen en proporción al volumen del día y nunca pueden
                   superar las ejecuciones de ese día. */
        var fdia = [],
          quedan = fallos,
          guard = fallos * 14 + 80;
        for (d = 0; d < 30; d++) fdia.push(0);
        while (quedan > 0 && guard > 0) {
          guard--;
          var t = r() * ejec,
            acc = 0,
            dd = -1;
          for (d = 0; d < 30; d++) {
            acc += dia[d];
            if (t < acc) {
              dd = d;
              break;
            }
          }
          if (dd >= 0 && fdia[dd] < dia[dd]) {
            fdia[dd]++;
            quedan--;
          }
        }

        bots.push({
          id: "BOT-" + (n < 100 ? (n < 10 ? "00" : "0") : "") + n,
          area: area,
          pais: PAISES[Math.floor(r() * PAISES.length)],
          proc: procs[Math.floor(r() * procs.length)],
          crit: r() < 0.38 ? "High" : "Medium",
          cadencia: cadencia,
          dia: dia,
          fdia: fdia,
          ejec: ejec,
          fallos: fallos - quedan,
          rec: Math.round((fallos - quedan) * (0.7 + r() * 0.28)),
          min: 3 + Math.floor(r() * 22),
          tocado: false,
        });
      }
    });
    return bots;
  }

  /* El estado no es fijo: lo decide el umbral que mueve el visitante. */
  function tasa(b) {
    return b.ejec ? b.fallos / b.ejec : 0;
  }
  function clase(tf, u) {
    return tf < u / 4 ? ESTADOS[0] : tf < u ? ESTADOS[1] : ESTADOS[2];
  }
  function estadoDe(b, u) {
    return clase(tasa(b), u);
  }
  function tonoDe(e) {
    return e === ESTADOS[0] ? "ok" : e === ESTADOS[1] ? "warn" : "bad";
  }
  function colorDe(C, e) {
    return e === ESTADOS[0] ? C.green : e === ESTADOS[1] ? C.amber : C.rose;
  }
  /* Orden de la cola: primero lo degradado, luego la criticidad. */
  function rango(b, u) {
    var e = estadoDe(b, u);
    return (
      (e === ESTADOS[2] ? 0 : e === ESTADOS[1] ? 1 : 2) * 10 +
      (b.crit === "High" ? 0 : 1)
    );
  }
  /* Cuelga hijos de un contenedor y lo devuelve, para armar el layout plano. */
  function apila(cont) {
    for (var i = 1; i < arguments.length; i++)
      if (arguments[i]) cont.appendChild(arguments[i]);
    return cont;
  }

  LAB.register({
    id: "pulso",
    name: "PULSO",
    family: "agentes",
    tagline: "Exception-based monitoring",
    title: "Exception-based monitoring of 170 automations",
    intro:
      "You do not monitor 170 bots one by one. Adjust the degradation threshold to see the exception queue change, filter by department or criticality, and trigger an incident to follow the retry sequence that resolves most failures without intervention.",
    spec: {
      trigger:
        "Each execution writes its own record when finished, including the step, duration and exception. The console reads those records continuously: it does not poll devices or wait for someone to report a problem.",
      systems:
        "Central execution records in SQL Server, a Power BI semantic model, Power Automate notification workflows and a Teams channel for exceptions.",
      output:
        "Success rate by department, manual work hours avoided and an exception queue ordered by criticality and lost volume, not failure time.",
      failure:
        "Three retries with increasing delays and a refreshed session. Writes are idempotent, so a retry never duplicates records. If the third fails, a notification includes the full trace and the bot remains under observation for 48 hours.",
    },
    impact: [
      ["170", "bots and workflows monitored"],
      ["98.7%", "successful executions without intervention"],
      ["4,064 h", "manual work avoided over 30 days"],
    ],
    render: function (host, k) {
      var C = k.C,
        bots = datos(),
        rInc = k.rng(4477),
        etiquetas = [],
        i;
      for (i = 0; i < 30; i++) etiquetas.push("D" + k.pad(i + 1));
      function cabeza(s, mt) {
        var n = k.txt("div", "mono-head", s);
        if (mt) n.style.marginTop = mt;
        return n;
      }

      var ctl = k.controls([
        {
          k: "area",
          t: "select",
          label: "Department",
          options: ["All"].concat(AREAS),
          value: "All",
        },
        {
          k: "estado",
          t: "select",
          label: "Status",
          options: ["All"].concat(ESTADOS),
          value: "All",
        },
        {
          k: "crit",
          t: "select",
          label: "Criticality",
          options: ["All", "High", "Medium"],
          value: "All",
        },
        {
          k: "orden",
          t: "select",
          label: "Table",
          value: "exc",
          options: [
            { v: "exc", t: "Exception queue" },
            { v: "vol", t: "Highest volume" },
          ],
        },
        {
          k: "umbral",
          t: "range",
          label: "Degradation threshold",
          min: 1,
          max: 8,
          step: 0.5,
          value: 4,
          suffix: "%",
          decimals: 1,
        },
        { k: "inc", t: "button", label: "Simulate incident", primary: true },
      ]);
      var kpi = k.kpis([
        ["Bots matching the filter", "—"],
        ["Executions over 30 days", "—"],
        ["Success rate", "—"],
        ["Work hours avoided", "—"],
      ]);
      var cbLinea = k.chartbox(
        "Executions and failures per day",
        "Rolling 30-day window.",
      );
      var cbEstado = k.chartbox(
        "Fleet status",
        "Breakdown under the current threshold.",
      );
      var tHead = cabeza("Exception queue");
      var tablaHost = k.el("div");
      tablaHost.style.marginTop = "12px";
      var esc = k.steps([
        "Exception detected at step 4 of 9",
        "Retry 1 · 15 s wait",
        "Retry 2 · refreshed session",
        "Idempotent write verified",
        "Channel notification and 48 h observation",
      ]);
      esc.node.style.margin = "2px 0 16px";
      var log = k.log("196px");
      var bVol = k.bars(),
        bFal = k.bars(),
        ins = k.insights();

      apila(
        host,
        ctl.node,
        kpi.node,
        apila(k.el("div", "grid2 wide-left"), cbLinea.node, cbEstado.node),
        apila(
          k.el("div", "grid2 wide-left"),
          apila(k.panel(), tHead, tablaHost),
          apila(
            k.panel(),
            cabeza("Recovery sequence"),
            esc.node,
            cabeza("Console log"),
            log.node,
          ),
        ),
        apila(
          k.el("div", "grid2"),
          apila(
            k.panel(),
            cabeza("Executions by department · 30 days"),
            bVol.node,
            cabeza("Failure rate by department", "20px"),
            bFal.node,
          ),
          apila(k.panel(), cabeza("How to read the fleet"), ins.node),
        ),
      );

      /* ---------- gráficas: se crean una vez y se actualizan ---------- */
      var chLinea = k.chart(cbLinea.canvas, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: "Executions",
              data: [],
              yAxisID: "y",
              borderColor: C.teal,
              backgroundColor: "rgba(45,212,191,.12)",
              borderWidth: 2,
              tension: 0.35,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
            {
              label: "Failures (right axis)",
              data: [],
              yAxisID: "y1",
              borderColor: C.rose,
              borderWidth: 1.6,
              borderDash: [4, 3],
              tension: 0.3,
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
          ],
        },
        options: {
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "bottom" } },
          scales: {
            x: Object.assign({}, k.AXIS_BARE, {
              ticks: { padding: 8, maxTicksLimit: 8 },
            }),
            y: Object.assign({}, k.AXIS, { beginAtZero: true }),
            y1: Object.assign({}, k.AXIS_BARE, {
              position: "right",
              beginAtZero: true,
              suggestedMax: 6,
            }),
          },
        },
      });
      var chEstado = k.chart(cbEstado.canvas, {
        type: "doughnut",
        data: {
          labels: ESTADOS.slice(),
          datasets: [
            {
              data: [0, 0, 0],
              backgroundColor: [C.green, C.amber, C.rose],
              borderColor: C.bg2,
              borderWidth: 2,
              hoverOffset: 6,
            },
          ],
        },
        options: { cutout: "62%", plugins: { legend: { position: "bottom" } } },
      });

      function filtrar() {
        var a = ctl.get("area"),
          e = ctl.get("estado"),
          c = ctl.get("crit"),
          u = ctl.get("umbral") / 100;
        return bots.filter(function (b) {
          if (a !== "All" && b.area !== a) return false;
          if (e !== "All" && estadoDe(b, u) !== e) return false;
          if (c !== "All" && b.crit !== c) return false;
          return true;
        });
      }

      var visibles = [];
      function pintar(resaltar) {
        var u = ctl.get("umbral") / 100,
          lista = filtrar(),
          j;
        var ejec = 0,
          fallos = 0,
          rec = 0,
          min = 0;
        var serie = [],
          serieF = [],
          vol = {},
          fal = {},
          cuenta = [0, 0, 0];
        for (j = 0; j < 30; j++) {
          serie.push(0);
          serieF.push(0);
        }
        AREAS.forEach(function (a) {
          vol[a] = 0;
          fal[a] = 0;
        });
        lista.forEach(function (b) {
          ejec += b.ejec;
          fallos += b.fallos;
          rec += b.rec;
          min += b.ejec * b.min;
          vol[b.area] += b.ejec;
          fal[b.area] += b.fallos;
          cuenta[ESTADOS.indexOf(estadoDe(b, u))]++;
          for (j = 0; j < 30; j++) {
            serie[j] += b.dia[j];
            serieF[j] += b.fdia[j];
          }
        });
        var exito = ejec ? ((ejec - fallos) / ejec) * 100 : 100;
        var tono =
          exito >= 99
            ? "up"
            : exito >= 97.5
              ? ""
              : exito >= 95
                ? "warn"
                : "bad";
        kpi.set(0, k.fmt(lista.length, 0));
        kpi.set(1, k.fmt(ejec, 0));
        kpi.set(2, ejec ? k.pct(exito, 2) : "—", ejec ? tono : "");
        kpi.set(3, k.fmt(min / 60, 0));

        var pico = 0,
          diaPico = 0;
        for (j = 0; j < 30; j++)
          if (serie[j] > pico) {
            pico = serie[j];
            diaPico = j;
          }
        if (chLinea) {
          chLinea.data.datasets[0].data = serie;
          chLinea.data.datasets[1].data = serieF;
          chLinea.update();
        }
        cbLinea.cap(
          ejec
            ? "The recurring dip is the weekend. Peak of " +
                k.fmt(pico, 0) +
                " executions on day " +
                k.pad(diaPico + 1) +
                "."
            : "No executions match the current filter.",
        );
        if (chEstado) {
          chEstado.data.datasets[0].data = cuenta;
          chEstado.update();
        }
        cbEstado.cap(
          cuenta[0] +
            " stable, " +
            cuenta[1] +
            " with retries and " +
            cuenta[2] +
            " degraded with the threshold at " +
            k.pct(u * 100, 1) +
            ".",
        );

        /* barras por área: el número va siempre como texto, no solo el color */
        var maxVol = 0,
          maxFal = 0,
          peor = null,
          picoArea = null;
        AREAS.forEach(function (a) {
          if (vol[a] > maxVol) {
            maxVol = vol[a];
            picoArea = a;
          }
          var t = vol[a] ? fal[a] / vol[a] : 0;
          if (vol[a] && t > maxFal) {
            maxFal = t;
            peor = a;
          }
        });
        bVol.clear();
        bFal.clear();
        AREAS.forEach(function (a) {
          if (!vol[a]) return;
          bVol.add(a, vol[a], maxVol, C.teal, k.fmt(vol[a], 0));
          var t = fal[a] / vol[a],
            e = clase(t, u);
          bFal.add(
            a + " · " + e,
            t * 100,
            Math.max(maxFal * 100, u * 100),
            colorDe(C, e),
            k.pct(t * 100, 2),
          );
        });

        /* tabla: cola de excepciones o mayor volumen, según el control */
        var porVol = ctl.get("orden") === "vol";
        var top = lista
          .slice()
          .sort(function (x, y) {
            if (porVol) return y.ejec - x.ejec;
            var d = rango(x, u) - rango(y, u);
            if (d) return d;
            if (y.fallos !== x.fallos) return y.fallos - x.fallos;
            return y.ejec - x.ejec;
          })
          .slice(0, 10);
        visibles = top;
        tHead.textContent = porVol
          ? "The " + top.length + " highest-volume bots matching the filter"
          : cuenta[2]
            ? "Exception queue — " +
              cuenta[2] +
              " degraded; showing the " +
              Math.min(top.length, cuenta[2]) +
              " with the highest criticality"
            : "Exception queue — no bot exceeds the threshold; showing those with the highest failure rates";
        var filas = top.map(function (b) {
          var e = estadoDe(b, u);
          return [
            b.id,
            b.proc,
            b.area + " · " + b.pais,
            b.crit,
            k.fmt(b.ejec, 0),
            k.fmt(b.fallos, 0),
            k.pct(tasa(b) * 100, 2),
            k.fmt((b.ejec * b.min) / 60, 0),
            { html: k.pill(tonoDe(e), e) },
          ];
        });
        var t = k.table(
          [
            { t: "Bot" },
            { t: "Process" },
            { t: "Department · country" },
            { t: "Crit." },
            { t: "Exec. 30 d", r: true },
            { t: "Failures", r: true },
            { t: "Failure rate", r: true },
            { t: "Hours", r: true },
            { t: "Status" },
          ],
          filas,
        );
        if (!filas.length) {
          var tdv = k.txt(
            "td",
            null,
            "No bot matches the filters at this threshold. Broaden the criteria.",
          );
          tdv.colSpan = 9;
          t.body.appendChild(apila(k.el("tr"), tdv));
        }
        tablaHost.innerHTML = "";
        tablaHost.appendChild(t.node);
        if (resaltar) {
          top.forEach(function (b, idx) {
            if (b.id === resaltar && t.body.children[idx])
              t.body.children[idx].classList.add("hit");
          });
        }

        var degAlta = lista.filter(function (b) {
          return estadoDe(b, u) === ESTADOS[2] && b.crit === "High";
        }).length;
        var conVol = AREAS.filter(function (a) {
          return vol[a] > 0;
        }).length;
        var volTop = top.reduce(function (s, b) {
          return s + b.ejec;
        }, 0);
        ins.clear();
        ins.add(
          "amber",
          "!",
          "Exception queue: <b>" +
            cuenta[2] +
            "</b> bots above <b>" +
            k.pct(u * 100, 1) +
            "</b> failure rate, <b>" +
            degAlta +
            "</b> with high criticality. Lowering the threshold grows the queue: that is the cost of closer monitoring.",
        );
        ins.add(
          "green",
          "↺",
          fallos
            ? "<b>" +
                k.pct((rec / fallos) * 100, 1) +
                "</b> of failures are resolved by the retry sequence. The rest generate a notification with a trace and wait for a person."
            : "No failures recorded under the current filter: the retry sequence was not needed.",
        );
        if (conVol > 1 && peor && picoArea) {
          ins.add(
            "teal",
            "▲",
            peor === picoArea
              ? "<b>" +
                  k.escapeHtml(picoArea) +
                  "</b> accounts for <b>" +
                  k.pct((vol[picoArea] / ejec) * 100, 1) +
                  "</b> of volume and also the worst failure rate (<b>" +
                  k.pct(maxFal * 100, 2) +
                  "</b>). That is where human monitoring should start."
              : "<b>" +
                  k.escapeHtml(picoArea) +
                  "</b> accounts for <b>" +
                  k.pct((vol[picoArea] / ejec) * 100, 1) +
                  "</b> of volume, but the worst failure rate belongs to <b>" +
                  k.escapeHtml(peor) +
                  "</b> (<b>" +
                  k.pct(maxFal * 100, 2) +
                  "</b>). Volume and risk are not concentrated in the same department.",
          );
        } else if (ejec) {
          ins.add(
            "teal",
            "▲",
            "The <b>" +
              top.length +
              "</b> displayed bots account for <b>" +
              k.pct((volTop / ejec) * 100, 1) +
              "</b> of filtered executions and have <b>" +
              k.fmt(
                top.reduce(function (s, b) {
                  return s + b.fallos;
                }, 0),
                0,
              ) +
              "</b> failures: human monitoring is concentrated there.",
          );
        } else {
          ins.add(
            "teal",
            "▲",
            "The current filter leaves no executions to compare. Broaden the criteria.",
          );
        }
      }

      /* ---------- incidente: la secuencia real de recuperación ---------- */
      async function incidente() {
        var lista = filtrar();
        if (!lista.length) {
          log.push(
            "wa",
            "No bots match this filter. Broaden the criteria to run a simulation.",
          );
          return;
        }
        /* el incidente cae sobre un bot de la tabla: el visitante ve cambiar la fila */
        var libres = visibles.filter(function (b) {
          return !b.tocado;
        });
        if (!libres.length)
          libres = lista.filter(function (b) {
            return !b.tocado;
          });
        if (!libres.length) {
          log.push(
            "wa",
            "All bots matching this filter have already had an incident in this session. Change the filter to simulate another.",
          );
          return;
        }
        ctl.busy("inc", true);
        esc.reset();
        try {
          var b = libres[Math.floor(rInc() * libres.length)];
          b.tocado = true;
          var traza = "TR-" + (7100 + Math.floor(rInc() * 890));
          var reg = 90 + Math.floor(rInc() * 260),
            atraso = 62 + rInc() * 40;
          /* guion: aviso previo, espera, estado del paso y línea de registro */
          var guion = [
            {
              p: 0,
              w: 520,
              e: "fail",
              ms: "30 s",
              c: "er",
              t:
                "Step 4 of 9: the source connector timed out after 30 s. Trace " +
                traza +
                ".",
            },
            {
              p: 1,
              pre: [
                "wa",
                "Retry 1 of 3 — increasing delay of 15 s. State saved at the checkpoint.",
              ],
              w: 620,
              e: "fail",
              ms: "15 s",
              c: "er",
              t: "Retry 1 failed: the connector session is still expired (401 for the service token).",
            },
            {
              p: 2,
              pre: [
                "wa",
                "Retry 2 of 3 — increasing delay of 45 s and a session refreshed using the service credential.",
              ],
              w: 680,
              e: "done",
              ms: "45 s",
              c: "ok",
              t:
                "Retry 2 succeeded: " +
                k.fmt(reg, 0) +
                " records processed from the checkpoint.",
            },
            {
              p: 3,
              w: 520,
              e: "done",
              ms: "0 duplicates",
              c: "ok",
              t:
                "Idempotent write: the deterministic key discarded records already written. Total delay " +
                k.fmt(atraso, 1) +
                " s against a 15 min SLA.",
            },
            {
              p: 4,
              w: 460,
              e: "done",
              ms: traza,
              c: "in",
              t: "Notification to the operations channel with the trace, step, full exception and execution link.",
            },
          ];
          log.push(
            "hl",
            "Incident opened — " +
              b.id +
              " · " +
              b.proc +
              " · " +
              b.area +
              " (" +
              b.pais +
              ") · criticality " +
              b.crit,
          );
          for (i = 0; i < guion.length; i++) {
            var g = guion[i];
            if (g.pre) log.push(g.pre[0], g.pre[1]);
            esc.set(g.p, "run");
            await k.wait(g.w);
            esc.set(g.p, g.e, g.ms);
            log.push(g.c, g.t);
          }
          /* el incidente entra al registro: 3 ejecuciones nuevas, 2 con fallo */
          b.ejec += 3;
          b.dia[29] += 3;
          b.fallos += 2;
          b.fdia[29] += 2;
          b.rec += 2;
          log.push(
            "hl",
            "Dashboard updated — " +
              b.id +
              ' changes to "' +
              estadoDe(b, ctl.get("umbral") / 100) +
              '" and remains under observation for 48 h.',
          );
          pintar(b.id);
        } finally {
          ctl.busy("inc", false);
        }
      }

      /* el arrastre del umbral repinta en vivo, pero no inunda el registro */
      var firma = "";
      function sello() {
        return [
          ctl.get("area"),
          ctl.get("estado"),
          ctl.get("crit"),
          ctl.get("umbral"),
        ].join(" | ");
      }
      ctl.on(function () {
        pintar(null);
        if (sello() === firma) return;
        firma = sello();
        log.push(
          "in",
          "View applied — department: " +
            ctl.get("area") +
            " · status: " +
            ctl.get("estado") +
            " · criticality: " +
            ctl.get("crit") +
            " · threshold: " +
            k.pct(ctl.get("umbral"), 1) +
            " · " +
            filtrar().length +
            " bots displayed.",
        );
      });
      ctl.onClick("inc", function () {
        incidente();
      });

      /* estado de trabajo desde el primer segundo */
      pintar(null);
      firma = sello();
      var u0 = ctl.get("umbral") / 100,
        totEjec = 0,
        degr = 0;
      bots.forEach(function (b) {
        totEjec += b.ejec;
        if (estadoDe(b, u0) === ESTADOS[2]) degr++;
      });
      log.push(
        "hl",
        "Console online — " +
          bots.length +
          " bots inventoried across " +
          PAISES.length +
          " countries, continuously reading the central log.",
      );
      log.push(
        "in",
        "Central log: " +
          k.fmt(totEjec, 0) +
          " executions read over the last 30 days.",
      );
      log.push(
        "ok",
        bots.length -
          degr +
          " bots within threshold. No human attention needed today.",
      );
      log.push(
        "wa",
        "Exception queue: " +
          degr +
          " bots above " +
          k.pct(u0 * 100, 1) +
          " failure rate, ordered by criticality.",
      );
    },
  });
})();
