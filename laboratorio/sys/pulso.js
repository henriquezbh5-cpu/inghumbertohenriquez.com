/* ============================================================
   PULSO — supervisión por excepción de una flota de bots
   Ciento setenta automatizaciones vigiladas desde una consola:
   qué corre, qué falla, qué se recupera solo y qué exige a una
   persona. Todos los datos son sintéticos y con semilla fija.
   ============================================================ */
(function () {
    'use strict';
    var LAB = window.LAB;

    var AREAS = ['Finanzas', 'Compras', 'Talento humano', 'Operaciones', 'Servicio', 'Tecnología'];
    var CUPO = [34, 28, 22, 36, 24, 26];
    var PAISES = ['SV', 'GT', 'HN', 'CR'];
    var ESTADOS = ['Estable', 'Con reintentos', 'Degradado'];
    var PROC = {
        'Finanzas': ['Conciliación bancaria diaria', 'Carga de facturas de proveedor', 'Cierre contable mensual',
            'Provisión de gastos', 'Reporte de flujo de caja', 'Cobranza preventiva', 'Validación de retenciones'],
        'Compras': ['Alta de proveedor', 'Cotización a tres bandas', 'Seguimiento de orden de compra',
            'Recepción de mercadería', 'Renovación de contrato marco', 'Control de precios pactados'],
        'Talento humano': ['Alta de colaborador', 'Planilla quincenal', 'Control de vacaciones',
            'Envío de constancias', 'Cierre de evaluación', 'Baja de accesos'],
        'Operaciones': ['Programación de rutas', 'Confirmación de entregas', 'Inventario cíclico',
            'Reposición de sucursal', 'Cierre de turno', 'Consolidado de despachos'],
        'Servicio': ['Clasificación de tickets', 'Encuesta de satisfacción', 'Aviso de cita',
            'Escalamiento por acuerdo de servicio', 'Respuesta de primer contacto'],
        'Tecnología': ['Respaldo verificado', 'Rotación de credenciales', 'Monitoreo de certificados',
            'Limpieza de archivos temporales', 'Sincronización de directorio', 'Publicación de versión']
    };

    /* Ventana móvil de 30 días. El día de la semana sale del índice y no del
       reloj del visitante: así el valle de fin de semana siempre cae en el
       mismo punto de la gráfica. */
    function esFinde(d) { var dow = (d + 3) % 7; return dow === 5 || dow === 6; }

    function datos() {
        var r = LAB.kit.rng(9021);
        var bots = [], n = 0;
        AREAS.forEach(function (area, a) {
            var procs = PROC[area];
            for (var j = 0; j < CUPO[a]; j++) {
                n++;
                var cad = r();
                var cadencia = cad < 0.26 ? 'horaria' : (cad < 0.72 ? 'diaria' : 'semanal');
                var diaFijo = Math.floor(r() * 5);
                var picoH = 6 + Math.floor(r() * 18), picoD = 1 + Math.floor(r() * 4), picoS = 1 + Math.floor(r() * 3);
                var dia = [], ejec = 0, d, v;
                for (d = 0; d < 30; d++) {
                    var finde = esFinde(d);
                    if (cadencia === 'horaria') v = finde ? Math.round(picoH * 0.18) : Math.max(1, picoH + Math.round((r() - 0.5) * 4));
                    else if (cadencia === 'diaria') v = finde ? (r() < 0.25 ? 1 : 0) : Math.max(1, picoD + (r() < 0.3 ? 1 : 0));
                    else v = ((d + 3) % 7) === diaFijo ? picoS : 0;
                    dia.push(v);
                    ejec += v;
                }
                /* Tasa de fallo con cola larga: la mayoría de la flota es sana y
                   unos pocos concentran el ruido. Eso es lo que se supervisa. */
                var q = r(), tf;
                if (q < 0.70) tf = r() * 0.008;
                else if (q < 0.90) tf = 0.008 + r() * 0.022;
                else tf = 0.03 + r() * 0.08;
                var fallos = Math.min(ejec, Math.round(ejec * tf));
                if (tf > 0.03 && fallos === 0) fallos = 1;
                /* Los fallos caen en proporción al volumen del día y nunca pueden
                   superar las ejecuciones de ese día. */
                var fdia = [], quedan = fallos, guard = fallos * 14 + 80;
                for (d = 0; d < 30; d++) fdia.push(0);
                while (quedan > 0 && guard > 0) {
                    guard--;
                    var t = r() * ejec, acc = 0, dd = -1;
                    for (d = 0; d < 30; d++) { acc += dia[d]; if (t < acc) { dd = d; break; } }
                    if (dd >= 0 && fdia[dd] < dia[dd]) { fdia[dd]++; quedan--; }
                }

                bots.push({
                    id: 'BOT-' + (n < 100 ? (n < 10 ? '00' : '0') : '') + n,
                    area: area, pais: PAISES[Math.floor(r() * PAISES.length)],
                    proc: procs[Math.floor(r() * procs.length)],
                    crit: r() < 0.38 ? 'Alta' : 'Media', cadencia: cadencia,
                    dia: dia, fdia: fdia, ejec: ejec, fallos: fallos - quedan,
                    rec: Math.round((fallos - quedan) * (0.70 + r() * 0.28)),
                    min: 3 + Math.floor(r() * 22), tocado: false
                });
            }
        });
        return bots;
    }

    /* El estado no es fijo: lo decide el umbral que mueve el visitante. */
    function tasa(b) { return b.ejec ? b.fallos / b.ejec : 0; }
    function clase(tf, u) { return tf < u / 4 ? ESTADOS[0] : (tf < u ? ESTADOS[1] : ESTADOS[2]); }
    function estadoDe(b, u) { return clase(tasa(b), u); }
    function tonoDe(e) { return e === ESTADOS[0] ? 'ok' : (e === ESTADOS[1] ? 'warn' : 'bad'); }
    function colorDe(C, e) { return e === ESTADOS[0] ? C.green : (e === ESTADOS[1] ? C.amber : C.rose); }
    /* Orden de la cola: primero lo degradado, luego la criticidad. */
    function rango(b, u) {
        var e = estadoDe(b, u);
        return (e === ESTADOS[2] ? 0 : (e === ESTADOS[1] ? 1 : 2)) * 10 + (b.crit === 'Alta' ? 0 : 1);
    }
    /* Cuelga hijos de un contenedor y lo devuelve, para armar el layout plano. */
    function apila(cont) {
        for (var i = 1; i < arguments.length; i++) if (arguments[i]) cont.appendChild(arguments[i]);
        return cont;
    }

    LAB.register({
        id: 'pulso',
        name: 'PULSO',
        family: 'agentes',
        tagline: 'Supervisión por excepción',
        title: 'Supervisión por excepción de 170 automatizaciones',
        intro: 'Ciento setenta bots no se vigilan uno por uno. Mueva el umbral de degradación y vea cómo cambia la cola de excepciones, filtre por área o criticidad, y dispare un incidente para seguir la escalera de reintentos que resuelve la mayoría de los fallos sin que nadie intervenga.',
        spec: {
            trigger: 'Cada ejecución escribe su propio registro al terminar, con paso, duración y excepción. La consola lee ese registro en continuo: no encuesta a los equipos ni espera a que alguien reporte.',
            systems: 'Registro central de ejecuciones sobre SQL Server, modelo semántico de Power BI encima, flujos de Power Automate que publican los avisos y un canal de Teams para las excepciones.',
            output: 'Tasa de éxito por área, horas de trabajo manual evitadas y una cola de excepciones ordenada por criticidad y por volumen perdido, no por hora de fallo.',
            failure: 'Tres reintentos con espera progresiva y sesión renovada. La escritura es idempotente, así que un reintento nunca duplica registros. Si el tercero cae, se abre aviso con la traza completa y el bot queda bajo observación 48 horas.'
        },
        impact: [
            ['170', 'bots y flujos vigilados'],
            ['98.7%', 'ejecuciones correctas sin intervención'],
            ['4,064 h', 'trabajo manual evitado en 30 días']
        ],
        render: function (host, k) {
            var C = k.C, bots = datos(), rInc = k.rng(4477), etiquetas = [], i;
            for (i = 0; i < 30; i++) etiquetas.push('D' + k.pad(i + 1));
            function cabeza(s, mt) {
                var n = k.txt('div', 'mono-head', s);
                if (mt) n.style.marginTop = mt;
                return n;
            }

            var ctl = k.controls([
                { k: 'area', t: 'select', label: 'Área', options: ['Todas'].concat(AREAS), value: 'Todas' },
                { k: 'estado', t: 'select', label: 'Estado', options: ['Todos'].concat(ESTADOS), value: 'Todos' },
                { k: 'crit', t: 'select', label: 'Criticidad', options: ['Todas', 'Alta', 'Media'], value: 'Todas' },
                {
                    k: 'orden', t: 'select', label: 'Tabla', value: 'exc',
                    options: [{ v: 'exc', t: 'Cola de excepciones' }, { v: 'vol', t: 'Mayor volumen' }]
                },
                { k: 'umbral', t: 'range', label: 'Umbral de degradación', min: 1, max: 8, step: 0.5, value: 4, suffix: '%', decimals: 1 },
                { k: 'inc', t: 'button', label: 'Simular incidente', primary: true }
            ]);
            var kpi = k.kpis([
                ['Bots en el filtro', '—'], ['Ejecuciones 30 días', '—'],
                ['Tasa de éxito', '—'], ['Horas de trabajo evitadas', '—']
            ]);
            var cbLinea = k.chartbox('Ejecuciones y fallos por día', 'Ventana móvil de 30 días.');
            var cbEstado = k.chartbox('Estado de la flota', 'Reparto según el umbral vigente.');
            var tHead = cabeza('Cola de excepciones');
            var tablaHost = k.el('div');
            tablaHost.style.marginTop = '12px';
            var esc = k.steps([
                'Excepción detectada en el paso 4 de 9', 'Reintento 1 · espera 15 s',
                'Reintento 2 · sesión renovada', 'Escritura idempotente verificada',
                'Aviso al canal y observación 48 h'
            ]);
            esc.node.style.margin = '2px 0 16px';
            var log = k.log('196px');
            var bVol = k.bars(), bFal = k.bars(), ins = k.insights();

            apila(host, ctl.node, kpi.node,
                apila(k.el('div', 'grid2 wide-left'), cbLinea.node, cbEstado.node),
                apila(k.el('div', 'grid2 wide-left'),
                    apila(k.panel(), tHead, tablaHost),
                    apila(k.panel(), cabeza('Escalera de recuperación'), esc.node,
                        cabeza('Registro de la consola'), log.node)),
                apila(k.el('div', 'grid2'),
                    apila(k.panel(), cabeza('Ejecuciones por área · 30 días'), bVol.node,
                        cabeza('Tasa de fallo por área', '20px'), bFal.node),
                    apila(k.panel(), cabeza('Cómo se lee la flota'), ins.node)));

            /* ---------- gráficas: se crean una vez y se actualizan ---------- */
            var chLinea = k.chart(cbLinea.canvas, {
                type: 'line',
                data: {
                    labels: etiquetas,
                    datasets: [
                        { label: 'Ejecuciones', data: [], yAxisID: 'y', borderColor: C.teal, backgroundColor: 'rgba(45,212,191,.12)', borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0, pointHoverRadius: 4 },
                        { label: 'Fallos (eje derecho)', data: [], yAxisID: 'y1', borderColor: C.rose, borderWidth: 1.6, borderDash: [4, 3], tension: 0.3, fill: false, pointRadius: 0, pointHoverRadius: 4 }
                    ]
                },
                options: {
                    interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                        x: Object.assign({}, k.AXIS_BARE, { ticks: { padding: 8, maxTicksLimit: 8 } }),
                        y: Object.assign({}, k.AXIS, { beginAtZero: true }),
                        y1: Object.assign({}, k.AXIS_BARE, { position: 'right', beginAtZero: true, suggestedMax: 6 })
                    }
                }
            });
            var chEstado = k.chart(cbEstado.canvas, {
                type: 'doughnut',
                data: {
                    labels: ESTADOS.slice(),
                    datasets: [{ data: [0, 0, 0], backgroundColor: [C.green, C.amber, C.rose], borderColor: C.bg2, borderWidth: 2, hoverOffset: 6 }]
                },
                options: { cutout: '62%', plugins: { legend: { position: 'bottom' } } }
            });

            function filtrar() {
                var a = ctl.get('area'), e = ctl.get('estado'), c = ctl.get('crit'), u = ctl.get('umbral') / 100;
                return bots.filter(function (b) {
                    if (a !== 'Todas' && b.area !== a) return false;
                    if (e !== 'Todos' && estadoDe(b, u) !== e) return false;
                    if (c !== 'Todas' && b.crit !== c) return false;
                    return true;
                });
            }

            var visibles = [];
            function pintar(resaltar) {
                var u = ctl.get('umbral') / 100, lista = filtrar(), j;
                var ejec = 0, fallos = 0, rec = 0, min = 0;
                var serie = [], serieF = [], vol = {}, fal = {}, cuenta = [0, 0, 0];
                for (j = 0; j < 30; j++) { serie.push(0); serieF.push(0); }
                AREAS.forEach(function (a) { vol[a] = 0; fal[a] = 0; });
                lista.forEach(function (b) {
                    ejec += b.ejec; fallos += b.fallos; rec += b.rec; min += b.ejec * b.min;
                    vol[b.area] += b.ejec; fal[b.area] += b.fallos;
                    cuenta[ESTADOS.indexOf(estadoDe(b, u))]++;
                    for (j = 0; j < 30; j++) { serie[j] += b.dia[j]; serieF[j] += b.fdia[j]; }
                });
                var exito = ejec ? (ejec - fallos) / ejec * 100 : 100;
                var tono = exito >= 99 ? 'up' : (exito >= 97.5 ? '' : (exito >= 95 ? 'warn' : 'bad'));
                kpi.set(0, k.fmt(lista.length, 0));
                kpi.set(1, k.fmt(ejec, 0));
                kpi.set(2, ejec ? k.pct(exito, 2) : '—', ejec ? tono : '');
                kpi.set(3, k.fmt(min / 60, 0));

                var pico = 0, diaPico = 0;
                for (j = 0; j < 30; j++) if (serie[j] > pico) { pico = serie[j]; diaPico = j; }
                if (chLinea) {
                    chLinea.data.datasets[0].data = serie;
                    chLinea.data.datasets[1].data = serieF;
                    chLinea.update();
                }
                cbLinea.cap(ejec
                    ? 'El valle recurrente es el fin de semana. Pico de ' + k.fmt(pico, 0) + ' ejecuciones el día ' + k.pad(diaPico + 1) + '.'
                    : 'Sin ejecuciones en el filtro actual.');
                if (chEstado) {
                    chEstado.data.datasets[0].data = cuenta;
                    chEstado.update();
                }
                cbEstado.cap(cuenta[0] + ' estables, ' + cuenta[1] + ' con reintentos y ' + cuenta[2] +
                    ' degradados con el umbral en ' + k.pct(u * 100, 1) + '.');

                /* barras por área: el número va siempre como texto, no solo el color */
                var maxVol = 0, maxFal = 0, peor = null, picoArea = null;
                AREAS.forEach(function (a) {
                    if (vol[a] > maxVol) { maxVol = vol[a]; picoArea = a; }
                    var t = vol[a] ? fal[a] / vol[a] : 0;
                    if (vol[a] && t > maxFal) { maxFal = t; peor = a; }
                });
                bVol.clear(); bFal.clear();
                AREAS.forEach(function (a) {
                    if (!vol[a]) return;
                    bVol.add(a, vol[a], maxVol, C.teal, k.fmt(vol[a], 0));
                    var t = fal[a] / vol[a], e = clase(t, u);
                    bFal.add(a + ' · ' + e, t * 100, Math.max(maxFal * 100, u * 100), colorDe(C, e), k.pct(t * 100, 2));
                });

                /* tabla: cola de excepciones o mayor volumen, según el control */
                var porVol = ctl.get('orden') === 'vol';
                var top = lista.slice().sort(function (x, y) {
                    if (porVol) return y.ejec - x.ejec;
                    var d = rango(x, u) - rango(y, u);
                    if (d) return d;
                    if (y.fallos !== x.fallos) return y.fallos - x.fallos;
                    return y.ejec - x.ejec;
                }).slice(0, 10);
                visibles = top;
                tHead.textContent = porVol
                    ? 'Los ' + top.length + ' bots de mayor volumen del filtro'
                    : (cuenta[2]
                        ? 'Cola de excepciones — ' + cuenta[2] + ' degradados, en pantalla los ' +
                          Math.min(top.length, cuenta[2]) + ' de mayor criticidad'
                        : 'Cola de excepciones — ningún bot supera el umbral; se listan los de mayor tasa de fallo');
                var filas = top.map(function (b) {
                    var e = estadoDe(b, u);
                    return [b.id, b.proc, b.area + ' · ' + b.pais, b.crit, k.fmt(b.ejec, 0), k.fmt(b.fallos, 0),
                        k.pct(tasa(b) * 100, 2), k.fmt(b.ejec * b.min / 60, 0), { html: k.pill(tonoDe(e), e) }];
                });
                var t = k.table([
                    { t: 'Bot' }, { t: 'Proceso' }, { t: 'Área · país' }, { t: 'Crit.' },
                    { t: 'Ejec. 30 d', r: true }, { t: 'Fallos', r: true }, { t: 'Tasa de fallo', r: true },
                    { t: 'Horas', r: true }, { t: 'Estado' }
                ], filas);
                if (!filas.length) {
                    var tdv = k.txt('td', null, 'Ningún bot cumple los filtros con este umbral. Amplíe los criterios.');
                    tdv.colSpan = 9;
                    t.body.appendChild(apila(k.el('tr'), tdv));
                }
                tablaHost.innerHTML = '';
                tablaHost.appendChild(t.node);
                if (resaltar) {
                    top.forEach(function (b, idx) {
                        if (b.id === resaltar && t.body.children[idx]) t.body.children[idx].classList.add('hit');
                    });
                }

                var degAlta = lista.filter(function (b) { return estadoDe(b, u) === ESTADOS[2] && b.crit === 'Alta'; }).length;
                var conVol = AREAS.filter(function (a) { return vol[a] > 0; }).length;
                var volTop = top.reduce(function (s, b) { return s + b.ejec; }, 0);
                ins.clear();
                ins.add('amber', '!', 'Cola de excepciones: <b>' + cuenta[2] + '</b> bots por encima de <b>' + k.pct(u * 100, 1) +
                    '</b> de fallo, <b>' + degAlta + '</b> de criticidad alta. Baje el umbral y la cola crece: ese es el costo de vigilar más fino.');
                ins.add('green', '↺', fallos
                    ? '<b>' + k.pct(rec / fallos * 100, 1) + '</b> de los fallos se resuelven en la escalera de reintentos. El resto abre aviso con traza y espera a una persona.'
                    : 'Ningún fallo registrado en el filtro actual: la escalera de reintentos no tuvo que intervenir.');
                if (conVol > 1 && peor && picoArea) {
                    ins.add('teal', '▲', peor === picoArea
                        ? '<b>' + k.escapeHtml(picoArea) + '</b> concentra el <b>' + k.pct(vol[picoArea] / ejec * 100, 1) +
                          '</b> del volumen y además la peor tasa de fallo (<b>' + k.pct(maxFal * 100, 2) + '</b>). Ahí va primero la vigilancia humana.'
                        : '<b>' + k.escapeHtml(picoArea) + '</b> mueve el <b>' + k.pct(vol[picoArea] / ejec * 100, 1) +
                          '</b> del volumen, pero la peor tasa de fallo es de <b>' + k.escapeHtml(peor) + '</b> (<b>' +
                          k.pct(maxFal * 100, 2) + '</b>). Volumen y riesgo no viven en la misma área.');
                } else if (ejec) {
                    ins.add('teal', '▲', 'Los <b>' + top.length + '</b> bots en pantalla mueven el <b>' +
                        k.pct(volTop / ejec * 100, 1) + '</b> de las ejecuciones del filtro y acumulan <b>' +
                        k.fmt(top.reduce(function (s, b) { return s + b.fallos; }, 0), 0) + '</b> fallos: ahí se concentra la vigilancia humana.');
                } else {
                    ins.add('teal', '▲', 'El filtro actual no deja ejecuciones que comparar. Amplíe los criterios.');
                }
            }

            /* ---------- incidente: la secuencia real de recuperación ---------- */
            async function incidente() {
                var lista = filtrar();
                if (!lista.length) {
                    log.push('wa', 'No hay bots en este filtro. Amplíe los criterios para poder simular.');
                    return;
                }
                /* el incidente cae sobre un bot de la tabla: el visitante ve cambiar la fila */
                var libres = visibles.filter(function (b) { return !b.tocado; });
                if (!libres.length) libres = lista.filter(function (b) { return !b.tocado; });
                if (!libres.length) {
                    log.push('wa', 'Todos los bots de este filtro ya registraron un incidente en esta sesión. Cambie el filtro para simular otro.');
                    return;
                }
                ctl.busy('inc', true);
                esc.reset();
                try {
                    var b = libres[Math.floor(rInc() * libres.length)];
                    b.tocado = true;
                    var traza = 'TR-' + (7100 + Math.floor(rInc() * 890));
                    var reg = 90 + Math.floor(rInc() * 260), atraso = 62 + rInc() * 40;
                    /* guion: aviso previo, espera, estado del paso y línea de registro */
                    var guion = [
                        { p: 0, w: 520, e: 'fail', ms: '30 s', c: 'er', t: 'Paso 4 de 9: el conector de origen agotó el tiempo de espera a los 30 s. Traza ' + traza + '.' },
                        { p: 1, pre: ['wa', 'Reintento 1 de 3 — espera progresiva de 15 s. Estado guardado en el punto de control.'], w: 620, e: 'fail', ms: '15 s', c: 'er', t: 'Reintento 1 sin éxito: la sesión del conector sigue caducada (401 en el token de servicio).' },
                        { p: 2, pre: ['wa', 'Reintento 2 de 3 — espera progresiva de 45 s y sesión renovada con la credencial de servicio.'], w: 680, e: 'done', ms: '45 s', c: 'ok', t: 'Reintento 2 correcto: ' + k.fmt(reg, 0) + ' registros procesados desde el punto de control.' },
                        { p: 3, w: 520, e: 'done', ms: '0 duplicados', c: 'ok', t: 'Escritura idempotente: la clave determinista descartó lo ya escrito. Retraso total ' + k.fmt(atraso, 1) + ' s sobre un acuerdo de 15 min.' },
                        { p: 4, w: 460, e: 'done', ms: traza, c: 'in', t: 'Aviso al canal de operaciones con la traza, el paso, la excepción completa y el enlace a la ejecución.' }
                    ];
                    log.push('hl', 'Incidente abierto — ' + b.id + ' · ' + b.proc + ' · ' + b.area + ' (' + b.pais + ') · criticidad ' + b.crit);
                    for (i = 0; i < guion.length; i++) {
                        var g = guion[i];
                        if (g.pre) log.push(g.pre[0], g.pre[1]);
                        esc.set(g.p, 'run');
                        await k.wait(g.w);
                        esc.set(g.p, g.e, g.ms);
                        log.push(g.c, g.t);
                    }
                    /* el incidente entra al registro: 3 ejecuciones nuevas, 2 con fallo */
                    b.ejec += 3; b.dia[29] += 3;
                    b.fallos += 2; b.fdia[29] += 2;
                    b.rec += 2;
                    log.push('hl', 'Tablero actualizado — ' + b.id + ' pasa a "' + estadoDe(b, ctl.get('umbral') / 100) +
                        '" y queda bajo observación 48 h.');
                    pintar(b.id);
                } finally {
                    ctl.busy('inc', false);
                }
            }

            /* el arrastre del umbral repinta en vivo, pero no inunda el registro */
            var firma = '';
            function sello() {
                return [ctl.get('area'), ctl.get('estado'), ctl.get('crit'), ctl.get('umbral')].join(' | ');
            }
            ctl.on(function () {
                pintar(null);
                if (sello() === firma) return;
                firma = sello();
                log.push('in', 'Vista aplicada — área: ' + ctl.get('area') + ' · estado: ' + ctl.get('estado') +
                    ' · criticidad: ' + ctl.get('crit') + ' · umbral: ' + k.pct(ctl.get('umbral'), 1) +
                    ' · ' + filtrar().length + ' bots en pantalla.');
            });
            ctl.onClick('inc', function () { incidente(); });

            /* estado de trabajo desde el primer segundo */
            pintar(null);
            firma = sello();
            var u0 = ctl.get('umbral') / 100, totEjec = 0, degr = 0;
            bots.forEach(function (b) {
                totEjec += b.ejec;
                if (estadoDe(b, u0) === ESTADOS[2]) degr++;
            });
            log.push('hl', 'Consola en línea — ' + bots.length + ' bots inventariados en ' + PAISES.length + ' países, lectura continua del registro central.');
            log.push('in', 'Registro central: ' + k.fmt(totEjec, 0) + ' ejecuciones leídas en los últimos 30 días.');
            log.push('ok', (bots.length - degr) + ' bots dentro de umbral. No requieren mirada humana hoy.');
            log.push('wa', 'Cola de excepciones: ' + degr + ' bots por encima de ' + k.pct(u0 * 100, 1) + ' de fallo, ordenados por criticidad.');
        }
    });
})();
