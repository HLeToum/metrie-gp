// Metrie GP — Scanner 3D LiDAR hero scene
// Based on Claude Design sonar-green laser sweep animation, embedded inside #scene-container.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------- Tweaks (defaults from Claude Design export) ----------
const tweaks = {
  rotationSpeed: 2.5,
  laserIntensity: 0,       // laser invisible in air by default
  pointLifetime: 9.4,
  pointDensity: 1.6,       // slightly lower than standalone to stay smooth inside a hero tile
  showGlow: true,
  showFog: false,
};

// ---------- Container & renderer ----------
const container = document.getElementById('scene-container');
const legacyCanvas = document.getElementById('three-canvas');
if (legacyCanvas) legacyCanvas.remove();

// Build dedicated dark stage inside the container
const stage = document.createElement('div');
stage.id = 'scanner-stage';
container.prepend(stage);

function getSize() {
  const r = container.getBoundingClientRect();
  return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020807, 0);

let { w: W0, h: H0 } = getSize();
const camera = new THREE.PerspectiveCamera(50, W0 / H0, 0.1, 200);
camera.position.set(3.5, 2.8, 9);
camera.lookAt(0, 2.0, -6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W0, H0);
renderer.setClearColor(0x020807, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.domElement.id = 'three-canvas';
stage.appendChild(renderer.domElement);

// Post-processing for bloom on laser/points
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(W0, H0), 0.30, 0.6, 0.75);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// Controls — gentle orbit inside the scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.target.set(0, 2.0, -6);
controls.minDistance = 4;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.52;

// ---------- Lighting ----------
scene.add(new THREE.HemisphereLight(0x2a3840, 0x050a0a, 0.45));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(3, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.7);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xa06070, 0.4);
rimLight.position.set(0, 3, -6);
scene.add(rimLight);

const scannerPoint = new THREE.PointLight(0xfff0dc, 2.5, 5, 1.5);
scannerPoint.position.set(1.5, 2, 2);
scene.add(scannerPoint);

// ---------- Ground + subtle radial floor glow ----------
const groundGeo = new THREE.PlaneGeometry(80, 80);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x06080a, roughness: 0.98, metalness: 0.0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
scene.add(ground);

