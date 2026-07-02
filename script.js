// ========== SECURITY: HTML ESCAPE HELPER ==========
function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

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

// NOTE: universal card-reveal IntersectionObserver removed — motion.js owns scroll reveals.

// ========== ACTIVE NAV LINK HIGHLIGHT ==========
const sections = document.querySelectorAll('section[id]');
// Sections without their own nav link highlight the chapter they belong to.
const NAV_SECTION_MAP = {
    proyectos: '#proyectos',
    servicios: '#servicios',
    anatomia: '#anatomia',
    proceso: '#anatomia',
    cotizador: '#cotizador',
    contacto: '#contacto'
};

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    let currentId = null;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            currentId = section.getAttribute('id');
        }
    });

    const target = currentId ? NAV_SECTION_MAP[currentId] : null;
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', !!target && link.getAttribute('href') === target);
    });
});

// ========== LANGUAGE TOGGLE ==========
const translations = {
    es: {
        "nav-problemas": "Problemas",
        "nav-servicios": "Servicios",
        "nav-proyectos": "Evidencia",
        "nav-stack": "Stack",
        "nav-sobre-mi": "Estudio",
        "nav-cta": "Contacto",
        "hero-badge-education": "<i class=\"ph ph-graduation-cap\"></i> MSc Data Science + MSc BI",
        "hero-badge-blockchain": "<i class=\"ph ph-bitcoin-logo\"></i> Especialista Blockchain y Crypto",
        "hero-badge-countries": "<i class=\"ph ph-globe-hemisphere-west\"></i> 4 países",
        "hero-title": "<span class=\"line-mask\"><span class=\"line\">Elimino el caos operativo</span></span><span class=\"line-mask\"><span class=\"line\">con sistemas digitales que funcionan</span></span><span class=\"line-mask\"><span class=\"line\"><em>desde el día uno</em>.</span></span>",
        "hero-subtitle": "Power Platform, automatización e IA aplicada para empresas en LATAM y EE. UU. Diseño, construyo y opero el sistema completo — no solo el dashboard.",
        "hero-cta-primary": "Agenda un diagnóstico de 30 min",
        "hero-cta-secondary": "Estima tu proyecto en 60 segundos →",
        "hero-stack-label": "Stack principal:",
        "proof-certs": "Certificaciones Microsoft",
        "proof-solutions": "Sistemas en producción",
        "proof-countries": "Países atendidos",
        "proof-years": "Años de experiencia",
        "problems-tag": "El diagnóstico",
        "problems-title": "Esto es lo que escucho de empresas como la tuya",
        "problems-subtitle": "Seis patrones. Los he visto — y resuelto — todos.",
        "problem-1-title": "“Nuestro proceso crítico vive en un Excel que nadie se atreve a tocar.”",
        "problem-1-desc": "→ Se resuelve con una app gobernada + flujo automatizado — ver Automatización de Procesos.",
        "problem-2-title": "“Las aprobaciones tardan días porque dependen de que alguien lea un correo.”",
        "problem-2-desc": "→ Se resuelve con flujos de aprobación con recordatorios y trazabilidad completa.",
        "problem-3-title": "“Cada lunes alguien pierde horas armando a mano el mismo reporte.”",
        "problem-3-desc": "→ Se resuelve con un pipeline automatizado a Power BI — el reporte se arma solo.",
        "problem-4-title": "“No veo lo que pasa en la operación hasta que ya es tarde.”",
        "problem-4-desc": "→ Se resuelve con dashboards en vivo alimentados por los sistemas que ya usas.",
        "problem-5-title": "“Nuestros sistemas no se hablan, así que la gente redigita todo.”",
        "problem-5-desc": "→ Se resuelve con integraciones y APIs — el dato se captura una vez.",
        "problem-6-title": "“Solo una persona sabe cómo funciona el proceso. Si se va, quedamos ciegos.”",
        "problem-6-desc": "→ Se resuelve con sistemas documentados y automatizados que no dependen de nadie.",
        "services-tag": "Qué hacemos",
        "services-title": "Lo que construyo, y desde cuánto",
        "services-subtitle": "Automatización y bots, datos y BI, pipelines ETL, apps web y móviles, e IA aplicada — entregados de punta a punta sobre Microsoft Power Platform, n8n y un stack web moderno.",
        "service-badge-popular": "Más solicitado",
        "service-1-title": "Automatización de Procesos Operativos",
        "service-1-desc": "Reemplazo flujos manuales repetitivos por automatizaciones que se ejecutan solas: aprobaciones, notificaciones, generación de documentos, sincronización de datos entre sistemas.",
        "service-1-item-1": "Diagnóstico de procesos candidatos",
        "service-1-item-2": "Flujos en Power Automate (Cloud + Desktop)",
        "service-1-item-3": "Manejo de errores y logging",
        "service-1-item-4": "Documentación y capacitación",
        "service-1-result": "Tu equipo deja de hacer trabajo mecánico y se enfoca en decisiones.",
        "service-2-title": "Aplicaciones de Negocio a Medida",
        "service-2-desc": "Diseño y construyo aplicaciones empresariales con Power Apps conectadas a tus datos reales. Portales de solicitudes, registros de campo, gestión documental, inventarios.",
        "service-2-item-1": "Levantamiento de requerimientos",
        "service-2-item-2": "Desarrollo en Power Apps (Canvas/Model-Driven)",
        "service-2-item-3": "Flujos de automatización asociados",
        "service-2-item-4": "Seguridad por rol y responsive design",
        "service-2-result": "Apps funcionales en semanas, no en meses.",
        "service-3-title": "Dashboards e Inteligencia Operativa",
        "service-3-desc": "Conecto tus fuentes de datos (SQL, APIs, SharePoint, Excel, service desks) en dashboards de Power BI que muestran lo que importa: KPIs, tendencias, alertas y detalle bajo demanda.",
        "service-3-item-1": "Conexión a múltiples fuentes de datos",
        "service-3-item-2": "Modelado DAX + Power Query avanzado",
        "service-3-item-3": "Refresh automático y seguridad por rol",
        "service-3-item-4": "Publicación en Power BI Service",
        "service-3-result": "Datos reales, actualizados, sin manipulación manual.",
        "service-4-title": "Gestión Documental con Control",
        "service-4-desc": "Implemento sistemas de control documental sobre SharePoint con codificación estandarizada, versionado, permisos por rol y búsqueda inteligente con IA.",
        "service-4-item-1": "Codificación automática de documentos",
        "service-4-item-2": "Búsqueda con AI Builder + KQL",
        "service-4-item-3": "Filtros de seguridad por área y rol",
        "service-4-item-4": "Trazabilidad para auditorías",
        "service-4-result": "Tu documentación deja de ser un caos y se vuelve un activo gestionado.",
        "service-5-title": "Portales de Solicitudes y Aprobaciones",
        "service-5-desc": "Portales digitales con formularios inteligentes, flujos de aprobación multinivel, notificaciones automáticas, escalamiento por tiempo y trazabilidad completa.",
        "service-5-item-1": "Formulario Power Apps con validaciones",
        "service-5-item-2": "Aprobaciones paralelas/secuenciales",
        "service-5-item-3": "Notificaciones email + Teams",
        "service-5-item-4": "Dashboard de seguimiento",
        "service-5-result": "De días de aprobación manual a horas automáticas.",
        "service-6-title": "Consultoría y Roadmap de Digitalización",
        "service-6-desc": "Analizo tus procesos actuales, identifico cuellos de botella y oportunidades de automatización, y entrego un roadmap priorizado con soluciones concretas.",
        "service-6-item-1": "Mapeo de procesos (AS-IS / TO-BE)",
        "service-6-item-2": "Evaluación de madurez digital",
        "service-6-item-3": "Roadmap 3-6-12 meses con ROI",
        "service-6-item-4": "Documento ejecutivo para directivos",
        "service-6-result": "Sin humo, sin promesas vacías: un plan ejecutable.",
        "service-badge-new": "Nuevo",
        "service-7-title": "Aplicaciones Web Full-Stack",
        "service-7-desc": "Diseño y construyo plataformas web modernas con Next.js, React, NestJS y PostgreSQL. Desde marketplaces y productos SaaS hasta portales de clientes y herramientas internas — responsive, escalables, listas para producción.",
        "service-7-item-1": "Frontend Next.js + React + Tailwind",
        "service-7-item-2": "Backend NestJS API + Prisma + PostgreSQL",
        "service-7-item-3": "Autenticación, pagos, funcionalidades real-time",
        "service-7-item-4": "Deploy con Docker + pipeline CI/CD",
        "service-7-result": "Plataformas web custom construidas en semanas, desplegadas y listas para escalar.",
        "service-badge-hot": "Alta demanda",
        "service-9-title": "Desarrollo de Apps Moviles",
        "service-9-desc": "Construyo apps moviles cross-platform con React Native y Expo que funcionan en iOS y Android desde un solo código. Desde apps de e-commerce y delivery hasta sistemas de reservas y herramientas internas — rendimiento nativo, UX moderna, publicadas en ambas tiendas.",
        "service-9-item-1": "React Native / Expo (iOS + Android)",
        "service-9-item-2": "Notificaciones push + soporte offline",
        "service-9-item-3": "GPS, camara, biometria, pagos",
        "service-9-item-4": "Publicacion en App Store + Play Store",
        "service-9-result": "Tu negocio en el bolsillo de tus clientes — un código, dos plataformas.",
        "service-8-title": "Soluciones con Inteligencia Artificial",
        "service-8-desc": "Integro inteligencia artificial en tus procesos de negocio y aplicaciones. Desde asistentes inteligentes y análisis de documentos hasta flujos automatizados con Claude AI y agentes de IA personalizados.",
        "service-8-item-1": "Integración de Claude AI / LLMs en apps",
        "service-8-item-2": "Chatbots y asistentes virtuales inteligentes",
        "service-8-item-3": "Análisis de documentos y extracción de datos",
        "service-8-item-4": "Agentes de IA para automatización de flujos",
        "service-8-result": "Tu equipo trabaja con IA, no contra ella. Ganancias reales de productividad desde el día uno.",
        "service-badge-btc": "Bitcoin",
        "service-10-title": "Asesoría Bitcoin y Criptomonedas",
        "service-10-desc": "Como operador activo del mercado de Bitcoin y creador de Bitcoin Academy Tech, brindo orientacion financiera basada en datos sobre Bitcoin y activos digitales. Desde entender ciclos de mercado y construir estrategias de inversion hasta análisis tecnico y gestión de riesgo — respaldado por experiencia real de trading y credenciales academicas en Tecnologia Blockchain.",
        "service-10-item-1": "Análisis de mercado Bitcoin y análisis tecnico",
        "service-10-item-2": "Estrategia de inversion y asignacion de portafolio",
        "service-10-item-3": "Gestión de riesgo y tamaño de posiciones",
        "service-10-item-4": "Sesiones educativas (1-a-1 o grupales)",
        "service-10-result": "Toma decisiones informadas en mercados crypto — sin hype, solo datos y estrategia.",
        "service-10-link": "<i class=\"ph ph-arrow-square-out\"></i> Visita Bitcoin Academy Tech",
        "process-tag": "Cómo trabajamos",
        "process-title": "Semanas, no un proyecto de dos años",
        "process-subtitle": "Un proceso claro de 5 pasos para llevar tu operación de manual a digital",
        "step-1-title": "Diagnóstico",
        "step-1-duration": "1-2 días",
        "step-1-desc": "Entiendo tu operación actual: qué procesos duelen, dónde se pierde tiempo, qué información falta. No asumo. Pregunto, observo y documento antes de proponer nada.",
        "step-2-title": "Diseño de la solución",
        "step-2-duration": "2-3 días",
        "step-2-desc": "Defino la arquitectura técnica, los flujos de datos, la experiencia de usuario y los criterios de éxito. Plan claro con alcance, entregables, tiempos y dependencias.",
        "step-3-title": "Construcción iterativa",
        "step-3-duration": "2-8 semanas",
        "step-3-desc": "Construyo en ciclos cortos con entregas funcionales cada 1-2 semanas. Ves avance real desde el inicio, puedes probar temprano y ajustar sin esperar al final.",
        "step-4-title": "Pruebas y ajuste",
        "step-4-duration": "3-5 días",
        "step-4-desc": "Valido con usuarios reales, corrijo problemas de usabilidad y rendimiento. La solución no se entrega hasta que funcione en el contexto real de tu equipo.",
        "step-5-title": "Entrega y transferencia",
        "step-5-duration": "1-2 días",
        "step-5-desc": "Entrego en producción con documentación técnica, guía de usuario y sesión de capacitación. Tu equipo queda capacitado para operar y mantener lo construido.",
        "step-1-short": "Mapeo qué duele antes de proponer nada.",
        "step-2-short": "Arquitectura, flujos de datos y criterios de éxito.",
        "step-3-short": "Entregas funcionales cada 1-2 semanas.",
        "step-4-short": "Validado con usuarios reales, en contexto real.",
        "step-5-short": "Producción, documentación y capacitación. Tuyo para operar.",
        "flow-process-caption": "Sistemas que siguen funcionando sin mí después de la entrega.",
        "autoflow-tag": "Automatización, en movimiento",
        "autoflow-title": "Anatomía de una automatización",
        "autoflow-subtitle": "Desplázate para conducir una solicitud por el sistema: disparo → proceso → validación → integración → notificación → dashboard.",
        "autoflow-1-title": "Disparador",
        "autoflow-1-desc": "Un evento lo activa",
        "autoflow-2-title": "Proceso",
        "autoflow-2-desc": "Hace el trabajo",
        "autoflow-3-title": "Validación",
        "autoflow-3-desc": "Reglas y manejo de errores",
        "autoflow-4-title": "Integración",
        "autoflow-4-desc": "Los sistemas se conectan",
        "autoflow-5-title": "Notifica",
        "autoflow-5-desc": "Avisa a quien corresponde",
        "autoflow-6-title": "Tablero",
        "autoflow-6-desc": "Todo visible, en vivo",
        "autoflow-caption": "Corre programado o bajo demanda, y escala a una persona solo cuando de verdad hace falta.",
        "svc-bitcoin-badge": "Consultoría",
        "svc-bitcoin-title": "Consultoría y Educación Bitcoin",
        "svc-bitcoin-desc": "Asesoría práctica y basada en datos sobre Bitcoin para empresas y equipos: desde aceptar pagos con Bitcoin y Lightning hasta capacitar a tu gente y leer el mercado con datos reales, no con ruido. Como operador de mercado y creador de Bitcoin Academy Tech, uno lo técnico con lo estratégico. Educación y estrategia, no asesoría financiera regulada.",
        "svc-bitcoin-b1": "Adopción de Bitcoin para empresas (aceptar BTC / Lightning)",
        "svc-bitcoin-b2": "Talleres y capacitación para equipos",
        "svc-bitcoin-b3": "Análisis de mercado y estrategia con datos",
        "svc-bitcoin-b4": "Orientación en medios de pago y tesorería",
        "svc-bitcoin-result": "Tu equipo entiende Bitcoin y puede actuar con claridad, no con miedo.",
        "arch-tag": "Ecosistema conectado",
        "arch-title": "Tu ecosistema Microsoft, conectado",
        "arch-subtitle": "Tus datos fluyen de SharePoint, Dataverse y SQL a través de Power Automate hasta las apps y dashboards que tu equipo usa a diario &mdash; una sola plataforma, sin islas.",
        "arch-team": "Tu equipo",
        "arch-caption": "Datos &rarr; Automatización &rarr; Experiencia. Una sola plataforma, sin islas.",
        "btc-tag": "Bitcoin, con criterio",
        "btc-title": "De \"quiero aceptar Bitcoin\" a hacerlo bien",
        "btc-subtitle": "Acompaño a empresas y equipos a adoptar Bitcoin con cabeza: educación, medios de pago (on-chain y Lightning) y lectura de mercado con datos. Educación y estrategia, no asesoría financiera regulada.",
        "btc-1-title": "Diagnóstico",
        "btc-1-desc": "Dónde encaja Bitcoin",
        "btc-2-title": "Educación",
        "btc-2-desc": "Tu equipo entiende",
        "btc-3-title": "Setup",
        "btc-3-desc": "Wallet + BTCPay",
        "btc-4-title": "Aceptar pagos",
        "btc-4-desc": "On-chain + Lightning",
        "btc-5-title": "Tesorería",
        "btc-5-desc": "Registro y control",
        "btc-6-title": "Reportes",
        "btc-6-desc": "Visible y auditable",
        "btc-caption": "Adopción práctica, sin exageraciones &mdash; a tu ritmo y con tus números claros.",
        "btc-proof": "Ver Bitcoin Academy &mdash; plataforma educativa real",
        "trust-title": "Cómo trabajo contigo",
        "trust-1": "Alcance y precio fijos",
        "trust-2": "Pagos por hito",
        "trust-3": "El código y las cuentas son tuyos",
        "trust-4": "Documentación y capacitación incluidas",
        "trust-5": "Respuesta en 24 h",
        "about-availability-label": "Disponibilidad",
        "about-availability-value": "Solapamiento total con horario de EE.UU. (CST)",
        "impact-label": "Impacto típico",
        "proj1-impact": "Búsqueda de docs: minutos &rarr; segundos &middot; menos escalamientos",
        "proj2-impact": "3 fuentes &rarr; 1 vista &middot; ~1 día/mes de reportes ahorrado",
        "proj6-impact": "~500 registros/corrida, sin intervención &middot; horas/semana recuperadas",
        "cta-whatsapp": "Escríbeme por WhatsApp",
        "projects-tag": "Casos seleccionados",
        "projects-title": "Sistemas ya corriendo en producción",
        "projects-subtitle": "Casos reales. Resultados cualitativos y verificables — sin porcentajes inventados.",
        "proj1-tag-ai": "IA Aplicada",
        "proj1-industry": "Servicios IT Gestionados — Regional LATAM",
        "proj1-title": "Asistente Técnico con Inteligencia Artificial",
        "proj1-tagline": "De buscar manuales por horas a encontrar respuestas en segundos",
        "label-problem": "Situación",
        "label-solution": "Solución",
        "label-results": "Resultado",
        "proj1-problem": "Técnicos de campo perdían tiempo significativo buscando documentación técnica. Navegaban carpetas de SharePoint sin sistema de búsqueda inteligente, enviaban mensajes a colegas pidiendo archivos, o resolvían sin consultar la documentación oficial.",
        "proj1-solution": "App en Power Apps donde el técnico escribe su consulta en lenguaje natural. AI Builder extrae keywords, se construye una query KQL contra SharePoint Search API, se filtran resultados por área/rol del técnico, y se devuelven documentos relevantes en segundos.",
        "proj1-result-1": "Búsqueda de documentación pasó de minutos a segundos",
        "proj1-result-2": "Eliminó dependencia de \"preguntarle al que sabe\"",
        "proj1-result-3": "Escalaciones por falta de información reducidas visiblemente",
        "proj1-result-4": "Seguridad por rol: cada técnico ve solo lo que le corresponde",
        "proj1-arch-title": "Esquema del sistema",
        "arch-technician": "Técnico",
        "proj2-industry": "Service Desk Regional",
        "proj2-title": "Dashboard Ejecutivo Multi-Fuente",
        "proj2-tagline": "Unificando datos de 3 service desks en un solo dashboard",
        "proj2-problem": "Tres fuentes de datos distintas (una herramienta de monitoreo, un sistema de tickets y una base de datos SQL Server) sin vista unificada. Para ver el panorama completo, había que entrar a tres portales diferentes. La gerencia tomaba decisiones con información parcial.",
        "proj2-solution": "Dashboard ejecutivo en Power BI conectando las tres fuentes. Queries M con paginación dinámica (List.Generate) para APIs, gateway on-premises para SQL Server, modelo dimensional unificado y refresh automático.",
        "proj2-result-1": "Vista consolidada de toda la operación de soporte",
        "proj2-result-2": "Eliminó preparación manual de reportes ejecutivos",
        "proj2-result-3": "Identificó patrones de carga por país y técnico",
        "proj2-result-4": "Visibilidad en tiempo real para toma de decisiones",
        "proj2-arch-title": "Flujo de datos",
        "proj3-industry": "Gobierno Documental Corporativo",
        "proj3-title": "Sistema de Gestión Documental",
        "proj3-tagline": "De carpetas compartidas a gobierno de la información",
        "proj3-problem": "Documentación en carpetas sin clasificación formal, versiones duplicadas, sin permisos por rol, sin trazabilidad. Auditorías internas requerían esfuerzo manual para demostrar control.",
        "proj3-solution": "Listado Maestro con codificación estructurada [ÁREA-CLASE-ALCANCE-CORRELATIVO-VERSIÓN], generación automática de códigos vía Power Automate, Power App como frontend, filtros de seguridad por área y rol.",
        "proj3-result-1": "Catálogo maestro con código único y versión vigente",
        "proj3-result-2": "Permisos controlados: cada usuario ve solo lo que corresponde",
        "proj3-result-3": "Generación automática eliminó errores de clasificación",
        "proj3-result-4": "Base lista para auditorías con trazabilidad completa",
        "proj3-arch-title": "Estructura de codificación",
        "code-area": "Área",
        "code-class": "Clase",
        "code-scope": "Alcance",
        "code-serial": "Corr.",
        "code-version": "Versión",
        "proj4-title": "Portal de Solicitudes de Viaje",
        "proj4-tagline": "Solicitudes de viaje con aprobación digital multinivel",
        "proj4-desc": "Portal digital que reemplazó aprobaciones por correo con formulario estandarizado, flujo multinivel automático, notificaciones en tiempo real y tracking de estado. Estandarizado para todos los países de operación.",
        "proj4-result-1": "Eliminó dependencia de correo electrónico",
        "proj4-result-2": "Estado visible en tiempo real para el solicitante",
        "proj4-result-3": "Trazabilidad completa de cada aprobación",
        "proj5-title": "Solicitud de Orden de Compra",
        "proj5-tagline": "Órdenes de compra trazables de solicitud a cierre",
        "proj5-desc": "Sistema digital con formulario estructurado, aprobaciones por monto y área, gestión de estados (8 estados), adjuntos vinculados por orden, y reportería de compras consolidada.",
        "proj5-result-1": "Formato único y estandarizado para todas las áreas",
        "proj5-result-2": "Adjuntos viajan con la solicitud, no por separado",
        "proj5-result-3": "Compliance y control de gasto auditable",
        "proj6-industry": "Operaciones Internas — LATAM",
        "proj6-title": "Automatización RPA para Sistemas Legacy",
        "proj6-tagline": "Bots que procesan lo que nadie quiere procesar",
        "proj6-problem": "Procesos manuales repetitivos con archivos Excel: importaciones masivas de casos para múltiples países LATAM, formatos de fecha inconsistentes, archivos bloqueados por OneDrive sync.",
        "proj6-solution": "Suite de bots en Power Automate Desktop con manejo de OneDrive sync, validación automática de formatos por país, procesamiento batch de 500 registros, orquestación desde cloud flows.",
        "proj6-result-1": "Horas semanales de trabajo manual eliminadas",
        "proj6-result-2": "Errores de formato y datos eliminados por completo",
        "proj6-result-3": "Procesos independientes de personas específicas",
        "proj6-result-4": "Personal redirigido a actividades de mayor valor",
        "proj6-arch-title": "Flujo de automatización",
        "proj7-industry": "Servicios IT Gestionados — Regional LATAM",
        "proj7-title": "Control Documental — Listado Maestro",
        "proj7-tagline": "Un listado maestro gobernado en lugar de una hoja mantenida a mano",
        "proj7-problem": "Los documentos controlados se llevaban en un listado maestro mantenido a mano. Las versiones se desfasaban, las fechas de revisión pasaban inadvertidas y preparar una auditoría implicaba días persiguiendo archivos y cruzando hojas de cálculo.",
        "proj7-solution": "Un sistema automatizado de control documental sobre SharePoint: listado maestro gobernado con control de versiones, flujos de aprobación para documentos nuevos y actualizados, recordatorios automáticos de fechas de revisión y una vista en vivo del estado de toda la biblioteca.",
        "proj7-result-1": "El listado maestro se mantiene solo — las auditorías se preparan desde un registro vivo y confiable, no como una misión de rescate.",
        "proj7-result-2": "5 calculadoras de salud interactivas (IMC, cardiovascular, edad biológica, hidratación, calorías)",
        "proj7-result-3": "Panel admin con auth, dashboard, CRUD de clínicas y log de consultas",
        "proj7-result-4": "PWA-ready, SEO optimizado, modelo de monetización con AdSense integrado",
        "proj7-arch-title": "Arquitectura de la plataforma",
        "arch-patient": "Paciente",
        "arch-clinics": "Clínicas",
        "proj8-industry": "Operaciones Corporativas — Multipaís",
        "proj8-title": "Portal de Solicitudes de Viaje",
        "proj8-tagline": "Solicitudes de viaje con aprobación digital multinivel",
        "proj8-problem": "Las solicitudes y aprobaciones de viaje corrían por correo. Sin formulario estándar, sin visibilidad de dónde estaba detenida una solicitud, y cada país manejaba el proceso de forma ligeramente distinta.",
        "proj8-solution": "Un portal digital que reemplazó las aprobaciones por correo con un formulario estandarizado, flujo de aprobación multinivel automático, notificaciones en tiempo real y seguimiento de estado — estandarizado para todos los países de operación.",
        "proj8-result-1": "Cada solicitud es trazable desde el envío hasta la aprobación, y ya nadie persigue firmas por correo.",
        "proj8-result-2": "Ciclo de vida de órdenes de 10 estados: de solicitud a completado con aprobación de cotización",
        "proj8-result-3": "Pago dual: tarjetas tradicionales (Wompi) + Bitcoin (BTCPay)",
        "proj8-result-4": "Arquitectura monorepo: tipos, esquemas y config compartidos entre frontend + backend",
        "proj8-arch-title": "Arquitectura monorepo",
        "proj9-title": "AI Video Factory",
        "proj9-tagline": "Generación automatizada de videos con IA a escala",
        "proj9-desc": "Sistema de generación de videos multi-canal usando Google Veo, Runway Gen-4, ElevenLabs TTS, y orquestación con n8n. Procesamiento batch de 4 videos/día por canal con publicación automática en TikTok, YouTube Shorts e Instagram Reels.",
        "proj10-title": "Crypto Trading Dashboard",
        "proj10-tagline": "Análisis de mercado y señales de trading en tiempo real",
        "proj10-desc": "Dashboard de trading de criptomonedas con Next.js 14, gráficos profesionales de velas (lightweight-charts), datos de mercado en tiempo real, indicadores de análisis técnico, e integración PineScript para estrategias de TradingView.",
        "proj11-title": "Motor de Procesamiento de Facturas",
        "proj11-tagline": "Cumplimiento tributario y contabilidad automatizada",
        "proj11-desc": "Sistema de procesamiento batch de facturas con cálculos tributarios colombianos automatizados (retención, IVA, ICA), generación de asientos contables de partida doble, motor de reglas fiscales, y trazabilidad completa de auditoría.",
        "proj12-industry": "Compras — LATAM",
        "proj12-title": "Automatización de Órdenes de Compra",
        "proj12-tagline": "De la solicitud a la orden de compra aprobada sin redigitar",
        "proj12-problem": "Las órdenes de compra se armaban a mano desde correos y hojas de cálculo: datos redigitados, aprobaciones faltantes y ningún registro claro de quién autorizó qué ni cuándo.",
        "proj12-solution": "Un flujo automatizado de órdenes de compra: captura estandarizada de solicitudes, ruteo de aprobaciones por monto y categoría, generación automática de documentos y una traza de auditoría completa en cada orden.",
        "proj12-result-1": "Las órdenes avanzan solas de la solicitud a la aprobación, con un registro completo que resiste cualquier auditoría.",
        "proj12-result-2": "Notificaciones push mantienen clientes informados de sus pedidos",
        "proj12-result-3": "Tracking GPS en tiempo real redujo llamadas de \"donde esta mi pedido?\"",
        "proj12-result-4": "Navegacion offline: catalogo disponible sin internet",
        "proj12-arch-title": "Arquitectura móvil",
        "arch-customer": "Cliente",
        "form-opt-default": "Selecciona una opción…",
        "form-opt-automation": "Automatización de procesos (Power Platform)",
        "form-opt-webapp": "Aplicación Web (Next.js / React)",
        "form-opt-mobile": "App Móvil (iOS + Android)",
        "form-opt-dashboard": "Dashboard / BI (Power BI)",
        "form-opt-ai": "Integración de IA / Chatbot",
        "form-opt-bitcoin": "Asesoría Bitcoin y Crypto",
        "form-opt-consulting": "Consultoría / Roadmap Digital",
        "form-opt-other": "Otro",
        "form-submit": "<i class=\"ph ph-paper-plane-tilt\"></i> Solicitar propuesta gratis",
        "form-success": "¡Enviado! Te respondo en 24 horas.",
        "cta-or": "o contáctame directamente",
        "stack-tag": "Stack y certificaciones",
        "stack-title": "La decisión de plataforma",
        "stack-subtitle": "Certificación Microsoft Power Platform, respaldada por dos maestrías en Data Science y Business Intelligence y un stack web e IA listo para producción.",
        "stack-cat-fullstack": "Desarrollo Full-Stack",
        "stack-cat-ai": "IA y Sistemas Inteligentes",
        "stack-cat-apps": "Aplicaciones de Negocio",
        "stack-cat-data": "Datos e Inteligencia",
        "stack-cat-integrations": "Integraciones y APIs",
        "stack-cat-devops": "DevOps e Infraestructura",
        "certs-title": "Certificaciones Microsoft Principales",
        "certs-subtitle": "Cada certificación representa conocimiento validado y experiencia aplicada en proyectos reales.",
        "about-tag": "Sobre mí",
        "about-p1": "Empecé mi carrera en el mundo de la infraestructura y el soporte técnico. Ahí aprendí algo que muchos tecnólogos nunca entienden: <strong>la tecnología no vale nada si no resuelve un problema real del negocio.</strong>",
        "about-p2": "Con el tiempo, me fui moviendo hacia la automatización y la gestión de datos. Vi de primera mano cómo empresas enteras operaban con hojas de Excel compartidas por correo, aprobaciones por WhatsApp, reportes armados manualmente cada lunes, y procesos críticos que dependían de que \"alguien se acordara\" de hacer algo.",
        "about-p3": "Ahí encontré mi misión profesional: <strong>eliminar esa fragilidad operativa.</strong>",
        "about-p4": "Microsoft Power Platform se convirtió en mi base, pero he expandido hacia desarrollo full-stack moderno — construyendo aplicaciones web con Next.js, React, NestJS, e integrando IA con Claude API. Combino la velocidad del low-code con el poder del desarrollo custom para entregar exactamente lo que cada proyecto necesita.",
        "about-p5": "Hoy, con certificaciones Microsoft Power Platform (Power Apps, Power Automate, Power BI), dos maestrías (Data Science y Business Intelligence), un Posgrado en Tecnología Blockchain, y experiencia con clientes en Centroamérica y el Caribe, ayudo a empresas en todos los niveles: <strong>desde automatizar un proceso de aprobación roto hasta construir plataformas web completas con integración de IA.</strong>",
        "about-p6": "También soy operador activo del mercado de Bitcoin y creador de <a href=\"https://bitcoinacademy.tech\" target=\"_blank\" rel=\"noopener\">Bitcoin Academy Tech</a> — una plataforma educativa gratuita sobre Bitcoin, blockchain y activos digitales. Combino mi experiencia técnica y financiera para ayudar a personas y empresas a navegar el mercado crypto con datos reales y estrategias informadas.",
        "about-btc-label": "Bitcoin y Crypto",
        "about-btc-value": "Operador de mercado y creador de <a href=\"https://bitcoinacademy.tech\" target=\"_blank\" rel=\"noopener\">Bitcoin Academy Tech</a>",
        "about-base-label": "Base",
        "about-education-label": "Formación",
        "about-education-value": "MSc Ciencia de Datos (UNEATLÁNTICO, 2026) + MSc Inteligencia de Negocios (UNINI, 2023) + Posgrado Blockchain + Ing. en Sistemas Computacionales (UTEC)",
        "about-certs-label": "Certificaciones",
        "about-certs-value": "Power Apps · Power Automate · Power BI",
        "about-coverage-label": "Cobertura",
        "about-coverage-value": "LATAM y remoto en todo el mundo",
        "about-company-label": "Modalidad",
        "about-company-value": "Consultor Principal & Asesor Técnico",
        "about-languages-label": "Idiomas",
        "about-languages-value": "Español nativo, Inglés profesional",
        "diff-tag": "Por qué nosotros",
        "diff-title": "Lo que no soy — y lo que sí soy",
        "diff-1-title": "Un vendedor de dashboards",
        "diff-1-desc": "El arquitecto del sistema completo que alimenta el dashboard: interfaz + base de datos + automatización + aprobaciones + reportería. Todo conectado.",
        "diff-2-title": "Un generalista que intenta de todo",
        "diff-2-desc": "Un especialista certificado en la plataforma Microsoft que tu empresa ya paga.",
        "diff-3-title": "Entregar y desaparecer",
        "diff-3-desc": "Documento, capacito a tu equipo y doy soporte después de la entrega. Sigue funcionando sin mí.",
        "diff-4-title": "Un constructor de demos",
        "diff-4-desc": "Ingeniería de producción: manejo de errores (Try-Catch), logging, seguridad por roles validada en backend y ALM en cada entrega.",
        "cta-title": "Si llegaste hasta aquí, ya reconociste tu problema.",
        "cta-subtitle": "<em>La buena noticia: tiene solución, y el retorno se mide en semanas, no en años.</em>",
        "cta-button": "<i class=\"ph ph-calendar-check\"></i> Agendar consulta de diagnóstico",
        "cta-note": "Sin compromiso. Sin pitch de ventas. Solo una conversación para entender tu situación y ver si puedo ayudarte.",
        "cta-whatsapp-label": "Respuesta rápida",
        "cta-upwork-label": "Contrátame en Upwork",
        "footer-title": "Arquitecto de Soluciones Power Platform — Automatización, Datos e IA",
        "footer-services": "Servicios",
        "footer-projects": "Proyectos",
        "footer-about": "Sobre mí",
        "footer-contact": "Contacto",
        "footer-copy": "&copy; 2026 Humberto Henríquez. Todos los derechos reservados.",
        "nav-cotizador": "Precios",
        "quote-tag": "Cotización",
        "quote-title": "Obtén un número real en 60 segundos",
        "quote-subtitle": "La misma IA que integro en sistemas de clientes — estimando tu proyecto.",
        "quote-mode-builder": "<i class=\"ph ph-list-checks\"></i> Arma tu proyecto",
        "quote-mode-ai": "<i class=\"ph ph-brain\"></i> Describe con IA",
        "quote-step1-title": "¿Qué necesitas?",
        "quote-type-website": "Sitio Web",
        "quote-type-website-desc": "Landing page, sitio corporativo, blog",
        "quote-type-website-price": "Desde $1,000",
        "quote-type-webapp": "Aplicación Web",
        "quote-type-webapp-desc": "SaaS, portal, dashboard, marketplace",
        "quote-type-webapp-price": "Desde $3,000",
        "quote-type-mobile": "App Móvil",
        "quote-type-mobile-desc": "iOS y Android (React Native / PWA)",
        "quote-type-mobile-price": "Desde $3,500",
        "quote-type-fullstack": "Web + Mobile",
        "quote-type-fullstack-desc": "Plataforma completa web y móvil",
        "quote-type-fullstack-price": "Desde $5,500",
        "quote-type-automation": "Automatización",
        "quote-type-automation-desc": "Power Platform, workflows, RPA",
        "quote-type-automation-price": "Desde $1,500",
        "quote-type-bi": "Dashboard / BI",
        "quote-type-bi-desc": "Power BI, analytics, visualización",
        "quote-type-bi-price": "Desde $1,800",
        "quote-type-bitcoin": "Asesoría Bitcoin",
        "quote-type-bitcoin-desc": "Análisis de mercado, estrategia, educación",
        "quote-type-bitcoin-price": "Desde $500",
        "quote-step2-title": "Selecciona funcionalidades",
        "quote-step3-title": "Tamaño del proyecto",
        "quote-size-small": "Pequeño",
        "quote-size-small-desc": "1-5 pantallas, funcionalidad básica",
        "quote-size-medium": "Mediano",
        "quote-size-medium-desc": "6-15 pantallas, lógica moderada",
        "quote-size-large": "Grande",
        "quote-size-large-desc": "15+ pantallas, flujos complejos",
        "quote-ai-title": "Describe tu proyecto",
        "quote-ai-desc": "Contame que necesitas en tus propias palabras. Voy a analizar tu descripción y generar un costo estimado basado en las funcionalidades y complejidad detectadas.",
        "quote-ai-placeholder": "Ejemplo: Necesito una app para mi restaurante donde los clientes puedan ver el menu, pedir en linea, pagar con tarjeta, y rastrear su delivery en tiempo real. Tambien necesito un panel admin para gestionar pedidos e inventario...",
        "quote-ai-btn": "<i class=\"ph ph-sparkle\"></i> Analizar y estimar",
        "quote-ai-result-title": "Análisis IA",
        "quote-ai-privacy": "<i class=\"ph ph-info\"></i> Tu descripción se procesa con Google Gemini para generar el estimado; no incluyas datos confidenciales.",
        "form-privacy": "Tus datos se procesan mediante Formspree únicamente para responderte. No se venden ni se usan para marketing.",
        "quote-summary-title": "Estimación",
        "quote-summary-badge": "Estimación no vinculante",
        "quote-summary-empty": "Selecciona un tipo de proyecto para ver tu estimacion",
        "quote-line-type": "Tipo de proyecto",
        "quote-line-features": "Funcionalidades",
        "quote-line-complexity": "Multiplicador de tamaño",
        "quote-total-label": "Rango estimado",
        "quote-timeline-label": "Tiempo estimado:",
        "quote-hire-btn": "<i class=\"ph ph-handshake\"></i> Quiero contratar este proyecto",
        "quote-hire-note": "Tus requerimientos seran enviados. Respondere dentro de 24 horas con una propuesta detallada.",
        "quote-modal-title": "Envía tus requerimientos de proyecto",
        "quote-modal-desc": "Revisa los detalles de tu proyecto y proporciona tus datos de contacto. Todos tus requerimientos seleccionados se incluirán automáticamente.",
        "quote-form-submit": "<i class=\"ph ph-paper-plane-tilt\"></i> Enviar requerimientos y solicitar propuesta",
        "quote-modal-success": "Requerimientos enviados! Respondere con una propuesta detallada dentro de 24 horas.",
        "quote-form-name": "Tu nombre",
        "quote-form-email": "Correo electrónico",
        "quote-form-company": "Empresa (opcional)",
        "quote-form-phone": "Teléfono / WhatsApp (opcional)",
        "quote-form-notes": "Notas adicionales o contexto...",
        "nav-bots": "Bots",
        "hero-badge-1": "Certificado Microsoft Power Platform",
        "hero-badge-2": "2 Maestrías (Data Science + BI) · Posgrado Blockchain · Ing. en Sistemas",
        "hero-badge-3": "Automatización con Power Automate + n8n",
        "hero-badge-4": "Operando en todo el mundo · 100% remoto",
        "bots-tag": "Catálogo de bots",
        "bots-title": "Bots que hacen el trabajo que nadie debería hacer a mano",
        "bots-subtitle": "Cada uno reemplaza una rutina manual y propensa a errores por un proceso que corre solo, registra todo y solo te avisa cuando realmente te necesita.",
        "bots-note": "Arquitecturas de referencia — cada bot se construye a la medida de tu operación.",
        "bots-label-pain": "El dolor",
        "bots-label-solution": "El bot",
        "bots-cta": "Automatizar esto",
        "botcat-1": "Finanzas y Contabilidad",
        "botcat-2": "Recursos Humanos",
        "botcat-3": "Ventas y CRM",
        "botcat-4": "Operaciones y Cadena de Suministro",
        "botcat-5": "Atención al Cliente y Soporte",
        "botcat-6": "Compras y Administración",
        "bot-concilia-bot-name": "ConciliaBot",
        "bot-concilia-bot-pain": "Cada cierre de mes tu equipo contable se queda hasta medianoche cruzando estados de cuenta contra el ERP línea por línea, peleando con montos transpuestos y referencias faltantes, mientras la gerencia espera cifras que nadie termina de creer.",
        "bot-concilia-bot-solution": "El bot extrae los movimientos bancarios y los asientos contables de forma programada, los empareja con reglas exactas y aproximadas, marca solo las excepciones reales para revisión humana y publica un resumen limpio de conciliación en Teams.",
        "bot-concilia-bot-outcome": "Convierte la conciliación de cierre de varios días en una tarea de la misma mañana, donde las personas solo tocan el puñado de partidas que realmente requieren criterio.",
        "bot-factura-bot-360-name": "FacturaBot 360",
        "bot-factura-bot-360-pain": "Las facturas de proveedores llegan como PDF dispersos en tres bandejas de correo y un grupo de WhatsApp; alguien las re-digita en el sistema, los totales se equivocan al teclear y siempre aparece al menos una factura tarde, vencida y con recargo sorpresa.",
        "bot-factura-bot-360-solution": "Captura las facturas entrantes desde el correo, extrae proveedor, montos, impuestos y fecha de vencimiento con OCR e IA, valida los totales contra la orden de compra y carga el registro en el sistema contable con su trazabilidad.",
        "bot-factura-bot-360-outcome": "Ninguna factura se pierde en el camino y ningún vencimiento se escapa porque un PDF quedó enterrado en la bandeja de alguien.",
        "bot-gasto-guard-name": "GastoGuard",
        "bot-gasto-guard-pain": "Los reportes de gastos llegan como fotos arrugadas y formularios a medio llenar; finanzas hace de detective persiguiendo recibos faltantes, cobros duplicados y gastos fuera de política, y los reembolsos se arrastran semanas mientras el personal se queja.",
        "bot-gasto-guard-solution": "El colaborador fotografía un recibo, el bot lee comercio, fecha y monto, lo valida contra la política de gastos y posibles duplicados, deriva lo dudoso a aprobación y envía los reclamos limpios directo a pago.",
        "bot-gasto-guard-outcome": "Los reembolsos pasan de semanas a días, y los gastos fuera de política o duplicados se detectan antes de que el dinero salga de la empresa.",
        "bot-onboard-bot-name": "OnboardBot",
        "bot-onboard-bot-pain": "Un nuevo colaborador empieza el lunes sin laptop, sin cuenta de correo y sin acceso a los sistemas que necesita; RR. HH., TI y el jefe asumen que alguien más se encargó, y la persona pasa su primera semana ociosa y poco impresionada.",
        "bot-onboard-bot-solution": "Al confirmarse una contratación, el bot dispara una lista coordinada: solicita cuentas y equipo, agenda las sesiones de inducción, envía el material de bienvenida y da seguimiento a cada tarea hasta completarla con recordatorios al responsable correcto.",
        "bot-onboard-bot-outcome": "Cada nuevo colaborador llega a un puesto listo, de modo que el primer día se trata del trabajo y no de perseguir accesos.",
        "bot-vacacion-flow-name": "VacacionFlow",
        "bot-vacacion-flow-pain": "Las solicitudes de vacaciones viven en cadenas de correo y una hoja compartida que dos personas editan a la vez; nadie sabe el saldo real, las aprobaciones se atascan cuando el jefe viaja y nómina descubre los conflictos después.",
        "bot-vacacion-flow-solution": "El colaborador solicita su tiempo libre desde el celular, el bot valida el saldo real y la cobertura del equipo, deriva la aprobación con un suplente si el jefe está ausente y actualiza el calendario y el registro de nómina automáticamente.",
        "bot-vacacion-flow-outcome": "Los saldos siempre son confiables y las aprobaciones nunca se atascan solo porque alguien está fuera de la oficina.",
        "bot-talento-bot-name": "TalentoBot",
        "bot-talento-bot-pain": "Una sola vacante sepulta a los reclutadores bajo cientos de CV en formatos mezclados; los buenos candidatos quedan sin leer por días, los mejores aceptan otras ofertas y filtrar se siente como leer el mismo párrafo mil veces.",
        "bot-talento-bot-solution": "El bot ingiere los CV entrantes, extrae habilidades y experiencia, clasifica a cada candidato contra los criterios indispensables del puesto, prepara un resumen de finalistas para el reclutador y envía correos de acuse a cada postulante.",
        "bot-talento-bot-outcome": "Los reclutadores invierten su tiempo entrevistando a los candidatos más fuertes en lugar de leer cientos de CV que no encajan.",
        "bot-cobranza-bot-name": "CobranzaBot",
        "bot-cobranza-bot-pain": "La cartera envejece en silencio porque los recordatorios dependen de quien se acuerde; los clientes dicen que nunca recibieron la factura, el seguimiento es inconsistente y el efectivo que debería estar en el banco está atrapado en un saldo olvidado de 60 días.",
        "bot-cobranza-bot-solution": "El bot vigila las fechas de vencimiento, envía recordatorios escalonados antes y después del plazo por correo y WhatsApp, registra cada contacto en el CRM y escala los saldos vencidos al ejecutivo de cuenta con un resumen listo para enviar.",
        "bot-cobranza-bot-outcome": "La cobranza se vuelve consistente y cordial en lugar de esporádica, de modo que el efectivo entra antes sin que nadie tenga que insistir de memoria.",
        "bot-lead-pilot-name": "LeadPilot",
        "bot-lead-pilot-pain": "Los prospectos entran desde el sitio web, los anuncios y las ferias a lugares distintos, y luego se quedan horas o días antes de que alguien responda; cuando un vendedor llama, el prospecto ya habló con un competidor que contestó primero.",
        "bot-lead-pilot-solution": "El bot captura los prospectos de cada canal en un solo lugar, los depura y enriquece, los califica y asigna al vendedor correcto al instante, y dispara una primera respuesta en minutos para que ningún prospecto caliente se enfríe.",
        "bot-lead-pilot-outcome": "Cada prospecto recibe una primera respuesta rápida y consistente, de modo que se pierden menos oportunidades solo porque la empresa respondió demasiado tarde.",
        "bot-cotiza-bot-name": "CotizaBot",
        "bot-cotiza-bot-pain": "Las cotizaciones se arman a mano en archivos Word viejos con precios del trimestre pasado; los vendedores copian la plantilla equivocada, los márgenes se erosionan, las aprobaciones rebotan por correo y el cliente espera dos días por un documento que debería tomar diez minutos.",
        "bot-cotiza-bot-solution": "Desde la oportunidad en el CRM, el bot toma los precios y reglas de descuento vigentes, genera un PDF de cotización con la marca, lo deriva a aprobación solo cuando los umbrales de margen lo exigen y envía el documento final al cliente.",
        "bot-cotiza-bot-outcome": "Las cotizaciones salen en minutos con los precios correctos siempre, y las aprobaciones de descuento dejan de ser un cuello de botella.",
        "bot-stock-sentry-name": "StockSentry",
        "bot-stock-sentry-pain": "La verdad del inventario vive en una hoja que se actualiza cuando alguien tiene tiempo; los productos de alta rotación se agotan sin aviso, los de baja rotación se acumulan amarrando efectivo y compras reordena por intuición cuando el estante ya está vacío.",
        "bot-stock-sentry-solution": "El bot consolida los niveles de stock entre ubicaciones, los compara contra puntos de reorden y velocidad de venta, alerta a compras antes de que un artículo se agote y prepara las requisiciones por las cantidades correctas a los proveedores adecuados.",
        "bot-stock-sentry-outcome": "Tanto los quiebres de stock como el inventario muerto se reducen porque los reórdenes se disparan por datos, no por un estante vacío.",
        "bot-ruta-bot-name": "RutaBot",
        "bot-ruta-bot-pain": "El despacho de entregas es una carrera matutina de llamadas y una lista impresa; los repartidores cruzan la ciudad de ida y vuelta, los clientes llaman preguntando dónde está su pedido y nadie puede decir con certeza qué se entregó y qué no.",
        "bot-ruta-bot-solution": "El bot arma la lista de entregas del día con los pedidos abiertos, notifica a cada cliente con una ventana de llegada, recoge la evidencia de entrega desde el celular del repartidor y actualiza el estado del pedido y el tablero en tiempo real.",
        "bot-ruta-bot-outcome": "El despacho deja de ser una emergencia diaria y los clientes reciben avisos claros de entrega en lugar de llamar para preguntar.",
        "bot-calidad-watch-name": "CalidadWatch",
        "bot-calidad-watch-pain": "Las inspecciones de calidad se registran en portapapeles de papel que se pierden o se mojan; los defectos se detectan horas tarde, el mismo problema se repite entre turnos y las auditorías se vuelven una búsqueda frenética de documentos que quizá ni existen.",
        "bot-calidad-watch-solution": "Los inspectores registran las revisiones desde una tableta, el bot marca al instante las lecturas fuera de especificación, abre una tarea de acción correctiva con el área responsable y mantiene un registro fechado y consultable listo para cualquier auditoría.",
        "bot-calidad-watch-outcome": "Los defectos se detectan y corrigen en el mismo turno, y la evidencia de auditoría siempre está a una búsqueda de distancia en lugar de perdida en papel.",
        "bot-soporte-bot-name": "SoporteBot",
        "bot-soporte-bot-pain": "Las solicitudes de soporte llegan por correo, formulario web y WhatsApp sin número de ticket; los mensajes se responden dos veces o ninguna, las mismas preguntas queman tiempo de los agentes a diario y los clientes se sienten ignorados mientras los casos rebotan entre personas.",
        "bot-soporte-bot-solution": "El bot convierte cada mensaje entrante en un ticket rastreable, redacta una respuesta con IA para las preguntas comunes, deriva los casos complejos al agente correcto con todo el contexto y envía al cliente una confirmación con su número de ticket al instante.",
        "bot-soporte-bot-outcome": "Cada solicitud recibe acuse de inmediato y nada se pierde entre los canales.",
        "bot-encuesta-bot-name": "EncuestaBot",
        "bot-encuesta-bot-pain": "Después de una venta o un caso de soporte, la retroalimentación nunca se recoge o queda atrapada en una herramienta de encuestas que nadie revisa; un cliente molesto se va en silencio y el equipo se entera del problema cuando la cuenta ya está perdida.",
        "bot-encuesta-bot-solution": "El bot envía una encuesta breve de seguimiento después de cada interacción, usa IA para leer los comentarios abiertos y medir el sentimiento, alerta a un responsable en cuanto una respuesta se vuelve negativa y consolida todo en un tablero de satisfacción en vivo.",
        "bot-encuesta-bot-outcome": "Los clientes molestos reciben una llamada mientras aún hay tiempo de salvar la relación, en lugar de irse en silencio.",
        "bot-sla-guard-name": "SLAGuard",
        "bot-sla-guard-pain": "Los compromisos de servicio se llevan en la cabeza de las personas; un ticket incumple su plazo en silencio, el cliente escala con enojo a un director, y solo entonces alguien nota que el caso llevaba tres días sin tocarse.",
        "bot-sla-guard-solution": "El bot vigila cada ticket abierto contra su reloj de SLA, avisa al agente asignado antes de que se agote el tiempo, escala a un supervisor al acercarse el plazo y reporta las tendencias de incumplimiento para que las mismas brechas dejen de repetirse.",
        "bot-sla-guard-outcome": "Los plazos se defienden de forma proactiva, de modo que las escalaciones llegan temprano desde el sistema y no tarde desde un cliente enojado.",
        "bot-compra-bot-name": "CompraBot",
        "bot-compra-bot-pain": "Las solicitudes de compra viven en correos y pedidos verbales; las aprobaciones se atascan una semana en la bandeja de alguien, los pedidos urgentes se colocan sin firma y nadie sabe quién aprobó qué ni en qué punto está una solicitud.",
        "bot-compra-bot-solution": "El personal envía una solicitud de compra estructurada, el bot la deriva por la cadena de aprobación según monto y categoría, escala si un aprobador se queda inactivo y convierte la solicitud aprobada en una orden de compra rastreable de forma automática.",
        "bot-compra-bot-outcome": "Las aprobaciones dejan de morir en las bandejas de correo y cada compra tiene una traza clara y auditable de quién la aprobó y cuándo.",
        "bot-contrato-bot-name": "ContratoBot",
        "bot-contrato-bot-pain": "Los contratos y acuerdos con proveedores están dispersos en unidades compartidas sin control de vencimientos; un contrato clave se autorrenueva a peor tarifa, una póliza vence sin que nadie lo note y legal corre cuando un auditor pide la copia firmada.",
        "bot-contrato-bot-solution": "El bot indexa cada contrato, extrae fechas y términos clave con IA, alerta a los responsables con suficiente anticipación antes de las ventanas de renovación o vencimiento, y mantiene un repositorio consultable y versionado con las aprobaciones correspondientes.",
        "bot-contrato-bot-outcome": "Ningún contrato se autorrenueva por sorpresa ni vence sin aviso, y las copias firmadas siempre están a una búsqueda de distancia.",
        "bot-doc-bot-name": "DocBot",
        "bot-doc-bot-pain": "Los documentos críticos llegan como adjuntos de correo y se sueltan en cualquier carpeta abierta; los archivos se llaman 'final_v3_real', el mismo documento existe en cuatro versiones y encontrar el correcto antes de una reunión es un pánico diario.",
        "bot-doc-bot-solution": "El bot captura los documentos entrantes, los clasifica por tipo con IA, los renombra y archiva bajo una estructura consistente, extrae los campos clave a un registro y elimina duplicados para que exista una sola versión confiable de todo.",
        "bot-doc-bot-outcome": "Siempre existe una sola versión confiable de cada documento, encontrada en segundos en lugar de buscada con prisa antes de cada reunión.",
        "svc-process-automation-title": "Automatización de Procesos",
        "svc-process-automation-desc": "Reemplazo flujos manuales y repetitivos por automatizaciones que se ejecutan solas entre tus herramientas y bandejas de correo. Construidas con Power Automate y n8n, con aprobaciones, manejo de errores y registros claros para que nada se quede sin atender.",
        "svc-process-automation-b1": "Flujos de aprobación y notificación",
        "svc-process-automation-b2": "Disparadores programados y por evento",
        "svc-process-automation-b3": "Manejo de errores con reintentos",
        "svc-process-automation-b4": "Registros de ejecución y alertas",
        "svc-process-automation-result": "Horas de trabajo manual eliminadas cada semana, con menos errores.",
        "svc-process-automation-badge": "Más solicitado",
        "svc-bots-rpa-title": "Bots a Medida y RPA",
        "svc-bots-rpa-desc": "Bots atendidos y desatendidos que ejecutan tareas repetitivas de escritorio y nube, incluso en sistemas heredados sin API. Inician sesión, leen pantallas, mueven datos y corren de forma programada o bajo demanda.",
        "svc-bots-rpa-b1": "RPA de escritorio con selectores robustos",
        "svc-bots-rpa-b2": "Ejecuciones desatendidas en VMs dedicadas",
        "svc-bots-rpa-b3": "Bots de captura y conciliación de datos",
        "svc-bots-rpa-b4": "Registro y monitoreo de ejecuciones",
        "svc-bots-rpa-result": "Tareas repetitivas resueltas de noche, liberando a tu equipo para trabajo de mayor valor.",
        "svc-integrations-apis-title": "Integraciones y APIs",
        "svc-integrations-apis-desc": "Conecto tu ERP, CRM, herramientas SaaS y bases de datos para que los datos fluyan automáticamente en lugar de copiarse a mano. Construyo la capa de integración con n8n, webhooks y conectores a medida, con mapeo y validación en cada paso.",
        "svc-integrations-apis-b1": "Conectores ERP, CRM y SaaS",
        "svc-integrations-apis-b2": "Sincronización por webhooks y eventos",
        "svc-integrations-apis-b3": "Mapeo y validación de campos",
        "svc-integrations-apis-b4": "Transferencias idempotentes y con reintentos",
        "svc-integrations-apis-result": "Tus sistemas se comunican entre sí, eliminando la doble captura y los datos desactualizados.",
        "svc-integrations-apis-badge": "Alta demanda",
        "svc-business-apps-title": "Apps de Negocio (Power Apps)",
        "svc-business-apps-desc": "Apps internas, portales de solicitudes y registros de campo que funcionan sobre tus datos reales en Dataverse o SQL. Interfaces limpias que tu equipo realmente usa, en escritorio y móvil, con roles y captura offline donde haga falta.",
        "svc-business-apps-b1": "Apps canvas y model-driven",
        "svc-business-apps-b2": "Portales de solicitudes y aprobaciones",
        "svc-business-apps-b3": "Captura de datos en campo desde móvil",
        "svc-business-apps-b4": "Acceso por roles sobre datos reales",
        "svc-business-apps-result": "Hojas de cálculo y formularios en papel reemplazados por una sola app confiable.",
        "svc-fullstack-web-title": "Aplicaciones Web Full-Stack",
        "svc-fullstack-web-desc": "Plataformas web a medida con Next.js, React, NestJS y PostgreSQL, desde portales internos hasta SaaS y marketplaces. Arquitectura lista para producción con autenticación, pagos y panel de administración desde el primer día.",
        "svc-fullstack-web-b1": "Front end con Next.js y React",
        "svc-fullstack-web-b2": "API NestJS y PostgreSQL",
        "svc-fullstack-web-b3": "Auth, pagos y panel de administración",
        "svc-fullstack-web-b4": "Despliegue en la nube y CI/CD",
        "svc-fullstack-web-result": "Una plataforma escalable que crece con tu negocio, totalmente tuya.",
        "svc-mobile-apps-title": "Desarrollo de Apps Móviles",
        "svc-mobile-apps-desc": "Apps iOS y Android con sensación nativa desde una sola base de código con React Native y Expo, reduciendo costo y tiempo de salida al mercado. Incluye notificaciones push, soporte offline y publicación en tiendas.",
        "svc-mobile-apps-b1": "Una base de código para iOS y Android",
        "svc-mobile-apps-b2": "Notificaciones push y modo offline",
        "svc-mobile-apps-b3": "Integración con API y backend",
        "svc-mobile-apps-b4": "Publicación en App Store y Play Store",
        "svc-mobile-apps-result": "Llega a clientes en ambas plataformas sin duplicar tu presupuesto.",
        "svc-dashboards-bi-title": "Tableros Interactivos y BI",
        "svc-dashboards-bi-desc": "Tableros en Power BI que convierten datos dispersos en KPIs, tendencias y alertas claras para decisiones diarias. Construidos sobre un modelo estrella correcto, con actualización programada y alertas cuando los números cruzan tus umbrales.",
        "svc-dashboards-bi-b1": "Tableros de KPIs y ejecutivos",
        "svc-dashboards-bi-b2": "Modelo de datos estrella",
        "svc-dashboards-bi-b3": "Actualización programada y alertas",
        "svc-dashboards-bi-b4": "Vistas con drill-down y autoservicio",
        "svc-dashboards-bi-result": "Una única fuente de verdad que la dirección revisa cada mañana.",
        "svc-dashboards-bi-badge": "Más solicitado",
        "svc-etl-pipelines-title": "ETL y Pipelines de Datos",
        "svc-etl-pipelines-desc": "Pipelines confiables que limpian, modelan y mueven datos entre fuentes, almacenes y capas de reporteo. Construidos con Python, Power Query y SQL bajo orquestación estilo Airflow, con controles de calidad y monitoreo.",
        "svc-etl-pipelines-b1": "Ingesta desde múltiples fuentes",
        "svc-etl-pipelines-b2": "Limpieza y modelado de datos",
        "svc-etl-pipelines-b3": "Orquestación programada",
        "svc-etl-pipelines-b4": "Controles de calidad y monitoreo",
        "svc-etl-pipelines-result": "Datos confiables y listos para usar que alimentan cada reporte y modelo.",
        "svc-data-science-title": "Ciencia de Datos y Modelos Predictivos",
        "svc-data-science-desc": "Modelos predictivos para pronóstico, segmentación de clientes, churn, demanda y detección de anomalías, partiendo siempre de tu pregunta de negocio. Cada modelo se entrega con validación, rangos de confianza y explicabilidad para que confíes en los números.",
        "svc-data-science-b1": "Pronóstico de demanda y ventas",
        "svc-data-science-b2": "Churn y segmentación de clientes",
        "svc-data-science-b3": "Detección de anomalías y fraude",
        "svc-data-science-b4": "Modelos validados y explicables",
        "svc-data-science-result": "Decisiones respaldadas por datos en lugar de intuición.",
        "svc-applied-ai-title": "Soluciones de IA Aplicada",
        "svc-applied-ai-desc": "Agentes de IA, asistentes RAG, chatbots e inteligencia documental construidos sobre Claude AI y Gemini, anclados en tu propio contenido. Con evaluaciones definidas, guardrails y control de costos para que la IA sea precisa, segura y rentable.",
        "svc-applied-ai-b1": "Asistentes RAG sobre tus documentos",
        "svc-applied-ai-b2": "Chatbots y agentes de IA a medida",
        "svc-applied-ai-b3": "Extracción de datos de documentos",
        "svc-applied-ai-b4": "Evaluaciones, guardrails y control de costos",
        "svc-applied-ai-result": "IA que responde con tus datos, no con suposiciones genéricas.",
        "svc-applied-ai-badge": "Nuevo",
        "nav-metodo": "Método",
        "nav-estimate": "Estimar",
        "hero-doc-left": "DOC. HH/2026 — INGENIERÍA DE OPERACIONES",
        "hero-doc-right": "ESTADO · OPERATIVO",
        "ch-01": "01 — DIAGNÓSTICO",
        "ch-02": "02 — EVIDENCIA",
        "ch-03": "03 — SERVICIOS Y PRECIOS",
        "ch-04": "04 — ANATOMÍA DE UNA AUTOMATIZACIÓN",
        "ch-05": "05 — MÉTODO",
        "ch-06": "06 — LA DECISIÓN DE PLATAFORMA",
        "ch-07": "07 — EL ARQUITECTO",
        "ch-08": "08 — ESTIMA TU PROYECTO",
        "ch-09": "09 — HABLEMOS",
        "ch-annex": "ANEXO — ASESORÍA BITCOIN",
        "problems-bridge": "Los seis tienen solución conocida. Aquí está la evidencia.",
        "label-inprod": "EN PRODUCCIÓN",
        "case-cta": "¿Tienes un proceso como este? → Estímalo",
        "slab-1-before": "HORAS",
        "slab-1-after": "SEGUNDOS",
        "slab-2-before": "3 PORTALES",
        "slab-2-after": "1 DASHBOARD",
        "slab-3-before": "PROCESO MANUAL",
        "slab-3-after": "CERO INTERVENCIÓN",
        "arch-role-results": "Resultados filtrados por rol",
        "arch-three-sources": "3 fuentes de datos",
        "arch-star-model": "Modelo dimensional",
        "projects-bridge": "Tu proceso puede ser el Caso 07.",
        "svc-process-automation-floor": "Desde $1,500 · 1–8 semanas",
        "svc-integrations-apis-floor": "Desde $1,500 · 1–8 semanas",
        "svc-dashboards-bi-floor": "Desde $1,800 · 2–8 semanas",
        "svc-applied-ai-floor": "Desde $3,000 · 2–12 semanas",
        "services-cta": "¿No sabes cuál necesitas? → Estima tu proyecto",
        "autoflow-titleblock": "DWG A-01 · AUTOMATIZACIÓN DE PROCESOS · ESCALA: SEMANAS, NO MESES",
        "platform-quote": "Trabajo exclusivamente dentro del ecosistema Microsoft. No es una limitación: <em>es una decisión estratégica.</em>",
        "certs-academic": "Credenciales académicas",
        "about-shipped-label": "Productos lanzados",
        "tier-1": "Diagnóstico técnico $2,000–3,500 — se acredita al primer proyecto",
        "tier-2": "Implementación $4,000–15,000 — pagos por hito 40/30/30",
        "tier-3": "Retainer desde $2,000/mes",
        "cta-diagnostic": "Agenda una llamada de diagnóstico de 30 minutos — sin costo. Revisamos tu proceso más crítico y te digo con honestidad si puedo ayudarte y cómo.",
        "form-label-name": "Nombre",
        "form-label-email": "Correo electrónico",
        "form-label-company": "Empresa (opcional)",
        "form-label-service": "¿Qué necesitas?",
        "form-label-message": "Breve descripción de tu proyecto o problema",
        "form-fallback": "No se pudo enviar el formulario en este momento.",
        "pill-estimate": "Estimar",
        "footer-privacy": "Privacidad",
        "footer-terms": "Términos",
        "tb-doc": "DWG HH-2026 — INGENIERÍA DE OPERACIONES",
        "tb-prepared": "PREPARADO POR: H. HENRÍQUEZ · ING.",
        "tb-signed": "FIRMA:",
        "tb-meta": "SAN SALVADOR · GMT-6 · HOJA 00 — PORTADA · REV 2026.07",
        "exhibit-tag": "PRUEBA A — PRODUCTO PUBLICADO · PÚBLICO",
        "exhibit-title": "Bitcoin Academy",
        "exhibit-tagline": "Una PWA de educación financiera en 7 idiomas — en vivo en la web y en Google Play.",
        "exhibit-provenance": "EN VIVO ↗ <a href=\"https://bitcoinacademy.tech\" target=\"_blank\" rel=\"noopener\">bitcoinacademy.tech</a> · 7 IDIOMAS · PWA + GOOGLE PLAY",
        "exhibit-badge": "<img src=\"img/google-play-badge-es.png\" alt=\"Disponible en Google Play\" width=\"180\" height=\"70\" loading=\"lazy\" decoding=\"async\">",
        "exhibit-verify": "VERIFÍCALO TÚ MISMO — INSTÁLALO AHORA MISMO.",
        "bots-fig-cap": "FIG. ASSY-01 — ENSAMBLE DE REFERENCIA: CADA BOT SE ARMA A LA MEDIDA",
        "method-fig-cap": "FIG. HND-06 — ENTREGA: EL SISTEMA, DOCUMENTADO, ENTREGADO, FUNCIONANDO SIN MÍ.",
        "about-plate": "LÁMINA 07 — EL ARQUITECTO",
        "about-see-exhibit": "Ver Prueba A →",
        "contact-portrait-cap": "HABLAS CON EL INGENIERO — NO HAY EQUIPO DE VENTAS",
        "contact-reply": "RESPUESTA &lt; 24H",
        "cartouche-drawn": "DIBUJÓ: H.H. · REV 2026.07 · HOJA 04/09",
        "cartouche-approved": "APROBADO",
        "colophon-motto": "DIBUJADO A MANO · OPERADO POR MÁQUINAS",
    },
    en: {
        "nav-problemas": "Problems",
        "nav-servicios": "Services",
        "nav-proyectos": "Evidence",
        "nav-stack": "Stack",
        "nav-sobre-mi": "Studio",
        "nav-cta": "Contact",
        "hero-badge-education": "<i class=\"ph ph-graduation-cap\"></i> MSc Data Science + MSc BI",
        "hero-badge-blockchain": "<i class=\"ph ph-bitcoin-logo\"></i> Blockchain & Crypto Specialist",
        "hero-badge-countries": "<i class=\"ph ph-globe-hemisphere-west\"></i> 4 countries",
        "hero-title": "<span class=\"line-mask\"><span class=\"line\">I turn broken business processes</span></span><span class=\"line-mask\"><span class=\"line\">into digital systems</span></span><span class=\"line-mask\"><span class=\"line\">that <em>actually work</em>.</span></span>",
        "hero-subtitle": "Power Platform, automation and applied AI for companies in LATAM and the US. I design, build and run the complete system — not just the dashboard.",
        "hero-cta-primary": "Book a 30-min diagnostic",
        "hero-cta-secondary": "Estimate your project in 60 seconds →",
        "hero-stack-label": "Core stack:",
        "proof-certs": "Microsoft Certifications",
        "proof-solutions": "Systems in production",
        "proof-countries": "Countries served",
        "proof-years": "Years of experience",
        "problems-tag": "The diagnosis",
        "problems-title": "This is what I hear from companies like yours",
        "problems-subtitle": "Six patterns. I've seen — and fixed — every one of them.",
        "problem-1-title": "“Our critical process lives in an Excel file nobody dares to touch.”",
        "problem-1-desc": "→ Fixed with a governed app + automated flow — see Process Automation.",
        "problem-2-title": "“Approvals take days because they depend on someone reading an email.”",
        "problem-2-desc": "→ Fixed with approval flows with reminders and full traceability.",
        "problem-3-title": "“Every Monday someone spends hours building the same report by hand.”",
        "problem-3-desc": "→ Fixed with an automated Power BI pipeline — the report builds itself.",
        "problem-4-title": "“I can't see what's happening in the operation until it's too late.”",
        "problem-4-desc": "→ Fixed with live dashboards fed by the systems you already use.",
        "problem-5-title": "“Our systems don't talk to each other, so people retype everything.”",
        "problem-5-desc": "→ Fixed with integrations and APIs — data entered once, everywhere.",
        "problem-6-title": "“Only one person knows how the process works. If they leave, we're blind.”",
        "problem-6-desc": "→ Fixed with documented, automated systems that don't depend on anyone.",
        "services-tag": "What we do",
        "services-title": "What I build, and what it costs to start",
        "services-subtitle": "Automation and bots, data and BI, ETL pipelines, web and mobile apps, and applied AI — delivered end to end on Microsoft Power Platform, n8n and a modern web stack.",
        "service-badge-popular": "Most requested",
        "service-1-title": "Operational Process Automation",
        "service-1-desc": "I replace repetitive manual workflows with automations that run on their own: approvals, notifications, document generation, data synchronization between systems.",
        "service-1-item-1": "Candidate process diagnosis",
        "service-1-item-2": "Power Automate flows (Cloud + Desktop)",
        "service-1-item-3": "Error handling and logging",
        "service-1-item-4": "Documentation and training",
        "service-1-result": "Your team stops doing mechanical work and focuses on decisions.",
        "service-2-title": "Custom Business Applications",
        "service-2-desc": "I design and build enterprise applications with Power Apps connected to your real data. Request portals, field registries, document management, inventories.",
        "service-2-item-1": "Requirements gathering",
        "service-2-item-2": "Power Apps development (Canvas/Model-Driven)",
        "service-2-item-3": "Associated automation flows",
        "service-2-item-4": "Role-based security and responsive design",
        "service-2-result": "Functional apps in weeks, not months.",
        "service-3-title": "Dashboards & Operational Intelligence",
        "service-3-desc": "I connect your data sources (SQL, APIs, SharePoint, Excel, service desks) into Power BI dashboards that show what matters: KPIs, trends, alerts and detail on demand.",
        "service-3-item-1": "Connection to multiple data sources",
        "service-3-item-2": "Advanced DAX + Power Query modeling",
        "service-3-item-3": "Automatic refresh and role-based security",
        "service-3-item-4": "Publishing to Power BI Service",
        "service-3-result": "Real data, up to date, without manual manipulation.",
        "service-4-title": "Document Management with Control",
        "service-4-desc": "I implement document control systems on SharePoint with standardized coding, versioning, role-based permissions and AI-powered intelligent search.",
        "service-4-item-1": "Automatic document coding",
        "service-4-item-2": "Search with AI Builder + KQL",
        "service-4-item-3": "Security filters by area and role",
        "service-4-item-4": "Audit traceability",
        "service-4-result": "Your documentation stops being chaos and becomes a managed asset.",
        "service-5-title": "Request & Approval Portals",
        "service-5-desc": "Digital portals with smart forms, multi-level approval flows, automatic notifications, time-based escalation and full traceability.",
        "service-5-item-1": "Power Apps form with validations",
        "service-5-item-2": "Parallel/sequential approvals",
        "service-5-item-3": "Email + Teams notifications",
        "service-5-item-4": "Tracking dashboard",
        "service-5-result": "From days of manual approval to automatic hours.",
        "service-6-title": "Digitization Consulting & Roadmap",
        "service-6-desc": "I analyze your current processes, identify bottlenecks and automation opportunities, and deliver a prioritized roadmap with concrete solutions.",
        "service-6-item-1": "Process mapping (AS-IS / TO-BE)",
        "service-6-item-2": "Digital maturity assessment",
        "service-6-item-3": "3-6-12 month roadmap with ROI",
        "service-6-item-4": "Executive document for leadership",
        "service-6-result": "No smoke, no empty promises: an executable plan.",
        "service-badge-new": "New",
        "service-7-title": "Full-Stack Web Applications",
        "service-7-desc": "I design and build modern web platforms with Next.js, React, NestJS and PostgreSQL. From marketplaces and SaaS products to client portals and internal tools — responsive, scalable, production-ready.",
        "service-7-item-1": "Next.js + React + Tailwind frontend",
        "service-7-item-2": "NestJS API + Prisma + PostgreSQL backend",
        "service-7-item-3": "Authentication, payments, real-time features",
        "service-7-item-4": "Docker deployment + CI/CD pipeline",
        "service-7-result": "Custom web platforms built in weeks, deployed and ready to scale.",
        "service-badge-hot": "High demand",
        "service-9-title": "Mobile App Development",
        "service-9-desc": "I build cross-platform mobile apps with React Native and Expo that work on iOS and Android from a single codebase. From e-commerce and delivery apps to booking systems and internal tools — native performance, modern UX, deployed to both app stores.",
        "service-9-item-1": "React Native / Expo (iOS + Android)",
        "service-9-item-2": "Push notifications + offline support",
        "service-9-item-3": "GPS, camera, biometrics, payments",
        "service-9-item-4": "App Store + Play Store publishing",
        "service-9-result": "Your business in your customers' pockets — one codebase, two platforms.",
        "service-8-title": "AI-Powered Solutions",
        "service-8-desc": "I integrate artificial intelligence into your business processes and applications. From intelligent assistants and document analysis to automated workflows powered by Claude AI and custom AI agents.",
        "service-8-item-1": "Claude AI / LLM integration into apps",
        "service-8-item-2": "Intelligent chatbots and virtual assistants",
        "service-8-item-3": "Document analysis and data extraction",
        "service-8-item-4": "AI agents for workflow automation",
        "service-8-result": "Your team works with AI, not against it. Real productivity gains from day one.",
        "service-badge-btc": "Bitcoin",
        "service-10-title": "Bitcoin & Crypto Advisory",
        "service-10-desc": "As an active Bitcoin market operator and creator of Bitcoin Academy Tech, I provide data-driven financial guidance on Bitcoin and digital assets. From understanding market cycles and building investment strategies to technical analysis and risk management — backed by real trading experience and academic credentials in Blockchain Technology.",
        "service-10-item-1": "Bitcoin market analysis & technical analysis",
        "service-10-item-2": "Investment strategy & portfolio allocation",
        "service-10-item-3": "Risk management & position sizing",
        "service-10-item-4": "Education sessions (1-on-1 or group)",
        "service-10-result": "Make informed decisions in crypto markets — no hype, just data and strategy.",
        "service-10-link": "<i class=\"ph ph-arrow-square-out\"></i> Visit Bitcoin Academy Tech",
        "process-tag": "How we work",
        "process-title": "Weeks, not a two-year project",
        "process-subtitle": "A clear 5-step process to take your operation from manual to digital",
        "step-1-title": "Diagnosis",
        "step-1-duration": "1-2 days",
        "step-1-desc": "I understand your current operation: which processes hurt, where time is lost, what information is missing. I don't assume. I ask, observe and document before proposing anything.",
        "step-2-title": "Solution design",
        "step-2-duration": "2-3 days",
        "step-2-desc": "I define the technical architecture, data flows, user experience and success criteria. A clear plan with scope, deliverables, timelines and dependencies.",
        "step-3-title": "Iterative development",
        "step-3-duration": "2-8 weeks",
        "step-3-desc": "I build in short cycles with functional deliveries every 1-2 weeks. You see real progress from the start, can test early and adjust without waiting until the end.",
        "step-4-title": "Testing & adjustment",
        "step-4-duration": "3-5 days",
        "step-4-desc": "I validate with real users, fix usability and performance issues. The solution is not delivered until it works in the real context of your team.",
        "step-5-title": "Delivery & handoff",
        "step-5-duration": "1-2 days",
        "step-5-desc": "I deliver to production with technical documentation, user guide and training session. Your team is equipped to operate and maintain what was built.",
        "step-1-short": "I map what hurts before proposing anything.",
        "step-2-short": "Architecture, data flows and success criteria.",
        "step-3-short": "Working deliveries every 1-2 weeks.",
        "step-4-short": "Validated with real users, in real context.",
        "step-5-short": "Production, docs and training. Yours to run.",
        "flow-process-caption": "Systems that keep working without me after handover.",
        "autoflow-tag": "Automation, in motion",
        "autoflow-title": "Anatomy of an automation",
        "autoflow-subtitle": "Scroll to drive a request through the system: trigger → process → validate → integrate → notify → dashboard.",
        "autoflow-1-title": "Trigger",
        "autoflow-1-desc": "An event fires it",
        "autoflow-2-title": "Process",
        "autoflow-2-desc": "It does the work",
        "autoflow-3-title": "Validate",
        "autoflow-3-desc": "Rules &amp; error handling",
        "autoflow-4-title": "Integrate",
        "autoflow-4-desc": "Systems talk to each other",
        "autoflow-5-title": "Notify",
        "autoflow-5-desc": "The right people know",
        "autoflow-6-title": "Dashboard",
        "autoflow-6-desc": "You see it all, live",
        "autoflow-caption": "Runs on schedule or on demand &mdash; and escalates to a human only when it truly needs one.",
        "svc-bitcoin-badge": "Advisory",
        "svc-bitcoin-title": "Bitcoin Advisory &amp; Education",
        "svc-bitcoin-desc": "Practical, data-driven Bitcoin guidance for businesses and teams &mdash; from accepting Bitcoin and Lightning payments to training your people and reading the market with real data instead of hype. As a market operator and creator of Bitcoin Academy Tech, I bring the technical and the strategic together. Education and strategy, not regulated financial advice.",
        "svc-bitcoin-b1": "Bitcoin adoption for businesses (accept BTC / Lightning)",
        "svc-bitcoin-b2": "Workshops and team training",
        "svc-bitcoin-b3": "Data-driven market analysis and strategy",
        "svc-bitcoin-b4": "Payment-rails and treasury orientation",
        "svc-bitcoin-result": "Your team understands Bitcoin and can act on it with clarity, not fear.",
        "arch-tag": "Connected ecosystem",
        "arch-title": "Your Microsoft ecosystem, connected",
        "arch-subtitle": "Your data flows from SharePoint, Dataverse and SQL through Power Automate into the apps and dashboards your team uses every day &mdash; one platform, no islands.",
        "arch-team": "Your team",
        "arch-caption": "Data &rarr; Automation &rarr; Experience. One platform, no islands.",
        "btc-tag": "Bitcoin, done right",
        "btc-title": "From \"I want to accept Bitcoin\" to doing it right",
        "btc-subtitle": "I help businesses and teams adopt Bitcoin with a clear head: education, payment rails (on-chain and Lightning) and data-driven market reading. Education and strategy, not regulated financial advice.",
        "btc-1-title": "Diagnosis",
        "btc-1-desc": "Where Bitcoin fits",
        "btc-2-title": "Education",
        "btc-2-desc": "Your team gets it",
        "btc-3-title": "Setup",
        "btc-3-desc": "Wallet + BTCPay",
        "btc-4-title": "Accept payments",
        "btc-4-desc": "On-chain + Lightning",
        "btc-5-title": "Treasury",
        "btc-5-desc": "Records &amp; control",
        "btc-6-title": "Reporting",
        "btc-6-desc": "Visible &amp; auditable",
        "btc-caption": "Practical adoption, no hype &mdash; at your pace, with your numbers clear.",
        "btc-proof": "Visit Bitcoin Academy &mdash; a real education platform",
        "trust-title": "How I work with you",
        "trust-1": "Fixed scope &amp; price",
        "trust-2": "Milestone-based payments",
        "trust-3": "You own the code &amp; accounts",
        "trust-4": "Docs &amp; training included",
        "trust-5": "Reply within 24h",
        "about-availability-label": "Availability",
        "about-availability-value": "Full overlap with US business hours (CST)",
        "impact-label": "Typical impact",
        "proj1-impact": "Doc search: minutes &rarr; seconds &middot; fewer escalations",
        "proj2-impact": "3 sources &rarr; 1 view &middot; ~1 day/month of manual reporting saved",
        "proj6-impact": "~500 records/run, unattended &middot; hours/week recovered",
        "cta-whatsapp": "Chat on WhatsApp",
        "projects-tag": "Selected work",
        "projects-title": "Systems already running in production",
        "projects-subtitle": "Real cases. Qualitative, verifiable results — no invented percentages.",
        "proj1-tag-ai": "Applied AI",
        "proj1-industry": "Managed IT Services — LATAM Regional",
        "proj1-title": "AI-Powered Technical Assistant",
        "proj1-tagline": "From searching manuals for hours to finding answers in seconds",
        "label-problem": "Situation",
        "label-solution": "Solution",
        "label-results": "Result",
        "proj1-problem": "Field technicians wasted significant time searching for technical documentation. They navigated SharePoint folders without an intelligent search system, sent messages to colleagues asking for files, or resolved issues without consulting official documentation.",
        "proj1-solution": "A Power Apps app where the technician types their query in natural language. AI Builder extracts keywords, builds a KQL query against SharePoint Search API, filters results by the technician's area/role, and returns relevant documents in seconds.",
        "proj1-result-1": "Documentation search went from minutes to seconds",
        "proj1-result-2": "Eliminated dependency on \"asking the expert\"",
        "proj1-result-3": "Escalations due to lack of information visibly reduced",
        "proj1-result-4": "Role-based security: each technician sees only what they should",
        "proj1-arch-title": "System schematic",
        "arch-technician": "Technician",
        "proj2-industry": "Regional Service Desk",
        "proj2-title": "Multi-Source Executive Dashboard",
        "proj2-tagline": "Unifying data from 3 service desks into a single dashboard",
        "proj2-problem": "Three different data sources (a monitoring tool, a ticketing system and a SQL Server database) with no unified view. To see the complete picture, you had to log into three different portals. Management was making decisions with partial information.",
        "proj2-solution": "Executive dashboard in Power BI connecting all three sources. M queries with dynamic pagination (List.Generate) for APIs, on-premises gateway for SQL Server, unified dimensional model and automatic refresh.",
        "proj2-result-1": "Consolidated view of the entire support operation",
        "proj2-result-2": "Eliminated manual executive report preparation",
        "proj2-result-3": "Identified workload patterns by country and technician",
        "proj2-result-4": "Real-time visibility for decision making",
        "proj2-arch-title": "Data flow",
        "proj3-industry": "Corporate Document Governance",
        "proj3-title": "Document Management System",
        "proj3-tagline": "From shared folders to information governance",
        "proj3-problem": "Documentation in folders without formal classification, duplicate versions, no role-based permissions, no traceability. Internal audits required manual effort to demonstrate control.",
        "proj3-solution": "Master List with structured coding [AREA-CLASS-SCOPE-SERIAL-VERSION], automatic code generation via Power Automate, Power App as frontend, security filters by area and role.",
        "proj3-result-1": "Master catalog with unique code and current version",
        "proj3-result-2": "Controlled permissions: each user sees only what they should",
        "proj3-result-3": "Automatic generation eliminated classification errors",
        "proj3-result-4": "Audit-ready with full traceability",
        "proj3-arch-title": "Coding structure",
        "code-area": "Area",
        "code-class": "Class",
        "code-scope": "Scope",
        "code-serial": "Serial",
        "code-version": "Version",
        "proj4-title": "Travel Request Portal",
        "proj4-tagline": "Travel requests with multi-level digital approval",
        "proj4-desc": "Digital portal that replaced email-based approvals with a standardized form, automatic multi-level flow, real-time notifications and status tracking. Standardized for all countries of operation.",
        "proj4-result-1": "Eliminated email dependency",
        "proj4-result-2": "Real-time status visible to the requester",
        "proj4-result-3": "Full traceability of every approval",
        "proj5-title": "Purchase Order Request",
        "proj5-tagline": "Traceable purchase orders from request to closure",
        "proj5-desc": "Digital system with structured form, approvals by amount and area, state management (8 states), attachments linked by order, and consolidated purchasing reports.",
        "proj5-result-1": "Single standardized format for all areas",
        "proj5-result-2": "Attachments travel with the request, not separately",
        "proj5-result-3": "Compliance and auditable spend control",
        "proj6-industry": "Internal Operations — LATAM",
        "proj6-title": "RPA Automation for Legacy Systems",
        "proj6-tagline": "Bots that process what nobody wants to process",
        "proj6-problem": "Repetitive manual processes with Excel files: massive case-management imports across multiple LATAM countries, inconsistent date formats, files locked by OneDrive sync.",
        "proj6-solution": "Bot suite in Power Automate Desktop with OneDrive sync handling, automatic format validation by country, batch processing of 500 records, orchestration from cloud flows.",
        "proj6-result-1": "Weekly hours of manual work eliminated",
        "proj6-result-2": "Format and data errors completely eliminated",
        "proj6-result-3": "Processes independent of specific individuals",
        "proj6-result-4": "Staff redirected to higher-value activities",
        "proj6-arch-title": "Automation flow",
        "proj7-industry": "Managed IT Services — LATAM Regional",
        "proj7-title": "Document Control — Master List Automation",
        "proj7-tagline": "One governed master list instead of a hand-maintained spreadsheet",
        "proj7-problem": "Controlled documents were tracked in a master list maintained by hand. Versions drifted, review dates slipped by unnoticed, and preparing for an audit meant days of chasing files and cross-checking spreadsheets.",
        "proj7-solution": "An automated document-control system on SharePoint: a governed master list with version control, approval flows for new and updated documents, automatic review-date reminders and a live status view of the entire library.",
        "proj7-result-1": "The master list maintains itself — audits are prepared from a live, trustworthy register instead of a rescue mission.",
        "proj7-result-2": "5 interactive health calculators (BMI, cardiovascular, biological age, hydration, calories)",
        "proj7-result-3": "Admin panel with auth, dashboard, clinic CRUD, and consultation logs",
        "proj7-result-4": "PWA-ready, SEO-optimized, AdSense-integrated monetization model",
        "proj7-arch-title": "Platform architecture",
        "arch-patient": "Patient",
        "arch-clinics": "Clinics",
        "proj8-industry": "Corporate Operations — Multi-country",
        "proj8-title": "Travel Request Portal",
        "proj8-tagline": "Travel requests with multi-level digital approval",
        "proj8-problem": "Travel requests and approvals ran over email. No standard form, no visibility of where a request was stuck, and every country handled the process slightly differently.",
        "proj8-solution": "A digital portal that replaced email-based approvals with a standardized form, automatic multi-level approval flow, real-time notifications and status tracking — standardized across all countries of operation.",
        "proj8-result-1": "Every request is traceable from submission to approval, and nobody chases signatures by email anymore.",
        "proj8-result-2": "10-state order lifecycle: from request to completion with quote approval",
        "proj8-result-3": "Dual payment: traditional cards (Wompi) + Bitcoin (BTCPay)",
        "proj8-result-4": "Monorepo architecture: shared types, schemas and config across frontend + backend",
        "proj8-arch-title": "Monorepo architecture",
        "proj9-title": "AI Video Factory",
        "proj9-tagline": "Automated AI-powered video generation at scale",
        "proj9-desc": "Multi-channel video generation system using Google Veo, Runway Gen-4, ElevenLabs TTS, and n8n orchestration. Batch processing 4 videos/day per channel with automated publishing to TikTok, YouTube Shorts, and Instagram Reels.",
        "proj10-title": "Crypto Trading Dashboard",
        "proj10-tagline": "Real-time market analysis and trading signals",
        "proj10-desc": "Cryptocurrency trading dashboard with Next.js 14, professional candlestick charts (lightweight-charts), real-time market data, technical analysis indicators, and PineScript integration for TradingView strategies.",
        "proj11-title": "Invoice Processing Engine",
        "proj11-tagline": "Automated tax compliance and accounting",
        "proj11-desc": "Batch invoice processing system with automated Colombian tax calculations (withholding, VAT, ICA), double-entry accounting generation, rule engine for tax compliance, and complete audit trail.",
        "proj12-industry": "Procurement — LATAM",
        "proj12-title": "Purchase Order Automation",
        "proj12-tagline": "From request to approved purchase order without retyping",
        "proj12-problem": "Purchase orders were assembled by hand from emails and spreadsheets: re-typed data, missing approvals, and no clear record of who authorized what or when.",
        "proj12-solution": "An automated purchase-order workflow: standardized request capture, approval routing by amount and category, automatic document generation and a complete audit trail on every order.",
        "proj12-result-1": "Orders move on their own from request to approval, with a full record that stands up to any audit.",
        "proj12-result-2": "Push notifications keep customers engaged with order updates",
        "proj12-result-3": "Real-time GPS tracking reduced \"where is my order?\" calls",
        "proj12-result-4": "Offline browsing: catalog available even without internet",
        "proj12-arch-title": "Mobile architecture",
        "arch-customer": "Customer",
        "form-opt-default": "Select an option…",
        "form-opt-automation": "Process Automation (Power Platform)",
        "form-opt-webapp": "Web Application (Next.js / React)",
        "form-opt-mobile": "Mobile App (iOS + Android)",
        "form-opt-dashboard": "Dashboard / BI (Power BI)",
        "form-opt-ai": "AI Integration / Chatbot",
        "form-opt-bitcoin": "Bitcoin & Crypto Advisory",
        "form-opt-consulting": "Consulting / Digital Roadmap",
        "form-opt-other": "Other",
        "form-submit": "<i class=\"ph ph-paper-plane-tilt\"></i> Request free proposal",
        "form-success": "Sent! I'll respond within 24 hours.",
        "cta-or": "or contact me directly",
        "stack-tag": "Stack and certifications",
        "stack-title": "The platform decision",
        "stack-subtitle": "Microsoft Power Platform certified, backed by two Master's degrees in Data Science and Business Intelligence and a production-grade web and AI stack.",
        "stack-cat-fullstack": "Full-Stack Development",
        "stack-cat-ai": "AI & Intelligent Systems",
        "stack-cat-apps": "Business Applications",
        "stack-cat-data": "Data & Intelligence",
        "stack-cat-integrations": "Integrations & APIs",
        "stack-cat-devops": "DevOps & Infrastructure",
        "certs-title": "Core Microsoft Certifications",
        "certs-subtitle": "Each certification represents validated knowledge and hands-on experience in real projects.",
        "about-tag": "About me",
        "about-p1": "I started my career in infrastructure and technical support. That's where I learned something many technologists never understand: <strong>technology is worthless if it doesn't solve a real business problem.</strong>",
        "about-p2": "Over time, I moved toward automation and data management. I saw firsthand how entire companies operated with spreadsheets shared by email, WhatsApp approvals, reports built manually every Monday, and critical processes that depended on \"someone remembering\" to do something.",
        "about-p3": "That's where I found my professional mission: <strong>eliminating that operational fragility.</strong>",
        "about-p4": "Microsoft Power Platform became my foundation, but I've expanded into modern full-stack development — building web applications with Next.js, React, NestJS, and integrating AI with Claude API. I combine the speed of low-code with the power of custom development to deliver exactly what each project needs.",
        "about-p5": "Today, with Microsoft Power Platform certifications (Power Apps, Power Automate, Power BI), two Master's degrees (Data Science and Business Intelligence), a Postgraduate in Blockchain Technology, and experience with clients across Central America and the Caribbean, I help companies at every level: <strong>from automating a broken approval process to building complete web platforms with AI integration.</strong>",
        "about-p6": "I'm also an active Bitcoin market operator and the creator of <a href=\"https://bitcoinacademy.tech\" target=\"_blank\" rel=\"noopener\">Bitcoin Academy Tech</a> — a free educational platform about Bitcoin, blockchain and digital assets. I combine my technical and financial expertise to help individuals and businesses navigate the crypto market with real data and informed strategies.",
        "about-btc-label": "Bitcoin & Crypto",
        "about-btc-value": "Market operator &amp; creator of <a href=\"https://bitcoinacademy.tech\" target=\"_blank\" rel=\"noopener\">Bitcoin Academy Tech</a>",
        "about-base-label": "Base",
        "about-education-label": "Education",
        "about-education-value": "MSc Data Science (UNEATLÁNTICO, 2026) + MSc Business Intelligence (UNINI, 2023) + PgD Blockchain + Computer Systems Eng. (UTEC)",
        "about-certs-label": "Certifications",
        "about-certs-value": "Power Apps · Power Automate · Power BI",
        "about-coverage-label": "Coverage",
        "about-coverage-value": "LATAM &amp; remote worldwide",
        "about-company-label": "Mode",
        "about-company-value": "Principal Consultant & Technical Advisor",
        "about-languages-label": "Languages",
        "about-languages-value": "Native Spanish, Professional English",
        "diff-tag": "Why us",
        "diff-title": "What I'm not — and what I am",
        "diff-1-title": "A dashboard vendor",
        "diff-1-desc": "The architect of the complete system that feeds the dashboard: interface + database + automation + approvals + reporting. All connected.",
        "diff-2-title": "A generalist who tries everything",
        "diff-2-desc": "A certified specialist on the Microsoft platform your company already pays for.",
        "diff-3-title": "Deliver-and-disappear",
        "diff-3-desc": "I document, train your team and support the system after handover. It keeps working without me.",
        "diff-4-title": "A demo builder",
        "diff-4-desc": "Production engineering: error handling (Try-Catch), logging, backend-validated role security and ALM in every delivery.",
        "cta-title": "If you've read this far, you already recognized your problem.",
        "cta-subtitle": "<em>The good news: it has a solution — and the return is measured in weeks, not years.</em>",
        "cta-button": "<i class=\"ph ph-calendar-check\"></i> Book a diagnostic call",
        "cta-note": "No commitment. No sales pitch. Just a conversation to understand your situation and see if I can help.",
        "cta-whatsapp-label": "Quick response",
        "cta-upwork-label": "Hire me on Upwork",
        "footer-title": "Power Platform Solutions Architect — Automation, Data &amp; AI",
        "footer-services": "Services",
        "footer-projects": "Projects",
        "footer-about": "About",
        "footer-contact": "Contact",
        "footer-copy": "&copy; 2026 Humberto Henríquez. All rights reserved.",
        "nav-cotizador": "Pricing",
        "quote-tag": "Estimate",
        "quote-title": "Get a real number in 60 seconds",
        "quote-subtitle": "The same AI I integrate into client systems — estimating your project.",
        "quote-mode-builder": "<i class=\"ph ph-list-checks\"></i> Build your project",
        "quote-mode-ai": "<i class=\"ph ph-brain\"></i> Describe with AI",
        "quote-step1-title": "What do you need?",
        "quote-type-website": "Website",
        "quote-type-website-desc": "Landing page, corporate site, blog",
        "quote-type-website-price": "From $5,000",
        "quote-type-webapp": "Web Application",
        "quote-type-webapp-desc": "SaaS, portal, dashboard, marketplace",
        "quote-type-webapp-price": "From $15,000",
        "quote-type-mobile": "Mobile App",
        "quote-type-mobile-desc": "iOS & Android (React Native / PWA)",
        "quote-type-mobile-price": "From $18,000",
        "quote-type-fullstack": "Web + Mobile",
        "quote-type-fullstack-desc": "Complete platform with web and mobile",
        "quote-type-fullstack-price": "From $28,000",
        "quote-type-automation": "Automation",
        "quote-type-automation-desc": "Power Platform, workflows, RPA",
        "quote-type-automation-price": "From $8,000",
        "quote-type-bi": "Dashboard / BI",
        "quote-type-bi-desc": "Power BI, analytics, data visualization",
        "quote-type-bi-price": "From $8,500",
        "quote-type-bitcoin": "Bitcoin Advisory",
        "quote-type-bitcoin-desc": "Market analysis, strategy, education",
        "quote-type-bitcoin-price": "From $2,000",
        "quote-step2-title": "Select features",
        "quote-step3-title": "Project size",
        "quote-size-small": "Small",
        "quote-size-small-desc": "1-5 screens, basic functionality",
        "quote-size-medium": "Medium",
        "quote-size-medium-desc": "6-15 screens, moderate logic",
        "quote-size-large": "Large",
        "quote-size-large-desc": "15+ screens, complex workflows",
        "quote-ai-title": "Describe your project",
        "quote-ai-desc": "Tell me what you need in your own words. I'll analyze your description and generate an estimated cost based on the features and complexity detected.",
        "quote-ai-placeholder": "Example: I need an app for my restaurant where customers can see the menu, order online, pay with card, and track their delivery in real time. I also need an admin panel to manage orders and inventory...",
        "quote-ai-btn": "<i class=\"ph ph-sparkle\"></i> Analyze and estimate",
        "quote-ai-result-title": "AI Analysis",
        "quote-ai-privacy": "<i class=\"ph ph-info\"></i> Your description is processed by Google Gemini to generate the estimate. Don't include confidential data.",
        "form-privacy": "Your details are processed via Formspree solely to reply to you. They are not sold or used for marketing.",
        "quote-summary-title": "Estimate",
        "quote-summary-badge": "Non-binding estimate",
        "quote-summary-empty": "Select a project type to see your estimate",
        "quote-line-type": "Project type",
        "quote-line-features": "Features",
        "quote-line-complexity": "Size multiplier",
        "quote-total-label": "Estimated range",
        "quote-timeline-label": "Estimated timeline:",
        "quote-hire-btn": "<i class=\"ph ph-handshake\"></i> I want to hire this project",
        "quote-hire-note": "Your requirements will be sent. I'll respond within 24 hours with a detailed proposal.",
        "quote-modal-title": "Send your project requirements",
        "quote-modal-desc": "Review your project details and provide your contact information. All your selected requirements will be included automatically.",
        "quote-form-submit": "<i class=\"ph ph-paper-plane-tilt\"></i> Send requirements & request proposal",
        "quote-modal-success": "Requirements sent! I'll respond with a detailed proposal within 24 hours.",
        "quote-form-name": "Your name",
        "quote-form-email": "Email",
        "quote-form-company": "Company (optional)",
        "quote-form-phone": "Phone / WhatsApp (optional)",
        "quote-form-notes": "Additional notes or context...",
        "nav-bots": "Bots",
        "hero-badge-1": "Microsoft Power Platform Certified",
        "hero-badge-2": "2 MSc (Data Science + BI) · PgD Blockchain · BSc Systems Eng.",
        "hero-badge-3": "Power Automate + n8n automation",
        "hero-badge-4": "Operating worldwide · 100% remote",
        "bots-tag": "Bots catalog",
        "bots-title": "Bots that do the work nobody should be doing by hand",
        "bots-subtitle": "Each one replaces a manual, error-prone routine with a process that runs on schedule, logs everything and escalates only when it needs you.",
        "bots-note": "Reference architectures — every bot is built to measure for your operation.",
        "bots-label-pain": "The pain",
        "bots-label-solution": "The bot",
        "bots-cta": "Automate this",
        "botcat-1": "Finance &amp; Accounting",
        "botcat-2": "Human Resources",
        "botcat-3": "Sales &amp; CRM",
        "botcat-4": "Operations &amp; Supply Chain",
        "botcat-5": "Customer Service &amp; Support",
        "botcat-6": "Procurement &amp; Admin",
        "bot-concilia-bot-name": "ConciliaBot",
        "bot-concilia-bot-pain": "Every month-end your accounting team stays until midnight matching bank statements against the ERP line by line, fighting transposed amounts and missing references, while leadership waits on numbers nobody fully trusts.",
        "bot-concilia-bot-solution": "The bot pulls bank movements and ledger entries on a schedule, matches them with fuzzy and exact rules, flags only the true exceptions for human review, and posts a clean reconciliation summary to Teams.",
        "bot-concilia-bot-outcome": "Turns month-end reconciliation from a multi-day grind into a same-morning task, with humans touching only the handful of items that genuinely need judgment.",
        "bot-factura-bot-360-name": "FacturaBot 360",
        "bot-factura-bot-360-pain": "Supplier invoices arrive as PDFs scattered across three inboxes and a WhatsApp group; someone re-types them into the system, totals get fat-fingered, and at least one invoice always surfaces late, past its due date, with a surprise penalty.",
        "bot-factura-bot-360-solution": "It captures incoming invoices from email, extracts vendor, amounts, tax and due date with OCR and AI, validates totals against the purchase order, and loads the entry into the accounting system with an audit trail.",
        "bot-factura-bot-360-outcome": "No invoice falls through the cracks and no due date is missed because a PDF got buried in someone's inbox.",
        "bot-gasto-guard-name": "GastoGuard",
        "bot-gasto-guard-pain": "Expense reports come in as crumpled photos and half-filled forms; finance plays detective chasing missing receipts, duplicate charges and out-of-policy claims, and reimbursements drag on for weeks while staff grumble.",
        "bot-gasto-guard-solution": "Employees photograph a receipt, the bot reads the merchant, date and amount, checks it against expense policy and duplicates, routes anything suspicious for approval and pushes clean claims straight to payment.",
        "bot-gasto-guard-outcome": "Reimbursements move from weeks to days, and out-of-policy or duplicate claims get caught before money leaves the company.",
        "bot-onboard-bot-name": "OnboardBot",
        "bot-onboard-bot-pain": "A new hire starts Monday with no laptop, no email account and no access to the systems they need; HR, IT and the manager each assume someone else handled it, and the employee spends their first week idle and unimpressed.",
        "bot-onboard-bot-solution": "When a hire is confirmed, the bot fires a coordinated checklist: it requests accounts and equipment, schedules induction sessions, sends welcome material and tracks every task to completion with reminders to the right owner.",
        "bot-onboard-bot-outcome": "Every new hire walks in to a desk that's ready, so day one is about the work and not about chasing access.",
        "bot-vacacion-flow-name": "VacacionFlow",
        "bot-vacacion-flow-pain": "Time-off requests live in email threads and a shared spreadsheet that two people edit at once; nobody knows the real balance, approvals stall while a manager travels, and payroll discovers conflicts after the fact.",
        "bot-vacacion-flow-solution": "Employees submit time off from their phone, the bot checks the live balance and team coverage, routes approval with a backup approver if the manager is out, and updates the calendar and payroll record automatically.",
        "bot-vacacion-flow-outcome": "Balances are always trustworthy and approvals never stall just because someone is out of office.",
        "bot-talento-bot-name": "TalentoBot",
        "bot-talento-bot-pain": "A single job posting buries recruiters under hundreds of CVs in mixed formats; strong candidates sit unread for days, the good ones accept other offers, and screening feels like reading the same paragraph a thousand times.",
        "bot-talento-bot-solution": "The bot ingests incoming CVs, extracts skills and experience, ranks each candidate against the role's must-have criteria, drafts a shortlist summary for the recruiter and sends acknowledgment emails to every applicant.",
        "bot-talento-bot-outcome": "Recruiters spend their time interviewing the strongest candidates instead of reading hundreds of CVs that don't fit.",
        "bot-cobranza-bot-name": "CobranzaBot",
        "bot-cobranza-bot-pain": "Receivables age quietly because reminders depend on whoever remembers; customers claim they never got the invoice, follow-ups are inconsistent and cash that should be in the bank is stuck in a forgotten 60-day-old balance.",
        "bot-cobranza-bot-solution": "The bot watches due dates, sends tiered reminders before and after the deadline through email and WhatsApp, logs every contact in the CRM and escalates aging balances to the account owner with a ready-to-send summary.",
        "bot-cobranza-bot-outcome": "Collections become consistent and polite instead of sporadic, so cash comes in sooner without anyone having to nag from memory.",
        "bot-lead-pilot-name": "LeadPilot",
        "bot-lead-pilot-pain": "Leads pour in from the website, ads and trade shows into different places, then sit for hours or days before anyone responds; by the time a rep calls, the prospect has already talked to a competitor who answered first.",
        "bot-lead-pilot-solution": "The bot captures leads from every channel into one place, deduplicates and enriches them, scores and assigns each to the right rep instantly, and triggers a first-touch reply within minutes so no hot lead goes cold.",
        "bot-lead-pilot-outcome": "Every lead gets a fast, consistent first response, so fewer opportunities are lost simply because the company replied too late.",
        "bot-cotiza-bot-name": "CotizaBot",
        "bot-cotiza-bot-pain": "Quotes are built by hand in old Word files with last quarter's prices; reps copy the wrong template, margins slip, approvals bounce around email, and the customer waits two days for a document that should take ten minutes.",
        "bot-cotiza-bot-solution": "From the CRM opportunity, the bot pulls current pricing and discount rules, generates a branded quote PDF, routes it for approval only when margin thresholds require it, and emails the final document to the customer.",
        "bot-cotiza-bot-outcome": "Quotes go out in minutes with the right prices every time, and discount approvals stop being a bottleneck.",
        "bot-stock-sentry-name": "StockSentry",
        "bot-stock-sentry-pain": "Inventory truth lives in a spreadsheet updated whenever someone gets around to it; fast movers run out without warning, slow movers pile up tying cash, and purchasing reorders by gut feel after the shelf is already empty.",
        "bot-stock-sentry-solution": "The bot consolidates stock levels across locations, compares them against reorder points and sales velocity, alerts purchasing before items run dry and drafts purchase requisitions for the right quantities to the right suppliers.",
        "bot-stock-sentry-outcome": "Stockouts and dead inventory both shrink because reorders are triggered by data, not by an empty shelf.",
        "bot-ruta-bot-name": "RutaBot",
        "bot-ruta-bot-pain": "Delivery dispatch is a morning scramble of phone calls and a printed list; drivers double back across the city, customers call asking where their order is, and nobody can say with confidence what was delivered and what wasn't.",
        "bot-ruta-bot-solution": "The bot builds the day's delivery list from open orders, notifies each customer with an arrival window, collects proof-of-delivery from the driver's phone and updates order status and the dashboard in real time.",
        "bot-ruta-bot-outcome": "Dispatch stops being a daily fire drill and customers get clear delivery updates instead of calling to ask.",
        "bot-calidad-watch-name": "CalidadWatch",
        "bot-calidad-watch-pain": "Quality inspections are logged on paper clipboards that get lost or soaked; defects are spotted hours too late, the same problem repeats across shifts, and audits become a frantic search for documents that may not exist.",
        "bot-calidad-watch-solution": "Inspectors record checks from a tablet, the bot flags out-of-spec readings instantly, opens a corrective-action task with the responsible area and keeps a timestamped, searchable record ready for any audit.",
        "bot-calidad-watch-outcome": "Defects get caught and corrected the same shift, and audit evidence is always one search away instead of lost on paper.",
        "bot-soporte-bot-name": "SoporteBot",
        "bot-soporte-bot-pain": "Support requests arrive by email, web form and WhatsApp with no ticket number; messages get answered twice or not at all, the same questions burn agent time daily, and customers feel ignored while issues bounce between people.",
        "bot-soporte-bot-solution": "The bot turns every incoming message into a tracked ticket, drafts an AI answer for common questions, routes complex cases to the right agent with full context and sends the customer a confirmation with their ticket number instantly.",
        "bot-soporte-bot-outcome": "Every request gets acknowledged immediately and nothing slips through the cracks between channels.",
        "bot-encuesta-bot-name": "EncuestaBot",
        "bot-encuesta-bot-pain": "After a sale or a support case, feedback is either never collected or trapped in a survey tool no one reviews; an unhappy customer churns silently and the team only learns there was a problem when the account is already gone.",
        "bot-encuesta-bot-solution": "The bot sends a short follow-up survey after each interaction, uses AI to read open comments and gauge sentiment, alerts a manager the moment a response turns negative and rolls everything into a live satisfaction dashboard.",
        "bot-encuesta-bot-outcome": "Unhappy customers get a callback while there's still time to save the relationship, instead of churning in silence.",
        "bot-sla-guard-name": "SLAGuard",
        "bot-sla-guard-pain": "Service commitments are tracked in people's heads; a ticket quietly breaches its deadline, the customer escalates angrily to a director, and only then does anyone realize the case had been sitting untouched for three days.",
        "bot-sla-guard-solution": "The bot watches every open ticket against its SLA clock, nudges the assigned agent before time runs out, escalates to a supervisor as the deadline nears and reports breach trends so the same gaps stop repeating.",
        "bot-sla-guard-outcome": "Deadlines get defended proactively, so escalations come from the system early rather than from an angry customer too late.",
        "bot-compra-bot-name": "CompraBot",
        "bot-compra-bot-pain": "Purchase requests live in email and verbal asks; approvals stall in someone's inbox for a week, urgent orders get placed without sign-off, and nobody can tell who approved what or where a given request currently stands.",
        "bot-compra-bot-solution": "Staff submit a structured purchase request, the bot routes it through the approval chain by amount and category, escalates if an approver sits idle, and turns the approved request into a tracked purchase order automatically.",
        "bot-compra-bot-outcome": "Approvals stop dying in inboxes and every purchase has a clear, auditable trail of who approved it and when.",
        "bot-contrato-bot-name": "ContratoBot",
        "bot-contrato-bot-pain": "Contracts and supplier agreements are scattered across shared drives with no expiry tracking; a key contract auto-renews at a worse rate, an insurance policy lapses unnoticed, and legal scrambles when an auditor asks for a signed copy.",
        "bot-contrato-bot-solution": "The bot indexes every contract, extracts key dates and terms with AI, alerts owners well before renewal or expiry windows, and keeps a searchable, version-controlled repository with the right approvals on file.",
        "bot-contrato-bot-outcome": "No contract ever auto-renews by surprise or lapses unnoticed, and signed copies are always one search away.",
        "bot-doc-bot-name": "DocBot",
        "bot-doc-bot-pain": "Critical documents land as email attachments and get dropped into whatever folder is open; files are named 'final_v3_real', the same document exists in four versions, and finding the right one before a meeting is a daily panic.",
        "bot-doc-bot-solution": "The bot captures incoming documents, classifies them by type with AI, renames and files them under a consistent structure, extracts key fields into a register and removes duplicates so there's one trusted version of everything.",
        "bot-doc-bot-outcome": "There's always one trusted version of every document, found in seconds instead of hunted for before every meeting.",
        "svc-process-automation-title": "Process Automation",
        "svc-process-automation-desc": "Replace manual, repetitive workflows with automations that run on their own across your tools and inboxes. Built with Power Automate and n8n, with approvals, error handling and clear logs so nothing falls through the cracks.",
        "svc-process-automation-b1": "Approval and notification flows",
        "svc-process-automation-b2": "Scheduled and event-based triggers",
        "svc-process-automation-b3": "Error handling with retries",
        "svc-process-automation-b4": "Run logs and alerts",
        "svc-process-automation-result": "Hours of manual work eliminated every week, with fewer errors.",
        "svc-process-automation-badge": "Most requested",
        "svc-bots-rpa-title": "Custom Bots &amp; RPA",
        "svc-bots-rpa-desc": "Attended and unattended bots that handle repetitive desktop and cloud tasks, including legacy systems without APIs. They log in, read screens, move data and run on a schedule or on demand.",
        "svc-bots-rpa-b1": "Desktop RPA with robust selectors",
        "svc-bots-rpa-b2": "Unattended runs on dedicated VMs",
        "svc-bots-rpa-b3": "Data entry and reconciliation bots",
        "svc-bots-rpa-b4": "Execution logging and monitoring",
        "svc-bots-rpa-result": "Repetitive tasks done overnight, freeing your team for higher-value work.",
        "svc-integrations-apis-title": "System Integrations &amp; APIs",
        "svc-integrations-apis-desc": "Connect your ERP, CRM, SaaS tools and databases so data flows automatically instead of being copied by hand. I build the integration layer with n8n, webhooks and custom connectors, with mapping and validation at every step.",
        "svc-integrations-apis-b1": "ERP, CRM and SaaS connectors",
        "svc-integrations-apis-b2": "Webhook and event syncing",
        "svc-integrations-apis-b3": "Field mapping and validation",
        "svc-integrations-apis-b4": "Idempotent, retry-safe transfers",
        "svc-integrations-apis-result": "Your systems talk to each other, ending double entry and stale data.",
        "svc-integrations-apis-badge": "High demand",
        "svc-business-apps-title": "Business Apps (Power Apps)",
        "svc-business-apps-desc": "Internal apps, request portals and field registries that run on your real data in Dataverse or SQL. Clean interfaces your team actually uses, on desktop and mobile, with roles and offline capture where needed.",
        "svc-business-apps-b1": "Canvas and model-driven apps",
        "svc-business-apps-b2": "Request and approval portals",
        "svc-business-apps-b3": "Mobile field data capture",
        "svc-business-apps-b4": "Role-based access on real data",
        "svc-business-apps-result": "Spreadsheets and paper forms replaced by one reliable app.",
        "svc-fullstack-web-title": "Full-Stack Web Applications",
        "svc-fullstack-web-desc": "Custom web platforms built with Next.js, React, NestJS and PostgreSQL, from internal portals to SaaS and marketplaces. Production-grade architecture with authentication, payments and an admin panel from day one.",
        "svc-fullstack-web-b1": "Next.js and React front end",
        "svc-fullstack-web-b2": "NestJS API and PostgreSQL",
        "svc-fullstack-web-b3": "Auth, payments and admin panel",
        "svc-fullstack-web-b4": "Cloud deploy and CI/CD",
        "svc-fullstack-web-result": "A scalable platform that grows with your business, fully owned by you.",
        "svc-mobile-apps-title": "Mobile App Development",
        "svc-mobile-apps-desc": "Native-feeling iOS and Android apps from a single React Native and Expo codebase, cutting cost and time to market. Push notifications, offline support and store submission included.",
        "svc-mobile-apps-b1": "One codebase for iOS and Android",
        "svc-mobile-apps-b2": "Push notifications and offline mode",
        "svc-mobile-apps-b3": "API and backend integration",
        "svc-mobile-apps-b4": "App Store and Play Store launch",
        "svc-mobile-apps-result": "Reach customers on both platforms without doubling your budget.",
        "svc-dashboards-bi-title": "Interactive Dashboards &amp; BI",
        "svc-dashboards-bi-desc": "Power BI dashboards that turn scattered data into clear KPIs, trends and alerts for daily decisions. Built on a proper star schema with scheduled refresh and alerts when numbers cross your thresholds.",
        "svc-dashboards-bi-b1": "KPI and executive dashboards",
        "svc-dashboards-bi-b2": "Star schema data model",
        "svc-dashboards-bi-b3": "Scheduled refresh and alerts",
        "svc-dashboards-bi-b4": "Drill-down and self-service views",
        "svc-dashboards-bi-result": "One source of truth that leadership checks every morning.",
        "svc-dashboards-bi-badge": "Most requested",
        "svc-etl-pipelines-title": "ETL &amp; Data Pipelines",
        "svc-etl-pipelines-desc": "Reliable pipelines that clean, model and move data between sources, warehouses and reporting layers. Built with Python, Power Query and SQL under Airflow-style orchestration, with quality checks and monitoring.",
        "svc-etl-pipelines-b1": "Ingestion from multiple sources",
        "svc-etl-pipelines-b2": "Cleaning and data modeling",
        "svc-etl-pipelines-b3": "Scheduled orchestration",
        "svc-etl-pipelines-b4": "Data quality checks and monitoring",
        "svc-etl-pipelines-result": "Trustworthy, ready-to-use data feeding every report and model.",
        "svc-data-science-title": "Data Science &amp; Predictive Models",
        "svc-data-science-desc": "Predictive models for forecasting, customer segmentation, churn, demand and anomaly detection, grounded in your business question. Each model ships with validation, confidence ranges and explainability so you can trust the numbers.",
        "svc-data-science-b1": "Demand and sales forecasting",
        "svc-data-science-b2": "Churn and customer segmentation",
        "svc-data-science-b3": "Anomaly and fraud detection",
        "svc-data-science-b4": "Validated, explainable models",
        "svc-data-science-result": "Decisions backed by data instead of gut feeling.",
        "svc-applied-ai-title": "Applied AI Solutions",
        "svc-applied-ai-desc": "AI agents, RAG assistants, chatbots and document intelligence built on Claude AI and Gemini, grounded in your own content. Defined evaluations, guardrails and cost control so the AI is accurate, safe and affordable.",
        "svc-applied-ai-b1": "RAG assistants over your docs",
        "svc-applied-ai-b2": "Custom chatbots and AI agents",
        "svc-applied-ai-b3": "Document data extraction",
        "svc-applied-ai-b4": "Evaluations, guardrails and cost control",
        "svc-applied-ai-result": "AI that answers from your data, not generic guesses.",
        "svc-applied-ai-badge": "New",
        "nav-metodo": "Method",
        "nav-estimate": "Estimate",
        "hero-doc-left": "DOC. HH/2026 — OPERATIONS ENGINEERING",
        "hero-doc-right": "STATUS · OPERATIONAL",
        "ch-01": "01 — DIAGNOSIS",
        "ch-02": "02 — EVIDENCE",
        "ch-03": "03 — SERVICES &amp; PRICING",
        "ch-04": "04 — ANATOMY OF AN AUTOMATION",
        "ch-05": "05 — METHOD",
        "ch-06": "06 — THE PLATFORM DECISION",
        "ch-07": "07 — THE ARCHITECT",
        "ch-08": "08 — ESTIMATE YOUR PROJECT",
        "ch-09": "09 — LET'S TALK",
        "ch-annex": "ANNEX — BITCOIN ADVISORY",
        "problems-bridge": "All six have known fixes. Here is the evidence.",
        "label-inprod": "IN PRODUCTION",
        "case-cta": "Have a process like this? → Estimate it",
        "slab-1-before": "HOURS",
        "slab-1-after": "SECONDS",
        "slab-2-before": "3 PORTALS",
        "slab-2-after": "1 DASHBOARD",
        "slab-3-before": "MANUAL PROCESS",
        "slab-3-after": "ZERO TOUCH",
        "arch-role-results": "Role-filtered results",
        "arch-three-sources": "3 data sources",
        "arch-star-model": "Dimensional model",
        "projects-bridge": "Your process can be Case 07.",
        "svc-process-automation-floor": "From $8,000 · 1–8 weeks",
        "svc-integrations-apis-floor": "From $8,000 · 1–8 weeks",
        "svc-dashboards-bi-floor": "From $8,500 · 2–8 weeks",
        "svc-applied-ai-floor": "From $15,000 · 2–12 weeks",
        "services-cta": "Not sure which one you need? → Estimate your project",
        "autoflow-titleblock": "DWG A-01 · PROCESS AUTOMATION · SCALE: WEEKS, NOT MONTHS",
        "platform-quote": "I work exclusively within the Microsoft ecosystem. That is not a limitation — <em>it is a strategic decision.</em>",
        "certs-academic": "Academic credentials",
        "about-shipped-label": "Shipped products",
        "tier-1": "Technical diagnostic $2,000–3,500 — credited to your first project",
        "tier-2": "Implementation $4,000–15,000 — 40/30/30 milestone payments",
        "tier-3": "Retainer from $2,000/month",
        "cta-diagnostic": "Book a 30-minute diagnostic call — free. We review your most critical process and I tell you honestly whether I can help, and how.",
        "form-label-name": "Name",
        "form-label-email": "Email",
        "form-label-company": "Company (optional)",
        "form-label-service": "What do you need?",
        "form-label-message": "Brief description of your project or problem",
        "form-fallback": "The form couldn't be sent right now.",
        "pill-estimate": "Estimate",
        "footer-privacy": "Privacy",
        "footer-terms": "Terms",
        "tb-doc": "DWG HH-2026 — OPERATIONS ENGINEERING",
        "tb-prepared": "PREPARED BY: H. HENRÍQUEZ · ING.",
        "tb-signed": "SIGNED:",
        "tb-meta": "SAN SALVADOR · GMT-6 · SHEET 00 — COVER · REV 2026.07",
        "exhibit-tag": "EXHIBIT A — SHIPPED PRODUCT · PUBLIC",
        "exhibit-title": "Bitcoin Academy",
        "exhibit-tagline": "A financial-education PWA in 7 languages — live on the web and on Google Play.",
        "exhibit-provenance": "LIVE ↗ <a href=\"https://bitcoinacademy.tech\" target=\"_blank\" rel=\"noopener\">bitcoinacademy.tech</a> · 7 LANGUAGES · PWA + GOOGLE PLAY",
        "exhibit-badge": "<img src=\"img/google-play-badge-en.png\" alt=\"Get it on Google Play\" width=\"180\" height=\"70\" loading=\"lazy\" decoding=\"async\">",
        "exhibit-verify": "VERIFY IT YOURSELF — INSTALL IT RIGHT NOW.",
        "bots-fig-cap": "FIG. ASSY-01 — REFERENCE BUILD: EVERY BOT IS ASSEMBLED TO ORDER",
        "method-fig-cap": "FIG. HND-06 — HANDOVER: THE SYSTEM, DOCUMENTED, DELIVERED, RUNNING WITHOUT ME.",
        "about-plate": "PLATE 07 — THE ARCHITECT",
        "about-see-exhibit": "See Exhibit A →",
        "contact-portrait-cap": "YOU TALK TO THE ENGINEER — THERE IS NO SALES TEAM",
        "contact-reply": "REPLY &lt; 24H",
        "cartouche-drawn": "DRAWN BY: H.H. · REV 2026.07 · SHEET 04/09",
        "cartouche-approved": "APPROVED",
        "colophon-motto": "DRAWN BY HAND · RUN BY MACHINES",
    }
};

