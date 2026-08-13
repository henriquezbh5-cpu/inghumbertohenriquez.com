/* ============================================================
   CV.JS — interacciones del CV digital
   Reloj GMT-6 · typewriter HH.LOG · contadores · reveals ·
   índice lateral activo · menú móvil. Vanilla, sin dependencias.
   ============================================================ */
'use strict';

document.documentElement.classList.add('js');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- reloj San Salvador ---------- */
(function clock() {
    const els = document.querySelectorAll('[data-clock]');
    if (!els.length) return;
    const fmt = new Intl.DateTimeFormat('es-SV', {
        timeZone: 'America/El_Salvador',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const tick = () => {
        const t = fmt.format(new Date());
        els.forEach((el) => { el.textContent = t; });
    };
    tick();
    setInterval(tick, 1000);
})();

/* ---------- menú móvil ---------- */
(function mobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            links.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();

/* ---------- reveals on scroll ---------- */
(function reveals() {
    const els = document.querySelectorAll('.rv');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('in'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
    }, { threshold: 0.04 });
    els.forEach((el) => io.observe(el));
})();

/* ---------- contadores ---------- */
(function counters() {
    const odos = document.querySelectorAll('.odo');
    if (!odos.length) return;
    const run = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        if (reduced) { el.textContent = target + suffix; return; }
        const t0 = performance.now();
        const dur = 1300;
        const step = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { odos.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
        });
    }, { threshold: 0.4 });
    odos.forEach((el) => io.observe(el));
})();

/* ---------- índice lateral + nav activos ---------- */
(function rail() {
    if (!('IntersectionObserver' in window)) return;
    const railLinks = [...document.querySelectorAll('.rail a[data-rail]')];
    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const mark = (id) => {
        railLinks.forEach((l) => l.classList.toggle('active', l.dataset.rail === id));
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    };
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) mark(en.target.id); });
    }, { rootMargin: '-30% 0px -55% 0px' });
    ['trayectoria', 'credenciales', 'arsenal', 'sistemas', 'contacto'].forEach((id) => {
        const sec = document.getElementById(id);
        if (sec) io.observe(sec);
    });
})();

/* ---------- barra de progreso de scroll ---------- */
(function progress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
        ticking = false;
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
    };
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
})();

/* ---------- índice de stagger para el grid de herramientas ---------- */
document.querySelectorAll('.tool-grid .tool').forEach((el, i) => {
    el.style.setProperty('--i', i);
});

/* ---------- formulario: envío inline sin salir del sitio ---------- */
(function contactForm() {
    const form = document.getElementById('contactForm');
    if (!form || !window.fetch) return;
    const btn = document.getElementById('formSend');
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.textContent = 'TRANSMITIENDO…';
        status.className = 'form-status mono';
        status.textContent = '';
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
        }).then((r) => {
            if (!r.ok) throw new Error('http ' + r.status);
            form.reset();
            status.classList.add('ok');
            status.textContent = 'MENSAJE RECIBIDO — RESPONDO EN MENOS DE 24 H';
        }).catch(() => {
            status.classList.add('err');
            status.innerHTML = 'NO SE PUDO ENVIAR — <a href="https://wa.me/50371928070" target="_blank" rel="noopener">ESCRÍBEME POR WHATSAPP</a>';
        }).finally(() => {
            btn.disabled = false;
            btn.textContent = 'ENVIAR MENSAJE';
        });
    });
})();

/* ---------- tilt 3D sutil (solo puntero fino, sin reduced-motion) ---------- */
(function tilt() {
    if (reduced || !matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.tool-featured, .photo-frame').forEach((el) => {
        el.style.transformStyle = 'preserve-3d';
        el.style.willChange = 'transform';
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
            const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
            el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        });
        el.addEventListener('pointerleave', () => {
            el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
    });
})();

/* ---------- HH.LOG typewriter ---------- */
(function hhlog() {
    const body = document.getElementById('logBody');
    if (!body) return;

    const LINES = [
        { t: '[00:00.000]', a: 'SISTEMA', c: 'la-sys', m: 'Expediente iniciado — HH/2026 · San Salvador, GMT-6' },
        { t: '[00:00.400]', a: 'PERFIL', c: 'la-perfil', m: 'Ingeniero en sistemas · Científico de datos' },
        { t: '[00:00.900]', a: 'EDUCACIÓN', c: 'la-edu', m: 'MSc Data Science (2026) · MSc BI · Posgrado Blockchain' },
        { t: '[00:01.400]', a: 'CERTIFICADO', c: 'la-cert', m: 'Microsoft ×3 — PL-500 RPA · PL-100 · PL-300' },
        { t: '[00:01.900]', a: 'OPERACIÓN', c: 'la-tool', m: '15+ sistemas en producción · SV · GT · CR · DO' },
        { t: '[00:02.400]', a: 'MODO', c: 'la-founder', m: '100% remoto desde 2020 · Power Automate a diario' },
        { t: '[00:02.900]', a: 'ESTADO', c: 'la-estado', m: 'Disponible · respuesta en menos de 24 h' },
    ];

    const render = (line, msg) => {
        const el = document.createElement('span');
        el.className = 'log-line';
        el.innerHTML = '<span class="log-time">' + line.t + '</span> '
            + '<span class="log-actor ' + line.c + '">' + line.a + '</span> &gt; '
            + '<span class="log-msg"></span>';
        el.querySelector('.log-msg').textContent = msg;
        return el;
    };

    const replayBtn = document.getElementById('logReplay');

    if (reduced) {
        LINES.forEach((l) => body.appendChild(render(l, l.m)));
        return;
    }

    const caret = document.createElement('span');
    caret.className = 'log-caret';
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    function play() {
        timers.forEach(clearTimeout);
        timers = [];
        body.textContent = '';
        if (replayBtn) replayBtn.hidden = true;
        let li = 0;
        (function typeLine() {
            if (li >= LINES.length) {
                caret.remove();
                if (replayBtn) replayBtn.hidden = false;
                return;
            }
            const line = LINES[li];
            const el = render(line, '');
            const msgEl = el.querySelector('.log-msg');
            body.appendChild(el);
            el.appendChild(caret);
            let ci = 0;
            const iv = setInterval(() => {
                ci += 2;
                msgEl.textContent = line.m.slice(0, ci);
                if (ci >= line.m.length) {
                    clearInterval(iv);
                    li += 1;
                    later(typeLine, 260);
                }
            }, 18);
            timers.push(iv);
        })();
    }

    if (replayBtn) replayBtn.addEventListener('click', play);

    const begin = () => later(play, 500);
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { io.disconnect(); begin(); }
        }, { threshold: 0.3 });
        io.observe(body);
    } else {
        begin();
    }
})();
