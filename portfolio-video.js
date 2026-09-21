/* Decorative films: load only on visible desktop sections; blend each loop. */
(() => {
    'use strict';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 768px)');
    const forced = matchMedia('(forced-colors: active)');
    const connection = navigator.connection;
    const fadeMs = 800;
    let pageHidden = document.hidden, printing = false;
    const films = [];

    function announce() {
        const playing = films.some(film => film.playing);
        const root = document.documentElement;
        if ((root.dataset.backgroundVideoPlaying === 'true') === playing) return;
        root.dataset.backgroundVideoPlaying = String(playing);
        dispatchEvent(new CustomEvent('hh:background-video', { detail: { playing } }));
    }

    document.querySelectorAll('[data-background-film]').forEach(container => {
        const videos = [...container.querySelectorAll('video')];
        if (videos.length !== 2) return;
        const film = { playing: false };
        films.push(film);
        let visible = false, loaded = false, failed = false, active = 0;
        let blending = false, timer = 0, revision = 0;
        const allowed = () => visible && !pageHidden && !document.hidden && !printing && !failed &&
            !reduced.matches && !mobile.matches && !forced.matches && !connection?.saveData &&
            !document.documentElement.classList.contains('motion-paused');

        function settle(next = active) {
            clearTimeout(timer);
            timer = 0;
            blending = false;
            active = next;
            container.classList.remove('is-blending');
            videos.forEach((video, index) => {
                video.classList.toggle('is-current', index === active);
                video.classList.remove('is-incoming');
                if (index !== active) video.pause();
            });
        }

        function stop() {
            revision++;
            // Finish an interrupted blend on the new frame, then stop both decoders.
            const incoming = videos.findIndex(video => video.classList.contains('is-incoming'));
            settle(incoming >= 0 ? incoming : active);
            videos.forEach(video => video.pause());
            film.playing = false;
            announce();
        }

        function fail() {
            failed = true;
            stop();
            container.classList.remove('is-playing');
        }

        function sync() {
            if (!allowed()) { stop(); return; }
            if (!loaded) {
                videos.forEach(video => {
                    video.muted = true;
                    video.defaultMuted = true;
                    video.src = video.dataset.src;
                    video.load();
                });
                loaded = true;
            }
            if (blending) return;
            const token = ++revision;
            videos[active].play().then(() => {
                if (token !== revision || !allowed()) return;
                container.classList.add('is-playing');
                settle();
                film.playing = true;
                announce();
            }).catch(() => {
                if (token !== revision) return;
                stop();
                container.classList.remove('is-playing');
            });
        }

        function blend() {
            if (blending || !allowed() || !film.playing) return;
            blending = true;
            const next = 1 - active;
            const incoming = videos[next];
            const token = ++revision;
            incoming.currentTime = 0;
            incoming.play().then(() => {
                if (token !== revision || !allowed()) return;
                // Keep the outgoing frame fully opaque beneath the incoming film.
                incoming.classList.add('is-incoming');
                void incoming.offsetWidth;
                container.classList.add('is-blending');
                timer = setTimeout(() => {
                    if (token !== revision) return;
                    settle(next);
                }, fadeMs);
            }).catch(() => {
                if (token !== revision) return;
                fail();
            });
        }

        videos.forEach((video, index) => {
            video.addEventListener('timeupdate', () => {
                if (index === active && Number.isFinite(video.duration) && video.currentTime >= video.duration - fadeMs / 1000 - .15) blend();
            });
            video.addEventListener('ended', () => { if (index === active) blend(); });
            video.addEventListener('error', fail);
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                visible = entries[0].isIntersecting;
                sync();
            }, { threshold: 0 }).observe(container);
        }
        film.sync = sync;
    });

    const syncAll = () => films.forEach(film => film.sync());
    addEventListener('hh:motion', syncAll);
    document.addEventListener('optimatiza:motion', syncAll);
    reduced.addEventListener('change', syncAll);
    mobile.addEventListener('change', syncAll);
    forced.addEventListener('change', syncAll);
    connection?.addEventListener('change', syncAll);
    document.addEventListener('visibilitychange', () => { pageHidden = document.hidden; syncAll(); });
    addEventListener('pagehide', () => { pageHidden = true; syncAll(); });
    addEventListener('pageshow', () => { pageHidden = document.hidden; syncAll(); });
    addEventListener('beforeprint', () => { printing = true; syncAll(); });
    addEventListener('afterprint', () => { printing = false; syncAll(); });
})();
