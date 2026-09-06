/* HH / COSMOS — a continuous GPU particle scene using self-hosted Three.js.
   Static fallback, capped DPR, adaptive quality and one gated animation loop. */
'use strict';
const canvas = document.getElementById('bgfx');
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = matchMedia('(max-width: 768px)');
const pointerQuery = matchMedia('(hover: hover) and (pointer: fine)');
const connection = navigator.connection;
const isPaused = () => !!window.hhMotion?.paused || reducedMotion.matches || !!connection?.saveData;
function randomSource(seed = 240905) {
    return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
function staticSky() {
    const still = document.createElement('canvas');
    still.className = canvas.className;
    still.id = canvas.id;
    canvas.replaceWith(still);
    const ctx = still.getContext('2d');
    if (!ctx) return;
    function draw() {
        const w = innerWidth, h = innerHeight;
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        still.width = Math.round(w * dpr); still.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const random = randomSource();
        for (let i = 0; i < 330; i++) {
            const x = random() * w, y = random() * h;
            ctx.fillStyle = `rgba(180,211,242,${.15 + random() * .55})`;
            ctx.beginPath(); ctx.arc(x, y, .35 + random() * .7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.save(); ctx.translate(w * .69, h * .42); ctx.rotate(-.36);
        for (let i = 0; i < 1500; i++) {
            const radius = Math.pow(random(), .72) * Math.min(w * .65, 600);
            const angle = (i % 3) * Math.PI * 2 / 3 + radius * .011 + (random() - .5) * .75;
            ctx.fillStyle = i % 3 ? 'rgba(109,184,224,.27)' : 'rgba(178,153,237,.32)';
            ctx.fillRect(Math.cos(angle) * radius, Math.sin(angle) * radius * .35, 1.15, 1.15);
        }
        ctx.restore(); root.classList.add('cosmos-ready');
    }
    draw();
    let resizeTimer;
    addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(draw, 150); }, { passive: true });
}
async function init() {
    if (connection?.saveData) { staticSky(); return; }
    const THREE = await import('./vendor/three/three.module.min.js');
    const compact = mobileQuery.matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.6));
    renderer.setClearColor(0x050b18, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, .1, 180);
    camera.position.set(0, 0, 45);
    const random = randomSource();
    const uniforms = {
        uTime: { value: 0 }, uDpr: { value: renderer.getPixelRatio() },
        uPointer: { value: new THREE.Vector2() }, uPointerActive: { value: 0 },
        uPrimary: { value: new THREE.Color('#62e5df') },
        uSecondary: { value: new THREE.Color('#a28af5') }, uEnergy: { value: 1 },
    };
    const galaxy = new THREE.Group();
    const inclination = new THREE.Group();
    inclination.rotation.set(.98, -.18, -.36);
    inclination.add(galaxy); scene.add(inclination);
    function pointCloud(count, isGalaxy) {
        const positions = new Float32Array(count * 3);
        const seeds = new Float32Array(count);
        const sizes = new Float32Array(count);
        const tones = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            if (isGalaxy) {
                const radius = .2 + Math.pow(random(), .75) * 25;
                const angle = (i % 3) * Math.PI * 2 / 3 + radius * .28 + (random() - .5) * .7;
                const scatter = Math.pow(random(), 3) * 3.5;
                positions[i * 3] = Math.cos(angle) * radius + (random() - .5) * scatter;
                positions[i * 3 + 1] = Math.sin(angle) * radius + (random() - .5) * scatter;
                positions[i * 3 + 2] = (random() - .5) * (.45 + radius * .055);
                tones[i] = Math.min(1, radius / 27 + random() * .22);
                sizes[i] = (.6 + Math.pow(random(), 4) * 2.8) * (compact ? 1.25 : 1);
            } else {
                positions[i * 3] = (random() - .5) * 130;
                positions[i * 3 + 1] = (random() - .5) * 95;
                positions[i * 3 + 2] = (random() - .5) * 65 - 12;
                tones[i] = random(); sizes[i] = .75 + Math.pow(random(), 5) * 2.4;
            }
            seeds[i] = random() * Math.PI * 2;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aTone', new THREE.BufferAttribute(tones, 1));
        const material = new THREE.ShaderMaterial({
            uniforms: { ...uniforms, uGalaxy: { value: isGalaxy ? 1 : 0 } },
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: `
                uniform float uTime, uDpr, uGalaxy;
                uniform vec2 uPointer;
                uniform float uPointerActive;
                attribute float aSeed, aSize, aTone;
                varying float vAlpha, vTone;
                void main() {
                    vec3 p = position;
                    p.z += sin(uTime * .15 + aSeed) * .2 * uGalaxy;
                    vec4 mv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mv;
                    vec2 delta = gl_Position.xy / gl_Position.w - uPointer;
                    float influence = (1.0 - smoothstep(0.0, .32, length(delta))) * uPointerActive;
                    gl_Position.xy += normalize(delta + vec2(.001)) * influence * .024 * gl_Position.w;
                    gl_PointSize = clamp(aSize * uDpr * 40.0 / max(8.0, -mv.z), .7, 6.0 * uDpr);
                    gl_PointSize *= 1.0 + influence * .65;
                    vAlpha = (.68 + .22 * sin(uTime * .48 + aSeed)) * (1.0 - smoothstep(65.0, 115.0, -mv.z));
                    vTone = aTone;
                }`,
            fragmentShader: `
                uniform vec3 uPrimary, uSecondary;
                uniform float uGalaxy, uEnergy;
                varying float vAlpha, vTone;
                void main() {
                    float radius = length(gl_PointCoord - .5);
                    if (radius > .5) discard;
                    float disc = 1.0 - smoothstep(.05, .5, radius);
                    vec3 tone = mix(uPrimary, uSecondary, smoothstep(.1, 1.0, vTone));
                    tone = mix(tone, vec3(.76, .87, 1.0), (1.0 - uGalaxy) * .78);
                    tone = mix(vec3(.76, .92, 1.0), tone, smoothstep(0.0, .3, vTone));
                    gl_FragColor = vec4(tone, disc * vAlpha * mix(.82, .68, uGalaxy) * uEnergy);
                    #include <colorspace_fragment>
                }`,
        });
        return new THREE.Points(geometry, material);
    }
    const spiral = pointCloud(compact ? 5500 : 14500, true);
    galaxy.add(spiral);
    const stars = pointCloud(compact ? 350 : 850, false);
    scene.add(stars);
    // Procedural light between the points: one plane, no blur or postprocessing passes.
    const haloMaterial = new THREE.ShaderMaterial({
        uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime, uEnergy;
            uniform vec3 uPrimary, uSecondary;
            void main() {
                vec2 p = (vUv - .5) * 2.0;
                p.y *= 1.75;
                float radius = length(p);
                float angle = atan(p.y, p.x + .00001);
                float arms = .5 + .5 * sin(angle * 3.0 - radius * 11.0 + uTime * .04);
                float cloud = exp(-radius * radius * 3.7) * (.4 + arms * .32);
                float core = exp(-radius * radius * 100.0);
                float edge = 1.0 - smoothstep(.65, 1.0, length((vUv - .5) * 2.0));
                vec3 color = mix(uPrimary, uSecondary, clamp(radius + p.x * .3, 0.0, 1.0));
                color = mix(color, vec3(.8, .91, 1.0), core * .65);
                gl_FragColor = vec4(color, (cloud * .12 + core * .24) * edge * uEnergy);
                #include <colorspace_fragment>
            }`,
    });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(68, 52), haloMaterial);
    halo.rotation.z = -.3; halo.position.z = -5; scene.add(halo);
    const sections = ['top', 'trayectoria', 'credenciales', 'arsenal', 'sistemas', 'contacto']
        .map(id => document.getElementById(id)).filter(Boolean);
    const palettes = [
        ['#62e5df', '#a28af5'], ['#7bc9e8', '#e3ae7d'], ['#77afff', '#b598f5'],
        ['#57dfd9', '#639bf4'], ['#ab8df1', '#e08cc2'], ['#67e1b3', '#7db8f0'],
    ].map(pair => pair.map(color => new THREE.Color(color)));
    let sectionTops = [], pageHeight = 1, width = 1, height = 1;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0, pointerActive = 0;
    let scrollTarget = scrollY, scrollPosition = scrollY, lastScroll = scrollY, scrollSpeed = 0;
    let frame = 0, last = 0, elapsed = 0, hidden = document.hidden, contextLost = false;
    let slowFrames = 0, samples = 0, qualityReduced = false;
    function measureSections() {
        sectionTops = sections.map(section => section.getBoundingClientRect().top + scrollY);
        pageHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    }
    function resize() {
        width = Math.max(1, canvas.clientWidth || innerWidth);
        height = Math.max(1, canvas.clientHeight || innerHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height; camera.updateProjectionMatrix();
        measureSections();
        if (isPaused() && !contextLost && !hidden) render(0);
    }
    function render(dt) {
        const smoothing = dt ? 1 - Math.exp(-dt * 3) : 1;
        pointerX += (targetX - pointerX) * smoothing;
        pointerY += (targetY - pointerY) * smoothing;
        scrollPosition += (scrollTarget - scrollPosition) * smoothing;
        const progress = Math.max(0, Math.min(1, scrollPosition / pageHeight));
        const viewportWidth = 2 * Math.tan(THREE.MathUtils.degToRad(26)) * 45 * camera.aspect;
        const viewportHeight = viewportWidth / camera.aspect;
        const galaxyScale = (camera.aspect < 1 ? .68 : 1) * (.94 + Math.sin(progress * Math.PI) * .08);
        inclination.scale.setScalar(galaxyScale);
        inclination.position.set(viewportWidth * (.17 - Math.sin(progress * Math.PI * 2) * .13), viewportHeight * (.06 - progress * .12), 0);
        inclination.rotation.z = -.36 + progress * .48;
        galaxy.rotation.z = elapsed * .018 + progress * .55;
        halo.position.x = inclination.position.x; halo.position.y = inclination.position.y;
        halo.scale.setScalar(galaxyScale); halo.rotation.z = -.3 + progress * .48;
        stars.rotation.y = elapsed * .0018 + progress * .045;
        stars.rotation.z = progress * -.04;
        camera.position.x = pointerX * .85; camera.position.y = -pointerY * .55;
        camera.lookAt(0, 0, 0);
        uniforms.uTime.value = elapsed;
        uniforms.uPointer.value.set(pointerX, -pointerY);
        uniforms.uPointerActive.value += (pointerActive - uniforms.uPointerActive.value) * smoothing;
        uniforms.uEnergy.value = 1 + Math.min(scrollSpeed * .00012, .12);
        let sectionIndex = 0;
        sectionTops.forEach((top, i) => { if (scrollPosition + height * .4 >= top) sectionIndex = i; });
        const palette = palettes[Math.min(sectionIndex, palettes.length - 1)];
        uniforms.uPrimary.value.lerp(palette[0], smoothing * .6);
        uniforms.uSecondary.value.lerp(palette[1], smoothing * .6);
        renderer.render(scene, camera);
    }
    function tick(now) {
        frame = 0;
        if (hidden || isPaused() || contextLost) { last = 0; return; }
        const interval = compact || qualityReduced ? 1000 / 30 : 1000 / 60;
        if (last && now - last < interval - 1) { frame = requestAnimationFrame(tick); return; }
        const rawDelta = last ? now - last : interval;
        const dt = Math.min(rawDelta / 1000, .06);
        last = now; elapsed += dt;
        scrollSpeed += (Math.abs(scrollTarget - lastScroll) / Math.max(dt, .001) - scrollSpeed) * .12;
        lastScroll = scrollTarget; render(dt);
        // Degrade only once when the device cannot sustain the initial budget.
        if (!qualityReduced && ++samples <= 150) {
            if (rawDelta > 48) slowFrames++;
            if (samples === 150 && slowFrames > 45) {
                qualityReduced = true; renderer.setPixelRatio(1); uniforms.uDpr.value = 1;
                spiral.geometry.setDrawRange(0, compact ? 3200 : 8500);
                renderer.setSize(width, height, false);
            }
        }
        frame = requestAnimationFrame(tick);
    }
    function syncPlayback() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; last = 0;
        if (!hidden && !isPaused() && !contextLost) frame = requestAnimationFrame(tick);
    }
    addEventListener('pointermove', event => {
        if (isPaused() || !pointerQuery.matches || event.pointerType === 'touch') return;
        targetX = (event.clientX / innerWidth - .5) * 2;
        targetY = (event.clientY / innerHeight - .5) * 2;
        pointerActive = 1;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; pointerActive = 0; });
    addEventListener('blur', () => { targetX = 0; targetY = 0; pointerActive = 0; });
    addEventListener('scroll', () => { scrollTarget = scrollY; }, { passive: true });
    addEventListener('resize', resize, { passive: true });
    addEventListener('hh:motion', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    connection?.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; syncPlayback(); });
    addEventListener('pagehide', () => { hidden = true; syncPlayback(); });
    addEventListener('pageshow', () => { hidden = document.hidden; syncPlayback(); });
    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault(); contextLost = true; syncPlayback(); root.classList.remove('cosmos-ready');
    });
    canvas.addEventListener('webglcontextrestored', () => {
        contextLost = false; resize(); render(0); root.classList.add('cosmos-ready'); syncPlayback();
    });
    if ('ResizeObserver' in window) new ResizeObserver(measureSections).observe(document.body);
    document.fonts?.ready.then(measureSections);
    resize(); render(0); root.classList.add('cosmos-ready'); syncPlayback();
}
if (canvas) {
    const start = () => init().catch(() => staticSky());
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1100 });
    else setTimeout(start, 180);
}
