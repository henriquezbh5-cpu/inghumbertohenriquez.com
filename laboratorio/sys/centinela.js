/* ============================================================
   CENTINELA — conciliación a tres vías
   Orden de compra vs recepción vs factura. Enseña tres palancas
   reales: tolerancia de precio, tolerancia de cantidad y umbral
   de materialidad. Estrechas inundan de falsos positivos; anchas
   dejan pasar dinero. Y muestra qué hace el robot cuando no
   puede probar las tres vías: no firma.
   ============================================================ */
(function () {
    'use strict';
    var LAB = window.LAB;

    /* perfil sintético: proveedor, Δ precio unitario %, Δ cantidad %,
       duplicado, sin recepción, entrega parcial facturada completa,
       sin evidencia (no se pudo resolver la orden) */
    var PERFILES = [
        ['Suministros del Norte', 0.4, 0, false, false, false, false],
        ['Logística Andina', 1.2, 0, false, false, false, false],
        ['Papelería Central', 2.8, 4.4, false, false, false, false],
        ['Equipos Delta', 6.5, 0, false, false, false, false],
        ['Servicios Omega', 0, 0, false, true, false, false],
        ['Insumos Pacífico', 0.9, 3.6, false, false, false, false],
        ['Tecnología Aurora', 0.3, 0, true, false, false, false],
        ['Transportes Lima', -1.5, 0, false, false, false, false],
        ['Ferretería Sur', 0.6, 0, false, false, true, false],
        ['Químicos Vega', 0.2, 0, false, false, false, false],
        ['Empaques Robles', 1.4, 1.8, false, false, false, false],
        ['Aceros Marino', -0.8, 0, false, false, false, false],
        ['Textiles Cuscatlán', 1.9, 0, false, false, false, false],
        ['Refrigeración Lempa', 0.7, 0, false, false, false, false],
        ['Cableado Istmo', 0, 0, false, false, false, true],
        ['Herrajes Comalapa', 5.2, 0, false, false, false, false],
        ['Plásticos Torogoz', 1.1, 6.4, false, false, false, false],
        ['Rodamientos Izalco', 2.3, 0.8, false, false, false, false]
    ];

    /* veredictos en orden de precedencia; p = etiqueta corta de la tabla */
    var VER = {
        noev: { p: 'Sin evidencia', t: 'Sin evidencia', tone: 'bad', bloqueo: true },
        sinrec: { p: 'Sin recepción', t: 'Sin recepción', tone: 'bad', bloqueo: true },
        dup: { p: 'Duplicado', t: 'Duplicado', tone: 'bad', bloqueo: true },
        cant: { p: 'Cantidad', t: 'Cantidad', tone: 'warn', bloqueo: false },
        prec: { p: 'Precio', t: 'Precio', tone: 'warn', bloqueo: false },
        menor: { p: 'Bajo umbral', t: 'Bajo umbral', tone: 'idle', bloqueo: false },
        ok: { p: 'Conciliada', t: 'Conciliada', tone: 'ok', bloqueo: false }
    };
    var BARRAS = ['noev', 'sinrec', 'dup', 'cant', 'prec', 'menor'];
    var H_POR_EXC = 0.25;

    function sgn(n) {
        if (n == null) return '—';
        return (n > 0.0005 ? '+' : '') + LAB.kit.fmt(n, 1) + '%';
    }

    /* lote del día: los mismos números para todo visitante */
    function datos() {
        var r = LAB.kit.rng(4411);
        return PERFILES.map(function (p, i) {
            var pu = Math.round((14 + r() * 296) * 100) / 100;
            var ped = (12 + Math.floor(r() * 29)) * 10;
            var rec = p[4] ? 0 : (p[5] ? Math.round(ped * 0.9) : ped);
            /* al menos una unidad de diferencia: la desviación nunca se pierde por redondeo */
            var extra = (p[2] > 0 && rec > 0) ? Math.max(1, Math.round(rec * p[2] / 100)) : 0;
            var cf = (p[4] || p[5]) ? ped : rec + extra;
            var puf = Math.round(pu * (1 + p[1] / 100) * 100) / 100;
            var d = {
                doc: 'F-' + (7412 + i * 7 + Math.floor(r() * 6)),
                oc: 'OC-' + (3140 + i * 11 + Math.floor(r() * 9)),
                prov: p[0], pu: pu, puf: puf, ped: ped, rec: rec, cf: cf,
                mf: Math.round(puf * cf * 100) / 100,
                dPrec: (puf / pu - 1) * 100,
                dCant: rec ? (cf - rec) / rec * 100 : null,
                dup: !!p[3], noev: !!p[6]
            };
            /* el adjunto llegó ilegible: hay monto facturado pero no hay orden que comparar */
            if (d.noev) { d.oc = null; d.ped = null; d.rec = null; d.dPrec = null; d.dCant = null; }
            return d;
        });
    }

    /* exceso facturado sobre orden y recepción, en dinero */
    function exceso(d) {
        if (d.noev || d.rec === 0) return d.mf;
        return Math.max(0, d.puf - d.pu) * d.cf + Math.max(0, d.cf - d.rec) * d.pu;
    }

    /* precedencia dura: sin evidencia > sin recepción > duplicado >
       cantidad > precio > materialidad > conciliada */
    function veredicto(d, tp, tc, umbral, reglaDup) {
        if (d.noev) return 'noev';
        if (d.rec === 0) return 'sinrec';
        if (d.dup && reglaDup) return 'dup';
        var fuera = null;
        if (Math.abs(d.dCant) > tc + 1e-9) fuera = 'cant';
        else if (Math.abs(d.dPrec) > tp + 1e-9) fuera = 'prec';
        if (!fuera) return 'ok';
        /* el umbral de materialidad aprueba la desviación pequeña sin analista */
        return exceso(d) < umbral ? 'menor' : fuera;
    }

    /* los bloqueos exponen la factura entera; las desviaciones solo el exceso */
    function riesgo(d, cod) {
        if (VER[cod].bloqueo) return d.mf;
        if (d.dup) return d.mf;
        return exceso(d);
    }

    function evaluar(lote, tp, tc, umbral, reglaDup) {
        var res = {
            filas: [], auto: 0, exc: 0, retenido: 0, fuga: 0, fugaN: 0, peor: null,
            cuenta: {}, monto: {}
        };
        BARRAS.forEach(function (m) { res.cuenta[m] = 0; res.monto[m] = 0; });
        lote.forEach(function (d) {
            var cod = veredicto(d, tp, tc, umbral, reglaDup);
            var rr = riesgo(d, cod);
            res.filas.push({ d: d, cod: cod, r: rr });
            res.cuenta[cod] = (res.cuenta[cod] || 0) + 1;
            res.monto[cod] = (res.monto[cod] || 0) + rr;
            if (cod === 'ok' || cod === 'menor') {
                res.auto++;
                if (rr > 0.5) {
                    res.fuga += rr;
                    res.fugaN++;
                    if (!res.peor || rr > res.peor.r) res.peor = { d: d, r: rr };
                }
            } else {
                res.exc++;
                res.retenido += rr;
            }
        });
        return res;
    }

    LAB.register({
        id: 'centinela',
        name: 'CENTINELA',
        family: 'procesos',
        tagline: 'Conciliación a tres vías',
        title: 'Conciliación a tres vías de facturas contra orden y recepción',
        intro: 'El robot compara orden de compra, recepción y factura documento por documento y decide qué se paga solo. Mueva las tres tolerancias y vea en vivo qué se aprueba, qué se detiene y cuánto dinero deja pasar cada decisión.',
        spec: {
            trigger: 'Llegada de una factura al buzón de cuentas por pagar. El adjunto se extrae, se registra en el lote del día y dispara la corrida.',
            systems: 'RPA de escritorio que lee la orden y la recepción en el ERP, Excel como hoja de trabajo del lote, SharePoint para el expediente y correo para el acuse.',
            output: 'Lote conciliado listo para programar pago y expediente de excepciones con motivo, monto expuesto y documento de respaldo por cada caso detenido.',
            failure: 'La excepción se enruta a un analista con la diferencia ya calculada y el soporte adjunto. Si el robot no puede leer la orden o no encuentra la recepción, no firma: retiene la factura y la manda a revisión.'
        },
        impact: [
            ['92%', 'facturas aprobadas sin intervención humana'],
            ['4 h -> 6 min', 'por lote de 300 documentos'],
            ['$0', 'pagos emitidos sin las tres vías probadas']
        ],
        render: function (host, k) {
            var lote = datos();
            var TOTAL = lote.length;
            var TONO = { noev: k.C.rose, sinrec: k.C.rose, dup: k.C.rose, cant: k.C.amber, prec: k.C.amber, menor: k.C.teal };

            var ctl = k.controls([
                { k: 'tp', t: 'range', label: 'Tolerancia de precio', min: 0, max: 8, step: 0.25, value: 2, suffix: '%', decimals: 2 },
                { k: 'tc', t: 'range', label: 'Tolerancia de cantidad', min: 0, max: 8, step: 0.5, value: 2, suffix: '%', decimals: 1 },
                { k: 'um', t: 'range', label: 'Umbral de materialidad', min: 0, max: 3200, step: 50, value: 400, suffix: 'USD', decimals: 0 },
                { k: 'dup', t: 'check', label: 'Bloquear duplicados', value: true },
                { k: 'run', t: 'button', label: 'Ejecutar conciliación', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kp = k.kpis([
                ['Aprobadas sin tocar', '—'], ['Excepciones', '—'],
                ['Retenido en excepciones', '—'], ['Fuga aprobada', '—']
            ]);
            host.appendChild(kp.node);

            var pp = k.panel();
            pp.appendChild(k.txt('div', 'mono-head', 'Cadena de la corrida'));
            var pipe = k.pipe([
                { n: 'Buzón', m: 'Factura entrante' },
                { n: 'Extracción', m: 'Campos del adjunto' },
                { n: 'Orden de compra', m: 'Lectura del ERP' },
                { n: 'Recepción', m: 'Lectura del ERP' },
                { n: 'Tres vías', m: 'Reglas de tolerancia' },
                { n: 'Salida', m: 'Pago o expediente' }
            ]);
            pp.appendChild(pipe.node);
            host.appendChild(pp);

            var grid = k.el('div', 'grid2 wide-left');
            host.appendChild(grid);

            var cb = k.chartbox('Cómo cerró cada documento', 'Corrida actual', '236px');
            grid.appendChild(cb.node);

            var lado = k.panel();
            lado.appendChild(k.txt('div', 'mono-head', 'Bitácora de la corrida'));
            var log = k.log('182px');
            lado.appendChild(log.node);
            grid.appendChild(lado);

            var ip = k.panel();
            ip.appendChild(k.txt('div', 'mono-head', 'Lectura del lote'));
            var ins = k.insights();
            ip.appendChild(ins.node);
            host.appendChild(ip);

            var tp = k.panel();
            var hrow = k.el('div');
            hrow.style.cssText = 'display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap';
            hrow.appendChild(k.txt('div', 'mono-head', 'Expediente del lote — ' + TOTAL + ' documentos'));
            var estado = k.txt('div', 'mono', '');
            estado.style.cssText = 'font-size:11px;color:var(--label)';
            estado.setAttribute('aria-live', 'polite');
            hrow.appendChild(estado);
            tp.appendChild(hrow);
            var tHolder = k.el('div');
            tp.appendChild(tHolder);
            host.appendChild(tp);

            var COLS = [
                { t: 'Factura' }, { t: 'Proveedor' }, { t: 'Orden' },
                { t: 'Ped / Rec / Fac', r: true }, { t: 'Δ precio', r: true },
                { t: 'Δ cant.', r: true }, { t: 'Facturado', r: true },
                { t: 'Expuesto', r: true }, { t: 'Veredicto' }
            ];

            var montos = BARRAS.map(function () { return 0; });
            var ch = k.chart(cb.canvas, {
                type: 'bar',
                data: {
                    labels: BARRAS.map(function (m) { return VER[m].t; }),
                    datasets: [{
                        data: BARRAS.map(function () { return 0; }),
                        backgroundColor: BARRAS.map(function (m) { return TONO[m]; }),
                        borderWidth: 0, borderRadius: 5, barThickness: 16
                    }]
                },
                options: {
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (c) {
                                    var n = c.parsed.x;
                                    return n + (n === 1 ? ' documento · ' : ' documentos · ') + k.money(montos[c.dataIndex]);
                                }
                            }
                        }
                    },
                    scales: {
                        x: Object.assign({}, k.AXIS, { beginAtZero: true, ticks: { padding: 8, precision: 0, stepSize: 2 } }),
                        y: k.AXIS_BARE
                    }
                }
            });

            var token = 0;
            var filasNode = null;
            var ultimo = null;

            function pintar() {
                token++;
                var vtp = ctl.get('tp'), vtc = ctl.get('tc'), vum = ctl.get('um'), vdup = ctl.get('dup');
                var e = evaluar(lote, vtp, vtc, vum, vdup);
                ultimo = e;

                kp.set(0, k.fmt(e.auto, 0) + ' / ' + TOTAL, e.auto / TOTAL >= 0.7 ? 'up' : (e.auto / TOTAL >= 0.45 ? 'warn' : 'bad'));
                kp.set(1, k.fmt(e.exc, 0), e.exc <= 3 ? 'up' : (e.exc > 8 ? 'bad' : 'warn'));
                kp.set(2, k.money(e.retenido), e.retenido > 0 ? '' : 'up');
                kp.set(3, k.money(e.fuga), e.fuga > 4000 ? 'bad' : (e.fuga > 0.5 ? 'warn' : 'up'));

                montos = BARRAS.map(function (m) { return e.monto[m]; });
                if (ch) {
                    ch.data.datasets[0].data = BARRAS.map(function (m) { return e.cuenta[m]; });
                    ch.update();
                }
                cb.cap('Rosa: bloqueo, no se paga. Ámbar: desviación fuera de tolerancia, va a analista. ' +
                    'Turquesa: aprobada por el umbral de ' + k.money(vum) + '. ' +
                    'Conciliadas limpias: ' + e.cuenta.ok + ' de ' + TOTAL +
                    '. Muestra con densidad de excepciones alta a propósito.');

                tHolder.innerHTML = '';
                var t = k.table(COLS, e.filas.map(function (f) {
                    var d = f.d;
                    return [
                        d.doc, d.prov, d.oc == null ? 'no resuelta' : d.oc,
                        d.rec == null ? '— / — / ' + d.cf : d.ped + ' / ' + d.rec + ' / ' + d.cf,
                        sgn(d.dPrec), sgn(d.dCant), k.money(d.mf),
                        f.r > 0.5 ? k.money(f.r) : '—',
                        { html: k.pill(VER[f.cod].tone, VER[f.cod].p) }
                    ];
                }));
                tHolder.appendChild(t.node);
                filasNode = t.body.children;

                pipe.reset();
                pipe.set(0, 'done', TOTAL + ' facturas');
                pipe.set(1, e.cuenta.noev ? 'fail' : 'done', (TOTAL - e.cuenta.noev) + ' legibles');
                pipe.set(2, 'done', (TOTAL - e.cuenta.noev) + ' órdenes');
                pipe.set(3, e.cuenta.sinrec ? 'fail' : 'done', (TOTAL - e.cuenta.noev - e.cuenta.sinrec) + ' recepciones');
                pipe.set(4, 'done', e.exc + ' excepciones');
                pipe.set(5, 'done', e.auto + ' a pago');

                log.clear();
                log.push('in', 'Reglas: precio ' + k.pct(vtp, 2) + ' · cantidad ' + k.pct(vtc, 1) +
                    ' · materialidad ' + k.money(vum) + ' · duplicados ' + (vdup ? 'bloqueados' : 'sin regla') + '.');
                log.push(e.exc ? 'wa' : 'ok', e.auto + ' facturas a pago programado y ' + e.exc +
                    ' al expediente de excepciones. Pulse Ejecutar para ver la corrida documento por documento.');

                estado.textContent = 'lote evaluado ' + k.stamp() + ' · ' + e.exc + ' al expediente';
                lectura(e, vtp, vtc, vum, vdup);
            }

            function lectura(e, vtp, vtc, vum, vdup) {
                ins.clear();
                var cero = evaluar(lote, 0, 0, 0, true);

                var l1;
                if (e.fuga > 0.5) {
                    l1 = 'Con precio en <b>' + k.pct(vtp, 2) + '</b>, cantidad en <b>' + k.pct(vtc, 1) +
                        '</b> y materialidad en <b>' + k.money(vum) + '</b>, el lote aprueba sin revisión <b>' +
                        k.money(e.fuga) + '</b> de sobrefacturación en <b>' + e.fugaN + '</b> ' +
                        (e.fugaN === 1 ? 'factura' : 'facturas') + '. La mayor es ' +
                        k.escapeHtml(e.peor.d.prov) + ' con ' + k.money(e.peor.r) + '.';
                } else {
                    l1 = 'Con estas tolerancias no pasa ninguna diferencia a favor del proveedor: toda desviación cae en el expediente.';
                }
                if (!vdup) l1 += ' La regla de duplicados está apagada, así que una factura repetida sale a pago.';
                ins.add('amber', '$', l1);

                var horas = e.exc * H_POR_EXC;
                ins.add('cyan', 'h', 'Las <b>' + e.exc + '</b> excepciones abren <b>' + k.fmt(horas, 2) +
                    ' h</b> de revisión manual a 0.25 h por documento. Con las tres palancas en cero serían <b>' +
                    cero.exc + '</b> excepciones y <b>' + k.fmt(cero.exc * H_POR_EXC, 2) +
                    ' h</b>, buena parte por centavos de redondeo que el analista cierra sin cambiar nada.');

                var nm = e.cuenta.menor;
                var l3;
                if (vum === 0) {
                    l3 = 'El umbral de materialidad está en cero: cualquier centavo fuera de tolerancia abre un caso. Súbalo y vea cuántos documentos dejan de llegar al analista y a qué precio.';
                } else if (nm) {
                    l3 = 'El umbral de <b>' + k.money(vum) + '</b> aprueba solo <b>' + nm + '</b> ' +
                        (nm === 1 ? 'documento' : 'documentos') + ' fuera de tolerancia, por <b>' + k.money(e.monto.menor) +
                        '</b> en total. Es el precio explícito de no abrir esos casos.';
                } else {
                    l3 = 'Ningún documento cae bajo el umbral de <b>' + k.money(vum) +
                        '</b>: las desviaciones de este lote son o muy pequeñas para salir de tolerancia o demasiado caras para aprobarse solas.';
                }
                ins.add('violet', '%', l3);

                var bloq = e.cuenta.noev + e.cuenta.sinrec + (vdup ? e.cuenta.dup : 0);
                ins.add('rose', '!', 'Los <b>' + bloq + '</b> bloqueos no dependen de ninguna tolerancia: sin orden legible, sin recepción o con sospecha de duplicado el robot retiene la factura completa y la enruta con el soporte adjunto. Ninguna palanca los aprueba.');
            }

            /* la corrida no cambia el resultado: recorre la cadena y el
               expediente para que se vea la secuencia y el enrutamiento */
            async function correr() {
                var mio = ++token;
                var e = ultimo;
                var filas = filasNode;
                if (!e || !filas || !filas.length) return;
                ctl.busy('run', true);
                pipe.reset();
                log.clear();

                function vivo() { return mio === token; }
                /* jitter cosmético en las duraciones, nunca en los datos */
                function ms(base) { return base + Math.random() * 90; }

                log.push('in', 'Disparo: ' + TOTAL + ' adjuntos nuevos en el buzón de cuentas por pagar.');
                pipe.set(0, 'run');
                await k.wait(ms(240));
                if (!vivo()) { ctl.busy('run', false); return; }
                pipe.set(0, 'done', TOTAL + ' facturas');

                pipe.set(1, 'run');
                await k.wait(ms(300));
                if (!vivo()) { ctl.busy('run', false); return; }
                var leg = TOTAL - e.cuenta.noev;
                pipe.set(1, e.cuenta.noev ? 'fail' : 'done', leg + ' legibles');
                if (e.cuenta.noev) log.push('er', e.cuenta.noev + ' adjunto sin número de orden legible. Sin orden no hay tres vías: se retiene y se enruta a captura manual.');

                pipe.set(2, 'run');
                await k.wait(ms(280));
                if (!vivo()) { ctl.busy('run', false); return; }
                pipe.set(2, 'done', leg + ' órdenes');
                log.push('in', 'Órdenes de compra leídas del ERP para ' + leg + ' facturas.');

                pipe.set(3, 'run');
                await k.wait(ms(280));
                if (!vivo()) { ctl.busy('run', false); return; }
                var conRec = leg - e.cuenta.sinrec;
                pipe.set(3, e.cuenta.sinrec ? 'fail' : 'done', conRec + ' recepciones');
                if (e.cuenta.sinrec) log.push('er', e.cuenta.sinrec + ' factura sin acta de recepción. El robot no aprueba mercadería que nadie recibió.');

                pipe.set(4, 'run');
                for (var i = 0; i < filas.length; i++) {
                    if (!vivo()) { ctl.busy('run', false); return; }
                    var fila = filas[i];
                    if (!fila || !fila.parentNode) { ctl.busy('run', false); return; }
                    var f = e.filas[i];
                    fila.classList.add('hit');
                    estado.textContent = 'tres vías · ' + (i + 1) + ' / ' + filas.length + ' · ' + f.d.doc;
                    if (f.cod === 'ok') log.push('ok', f.d.doc + ' ' + f.d.prov + ': tres vías cuadran, a pago programado.');
                    else if (f.cod === 'menor') log.push('ok', f.d.doc + ' ' + f.d.prov + ': desviación de ' + k.money(f.r) + ' bajo el umbral, a pago programado.');
                    else if (VER[f.cod].bloqueo) log.push('er', f.d.doc + ' ' + f.d.prov + ': ' + VER[f.cod].t.toLowerCase() + ', factura retenida por ' + k.money(f.r) + '.');
                    else log.push('wa', f.d.doc + ' ' + f.d.prov + ': ' + VER[f.cod].t.toLowerCase() + ' fuera de tolerancia, ' + k.money(f.r) + ' al expediente.');
                    await k.wait(ms(58));
                    if (fila.parentNode) fila.classList.remove('hit');
                }
                if (!vivo()) { ctl.busy('run', false); return; }
                pipe.set(4, 'done', e.exc + ' excepciones · ' + e.auto + ' a pago');

                pipe.set(5, 'run');
                await k.wait(ms(260));
                if (!vivo()) { ctl.busy('run', false); return; }
                pipe.set(5, 'done', e.auto + ' a pago');
                log.push('hl', 'Lote cerrado: ' + e.auto + ' facturas al archivo de pago programado y ' + e.exc +
                    ' al expediente de excepciones con motivo, monto y soporte. Retenido ' + k.money(e.retenido) + '.');
                estado.textContent = 'lote conciliado ' + k.stamp() + ' · ' + e.exc + ' al expediente de excepciones';
                ctl.busy('run', false);
            }

            ctl.onClick('run', function () { correr(); });
            ctl.on(function () { pintar(); });

            /* abre en estado de trabajo: datos, indicadores, cadena y gráfica pintados */
            pintar();
        }
    });
})();
