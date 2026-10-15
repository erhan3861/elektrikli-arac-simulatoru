import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PARTS, PART_BY_ID, LESSON, QUIZ } from './data.js';

/* ───────────────────────── Sahne ───────────────────────── */
const sceneEl = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
sceneEl.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') });
labelRenderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);
scene.fog = new THREE.Fog(0x0b0f14, 14, 32);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
const HOME = { pos: new THREE.Vector3(-5.2, 2.4, -5.4), tgt: new THREE.Vector3(0, 0.6, 0) };
camera.position.copy(HOME.pos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 11;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.target.copy(HOME.tgt);

/* Işık */
scene.add(new THREE.HemisphereLight(0xd6e6ff, 0x0b0f14, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(5, 9, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = key.shadow.camera.bottom = -6;
key.shadow.camera.right = key.shadow.camera.top = 6;
key.shadow.camera.near = 1; key.shadow.camera.far = 30;
key.shadow.bias = -0.0006;
key.shadow.radius = 5;
scene.add(key);
const rimA = new THREE.SpotLight(0x38bdf8, 160, 24, Math.PI / 5, 0.7, 2);
rimA.position.set(-7, 5, -6); scene.add(rimA);
const rimB = new THREE.SpotLight(0xf97316, 90, 24, Math.PI / 5, 0.7, 2);
rimB.position.set(7, 4, 7); scene.add(rimB);

/* Zemin */
{
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#1a2230'); grad.addColorStop(0.6, '#0f141b'); grad.addColorStop(1, '#0b0f14');
  g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(18, 96),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.35, 3.4, 128),
    new THREE.MeshBasicMaterial({ color: 0x1f2a38, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring);
  const grid = new THREE.GridHelper(30, 30, 0x141b24, 0x11171f);
  grid.position.y = 0.001; scene.add(grid);
}

/* ───────────────────────── Malzemeler ───────────────────────── */
const M = {
  paint: new THREE.MeshPhysicalMaterial({ color: 0x1f5fd6, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x5b8fd6, metalness: 0.1, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.45, depthWrite: false }),
  trim: new THREE.MeshStandardMaterial({ color: 0x0f1216, roughness: 0.6, metalness: 0.2 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.15, metalness: 1 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.92, metalness: 0 }),
  rim: new THREE.MeshStandardMaterial({ color: 0xcfd6de, roughness: 0.22, metalness: 0.92 }),
  disc: new THREE.MeshStandardMaterial({ color: 0x8c949e, roughness: 0.35, metalness: 0.9 }),
  caliper: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.3 }),
  hv: new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.45, metalness: 0.1 }),
  lv: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 }),
  led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.3 }),
  tail: new THREE.MeshStandardMaterial({ color: 0xff2d55, emissive: 0xff2d55, emissiveIntensity: 2.4 }),
};
const std = (color, metalness = 0.5, roughness = 0.4) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };

/* ───────────────────────── Araç ───────────────────────── */
const car = new THREE.Group();
scene.add(car);

// Şasi tabanı
car.add(mesh(new THREE.BoxGeometry(1.7, 0.08, 3.7), M.trim, 0, 0.26, 0));

// Dış gövde (yan profil, çamurluk kavisli) — ön: -z
const shell = new THREE.Group();
car.add(shell);
{
  const s = new THREE.Shape();
  s.moveTo(2.12, 0.30);
  s.lineTo(1.90, 0.30);
  s.absarc(1.38, 0.30, 0.52, 0, Math.PI, false);
  s.lineTo(-0.86, 0.30);
  s.absarc(-1.38, 0.30, 0.52, 0, Math.PI, false);
  s.lineTo(-2.10, 0.30);
  s.lineTo(-2.28, 0.42);
  s.quadraticCurveTo(-2.36, 0.62, -2.24, 0.76);
  s.lineTo(-2.02, 0.82);
  s.quadraticCurveTo(-1.3, 0.92, -0.78, 1.0);
  s.lineTo(1.9, 1.0);
  s.quadraticCurveTo(2.24, 0.98, 2.32, 0.86);
  s.lineTo(2.36, 0.56);
  s.quadraticCurveTo(2.36, 0.36, 2.12, 0.30);
  // Not: bevel, profili dışa doğru 0.11 büyütür (taban 0.19, bel çizgisi 1.11).
  const centerX = g => { g.computeBoundingBox(); const b = g.boundingBox; g.translate(-(b.min.x + b.max.x) / 2, 0, 0); return g; };
  const geo = centerX(new THREE.ExtrudeGeometry(s, { depth: 1.66, bevelEnabled: true, bevelSegments: 6, steps: 1, bevelSize: 0.11, bevelThickness: 0.11, curveSegments: 24 }).rotateY(-Math.PI / 2));
  const body = mesh(geo, M.paint);
  body.renderOrder = 2;
  shell.add(body);

  // Cam kabin
  const g = new THREE.Shape();
  g.moveTo(-0.80, 1.04);
  g.quadraticCurveTo(-0.52, 1.26, -0.08, 1.42);
  g.lineTo(0.86, 1.44);
  g.quadraticCurveTo(1.36, 1.40, 1.86, 1.06);
  g.lineTo(1.88, 1.04);
  const gg = centerX(new THREE.ExtrudeGeometry(g, { depth: 1.46, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.04, bevelThickness: 0.04, curveSegments: 20 }).rotateY(-Math.PI / 2));
  const glass = mesh(gg, M.glass);
  glass.castShadow = false; glass.renderOrder = 3;
  shell.add(glass);

  // Tavan paneli
  shell.add(mesh(new RoundedBoxGeometry(1.44, 0.045, 0.76, 3, 0.02), M.paint, 0, 1.468, 0.44));

  // Farlar (tamponun içinden dışarı taşan LED şeritler)
  [-1, 1].forEach(sg => {
    const h = mesh(new THREE.BoxGeometry(0.34, 0.035, 0.1), M.led, sg * 0.62, 0.85, -2.36);
    h.rotation.y = sg * 0.32; h.castShadow = false; shell.add(h);
  });
  // Arka LED şeridi
  const tl = mesh(new THREE.BoxGeometry(1.5, 0.05, 0.12), M.tail, 0, 0.94, 2.4);
  tl.castShadow = false; shell.add(tl);
  // Aynalar
  [-1, 1].forEach(sg => shell.add(mesh(new RoundedBoxGeometry(0.1, 0.07, 0.17, 2, 0.02), M.paint, sg * 1.0, 1.13, -0.62)));
  // Yan etek (tekerlekler arası)
  shell.add(mesh(new THREE.BoxGeometry(1.94, 0.06, 1.5), M.trim, 0, 0.25, 0));
}

