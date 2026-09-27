/* ============================================================
   RELOJ — cierre mensual multi-fuente.
   Cuatro orígenes que nunca cierran a la misma hora y un solo
   modelo publicado. Lo que se demuestra no es la ruta feliz:
   es qué entra al modelo cuando un origen viene viejo, quién
   se entera de eso y qué pasa cuando la marca no viaja.
   ============================================================ */
(function () {
  "use strict";
  var LAB = window.LAB;

  /* El cierre arranca a las 02:00 del día hábil 1. La antigüedad de
       cada origen se mide en minutos contra esa hora de arranque. */
  var ORIGENES = [
    {
      n: "Transactional database",
      m: "Incremental query",
      corte: "01/09 01:58",
      edad: 2,
      seg: 412,
    },
    {
      n: "Supporting lists",
      m: "Collaboration site",
      corte: "01/09 00:20",
      edad: 100,
      seg: 96,
    },
    {
      n: "Treasury service",
      m: "REST with token",
      corte: "31/08 22:15",
      edad: 225,
      seg: 74,
    },
    {
      n: "Branch files",
      m: "12 Excel workbooks",
      corte: "31/08 20:30",
      edad: 330,
      seg: 268,
    },
  ];
  /* Nodos internos: preparación, validación, modelo, publicación. */
  var SEG_INT = [205, 118, 84, 61];
  var NODOS = ORIGENES.map(function (o) {
    return { n: o.n, m: o.m };
  }).concat([
    { n: "Staging area", m: "Normalization" },
    { n: "Validation", m: "42 rules" },
    { n: "Semantic model", m: "Measures and relationships" },
    { n: "Publication", m: "Refresh" },
  ]);

  /* Las 42 reglas viven agrupadas por familia; el detalle por regla
       solo se abre cuando alguna cae, que es cuando alguien lo necesita. */
  var FAMILIAS = [
    { f: "Key integrity", n: 11 },
    { f: "Referential integrity", n: 9 },
    { f: "Reconciliation against control balances", n: 8 },
    { f: "Source freshness", n: 7 },
    { f: "Format and domain", n: 7 },
  ];
  var PERIODOS = ["April", "May", "June", "July", "August"];
  var CORTE_ANT = "01/08 02:02";
  var EDAD_ANT = 44640; /* 31 días del extracto del periodo anterior */

  /* ---------- datos sintéticos con semilla fija ---------- */
  function datos() {
    var k = LAB.kit,
      r = k.rng(20260902);
    var base = [118432, 2318, 6741, 31204],
      hist = [],
      p,
      i;
    for (p = 0; p < PERIODOS.length; p++) {
      var f = [];
      for (i = 0; i < 4; i++) f.push(Math.round(base[i] * (0.86 + r() * 0.13)));
      var rojas = p === 2 ? 2 : 0;
      hist.push({
        periodo: PERIODOS[p],
        f: f,
        rojas: rojas,
        seg: Math.round(1240 + r() * 190) + (rojas ? 160 : 0),
        res: rojas ? "Published with warnings" : "Model published",
        tono: rojas ? "warn" : "ok",
      });
    }
    return {
      base: base,
      hist: hist,
      ultimo: hist[hist.length - 1].f[2],
      dif: Math.round((28000 + r() * 42000) * 100) / 100,
    };
  }

  function dur(s) {
    var m = Math.floor(s / 60);
    return m ? m + " min " + LAB.kit.pad(s - m * 60) + " s" : s + " s";
  }
  function edadTxt(m) {
    if (m >= 1440) return Math.round(m / 1440) + " days";
    if (m >= 60)
      return Math.floor(m / 60) + " h " + LAB.kit.pad(m % 60) + " min";
    return m + " min";
  }
  function edadCorta(m) {
    if (m >= 1440) return Math.round(m / 1440) + " d";
    if (m >= 60) return Math.floor(m / 60) + "h" + LAB.kit.pad(m % 60);
    return m + " min";
  }
  function hora(s) {
    var t = 7200 + s;
    return (
      LAB.kit.pad(Math.floor(t / 3600)) +
      ":" +
      LAB.kit.pad(Math.floor(t / 60) % 60)
    );
  }

  /* ---------- reglas del cierre ----------
       Un origen es "diferido" cuando su antigüedad supera el umbral de
       frescura. La política decide qué se hace con él; de ahí salen las
       reglas en rojo, la duración y el resultado publicado. */
  function escenario(c, D) {
    var umbral = c.umbral * 60,
      i;
    var O = ORIGENES.map(function (o, ix) {
      var caido = ix === 2 && c.caida;
      return {
        n: o.n,
        caido: caido,
        corte: caido ? CORTE_ANT : o.corte,
        edad: caido ? EDAD_ANT : o.edad,
        filas: caido ? D.ultimo : D.base[ix],
        seg: o.seg + (caido ? 90 : 0) /* tres intentos de 30 s */,
      };
    });
    O.forEach(function (o) {
      o.venc = o.edad > umbral;
      o.cerca = !o.venc && o.edad > umbral * 0.8;
    });

    var primero = -1;
    for (i = 0; i < 4; i++)
      if (O[i].venc) {
        primero = i;
        break;
      }

    var seg = O.map(function (o) {
      return o.seg;
    }).concat(SEG_INT);
    var hasta = 8,
      detenido = null;

    /* "No aceptar": la cadena se corta en el primer origen fuera de umbral. */
    if (c.tol === "no" && primero >= 0) {
      detenido = "fuente";
      hasta = primero + 1;
    }

    var rojas = [],
      marcados = 0,
      silenciados = 0;
    if (detenido !== "fuente") {
      O.forEach(function (o, ix) {
        if (!o.venc) return;
        if (c.tol === "marca") {
          marcados++;
          rojas.push({
            id: "R-" + (21 + ix),
            fam: "Source freshness",
            q: "Maximum source age: " + c.umbral + " h",
            h: o.n + ": " + edadTxt(o.edad),
          });
        } else silenciados++;
      });
      /* El extracto recuperado no cuadra ni cubre el periodo. Eso lo
               ve la regla en los datos, no en la marca: cae en ambos casos. */
      if (c.caida) {
        rojas.push({
          id: "R-17",
          fam: "Reconciliation against control balances",
          q: "Treasury balance against control balance",
          h: "Difference of $" + LAB.kit.fmt(D.dif, 2),
        });
        rojas.push({
          id: "R-31",
          fam: "Referential integrity",
          q: "Period coverage in treasury accounts",
          h: "No transactions dated within 2026-09",
        });
      }
    }
    if (rojas.length && c.detener) {
      detenido = "validacion";
      hasta = 6;
    }

    /* Etiqueta de cada origen: siempre texto, el color solo acompaña. */
    O.forEach(function (o, ix) {
      if (detenido === "fuente" && ix > primero) {
        o.est = "idle";
        o.et = "Not run";
        o.filas = 0;
        return;
      }
      if (o.venc && c.tol === "no") {
        o.est = "bad";
        o.et = o.caido ? "No response" : "Rejected as stale";
        o.filas = 0;
        return;
      }
      if (o.venc && c.tol === "marca") {
        o.est = "warn";
        o.et = o.caido ? "Previous statement, flagged" : "Accepted and flagged";
        return;
      }
      if (o.venc) {
        o.est = "bad";
        o.et = o.caido
          ? "Previous statement, unflagged"
          : "Accepted without a flag";
        return;
      }
      if (o.cerca) {
        o.est = "warn";
        o.et = "Near the threshold";
        return;
      }
      o.est = "ok";
      o.et = "Within the threshold";
    });

    var total = 0,
      t = 0;
    for (i = 0; i < 4; i++) total += O[i].filas;
    for (i = 0; i < hasta; i++) t += seg[i];

    var res =
      detenido === "fuente"
        ? ["Close stopped", "bad"]
        : detenido === "validacion"
          ? ["Stopped at validation", "warn"]
          : silenciados
            ? ["Published without a flag", "bad"]
            : rojas.length
              ? ["Published with warnings", "warn"]
              : ["Model published", "up"];

    return {
      O: O,
      seg: seg,
      hasta: hasta,
      total: total,
      t: t,
      rojas: rojas,
      marcados: marcados,
      silenciados: silenciados,
      primero: primero,
      detenido: detenido,
      res: res,
      umbral: umbral,
      verdes:
        detenido === "fuente" ? "Not evaluated" : 42 - rojas.length + " of 42",
    };
  }

  LAB.register({
    id: "reloj",
    name: "RELOJ",
    family: "datos",
    tagline: "Multi-source close",
    title: "Consolidating four sources for the monthly close",
    intro:
      "The close uses four sources that never close at the same time. Change the freshness threshold and decide how the pipeline handles stale data: see the difference between a defensible number and one that merely looks correct.",
    spec: {
      trigger:
        "Close schedule: business day 1 at 02:00, with a scheduled retry if the window is missed.",
      systems:
        "Transactional database via incremental query, collaboration lists, token-authenticated REST service, twelve branch Excel workbooks, staging area, semantic model and dashboard.",
      output:
        "Published model with 42 documented validation rules, each identifying its category, threshold and source.",
      failure:
        "Reprocessing starts at the failure point, never from scratch: the staging area keeps data already extracted. Deferred data is flagged inside the model, not in a separate email.",
    },
    impact: [
      ["9 h -> 22 min", "end-to-end monthly close"],
      ["4", "sources without manual intervention"],
      ["Reprocessing", "from the failure point, not from scratch"],
    ],

    render: function (host, k) {
      var D = datos(),
        C = k.C;
      var corriendo = false,
        corridas = 0,
        firma = "";

      var ctl = k.controls([
        {
          k: "umbral",
          t: "range",
          label: "Freshness threshold",
          min: 1,
          max: 12,
          step: 1,
          value: 6,
          suffix: "h",
        },
        {
          k: "tol",
          t: "select",
          label: "How to handle a deferred source",
          value: "marca",
          options: [
            { v: "no", t: "Reject" },
            { v: "marca", t: "Accept and flag" },
            { v: "silencio", t: "Accept silently" },
          ],
        },
        {
          k: "detener",
          t: "check",
          label: "Stop if validation fails",
          value: true,
        },
        {
          k: "caida",
          t: "check",
          label: "Simulate service outage",
          value: false,
        },
        { k: "run", t: "button", label: "Run close", primary: true },
      ]);
      host.appendChild(ctl.node);
      /* Lectura de la política: cambia con cualquiera de los cuatro
               controles, aun cuando el resultado del cierre no se mueva. */
      var pol = k.txt("div", "mono", "");
      pol.style.marginTop = "12px";
      pol.style.color = C.body;
      pol.style.fontSize = "12px";
      ctl.node.appendChild(pol);

      var kp = k.kpis([
        ["Rows processed", "—"],
        ["Duration", "—"],
        ["Passing rules", "—"],
        ["Result", "—"],
      ]);
      host.appendChild(kp.node);

      var pnPipe = k.panel();
      pnPipe.appendChild(
        k.txt(
          "div",
          "mono-head",
          "Consolidation pipeline — four sources, one published model",
        ),
      );
      var pipe = k.pipe(NODOS);
      pnPipe.appendChild(pipe.node);
      host.appendChild(pnPipe);

      var g = k.el("div", "grid2 wide-left");
      host.appendChild(g);

      var izq = k.panel();
      izq.appendChild(
        k.txt(
          "div",
          "mono-head",
          "Period sources — cutoff, age and contributed rows",
        ),
      );
      var colF = [
        { t: "Source" },
        { t: "Cutoff" },
        { t: "Age", r: true },
        { t: "Rows", r: true },
        { t: "Status" },
      ];
      var tF = k.table(colF, []);
      izq.appendChild(tF.node);
      var hB = k.txt("div", "mono-head", "Age against the threshold");
      hB.style.marginTop = "18px";
      izq.appendChild(hB);
      /* El color de la barra repite lo que ya dice la columna Estado;
               la leyenda queda escrita para que no dependa del color. */
      var leyenda = k.txt(
        "div",
        null,
        "Green: within threshold. Amber: near threshold. Pink: outside threshold.",
      );
      leyenda.style.cssText =
        "font-size:12px;color:" + C.label + ";margin:-4px 0 12px";
      izq.appendChild(leyenda);
      var barras = k.bars();
      izq.appendChild(barras.node);
      var hR = k.txt(
        "div",
        "mono-head",
        "Validation — 42 active rules by category",
      );
      hR.style.marginTop = "18px";
      izq.appendChild(hR);
      var colR = [{ t: "Category" }, { t: "Rules", r: true }, { t: "Status" }];
      var tR = k.table(colR, []);
      izq.appendChild(tR.node);
      var detalle = k.el("div");
      detalle.style.marginTop = "16px";
      izq.appendChild(detalle);
      g.appendChild(izq);

      var der = k.el("div", "stack");
      var cb = k.chartbox(
        "Rows contributed by source",
        "Each bar is a close; its segments represent the four sources.",
        "250px",
      );
      der.appendChild(cb.node);
      var pnLog = k.panel();
      pnLog.appendChild(k.txt("div", "mono-head", "Close log"));
      var log = k.log("300px");
      pnLog.appendChild(log.node);
      der.appendChild(pnLog);
      g.appendChild(der);

      var pnIns = k.panel();
      pnIns.appendChild(k.txt("div", "mono-head", "Close insights"));
      var ins = k.insights();
      pnIns.appendChild(ins.node);
      host.appendChild(pnIns);

      var colH = [
        { t: "Period" },
        { t: "Rows", r: true },
        { t: "Duration", r: true },
        { t: "Failing rules", r: true },
        { t: "Result" },
      ];
      var tH = k.table(
        colH,
        D.hist
          .slice()
          .reverse()
          .map(function (h) {
            var tot = h.f[0] + h.f[1] + h.f[2] + h.f[3];
            return [
              h.periodo,
              k.fmt(tot, 0),
              dur(h.seg),
              String(h.rojas),
              { html: k.pill(h.tono, h.res) },
            ];
          }),
      );
      var pnH = k.panel();
      pnH.appendChild(k.txt("div", "mono-head", "Latest completed closes"));
      pnH.appendChild(tH.node);
      host.appendChild(pnH);

      function fila(cols, celdas) {
        var tr = document.createElement("tr");
        celdas.forEach(function (c, i) {
          tr.appendChild(
            c && typeof c === "object" && c.html != null
              ? k.el("td", cols[i].r ? "r" : null, c.html)
              : k.txt("td", cols[i].r ? "r" : null, String(c)),
          );
        });
        return tr;
      }

      /* pipe.set reescribe la clase del nodo; el ámbar del dato
               diferido no existe como estado propio y va en línea. */
      function nodo(i, estado, valor, color) {
        pipe.set(i, estado, valor == null ? "" : valor);
        var d = pipe.node.children[i];
        if (!d) return;
        d.style.borderColor = color || "";
        d.children[2].style.color = color || "";
      }
      function limpiarNodos(v) {
        for (var i = 0; i < NODOS.length; i++) nodo(i, "", v || "", null);
      }
      function valorNodo(e, i) {
        var o = e.O[i];
        if (i < 4)
          return (
            k.fmt(o.filas, 0) +
            " rows" +
            (o.venc ? (o.est === "warn" ? " · deferred" : " · unflagged") : "")
          );
        if (i === 4) return k.fmt(e.total, 0) + " rows";
        if (i === 5) return e.verdes;
        if (i === 6) return "38 measures";
        return hora(e.t);
      }

      /* ---------- gráfica apilada ---------- */
      var ch = k.chart(cb.canvas, {
        type: "bar",
        data: {
          labels: PERIODOS.concat(["September"]),
          datasets: ORIGENES.map(function (o, i) {
            return {
              label: o.n,
              stack: "c",
              backgroundColor: k.CAT[i],
              borderWidth: 0,
              borderRadius: 2,
              data: D.hist
                .map(function (h) {
                  return h.f[i];
                })
                .concat([0]),
            };
          }),
        },
        options: {
          interaction: { mode: "index", intersect: false },
          scales: {
            x: Object.assign({}, k.AXIS_BARE, { stacked: true }),
            y: Object.assign({}, k.AXIS, {
              stacked: true,
              beginAtZero: true,
              ticks: {
                padding: 8,
                callback: function (v) {
                  return k.fmt(v / 1000, 0) + " k";
                },
              },
            }),
          },
          plugins: {
            legend: { display: true, position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (x) {
                  return (
                    x.dataset.label + ": " + k.fmt(x.parsed.y, 0) + " rows"
                  );
                },
                footer: function (items) {
                  var idx = items[0].dataIndex,
                    s = 0;
                  items[0].chart.data.datasets.forEach(function (d) {
                    s += d.data[idx] || 0;
                  });
                  return "Total: " + k.fmt(s, 0) + " rows";
                },
              },
            },
          },
        },
      });

      /* ---------- pintado del escenario ---------- */
      function cfg() {
        return {
          umbral: ctl.get("umbral"),
          tol: ctl.get("tol"),
          detener: ctl.get("detener"),
          caida: ctl.get("caida"),
        };
      }
      function politica(c) {
        var t =
          c.tol === "no"
            ? "it is rejected and the pipeline stops"
            : c.tol === "marca"
              ? "it enters flagged as deferred"
              : "it enters without a flag";
        return (
          "Current policy — freshness threshold " +
          c.umbral +
          " h · source outside threshold: " +
          t +
          " · if a rule fails, publication " +
          (c.detener ? "stops" : "continues") +
          " · treasury service " +
          (c.caida ? "not responding" : "responding")
        );
      }

      function explicar(c, e) {
        ins.clear();
        var esc = k.escapeHtml,
          mayor = e.O[3];
        ins.add(
          "teal",
          "=",
          "The four cutoffs differ: the database closes at 01:58 and branch workbooks at 20:30 on the previous day, " +
            esc(edadTxt(mayor.edad)) +
            " apart relative to the start time. The <b>staging area</b> standardizes keys, currency and calendar before producing a single number.",
        );

        if (
          !e.O.some(function (o) {
            return o.venc;
          })
        ) {
          var cerca = e.O.filter(function (o) {
            return o.cerca;
          });
          ins.add(
            "green",
            "v",
            "At a threshold of <b>" +
              c.umbral +
              " h</b>, all four sources arrive within the limit: <b>42 of 42 rules pass</b> and the model is published at " +
              esc(hora(e.t)) +
              "." +
              (cerca.length
                ? " Narrow margin for " +
                  esc(cerca[0].n.toLowerCase()) +
                  ": passes by " +
                  esc(edadTxt(Math.round(e.umbral - cerca[0].edad))) +
                  "."
                : ""),
          );
        } else if (c.tol === "no") {
          ins.add(
            "amber",
            "!",
            "<b>Reject</b>: the pipeline stops at " +
              esc(e.O[e.primero].n.toLowerCase()) +
              ". No incomplete number is published, but the close cannot finish until that source is refreshed. This is defensible when that source's data takes priority over everything else.",
          );
        } else if (c.tol === "marca") {
          ins.add(
            "green",
            "v",
            "<b>Accept and flag</b>: " +
              e.marcados +
              " source(s) enter flagged as deferred, and freshness rules can detect them. The dashboard publishes while disclosing which part is stale: the flag travels inside the model, not just in the log.",
          );
        } else {
          ins.add(
            "rose",
            "x",
            "<b>Accept silently</b>: stale data enters without a flag. Freshness rules can trigger only when the flag exists, so they pass despite a source aged " +
              esc(
                edadTxt(
                  e.O.filter(function (o) {
                    return o.venc;
                  })[0].edad,
                ),
              ) +
              ". Anyone opening the dashboard will not know what they are looking at.",
          );
        }

        if (c.caida && c.tol !== "no") {
          ins.add(
            c.tol === "silencio" ? "rose" : "violet",
            "#",
            "The service did not respond, so the previous period's statement was recovered (" +
              esc(k.fmt(D.ultimo, 0)) +
              " rows, cutoff " +
              CORTE_ANT +
              "). Two rules fail because of the data itself, not the flag: <b>R-17</b> reconciliation against the control balance (difference of $" +
              esc(k.fmt(D.dif, 2)) +
              ") and <b>R-31</b> period coverage." +
              (c.tol === "silencio"
                ? ' Without a flag, the notification says "difference of $' +
                  esc(k.fmt(D.dif, 2)) +
                  '" and nothing more: someone will look for the error in the wrong place.'
                : ""),
          );
        }
        if (e.rojas.length) {
          ins.add(
            c.detener ? "violet" : "amber",
            c.detener ? "#" : ">",
            c.detener
              ? "<b>" +
                  e.rojas.length +
                  ' failing rule(s)</b>, and policy requires stopping: publication does not happen, and the notification includes rule-level details rather than simply "the close failed."'
              : "<b>" +
                  e.rojas.length +
                  " failing rule(s)</b>, but policy allows continuing: the model is published and the warning remains visible on the dashboard.",
          );
        }
        if (e.detenido) {
          ins.add(
            "cyan",
            "<",
            "Reprocessing <b>from the failure point</b>: data already extracted remains in the staging area (" +
              esc(dur(e.t)) +
              " already spent). A second run starts at node " +
              e.hasta +
              ", not node 1.",
          );
        }
      }

      function pintar() {
        var c = cfg(),
          e = escenario(c, D),
          i;
        pol.textContent = politica(c);

        tF.body.innerHTML = "";
        e.O.forEach(function (o) {
          tF.body.appendChild(
            fila(colF, [
              o.n,
              o.corte,
              edadTxt(o.edad),
              o.filas ? k.fmt(o.filas, 0) : "—",
              { html: k.pill(o.est, o.et) },
            ]),
          );
        });

        barras.clear();
        var tope = Math.max(e.umbral, 360);
        e.O.forEach(function (o) {
          var col = o.venc ? C.rose : o.cerca ? C.amber : C.green;
          barras.add(o.n, Math.min(o.edad, tope), tope, col, edadCorta(o.edad));
        });
        barras.add(
          "Configured threshold",
          e.umbral,
          tope,
          C.cyan,
          c.umbral + " h",
        );

        tR.body.innerHTML = "";
        FAMILIAS.forEach(function (fa) {
          var rj = e.rojas.filter(function (r) {
            return r.fam === fa.f;
          }).length;
          tR.body.appendChild(
            fila(colR, [
              fa.f,
              String(fa.n),
              {
                html:
                  e.detenido === "fuente"
                    ? k.pill("idle", "Not evaluated")
                    : rj
                      ? k.pill("bad", rj + " failing")
                      : k.pill("ok", "Passing"),
              },
            ]),
          );
        });

        detalle.innerHTML = "";
        if (e.rojas.length) {
          detalle.appendChild(
            k.txt(
              "div",
              "mono-head",
              "Rule-level details — included in the notification",
            ),
          );
          detalle.appendChild(
            k.table(
              [{ t: "Rule" }, { t: "What it checks" }, { t: "Finding" }],
              e.rojas.map(function (r) {
                return [r.id, r.q, r.h];
              }),
            ).node,
          );
        }

        limpiarNodos();
        for (i = 0; i < e.hasta; i++) {
          nodo(
            i,
            "done",
            valorNodo(e, i),
            i < 4 && e.O[i].venc
              ? e.O[i].est === "warn"
                ? C.amber
                : C.rose
              : null,
          );
        }
        if (e.detenido === "fuente")
          nodo(e.primero, "fail", e.O[e.primero].et, null);
        if (e.detenido === "validacion")
          nodo(5, "fail", e.rojas.length + " failing rules", null);
        for (i = e.hasta; i < NODOS.length; i++) nodo(i, "", "not run", null);

        kp.set(0, k.fmt(e.total, 0), e.detenido === "fuente" ? "bad" : "");
        kp.set(1, dur(e.t), e.detenido ? "warn" : "up");
        kp.set(
          2,
          e.verdes,
          e.rojas.length ? "bad" : e.detenido === "fuente" ? "warn" : "up",
        );
        kp.set(3, e.res[0], e.res[1]);

        if (ch) {
          for (i = 0; i < 4; i++) ch.data.datasets[i].data[5] = e.O[i].filas;
          ch.update("none");
          cb.cap(
            e.detenido === "fuente"
              ? "September is incomplete: sources after the stop point never entered the staging area."
              : c.caida
                ? "In September, the treasury segment belongs to the previous close, not the current period."
                : "September closes with all four sources within the period.",
          );
        }
        explicar(c, e);

        var f = [c.umbral, c.tol, c.detener, c.caida].join("|");
        if (f !== firma) {
          firma = f;
          log.push(
            "hl",
            "Projection recalculated with a threshold of " +
              c.umbral +
              " h: " +
              k.fmt(e.total, 0) +
              " rows, " +
              dur(e.t) +
              ", " +
              e.rojas.length +
              " failing rules, " +
              e.res[0].toLowerCase(),
          );
        }
        return e;
      }

      /* ---------- ejecución animada ---------- */
      async function ejecutar() {
        if (corriendo) return;
        corriendo = true;
        ctl.busy("run", true);
        var c = cfg(),
          e = escenario(c, D),
          i;
        corridas++;
        limpiarNodos("—");
        log.push(
          "in",
          "Close schedule: business day 1, 02:00. Period 2026-09 opened in the staging area.",
        );
        log.push(
          "in",
          "Current freshness threshold: " +
            c.umbral +
            " h relative to the start time.",
        );

        for (i = 0; i < NODOS.length; i++) {
          if (i >= e.hasta) {
            nodo(i, "", "not run", null);
            continue;
          }
          nodo(i, "run", "in progress", null);
          await k.wait(320 + Math.round(Math.random() * 120));

          if (i === 2 && c.caida) {
            for (var a = 1; a <= 3; a++) {
              log.push(
                "wa",
                "Treasury service: attempt " +
                  a +
                  " of 3, no response within 30 s",
              );
              await k.wait(200);
            }
            log.push(
              "er",
              "The service did not respond. Valid token, unresponsive endpoint.",
            );
            log.push(
              "in",
              "Resume point saved at node 3; extracted data remains in the staging area.",
            );
            await k.wait(260);
          }

          var o = i < 4 ? e.O[i] : null;
          if (o && o.venc && c.tol === "no") {
            nodo(i, "fail", o.et, null);
            log.push(
              "er",
              o.n +
                ": age " +
                edadTxt(o.edad) +
                " against a threshold of " +
                c.umbral +
                ' h. "Reject" policy: the close stops here; no partial model is published.',
            );
            for (var z = i + 1; z < NODOS.length; z++)
              nodo(z, "", "not run", null);
            break;
          }
          if (i === 5 && e.rojas.length) {
            nodo(5, "fail", e.rojas.length + " failing rules", null);
            e.rojas.forEach(function (r) {
              log.push("er", r.id + " · " + r.q + " — " + r.h);
            });
            await k.wait(280);
            if (c.detener) {
              log.push(
                "er",
                '"Stop if validation fails" policy: publication does not happen. The close owner receives rule-level details.',
              );
              for (var y = 6; y < NODOS.length; y++)
                nodo(y, "", "not run", null);
              break;
            }
            log.push(
              "wa",
              "Policy allows continuing: the result is published with a visible dashboard warning.",
            );
            continue;
          }

          nodo(
            i,
            "done",
            valorNodo(e, i),
            o && o.venc ? (o.est === "warn" ? C.amber : C.rose) : null,
          );
          if (o) {
            log.push(
              o.venc ? (c.tol === "marca" ? "wa" : "er") : "ok",
              o.n +
                ": " +
                k.fmt(o.filas, 0) +
                " rows, cutoff " +
                o.corte +
                " (" +
                edadTxt(o.edad) +
                ")" +
                (o.venc
                  ? " — outside threshold, " +
                    (c.tol === "marca"
                      ? "it enters flagged as deferred"
                      : "enters without a flag, so freshness rules will not detect it")
                  : ""),
            );
          } else if (i === 4) {
            log.push(
              "in",
              "Normalization: standardized keys, currency converted to USD and the period calendar applied to " +
                k.fmt(e.total, 0) +
                " rows",
            );
          } else if (i === 5) {
            log.push("ok", "42 rules applied, none failing");
          } else if (i === 6) {
            log.push(
              "in",
              "Semantic model refreshed: 38 measures, 9 relationships and a calendar table",
            );
          } else {
            log.push(
              "ok",
              "Model published at " +
                hora(e.t) +
                ". Dashboard available to the close team.",
            );
          }
        }

        log.push(
          "hl",
          "Close " +
            (corridas > 1 ? "reprocessed" : "executed") +
            ": " +
            e.res[0].toLowerCase() +
            " · " +
            dur(e.t) +
            " compared with 9 h for a manual close",
        );
        tH.body.insertBefore(
          fila(colH, [
            "September" + (corridas > 1 ? " · run " + corridas : ""),
            k.fmt(e.total, 0),
            dur(e.t),
            String(e.rojas.length),
            { html: k.pill(e.res[1] === "up" ? "ok" : e.res[1], e.res[0]) },
          ]),
          tH.body.firstChild,
        );
        while (tH.body.children.length > 6)
          tH.body.removeChild(tH.body.lastChild);

        ctl.busy("run", false);
        corriendo = false;
        pintar(); /* resincroniza si el visitante movió un control durante la corrida */
      }

      ctl.on(function () {
        if (!corriendo) pintar();
      });
      ctl.onClick("run", ejecutar);

      pintar();
      log.push(
        "in",
        "Pipeline loaded: 4 sources, 8 nodes and 42 documented validation rules",
      );
    },
  });
})();
