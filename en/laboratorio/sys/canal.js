(function () {
  "use strict";
  var LAB = window.LAB;

  var MESES = [
    "Sep 25",
    "Oct 25",
    "Nov 25",
    "Dec 25",
    "Jan 26",
    "Feb 26",
    "Mar 26",
    "Apr 26",
    "May 26",
    "Jun 26",
    "Jul 26",
    "Aug 26",
  ];
  var PAISES = ["El Salvador", "Guatemala", "Costa Rica", "Dominican Republic"];
  var LINEAS = ["Automation", "Licensing", "Consulting", "Support"];
  var CANALES = ["Direct", "Partner", "Portal", "Tender"];
  var AREAS = ["Operations", "Finance", "Sales", "Service", "Human Resources"];
  var PROCESOS = [
    "Bank reconciliation",
    "Order import",
    "Customer onboarding",
    "Monthly close",
    "Service quotes",
    "Catalog cleanup",
    "Payment notice",
    "Service report",
  ];

  /* cada sugerencia entra por una intención distinta; la última no está cubierta a propósito */
  var SUG = [
    "How much did we invoice by country?",
    "Which service line generates the most revenue?",
    "What is the total revenue and its trend?",
    "How much is being paid late?",
    "How many executions failed, and in which department?",
    "How many hours did the fleet save?",
    "Compare El Salvador against Guatemala",
    "How many employees does Operations have?",
  ];

  /* elección ponderada con el generador sembrado */
  function wpick(r, arr, pesos) {
    var t = 0,
      i,
      x;
    for (i = 0; i < pesos.length; i++) t += pesos[i];
    x = r() * t;
    for (i = 0; i < arr.length; i++) {
      x -= pesos[i];
      if (x <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  }

  /* Dos tablas sintéticas con semilla fija: 280 filas de facturación y 260 de
       bitácora de la flota. Empresas, montos y áreas son inventados. */
  function datos() {
    var r = LAB.kit.rng(77015),
      i,
      fac = [],
      flo = [],
      m,
      pais,
      linea,
      canal,
      area,
      est,
      ej;
    var base = {
      Automation: 9200,
      Licensing: 4300,
      Consulting: 6400,
      Support: 2050,
    };
    var fp = {
      "El Salvador": 1,
      Guatemala: 1.14,
      "Costa Rica": 0.92,
      "Dominican Republic": 0.81,
    };
    var wfall = {
      Operations: 12,
      Finance: 5,
      Sales: 8,
      Service: 6,
      "Human Resources": 4,
    };

    for (i = 0; i < 280; i++) {
      m = Math.floor(r() * 12);
      pais = wpick(r, PAISES, [34, 27, 22, 17]);
      linea = wpick(r, LINEAS, [31, 24, 26, 19]);
      canal = wpick(r, CANALES, [38, 26, 22, 14]);
      fac.push({
        mes: m,
        fecha: LAB.kit.pad(1 + Math.floor(r() * 28)) + " " + MESES[m],
        pais: pais,
        linea: linea,
        canal: canal,
        monto: Math.round(base[linea] * fp[pais] * (0.42 + r() * 1.75)),
        dias: Math.round(
          20 +
            r() * 36 +
            (canal === "Tender" ? 19 : 0) +
            (pais === "Dominican Republic" ? 11 : 0),
        ),
      });
    }
    for (i = 0; i < 260; i++) {
      m = Math.floor(r() * 12);
      area = wpick(r, AREAS, [30, 24, 19, 16, 11]);
      est = wpick(
        r,
        ["Successful", "With retry", "Failed"],
        [100 - wfall[area] - 9, 9, wfall[area]],
      );
      ej = 6 + Math.round(r() * 84);
      flo.push({
        mes: m,
        fecha: LAB.kit.pad(1 + Math.floor(r() * 28)) + " " + MESES[m],
        area: area,
        proceso: LAB.kit.pick(r, PROCESOS),
        ejec: ej,
        estado: est,
        min:
          est === "Failed"
            ? 0
            : Math.round(
                ej * (2.4 + r() * 10.5) * (est === "With retry" ? 0.7 : 1),
              ),
      });
    }
    return { fac: fac, flo: flo };
  }

  /* normalización sin acentos para leer la pregunta escrita a mano */
  var ACENTOS = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", ñ: "n" };
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    var o = "",
      i,
      c;
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i);
      o += ACENTOS[c] || c;
    }
    return o
      .replace(/\b(?:revenue|billing|invoiced?|sales)\b/g, "factur")
      .replace(/\b(?:countries|country|regions?)\b/g, "pais")
      .replace(/\b(?:service )?lines?\b/g, "linea")
      .replace(/\b(?:paid|payment|late|overdue)\b/g, "plazo")
      .replace(/\b(?:hours?|saved?|minutes?)\b/g, "ahorr")
      .replace(/\b(?:failed?|failures?|errors?|retries?)\b/g, "fall")
      .replace(/\b(?:compare|against)\b/g, "compar");
  }
  function tiene(q, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (q.indexOf(arr[i]) >= 0) return true;
    }
    return false;
  }
  function paisesEn(q) {
    var out = [];
    if (q.indexOf("salvador") >= 0) out.push("El Salvador");
    if (q.indexOf("guatemala") >= 0) out.push("Guatemala");
    if (q.indexOf("costa rica") >= 0 || q.indexOf("costarric") >= 0)
      out.push("Costa Rica");
    if (q.indexOf("dominican") >= 0) out.push("Dominican Republic");
    return out;
  }
  function plural(n, s, p) {
    return n + " " + (n === 1 ? s : p);
  }
  function lista(arr) {
    return "('" + arr.join("','") + "')";
  }

  LAB.register({
    id: "canal",
    name: "CANAL",
    family: "agentes",
    tagline: "Data agent",
    title: "An agent that queries tables and cites its source",
    intro:
      "This agent does not answer from memory: it translates the question into a query over two tables, applies the user's permissions before aggregation and reports how many records it read. Change the user to see the same question produce a different scope. Try a question it cannot answer, too.",
    spec: {
      trigger:
        "A natural-language question from corporate chat or the internal portal. No schedule or form is required: the agent responds when someone asks.",
      systems:
        "A language model interprets the question, a parameterized query layer accesses the data warehouse, and user permissions are applied before aggregation rather than after calculation.",
      output:
        "An answer calculated from connected tables: the figure, its supporting breakdown and a source citation with the table, rows read and user context.",
      failure:
        "If the connected data cannot answer the question, it says so and lists what it covers. If the data exists but is outside the user's scope, it explains this without displaying the figure. It never fills the gap with an estimate.",
    },
    impact: [
      ["1 source", "the agent queries data rather than answering from memory"],
      ["24/7", "in corporate chat and the internal portal"],
      ["Citation", "every answer identifies its source"],
    ],

    render: function (host, k) {
      var D = datos();
      var ROLES = [
        {
          v: "dir",
          t: "Regional executive team",
          paises: PAISES,
          lineas: LINEAS,
          areas: AREAS,
        },
        {
          v: "sv",
          t: "El Salvador management",
          paises: ["El Salvador"],
          lineas: LINEAS,
          areas: AREAS,
        },
        {
          v: "gtcr",
          t: "Guatemala and Costa Rica management",
          paises: ["Guatemala", "Costa Rica"],
          lineas: LINEAS,
          areas: AREAS,
        },
        {
          v: "auto",
          t: "Automation service-line analyst",
          paises: PAISES,
          lineas: ["Automation"],
          areas: ["Operations", "Finance"],
        },
      ];
      var S = {
        rol: ROLES[0],
        meses: 12,
        dias: 45,
        hechas: 0,
        leidos: 0,
        sinCifra: 0,
        ultima: null,
        nodo: null,
        corriendo: false,
      };

      var ctl = k.controls([
        {
          k: "rol",
          t: "select",
          label: "User asking the question",
          value: "dir",
          options: ROLES.map(function (x) {
            return { v: x.v, t: x.t };
          }),
        },
        {
          k: "per",
          t: "select",
          label: "Data window",
          value: "12",
          options: [
            { v: "12", t: "Last 12 months" },
            { v: "6", t: "Last 6 months" },
            { v: "3", t: "Last quarter" },
          ],
        },
        {
          k: "dias",
          t: "range",
          label: "Agreed payment terms",
          min: 30,
          max: 75,
          step: 5,
          value: 45,
          suffix: "days",
        },
      ]);
      host.appendChild(ctl.node);

      var kp = k.kpis([
        ["Questions answered", "0"],
        ["Rows within the user's scope", "—"],
        ["Rows read by queries", "0", "up"],
        ["Questions without a figure", "0", ""],
      ]);
      host.appendChild(kp.node);

      var grid = k.el("div", "grid2 wide-left");
      host.appendChild(grid);

      /* ---------- izquierda: el canal de consulta ---------- */
      var pnChat = k.panel();
      pnChat.appendChild(k.txt("div", "mono-head", "Query channel"));
      var chat = k.el("div", "chat");
      chat.style.marginTop = "12px";
      pnChat.appendChild(chat);

      var qs = k.el("div", "qs");
      SUG.forEach(function (s) {
        var b = k.txt("button", null, s);
        b.type = "button";
        b.addEventListener("click", function () {
          preguntar(s);
        });
        qs.appendChild(b);
      });
      pnChat.appendChild(qs);

      var comp = k.el("div", "ctl");
      comp.style.marginTop = "14px";
      var campo = k.el("div", "field grow");
      campo.appendChild(k.txt("span", null, "Your question"));
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Ask a question about the connected tables";
      input.setAttribute(
        "aria-label",
        "Ask a question about the connected tables",
      );
      campo.appendChild(input);
      comp.appendChild(campo);
      var btn = k.txt("button", "btn primary", "Ask");
      btn.type = "button";
      comp.appendChild(btn);
      pnChat.appendChild(comp);
      grid.appendChild(pnChat);

      /* ---------- derecha: fuentes y plan de consulta ---------- */
      var der = k.el("div", "stack");
      var pnF = k.panel();
      pnF.appendChild(k.txt("div", "mono-head", "Connected sources"));
      var FUENTES = [
        {
          n: "facturacion_regional",
          c: "date · country · service line · channel · amount · payment days",
        },
        {
          n: "bitacora_flota",
          c: "date · department · process · executions · minutes · status",
        },
      ];
      var conteo = [],
        recorte = [];
      FUENTES.forEach(function (f, i) {
        var fila = k.el("div");
        fila.style.cssText =
          "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:" +
          (i ? "14px" : "12px");
        var nom = k.txt("span", "mono", f.n);
        nom.style.cssText = "font-size:12.5px;color:" + k.C.ink;
        fila.appendChild(nom);
        fila.appendChild(k.el("span", null, k.pill("ok", "Connected")));
        pnF.appendChild(fila);
        var det = k.txt("div", "mono", "—");
        det.style.cssText = "margin-top:5px;font-size:11px;color:" + k.C.teal;
        pnF.appendChild(det);
        conteo.push(det);
        var rec = k.txt("div", "mono", "—");
        rec.style.cssText =
          "margin-top:3px;font-size:10.5px;color:" + k.C.amber;
        pnF.appendChild(rec);
        recorte.push(rec);
        var cam = k.txt("div", "mono", f.c);
        cam.style.cssText =
          "margin-top:3px;font-size:10.5px;line-height:1.6;color:" + k.C.label;
        pnF.appendChild(cam);
      });
      der.appendChild(pnF);

      var pnL = k.panel();
      pnL.appendChild(k.txt("div", "mono-head", "Query plan"));
      var log = k.log("190px");
      log.node.style.marginTop = "12px";
      pnL.appendChild(log.node);
      der.appendChild(pnL);
      grid.appendChild(der);

      /* ---------- abajo: la misma tabla, vista como serie ---------- */
      var g2 = k.el("div", "grid2");
      g2.style.marginTop = "18px";
      var cb = k.chartbox(
        "Monthly revenue within scope",
        "The same table queried by the agent",
        "224px",
      );
      g2.appendChild(cb.node);

      var pnE = k.panel();
      var evTit = k.txt("div", "mono-head", "Evidence for the latest answer");
      pnE.appendChild(evTit);
      var ev = k.bars();
      ev.node.style.marginTop = "14px";
      pnE.appendChild(ev.node);
      var evPie = k.txt("div", null, "");
      evPie.style.cssText =
        "margin-top:12px;font-size:11.5px;line-height:1.6;color:" + k.C.label;
      pnE.appendChild(evPie);
      g2.appendChild(pnE);
      host.appendChild(g2);

      var ch = k.chart(cb.canvas, {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Paid on time",
              data: [],
              backgroundColor: k.C.teal,
              borderRadius: 4,
              maxBarThickness: 22,
            },
            {
              label: "Paid late",
              data: [],
              backgroundColor: k.C.amber,
              borderRadius: 4,
              maxBarThickness: 22,
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: true, position: "bottom" },
            tooltip: {
              callbacks: {
                label: function (c) {
                  return c.dataset.label + ": " + k.money(c.parsed.y);
                },
              },
            },
          },
          scales: {
            x: Object.assign({ stacked: true }, k.AXIS_BARE),
            y: Object.assign({ stacked: true }, k.AXIS, {
              ticks: {
                padding: 8,
                callback: function (v) {
                  return "$" + k.fmt(v / 1000, 0) + "k";
                },
              },
            }),
          },
        },
      });

      /* ---------- alcance y agregaciones ---------- */
      function alcance() {
        var d = 12 - S.meses,
          R = S.rol;
        return {
          desde: d,
          fac: D.fac.filter(function (x) {
            return (
              x.mes >= d &&
              R.paises.indexOf(x.pais) >= 0 &&
              R.lineas.indexOf(x.linea) >= 0
            );
          }),
          flo: D.flo.filter(function (x) {
            return x.mes >= d && R.areas.indexOf(x.area) >= 0;
          }),
        };
      }
      function suma(a, campo) {
        var t = 0,
          i;
        for (i = 0; i < a.length; i++) t += a[i][campo];
        return t;
      }
      function grupo(a, llave, campo) {
        var m = {},
          out = [],
          i,
          key;
        for (i = 0; i < a.length; i++) {
          key = a[i][llave];
          if (!m[key]) {
            m[key] = { k: key, v: 0, n: 0 };
            out.push(m[key]);
          }
          m[key].v += a[i][campo];
          m[key].n++;
        }
        out.sort(function (p, q) {
          return q.v - p.v;
        });
        return out;
      }
      var horasTxt = function (min) {
        return k.fmt(min / 60, 0) + " h";
      };
      var ejecTxt = function (v) {
        return k.fmt(v, 0) + " runs";
      };
      var diasTxt = function (v) {
        return k.fmt(v, 0) + " days";
      };

      /* barras de apoyo: cuatro categorías y el quinto en adelante como Resto */
      function evidencia(titulo, items, f, plano) {
        evTit.textContent = titulo;
        ev.clear();
        var vis,
          i,
          max = 0,
          resto = 0;
        if (plano) {
          vis = items.slice(0);
        } else {
          vis = items.slice(0, 4);
          for (i = 4; i < items.length; i++) resto += items[i].v;
          if (items.length > 4) vis.push({ k: "Other", v: resto, r: true });
        }
        for (i = 0; i < vis.length; i++) {
          if (vis[i].v > max) max = vis[i].v;
        }
        vis.forEach(function (x, j) {
          ev.add(
            x.k,
            x.v,
            max,
            plano ? k.C.teal : x.r ? k.C.blue : k.CAT[j % 4],
            f(x.v),
          );
        });
      }

      /* predicado que el permiso del rol inyecta en la consulta */
      function permisoFac() {
        var p = [];
        if (S.rol.paises.length < PAISES.length)
          p.push("pais IN " + lista(S.rol.paises));
        if (S.rol.lineas.length < LINEAS.length)
          p.push("linea IN " + lista(S.rol.lineas));
        return p.length ? p.join(" AND ") : null;
      }
      function permisoFlo() {
        return S.rol.areas.length < AREAS.length
          ? "area IN " + lista(S.rol.areas)
          : null;
      }
      /* el plan siempre expone la consulta, el permiso y el cierre con filas leídas */
      function plan(intencion, tabla, sql, cierre, tono) {
        var P = tabla === "fac" ? permisoFac() : permisoFlo();
        return [
          ["hl", "intent: " + intencion],
          ["", sql],
          P
            ? ["wa", "permission applied before aggregation · " + P]
            : ["in", "role permission · no filtering on this table"],
          [tono || "ok", cierre],
        ];
      }
      /* la cita lleva tabla, filas leídas y el usuario bajo el que se calculó */
      function fuenteFac(A) {
        return (
          "facturacion_regional · " +
          A.fac.length +
          " of " +
          D.fac.length +
          " rows read · " +
          S.rol.t +
          " · " +
          plural(S.rol.paises.length, "country", "countries") +
          " / " +
          plural(S.rol.lineas.length, "service line", "service lines") +
          " / " +
          S.meses +
          " months"
        );
      }
      function fuenteFlo(A) {
        return (
          "bitacora_flota · " +
          A.flo.length +
          " of " +
          D.flo.length +
          " rows read · " +
          S.rol.t +
          " · " +
          plural(S.rol.areas.length, "department", "departments") +
          " / " +
          S.meses +
          " months"
        );
      }
      /* recorte por país que pidió la pregunta, no el permiso */
      function porPais(fac, ps) {
        if (!ps || !ps.length) return fac;
        return fac.filter(function (x) {
          return ps.indexOf(x.pais) >= 0;
        });
      }
      function ventana(A) {
        return "mes >= '" + MESES[A.desde] + "'";
      }
      function sqlPais(ps) {
        return ps && ps.length ? " AND pais IN " + lista(ps) : "";
      }
      function notaFlota(ps) {
        return ps && ps.length
          ? [
              "bitacora_flota has no country column: the answer is grouped by department, not country.",
            ]
          : null;
      }

      /* ---------- respuestas: cada una calcula sobre los arreglos ---------- */
      function rPais(A) {
        var g = grupo(A.fac, "pais", "monto"),
          tot = suma(A.fac, "monto"),
          lider = g[0],
          seg = g[1];
        /* una brecha de decimas no sostiene un lider: se declara el empate */
        var brecha =
          lider && seg && lider.v ? ((lider.v - seg.v) / lider.v) * 100 : 100;
        return {
          t: !lider
            ? "No billing rows are within your scope."
            : !seg
              ? lider.k +
                " is the only country within your scope: " +
                k.money(lider.v) +
                " invoiced during the window."
              : brecha < 2
                ? lider.k +
                  " and " +
                  seg.k +
                  " are effectively tied: " +
                  k.money(lider.v) +
                  " versus " +
                  k.money(seg.v) +
                  ", " +
                  k.pct(brecha, 1) +
                  " difference out of " +
                  k.money(tot) +
                  " invoiced."
                : lider.k +
                  " leads with " +
                  k.money(lider.v) +
                  " of " +
                  k.money(tot) +
                  " invoiced during the window, " +
                  k.pct(brecha, 1) +
                  " above " +
                  seg.k +
                  ".",
          filas: g.map(function (x) {
            return [
              x.k,
              k.money(x.v) + " · " + k.pct(tot ? (x.v / tot) * 100 : 0, 1),
            ];
          }),
          pie: "Sum of amounts grouped by country, using only rows allowed by the user's permissions.",
          plan: plan(
            "facturacion_por_pais",
            "fac",
            "SELECT pais, SUM(monto) FROM facturacion_regional WHERE " +
              ventana(A) +
              " GROUP BY pais ORDER BY 2 DESC",
            A.fac.length +
              " rows read · " +
              plural(g.length, "group", "groups"),
          ),
          ev: { t: "Revenue by country", items: g, f: k.money },
          src: fuenteFac(A),
          leidos: A.fac.length,
        };
      }
      function rLinea(A, ps) {
        var f = porPais(A.fac, ps),
          g = grupo(f, "linea", "monto"),
          lider = g[0];
        return {
          t: lider
            ? lider.k +
              " is the service line with the highest revenue: " +
              k.money(lider.v) +
              " in " +
              plural(lider.n, "document", "documents") +
              "."
            : "No billing rows are within your scope.",
          filas: g.map(function (x) {
            return [
              x.k,
              k.money(x.v) + " · average invoice value " + k.money(x.v / x.n),
            ];
          }),
          pie: "Average invoice value is the amount divided by the document count for that service line, not an average of averages.",
          plan: plan(
            "ranking_de_lineas",
            "fac",
            "SELECT linea, SUM(monto), COUNT(*) FROM facturacion_regional WHERE " +
              ventana(A) +
              sqlPais(ps) +
              " GROUP BY linea ORDER BY 2 DESC",
            f.length +
              " rows read · " +
              plural(g.length, "service line", "service lines"),
          ),
          ev: { t: "Revenue by service line", items: g, f: k.money },
          src: fuenteFac(A),
          leidos: f.length,
        };
      }
      function rFallas(A, ps) {
        var fall = A.flo.filter(function (x) {
          return x.estado === "Failed";
        });
        var rein = A.flo.filter(function (x) {
          return x.estado === "With retry";
        });
        var tot = suma(A.flo, "ejec"),
          ejf = suma(fall, "ejec");
        var g = grupo(fall, "area", "ejec"),
          peor = g[0];
        var filas = g.map(function (x) {
          return [x.k, ejecTxt(x.v) + " · " + plural(x.n, "batch", "batches")];
        });
        filas.push(["Batches completed with retries", k.fmt(rein.length, 0)]);
        return {
          t:
            k.fmt(ejf, 0) +
            " of " +
            k.fmt(tot, 0) +
            " executions were in failed batches (" +
            k.pct(tot ? (ejf / tot) * 100 : 0, 1) +
            ")" +
            (peor ? ". The most affected department is " + peor.k + "." : "."),
          filas: filas,
          lista: notaFlota(ps),
          pie: "A failed batch saves no minutes: it counts toward total executions but contributes zero saved time.",
          plan: plan(
            "ejecuciones_fallidas",
            "flo",
            "SELECT area, SUM(ejecuciones) FROM bitacora_flota WHERE " +
              ventana(A) +
              " AND estado = 'Failed' GROUP BY area",
            plural(fall.length, "failed batch", "failed batches") +
              " above " +
              A.flo.length +
              " rows read",
            "wa",
          ),
          ev: { t: "Failed executions by department", items: g, f: ejecTxt },
          src: fuenteFlo(A),
          leidos: A.flo.length,
        };
      }
      function rHoras(A, ps) {
        var min = suma(A.flo, "min"),
          g = grupo(A.flo, "area", "min"),
          top = g[0];
        var filas = g.map(function (x) {
          return [
            x.k,
            horasTxt(x.v) + " · " + k.pct(min ? (x.v / min) * 100 : 0, 1),
          ];
        });
        filas.push([
          "Executions within the window",
          ejecTxt(suma(A.flo, "ejec")),
        ]);
        return {
          t:
            "The fleet saved " +
            horasTxt(min) +
            " of work" +
            (top
              ? ", and " + top.k + " contributes " + horasTxt(top.v) + "."
              : "."),
          filas: filas,
          lista: notaFlota(ps),
          pie: "Minutes recorded by the fleet, not a projection: failed batches contribute zero.",
          plan: plan(
            "horas_ahorradas",
            "flo",
            "SELECT area, SUM(minutos) FROM bitacora_flota WHERE " +
              ventana(A) +
              " GROUP BY area ORDER BY 2 DESC",
            A.flo.length +
              " rows read · " +
              plural(g.length, "department", "departments"),
          ),
          ev: { t: "Hours saved by department", items: g, f: horasTxt },
          src: fuenteFlo(A),
          leidos: A.flo.length,
        };
      }
      function rCartera(A, ps) {
        var f = porPais(A.fac, ps);
        var v = f.filter(function (x) {
          return x.dias > S.dias;
        });
        var m = suma(v, "monto"),
          tot = suma(f, "monto"),
          g = grupo(v, "pais", "monto");
        var prom = v.length ? suma(v, "dias") / v.length : 0;
        var filas = g.map(function (x) {
          return [
            x.k,
            k.money(x.v) + " · " + plural(x.n, "document", "documents"),
          ];
        });
        filas.push(["Average days for that group", diasTxt(prom)]);
        return {
          t:
            k.money(m) +
            " was paid after more than " +
            S.dias +
            " payment days: " +
            k.pct(tot ? (m / tot) * 100 : 0, 1) +
            " of the amount invoiced during the window.",
          filas: filas,
          pie: "Agreed payment terms are a control parameter, not a hardcoded number: change it and the query runs again.",
          plan: plan(
            "cartera_fuera_de_plazo",
            "fac",
            "SELECT pais, SUM(monto), AVG(dias) FROM facturacion_regional WHERE " +
              ventana(A) +
              " AND dias > " +
              S.dias +
              sqlPais(ps) +
              " GROUP BY pais",
            plural(v.length, "document", "documents") +
              " beyond the payment terms · " +
              f.length +
              " rows read",
            v.length ? "wa" : "ok",
          ),
          ev: { t: "Late-paid revenue", items: g, f: k.money },
          src: fuenteFac(A),
          leidos: f.length,
        };
      }
      function rTotal(A, ps) {
        var f = porPais(A.fac, ps),
          tot = suma(f, "monto"),
          i,
          serie = [],
          sub;
        for (i = A.desde; i < 12; i++) {
          sub = f.filter(function (x) {
            return x.mes === i;
          });
          serie.push({ k: MESES[i], v: suma(sub, "monto") });
        }
        var ult = serie.length ? serie[serie.length - 1].v : 0;
        var pen = serie.length > 1 ? serie[serie.length - 2].v : 0;
        var dif = pen ? ((ult - pen) / pen) * 100 : 0;
        return {
          t:
            "Total revenue during the window: " +
            k.money(tot) +
            " across " +
            plural(f.length, "document", "documents") +
            ".",
          filas: [
            ["Monthly average", k.money(tot / Math.max(1, serie.length))],
            [
              "Last month (" +
                (serie.length ? serie[serie.length - 1].k : "—") +
                ")",
              k.money(ult),
            ],
            [
              "Change from the previous month",
              (dif >= 0 ? "+" : "") + k.pct(dif, 1),
            ],
            ["Documents read", k.fmt(f.length, 0)],
          ],
          pie: "The chart's monthly series comes from this same query with the same permission filter.",
          plan: plan(
            "facturacion_total",
            "fac",
            "SELECT mes, SUM(monto) FROM facturacion_regional WHERE " +
              ventana(A) +
              sqlPais(ps) +
              " GROUP BY mes ORDER BY 1",
            f.length +
              " rows read · " +
              plural(serie.length, "month", "months"),
          ),
          ev: {
            t: "Revenue in recent months",
            items: serie.slice(-6),
            f: k.money,
            plano: true,
          },
          src: fuenteFac(A),
          leidos: f.length,
        };
      }
      function rComparar(A, ls) {
        var tot = suma(A.fac, "monto"),
          filas = [],
          resumen = [];
        ls.forEach(function (p) {
          var f = A.fac.filter(function (x) {
            return x.pais === p;
          });
          var mnt = suma(f, "monto"),
            gl = grupo(f, "linea", "monto");
          resumen.push({ k: p, v: mnt });
          filas.push([
            p + " · revenue",
            k.money(mnt) + " · " + k.pct(tot ? (mnt / tot) * 100 : 0, 1),
          ]);
          filas.push([
            p + " · average payment days",
            f.length ? diasTxt(suma(f, "dias") / f.length) : "—",
          ]);
          filas.push([p + " · main service line", gl.length ? gl[0].k : "—"]);
        });
        var t;
        if (ls.length > 1) {
          var a = resumen[0],
            b = resumen[1];
          var alto = a.v >= b.v ? a : b,
            bajo = a.v >= b.v ? b : a;
          t =
            alto.k +
            " invoices " +
            k.pct(bajo.v ? ((alto.v - bajo.v) / bajo.v) * 100 : 0, 1) +
            " more than " +
            bajo.k +
            " during the selected window.";
        } else {
          t =
            resumen[0].k +
            " invoiced " +
            k.money(resumen[0].v) +
            ", representing " +
            k.pct(tot ? (resumen[0].v / tot) * 100 : 0, 1) +
            " of the data visible to this user.";
        }
        return {
          t: t,
          filas: filas,
          pie: "Comparison uses the same cutoff: the same month window and permissions for both.",
          plan: plan(
            "comparar_paises · " + ls.join(" vs "),
            "fac",
            "SELECT pais, SUM(monto), AVG(dias) FROM facturacion_regional WHERE " +
              ventana(A) +
              " AND pais IN " +
              lista(ls) +
              " GROUP BY pais",
            A.fac.length + " rows read within scope",
          ),
          ev: { t: "Country comparison", items: resumen, f: k.money },
          src: fuenteFac(A),
          leidos: A.fac.length,
        };
      }
      function rDenegado(fuera) {
        return {
          t:
            "I cannot show that: " +
            fuera.join(" and ") +
            " is outside this user's scope.",
          filas: [
            ["Countries enabled for your role", S.rol.paises.join(" · ")],
          ],
          lista: [
            "Permissions are applied before aggregation, so those rows never enter the calculation.",
          ],
          pie: "Blocking at the end is worse: the total would already include the figure that should not be visible.",
          plan: [
            ["er", "permission denied · " + fuera.join(", ")],
            ["", "role filter: pais IN " + lista(S.rol.paises)],
            ["wa", "0 rows read · no query executed"],
          ],
          ev: null,
          src: "query blocked by permissions · 0 rows read · " + S.rol.t,
          leidos: 0,
          fuera: true,
        };
      }
      function rSinCobertura() {
        return {
          t: "I cannot answer that with the connected data, and I will not estimate it.",
          lista: [
            "Revenue by country and total revenue with its monthly trend",
            "Service-line ranking and average invoice value by line",
            "Comparison between two countries",
            "Revenue paid beyond the agreed terms",
            "Failed executions and the most affected department",
            "Hours saved by the fleet and the top-contributing department",
          ],
          pie: "Payroll, inventory and agreements are not connected to this agent. Connecting another table expands its answers; better wording does not.",
          plan: [
            [
              "wa",
              "not covered: the question does not match any registered query",
            ],
            ["", "connected tables: facturacion_regional, bitacora_flota"],
            ["wa", "0 rows read · no query executed"],
          ],
          ev: null,
          src: "no query executed · 0 rows read · " + S.rol.t,
          leidos: 0,
          fuera: true,
        };
      }

      /* ---------- enrutado de la pregunta ---------- */
      function resolver(texto) {
        var q = norm(texto),
          A = alcance(),
          ps = paisesEn(q);
        var fuera = ps.filter(function (p) {
          return S.rol.paises.indexOf(p) < 0;
        });
        if (fuera.length) return rDenegado(fuera);

        if (tiene(q, ["fall", "error", "reintent", "did not run"]))
          return rFallas(A, ps);
        if (tiene(q, ["horas", "ahorr", "minuto", "libera"]))
          return rHoras(A, ps);
        if (
          tiene(q, ["cartera", "mora", "vencid", "cobr", "paga", "plazo", "45"])
        )
          return rCartera(A, ps);
        if (
          ps.length > 1 ||
          (ps.length && tiene(q, ["compar", "versus", "versus", "vs "]))
        )
          return rComparar(A, ps.slice(0, 2));

        var fact = tiene(q, ["factur", "venta", "vendi", "ingres", "monto"]);
        if (tiene(q, ["linea", "producto"])) return rLinea(A, ps);
        if (ps.length === 1) return rComparar(A, ps);
        if (tiene(q, ["pais", "region", "geograf"])) return rPais(A);
        if (fact) return rTotal(A, ps);
        return rSinCobertura();
      }

      /* ---------- pintado ---------- */
      function burbuja(a) {
        var m = k.el("div", "msg a");
        var t = k.txt("div", null, a.t);
        t.style.color = k.C.ink;
        m.appendChild(t);
        (a.filas || []).forEach(function (f) {
          var row = k.el("div");
          row.style.cssText =
            "display:flex;justify-content:space-between;gap:16px;margin-top:6px;font-size:13px";
          row.appendChild(k.txt("span", null, f[0]));
          var v = k.txt("span", "mono", f[1]);
          v.style.color = a.fuera ? k.C.amber : k.C.teal;
          row.appendChild(v);
          m.appendChild(row);
        });
        (a.lista || []).forEach(function (s) {
          var d = k.txt("div", null, "— " + s);
          d.style.cssText = "margin-top:5px;font-size:13px;color:" + k.C.body;
          m.appendChild(d);
        });
        m.appendChild(k.txt("span", "src", a.src));
        return m;
      }
      function aplicar(a, recalculo) {
        (a.plan || []).forEach(function (p) {
          log.push(p[0], p[1]);
        });
        if (a.ev) evidencia(a.ev.t, a.ev.items, a.ev.f, a.ev.plano);
        else {
          evTit.textContent = "Evidence for the latest answer";
          ev.clear();
        }
        evPie.textContent = a.pie || "";
        S.leidos += a.leidos;
        if (!recalculo) {
          S.hechas++;
          if (a.fuera) S.sinCifra++;
        } else if (a.fuera)
          log.push("wa", "the latest answer has no figure for this user");
        kp.set(0, k.fmt(S.hechas, 0));
        kp.set(2, k.fmt(S.leidos, 0), "up");
        kp.set(3, k.fmt(S.sinCifra, 0), S.sinCifra ? "warn" : "");
      }
      function pinta() {
        var A = alcance(),
          i,
          labels = [],
          dentro = [],
          afuera = [],
          sub;
        conteo[0].textContent =
          A.fac.length + " of " + D.fac.length + " rows within scope";
        conteo[1].textContent =
          A.flo.length + " of " + D.flo.length + " rows within scope";
        recorte[0].textContent = permisoFac()
          ? "permission filtering · " + permisoFac()
          : "no permission filtering";
        recorte[1].textContent = permisoFlo()
          ? "permission filtering · " + permisoFlo()
          : "no permission filtering";
        kp.set(
          1,
          k.fmt(A.fac.length + A.flo.length, 0) +
            " of " +
            k.fmt(D.fac.length + D.flo.length, 0),
        );
        for (i = A.desde; i < 12; i++) {
          sub = A.fac.filter(function (x) {
            return x.mes === i;
          });
          labels.push(MESES[i]);
          dentro.push(
            suma(
              sub.filter(function (x) {
                return x.dias <= S.dias;
              }),
              "monto",
            ),
          );
          afuera.push(
            suma(
              sub.filter(function (x) {
                return x.dias > S.dias;
              }),
              "monto",
            ),
          );
        }
        if (ch) {
          ch.data.labels = labels;
          ch.data.datasets[0].label = "Payment within " + S.dias + " days";
          ch.data.datasets[0].data = dentro;
          ch.data.datasets[1].label = "Payment beyond " + S.dias + " days";
          ch.data.datasets[1].data = afuera;
          ch.update();
        }
        cb.cap(
          S.rol.t +
            " · " +
            plural(labels.length, "month", "months") +
            " · " +
            plural(A.fac.length, "visible document", "visible documents") +
            " · payment terms " +
            S.dias +
            " days",
        );
      }

      async function preguntar(texto) {
        texto = String(texto == null ? "" : texto).trim();
        if (!texto || S.corriendo) return;
        S.corriendo = true;
        btn.disabled = true;
        input.value = "";
        chat.appendChild(k.txt("div", "msg u", texto));
        var esperando = k.txt("div", "msg a", "Querying the source…");
        chat.appendChild(esperando);
        chat.scrollTop = chat.scrollHeight;
        log.push(
          "in",
          "question received · " +
            plural(texto.length, "character", "characters"),
        );
        /* jitter cosmético sobre una latencia simulada */
        await k.wait(420 + Math.round(Math.random() * 180));
        if (esperando.parentNode === chat) chat.removeChild(esperando);
        var a = resolver(texto),
          nodo = burbuja(a);
        chat.appendChild(nodo);
        chat.scrollTop = chat.scrollHeight;
        aplicar(a, false);
        S.ultima = texto;
        S.nodo = nodo;
        S.corriendo = false;
        btn.disabled = false;
      }

      btn.addEventListener("click", function () {
        preguntar(input.value);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          preguntar(input.value);
        }
      });

      /* cambiar usuario, ventana o plazo recalcula la última respuesta en vivo */
      ctl.on(function (get) {
        var sel = ROLES.filter(function (x) {
          return x.v === get("rol");
        });
        S.rol = sel.length ? sel[0] : ROLES[0];
        S.meses = +get("per");
        S.dias = +get("dias");
        pinta();
        log.push(
          "hl",
          "scope recalculated · " +
            S.rol.t +
            " · " +
            S.meses +
            " months · payment terms " +
            S.dias +
            " days",
        );
        if (!S.ultima) return;
        var a = resolver(S.ultima),
          nodo = burbuja(a);
        if (S.nodo && S.nodo.parentNode === chat)
          chat.replaceChild(nodo, S.nodo);
        else chat.appendChild(nodo);
        S.nodo = nodo;
        aplicar(a, true);
        chat.scrollTop = chat.scrollHeight;
      });

      /* estado de trabajo: presentación del agente y una pregunta ya resuelta */
      var hola = k.el("div", "msg a");
      hola.appendChild(
        k.txt(
          "div",
          null,
          "I am connected to two warehouse tables: regional billing with " +
            D.fac.length +
            " records and the fleet log with " +
            D.flo.length +
            ". I calculate answers from them and identify where each figure came from.",
        ),
      );
      hola.appendChild(
        k.txt("span", "src", "2 connected tables · no query executed yet"),
      );
      chat.appendChild(hola);

      pinta();
      log.push("in", "session opened · user: " + S.rol.t);
      chat.appendChild(k.txt("div", "msg u", SUG[0]));
      var inicial = resolver(SUG[0]);
      S.nodo = burbuja(inicial);
      chat.appendChild(S.nodo);
      aplicar(inicial, false);
      S.ultima = SUG[0];
    },
  });
})();
