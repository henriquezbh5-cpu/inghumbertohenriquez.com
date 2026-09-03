/* ============================================================
   LABORATORIO — NÚCLEO COMPARTIDO
   Define window.LAB: registro de sistemas + kit de construcción.
   Todos los simuladores se escriben contra este kit para que el
   laboratorio entero se vea y se comporte como una sola pieza.

   Cargar SIEMPRE antes que los archivos de sys/ (defer conserva
   el orden). lab-boot.js va al final y monta la interfaz.
   ============================================================ */
(function () {
    'use strict';

    /* ---------- paleta: los mismos tokens de cv.css ---------- */
    var C = {
        teal: '#2DD4BF', cyan: '#38BDF8', blue: '#5BA8E8', violet: '#A78BFA',
        amber: '#FBBF24', green: '#34D399', rose: '#F472B6',
        ink: '#E8F0F9', body: '#A9BCD3', label: '#6C82A0',
        line: 'rgba(148,180,220,.16)', soft: 'rgba(148,180,220,.09)',
        panel: 'rgba(148,180,220,.08)', bg2: '#0D1729'
    };
    /* Serie categórica en orden fijo. Verde/ámbar/rosa quedan
       reservados para estado, nunca como quinta serie. */
    var CAT = [C.teal, C.violet, C.amber, C.cyan];

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- utilidades base ---------- */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }
    function txt(tag, cls, s) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (s != null) n.textContent = s;
        return n;
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function fmt(n, d) {
        if (n == null || isNaN(n)) return '—';
        if (d == null) d = Math.abs(n) >= 1000 ? 0 : (Math.abs(n) >= 10 ? 1 : 2);
        return n.toLocaleString('es-SV', { minimumFractionDigits: d, maximumFractionDigits: d });
    }
    function money(n) { return '$' + fmt(n, 0); }
    function pct(n, d) { return fmt(n, d == null ? 1 : d) + '%'; }

    /* Generador con semilla: todo visitante ve exactamente los
       mismos números, y la página sigue siendo reproducible. */
    function rng(seed) {
        var s = seed >>> 0;
        return function () {
            s = (s * 1664525 + 1013904223) % 4294967296;
            return s / 4294967296;
        };
    }
    function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

    function wait(ms) {
        return new Promise(function (res) { setTimeout(res, reduce ? 0 : ms); });
    }

    /* Reloj simulado: los registros de ejecución no deben depender
       de la hora real del visitante para leerse coherentes. */
    function stamp() {
        var d = new Date();
        return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    /* ---------- piezas de interfaz ---------- */

    /* Encabezado de sistema: título + qué hace. */
    function head(title, desc) {
        var w = el('div', 'stage-head');
        var l = el('div');
        l.appendChild(txt('h3', null, title));
        l.appendChild(txt('p', null, desc));
        w.appendChild(l);
        return w;
    }

    /* Panel neutro con relleno. */
    function panel(cls) {
        return el('div', 'panel pad' + (cls ? ' ' + cls : ''));
    }

    /* Barra de controles declarativa.
       spec: [{k:'monto', t:'range', label:'Monto', min, max, step, value, suffix}
              {k:'area',  t:'select', label:'Área', options:['A','B']}
              {k:'nuevo', t:'check',  label:'Proveedor nuevo', value:false}
              {k:'nota',  t:'text',   label:'Texto', value:'', grow:true}
              {k:'run',   t:'button', label:'Ejecutar', primary:true}]
       Devuelve { node, get(k), set(k,v), on(fn), onClick(k,fn), disable(b) } */
    function controls(spec) {
        var node = el('div', 'panel pad');
        var bar = el('div', 'ctl');
        node.appendChild(bar);
        var refs = {}, buttons = {}, listeners = [];

        spec.forEach(function (s) {
            if (s.t === 'button') {
                var b = txt('button', 'btn' + (s.primary ? ' primary' : ''), s.label);
                b.type = 'button';
                if (s.right !== false) b.style.marginLeft = 'auto';
                buttons[s.k] = b;
                bar.appendChild(b);
                return;
            }
            var f = el('div', 'field' + (s.grow ? ' grow' : ''));
            var lab;
            if (s.t === 'check') {
                f.appendChild(txt('span', null, ' '));
                lab = el('label', 'check');
                var cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = !!s.value;
                cb.id = 'ctl-' + s.k + '-' + Math.floor(Math.random() * 1e6);
                lab.appendChild(cb);
                lab.appendChild(txt('span', null, s.label));
                f.appendChild(lab);
                refs[s.k] = cb;
            } else {
                var id = 'ctl-' + s.k + '-' + Math.floor(Math.random() * 1e6);
                var sp = txt('span', null, s.label);
                sp.setAttribute('for', id);
                f.appendChild(sp);
                var input;
                if (s.t === 'select') {
                    input = document.createElement('select');
                    (s.options || []).forEach(function (o) {
                        var v = typeof o === 'object' ? o.v : o;
                        var t = typeof o === 'object' ? o.t : o;
                        input.appendChild(new Option(t, v));
                    });
                    if (s.value != null) input.value = s.value;
                } else if (s.t === 'range') {
                    input = document.createElement('input');
                    input.type = 'range';
                    input.min = s.min; input.max = s.max; input.step = s.step || 1;
                    input.value = s.value;
                } else if (s.t === 'textarea') {
                    input = document.createElement('textarea');
                    input.rows = s.rows || 3;
                    input.value = s.value || '';
                } else {
                    input = document.createElement('input');
                    input.type = 'text';
                    input.value = s.value || '';
                    if (s.placeholder) input.placeholder = s.placeholder;
                }
                input.id = id;
                f.appendChild(input);
                refs[s.k] = input;
                if (s.t === 'range' && s.readout !== false) {
                    var out = txt('span', 'ctl-out mono', '');
                    f.appendChild(out);
                    refs['__out_' + s.k] = out;
                    refs['__sfx_' + s.k] = s.suffix || '';
                    refs['__dec_' + s.k] = s.decimals == null ? 0 : s.decimals;
                }
            }
            bar.appendChild(f);
        });

        function get(k) {
            var r = refs[k];
            if (!r) return null;
            if (r.type === 'checkbox') return r.checked;
            if (r.type === 'range') return +r.value;
            return r.value;
        }
        function syncOuts() {
            Object.keys(refs).forEach(function (k) {
                if (k.indexOf('__out_') !== 0) return;
                var key = k.slice(6);
                refs[k].textContent = fmt(+refs[key].value, refs['__dec_' + key]) + (refs['__sfx_' + key] ? ' ' + refs['__sfx_' + key] : '');
            });
        }
        function fire() { syncOuts(); listeners.forEach(function (fn) { fn(get); }); }

        Object.keys(refs).forEach(function (k) {
            if (k.indexOf('__') === 0) return;
            var ev = (refs[k].tagName === 'SELECT' || refs[k].type === 'checkbox') ? 'change' : 'input';
            refs[k].addEventListener(ev, fire);
        });
        syncOuts();

        return {
            node: node,
            bar: bar,
            get: get,
            set: function (k, v) {
                var r = refs[k]; if (!r) return;
                if (r.type === 'checkbox') r.checked = !!v; else r.value = v;
                syncOuts();
            },
            on: function (fn) { listeners.push(fn); return this; },
            onClick: function (k, fn) {
                if (buttons[k]) buttons[k].addEventListener('click', function () { fn(get, buttons[k]); });
                return this;
            },
            button: function (k) { return buttons[k]; },
            busy: function (k, b) {
                var btn = buttons[k]; if (!btn) return;
                btn.disabled = !!b;
                btn.classList.toggle('is-busy', !!b);
            }
        };
    }

    /* Fila de indicadores. items: [[label, value, tone]] con tone
       en '', 'up', 'warn', 'bad'. Devuelve { node, set(i,v,tone) }. */
    function kpis(items) {
        var w = el('div', 'kpis');
        items.forEach(function (a) {
            var d = el('div', 'kpi' + (a[2] ? ' ' + a[2] : ''));
            d.appendChild(txt('div', 'v', a[1] == null ? '—' : a[1]));
            d.appendChild(txt('div', 'k', a[0]));
            w.appendChild(d);
        });
        return {
            node: w,
            set: function (i, v, tone) {
                var d = w.children[i];
                if (!d) return;
                d.children[0].textContent = v;
                if (tone !== undefined) d.className = 'kpi' + (tone ? ' ' + tone : '');
            },
            html: function (i, h) { if (w.children[i]) w.children[i].children[0].innerHTML = h; }
        };
    }

    /* Consola de ejecución con sello de hora. */
    function logbox(h) {
        var box = el('div', 'log');
        if (h) box.style.height = h;
        return {
            node: box,
            push: function (cls, s) {
                var line = el('div');
                line.appendChild(txt('span', 't', stamp()));
                line.appendChild(txt('span', cls, s));
                box.appendChild(line);
                box.scrollTop = box.scrollHeight;
                return line;
            },
            clear: function () { box.innerHTML = ''; }
        };
    }

    /* Tabla. cols: [{t:'Título', r:true}] rows: [[celda,...]]
       Una celda puede ser {html:'<span…>'} para marcado propio. */
    function table(cols, rows) {
        var wrap = el('div', 'tw');
        var t = document.createElement('table');
        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        cols.forEach(function (c) { tr.appendChild(txt('th', c.r ? 'r' : null, c.t)); });
        thead.appendChild(tr);
        t.appendChild(thead);
        var tb = document.createElement('tbody');
        (rows || []).forEach(function (r) {
            var row = document.createElement('tr');
            r.forEach(function (cell, i) {
                var td;
                if (cell && typeof cell === 'object' && cell.html != null) {
                    td = el('td', cols[i] && cols[i].r ? 'r' : null, cell.html);
                } else {
                    td = txt('td', cols[i] && cols[i].r ? 'r' : null, cell == null ? '' : String(cell));
                }
                row.appendChild(td);
            });
            tb.appendChild(row);
        });
        t.appendChild(tb);
        wrap.appendChild(t);
        return { node: wrap, body: tb, table: t };
    }

    /* Etiqueta de estado. tone: ok | warn | bad | idle | run */
    function pill(tone, label) {
        return '<span class="pill p-' + tone + '">' + escapeHtml(label) + '</span>';
    }

    /* Lista de pasos con estado. Devuelve { node, set(i,state,ms) }. */
    function steps(list) {
        var w = el('div', 'steps');
        list.forEach(function (s, i) {
            var d = el('div', 'step');
            d.appendChild(txt('div', 'b', String(i + 1)));
            d.appendChild(txt('div', 'n', typeof s === 'string' ? s : s.n));
            d.appendChild(txt('div', 'ms', (typeof s === 'object' && s.ms) ? s.ms : '—'));
            w.appendChild(d);
        });
        return {
            node: w,
            count: list.length,
            label: function (i) { return w.children[i] ? w.children[i].children[1].textContent : ''; },
            set: function (i, state, ms) {
                var d = w.children[i]; if (!d) return;
                d.className = 'step' + (state ? ' ' + state : '');
                if (ms != null) d.children[2].textContent = ms;
            },
            reset: function () {
                Array.prototype.forEach.call(w.children, function (d) {
                    d.className = 'step';
                    d.children[2].textContent = '—';
                });
            }
        };
    }

    /* Cadena de nodos horizontal (pipelines de datos). */
    function pipe(nodes) {
        var w = el('div', 'pipe');
        nodes.forEach(function (n) {
            var d = el('div', 'node');
            d.appendChild(txt('div', 'nn', n.n));
            d.appendChild(txt('div', 'nm', n.m || ''));
            d.appendChild(txt('div', 'nv', ''));
            w.appendChild(d);
        });
        return {
            node: w,
            set: function (i, state, value) {
                var d = w.children[i]; if (!d) return;
                d.className = 'node' + (state ? ' ' + state : '');
                if (value != null) d.children[2].textContent = value;
            },
            name: function (i) { return w.children[i] ? w.children[i].children[0].textContent : ''; },
            reset: function () {
                Array.prototype.forEach.call(w.children, function (d) {
                    d.className = 'node';
                    d.children[2].textContent = '';
                });
            }
        };
    }

    /* Barras horizontales comparativas. */
    function bars() {
        var w = el('div', 'bars');
        return {
            node: w,
            clear: function () { w.innerHTML = ''; },
            add: function (label, val, max, color, text) {
                var b = el('div', 'bar');
                b.appendChild(txt('div', 'bl', label));
                var t = el('div', 'track'), f = el('div', 'fill');
                f.style.width = Math.max(1.5, max ? (val / max * 100) : 0) + '%';
                f.style.background = color || C.teal;
                t.appendChild(f);
                b.appendChild(t);
                b.appendChild(txt('div', 'val', text != null ? text : fmt(val, 0)));
                w.appendChild(b);
                return b;
            }
        };
    }

    /* Conclusiones escritas. tone: teal|cyan|violet|amber|green|rose */
    function insights() {
        var w = el('div', 'insights');
        return {
            node: w,
            clear: function () { w.innerHTML = ''; },
            add: function (tone, glyph, html) {
                var d = el('div', 'insight');
                var i = txt('div', 'ico', glyph);
                i.style.color = 'var(--' + tone + ')';
                i.style.background = 'color-mix(in srgb, var(--' + tone + ') 15%, transparent)';
                d.appendChild(i);
                d.appendChild(el('div', 'itxt', html));
                w.appendChild(d);
            }
        };
    }

    /* Caja de gráfica con título y pie. Devuelve { node, canvas }. */
    function chartbox(title, cap, h) {
        var b = el('div', 'chartbox');
        b.appendChild(txt('h4', null, title));
        var c = txt('div', 'cap', cap || '');
        b.appendChild(c);
        var cv = el('div', 'cv');
        if (h) cv.style.height = h;
        var canvas = document.createElement('canvas');
        cv.appendChild(canvas);
        b.appendChild(cv);
        return {
            node: b, canvas: canvas, holder: cv,
            title: function (s) { b.children[0].textContent = s; },
            cap: function (s) { c.textContent = s; }
        };
    }

    /* ---------- Chart.js: registro y limpieza ---------- */
    var CHARTS = [];
    function chartDefaults() {
        if (!window.Chart || window.Chart.__labReady) return;
        var D = window.Chart.defaults;
        D.font.family = "Inter, 'Segoe UI', sans-serif";
        D.font.size = 11.5;
        D.color = C.label;
        D.borderColor = C.soft;
        D.maintainAspectRatio = false;
        D.animation = reduce ? false : { duration: 700, easing: 'easeOutCubic' };
        D.plugins.tooltip.backgroundColor = '#0B1524';
        D.plugins.tooltip.borderColor = C.line;
        D.plugins.tooltip.borderWidth = 1;
        D.plugins.tooltip.titleColor = C.ink;
        D.plugins.tooltip.bodyColor = C.body;
        D.plugins.tooltip.padding = 10;
        D.plugins.tooltip.cornerRadius = 8;
        D.plugins.tooltip.boxWidth = 9;
        D.plugins.tooltip.boxHeight = 9;
        D.plugins.tooltip.usePointStyle = true;
        D.plugins.legend.labels.boxWidth = 9;
        D.plugins.legend.labels.boxHeight = 9;
        D.plugins.legend.labels.usePointStyle = true;
        D.plugins.legend.labels.pointStyle = 'circle';
        D.plugins.legend.labels.padding = 12;
        window.Chart.__labReady = true;
    }
    var AXIS = {
        grid: { color: C.soft, drawTicks: false },
        border: { display: false },
        ticks: { padding: 8 }
    };
    var AXIS_BARE = { grid: { display: false }, border: { display: false }, ticks: { padding: 8 } };

    /* opts.track === false para las gráficas que viven fuera de la consola
       (PRISMA): esas se destruyen solas y no deben morir cuando el visitante
       cambia de sistema en el riel. */
    function chart(canvas, cfg, opts) {
        if (!window.Chart) {
            var holder = canvas.parentNode;
            if (holder) holder.innerHTML = '<div class="chart-off mono">gráfica no disponible</div>';
            return null;
        }
        chartDefaults();
        /* Chart.js deja canvas en null al destruir: aprovechamos eso para
           purgar las instancias muertas de los sistemas que se repintan. */
        CHARTS = CHARTS.filter(function (x) { return x && x.canvas; });
        var c = new window.Chart(canvas, cfg);
        if (!opts || opts.track !== false) CHARTS.push(c);
        return c;
    }
    /* Destruir una gráfica con la animación en vuelo deja al animador de
       Chart.js invocando un callback ya liberado, y el error sale por su
       propio rAF: ningún try/catch nuestro lo atrapa. Hay que sacarla del
       animador ANTES de destruirla. */
    function killChart(c) {
        if (!c) return;
        try {
            if (window.Chart && window.Chart.animator) window.Chart.animator.remove(c);
        } catch (e) { /* animador no disponible */ }
        try { c.stop(); } catch (e) { /* sin animación activa */ }
        try { c.destroy(); } catch (e) { /* ya destruida */ }
        /* Un sistema puede tener un await en vuelo y llamar update() sobre
           esta gráfica ya muerta cuando el visitante cambió de pestaña.
           Un `if (ch)` no lo detecta —el objeto sigue existiendo—, así que
           la dejamos inerte en lugar de dejar que reviente. */
        try {
            c.update = function () { };
            c.resize = function () { };
            c.render = function () { };
        } catch (e) { /* objeto sellado */ }
    }
    function disposeCharts() {
        CHARTS.forEach(killChart);
        CHARTS = [];
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    /* ---------- registro de sistemas ---------- */
    var SYSTEMS = [];
    var FAMILIES = [
        { id: 'procesos', n: 'Procesos que aprueban y concilian', d: 'Reglas, firmas, dinero y expedientes', dot: 'd-violet' },
        { id: 'datos', n: 'Datos y decisión', d: 'Del archivo crudo al número que se defiende', dot: 'd-teal' },
        { id: 'agentes', n: 'Agentes y operación', d: 'Lo que atiende, enruta y sale a campo', dot: 'd-cyan' }
    ];

    function register(sys) {
        if (!sys || !sys.id || typeof sys.render !== 'function') return;
        SYSTEMS.push(sys);
    }

    window.LAB = {
        C: C, CAT: CAT, AXIS: AXIS, AXIS_BARE: AXIS_BARE,
        reduce: reduce,
        register: register,
        systems: SYSTEMS,
        families: FAMILIES,
        disposeCharts: disposeCharts,
        killChart: killChart,
        kit: {
            $: $, $$: $$, el: el, txt: txt,
            fmt: fmt, money: money, pct: pct, pad: pad,
            rng: rng, pick: pick, wait: wait, stamp: stamp,
            reduce: reduce,
            C: C, CAT: CAT, AXIS: AXIS, AXIS_BARE: AXIS_BARE,
            head: head, panel: panel, controls: controls, kpis: kpis,
            log: logbox, table: table, pill: pill, steps: steps,
            pipe: pipe, bars: bars, insights: insights,
            chartbox: chartbox, chart: chart, killChart: killChart,
            escapeHtml: escapeHtml
        }
    };
})();