// Apply translations for a given language
function applyLanguage(lang) {
    document.dispatchEvent(new CustomEvent('lang:willchange'));
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
    document.dispatchEvent(new CustomEvent('lang:changed'));
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

// NOTE: counter animation removed — motion.js owns the .odo data-target counters.

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
            sendFailed(submitBtn, originalText);
        }
    }).catch(function() {
        sendFailed(submitBtn, originalText);
    });
}

// On delivery failure, re-enable the form so the visitor can retry,
// and surface an inline per-language fallback with a prefilled WhatsApp link.
function sendFailed(submitBtn, originalText) {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    var fallback = document.getElementById('formFallback');
    if (!fallback) return;

    var lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    var msg = (translations[lang] && translations[lang]['form-fallback']) ||
        (lang === 'es' ? 'No se pudo enviar el formulario en este momento.' : "The form couldn't be sent right now.");
    var waText = lang === 'es'
        ? 'Hola Humberto — el formulario del sitio falló, quiero hablar sobre un proyecto.'
        : 'Hi Humberto — the site form failed, I want to talk about a project.';
    var waUrl = 'https://wa.me/50371928070?text=' + encodeURIComponent(waText);
    var linkLabel = lang === 'es' ? 'Envíalo por WhatsApp →' : 'Send it by WhatsApp instead →';

    fallback.innerHTML = escapeHtml(msg) + ' <a href="' + waUrl + '" target="_blank" rel="noopener">' + linkLabel + '</a>';
    fallback.removeAttribute('hidden');
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
            { id: 'responsive', name: 'Responsive design (mobile + tablet)', nameEs: 'Diseño responsive (móvil + tablet)', price: 250 },
            { id: 'seo', name: 'SEO optimization + sitemap', nameEs: 'Optimización SEO + sitemap', price: 350 },
            { id: 'contact-form', name: 'Contact form + validation', nameEs: 'Formulario de contacto + validación', price: 200 },
            { id: 'blog', name: 'Blog / News with CMS', nameEs: 'Blog / Noticias con CMS', price: 500 },
            { id: 'multilang', name: 'Multi-language (EN/ES)', nameEs: 'Multi-idioma (EN/ES)', price: 400 },
            { id: 'cms', name: 'Content management panel', nameEs: 'Panel gestor de contenido', price: 600 },
            { id: 'animations', name: 'Premium animations & transitions', nameEs: 'Animaciones y transiciones premium', price: 300 },
            { id: 'analytics', name: 'Google Analytics + Tag Manager', nameEs: 'Google Analytics + Tag Manager', price: 200 },
            { id: 'newsletter', name: 'Newsletter / email capture', nameEs: 'Newsletter / captura de emails', price: 250 },
            { id: 'gallery', name: 'Image / video gallery', nameEs: 'Galeria de imagenes / video', price: 300 },
            { id: 'social', name: 'Social media integration', nameEs: 'Integración redes sociales', price: 200 },
            { id: 'ssl-domain', name: 'SSL + custom domain setup', nameEs: 'SSL + configuracion de dominio', price: 150 },
        ],
        webapp: [
            { id: 'auth', name: 'Authentication (login/register/OAuth)', nameEs: 'Autenticación (login/registro/OAuth)', price: 600 },
            { id: 'rbac', name: 'Role-based access control', nameEs: 'Control de acceso por roles', price: 450 },
            { id: 'dashboard', name: 'Admin dashboard with analytics', nameEs: 'Panel admin con analytics', price: 750 },
            { id: 'crud', name: 'CRUD modules (data management)', nameEs: 'Modulos CRUD (gestión de datos)', price: 450 },
            { id: 'payments', name: 'Payments (Stripe/PayPal/crypto)', nameEs: 'Pagos (Stripe/PayPal/crypto)', price: 800 },
            { id: 'subscriptions', name: 'Subscription / recurring billing', nameEs: 'Suscripciones / cobro recurrente', price: 600 },
            { id: 'notifications', name: 'Email + push notifications', nameEs: 'Notificaciones email + push', price: 450 },
            { id: 'realtime', name: 'Real-time features (WebSocket)', nameEs: 'Funciones en tiempo real (WebSocket)', price: 700 },
            { id: 'api', name: 'REST API + documentation', nameEs: 'API REST + documentación', price: 600 },
            { id: 'file-upload', name: 'File upload + cloud storage', nameEs: 'Subida de archivos + cloud storage', price: 400 },
            { id: 'search', name: 'Advanced search & filters', nameEs: 'Búsqueda avanzada y filtros', price: 400 },
            { id: 'ai-integration', name: 'AI integration (chatbot/analysis)', nameEs: 'Integración de IA (chatbot/análisis)', price: 900 },
            { id: 'reports', name: 'Reports + PDF/Excel export', nameEs: 'Reportes + exportacion PDF/Excel', price: 450 },
            { id: 'multi-tenant', name: 'Multi-tenant architecture', nameEs: 'Arquitectura multi-tenant', price: 800 },
            { id: 'email-system', name: 'Transactional email system', nameEs: 'Sistema de emails transaccionales', price: 400 },
            { id: 'maps', name: 'Maps & geolocation', nameEs: 'Mapas y geolocalizacion', price: 500 },
        ],
        mobile: [
            { id: 'auth', name: 'Authentication (login/register)', nameEs: 'Autenticación (login/registro)', price: 600 },
            { id: 'push', name: 'Push notifications', nameEs: 'Notificaciones push', price: 450 },
            { id: 'offline', name: 'Offline mode + data sync', nameEs: 'Modo offline + sincronización', price: 600 },
            { id: 'camera', name: 'Camera + image processing', nameEs: 'Camara + procesamiento de imagenes', price: 400 },
            { id: 'gps', name: 'GPS + real-time tracking', nameEs: 'GPS + rastreo en tiempo real', price: 500 },
            { id: 'payments', name: 'In-app payments + subscriptions', nameEs: 'Pagos in-app + suscripciones', price: 800 },
            { id: 'social-login', name: 'Social login (Google/Apple/FB)', nameEs: 'Login social (Google/Apple/FB)', price: 400 },
            { id: 'chat', name: 'In-app messaging / chat', nameEs: 'Mensajeria / chat in-app', price: 700 },
            { id: 'store-publish', name: 'App Store + Play Store publishing', nameEs: 'Publicacion App Store + Play Store', price: 600 },
            { id: 'analytics', name: 'Usage analytics + crash reports', nameEs: 'Analytics de uso + reportes de errores', price: 300 },
            { id: 'biometrics', name: 'Biometric auth (Face ID / fingerprint)', nameEs: 'Auth biometrica (Face ID / huella)', price: 350 },
            { id: 'qr-scanner', name: 'QR / barcode scanner', nameEs: 'Escaner QR / código de barras', price: 300 },
            { id: 'deep-linking', name: 'Deep linking + share system', nameEs: 'Deep linking + sistema de compartir', price: 350 },
            { id: 'local-storage', name: 'Local data storage + encryption', nameEs: 'Almacenamiento local + encriptacion', price: 400 },
        ],
        fullstack: [
            { id: 'auth', name: 'Authentication system (web + mobile)', nameEs: 'Sistema de autenticación (web + mobile)', price: 700 },
            { id: 'rbac', name: 'Role-based access control', nameEs: 'Control de acceso por roles', price: 500 },
            { id: 'dashboard', name: 'Admin dashboard + analytics', nameEs: 'Panel admin + analytics', price: 800 },
            { id: 'payments', name: 'Unified payment system', nameEs: 'Sistema de pagos unificado', price: 900 },
            { id: 'push', name: 'Push notifications (web + mobile)', nameEs: 'Notificaciones push (web + mobile)', price: 550 },
            { id: 'offline', name: 'Offline support + sync', nameEs: 'Soporte offline + sincronización', price: 600 },
            { id: 'realtime', name: 'Real-time sync across platforms', nameEs: 'Sincronización en tiempo real cross-platform', price: 800 },
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
            { id: 'approvals', name: 'Multi-level approval workflows', nameEs: 'Flujos de aprobación multinivel', price: 400 },
            { id: 'email-auto', name: 'Email automation + templates', nameEs: 'Automatización de correo + plantillas', price: 300 },
            { id: 'data-sync', name: 'System-to-system data sync', nameEs: 'Sincronización de datos entre sistemas', price: 550 },
            { id: 'doc-gen', name: 'Document generation (PDF/Word/Excel)', nameEs: 'Generacion de docs (PDF/Word/Excel)', price: 450 },
            { id: 'sharepoint', name: 'SharePoint integration + libraries', nameEs: 'Integración SharePoint + bibliotecas', price: 400 },
            { id: 'custom-connector', name: 'Custom API connectors', nameEs: 'Conectores API personalizados', price: 550 },
            { id: 'error-handling', name: 'Error handling + retry + logging', nameEs: 'Manejo de errores + reintentos + logging', price: 350 },
            { id: 'power-app', name: 'Power App user interface', nameEs: 'Interfaz Power App', price: 550 },
            { id: 'dataverse', name: 'Dataverse data model', nameEs: 'Modelo de datos Dataverse', price: 500 },
            { id: 'teams-integration', name: 'Microsoft Teams integration', nameEs: 'Integración con Microsoft Teams', price: 350 },
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
            { id: 'training', name: 'User training + documentation', nameEs: 'Capacitacion + documentación', price: 350 },
            { id: 'mobile-report', name: 'Mobile-optimized reports', nameEs: 'Reportes optimizados para móvil', price: 300 },
            { id: 'paginated', name: 'Paginated reports (SSRS)', nameEs: 'Reportes paginados (SSRS)', price: 400 },
        ],
        bitcoin: [
            { id: 'market-analysis', name: 'Market cycle analysis & outlook', nameEs: 'Análisis de ciclo de mercado y perspectiva', price: 200 },
            { id: 'technical-analysis', name: 'Technical analysis (charts, indicators)', nameEs: 'Análisis tecnico (graficos, indicadores)', price: 250 },
            { id: 'investment-strategy', name: 'Investment strategy & DCA plan', nameEs: 'Estrategia de inversion y plan DCA', price: 300 },
            { id: 'portfolio-review', name: 'Portfolio review & allocation', nameEs: 'Revision de portafolio y asignacion', price: 250 },
            { id: 'risk-management', name: 'Risk management & position sizing', nameEs: 'Gestión de riesgo y tamaño de posiciones', price: 200 },
            { id: 'onchain-analysis', name: 'On-chain data analysis', nameEs: 'Análisis de datos on-chain', price: 300 },
            { id: 'altcoin-review', name: 'Altcoin evaluation & due diligence', nameEs: 'Evaluacion de altcoins y due diligence', price: 250 },
            { id: 'defi-guide', name: 'DeFi strategy & yield farming', nameEs: 'Estrategia DeFi y yield farming', price: 350 },
            { id: 'security-setup', name: 'Wallet security & cold storage setup', nameEs: 'Seguridad de wallets y cold storage', price: 200 },
            { id: 'education-1on1', name: '1-on-1 education sessions (4 hours)', nameEs: 'Sesiones educativas 1-a-1 (4 horas)', price: 400 },
            { id: 'group-workshop', name: 'Group workshop (up to 10 people)', nameEs: 'Taller grupal (hasta 10 personas)', price: 600 },
            { id: 'monthly-advisory', name: 'Monthly advisory retainer', nameEs: 'Asesoría mensual recurrente', price: 500 },
        ]
    };

    // Type labels
    const typeLabels = {
        website: { en: 'Website', es: 'Sitio Web' },
        webapp: { en: 'Web Application', es: 'Aplicacion Web' },
        mobile: { en: 'Mobile App', es: 'App Móvil' },
        fullstack: { en: 'Web + Mobile', es: 'Web + Mobile' },
        automation: { en: 'Automation', es: 'Automatización' },
        bi: { en: 'Dashboard / BI', es: 'Dashboard / BI' },
        bitcoin: { en: 'Bitcoin Advisory', es: 'Asesoría Bitcoin' }
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
                var sizeLabels = { small: lang === 'es' ? 'Pequeño' : 'Small', medium: lang === 'es' ? 'Mediano' : 'Medium', large: lang === 'es' ? 'Grande' : 'Large' };
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
            website: ['website', 'landing', 'blog', 'sitio web', 'página web', 'sitio', 'página', 'corporate', 'corporativo', 'brochure'],
            webapp: ['web app', 'webapp', 'plataforma', 'platform', 'saas', 'portal', 'dashboard', 'sistema web', 'aplicacion web', 'marketplace', 'e-commerce', 'ecommerce', 'tienda online', 'online store'],
            mobile: ['mobile', 'móvil', 'app', 'android', 'ios', 'iphone', 'celular', 'teléfono', 'react native', 'flutter'],
            automation: ['automatizar', 'automate', 'power automate', 'power apps', 'power platform', 'rpa', 'flow', 'flujo', 'sharepoint', 'excel automation'],
            bi: ['dashboard', 'power bi', 'reporte', 'report', 'analytics', 'dax', 'kpi', 'metricas', 'metrics', 'datos', 'data visualization', 'visualización'],
            bitcoin: ['bitcoin', 'btc', 'crypto', 'criptomoneda', 'cryptocurrency', 'trading', 'blockchain', 'wallet', 'defi', 'altcoin', 'ethereum', 'eth', 'inversion', 'inversi\u00f3n', 'invest', 'mercado cripto', 'crypto market', 'hodl', 'satoshi', 'lightning network']
        },
        // Feature detection
        features: [
            { id: 'auth',          keywords: ['login', 'registro', 'register', 'auth', 'autenticación', 'authentication', 'sign up', 'cuenta', 'account', 'usuario', 'user'], name: 'Authentication system', nameEs: 'Sistema de autenticación', price: 500 },
            { id: 'payments',      keywords: ['pago', 'payment', 'pay', 'stripe', 'paypal', 'tarjeta', 'card', 'checkout', 'cobrar', 'charge', 'factura', 'invoice'], name: 'Payment integration', nameEs: 'Integración de pagos', price: 700 },
            { id: 'admin',         keywords: ['admin', 'panel', 'backoffice', 'back office', 'administrador', 'gestión', 'management', 'manage'], name: 'Admin panel', nameEs: 'Panel de administracion', price: 600 },
            { id: 'messaging',     keywords: ['chat', 'mensaje', 'message', 'messaging', 'inbox', 'comunicacion', 'communication'], name: 'Messaging / Chat', nameEs: 'Mensajeria / Chat', price: 600 },
            { id: 'notifications', keywords: ['notificación', 'notification', 'alert', 'alerta', 'push', 'email notification', 'reminder'], name: 'Notifications', nameEs: 'Notificaciones', price: 400 },
            { id: 'maps',          keywords: ['mapa', 'map', 'gps', 'ubicacion', 'location', 'geolocalizacion', 'geolocation', 'tracking', 'rastreo', 'seguimiento', 'delivery'], name: 'Maps / Geolocation', nameEs: 'Mapas / Geolocalizacion', price: 500 },
            { id: 'search',        keywords: ['buscar', 'search', 'filtro', 'filter', 'búsqueda'], name: 'Advanced search & filters', nameEs: 'Búsqueda avanzada y filtros', price: 350 },
            { id: 'files',         keywords: ['subir', 'upload', 'archivo', 'file', 'imagen', 'image', 'photo', 'foto', 'documento', 'document', 'galeria', 'gallery'], name: 'File/image upload', nameEs: 'Subida de archivos/imagenes', price: 350 },
            { id: 'realtime',      keywords: ['real-time', 'real time', 'tiempo real', 'en vivo', 'live', 'websocket', 'socket'], name: 'Real-time features', nameEs: 'Funciones en tiempo real', price: 600 },
            { id: 'ai',            keywords: ['ia', 'ai', 'inteligencia artificial', 'artificial intelligence', 'chatbot', 'bot', 'claude', 'gpt', 'openai', 'machine learning'], name: 'AI integration', nameEs: 'Integración de IA', price: 800 },
            { id: 'inventory',     keywords: ['inventario', 'inventory', 'stock', 'almacen', 'warehouse', 'producto', 'product', 'catálogo', 'catalog'], name: 'Inventory / Product catalog', nameEs: 'Inventario / Catálogo de productos', price: 450 },
            { id: 'reports',       keywords: ['reporte', 'report', 'estadistica', 'statistic', 'gráfico', 'chart', 'analytics', 'exportar', 'export'], name: 'Reports & analytics', nameEs: 'Reportes y analytics', price: 400 },
            { id: 'booking',       keywords: ['calendario', 'calendar', 'agenda', 'schedule', 'cita', 'appointment', 'reserva', 'booking', 'reservation'], name: 'Booking / Calendar', nameEs: 'Reservas / Calendario', price: 500 },
            { id: 'cart',          keywords: ['carrito', 'cart', 'shopping', 'compra', 'purchase', 'orden', 'order', 'pedido'], name: 'Shopping cart / Orders', nameEs: 'Carrito / Pedidos', price: 500 },
            { id: 'seo',           keywords: ['seo', 'google', 'posicionamiento', 'ranking', 'organic'], name: 'SEO optimization', nameEs: 'Optimización SEO', price: 300 },
            { id: 'responsive',    keywords: ['responsive', 'móvil', 'mobile', 'tablet', 'adaptable'], name: 'Responsive design', nameEs: 'Diseño responsive', price: 200 },
            { id: 'multilang',     keywords: ['multi idioma', 'multilingual', 'multi-language', 'ingles', 'english', 'traduccion', 'translation', 'i18n'], name: 'Multi-language', nameEs: 'Multi-idioma', price: 350 },
            { id: 'social',        keywords: ['social', 'facebook', 'instagram', 'twitter', 'whatsapp', 'compartir', 'share', 'red social', 'social media'], name: 'Social media integration', nameEs: 'Integración redes sociales', price: 300 },
            { id: 'rbac',          keywords: ['seguridad', 'security', 'rol', 'role', 'permiso', 'permission', 'rbac', 'access control'], name: 'Role-based security', nameEs: 'Seguridad por roles', price: 400 },
            { id: 'offline',       keywords: ['offline', 'sin conexión', 'pwa', 'progressive'], name: 'Offline / PWA support', nameEs: 'Soporte offline / PWA', price: 500 },
        ]
    };

    // AI endpoint — Cloudflare Worker que usa Gemini 2.0 Flash.
    // Si esta vacio o el endpoint falla, se usa keyword matching local como fallback.
    var QUOTE_AI_ENDPOINT = 'https://quote-ai.henriquezbh5.workers.dev';

    // ===== Analysis pipeline =====
    // Output shape: { type, features: [featObj], complexity, source: 'ai'|'local', reasoning }

    function analyzeLocally(rawText, lang) {
        var text = rawText.toLowerCase();

        var typeScores = {};
        Object.keys(aiKeywords.types).forEach(function(type) {
            typeScores[type] = 0;
            aiKeywords.types[type].forEach(function(kw) {
                if (text.includes(kw)) typeScores[type] += 1;
            });
        });

        if (typeScores.mobile > 0 && (typeScores.webapp > 0 || text.includes('web'))) {
            typeScores.fullstack = (typeScores.fullstack || 0) + typeScores.mobile + typeScores.webapp + 2;
        }

        var detectedType = 'webapp';
        var maxScore = 0;
        Object.keys(typeScores).forEach(function(type) {
            if (typeScores[type] > maxScore) { maxScore = typeScores[type]; detectedType = type; }
        });

        var detectedFeatures = aiKeywords.features.filter(function(feat) {
            return feat.keywords.some(function(kw) { return text.includes(kw); });
        });

        var complexity = 'small';
        if (text.length > 500 || detectedFeatures.length > 8) complexity = 'large';
        else if (text.length > 200 || detectedFeatures.length > 4) complexity = 'medium';

        return { type: detectedType, features: detectedFeatures, complexity: complexity, source: 'local', reasoning: '' };
    }

    async function analyzeWithAI(rawText, lang) {
        if (!QUOTE_AI_ENDPOINT) throw new Error('AI endpoint not configured');

        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 12000);

        try {
            var res = await fetch(QUOTE_AI_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: rawText, lang: lang }),
                signal: controller.signal
            });
            if (!res.ok) throw new Error('AI endpoint returned ' + res.status);
            var data = await res.json();
            if (!data || !data.type) throw new Error('AI endpoint returned invalid data');

            var idMap = {};
            aiKeywords.features.forEach(function(f) { idMap[f.id] = f; });
            var features = (data.features || []).map(function(id) { return idMap[id]; }).filter(Boolean);

            return { type: data.type, features: features, complexity: data.complexity || 'medium', source: 'ai', reasoning: data.reasoning || '' };
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function computeEstimate(analysis, rawText, lang) {
        var multMap = { small: 1, medium: 1.8, large: 3 };
        var mult = multMap[analysis.complexity] || 1.8;

        var base = getMarketBasePrice(analysis.type);
        var fMult = marketFeatureMultiplier[lang] || 1;
        var featuresTotal = analysis.features.reduce(function(sum, f) { return sum + Math.round(f.price * fMult); }, 0);
        var rawTotal = (base + featuresTotal) * mult;
        var min = Math.round(rawTotal * 0.85);
        var max = Math.round(rawTotal * 1.15);

        var sizeLabels = { small: { en: 'Small', es: 'Pequeño' }, medium: { en: 'Medium', es: 'Mediano' }, large: { en: 'Large', es: 'Grande' } };
        var tl2 = lang === 'es' ? timelinesEs : timelines;

        return {
            type: analysis.type,
            typeLabel: (lang === 'es' ? typeLabels[analysis.type].es : typeLabels[analysis.type].en) + ' — $' + base.toLocaleString(),
            features: analysis.features,
            featuresTotal: featuresTotal,
            complexity: analysis.complexity,
            complexityLabel: sizeLabels[analysis.complexity][lang] + ' (x' + mult + ')',
            min: min,
            max: max,
            timeline: tl2[analysis.type][analysis.complexity],
            description: rawText,
            source: analysis.source,
            reasoning: analysis.reasoning,
            _base: base,
            _fMult: fMult,
            _mult: mult
        };
    }

    function renderAiResult(estimate, lang) {
        var resultDiv = document.getElementById('quoteAiResult');
        var detectedDiv = document.getElementById('quoteAiDetected');
        resultDiv.style.display = 'block';

        var sizeLabels = { small: { en: 'Small', es: 'Pequeño' }, medium: { en: 'Medium', es: 'Mediano' }, large: { en: 'Large', es: 'Grande' } };

        var html = '';

        if (estimate.source === 'ai' && estimate.reasoning) {
            html += '<div class="quote-ai-detected-item"><i class="ph ph-brain"></i><span class="ai-feature-name" style="font-style:italic;opacity:.85;">' +
                escapeHtml(estimate.reasoning) + '</span></div>';
        }

        html += '<div class="quote-ai-detected-item"><i class="ph ph-app-window"></i><span class="ai-feature-name"><strong>' +
            (lang === 'es' ? 'Tipo detectado: ' : 'Detected type: ') +
            (lang === 'es' ? typeLabels[estimate.type].es : typeLabels[estimate.type].en) +
            '</strong></span><span class="ai-feature-cost">$' + estimate._base.toLocaleString() + ' base</span></div>';

        estimate.features.forEach(function(f) {
            var adjPrice = Math.round(f.price * estimate._fMult);
            html += '<div class="quote-ai-detected-item"><i class="ph ph-check-circle"></i><span class="ai-feature-name">' +
                (lang === 'es' ? f.nameEs : f.name) +
                '</span><span class="ai-feature-cost">+$' + adjPrice.toLocaleString() + '</span></div>';
        });

        html += '<div class="quote-ai-detected-item"><i class="ph ph-gauge"></i><span class="ai-feature-name"><strong>' +
            (lang === 'es' ? 'Complejidad estimada: ' : 'Estimated complexity: ') +
            sizeLabels[estimate.complexity][lang] +
            '</strong></span><span class="ai-feature-cost">x' + estimate._mult + '</span></div>';

        detectedDiv.innerHTML = html;
    }

    document.getElementById('quoteAiAnalyze').addEventListener('click', async function() {
        var btn = this;
        var textarea = document.getElementById('quoteAiInput');
        var rawText = textarea.value.trim();

        if (!rawText || rawText.length < 20) {
            textarea.style.borderColor = '#EF4444';
            setTimeout(function() { textarea.style.borderColor = ''; }, 2000);
            return;
        }

        var lang = getLang();
        var originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-circle-notch"></i> ' + (lang === 'es' ? 'Analizando con IA...' : 'Analyzing with AI...');

        try {
            var analysis;
            try {
                analysis = await analyzeWithAI(rawText, lang);
            } catch (err) {
                console.warn('[quote] AI endpoint unavailable, using local keyword matcher:', err.message);
                analysis = analyzeLocally(rawText, lang);
            }

            state.aiEstimate = computeEstimate(analysis, rawText, lang);
            renderAiResult(state.aiEstimate, lang);
            updateSummary();

            setTimeout(function() {
                document.getElementById('quoteAiResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
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
                var sizeLabels2 = { small: lang === 'es' ? 'Pequeño' : 'Small', medium: lang === 'es' ? 'Mediano' : 'Medium', large: lang === 'es' ? 'Grande' : 'Large' };
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

        summaryDiv.innerHTML = lines.map(function(l) { return '<p>' + escapeHtml(l) + '</p>'; }).join('');
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

    // Re-render features and recalculate prices when language/market changes.
    // applyLanguage() dispatches 'lang:changed' after the key loop, so the
    // active-language button state is already final here (no setTimeout race).
    document.addEventListener('lang:changed', function() {
        if (state.projectType) {
            state.basePrice = getMarketBasePrice(state.projectType);
            renderFeatures();
            // Recalculate features total with new market prices
            state.featuresTotal = 0;
            state.selectedFeatures = [];
        }
        updateSummary();
    });
})();

// ========== ANIMATED FLOW DIAGRAMS + POLISH ==========
(function () {
    'use strict';
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // --- Animated flow diagrams: reveal (draw path + light up nodes) on view ---
    var flows = document.querySelectorAll('[data-flow]');
    if (flows.length) {
        if (reduce) {
            flows.forEach(function (f) {
                f.classList.add('flow-visible');
                var svg = f.querySelector('svg');
                if (svg && typeof svg.pauseAnimations === 'function') {
                    try { svg.pauseAnimations(); } catch (e) { /* ignore */ }
                }
            });
        } else if ('IntersectionObserver' in window) {
            var fObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('flow-visible');
                        fObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
            flows.forEach(function (f) { fObs.observe(f); });
        } else {
            flows.forEach(function (f) { f.classList.add('flow-visible'); });
        }
    }

    // --- Scroll progress bar ---
    if (!reduce) {
        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        (document.body || document.documentElement).appendChild(bar);
        var ticking = false;
        function updateBar() {
            ticking = false;
            var doc = document.documentElement;
            var scrollable = (doc.scrollHeight - doc.clientHeight) || 1;
            var p = Math.min(Math.max(window.pageYOffset / scrollable, 0), 1);
            bar.style.transform = 'scaleX(' + p + ')';
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(updateBar); }
        }, { passive: true });
        updateBar();
    }

    // NOTE: 3D tilt / cursor-spotlight removed — banned by the Operating Ledger motion system.
})();

// ========== LIVE GMT-6 CLOCK ==========
(function () {
    var clocks = document.querySelectorAll('.clock[data-clock]');
    if (!clocks.length) return;

    var formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/El_Salvador',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    function render() {
        var now = formatter.format(new Date());
        clocks.forEach(function (c) { c.textContent = now; });
    }

    render(); // paint immediately
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!reduce) setInterval(render, 1000); // frozen at load time under reduced motion
})();

