// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ========== MOBILE NAV TOGGLE ==========
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.className = 'ph ph-x';
        document.body.style.overflow = 'hidden';
    } else {
        icon.className = 'ph ph-list';
        document.body.style.overflow = '';
    }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.querySelector('i').className = 'ph ph-list';
        document.body.style.overflow = '';
    });
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========== INTERSECTION OBSERVER — ANIMATE ON SCROLL ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('.problem-card, .service-card, .project-card, .project-card.compact, .process-step, .stack-category, .cert-group, .diff-card, .about-card, .proof-item, .projects-duo').forEach(el => {
    el.classList.add('animate-target');
    observer.observe(el);
});

// ========== ACTIVE NAV LINK HIGHLIGHT ==========
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ========== LANGUAGE TOGGLE ==========
const translations = {
    es: {
        // Nav
        'nav-problemas': 'Problemas',
        'nav-servicios': 'Servicios',
        'nav-proyectos': 'Proyectos',
        'nav-stack': 'Stack',
        'nav-sobre-mi': 'Sobre m\u00ed',
        'nav-cta': 'Agendar consulta',

        // Hero
        'hero-badge-countries': '<i class="ph ph-globe-hemisphere-west"></i> 4 pa\u00edses',
        'hero-title': 'Elimino el caos operativo de tu empresa con <span class="text-gradient">sistemas digitales</span> que funcionan desde el d\u00eda uno',
        'hero-subtitle': 'Dise\u00f1o e implemento soluciones con Microsoft Power Platform que reemplazan procesos manuales, hojas de Excel compartidas y aprobaciones por correo, por sistemas integrados con automatizaci\u00f3n, datos en tiempo real y control real sobre las operaciones.',
        'hero-cta-primary': '<i class="ph ph-calendar-check"></i> Agenda una consulta de diagn\u00f3stico',
        'hero-cta-secondary': '<i class="ph ph-folder-open"></i> Ver proyectos',
        'hero-stack-label': 'Stack principal:',

        // Proof bar
        'proof-certs': 'Certificaciones Microsoft',
        'proof-solutions': 'Soluciones en producci\u00f3n',
        'proof-countries': 'Pa\u00edses atendidos',
        'proof-years': 'A\u00f1os de experiencia',

        // Problems section
        'problems-tag': 'El diagn\u00f3stico',
        'problems-title': '\u00bfEsto te suena familiar?',
        'problems-subtitle': 'Si te identificas con al menos dos de estos problemas, puedo ayudarte.',
        'problem-1-title': 'Tu operaci\u00f3n vive en Excel',
        'problem-1-desc': 'Hojas compartidas por correo que nadie sabe cu\u00e1l es la versi\u00f3n correcta. Los datos se pierden, se duplican o se corrompen. Si la persona que maneja "el Excel maestro" se va de vacaciones, el proceso se detiene.',
        'problem-2-title': 'Tus aprobaciones son por email o WhatsApp',
        'problem-2-desc': 'Los procesos de aprobaci\u00f3n dependen de que alguien lea un correo o un mensaje. No hay trazabilidad, no hay tiempos medibles, no hay escalamiento autom\u00e1tico. Las solicitudes se pierden entre bandejas de entrada.',
        'problem-3-title': 'Tus reportes se arman manualmente cada semana',
        'problem-3-desc': 'Alguien exporta datos de un sistema, los pega en Excel, les da formato y env\u00eda un PDF por correo. Cada semana. Y a\u00fan as\u00ed, los n\u00fameros no siempre cuadran.',
        'problem-4-title': 'No tienes visibilidad en tiempo real',
        'problem-4-desc': 'Para saber c\u00f3mo va el negocio hoy, tienes que preguntar, esperar, y confiar en que la respuesta sea correcta. No hay dashboard, no hay datos actualizados, no hay certeza.',
        'problem-5-title': 'Tus sistemas no se hablan entre s\u00ed',
        'problem-5-desc': 'Datos en SQL Server, tickets en un service desk, documentos en SharePoint, seguimiento en Excel. Nada se conecta. Los datos est\u00e1n fragmentados y nadie tiene la foto completa.',
        'problem-6-title': 'Dependes de una persona clave',
        'problem-6-desc': 'Si esa persona se va de vacaciones, se enferma o renuncia, el proceso se detiene. No hay documentaci\u00f3n, no hay sistema. Solo conocimiento en la cabeza de alguien.',

        // Services section
        'services-tag': 'Soluciones',
        'services-title': 'Servicios',
        'services-subtitle': 'Soluciones de digitalizaci\u00f3n y automatizaci\u00f3n con Microsoft Power Platform',
        'service-badge-popular': 'M\u00e1s solicitado',
        'service-1-title': 'Automatizaci\u00f3n de Procesos Operativos',
        'service-1-desc': 'Reemplazo flujos manuales repetitivos por automatizaciones que se ejecutan solas: aprobaciones, notificaciones, generaci\u00f3n de documentos, sincronizaci\u00f3n de datos entre sistemas.',
        'service-1-item-1': 'Diagn\u00f3stico de procesos candidatos',
        'service-1-item-2': 'Flujos en Power Automate (Cloud + Desktop)',
        'service-1-item-3': 'Manejo de errores y logging',
        'service-1-item-4': 'Documentaci\u00f3n y capacitaci\u00f3n',
        'service-1-result': 'Tu equipo deja de hacer trabajo mec\u00e1nico y se enfoca en decisiones.',
        'service-2-title': 'Aplicaciones de Negocio a Medida',
        'service-2-desc': 'Dise\u00f1o y construyo aplicaciones empresariales con Power Apps conectadas a tus datos reales. Portales de solicitudes, registros de campo, gesti\u00f3n documental, inventarios.',
        'service-2-item-1': 'Levantamiento de requerimientos',
        'service-2-item-2': 'Desarrollo en Power Apps (Canvas/Model-Driven)',
        'service-2-item-3': 'Flujos de automatizaci\u00f3n asociados',
        'service-2-item-4': 'Seguridad por rol y responsive design',
        'service-2-result': 'Apps funcionales en semanas, no en meses.',
        'service-3-title': 'Dashboards e Inteligencia Operativa',
        'service-3-desc': 'Conecto tus fuentes de datos (SQL, APIs, SharePoint, Excel, service desks) en dashboards de Power BI que muestran lo que importa: KPIs, tendencias, alertas y detalle bajo demanda.',
        'service-3-item-1': 'Conexi\u00f3n a m\u00faltiples fuentes de datos',
        'service-3-item-2': 'Modelado DAX + Power Query avanzado',
        'service-3-item-3': 'Refresh autom\u00e1tico y seguridad por rol',
        'service-3-item-4': 'Publicaci\u00f3n en Power BI Service',
        'service-3-result': 'Datos reales, actualizados, sin manipulaci\u00f3n manual.',
        'service-4-title': 'Gesti\u00f3n Documental con Control',
        'service-4-desc': 'Implemento sistemas de control documental sobre SharePoint con codificaci\u00f3n estandarizada, versionado, permisos por rol y b\u00fasqueda inteligente con IA.',
        'service-4-item-1': 'Codificaci\u00f3n autom\u00e1tica de documentos',
        'service-4-item-2': 'B\u00fasqueda con AI Builder + KQL',
        'service-4-item-3': 'Filtros de seguridad por \u00e1rea y rol',
        'service-4-item-4': 'Trazabilidad para auditor\u00edas',
        'service-4-result': 'Tu documentaci\u00f3n deja de ser un caos y se vuelve un activo gestionado.',
        'service-5-title': 'Portales de Solicitudes y Aprobaciones',
        'service-5-desc': 'Portales digitales con formularios inteligentes, flujos de aprobaci\u00f3n multinivel, notificaciones autom\u00e1ticas, escalamiento por tiempo y trazabilidad completa.',
        'service-5-item-1': 'Formulario Power Apps con validaciones',
        'service-5-item-2': 'Aprobaciones paralelas/secuenciales',
        'service-5-item-3': 'Notificaciones email + Teams',
        'service-5-item-4': 'Dashboard de seguimiento',
        'service-5-result': 'De d\u00edas de aprobaci\u00f3n manual a horas autom\u00e1ticas.',
        'service-6-title': 'Consultor\u00eda y Roadmap de Digitalizaci\u00f3n',
        'service-6-desc': 'Analizo tus procesos actuales, identifico cuellos de botella y oportunidades de automatizaci\u00f3n, y entrego un roadmap priorizado con soluciones concretas.',
        'service-6-item-1': 'Mapeo de procesos (AS-IS / TO-BE)',
        'service-6-item-2': 'Evaluaci\u00f3n de madurez digital',
        'service-6-item-3': 'Roadmap 3-6-12 meses con ROI',
        'service-6-item-4': 'Documento ejecutivo para directivos',
        'service-6-result': 'Sin humo, sin promesas vac\u00edas: un plan ejecutable.',

        // Process / Methodology
        'process-tag': 'Metodolog\u00eda',
        'process-title': 'C\u00f3mo trabajo',
        'process-subtitle': 'Un proceso claro de 5 pasos para llevar tu operaci\u00f3n de manual a digital',
        'step-1-title': 'Diagn\u00f3stico',
        'step-1-duration': '1-2 d\u00edas',
        'step-1-desc': 'Entiendo tu operaci\u00f3n actual: qu\u00e9 procesos duelen, d\u00f3nde se pierde tiempo, qu\u00e9 informaci\u00f3n falta. No asumo. Pregunto, observo y documento antes de proponer nada.',
        'step-2-title': 'Dise\u00f1o de la soluci\u00f3n',
        'step-2-duration': '2-3 d\u00edas',
        'step-2-desc': 'Defino la arquitectura t\u00e9cnica, los flujos de datos, la experiencia de usuario y los criterios de \u00e9xito. Plan claro con alcance, entregables, tiempos y dependencias.',
        'step-3-title': 'Construcci\u00f3n iterativa',
        'step-3-duration': '2-8 semanas',
        'step-3-desc': 'Construyo en ciclos cortos con entregas funcionales cada 1-2 semanas. Ves avance real desde el inicio, puedes probar temprano y ajustar sin esperar al final.',
        'step-4-title': 'Pruebas y ajuste',
        'step-4-duration': '3-5 d\u00edas',
        'step-4-desc': 'Valido con usuarios reales, corrijo problemas de usabilidad y rendimiento. La soluci\u00f3n no se entrega hasta que funcione en el contexto real de tu equipo.',
        'step-5-title': 'Entrega y transferencia',
        'step-5-duration': '1-2 d\u00edas',
        'step-5-desc': 'Entrego en producci\u00f3n con documentaci\u00f3n t\u00e9cnica, gu\u00eda de usuario y sesi\u00f3n de capacitaci\u00f3n. Tu equipo queda capacitado para operar y mantener lo construido.',

        // Projects section
        'projects-tag': 'Portafolio',
        'projects-title': 'Proyectos en producci\u00f3n',
        'projects-subtitle': 'Procesos reales que he digitalizado para empresas de la regi\u00f3n',

        // Project 1
        'proj1-tag-ai': 'IA Aplicada',
        'proj1-industry': 'Servicios IT Gestionados \u2014 Regional LATAM',
        'proj1-title': 'Asistente T\u00e9cnico con Inteligencia Artificial',
        'proj1-tagline': 'De buscar manuales por horas a encontrar respuestas en segundos',
        'label-problem': 'Problema',
        'label-solution': 'Soluci\u00f3n',
        'label-results': 'Resultados',
        'proj1-problem': 'T\u00e9cnicos de campo perd\u00edan tiempo significativo buscando documentaci\u00f3n t\u00e9cnica. Navegaban carpetas de SharePoint sin sistema de b\u00fasqueda inteligente, enviaban mensajes a colegas pidiendo archivos, o resolv\u00edan sin consultar la documentaci\u00f3n oficial.',
        'proj1-solution': 'App en Power Apps donde el t\u00e9cnico escribe su consulta en lenguaje natural. AI Builder extrae keywords, se construye una query KQL contra SharePoint Search API, se filtran resultados por \u00e1rea/rol del t\u00e9cnico, y se devuelven documentos relevantes en segundos.',
        'proj1-result-1': 'B\u00fasqueda de documentaci\u00f3n pas\u00f3 de minutos a segundos',
        'proj1-result-2': 'Elimin\u00f3 dependencia de "preguntarle al que sabe"',
        'proj1-result-3': 'Escalaciones por falta de informaci\u00f3n reducidas visiblemente',
        'proj1-result-4': 'Seguridad por rol: cada t\u00e9cnico ve solo lo que le corresponde',
        'proj1-arch-title': 'Arquitectura de la soluci\u00f3n',
        'arch-technician': 'T\u00e9cnico',

        // Project 2
        'proj2-industry': 'Service Desk Regional',
        'proj2-title': 'Dashboard Ejecutivo Multi-Fuente',
        'proj2-tagline': 'Unificando datos de 3 service desks en un solo dashboard',
        'proj2-problem': 'Tres fuentes de datos distintas (SolarWinds, Redmine, SQL Server FSM) sin vista unificada. Para ver el panorama completo, hab\u00eda que entrar a tres portales diferentes. La gerencia tomaba decisiones con informaci\u00f3n parcial.',
        'proj2-solution': 'Dashboard ejecutivo en Power BI conectando las tres fuentes. Queries M con paginaci\u00f3n din\u00e1mica (List.Generate) para APIs, gateway on-premises para SQL Server, modelo dimensional unificado y refresh autom\u00e1tico.',
        'proj2-result-1': 'Vista consolidada de toda la operaci\u00f3n de soporte',
        'proj2-result-2': 'Elimin\u00f3 preparaci\u00f3n manual de reportes ejecutivos',
        'proj2-result-3': 'Identific\u00f3 patrones de carga por pa\u00eds y t\u00e9cnico',
        'proj2-result-4': 'Visibilidad en tiempo real para toma de decisiones',
        'proj2-arch-title': 'Fuentes de datos integradas',

        // Project 3
        'proj3-industry': 'Gobierno Documental Corporativo',
        'proj3-title': 'Sistema de Gesti\u00f3n Documental',
        'proj3-tagline': 'De carpetas compartidas a gobierno de la informaci\u00f3n',
        'proj3-problem': 'Documentaci\u00f3n en carpetas sin clasificaci\u00f3n formal, versiones duplicadas, sin permisos por rol, sin trazabilidad. Auditor\u00edas internas requer\u00edan esfuerzo manual para demostrar control.',
        'proj3-solution': 'Listado Maestro con codificaci\u00f3n estructurada [\u00c1REA-CLASE-ALCANCE-CORRELATIVO-VERSI\u00d3N], generaci\u00f3n autom\u00e1tica de c\u00f3digos v\u00eda Power Automate, Power App como frontend, filtros de seguridad por \u00e1rea y rol.',
        'proj3-result-1': 'Cat\u00e1logo maestro con c\u00f3digo \u00fanico y versi\u00f3n vigente',
        'proj3-result-2': 'Permisos controlados: cada usuario ve solo lo que corresponde',
        'proj3-result-3': 'Generaci\u00f3n autom\u00e1tica elimin\u00f3 errores de clasificaci\u00f3n',
        'proj3-result-4': 'Base lista para auditor\u00edas con trazabilidad completa',
        'proj3-arch-title': 'Estructura de codificaci\u00f3n',
        'code-area': '\u00c1rea',
        'code-class': 'Clase',
        'code-scope': 'Alcance',
        'code-serial': 'Corr.',
        'code-version': 'Versi\u00f3n',

        // Project 4
        'proj4-title': 'Portal de Solicitudes de Viaje',
        'proj4-tagline': 'Solicitudes de viaje con aprobaci\u00f3n digital multinivel',
        'proj4-desc': 'Portal digital que reemplaz\u00f3 aprobaciones por correo con formulario estandarizado, flujo multinivel autom\u00e1tico, notificaciones en tiempo real y tracking de estado. Estandarizado para todos los pa\u00edses de operaci\u00f3n.',
        'proj4-result-1': 'Elimin\u00f3 dependencia de correo electr\u00f3nico',
        'proj4-result-2': 'Estado visible en tiempo real para el solicitante',
        'proj4-result-3': 'Trazabilidad completa de cada aprobaci\u00f3n',

        // Project 5
        'proj5-title': 'Solicitud de Orden de Compra',
        'proj5-tagline': '\u00d3rdenes de compra trazables de solicitud a cierre',
        'proj5-desc': 'Sistema digital con formulario estructurado, aprobaciones por monto y \u00e1rea, gesti\u00f3n de estados (8 estados), adjuntos vinculados por orden, y reporter\u00eda de compras consolidada.',
        'proj5-result-1': 'Formato \u00fanico y estandarizado para todas las \u00e1reas',
        'proj5-result-2': 'Adjuntos viajan con la solicitud, no por separado',
        'proj5-result-3': 'Compliance y control de gasto auditable',

        // Project 6
        'proj6-industry': 'Operaciones Internas \u2014 Lenovo LATAM',
        'proj6-title': 'Automatizaci\u00f3n RPA para Sistemas Legacy',
        'proj6-tagline': 'Bots que procesan lo que nadie quiere procesar',
        'proj6-problem': 'Procesos manuales repetitivos con archivos Excel: importaciones masivas de casos FSM para m\u00faltiples pa\u00edses LATAM, formatos de fecha inconsistentes, archivos bloqueados por OneDrive sync.',
        'proj6-solution': 'Suite de bots en Power Automate Desktop con manejo de OneDrive sync, validaci\u00f3n autom\u00e1tica de formatos por pa\u00eds, procesamiento batch de 500 registros, orquestaci\u00f3n desde cloud flows.',
        'proj6-result-1': 'Horas semanales de trabajo manual eliminadas',
        'proj6-result-2': 'Errores de formato y datos eliminados por completo',
        'proj6-result-3': 'Procesos independientes de personas espec\u00edficas',
        'proj6-result-4': 'Personal redirigido a actividades de mayor valor',
        'proj6-arch-title': 'Flujo de automatizaci\u00f3n',

        // Stack section
        'stack-tag': 'Herramientas',
        'stack-title': 'Stack tecnol\u00f3gico y certificaciones',
        'stack-subtitle': 'Trabajo exclusivamente dentro del ecosistema Microsoft. Esto no es una limitaci\u00f3n: es una decisi\u00f3n estrat\u00e9gica. Todo lo que construyo se integra nativamente con Microsoft 365.',
        'stack-cat-apps': 'Aplicaciones',
        'stack-cat-automation': 'Automatizaci\u00f3n',
        'stack-cat-data': 'Datos e Inteligencia',
        'stack-cat-integrations': 'Integraciones',
        'stack-cat-platform': 'Plataforma',
        'stack-cat-governance': 'Gobernanza',
        'certs-title': '18 Certificaciones Microsoft Activas',
        'certs-subtitle': 'Cada certificaci\u00f3n representa conocimiento validado y experiencia aplicada en proyectos reales.',

        // About me
        'about-tag': 'Sobre m\u00ed',
        'about-p1': 'Empec\u00e9 mi carrera en el mundo de la infraestructura y el soporte t\u00e9cnico. Ah\u00ed aprend\u00ed algo que muchos tecn\u00f3logos nunca entienden: <strong>la tecnolog\u00eda no vale nada si no resuelve un problema real del negocio.</strong>',
        'about-p2': 'Con el tiempo, me fui moviendo hacia la automatizaci\u00f3n y la gesti\u00f3n de datos. Vi de primera mano c\u00f3mo empresas enteras operaban con hojas de Excel compartidas por correo, aprobaciones por WhatsApp, reportes armados manualmente cada lunes, y procesos cr\u00edticos que depend\u00edan de que "alguien se acordara" de hacer algo.',
        'about-p3': 'Ah\u00ed encontr\u00e9 mi misi\u00f3n profesional: <strong>eliminar esa fragilidad operativa.</strong>',
        'about-p4': 'Microsoft Power Platform se convirti\u00f3 en mi herramienta principal porque permite tomar un proceso roto y convertirlo en un sistema digital completo \u2014 con interfaz, base de datos, automatizaci\u00f3n, aprobaciones y reporter\u00eda \u2014 sin necesidad de desarrollo custom de meses ni presupuestos de medio mill\u00f3n de d\u00f3lares.',
        'about-p5': 'Hoy, con 18 certificaciones Microsoft, una maestr\u00eda en Ciencia de Datos y experiencia operando con clientes en Centroam\u00e9rica y el Caribe, me dedico a una sola cosa: <strong>ayudar a empresas a dejar de operar en modo manual y empezar a operar en modo digital.</strong>',
        'about-base-label': 'Base',
        'about-education-label': 'Formaci\u00f3n',
        'about-education-value': 'Ing. en Sistemas + MSc Ciencia de Datos',
        'about-certs-label': 'Certificaciones',
        'about-coverage-label': 'Cobertura',
        'about-coverage-value': 'El Salvador, Guatemala, Costa Rica, Rep. Dominicana',
        'about-company-label': 'Empresa',
        'about-languages-label': 'Idiomas',
        'about-languages-value': 'Espa\u00f1ol nativo, Ingl\u00e9s profesional',

        // Differentiation
        'diff-tag': 'Diferenciaci\u00f3n',
        'diff-title': '\u00bfPor qu\u00e9 trabajar conmigo?',
        'diff-1-title': 'Sistema completo, no piezas sueltas',
        'diff-1-desc': 'No entrego un dashboard o una app aislada. Entrego el sistema completo: interfaz + base de datos + automatizaci\u00f3n + aprobaciones + reporter\u00eda. Todo conectado.',
        'diff-2-title': 'Producci\u00f3n, no demos',
        'diff-2-desc': 'Cada soluci\u00f3n incluye manejo de errores (Try-Catch), logging, seguridad por roles validada en backend, documentaci\u00f3n t\u00e9cnica y capacitaci\u00f3n. No es un prototipo bonito que falla en la realidad.',
        'diff-3-title': 'Negocio primero, tecnolog\u00eda despu\u00e9s',
        'diff-3-desc': 'No vendo herramientas. Entiendo tu operaci\u00f3n, mapeo tu proceso y dise\u00f1o la soluci\u00f3n que resuelve tu problema real. La tecnolog\u00eda es el medio, no el fin.',
        'diff-4-title': 'Transferencia de conocimiento',
        'diff-4-desc': 'Cada proyecto incluye documentaci\u00f3n completa y capacitaci\u00f3n. Mi objetivo es entregar sistemas que funcionen sin m\u00ed despu\u00e9s de la implementaci\u00f3n.',

        // CTA
        'cta-title': '\u00bfListo para dejar de operar en modo manual?',
        'cta-subtitle': 'Agenda una consulta de diagn\u00f3stico sin costo. En 30 minutos revisamos tu proceso m\u00e1s cr\u00edtico y te digo con honestidad si puedo ayudarte y c\u00f3mo.',
        'cta-button': '<i class="ph ph-calendar-check"></i> Agendar consulta de diagn\u00f3stico',
        'cta-note': 'Sin compromiso. Sin pitch de ventas. Solo una conversaci\u00f3n para entender tu situaci\u00f3n y ver si puedo ayudarte.',
        'cta-whatsapp-label': 'Respuesta r\u00e1pida',
        'cta-upwork-label': 'Contr\u00e1tame en Upwork',

        // Footer
        'footer-services': 'Servicios',
        'footer-projects': 'Proyectos',
        'footer-about': 'Sobre m\u00ed',
        'footer-contact': 'Contacto',
        'footer-copy': '&copy; 2026 Humberto Henr\u00edquez. Todos los derechos reservados.'
    },
    en: {
        // Nav
        'nav-problemas': 'Problems',
        'nav-servicios': 'Services',
        'nav-proyectos': 'Projects',
        'nav-stack': 'Stack',
        'nav-sobre-mi': 'About',
        'nav-cta': 'Book a call',

        // Hero
        'hero-badge-countries': '<i class="ph ph-globe-hemisphere-west"></i> 4 countries',
        'hero-title': 'I eliminate operational chaos from your business with <span class="text-gradient">digital systems</span> that work from day one',
        'hero-subtitle': 'I design and implement solutions with Microsoft Power Platform that replace manual processes, shared spreadsheets and email approvals with integrated systems featuring automation, real-time data, and real operational control.',
        'hero-cta-primary': '<i class="ph ph-calendar-check"></i> Book a diagnostic call',
        'hero-cta-secondary': '<i class="ph ph-folder-open"></i> View projects',
        'hero-stack-label': 'Main stack:',

        // Proof bar
        'proof-certs': 'Microsoft Certifications',
        'proof-solutions': 'Solutions in production',
        'proof-countries': 'Countries served',
        'proof-years': 'Years of experience',

        // Problems section
        'problems-tag': 'The diagnosis',
        'problems-title': 'Does this sound familiar?',
        'problems-subtitle': 'If you identify with at least two of these problems, I can help.',
        'problem-1-title': 'Your operation lives in Excel',
        'problem-1-desc': 'Shared spreadsheets emailed around that nobody knows which version is correct. Data gets lost, duplicated, or corrupted. If the person managing "the master Excel" goes on vacation, the process stops.',
        'problem-2-title': 'Your approvals run on email or WhatsApp',
        'problem-2-desc': 'Approval processes depend on someone reading an email or message. No traceability, no measurable timelines, no automatic escalation. Requests get lost in inboxes.',
        'problem-3-title': 'Your reports are built manually every week',
        'problem-3-desc': 'Someone exports data from a system, pastes it in Excel, formats it, and sends a PDF by email. Every week. And still, the numbers don\'t always add up.',
        'problem-4-title': 'You have no real-time visibility',
        'problem-4-desc': 'To know how the business is doing today, you have to ask, wait, and trust the answer is correct. No dashboard, no updated data, no certainty.',
        'problem-5-title': 'Your systems don\'t talk to each other',
        'problem-5-desc': 'Data in SQL Server, tickets in a service desk, documents in SharePoint, tracking in Excel. Nothing connects. Data is fragmented and nobody has the complete picture.',
        'problem-6-title': 'You depend on a key person',
        'problem-6-desc': 'If that person goes on vacation, gets sick, or quits, the process stops. No documentation, no system. Just knowledge in someone\'s head.',

        // Services section
        'services-tag': 'Solutions',
        'services-title': 'Services',
        'services-subtitle': 'Digitization and automation solutions with Microsoft Power Platform',
        'service-badge-popular': 'Most requested',
        'service-1-title': 'Operational Process Automation',
        'service-1-desc': 'I replace repetitive manual workflows with automations that run on their own: approvals, notifications, document generation, data synchronization between systems.',
        'service-1-item-1': 'Candidate process diagnosis',
        'service-1-item-2': 'Power Automate flows (Cloud + Desktop)',
        'service-1-item-3': 'Error handling and logging',
        'service-1-item-4': 'Documentation and training',
        'service-1-result': 'Your team stops doing mechanical work and focuses on decisions.',
        'service-2-title': 'Custom Business Applications',
        'service-2-desc': 'I design and build enterprise applications with Power Apps connected to your real data. Request portals, field registries, document management, inventories.',
        'service-2-item-1': 'Requirements gathering',
        'service-2-item-2': 'Power Apps development (Canvas/Model-Driven)',
        'service-2-item-3': 'Associated automation flows',
        'service-2-item-4': 'Role-based security and responsive design',
        'service-2-result': 'Functional apps in weeks, not months.',
        'service-3-title': 'Dashboards & Operational Intelligence',
        'service-3-desc': 'I connect your data sources (SQL, APIs, SharePoint, Excel, service desks) into Power BI dashboards that show what matters: KPIs, trends, alerts and detail on demand.',
        'service-3-item-1': 'Connection to multiple data sources',
        'service-3-item-2': 'Advanced DAX + Power Query modeling',
        'service-3-item-3': 'Automatic refresh and role-based security',
        'service-3-item-4': 'Publishing to Power BI Service',
        'service-3-result': 'Real data, up to date, without manual manipulation.',
        'service-4-title': 'Document Management with Control',
        'service-4-desc': 'I implement document control systems on SharePoint with standardized coding, versioning, role-based permissions and AI-powered intelligent search.',
        'service-4-item-1': 'Automatic document coding',
        'service-4-item-2': 'Search with AI Builder + KQL',
        'service-4-item-3': 'Security filters by area and role',
        'service-4-item-4': 'Audit traceability',
        'service-4-result': 'Your documentation stops being chaos and becomes a managed asset.',
        'service-5-title': 'Request & Approval Portals',
        'service-5-desc': 'Digital portals with smart forms, multi-level approval flows, automatic notifications, time-based escalation and full traceability.',
        'service-5-item-1': 'Power Apps form with validations',
        'service-5-item-2': 'Parallel/sequential approvals',
        'service-5-item-3': 'Email + Teams notifications',
        'service-5-item-4': 'Tracking dashboard',
        'service-5-result': 'From days of manual approval to automatic hours.',
        'service-6-title': 'Digitization Consulting & Roadmap',
        'service-6-desc': 'I analyze your current processes, identify bottlenecks and automation opportunities, and deliver a prioritized roadmap with concrete solutions.',
        'service-6-item-1': 'Process mapping (AS-IS / TO-BE)',
        'service-6-item-2': 'Digital maturity assessment',
        'service-6-item-3': '3-6-12 month roadmap with ROI',
        'service-6-item-4': 'Executive document for leadership',
        'service-6-result': 'No smoke, no empty promises: an executable plan.',

        // Process / Methodology
        'process-tag': 'Methodology',
        'process-title': 'How I work',
        'process-subtitle': 'A clear 5-step process to take your operation from manual to digital',
        'step-1-title': 'Diagnosis',
        'step-1-duration': '1-2 days',
        'step-1-desc': 'I understand your current operation: which processes hurt, where time is lost, what information is missing. I don\'t assume. I ask, observe and document before proposing anything.',
        'step-2-title': 'Solution design',
        'step-2-duration': '2-3 days',
        'step-2-desc': 'I define the technical architecture, data flows, user experience and success criteria. A clear plan with scope, deliverables, timelines and dependencies.',
        'step-3-title': 'Iterative development',
        'step-3-duration': '2-8 weeks',
        'step-3-desc': 'I build in short cycles with functional deliveries every 1-2 weeks. You see real progress from the start, can test early and adjust without waiting until the end.',
        'step-4-title': 'Testing & adjustment',
        'step-4-duration': '3-5 days',
        'step-4-desc': 'I validate with real users, fix usability and performance issues. The solution is not delivered until it works in the real context of your team.',
        'step-5-title': 'Delivery & handoff',
        'step-5-duration': '1-2 days',
        'step-5-desc': 'I deliver to production with technical documentation, user guide and training session. Your team is equipped to operate and maintain what was built.',

        // Projects section
        'projects-tag': 'Portfolio',
        'projects-title': 'Projects in production',
        'projects-subtitle': 'Real processes I\'ve digitized for companies in the region',

        // Project 1
        'proj1-tag-ai': 'Applied AI',
        'proj1-industry': 'Managed IT Services \u2014 LATAM Regional',
        'proj1-title': 'AI-Powered Technical Assistant',
        'proj1-tagline': 'From searching manuals for hours to finding answers in seconds',
        'label-problem': 'Problem',
        'label-solution': 'Solution',
        'label-results': 'Results',
        'proj1-problem': 'Field technicians wasted significant time searching for technical documentation. They navigated SharePoint folders without an intelligent search system, sent messages to colleagues asking for files, or resolved issues without consulting official documentation.',
        'proj1-solution': 'A Power Apps app where the technician types their query in natural language. AI Builder extracts keywords, builds a KQL query against SharePoint Search API, filters results by the technician\'s area/role, and returns relevant documents in seconds.',
        'proj1-result-1': 'Documentation search went from minutes to seconds',
        'proj1-result-2': 'Eliminated dependency on "asking the expert"',
        'proj1-result-3': 'Escalations due to lack of information visibly reduced',
        'proj1-result-4': 'Role-based security: each technician sees only what they should',
        'proj1-arch-title': 'Solution architecture',
        'arch-technician': 'Technician',

        // Project 2
        'proj2-industry': 'Regional Service Desk',
        'proj2-title': 'Multi-Source Executive Dashboard',
        'proj2-tagline': 'Unifying data from 3 service desks into a single dashboard',
        'proj2-problem': 'Three different data sources (SolarWinds, Redmine, SQL Server FSM) with no unified view. To see the complete picture, you had to log into three different portals. Management was making decisions with partial information.',
        'proj2-solution': 'Executive dashboard in Power BI connecting all three sources. M queries with dynamic pagination (List.Generate) for APIs, on-premises gateway for SQL Server, unified dimensional model and automatic refresh.',
        'proj2-result-1': 'Consolidated view of the entire support operation',
        'proj2-result-2': 'Eliminated manual executive report preparation',
        'proj2-result-3': 'Identified workload patterns by country and technician',
        'proj2-result-4': 'Real-time visibility for decision making',
        'proj2-arch-title': 'Integrated data sources',

        // Project 3
        'proj3-industry': 'Corporate Document Governance',
        'proj3-title': 'Document Management System',
        'proj3-tagline': 'From shared folders to information governance',
        'proj3-problem': 'Documentation in folders without formal classification, duplicate versions, no role-based permissions, no traceability. Internal audits required manual effort to demonstrate control.',
        'proj3-solution': 'Master List with structured coding [AREA-CLASS-SCOPE-SERIAL-VERSION], automatic code generation via Power Automate, Power App as frontend, security filters by area and role.',
        'proj3-result-1': 'Master catalog with unique code and current version',
        'proj3-result-2': 'Controlled permissions: each user sees only what they should',
        'proj3-result-3': 'Automatic generation eliminated classification errors',
        'proj3-result-4': 'Audit-ready with full traceability',
        'proj3-arch-title': 'Coding structure',
        'code-area': 'Area',
        'code-class': 'Class',
        'code-scope': 'Scope',
        'code-serial': 'Serial',
        'code-version': 'Version',

        // Project 4
        'proj4-title': 'Travel Request Portal',
        'proj4-tagline': 'Travel requests with multi-level digital approval',
        'proj4-desc': 'Digital portal that replaced email-based approvals with a standardized form, automatic multi-level flow, real-time notifications and status tracking. Standardized for all countries of operation.',
        'proj4-result-1': 'Eliminated email dependency',
        'proj4-result-2': 'Real-time status visible to the requester',
        'proj4-result-3': 'Full traceability of every approval',

        // Project 5
        'proj5-title': 'Purchase Order Request',
        'proj5-tagline': 'Traceable purchase orders from request to closure',
        'proj5-desc': 'Digital system with structured form, approvals by amount and area, state management (8 states), attachments linked by order, and consolidated purchasing reports.',
        'proj5-result-1': 'Single standardized format for all areas',
        'proj5-result-2': 'Attachments travel with the request, not separately',
        'proj5-result-3': 'Compliance and auditable spend control',

        // Project 6
        'proj6-industry': 'Internal Operations \u2014 Lenovo LATAM',
        'proj6-title': 'RPA Automation for Legacy Systems',
        'proj6-tagline': 'Bots that process what nobody wants to process',
        'proj6-problem': 'Repetitive manual processes with Excel files: massive FSM case imports for multiple LATAM countries, inconsistent date formats, files locked by OneDrive sync.',
        'proj6-solution': 'Bot suite in Power Automate Desktop with OneDrive sync handling, automatic format validation by country, batch processing of 500 records, orchestration from cloud flows.',
        'proj6-result-1': 'Weekly hours of manual work eliminated',
        'proj6-result-2': 'Format and data errors completely eliminated',
        'proj6-result-3': 'Processes independent of specific individuals',
        'proj6-result-4': 'Staff redirected to higher-value activities',
        'proj6-arch-title': 'Automation flow',

        // Stack section
        'stack-tag': 'Tools',
        'stack-title': 'Tech stack and certifications',
        'stack-subtitle': 'I work exclusively within the Microsoft ecosystem. This is not a limitation: it\'s a strategic decision. Everything I build integrates natively with Microsoft 365.',
        'stack-cat-apps': 'Applications',
        'stack-cat-automation': 'Automation',
        'stack-cat-data': 'Data & Intelligence',
        'stack-cat-integrations': 'Integrations',
        'stack-cat-platform': 'Platform',
        'stack-cat-governance': 'Governance',
        'certs-title': '18 Active Microsoft Certifications',
        'certs-subtitle': 'Each certification represents validated knowledge and hands-on experience in real projects.',

        // About me
        'about-tag': 'About me',
        'about-p1': 'I started my career in infrastructure and technical support. That\'s where I learned something many technologists never understand: <strong>technology is worthless if it doesn\'t solve a real business problem.</strong>',
        'about-p2': 'Over time, I moved toward automation and data management. I saw firsthand how entire companies operated with spreadsheets shared by email, WhatsApp approvals, reports built manually every Monday, and critical processes that depended on "someone remembering" to do something.',
        'about-p3': 'That\'s where I found my professional mission: <strong>eliminating that operational fragility.</strong>',
        'about-p4': 'Microsoft Power Platform became my main tool because it allows you to take a broken process and turn it into a complete digital system \u2014 with interface, database, automation, approvals and reporting \u2014 without needing months of custom development or half-million dollar budgets.',
        'about-p5': 'Today, with 18 Microsoft certifications, a Master\'s in Data Science and experience operating with clients in Central America and the Caribbean, I dedicate myself to one thing: <strong>helping companies stop operating in manual mode and start operating in digital mode.</strong>',
        'about-base-label': 'Base',
        'about-education-label': 'Education',
        'about-education-value': 'Systems Eng. + MSc Data Science',
        'about-certs-label': 'Certifications',
        'about-coverage-label': 'Coverage',
        'about-coverage-value': 'El Salvador, Guatemala, Costa Rica, Dominican Rep.',
        'about-company-label': 'Company',
        'about-languages-label': 'Languages',
        'about-languages-value': 'Native Spanish, Professional English',

        // Differentiation
        'diff-tag': 'Differentiation',
        'diff-title': 'Why work with me?',
        'diff-1-title': 'Complete system, not loose pieces',
        'diff-1-desc': 'I don\'t deliver an isolated dashboard or app. I deliver the complete system: interface + database + automation + approvals + reporting. All connected.',
        'diff-2-title': 'Production, not demos',
        'diff-2-desc': 'Every solution includes error handling (Try-Catch), logging, backend-validated role security, technical documentation and training. It\'s not a pretty prototype that fails in reality.',
        'diff-3-title': 'Business first, technology second',
        'diff-3-desc': 'I don\'t sell tools. I understand your operation, map your process and design the solution that solves your real problem. Technology is the means, not the end.',
        'diff-4-title': 'Knowledge transfer',
        'diff-4-desc': 'Every project includes complete documentation and training. My goal is to deliver systems that work without me after implementation.',

        // CTA
        'cta-title': 'Ready to stop operating in manual mode?',
        'cta-subtitle': 'Book a free 30-minute diagnostic call. We\'ll review your most critical process and I\'ll tell you honestly if I can help and how.',
        'cta-button': '<i class="ph ph-calendar-check"></i> Book a diagnostic call',
        'cta-note': 'No commitment. No sales pitch. Just a conversation to understand your situation and see if I can help.',
        'cta-whatsapp-label': 'Quick response',
        'cta-upwork-label': 'Hire me on Upwork',

        // Footer
        'footer-services': 'Services',
        'footer-projects': 'Projects',
        'footer-about': 'About',
        'footer-contact': 'Contact',
        'footer-copy': '&copy; 2026 Humberto Henr\u00edquez. All rights reserved.'
    }
};

// Apply translations for a given language
function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Save preference
    localStorage.setItem('preferred-lang', lang);
}

// Language toggle click handler
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        applyLanguage(btn.dataset.lang);
    });
});

// On page load: restore saved language preference or default to English
(function() {
    const savedLang = localStorage.getItem('preferred-lang') || 'en';
    if (savedLang !== 'en') {
        applyLanguage(savedLang);
    }
})();

// ========== COUNTER ANIMATION ==========
function animateCounters() {
    const counters = document.querySelectorAll('.proof-number');
    counters.forEach(counter => {
        const target = counter.innerText;
        const numericTarget = parseInt(target);
        if (isNaN(numericTarget)) return;

        const suffix = target.replace(/[0-9]/g, '');
        let current = 0;
        const increment = Math.ceil(numericTarget / 30);
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericTarget) {
                current = numericTarget;
                clearInterval(timer);
            }
            counter.innerText = current + suffix;
        }, 40);
    });
}

// Trigger counter animation when proof bar is visible
const proofBar = document.querySelector('.proof-bar');
if (proofBar) {
    const proofObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                proofObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    proofObserver.observe(proofBar);
}
