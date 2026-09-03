/* ============================================================
   LABORATORIO — arranque
   Monta el riel de sistemas, resuelve el ancla de la URL y
   renderiza el sistema activo. Va al final de los <script defer>.
   ============================================================ */
(function () {
    'use strict';

    var LAB = window.LAB;
    if (!LAB) return;
    var k = LAB.kit;

    /* ---------- red de seguridad de revelado ----------
       Regla dura del sitio: nada que deba leerse se queda en
       opacity:0 esperando al observador. */
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

    /* Red geométrica, independiente del observador: nada visible en
       pantalla se queda en opacity:0, pero lo de más abajo conserva su
       aparición al desplazar. */
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
    var pendiente = false;
    window.addEventListener('scroll', function () {
        if (pendiente) return;
        pendiente = true;
        setTimeout(function () { pendiente = false; revealVisibles(); }, 400);
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

    /* revelado normal por scroll */
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

    /* ---------- menú móvil (mismo contrato que el sitio) ---------- */
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

    /* ---------- consola de sistemas ---------- */
    var rail = document.getElementById('railSys');
    var stage = document.getElementById('stage');
    if (!rail || !stage) return;

    /* El riel manda: la lista se ordena por familia para que el primer
       botón sea siempre el sistema que se muestra al abrir. */
    var pendientes = LAB.systems.filter(function (s) { return s.family !== 'hero'; });
    var list = [];
    LAB.families.forEach(function (fam) {
        pendientes.forEach(function (s) { if (s.family === fam.id) list.push(s); });
    });
    pendientes.forEach(function (s) { if (list.indexOf(s) < 0) list.push(s); });

    var buttons = [];
    var current = -1;

    LAB.families.forEach(function (fam) {
        var mine = list.filter(function (s) { return s.family === fam.id; });
        if (!mine.length) return;
        rail.appendChild(k.txt('div', 'rail-fam', fam.n));
        mine.forEach(function (sys) {
            var idx = list.indexOf(sys);
            var b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-current', 'false');
            b.appendChild(k.txt('span', 'rn', sys.name));
            b.appendChild(k.txt('span', 'rd', sys.tagline));
            b.addEventListener('click', function () { show(idx, true); });
            rail.appendChild(b);
            buttons[idx] = b;
        });
    });

    function fichaNode(spec) {
        var d = document.createElement('dl');
        d.className = 'ficha';
        [
            ['Disparador', spec.trigger],
            ['Sistemas conectados', spec.systems],
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

    function show(i, push) {
        if (i === current || !list[i]) return;
        current = i;
        LAB.disposeCharts();
        buttons.forEach(function (b, j) { if (b) b.setAttribute('aria-current', j === i ? 'true' : 'false'); });

        var sys = list[i];
        stage.innerHTML = '';
        var wrap = k.el('div', 'stack');
        stage.appendChild(wrap);

        wrap.appendChild(k.head(sys.title, sys.intro));

        var host = k.el('div', 'stack');
        wrap.appendChild(host);

        try {
            sys.render(host, k);
        } catch (err) {
            host.appendChild(k.el('div', 'panel pad',
                '<span class="mono">No se pudo cargar esta demostración.</span>'));
            if (window.console) console.warn('[lab]', sys.id, err);
        }

        if (sys.spec) {
            var fw = k.el('div', 'panel pad');
            fw.appendChild(k.txt('div', 'mono-head', 'Ficha técnica — así está construido'));
            fw.appendChild(fichaNode(sys.spec));
            wrap.appendChild(fw);
        }
        if (sys.impact && sys.impact.length) wrap.appendChild(impactNode(sys.impact));

        if (push) {
            var url = '#' + sys.id;
            if (location.hash !== url) history.replaceState(null, '', url);
        }
    }

    function fromHash() {
        var h = (location.hash || '').replace('#', '');
        var idx = list.findIndex(function (s) { return s.id === h; });
        return idx;
    }

    var start = fromHash();
    show(start >= 0 ? start : 0, false);
    if (start >= 0) {
        var c = document.getElementById('consola');
        if (c) requestAnimationFrame(function () { c.scrollIntoView({ behavior: 'auto', block: 'start' }); });
    }

    window.addEventListener('hashchange', function () {
        var idx = fromHash();
        if (idx >= 0) show(idx, false);
    });

    /* ---------- sistema destacado fuera de la consola ---------- */
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
        if (heroSys.spec) {
            var hw = k.el('div', 'panel pad');
            hw.appendChild(k.txt('div', 'mono-head', 'Ficha técnica — así está construido'));
            hw.appendChild(fichaNode(heroSys.spec));
            heroHost.appendChild(hw);
        }
        if (heroSys.impact) heroHost.appendChild(impactNode(heroSys.impact));
    }
})();
