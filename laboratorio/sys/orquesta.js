/* ORQUESTA — enrutamiento de aprobaciones de compra: la cadena de
   firmantes se reconstruye con cada cambio y después se ejecuta. */
(function () {
    'use strict';
    var LAB = window.LAB;

    var CENTROS = ['Operaciones', 'Proyectos', 'Administración', 'Tecnología'];

    /* Umbrales de la política: una sola fuente para las reglas y los textos. */
    var U = { menor: 1000, gerencia: 10000, direccion: 50000, meta: 60 };

    /* Segundos de proceso por tipo de paso: fijos, dos corridas iguales dan lo mismo. */
    var BOT = {
        politica: 4.2, cumplimiento: 11.4, presupuesto: 8.6, automatica: 2.4,
        jefatura: 12.1, gerencia: 13.8, direccion: 14.6, proyectos: 9.2, emision: 10.9
    };
    var ESCALA_SEG = 6.4;   /* costo del reintento y del aviso al suplente */
    var FOLIO = 2088;       /* último folio del histórico; las corridas siguen desde aquí */

    /* Condiciones que el motor evalúa en cada solicitud. */
    var REGLAS = [
        'monto sobre el umbral de menor cuantía',
        'monto sobre el umbral de gerencia',
        'monto sobre el umbral de dirección',
        'proveedor fuera del maestro',
        'partida presupuestaria excedida',
        'centro de costo con control de obra',
        'marca de urgencia sobre los SLA',
        'firmante sin respuesta dentro del SLA'
    ];

    function rutaDe(m) {
        if (m <= U.menor) return 'Menor cuantía';
        if (m > U.direccion) return 'Dirección financiera';
        if (m > U.gerencia) return 'Gerencia';
        return 'Jefatura';
    }

    function hh(h) {
        var k = LAB.kit;
        return (h % 1 === 0 ? k.fmt(h, 0) : k.fmt(h, 1)) + ' h';
    }
    function nombrePaso(s) { return s.quien ? s.rol + ' · ' + s.quien : s.rol; }
    function slaPaso(s, escalado) {
        if (!s.firma) return 'resuelve el flujo';
        return 'SLA ' + hh(s.h) + (escalado ? ' + escalamiento' : '');
    }

    /* Reglas de enrutamiento. Solo los pasos con firma consumen SLA humano;
       los demás los resuelve el flujo en segundos. */
    function cadena(c, D) {
        var p = [];
        p.push({ id: 'politica', rol: 'Validación de política de compra', h: 0, firma: false });
        if (c.nuevo) p.push({ id: 'cumplimiento', rol: 'Cumplimiento — alta de proveedor', quien: D.roster.cumplimiento, h: 8, firma: true });
        if (c.excedido) p.push({ id: 'presupuesto', rol: 'Revisión presupuestaria', quien: D.roster.presupuesto, h: 12, firma: true });
        if (c.monto <= U.menor) {
            p.push({ id: 'automatica', rol: 'Aprobación automática por monto menor', h: 0, firma: false });
        } else {
            p.push({ id: 'jefatura', rol: 'Jefatura de área', quien: D.roster.jefe[c.centro], h: c.urgente ? 4 : 8, firma: true });
            if (c.monto > U.gerencia) p.push({ id: 'gerencia', rol: 'Gerencia de ' + c.centro, quien: D.roster.gerente[c.centro], h: c.urgente ? 8 : 24, firma: true });
            if (c.monto > U.direccion) p.push({ id: 'direccion', rol: 'Dirección financiera', quien: D.roster.direccion, h: c.urgente ? 12 : 48, firma: true });
        }
        if (c.centro === 'Proyectos') p.push({ id: 'proyectos', rol: 'Control de proyectos', quien: D.roster.proyectos, h: 6, firma: true });
        p.push({ id: 'emision', rol: 'Emisión de orden y notificación', h: 0, firma: false });

        /* El escalamiento cae siempre sobre la primera firma de la cadena. */
        var escala = -1, i;
        if (c.demora) {
            for (i = 0; i < p.length; i++) { if (p[i].firma) { escala = i; break; } }
        }
        var horas = 0, firmas = 0, seg = 0;
        p.forEach(function (s, n) {
            horas += s.h;
            seg += BOT[s.id];
            if (s.firma) firmas++;
            if (n === escala) { horas += s.h; seg += ESCALA_SEG; }   /* ventana vencida + suplente */
        });
        return { pasos: p, horas: horas, firmas: firmas, seg: seg, ruta: rutaDe(c.monto), escala: escala };
    }

    /* Padrón de firmantes y bandeja histórica, todo sintético y con semilla fija.
       El histórico se calcula con el mismo motor: los segundos de cada folio
       corresponden a su ruta, no a un número suelto. */
    function datos() {
        var k = LAB.kit, r = k.rng(40711), i;
        var nombres = ['R. Alvarenga', 'M. Cañas', 'S. Portillo', 'D. Meléndez', 'K. Barahona',
            'J. Escobar', 'L. Zaldívar', 'A. Mejía', 'P. Cruz', 'N. Rivas', 'G. Solórzano',
            'T. Mendoza', 'C. Hurtado', 'V. Ayala', 'F. Quintanilla', 'B. Interiano'];
        for (i = nombres.length - 1; i > 0; i--) {   /* barajado determinista */
            var j = Math.floor(r() * (i + 1)), t = nombres[i];
            nombres[i] = nombres[j]; nombres[j] = t;
        }
        var D = {
            roster: {
                cumplimiento: nombres[0], presupuesto: nombres[1], direccion: nombres[2],
                proyectos: nombres[3], suplente: nombres[4], jefe: {}, gerente: {}
            },
            hist: []
        };
        CENTROS.forEach(function (c, n) {
            D.roster.jefe[c] = nombres[5 + n];
            D.roster.gerente[c] = nombres[9 + n];
        });

        for (i = 0; i < 5; i++) {
            var c = {
                monto: Math.round((900 + r() * 116000) / 500) * 500,
                centro: k.pick(r, CENTROS),
                nuevo: r() < 0.30,
                urgente: r() < 0.35,
                excedido: r() < 0.25,
                demora: r() < 0.34
            };
            var res = cadena(c, D);
            D.hist.push({
                folio: 'SC-' + (FOLIO - i), centro: c.centro, monto: c.monto,
                ruta: res.ruta, firmas: res.firmas, seg: res.seg, escalada: res.escala >= 0
            });
        }
        return D;
    }

    LAB.register({
        id: 'orquesta',
        name: 'ORQUESTA',
        family: 'procesos',
        tagline: 'Aprobaciones multinivel',
        title: 'Enrutamiento de aprobaciones de compra',
        intro: 'Mueva el monto y las condiciones de la solicitud: la cadena de firmantes se arma sola con las reglas de la política de compra. Después ejecútela y compare la espera humana contra lo que tarda el flujo.',
        spec: {
            trigger: 'Envío del formulario de solicitud en el portal interno de compras.',
            systems: 'Power Automate cloud sobre listas de SharePoint; aprobaciones y notificaciones por correo, con el expediente firmado guardado en la biblioteca del área.',
            output: 'Orden de compra aprobada, con expediente que guarda quién firmó, cuándo y bajo qué regla entró cada paso.',
            failure: 'Si un firmante no responde dentro del SLA, el flujo reintenta, escala al suplente configurado y avisa al solicitante sin perder la solicitud.'
        },
        impact: [
            ['32 h', 'espera de firmas que el flujo deja de arrastrar'],
            ['41 s', 'ciclo del flujo, de solicitud a orden emitida'],
            ['100%', 'firmas con sello de quién, cuándo y bajo qué regla']
        ],

        render: function (host, k) {
            var D = datos(), C = k.C;
            var corriendo = false, sucio = false, ejecuciones = 0;
            var firmaPrev = '', sigPrev = '', actual = null, cfgActual = null, pasos = null;

            var ctl = k.controls([
                { k: 'monto', t: 'range', label: 'Monto solicitado', min: 500, max: 150000, step: 500, value: 26000, suffix: 'USD' },
                { k: 'centro', t: 'select', label: 'Centro de costo', options: CENTROS, value: 'Operaciones' },
                { k: 'nuevo', t: 'check', label: 'Proveedor nuevo', value: false },
                { k: 'urgente', t: 'check', label: 'Urgente', value: false },
                { k: 'excedido', t: 'check', label: 'Presupuesto excedido', value: false },
                { k: 'demora', t: 'check', label: 'Firmante sin respuesta', value: false },
                { k: 'run', t: 'button', label: 'Ejecutar flujo', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kp = k.kpis([['Firmantes humanos', '—'], ['Espera por firmas', '—'],
                ['Ciclo del flujo', '—', 'up'], ['Ruta por monto', '—']]);
            host.appendChild(kp.node);

            /* Nota bajo el número: el tono de color nunca viaja solo. Se arma con
               nodos y estilo por propiedad; la política de seguridad del sitio
               bloquea los atributos style que llegan dentro de marcado. */
            function kpi(i, valor, nota, tono) {
                kp.set(i, valor, tono || '');
                var v = kp.node.children[i].children[0];
                var sp = k.txt('span', 'mono', nota);
                sp.style.display = 'block';
                sp.style.fontSize = '10px';
                sp.style.fontWeight = '600';
                sp.style.marginTop = '5px';
                sp.style.letterSpacing = '.02em';
                sp.style.color = 'var(--label)';
                v.appendChild(sp);
            }

            var g = k.el('div', 'grid2 wide-left');
            host.appendChild(g);

            var izq = k.panel();
            izq.appendChild(k.txt('div', 'mono-head', 'Cadena de firmantes — se reconstruye con cada cambio'));
            var cajaPasos = k.el('div');
            izq.appendChild(cajaPasos);
            var h2 = k.txt('div', 'mono-head', 'Qué regla disparó cada paso');
            h2.style.marginTop = '18px';
            izq.appendChild(h2);
            var ins = k.insights();
            izq.appendChild(ins.node);
            g.appendChild(izq);

            var der = k.el('div', 'stack');
            var cb = k.chartbox('Escalamiento por monto', 'Espera de firmas según el monto, con las condiciones actuales.');
            der.appendChild(cb.node);
            var pLog = k.panel();
            pLog.appendChild(k.txt('div', 'mono-head', 'Registro de ejecución'));
            var log = k.log('178px');
            pLog.appendChild(log.node);
            der.appendChild(pLog);
            g.appendChild(der);

            var pCmp = k.panel();
            pCmp.appendChild(k.txt('div', 'mono-head', 'Ciclo comparado — el mismo expediente'));
            var bars = k.bars();
            pCmp.appendChild(bars.node);
            var nota = k.txt('div', 'mono', '');
            nota.style.marginTop = '12px';
            nota.style.fontSize = '11.5px';
            nota.style.lineHeight = '1.6';
            nota.style.color = 'var(--label)';
            pCmp.appendChild(nota);
            host.appendChild(pCmp);

            var cols = [{ t: 'Folio' }, { t: 'Centro de costo' }, { t: 'Monto', r: true }, { t: 'Ruta' },
                { t: 'Firmas', r: true }, { t: 'Ciclo del flujo', r: true }, { t: 'Estado' }];
            function celdas(h) {
                return [h.folio, h.centro, k.money(h.monto), h.ruta, String(h.firmas), k.fmt(h.seg, 1) + ' s',
                    { html: h.escalada ? k.pill('warn', 'Emitida con escalamiento') : k.pill('ok', 'Emitida') }];
            }
            var tb = k.table(cols, D.hist.map(celdas));
            var pTab = k.panel();
            pTab.appendChild(k.txt('div', 'mono-head', 'Últimas solicitudes procesadas'));
            pTab.appendChild(tb.node);
            host.appendChild(pTab);

            function fila(cs) {
                var tr = document.createElement('tr');
                cs.forEach(function (c, i) {
                    tr.appendChild(c && typeof c === 'object' && c.html != null
                        ? k.el('td', cols[i].r ? 'r' : null, c.html)
                        : k.txt('td', cols[i].r ? 'r' : null, String(c)));
                });
                return tr;
            }

            /* ---------- gráfica: curva de escalamiento ---------- */
            function curva(c) {
                var pts = [], m;
                for (m = 500; m <= 150000; m += 500) {
                    pts.push({
                        x: m, y: cadena({
                            monto: m, centro: c.centro, nuevo: c.nuevo,
                            urgente: c.urgente, excedido: c.excedido, demora: c.demora
                        }, D).horas
                    });
                }
                return pts;
            }
            var base = curva({ centro: 'Operaciones', nuevo: false, urgente: false, excedido: false, demora: false });
            var ch = k.chart(cb.canvas, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Con las condiciones actuales', data: [], stepped: 'after', fill: true,
                            borderColor: C.teal, backgroundColor: 'rgba(45,212,191,.10)',
                            borderWidth: 2, pointRadius: 0
                        },
                        {
                            label: 'Cadena mínima, solo por monto', data: base, stepped: 'after', fill: false,
                            borderColor: C.violet, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0
                        },
                        {
                            label: 'Monto seleccionado', type: 'scatter', data: [],
                            borderColor: C.amber, backgroundColor: C.amber, pointRadius: 5, pointHoverRadius: 7
                        }
                    ]
                },
                options: {
                    scales: {
                        x: Object.assign({}, k.AXIS_BARE, {
                            type: 'linear', min: 500, max: 150000,
                            ticks: { padding: 8, maxTicksLimit: 5, callback: function (v) { return k.money(v); } }
                        }),
                        y: Object.assign({}, k.AXIS, {
                            beginAtZero: true,
                            ticks: { padding: 8, callback: function (v) { return v + ' h'; } }
                        })
                    },
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (x) {
                                    return x.dataset.label + ': ' + k.money(x.parsed.x) + ' · ' + hh(x.parsed.y) + ' de espera';
                                }
                            }
                        }
                    }
                }
            });

            /* ---------- reconstrucción en vivo ---------- */
            function cfg() {
                return {
                    monto: ctl.get('monto'), centro: ctl.get('centro'), nuevo: ctl.get('nuevo'),
                    urgente: ctl.get('urgente'), excedido: ctl.get('excedido'), demora: ctl.get('demora')
                };
            }

            function explicar(c, r) {
                ins.clear();
                var e = k.escapeHtml;
                if (c.nuevo) ins.add('violet', '+', 'Entra <b>Cumplimiento</b> porque el proveedor no existe en el maestro: alta y validación documental antes de cualquier firma.');
                if (c.excedido) ins.add('amber', '!', 'Entra <b>Revisión presupuestaria</b> porque la partida quedó excedida. El flujo exige justificación escrita antes de seguir.');
                if (c.monto <= U.menor) {
                    ins.add('green', '=', 'El monto se aprueba solo: <b>' + e(k.money(c.monto)) + ' no supera ' + e(k.money(U.menor))
                        + '</b>, el umbral de menor cuantía. Nadie firma por el monto.');
                } else {
                    ins.add('teal', '$', '<b>Jefatura de área</b> entra porque el monto supera ' + e(k.money(U.menor)) + '.');
                    if (c.monto > U.gerencia) ins.add('teal', '$', '<b>Gerencia de ' + e(c.centro) + '</b> entra porque el monto supera ' + e(k.money(U.gerencia)) + '.');
                    if (c.monto > U.direccion) ins.add('teal', '$', '<b>Dirección financiera</b> entra porque el monto supera ' + e(k.money(U.direccion)) + '.');
                }
                if (c.centro === 'Proyectos') ins.add('cyan', '>', 'Entra <b>Control de proyectos</b> porque el centro de costo es Proyectos: se valida contra el presupuesto de la obra antes de emitir.');
                if (c.urgente && c.monto > U.menor) ins.add('cyan', '<', 'Marca <b>urgente</b>: los SLA de jefatura, gerencia y dirección bajan a la mitad o menos. Los firmantes no cambian.');
                if (c.urgente && c.monto <= U.menor) ins.add('amber', '<', 'La marca <b>urgente</b> solo recorta los SLA que dependen del monto. Con esta cuantía no entra ninguno, así que la espera no cambia.');
                if (r.escala >= 0) {
                    var s = r.pasos[r.escala];
                    ins.add('rose', '!', '<b>' + e(s.rol) + '</b> deja vencer su ventana. El flujo reintenta, escala al suplente <b>'
                        + e(D.roster.suplente) + '</b> y avisa al solicitante: se suma otra ventana de ' + e(hh(s.h)) + ' a la espera.');
                } else if (c.demora) {
                    ins.add('amber', '!', 'No hay firmante humano en esta cadena, así que no hay a quién escalar: la solicitud la resuelve el flujo completo.');
                }
                if (!c.nuevo && !c.excedido && !c.urgente && !c.demora && c.centro !== 'Proyectos' && c.monto > U.menor) {
                    ins.add('teal', '·', 'Sin condiciones adicionales: la cadena queda en ' + r.firmas + ' firmas y ' + e(hh(r.horas)) + ' de espera.');
                }
            }

            function pintar() {
                var c = cfg(), r = cadena(c, D);
                cfgActual = c; actual = r;

                cajaPasos.innerHTML = '';
                pasos = k.steps(r.pasos.map(function (s, i) {
                    return { n: nombrePaso(s), ms: slaPaso(s, i === r.escala) };
                }));
                cajaPasos.appendChild(pasos.node);

                var notaFirmas = 'cadena estándar';
                if (!r.firmas) notaFirmas = 'sin firma humana';
                else if (r.firmas >= 4) notaFirmas = 'cadena larga';
                kpi(0, String(r.firmas), notaFirmas, r.firmas >= 4 ? 'warn' : '');

                var notaSla = r.horas ? 'dentro de la meta de ' + hh(U.meta) : 'sin espera humana', tonoSla = '';
                if (r.escala >= 0) { notaSla = 'incluye escalamiento'; tonoSla = 'warn'; }
                if (r.horas > U.meta) { notaSla = 'sobre la meta de ' + hh(U.meta); tonoSla = 'bad'; }
                kpi(1, hh(r.horas), notaSla, tonoSla);
                kpi(2, k.fmt(r.seg, 1) + ' s', 'estimado del motor', 'up');
                kpi(3, r.ruta, c.excedido ? 'marcada por presupuesto' : 'por umbral de monto', c.excedido ? 'warn' : '');

                explicar(c, r);

                var mx = Math.max(r.horas, 0.5);
                bars.clear();
                bars.add('Ruta manual — espera de firmas', r.horas, mx, C.violet, r.horas ? hh(r.horas) : 'sin firmas');
                bars.add('Flujo automatizado — armado y traslado', r.seg / 3600, mx, C.teal, k.fmt(r.seg, 1) + ' s');
                nota.textContent = (r.horas
                    ? 'Ruta manual: ' + k.fmt(r.horas / 8, 1) + ' días hábiles de traslado entre bandejas'
                        + (r.escala >= 0 ? ', ya contando la ventana vencida y el paso al suplente' : '')
                    : 'Con esta cuantía nadie firma: la ruta manual y el flujo hacen el mismo trabajo, uno en minutos de tramitación y el otro en segundos')
                    + '. Se compara el armado y el traslado del expediente, no lo que cada persona tarda en decidir: esa decisión sigue siendo suya.';

                cb.cap('Centro ' + c.centro + (c.nuevo ? ', proveedor nuevo' : '') + (c.excedido ? ', presupuesto excedido' : '')
                    + (c.urgente ? ', urgente' : '') + (c.demora ? ', con escalamiento' : '')
                    + '. El punto marcado es el monto seleccionado.');

                if (ch) {
                    /* La curva solo depende de las condiciones, no del monto: se
                       recalcula al cambiarlas, no en cada paso del deslizador. */
                    var sig = [c.centro, c.nuevo, c.urgente, c.excedido, c.demora].join('|');
                    if (sig !== sigPrev) {
                        sigPrev = sig;
                        ch.data.datasets[0].data = curva(c);
                    }
                    ch.data.datasets[2].data = [{ x: c.monto, y: r.horas }];
                    ch.update('none');
                }

                var firma = r.pasos.map(function (s) { return s.id; }).join('>') + (r.escala >= 0 ? '!' : '');
                if (firma !== firmaPrev) {
                    firmaPrev = firma;
                    log.push('hl', 'Cadena recalculada: ' + r.pasos.length + ' pasos, ' + r.firmas + ' firmas, ' + hh(r.horas) + ' de espera');
                }
            }

            /* Devuelve los pasos a su estado inicial sin perder el SLA de cada uno. */
            function reiniciarPasos(r) {
                r.pasos.forEach(function (s, i) { pasos.set(i, '', slaPaso(s, i === r.escala)); });
            }

            /* ---------- ejecución animada ---------- */
            async function ejecutar() {
                if (corriendo) return;
                corriendo = true;
                ctl.busy('run', true);

                var r = actual, c = cfgActual, seg = 0;
                reiniciarPasos(r);
                ejecuciones++;
                var folio = 'SC-' + (FOLIO + ejecuciones);
                log.push('in', 'Solicitud ' + folio + ' recibida del portal · ' + k.money(c.monto) + ' · ' + c.centro);

                for (var i = 0; i < r.pasos.length; i++) {
                    var s = r.pasos[i], d = BOT[s.id];
                    pasos.set(i, 'run', 'en curso');
                    await k.wait(360 + Math.round(Math.random() * 110));   /* jitter solo cosmético */

                    if (i === r.escala) {
                        pasos.set(i, 'fail', 'sin respuesta en ' + hh(s.h));
                        log.push('er', s.rol + ': ' + s.quien + ' no respondió dentro del SLA de ' + hh(s.h));
                        await k.wait(420);
                        log.push('wa', 'Reintento con escalamiento al suplente ' + D.roster.suplente + '; aviso enviado al solicitante');
                        await k.wait(420);
                        d += ESCALA_SEG;
                        seg += d;
                        pasos.set(i, 'done', k.fmt(d, 1) + ' s · firmó el suplente');
                        log.push('ok', 'Firmado por el suplente ' + D.roster.suplente + ', expediente sin quiebre');
                        continue;
                    }

                    seg += d;
                    pasos.set(i, 'done', k.fmt(d, 1) + ' s');
                    if (s.firma) log.push('ok', 'Firmado: ' + s.rol + ' — ' + s.quien + ' (SLA ' + hh(s.h) + ')');
                    else log.push('in', s.rol + ' resuelto por el flujo');
                }

                kpi(2, k.fmt(seg, 1) + ' s', 'medido en ' + folio, 'up');
                log.push('hl', 'Orden emitida — ' + r.firmas + ' firmas registradas, ciclo del flujo ' + k.fmt(seg, 1)
                    + ' s frente a ' + hh(r.horas) + ' de espera humana');

                tb.body.insertBefore(fila(celdas({
                    folio: folio, centro: c.centro, monto: c.monto, ruta: r.ruta,
                    firmas: r.firmas, seg: seg, escalada: r.escala >= 0
                })), tb.body.firstChild);
                while (tb.body.children.length > 6) tb.body.removeChild(tb.body.lastChild);

                ctl.busy('run', false);
                corriendo = false;
                if (sucio) { sucio = false; pintar(); }   /* movió controles durante la corrida */
            }

            ctl.on(function () {
                if (corriendo) { sucio = true; return; }
                pintar();
            });
            ctl.onClick('run', ejecutar);

            log.push('in', 'Motor de reglas cargado: ' + REGLAS.length + ' condiciones sobre la política de compra');
            pintar();
        }
    });
})();
