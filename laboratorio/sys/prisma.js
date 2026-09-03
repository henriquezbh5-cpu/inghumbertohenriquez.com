/* ============================================================
   PRISMA — motor de tableros
   Recibe un CSV o un Excel del visitante, perfila las columnas,
   elige dimensión, medida y eje temporal, y devuelve indicadores,
   gráficas y conclusiones escritas sin que nadie configure nada.
   El archivo se lee en el navegador: nunca sale del equipo.
   ============================================================ */
(function () {
    'use strict';

    var LAB = window.LAB;

    /* ---------- conjuntos de ejemplo (semilla fija) ---------- */
    function ejemploOperacion(k) {
        var r = k.rng(20260902);
        var rows = [['Fecha', 'Área', 'Proceso', 'Ejecuciones', 'Minutos ahorrados', 'Estado']];
        var areas = ['Finanzas', 'Compras', 'Talento humano', 'Operaciones', 'Servicio', 'Tecnología'];
        var procs = {
            'Finanzas': ['Conciliación bancaria', 'Cierre contable', 'Cobranza'],
            'Compras': ['Órdenes de compra', 'Alta de proveedores', 'Conciliación a tres vías'],
            'Talento humano': ['Alta de personal', 'Planilla', 'Vacaciones'],
            'Operaciones': ['Despachos', 'Inventario cíclico', 'Rutas'],
            'Servicio': ['Tickets nivel 1', 'Encuestas', 'Reembolsos'],
            'Tecnología': ['Altas de acceso', 'Respaldos', 'Monitoreo']
        };
        var base = new Date(2026, 2, 1).getTime();
        for (var i = 0; i < 280; i++) {
            var d = new Date(base + Math.floor(r() * 178) * 86400000);
            var a = k.pick(r, areas);
            var p = k.pick(r, procs[a]);
            var w = a === 'Finanzas' ? 2.4 : a === 'Compras' ? 1.9 : a === 'Operaciones' ? 1.5 : 1;
            var ex = Math.round((14 + r() * 120) * w);
            rows.push([
                d.getFullYear() + '-' + k.pad(d.getMonth() + 1) + '-' + k.pad(d.getDate()),
                a, p, ex, Math.round(ex * (2.2 + r() * 5.5)), r() < 0.94 ? 'Éxito' : 'Reintento'
            ]);
        }
        return rows;
    }

    function ejemploFacturacion(k) {
        var r = k.rng(77015);
        var rows = [['Fecha', 'País', 'Línea', 'Canal', 'Monto', 'Días de pago']];
        var co = ['El Salvador', 'Guatemala', 'Costa Rica', 'República Dominicana'];
        var li = ['Automatización', 'Licenciamiento', 'Consultoría', 'Soporte'];
        var ca = ['Directo', 'Socio', 'Licitación'];
        var base = new Date(2026, 0, 6).getTime();
        for (var i = 0; i < 300; i++) {
            var d = new Date(base + Math.floor(r() * 232) * 86400000);
            var c = k.pick(r, co), l = k.pick(r, li);
            var w = c === 'El Salvador' ? 2.2 : c === 'Guatemala' ? 1.6 : 1;
            var lw = l === 'Automatización' ? 2.1 : l === 'Consultoría' ? 1.4 : 1;
            rows.push([
                d.getFullYear() + '-' + k.pad(d.getMonth() + 1) + '-' + k.pad(d.getDate()),
                c, l, k.pick(r, ca),
                Math.round((900 + r() * 14000) * w * lw / 100) * 100,
                Math.round(12 + r() * 66)
            ]);
        }
        return rows;
    }

    function ejemploServicio(k) {
        var r = k.rng(31884);
        var rows = [['Fecha', 'Categoría', 'Canal', 'Prioridad', 'Minutos de atención', 'Reaperturas']];
        var cat = ['Acceso y credenciales', 'Infraestructura', 'Datos y reportes', 'Facturación', 'Equipos'];
        var canal = ['Portal', 'Correo', 'Chat', 'Teléfono'];
        var pri = ['Crítica', 'Alta', 'Media', 'Baja'];
        var base = new Date(2026, 1, 3).getTime();
        for (var i = 0; i < 320; i++) {
            var d = new Date(base + Math.floor(r() * 200) * 86400000);
            var c = k.pick(r, cat), p = k.pick(r, pri);
            var w = p === 'Crítica' ? 0.35 : p === 'Alta' ? 0.6 : 1;
            rows.push([
                d.getFullYear() + '-' + k.pad(d.getMonth() + 1) + '-' + k.pad(d.getDate()),
                c, k.pick(r, canal), p,
                Math.round((18 + r() * 240) * w),
                r() < 0.11 ? 1 : 0
            ]);
        }
        return rows;
    }

    var EJEMPLOS = {
        ops: { n: 'Ejemplo · operación de bots', f: ejemploOperacion },
        fin: { n: 'Ejemplo · facturación por región', f: ejemploFacturacion },
        srv: { n: 'Ejemplo · mesa de servicio', f: ejemploServicio }
    };

    /* ---------- perfilado de columnas ---------- */
    var RE_FECHA = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/;
    var MAX_FILAS = 50000;

    function esFecha(v) {
        if (v instanceof Date) return true;
        return typeof v === 'string' && RE_FECHA.test(v.trim());
    }
    function aFecha(v) {
        if (v instanceof Date) return v;
        var s = String(v).trim().slice(0, 10).replace(/\//g, '-');
        var p = s.split('-');
        if (p.length !== 3) return new Date(NaN);
        return new Date(+p[0], (+p[1]) - 1, +p[2]);
    }
    function aNumero(v) {
        if (typeof v === 'number') return v;
        if (v == null) return NaN;
        var s = String(v).replace(/[$,\s%]/g, '').replace(/ /g, '');
        if (s === '' || s === '-') return NaN;
        return Number(s);
    }

    function perfilar(rows) {
        var head = (rows[0] || []).map(function (h, i) {
            var t = String(h == null ? '' : h).trim();
            return t || ('Columna ' + (i + 1));
        });
        var body = rows.slice(1).filter(function (r) {
            return r && r.some(function (c) { return c != null && c !== ''; });
        });
        var truncado = 0;
        if (body.length > MAX_FILAS) { truncado = body.length - MAX_FILAS; body = body.slice(0, MAX_FILAS); }

        var muestra = body.slice(0, 600);
        var cols = head.map(function (h, i) {
            var vals = muestra.map(function (r) { return r[i]; });
            var llenos = vals.filter(function (v) { return v != null && v !== ''; });
            var fechas = 0, nums = 0;
            llenos.forEach(function (v) {
                if (esFecha(v)) { fechas++; return; }
                if (!isNaN(aNumero(v))) nums++;
            });
            var n = llenos.length || 1;
            var tipo = fechas > n * 0.7 ? 'date' : (nums > n * 0.8 ? 'num' : 'cat');
            var unicos = {};
            var cu = 0;
            for (var j = 0; j < llenos.length && cu < 400; j++) {
                var kk = String(llenos[j]);
                if (!unicos[kk]) { unicos[kk] = 1; cu++; }
            }
            return {
                name: h, i: i, tipo: tipo, unicos: cu,
                vacios: Math.round((1 - llenos.length / (muestra.length || 1)) * 100)
            };
        });
        return { head: head, body: body, cols: cols, truncado: truncado };
    }

    /* Elige la mejor medida: prefiere nombres de dinero o volumen. */
    function mejorMedida(cols) {
        var nums = cols.filter(function (c) { return c.tipo === 'num'; });
        if (!nums.length) return null;
        var peso = /monto|venta|ingres|importe|total|precio|costo|valor|factur/i;
        var peso2 = /cantidad|unidad|ejecuc|minuto|hora|volumen|conteo/i;
        var ord = nums.slice().sort(function (a, b) {
            var pa = peso.test(a.name) ? 2 : (peso2.test(a.name) ? 1 : 0);
            var pb = peso.test(b.name) ? 2 : (peso2.test(b.name) ? 1 : 0);
            if (pa !== pb) return pb - pa;
            return a.i - b.i;
        });
        return ord[0];
    }
    /* Elige la mejor dimensión: cardinalidad usable, ni única ni binaria trivial. */
    function candidatasDimension(cols, filas) {
        var techo = Math.max(40, Math.min(200, Math.round(filas * 0.6)));
        var c = cols.filter(function (x) { return x.tipo === 'cat' && x.unicos > 1 && x.unicos <= techo; });
        if (!c.length) c = cols.filter(function (x) { return x.tipo === 'cat'; });
        if (!c.length) c = cols.slice();
        return c.sort(function (a, b) {
            var pa = (a.unicos >= 3 && a.unicos <= 12) ? 0 : 1;
            var pb = (b.unicos >= 3 && b.unicos <= 12) ? 0 : 1;
            if (pa !== pb) return pa - pb;
            return a.i - b.i;
        });
    }

    /* ---------- sistema ---------- */
    LAB.register({
        id: 'prisma',
        name: 'PRISMA',
        family: 'hero',
        tagline: 'Motor de tableros',
        title: 'Sube un archivo. Recibe un tablero.',
        intro: 'Lee el archivo en tu navegador, detecta qué columna es fecha, cuál es categoría y cuál es medida, y arma los indicadores, las gráficas y las conclusiones sin que configures nada.',
        spec: {
            trigger: 'Un archivo que aparece en una carpeta, llega por correo o lo sube una persona.',
            systems: 'Lectura de Excel y CSV en el navegador, perfilado de columnas, motor de agregación y capa de gráficas.',
            output: 'Indicadores, cuatro visualizaciones, conclusiones escritas y el resumen descargable.',
            failure: 'Si el archivo no trae filas útiles lo dice y explica qué esperaba encontrar, en vez de dibujar un tablero vacío.'
        },
        impact: [
            ['0 clics', 'de configuración para el primer tablero'],
            ['En tu equipo', 'el archivo nunca sale del navegador'],
            ['Cualquier CSV o Excel', 'sin plantilla previa']
        ],

        render: function (host, k) {
            var S = { datos: null, fuente: '', graficas: {}, arrancado: false };

            /* ---------- zona de carga ---------- */
            var drop = k.el('div', 'drop drop-grande');
            var bot = document.createElement('img');
            bot.className = 'drop-bot';
            bot.src = '../img/nova/laptop.webp';
            bot.alt = '';
            bot.width = 400; bot.height = 400;
            bot.loading = 'lazy';
            bot.decoding = 'async';
            drop.appendChild(bot);
            drop.appendChild(k.txt('h4', null, 'Arrastra aquí tu Excel o tu CSV'));
            drop.appendChild(k.txt('p', null, 'Cualquier archivo con encabezados sirve. Si prefieres verlo funcionar primero, abre uno de ejemplo.'));
            var btns = k.el('div', 'drop-btns');
            var bFile = k.txt('button', 'btn primary', 'Elegir archivo');
            bFile.type = 'button';
            btns.appendChild(bFile);
            Object.keys(EJEMPLOS).forEach(function (id) {
                var b = k.txt('button', 'btn', EJEMPLOS[id].n.replace('Ejemplo · ', 'Ejemplo: '));
                b.type = 'button';
                b.addEventListener('click', function () { cargar(EJEMPLOS[id].f(k), EJEMPLOS[id].n); });
                btns.appendChild(b);
            });
            drop.appendChild(btns);
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.tsv,.txt,.xlsx,.xls';
            input.className = 'hide';
            drop.appendChild(input);
            drop.appendChild(k.txt('p', 'drop-privacy', 'Se procesa en tu navegador · el archivo no se sube a ningún servidor'));
            host.appendChild(drop);

            bFile.addEventListener('click', function () { input.click(); });
            input.addEventListener('change', function (e) {
                if (e.target.files && e.target.files[0]) leerArchivo(e.target.files[0]);
            });
            ['dragenter', 'dragover'].forEach(function (ev) {
                drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
            });
            ['dragleave', 'drop'].forEach(function (ev) {
                drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
            });
            drop.addEventListener('drop', function (e) {
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) leerArchivo(e.dataTransfer.files[0]);
            });

            /* ---------- estado de análisis ---------- */
            var estado = k.el('div', 'panel pad hide');
            var estadoTxt = k.txt('div', 'mono', '');
            estadoTxt.style.color = 'var(--teal)';
            estado.appendChild(estadoTxt);
            host.appendChild(estado);

            /* ---------- controles ---------- */
            var ctl = k.controls([
                { k: 'dim', t: 'select', label: 'Dimensión', options: [] },
                { k: 'mea', t: 'select', label: 'Medida', options: [] },
                { k: 'agg', t: 'select', label: 'Agregación', options: [{ v: 'sum', t: 'Suma' }, { v: 'avg', t: 'Promedio' }, { v: 'count', t: 'Conteo' }] },
                { k: 'dat', t: 'select', label: 'Eje temporal', options: [] },
                { k: 'top', t: 'range', label: 'Categorías a mostrar', min: 3, max: 20, step: 1, value: 10 }
            ]);
            var fuenteLbl = k.txt('span', 'mono', '—');
            fuenteLbl.style.marginLeft = 'auto';
            fuenteLbl.style.alignSelf = 'flex-end';
            fuenteLbl.style.paddingBottom = '10px';
            ctl.bar.appendChild(fuenteLbl);
            var ajustes = document.createElement('details');
            ajustes.className = 'detalle';
            var resumen = document.createElement('summary');
            resumen.className = 'mono';
            resumen.textContent = 'Ajustar el tablero · dimensión, medida, agregación';
            ajustes.appendChild(resumen);
            var ajustesBody = k.el('div', 'detalle-body');
            ajustesBody.appendChild(ctl.node);
            ajustes.appendChild(ajustesBody);
            host.appendChild(ajustes);
            ctl.on(function () { pintar(); });

            /* ---------- esquema detectado ---------- */
            var esqPanel = k.el('div', 'panel pad');
            esqPanel.appendChild(k.txt('div', 'mono-head', 'Esto lo detecté solo, leyendo tu archivo'));
            var esqBody = k.el('div');
            esqBody.style.display = 'flex';
            esqBody.style.flexWrap = 'wrap';
            esqBody.style.gap = '8px';
            esqPanel.appendChild(esqBody);
            host.appendChild(esqPanel);

            /* ---------- indicadores ---------- */
            var kpis = k.kpis([
                ['Filas analizadas', '—'],
                ['Total de la medida', '—', 'up'],
                ['Categorías distintas', '—'],
                ['Mayor participación', '—']
            ]);
            host.appendChild(kpis.node);

            /* ---------- gráficas ---------- */
            var g1 = k.el('div', 'grid2');
            var cbCat = k.chartbox('Distribución por dimensión', '—');
            var cbTime = k.chartbox('Evolución en el tiempo', '—');
            g1.appendChild(cbCat.node);
            g1.appendChild(cbTime.node);
            host.appendChild(g1);

            var g2 = k.el('div', 'grid2');
            var cbShare = k.chartbox('Concentración', 'Participación de las categorías principales');
            var insPanel = k.el('div', 'chartbox');
            insPanel.appendChild(k.txt('h4', null, 'Lectura automática'));
            insPanel.appendChild(k.txt('div', 'cap', 'Generada a partir de los datos cargados'));
            var ins = k.insights();
            ins.node.style.marginTop = '12px';
            insPanel.appendChild(ins.node);
            g2.appendChild(cbShare.node);
            g2.appendChild(insPanel);
            host.appendChild(g2);

            var cbCruce = k.chartbox('Cruce de dos dimensiones', '—');
            host.appendChild(cbCruce.node);

            /* ---------- vista previa ---------- */
            var prev = k.el('div', 'panel pad');
            var prevHead = k.el('div');
            prevHead.style.display = 'flex';
            prevHead.style.justifyContent = 'space-between';
            prevHead.style.alignItems = 'center';
            prevHead.style.gap = '14px';
            prevHead.style.marginBottom = '12px';
            prevHead.appendChild(k.txt('div', 'mono-head', 'Vista previa de los datos'));
            (function () { prevHead.firstChild.style.marginBottom = '0'; })();
            var bDesc = k.txt('button', 'btn', 'Descargar resumen (CSV)');
            bDesc.type = 'button';
            prevHead.appendChild(bDesc);
            prev.appendChild(prevHead);
            var prevBody = k.el('div');
            prev.appendChild(prevBody);
            host.appendChild(prev);

            /* ---------- lectura de archivo ---------- */
            function leerArchivo(f) {
                var fr = new FileReader();
                fr.onerror = function () { aviso('No se pudo leer el archivo.'); };
                fr.onload = function () {
                    try {
                        if (!window.XLSX) { aviso('El lector de archivos todavía está cargando. Inténtalo en un momento.'); return; }
                        var wb = window.XLSX.read(fr.result, { type: 'array', cellDates: true });
                        var hoja = wb.Sheets[wb.SheetNames[0]];
                        var rows = window.XLSX.utils.sheet_to_json(hoja, { header: 1, raw: true, defval: '' });
                        rows = rows.filter(function (r) {
                            return r && r.length && r.some(function (c) { return c !== '' && c != null; });
                        }).map(function (r) {
                            return r.map(function (c) {
                                return c instanceof Date ? (c.getFullYear() + '-' + k.pad(c.getMonth() + 1) + '-' + k.pad(c.getDate())) : c;
                            });
                        });
                        if (rows.length < 2) {
                            aviso('No encontré filas de datos en la primera hoja. Esperaba una fila de encabezados y al menos una de datos.');
                            return;
                        }
                        cargar(rows, f.name, true);
                    } catch (err) {
                        aviso('No pude leer el archivo: ' + err.message);
                    }
                };
                fr.readAsArrayBuffer(f);
            }

            function aviso(msg) {
                estado.classList.remove('hide');
                estadoTxt.style.color = 'var(--rose)';
                estadoTxt.textContent = msg;
            }

            var PASOS = [
                'Leyendo el archivo…',
                'Detectando el tipo de cada columna…',
                'Eligiendo dimensión, medida y eje temporal…',
                'Agregando y calculando indicadores…',
                'Dibujando el tablero…'
            ];

            async function cargar(rows, fuente, subido) {
                var p = perfilar(rows);
                if (!p.body.length) {
                    aviso('El archivo tiene encabezados pero ninguna fila de datos.');
                    return;
                }
                S.datos = p;
                S.fuente = fuente;

                if (S.arrancado && !LAB.reduce) {
                    estado.classList.remove('hide');
                    estadoTxt.style.color = 'var(--teal)';
                    for (var i = 0; i < PASOS.length; i++) {
                        estadoTxt.textContent = PASOS[i];
                        await k.wait(190);
                    }
                    estado.classList.add('hide');
                } else {
                    estado.classList.add('hide');
                }

                var filas = p.body.length;
                var dims = candidatasDimension(p.cols, filas);
                var meas = p.cols.filter(function (c) { return c.tipo === 'num'; });
                var fechas = p.cols.filter(function (c) { return c.tipo === 'date'; });

                llenar(ctl, 'dim', dims.length ? dims : p.cols);
                llenar(ctl, 'mea', meas.length ? meas : p.cols, meas.length ? null : '(sin medida numérica)');
                llenar(ctl, 'dat', fechas, fechas.length ? null : 'Sin eje temporal');
                var mm = mejorMedida(p.cols);
                if (mm) ctl.set('mea', String(mm.i));
                ctl.set('agg', meas.length ? 'sum' : 'count');
                ctl.set('top', Math.min(10, Math.max(3, dims.length ? Math.min(dims[0].unicos, 20) : 10)));

                fuenteLbl.textContent = fuente + ' · ' + k.fmt(filas, 0) + ' filas · ' + p.cols.length + ' columnas' +
                    (p.truncado ? ' · ' + k.fmt(p.truncado, 0) + ' filas no analizadas (tope de ' + k.fmt(MAX_FILAS, 0) + ')' : '');

                esquema(p.cols);
                pintar();

                if (subido && S.arrancado) {
                    host.scrollIntoView({ behavior: LAB.reduce ? 'auto' : 'smooth', block: 'start' });
                }
                S.arrancado = true;
            }

            /* El kit no expone los <select>; se toman por posición estable
               en la barra, que es el orden declarado en k.controls. */
            function llenar(c, clave, cols, extra) {
                var selects = c.bar.querySelectorAll('select');
                var idx = { dim: 0, mea: 1, agg: 2, dat: 3 }[clave];
                var s = selects[idx];
                if (!s) return;
                s.innerHTML = '';
                if (extra) s.appendChild(new Option(extra, ''));
                cols.forEach(function (col) { s.appendChild(new Option(col.name, String(col.i))); });
            }

            function esquema(cols) {
                esqBody.innerHTML = '';
                var etiqueta = { date: 'fecha', num: 'medida', cat: 'categoría' };
                var tono = { date: 'run', num: 'ok', cat: 'idle' };
                cols.forEach(function (c) {
                    var chip = k.el('span', 'pill p-' + tono[c.tipo]);
                    chip.appendChild(document.createTextNode(c.name + ' · ' + etiqueta[c.tipo] +
                        (c.tipo === 'cat' ? ' (' + c.unicos + ')' : '') +
                        (c.vacios > 5 ? ' · ' + c.vacios + '% vacío' : '')));
                    esqBody.appendChild(chip);
                });
            }

            /* ---------- agregación ---------- */
            function agregar(vals, como) {
                if (como === 'count') return vals.length;
                var s = 0;
                for (var i = 0; i < vals.length; i++) s += vals[i];
                return como === 'avg' ? (vals.length ? s / vals.length : 0) : s;
            }

            /* Igual que en el núcleo: detener antes de destruir, o Chart.js
               revienta al liberar una animación en vuelo. */
            function destruir(id) {
                if (!S.graficas[id]) return;
                k.killChart(S.graficas[id]);
                S.graficas[id] = null;
            }

            function pintar() {
                var p = S.datos;
                if (!p) return;
                var di = parseInt(ctl.get('dim'), 10);
                var mi = parseInt(ctl.get('mea'), 10);
                var como = ctl.get('agg');
                var dt = ctl.get('dat');
                var topN = ctl.get('top');
                if (isNaN(di)) di = 0;

                var colDim = p.cols[di] || p.cols[0];
                var colMea = p.cols[mi];
                var nMea = colMea ? colMea.name : 'Registros';
                var nDim = colDim ? colDim.name : 'Categoría';
                var dinero = /monto|venta|ingres|precio|costo|total|importe|factur/i.test(nMea);
                var f = function (n) { return dinero && como !== 'count' ? k.money(n) : k.fmt(n); };

                /* agrupación por dimensión */
                var grupos = Object.create(null);
                for (var i = 0; i < p.body.length; i++) {
                    var row = p.body[i];
                    var key = row[di];
                    key = (key == null || key === '') ? '(sin dato)' : String(key);
                    var v = colMea ? aNumero(row[mi]) : 1;
                    if (isNaN(v)) v = 0;
                    (grupos[key] || (grupos[key] = [])).push(v);
                }
                var serie = Object.keys(grupos).map(function (key) {
                    return { k: key, v: agregar(grupos[key], como) };
                }).sort(function (a, b) { return b.v - a.v; });
                var total = serie.reduce(function (a, b) { return a + b.v; }, 0);

                var todos = colMea ? p.body.map(function (r) { return aNumero(r[mi]); }).filter(function (v) { return !isNaN(v); }) : [];
                var suma = todos.reduce(function (a, b) { return a + b; }, 0);

                /* indicadores */
                var top = serie[0] || { k: '—', v: 0 };
                var share = total ? top.v / total * 100 : 0;
                kpis.set(0, k.fmt(p.body.length, 0));
                kpis.set(1, como === 'avg'
                    ? f(todos.length ? suma / todos.length : 0)
                    : (como === 'count' ? k.fmt(p.body.length, 0) : f(suma)), 'up');
                kpis.set(2, k.fmt(serie.length, 0));
                kpis.set(3, Math.round(share) + '%', share > 55 ? 'warn' : '');
                kpis.node.children[1].children[1].textContent =
                    (como === 'avg' ? 'PROMEDIO DE ' : como === 'count' ? 'REGISTROS CONTADOS' : 'TOTAL DE ') +
                    (como === 'count' ? '' : nMea.toUpperCase());
                kpis.node.children[2].children[1].textContent = (nDim + ' · valores distintos').toUpperCase();

                /* gráfica 1 — categorías principales */
                var cortas = serie.slice(0, topN);
                cbCat.title(nMea + ' por ' + nDim);
                cbCat.cap((como === 'avg' ? 'Promedio' : como === 'count' ? 'Conteo' : 'Suma') +
                    ' · ' + cortas.length + ' de ' + serie.length + ' categorías');
                destruir('cat');
                S.graficas.cat = k.chart(cbCat.canvas, {
                    type: 'bar',
                    data: {
                        labels: cortas.map(function (d) { return d.k; }),
                        datasets: [{
                            label: nMea,
                            data: cortas.map(function (d) { return d.v; }),
                            backgroundColor: k.C.teal,
                            hoverBackgroundColor: k.C.cyan,
                            borderRadius: 4, borderSkipped: 'start',
                            barPercentage: 0.74, categoryPercentage: 0.84
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false },
                            tooltip: { callbacks: { label: function (c) { return ' ' + f(c.parsed.x); } } }
                        },
                        scales: {
                            x: Object.assign({}, k.AXIS, { ticks: { padding: 8, callback: function (v) { return dinero ? '$' + k.fmt(v, 0) : k.fmt(v, 0); } } }),
                            y: k.AXIS_BARE
                        }
                    }
                }, { track: false });

                /* gráfica 2 — evolución temporal */
                var idxFecha = dt === '' ? -1 : parseInt(dt, 10);
                if (idxFecha >= 0 && p.cols[idxFecha]) {
                    cbTime.node.classList.remove('hide');
                    var cubos = Object.create(null);
                    for (var j = 0; j < p.body.length; j++) {
                        var rv = p.body[j][idxFecha];
                        if (!rv) continue;
                        var d = aFecha(rv);
                        if (isNaN(d.getTime())) continue;
                        var ck = d.getFullYear() + '-' + k.pad(d.getMonth() + 1);
                        var vv = colMea ? aNumero(p.body[j][mi]) : 1;
                        (cubos[ck] || (cubos[ck] = [])).push(isNaN(vv) ? 0 : vv);
                    }
                    var claves = Object.keys(cubos).sort();
                    var valores = claves.map(function (x) { return agregar(cubos[x], como); });
                    cbTime.title('Evolución de ' + nMea);
                    cbTime.cap('Por mes · ' + claves.length + ' periodos');
                    destruir('time');
                    S.graficas.time = k.chart(cbTime.canvas, {
                        type: 'line',
                        data: {
                            labels: claves,
                            datasets: [{
                                label: nMea, data: valores,
                                borderColor: k.C.cyan, borderWidth: 2, tension: 0.32,
                                pointRadius: 3, pointHoverRadius: 6,
                                pointBackgroundColor: k.C.cyan, pointBorderColor: '#0D1729', pointBorderWidth: 2,
                                fill: true, backgroundColor: 'rgba(56,189,248,.11)'
                            }]
                        },
                        options: {
                            plugins: {
                                legend: { display: false },
                                tooltip: { callbacks: { label: function (c) { return ' ' + f(c.parsed.y); } } }
                            },
                            interaction: { mode: 'index', intersect: false },
                            scales: {
                                x: k.AXIS_BARE,
                                y: Object.assign({}, k.AXIS, { ticks: { padding: 8, callback: function (v) { return dinero ? '$' + k.fmt(v, 0) : k.fmt(v, 0); } } })
                            }
                        }
                    }, { track: false });
                } else {
                    cbTime.node.classList.add('hide');
                    destruir('time');
                }

                /* gráfica 3 — concentración */
                var cuatro = serie.slice(0, 4);
                var resto = total - cuatro.reduce(function (a, b) { return a + b.v; }, 0);
                var ds = cuatro.map(function (d, i2) {
                    return {
                        label: d.k, data: [d.v], backgroundColor: k.CAT[i2],
                        borderRadius: 3, borderColor: '#0D1729', borderWidth: 2
                    };
                });
                if (resto > total * 0.001) {
                    ds.push({
                        label: 'Resto (' + Math.max(0, serie.length - 4) + ')', data: [resto],
                        backgroundColor: 'rgba(148,180,220,.22)',
                        borderRadius: 3, borderColor: '#0D1729', borderWidth: 2
                    });
                }
                destruir('share');
                S.graficas.share = k.chart(cbShare.canvas, {
                    type: 'bar',
                    data: { labels: [nDim], datasets: ds },
                    options: {
                        indexAxis: 'y',
                        plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                                callbacks: {
                                    label: function (c) {
                                        return ' ' + c.dataset.label + ': ' + f(c.parsed.x) +
                                            '  (' + Math.round(total ? c.parsed.x / total * 100 : 0) + '%)';
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                stacked: true, grid: { display: false }, border: { display: false },
                                ticks: { padding: 8, callback: function (v) { return Math.round(total ? v / total * 100 : 0) + '%'; } }
                            },
                            y: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { display: false } }
                        }
                    }
                }, { track: false });

                /* gráfica 4 — cruce con una segunda dimensión */
                var otras = p.cols.filter(function (c) {
                    return c.tipo === 'cat' && c.i !== di && c.unicos > 1 && c.unicos <= 8;
                });
                if (otras.length && colMea) {
                    var d2 = otras[0];
                    cbCruce.node.classList.remove('hide');
                    cbCruce.title(nMea + ' por ' + nDim + ' y ' + d2.name);
                    cbCruce.cap('Barras apiladas · las ' + Math.min(6, cortas.length) + ' categorías principales');
                    var ejes = cortas.slice(0, 6).map(function (x) { return x.k; });
                    var subs = {};
                    p.body.forEach(function (r) {
                        var a = String(r[di] == null || r[di] === '' ? '(sin dato)' : r[di]);
                        if (ejes.indexOf(a) < 0) return;
                        var b = String(r[d2.i] == null || r[d2.i] === '' ? '(sin dato)' : r[d2.i]);
                        var vv2 = aNumero(r[mi]);
                        subs[b] = subs[b] || {};
                        subs[b][a] = (subs[b][a] || 0) + (isNaN(vv2) ? 0 : vv2);
                    });
                    var nombresSub = Object.keys(subs).slice(0, 4);
                    destruir('cruce');
                    S.graficas.cruce = k.chart(cbCruce.canvas, {
                        type: 'bar',
                        data: {
                            labels: ejes,
                            datasets: nombresSub.map(function (nb, i3) {
                                return {
                                    label: nb,
                                    data: ejes.map(function (a) { return subs[nb][a] || 0; }),
                                    backgroundColor: k.CAT[i3], borderRadius: 3,
                                    barPercentage: 0.7, categoryPercentage: 0.78
                                };
                            })
                        },
                        options: {
                            plugins: {
                                legend: { position: 'bottom' },
                                tooltip: { callbacks: { label: function (c) { return ' ' + c.dataset.label + ': ' + f(c.parsed.y); } } }
                            },
                            scales: {
                                x: Object.assign({}, k.AXIS_BARE, { stacked: true }),
                                y: Object.assign({}, k.AXIS, { stacked: true, ticks: { padding: 8, callback: function (v) { return dinero ? '$' + k.fmt(v, 0) : k.fmt(v, 0); } } })
                            }
                        }
                    }, { track: false });
                } else {
                    cbCruce.node.classList.add('hide');
                    destruir('cruce');
                }

                lectura(serie, total, todos, suma, nMea, nDim, f, claves2(idxFecha, p, mi, como));
                vistaPrevia(p);
            }

            /* serie temporal auxiliar para detectar tendencia */
            function claves2(idxFecha, p, mi, como) {
                if (idxFecha < 0) return null;
                var cubos = Object.create(null);
                p.body.forEach(function (r) {
                    if (!r[idxFecha]) return;
                    var d = aFecha(r[idxFecha]);
                    if (isNaN(d.getTime())) return;
                    var ck = d.getFullYear() + '-' + k.pad(d.getMonth() + 1);
                    var v = aNumero(r[mi]);
                    (cubos[ck] || (cubos[ck] = [])).push(isNaN(v) ? 0 : v);
                });
                var ks = Object.keys(cubos).sort();
                if (ks.length < 4) return null;
                return ks.map(function (x) { return agregar(cubos[x], como); });
            }

            function lectura(serie, total, todos, suma, nMea, nDim, f, temporal) {
                ins.clear();
                if (!serie.length) {
                    ins.add('amber', '!', 'No hay categorías con datos para leer.');
                    return;
                }
                var top = serie[0];
                var share = total ? top.v / total * 100 : 0;
                ins.add('teal', '▲', '<b>' + k.escapeHtml(top.k) + '</b> concentra el <b>' + Math.round(share) +
                    '%</b> de ' + k.escapeHtml(nMea.toLowerCase()) + ' con ' + f(top.v) + '.');

                if (serie.length > 3) {
                    var tres = serie.slice(0, 3).reduce(function (a, b) { return a + b.v; }, 0);
                    var c3 = total ? tres / total * 100 : 0;
                    ins.add(c3 > 70 ? 'amber' : 'cyan', '≡',
                        'Las tres primeras categorías acumulan <b>' + Math.round(c3) + '%</b>' +
                        (c3 > 70
                            ? '. Concentración alta: una caída ahí mueve todo el resultado.'
                            : '. La distribución está razonablemente repartida.'));
                }

                if (serie.length > 4) {
                    var nCola = Math.max(1, Math.round(serie.length * 0.3));
                    var cola = serie.slice(-nCola).reduce(function (a, b) { return a + b.v; }, 0);
                    ins.add('violet', '▽', 'El <b>' + Math.round(nCola / serie.length * 100) +
                        '%</b> de categorías con menor volumen aporta apenas <b>' +
                        Math.round(total ? cola / total * 100 : 0) + '%</b>.');
                }

                if (temporal && temporal.length >= 4) {
                    var mitad = Math.floor(temporal.length / 2);
                    var ini = temporal.slice(0, mitad).reduce(function (a, b) { return a + b; }, 0) / mitad;
                    var fin = temporal.slice(mitad).reduce(function (a, b) { return a + b; }, 0) / (temporal.length - mitad);
                    var delta = ini ? (fin - ini) / ini * 100 : 0;
                    ins.add(delta >= 0 ? 'green' : 'rose', delta >= 0 ? '↗' : '↘',
                        'La segunda mitad del periodo va <b>' + k.fmt(Math.abs(delta), 1) + '%</b> ' +
                        (delta >= 0 ? 'por encima' : 'por debajo') + ' de la primera.');
                }

                if (todos.length > 4) {
                    var media = suma / todos.length;
                    var varianza = todos.reduce(function (a, b) { return a + (b - media) * (b - media); }, 0) / todos.length;
                    var sd = Math.sqrt(varianza);
                    var fuera = sd ? todos.filter(function (v) { return Math.abs(v - media) > 2.5 * sd; }).length : 0;
                    ins.add(fuera ? 'rose' : 'green', fuera ? '!' : '✓',
                        fuera
                            ? '<b>' + fuera + '</b> registros se salen de 2.5 desviaciones estándar. Conviene revisarlos antes de reportar.'
                            : 'Sin valores atípicos relevantes: la serie es estable.');
                }
            }

            function vistaPrevia(p) {
                prevBody.innerHTML = '';
                var cols = p.cols.map(function (c) { return { t: c.name, r: c.tipo === 'num' }; });
                var filas = p.body.slice(0, 8).map(function (r) {
                    return p.cols.map(function (c) { return r[c.i] == null ? '' : String(r[c.i]); });
                });
                prevBody.appendChild(k.table(cols, filas).node);
            }

            /* ---------- descarga del resumen ---------- */
            bDesc.addEventListener('click', function () {
                var p = S.datos;
                if (!p) return;
                var di = parseInt(ctl.get('dim'), 10);
                var mi = parseInt(ctl.get('mea'), 10);
                var como = ctl.get('agg');
                var grupos = Object.create(null);
                p.body.forEach(function (r) {
                    var key = String(r[di] == null || r[di] === '' ? '(sin dato)' : r[di]);
                    var v = aNumero(r[mi]);
                    (grupos[key] || (grupos[key] = [])).push(isNaN(v) ? 0 : v);
                });
                var nDim = (p.cols[di] || {}).name || 'Categoria';
                var nMea = (p.cols[mi] || {}).name || 'Registros';
                var lineas = [['"' + nDim + '"', '"' + nMea + '"', '"Participacion %"'].join(',')];
                var filas = Object.keys(grupos).map(function (key) { return { k: key, v: agregar(grupos[key], como) }; })
                    .sort(function (a, b) { return b.v - a.v; });
                var tot = filas.reduce(function (a, b) { return a + b.v; }, 0);
                filas.forEach(function (d) {
                    lineas.push(['"' + String(d.k).replace(/"/g, '""') + '"', d.v, (tot ? (d.v / tot * 100).toFixed(2) : '0')].join(','));
                });
                var blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'resumen-prisma.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
            });

            /* ---------- abre en estado de trabajo ---------- */
            cargar(EJEMPLOS.ops.f(k), EJEMPLOS.ops.n);
        }
    });
})();
