/* ==========================================================================
   inghumbertohenriquez.com — flow3d.js
   "EL PRISMA VIVO" — hero 3D protagonista (Three.js core, vendored).
   Un cristal de cuarzo bi-terminado en MeshPhysicalMaterial (transmisión /
   iridiscencia / clearcoat) que refracta el gradiente de marca vía un env IBL
   PMREM procedural; un núcleo emisivo interno que respira y late (heartbeat);
   un armilar de anillos cromados que precesan y pasan DETRÁS de la foto
   (oclusión DOM real); un halo fresnel por-objeto (sin post-proceso). La
   constelación Flow Canvas heredada queda DEMOTADA a orbitar el cristal.

   Progressive enhancement. La página nunca depende de esta capa.
   Guardrails: init tras load+idle, reduced-motion (build estático) / saveData /
   WebGL gates, toggle FX (WCAG 2.2.2, localStorage), DPR cap re-aplicado en
   resize, ~30 fps cap, pausa en tab oculto y cuando el hero sale de vista,
   tiering proactivo (transmisión vs reflectivo), presupuesto móvil, dispose().
   ========================================================================== */
'use strict';

const CONFIG = {
    threePath: './vendor/three/three.module.min.js',
    canvasId: 'bg3d',

    /* brand tokens (profile.css) as hex ints */
    steel: 0x5BA8E8,
    steelDeep: 0x8CC3F2,
    teal: 0x2DD4BF,
    blue: 0x3B82F6,
    violet: 0x8B5CF6,
    btc: 0xF7931A,
    fogColor: 0x0A0F1A,            /* --paper-0 */

    nodesDesktop: 70,
    nodesMobile: 28,
    dustDesktop: 200,
    dustMobile: 80,
    pulsesDesktop: 16,
    pulsesMobile: 6,

    linkDist: 8.0,
    maxLinks: 3,

    spreadX: 24, spreadY: 13, spreadZ: 12,
    drift: 0.015,
    parallax: 0.9,
    dprCap: 1.75,
    frameMs: 32,                   /* ~30 fps — la rotación lenta no necesita más */

    /* prisma */
    crystalPos: { x: 8.5, y: 1.5, z: 2 },
    crystalPosMobile: { x: 2.5, y: 11.5, z: -4 },
};

const canvas = document.getElementById(CONFIG.canvasId);
const fxBtn = document.getElementById('fxToggle');
const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection && navigator.connection.saveData;

const LS_FX = 'hh_fx';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

let fxOn = lsGet(LS_FX) !== 'off';
let built = false;
let building = false;
let sceneCtl = null;

