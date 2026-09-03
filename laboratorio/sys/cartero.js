/* CARTERO — robot no atendido de reportes programados: corre en una
   máquina virtual dedicada, abre el visor de tableros, exporta, arma el
   correo, entrega y archiva evidencia. Todos los datos son sintéticos. */
(function () {
    'use strict';
    var LAB = window.LAB;

    var REPORTES = [
        'Consumo por sitio', 'Inventario de repuestos', 'Órdenes cerradas',
        'Tiempos de atención', 'Costos por región', 'Cumplimiento de SLA'
    ];
    var PERSONAS = [
        { n: 'Ada Peralta', a: 'Operaciones' }, { n: 'Bruno Mancía', a: 'Almacén' },
        { n: 'Carla Vides', a: 'Finanzas' }, { n: 'Diego Rosales', a: 'Operaciones' },
        { n: 'Elena Quintanilla', a: 'Dirección' }, { n: 'Fabio Menjívar', a: 'Compras' },
        { n: 'Gabriela Solís', a: 'Calidad' }, { n: 'Héctor Amaya', a: 'Almacén' },
        { n: 'Irene Bustamante', a: 'Finanzas' }, { n: 'Julio Cardona', a: 'Mantenimiento' },
        { n: 'Karla Núñez', a: 'Dirección' }, { n: 'Luis Pineda', a: 'Compras' }
    ];
    var ESPERA = [30, 60, 120];   /* espera progresiva entre reintentos, en segundos */
    var LIMITE_MB = 20;           /* tope de adjuntos del buzón corporativo */
    var TIMEOUT = 90;             /* espera del visor antes de darlo por vacío */
    var SUBIDA = 25;              /* subir todo a la carpeta de evidencia */
    var MAX_UTIL = 2;             /* del tercer reintento en adelante ya no aporta */

    /* Peso, páginas y duración de cada reporte + historial de 12 semanas. */
    function datos() {
        var r = LAB.kit.rng(6120);
        var reps = REPORTES.map(function (n) {
            return {
                n: n,
                pdf: 1.6 + r() * 2.6,
                xls: 0.6 + r() * 1.2,
                pag: Math.round(12 + r() * 36),
                seg: Math.round(40 + r() * 26)
            };
        });
        function minutos(e) {
            var m = 6.2 + r() * 2.2;
            if (e === 'warn') m += 1.4 + r() * 1.6;
            if (e === 'bad') m *= 0.45 + r() * 0.2;
            return Math.round(m * 10) / 10;
        }
        var hist = [], i, p, e;
        for (i = 0; i < 12; i++) {
            p = r();
            e = p < 0.75 ? 'ok' : (p < 0.92 ? 'warn' : 'bad');
            hist.push({ s: 25 + i, e: e, f: e === 'bad' ? 1 + Math.floor(r() * 2) : 0, min: minutos(e) });
        }
        /* el historial debe enseñar los tres estados aunque la semilla no los saque */
        function forzar(i, e, f) { hist[i].e = e; hist[i].f = f; hist[i].min = minutos(e); }
        if (!hist.some(function (w) { return w.e === 'warn'; })) forzar(9, 'warn', 0);
        if (!hist.some(function (w) { return w.e === 'bad'; })) forzar(4, 'bad', 2);
        return { reps: reps, hist: hist, prox: 37 };
    }

    LAB.register({
        id: 'cartero',
        name: 'CARTERO',
        family: 'procesos',
        tagline: 'Reportes programados',
        title: 'CARTERO — los reportes semanales se envían solos',
        intro: 'Robot no atendido que cada lunes a las 06:00 abre el visor de tableros, exporta los reportes, arma el correo y lo entrega. Usted decide cuántos reportes, en qué formato, a cuántas personas, cuántos reintentos tolera y qué falla quiere ver.',
        spec: {
            trigger: 'Programador de tareas del sistema operativo: cada lunes a las 06:00, dentro de una máquina virtual dedicada al robot. No corre en el escritorio de una persona ni depende de que alguien haya iniciado sesión.',
            systems: 'RPA de escritorio sobre el visor de tableros, cliente de correo corporativo y carpeta de evidencia en la red. La credencial de servicio vive en la bóveda, nunca en el script.',
            output: 'Un correo con los reportes —adjuntos o por enlace según el peso—, el registro de entrega por destinatario y la carpeta de evidencia de la corrida.',
            failure: 'Distingue el fallo transitorio del permanente. Reintenta con espera de 30 s, 60 s y 120 s solo donde reintentar sirve; ante un rechazo del buzón de destino cambia de canal, y ante una credencial vencida aborta y avisa. Nunca reporta éxito falso.'
        },
        impact: [
            ['52', 'corridas al año sin intervención'],
            ['3 h -> 7 min', 'por corrida semanal'],
            ['100%', 'corridas con evidencia archivada']
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
                var m = Math.floor(s / 60), q = Math.round(s % 60);
                return m + ' m ' + k.pad(q) + ' s';
            }
            function min1(s) { return Math.round(s / 6) / 10; }
            function suma(o) {
                var t = 0, x;
                for (x in o) { if (Object.prototype.hasOwnProperty.call(o, x)) t += o[x]; }
                return t;
            }
            function estadoTexto(w) {
                if (w.e === 'ok') return 'entrega completa, sin incidencias';
                if (w.e === 'warn') return 'entrega completa con reintentos o por enlace';
                return 'entrega parcial: faltaron ' + w.f + (w.f === 1 ? ' reporte' : ' reportes');
            }

            /* ---------- controles ---------- */
            var ctl = k.controls([
                { k: 'rep', t: 'range', label: 'Reportes a exportar', min: 1, max: 6, step: 1, value: 4 },
                { k: 'formato', t: 'select', label: 'Formato', options: ['PDF', 'Excel', 'PDF + Excel'], value: 'PDF + Excel' },
                { k: 'dest', t: 'range', label: 'Destinatarios', min: 1, max: 12, step: 1, value: 5 },
                { k: 'reint', t: 'range', label: 'Reintentos permitidos', min: 0, max: 3, step: 1, value: 2 },
                {
                    k: 'falla', t: 'select', label: 'Falla a simular', value: 'ninguna',
                    options: [
                        { v: 'ninguna', t: 'Ninguna — ruta normal' },
                        { v: 'tablero', t: 'El visor no devuelve datos' },
                        { v: 'correo', t: 'El buzón de destino rechaza' },
                        { v: 'sesion', t: 'La sesión de servicio no abre' }
                    ]
                },
                { k: 'run', t: 'button', label: 'Ejecutar corrida', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kp = k.kpis([
                ['Próxima corrida', '—'], ['Reportes entregados', '—'],
                ['Duración', '—'], ['Entregas completas 12 sem', '—']
            ]);
            host.appendChild(kp.node);

            /* ---------- fila 1: plan y secuencia | calendario y registro ---------- */
            var g1 = k.el('div', 'grid2 wide-left');
            host.appendChild(g1);

            var izq = k.el('div', 'stack');
            var pPlan = k.panel();
            pPlan.appendChild(k.txt('div', 'mono-head', 'Plan de la corrida'));
            var planBox = k.el('div', 'fields');
            pPlan.appendChild(planBox);
            var pSec = k.panel();
            pSec.appendChild(k.txt('div', 'mono-head', 'Secuencia del robot'));
            var secBox = k.el('div');
            pSec.appendChild(secBox);
            izq.appendChild(pPlan); izq.appendChild(pSec); g1.appendChild(izq);

            var der = k.el('div', 'stack');
            var pCal = k.panel();
            pCal.appendChild(k.txt('div', 'mono-head', 'Calendario de corridas — últimas 12 semanas'));
            var calHead = k.el('div', 'cal-head');
            var calGrid = k.el('div', 'cal');
            calHead.style.gridTemplateColumns = 'repeat(13, 1fr)';
            calGrid.style.gridTemplateColumns = 'repeat(13, 1fr)';
            pCal.appendChild(calHead);
            pCal.appendChild(calGrid);
            var leg = k.el('div', null,
                k.pill('ok', 'C · completa') + k.pill('warn', 'R · con reintentos o enlace') +
                k.pill('bad', 'P · parcial o abortada') + k.pill('idle', '> · próxima'));
            leg.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:12px';
            pCal.appendChild(leg);
            var det = k.txt('div', null, '');
            det.style.cssText = 'margin-top:10px;font-size:12.5px;line-height:1.55;color:' + k.C.label;
            det.setAttribute('aria-live', 'polite');
            pCal.appendChild(det);

            var pLog = k.panel();
            pLog.appendChild(k.txt('div', 'mono-head', 'Registro de ejecución'));
            var lg = k.log('236px');
            pLog.appendChild(lg.node);
            der.appendChild(pCal); der.appendChild(pLog); g1.appendChild(der);

            /* ---------- fila 2: gráfica | reparto del tiempo ---------- */
            var g2 = k.el('div', 'grid2 wide-left');
            host.appendChild(g2);
            var cbx = k.chartbox('Duración por corrida', 'Doce semanas cerradas más la proyección de lo que usted configuró.', '232px');
            g2.appendChild(cbx.node);
            var pBar = k.panel();
            pBar.appendChild(k.txt('div', 'mono-head', 'Reparto del tiempo previsto'));
            var br = k.bars();
            pBar.appendChild(br.node);
            g2.appendChild(pBar);

            /* ---------- fila 3: lectura ---------- */
            var pIns = k.panel();
            pIns.appendChild(k.txt('div', 'mono-head', 'Lectura de la configuración'));
            var ins = k.insights();
            pIns.appendChild(ins.node);
            host.appendChild(pIns);

            /* ---------- fila 4: archivos del correo ---------- */
            var pTab = k.panel();
            pTab.appendChild(k.txt('div', 'mono-head', 'Archivos del correo — cómo viaja cada reporte'));
            var tabBox = k.el('div');
            pTab.appendChild(tabBox);
            host.appendChild(pTab);

            var COLS = [
                { t: 'Reporte' }, { t: 'Formato' }, { t: 'Peso', r: true },
                { t: 'Páginas', r: true }, { t: 'Exportación', r: true }, { t: 'Cómo viaja' }
            ];

            var ch = k.chart(cbx.canvas, {
                type: 'bar',
                data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, borderRadius: 5, maxBarThickness: 26 }] },
                options: {
                    /* el color de cada barra lo fija el estado, no se interpola:
                       animar un arreglo de colores rompe al animador de Chart.js */
                    animations: { colors: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (c) { return k.fmt(c.parsed.y, 1) + ' min · ' + (notas[c.dataIndex] || ''); }
                            }
                        }
                    },
                    scales: {
                        x: k.AXIS_BARE,
                        y: Object.assign({}, k.AXIS, {
                            beginAtZero: true,
                            ticks: { padding: 8, callback: function (v) { return v + ' min'; } }
                        })
                    }
                }
            });

            /* ---------- configuración leída de los controles ---------- */
            function plan() {
                var n = ctl.get('rep'), f = ctl.get('formato'), d = ctl.get('dest');
                var conPdf = f !== 'Excel', conXls = f !== 'PDF';
                var lista = D.reps.slice(0, n).map(function (x) {
                    return {
                        n: x.n,
                        mb: (conPdf ? x.pdf : 0) + (conXls ? x.xls : 0),
                        pag: conPdf ? x.pag : 0,
                        seg: Math.round(x.seg * (conPdf && conXls ? 1.55 : (conXls ? 0.85 : 1))),
                        canal: 'adjunto'
                    };
                });
                /* el correo adjunta de menor a mayor hasta llenar el tope; lo que no cabe sale por enlace */
                var acum = 0;
                lista.slice().sort(function (a, b) { return a.mb - b.mb; })
                    .forEach(function (x) {
                        if (acum + x.mb <= LIMITE_MB) { x.canal = 'adjunto'; acum += x.mb; }
                        else x.canal = 'enlace';
                    });
                var areas = {}, i;
                for (i = 0; i < d; i++) areas[PERSONAS[i].a] = 1;
                return {
                    n: n, d: d, f: f, lista: lista,
                    rt: ctl.get('reint'), falla: ctl.get('falla'),
                    porArchivo: (conPdf ? 1 : 0) + (conXls ? 1 : 0),
                    areas: Object.keys(areas).length,
                    idxFallo: Math.min(1, n - 1)
                };
            }

            /* Resultado determinista de la corrida. La vista previa y la
               animación leen de aquí, así nunca se contradicen. */
            function simular(P) {
                var s = { login: 45, exp: 0, espera: 0, verif: 20, redac: 15, envio: 6 * P.d, evid: 18, subida: 0 };
                var R = {
                    entregados: P.lista.length, faltan: [], reintentos: 0, recuperado: false,
                    aborta: false, porEnlace: false, mb: 0, pag: 0, enlaces: 0, adjuntos: 0
                };
                var i;

                if (P.falla === 'sesion') {
                    R.aborta = true;
                    R.entregados = 0;
                    R.reintentos = Math.min(P.rt, 1);
                    s.login = 45 + R.reintentos * 45;
                    s.espera = R.reintentos * ESPERA[0];
                    s.verif = 0; s.redac = 10; s.envio = 6; s.evid = 12;
                    P.lista.forEach(function (x) { R.faltan.push(x.n); });
                } else if (P.falla === 'tablero') {
                    R.reintentos = Math.min(P.rt, MAX_UTIL);
                    for (i = 0; i < R.reintentos; i++) s.espera += ESPERA[i];
                    R.recuperado = P.rt >= MAX_UTIL;
                    /* cada intento fallido consume la espera completa del visor */
                    s.exp = TIMEOUT * (R.recuperado ? R.reintentos : 1 + R.reintentos);
                    if (!R.recuperado) {
                        R.entregados = P.idxFallo;
                        for (i = P.idxFallo; i < P.lista.length; i++) R.faltan.push(P.lista[i].n);
                    }
                } else if (P.falla === 'correo') {
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
                    if (P.lista[i].canal === 'enlace') R.enlaces++;
                }
                if (R.porEnlace) R.enlaces = R.entregados;
                R.adjuntos = (R.entregados - R.enlaces) * P.porArchivo;
                R.archivos = R.entregados * P.porArchivo;
                R.seg = s;
                R.total = suma(s);
                R.estado = (R.aborta || R.faltan.length) ? 'bad'
                    : ((R.reintentos || R.porEnlace) ? 'warn' : 'ok');
                return R;
            }

            /* ---------- pintores ---------- */
            function fila(a, b, c) {
                var row = k.el('div', 'fx');
                row.appendChild(k.txt('div', 'fk', a));
                row.appendChild(k.txt('div', 'fv', b));
                var e = k.txt('div', 'mono', c || '');
                e.style.cssText = 'text-align:right;font-size:10px;color:' + k.C.label;
                row.appendChild(e);
                return row;
            }

            function textoFalla(P, S) {
                if (P.falla === 'ninguna') return 'Ruta normal: exporta, adjunta y entrega.';
                if (P.falla === 'sesion') return 'La credencial de servicio venció: aborta antes de exportar y avisa.';
                if (P.falla === 'correo') return 'El buzón rechaza el correo: reintenta ' + P.rt + ', luego cambia a enlace.';
                return S.recuperado
                    ? 'El visor falla dos veces y recupera en el reintento 2.'
                    : 'El visor falla y los reintentos no alcanzan: entrega parcial.';
            }

            function pintarPlan(P, S) {
                var nombres = P.lista.map(function (x) { return x.n; });
                var resumen = nombres.slice(0, 2).join(' · ') + (P.n > 2 ? ' · +' + (P.n - 2) : '');
                var enlacePlan = P.lista.filter(function (x) { return x.canal === 'enlace'; }).length;
                var mbPlan = P.lista.reduce(function (t, x) { return t + x.mb; }, 0);
                var pagPlan = P.lista.reduce(function (t, x) { return t + x.pag; }, 0);

                planBox.innerHTML = '';
                planBox.appendChild(fila('Disparo', 'Lunes 06:00 · máquina virtual dedicada al robot', 'semanal'));
                planBox.appendChild(fila('Reportes', resumen, P.n + ' de 6'));
                planBox.appendChild(fila('Formato', P.f + ' desde el visor de tableros',
                    k.fmt(P.n * P.porArchivo, 0) + ' archivos'));
                planBox.appendChild(fila('Peso del correo',
                    k.fmt(mbPlan, 1) + ' MB' + (pagPlan ? ' · ' + k.fmt(pagPlan, 0) + ' páginas' : '') +
                    (enlacePlan ? ' · ' + enlacePlan + ' por enlace, no caben en ' + LIMITE_MB + ' MB' : ''),
                    enlacePlan ? 'mixto' : 'todo adjunto'));
                planBox.appendChild(fila('Destinatarios',
                    P.d + (P.d === 1 ? ' persona' : ' personas') + ' en ' + P.areas + (P.areas === 1 ? ' área' : ' áreas'),
                    'lista fija'));
                planBox.appendChild(fila('Reintentos', P.rt === 0
                    ? 'Ninguno: al primer fallo el robot decide con lo que tiene'
                    : P.rt + ' con espera de ' + ESPERA.slice(0, P.rt).join(' s, ') + ' s',
                    P.falla === 'ninguna' ? 'sin uso' : 'en uso'));
                planBox.appendChild(fila('Resultado previsto', textoFalla(P, S),
                    S.entregados + ' de ' + P.n));
            }

            function pintarPasos(P, S) {
                var pasos = [{ n: 'Abrir sesión con la cuenta de servicio', ms: '~' + S.seg.login + ' s' }];
                P.lista.forEach(function (x, i) {
                    pasos.push({ n: 'Exportar reporte ' + (i + 1) + ' — ' + x.n, ms: '~' + x.seg + ' s' });
                });
                pasos.push({ n: 'Verificar peso, páginas y archivos de 0 KB', ms: '~20 s' });
                pasos.push({ n: 'Redactar correo con resumen y pendientes', ms: '~15 s' });
                pasos.push({ n: 'Entregar a ' + P.d + (P.d === 1 ? ' destinatario' : ' destinatarios'), ms: '~' + S.seg.envio + ' s' });
                pasos.push({ n: 'Archivar evidencia y cerrar sesión', ms: '~18 s' });
                st = k.steps(pasos);
                secBox.innerHTML = '';
                secBox.appendChild(st.node);
            }

            function pintarTabla(P) {
                tabBox.innerHTML = '';
                var t = k.table(COLS, P.lista.map(function (x) {
                    return [
                        x.n, P.f, k.fmt(x.mb, 1) + ' MB', x.pag ? k.fmt(x.pag, 0) : '—',
                        x.seg + ' s',
                        { html: x.canal === 'adjunto' ? k.pill('ok', 'adjunto') : k.pill('warn', 'enlace') }
                    ];
                }));
                tabBox.appendChild(t.node);
            }

            function pintarBarras(S) {
                var partes = [
                    ['Abrir sesión', S.seg.login], ['Exportar reportes', S.seg.exp],
                    ['Espera de reintentos', S.seg.espera], ['Verificar salida', S.seg.verif],
                    ['Redactar correo', S.seg.redac], ['Subir a evidencia', S.seg.subida],
                    ['Entregar', S.seg.envio], ['Archivar y cerrar', S.seg.evid]
                ].filter(function (p) { return p[1] > 0; });
                var max = partes.reduce(function (m, p) { return Math.max(m, p[1]); }, 1);
                br.clear();
                partes.forEach(function (p) { br.add(p[0], p[1], max, k.C.teal, p[1] + ' s'); });
            }

            function pintarInsights(P, S) {
                var enlacePlan = P.lista.filter(function (x) { return x.canal === 'enlace'; }).length;
                var mbPlan = P.lista.reduce(function (t, x) { return t + x.mb; }, 0);
                ins.clear();
                ins.add(enlacePlan ? 'amber' : 'teal', enlacePlan ? '!' : '=',
                    enlacePlan
                        ? '<b>' + enlacePlan + ' reporte(s) no caben en el correo.</b> El robot adjunta de menor a mayor hasta llenar los ' + LIMITE_MB + ' MB y publica el resto en la carpeta de evidencia con un enlace de 30 días. Nadie recibe un correo rebotado.'
                        : '<b>Todo cabe adjunto:</b> ' + k.fmt(mbPlan, 1) + ' MB contra el tope de ' + LIMITE_MB + ' MB. No hace falta el enlace.');
                ins.add(P.rt === 0 ? 'rose' : 'cyan', P.rt === 0 ? 'x' : '+',
                    P.rt === 0
                        ? '<b>Sin reintentos:</b> cualquier tropiezo del visor termina en entrega parcial. Es la configuración más rápida y la que más veces deja reportes fuera.'
                        : '<b>' + P.rt + ' reintento(s):</b> agregan hasta ' + ESPERA.slice(0, Math.min(P.rt, MAX_UTIL)).reduce(function (a, b) { return a + b; }, 0) + ' s de espera. Del tercero en adelante ya no recuperan nada: si dos intentos no bastan, el problema no es transitorio.');
                ins.add('violet', '>',
                    '<b>Una sola lista de ' + P.d + ' destinatario(s) en ' + P.areas + ' área(s).</b> La lista vive en la configuración del robot, no en la libreta de nadie: al cambiar una persona se corrige en un lugar y no hay reenvíos manuales.');
            }

            function pintarChart(S) {
                if (!ch) return;
                var labels = hist.map(function (w) { return 'S' + w.s; });
                var vals = hist.map(function (w) { return w.min; });
                var cols = hist.map(function (w) { return TONO[w.e]; });
                notas = hist.map(estadoTexto);
                labels.push('S' + prox + ' · plan');
                vals.push(min1(S.total));
                cols.push(k.C.blue);
                notas.push('proyección de la corrida configurada');
                ch.data.labels = labels;
                ch.data.datasets[0].data = vals;
                ch.data.datasets[0].backgroundColor = cols;
                ch.update();
                cbx.cap('Verde: entrega completa. Ámbar: completa con reintentos o por enlace. Rosa: parcial o abortada. ' +
                    'La última barra, en azul, es la proyección de la corrida S' + prox + ' con lo que usted configuró: ' +
                    dur(S.total) + '.');
            }

            function dibujarCal() {
                calHead.innerHTML = '';
                calGrid.innerHTML = '';
                hist.concat([{ s: prox, e: 'next', f: 0 }]).forEach(function (w) {
                    calHead.appendChild(k.txt('div', null, 'S' + w.s));
                    var letra = w.e === 'ok' ? 'C' : (w.e === 'warn' ? 'R' : (w.e === 'bad' ? 'P' : '>'));
                    var c = k.txt('div', 'cal-cell ' + w.e, letra);
                    c.title = 'Semana ' + w.s + ' — ' + (w.e === 'next' ? 'próxima corrida programada' : estadoTexto(w));
                    calGrid.appendChild(c);
                });
                var malas = hist.filter(function (w) { return w.e !== 'ok'; })
                    .map(function (w) { return 'S' + w.s + ': ' + estadoTexto(w); });
                det.textContent = malas.length
                    ? 'Semanas con incidencia — ' + malas.join(' · ')
                    : 'Las 12 semanas cerraron con entrega completa.';
                var completas = hist.filter(function (w) { return w.e !== 'bad'; }).length;
                kp.set(3, completas + ' / 12', completas >= 11 ? 'up' : (completas >= 9 ? 'warn' : 'bad'));
            }

            function sync() {
                if (corriendo) return;
                var P = plan(), S = simular(P);
                pintarPlan(P, S);
                pintarPasos(P, S);
                pintarTabla(P);
                pintarBarras(S);
                pintarInsights(P, S);
                pintarChart(S);
                kp.set(0, 'S' + prox + ' · lun 06:00', '');
                kp.set(1, '— / ' + P.n, '');
                kp.set(2, '~' + dur(S.total), '');
            }
            ctl.on(sync);

            /* ---------- corrida animada ---------- */
            function cerrar(P, S) {
                kp.set(1, S.entregados + ' / ' + P.n, S.estado === 'bad' ? 'bad' : (S.estado === 'warn' ? 'warn' : 'up'));
                kp.set(2, dur(S.total), S.total > 900 ? 'warn' : '');
                hist.push({ s: prox, e: S.estado, f: S.faltan.length, min: min1(S.total) });
                hist.shift();
                prox++;
                dibujarCal();
                pintarChart(simular(plan()));
                kp.set(0, 'S' + prox + ' · lun 06:00', '');
                lg.push('hl', 'Próxima corrida: S' + prox + ', lunes 06:00. Queda programada sola; nadie tiene que abrir nada.');
                ctl.busy('run', false);
                corriendo = false;
            }

            async function correr() {
                if (corriendo) return;
                corriendo = true;
                ctl.busy('run', true);
                var P = plan(), S = simular(P);
                var base = P.lista.length + 1;
                var i, j, a;
                st.reset();
                lg.clear();

                lg.push('hl', 'Programador de tareas: disparo semanal S' + prox + ', lunes 06:00, en la máquina virtual del robot.');
                st.set(0, 'run');
                await k.wait(280);

                if (P.falla === 'sesion') {
                    lg.push('er', 'La cuenta de servicio no abrió sesión: el directorio rechazó la contraseña que entregó la bóveda.');
                    if (S.reintentos) {
                        lg.push('wa', 'Reintento 1 de ' + P.rt + ': espera de ' + ESPERA[0] + ' s y segundo intento de sesión.');
                        await k.wait(240);
                        lg.push('er', 'Segundo intento rechazado igual. No es un tropiezo transitorio: la credencial venció.');
                    } else {
                        lg.push('wa', 'Reintentos permitidos: 0. El robot no vuelve a intentar.');
                    }
                    st.set(0, 'fail', 'sin sesión');
                    for (i = 1; i < st.count; i++) st.set(i, '', 'omitido');
                    lg.push('hl', 'Decisión: sin sesión no hay nada que exportar. Aborta la corrida, no manda el correo de reportes y escala el aviso.');
                    await k.wait(220);
                    lg.push('wa', 'Aviso enviado al responsable del robot y a los ' + P.d + ' destinatarios: "Corrida S' + prox + ' no ejecutada", con causa y hora del intento.');
                    lg.push('ok', 'Evidencia archivada en evidencia\\corridas\\S' + prox + ': captura del rechazo y registro del intento.');
                    cerrar(P, S);
                    return;
                }

                st.set(0, 'done', '45 s');
                lg.push('ok', 'Sesión abierta con la cuenta de servicio; visor de tableros cargado con el filtro de la semana.');
                if (P.falla === 'tablero') {
                    lg.push('wa', 'Falla simulada: el reporte ' + (P.idxFallo + 1) + ' no devolverá datos en el primer intento.');
                }

                var corte = false;
                for (i = 0; i < P.lista.length; i++) {
                    st.set(i + 1, 'run');
                    await k.wait(190);
                    if (P.falla === 'tablero' && i === P.idxFallo) {
                        lg.push('er', 'Reporte ' + (i + 1) + ' — ' + P.lista[i].n + ': el visor devolvió la vista vacía tras ' + TIMEOUT + ' s de espera.');
                        var ok = false;
                        for (a = 1; a <= P.rt && a <= MAX_UTIL; a++) {
                            lg.push('wa', 'Reintento ' + a + ' de ' + P.rt + ': espera de ' + ESPERA[a - 1] + ' s antes de volver a abrir el reporte.');
                            await k.wait(230);
                            if (a >= MAX_UTIL) {
                                ok = true;
                                lg.push('ok', 'Reintento ' + a + ': el visor respondió con datos completos. La corrida sigue.');
                                if (P.rt > MAX_UTIL) lg.push('in', 'El reintento ' + (MAX_UTIL + 1) + ' queda sin usar: el segundo ya recuperó.');
                                break;
                            }
                            lg.push('er', 'Reintento ' + a + ': el visor sigue devolviendo la vista vacía a los ' + TIMEOUT + ' s.');
                        }
                        if (!ok) {
                            st.set(i + 1, 'fail', P.rt === 0 ? 'sin reintento' : 'agotado');
                            lg.push('er', P.rt === 0
                                ? 'Reintentos permitidos: 0. El robot detiene la exportación en este reporte.'
                                : 'Reintentos agotados (' + S.reintentos + '). El robot detiene la exportación.');
                            lg.push('hl', 'Decisión: no sigue con los reportes restantes porque la sesión del visor quedó inconsistente. Entrega lo que sí exportó y deja escrito lo que faltó.');
                            for (j = i + 1; j < P.lista.length; j++) st.set(j + 1, '', 'omitido');
                            corte = true;
                            break;
                        }
                    }
                    st.set(i + 1, 'done', P.lista[i].seg + ' s');
                    lg.push('in', 'Reporte ' + (i + 1) + ' — ' + P.lista[i].n + ' exportado en ' + P.f +
                        ' · ' + k.fmt(P.lista[i].mb, 1) + ' MB' + (P.lista[i].pag ? ' · ' + k.fmt(P.lista[i].pag, 0) + ' páginas' : '') + '.');
                }

                var vacio = S.entregados === 0;
                st.set(base, 'run');
                await k.wait(210);
                st.set(base, 'done', vacio ? 'sin archivos' : '20 s');
                lg.push(vacio ? 'er' : 'in', vacio
                    ? 'Verificación: la corrida no exportó ningún archivo. No hay nada que adjuntar.'
                    : 'Verificación: ' + S.archivos + ' archivos, ' + k.fmt(S.mb, 1) + ' MB' +
                      (S.pag ? ', ' + k.fmt(S.pag, 0) + ' páginas' : '') + '. Ninguno de 0 KB.');
                if (!S.porEnlace && S.enlaces) {
                    lg.push('wa', 'El correo no admite ' + k.fmt(S.mb, 1) + ' MB: ' + S.enlaces +
                        ' reporte(s) salen por enlace a la carpeta de evidencia y el resto va adjunto.');
                }

                st.set(base + 1, 'run');
                await k.wait(200);
                st.set(base + 1, 'done', '15 s');
                lg.push('in', vacio
                    ? 'Correo de aviso redactado: asunto "Corrida S' + prox + ' sin reportes", con el error del visor y la hora del intento.'
                    : 'Correo redactado: asunto "Reportes semanales S' + prox + '", resumen de ' + S.entregados +
                      (S.entregados === 1 ? ' reporte' : ' reportes') + (S.faltan.length ? ' y apartado de pendientes.' : '.'));

                st.set(base + 2, 'run');
                if (P.falla === 'correo') {
                    lg.push('er', 'El servidor rechazó el mensaje: 552, el buzón de destino no admite estos adjuntos. Su tope es más bajo que el del remitente.');
                    for (a = 1; a <= P.rt; a++) {
                        lg.push('wa', 'Reintento ' + a + ' de ' + P.rt + ': espera de ' + ESPERA[a - 1] + ' s y reenvío del mismo mensaje.');
                        await k.wait(210);
                        lg.push('er', 'Reintento ' + a + ': mismo rechazo. El mensaje no cambia por volver a enviarlo.');
                    }
                    lg.push('hl', 'Decisión: reintentar no arregla un rechazo por política del buzón. El robot sube los archivos a la carpeta de evidencia y reescribe el correo con el enlace.');
                    await k.wait(240);
                    lg.push('ok', 'Archivos publicados en la carpeta de evidencia en ' + SUBIDA + ' s. Correo sin adjuntos, con enlace vigente 30 días.');
                }
                for (i = 0; i < P.d; i++) {
                    await k.wait(60);
                    lg.push(vacio ? 'wa' : 'ok', vacio
                        ? 'Aviso de corrida sin reportes entregado a ' + PERSONAS[i].n + ' — ' + PERSONAS[i].a + '.'
                        : 'Entregado a ' + PERSONAS[i].n + ' — ' + PERSONAS[i].a + ' · ' +
                          (S.porEnlace ? 'enlace a ' + S.entregados + ' reporte(s)'
                                       : S.adjuntos + ' adjuntos' + (S.enlaces ? ' y ' + S.enlaces + ' por enlace' : '')) + '.');
                }
                st.set(base + 2, 'done', S.seg.envio + ' s');

                st.set(base + 3, 'run');
                await k.wait(240);
                st.set(base + 3, 'done', '18 s');
                lg.push('ok', 'Evidencia archivada en evidencia\\corridas\\S' + prox + ': archivos, cuerpo del correo y registro de entrega por destinatario.');
                if (S.faltan.length) {
                    lg.push('er', 'Constancia: faltaron ' + S.faltan.join(', ') + '. Queda escrito en el correo y en la evidencia; la corrida no se marca completa.');
                }
                cerrar(P, S);
            }
            ctl.onClick('run', function () { correr(); });

            /* ---------- estado inicial: ya trabajando ---------- */
            dibujarCal();
            sync();
            var ult = hist[hist.length - 1];
            lg.push('in', 'Corrida S' + ult.s + ' cerrada en ' + k.fmt(ult.min, 1) + ' min — ' + estadoTexto(ult) + '.');
            lg.push('ok', 'Evidencia S' + ult.s + ' archivada: archivos, cuerpo del correo y registro de entrega por destinatario.');
            lg.push('hl', 'Corrida S' + prox + ' programada para el lunes 06:00. Mueva los controles para ver el plan y pulse Ejecutar corrida para verla paso a paso.');
        }
    });
})();
