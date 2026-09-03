/* ============================================================
   LABORATORIO — arranque
   Monta la galería de sistemas, resuelve el ancla de la URL y
   renderiza el sistema activo. Va al final de los <script defer>.

   La galería manda sobre el nombre técnico: el visitante elige
   por ilustración y por una pregunta que entiende, no leyendo
   una lista de nombres en mayúsculas.
   ============================================================ */
(function () {
    'use strict';

    var LAB = window.LAB;
    if (!LAB) return;
    var k = LAB.kit;

    /* ---------- cómo se presenta cada sistema ----------
       pregunta: lo que el visitante quiere saber, en su idioma.
       gancho:   qué puede hacer aquí, en una línea y con un verbo.
       img:      ilustración de la tarjeta. */
    var P = {
        prisma: {
            pregunta: 'Sube tu archivo y mira qué sale',
            gancho: 'Arrastra un Excel o un CSV tuyo. En segundos tienes indicadores, gráficas y conclusiones escritas.',
            img: 'panel'
        },
        orquesta: {
            pregunta: '¿Quién tiene que firmar esta compra?',
            gancho: 'Mueve el monto y mira cómo se arma sola la cadena de firmas.',
            img: 'aprobacion'
        },
        centinela: {
            pregunta: '¿Esta factura se paga o se detiene?',
            gancho: 'Mueve la tolerancia y mira cuánto dinero deja pasar.',
            img: 'lupa'
        },
        relevo: {
            pregunta: 'Entra alguien nuevo. ¿Qué pasa por dentro?',
            gancho: 'Elige el movimiento y mira los doce pasos ejecutarse uno por uno.',
            img: 'dos-robots'
        },
        boveda: {
            pregunta: '¿Qué dice este documento?',
            gancho: 'Sube el umbral de confianza y mira qué campos dejan de aprobarse solos.',
            img: 'laptop'
        },
        cartero: {
            pregunta: 'Los reportes del lunes, sin que nadie los mande',
            gancho: 'Provoca un fallo y mira cómo el robot reintenta y deja constancia.',
            img: 'entrega'
        },
        oraculo: {
            pregunta: '¿Cuánto vamos a vender el próximo semestre?',
            gancho: 'Mueve el horizonte y mira cuánto se abre el margen de error.',
            img: 'vigilancia'
        },
        escudo: {
            pregunta: '¿Qué tan sucios están estos datos?',
            gancho: 'Apaga una regla y mira cuántos registros malos se cuelan al tablero.',
            img: 'alerta'
        },
        reloj: {
            pregunta: 'El cierre del mes, con una fuente caída',
            gancho: 'Tumba el servicio de tesorería y mira qué decide el flujo.',
            img: 'datos'
        },
        torre: {
            pregunta: 'Llega una solicitud. ¿Quién la atiende?',
            gancho: 'Escribe tú la solicitud y mira por qué la clasificó así.',
            img: 'procesos'
        },
        canal: {
            pregunta: 'Pregúntale a los datos de la empresa',
            gancho: 'Haz una pregunta y recibe la respuesta calculada, con su fuente.',
            img: 'agente'
        },
        pulso: {
            pregunta: '170 bots corriendo. ¿Cuál falló?',
            gancho: 'Provoca un incidente y mira cómo se recupera solo.',
            img: 'maquina'
        },
        ruta: {
            pregunta: 'La ruta del día, sin señal en la zona',
            gancho: 'Cambia las paradas y mira el mapa recalcularse.',
            img: 'flujos'
        }
    };

    function pres(id) {
        return P[id] || { pregunta: '', gancho: '', img: 'panel' };
    }

    /* ---------- revelado: nada visible se queda invisible ---------- */
    function revealAll(scope) {
        (scope || document).querySelectorAll('.rv:not(.in)').forEach(function (n) { n.classList.add('in'); });
    }
    function revealTarget() {
        if (!location.hash) return;
        var s;
        try { s = document.querySelector(location.hash); } catch (e) { return; }
        if (!s) return;
        s.classList.add('in');
        revealAll(s);
    }
    window.addEventListener('hashchange', revealTarget);
    revealTarget();
    if (LAB.reduce) revealAll();

    function enPantalla(el) {
        var r = el.getBoundingClientRect();
        return r.top < window.innerHeight + 140 && r.bottom > -140;
    }
    function revealVisibles() {
        document.querySelectorAll('.rv:not(.in)').forEach(function (n) {
            if (enPantalla(n)) n.classList.add('in');
        });
    }
    setTimeout(revealVisibles, 1400);
    var pendienteScroll = false;
    window.addEventListener('scroll', function () {
        if (pendienteScroll) return;
        pendienteScroll = true;
        setTimeout(function () { pendienteScroll = false; revealVisibles(); }, 400);
    }, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function () {
            var href = a.getAttribute('href');
            if (!href || href === '#') return;
            var s;
            try { s = document.querySelector(href); } catch (e) { return; }
            if (s) { s.classList.add('in'); revealAll(s); }
        });
    });

    (function reveals() {
        var els = document.querySelectorAll('.rv');
        if (!els.length) return;
        if (LAB.reduce || !('IntersectionObserver' in window)) { revealAll(); return; }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { threshold: 0.04 });
        els.forEach(function (el) { io.observe(el); });
    })();

    /* ---------- reloj ---------- */
    (function clock() {
        var nodes = document.querySelectorAll('[data-clock]');
        if (!nodes.length) return;
        var tick = function () {
            var s = k.stamp();
            nodes.forEach(function (n) { n.textContent = s; });
        };
        tick();
        setInterval(tick, 1000);
    })();

    /* ---------- menú móvil ---------- */
    (function nav() {
        var toggle = document.getElementById('navToggle');
        var links = document.getElementById('navLinks');
        if (!toggle || !links) return;
        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        links.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                links.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    })();

    /* ---------- galería + escenario ---------- */
    var galeria = document.getElementById('galeria');
    var chipsRow = document.getElementById('sysChips');
    var stage = document.getElementById('stage');
    var escenario = document.getElementById('escenario');
    if (!galeria || !stage) return;

    var pendientes = LAB.systems.filter(function (s) { return s.family !== 'hero'; });
    var list = [];
    LAB.families.forEach(function (fam) {
        pendientes.forEach(function (s) { if (s.family === fam.id) list.push(s); });
    });
    pendientes.forEach(function (s) { if (list.indexOf(s) < 0) list.push(s); });

    var tarjetas = [];
    var chips = [];
    var current = -1;

    function ilustracion(id, alto) {
        var img = document.createElement('img');
        img.src = '../img/nova/' + pres(id).img + '.webp';
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 400;
        img.height = alto || 300;
        return img;
    }

    /* ---------- tarjetas ---------- */
    list.forEach(function (sys, idx) {
        var p = pres(sys.id);
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'card-sys';
        card.setAttribute('aria-label', 'Probar ' + sys.name + ': ' + p.pregunta);

        var fig = k.el('div', 'card-fig');
        fig.appendChild(ilustracion(sys.id));
        card.appendChild(fig);

        var body = k.el('div', 'card-body');
        body.appendChild(k.txt('span', 'card-tag mono', sys.name));
        body.appendChild(k.txt('h3', null, p.pregunta));
        body.appendChild(k.txt('p', null, p.gancho));
        body.appendChild(k.txt('span', 'card-go mono', 'PROBARLO →'));
        card.appendChild(body);

        card.addEventListener('click', function () { abrir(idx, true); });
        galeria.appendChild(card);
        tarjetas[idx] = card;

        if (chipsRow) {
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip-sys mono';
            chip.textContent = sys.name;
            chip.setAttribute('aria-current', 'false');
            chip.addEventListener('click', function () { abrir(idx, true); });
            chipsRow.appendChild(chip);
            chips[idx] = chip;
        }
    });

    function fichaNode(spec) {
        var d = document.createElement('dl');
        d.className = 'ficha';
        [
            ['Qué lo dispara', spec.trigger],
            ['Con qué se conecta', spec.systems],
            ['Qué produce', spec.output],
            ['Si algo falla', spec.failure]
        ].forEach(function (row) {
            if (!row[1]) return;
            var c = document.createElement('div');
            c.appendChild(k.txt('dt', null, row[0]));
            c.appendChild(k.txt('dd', null, row[1]));
            d.appendChild(c);
        });
        return d;
    }

    function impactNode(items) {
        var w = k.el('div', 'impact');
        items.forEach(function (a) {
            var d = document.createElement('div');
            d.appendChild(k.txt('b', null, a[0]));
            d.appendChild(document.createTextNode(a[1]));
            w.appendChild(d);
        });
        return w;
    }

    /* Lo denso vive plegado: quien quiera el detalle lo abre. */
    function detalle(resumen, contenido) {
        var d = document.createElement('details');
        d.className = 'detalle';
        var s = document.createElement('summary');
        s.className = 'mono';
        s.textContent = resumen;
        d.appendChild(s);
        var body = k.el('div', 'detalle-body');
        body.appendChild(contenido);
        d.appendChild(body);
        return d;
    }

    function abrir(i, desplazar) {
        if (!list[i]) return;
        if (i === current) {
            if (desplazar && escenario) escenario.scrollIntoView({ behavior: LAB.reduce ? 'auto' : 'smooth', block: 'start' });
            return;
        }
        current = i;
        LAB.disposeCharts();
        chips.forEach(function (c, j) { if (c) c.setAttribute('aria-current', j === i ? 'true' : 'false'); });
        tarjetas.forEach(function (c, j) { if (c) c.classList.toggle('is-open', j === i); });

        var sys = list[i];
        var p = pres(sys.id);
        stage.innerHTML = '';
        var wrap = k.el('div', 'stack');
        stage.appendChild(wrap);

        /* Encabezado humano: la pregunta manda, el nombre es un sello. */
        var head = k.el('div', 'stage-head');
        var fila = k.el('div', 'stage-head-top');
        fila.appendChild(k.txt('span', 'card-tag mono', sys.name));
        fila.appendChild(k.txt('span', 'stage-fam mono', sys.tagline));
        head.appendChild(fila);
        head.appendChild(k.txt('h3', null, p.pregunta));
        var guia = k.el('p', 'stage-guia');
        guia.appendChild(k.txt('span', 'guia-icono', '→'));
        guia.appendChild(k.txt('span', null, p.gancho));
        head.appendChild(guia);
        wrap.appendChild(head);

        var host = k.el('div', 'stack');
        wrap.appendChild(host);

        try {
            sys.render(host, k);
        } catch (err) {
            host.appendChild(k.el('div', 'panel pad',
                '<span class="mono">No se pudo cargar esta demostración.</span>'));
            if (window.console) console.warn('[lab]', sys.id, err);
        }

        /* Detalle técnico plegado: ficha + explicación larga original. */
        var fondo = k.el('div', 'stack');
        if (sys.intro) {
            var t = k.txt('p', 'detalle-intro', sys.intro);
            fondo.appendChild(t);
        }
        if (sys.spec) fondo.appendChild(fichaNode(sys.spec));
        if (sys.impact && sys.impact.length) fondo.appendChild(impactNode(sys.impact));
        wrap.appendChild(detalle('¿Cómo está construido? · ficha técnica', fondo));

        var url = '#' + sys.id;
        if (location.hash !== url) history.replaceState(null, '', url);
        if (desplazar && escenario) {
            escenario.scrollIntoView({ behavior: LAB.reduce ? 'auto' : 'smooth', block: 'start' });
        }
    }

    function desdeHash() {
        var h = (location.hash || '').replace('#', '');
        return list.findIndex(function (s) { return s.id === h; });
    }

    var inicio = desdeHash();
    abrir(inicio >= 0 ? inicio : 0, false);
    if (inicio >= 0 && escenario) {
        requestAnimationFrame(function () { escenario.scrollIntoView({ behavior: 'auto', block: 'start' }); });
    }

    window.addEventListener('hashchange', function () {
        var idx = desdeHash();
        if (idx >= 0) abrir(idx, false);
    });

    /* ---------- PRISMA, fuera de la galería ---------- */
    var heroSys = LAB.systems.find(function (s) { return s.family === 'hero'; });
    var heroHost = document.getElementById('heroSystem');
    if (heroSys && heroHost) {
        try {
            heroSys.render(heroHost, k);
        } catch (err) {
            heroHost.appendChild(k.el('div', 'panel pad',
                '<span class="mono">No se pudo cargar el motor de tableros.</span>'));
            if (window.console) console.warn('[lab] hero', err);
        }
        var fondoP = k.el('div', 'stack');
        if (heroSys.intro) fondoP.appendChild(k.txt('p', 'detalle-intro', heroSys.intro));
        if (heroSys.spec) fondoP.appendChild(fichaNode(heroSys.spec));
        if (heroSys.impact) fondoP.appendChild(impactNode(heroSys.impact));
        heroHost.appendChild(detalle('¿Cómo está construido? · ficha técnica', fondoP));
    }
})();