if (canvas && !saveData) {
    const boot = () => {
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
    if (document.readyState === 'complete') idle();
    else addEventListener('load', idle, { once: true });
}

function maybeBuild() {
    /* reduced-motion: construimos igual pero en modo estático (un solo render
       del frame más bonito); si FX está off, no construimos nada. */
    if (built || building || !fxOn) return;
    building = true;
    init().catch(() => { /* fondo estático ya presente */ }).finally(() => { building = false; });
}

async function init() {
    const THREE = await import(CONFIG.threePath);

    const mobile = matchMedia('(max-width: 768px)').matches;
    const finePointer = matchMedia('(pointer: fine)').matches;
    const staticOnly = mqReduce.matches;

    const renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: !mobile, powerPreference: 'low-power',
    });
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* ---- tiering proactivo: transmisión (GPU potente) vs reflectivo (piso seguro) ---- */
    const gpuTier = (() => {
        if (mobile || saveData) return 'reflective';
        try {
            const gl = renderer.getContext();
            const ext = gl.getExtension('WEBGL_debug_renderer_info');
            const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
            /* transmisión (pase extra a media res) solo con señal de GPU dedicada */
            if (/(nvidia|geforce|rtx|gtx|radeon rx|apple m\d)/i.test(r)) return 'transmission';
        } catch (e) { /* sin info → piso seguro */ }
        return 'reflective';
    })();
    const useTransmission = gpuTier === 'transmission';

    renderer.setPixelRatio(Math.min(devicePixelRatio, useTransmission ? 1.5 : CONFIG.dprCap));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(CONFIG.fogColor, 26, 66);

    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 120);
    camera.position.z = 30;

    const N = mobile ? CONFIG.nodesMobile : CONFIG.nodesDesktop;
    const root = new THREE.Group();
    scene.add(root);

    const cTeal = new THREE.Color(CONFIG.teal);
    const cBlue = new THREE.Color(CONFIG.blue);
    const cViolet = new THREE.Color(CONFIG.violet);
    const cSteel = new THREE.Color(CONFIG.steel);
    const cBtc = new THREE.Color(CONFIG.btc);
    const tmp = new THREE.Color();

    /* ---- IBL procedural de marca (PMREM, sin HDR externo) ---- */
    const disposables = [];
    (function buildEnv() {
        const envScene = new THREE.Scene();
        const skyGeo = new THREE.SphereGeometry(60, 24, 16);
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false,
            vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
            fragmentShader:
                'varying vec3 vP;' +
                'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}' +
                'void main(){vec3 d=normalize(vP);float y=d.y*0.5+0.5;' +
                'vec3 navy=vec3(0.02,0.04,0.08);' +
                'vec3 col=mix(vec3(0.30,0.20,0.62),navy,smoothstep(0.0,0.5,y));' +    /* violeta abajo */
                'col=mix(col,vec3(0.05,0.62,0.52),smoothstep(0.5,1.0,y));' +          /* teal arriba */
                'col+=(h21(d.xy*40.0)-0.5)*0.015;' +                                  /* dither anti-banding */
                'gl_FragColor=vec4(col,1.0);}'
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        envScene.add(sky);
        /* area-lights de marca */
        const lamps = [[CONFIG.teal, -26, 10, 18, 10], [CONFIG.blue, 22, 16, -14, 9],
                       [CONFIG.violet, -6, -20, 12, 9], [CONFIG.btc, 16, -14, 16, 5]];
        const lampMeshes = [];
        lamps.forEach(function (l) {
            const g = new THREE.SphereGeometry(l[4], 10, 10);
            const m = new THREE.MeshBasicMaterial({ color: l[0] });
            const s = new THREE.Mesh(g, m); s.position.set(l[1], l[2], l[3]);
            envScene.add(s); lampMeshes.push([g, m]);
        });
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envRT = pmrem.fromScene(envScene, 0.04);
        scene.environment = envRT.texture;
        pmrem.dispose(); skyGeo.dispose(); skyMat.dispose();
        lampMeshes.forEach(function (gm) { gm[0].dispose(); gm[1].dispose(); });
        disposables.push({ dispose: function () { envRT.dispose(); } });
    })();

    /* ---- sprite de glow radial (canvas, CSP-safe) ---- */
    const spriteTex = (() => {
        const c = document.createElement('canvas'); c.width = c.height = 64;
        const g = c.getContext('2d');
        const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.35, 'rgba(255,255,255,0.5)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    })();

    /* =====================================================================
       CONSTELACIÓN FLOW CANVAS (demotada: orbita y alimenta al cristal)
       ===================================================================== */
    const nodePos = new Float32Array(N * 3);
    const nodeCol = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const u = Math.random() * 2 - 1, phi = Math.random() * Math.PI * 2;
        const r = Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        nodePos[i * 3] = s * Math.cos(phi) * r * CONFIG.spreadX;
        nodePos[i * 3 + 1] = u * r * CONFIG.spreadY;
        nodePos[i * 3 + 2] = s * Math.sin(phi) * r * CONFIG.spreadZ;
        const roll = Math.random();
        tmp.copy(roll < 0.20 ? cTeal : roll < 0.30 ? cViolet : cSteel).multiplyScalar(0.75 + Math.random() * 0.5);
        nodeCol[i * 3] = tmp.r; nodeCol[i * 3 + 1] = tmp.g; nodeCol[i * 3 + 2] = tmp.b;
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeCol, 3));
    const nodeMat = new THREE.PointsMaterial({
        size: 0.52, map: spriteTex, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.Points(nodeGeo, nodeMat));

    const adj = Array.from({ length: N }, () => []);
    const edges = [];
    const vAt = (i) => [nodePos[i * 3], nodePos[i * 3 + 1], nodePos[i * 3 + 2]];
    for (let i = 0; i < N; i++) {
        const cand = [];
        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const dx = nodePos[i * 3] - nodePos[j * 3], dy = nodePos[i * 3 + 1] - nodePos[j * 3 + 1], dz = nodePos[i * 3 + 2] - nodePos[j * 3 + 2];
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < CONFIG.linkDist * CONFIG.linkDist) cand.push([d2, j]);
        }
        cand.sort((a, b) => a[0] - b[0]);
        for (const [, j] of cand) {
            if (adj[i].length >= CONFIG.maxLinks) break;
            if (adj[j].length >= CONFIG.maxLinks || adj[i].includes(j)) continue;
            adj[i].push(j); adj[j].push(i); edges.push([i, j]);
        }
    }
    const edgePos = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => { edgePos.set(vAt(a), k * 6); edgePos.set(vAt(b), k * 6 + 3); });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
    const edgeMat = new THREE.LineBasicMaterial({
        color: CONFIG.steel, transparent: true, opacity: 0.22,
        blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.LineSegments(edgeGeo, edgeMat));

    /* pulsos que caminan el grafo */
    const sources = [];
    for (let i = 0; i < N; i++) if (adj[i].length) sources.push(i);
    const P = Math.min(mobile ? CONFIG.pulsesMobile : CONFIG.pulsesDesktop, sources.length);
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];
    const pulses = [];
    for (let k = 0; k < P; k++) { const a = pick(sources); pulses.push({ a, b: pick(adj[a]), t: Math.random(), speed: 0.15 + Math.random() * 0.3 }); }
    const pulsePos = new Float32Array(P * 3);
    const pulseCol = new Float32Array(P * 3);
    for (let k = 0; k < P; k++) { tmp.copy(k % 5 === 4 ? cBtc : cTeal); pulseCol[k * 3] = tmp.r; pulseCol[k * 3 + 1] = tmp.g; pulseCol[k * 3 + 2] = tmp.b; }
    const pulseGeo = new THREE.BufferGeometry();
    const pulseAttr = new THREE.BufferAttribute(pulsePos, 3); pulseAttr.setUsage(THREE.DynamicDrawUsage);
    pulseGeo.setAttribute('position', pulseAttr);
    pulseGeo.setAttribute('color', new THREE.BufferAttribute(pulseCol, 3));
    const pulseMat = new THREE.PointsMaterial({
        size: 0.72, map: spriteTex, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat); pulsePoints.frustumCulled = false;
    root.add(pulsePoints);

    /* dust de profundidad */
    const D = mobile ? CONFIG.dustMobile : CONFIG.dustDesktop;
    const dustPos = new Float32Array(D * 3);
    for (let i = 0; i < D; i++) { dustPos[i * 3] = (Math.random() - 0.5) * 80; dustPos[i * 3 + 1] = (Math.random() - 0.5) * 44; dustPos[i * 3 + 2] = (Math.random() - 0.5) * 50; }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        color: CONFIG.steelDeep, size: 0.16, map: spriteTex, sizeAttenuation: true,
        transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.Points(dustGeo, dustMat));

    /* =====================================================================
       EL PRISMA VIVO (protagonista)
       ===================================================================== */
    const assembly = new THREE.Group();
    const cp = mobile ? CONFIG.crystalPosMobile : CONFIG.crystalPos;
    assembly.position.set(cp.x, cp.y, cp.z);
    const assemblyScale = mobile ? 0.46 : 1;
    assembly.scale.setScalar(assemblyScale);
    assembly.rotation.z = 0.35;   /* eje largo inclinado ~20° */
    root.add(assembly);

    /* -- geometría: cuarzo bi-terminado (hex prism + 2 ápices), flat-shaded -- */
    function buildCrystal(R, h, cap) {
        const top = [], bot = [];
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
            top.push([Math.cos(a) * R, h, Math.sin(a) * R]);
            bot.push([Math.cos(a) * R, -h, Math.sin(a) * R]);
        }
        const tA = [0, h + cap, 0], bA = [0, -h - cap, 0];
        const pos = [];
        const push = (p) => { pos.push(p[0], p[1], p[2]); };
        for (let i = 0; i < 6; i++) {
            const j = (i + 1) % 6;
            /* cuerpo (2 tris) */
            push(top[i]); push(bot[i]); push(bot[j]);
            push(top[i]); push(bot[j]); push(top[j]);
            /* cap superior */
            push(top[i]); push(top[j]); push(tA);
            /* cap inferior */
            push(bot[j]); push(bot[i]); push(bA);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.computeVertexNormals();   /* no-indexado → normales planas por-cara */
        return g;
    }
    const crystalGeo = buildCrystal(2.6, 3.5, 3.0);

    const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x12233a,
        emissive: new THREE.Color(0x0E3A4A), emissiveIntensity: useTransmission ? 0.12 : 0.24,
        metalness: 0.0, roughness: 0.05,
        clearcoat: 1.0, clearcoatRoughness: 0.08,
        iridescence: 0.7, iridescenceIOR: 1.32, iridescenceThicknessRange: [100, 520],
        ior: useTransmission ? 1.7 : 1.6,
        envMapIntensity: useTransmission ? 1.35 : 2.1,
        transmission: useTransmission ? 1.0 : 0.0,
        thickness: useTransmission ? 2.0 : 0.0,
        attenuationColor: new THREE.Color(0x1E6E8C),
        attenuationDistance: useTransmission ? 4.0 : Infinity,
        transparent: !useTransmission,
        opacity: useTransmission ? 1.0 : 0.64,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    assembly.add(crystal);

    /* núcleo emisivo interno (opaco → se ve magnificado a través del vidrio) */
    const coreGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x0a1020, emissive: new THREE.Color(0x1CC7B0), emissiveIntensity: 2.4,
        metalness: 0.2, roughness: 0.4,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    assembly.add(core);

    /* halo fresnel por-objeto (bloom barato, sin post-proceso) */
    const shellGeo = buildCrystal(2.6, 3.5, 3.0);
    const shellMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
        uniforms: { uFlare: { value: 0 }, uC1: { value: cTeal.clone() }, uC2: { value: cViolet.clone() } },
        vertexShader: 'varying vec3 vN;varying vec3 vE;varying float vY;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vE=normalize(-mv.xyz);vY=position.y;gl_Position=projectionMatrix*mv;}',
        fragmentShader:
            'varying vec3 vN;varying vec3 vE;varying float vY;uniform float uFlare;uniform vec3 uC1;uniform vec3 uC2;' +
            'void main(){float f=pow(1.0-max(0.0,dot(vN,vE)),2.3);' +
            'vec3 col=mix(uC1,uC2,clamp(vY*0.14+0.5,0.0,1.0));' +
            'gl_FragColor=vec4(col,f*(0.62+uFlare)*1.05);}'
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.scale.setScalar(1.05);
    assembly.add(shell);

    /* sprite radial de glow ambiental detrás del cristal */
    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -3], 3));
    const glowMat = new THREE.PointsMaterial({
        color: 0x1C7FA8, size: 34, map: spriteTex, sizeAttenuation: true,
        transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    assembly.add(new THREE.Points(glowGeo, glowMat));

    /* -- armilar: 3 anillos cromados que precesan (pasan detrás de la foto DOM) -- */
    const rings = [];
    const ringSpecs = [
        { r: 5.4, tube: 0.06, col: 0x8CA3B8, emis: 0x000000, ax: 'x', spd: 0.10 },
        { r: 6.6, tube: 0.06, col: 0x8CA3B8, emis: 0x000000, ax: 'y', spd: -0.07 },
        { r: 7.9, tube: 0.055, col: 0x9A7A4A, emis: CONFIG.btc, ax: 'z', spd: 0.05 },
    ];
    const ringGeos = [];
    if (!mobile) {
        ringSpecs.forEach(function (rs) {
            const g = new THREE.TorusGeometry(rs.r, rs.tube, 14, 220);
            ringGeos.push(g);
            const m = new THREE.MeshStandardMaterial({
                color: rs.col, metalness: 1.0, roughness: 0.22, envMapIntensity: 1.2,
                emissive: new THREE.Color(rs.emis), emissiveIntensity: rs.emis ? 0.25 : 0,
            });
            const ring = new THREE.Mesh(g, m);
            if (rs.ax === 'x') ring.rotation.x = Math.PI / 2;
            else if (rs.ax === 'z') ring.rotation.y = Math.PI / 2.4;
            ring.userData = { spd: rs.spd, ax: rs.ax, mat: m, base: rs.emis ? 0.25 : 0 };
            rings.push(ring); assembly.add(ring);
        });
    }

    /* -- luces (≤4): glints vivos sobre cristal y cromo -- */
    scene.add(new THREE.HemisphereLight(0x1B4A5A, 0x0A0F1A, 0.55));
    const lightT = new THREE.PointLight(CONFIG.teal, useTransmission ? 90 : 60, 60, 2);
    const lightV = new THREE.PointLight(CONFIG.violet, useTransmission ? 75 : 52, 60, 2);
    const lightB = new THREE.PointLight(CONFIG.btc, 30, 50, 2);
    scene.add(lightT); scene.add(lightV); scene.add(lightB);

    /* -- edge-flash de materialización (se apaga tras la entrada) -- */
    const edgeFlashGeo = new THREE.EdgesGeometry(crystalGeo);
    const edgeFlashMat = new THREE.LineBasicMaterial({ color: CONFIG.teal, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const edgeFlash = new THREE.LineSegments(edgeFlashGeo, edgeFlashMat);
    assembly.add(edgeFlash);

    /* ---- sizing ---- */
    function resize() {
        renderer.setPixelRatio(Math.min(devicePixelRatio, useTransmission ? 1.5 : CONFIG.dprCap));
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize, { passive: true });

    /* ---- pointer parallax ---- */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    function onMove(e) {
        tx = (e.clientX / innerWidth - 0.5) * 2 * CONFIG.parallax;
        ty = -(e.clientY / innerHeight - 0.5) * 2 * CONFIG.parallax * 0.6;
    }
    if (finePointer) addEventListener('pointermove', onMove, { passive: true });

    /* ---- loop (~30 fps cap) ---- */
    let raf = 0, running = false, layerOpacity = 0;
    let prevNow = 0, elapsed = 0, entered = 0;
    canvas.style.opacity = '0';
    const smooth = (x) => x * x * (3 - 2 * x);
    const heroDim = mobile ? 0.55 : 1;

    function step(dt) {
        elapsed += dt;
        const t = elapsed;
        entered = Math.min(1, entered + dt * 0.7);
        const eIn = smooth(entered);

        /* pulsos por el grafo */
        for (let k = 0; k < P; k++) {
            const p = pulses[k];
            p.t += p.speed * dt;
            if (p.t >= 1) {
                const next = adj[p.b].filter((n) => n !== p.a);
                p.a = p.b; p.b = next.length ? pick(next) : p.a; p.t = 0;
                p.speed = 0.15 + Math.random() * 0.3;
            }
            const e = smooth(p.t);
            pulsePos[k * 3] = nodePos[p.a * 3] + (nodePos[p.b * 3] - nodePos[p.a * 3]) * e;
            pulsePos[k * 3 + 1] = nodePos[p.a * 3 + 1] + (nodePos[p.b * 3 + 1] - nodePos[p.a * 3 + 1]) * e;
            pulsePos[k * 3 + 2] = nodePos[p.a * 3 + 2] + (nodePos[p.b * 3 + 2] - nodePos[p.a * 3 + 2]) * e;
        }
        pulseAttr.needsUpdate = true;

        /* deriva del grafo + parallax + scroll */
        const sc = window.scrollY;
        const k1 = 1 - Math.exp(-dt * 2.5);
        cx += (tx - cx) * k1; cy += (ty - cy) * k1;
        root.rotation.y = t * CONFIG.drift + sc * 0.00012 + cx * 0.04;
        root.rotation.x = Math.sin(t * 0.05) * 0.03 + cy * 0.03;
        camera.position.x = cx;
        camera.position.y = cy - Math.min(sc / innerHeight, 1) * 1.6;
        camera.lookAt(0, 0, 0);

        /* --- cristal --- */
        assembly.scale.setScalar(assemblyScale * (0.6 + 0.4 * eIn));
        crystal.rotation.y = t * 0.06;
        crystal.rotation.x = Math.sin(t * 0.4) * 0.05;
        core.rotation.y = -t * 0.12; core.rotation.x = t * 0.08;

        /* heartbeat cada ~7s (florece el núcleo + flare del rim) */
        const beat = Math.max(0, 1 - ((t % 7) / 0.9));  /* spike al inicio de cada ciclo, decae en 0.9s */
        const beatE = beat * beat;
        core.material.emissiveIntensity = 1.4 + Math.sin(t * 1.3) * 0.25 + beatE * 2.2;
        const cs = 1 + Math.sin(t * 1.3) * 0.04 + beatE * 0.10;
        core.scale.setScalar(cs);
        shellMat.uniforms.uFlare.value = 0.15 + beatE * 0.85;

        /* anillos precesan; el naranja pulsa con el heartbeat */
        for (let i = 0; i < rings.length; i++) {
            const r = rings[i], u = r.userData;
            if (u.ax === 'x') r.rotation.z = t * u.spd;
            else if (u.ax === 'y') r.rotation.x = Math.PI / 2 + t * u.spd;
            else { r.rotation.z = t * u.spd; if (u.base) u.mat.emissiveIntensity = u.base + beatE * 0.9; }
        }

        /* luces orbitando (glints en movimiento) */
        const ax = assembly.position.x, ay = assembly.position.y, az = assembly.position.z;
        lightT.position.set(ax + Math.cos(t * 0.6) * 12, ay + Math.sin(t * 0.6) * 9, az + 12);
        lightV.position.set(ax + Math.cos(t * 0.45 + 2.2) * 13, ay + Math.sin(t * 0.45 + 2.2) * 8, az + 9);
        lightB.position.set(ax + Math.cos(t * 0.8 + 4) * 9, ay + Math.sin(t * 0.8 + 4) * 7, az + 8);
        lightB.intensity = 22 + beatE * 45;

        /* edge-flash de entrada: brilla y se apaga */
        edgeFlashMat.opacity = Math.max(0, (1 - entered) * 0.9);

        /* fade-in + atenuación al pasar el hero */
        const target = (1 - 0.5 * Math.min(sc / (innerHeight * 0.9), 1)) * heroDim;
        layerOpacity += (target - layerOpacity) * (1 - Math.exp(-dt * 2.2));
        canvas.style.opacity = layerOpacity.toFixed(3);
    }

    function loop(now) {
        raf = requestAnimationFrame(loop);
        if (!prevNow) { prevNow = now; return; }
        if (now - prevNow < CONFIG.frameMs) return;
        const dt = Math.min((now - prevNow) / 1000, 0.1);
        prevNow = now;
        step(dt);
        renderer.render(scene, camera);
    }

    function setRunning(on) {
        if (on && !running) { running = true; prevNow = 0; raf = requestAnimationFrame(loop); }
        else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    }

    /* gate central */
    let visibleTab = !document.hidden;
    let zoneVisible = true;
    function gate() {
        if (staticOnly) { setRunning(false); return; }  /* reduced-motion: no loop */
        setRunning(visibleTab && zoneVisible && fxOn && !mqReduce.matches);
    }
    function hide() { layerOpacity = 0; canvas.style.opacity = '0'; }

    const onVis = () => { visibleTab = !document.hidden; gate(); };
    document.addEventListener('visibilitychange', onVis);

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

    built = true;
    sceneCtl = { gate, hide };

    if (staticOnly) {
        /* reduced-motion: un solo render del frame más bonito (cristal iluminado) */
        entered = 1; step(0.016);
        layerOpacity = heroDim; canvas.style.opacity = heroDim.toFixed(3);
        renderer.render(scene, camera);
    } else {
        gate();
    }

    /* ---- dispose ---- */
    canvas.dispose = () => {
        setRunning(false);
        removeEventListener('resize', resize);
        removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', onVis);
        if (zoneIO) zoneIO.disconnect();
        [nodeGeo, edgeGeo, pulseGeo, dustGeo, crystalGeo, shellGeo, coreGeo, glowGeo, edgeFlashGeo].forEach((g) => g.dispose());
        ringGeos.forEach((g) => g.dispose());
        [nodeMat, edgeMat, pulseMat, dustMat, crystalMat, shellMat, coreMat, glowMat, edgeFlashMat].forEach((m) => m.dispose());
        rings.forEach((r) => r.material.dispose());
        disposables.forEach((d) => d.dispose());  /* incluye envRT (y su textura) */
        spriteTex.dispose();
        renderer.dispose();
        built = false;
        sceneCtl = null;
    };
}
