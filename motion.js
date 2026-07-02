/* ============================================================================
   motion.js — THE OPERATING LEDGER · motion engine
   ----------------------------------------------------------------------------
   Motion metaphor: DRAFTING. Everything is drawn, ruled, stamped or printed —
   never floated, blobbed, tilted or parallaxed. Compositor-cheap properties
   only: transform, opacity, clip-path, stroke-dashoffset.

   Modules:
     0. Guards (no gsap/ScrollTrigger -> static site; reduced motion -> return
        before any class is added)
     1. Lenis smooth scroll (pointer:fine only) + capture-phase anchor routing
     2. Reveal system — ScrollTrigger.batch('.rv') toggles .is-in (CSS animates)
     3. Odometers — .odo[data-target] roll from 0 when revealed
     4. Hero load timeline (≤1.4s, sessionStorage 'hh_intro' repeat-visit skip)
     5. Slab crossfades (HOURS -> SECONDS), once at 60% visibility
     6. Anatomy pinned scene (#anatomia, desktop >=1024px, scrub 0.5)
     7. Magnetic buttons (.magnetic, hover+fine pointer only, ±6px)
     8. i18n protocol — 'lang:changed' listener (refresh + odometer finals)
     9. Resize — debounced re-measure + ScrollTrigger.refresh()

   Coexistence: script.js owns navbar .scrolled, active links, mobile nav,
   clocks, the quote engine and the one-shot [data-flow] -> .flow-visible
   observer (kept for #flowPath1 / mobile fallback). This file never touches
   those except to route anchor clicks through Lenis.
   CSS contracts consumed: .js-anim (html), .rv.is-in, .node-on, .anatomy-scrub.
   ========================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /* 0. GUARDS                                                           */
    /* ------------------------------------------------------------------ */
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
        return; // vendors missing -> site stays fully visible and static
    }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // before adding any class: CSS shows everything statically
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    document.documentElement.classList.add('js-anim');
    gsap.registerPlugin(ScrollTrigger);

    var EASE_TEXT = 'power4.out';    // ≈ cubic-bezier(.16,1,.3,1) — line rises
    var EASE_DRAW = 'power2.inOut';  // ≈ cubic-bezier(.65,0,.35,1) — rules, paths

    var skipIntro = false;
    try { skipIntro = sessionStorage.getItem('hh_intro') === '1'; } catch (e) { /* private mode */ }

    /* ------------------------------------------------------------------ */
    /* 1. LENIS SMOOTH SCROLL + ANCHOR ROUTING                             */
    /* ------------------------------------------------------------------ */
    var lenis = null;
    try {
        if (window.matchMedia('(pointer: fine)').matches && typeof window.Lenis !== 'undefined') {
            lenis = new window.Lenis({ lerp: 0.09 });
            gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
            gsap.ticker.lagSmoothing(0);
            lenis.on('scroll', ScrollTrigger.update);

            // Capture-phase interception: runs BEFORE script.js's element-level
            // smooth-scroll handlers (document capture precedes target phase),
            // so stopImmediatePropagation prevents a double scroll.
            document.addEventListener('click', function (e) {
                if (e.defaultPrevented || e.button !== 0) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
                if (!a) return;
                var href = a.getAttribute('href');
                if (!href || href === '#') return;
                var target;
                try { target = document.querySelector(href); } catch (err) { return; }
                if (!target) return;

                e.preventDefault();
                e.stopImmediatePropagation();

                // script.js's close-mobile-nav listeners live on the anchors and
                // are now swallowed — replicate the close here defensively.
                var navPanel = document.getElementById('navLinks');
                if (navPanel && navPanel.classList.contains('active')) {
                    navPanel.classList.remove('active');
                    var toggle = document.getElementById('navToggle');
                    var icon = toggle && toggle.querySelector('i');
                    if (icon) icon.className = 'ph ph-list';
                    document.body.style.overflow = '';
                }

                var navbar = document.getElementById('navbar');
                var navH = (navbar && navbar.offsetHeight) || 0;
                lenis.scrollTo(target, { offset: -(navH + 16) });
            }, true);
        }
    } catch (err) {
        console.warn('motion: lenis init failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 2. REVEAL SYSTEM — .rv -> .is-in (CSS draws rules, raises lines,    */
    /*    stamps cards). Hero .rv is excluded: the load timeline owns it.  */
    /* ------------------------------------------------------------------ */
    try {
        var scrollRv = gsap.utils.toArray('.rv').filter(function (el) {
            return !el.closest('.hero');
        });

        ScrollTrigger.batch(scrollRv, {
            start: 'top 85%',
            once: true,
            onEnter: function (batch) {
                batch.forEach(function (el) { el.classList.add('is-in'); });
            }
        });

        // Anything already past the trigger line at init (restored scroll,
        // anchored load) is revealed instantly.
        var vh = window.innerHeight || document.documentElement.clientHeight;
        scrollRv.forEach(function (el) {
            if (el.getBoundingClientRect().top < vh * 0.85) el.classList.add('is-in');
        });
    } catch (err) {
        console.warn('motion: reveal system failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 3. ODOMETERS — final values are authored as static text (no-JS      */
    /*    fallback), so we only roll FROM 0 at the moment of reveal.       */
    /* ------------------------------------------------------------------ */
    var odoDone = new Set();

    function odoFinal(el) {
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = Math.round(target) + suffix;
    }

    function rollOdo(el) {
        if (odoDone.has(el)) return;
        odoDone.add(el);
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var state = { v: 0 };
        el.textContent = '0' + suffix;
        gsap.to(state, {
            v: target,
            duration: 1.2,
            ease: 'power2.out',
            snap: { v: 1 },
            onUpdate: function () { el.textContent = Math.round(state.v) + suffix; },
            onComplete: function () { odoFinal(el); }
        });
    }

    try {
        gsap.utils.toArray('.odo[data-target]').forEach(function (el) {
            if (el.closest('.hero')) return; // hero odos roll inside the load timeline
            ScrollTrigger.create({
                trigger: el,
                start: 'top 90%',
                once: true,
                onEnter: function () { rollOdo(el); }
            });
        });
    } catch (err) {
        console.warn('motion: odometers failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 4. HERO LOAD TIMELINE (spec §4) — the rule-draw IS the intro.       */
    /*    0ms page paints (H1 is real text, LCP-safe) ->                   */
    /*    0–450ms rules draw -> 250ms dochead metadata clip-reveals ->     */
    /*    400–950ms H1 lines rise (90ms stagger) -> 850ms subtitle+CTAs -> */
    /*    1000ms proof cells stamp + odometers roll -> 1100ms canvas +     */
    /*    marquee fade in.                                                 */
    /* ------------------------------------------------------------------ */
    var heroTl = null;
    try {
        var hero = document.querySelector('.hero');
        if (hero) {
            var heroRules = gsap.utils.toArray('.hero .rule-x');            // dochead rule
            var docheadSpans = gsap.utils.toArray('.hero .dochead-strip > *'); // 3 mono cells
            var heroLines = gsap.utils.toArray('.hero-title .line');       // 3 authored lines
            var heroSub = hero.querySelector('.hero-subtitle');
            var heroActs = hero.querySelector('.hero-actions');
            var proofCells = gsap.utils.toArray('#proof .proof-cell');
            var heroOdos = gsap.utils.toArray('#proof .odo[data-target]');
            var heroMarquee = hero.querySelector('.hero-marquee');
            var bgCanvas = document.getElementById('bg-canvas');
            var subActs = [heroSub, heroActs].filter(Boolean);

            // Hero .rv containers get .is-in immediately (same synchronous
            // block as .js-anim -> single style recalc, no CSS transition
            // fires). GSAP inline styles then own the choreography.
            gsap.utils.toArray('.hero .rv').forEach(function (el) { el.classList.add('is-in'); });

            if (skipIntro) {
                // Repeat visit: jump every intro target to its end state.
                if (heroRules.length) gsap.set(heroRules, { scaleX: 1 });
                if (docheadSpans.length) gsap.set(docheadSpans, { clipPath: 'none' });
                if (heroLines.length) gsap.set(heroLines, { yPercent: 0 });
                if (subActs.length) gsap.set(subActs, { autoAlpha: 1, y: 0 });
                if (proofCells.length) gsap.set(proofCells, { autoAlpha: 1, scale: 1 });
                if (heroMarquee) gsap.set(heroMarquee, { autoAlpha: 1 });
                heroOdos.forEach(function (el) { odoDone.add(el); odoFinal(el); });
            } else {
                // Initial states — hero elements only, set before first tween.
                if (heroRules.length) gsap.set(heroRules, { scaleX: 0, transformOrigin: '0% 50%' });
                if (docheadSpans.length) gsap.set(docheadSpans, { clipPath: 'inset(0% 0% 0% 100%)' }); // reveal right->left
                if (heroLines.length) gsap.set(heroLines, { yPercent: 110 });
                if (subActs.length) gsap.set(subActs, { autoAlpha: 0, y: 16 });
                if (proofCells.length) gsap.set(proofCells, { autoAlpha: 0, scale: 1.04 });
                if (heroMarquee) gsap.set(heroMarquee, { autoAlpha: 0 });
                if (bgCanvas) gsap.set(bgCanvas, { opacity: 0 }); // opacity only: background-3d.js owns visibility/display

                heroTl = gsap.timeline({ defaults: { ease: EASE_TEXT } });
                if (heroRules.length) {
                    heroTl.to(heroRules, { scaleX: 1, duration: 0.45, ease: EASE_DRAW }, 0);
                }
                if (docheadSpans.length) {
                    heroTl.to(docheadSpans, {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        duration: 0.5,
                        ease: EASE_DRAW,
                        stagger: 0.06
                    }, 0.25);
                }
                if (heroLines.length) {
                    heroTl.to(heroLines, { yPercent: 0, duration: 0.55, stagger: 0.09 }, 0.4);
                }
                if (subActs.length) {
                    heroTl.to(subActs, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.85);
                }
                if (proofCells.length) {
                    heroTl.to(proofCells, {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.45,
                        ease: 'power3.out',
                        stagger: 0.06
                    }, 1.0);
                }
                heroTl.add(function () { heroOdos.forEach(rollOdo); }, 1.0);
                if (heroMarquee) heroTl.to(heroMarquee, { autoAlpha: 1, duration: 0.3 }, 1.1);
                if (bgCanvas) heroTl.to(bgCanvas, { opacity: 1, duration: 0.3 }, 1.1);

                try { sessionStorage.setItem('hh_intro', '1'); } catch (e) { /* private mode */ }
            }
        }
    } catch (err) {
        console.warn('motion: hero load timeline failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 4b. HERO ILLUSTRATION — FIG. 1 draws itself, then a teal dot rides  */
    /*     the process path in a slow loop while the hero is on screen.    */
    /* ------------------------------------------------------------------ */
    try {
        var figSvg = document.querySelector('.hero-fig-svg');
        if (figSvg) {
            var drawables = [];
            figSvg.querySelectorAll('.ill-draw').forEach(function (node) {
                var paths = node.tagName.toLowerCase() === 'g'
                    ? node.querySelectorAll('path, line, polyline, circle, rect, ellipse')
                    : [node];
                paths.forEach(function (p) {
                    if (typeof p.getTotalLength !== 'function') return;
                    var len;
                    try { len = p.getTotalLength(); } catch (e) { return; }
                    if (!len || !isFinite(len)) return;
                    // Preserve authored dash patterns (construction lines) — skip them.
                    if (p.getAttribute('stroke-dasharray')) return;
                    drawables.push({ el: p, len: len });
                });
            });

            if (drawables.length) {
                if (skipIntro) {
                    // repeat visit: art fully drawn, no replay
                } else {
                    drawables.forEach(function (d) {
                        gsap.set(d.el, { strokeDasharray: d.len, strokeDashoffset: d.len });
                    });
                    gsap.to(drawables.map(function (d) { return d.el; }), {
                        strokeDashoffset: 0,
                        duration: 1.6,
                        ease: 'power2.inOut',
                        stagger: 0.012,
                        delay: 0.55,
                        onComplete: function () {
                            drawables.forEach(function (d) { gsap.set(d.el, { clearProps: 'strokeDasharray,strokeDashoffset' }); });
                        }
                    });
                }
            }

            // Traveling process dot: loops along #hb-flow-path only while hero is visible.
            var flowPath = figSvg.querySelector('#hb-flow-path');
            var flowDot = figSvg.querySelector('[data-role="flow-dot"]');
            if (flowPath && flowDot && typeof flowPath.getTotalLength === 'function') {
                var flowLen = flowPath.getTotalLength();
                if (flowLen && isFinite(flowLen)) {
                    var prog = { t: 0 };
                    var dotTween = gsap.to(prog, {
                        t: 1,
                        duration: 6,
                        ease: 'none',
                        repeat: -1,
                        paused: true,
                        delay: skipIntro ? 0 : 2.2,
                        onUpdate: function () {
                            var pt = flowPath.getPointAtLength(prog.t * flowLen);
                            gsap.set(flowDot, { attr: { cx: pt.x, cy: pt.y }, autoAlpha: prog.t < 0.02 || prog.t > 0.98 ? 0 : 1 });
                        }
                    });
                    ScrollTrigger.create({
                        trigger: figSvg,
                        start: 'top bottom',
                        end: 'bottom top',
                        onToggle: function (self) { self.isActive ? dotTween.play() : dotTween.pause(); }
                    });
                }
            }
        }
    } catch (err) {
        console.warn('motion: hero illustration failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 5. SLABS — masked crossfade, once at 60% visibility (~1.1s):        */
    /*    "before" exits upward, "after" rises in, arrow draws.            */
    /* ------------------------------------------------------------------ */
    try {
        gsap.utils.toArray('.slab').forEach(function (slab) {
            var before = slab.querySelector('.slab-before');
            var after = slab.querySelector('.slab-after');
            var arrow = slab.querySelector('.slab-arrow');
            if (!before || !after) return;

            slab.style.overflow = 'hidden'; // masking insurance if CSS omits it
            gsap.set(after, { yPercent: 110, autoAlpha: 0 });
            if (arrow) gsap.set(arrow, { scaleX: 0, transformOrigin: '0% 50%' });

            ScrollTrigger.create({
                trigger: slab,
                start: 'top 60%',
                once: true,
                onEnter: function () {
                    // "before" stays legible: CSS .slab-fired strikes it through and dims it,
                    // so the before/after comparison survives in screenshots and print.
                    slab.classList.add('slab-fired');
                    var tl = gsap.timeline({ defaults: { ease: EASE_TEXT } });
                    tl.to(after, { yPercent: 0, autoAlpha: 1, duration: 0.85 }, 0.25);
                    if (arrow) tl.to(arrow, { scaleX: 1, duration: 0.5, ease: EASE_DRAW }, 0.2);
                }
            });
        });
    } catch (err) {
        console.warn('motion: slabs failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 6. ANATOMY PINNED SCENE — the ONE pin. Desktop >=1024px only.       */
    /*    Scroll scrubs #flowPath2 dashoffset (pathLength="1" -> 0..1      */
    /*    space); the packet rides the drawn tip via getPointAtLength;     */
    /*    nodes stamp in at computed thresholds; mono readout counts.      */
    /* ------------------------------------------------------------------ */
    var anatomyRemeasure = null;
    try {
        var mm = gsap.matchMedia();
        mm.add('(min-width: 1024px)', function () {
            var section = document.getElementById('anatomia');
            var flow = section && section.querySelector('[data-flow]');
            var path = document.getElementById('flowPath2');
            if (!section || !flow || !path || typeof path.getTotalLength !== 'function') return;

            var readout = section.querySelector('.anatomy-readout');
            var readoutOriginal = readout ? readout.textContent : '';
            var nodes = gsap.utils.toArray(flow.querySelectorAll('.flow-node'));
            var packet = flow.querySelector('.flow-pulse');
            var halo = flow.querySelector('.flow-pulse-halo');

            // script.js's flow-visible observer adds the same class — idempotent.
            flow.classList.add('flow-visible');
            // Scrub marker: CSS scopes node visibility to .node-on under this
            // class. If that CSS is absent, nodes simply stay visible — fine.
            flow.classList.add('anatomy-scrub');

            // Retire the legacy animateMotion pulses (they are the mobile /
            // no-JS fallback): detach their <animateMotion> so we can drive
            // the packet's cx/cy manually, and hide the halo.
            var detached = [];
            gsap.utils.toArray(flow.querySelectorAll('.flow-pulse animateMotion, .flow-pulse-halo animateMotion'))
                .forEach(function (m) {
                    detached.push({ node: m, parent: m.parentNode });
                    m.parentNode.removeChild(m);
                });
            if (halo) gsap.set(halo, { autoAlpha: 0 });

            // Dash space: pathLength="1" normalizes dasharray/dashoffset to
            // 0..1. Inline animation/transition kills defend against any CSS
            // one-shot draw (.flow-visible fallback) overriding the scrub.
            path.style.strokeDasharray = '1';
            path.style.strokeDashoffset = '1';
            path.style.animation = 'none';
            path.style.transition = 'none';

            var totalLen = 0;
            var thresholds = [];

            function measure() {
                totalLen = path.getTotalLength(); // user units (viewBox), for getPointAtLength coords
                var samples = 200;
                var xs = [];
                for (var i = 0; i <= samples; i++) {
                    xs.push(path.getPointAtLength((i / samples) * totalLen).x);
                }
                thresholds = nodes.map(function (node) {
                    var nodeX = parseFloat(node.style.left || '0') * 10; // viewBox width 1000 -> % * 10
                    for (var j = 0; j <= samples; j++) {
                        if (xs[j] >= nodeX) return Math.max(j / samples, 0.05);
                    }
                    return 0.94;
                });
            }
            measure();
            anatomyRemeasure = measure;

            function pad(n) {
                return n.toFixed(1).padStart(5, '0'); // 80 -> "080.0"
            }

            function render(progress) {
                path.style.strokeDashoffset = String(Math.max(0, Math.min(1, 1 - progress)));
                var pt = path.getPointAtLength(Math.max(0, Math.min(1, progress)) * totalLen);
                if (packet) {
                    packet.setAttribute('cx', pt.x.toFixed(2));
                    packet.setAttribute('cy', pt.y.toFixed(2));
                }
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].classList.toggle('node-on', progress >= thresholds[i]);
                }
                if (readout) {
                    readout.textContent = 'X ' + pad(pt.x) + ' · Y ' + pad(pt.y) +
                        ' · RUN ' + String(Math.round(progress * 100)).padStart(2, '0') + '%';
                }
            }

            // Proxy tween so scrub smoothing (0.5) applies to the render.
            var proxy = { p: 0 };
            gsap.to(proxy, {
                p: 1,
                ease: 'none',
                onUpdate: function () { render(proxy.p); },
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: '+=150%',
                    pin: true,
                    scrub: 0.5,
                    invalidateOnRefresh: true
                }
            });
            render(0);

            // Cleanup when the media query stops matching (tweens and
            // ScrollTriggers created in this context are auto-reverted).
            return function () {
                anatomyRemeasure = null;
                detached.forEach(function (d) { d.parent.appendChild(d.node); });
                if (halo) gsap.set(halo, { clearProps: 'all' });
                if (packet) { packet.removeAttribute('cx'); packet.removeAttribute('cy'); }
                path.style.strokeDasharray = '';
                path.style.strokeDashoffset = '';
                path.style.animation = '';
                path.style.transition = '';
                flow.classList.remove('anatomy-scrub');
                nodes.forEach(function (n) { n.classList.remove('node-on'); });
                if (readout) readout.textContent = readoutOriginal;
            };
        });
    } catch (err) {
        console.warn('motion: anatomy pin failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 7. MAGNETIC BUTTONS — ±6px pull, hover-capable fine pointers only.  */
    /* ------------------------------------------------------------------ */
    try {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            gsap.utils.toArray('.magnetic').forEach(function (el) {
                var xTo = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3' });
                var yTo = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3' });
                el.addEventListener('pointermove', function (e) {
                    var r = el.getBoundingClientRect();
                    var dx = e.clientX - (r.left + r.width / 2);
                    var dy = e.clientY - (r.top + r.height / 2);
                    xTo(gsap.utils.clamp(-6, 6, dx * 0.25));
                    yTo(gsap.utils.clamp(-6, 6, dy * 0.25));
                });
                el.addEventListener('pointerleave', function () {
                    xTo(0);
                    yTo(0);
                });
            });
        }
    } catch (err) {
        console.warn('motion: magnetic buttons failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 8. i18n PROTOCOL — script.js dispatches 'lang:willchange' /         */
    /*    'lang:changed' around applyLanguage(). Reveal state lives on     */
    /*    containers, so re-injected spans inherit final state; we only    */
    /*    need to re-pin measurements, restore odometer finals, and make   */
    /*    sure the hero H1's fresh line spans are not left mid-tween.      */
    /* ------------------------------------------------------------------ */
    try {
        document.addEventListener('lang:changed', function () {
            // Hero H1 carries data-i18n on the <h1>: applyLanguage replaces
            // its authored .line spans. Jump any in-flight intro to its end
            // and pin the new spans at rest.
            if (heroTl && heroTl.progress() < 1) heroTl.progress(1);
            var freshLines = gsap.utils.toArray('.hero-title .line');
            if (freshLines.length) gsap.set(freshLines, { yPercent: 0 });

            odoDone.forEach(odoFinal);

            requestAnimationFrame(function () { ScrollTrigger.refresh(); });
        });
    } catch (err) {
        console.warn('motion: lang protocol failed', err);
    }

    /* ------------------------------------------------------------------ */
    /* 9. RESIZE — debounced 200ms: re-measure the anatomy path and        */
    /*    refresh trigger positions.                                       */
    /* ------------------------------------------------------------------ */
    try {
        var resizeTimer = null;
        window.addEventListener('resize', function () {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeTimer = null;
                if (anatomyRemeasure) {
                    try { anatomyRemeasure(); } catch (e) { /* detached */ }
                }
                ScrollTrigger.refresh();
            }, 200);
        });
    } catch (err) {
        console.warn('motion: resize handler failed', err);
    }
})();
