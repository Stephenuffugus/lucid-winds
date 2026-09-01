/* RIPCORD BATTLE 3D — the fight on a tilted camera, riding the same simulation.
 *
 * A beta view, off by default, behind one setting. It draws NOTHING the game
 * does not already know: every position, every spin, every lean comes from the
 * round objects the 2D renderer draws from, on the same frame, so the two views
 * cannot disagree about what happened. Turn it off and the game is byte for byte
 * the game it was.
 *
 * THE FALLBACK LAW, which is the law everywhere else in this file: no picture,
 * no difference. If three.js will not import, if WebGL will not start, if a
 * sculpt will not load — the flag goes up, this module goes quiet, and the 2D
 * game plays exactly as it always did. There is no error screen.
 *
 * UNITS. The simulation is in METRES and every mesh the forge made is in
 * MILLIMETRES, so the only conversion in here is `sim x 1000`. The dish is
 * `arenaR x 1000` and the stadium meshes were built at that same number
 * (tools/forge3d/arena.py), which is why the standard round scales them by
 * exactly 1.0.
 *
 * THE STACK. Part origins are MOUNT FACES (docs/FORGE3D.md): a bit's origin is
 * the top of its shaft, a ratchet's and an assist's is their top face, a blade's
 * is its underside, a core's is its seat. So the assembly is built from the
 * FLOOR UP out of each mesh's own bounding box, and the reference build lands on
 * the nominal seams by itself: bit 0 to 12, ratchet 12 to 18, blade underside at
 * 18, core seated on the blade's top face. A taller ratchet raises the strike
 * plane, which is what the game says a taller ratchet does, and it falls out of
 * the geometry rather than out of a table.
 *
 * THE GROUP ORIGIN IS THE CONTACT POINT. The tip sits at the group's origin, so
 * leaning the group rotates the top about its tip the way a real one leans, and
 * the sim's (x, z) — which is the contact point, not the centre of mass — needs
 * no correction.
 */
