/* ============================================================
   ORÁCULO — pronóstico de demanda con intervalo y compuerta
   Ajusta con 30 meses, mide el error contra 6 meses que el modelo
   nunca vio y solo escribe en el tablero si ese error queda bajo el
   umbral. Lo que sale es un rango, nunca un número solo.
   Serie sintética con semilla fija: todos ven los mismos números.
   ============================================================ */
(function () {
  "use strict";
  var LAB = window.LAB;
  var C = LAB.C;

  var MES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var NHIST = 36; /* meses de historia disponible */
  var NTR = 30; /* meses con los que se ajusta */
  var NVA = 6; /* meses reservados para validar */
  var UMBRAL = 12; /* error máximo aceptado para publicar, en % */
  var VIS = 24; /* meses de historia visibles en la gráfica */

  function etiqueta(t) {
    return MES[t % 12] + " " + (23 + Math.floor(t / 12));
  }

  /* Historia sintética: tendencia lineal, estacionalidad anual con
       pico de fin de año y ruido acotado. Semilla fija. */
  function datos() {
    var r = LAB.kit.rng(11207),
      est = [
        0.82, 0.8, 0.95, 1.01, 1.05, 0.99, 0.92, 0.96, 1.06, 1.13, 1.24, 1.45,
      ];
    var y = [],
      t;
    for (t = 0; t < NHIST; t++)
      y.push(
        Math.round((1180 + 11.5 * t) * est[t % 12] * (1 + (r() - 0.5) * 0.062)),
      );
    return y;
  }

  /* ---------- modelos ---------- */

  /* Mínimos cuadrados de y contra el índice de mes. */
  function ols(y, n) {
    var sx = 0,
      sy = 0,
      sxx = 0,
      sxy = 0,
      i;
    for (i = 0; i < n; i++) {
      sx += i;
      sy += y[i];
      sxx += i * i;
      sxy += i * y[i];
    }
    var b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    return { a: (sy - b * sx) / n, b: b };
  }

  /* Ajusta con los primeros n meses y deja el ajuste en muestra. */
  function ajustar(tipo, y, n) {
    var i,
      m,
      aj = [];
    if (tipo === "seas") {
      /* Descomposición multiplicativa: tendencia por mínimos cuadrados e
               índice estacional como razón media contra esa tendencia. */
      var lr = ols(y, n),
        sum = [],
        cnt = [],
        idx = [],
        med = 0,
        tr;
      for (m = 0; m < 12; m++) {
        sum.push(0);
        cnt.push(0);
        idx.push(1);
      }
      for (i = 0; i < n; i++) {
        tr = lr.a + lr.b * i;
        if (tr > 0) {
          m = i % 12;
          sum[m] += y[i] / tr;
          cnt[m] += 1;
        }
      }
      for (m = 0; m < 12; m++) {
        idx[m] = cnt[m] ? sum[m] / cnt[m] : 1;
        med += idx[m];
      }
      med /= 12;
      for (m = 0; m < 12; m++) idx[m] /= med;
      for (i = 0; i < n; i++) aj.push((lr.a + lr.b * i) * idx[i % 12]);
      return { tipo: tipo, n: n, a: lr.a, b: lr.b, idx: idx, aj: aj };
    }
    if (tipo === "holt") {
      /* Suavizado exponencial con nivel y pendiente. No modela
               estacionalidad: eso lo destapa la validación. */
      var al = 0.42,
        be = 0.16,
        niv = y[0],
        ten = y[1] - y[0],
        f,
        nn;
      aj.push(null);
      for (i = 1; i < n; i++) {
        f = niv + ten;
        aj.push(f);
        nn = al * y[i] + (1 - al) * f;
        ten = be * (nn - niv) + (1 - be) * ten;
        niv = nn;
      }
      return { tipo: tipo, n: n, niv: niv, ten: ten, aj: aj };
    }
    /* Media móvil de 3: sin tendencia ni estacionalidad, la línea base. */
    for (i = 0; i < n; i++)
      aj.push(i < 3 ? null : (y[i - 1] + y[i - 2] + y[i - 3]) / 3);
    return { tipo: "ma3", n: n, y: y.slice(0, n), aj: aj };
  }

  /* Valor pronosticado h pasos después del último mes de ajuste. */
  function adelante(mo, h) {
    if (mo.tipo === "seas") {
      var t = mo.n - 1 + h;
      return (mo.a + mo.b * t) * mo.idx[t % 12];
    }
    if (mo.tipo === "holt") return mo.niv + h * mo.ten;
    var w = mo.y.slice(mo.n - 3),
      v = 0,
      i;
    for (i = 1; i <= h; i++) {
      v = (w[0] + w[1] + w[2]) / 3;
      w.shift();
      w.push(v);
    } /* la media se aplana sola */
    return v;
  }

  /* Cuantil normal, aproximación de Abramowitz y Stegun 26.2.23, error
       menor a 4.5e-4. La confianza va de 80 a 99, así que la cola siempre
       queda bajo 0.5 y no hace falta reflejar el signo. */
  function zDe(conf) {
    var t = Math.sqrt(-2 * Math.log((1 - conf / 100) / 2));
    return (
      t -
      (2.515517 + 0.802853 * t + 0.010328 * t * t) /
        (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)
    );
  }

  var NOMBRE = {
    seas: "Trend + seasonality",
    holt: "Exponential smoothing",
    ma3: "3-period moving average",
  };
  var FACTOR = { base: 1, opt: 1.08, con: 0.92 };
  var ESCENARIO = {
    base: "Baseline",
    opt: "Optimistic +8%",
    con: "Conservative -8%",
  };
  var BANDA = {
    ok: "rgba(56,189,248,.34)",
    okBg: "rgba(56,189,248,.12)",
    mal: "rgba(244,114,182,.34)",
    malBg: "rgba(244,114,182,.10)",
  };

  LAB.register({
    id: "oraculo",
    name: "ORÁCULO",
    family: "datos",
    tagline: "Forecast with intervals",
    title: "Demand forecast with intervals and out-of-sample validation",
    intro:
      "Fits on 30 months, evaluates against the 6 held-out months and publishes only if the error is below the threshold. " +
      "Change the horizon, model, confidence and scenario: the interval and publication gate respond instantly.",
    spec: {
      trigger:
        "Month-end close, or a request from the planning department before committing inventory or budget.",
      systems:
        "Python with pandas and statsmodels over the data warehouse; the approved result is written to the table used by the BI dashboard.",
      output:
        "A monthly forecast with lower bound, central estimate and upper bound, plus validation error and the applied scenario.",
      failure:
        "If out-of-sample error exceeds the threshold, the gate blocks publication: the dashboard keeps the previous run and the department receives a diagnosis rather than a misleading number.",
    },
    impact: [
      ["30 / 6", "months for fitting and out-of-sample validation"],
      ["12%", "maximum error allowed before the forecast is held"],
      ["3 figures", "each month includes lower, central and upper values"],
    ],

    render: function (host, k) {
      var y = datos();
      function opciones(d) {
        return Object.keys(d).map(function (v) {
          return { v: v, t: d[v] };
        });
      }

      var ctl = k.controls([
        {
          k: "hor",
          t: "range",
          label: "Horizon",
          min: 1,
          max: 12,
          step: 1,
          value: 6,
          suffix: "months",
        },
        {
          k: "mod",
          t: "select",
          label: "Model",
          value: "seas",
          options: opciones(NOMBRE),
        },
        {
          k: "conf",
          t: "range",
          label: "Confidence",
          min: 80,
          max: 99,
          step: 1,
          value: 95,
          suffix: "%",
        },
        {
          k: "esc",
          t: "select",
          label: "Scenario",
          value: "base",
          options: opciones(ESCENARIO),
        },
        { k: "run", t: "button", label: "Revalidate", primary: true },
      ]);
      host.appendChild(ctl.node);

      var kpi = k.kpis([
        ["Cumulative forecast", "—"],
        ["Out-of-sample error", "—"],
        ["Model bias", "—"],
        ["Interval width at the horizon", "—"],
        ["Gate", "—"],
      ]);
      host.appendChild(kpi.node);
      var etqKpi = k.$$(
        ".kpi .k",
        kpi.node,
      ); /* etiquetas que cambian con el horizonte */

      /* La decisión de publicar, escrita y arriba de todo. */
      var gate = k.panel();
      gate.appendChild(k.txt("div", "mono-head", "Publication gate"));
      var gRow = k.el("div");
      gRow.style.cssText =
        "display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-top:8px";
      var gPill = k.el("span"),
        gTxt = k.txt("span", null, "");
      gTxt.style.color = C.body;
      gRow.appendChild(gPill);
      gRow.appendChild(gTxt);
      gate.appendChild(gRow);
      host.appendChild(gate);

      var cbP = k.chartbox("Recent history, fit and forecast", "");
      var cbV = k.chartbox("Out-of-sample validation", "");
      var fila1 = k.el("div", "grid2 wide-left");
      fila1.appendChild(cbP.node);
      fila1.appendChild(cbV.node);
      host.appendChild(fila1);

      /* Panel con encabezado monoespaciado y un cuerpo colgado. */
      function bloque(titulo, cuerpo, margen) {
        var p = k.panel(),
          h = k.txt("div", "mono-head", titulo);
        cuerpo.style.marginTop = margen;
        p.appendChild(h);
        p.appendChild(cuerpo);
        return { node: p, head: h };
      }
      var pasos = k.steps([
        "Available monthly history",
        "Validation holdout, excluded from fitting",
        "Model fitting",
        "Error against the held-out months",
        "Refitting on the complete history",
        "Writing to the dashboard table",
      ]);
      var ins = k.insights(),
        tablaHost = k.el("div");
      var fila2 = k.el("div", "grid2 wide-left");
      fila2.appendChild(
        bloque("How to read the forecast", ins.node, "6px").node,
      );
      fila2.appendChild(
        bloque("How it is validated before publication", pasos.node, "6px")
          .node,
      );
      host.appendChild(fila2);
      /* la tabla va a lo ancho: doce meses por seis columnas no caben
               en media rejilla sin desbordarse */
      var bTab = bloque("Monthly forecast", tablaHost, "12px");
      host.appendChild(bTab.node);

      /* ---------- gráficas: se crean una vez y se actualizan ---------- */
      var ejeY = Object.assign({}, k.AXIS, {
        ticks: {
          padding: 8,
          callback: function (v) {
            return k.fmt(v, 0);
          },
        },
      });
      function linea(label, color, ancho, dash, relleno, fondo) {
        return {
          label: label,
          data: [],
          borderColor: color,
          borderWidth: ancho,
          borderDash: dash || [],
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: relleno || false,
          backgroundColor: fondo || "transparent",
        };
      }
      function etqPunto(c) {
        return (
          c.dataset.label +
          ": " +
          (c.parsed.y == null ? "—" : k.fmt(c.parsed.y, 0))
        );
      }
      /* Punteado significa proyección, nunca decoración: solo el pronóstico
               y su banda van punteados. Las dos series de la banda van al final
               porque Chart.js dibuja del último índice al primero, así el relleno
               queda debajo de todo. */
      var chP = k.chart(cbP.canvas, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            linea("Observed history", C.teal, 2.2),
            linea("In-sample fit", C.violet, 1.3),
            linea("Forecast", C.cyan, 2.2, [6, 4]),
            linea("Confidence band", BANDA.ok, 1, [3, 3], "+1", BANDA.okBg),
            linea("Lower band", BANDA.ok, 1, [3, 3]),
          ],
        },
        options: {
          /* Sin interpolación: estas gráficas se repintan en cada evento
                       de los controles. Un tween de 700 ms dejaría la curva atrás
                       del deslizador y, si el repintado entra con la animación en
                       vuelo, el animador de Chart.js tiquea sobre series que ya
                       cambiaron de largo y revienta fuera de todo try/catch. */
          animation: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                filter: function (it) {
                  return it.text !== "Lower band";
                },
              },
            },
            tooltip: { callbacks: { label: etqPunto } },
          },
          scales: {
            x: Object.assign({}, k.AXIS_BARE, {
              ticks: { padding: 8, maxTicksLimit: 9 },
            }),
            y: ejeY,
          },
        },
      });
      var errVal =
        []; /* error por mes de validación, para el pie del tooltip */
      var chV = k.chart(cbV.canvas, {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              label: "Observed",
              data: [],
              backgroundColor: C.teal,
              borderRadius: 4,
              maxBarThickness: 16,
            },
            {
              label: "Forecast",
              data: [],
              backgroundColor: C.violet,
              borderRadius: 4,
              maxBarThickness: 16,
            },
          ],
        },
        options: {
          animation: false /* misma razón que la gráfica de arriba */,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: etqPunto,
                footer: function (it) {
                  var e = errVal[it[0].dataIndex];
                  return e == null
                    ? ""
                    : "Monthly error: " +
                        (e >= 0 ? "+" : "-") +
                        k.pct(Math.abs(e), 1);
                },
              },
            },
          },
          scales: {
            x: Object.assign({}, k.AXIS_BARE),
            y: Object.assign({}, ejeY, { beginAtZero: true }),
          },
        },
      });

      /* ---------- cálculo ---------- */
      function calcular() {
        var H = ctl.get("hor"),
          tipo = ctl.get("mod"),
          conf = ctl.get("conf"),
          esc = ctl.get("esc");
        var f = FACTOR[esc],
          z = zDe(conf),
          h,
          i,
          p,
          a,
          e,
          c,
          w,
          pin;

        /* 1. ajuste solo con los primeros 30 meses */
        var mVal = ajustar(tipo, y, NTR),
          pv = [],
          err = [],
          mape = 0,
          mpe = 0;
        for (h = 1; h <= NVA; h++) {
          p = adelante(mVal, h);
          a = y[NTR + h - 1];
          e = (p - a) / a;
          pv.push(p);
          err.push(e * 100);
          mape += Math.abs(e);
          mpe += e;
        }
        mape = (mape / NVA) * 100;
        mpe = (mpe / NVA) * 100;

        /* 2. el error medio absoluto se lleva a desviación (x1.2533) y
                      se abre con la raíz de los pasos adelante */
        var sigma = (mape / 100) * 1.2533,
          mFull = ajustar(tipo, y, NHIST);
        var fil = [],
          total = 0,
          pico = 0;
        for (h = 1; h <= H; h++) {
          c = adelante(mFull, h) * f;
          w = z * sigma * Math.sqrt(h);
          fil.push({
            mes: etiqueta(NHIST - 1 + h),
            c: c,
            lo: Math.max(0, c * (1 - w)),
            hi: c * (1 + w),
            w: w * 100,
          });
          total += c;
          if (c > fil[pico].c) pico = h - 1;
        }

        /* 3. series de la gráfica: la banda nace pinchada en el último
                      dato observado y se abre hacia adelante */
        var labels = [],
          hist = [],
          aju = [],
          cen = [],
          hi = [],
          lo = [];
        for (i = NHIST - VIS; i < NHIST; i++) {
          labels.push(etiqueta(i));
          hist.push(y[i]);
          aju.push(mFull.aj[i]);
          pin = i === NHIST - 1 ? y[i] : null;
          cen.push(pin);
          hi.push(pin);
          lo.push(pin);
        }
        for (h = 0; h < H; h++) {
          labels.push(fil[h].mes);
          hist.push(null);
          aju.push(null);
          cen.push(fil[h].c);
          hi.push(fil[h].hi);
          lo.push(fil[h].lo);
        }

        return {
          H: H,
          tipo: tipo,
          conf: conf,
          esc: esc,
          z: z,
          mape: mape,
          mpe: mpe,
          pv: pv,
          err: err,
          fil: fil,
          total: total,
          pico: fil[pico],
          apto: mape <= UMBRAL,
          anchoUno: fil[0].w,
          anchoFin: fil[H - 1].w,
          labels: labels,
          hist: hist,
          aju: aju,
          cen: cen,
          hi: hi,
          lo: lo,
        };
      }

      /* ---------- pintado ---------- */
      function marcas(R) {
        return [
          ["done", NHIST + " months"],
          ["done", "last " + NVA],
          ["done", NTR + " months"],
          [R.apto ? "done" : "fail", k.pct(R.mape, 1)],
          [R.apto ? "done" : "", R.apto ? NHIST + " months" : "stopped"],
          [R.apto ? "done" : "fail", R.apto ? "written" : "held"],
        ];
      }
      function estados(R) {
        var m = marcas(R),
          i;
        for (i = 0; i < m.length; i++) pasos.set(i, m[i][0], m[i][1]);
      }
      /* Cada ancho lleva palabra además de color. */
      function tramo(w) {
        if (w <= 12) return ["ok", "narrow"];
        if (w <= 25) return ["warn", "wide"];
        return ["bad", "not usable"];
      }

      function pintar(R) {
        var meses = R.H + (R.H === 1 ? " month" : " months"),
          tFin = tramo(R.anchoFin);
        /* el acumulado y el ancho cambian de significado con el horizonte:
                   la etiqueta lo dice, no solo la posición del control */
        if (etqKpi[0]) etqKpi[0].textContent = "Cumulative forecast · " + meses;
        if (etqKpi[3])
          etqKpi[3].textContent = "Interval width · " + R.fil[R.H - 1].mes;
        kpi.set(0, k.fmt(R.total, 0) + " u", R.apto ? "" : "bad");
        kpi.set(
          1,
          k.pct(R.mape, 1),
          R.mape <= 8 ? "up" : R.apto ? "warn" : "bad",
        );
        kpi.set(
          2,
          (R.mpe >= 0 ? "+" : "-") + k.pct(Math.abs(R.mpe), 1),
          Math.abs(R.mpe) <= 2 ? "up" : Math.abs(R.mpe) <= 5 ? "" : "warn",
        );
        kpi.set(
          3,
          "±" + k.pct(R.anchoFin, 1),
          tFin[0] === "ok" ? "" : tFin[0] === "warn" ? "warn" : "bad",
        );
        kpi.set(4, R.apto ? "Published" : "Held", R.apto ? "up" : "bad");

        gPill.innerHTML = k.pill(
          R.apto ? "ok" : "bad",
          R.apto ? "PUBLISHED" : "HELD",
        );
        gTxt.textContent = R.apto
          ? "Error of " +
            k.pct(R.mape, 1) +
            " against the threshold of " +
            UMBRAL +
            "%. The " +
            R.H +
            " rows are written to the dashboard table, with the model error in the same row."
          : "Error of " +
            k.pct(R.mape, 1) +
            ", above the threshold of " +
            UMBRAL +
            "%. Nothing is written: the dashboard " +
            "keeps the previous run and the department receives a diagnosis. The numbers below are for diagnosis, not purchasing decisions.";

        if (chP) {
          chP.data.labels = R.labels;
          [R.hist, R.aju, R.cen, R.hi, R.lo].forEach(function (d, i) {
            chP.data.datasets[i].data = d;
          });
          /* el pronóstico retenido cambia de nombre y de color: la leyenda
                       lo dice con palabras, el color solo acompaña */
          chP.data.datasets[2].label = R.apto ? "Forecast" : "Forecast held";
          chP.data.datasets[2].borderColor = R.apto ? C.cyan : C.rose;
          chP.data.datasets[3].borderColor = chP.data.datasets[4].borderColor =
            R.apto ? BANDA.ok : BANDA.mal;
          chP.data.datasets[3].backgroundColor = R.apto
            ? BANDA.okBg
            : BANDA.malBg;
          chP.update();
        }
        if (chV) {
          var lv = [],
            j;
          for (j = 0; j < NVA; j++) lv.push(etiqueta(NTR + j));
          errVal = R.err;
          chV.data.labels = lv;
          chV.data.datasets[0].data = y.slice(NTR, NHIST);
          chV.data.datasets[1].data = R.pv;
          chV.update();
        }
        cbP.cap(
          NOMBRE[R.tipo] +
            " · confidence band at " +
            R.conf +
            "% · scenario " +
            ESCENARIO[R.esc] +
            " · history through " +
            etiqueta(NHIST - 1) +
            ", dashed lines show the projection",
        );
        cbV.cap(
          "Fitted on " +
            NTR +
            " months and evaluated against " +
            NVA +
            " held-out months. Average error " +
            k.pct(R.mape, 1) +
            " against a threshold of " +
            UMBRAL +
            "%.",
        );
        bTab.head.textContent = R.apto
          ? "Monthly forecast, written to the dashboard"
          : "Monthly forecast, held: not written to the dashboard";

        var filas = R.fil.map(function (d) {
          var t = tramo(d.w);
          return [
            d.mes,
            k.fmt(d.lo, 0),
            k.fmt(d.c, 0),
            k.fmt(d.hi, 0),
            "±" + k.pct(d.w, 1),
            { html: k.pill(t[0], t[1]) },
          ];
        });
        var tb = k.table(
          [
            { t: "Month" },
            { t: "Lower bound", r: true },
            { t: "Forecast", r: true },
            { t: "Upper bound", r: true },
            { t: "Width", r: true },
            { t: "Reading the range", r: true },
          ],
          filas,
        );
        tablaHost.innerHTML = "";
        tablaHost.appendChild(tb.node);

        /* lectura escrita */
        ins.clear();
        if (!R.apto) {
          ins.add(
            "rose",
            "!",
            "With <b>" +
              NOMBRE[R.tipo].toLowerCase() +
              "</b>, the out-of-sample error is <b>" +
              k.pct(R.mape, 1) +
              "</b>, above the threshold of " +
              UMBRAL +
              "%. The model does not capture the year-end peak, " +
              "and that is visible in the validation chart before the number reaches anyone.",
          );
        } else {
          ins.add(
            "green",
            "✓",
            "The model's average error was <b>" +
              k.pct(R.mape, 1) +
              "</b> across " +
              NVA +
              " months it never saw. Below the threshold of " +
              UMBRAL +
              "%: it is published, with the error visible.",
          );
        }
        if (R.H > 1) {
          ins.add(
            "cyan",
            "≈",
            "Uncertainty increases with distance: <b>±" +
              k.pct(R.anchoUno, 1) +
              "</b> in " +
              R.fil[0].mes +
              " and <b>±" +
              k.pct(R.anchoFin, 1) +
              "</b> in " +
              R.fil[R.H - 1].mes +
              ". The width comes from the validation error converted to a deviation, multiplied by z = " +
              k.fmt(R.z, 2) +
              " for the confidence level and by the square root of the steps ahead.",
          );
        } else {
          ins.add(
            "cyan",
            "≈",
            "One month ahead, the interval is <b>±" +
              k.pct(R.anchoUno, 1) +
              "</b>. Increase the horizon to see it widen: it grows with the square root of the steps ahead, not all at once.",
          );
        }
        ins.add(
          "violet",
          "↑",
          "Highest projected demand in <b>" +
            R.pico.mes +
            "</b>: " +
            k.fmt(R.pico.c, 0) +
            " units, between " +
            k.fmt(R.pico.lo, 0) +
            " and " +
            k.fmt(R.pico.hi, 0) +
            ". Purchasing is planned around the range, not the point estimate.",
        );
        if (Math.abs(R.mpe) >= 3) {
          ins.add(
            "amber",
            "%",
            "The error is not centered: the model " +
              (R.mpe > 0 ? "overestimated" : "underestimated") +
              " <b>" +
              k.pct(Math.abs(R.mpe), 1) +
              "</b> on average during validation. This kind of bias should be corrected before using the number for purchasing.",
          );
        }
        if (R.esc !== "base") {
          ins.add(
            "teal",
            "=",
            "The scenario " +
              ESCENARIO[R.esc] +
              " shifts the central estimate and band together. It does not change the model error " +
              ": it is a business assumption applied to the forecast, and is reported as such.",
          );
        }
      }

      /* ---------- ejecución animada de la validación ---------- */
      var corriendo = false;
      async function correr() {
        if (corriendo) return;
        corriendo = true;
        ctl.busy("run", true);
        var R = calcular(),
          m = marcas(R),
          i;
        pasos.reset();
        for (i = 0; i < pasos.count; i++) {
          pasos.set(i, "run", "…");
          await k.wait(240);
          pasos.set(i, m[i][0], m[i][1]);
          /* el error fuera de muestra corta la secuencia: lo que sigue
                       se marca detenido sin seguir esperando */
          if (!R.apto && i === 3) {
            pasos.set(4, m[4][0], m[4][1]);
            pasos.set(5, m[5][0], m[5][1]);
            break;
          }
        }
        corriendo = false;
        ctl.busy("run", false);
        /* el visitante pudo mover un control durante la animación: se
                   repinta con el estado actual, no con el del arranque */
        var F = calcular();
        estados(F);
        pintar(F);
      }

      ctl.on(function () {
        var R = calcular();
        if (!corriendo) estados(R); /* no pisar la secuencia en vuelo */
        pintar(R);
      });
      ctl.onClick("run", correr);

      var inicial = calcular();
      estados(inicial);
      pintar(inicial);
    },
  });
})();
