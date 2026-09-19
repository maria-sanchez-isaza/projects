import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { ShowroomEffects } from './render-effects.js';

const experience = document.querySelector('.experience');
const sceneElement = document.querySelector('.scene');
const view = document.querySelector('#showroom-canvas');
const status = document.querySelector('#model-status');
const chapters = [...document.querySelectorAll('.chapter')];
const chapterLinks = [...document.querySelectorAll('[data-chapter]')];
const progressBar = document.querySelector('#journey-progress');
const journeyLabel = document.querySelector('#journey-label');
const tuningDock = document.querySelector('#tuning-dock');
const tuningToggle = document.querySelector('#tuning-toggle');
const tuningPanel = document.querySelector('#render-tuning');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 767px)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let renderer, effects, camera, mixer, clips, poses, model, sampledCenters, idleAction;
let activeIndex = 0, sceneVisible = true, ready = false;
let renderSettings;
const timer = new THREE.Timer();
timer.connect(document);

chapters[0].classList.add('is-active');
function updateSceneVisibility() {
  const bounds = sceneElement.getBoundingClientRect();
  const header = document.querySelector('.site-header').offsetHeight;
  sceneVisible = bounds.bottom > header + 1 && bounds.top < innerHeight;
  tuningDock.hidden = !ready || !sceneVisible;
}
const viewportObserver = new IntersectionObserver(updateSceneVisibility);
viewportObserver.observe(sceneElement);

function addSlider(name, min, max, step, initial, onInput) {
  const label = document.createElement('label');
  const title = document.createElement('span');
  const value = document.createElement('output');
  const input = document.createElement('input');
  title.textContent = name;
  value.textContent = initial.toFixed(2);
  label.append(title, value);
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = initial;
  input.setAttribute('aria-label', name);
  input.addEventListener('input', () => {
    const next = Number(input.value);
    value.textContent = next.toFixed(2);
    onInput(next);
  });
  tuningPanel.append(label, input);
}

function setupTuning(ambient, key, scene) {
  addSlider('Exposure', .35, 1.5, .01, renderer.toneMappingExposure, value => renderer.toneMappingExposure = value);
  addSlider('Ambient', 0, 1.5, .01, ambient.intensity, value => ambient.intensity = value);
  addSlider('Key light', 0, 5, .05, key.intensity, value => key.intensity = value);
  addSlider('Saturation', .7, 1.5, .01, effects.settings.saturation, value => {
    effects.settings.saturation = effects.outputMaterial.uniforms.saturation.value = value;
  });
  addSlider('Contrast', .8, 1.3, .01, effects.settings.contrast, value => {
    effects.settings.contrast = effects.outputMaterial.uniforms.contrast.value = value;
  });
  addSlider('Bloom', 0, .5, .01, effects.settings.bloom, value => {
    effects.settings.bloom = effects.outputMaterial.uniforms.bloom.value = value;
  });
  addSlider('Reflections', 0, 2, .01, scene.environmentIntensity, value => scene.environmentIntensity = value);
  tuningToggle.addEventListener('click', () => {
    const open = tuningPanel.hidden;
    tuningPanel.hidden = !open;
    tuningToggle.setAttribute('aria-expanded', String(open));
  });
  if (new URLSearchParams(location.search).has('renderDebug')) {
    tuningPanel.hidden = false;
    tuningToggle.setAttribute('aria-expanded', 'true');
  }
}

function pose(position, target, up) {
  const virtualCamera = new THREE.PerspectiveCamera();
  virtualCamera.position.copy(position);
  virtualCamera.up.copy(up);
  virtualCamera.lookAt(target);
  return { position: position.clone(), quaternion: virtualCamera.quaternion.clone() };
}

function sampleCenters(gltf, idle) {
  // Sample the already-exported idle placement once, then restore the intro.
  idle.reset().play();
  mixer.setTime(2);
  gltf.scene.updateMatrixWorld(true);
  const centerOf = name => {
    const object = gltf.scene.getObjectByName(name);
    if (!object) throw Error(`Missing camera subject: ${name}`);
    return new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
  };
  const consoleCenter = centerOf('V7_|_13_|_Touch_console_arrives');
  const displayCenter = centerOf('V7_|_14_|_Wall_display_seats');
  const scannerCenter = centerOf('V8_|_Scanner_staging_-_camera-facing_three_quarter');
  const vrCenter = centerOf('V7_|_19_|_VR_appears');
  mixer.stopAllAction();
  mixer.update(0);
  return { consoleCenter, displayCenter, scannerCenter, vrCenter };
}