// Tekerlekler
const wheels = [];
[[-0.8, -1.38], [0.8, -1.38], [-0.8, 1.38], [0.8, 1.38]].forEach(([x, z]) => {
  const w = new THREE.Group(); w.position.set(x, 0.34, z);
  const spin = new THREE.Group();
  const tire = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 48), M.tire); tire.rotation.z = Math.PI / 2;
  const rim = mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.26, 32), M.rim); rim.rotation.z = Math.PI / 2;
  const hub = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.275, 24), M.chrome); hub.rotation.z = Math.PI / 2;
  const face = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32), M.trim, Math.sign(x) * 0.11, 0, 0); face.rotation.z = Math.PI / 2;
  spin.add(tire, rim, face, hub);
  for (let i = 0; i < 7; i++) {
    const sp = mesh(new THREE.BoxGeometry(0.3, 0.045, 0.42), M.rim);
    sp.rotation.x = i * (Math.PI * 2 / 7); spin.add(sp);
  }
  const disc = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 32), M.disc, -Math.sign(x) * 0.14, 0, 0); disc.rotation.z = Math.PI / 2;
  const cal = mesh(new THREE.BoxGeometry(0.05, 0.15, 0.1), M.caliper, -Math.sign(x) * 0.14, 0.1, -0.12);
  w.add(spin, disc, cal); car.add(w); wheels.push(spin);
});

/* Parçalar */
const parts = {};          // id → group
const clickables = [];
function addPart(id, group, pos, exp) {
  group.position.set(...pos);
  group.userData = { id, base: new THREE.Vector3(...pos), exp: new THREE.Vector3(pos[0] + exp[0], pos[1] + exp[1], pos[2] + exp[2]) };
  group.traverse(c => { if (c.isMesh) { c.userData.partId = id; c.material = c.material.clone(); clickables.push(c); } });
  parts[id] = group; car.add(group);
}

