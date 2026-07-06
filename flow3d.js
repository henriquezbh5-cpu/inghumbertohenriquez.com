/* ==========================================================================
   inghumbertohenriquez.com — flow3d.js
   "Flow Constellation" — ambient 3D node-graph layer (Three.js, vendored).
   A living workflow graph: nodes, edges, and data pulses travelling the
   network — the Flow Canvas theme, extruded into depth.

   Progressive enhancement only. The page never depends on this layer.
   Guardrails: init after window load + idle, reduced-motion (live) /
   saveData / WebGL gates, user FX toggle (WCAG 2.2.2, localStorage),
   DPR cap re-applied on resize, ~30 fps cap, pause on hidden tab and
   when opaque sections fully cover the canvas, mobile budget, dispose().
   ========================================================================== */
'use strict';

const CONFIG = {
    threePath: './vendor/three/three.module.min.js',
    canvasId: 'bg3d',

    /* brand tokens (profile.css) as hex ints */
    steel: 0x5BA8E8,
    steelDeep: 0x8CC3F2,
    teal: 0x2DD4BF,
    violet: 0x8B5CF6,
    btc: 0xF7931A,
    fogColor: 0x0A0F1A,            /* --paper-0 */

    nodesDesktop: 120,
    nodesMobile: 48,               /* ≤ 40% of desktop budget */
    dustDesktop: 220,
    dustMobile: 88,
    pulsesDesktop: 14,
    pulsesMobile: 6,

    linkDist: 8.0,                 /* max edge length (world units) */
    maxLinks: 3,                   /* max edges per node */

    spreadX: 26, spreadY: 13, spreadZ: 11,
    drift: 0.015,                  /* autonomous rotation, rad/s */
    parallax: 0.9,                 /* camera offset at pointer extremes */
    dprCap: 1.75,
    frameMs: 32,                   /* ~30 fps — ambient layer needs no more */
};

const canvas = document.getElementById(CONFIG.canvasId);
const fxBtn = document.getElementById('fxToggle');
const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection && navigator.connection.saveData;

const LS_FX = 'hh_fx';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

let fxOn = lsGet(LS_FX) !== 'off';   /* user preference, default on */
let built = false;                   /* scene constructed */
let building = false;
let sceneCtl = null;                 /* { gate, hide } once built */

if (canvas && !saveData) {
    const boot = () => {
        /* capability gate before revealing the toggle or paying the import */
        const probe = document.createElement('canvas');
        let gl = null;
        try { gl = probe.getContext('webgl2') || probe.getContext('webgl'); } catch (e) { /* blocked */ }
        if (!gl) return;

        if (fxBtn) {
            fxBtn.hidden = false;
            fxBtn.setAttribute('aria-pressed', fxOn ? 'true' : 'false');
            fxBtn.classList.toggle('off', !fxOn);
            fxBtn.addEventListener('click', () => {
                fxOn = !fxOn;
                lsSet(LS_FX, fxOn ? 'on' : 'off');
                fxBtn.setAttribute('aria-pressed', fxOn ? 'true' : 'false');
                fxBtn.classList.toggle('off', !fxOn);
                if (fxOn) maybeBuild();
                if (sceneCtl) { if (!fxOn) sceneCtl.hide(); sceneCtl.gate(); }
            });
        }

        /* live reduced-motion: stop mid-session if the user enables it */
        const onMq = () => { if (sceneCtl) { if (mqReduce.matches) sceneCtl.hide(); sceneCtl.gate(); } else maybeBuild(); };
        if (mqReduce.addEventListener) mqReduce.addEventListener('change', onMq);
        else if (mqReduce.addListener) mqReduce.addListener(onMq);

        maybeBuild();
    };
    const idle = () => {
        'requestIdleCallback' in window
            ? requestIdleCallback(boot, { timeout: 2000 })
            : setTimeout(boot, 1500);
    };
    /* never contend with LCP/fonts: wait for full load, then for idle */
    if (document.readyState === 'complete') idle();
    else addEventListener('load', idle, { once: true });
}

function maybeBuild() {
    if (built || building || !fxOn || mqReduce.matches) return;
    building = true;
    init().catch(() => { /* static bg already in place */ }).finally(() => { building = false; });
}

