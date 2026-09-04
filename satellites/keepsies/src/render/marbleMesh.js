/**
 * What a marble looks like.
 *
 * BUILD THE FAKE FIRST, IT IS THE WORKHORSE (DESIGN 20). Real transmission glass
 * is a High tier luxury for the inspect turntable; every marble in a match, on
 * every device, is this: an environment lit sphere with a fresnel rim, a fake
 * interior read, and a specular glint. It costs one draw call and it holds up at
 * 96 px on a phone, which is the size a marble actually is in play.
 *
 * ⛔ EVERY RECIPE IN DESIGN 10.1 IS HERE, AND THAT WAS NOT TRUE UNTIL THE CONTACT
 * SHEET WAS LOOKED AT. Five modes existed and the catalog asked for twelve, so
 * thirty two of the sixty five marbles rendered as plain coloured spheres with
 * no complaint from anything: swirls with no swirl, corkscrews with no screw,
 * slag with nothing turbulent in it. Nothing measured it because nothing could;
 * a picture of all sixty five, opened, is what caught it.
 */
import * as THREE from 'three';

const VERT = `
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;
void main(){
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/* One shader for every procedural recipe. Branches are on uniforms that never
   change for a given marble, so the driver folds them; one program, many looks,
   and the draw call budget of 24 marbles stays reachable. */
const FRAG = `
precision highp float;
uniform vec3 uCore;
uniform vec3 uSkin;
uniform vec3 uVane;
uniform vec3 uRim;
uniform vec3 uLight;
uniform float uFresnel;
uniform float uGloss;
uniform float uOpacity;
uniform float uVaneCount;
uniform float uVaneWidth;
uniform float uBandScale;
uniform float uMode;
uniform float uSeed;
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;

