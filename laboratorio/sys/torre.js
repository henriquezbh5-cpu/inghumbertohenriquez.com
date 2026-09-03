(function () {
    'use strict';
    var LAB = window.LAB;

    /* El orden del arreglo ES la precedencia: gana la primera regla que
       coincide y las demás quedan como etiqueta secundaria del ticket.
       Las expresiones llevan bandera global porque se recorren buscando
       la primera coincidencia que no pise el texto de una regla anterior. */
    var REGLAS = [
        {
            id: 'acc', n: 'Acceso y credenciales', area: 'Seguridad y accesos', sla: 240, tono: 'cyan',
            hint: 'contraseña · acceso · bloqueado · VPN · MFA · password · senha',
            re: /contrase[nñ]a|clave de acceso|password|senha|credencia|acceso|acesso|desbloque|bloquead|doble factor|two[- ]factor|\bmfa\b|\bvpn\b|permiso|permission|iniciar sesi[oó]n|log ?in|sign in|restablec|resetear|\breset\b/gi
        },
        {
            id: 'inf', n: 'Infraestructura', area: 'Infraestructura y redes', sla: 120, tono: 'violet',
            hint: 'servidor · red · impresora · caído · lentitud · server · down',
            re: /servidor|server|\bred\b|network|wi-?fi|internet|impresora|printer|impressora|ca[ií]d[oa]|\bdown\b|outage|fora do ar|lentitud|lento|slow|disco|almacenamiento|storage|respaldo|backup|laptop|computadora|firewall|certificado/gi
        },
        {
            id: 'tal', n: 'Talento humano', area: 'Talento humano', sla: 1440, tono: 'teal',
            hint: 'vacaciones · planilla · constancia · contrato · férias · payroll',
            re: /vacacion|vacation|f[eé]rias|planilla|n[oó]mina|payroll|folha de pagamento|constancia|boleta de pago|payslip|contrataci[oó]n|contrato|onboarding|incapacidad|permiso personal|recursos humanos|aguinaldo|comprovante de pagamento/gi
        },
        {
            id: 'dat', n: 'Datos y reportes', area: 'Datos y analítica', sla: 960, tono: 'amber',
            hint: 'reporte · tablero · indicador · cifras · cuadre · dashboard',
            re: /reporte|report|relat[oó]rio|tablero|dashboard|indicador|\bkpi\b|m[eé]trica|consulta sql|\bsql\b|base de datos|database|extracci[oó]n de datos|exportar|cifras|cuadre/gi
        },
        {
            id: 'fac', n: 'Facturación', area: 'Cuentas por cobrar', sla: 480, tono: 'cyan',
            hint: 'factura · nota de crédito · cobro · saldo · invoice · fatura',
            re: /factura|invoice|fatura|cobranza|\bcobro\b|nota de cr[eé]dito|credit note|estado de cuenta|saldo|cuenta por cobrar|billing|recibo|\bpago\b|payment|pagamento|abono/gi
        },
        {
            id: 'gen', n: 'General', area: 'Mesa de servicio nivel 1', sla: 1440, tono: 'teal',
            hint: '', re: null
        }
    ];
    var GEN = REGLAS[REGLAS.length - 1];

    /* Marcas de urgencia: texto explícito, no adjetivos sueltos. */
    var CRIT = /producci[oó]n detenida|nadie puede trabajar|nobody can work|todos los usuarios|sistema ca[ií]do|est[aá] ca[ií]do|is down|outage|fora do ar|paralizad|emergencia|cr[ií]tic/i;
    var ALTA = /bloquead|blocked|no puedo (entrar|acceder|trabajar|ingresar)|cannot (log|access|work)|antes del cierre|antes de cierre|antes do fecho|hoy mismo|para hoy|urgente|\basap\b|vence (hoy|ma[ñn]ana)|deadline/i;

    var IDIOMAS = [
        { id: 'es', n: 'español', re: /\b(el|la|los|las|una|del|que|para|necesito|solicito|gracias|favor|puedo|d[ií]as|estamos|nos|con)\b/gi },
        { id: 'en', n: 'inglés', re: /\b(the|is|are|and|for|with|we|our|please|cannot|can|not|need|hello|issue|request|thanks|since)\b/gi },
        { id: 'pt', n: 'portugués', re: /\b(n[aã]o|obrigad[oa]|solicita[cç][aã]o|preciso|equipe|est[aá]|fecho|minhas?|meu|uma|do|da|das|dos)\b/gi }
    ];

    var MINIMO = 25;
    var PASOS = 5;

    /* Plantillas de primera respuesta, una por idioma de entrada. */
    var TXT = {
        es: {
            saludo: 'Buen día:',
            cuerpo: function (c) { return 'Recibimos su solicitud y la clasificamos como ' + c.cat.n + '. Queda a cargo de ' + c.cat.area + ' con prioridad ' + c.urg.toLowerCase() + '.'; },
            sla: function (c) { return 'Compromiso de primera respuesta: ' + c.sla + ', vence a las ' + c.vence + '. El caso quedó registrado como ' + c.folio + '.'; },
            crit: 'Por la severidad reportada se avisó a la guardia y el caso ya está en atención.',
            canal: { correo: 'Le respondemos por este mismo correo, no hace falta abrir otro caso.', formulario: 'El avance queda visible en el formulario de seguimiento con ese mismo número.', chat: 'Le seguimos escribiendo en este mismo chat hasta cerrar el caso.' },
            cierre: 'Quedamos atentos.'
        },
        en: {
            saludo: 'Hello,',
            cuerpo: function (c) { return 'We received your request and classified it as ' + c.cat.n + '. It is now with ' + c.cat.area + ', priority ' + c.urg.toLowerCase() + '.'; },
            sla: function (c) { return 'First response target: ' + c.sla + ', due at ' + c.vence + '. The case was logged as ' + c.folio + '.'; },
            crit: 'Given the reported severity the on-call team was paged and the case is already being handled.',
            canal: { correo: 'We will reply in this same email thread, there is no need to open another case.', formulario: 'Progress stays visible in the tracking form under that same case number.', chat: 'We will keep writing in this same chat until the case is closed.' },
            cierre: 'Thanks for your patience.'
        },
        pt: {
            saludo: 'Olá,',
            cuerpo: function (c) { return 'Recebemos a sua solicitação e a classificamos como ' + c.cat.n + '. Ficou com ' + c.cat.area + ', prioridade ' + c.urg.toLowerCase() + '.'; },
            sla: function (c) { return 'Prazo de primeira resposta: ' + c.sla + ', vence às ' + c.vence + '. O caso foi registrado como ' + c.folio + '.'; },
            crit: 'Pela severidade relatada a equipe de plantão foi avisada e o caso já está em atendimento.',
            canal: { correo: 'Respondemos neste mesmo e-mail, não é preciso abrir outro caso.', formulario: 'O andamento fica visível no formulário de acompanhamento com esse mesmo número.', chat: 'Seguimos escrevendo nesta mesma conversa até encerrar o caso.' },
            cierre: 'Ficamos à disposição.'
        }
    };

    /* Siguiente paso concreto por categoría, en los tres idiomas. */
    var PASO = {
        acc: { es: 'Para reactivar el acceso confirme su usuario y el sistema; la contraseña nunca se pide por escrito.', en: 'To restore access, confirm your username and the system; we never ask for your password in writing.', pt: 'Para restabelecer o acesso confirme o seu usuário e o sistema; a senha nunca é pedida por escrito.' },
        inf: { es: 'Ya abrimos la revisión del servicio afectado y confirmamos si el impacto alcanza a más usuarios.', en: 'We opened a check on the affected service and will confirm whether more users are impacted.', pt: 'Já abrimos a verificação do serviço afetado e vamos confirmar se o impacto atinge mais usuários.' },
        tal: { es: 'El equipo revisa su expediente y responde con el documento o la fecha que corresponde.', en: 'The team is reviewing your file and will reply with the document or the date that applies.', pt: 'A equipe revisa o seu cadastro e responde com o documento ou a data correspondente.' },
        dat: { es: 'Antes de rehacer el número confirmamos período y corte, para no comparar cifras de cortes distintos.', en: 'Before rebuilding the figure we confirm period and cut-off, so we do not compare different cut-offs.', pt: 'Antes de refazer o número confirmamos período e corte, para não comparar cortes diferentes.' },
        fac: { es: 'Adjunte la orden de compra relacionada: con ese dato se compara el monto y se emite la nota que corresponda.', en: 'Please attach the related purchase order: with it we compare the amount and issue the right note.', pt: 'Anexe a ordem de compra relacionada: com isso comparamos o valor e emitimos a nota correspondente.' },
        gen: { es: 'Ninguna regla del catálogo reconoció el asunto, así que una persona del nivel 1 lo lee y lo reasigna hoy mismo.', en: 'No catalogue rule matched this request, so a level 1 agent reads it and reassigns it today.', pt: 'Nenhuma regra do catálogo reconheceu o assunto, então uma pessoa do nível 1 lê e reencaminha ainda hoje.' }
    };

    var EJEMPLOS = [
        { b: 'Acceso bloqueado', t: 'Buenos días: no puedo entrar al sistema de compras, dice contraseña incorrecta y ya me bloqueó el usuario. Necesito el desbloqueo para trabajar hoy mismo.' },
        { b: 'Servidor caído (EN)', t: 'The file server is down and nobody can work at the branch office since 7 AM. Please treat this as an outage, the whole team is stopped.' },
        { b: 'Planilla (PT)', t: 'Preciso do comprovante de pagamento das minhas férias antes do fecho do mês. Não consigo encontrar o documento no portal da equipe.' },
        { b: 'Dos categorías a la vez', t: 'La impresora de facturación no responde y por eso no pude emitir la nota de crédito del cliente. Necesito el reporte de saldo pendiente antes del cierre.' },
        { b: 'Cifras que no cuadran', t: 'El tablero de ventas muestra cifras distintas al reporte de cierre. Necesito el cuadre antes del cierre de mes para firmar el informe.' },
        { b: 'Sin regla que aplique', t: 'Quisiera saber si el comedor de la sede central abre el sábado por la mañana y si hay que reservar con anticipación.' }
    ];

    /* Volumen sintético de la última semana, semilla fija: todo visitante
       ve exactamente los mismos números y las cifras de impacto salen de
       aquí, no de un texto suelto que contradiga la gráfica. */
    function datos() {
        var r = LAB.kit.rng(3311), tot = 0, aut = 0;
        var vol = REGLAS.map(function () {
            var total = 34 + Math.round(r() * 118);
            var auto = Math.round(total * (0.58 + r() * 0.3));
            tot += total; aut += auto;
            return { total: total, auto: auto, hum: total - auto };
        });
        return { vol: vol, total: tot, auto: aut, ratio: aut / tot * 100, folio: 4100 + Math.floor(r() * 690) };
    }
    var D = datos();

    function slaTxt(m) {
        if (m < 60) return m + ' min';
        return (m % 60 === 0) ? (m / 60) + ' h' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
    }
    /* Minutos desde medianoche a reloj de pared. */
    function reloj(m) {
        var t = ((m % 1440) + 1440) % 1440;
        return LAB.kit.pad(Math.floor(t / 60)) + ':' + LAB.kit.pad(t % 60);
    }
    function tinte(hex, a) {
        var n = parseInt(hex.slice(1), 16);
        return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    /* Motor de clasificación: reglas legibles, no modelo opaco.
       Una regla de menor precedencia que sólo coincide sobre el MISMO
       tramo de texto que ya consumió otra no cuenta como segunda
       categoría: sería contar dos veces la misma palabra. */
    function analizar(texto) {
        var t = texto || '', hits = [], i, m, re, ini, fin;

        function pisa(a, b) {
            return hits.some(function (h) { return a < h.fin && b > h.ini; });
        }
        for (i = 0; i < REGLAS.length; i++) {
            re = REGLAS[i].re;
            if (!re) continue;
            re.lastIndex = 0;
            while ((m = re.exec(t)) !== null) {
                ini = m.index; fin = ini + m[0].length;
                if (m[0].length === 0) { re.lastIndex++; continue; }
                if (!pisa(ini, fin)) { hits.push({ r: REGLAS[i], t: m[0], ini: ini, fin: fin }); break; }
            }
        }
        hits.sort(function (a, b) { return REGLAS.indexOf(a.r) - REGLAS.indexOf(b.r); });
        var cat = hits.length ? hits[0].r : GEN;

        var urg = { id: 'med', n: 'Media', tono: 'idle', t: null };
        m = CRIT.exec(t);
        if (m) {
            urg = { id: 'crit', n: 'Crítica', tono: 'bad', t: m[0] };
        } else {
            m = ALTA.exec(t);
            if (m) urg = { id: 'alt', n: 'Alta', tono: 'warn', t: m[0] };
        }

        /* La urgencia crítica recorta el SLA a 30 min; la alta lo parte a la mitad. */
        var sla = cat.sla;
        if (urg.id === 'crit') sla = 30;
        else if (urg.id === 'alt') sla = Math.round(cat.sla / 2);

        var marcas = IDIOMAS.map(function (l) { var x = t.match(l.re); return x ? x.length : 0; });
        var top = 0;
        for (i = 1; i < marcas.length; i++) if (marcas[i] > marcas[top]) top = i;
        var seguro = marcas[top] > 0;
        if (!seguro) top = 0;

        return { hits: hits, cat: cat, urg: urg, sla: sla, lang: IDIOMAS[top], seguro: seguro, marcas: marcas };
    }

    function borrador(a, canal, folio, vence) {
        var T = TXT[a.lang.id];
        var ctx = { cat: a.cat, urg: a.urg.n, sla: slaTxt(a.sla), folio: folio, vence: vence };
        var l = [T.saludo, T.cuerpo(ctx)];
        if (a.urg.id === 'crit') l.push(T.crit);
        l.push(PASO[a.cat.id][a.lang.id]);
        l.push(T.sla(ctx));
        l.push(T.canal[canal]);
        l.push(T.cierre);
        return l;
    }

    LAB.register({
        id: 'torre',
        name: 'TORRE',
        family: 'agentes',
        tagline: 'Ruteo de solicitudes',
        title: 'Clasificación y ruteo de solicitudes escritas',
        intro: 'Escriba una solicitud como la escribiría un usuario real. El agente decide categoría, urgencia, área y SLA, redacta la primera respuesta y muestra la regla y el término exacto que dispararon cada decisión.',
        spec: {
            trigger: 'Un correo a la cuenta de soporte, un formulario web o un mensaje de chat del usuario final. Cada entrada llega con su canal y el flujo arranca por evento, no por horario.',
            systems: 'Agente de lenguaje que normaliza e interpreta el texto, capa de reglas de negocio con precedencia declarada, mesa de servicio donde nace el ticket y directorio de áreas con su cola destino y su SLA.',
            output: 'Un ticket clasificado, priorizado y enrutado, con la traza de qué regla y qué término lo decidieron, más un borrador de primera respuesta en el idioma de entrada, editable antes de enviar.',
            failure: 'Si ninguna regla coincide, o si el texto es tan corto que no da contexto, el caso va al nivel 1 con la traza completa en lugar de adivinar una cola, y ese texto entra al lote de reentrenamiento del clasificador. Nunca se cierra solo un caso que el agente no entendió.'
        },
        impact: [
            [LAB.kit.pct(D.ratio, 0), 'tickets resueltos sin llegar a una persona'],
            ['9 s', 'desde que entra hasta que se enruta'],
            ['3 idiomas', 'de entrada, una sola cola de salida']
        ],

        render: function (host, k) {
            var folio = D.folio, corriendo = false;

            var ctl = k.controls([
                { k: 'texto', t: 'textarea', label: 'Solicitud del usuario', rows: 3, grow: true, value: EJEMPLOS[3].t },
                {
                    k: 'canal', t: 'select', label: 'Canal de entrada', value: 'correo',
                    options: [{ v: 'correo', t: 'Correo de soporte' }, { v: 'formulario', t: 'Formulario web' }, { v: 'chat', t: 'Chat interno' }]
                },
                { k: 'run', t: 'button', label: 'Clasificar', primary: true }
            ]);
            var ta = k.$('textarea', ctl.node);
            if (ta && ta.parentNode) ta.parentNode.style.flexBasis = '100%';
            host.appendChild(ctl.node);

            /* Ejemplos de un clic: rellenan la caja y clasifican de una vez. */
            var qs = k.el('div', 'qs');
            EJEMPLOS.forEach(function (e) {
                var b = k.txt('button', null, e.b);
                b.type = 'button';
                b.addEventListener('click', function () { ctl.set('texto', e.t); correr(); });
                qs.appendChild(b);
            });
            ctl.node.appendChild(qs);
            var pista = k.txt('div', 'mono', 'Se reclasifica mientras escribe, a partir de ' + MINIMO + ' caracteres; el canal también recalcula en vivo. El botón además anima la secuencia.');
            pista.style.cssText = 'margin-top:10px;font-size:11px;color:' + k.C.label;
            ctl.node.appendChild(pista);

            var kp = k.kpis([['Categoría', '—'], ['Prioridad', '—'], ['Área asignada', '—'], ['SLA comprometido', '—'], ['Vence a las', '—']]);
            host.appendChild(kp.node);

            var pipe = k.pipe([
                { n: 'Entrada', m: 'Canal y longitud' },
                { n: 'Idioma', m: 'Detección' },
                { n: 'Reglas', m: 'Categoría' },
                { n: 'Prioridad', m: 'Urgencia' },
                { n: 'Cola destino', m: 'Mesa de servicio' }
            ]);
            host.appendChild(pipe.node);

            var grid = k.el('div', 'grid2 wide-left');
            host.appendChild(grid);

            var izq = k.panel();
            izq.appendChild(k.txt('div', 'mono-head', 'Por qué decidió así'));
            var ins = k.insights();
            izq.appendChild(ins.node);
            grid.appendChild(izq);

            var der = k.panel();
            der.appendChild(k.txt('div', 'mono-head', 'Respuesta propuesta'));
            var chat = k.el('div', 'chat');
            /* el borrador es la conclusion de la demostracion: crece hasta
               mostrarse completo en vez de cortarse a media frase */
            chat.style.height = 'auto';
            chat.style.minHeight = '360px';
            der.appendChild(chat);
            grid.appendChild(der);

            /* Catálogo de reglas: la precedencia se ve, no se adivina. */
            var pcat = k.panel();
            pcat.appendChild(k.txt('div', 'mono-head', 'Catálogo de reglas y precedencia'));
            var rules = k.el('div', 'rules');
            var filas = REGLAS.map(function (r, i) {
                var row = k.el('div', 'rule-r');
                var a = k.el('div');
                a.appendChild(k.txt('div', 'rt', (i + 1) + '. ' + r.n));
                a.appendChild(k.txt('small', null, r.re ? ('Marcas: ' + r.hint) : 'Respaldo: entra cuando ninguna regla anterior coincide'));
                var b = k.el('div', 'rr');
                b.appendChild(k.txt('div', 'rc', r.area + ' · SLA base ' + slaTxt(r.sla)));
                var badge = k.el('span', null, k.pill('idle', 'sin evaluar'));
                b.appendChild(badge);
                row.appendChild(a);
                row.appendChild(b);
                rules.appendChild(row);
                return { row: row, badge: badge };
            });
            pcat.appendChild(rules);
            host.appendChild(pcat);

            var cb = k.chartbox('Ruteo de la última semana por área', '', '250px');
            host.appendChild(cb.node);
            var labels = REGLAS.map(function (r) { return r.area; });
            var ch = k.chart(cb.canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Resueltas por el agente', borderWidth: 0, borderRadius: 3,
                            data: D.vol.map(function (v) { return v.auto; }),
                            backgroundColor: labels.map(function () { return k.C.teal; })
                        },
                        {
                            label: 'Escaladas a una persona', borderWidth: 0, borderRadius: 3,
                            data: D.vol.map(function (v) { return v.hum; }),
                            backgroundColor: labels.map(function () { return k.C.violet; })
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    scales: {
                        x: Object.assign({ stacked: true, beginAtZero: true }, k.AXIS),
                        y: Object.assign({ stacked: true }, k.AXIS_BARE)
                    },
                    plugins: { legend: { position: 'bottom' } }
                }
            });

            var CAP_BASE = 'Volumen sintético de ' + k.fmt(D.total, 0) + ' solicitudes por cola destino. ' +
                k.pct(D.ratio, 0) + ' se cerraron sin llegar a una persona.';

            /* idx = -1 deja la gráfica sin resaltado. El pie se escribe
               siempre, aunque Chart.js no haya cargado. */
            function pintarChart(idx) {
                if (idx < 0) {
                    cb.cap(CAP_BASE);
                } else {
                    var v = D.vol[idx];
                    cb.cap('Resaltado: ' + labels[idx] + ' · ' + k.fmt(v.total, 0) + ' solicitudes la última semana, ' +
                        k.pct(v.auto / v.total * 100, 0) + ' cerradas sin llegar a una persona.');
                }
                if (!ch || !ch.canvas) return;
                ch.data.datasets[0].backgroundColor = labels.map(function (x, i) { return (idx < 0 || i === idx) ? k.C.teal : tinte(k.C.teal, 0.3); });
                ch.data.datasets[1].backgroundColor = labels.map(function (x, i) { return (idx < 0 || i === idx) ? k.C.violet : tinte(k.C.violet, 0.3); });
                /* 'none': el resaltado es un cambio discreto y se dispara en cada
                   tecla; animarlo encima de la animacion en vuelo rompe al
                   animador de Chart.js. */
                ch.update('none');
            }

            var CANAL_N = { correo: 'correo de soporte', formulario: 'formulario web', chat: 'chat interno' };

            /* Estado explícito cuando el texto no da para decidir: el agente
               prefiere no clasificar antes que inventar una cola. */
            function insuficiente(n) {
                [0, 1, 2, 3, 4].forEach(function (i) { kp.set(i, '—', 'warn'); });
                pipe.reset();
                pipe.set(0, 'fail', k.fmt(n, 0) + ' de ' + MINIMO + ' car.');
                filas.forEach(function (f) {
                    f.badge.innerHTML = k.pill('idle', 'sin evaluar');
                    f.row.style.background = '';
                });
                ins.clear();
                ins.add('amber', '!', 'El texto lleva <b>' + k.fmt(n, 0) + ' de ' + MINIMO + ' caracteres</b> mínimos. Con menos contexto el clasificador no dispara: un ticket mal enrutado cuesta más que uno que espera. Siga escribiendo o use un ejemplo.');
                ins.add('cyan', '¶', 'Este umbral es la misma defensa que corre en producción contra correos vacíos, firmas automáticas y respuestas de un solo «gracias».');
                chat.innerHTML = '';
                chat.appendChild(k.txt('div', 'msg a', 'Sin borrador: el agente no redacta una primera respuesta sobre una solicitud que no entendió.'));
                pintarChart(-1);
            }

            /* Redibuja todo el estado a partir de un análisis. */
            function aplicar(texto, a) {
                var canal = ctl.get('canal');
                var idx = REGLAS.indexOf(a.cat);
                var canalN = CANAL_N[canal];
                var recibido = 8 * 60 + (folio % 241);
                var venceTxt = reloj(recibido + a.sla);

                kp.set(0, a.cat.n, a.cat.id === 'gen' ? 'warn' : '');
                kp.set(1, '', a.urg.id === 'crit' ? 'bad' : (a.urg.id === 'alt' ? 'warn' : ''));
                kp.html(1, k.pill(a.urg.tono, a.urg.n));
                kp.set(2, a.cat.area, a.cat.id === 'gen' ? 'warn' : '');
                kp.set(3, slaTxt(a.sla), a.urg.id === 'crit' ? 'bad' : 'up');
                kp.set(4, venceTxt, a.urg.id === 'crit' ? 'bad' : '');

                pipe.set(0, 'done', canalN + ' · ' + k.fmt(texto.trim().length, 0) + ' car.');
                pipe.set(1, a.seguro ? 'done' : 'fail', a.lang.n + ' · ' + k.fmt(a.marcas[IDIOMAS.indexOf(a.lang)], 0) + ' marcas');
                pipe.set(2, a.cat.id === 'gen' ? 'fail' : 'done', a.cat.n);
                pipe.set(3, 'done', a.urg.n);
                pipe.set(4, a.cat.id === 'gen' ? 'fail' : 'done', a.cat.area);

                filas.forEach(function (f, i) {
                    var r = REGLAS[i];
                    var coincide = a.hits.some(function (h) { return h.r === r; });
                    var tono = 'idle', etiqueta = r.re ? 'sin coincidencia' : 'respaldo en espera';
                    if (r === a.cat) {
                        tono = 'ok';
                        etiqueta = r.re ? 'regla asignada' : 'respaldo activo';
                    } else if (coincide) {
                        tono = 'warn';
                        etiqueta = 'coincide, cede por precedencia';
                    }
                    f.badge.innerHTML = k.pill(tono, etiqueta);
                    f.row.style.background = (r === a.cat) ? tinte(k.C.teal, 0.07) : '';
                });

                ins.clear();
                a.hits.forEach(function (h, i) {
                    ins.add(h.r.tono, '»',
                        'Regla <b>' + k.escapeHtml(h.r.n) + '</b> (precedencia ' + (REGLAS.indexOf(h.r) + 1) + ') coincidió con el término «' +
                        k.escapeHtml(h.t) + '»' +
                        (i === 0 ? ', y por ser la de mayor precedencia define el área <b>' + k.escapeHtml(h.r.area) + '</b>.' : '.'));
                });
                if (!a.hits.length) {
                    ins.add('rose', '?',
                        'Ninguna regla del catálogo coincidió. El caso se enruta al <b>nivel 1</b> con la traza completa en lugar de adivinar una cola, y este texto entra al lote de reentrenamiento del clasificador.');
                }
                ins.add('cyan', '¶',
                    a.seguro
                        ? 'Idioma de entrada: <b>' + a.lang.n + '</b> (' + a.marcas[0] + ' marcas de español, ' + a.marcas[1] +
                          ' de inglés, ' + a.marcas[2] + ' de portugués). Los tres diccionarios se evalúan a la vez y la cola de salida es una sola.'
                        : 'Ninguno de los tres diccionarios encontró marcas suficientes, así que la respuesta sale en <b>español</b> por defecto y el ticket queda etiquetado para revisión de idioma antes de enviarse.');
                ins.add(a.urg.id === 'crit' ? 'rose' : (a.urg.id === 'alt' ? 'amber' : 'green'), '!',
                    a.urg.t
                        ? 'Prioridad <b>' + a.urg.n + '</b> por el término «' + k.escapeHtml(a.urg.t) + '». ' +
                          (a.urg.id === 'crit'
                              ? 'El SLA base de ' + slaTxt(a.cat.sla) + ' se recorta a <b>30 min</b> y se avisa a la guardia.'
                              : 'El SLA base de ' + slaTxt(a.cat.sla) + ' se parte a la mitad: <b>' + slaTxt(a.sla) + '</b>.')
                        : 'Prioridad <b>Media</b>: ninguna marca de urgencia en el texto, así que se respeta el SLA base de <b>' +
                          slaTxt(a.cat.sla) + '</b> sin inflar la cola.');
                if (a.hits.length > 1) {
                    ins.add('violet', '=',
                        'Hay <b>' + a.hits.length + ' categorías posibles</b> (' +
                        k.escapeHtml(a.hits.map(function (h) { return h.r.n; }).join(', ')) +
                        '). Se tomó la de mayor precedencia y las otras quedan como etiqueta secundaria del ticket, visibles para quien lo atienda.');
                } else if (a.hits.length === 1) {
                    ins.add('violet', '=',
                        'Una sola categoría posible: no hubo que desempatar. Cuando coinciden dos o más manda el orden del catálogo, nunca el azar, y una regla que sólo repite el término ya consumido por otra no cuenta como segunda categoría.');
                }

                chat.innerHTML = '';
                var mu = k.txt('div', 'msg u', texto.trim());
                mu.appendChild(k.txt('span', 'src', 'Entrada por ' + canalN + ' · recibido ' + reloj(recibido)));
                chat.appendChild(mu);
                var ma = k.el('div', 'msg a');
                borrador(a, canal, 'TK-2026-' + folio, venceTxt).forEach(function (linea, i) {
                    var p = k.txt('div', null, linea);
                    if (i) p.style.marginTop = '9px';
                    ma.appendChild(p);
                });
                ma.appendChild(k.txt('span', 'src',
                    'Borrador editable antes de enviar · plantilla ' + a.lang.id + ' · caso TK-2026-' + folio + ' · SLA ' + slaTxt(a.sla) + ' · vence ' + venceTxt));
                chat.appendChild(ma);
                chat.scrollTop = 0;

                pintarChart(idx);
            }

            /* Cualquier cambio de control recalcula sin pulsar nada. */
            function vivo() {
                var t = ctl.get('texto') || '';
                var n = t.trim().length;
                if (n < MINIMO) { insuficiente(n); return; }
                aplicar(t, analizar(t));
            }
            ctl.on(vivo);

            /* Corrida animada: se ve el orden en que el agente decide. */
            async function correr() {
                if (corriendo) return;
                var t = ctl.get('texto') || '';
                if (t.trim().length < MINIMO) { insuficiente(t.trim().length); return; }
                corriendo = true;
                ctl.busy('run', true);
                try {
                    var a = analizar(t);
                    folio++;
                    pipe.reset();
                    for (var i = 0; i < PASOS; i++) {
                        pipe.set(i, 'run');
                        await k.wait(230);
                    }
                    aplicar(t, a);
                } finally {
                    corriendo = false;
                    ctl.busy('run', false);
                }
            }
            ctl.onClick('run', correr);

            /* Abre trabajando: el ejemplo cargado ya viene clasificado. */
            vivo();
        }
    });
})();