function buildPoses(original, centers) {
  const { consoleCenter, displayCenter, scannerCenter, vrCenter } = centers;
  const direction = original.getWorldDirection(new THREE.Vector3()).normalize();
  const right = direction.clone().cross(original.up).normalize();
  const mobile = narrow.matches;
  const subjectPose = (focus, distance, side) => {
    const offset = mobile ? 0 : distance * .145;
    const eye = focus.clone().addScaledVector(direction, -distance);
    const aim = focus.clone().addScaledVector(right, side === 'right' ? -offset : offset);
    return pose(eye, aim, original.up);
  };
  const overview = mobile
    ? pose(original.position, original.position.clone().addScaledVector(direction, 30).add(new THREE.Vector3(0, -1.4, 0)), original.up)
    : { position: original.position.clone().addScaledVector(direction, -2.2), quaternion: original.quaternion.clone() };
  const signageFocus = consoleCenter.clone().lerp(displayCenter, .39).add(new THREE.Vector3(0, .15, .1));
  const scannerFocus = scannerCenter.clone().add(new THREE.Vector3(0, .12, 0));
  const vrFocus = vrCenter.clone().add(new THREE.Vector3(0, .12, 0));
  return [
    overview,
    subjectPose(signageFocus, mobile ? 12.5 : 11.6, 'right'),
    subjectPose(scannerFocus, mobile ? 10.5 : 7.8, 'left'),
    subjectPose(vrFocus, mobile ? 10.5 : 7.8, 'right'),
  ];
}

function cutTo(index) {
  if (!poses || !camera) return;
  camera.position.copy(poses[index].position);
  camera.quaternion.copy(poses[index].quaternion);
}

function scrubCamera() {
  if (!poses || !camera) return;
  if (reducedMotion.matches) { cutTo(activeIndex); return; }
  const header = document.querySelector('.site-header').offsetHeight;
  // Use the same section-top anchors as navigation. No clock or catch-up tween:
  // a given scroll offset always produces exactly the same camera framing.
  const stops = chapters.map(chapter => chapter.getBoundingClientRect().top + scrollY - header);
  let part = 0;
  while (part < stops.length - 2 && scrollY >= stops[part + 1]) part++;
  const fraction = clamp((scrollY - stops[part]) / Math.max(1, stops[part + 1] - stops[part]), 0, 1);
  const eased = fraction * fraction * (3 - 2 * fraction);
  camera.position.lerpVectors(poses[part].position, poses[part + 1].position, eased);
  // The saved states encode their look-at direction as a quaternion. Slerping
  // that orientation preserves both endpoint framings without inventing targets.
  camera.quaternion.slerpQuaternions(poses[part].quaternion, poses[part + 1].quaternion, eased);
}

function setActive(index, direct = false) {
  if (index === activeIndex && !direct) return;
  activeIndex = index;
  chapters.forEach((chapter, i) => chapter.classList.toggle('is-active', i === index));
  sceneElement.dataset.side = index === 0 ? 'intro' : index === 2 ? 'right' : 'left';
  chapterLinks.forEach(link => {
    if (link.dataset.chapter === chapters[index].id) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  if (direct) cutTo(index);
}

function updateScroll() {
  updateSceneVisibility();
  const marker = document.querySelector('.site-header').offsetHeight + (innerHeight - document.querySelector('.site-header').offsetHeight) * .5;
  let closest = 0, distance = Infinity;
  chapters.forEach((chapter, index) => {
    const bounds = chapter.getBoundingClientRect();
    const delta = Math.abs((bounds.top + bounds.bottom) * .5 - marker);
    if (delta < distance) { distance = delta; closest = index; }
  });
  setActive(closest);
  scrubCamera();
  const bounds = experience.getBoundingClientRect();
  const length = Math.max(1, bounds.height - (innerHeight - document.querySelector('.site-header').offsetHeight));
  const progress = clamp(-bounds.top / length, 0, 1);
  progressBar.style.transform = `scaleX(${progress})`;
  journeyLabel.textContent = progress > .97 ? 'Keep exploring below' : 'Scroll to explore';
}

function jumpTo(id, pushHistory = true) {
  const destination = document.getElementById(id);
  if (!destination) return false;
  const index = chapters.indexOf(destination);
  const header = document.querySelector('.site-header').offsetHeight;
  const top = id === 'top' || id === 'experience' ? 0 : destination.getBoundingClientRect().top + scrollY - header;
  scrollTo({ top, behavior: 'instant' });
  if (index >= 0) setActive(index, true);
  else if (id === 'top' || id === 'experience') setActive(0, true);
  updateScroll();
  if (pushHistory) history.pushState(null, '', `#${id}`);
  return true;
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!jumpTo(link.getAttribute('href').slice(1))) return;
    event.preventDefault();
    if (link.classList.contains('skip-link')) {
      const destination = document.querySelector('#additional-services');
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
      destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
    }
  });
});
addEventListener('scroll', updateScroll, { passive: true });
addEventListener('resize', updateScroll, { passive: true });
reducedMotion.addEventListener('change', updateScroll);
addEventListener('popstate', () => location.hash && jumpTo(location.hash.slice(1), false));
updateScroll();

