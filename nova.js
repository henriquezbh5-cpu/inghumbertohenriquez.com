/* ============================================================
   NOVA — agente del expediente (inghumbertohenriquez.com)
   Widget flotante estilo Optimatiza: burbuja + panel de chat.
   CSP-safe (archivo externo, sin inline). Todo el texto entra
   al DOM via textContent: el contenido del modelo o del
   visitante jamas se interpreta como HTML.
   Backend: quote-ai.henriquezbh5.workers.dev/chat (Gemini).
   ============================================================ */
(function () {
    'use strict';

    var ENDPOINT = 'https://quote-ai.henriquezbh5.workers.dev/chat';
    var LS_SEEN = 'hh-nova-seen';
    var history = [];   // [{role:'user'|'nova', text}]
    var busy = false;

    /* ---------- helpers DOM ---------- */
    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    /* ---------- respuestas locales (si el worker no responde) ---------- */
    var FALLBACK = [
        [/power\s*automate|rpa|bot|flujo/i, 'Humberto ha construido mas de 170 bots y flujos con Power Automate Cloud y Desktop que hoy operan en 4 paises. Es Microsoft Certified PL-500, la certificacion especifica de RPA. Mira la seccion 03 — ARSENAL para el detalle.'],
        [/agente|ia\b|inteligencia|copilot|llm/i, 'De agentes sabe un rato: un agente en Copilot Studio publicado en Teams, un agente de vision que lee documentos con Gemini, bots de WhatsApp con maquina de estados... y yo misma, que soy uno de sus agentes. La seccion 04 — PROYECTOS tiene mas.'],
        [/estudi|maestr|certific|credencial|titulo/i, 'Dos maestrias (Ciencia de Datos e Inteligencia de Negocios), un posgrado en Blockchain, Ingenieria en Sistemas y triple certificacion Microsoft: PL-500, PL-100 y PL-300. Todo verificable en la seccion 02 — CREDENCIALES.'],
        [/contrat|contact|vacante|remoto|disponib|trabaj/i, 'Humberto esta abierto a roles remotos y proyectos. Lo mas rapido: WhatsApp +503 7192 8070 o el formulario de la seccion 05 — responde en menos de 24 horas. Tambien puedes descargar su CV en PDF ahi mismo.'],
        [/precio|cost|tarifa|cotiz|cuanto/i, 'Numeros exactos no doy — para eso esta el cotizador interactivo de la seccion 05, que estima tu proyecto en vivo. Para servicios de empresa, optimatiza.com.'],
        [/optimatiza/i, 'Optimatiza es el estudio que Humberto fundo: agentes de IA para ventas, cobros y soporte de pymes en Latinoamerica. Esta en optimatiza.com — y su NOVA de alla es prima mia.'],
        [/bitcoin|cripto|blockchain/i, 'Humberto creo Bitcoin Academy, una PWA educativa publicada en Google Play, y tiene un posgrado en Tecnologia Blockchain. Ademas construye indicadores propios en Pine Script.'],
    ];
    var FALLBACK_DEFAULT = 'Ahora mismo mi cerebro en la nube no responde, pero te cuento lo esencial: 170+ bots en produccion, agentes de IA reales, triple certificacion Microsoft y dos maestrias. Para lo demas, escribele directo: WhatsApp +503 7192 8070.';

    function localAnswer(q) {
        for (var i = 0; i < FALLBACK.length; i++) {
            if (FALLBACK[i][0].test(q)) return FALLBACK[i][1];
        }
        return FALLBACK_DEFAULT;
    }

    /* ---------- estructura ---------- */
    var root = el('div', 'nova');
    root.setAttribute('data-nova', '');

    // Burbuja + etiqueta "click me"
    // Mismo robot que NOVA usa en Optimatiza: la marca del agente es una sola.
    function botIcon(size) {
        var img = document.createElement('img');
        img.src = '/img/nova/avatar.webp';
        img.alt = '';
        img.width = size;
        img.height = size;
        img.decoding = 'async';
        return img;
    }

    var launcher = el('button', 'nova-launch');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Abrir chat con NOVA, el agente de Humberto');
    var core = el('span', 'nova-launch-core');
    core.appendChild(botIcon(34));
    launcher.appendChild(core);
    launcher.appendChild(el('span', 'nova-launch-ring'));

    var tag = el('button', 'nova-tag mono');
    tag.type = 'button';
    tag.appendChild(el('span', 'nova-tag-dot'));
    tag.appendChild(el('span', null, 'PREGÚNTAME SOBRE HUMBERTO'));

    // Panel
    var panel = el('section', 'nova-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat con NOVA');
    panel.hidden = true;

    var head = el('header', 'nova-head');
    var headId = el('div', 'nova-head-id');
    var avatar = el('span', 'nova-avatar');
    avatar.appendChild(botIcon(24));
    var headTxt = el('div', 'nova-head-txt');
    headTxt.appendChild(el('strong', null, 'NOVA'));
    headTxt.appendChild(el('span', 'mono', 'AGENTE DE HUMBERTO · EN LÍNEA'));
    headId.appendChild(avatar);
    headId.appendChild(headTxt);
    var closeBtn = el('button', 'nova-close mono', '✕');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Cerrar chat');
    head.appendChild(headId);
    head.appendChild(closeBtn);

    var feed = el('div', 'nova-feed');
    feed.setAttribute('aria-live', 'polite');

    var chipsWrap = el('div', 'nova-chips');
    var CHIPS = [
        '¿Qué ha construido con Power Automate?',
        '¿Qué agentes de IA ha hecho?',
        '¿Cuáles son sus credenciales?',
        '¿Cómo lo contacto?'
    ];

    var form = el('form', 'nova-form');
    var input = el('input', 'nova-input');
    input.type = 'text';
    input.maxLength = 600;
    input.placeholder = 'Pregúntame sobre Humberto...';
    input.setAttribute('aria-label', 'Tu pregunta para NOVA');
    var send = el('button', 'nova-send mono', '→');
    send.type = 'submit';
    send.setAttribute('aria-label', 'Enviar');
    form.appendChild(input);
    form.appendChild(send);

    var foot = el('p', 'nova-foot mono', 'NOVA ES UN AGENTE DE IA CONSTRUIDO POR HUMBERTO · PUEDE EQUIVOCARSE');

    panel.appendChild(head);
    panel.appendChild(feed);
    panel.appendChild(chipsWrap);
    panel.appendChild(form);
    panel.appendChild(foot);

    root.appendChild(panel);
    root.appendChild(tag);
    root.appendChild(launcher);

    /* ---------- mensajes ---------- */
    function addMsg(role, text) {
        var m = el('div', 'nova-msg is-' + role);
        m.appendChild(el('p', null, text));
        feed.appendChild(m);
        feed.scrollTop = feed.scrollHeight;
        return m;
    }

    function addTyping() {
        var m = el('div', 'nova-msg is-nova nova-typing');
        var w = el('span', 'nova-dots');
        w.appendChild(el('i')); w.appendChild(el('i')); w.appendChild(el('i'));
        m.appendChild(w);
        feed.appendChild(m);
        feed.scrollTop = feed.scrollHeight;
        return m;
    }

    function renderChips() {
        chipsWrap.replaceChildren();
        CHIPS.forEach(function (q) {
            var c = el('button', 'nova-chip', q);
            c.type = 'button';
            c.addEventListener('click', function () { ask(q); });
            chipsWrap.appendChild(c);
        });
    }

    function ask(q) {
        if (busy || !q) return;
        busy = true;
        send.disabled = true;
        chipsWrap.replaceChildren();
        addMsg('user', q);
        history.push({ role: 'user', text: q });
        var typing = addTyping();

        var finish = function (answer) {
            typing.remove();
            addMsg('nova', answer);
            history.push({ role: 'nova', text: answer });
            if (history.length > 16) history = history.slice(-16);
            busy = false;
            send.disabled = false;
            input.focus();
        };

        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var timeout = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);

        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q, history: history.slice(-8, -1) }),
            signal: ctrl ? ctrl.signal : undefined
        }).then(function (r) {
            if (r.status === 429) return { reply: 'Uy, me estás preguntando muy rápido — dame un minuto para recuperar el aliento. Mientras tanto, la sección 04 tiene los proyectos en producción.' };
            if (!r.ok) throw new Error('bad status ' + r.status);
            return r.json();
        }).then(function (d) {
            clearTimeout(timeout);
            finish((d && typeof d.reply === 'string' && d.reply.trim()) ? d.reply.trim() : localAnswer(q));
        }).catch(function () {
            clearTimeout(timeout);
            finish(localAnswer(q));
        });
    }

    /* ---------- abrir / cerrar ---------- */
    var opened = false;
    function openPanel() {
        panel.hidden = false;
        root.classList.add('is-open');
        tag.hidden = true;
        try { localStorage.setItem(LS_SEEN, '1'); } catch (e) { /* privado */ }
        if (!opened) {
            opened = true;
            addMsg('nova', 'Hola, soy NOVA — el agente de IA que Humberto construyó para este sitio. Sí, hablar conmigo ya es ver su trabajo en acción. ¿Qué quieres saber de él?');
            renderChips();
        }
        setTimeout(function () { input.focus(); }, 250);
    }
    function closePanel() {
        panel.hidden = true;
        root.classList.remove('is-open');
        tag.hidden = false;
    }

    launcher.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(); });
    tag.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = input.value.trim();
        if (!q) return;
        input.value = '';
        ask(q);
    });

    /* ---------- montaje ---------- */
    document.body.appendChild(root);

    // La etiqueta "click me" respira sola; si ya lo conoces, entra discreta.
    try {
        if (localStorage.getItem(LS_SEEN)) tag.classList.add('is-quiet');
    } catch (e) { /* privado */ }

    // La etiqueta no puede tapar contenido. Aparece solo cuando el
    // visitante ya dejó atrás la portada (donde vive el panel HH.LOG),
    // y se retira sola a los 8 s dejando únicamente la burbuja.
    var LS_TAG = 'hh-nova-tag-seen';
    tag.classList.add('is-early');
    var collapseTimer = 0;
    function releaseTag() {
        if (!tag.classList.contains('is-early')) return;
        // Se muestra una sola vez por sesión: cumple su función de invitar
        // sin convertirse en un estorbo permanente sobre el contenido.
        try {
            if (sessionStorage.getItem(LS_TAG)) return;
            sessionStorage.setItem(LS_TAG, '1');
        } catch (e) { /* privado */ }
        tag.classList.remove('is-early');
        collapseTimer = setTimeout(function () {
            if (!root.classList.contains('is-open')) tag.classList.add('is-collapsed');
        }, 7000);
    }
    function onScroll() {
        if (window.scrollY > 420) {
            window.removeEventListener('scroll', onScroll);
            releaseTag();
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // Si la página no tiene scroll suficiente, la etiqueta igual aparece.
    setTimeout(function () {
        if (document.documentElement.scrollHeight <= window.innerHeight + 420) releaseTag();
    }, 2500);
})();