const glowGeo = new THREE.CircleGeometry(3, 64);
const glowMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: { uColor: { value: new THREE.Color(0x300a10) } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor;
    void main() {
      float d = distance(vUv, vec2(0.5));
      float a = smoothstep(0.5, 0.0, d) * 0.4;
      gl_FragColor = vec4(uColor, a);
    }`
});
const floorGlow = new THREE.Mesh(glowGeo, glowMat);
floorGlow.rotation.x = -Math.PI / 2;
floorGlow.position.y = 0.002;
scene.add(floorGlow);

// ---------- Scanner GLB ----------
let scannerRoot = null;
let laserEmitterY = 1.0;
const loader = new GLTFLoader();

fetch('assets/trion-p2.glb')
  .then(r => r.arrayBuffer())
  .then(buf => new Promise((res, rej) => loader.parse(buf, '', res, rej)))
  .then((gltf) => {
    scannerRoot = gltf.scene;

    // Normalize size
    const bbox0 = new THREE.Box3().setFromObject(scannerRoot);
    const size = bbox0.getSize(new THREE.Vector3());
    const center = bbox0.getCenter(new THREE.Vector3());
    const targetHeight = 1.4;
    const scale = targetHeight / size.y;
    scannerRoot.scale.setScalar(scale);
    scannerRoot.position.set(-center.x * scale, -bbox0.min.y * scale, -center.z * scale);

    const scaledBbox = new THREE.Box3().setFromObject(scannerRoot);
    const scaledH = scaledBbox.max.y - scaledBbox.min.y;

    // FJD TRION P2 layered palette — silver / matte black alternating bands
    const palette = {
      silver: { color: 0xb8bcc0, metal: 0.85, rough: 0.35 },
      black:  { color: 0x15171a, metal: 0.55, rough: 0.45 },
    };

    scannerRoot.traverse((o) => {
      if (!o.isMesh) return;
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      const box = new THREE.Box3().setFromObject(o);
      const c = box.getCenter(new THREE.Vector3());
      const yNorm = (c.y - scaledBbox.min.y) / scaledH;

      let bucket;
      if (yNorm < 0.12)      bucket = 'silver';
      else if (yNorm < 0.42) bucket = 'black';
      else if (yNorm < 0.68) bucket = 'silver';
      else                   bucket = 'black';

      const p = palette[bucket];
      o.material = new THREE.MeshStandardMaterial({
        color: p.color,
        metalness: p.metal,
        roughness: p.rough,
        envMapIntensity: 1.4,
      });
    });

    // Iridescent scanning lens in the front cavity
    const radius = Math.max(scaledBbox.max.x - scaledBbox.min.x, scaledBbox.max.z - scaledBbox.min.z) * 0.5;
    const cx = (scaledBbox.min.x + scaledBbox.max.x) * 0.5;
    const cz = (scaledBbox.min.z + scaledBbox.max.z) * 0.5;
    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.40, 40, 28),
      new THREE.MeshPhysicalMaterial({
        color: 0x140608,
        metalness: 1.0,
        roughness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        iridescence: 1.0,
        iridescenceIOR: 2.4,
        iridescenceThicknessRange: [280, 1000],
        emissive: 0x300810,
        emissiveIntensity: 0.5,
      })
    );
    lens.position.set(cx, scaledBbox.min.y + scaledH * 0.52, cz + radius * 0.35);
    scannerRoot.add(lens);

    const newBbox = new THREE.Box3().setFromObject(scannerRoot);
    laserEmitterY = newBbox.max.y * 0.72;

    scene.add(scannerRoot);
  })
  .catch((err) => {
    console.warn('GLB load failed, using placeholder:', err);
    scannerRoot = buildPlaceholderScanner();
    scene.add(scannerRoot);
  });

function buildPlaceholderScanner() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0x222830, metalness: 0.7, roughness: 0.3 })
  );
  base.position.y = 0.06;
  g.add(base);
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.9, 16),
    new THREE.MeshStandardMaterial({ color: 0x2a3038, metalness: 0.6, roughness: 0.4 })
  );
  stand.position.y = 0.55;
  g.add(stand);
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.28, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x303840, metalness: 0.5, roughness: 0.4 })
  );
  head.position.y = 1.1;
  g.add(head);
  return g;
}

// ---------- Invisible raycast warehouse ----------
const targetGroup = new THREE.Group();
scene.add(targetGroup);

function invisMat() {
  return new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
}
function addRaycastBox(w, h, d, x, y, z, rotY = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), invisMat());
  m.position.set(x, y, z);
  if (rotY) m.rotation.y = rotY;
  targetGroup.add(m);
  return m;
}

(function buildSimpleWarehouse() {
  const W = 22, D = 26, H = 6;
  const T = 0.2;
  const roofRise = 3.0;
  const cz = 0;
  const frontZ = cz + D / 2;

  addRaycastBox(W, T, D, 0, -T / 2, cz);
  addRaycastBox(W, H, T, 0, H / 2, cz - D / 2);
  addRaycastBox(W, H, T, 0, H / 2, cz + D / 2);
  addRaycastBox(T, H, D, -W / 2, H / 2, cz);
  addRaycastBox(T, H, D,  W / 2, H / 2, cz);

  const slopeLen = Math.sqrt((W / 2) * (W / 2) + roofRise * roofRise);
  const slopeAngle = Math.atan2(roofRise, W / 2);

  const roofL = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, T, D), invisMat());
  roofL.position.set(-W / 4, H + roofRise / 2, cz);
  roofL.rotation.z = slopeAngle;
  targetGroup.add(roofL);

  const roofR = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, T, D), invisMat());
  roofR.position.set(W / 4, H + roofRise / 2, cz);
  roofR.rotation.z = -slopeAngle;
  targetGroup.add(roofR);

  const addGable = (x, z, sign) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, T, T), invisMat());
    m.position.set(x, H + roofRise / 2, z);
    m.rotation.z = sign * slopeAngle;
    targetGroup.add(m);
  };
  addGable(-W / 4, frontZ, 1);
  addGable( W / 4, frontZ, -1);
  addGable(-W / 4, cz - D / 2, 1);
  addGable( W / 4, cz - D / 2, -1);

  addRaycastBox(W, T, T, 0, H, cz - D / 2);
  addRaycastBox(W, T, T, 0, H, frontZ);
  addRaycastBox(0.25, 0.25, D, 0, H + roofRise, cz);
})();

// ---------- Point cloud ring-buffer ----------
const MAX_POINTS = 400000;
const pointPositions = new Float32Array(MAX_POINTS * 3);
const pointBirths = new Float32Array(MAX_POINTS);
const pointSeeds = new Float32Array(MAX_POINTS);
let pointWriteIdx = 0;
let pointTotalWritten = 0;

const pointGeo = new THREE.BufferGeometry();
pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
pointGeo.setAttribute('aBirth', new THREE.BufferAttribute(pointBirths, 1));
pointGeo.setAttribute('aSeed', new THREE.BufferAttribute(pointSeeds, 1));
pointGeo.setDrawRange(0, 0);

const pointMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
  uniforms: {
    uTime: { value: 0 },
    uLifetime: { value: tweaks.pointLifetime },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColorHot: { value: new THREE.Color(0xffd8d0) },
    uColorCool: { value: new THREE.Color(0xff2030) },
  },
  vertexShader: `
    attribute float aBirth;
    attribute float aSeed;
    uniform float uTime;
    uniform float uLifetime;
    uniform float uPixelRatio;
    varying float vAge;
    void main() {
      float age = (uTime - aBirth) / uLifetime;
      vAge = clamp(age, 0.0, 1.0);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float pop = 1.0 + 0.3 * exp(-age * 10.0);
      float size = (1.0 + aSeed * 0.6) * pop * uPixelRatio;
      gl_PointSize = clamp(size * (35.0 / -mv.z), 1.2, 8.0);
      if (age > 1.0 || age < 0.0) gl_PointSize = 0.0;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: `
    uniform vec3 uColorHot;
    uniform vec3 uColorCool;
    varying float vAge;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float core = smoothstep(0.5, 0.0, d);
      vec3 col = mix(uColorHot, uColorCool, smoothstep(0.0, 0.2, vAge));
      float alpha = pow(core, 2.0) * (1.0 - vAge) * 0.85;
      gl_FragColor = vec4(col, alpha);
    }`
});
const pointCloud = new THREE.Points(pointGeo, pointMat);
scene.add(pointCloud);