// Batarya
{
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(1.5, 0.14, 2.0, 3, 0.03), std(0x2a3441, 0.5, 0.5)));
  const modMat = std(0x14b8a6, 0.6, 0.35);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++)
    g.add(mesh(new RoundedBoxGeometry(0.62, 0.08, 0.32, 2, 0.02), modMat, c ? 0.36 : -0.36, 0.1, -0.72 + r * 0.4));
  g.add(mesh(new THREE.BoxGeometry(0.22, 0.1, 0.12), M.hv, -0.1, 0.1, -0.95));  // HV çıkış (öne)
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.1, 0.1), M.hv, -0.4, 0.1, 0.9));     // şarj girişi (arkaya)
  addPart('battery', g, [0, 0.40, 0], [0, -0.38, 0]);
}
// BMS
{
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.5, 0.03, 0.34, 2, 0.01), std(0x15803d, 0.3, 0.6)));
  [[-0.12, 0.05], [0.08, -0.06], [0.14, 0.08]].forEach(([x, z]) => g.add(mesh(new THREE.BoxGeometry(0.1, 0.03, 0.1), M.trim, x, 0.03, z)));
  g.add(mesh(new THREE.BoxGeometry(0.03, 0.02, 0.03), new THREE.MeshStandardMaterial({ color: 0x22ff88, emissive: 0x22ff88, emissiveIntensity: 3 }), -0.2, 0.025, -0.12));
  addPart('bms', g, [0.1, 0.49, 0.82], [0, 0.55, 0.45]);
}
// Motor + redüktör + yarım akslar
{
  const g = new THREE.Group();
  const h = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 40), std(0x0ea5e9, 0.8, 0.3)); h.rotation.z = Math.PI / 2; g.add(h);
  for (let i = -2; i <= 2; i++) { const f = mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.02, 40), std(0x0c86bd, 0.8, 0.35), i * 0.11, 0, 0); f.rotation.z = Math.PI / 2; g.add(f); }
  const cap = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 32), M.chrome, -0.33, 0, 0); cap.rotation.z = Math.PI / 2; g.add(cap);
  g.add(mesh(new RoundedBoxGeometry(0.3, 0.38, 0.36, 3, 0.04), std(0x3b4350, 0.7, 0.4), 0.46, -0.02, 0));
  g.add(mesh(new THREE.BoxGeometry(0.2, 0.09, 0.22), M.hv, -0.08, 0.27, 0));
  const axR = mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 12), M.chrome, 0.72, -0.1, 0); axR.rotation.z = Math.PI / 2; g.add(axR);
  const axL = mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.5, 12), M.chrome, -0.6, -0.1, 0); axL.rotation.z = Math.PI / 2; g.add(axL);
  addPart('motor', g, [0, 0.49, -1.38], [0, 0.05, -0.95]);
}
// İnverter
{
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.56, 0.18, 0.46, 3, 0.03), std(0xf97316, 0.5, 0.4)));
  for (let i = -3; i <= 3; i++) g.add(mesh(new THREE.BoxGeometry(0.5, 0.04, 0.03), std(0xc2410c, 0.6, 0.4), 0, 0.08, i * 0.06));
  addPart('inverter', g, [-0.15, 0.88, -1.38], [-0.7, 0.75, -0.35]);
}
// DC-DC
{
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.34, 0.16, 0.36, 3, 0.03), std(0x2dd4bf, 0.55, 0.4)));
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.02, 0.3), std(0x14a89a, 0.6, 0.4), 0, 0.09, 0));
  addPart('dcdc', g, [0.5, 0.86, -1.4], [0.75, 0.65, -0.3]);
}
// 12 V akü
{
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.28, 0.2, 0.2, 3, 0.02), std(0x1f2937, 0.2, 0.7)));
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 12), std(0xef4444, 0.3, 0.5), -0.08, 0.12, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 12), std(0x3b82f6, 0.3, 0.5), 0.08, 0.12, 0));
  addPart('aux', g, [0.56, 0.62, -2.0], [0.7, 0.45, -0.6]);
}
// OBC
{
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.52, 0.18, 0.42, 3, 0.03), std(0xfacc15, 0.5, 0.45)));
  const fan = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), M.trim, 0.12, 0.1, 0.05); g.add(fan);
  addPart('obc', g, [0.1, 0.60, 1.52], [0, 0.65, 0.75]);
}
// Şarj soketi (CCS2)
{
  const g = new THREE.Group();
  const ring = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32), std(0x1a1d22, 0.4, 0.5)); ring.rotation.z = Math.PI / 2; g.add(ring);
  const face = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 32), std(0x2b3038, 0.3, 0.6), 0.02, 0, 0); face.rotation.z = Math.PI / 2; g.add(face);
  const pin = (y, z, r) => { const p = mesh(new THREE.CylinderGeometry(r, r, 0.03, 12), M.chrome, 0.04, y, z); p.rotation.z = Math.PI / 2; g.add(p); };
  pin(0.05, -0.04, 0.014); pin(0.05, 0.04, 0.014); pin(0.02, 0, 0.012);
  pin(-0.05, -0.045, 0.024); pin(-0.05, 0.045, 0.024);
  addPart('port', g, [0.93, 0.78, 1.98], [0.65, 0.4, 0.5]);
}

/* HV kabloları ve akım parçacıkları */
const routes = {};
const particleMat = new THREE.MeshBasicMaterial({ color: 0xfff6d5 });
function addRoute(id, pts, mat = M.hv, radius = 0.03, n = 3) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const tube = mesh(new THREE.TubeGeometry(curve, 32, radius, 10, false), mat); tube.castShadow = false;
  car.add(tube);
  const dots = [];
  for (let i = 0; i < n; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.35, 10, 10), particleMat.clone());
    d.visible = false; car.add(d); dots.push({ mesh: d, t: i / n });
  }
  routes[id] = { curve, dots, dir: 0, speed: 0, tube };
}
addRoute('b2i', [[-0.1, 0.46, -0.9], [-0.15, 0.64, -1.1], [-0.15, 0.84, -1.26]]);
addRoute('i2m', [[-0.27, 0.82, -1.3], [-0.27, 0.70, -1.3]], M.hv, 0.02, 1);
addRoute('i2m2', [[-0.15, 0.82, -1.3], [-0.15, 0.70, -1.3]], M.hv, 0.02, 1);
addRoute('i2m3', [[-0.03, 0.82, -1.3], [-0.03, 0.70, -1.3]], M.hv, 0.02, 1);
addRoute('b2d', [[0.3, 0.46, -0.9], [0.46, 0.64, -1.2], [0.5, 0.78, -1.38]]);
addRoute('p2o', [[0.88, 0.78, 1.98], [0.62, 0.74, 1.9], [0.3, 0.70, 1.7]]);
addRoute('o2b', [[0.0, 0.58, 1.34], [-0.25, 0.52, 1.1], [-0.4, 0.48, 0.92]], M.hv, 0.025, 2);
addRoute('d2a', [[0.58, 0.86, -1.56], [0.6, 0.8, -1.8], [0.58, 0.74, -1.96]], M.lv, 0.016, 2);

