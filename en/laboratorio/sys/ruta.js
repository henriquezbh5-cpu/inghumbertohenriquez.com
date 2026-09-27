(function () {
  "use strict";
  var LAB = window.LAB;
  var NS = "http://www.w3.org/2000/svg";
  var C = LAB.C;

  /* ---------- geometría del mapa y calibración del modelo ---------- */
  var W = 640,
    H = 340;
  var DEP = { x: 56, y: 292 }; /* centro de distribución */
  var Z = { x: 342, y: 166, w: 236, h: 142 }; /* zona sin cobertura */
  var KM_PX = 0.046; /* píxel del mapa a kilómetro de calle */
  var VEL = 28; /* km/h promedio con tráfico urbano */
  var INICIO = 8 * 60; /* la jornada arranca a las 08:00 */
  var TOL = 30; /* minutos que el técnico espera si llega antes */
  var TURNO = 9 * 60; /* jornada máxima de una unidad */
  var EN_ZONA = { 2: 1, 5: 1, 9: 1 }; /* paradas que caen dentro de la zona */
  var CERRADO = 3; /* cliente que hoy no recibe */
  var RANK = { Alta: 0, Media: 1, Baja: 2 };
  var NOM = {
    corta: "Shortest route",
    prioridad: "Customer priority",
    ventana: "Time window",
  };
  var CRITS = ["corta", "prioridad", "ventana"];

  var CLIENTES = [
    "Ferretería El Amate",
    "Farmacia San Jacinto",
    "Abarrotería La Cumbre",
    "Clínica Los Almendros",
    "Panadería Doña Tere",
    "Repuestos El Volcán",
    "Librería El Portal",
    "Taller Mecánico Rivas",
    "Supermercado La Ceiba",
    "Distribuidora El Trébol",
    "Cafetería Buena Vista",
    "Óptica Villa Nueva",
    "Veterinaria San Marcos",
    "Bodega El Pital",
  ];

  /* estados del marcador en el mapa: trazo, relleno, color y texto siempre juntos */
  var MST = {
    pend: {
      s: "rgba(148,180,220,.42)",
      f: "#0B1524",
      c: C.label,
      t: "pending",
    },
    fuera: {
      s: "rgba(251,191,36,.55)",
      f: "#0B1524",
      c: C.amber,
      t: "outside time window",
    },
    ruta: { s: C.amber, f: "rgba(251,191,36,.14)", c: C.amber, t: "en route" },
    ok: { s: C.green, f: "rgba(52,211,153,.16)", c: C.green, t: "delivered" },
    cola: {
      s: C.green,
      f: "rgba(52,211,153,.16)",
      c: C.amber,
      t: "delivered · queued",
    },
    repr: {
      s: C.rose,
      f: "rgba(244,114,182,.16)",
      c: C.rose,
      t: "rescheduled",
    },
  };

  function dist(a, b) {
    var dx = a.x - b.x,
      dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* Punto dentro o fuera de la zona sin cobertura, sin encimar marcadores. */
  function punto(r, dentro, usados) {
    var cand = null,
      i,
      t,
      x,
      y,
      ok;
    for (t = 0; t < 90; t++) {
      if (dentro) {
        x = Z.x + 26 + r() * (Z.w - 52);
        y = Z.y + 26 + r() * (Z.h - 52);
      } else {
        x = 104 + r() * 470;
        y = 42 + r() * 232;
        if (
          x > Z.x - 16 &&
          x < Z.x + Z.w + 16 &&
          y > Z.y - 16 &&
          y < Z.y + Z.h + 16
        )
          continue;
      }
      cand = { x: Math.round(x), y: Math.round(y) };
      ok = true;
      for (i = 0; i < usados.length; i++)
        if (dist(usados[i], cand) < 54) {
          ok = false;
          break;
        }
      if (ok) return cand;
    }
    return cand || { x: 300, y: 150 };
  }

  /* ---------- datos sintéticos con semilla fija ---------- */
  function datos() {
    var r = LAB.kit.rng(51204),
      usados = [DEP],
      out = [],
      i,
      p,
      bloque;
    for (i = 0; i < CLIENTES.length; i++) {
      p = punto(r, !!EN_ZONA[i], usados);
      usados.push(p);
      bloque = Math.floor(r() * 5); /* ventanas de 3 h entre 08:00 y 15:00 */
      out.push({
        id: i,
        cli: CLIENTES[i],
        x: p.x,
        y: p.y,
        ini: INICIO + bloque * 60,
        fin: INICIO + bloque * 60 + 180,
        pri: LAB.kit.pick(r, [
          "High",
          "Medium",
          "Medium",
          "Low",
          "High",
          "Low",
        ]),
        serv: 8 + Math.round(r() * 9),
        bultos: 1 + Math.round(r() * 8),
        zona: !!EN_ZONA[i],
        cerrado: i === CERRADO,
      });
    }
    return out;
  }
  var BASE = datos();

  /* Redondear ANTES de partir en horas y minutos: si no, 59.7 min imprime ':60'. */
  function hhmm(m) {
    var q = Math.round(m);
    return LAB.kit.pad(Math.floor(q / 60) % 24) + ":" + LAB.kit.pad(q % 60);
  }
  function dur(m) {
    var q = Math.round(m),
      h = Math.floor(q / 60),
      r = q % 60;
    if (!h) return q + " min";
    return r ? h + " h " + LAB.kit.pad(r) + " min" : h + " h";
  }
  function ventana(s) {
    return hhmm(s.ini) + " – " + hhmm(s.fin);
  }
  function sello(s) {
    return hhmm(s.llegada + s.espera + s.serv);
  }
  function motivoTexto(s) {
    if (s.motivo === "ant")
      return (
        "outside time window, " + dur(s.ini - s.llegada) + " before opening"
      );
    if (s.motivo === "late")
      return (
        "outside time window, " + dur(s.llegada + s.espera - s.fin) + " late"
      );
    return s.espera
      ? "within time window, wait " + dur(s.espera) + " for opening"
      : "within time window";
  }

  /* ---------- orden de visita ---------- */
  function largo(ruta) {
    var pts = [DEP].concat(ruta).concat([DEP]),
      t = 0,
      i;
    for (i = 1; i < pts.length; i++) t += dist(pts[i - 1], pts[i]);
    return t;
  }
  /* 2-opt sobre el vecino más cercano: sin esto la heurística a veces
       devuelve una ruta más larga que ordenar por ventana, y la barra
       "ruta más corta" quedaría mintiendo. */
  function dosOpt(ruta) {
    var l0 = largo(ruta),
      mejora = true,
      i,
      j,
      cand,
      l1;
    while (mejora) {
      mejora = false;
      for (i = 0; i < ruta.length - 1; i++) {
        for (j = i + 1; j < ruta.length; j++) {
          cand = ruta
            .slice(0, i)
            .concat(ruta.slice(i, j + 1).reverse(), ruta.slice(j + 1));
          l1 = largo(cand);
          if (l1 < l0 - 1e-9) {
            ruta = cand;
            l0 = l1;
            mejora = true;
          }
        }
      }
    }
    return ruta;
  }
  function ordenar(sel, crit) {
    var i,
      copia = sel.map(function (s) {
        return Object.assign({}, s);
      });
    if (crit === "corta") {
      var libres = copia,
        ruta = [],
        cur = DEP,
        b,
        bd,
        d;
      while (libres.length) {
        b = 0;
        bd = Infinity;
        for (i = 0; i < libres.length; i++) {
          d = dist(cur, libres[i]);
          if (d < bd) {
            bd = d;
            b = i;
          }
        }
        cur = libres[b];
        ruta.push(cur);
        libres.splice(b, 1);
      }
      return dosOpt(ruta);
    }
    if (crit === "prioridad")
      copia.sort(function (a, b2) {
        return RANK[a.pri] - RANK[b2.pri] || a.id - b2.id;
      });
    else
      copia.sort(function (a, b2) {
        return a.ini - b2.ini || a.fin - b2.fin || a.id - b2.id;
      });
    return copia;
  }

  /* Plan completo: tramos, kilómetros y llegada por parada. El técnico espera
       hasta TOL minutos si llega antes de que abra la ventana; más que eso la
       parada queda fuera de lo comprometido, igual que llegar tarde. */
  function planificar(n, crit) {
    var ruta = ordenar(BASE.slice(0, n), crit);
    var pts = [DEP].concat(ruta).concat([DEP]);
    var legs = [],
      km = 0,
      t = INICIO,
      fuera = 0,
      espera = 0,
      i,
      d,
      s,
      antes;
    for (i = 1; i < pts.length; i++) {
      d = dist(pts[i - 1], pts[i]) * KM_PX;
      km += d;
      t += (d / VEL) * 60;
      legs.push({
        a: pts[i - 1],
        b: pts[i],
        km: d,
        min: (d / VEL) * 60,
        vuelta: i === pts.length - 1,
      });
      if (i > ruta.length) break;
      s = ruta[i - 1];
      s.llegada = t;
      antes = s.ini - t;
      s.espera = antes > 0 ? Math.min(antes, TOL) : 0;
      t += s.espera;
      espera += s.espera;
      s.motivo = antes > TOL ? "ant" : t > s.fin ? "late" : "";
      if (s.motivo) fuera++;
      t += s.serv;
    }
    return {
      ruta: ruta,
      legs: legs,
      km: km,
      min: t - INICIO,
      fuera: fuera,
      espera: espera,
      crit: crit,
    };
  }

  /* Los tres criterios sobre el mismo número de paradas: se recalculan una
       vez por cambio de control, no una vez por parada entregada. */
  var cacheAlt = { n: -1, alt: null };
  function alternativas(n) {
    if (cacheAlt.n !== n)
      cacheAlt = {
        n: n,
        alt: CRITS.map(function (c) {
          return planificar(n, c);
        }),
      };
    return cacheAlt.alt;
  }

  function svg(tag, a) {
    var n = document.createElementNS(NS, tag),
      key;
    for (key in a)
      if (Object.prototype.hasOwnProperty.call(a, key))
        n.setAttribute(key, a[key]);
    return n;
  }
  function rotulo(x, y, s, fill, size, anchor) {
    var t = svg("text", {
      x: x,
      y: y,
      fill: fill,
      "font-size": size || 8.5,
      "text-anchor": anchor || "middle",
      "font-family": "'JetBrains Mono', ui-monospace, monospace",
      "letter-spacing": ".02em",
    });
    t.textContent = s;
    return t;
  }

  LAB.register({
    id: "ruta",
    name: "RUTA",
    family: "agentes",
    tagline: "Field operations",
    title:
      "Dispatch and proof of delivery from an app that works without a signal",
    intro:
      "The dispatcher assigns the day's stops, and the mobile app orders the route, downloads it and captures a signature, photo and timestamp at each delivery. Change the stops, ordering criterion and coverage: the map, kilometers and missed time windows update live.",
    spec: {
      trigger:
        "Dispatcher assignment or a schedule loaded the previous day. The app downloads the day's package before leaving the distribution center.",
      systems:
        "Installable mobile app with local storage, a routing service, order backend and timestamped evidence storage.",
      output:
        "A route ordered by the selected criterion, status per stop and evidence per order: recipient signature, package photo and timestamp with coordinates.",
      failure:
        "Without coverage, the app keeps working with downloaded data and queues evidence on the device. When the signal returns, it synchronizes automatically in order, without technician intervention; each order has its own key, so resending the queue does not duplicate delivery.",
    },
    impact: [
      ["No signal", "the app keeps working"],
      ["39%", "fewer kilometers than business-rule ordering"],
      ["100%", "orders closed with evidence and timestamps"],
    ],
    render: function (host, k) {
      var corrida = 0,
        P = null,
        marks = [],
        filas = [],
        legPaths = [];
      var EST = 5,
        EVI = 6; /* columnas de estado y evidencia en la tabla */

      var ctl = k.controls([
        {
          k: "n",
          t: "range",
          label: "Today's stops",
          min: 4,
          max: 14,
          step: 1,
          value: 8,
        },
        {
          k: "crit",
          t: "select",
          label: "Ordering criterion",
          value: "corta",
          options: CRITS.map(function (c) {
            return { v: c, t: NOM[c] };
          }),
        },
        {
          k: "off",
          t: "check",
          label: "Simulate an area without coverage",
          value: true,
        },
        {
          k: "run",
          t: "button",
          label: "Dispatch and follow route",
          primary: true,
        },
      ]);
      host.appendChild(ctl.node);

      var kp = k.kpis([
        ["Assigned stops", "—", ""],
        ["Estimated distance", "—", ""],
        ["Estimated workday", "—", ""],
        ["Outside time window", "—", ""],
        ["Orders with evidence", "—", ""],
      ]);
      host.appendChild(kp.node);

      /* ---------- mapa ---------- */
      var pnMapa = k.panel();
      var hMapa = k.txt("div", "mono-head", "Today's map");
      pnMapa.appendChild(hMapa);
      var mapa = k.el("div", "routemap");
      var root = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
      var gGrid = svg("g"),
        gZona = svg("g"),
        gPlan = svg("g"),
        gViaje = svg("g"),
        gStops = svg("g");
      [gGrid, gZona, gPlan, gViaje, gStops].forEach(function (g) {
        root.appendChild(g);
      });
      (function () {
        /* retícula de fondo y centro de distribución: se dibujan una sola vez */
        var i;
        for (i = 40; i < W; i += 40)
          gGrid.appendChild(
            svg("line", {
              x1: i,
              y1: 0,
              x2: i,
              y2: H,
              stroke: "rgba(148,180,220,.055)",
              "stroke-width": 1,
            }),
          );
        for (i = 34; i < H; i += 34)
          gGrid.appendChild(
            svg("line", {
              x1: 0,
              y1: i,
              x2: W,
              y2: i,
              stroke: "rgba(148,180,220,.055)",
              "stroke-width": 1,
            }),
          );
        gGrid.appendChild(
          svg("rect", {
            x: DEP.x - 11,
            y: DEP.y - 11,
            width: 22,
            height: 22,
            rx: 3,
            fill: "rgba(45,212,191,.18)",
            stroke: C.teal,
            "stroke-width": 1.6,
          }),
        );
        gGrid.appendChild(rotulo(DEP.x, DEP.y + 3.5, "CD", C.teal, 9));
        gGrid.appendChild(
          rotulo(
            DEP.x + 2,
            DEP.y + 26,
            "distribution center",
            C.label,
            8.5,
            "start",
          ),
        );
      })();
      mapa.appendChild(root);
      pnMapa.appendChild(mapa);
      var leyenda = k.txt("div", "mono", "");
      leyenda.style.cssText =
        "font-size:10px;color:var(--label);margin-top:11px;line-height:1.6";
      pnMapa.appendChild(leyenda);
      host.appendChild(pnMapa);

      /* ---------- camino de la evidencia ---------- */
      var pnPipe = k.panel();
      pnPipe.appendChild(k.txt("div", "mono-head", "Evidence pipeline"));
      var pip = k.pipe([
        { n: "Device", m: "Signature, photo and timestamp" },
        { n: "Local queue", m: "Saved on the device" },
        { n: "Synchronization", m: "Retry when the signal returns" },
        { n: "Orders", m: "Delivery status" },
        { n: "Evidence", m: "File with timestamp and coordinates" },
      ]);
      pnPipe.appendChild(pip.node);
      host.appendChild(pnPipe);

      /* ---------- tabla y bitácora ---------- */
      var g1 = k.el("div", "grid2 wide-left");
      var pnTab = k.panel();
      var hTab = k.txt("div", "mono-head", "Stops");
      pnTab.appendChild(hTab);
      var hostTab = k.el("div");
      pnTab.appendChild(hostTab);
      var pnLog = k.panel();
      pnLog.appendChild(k.txt("div", "mono-head", "Dispatch log"));
      var log = k.log("452px");
      pnLog.appendChild(log.node);
      g1.appendChild(pnTab);
      g1.appendChild(pnLog);
      host.appendChild(g1);

      /* ---------- comparación y lectura ---------- */
      var g2 = k.el("div", "grid2");
      var pnBar = k.panel();
      pnBar.appendChild(
        k.txt(
          "div",
          "mono-head",
          "Kilometers and time windows by ordering criterion",
        ),
      );
      var bars = k.bars();
      pnBar.appendChild(bars.node);
      var notaBar = k.txt("div", "mono", "");
      notaBar.style.cssText =
        "font-size:10px;color:var(--label);margin-top:12px;line-height:1.6";
      pnBar.appendChild(notaBar);
      var pnIns = k.panel();
      pnIns.appendChild(k.txt("div", "mono-head", "Day's insights"));
      var ins = k.insights();
      pnIns.appendChild(ins.node);
      g2.appendChild(pnBar);
      g2.appendChild(pnIns);
      host.appendChild(g2);

      /* ---------- pintado del mapa ---------- */
      function pintarMapa(off) {
        gZona.innerHTML = "";
        gPlan.innerHTML = "";
        gViaje.innerHTML = "";
        gStops.innerHTML = "";
        marks = [];
        legPaths = [];
        if (off) {
          gZona.appendChild(
            svg("rect", {
              x: Z.x,
              y: Z.y,
              width: Z.w,
              height: Z.h,
              rx: 10,
              fill: "rgba(251,191,36,.07)",
              stroke: "rgba(251,191,36,.42)",
              "stroke-width": 1.2,
              "stroke-dasharray": "6 5",
            }),
          );
          gZona.appendChild(
            rotulo(
              Z.x + 10,
              Z.y + 17,
              "AREA WITHOUT COVERAGE",
              C.amber,
              9,
              "start",
            ),
          );
        }
        var d = "M" + DEP.x + " " + DEP.y,
          i;
        for (i = 0; i < P.ruta.length; i++)
          d += " L" + P.ruta[i].x + " " + P.ruta[i].y;
        d += " L" + DEP.x + " " + DEP.y;
        gPlan.appendChild(
          svg("path", {
            d: d,
            fill: "none",
            stroke: "rgba(148,180,220,.30)",
            "stroke-width": 1.4,
            "stroke-dasharray": "5 5",
            "stroke-linejoin": "round",
          }),
        );

        P.legs.forEach(function (lg) {
          /* un trazo por tramo: se anima en secuencia */
          var p = svg("path", {
            d: "M" + lg.a.x + " " + lg.a.y + " L" + lg.b.x + " " + lg.b.y,
            fill: "none",
            stroke: lg.vuelta ? "rgba(45,212,191,.5)" : C.teal,
            "stroke-width": lg.vuelta ? 1.8 : 2.3,
            "stroke-linecap": "round",
          });
          var len = Math.max(1, dist(lg.a, lg.b));
          p.style.strokeDasharray = len + " " + len;
          p.style.strokeDashoffset = String(len);
          gViaje.appendChild(p);
          legPaths.push(p);
        });

        P.ruta.forEach(function (s, idx) {
          var st = s.motivo ? MST.fuera : MST.pend;
          var g = svg("g");
          var c = svg("circle", {
            cx: s.x,
            cy: s.y,
            r: 12.5,
            fill: st.f,
            stroke: st.s,
            "stroke-width": 1.8,
          });
          var num = rotulo(s.x, s.y + 3.6, String(idx + 1), C.ink, 10.5);
          num.setAttribute("font-weight", "600");
          var tag = rotulo(
            s.x,
            s.y + 26,
            hhmm(s.llegada) + " · " + st.t,
            st.c,
            8.5,
          );
          g.appendChild(c);
          g.appendChild(num);
          g.appendChild(tag);
          gStops.appendChild(g);
          marks.push({ c: c, tag: tag, base: hhmm(s.llegada) });
        });
        root.setAttribute(
          "aria-label",
          "Day's map: distribution center and " +
            P.ruta.length +
            " numbered stops in visit order, " +
            k.fmt(P.km, 1) +
            " kilometers using " +
            NOM[P.crit].toLowerCase() +
            ".",
        );
      }

      function marcar(i, estado) {
        var m = marks[i],
          st = MST[estado];
        if (!m || !st) return;
        m.c.setAttribute("stroke", st.s);
        m.c.setAttribute("fill", st.f);
        if (estado === "cola") m.c.setAttribute("stroke-dasharray", "4 3");
        else m.c.removeAttribute("stroke-dasharray");
        m.tag.setAttribute("fill", st.c);
        m.tag.textContent = m.base + " · " + st.t;
      }

      /* ---------- tabla ---------- */
      var COLS = [
        { t: "#", r: true },
        { t: "Customer" },
        { t: "Time window" },
        { t: "Arrival" },
        { t: "Priority" },
        { t: "Status" },
        { t: "Evidence" },
      ];
      function pintarTabla() {
        hostTab.innerHTML = "";
        var rows = P.ruta.map(function (s, i) {
          return [
            String(i + 1),
            s.cli,
            ventana(s),
            hhmm(s.llegada) + " · " + motivoTexto(s),
            s.pri,
            { html: k.pill("idle", "Planned") },
            { html: k.pill("idle", "not captured") },
          ];
        });
        var t = k.table(COLS, rows);
        hostTab.appendChild(t.node);
        filas = Array.prototype.slice.call(t.body.children);
      }
      function estadoFila(i, tono, texto, evTono, evTexto) {
        var f = filas[i];
        if (!f) return;
        f.children[EST].innerHTML = k.pill(tono, texto);
        if (evTexto != null)
          f.children[EVI].innerHTML = k.pill(evTono, evTexto);
      }

      /* ---------- camino de la evidencia ---------- */
      function pintarPipe(e) {
        var n = P.ruta.length;
        pip.set(
          0,
          e.cap ? (e.cap === n ? "done" : "run") : "",
          e.cap + " of " + n + " captured",
        );
        pip.set(
          1,
          e.cola ? "run" : e.drenada ? "done" : "",
          e.cola
            ? e.cola + " queued locally"
            : e.drenada
              ? "empty queue"
              : "no queue",
        );
        pip.set(
          2,
          e.cola ? "run" : e.drenada ? "done" : "",
          e.cola
            ? "waiting for a signal"
            : e.drenada
              ? e.drenada + " synced"
              : "waiting",
        );
        pip.set(
          3,
          e.ord ? (e.ord === n ? "done" : "run") : "",
          e.ord + " of " + n + " completed",
        );
        pip.set(
          4,
          e.arch ? (e.arch === n ? "done" : "run") : "",
          e.arch + " of " + n + " archived",
        );
      }

      /* ---------- indicadores, barras y lectura ---------- */
      function pintarSalida(e) {
        var off = ctl.get("off"),
          n = P.ruta.length;
        var enZona = P.ruta.filter(function (s) {
          return s.zona;
        }).length;
        /* cada tono va acompañado del texto que lo explica en la lectura
                   de la jornada y en las etiquetas de la tabla, nunca solo. */
        kp.set(0, n + " of " + CLIENTES.length, "");
        kp.set(1, k.fmt(P.km, 1) + " km", "");
        kp.set(2, dur(P.min), P.min > TURNO ? "bad" : "");
        kp.set(3, P.fuera + " of " + n, P.fuera ? "warn" : "up");
        kp.set(
          4,
          e.arch + " of " + n,
          e.arch === n ? "up" : e.cola ? "warn" : "",
        );

        var alt = alternativas(n);
        var max = Math.max(alt[0].km, alt[1].km, alt[2].km);
        bars.clear();
        alt.forEach(function (a) {
          bars.add(
            NOM[a.crit] + (a.crit === P.crit ? " · current" : ""),
            a.km,
            max,
            a.crit === P.crit ? C.teal : "rgba(148,180,220,.26)",
            k.fmt(a.km, 1) + " km · " + a.fuera + " outside time window",
          );
        });
        var reglas = (alt[1].km + alt[2].km) / 2;
        var ahorro = reglas > 0 ? ((reglas - alt[0].km) / reglas) * 100 : 0;
        notaBar.textContent =
          "Geographic ordering covers " +
          k.pct(ahorro, 0) +
          " fewer kilometers than the average of the two business-rule orderings, and leaves " +
          alt[0].fuera +
          " of " +
          n +
          " stops outside their promised windows. Ordering by time window adds " +
          k.fmt(alt[2].km - alt[0].km, 1) +
          " km and reduces them to " +
          alt[2].fuera +
          ". Priority ordering does not optimize distance: it guarantees high-priority customers are served first, at a cost of " +
          k.fmt(alt[1].km - alt[0].km, 1) +
          " km for that guarantee. The decision belongs to the dispatcher, not the algorithm.";

        leyenda.textContent =
          "Square = distribution center. Numbered circle = stop in visit order, with its estimated arrival time. " +
          "Dashed line = calculated plan. Solid line = dispatched route." +
          (off
            ? " Amber rectangle = area without coverage, " +
              enZona +
              (enZona === 1
                ? " stop within the window."
                : " stops within the window.")
            : "");
        hMapa.textContent =
          "Today's map — " +
          n +
          " stops · " +
          NOM[P.crit].toLowerCase() +
          " · " +
          k.fmt(P.km, 1) +
          " km";
        hTab.textContent =
          "Stops — visit order calculated using " + NOM[P.crit].toLowerCase();

        ins.clear();
        ins.add(
          "teal",
          ">",
          "Ordered by <b>" +
            k.escapeHtml(NOM[P.crit].toLowerCase()) +
            "</b>: " +
            k.escapeHtml(k.fmt(P.km, 1)) +
            " km and " +
            k.escapeHtml(dur(P.min)) +
            " for the day, including departure at 08:00 and return to the distribution center.",
        );
        if (P.fuera)
          ins.add(
            "amber",
            "!",
            "<b>" +
              P.fuera +
              " of " +
              n +
              "</b> stops fall outside the promised window: some arrive late, others more than " +
              TOL +
              " minutes before the customer opens. Both violate the window and both are recorded.",
          );
        else
          ins.add(
            "green",
            "=",
            "The " +
              n +
              " stops arrive within their promised time windows under this ordering.",
          );
        if (P.espera >= 20)
          ins.add(
            "violet",
            "<",
            "The technician waits <b>" +
              k.escapeHtml(dur(P.espera)) +
              "</b> in total for customers that have not opened yet. This wait is a cost of the chosen ordering, just like the kilometers.",
          );
        if (off) {
          ins.add(
            "violet",
            "+",
            "<b>" +
              enZona +
              (enZona === 1 ? " stop falls" : " stops fall") +
              " in the area without coverage</b>. The app uses the downloaded package: orders, map and forms. Signatures and photos are saved on the device and synchronized when the signal returns.",
          );
        } else {
          ins.add(
            "cyan",
            "·",
            "With coverage throughout the route, each piece of evidence reaches storage at delivery time. Enable the no-coverage area to see what happens when it cannot be sent.",
          );
        }
        if (P.min > TURNO)
          ins.add(
            "rose",
            "!",
            "The estimated day exceeds <b>9 hours</b>: with " +
              n +
              " stops and this criterion, the route does not fit into one shift. The dispatcher splits it between two units or moves the final stops to the next day.",
          );
        if (
          P.ruta.filter(function (s) {
            return s.cerrado;
          }).length
        ) {
          ins.add(
            "rose",
            "!",
            "One stop is <b>rescheduled</b> because the customer is closed. It is not lost: a catalog reason and location photo are recorded, and it is rescheduled for the same window on the next day.",
          );
        }
      }

      var VACIO = { cap: 0, cola: 0, drenada: 0, ord: 0, arch: 0 };
      function refrescar(silencioso) {
        P = planificar(ctl.get("n"), ctl.get("crit"));
        pintarMapa(ctl.get("off"));
        pintarTabla();
        pintarPipe(VACIO);
        pintarSalida(VACIO);
        if (silencioso) return;
        log.clear();
        log.push(
          "in",
          "Previous day's schedule received: " +
            P.ruta.length +
            " stops assigned to the field technician.",
        );
        log.push(
          "in",
          "Order calculated using " +
            NOM[P.crit].toLowerCase() +
            ": " +
            k.fmt(P.km, 1) +
            " km, " +
            dur(P.min) +
            " for the day and " +
            P.fuera +
            " stop" +
            (P.fuera === 1 ? "" : "s") +
            " outside time window.",
        );
        log.push(
          "wa",
          'Route planned. Press "Dispatch and follow route" to send it to the device and follow the day stop by stop.',
        );
      }

      /* Revela el tramo con stroke-dashoffset; con movimiento reducido salta al final. */
      function trazo(p, ms) {
        var len;
        if (!p) return k.wait(0);
        try {
          len = p.getTotalLength();
        } catch (e) {
          len = 0;
        }
        if (!len) {
          p.style.strokeDashoffset = "0";
          return k.wait(ms);
        }
        p.style.strokeDasharray = len + " " + len;
        p.style.strokeDashoffset = String(len);
        if (k.reduce) {
          p.style.strokeDashoffset = "0";
          return k.wait(0);
        }
        p.getBoundingClientRect();
        p.style.transition = "stroke-dashoffset " + ms + "ms linear";
        p.style.strokeDashoffset = "0";
        return k.wait(ms);
      }

      async function despachar() {
        var mi =
          ++corrida; /* cualquier cambio de control invalida esta corrida */
        ctl.busy("run", true);
        refrescar(true);
        var off = ctl.get("off"),
          n = P.ruta.length;
        var e = { cap: 0, cola: 0, drenada: 0, ord: 0, arch: 0 };
        var enCola = [],
          entregadas = 0,
          repro = 0,
          i,
          s;

        log.clear();
        log.push(
          "in",
          "Dispatch started: " +
            n +
            " orders approved by the dispatcher and sent to the device.",
        );
        await k.wait(320);
        if (mi !== corrida) return;
        log.push(
          "ok",
          "Day's package downloaded: orders, area map, delivery forms and reason catalog. The app no longer needs a network to operate.",
        );
        await k.wait(320);
        if (mi !== corrida) return;
        if (off)
          log.push(
            "wa",
            "Known coverage: the eastern sector has no stable signal. The app does not change modes; it keeps writing to local storage.",
          );
        log.push("hl", "Departure from the distribution center at 08:00.");

        for (i = 0; i < n; i++) {
          s = P.ruta[i];
          marcar(i, "ruta");
          estadoFila(i, "run", "En route", "idle", "not captured");
          await trazo(
            legPaths[i],
            Math.max(280, Math.min(900, P.legs[i].min * 26)),
          );
          if (mi !== corrida) return;
          log.push(
            "in",
            "Stop " +
              k.pad(i + 1) +
              " — " +
              s.cli +
              ": arrival " +
              hhmm(s.llegada) +
              ", " +
              s.bultos +
              " packages, time window " +
              ventana(s) +
              " (" +
              motivoTexto(s) +
              ").",
          );
          await k.wait(180);
          if (mi !== corrida) return;

          if (s.cerrado) {
            marcar(i, "repr");
            estadoFila(i, "bad", "Rescheduled", "warn", "reason + photo");
            e.cap++;
            e.ord++;
            e.arch++;
            repro++;
            pintarPipe(e);
            pintarSalida(e);
            log.push(
              "er",
              "Customer closed. Without the recipient's signature, the order is not marked delivered: the technician selects a catalog reason and takes a location photo.",
            );
            await k.wait(260);
            if (mi !== corrida) return;
            log.push(
              "wa",
              "Stop rescheduled for the next day in the same window " +
                ventana(s) +
                ". The dispatcher sees the change on the dashboard immediately, not at day's end.",
            );
            await k.wait(160);
            if (mi !== corrida) return;
            continue;
          }

          entregadas++;
          e.cap++;
          e.ord++;
          if (off && s.zona) {
            marcar(i, "cola");
            estadoFila(i, "ok", "Delivered", "warn", "queued locally");
            enCola.push(i);
            e.cola++;
            log.push(
              "wa",
              "No signal at this stop. The app keeps working: signature captured, photo taken and timestamp " +
                sello(s) +
                " saved in the device's local queue.",
            );
            await k.wait(240);
            if (mi !== corrida) return;
            log.push(
              "in",
              "Local queue: " +
                e.cola +
                " evidence item" +
                (e.cola > 1 ? "s" : "") +
                " pending" +
                (e.cola > 1 ? "s" : "") +
                " to upload. The technician continues without waiting for a network.",
            );
          } else {
            marcar(i, "ok");
            estadoFila(i, "ok", "Delivered", "ok", "signature + photo");
            e.arch++;
            log.push(
              "ok",
              "Delivery confirmed: recipient signature, package photo and timestamp " +
                sello(s) +
                " sent to evidence storage.",
            );
          }
          if (s.motivo)
            log.push(
              "wa",
              "The order is marked " +
                motivoTexto(s) +
                ". The time difference travels with the evidence; it is not manually corrected.",
            );
          pintarPipe(e);
          pintarSalida(e);
          await k.wait(160);
          if (mi !== corrida) return;
        }

        await trazo(legPaths[P.legs.length - 1], 620);
        if (mi !== corrida) return;

        if (enCola.length) {
          log.push(
            "hl",
            "Coverage restored after leaving the eastern sector. Synchronization starts automatically.",
          );
          await k.wait(280);
          if (mi !== corrida) return;
          for (i = 0; i < enCola.length; i++) {
            marcar(enCola[i], "ok");
            estadoFila(enCola[i], "ok", "Delivered", "ok", "signature + photo");
            e.cola--;
            e.drenada++;
            e.arch++;
            pintarPipe(e);
            pintarSalida(e);
            log.push(
              "ok",
              "Evidence from stop " +
                k.pad(enCola[i] + 1) +
                " synchronized with its original timestamp, not the upload time.",
            );
            await k.wait(180);
            if (mi !== corrida) return;
          }
          log.push(
            "in",
            "Synchronization completed without technician intervention. Each order has its own key: resending the queue does not duplicate delivery.",
          );
        }

        log.push(
          "hl",
          "Workday completed: " +
            entregadas +
            " deliveries with signatures, " +
            repro +
            " rescheduled" +
            (repro === 1 ? "" : "s") +
            ", " +
            e.arch +
            " of " +
            n +
            " orders with archived evidence, " +
            k.fmt(P.km, 1) +
            " km and " +
            dur(P.min) +
            " en route.",
        );
        pintarPipe(e);
        pintarSalida(e);
        ctl.busy("run", false);
      }

      /* Mover cualquier control aborta la corrida en vuelo y replanifica. */
      ctl.on(function () {
        corrida++;
        ctl.busy("run", false);
        refrescar();
      });
      ctl.onClick("run", function () {
        despachar();
      });
      refrescar();
    },
  });
})();
