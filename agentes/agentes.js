/* ============================================================
   AGENT FLEET — SHEET 10 (/agentes/) — engine
   Classic script IIFE. Zero dependencies. CSP-safe. ES2019.
   Consumes: window.AGENTS (20), window.AGENT_CATEGORIES (8)
   Drives:   catalog render · i18n · hash router · <dialog> stage
             single-rAF simulator · terminal log · confetti ·
             scrollspy · reveals · conversion CTAs · page chrome
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------ */
  var doc = document;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  function fmtTime(ms) {
    ms = Math.max(0, Math.round(ms));
    var m = Math.floor(ms / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    var r = ms % 1000;
    return pad(m, 2) + ':' + pad(s, 2) + '.' + pad(r, 3);
  }

  /* decode entities + strip tags/arrows (for aria-label values) */
  var scratchEl = doc.createElement('div');
  function toText(html) {
    scratchEl.innerHTML = html;
    var t = scratchEl.textContent || '';
    return t.replace(/^[\s←→↓↑▸]+|[\s←→↓↑▸]+$/g, '');
  }

  var mqReduce = (window.matchMedia) ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }

  function warn(mod, err) { try { console.warn('[agentes] ' + mod + ':', err); } catch (e) { /* noop */ } }

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* noop */ } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* noop */ } }

  /* ------------------------------------------------------------
     1. DATA INDEXES
     ------------------------------------------------------------ */
  var AGENTS = (window.AGENTS && window.AGENTS.length) ? window.AGENTS : [];
  var CATS = (window.AGENT_CATEGORIES && window.AGENT_CATEGORIES.length) ? window.AGENT_CATEGORIES : [];

  var bySlug = {};      /* slug -> agent */
  var unitOf = {};      /* slug -> "A-01" */
  var catInfo = {};     /* catId -> { num:"C1", label:{es,en} } */

  AGENTS.forEach(function (a, i) {
    bySlug[a.slug] = a;
    unitOf[a.slug] = 'A-' + pad(i + 1, 2);
  });
  CATS.forEach(function (c, i) {
    catInfo[c.id] = { num: 'C' + (i + 1), label: c.label || { es: c.id, en: c.id } };
  });

  var WA_NUMBER = '50371928070';

  /* actor -> robot pose (task §6 binding) */
  var ACTOR_TO_ROBOT = {
    trigger: 'idle',
    agente: 'pensando',
    llm: 'pensando',
    herramienta: 'trabajando',
    sistema: 'trabajando',
    decision: 'decision',
    humano: 'esperando',
    resultado: 'exito'
  };
  var ROBOT_STATES = ['idle', 'pensando', 'trabajando', 'decision', 'esperando', 'exito'];

  /* actor -> phosphor glyph (verified against vendored subset;
     ph-user-check is NOT vendored -> ph-user fallback) */
  var ACTOR_ICON = {
    trigger: 'ph-lightning',
    agente: 'ph-robot',
    llm: 'ph-brain',
    herramienta: 'ph-wrench',
    sistema: 'ph-hard-drives',
    decision: 'ph-git-branch',
    humano: 'ph-user',
    resultado: 'ph-seal-check'
  };

  /* category -> icon (mirrors the rail icons in index.html) */
  var CAT_ICON = {
    ventas: 'ph-storefront',
    operaciones: 'ph-truck',
    finanzas: 'ph-receipt',
    soporte: 'ph-headset',
    datos: 'ph-chart-line-up',
    marketing: 'ph-megaphone',
    rrhh: 'ph-users-three',
    legal: 'ph-files'
  };

  var CONFETTI_COLORS = ['#F2EFE7', '#14B8A6', '#ECA24D', '#7FB4E0'];

  /* ------------------------------------------------------------
     2. I18N DICTIONARY — every data-i18n / data-i18n-aria key in
        index.html + engine-only keys (ag-x-*)
     ------------------------------------------------------------ */
  var AG_DICT = {
    es: {
      /* nav */
      'ag-nav-back': '&larr; Volver al documento',
      'ag-nav-how': 'C&oacute;mo funciona',
      'ag-nav-fleet': 'La flota',
      'ag-nav-pricing': 'Tarifario',
      'ag-nav-contact': 'Contacto',
      'ag-nav-cta': 'Cotizar',
      /* hero */
      'ag-doc-left': 'DOC. HH/2026 &mdash; L&Aacute;MINA 10 &middot; FLOTA DE AGENTES',
      'ag-doc-right': 'ESTADO &middot; 20 UNIDADES EN SERVICIO',
      'ag-ch-10': '10 &mdash; FLOTA DE AGENTES',
      'ag-hero-title': 'Veinte agentes de IA, <em>dibujados y en marcha.</em>',
      'ag-hero-sub': 'Cada unidad de esta l&aacute;mina es un patr&oacute;n real de automatizaci&oacute;n que implemento. No los leas: presiona play y mira el flujo completo correr, paso a paso, en tiempo real.',
      'ag-hero-cta1': 'Bajar a la sala de control &darr;',
      'ag-hero-cta2': 'Hablar con el ingeniero &rarr;',
      'ag-hero-strip': '20 UNIDADES &middot; 8 CATEGOR&Iacute;AS &middot; SIMULACIONES EN VIVO &middot; EST. 2026',
      'ag-hero-figcap': 'FIG. 10-0 &mdash; UNIDAD R-07, RECEPCI&Oacute;N DE FLOTA',
      /* how */
      'ag-como-index': '10.1 &mdash; INSTRUCCIONES DE LECTURA',
      'ag-como-title': '<em>C&oacute;mo leer esta sala</em>',
      'ag-como-1': '<strong>Elige una unidad.</strong> Cada tarjeta es un agente con un trabajo concreto.',
      'ag-como-2': '<strong>Corre la simulaci&oacute;n.</strong> El robot ejecuta el flujo real: disparadores, herramientas, decisiones.',
      'ag-como-3': '<strong>Lee el registro.</strong> La consola imprime lo que pasa de verdad, con marcas de tiempo.',
      'ag-como-4': '<strong>P&iacute;delo para tu operaci&oacute;n.</strong> Un mensaje y lo aterrizamos a tus sistemas.',
      /* floor */
      'ag-floor-index': 'SALA DE CONTROL &mdash; &Iacute;NDICE DE FLOTA',
      'ag-floor-title': 'El piso de operaciones.',
      'ag-floor-sub': 'Veinte unidades en servicio, agrupadas seg&uacute;n lo que te quitan de encima. Abre cualquier unidad para ver su corrida completa.',
      'ag-floor-proof': 'Estos patrones no son maquetas: nacen de sistemas que ya opero en producci&oacute;n. Ve un caso real construido &rarr;',
      'ag-legend-label': 'LEYENDA:',
      'ag-legend-trigger': 'DISPARADOR',
      'ag-legend-agent': 'AGENTE IA',
      'ag-legend-tool': 'HERRAMIENTA',
      'ag-legend-system': 'SISTEMA',
      'ag-legend-decision': 'DECISI&Oacute;N',
      'ag-legend-human': 'HUMANO',
      'ag-legend-result': 'RESULTADO',
      /* rail */
      'ag-cat-ventas': 'Ventas',
      'ag-cat-operaciones': 'Operaciones',
      'ag-cat-finanzas': 'Finanzas',
      'ag-cat-soporte': 'Soporte',
      'ag-cat-datos': 'Datos',
      'ag-cat-marketing': 'Marketing',
      'ag-cat-rrhh': 'RRHH',
      'ag-cat-legal': 'Legal',
      'ag-rail-foot': '&Iacute;NDICE DE LA L&Aacute;MINA 10 &middot; DESPL&Aacute;ZATE O SALTA',
      /* groups */
      'ag-group-ventas': 'C1 &mdash; VENTAS &middot; 2 UNIDADES',
      'ag-blurb-ventas': 'Responde antes de que tu competencia abra Excel.',
      'ag-group-operaciones': 'C2 &mdash; OPERACIONES &middot; 3 UNIDADES',
      'ag-blurb-operaciones': 'Inventario, &oacute;rdenes y env&iacute;os que se reportan solos.',
      'ag-group-finanzas': 'C3 &mdash; FINANZAS &middot; 3 UNIDADES',
      'ag-blurb-finanzas': 'El papel se persigue solo: facturas, recordatorios, caja visible.',
      'ag-group-soporte': 'C4 &mdash; SOPORTE &middot; 3 UNIDADES',
      'ag-blurb-soporte': 'Primera respuesta en segundos; humanos solo donde importan.',
      'ag-group-datos': 'C5 &mdash; DATOS &middot; 3 UNIDADES',
      'ag-blurb-datos': 'Informes que se escriben solos antes de que los pidas.',
      'ag-group-marketing': 'C6 &mdash; MARKETING &middot; 2 UNIDADES',
      'ag-blurb-marketing': 'Contenido y campa&ntilde;as que se producen, publican y miden solos.',
      'ag-group-rrhh': 'C7 &mdash; RRHH &middot; 2 UNIDADES',
      'ag-blurb-rrhh': 'Procesos de gente sin andar persiguiendo firmas.',
      'ag-group-legal': 'C8 &mdash; LEGAL &middot; 2 UNIDADES',
      'ag-blurb-legal': 'PDFs y contratos se vuelven datos estructurados y vigilados.',
      /* tarifario */
      'ag-tar-index': 'TARIFARIO &mdash; SOLO REFERENCIA',
      'ag-tar-title': 'Lo que cuesta una unidad.',
      'ag-tar-s': '<strong>Unidad simple &mdash; $600&ndash;1,200.</strong> Un flujo, una integraci&oacute;n, reglas fijas. ~1&ndash;2 semanas.',
      'ag-tar-m': '<strong>Unidad est&aacute;ndar &mdash; $1,200&ndash;3,000.</strong> Multi-paso, razonamiento IA, 2&ndash;3 integraciones, ciclo de aprobaci&oacute;n. ~2&ndash;4 semanas.',
      'ag-tar-l': '<strong>C&eacute;lula compuesta &mdash; $3,000&ndash;8,000.</strong> Varios agentes orquestados con memoria compartida y tableros. ~4&ndash;8 semanas.',
      'ag-tar-inc': 'Toda unidad incluye: dise&ntilde;o, construcci&oacute;n, pruebas, entrega documentada y 30 d&iacute;as de soporte post-lanzamiento.',
      'ag-tar-ref': 'PRECIOS DE REFERENCIA &mdash; EL N&Uacute;MERO REAL SALE DE UN DIAGN&Oacute;STICO DE 30 MINUTOS.',
      'ag-tar-cta': 'Cotiza tu caso exacto en 60 segundos &rarr;',
      /* contact */
      'ag-contact-index': '10.4 &mdash; CONTACTO DIRECTO',
      'ag-contact-title': '&iquest;Cu&aacute;l de estos procesos le est&aacute; comiendo horas a tu equipo?',
      'ag-contact-wa': 'Hablemos por WhatsApp',
      'ag-contact-reply': 'RESPUESTA &lt; 24H &middot; GMT-6',
      'ag-form-name': 'Nombre',
      'ag-form-email': 'Correo',
      'ag-form-msg': '&iquest;Qu&eacute; quieres automatizar?',
      'ag-form-send': 'ENVIAR',
      'ag-form-ok': 'Enviado. Respondo en menos de 24 horas.',
      'ag-form-privacy': 'Tus datos se procesan v&iacute;a Formspree solo para responderte. No se venden ni se usan para marketing.',
      /* footer */
      'ag-foot-back': '&larr; Volver al documento principal',
      'ag-foot-services': 'Servicios',
      'ag-foot-quote': 'Cotizador',
      'ag-foot-contact': 'Contacto',
      'ag-foot-line': 'L&Aacute;MINA 10 &middot; REV 2026.07 &middot; DIBUJADO A MANO &middot; CORRIDO POR M&Aacute;QUINAS',
      'ag-foot-copy': '&copy; 2026 Humberto Henr&iacute;quez. Todos los derechos reservados.',
      'ag-foot-privacy': 'Privacidad',
      'ag-foot-terms': 'T&eacute;rminos',
      'ag-pill-estimate': 'Cotizar',
      /* card + stage chrome */
      'ag-card-sim': '&#9656; VER SIMULACI&Oacute;N',
      'ag-term-title': 'REGISTRO DE OPERACI&Oacute;N',
      'ag-term-new': 'NUEVAS L&Iacute;NEAS',
      'ag-cta-want': 'QUIERO ESTE AGENTE',
      'ag-cta-demo': 'Solicitar demo &rarr;',
      'ag-keys': 'ESPACIO PAUSA &middot; R REINICIA &middot; &rarr; PASO &middot; ESC CIERRA',
      'ag-stamp': 'COMPLETADO &#10003;',
      /* skip link */
      'ag-skip': 'Saltar al contenido',
      /* aria (data-i18n-aria; applied as textContent) */
      'ag-aria-menu': 'Abrir men&uacute;',
      'ag-aria-legend': 'Leyenda de actores',
      'ag-aria-rail': '&Iacute;ndice de categor&iacute;as',
      'ag-aria-pill-dismiss': 'Cerrar',
      'ag-aria-close': 'Cerrar simulaci&oacute;n',
      'ag-aria-flow': 'Pasos del flujo',
      'ag-aria-log': 'Registro de la simulaci&oacute;n',
      'ag-aria-controls': 'Controles de simulaci&oacute;n',
      'ag-aria-play': 'Reproducir / pausar',
      'ag-aria-reset': 'Reiniciar',
      'ag-aria-step': 'Paso siguiente',
      'ag-aria-speed': 'Velocidad',
      'ag-aria-progress': 'Progreso de la simulaci&oacute;n',
      /* engine-only strings */
      'ag-x-boot': 'Registro iniciado &mdash; unidad {unit} &middot; rev 2026.07',
      'ag-x-replay': 'Repetir simulaci&oacute;n',
      'ag-x-stepper': 'USA &#9197; PARA AVANZAR PASO A PASO &middot; ESC CIERRA',
      'ag-x-steps': 'PASOS',
      'ag-x-actor-llm': 'LLM',
      'ag-x-step': 'Paso',
      'ag-x-of': 'de',
      'ag-x-steps-lc': 'pasos',
      'ag-x-open-sim': 'Ver simulaci&oacute;n de {name} &mdash; {rol}',
      'ag-x-form-fail': 'No se pudo enviar el formulario en este momento.',
      'ag-x-form-fail-wa': 'Env&iacute;alo por WhatsApp &rarr;',
      'ag-x-form-sending': 'Enviando&hellip;'
    },
    en: {
      /* nav */
      'ag-nav-back': '&larr; Back to the ledger',
      'ag-nav-how': 'How it works',
      'ag-nav-fleet': 'The fleet',
      'ag-nav-pricing': 'Pricing',
      'ag-nav-contact': 'Contact',
      'ag-nav-cta': 'Estimate',
      /* hero */
      'ag-doc-left': 'DOC. HH/2026 &mdash; SHEET 10 &middot; AGENT FLEET',
      'ag-doc-right': 'STATUS &middot; 20 UNITS IN SERVICE',
      'ag-ch-10': '10 &mdash; AGENT FLEET',
      'ag-hero-title': 'Twenty AI agents, <em>drawn and running.</em>',
      'ag-hero-sub': 'Each unit on this sheet is a real automation pattern I implement. Don&rsquo;t read about them &mdash; press play and watch the full workflow run, step by step, in real time.',
      'ag-hero-cta1': 'Enter the control room &darr;',
      'ag-hero-cta2': 'Talk to the engineer &rarr;',
      'ag-hero-strip': '20 UNITS &middot; 8 CATEGORIES &middot; LIVE SIMULATIONS &middot; EST. 2026',
      'ag-hero-figcap': 'FIG. 10-0 &mdash; UNIT R-07, FLEET GREETER',
      /* how */
      'ag-como-index': '10.1 &mdash; READING INSTRUCTIONS',
      'ag-como-title': '<em>How to read this room</em>',
      'ag-como-1': '<strong>Pick a unit.</strong> Every card is one agent with one concrete job.',
      'ag-como-2': '<strong>Run the simulation.</strong> The robot executes the real workflow: triggers, tools, decisions.',
      'ag-como-3': '<strong>Read the log.</strong> The console prints what actually happens, with timestamps.',
      'ag-como-4': '<strong>Order it for your operation.</strong> One message and we scope it to your systems.',
      /* floor */
      'ag-floor-index': 'CONTROL ROOM &mdash; FLEET INDEX',
      'ag-floor-title': 'The operations floor.',
      'ag-floor-sub': 'Twenty units in service, grouped by what they take off your plate. Open any unit to watch its full run.',
      'ag-floor-proof': 'These patterns aren&rsquo;t mockups &mdash; they come from systems I already run in production. See a real build &rarr;',
      'ag-legend-label': 'KEY:',
      'ag-legend-trigger': 'TRIGGER',
      'ag-legend-agent': 'AI AGENT',
      'ag-legend-tool': 'TOOL',
      'ag-legend-system': 'SYSTEM',
      'ag-legend-decision': 'DECISION',
      'ag-legend-human': 'HUMAN',
      'ag-legend-result': 'RESULT',
      /* rail */
      'ag-cat-ventas': 'Sales',
      'ag-cat-operaciones': 'Operations',
      'ag-cat-finanzas': 'Finance',
      'ag-cat-soporte': 'Support',
      'ag-cat-datos': 'Data',
      'ag-cat-marketing': 'Marketing',
      'ag-cat-rrhh': 'HR',
      'ag-cat-legal': 'Legal',
      'ag-rail-foot': 'INDEX OF SHEET 10 &middot; SCROLL OR JUMP',
      /* groups */
      'ag-group-ventas': 'C1 &mdash; SALES &middot; 2 UNITS',
      'ag-blurb-ventas': 'Answer faster than your competition can open Excel.',
      'ag-group-operaciones': 'C2 &mdash; OPERATIONS &middot; 3 UNITS',
      'ag-blurb-operaciones': 'Stock, purchase orders and shipments that report themselves.',
      'ag-group-finanzas': 'C3 &mdash; FINANCE &middot; 3 UNITS',
      'ag-blurb-finanzas': 'Paper chases itself: invoices, reminders, cash visibility.',
      'ag-group-soporte': 'C4 &mdash; SUPPORT &middot; 3 UNITS',
      'ag-blurb-soporte': 'First response in seconds; humans only where they matter.',
      'ag-group-datos': 'C5 &mdash; DATA &middot; 3 UNITS',
      'ag-blurb-datos': 'Reports that write themselves before you ask.',
      'ag-group-marketing': 'C6 &mdash; MARKETING &middot; 2 UNITS',
      'ag-blurb-marketing': 'Content and campaigns that produce, publish and measure themselves.',
      'ag-group-rrhh': 'C7 &mdash; HR &middot; 2 UNITS',
      'ag-blurb-rrhh': 'People processes without the chase-and-remind overhead.',
      'ag-group-legal': 'C8 &mdash; LEGAL &middot; 2 UNITS',
      'ag-blurb-legal': 'PDFs and contracts become structured, supervised data.',
      /* tarifario */
      'ag-tar-index': 'RATE CARD &mdash; REFERENCE ONLY',
      'ag-tar-title': 'What a unit costs.',
      'ag-tar-s': '<strong>Simple unit &mdash; $600&ndash;1,200.</strong> One workflow, one integration, fixed rules. ~1&ndash;2 weeks.',
      'ag-tar-m': '<strong>Standard unit &mdash; $1,200&ndash;3,000.</strong> Multi-step, AI reasoning, 2&ndash;3 integrations, approval loop. ~2&ndash;4 weeks.',
      'ag-tar-l': '<strong>Composite cell &mdash; $3,000&ndash;8,000.</strong> Several agents orchestrated with shared memory and dashboards. ~4&ndash;8 weeks.',
      'ag-tar-inc': 'Every unit ships with: design, build, testing, documented handover and 30 days of post-launch support.',
      'ag-tar-ref': 'REFERENCE PRICES &mdash; THE REAL NUMBER COMES OUT OF A 30-MINUTE DIAGNOSTIC.',
      'ag-tar-cta': 'Estimate your exact case in 60 seconds &rarr;',
      /* contact */
      'ag-contact-index': '10.4 &mdash; DIRECT CONTACT',
      'ag-contact-title': 'Which of these processes is eating your team&rsquo;s hours?',
      'ag-contact-wa': 'Let&rsquo;s talk on WhatsApp',
      'ag-contact-reply': 'REPLY &lt; 24H &middot; GMT-6',
      'ag-form-name': 'Name',
      'ag-form-email': 'Email',
      'ag-form-msg': 'What do you want to automate?',
      'ag-form-send': 'SEND',
      'ag-form-ok': 'Sent. I&rsquo;ll reply within 24 hours.',
      'ag-form-privacy': 'Your data is processed via Formspree only to reply to you. Never sold, never used for marketing.',
      /* footer */
      'ag-foot-back': '&larr; Back to the main document',
      'ag-foot-services': 'Services',
      'ag-foot-quote': 'Estimator',
      'ag-foot-contact': 'Contact',
      'ag-foot-line': 'SHEET 10 &middot; REV 2026.07 &middot; DRAWN BY HAND &middot; RUN BY MACHINES',
      'ag-foot-copy': '&copy; 2026 Humberto Henr&iacute;quez. All rights reserved.',
      'ag-foot-privacy': 'Privacy',
      'ag-foot-terms': 'Terms',
      'ag-pill-estimate': 'Estimate',
      /* card + stage chrome */
      'ag-card-sim': '&#9656; RUN SIMULATION',
      'ag-term-title': 'OPERATION LOG',
      'ag-term-new': 'NEW LINES',
      'ag-cta-want': 'I WANT THIS AGENT',
      'ag-cta-demo': 'Request a demo &rarr;',
      'ag-keys': 'SPACE PAUSE &middot; R RESET &middot; &rarr; STEP &middot; ESC CLOSE',
      'ag-stamp': 'COMPLETED &#10003;',
      /* skip link */
      'ag-skip': 'Skip to content',
      /* aria */
      'ag-aria-menu': 'Open menu',
      'ag-aria-legend': 'Actor legend',
      'ag-aria-rail': 'Category index',
      'ag-aria-pill-dismiss': 'Dismiss',
      'ag-aria-close': 'Close simulation',
      'ag-aria-flow': 'Workflow steps',
      'ag-aria-log': 'Simulation log',
      'ag-aria-controls': 'Simulation controls',
      'ag-aria-play': 'Play / pause',
      'ag-aria-reset': 'Reset',
      'ag-aria-step': 'Next step',
      'ag-aria-speed': 'Speed',
      'ag-aria-progress': 'Simulation progress',
      /* engine-only strings */
      'ag-x-boot': 'Log started &mdash; unit {unit} &middot; rev 2026.07',
      'ag-x-replay': 'Replay simulation',
      'ag-x-stepper': 'USE &#9197; TO STEP THROUGH THE WORKFLOW &middot; ESC CLOSES',
      'ag-x-steps': 'STEPS',
      'ag-x-actor-llm': 'LLM',
      'ag-x-step': 'Step',
      'ag-x-of': 'of',
      'ag-x-steps-lc': 'steps',
      'ag-x-open-sim': 'View the {name} simulation &mdash; {rol}',
      'ag-x-form-fail': 'The form couldn&rsquo;t be sent right now.',
      'ag-x-form-fail-wa': 'Send it by WhatsApp instead &rarr;',
      'ag-x-form-sending': 'Sending&hellip;'
    }
  };

  var currentLang = (lsGet('preferred-lang') === 'en') ? 'en' : 'es';

  function t(key) {
    var d = AG_DICT[currentLang] || AG_DICT.es;
    if (Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    if (Object.prototype.hasOwnProperty.call(AG_DICT.es, key)) return AG_DICT.es[key];
    return '';
  }
  function tt(key) { return toText(t(key)); }  /* plain-text variant */
  function pick(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[currentLang] || obj.es || obj.en || '';
  }

  function actorLabel(actor) {
    var map = {
      trigger: 'ag-legend-trigger', agente: 'ag-legend-agent', llm: 'ag-x-actor-llm',
      herramienta: 'ag-legend-tool', sistema: 'ag-legend-system', decision: 'ag-legend-decision',
      humano: 'ag-legend-human', resultado: 'ag-legend-result'
    };
    return tt(map[actor] || 'ag-legend-system');
  }

  /* ------------------------------------------------------------
     3. LANGUAGE APPLIER
     ------------------------------------------------------------ */
  function applyLang(lang) {
    try {
      currentLang = (lang === 'en') ? 'en' : 'es';
      doc.documentElement.lang = currentLang;
      var dict = AG_DICT[currentLang];

      $$('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (dict && Object.prototype.hasOwnProperty.call(dict, key)) el.innerHTML = dict[key];
      });
      $$('[data-i18n-aria]').forEach(function (el) {
        var key = el.getAttribute('data-i18n-aria');
        if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
          el.setAttribute('aria-label', toText(dict[key]));
        }
      });
      $$('.lang-btn').forEach(function (btn) {
        var isActive = btn.getAttribute('data-lang') === currentLang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      lsSet('preferred-lang', currentLang);
      try {
        doc.dispatchEvent(new CustomEvent('lang:changed', { detail: { lang: currentLang } }));
      } catch (e) { /* CustomEvent unavailable */ }
    } catch (err) { warn('applyLang', err); }
  }

  function initLangToggle() {
    $$('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang'));
      });
    });
  }

  /* ------------------------------------------------------------
     4. CSS COMPAT SHIM — agentes.css authored some hooks under
        different class names than the built HTML; alias at runtime
        so the authored styles apply. Purely additive.
     ------------------------------------------------------------ */
  function cssCompatShim() {
    var pairs = [
      ['.ag-floor-layout', 'floor-layout'],
      ['.rail-link', 'rail-item'],
      ['.ag-group-rule', 'group-rule'],
      ['.ag-group-blurb', 'group-blurb'],
      ['.ag-como', 'ag-how'],
      ['.como-grid', 'how-row'],
      ['.como-step', 'how-node'],
      ['.como-num', 'how-badge'],
      ['.como-ico', 'how-ico'],
      ['.tar-row', 'rate-row'],
      ['.tar-band', 'rate-band'],
      ['.tar-foot', 'rate-notes'],
      ['.ag-contact-layout', 'ag-contact-grid'],
      ['.ag-contact-reply', 'ag-reply-line']
    ];
    pairs.forEach(function (p) {
      $$(p[0]).forEach(function (el) { el.classList.add(p[1]); });
    });
  }

  /* ------------------------------------------------------------
     5. CATALOG RENDER — group AGENTS by categoria in
        AGENT_CATEGORIES order, clone #agCardTemplate per agent
     ------------------------------------------------------------ */
  var cardRefs = [];   /* { agent, article, catTag, alias, resumen, slabAfter, chip, link } */

  function renderCards() {
    var tpl = $('#agCardTemplate');
    if (!tpl || !tpl.content) { warn('renderCards', 'template #agCardTemplate missing'); return; }
    if (!AGENTS.length) { warn('renderCards', 'window.AGENTS empty'); return; }

    CATS.forEach(function (cat) {
      var grid = $('.ag-grid[data-cat="' + cat.id + '"]');
      if (!grid) { warn('renderCards', 'grid for category ' + cat.id + ' missing'); return; }
      AGENTS.forEach(function (agent) {
        if (agent.categoria !== cat.id) return;
        var frag = tpl.content.cloneNode(true);
        var article = frag.querySelector('.ag-card');
        if (!article) return;

        article.setAttribute('data-agent', agent.slug);

        var unitEl = frag.querySelector('.ag-unit');
        var catEl = frag.querySelector('.ag-cat-tag');
        var dotEl = frag.querySelector('.ag-live-dot');
        var idRow = frag.querySelector('.ag-card-id');
        var icoI = frag.querySelector('.ag-ico i');
        var nameEl = frag.querySelector('.ag-name');
        var aliasEl = frag.querySelector('.ag-alias');
        var resEl = frag.querySelector('.ag-resumen');
        var stackEl = frag.querySelector('.ag-stack');
        var slabB = frag.querySelector('.slab-before');
        var slabAr = frag.querySelector('.slab-arrow');
        var slabAf = frag.querySelector('.slab-after');
        var chipEl = frag.querySelector('.ag-card-chip');
        var linkEl = frag.querySelector('.ag-card-link');

        /* alias template classes to the CSS the stylesheet authored */
        if (dotEl) dotEl.classList.add('ag-dot');
        if (idRow) idRow.classList.add('ag-id-row');
        if (chipEl) chipEl.classList.add('ag-chip');

        if (unitEl) unitEl.textContent = unitOf[agent.slug];
        if (icoI) { icoI.className = 'ph ' + (CAT_ICON[agent.categoria] || 'ph-robot'); icoI.setAttribute('aria-hidden', 'true'); }
        if (nameEl) nameEl.textContent = agent.nombre || agent.slug;
        if (stackEl) stackEl.textContent = (agent.integraciones || []).slice(0, 4).join(' · ');
        /* data has a single qualitative metric (no before/after pair) —
           surface it on the teal side of the slab */
        if (slabB) slabB.hidden = true;
        if (slabAr) slabAr.hidden = true;
        if (linkEl) linkEl.setAttribute('href', '#' + agent.slug);

        var ref = {
          agent: agent, article: article, catTag: catEl, alias: aliasEl,
          resumen: resEl, slabAfter: slabAf, chip: chipEl, link: linkEl
        };
        cardRefs.push(ref);
        fillCardLang(ref);
        grid.appendChild(frag);
      });
    });
  }

  function fillCardLang(ref) {
    var agent = ref.agent;
    var ci = catInfo[agent.categoria] || { num: '', label: {} };
    if (ref.catTag) ref.catTag.textContent = (ci.num + ' — ' + pick(ci.label)).toUpperCase();
    if (ref.alias) ref.alias.textContent = pick(agent.rol);
    if (ref.resumen) ref.resumen.textContent = pick(agent.tagline);
    if (ref.slabAfter) ref.slabAfter.textContent = pick(agent.metricaDestacada);
    if (ref.chip) ref.chip.textContent = (agent.pasos || []).length + ' ' + tt('ag-x-steps');
    if (ref.link) {
      ref.link.setAttribute('aria-label',
        tt('ag-x-open-sim').replace('{name}', agent.nombre || agent.slug).replace('{rol}', pick(agent.rol)));
    }
  }

  function refreshCardsLang() {
    try { cardRefs.forEach(fillCardLang); } catch (err) { warn('refreshCardsLang', err); }
  }

  /* ------------------------------------------------------------
     6. REVEALS + CARD AWAKE (IntersectionObservers)
     ------------------------------------------------------------ */
  function initReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('.rv').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -4% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  }

  function initAwake() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle('awake', en.isIntersecting);
      });
    }, { threshold: 0.4 });
    $$('.ag-card').forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------
     7. CATEGORY RAIL — scrollspy + smooth jump
     ------------------------------------------------------------ */
  function initRail() {
    var links = $$('.rail-link');
    if (!links.length) return;
    var byCat = {};
    links.forEach(function (a) { byCat[a.getAttribute('data-cat')] = a; });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var cat = en.target.getAttribute('data-cat');
          links.forEach(function (a) {
            var on = a.getAttribute('data-cat') === cat;
            a.classList.toggle('on', on);
            if (on) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      $$('.ag-group').forEach(function (sec) { io.observe(sec); });
    }

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        var target = href.charAt(0) === '#' ? doc.getElementById(href.slice(1)) : null;
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
        try { history.replaceState(null, '', href); } catch (err) { /* noop */ }
      });
    });
  }

  /* ------------------------------------------------------------
     8. THE ENGINE — single master rAF, per-step state machine
     ------------------------------------------------------------ */
  var stage = $('#agStage');

  var refs = {
    unit: $('#agStageUnit'), title: $('#agStageTitle'), cat: $('#agStageCat'),
    closeBtn: $('#agStageClose'), bot: $('#agBot'), botTag: $('#agBotTag'),
    flow: $('#agFlow'), log: $('#agTermLog'), chip: $('#agTermChip'),
    termFile: $('#agTermFile'), playBtn: $('#agPlay'), resetBtn: $('#agReset'),
    stepBtn: $('#agStep'), progRail: $('#agProgRail'), prog: $('#agProg'),
    progMeta: $('#agProgMeta'), ctaWa: $('#agCtaWa'), ctaDemo: $('#agCtaDemo'),
    keys: $('.stage-keys', stage || doc), confetti: $('#agConfetti'), stamp: $('#agStamp'),
    speedBtns: stage ? $$('.ctl-speed button[data-speed]', stage) : []
  };

  var storedSpeed = parseFloat(ssGet('ag_speed'));
  var sim = {
    agent: null,
    idx: 0,
    t: 0,                 /* 0..1 progress inside current step */
    playing: false,
    userPaused: false,
    speed: (storedSpeed === 0.5 || storedSpeed === 1 || storedSpeed === 2) ? storedSpeed : 1,
    done: false,
    cum: [],              /* cumulative sim-ms at the START of each step */
    totalMs: 0,
    nodes: [],            /* { el, lab, paso } */
    conns: [],            /* connector elements, conns[j] joins node j -> j+1 */
    lines: [],            /* log line records */
    activeLine: null
  };

  var rafId = 0;
  var lastNow = 0;
  var autoplayTimer = 0;
  var clearTimer = 0;
  var lastAriaAt = 0;
  var lastPct = -1;
  var wasPlayingHidden = false;
  var rebuilding = false;   /* true while a staggered log clear + rebuild is in flight */

  function stepDur(i) {
    var p = sim.agent && sim.agent.pasos[i];
    return (p && p.duracionMs > 0) ? p.duracionMs : 1500;
  }
  function stepCount() { return sim.agent ? sim.agent.pasos.length : 0; }
  function elapsedMs() {
    if (!sim.agent) return 0;
    if (sim.done) return sim.totalMs;
    return (sim.cum[sim.idx] || 0) + sim.t * stepDur(sim.idx);
  }
  function perCharFor(durMs, len) {
    return Math.max(0.5, Math.min(45, (durMs * 0.6) / Math.max(1, len)));
  }

  /* ---- robot ---- */
  function setBotState(state, flashTrigger) {
    var f = refs.bot;
    if (!f) return;
    ROBOT_STATES.forEach(function (s) { f.classList.remove('rb-' + s); });
    f.classList.add('rb-' + state);
    f.setAttribute('data-bot-state', state);
    f.classList.remove('on-trigger');
    if (flashTrigger && !reduced()) {
      /* force reflow so the arcs/antenna one-shot animations restart */
      void f.offsetWidth;
      f.classList.add('on-trigger');
    }
  }

  /* ---- terminal ---- */
  function logNearBottom() {
    var l = refs.log;
    if (!l) return true;
    return (l.scrollHeight - l.scrollTop - l.clientHeight) <= 40;
  }
  function logScrollBottom(smooth) {
    var l = refs.log;
    if (!l) return;
    if (smooth && !reduced() && l.scrollTo) {
      try { l.scrollTo({ top: l.scrollHeight, behavior: 'smooth' }); return; } catch (e) { /* fallthrough */ }
    }
    l.scrollTop = l.scrollHeight;
  }
  function showChip() { if (refs.chip) refs.chip.hidden = false; }
  function hideChip() { if (refs.chip) refs.chip.hidden = true; }
  function afterLogWrite(wasNear) {
    if (wasNear) { logScrollBottom(false); hideChip(); }
    else showChip();
  }

  /*  pushLine: appends one console line.
      opts = { actor, tsMs, texts:{es,en}|string, durMs, instant, cls }  */
  function pushLine(opts) {
    var l = refs.log;
    if (!l) return null;
    var wasNear = logNearBottom();

    var full = (typeof opts.texts === 'string') ? opts.texts : pick(opts.texts);
    var line = {
      el: doc.createElement('div'),
      texts: opts.texts,
      actor: opts.actor,
      tsMs: opts.tsMs || 0,
      durMs: opts.durMs || 1500,
      full: full,
      typed: 0,
      perChar: perCharFor(opts.durMs || 1500, full.length),
      committed: false
    };
    line.el.className = 'tl' + (opts.cls ? ' ' + opts.cls : '');
    line.el.setAttribute('data-actor', opts.actor);

    var ts = doc.createElement('span');
    ts.className = 'tl-ts';
    ts.textContent = '[' + fmtTime(line.tsMs) + '] ';
    line.el.appendChild(ts);

    var actorEl = doc.createElement('span');
    actorEl.className = 'tl-actor';
    var ico = doc.createElement('i');
    ico.className = 'ph ' + (ACTOR_ICON[opts.actor] || 'ph-circle');
    ico.setAttribute('aria-hidden', 'true');
    actorEl.appendChild(ico);
    line.actorNameEl = doc.createTextNode(actorLabel(opts.actor));
    actorEl.appendChild(line.actorNameEl);
    line.el.appendChild(actorEl);

    var sep = doc.createElement('span');
    sep.className = 'tl-sep';
    sep.textContent = ' › ';
    line.el.appendChild(sep);

    /* SR strategy: hidden full text announced once; typed span is aria-hidden */
    line.srEl = doc.createElement('span');
    line.srEl.className = 'sr-only';
    line.srEl.textContent = full;
    line.el.appendChild(line.srEl);

    line.txtEl = doc.createElement('span');
    line.txtEl.className = 'tl-txt';
    line.txtEl.setAttribute('aria-hidden', 'true');
    line.el.appendChild(line.txtEl);

    line.caretEl = doc.createElement('span');
    line.caretEl.className = 'tl-caret';
    line.caretEl.setAttribute('aria-hidden', 'true');
    line.caretEl.textContent = '▌';
    line.el.appendChild(line.caretEl);

    if (opts.instant || reduced()) {
      line.txtEl.textContent = full;
      line.typed = full.length;
      line.committed = true;
      line.caretEl.remove();
      line.caretEl = null;
    } else {
      line.el.classList.add('tl-active');
    }

    l.appendChild(line.el);
    sim.lines.push(line);
    afterLogWrite(wasNear);
    return line;
  }

  function commitLine(line) {
    if (!line || line.committed) return;
    var wasNear = logNearBottom();
    line.txtEl.textContent = line.full;
    line.typed = line.full.length;
    line.committed = true;
    if (line.caretEl) { line.caretEl.remove(); line.caretEl = null; }
    line.el.classList.remove('tl-active');
    afterLogWrite(wasNear);
  }

  function clearLog(staggered, done) {
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = 0; }
    var l = refs.log;
    if (!l) { if (done) done(); return; }
    var kids = sim.lines.map(function (ln) { return ln.el; });
    sim.lines = [];
    sim.activeLine = null;

    if (!staggered || reduced() || !kids.length) {
      l.innerHTML = '';
      hideChip();
      if (done) done();
      return;
    }
    /* staggered fade-out, class + inline transition (no CSS dependency) */
    kids.forEach(function (el, i) {
      el.classList.add('tl-out');
      el.style.transition = 'opacity .16s ease';
      el.style.transitionDelay = (Math.min(i, 12) * 24) + 'ms';
      el.style.opacity = '0';
    });
    clearTimer = setTimeout(function () {
      clearTimer = 0;
      l.innerHTML = '';
      hideChip();
      if (done) done();
    }, Math.min(520, Math.min(kids.length, 13) * 24 + 220));
  }

  function bootTexts(agent) {
    var unit = unitOf[agent.slug] || 'A-00';
    return {
      es: toText(AG_DICT.es['ag-x-boot']).replace('{unit}', unit),
      en: toText(AG_DICT.en['ag-x-boot']).replace('{unit}', unit)
    };
  }

  /* ---- flow nodes ---- */
  function nodeAria(i) {
    var paso = sim.agent.pasos[i];
    return tt('ag-x-step') + ' ' + (i + 1) + ' ' + tt('ag-x-of') + ' ' + stepCount() + ': ' +
      pick(paso.titulo) + ' — ' + actorLabel(paso.actor);
  }

  /* edge fades signal horizontal overflow (desktop flow strip) */
  function updateFlowFades() {
    var el = refs.flow;
    if (!el) return;
    var max = el.scrollWidth - el.clientWidth;
    el.setAttribute('data-at-start', el.scrollLeft <= 1 ? 'true' : 'false');
    el.setAttribute('data-at-end', (max <= 1 || el.scrollLeft >= max - 1) ? 'true' : 'false');
  }

  function buildFlow(agent) {
    var flow = refs.flow;
    if (!flow) return;
    flow.innerHTML = '';
    sim.nodes = [];
    sim.conns = [];
    var n = agent.pasos.length;

    agent.pasos.forEach(function (paso, i) {
      var node = doc.createElement('div');
      node.className = 'fl-node';
      node.setAttribute('role', 'button');
      node.setAttribute('data-step', String(i));
      node.setAttribute('data-actor', paso.actor);
      node.setAttribute('data-state', 'pendiente');
      node.style.cursor = 'pointer';
      node.setAttribute('tabindex', '0');

      var ic = doc.createElement('span');
      ic.className = 'fl-ico';
      var ii = doc.createElement('i');
      ii.className = 'ph ' + (ACTOR_ICON[paso.actor] || 'ph-circle');
      ii.setAttribute('aria-hidden', 'true');
      ic.appendChild(ii);

      var svgNS = 'http://www.w3.org/2000/svg';
      var check = doc.createElementNS(svgNS, 'svg');
      check.setAttribute('class', 'fl-check');
      check.setAttribute('viewBox', '0 0 16 16');
      var path = doc.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M3 8.5l3.2 3.2L13 5');
      check.appendChild(path);
      ic.appendChild(check);
      node.appendChild(ic);

      var lab = doc.createElement('span');
      lab.className = 'fl-lab mono';
      lab.textContent = pick(paso.titulo);
      node.appendChild(lab);

      node.addEventListener('click', function () { goTo(i); });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          goTo(i);
        }
      });

      flow.appendChild(node);
      sim.nodes.push({ el: node, lab: lab, paso: paso });

      if (i < n - 1) {
        var conn = doc.createElement('div');
        conn.className = 'fl-conn';
        conn.setAttribute('data-conn', String(i));
        conn.setAttribute('aria-hidden', 'true');
        var fill = doc.createElement('span');
        fill.className = 'fl-conn-fill';
        conn.appendChild(fill);
        var pulse = doc.createElement('span');
        pulse.className = 'fl-conn-pulse';
        conn.appendChild(pulse);
        flow.appendChild(conn);
        sim.conns.push(conn);
      }
    });
    refreshNodeAria();
    /* duplicate listener registrations are ignored (same fn + options) */
    flow.addEventListener('scroll', updateFlowFades, { passive: true });
    updateFlowFades();
  }

  function refreshNodeAria() {
    if (!sim.agent) return;
    sim.nodes.forEach(function (nd, i) {
      nd.el.setAttribute('aria-label', nodeAria(i));
      nd.lab.textContent = pick(nd.paso.titulo);
    });
  }

  function setConnFill(j, v) {
    var c = sim.conns[j];
    if (c) c.style.setProperty('--fill', String(clamp(v, 0, 1)));
  }
  function setConnActive(j, on) {
    var c = sim.conns[j];
    if (c) c.classList.toggle('active', !!on);
  }

  /* ---- progress ---- */
  function buildTicks() {
    var rail = refs.progRail;
    if (!rail) return;
    $$('i', rail).forEach(function (el) { el.remove(); });
    var n = stepCount();
    for (var i = 1; i < n; i++) {
      var tick = doc.createElement('i');
      tick.style.left = ((sim.cum[i] / sim.totalMs) * 100).toFixed(3) + '%';
      rail.appendChild(tick);
    }
  }

  function updateProgress(force) {
    if (!sim.agent) return;
    var el = elapsedMs();
    var pct = sim.totalMs ? (el / sim.totalMs) * 100 : 0;
    if (refs.prog && (force || Math.abs(pct - lastPct) > 0.05)) {
      refs.prog.style.width = pct.toFixed(2) + '%';
      lastPct = pct;
    }
    if (refs.progMeta) {
      var n = stepCount();
      var stepNo = sim.done ? n : Math.min(n, sim.idx + 1);
      refs.progMeta.textContent = fmtTime(el) + ' · ' + Math.round(pct) + '% · ' + stepNo + '/' + n;
    }
    var nowMs = (window.performance && performance.now) ? performance.now() : Date.now();
    if (refs.prog && (force || nowMs - lastAriaAt >= 1000)) {
      lastAriaAt = nowMs;
      refs.prog.setAttribute('aria-valuenow', String(Math.round(pct)));
      var pos = sim.done ? stepCount() : (sim.idx + sim.t);
      refs.prog.setAttribute('aria-valuetext',
        pos.toFixed(1) + ' ' + tt('ag-x-of') + ' ' + stepCount() + ' ' + tt('ag-x-steps-lc'));
    }
  }

  /* ---- transport button chrome ---- */
  function updatePlayBtn() {
    var b = refs.playBtn;
    if (!b) return;
    var ic = b.querySelector('i');
    if (ic) ic.className = 'ph ' + (sim.done ? 'ph-arrow-clockwise' : (sim.playing ? 'ph-pause' : 'ph-play'));
    b.setAttribute('aria-pressed', sim.playing ? 'true' : 'false');
    b.setAttribute('aria-label', sim.done ? tt('ag-x-replay') : tt('ag-aria-play'));
  }

  function updateKeysHint() {
    if (!refs.keys) return;
    refs.keys.innerHTML = reduced() ? t('ag-x-stepper') : t('ag-keys');
  }

  /* ---- step lifecycle ---- */
  function enterStep(i) {
    sim.idx = i;
    var paso = sim.agent.pasos[i];

    var nd = sim.nodes[i];
    if (nd) {
      nd.el.setAttribute('data-state', 'activo');
      nd.el.setAttribute('aria-current', 'step');
      // keep the active node in view (9-node flows overflow horizontally on desktop)
      try {
        nd.el.scrollIntoView({
          behavior: reduced() ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      } catch (e) { /* older engines: ignore */ }
      updateFlowFades();
    }
    if (stage) stage.setAttribute('data-actor', paso.actor);
    setBotState(ACTOR_TO_ROBOT[paso.actor] || 'idle', paso.actor === 'trigger');

    sim.activeLine = pushLine({
      actor: paso.actor,
      tsMs: sim.cum[i] || 0,
      texts: paso.log || paso.titulo,
      durMs: stepDur(i),
      instant: reduced()
    });
  }

  function commitStep() {
    var i = sim.idx;
    var nd = sim.nodes[i];
    if (nd) {
      nd.el.setAttribute('data-state', 'completado');
      nd.el.removeAttribute('aria-current');
    }
    if (i > 0) { setConnFill(i - 1, 1); setConnActive(i - 1, false); }
    commitLine(sim.activeLine);
    sim.activeLine = null;
  }

  function finish() {
    commitStep();
    sim.done = true;
    sim.playing = false;
    sim.t = 1;
    if (stage) {
      stage.classList.remove('playing');
      stage.classList.add('finished');
      stage.setAttribute('data-actor', 'resultado');
    }
    setBotState('exito', false);
    /* resultado banner line (agent.resultado field) */
    if (sim.agent && sim.agent.resultado) {
      pushLine({
        actor: 'resultado', tsMs: sim.totalMs, texts: sim.agent.resultado,
        durMs: 1000, instant: true, cls: 'tl-result'
      });
    }
    if (refs.stamp) refs.stamp.hidden = false;
    updatePlayBtn();
    updateProgress(true);
    burstConfetti();
  }

  /* ---- master clock ---- */
  function ensureLoop() {
    if (rafId) return;                       /* double-rAF guard */
    lastNow = (window.performance && performance.now) ? performance.now() : Date.now();
    rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    rafId = 0;
    var dt = clamp(now - lastNow, 0, 100);   /* clamp against tab-jank jumps */
    lastNow = now;
    var need = false;

    try {
      if (stage && stage.open && sim.agent && sim.playing && !sim.done) {
        advance(dt * sim.speed);
        need = sim.playing && !sim.done;
      }
      if (confetti.active) {
        confettiTick(dt);
        need = need || confetti.active;
      }
      renderFrame(now);
    } catch (err) { warn('tick', err); need = false; }

    if (need) rafId = requestAnimationFrame(tick);
  }

  function advance(advMs) {
    var guard = 0;
    while (advMs > 0 && !sim.done && guard++ < 32) {
      var dur = stepDur(sim.idx);
      var remain = (1 - sim.t) * dur;
      if (advMs < remain) {
        sim.t += advMs / dur;
        advMs = 0;
      } else {
        advMs -= remain;
        sim.t = 1;
        if (sim.idx >= stepCount() - 1) { finish(); }
        else { commitStep(); sim.t = 0; enterStep(sim.idx + 1); }
      }
    }
  }

  function renderFrame() {
    if (!sim.agent || !stage || !stage.open) return;

    /* typewriter for the in-flight line (sim-time driven: pause/speed atomic) */
    var line = sim.activeLine;
    if (line && !line.committed) {
      var stepMs = sim.t * stepDur(sim.idx);
      var chars = Math.min(line.full.length, Math.floor(stepMs / line.perChar));
      if (chars !== line.typed) {
        var wasNear = logNearBottom();
        line.typed = chars;
        line.txtEl.textContent = line.full.slice(0, chars);
        afterLogWrite(wasNear);
      }
    }

    /* connector fill: conn i-1 fills over the first 25% of step i */
    if (sim.idx > 0 && !sim.done) {
      var fill = clamp(sim.t / 0.25, 0, 1);
      setConnFill(sim.idx - 1, fill);
      setConnActive(sim.idx - 1, sim.playing && fill < 1);
    }

    updateProgress(false);
  }

  /* ---- state rebuild (goTo / reset / open) ---- */
  function rebuildTo(k, staggeredClear, done) {
    if (!sim.agent) return;
    k = clamp(k, 0, stepCount() - 1);
    sim.done = false;
    sim.idx = k;
    sim.t = 0;

    if (stage) stage.classList.remove('finished');
    if (refs.stamp) refs.stamp.hidden = true;

    sim.nodes.forEach(function (nd, j) {
      nd.el.setAttribute('data-state', j < k ? 'completado' : 'pendiente');
      nd.el.removeAttribute('aria-current');
    });
    sim.conns.forEach(function (c, j) {
      setConnFill(j, j < k - 1 ? 1 : 0);
      setConnActive(j, false);
    });
    /* conns strictly between completed nodes are full; the one entering
       node k fills during step k — except when k=0 there is none */
    if (k > 0) setConnFill(k - 1, 0);
    for (var j = 0; j < k - 1; j++) setConnFill(j, 1);

    updatePlayBtn();

    rebuilding = true;
    clearLog(staggeredClear, function () {
      rebuilding = false;
      if (!sim.agent) return;
      pushLine({ actor: 'sistema', tsMs: 0, texts: bootTexts(sim.agent), durMs: 800, instant: true });
      for (var i = 0; i < k; i++) {
        var p = sim.agent.pasos[i];
        pushLine({ actor: p.actor, tsMs: sim.cum[i], texts: p.log || p.titulo, durMs: stepDur(i), instant: true });
      }
      enterStep(k);
      updateProgress(true);
      if (done) done();
    });
  }

  /* ---- transport ---- */
  function play() {
    if (!stage || !stage.open || !sim.agent) return;
    if (sim.done) { replay(); return; }
    if (rebuilding) { sim.userPaused = false; return; }  /* rebuild cb / autoplay will pick it up */
    cancelAutoplay();
    sim.userPaused = false;
    sim.playing = true;
    stage.classList.add('playing');
    updatePlayBtn();
    ensureLoop();
  }

  function pause(byUser) {
    sim.playing = false;
    if (byUser) sim.userPaused = true;
    if (stage) stage.classList.remove('playing');
    /* kill traveling pulse while paused */
    if (sim.idx > 0) setConnActive(sim.idx - 1, false);
    updatePlayBtn();
  }

  function togglePlay() {
    if (sim.done) { replay(); return; }
    if (sim.playing) pause(true);
    else play();
  }

  function reset() {
    if (!sim.agent) return;
    cancelAutoplay();
    sim.userPaused = false;            /* restart semantics, same as replay() */
    pause(false);
    setBotState('idle', false);
    if (stage) stage.setAttribute('data-actor', 'trigger');
    lastPct = -1;
    rebuildTo(0, true, function () {
      scheduleAutoplay(450);
    });
    updateProgress(true);
  }

  function replay() {
    sim.userPaused = false;
    cancelAutoplay();
    pause(false);
    rebuildTo(0, true, function () {
      if (!reduced()) play();
    });
  }

  function stepNext() {
    if (!sim.agent || sim.done || rebuilding) return;
    cancelAutoplay();
    pause(true);
    if (sim.idx >= stepCount() - 1) { finish(); return; }
    commitStep();
    sim.t = 0;
    enterStep(sim.idx + 1);
    /* paused: no rAF typewriter runs, so show the entered step's full line now
       (commitLine no-ops under reduced motion where pushLine already committed) */
    if (sim.activeLine) commitLine(sim.activeLine);
    updateProgress(true);
    renderFrame();
  }

  function stepBack() {
    if (!sim.agent || rebuilding) return;
    cancelAutoplay();
    pause(true);
    var target = sim.done ? stepCount() - 1 : Math.max(0, sim.idx - 1);
    rebuildTo(target, false);
    if (sim.activeLine) commitLine(sim.activeLine);
    renderFrame();
  }

  function goTo(k) {
    if (!sim.agent || rebuilding) return;
    cancelAutoplay();
    pause(true);
    rebuildTo(k, false);
    if (sim.activeLine) commitLine(sim.activeLine);
    renderFrame();
  }

  function setSpeed(v) {
    v = parseFloat(v);
    if (v !== 0.5 && v !== 1 && v !== 2) v = 1;
    sim.speed = v;      /* rate-based formula → live retiming, nothing to reschedule */
    ssSet('ag_speed', String(v));
    refs.speedBtns.forEach(function (b) {
      var on = parseFloat(b.getAttribute('data-speed')) === v;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function cancelAutoplay() {
    if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = 0; }
  }
  function scheduleAutoplay(ms) {
    cancelAutoplay();
    if (reduced()) { updateKeysHint(); return; }  /* stepper mode: stay paused */
    if (sim.userPaused) return;
    autoplayTimer = setTimeout(function () {
      autoplayTimer = 0;
      if (stage && stage.open && sim.agent && !sim.playing && !sim.done && !sim.userPaused) play();
    }, ms);
  }

  /* ------------------------------------------------------------
     9. CONFETTI — canvas particles on the SAME rAF, 1.4s life
     ------------------------------------------------------------ */
  var confetti = { parts: [], ctx: null, cv: null, dpr: 1, active: false };

  function burstConfetti() {
    try {
      if (reduced()) return;
      var cv = refs.confetti;
      if (!cv || !cv.getContext || !stage) return;
      var ctx = cv.getContext('2d');
      if (!ctx) return;
      var rect = stage.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      cv.width = Math.max(1, Math.round(rect.width * dpr));
      cv.height = Math.max(1, Math.round(rect.height * dpr));

      var count = (window.innerWidth < 768) ? 14 : 28;
      var cx = cv.width * 0.5;
      var cy = cv.height * 0.32;
      confetti.parts = [];
      for (var i = 0; i < count; i++) {
        var ang = -Math.PI / 2 + (Math.random() * 2 - 1) * (Math.PI / 3); /* up ±60° */
        var spd = (0.15 + Math.random() * 0.35) * dpr;                    /* px/ms */
        var shred = Math.random() < 0.65;                                 /* paper shreds + ticks */
        confetti.parts.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.02,
          life: 0, ttl: 1400,
          w: (shred ? 3 : 2) * dpr, h: (shred ? 8 : 2) * dpr,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        });
      }
      confetti.ctx = ctx;
      confetti.cv = cv;
      confetti.dpr = dpr;
      confetti.active = true;
      ensureLoop();
    } catch (err) { warn('confetti', err); }
  }

  function confettiTick(dt) {
    var ctx = confetti.ctx, cv = confetti.cv;
    if (!ctx || !cv) { confetti.active = false; return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    var g = 0.0011 * confetti.dpr;   /* px/ms² */
    var alive = [];
    confetti.parts.forEach(function (p) {
      p.life += dt;
      if (p.life >= p.ttl) return;
      p.vy += g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      var alpha = p.life > p.ttl - 320 ? (p.ttl - p.life) / 320 : 1;
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      alive.push(p);
    });
    confetti.parts = alive;
    if (!alive.length) {
      confetti.active = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
  }

  function stopConfetti() {
    confetti.parts = [];
    confetti.active = false;
    if (confetti.ctx && confetti.cv) confetti.ctx.clearRect(0, 0, confetti.cv.width, confetti.cv.height);
  }

  /* ------------------------------------------------------------
     10. STAGE BUILD + HASH ROUTER
     ------------------------------------------------------------ */
  var pushedOpen = false;
  var originEl = null;

  function buildStage(agent) {
    sim.agent = agent;
    sim.userPaused = false;
    sim.done = false;
    sim.idx = 0;
    sim.t = 0;
    lastPct = -1;

    /* cumulative timeline */
    sim.cum = [];
    sim.totalMs = 0;
    agent.pasos.forEach(function (p, i) {
      sim.cum[i] = sim.totalMs;
      sim.totalMs += (p.duracionMs > 0 ? p.duracionMs : 1500);
    });

    var ci = catInfo[agent.categoria] || { num: '', label: {} };
    if (refs.unit) refs.unit.textContent = unitOf[agent.slug];
    if (refs.title) refs.title.textContent = agent.nombre || agent.slug;
    if (refs.cat) refs.cat.textContent = (ci.num + ' — ' + pick(ci.label)).toUpperCase();
    if (refs.botTag) refs.botTag.textContent = unitOf[agent.slug];
    if (refs.termFile) refs.termFile.textContent = agent.slug + '.log';
    if (stage) {
      stage.classList.remove('playing', 'finished');
      stage.setAttribute('data-actor', agent.pasos[0] ? agent.pasos[0].actor : 'trigger');
    }
    if (refs.stamp) refs.stamp.hidden = true;

    stopConfetti();
    buildFlow(agent);
    buildTicks();
    setSpeed(sim.speed);
    setBotState('idle', false);
    updateKeysHint();
    rebuildTo(0, false);
    updatePlayBtn();
    updateProgress(true);
  }

  function teardownSim() {
    cancelAutoplay();
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = 0; }
    rebuilding = false;
    sim.playing = false;
    stopConfetti();
    if (stage) stage.classList.remove('playing');
  }

  function openStage(slug, push) {
    try {
      var agent = bySlug[slug];
      if (!agent || !stage || typeof stage.showModal !== 'function') return;

      var wasOpen = !!stage.open;
      teardownSim();
      if (!wasOpen) originEl = doc.activeElement;

      buildStage(agent);
      updateConversion(agent);

      if (!wasOpen) {
        try { stage.showModal(); } catch (e) { warn('showModal', e); return; }
        doc.body.style.overflow = 'hidden';
        try { stage.focus(); } catch (e) { /* noop */ }
      }

      pushedOpen = !!push;
      if (push) {
        try { history.pushState({ ag: slug }, '', '#' + slug); }
        catch (e) { location.hash = slug; }
      }

      pillUpdate();
      scheduleAutoplay(450);
    } catch (err) { warn('openStage', err); }
  }

  function closeNow() {
    try { if (stage && stage.open) stage.close(); } catch (err) { warn('closeNow', err); }
  }

  function requestClose() {
    try {
      if (pushedOpen) {
        pushedOpen = false;
        history.back();          /* popstate handler performs dialog.close() */
      } else {
        closeNow();
        if (slugFromHash()) {
          try { history.replaceState(null, '', location.pathname + location.search); }
          catch (e) { location.hash = ''; }
        }
      }
    } catch (err) { warn('requestClose', err); closeNow(); }
  }

  function slugFromHash() {
    var h = (location.hash || '').replace(/^#/, '');
    return bySlug[h] ? h : null;
  }

  function route() {
    try {
      var s = slugFromHash();
      if (s) {
        if (!stage || !stage.open || !sim.agent || sim.agent.slug !== s) openStage(s, false);
      } else if (stage && stage.open) {
        pushedOpen = false;
        closeNow();
      }
    } catch (err) { warn('route', err); }
  }

  function initRouter() {
    if (!stage) return;

    /* card link interception (delegated; cards are JS-rendered) */
    doc.addEventListener('click', function (e) {
      var tgt = e.target;
      if (!tgt || !tgt.closest) return;
      var a = tgt.closest('a.ag-card-link');
      if (!a) return;
      /* honor new-tab/window intent: let modified clicks fall through natively */
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var slug = (a.getAttribute('href') || '').replace(/^#/, '');
      if (!bySlug[slug]) return;
      e.preventDefault();
      openStage(slug, true);
    });

    window.addEventListener('popstate', route);
    window.addEventListener('hashchange', route);

    /* close paths */
    if (refs.closeBtn) refs.closeBtn.addEventListener('click', requestClose);
    stage.addEventListener('cancel', function (e) {   /* Esc */
      e.preventDefault();
      requestClose();
    });
    stage.addEventListener('click', function (e) {    /* backdrop */
      if (e.target !== stage) return;
      var r = stage.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) requestClose();
    });
    stage.addEventListener('close', function () {
      teardownSim();
      doc.body.style.overflow = '';
      pillUpdate();
      if (originEl && typeof originEl.focus === 'function') {
        try { originEl.focus(); } catch (e) { /* noop */ }
      }
      originEl = null;
    });

    /* deep link on load: no extra history entry; floor scrolled to the card */
    var s = slugFromHash();
    if (s) {
      try { history.replaceState(null, '', '#' + s); } catch (e) { /* noop */ }
      var card = $('.ag-card[data-agent="' + s + '"]');
      if (card && card.scrollIntoView) {
        try { card.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { /* noop */ }
      }
      openStage(s, false);
    }
  }

  /* ------------------------------------------------------------
     11. CONTROLS + KEYBOARD
     ------------------------------------------------------------ */
  function initControls() {
    if (!stage) return;
    if (refs.playBtn) refs.playBtn.addEventListener('click', togglePlay);
    if (refs.resetBtn) refs.resetBtn.addEventListener('click', reset);
    if (refs.stepBtn) refs.stepBtn.addEventListener('click', stepNext);
    refs.speedBtns.forEach(function (b) {
      b.addEventListener('click', function () { setSpeed(b.getAttribute('data-speed')); });
    });
    if (refs.chip) refs.chip.addEventListener('click', function () {
      logScrollBottom(true);
      hideChip();
    });
    if (refs.log) refs.log.addEventListener('scroll', function () {
      if (logNearBottom()) hideChip();
    }, { passive: true });

    /* keyboard — active only while dialog open, never inside inputs */
    doc.addEventListener('keydown', function (e) {
      try {
        if (!stage.open) return;
        var tgt = e.target;
        if (tgt && tgt.closest && tgt.closest('input, textarea, select, [contenteditable="true"]')) return;
        var k = e.key;
        if (k === ' ' || k === 'Spacebar') {
          /* let a focused button/link keep its native Space activation */
          if (tgt && tgt.closest && tgt.closest('button, a, [role="button"]')) return;
          e.preventDefault();
          togglePlay();
        } else if (k === 'r' || k === 'R') {
          e.preventDefault();
          reset();
        } else if (k === 'ArrowRight') {
          e.preventDefault();
          stepNext();
        } else if (k === 'ArrowLeft') {
          e.preventDefault();
          stepBack();
        }
      } catch (err) { warn('keys', err); }
    });

    /* tab hidden → pause without time jump; visible → resume */
    doc.addEventListener('visibilitychange', function () {
      try {
        if (doc.hidden) {
          wasPlayingHidden = sim.playing;
          if (sim.playing) pause(false);
        } else if (wasPlayingHidden && stage.open && !sim.userPaused && !sim.done) {
          wasPlayingHidden = false;
          play();
        }
      } catch (err) { warn('visibility', err); }
    });

    /* runtime reduced-motion flip */
    if (mqReduce) {
      var onMq = function () {
        try {
          updateKeysHint();
          if (reduced()) {
            cancelAutoplay();
            pause(false);   /* drop into stepper mode; scheduleAutoplay stays suppressed */
            if (sim.activeLine && !sim.activeLine.committed) commitLine(sim.activeLine);
            stopConfetti();
          }
        } catch (err) { warn('mq', err); }
      };
      if (mqReduce.addEventListener) mqReduce.addEventListener('change', onMq);
      else if (mqReduce.addListener) mqReduce.addListener(onMq);
    }
  }

  /* ------------------------------------------------------------
     12. CONVERSION — per-agent CTAs + form subject
     ------------------------------------------------------------ */
  function waText(agent) {
    if (currentLang === 'en') {
      return 'Hi Humberto — I’m interested in the ' + agent.nombre + ' agent (' +
        (agent.rol && agent.rol.en ? agent.rol.en : '') + '). Can we talk?';
    }
    return 'Hola Humberto — me interesa el agente ' + agent.nombre + ' (' +
      (agent.rol && agent.rol.es ? agent.rol.es : '') + '). ¿Podemos hablar?';
  }

  function updateConversion(agent) {
    try {
      if (!agent) return;
      if (refs.ctaWa) {
        refs.ctaWa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waText(agent));
      }
      if (refs.ctaDemo) refs.ctaDemo.href = '../#contacto';
      var subj = $('#agFormSubject');
      var af = $('#agFormAgent');
      if (subj) subj.value = 'Agent Fleet — ' + unitOf[agent.slug] + ' ' + agent.nombre;
      if (af) af.value = agent.slug;
    } catch (err) { warn('conversion', err); }
  }

  function initConversion() {
    if (refs.ctaDemo) {
      refs.ctaDemo.addEventListener('click', function () {
        if (sim.agent) ssSet('ag_interest', sim.agent.slug);
      });
    }
  }

  /* ------------------------------------------------------------
     13. CONTACT FORM — fetch submit + WhatsApp fallback
     ------------------------------------------------------------ */
  function initForm() {
    var form = $('#agContactForm');
    if (!form || !window.fetch) return;
    var okEl = $('#agFormOk');
    var fbEl = $('#agFormFallback');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.innerHTML : '';
      if (btn) { btn.innerHTML = t('ag-x-form-sending'); btn.disabled = true; }
      if (fbEl) fbEl.hidden = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (btn) { btn.innerHTML = original; btn.disabled = false; }
        if (res.ok) {
          form.reset();
          if (okEl) okEl.hidden = false;
        } else { showFallback(); }
      }).catch(function () {
        if (btn) { btn.innerHTML = original; btn.disabled = false; }
        showFallback();
      });

      function showFallback() {
        if (!fbEl) return;
        var msg = tt('ag-x-form-fail');
        var wa = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(
          currentLang === 'en'
            ? 'Hi Humberto — the Agent Fleet form failed, I want to automate a process.'
            : 'Hola Humberto — el formulario de Agent Fleet falló, quiero automatizar un proceso.');
        fbEl.textContent = msg + ' ';
        var a = doc.createElement('a');
        a.href = wa;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = tt('ag-x-form-fail-wa');
        fbEl.appendChild(a);
        fbEl.hidden = false;
      }
    });
  }

  /* ------------------------------------------------------------
     14. PAGE CHROME — clock, mobile nav, sticky pill
     ------------------------------------------------------------ */
  function initClock() {
    var clocks = $$('.clock[data-clock]');
    if (!clocks.length || !window.Intl || !Intl.DateTimeFormat) return;
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/El_Salvador', hour12: false,
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    function render() {
      var now = fmt.format(new Date());
      clocks.forEach(function (c) { c.textContent = now; });
    }
    render();
    if (!reduced()) setInterval(render, 1000);
  }

  function initNav() {
    var toggle = $('#navToggle');
    var links = $('#navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      links.classList.toggle('active');
      var icon = toggle.querySelector('i');
      var open = links.classList.contains('active');
      if (icon) icon.className = open ? 'ph ph-x' : 'ph ph-list';
      toggle.setAttribute('aria-expanded', String(open));
      doc.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('active');
        var icon = toggle.querySelector('i');
        if (icon) icon.className = 'ph ph-list';
        toggle.setAttribute('aria-expanded', 'false');
        doc.body.style.overflow = '';
      });
    });
  }

  var pillDismissed = ssGet('hh_pill_dismissed') === '1';

  function pillUpdate() {
    try {
      var pill = $('#stickyPill');
      if (!pill || pillDismissed) return;
      var show = (window.pageYOffset || 0) > 600 && !(stage && stage.open);
      if (show) {
        pill.removeAttribute('hidden');
        pill.classList.add('visible');
      } else {
        pill.classList.remove('visible');
      }
    } catch (err) { warn('pill', err); }
  }

  function initPill() {
    var pill = $('#stickyPill');
    if (!pill || pillDismissed) return;
    var btn = $('#pillDismiss');
    if (btn) {
      btn.addEventListener('click', function () {
        pillDismissed = true;
        pill.classList.remove('visible');
        pill.setAttribute('hidden', '');
        ssSet('hh_pill_dismissed', '1');
      });
    }
    window.addEventListener('scroll', pillUpdate, { passive: true });
    pillUpdate();
  }

  /* ------------------------------------------------------------
     15. LANGUAGE — live re-render of cards, stage and log
     ------------------------------------------------------------ */
  function onLangChanged() {
    try {
      refreshCardsLang();
      updateKeysHint();
      if (!sim.agent) return;

      /* stage chrome */
      var agent = sim.agent;
      var ci = catInfo[agent.categoria] || { num: '', label: {} };
      if (refs.cat) refs.cat.textContent = (ci.num + ' — ' + pick(ci.label)).toUpperCase();
      refreshNodeAria();
      updateConversion(agent);
      updatePlayBtn();
      updateProgress(true);

      /* console lines: committed lines swap to full text deterministically;
         the in-flight line restarts its typewriter at char 0.
         Mute the live region during the bulk rewrite so the whole log
         is not re-announced on every language switch. */
      if (refs.log) refs.log.setAttribute('aria-live', 'off');
      sim.lines.forEach(function (line) {
        var full = (typeof line.texts === 'string') ? line.texts : pick(line.texts);
        line.full = full;
        line.srEl.textContent = full;
        if (line.actorNameEl) line.actorNameEl.textContent = actorLabel(line.actor);
        if (line.committed) {
          line.txtEl.textContent = full;
          line.typed = full.length;
        } else {
          line.typed = 0;
          line.txtEl.textContent = '';
          line.perChar = perCharFor(line.durMs, full.length);
          if (reduced()) commitLine(line);
        }
      });
      if (refs.log) refs.log.setAttribute('aria-live', 'polite');
    } catch (err) { warn('lang:changed', err); }
  }

  /* ------------------------------------------------------------
     16. INIT
     ------------------------------------------------------------ */
  function init() {
    /* page reveal hook first so .rv rules arm before first paint */
    try { doc.documentElement.classList.add('js-anim'); } catch (e) { /* noop */ }

    try { cssCompatShim(); } catch (err) { warn('cssCompatShim', err); }
    try { renderCards(); } catch (err) { warn('renderCards', err); }
    try { initLangToggle(); } catch (err) { warn('initLangToggle', err); }
    try { doc.addEventListener('lang:changed', onLangChanged); } catch (err) { warn('langSub', err); }
    try { applyLang(currentLang); } catch (err) { warn('applyLangInit', err); }
    try { initReveals(); } catch (err) { warn('initReveals', err); }
    try { initAwake(); } catch (err) { warn('initAwake', err); }
    try { initRail(); } catch (err) { warn('initRail', err); }
    try { initControls(); } catch (err) { warn('initControls', err); }
    try { initConversion(); } catch (err) { warn('initConversion', err); }
    try { initForm(); } catch (err) { warn('initForm', err); }
    try { initClock(); } catch (err) { warn('initClock', err); }
    try { initNav(); } catch (err) { warn('initNav', err); }
    try { initPill(); } catch (err) { warn('initPill', err); }
    try { initRouter(); } catch (err) { warn('initRouter', err); }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();

})();