// Wallbox + şarj kablosu
const wallbox = new THREE.Group();
{
  wallbox.add(mesh(new RoundedBoxGeometry(0.34, 1.0, 0.14, 3, 0.03), std(0xe5e7eb, 0.2, 0.5), 0, 0.5, 0));
  wallbox.add(mesh(new THREE.BoxGeometry(0.18, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 2 }), 0, 0.82, 0.075));
  wallbox.position.set(2.7, 0, 2.0); wallbox.rotation.y = -Math.PI / 2;
  scene.add(wallbox);
}
const chargeCable = (() => {
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(2.62, 0.55, 2.0), new THREE.Vector3(2.0, 0.35, 2.25), new THREE.Vector3(1.35, 0.6, 2.15), new THREE.Vector3(1.0, 0.78, 1.98)]);
  const t = mesh(new THREE.TubeGeometry(curve, 40, 0.022, 10, false), std(0x1f2937, 0.1, 0.7)); t.visible = false; scene.add(t);
  return t;
})();

/* Etiketler */
const labels = {};
PARTS.forEach(p => {
  const wrap = document.createElement('div'), d = document.createElement('div');
  d.className = 'label'; d.style.setProperty('--c', '#' + p.color.toString(16).padStart(6, '0'));
  d.innerHTML = `<i></i>${p.short}`; wrap.appendChild(d);
  const o = new CSS2DObject(wrap); o.position.set(0, p.id === 'port' ? 0.34 : 0.22, 0);
  parts[p.id].add(o); labels[p.id] = { obj: o, el: d };
});

/* ───────────────────────── Durum ───────────────────────── */
const S = {
  mode: 'explore', selected: null, hover: null,
  ghost: true, lift: false, explode: false, labels: true,
  throttle: 0, rpm: 0, amps: 0, volts: 400, soc: 72, charging: false,
  dmmMode: 'vdc', gloves: false, dmmPart: null,
  lessonStep: 0, fault: null, faultScore: [0, 0], quizIdx: 0, quizScore: 0, quizLocked: false,
  camTween: null, pulseCables: false,
};
const $ = s => document.querySelector(s);
const ctx = $('#ctx');
let toastT;
function toast(msg, kind = '') {
  const t = $('#toast'); t.textContent = msg; t.className = 'show ' + kind;
  clearTimeout(toastT); toastT = setTimeout(() => t.className = '', 1900);
}
const hex = c => '#' + c.toString(16).padStart(6, '0');

/* Kamera odak */
function focusOn(pos, tgt, ms = 900) {
  S.camTween = { p0: camera.position.clone(), p1: pos.clone(), t0: controls.target.clone(), t1: tgt.clone(), start: performance.now(), ms };
}
function focusPart(id) {
  const p = PART_BY_ID[id]; const g = parts[id];
  const tgt = g.position.clone(); tgt.y += 0.05;
  focusOn(new THREE.Vector3(...p.cam), tgt);
}
function focusHome() { focusOn(HOME.pos, HOME.tgt, 1100); }

/* Seçim */
function select(id, { card = true, camera: cam = true } = {}) {
  S.selected = id;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', c.dataset.id === id));
  Object.entries(labels).forEach(([k, l]) => l.el.classList.toggle('sel', k === id));
  if (id && cam) focusPart(id);
  if (id && card) showCard(id); else if (!id) hideCard();
}
function showCard(id) {
  const p = PART_BY_ID[id]; const c = $('#card');
  c.style.setProperty('--c', hex(p.color));
  $('#c-group').textContent = p.group; $('#c-name').textContent = p.name; $('#c-desc').textContent = p.desc;
  $('#c-k1').textContent = p.stats[0][0]; $('#c-v1').textContent = p.stats[0][1];
  $('#c-k2').textContent = p.stats[1][0]; $('#c-v2').textContent = p.stats[1][1];
  $('#c-safe').textContent = p.safe;
  c.classList.remove('hidden');
}
function hideCard() { $('#card').classList.add('hidden'); }
$('#card-x').onclick = () => { hideCard(); select(null, { camera: false }); };
$('#c-speak').onclick = () => {
  if (!('speechSynthesis' in window) || !S.selected) return;
  const p = PART_BY_ID[S.selected];
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(`${p.name}. ${p.desc} ${p.safe}`); u.lang = 'tr-TR'; u.rate = 0.95;
  speechSynthesis.speak(u);
};

