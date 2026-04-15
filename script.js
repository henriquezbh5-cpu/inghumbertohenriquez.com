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
        'hero-badge-education': '<i class="ph ph-graduation-cap"></i> MSc Data Science + MSc BI',
        'hero-badge-blockchain': '<i class="ph ph-bitcoin-logo"></i> Especialista Blockchain y Crypto',
        'hero-badge-countries': '<i class="ph ph-globe-hemisphere-west"></i> 4 pa\u00edses',
        'hero-title': 'Construyo <span class="text-gradient">sistemas digitales</span> que eliminan el caos y escalan tu negocio',
        'hero-subtitle': 'Arquitecto de plataformas de nivel empresarial \u2014 desde automatizaci\u00f3n de procesos y aplicaciones web & m\u00f3viles con IA hasta estrategia de mercado Bitcoin. Dos maestr\u00edas, 18 certificaciones Microsoft, y un historial de sistemas en producci\u00f3n en toda Latinoam\u00e9rica.',
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
        'service-badge-new': 'Nuevo',
        'service-7-title': 'Aplicaciones Web Full-Stack',
        'service-7-desc': 'Dise\u00f1o y construyo plataformas web modernas con Next.js, React, NestJS y PostgreSQL. Desde marketplaces y productos SaaS hasta portales de clientes y herramientas internas \u2014 responsive, escalables, listas para producci\u00f3n.',
        'service-7-item-1': 'Frontend Next.js + React + Tailwind',
        'service-7-item-2': 'Backend NestJS API + Prisma + PostgreSQL',
        'service-7-item-3': 'Autenticaci\u00f3n, pagos, funcionalidades real-time',
        'service-7-item-4': 'Deploy con Docker + pipeline CI/CD',
        'service-7-result': 'Plataformas web custom construidas en semanas, desplegadas y listas para escalar.',
        'service-badge-hot': 'Alta demanda',
        'service-9-title': 'Desarrollo de Apps Moviles',
        'service-9-desc': 'Construyo apps moviles cross-platform con React Native y Expo que funcionan en iOS y Android desde un solo codigo. Desde apps de e-commerce y delivery hasta sistemas de reservas y herramientas internas \u2014 rendimiento nativo, UX moderna, publicadas en ambas tiendas.',
        'service-9-item-1': 'React Native / Expo (iOS + Android)',
        'service-9-item-2': 'Notificaciones push + soporte offline',
        'service-9-item-3': 'GPS, camara, biometria, pagos',
        'service-9-item-4': 'Publicacion en App Store + Play Store',
        'service-9-result': 'Tu negocio en el bolsillo de tus clientes \u2014 un codigo, dos plataformas.',
        'service-8-title': 'Soluciones con Inteligencia Artificial',
        'service-8-desc': 'Integro inteligencia artificial en tus procesos de negocio y aplicaciones. Desde asistentes inteligentes y an\u00e1lisis de documentos hasta flujos automatizados con Claude AI y agentes de IA personalizados.',
        'service-8-item-1': 'Integraci\u00f3n de Claude AI / LLMs en apps',
        'service-8-item-2': 'Chatbots y asistentes virtuales inteligentes',
        'service-8-item-3': 'An\u00e1lisis de documentos y extracci\u00f3n de datos',
        'service-8-item-4': 'Agentes de IA para automatizaci\u00f3n de flujos',
        'service-8-result': 'Tu equipo trabaja con IA, no contra ella. Ganancias reales de productividad desde el d\u00eda uno.',
        'service-badge-btc': 'Bitcoin',
        'service-10-title': 'Asesoria Bitcoin y Criptomonedas',
        'service-10-desc': 'Como operador activo del mercado de Bitcoin y creador de Bitcoin Academy Tech, brindo orientacion financiera basada en datos sobre Bitcoin y activos digitales. Desde entender ciclos de mercado y construir estrategias de inversion hasta analisis tecnico y gestion de riesgo \u2014 respaldado por experiencia real de trading y credenciales academicas en Tecnologia Blockchain.',
        'service-10-item-1': 'Analisis de mercado Bitcoin y analisis tecnico',
        'service-10-item-2': 'Estrategia de inversion y asignacion de portafolio',
        'service-10-item-3': 'Gestion de riesgo y tamano de posiciones',
        'service-10-item-4': 'Sesiones educativas (1-a-1 o grupales)',
        'service-10-result': 'Toma decisiones informadas en mercados crypto \u2014 sin hype, solo datos y estrategia.',
        'service-10-link': '<i class="ph ph-arrow-square-out"></i> Visita Bitcoin Academy Tech',

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

        // Project 7
        'proj7-industry': 'HealthTech \u2014 El Salvador',
        'proj7-title': 'MediGenio \u2014 Plataforma de Orientaci\u00f3n M\u00e9dica con IA',
        'proj7-tagline': 'Pacientes encuentran al especialista correcto sin adivinar',
        'proj7-problem': 'Personas con s\u00edntomas de salud no saben a qu\u00e9 especialista ir. Se autodiagnostican en internet, visitan al m\u00e9dico equivocado, o retrasan su atenci\u00f3n. No exist\u00eda una herramienta en LATAM que conecte s\u00edntomas con especialidades m\u00e9dicas y cl\u00ednicas reales.',
        'proj7-solution': 'Plataforma web full-stack construida con Next.js 16, React, Prisma y PostgreSQL. Selector de cuerpo SVG interactivo (18 zonas), cuestionario inteligente (75 preguntas en BD), orientaci\u00f3n m\u00e9dica con IA via Claude API, directorio de cl\u00ednicas con integraci\u00f3n WhatsApp, 5 calculadoras de salud, y panel admin con Google OAuth.',
        'proj7-result-1': 'MVP completo construido y desplegado: selector corporal, orientaci\u00f3n IA, directorio de cl\u00ednicas',
        'proj7-result-2': '5 calculadoras de salud interactivas (IMC, cardiovascular, edad biol\u00f3gica, hidrataci\u00f3n, calor\u00edas)',
        'proj7-result-3': 'Panel admin con auth, dashboard, CRUD de cl\u00ednicas y log de consultas',
        'proj7-result-4': 'PWA-ready, SEO optimizado, modelo de monetizaci\u00f3n con AdSense integrado',
        'proj7-arch-title': 'Arquitectura de la plataforma',
        'arch-patient': 'Paciente',
        'arch-clinics': 'Cl\u00ednicas',

        // Project 8
        'proj8-industry': 'Marketplace \u2014 Servicios del Hogar \u2014 El Salvador',
        'proj8-title': 'TecniHB \u2014 Marketplace de Servicios del Hogar',
        'proj8-tagline': 'Conectando propietarios con t\u00e9cnicos verificados en tiempo real',
        'proj8-problem': 'Encontrar t\u00e9cnicos confiables de servicios del hogar (plomeros, electricistas, pintores) en El Salvador es informal y riesgoso. Sin verificaci\u00f3n, sin transparencia de precios, sin disponibilidad en tiempo real, sin trazabilidad.',
        'proj8-solution': 'Marketplace full-stack construido como monorepo (Turborepo): frontend Next.js 15 + NestJS API + Prisma + PostgreSQL. Autenticaci\u00f3n JWT, acceso basado en roles (cliente/t\u00e9cnico/admin), 8 categor\u00edas de servicio, gesti\u00f3n de ciclo de vida de \u00f3rdenes, sistema de cotizaci\u00f3n en tiempo real, zonas de cobertura con geo-coordenadas, e integraci\u00f3n de pagos Bitcoin + tarjeta.',
        'proj8-result-1': 'Marketplace completo con registro, perfiles, pedidos y pagos',
        'proj8-result-2': 'Ciclo de vida de \u00f3rdenes de 10 estados: de solicitud a completado con aprobaci\u00f3n de cotizaci\u00f3n',
        'proj8-result-3': 'Pago dual: tarjetas tradicionales (Wompi) + Bitcoin (BTCPay)',
        'proj8-result-4': 'Arquitectura monorepo: tipos, esquemas y config compartidos entre frontend + backend',
        'proj8-arch-title': 'Arquitectura monorepo',

        // Projects 9, 10, 11
        'proj9-title': 'AI Video Factory',
        'proj9-tagline': 'Generaci\u00f3n automatizada de videos con IA a escala',
        'proj9-desc': 'Sistema de generaci\u00f3n de videos multi-canal usando Google Veo, Runway Gen-4, ElevenLabs TTS, y orquestaci\u00f3n con n8n. Procesamiento batch de 4 videos/d\u00eda por canal con publicaci\u00f3n autom\u00e1tica en TikTok, YouTube Shorts e Instagram Reels.',
        'proj10-title': 'Crypto Trading Dashboard',
        'proj10-tagline': 'An\u00e1lisis de mercado y se\u00f1ales de trading en tiempo real',
        'proj10-desc': 'Dashboard de trading de criptomonedas con Next.js 14, gr\u00e1ficos profesionales de velas (lightweight-charts), datos de mercado en tiempo real, indicadores de an\u00e1lisis t\u00e9cnico, e integraci\u00f3n PineScript para estrategias de TradingView.',
        'proj11-title': 'Motor de Procesamiento de Facturas',
        'proj11-tagline': 'Cumplimiento tributario y contabilidad automatizada',
        'proj11-desc': 'Sistema de procesamiento batch de facturas con c\u00e1lculos tributarios colombianos automatizados (retenci\u00f3n, IVA, ICA), generaci\u00f3n de asientos contables de partida doble, motor de reglas fiscales, y trazabilidad completa de auditor\u00eda.',

        // Project 12: Mobile App
        'proj12-industry': 'Retail / E-commerce \u2014 El Salvador',
        'proj12-title': 'App Movil E-commerce con Tracking de Delivery',
        'proj12-tagline': 'De ver productos a recibirlos en tu puerta',
        'proj12-problem': 'Un negocio retail necesitaba presencia movil para competir con los grandes. Los clientes querian navegar productos, hacer pedidos, pagar con tarjeta o efectivo contra entrega, y rastrear sus ordenes en tiempo real \u2014 todo desde su telefono.',
        'proj12-solution': 'App movil cross-platform construida con React Native + Expo, con catalogo de productos con categorias y busqueda, carrito de compras, integracion de pagos Stripe, notificaciones push para estado de ordenes, tracking de delivery en tiempo real con GPS, y panel admin para gestion de pedidos.',
        'proj12-result-1': 'Un solo codigo desplegado en iOS y Android simultaneamente',
        'proj12-result-2': 'Notificaciones push mantienen clientes informados de sus pedidos',
        'proj12-result-3': 'Tracking GPS en tiempo real redujo llamadas de "donde esta mi pedido?"',
        'proj12-result-4': 'Navegacion offline: catalogo disponible sin internet',
        'proj12-arch-title': 'Arquitectura movil',
        'arch-customer': 'Cliente',

        // Form
        'form-opt-default': '\u00bfQu\u00e9 necesitas?',
        'form-opt-automation': 'Automatizaci\u00f3n de procesos (Power Platform)',
        'form-opt-webapp': 'Aplicaci\u00f3n Web (Next.js / React)',
        'form-opt-mobile': 'App M\u00f3vil (iOS + Android)',
        'form-opt-dashboard': 'Dashboard / BI (Power BI)',
        'form-opt-ai': 'Integraci\u00f3n de IA / Chatbot',
        'form-opt-bitcoin': 'Asesor\u00eda Bitcoin y Crypto',
        'form-opt-consulting': 'Consultor\u00eda / Roadmap Digital',
        'form-opt-other': 'Otro',
        'form-submit': '<i class="ph ph-paper-plane-tilt"></i> Solicitar propuesta gratis',
        'form-success': '\u00a1Enviado! Te respondo en 24 horas.',
        'cta-or': 'o cont\u00e1ctame directamente',

        // Stack section
        'stack-tag': 'Herramientas',
        'stack-title': 'Stack tecnol\u00f3gico y certificaciones',
        'stack-subtitle': 'Combino el ecosistema Microsoft con tecnolog\u00edas web modernas e IA para entregar soluciones completas \u2014 desde automatizaci\u00f3n empresarial hasta aplicaciones web custom.',
        'stack-cat-fullstack': 'Desarrollo Full-Stack',
        'stack-cat-ai': 'IA y Sistemas Inteligentes',
        'stack-cat-apps': 'Aplicaciones de Negocio',
        'stack-cat-data': 'Datos e Inteligencia',
        'stack-cat-integrations': 'Integraciones y APIs',
        'stack-cat-devops': 'DevOps e Infraestructura',
        'certs-title': '18 Certificaciones Microsoft Activas',
        'certs-subtitle': 'Cada certificaci\u00f3n representa conocimiento validado y experiencia aplicada en proyectos reales.',

        // About me
        'about-tag': 'Sobre m\u00ed',
        'about-p1': 'Empec\u00e9 mi carrera en el mundo de la infraestructura y el soporte t\u00e9cnico. Ah\u00ed aprend\u00ed algo que muchos tecn\u00f3logos nunca entienden: <strong>la tecnolog\u00eda no vale nada si no resuelve un problema real del negocio.</strong>',
        'about-p2': 'Con el tiempo, me fui moviendo hacia la automatizaci\u00f3n y la gesti\u00f3n de datos. Vi de primera mano c\u00f3mo empresas enteras operaban con hojas de Excel compartidas por correo, aprobaciones por WhatsApp, reportes armados manualmente cada lunes, y procesos cr\u00edticos que depend\u00edan de que "alguien se acordara" de hacer algo.',
        'about-p3': 'Ah\u00ed encontr\u00e9 mi misi\u00f3n profesional: <strong>eliminar esa fragilidad operativa.</strong>',
        'about-p4': 'Microsoft Power Platform se convirti\u00f3 en mi base, pero he expandido hacia desarrollo full-stack moderno \u2014 construyendo aplicaciones web con Next.js, React, NestJS, e integrando IA con Claude API. Combino la velocidad del low-code con el poder del desarrollo custom para entregar exactamente lo que cada proyecto necesita.',
        'about-p5': 'Hoy, con 18 certificaciones Microsoft, dos maestr\u00edas (Data Science y Business Intelligence), un Posgrado en Tecnolog\u00eda Blockchain, y experiencia con clientes en Centroam\u00e9rica y el Caribe, ayudo a empresas en todos los niveles: <strong>desde automatizar un proceso de aprobaci\u00f3n roto hasta construir plataformas web completas con integraci\u00f3n de IA.</strong>',
        'about-p6': 'Tambi\u00e9n soy operador activo del mercado de Bitcoin y creador de <a href="https://bitcoinacademy.tech" target="_blank" rel="noopener" style="color: #2D6A9F; font-weight: 600;">Bitcoin Academy Tech</a> \u2014 una plataforma educativa gratuita sobre Bitcoin, blockchain y activos digitales. Combino mi experiencia t\u00e9cnica y financiera para ayudar a personas y empresas a navegar el mercado crypto con datos reales y estrategias informadas.',
        'about-btc-label': 'Bitcoin y Crypto',
        'about-btc-value': 'Operador de mercado y creador de <a href="https://bitcoinacademy.tech" target="_blank" rel="noopener" style="color: #2D6A9F; text-decoration: underline;">Bitcoin Academy Tech</a>',
        'about-base-label': 'Base',
        'about-education-label': 'Formaci\u00f3n',
        'about-education-value': 'Ing. en Sistemas + MSc Data Science + MSc Business Intelligence + PgD Blockchain',
        'about-certs-label': 'Certificaciones',
        'about-coverage-label': 'Cobertura',
        'about-coverage-value': 'El Salvador, Guatemala, Costa Rica, Rep. Dominicana',
        'about-company-label': 'Modalidad',
        'about-company-value': 'Consultor Principal & Asesor T\u00e9cnico',
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
        'footer-title': 'Arquitecto de Software e Ingeniero de Sistemas Digitales | Estratega Bitcoin',
        'footer-services': 'Servicios',
        'footer-projects': 'Proyectos',
        'footer-about': 'Sobre m\u00ed',
        'footer-contact': 'Contacto',
        'footer-copy': '&copy; 2026 Humberto Henr\u00edquez. Todos los derechos reservados.',

        // Quotation Simulator
        'nav-cotizador': 'Cotizar',
        'quote-tag': 'Precios',
        'quote-title': 'Obtene una estimacion de tu proyecto al instante',
        'quote-subtitle': 'Selecciona lo que necesitas o describe tu proyecto — obtene un costo estimado en segundos.',
        'quote-mode-builder': '<i class="ph ph-list-checks"></i> Arma tu proyecto',
        'quote-mode-ai': '<i class="ph ph-brain"></i> Describe con IA',
        'quote-step1-title': 'Que necesitas?',
        'quote-type-website': 'Sitio Web',
        'quote-type-website-desc': 'Landing page, sitio corporativo, blog',
        'quote-type-website-price': 'Desde $1,000',
        'quote-type-webapp': 'Aplicacion Web',
        'quote-type-webapp-desc': 'SaaS, portal, dashboard, marketplace',
        'quote-type-webapp-price': 'Desde $3,000',
        'quote-type-mobile': 'App Movil',
        'quote-type-mobile-desc': 'iOS y Android (React Native / PWA)',
        'quote-type-mobile-price': 'Desde $3,500',
        'quote-type-fullstack': 'Web + Mobile',
        'quote-type-fullstack-desc': 'Plataforma completa web y movil',
        'quote-type-fullstack-price': 'Desde $5,500',
        'quote-type-automation': 'Automatizacion',
        'quote-type-automation-desc': 'Power Platform, workflows, RPA',
        'quote-type-automation-price': 'Desde $1,500',
        'quote-type-bi': 'Dashboard / BI',
        'quote-type-bi-desc': 'Power BI, analytics, visualizacion',
        'quote-type-bi-price': 'Desde $1,800',
        'quote-type-bitcoin': 'Asesoria Bitcoin',
        'quote-type-bitcoin-desc': 'Analisis de mercado, estrategia, educacion',
        'quote-type-bitcoin-price': 'Desde $500',
        'quote-step2-title': 'Selecciona funcionalidades',
        'quote-step3-title': 'Tamano del proyecto',
        'quote-size-small': 'Pequeno',
        'quote-size-small-desc': '1-5 pantallas, funcionalidad basica',
        'quote-size-medium': 'Mediano',
        'quote-size-medium-desc': '6-15 pantallas, logica moderada',
        'quote-size-large': 'Grande',
        'quote-size-large-desc': '15+ pantallas, flujos complejos',
        'quote-ai-title': 'Describe tu proyecto',
        'quote-ai-desc': 'Contame que necesitas en tus propias palabras. Voy a analizar tu descripcion y generar un costo estimado basado en las funcionalidades y complejidad detectadas.',
        'quote-ai-placeholder': 'Ejemplo: Necesito una app para mi restaurante donde los clientes puedan ver el menu, pedir en linea, pagar con tarjeta, y rastrear su delivery en tiempo real. Tambien necesito un panel admin para gestionar pedidos e inventario...',
        'quote-ai-btn': '<i class="ph ph-sparkle"></i> Analizar y estimar',
        'quote-ai-result-title': 'Analisis IA',
        'quote-summary-title': 'Estimacion',
        'quote-summary-badge': 'Estimacion no vinculante',
        'quote-summary-empty': 'Selecciona un tipo de proyecto para ver tu estimacion',
        'quote-line-type': 'Tipo de proyecto',
        'quote-line-features': 'Funcionalidades',
        'quote-line-complexity': 'Multiplicador de tamano',
        'quote-total-label': 'Rango estimado',
        'quote-timeline-label': 'Tiempo estimado:',
        'quote-hire-btn': '<i class="ph ph-handshake"></i> Quiero contratar este proyecto',
        'quote-hire-note': 'Tus requerimientos seran enviados. Respondere dentro de 24 horas con una propuesta detallada.',
        'quote-modal-title': 'Envia tus requerimientos de proyecto',
        'quote-modal-desc': 'Revisa los detalles de tu proyecto y proporciona tus datos de contacto. Todos tus requerimientos seleccionados se incluiran automaticamente.',
        'quote-form-submit': '<i class="ph ph-paper-plane-tilt"></i> Enviar requerimientos y solicitar propuesta',
        'quote-modal-success': 'Requerimientos enviados! Respondere con una propuesta detallada dentro de 24 horas.',
        'quote-form-name': 'Tu nombre',
        'quote-form-email': 'Correo electronico',
        'quote-form-company': 'Empresa (opcional)',
        'quote-form-phone': 'Telefono / WhatsApp (opcional)',
        'quote-form-notes': 'Notas adicionales o contexto...'
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
        'hero-badge-education': '<i class="ph ph-graduation-cap"></i> MSc Data Science + MSc BI',
        'hero-badge-blockchain': '<i class="ph ph-bitcoin-logo"></i> Blockchain & Crypto Specialist',
        'hero-badge-countries': '<i class="ph ph-globe-hemisphere-west"></i> 4 countries',
        'hero-title': 'I build <span class="text-gradient">digital systems</span> that eliminate chaos and scale your business',
        'hero-subtitle': 'I architect enterprise-grade platforms \u2014 from business automation and AI-powered web & mobile applications to Bitcoin market strategy. Two Master\'s degrees, 18 Microsoft certifications, and a track record of shipping production systems across LATAM.',
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
        'services-subtitle': 'Business automation, full-stack web development, and AI-powered solutions',
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
        'service-badge-new': 'New',
        'service-7-title': 'Full-Stack Web Applications',
        'service-7-desc': 'I design and build modern web platforms with Next.js, React, NestJS and PostgreSQL. From marketplaces and SaaS products to client portals and internal tools \u2014 responsive, scalable, production-ready.',
        'service-7-item-1': 'Next.js + React + Tailwind frontend',
        'service-7-item-2': 'NestJS API + Prisma + PostgreSQL backend',
        'service-7-item-3': 'Authentication, payments, real-time features',
        'service-7-item-4': 'Docker deployment + CI/CD pipeline',
        'service-7-result': 'Custom web platforms built in weeks, deployed and ready to scale.',
        'service-badge-hot': 'High demand',
        'service-9-title': 'Mobile App Development',
        'service-9-desc': 'I build cross-platform mobile apps with React Native and Expo that work on iOS and Android from a single codebase. From e-commerce and delivery apps to booking systems and internal tools \u2014 native performance, modern UX, deployed to both app stores.',
        'service-9-item-1': 'React Native / Expo (iOS + Android)',
        'service-9-item-2': 'Push notifications + offline support',
        'service-9-item-3': 'GPS, camera, biometrics, payments',
        'service-9-item-4': 'App Store + Play Store publishing',
        'service-9-result': 'Your business in your customers\' pockets \u2014 one codebase, two platforms.',
        'service-8-title': 'AI-Powered Solutions',
        'service-8-desc': 'I integrate artificial intelligence into your business processes and applications. From intelligent assistants and document analysis to automated workflows powered by Claude AI and custom AI agents.',
        'service-8-item-1': 'Claude AI / LLM integration into apps',
        'service-8-item-2': 'Intelligent chatbots and virtual assistants',
        'service-8-item-3': 'Document analysis and data extraction',
        'service-8-item-4': 'AI agents for workflow automation',
        'service-8-result': 'Your team works with AI, not against it. Real productivity gains from day one.',
        'service-badge-btc': 'Bitcoin',
        'service-10-title': 'Bitcoin & Crypto Advisory',
        'service-10-desc': 'As an active Bitcoin market operator and creator of Bitcoin Academy Tech, I provide data-driven financial guidance on Bitcoin and digital assets. From understanding market cycles and building investment strategies to technical analysis and risk management \u2014 backed by real trading experience and academic credentials in Blockchain Technology.',
        'service-10-item-1': 'Bitcoin market analysis & technical analysis',
        'service-10-item-2': 'Investment strategy & portfolio allocation',
        'service-10-item-3': 'Risk management & position sizing',
        'service-10-item-4': 'Education sessions (1-on-1 or group)',
        'service-10-result': 'Make informed decisions in crypto markets \u2014 no hype, just data and strategy.',
        'service-10-link': '<i class="ph ph-arrow-square-out"></i> Visit Bitcoin Academy Tech',

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

        // Project 7
        'proj7-industry': 'HealthTech \u2014 El Salvador',
        'proj7-title': 'MediGenio \u2014 AI Medical Orientation Platform',
        'proj7-tagline': 'Patients find the right specialist without guessing',
        'proj7-problem': 'People with health symptoms don\'t know which specialist to visit. They self-diagnose online, visit the wrong doctor, or delay care. There was no tool in LATAM connecting symptoms to medical specialties with real clinic referrals.',
        'proj7-solution': 'Full-stack web platform built with Next.js 16, React, Prisma and PostgreSQL. Interactive body SVG selector (18 zones), smart questionnaire (75 questions in DB), AI-powered medical orientation via Claude API, clinic directory with WhatsApp integration, 5 health calculators, and admin panel with Google OAuth.',
        'proj7-result-1': 'Complete MVP built and deployed: body selector, AI orientation, clinic directory',
        'proj7-result-2': '5 interactive health calculators (BMI, cardiovascular, biological age, hydration, calories)',
        'proj7-result-3': 'Admin panel with auth, dashboard, clinic CRUD, and consultation logs',
        'proj7-result-4': 'PWA-ready, SEO-optimized, AdSense-integrated monetization model',
        'proj7-arch-title': 'Platform architecture',
        'arch-patient': 'Patient',
        'arch-clinics': 'Clinics',

        // Project 8
        'proj8-industry': 'Marketplace \u2014 Home Services \u2014 El Salvador',
        'proj8-title': 'TecniHB \u2014 Home Services Marketplace',
        'proj8-tagline': 'Connecting homeowners with verified technicians in real-time',
        'proj8-problem': 'Finding reliable home service technicians (plumbers, electricians, painters) in El Salvador is informal and risky. No verification, no pricing transparency, no real-time availability, no traceability.',
        'proj8-solution': 'Full-stack marketplace built as a monorepo (Turborepo): Next.js 15 frontend + NestJS API + Prisma + PostgreSQL. JWT authentication, role-based access (client/technician/admin), 8 service categories, order lifecycle management, real-time quote system, coverage zones with geo-coordinates, and Bitcoin + card payment integration.',
        'proj8-result-1': 'Complete marketplace with registration, profiles, ordering and payment',
        'proj8-result-2': '10-state order lifecycle: from request to completion with quote approval',
        'proj8-result-3': 'Dual payment: traditional cards (Wompi) + Bitcoin (BTCPay)',
        'proj8-result-4': 'Monorepo architecture: shared types, schemas and config across frontend + backend',
        'proj8-arch-title': 'Monorepo architecture',

        // Projects 9, 10, 11
        'proj9-title': 'AI Video Factory',
        'proj9-tagline': 'Automated AI-powered video generation at scale',
        'proj9-desc': 'Multi-channel video generation system using Google Veo, Runway Gen-4, ElevenLabs TTS, and n8n orchestration. Batch processing 4 videos/day per channel with automated publishing to TikTok, YouTube Shorts, and Instagram Reels.',
        'proj10-title': 'Crypto Trading Dashboard',
        'proj10-tagline': 'Real-time market analysis and trading signals',
        'proj10-desc': 'Cryptocurrency trading dashboard with Next.js 14, professional candlestick charts (lightweight-charts), real-time market data, technical analysis indicators, and PineScript integration for TradingView strategies.',
        'proj11-title': 'Invoice Processing Engine',
        'proj11-tagline': 'Automated tax compliance and accounting',
        'proj11-desc': 'Batch invoice processing system with automated Colombian tax calculations (withholding, VAT, ICA), double-entry accounting generation, rule engine for tax compliance, and complete audit trail.',

        // Project 12: Mobile App
        'proj12-industry': 'Retail / E-commerce \u2014 El Salvador',
        'proj12-title': 'E-commerce Mobile App with Delivery Tracking',
        'proj12-tagline': 'From browsing products to receiving them at your door',
        'proj12-problem': 'A retail business needed a mobile presence to compete with larger players. Customers wanted to browse products, place orders, pay with card or cash on delivery, and track their orders in real-time \u2014 all from their phones.',
        'proj12-solution': 'Cross-platform mobile app built with React Native + Expo, featuring product catalog with categories and search, shopping cart, Stripe payment integration, push notifications for order status, real-time delivery tracking with GPS, and an admin panel for order management.',
        'proj12-result-1': 'Single codebase deployed to iOS and Android simultaneously',
        'proj12-result-2': 'Push notifications keep customers engaged with order updates',
        'proj12-result-3': 'Real-time GPS tracking reduced "where is my order?" calls',
        'proj12-result-4': 'Offline browsing: catalog available even without internet',
        'proj12-arch-title': 'Mobile architecture',
        'arch-customer': 'Customer',

        // Form
        'form-opt-default': 'What do you need?',
        'form-opt-automation': 'Process Automation (Power Platform)',
        'form-opt-webapp': 'Web Application (Next.js / React)',
        'form-opt-mobile': 'Mobile App (iOS + Android)',
        'form-opt-dashboard': 'Dashboard / BI (Power BI)',
        'form-opt-ai': 'AI Integration / Chatbot',
        'form-opt-bitcoin': 'Bitcoin & Crypto Advisory',
        'form-opt-consulting': 'Consulting / Digital Roadmap',
        'form-opt-other': 'Other',
        'form-submit': '<i class="ph ph-paper-plane-tilt"></i> Request free proposal',
        'form-success': 'Sent! I\'ll respond within 24 hours.',
        'cta-or': 'or contact me directly',

        // Stack section
        'stack-tag': 'Tools',
        'stack-title': 'Tech stack and certifications',
        'stack-subtitle': 'I combine the Microsoft ecosystem with modern web technologies and AI to deliver complete solutions \u2014 from enterprise automation to custom web applications.',
        'stack-cat-fullstack': 'Full-Stack Development',
        'stack-cat-ai': 'AI & Intelligent Systems',
        'stack-cat-apps': 'Business Applications',
        'stack-cat-data': 'Data & Intelligence',
        'stack-cat-integrations': 'Integrations & APIs',
        'stack-cat-devops': 'DevOps & Infrastructure',
        'certs-title': '18 Active Microsoft Certifications',
        'certs-subtitle': 'Each certification represents validated knowledge and hands-on experience in real projects.',

        // About me
        'about-tag': 'About me',
        'about-p1': 'I started my career in infrastructure and technical support. That\'s where I learned something many technologists never understand: <strong>technology is worthless if it doesn\'t solve a real business problem.</strong>',
        'about-p2': 'Over time, I moved toward automation and data management. I saw firsthand how entire companies operated with spreadsheets shared by email, WhatsApp approvals, reports built manually every Monday, and critical processes that depended on "someone remembering" to do something.',
        'about-p3': 'That\'s where I found my professional mission: <strong>eliminating that operational fragility.</strong>',
        'about-p4': 'Microsoft Power Platform became my foundation, but I\'ve expanded into modern full-stack development \u2014 building web applications with Next.js, React, NestJS, and integrating AI with Claude API. I combine the speed of low-code with the power of custom development to deliver exactly what each project needs.',
        'about-p5': 'Today, with 18 Microsoft certifications, two Master\'s degrees (Data Science and Business Intelligence), a Postgraduate in Blockchain Technology, and experience with clients across Central America and the Caribbean, I help companies at every level: <strong>from automating a broken approval process to building complete web platforms with AI integration.</strong>',
        'about-p6': 'I\'m also an active Bitcoin market operator and the creator of <a href="https://bitcoinacademy.tech" target="_blank" rel="noopener" style="color: #2D6A9F; font-weight: 600;">Bitcoin Academy Tech</a> \u2014 a free educational platform about Bitcoin, blockchain and digital assets. I combine my technical and financial expertise to help individuals and businesses navigate the crypto market with real data and informed strategies.',
        'about-btc-label': 'Bitcoin & Crypto',
        'about-btc-value': 'Market operator & creator of <a href="https://bitcoinacademy.tech" target="_blank" rel="noopener" style="color: #2D6A9F; text-decoration: underline;">Bitcoin Academy Tech</a>',
        'about-base-label': 'Base',
        'about-education-label': 'Education',
        'about-education-value': 'Systems Eng. + MSc Data Science + MSc Business Intelligence + PgD Blockchain',
        'about-certs-label': 'Certifications',
        'about-coverage-label': 'Coverage',
        'about-coverage-value': 'El Salvador, Guatemala, Costa Rica, Dominican Rep.',
        'about-company-label': 'Mode',
        'about-company-value': 'Principal Consultant & Technical Advisor',
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
        'footer-title': 'Software Architect & Digital Systems Engineer | Bitcoin Strategist',
        'footer-services': 'Services',
        'footer-projects': 'Projects',
        'footer-about': 'About',
        'footer-contact': 'Contact',
        'footer-copy': '&copy; 2026 Humberto Henr\u00edquez. All rights reserved.',

        // Quotation Simulator
        'nav-cotizador': 'Quote',
        'quote-tag': 'Pricing',
        'quote-title': 'Get an instant project estimate',
        'quote-subtitle': 'Select what you need or describe your project — get an estimated cost in seconds.',
        'quote-mode-builder': '<i class="ph ph-list-checks"></i> Build your project',
        'quote-mode-ai': '<i class="ph ph-brain"></i> Describe with AI',
        'quote-step1-title': 'What do you need?',
        'quote-type-website': 'Website',
        'quote-type-website-desc': 'Landing page, corporate site, blog',
        'quote-type-website-price': 'From $5,000',
        'quote-type-webapp': 'Web Application',
        'quote-type-webapp-desc': 'SaaS, portal, dashboard, marketplace',
        'quote-type-webapp-price': 'From $15,000',
        'quote-type-mobile': 'Mobile App',
        'quote-type-mobile-desc': 'iOS & Android (React Native / PWA)',
        'quote-type-mobile-price': 'From $18,000',
        'quote-type-fullstack': 'Web + Mobile',
        'quote-type-fullstack-desc': 'Complete platform with web and mobile',
        'quote-type-fullstack-price': 'From $28,000',
        'quote-type-automation': 'Automation',
        'quote-type-automation-desc': 'Power Platform, workflows, RPA',
        'quote-type-automation-price': 'From $8,000',
        'quote-type-bi': 'Dashboard / BI',
        'quote-type-bi-desc': 'Power BI, analytics, data visualization',
        'quote-type-bi-price': 'From $8,500',
        'quote-type-bitcoin': 'Bitcoin Advisory',
        'quote-type-bitcoin-desc': 'Market analysis, strategy, education',
        'quote-type-bitcoin-price': 'From $2,000',
        'quote-step2-title': 'Select features',
        'quote-step3-title': 'Project size',
        'quote-size-small': 'Small',
        'quote-size-small-desc': '1-5 screens, basic functionality',
        'quote-size-medium': 'Medium',
        'quote-size-medium-desc': '6-15 screens, moderate logic',
        'quote-size-large': 'Large',
        'quote-size-large-desc': '15+ screens, complex workflows',
        'quote-ai-title': 'Describe your project',
        'quote-ai-desc': 'Tell me what you need in your own words. I\'ll analyze your description and generate an estimated cost based on the features and complexity detected.',
        'quote-ai-placeholder': 'Example: I need an app for my restaurant where customers can see the menu, order online, pay with card, and track their delivery in real time. I also need an admin panel to manage orders and inventory...',
        'quote-ai-btn': '<i class="ph ph-sparkle"></i> Analyze and estimate',
        'quote-ai-result-title': 'AI Analysis',
        'quote-summary-title': 'Estimate',
        'quote-summary-badge': 'Non-binding estimate',
        'quote-summary-empty': 'Select a project type to see your estimate',
        'quote-line-type': 'Project type',
        'quote-line-features': 'Features',
        'quote-line-complexity': 'Size multiplier',
        'quote-total-label': 'Estimated range',
        'quote-timeline-label': 'Estimated timeline:',
        'quote-hire-btn': '<i class="ph ph-handshake"></i> I want to hire this project',
        'quote-hire-note': 'Your requirements will be sent. I\'ll respond within 24 hours with a detailed proposal.',
        'quote-modal-title': 'Send your project requirements',
        'quote-modal-desc': 'Review your project details and provide your contact information. All your selected requirements will be included automatically.',
        'quote-form-submit': '<i class="ph ph-paper-plane-tilt"></i> Send requirements & request proposal',
        'quote-modal-success': 'Requirements sent! I\'ll respond with a detailed proposal within 24 hours.',
        'quote-form-name': 'Your name',
        'quote-form-email': 'Email',
        'quote-form-company': 'Company (optional)',
        'quote-form-phone': 'Phone / WhatsApp (optional)',
        'quote-form-notes': 'Additional notes or context...'
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
    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
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
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        applyLanguage(target.dataset.lang);
    });
});

