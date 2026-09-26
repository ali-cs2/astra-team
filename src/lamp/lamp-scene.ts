// @ts-nocheck -- This authored Three.js scene is copied from the earlier prototype.
import * as THREE from "./assets/three.module.js";

const hero = document.querySelector(".lamp-hero");
const canvas = document.querySelector("#lamp-canvas");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 80);
  camera.position.set(0, 1.2, 12.4);
  camera.lookAt(-1.35, 0.05, 0);

  scene.add(new THREE.AmbientLight(0xb6a594, 1.25));
  const key = new THREE.DirectionalLight(0xffd5a0, 2.6);
  key.position.set(-3, 7, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb6b7b5, 1.1);
  fill.position.set(5, 2, 1);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xc3dae2, 2.1);
  rim.position.set(-4, 3, -5);
  scene.add(rim);

  // Fine etched glass catches light without another downloaded texture.
  const grain = new Uint8Array(64 * 64 * 4);
  for (let i = 0; i < grain.length; i += 4) {
    const value = 125 + Math.round(10 * Math.sin(i * 12.9898));
    grain.set([value, value, value, 255], i);
  }
  const glassTexture = new THREE.DataTexture(grain, 64, 64);
  glassTexture.wrapS = glassTexture.wrapT = THREE.RepeatWrapping;
  glassTexture.repeat.set(5, 3);
  glassTexture.needsUpdate = true;

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x24231f, metalness: .78, roughness: .34 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x493a2b, metalness: .73, roughness: .37, side: THREE.DoubleSide });
  const glassMat = new THREE.MeshPhongMaterial({ color: 0xd0a16b, transparent: true, opacity: .38, bumpMap: glassTexture, bumpScale: .012, shininess: 120, specular: 0xe9c89a, depthWrite: false, side: THREE.DoubleSide });
  function makeBeamGeometry(startY, endY, startWidth, endWidth) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([
      -startWidth / 2, startY, 0, startWidth / 2, startY, 0,
      -endWidth / 2, endY, 0, endWidth / 2, endY, 0
    ], 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute([
      0, 0, 1, 0, 0, 1, 1, 1
    ], 2));
    geometry.setIndex([0, 1, 2, 2, 1, 3]);
    geometry.computeVertexNormals();
    return geometry;
  }

  function makeBeamMaterial(color, opacity) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
          float softEdge = smoothstep(0.0, 0.78, across);
          float centerGlow = 0.68 + 0.32 * exp(-pow((vUv.x - 0.5) * 4.2, 2.0));
          float attenuation = 1.0 / (1.0 + 5.0 * vUv.y * vUv.y);
          float fadeAtEnd = 1.0 - smoothstep(0.72, 1.0, vUv.y);
          float alpha = softEdge * centerGlow * attenuation * fadeAtEnd * uOpacity;
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(uColor, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }

  function makeSoftBeam(parent, { startY, endY, startWidth, endWidth, color }) {
    const geometry = makeBeamGeometry(startY, endY, startWidth, endWidth);
    const layers = [
      { angle: 0, weight: 1 },
      { angle: -Math.PI / 3, weight: .34 },
      { angle: Math.PI / 3, weight: .34 }
    ].map(({ angle, weight }) => {
      const material = makeBeamMaterial(color, 0);
      const beam = new THREE.Mesh(geometry, material);
      beam.position.set(0, -.14, 0); // Shared globe-local origin with the bulb.
      beam.rotation.y = angle;
      beam.renderOrder = 2;
      parent.add(beam);
      return { material, weight };
    });
    return {
      setOpacity(value) {
        layers.forEach(({ material, weight }) => {
          material.uniforms.uOpacity.value = value * weight;
        });
      }
    };
  }

  function makeFloorGlowMaterial(color, opacity) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float radius = length(vUv - vec2(0.5)) * 2.0;
          float alpha = (1.0 - smoothstep(0.18, 1.0, radius)) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }

  function mesh(geometry, material, parent, x = 0, y = 0, z = 0) {
    const obj = new THREE.Mesh(geometry, material);
    obj.position.set(x, y, z);
    parent.add(obj);
    return obj;
  }

  function makeLamp({ x, y, z, scale, fixed = false }) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    scene.add(group);

    mesh(new THREE.CylinderGeometry(.15, .17, 5.1, 28), poleMat, group, 0, -2.15);
    mesh(new THREE.CylinderGeometry(.25, .26, .22, 28), poleMat, group, 0, -4.58);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, .25, 0),
      new THREE.Vector3(.05, .86, 0),
      new THREE.Vector3(.35, 1.31, 0),
      new THREE.Vector3(.86, 1.45, 0),
      new THREE.Vector3(1.28, 1.26, 0),
      new THREE.Vector3(1.37, .97, 0)
    ]);
    mesh(new THREE.TubeGeometry(curve, 42, .12, 12, false), poleMat, group);
    mesh(new THREE.CylinderGeometry(.17, .2, .24, 24), poleMat, group, 1.37, .92);
    const globe = new THREE.Group();
    globe.position.set(1.37, -.29, 0);
    group.add(globe);
    mesh(new THREE.SphereGeometry(.86, 48, 32), glassMat, globe);
    mesh(new THREE.CylinderGeometry(.14, .18, .28, 24), bronzeMat, globe, 0, .95);
    mesh(new THREE.CylinderGeometry(.18, .23, .22, 24), poleMat, globe, 0, .4);
    const equator = mesh(new THREE.TorusGeometry(.855, .03, 10, 48), bronzeMat, globe);
    equator.rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(.38, .32, .14, 32), bronzeMat, globe, 0, -.83);
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffdfad, emissive: 0xffc977, emissiveIntensity: 1.6, roughness: .26, metalness: .05 });
    const bulb = mesh(new THREE.SphereGeometry(.32, 28, 18), bulbMat, globe, 0, -.14);
    const light = new THREE.PointLight(0xffc881, 13, 5.5, 1.7);
    light.position.set(1.37, -.41, 0);
    group.add(light);
    const hoodMat = bronzeMat.clone();
    hoodMat.transparent = true;
    const hood = mesh(new THREE.SphereGeometry(.9, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), hoodMat, globe, 0, 0);
    const hoodRim = mesh(new THREE.TorusGeometry(.9, .05, 10, 48), bronzeMat.clone(), globe);
    hoodRim.rotation.x = Math.PI / 2;
    const upBeam = makeSoftBeam(globe, { startY: 0, endY: 4.4, startWidth: .12, endWidth: 4.1, color: 0xf3ad59 });
    const downBeam = makeSoftBeam(globe, { startY: 0, endY: -4.2, startWidth: .12, endWidth: 3.5, color: 0xf5bd76 });
    const floorMat = makeFloorGlowMaterial(0xe7ae65, .18);
    const floor = mesh(new THREE.CircleGeometry(2.25, 48), floorMat, group, 1.37, -4.66);
    floor.rotation.x = -Math.PI / 2;
    floor.renderOrder = 1;
    if (fixed) {
      hood.visible = false;
      hoodRim.visible = false;
      upBeam.setOpacity(.3);
      downBeam.setOpacity(.34);
    }
    return { group, globe, bulb, bulbMat, light, hood, hoodRim, upBeam, downBeam, floorMat, fixed };
  }

  // One luminaire design is repeated at two depths. The distant lamp holds the baseline.
  const baseline = makeLamp({ x: -7.8, y: -.85, z: -3.7, scale: .59, fixed: true });
  const improved = makeLamp({ x: -4.7, y: -.15, z: .7, scale: 1.18 });
  baseline.group.rotation.y = -.1;
  improved.group.rotation.y = -.12;
  let stage = Number(hero.dataset.stage) || 0;
  let from = stage;
  let animationStart = performance.now();
  let animating = true;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const states = [
    { hood: 0, glow: 1, up: .3, down: .34, warmth: 0 },
    { hood: 1, glow: .9, up: 0, down: .32, warmth: 0 },
    { hood: 1, glow: .58, up: 0, down: .22, warmth: 0 },
    { hood: 1, glow: .5, up: 0, down: .19, warmth: 1 },
    { hood: 1, glow: .045, up: 0, down: .012, warmth: 1 }
  ];
  function applyState(a, b, t) {
    const hood = lerp(a.hood, b.hood, t);
    const glow = lerp(a.glow, b.glow, t);
    const warmth = lerp(a.warmth, b.warmth, t);
    improved.hood.visible = hood > .001;
    improved.hoodRim.visible = hood > .001;
    improved.hood.position.y = (1 - hood) * 1.25;
    improved.hoodRim.position.y = (1 - hood) * 1.25;
    improved.hood.material.opacity = Math.min(1, hood * 1.4);
    improved.hoodRim.material.opacity = Math.min(1, hood * 1.4);
    improved.light.intensity = 12 * glow;
    improved.bulbMat.emissiveIntensity = 1.6 * glow;
    improved.bulbMat.emissive.setRGB(1, lerp(.71, .43, warmth), lerp(.39, .16, warmth));
    improved.light.color.setRGB(1, lerp(.78, .56, warmth), lerp(.5, .31, warmth));
    improved.upBeam.setOpacity(lerp(a.up, b.up, t));
    improved.downBeam.setOpacity(lerp(a.down, b.down, t));
    improved.floorMat.uniforms.uOpacity.value = .18 * glow;
    camera.position.x = -.11 * (stage / 4);
    camera.lookAt(-1.35 - .08 * (stage / 4), .05, 0);
  }
  function size() {
    const w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  new ResizeObserver(size).observe(hero);
  size();
  function frame(time) {
    if (!animating) return;
    const t = reducedMotion ? 1 : Math.min(1, (time - animationStart) / 1050);
    applyState(states[from], states[stage], ease(t));
    renderer.render(scene, camera);
    if (t < 1) requestAnimationFrame(frame);
    else animating = false;
  }
  function setStage(next) {
    from = stage;
    stage = next;
    animationStart = performance.now();
    animating = true;
    requestAnimationFrame(frame);
  }
  window.addEventListener("lampstage", event => setStage(event.detail));
  requestAnimationFrame(frame);
  hero.classList.add("scene-ready");
} catch (error) {
  hero.classList.add("no-webgl");
  console.warn("3D scene unavailable; static lamp shown", error);
}
