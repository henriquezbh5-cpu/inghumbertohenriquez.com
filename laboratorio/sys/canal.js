(function () {
    'use strict';
    var LAB = window.LAB;

    var MESES = ['Sep 25', 'Oct 25', 'Nov 25', 'Dic 25', 'Ene 26', 'Feb 26', 'Mar 26', 'Abr 26', 'May 26', 'Jun 26', 'Jul 26', 'Ago 26'];
    var PAISES = ['El Salvador', 'Guatemala', 'Costa Rica', 'República Dominicana'];
    var LINEAS = ['Automatización', 'Licenciamiento', 'Consultoría', 'Soporte'];
    var CANALES = ['Directo', 'Socio', 'Portal', 'Licitación'];
    var AREAS = ['Operaciones', 'Finanzas', 'Comercial', 'Servicio', 'Talento'];
    var PROCESOS = ['Conciliación bancaria', 'Carga de pedidos', 'Alta de clientes', 'Cierre mensual',
        'Cotización de servicios', 'Depuración de catálogo', 'Aviso de cobro', 'Reporte de servicio'];

    /* cada sugerencia entra por una intención distinta; la última no está cubierta a propósito */
    var SUG = [
        '¿Cuánto facturamos por país?',
        '¿Qué línea factura más?',
        '¿Cuál es la facturación total y su tendencia?',
        '¿Cuánto se está pagando fuera de plazo?',
        '¿Cuántas ejecuciones fallaron y en qué área?',
        '¿Cuántas horas ahorró la flota?',
        'Compará El Salvador contra Guatemala',
        '¿Cuántos empleados tiene Operaciones?'
    ];

    /* elección ponderada con el generador sembrado */
    function wpick(r, arr, pesos) {
        var t = 0, i, x;
        for (i = 0; i < pesos.length; i++) t += pesos[i];
        x = r() * t;
        for (i = 0; i < arr.length; i++) { x -= pesos[i]; if (x <= 0) return arr[i]; }
        return arr[arr.length - 1];
    }

    /* Dos tablas sintéticas con semilla fija: 280 filas de facturación y 260 de
       bitácora de la flota. Empresas, montos y áreas son inventados. */
    function datos() {
        var r = LAB.kit.rng(77015), i, fac = [], flo = [], m, pais, linea, canal, area, est, ej;
        var base = { 'Automatización': 9200, 'Licenciamiento': 4300, 'Consultoría': 6400, 'Soporte': 2050 };
        var fp = { 'El Salvador': 1, 'Guatemala': 1.14, 'Costa Rica': 0.92, 'República Dominicana': 0.81 };
        var wfall = { 'Operaciones': 12, 'Finanzas': 5, 'Comercial': 8, 'Servicio': 6, 'Talento': 4 };

        for (i = 0; i < 280; i++) {
            m = Math.floor(r() * 12);
            pais = wpick(r, PAISES, [34, 27, 22, 17]);
            linea = wpick(r, LINEAS, [31, 24, 26, 19]);
            canal = wpick(r, CANALES, [38, 26, 22, 14]);
            fac.push({
                mes: m,
                fecha: LAB.kit.pad(1 + Math.floor(r() * 28)) + ' ' + MESES[m],
                pais: pais, linea: linea, canal: canal,
                monto: Math.round(base[linea] * fp[pais] * (0.42 + r() * 1.75)),
                dias: Math.round(20 + r() * 36 + (canal === 'Licitación' ? 19 : 0) + (pais === 'República Dominicana' ? 11 : 0))
            });
        }
        for (i = 0; i < 260; i++) {
            m = Math.floor(r() * 12);
            area = wpick(r, AREAS, [30, 24, 19, 16, 11]);
            est = wpick(r, ['Correcta', 'Con reintento', 'Fallida'], [100 - wfall[area] - 9, 9, wfall[area]]);
            ej = 6 + Math.round(r() * 84);
            flo.push({
                mes: m,
                fecha: LAB.kit.pad(1 + Math.floor(r() * 28)) + ' ' + MESES[m],
                area: area, proceso: LAB.kit.pick(r, PROCESOS), ejec: ej, estado: est,
                min: est === 'Fallida' ? 0 : Math.round(ej * (2.4 + r() * 10.5) * (est === 'Con reintento' ? 0.7 : 1))
            });
        }
        return { fac: fac, flo: flo };
    }

    /* normalización sin acentos para leer la pregunta escrita a mano */
    var ACENTOS = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' };
    function norm(s) {
        s = String(s == null ? '' : s).toLowerCase();
        var o = '', i, c;
        for (i = 0; i < s.length; i++) { c = s.charAt(i); o += (ACENTOS[c] || c); }
        return o;
    }
    function tiene(q, arr) {
        for (var i = 0; i < arr.length; i++) { if (q.indexOf(arr[i]) >= 0) return true; }
        return false;
    }
    function paisesEn(q) {
        var out = [];
        if (q.indexOf('salvador') >= 0) out.push('El Salvador');
        if (q.indexOf('guatemala') >= 0) out.push('Guatemala');
        if (q.indexOf('costa rica') >= 0 || q.indexOf('costarric') >= 0) out.push('Costa Rica');
        if (q.indexOf('dominican') >= 0) out.push('República Dominicana');
        return out;
    }
    function plural(n, s, p) { return n + ' ' + (n === 1 ? s : p); }
    function lista(arr) { return "('" + arr.join("','") + "')"; }

    LAB.register({
        id: 'canal',
        name: 'CANAL',
        family: 'agentes',
        tagline: 'Agente sobre datos',
        title: 'Agente que consulta las tablas y cita la fuente',
        intro: 'Este agente no responde de memoria: traduce la pregunta a una consulta sobre dos tablas, le inyecta el permiso del usuario antes de agregar y dice cuántos registros leyó. Cambia el usuario que pregunta y mira cómo la misma pregunta cambia de alcance. Prueba también una pregunta que no cubre.',
        spec: {
            trigger: 'Una pregunta escrita en lenguaje natural desde el chat corporativo o el portal interno. No hay horario ni formulario: el agente responde cuando alguien pregunta.',
            systems: 'Modelo de lenguaje que interpreta la pregunta, una capa de consulta parametrizada sobre el almacén de datos y el control de permisos del usuario, que se aplica antes de agregar y no después de calcular.',
            output: 'Una respuesta calculada sobre las tablas conectadas: la cifra, el desglose que la sostiene y la fuente citada con tabla, filas leídas y el usuario bajo el que se calculó.',
            failure: 'Si la pregunta no se puede responder con los datos conectados, lo declara y enumera lo que sí cubre. Si el dato existe pero está fuera del alcance del usuario, lo dice sin mostrar la cifra. Nunca completa con una estimación.'
        },
        impact: [
            ['1 fuente', 'el agente consulta, no responde de memoria'],
            ['24/7', 'en chat corporativo y portal interno'],
            ['Cita', 'cada respuesta indica de dónde salió']
        ],

        render: function (host, k) {
            var D = datos();
            var ROLES = [
                { v: 'dir', t: 'Dirección regional', paises: PAISES, lineas: LINEAS, areas: AREAS },
                { v: 'sv', t: 'Gerencia El Salvador', paises: ['El Salvador'], lineas: LINEAS, areas: AREAS },
                { v: 'gtcr', t: 'Gerencia Guatemala y Costa Rica', paises: ['Guatemala', 'Costa Rica'], lineas: LINEAS, areas: AREAS },
                { v: 'auto', t: 'Analista de línea Automatización', paises: PAISES, lineas: ['Automatización'], areas: ['Operaciones', 'Finanzas'] }
            ];
            var S = { rol: ROLES[0], meses: 12, dias: 45, hechas: 0, leidos: 0, sinCifra: 0, ultima: null, nodo: null, corriendo: false };

            var ctl = k.controls([
                { k: 'rol', t: 'select', label: 'Usuario que pregunta', value: 'dir', options: ROLES.map(function (x) { return { v: x.v, t: x.t }; }) },
                {
                    k: 'per', t: 'select', label: 'Ventana de datos', value: '12',
                    options: [{ v: '12', t: 'Últimos 12 meses' }, { v: '6', t: 'Últimos 6 meses' }, { v: '3', t: 'Último trimestre' }]
                },
                { k: 'dias', t: 'range', label: 'Plazo de pago acordado', min: 30, max: 75, step: 5, value: 45, suffix: 'días' }
            ]);
            host.appendChild(ctl.node);

            var kp = k.kpis([
                ['Preguntas respondidas', '0'],
                ['Filas al alcance del usuario', '—'],
                ['Filas leídas en consultas', '0', 'up'],
                ['Preguntas sin cifra', '0', '']
            ]);
            host.appendChild(kp.node);

            var grid = k.el('div', 'grid2 wide-left');
            host.appendChild(grid);

            /* ---------- izquierda: el canal de consulta ---------- */
            var pnChat = k.panel();
            pnChat.appendChild(k.txt('div', 'mono-head', 'Canal de consulta'));
            var chat = k.el('div', 'chat');
            chat.style.marginTop = '12px';
            pnChat.appendChild(chat);

            var qs = k.el('div', 'qs');
            SUG.forEach(function (s) {
                var b = k.txt('button', null, s);
                b.type = 'button';
                b.addEventListener('click', function () { preguntar(s); });
                qs.appendChild(b);
            });
            pnChat.appendChild(qs);

            var comp = k.el('div', 'ctl');
            comp.style.marginTop = '14px';
            var campo = k.el('div', 'field grow');
            campo.appendChild(k.txt('span', null, 'Tu pregunta'));
            var input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Escribe una pregunta sobre las tablas conectadas';
            input.setAttribute('aria-label', 'Escribe una pregunta sobre las tablas conectadas');
            campo.appendChild(input);
            comp.appendChild(campo);
            var btn = k.txt('button', 'btn primary', 'Preguntar');
            btn.type = 'button';
            comp.appendChild(btn);
            pnChat.appendChild(comp);
            grid.appendChild(pnChat);

            /* ---------- derecha: fuentes y plan de consulta ---------- */
            var der = k.el('div', 'stack');
            var pnF = k.panel();
            pnF.appendChild(k.txt('div', 'mono-head', 'Fuentes conectadas'));
            var FUENTES = [
                { n: 'facturacion_regional', c: 'fecha · país · línea · canal · monto · días de pago' },
                { n: 'bitacora_flota', c: 'fecha · área · proceso · ejecuciones · minutos · estado' }
            ];
            var conteo = [], recorte = [];
            FUENTES.forEach(function (f, i) {
                var fila = k.el('div');
                fila.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:' + (i ? '14px' : '12px');
                var nom = k.txt('span', 'mono', f.n);
                nom.style.cssText = 'font-size:12.5px;color:' + k.C.ink;
                fila.appendChild(nom);
                fila.appendChild(k.el('span', null, k.pill('ok', 'Conectada')));
                pnF.appendChild(fila);
                var det = k.txt('div', 'mono', '—');
                det.style.cssText = 'margin-top:5px;font-size:11px;color:' + k.C.teal;
                pnF.appendChild(det);
                conteo.push(det);
                var rec = k.txt('div', 'mono', '—');
                rec.style.cssText = 'margin-top:3px;font-size:10.5px;color:' + k.C.amber;
                pnF.appendChild(rec);
                recorte.push(rec);
                var cam = k.txt('div', 'mono', f.c);
                cam.style.cssText = 'margin-top:3px;font-size:10.5px;line-height:1.6;color:' + k.C.label;
                pnF.appendChild(cam);
            });
            der.appendChild(pnF);

            var pnL = k.panel();
            pnL.appendChild(k.txt('div', 'mono-head', 'Plan de consulta'));
            var log = k.log('190px');
            log.node.style.marginTop = '12px';
            pnL.appendChild(log.node);
            der.appendChild(pnL);
            grid.appendChild(der);

            /* ---------- abajo: la misma tabla, vista como serie ---------- */
            var g2 = k.el('div', 'grid2');
            g2.style.marginTop = '18px';
            var cb = k.chartbox('Facturación mensual dentro del alcance', 'La misma tabla que consulta el agente', '224px');
            g2.appendChild(cb.node);

            var pnE = k.panel();
            var evTit = k.txt('div', 'mono-head', 'Evidencia de la última respuesta');
            pnE.appendChild(evTit);
            var ev = k.bars();
            ev.node.style.marginTop = '14px';
            pnE.appendChild(ev.node);
            var evPie = k.txt('div', null, '');
            evPie.style.cssText = 'margin-top:12px;font-size:11.5px;line-height:1.6;color:' + k.C.label;
            pnE.appendChild(evPie);
            g2.appendChild(pnE);
            host.appendChild(g2);

            var ch = k.chart(cb.canvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        { label: 'Pago en plazo', data: [], backgroundColor: k.C.teal, borderRadius: 4, maxBarThickness: 22 },
                        { label: 'Pago fuera de plazo', data: [], backgroundColor: k.C.amber, borderRadius: 4, maxBarThickness: 22 }
                    ]
                },
                options: {
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        tooltip: { callbacks: { label: function (c) { return c.dataset.label + ': ' + k.money(c.parsed.y); } } }
                    },
                    scales: {
                        x: Object.assign({ stacked: true }, k.AXIS_BARE),
                        y: Object.assign({ stacked: true }, k.AXIS, { ticks: { padding: 8, callback: function (v) { return '$' + k.fmt(v / 1000, 0) + 'k'; } } })
                    }
                }
            });

            /* ---------- alcance y agregaciones ---------- */
            function alcance() {
                var d = 12 - S.meses, R = S.rol;
                return {
                    desde: d,
                    fac: D.fac.filter(function (x) { return x.mes >= d && R.paises.indexOf(x.pais) >= 0 && R.lineas.indexOf(x.linea) >= 0; }),
                    flo: D.flo.filter(function (x) { return x.mes >= d && R.areas.indexOf(x.area) >= 0; })
                };
            }
            function suma(a, campo) {
                var t = 0, i;
                for (i = 0; i < a.length; i++) t += a[i][campo];
                return t;
            }
            function grupo(a, llave, campo) {
                var m = {}, out = [], i, key;
                for (i = 0; i < a.length; i++) {
                    key = a[i][llave];
                    if (!m[key]) { m[key] = { k: key, v: 0, n: 0 }; out.push(m[key]); }
                    m[key].v += a[i][campo];
                    m[key].n++;
                }
                out.sort(function (p, q) { return q.v - p.v; });
                return out;
            }
            var horasTxt = function (min) { return k.fmt(min / 60, 0) + ' h'; };
            var ejecTxt = function (v) { return k.fmt(v, 0) + ' ejec'; };
            var diasTxt = function (v) { return k.fmt(v, 0) + ' días'; };

            /* barras de apoyo: cuatro categorías y el quinto en adelante como Resto */
            function evidencia(titulo, items, f, plano) {
                evTit.textContent = titulo;
                ev.clear();
                var vis, i, max = 0, resto = 0;
                if (plano) {
                    vis = items.slice(0);
                } else {
                    vis = items.slice(0, 4);
                    for (i = 4; i < items.length; i++) resto += items[i].v;
                    if (items.length > 4) vis.push({ k: 'Resto', v: resto, r: true });
                }
                for (i = 0; i < vis.length; i++) { if (vis[i].v > max) max = vis[i].v; }
                vis.forEach(function (x, j) {
                    ev.add(x.k, x.v, max, plano ? k.C.teal : (x.r ? k.C.blue : k.CAT[j % 4]), f(x.v));
                });
            }

            /* predicado que el permiso del rol inyecta en la consulta */
            function permisoFac() {
                var p = [];
                if (S.rol.paises.length < PAISES.length) p.push('pais IN ' + lista(S.rol.paises));
                if (S.rol.lineas.length < LINEAS.length) p.push('linea IN ' + lista(S.rol.lineas));
                return p.length ? p.join(' AND ') : null;
            }
            function permisoFlo() {
                return S.rol.areas.length < AREAS.length ? 'area IN ' + lista(S.rol.areas) : null;
            }
            /* el plan siempre expone la consulta, el permiso y el cierre con filas leídas */
            function plan(intencion, tabla, sql, cierre, tono) {
                var P = tabla === 'fac' ? permisoFac() : permisoFlo();
                return [
                    ['hl', 'intención: ' + intencion],
                    ['', sql],
                    P ? ['wa', 'permiso inyectado antes de agregar · ' + P]
                      : ['in', 'permiso del rol · sin recorte sobre esta tabla'],
                    [tono || 'ok', cierre]
                ];
            }
            /* la cita lleva tabla, filas leídas y el usuario bajo el que se calculó */
            function fuenteFac(A) {
                return 'facturacion_regional · ' + A.fac.length + ' de ' + D.fac.length + ' filas leídas · ' +
                    S.rol.t + ' · ' + plural(S.rol.paises.length, 'país', 'países') + ' / ' +
                    plural(S.rol.lineas.length, 'línea', 'líneas') + ' / ' + S.meses + ' meses';
            }
            function fuenteFlo(A) {
                return 'bitacora_flota · ' + A.flo.length + ' de ' + D.flo.length + ' filas leídas · ' +
                    S.rol.t + ' · ' + plural(S.rol.areas.length, 'área', 'áreas') + ' / ' + S.meses + ' meses';
            }
            /* recorte por país que pidió la pregunta, no el permiso */
            function porPais(fac, ps) {
                if (!ps || !ps.length) return fac;
                return fac.filter(function (x) { return ps.indexOf(x.pais) >= 0; });
            }
            function ventana(A) { return "mes >= '" + MESES[A.desde] + "'"; }
            function sqlPais(ps) { return ps && ps.length ? ' AND pais IN ' + lista(ps) : ''; }
            function notaFlota(ps) {
                return ps && ps.length ? ['bitacora_flota no tiene columna país: la respuesta va por área, no por país.'] : null;
            }

            /* ---------- respuestas: cada una calcula sobre los arreglos ---------- */
            function rPais(A) {
                var g = grupo(A.fac, 'pais', 'monto'), tot = suma(A.fac, 'monto'), lider = g[0], seg = g[1];
                /* una brecha de decimas no sostiene un lider: se declara el empate */
                var brecha = (lider && seg && lider.v) ? (lider.v - seg.v) / lider.v * 100 : 100;
                return {
                    t: !lider ? 'No hay filas de facturación en tu alcance.'
                        : !seg ? lider.k + ' es el único país en tu alcance: ' + k.money(lider.v) + ' facturados en la ventana.'
                        : brecha < 2 ? lider.k + ' y ' + seg.k + ' van técnicamente empatados: ' + k.money(lider.v) + ' contra ' + k.money(seg.v) + ', ' + k.pct(brecha, 1) + ' de diferencia sobre ' + k.money(tot) + ' facturados.'
                        : lider.k + ' encabeza con ' + k.money(lider.v) + ' de ' + k.money(tot) + ' facturados en la ventana, ' + k.pct(brecha, 1) + ' sobre ' + seg.k + '.',
                    filas: g.map(function (x) { return [x.k, k.money(x.v) + ' · ' + k.pct(tot ? x.v / tot * 100 : 0, 1)]; }),
                    pie: 'Suma de monto agrupada por país, solo sobre las filas que el permiso dejó entrar.',
                    plan: plan('facturacion_por_pais', 'fac',
                        'SELECT pais, SUM(monto) FROM facturacion_regional WHERE ' + ventana(A) + ' GROUP BY pais ORDER BY 2 DESC',
                        A.fac.length + ' filas leídas · ' + plural(g.length, 'grupo', 'grupos')),
                    ev: { t: 'Facturación por país', items: g, f: k.money },
                    src: fuenteFac(A), leidos: A.fac.length
                };
            }
            function rLinea(A, ps) {
                var f = porPais(A.fac, ps), g = grupo(f, 'linea', 'monto'), tot = suma(f, 'monto'), lider = g[0];
                return {
                    t: lider ? lider.k + ' es la línea que más factura: ' + k.money(lider.v) + ' en ' + plural(lider.n, 'documento', 'documentos') + '.' : 'No hay filas de facturación en tu alcance.',
                    filas: g.map(function (x) { return [x.k, k.money(x.v) + ' · ticket ' + k.money(x.v / x.n)]; }),
                    pie: 'El ticket es monto sobre número de documentos de esa línea, no un promedio de promedios.',
                    plan: plan('ranking_de_lineas', 'fac',
                        'SELECT linea, SUM(monto), COUNT(*) FROM facturacion_regional WHERE ' + ventana(A) + sqlPais(ps) + ' GROUP BY linea ORDER BY 2 DESC',
                        f.length + ' filas leídas · ' + plural(g.length, 'línea', 'líneas')),
                    ev: { t: 'Facturación por línea', items: g, f: k.money },
                    src: fuenteFac(A), leidos: f.length
                };
            }
            function rFallas(A, ps) {
                var fall = A.flo.filter(function (x) { return x.estado === 'Fallida'; });
                var rein = A.flo.filter(function (x) { return x.estado === 'Con reintento'; });
                var tot = suma(A.flo, 'ejec'), ejf = suma(fall, 'ejec');
                var g = grupo(fall, 'area', 'ejec'), peor = g[0];
                var filas = g.map(function (x) { return [x.k, ejecTxt(x.v) + ' · ' + plural(x.n, 'lote', 'lotes')]; });
                filas.push(['Lotes que salieron con reintento', k.fmt(rein.length, 0)]);
                return {
                    t: k.fmt(ejf, 0) + ' de ' + k.fmt(tot, 0) + ' ejecuciones cayeron en lotes fallidos (' + k.pct(tot ? ejf / tot * 100 : 0, 1) + ')' + (peor ? '. El área más golpeada es ' + peor.k + '.' : '.'),
                    filas: filas, lista: notaFlota(ps),
                    pie: 'Un lote fallido no ahorra minutos: entra al total de ejecuciones pero aporta cero al tiempo liberado.',
                    plan: plan('ejecuciones_fallidas', 'flo',
                        "SELECT area, SUM(ejecuciones) FROM bitacora_flota WHERE " + ventana(A) + " AND estado = 'Fallida' GROUP BY area",
                        plural(fall.length, 'lote fallido', 'lotes fallidos') + ' sobre ' + A.flo.length + ' filas leídas', 'wa'),
                    ev: { t: 'Ejecuciones fallidas por área', items: g, f: ejecTxt },
                    src: fuenteFlo(A), leidos: A.flo.length
                };
            }
            function rHoras(A, ps) {
                var min = suma(A.flo, 'min'), g = grupo(A.flo, 'area', 'min'), top = g[0];
                var filas = g.map(function (x) { return [x.k, horasTxt(x.v) + ' · ' + k.pct(min ? x.v / min * 100 : 0, 1)]; });
                filas.push(['Ejecuciones en la ventana', ejecTxt(suma(A.flo, 'ejec'))]);
                return {
                    t: 'La flota liberó ' + horasTxt(min) + ' de trabajo' + (top ? ', y ' + top.k + ' aporta ' + horasTxt(top.v) + '.' : '.'),
                    filas: filas, lista: notaFlota(ps),
                    pie: 'Minutos registrados por la flota, no una proyección: los lotes fallidos cuentan cero.',
                    plan: plan('horas_ahorradas', 'flo',
                        'SELECT area, SUM(minutos) FROM bitacora_flota WHERE ' + ventana(A) + ' GROUP BY area ORDER BY 2 DESC',
                        A.flo.length + ' filas leídas · ' + plural(g.length, 'área', 'áreas')),
                    ev: { t: 'Horas liberadas por área', items: g, f: horasTxt },
                    src: fuenteFlo(A), leidos: A.flo.length
                };
            }
            function rCartera(A, ps) {
                var f = porPais(A.fac, ps);
                var v = f.filter(function (x) { return x.dias > S.dias; });
                var m = suma(v, 'monto'), tot = suma(f, 'monto'), g = grupo(v, 'pais', 'monto');
                var prom = v.length ? suma(v, 'dias') / v.length : 0;
                var filas = g.map(function (x) { return [x.k, k.money(x.v) + ' · ' + plural(x.n, 'documento', 'documentos')]; });
                filas.push(['Días promedio de ese grupo', diasTxt(prom)]);
                return {
                    t: k.money(m) + ' pasan de ' + S.dias + ' días de pago: ' + k.pct(tot ? m / tot * 100 : 0, 1) + ' de lo facturado en la ventana.',
                    filas: filas,
                    pie: 'El plazo acordado es un parámetro del control, no un número escrito en el texto: movelo y la consulta se vuelve a correr.',
                    plan: plan('cartera_fuera_de_plazo', 'fac',
                        'SELECT pais, SUM(monto), AVG(dias) FROM facturacion_regional WHERE ' + ventana(A) + ' AND dias > ' + S.dias + sqlPais(ps) + ' GROUP BY pais',
                        plural(v.length, 'documento', 'documentos') + ' sobre el plazo · ' + f.length + ' filas leídas', v.length ? 'wa' : 'ok'),
                    ev: { t: 'Facturación fuera de plazo', items: g, f: k.money },
                    src: fuenteFac(A), leidos: f.length
                };
            }
            function rTotal(A, ps) {
                var f = porPais(A.fac, ps), tot = suma(f, 'monto'), i, serie = [], sub;
                for (i = A.desde; i < 12; i++) {
                    sub = f.filter(function (x) { return x.mes === i; });
                    serie.push({ k: MESES[i], v: suma(sub, 'monto') });
                }
                var ult = serie.length ? serie[serie.length - 1].v : 0;
                var pen = serie.length > 1 ? serie[serie.length - 2].v : 0;
                var dif = pen ? (ult - pen) / pen * 100 : 0;
                return {
                    t: 'Facturación total en la ventana: ' + k.money(tot) + ' sobre ' + plural(f.length, 'documento', 'documentos') + '.',
                    filas: [
                        ['Promedio mensual', k.money(tot / Math.max(1, serie.length))],
                        ['Último mes (' + (serie.length ? serie[serie.length - 1].k : '—') + ')', k.money(ult)],
                        ['Variación contra el mes anterior', (dif >= 0 ? '+' : '') + k.pct(dif, 1)],
                        ['Documentos leídos', k.fmt(f.length, 0)]
                    ],
                    pie: 'La serie mensual de la gráfica sale de esta misma consulta, con el mismo filtro de permisos.',
                    plan: plan('facturacion_total', 'fac',
                        'SELECT mes, SUM(monto) FROM facturacion_regional WHERE ' + ventana(A) + sqlPais(ps) + ' GROUP BY mes ORDER BY 1',
                        f.length + ' filas leídas · ' + plural(serie.length, 'mes', 'meses')),
                    ev: { t: 'Facturación de los últimos meses', items: serie.slice(-6), f: k.money, plano: true },
                    src: fuenteFac(A), leidos: f.length
                };
            }
            function rComparar(A, ls) {
                var tot = suma(A.fac, 'monto'), filas = [], resumen = [];
                ls.forEach(function (p) {
                    var f = A.fac.filter(function (x) { return x.pais === p; });
                    var mnt = suma(f, 'monto'), gl = grupo(f, 'linea', 'monto');
                    resumen.push({ k: p, v: mnt });
                    filas.push([p + ' · facturación', k.money(mnt) + ' · ' + k.pct(tot ? mnt / tot * 100 : 0, 1)]);
                    filas.push([p + ' · días promedio de pago', f.length ? diasTxt(suma(f, 'dias') / f.length) : '—']);
                    filas.push([p + ' · línea principal', gl.length ? gl[0].k : '—']);
                });
                var t;
                if (ls.length > 1) {
                    var a = resumen[0], b = resumen[1];
                    var alto = a.v >= b.v ? a : b, bajo = a.v >= b.v ? b : a;
                    t = alto.k + ' factura ' + k.pct(bajo.v ? (alto.v - bajo.v) / bajo.v * 100 : 0, 1) + ' más que ' + bajo.k + ' en la ventana seleccionada.';
                } else {
                    t = resumen[0].k + ' facturó ' + k.money(resumen[0].v) + ', el ' + k.pct(tot ? resumen[0].v / tot * 100 : 0, 1) + ' de lo visible para este usuario.';
                }
                return {
                    t: t, filas: filas,
                    pie: 'Comparación calculada sobre el mismo corte: misma ventana de meses y mismo permiso para ambos.',
                    plan: plan('comparar_paises · ' + ls.join(' vs '), 'fac',
                        'SELECT pais, SUM(monto), AVG(dias) FROM facturacion_regional WHERE ' + ventana(A) + ' AND pais IN ' + lista(ls) + ' GROUP BY pais',
                        A.fac.length + ' filas leídas en el alcance'),
                    ev: { t: 'Comparación por país', items: resumen, f: k.money },
                    src: fuenteFac(A), leidos: A.fac.length
                };
            }
            function rDenegado(fuera) {
                return {
                    t: 'No puedo mostrar eso: ' + fuera.join(' y ') + ' queda fuera del alcance de este usuario.',
                    filas: [['Países habilitados para tu rol', S.rol.paises.join(' · ')]],
                    lista: ['El permiso se aplica antes de agregar, así que esas filas nunca entran al cálculo.'],
                    pie: 'Bloquear al final es peor: el total ya llevaría dentro la cifra que no debía verse.',
                    plan: [['er', 'permiso denegado · ' + fuera.join(', ')],
                        ['', 'filtro del rol: pais IN ' + lista(S.rol.paises)],
                        ['wa', '0 filas leídas · ninguna consulta ejecutada']],
                    ev: null, src: 'consulta bloqueada por permisos · 0 filas leídas · ' + S.rol.t,
                    leidos: 0, fuera: true
                };
            }
            function rSinCobertura() {
                return {
                    t: 'No puedo responder eso con los datos conectados, y no lo voy a estimar.',
                    lista: [
                        'Facturación por país y facturación total con su tendencia mensual',
                        'Ranking de líneas y ticket promedio por línea',
                        'Comparación entre dos países',
                        'Facturación con pago fuera del plazo acordado',
                        'Ejecuciones fallidas y el área más afectada',
                        'Horas liberadas por la flota y el área que más aporta'
                    ],
                    pie: 'Planilla, inventario y contratos no están conectados a este agente. Lo que amplía la respuesta es conectar la tabla, no escribir un mejor texto.',
                    plan: [['wa', 'sin cobertura: la pregunta no mapea a ninguna consulta registrada'],
                        ['', 'tablas conectadas: facturacion_regional, bitacora_flota'],
                        ['wa', '0 filas leídas · ninguna consulta ejecutada']],
                    ev: null, src: 'ninguna consulta ejecutada · 0 filas leídas · ' + S.rol.t,
                    leidos: 0, fuera: true
                };
            }

            /* ---------- enrutado de la pregunta ---------- */
            function resolver(texto) {
                var q = norm(texto), A = alcance(), ps = paisesEn(q);
                var fuera = ps.filter(function (p) { return S.rol.paises.indexOf(p) < 0; });
                if (fuera.length) return rDenegado(fuera);

                if (tiene(q, ['fall', 'error', 'reintent', 'no corrio'])) return rFallas(A, ps);
                if (tiene(q, ['horas', 'ahorr', 'minuto', 'libera'])) return rHoras(A, ps);
                if (tiene(q, ['cartera', 'mora', 'vencid', 'cobr', 'paga', 'plazo', '45'])) return rCartera(A, ps);
                if (ps.length > 1 || (ps.length && tiene(q, ['compar', 'contra', 'versus', 'vs ']))) return rComparar(A, ps.slice(0, 2));

                var fact = tiene(q, ['factur', 'venta', 'vendi', 'ingres', 'monto']);
                if (tiene(q, ['linea', 'producto'])) return rLinea(A, ps);
                if (ps.length === 1) return rComparar(A, ps);
                if (tiene(q, ['pais', 'region', 'geograf'])) return rPais(A);
                if (fact) return rTotal(A, ps);
                return rSinCobertura();
            }

            /* ---------- pintado ---------- */
            function burbuja(a) {
                var m = k.el('div', 'msg a');
                var t = k.txt('div', null, a.t);
                t.style.color = k.C.ink;
                m.appendChild(t);
                (a.filas || []).forEach(function (f) {
                    var row = k.el('div');
                    row.style.cssText = 'display:flex;justify-content:space-between;gap:16px;margin-top:6px;font-size:13px';
                    row.appendChild(k.txt('span', null, f[0]));
                    var v = k.txt('span', 'mono', f[1]);
                    v.style.color = a.fuera ? k.C.amber : k.C.teal;
                    row.appendChild(v);
                    m.appendChild(row);
                });
                (a.lista || []).forEach(function (s) {
                    var d = k.txt('div', null, '— ' + s);
                    d.style.cssText = 'margin-top:5px;font-size:13px;color:' + k.C.body;
                    m.appendChild(d);
                });
                m.appendChild(k.txt('span', 'src', a.src));
                return m;
            }
            function aplicar(a, recalculo) {
                (a.plan || []).forEach(function (p) { log.push(p[0], p[1]); });
                if (a.ev) evidencia(a.ev.t, a.ev.items, a.ev.f, a.ev.plano);
                else { evTit.textContent = 'Evidencia de la última respuesta'; ev.clear(); }
                evPie.textContent = a.pie || '';
                S.leidos += a.leidos;
                if (!recalculo) { S.hechas++; if (a.fuera) S.sinCifra++; }
                else if (a.fuera) log.push('wa', 'la última respuesta quedó sin cifra con este usuario');
                kp.set(0, k.fmt(S.hechas, 0));
                kp.set(2, k.fmt(S.leidos, 0), 'up');
                kp.set(3, k.fmt(S.sinCifra, 0), S.sinCifra ? 'warn' : '');
            }
            function pinta() {
                var A = alcance(), i, labels = [], dentro = [], afuera = [], sub;
                conteo[0].textContent = A.fac.length + ' de ' + D.fac.length + ' filas al alcance';
                conteo[1].textContent = A.flo.length + ' de ' + D.flo.length + ' filas al alcance';
                recorte[0].textContent = permisoFac() ? 'recorte del permiso · ' + permisoFac() : 'sin recorte del permiso';
                recorte[1].textContent = permisoFlo() ? 'recorte del permiso · ' + permisoFlo() : 'sin recorte del permiso';
                kp.set(1, k.fmt(A.fac.length + A.flo.length, 0) + ' de ' + k.fmt(D.fac.length + D.flo.length, 0));
                for (i = A.desde; i < 12; i++) {
                    sub = A.fac.filter(function (x) { return x.mes === i; });
                    labels.push(MESES[i]);
                    dentro.push(suma(sub.filter(function (x) { return x.dias <= S.dias; }), 'monto'));
                    afuera.push(suma(sub.filter(function (x) { return x.dias > S.dias; }), 'monto'));
                }
                if (ch) {
                    ch.data.labels = labels;
                    ch.data.datasets[0].label = 'Pago hasta ' + S.dias + ' días';
                    ch.data.datasets[0].data = dentro;
                    ch.data.datasets[1].label = 'Pago sobre ' + S.dias + ' días';
                    ch.data.datasets[1].data = afuera;
                    ch.update();
                }
                cb.cap(S.rol.t + ' · ' + plural(labels.length, 'mes', 'meses') + ' · ' +
                    plural(A.fac.length, 'documento visible', 'documentos visibles') + ' · plazo ' + S.dias + ' días');
            }

            async function preguntar(texto) {
                texto = String(texto == null ? '' : texto).trim();
                if (!texto || S.corriendo) return;
                S.corriendo = true;
                btn.disabled = true;
                input.value = '';
                chat.appendChild(k.txt('div', 'msg u', texto));
                var esperando = k.txt('div', 'msg a', 'Consultando la fuente…');
                chat.appendChild(esperando);
                chat.scrollTop = chat.scrollHeight;
                log.push('in', 'pregunta recibida · ' + plural(texto.length, 'carácter', 'caracteres'));
                /* jitter cosmético sobre una latencia simulada */
                await k.wait(420 + Math.round(Math.random() * 180));
                if (esperando.parentNode === chat) chat.removeChild(esperando);
                var a = resolver(texto), nodo = burbuja(a);
                chat.appendChild(nodo);
                chat.scrollTop = chat.scrollHeight;
                aplicar(a, false);
                S.ultima = texto;
                S.nodo = nodo;
                S.corriendo = false;
                btn.disabled = false;
            }

            btn.addEventListener('click', function () { preguntar(input.value); });
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); preguntar(input.value); }
            });

            /* cambiar usuario, ventana o plazo recalcula la última respuesta en vivo */
            ctl.on(function (get) {
                var sel = ROLES.filter(function (x) { return x.v === get('rol'); });
                S.rol = sel.length ? sel[0] : ROLES[0];
                S.meses = +get('per');
                S.dias = +get('dias');
                pinta();
                log.push('hl', 'alcance recalculado · ' + S.rol.t + ' · ' + S.meses + ' meses · plazo ' + S.dias + ' días');
                if (!S.ultima) return;
                var a = resolver(S.ultima), nodo = burbuja(a);
                if (S.nodo && S.nodo.parentNode === chat) chat.replaceChild(nodo, S.nodo);
                else chat.appendChild(nodo);
                S.nodo = nodo;
                aplicar(a, true);
                chat.scrollTop = chat.scrollHeight;
            });

            /* estado de trabajo: presentación del agente y una pregunta ya resuelta */
            var hola = k.el('div', 'msg a');
            hola.appendChild(k.txt('div', null, 'Estoy conectado a dos tablas del almacén: facturación regional con ' + D.fac.length + ' registros y bitácora de la flota con ' + D.flo.length + '. Calculo sobre ellas y digo de dónde salió cada cifra.'));
            hola.appendChild(k.txt('span', 'src', '2 tablas conectadas · ninguna consulta ejecutada todavía'));
            chat.appendChild(hola);

            pinta();
            log.push('in', 'sesión abierta · usuario: ' + S.rol.t);
            chat.appendChild(k.txt('div', 'msg u', SUG[0]));
            var inicial = resolver(SUG[0]);
            S.nodo = burbuja(inicial);
            chat.appendChild(S.nodo);
            aplicar(inicial, false);
            S.ultima = SUG[0];
        }
    });
})();