float hash1(float n){ return fract(sin(n * 43758.5453123) * 43758.5453123); }
float hash3(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash3(i), n100 = hash3(i + vec3(1,0,0));
  float n010 = hash3(i + vec3(0,1,0)), n110 = hash3(i + vec3(1,1,0));
  float n001 = hash3(i + vec3(0,0,1)), n101 = hash3(i + vec3(1,0,1));
  float n011 = hash3(i + vec3(0,1,1)), n111 = hash3(i + vec3(1,1,1));
  return mix(mix(mix(n000,n100,f.x), mix(n010,n110,f.x), f.y),
             mix(mix(n001,n101,f.x), mix(n011,n111,f.x), f.y), f.z);
}
float fbm(vec3 p){
  float a = 0.5, v = 0.0;
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(vV);
  vec3 L = normalize(uLight);
  float ndl = max(dot(N, L), 0.0);

  // P is the point on the marble in ITS OWN frame, so every pattern below turns
  // with the marble instead of being painted on the screen
  vec3 P = normalize(vLocal);
  float depth = 1.0 - abs(dot(P, V));
  vec3 body = mix(uSkin, uCore, depth);
  float metal = 0.0;

  if (uMode < 0.5) {
    // CLAY: matte and grainy, so it never reads as plastic
    float g = hash1(floor(P.x * 90.0) + floor(P.y * 90.0) * 57.0 + floor(P.z * 90.0) * 131.0);
    body *= 0.9 + g * 0.2;
  } else if (uMode < 1.5) {
    // CLEAR GLASS: nothing inside. The edge does all the work.
  } else if (uMode < 2.5) {
    // CAT'S EYE: flat vanes standing in the middle, seen through the glass. A
    // real one is a narrow blade edge on, so the vane is thin and it FADES at
    // the poles rather than wrapping the whole marble.
    float a = atan(P.z, P.x);
    float blade = abs(cos(a * uVaneCount + uSeed * 6.28));
    float vane = pow(blade, 8.0) * smoothstep(0.75, 0.12, abs(P.y));
    body = mix(body, uVane, clamp(vane * 1.15, 0.0, 0.95));
    body = mix(body, uCore * 0.6, smoothstep(0.55, 1.0, abs(P.y)) * 0.5);
  } else if (uMode < 3.5) {
    // STEEL: no interior at all, and a hard sky to floor gradient reflected off
    // the surface. Metal without something to reflect is the black soap problem.
    // ⛔ A hard horizon across the middle read as a SEAM, not a reflection, and
    // it made every steel marble the same marble on the contact sheet. The
    // reflection is now a soft ground to sky blend whose horizon sits where the
    // seed puts it, with a faint smear of the room in it, so a Bearing and a
    // Chrome Dome are two different pieces of metal rather than two greys.
    metal = 1.0;
    float up = N.y * 0.5 + 0.5;
    float horizon = 0.44 + uSeed * 0.16;
    float smear = fbm(reflect(-V, N) * 2.4 + uSeed * 9.0) * 0.5 + 0.5;
    vec3 ground = mix(uCore * 0.35, uCore, smear);
    vec3 sky = mix(uSkin, uRim, smoothstep(0.55, 1.0, up) * (0.4 + 0.6 * smear));
    body = mix(ground, sky, smoothstep(horizon - 0.13, horizon + 0.13, up));
    body += uRim * pow(max(dot(reflect(-L, N), V), 0.0), 60.0) * 0.9;
  } else if (uMode < 4.5) {
    // AGATE BANDS: layers laid down around one axis, uneven the way stone is
    float b = sin((P.y * 1.0 + P.x * 0.35) * uBandScale + uSeed * 6.28 + fbm(P * 2.2) * 1.4);
    body = mix(body, uVane, smoothstep(0.05, 0.9, b) * 0.62);
    body = mix(body, uCore * 0.7, smoothstep(0.55, 1.0, -b) * 0.35);
  } else if (uMode < 5.5) {
    // SWIRL: one ribbon twisted through the middle
    float a = atan(P.z, P.x) + P.y * 3.4 + uSeed * 6.28;
    float ribbon = pow(abs(cos(a)), 6.0) * smoothstep(0.95, 0.15, abs(P.y));
    body = mix(body, uVane, clamp(ribbon * 1.2, 0.0, 0.9));
  } else if (uMode < 6.5) {
    // CORKSCREW: the same idea wound much tighter, several turns of it
    float a = atan(P.z, P.x) * 2.0 + P.y * 11.0 + uSeed * 6.28;
    float w = pow(abs(cos(a)), 3.0) * smoothstep(1.0, 0.25, abs(P.y));
    body = mix(body, uVane, clamp(w * 0.95, 0.0, 0.88));
  } else if (uMode < 7.5) {
    // PATCH: an opaque field over part of the marble, with a soft ragged edge
    vec3 axis = normalize(vec3(sin(uSeed * 6.28), 0.55, cos(uSeed * 6.28)));
    float d = dot(P, axis) + fbm(P * 3.1 + uSeed * 10.0) * 0.45 - 0.2;
    body = mix(body, uVane, smoothstep(0.0, 0.22, d));
  } else if (uMode < 8.5) {
    // SLAG: turbulent, one of a kind, and the reason collectors chase pretty ones
    float t = fbm(P * 2.6 + uSeed * 20.0);
    float t2 = fbm(P * 6.0 - uSeed * 7.0);
    body = mix(body, uVane, smoothstep(0.42, 0.72, t));
    body = mix(body, uCore * 0.55, smoothstep(0.55, 0.85, t2) * 0.6);
  } else if (uMode < 9.5) {
    // ONION LAYERS: concentric shells, seen through each other
    float r = length(vLocal);
    float shell = sin(r * 26.0 + uSeed * 6.28);
    body = mix(body, uVane, smoothstep(0.2, 0.95, shell) * 0.5);
    body = mix(body, uSkin, smoothstep(0.75, 1.0, depth) * 0.35);
  } else if (uMode < 10.5) {
    // LUTZ: bands with metallic flecks caught in them. Real gold? No.
    float b = sin(P.y * uBandScale + uSeed * 6.28);
    body = mix(body, uVane, smoothstep(0.1, 0.85, b) * 0.55);
    float flecks = step(0.86, hash3(floor(P * 34.0)));
    body += uRim * flecks * smoothstep(0.0, 0.6, b) * 0.85;
  } else {
    // CUSTOM: the epics and the grails, until each gets its own. Deep, moving
    // interior plus a glow from within, which is what "that is not paint" means.
    float t = fbm(P * 3.0 + uSeed * 12.0);
    float a = atan(P.z, P.x) + P.y * 2.2 + t * 2.4;
    body = mix(body, uVane, pow(abs(cos(a)), 4.0) * 0.7);
    body += uVane * pow(1.0 - abs(dot(P, V)), 3.0) * 0.35;
    body = mix(body, uCore * 0.4, smoothstep(0.5, 1.0, t) * 0.3);
  }

  float diffuse = 0.30 + 0.70 * ndl;
  vec3 col = body * mix(diffuse, 0.55 + 0.45 * ndl, metal);

  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), uGloss) * (uMode < 0.5 ? 0.25 : 1.0);
  col += vec3(spec);

  if (uMode > 0.5) {
    // What separates glass from painted plastic is not the highlight, it is the
    // EDGE: a dark band where the sphere bends the view away and a bright ring
    // outside it where it turns the light back at you.
    float edge = 1.0 - max(dot(N, V), 0.0);
    float band = smoothstep(0.55, 0.86, edge) * (1.0 - smoothstep(0.90, 0.985, edge));
    col *= 1.0 - band * (metal > 0.5 ? 0.30 : 0.62);
    col += uRim * pow(edge, uFresnel) * (metal > 0.5 ? 0.7 : 1.25);
    float back = pow(max(dot(reflect(-L, N), -V), 0.0), 26.0);
    col += uRim * back * 0.55;
  } else {
    col += uSkin * pow(1.0 - max(dot(N, V), 0.0), uFresnel) * 0.18;
  }

  gl_FragColor = vec4(col, uOpacity);
}`;

const MODES = {
  clay: 0, clearGlass: 1, catsEye: 2, steel: 3, agateBands: 4,
  swirl: 5, corkscrew: 6, patch: 7, slag: 8, onionLayers: 9, lutzSparkle: 10, custom: 11
};

/** A number in 0..1 from a marble uid, so two Commies are not identical. */
function seedOf(uid) {
  let h = 2166136261 >>> 0;
  const s = String(uid || 'seed');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return (h >>> 8) / 16777216;
}

/**
 * The material for one marble.
 * @param {{recipe:string, palette?:string[], vaneCount?:number}} render the catalog's render block
 * @param {object} tuning
 * @param {string} [uid]
 */
export function makeMarbleMaterial(render, tuning, uid) {
  const pal = (render && render.palette) || ['#cfd8d0', '#6f8f7a', '#e8dcc8'];
  const recipe = (render && render.recipe) || 'clearGlass';
  const mode = MODES[recipe] == null ? MODES.clearGlass : MODES[recipe];
  const seed = seedOf(uid);
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: false,
    uniforms: {
      uCore: { value: new THREE.Color(pal[0]) },
      uSkin: { value: new THREE.Color(pal[1] || pal[0]) },
      uVane: { value: new THREE.Color(pal[2] || pal[0]) },
      uRim: { value: new THREE.Color(pal[2] || '#ffffff') },
      uLight: { value: new THREE.Vector3(-1.6, 3.0, 1.4).normalize() },
      uFresnel: { value: tuning.render.fresnelPower },
      uEdgeDark: { value: 0.62 },
      uGloss: { value: recipe === 'clay' ? 12 : (recipe === 'steel' ? 120 : 54) },
      uOpacity: { value: 1 },
      uVaneCount: { value: (render && render.vaneCount) || 3 },
      uVaneWidth: { value: 0.34 },
      uBandScale: { value: 9 },
      uMode: { value: mode },
      uSeed: { value: (render && render.seed != null) ? render.seed : seed }
    }
  });
}

/* One sphere geometry per level of detail, shared by every marble on screen:
   sixty five marbles must not become sixty five geometries. */
const GEO = { high: null, med: null, low: null };
function geometryFor(radius, tier) {
  const key = tier.name === 'high' ? 'high' : (tier.name === 'low' ? 'low' : 'med');
  if (!GEO[key]) {
    const seg = key === 'high' ? 48 : (key === 'low' ? 16 : 28);
    GEO[key] = new THREE.SphereGeometry(1, seg, seg / 2);
  }
  return GEO[key];
}

/**
 * A marble mesh at real scale. The mesh is a unit sphere scaled to the radius,
 * so one geometry serves a 12 mm Peewee and a 35 mm arena marble.
 */
export function makeMarbleMesh(entry, spec, tuning, tier, uid) {
  const mat = makeMarbleMaterial(entry.render, tuning, uid);
  const mesh = new THREE.Mesh(geometryFor(spec.radius, tier), mat);
  mesh.scale.setScalar(spec.radius);
  mesh.castShadow = tier.shadows !== 'off';
  mesh.receiveShadow = false;
  mesh.frustumCulled = true;
  mesh.userData.uid = uid;
  return mesh;
}

/**
 * The contact shadow. A shadow map spanning the whole ring gives a 22 mm marble
 * about four texels of shadow, which is no shadow at all, and the marble floats.
 * This is the fix every marble game uses: a soft dark disc under the body that
 * tightens as it comes down and fades as it leaves the ground.
 */
export function makeContactShadow(radius) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uStrength: { value: 0.55 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    // A hard edged black disc reads as a hole in the ground, not a shadow, which
    // is what the second K0 shot showed. Real contact shadow: dark and tight
    // right under the body, then a long soft falloff, and pushed away from the
    // key light instead of sitting concentric.
    fragmentShader: 'uniform float uStrength; varying vec2 vUv;'
      + 'void main(){ vec2 q = vUv - vec2(0.44, 0.40);'
      + ' float d = length(q) * 2.0;'
      + ' float core = 1.0 - smoothstep(0.0, 0.34, d);'
      + ' float soft = 1.0 - smoothstep(0.10, 1.0, d);'
      + ' float a = (core * 0.55 + soft * 0.45) * uStrength;'
      + ' gl_FragColor = vec4(0.03, 0.025, 0.02, a); }'
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 6.4, radius * 6.4), mat);
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  return m;
}

/**
 * Put a contact shadow where its marble is: flat on the ground, shrinking and
 * fading with height, so a bombed marble loses its shadow on the way up.
 */
export function placeContactShadow(shadow, x, y, z, radius) {
  const lift = Math.max(0, (y - radius) / (radius * 8));
  const k = Math.max(0.15, 1 - lift);
  shadow.position.set(x, 0.0016, z);
  shadow.scale.setScalar(k);
  shadow.material.uniforms.uStrength.value = 0.55 * k * k;
  shadow.visible = k > 0.16;
}

/** Drop the shared geometries. Called only when the whole renderer goes away. */
export function disposeMarbleGeometry() {
  for (const k of Object.keys(GEO)) { if (GEO[k]) { GEO[k].dispose(); GEO[k] = null; } }
}