// ========== STICKY PILL ==========
(function () {
    var pill = document.getElementById('stickyPill');
    if (!pill) return;

    var DISMISS_KEY = 'hh_pill_dismissed';
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { /* storage unavailable */ }
    if (dismissed) return; // never show again this session

    // The quote modal's open/close functions live inside the estimator IIFE,
    // so track its visibility via a MutationObserver on the overlay instead.
    var modalOpen = false;
    var modal = document.getElementById('quoteModal');
    if (modal && 'MutationObserver' in window) {
        var mo = new MutationObserver(function () {
            modalOpen = window.getComputedStyle(modal).display !== 'none';
            update();
        });
        mo.observe(modal, { attributes: true, attributeFilter: ['style', 'hidden'] });
    }

    function update() {
        if (dismissed) return;
        var doc = document.documentElement;
        var scrollable = (doc.scrollHeight - doc.clientHeight) || 1;
        var pastThreshold = (window.pageYOffset / scrollable) > 0.6;
        if (pastThreshold && !modalOpen) {
            pill.removeAttribute('hidden');
            pill.classList.add('visible');
        } else {
            pill.classList.remove('visible');
        }
    }

    var dismissBtn = document.getElementById('pillDismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', function () {
            dismissed = true;
            pill.classList.remove('visible');
            pill.setAttribute('hidden', '');
            try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* storage unavailable */ }
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// ========== AI TEXTAREA — IDLE AUTO-TYPING PLACEHOLDER ==========
(function () {
    var textarea = document.getElementById('quoteAiInput');
    if (!textarea) return;

    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduce) return; // static placeholder (dict text set by applyLanguage)

    var stopped = false; // permanent stop once the visitor engages
    var timer = null;

    function currentText() {
        var lang = document.documentElement.lang === 'es' ? 'es' : 'en';
        return (translations[lang] && translations[lang]['quote-ai-placeholder']) || '';
    }

    function clearTimer() {
        if (timer) { clearTimeout(timer); timer = null; }
    }

    function stopPermanently() {
        if (stopped) return;
        stopped = true;
        clearTimer();
        textarea.placeholder = currentText(); // leave the full sample visible
    }

    function startLoop() {
        if (stopped) return;
        clearTimer();
        var text = currentText();
        if (!text) return;
        var i = 0;

        function typeNext() {
            if (stopped) return;
            if (i <= text.length) {
                textarea.placeholder = text.slice(0, i);
                i += 1;
                timer = setTimeout(typeNext, 40);
            } else {
                // pause at the end, then clear and loop
                timer = setTimeout(function () {
                    if (stopped) return;
                    textarea.placeholder = '';
                    i = 0;
                    timer = setTimeout(typeNext, 400);
                }, 2500);
            }
        }
        typeNext();
    }

    textarea.addEventListener('focus', stopPermanently);
    textarea.addEventListener('input', stopPermanently);

    document.addEventListener('lang:changed', function () {
        if (!stopped) startLoop(); // restart with the new language's text
    });

    startLoop();
})();
