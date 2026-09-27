/* ============================================================
   CENTINELA — conciliación a tres vías
   Orden de compra vs recepción vs factura. Enseña tres palancas
   reales: tolerancia de precio, tolerancia de cantidad y umbral
   de materialidad. Estrechas inundan de falsos positivos; anchas
   dejan pasar dinero. Y muestra qué hace el robot cuando no
   puede probar las tres vías: no firma.
   ============================================================ */
(function () {
  "use strict";
  var LAB = window.LAB;

  /* perfil sintético: proveedor, Δ precio unitario %, Δ cantidad %,
       duplicado, sin recepción, entrega parcial facturada completa,
       sin evidencia (no se pudo resolver la orden) */
  var PERFILES = [
    ["Suministros del Norte", 0.4, 0, false, false, false, false],
    ["Logística Andina", 1.2, 0, false, false, false, false],
    ["Papelería Central", 2.8, 4.4, false, false, false, false],
    ["Equipos Delta", 6.5, 0, false, false, false, false],
    ["Servicios Omega", 0, 0, false, true, false, false],
    ["Insumos Pacífico", 0.9, 3.6, false, false, false, false],
    ["Tecnología Aurora", 0.3, 0, true, false, false, false],
    ["Transportes Lima", -1.5, 0, false, false, false, false],
    ["Ferretería Sur", 0.6, 0, false, false, true, false],
    ["Químicos Vega", 0.2, 0, false, false, false, false],
    ["Empaques Robles", 1.4, 1.8, false, false, false, false],
    ["Aceros Marino", -0.8, 0, false, false, false, false],
    ["Textiles Cuscatlán", 1.9, 0, false, false, false, false],
    ["Refrigeración Lempa", 0.7, 0, false, false, false, false],
    ["Cableado Istmo", 0, 0, false, false, false, true],
    ["Herrajes Comalapa", 5.2, 0, false, false, false, false],
    ["Plásticos Torogoz", 1.1, 6.4, false, false, false, false],
    ["Rodamientos Izalco", 2.3, 0.8, false, false, false, false],
  ];

  /* veredictos en orden de precedencia; p = etiqueta corta de la tabla */
  var VER = {
    noev: { p: "No evidence", t: "No evidence", tone: "bad", bloqueo: true },
    sinrec: { p: "No receipt", t: "No receipt", tone: "bad", bloqueo: true },
    dup: { p: "Duplicate", t: "Duplicate", tone: "bad", bloqueo: true },
    cant: { p: "Quantity", t: "Quantity", tone: "warn", bloqueo: false },
    prec: { p: "Price", t: "Price", tone: "warn", bloqueo: false },
    menor: {
      p: "Below threshold",
      t: "Below threshold",
      tone: "idle",
      bloqueo: false,
    },
    ok: { p: "Matched", t: "Matched", tone: "ok", bloqueo: false },
  };
  var BARRAS = ["noev", "sinrec", "dup", "cant", "prec", "menor"];
  var H_POR_EXC = 0.25;

  function sgn(n) {
    if (n == null) return "—";
    return (n > 0.0005 ? "+" : "") + LAB.kit.fmt(n, 1) + "%";
  }

  /* lote del día: los mismos números para todo visitante */
  function datos() {
    var r = LAB.kit.rng(4411);
    return PERFILES.map(function (p, i) {
      var pu = Math.round((14 + r() * 296) * 100) / 100;
      var ped = (12 + Math.floor(r() * 29)) * 10;
      var rec = p[4] ? 0 : p[5] ? Math.round(ped * 0.9) : ped;
      /* al menos una unidad de diferencia: la desviación nunca se pierde por redondeo */
      var extra =
        p[2] > 0 && rec > 0 ? Math.max(1, Math.round((rec * p[2]) / 100)) : 0;
      var cf = p[4] || p[5] ? ped : rec + extra;
      var puf = Math.round(pu * (1 + p[1] / 100) * 100) / 100;
      var d = {
        doc: "F-" + (7412 + i * 7 + Math.floor(r() * 6)),
        oc: "OC-" + (3140 + i * 11 + Math.floor(r() * 9)),
        prov: p[0],
        pu: pu,
        puf: puf,
        ped: ped,
        rec: rec,
        cf: cf,
        mf: Math.round(puf * cf * 100) / 100,
        dPrec: (puf / pu - 1) * 100,
        dCant: rec ? ((cf - rec) / rec) * 100 : null,
        dup: !!p[3],
        noev: !!p[6],
      };
      /* el adjunto llegó ilegible: hay monto facturado pero no hay orden que comparar */
      if (d.noev) {
        d.oc = null;
        d.ped = null;
        d.rec = null;
        d.dPrec = null;
        d.dCant = null;
      }
      return d;
    });
  }

  /* exceso facturado sobre orden y recepción, en dinero */
  function exceso(d) {
    if (d.noev || d.rec === 0) return d.mf;
    return Math.max(0, d.puf - d.pu) * d.cf + Math.max(0, d.cf - d.rec) * d.pu;
  }

  /* precedencia dura: sin evidencia > sin recepción > duplicado >
       cantidad > precio > materialidad > conciliada */
  function veredicto(d, tp, tc, umbral, reglaDup) {
    if (d.noev) return "noev";
    if (d.rec === 0) return "sinrec";
    if (d.dup && reglaDup) return "dup";
    var fuera = null;
    if (Math.abs(d.dCant) > tc + 1e-9) fuera = "cant";
    else if (Math.abs(d.dPrec) > tp + 1e-9) fuera = "prec";
    if (!fuera) return "ok";
    /* el umbral de materialidad aprueba la desviación pequeña sin analista */
    return exceso(d) < umbral ? "menor" : fuera;
  }

  /* los bloqueos exponen la factura entera; las desviaciones solo el exceso */
  function riesgo(d, cod) {
    if (VER[cod].bloqueo) return d.mf;
    if (d.dup) return d.mf;
    return exceso(d);
  }

  function evaluar(lote, tp, tc, umbral, reglaDup) {
    var res = {
      filas: [],
      auto: 0,
      exc: 0,
      retenido: 0,
      fuga: 0,
      fugaN: 0,
      peor: null,
      cuenta: {},
      monto: {},
    };
    BARRAS.forEach(function (m) {
      res.cuenta[m] = 0;
      res.monto[m] = 0;
    });
    lote.forEach(function (d) {
      var cod = veredicto(d, tp, tc, umbral, reglaDup);
      var rr = riesgo(d, cod);
      res.filas.push({ d: d, cod: cod, r: rr });
      res.cuenta[cod] = (res.cuenta[cod] || 0) + 1;
      res.monto[cod] = (res.monto[cod] || 0) + rr;
      if (cod === "ok" || cod === "menor") {
        res.auto++;
        if (rr > 0.5) {
          res.fuga += rr;
          res.fugaN++;
          if (!res.peor || rr > res.peor.r) res.peor = { d: d, r: rr };
        }
      } else {
        res.exc++;
        res.retenido += rr;
      }
    });
    return res;
  }

  LAB.register({
    id: "centinela",
    name: "CENTINELA",
    family: "procesos",
    tagline: "Three-way matching",
    title: "Three-way invoice matching against purchase orders and receipts",
    intro:
      "The robot compares purchase orders, receipts and invoices document by document, then decides which can be paid automatically. Adjust the three tolerances and see what is approved, what is held and how much money each decision allows through.",
    spec: {
      trigger:
        "An invoice arrives in the accounts payable inbox. The attachment is extracted, added to the day's batch and triggers the run.",
      systems:
        "Desktop RPA reads the order and receipt in the ERP; Excel holds the batch worksheet, SharePoint stores the records and email delivers acknowledgments.",
      output:
        "A reconciled batch ready for payment scheduling, plus exception records containing the reason, amount at risk and supporting document for each held case.",
      failure:
        "Exceptions are routed to an analyst with the difference already calculated and supporting evidence attached. If the robot cannot read the order or find the receipt, it does not approve payment: it holds the invoice for review.",
    },
    impact: [
      ["92%", "invoices approved without human intervention"],
      ["4 h -> 6 min", "per batch of 300 documents"],
      ["$0", "payments issued without verifying all three documents"],
    ],
    render: function (host, k) {
      var lote = datos();
      var TOTAL = lote.length;
      var TONO = {
        noev: k.C.rose,
        sinrec: k.C.rose,
        dup: k.C.rose,
        cant: k.C.amber,
        prec: k.C.amber,
        menor: k.C.teal,
      };

      var ctl = k.controls([
        {
          k: "tp",
          t: "range",
          label: "Price tolerance",
          min: 0,
          max: 8,
          step: 0.25,
          value: 2,
          suffix: "%",
          decimals: 2,
        },
        {
          k: "tc",
          t: "range",
          label: "Quantity tolerance",
          min: 0,
          max: 8,
          step: 0.5,
          value: 2,
          suffix: "%",
          decimals: 1,
        },
        {
          k: "um",
          t: "range",
          label: "Materiality threshold",
          min: 0,
          max: 3200,
          step: 50,
          value: 400,
          suffix: "USD",
          decimals: 0,
        },
        { k: "dup", t: "check", label: "Block duplicates", value: true },
        { k: "run", t: "button", label: "Run matching", primary: true },
      ]);
      host.appendChild(ctl.node);

      var kp = k.kpis([
        ["Approved automatically", "—"],
        ["Exceptions", "—"],
        ["Held as exceptions", "—"],
        ["Approved overpayment", "—"],
      ]);
      host.appendChild(kp.node);

      var pp = k.panel();
      pp.appendChild(k.txt("div", "mono-head", "Run pipeline"));
      var pipe = k.pipe([
        { n: "Inbox", m: "Incoming invoice" },
        { n: "Extraction", m: "Attachment fields" },
        { n: "Purchase order", m: "ERP lookup" },
        { n: "Receipt", m: "ERP lookup" },
        { n: "Three-way matching", m: "Tolerance rules" },
        { n: "Output", m: "Payment or exception record" },
      ]);
      pp.appendChild(pipe.node);
      host.appendChild(pp);

      var grid = k.el("div", "grid2 wide-left");
      host.appendChild(grid);

      var cb = k.chartbox("Outcome for each document", "Current run", "236px");
      grid.appendChild(cb.node);

      var lado = k.panel();
      lado.appendChild(k.txt("div", "mono-head", "Run log"));
      var log = k.log("182px");
      lado.appendChild(log.node);
      grid.appendChild(lado);

      var ip = k.panel();
      ip.appendChild(k.txt("div", "mono-head", "Batch insights"));
      var ins = k.insights();
      ip.appendChild(ins.node);
      host.appendChild(ip);

      var tp = k.panel();
      var hrow = k.el("div");
      hrow.style.cssText =
        "display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap";
      hrow.appendChild(
        k.txt("div", "mono-head", "Batch records — " + TOTAL + " documents"),
      );
      var estado = k.txt("div", "mono", "");
      estado.style.cssText = "font-size:11px;color:var(--label)";
      estado.setAttribute("aria-live", "polite");
      hrow.appendChild(estado);
      tp.appendChild(hrow);
      var tHolder = k.el("div");
      tp.appendChild(tHolder);
      host.appendChild(tp);

      var COLS = [
        { t: "Invoice" },
        { t: "Vendor" },
        { t: "Order" },
        { t: "Ordered / Received / Invoiced", r: true },
        { t: "Δ price", r: true },
        { t: "Δ qty.", r: true },
        { t: "Invoiced", r: true },
        { t: "At risk", r: true },
        { t: "Verdict" },
      ];

      var montos = BARRAS.map(function () {
        return 0;
      });
      var ch = k.chart(cb.canvas, {
        type: "bar",
        data: {
          labels: BARRAS.map(function (m) {
            return VER[m].t;
          }),
          datasets: [
            {
              data: BARRAS.map(function () {
                return 0;
              }),
              backgroundColor: BARRAS.map(function (m) {
                return TONO[m];
              }),
              borderWidth: 0,
              borderRadius: 5,
              barThickness: 16,
            },
          ],
        },
        options: {
          indexAxis: "y",
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (c) {
                  var n = c.parsed.x;
                  return (
                    n +
                    (n === 1 ? " document · " : " documents · ") +
                    k.money(montos[c.dataIndex])
                  );
                },
              },
            },
          },
          scales: {
            x: Object.assign({}, k.AXIS, {
              beginAtZero: true,
              ticks: { padding: 8, precision: 0, stepSize: 2 },
            }),
            y: k.AXIS_BARE,
          },
        },
      });

      var token = 0;
      var filasNode = null;
      var ultimo = null;

      function pintar() {
        token++;
        var vtp = ctl.get("tp"),
          vtc = ctl.get("tc"),
          vum = ctl.get("um"),
          vdup = ctl.get("dup");
        var e = evaluar(lote, vtp, vtc, vum, vdup);
        ultimo = e;

        kp.set(
          0,
          k.fmt(e.auto, 0) + " / " + TOTAL,
          e.auto / TOTAL >= 0.7
            ? "up"
            : e.auto / TOTAL >= 0.45
              ? "warn"
              : "bad",
        );
        kp.set(
          1,
          k.fmt(e.exc, 0),
          e.exc <= 3 ? "up" : e.exc > 8 ? "bad" : "warn",
        );
        kp.set(2, k.money(e.retenido), e.retenido > 0 ? "" : "up");
        kp.set(
          3,
          k.money(e.fuga),
          e.fuga > 4000 ? "bad" : e.fuga > 0.5 ? "warn" : "up",
        );

        montos = BARRAS.map(function (m) {
          return e.monto[m];
        });
        if (ch) {
          ch.data.datasets[0].data = BARRAS.map(function (m) {
            return e.cuenta[m];
          });
          ch.update();
        }
        cb.cap(
          "Pink: blocked, no payment. Amber: discrepancy outside tolerance, routed to an analyst. " +
            "Teal: approved under the threshold of " +
            k.money(vum) +
            ". " +
            "Reconciled without exceptions: " +
            e.cuenta.ok +
            " of " +
            TOTAL +
            ". This sample deliberately contains a high proportion of exceptions.",
        );

        tHolder.innerHTML = "";
        var t = k.table(
          COLS,
          e.filas.map(function (f) {
            var d = f.d;
            return [
              d.doc,
              d.prov,
              d.oc == null ? "unresolved" : d.oc,
              d.rec == null
                ? "— / — / " + d.cf
                : d.ped + " / " + d.rec + " / " + d.cf,
              sgn(d.dPrec),
              sgn(d.dCant),
              k.money(d.mf),
              f.r > 0.5 ? k.money(f.r) : "—",
              { html: k.pill(VER[f.cod].tone, VER[f.cod].p) },
            ];
          }),
        );
        tHolder.appendChild(t.node);
        filasNode = t.body.children;

        pipe.reset();
        pipe.set(0, "done", TOTAL + " invoices");
        pipe.set(
          1,
          e.cuenta.noev ? "fail" : "done",
          TOTAL - e.cuenta.noev + " readable",
        );
        pipe.set(2, "done", TOTAL - e.cuenta.noev + " orders");
        pipe.set(
          3,
          e.cuenta.sinrec ? "fail" : "done",
          TOTAL - e.cuenta.noev - e.cuenta.sinrec + " receipts",
        );
        pipe.set(4, "done", e.exc + " exceptions");
        pipe.set(5, "done", e.auto + " for payment");

        log.clear();
        log.push(
          "in",
          "Rules: price " +
            k.pct(vtp, 2) +
            " · quantity " +
            k.pct(vtc, 1) +
            " · materiality " +
            k.money(vum) +
            " · duplicates " +
            (vdup ? "blocked" : "no rule") +
            ".",
        );
        log.push(
          e.exc ? "wa" : "ok",
          e.auto +
            " invoices for scheduled payment and " +
            e.exc +
            " to the exception records. Press Run to watch the batch process document by document.",
        );

        estado.textContent =
          "batch evaluated " + k.stamp() + " · " + e.exc + " to the records";
        lectura(e, vtp, vtc, vum, vdup);
      }

      function lectura(e, vtp, vtc, vum, vdup) {
        ins.clear();
        var cero = evaluar(lote, 0, 0, 0, true);

        var l1;
        if (e.fuga > 0.5) {
          l1 =
            "With price tolerance at <b>" +
            k.pct(vtp, 2) +
            "</b>, quantity tolerance at <b>" +
            k.pct(vtc, 1) +
            "</b> and materiality at <b>" +
            k.money(vum) +
            "</b>, the batch approves without review <b>" +
            k.money(e.fuga) +
            "</b> of overbilling across <b>" +
            e.fugaN +
            "</b> " +
            (e.fugaN === 1 ? "invoice" : "invoices") +
            ". The largest is " +
            k.escapeHtml(e.peor.d.prov) +
            " with " +
            k.money(e.peor.r) +
            ".";
        } else {
          l1 =
            "Under these tolerances, no discrepancy favoring the vendor passes through: every discrepancy enters the exception records.";
        }
        if (!vdup)
          l1 +=
            " The duplicate rule is disabled, so a repeated invoice is sent for payment.";
        ins.add("amber", "$", l1);

        var horas = e.exc * H_POR_EXC;
        ins.add(
          "cyan",
          "h",
          "The <b>" +
            e.exc +
            "</b> exceptions require <b>" +
            k.fmt(horas, 2) +
            " h</b> of manual review at 0.25 h per document. With all three controls at zero, that would be <b>" +
            cero.exc +
            "</b> exceptions and <b>" +
            k.fmt(cero.exc * H_POR_EXC, 2) +
            " h</b>, much of it for rounding differences an analyst closes without making any changes.",
        );

        var nm = e.cuenta.menor;
        var l3;
        if (vum === 0) {
          l3 =
            "The materiality threshold is zero: every cent outside tolerance opens a case. Raise it to see how many documents no longer reach the analyst, and at what cost.";
        } else if (nm) {
          l3 =
            "The threshold of <b>" +
            k.money(vum) +
            "</b> automatically approves only <b>" +
            nm +
            "</b> " +
            (nm === 1 ? "document" : "documents") +
            " outside tolerance, totaling <b>" +
            k.money(e.monto.menor) +
            "</b> in total. That is the explicit cost of not opening those cases.";
        } else {
          l3 =
            "No document falls below the threshold of <b>" +
            k.money(vum) +
            "</b>: discrepancies in this batch are either too small to exceed tolerance or too costly to approve automatically.";
        }
        ins.add("violet", "%", l3);

        var bloq = e.cuenta.noev + e.cuenta.sinrec + (vdup ? e.cuenta.dup : 0);
        ins.add(
          "rose",
          "!",
          "The <b>" +
            bloq +
            "</b> blocks do not depend on tolerance: without a readable order or receipt, or when a duplicate is suspected, the robot holds the entire invoice and routes it with supporting evidence. No control can approve them.",
        );
      }

      /* la corrida no cambia el resultado: recorre la cadena y el
               expediente para que se vea la secuencia y el enrutamiento */
      async function correr() {
        var mio = ++token;
        var e = ultimo;
        var filas = filasNode;
        if (!e || !filas || !filas.length) return;
        ctl.busy("run", true);
        pipe.reset();
        log.clear();

        function vivo() {
          return mio === token;
        }
        /* jitter cosmético en las duraciones, nunca en los datos */
        function ms(base) {
          return base + Math.random() * 90;
        }

        log.push(
          "in",
          "Trigger: " +
            TOTAL +
            " new attachments in the accounts payable inbox.",
        );
        pipe.set(0, "run");
        await k.wait(ms(240));
        if (!vivo()) {
          ctl.busy("run", false);
          return;
        }
        pipe.set(0, "done", TOTAL + " invoices");

        pipe.set(1, "run");
        await k.wait(ms(300));
        if (!vivo()) {
          ctl.busy("run", false);
          return;
        }
        var leg = TOTAL - e.cuenta.noev;
        pipe.set(1, e.cuenta.noev ? "fail" : "done", leg + " readable");
        if (e.cuenta.noev)
          log.push(
            "er",
            e.cuenta.noev +
              " attachment with no readable order number. Without an order, three-way matching is impossible: it is held and routed to manual data entry.",
          );

        pipe.set(2, "run");
        await k.wait(ms(280));
        if (!vivo()) {
          ctl.busy("run", false);
          return;
        }
        pipe.set(2, "done", leg + " orders");
        log.push(
          "in",
          "Purchase orders read from the ERP for " + leg + " invoices.",
        );

        pipe.set(3, "run");
        await k.wait(ms(280));
        if (!vivo()) {
          ctl.busy("run", false);
          return;
        }
        var conRec = leg - e.cuenta.sinrec;
        pipe.set(3, e.cuenta.sinrec ? "fail" : "done", conRec + " receipts");
        if (e.cuenta.sinrec)
          log.push(
            "er",
            e.cuenta.sinrec +
              " invoice with no goods receipt. The robot does not approve goods nobody received.",
          );

        pipe.set(4, "run");
        for (var i = 0; i < filas.length; i++) {
          if (!vivo()) {
            ctl.busy("run", false);
            return;
          }
          var fila = filas[i];
          if (!fila || !fila.parentNode) {
            ctl.busy("run", false);
            return;
          }
          var f = e.filas[i];
          fila.classList.add("hit");
          estado.textContent =
            "three-way matching · " +
            (i + 1) +
            " / " +
            filas.length +
            " · " +
            f.d.doc;
          if (f.cod === "ok")
            log.push(
              "ok",
              f.d.doc +
                " " +
                f.d.prov +
                ": all three documents match, sent for scheduled payment.",
            );
          else if (f.cod === "menor")
            log.push(
              "ok",
              f.d.doc +
                " " +
                f.d.prov +
                ": discrepancy of " +
                k.money(f.r) +
                " below the threshold, sent for scheduled payment.",
            );
          else if (VER[f.cod].bloqueo)
            log.push(
              "er",
              f.d.doc +
                " " +
                f.d.prov +
                ": " +
                VER[f.cod].t.toLowerCase() +
                ", invoice held for " +
                k.money(f.r) +
                ".",
            );
          else
            log.push(
              "wa",
              f.d.doc +
                " " +
                f.d.prov +
                ": " +
                VER[f.cod].t.toLowerCase() +
                " outside tolerance, " +
                k.money(f.r) +
                " to the exception records.",
            );
          await k.wait(ms(58));
          if (fila.parentNode) fila.classList.remove("hit");
        }
        if (!vivo()) {
          ctl.busy("run", false);
          return;
        }
        pipe.set(4, "done", e.exc + " exceptions · " + e.auto + " for payment");

        pipe.set(5, "run");
        await k.wait(ms(260));
        if (!vivo()) {
          ctl.busy("run", false);
          return;
        }
        pipe.set(5, "done", e.auto + " for payment");
        log.push(
          "hl",
          "Batch closed: " +
            e.auto +
            " invoices to the scheduled-payment file and " +
            e.exc +
            " to exception records with the reason, amount and evidence. Held amount: " +
            k.money(e.retenido) +
            ".",
        );
        estado.textContent =
          "batch reconciled " +
          k.stamp() +
          " · " +
          e.exc +
          " to the exception records";
        ctl.busy("run", false);
      }

      ctl.onClick("run", function () {
        correr();
      });
      ctl.on(function () {
        pintar();
      });

      /* abre en estado de trabajo: datos, indicadores, cadena y gráfica pintados */
      pintar();
    },
  });
})();
