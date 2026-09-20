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
        [/power\s*automate|rpa|bot|flujo/i, 'Humberto ha construido mas de 170 bots y flujos con Power Automate Cloud y Desktop que hoy operan en 4 paises: El Salvador, Guatemala, Costa Rica y Republica Dominicana. Lo usa a diario desde 2020. Mira Herramientas para el detalle.'],
        [/agente|ia\b|inteligencia|copilot|llm/i, 'De agentes sabe un rato: un agente en Copilot Studio publicado en Teams, un agente de vision que lee documentos con Gemini, bots de WhatsApp con maquina de estados... y yo misma, que soy uno de sus agentes. La sección Proyectos tiene más.'],
        [/estudi|maestr|certific|credencial|titulo/i, 'Cuatro titulos: Maestria en Ciencia de Datos (UNEATLANTICO, 2026), Maestria en Inteligencia de Negocios (UNINI Mexico, 2023), Posgrado en Tecnologia Blockchain (UTEC, 2022) e Ingenieria en Sistemas (UTEC, 2020). Y algo que no necesitas creerle a nadie: en el laboratorio hay 13 sistemas suyos que puedes ejecutar ahora mismo. La documentacion academica se pide por correo.'],
        [/contrat|contact|vacante|remoto|disponib|trabaj/i, 'Humberto esta abierto a roles remotos y proyectos. Lo mas rapido: WhatsApp +503 7192 8070 o el formulario de Contacto. Responde en horario hábil de El Salvador. Tambien puedes descargar su CV en PDF ahi mismo.'],
        [/precio|cost|tarifa|cotiz|cuanto/i, 'La inversión depende del alcance y de los sistemas involucrados. Describe tu proceso en Contacto o solicita una evaluación en optimatiza.com/contacto/ para recibir una propuesta.'],
        [/optimatiza/i, 'Optimatiza es el estudio que Humberto fundo: agentes de IA para ventas, cobros y soporte de pymes en Latinoamerica. Esta en optimatiza.com — y su NOVA de alla es prima mia.'],
        [/bitcoin|cripto|blockchain/i, 'Humberto creo Bitcoin Academy, una PWA educativa publicada en Google Play, y tiene un posgrado en Tecnologia Blockchain. Ademas construye indicadores propios en Pine Script.'],
    ];
    var FALLBACK_DEFAULT = 'Ahora mismo mi cerebro en la nube no responde, pero te cuento lo esencial: 170+ bots en produccion en 4 paises, 13 sistemas que puedes ejecutar tu mismo en el laboratorio, agentes de IA reales y cuatro titulos academicos. Para lo demas, escribele directo: WhatsApp +503 7192 8070.';

    function localAnswer(q) {
        for (var i = 0; i < FALLBACK.length; i++) {
            if (FALLBACK[i][0].test(q)) return FALLBACK[i][1];
        }
        return FALLBACK_DEFAULT;
    }

    /* ---------- estructura ---------- */
    var root = el('div', 'nova');
    root.setAttribute('data-nova', '');

    // Disparador accesible; la presentación interactiva vive en nova-companion.js.
    // Mismo robot que NOVA usa en Optimatiza: la marca del agente es una sola.
    function botIcon(size) {
        var img = document.createElement('img');
        img.src = '/img/nova/nova-head-256.webp';
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

    // Panel
    var panel = el('section', 'nova-panel');
    panel.id = 'novaPanel';
    launcher.setAttribute('aria-controls', 'novaPanel');
    launcher.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat con NOVA');
    panel.hidden = true;

    var head = el('header', 'nova-head');
    var headId = el('div', 'nova-head-id');
    var avatar = el('span', 'nova-avatar');
    avatar.appendChild(botIcon(24));
    var headTxt = el('div', 'nova-head-txt');
    headTxt.appendChild(el('strong', null, 'NOVA'));
    headTxt.appendChild(el('span', 'mono', 'ASISTENTE DE IA DE HUMBERTO'));
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

    var foot = el('p', 'nova-foot mono', 'El servicio de IA de Humberto procesa tu consulta y los mensajes recientes para responderte.');

    panel.appendChild(head);
    panel.appendChild(feed);
    panel.appendChild(chipsWrap);
    panel.appendChild(form);
    panel.appendChild(foot);

    root.appendChild(panel);
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
            if (!panel.hidden) input.focus();
        };

        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var timeout = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);

        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q, history: history.slice(-8, -1) }),
            signal: ctrl ? ctrl.signal : undefined
        }).then(function (r) {
            if (r.status === 429) return { reply: 'Uy, me estás preguntando muy rápido — dame un minuto para recuperar el aliento. Mientras tanto, la sección Proyectos muestra su trabajo.' };
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
        launcher.setAttribute('aria-expanded', 'true');
        root.classList.add('is-open');
        if (!opened) {
            opened = true;
            addMsg('nova', 'Hola, soy NOVA — el agente de IA que Humberto construyó para este sitio. Sí, hablar conmigo ya es ver su trabajo en acción. ¿Qué quieres saber de él?');
            renderChips();
        }
        setTimeout(function () { if (!panel.hidden) input.focus(); }, 250);
    }
    function closePanel() {
        panel.hidden = true;
        root.classList.remove('is-open');
        launcher.setAttribute('aria-expanded', 'false');
        launcher.focus();
    }

    launcher.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(); });
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

})();
