/* Motion preferences and pointer lighting, shared with the GPU scene. */
(() => {
    'use strict';
    const root = document.documentElement;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const connection = navigator.connection;
    const button = document.getElementById('motionToggle');
    const dock = document.querySelector('.motion-dock');
    let userPaused = false;
    try { userPaused = localStorage.getItem('hh-motion-paused') === 'true'; } catch (_) { /* Storage is optional. */ }
    const motion = { paused: true };
    window.hhMotion = motion;
    function sync() {
        motion.paused = userPaused || preference.matches || !!connection?.saveData;
        root.classList.toggle('motion-paused', motion.paused);
        if (dock) dock.hidden = preference.matches || !!connection?.saveData;
        if (button) {
            button.setAttribute('aria-pressed', String(motion.paused));
            button.setAttribute('aria-label', motion.paused ? 'Activar movimiento ambiental' : 'Pausar movimiento ambiental');
            button.setAttribute('title', motion.paused ? 'Activar movimiento ambiental' : 'Pausar movimiento ambiental');
            button.querySelector('[data-motion-label]').textContent = motion.paused ? 'ACTIVAR MOVIMIENTO' : 'PAUSAR MOVIMIENTO';
        }
        window.dispatchEvent(new CustomEvent('hh:motion', { detail: { paused: motion.paused } }));
    }
    button?.addEventListener('click', () => {
        userPaused = !userPaused;
        try { localStorage.setItem('hh-motion-paused', String(userPaused)); } catch (_) { /* Keep the in-memory choice. */ }
        sync();
    });
    preference.addEventListener('change', sync);
    connection?.addEventListener('change', sync);
    sync();
    const cards = [...document.querySelectorAll('.pnode, .cred, .pf, .tool, .sys, .photo-frame, .log-panel, .tool-featured')];
    let pending = 0, active = null, pointerX = 0, pointerY = 0;
    function clearCard() {
        if (pending) cancelAnimationFrame(pending);
        pending = 0;
        if (!active) return;
        active.style.removeProperty('--spot-alpha');
        active.style.removeProperty('transform');
        active = null;
    }
    function paintPointer() {
        pending = 0;
        if (!active || motion.paused || !finePointer.matches) return;
        const box = active.getBoundingClientRect();
        const x = Math.max(0, Math.min(box.width, pointerX - box.left));
        const y = Math.max(0, Math.min(box.height, pointerY - box.top));
        active.style.setProperty('--spot-x', x.toFixed(1) + 'px');
        active.style.setProperty('--spot-y', y.toFixed(1) + 'px');
        active.style.setProperty('--spot-alpha', '.095');
        if (active.matches('.photo-frame, .tool-featured')) {
            const rx = (y / box.height - .5) * -4;
            const ry = (x / box.width - .5) * 4;
            active.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        }
    }
    cards.forEach(card => {
        card.addEventListener('pointermove', e => {
            if (motion.paused || !finePointer.matches || e.pointerType === 'touch') return;
            if (active !== card) { clearCard(); active = card; }
            pointerX = e.clientX; pointerY = e.clientY;
            if (!pending) pending = requestAnimationFrame(paintPointer);
        }, { passive: true });
        card.addEventListener('pointerleave', clearCard);
    });
    window.addEventListener('hh:motion', clearCard);
    window.addEventListener('blur', clearCard);
    window.addEventListener('scroll', clearCard, { passive: true });
    finePointer.addEventListener('change', clearCard);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearCard(); });
})();
