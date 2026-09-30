/* Progressive, self-hosted galaxy observatory. No image/video is enlarged. */
const canvas = document.getElementById("galaxy-canvas");
const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const forcedColors = matchMedia("(forced-colors: active)");
const mobile = matchMedia("(max-width: 768px)");
const connection = navigator.connection;
const lifetime = new AbortController();
let engine = null;
let pending = false;
let disposed = false;
let printing = false;
let pageSuspended = false;
let idleHandle = null;
const canInitialize = () =>
  !reducedMotion.matches && !forcedColors.matches && !connection?.saveData;
const animationPaused = () =>
  document.hidden ||
  printing ||
  pageSuspended ||
  !!window.hhMotion?.paused ||
  !canInitialize();

function fallback(state = "fallback") {
  if (!canvas) return;
  canvas.dataset.state = state;
  root.classList.remove("galaxy-ready");
}

async function initialize() {
  idleHandle = null;
  if (
    !canvas ||
    pending ||
    engine ||
    disposed ||
    !canInitialize() ||
    document.hidden
  )
    return;
  pending = true;
  canvas.dataset.state = "loading";
  try {
    const [THREE, model] = await Promise.all([
      import("/vendor/three/three.module.min.js"),
      import("/galaxy-model.js?v=1e4be843e8db"),
    ]);
    if (disposed || !canInitialize()) return;
    engine = createScene(THREE, model);
    engine.sync();
  } catch {
    fallback();
  } finally {
    pending = false;
    if (!engine) fallback();
  }
}

function schedule() {
  if (!canInitialize()) {
    engine?.dispose();
    engine = null;
    fallback();
    return;
  }
  if (engine) engine.sync();
  else if (!pending && !disposed && idleHandle === null && !document.hidden) {
    idleHandle =
      "requestIdleCallback" in window
        ? requestIdleCallback(initialize, { timeout: 1800 })
        : setTimeout(initialize, 1500);
  }
}

