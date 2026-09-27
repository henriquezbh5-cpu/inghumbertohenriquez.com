/* CARTERO — robot no atendido de reportes programados: corre en una
   máquina virtual dedicada, abre el visor de tableros, exporta, arma el
   correo, entrega y archiva evidencia. Todos los datos son sintéticos. */
(function () {
  "use strict";
  var LAB = window.LAB;

  var REPORTES = [
    "Consumption by site",
    "Spare parts inventory",
    "Closed orders",
    "Handling times",
    "Costs by region",
    "SLA compliance",
  ];
  var PERSONAS = [
    { n: "Ada Peralta", a: "Operations" },
    { n: "Bruno Mancía", a: "Warehouse" },
    { n: "Carla Vides", a: "Finance" },
    { n: "Diego Rosales", a: "Operations" },
    { n: "Elena Quintanilla", a: "Executive team" },
    { n: "Fabio Menjívar", a: "Procurement" },
    { n: "Gabriela Solís", a: "Quality" },
    { n: "Héctor Amaya", a: "Warehouse" },
    { n: "Irene Bustamante", a: "Finance" },
    { n: "Julio Cardona", a: "Maintenance" },
    { n: "Karla Núñez", a: "Executive team" },
    { n: "Luis Pineda", a: "Procurement" },
  ];
  var ESPERA = [
    30, 60, 120,
  ]; /* espera progresiva entre reintentos, en segundos */
  var LIMITE_MB = 20; /* tope de adjuntos del buzón corporativo */
  var TIMEOUT = 90; /* espera del visor antes de darlo por vacío */
  var SUBIDA = 25; /* subir todo a la carpeta de evidencia */
  var MAX_UTIL = 2; /* del tercer reintento en adelante ya no aporta */

  /* Peso, páginas y duración de cada reporte + historial de 12 semanas. */
  function datos() {
    var r = LAB.kit.rng(6120);
    var reps = REPORTES.map(function (n) {
      return {
        n: n,
        pdf: 1.6 + r() * 2.6,
        xls: 0.6 + r() * 1.2,
        pag: Math.round(12 + r() * 36),
        seg: Math.round(40 + r() * 26),
      };
    });
    function minutos(e) {
      var m = 6.2 + r() * 2.2;
      if (e === "warn") m += 1.4 + r() * 1.6;
      if (e === "bad") m *= 0.45 + r() * 0.2;
      return Math.round(m * 10) / 10;
    }
    var hist = [],
      i,
      p,
      e;
    for (i = 0; i < 12; i++) {
      p = r();
      e = p < 0.75 ? "ok" : p < 0.92 ? "warn" : "bad";
      hist.push({
        s: 25 + i,
        e: e,
        f: e === "bad" ? 1 + Math.floor(r() * 2) : 0,
        min: minutos(e),
      });
    }
    /* el historial debe enseñar los tres estados aunque la semilla no los saque */
    function forzar(i, e, f) {
      hist[i].e = e;
      hist[i].f = f;
      hist[i].min = minutos(e);
    }
    if (
      !hist.some(function (w) {
        return w.e === "warn";
      })
    )
      forzar(9, "warn", 0);
    if (
      !hist.some(function (w) {
        return w.e === "bad";
      })
    )
      forzar(4, "bad", 2);
    return { reps: reps, hist: hist, prox: 37 };
  }

  LAB.register({
    id: "cartero",
    name: "CARTERO",
    family: "procesos",
    tagline: "Scheduled reports",
    title: "CARTERO — weekly reports send themselves",
    intro:
      "An unattended robot opens the dashboard viewer every Monday at 06:00, exports the reports, prepares the email and delivers it. Choose how many reports, their format, the recipients, the retry limit and the failure you want to explore.",
    spec: {
      trigger:
        "Operating-system task scheduler: every Monday at 06:00, inside a dedicated robot virtual machine. It does not run on a person's desktop or depend on someone being signed in.",
      systems:
        "Desktop RPA over the dashboard viewer, corporate email client and network evidence folder. The service credential is kept in the vault, never in the script.",
      output:
        "An email with reports as attachments or links depending on size, delivery records per recipient and the run's evidence folder.",
      failure:
        "Distinguishes temporary from permanent failures. Retries after 30 s, 60 s and 120 s only where retries help; switches delivery methods if the destination inbox rejects attachments, and aborts with a notification if credentials expire. Never reports false success.",
    },
    impact: [
      ["52", "runs per year without intervention"],
      ["3 h -> 7 min", "per weekly run"],
      ["100%", "runs with archived evidence"],
    ],

    render: function (host, k) {
      var D = datos();
      var hist = D.hist.slice();
      var prox = D.prox;
      var corriendo = false;
      var st = null;
      var notas = [];
      var TONO = { ok: k.C.green, warn: k.C.amber, bad: k.C.rose };

      function dur(s) {
        var m = Math.floor(s / 60),
          q = Math.round(s % 60);
        return m + " m " + k.pad(q) + " s";
      }
      function min1(s) {
        return Math.round(s / 6) / 10;
      }
      function suma(o) {
        var t = 0,
          x;
        for (x in o) {
          if (Object.prototype.hasOwnProperty.call(o, x)) t += o[x];
        }
        return t;
      }
      function estadoTexto(w) {
        if (w.e === "ok") return "complete delivery, no incidents";
        if (w.e === "warn") return "complete delivery with retries or links";
        return (
          "partial delivery: missing " +
          w.f +
          (w.f === 1 ? " report" : " reports")
        );
      }

      /* ---------- controles ---------- */
      var ctl = k.controls([
        {
          k: "rep",
          t: "range",
          label: "Reports to export",
          min: 1,
          max: 6,
          step: 1,
          value: 4,
        },
        {
          k: "formato",
          t: "select",
          label: "Format",
          options: ["PDF", "Excel", "PDF + Excel"],
          value: "PDF + Excel",
        },
        {
          k: "dest",
          t: "range",
          label: "Recipients",
          min: 1,
          max: 12,
          step: 1,
          value: 5,
        },
        {
          k: "reint",
          t: "range",
          label: "Retries allowed",
          min: 0,
          max: 3,
          step: 1,
          value: 2,
        },
        {
          k: "falla",
          t: "select",
          label: "Failure to simulate",
          value: "ninguna",
          options: [
            { v: "ninguna", t: "None — normal path" },
            { v: "tablero", t: "The viewer returns no data" },
            { v: "correo", t: "The destination inbox rejects delivery" },
            { v: "sesion", t: "The service account cannot sign in" },
          ],
        },
        { k: "run", t: "button", label: "Run", primary: true },
      ]);
      host.appendChild(ctl.node);

      var kp = k.kpis([
        ["Next run", "—"],
        ["Reports delivered", "—"],
        ["Duration", "—"],
        ["Complete deliveries over 12 weeks", "—"],
      ]);
      host.appendChild(kp.node);

      /* ---------- fila 1: plan y secuencia | calendario y registro ---------- */
      var g1 = k.el("div", "grid2 wide-left");
      host.appendChild(g1);

      var izq = k.el("div", "stack");
      var pPlan = k.panel();
      pPlan.appendChild(k.txt("div", "mono-head", "Run plan"));
      var planBox = k.el("div", "fields");
      pPlan.appendChild(planBox);
      var pSec = k.panel();
      pSec.appendChild(k.txt("div", "mono-head", "Robot sequence"));
      var secBox = k.el("div");
      pSec.appendChild(secBox);
      izq.appendChild(pPlan);
      izq.appendChild(pSec);
      g1.appendChild(izq);

      var der = k.el("div", "stack");
      var pCal = k.panel();
      pCal.appendChild(
        k.txt("div", "mono-head", "Run calendar — last 12 weeks"),
      );
      var calHead = k.el("div", "cal-head");
      var calGrid = k.el("div", "cal");
      calHead.style.gridTemplateColumns = "repeat(13, 1fr)";
      calGrid.style.gridTemplateColumns = "repeat(13, 1fr)";
      var calendar = k.el("div", "run-calendar");
      calendar.appendChild(calHead);
      calendar.appendChild(calGrid);
      pCal.appendChild(calendar);
      var leg = k.el(
        "div",
        null,
        k.pill("ok", "C · complete") +
          k.pill("warn", "R · retries or links used") +
          k.pill("bad", "P · partial or aborted") +
          k.pill("idle", "> · next"),
      );
      leg.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:12px";
      pCal.appendChild(leg);
      var det = k.txt("div", null, "");
      det.style.cssText =
        "margin-top:10px;font-size:12.5px;line-height:1.55;color:" + k.C.label;
      det.setAttribute("aria-live", "polite");
      pCal.appendChild(det);

      var pLog = k.panel();
      pLog.appendChild(k.txt("div", "mono-head", "Execution log"));
      var lg = k.log("236px");
      pLog.appendChild(lg.node);
      der.appendChild(pCal);
      der.appendChild(pLog);
      g1.appendChild(der);

      /* ---------- fila 2: gráfica | reparto del tiempo ---------- */
      var g2 = k.el("div", "grid2 wide-left");
      host.appendChild(g2);
      var cbx = k.chartbox(
        "Duration per run",
        "Twelve completed weeks plus a projection for your configuration.",
        "232px",
      );
      g2.appendChild(cbx.node);
      var pBar = k.panel();
      pBar.appendChild(k.txt("div", "mono-head", "Expected time breakdown"));
      var br = k.bars();
      pBar.appendChild(br.node);
      g2.appendChild(pBar);

      /* ---------- fila 3: lectura ---------- */
      var pIns = k.panel();
      pIns.appendChild(k.txt("div", "mono-head", "Configuration insights"));
      var ins = k.insights();
      pIns.appendChild(ins.node);
      host.appendChild(pIns);

      /* ---------- fila 4: archivos del correo ---------- */
      var pTab = k.panel();
      pTab.appendChild(
        k.txt("div", "mono-head", "Email files — how each report is delivered"),
      );
      var tabBox = k.el("div");
      pTab.appendChild(tabBox);
      host.appendChild(pTab);

      var COLS = [
        { t: "Report" },
        { t: "Format" },
        { t: "Size", r: true },
        { t: "Pages", r: true },
        { t: "Export", r: true },
        { t: "Delivery method" },
      ];

      var ch = k.chart(cbx.canvas, {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderWidth: 0,
              borderRadius: 5,
              maxBarThickness: 26,
            },
          ],
        },
        options: {
          /* el color de cada barra lo fija el estado, no se interpola:
                       animar un arreglo de colores rompe al animador de Chart.js */
          animations: { colors: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (c) {
                  return (
                    k.fmt(c.parsed.y, 1) +
                    " min · " +
                    (notas[c.dataIndex] || "")
                  );
                },
              },
            },
          },
          scales: {
            x: k.AXIS_BARE,
            y: Object.assign({}, k.AXIS, {
              beginAtZero: true,
              ticks: {
                padding: 8,
                callback: function (v) {
                  return v + " min";
                },
              },
            }),
          },
        },
      });

      /* ---------- configuración leída de los controles ---------- */
      function plan() {
        var n = ctl.get("rep"),
          f = ctl.get("formato"),
          d = ctl.get("dest");
        var conPdf = f !== "Excel",
          conXls = f !== "PDF";
        var lista = D.reps.slice(0, n).map(function (x) {
          return {
            n: x.n,
            mb: (conPdf ? x.pdf : 0) + (conXls ? x.xls : 0),
            pag: conPdf ? x.pag : 0,
            seg: Math.round(
              x.seg * (conPdf && conXls ? 1.55 : conXls ? 0.85 : 1),
            ),
            canal: "attachment",
          };
        });
        /* el correo adjunta de menor a mayor hasta llenar el tope; lo que no cabe sale por enlace */
        var acum = 0;
        lista
          .slice()
          .sort(function (a, b) {
            return a.mb - b.mb;
          })
          .forEach(function (x) {
            if (acum + x.mb <= LIMITE_MB) {
              x.canal = "attachment";
              acum += x.mb;
            } else x.canal = "link";
          });
        var areas = {},
          i;
        for (i = 0; i < d; i++) areas[PERSONAS[i].a] = 1;
        return {
          n: n,
          d: d,
          f: f,
          lista: lista,
          rt: ctl.get("reint"),
          falla: ctl.get("falla"),
          porArchivo: (conPdf ? 1 : 0) + (conXls ? 1 : 0),
          areas: Object.keys(areas).length,
          idxFallo: Math.min(1, n - 1),
        };
      }

      /* Resultado determinista de la corrida. La vista previa y la
               animación leen de aquí, así nunca se contradicen. */
      function simular(P) {
        var s = {
          login: 45,
          exp: 0,
          espera: 0,
          verif: 20,
          redac: 15,
          envio: 6 * P.d,
          evid: 18,
          subida: 0,
        };
        var R = {
          entregados: P.lista.length,
          faltan: [],
          reintentos: 0,
          recuperado: false,
          aborta: false,
          porEnlace: false,
          mb: 0,
          pag: 0,
          enlaces: 0,
          adjuntos: 0,
        };
        var i;

        if (P.falla === "sesion") {
          R.aborta = true;
          R.entregados = 0;
          R.reintentos = Math.min(P.rt, 1);
          s.login = 45 + R.reintentos * 45;
          s.espera = R.reintentos * ESPERA[0];
          s.verif = 0;
          s.redac = 10;
          s.envio = 6;
          s.evid = 12;
          P.lista.forEach(function (x) {
            R.faltan.push(x.n);
          });
        } else if (P.falla === "tablero") {
          R.reintentos = Math.min(P.rt, MAX_UTIL);
          for (i = 0; i < R.reintentos; i++) s.espera += ESPERA[i];
          R.recuperado = P.rt >= MAX_UTIL;
          /* cada intento fallido consume la espera completa del visor */
          s.exp = TIMEOUT * (R.recuperado ? R.reintentos : 1 + R.reintentos);
          if (!R.recuperado) {
            R.entregados = P.idxFallo;
            for (i = P.idxFallo; i < P.lista.length; i++)
              R.faltan.push(P.lista[i].n);
          }
        } else if (P.falla === "correo") {
          R.reintentos = P.rt;
          R.porEnlace = true;
          for (i = 0; i < P.rt; i++) s.espera += ESPERA[i];
          s.subida = SUBIDA;
          s.envio = 20 * (1 + P.rt) + 6 * P.d;
        }

        for (i = 0; i < R.entregados; i++) {
          s.exp += P.lista[i].seg;
          R.mb += P.lista[i].mb;
          R.pag += P.lista[i].pag;
          if (P.lista[i].canal === "link") R.enlaces++;
        }
        if (R.porEnlace) R.enlaces = R.entregados;
        R.adjuntos = (R.entregados - R.enlaces) * P.porArchivo;
        R.archivos = R.entregados * P.porArchivo;
        R.seg = s;
        R.total = suma(s);
        R.estado =
          R.aborta || R.faltan.length
            ? "bad"
            : R.reintentos || R.porEnlace
              ? "warn"
              : "ok";
        return R;
      }

      /* ---------- pintores ---------- */
      function fila(a, b, c) {
        var row = k.el("div", "fx");
        row.appendChild(k.txt("div", "fk", a));
        row.appendChild(k.txt("div", "fv", b));
        var e = k.txt("div", "mono", c || "");
        e.style.cssText = "text-align:right;font-size:10px;color:" + k.C.label;
        row.appendChild(e);
        return row;
      }

      function textoFalla(P, S) {
        if (P.falla === "ninguna")
          return "Normal route: export, attach and deliver.";
        if (P.falla === "sesion")
          return "The service credential expired: aborts before exporting and sends a notification.";
        if (P.falla === "correo")
          return (
            "The inbox rejects the email: retries " +
            P.rt +
            ", then switches to a link."
          );
        return S.recuperado
          ? "The viewer fails twice and recovers on retry 2."
          : "The viewer fails and retries are insufficient: partial delivery.";
      }

      function pintarPlan(P, S) {
        var nombres = P.lista.map(function (x) {
          return x.n;
        });
        var resumen =
          nombres.slice(0, 2).join(" · ") + (P.n > 2 ? " · +" + (P.n - 2) : "");
        var enlacePlan = P.lista.filter(function (x) {
          return x.canal === "link";
        }).length;
        var mbPlan = P.lista.reduce(function (t, x) {
          return t + x.mb;
        }, 0);
        var pagPlan = P.lista.reduce(function (t, x) {
          return t + x.pag;
        }, 0);

        planBox.innerHTML = "";
        planBox.appendChild(
          fila(
            "Trigger",
            "Monday 06:00 · dedicated robot virtual machine",
            "weekly",
          ),
        );
        planBox.appendChild(fila("Reports", resumen, P.n + " of 6"));
        planBox.appendChild(
          fila(
            "Format",
            P.f + " from the dashboard viewer",
            k.fmt(P.n * P.porArchivo, 0) + " files",
          ),
        );
        planBox.appendChild(
          fila(
            "Email size",
            k.fmt(mbPlan, 1) +
              " MB" +
              (pagPlan ? " · " + k.fmt(pagPlan, 0) + " pages" : "") +
              (enlacePlan
                ? " · " +
                  enlacePlan +
                  " via links, they do not fit within " +
                  LIMITE_MB +
                  " MB"
                : ""),
            enlacePlan ? "mixto" : "all attached",
          ),
        );
        planBox.appendChild(
          fila(
            "Recipients",
            P.d +
              (P.d === 1 ? " person" : " people") +
              " in " +
              P.areas +
              (P.areas === 1 ? " department" : " departments"),
            "fixed list",
          ),
        );
        planBox.appendChild(
          fila(
            "Retries",
            P.rt === 0
              ? "None: after the first failure, the robot decides using what it has"
              : P.rt +
                  " with a wait of " +
                  ESPERA.slice(0, P.rt).join(" s, ") +
                  " s",
            P.falla === "ninguna" ? "unused" : "in use",
          ),
        );
        planBox.appendChild(
          fila(
            "Expected result",
            textoFalla(P, S),
            S.entregados + " of " + P.n,
          ),
        );
      }

      function pintarPasos(P, S) {
        var pasos = [
          {
            n: "Sign in with the service account",
            ms: "~" + S.seg.login + " s",
          },
        ];
        P.lista.forEach(function (x, i) {
          pasos.push({
            n: "Export report " + (i + 1) + " — " + x.n,
            ms: "~" + x.seg + " s",
          });
        });
        pasos.push({ n: "Check file size, pages and 0 KB files", ms: "~20 s" });
        pasos.push({
          n: "Draft email with a summary and pending items",
          ms: "~15 s",
        });
        pasos.push({
          n: "Deliver to " + P.d + (P.d === 1 ? " recipient" : " recipients"),
          ms: "~" + S.seg.envio + " s",
        });
        pasos.push({ n: "Archive evidence and sign out", ms: "~18 s" });
        st = k.steps(pasos);
        secBox.innerHTML = "";
        secBox.appendChild(st.node);
      }

      function pintarTabla(P) {
        tabBox.innerHTML = "";
        var t = k.table(
          COLS,
          P.lista.map(function (x) {
            return [
              x.n,
              P.f,
              k.fmt(x.mb, 1) + " MB",
              x.pag ? k.fmt(x.pag, 0) : "—",
              x.seg + " s",
              {
                html:
                  x.canal === "attachment"
                    ? k.pill("ok", "attachment")
                    : k.pill("warn", "link"),
              },
            ];
          }),
        );
        tabBox.appendChild(t.node);
      }

      function pintarBarras(S) {
        var partes = [
          ["Sign in", S.seg.login],
          ["Export reports", S.seg.exp],
          ["Retry waiting time", S.seg.espera],
          ["Verify output", S.seg.verif],
          ["Draft email", S.seg.redac],
          ["Upload to evidence storage", S.seg.subida],
          ["Deliver", S.seg.envio],
          ["Archive and close", S.seg.evid],
        ].filter(function (p) {
          return p[1] > 0;
        });
        var max = partes.reduce(function (m, p) {
          return Math.max(m, p[1]);
        }, 1);
        br.clear();
        partes.forEach(function (p) {
          br.add(p[0], p[1], max, k.C.teal, p[1] + " s");
        });
      }

      function pintarInsights(P, S) {
        var enlacePlan = P.lista.filter(function (x) {
          return x.canal === "link";
        }).length;
        var mbPlan = P.lista.reduce(function (t, x) {
          return t + x.mb;
        }, 0);
        ins.clear();
        ins.add(
          enlacePlan ? "amber" : "teal",
          enlacePlan ? "!" : "=",
          enlacePlan
            ? "<b>" +
                enlacePlan +
                " report(s) do not fit in the email.</b> The robot attaches files from smallest to largest up to the limit of " +
                LIMITE_MB +
                " MB and publishes the rest in the evidence folder with a 30-day link. Nobody receives a bounced email."
            : "<b>Everything fits as an attachment:</b> " +
                k.fmt(mbPlan, 1) +
                " MB against the limit of " +
                LIMITE_MB +
                " MB. No link is needed.",
        );
        ins.add(
          P.rt === 0 ? "rose" : "cyan",
          P.rt === 0 ? "x" : "+",
          P.rt === 0
            ? "<b>No retries:</b> any viewer failure results in partial delivery. This is the fastest configuration and the one most likely to leave reports out."
            : "<b>" +
                P.rt +
                " retry/retries:</b> add up to " +
                ESPERA.slice(0, Math.min(P.rt, MAX_UTIL)).reduce(function (
                  a,
                  b,
                ) {
                  return a + b;
                }, 0) +
                " s of waiting. The third and later attempts recover nothing: if two attempts are not enough, the problem is not temporary.",
        );
        ins.add(
          "violet",
          ">",
          "<b>A single list of " +
            P.d +
            " recipient(s) across " +
            P.areas +
            " department(s).</b> The list lives in the robot configuration, not a person's address book: a personnel change is updated in one place, with no manual forwarding.",
        );
      }

      function pintarChart(S) {
        if (!ch) return;
        var labels = hist.map(function (w) {
          return "S" + w.s;
        });
        var vals = hist.map(function (w) {
          return w.min;
        });
        var cols = hist.map(function (w) {
          return TONO[w.e];
        });
        notas = hist.map(estadoTexto);
        labels.push("S" + prox + " · plan");
        vals.push(min1(S.total));
        cols.push(k.C.blue);
        notas.push("projection for the configured run");
        ch.data.labels = labels;
        ch.data.datasets[0].data = vals;
        ch.data.datasets[0].backgroundColor = cols;
        ch.update();
        cbx.cap(
          "Green: complete delivery. Amber: complete with retries or links. Pink: partial or aborted. " +
            "The final blue bar projects run S" +
            prox +
            " under your configuration: " +
            dur(S.total) +
            ".",
        );
      }

      function dibujarCal() {
        calHead.innerHTML = "";
        calGrid.innerHTML = "";
        hist.concat([{ s: prox, e: "next", f: 0 }]).forEach(function (w) {
          calHead.appendChild(k.txt("div", null, "S" + w.s));
          var letra =
            w.e === "ok"
              ? "C"
              : w.e === "warn"
                ? "R"
                : w.e === "bad"
                  ? "P"
                  : ">";
          var c = k.txt("div", "cal-cell " + w.e, letra);
          c.title =
            "Week " +
            w.s +
            " — " +
            (w.e === "next" ? "next scheduled run" : estadoTexto(w));
          calGrid.appendChild(c);
        });
        var malas = hist
          .filter(function (w) {
            return w.e !== "ok";
          })
          .map(function (w) {
            return "S" + w.s + ": " + estadoTexto(w);
          });
        det.textContent = malas.length
          ? "Weeks with incidents — " + malas.join(" · ")
          : "All 12 weeks ended with complete delivery.";
        var completas = hist.filter(function (w) {
          return w.e !== "bad";
        }).length;
        kp.set(
          3,
          completas + " / 12",
          completas >= 11 ? "up" : completas >= 9 ? "warn" : "bad",
        );
      }

      function sync() {
        if (corriendo) return;
        var P = plan(),
          S = simular(P);
        pintarPlan(P, S);
        pintarPasos(P, S);
        pintarTabla(P);
        pintarBarras(S);
        pintarInsights(P, S);
        pintarChart(S);
        kp.set(0, "S" + prox + " · Mon 06:00", "");
        kp.set(1, "— / " + P.n, "");
        kp.set(2, "~" + dur(S.total), "");
      }
      ctl.on(sync);

      /* ---------- corrida animada ---------- */
      function cerrar(P, S) {
        kp.set(
          1,
          S.entregados + " / " + P.n,
          S.estado === "bad" ? "bad" : S.estado === "warn" ? "warn" : "up",
        );
        kp.set(2, dur(S.total), S.total > 900 ? "warn" : "");
        hist.push({
          s: prox,
          e: S.estado,
          f: S.faltan.length,
          min: min1(S.total),
        });
        hist.shift();
        prox++;
        dibujarCal();
        pintarChart(simular(plan()));
        kp.set(0, "S" + prox + " · Mon 06:00", "");
        lg.push(
          "hl",
          "Next run: S" +
            prox +
            ", Monday 06:00. Automatically scheduled; nobody needs to open anything.",
        );
        ctl.busy("run", false);
        corriendo = false;
      }

      async function correr() {
        if (corriendo) return;
        corriendo = true;
        ctl.busy("run", true);
        var P = plan(),
          S = simular(P);
        var base = P.lista.length + 1;
        var i, j, a;
        st.reset();
        lg.clear();

        lg.push(
          "hl",
          "Task scheduler: weekly trigger S" +
            prox +
            ", Monday 06:00, on the robot's virtual machine.",
        );
        st.set(0, "run");
        await k.wait(280);

        if (P.falla === "sesion") {
          lg.push(
            "er",
            "The service account could not sign in: the directory rejected the password supplied by the vault.",
          );
          if (S.reintentos) {
            lg.push(
              "wa",
              "Retry 1 of " +
                P.rt +
                ": wait of " +
                ESPERA[0] +
                " s, followed by a second sign-in attempt.",
            );
            await k.wait(240);
            lg.push(
              "er",
              "The second attempt was also rejected. This is not a temporary failure: the credential expired.",
            );
          } else {
            lg.push("wa", "Retries allowed: 0. The robot does not try again.");
          }
          st.set(0, "fail", "not signed in");
          for (i = 1; i < st.count; i++) st.set(i, "", "skipped");
          lg.push(
            "hl",
            "Decision: without a session there is nothing to export. Abort the run, do not send the reports email and escalate the notification.",
          );
          await k.wait(220);
          lg.push(
            "wa",
            "Notification sent to the robot owner and the " +
              P.d +
              ' recipients: "Run W' +
              prox +
              ' not run", including the cause and attempt time.',
          );
          lg.push(
            "ok",
            "Evidence archived in evidencia\\corridas\\S" +
              prox +
              ": screenshot of the rejection and attempt log.",
          );
          cerrar(P, S);
          return;
        }

        st.set(0, "done", "45 s");
        lg.push(
          "ok",
          "Signed in with the service account; dashboard viewer loaded with the week's filter.",
        );
        if (P.falla === "tablero") {
          lg.push(
            "wa",
            "Simulated failure: report " +
              (P.idxFallo + 1) +
              " will return no data on the first attempt.",
          );
        }

        for (i = 0; i < P.lista.length; i++) {
          st.set(i + 1, "run");
          await k.wait(190);
          if (P.falla === "tablero" && i === P.idxFallo) {
            lg.push(
              "er",
              "Report " +
                (i + 1) +
                " — " +
                P.lista[i].n +
                ": the viewer returned an empty view after " +
                TIMEOUT +
                " s of waiting.",
            );
            var ok = false;
            for (a = 1; a <= P.rt && a <= MAX_UTIL; a++) {
              lg.push(
                "wa",
                "Retry " +
                  a +
                  " of " +
                  P.rt +
                  ": wait of " +
                  ESPERA[a - 1] +
                  " s before reopening the report.",
              );
              await k.wait(230);
              if (a >= MAX_UTIL) {
                ok = true;
                lg.push(
                  "ok",
                  "Retry " +
                    a +
                    ": the viewer returned complete data. The run continues.",
                );
                if (P.rt > MAX_UTIL)
                  lg.push(
                    "in",
                    "Retry " +
                      (MAX_UTIL + 1) +
                      " is unused: the second already recovered the data.",
                  );
                break;
              }
              lg.push(
                "er",
                "Retry " +
                  a +
                  ": the viewer still returns an empty view after " +
                  TIMEOUT +
                  " s.",
              );
            }
            if (!ok) {
              st.set(i + 1, "fail", P.rt === 0 ? "no retry" : "exhausted");
              lg.push(
                "er",
                P.rt === 0
                  ? "Retries allowed: 0. The robot stops exporting at this report."
                  : "Retries exhausted (" +
                      S.reintentos +
                      "). The robot stops exporting.",
              );
              lg.push(
                "hl",
                "Decision: do not continue with the remaining reports because the viewer session is inconsistent. Deliver what was exported and document what is missing.",
              );
              for (j = i + 1; j < P.lista.length; j++)
                st.set(j + 1, "", "skipped");

              break;
            }
          }
          st.set(i + 1, "done", P.lista[i].seg + " s");
          lg.push(
            "in",
            "Report " +
              (i + 1) +
              " — " +
              P.lista[i].n +
              " exported in " +
              P.f +
              " · " +
              k.fmt(P.lista[i].mb, 1) +
              " MB" +
              (P.lista[i].pag
                ? " · " + k.fmt(P.lista[i].pag, 0) + " pages"
                : "") +
              ".",
          );
        }

        var vacio = S.entregados === 0;
        st.set(base, "run");
        await k.wait(210);
        st.set(base, "done", vacio ? "no files" : "20 s");
        lg.push(
          vacio ? "er" : "in",
          vacio
            ? "Verification: the run exported no files. There is nothing to attach."
            : "Verification: " +
                S.archivos +
                " files, " +
                k.fmt(S.mb, 1) +
                " MB" +
                (S.pag ? ", " + k.fmt(S.pag, 0) + " pages" : "") +
                ". None are 0 KB.",
        );
        if (!S.porEnlace && S.enlaces) {
          lg.push(
            "wa",
            "The email cannot accommodate " +
              k.fmt(S.mb, 1) +
              " MB: " +
              S.enlaces +
              " report(s) are delivered via links to the evidence folder; the rest are attached.",
          );
        }

        st.set(base + 1, "run");
        await k.wait(200);
        st.set(base + 1, "done", "15 s");
        lg.push(
          "in",
          vacio
            ? 'Notification email drafted: subject "Run S' +
                prox +
                ' without reports", including the viewer error and attempt time.'
            : 'Email composed: subject "Weekly reports W' +
                prox +
                '", summary of ' +
                S.entregados +
                (S.entregados === 1 ? " report" : " reports") +
                (S.faltan.length ? " and a pending-items section." : "."),
        );

        st.set(base + 2, "run");
        if (P.falla === "correo") {
          lg.push(
            "er",
            "The server rejected the message: 552, the destination inbox does not accept these attachments. Its limit is lower than the sender's.",
          );
          for (a = 1; a <= P.rt; a++) {
            lg.push(
              "wa",
              "Retry " +
                a +
                " of " +
                P.rt +
                ": wait of " +
                ESPERA[a - 1] +
                " s, then resend the same message.",
            );
            await k.wait(210);
            lg.push(
              "er",
              "Retry " +
                a +
                ": same rejection. Resending does not change the message.",
            );
          }
          lg.push(
            "hl",
            "Decision: retries cannot fix an inbox-policy rejection. The robot uploads the files to the evidence folder and rewrites the email with a link.",
          );
          await k.wait(240);
          lg.push(
            "ok",
            "Files published to the evidence folder in " +
              SUBIDA +
              " s. Email sent without attachments, with a link valid for 30 days.",
          );
        }
        for (i = 0; i < P.d; i++) {
          await k.wait(60);
          lg.push(
            vacio ? "wa" : "ok",
            vacio
              ? "Notification for the run without reports delivered to " +
                  PERSONAS[i].n +
                  " — " +
                  PERSONAS[i].a +
                  "."
              : "Delivered to " +
                  PERSONAS[i].n +
                  " — " +
                  PERSONAS[i].a +
                  " · " +
                  (S.porEnlace
                    ? "link to " + S.entregados + " report(s)"
                    : S.adjuntos +
                      " attachments" +
                      (S.enlaces ? " and " + S.enlaces + " via link" : "")) +
                  ".",
          );
        }
        st.set(base + 2, "done", S.seg.envio + " s");

        st.set(base + 3, "run");
        await k.wait(240);
        st.set(base + 3, "done", "18 s");
        lg.push(
          "ok",
          "Evidence archived in evidencia\\corridas\\S" +
            prox +
            ": files, email body and delivery records per recipient.",
        );
        if (S.faltan.length) {
          lg.push(
            "er",
            "Delivery record: missing " +
              S.faltan.join(", ") +
              ". Documented in the email and evidence; the run is not marked complete.",
          );
        }
        cerrar(P, S);
      }
      ctl.onClick("run", function () {
        correr();
      });

      /* ---------- estado inicial: ya trabajando ---------- */
      dibujarCal();
      sync();
      var ult = hist[hist.length - 1];
      lg.push(
        "in",
        "Run S" +
          ult.s +
          " finished in " +
          k.fmt(ult.min, 1) +
          " min — " +
          estadoTexto(ult) +
          ".",
      );
      lg.push(
        "ok",
        "Evidence S" +
          ult.s +
          " archived: files, email body and delivery records per recipient.",
      );
      lg.push(
        "hl",
        "Run S" +
          prox +
          " scheduled for Monday 06:00. Adjust the controls to view the plan and press Run to watch it step by step.",
      );
    },
  });
})();
