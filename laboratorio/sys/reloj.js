/* ============================================================
   RELOJ — cierre mensual multi-fuente.
   Cuatro orígenes que nunca cierran a la misma hora y un solo
   modelo publicado. Lo que se demuestra no es la ruta feliz:
   es qué entra al modelo cuando un origen viene viejo, quién
   se entera de eso y qué pasa cuando la marca no viaja.
   ============================================================ */
(function () {
    'use strict';
    var LAB = window.LAB;

    /* El cierre arranca a las 02:00 del día hábil 1. La antigüedad de
       cada origen se mide en minutos contra esa hora de arranque. */
    var ORIGENES = [
        { n: 'Base de datos transaccional', m: 'Consulta incremental', corte: '01/09 01:58', edad: 2, seg: 412 },
        { n: 'Listas de apoyo', m: 'Sitio de colaboración', corte: '01/09 00:20', edad: 100, seg: 96 },
        { n: 'Servicio de tesorería', m: 'REST con token', corte: '31/08 22:15', edad: 225, seg: 74 },
        { n: 'Archivos de sucursal', m: '12 libros de Excel', corte: '31/08 20:30', edad: 330, seg: 268 }
    ];
    /* Nodos internos: preparación, validación, modelo, publicación. */
    var SEG_INT = [205, 118, 84, 61];
    var NODOS = ORIGENES.map(function (o) { return { n: o.n, m: o.m }; }).concat([
        { n: 'Área de preparación', m: 'Normalización' }, { n: 'Validación', m: '42 reglas' },
        { n: 'Modelo semántico', m: 'Medidas y relaciones' }, { n: 'Publicación', m: 'Actualización' }
    ]);

    /* Las 42 reglas viven agrupadas por familia; el detalle por regla
       solo se abre cuando alguna cae, que es cuando alguien lo necesita. */
    var FAMILIAS = [
        { f: 'Integridad de llaves', n: 11 }, { f: 'Integridad referencial', n: 9 },
        { f: 'Cuadre contra saldos de control', n: 8 }, { f: 'Frescura del origen', n: 7 },
        { f: 'Formato y dominio', n: 7 }
    ];
    var PERIODOS = ['Abril', 'Mayo', 'Junio', 'Julio', 'Agosto'];
    var CORTE_ANT = '01/08 02:02';
    var EDAD_ANT = 44640; /* 31 días del extracto del periodo anterior */

    /* ---------- datos sintéticos con semilla fija ---------- */
    function datos() {
        var k = LAB.kit, r = k.rng(20260902);
        var base = [118432, 2318, 6741, 31204], hist = [], p, i;
        for (p = 0; p < PERIODOS.length; p++) {
            var f = [];
            for (i = 0; i < 4; i++) f.push(Math.round(base[i] * (0.86 + r() * 0.13)));
            var rojas = p === 2 ? 2 : 0;
            hist.push({
                periodo: PERIODOS[p], f: f, rojas: rojas,
                seg: Math.round(1240 + r() * 190) + (rojas ? 160 : 0),
                res: rojas ? 'Publicado con avisos' : 'Modelo publicado', tono: rojas ? 'warn' : 'ok'
            });
        }
        return {
            base: base, hist: hist,
            ultimo: hist[hist.length - 1].f[2],
            dif: Math.round((28000 + r() * 42000) * 100) / 100
        };
    }

    function dur(s) {
        var m = Math.floor(s / 60);
        return m ? m + ' min ' + LAB.kit.pad(s - m * 60) + ' s' : s + ' s';
    }
    function edadTxt(m) {
        if (m >= 1440) return Math.round(m / 1440) + ' días';
        if (m >= 60) return Math.floor(m / 60) + ' h ' + LAB.kit.pad(m % 60) + ' min';
        return m + ' min';
    }
    function edadCorta(m) {
        if (m >= 1440) return Math.round(m / 1440) + ' d';
        if (m >= 60) return Math.floor(m / 60) + 'h' + LAB.kit.pad(m % 60);
        return m + ' min';
    }
    function hora(s) {
        var t = 7200 + s;
        return LAB.kit.pad(Math.floor(t / 3600)) + ':' + LAB.kit.pad(Math.floor(t / 60) % 60);
    }

    /* ---------- reglas del cierre ----------
       Un origen es "diferido" cuando su antigüedad supera el umbral de
       frescura. La política decide qué se hace con él; de ahí salen las
       reglas en rojo, la duración y el resultado publicado. */
    function escenario(c, D) {
        var umbral = c.umbral * 60, i;
        var O = ORIGENES.map(function (o, ix) {
            var caido = ix === 2 && c.caida;
            return {
                n: o.n, caido: caido,
                corte: caido ? CORTE_ANT : o.corte,
                edad: caido ? EDAD_ANT : o.edad,
                filas: caido ? D.ultimo : D.base[ix],
                seg: o.seg + (caido ? 90 : 0) /* tres intentos de 30 s */
            };
        });
        O.forEach(function (o) {
            o.venc = o.edad > umbral;
            o.cerca = !o.venc && o.edad > umbral * 0.8;
        });

        var primero = -1;
        for (i = 0; i < 4; i++) if (O[i].venc) { primero = i; break; }

        var seg = O.map(function (o) { return o.seg; }).concat(SEG_INT);
        var hasta = 8, detenido = null;

        /* "No aceptar": la cadena se corta en el primer origen fuera de umbral. */
        if (c.tol === 'no' && primero >= 0) { detenido = 'fuente'; hasta = primero + 1; }

        var rojas = [], marcados = 0, silenciados = 0;
        if (detenido !== 'fuente') {
            O.forEach(function (o, ix) {
                if (!o.venc) return;
                if (c.tol === 'marca') {
                    marcados++;
                    rojas.push({
                        id: 'R-' + (21 + ix), fam: 'Frescura del origen',
                        q: 'Antigüedad máxima del origen: ' + c.umbral + ' h',
                        h: o.n + ': ' + edadTxt(o.edad)
                    });
                } else silenciados++;
            });
            /* El extracto recuperado no cuadra ni cubre el periodo. Eso lo
               ve la regla en los datos, no en la marca: cae en ambos casos. */
            if (c.caida) {
                rojas.push({
                    id: 'R-17', fam: 'Cuadre contra saldos de control',
                    q: 'Saldo de tesorería contra saldo de control',
                    h: 'Diferencia de $' + LAB.kit.fmt(D.dif, 2)
                });
                rojas.push({
                    id: 'R-31', fam: 'Integridad referencial',
                    q: 'Cobertura del periodo en cuentas de tesorería',
                    h: 'Ningún movimiento con fecha dentro de 2026-09'
                });
            }
        }
        if (rojas.length && c.detener) { detenido = 'validacion'; hasta = 6; }

        /* Etiqueta de cada origen: siempre texto, el color solo acompaña. */
        O.forEach(function (o, ix) {
            if (detenido === 'fuente' && ix > primero) { o.est = 'idle'; o.et = 'No ejecutada'; o.filas = 0; return; }
            if (o.venc && c.tol === 'no') { o.est = 'bad'; o.et = o.caido ? 'Sin respuesta' : 'Rechazada por antigüedad'; o.filas = 0; return; }
            if (o.venc && c.tol === 'marca') { o.est = 'warn'; o.et = o.caido ? 'Extracto anterior, con marca' : 'Aceptada con marca'; return; }
            if (o.venc) { o.est = 'bad'; o.et = o.caido ? 'Extracto anterior, sin marca' : 'Aceptada sin marca'; return; }
            if (o.cerca) { o.est = 'warn'; o.et = 'Cerca del umbral'; return; }
            o.est = 'ok'; o.et = 'Dentro del umbral';
        });

        var total = 0, t = 0;
        for (i = 0; i < 4; i++) total += O[i].filas;
        for (i = 0; i < hasta; i++) t += seg[i];

        var res = detenido === 'fuente' ? ['Cierre detenido', 'bad']
            : detenido === 'validacion' ? ['Detenido en validación', 'warn']
                : silenciados ? ['Publicado sin marca', 'bad']
                    : rojas.length ? ['Publicado con avisos', 'warn']
                        : ['Modelo publicado', 'up'];

        return {
            O: O, seg: seg, hasta: hasta, total: total, t: t, rojas: rojas,
            marcados: marcados, silenciados: silenciados, primero: primero,
            detenido: detenido, res: res, umbral: umbral,
            verdes: detenido === 'fuente' ? 'No evaluadas' : (42 - rojas.length) + ' de 42'
        };
    }

    LAB.register({
        id: 'reloj',
        name: 'RELOJ',
        family: 'datos',
        tagline: 'Cierre multi-fuente',
        title: 'Consolidación de cuatro orígenes para el cierre mensual',
        intro: 'El cierre toca cuatro orígenes que nunca cierran a la misma hora. Mueva el umbral de frescura y decida qué hace la cadena con un dato viejo: ahí se ve la diferencia entre un número que se puede defender y uno que solo parece correcto.',
        spec: {
            trigger: 'Calendario de cierre: día hábil 1 a las 02:00, con reintento programado si la ventana se pierde.',
            systems: 'Base transaccional por consulta incremental, listas de colaboración, servicio REST con token, doce libros de Excel de sucursal, área de preparación, modelo semántico y tablero.',
            output: 'Modelo publicado con 42 reglas de validación documentadas, cada una con su familia, su umbral y el origen que evalúa.',
            failure: 'Reproceso desde el punto de falla, nunca desde cero: el área de preparación conserva lo ya extraído. El dato diferido se marca dentro del propio modelo, no en un correo aparte.'
        },
        impact: [
            ['9 h -> 22 min', 'cierre mensual de punta a punta'],
            ['4', 'orígenes sin intervención manual'],
            ['Reproceso', 'desde el punto de falla, no desde cero']
        ],

        render: function (host, k) {
            var D = datos(), C = k.C;
            var corriendo = false, corridas = 0, firma = '';

            var ctl = k.controls([
                { k: 'umbral', t: 'range', label: 'Umbral de frescura', min: 1, max: 12, step: 1, value: 6, suffix: 'h' },
                {
                    k: 'tol', t: 'select', label: 'Qué hacer con un origen diferido', value: 'marca',
                    options: [{ v: 'no', t: 'No aceptar' }, { v: 'marca', t: 'Aceptar con marca' }, { v: 'silencio', t: 'Aceptar en silencio' }]
                },
                { k: 'detener', t: 'check', label: 'Detener si la validación falla', value: true },
                { k: 'caida', t: 'check', label: 'Simular servicio caído', value: false },
                { k: 'run', t: 'button', label: 'Ejecutar cierre', primary: true }
            ]);
            host.appendChild(ctl.node);
            /* Lectura de la política: cambia con cualquiera de los cuatro
               controles, aun cuando el resultado del cierre no se mueva. */
            var pol = k.txt('div', 'mono', '');
            pol.style.marginTop = '12px';
            pol.style.color = C.body;
            pol.style.fontSize = '12px';
            ctl.node.appendChild(pol);

            var kp = k.kpis([['Filas procesadas', '—'], ['Duración', '—'], ['Reglas en verde', '—'], ['Resultado', '—']]);
            host.appendChild(kp.node);

            var pnPipe = k.panel();
            pnPipe.appendChild(k.txt('div', 'mono-head', 'Cadena de consolidación — cuatro orígenes, un modelo publicado'));
            var pipe = k.pipe(NODOS);
            pnPipe.appendChild(pipe.node);
            host.appendChild(pnPipe);

            var g = k.el('div', 'grid2 wide-left');
            host.appendChild(g);

            var izq = k.panel();
            izq.appendChild(k.txt('div', 'mono-head', 'Orígenes del periodo — corte, antigüedad y filas aportadas'));
            var colF = [{ t: 'Origen' }, { t: 'Corte' }, { t: 'Antigüedad', r: true }, { t: 'Filas', r: true }, { t: 'Estado' }];
            var tF = k.table(colF, []);
            izq.appendChild(tF.node);
            var hB = k.txt('div', 'mono-head', 'Antigüedad contra el umbral');
            hB.style.marginTop = '18px';
            izq.appendChild(hB);
            /* El color de la barra repite lo que ya dice la columna Estado;
               la leyenda queda escrita para que no dependa del color. */
            var leyenda = k.txt('div', null, 'Verde: dentro del umbral. Ámbar: cerca del umbral. Rosa: fuera de umbral.');
            leyenda.style.cssText = 'font-size:12px;color:' + C.label + ';margin:-4px 0 12px';
            izq.appendChild(leyenda);
            var barras = k.bars();
            izq.appendChild(barras.node);
            var hR = k.txt('div', 'mono-head', 'Validación — 42 reglas activas por familia');
            hR.style.marginTop = '18px';
            izq.appendChild(hR);
            var colR = [{ t: 'Familia' }, { t: 'Reglas', r: true }, { t: 'Estado' }];
            var tR = k.table(colR, []);
            izq.appendChild(tR.node);
            var detalle = k.el('div');
            detalle.style.marginTop = '16px';
            izq.appendChild(detalle);
            g.appendChild(izq);

            var der = k.el('div', 'stack');
            var cb = k.chartbox('Filas aportadas por origen', 'Cada barra es un cierre; los segmentos son los cuatro orígenes.', '250px');
            der.appendChild(cb.node);
            var pnLog = k.panel();
            pnLog.appendChild(k.txt('div', 'mono-head', 'Registro del cierre'));
            var log = k.log('300px');
            pnLog.appendChild(log.node);
            der.appendChild(pnLog);
            g.appendChild(der);

            var pnIns = k.panel();
            pnIns.appendChild(k.txt('div', 'mono-head', 'Lectura del cierre'));
            var ins = k.insights();
            pnIns.appendChild(ins.node);
            host.appendChild(pnIns);

            var colH = [{ t: 'Periodo' }, { t: 'Filas', r: true }, { t: 'Duración', r: true }, { t: 'Reglas en rojo', r: true }, { t: 'Resultado' }];
            var tH = k.table(colH, D.hist.slice().reverse().map(function (h) {
                var tot = h.f[0] + h.f[1] + h.f[2] + h.f[3];
                return [h.periodo, k.fmt(tot, 0), dur(h.seg), String(h.rojas), { html: k.pill(h.tono, h.res) }];
            }));
            var pnH = k.panel();
            pnH.appendChild(k.txt('div', 'mono-head', 'Últimos cierres ejecutados'));
            pnH.appendChild(tH.node);
            host.appendChild(pnH);

            function fila(cols, celdas) {
                var tr = document.createElement('tr');
                celdas.forEach(function (c, i) {
                    tr.appendChild(c && typeof c === 'object' && c.html != null
                        ? k.el('td', cols[i].r ? 'r' : null, c.html)
                        : k.txt('td', cols[i].r ? 'r' : null, String(c)));
                });
                return tr;
            }

            /* pipe.set reescribe la clase del nodo; el ámbar del dato
               diferido no existe como estado propio y va en línea. */
            function nodo(i, estado, valor, color) {
                pipe.set(i, estado, valor == null ? '' : valor);
                var d = pipe.node.children[i];
                if (!d) return;
                d.style.borderColor = color || '';
                d.children[2].style.color = color || '';
            }
            function limpiarNodos(v) {
                for (var i = 0; i < NODOS.length; i++) nodo(i, '', v || '', null);
            }
            function valorNodo(e, i) {
                var o = e.O[i];
                if (i < 4) return k.fmt(o.filas, 0) + ' filas' + (o.venc ? (o.est === 'warn' ? ' · diferido' : ' · sin marca') : '');
                if (i === 4) return k.fmt(e.total, 0) + ' filas';
                if (i === 5) return e.verdes;
                if (i === 6) return '38 medidas';
                return hora(e.t);
            }

            /* ---------- gráfica apilada ---------- */
            var ch = k.chart(cb.canvas, {
                type: 'bar',
                data: {
                    labels: PERIODOS.concat(['Septiembre']),
                    datasets: ORIGENES.map(function (o, i) {
                        return {
                            label: o.n, stack: 'c', backgroundColor: k.CAT[i], borderWidth: 0, borderRadius: 2,
                            data: D.hist.map(function (h) { return h.f[i]; }).concat([0])
                        };
                    })
                },
                options: {
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: Object.assign({}, k.AXIS_BARE, { stacked: true }),
                        y: Object.assign({}, k.AXIS, {
                            stacked: true, beginAtZero: true,
                            ticks: { padding: 8, callback: function (v) { return k.fmt(v / 1000, 0) + ' k'; } }
                        })
                    },
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (x) { return x.dataset.label + ': ' + k.fmt(x.parsed.y, 0) + ' filas'; },
                                footer: function (items) {
                                    var idx = items[0].dataIndex, s = 0;
                                    items[0].chart.data.datasets.forEach(function (d) { s += d.data[idx] || 0; });
                                    return 'Total: ' + k.fmt(s, 0) + ' filas';
                                }
                            }
                        }
                    }
                }
            });

            /* ---------- pintado del escenario ---------- */
            function cfg() {
                return { umbral: ctl.get('umbral'), tol: ctl.get('tol'), detener: ctl.get('detener'), caida: ctl.get('caida') };
            }
            function politica(c) {
                var t = c.tol === 'no' ? 'se rechaza y la cadena se corta'
                    : c.tol === 'marca' ? 'entra marcado como diferido' : 'entra sin marca';
                return 'Política vigente — umbral de frescura ' + c.umbral + ' h · origen fuera de umbral: ' + t +
                    ' · si una regla cae, la publicación ' + (c.detener ? 'se detiene' : 'continúa') +
                    ' · servicio de tesorería ' + (c.caida ? 'sin respuesta' : 'respondiendo');
            }

            function explicar(c, e) {
                ins.clear();
                var esc = k.escapeHtml, mayor = e.O[3];
                ins.add('teal', '=', 'Los cuatro cortes no coinciden: la base cierra a las 01:58 y los libros de sucursal a las 20:30 del día anterior, ' +
                    esc(edadTxt(mayor.edad)) + ' de diferencia contra la hora de arranque. El <b>área de preparación</b> unifica llaves, moneda y calendario antes de que exista un solo número.');

                if (!e.O.some(function (o) { return o.venc; })) {
                    var cerca = e.O.filter(function (o) { return o.cerca; });
                    ins.add('green', 'v', 'Con umbral de <b>' + c.umbral + ' h</b> los cuatro orígenes entran dentro de plazo: <b>42 de 42 reglas en verde</b> y el modelo queda publicado a las ' + esc(hora(e.t)) + '.' +
                        (cerca.length ? ' Margen justo en ' + esc(cerca[0].n.toLowerCase()) + ': pasa por ' + esc(edadTxt(Math.round(e.umbral - cerca[0].edad))) + '.' : ''));
                } else if (c.tol === 'no') {
                    ins.add('amber', '!', '<b>No aceptar</b>: la cadena se corta en ' + esc(e.O[e.primero].n.toLowerCase()) + '. Nadie publica un número incompleto, pero el cierre no existe hasta que ese origen se refresque. Es la opción defendible cuando el dato de ese origen manda sobre todo lo demás.');
                } else if (c.tol === 'marca') {
                    ins.add('green', 'v', '<b>Aceptar con marca</b>: ' + e.marcados + ' origen(es) entran etiquetados como diferidos y las reglas de frescura los ven. El tablero publica y a la vez confiesa qué parte está vieja: la marca viaja dentro del modelo, no en la bitácora.');
                } else {
                    ins.add('rose', 'x', '<b>Aceptar en silencio</b>: el dato viejo entra sin etiqueta. Las reglas de frescura solo pueden disparar si la marca existe, así que salen en verde con un origen de ' + esc(edadTxt(e.O.filter(function (o) { return o.venc; })[0].edad)) + '. Nadie que abra el tablero sabrá qué está viendo.');
                }

                if (c.caida && c.tol !== 'no') {
                    ins.add(c.tol === 'silencio' ? 'rose' : 'violet', '#', 'El servicio no respondió y se recuperó el extracto del periodo anterior (' + esc(k.fmt(D.ultimo, 0)) + ' filas, corte ' + CORTE_ANT + '). Dos reglas caen por los datos mismos, no por la marca: <b>R-17</b> cuadre contra saldo de control (diferencia de $' + esc(k.fmt(D.dif, 2)) + ') y <b>R-31</b> cobertura del periodo.' +
                        (c.tol === 'silencio' ? ' Sin marca, la notificación dice "diferencia de $' + esc(k.fmt(D.dif, 2)) + '" y nada más: alguien va a buscar el error en el lugar equivocado.' : ''));
                }
                if (e.rojas.length) {
                    ins.add(c.detener ? 'violet' : 'amber', c.detener ? '#' : '>',
                        c.detener
                            ? '<b>' + e.rojas.length + ' regla(s) en rojo</b> y la política exige detener: la publicación no ocurre y se notifica con el detalle por regla, no con un "el cierre falló".'
                            : '<b>' + e.rojas.length + ' regla(s) en rojo</b> pero la política permite continuar: el modelo se publica y el aviso queda visible en el propio tablero.');
                }
                if (e.detenido) {
                    ins.add('cyan', '<', 'Reproceso <b>desde el punto de falla</b>: lo ya extraído queda en el área de preparación (' + esc(dur(e.t)) + ' invertidos). Una segunda corrida arranca en el nodo ' + (e.hasta) + ', no en el nodo 1.');
                }
            }

            function pintar() {
                var c = cfg(), e = escenario(c, D), i;
                pol.textContent = politica(c);

                tF.body.innerHTML = '';
                e.O.forEach(function (o) {
                    tF.body.appendChild(fila(colF, [o.n, o.corte, edadTxt(o.edad),
                        o.filas ? k.fmt(o.filas, 0) : '—', { html: k.pill(o.est, o.et) }]));
                });

                barras.clear();
                var tope = Math.max(e.umbral, 360);
                e.O.forEach(function (o) {
                    var col = o.venc ? C.rose : (o.cerca ? C.amber : C.green);
                    barras.add(o.n, Math.min(o.edad, tope), tope, col, edadCorta(o.edad));
                });
                barras.add('Umbral configurado', e.umbral, tope, C.cyan, c.umbral + ' h');

                tR.body.innerHTML = '';
                FAMILIAS.forEach(function (fa) {
                    var rj = e.rojas.filter(function (r) { return r.fam === fa.f; }).length;
                    tR.body.appendChild(fila(colR, [fa.f, String(fa.n),
                        {
                            html: e.detenido === 'fuente' ? k.pill('idle', 'No evaluada')
                                : (rj ? k.pill('bad', rj + ' en rojo') : k.pill('ok', 'En verde'))
                        }]));
                });

                detalle.innerHTML = '';
                if (e.rojas.length) {
                    detalle.appendChild(k.txt('div', 'mono-head', 'Detalle por regla — lo que va en la notificación'));
                    detalle.appendChild(k.table([{ t: 'Regla' }, { t: 'Qué evalúa' }, { t: 'Hallazgo' }],
                        e.rojas.map(function (r) { return [r.id, r.q, r.h]; })).node);
                }

                limpiarNodos();
                for (i = 0; i < e.hasta; i++) {
                    nodo(i, 'done', valorNodo(e, i), i < 4 && e.O[i].venc ? (e.O[i].est === 'warn' ? C.amber : C.rose) : null);
                }
                if (e.detenido === 'fuente') nodo(e.primero, 'fail', e.O[e.primero].et, null);
                if (e.detenido === 'validacion') nodo(5, 'fail', e.rojas.length + ' reglas en rojo', null);
                for (i = e.hasta; i < NODOS.length; i++) nodo(i, '', 'no ejecutado', null);

                kp.set(0, k.fmt(e.total, 0), e.detenido === 'fuente' ? 'bad' : '');
                kp.set(1, dur(e.t), e.detenido ? 'warn' : 'up');
                kp.set(2, e.verdes, e.rojas.length ? 'bad' : (e.detenido === 'fuente' ? 'warn' : 'up'));
                kp.set(3, e.res[0], e.res[1]);

                if (ch) {
                    for (i = 0; i < 4; i++) ch.data.datasets[i].data[5] = e.O[i].filas;
                    ch.update('none');
                    cb.cap(e.detenido === 'fuente'
                        ? 'Septiembre queda incompleto: los orígenes posteriores al corte nunca entraron al área de preparación.'
                        : c.caida
                            ? 'En septiembre el segmento de tesorería no es del periodo: es el extracto del cierre anterior.'
                            : 'Septiembre cierra con los cuatro orígenes dentro del periodo.');
                }
                explicar(c, e);

                var f = [c.umbral, c.tol, c.detener, c.caida].join('|');
                if (f !== firma) {
                    firma = f;
                    log.push('hl', 'Proyección recalculada con umbral de ' + c.umbral + ' h: ' + k.fmt(e.total, 0) +
                        ' filas, ' + dur(e.t) + ', ' + e.rojas.length + ' reglas en rojo, ' + e.res[0].toLowerCase());
                }
                return e;
            }

            /* ---------- ejecución animada ---------- */
            async function ejecutar() {
                if (corriendo) return;
                corriendo = true;
                ctl.busy('run', true);
                var c = cfg(), e = escenario(c, D), i;
                corridas++;
                limpiarNodos('—');
                log.push('in', 'Calendario de cierre: día hábil 1, 02:00. Periodo 2026-09 abierto en el área de preparación.');
                log.push('in', 'Umbral de frescura vigente: ' + c.umbral + ' h contra la hora de arranque.');

                for (i = 0; i < NODOS.length; i++) {
                    if (i >= e.hasta) { nodo(i, '', 'no ejecutado', null); continue; }
                    nodo(i, 'run', 'en curso', null);
                    await k.wait(320 + Math.round(Math.random() * 120));

                    if (i === 2 && c.caida) {
                        for (var a = 1; a <= 3; a++) {
                            log.push('wa', 'Servicio de tesorería: intento ' + a + ' de 3 sin respuesta en 30 s');
                            await k.wait(200);
                        }
                        log.push('er', 'El servicio no respondió. Token válido, endpoint sin responder.');
                        log.push('in', 'Punto de reanudación guardado en el nodo 3; lo extraído queda en el área de preparación.');
                        await k.wait(260);
                    }

                    var o = i < 4 ? e.O[i] : null;
                    if (o && o.venc && c.tol === 'no') {
                        nodo(i, 'fail', o.et, null);
                        log.push('er', o.n + ': antigüedad ' + edadTxt(o.edad) + ' contra un umbral de ' + c.umbral +
                            ' h. Tolerancia "No aceptar": el cierre se detiene aquí, no se publica un modelo a medias.');
                        for (var z = i + 1; z < NODOS.length; z++) nodo(z, '', 'no ejecutado', null);
                        break;
                    }
                    if (i === 5 && e.rojas.length) {
                        nodo(5, 'fail', e.rojas.length + ' reglas en rojo', null);
                        e.rojas.forEach(function (r) { log.push('er', r.id + ' · ' + r.q + ' — ' + r.h); });
                        await k.wait(280);
                        if (c.detener) {
                            log.push('er', 'Política "detener si la validación falla": la publicación no ocurre. Se notifica al responsable del cierre con el detalle por regla.');
                            for (var y = 6; y < NODOS.length; y++) nodo(y, '', 'no ejecutado', null);
                            break;
                        }
                        log.push('wa', 'La política permite continuar: se publica con el aviso visible en el tablero.');
                        continue;
                    }

                    nodo(i, 'done', valorNodo(e, i), o && o.venc ? (o.est === 'warn' ? C.amber : C.rose) : null);
                    if (o) {
                        log.push(o.venc ? (c.tol === 'marca' ? 'wa' : 'er') : 'ok',
                            o.n + ': ' + k.fmt(o.filas, 0) + ' filas, corte ' + o.corte + ' (' + edadTxt(o.edad) + ')' +
                            (o.venc ? ' — fuera de umbral, ' + (c.tol === 'marca' ? 'entra marcado como diferido' : 'entra sin marca y las reglas de frescura no lo verán') : ''));
                    } else if (i === 4) {
                        log.push('in', 'Normalización: llaves unificadas, moneda a USD y calendario del periodo sobre ' + k.fmt(e.total, 0) + ' filas');
                    } else if (i === 5) {
                        log.push('ok', '42 reglas aplicadas, ninguna en rojo');
                    } else if (i === 6) {
                        log.push('in', 'Modelo semántico actualizado: 38 medidas, 9 relaciones y una tabla de calendario');
                    } else {
                        log.push('ok', 'Modelo publicado a las ' + hora(e.t) + '. Tablero disponible para el equipo de cierre.');
                    }
                }

                log.push('hl', 'Cierre ' + (corridas > 1 ? 'reprocesado' : 'ejecutado') + ': ' + e.res[0].toLowerCase() +
                    ' · ' + dur(e.t) + ' contra 9 h del cierre manual');
                tH.body.insertBefore(fila(colH, [
                    'Septiembre' + (corridas > 1 ? ' · corrida ' + corridas : ''), k.fmt(e.total, 0), dur(e.t),
                    String(e.rojas.length), { html: k.pill(e.res[1] === 'up' ? 'ok' : e.res[1], e.res[0]) }
                ]), tH.body.firstChild);
                while (tH.body.children.length > 6) tH.body.removeChild(tH.body.lastChild);

                ctl.busy('run', false);
                corriendo = false;
                pintar(); /* resincroniza si el visitante movió un control durante la corrida */
            }

            ctl.on(function () { if (!corriendo) pintar(); });
            ctl.onClick('run', ejecutar);

            pintar();
            log.push('in', 'Cadena cargada: 4 orígenes, 8 nodos y 42 reglas de validación documentadas');
        }
    });
})();
