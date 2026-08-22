import * as THREE from 'three';

const canvas = document.getElementById('scene');
const tooltip = document.getElementById('sceneTooltip');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// legal pages have no intro flow — their scene renders from the start
const isLegalPage = document.body && document.body.classList.contains('legal-page');

if (!canvas || !window.WebGLRenderingContext) {
  document.documentElement.classList.add('no-webgl');
}

function boot() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#07070c');
scene.fog = new THREE.FogExp2('#07070c', 0.05);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);

scene.add(new THREE.AmbientLight('#262a45', 1.4));

const keyLight = new THREE.PointLight('#5f7bff', 90, 40, 2);
keyLight.position.set(-7, 6, 5);
scene.add(keyLight);

const warmLight = new THREE.PointLight('#ff8c52', 36, 28, 2);
warmLight.position.set(8, 3, -7);
scene.add(warmLight);

const topLight = new THREE.DirectionalLight('#aab4ff', 1.1);
topLight.position.set(2, 10, -6);
scene.add(topLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(40, 64),
  new THREE.MeshStandardMaterial({ color: '#0c0d15', roughness: 0.95, metalness: 0.1 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const grid = new THREE.GridHelper(80, 80, '#232842', '#161a2c');
grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.35;
scene.add(grid);

const ACCENT = new THREE.Color('#7b96ff');
const BAR_COUNT = 76;
const barGeo = new THREE.BoxGeometry(0.16, 1, 0.16);
barGeo.translate(0, 0.5, 0);
const barMat = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#3d55c8',
  emissiveIntensity: 0.75,
  roughness: 0.45,
  metalness: 0.3
});
const bars = new THREE.InstancedMesh(barGeo, barMat, BAR_COUNT);
bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

const barData = [];
const dummy = new THREE.Object3D();
for (let i = 0; i < BAR_COUNT; i++) {
  const row = i < BAR_COUNT / 2 ? 0 : 1;
  const col = i % (BAR_COUNT / 2);
  const x = -15 + col * (30 / (BAR_COUNT / 2 - 1));
  const z = row === 0 ? -1.5 : -6.5;
  const phase = Math.random() * Math.PI * 2;
  const speed = 0.9 + Math.random() * 1.4;
  const base = 0.25 + Math.random() * 0.3;
  const amp = 0.9 + Math.random() * 1.9;
  barData.push({ x, z, phase, speed, base, amp });
  dummy.position.set(x, 0, z);
  dummy.scale.set(1, 1, 1);
  dummy.updateMatrix();
  bars.setMatrixAt(i, dummy.matrix);
  bars.setColorAt(i, new THREE.Color(row === 0 ? '#8fa4ff' : '#5a71e8'));
}
bars.instanceColor.needsUpdate = true;
scene.add(bars);

const coreGroup = new THREE.Group();
coreGroup.position.set(0, 1.7, -4);
scene.add(coreGroup);

const coreInner = new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 48, 48),
  new THREE.MeshStandardMaterial({
    color: '#0b0d16',
    emissive: '#7b96ff',
    emissiveIntensity: 1.7,
    roughness: 0.25,
    metalness: 0.4
  })
);
coreGroup.add(coreInner);

const coreShell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.95, 1),
  new THREE.MeshBasicMaterial({ color: '#93aaff', wireframe: true, transparent: true, opacity: 0.26 })
);
coreGroup.add(coreShell);

const rings = [];
[[2.6, 0.5, 0.55], [3.5, -0.9, 0.34], [4.5, 0.25, 0.2]].forEach(([radius, tilt, opacity], idx) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.016, 12, 160),
    new THREE.MeshBasicMaterial({ color: '#7b96ff', transparent: true, opacity })
  );
  ring.rotation.x = Math.PI / 2 + tilt * 0.35;
  ring.rotation.y = tilt;
  ring.userData.spin = (idx % 2 === 0 ? 1 : -1) * (0.12 + idx * 0.05);
  coreGroup.add(ring);
  rings.push(ring);
});

