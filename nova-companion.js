/* NOVA's presentation only. Chat requests and history stay in the existing widget. */
(() => {
  'use strict';
  const root = document.querySelector('#nova') || document.querySelector('[data-nova]');
  if (!root || root.dataset.novaCompanion) return;
  const launcher = root.querySelector('.nv-fab, .nova-launch');
  const panel = root.querySelector('.nv-panel, .nova-panel');
  const image = launcher?.querySelector('img');
  if (!launcher || !panel || !image) return;
  root.dataset.novaCompanion = 'ready';
  const personal = root.hasAttribute('data-nova');
  root.classList.add('nc-root');
  root.classList.toggle('nc-personal', personal);
  launcher.classList.add('nc-launcher');
  launcher.setAttribute('aria-controls', panel.id);
  const make = (tag, name) => { const node = document.createElement(tag); node.className = name; return node; };
  const float = make('span', 'nc-float');
  const look = make('span', 'nc-look');
  const mood = make('span', 'nc-mood');
  image.replaceWith(float); float.appendChild(look); look.appendChild(mood); mood.appendChild(image);
  float.setAttribute('aria-hidden', 'true');

  const invite = make('aside', 'nc-invite');
  invite.hidden = true;
  const bar = make('div', 'nc-invite-bar');
  const name = make('span', 'nc-name');
  const pause = make('button', 'nc-control nc-pause');
  const dismiss = make('button', 'nc-control nc-dismiss');
  pause.type = dismiss.type = 'button';
  dismiss.textContent = '×';
  const ask = make('button', 'nc-ask');
  ask.type = 'button';
  ask.setAttribute('aria-controls', panel.id);
  const title = make('strong', 'nc-title');
  const description = make('span', 'nc-description');
  const cta = make('span', 'nc-cta');
  ask.append(title, description, cta);
  bar.append(name, pause, dismiss); invite.append(bar, ask); root.appendChild(invite);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection;
  const PAUSE_KEY = 'nova-companion-paused';
  const SEEN_KEY = 'nova-companion-invited-v1';
  const hasPageMotion = !!document.querySelector(personal ? 'script[src*="cosmos.js"]' : 'script[src*="experience.js"]');
  let userPaused = false, seen = false, storedPagePause = false;
  try {
    userPaused = localStorage.getItem(PAUSE_KEY) === 'true';
    seen = sessionStorage.getItem(SEEN_KEY) === 'true';
    storedPagePause = personal ? localStorage.getItem('hh-motion-paused') === 'true' : sessionStorage.getItem('optimatiza-motion-paused') === 'true';
  } catch (_) {}
  let near = false, nearReady = false, nearTimer = 0, inside = false, focused = false, overLauncher = false, suppressed = false;
  let autoShowing = false, autoStart = 0, autoEnd = 0, frame = 0, x = 0, y = 0;
  let pageHidden = document.hidden, printing = false, wasOpen = !panel.hidden;
  const isOpen = () => !panel.hidden;
  const pagePaused = () => document.documentElement.classList.contains('motion-paused') || !!window.hhMotion?.paused || (!hasPageMotion && storedPagePause);
  const policyPaused = () => reduced.matches || !!connection?.saveData || pagePaused();
  const motionBlocked = () => userPaused || policyPaused() || pageHidden || document.hidden || printing || isOpen();
  const english = () => !personal && /^en\b/i.test(document.documentElement.lang || 'es');

  function copy() {
    const en = english(), welcoming = near || inside || focused;
    name.textContent = en ? 'NOVA · YOUR GUIDE' : 'NOVA · TU GUÍA';
    invite.setAttribute('aria-label', en ? 'An invitation from NOVA' : 'Invitación de NOVA');
    title.textContent = personal
      ? (welcoming ? '¡Hola! ¿Qué te gustaría saber?' : '¿Quieres conocer a Humberto?')
      : (en ? (welcoming ? 'Hi! Tell me about your idea.' : 'Have a process in mind?')
            : (welcoming ? '¡Hola! Cuéntame tu idea.' : '¿Tienes un proceso en mente?'));
    description.textContent = personal
      ? 'Pregúntame por su experiencia, sus proyectos o cómo contactarlo.'
      : (en ? 'Ask me about Power Platform, automation and AI agents at Optimatiza.'
            : 'Te guío por Power Platform, automatización y agentes de IA en Optimatiza.');
    cta.textContent = en ? 'Ask NOVA →' : 'Preguntar a NOVA →';
    const closeLabel = en ? 'Hide invitation' : 'Ocultar invitación';
    dismiss.setAttribute('aria-label', closeLabel); dismiss.title = closeLabel;
    const paused = userPaused || policyPaused();
    const pauseLabel = policyPaused()
      ? (en ? 'Motion is paused by your page or device preference' : 'Movimiento en pausa por la página o tu dispositivo')
      : (paused ? (en ? 'Resume NOVA motion' : 'Reanudar movimiento de NOVA') : (en ? 'Pause NOVA motion' : 'Pausar movimiento de NOVA'));
    pause.textContent = paused ? '▷' : 'Ⅱ';
    pause.title = pauseLabel; pause.setAttribute('aria-label', pauseLabel);
    pause.setAttribute('aria-pressed', String(paused)); pause.disabled = !!policyPaused();
  }
  function syncInvite() {
    copy();
    invite.hidden = isOpen() || pageHidden || document.hidden || printing || suppressed || !(autoShowing || nearReady || inside || focused);
  }
  function resetLook() {
    look.style.removeProperty('--nc-x'); look.style.removeProperty('--nc-y'); look.style.removeProperty('--nc-turn');
  }
  function syncMotion() {
    const blocked = motionBlocked();
    root.classList.toggle('nc-still', blocked);
    root.classList.toggle('nc-engaged', inside || overLauncher || focused);
    if (blocked) {
      if (frame) cancelAnimationFrame(frame); frame = 0;
      root.classList.remove('nc-greet'); resetLook();
    }
    syncInvite();
  }
  function markSeen() { seen = true; try { sessionStorage.setItem(SEEN_KEY, 'true'); } catch (_) {} }
  function cancelGreetingTimers() { clearTimeout(autoStart); clearTimeout(autoEnd); autoStart = autoEnd = 0; }
  function scheduleGreeting() {
    if (seen || autoStart || pageHidden || document.hidden || printing || isOpen()) return;
    autoStart = setTimeout(() => {
      autoStart = 0;
      if (pageHidden || document.hidden || printing || isOpen() || suppressed) return;
      markSeen(); autoShowing = true; syncInvite();
      autoEnd = setTimeout(() => { autoEnd = 0; autoShowing = false; syncInvite(); }, 10000);
    }, 4000);
  }
  function setNear(value) {
    if (near === value) return;
    near = value; root.classList.toggle('nc-near', near);
    if (near && !motionBlocked() && !overLauncher && !focused) root.classList.add('nc-greet');
    clearTimeout(nearTimer); nearTimer = 0; nearReady = false;
    if (near) nearTimer = setTimeout(() => { nearTimer = 0; nearReady = near; syncInvite(); }, 350);
    else { root.classList.remove('nc-greet'); if (!inside && !focused) suppressed = false; }
    syncInvite();
  }
  function follow() {
    frame = 0;
    if (motionBlocked() || !fine.matches) { resetLook(); return; }
    const box = launcher.getBoundingClientRect();
    const dx = x - (box.left + box.width / 2), dy = y - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy);
    setNear(distance < (near ? 290 : 230));
    if (overLauncher || focused) { resetLook(); return; }
    const strength = Math.max(0, 1 - distance / 520);
    const clamp = n => Math.max(-1, Math.min(1, n));
    look.style.setProperty('--nc-x', (clamp(dx / 200) * 2.5 * strength).toFixed(2) + 'px');
    look.style.setProperty('--nc-y', (clamp(dy / 200) * 2 * strength).toFixed(2) + 'px');
    look.style.setProperty('--nc-turn', (clamp(dx / 200) * 5 * strength).toFixed(2) + 'deg');
  }
  function clearPointer() {
    if (frame) cancelAnimationFrame(frame); frame = 0;
    inside = overLauncher = false; setNear(false); resetLook(); syncMotion();
  }
  function align() {
    const box = launcher.getBoundingClientRect();
    root.classList.toggle('nc-left', box.left + box.width / 2 < innerWidth / 2);
    resetLook();
  }
  addEventListener('pointermove', event => {
    if (!fine.matches || event.pointerType === 'touch' || motionBlocked()) return;
    x = event.clientX; y = event.clientY;
    if (!frame) frame = requestAnimationFrame(follow);
  }, { passive: true });
  root.addEventListener('pointerenter', event => { if (event.pointerType === 'touch') return; inside = true; syncMotion(); });
  root.addEventListener('pointerleave', () => { inside = overLauncher = false; if (!near && !focused) suppressed = false; syncMotion(); });
  launcher.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    overLauncher = true; root.classList.remove('nc-greet'); resetLook(); syncMotion();
  });
  launcher.addEventListener('pointerleave', () => { overLauncher = false; syncMotion(); });
  root.addEventListener('focusin', () => {
    focused = launcher.matches(':focus-visible') || invite.contains(document.activeElement);
    root.classList.remove('nc-greet'); resetLook(); syncMotion();
  });
  root.addEventListener('focusout', () => {
    setTimeout(() => {
      focused = root.contains(document.activeElement) && (launcher.matches(':focus-visible') || invite.contains(document.activeElement));
      if (!focused && !near && !inside) suppressed = false;
      syncMotion();
    }, 0);
  });
  mood.addEventListener('animationend', () => root.classList.remove('nc-greet'));
  dismiss.addEventListener('click', () => {
    suppressed = true; autoShowing = false; markSeen(); cancelGreetingTimers(); syncInvite(); launcher.focus();
  });
  ask.addEventListener('click', () => { markSeen(); autoShowing = false; cancelGreetingTimers(); launcher.click(); });
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem(PAUSE_KEY, String(userPaused)); } catch (_) {}
    syncMotion();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !invite.hidden && !isOpen()) {
      suppressed = true; autoShowing = false; markSeen(); cancelGreetingTimers(); syncInvite(); launcher.focus();
    }
  });
  new MutationObserver(() => {
    const open = isOpen();
    if (open !== wasOpen) {
      wasOpen = open; autoShowing = false; cancelGreetingTimers();
      if (open) markSeen();
      clearPointer(); align();
      suppressed = true;
    }
    syncMotion();
  }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] });
  addEventListener('hh:motion', syncMotion);
  document.addEventListener('optimatiza:motion', syncMotion);
  document.addEventListener('optz:lang', syncInvite);
  reduced.addEventListener('change', syncMotion);
  connection?.addEventListener('change', syncMotion);
  fine.addEventListener('change', clearPointer);
  document.addEventListener('pointerleave', clearPointer);
  addEventListener('blur', clearPointer);
  addEventListener('resize', align, { passive: true });
  document.addEventListener('visibilitychange', () => {
    pageHidden = document.hidden;
    if (pageHidden) { autoShowing = false; cancelGreetingTimers(); clearPointer(); }
    else scheduleGreeting();
    syncMotion();
  });
  addEventListener('pagehide', () => { pageHidden = true; autoShowing = false; cancelGreetingTimers(); clearPointer(); });
  addEventListener('pageshow', () => { pageHidden = document.hidden; syncMotion(); scheduleGreeting(); });
  addEventListener('beforeprint', () => { printing = true; autoShowing = false; cancelGreetingTimers(); syncMotion(); });
  addEventListener('afterprint', () => { printing = false; syncMotion(); scheduleGreeting(); });
  addEventListener('storage', event => {
    if (event.key === PAUSE_KEY) userPaused = event.newValue === 'true';
    if (event.key === (personal ? 'hh-motion-paused' : 'optimatiza-motion-paused')) storedPagePause = event.newValue === 'true';
    if (event.key === null) { userPaused = false; storedPagePause = false; }
    syncMotion();
  });
  align(); syncMotion(); scheduleGreeting();
})();
