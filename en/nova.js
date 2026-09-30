/* ============================================================
   NOVA — agente del expediente (inghumbertohenriquez.com)
   Widget flotante estilo Optimatiza: burbuja + panel de chat.
   CSP-safe (archivo externo, sin inline). Todo el texto entra
   al DOM via textContent: el contenido del modelo o del
   visitante jamas se interpreta como HTML.
   Backend: quote-ai.henriquezbh5.workers.dev/chat (Gemini).
   ============================================================ */
(function () {
  "use strict";

  var ENDPOINT = "https://quote-ai.henriquezbh5.workers.dev/chat";
  var history = []; // [{role:'user'|'nova', text}]
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
    [
      /collaborat|ongoing|consult|team|hire|contact|remote|availab|work|colabora|recurrent|continui|acompa[ñn]|consultor|refuerzo|equipo|contrat|contact|vacante|remoto|disponib|trabaj/i,
      "Humberto can collaborate as a senior consultant in Power Platform, data and automation. Ongoing external support and consulting-firm support are provided through Optimatiza: optimatiza.com/en/acompanamiento-tecnologico/. You can also discuss a project or a fully remote role in the Contact section. Time commitment and start dates are agreed for each engagement.",
    ],
    [
      /power\s*automate|workflow|automation|rpa|bot|flujo/i,
      "Humberto uses Power Automate Cloud and Desktop RPA for approvals, notifications and data transfers. You can explore synthetic-data demonstrations in the laboratory; his profile explains his education and experience.",
    ],
    [
      /agent|artificial|ai\b|agente|ia\b|inteligencia|copilot|llm/i,
      "Humberto develops applied AI projects. Oficina Viva organizes 33 roles across 11 departments using a shared local model; Capturista Digital is a prototype with a simulated interface and notifications, optional external Gemini integration and actual XLSX writing. NOVA is this site's chat and uses an external service. See the published case studies for what has been demonstrated and which integrations remain pending.",
    ],
    [
      /educat|degree|master|credential|study|estudi|maestr|formaci[oó]n|certific|credencial|titulo/i,
      "Four qualifications: Master's Degree in Data Science (UNEATLANTICO, 2026), Master's Degree in Business Intelligence (UNINI Mexico, 2023), Postgraduate Qualification in Blockchain Technology (UTEC, 2022) and Systems Engineering degree (UTEC, 2020). You can also verify his work yourself: the laboratory has 13 of his systems you can run right now. Academic documentation is available on request by email.",
    ],
    [
      /price|rate|quote|fee|how much|precio|cost|tarifa|cotiz|cuanto/i,
      "Professional services are agreed according to scope, time commitment and the systems involved. You can discuss ongoing collaboration or a project in Contact, or explore support at optimatiza.com/en/acompanamiento-tecnologico/. Employment opportunities are discussed directly with Humberto.",
    ],
    [
      /optimatiza/i,
      "Optimatiza is the company Humberto founded to provide professional services in Power Platform, data, automation and applied AI. It offers projects and ongoing technology support for businesses and consulting firms. Explore the options at optimatiza.com/en/acompanamiento-tecnologico/.",
    ],
    [
      /bitcoin|cripto|blockchain/i,
      "Humberto created Bitcoin Academy, an educational PWA published on Google Play, and holds a postgraduate qualification in Blockchain Technology. He also builds custom Pine Script indicators.",
    ],
  ];
  var FALLBACK_DEFAULT =
    "The chat service is unavailable right now. You can explore the profile, publications and 13 laboratory demonstrations. Humberto works in applied AI, data and automation. Direct contact: WhatsApp +503 7192 8070.";

  function localAnswer(q) {
    for (var i = 0; i < FALLBACK.length; i++) {
      if (FALLBACK[i][0].test(q)) return FALLBACK[i][1];
    }
    return FALLBACK_DEFAULT;
  }

  /* ---------- estructura ---------- */
  var root = el("div", "nova");
  root.setAttribute("data-nova", "");

  // Disparador accesible; la presentación interactiva vive en nova-companion.js.
  // Mismo robot que NOVA usa en Optimatiza: la marca del agente es una sola.
  function botIcon(size) {
    var img = document.createElement("img");
    img.src = "/img/nova/nova-head-256.webp";
    img.alt = "";
    img.width = size;
    img.height = size;
    img.decoding = "async";
    return img;
  }

  var launcher = el("button", "nova-launch");
  launcher.type = "button";
  launcher.setAttribute(
    "aria-label",
    "Open chat with NOVA, Humberto's AI agent",
  );
  var core = el("span", "nova-launch-core");
  core.appendChild(botIcon(34));
  launcher.appendChild(core);

  // Panel
  var panel = el("section", "nova-panel");
  panel.id = "novaPanel";
  launcher.setAttribute("aria-controls", "novaPanel");
  launcher.setAttribute("aria-expanded", "false");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Chat with NOVA");
  panel.hidden = true;

  var head = el("header", "nova-head");
  var headId = el("div", "nova-head-id");
  var avatar = el("span", "nova-avatar");
  avatar.appendChild(botIcon(24));
  var headTxt = el("div", "nova-head-txt");
  headTxt.appendChild(el("strong", null, "NOVA"));
  headTxt.appendChild(el("span", "mono", "HUMBERTO'S AI ASSISTANT"));
  headId.appendChild(avatar);
  headId.appendChild(headTxt);
  var closeBtn = el("button", "nova-close mono", "✕");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  head.appendChild(headId);
  head.appendChild(closeBtn);

  var feed = el("div", "nova-feed");
  feed.setAttribute("aria-live", "polite");

  var chipsWrap = el("div", "nova-chips");
  var CHIPS = [
    "What has he built with Power Automate?",
    "What AI agents has he built?",
    "What is his educational background?",
    "How can we collaborate?",
  ];

  var form = el("form", "nova-form");
  var input = el("input", "nova-input");
  input.type = "text";
  input.maxLength = 600;
  input.placeholder = "Ask me about Humberto...";
  input.setAttribute("aria-label", "Your question for NOVA");
  var send = el("button", "nova-send mono", "→");
  send.type = "submit";
  send.setAttribute("aria-label", "Send");
  form.appendChild(input);
  form.appendChild(send);

  var foot = el(
    "p",
    "nova-foot mono",
    "Humberto's AI service processes your question and recent messages to respond.",
  );

  panel.appendChild(head);
  panel.appendChild(feed);
  panel.appendChild(chipsWrap);
  panel.appendChild(form);
  panel.appendChild(foot);

  root.appendChild(panel);
  root.appendChild(launcher);

  /* ---------- mensajes ---------- */
  function addMsg(role, text) {
    var m = el("div", "nova-msg is-" + role);
    m.appendChild(el("p", null, text));
    feed.appendChild(m);
    feed.scrollTop = feed.scrollHeight;
    return m;
  }

  function addTyping() {
    var m = el("div", "nova-msg is-nova nova-typing");
    var w = el("span", "nova-dots");
    w.appendChild(el("i"));
    w.appendChild(el("i"));
    w.appendChild(el("i"));
    m.appendChild(w);
    feed.appendChild(m);
    feed.scrollTop = feed.scrollHeight;
    return m;
  }

  function renderChips() {
    chipsWrap.replaceChildren();
    CHIPS.forEach(function (q) {
      var c = el("button", "nova-chip", q);
      c.type = "button";
      c.addEventListener("click", function () {
        ask(q);
      });
      chipsWrap.appendChild(c);
    });
  }

  function ask(q) {
    if (busy || !q) return;
    // Preserve keyboard focus before removing a focused suggestion button.
    if (panel.contains(document.activeElement)) input.focus();
    busy = true;
    send.disabled = true;
    chipsWrap.replaceChildren();
    addMsg("user", q);
    history.push({ role: "user", text: q });
    var typing = addTyping();

    var finish = function (answer) {
      typing.remove();
      addMsg("nova", answer);
      history.push({ role: "nova", text: answer });
      if (history.length > 16) history = history.slice(-16);
      busy = false;
      send.disabled = false;
      if (!panel.hidden && panel.contains(document.activeElement))
        input.focus();
    };

    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timeout = setTimeout(function () {
      if (ctrl) ctrl.abort();
    }, 20000);

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: q,
        locale: "en",
        history: history.slice(-8, -1),
      }),
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(function (r) {
        if (r.status === 429)
          return {
            reply:
              "You are asking questions a little too quickly. Give me a minute to catch up. Meanwhile, explore his work in the Projects section.",
          };
        if (!r.ok) throw new Error("bad status " + r.status);
        return r.json();
      })
      .then(function (d) {
        clearTimeout(timeout);
        finish(
          d && typeof d.reply === "string" && d.reply.trim()
            ? d.reply.trim()
            : localAnswer(q),
        );
      })
      .catch(function () {
        clearTimeout(timeout);
        finish(localAnswer(q));
      });
  }

  /* ---------- abrir / cerrar ---------- */
  var opened = false;
  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    if (!opened) {
      opened = true;
      addMsg(
        "nova",
        "Hi, I am NOVA, the AI agent Humberto built for this site. Talking with me is already a chance to see his work in action. What would you like to know about him?",
      );
      renderChips();
    }
    setTimeout(function () {
      if (!panel.hidden) input.focus();
    }, 250);
  }
  function closePanel() {
    panel.hidden = true;
    root.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", function () {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = "";
    ask(q);
  });

  /* ---------- montaje ---------- */
  document.body.appendChild(root);
})();
