// Rotating scanner viewer — loads assets/scanner-stand.glb, renders an auto-orbiting
// presentation with sonar-green rim light, PBR floor, and a soft ground shadow.
// Scoped to #scanner-viewer inside instrument.html.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.getElementById('scanner-viewer');
if (!mount) throw new Error('scanner-viewer mount missing');

const canvas = document.createElement('canvas');
canvas.className = 'scanner-viewer-canvas';
mount.prepend(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = null;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
camera.position.set(2.4, 1.6, 3.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 2.0;
controls.maxDistance = 5.5;
controls.minPolarAngle = Math.PI * 0.18;
controls.maxPolarAngle = Math.PI * 0.58;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.9;

// ——— lights ———
const ambient = new THREE.AmbientLight(0xcfeadd, 0.35);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.7);
key.position.set(3.2, 4.5, 2.8);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 14;
key.shadow.camera.left = -3;
key.shadow.camera.right = 3;
key.shadow.camera.top = 3;
key.shadow.camera.bottom = -3;
key.shadow.bias = -0.0005;
scene.add(key);

const rim = new THREE.DirectionalLight(0x40ff88, 1.1);
rim.position.set(-2.8, 1.6, -2.2);
scene.add(rim);

const fill = new THREE.DirectionalLight(0x8fd8ff, 0.45);
fill.position.set(-1.4, 2.2, 3.4);
scene.add(fill);

// ——— ground ———
const floorGeo = new THREE.CircleGeometry(4, 96);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x0a1a14,
  metalness: 0.1,
  roughness: 0.55,
  transparent: true,
  opacity: 0.55,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// sonar ring on ground
const ringGeo = new THREE.RingGeometry(0.85, 0.9, 128);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x40ff88,
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.002;
scene.add(ring);

const ring2Geo = new THREE.RingGeometry(1.35, 1.38, 128);
const ring2 = new THREE.Mesh(ring2Geo, ringMat.clone());
ring2.material.opacity = 0.18;
ring2.rotation.x = -Math.PI / 2;
ring2.position.y = 0.002;
scene.add(ring2);

// ——— scanner model ———
const loadingEl = mount.querySelector('.scanner-viewer-status');
const scannerGroup = new THREE.Group();
scene.add(scannerGroup);

(async () => {
  try {
    const res = await fetch('assets/scanner-stand.glb');
    if (!res.ok) throw new Error('fetch ' + res.status);
    const buf = await res.arrayBuffer();
    const loader = new GLTFLoader();
    loader.parse(buf, '', (gltf) => {
      const root = gltf.scene;

      // Normalize size
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const targetHeight = 1.6;
      const scale = targetHeight / Math.max(size.y, 0.001);
      root.scale.setScalar(scale);

      // Recompute bbox and re-center (y-floor anchored)
      const box2 = new THREE.Box3().setFromObject(root);
      const c2 = box2.getCenter(new THREE.Vector3());
      root.position.x -= c2.x;
      root.position.z -= c2.z;
      root.position.y -= box2.min.y; // sit on floor

      root.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.material) {
            // Slightly boost PBR response
            o.material.envMapIntensity = 1.1;
            if ('roughness' in o.material) {
              o.material.roughness = Math.min(o.material.roughness ?? 0.6, 0.75);
            }
          }
        }
      });

      scannerGroup.add(root);
      if (loadingEl) loadingEl.remove();

      controls.target.set(0, targetHeight * 0.5, 0);
      controls.update();
    }, (err) => {
      console.error('GLTF parse error', err);
      if (loadingEl) loadingEl.textContent = 'Chargement 3D indisponible';
    });
  } catch (err) {
    console.error('scanner load error', err);
    if (loadingEl) loadingEl.textContent = 'Chargement 3D indisponible';
  }
})();

// ——— resize ———
function resize() {
  const r = mount.getBoundingClientRect();
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
new ResizeObserver(resize).observe(mount);

// ——— loop ———
const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  controls.update();
  // subtle ring breathing
  const t = performance.now() * 0.001;
  ring.material.opacity = 0.28 + Math.sin(t * 1.3) * 0.07;
  ring2.material.opacity = 0.14 + Math.sin(t * 0.9 + 1.1) * 0.05;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