function addPoint(worldPos, time) {
  const i = pointWriteIdx;
  pointPositions[i * 3 + 0] = worldPos.x;
  pointPositions[i * 3 + 1] = worldPos.y;
  pointPositions[i * 3 + 2] = worldPos.z;
  pointBirths[i] = time;
  pointSeeds[i] = Math.random();
  pointWriteIdx = (pointWriteIdx + 1) % MAX_POINTS;
  pointTotalWritten++;
}

// ---------- Impact sprite (subtle green dot where laser hits) ----------
function makeGlowTexture() {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,180,180,0.9)');
  g.addColorStop(0.5, 'rgba(255,60,80,0.4)');
  g.addColorStop(1, 'rgba(255,0,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const impactSpriteMat = new THREE.SpriteMaterial({
  map: makeGlowTexture(),
  color: 0xff3050,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  opacity: 0,
});
const impactSprite = new THREE.Sprite(impactSpriteMat);
impactSprite.scale.setScalar(0.22);
scene.add(impactSprite);

// ---------- Raycaster + animation loop ----------
const raycaster = new THREE.Raycaster();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();

const vAngle = document.getElementById('v-angle');
const vPoints = document.getElementById('v-points');
const vRev = document.getElementById('v-rev');
const vRate = document.getElementById('v-rate');

let angle = 0;
let revCount = 0;
let lastAngle = 0;
let lastRateTime = 0;
let pointsThisSecond = 0;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  pointMat.uniforms.uTime.value = t;
  pointMat.uniforms.uLifetime.value = tweaks.pointLifetime;

  // Rotate scanner
  if (scannerRoot) {
    const omega = (Math.PI * 2) * 0.25 * tweaks.rotationSpeed; // 1 rev / 4s × speed
    angle += omega * dt;
    scannerRoot.rotation.y = angle;

    const cur = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (cur < lastAngle) {
      revCount++;
      if (vRev) vRev.textContent = revCount.toString();
    }
    lastAngle = cur;
    if (vAngle) vAngle.textContent = (cur * 180 / Math.PI).toFixed(1).padStart(5, '0') + '°';
  }

  // Emitter origin & direction in world space
  _rayOrigin.set(0, laserEmitterY, 0.08);
  _rayDir.set(0, 0, 1);
  const cA = Math.cos(angle), sA = Math.sin(angle);
  const ox = _rayOrigin.x, oz = _rayOrigin.z;
  _rayOrigin.x = ox * cA + oz * sA;
  _rayOrigin.z = -ox * sA + oz * cA;
  const dx = _rayDir.x, dz = _rayDir.z;
  _rayDir.x = dx * cA + dz * sA;
  _rayDir.z = -dx * sA + dz * cA;
  _rayDir.normalize();

  raycaster.far = 40;
  raycaster.near = 0.05;

  const samplesPerFrame = Math.max(1, Math.round(40 * tweaks.pointDensity));
  let lastHitPoint = null;

  for (let i = 0; i < samplesPerFrame; i++) {
    const r = Math.random();
    const pitch = r < 0.6
      ? (Math.random() - 0.5) * Math.PI * 1.02
      : Math.random() * Math.PI * 0.5 + 0.2;

    const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const k = Math.max(0.15, 1.0 - Math.abs(cosP));
    const azJitter  = (Math.random() - 0.5) * 0.15 * k;
    const azJitter2 = (Math.random() - 0.5) * 0.15 * k;

    const jd = new THREE.Vector3(
      _rayDir.x * cosP + azJitter,
      sinP,
      _rayDir.z * cosP + azJitter2,
    ).normalize();

    raycaster.set(_rayOrigin, jd);
    const hits = raycaster.intersectObjects(targetGroup.children, false);
    if (hits.length > 0) {
      const h = hits[0];
      addPoint(h.point, t);
      pointsThisSecond++;
      if (Math.abs(pitch) < 0.2 && !lastHitPoint) lastHitPoint = h.point.clone();
    }
  }

  pointGeo.attributes.position.needsUpdate = true;
  pointGeo.attributes.aBirth.needsUpdate = true;
  pointGeo.attributes.aSeed.needsUpdate = true;
  pointGeo.setDrawRange(0, Math.min(pointTotalWritten, MAX_POINTS));

  if (lastHitPoint) {
    impactSprite.position.copy(lastHitPoint);
    impactSpriteMat.opacity = 0.55 * Math.max(tweaks.laserIntensity, 0.25);
    impactSprite.scale.setScalar(0.08);
  } else {
    impactSpriteMat.opacity = 0;
  }

  if (t - lastRateTime > 1) {
    if (vRate) vRate.textContent = pointsThisSecond.toLocaleString('fr-FR') + ' pts/s';
    pointsThisSecond = 0;
    lastRateTime = t;
  }
  if (vPoints) vPoints.textContent = Math.min(pointTotalWritten, MAX_POINTS).toLocaleString('fr-FR');

  scene.fog.density = tweaks.showFog ? 0.08 : 0.0;
  bloomPass.strength = 0.3 + 0.2 * tweaks.laserIntensity;

  controls.update();
  composer.render();
}