// On page load: restore saved language preference or default to English
(function() {
    var savedLang = localStorage.getItem('preferred-lang') || 'en';
    applyLanguage(savedLang);
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

// ========== PROPOSAL FORM HANDLER ==========
// Helper: send form via Formspree or fallback to mailto
function sendForm(form, successCallback) {
    var formData = new FormData(form);
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ph ph-spinner"></i> Sending...';
    submitBtn.disabled = true;

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).then(function(response) {
        if (response.ok) {
            successCallback();
        } else {
            // Fallback to mailto
            fallbackMailto(formData);
            successCallback();
        }
    }).catch(function() {
        // Fallback to mailto
        fallbackMailto(formData);
        successCallback();
    });
}

function fallbackMailto(formData) {
    var parts = [];
    formData.forEach(function(value, key) {
        if (key.charAt(0) !== '_' && value) {
            parts.push(key + ': ' + value);
        }
    });
    var subject = encodeURIComponent('New request from portfolio');
    var body = encodeURIComponent(parts.join('\n') + '\n\n— Sent from inghumbertohenriquez.com');
    window.location.href = 'mailto:henriquezbh5@gmail.com?subject=' + subject + '&body=' + body;
}

const proposalForm = document.getElementById('proposalForm');
if (proposalForm) {
    proposalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        sendForm(form, function() {
            form.style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        });
    });
}

