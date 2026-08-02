/* ==========================================================================
   inghumbertohenriquez.com — profile.js
   i18n (ES base / EN), nav, GMT-6 clocks, reveal system, odometers, pill.
   All vendors self-hosted; degrades to fully-visible static page without JS.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------- i18n table: key -> [ES, EN] ---------------- */
    var I18N = {
        /* nav */
        'nav-historia': ['Historia', 'Story'],
        'nav-educacion': ['Educación', 'Education'],
        'nav-certs': ['Certificaciones', 'Certifications'],
        'nav-proyectos': ['Proyectos', 'Projects'],
        'nav-agentes': ['Agentes IA', 'AI Agents'],
        'nav-intereses': ['Intereses', 'Interests'],
        'nav-contacto': ['Contacto', 'Contact'],
        'nav-cta': ['Optimatiza ↗', 'Optimatiza ↗'],

        /* dochead */
        'doc-number': ['DOC. HH/2026 — EXPEDIENTE PROFESIONAL', 'DOC. HH/2026 — PROFESSIONAL DOSSIER'],
        'doc-status': ['EN CONSTRUCCIÓN CONTINUA', 'UNDER CONTINUOUS CONSTRUCTION'],

        /* hero */
        'hero-kicker': ['ING. HUMBERTO WILFREDO HENRÍQUEZ BENÍTEZ', 'HUMBERTO WILFREDO HENRÍQUEZ BENÍTEZ, ENG.'],
        'hero-t1': ['Construyo agentes digitales con IA y automatización.', 'I build digital agents with AI &amp; automation.'],
        'hero-t2': ['Científico de datos — fundador de <em>Optimatiza</em>.', 'Data scientist — founder of <em>Optimatiza</em>.'],
        'hero-t3': ['Creador de <em class="em-btc">Bitcoin Academy</em>.', 'Creator of <em class="em-btc">Bitcoin Academy</em>.'],
        'hero-sub': ['Aquí no hay catálogo de servicios — para eso está <a href="https://optimatiza.com/" target="_blank" rel="noopener">Optimatiza</a>. Este es mi expediente personal: quién soy, de dónde vengo, qué estudié, qué he construido y qué me mantiene despierto a medianoche.', 'There\'s no service catalog here — that\'s what <a href="https://optimatiza.com/" target="_blank" rel="noopener">Optimatiza</a> is for. This is my personal dossier: who I am, where I come from, what I studied, what I\'ve built, and what keeps me up at midnight.'],
        'hero-cta1': ['Leer mi historia', 'Read my story'],
        'hero-cta2': ['Ir directo a lo construido →', 'Skip to what I\'ve built →'],
        'chip-founder': ['FUNDADOR — OPTIMATIZA', 'FOUNDER — OPTIMATIZA'],
        'chip-btc': ['CREADOR — BITCOIN ACADEMY', 'CREATOR — BITCOIN ACADEMY'],
        'chip-msc': ['2 MAESTRÍAS + POSGRADO', '2 MSC + POSTGRAD DEGREE'],
        'chip-pl': ['3× MICROSOFT CERTIFIED', '3× MICROSOFT CERTIFIED'],
        'photo-stamp': ['VERIFICADO · 2026', 'VERIFIED · 2026'],
        'photo-caption': ['FIG. 0 — EL INGENIERO · SAN SALVADOR, EL SALVADOR', 'FIG. 0 — THE ENGINEER · SAN SALVADOR, EL SALVADOR'],

        /* proof table */
        'proof-years': ['Años en tecnología', 'Years in technology'],
        'proof-years-sub': ['DE SOPORTE TÉCNICO A ARQUITECTO DE SOLUCIONES', 'FROM TECH SUPPORT TO SOLUTIONS ARCHITECT'],
        'proof-titles': ['Programas universitarios', 'University programs'],
        'proof-titles-sub': ['INGENIERÍA · 2 MAESTRÍAS · POSGRADO BLOCKCHAIN', 'BSC · 2 MSC · BLOCKCHAIN POSTGRAD'],
        'proof-systems': ['Sistemas en producción', 'Systems in production'],
        'proof-systems-sub': ['APPS · RPA · DASHBOARDS · AGENTES IA', 'APPS · RPA · DASHBOARDS · AI AGENTS'],
        'proof-countries': ['Países servidos', 'Countries served'],
        'proof-countries-sub': ['SV · GT · CR · DO — 100% REMOTO', 'SV · GT · CR · DO — 100% REMOTE'],

        /* historia */
        'hist-index': ['01 — MI HISTORIA · DE SOPORTE TÉCNICO A FUNDADOR', '01 — MY STORY · FROM TECH SUPPORT TO FOUNDER'],
        'hist-title': ['La tecnología no vale nada si no resuelve un <em>problema real</em>.', 'Technology is worth nothing unless it solves a <em>real problem</em>.'],
        'hist-sub': ['Eso lo aprendí arreglando infraestructura, no leyéndolo en un libro. Todo lo demás salió de ahí.', 'I learned that by fixing infrastructure, not by reading it in a book. Everything else grew from there.'],
        'fact-head': ['FICHA TÉCNICA', 'SPEC SHEET'],
        'fact-base': ['BASE', 'BASE'],
        'fact-base-v': ['San Salvador, El Salvador · GMT-6', 'San Salvador, El Salvador · GMT-6'],
        'fact-mode': ['MODALIDAD', 'MODE'],
        'fact-mode-v': ['100% remoto desde 2020', '100% remote since 2020'],
        'fact-lang': ['IDIOMAS', 'LANGUAGES'],
        'fact-lang-v': ['Español nativo · inglés técnico escrito', 'Native Spanish · written technical English'],
        'fact-role': ['HOY', 'TODAY'],
        'fact-role-v': ['Consultor senior de datos y automatización · Fundador de Optimatiza', 'Senior data &amp; automation consultant · Founder of Optimatiza'],
        'fact-shipped': ['PUBLICADO', 'SHIPPED'],
        'hist-p1': ['Empecé mi carrera en el mundo de la infraestructura y el soporte técnico. Ahí aprendí algo que muchos tecnólogos nunca entienden: <strong>la tecnología no vale nada si no resuelve un problema real del negocio</strong>.', 'I started my career in infrastructure and tech support. There I learned something many technologists never do: <strong>technology is worth nothing unless it solves a real business problem</strong>.'],
        'hist-p2': ['Con el tiempo me fui moviendo hacia la automatización y la gestión de datos. Vi de primera mano cómo empresas enteras operaban con hojas de Excel compartidas por correo, aprobaciones por WhatsApp, reportes que se armaban a mano cada lunes y procesos críticos que dependían de que "alguien se acordara" de hacer algo.', 'Over time I moved into automation and data. I saw first-hand how entire companies ran on Excel files shared by email, WhatsApp approvals, reports assembled by hand every Monday, and critical processes that depended on "someone remembering" to do something.'],
        'hist-p3': ['Ahí encontré mi misión profesional: <strong>eliminar esa fragilidad operativa</strong>. Microsoft Power Platform se convirtió en mi herramienta principal porque permite exactamente eso — tomar un proceso roto y convertirlo en un sistema digital completo, sin desarrollos de meses ni presupuestos de medio millón de dólares. Me certifiqué en sus tres pilares — Power Apps, Power Automate y Power BI — y los llevé a producción.', 'That\'s where I found my professional mission: <strong>eliminating that operational fragility</strong>. Microsoft Power Platform became my main tool because it allows exactly that — taking a broken process and turning it into a complete digital system, without months-long builds or half-million-dollar budgets. I got certified in its three pillars — Power Apps, Power Automate and Power BI — and took them to production.'],
        'hist-p4': ['Mientras tanto seguí estudiando de noche: una maestría en Inteligencia de Negocios, un posgrado en Blockchain y una maestría en Ciencia de Datos. Y en paralelo construí cosas propias — una academia de Bitcoin que hoy vive en Google Play, sistemas de trading algorítmico, pipelines de video que se publican solos.', 'Meanwhile I kept studying at night: a master\'s in Business Intelligence, a postgraduate degree in Blockchain, and a master\'s in Data Science. And in parallel I built things of my own — a Bitcoin academy that now lives on Google Play, algorithmic trading systems, video pipelines that publish themselves.'],
        'hist-p5': ['En 2026 le puse nombre a la siguiente etapa: <strong>Optimatiza</strong>, mi estudio de agentes de IA y automatización para empresas de Latinoamérica. Una década de sistemas en producción, productizada.', 'In 2026 I gave the next stage a name: <strong>Optimatiza</strong>, my AI-agents and automation studio for Latin American companies. A decade of production systems, productized.'],
        'hist-quote': ['"Entender el problema de negocio primero. Construir la solución correcta después."', '"Understand the business problem first. Build the right solution second."'],
        'hist-quote-by': ['— EL MÉTODO, DESDE EL DÍA UNO', '— THE METHOD, SINCE DAY ONE'],

        /* journey */
        'j1-t': ['Infraestructura y soporte', 'Infrastructure &amp; support'],
        'j1-b': ['Entro a Ingeniería en Sistemas (UTEC) y al mundo real: servidores, redes y usuarios con problemas urgentes.', 'I start Systems Engineering (UTEC) and the real world: servers, networks and users with urgent problems.'],
        'j2-t': ['Práctica independiente', 'Independent practice'],
        'j2-b': ['Arranco como consultor independiente: aplicaciones web, pipelines de datos y modelos analíticos para clientes propios.', 'I start out as an independent consultant: web apps, data pipelines and analytics models for my own clients.'],
        'j3-t': ['Operación regional · 4 países', 'Regional operation · 4 countries'],
        'j3-b': ['Primeros bots RPA y dashboards ejecutivos en producción: analítica y automatización de servicio en campo para El Salvador, Guatemala, Costa Rica y República Dominicana. Remoto desde entonces.', 'First RPA bots and executive dashboards in production: field-service analytics and automation across El Salvador, Guatemala, Costa Rica and the Dominican Republic. Remote ever since.'],
        'j4-t': ['Arquitecto Power Platform', 'Power Platform architect'],
        'j4-b': ['Profundizo como arquitecto de soluciones sobre Power Platform y arranco la maestría en Ciencia de Datos.', 'I go deeper as a solutions architect on Power Platform and start the MSc in Data Science.'],
        'j5-t': ['Creador y fundador', 'Creator &amp; founder'],
        'j5-b': ['Bitcoin Academy llega a Google Play. Fundo Optimatiza para llevar agentes de IA a las pymes de LATAM.', 'Bitcoin Academy ships to Google Play. I found Optimatiza to bring AI agents to LATAM businesses.'],

        /* educación */
        'edu-index': ['02 — EDUCACIÓN · ESTUDIAR DE NOCHE, CONSTRUIR DE DÍA', '02 — EDUCATION · STUDY BY NIGHT, BUILD BY DAY'],
        'edu-title': ['Cuatro títulos, <em>una obsesión</em>.', 'Four degrees, <em>one obsession</em>.'],
        'edu-sub': ['Desde 2016 no ha habido un solo año sin estar inscrito en algo. No colecciono diplomas: cada uno respondió una pregunta que el trabajo me hizo primero.', 'Since 2016 there hasn\'t been a single year without being enrolled in something. I don\'t collect diplomas: each one answered a question the work asked me first.'],
        'edu1-d': ['Maestría en Ciencia de Datos', 'MSc in Data Science'],
        'edu1-s': ['UNIVERSIDAD EUROPEA DEL ATLÁNTICO — UNEATLÁNTICO', 'UNIVERSIDAD EUROPEA DEL ATLÁNTICO — UNEATLÁNTICO'],
        'edu1-n': ['La credencial que conecta todo: modelos de datos correctos, estadística aplicada e IA donde realmente agrega valor — no donde está de moda.', 'The credential that connects everything: correct data models, applied statistics, and AI where it truly adds value — not where it\'s fashionable.'],
        'edu1-b': ['COMPLETADA', 'COMPLETED'],
        'edu2-d': ['Maestría en Inteligencia de Negocios', 'MSc in Business Intelligence'],
        'edu2-s': ['UNINI MÉXICO', 'UNINI MÉXICO'],
        'edu2-n': ['Donde el dashboard dejó de ser el producto y pasó a ser el síntoma: lo que importa es el sistema de datos que lo alimenta.', 'Where the dashboard stopped being the product and became the symptom: what matters is the data system feeding it.'],
        'edu2-b': ['COMPLETADA', 'COMPLETED'],
        'edu3-d': ['Posgrado en Tecnología Blockchain', 'Postgraduate Degree in Blockchain Technology'],
        'edu3-s': ['UTEC — UNIVERSIDAD TECNOLÓGICA DE EL SALVADOR', 'UTEC — UNIVERSIDAD TECNOLÓGICA DE EL SALVADOR'],
        'edu3-n': ['Cursado el año en que El Salvador adoptó Bitcoin como moneda de curso legal. De aquí salió la semilla de Bitcoin Academy.', 'Studied during the year El Salvador adopted Bitcoin as legal tender. The seed of Bitcoin Academy came from here.'],
        'edu3-b': ['COMPLETADO', 'COMPLETED'],
        'edu4-d': ['Ingeniería en Sistemas Computacionales', 'BSc in Computer Systems Engineering'],
        'edu4-s': ['UTEC — UNIVERSIDAD TECNOLÓGICA DE EL SALVADOR', 'UTEC — UNIVERSIDAD TECNOLÓGICA DE EL SALVADOR'],
        'edu4-n': ['La base. Aquí aprendí a programar — y trabajando en paralelo aprendí para qué sirve programar.', 'The foundation. Here I learned to code — and working in parallel I learned what code is for.'],
        'edu4-b': ['COMPLETADA', 'COMPLETED'],

        /* certificaciones */
        'cert-index': ['03 — CERTIFICACIONES · PRÁCTICA VALIDADA, NO DECORACIÓN', '03 — CERTIFICATIONS · VALIDATED PRACTICE, NOT DECORATION'],
        'cert-title': ['Los tres pilares de <em>Power Platform</em>.', 'The three pillars of <em>Power Platform</em>.'],
        'cert-sub': ['Power Apps, Power Automate y Power BI — cada badge es un examen supervisado de Microsoft, y detrás de cada uno hay sistemas reales en producción.', 'Power Apps, Power Automate and Power BI — every badge is a proctored Microsoft exam, and behind each one there are real systems in production.'],
        'cert-cat1': ['MICROSOFT CERTIFIED — POWER PLATFORM', 'MICROSOFT CERTIFIED — POWER PLATFORM'],
        'c-pl100': ['Power Platform App Maker — Power Apps', 'Power Platform App Maker — Power Apps'],
        'c-pl500': ['Power Automate RPA Developer', 'Power Automate RPA Developer'],
        'c-pl300': ['Power BI Data Analyst', 'Power BI Data Analyst'],
        'cert-note': ['LA FORMACIÓN CONTINUA ES UN HÁBITO, NO UN EVENTO — SIEMPRE HAY UN EXAMEN EN EL CALENDARIO.', 'CONTINUOUS LEARNING IS A HABIT, NOT AN EVENT — THERE IS ALWAYS AN EXAM ON THE CALENDAR.'],

        /* proyectos */
        'proj-index': ['04 — LO QUE HE CONSTRUIDO · EVIDENCIA, NO PROMESAS', '04 — WHAT I\'VE BUILT · EVIDENCE, NOT PROMISES'],
        'proj-title': ['Dos criaturas propias y una década de <em>sistemas en producción</em>.', 'Two creations of my own and a decade of <em>systems in production</em>.'],
        'proj-sub': ['Lo mío propio primero; después, el trabajo enterprise que me formó.', 'My own work first; then the enterprise work that shaped me.'],
        'feat1-chip': ['FUNDADOR · 2026', 'FOUNDER · 2026'],
        'feat1-body': ['Mi estudio de agentes de IA y automatización para pymes de Latinoamérica. Una década construyendo sistemas empresariales, convertida en producto: agentes que cobran, cotizan, responden y reportan — mientras el dueño duerme.', 'My AI-agents and automation studio for Latin American businesses. A decade of building enterprise systems, turned into product: agents that collect, quote, reply and report — while the owner sleeps.'],
        'feat1-m1': ['AGENTES DE IA PARA VENTAS, COBROS Y SOPORTE', 'AI AGENTS FOR SALES, COLLECTIONS &amp; SUPPORT'],
        'feat1-m2': ['DEMOS EN VIVO VÍA WHATSAPP', 'LIVE DEMOS VIA WHATSAPP'],
        'feat1-cta': ['Visitar optimatiza.com →', 'Visit optimatiza.com →'],
        'feat2-chip': ['CREADOR · EN GOOGLE PLAY', 'CREATOR · ON GOOGLE PLAY'],
        'feat2-body': ['Academia interactiva para aprender Bitcoin desde cero, en español. Nació de mi posgrado en Blockchain y de ver a mi país adoptar Bitcoin sin que nadie explicara cómo funciona. PWA publicada en Google Play, gratuita.', 'An interactive academy to learn Bitcoin from scratch, in Spanish. Born from my Blockchain postgrad and from watching my country adopt Bitcoin while nobody explained how it works. PWA published on Google Play, free.'],
        'feat2-cta': ['Abrir bitcoinacademy.tech →', 'Open bitcoinacademy.tech →'],
        'ev-index': ['REGISTRO DE OBRA — TRABAJO ENTERPRISE · OPERACIÓN REGIONAL DE SERVICIOS IT (4 PAÍSES)', 'WORK LEDGER — ENTERPRISE WORK · REGIONAL IT-SERVICES OPERATION (4 COUNTRIES)'],
        'ev1-t': ['Asistente técnico con IA', 'AI technical assistant'],
        'ev1-b': ['Los técnicos de campo preguntan en lenguaje natural y reciben el documento correcto en segundos. Power Apps + AI Builder + SharePoint Search (KQL).', 'Field technicians ask in natural language and get the right document in seconds. Power Apps + AI Builder + SharePoint Search (KQL).'],
        'ev1-o': ['DE MINUTOS A &lt;30 SEGUNDOS', 'FROM MINUTES TO &lt;30 SECONDS'],
        'ev2-t': ['Dashboard ejecutivo multi-fuente', 'Multi-source executive dashboard'],
        'ev2-b': ['Tres plataformas de tickets (SolarWinds, Redmine, SQL Server FSM) normalizadas en una sola vista regional en Power BI, con refresh automático.', 'Three ticketing platforms (SolarWinds, Redmine, SQL Server FSM) normalized into a single regional Power BI view, refreshed automatically.'],
        'ev2-o': ['3 FUENTES → 1 VISTA', '3 SOURCES → 1 VIEW'],
        'ev3-t': ['Suite RPA de escritorio', 'Desktop RPA suite'],
        'ev3-b': ['Bots que procesan importaciones masivas de casos de servicio para Lenovo LATAM — validación de formatos por país, lotes de hasta 500 registros, cero copiar-y-pegar.', 'Bots processing bulk service-case imports for Lenovo LATAM — per-country format validation, batches of up to 500 records, zero copy-paste.'],
        'ev3-o': ['HORAS SEMANALES ELIMINADAS', 'WEEKLY HOURS ELIMINATED'],
        'ev4-t': ['Portales de aprobación', 'Approval portals'],
        'ev4-b': ['Solicitudes de viaje y órdenes de compra que antes vivían en correos, convertidas en flujos con aprobaciones multinivel, estados y trazabilidad completa.', 'Travel requests and purchase orders that used to live in email threads, turned into flows with multi-level approvals, states and full traceability.'],
        'ev4-o': ['CERO APROBACIONES POR CORREO', 'ZERO EMAIL APPROVALS'],
        'ev5-t': ['Gobierno documental', 'Document governance'],
        'ev5-b': ['Catálogo maestro en SharePoint con codificación estructurada, correlativos autogenerados y permisos por rol — la base sobre la que corre el asistente de IA.', 'A SharePoint master catalog with structured coding, auto-generated correlatives and role-based permissions — the base the AI assistant runs on.'],
        'ev5-o': ['LISTO PARA AUDITORÍA ISO', 'ISO-AUDIT READY'],

        /* agentes / tarifario */
        'ag-index': ['05 — AGENTES IA · TARIFARIO DE REFERENCIA', '05 — AI AGENTS · REFERENCE PRICING'],
        'ag-title': ['Lo que cuesta una <em>unidad</em>.', 'What a <em>unit</em> costs.'],
        'ag-sub': ['Sigo dibujando y corriendo agentes de IA — ahora bajo la bandera de Optimatiza. Esta es la tabla de presupuesto de referencia, y la flota completa sigue viva aquí mismo.', 'I still draw and run AI agents — now under the Optimatiza flag. This is the reference budget table, and the full fleet is still alive right here.'],
        'tar-s': ['<strong>Unidad simple — $600–1,200.</strong> Un flujo, una integración, reglas fijas. ~1–2 semanas.', '<strong>Simple unit — $600–1,200.</strong> One flow, one integration, fixed rules. ~1–2 weeks.'],
        'tar-m': ['<strong>Unidad estándar — $1,200–3,000.</strong> Multi-paso, razonamiento IA, 2–3 integraciones, ciclo de aprobación. ~2–4 semanas.', '<strong>Standard unit — $1,200–3,000.</strong> Multi-step, AI reasoning, 2–3 integrations, approval loop. ~2–4 weeks.'],
        'tar-l': ['<strong>Célula compuesta — $3,000–8,000.</strong> Varios agentes orquestados con memoria compartida y tableros. ~4–8 semanas.', '<strong>Composite cell — $3,000–8,000.</strong> Several orchestrated agents with shared memory and dashboards. ~4–8 weeks.'],
        'tar-inc': ['Toda unidad incluye: diseño, construcción, pruebas, entrega documentada y 30 días de soporte post-lanzamiento.', 'Every unit includes: design, build, testing, documented delivery and 30 days of post-launch support.'],
        'tar-ref': ['PRECIOS DE REFERENCIA — EL NÚMERO REAL SALE DE UN DIAGNÓSTICO DE 30 MINUTOS.', 'REFERENCE PRICES — THE REAL NUMBER COMES FROM A 30-MINUTE DIAGNOSTIC.'],
        'tar-cta1': ['Ver la flota — 20 agentes en vivo', 'See the fleet — 20 live agents'],
        'tar-cta2': ['Cotizar con Optimatiza →', 'Get a quote at Optimatiza →'],

        /* cotizador interactivo */
        'cz-title': ['Arma tu combinación y ve el rango al instante.', 'Build your combo and see the range instantly.'],
        'cz-sub': ['Marca lo que necesitas — o descríbelo con tus palabras y deja que la IA lo clasifique con las mismas bandas publicadas.', 'Check what you need — or describe it in your own words and let the AI classify it using the same published bands.'],
        'cz-i1t': ['Flujo de facturas y DTE', 'Invoice & e-billing flow'],
        'cz-i1d': ['Llega el correo → captura los datos → registro en tu sistema, sin digitar.', 'Email arrives → data captured → logged in your system, no typing.'],
        'cz-i2t': ['Cobranza automática', 'Automated collections'],
        'cz-i2d': ['Recordatorios por WhatsApp sobre toda la cartera, que suben de tono solos.', 'WhatsApp reminders across your whole portfolio, escalating on their own.'],
        'cz-i3t': ['Agente de atención 24/7', '24/7 service agent'],
        'cz-i3d': ['Responde, cotiza y aparta por WhatsApp — día y noche.', 'Replies, quotes and books via WhatsApp — day and night.'],
        'cz-i4t': ['Reportes automáticos', 'Automated reports'],
        'cz-i4d': ['Tus datos → dashboard o resumen listo cada mañana en tu correo.', 'Your data → dashboard or summary ready in your inbox every morning.'],
        'cz-i5t': ['Flujo de aprobaciones', 'Approval flow'],
        'cz-i5d': ['Solicitud → aprobador (Teams/correo) → registro y aviso automático.', 'Request → approver (Teams/email) → automatic logging and notice.'],
        'cz-i6t': ['Integraciones y APIs', 'Integrations & APIs'],
        'cz-i6d': ['CRM, ERP, hojas de cálculo y correo hablando entre sí, con trazabilidad.', 'CRM, ERP, spreadsheets and email talking to each other, with traceability.'],
        'cz-i7t': ['Desarrollo a la medida', 'Custom build'],
        'cz-i7d': ['Web, app o célula multi-agente construida sobre tu operación.', 'Web, app or multi-agent cell built on top of your operation.'],
        'cz-est-l': ['INVERSIÓN ESTIMADA · UNA VEZ', 'ESTIMATED INVESTMENT · ONE-TIME'],
        'cz-wa': ['Pedir cotización exacta →', 'Request an exact quote →'],
        'cz-note': ['Bandas publicadas. Incluyen diseño, construcción, pruebas, entrega documentada y 30 días de soporte.', 'Published bands. They include design, build, testing, documented handover and 30 days of support.'],
        'cz-ai-l': ['✳ ¿NO VES TU CASO? DESCRÍBELO CON IA', '✳ DON\'T SEE YOUR CASE? DESCRIBE IT WITH AI'],
        'cz-ai-btn': ['Simular con IA →', 'Simulate with AI →'],

        /* intereses */
        'int-index': ['06 — FUERA DEL PLANO · LO QUE HAGO CUANDO NADIE PAGA POR ELLO', '06 — OFF THE DRAWING BOARD · WHAT I DO WHEN NOBODY PAYS FOR IT'],
        'int-title': ['El laboratorio <em>nunca cierra</em>.', 'The lab <em>never closes</em>.'],
        'int-sub': ['Los pasatiempos de un ingeniero que automatiza: terminan compilando, backtesteando o publicándose solos.', 'The hobbies of an engineer who automates: they end up compiling, backtesting or publishing themselves.'],
        'int1-t': ['Bitcoin y cripto', 'Bitcoin &amp; crypto'],
        'int1-b': ['Análisis de mercado, sistemas propios de swing trading con backtesting y validación walk-forward, e indicadores para TradingView. De este hobby nació Bitcoin Academy.', 'Market analysis, my own swing-trading systems with backtesting and walk-forward validation, and TradingView indicators. Bitcoin Academy was born from this hobby.'],
        'int1-tag': ['DESDE 2021 · EL AÑO DE LA LEY BITCOIN', 'SINCE 2021 · THE YEAR OF THE BITCOIN LAW'],
        'int2-t': ['Automatizar por deporte', 'Automating for sport'],
        'int2-b': ['Pipelines que generan y publican video automáticamente, un asistente personal self-hosted que me atiende por WhatsApp, y agentes que vigilan mercados mientras duermo.', 'Pipelines that generate and publish video automatically, a self-hosted personal assistant that answers me on WhatsApp, and agents watching markets while I sleep.'],
        'int2-tag': ['AUTOMATIZO HASTA LO QUE NADIE ME PIDE', 'I AUTOMATE EVEN WHAT NOBODY ASKS FOR'],
        'int3-t': ['Videojuegos con Unreal Engine', 'Games with Unreal Engine'],
        'int3-b': ['Desarrollo de videojuegos como proyecto personal: otra manera de construir sistemas — con física, luz y personajes en lugar de flujos y tablas.', 'Game development as a personal project: another way of building systems — with physics, light and characters instead of flows and tables.'],
        'int3-tag': ['PROYECTO PERSONAL · SIN FECHA DE ENTREGA', 'PERSONAL PROJECT · NO DEADLINE'],
        'int4-t': ['Aprender por sistema', 'Learning as a system'],
        'int4-b': ['Desde 2016 siempre hay una maestría, un posgrado o una certificación en curso. No es coleccionar badges: es mantener el criterio afilado en un campo que cambia cada seis meses.', 'Since 2016 there is always a master\'s, a postgrad or a certification in progress. It\'s not badge collecting: it\'s keeping judgment sharp in a field that changes every six months.'],
        'int4-tag': ['SIGUIENTE EXAMEN: SIEMPRE AGENDADO', 'NEXT EXAM: ALWAYS SCHEDULED'],

        /* contacto */
        'cto-index': ['07 — CONTACTO · HABLAS CON EL INGENIERO, NO HAY EQUIPO DE VENTAS', '07 — CONTACT · YOU TALK TO THE ENGINEER, THERE IS NO SALES TEAM'],
        'cto-title': ['¿Hablamos?', 'Shall we talk?'],
        'cto-sub': ['Si es un proyecto de automatización o agentes de IA, la puerta correcta es Optimatiza. Para todo lo demás — una idea, una duda técnica, un saludo — aquí estoy.', 'If it\'s an automation or AI-agents project, the right door is Optimatiza. For everything else — an idea, a technical question, a hello — I\'m right here.'],
        'cto-mail-l': ['CORREO', 'EMAIL'],
        'cto-wa-l': ['WHATSAPP', 'WHATSAPP'],
        'cto-li-l': ['LINKEDIN', 'LINKEDIN'],
        'cto-optz-l': ['PROYECTOS Y AGENTES IA', 'PROJECTS &amp; AI AGENTS'],
        'cto-note': ['RESPONDO EN MENOS DE 24 HORAS · GMT-6', 'I REPLY WITHIN 24 HOURS · GMT-6'],
        'form-name': ['NOMBRE', 'NAME'],
        'form-name-ph': ['¿Cómo te llamo?', 'What should I call you?'],
        'form-email': ['CORREO', 'EMAIL'],
        'form-email-ph': ['tu@correo.com', 'you@email.com'],
        'form-msg': ['MENSAJE', 'MESSAGE'],
        'form-msg-ph': ['Cuéntame en qué andas…', 'Tell me what you\'re up to…'],
        'form-send': ['Enviar mensaje', 'Send message'],
        'form-alt': ['O ESCRÍBEME DIRECTO POR WHATSAPP — SUELE SER MÁS RÁPIDO.', 'OR MESSAGE ME DIRECTLY ON WHATSAPP — USUALLY FASTER.'],

        /* footer */
        'foot-desc': ['INGENIERO · FUNDADOR DE OPTIMATIZA · CREADOR DE BITCOIN ACADEMY', 'ENGINEER · FOUNDER OF OPTIMATIZA · CREATOR OF BITCOIN ACADEMY'],
        'foot-reg': ['EXPEDIENTE HH/2026 — PERFIL PROFESIONAL, NO CATÁLOGO DE SERVICIOS.', 'DOSSIER HH/2026 — PROFESSIONAL PROFILE, NOT A SERVICE CATALOG.'],
        'foot-l1': ['Historia', 'Story'],
        'foot-l2': ['Educación', 'Education'],
        'foot-l3': ['Certificaciones', 'Certifications'],
        'foot-l4': ['Proyectos', 'Projects'],
        'foot-l5': ['Agent Fleet', 'Agent Fleet'],
        'colophon-motto': ['DIBUJADO A MANO · CORRIDO POR MÁQUINAS', 'DRAWN BY HAND · RUN BY MACHINES'],
        'foot-copy': ['© 2026 Humberto Henríquez. Todos los derechos reservados.', '© 2026 Humberto Henríquez. All rights reserved.'],
        'pill-contact': ['CONTACTO', 'CONTACT'],

        /* theme toggle (aria-label; se aplica manualmente, no via data-i18n) */
        'theme-toggle': ['Cambiar a modo oscuro', 'Switch to dark mode'],
        'theme-toggle-light': ['Cambiar a modo claro', 'Switch to light mode']
    };

    var translations = { es: {}, en: {} };
    Object.keys(I18N).forEach(function (k) {
        translations.es[k] = I18N[k][0];
        translations.en[k] = I18N[k][1];
    });

    var LS_KEY = 'preferred-lang';
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

    function applyLanguage(lang) {
        if (lang !== 'es' && lang !== 'en') lang = 'es';
        document.dispatchEvent(new CustomEvent('lang:willchange', { detail: { lang: lang } }));
        document.documentElement.lang = lang;
        var dict = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) el.innerHTML = dict[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) el.placeholder = dict[key];
        });
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            var active = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        lsSet(LS_KEY, lang);
        document.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang: lang } }));
    }

    /* ---------------- boot ---------------- */
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* language */
        var saved = lsGet(LS_KEY);
        if (saved === 'en') applyLanguage('en');
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { applyLanguage(btn.getAttribute('data-lang')); });
        });

        /* ---------- theme (light default; theme-init.js ya aplicó el guardado) ---------- */
        var THEME_KEY = 'hh-theme';
        var themeBtn = document.getElementById('themeToggle');
        var themeAnimT = 0;
        function currentTheme() {
            return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        }
        function syncThemeBtn() {
            if (!themeBtn) return;
            var theme = currentTheme();
            var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
            var label = translations[lang][theme === 'dark' ? 'theme-toggle-light' : 'theme-toggle'];
            themeBtn.setAttribute('aria-label', label);
            themeBtn.title = label;
            themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            var icon = themeBtn.querySelector('i');
            if (icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
        }
        function setTheme(theme, animate) {
            if (theme !== 'dark') theme = 'light';
            if (animate) {
                document.documentElement.classList.add('theme-anim');
                clearTimeout(themeAnimT);
                themeAnimT = setTimeout(function () {
                    document.documentElement.classList.remove('theme-anim');
                }, 400);
            }
            document.documentElement.dataset.theme = theme;
            lsSet(THEME_KEY, theme);
            var meta = document.querySelector('meta[name="theme-color"]:not([media])');
            if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A0F1A' : '#F6F8FB');
            syncThemeBtn();
            window.dispatchEvent(new CustomEvent('hh-themechange', { detail: { theme: theme } }));
        }
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
            });
            syncThemeBtn(); /* estado inicial (theme-init pudo haber puesto dark) */
            document.addEventListener('lang:changed', syncThemeBtn);
        }

        /* live GMT-6 clocks (El Salvador has no DST) */
        var clocks = document.querySelectorAll('[data-clock]');
        function tick() {
            var now = new Date();
            var h = (now.getUTCHours() + 24 - 6) % 24;
            var pad = function (n) { return (n < 10 ? '0' : '') + n; };
            var s = pad(h) + ':' + pad(now.getUTCMinutes()) + ':' + pad(now.getUTCSeconds());
            clocks.forEach(function (c) { c.textContent = s; });
        }
        if (clocks.length) { tick(); setInterval(tick, 1000); }

        /* navbar scrolled state */
        var navbar = document.getElementById('navbar');
        function onScrollNav() { navbar.classList.toggle('scrolled', window.scrollY > 50); }
        window.addEventListener('scroll', onScrollNav, { passive: true });
        onScrollNav();

        /* mobile nav */
        var navToggle = document.getElementById('navToggle');
        var navLinks = document.getElementById('navLinks');
        if (navToggle && navLinks) {
            var closeNav = function () {
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            };
            navToggle.addEventListener('click', function () {
                var open = navLinks.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                document.body.style.overflow = open ? 'hidden' : '';
            });
            navLinks.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', closeNav);
            });
            // release the scroll lock if the viewport leaves the mobile breakpoint
            var mqNav = window.matchMedia('(max-width: 900px)');
            var onMq = function (e) { if (!e.matches) closeNav(); };
            if (mqNav.addEventListener) mqNav.addEventListener('change', onMq);
            else if (mqNav.addListener) mqNav.addListener(onMq);
        }

        /* scroll progress bar */
        var progress = document.querySelector('.scroll-progress');
        if (progress) {
            var onProg = function () {
                var doc = document.documentElement;
                var max = doc.scrollHeight - window.innerHeight;
                var p = max > 0 ? window.scrollY / max : 0;
                progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
            };
            window.addEventListener('scroll', onProg, { passive: true });
            onProg();
        }

        /* sticky pill: appears after the hero, dismissible per session */
        var pill = document.getElementById('stickyPill');
        var pillClose = document.getElementById('pillClose');
        var pillDismissed = false;
        try { pillDismissed = sessionStorage.getItem('hh_pill') === 'off'; } catch (e) { }
        function onPill() {
            if (pillDismissed) return;
            if (window.scrollY > window.innerHeight * 0.9) { pill.hidden = false; }
        }
        if (pill && !pillDismissed) {
            window.addEventListener('scroll', onPill, { passive: true });
        }
        if (pillClose) {
            pillClose.addEventListener('click', function () {
                pillDismissed = true;
                pill.hidden = true;
                window.removeEventListener('scroll', onPill);
                try { sessionStorage.setItem('hh_pill', 'off'); } catch (e) { }
            });
        }

        /* scrollspy for nav links */
        if ('IntersectionObserver' in window) {
            var sections = document.querySelectorAll('main section[id], header#hero');
            var navAnchors = {};
            document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
                navAnchors[a.getAttribute('href').slice(1)] = a;
            });
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        Object.keys(navAnchors).forEach(function (id) {
                            navAnchors[id].classList.toggle('active', id === en.target.id);
                        });
                    }
                });
            }, { rootMargin: '-40% 0px -55% 0px' });
            sections.forEach(function (s) { spy.observe(s); });
        }

        /* ---------- motion layer (GSAP gate: no JS/anim -> static page) ---------- */
        var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
        if (!hasGsap || reduceMotion) {
            document.querySelectorAll('.odo').forEach(function (el) { renderOdo(el, 1); });
            return;
        }
        document.documentElement.classList.add('js-anim');
        gsap.registerPlugin(ScrollTrigger);

        /* Lenis smooth scroll (fine pointers only) */
        if (typeof window.Lenis !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
            var lenis = new Lenis({ lerp: 0.09 });
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
            document.addEventListener('click', function (e) {
                var a = e.target.closest('a[href^="#"]');
                if (!a) return;
                var target = document.querySelector(a.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                history.pushState(null, '', '#' + target.id);
                lenis.scrollTo(target, { offset: -72 });
            }, true);
            window.__lenis = lenis;
        }

        /* reveal batches */
        ScrollTrigger.batch('.rv', {
            start: 'top 85%',
            once: true,
            onEnter: function (batch) {
                batch.forEach(function (el) { el.classList.add('is-in'); });
            }
        });
        // after full load: re-measure and honor a direct #anchor visit
        window.addEventListener('load', function () {
            ScrollTrigger.refresh();
            if (location.hash) {
                var target = document.getElementById(location.hash.slice(1));
                if (!target) return;
                if (window.__lenis) window.__lenis.scrollTo(target, { offset: -72, immediate: true });
                else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 72);
            }
        });

        /* odometers */
        function renderOdo(el, progress) {
            var target = parseFloat(el.getAttribute('data-target') || '0');
            var suffix = el.getAttribute('data-suffix') || '';
            el.textContent = Math.round(target * progress) + suffix;
        }
        document.querySelectorAll('.odo').forEach(function (el) {
            var obj = { p: 0 };
            ScrollTrigger.create({
                trigger: el, start: 'top 90%', once: true,
                onEnter: function () {
                    gsap.to(obj, {
                        p: 1, duration: 1.2, ease: 'power2.out',
                        onUpdate: function () { renderOdo(el, obj.p); }
                    });
                }
            });
        });

        /* magnetic buttons (fine pointer only) */
        if (window.matchMedia('(pointer: fine)').matches) {
            document.querySelectorAll('.magnetic').forEach(function (el) {
                var xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
                var yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
                el.addEventListener('mousemove', function (e) {
                    var r = el.getBoundingClientRect();
                    xTo(((e.clientX - r.left) / r.width - 0.5) * 12);
                    yTo(((e.clientY - r.top) / r.height - 0.5) * 12);
                });
                el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
            });

            /* 3D tilt on the hero photo — listeners live on the static
               wrapper (.hero-photo) so the rotating frame never moves its
               own hit area out from under the cursor */
            var tiltWrap = document.querySelector('.hero-photo');
            var tiltFrame = tiltWrap && tiltWrap.querySelector('.photo-frame');
            if (tiltFrame) {
                var rxTo = gsap.quickTo(tiltFrame, 'rotationX', { duration: 0.5, ease: 'power3.out' });
                var ryTo = gsap.quickTo(tiltFrame, 'rotationY', { duration: 0.5, ease: 'power3.out' });
                tiltWrap.addEventListener('mousemove', function (e) {
                    var r = tiltWrap.getBoundingClientRect();
                    ryTo(((e.clientX - r.left) / r.width - 0.5) * 10);
                    rxTo(-((e.clientY - r.top) / r.height - 0.5) * 10);
                });
                tiltWrap.addEventListener('mouseleave', function () { rxTo(0); ryTo(0); });
            }
        }

        /* re-measure reveals when language changes (line lengths differ) */
        document.addEventListener('lang:changed', function () { ScrollTrigger.refresh(); });
    });
})();