async function init() {
    const THREE = await import(CONFIG.threePath);

    const renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: false, powerPreference: 'low-power',
    });

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(CONFIG.fogColor, 26, 62);

    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 120);
    camera.position.z = 30;

    const mobile = matchMedia('(max-width: 768px)').matches;
    const finePointer = matchMedia('(pointer: fine)').matches;
    const N = mobile ? CONFIG.nodesMobile : CONFIG.nodesDesktop;

    const root = new THREE.Group();
    scene.add(root);

    /* ---- shared glow sprite (canvas-generated, CSP-neutral) ---- */
    const spriteTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.35, 'rgba(255,255,255,0.5)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    })();

    /* ---- nodes: flattened ellipsoid cloud ---- */
    const nodePos = new Float32Array(N * 3);
    const nodeCol = new Float32Array(N * 3);
    const cSteel = new THREE.Color(CONFIG.steel);
    const cTeal = new THREE.Color(CONFIG.teal);
    const cViolet = new THREE.Color(CONFIG.violet);
    const tmp = new THREE.Color();

    for (let i = 0; i < N; i++) {
        const u = Math.random() * 2 - 1, phi = Math.random() * Math.PI * 2;
        const r = Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        nodePos[i * 3] = s * Math.cos(phi) * r * CONFIG.spreadX;
        nodePos[i * 3 + 1] = u * r * CONFIG.spreadY;
        nodePos[i * 3 + 2] = s * Math.sin(phi) * r * CONFIG.spreadZ;

        const roll = Math.random();
        tmp.copy(roll < 0.18 ? cTeal : roll < 0.26 ? cViolet : cSteel)
            .multiplyScalar(0.75 + Math.random() * 0.5);
        nodeCol[i * 3] = tmp.r; nodeCol[i * 3 + 1] = tmp.g; nodeCol[i * 3 + 2] = tmp.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeCol, 3));
    const nodeMat = new THREE.PointsMaterial({
        size: 0.5, map: spriteTex, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.Points(nodeGeo, nodeMat));

    /* ---- edges: nearest neighbours within linkDist, capped per node ---- */
    const adj = Array.from({ length: N }, () => []);
    const edges = [];
    const v = (i) => [nodePos[i * 3], nodePos[i * 3 + 1], nodePos[i * 3 + 2]];
    for (let i = 0; i < N; i++) {
        const cand = [];
        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const dx = nodePos[i * 3] - nodePos[j * 3];
            const dy = nodePos[i * 3 + 1] - nodePos[j * 3 + 1];
            const dz = nodePos[i * 3 + 2] - nodePos[j * 3 + 2];
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < CONFIG.linkDist * CONFIG.linkDist) cand.push([d2, j]);
        }
        cand.sort((a, b) => a[0] - b[0]);
        for (const [, j] of cand) {
            if (adj[i].length >= CONFIG.maxLinks) break;
            if (adj[j].length >= CONFIG.maxLinks || adj[i].includes(j)) continue;
            adj[i].push(j); adj[j].push(i);
            edges.push([i, j]);
        }
    }

    const edgePos = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => {
        edgePos.set(v(a), k * 6);
        edgePos.set(v(b), k * 6 + 3);
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
    const edgeMat = new THREE.LineBasicMaterial({
        color: CONFIG.steel, transparent: true, opacity: 0.13,
        blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.LineSegments(edgeGeo, edgeMat));

    /* ---- pulses: data packets walking the graph ---- */
    const sources = [];
    for (let i = 0; i < N; i++) if (adj[i].length) sources.push(i);
    const P = Math.min(mobile ? CONFIG.pulsesMobile : CONFIG.pulsesDesktop, sources.length);
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];
    const pulses = [];
    for (let k = 0; k < P; k++) {
        const a = pick(sources);
        pulses.push({ a, b: pick(adj[a]), t: Math.random(), speed: 0.15 + Math.random() * 0.3 });
    }
    const pulsePos = new Float32Array(P * 3);
    const pulseCol = new Float32Array(P * 3);
    const cBtc = new THREE.Color(CONFIG.btc);
    for (let k = 0; k < P; k++) {
        tmp.copy(k % 5 === 4 ? cBtc : cTeal);
        pulseCol[k * 3] = tmp.r; pulseCol[k * 3 + 1] = tmp.g; pulseCol[k * 3 + 2] = tmp.b;
    }
    const pulseGeo = new THREE.BufferGeometry();
    const pulseAttr = new THREE.BufferAttribute(pulsePos, 3);
    pulseAttr.setUsage(THREE.DynamicDrawUsage);
    pulseGeo.setAttribute('position', pulseAttr);
    pulseGeo.setAttribute('color', new THREE.BufferAttribute(pulseCol, 3));
    const pulseMat = new THREE.PointsMaterial({
        size: 0.7, map: spriteTex, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    pulsePoints.frustumCulled = false;
    root.add(pulsePoints);

    /* ---- dust: far, tiny particles for depth ---- */
    const D = mobile ? CONFIG.dustMobile : CONFIG.dustDesktop;
    const dustPos = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 80;
        dustPos[i * 3 + 1] = (Math.random() - 0.5) * 44;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        color: CONFIG.steelDeep, size: 0.16, map: spriteTex, sizeAttenuation: true,
        transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.Points(dustGeo, dustMat));

    /* ---- blueprint solid: slow wireframe icosahedron, stage right ---- */
    const icoGeo = new THREE.IcosahedronGeometry(7.5, 0);
    const icoMat = new THREE.MeshBasicMaterial({
        color: CONFIG.violet, wireframe: true, transparent: true, opacity: 0.055,
        blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(14, 2, -8);
    root.add(ico);

    /* ---- sizing (DPR re-applied: zoom / monitor moves change it) ---- */
    function resize() {
        renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.dprCap));
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize, { passive: true });

    /* ---- pointer parallax (fine pointers only) ---- */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    function onMove(e) {
        tx = (e.clientX / innerWidth - 0.5) * 2 * CONFIG.parallax;
        ty = -(e.clientY / innerHeight - 0.5) * 2 * CONFIG.parallax * 0.6;
    }
    if (finePointer) addEventListener('pointermove', onMove, { passive: true });

    /* ---- render loop (manual timing; ~30 fps cap for an ambient layer) ---- */
    let raf = 0, running = false, layerOpacity = 0;
    let prevNow = 0, elapsed = 0;
    canvas.style.opacity = '0';
    const smooth = (x) => x * x * (3 - 2 * x);
    const heroDim = mobile ? 0.8 : 1;   /* no CSS mask on mobile — dim instead */

    function loop(now) {
        raf = requestAnimationFrame(loop);
        if (!prevNow) { prevNow = now; return; }
        if (now - prevNow < CONFIG.frameMs) return;
        const dt = Math.min((now - prevNow) / 1000, 0.1);
        prevNow = now;
        elapsed += dt;
        const t = elapsed;

        /* pulses walk the graph */
        for (let k = 0; k < P; k++) {
            const p = pulses[k];
            p.t += p.speed * dt;
            if (p.t >= 1) {
                const next = adj[p.b].filter((n) => n !== p.a);
                const nb = next.length ? pick(next) : p.a;
                p.a = p.b; p.b = nb; p.t = 0;
                p.speed = 0.15 + Math.random() * 0.3;
            }
            const e = smooth(p.t);
            pulsePos[k * 3] = nodePos[p.a * 3] + (nodePos[p.b * 3] - nodePos[p.a * 3]) * e;
            pulsePos[k * 3 + 1] = nodePos[p.a * 3 + 1] + (nodePos[p.b * 3 + 1] - nodePos[p.a * 3 + 1]) * e;
            pulsePos[k * 3 + 2] = nodePos[p.a * 3 + 2] + (nodePos[p.b * 3 + 2] - nodePos[p.a * 3 + 2]) * e;
        }
        pulseAttr.needsUpdate = true;

        /* drift + parallax + scroll coupling (frame-rate independent lerps) */
        const sc = window.scrollY;
        const k1 = 1 - Math.exp(-dt * 2.5);
        cx += (tx - cx) * k1; cy += (ty - cy) * k1;
        root.rotation.y = t * CONFIG.drift + sc * 0.00012 + cx * 0.04;
        root.rotation.x = Math.sin(t * 0.05) * 0.03 + cy * 0.03;
        camera.position.x = cx;
        camera.position.y = cy - Math.min(sc / innerHeight, 1) * 1.6;
        camera.lookAt(0, 0, 0);
        ico.rotation.x = t * 0.05;
        ico.rotation.y = t * 0.035;

        /* fade in, then dim once past the hero */
        const target = (1 - 0.55 * Math.min(sc / (innerHeight * 0.9), 1)) * heroDim;
        layerOpacity += (target - layerOpacity) * (1 - Math.exp(-dt * 2.2));
        canvas.style.opacity = layerOpacity.toFixed(3);

        renderer.render(scene, camera);
    }

    function setRunning(on) {
        if (on && !running) { running = true; prevNow = 0; raf = requestAnimationFrame(loop); }
        else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }

    /* central gate: tab visible + FX on + motion allowed + canvas not occluded */
    let visibleTab = !document.hidden;
    let zoneVisible = true;
    function gate() { setRunning(visibleTab && zoneVisible && fxOn && !mqReduce.matches); }
    function hide() { layerOpacity = 0; canvas.style.opacity = '0'; }

    const onVis = () => { visibleTab = !document.hidden; gate(); };
    document.addEventListener('visibilitychange', onVis);

    /* pause while opaque sections (band / well / footer) cover the viewport:
       observe the transparent zones — if none is on screen, nothing shows */
    let zoneIO = null;
    const zones = document.querySelectorAll('#hero, main > section:not(.band):not(.section-well)');
    if ('IntersectionObserver' in window && zones.length) {
        const onScreen = new Set();
        zoneIO = new IntersectionObserver((entries) => {
            entries.forEach((en) => { en.isIntersecting ? onScreen.add(en.target) : onScreen.delete(en.target); });
            zoneVisible = onScreen.size > 0;
            gate();
        }, { threshold: 0 });
        zones.forEach((z) => zoneIO.observe(z));
    }

    gate();
    built = true;
    sceneCtl = { gate, hide };

    /* ---- dispose hook (SPA teardown; harmless on this static site) ---- */
    canvas.dispose = () => {
        setRunning(false);
        removeEventListener('resize', resize);
        removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', onVis);
        if (zoneIO) zoneIO.disconnect();
        [nodeGeo, edgeGeo, pulseGeo, dustGeo, icoGeo].forEach((g) => g.dispose());
        [nodeMat, edgeMat, pulseMat, dustMat, icoMat].forEach((m) => m.dispose());
        spriteTex.dispose();
        renderer.dispose();
        built = false;
        sceneCtl = null;
    };
}