/* ───────────────────────── Araçlar ───────────────────────── */
const tool = (id, fn) => $(id).addEventListener('click', e => { fn(); });
tool('#t-ghost', () => { S.ghost = !S.ghost; $('#t-ghost').classList.toggle('active', S.ghost); });
tool('#t-lift', () => { S.lift = !S.lift; $('#t-lift').classList.toggle('active', S.lift); if (!S.lift && S.explode) { S.explode = false; $('#t-explode').classList.remove('active'); } });
tool('#t-explode', () => { S.explode = !S.explode; $('#t-explode').classList.toggle('active', S.explode); if (S.explode && !S.lift) { S.lift = true; $('#t-lift').classList.add('active'); } });
tool('#t-labels', () => { S.labels = !S.labels; $('#t-labels').classList.toggle('active', S.labels); });
tool('#t-help', () => $('#intro').classList.remove('hide'));
$('#start').onclick = () => { $('#intro').classList.add('hide'); if (!S.selected && S.mode === 'explore') setTimeout(() => select('battery'), 300); };

/* ───────────────────────── Modlar ───────────────────────── */
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => setMode(b.dataset.mode));

function setMode(m) {
  S.mode = m;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  S.charging = false; S.pulseCables = false; S.dmmPart = null;
  if (m !== 'lesson' && m !== 'flow') S.throttle = 0;
  hideCard(); select(null, { camera: false });
  ctx.innerHTML = '';
  ({ explore: renderExplore, lesson: startLesson, flow: renderFlow, measure: renderMeasure, fault: startFault, quiz: startQuiz })[m]();
}

/* Keşfet */
function renderExplore() {
  ctx.innerHTML = `<div class="chips">${PARTS.map(p => `<button class="chip" data-id="${p.id}" style="--c:${hex(p.color)}"><i></i>${p.short}</button>`).join('')}</div>`;
  ctx.querySelectorAll('.chip').forEach(c => c.onclick = () => select(c.dataset.id));
  focusHome();
}

