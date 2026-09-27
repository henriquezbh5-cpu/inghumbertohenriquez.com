/* ============================================================
   LABORATORIO — arranque
   Monta la galería de sistemas, resuelve el ancla de la URL y
   renderiza el sistema activo. Va al final de los <script defer>.

   La galería manda sobre el nombre técnico: el visitante elige
   por ilustración y por una pregunta que entiende, no leyendo
   una lista de nombres en mayúsculas.
   ============================================================ */
(function () {
  "use strict";

  var LAB = window.LAB;
  if (!LAB) return;
  var k = LAB.kit;

  /* ---------- cómo se presenta cada sistema ----------
       pregunta: lo que el visitante quiere saber, en su idioma.
       gancho:   qué puede hacer aquí, en una línea y con un verbo.
       img:      ilustración de la tarjeta. */
  var P = {
    prisma: {
      pregunta: "Upload your file and see the results",
      gancho:
        "Drag in your own Excel or CSV file. Get metrics, charts and written insights in seconds.",
      img: "panel",
    },
    orquesta: {
      pregunta: "Who needs to approve this purchase?",
      gancho: "Change the amount and watch the approval chain build itself.",
      img: "aprobacion",
    },
    centinela: {
      pregunta: "Should this invoice be paid or held?",
      gancho: "Adjust the tolerance and see how much money it allows through.",
      img: "lupa",
    },
    relevo: {
      pregunta: "Someone new joins. What happens behind the scenes?",
      gancho:
        "Choose an employment change and watch the twelve steps run one by one.",
      img: "dos-robots",
    },
    boveda: {
      pregunta: "What does this document say?",
      gancho:
        "Raise the confidence threshold and see which fields stop being approved automatically.",
      img: "laptop",
    },
    cartero: {
      pregunta: "Monday reports, without anyone having to send them",
      gancho:
        "Trigger a failure and watch the robot retry and record what happened.",
      img: "entrega",
    },
    oraculo: {
      pregunta: "How much will we sell over the next six months?",
      gancho: "Change the forecast horizon and watch the uncertainty widen.",
      img: "vigilancia",
    },
    escudo: {
      pregunta: "How messy is this data?",
      gancho:
        "Turn off a rule and see how many invalid records reach the dashboard.",
      img: "alerta",
    },
    reloj: {
      pregunta: "Month-end close with a source offline",
      gancho:
        "Take the treasury service offline and see what the workflow decides.",
      img: "datos",
    },
    torre: {
      pregunta: "A request arrives. Who handles it?",
      gancho: "Write your own request and see why it was classified that way.",
      img: "procesos",
    },
    canal: {
      pregunta: "Ask questions about the company's data",
      gancho: "Ask a question and get a calculated answer with its source.",
      img: "agente",
    },
    pulso: {
      pregunta: "170 bots running. Which one failed?",
      gancho: "Trigger an incident and watch it recover automatically.",
      img: "maquina",
    },
    ruta: {
      pregunta: "Today's route, with no signal in the area",
      gancho: "Change the stops and watch the map recalculate.",
      img: "flujos",
    },
  };

  function pres(id) {
    return P[id] || { pregunta: "", gancho: "", img: "panel" };
  }

  /* ---------- revelado: nada visible se queda invisible ---------- */
  function revealAll(scope) {
    (scope || document).querySelectorAll(".rv:not(.in)").forEach(function (n) {
      n.classList.add("in");
    });
  }
  function revealTarget() {
    if (!location.hash) return;
    var s;
    try {
      s = document.querySelector(location.hash);
    } catch (e) {
      return;
    }
    if (!s) return;
    s.classList.add("in");
    revealAll(s);
  }
  window.addEventListener("hashchange", revealTarget);
  revealTarget();
  if (LAB.reduce) revealAll();

  function enPantalla(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight + 140 && r.bottom > -140;
  }
  function revealVisibles() {
    document.querySelectorAll(".rv:not(.in)").forEach(function (n) {
      if (enPantalla(n)) n.classList.add("in");
    });
  }
  setTimeout(revealVisibles, 1400);
  var pendienteScroll = false;
  window.addEventListener(
    "scroll",
    function () {
      if (pendienteScroll) return;
      pendienteScroll = true;
      setTimeout(function () {
        pendienteScroll = false;
        revealVisibles();
      }, 400);
    },
    { passive: true },
  );

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      var s;
      try {
        s = document.querySelector(href);
      } catch (e) {
        return;
      }
      if (s) {
        s.classList.add("in");
        revealAll(s);
      }
    });
  });

  (function reveals() {
    var els = document.querySelectorAll(".rv");
    if (!els.length) return;
    if (LAB.reduce || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.04 },
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  })();

  /* ---------- reloj ---------- */
  (function clock() {
    var nodes = document.querySelectorAll("[data-clock]");
    if (!nodes.length) return;
    var tick = function () {
      var s = k.stamp();
      nodes.forEach(function (n) {
        n.textContent = s;
      });
    };
    tick();
    setInterval(tick, 1000);
  })();

  /* ---------- menú móvil ---------- */
  (function nav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  })();

  /* ---------- galería + escenario ---------- */
  var galeria = document.getElementById("galeria");
  var chipsRow = document.getElementById("sysChips");
  var stage = document.getElementById("stage");
  var escenario = document.getElementById("escenario");
  if (!galeria || !stage) return;

  var pendientes = LAB.systems.filter(function (s) {
    return s.family !== "hero";
  });
  var list = [];
  LAB.families.forEach(function (fam) {
    pendientes.forEach(function (s) {
      if (s.family === fam.id) list.push(s);
    });
  });
  pendientes.forEach(function (s) {
    if (list.indexOf(s) < 0) list.push(s);
  });

  var tarjetas = [];
  var chips = [];
  var current = -1;

  function ilustracion(id, alto) {
    var img = document.createElement("img");
    img.src = "/img/nova/" + pres(id).img + ".webp";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 400;
    img.height = alto || 300;
    return img;
  }

  /* ---------- tarjetas ---------- */
  list.forEach(function (sys, idx) {
    var p = pres(sys.id);
    var card = document.createElement("button");
    card.type = "button";
    card.className = "card-sys";
    card.setAttribute("aria-label", "Try " + sys.name + ": " + p.pregunta);

    var fig = k.el("div", "card-fig");
    fig.appendChild(ilustracion(sys.id));
    card.appendChild(fig);

    var body = k.el("div", "card-body");
    body.appendChild(k.txt("span", "card-tag mono", sys.name));
    body.appendChild(k.txt("h3", null, p.pregunta));
    body.appendChild(k.txt("p", null, p.gancho));
    body.appendChild(k.txt("span", "card-go mono", "TRY IT →"));
    card.appendChild(body);

    card.addEventListener("click", function () {
      abrir(idx, true);
    });
    galeria.appendChild(card);
    tarjetas[idx] = card;

    if (chipsRow) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip-sys mono";
      chip.textContent = sys.name;
      chip.setAttribute("aria-current", "false");
      chip.addEventListener("click", function () {
        abrir(idx, true);
      });
      chipsRow.appendChild(chip);
      chips[idx] = chip;
    }
  });

  function fichaNode(spec) {
    var d = document.createElement("dl");
    d.className = "ficha";
    [
      ["What triggers it", spec.trigger],
      ["What it connects to", spec.systems],
      ["What it produces", spec.output],
      ["If something fails", spec.failure],
    ].forEach(function (row) {
      if (!row[1]) return;
      var c = document.createElement("div");
      c.appendChild(k.txt("dt", null, row[0]));
      c.appendChild(k.txt("dd", null, row[1]));
      d.appendChild(c);
    });
    return d;
  }

  function impactNode(items) {
    var w = k.el("div", "impact");
    items.forEach(function (a) {
      var d = document.createElement("div");
      d.appendChild(k.txt("b", null, a[0]));
      d.appendChild(document.createTextNode(a[1]));
      w.appendChild(d);
    });
    return w;
  }

  /* Lo denso vive plegado: quien quiera el detalle lo abre. */
  function detalle(resumen, contenido) {
    var d = document.createElement("details");
    d.className = "detalle";
    var s = document.createElement("summary");
    s.className = "mono";
    s.textContent = resumen;
    d.appendChild(s);
    var body = k.el("div", "detalle-body");
    body.appendChild(contenido);
    d.appendChild(body);
    return d;
  }

  function abrir(i, desplazar) {
    if (!list[i]) return;
    if (i === current) {
      if (desplazar && escenario)
        escenario.scrollIntoView({
          behavior: LAB.reduce ? "auto" : "smooth",
          block: "start",
        });
      return;
    }
    current = i;
    LAB.disposeCharts();
    chips.forEach(function (c, j) {
      if (c) c.setAttribute("aria-current", j === i ? "true" : "false");
    });
    tarjetas.forEach(function (c, j) {
      if (c) c.classList.toggle("is-open", j === i);
    });

    var sys = list[i];
    var p = pres(sys.id);
    stage.innerHTML = "";
    var wrap = k.el("div", "stack");
    stage.appendChild(wrap);

    /* Encabezado humano: la pregunta manda, el nombre es un sello. */
    var head = k.el("div", "stage-head");
    var fila = k.el("div", "stage-head-top");
    fila.appendChild(k.txt("span", "card-tag mono", sys.name));
    fila.appendChild(k.txt("span", "stage-fam mono", sys.tagline));
    head.appendChild(fila);
    head.appendChild(k.txt("h3", null, p.pregunta));
    var guia = k.el("p", "stage-guia");
    guia.appendChild(k.txt("span", "guia-icono", "→"));
    guia.appendChild(k.txt("span", null, p.gancho));
    head.appendChild(guia);
    wrap.appendChild(head);

    var host = k.el("div", "stack");
    wrap.appendChild(host);

    try {
      sys.render(host, k);
    } catch (err) {
      host.appendChild(
        k.el(
          "div",
          "panel pad",
          '<span class="mono">This demonstration could not be loaded.</span>',
        ),
      );
      if (window.console) console.warn("[lab]", sys.id, err);
    }

    /* Detalle técnico plegado: ficha + explicación larga original. */
    var fondo = k.el("div", "stack");
    if (sys.intro) {
      var t = k.txt("p", "detalle-intro", sys.intro);
      fondo.appendChild(t);
    }
    if (sys.spec) fondo.appendChild(fichaNode(sys.spec));
    if (sys.impact && sys.impact.length)
      fondo.appendChild(impactNode(sys.impact));
    wrap.appendChild(detalle("How is it built? · Technical details", fondo));

    var url = "#" + sys.id;
    if (location.hash !== url) history.replaceState(null, "", url);
    if (desplazar && escenario) {
      escenario.scrollIntoView({
        behavior: LAB.reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  function desdeHash() {
    var h = (location.hash || "").replace("#", "");
    return list.findIndex(function (s) {
      return s.id === h;
    });
  }

  var inicio = desdeHash();
  abrir(inicio >= 0 ? inicio : 0, false);
  if (inicio >= 0 && escenario) {
    requestAnimationFrame(function () {
      escenario.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }

  window.addEventListener("hashchange", function () {
    var idx = desdeHash();
    if (idx >= 0) abrir(idx, false);
  });

  /* ---------- PRISMA, fuera de la galería ---------- */
  var heroSys = LAB.systems.find(function (s) {
    return s.family === "hero";
  });
  var heroHost = document.getElementById("heroSystem");
  if (heroSys && heroHost) {
    try {
      heroSys.render(heroHost, k);
    } catch (err) {
      heroHost.appendChild(
        k.el(
          "div",
          "panel pad",
          '<span class="mono">The dashboard engine could not be loaded.</span>',
        ),
      );
      if (window.console) console.warn("[lab] hero", err);
    }
    var fondoP = k.el("div", "stack");
    if (heroSys.intro)
      fondoP.appendChild(k.txt("p", "detalle-intro", heroSys.intro));
    if (heroSys.spec) fondoP.appendChild(fichaNode(heroSys.spec));
    if (heroSys.impact) fondoP.appendChild(impactNode(heroSys.impact));
    heroHost.appendChild(
      detalle("How is it built? · Technical details", fondoP),
    );
  }
})();