function createScene(THREE, { createGalaxy, randomSource, encounterEnvelope }) {
  const listeners = new AbortController();
  const on = (target, type, handler, options = {}) =>
    target.addEventListener(type, handler, {
      ...options,
      signal: listeners.signal,
    });
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 240);
  camera.position.z = 72;
  const random = randomSource();
  const geometries = [];
  const materials = [];
  const clouds = [];
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const shared = {
    uTime: { value: 0 },
    uDpr: { value: renderer.getPixelRatio() },
    uPointer: { value: pointer },
    uActive: { value: 0 },
  };
  let compact = mobile.matches;
  let budget = compact ? 0.36 : 1;
  let elapsed = 0;
  let lastFrame = 0;
  let frame = 0;
  let destroyed = false;
  let lost = false;
  let visible = true;
  let exploring = root.classList.contains("galaxy-exploring");
  let exploreMix = exploring ? 1 : 0;
  let sceneName = "voyage";
  let encounterStart = 0;
  let pointerUntil = 0;
  let slowFrames = 0;
  let samples = 0;
  let renderedFrames = 0;
  let measuredFrames = 0;
  let measuredTime = 0;
  let measuredRender = 0;
  let resizeTimer;
  let width = 1;
  let height = 1;
  let worldWidth = 1;
  let worldHeight = 1;

  const vertexShader = `
    uniform float uTime, uDpr, uActive, uOpacity, uTidal;
    uniform vec2 uPointer;
    attribute float aSize, aTone, aPhase, aCloud;
    varying float vTone, vAlpha, vCloud, vPhase;
    void main() {
      vec3 p = position;
      float r = length(p.xy);
      float twist = uTidal * r * r * .75 + sin(uTime * .35 + r * 8.0) * .025 * r;
      p.xy = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * p.xy;
      p.z += sin(aPhase + uTime * .38) * .004 * r;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      vec2 delta = gl_Position.xy / gl_Position.w - uPointer;
      float influence = (1.0 - smoothstep(.0, .3, length(delta))) * uActive;
      gl_Position.xy += normalize(delta + vec2(.0001)) * influence * .022 * gl_Position.w;
      float perspective = 72.0 / max(20.0, -mv.z);
      gl_PointSize = clamp(aSize * uDpr * perspective, .8, 34.0 * uDpr);
      vTone = aTone;
      vPhase = aPhase;
      vCloud = aCloud;
      vAlpha = uOpacity * mix(.29 + .1 * sin(aPhase + uTime * .8), .046, aCloud);
      vAlpha *= 1.0 + influence * .7;
    }
  `;
  const fragmentShader = `
    varying float vTone, vAlpha, vCloud, vPhase;
    void main() {
      vec2 uv = gl_PointCoord - .5;
      float r = length(uv);
      if (r > .5) discard;
      vec3 warm = vec3(1.0, .39, .07);
      vec3 cool = vec3(.035, .26, .72);
      vec3 color = mix(warm, cool, smoothstep(.1, .53, vTone));
      color = mix(color, vec3(.30, .06, .58), smoothstep(.48, .95, vTone) * .56);
      float nursery = step(.94, fract(vPhase * 3.719)) * smoothstep(.2, .5, vTone);
      color = mix(color, vec3(1.0, .08, .22), nursery * .8);
      float brightStar = step(.975, fract(vPhase * 9.18));
      color = mix(color, vec3(.8, .9, 1.0), (1.0 - vCloud) * brightStar * .7);
      float disc = 1.0 - smoothstep(.1, .5, r);
      float glow = exp(-r * r * 18.0) * (1.0 - smoothstep(.32, .5, r));
      gl_FragColor = vec4(color, mix(disc, glow, vCloud) * vAlpha);
      #include <colorspace_fragment>
    }
  `;

  function galaxy(type, count, seed) {
    const data = createGalaxy(type, count, seed);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(data.position, 3),
    );
    for (const [name, values] of Object.entries({
      aSize: data.size,
      aTone: data.tone,
      aPhase: data.phase,
      aCloud: data.cloud,
    })) {
      geometry.setAttribute(name, new THREE.BufferAttribute(values, 1));
    }
    const uniforms = {
      ...shared,
      uOpacity: { value: 1 },
      uTidal: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);
    geometries.push(geometry);
    materials.push(material);
    const entry = {
      type,
      count,
      group,
      points,
      geometry,
      uniforms,
      dust: null,
    };
    clouds.push(entry);

    // Continuous dust and stellar light connect the sharp, individually resolved stars.
    if (type !== "irregular") {
      const coreGeometry = new THREE.PlaneGeometry(2.4, 2.4);
      const coreMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: uniforms.uOpacity,
          uTidal: uniforms.uTidal,
          uType: {
            value: type === "elliptical" ? 2 : type === "barred" ? 1 : 0,
          },
          uArms: { value: type === "spiral" ? 3 : 2 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader:
          "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader: `
          uniform float uOpacity, uTidal, uType, uArms;
          varying vec2 vUv;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
          void main(){
            vec2 p=(vUv-.5)*2.4;
            float r=length(p);
            float theta=atan(p.y,p.x);
            float winding=mix(log(1.0+r*13.0)*2.35,max(0.0,r-.35)*5.5,step(.5,uType));
            float phase=(theta+uTidal*r*r*.75-winding)*uArms;
            float arms=pow(.5+.5*cos(phase),8.0);
            float lane=pow(.5+.5*cos(phase+.6),24.0);
            float cloud=.4+.4*noise(p*15.0)+.2*noise(p*47.0);
            float edge=1.0-smoothstep(.8,1.12,r);
            float core=exp(-r*15.0)*.46+exp(-r*r*48.0)*.06;
            float dust=arms*smoothstep(.08,.23,r)*edge*cloud*.17;
            dust*=1.0-lane*.72;
            float disc=exp(-r*3.5)*.026*edge;
            if(uType>1.5){core=exp(-r*6.5)*.20;dust=0.0;disc=0.0;}
            if(uType>.5&&uType<1.5){core+=exp(-abs(p.x)*5.0-p.y*p.y*400.0)*.1;}
            vec3 dustColor=mix(vec3(.025,.20,.70),vec3(.36,.045,.48),smoothstep(.4,.95,r));
            vec3 warm=vec3(1.0,.34,.055);
            vec3 color=(warm*core+dustColor*(dust+disc))/max(.001,core+dust+disc);
            gl_FragColor=vec4(color,(core+dust+disc)*uOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      entry.dust = core;
      core.position.z = -0.015;
      group.add(core);
      geometries.push(coreGeometry);
      materials.push(coreMaterial);
    }
    return entry;
  }

  const galaxies = [
    galaxy("spiral", 40000, 101),
    galaxy("andromeda", 19000, 207),
    galaxy("barred", 10000, 309),
    galaxy("elliptical", 6500, 413),
    galaxy("irregular", 6000, 519),
  ];

  const skyCount = 1100;
  const skyPosition = new Float32Array(skyCount * 3);
  const skySize = new Float32Array(skyCount);
  const skyPhase = new Float32Array(skyCount);
  for (let i = 0; i < skyCount; i++) {
    skyPosition.set(
      [(random() - 0.5) * 220, (random() - 0.5) * 140, -30 - random() * 95],
      i * 3,
    );
    skySize[i] = 0.8 + Math.pow(random(), 8) * 3;
    skyPhase[i] = random() * Math.PI * 2;
  }
  const skyGeometry = new THREE.BufferGeometry();
  skyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(skyPosition, 3),
  );
  skyGeometry.setAttribute("aSize", new THREE.BufferAttribute(skySize, 1));
  skyGeometry.setAttribute("aPhase", new THREE.BufferAttribute(skyPhase, 1));
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: shared,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime,uDpr; attribute float aSize,aPhase; varying float vAlpha;
      void main(){vec3 p=position; p.xy+=vec2(sin(uTime*.025+aPhase),cos(uTime*.02+aPhase))*.3;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); gl_PointSize=aSize*uDpr;
      vAlpha=.42+.23*sin(aPhase+uTime*.55);}`,
    fragmentShader: `varying float vAlpha; void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
      gl_FragColor=vec4(.65,.78,1.,(1.-smoothstep(.08,.5,r))*vAlpha);
      #include <colorspace_fragment>
    }`,
  });
  const sky = new THREE.Points(skyGeometry, skyMaterial);
  scene.add(sky);
  geometries.push(skyGeometry);
  materials.push(skyMaterial);

  const bridgeCount = 3400;
  const bridgePosition = new Float32Array(bridgeCount * 3);
  for (let i = 0; i < bridgeCount; i++)
    bridgePosition.set([random(), random() - 0.5, random() - 0.5], i * 3);
  const bridgeGeometry = new THREE.BufferGeometry();
  bridgeGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(bridgePosition, 3),
  );
  const bridgeUniforms = {
    ...shared,
    uFrom: { value: new THREE.Vector3() },
    uTo: { value: new THREE.Vector3() },
    uBridge: { value: 0 },
  };
  const bridgeMaterial = new THREE.ShaderMaterial({
    uniforms: bridgeUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `uniform vec3 uFrom,uTo; uniform float uTime,uDpr,uBridge; varying float vAlpha;
      void main(){float t=fract(position.x+uTime*.035); float arc=sin(t*3.141593); vec3 direction=uTo-uFrom;
      vec3 side=normalize(vec3(-direction.y,direction.x,.01));
      vec3 p=mix(uFrom,uTo,t)+side*(arc*5.0+position.y*(.7+arc*2.0));
      p.z+=position.z*1.3+sin(t*6.283+uTime*.6)*arc;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      gl_PointSize=(.8+abs(position.y)*2.)*uDpr; vAlpha=uBridge*arc*.38;}`,
    fragmentShader: `varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
      gl_FragColor=vec4(.5,.7,1.,(1.-smoothstep(.0,.5,r))*vAlpha);
      #include <colorspace_fragment>
    }`,
  });
  const bridge = new THREE.Points(bridgeGeometry, bridgeMaterial);
  bridge.frustumCulled = false;
  scene.add(bridge);
  geometries.push(bridgeGeometry);
  materials.push(bridgeMaterial);

  function applyBudget() {
    const ratio = Math.min(budget, compact ? 0.36 : 1);
    clouds.forEach((item) =>
      item.geometry.setDrawRange(0, Math.floor(item.count * ratio)),
    );
    skyGeometry.setDrawRange(0, Math.floor(skyCount * ratio));
    bridgeGeometry.setDrawRange(0, Math.floor(bridgeCount * ratio));
    canvas.dataset.particleCount = String(
      Math.floor((81500 + skyCount + bridgeCount) * ratio),
    );
    canvas.dataset.quality = `${renderer.getPixelRatio().toFixed(2)}x`;
  }

  function resize() {
    width = Math.max(1, canvas.clientWidth || innerWidth);
    height = Math.max(1, canvas.clientHeight || innerHeight);
    if (compact !== mobile.matches) budget = mobile.matches ? 0.36 : 1;
    compact = mobile.matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    shared.uDpr.value = renderer.getPixelRatio();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    worldHeight =
      2 *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      camera.position.z;
    worldWidth = worldHeight * camera.aspect;
    applyBudget();
    if (
      !frame &&
      !lost &&
      visible &&
      !document.hidden &&
      !printing &&
      !pageSuspended
    )
      render(0, true);
  }

  function render(dt, snapComposition = false) {
    const blend =
      snapComposition || elapsed === 0 ? 1 : 1 - Math.exp(-dt * 2.2);
    exploreMix += ((exploring ? 1 : 0) - exploreMix) * blend;
    pointer.lerp(pointerTarget, 1 - Math.exp(-Math.max(dt, 0.016) * 4));
    shared.uActive.value +=
      ((performance.now() < pointerUntil ? 1 : 0) - shared.uActive.value) *
      (1 - Math.exp(-dt * 3));
    shared.uTime.value = elapsed;
    const homeX = worldWidth * (compact ? 0.08 : 0.2) * (1 - exploreMix);
    const homeY =
      worldHeight *
      (0.045 * (1 - exploreMix) + (compact ? 0.11 : 0.05) * exploreMix);
    const baseScale = compact
      ? Math.min(17, worldWidth * 0.47) * (1 - 0.2 * exploreMix)
      : Math.min(23, worldWidth * 0.24);
    const encounter = sceneName === "merger" || sceneName === "voyage";
    const approach = encounter
      ? encounterEnvelope(
          elapsed - encounterStart + (sceneName === "voyage" ? 11 : 0),
          sceneName === "merger" ? 24 : 48,
        )
      : 0;
    const selected = Math.max(
      0,
      galaxies.findIndex((item) => item.type === sceneName),
    );
    const lead = galaxies[selected];
    const companion = galaxies[selected === 1 ? 0 : 1];
    const orbit = elapsed * 0.11;
    const target = new THREE.Vector3();
    const approachRadius = baseScale * (1.5 - approach * 1.36);

    for (const [index, item] of galaxies.entries()) {
      const isLead = item === lead;
      const isCompanion = item === companion;
      let scale, x, y, z, opacity;
      if (isLead) {
        x = homeX - Math.cos(orbit) * approach * baseScale * 0.13;
        y = homeY - Math.sin(orbit) * approach * baseScale * 0.08;
        z = 0;
        scale = baseScale;
        opacity = 1;
      } else if (isCompanion) {
        x = homeX + Math.cos(orbit + 0.65) * approachRadius;
        y = homeY + Math.sin(orbit + 0.65) * approachRadius * 0.55;
        z = -9 + approach * 8;
        scale = baseScale * (0.46 + approach * 0.13);
        opacity = 0.84;
      } else {
        const angle = index * 2.17 + elapsed * (0.025 + index * 0.003);
        const orbitX = compact ? worldWidth * 0.55 : worldWidth * 0.33;
        x = homeX + Math.cos(angle) * orbitX;
        y = homeY + Math.sin(angle) * worldHeight * 0.39;
        z = -12 - index * 2;
        scale = baseScale * (index === 3 ? 0.2 : 0.3);
        opacity = 0.58;
      }
      target.set(x, y, z);
      // Initial composition is complete even when the user has paused motion.
      item.group.position.lerp(target, elapsed === 0 ? 1 : blend);
      const targetScale = new THREE.Vector3(scale, scale, scale);
      item.group.scale.lerp(targetScale, elapsed === 0 ? 1 : blend);
      item.uniforms.uOpacity.value +=
        (opacity - item.uniforms.uOpacity.value) * (elapsed === 0 ? 1 : blend);
      item.uniforms.uTidal.value = isLead || isCompanion ? approach : 0;
      const tilt =
        item.type === "andromeda"
          ? 1.16
          : item.type === "elliptical"
            ? 0.22
            : 0.56;
      item.group.rotation.set(
        tilt + Math.sin(elapsed * 0.09 + index) * 0.11,
        Math.sin(elapsed * 0.08 + index) * 0.13,
        -0.42 + index * 0.8,
      );
      item.points.rotation.z =
        elapsed *
        (item.type === "elliptical" ? 0.02 : 0.075) *
        (index % 2 ? -1 : 1);
      if (item.dust) item.dust.rotation.z = item.points.rotation.z;
    }
    bridgeUniforms.uFrom.value.copy(lead.group.position);
    bridgeUniforms.uTo.value.copy(companion.group.position);
    bridgeUniforms.uBridge.value = encounter
      ? Math.sin(approach * Math.PI * 0.88)
      : 0;
    bridge.visible = bridgeUniforms.uBridge.value > 0.02;
    camera.position.x = pointer.x * (1 + exploreMix * 1.8);
    camera.position.y = pointer.y * (0.7 + exploreMix * 1.2);
    camera.lookAt(0, 0, 0);
    sky.rotation.z = elapsed * 0.0016;
    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = 0;
    if (destroyed || lost || !visible || animationPaused()) return;
    const rawDt = lastFrame ? (now - lastFrame) / 1000 : 1 / 60;
    lastFrame = now;
    const dt = Math.min(rawDt, 0.05);
    elapsed += dt;
    const renderStart = performance.now();
    render(dt);
    measuredRender += performance.now() - renderStart;
    measuredTime += rawDt;
    measuredFrames++;
    renderedFrames++;
    if (renderedFrames % 30 === 0)
      canvas.dataset.frame = String(renderedFrames);
    if (measuredFrames >= 120) {
      canvas.dataset.fps = (measuredFrames / measuredTime).toFixed(1);
      canvas.dataset.renderMs = (measuredRender / measuredFrames).toFixed(2);
      measuredFrames = 0;
      measuredTime = 0;
      measuredRender = 0;
    }
    samples++;
    if (rawDt > 0.025) slowFrames++;
    if (samples >= 240) {
      // Preserve native pixel clarity; scale stellar density before resolution.
      if (slowFrames > 130 && budget > (compact ? 0.18 : 0.4)) {
        budget *= 0.8;
        applyBudget();
      }
      samples = 0;
      slowFrames = 0;
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    if (destroyed || lost) return;
    const paused = animationPaused() || !visible;
    canvas.dataset.state = paused ? "paused" : "running";
    root.classList.add("galaxy-ready");
    if (paused) {
      if (visible && !document.hidden && !printing && !pageSuspended) render(0);
    } else frame = requestAnimationFrame(tick);
  }

  function select(value) {
    if (
      !["voyage", "merger", ...galaxies.map((item) => item.type)].includes(
        value,
      )
    )
      return;
    sceneName = value;
    encounterStart = elapsed;
    canvas.dataset.scene = value;
    const selectElement = document.getElementById("galaxy-scene-select");
    if (selectElement) selectElement.value = value;
    if (animationPaused()) render(0, true);
    sync();
  }

  on(
    document.getElementById("galaxy-scene-select") || canvas,
    "change",
    (event) => select(event.target.value),
  );
  on(document.getElementById("galaxy-encounter") || canvas, "click", () =>
    select("merger"),
  );
  on(window, "hh:galaxy-explore", (event) => {
    exploring = !!event.detail?.active;
    if (animationPaused()) {
      exploreMix = exploring ? 1 : 0;
      render(0, true);
    }
    sync();
  });
  on(window, "hh:galaxy-reset", () => {
    pointerTarget.set(0, 0);
    pointerUntil = 0;
    select("voyage");
  });
  on(window, "hh:galaxy-navigate", (event) => {
    if (!exploring || animationPaused()) return;
    pointerTarget.set(
      THREE.MathUtils.clamp(event.detail?.x || 0, -1, 1),
      THREE.MathUtils.clamp(event.detail?.y || 0, -1, 1),
    );
    pointerUntil = performance.now() + 5000;
  });
  on(
    window,
    "pointermove",
    (event) => {
      if (animationPaused()) return;
      pointerTarget.set(
        (event.clientX / width) * 2 - 1,
        1 - (event.clientY / height) * 2,
      );
      pointerUntil = performance.now() + 2500;
    },
    { passive: true },
  );
  on(
    window,
    "pointerdown",
    (event) => {
      if (animationPaused()) return;
      pointerTarget.set(
        (event.clientX / width) * 2 - 1,
        1 - (event.clientY / height) * 2,
      );
      pointerUntil = performance.now() + 3000;
    },
    { passive: true },
  );
  on(window, "blur", () => {
    pointerTarget.set(0, 0);
    pointerUntil = 0;
  });
  on(
    window,
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    },
    { passive: true },
  );
  on(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    fallback("context-lost");
  });
  on(canvas, "webglcontextrestored", () => {
    lost = false;
    resize();
    sync();
  });
  const observer = new IntersectionObserver((entries) => {
    visible = !!entries[0]?.isIntersecting;
    sync();
  });
  observer.observe(canvas);
  canvas.dataset.scene = sceneName;
  resize();
  return {
    sync,
    dispose() {
      destroyed = true;
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      listeners.abort();
      observer.disconnect();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      root.classList.remove("galaxy-ready");
    },
  };
}

if (canvas) {
  const listen = (target, name, handler) =>
    target.addEventListener(name, handler, { signal: lifetime.signal });
  listen(reducedMotion, "change", schedule);
  listen(forcedColors, "change", schedule);
  if (connection) listen(connection, "change", schedule);
  listen(document, "visibilitychange", schedule);
  listen(window, "hh:motion", () => engine?.sync());
  listen(window, "beforeprint", () => {
    printing = true;
    engine?.sync();
  });
  listen(window, "afterprint", () => {
    printing = false;
    schedule();
  });
  listen(window, "pagehide", (event) => {
    pageSuspended = true;
    if (event.persisted) engine?.sync();
    else {
      disposed = true;
      if (idleHandle !== null) {
        if ("cancelIdleCallback" in window) cancelIdleCallback(idleHandle);
        else clearTimeout(idleHandle);
      }
      engine?.dispose();
      lifetime.abort();
    }
  });
  listen(window, "pageshow", () => {
    pageSuspended = false;
    schedule();
  });
  fallback();
  // Two animation frames keep enhancement work behind the first content paint.
  requestAnimationFrame(() => requestAnimationFrame(schedule));
}