window.site3d = {
  get ready() { return ready; },
  previewIdle() {
    if (!ready) return;
    mixer.stopAllAction();
    idleAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    mixer.update(0);
  },
  diagnostics() {
    return { active: chapters[activeIndex].id, clips: clips?.map(clip => ({ name: clip.name, duration: clip.duration })),
      camera: camera && { position: camera.position.toArray(), quaternion: camera.quaternion.toArray(), fov: camera.fov },
      poses: poses?.map(item => ({ position: item.position.toArray(), quaternion: item.quaternion.toArray() })),
      settings: renderSettings && { exposure: renderer.toneMappingExposure, ambient: renderSettings.ambient.intensity,
        key: renderSettings.key.intensity, saturation: effects.settings.saturation, contrast: effects.settings.contrast,
        bloom: effects.settings.bloom, reflections: renderSettings.scene.environmentIntensity },
      tuning: { visible: !tuningDock.hidden, open: !tuningPanel.hidden },
      sliders: [...tuningPanel.querySelectorAll('input')].map(input => ({ name: input.getAttribute('aria-label'), value: Number(input.value) })),
      status: status.textContent };
  },
};

try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, narrow.matches ? 1 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xc7c7c5);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = .71;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  view.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, .06).texture;
  scene.environmentIntensity = .32;
  room.dispose(); pmrem.dispose();
  const ambient = new THREE.HemisphereLight(0xf5f7f2, 0x746b60, .84); scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff9f2, 2.25);
  key.position.set(-5, 12, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .5, far: 40 });
  key.shadow.normalBias = .015; key.shadow.bias = -.0001; key.shadow.radius = 2.5; scene.add(key);
  const fill = new THREE.DirectionalLight(0xe3efff, .2); fill.position.set(8, 7, -3); scene.add(fill);
  effects = new ShowroomEffects(renderer);
  renderSettings = { scene, ambient, key };
  setupTuning(ambient, key, scene);

  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('./assets/Tosolini_Showroom_Desktop.glb');
  model = gltf.scene;
  scene.add(model);
  model.updateMatrixWorld(true);
  model.traverse(object => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    object.castShadow = materials.every(material => !material.transparent && !(material.transmission > 0));
    object.receiveShadow = materials.every(material => !material.transparent);
    for (const material of materials) {
      if (material.name.includes('satin architectural glass')) { material.roughness = .11; material.thickness = .08; material.envMapIntensity = 1.2; }
      if (material.name.includes('dark optical glass')) material.envMapIntensity = 1.25;
      if (material.name.includes('Screen | midnight blue')) material.emissiveIntensity = 2;
      if (/Display \| ivory ink|Map \|/.test(material.name)) material.emissiveIntensity = 1.2;
      if (/hologram|architectural sage edges|clear lime scan samples/i.test(material.name)) material.emissiveIntensity = 1.15;
    }
  });
  const foundation = model.getObjectByName('Expanded curved foundation');
  foundation?.traverse(object => {
    if (object.isMesh && object.material.name === 'Limestone | stage') {
      object.material = object.material.clone(); object.material.color.multiplyScalar(.35);
    }
  });

  const original = gltf.cameras[0];
  if (!original) throw Error('Missing showroom overview camera');
  camera = original.clone();
  original.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale);
  camera.updateMatrixWorld();
  mixer = new THREE.AnimationMixer(model);
  clips = gltf.animations;
  const intro = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Intro'));
  const idle = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Idle_Loop'));
  if (!intro || !idle) throw Error('Missing showroom animation clips');
  idleAction = idle;
  sampledCenters = sampleCenters(gltf, idle);
  poses = buildPoses(camera, sampledCenters);
  camera.position.copy(poses[0].position);
  camera.quaternion.copy(poses[0].quaternion);
  intro.reset(); intro.setLoop(THREE.LoopOnce, 1); intro.clampWhenFinished = true; intro.play();
  mixer.addEventListener('finished', event => {
    if (event.action !== intro) return;
    idle.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    idle.crossFadeFrom(intro, .5, false);
  });

  function resize() {
    const width = view.clientWidth, height = view.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, narrow.matches ? 1 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = narrow.matches ? 34 : original.fov;
    camera.updateProjectionMatrix();
    effects.resize();
    if (ready && narrow.matches !== resize.wasNarrow) {
      poses = buildPoses(original, sampledCenters);
    }
    resize.wasNarrow = narrow.matches;
    if (ready) scrubCamera();
  }
  new ResizeObserver(resize).observe(view);
  narrow.addEventListener('change', resize);
  resize();
  ready = true;
  status.textContent = '';
  tuningDock.hidden = !sceneVisible;
  if (location.hash) jumpTo(location.hash.slice(1), false);
  else updateScroll();

  renderer.setAnimationLoop(() => {
    timer.update();
    const dt = Math.min(timer.getDelta(), .25);
    if (!sceneVisible || document.hidden) return;
    mixer.update(dt);
    effects.render(scene, camera);
  });
} catch (error) {
  status.textContent = 'The 3D showroom is unavailable. Explore the sections below.';
  console.error(error);
}
