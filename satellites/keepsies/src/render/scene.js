/**
 * The renderer, the lighting, and the CameraRig interface.
 *
 * THE RENDERER OWNS NOTHING. It reads state and draws it. It never writes a
 * body, a rule or a score (HANDOFF-KEEPSIES 5.2): a rule that lives in a
 * renderer will one day disagree with the test that says the rule is fine.
 *
 * ALL CAMERAS LIVE BEHIND CameraRig: `update(dt)`, `getRay(pose)`,
 * `project(x,y,z)`. Orbit, top down, shot cam, inspect and, in K5, XRRig are
 * implementations. Game code never touches a camera, which is the single reason
 * WebXR can be added later without reopening the game (DESIGN 21.2).
 *
 * ⛔ `canvas.width =` CLEARS THE CANVAS. Every resize repaints in the same
 * frame or the player sees a flash of nothing.
 */
import * as THREE from 'three';
import { RoomEnvironment } from '../../lib/environments/RoomEnvironment.js';
import { renderScale } from './quality.js?v=20260905a';

/**
 * @typedef {{update:(dt:number)=>void, getRay:(pose?:object)=>{origin:object,dir:object},
 *   project:(x:number,y:number,z:number)=>{x:number,y:number,visible:boolean},
 *   camera:object, dispose:()=>void}} CameraRig
 */

/**
 * Build the renderer, the scene and the environment.
 * @param {HTMLCanvasElement} canvas
 * @param {object} tuning
 * @param {object} tier from quality.detectQuality
 */
export function createStage(canvas, tuning, tier) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier.name !== 'low', alpha: false });
  renderer.setClearColor(0x1b2029, 1);
  const scene = new THREE.Scene();
  // dusk, and the fog colour MATCHES the sky at the horizon. A fog that fades to
  // a different colour than the thing behind it draws a grey band where the
  // ground ends, which is the void the first K0 shot had.
  scene.fog = new THREE.Fog(0x6a6553, 5.0, 16.0);
  scene.add(makeSky());

  // ⛔ Glass and metal with nothing to reflect render as black soap. A generated
  // room gives them something, and it costs one texture, not a download.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = tuning.render.envIntensity;

  scene.add(new THREE.HemisphereLight(0xdfe6d0, 0x241c15, 0.85));
  const key = new THREE.DirectionalLight(0xfff4dd, 2.0);
  key.position.set(-1.6, 3.0, 1.4);
  if (tier.shadows !== 'off') {
    key.castShadow = true;
    key.shadow.mapSize.set(tier.shadows === 'soft' ? 1024 : 512, tier.shadows === 'soft' ? 1024 : 512);
    key.shadow.camera.left = -2.2; key.shadow.camera.right = 2.2;
    key.shadow.camera.top = 2.2; key.shadow.camera.bottom = -2.2;
    key.shadow.camera.near = 0.4; key.shadow.camera.far = 8;
    key.shadow.bias = -0.0012;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = tier.shadows === 'soft' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd0ff, 0.55);
  rim.position.set(1.8, 1.1, -2.0);
  scene.add(rim);

  const stage = { renderer, scene, key, rim, pmrem, envRT, tuning, tier, width: 0, height: 0 };
  resize(stage);
  return stage;
}

/**
 * Size the drawing buffer to the element. Reads the VISUAL VIEWPORT, never
 * innerHeight: on a phone with the URL bar showing they are different numbers
 * and the difference is a strip of the game under the browser chrome.
 */
/**
 * A sky. One inverted sphere with a vertical gradient painted in the shader:
 * the cheapest possible answer to "is anything visible from under the floor",
 * and the difference between a marble in a place and a marble in a void.
 */
function makeSky() {
  const geo = new THREE.SphereGeometry(60, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x3f4b63) },
      uMid: { value: new THREE.Color(0x6a6553) },
      uLow: { value: new THREE.Color(0x6a6553) }
    },
    vertexShader: 'varying float vH; void main(){ vH = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; varying float vH;'
      + 'void main(){ float h = clamp(vH*0.5+0.5, 0.0, 1.0);'
      + ' vec3 c = mix(uLow, uMid, smoothstep(0.42, 0.500, h));'
      // the fog colour holds for the first few degrees above the horizon, so the
      // dirt fades into the same colour the sky starts with, then dusk takes over
      + ' c = mix(c, uTop, smoothstep(0.53, 0.78, h));'
      // ⛔ a raw ShaderMaterial writes LINEAR values and the renderer encodes
      // nothing for it, so the sky came out a third as bright as the fog it was
      // meant to match and the horizon was a hard step from lit dirt to a dark
      // wall. Encoded by hand here (the colours are linear because colour
      // management converted them on the way in); `#include <colorspace_fragment>`
      // failed to compile in this material and left the sky the clear colour.
      + ' gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0); }'
  });
  const sky = new THREE.Mesh(geo, mat);
  sky.frustumCulled = false;
  return sky;
}

export function resize(stage) {
  const canvas = stage.renderer.domElement;
  const vv = (typeof window !== 'undefined' && window.visualViewport) || null;
  const cssW = canvas.clientWidth || (vv ? vv.width : 375);
  const cssH = canvas.clientHeight || (vv ? vv.height : 667);
  if (cssW === stage.width && cssH === stage.height) return false;
  stage.width = cssW; stage.height = cssH;
  stage.renderer.setPixelRatio(renderScale(stage.tier));
  stage.renderer.setSize(cssW, cssH, false);
  return true;
}

/** Render one frame. */
export function draw(stage, rig) {
  stage.renderer.render(stage.scene, rig.camera);
}

/**
 * The spyglass (core/spyglass.js): a second lens on the SAME scene through the same renderer,
 * drawn into a square of the canvas after the main frame. The scissor keeps the clear inside
 * the square, and the viewport's y counts from the bottom, as WebGL does.
 */
