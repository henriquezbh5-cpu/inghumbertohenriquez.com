/* ============================================================
   ESCUDO — control de calidad antes de la carga
   El lote se valida contra reglas explícitas ANTES de tocar el
   modelo. El visitante enciende y apaga reglas, mueve el umbral
   de carga y cambia la política: el índice, la cuarentena, el
   recorrido y el motivo de cada rechazo se recalculan en vivo.
   Datos sintéticos con semilla fija.
   ============================================================ */
(function () {
  "use strict";
  var LAB = window.LAB;

  var TOTAL = 260;
  var PERIODO = "2026-08";
  var LOTE = "LT-" + PERIODO + "-31";

  var PROV = [
    { n: "Distribuidora Aurora", c: "PRV-0142", s: "aurora" },
    { n: "Ferretería El Roble", c: "PRV-0318", s: "elroble" },
    { n: "Transportes Sabana", c: "PRV-0407", s: "sabana" },
    { n: "Suministros Calderón", c: "PRV-0523", s: "calderon" },
    { n: "Alimentos Marbella", c: "PRV-0611", s: "marbella" },
    { n: "Textiles Nuvo", c: "PRV-0745", s: "nuvo" },
    { n: "Papelería Quetzal", c: "PRV-0802", s: "quetzal" },
    { n: "Refrigeración Delta", c: "PRV-0917", s: "refdelta" },
    { n: "Plásticos Tamarindo", c: "PRV-1024", s: "tamarindo" },
    { n: "Empaques Lumen", c: "PRV-1138", s: "lumen" },
    { n: "Servicios Cañaveral", c: "PRV-1247", s: "canaveral" },
    { n: "Herrajes Nortec", c: "PRV-1355", s: "nortec" },
  ];

  /* El orden importa: cada registro se atribuye a la PRIMERA regla
       activa que lo detiene, así la suma de rechazos = la cuarentena. */
  var REGLAS = [
    {
      id: "doc",
      s: "Tax document",
      n: "Tax document present and correctly formatted",
      d: "Separates records without a document number or with a format the catalog does not recognize.",
    },
    {
      id: "fec",
      s: "Date within the period",
      n: "Valid date within the period",
      d: "Rejects impossible dates and dates outside the month being loaded.",
    },
    {
      id: "mon",
      s: "Amount > 0",
      n: "Amount greater than zero",
      d: "A negative or zero amount is not an invoice: it indicates incorrect data entry or a misclassified note.",
    },
    {
      id: "prv",
      s: "Vendor code",
      n: "Vendor with a catalog code",
      d: "Without a code, the expense cannot be assigned; a name alone cannot be reconciled.",
    },
    {
      id: "ref",
      s: "Unique reference",
      n: "Unique reference within the batch",
      d: "The second occurrence of a reference is separated: the classic duplicate-import pattern.",
    },
    {
      id: "cor",
      s: "Contact email",
      n: "Correctly formatted contact email",
      d: "If the email is invalid, the payment notification does not arrive and the complaint returns by phone.",
    },
  ];

  var MAL_CORREO = [
    "facturacion.{s}.com",
    "pagos@{s}",
    "cobros@{s}..com",
    "facturacion @{s}.com",
    "@{s}.com",
    "pagos@{s},com",
  ];
  var MAL_DOC = ["DTE26-4821", "2026/000482", "DTE-2026-48A1"];

  function p3(n) {
    return (n < 10 ? "00" : n < 100 ? "0" : "") + n;
  }
  function p6(n) {
    var s = String(n);
    while (s.length < 6) s = "0" + s;
    return s;
  }
  function dinero(n) {
    return (n < 0 ? "-" : "") + "$" + LAB.kit.fmt(Math.abs(n), 0);
  }
  function nombreRegla(id) {
    for (var i = 0; i < REGLAS.length; i++)
      if (REGLAS[i].id === id) return REGLAS[i].s;
    return id;
  }

  /* ---------- lote sintético con defectos sembrados ---------- */
  function datos() {
    var k = LAB.kit,
      r = k.rng(3357),
      regs = [],
      i;

    for (i = 0; i < TOTAL; i++) {
      var pv = PROV[Math.floor(r() * PROV.length)];
      var buzon = k.pick(r, ["facturacion", "pagos", "cobros"]);
      regs.push({
        ln: "L-" + p3(i + 1),
        prov: pv.n,
        cod: pv.c,
        slug: pv.s,
        f: {},
        doc: "DTE-2026-" + p6(410000 + Math.floor(r() * 89000)),
        fecha: PERIODO + "-" + k.pad(1 + Math.floor(r() * 31)),
        monto: Math.round((85 + r() * 18400) * 100) / 100,
        ref: "REF-" + (80000 + i * 7 + Math.floor(r() * 6)),
        correo: buzon + "@" + pv.s + ".com",
      });
    }

    /* barajado determinista para elegir a quién le toca el defecto */
    var orden = [];
    for (i = 0; i < TOTAL; i++) orden.push(i);
    for (i = orden.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1)),
        t = orden[i];
      orden[i] = orden[j];
      orden[j] = t;
    }
    var p = orden.slice(0, 29);
    var donantes = orden.slice(40, 46).map(function (x) {
      return regs[x];
    });

    /* Índices repetidos entre listas: registros con más de un defecto. */
    var plan = {
      doc: [p[0], p[1], p[2], p[3], p[4], p[5], p[23]],
      fec: [p[6], p[7], p[8], p[9], p[10]],
      mon: [p[11], p[12], p[13], p[14], p[6]],
      prv: [p[15], p[16], p[17], p[18]],
      ref: [p[19], p[20], p[21], p[22], p[15], p[16]],
      cor: [p[23], p[24], p[25], p[26], p[27], p[28], p[0], p[1]],
    };

    plan.doc.forEach(function (idx, n) {
      var x = regs[idx];
      if (n % 2 === 0) {
        x.doc = "";
        x.f.doc = "Empty tax document";
      } else {
        x.doc = MAL_DOC[((n / 2) | 0) % MAL_DOC.length];
        x.f.doc = "Unrecognized document format: " + x.doc;
      }
    });
    plan.fec.forEach(function (idx, n) {
      var x = regs[idx],
        dia = LAB.kit.pad(3 + n * 5);
      if (n % 2 === 0) {
        x.fecha = "2026-13-" + dia;
        x.f.fec = "Invalid date: " + x.fecha + " (month 13 does not exist)";
      } else {
        x.fecha = (n === 1 ? "2026-06-" : "2026-09-") + dia;
        x.f.fec = "Date outside the period " + PERIODO + ": " + x.fecha;
      }
    });
    plan.mon.forEach(function (idx, n) {
      var x = regs[idx];
      if (n % 2 === 0) {
        x.monto = -Math.round(x.monto);
        x.f.mon = "Negative amount: " + dinero(x.monto);
      } else {
        x.monto = 0;
        x.f.mon = "Zero amount";
      }
    });
    plan.prv.forEach(function (idx) {
      regs[idx].cod = "";
      regs[idx].f.prv = "Vendor without a catalog code: " + regs[idx].prov;
    });
    plan.ref.forEach(function (idx, n) {
      var d = donantes[n % donantes.length];
      regs[idx].ref = d.ref;
      regs[idx].f.ref = "Duplicate reference from " + d.ln + ": " + d.ref;
    });
    plan.cor.forEach(function (idx, n) {
      regs[idx].correo = MAL_CORREO[n % MAL_CORREO.length].replace(
        "{s}",
        regs[idx].slug,
      );
      regs[idx].f.cor = "Invalid email: " + regs[idx].correo;
    });

    return regs;
  }

  /* Índice de los doce lotes anteriores: el programa venía mejorando
       porque el motivo se devuelve al origen y el origen corrige. */
  function historico() {
    var r = LAB.kit.rng(9184),
      h = [],
      i;
    for (i = 0; i < 12; i++)
      h.push(Math.round((71.4 + i * 1.28 + (r() - 0.5) * 2.6) * 10) / 10);
    return h;
  }

  LAB.register({
    id: "escudo",
    name: "ESCUDO",
    family: "datos",
    tagline: "Data quality",
    title: "Quality controls before loading",
    intro:
      "Before a dashboard misleads, someone needs to catch bad data. Turn rules on and off for a batch of 260 invoices, adjust the loading threshold and change the policy: watch the quality index, quarantine and exact rejection reasons change.",
    spec: {
      trigger:
        "A scheduled Power Automate workflow detects the batch file in the input folder. No record reaches the model without passing through the controls first.",
      systems:
        "Rule-based Python validation of the raw file, a SQL Server staging area and a quality dashboard with batch history.",
      output:
        "A clean batch ready to load, quarantine with a written reason for each record and a quality index tracked across batches.",
      failure:
        "Bad data does not enter the model. The batch is returned to the source with the line, field, reason and correction details, so it is corrected once at the source.",
    },
    impact: [
      ["0", "invalid records reaching the dashboard"],
      ["< 2 min", "of checks per batch, before each load"],
      ["100%", "of rejections with line, field and reason"],
    ],
    render: function (host, k) {
      var C = k.C;
      var regs = datos();
      var hist = historico();
      var estado = {};
      var cajas = [];
      var corriendo = false;
      var decPrev = null;
      REGLAS.forEach(function (R) {
        estado[R.id] = true;
      });

      var opcVer = [{ v: "*", t: "All rules" }];
      REGLAS.forEach(function (R) {
        opcVer.push({ v: R.id, t: R.s });
      });

      var ctl = k.controls([
        {
          k: "modo",
          t: "select",
          label: "Control policy",
          options: ["Quarantine", "Full rejection", "Warn only"],
          value: "Quarantine",
        },
        {
          k: "umbral",
          t: "range",
          label: "Threshold for loading without review",
          min: 80,
          max: 99,
          step: 1,
          value: 95,
          suffix: "%",
          decimals: 0,
        },
        {
          k: "ver",
          t: "select",
          label: "View quarantined records",
          options: opcVer,
          value: "*",
        },
        { k: "run", t: "button", label: "Run checks", primary: true },
      ]);
      host.appendChild(ctl.node);

      var kpi = k.kpis([
        ["Batch records", "—"],
        ["Pass the rules", "—"],
        ["Quarantined", "—"],
        ["Quality index", "—"],
        ["Loading decision", "—"],
      ]);
      host.appendChild(kpi.node);

      var pRec = k.panel();
      pRec.appendChild(k.txt("div", "mono-head", "Batch pipeline " + LOTE));
      var pipe = k.pipe([
        { n: "Input folder", m: "Raw file" },
        { n: "Read and type", m: "Python" },
        { n: "Rules engine", m: "6 validations" },
        { n: "Staging area", m: "Clean batch" },
        { n: "Quarantine", m: "Reason per record" },
        { n: "Dashboard", m: "Load authorized" },
      ]);
      pRec.appendChild(pipe.node);
      host.appendChild(pRec);

      var fila1 = k.el("div", "grid2 wide-left");
      var pReglas = k.panel(),
        rulesBox = k.el("div", "rules");
      pReglas.appendChild(
        k.txt("div", "mono-head", "Control rules — applied in this order"),
      );
      pReglas.appendChild(rulesBox);
      var cbHist = k.chartbox(
        "Quality index by batch",
        "The last twelve batches and the one displayed.",
      );
      fila1.appendChild(pReglas);
      fila1.appendChild(cbHist.node);
      host.appendChild(fila1);

      var fila2 = k.el("div", "grid2 wide-left");
      var pTabla = k.panel(),
        tablaHost = k.el("div");
      var tituloTabla = k.txt("div", "mono-head", "Quarantine");
      pTabla.appendChild(tituloTabla);
      pTabla.appendChild(tablaHost);
      var pBars = k.panel(),
        bars = k.bars();
      pBars.appendChild(k.txt("div", "mono-head", "Rejections by rule"));
      pBars.appendChild(bars.node);
      fila2.appendChild(pTabla);
      fila2.appendChild(pBars);
      host.appendChild(fila2);

      var fila3 = k.el("div", "grid2 wide-left");
      var pIns = k.panel(),
        ins = k.insights();
      pIns.appendChild(k.txt("div", "mono-head", "How to read the controls"));
      pIns.appendChild(ins.node);
      var pLog = k.panel(),
        log = k.log("268px");
      pLog.appendChild(k.txt("div", "mono-head", "Control log"));
      pLog.appendChild(log.node);
      fila3.appendChild(pIns);
      fila3.appendChild(pLog);
      host.appendChild(fila3);

      /* ---------- filas de reglas activables ---------- */
      var conta = {};
      REGLAS.forEach(function (R) {
        var row = k.el("div", "rule-r"),
          izq = k.el("div"),
          der = k.el("div", "rr");
        izq.appendChild(k.txt("div", "rt", R.n));
        izq.appendChild(k.txt("small", null, R.d));
        var cnt = k.txt("span", "rc", "—"),
          lab = k.el("label", "check");
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = true;
        cb.setAttribute("aria-label", "Active rule: " + R.n);
        cb.addEventListener("change", function () {
          estado[R.id] = cb.checked;
          log.push(
            cb.checked ? "ok" : "wa",
            "Rule " +
              (cb.checked ? "enabled" : "disabled") +
              ": " +
              R.n +
              ". Controls recalculated for the " +
              k.fmt(TOTAL, 0) +
              " records.",
          );
          pintar();
        });
        lab.appendChild(cb);
        lab.appendChild(k.txt("span", null, "Active"));
        der.appendChild(cnt);
        der.appendChild(lab);
        row.appendChild(izq);
        row.appendChild(der);
        rulesBox.appendChild(row);
        conta[R.id] = cnt;
        cajas.push(cb);
      });

      /* ---------- evaluación del lote ---------- */
      function evaluar() {
        var activas = REGLAS.filter(function (R) {
          return estado[R.id];
        });
        var conteo = {},
          detenidos = [];
        REGLAS.forEach(function (R) {
          conteo[R.id] = 0;
        });
        regs.forEach(function (x) {
          var primera = null,
            cuantas = 0;
          activas.forEach(function (R) {
            if (!x.f[R.id]) return;
            cuantas++;
            if (!primera) primera = R;
          });
          if (!primera) return;
          conteo[primera.id]++;
          detenidos.push({
            r: x,
            regla: primera,
            motivo: x.f[primera.id],
            n: cuantas,
          });
        });
        return { activas: activas, conteo: conteo, detenidos: detenidos };
      }

      var SUCIOS = regs.filter(function (x) {
        return Object.keys(x.f).length > 0;
      }).length;
      var IDX_REAL = ((TOTAL - SUCIOS) / TOTAL) * 100;

      /* ---------- gráfica del histórico ---------- */
      var etiquetas = [],
        radios = [],
        q;
      for (q = 0; q < hist.length; q++) {
        etiquetas.push("L" + (q + 1));
        radios.push(0);
      }
      etiquetas.push("Current");
      radios.push(5);
      var UMB0 = ctl.get("umbral");
      var chHist = k.chart(cbHist.canvas, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: "Quality index",
              data: hist.concat([Math.round(IDX_REAL * 10) / 10]),
              borderColor: C.teal,
              tension: 0.32,
              backgroundColor: "rgba(45,212,191,.12)",
              borderWidth: 2,
              fill: true,
              pointRadius: radios,
              pointHoverRadius: 5,
              pointBackgroundColor: C.teal,
            },
            {
              label: "Loading threshold (" + UMB0 + "%)",
              data: etiquetas.map(function () {
                return UMB0;
              }),
              borderColor: C.amber,
              borderWidth: 1.4,
              borderDash: [5, 4],
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "bottom" } },
          scales: {
            x: Object.assign({}, k.AXIS_BARE),
            y: Object.assign({}, k.AXIS, {
              min: 60,
              max: 100,
              ticks: {
                padding: 8,
                callback: function (v) {
                  return v + "%";
                },
              },
            }),
          },
        },
      });

      /* ---------- recorrido en su estado de reposo ---------- */
      function pintarPipe(ev, modo, retenido) {
        var fallos = ev.detenidos.length,
          limpios = TOTAL - fallos;
        pipe.set(0, "done", k.fmt(TOTAL, 0) + " records");
        pipe.set(1, "done", "11 columns");
        pipe.set(2, fallos ? "fail" : "done", k.fmt(fallos, 0) + " findings");
        if (modo === "Full rejection" && fallos) {
          pipe.set(3, "fail", "batch blocked");
          pipe.set(4, "fail", k.fmt(TOTAL, 0) + " returned");
          pipe.set(5, "fail", "load canceled");
        } else if (modo === "Warn only") {
          pipe.set(3, "done", k.fmt(TOTAL, 0) + " prepared");
          pipe.set(
            4,
            fallos ? "fail" : "done",
            k.fmt(fallos, 0) + " notifications",
          );
          pipe.set(5, "done", k.fmt(TOTAL, 0) + " loaded");
        } else {
          pipe.set(3, "done", k.fmt(limpios, 0) + " valid");
          pipe.set(
            4,
            fallos ? "fail" : "done",
            k.fmt(fallos, 0) + " quarantined",
          );
          if (retenido) pipe.set(5, "fail", "awaiting review");
          else pipe.set(5, "done", k.fmt(limpios, 0) + " loaded");
        }
      }

      /* ---------- repintado completo con los controles actuales ---------- */
      function pintar() {
        var ev = evaluar();
        var fallos = ev.detenidos.length;
        var modo = ctl.get("modo"),
          umbral = ctl.get("umbral"),
          ver = ctl.get("ver");
        var idx = ((TOTAL - fallos) / TOTAL) * 100;
        var retenido = modo === "Quarantine" && fallos > 0 && idx < umbral;
        var pasan, cuar, dec, tonoDec, destino;

        pasan = TOTAL - fallos;
        if (modo === "Full rejection") {
          cuar = fallos ? TOTAL : 0;
          dec = fallos ? "Batch returned" : "Load authorized";
          tonoDec = fallos ? "bad" : "ok";
          destino = k.pill("bad", "Returned to source");
        } else if (modo === "Warn only") {
          cuar = 0;
          dec = fallos ? "Load with warnings" : "Load authorized";
          tonoDec = fallos ? "warn" : "ok";
          destino = k.pill("warn", "Loaded with warning");
        } else {
          cuar = fallos;
          dec = retenido ? "Load held" : "Load authorized";
          tonoDec = retenido ? "warn" : "ok";
          destino = k.pill("warn", "To quarantine");
        }

        kpi.set(0, k.fmt(TOTAL, 0));
        kpi.set(1, k.fmt(pasan, 0), "");
        kpi.set(
          2,
          k.fmt(cuar, 0),
          modo === "Full rejection" && fallos ? "bad" : cuar ? "warn" : "",
        );
        kpi.set(
          3,
          k.pct(idx, 1),
          idx >= umbral ? "up" : idx >= umbral - 8 ? "warn" : "bad",
        );
        kpi.html(4, k.pill(tonoDec, dec));

        REGLAS.forEach(function (R) {
          conta[R.id].textContent = estado[R.id]
            ? k.fmt(ev.conteo[R.id], 0) + " rejections"
            : "inactive";
        });

        var maxi = 1;
        REGLAS.forEach(function (R) {
          if (ev.conteo[R.id] > maxi) maxi = ev.conteo[R.id];
        });
        bars.clear();
        REGLAS.forEach(function (R, i) {
          if (estado[R.id])
            bars.add(
              R.s,
              ev.conteo[R.id],
              maxi,
              k.CAT[i % k.CAT.length],
              k.fmt(ev.conteo[R.id], 0),
            );
          else bars.add(R.s, 0, maxi, "rgba(148,180,220,.22)", "inactive");
        });

        var lista = ev.detenidos;
        if (ver !== "*")
          lista = lista.filter(function (d) {
            return d.regla.id === ver;
          });
        var filas = lista.slice(0, 10).map(function (d) {
          return [
            d.r.ln,
            d.r.prov,
            dinero(d.r.monto),
            d.regla.s + (d.n > 1 ? " (+" + (d.n - 1) + ")" : ""),
            d.motivo,
            { html: destino },
          ];
        });
        var t = k.table(
          [
            { t: "Service line" },
            { t: "Vendor" },
            { t: "Amount", r: true },
            { t: "Rule that blocked it" },
            { t: "Exact reason" },
            { t: "Destination" },
          ],
          filas,
        );
        if (!filas.length) {
          var fv = k.el("tr"),
            td = k.txt(
              "td",
              null,
              !ev.activas.length
                ? "No active rules: the entire batch enters without review."
                : ver !== "*"
                  ? "This rule blocked no records under the current configuration."
                  : "No records violate the active rules.",
            );
          td.colSpan = 6;
          fv.appendChild(td);
          t.body.appendChild(fv);
        }
        tablaHost.textContent = "";
        tablaHost.appendChild(t.node);
        tituloTabla.textContent =
          "Quarantine — " +
          (ver === "*" ? "showing " : nombreRegla(ver) + ": ") +
          Math.min(10, lista.length) +
          " of " +
          lista.length +
          " blocked records, with reasons";

        if (chHist) {
          chHist.data.datasets[0].data[hist.length] = Math.round(idx * 10) / 10;
          chHist.data.datasets[1].data = etiquetas.map(function () {
            return umbral;
          });
          chHist.data.datasets[1].label = "Loading threshold (" + umbral + "%)";
          chHist.update("none");
        }
        cbHist.cap(
          "Current batch: " +
            k.pct(idx, 1) +
            " with " +
            ev.activas.length +
            " of 6 active rules. " +
            (idx >= umbral
              ? "Above the threshold of " + umbral + "%."
              : "Below the threshold of " + umbral + "%."),
        );

        var multiAct = ev.detenidos.filter(function (d) {
          return d.n > 1;
        }).length;
        ins.clear();
        ins.add(
          "teal",
          "✓",
          "Control coverage: <b>" +
            ev.activas.length +
            " of 6</b> rules. With all six enabled, the batch scores <b>" +
            k.pct(IDX_REAL, 1) +
            "</b>: that is the actual number. " +
            (ev.activas.length < 6
              ? "It now scores <b>" +
                k.pct(idx, 1) +
                "</b> because fewer rules are checking, not because the batch improved."
              : "Disabling a rule raises the index without correcting a single record."),
        );
        ins.add(
          "violet",
          "≡",
          fallos
            ? "<b>" +
                k.fmt(multiAct, 0) +
                "</b> of the <b>" +
                k.fmt(fallos, 0) +
                "</b> blocked records violate more than one active rule; the table marks them with (+n). Each rejection is attributed to the first blocking rule, so the rule totals equal the quarantine count and no record is counted twice."
            : "With no active blocking rules, attribution does not apply: each rejection is always assigned to the first blocking rule, never every rule it violates.",
        );
        if (modo === "Full rejection") {
          ins.add(
            "rose",
            "✕",
            "Full rejection: a single failure rejects the batch. With <b>" +
              k.fmt(fallos, 0) +
              "</b> findings, the " +
              k.fmt(TOTAL, 0) +
              " records return to the source. This is appropriate when the batch is an accounting unit, and costly when it is not.",
          );
          ins.add(
            "cyan",
            "<",
            "The threshold makes no decision here: one finding is enough to return the batch. The <b>" +
              umbral +
              "%</b> is shown in the history only as a target for the source.",
          );
        } else if (modo === "Warn only") {
          ins.add(
            "amber",
            "!",
            "Warn only: the " +
              k.fmt(TOTAL, 0) +
              " records still enter, and the <b>" +
              k.fmt(fallos, 0) +
              "</b> exceptions remain as warnings. This helps measure before enabling the policy; if left this way, the dashboard becomes misleading again.",
          );
          ins.add(
            "cyan",
            "<",
            "The threshold does not hold anything in this mode either: the <b>" +
              umbral +
              "%</b> only counts how many batches would pass before the policy is actually enabled.",
          );
        } else {
          ins.add(
            "green",
            "→",
            "Quarantine: <b>" +
              k.fmt(pasan, 0) +
              "</b> clean records, and separates <b>" +
              k.fmt(fallos, 0) +
              "</b> with written reasons. The source corrects and resends only the failures; the rest are already loaded.",
          );
          ins.add(
            "cyan",
            "<",
            "Threshold of <b>" +
              umbral +
              "%</b>: below it, the problem is no longer isolated and suggests a faulty source export, so loading waits for human review even if the clean records are ready. The batch scores <b>" +
              k.pct(idx, 1) +
              "</b>: " +
              (retenido
                ? "load held."
                : "loading authorized without intervention."),
          );
        }

        if (!corriendo) pintarPipe(ev, modo, retenido);
        if (decPrev !== null && dec !== decPrev) {
          log.push(
            tonoDec === "ok" ? "ok" : tonoDec === "bad" ? "er" : "wa",
            "Loading decision: " +
              dec +
              " — index " +
              k.pct(idx, 1) +
              ", threshold " +
              umbral +
              "%, policy " +
              modo +
              ".",
          );
        }
        decPrev = dec;
      }

      /* ---------- ejecución animada del recorrido ---------- */
      function bloquear(b) {
        corriendo = b;
        ctl.busy("run", b);
        cajas.forEach(function (cb) {
          cb.disabled = b;
        });
        k.$$('select, input[type="range"]', ctl.node).forEach(function (n) {
          n.disabled = b;
        });
      }

      async function ejecutar() {
        if (corriendo) return;
        var modo = ctl.get("modo"),
          umbral = ctl.get("umbral");
        var ev = evaluar();
        var fallos = ev.detenidos.length;
        var idx = ((TOTAL - fallos) / TOTAL) * 100;
        var retenido = modo === "Quarantine" && fallos > 0 && idx < umbral;
        bloquear(true);
        pipe.reset();

        log.push(
          "hl",
          "Batch " +
            LOTE +
            " detected in the input folder — " +
            k.fmt(TOTAL, 0) +
            " records, policy: " +
            modo +
            ".",
        );
        pipe.set(0, "run");
        await k.wait(400);
        pipe.set(0, "done", k.fmt(TOTAL, 0) + " records");

        pipe.set(1, "run");
        await k.wait(460);
        log.push(
          "in",
          "Read and typed: 11 columns, delimiter detected, UTF-8 encoding. No writes yet.",
        );
        pipe.set(1, "done", "11 columns");

        pipe.set(2, "run");
        log.push(
          "in",
          "Rules engine: " +
            ev.activas.length +
            " of 6 validations active on the raw file.",
        );
        for (var i = 0; i < REGLAS.length; i++) {
          var R = REGLAS[i];
          await k.wait(240);
          if (!estado[R.id]) {
            log.push("wa", R.n + " — rule disabled, not evaluated.");
            continue;
          }
          var c = ev.conteo[R.id];
          log.push(
            c ? "er" : "ok",
            R.n +
              " — " +
              (c ? k.fmt(c, 0) + " records blocked." : "no findings."),
          );
        }
        pipe.set(2, fallos ? "fail" : "done", k.fmt(fallos, 0) + " findings");
        await k.wait(360);

        if (modo === "Full rejection" && fallos) {
          pipe.set(3, "fail", "batch blocked");
          pipe.set(4, "fail", k.fmt(TOTAL, 0) + " returned");
          log.push(
            "er",
            "Full rejection: the entire batch returns to the source with details for the " +
              k.fmt(fallos, 0) +
              " lines to correct.",
          );
          await k.wait(420);
          pipe.set(5, "fail", "load canceled");
          log.push(
            "wa",
            "Load canceled. The dashboard keeps the last valid batch; no bad data reaches it.",
          );
        } else if (modo === "Warn only") {
          pipe.set(3, "done", k.fmt(TOTAL, 0) + " prepared");
          pipe.set(4, "run", k.fmt(fallos, 0) + " notifications");
          log.push(
            "wa",
            "Warn only: " +
              k.fmt(fallos, 0) +
              " exceptions recorded as warnings; the " +
              k.fmt(TOTAL, 0) +
              " records proceed to loading.",
          );
          await k.wait(420);
          pipe.set(
            4,
            fallos ? "fail" : "done",
            k.fmt(fallos, 0) + " notifications",
          );
          pipe.set(5, "done", k.fmt(TOTAL, 0) + " loaded");
          log.push(
            "er",
            "Warning: the dashboard receives " +
              k.fmt(fallos, 0) +
              " records with known defects. Measurement mode, not production mode.",
          );
        } else {
          pipe.set(3, "done", k.fmt(TOTAL - fallos, 0) + " valid");
          await k.wait(360);
          pipe.set(
            4,
            fallos ? "fail" : "done",
            k.fmt(fallos, 0) + " quarantined",
          );
          log.push(
            fallos ? "wa" : "ok",
            fallos
              ? k.fmt(fallos, 0) +
                  " records quarantined, each with line, field and reason. Source notified with the corrections file."
              : "No findings: the entire batch moves to staging.",
          );
          await k.wait(400);
          if (retenido) {
            pipe.set(5, "fail", "awaiting review");
            log.push(
              "wa",
              "Index " +
                k.pct(idx, 1) +
                " below the threshold of " +
                umbral +
                "%: loading is held. At this failure rate, the source export is reviewed before anything is loaded.",
            );
          } else {
            pipe.set(5, "done", k.fmt(TOTAL - fallos, 0) + " loaded");
            log.push(
              "ok",
              "Upload authorized: " +
                k.fmt(TOTAL - fallos, 0) +
                " clean records to the model. Zero defective records on the dashboard.",
            );
          }
        }
        await k.wait(300);
        log.push(
          "in",
          "Checks completed in 1 min 52 s. Batch index published in the quality history.",
        );
        bloquear(false);
      }

      /* ---------- controles en vivo ---------- */
      var prev = { modo: ctl.get("modo"), ver: ctl.get("ver") };
      ctl.on(function (get) {
        var m = get("modo"),
          v = get("ver");
        if (m !== prev.modo)
          log.push(
            "in",
            "Control policy: " +
              m +
              ". This changes the consequence, not detection: the findings are the same.",
          );
        if (v !== prev.ver)
          log.push(
            "in",
            "Quarantine filter: " +
              (v === "*" ? "all rules" : nombreRegla(v)) +
              ".",
          );
        prev = { modo: m, ver: v };
        pintar();
      });
      ctl.onClick("run", function () {
        ejecutar();
      });

      /* ---------- estado de trabajo desde el primer segundo ---------- */
      pintar();
      log.push(
        "hl",
        "Checks run on batch " +
          LOTE +
          " — " +
          k.fmt(TOTAL, 0) +
          " records read from the input folder.",
      );
      log.push(
        "ok",
        "Six active rules. No record reaches the dashboard without passing through them.",
      );
      log.push(
        "wa",
        k.fmt(SUCIOS, 0) +
          " records quarantined with written reasons; the corrections file has already been sent to the source.",
      );
      log.push(
        "in",
        "Batch index: " +
          k.pct(IDX_REAL, 1) +
          ", below the threshold of " +
          UMB0 +
          "%: loading is held until review.",
      );
    },
  });
})();
