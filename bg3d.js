/* ============================================================
   BG3D — "Topografía de datos"
   Malla de puntos desplazada por ondas en GPU (ShaderMaterial)
   + capa de partículas a la deriva. Hero del CV digital.

   Guardrails (threejs-pro): init tras idle, bail con
   prefers-reduced-motion / saveData / sin WebGL, DPR cap 1.75,
   pausa fuera de viewport y con pestaña oculta, presupuesto
   móvil reducido, low-power, canvas decorativo.
   ============================================================ */
'use strict';

const CONFIG = {
    threePath: './vendor/three/three.module.min.js',
    canvasId: 'bgfx',
    // paleta: teal → azul (tokens del sitio)
    colorLow: [0x1C / 255, 0x3F / 255, 0x66 / 255],   // valle: azul profundo
    colorMid: [0x3E / 255, 0x8F / 255, 0xB8 / 255],   // ladera: azul acero
    colorHigh: [0x3B / 255, 0xF0 / 255, 0xD4 / 255],  // cresta: teal
    gridW: 150, gridH: 90,        // desktop: 13 500 vértices (GPU)
    gridWm: 80, gridHm: 50,       // móvil: 4 000
    particles: 380, particlesM: 130,
    dprCap: 1.75,
    parallax: 0.35,
};

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const canvas = document.getElementById(CONFIG.canvasId);

if (canvas && !reduced && !saveData) {
    const start = () => init().catch(() => { /* fallback CSS ya presente */ });
    'requestIdleCallback' in window
        ? requestIdleCallback(start, { timeout: 2000 })
        : setTimeout(start, 1200);
}

async function init() {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

    const THREE = await import(CONFIG.threePath);

    const renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: false, powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.dprCap));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 220);
    camera.position.set(0, 9, 26);

    const mobile = matchMedia('(max-width: 768px)').matches;

    /* ---------- terreno de puntos (ondas en el vertex shader) ---------- */
    const W = mobile ? CONFIG.gridWm : CONFIG.gridW;
    const H = mobile ? CONFIG.gridHm : CONFIG.gridH;
    const SPAN_X = 150, SPAN_Z = 80;

    const pos = new Float32Array(W * H * 3);
    let k = 0;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            pos[k++] = (j / (W - 1) - 0.5) * SPAN_X;
            pos[k++] = 0;
            pos[k++] = -(i / (H - 1)) * SPAN_Z + 8;
        }
    }
    const terrainGeo = new THREE.BufferGeometry();
    terrainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const uniforms = {
        uTime: { value: 0 },
        uLow: { value: new THREE.Vector3(...CONFIG.colorLow) },
        uMid: { value: new THREE.Vector3(...CONFIG.colorMid) },
        uHigh: { value: new THREE.Vector3(...CONFIG.colorHigh) },
        uPix: { value: renderer.getPixelRatio() },
    };

    const terrainMat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */`
            uniform float uTime;
            uniform float uPix;
            varying float vH;
            varying float vFog;
            void main() {
                vec3 p = position;
                float t = uTime * 0.55;
                // dos trenes de ondas cruzados + detalle fino
                float h = sin(p.x * 0.11 + t)        * 2.2
                        + sin(p.z * 0.16 - t * 0.8)  * 2.0
                        + sin((p.x + p.z) * 0.055 + t * 0.45) * 3.0
                        + sin(p.x * 0.32 - t * 1.4)  * 0.45;
                p.y += h;
                vH = h;
                vec4 mv = modelViewMatrix * vec4(p, 1.0);
                float dist = -mv.z;
                vFog = smoothstep(115.0, 18.0, dist);       // lejos → 0
                gl_PointSize = (115.0 / dist) * uPix;
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: /* glsl */`
            uniform vec3 uLow;
            uniform vec3 uMid;
            uniform vec3 uHigh;
            varying float vH;
            varying float vFog;
            void main() {
                // sprite circular suave
                vec2 c = gl_PointCoord - 0.5;
                float d = length(c);
                float disc = smoothstep(0.5, 0.18, d);
                if (disc < 0.01) discard;
                float hn = clamp((vH + 7.2) / 14.4, 0.0, 1.0);
                vec3 col = hn < 0.55
                    ? mix(uLow, uMid, hn / 0.55)
                    : mix(uMid, uHigh, (hn - 0.55) / 0.45);
                float a = disc * vFog * (0.5 + hn * 0.5);
                gl_FragColor = vec4(col, a);
            }`,
    });
    const terrain = new THREE.Points(terrainGeo, terrainMat);
    scene.add(terrain);

    /* ---------- partículas a la deriva (datos subiendo) ---------- */
    const N = mobile ? CONFIG.particlesM : CONFIG.particles;
    const pPos = new Float32Array(N * 3);
    const pSeed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 110;
        pPos[i * 3 + 1] = Math.random() * 26 - 2;
        pPos[i * 3 + 2] = -Math.random() * 60 + 6;
        pSeed[i] = Math.random() * 6.28;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    partGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1));

    const partMat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */`
            uniform float uTime;
            uniform float uPix;
            attribute float aSeed;
            varying float vA;
            void main() {
                vec3 p = position;
                float t = uTime * 0.28 + aSeed;
                p.y = mod(p.y + uTime * 0.55 + aSeed * 3.0, 26.0) - 2.0;
                p.x += sin(t) * 1.6;
                vec4 mv = modelViewMatrix * vec4(p, 1.0);
                float dist = -mv.z;
                vA = smoothstep(100.0, 16.0, dist) * (0.45 + 0.4 * sin(t * 2.1));
                gl_PointSize = (60.0 / dist) * uPix;
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: /* glsl */`
            uniform vec3 uHigh;
            varying float vA;
            void main() {
                vec2 c = gl_PointCoord - 0.5;
                float disc = smoothstep(0.5, 0.1, length(c));
                if (disc < 0.01) discard;
                gl_FragColor = vec4(uHigh, disc * max(vA, 0.0) * 0.8);
            }`,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    /* ---------- sizing ---------- */
    function resize() {
        const w = canvas.clientWidth || canvas.parentElement.clientWidth;
        const h = canvas.clientHeight || canvas.parentElement.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize, { passive: true });

    /* ---------- parallax (solo desktop) ---------- */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    function onMove(e) {
        tx = (e.clientX / innerWidth - 0.5) * CONFIG.parallax * 12;
        ty = (e.clientY / innerHeight - 0.5) * CONFIG.parallax * 5;
    }
    if (!mobile) addEventListener('pointermove', onMove, { passive: true });

    /* ---------- loop con compuertas de visibilidad ---------- */
    let raf = 0, running = false, seen = true, tabVisible = true;
    const clock = new THREE.Clock();
    let elapsed = 0;

    function loop() {
        raf = requestAnimationFrame(loop);
        elapsed += clock.getDelta();
        uniforms.uTime.value = elapsed;
        cx += (tx - cx) * 0.045;
        cy += (ty - cy) * 0.045;
        camera.position.x = cx;
        camera.position.y = 9 + cy;
        camera.lookAt(0, 1.5, -20);
        renderer.render(scene, camera);
    }
    function setRunning(on) {
        if (on && !running) { running = true; clock.getDelta(); loop(); }
        else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }

    new IntersectionObserver((entries) => {
        seen = entries[0].isIntersecting;
        setRunning(seen && tabVisible);
    }, { threshold: 0.02 }).observe(canvas);

    document.addEventListener('visibilitychange', () => {
        tabVisible = document.visibilityState === 'visible';
        setRunning(seen && tabVisible);
    });

    setRunning(true);
}
