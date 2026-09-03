/* RELEVO — alta, baja y traslado de personal: doce pasos sobre siete
   sistemas, con el orden y los modos de falla que hacen la diferencia. */
(function () {
    'use strict';
    var LAB = window.LAB;

    /* ---------- los siete sistemas que toca el movimiento ---------- */
    var SIS = [
        { n: 'Directorio', m: 'Identidad y accesos' },
        { n: 'Licencias', m: 'Suscripciones' },
        { n: 'Correo', m: 'Buzón y firma' },
        { n: 'Planilla', m: 'Nómina' },
        { n: 'ERP', m: 'Finanzas y activos' },
        { n: 'Carpetas', m: 'Archivos de red' },
        { n: 'Expediente', m: 'Documental' }
    ];
    var DIR = 0, LIC = 1, COR = 2, PLA = 3, ERP = 4, CAR = 5, EXP = 6;

    /* g marca los pasos que piden firma extra según el perfil: 'car' es la
       primera que se exige, 'lic' la segunda. Así el conteo de firmas del
       resumen y las que aparecen en la bitácora siempre coinciden. */

    /* Alta: se construye de adentro hacia afuera. */
    var ALTA = [
        { n: 'Validar expediente y documentos', s: EXP, d: function () { return '12 documentos completos, 0 observaciones'; } },
        { n: 'Crear usuario en el directorio', s: DIR, d: function (x) { return 'usuario ' + x.usuario + ' creado, MFA obligatorio en el primer inicio'; } },
        { n: 'Asignar licencias del perfil', s: LIC, g: 'lic', d: function (x) { return x.lic + ' licencias asignadas según el perfil ' + x.perfil.toLowerCase(); } },
        { n: 'Crear buzón y firma corporativa', s: COR, d: function () { return 'buzón activo y firma con cargo y área'; } },
        { n: 'Alta en planilla', s: PLA, d: function (x) { return 'registro de planilla con fecha efectiva ' + x.fecha; } },
        { n: 'Asignar centro de costo', s: ERP, d: function (x) { return 'centro de costo ' + x.ccFin + ' ligado al área ' + x.areaFin.toLowerCase(); } },
        { n: 'Crear perfil en el ERP', s: ERP, d: function (x) { return 'perfil ' + x.perfil.toLowerCase() + ' creado, sin permisos de pago'; } },
        { n: 'Permisos de carpetas por área', s: CAR, g: 'car', d: function (x) { return x.carFin + ' grupos de carpetas otorgados, ninguno heredado'; } },
        { n: 'Registrar equipo asignado', s: ERP, d: function (x) { return 'equipo ' + x.serie + ' registrado y firmado en acta'; } },
        { n: 'Enrolar en capacitación obligatoria', s: DIR, d: function (x) { return x.cursos + ' cursos asignados con vencimiento a 30 días'; } },
        { n: 'Notificar a jefatura y seguridad', s: COR, d: function () { return 'aviso enviado con acuse a jefatura y seguridad'; } },
        { n: 'Generar expediente digital', s: EXP, d: function () { return 'expediente con 12 sellos de tiempo y firma del flujo'; } }
    ];

    /* Baja: acciones inversas, no la lista al revés. Primero se cierra el
       acceso, al final se toca dinero y archivo. */
    var BAJA = [
        { n: 'Registrar fecha efectiva', s: EXP, d: function (x) { return 'fecha efectiva ' + x.fecha + ' registrada y notificada'; } },
        { n: 'Bloquear usuario en el directorio', s: DIR, d: function (x) { return x.usuario + ' bloqueado, sesiones y tokens activos cerrados'; } },
        { n: 'Revocar licencias', s: LIC, g: 'lic', d: function (x) { return x.lic + ' licencias devueltas al pool disponible'; } },
        { n: 'Reenviar buzón a la jefatura', s: COR, d: function () { return 'reenvío por 90 días y respuesta automática activa'; } },
        { n: 'Cerrar accesos al ERP', s: ERP, d: function () { return 'perfil y aprobaciones del ERP dados de baja'; } },
        { n: 'Retirar permisos de carpetas', s: CAR, g: 'car', d: function (x) { return x.carIni + ' grupos retirados, 0 permisos directos remanentes'; } },
        { n: 'Baja en planilla', s: PLA, d: function (x) { return 'baja de planilla con fecha efectiva ' + x.fecha; } },
        { n: 'Registrar devolución de equipo', s: ERP, d: function (x) { return 'equipo ' + x.serie + ' devuelto, verificado y borrado'; } },
        { n: 'Liquidar vacaciones pendientes', s: PLA, d: function (x) { return x.vac + ' días pendientes enviados a liquidación'; } },
        { n: 'Reasignar tickets abiertos', s: ERP, d: function (x) { return x.tickets + ' tickets reasignados a la jefatura del área'; } },
        { n: 'Notificar a seguridad y nómina', s: COR, d: function () { return 'aviso con acuse a seguridad y a nómina'; } },
        { n: 'Archivar expediente', s: EXP, d: function () { return 'expediente cerrado con retención de 5 años'; } }
    ];

    /* Traslado: la identidad se conserva; lo que cambia es todo lo que
       cuelga de ella. Se retira antes de otorgar, nunca al revés. */
    var CAMBIO = [
        { n: 'Validar aprobación de ambas jefaturas', s: EXP, d: function () { return 'origen y destino firmaron, sin observaciones'; } },
        { n: 'Marcar la cuenta en traslado', s: DIR, d: function (x) { return x.usuario + ' marcado en traslado, la sesión sigue activa'; } },
        { n: 'Retirar carpetas del área de origen', s: CAR, d: function (x) { return x.carIni + ' grupos del área ' + x.areaIni.toLowerCase() + ' retirados'; } },
        { n: 'Otorgar carpetas del área destino', s: CAR, g: 'car', d: function (x) { return x.carFin + ' grupos del área ' + x.areaFin.toLowerCase() + ' otorgados'; } },
        { n: 'Ajustar licencias al nuevo perfil', s: LIC, g: 'lic', d: function (x) { return 'licencias ajustadas a ' + x.lic + ' según el perfil ' + x.perfil.toLowerCase(); } },
        { n: 'Cambiar el centro de costo', s: ERP, d: function (x) { return 'centro de costo ' + x.ccIni + ' sustituido por ' + x.ccFin; } },
        { n: 'Reasignar aprobaciones y suplencias', s: ERP, d: function () { return 'cadena de aprobación movida a la jefatura destino'; } },
        { n: 'Actualizar cargo, área y firma', s: COR, d: function (x) { return 'firma de correo regenerada con el área ' + x.areaFin.toLowerCase(); } },
        { n: 'Recalcular planilla desde la fecha efectiva', s: PLA, d: function (x) { return 'planilla recalculada a partir del ' + x.fecha; } },
        { n: 'Transferir tickets y pendientes del puesto', s: ERP, d: function (x) { return x.tickets + ' tickets transferidos con historial completo'; } },
        { n: 'Notificar a ambas jefaturas y a seguridad', s: COR, d: function () { return 'aviso con acuse a origen, destino y seguridad'; } },
        { n: 'Cerrar el expediente de traslado', s: EXP, d: function () { return 'expediente de traslado cerrado con 12 sellos de tiempo'; } }
    ];

    /* Cada movimiento define su propia ventana crítica: el tramo de pasos
       donde una demora se paga cara, y por qué. */
    var MOV = {
        alta: {
            t: 'Alta', corto: 'alta', pill: 'ok', lista: ALTA,
            orden: 'de construcción, identidad primero',
            vent: { a: 0, b: 3, t: 'de la firma a la primera sesión útil' },
            fecha: '15/09/2026'
        },
        baja: {
            t: 'Baja', corto: 'baja', pill: 'warn', lista: BAJA,
            orden: 'inverso, accesos primero',
            vent: { a: 1, b: 5, t: 'entre bloquear el usuario y retirar las carpetas' },
            fecha: '30/09/2026'
        },
        cambio: {
            t: 'Cambio de área', corto: 'traslado', pill: 'idle', lista: CAMBIO,
            orden: 'retirar antes de otorgar',
            vent: { a: 1, b: 3, t: 'entre marcar el traslado y cerrar el cambio de carpetas' },
            fecha: '01/10/2026'
        }
    };

    /* Tres clases de falla distintas, porque el flujo responde distinto a
       cada una: se reintenta, se abre ticket o se agenda. */
    var REAPERTURA = '03/10/2026';
    var FALLAS = {
        ninguna: { t: 'Ninguna, todo responde', marca: 'ninguna', sis: -1, modo: 'ninguno', seg: 0 },
        espera: {
            t: 'Directorio sin respuesta', marca: 'reintento', sis: DIR, modo: 'reintento', seg: 30,
            er: 'no responde: tiempo de espera agotado a los 30 s'
        },
        cupo: {
            t: 'Pool de licencias agotado', marca: 'ticket', sis: LIC, modo: 'ticket', seg: 95,
            er: 'rechaza la operación: el pool del perfil quedó en cero'
        },
        cierre: {
            t: 'Planilla en cierre contable', marca: 'diferido', sis: PLA, modo: 'diferido', seg: 12,
            er: 'no acepta escrituras: cierre contable en curso'
        }
    };

    /* ---------- datos sintéticos con semilla fija ---------- */
    function datos() {
        var r = LAB.kit.rng(8802), i;
        var d = { alta: [], baja: [], cambio: [] };
        for (i = 0; i < 12; i++) d.alta.push({ seg: Math.round(24 + r() * 60), man: Math.round(8 + r() * 22) });
        for (i = 0; i < 12; i++) d.baja.push({ seg: Math.round(22 + r() * 58), man: Math.round(9 + r() * 24) });
        for (i = 0; i < 12; i++) d.cambio.push({ seg: Math.round(26 + r() * 55), man: Math.round(10 + r() * 21) });
        d.carpetas = {
            'Finanzas': 5 + Math.round(r() * 2), 'Operaciones': 6 + Math.round(r() * 3),
            'Comercial': 4 + Math.round(r() * 2), 'Tecnología': 7 + Math.round(r() * 3)
        };
        d.serie = 'PC-' + (2400 + Math.floor(r() * 900));
        d.vac = 6 + Math.round(r() * 12);
        d.tickets = 3 + Math.round(r() * 8);
        d.folio = 'MP-2026-0' + (400 + Math.floor(r() * 90));
        d.ticket = 'SD-' + (7400 + Math.floor(r() * 500));
        return d;
    }
    var D = datos();

    var AREAS = ['Finanzas', 'Operaciones', 'Comercial', 'Tecnología'];
    var CC = { 'Finanzas': 'CC-1100', 'Operaciones': 'CC-2400', 'Comercial': 'CC-3200', 'Tecnología': 'CC-4100' };
    var FA = { 'Finanzas': 1.00, 'Operaciones': 1.08, 'Comercial': 0.96, 'Tecnología': 1.14 };
    var FP = { 'Analista': 1.00, 'Jefatura': 1.12, 'Dirección': 1.25 };
    var FIRMAS = { 'Analista': 0, 'Jefatura': 1, 'Dirección': 2 };
    var FIRMA_SEG = 42, FIRMA_MAN = 38;

    function dur(s) {
        var m = Math.floor(s / 60), q = s % 60;
        return m ? m + ' min ' + LAB.kit.pad(q) + ' s' : q + ' s';
    }
    function corto(s) {
        var m = Math.floor(s / 60), q = s % 60;
        return m ? m + ' m ' + LAB.kit.pad(q) + ' s' : q + ' s';
    }
    function horas(m) {
        var h = Math.floor(m / 60), q = Math.round(m % 60);
        return h ? h + ' h ' + q + ' min' : q + ' min';
    }
    /* usuario derivado del nombre; tabla de acentos en lugar de normalize
       para no depender de rangos Unicode escritos a mano */
    var ACENTOS = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' };
    function usuario(nombre) {
        var p = String(nombre || '').trim().split(/\s+/).filter(function (t) { return t.length; });
        if (!p.length) return 'sin.usuario';
        var s = (p[0].charAt(0) + '.' + p[p.length - 1]).toLowerCase(), out = '', i, c;
        for (i = 0; i < s.length; i++) {
            c = ACENTOS[s.charAt(i)] || s.charAt(i);
            if (/[a-z0-9.]/.test(c)) out += c;
        }
        return out || 'sin.usuario';
    }

    LAB.register({
        id: 'relevo',
        name: 'RELEVO',
        family: 'procesos',
        tagline: 'Alta y baja de personal',
        title: 'Alta, baja y traslado sin accesos huérfanos',
        intro: 'Un formulario aprobado dispara doce pasos sobre siete sistemas. Elige el movimiento, el perfil y qué sistema se cae: el orden cambia, y con él la ventana en que un acceso queda abierto sin dueño.',
        spec: {
            trigger: 'Formulario de movimiento de personal aprobado por la jefatura: alta, baja o cambio de área.',
            systems: 'Directorio corporativo, licencias, correo, planilla, ERP y carpetas de red, orquestados con Power Automate contra una tabla de control en SQL Server.',
            output: 'Expediente digital con bitácora firmada paso por paso: sistema tocado, hora, resultado y responsable.',
            failure: 'Tres respuestas distintas. Si el sistema no contesta, reintento con espera progresiva de 30 s, 90 s y 5 min. Si rechaza la operación, ticket con el número de paso exacto y el movimiento nunca se marca completo. Si está en cierre, el paso se agenda a la reapertura y el resto de la secuencia continúa.'
        },
        impact: [
            ['1 de cada 3', 'altas llegaban incompletas antes'],
            ['bajo 15 min', 'de la firma al expediente cerrado'],
            ['0', 'accesos activos tras la fecha efectiva']
        ],
        render: function (host, k) {
            var corriendo = false;

            var ctl = k.controls([
                { k: 'nombre', t: 'text', label: 'Colaborador', value: 'María Elena Portillo', grow: true },
                { k: 'mov', t: 'select', label: 'Movimiento', options: [{ v: 'alta', t: 'Alta' }, { v: 'baja', t: 'Baja' }, { v: 'cambio', t: 'Cambio de área' }], value: 'alta' },
                { k: 'area', t: 'select', label: 'Área', options: AREAS, value: 'Finanzas' },
                { k: 'destino', t: 'select', label: 'Área destino', options: AREAS, value: 'Tecnología' },
                { k: 'perfil', t: 'select', label: 'Perfil', options: ['Analista', 'Jefatura', 'Dirección'], value: 'Analista' },
                {
                    k: 'falla', t: 'select', label: 'Falla simulada', value: 'ninguna',
                    options: [{ v: 'ninguna', t: 'Ninguna' }, { v: 'espera', t: 'Directorio sin respuesta' },
                    { v: 'cupo', t: 'Licencias sin cupo' }, { v: 'cierre', t: 'Planilla en cierre' }]
                },
                { k: 'run', t: 'button', label: 'Ejecutar movimiento', primary: true }
            ]);
            host.appendChild(ctl.node);
            /* el campo de destino solo tiene sentido en el traslado */
            var campoDestino = ctl.node.querySelectorAll('.field')[3];

            var kp = k.kpis([
                ['Pasos ejecutados', '0 de 12', ''],
                ['Sistemas escritos', '0 de 7', ''],
                ['Tiempo del flujo', '—', 'up'],
                ['Equivalente manual', '—', 'warn']
            ]);
            host.appendChild(kp.node);

            var pnPipe = k.panel();
            pnPipe.appendChild(k.txt('div', 'mono-head', 'Sistemas conectados — pasos planificados'));
            var pipe = k.pipe(SIS);
            pnPipe.appendChild(pipe.node);
            host.appendChild(pnPipe);

            var g1 = k.el('div', 'grid2 wide-left');
            var pnPasos = k.panel();
            var hPasos = k.txt('div', 'mono-head', 'Secuencia');
            pnPasos.appendChild(hPasos);
            var hostPasos = k.el('div');
            pnPasos.appendChild(hostPasos);
            var pnLog = k.panel();
            pnLog.appendChild(k.txt('div', 'mono-head', 'Bitácora firmada'));
            var log = k.log('432px');
            pnLog.appendChild(log.node);
            g1.appendChild(pnPasos);
            g1.appendChild(pnLog);
            host.appendChild(g1);

            var g2 = k.el('div', 'grid2');
            var pnFicha = k.panel();
            pnFicha.appendChild(k.txt('div', 'mono-head', 'Expediente del movimiento'));
            var campos = fichaCampos(k, ['Colaborador', 'Movimiento', 'Área', 'Perfil', 'Usuario',
                'Licencias', 'Carpetas de red', 'Centro de costo', 'Fecha efectiva', 'Falla simulada', 'Cierre']);
            pnFicha.appendChild(campos.node);
            g2.appendChild(pnFicha);
            var cb = k.chartbox('Carga por sistema', 'minutos de flujo contra minutos de trabajo humano', '300px');
            g2.appendChild(cb.node);
            host.appendChild(g2);

            var ins = k.insights();
            var pnIns = k.panel();
            pnIns.appendChild(k.txt('div', 'mono-head', 'Lectura del flujo'));
            pnIns.appendChild(ins.node);
            host.appendChild(pnIns);

            var st = null, ch = null, ctx = null;

            /* ---------- cálculo del escenario ---------- */
            function calcular() {
                var mv = ctl.get('mov'), m = MOV[mv] || MOV.alta;
                var area = ctl.get('area'), destino = ctl.get('destino'), perfil = ctl.get('perfil');
                var f = FALLAS[ctl.get('falla')] || FALLAS.ninguna;
                var esCambio = mv === 'cambio';
                var areaFin = esCambio ? destino : area;
                var firmas = FIRMAS[perfil] || 0;
                var fac = (FA[areaFin] || 1) * (FP[perfil] || 1);
                var base = m === MOV.baja ? D.baja : (esCambio ? D.cambio : D.alta);
                var pasos = [], botSeg = 0, manMin = 0, cuenta = [0, 0, 0, 0, 0, 0, 0], i, p, gate;

                for (i = 0; i < 12; i++) {
                    p = m.lista[i];
                    /* la firma extra se cobra en el paso que la exige: así el
                       tiempo, la gráfica y la bitácora cuentan lo mismo */
                    gate = (p.g === 'car' && firmas >= 1) || (p.g === 'lic' && firmas >= 2);
                    var seg = Math.round(base[i].seg * fac) + (gate ? FIRMA_SEG : 0);
                    var man = Math.round(base[i].man * fac) + (gate ? FIRMA_MAN : 0);
                    pasos.push({ n: p.n, sis: p.s, seg: seg, man: man, firma: gate, d: p.d });
                    botSeg += seg; manMin += man; cuenta[p.s]++;
                }

                /* pasos que golpea la falla: uno solo salvo el cierre contable,
                   que bloquea todas las escrituras de ese sistema */
                var iFalla = -1, nFalla = 0;
                if (f.sis >= 0) {
                    for (i = 0; i < pasos.length; i++) {
                        if (pasos[i].sis !== f.sis) continue;
                        if (iFalla < 0) iFalla = i;
                        if (f.modo === 'diferido') nFalla++;
                    }
                    if (f.modo !== 'diferido') nFalla = iFalla >= 0 ? 1 : 0;
                }

                var nombre = ctl.get('nombre') || 'Sin nombre';
                var invalido = esCambio && area === destino;
                var lic = 3 + (perfil === 'Analista' ? 0 : perfil === 'Jefatura' ? 1 : 2) + (areaFin === 'Tecnología' ? 1 : 0);
                var c = {
                    m: m, mv: mv, esCambio: esCambio, perfil: perfil, nombre: nombre,
                    areaIni: area, areaFin: areaFin, invalido: invalido,
                    pasos: pasos, botSeg: botSeg, manMin: manMin, firmas: firmas, cuenta: cuenta,
                    falla: f, iFalla: iFalla, nFalla: nFalla, extraSeg: f.seg * nFalla,
                    usuario: usuario(nombre), lic: lic,
                    carIni: D.carpetas[area] || 5, carFin: D.carpetas[areaFin] || 5,
                    ccIni: CC[area] || 'CC-1100', ccFin: CC[areaFin] || 'CC-1100',
                    cursos: 4 + firmas, serie: D.serie, vac: D.vac, tickets: D.tickets,
                    fecha: m.fecha
                };
                c.etiquetaArea = esCambio ? area + ' hacia ' + destino : area;
                c.txtLic = esCambio ? 'ajuste a ' + lic + ' del perfil'
                    : c.lic + (mv === 'alta' ? ' por asignar' : ' por revocar');
                c.txtCar = esCambio ? c.carIni + ' por retirar, ' + c.carFin + ' por otorgar'
                    : c.carFin + (mv === 'alta' ? ' grupos por otorgar' : ' grupos por retirar');
                c.txtCC = esCambio ? c.ccIni + ' hacia ' + c.ccFin : c.ccFin;
                c.proy = proyeccion(c);
                return c;
            }

            /* Cierre esperado antes de correr: el visitante ve el desenlace
               que produce cada falla sin tener que ejecutar. */
            function proyeccion(c) {
                if (c.invalido) return { hechos: 0, tono: 'bad', et: 'rechazado', t: 'rechazado en la validación' };
                if (c.falla.modo === 'ticket') return { hechos: 11, tono: 'bad', et: 'incompleto', t: '11 de 12 pasos, 1 con ticket abierto' };
                if (c.falla.modo === 'diferido') return { hechos: 12 - c.nFalla, tono: 'warn', et: 'diferido', t: (12 - c.nFalla) + ' de 12 pasos, ' + c.nFalla + ' agendados al ' + REAPERTURA };
                if (c.falla.modo === 'reintento') return { hechos: 12, tono: 'warn', et: 'con reintento', t: '12 de 12 pasos, 1 recuperado en el reintento' };
                return { hechos: 12, tono: 'ok', et: 'completo', t: '12 de 12 pasos firmados' };
            }

            function ventana(c) {
                var v = c.m.vent, a = 0, b = 0, i;
                for (i = v.a; i <= v.b && i < c.pasos.length; i++) { a += c.pasos[i].man; b += c.pasos[i].seg; }
                return { man: a, bot: b, t: v.t };
            }

            /* ---------- pintado ---------- */
            function pintarPasos(c) {
                hostPasos.innerHTML = '';
                st = k.steps(c.pasos.map(function (p) {
                    return { n: p.n + (p.firma ? ' (firma extra)' : ''), ms: corto(p.seg) };
                }));
                hostPasos.appendChild(st.node);
                hPasos.textContent = 'Secuencia — ' + c.m.corto + ', orden ' + c.m.orden;
            }

            function pintarPipe(c) {
                var i, t;
                for (i = 0; i < SIS.length; i++) {
                    t = c.cuenta[i] + (c.cuenta[i] === 1 ? ' paso' : ' pasos');
                    if (c.falla.sis === i) t += ' · falla simulada';
                    pipe.set(i, '', t);
                }
            }

            function pintarFicha(c) {
                campos.set(0, c.nombre, k.pill('idle', D.folio));
                campos.set(1, c.m.t, k.pill(c.m.pill, c.m.corto));
                campos.set(2, c.etiquetaArea, c.invalido ? k.pill('bad', 'sin cambio') : '');
                campos.set(3, c.perfil, c.firmas
                    ? k.pill('warn', c.firmas === 1 ? '1 firma extra' : c.firmas + ' firmas extra')
                    : k.pill('idle', 'sin firmas'));
                campos.set(4, c.usuario, '');
                campos.set(5, c.txtLic, '');
                campos.set(6, c.txtCar, '');
                campos.set(7, c.txtCC, '');
                campos.set(8, c.fecha, '');
                campos.set(9, c.falla.t, k.pill(c.falla.sis < 0 ? 'ok' : 'warn', c.falla.marca));
                cerrar(c.proy.t, c.proy.tono, c.proy.et);
            }
            function cerrar(texto, tono, etiqueta) { campos.set(10, texto, k.pill(tono, etiqueta)); }

            function pintarChart(c) {
                var bot = [], man = [], i, j;
                for (i = 0; i < SIS.length; i++) { bot.push(0); man.push(0); }
                for (j = 0; j < c.pasos.length; j++) {
                    bot[c.pasos[j].sis] += c.pasos[j].seg / 60;
                    man[c.pasos[j].sis] += c.pasos[j].man;
                }
                if (c.falla.sis >= 0) bot[c.falla.sis] += c.extraSeg / 60;
                bot = bot.map(function (v) { return +v.toFixed(2); });
                if (!ch) {
                    ch = k.chart(cb.canvas, {
                        type: 'bar',
                        data: {
                            labels: SIS.map(function (s) { return s.n; }),
                            datasets: [
                                { label: 'Flujo automatizado', data: bot, backgroundColor: k.CAT[0], borderRadius: 3, minBarLength: 4, barPercentage: 0.86, categoryPercentage: 0.72 },
                                { label: 'Ejecución manual', data: man, backgroundColor: k.CAT[1], borderRadius: 3, barPercentage: 0.86, categoryPercentage: 0.72 }
                            ]
                        },
                        options: {
                            indexAxis: 'y',
                            scales: {
                                x: Object.assign({}, k.AXIS, { beginAtZero: true, title: { display: true, text: 'minutos' } }),
                                y: Object.assign({}, k.AXIS_BARE)
                            },
                            plugins: {
                                legend: { position: 'bottom' },
                                tooltip: {
                                    callbacks: {
                                        label: function (it) { return it.dataset.label + ': ' + k.fmt(it.parsed.x, 1) + ' min'; }
                                    }
                                }
                            }
                        }
                    });
                } else if (ch.data) {
                    ch.data.datasets[0].data = bot;
                    ch.data.datasets[1].data = man;
                    ch.update();
                }
                cb.cap(c.m.corto + ' · ' + c.areaFin.toLowerCase() + ' · flujo ' + dur(c.botSeg + c.extraSeg) + ' contra ' + horas(c.manMin) + ' manuales');
            }

            function pintarInsights(c) {
                var v = ventana(c);
                ins.clear();
                if (c.invalido) {
                    ins.add('rose', '✕', 'Origen y destino son la misma área. El flujo <b>rechaza el formulario en la validación</b>, antes de escribir en ningún sistema: no hay nada que revertir después.');
                }
                ins.add('teal', '↺', c.mv === 'alta'
                    ? 'El alta se construye de adentro hacia afuera: <b>identidad primero</b>, carpetas cuando el área está confirmada y el expediente al final, con la evidencia de los once pasos previos.'
                    : (c.mv === 'baja'
                        ? 'La baja no es el alta al revés: <b>primero se cierra el acceso</b> (directorio, licencias, ERP, carpetas) y hasta el final se tocan planilla, liquidación y archivo.'
                        : 'El traslado conserva la identidad y cambia lo que cuelga de ella. <b>Se retira antes de otorgar</b>: al revés, la persona acumula los permisos de las dos áreas.'));
                ins.add('amber', '!', 'Ventana crítica ' + v.t + ': <b>' + horas(v.man) + '</b> en el proceso manual contra <b>' + dur(v.bot) + '</b> automatizado. Ahí es donde se quedan los accesos sin dueño.');
                ins.add('violet', '✓', c.firmas === 0
                    ? 'Perfil analista: aprobación única de la jefatura. Ningún paso queda a criterio del operador y los doce se sellan en la bitácora.'
                    : 'Perfil ' + c.perfil.toLowerCase() + ': ' + (c.firmas > 1 ? 'dos firmas adicionales, sobre carpetas y licencias' : 'una firma adicional, sobre los permisos de carpetas') + '. Suman <b>' + dur(c.firmas * FIRMA_SEG) + '</b> al flujo y <b>' + horas(c.firmas * FIRMA_MAN) + '</b> al proceso manual.');
                if (c.falla.modo === 'reintento') {
                    ins.add('cyan', '≈', 'Sistema que no contesta: el flujo <b>reintenta con espera progresiva</b> (30 s, 90 s y 5 min). Se recupera solo y el movimiento cierra completo, con el reintento anotado.');
                } else if (c.falla.modo === 'ticket') {
                    ins.add('rose', '✕', 'Sistema que rechaza la operación: reintentar no sirve. Se abre el ticket <b>' + D.ticket + '</b> con el paso exacto, los pasos independientes siguen y el movimiento <b>nunca se marca completo</b>.');
                } else if (c.falla.modo === 'diferido') {
                    ins.add('cyan', '≡', 'Sistema en ventana cerrada: forzar la escritura corrompe el cierre. ' + (c.nFalla === 1 ? 'El paso se agenda' : 'Los ' + c.nFalla + ' pasos se agendan') + ' al <b>' + REAPERTURA + '</b> y el resto de la secuencia continúa.');
                }
            }

            function refrescar() {
                if (campoDestino) campoDestino.classList.toggle('hide', ctl.get('mov') !== 'cambio');
                ctx = calcular();
                pintarPasos(ctx);
                pintarPipe(ctx);
                pintarFicha(ctx);
                pintarChart(ctx);
                pintarInsights(ctx);
                /* un movimiento que la validación rechaza no consume tiempo
                   de nadie: mostrar su estimado sería un número sin sentido */
                kp.set(0, '0 de 12', ctx.invalido ? 'bad' : '');
                kp.set(1, '0 de 7', '');
                kp.set(2, ctx.invalido ? '—' : dur(ctx.botSeg + ctx.extraSeg), ctx.invalido ? '' : 'up');
                kp.set(3, ctx.invalido ? '—' : horas(ctx.manMin), ctx.invalido ? '' : 'warn');
                log.clear();
                log.push('in', 'Escenario cargado: ' + ctx.m.corto + ' · ' + ctx.etiquetaArea + ' · ' + ctx.perfil + '. Pulsá Ejecutar para correr los doce pasos.');
                log.push('in', 'Folio ' + D.folio + ' · fecha efectiva ' + ctx.fecha + ' · usuario ' + ctx.usuario);
                log.push(ctx.proy.tono === 'ok' ? 'in' : 'wa', 'Cierre proyectado: ' + ctx.proy.t + '.');
            }

            /* ---------- ejecución animada ---------- */
            function bloquear(b) {
                var n = ctl.node.querySelectorAll('select, input, textarea');
                Array.prototype.forEach.call(n, function (x) { x.disabled = !!b; });
            }
            function liberar() {
                bloquear(false);
                ctl.busy('run', false);
                corriendo = false;
            }

            async function ejecutar() {
                if (corriendo) return;
                corriendo = true;
                bloquear(true);
                ctl.busy('run', true);
                var c = ctx, f = c.falla, hechos = 0, tocados = {}, pend = 0, dif = 0, extra = 0, i, p, golpe;
                st.reset();
                pintarPipe(c);
                log.clear();
                log.push('hl', 'Formulario ' + D.folio + ' aprobado por la jefatura — movimiento de ' + c.m.corto);
                log.push('in', c.nombre + ' · ' + c.etiquetaArea + ' · ' + c.perfil + ' · efectivo ' + c.fecha);
                cerrar('en curso', 'run', 'ejecutando');

                if (c.invalido) {
                    st.set(0, 'fail', 'rechazado');
                    pipe.set(EXP, 'fail', 'validación');
                    log.push('er', 'Validación previa: el área de origen y la de destino son la misma. El formulario se rechaza.');
                    await k.wait(360);
                    log.push('wa', 'Se devuelve a la jefatura con el motivo. Cero escrituras, cero reversas pendientes.');
                    kp.set(0, '0 de 12', 'bad');
                    cerrar('rechazado en la validación', 'bad', 'rechazado');
                    liberar();
                    return;
                }

                for (i = 0; i < c.pasos.length; i++) {
                    p = c.pasos[i];
                    golpe = f.sis >= 0 && (f.modo === 'diferido' ? p.sis === f.sis : i === c.iFalla);
                    st.set(i, 'run', corto(p.seg));
                    pipe.set(p.sis, 'run', 'en curso');
                    log.push('in', 'Paso ' + k.pad(i + 1) + ' · ' + SIS[p.sis].n + ' — ' + p.n);
                    await k.wait(190 + Math.random() * 90);

                    if (golpe) {
                        st.set(i, 'fail', f.marca);
                        pipe.set(p.sis, 'fail', 'error');
                        log.push('er', SIS[p.sis].n + ' ' + f.er + '. Paso ' + k.pad(i + 1) + ' marcado como fallido.');
                        await k.wait(340);
                        extra += f.seg;
                        if (f.modo === 'reintento') {
                            log.push('wa', 'Espera progresiva: reintento 1 a los 30 s, reintento 2 a los 90 s, reintento 3 a los 5 min.');
                            await k.wait(320);
                            st.set(i, 'done', '2 intentos · ' + corto(p.seg + f.seg));
                            pipe.set(p.sis, 'done', c.cuenta[p.sis] + ' escritos');
                            tocados[p.sis] = 1;
                            hechos++;
                            log.push('ok', 'Recuperado en el intento 2 — ' + p.d(c));
                        } else if (f.modo === 'ticket') {
                            log.push('wa', 'Tres reintentos con espera progresiva. Los tres devuelven el mismo rechazo: reintentar no resuelve esto.');
                            await k.wait(320);
                            log.push('er', 'Ticket ' + D.ticket + ' abierto con el folio, el sistema y el paso ' + k.pad(i + 1) + '. El paso queda pendiente.');
                            await k.wait(300);
                            log.push('wa', 'Los pasos que no dependen de este continúan; el movimiento no cierra en verde mientras el ticket siga abierto.');
                            st.set(i, 'fail', 'pendiente · ticket');
                            pipe.set(p.sis, 'fail', 'paso pendiente');
                            pend++;
                        } else {
                            log.push('wa', SIS[p.sis].n + ' vuelve a aceptar escrituras el ' + REAPERTURA + '. El paso se agenda, no se fuerza.');
                            await k.wait(300);
                            st.set(i, '', 'agendado ' + REAPERTURA);
                            pipe.set(p.sis, '', 'diferido al ' + REAPERTURA);
                            dif++;
                            log.push('in', 'Paso ' + k.pad(i + 1) + ' diferido con recordatorio a nómina. La secuencia continúa.');
                        }
                        kp.set(0, hechos + ' de 12', pend ? 'bad' : 'warn');
                        kp.set(1, Object.keys(tocados).length + ' de 7', '');
                        continue;
                    }

                    if (p.firma) {
                        log.push('wa', 'Firma adicional requerida por perfil ' + c.perfil.toLowerCase() + ' antes de escribir. Enviada a la gerencia del área.');
                        await k.wait(260);
                        log.push('ok', 'Firma registrada con acuse. El paso continúa con la aprobación adjunta.');
                    }

                    st.set(i, 'done', corto(p.seg));
                    tocados[p.sis] = 1;
                    hechos++;
                    pipe.set(p.sis, 'done', c.cuenta[p.sis] + (c.cuenta[p.sis] === 1 ? ' paso escrito' : ' pasos escritos'));
                    /* el expediente se genera siempre, pero no se firma
                       mientras quede un paso abierto: eso es todo el punto */
                    if (i === c.pasos.length - 1 && (pend + dif) > 0) {
                        log.push('wa', 'expediente generado SIN firma de cierre: ' + (pend + dif) + (pend + dif === 1 ? ' paso sigue abierto' : ' pasos siguen abiertos'));
                    } else {
                        log.push('ok', p.d(c));
                    }
                    kp.set(0, hechos + ' de 12', pend ? 'bad' : (hechos === 12 ? 'up' : ''));
                    kp.set(1, Object.keys(tocados).length + ' de 7', '');
                }

                var total = c.botSeg + extra;
                var sist = Object.keys(tocados).length;
                kp.set(2, dur(total), extra ? 'warn' : 'up');
                log.push('hl', 'Corrida terminada: ' + hechos + ' de 12 pasos escritos en ' + sist + ' de 7 sistemas, ' + dur(total) + '.');
                if (pend) {
                    cerrar(hechos + ' de 12 pasos, ticket ' + D.ticket, 'bad', 'incompleto');
                    log.push('er', 'Movimiento INCOMPLETO: el paso del pool de licencias sigue abierto en el ticket ' + D.ticket + '. El expediente no se firma.');
                } else if (dif) {
                    cerrar(hechos + ' de 12 pasos, ' + dif + ' al ' + REAPERTURA, 'warn', 'diferido');
                    log.push('wa', 'Movimiento con ' + dif + (dif === 1 ? ' paso agendado' : ' pasos agendados') + ' al ' + REAPERTURA + '. El expediente se firma cuando corran.');
                } else {
                    cerrar('12 de 12 pasos firmados', 'ok', extra ? 'con reintento' : 'completo');
                    log.push('ok', 'Expediente digital generado con sello por paso. Equivalente manual estimado: ' + horas(c.manMin) + '.');
                }
                liberar();
            }

            ctl.on(function () { if (!corriendo) refrescar(); });
            ctl.onClick('run', function () { ejecutar(); });
            refrescar();
        }
    });

    /* Ficha de campos clave/valor con espacio para una etiqueta de estado. */
    function fichaCampos(k, llaves) {
        var w = k.el('div', 'fields');
        llaves.forEach(function (t) {
            var f = k.el('div', 'fx');
            f.appendChild(k.txt('div', 'fk', t));
            f.appendChild(k.txt('div', 'fv', '—'));
            f.appendChild(k.el('div', null, ''));
            w.appendChild(f);
        });
        return {
            node: w,
            set: function (i, v, h) {
                var f = w.children[i];
                if (!f) return;
                f.children[1].textContent = v == null ? '—' : v;
                if (h != null) f.children[2].innerHTML = h;
            }
        };
    }
})();