// ---------- Responsive resize ----------
// Shift the rendered scene to the right on wide viewports so the hero text
// (anchored left) does not overlap the scanner + its point cloud.
function applyViewOffset(w, h) {
  // On wide screens, ask the camera to render a left-portion of a wider virtual
  // canvas — this pushes the scene's optical center to ~68% across the screen,
  // giving the left third back to the hero text.
  if (w >= 960) {
    const scale = 1.45;
    const virtualW = Math.round(w * scale);
    camera.setViewOffset(virtualW, h, 0, 0, w, h);
  } else {
    camera.clearViewOffset();
  }
}
function onResize() {
  const { w, h } = getSize();
  camera.aspect = w / h;
  applyViewOffset(w, h);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloomPass.setSize(w, h);
  pointMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
}
window.addEventListener('resize', onResize);
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(onResize).observe(container);
}

// Apply initial view offset synchronously before first frame renders.
applyViewOffset(W0, H0);
camera.updateProjectionMatrix();

// ---------- Optional demo-page controls (bound only if panel exists) ----------
(function bindDemoControls() {
  const ctlSpeed   = document.getElementById('ctl-speed');
  const ctlDensity = document.getElementById('ctl-density');
  const ctlLife    = document.getElementById('ctl-life');
  const ctlLaser   = document.getElementById('ctl-laser');
  const reset      = document.getElementById('demo-reset');
  if (!ctlSpeed) return;  // not on the demo page

  const valSpeed   = document.getElementById('val-speed');
  const valDensity = document.getElementById('val-density');
  const valLife    = document.getElementById('val-life');
  const valLaser   = document.getElementById('val-laser');

  const defaults = {
    rotationSpeed: tweaks.rotationSpeed,
    pointDensity: tweaks.pointDensity,
    pointLifetime: tweaks.pointLifetime,
    laserIntensity: tweaks.laserIntensity,
  };

  const bind = (input, key, label, fmt) => {
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      tweaks[key] = v;
      if (label) label.textContent = fmt(v);
    });
  };
  bind(ctlSpeed,   'rotationSpeed',  valSpeed,   v => v.toFixed(1) + '×');
  bind(ctlDensity, 'pointDensity',   valDensity, v => v.toFixed(1) + '×');
  bind(ctlLife,    'pointLifetime',  valLife,    v => v.toFixed(1) + ' s');
  bind(ctlLaser,   'laserIntensity', valLaser,   v => v.toFixed(2));

  if (reset) {
    reset.addEventListener('click', () => {
      Object.assign(tweaks, defaults);
      ctlSpeed.value   = defaults.rotationSpeed;   valSpeed.textContent   = defaults.rotationSpeed.toFixed(1) + '×';
      ctlDensity.value = defaults.pointDensity;    valDensity.textContent = defaults.pointDensity.toFixed(1) + '×';
      ctlLife.value    = defaults.pointLifetime;   valLife.textContent    = defaults.pointLifetime.toFixed(1) + ' s';
      ctlLaser.value   = defaults.laserIntensity;  valLaser.textContent   = defaults.laserIntensity.toFixed(2);
    });
  }
})();

animate();