const satellites = [];
for (let i = 0; i < 6; i++) {
  const sat = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22),
    new THREE.MeshStandardMaterial({
      color: '#11131f',
      emissive: '#7b96ff',
      emissiveIntensity: 1.15,
      roughness: 0.3,
      metalness: 0.5
    })
  );
  sat.userData = {
    orbitRadius: 3.2 + i * 0.55,
    orbitSpeed: 0.1 + Math.random() * 0.22,
    orbitPhase: Math.random() * Math.PI * 2,
    yBase: 0.6 + Math.random() * 2.4,
    bobAmp: 0.25 + Math.random() * 0.4,
    bobSpeed: 0.5 + Math.random() * 0.8,
    hoverScale: 1,
    label: `Resonator — 00${i + 1}`
  };
  sat.userData.orbitPhase += i * 1.1;
  scene.add(sat);
  satellites.push(sat);
}

const PARTICLE_COUNT = 420;
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 38;
  particlePositions[i * 3 + 1] = Math.random() * 9;
  particlePositions[i * 3 + 2] = -16 + Math.random() * 26;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({
    color: '#93aaff',
    size: 0.04,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true
  })
);
scene.add(particles);

const camCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 1.6, 9.6),
    new THREE.Vector3(-8.5, 2.0, 2.6),
    new THREE.Vector3(4.5, 7.5, 3.2),
    new THREE.Vector3(0, 2.4, 12.8)
  ],
  false,
  'centripetal'
);
const lookTargets = [
  new THREE.Vector3(0, 1.5, -4),
  new THREE.Vector3(-3, 1.2, -6),
  new THREE.Vector3(0, 0.2, -5),
  new THREE.Vector3(0, 1.5, -4)
];
const tmpLook = new THREE.Vector3();

document.documentElement.classList.add('webgl-active');

function sampleLook(t, out) {
  const seg = Math.min(Math.floor(t * (lookTargets.length - 1)), lookTargets.length - 2);
  const local = t * (lookTargets.length - 1) - seg;
  const eased = local * local * (3 - 2 * local);
  out.lerpVectors(lookTargets[seg], lookTargets[seg + 1], eased);
}

let scrollTarget = 0;
let scrollCurrent = 0;
function readScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollTarget = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
}
addEventListener('scroll', readScroll, { passive: true });
readScroll();

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / innerHeight) * 2 - 1;
});

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const hoverables = [coreInner, coreShell, ...satellites];
let hovered = null;
let pulse = 0;

function pickObject(clientX, clientY) {
  pointerNdc.x = (clientX / innerWidth) * 2 - 1;
  pointerNdc.y = -(clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointerNdc, camera);
  const hits = raycaster.intersectObjects(hoverables, false);
  return hits.length ? hits[0].object : null;
}

function projectToScreen(obj) {
  const v = new THREE.Vector3();
  obj.getWorldPosition(v);
  v.project(camera);
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
}

function isOverUi(target) {
  return !!(target instanceof Element && target.closest('a, button, input, label, textarea, select, .site-nav, .cta-form'));
}

window.addEventListener('pointermove', (e) => {
  if (!document.documentElement.classList.contains('entered')) return;
  const hit = isOverUi(e.target) ? null : pickObject(e.clientX, e.clientY);
  hovered = hit;
  if (hit) {
    const label = hit === coreInner || hit === coreShell ? 'Signal Core — 001' : hit.userData.label;
    tooltip.textContent = label;
    const p = projectToScreen(hit);
    tooltip.style.left = `${p.x}px`;
    tooltip.style.top = `${p.y}px`;
    tooltip.classList.add('show');
    document.body.style.cursor = 'pointer';
  } else {
    tooltip.classList.remove('show');
    document.body.style.cursor = '';
  }
});

