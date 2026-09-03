/* ============================================================
   ESCUDO — control de calidad antes de la carga
   El lote se valida contra reglas explícitas ANTES de tocar el
   modelo. El visitante enciende y apaga reglas, mueve el umbral
   de carga y cambia la política: el índice, la cuarentena, el
   recorrido y el motivo de cada rechazo se recalculan en vivo.
   Datos sintéticos con semilla fija.
   ============================================================ */
(function () {
    'use strict';
    var LAB = window.LAB;

    var TOTAL = 260;
    var PERIODO = '2026-08';
    var LOTE = 'LT-' + PERIODO + '-31';

    var PROV = [
        { n: 'Distribuidora Aurora', c: 'PRV-0142', s: 'aurora' }, { n: 'Ferretería El Roble', c: 'PRV-0318', s: 'elroble' },
        { n: 'Transportes Sabana', c: 'PRV-0407', s: 'sabana' }, { n: 'Suministros Calderón', c: 'PRV-0523', s: 'calderon' },
        { n: 'Alimentos Marbella', c: 'PRV-0611', s: 'marbella' }, { n: 'Textiles Nuvo', c: 'PRV-0745', s: 'nuvo' },
        { n: 'Papelería Quetzal', c: 'PRV-0802', s: 'quetzal' }, { n: 'Refrigeración Delta', c: 'PRV-0917', s: 'refdelta' },
        { n: 'Plásticos Tamarindo', c: 'PRV-1024', s: 'tamarindo' }, { n: 'Empaques Lumen', c: 'PRV-1138', s: 'lumen' },
        { n: 'Servicios Cañaveral', c: 'PRV-1247', s: 'canaveral' }, { n: 'Herrajes Nortec', c: 'PRV-1355', s: 'nortec' }
    ];

    /* El orden importa: cada registro se atribuye a la PRIMERA regla
       activa que lo detiene, así la suma de rechazos = la cuarentena. */
    var REGLAS = [
        { id: 'doc', s: 'Documento fiscal', n: 'Documento fiscal presente y con formato', d: 'Aparta el registro sin número de documento o con un formato que el catálogo no reconoce.' },
        { id: 'fec', s: 'Fecha del periodo', n: 'Fecha válida y dentro del periodo', d: 'Descarta fechas imposibles y las que caen fuera del mes que se está cargando.' },
        { id: 'mon', s: 'Monto > 0', n: 'Monto mayor que cero', d: 'Un monto negativo o en cero no es una factura: es captura mal hecha o una nota mal tipificada.' },
        { id: 'prv', s: 'Código de proveedor', n: 'Proveedor con código en el catálogo', d: 'Sin código no hay a quién imputar el gasto; el nombre suelto no concilia contra nada.' },
        { id: 'ref', s: 'Referencia única', n: 'Referencia única dentro del lote', d: 'La segunda aparición de una referencia se aparta: es el patrón clásico de doble carga.' },
        { id: 'cor', s: 'Correo de contacto', n: 'Correo de contacto bien formado', d: 'Si el correo no es válido el aviso de pago no llega y el reclamo vuelve por teléfono.' }
    ];

    var MAL_CORREO = ['facturacion.{s}.com', 'pagos@{s}', 'cobros@{s}..com',
        'facturacion @{s}.com', '@{s}.com', 'pagos@{s},com'];
    var MAL_DOC = ['DTE26-4821', '2026/000482', 'DTE-2026-48A1'];

    function p3(n) { return (n < 10 ? '00' : (n < 100 ? '0' : '')) + n; }
    function p6(n) { var s = String(n); while (s.length < 6) s = '0' + s; return s; }
    function dinero(n) { return (n < 0 ? '-' : '') + '$' + LAB.kit.fmt(Math.abs(n), 0); }
    function nombreRegla(id) {
        for (var i = 0; i < REGLAS.length; i++) if (REGLAS[i].id === id) return REGLAS[i].s;
        return id;
    }

    /* ---------- lote sintético con defectos sembrados ---------- */
    function datos() {
        var k = LAB.kit, r = k.rng(3357), regs = [], i;

        for (i = 0; i < TOTAL; i++) {
            var pv = PROV[Math.floor(r() * PROV.length)];
            var buzon = k.pick(r, ['facturacion', 'pagos', 'cobros']);
            regs.push({
                ln: 'L-' + p3(i + 1), prov: pv.n, cod: pv.c, slug: pv.s, f: {},
                doc: 'DTE-2026-' + p6(410000 + Math.floor(r() * 89000)),
                fecha: PERIODO + '-' + k.pad(1 + Math.floor(r() * 31)),
                monto: Math.round((85 + r() * 18400) * 100) / 100,
                ref: 'REF-' + (80000 + i * 7 + Math.floor(r() * 6)),
                correo: buzon + '@' + pv.s + '.com'
            });
        }

        /* barajado determinista para elegir a quién le toca el defecto */
        var orden = [];
        for (i = 0; i < TOTAL; i++) orden.push(i);
        for (i = orden.length - 1; i > 0; i--) {
            var j = Math.floor(r() * (i + 1)), t = orden[i];
            orden[i] = orden[j]; orden[j] = t;
        }
        var p = orden.slice(0, 29);
        var donantes = orden.slice(40, 46).map(function (x) { return regs[x]; });

        /* Índices repetidos entre listas: registros con más de un defecto. */
        var plan = {
            doc: [p[0], p[1], p[2], p[3], p[4], p[5], p[23]],
            fec: [p[6], p[7], p[8], p[9], p[10]],
            mon: [p[11], p[12], p[13], p[14], p[6]],
            prv: [p[15], p[16], p[17], p[18]],
            ref: [p[19], p[20], p[21], p[22], p[15], p[16]],
            cor: [p[23], p[24], p[25], p[26], p[27], p[28], p[0], p[1]]
        };

        plan.doc.forEach(function (idx, n) {
            var x = regs[idx];
            if (n % 2 === 0) { x.doc = ''; x.f.doc = 'Documento fiscal vacío'; }
            else { x.doc = MAL_DOC[(n / 2 | 0) % MAL_DOC.length]; x.f.doc = 'Formato de documento no reconocido: ' + x.doc; }
        });
        plan.fec.forEach(function (idx, n) {
            var x = regs[idx], dia = LAB.kit.pad(3 + n * 5);
            if (n % 2 === 0) { x.fecha = '2026-13-' + dia; x.f.fec = 'Fecha imposible: ' + x.fecha + ' (no existe el mes 13)'; }
            else { x.fecha = (n === 1 ? '2026-06-' : '2026-09-') + dia; x.f.fec = 'Fecha fuera del periodo ' + PERIODO + ': ' + x.fecha; }
        });
        plan.mon.forEach(function (idx, n) {
            var x = regs[idx];
            if (n % 2 === 0) { x.monto = -Math.round(x.monto); x.f.mon = 'Monto negativo: ' + dinero(x.monto); }
            else { x.monto = 0; x.f.mon = 'Monto en cero'; }
        });
        plan.prv.forEach(function (idx) {
            regs[idx].cod = '';
            regs[idx].f.prv = 'Proveedor sin código en el catálogo: ' + regs[idx].prov;
        });
        plan.ref.forEach(function (idx, n) {
            var d = donantes[n % donantes.length];
            regs[idx].ref = d.ref;
            regs[idx].f.ref = 'Referencia duplicada de ' + d.ln + ': ' + d.ref;
        });
        plan.cor.forEach(function (idx, n) {
            regs[idx].correo = MAL_CORREO[n % MAL_CORREO.length].replace('{s}', regs[idx].slug);
            regs[idx].f.cor = 'Correo mal formado: ' + regs[idx].correo;
        });

        return regs;
    }

    /* Índice de los doce lotes anteriores: el programa venía mejorando
       porque el motivo se devuelve al origen y el origen corrige. */
    function historico() {
        var r = LAB.kit.rng(9184), h = [], i;
        for (i = 0; i < 12; i++) h.push(Math.round((71.4 + i * 1.28 + (r() - 0.5) * 2.6) * 10) / 10);
        return h;
    }

    LAB.register({
        id: 'escudo',
        name: 'ESCUDO',
        family: 'datos',
        tagline: 'Calidad de datos',
        title: 'Control de calidad antes de la carga',
        intro: 'Antes de que un tablero mienta, alguien tiene que atrapar el dato malo. Encienda y apague reglas sobre un lote de 260 facturas, mueva el umbral de carga y cambie la política: verá moverse el índice de calidad, la cuarentena y el motivo exacto de cada rechazo.',
        spec: {
            trigger: 'Un flujo programado en Power Automate detecta el archivo del lote en la carpeta de entrada. Ningún registro avanza al modelo sin pasar antes por el control.',
            systems: 'Validación por reglas en Python sobre el archivo crudo, área de preparación en SQL Server y tablero de calidad con el histórico por lote.',
            output: 'Lote limpio listo para cargar, cuarentena con el motivo escrito registro por registro e índice de calidad acumulado lote a lote.',
            failure: 'Nada malo entra al modelo. El lote se devuelve al origen con el detalle de qué corregir, línea, campo y motivo, para que la corrección se haga una vez y en la fuente.'
        },
        impact: [
            ['0', 'registros con defecto llegando al tablero'],
            ['< 2 min', 'de control por lote, antes de cada carga'],
            ['100%', 'de los rechazos con línea, campo y motivo']
        ],
        render: function (host, k) {
            var C = k.C;
            var regs = datos();
            var hist = historico();
            var estado = {};
            var cajas = [];
            var corriendo = false;
            var decPrev = null;
            REGLAS.forEach(function (R) { estado[R.id] = true; });

            var opcVer = [{ v: '*', t: 'Todas las reglas' }];
            REGLAS.forEach(function (R) { opcVer.push({ v: R.id, t: R.s }); });

            var ctl = k.controls([
                { k: 'modo', t: 'select', label: 'Política del control', options: ['Cuarentena', 'Rechazo total', 'Solo advertir'], value: 'Cuarentena' },
                { k: 'umbral', t: 'range', label: 'Umbral de carga sin revisión', min: 80, max: 99, step: 1, value: 95, suffix: '%', decimals: 0 },
                { k: 'ver', t: 'select', label: 'Ver en cuarentena', options: opcVer, value: '*' },
                { k: 'run', t: 'button', label: 'Ejecutar control', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kpi = k.kpis([['Registros del lote', '—'], ['Pasan las reglas', '—'],
                ['En cuarentena', '—'], ['Índice de calidad', '—'], ['Decisión de carga', '—']]);
            host.appendChild(kpi.node);

            var pRec = k.panel();
            pRec.appendChild(k.txt('div', 'mono-head', 'Recorrido del lote ' + LOTE));
            var pipe = k.pipe([
                { n: 'Carpeta de entrada', m: 'Archivo crudo' }, { n: 'Lectura y tipado', m: 'Python' },
                { n: 'Motor de reglas', m: '6 validaciones' }, { n: 'Área de preparación', m: 'Lote limpio' },
                { n: 'Cuarentena', m: 'Motivo por registro' }, { n: 'Tablero', m: 'Carga autorizada' }
            ]);
            pRec.appendChild(pipe.node);
            host.appendChild(pRec);

            var fila1 = k.el('div', 'grid2 wide-left');
            var pReglas = k.panel(), rulesBox = k.el('div', 'rules');
            pReglas.appendChild(k.txt('div', 'mono-head', 'Reglas del control — se aplican en este orden'));
            pReglas.appendChild(rulesBox);
            var cbHist = k.chartbox('Índice de calidad por lote', 'Últimos doce lotes y el que está en pantalla.');
            fila1.appendChild(pReglas);
            fila1.appendChild(cbHist.node);
            host.appendChild(fila1);

            var fila2 = k.el('div', 'grid2 wide-left');
            var pTabla = k.panel(), tablaHost = k.el('div');
            var tituloTabla = k.txt('div', 'mono-head', 'Cuarentena');
            pTabla.appendChild(tituloTabla);
            pTabla.appendChild(tablaHost);
            var pBars = k.panel(), bars = k.bars();
            pBars.appendChild(k.txt('div', 'mono-head', 'Rechazos por regla'));
            pBars.appendChild(bars.node);
            fila2.appendChild(pTabla);
            fila2.appendChild(pBars);
            host.appendChild(fila2);

            var fila3 = k.el('div', 'grid2 wide-left');
            var pIns = k.panel(), ins = k.insights();
            pIns.appendChild(k.txt('div', 'mono-head', 'Cómo se lee el control'));
            pIns.appendChild(ins.node);
            var pLog = k.panel(), log = k.log('268px');
            pLog.appendChild(k.txt('div', 'mono-head', 'Registro del control'));
            pLog.appendChild(log.node);
            fila3.appendChild(pIns);
            fila3.appendChild(pLog);
            host.appendChild(fila3);

            /* ---------- filas de reglas activables ---------- */
            var conta = {};
            REGLAS.forEach(function (R) {
                var row = k.el('div', 'rule-r'), izq = k.el('div'), der = k.el('div', 'rr');
                izq.appendChild(k.txt('div', 'rt', R.n));
                izq.appendChild(k.txt('small', null, R.d));
                var cnt = k.txt('span', 'rc', '—'), lab = k.el('label', 'check');
                var cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = true;
                cb.setAttribute('aria-label', 'Regla activa: ' + R.n);
                cb.addEventListener('change', function () {
                    estado[R.id] = cb.checked;
                    log.push(cb.checked ? 'ok' : 'wa', 'Regla ' + (cb.checked ? 'activada' : 'desactivada') + ': ' +
                        R.n + '. Control recalculado sobre los ' + k.fmt(TOTAL, 0) + ' registros.');
                    pintar();
                });
                lab.appendChild(cb);
                lab.appendChild(k.txt('span', null, 'Activa'));
                der.appendChild(cnt); der.appendChild(lab);
                row.appendChild(izq); row.appendChild(der);
                rulesBox.appendChild(row);
                conta[R.id] = cnt;
                cajas.push(cb);
            });

            /* ---------- evaluación del lote ---------- */
            function evaluar() {
                var activas = REGLAS.filter(function (R) { return estado[R.id]; });
                var conteo = {}, detenidos = [];
                REGLAS.forEach(function (R) { conteo[R.id] = 0; });
                regs.forEach(function (x) {
                    var primera = null, cuantas = 0;
                    activas.forEach(function (R) {
                        if (!x.f[R.id]) return;
                        cuantas++;
                        if (!primera) primera = R;
                    });
                    if (!primera) return;
                    conteo[primera.id]++;
                    detenidos.push({ r: x, regla: primera, motivo: x.f[primera.id], n: cuantas });
                });
                return { activas: activas, conteo: conteo, detenidos: detenidos };
            }

            var SUCIOS = regs.filter(function (x) { return Object.keys(x.f).length > 0; }).length;
            var IDX_REAL = (TOTAL - SUCIOS) / TOTAL * 100;

            /* ---------- gráfica del histórico ---------- */
            var etiquetas = [], radios = [], q;
            for (q = 0; q < hist.length; q++) { etiquetas.push('L' + (q + 1)); radios.push(0); }
            etiquetas.push('Actual');
            radios.push(5);
            var UMB0 = ctl.get('umbral');
            var chHist = k.chart(cbHist.canvas, {
                type: 'line',
                data: {
                    labels: etiquetas,
                    datasets: [
                        { label: 'Índice de calidad', data: hist.concat([Math.round(IDX_REAL * 10) / 10]),
                            borderColor: C.teal, tension: 0.32, backgroundColor: 'rgba(45,212,191,.12)',
                            borderWidth: 2, fill: true, pointRadius: radios, pointHoverRadius: 5,
                            pointBackgroundColor: C.teal },
                        { label: 'Umbral de carga (' + UMB0 + '%)', data: etiquetas.map(function () { return UMB0; }),
                            borderColor: C.amber, borderWidth: 1.4, borderDash: [5, 4], pointRadius: 0, fill: false }
                    ]
                },
                options: {
                    interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                        x: Object.assign({}, k.AXIS_BARE),
                        y: Object.assign({}, k.AXIS, {
                            min: 60, max: 100,
                            ticks: { padding: 8, callback: function (v) { return v + '%'; } }
                        })
                    }
                }
            });

            /* ---------- recorrido en su estado de reposo ---------- */
            function pintarPipe(ev, modo, retenido) {
                var fallos = ev.detenidos.length, limpios = TOTAL - fallos;
                pipe.set(0, 'done', k.fmt(TOTAL, 0) + ' registros');
                pipe.set(1, 'done', '11 columnas');
                pipe.set(2, fallos ? 'fail' : 'done', k.fmt(fallos, 0) + ' hallazgos');
                if (modo === 'Rechazo total' && fallos) {
                    pipe.set(3, 'fail', 'lote bloqueado');
                    pipe.set(4, 'fail', k.fmt(TOTAL, 0) + ' devueltos');
                    pipe.set(5, 'fail', 'carga cancelada');
                } else if (modo === 'Solo advertir') {
                    pipe.set(3, 'done', k.fmt(TOTAL, 0) + ' preparados');
                    pipe.set(4, fallos ? 'fail' : 'done', k.fmt(fallos, 0) + ' avisos');
                    pipe.set(5, 'done', k.fmt(TOTAL, 0) + ' cargados');
                } else {
                    pipe.set(3, 'done', k.fmt(limpios, 0) + ' limpios');
                    pipe.set(4, fallos ? 'fail' : 'done', k.fmt(fallos, 0) + ' apartados');
                    if (retenido) pipe.set(5, 'fail', 'espera revisión');
                    else pipe.set(5, 'done', k.fmt(limpios, 0) + ' cargados');
                }
            }

            /* ---------- repintado completo con los controles actuales ---------- */
            function pintar() {
                var ev = evaluar();
                var fallos = ev.detenidos.length;
                var modo = ctl.get('modo'), umbral = ctl.get('umbral'), ver = ctl.get('ver');
                var idx = (TOTAL - fallos) / TOTAL * 100;
                var retenido = modo === 'Cuarentena' && fallos > 0 && idx < umbral;
                var pasan, cuar, dec, tonoDec, destino;

                pasan = TOTAL - fallos;
                if (modo === 'Rechazo total') {
                    cuar = fallos ? TOTAL : 0;
                    dec = fallos ? 'Lote devuelto' : 'Carga autorizada';
                    tonoDec = fallos ? 'bad' : 'ok';
                    destino = k.pill('bad', 'Devuelto al origen');
                } else if (modo === 'Solo advertir') {
                    cuar = 0;
                    dec = fallos ? 'Carga con avisos' : 'Carga autorizada';
                    tonoDec = fallos ? 'warn' : 'ok';
                    destino = k.pill('warn', 'Cargado con aviso');
                } else {
                    cuar = fallos;
                    dec = retenido ? 'Carga retenida' : 'Carga autorizada';
                    tonoDec = retenido ? 'warn' : 'ok';
                    destino = k.pill('warn', 'A cuarentena');
                }

                kpi.set(0, k.fmt(TOTAL, 0));
                kpi.set(1, k.fmt(pasan, 0), '');
                kpi.set(2, k.fmt(cuar, 0), (modo === 'Rechazo total' && fallos) ? 'bad' : (cuar ? 'warn' : ''));
                kpi.set(3, k.pct(idx, 1), idx >= umbral ? 'up' : (idx >= umbral - 8 ? 'warn' : 'bad'));
                kpi.html(4, k.pill(tonoDec, dec));

                REGLAS.forEach(function (R) {
                    conta[R.id].textContent = estado[R.id] ? (k.fmt(ev.conteo[R.id], 0) + ' rechazos') : 'inactiva';
                });

                var maxi = 1;
                REGLAS.forEach(function (R) { if (ev.conteo[R.id] > maxi) maxi = ev.conteo[R.id]; });
                bars.clear();
                REGLAS.forEach(function (R, i) {
                    if (estado[R.id]) bars.add(R.s, ev.conteo[R.id], maxi, k.CAT[i % k.CAT.length], k.fmt(ev.conteo[R.id], 0));
                    else bars.add(R.s, 0, maxi, 'rgba(148,180,220,.22)', 'inactiva');
                });

                var lista = ev.detenidos;
                if (ver !== '*') lista = lista.filter(function (d) { return d.regla.id === ver; });
                var filas = lista.slice(0, 10).map(function (d) {
                    return [d.r.ln, d.r.prov, dinero(d.r.monto),
                        d.regla.s + (d.n > 1 ? ' (+' + (d.n - 1) + ')' : ''), d.motivo, { html: destino }];
                });
                var t = k.table([{ t: 'Línea' }, { t: 'Proveedor' }, { t: 'Monto', r: true },
                    { t: 'Regla que lo detuvo' }, { t: 'Motivo exacto' }, { t: 'Destino' }], filas);
                if (!filas.length) {
                    var fv = k.el('tr'), td = k.txt('td', null, !ev.activas.length
                        ? 'Sin reglas activas: el lote entra completo y sin revisar.'
                        : (ver !== '*' ? 'Ningún registro fue detenido por esta regla con la configuración actual.'
                            : 'Ningún registro incumple las reglas activas.'));
                    td.colSpan = 6;
                    fv.appendChild(td);
                    t.body.appendChild(fv);
                }
                tablaHost.textContent = '';
                tablaHost.appendChild(t.node);
                tituloTabla.textContent = 'Cuarentena — ' + (ver === '*' ? 'mostrando ' : nombreRegla(ver) + ': ') +
                    Math.min(10, lista.length) + ' de ' + lista.length + ' registros detenidos, con su motivo';

                if (chHist) {
                    chHist.data.datasets[0].data[hist.length] = Math.round(idx * 10) / 10;
                    chHist.data.datasets[1].data = etiquetas.map(function () { return umbral; });
                    chHist.data.datasets[1].label = 'Umbral de carga (' + umbral + '%)';
                    chHist.update('none');
                }
                cbHist.cap('Lote actual: ' + k.pct(idx, 1) + ' con ' + ev.activas.length + ' de 6 reglas activas. ' +
                    (idx >= umbral ? 'Sobre el umbral de ' + umbral + '%.' : 'Bajo el umbral de ' + umbral + '%.'));

                var multiAct = ev.detenidos.filter(function (d) { return d.n > 1; }).length;
                ins.clear();
                ins.add('teal', '✓', 'Cobertura del control: <b>' + ev.activas.length + ' de 6</b> reglas. Con las seis encendidas el lote mide <b>' + k.pct(IDX_REAL, 1) + '</b>: ese es el número real. ' +
                    (ev.activas.length < 6 ? 'Ahora marca <b>' + k.pct(idx, 1) + '</b> porque hay menos reglas mirando, no porque el lote haya mejorado.' : 'Apagar una regla sube el índice sin corregir un solo registro.'));
                ins.add('violet', '≡', fallos
                    ? '<b>' + k.fmt(multiAct, 0) + '</b> de los <b>' + k.fmt(fallos, 0) + '</b> registros detenidos incumplen más de una regla activa; la tabla los marca con (+n). Cada rechazo se atribuye a la primera regla que lo para, así la suma por regla es igual a la cuarentena y ningún registro se cuenta dos veces.'
                    : 'Sin reglas activas que detengan nada, la atribución no aplica: cada rechazo se asigna siempre a la primera regla que para al registro, nunca a todas las que incumple.');
                if (modo === 'Rechazo total') {
                    ins.add('rose', '✕', 'Rechazo total: un solo fallo tumba el lote. Con <b>' + k.fmt(fallos, 0) + '</b> hallazgos, los ' + k.fmt(TOTAL, 0) + ' registros vuelven al origen. Es la política correcta cuando el lote es una unidad contable y es cara cuando no lo es.');
                    ins.add('cyan', '<', 'Aquí el umbral no decide nada: basta un hallazgo para devolver el lote. El <b>' + umbral + '%</b> queda dibujado en el histórico solo como referencia de a dónde debería llegar el origen.');
                } else if (modo === 'Solo advertir') {
                    ins.add('amber', '!', 'Solo advertir: los ' + k.fmt(TOTAL, 0) + ' registros entran igual y las <b>' + k.fmt(fallos, 0) + '</b> excepciones quedan como aviso. Sirve para medir antes de encender la política; si se deja así, el tablero vuelve a mentir.');
                    ins.add('cyan', '<', 'El umbral tampoco retiene nada en este modo: el <b>' + umbral + '%</b> solo sirve para contar cuántos lotes pasarían el control antes de encender la política de verdad.');
                } else {
                    ins.add('green', '→', 'Cuarentena: entran <b>' + k.fmt(pasan, 0) + '</b> registros limpios y se apartan <b>' + k.fmt(fallos, 0) + '</b> con su motivo escrito. El origen corrige solo lo que falló y reenvía; el resto ya está cargado.');
                    ins.add('cyan', '<', 'Umbral de <b>' + umbral + '%</b>: por debajo, el problema deja de ser puntual y apunta a una exportación mal hecha en el origen, así que la carga espera revisión humana aunque los limpios estén listos. El lote marca <b>' + k.pct(idx, 1) + '</b>: ' +
                        (retenido ? 'carga retenida.' : 'carga autorizada sin intervención.'));
                }

                if (!corriendo) pintarPipe(ev, modo, retenido);
                if (decPrev !== null && dec !== decPrev) {
                    log.push(tonoDec === 'ok' ? 'ok' : (tonoDec === 'bad' ? 'er' : 'wa'),
                        'Decisión de carga: ' + dec + ' — índice ' + k.pct(idx, 1) + ', umbral ' + umbral + '%, política ' + modo + '.');
                }
                decPrev = dec;
            }

            /* ---------- ejecución animada del recorrido ---------- */
            function bloquear(b) {
                corriendo = b;
                ctl.busy('run', b);
                cajas.forEach(function (cb) { cb.disabled = b; });
                k.$$('select, input[type="range"]', ctl.node).forEach(function (n) { n.disabled = b; });
            }

            async function ejecutar() {
                if (corriendo) return;
                var modo = ctl.get('modo'), umbral = ctl.get('umbral');
                var ev = evaluar();
                var fallos = ev.detenidos.length;
                var idx = (TOTAL - fallos) / TOTAL * 100;
                var retenido = modo === 'Cuarentena' && fallos > 0 && idx < umbral;
                bloquear(true);
                pipe.reset();

                log.push('hl', 'Lote ' + LOTE + ' detectado en la carpeta de entrada — ' + k.fmt(TOTAL, 0) + ' registros, política: ' + modo + '.');
                pipe.set(0, 'run');
                await k.wait(400);
                pipe.set(0, 'done', k.fmt(TOTAL, 0) + ' registros');

                pipe.set(1, 'run');
                await k.wait(460);
                log.push('in', 'Lectura y tipado: 11 columnas, separador detectado, codificación UTF-8. Sin escritura todavía.');
                pipe.set(1, 'done', '11 columnas');

                pipe.set(2, 'run');
                log.push('in', 'Motor de reglas: ' + ev.activas.length + ' de 6 validaciones activas sobre el archivo crudo.');
                for (var i = 0; i < REGLAS.length; i++) {
                    var R = REGLAS[i];
                    await k.wait(240);
                    if (!estado[R.id]) { log.push('wa', R.n + ' — regla desactivada, no se evalúa.'); continue; }
                    var c = ev.conteo[R.id];
                    log.push(c ? 'er' : 'ok', R.n + ' — ' + (c ? k.fmt(c, 0) + ' registros detenidos.' : 'sin hallazgos.'));
                }
                pipe.set(2, fallos ? 'fail' : 'done', k.fmt(fallos, 0) + ' hallazgos');
                await k.wait(360);

                if (modo === 'Rechazo total' && fallos) {
                    pipe.set(3, 'fail', 'lote bloqueado');
                    pipe.set(4, 'fail', k.fmt(TOTAL, 0) + ' devueltos');
                    log.push('er', 'Rechazo total: el lote completo se devuelve al origen con el detalle de las ' + k.fmt(fallos, 0) + ' líneas a corregir.');
                    await k.wait(420);
                    pipe.set(5, 'fail', 'carga cancelada');
                    log.push('wa', 'Carga cancelada. El tablero conserva el último lote válido; ningún dato malo lo alcanza.');
                } else if (modo === 'Solo advertir') {
                    pipe.set(3, 'done', k.fmt(TOTAL, 0) + ' preparados');
                    pipe.set(4, 'run', k.fmt(fallos, 0) + ' avisos');
                    log.push('wa', 'Solo advertir: ' + k.fmt(fallos, 0) + ' excepciones registradas como aviso; los ' + k.fmt(TOTAL, 0) + ' registros siguen a la carga.');
                    await k.wait(420);
                    pipe.set(4, fallos ? 'fail' : 'done', k.fmt(fallos, 0) + ' avisos');
                    pipe.set(5, 'done', k.fmt(TOTAL, 0) + ' cargados');
                    log.push('er', 'Advertencia: el tablero recibe ' + k.fmt(fallos, 0) + ' registros con defecto conocido. Modo de medición, no de producción.');
                } else {
                    pipe.set(3, 'done', k.fmt(TOTAL - fallos, 0) + ' limpios');
                    await k.wait(360);
                    pipe.set(4, fallos ? 'fail' : 'done', k.fmt(fallos, 0) + ' apartados');
                    log.push(fallos ? 'wa' : 'ok', fallos
                        ? k.fmt(fallos, 0) + ' registros a cuarentena, cada uno con línea, campo y motivo. Aviso al origen con el archivo de correcciones.'
                        : 'Sin hallazgos: el lote completo pasa a preparación.');
                    await k.wait(400);
                    if (retenido) {
                        pipe.set(5, 'fail', 'espera revisión');
                        log.push('wa', 'Índice ' + k.pct(idx, 1) + ' bajo el umbral de ' + umbral + '%: la carga queda retenida. Con esa proporción de fallas se revisa la exportación de origen antes de cargar nada.');
                    } else {
                        pipe.set(5, 'done', k.fmt(TOTAL - fallos, 0) + ' cargados');
                        log.push('ok', 'Carga autorizada: ' + k.fmt(TOTAL - fallos, 0) + ' registros limpios al modelo. Cero registros con defecto en el tablero.');
                    }
                }
                await k.wait(300);
                log.push('in', 'Control terminado en 1 min 52 s. Índice del lote publicado en el histórico de calidad.');
                bloquear(false);
            }

            /* ---------- controles en vivo ---------- */
            var prev = { modo: ctl.get('modo'), ver: ctl.get('ver') };
            ctl.on(function (get) {
                var m = get('modo'), v = get('ver');
                if (m !== prev.modo) log.push('in', 'Política del control: ' + m + '. Cambia la consecuencia, no la detección: los hallazgos son los mismos.');
                if (v !== prev.ver) log.push('in', 'Filtro de cuarentena: ' + (v === '*' ? 'todas las reglas' : nombreRegla(v)) + '.');
                prev = { modo: m, ver: v };
                pintar();
            });
            ctl.onClick('run', function () { ejecutar(); });

            /* ---------- estado de trabajo desde el primer segundo ---------- */
            pintar();
            log.push('hl', 'Control ejecutado sobre el lote ' + LOTE + ' — ' + k.fmt(TOTAL, 0) + ' registros leídos de la carpeta de entrada.');
            log.push('ok', 'Seis reglas activas. Ningún registro llega al tablero sin pasar por ellas.');
            log.push('wa', k.fmt(SUCIOS, 0) + ' registros a cuarentena con motivo escrito; el archivo de correcciones ya salió al origen.');
            log.push('in', 'Índice del lote: ' + k.pct(IDX_REAL, 1) + ', bajo el umbral de ' + UMB0 + '%: la carga queda retenida hasta la revisión.');
        }
    });
})();
