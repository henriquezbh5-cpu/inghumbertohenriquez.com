(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Premium 3D point-cloud network background.
  // Vanilla JS / IIFE. Assumes global THREE (r128) is already loaded and a
  // <canvas id="bg-canvas"> + <div class="bg-fallback"> already exist in DOM.
  // ---------------------------------------------------------------------------

  // --- Re-init guard: tear down any previous instance (SPA / HMR safe) -------
  if (typeof window.__bgNetworkDispose === 'function') {
    try { window.__bgNetworkDispose(); } catch (e) { /* ignore */ }
    window.__bgNetworkDispose = null;
  }

  var prefersReduced =
    !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var canvas = document.getElementById('bg-canvas');

  // Graceful static fallback: add body class, let CSS show the gradient.
  function bailToStatic() {
    if (document.body) {
      document.body.classList.add('bg-static');
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.classList.add('bg-static');
      }, { once: true });
    }
  }

  // If reduced-motion, THREE missing, or no canvas: do nothing but show static.
  if (prefersReduced || typeof THREE === 'undefined' || !canvas) {
    bailToStatic();
    return;
  }

  // --- Environment / sizing helpers -----------------------------------------
  var isMobile =
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
    (typeof navigator !== 'undefined' &&
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || ''));

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  // --- Renderer (wrapped in try/catch) ---------------------------------------
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
  } catch (e) {
    bailToStatic();
    return;
  }
  if (!renderer || typeof renderer.getContext !== 'function' || !renderer.getContext()) {
    // Could not obtain a usable WebGL context.
    try { if (renderer) renderer.dispose(); } catch (e2) { /* ignore */ }
    bailToStatic();
    return;
  }

  var W = window.innerWidth;
  var H = window.innerHeight;
  var pixelCap = isMobile ? 1.5 : 2;

  renderer.setPixelRatio(clamp(window.devicePixelRatio || 1, 1, pixelCap));
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0); // transparent; CSS paper background shows through

  // --- Scene / camera / fog ---------------------------------------------------
  var scene = new THREE.Scene();
  // Paper fog: depth fade goes to archival paper, not darkness.
  scene.fog = new THREE.FogExp2(0xF6F4EE, 0.03);

  var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.set(0, 0, 18);

  // --- Network geometry -------------------------------------------------------
  // Node count scales with screen size for performance.
  var area = W * H;
  var NODE_COUNT;
  if (isMobile) NODE_COUNT = 70;
  else if (area < 800000) NODE_COUNT = 110; // small windows
  else if (area < 1700000) NODE_COUNT = 160;
  else NODE_COUNT = 220;

  var SPREAD_X = 26;
  var SPREAD_Y = 16;
  var SPREAD_Z = 18;
  var LINK_DIST = isMobile ? 4.6 : 4.2; // connection radius
  var MAX_LINKS = isMobile ? 360 : 900; // cap segments for perf

  // Ink-on-paper palette
  var COL_STEEL = new THREE.Color(0x2D6A9F);
  var COL_INK = new THREE.Color(0x0F2B46);
  var COL_TEAL = new THREE.Color(0x0F766E);

  // Per-node state arrays
  var positions = new Float32Array(NODE_COUNT * 3);
  var basePos = new Float32Array(NODE_COUNT * 3); // drift origin
  var phase = new Float32Array(NODE_COUNT); // drift phase
  var drift = new Float32Array(NODE_COUNT * 3); // drift amplitudes
  var pointColors = new Float32Array(NODE_COUNT * 3);

  for (var i = 0; i < NODE_COUNT; i++) {
    var x = (Math.random() - 0.5) * SPREAD_X;
    var y = (Math.random() - 0.5) * SPREAD_Y;
    var z = (Math.random() - 0.5) * SPREAD_Z;
    basePos[i * 3] = x;
    basePos[i * 3 + 1] = y;
    basePos[i * 3 + 2] = z;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    phase[i] = Math.random() * Math.PI * 2;
    drift[i * 3] = 0.4 + Math.random() * 0.9;
    drift[i * 3 + 1] = 0.4 + Math.random() * 0.9;
    drift[i * 3 + 2] = 0.3 + Math.random() * 0.7;

    // Color: faint ink schematic — steel blue lerped toward ink navy,
    // ~20% of nodes pulled toward live teal.
    var ct = Math.random();
    var c = COL_STEEL.clone().lerp(COL_INK, ct);
    if (Math.random() < 0.2) c.lerp(COL_TEAL, 0.65);
    pointColors[i * 3] = c.r;
    pointColors[i * 3 + 1] = c.g;
    pointColors[i * 3 + 2] = c.b;
  }

  // --- Soft circular glow sprite (procedural, no external textures) ----------
  function makeGlowTexture() {
    var size = 64;
    var cv = document.createElement('canvas');
    cv.width = cv.height = size;
    var ctx = cv.getContext('2d');
    var g = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
  }
  var glowTex = makeGlowTexture();

  // --- Points (nodes) ---------------------------------------------------------
  var pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  pointsGeo.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(pointColors, 3)
  );

  var pointsMat = new THREE.PointsMaterial({
    size: isMobile ? 0.45 : 0.38,
    map: glowTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.NormalBlending,
    sizeAttenuation: true,
    fog: true
  });
  var points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  // --- Lines (mesh connections) ----------------------------------------------
  // Allocate a fixed buffer (2 verts per segment) and rebuild positions/colors
  // periodically rather than every frame for performance.
  var maxVerts = MAX_LINKS * 2;
  var linePositions = new Float32Array(maxVerts * 3);
  var lineColors = new Float32Array(maxVerts * 3);

  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  lineGeo.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage)
  );
  lineGeo.setDrawRange(0, 0);

  // Flat steel ink lines: on paper, vertex-color fade would darken toward
  // black (more visible, not less), so a uniform faint color is used instead.
  var lineMat = new THREE.LineBasicMaterial({
    color: 0x2D6A9F,
    vertexColors: false,
    transparent: true,
    opacity: 0.10,
    blending: THREE.NormalBlending,
    depthWrite: false,
    fog: true
  });
  var lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // Precompute candidate neighbor pairs once (static topology on base layout),
  // then we only update vertex positions each rebuild. This avoids O(n^2)
  // distance scans every frame.
  var pairs = [];
  (function buildPairs() {
    var linkDist2 = LINK_DIST * LINK_DIST;
    for (var a = 0; a < NODE_COUNT; a++) {
      for (var b = a + 1; b < NODE_COUNT; b++) {
        var dx = basePos[a * 3] - basePos[b * 3];
        var dy = basePos[a * 3 + 1] - basePos[b * 3 + 1];
        var dz = basePos[a * 3 + 2] - basePos[b * 3 + 2];
        var d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < linkDist2) {
          pairs.push(a, b, Math.sqrt(d2));
          if (pairs.length / 3 >= MAX_LINKS) return;
        }
      }
    }
  })();

  function updateLines() {
    var segCount = 0;
    var p = 0;
    var c = 0;
    var n = pairs.length / 3;
    for (var k = 0; k < n; k++) {
      var a = pairs[k * 3];
      var b = pairs[k * 3 + 1];
      var rest = pairs[k * 3 + 2];

      var ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
      var bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];

      // Fade lines by current length so stretched links dim out naturally.
      var dx = ax - bx, dy = ay - by, dz = az - bz;
      var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      var fade = clamp(1 - (len - rest) / (LINK_DIST * 0.9), 0, 1);
      fade *= clamp(1 - (len / (LINK_DIST + 1.5)), 0, 1) + 0.15;

      linePositions[p++] = ax;
      linePositions[p++] = ay;
      linePositions[p++] = az;
      linePositions[p++] = bx;
      linePositions[p++] = by;
      linePositions[p++] = bz;

      var car = pointColors[a * 3] * fade;
      var cag = pointColors[a * 3 + 1] * fade;
      var cab = pointColors[a * 3 + 2] * fade;
      var cbr = pointColors[b * 3] * fade;
      var cbg = pointColors[b * 3 + 1] * fade;
      var cbb = pointColors[b * 3 + 2] * fade;

      lineColors[c++] = car; lineColors[c++] = cag; lineColors[c++] = cab;
      lineColors[c++] = cbr; lineColors[c++] = cbg; lineColors[c++] = cbb;

      segCount++;
    }
    lineGeo.setDrawRange(0, segCount * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  // (Ambient glow sprites removed: additive halos are invisible/muddy on paper.)

  // --- Interaction: mouse + device orientation parallax ----------------------
  var targetX = 0, targetY = 0; // normalized, hard-clamped to -1..1
  var curX = 0, curY = 0;

  function onPointerMove(e) {
    var cx = e.clientX, cy = e.clientY;
    if (typeof cx !== 'number' && e.touches && e.touches[0]) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    }
    if (typeof cx !== 'number' || typeof cy !== 'number') return;
    // Bound parallax target: dragging outside the viewport must not run away.
    targetX = clamp((cx / window.innerWidth) * 2 - 1, -1, 1);
    targetY = clamp((cy / window.innerHeight) * 2 - 1, -1, 1);
  }

  function onOrient(e) {
    // gamma: left/right [-90..90], beta: front/back [-180..180]
    if (e.gamma == null || e.beta == null) return;
    targetX = clamp(e.gamma / 45, -1, 1);
    targetY = clamp((e.beta - 45) / 45, -1, 1);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', onOrient, { passive: true });
  }

  // --- Resize (throttled / debounced) ----------------------------------------
  var resizeTimer = null;
  function applyResize() {
    resizeTimer = null;
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setPixelRatio(clamp(window.devicePixelRatio || 1, 1, pixelCap));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  function onResize() {
    if (resizeTimer !== null) return; // throttle: ignore until pending fires
    resizeTimer = setTimeout(applyResize, 150);
  }
  window.addEventListener('resize', onResize, { passive: true });

  // --- Visibility: pause/resume rAF ------------------------------------------
  var running = true;
  var rafId = null;
  var clock = new THREE.Clock();
  var lineRebuildAccum = 0;
  var LINE_REBUILD_INTERVAL = isMobile ? 0.066 : 0.033; // ~15fps / ~30fps

  function start() {
    if (rafId === null) rafId = requestAnimationFrame(animate);
  }
  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function onVisibility() {
    if (document.hidden) {
      running = false;
      stop();
    } else if (!running) {
      running = true;
      clock.getDelta(); // discard accumulated time gap
      start();
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  // --- Animation loop ---------------------------------------------------------
  var t = 0;
  function animate() {
    // Schedule next frame first so an early-return never stalls the loop.
    rafId = requestAnimationFrame(animate);
    if (!running) return;

    var dt = Math.min(clock.getDelta(), 0.05); // clamp delta on tab refocus
    t += dt;

    // Gentle node drift (slow, organic).
    var posAttr = pointsGeo.attributes.position;
    for (var i = 0; i < NODE_COUNT; i++) {
      var ph = phase[i];
      var bx = basePos[i * 3];
      var by = basePos[i * 3 + 1];
      var bz = basePos[i * 3 + 2];
      positions[i * 3] = bx + Math.sin(t * 0.18 + ph) * drift[i * 3] * 0.6;
      positions[i * 3 + 1] =
        by + Math.cos(t * 0.15 + ph * 1.3) * drift[i * 3 + 1] * 0.6;
      positions[i * 3 + 2] =
        bz + Math.sin(t * 0.12 + ph * 0.7) * drift[i * 3 + 2] * 0.6;
    }
    posAttr.needsUpdate = true;

    // Rebuild line buffer at a throttled rate.
    lineRebuildAccum += dt;
    if (lineRebuildAccum >= LINE_REBUILD_INTERVAL) {
      lineRebuildAccum = 0;
      updateLines();
    }

    // Smooth parallax toward target (ease). curX/curY inherit target's -1..1 bound.
    curX += (targetX - curX) * 0.04;
    curY += (targetY - curY) * 0.04;

    // Slow autonomous orbit + bounded mouse parallax.
    var orbit = t * 0.04;
    camera.position.x = Math.sin(orbit) * 1.4 + curX * 3.2;
    camera.position.y = Math.cos(orbit * 0.8) * 0.9 - curY * 2.2;
    camera.position.z = 18 + Math.sin(t * 0.05) * 1.2;
    camera.lookAt(0, 0, 0);

    // Whole mesh rotates ever so slightly for life.
    points.rotation.y = orbit * 0.25;
    lines.rotation.y = points.rotation.y;
    points.rotation.x = Math.sin(t * 0.05) * 0.05;
    lines.rotation.x = points.rotation.x;

    renderer.render(scene, camera);
  }

  // First line build, then start.
  updateLines();
  start();

  // --- Teardown (dispose) -----------------------------------------------------
  var isDisposed = false;
  function dispose() {
    if (isDisposed) return; // idempotent
    isDisposed = true;

    running = false;
    stop();

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    if (window.DeviceOrientationEvent) {
      window.removeEventListener('deviceorientation', onOrient);
    }
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', dispose);
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }

    scene.remove(points);
    scene.remove(lines);

    pointsGeo.dispose();
    pointsMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
    glowTex.dispose();

    renderer.dispose();
    if (typeof renderer.forceContextLoss === 'function') {
      try { renderer.forceContextLoss(); } catch (e) { /* ignore */ }
    }

    if (window.__bgNetworkDispose === dispose) {
      window.__bgNetworkDispose = null;
    }
  }
  window.addEventListener('pagehide', dispose);
  // Expose for SPA route teardown / re-init guard.
  window.__bgNetworkDispose = dispose;
})();