window.addEventListener('click', (e) => {
  if (!document.documentElement.classList.contains('entered')) return;
  if (isOverUi(e.target)) return;
  const hit = pickObject(e.clientX, e.clientY);
  if (hit) {
    pulse = 1;
    window.dispatchEvent(new CustomEvent('noisy:blip'));
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
const speedScale = reduceMotion ? 0 : 1;

let isSceneVisible = true;
if ('IntersectionObserver' in window && canvas) {
  const _obs = new IntersectionObserver(([e]) => { isSceneVisible = e.isIntersecting; }, { threshold: 0 });
  _obs.observe(canvas);
}

function tick() {
  requestAnimationFrame(tick);
  if (document.hidden || !isSceneVisible) return;
  // the intro overlay is fully opaque — rendering behind it only steals GPU
  // from the intro animations, so the scene stays paused until it is gone
  if (!isLegalPage && !document.documentElement.classList.contains('entered')) return;

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  scrollCurrent += (scrollTarget - scrollCurrent) * Math.min(dt * 4.2, 1);
  mouse.x += (mouse.tx - mouse.x) * Math.min(dt * 3, 1);
  mouse.y += (mouse.ty - mouse.y) * Math.min(dt * 3, 1);

  pulse *= Math.exp(-dt * 2.4);

  const camPos = camCurve.getPoint(scrollCurrent);
  const bobY = speedScale ? Math.sin(t * 0.5) * 0.07 : 0;
  camera.position.set(
    camPos.x + mouse.x * 0.45,
    camPos.y + bobY - mouse.y * 0.3,
    camPos.z
  );
  sampleLook(scrollCurrent, tmpLook);
  tmpLook.x += mouse.x * 0.6;
  tmpLook.y -= mouse.y * 0.4;
  camera.lookAt(tmpLook);

  const beat = speedScale ? Math.pow(Math.max(Math.sin(t * Math.PI * 2 * 1.15), 0), 6) : 0;
  const coreScale = 1 + beat * 0.09 + pulse * 0.22;
  coreInner.scale.setScalar(coreScale);
  coreShell.scale.setScalar(1.02 + beat * 0.05);
  coreInner.material.emissiveIntensity = 1.55 + beat * 0.7 + pulse * 1.6;
  coreShell.rotation.y = t * 0.14 * speedScale;
  coreShell.rotation.x = t * 0.07 * speedScale;
  rings.forEach((ring) => {
    ring.rotation.z += ring.userData.spin * dt * speedScale;
  });

  for (let i = 0; i < BAR_COUNT; i++) {
    const b = barData[i];
    const wave = speedScale
      ? Math.pow(Math.abs(Math.sin(t * b.speed + b.phase)), 1.6)
      : 0.45;
    const h = b.base + (wave * b.amp + pulse * 1.4) * (0.65 + 0.35 * Math.sin(i * 0.4 + t * 0.6 * speedScale));
    dummy.position.set(b.x, 0, b.z);
    dummy.scale.set(1, Math.max(h, 0.08), 1);
    dummy.updateMatrix();
    bars.setMatrixAt(i, dummy.matrix);
  }
  bars.instanceMatrix.needsUpdate = true;

  satellites.forEach((sat) => {
    const u = sat.userData;
    const angle = u.orbitPhase + t * u.orbitSpeed * speedScale;
    sat.position.set(
      coreGroup.position.x + Math.cos(angle) * u.orbitRadius,
      u.yBase + Math.sin(t * u.bobSpeed + u.orbitPhase) * u.bobAmp * speedScale,
      coreGroup.position.z + Math.sin(angle) * u.orbitRadius * 0.55
    );
    sat.rotation.y += dt * 0.8 * speedScale;
    const targetScale = hovered === sat ? 1.45 : 1;
    u.hoverScale += (targetScale - u.hoverScale) * Math.min(dt * 8, 1);
    sat.scale.setScalar(u.hoverScale);
  });
  const coreHoverTarget = hovered ? 1.06 : 1;
  coreGroup.userData.hs = coreGroup.userData.hs ?? 1;
  coreGroup.userData.hs += (coreHoverTarget - coreGroup.userData.hs) * Math.min(dt * 8, 1);
  coreGroup.scale.setScalar(coreGroup.userData.hs);

  if (speedScale) {
    const posAttr = particleGeo.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let y = posAttr.getY(i) + dt * 0.14;
      if (y > 9.5) y = 0;
      posAttr.setY(i, y);
      posAttr.setX(i, posAttr.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.03);
    }
    posAttr.needsUpdate = true;
  }

  renderer.render(scene, camera);
  }

  tick();

  // warm up shaders/materials once so the first visible frame after the
  // intro doesn't stutter on shader compilation
  renderer.render(scene, camera);
  }

// defer WebGL boot until the intro is gone: shader compilation and context
// setup are heavy and would steal the main thread from the entrance animations
function bootWhenReady() {
  const root = document.documentElement;
  if (root.classList.contains('entered') || !document.getElementById('intro')) {
    boot();
    return;
  }
  const start = () => {
    obs.disconnect();
    boot();
  };
  const obs = new MutationObserver(() => {
    if (root.classList.contains('entered') || !document.getElementById('intro')) start();
  });
  obs.observe(root, { attributes: true, attributeFilter: ['class'] });
}

bootWhenReady();
