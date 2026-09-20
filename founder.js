/* Optimatiza founder film: lazy media, explicit mobile playback and shared pause. */
(() => {
    'use strict';
    const video = document.getElementById('founderVideo');
    const button = document.getElementById('founderVideoToggle');
    if (!video || !button) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 768px)');
    const connection = navigator.connection;
    let visible = false, loaded = false, userPaused = false, requested = false, pageHidden = document.hidden;
    const allowed = () => visible && !pageHidden && !document.hidden && !userPaused &&
        (requested || (!window.hhMotion?.paused && !reduced.matches && !mobile.matches && !connection?.saveData));
    function label() {
        const playing = !video.paused;
        button.setAttribute('aria-label', playing ? 'Pausar vídeo de Optimatiza' : 'Reproducir vídeo de Optimatiza');
        button.querySelector('[data-video-label]').textContent = playing ? 'Pausar vídeo' : 'Reproducir vídeo';
        button.firstElementChild.textContent = playing ? 'Ⅱ' : '▷';
    }
    function sync() {
        if (!allowed()) { video.pause(); label(); return; }
        if (!loaded) {
            video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
            video.muted = true;
            video.load(); loaded = true;
        }
        const promise = video.play();
        promise?.then(() => { if (!allowed()) video.pause(); label(); }).catch(label);
    }
    button.hidden = false;
    button.addEventListener('click', () => {
        if (!video.paused) { userPaused = true; requested = false; }
        else { userPaused = false; requested = true; }
        sync();
    });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    video.addEventListener('error', () => { video.pause(); button.hidden = true; });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (!visible) requested = false;
            sync();
        }, { threshold: .12 }).observe(video);
    } else {
        // Older browsers keep the poster until the visitor explicitly presses play.
        visible = true; userPaused = true;
    }
    addEventListener('hh:motion', () => { requested = false; sync(); });
    const preferenceChanged = () => { requested = false; sync(); };
    reduced.addEventListener('change', preferenceChanged);
    mobile.addEventListener('change', preferenceChanged);
    connection?.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', () => { pageHidden = document.hidden; sync(); });
    addEventListener('pagehide', () => { pageHidden = true; sync(); });
    addEventListener('pageshow', () => { pageHidden = document.hidden; sync(); });
})();