(function(){
'use strict';

/* Substituted by tools/bundle.js exactly as it is everywhere else in this file,
   so every mesh URL carries the build and the host edge cache cannot serve a
   stale sculpt. */
var BUILD = '__BUILD__';

/* ── the numbers, and where each of them comes from ──────────────────────── */
var ELEV    = 38 * Math.PI / 180;   // camera elevation above the dish
var FOV     = 32;                   // vertical field of view, degrees
/* Half the view's width at the dish, measured in play radii. The 2D game draws
   the dish at RAD = 0.44 x min(W,H) and lets the painted rail bleed off the
   sides; at 375 wide that is 187.5 over 165 = 1.136. Using its number means the
   dish is the same size on the phone in both views and the toggle changes the
   camera, not the scale of the game. */
var FRAME   = 1.136;
var DROP_MM = 220;                  // how far above the dish a top starts its fall
var DEAD    = 88 * Math.PI / 180;   // a finished top lies over. One pose, no theatre.
var SPIN_K  = 0.12;                 // the 2D game's visual spin rate: o.phase * 0.12

var STADIUM = { pangkah:'chalk_ring', pass:'chalk_ring', field:'chalk_ring',
                uri:'posts', taya:'taya_circle', tujlub:'long_range' };
/* What each stadium mesh was BUILT at, from tools/forge3d/arena.py STADIUMS.
   ⛔ This is not a rescale of the meshes: for every standard round it works out
   at exactly 1.0. It exists for the one boss that fights in a wider dish
   (ladder.json arenaR 0.23), where the rail has to be where the simulation's
   rail is or the picture is lying about the game. */
var STADIUM_R = { chalk_ring:150, posts:150, taya_circle:150, long_range:340 };

var S = {
  lib:null, bootP:null, failed:false, ready:false, active:false,
  renderer:null, scene:null, cam:null, canvas:null, env:null,
  stadium:null, stadiumName:'', arenaR:0.15,
  rimR:210, rimH:75, camDist:1000, floorLUT:null,
  tops:[null,null], topKey:['',''],
  vw:0, vh:0, seq:0, mesh:{}
};

function partUrl(slot,id){
  var hero = (slot === 'core' || slot === 'blade');
  return 'assets/3d/' + (hero ? 'hero/' + slot : slot) + '/' + id + '.glb?v=' + BUILD;
}
function stadiumUrl(name){ return 'assets/3d/stadium/' + name + '.glb?v=' + BUILD; }

/* ── the library, on FIRST USE only ──────────────────────────────────────────
   A player who never turns this on never downloads a byte of three.js. Same
   dynamic import the V3D inspect viewer ships with, same vendored, byte frozen
   files, same absence of a cache buster on them because they are immutable. */
function boot(){
  if (S.lib) return Promise.resolve(S.lib);
  if (S.bootP) return S.bootP;
  S.bootP = Promise.all([import('./assets/3d/lib/three.module.min.js'),
                         import('./assets/3d/lib/loaders/GLTFLoader.js'),
                         import('./assets/3d/lib/environments/RoomEnvironment.js')])
    .then(function(m){
      S.lib = { T:m[0], GLTFLoader:m[1].GLTFLoader, RoomEnvironment:m[2].RoomEnvironment };
      return S.lib;
    });
  return S.bootP;
}

/* One promise per URL, so two tops wearing the same ratchet fetch it once and
   the second round of a match fetches nothing at all. */
function glb(url){
  var e = S.mesh[url];
  if (e) return e;
  e = S.mesh[url] = new Promise(function(res,rej){
    new S.lib.GLTFLoader().load(url, function(g){ res(dress(g.scene)); }, undefined,
                                function(err){ rej(err || new Error('glb ' + url)); });
  });
  return e;
}
/* ⛔ The vendored three is pinned at r161 and `scene.environmentIntensity` does
   not exist until r163, so setting it is a line that reads like a control and is
   not one. On this revision the room's strength is a MATERIAL property, and it
   is set here, once, on the original: every clone shares the material, so both
   tops and every later round inherit it for free. */
function dress(root){
  root.traverse(function(o){
    if (!o.material) return;
    var ms = [].concat(o.material);
    for (var i = 0; i < ms.length; i++)
      if (ms[i] && ms[i].envMapIntensity !== undefined) ms[i].envMapIntensity = 0.55;
  });
  return root;
}

/* ⛔ ASK BEFORE BUILDING. three's renderer writes `THREE.WebGLRenderer: <the
   error>` to the console and THEN throws, and a red line in a player's console is
   a difference. The law here is that a device without WebGL gets the 2D game and
   no evidence that anything was ever attempted. Asked once, cached, only on a
   device where the setting is on, and the throwaway context is handed straight
   back. */
var _hasGL = null;
function hasWebGL(){
  if (_hasGL !== null) return _hasGL;
  try {
    var c = document.createElement('canvas');
    var g = c.getContext('webgl2') || c.getContext('webgl');
    _hasGL = !!g;
    if (g){ var ext = g.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
  } catch (e) { _hasGL = false; }
  return _hasGL;
}

/* ── the renderer, made once ─────────────────────────────────────────────── */
function makeRenderer(){
  if (S.renderer) return;
  if (!hasWebGL()) throw new Error('no WebGL on this device');
  var T = S.lib.T;
  var c = document.createElement('canvas');
  c.id = 'b3d';
  c.setAttribute('aria-hidden','true');
  c.style.display = 'none';

  /* alpha true, and no scene background: outside the stadium the page's own
     packed earth shows through, the way the painted dish's vignette does. */
  /* ⛔ NO MSAA AT dpr 2. A retina phone is already supersampling this canvas, and
     multisampling a full screen 750 by 1334 buffer on top of that multiplies the
     fragment work for a difference nobody can see at that density. It stays on
     for the one density that needs it. */
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  /* ⛔ THE CONTEXT BEFORE THE DOM. On a device with no WebGL this line throws,
     and if the canvas had already been put in the page a failed view would leave
     an element behind in a game that is supposed to be exactly the game it was.
     It goes in only once there is something to draw into it. */
  var r = new T.WebGLRenderer({ canvas:c, antialias:dpr < 1.5, alpha:true });
  r.setPixelRatio(dpr);

  var cv = document.getElementById('cv');
  var host = (cv && cv.parentNode) || document.body;
  /* BEFORE #cv. The 2D canvas clears to transparent every frame and, while this
     view is on, draws no arena and no tops, so it becomes the HUD layer sitting
     over the 3D one. The stylesheet's `#field canvas` rule already gives this
     one the same absolute, full bleed box. */
  host.insertBefore(c, cv);
  S.canvas = c;
  /* EXPOSURE, and it is the whole difference between a stadium and a bathtub.
     This game is packed earth and chalk on a #160F0C page; a physically based
     scene lit by a bright generated room and rendered with no tone curve blows
     every metal surface to white, and the chalk ring came back as a porcelain
     bowl. A film curve at two thirds of a stop under puts the rail back at the
     brightness the painted 2D dish has, and rolls the specular off instead of
     clipping it. Nothing in the assets is touched. */
  r.toneMapping = T.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.70;
  /* ONE contact shadow, which is the same call the 2D renderer makes and for the
     same reason: without it a top is a sticker lying on a photograph of a floor.
     It is the one depth cue this view cannot do without, it costs a depth pass
     over two tops, and the first picture of this scene without it showed exactly
     the sticker. */
  r.shadowMap.enabled = true;
  /* PCF, not PCF SOFT, and a 512 map. Over a 300mm dish that is 0.6mm a texel,
     which is far finer than a contact shadow needs, and the soft variant's extra
     lookups are paid once per fragment of the whole screen. */
  r.shadowMap.type = T.PCFShadowMap;
  S.renderer = r;

  var sc = new T.Scene();
  sc.add(new T.HemisphereLight(0xfff3e2, 0x241c15, 1.15));
  var key = new T.DirectionalLight(0xffffff, 2.1); key.position.set(-600, 900, 600);
  key.castShadow = true;
  key.shadow.mapSize.width = key.shadow.mapSize.height = 512;
  key.shadow.bias = -0.0006;
  sc.add(key); sc.add(key.target);
  S.key = key;
  var rim = new T.DirectionalLight(0xcfe0ff, 0.8); rim.position.set(600, 300, -600);
  sc.add(rim);
  /* ⛔ Bare metal with nothing to reflect renders as grey soap and chrome on a
     black world renders as black rubber. A generated room is the fix, and it is
     the same fix the inspect viewer needed. */
  var pm = new T.PMREMGenerator(r);
  S.env = pm.fromScene(new S.lib.RoomEnvironment(), 0.04).texture;
  sc.environment = S.env;
  S.scene = sc;

  S.cam = new T.PerspectiveCamera(FOV, 1, 1, 4000);
  sc.add(S.cam);
}

/* ── the stadium ─────────────────────────────────────────────────────────── */
function setStadium(mode){
  var name = STADIUM[mode] || 'chalk_ring';
  var scale = (S.arenaR * 1000) / (STADIUM_R[name] || 150);
  if (S.stadium && S.stadiumName === name) { S.stadium.scale.setScalar(scale); return measureRim(); }
  return glb(stadiumUrl(name)).then(function(root){
    if (S.stadium) { S.scene.remove(S.stadium); S.stadium = null; }
    var g = root.clone(true);
    g.scale.setScalar(scale);
    stripStage(g);
    S.scene.add(g);
    S.stadium = g; S.stadiumName = name;
    measureRim();
  });
}
/* ⛔ The stadium glbs carry a SHADOW CATCHER and a DUST CARD (arena.py), which
   are stage furniture for the forge's own renders. In here the catcher is a
   large plane of 2 percent grey, and 2 percent grey under a hemisphere, two
   directionals and a lit room is not black: the first picture of this scene had
   the dish sitting on a flat slab of #3c3c3c that covered the page's packed
   earth to the edges of the phone and made a stadium look like a table. Both
   come out; the dish takes the shadow itself. */
function stripStage(g){
  g.traverse(function(o){
    if (!o.name) return;
    if (o.name.indexOf('shadow_catcher') === 0 || o.name.indexOf('dust_card') === 0)
      o.visible = false;
    else if (o.isMesh) o.receiveShadow = true;
  });
}
function measureRim(){
  var T = S.lib.T;
  var b = new T.Box3().setFromObject(S.stadium);
  S.rimR = Math.max(Math.abs(b.min.x), Math.abs(b.max.x), Math.abs(b.min.z), Math.abs(b.max.z));
  S.rimH = Math.max(1, b.max.y);
  /* the shadow camera is an orthographic box and it has to hold the dish, or the
     shadows are cropped to a square somebody can see the edge of */
  if (S.key){
    var d = S.rimR * 1.15, sh = S.key.shadow.camera;
    S.key.position.set(-0.55, 0.78, 0.45).normalize().multiplyScalar(S.rimR * 4);
    sh.left = -d; sh.right = d; sh.top = d; sh.bottom = -d;
    sh.near = S.rimR; sh.far = S.rimR * 8;
    sh.updateProjectionMatrix();
  }
}

/* The floor is a bowl, not a table: the forge built the dish rising from the
   centre to the ridge crest at 0.72 of the radius. A top parked at the rail with
   its tip at y=0 is a top buried to the waist. So the height is READ OFF THE
   MESH with a fan of rays rather than kept as a second copy of the profile, and
   the lowest hit at each radius is the floor rather than a post standing on it. */
function buildFloorLUT(){
  var T = S.lib.T, ray = new T.Raycaster(), down = new T.Vector3(0,-1,0);
  var N = 48, lut = new Float64Array(N + 1), Rp = S.arenaR * 1000;
  var AZ = 6;
  for (var i = 0; i <= N; i++){
    var r = Rp * (i / N), best = null;
    for (var a = 0; a < AZ; a++){
      var ang = a * Math.PI * 2 / AZ + 0.37;   // off the axes, where the posts stand
      ray.set(new T.Vector3(Math.cos(ang) * r, S.rimH + 400, Math.sin(ang) * r), down);
      var hit = ray.intersectObject(S.stadium, true);
      if (hit.length && (best === null || hit[0].point.y < best)) best = hit[0].point.y;
    }
    lut[i] = best === null ? 0 : best;
  }
  S.floorLUT = lut;
}
function floorY(radMm){
  var lut = S.floorLUT;
  if (!lut) return 0;
  var N = lut.length - 1, Rp = S.arenaR * 1000;
  var u = Math.max(0, Math.min(1, radMm / Rp)) * N;
  var i = Math.floor(u);
  if (i >= N) return lut[N];
  return lut[i] + (lut[i + 1] - lut[i]) * (u - i);
}

/* ── a top, assembled from the floor up ──────────────────────────────────── */
function cfgKey(c){
  return c ? [c.core,c.blade,c.assist,c.ratchet,c.bit].join('|') : '';
}
function setTop(i, cfg){
  if (!cfg) { dropTop(i); return Promise.resolve(); }
  var key = cfgKey(cfg);
  if (S.tops[i] && S.topKey[i] === key) return Promise.resolve();
  var want = [ ['bit',cfg.bit], ['ratchet',cfg.ratchet], ['blade',cfg.blade], ['core',cfg.core] ];
  if (cfg.assist && cfg.assist !== 'none') want.push(['assist', cfg.assist]);
  return Promise.all(want.map(function(w){ return glb(partUrl(w[0], w[1])); }))
    .then(function(parts){
      var T = S.lib.T, got = {};
      for (var k = 0; k < want.length; k++) got[want[k][0]] = parts[k];
      dropTop(i);
      var outer = new T.Group();          // the pose: position and lean, about the tip
      var spin  = new T.Group();          // the top's own turn
      outer.add(spin);

      var bx = function(o){ return new T.Box3().setFromObject(o); };
      var put = function(slot, y){
        if (!got[slot]) return null;
        var m = got[slot].clone(true);
        m.position.set(0, y, 0);
        m.traverse(function(o){ if (o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
        spin.add(m);
        return m;
      };
      var bBit = bx(got.bit), bRat = bx(got.ratchet), bBl = bx(got.blade);
      var yBit = -bBit.min.y;                  // its lowest point is the contact point
      var yRat = (yBit + bBit.max.y) - bRat.min.y;
      var yTop = yRat + bRat.max.y;            // the ratchet's top face: the strike plane
      put('bit', yBit); put('ratchet', yRat);
      put('blade', yTop);                      // its origin IS its underside
      put('assist', yTop);                     // its top face, flush under the blade
      put('core', yTop + bBl.max.y);           // seated on the blade's top face

      S.scene.add(outer);
      S.tops[i] = outer; S.topKey[i] = key;
    });
}
function dropTop(i){
  var g = S.tops[i];
  if (!g) return;
  S.scene.remove(g);
  S.tops[i] = null; S.topKey[i] = '';
}

/* ── the camera ──────────────────────────────────────────────────────────── */
function layoutCamera(){
  var cam = S.cam, w = S.vw || 1, h = S.vh || 1;
  cam.aspect = w / h;
  var vHalf = FOV * Math.PI / 360;
  var hHalf = Math.atan(Math.tan(vHalf) * cam.aspect);
  var Rp = S.arenaR * 1000;
  /* far enough back that the dish reads at the 2D game's size across the width,
     and never so close that the rim and its rail leave the top or the bottom of
     the frame — which is what a landscape phone does to a width only fit. */
  var distH = (FRAME * Rp) / Math.tan(hHalf);
  var distV = (S.rimR * Math.sin(ELEV) + S.rimH * Math.cos(ELEV)) * 1.02 / Math.tan(vHalf);
  S.camDist = Math.max(distH, distV);
  cam.near = Math.max(1, S.camDist * 0.15);
  cam.far  = S.camDist * 3;
  placeCamera(1);
}
function placeCamera(z){
  var d = S.camDist / Math.max(1, z || 1);
  S.cam.position.set(0, d * Math.sin(ELEV), d * Math.cos(ELEV));
  S.cam.lookAt(0, 0, 0);
  S.cam.updateProjectionMatrix();
}
function sized(){
  var c = S.canvas, w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return false;
  if (S.vw !== w || S.vh !== h){
    S.vw = w; S.vh = h;
    S.renderer.setSize(w, h, false);
    layoutCamera();
  }
  return true;
}

/* ── the public surface ──────────────────────────────────────────────────── */
function wanted(){
  try {
    return !!(window.STORE && STORE.load() && STORE.load().settings &&
              STORE.load().settings.battle3d === true);
  } catch (e) { return false; }
}
function ready(){ return !!S.ready; }
function failed(){ return !!S.failed; }
function setActive(v){ S.active = v; if (window.B3D) window.B3D.active = v; }
function show(on){ if (S.canvas) S.canvas.style.display = on ? 'block' : 'none'; }

/* Called once per round, from the launch path. Never from the menu's demo
   battle: that one has A and B set too, and booting WebGL for a backdrop nobody
   asked for is exactly the sort of thing this flag exists to avoid. */
function enter(mode, arenaR, cfgA, cfgB){
  if (!wanted() || S.failed) return;
  var seq = ++S.seq;
  setActive(true);
  boot().then(function(){
    if (seq !== S.seq) return null;
    makeRenderer();
    S.arenaR = arenaR || 0.15;
    S.floorLUT = null;
    return Promise.all([setStadium(mode), setTop(0, cfgA), setTop(1, cfgB)]);
  }).then(function(r){
    if (r === null || seq !== S.seq) return;
    /* visible FIRST: a display:none canvas measures zero, and a camera laid out
       against a zero box is a camera with the wrong aspect for one frame. */
    show(true);
    S.vw = 0; S.vh = 0;
    if (!sized()) layoutCamera();
    buildFloorLUT();
    spawnPose();
    S.ready = true;
  }, function(){
    /* no picture, no difference */
    S.failed = true; S.ready = false; setActive(false); show(false);
  });
}

/* One call per frame from the game's own loop, on the frame the 2D renderer is
   already drawing. There is no second clock in here and no animation of its
   own: everything visible is a function of the state it was handed. */
function sync(st){
  if (!S.ready || !S.active || !st) return;
  if (!sized()) return;
  pose(0, st.A, st);
  pose(1, st.B, st);
  placeCamera(st.camz || 1);
  S.renderer.render(S.scene, S.cam);
}

/* Where the two of them stand before the first frame of the round arrives: the
   game's own spawn marks, plus or minus 0.42 of the dish (see launch(), which
   sets exactly that for uri). Every frame after this is sync's, and it does not
   consult this. */
function spawnPose(){
  for (var i = 0; i < 2; i++){
    var g = S.tops[i];
    if (!g) continue;
    var x = (i ? 1 : -1) * S.arenaR * 0.42 * 1000;
    g.visible = true;
    g.quaternion.identity();
    g.position.set(x, floorY(Math.abs(x)), 0);
    if (g.children[0]) g.children[0].rotation.y = i ? 1.1 : 0;
  }
  if (S.renderer) S.renderer.render(S.scene, S.cam);
}

var _axis = null, _v = null;
function pose(i, o, st){
  var g = S.tops[i];
  if (!g) return;
  if (!o) { g.visible = false; return; }
  g.visible = true;
  var T = S.lib.T;
  if (!_axis) { _axis = new T.Vector3(); _v = new T.Vector3(); }

  var x = o.x * 1000, z = o.z * 1000;
  var y = floorY(Math.sqrt(x * x + z * z));
  if (st.phase === 'drop'){
    var p = st.dropProgress; p = p > 1 ? 1 : (p > 0 ? p : 0);
    y += (1 - p) * DROP_MM;
  }

  var th = Math.sqrt(o.lx * o.lx + o.lz * o.lz);
  var ux = th > 1e-9 ? o.lx / th : 1, uz = th > 1e-9 ? o.lz / th : 0;
  /* The lean vector says WHERE it leans and its magnitude IS the angle in
     radians, so it goes straight in as an Euler angle about the horizontal axis
     perpendicular to it. Small numbers: 0.03 to 0.46. Anything that looks like a
     violent wobble is a scale error, not the physics. */
  _axis.set(uz, 0, -ux);
  if (!o.alive){
    g.quaternion.setFromAxisAngle(_axis, DEAD);
    /* and it RESTS on the floor. Rotated about its tip, most of the blade would
       be under the dish; the lift is measured off the posed mesh once, when it
       goes over, rather than guessed at from a radius. */
    if (g.userData.deadLift === undefined){
      g.position.set(x, 0, z);
      g.updateMatrixWorld(true);
      var b = new T.Box3().setFromObject(g);
      g.userData.deadLift = Math.max(0, -b.min.y);
    }
    y += g.userData.deadLift;
  } else {
    g.userData.deadLift = undefined;
    g.quaternion.setFromAxisAngle(_axis, th);
  }
  g.position.set(x, y, z);

  /* The 2D game turns the picture at phase x 0.12 and this turns the mesh at the
     same rate, so the two views are the same top at the same angle. Canvas
     rotate is clockwise on screen and a positive turn about +Y is not, hence the
     sign. ⛔ phase can be negative and grows all round: it is folded back into
     one turn first. */
  var spin = g.children[0];
  if (spin) spin.rotation.y = -normSpin(o.phase);
}
function normSpin(p){
  var TWO = Math.PI * 2, a = p * SPIN_K;
  return ((a % TWO) + TWO) % TWO;
}

/* Screen pixels for a place on the dish, so the 2D layer can keep a tell or the
   armed glyph over the top it belongs to instead of over where the 2D camera
   would have put it. CSS pixels, which is what the 2D context draws in. */
function project(x, z){
  if (!S.ready || !S.cam || !S.vw) return null;
  var T = S.lib.T;
  if (!_v) { _axis = new T.Vector3(); _v = new T.Vector3(); }
  var mx = x * 1000, mz = z * 1000;
  _v.set(mx, floorY(Math.sqrt(mx * mx + mz * mz)), mz);
  _v.project(S.cam);
  return { x:(_v.x * 0.5 + 0.5) * S.vw, y:(-_v.y * 0.5 + 0.5) * S.vh };
}

/* Leaving a round hides it and stops the render. Leaving the GAME disposes:
   V3D's clear, applied to the tops, the stadium and every sculpt they share.
   The renderer and its context survive, because throwing a WebGL context away
   and building another one is the expensive, fragile half of this. */
function exit(full){
  S.seq++;
  setActive(false);
  show(false);
  /* ⛔ A hide does NOT un-build the scene. The stadium and both tops are still
     standing and still correct, so coming back for the next round of the same
     match is one flag, not a rebuild; only the trip to the menu takes the scene
     down. Clearing `ready` here made the next round draw its first frames in 2D
     while a scene that was already right waited on a promise. */
  if (!full) return;
  S.ready = false;
  dropTop(0); dropTop(1);
  if (S.stadium){ S.scene.remove(S.stadium); S.stadium = null; S.stadiumName = ''; }
  var urls = Object.keys(S.mesh);
  for (var i = 0; i < urls.length; i++)(function(p){
    p.then(function(root){
      root.traverse(function(o){
        if (o.geometry) o.geometry.dispose();
        if (o.material){
          var ms = [].concat(o.material);
          for (var j = 0; j < ms.length; j++){
            for (var k in ms[j]) if (ms[j][k] && ms[j][k].isTexture) ms[j][k].dispose();
            ms[j].dispose();
          }
        }
      });
    }, function(){});
  })(S.mesh[urls[i]]);
  S.mesh = {};
  S.floorLUT = null;
}

window.B3D = { wanted:wanted, ready:ready, failed:failed, active:false,
               enter:enter, sync:sync, project:project, exit:exit };
})();