// ========== PROJECT QUOTATION SIMULATOR ==========
(function() {
    // Market pricing: EN = US market, ES = LATAM market
    const marketBasePrices = {
        en: { website: 5000, webapp: 15000, mobile: 18000, fullstack: 28000, automation: 8000, bi: 8500, bitcoin: 2000 },
        es: { website: 1000, webapp: 3000, mobile: 3500, fullstack: 5500, automation: 1500, bi: 1800, bitcoin: 500 }
    };
    const marketFeatureMultiplier = { en: 4, es: 1 };

    function getMarketBasePrice(type) {
        var lang = getLang();
        return marketBasePrices[lang] ? marketBasePrices[lang][type] : marketBasePrices.es[type];
    }

    function getFeaturePrice(basePrice) {
        var lang = getLang();
        var mult = marketFeatureMultiplier[lang] || 1;
        return Math.round(basePrice * mult);
    }

    // Feature catalogs per project type (base prices = LATAM, multiplied for US)
    const featureCatalog = {
        website: [
            { id: 'responsive', name: 'Responsive design (mobile + tablet)', nameEs: 'Diseno responsive (movil + tablet)', price: 250 },
            { id: 'seo', name: 'SEO optimization + sitemap', nameEs: 'Optimizacion SEO + sitemap', price: 350 },
            { id: 'contact-form', name: 'Contact form + validation', nameEs: 'Formulario de contacto + validacion', price: 200 },
            { id: 'blog', name: 'Blog / News with CMS', nameEs: 'Blog / Noticias con CMS', price: 500 },
            { id: 'multilang', name: 'Multi-language (EN/ES)', nameEs: 'Multi-idioma (EN/ES)', price: 400 },
            { id: 'cms', name: 'Content management panel', nameEs: 'Panel gestor de contenido', price: 600 },
            { id: 'animations', name: 'Premium animations & transitions', nameEs: 'Animaciones y transiciones premium', price: 300 },
            { id: 'analytics', name: 'Google Analytics + Tag Manager', nameEs: 'Google Analytics + Tag Manager', price: 200 },
            { id: 'newsletter', name: 'Newsletter / email capture', nameEs: 'Newsletter / captura de emails', price: 250 },
            { id: 'gallery', name: 'Image / video gallery', nameEs: 'Galeria de imagenes / video', price: 300 },
            { id: 'social', name: 'Social media integration', nameEs: 'Integracion redes sociales', price: 200 },
            { id: 'ssl-domain', name: 'SSL + custom domain setup', nameEs: 'SSL + configuracion de dominio', price: 150 },
        ],
        webapp: [
            { id: 'auth', name: 'Authentication (login/register/OAuth)', nameEs: 'Autenticacion (login/registro/OAuth)', price: 600 },
            { id: 'rbac', name: 'Role-based access control', nameEs: 'Control de acceso por roles', price: 450 },
            { id: 'dashboard', name: 'Admin dashboard with analytics', nameEs: 'Panel admin con analytics', price: 750 },
            { id: 'crud', name: 'CRUD modules (data management)', nameEs: 'Modulos CRUD (gestion de datos)', price: 450 },
            { id: 'payments', name: 'Payments (Stripe/PayPal/crypto)', nameEs: 'Pagos (Stripe/PayPal/crypto)', price: 800 },
            { id: 'subscriptions', name: 'Subscription / recurring billing', nameEs: 'Suscripciones / cobro recurrente', price: 600 },
            { id: 'notifications', name: 'Email + push notifications', nameEs: 'Notificaciones email + push', price: 450 },
            { id: 'realtime', name: 'Real-time features (WebSocket)', nameEs: 'Funciones en tiempo real (WebSocket)', price: 700 },
            { id: 'api', name: 'REST API + documentation', nameEs: 'API REST + documentacion', price: 600 },
            { id: 'file-upload', name: 'File upload + cloud storage', nameEs: 'Subida de archivos + cloud storage', price: 400 },
            { id: 'search', name: 'Advanced search & filters', nameEs: 'Busqueda avanzada y filtros', price: 400 },
            { id: 'ai-integration', name: 'AI integration (chatbot/analysis)', nameEs: 'Integracion de IA (chatbot/analisis)', price: 900 },
            { id: 'reports', name: 'Reports + PDF/Excel export', nameEs: 'Reportes + exportacion PDF/Excel', price: 450 },
            { id: 'multi-tenant', name: 'Multi-tenant architecture', nameEs: 'Arquitectura multi-tenant', price: 800 },
            { id: 'email-system', name: 'Transactional email system', nameEs: 'Sistema de emails transaccionales', price: 400 },
            { id: 'maps', name: 'Maps & geolocation', nameEs: 'Mapas y geolocalizacion', price: 500 },
        ],
        mobile: [
            { id: 'auth', name: 'Authentication (login/register)', nameEs: 'Autenticacion (login/registro)', price: 600 },
            { id: 'push', name: 'Push notifications', nameEs: 'Notificaciones push', price: 450 },
            { id: 'offline', name: 'Offline mode + data sync', nameEs: 'Modo offline + sincronizacion', price: 600 },
            { id: 'camera', name: 'Camera + image processing', nameEs: 'Camara + procesamiento de imagenes', price: 400 },
            { id: 'gps', name: 'GPS + real-time tracking', nameEs: 'GPS + rastreo en tiempo real', price: 500 },
            { id: 'payments', name: 'In-app payments + subscriptions', nameEs: 'Pagos in-app + suscripciones', price: 800 },
            { id: 'social-login', name: 'Social login (Google/Apple/FB)', nameEs: 'Login social (Google/Apple/FB)', price: 400 },
            { id: 'chat', name: 'In-app messaging / chat', nameEs: 'Mensajeria / chat in-app', price: 700 },
            { id: 'store-publish', name: 'App Store + Play Store publishing', nameEs: 'Publicacion App Store + Play Store', price: 600 },
            { id: 'analytics', name: 'Usage analytics + crash reports', nameEs: 'Analytics de uso + reportes de errores', price: 300 },
            { id: 'biometrics', name: 'Biometric auth (Face ID / fingerprint)', nameEs: 'Auth biometrica (Face ID / huella)', price: 350 },
            { id: 'qr-scanner', name: 'QR / barcode scanner', nameEs: 'Escaner QR / codigo de barras', price: 300 },
            { id: 'deep-linking', name: 'Deep linking + share system', nameEs: 'Deep linking + sistema de compartir', price: 350 },
            { id: 'local-storage', name: 'Local data storage + encryption', nameEs: 'Almacenamiento local + encriptacion', price: 400 },
        ],
        fullstack: [
            { id: 'auth', name: 'Authentication system (web + mobile)', nameEs: 'Sistema de autenticacion (web + mobile)', price: 700 },
            { id: 'rbac', name: 'Role-based access control', nameEs: 'Control de acceso por roles', price: 500 },
            { id: 'dashboard', name: 'Admin dashboard + analytics', nameEs: 'Panel admin + analytics', price: 800 },
            { id: 'payments', name: 'Unified payment system', nameEs: 'Sistema de pagos unificado', price: 900 },
            { id: 'push', name: 'Push notifications (web + mobile)', nameEs: 'Notificaciones push (web + mobile)', price: 550 },
            { id: 'offline', name: 'Offline support + sync', nameEs: 'Soporte offline + sincronizacion', price: 600 },
            { id: 'realtime', name: 'Real-time sync across platforms', nameEs: 'Sincronizacion en tiempo real cross-platform', price: 800 },
            { id: 'api', name: 'REST API + docs + versioning', nameEs: 'API REST + docs + versionado', price: 700 },
            { id: 'chat', name: 'Cross-platform messaging', nameEs: 'Mensajeria cross-platform', price: 750 },
            { id: 'ai-integration', name: 'AI-powered features', nameEs: 'Funcionalidades con IA', price: 1000 },
            { id: 'store-publish', name: 'Store publishing + CI/CD', nameEs: 'Publicacion en stores + CI/CD', price: 600 },
            { id: 'reports', name: 'Reports + export + dashboards', nameEs: 'Reportes + exportacion + dashboards', price: 500 },
            { id: 'maps', name: 'Maps + tracking + geofencing', nameEs: 'Mapas + tracking + geofencing', price: 600 },
            { id: 'multi-tenant', name: 'Multi-tenant / white-label', nameEs: 'Multi-tenant / white-label', price: 900 },
        ],
        automation: [
            { id: 'flow-cloud', name: 'Cloud flows (Power Automate)', nameEs: 'Flujos cloud (Power Automate)', price: 450 },
            { id: 'flow-desktop', name: 'Desktop flows / RPA bots', nameEs: 'Flujos de escritorio / bots RPA', price: 700 },
            { id: 'approvals', name: 'Multi-level approval workflows', nameEs: 'Flujos de aprobacion multinivel', price: 400 },
            { id: 'email-auto', name: 'Email automation + templates', nameEs: 'Automatizacion de correo + plantillas', price: 300 },
            { id: 'data-sync', name: 'System-to-system data sync', nameEs: 'Sincronizacion de datos entre sistemas', price: 550 },
            { id: 'doc-gen', name: 'Document generation (PDF/Word/Excel)', nameEs: 'Generacion de docs (PDF/Word/Excel)', price: 450 },
            { id: 'sharepoint', name: 'SharePoint integration + libraries', nameEs: 'Integracion SharePoint + bibliotecas', price: 400 },
            { id: 'custom-connector', name: 'Custom API connectors', nameEs: 'Conectores API personalizados', price: 550 },
            { id: 'error-handling', name: 'Error handling + retry + logging', nameEs: 'Manejo de errores + reintentos + logging', price: 350 },
            { id: 'power-app', name: 'Power App user interface', nameEs: 'Interfaz Power App', price: 550 },
            { id: 'dataverse', name: 'Dataverse data model', nameEs: 'Modelo de datos Dataverse', price: 500 },
            { id: 'teams-integration', name: 'Microsoft Teams integration', nameEs: 'Integracion con Microsoft Teams', price: 350 },
            { id: 'scheduled-tasks', name: 'Scheduled / recurring tasks', nameEs: 'Tareas programadas / recurrentes', price: 300 },
            { id: 'ai-builder', name: 'AI Builder processing', nameEs: 'Procesamiento con AI Builder', price: 500 },
        ],
        bi: [
            { id: 'data-model', name: 'Star schema data model', nameEs: 'Modelo de datos estrella', price: 450 },
            { id: 'dax', name: 'Advanced DAX measures + KPIs', nameEs: 'Medidas DAX avanzadas + KPIs', price: 550 },
            { id: 'power-query', name: 'ETL with Power Query (M)', nameEs: 'ETL con Power Query (M)', price: 450 },
            { id: 'multi-source', name: 'Multiple data sources + gateway', nameEs: 'Multiples fuentes + gateway', price: 500 },
            { id: 'rls', name: 'Row-level security (RLS)', nameEs: 'Seguridad a nivel de fila (RLS)', price: 400 },
            { id: 'scheduled-refresh', name: 'Scheduled refresh + incremental', nameEs: 'Refresh programado + incremental', price: 300 },
            { id: 'api-connection', name: 'API / REST data with pagination', nameEs: 'Datos API / REST con paginacion', price: 550 },
            { id: 'kpi-alerts', name: 'KPI alerts + data-driven subscriptions', nameEs: 'Alertas KPI + suscripciones por datos', price: 350 },
            { id: 'embed', name: 'Embedded reports (web/portal)', nameEs: 'Reportes embebidos (web/portal)', price: 450 },
            { id: 'training', name: 'User training + documentation', nameEs: 'Capacitacion + documentacion', price: 350 },
            { id: 'mobile-report', name: 'Mobile-optimized reports', nameEs: 'Reportes optimizados para movil', price: 300 },
            { id: 'paginated', name: 'Paginated reports (SSRS)', nameEs: 'Reportes paginados (SSRS)', price: 400 },
        ],
        bitcoin: [
            { id: 'market-analysis', name: 'Market cycle analysis & outlook', nameEs: 'Analisis de ciclo de mercado y perspectiva', price: 200 },
            { id: 'technical-analysis', name: 'Technical analysis (charts, indicators)', nameEs: 'Analisis tecnico (graficos, indicadores)', price: 250 },
            { id: 'investment-strategy', name: 'Investment strategy & DCA plan', nameEs: 'Estrategia de inversion y plan DCA', price: 300 },
            { id: 'portfolio-review', name: 'Portfolio review & allocation', nameEs: 'Revision de portafolio y asignacion', price: 250 },
            { id: 'risk-management', name: 'Risk management & position sizing', nameEs: 'Gestion de riesgo y tamano de posiciones', price: 200 },
            { id: 'onchain-analysis', name: 'On-chain data analysis', nameEs: 'Analisis de datos on-chain', price: 300 },
            { id: 'altcoin-review', name: 'Altcoin evaluation & due diligence', nameEs: 'Evaluacion de altcoins y due diligence', price: 250 },
            { id: 'defi-guide', name: 'DeFi strategy & yield farming', nameEs: 'Estrategia DeFi y yield farming', price: 350 },
            { id: 'security-setup', name: 'Wallet security & cold storage setup', nameEs: 'Seguridad de wallets y cold storage', price: 200 },
            { id: 'education-1on1', name: '1-on-1 education sessions (4 hours)', nameEs: 'Sesiones educativas 1-a-1 (4 horas)', price: 400 },
            { id: 'group-workshop', name: 'Group workshop (up to 10 people)', nameEs: 'Taller grupal (hasta 10 personas)', price: 600 },
            { id: 'monthly-advisory', name: 'Monthly advisory retainer', nameEs: 'Asesoria mensual recurrente', price: 500 },
        ]
    };

    // Type labels
    const typeLabels = {
        website: { en: 'Website', es: 'Sitio Web' },
        webapp: { en: 'Web Application', es: 'Aplicacion Web' },
        mobile: { en: 'Mobile App', es: 'App Movil' },
        fullstack: { en: 'Web + Mobile', es: 'Web + Mobile' },
        automation: { en: 'Automation', es: 'Automatizacion' },
        bi: { en: 'Dashboard / BI', es: 'Dashboard / BI' },
        bitcoin: { en: 'Bitcoin Advisory', es: 'Asesoria Bitcoin' }
    };

    // Timeline estimates per type + complexity
    const timelines = {
        website:    { small: '2-4 weeks', medium: '4-8 weeks', large: '8-16 weeks' },
        webapp:     { small: '6-8 weeks', medium: '12-20 weeks', large: '20-32 weeks' },
        mobile:     { small: '8-12 weeks', medium: '16-24 weeks', large: '24-40 weeks' },
        fullstack:  { small: '12-16 weeks', medium: '20-32 weeks', large: '32-48 weeks' },
        automation: { small: '2-4 weeks', medium: '6-10 weeks', large: '10-16 weeks' },
        bi:         { small: '2-4 weeks', medium: '4-8 weeks', large: '8-12 weeks' },
        bitcoin:    { small: '2 sessions', medium: '4-8 sessions', large: '16+ sessions' }
    };

    const timelinesEs = {
        website:    { small: '2-4 semanas', medium: '4-8 semanas', large: '8-16 semanas' },
        webapp:     { small: '6-8 semanas', medium: '12-20 semanas', large: '20-32 semanas' },
        mobile:     { small: '8-12 semanas', medium: '16-24 semanas', large: '24-40 semanas' },
        fullstack:  { small: '12-16 semanas', medium: '20-32 semanas', large: '32-48 semanas' },
        automation: { small: '2-4 semanas', medium: '6-10 semanas', large: '10-16 semanas' },
        bi:         { small: '2-4 semanas', medium: '4-8 semanas', large: '8-12 semanas' },
        bitcoin:    { small: '2 sesiones', medium: '4-8 sesiones', large: '16+ sesiones' }
    };

    // State
    let state = {
        mode: 'builder',
        projectType: null,
        basePrice: 0,
        selectedFeatures: [],
        featuresTotal: 0,
        complexity: null,
        multiplier: 1,
        aiEstimate: null
    };

    // DOM refs
    const modeButtons = document.querySelectorAll('.quote-mode-btn');
    const builderPanel = document.getElementById('quoteBuilder');
    const aiPanel = document.getElementById('quoteAI');
    const featuresStep = document.getElementById('quoteFeaturesStep');
    const featuresGrid = document.getElementById('quoteFeaturesGrid');
    const complexityStep = document.getElementById('quoteComplexityStep');
    const summaryEmpty = document.getElementById('quoteSummaryEmpty');
    const summaryDetails = document.getElementById('quoteSummaryDetails');
    const summaryActions = document.getElementById('quoteSummaryActions');
    const typeRadios = document.querySelectorAll('input[name="projectType"]');
    const complexityRadios = document.querySelectorAll('input[name="complexity"]');

    // Get current language
    function getLang() {
        const activeBtn = document.querySelector('.lang-btn.active');
        return activeBtn ? activeBtn.dataset.lang : 'en';
    }

    // Mode toggle
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mode = btn.dataset.mode;

            if (state.mode === 'builder') {
                builderPanel.classList.add('active');
                aiPanel.classList.remove('active');
            } else {
                aiPanel.classList.add('active');
                builderPanel.classList.remove('active');
            }
            updateSummary();
        });
    });

    // Project type selection
    typeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            state.projectType = radio.value;
            state.basePrice = getMarketBasePrice(radio.value);
            state.selectedFeatures = [];
            state.featuresTotal = 0;
            state.complexity = null;
            state.multiplier = 1;

            // Reset complexity selection
            complexityRadios.forEach(r => r.checked = false);

            renderFeatures();
            featuresStep.style.display = 'block';
            complexityStep.style.display = 'block';

            // Smooth scroll to features
            setTimeout(() => {
                featuresStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            updateSummary();
        });
    });

    // Render features based on project type
    function renderFeatures() {
        const features = featureCatalog[state.projectType] || [];
        const lang = getLang();
        featuresGrid.innerHTML = '';

        features.forEach(f => {
            const adjustedPrice = getFeaturePrice(f.price);
            const div = document.createElement('label');
            div.className = 'quote-feature-item';
            div.innerHTML =
                '<input type="checkbox" value="' + f.id + '" data-price="' + adjustedPrice + '">' +
                '<span class="quote-feature-check"><i class="ph ph-check"></i></span>' +
                '<span class="quote-feature-label">' + (lang === 'es' ? f.nameEs : f.name) + '</span>' +
                '<span class="quote-feature-price">+$' + adjustedPrice.toLocaleString() + '</span>';

            const checkbox = div.querySelector('input');
            checkbox.addEventListener('change', () => {
                div.classList.toggle('selected', checkbox.checked);
                updateFeatureSelection();
            });

            featuresGrid.appendChild(div);
        });
    }

    function updateFeatureSelection() {
        state.selectedFeatures = [];
        state.featuresTotal = 0;
        featuresGrid.querySelectorAll('input:checked').forEach(cb => {
            state.selectedFeatures.push(cb.value);
            state.featuresTotal += parseInt(cb.dataset.price);
        });
        updateSummary();
    }

    // Complexity selection
    complexityRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            state.complexity = radio.value;
            state.multiplier = parseFloat(radio.dataset.mult);
            updateSummary();
        });
    });

    // Update summary panel
    function updateSummary() {
        const lang = getLang();

        if (state.mode === 'builder') {
            if (!state.projectType) {
                summaryEmpty.style.display = 'block';
                summaryDetails.style.display = 'none';
                summaryActions.style.display = 'none';
                return;
            }

            summaryEmpty.style.display = 'none';
            summaryDetails.style.display = 'block';

            // Type line (recalculate base price for current market)
            state.basePrice = getMarketBasePrice(state.projectType);
            const tl = typeLabels[state.projectType];
            document.getElementById('quoteTypeValue').textContent =
                (lang === 'es' ? tl.es : tl.en) + ' — $' + state.basePrice.toLocaleString();

            // Features line
            document.getElementById('quoteFeaturesValue').textContent =
                state.selectedFeatures.length + (lang === 'es' ? ' seleccionadas' : ' selected') + ' — +$' + state.featuresTotal;

            // Complexity line
            if (state.complexity) {
                var sizeLabels = { small: lang === 'es' ? 'Pequeno' : 'Small', medium: lang === 'es' ? 'Mediano' : 'Medium', large: lang === 'es' ? 'Grande' : 'Large' };
                document.getElementById('quoteComplexityValue').textContent = sizeLabels[state.complexity] + ' (x' + state.multiplier + ')';
            } else {
                document.getElementById('quoteComplexityValue').textContent = lang === 'es' ? 'Sin seleccionar' : 'Not selected';
            }

            // Calculate total range
            var rawTotal = (state.basePrice + state.featuresTotal) * state.multiplier;
            var min = Math.round(rawTotal * 0.85);
            var max = Math.round(rawTotal * 1.15);

            document.getElementById('quoteTotalMin').textContent = '$' + min.toLocaleString();
            document.getElementById('quoteTotalMax').textContent = '$' + max.toLocaleString();

            // Timeline
            if (state.complexity && state.projectType) {
                var tl2 = lang === 'es' ? timelinesEs : timelines;
                document.getElementById('quoteTimeline').textContent = tl2[state.projectType][state.complexity];
            } else {
                document.getElementById('quoteTimeline').textContent = '-';
            }

            summaryActions.style.display = state.complexity ? 'block' : 'none';

        } else if (state.mode === 'ai' && state.aiEstimate) {
            summaryEmpty.style.display = 'none';
            summaryDetails.style.display = 'block';

            document.getElementById('quoteTypeValue').textContent = state.aiEstimate.typeLabel;
            document.getElementById('quoteFeaturesValue').textContent =
                state.aiEstimate.features.length + (lang === 'es' ? ' detectadas' : ' detected') + ' — +$' + state.aiEstimate.featuresTotal;
            document.getElementById('quoteComplexityValue').textContent = state.aiEstimate.complexityLabel;

            document.getElementById('quoteTotalMin').textContent = '$' + state.aiEstimate.min.toLocaleString();
            document.getElementById('quoteTotalMax').textContent = '$' + state.aiEstimate.max.toLocaleString();
            document.getElementById('quoteTimeline').textContent = state.aiEstimate.timeline;

            summaryActions.style.display = 'block';
        } else {
            summaryEmpty.style.display = 'block';
            summaryDetails.style.display = 'none';
            summaryActions.style.display = 'none';
        }
    }

    // ===== AI ANALYSIS ENGINE =====
    var aiKeywords = {
        // Project type detection
        types: {
            website: ['website', 'landing', 'blog', 'sitio web', 'pagina web', 'sitio', 'pagina', 'corporate', 'corporativo', 'brochure'],
            webapp: ['web app', 'webapp', 'plataforma', 'platform', 'saas', 'portal', 'dashboard', 'sistema web', 'aplicacion web', 'marketplace', 'e-commerce', 'ecommerce', 'tienda online', 'online store'],
            mobile: ['mobile', 'movil', 'app', 'android', 'ios', 'iphone', 'celular', 'telefono', 'react native', 'flutter'],
            automation: ['automatizar', 'automate', 'power automate', 'power apps', 'power platform', 'rpa', 'flow', 'flujo', 'sharepoint', 'excel automation'],
            bi: ['dashboard', 'power bi', 'reporte', 'report', 'analytics', 'dax', 'kpi', 'metricas', 'metrics', 'datos', 'data visualization', 'visualizacion'],
            bitcoin: ['bitcoin', 'btc', 'crypto', 'criptomoneda', 'cryptocurrency', 'trading', 'blockchain', 'wallet', 'defi', 'altcoin', 'ethereum', 'eth', 'inversion', 'inversi\u00f3n', 'invest', 'mercado cripto', 'crypto market', 'hodl', 'satoshi', 'lightning network']
        },
        // Feature detection
        features: [
            { keywords: ['login', 'registro', 'register', 'auth', 'autenticacion', 'authentication', 'sign up', 'cuenta', 'account', 'usuario', 'user'], name: 'Authentication system', nameEs: 'Sistema de autenticacion', price: 500 },
            { keywords: ['pago', 'payment', 'pay', 'stripe', 'paypal', 'tarjeta', 'card', 'checkout', 'cobrar', 'charge', 'factura', 'invoice'], name: 'Payment integration', nameEs: 'Integracion de pagos', price: 700 },
            { keywords: ['admin', 'panel', 'backoffice', 'back office', 'administrador', 'gestion', 'management', 'manage'], name: 'Admin panel', nameEs: 'Panel de administracion', price: 600 },
            { keywords: ['chat', 'mensaje', 'message', 'messaging', 'inbox', 'comunicacion', 'communication'], name: 'Messaging / Chat', nameEs: 'Mensajeria / Chat', price: 600 },
            { keywords: ['notificacion', 'notification', 'alert', 'alerta', 'push', 'email notification', 'reminder'], name: 'Notifications', nameEs: 'Notificaciones', price: 400 },
            { keywords: ['mapa', 'map', 'gps', 'ubicacion', 'location', 'geolocalizacion', 'geolocation', 'tracking', 'rastreo', 'seguimiento', 'delivery'], name: 'Maps / Geolocation', nameEs: 'Mapas / Geolocalizacion', price: 500 },
            { keywords: ['buscar', 'search', 'filtro', 'filter', 'busqueda'], name: 'Advanced search & filters', nameEs: 'Busqueda avanzada y filtros', price: 350 },
            { keywords: ['subir', 'upload', 'archivo', 'file', 'imagen', 'image', 'photo', 'foto', 'documento', 'document', 'galeria', 'gallery'], name: 'File/image upload', nameEs: 'Subida de archivos/imagenes', price: 350 },
            { keywords: ['real-time', 'real time', 'tiempo real', 'en vivo', 'live', 'websocket', 'socket'], name: 'Real-time features', nameEs: 'Funciones en tiempo real', price: 600 },
            { keywords: ['ia', 'ai', 'inteligencia artificial', 'artificial intelligence', 'chatbot', 'bot', 'claude', 'gpt', 'openai', 'machine learning'], name: 'AI integration', nameEs: 'Integracion de IA', price: 800 },
            { keywords: ['inventario', 'inventory', 'stock', 'almacen', 'warehouse', 'producto', 'product', 'catalogo', 'catalog'], name: 'Inventory / Product catalog', nameEs: 'Inventario / Catalogo de productos', price: 450 },
            { keywords: ['reporte', 'report', 'estadistica', 'statistic', 'grafico', 'chart', 'analytics', 'exportar', 'export'], name: 'Reports & analytics', nameEs: 'Reportes y analytics', price: 400 },
            { keywords: ['calendario', 'calendar', 'agenda', 'schedule', 'cita', 'appointment', 'reserva', 'booking', 'reservation'], name: 'Booking / Calendar', nameEs: 'Reservas / Calendario', price: 500 },
            { keywords: ['carrito', 'cart', 'shopping', 'compra', 'purchase', 'orden', 'order', 'pedido'], name: 'Shopping cart / Orders', nameEs: 'Carrito / Pedidos', price: 500 },
            { keywords: ['seo', 'google', 'posicionamiento', 'ranking', 'organic'], name: 'SEO optimization', nameEs: 'Optimizacion SEO', price: 300 },
            { keywords: ['responsive', 'movil', 'mobile', 'tablet', 'adaptable'], name: 'Responsive design', nameEs: 'Diseno responsive', price: 200 },
            { keywords: ['multi idioma', 'multilingual', 'multi-language', 'ingles', 'english', 'traduccion', 'translation', 'i18n'], name: 'Multi-language', nameEs: 'Multi-idioma', price: 350 },
            { keywords: ['social', 'facebook', 'instagram', 'twitter', 'whatsapp', 'compartir', 'share', 'red social', 'social media'], name: 'Social media integration', nameEs: 'Integracion redes sociales', price: 300 },
            { keywords: ['seguridad', 'security', 'rol', 'role', 'permiso', 'permission', 'rbac', 'access control'], name: 'Role-based security', nameEs: 'Seguridad por roles', price: 400 },
            { keywords: ['offline', 'sin conexion', 'pwa', 'progressive'], name: 'Offline / PWA support', nameEs: 'Soporte offline / PWA', price: 500 },
        ]
    };

    document.getElementById('quoteAiAnalyze').addEventListener('click', function() {
        var text = document.getElementById('quoteAiInput').value.trim().toLowerCase();
        if (!text || text.length < 20) {
            document.getElementById('quoteAiInput').style.borderColor = '#EF4444';
            setTimeout(function() { document.getElementById('quoteAiInput').style.borderColor = ''; }, 2000);
            return;
        }

        var lang = getLang();

        // Detect project type
        var typeScores = {};
        Object.keys(aiKeywords.types).forEach(function(type) {
            typeScores[type] = 0;
            aiKeywords.types[type].forEach(function(kw) {
                if (text.includes(kw)) typeScores[type] += 1;
            });
        });

        // If mobile + webapp both detected, might be fullstack
        if (typeScores.mobile > 0 && (typeScores.webapp > 0 || text.includes('web'))) {
            typeScores.fullstack = (typeScores.fullstack || 0) + typeScores.mobile + typeScores.webapp + 2;
        }

        var detectedType = 'webapp'; // default
        var maxScore = 0;
        Object.keys(typeScores).forEach(function(type) {
            if (typeScores[type] > maxScore) {
                maxScore = typeScores[type];
                detectedType = type;
            }
        });

        // Detect features
        var detectedFeatures = [];
        aiKeywords.features.forEach(function(feat) {
            var matched = feat.keywords.some(function(kw) { return text.includes(kw); });
            if (matched) {
                detectedFeatures.push(feat);
            }
        });

        // Estimate complexity by text length and feature count
        var complexity = 'small';
        var mult = 1;
        if (text.length > 500 || detectedFeatures.length > 8) {
            complexity = 'large'; mult = 3;
        } else if (text.length > 200 || detectedFeatures.length > 4) {
            complexity = 'medium'; mult = 1.8;
        }

        // Base prices per type (market-adjusted)
        var base = getMarketBasePrice(detectedType);
        var fMult = marketFeatureMultiplier[lang] || 1;
        var featuresTotal = detectedFeatures.reduce(function(sum, f) { return sum + Math.round(f.price * fMult); }, 0);
        var rawTotal = (base + featuresTotal) * mult;
        var min = Math.round(rawTotal * 0.85);
        var max = Math.round(rawTotal * 1.15);

        var sizeLabels = { small: { en: 'Small', es: 'Pequeno' }, medium: { en: 'Medium', es: 'Mediano' }, large: { en: 'Large', es: 'Grande' } };
        var tl2 = lang === 'es' ? timelinesEs : timelines;

        state.aiEstimate = {
            type: detectedType,
            typeLabel: (lang === 'es' ? typeLabels[detectedType].es : typeLabels[detectedType].en) + ' — $' + base.toLocaleString(),
            features: detectedFeatures,
            featuresTotal: featuresTotal,
            complexityLabel: sizeLabels[complexity][lang] + ' (x' + mult + ')',
            min: min,
            max: max,
            timeline: tl2[detectedType][complexity],
            description: text
        };

        // Show AI result
        var resultDiv = document.getElementById('quoteAiResult');
        var detectedDiv = document.getElementById('quoteAiDetected');
        resultDiv.style.display = 'block';

        var html = '<div class="quote-ai-detected-item"><i class="ph ph-app-window"></i><span class="ai-feature-name"><strong>' +
            (lang === 'es' ? 'Tipo detectado: ' : 'Detected type: ') +
            (lang === 'es' ? typeLabels[detectedType].es : typeLabels[detectedType].en) +
            '</strong></span><span class="ai-feature-cost">$' + base.toLocaleString() + ' base</span></div>';

        detectedFeatures.forEach(function(f) {
            var adjPrice = Math.round(f.price * fMult);
            html += '<div class="quote-ai-detected-item"><i class="ph ph-check-circle"></i><span class="ai-feature-name">' +
                (lang === 'es' ? f.nameEs : f.name) +
                '</span><span class="ai-feature-cost">+$' + adjPrice.toLocaleString() + '</span></div>';
        });

        html += '<div class="quote-ai-detected-item"><i class="ph ph-gauge"></i><span class="ai-feature-name"><strong>' +
            (lang === 'es' ? 'Complejidad estimada: ' : 'Estimated complexity: ') +
            sizeLabels[complexity][lang] +
            '</strong></span><span class="ai-feature-cost">x' + mult + '</span></div>';

        detectedDiv.innerHTML = html;

        updateSummary();

        // Scroll to result
        setTimeout(function() {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    });

    // ===== HIRE MODAL =====
    document.getElementById('quoteHireBtn').addEventListener('click', function() {
        var lang = getLang();
        var modal = document.getElementById('quoteModal');
        var summaryDiv = document.getElementById('quoteModalSummary');

        // Build summary text
        var lines = [];
        if (state.mode === 'builder' && state.projectType) {
            var tl = typeLabels[state.projectType];
            lines.push((lang === 'es' ? 'Tipo: ' : 'Type: ') + (lang === 'es' ? tl.es : tl.en));
            if (state.selectedFeatures.length > 0) {
                var features = featureCatalog[state.projectType] || [];
                var selectedNames = state.selectedFeatures.map(function(id) {
                    var f = features.find(function(feat) { return feat.id === id; });
                    return f ? (lang === 'es' ? f.nameEs : f.name) : id;
                });
                lines.push((lang === 'es' ? 'Funcionalidades: ' : 'Features: ') + selectedNames.join(', '));
            }
            if (state.complexity) {
                var sizeLabels2 = { small: lang === 'es' ? 'Pequeno' : 'Small', medium: lang === 'es' ? 'Mediano' : 'Medium', large: lang === 'es' ? 'Grande' : 'Large' };
                lines.push((lang === 'es' ? 'Tamano: ' : 'Size: ') + sizeLabels2[state.complexity]);
            }
            lines.push((lang === 'es' ? 'Rango estimado: ' : 'Estimated range: ') +
                document.getElementById('quoteTotalMin').textContent + ' - ' + document.getElementById('quoteTotalMax').textContent);
            lines.push((lang === 'es' ? 'Tiempo estimado: ' : 'Estimated timeline: ') + document.getElementById('quoteTimeline').textContent);
        } else if (state.mode === 'ai' && state.aiEstimate) {
            lines.push((lang === 'es' ? 'Descripcion del proyecto: ' : 'Project description: ') + state.aiEstimate.description);
            lines.push((lang === 'es' ? 'Tipo detectado: ' : 'Detected type: ') + (lang === 'es' ? typeLabels[state.aiEstimate.type].es : typeLabels[state.aiEstimate.type].en));
            var featureNames = state.aiEstimate.features.map(function(f) { return lang === 'es' ? f.nameEs : f.name; });
            lines.push((lang === 'es' ? 'Funcionalidades detectadas: ' : 'Detected features: ') + featureNames.join(', '));
            lines.push((lang === 'es' ? 'Rango estimado: $' : 'Estimated range: $') + state.aiEstimate.min.toLocaleString() + ' - $' + state.aiEstimate.max.toLocaleString());
            lines.push((lang === 'es' ? 'Tiempo estimado: ' : 'Estimated timeline: ') + state.aiEstimate.timeline);
        }

        summaryDiv.innerHTML = lines.map(function(l) { return '<p>' + l + '</p>'; }).join('');
        document.getElementById('hireRequirements').value = lines.join('\n');

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    document.getElementById('quoteModalClose').addEventListener('click', closeModal);
    document.getElementById('quoteModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    function closeModal() {
        document.getElementById('quoteModal').style.display = 'none';
        document.body.style.overflow = '';
    }

    // Submit hire form
    document.getElementById('quoteHireForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        sendForm(form, function() {
            form.style.display = 'none';
            document.getElementById('quoteModalSuccess').style.display = 'block';
            setTimeout(function() {
                closeModal();
                form.style.display = '';
                form.reset();
                document.getElementById('quoteModalSuccess').style.display = 'none';
            }, 3000);
        });
    });

    // Re-render features and recalculate prices when language/market changes
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            setTimeout(function() {
                if (state.projectType) {
                    state.basePrice = getMarketBasePrice(state.projectType);
                    renderFeatures();
                    // Recalculate features total with new market prices
                    state.featuresTotal = 0;
                    state.selectedFeatures = [];
                }
                updateSummary();
            }, 100);
        });
    });

    // Observe cotizador section for animation
    var quoteSectionEls = document.querySelectorAll('.quote-mode-toggle, .quote-layout, .quote-option-card');
    quoteSectionEls.forEach(function(el) {
        el.classList.add('animate-target');
        if (typeof observer !== 'undefined') observer.observe(el);
    });
})();
