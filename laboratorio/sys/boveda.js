(function () {
    'use strict';
    var LAB = window.LAB;

    /* Tres documentos sintéticos que entran por el mismo esquema de campos.
       Las confianzas salen de una semilla fija: todo visitante ve los mismos
       números. Campo: [nombre, valor, confianza, crítico, motivo de la duda]. */
    function datos() {
        var r = LAB.kit.rng(15230);
        function c(a, b) { return Math.round((a + r() * (b - a)) * 10) / 10; }
        return [
            {
                id: 'factura',
                n: 'Factura de proveedor (PDF escaneado)',
                corto: 'Factura escaneada',
                origen: 'Adjunto de correo en el buzón de recepción',
                paginas: 1,
                reglas: 9,
                seg: 7.8,
                destino: 'Cuentas por pagar',
                clave: 'FAC-0084172',
                campos: [
                    ['Proveedor', 'Suministros Aguacayo, S.A. de C.V.', c(96, 99), false, 'Encabezado impreso y limpio'],
                    ['Registro fiscal', '0614-250719-102-3', c(93, 98), false, 'Dígitos separados por guiones'],
                    ['Número de documento', 'FAC-0084172', c(80, 88), true, 'Matriz de puntos con dígitos pegados'],
                    ['Fecha de emisión', '14/08/2026', c(90, 97), false, 'Formato ambiguo entre día y mes'],
                    ['Condición de pago', 'Crédito 30 días', c(66, 74), false, 'Texto libre al pie, sin etiqueta'],
                    ['Subtotal', '$4,182.50', c(95, 99), false, 'Columna de totales bien alineada'],
                    ['IVA 13%', '$543.73', c(88, 95), false, 'Sello traslapado sobre la cifra'],
                    ['Total', '$4,726.23', c(96, 99), true, 'Cifra repetida en números y en letras']
                ]
            },
            {
                id: 'contrato',
                n: 'Contrato de servicios (12 páginas)',
                corto: 'Contrato de 12 páginas',
                origen: 'Carpeta vigilada de contratos entrantes',
                paginas: 12,
                reglas: 12,
                seg: 19.4,
                destino: 'Expediente contractual',
                clave: 'CTR-2026-0117',
                campos: [
                    ['Contraparte', 'Terrasol Logística, S.A.', c(94, 98), false, 'Nombre en la comparecencia inicial'],
                    ['Objeto', 'Transporte terrestre de carga seca', c(80, 88), false, 'Cláusula escrita en un párrafo largo'],
                    ['Vigencia desde', '01/09/2026', c(90, 96), false, 'Fecha en letras y en números'],
                    ['Vigencia hasta', '31/08/2027', c(85, 93), true, 'Depende de una cláusula de prórroga'],
                    ['Monto mensual', '$3,150.00', c(83, 92), true, 'Cifra en letras dentro del párrafo'],
                    ['Penalidad por mora', '1.5% mensual sobre saldo', c(58, 68), false, 'Porcentaje escondido en un anexo'],
                    ['Renovación automática', 'Sí, con aviso 60 días antes', c(61, 71), false, 'Condición negada dos veces seguidas'],
                    ['Firmante autorizado', 'R. Escalante, apoderado', c(70, 79), false, 'Firma encima del nombre impreso']
                ]
            },
            {
                id: 'acta',
                n: 'Acta de recepción (foto de celular)',
                corto: 'Acta en foto de celular',
                origen: 'Imagen enviada por el transportista',
                paginas: 1,
                reglas: 7,
                seg: 6.1,
                destino: 'Inventario y reclamos',
                clave: 'OC-2026-3391',
                campos: [
                    ['Sucursal', 'Bodega Poniente 02', c(88, 95), false, 'Sello de bodega cortado por el borde'],
                    ['Orden de compra', 'OC-2026-3391', c(74, 84), true, 'Reflejo de la foto sobre el código'],
                    ['Fecha de recepción', '22/08/2026', c(80, 90), false, 'Escrita a mano sobre la línea'],
                    ['Bultos declarados', '48', c(85, 93), false, 'Casilla preimpresa y legible'],
                    ['Bultos recibidos', '46', c(69, 78), true, 'Número corregido encima del anterior'],
                    ['Bultos con daño', '2', c(52, 63), false, 'Marca a lápiz de trazo delgado'],
                    ['Recibe', 'M. Portillo, bodeguero', c(63, 73), false, 'Letra manuscrita ligada'],
                    ['Observación manuscrita', 'Dos cajas mojadas en la esquina', c(41, 55), false, 'Renglón fuera del recuadro']
                ]
            }
        ];
    }

    LAB.register({
        id: 'boveda',
        name: 'BÓVEDA',
        family: 'procesos',
        tagline: 'Extracción de campos',
        title: 'Extracción de campos con umbral de confianza',
        intro: 'Una factura escaneada, un contrato de doce páginas y una foto de celular entran por el mismo esquema de campos. Mueva el umbral y elija qué hacer con un campo crítico dudoso: verá cuáles valores se escriben solos y cuáles quedan esperando a una persona.',
        spec: {
            trigger: 'El documento llega como adjunto de correo o se deposita en una carpeta vigilada. El flujo arranca por evento, no por horario, y archiva el original antes de tocarlo.',
            systems: 'OCR sobre el PDF o la foto, modelo de lenguaje que mapea el texto al esquema de campos, capa de reglas para formato, rangos y coherencia, y carga al sistema contable usando el número de documento como clave de idempotencia.',
            output: 'Campos estructurados con su confianza individual y el motivo de cada duda, más una cola de revisión que solo contiene lo dudoso, con el recorte de imagen donde se leyó el valor.',
            failure: 'Por debajo del umbral ese campo no se escribe. Si el campo dudoso es crítico manda la política elegida: retener el documento completo o cargar lo cierto y dejar el crítico pendiente. Ningún valor entra inventado.'
        },
        impact: [
            ['1 esquema', 'para PDF, escaneo y foto de celular'],
            ['6 a 20 s', 'de lectura por documento'],
            ['Cero', 'campos escritos bajo el umbral']
        ],

        render: function (host, k) {
            var DOCS = datos();
            var campos = [];
            var docId = DOCS[0].id;
            var corrida = 0;
            var animando = false;

            var ctl = k.controls([
                {
                    k: 'doc', t: 'select', label: 'Documento de entrada', value: DOCS[0].id,
                    options: DOCS.map(function (d) { return { v: d.id, t: d.n }; })
                },
                { k: 'umbral', t: 'range', label: 'Umbral de confianza', min: 50, max: 95, step: 5, value: 75, suffix: '%' },
                {
                    k: 'politica', t: 'select', label: 'Si un campo crítico queda dudoso', value: 'retener',
                    options: [
                        { v: 'retener', t: 'Retener el documento completo' },
                        { v: 'parcial', t: 'Cargar lo cierto y dejarlo pendiente' }
                    ]
                },
                { k: 'run', t: 'button', label: 'Procesar documento', primary: true }
            ]);
            host.appendChild(ctl.node);

            var kp = k.kpis([
                ['Campos leídos', '0 / 8'],
                ['Se escriben solos', '0', 'up'],
                ['A revisión humana', '0', 'warn'],
                ['Tiempo de lectura', '—']
            ]);
            host.appendChild(kp.node);

            var pRec = k.panel();
            pRec.appendChild(k.txt('div', 'mono-head', 'Recorrido del documento'));
            var pipe = k.pipe([
                { n: 'Carpeta vigilada', m: 'Evento de llegada' },
                { n: 'OCR', m: 'Texto con posición' },
                { n: 'Modelo', m: 'Mapeo al esquema' },
                { n: 'Reglas', m: 'Formato y coherencia' },
                { n: 'Umbral', m: 'Confianza por campo' },
                { n: 'Destino', m: 'Carga idempotente' }
            ]);
            pRec.appendChild(pipe.node);
            host.appendChild(pRec);

            var fila1 = k.el('div', 'grid2 wide-left');
            host.appendChild(fila1);

            /* Panel titulado: devuelve el contenedor donde cuelga el contenido. */
            function seccion(padre, titulo, hijo) {
                var p = k.panel();
                var h = k.txt('div', 'mono-head', titulo);
                p.appendChild(h);
                if (hijo) p.appendChild(hijo);
                padre.appendChild(p);
                return { panel: p, head: h };
            }

            /* Izquierda: los campos leídos, uno por fila, con su confianza. */
            var izq = k.panel();
            var cab = k.el('div');
            cab.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px';
            var titulo = k.txt('div', 'mono-head', 'Campos extraídos');
            titulo.style.margin = '0';
            var estado = k.el('div', null, '');
            cab.appendChild(titulo);
            cab.appendChild(estado);
            izq.appendChild(cab);
            var caja = k.el('div', 'fields');
            izq.appendChild(caja);
            var ruta = k.txt('div', 'mono', '');
            ruta.style.cssText = 'margin-top:11px;font-size:11px;color:' + k.C.label;
            izq.appendChild(ruta);
            fila1.appendChild(izq);

            /* Derecha: reparto del documento y registro de la corrida. */
            var der = k.el('div', 'stack');
            var box = k.chartbox('Reparto del documento', 'Campos que se escriben solos frente a los que revisa una persona', '176px');
            der.appendChild(box.node);
            var log = k.log('186px');
            seccion(der, 'Registro de la corrida', log.node);
            fila1.appendChild(der);

            var fila2 = k.el('div', 'grid2 wide-left');
            host.appendChild(fila2);
            var colaHost = k.el('div');
            var tCola = seccion(fila2, 'Cola de revisión', colaHost).head;
            var bars = k.bars();
            seccion(fila2, 'Los tres documentos con este mismo umbral', bars.node);
            var ins = k.insights();
            seccion(host, 'Cómo se lee el umbral', ins.node);

            var ch = k.chart(box.canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Se escriben solos', 'A revisión humana'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: [k.C.teal, k.C.amber],
                        borderColor: k.C.bg2,
                        borderWidth: 3,
                        hoverOffset: 4
                    }]
                },
                options: { cutout: '62%', plugins: { legend: { position: 'bottom' } } }
            });

            function doc() {
                for (var i = 0; i < DOCS.length; i++) {
                    if (DOCS[i].id === docId) return DOCS[i];
                }
                return DOCS[0];
            }

            /* Cuántos campos de un documento cualquiera caen bajo el umbral. */
            function bajos(d, u) {
                var n = 0;
                d.campos.forEach(function (cp) { if (cp[2] < u) n++; });
                return n;
            }

            /* Arma las filas del documento activo, todas todavía en blanco. */
            function construir(d) {
                campos = [];
                caja.innerHTML = '';
                d.campos.forEach(function (cp) {
                    var row = k.el('div', 'fx');
                    row.appendChild(k.txt('div', 'fk', cp[0]));

                    var fv = k.el('div', 'fv');
                    fv.style.cssText = 'display:flex;align-items:center;gap:10px';
                    var val = k.txt('span', null, '—');
                    val.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
                    var tag = k.el('span', null, '');
                    tag.style.flex = 'none';
                    fv.appendChild(val);
                    fv.appendChild(tag);
                    row.appendChild(fv);

                    var conf = k.el('div', 'conf');
                    var pista = k.el('div', 't');
                    var relleno = k.el('div', 'f');
                    relleno.style.width = '0%';
                    pista.appendChild(relleno);
                    conf.appendChild(pista);
                    var pc = k.txt('span', null, '—');
                    conf.appendChild(pc);
                    row.appendChild(conf);

                    caja.appendChild(row);
                    campos.push({
                        nombre: cp[0], valor: cp[1], conf: cp[2], critico: cp[3], motivo: cp[4],
                        row: row, val: val, tag: tag, fill: relleno, pc: pc, leido: false
                    });
                });
            }

            /* Pie del panel de campos: de dónde viene, a dónde va y con qué política. */
            function pintarRuta(d, politica) {
                ruta.textContent = 'Entrada: ' + d.origen + '  ·  Destino: ' + d.destino +
                    '  ·  Clave de idempotencia: ' + d.clave + '  ·  Política ante crítico dudoso: ' +
                    (politica === 'retener' ? 'retener el documento completo' : 'cargar lo cierto y dejarlo pendiente');
            }

            /* Reevalúa todo contra el umbral y la política vigentes. En vivo. */
            function aplicar() {
                var u = ctl.get('umbral');
                var politica = ctl.get('politica');
                var d = doc();
                var sobre = 0, dudosos = 0, leidos = 0, criticoDudoso = false;

                campos.forEach(function (f) {
                    if (f.leido && f.conf < u && f.critico) criticoDudoso = true;
                });
                var retenido = criticoDudoso && politica === 'retener';

                campos.forEach(function (f) {
                    if (!f.leido) {
                        f.val.textContent = '—';
                        f.tag.innerHTML = '';
                        f.fill.style.width = '0%';
                        f.pc.textContent = '—';
                        f.row.style.background = '';
                        return;
                    }
                    leidos++;
                    var ok = f.conf >= u;
                    if (ok) { sobre++; } else { dudosos++; }
                    f.val.textContent = f.valor;
                    if (!ok) {
                        f.tag.innerHTML = f.critico ? k.pill('bad', 'crítico dudoso') : k.pill('warn', 'a revisión');
                        f.fill.style.background = f.critico ? k.C.rose : k.C.amber;
                        f.row.style.background = 'rgba(251,191,36,.07)';
                    } else if (retenido) {
                        f.tag.innerHTML = k.pill('idle', 'en espera');
                        f.fill.style.background = k.C.label;
                        f.row.style.background = '';
                    } else {
                        f.tag.innerHTML = k.pill('ok', 'se escribe');
                        f.fill.style.background = k.C.teal;
                        f.row.style.background = '';
                    }
                    f.fill.style.width = f.conf + '%';
                    f.pc.textContent = k.fmt(f.conf, 1) + '%';
                });

                /* Retener significa que no se escribe ni una línea: los campos
                   buenos quedan en espera, no entran a medias al destino. Lo que
                   una persona debe resolver sigue siendo solo lo dudoso. */
                var escritos = retenido ? 0 : sobre;
                var enCola = dudosos;

                kp.set(0, leidos + ' / ' + campos.length);
                kp.set(1, String(escritos), escritos ? 'up' : (retenido ? 'bad' : ''));
                kp.set(2, String(enCola), enCola ? 'warn' : '');

                if (leidos < campos.length) {
                    estado.innerHTML = k.pill('run', 'leyendo documento');
                } else if (retenido) {
                    estado.innerHTML = k.pill('bad', 'retenido: campo crítico dudoso');
                } else if (criticoDudoso) {
                    estado.innerHTML = k.pill('warn', 'carga parcial: crítico pendiente');
                } else if (dudosos) {
                    estado.innerHTML = k.pill('warn', 'escribe ' + escritos + ' de ' + campos.length);
                } else {
                    estado.innerHTML = k.pill('ok', 'escribe los ' + campos.length + ' campos');
                }

                if (ch) {
                    ch.data.datasets[0].data = [escritos, enCola];
                    ch.update();
                }
                box.cap(retenido
                    ? 'Campo crítico dudoso: no se escribe ninguna línea de este documento'
                    : escritos + ' campos entran solos, ' + enCola +
                      (enCola === 1 ? ' pasa por una persona' : ' pasan por una persona'));

                pintarRuta(d, politica);
                pintarPipe(d, escritos, retenido, criticoDudoso);
                pintarCola(u, retenido, leidos);
                pintarReparto(u);
                lectura(u, d, retenido, criticoDudoso, politica);
            }

            /* Mientras corre la lectura el recorrido lo maneja procesar(): aquí
               solo se pinta el estado de reposo, ya terminado. */
            function pintarPipe(d, escritos, retenido, criticoDudoso) {
                if (animando) return;
                pipe.set(0, 'done', 'evento de llegada');
                pipe.set(1, 'done', d.paginas + (d.paginas === 1 ? ' página' : ' páginas'));
                pipe.set(2, 'done', campos.length + ' campos mapeados');
                pipe.set(3, 'done', d.reglas + ' reglas aplicadas');
                pipe.set(4, retenido ? 'fail' : 'done', escritos + ' sobre el umbral');
                pipe.set(5, retenido ? 'fail' : 'done', retenido
                    ? 'nada escrito, documento retenido'
                    : escritos + ' campos a ' + d.destino + (criticoDudoso ? ' + crítico pendiente' : ''));
            }

            /* La cola contiene solo lo dudoso, con el motivo escrito. */
            function pintarCola(u, retenido, leidos) {
                var filas = [];
                campos.forEach(function (f) {
                    if (!f.leido || f.conf >= u) return;
                    filas.push([
                        { html: (f.critico ? k.pill('bad', 'crítico') + ' ' : '') + k.escapeHtml(f.nombre) },
                        f.valor,
                        k.fmt(f.conf, 1) + '%',
                        f.motivo
                    ]);
                });

                tCola.textContent = retenido
                    ? 'Cola de revisión — nada se escribe hasta resolverla'
                    : (filas.length ? 'Cola de revisión — solo lo dudoso' : 'Cola de revisión — vacía con este umbral');

                colaHost.innerHTML = '';
                if (!filas.length) {
                    var vacio = k.txt('div', 'mono', leidos
                        ? 'Sin cola: los ' + leidos + ' campos leídos superan el umbral de ' + u + '%.'
                        : 'Sin cola todavía: el documento no se ha leído.');
                    vacio.style.color = k.C.label;
                    vacio.style.fontSize = '12px';
                    vacio.style.padding = '14px 0';
                    colaHost.appendChild(vacio);
                    return;
                }
                colaHost.appendChild(k.table([
                    { t: 'Campo' }, { t: 'Valor leído' }, { t: 'Confianza', r: true }, { t: 'Por qué quedó en duda' }
                ], filas).node);
            }

            /* El mismo umbral aplicado a los tres documentos, para que se vea
               que la foto de celular llega mucho más sucia que el PDF. */
            function pintarReparto(u) {
                bars.clear();
                DOCS.forEach(function (d) {
                    var total = d.campos.length;
                    var solos = total - bajos(d, u);
                    var activo = d.id === docId;
                    bars.add(
                        d.corto + (activo ? ' · en pantalla' : ''),
                        solos, total,
                        activo ? k.C.teal : k.C.blue,
                        solos + ' de ' + total
                    );
                });
            }

            /* La consecuencia de mover el umbral y de la política, en dos líneas. */
            function lectura(u, d, retenido, criticoDudoso, politica) {
                var aqui = bajos(d, u);
                var alto = bajos(d, 90);
                var bajo = bajos(d, 60);
                var criticos = d.campos.filter(function (cp) { return cp[3]; })
                    .map(function (cp) { return cp[0]; }).join(' y ');

                ins.clear();
                ins.add('amber', '%',
                    'Con umbral <b>' + u + '%</b> pasan a una persona <b>' + aqui + '</b> de ' + d.campos.length +
                    ' campos de este documento. A 90% serían ' + alto + '; a 60%, solo ' + bajo +
                    ' y el resto entraría sin que nadie lo mire. Más alto: menos errores y más trabajo humano.');
                ins.add(criticoDudoso ? 'rose' : 'teal', '!',
                    'Campos críticos aquí: <b>' + k.escapeHtml(criticos) + '</b>. ' +
                    (criticoDudoso
                        ? (retenido
                            ? 'Uno cayó bajo el umbral y la política <b>retiene</b>: no se escribe ni una línea, el documento entero espera.'
                            : 'Uno cayó bajo el umbral y la política es <b>carga parcial</b>: entra lo cierto y el crítico queda marcado como pendiente en el destino.')
                        : (politica === 'retener'
                            ? 'Ninguno cayó bajo el umbral. Si alguno cayera, la política vigente <b>retendría el documento completo</b>: nada se escribe a medias. Suba el umbral a 90% para verlo.'
                            : 'Ninguno cayó bajo el umbral. Si alguno cayera, la política vigente <b>cargaría lo cierto</b> y dejaría solo el campo crítico pendiente. Suba el umbral a 90% para verlo.')));
                ins.add('cyan', '=',
                    'El mismo esquema lee las tres entradas, sin plantilla por proveedor. Lo que cambia es cuánta confianza trae cada campo: el renglón manuscrito de la foto nunca llegará tan limpio como el total impreso de la factura.');
            }

            /* Corrida animada: se ve al modelo leer campo por campo. Cambiar de
               documento a media corrida la invalida en vez de mezclar registros. */
            async function procesar() {
                var token = ++corrida;
                var pags = doc().paginas + (doc().paginas === 1 ? ' página' : ' páginas');
                animando = true;
                ctl.busy('run', true);
                /* Devuelve false si otra carga tomó el relevo mientras esperaba. */
                async function pausa(ms) { await k.wait(ms); return token === corrida; }
                try {
                    var d = doc();
                    campos.forEach(function (f) { f.leido = false; });
                    kp.set(3, '—', '');
                    pipe.reset();
                    aplicar();
                    log.clear();

                    pipe.set(0, 'done', 'evento de llegada');
                    log.push('in', 'Entrada: ' + d.origen);
                    if (!await pausa(280)) return;

                    pipe.set(1, 'run');
                    log.push('in', 'OCR: ' + pags + ' a texto, con la posición de cada palabra en la imagen');
                    if (!await pausa(300)) return;

                    pipe.set(1, 'done', pags);
                    pipe.set(2, 'run');
                    log.push('in', 'Modelo: mapeo del texto al esquema de ' + campos.length + ' campos');

                    for (var i = 0; i < campos.length; i++) {
                        if (!await pausa(170)) return;
                        campos[i].leido = true;
                        aplicar();
                    }
                    pipe.set(2, 'done', campos.length + ' campos mapeados');

                    pipe.set(3, 'run');
                    if (!await pausa(240)) return;
                    log.push('in', 'Reglas: ' + d.reglas + ' validaciones de formato, rango y coherencia entre campos');
                    pipe.set(3, 'done', d.reglas + ' reglas aplicadas');
                    if (!await pausa(220)) return;

                    var u = ctl.get('umbral');
                    var retiene = ctl.get('politica') === 'retener';
                    var dudosos = bajos(d, u);
                    var criticoDudoso = campos.some(function (f) { return f.critico && f.conf < u; });
                    kp.set(3, k.fmt(d.seg, 1) + ' s', '');
                    animando = false;
                    aplicar();

                    if (criticoDudoso && retiene) {
                        log.push('er', 'Campo crítico bajo ' + u + '%. Documento retenido: no se escribe nada en ' + d.destino);
                        log.push('wa', 'Cola de revisión: ' + dudosos + (dudosos === 1 ? ' campo dudoso' : ' campos dudosos') + ' con su recorte de imagen. El resto del documento espera junto con ellos.');
                    } else {
                        log.push('ok', 'Carga a ' + d.destino + ': ' + (campos.length - dudosos) + ' campos escritos con clave ' + d.clave);
                        if (criticoDudoso) {
                            log.push('wa', 'Campo crítico bajo ' + u + '%: queda marcado como pendiente en el destino, no se inventa el valor');
                        }
                        if (dudosos) {
                            log.push('wa', 'Cola de revisión: ' + dudosos + (dudosos === 1 ? ' campo' : ' campos') + ' bajo ' + u + '%, cada uno con su motivo y su recorte');
                        } else {
                            log.push('ok', 'Sin cola: todos los campos superaron el umbral');
                        }
                    }
                    log.push('hl', 'Original archivado sin modificar. Reprocesar la misma clave no duplica el registro.');
                } finally {
                    if (token === corrida) { animando = false; ctl.busy('run', false); }
                }
            }

            /* Cambio de documento: entra ya leído, nunca en blanco. */
            function cargar(id, conRegistro) {
                corrida++;
                animando = false;
                ctl.busy('run', false);
                docId = id;
                var d = doc();
                construir(d);
                campos.forEach(function (f) { f.leido = true; });
                kp.set(3, k.fmt(d.seg, 1) + ' s', '');
                aplicar();
                if (conRegistro) {
                    log.clear();
                    log.push('in', 'Documento cargado: ' + d.n);
                    log.push('ok', 'Última corrida reutilizada: ' + k.fmt(d.seg, 1) + ' s. Pulse Procesar para ver la lectura paso a paso.');
                }
            }

            ctl.on(function (get) {
                if (get('doc') !== docId) { cargar(get('doc'), true); return; }
                aplicar();
            });
            ctl.onClick('run', function () { procesar(); });

            cargar(DOCS[0].id, false);
            log.push('in', 'Documento cargado: ' + DOCS[0].n);
            log.push('ok', 'Última corrida: ' + k.fmt(DOCS[0].seg, 1) + ' s. Pulse Procesar para ver la lectura paso a paso.');
        }
    });
})();
