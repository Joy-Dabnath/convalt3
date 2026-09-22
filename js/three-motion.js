/* ==================================================================
 * three-motion.js — site-wide 3D motion layer (Three.js)
 * ------------------------------------------------------------------
 * Adds ONE fixed WebGL canvas BEHIND the existing page. No markup,
 * text, spacing or styling of the design is touched.
 *
 *   - Living particle "energy core" that morphs between 5 forms
 *     (globe -> ring -> crystal -> cable helix -> energy field)
 *     as you scroll from the top bar to the footer.
 *   - Pose (position / scale / tilt) is keyed to the REAL sections
 *     in <main> + <footer>, alternating left / right so it never
 *     sits on top of the copy.
 *   - Scroll velocity drives distortion + spin; the pointer pushes
 *     the particles (desktop).
 *   - Depth dust layer with scroll parallax.
 *   - Colours are read live from the theme's --accent, so the
 *     light / dark switcher re-colours the scene automatically.
 *
 * Needs: js/three.min.js loaded first. Works with the existing
 * Lenis smooth-scroll (it only reads window.scrollY).
 * Safe fallbacks: no WebGL / reduced motion / hidden tab / context
 * loss / slow GPU (auto lowers resolution).
 * ================================================================== */
(function () {
  "use strict";

  if (typeof THREE === "undefined") {
    console.warn("[three-motion] three.min.js not found — 3D layer skipped.");
    return;
  }

  var doc = document;
  var root = doc.documentElement;
  var win = window;

  /* Colours are used exactly as authored (the shaders output them as-is). */
  if (THREE.ColorManagement) THREE.ColorManagement.enabled = false;

  var reduceMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = win.innerWidth < 768;

  /* ---------- 01. Renderer / scene / camera ---------- */

  var canvas = doc.createElement("canvas");
  canvas.id = "webgl";
  canvas.setAttribute("aria-hidden", "true");
  doc.body.insertBefore(canvas, doc.body.firstChild);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance"
    });
  } catch (err) {
    console.warn("[three-motion] WebGL unavailable — 3D layer skipped.", err);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    return;
  }
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var CAM_Z = 8;
  var FOV = 38;
  var camera = new THREE.PerspectiveCamera(FOV, win.innerWidth / win.innerHeight, 0.1, 60);
  camera.position.set(0, 0, CAM_Z);

  var maxPixelRatio = isMobile ? 1.5 : 1.75;
  var pixelRatio = Math.min(win.devicePixelRatio || 1, maxPixelRatio);

  /* ---------- 02. Theme colours ---------- */

  var uniformsShared = {
    uColA: { value: new THREE.Color("#DDF160") },
    uColB: { value: new THREE.Color("#ffffff") },
    uOpacity: { value: 1 }
  };
  var isDark = true;
  var lineColor = new THREE.Color("#DDF160");

  function readTheme() {
    var attr = root.getAttribute("color-scheme");
    isDark = attr ? attr === "dark" : win.matchMedia("(prefers-color-scheme: dark)").matches;
    var cs = win.getComputedStyle(root);
    var accent = (cs.getPropertyValue("--accent") || "").trim() || (isDark ? "#DDF160" : "#9F8BE7");
    var a = new THREE.Color();
    try { a.set(accent); } catch (e) { a.set(isDark ? "#DDF160" : "#9F8BE7"); }
    var b = a.clone().lerp(new THREE.Color(isDark ? "#ffffff" : "#161616"), isDark ? 0.55 : 0.35);
    uniformsShared.uColA.value.copy(a);
    uniformsShared.uColB.value.copy(b);
    uniformsShared.uOpacity.value = isDark ? 1.0 : 0.9;
    lineColor.copy(a);
    applyBlending();
  }

  var blendables = [];
  function applyBlending() {
    var mode = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    for (var i = 0; i < blendables.length; i++) {
      blendables[i].blending = mode;
      blendables[i].needsUpdate = true;
      if (blendables[i].color) blendables[i].color.copy(lineColor);
    }
  }

  /* ---------- 03. Shape targets for the morphing particle core ---------- */

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function frac(x) { return x - Math.floor(x); }

  var COUNT = isMobile ? 6500 : 15000;
  var DUST = isMobile ? 420 : 950;

  function buildShapes(n) {
    var rand = mulberry32(1337);
    var sphere = new Float32Array(n * 3);
    var torus = new Float32Array(n * 3);
    var cube = new Float32Array(n * 3);
    var helix = new Float32Array(n * 3);
    var plane = new Float32Array(n * 3);
    var rnds = new Float32Array(n);

    var GOLD = Math.PI * (3 - Math.sqrt(5));
    var i, i3, r, th, y, a, b, u, v;

    for (i = 0; i < n; i++) {
      i3 = i * 3;
      rnds[i] = rand();

      /* sphere — fibonacci lattice, radius 1.35 */
      y = 1 - 2 * (i + 0.5) / n;
      r = Math.sqrt(1 - y * y);
      th = i * GOLD;
      sphere[i3] = Math.cos(th) * r * 1.35;
      sphere[i3 + 1] = y * 1.35;
      sphere[i3 + 2] = Math.sin(th) * r * 1.35;

      /* torus — low-discrepancy angles, major 1.25 / minor 0.42 */
      a = frac(i * 0.7548776662) * Math.PI * 2;
      b = frac(i * 0.5698402910) * Math.PI * 2;
      torus[i3] = (1.25 + 0.42 * Math.cos(b)) * Math.cos(a);
      torus[i3 + 1] = 0.42 * Math.sin(b) * 1.15;
      torus[i3 + 2] = (1.25 + 0.42 * Math.cos(b)) * Math.sin(a);

      /* cube surface — half size 1.05 */
      u = (frac(i * 0.7548776662) * 2 - 1) * 1.05;
      v = (frac(i * 0.5698402910) * 2 - 1) * 1.05;
      var face = Math.floor(rand() * 6);
      var h = 1.05;
      if (face === 0) { cube[i3] = h; cube[i3 + 1] = u; cube[i3 + 2] = v; }
      else if (face === 1) { cube[i3] = -h; cube[i3 + 1] = u; cube[i3 + 2] = v; }
      else if (face === 2) { cube[i3] = u; cube[i3 + 1] = h; cube[i3 + 2] = v; }
      else if (face === 3) { cube[i3] = u; cube[i3 + 1] = -h; cube[i3 + 2] = v; }
      else if (face === 4) { cube[i3] = u; cube[i3 + 1] = v; cube[i3 + 2] = h; }
      else { cube[i3] = u; cube[i3 + 1] = v; cube[i3 + 2] = -h; }

      /* double-helix cable with rungs */
      y = (frac(i * 0.7548776662) - 0.5) * 4.4;
      a = y * 2.4 + (i % 2) * Math.PI;
      if (i % 5 === 0) {
        var s = frac(i * 0.5698402910) * 2 - 1;
        helix[i3] = Math.cos(a) * 0.85 * s;
        helix[i3 + 1] = y;
        helix[i3 + 2] = Math.sin(a) * 0.85 * s;
      } else {
        helix[i3] = Math.cos(a) * 0.85 + (rand() - 0.5) * 0.14;
        helix[i3 + 1] = y;
        helix[i3 + 2] = Math.sin(a) * 0.85 + (rand() - 0.5) * 0.14;
      }

      /* energy field — flat plane, waved in the shader */
      plane[i3] = (frac(i * 0.7548776662) - 0.5) * 4.6;
      plane[i3 + 1] = 0;
      plane[i3 + 2] = (frac(i * 0.5698402910) - 0.5) * 4.6;
    }
    return { sphere: sphere, torus: torus, cube: cube, helix: helix, plane: plane, rnds: rnds };
  }

  /* ---------- 04. Shaders ---------- */

  var NOISE_GLSL = [
    "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}",
    "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}",
    "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}",
    "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
    "float snoise(vec3 v){",
    "  const vec2 C=vec2(1.0/6.0,1.0/3.0);",
    "  const vec4 D=vec4(0.0,0.5,1.0,2.0);",
    "  vec3 i=floor(v+dot(v,C.yyy));",
    "  vec3 x0=v-i+dot(i,C.xxx);",
    "  vec3 g=step(x0.yzx,x0.xyz);",
    "  vec3 l=1.0-g;",
    "  vec3 i1=min(g.xyz,l.zxy);",
    "  vec3 i2=max(g.xyz,l.zxy);",
    "  vec3 x1=x0-i1+C.xxx;",
    "  vec3 x2=x0-i2+C.yyy;",
    "  vec3 x3=x0-D.yyy;",
    "  i=mod289(i);",
    "  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));",
    "  float n_=0.142857142857;",
    "  vec3 ns=n_*D.wyz-D.xzx;",
    "  vec4 j=p-49.0*floor(p*ns.z*ns.z);",
    "  vec4 x_=floor(j*ns.z);",
    "  vec4 y_=floor(j-7.0*x_);",
    "  vec4 x=x_*ns.x+ns.yyyy;",
    "  vec4 y=y_*ns.x+ns.yyyy;",
    "  vec4 h=1.0-abs(x)-abs(y);",
    "  vec4 b0=vec4(x.xy,y.xy);",
    "  vec4 b1=vec4(x.zw,y.zw);",
    "  vec4 s0=floor(b0)*2.0+1.0;",
    "  vec4 s1=floor(b1)*2.0+1.0;",
    "  vec4 sh=-step(h,vec4(0.0));",
    "  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;",
    "  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;",
    "  vec3 p0=vec3(a0.xy,h.x);",
    "  vec3 p1=vec3(a0.zw,h.y);",
    "  vec3 p2=vec3(a1.xy,h.z);",
    "  vec3 p3=vec3(a1.zw,h.w);",
    "  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));",
    "  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;",
    "  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);",
    "  m=m*m;",
    "  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));",
    "}"
  ].join("\n");

  var CORE_VERT = [
    "uniform float uTime, uShape, uTrans, uAmp, uSize, uPixel, uVel, uTint, uMouseOn, uPulse;",
    "uniform vec3 uMouse;",
    "attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3; attribute vec3 aP4;",
    "attribute float aRand;",
    "varying float vAlpha; varying float vMix;",
    NOISE_GLSL,
    "float wt(float k){ return smoothstep(0.0, 1.0, clamp(1.0 - abs(uShape - k), 0.0, 1.0)); }",
    "void main(){",
    "  float w0=wt(0.0), w1=wt(1.0), w2=wt(2.0), w3=wt(3.0), w4=wt(4.0);",
    "  vec3 p = position*w0 + aP1*w1 + aP2*w2 + aP3*w3 + aP4*w4;",
    "  vec3 n = normalize(p + vec3(0.0001));",
    "  float t = uTime;",
    "  float nz = snoise(p*1.15 + vec3(0.0, 0.0, t*0.22));",
    "  p += n * nz * (uAmp + uVel*0.28);",
    "  p += n * uPulse * sin(p.y*4.0 - (1.0 - uPulse)*16.0) * 0.16;",
    "  p.y += w4 * (sin(p.x*1.7 + t*0.9) * cos(p.z*1.5 + t*0.7) * 0.34 + nz*0.08);",
    "  p.xz += w3 * 0.05 * vec2(sin(p.y*3.0 + t), cos(p.y*3.0 + t));",
    "  vec3 rv = vec3(snoise(p + vec3(3.1, t*0.10, 0.0)), snoise(p + vec3(0.0, 5.7, t*0.10)), snoise(p + vec3(8.3, 0.0, t*0.10)));",
    "  p += rv * uTrans * 1.35;",
    "  float md = distance(p, uMouse);",
    "  float push = smoothstep(1.25, 0.0, md) * uMouseOn;",
    "  p += n * push * 0.34;",
    "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  float tw = 0.75 + 0.25*sin(t*1.6 + aRand*40.0);",
    "  gl_PointSize = uSize * uPixel * (0.55 + aRand*0.9) * tw * (1.0 + push*0.8) / -mv.z;",
    "  vAlpha = (0.35 + 0.65*aRand) * (0.6 + 0.4*nz) * (1.0 - uTrans*0.35) + push*0.4;",
    "  vMix = clamp(aRand*uTint*1.6 + push, 0.0, 1.0);",
    "}"
  ].join("\n");

  var CORE_FRAG = [
    "uniform vec3 uColA; uniform vec3 uColB; uniform float uOpacity;",
    "varying float vAlpha; varying float vMix;",
    "void main(){",
    "  float d = length(gl_PointCoord - 0.5);",
    "  if (d > 0.5) discard;",
    "  float a = pow(1.0 - d*2.0, 1.6);",
    "  gl_FragColor = vec4(mix(uColA, uColB, vMix), a * vAlpha * uOpacity);",
    "}"
  ].join("\n");

  var DUST_VERT = [
    "uniform float uTime, uScroll, uPixel;",
    "attribute float aRand;",
    "varying float vA;",
    "void main(){",
    "  vec3 p = position;",
    "  float d = 0.3 + aRand*0.7;",
    "  p.y = mod(p.y + uScroll*d*1.4 + uTime*0.03*d + 8.0, 16.0) - 8.0;",
    "  p.x += sin(uTime*0.15 + aRand*30.0)*0.15;",
    "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  gl_PointSize = (9.0 * uPixel * (0.4 + aRand)) / -mv.z;",
    "  vA = (0.15 + 0.5*aRand) * (0.6 + 0.4*sin(uTime*1.2 + aRand*60.0));",
    "}"
  ].join("\n");

  var DUST_FRAG = [
    "uniform vec3 uColA; uniform vec3 uColB; uniform float uOpacity;",
    "varying float vA;",
    "void main(){",
    "  float d = length(gl_PointCoord - 0.5);",
    "  if (d > 0.5) discard;",
    "  float a = pow(1.0 - d*2.0, 2.0);",
    "  gl_FragColor = vec4(mix(uColA, uColB, 0.6), a * vA * uOpacity * 0.9);",
    "}"
  ].join("\n");

  var STREAK_VERT = [
    "uniform float uScroll, uVel, uDir;",
    "attribute float aEnd; attribute float aRand;",
    "varying float vA;",
    "void main(){",
    "  vec3 p = position;",
    "  float d = 0.3 + aRand*0.7;",
    "  p.y = mod(p.y + uScroll*d*1.4 + 8.0, 16.0) - 8.0;",
    "  p.y -= aEnd * uDir * uVel * (0.5 + aRand*2.6);",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
    "  vA = (1.0 - aEnd) * uVel * (0.25 + aRand*0.6);",
    "}"
  ].join("\n");
  var STREAK_FRAG = [
    "uniform vec3 uColA; uniform vec3 uColB; uniform float uOpacity;",
    "varying float vA;",
    "void main(){ gl_FragColor = vec4(mix(uColA, uColB, 0.5), vA * uOpacity); }"
  ].join("\n");

  /* ---------- 05. Objects ---------- */

  var group = new THREE.Group();
  scene.add(group);

  /* core particle body */
  var shapes = buildShapes(COUNT);
  var coreGeo = new THREE.BufferGeometry();
  coreGeo.setAttribute("position", new THREE.BufferAttribute(shapes.sphere, 3));
  coreGeo.setAttribute("aP1", new THREE.BufferAttribute(shapes.torus, 3));
  coreGeo.setAttribute("aP2", new THREE.BufferAttribute(shapes.cube, 3));
  coreGeo.setAttribute("aP3", new THREE.BufferAttribute(shapes.helix, 3));
  coreGeo.setAttribute("aP4", new THREE.BufferAttribute(shapes.plane, 3));
  coreGeo.setAttribute("aRand", new THREE.BufferAttribute(shapes.rnds, 1));
  coreGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);

  var coreU = {
    uTime: { value: 0 },
    uShape: { value: 0 },
    uTrans: { value: 0 },
    uAmp: { value: 0.12 },
    uSize: { value: isMobile ? 24 : 30 },
    uPixel: { value: pixelRatio },
    uVel: { value: 0 },
    uPulse: { value: 0 },
    uTint: { value: 0.2 },
    uMouse: { value: new THREE.Vector3(99, 99, 99) },
    uMouseOn: { value: 0 },
    uColA: uniformsShared.uColA,
    uColB: uniformsShared.uColB,
    uOpacity: uniformsShared.uOpacity
  };
  var coreMat = new THREE.ShaderMaterial({
    uniforms: coreU,
    vertexShader: CORE_VERT,
    fragmentShader: CORE_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false
  });
  blendables.push(coreMat);
  var core = new THREE.Points(coreGeo, coreMat);
  core.frustumCulled = false;
  group.add(core);

  /* wire shell */
  var wireGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.78, 2));
  var wireMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.1, depthWrite: false, depthTest: false });
  blendables.push(wireMat);
  var wire = new THREE.LineSegments(wireGeo, wireMat);
  group.add(wire);

  /* orbit rings + travelling nodes */
  function circleTexture() {
    var c = doc.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.9)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var dotTex = circleTexture();

  var rings = [];
  function addRing(radius, tiltX, tiltZ, speed, nodeCount) {
    var pts = [];
    for (var i = 0; i < 160; i++) {
      var a = (i / 160) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    var lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    var lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.32, depthWrite: false, depthTest: false });
    blendables.push(lineMat);
    var loop = new THREE.LineLoop(lineGeo, lineMat);

    var nodePos = new Float32Array(nodeCount * 3);
    for (var k = 0; k < nodeCount; k++) {
      var na = (k / nodeCount) * Math.PI * 2 + radius;
      nodePos[k * 3] = Math.cos(na) * radius;
      nodePos[k * 3 + 1] = 0;
      nodePos[k * 3 + 2] = Math.sin(na) * radius;
    }
    var nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    var nodeMat = new THREE.PointsMaterial({
      size: 0.12, map: dotTex, transparent: true, opacity: 0.95,
      depthWrite: false, depthTest: false, sizeAttenuation: true
    });
    blendables.push(nodeMat);
    var nodes = new THREE.Points(nodeGeo, nodeMat);
    nodes.frustumCulled = false;

    var holder = new THREE.Group();
    holder.add(loop);
    holder.add(nodes);
    holder.rotation.x = tiltX;
    holder.rotation.z = tiltZ;
    group.add(holder);
    rings.push({ holder: holder, lineMat: lineMat, nodeMat: nodeMat, speed: speed, base: { lo: 0.32, no: 0.95 }, spin: 0 });
  }
  addRing(2.05, 1.15, 0.25, 0.22, 2);
  addRing(2.45, 0.55, -0.6, -0.15, 3);
  addRing(2.85, 1.45, 0.9, 0.1, 2);

  /* depth dust (world space, scroll parallax) */
  var dustGeo = new THREE.BufferGeometry();
  var dPos = new Float32Array(DUST * 3);
  var dRnd = new Float32Array(DUST);
  var drand = mulberry32(4242);
  for (var d = 0; d < DUST; d++) {
    dPos[d * 3] = (drand() - 0.5) * 24;
    dPos[d * 3 + 1] = (drand() - 0.5) * 16;
    dPos[d * 3 + 2] = -10 + drand() * 13;
    dRnd[d] = drand();
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute("aRand", new THREE.BufferAttribute(dRnd, 1));
  dustGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  var dustU = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPixel: { value: pixelRatio },
    uColA: uniformsShared.uColA,
    uColB: uniformsShared.uColB,
    uOpacity: uniformsShared.uOpacity
  };
  var dustMat = new THREE.ShaderMaterial({
    uniforms: dustU,
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false
  });
  blendables.push(dustMat);
  var dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  dust.renderOrder = -1;
  scene.add(dust);

  /* velocity streaks — appear only while scrolling, stretched in scroll direction */
  var STREAKS = isMobile ? 90 : 220;
  var stGeo = new THREE.BufferGeometry();
  var sPos = new Float32Array(STREAKS * 2 * 3);
  var sEnd = new Float32Array(STREAKS * 2);
  var sRnd = new Float32Array(STREAKS * 2);
  var srand = mulberry32(777);
  for (var q = 0; q < STREAKS; q++) {
    var sx = (srand() - 0.5) * 22, sy0 = (srand() - 0.5) * 16, sz = -8 + srand() * 12, sr = srand();
    for (var e = 0; e < 2; e++) {
      var ix = q * 2 + e;
      sPos[ix * 3] = sx; sPos[ix * 3 + 1] = sy0; sPos[ix * 3 + 2] = sz;
      sEnd[ix] = e; sRnd[ix] = sr;
    }
  }
  stGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  stGeo.setAttribute("aEnd", new THREE.BufferAttribute(sEnd, 1));
  stGeo.setAttribute("aRand", new THREE.BufferAttribute(sRnd, 1));
  stGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  var streakU = {
    uScroll: { value: 0 },
    uVel: { value: 0 },
    uDir: { value: 1 },
    uColA: uniformsShared.uColA,
    uColB: uniformsShared.uColB,
    uOpacity: uniformsShared.uOpacity
  };
  var streakMat = new THREE.ShaderMaterial({
    uniforms: streakU,
    vertexShader: STREAK_VERT,
    fragmentShader: STREAK_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false
  });
  blendables.push(streakMat);
  var streaks = new THREE.LineSegments(stGeo, streakMat);
  streaks.frustumCulled = false;
  streaks.renderOrder = -1;
  scene.add(streaks);

  /* colour + blending after all materials exist */
  readTheme();
  new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ["color-scheme"] });
  var mqDark = win.matchMedia("(prefers-color-scheme: dark)");
  if (mqDark.addEventListener) mqDark.addEventListener("change", readTheme);

  /* ---------- 06. Section choreography ---------- */
  /* One pose per section, top -> bottom.
   *   shape: 0 globe · 1 ring · 2 crystal · 3 cable helix · 4 energy field
   *   xf:    horizontal position, fraction of half the screen width
   *          (+ right / - left) — alternates so copy stays clear
   *   y, z:  offsets   sc: scale   rx: tilt   ring/wire: 0..1 visibility
   *   amp:   surface turbulence   tint: secondary-colour mix
   */
  var POSES = [
    { shape: 0, xf: 0.50, y: 0.00, z: 0.0, sc: 1.15, rx: 0.20, ring: 1.0, wire: 0.9, amp: 0.12, tint: 0.20 }, // hero
    { shape: 0, xf: -0.52, y: 0.00, z: -0.4, sc: 0.95, rx: 0.10, ring: 0.6, wire: 0.5, amp: 0.10, tint: 0.30 }, // projects
    { shape: 1, xf: 0.52, y: -0.10, z: 0.0, sc: 1.00, rx: 1.00, ring: 0.3, wire: 0.0, amp: 0.08, tint: 0.35 }, // statement
    { shape: 1, xf: 0.00, y: 0.00, z: -3.0, sc: 1.05, rx: 0.70, ring: 0.0, wire: 0.0, amp: 0.05, tint: 0.40 }, // stacked cards
    { shape: 2, xf: -0.55, y: 0.00, z: 0.0, sc: 0.95, rx: 0.35, ring: 0.5, wire: 0.0, amp: 0.05, tint: 0.45 }, // circular CTA
    { shape: 2, xf: 0.55, y: 0.05, z: 0.0, sc: 1.00, rx: 0.45, ring: 0.3, wire: 0.0, amp: 0.06, tint: 0.50 }, // engineered
    { shape: 3, xf: 0.00, y: 0.00, z: -2.6, sc: 1.10, rx: 0.10, ring: 0.0, wire: 0.0, amp: 0.05, tint: 0.55 }, // inner headline
    { shape: 3, xf: -0.55, y: 0.00, z: 0.0, sc: 1.00, rx: 0.15, ring: 0.2, wire: 0.0, amp: 0.05, tint: 0.55 }, // divider
    { shape: 3, xf: 0.52, y: 0.00, z: -0.6, sc: 1.05, rx: 0.10, ring: 0.2, wire: 0.0, amp: 0.05, tint: 0.60 }, // statement 2
    { shape: 4, xf: 0.00, y: -0.20, z: -1.8, sc: 1.35, rx: 1.10, ring: 0.0, wire: 0.0, amp: 0.05, tint: 0.60 }, // people
    { shape: 4, xf: 0.00, y: -0.30, z: -3.2, sc: 1.50, rx: 1.20, ring: 0.0, wire: 0.0, amp: 0.04, tint: 0.65 }, // press
    { shape: 3, xf: -0.52, y: 0.00, z: -0.4, sc: 1.00, rx: 0.20, ring: 0.2, wire: 0.0, amp: 0.06, tint: 0.55 }, // statement 3
    { shape: 2, xf: 0.52, y: 0.00, z: 0.0, sc: 0.95, rx: 0.40, ring: 0.5, wire: 0.0, amp: 0.06, tint: 0.50 }, // media
    { shape: 1, xf: 0.00, y: 0.00, z: -1.2, sc: 1.35, rx: 0.90, ring: 0.7, wire: 0.2, amp: 0.08, tint: 0.45 }, // closing
    { shape: 0, xf: 0.00, y: 0.00, z: -0.8, sc: 1.55, rx: 0.15, ring: 1.0, wire: 0.8, amp: 0.20, tint: 0.60 }  // footer
  ];
  var POSE_KEYS = ["shape", "xf", "y", "z", "sc", "rx", "ring", "wire", "amp", "tint"];

  var sections = [];
  var tops = [];
  var poseFor = [];

  function collectSections() {
    var list = [];
    var main = doc.getElementById("joy-page-content");
    if (main) {
      for (var i = 0; i < main.children.length; i++) {
        if (main.children[i].classList.contains("joy-section")) list.push(main.children[i]);
      }
    }
    var footer = doc.getElementById("joy-footer");
    if (footer) list.push(footer);
    return list;
  }

  function measure() {
    sections = collectSections();
    tops = [];
    var sy = win.pageYOffset || 0;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      tops.push({ top: r.top + sy, bottom: r.bottom + sy });
    }
    /* map sections -> poses (handles a different section count gracefully) */
    poseFor = [];
    var n = sections.length;
    for (var k = 0; k < n; k++) {
      var idx = n > 1 ? Math.round(k * (POSES.length - 1) / (n - 1)) : 0;
      poseFor.push(POSES[idx]);
    }
  }

  function smoother(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  var tgt = {};
  var curIdx = 0;
  function targetPose(centerY) {
    var n = sections.length;
    var a = POSES[0];
    if (!n) { for (var z = 0; z < POSE_KEYS.length; z++) tgt[POSE_KEYS[z]] = a[POSE_KEYS[z]]; return; }

    var cur = 0;
    for (var i = n - 1; i >= 0; i--) {
      if (centerY >= tops[i].top) { cur = i; break; }
    }
    curIdx = cur;
    var from = poseFor[cur], to = poseFor[cur], u = 0;
    var vh = win.innerHeight;

    /* blend window around the boundary with the next section */
    if (cur < n - 1) {
      var bN = tops[cur + 1].top;
      var wN = Math.min(vh * 0.5, (tops[cur].bottom - tops[cur].top) * 0.4, (tops[cur + 1].bottom - tops[cur + 1].top) * 0.4);
      if (wN > 1 && centerY > bN - wN) {
        from = poseFor[cur]; to = poseFor[cur + 1];
        u = smoother((centerY - (bN - wN)) / (2 * wN));
      }
    }
    /* …and around the boundary with the previous section */
    if (cur > 0 && u === 0) {
      var bP = tops[cur].top;
      var wP = Math.min(vh * 0.5, (tops[cur - 1].bottom - tops[cur - 1].top) * 0.4, (tops[cur].bottom - tops[cur].top) * 0.4);
      if (wP > 1 && centerY < bP + wP) {
        from = poseFor[cur - 1]; to = poseFor[cur];
        u = smoother((centerY - (bP - wP)) / (2 * wP));
      }
    }
    for (var k = 0; k < POSE_KEYS.length; k++) {
      var key = POSE_KEYS[k];
      tgt[key] = from[key] + (to[key] - from[key]) * u;
    }
  }

  /* ---------- 07. State, input, resize ---------- */

  var S = { shape: 0, xf: 0.5, y: 0, z: 0, sc: 1.15, rx: 0.2, ring: 1, wire: 0.9, amp: 0.12, tint: 0.2 };
  var mouse = { x: 0, y: 0, sx: 0, sy: 0, on: 0, onS: 0, has: false };
  var ndc = new THREE.Vector2();
  var ray = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var hit = new THREE.Vector3();

  win.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch" || reduceMotion) return;
    mouse.x = (e.clientX / win.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / win.innerHeight) * 2 - 1);
    mouse.has = true;
    mouse.on = 1;
  }, { passive: true });
  doc.addEventListener("pointerleave", function () { mouse.on = 0; });
  win.addEventListener("blur", function () { mouse.on = 0; });

  function resize() {
    var w = win.innerWidth, h = win.innerHeight;
    isMobile = w < 768;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    coreU.uPixel.value = dustU.uPixel.value = renderer.getPixelRatio();
    measure();
  }
  var resizeTimer = null;
  win.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });
  win.addEventListener("load", function () { setTimeout(measure, 300); });
  if (win.ResizeObserver) {
    var mo = new ResizeObserver(function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    });
    var mainEl = doc.getElementById("joy-page-content");
    if (mainEl) mo.observe(mainEl);
    var footEl = doc.getElementById("joy-footer");
    if (footEl) mo.observe(footEl);
  }
  if (win.ScrollTrigger && win.ScrollTrigger.addEventListener) {
    win.ScrollTrigger.addEventListener("refresh", measure);
  }

  /* ---------- 08. Reveal + lifecycle ---------- */

  var introStart = -1;   // seconds, set when the loader finishes
  var ready = false;

  function reveal() {
    if (ready) return;
    ready = true;
    root.classList.add("webgl-ready");
    introStart = clock.getElapsedTime();
  }
  doc.addEventListener("loader:done", reveal);
  setTimeout(reveal, 9000); // safety: never stay hidden

  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    running = false;
    root.classList.remove("webgl-ready");
  });
  canvas.addEventListener("webglcontextrestored", function () {
    running = true;
    root.classList.add("webgl-ready");
    last = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  });

  var running = true;
  var rafId = 0;
  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden) { running = false; cancelAnimationFrame(rafId); }
    else if (!running) {
      running = true;
      last = performance.now();
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    }
  });

  /* ---------- 09. Frame loop ---------- */

  var clock = new THREE.Clock();
  var last = performance.now();
  var lastY = win.pageYOffset || 0;
  var vel = 0;
  var velS = 0;      // signed, smoothed
  var pulse = 0;
  var lastIdx = -1;
  var rotY = 0;
  var time = 0;
  var fpsAcc = 0, fpsN = 0, governed = false;
  var timeScale = reduceMotion ? 0 : 1;

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);

    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (dt <= 0) return;

    /* adaptive quality: drop resolution once if the GPU struggles */
    if (!governed) {
      fpsAcc += dt; fpsN++;
      if (fpsN >= 120) {
        var avg = fpsAcc / fpsN;
        if (avg > 1 / 38 && pixelRatio > 1) {
          pixelRatio = 1;
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(win.innerWidth, win.innerHeight, false);
          coreU.uPixel.value = dustU.uPixel.value = renderer.getPixelRatio();
        }
        governed = true;
      }
    }

    time += dt * timeScale;

    /* scroll + velocity */
    var sy = win.pageYOffset || 0;
    var rawVel = (sy - lastY) / dt;
    lastY = sy;
    var vs = Math.max(-1, Math.min(1, rawVel / 1800));
    velS += (vs - velS) * (1 - Math.exp(-dt * 5));
    vel = Math.abs(velS);
    var maxScroll = Math.max(1, (doc.documentElement.scrollHeight || 1) - win.innerHeight);
    var P = Math.max(0, Math.min(1, sy / maxScroll));

    /* target pose from the viewport centre */
    targetPose(sy + win.innerHeight * 0.5);
    if (lastIdx !== -1 && curIdx !== lastIdx && !reduceMotion) pulse = 1;
    lastIdx = curIdx;
    pulse *= Math.exp(-dt * 1.6);
    if (pulse < 0.001) pulse = 0;
    var k = 1 - Math.exp(-dt * 3.2);
    for (var i = 0; i < POSE_KEYS.length; i++) {
      var key = POSE_KEYS[i];
      S[key] += (tgt[key] - S[key]) * k;
    }

    /* intro (after loader) */
    var intro = 1;
    if (!ready) intro = 0;
    else if (introStart >= 0) intro = Math.min(1, (clock.getElapsedTime() - introStart) / 2.6);
    var ie = ease(intro);

    /* layout */
    var halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
    var halfW = halfH * camera.aspect;
    var xk = isMobile ? 0.18 : 0.75;
    var sc = S.sc * (isMobile ? 0.62 : 1) * (0.55 + 0.45 * ie) * (1 + pulse * 0.07);

    mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 4));
    mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 4));
    mouse.onS += (mouse.on - mouse.onS) * (1 - Math.exp(-dt * 5));

    group.position.set(S.xf * halfW * xk + mouse.sx * 0.25, S.y + mouse.sy * 0.15, S.z);
    group.scale.setScalar(sc);

    rotY += (dt * (0.10 + vel * 1.6) + velS * dt * 3.4) * (reduceMotion ? 0 : 1);
    group.rotation.y = rotY + mouse.sx * 0.45;
    group.rotation.x = S.rx + mouse.sy * -0.22;
    group.rotation.z = Math.sin(time * 0.15) * 0.05;

    /* camera travels along a slow path with page progress; fast scrolls
       add a dolly-zoom kick and a little roll for a cinematic feel */
    camera.position.x = mouse.sx * 0.25 + Math.sin(P * Math.PI * 4) * 0.45;
    camera.position.y = mouse.sy * 0.15 + Math.cos(P * Math.PI * 3) * 0.25;
    camera.position.z = CAM_Z - vel * 0.9 + Math.sin(P * Math.PI * 2) * 0.5;
    camera.lookAt(0, 0, 0);
    if (!reduceMotion) camera.rotateZ(velS * 0.05 + Math.sin(P * Math.PI * 2) * 0.03);
    var fovT = FOV + vel * 6;
    if (Math.abs(camera.fov - fovT) > 0.01) { camera.fov = fovT; camera.updateProjectionMatrix(); }

    /* pointer -> group-local point (drives the push in the shader) */
    if (mouse.has && !isMobile) {
      ndc.set(mouse.x, mouse.y);
      ray.setFromCamera(ndc, camera);
      plane.constant = -(S.z + 0.9 * sc);
      if (ray.ray.intersectPlane(plane, hit)) {
        group.updateMatrixWorld();
        group.worldToLocal(hit);
        coreU.uMouse.value.copy(hit);
      }
    }
    coreU.uMouseOn.value = isMobile ? 0 : mouse.onS;

    /* shape morph + dissolve */
    var f = S.shape - Math.floor(S.shape);
    var trans = Math.sin(Math.PI * f);
    trans = trans * trans;
    coreU.uShape.value = S.shape;
    coreU.uTrans.value = Math.max(trans, (1 - ie) * 1.0);
    coreU.uAmp.value = S.amp;
    coreU.uVel.value = vel;
    coreU.uPulse.value = pulse;
    coreU.uTint.value = S.tint;
    coreU.uTime.value = time;

    wireMat.opacity = 0.11 * S.wire * ie;
    wire.rotation.y = -rotY * 1.4;
    wire.rotation.x = time * 0.05;

    for (var r = 0; r < rings.length; r++) {
      var ring = rings[r];
      ring.holder.rotation.y += dt * (ring.speed + vel * 1.2 * Math.sign(ring.speed) + pulse * 2.2 * Math.sign(ring.speed)) * timeScale;
      var s = 0.001 + S.ring * (0.85 + 0.15 * Math.sin(time * 0.6 + r));
      ring.holder.scale.setScalar(s);
      ring.lineMat.opacity = ring.base.lo * S.ring * ie;
      ring.nodeMat.opacity = ring.base.no * Math.min(1, S.ring * 1.4) * ie;
    }

    dustU.uTime.value = time;
    dustU.uScroll.value = sy * 0.0025;
    streakU.uScroll.value = sy * 0.0025;
    streakU.uVel.value = reduceMotion ? 0 : vel;
    streakU.uDir.value = Math.max(-1, Math.min(1, velS * 20));

    renderer.render(scene, camera);
  }

  /* ---------- 10. Boot ---------- */

  resize();
  rafId = requestAnimationFrame(frame);

  /* if the loader already finished before this script ran */
  if (!root.classList.contains("is-loading") && doc.readyState === "complete") {
    setTimeout(function () { if (!ready) reveal(); }, 1200);
  }
})();