/* Ders */
function startLesson() { S.lessonStep = 0; renderLesson(); }
function renderLesson() {
  const i = S.lessonStep, st = LESSON[i], last = i === LESSON.length - 1;
  ctx.innerHTML = `
    <div class="lesson">
      <button class="nav" id="l-prev" ${i === 0 ? 'disabled' : ''}>‹</button>
      <div class="body">
        <div class="step">${st.title || PART_BY_ID[st.focus].name} · ${i + 1}/${LESSON.length}</div>
        <div class="text">${st.text}</div>
        <div class="dots">${LESSON.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
      </div>
      ${last ? `<button class="go" id="l-go">Güç Akışı'nı dene</button>` : `<button class="nav" id="l-next">›</button>`}
    </div>`;
  $('#l-prev').onclick = () => { S.lessonStep--; renderLesson(); };
  if (last) $('#l-go').onclick = () => setMode('flow'); else $('#l-next').onclick = () => { S.lessonStep++; renderLesson(); };
  S.throttle = st.throttle ?? 0; S.charging = !!st.charge; S.pulseCables = !!st.pulse;
  if (st.focus) select(st.focus); else { select(null, { camera: false }); focusHome(); }
}

/* Güç akışı */
let scopeCtx = null;
function renderFlow() {
  ctx.innerHTML = `
    <div class="flow">
      <div class="pedal"><small>FREN</small><input type="range" id="pedal" min="-40" max="100" value="${S.throttle}"><small>GAZ</small><b id="pedal-v">${S.throttle}%</b></div>
      <button class="plug" id="plug">Şarj kablosu</button>
      <div class="reads">
        <div class="read"><small>Batarya</small><b id="r-v">400 V</b></div>
        <div class="read"><small>Akım</small><b id="r-a">0 A</b></div>
        <div class="read"><small>Güç</small><b id="r-p">0 kW</b></div>
        <div class="read"><small>Frekans</small><b id="r-f">0 Hz</b></div>
        <div class="read soc"><small>Şarj</small><b id="r-s">72%</b><i id="r-sb"></i></div>
      </div>
      <div class="scope-wrap"><canvas class="scope" id="scope" width="1400" height="120"></canvas><span class="scope-l">3 faz AC</span><span class="scope-r">DC bara</span></div>
    </div>`;
  const pedal = $('#pedal');
  pedal.oninput = () => { S.throttle = +pedal.value; $('#pedal-v').textContent = `${S.throttle}%`; };
  $('#plug').onclick = () => {
    S.charging = !S.charging; $('#plug').classList.toggle('on', S.charging);
    if (S.charging) { S.throttle = 0; pedal.value = 0; $('#pedal-v').textContent = '0%'; pedal.disabled = true; focusPart('port'); }
    else { pedal.disabled = false; focusHome(); }
  };
  scopeCtx = $('#scope').getContext('2d');
  focusOn(new THREE.Vector3(3.6, 2.2, -4.2), new THREE.Vector3(0, 0.6, -0.4));
}
function updateFlowUI() {
  if (S.mode !== 'flow' || !scopeCtx) return;
  const a = $('#r-a'); if (!a) return;
  $('#r-v').textContent = `${S.volts.toFixed(0)} V`;
  a.textContent = `${S.amps > 0 ? '+' : ''}${S.amps.toFixed(0)} A`; a.className = S.amps > 1 ? 'pos' : S.amps < -1 ? 'neg' : '';
  $('#r-p').textContent = `${(S.volts * S.amps / 1000).toFixed(1)} kW`;
  $('#r-f').textContent = `${(S.rpm * 4 / 60).toFixed(0)} Hz`;
  $('#r-s').textContent = `${S.soc.toFixed(0)}%`; $('#r-sb').style.width = `${S.soc}%`;
  drawScope();
}
let phase = 0;
function drawScope() {
  const c = scopeCtx, W = 1400, H = 120, mid = H * 0.58;
  c.clearRect(0, 0, W, H);
  c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, mid); c.lineTo(W, mid); c.stroke();
  const dcY = 18 + (400 - S.volts) * 0.5;
  c.strokeStyle = '#22c55e'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, dcY); c.lineTo(W, dcY); c.stroke();
  if (S.charging) {
    c.strokeStyle = '#facc15'; c.lineWidth = 3; c.beginPath();
    for (let x = 0; x < W; x += 4) { const y = mid + Math.sin(x * 0.02 + phase) * 36; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    phase += 0.12; return;
  }
  const amp = Math.min(1, S.rpm / 7000) * 40 + (S.rpm > 10 ? 4 : 1);
  const f = 0.004 + S.rpm / 12000 * 0.03;
  ['#f97316', '#38bdf8', '#a855f7'].forEach((col, i) => {
    c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
    for (let x = 0; x < W; x += 4) { const y = mid + Math.sin(x * f + phase + i * 2.094) * amp; x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  });
  phase += (S.amps >= 0 ? 1 : -1) * (0.04 + S.rpm / 12000 * 0.3);
}

/* Ölçüm */
function dmmHTML(scenario = '') {
  return `
    <div class="dmm">
      ${scenario}
      <div class="seg">
        <button data-m="vdc" class="${S.dmmMode === 'vdc' ? 'on' : ''}">V⎓</button>
        <button data-m="vac" class="${S.dmmMode === 'vac' ? 'on' : ''}">V~</button>
        <button data-m="ohm" class="${S.dmmMode === 'ohm' ? 'on' : ''}">Ω</button>
      </div>
      <button class="glove ${S.gloves ? 'on' : ''}" id="glove">HV eldiven</button>
      <div class="lcd" id="lcd"><small id="lcd-l">Bir parçaya dokun</small><b id="lcd-v">----</b></div>
      <span id="dmm-extra"></span>
    </div>`;
}
function bindDMM() {
  ctx.querySelectorAll('.seg button').forEach(b => b.onclick = () => { S.dmmMode = b.dataset.m; ctx.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); if (S.dmmPart) measure(S.dmmPart); });
  $('#glove').onclick = () => { S.gloves = !S.gloves; $('#glove').classList.toggle('on', S.gloves); if (S.gloves) toast('HV eldiven takıldı', 'ok'); if (S.dmmPart) measure(S.dmmPart); };
}
function renderMeasure() {
  ctx.innerHTML = dmmHTML(); bindDMM();
  focusHome();
}
const UNIT = { vdc: 'V⎓', vac: 'V~', ohm: 'Ω' };
function measure(id) {
  const p = PART_BY_ID[id]; S.dmmPart = id;
  const lcd = $('#lcd'); if (!lcd) return;
  const l = $('#lcd-l'), v = $('#lcd-v');
  l.textContent = `${p.short} · ${UNIT[S.dmmMode]}`;
  if (p.hv && !S.gloves) { v.textContent = '----'; lcd.classList.add('bad'); toast('Yüksek gerilim! Önce HV eldiven tak', 'warn'); return; }
  let val = p.dmm[S.dmmMode], bad = false;
  if (S.mode === 'fault' && S.fault && S.fault.id === id && S.fault.fault.mode === S.dmmMode) { val = p.fault.value; bad = true; }
  if (val === 'OL' && S.dmmMode === 'ohm' && p.hv && S.mode === 'measure') toast('Gerilim altında direnç ölçülmez: OL', 'warn');
  v.textContent = val;
  lcd.classList.toggle('bad', bad);
  const btn = $('#confirm'); if (btn) { btn.disabled = false; btn.textContent = `Arızalı: ${p.short}`; }
}

/* Arıza */
function startFault() { S.faultScore = [0, 0]; nextFault(); }
function nextFault() {
  let pick; do { pick = PARTS[Math.floor(Math.random() * PARTS.length)]; } while (S.fault && pick.id === S.fault.id);
  S.fault = pick; S.dmmPart = null;
  ctx.innerHTML = dmmHTML(`<div class="scenario"><span class="pill">ARIZA</span><span>${pick.fault.scenario}</span><span class="score" id="f-score">${S.faultScore[0]} / ${S.faultScore[1]}</span></div>`)
    + `<div style="display:flex;gap:8px;margin-top:8px;align-items:center"><button class="confirm" id="confirm" disabled>Arızalı parçayı ölç</button><span class="hint">Parçalara dokun, avometreyi oku, arızalıyı onayla.</span></div>`;
  bindDMM();
  $('#confirm').onclick = () => {
    S.faultScore[1]++;
    if (S.dmmPart === S.fault.id) {
      S.faultScore[0]++; toast(`Doğru! ${S.fault.name} arızalı`, 'ok');
      setTimeout(() => { if (S.mode === 'fault') nextFault(); }, 1400);
    } else { toast('Bu parça sağlam. Ölçmeye devam et', 'err'); $('#f-score').textContent = `${S.faultScore[0]} / ${S.faultScore[1]}`; }
  };
  focusHome();
}

/* Test */
function startQuiz() { S.quizIdx = 0; S.quizScore = 0; renderQuiz(); }
function renderQuiz() {
  S.quizLocked = false;
  if (S.quizIdx >= QUIZ.length) {
    const pct = Math.round(S.quizScore / QUIZ.length * 100);
    ctx.innerHTML = `<div class="quiz"><div class="done"><b>${S.quizScore} / ${QUIZ.length}</b><span class="hint">${pct >= 80 ? 'Harika, konuya hâkimsin.' : pct >= 50 ? 'İyi, Ders sekmesine bir daha göz at.' : 'Ders sekmesiyle tekrar et, sonra dene.'}</span><button class="go lesson-go" id="q-again" style="margin-left:auto;padding:9px 16px;border-radius:999px;background:var(--accent);color:#06121a;font-weight:700;font-size:12.5px">Tekrar</button></div></div>`;
    $('#q-again').onclick = startQuiz; focusHome(); return;
  }
  const q = QUIZ[S.quizIdx];
  let body = '';
  if (q.type === 'mc') {
    const order = [0, 1, 2].sort(() => Math.random() - 0.5);
    body = `<div class="opts">${order.map(i => `<button class="opt" data-i="${i}">${q.options[i]}</button>`).join('')}</div>`;
  } else body = `<span class="hint">Sahnede parçaya tıkla</span>`;
  ctx.innerHTML = `<div class="quiz"><div class="q"><span class="n">${S.quizIdx + 1}/${QUIZ.length}</span><span>${q.q}</span><span class="score">${S.quizScore} puan</span></div>${body}</div>`;
  ctx.querySelectorAll('.opt').forEach(b => b.onclick = () => answerQuiz(+b.dataset.i, b));
  if (S.quizIdx === 0) focusHome();
}
function answerQuiz(ans, btn) {
  if (S.quizLocked) return; S.quizLocked = true;
  const q = QUIZ[S.quizIdx]; const ok = ans === q.answer;
  if (ok) S.quizScore++;
  if (q.type === 'mc') {
    btn.classList.add(ok ? 'ok' : 'no');
    if (!ok) ctx.querySelector(`.opt[data-i="${q.answer}"]`)?.classList.add('ok');
  } else {
    toast(ok ? 'Doğru!' : `Yanlış. Doğrusu: ${PART_BY_ID[q.answer].short}`, ok ? 'ok' : 'err');
    select(q.answer, { card: false });
  }
  setTimeout(() => { S.quizIdx++; renderQuiz(); }, ok ? 900 : 1700);
}

/* ───────────────────────── Etkileşim ───────────────────────── */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
function pick(e) {
  ptr.x = (e.clientX / window.innerWidth) * 2 - 1; ptr.y = -(e.clientY / window.innerHeight) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(clickables, false)[0];
  return hit ? hit.object.userData.partId : null;
}
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const id = pick(e); if (!id) return;
  onPartClick(id);
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  S.hover = pick(e); renderer.domElement.style.cursor = S.hover ? 'pointer' : '';
});
function onPartClick(id) {
  switch (S.mode) {
    case 'explore': case 'lesson': case 'flow': select(id); break;
    case 'measure': select(id, { card: false }); measure(id); break;
    case 'fault': select(id, { card: false }); measure(id); break;
    case 'quiz': {
      const q = QUIZ[S.quizIdx]; if (!q || q.type !== 'part' || S.quizLocked) return;
      answerQuiz(id); break;
    }
  }
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight); labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

/* ───────────────────────── Döngü ───────────────────────── */
const clock = new THREE.Clock();
const hiCol = new THREE.Color();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

  // Sürüş modeli
  if (S.charging) { S.rpm += (0 - S.rpm) * 0.05; S.amps = -28; S.soc = Math.min(100, S.soc + dt * 0.6); }
  else if (S.throttle > 0) { S.rpm += (S.throttle * 110 - S.rpm) * 0.03; S.amps = S.throttle * 3.2 * (0.4 + 0.6 * Math.min(1, S.rpm / 6000)); S.soc = Math.max(0, S.soc - S.amps * dt / 2500); }
  else if (S.throttle < 0) { S.rpm *= 1 - dt * (0.4 + Math.abs(S.throttle) / 40); S.amps = -(S.rpm / 11000) * Math.abs(S.throttle) * 2.4; S.soc = Math.min(100, S.soc - S.amps * dt / 2500); }
  else { S.rpm *= 1 - dt * 0.25; S.amps = S.rpm > 100 ? -3 : 0; }
  if (S.rpm < 1) S.rpm = 0;
  S.volts = 400 - S.amps * 0.025 - (100 - S.soc) * 0.5;

  const wheelRad = (S.rpm / 60) * 2 * Math.PI / 9 * dt;
  wheels.forEach(w => w.rotation.x += wheelRad);

  // Akım yolları
  const drive = S.amps > 3, regen = S.amps < -1 && !S.charging;
  const sp = Math.min(1, Math.abs(S.amps) / 200);
  const set = (id, dir, speed) => { routes[id].dir = dir; routes[id].speed = speed; };
  set('b2i', drive ? 1 : regen ? -1 : 0, sp);
  ['i2m', 'i2m2', 'i2m3'].forEach(r => set(r, drive ? 1 : regen ? -1 : 0, sp));
  set('b2d', S.charging || S.rpm > 0 || drive ? 1 : 0, 0.25);
  set('d2a', S.charging || S.rpm > 0 || drive ? 1 : 0, 0.25);
  set('p2o', S.charging ? 1 : 0, 0.5); set('o2b', S.charging ? 1 : 0, 0.5);
  Object.values(routes).forEach(r => {
    r.dots.forEach(d => {
      d.mesh.visible = r.dir !== 0;
      if (!r.dir) return;
      d.t += r.dir * (0.25 + r.speed * 1.6) * dt; if (d.t > 1) d.t -= 1; if (d.t < 0) d.t += 1;
      d.mesh.position.copy(r.curve.getPointAt(d.t));
      d.mesh.material.color.setHex(r.dir < 0 ? 0x4ade80 : 0xfff6d5);
    });
  });
  chargeCable.visible = S.charging;
  M.hv.emissive.setHex(0xff6a00); M.hv.emissiveIntensity = S.pulseCables ? 0.5 + 0.5 * Math.sin(t * 5) : 0;

  // Gövde
  M.paint.opacity += ((S.ghost ? 0.24 : 1) - M.paint.opacity) * 0.1;
  M.paint.depthWrite = M.paint.opacity > 0.9;
  M.paint.emissive.setHex(0x2f7df6); M.paint.emissiveIntensity = S.ghost ? 0.6 : 0;
  M.glass.opacity = S.ghost ? 0.14 : 0.45;
  shell.position.y += ((S.lift ? 1.9 : 0) - shell.position.y) * 0.08;
  Object.values(parts).forEach(g => g.position.lerp(S.explode ? g.userData.exp : g.userData.base, 0.08));

  // Vurgu
  const pulse = 0.45 + 0.25 * Math.sin(t * 4);
  clickables.forEach(m => {
    const id = m.userData.partId, p = PART_BY_ID[id];
    const sel = id === S.selected, hov = id === S.hover;
    const target = sel ? pulse : hov ? 0.18 : 0;
    const mat = m.material; if (!mat.emissive) return;
    mat.emissive.lerp(hiCol.setHex(target ? p.color : 0x000000), 0.2);
    mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.2;
  });

  // Etiketler
  const showLabels = S.labels && S.mode !== 'quiz' && !S.lift;
  Object.values(labels).forEach(l => { l.obj.visible = showLabels; });

  // Kamera
  if (S.camTween) {
    const k = Math.min(1, (performance.now() - S.camTween.start) / S.camTween.ms), e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(S.camTween.p0, S.camTween.p1, e);
    controls.target.lerpVectors(S.camTween.t0, S.camTween.t1, e);
    if (k >= 1) S.camTween = null;
  }
  controls.update();
  updateFlowUI();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
controls.addEventListener('start', () => { S.camTween = null; });
const qs = new URLSearchParams(location.search);
setMode(['explore', 'lesson', 'flow', 'measure', 'fault', 'quiz'].includes(qs.get('mode')) ? qs.get('mode') : 'explore');
if (qs.has('nointro')) { $('#intro').classList.add('hide'); if (S.mode === 'explore' && qs.get('part') !== 'none') select(qs.get('part') || 'battery'); }
if (qs.has('solid')) { S.ghost = false; $('#t-ghost').classList.remove('active'); }
if (qs.has('cam')) { const [x, y, z] = qs.get('cam').split(',').map(Number); S.camTween = null; camera.position.set(x, y, z); controls.target.set(0, 0.7, 0); }
animate();