export function drawInset(stage, camera, rect) {
  const r = stage.renderer, H = stage.height;
  const y = H - rect.top - rect.size;
  r.setScissorTest(true);
  r.setViewport(rect.left, y, rect.size, rect.size);
  r.setScissor(rect.left, y, rect.size, rect.size);
  r.render(stage.scene, camera);
  r.setScissorTest(false);
  r.setViewport(0, 0, stage.width, H);
}

/**
 * Draw somebody else's scene through the SAME renderer. A second WebGL context
 * on a phone is a second GPU allocation, and the inspect turntable is one marble.
 */
export function drawScene(stage, scene, camera) {
  stage.renderer.render(scene, camera);
}

/**
 * An orbit camera that always looks at a target, at a fixed elevation and a
 * distance the caller can set. One finger drags the azimuth, pinch changes the
 * distance; `input/cameraCtl.js` owns the gestures, this owns the maths.
 * @returns {CameraRig}
 */
export function createOrbitRig(stage, opts) {
  const o = opts || {};
  /* ⛔ THE FAR PLANE IS PAST THE SKY. The sky is a sphere of radius 60 and the far
     plane was 60, so from anywhere but dead centre the far half of the sky was
     clipped and the renderer's clear colour showed through as a hard edged navy
     polygon above the horizon, which is exactly what k1-lowest.png shows. */
  const cam = new THREE.PerspectiveCamera(o.fov || 42, 1, 0.01, 200);
  const state = {
    target: new THREE.Vector3(o.target ? o.target.x : 0, o.target ? o.target.y : 0, o.target ? o.target.z : 0),
    azimuth: o.azimuth == null ? 0 : o.azimuth,
    elevationDeg: o.elevationDeg == null ? 35 : o.elevationDeg,
    distance: o.distance == null ? 1.4 : o.distance,
    minDistance: o.minDistance == null ? 0.12 : o.minDistance,
    maxDistance: o.maxDistance == null ? 6.0 : o.maxDistance,
    damping: o.damping == null ? 0.18 : o.damping,
    wantAzimuth: o.azimuth == null ? 0 : o.azimuth,
    wantDistance: o.distance == null ? 1.4 : o.distance,
    /* ⛔ The camera never goes under the ground. Shot on purpose from below, the
       world is a black screen: the dirt disc is single sided so nothing leaks
       through it, but there is nothing down there to see and a player who orbits
       under would think the game had broken. A tester can still force it through
       KEEPSIES_DEV.camera(..., {allowUnder:true}), which is how that shot gets
       taken. */
    minElevationDeg: o.minElevationDeg == null ? 3 : o.minElevationDeg,
    maxElevationDeg: o.maxElevationDeg == null ? 86 : o.maxElevationDeg,
    allowUnder: false,
    /* The player's orbit and pinch, as offsets the auto-frame lays on top of its
       own answer. Before these existed cameraCtl wrote wantAzimuth/wantDistance
       directly and frameShot overwrote both every frame, so the designed pinch
       zoom and one-finger orbit (DESIGN 8.5, 7.7) did nothing in a match. */
    userAz: 0,
    userZoom: 1
  };
  const rig = {
    camera: cam,
    state,
    update(dt) {
      const k = 1 - Math.pow(1 - state.damping, Math.max(1, dt * 60));
      state.azimuth += (state.wantAzimuth - state.azimuth) * k;
      state.distance += (state.wantDistance - state.distance) * k;
      if (!state.allowUnder) {
        if (state.elevationDeg < state.minElevationDeg) state.elevationDeg = state.minElevationDeg;
        if (state.elevationDeg > state.maxElevationDeg) state.elevationDeg = state.maxElevationDeg;
      }
      const el = state.elevationDeg * Math.PI / 180;
      const r = state.distance;
      cam.position.set(
        state.target.x + Math.sin(state.azimuth) * Math.cos(el) * r,
        state.target.y + Math.sin(el) * r,
        state.target.z + Math.cos(state.azimuth) * Math.cos(el) * r
      );
      cam.lookAt(state.target);
      const aspect = stage.width / Math.max(1, stage.height);
      if (cam.aspect !== aspect) { cam.aspect = aspect; cam.updateProjectionMatrix(); }
    },
    /** A ray from the camera through a normalised device point, for picking. */
    getRay(pose) {
      const ndc = new THREE.Vector2(pose ? pose.x : 0, pose ? pose.y : 0);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, cam);
      return { origin: ray.ray.origin.clone(), dir: ray.ray.direction.clone() };
    },
    /** World point to CSS pixels, and whether it is in front of the camera. */
    project(x, y, z) {
      const v = new THREE.Vector3(x, y, z).project(cam);
      return {
        x: (v.x * 0.5 + 0.5) * stage.width,
        y: (-v.y * 0.5 + 0.5) * stage.height,
        visible: v.z < 1
      };
    },
    setTarget(x, y, z) { state.target.set(x, y, z); },
    /** Forget the player's orbit and pinch. Called on the turn-change cut. */
    resetUser() { state.userAz = 0; state.userZoom = 1; },
    /** The drawing surface in CSS pixels, so callers can ask if a point is on it. */
    get viewport() { return { w: stage.width, h: stage.height }; },
    dispose() { }
  };
  rig.update(1 / 60);
  return rig;
}

/** Give everything back to the driver. Nothing here holds a reference afterwards. */
export function disposeStage(stage) {
  stage.scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const ms = [].concat(o.material);
      for (const m of ms) {
        for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose();
        m.dispose();
      }
    }
  });
  if (stage.envRT) stage.envRT.dispose();
  if (stage.pmrem) stage.pmrem.dispose();
  stage.renderer.dispose();
}

export { THREE };
