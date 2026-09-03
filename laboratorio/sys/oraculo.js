/* ============================================================
   ORÁCULO — pronóstico de demanda con intervalo y compuerta
   Ajusta con 30 meses, mide el error contra 6 meses que el modelo
   nunca vio y solo escribe en el tablero si ese error queda bajo el
   umbral. Lo que sale es un rango, nunca un número solo.
   Serie sintética con semilla fija: todos ven los mismos números.
   ============================================================ */
(function () {
    'use strict';
    var LAB = window.LAB;
    var C = LAB.C;

    var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var NHIST = 36;   /* meses de historia disponible */
    var NTR = 30;     /* meses con los que se ajusta */
    var NVA = 6;      /* meses reservados para validar */
    var UMBRAL = 12;  /* error máximo aceptado para publicar, en % */
    var VIS = 24;     /* meses de historia visibles en la gráfica */

    function etiqueta(t) { return MES[t % 12] + ' ' + (23 + Math.floor(t / 12)); }

    /* Historia sintética: tendencia lineal, estacionalidad anual con
       pico de fin de año y ruido acotado. Semilla fija. */
    function datos() {
        var r = LAB.kit.rng(11207), est = [0.82, 0.80, 0.95, 1.01, 1.05, 0.99, 0.92, 0.96, 1.06, 1.13, 1.24, 1.45];
        var y = [], t;
        for (t = 0; t < NHIST; t++) y.push(Math.round((1180 + 11.5 * t) * est[t % 12] * (1 + (r() - 0.5) * 0.062)));
        return y;
    }

    /* ---------- modelos ---------- */

    /* Mínimos cuadrados de y contra el índice de mes. */
    function ols(y, n) {
        var sx = 0, sy = 0, sxx = 0, sxy = 0, i;
        for (i = 0; i < n; i++) { sx += i; sy += y[i]; sxx += i * i; sxy += i * y[i]; }
        var b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
        return { a: (sy - b * sx) / n, b: b };
    }

    /* Ajusta con los primeros n meses y deja el ajuste en muestra. */
    function ajustar(tipo, y, n) {
        var i, m, aj = [];
        if (tipo === 'seas') {
            /* Descomposición multiplicativa: tendencia por mínimos cuadrados e
               índice estacional como razón media contra esa tendencia. */
            var lr = ols(y, n), sum = [], cnt = [], idx = [], med = 0, tr;
            for (m = 0; m < 12; m++) { sum.push(0); cnt.push(0); idx.push(1); }
            for (i = 0; i < n; i++) {
                tr = lr.a + lr.b * i;
                if (tr > 0) { m = i % 12; sum[m] += y[i] / tr; cnt[m] += 1; }
            }
            for (m = 0; m < 12; m++) { idx[m] = cnt[m] ? sum[m] / cnt[m] : 1; med += idx[m]; }
            med /= 12;
            for (m = 0; m < 12; m++) idx[m] /= med;
            for (i = 0; i < n; i++) aj.push((lr.a + lr.b * i) * idx[i % 12]);
            return { tipo: tipo, n: n, a: lr.a, b: lr.b, idx: idx, aj: aj };
        }
        if (tipo === 'holt') {
            /* Suavizado exponencial con nivel y pendiente. No modela
               estacionalidad: eso lo destapa la validación. */
            var al = 0.42, be = 0.16, niv = y[0], ten = y[1] - y[0], f, nn;
            aj.push(null);
            for (i = 1; i < n; i++) {
                f = niv + ten; aj.push(f);
                nn = al * y[i] + (1 - al) * f;
                ten = be * (nn - niv) + (1 - be) * ten;
                niv = nn;
            }
            return { tipo: tipo, n: n, niv: niv, ten: ten, aj: aj };
        }
        /* Media móvil de 3: sin tendencia ni estacionalidad, la línea base. */
        for (i = 0; i < n; i++) aj.push(i < 3 ? null : (y[i - 1] + y[i - 2] + y[i - 3]) / 3);
        return { tipo: 'ma3', n: n, y: y.slice(0, n), aj: aj };
    }

    /* Valor pronosticado h pasos después del último mes de ajuste. */
    function adelante(mo, h) {
        if (mo.tipo === 'seas') { var t = mo.n - 1 + h; return (mo.a + mo.b * t) * mo.idx[t % 12]; }
        if (mo.tipo === 'holt') return mo.niv + h * mo.ten;
        var w = mo.y.slice(mo.n - 3), v = 0, i;
        for (i = 1; i <= h; i++) { v = (w[0] + w[1] + w[2]) / 3; w.shift(); w.push(v); }  /* la media se aplana sola */
        return v;
    }

    /* Cuantil normal, aproximación de Abramowitz y Stegun 26.2.23, error
       menor a 4.5e-4. La confianza va de 80 a 99, así que la cola siempre
       queda bajo 0.5 y no hace falta reflejar el signo. */
    function zDe(conf) {
        var t = Math.sqrt(-2 * Math.log((1 - conf / 100) / 2));
        return t - (2.515517 + 0.802853 * t + 0.010328 * t * t) /
            (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t);
    }

    var NOMBRE = { seas: 'Tendencia + estacionalidad', holt: 'Suavizado exponencial', ma3: 'Media móvil de 3' };
    var FACTOR = { base: 1, opt: 1.08, con: 0.92 };
    var ESCENARIO = { base: 'Base', opt: 'Optimista +8%', con: 'Conservador -8%' };
    var BANDA = { ok: 'rgba(56,189,248,.34)', okBg: 'rgba(56,189,248,.12)', mal: 'rgba(244,114,182,.34)', malBg: 'rgba(244,114,182,.10)' };

    LAB.register({
        id: 'oraculo',
        name: 'ORÁCULO',
        family: 'datos',
        tagline: 'Pronóstico con intervalos',
        title: 'Pronóstico de demanda con intervalo y validación fuera de muestra',
        intro: 'Ajusta con 30 meses, se mide contra los 6 que reservó y solo publica si el error queda bajo el umbral. ' +
            'Mueva horizonte, modelo, confianza y escenario: el intervalo y la compuerta de publicación responden al instante.',
        spec: {
            trigger: 'Cierre de mes, o pedido del área de planeación antes de comprometer inventario o presupuesto.',
            systems: 'Python con pandas y statsmodels sobre el almacén de datos; el resultado aprobado se escribe en la tabla que lee el tablero de BI.',
            output: 'Pronóstico mes a mes con límite inferior, valor central y límite superior, más el error de validación y el escenario aplicado.',
            failure: 'Si el error fuera de muestra supera el umbral, la compuerta no deja publicar: el tablero conserva la corrida anterior y el área recibe el diagnóstico, no un número falso.'
        },
        impact: [
            ['30 / 6', 'meses de ajuste y de validación fuera de muestra'],
            ['12%', 'error máximo tolerado antes de retener el pronóstico'],
            ['3 cifras', 'cada mes sale con inferior, central y superior']
        ],

        render: function (host, k) {
            var y = datos();
            function opciones(d) { return Object.keys(d).map(function (v) { return { v: v, t: d[v] }; }); }

            var ctl = k.controls([
                { k: 'hor', t: 'range', label: 'Horizonte', min: 1, max: 12, step: 1, value: 6, suffix: 'meses' },
                { k: 'mod', t: 'select', label: 'Modelo', value: 'seas', options: opciones(NOMBRE) },
                { k: 'conf', t: 'range', label: 'Confianza', min: 80, max: 99, step: 1, value: 95, suffix: '%' },
                { k: 'esc', t: 'select', label: 'Escenario', value: 'base', options: opciones(ESCENARIO) },
                { k: 'run', t: 'button', label: 'Revalidar', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kpi = k.kpis([['Pronóstico acumulado', '—'], ['Error fuera de muestra', '—'],
                ['Sesgo del modelo', '—'], ['Ancho al cierre', '—'], ['Compuerta', '—']]);
            host.appendChild(kpi.node);
            var etqKpi = k.$$('.kpi .k', kpi.node);   /* etiquetas que cambian con el horizonte */

            /* La decisión de publicar, escrita y arriba de todo. */
            var gate = k.panel();
            gate.appendChild(k.txt('div', 'mono-head', 'Compuerta de publicación'));
            var gRow = k.el('div');
            gRow.style.cssText = 'display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-top:8px';
            var gPill = k.el('span'), gTxt = k.txt('span', null, '');
            gTxt.style.color = C.body;
            gRow.appendChild(gPill); gRow.appendChild(gTxt);
            gate.appendChild(gRow);
            host.appendChild(gate);

            var cbP = k.chartbox('Historia reciente, ajuste y pronóstico', '');
            var cbV = k.chartbox('Validación fuera de muestra', '');
            var fila1 = k.el('div', 'grid2 wide-left');
            fila1.appendChild(cbP.node); fila1.appendChild(cbV.node);
            host.appendChild(fila1);

            /* Panel con encabezado monoespaciado y un cuerpo colgado. */
            function bloque(titulo, cuerpo, margen) {
                var p = k.panel(), h = k.txt('div', 'mono-head', titulo);
                cuerpo.style.marginTop = margen;
                p.appendChild(h); p.appendChild(cuerpo);
                return { node: p, head: h };
            }
            var pasos = k.steps(['Historia mensual disponible', 'Reserva de validación, fuera del ajuste',
                'Ajuste del modelo', 'Error contra los meses reservados',
                'Reajuste con la historia completa', 'Escritura en la tabla del tablero']);
            var ins = k.insights(), tablaHost = k.el('div');
            var fila2 = k.el('div', 'grid2 wide-left');
            fila2.appendChild(bloque('Cómo se lee el pronóstico', ins.node, '6px').node);
            fila2.appendChild(bloque('Cómo se valida antes de publicar', pasos.node, '6px').node);
            host.appendChild(fila2);
            /* la tabla va a lo ancho: doce meses por seis columnas no caben
               en media rejilla sin desbordarse */
            var bTab = bloque('Pronóstico mes a mes', tablaHost, '12px');
            host.appendChild(bTab.node);

            /* ---------- gráficas: se crean una vez y se actualizan ---------- */
            var ejeY = Object.assign({}, k.AXIS, { ticks: { padding: 8, callback: function (v) { return k.fmt(v, 0); } } });
            function linea(label, color, ancho, dash, relleno, fondo) {
                return { label: label, data: [], borderColor: color, borderWidth: ancho, borderDash: dash || [],
                    tension: 0.3, pointRadius: 0, pointHoverRadius: 4, fill: relleno || false, backgroundColor: fondo || 'transparent' };
            }
            function etqPunto(c) { return c.dataset.label + ': ' + (c.parsed.y == null ? '—' : k.fmt(c.parsed.y, 0)); }
            /* Punteado significa proyección, nunca decoración: solo el pronóstico
               y su banda van punteados. Las dos series de la banda van al final
               porque Chart.js dibuja del último índice al primero, así el relleno
               queda debajo de todo. */
            var chP = k.chart(cbP.canvas, {
                type: 'line',
                data: { labels: [], datasets: [
                    linea('Historia observada', C.teal, 2.2),
                    linea('Ajuste en muestra', C.violet, 1.3),
                    linea('Pronóstico', C.cyan, 2.2, [6, 4]),
                    linea('Banda de confianza', BANDA.ok, 1, [3, 3], '+1', BANDA.okBg),
                    linea('Banda inferior', BANDA.ok, 1, [3, 3])
                ] },
                options: {
                    /* Sin interpolación: estas gráficas se repintan en cada evento
                       de los controles. Un tween de 700 ms dejaría la curva atrás
                       del deslizador y, si el repintado entra con la animación en
                       vuelo, el animador de Chart.js tiquea sobre series que ya
                       cambiaron de largo y revienta fuera de todo try/catch. */
                    animation: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { position: 'bottom', labels: { filter: function (it) { return it.text !== 'Banda inferior'; } } },
                        tooltip: { callbacks: { label: etqPunto } }
                    },
                    scales: {
                        x: Object.assign({}, k.AXIS_BARE, { ticks: { padding: 8, maxTicksLimit: 9 } }),
                        y: ejeY
                    }
                }
            });
            var errVal = [];   /* error por mes de validación, para el pie del tooltip */
            var chV = k.chart(cbV.canvas, {
                type: 'bar',
                data: { labels: [], datasets: [
                    { label: 'Observado', data: [], backgroundColor: C.teal, borderRadius: 4, maxBarThickness: 16 },
                    { label: 'Pronosticado', data: [], backgroundColor: C.violet, borderRadius: 4, maxBarThickness: 16 }
                ] },
                options: {
                    animation: false,   /* misma razón que la gráfica de arriba */
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: { callbacks: { label: etqPunto, footer: function (it) {
                            var e = errVal[it[0].dataIndex];
                            return e == null ? '' : 'Error del mes: ' + (e >= 0 ? '+' : '-') + k.pct(Math.abs(e), 1);
                        } } }
                    },
                    scales: { x: Object.assign({}, k.AXIS_BARE), y: Object.assign({}, ejeY, { beginAtZero: true }) }
                }
            });

            /* ---------- cálculo ---------- */
            function calcular() {
                var H = ctl.get('hor'), tipo = ctl.get('mod'), conf = ctl.get('conf'), esc = ctl.get('esc');
                var f = FACTOR[esc], z = zDe(conf), h, i, p, a, e, c, w, pin;

                /* 1. ajuste solo con los primeros 30 meses */
                var mVal = ajustar(tipo, y, NTR), pv = [], err = [], mape = 0, mpe = 0;
                for (h = 1; h <= NVA; h++) {
                    p = adelante(mVal, h); a = y[NTR + h - 1]; e = (p - a) / a;
                    pv.push(p); err.push(e * 100);
                    mape += Math.abs(e); mpe += e;
                }
                mape = mape / NVA * 100; mpe = mpe / NVA * 100;

                /* 2. el error medio absoluto se lleva a desviación (x1.2533) y
                      se abre con la raíz de los pasos adelante */
                var sigma = mape / 100 * 1.2533, mFull = ajustar(tipo, y, NHIST);
                var fil = [], total = 0, pico = 0;
                for (h = 1; h <= H; h++) {
                    c = adelante(mFull, h) * f;
                    w = z * sigma * Math.sqrt(h);
                    fil.push({ mes: etiqueta(NHIST - 1 + h), c: c, lo: Math.max(0, c * (1 - w)), hi: c * (1 + w), w: w * 100 });
                    total += c;
                    if (c > fil[pico].c) pico = h - 1;
                }

                /* 3. series de la gráfica: la banda nace pinchada en el último
                      dato observado y se abre hacia adelante */
                var labels = [], hist = [], aju = [], cen = [], hi = [], lo = [];
                for (i = NHIST - VIS; i < NHIST; i++) {
                    labels.push(etiqueta(i)); hist.push(y[i]); aju.push(mFull.aj[i]);
                    pin = (i === NHIST - 1) ? y[i] : null;
                    cen.push(pin); hi.push(pin); lo.push(pin);
                }
                for (h = 0; h < H; h++) {
                    labels.push(fil[h].mes); hist.push(null); aju.push(null);
                    cen.push(fil[h].c); hi.push(fil[h].hi); lo.push(fil[h].lo);
                }

                return { H: H, tipo: tipo, conf: conf, esc: esc, z: z, mape: mape, mpe: mpe,
                    pv: pv, err: err, fil: fil, total: total, pico: fil[pico], apto: mape <= UMBRAL,
                    anchoUno: fil[0].w, anchoFin: fil[H - 1].w,
                    labels: labels, hist: hist, aju: aju, cen: cen, hi: hi, lo: lo };
            }

            /* ---------- pintado ---------- */
            function marcas(R) {
                return [['done', NHIST + ' meses'], ['done', 'últimos ' + NVA], ['done', NTR + ' meses'],
                    [R.apto ? 'done' : 'fail', k.pct(R.mape, 1)],
                    [R.apto ? 'done' : '', R.apto ? NHIST + ' meses' : 'detenido'],
                    [R.apto ? 'done' : 'fail', R.apto ? 'escrito' : 'retenido']];
            }
            function estados(R) {
                var m = marcas(R), i;
                for (i = 0; i < m.length; i++) pasos.set(i, m[i][0], m[i][1]);
            }
            /* Cada ancho lleva palabra además de color. */
            function tramo(w) {
                if (w <= 12) return ['ok', 'estrecho'];
                if (w <= 25) return ['warn', 'amplio'];
                return ['bad', 'no utilizable'];
            }

            function pintar(R) {
                var meses = R.H + (R.H === 1 ? ' mes' : ' meses'), tFin = tramo(R.anchoFin);
                /* el acumulado y el ancho cambian de significado con el horizonte:
                   la etiqueta lo dice, no solo la posición del control */
                if (etqKpi[0]) etqKpi[0].textContent = 'Pronóstico acumulado · ' + meses;
                if (etqKpi[3]) etqKpi[3].textContent = 'Ancho del intervalo · ' + R.fil[R.H - 1].mes;
                kpi.set(0, k.fmt(R.total, 0) + ' u', R.apto ? '' : 'bad');
                kpi.set(1, k.pct(R.mape, 1), R.mape <= 8 ? 'up' : (R.apto ? 'warn' : 'bad'));
                kpi.set(2, (R.mpe >= 0 ? '+' : '-') + k.pct(Math.abs(R.mpe), 1),
                    Math.abs(R.mpe) <= 2 ? 'up' : (Math.abs(R.mpe) <= 5 ? '' : 'warn'));
                kpi.set(3, '±' + k.pct(R.anchoFin, 1), tFin[0] === 'ok' ? '' : (tFin[0] === 'warn' ? 'warn' : 'bad'));
                kpi.set(4, R.apto ? 'Publicado' : 'Retenido', R.apto ? 'up' : 'bad');

                gPill.innerHTML = k.pill(R.apto ? 'ok' : 'bad', R.apto ? 'PUBLICADO' : 'RETENIDO');
                gTxt.textContent = R.apto
                    ? 'Error de ' + k.pct(R.mape, 1) + ' contra el umbral de ' + UMBRAL + '%. Las ' + R.H +
                      ' filas se escriben en la tabla del tablero, con el error del modelo en la misma fila.'
                    : 'Error de ' + k.pct(R.mape, 1) + ', por encima del umbral de ' + UMBRAL + '%. No se escribe nada: el tablero ' +
                      'conserva la corrida anterior y el área recibe el diagnóstico. Los números de abajo sirven para diagnosticar, no para comprar.';

                if (chP) {
                    chP.data.labels = R.labels;
                    [R.hist, R.aju, R.cen, R.hi, R.lo].forEach(function (d, i) { chP.data.datasets[i].data = d; });
                    /* el pronóstico retenido cambia de nombre y de color: la leyenda
                       lo dice con palabras, el color solo acompaña */
                    chP.data.datasets[2].label = R.apto ? 'Pronóstico' : 'Pronóstico retenido';
                    chP.data.datasets[2].borderColor = R.apto ? C.cyan : C.rose;
                    chP.data.datasets[3].borderColor = chP.data.datasets[4].borderColor = R.apto ? BANDA.ok : BANDA.mal;
                    chP.data.datasets[3].backgroundColor = R.apto ? BANDA.okBg : BANDA.malBg;
                    chP.update();
                }
                if (chV) {
                    var lv = [], j;
                    for (j = 0; j < NVA; j++) lv.push(etiqueta(NTR + j));
                    errVal = R.err;
                    chV.data.labels = lv;
                    chV.data.datasets[0].data = y.slice(NTR, NHIST);
                    chV.data.datasets[1].data = R.pv;
                    chV.update();
                }
                cbP.cap(NOMBRE[R.tipo] + ' · banda al ' + R.conf + '% · escenario ' + ESCENARIO[R.esc] +
                    ' · historia hasta ' + etiqueta(NHIST - 1) + ', lo punteado es proyección');
                cbV.cap('Ajuste con ' + NTR + ' meses y medición contra ' + NVA + ' que no entraron al modelo. Error medio ' +
                    k.pct(R.mape, 1) + ' contra un umbral de ' + UMBRAL + '%.');
                bTab.head.textContent = R.apto ? 'Pronóstico mes a mes, escrito en el tablero'
                    : 'Pronóstico mes a mes, retenido: no se escribió en el tablero';

                var filas = R.fil.map(function (d) {
                    var t = tramo(d.w);
                    return [d.mes, k.fmt(d.lo, 0), k.fmt(d.c, 0), k.fmt(d.hi, 0), '±' + k.pct(d.w, 1), { html: k.pill(t[0], t[1]) }];
                });
                var tb = k.table([{ t: 'Mes' }, { t: 'Límite inferior', r: true }, { t: 'Pronóstico', r: true },
                    { t: 'Límite superior', r: true }, { t: 'Ancho', r: true }, { t: 'Lectura del rango', r: true }], filas);
                tablaHost.innerHTML = '';
                tablaHost.appendChild(tb.node);

                /* lectura escrita */
                ins.clear();
                if (!R.apto) {
                    ins.add('rose', '!', 'Con <b>' + NOMBRE[R.tipo].toLowerCase() + '</b> el error fuera de muestra es de <b>' +
                        k.pct(R.mape, 1) + '</b>, sobre el umbral de ' + UMBRAL + '%. El modelo no reproduce el pico de fin de año, ' +
                        'y eso se ve en la gráfica de validación antes de que el número llegue a nadie.');
                } else {
                    ins.add('green', '✓', 'El modelo erró <b>' + k.pct(R.mape, 1) + '</b> en promedio sobre ' + NVA +
                        ' meses que nunca vio. Debajo del umbral de ' + UMBRAL + '%: se publica, y se publica con el error a la vista.');
                }
                if (R.H > 1) {
                    ins.add('cyan', '≈', 'La incertidumbre crece con la distancia: <b>±' + k.pct(R.anchoUno, 1) + '</b> en ' +
                        R.fil[0].mes + ' y <b>±' + k.pct(R.anchoFin, 1) + '</b> en ' + R.fil[R.H - 1].mes +
                        '. El ancho sale del error de validación llevado a desviación, por z = ' + k.fmt(R.z, 2) +
                        ' del nivel de confianza y por la raíz de los pasos adelante.');
                } else {
                    ins.add('cyan', '≈', 'A un mes de distancia el intervalo es de <b>±' + k.pct(R.anchoUno, 1) +
                        '</b>. Suba el horizonte y verá cómo se abre: crece con la raíz de los pasos adelante, no de golpe.');
                }
                ins.add('violet', '↑', 'Mayor demanda proyectada en <b>' + R.pico.mes + '</b>: ' + k.fmt(R.pico.c, 0) +
                    ' unidades, entre ' + k.fmt(R.pico.lo, 0) + ' y ' + k.fmt(R.pico.hi, 0) +
                    '. La compra se planea contra el rango, no contra el punto.');
                if (Math.abs(R.mpe) >= 3) {
                    ins.add('amber', '%', 'El error no está centrado: el modelo ' + (R.mpe > 0 ? 'sobreestimó' : 'subestimó') +
                        ' <b>' + k.pct(Math.abs(R.mpe), 1) + '</b> en promedio durante la validación. Un sesgo así se corrige antes de comprar contra el número.');
                }
                if (R.esc !== 'base') {
                    ins.add('teal', '=', 'El escenario ' + ESCENARIO[R.esc] + ' mueve centro y banda en bloque. No cambia el error ' +
                        'del modelo: es un supuesto de negocio encima del pronóstico, y así se reporta.');
                }
            }

            /* ---------- ejecución animada de la validación ---------- */
            var corriendo = false;
            async function correr() {
                if (corriendo) return;
                corriendo = true;
                ctl.busy('run', true);
                var R = calcular(), m = marcas(R), i;
                pasos.reset();
                for (i = 0; i < pasos.count; i++) {
                    pasos.set(i, 'run', '…');
                    await k.wait(240);
                    pasos.set(i, m[i][0], m[i][1]);
                    /* el error fuera de muestra corta la secuencia: lo que sigue
                       se marca detenido sin seguir esperando */
                    if (!R.apto && i === 3) { pasos.set(4, m[4][0], m[4][1]); pasos.set(5, m[5][0], m[5][1]); break; }
                }
                corriendo = false;
                ctl.busy('run', false);
                /* el visitante pudo mover un control durante la animación: se
                   repinta con el estado actual, no con el del arranque */
                var F = calcular();
                estados(F); pintar(F);
            }

            ctl.on(function () {
                var R = calcular();
                if (!corriendo) estados(R);   /* no pisar la secuencia en vuelo */
                pintar(R);
            });
            ctl.onClick('run', correr);

            var inicial = calcular();
            estados(inicial);
            pintar(inicial);
        }
    });
})();
