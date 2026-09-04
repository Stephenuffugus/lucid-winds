/**
 * What a marble looks like.
 *
 * BUILD THE FAKE FIRST, IT IS THE WORKHORSE (DESIGN 20). Real transmission glass
 * is a High tier luxury for the inspect turntable; every marble in a match, on
 * every device, is this: an environment lit sphere with a fresnel rim, a fake
 * interior read, and a specular glint. It costs one draw call and it holds up at
 * 96 px on a phone, which is the size a marble actually is in play.
 *
 * Recipes are the design's own list (DESIGN 10.1). K0 needs clearGlass; K1 adds
 * clay, catsEye and steel for the cross and the starters. The rest arrive with
 * the catalog in K2.
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
uniform float uMode;       // 0 clay, 1 clearGlass, 2 catsEye, 3 steel, 4 agateBands
uniform float uSeed;
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;

float hash1(float n){ return fract(sin(n * 43758.5453123) * 43758.5453123); }

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(vV);
  vec3 L = normalize(uLight);
  float ndl = max(dot(N, L), 0.0);
  float rim = pow(1.0 - max(dot(N, V), 0.0), uFresnel);

  // the fake interior: how deep through the marble this pixel looks
  vec3 P = normalize(vLocal);
  float depth = 1.0 - abs(dot(P, V));

  vec3 body = mix(uSkin, uCore, depth);

  if (uMode > 1.5 && uMode < 2.5) {
    // cat's eye: flat vanes standing in the middle, seen through the glass
    float a = atan(P.z, P.x);
    float f = abs(sin(a * uVaneCount * 0.5 + uSeed));
    float vane = smoothstep(1.0 - uVaneWidth, 1.0, f) * smoothstep(0.62, 0.18, abs(P.y));
    body = mix(body, uVane, vane * 0.92);
  } else if (uMode > 3.5) {
    // agate bands: layers laid down around one axis
    float b = sin((P.y + P.x * 0.35) * uBandScale + uSeed * 6.28);
    body = mix(body, uVane, smoothstep(0.1, 0.85, b) * 0.55);
  } else if (uMode < 0.5) {
    // clay: matte, and grainy enough that it never reads as plastic
    float g = hash1(floor(P.x * 90.0) + floor(P.y * 90.0) * 57.0 + floor(P.z * 90.0) * 131.0);
    body *= 0.9 + g * 0.2;
  }

  float diffuse = 0.30 + 0.70 * ndl;
  vec3 col = body * diffuse;

  // one hard glint, the thing that says "this is round and it is polished"
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), uGloss) * (uMode < 0.5 ? 0.25 : 1.0);
  col += vec3(spec);

  if (uMode > 0.5) {
    // What actually distinguishes glass from painted plastic is not the
    // highlight, it is the EDGE: a dark band where the sphere bends the view
    // away, and a bright ring outside it where it turns the light back at you.
    // Without both, a fresnel term just tints the silhouette and the marble
    // stays plastic, which is what the first K0 shot showed.
    float edge = 1.0 - max(dot(N, V), 0.0);
    float band = smoothstep(0.55, 0.86, edge) * (1.0 - smoothstep(0.90, 0.985, edge));
    col *= 1.0 - band * 0.62;
    col += uRim * pow(edge, uFresnel) * 1.25;
    // a second glint bounced off the far inside wall, small and offset
    float back = pow(max(dot(reflect(-L, N), -V), 0.0), 26.0);
    col += uRim * back * 0.55;
  } else {
    col += uSkin * rim * 0.18;
  }

  gl_FragColor = vec4(col, uOpacity);
}`;

const MODES = { clay: 0, clearGlass: 1, catsEye: 2, steel: 3, agateBands: 4 };

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
      uGloss: { value: recipe === 'clay' ? 12 : (recipe === 'steel' ? 90 : 54) },
      uOpacity: { value: 1 },
      uVaneCount: { value: (render && render.vaneCount) || 3 },
      uVaneWidth: { value: 0.34 },
      uBandScale: { value: 9 },
      uMode: { value: mode },
      uSeed: { value: seed }
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
