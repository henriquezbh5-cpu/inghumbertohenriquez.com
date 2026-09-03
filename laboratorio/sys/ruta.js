(function () {
    'use strict';
    var LAB = window.LAB;
    var NS = 'http://www.w3.org/2000/svg';
    var C = LAB.C;

    /* ---------- geometría del mapa y calibración del modelo ---------- */
    var W = 640, H = 340;
    var DEP = { x: 56, y: 292 };                  /* centro de distribución */
    var Z = { x: 342, y: 166, w: 236, h: 142 };   /* zona sin cobertura */
    var KM_PX = 0.046;                            /* píxel del mapa a kilómetro de calle */
    var VEL = 28;                                 /* km/h promedio con tráfico urbano */
    var INICIO = 8 * 60;                          /* la jornada arranca a las 08:00 */
    var TOL = 30;                                 /* minutos que el técnico espera si llega antes */
    var TURNO = 9 * 60;                           /* jornada máxima de una unidad */
    var EN_ZONA = { 2: 1, 5: 1, 9: 1 };           /* paradas que caen dentro de la zona */
    var CERRADO = 3;                              /* cliente que hoy no recibe */
    var RANK = { Alta: 0, Media: 1, Baja: 2 };
    var NOM = { corta: 'Ruta más corta', prioridad: 'Prioridad del cliente', ventana: 'Ventana horaria' };
    var CRITS = ['corta', 'prioridad', 'ventana'];

    var CLIENTES = [
        'Ferretería El Amate', 'Farmacia San Jacinto', 'Abarrotería La Cumbre',
        'Clínica Los Almendros', 'Panadería Doña Tere', 'Repuestos El Volcán',
        'Librería El Portal', 'Taller Mecánico Rivas', 'Supermercado La Ceiba',
        'Distribuidora El Trébol', 'Cafetería Buena Vista', 'Óptica Villa Nueva',
        'Veterinaria San Marcos', 'Bodega El Pital'
    ];

    /* estados del marcador en el mapa: trazo, relleno, color y texto siempre juntos */
    var MST = {
        pend: { s: 'rgba(148,180,220,.42)', f: '#0B1524', c: C.label, t: 'pendiente' },
        fuera: { s: 'rgba(251,191,36,.55)', f: '#0B1524', c: C.amber, t: 'fuera de ventana' },
        ruta: { s: C.amber, f: 'rgba(251,191,36,.14)', c: C.amber, t: 'en ruta' },
        ok: { s: C.green, f: 'rgba(52,211,153,.16)', c: C.green, t: 'entregada' },
        cola: { s: C.green, f: 'rgba(52,211,153,.16)', c: C.amber, t: 'entregada · en cola' },
        repr: { s: C.rose, f: 'rgba(244,114,182,.16)', c: C.rose, t: 'reprogramada' }
    };

    function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

    /* Punto dentro o fuera de la zona sin cobertura, sin encimar marcadores. */
    function punto(r, dentro, usados) {
        var cand = null, i, t, x, y, ok;
        for (t = 0; t < 90; t++) {
            if (dentro) { x = Z.x + 26 + r() * (Z.w - 52); y = Z.y + 26 + r() * (Z.h - 52); }
            else {
                x = 104 + r() * 470; y = 42 + r() * 232;
                if (x > Z.x - 16 && x < Z.x + Z.w + 16 && y > Z.y - 16 && y < Z.y + Z.h + 16) continue;
            }
            cand = { x: Math.round(x), y: Math.round(y) };
            ok = true;
            for (i = 0; i < usados.length; i++) if (dist(usados[i], cand) < 54) { ok = false; break; }
            if (ok) return cand;
        }
        return cand || { x: 300, y: 150 };
    }

    /* ---------- datos sintéticos con semilla fija ---------- */
    function datos() {
        var r = LAB.kit.rng(51204), usados = [DEP], out = [], i, p, bloque;
        for (i = 0; i < CLIENTES.length; i++) {
            p = punto(r, !!EN_ZONA[i], usados);
            usados.push(p);
            bloque = Math.floor(r() * 5);              /* ventanas de 3 h entre 08:00 y 15:00 */
            out.push({
                id: i, cli: CLIENTES[i], x: p.x, y: p.y,
                ini: INICIO + bloque * 60, fin: INICIO + bloque * 60 + 180,
                pri: LAB.kit.pick(r, ['Alta', 'Media', 'Media', 'Baja', 'Alta', 'Baja']),
                serv: 8 + Math.round(r() * 9),
                bultos: 1 + Math.round(r() * 8),
                zona: !!EN_ZONA[i], cerrado: i === CERRADO
            });
        }
        return out;
    }
    var BASE = datos();

    /* Redondear ANTES de partir en horas y minutos: si no, 59.7 min imprime ':60'. */
    function hhmm(m) {
        var q = Math.round(m);
        return LAB.kit.pad(Math.floor(q / 60) % 24) + ':' + LAB.kit.pad(q % 60);
    }
    function dur(m) {
        var q = Math.round(m), h = Math.floor(q / 60), r = q % 60;
        if (!h) return q + ' min';
        return r ? h + ' h ' + LAB.kit.pad(r) + ' min' : h + ' h';
    }
    function ventana(s) { return hhmm(s.ini) + ' – ' + hhmm(s.fin); }
    function sello(s) { return hhmm(s.llegada + s.espera + s.serv); }
    function motivoTexto(s) {
        if (s.motivo === 'ant') return 'fuera de ventana, ' + dur(s.ini - s.llegada) + ' antes de abrir';
        if (s.motivo === 'tarde') return 'fuera de ventana, ' + dur(s.llegada + s.espera - s.fin) + ' tarde';
        return s.espera ? 'dentro de ventana, espera ' + dur(s.espera) + ' a que abra' : 'dentro de ventana';
    }

    /* ---------- orden de visita ---------- */
    function largo(ruta) {
        var pts = [DEP].concat(ruta).concat([DEP]), t = 0, i;
        for (i = 1; i < pts.length; i++) t += dist(pts[i - 1], pts[i]);
        return t;
    }
    /* 2-opt sobre el vecino más cercano: sin esto la heurística a veces
       devuelve una ruta más larga que ordenar por ventana, y la barra
       "ruta más corta" quedaría mintiendo. */
    function dosOpt(ruta) {
        var l0 = largo(ruta), mejora = true, i, j, cand, l1;
        while (mejora) {
            mejora = false;
            for (i = 0; i < ruta.length - 1; i++) {
                for (j = i + 1; j < ruta.length; j++) {
                    cand = ruta.slice(0, i).concat(ruta.slice(i, j + 1).reverse(), ruta.slice(j + 1));
                    l1 = largo(cand);
                    if (l1 < l0 - 1e-9) { ruta = cand; l0 = l1; mejora = true; }
                }
            }
        }
        return ruta;
    }
    function ordenar(sel, crit) {
        var i, copia = sel.map(function (s) { return Object.assign({}, s); });
        if (crit === 'corta') {
            var libres = copia, ruta = [], cur = DEP, b, bd, d;
            while (libres.length) {
                b = 0; bd = Infinity;
                for (i = 0; i < libres.length; i++) { d = dist(cur, libres[i]); if (d < bd) { bd = d; b = i; } }
                cur = libres[b]; ruta.push(cur); libres.splice(b, 1);
            }
            return dosOpt(ruta);
        }
        if (crit === 'prioridad') copia.sort(function (a, b2) { return (RANK[a.pri] - RANK[b2.pri]) || (a.id - b2.id); });
        else copia.sort(function (a, b2) { return (a.ini - b2.ini) || (a.fin - b2.fin) || (a.id - b2.id); });
        return copia;
    }

    /* Plan completo: tramos, kilómetros y llegada por parada. El técnico espera
       hasta TOL minutos si llega antes de que abra la ventana; más que eso la
       parada queda fuera de lo comprometido, igual que llegar tarde. */
    function planificar(n, crit) {
        var ruta = ordenar(BASE.slice(0, n), crit);
        var pts = [DEP].concat(ruta).concat([DEP]);
        var legs = [], km = 0, t = INICIO, fuera = 0, espera = 0, i, d, s, antes;
        for (i = 1; i < pts.length; i++) {
            d = dist(pts[i - 1], pts[i]) * KM_PX;
            km += d; t += d / VEL * 60;
            legs.push({ a: pts[i - 1], b: pts[i], km: d, min: d / VEL * 60, vuelta: i === pts.length - 1 });
            if (i > ruta.length) break;
            s = ruta[i - 1];
            s.llegada = t;
            antes = s.ini - t;
            s.espera = antes > 0 ? Math.min(antes, TOL) : 0;
            t += s.espera; espera += s.espera;
            s.motivo = antes > TOL ? 'ant' : (t > s.fin ? 'tarde' : '');
            if (s.motivo) fuera++;
            t += s.serv;
        }
        return { ruta: ruta, legs: legs, km: km, min: t - INICIO, fuera: fuera, espera: espera, crit: crit };
    }

    /* Los tres criterios sobre el mismo número de paradas: se recalculan una
       vez por cambio de control, no una vez por parada entregada. */
    var cacheAlt = { n: -1, alt: null };
    function alternativas(n) {
        if (cacheAlt.n !== n) cacheAlt = { n: n, alt: CRITS.map(function (c) { return planificar(n, c); }) };
        return cacheAlt.alt;
    }

    function svg(tag, a) {
        var n = document.createElementNS(NS, tag), key;
        for (key in a) if (Object.prototype.hasOwnProperty.call(a, key)) n.setAttribute(key, a[key]);
        return n;
    }
    function rotulo(x, y, s, fill, size, anchor) {
        var t = svg('text', {
            x: x, y: y, fill: fill, 'font-size': size || 8.5, 'text-anchor': anchor || 'middle',
            'font-family': "'JetBrains Mono', ui-monospace, monospace", 'letter-spacing': '.02em'
        });
        t.textContent = s;
        return t;
    }

    LAB.register({
        id: 'ruta',
        name: 'RUTA',
        family: 'agentes',
        tagline: 'Operación de campo',
        title: 'Despacho y prueba de entrega desde una aplicación que no depende de la señal',
        intro: 'El despachador asigna las paradas del día y la aplicación móvil ordena la ruta, la lleva descargada y captura firma, foto y sello de hora en cada entrega. Cambia las paradas, el criterio de orden y la cobertura: el mapa, los kilómetros y las ventanas incumplidas se recalculan en vivo.',
        spec: {
            trigger: 'Asignación del despachador o la programación cargada el día anterior. La aplicación descarga el paquete del día antes de salir del centro de distribución.',
            systems: 'Aplicación móvil instalable con almacenamiento local, servicio de cálculo de rutas, backend de órdenes y almacén de evidencia con sello de hora.',
            output: 'Ruta ordenada por criterio, estado por parada y evidencia por orden: firma del receptor, foto del bulto y sello de hora con coordenada.',
            failure: 'Sin cobertura la aplicación sigue operando con los datos descargados y encola la evidencia en el dispositivo. Al volver la señal sincroniza sola, en orden y sin intervención del técnico; la orden lleva llave propia, así que reenviar la cola no duplica la entrega.'
        },
        impact: [
            ['Sin señal', 'la aplicación sigue operando'],
            ['39%', 'menos kilómetros que ordenar por regla de negocio'],
            ['100%', 'órdenes cerradas con evidencia y sello de hora']
        ],
        render: function (host, k) {
            var corrida = 0, P = null, marks = [], filas = [], legPaths = [];
            var EST = 5, EVI = 6;   /* columnas de estado y evidencia en la tabla */

            var ctl = k.controls([
                { k: 'n', t: 'range', label: 'Paradas del día', min: 4, max: 14, step: 1, value: 8 },
                {
                    k: 'crit', t: 'select', label: 'Criterio de orden', value: 'corta',
                    options: CRITS.map(function (c) { return { v: c, t: NOM[c] }; })
                },
                { k: 'off', t: 'check', label: 'Simular zona sin cobertura', value: true },
                { k: 'run', t: 'button', label: 'Despachar y recorrer', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kp = k.kpis([
                ['Paradas asignadas', '—', ''], ['Distancia estimada', '—', ''],
                ['Jornada estimada', '—', ''], ['Fuera de ventana', '—', ''], ['Órdenes con evidencia', '—', '']
            ]);
            host.appendChild(kp.node);

            /* ---------- mapa ---------- */
            var pnMapa = k.panel();
            var hMapa = k.txt('div', 'mono-head', 'Mapa del día');
            pnMapa.appendChild(hMapa);
            var mapa = k.el('div', 'routemap');
            var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
            var gGrid = svg('g'), gZona = svg('g'), gPlan = svg('g'), gViaje = svg('g'), gStops = svg('g');
            [gGrid, gZona, gPlan, gViaje, gStops].forEach(function (g) { root.appendChild(g); });
            (function () {  /* retícula de fondo y centro de distribución: se dibujan una sola vez */
                var i;
                for (i = 40; i < W; i += 40) gGrid.appendChild(svg('line', { x1: i, y1: 0, x2: i, y2: H, stroke: 'rgba(148,180,220,.055)', 'stroke-width': 1 }));
                for (i = 34; i < H; i += 34) gGrid.appendChild(svg('line', { x1: 0, y1: i, x2: W, y2: i, stroke: 'rgba(148,180,220,.055)', 'stroke-width': 1 }));
                gGrid.appendChild(svg('rect', { x: DEP.x - 11, y: DEP.y - 11, width: 22, height: 22, rx: 3, fill: 'rgba(45,212,191,.18)', stroke: C.teal, 'stroke-width': 1.6 }));
                gGrid.appendChild(rotulo(DEP.x, DEP.y + 3.5, 'CD', C.teal, 9));
                gGrid.appendChild(rotulo(DEP.x + 2, DEP.y + 26, 'centro de distribución', C.label, 8.5, 'start'));
            })();
            mapa.appendChild(root);
            pnMapa.appendChild(mapa);
            var leyenda = k.txt('div', 'mono', '');
            leyenda.style.cssText = 'font-size:10px;color:var(--label);margin-top:11px;line-height:1.6';
            pnMapa.appendChild(leyenda);
            host.appendChild(pnMapa);

            /* ---------- camino de la evidencia ---------- */
            var pnPipe = k.panel();
            pnPipe.appendChild(k.txt('div', 'mono-head', 'Camino de la evidencia'));
            var pip = k.pipe([
                { n: 'Dispositivo', m: 'Firma, foto y sello' },
                { n: 'Cola local', m: 'Guardada en el equipo' },
                { n: 'Sincronización', m: 'Reintento al volver la señal' },
                { n: 'Órdenes', m: 'Estado de la entrega' },
                { n: 'Evidencia', m: 'Archivo con sello y coordenada' }
            ]);
            pnPipe.appendChild(pip.node);
            host.appendChild(pnPipe);

            /* ---------- tabla y bitácora ---------- */
            var g1 = k.el('div', 'grid2 wide-left');
            var pnTab = k.panel();
            var hTab = k.txt('div', 'mono-head', 'Paradas');
            pnTab.appendChild(hTab);
            var hostTab = k.el('div');
            pnTab.appendChild(hostTab);
            var pnLog = k.panel();
            pnLog.appendChild(k.txt('div', 'mono-head', 'Bitácora del despacho'));
            var log = k.log('452px');
            pnLog.appendChild(log.node);
            g1.appendChild(pnTab); g1.appendChild(pnLog);
            host.appendChild(g1);

            /* ---------- comparación y lectura ---------- */
            var g2 = k.el('div', 'grid2');
            var pnBar = k.panel();
            pnBar.appendChild(k.txt('div', 'mono-head', 'Kilómetros y ventanas según el criterio de orden'));
            var bars = k.bars();
            pnBar.appendChild(bars.node);
            var notaBar = k.txt('div', 'mono', '');
            notaBar.style.cssText = 'font-size:10px;color:var(--label);margin-top:12px;line-height:1.6';
            pnBar.appendChild(notaBar);
            var pnIns = k.panel();
            pnIns.appendChild(k.txt('div', 'mono-head', 'Lectura de la jornada'));
            var ins = k.insights();
            pnIns.appendChild(ins.node);
            g2.appendChild(pnBar); g2.appendChild(pnIns);
            host.appendChild(g2);

            /* ---------- pintado del mapa ---------- */
            function pintarMapa(off) {
                gZona.innerHTML = ''; gPlan.innerHTML = ''; gViaje.innerHTML = ''; gStops.innerHTML = '';
                marks = []; legPaths = [];
                if (off) {
                    gZona.appendChild(svg('rect', {
                        x: Z.x, y: Z.y, width: Z.w, height: Z.h, rx: 10,
                        fill: 'rgba(251,191,36,.07)', stroke: 'rgba(251,191,36,.42)', 'stroke-width': 1.2, 'stroke-dasharray': '6 5'
                    }));
                    gZona.appendChild(rotulo(Z.x + 10, Z.y + 17, 'ZONA SIN COBERTURA', C.amber, 9, 'start'));
                }
                var d = 'M' + DEP.x + ' ' + DEP.y, i;
                for (i = 0; i < P.ruta.length; i++) d += ' L' + P.ruta[i].x + ' ' + P.ruta[i].y;
                d += ' L' + DEP.x + ' ' + DEP.y;
                gPlan.appendChild(svg('path', { d: d, fill: 'none', stroke: 'rgba(148,180,220,.30)', 'stroke-width': 1.4, 'stroke-dasharray': '5 5', 'stroke-linejoin': 'round' }));

                P.legs.forEach(function (lg) {   /* un trazo por tramo: se anima en secuencia */
                    var p = svg('path', {
                        d: 'M' + lg.a.x + ' ' + lg.a.y + ' L' + lg.b.x + ' ' + lg.b.y, fill: 'none',
                        stroke: lg.vuelta ? 'rgba(45,212,191,.5)' : C.teal, 'stroke-width': lg.vuelta ? 1.8 : 2.3, 'stroke-linecap': 'round'
                    });
                    var len = Math.max(1, dist(lg.a, lg.b));
                    p.style.strokeDasharray = len + ' ' + len;
                    p.style.strokeDashoffset = String(len);
                    gViaje.appendChild(p);
                    legPaths.push(p);
                });

                P.ruta.forEach(function (s, idx) {
                    var st = s.motivo ? MST.fuera : MST.pend;
                    var g = svg('g');
                    var c = svg('circle', { cx: s.x, cy: s.y, r: 12.5, fill: st.f, stroke: st.s, 'stroke-width': 1.8 });
                    var num = rotulo(s.x, s.y + 3.6, String(idx + 1), C.ink, 10.5);
                    num.setAttribute('font-weight', '600');
                    var tag = rotulo(s.x, s.y + 26, hhmm(s.llegada) + ' · ' + st.t, st.c, 8.5);
                    g.appendChild(c); g.appendChild(num); g.appendChild(tag);
                    gStops.appendChild(g);
                    marks.push({ c: c, tag: tag, base: hhmm(s.llegada) });
                });
                root.setAttribute('aria-label', 'Mapa de la jornada: centro de distribución y ' + P.ruta.length +
                    ' paradas numeradas en orden de visita, ' + k.fmt(P.km, 1) + ' kilómetros por ' + NOM[P.crit].toLowerCase() + '.');
            }

            function marcar(i, estado) {
                var m = marks[i], st = MST[estado];
                if (!m || !st) return;
                m.c.setAttribute('stroke', st.s);
                m.c.setAttribute('fill', st.f);
                if (estado === 'cola') m.c.setAttribute('stroke-dasharray', '4 3'); else m.c.removeAttribute('stroke-dasharray');
                m.tag.setAttribute('fill', st.c);
                m.tag.textContent = m.base + ' · ' + st.t;
            }

            /* ---------- tabla ---------- */
            var COLS = [{ t: '#', r: true }, { t: 'Cliente' }, { t: 'Ventana' }, { t: 'Llegada' }, { t: 'Prioridad' }, { t: 'Estado' }, { t: 'Evidencia' }];
            function pintarTabla() {
                hostTab.innerHTML = '';
                var rows = P.ruta.map(function (s, i) {
                    return [
                        String(i + 1), s.cli, ventana(s), hhmm(s.llegada) + ' · ' + motivoTexto(s), s.pri,
                        { html: k.pill('idle', 'Planificada') }, { html: k.pill('idle', 'sin capturar') }
                    ];
                });
                var t = k.table(COLS, rows);
                hostTab.appendChild(t.node);
                filas = Array.prototype.slice.call(t.body.children);
            }
            function estadoFila(i, tono, texto, evTono, evTexto) {
                var f = filas[i]; if (!f) return;
                f.children[EST].innerHTML = k.pill(tono, texto);
                if (evTexto != null) f.children[EVI].innerHTML = k.pill(evTono, evTexto);
            }

            /* ---------- camino de la evidencia ---------- */
            function pintarPipe(e) {
                var n = P.ruta.length;
                pip.set(0, e.cap ? (e.cap === n ? 'done' : 'run') : '', e.cap + ' de ' + n + ' capturadas');
                pip.set(1, e.cola ? 'run' : (e.drenada ? 'done' : ''),
                    e.cola ? e.cola + ' en cola local' : (e.drenada ? 'cola vacía' : 'sin cola'));
                pip.set(2, e.cola ? 'run' : (e.drenada ? 'done' : ''),
                    e.cola ? 'esperando señal' : (e.drenada ? e.drenada + ' sincronizadas' : 'en espera'));
                pip.set(3, e.ord ? (e.ord === n ? 'done' : 'run') : '', e.ord + ' de ' + n + ' cerradas');
                pip.set(4, e.arch ? (e.arch === n ? 'done' : 'run') : '', e.arch + ' de ' + n + ' archivadas');
            }

            /* ---------- indicadores, barras y lectura ---------- */
            function pintarSalida(e) {
                var off = ctl.get('off'), n = P.ruta.length;
                var enZona = P.ruta.filter(function (s) { return s.zona; }).length;
                /* cada tono va acompañado del texto que lo explica en la lectura
                   de la jornada y en las etiquetas de la tabla, nunca solo. */
                kp.set(0, n + ' de ' + CLIENTES.length, '');
                kp.set(1, k.fmt(P.km, 1) + ' km', '');
                kp.set(2, dur(P.min), P.min > TURNO ? 'bad' : '');
                kp.set(3, P.fuera + ' de ' + n, P.fuera ? 'warn' : 'up');
                kp.set(4, e.arch + ' de ' + n, e.arch === n ? 'up' : e.cola ? 'warn' : '');

                var alt = alternativas(n);
                var max = Math.max(alt[0].km, alt[1].km, alt[2].km);
                bars.clear();
                alt.forEach(function (a) {
                    bars.add(NOM[a.crit] + (a.crit === P.crit ? ' · actual' : ''), a.km, max,
                        a.crit === P.crit ? C.teal : 'rgba(148,180,220,.26)',
                        k.fmt(a.km, 1) + ' km · ' + a.fuera + ' fuera de ventana');
                });
                var reglas = (alt[1].km + alt[2].km) / 2;
                var ahorro = reglas > 0 ? (reglas - alt[0].km) / reglas * 100 : 0;
                notaBar.textContent = 'Ordenar por geografía recorre ' + k.pct(ahorro, 0) + ' menos kilómetros que el promedio de los dos órdenes por regla de negocio, y deja ' +
                    alt[0].fuera + ' de ' + n + ' paradas fuera de la ventana comprometida. Ordenar por ventana horaria cuesta ' +
                    k.fmt(alt[2].km - alt[0].km, 1) + ' km más y las deja en ' + alt[2].fuera + '. Ordenar por prioridad no optimiza nada: garantiza que los clientes de prioridad alta se atienden primero y paga ' +
                    k.fmt(alt[1].km - alt[0].km, 1) + ' km por esa garantía. La decisión es del despachador, no del algoritmo.';

                leyenda.textContent = 'Cuadro = centro de distribución. Círculo numerado = parada en el orden de visita, con su hora de llegada estimada. ' +
                    'Trazo punteado = plan calculado. Trazo sólido = recorrido despachado.' +
                    (off ? ' Rectángulo ámbar = zona sin cobertura, ' + enZona + (enZona === 1 ? ' parada dentro.' : ' paradas dentro.') : '');
                hMapa.textContent = 'Mapa del día — ' + n + ' paradas · ' + NOM[P.crit].toLowerCase() + ' · ' + k.fmt(P.km, 1) + ' km';
                hTab.textContent = 'Paradas — orden de visita calculado por ' + NOM[P.crit].toLowerCase();

                ins.clear();
                ins.add('teal', '>', 'Orden por <b>' + k.escapeHtml(NOM[P.crit].toLowerCase()) + '</b>: ' + k.escapeHtml(k.fmt(P.km, 1)) +
                    ' km y ' + k.escapeHtml(dur(P.min)) + ' de jornada, salida 08:00 y retorno al centro de distribución incluido.');
                if (P.fuera) ins.add('amber', '!', '<b>' + P.fuera + ' de ' + n + '</b> paradas caen fuera de la ventana comprometida: unas por llegar tarde, otras por llegar más de ' +
                    TOL + ' minutos antes de que el cliente abra. Las dos incumplen y las dos quedan registradas.');
                else ins.add('green', '=', 'Las ' + n + ' paradas llegan dentro de su ventana comprometida con este orden.');
                if (P.espera >= 20) ins.add('violet', '<', 'El técnico espera <b>' + k.escapeHtml(dur(P.espera)) +
                    '</b> en total frente a clientes que aún no abren. Esa espera es costo del orden elegido, igual que los kilómetros.');
                if (off) {
                    ins.add('violet', '+', '<b>' + enZona + (enZona === 1 ? ' parada cae' : ' paradas caen') +
                        ' en la zona sin cobertura</b>. La aplicación trabaja con el paquete descargado: órdenes, mapa y formularios. La firma y la foto se guardan en el dispositivo y se sincronizan al recuperar señal.');
                } else {
                    ins.add('cyan', '·', 'Con cobertura en toda la ruta cada evidencia viaja al almacén en el momento de la entrega. Activa la zona sin cobertura para ver qué pasa cuando no viaja.');
                }
                if (P.min > TURNO) ins.add('rose', '!', 'La jornada estimada supera las <b>9 horas</b>: con ' + n +
                    ' paradas y este criterio la ruta no cabe en un turno. El despachador la parte en dos unidades o mueve las últimas paradas al día siguiente.');
                if (P.ruta.filter(function (s) { return s.cerrado; }).length) {
                    ins.add('rose', '!', 'Una parada termina <b>reprogramada</b> por cliente cerrado. No se pierde: se registra motivo del catálogo, foto del punto y reagenda para el día siguiente en la misma ventana.');
                }
            }

            var VACIO = { cap: 0, cola: 0, drenada: 0, ord: 0, arch: 0 };
            function refrescar(silencioso) {
                P = planificar(ctl.get('n'), ctl.get('crit'));
                pintarMapa(ctl.get('off'));
                pintarTabla();
                pintarPipe(VACIO);
                pintarSalida(VACIO);
                if (silencioso) return;
                log.clear();
                log.push('in', 'Programación del día anterior recibida: ' + P.ruta.length + ' paradas asignadas al técnico de campo.');
                log.push('in', 'Orden calculado por ' + NOM[P.crit].toLowerCase() + ': ' + k.fmt(P.km, 1) + ' km, ' +
                    dur(P.min) + ' de jornada y ' + P.fuera + ' parada' + (P.fuera === 1 ? '' : 's') + ' fuera de ventana.');
                log.push('wa', 'Ruta en estado planificado. Pulsá "Despachar y recorrer" para enviarla al dispositivo y seguir la jornada parada por parada.');
            }

            /* Revela el tramo con stroke-dashoffset; con movimiento reducido salta al final. */
            function trazo(p, ms) {
                var len = 0;
                if (!p) return k.wait(0);
                try { len = p.getTotalLength(); } catch (e) { len = 0; }
                if (!len) { p.style.strokeDashoffset = '0'; return k.wait(ms); }
                p.style.strokeDasharray = len + ' ' + len;
                p.style.strokeDashoffset = String(len);
                if (k.reduce) { p.style.strokeDashoffset = '0'; return k.wait(0); }
                p.getBoundingClientRect();
                p.style.transition = 'stroke-dashoffset ' + ms + 'ms linear';
                p.style.strokeDashoffset = '0';
                return k.wait(ms);
            }

            async function despachar() {
                var mi = ++corrida;                      /* cualquier cambio de control invalida esta corrida */
                ctl.busy('run', true);
                refrescar(true);
                var off = ctl.get('off'), n = P.ruta.length;
                var e = { cap: 0, cola: 0, drenada: 0, ord: 0, arch: 0 };
                var enCola = [], entregadas = 0, repro = 0, i, s;

                log.clear();
                log.push('in', 'Despacho iniciado: ' + n + ' órdenes firmadas por el despachador y enviadas al dispositivo.');
                await k.wait(320); if (mi !== corrida) return;
                log.push('ok', 'Paquete del día descargado: órdenes, mapa de la zona, formularios de entrega y catálogo de motivos. La aplicación ya no necesita red para operar.');
                await k.wait(320); if (mi !== corrida) return;
                if (off) log.push('wa', 'Cobertura conocida: el sector oriente no tiene señal estable. La aplicación no cambia de modo, sigue escribiendo en el almacenamiento local.');
                log.push('hl', 'Salida del centro de distribución 08:00.');

                for (i = 0; i < n; i++) {
                    s = P.ruta[i];
                    marcar(i, 'ruta');
                    estadoFila(i, 'run', 'En ruta', 'idle', 'sin capturar');
                    await trazo(legPaths[i], Math.max(280, Math.min(900, P.legs[i].min * 26)));
                    if (mi !== corrida) return;
                    log.push('in', 'Parada ' + k.pad(i + 1) + ' — ' + s.cli + ': llegada ' + hhmm(s.llegada) + ', ' +
                        s.bultos + ' bultos, ventana ' + ventana(s) + ' (' + motivoTexto(s) + ').');
                    await k.wait(180); if (mi !== corrida) return;

                    if (s.cerrado) {
                        marcar(i, 'repr');
                        estadoFila(i, 'bad', 'Reprogramada', 'warn', 'motivo + foto');
                        e.cap++; e.ord++; e.arch++; repro++;
                        pintarPipe(e); pintarSalida(e);
                        log.push('er', 'Cliente cerrado. Sin firma del receptor la orden no se marca entregada: el técnico elige el motivo del catálogo y toma foto del punto.');
                        await k.wait(260); if (mi !== corrida) return;
                        log.push('wa', 'Parada reagendada para el día siguiente en la misma ventana ' + ventana(s) + '. El despachador ve el cambio en el tablero, no al cierre del día.');
                        await k.wait(160); if (mi !== corrida) return;
                        continue;
                    }

                    entregadas++; e.cap++; e.ord++;
                    if (off && s.zona) {
                        marcar(i, 'cola');
                        estadoFila(i, 'ok', 'Entregada', 'warn', 'en cola local');
                        enCola.push(i); e.cola++;
                        log.push('wa', 'Sin señal en esta parada. La aplicación sigue operando: firma capturada, foto tomada y sello de hora ' +
                            sello(s) + ' guardados en la cola local del equipo.');
                        await k.wait(240); if (mi !== corrida) return;
                        log.push('in', 'Cola local: ' + e.cola + ' evidencia' + (e.cola > 1 ? 's' : '') + ' pendiente' +
                            (e.cola > 1 ? 's' : '') + ' de subir. El técnico continúa la ruta sin esperar red.');
                    } else {
                        marcar(i, 'ok');
                        estadoFila(i, 'ok', 'Entregada', 'ok', 'firma + foto');
                        e.arch++;
                        log.push('ok', 'Entrega confirmada: firma del receptor, foto del bulto y sello de hora ' + sello(s) + ' enviados al almacén de evidencia.');
                    }
                    if (s.motivo) log.push('wa', 'La orden queda marcada ' + motivoTexto(s) + '. El desfase viaja con la evidencia, no se corrige a mano.');
                    pintarPipe(e); pintarSalida(e);
                    await k.wait(160); if (mi !== corrida) return;
                }

                await trazo(legPaths[P.legs.length - 1], 620);
                if (mi !== corrida) return;

                if (enCola.length) {
                    log.push('hl', 'Cobertura recuperada al salir del sector oriente. La sincronización arranca sola.');
                    await k.wait(280); if (mi !== corrida) return;
                    for (i = 0; i < enCola.length; i++) {
                        marcar(enCola[i], 'ok');
                        estadoFila(enCola[i], 'ok', 'Entregada', 'ok', 'firma + foto');
                        e.cola--; e.drenada++; e.arch++;
                        pintarPipe(e); pintarSalida(e);
                        log.push('ok', 'Evidencia de la parada ' + k.pad(enCola[i] + 1) + ' sincronizada con su sello de hora original, no con la hora de subida.');
                        await k.wait(180); if (mi !== corrida) return;
                    }
                    log.push('in', 'Sincronización cerrada sin intervención del técnico. Cada orden lleva llave propia: reenviar la cola no duplica la entrega.');
                }

                log.push('hl', 'Jornada cerrada: ' + entregadas + ' entregas con firma, ' + repro + ' reprogramada' + (repro === 1 ? '' : 's') +
                    ', ' + e.arch + ' de ' + n + ' órdenes con evidencia archivada, ' + k.fmt(P.km, 1) + ' km y ' + dur(P.min) + ' en ruta.');
                pintarPipe(e); pintarSalida(e);
                ctl.busy('run', false);
            }

            /* Mover cualquier control aborta la corrida en vuelo y replanifica. */
            ctl.on(function () { corrida++; ctl.busy('run', false); refrescar(); });
            ctl.onClick('run', function () { despachar(); });
            refrescar();
        }
    });
})();
