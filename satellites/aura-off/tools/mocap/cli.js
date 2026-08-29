#!/usr/bin/env node
/**
 * AURA OFF — tools/mocap/cli.js
 *
 * The driver for the mocap bridge, and the thing that lets a human SEE whether
 * any of it worked.
 *
 *   node tools/mocap/cli.js fetch <subject> [trial...]   download + cache from CMU
 *   node tools/mocap/cli.js list                         what is cached, with labels
 *   node tools/mocap/cli.js convert <file> [--out f]     TAKE -> proposed move
 *   node tools/mocap/cli.js sheet <file>                 CONTACT SHEET
 *
 * TOOLING ONLY. Nothing here writes into ../../src/. `convert` prints a move or
 * writes it to a scratch file; a human reads it and decides. Nothing appends to
 * moves.js, ever. Zero runtime dependencies — puppeteer is optional and only
 * rasterises the sheet that the SVG already contains.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE ARE TWO RETARGETERS IN THIS TREE
 * ---------------------------------------------------------------------------
 * `retarget.js` is the real one. This file will use it when it exports
 * something usable, and adapts across a handful of plausible export names
 * because it was written in parallel with this driver (see `loadRetargeter`).
 *
 * When it is absent or its shape is unrecognised, the FALLBACK retargeter at
 * the bottom of this file runs instead, so that `sheet` — the deliverable —
 * can never be blocked on another file. The sheet always prints WHICH engine
 * drew it. If it says `builtin`, you are looking at this file's own arithmetic,
 * not at retarget.js.
 * ---------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, 'cache');
const APP = path.resolve(HERE, '..', '..');           /* satellites/aura-off */

const rigUrl = pathToFileURL(path.join(APP, 'src', 'engine', 'rig.js')).href;
const animUrl = pathToFileURL(path.join(APP, 'src', 'engine', 'anim.js')).href;

const rig = await import(rigUrl);
const anim = await import(animUrl);

const { JOINTS, JOINT_RANGE, RIG, figureBuild, figureMarkup, poseTransforms, restPose } = rig;

/* -------------------------------------------------------------------------- */
/* SMALL UTILITIES                                                             */
/* -------------------------------------------------------------------------- */

const R2D = 180 / Math.PI;

function pad2(n) { return String(n).replace(/^0+/, '').padStart(2, '0'); }
function r1(v) { return Math.round(v * 10) / 10; }
function r2(v) { return Math.round(v * 100) / 100; }
function wrap180(d) { let x = (d + 180) % 360; if (x < 0) x += 360; return x - 180; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function median(a) { const s = a.slice().sort((x, y) => x - y); const h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; }
function pct(a, q) { const s = a.slice().sort((x, y) => x - y); return s[clamp(Math.round((s.length - 1) * q), 0, s.length - 1)]; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'); }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function human(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + 'M' : n > 1024 ? Math.round(n / 1024) + 'K' : n + 'B'; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Subject labels, from the CMU index. Only the ones we have a reason to trust. */
const SUBJECT_LABEL = {
  '05': 'modern dance', '06': 'various', '15': 'dance moves', '49': 'modern dance',
  '60': 'salsa', '61': 'salsa', '82': 'emotional walks', '85': 'breakdance',
  '90': 'dances / acrobatics', '93': 'various', '94': 'indian dance'
};

function labelFor(subject) { return SUBJECT_LABEL[pad2(subject)] || 'unlabelled'; }

/** argv -> { _: positionals, flags }. `--k v`, `--k=v`, `--flag`. */
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) { out[a.slice(2, eq)] = a.slice(eq + 1); continue; }
      const k = a.slice(2);
      const nx = argv[i + 1];
      if (nx !== undefined && !nx.startsWith('--')) { out[k] = nx; i++; }
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}

function num(v, dflt) { const n = Number(v); return Number.isFinite(n) ? n : dflt; }

/* -------------------------------------------------------------------------- */
/* FETCH — one file at a time, cached by name, never re-downloaded             */
/* -------------------------------------------------------------------------- */

const CMU = 'http://mocap.cs.cmu.edu/subjects';
const UA = 'aura-off-mocap-bridge/1 (tooling; one file at a time)';

function get(url, redirectsLeft = 4) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get(url, { headers: { 'user-agent': UA } }, res => {
      const code = res.statusCode || 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) return reject(new Error('too many redirects: ' + url));
        return resolve(get(new URL(res.headers.location, url).href, redirectsLeft - 1));
      }
      if (code !== 200) { res.resume(); return reject(new Error('HTTP ' + code + ' for ' + url)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(new Error('timeout: ' + url)); });
  });
}

/**
 * Download one file into the cache unless it is already there.
 * @returns {'cached'|'fetched'}
 */
async function fetchOne(name, url) {
  const dest = path.join(CACHE, name);
  if (exists(dest)) { console.log('  cached   ' + name); return 'cached'; }
  process.stdout.write('  fetching ' + name + ' ... ');
  const buf = await get(url);
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(human(buf.length));
  return 'fetched';
}

async function cmdFetch(args) {
  const subj = args._[0];
  if (!subj) throw new Error('usage: cli.js fetch <subject> [trial...]   e.g. fetch 60 1 2');
  const nn = pad2(subj);
  const trials = args._.slice(1).map(pad2);
  if (!trials.length) trials.push('01');

  console.log('CMU subject ' + nn + '  (' + labelFor(nn) + ')  -> ' + path.relative(APP, CACHE) + '/');
  let fetched = 0;
  if (await fetchOne(nn + '.asf', CMU + '/' + nn + '/' + nn + '.asf') === 'fetched') fetched++;

  for (const tt of trials) {
    /* politeness: one file at a time, a beat between them. Never the 1GB archive. */
    if (fetched) await sleep(1200);
    const f = nn + '_' + tt + '.amc';
    try {
      if (await fetchOne(f, CMU + '/' + nn + '/' + f) === 'fetched') fetched++;
    } catch (e) {
      console.log('FAILED — ' + e.message);
      if (/HTTP 404/.test(e.message)) console.log('    (subject ' + nn + ' may not have a trial ' + tt + ')');
    }
  }
  console.log('\nCredit is not optional: motion from mocap.cs.cmu.edu must be credited');
  console.log('wherever a CMU-derived move ships. CONTRACT.md §1.');
}

/* -------------------------------------------------------------------------- */
/* LIST                                                                        */
/* -------------------------------------------------------------------------- */

/** Cheap AMC frame count: lines that are a bare integer. */
function amcFrames(file) {
  const txt = fs.readFileSync(file, 'utf8');
  let n = 0;
  const re = /^\s*\d+\s*$/gm;
  while (re.exec(txt)) n++;
  return n;
}

/** Cheap BVH frame count: the `Frames:` header line. */
function bvhFrames(file) {
  /* read a head window, not the file — a 2.6MB BVH is mostly numbers, and the
     `Frames:` line is always in the first few KB after the hierarchy. */
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(Math.min(262144, fs.fstatSync(fd).size));
    fs.readSync(fd, buf, 0, buf.length, 0);
    const m = /Frames:\s*(\d+)/i.exec(buf.toString('utf8'));
    return m ? +m[1] : 0;
  } finally { fs.closeSync(fd); }
}

function cmdList() {
  if (!exists(CACHE)) { console.log('nothing cached yet — try: node tools/mocap/cli.js fetch 60 1'); return; }
  const files = fs.readdirSync(CACHE).sort();
  const subjects = new Map();
  const loose = [];

  for (const f of files) {
    const m = /^(\d{2})(?:_(\d+))?\.(asf|amc|bvh)$/i.exec(f);
    if (!m) { if (/\.(bvh|amc)$/i.test(f)) loose.push(f); continue; }
    const nn = m[1];
    if (!subjects.has(nn)) subjects.set(nn, { asf: false, takes: [] });
    const s = subjects.get(nn);
    if (m[3].toLowerCase() === 'asf') s.asf = true;
    else s.takes.push(f);
  }

  if (!subjects.size && !loose.length) { console.log('cache is empty.'); return; }

  console.log('cache: ' + CACHE + '  (gitignored, never committed)\n');
  for (const [nn, s] of [...subjects].sort()) {
    console.log(nn + '  ' + labelFor(nn) + (s.asf ? '' : '   ⚠ NO .asf — amc is unusable without its skeleton'));
    for (const f of s.takes.sort()) {
      const p = path.join(CACHE, f);
      const st = fs.statSync(p);
      const isBvh = /\.bvh$/i.test(f);
      let n = 0;
      try { n = isBvh ? bvhFrames(p) : amcFrames(p); } catch { /* unreadable, report 0 */ }
      const secs = n ? (n / 120).toFixed(1) + 's @120fps' : '?';
      console.log('      ' + f.padEnd(16) + human(st.size).padStart(6) + '  ' +
        String(n).padStart(6) + ' frames  ' + secs);
    }
    if (!s.takes.length) console.log('      (skeleton only — fetch a trial: cli.js fetch ' + nn + ' 1)');
  }
  if (loose.length) {
    console.log('\nother motion files (not CMU-named):');
    for (const f of loose) {
      const p = path.join(CACHE, f);
      let n = 0;
      try { n = /\.bvh$/i.test(f) ? bvhFrames(p) : 0; } catch { /* ignore */ }
      console.log('      ' + f.padEnd(16) + human(fs.statSync(p).size).padStart(6) +
        (n ? '  ' + String(n).padStart(6) + ' frames' : ''));
    }
  }
  console.log('\nconvert one:  node tools/mocap/cli.js convert 60_01');
  console.log('look at one:  node tools/mocap/cli.js sheet 60_01');
}

/* -------------------------------------------------------------------------- */
/* LOADING A TAKE                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Resolve whatever the user typed into a file we can parse.
 *   60_01            -> cache/60_01.amc  (+ cache/60.asf)
 *   60_01.bvh        -> cache/60_01.bvh
 *   /abs/path.amc    -> that file
 */
function resolveMotion(spec) {
  if (!spec) throw new Error('which take? e.g. 60_01');
  const tries = [
    spec,
    path.join(CACHE, spec),
    path.join(CACHE, spec + '.amc'),
    path.join(CACHE, spec + '.bvh')
  ];
  for (const t of tries) if (exists(t) && fs.statSync(t).isFile()) return path.resolve(t);
  throw new Error('no such motion: ' + spec + '\n  looked in ' + CACHE +
    '\n  try:  node tools/mocap/cli.js list');
}

/** file -> TAKE (CONTRACT §2), using whichever parser the extension names. */
async function loadTake(spec, opts = {}) {
  const file = resolveMotion(spec);
  const base = path.basename(file);

  if (/\.bvh$/i.test(file)) {
    const bvh = await import('./bvh.js');
    const fn = bvh.loadBVH || bvh.bvhToTake;
    if (!fn) throw new Error('bvh.js exports neither loadBVH nor bvhToTake');
    const o = { source: 'bvh/' + base.replace(/\.bvh$/i, ''), label: opts.label || 'unlabelled' };
    const take = bvh.loadBVH
      ? await bvh.loadBVH(file, o)
      : bvh.bvhToTake(fs.readFileSync(file, 'utf8'), o);
    return take;
  }

  if (!/\.amc$/i.test(file)) throw new Error('unknown motion format: ' + base + ' (want .amc or .bvh)');
  const m = /^(\d{2})_/.exec(base);
  const asf = m ? path.join(path.dirname(file), m[1] + '.asf') : null;
  if (!asf || !exists(asf)) {
    throw new Error('an .amc is meaningless without its skeleton — expected ' +
      (asf ? path.basename(asf) : '<subject>.asf') + ' next to it.\n' +
      '  fetch it:  node tools/mocap/cli.js fetch ' + (m ? m[1] : 'NN'));
  }
  const asfamc = await import('./asfamc.js');
  return asfamc.takeFromFiles(asf, file, {
    label: opts.label || labelFor(m[1]),
    source: 'cmu/' + base.replace(/\.amc$/i, '')
  });
}

/* -------------------------------------------------------------------------- */
/* FACING                                                                      */
/* -------------------------------------------------------------------------- */

/** Degrees off camera, from the shoulder line's Z extent. 0 = square on. */
function facingOfFrame(p) {
  const l = p.lsho, r = p.rsho;
  if (!l || !r) return 0;
  return wrap180(Math.atan2(l[2] - r[2], l[0] - r[0]) * R2D);
}

/** Per-frame facing for a take: the parser's if it published one, else measured. */
function facingTrace(take) {
  const pub = (take.meta && take.meta.facingDeg) || take.facingDeg;
  if (Array.isArray(pub) && pub.length === take.frames.length) return pub.map(Number);
  return take.frames.map(f => facingOfFrame(f.p));
}

const FACING_LIMIT = 40;

/**
 * The longest run of frames inside the front-facing window, and the window we
 * will actually cut. CONTRACT §4: flag the frames, let the caller trim — do not
 * be clever about turns.
 */
function chooseWindow(take, facing, durMs, startSec) {
  const n = take.frames.length;
  const t = take.frames.map(f => f.t);
  const durS = durMs / 1000;

  let bestA = 0, bestB = -1, a = -1;
  for (let i = 0; i < n; i++) {
    const ok = Math.abs(facing[i]) <= FACING_LIMIT;
    if (ok && a < 0) a = i;
    if ((!ok || i === n - 1) && a >= 0) {
      const b = ok ? i : i - 1;
      if (b - a > bestB - bestA) { bestA = a; bestB = b; }
      a = -1;
    }
  }
  if (bestB < bestA) { bestA = 0; bestB = n - 1; }        /* nothing front-facing at all */

  const runSec = t[bestB] - t[bestA];
  let lo;
  if (startSec != null) {
    lo = 0;
    while (lo < n - 1 && t[lo] < t[0] + startSec) lo++;
  } else {
    /* centre the phrase in the longest front-facing run */
    const mid = (t[bestA] + t[bestB]) / 2;
    lo = bestA;
    while (lo < bestB && t[lo] < mid - durS / 2) lo++;
  }
  let hi = lo;
  while (hi < n - 1 && t[hi] - t[lo] < durS) hi++;
  if (hi - lo < 4) { lo = 0; hi = Math.min(n - 1, Math.max(4, Math.round(durS * (take.fps || 120)))); }

  const win = facing.slice(lo, hi + 1);
  const off = win.filter(v => Math.abs(v) > FACING_LIMIT).length;
  return {
    lo, hi,
    runFrames: bestB - bestA + 1,
    runSec: r2(runSec),
    offAxisFrames: off,
    offAxisPct: r1(100 * off / win.length),
    maxAbs: r1(Math.max(...win.map(Math.abs))),
    meanAbs: r1(win.reduce((s, v) => s + Math.abs(v), 0) / win.length)
  };
}

/* -------------------------------------------------------------------------- */
/* FALLBACK RETARGETER — used only when retarget.js cannot be used             */
/* -------------------------------------------------------------------------- */
/*
 * CONTRACT §4, done the short way. Everything is derived from PROJECTED XY bone
 * vectors, never from source Euler angles.
 *
 * THE ONE DECISION THAT DECIDES WHETHER OUTPUT IS MIRRORED
 * The TAKE's +X is the subject's LEFT as the camera sees it, i.e. SCREEN RIGHT.
 * The rig's `sL`/`hL` groups are drawn at NEGATIVE x — screen LEFT. So the
 * subject's left arm drives the rig's *R* joints. That is not a bug and not a
 * mirror: both names are screen-side names, and they point at opposite screen
 * sides. `--nomirror` swaps it so a human can put the two sheets side by side
 * and settle it by looking, which is the only way this ever gets settled.
 */

/** Screen-space delta between two canonical points: +x right, +y DOWN. */
function sv(a, b) { return [b[0] - a[0], -(b[1] - a[1])]; }

/** Clockwise degrees from straight DOWN — the rest direction of every limb bone. */
function angDown(v) { return Math.atan2(-v[0], v[1]) * R2D; }

/** Clockwise degrees from straight UP — the rest direction of the torso. */
function angUp(v) { return Math.atan2(v[0], -v[1]) * R2D; }

function retargetBuiltin(take, win, o = {}) {
  const F = take.frames.slice(win.lo, win.hi + 1);
  const mirror = o.nomirror ? false : true;

  /* scale: the take's own legs against this rig's legs. Never assume cm. */
  const legSrc = median(F.map(f => {
    const th = Math.hypot(...[0, 1, 2].map(i => f.p.lkne[i] - f.p.lhip[i]));
    const sh = Math.hypot(...[0, 1, 2].map(i => f.p.lank[i] - f.p.lkne[i]));
    return th + sh;
  }));
  const build = o.build;
  const legRig = build.thigh + build.shin;
  const scale = legSrc > 1e-6 ? legRig / legSrc : 1;

  /* standing baseline for bob: the take's own high-hip percentile, not frame 0,
     which may already be a crouch. */
  const rootY = F.map(f => f.p.root[1]);
  const baseY = pct(rootY, 0.85);

  /* The rig's REST DIRECTIONS are not all straight down. `figureMarkup` wraps
     every arm in a static `hang` and every leg in a static `stance`, outside
     the joint group — so a rig at all-zeros already stands with its legs
     splayed and its arms clear of its ribs. Measuring a source bone against
     plain vertical therefore reports the splay as joint motion: on the first
     pass every knee sat pinned at its +10 limit for 80% of the window purely
     because a thigh leans out and a shin does not. Rest goes to rest. */
  const armStatic = { L: +build.hang, R: -build.hang };   /* tilt(-dir*hang), dir L=-1 */
  const legStatic = { L: +build.stance, R: -build.stance };

  const poses = F.map(f => {
    const p = f.p;
    const lean = angUp(sv(p.root, p.neck));
    const headA = wrap180(angUp(sv(p.neck, p.head)) - lean);

    const upA = angDown(sv(p.lsho, p.lelb));            /* subject LEFT arm  */
    const foA = angDown(sv(p.lelb, p.lwri));
    const upB = angDown(sv(p.rsho, p.relb));            /* subject RIGHT arm */
    const foB = angDown(sv(p.relb, p.rwri));
    const hpA = angDown(sv(p.lhip, p.lkne));
    const knA = angDown(sv(p.lkne, p.lank));
    const hpB = angDown(sv(p.rhip, p.rkne));
    const knB = angDown(sv(p.rkne, p.rank));

    const A = { s: upA, e: wrap180(foA - upA), h: hpA, k: wrap180(knA - hpA) };   /* subject left  */
    const B = { s: upB, e: wrap180(foB - upB), h: hpB, k: wrap180(knB - hpB) };   /* subject right */
    const screenR = mirror ? A : B;      /* subject-left renders on screen RIGHT */
    const screenL = mirror ? B : A;

    return {
      t: f.t,
      pose: {
        rot: 0,                                   /* §4: rot is a FALL, never a turn */
        bob: (baseY - p.root[1]) * scale,
        lean, head: headA,
        /* shoulders live inside the torso, so they are measured relative to it */
        sL: wrap180(screenL.s - build.poise - lean - armStatic.L),
        eL: screenL.e,
        sR: wrap180(screenR.s - build.poise - lean - armStatic.R),
        eR: screenR.e,
        hL: wrap180(screenL.h - legStatic.L), kL: screenL.k,
        hR: wrap180(screenR.h - legStatic.R), kR: screenR.k
      }
    };
  });

  /* TEMPORAL UNWRAP. A projected elbow whose forearm swings through the
     straight-arm configuration flips its signed included angle by a full turn.
     Left alone that is a 300° step between two adjacent frames, and it poisons
     everything downstream: RDP has to spend a knot on it, the tolerance search
     climbs to absurd values to keep the knot count legal, and the clamp table
     reports 27% of frames outside range on an elbow that never actually moved
     that far. Unwrap first; THEN clamp, so the clamp number means what it says. */
  /* ELBOWS ARE A HINGE, so the fallback treats them as one: e = -|included|.
     The signed projected angle is the truer measurement, but it passes through
     the straight-arm singularity every time a forearm swings past its upper
     arm, and each crossing flips the sign by a full turn. Unwrapped, a salsa
     elbow accumulated 324° of overshoot on a joint whose real travel is under
     150°. The rig only hinges one way anyway (range -150…30), so the magnitude
     is the part that can be represented. retarget.js exposes the same choice as
     --elbow hinge and it is worth 3× on the residual there too. */
  for (const p of poses) { p.pose.eL = -Math.abs(p.pose.eL); p.pose.eR = -Math.abs(p.pose.eR); }

  for (const j of JOINTS) {
    if (j === 'bob' || j === 'eL' || j === 'eR') continue;
    for (let i = 1; i < poses.length; i++) {
      const prev = poses[i - 1].pose[j];
      let v = poses[i].pose[j];
      while (v - prev > 180) v -= 360;
      while (v - prev < -180) v += 360;
      poses[i].pose[j] = v;
    }
    /* Unwrapping picks a continuous branch but not necessarily the RIGHT one:
       a track can end up a whole turn away from its range and then read as a
       324° overshoot on a joint that never moved that far. Slide the whole
       track by whole turns until its median sits closest to the middle of its
       legal range. Shape is preserved; only the branch changes. */
    const rng = JOINT_RANGE[j], mid = (rng[0] + rng[1]) / 2;
    const med = median(poses.map(p => p.pose[j]));
    const k = Math.round((med - mid) / 360);
    if (k) for (let i = 0; i < poses.length; i++) poses[i].pose[j] -= k * 360;
  }

  return { poses, scale: r2(scale), mirror, engine: 'builtin' };
}

/* -------------------------------------------------------------------------- */
/* CLAMP — a measurement, not a silent fix (CONTRACT §3)                       */
/* -------------------------------------------------------------------------- */

function clampReport(poses) {
  const out = {};
  for (const j of JOINTS) {
    const [lo, hi] = JOINT_RANGE[j];
    let n = 0, worst = 0;
    for (const p of poses) {
      const v = p.pose[j];
      if (v < lo) { n++; worst = Math.max(worst, lo - v); }
      else if (v > hi) { n++; worst = Math.max(worst, v - hi); }
    }
    out[j] = { pct: r1(100 * n / poses.length), worstDeg: r1(worst) };
  }
  return out;
}

function applyClamp(poses) {
  return poses.map(p => {
    const q = {};
    for (const j of JOINTS) q[j] = clamp(p.pose[j], JOINT_RANGE[j][0], JOINT_RANGE[j][1]);
    return { t: p.t, pose: q };
  });
}

/* -------------------------------------------------------------------------- */
/* REDUCTION — 120fps to 4..7 keyframes (CONTRACT §5)                          */
/* -------------------------------------------------------------------------- */

/** Ramer–Douglas–Peucker over the 12-joint vector; error = worst joint, degrees. */
function rdp(poses, tolDeg) {
  const n = poses.length;
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const ta = poses[a].t, tb = poses[b].t;
    let worst = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const k = tb > ta ? (poses[i].t - ta) / (tb - ta) : 0;
      let d = 0;
      for (const j of JOINTS) {
        const lin = poses[a].pose[j] + (poses[b].pose[j] - poses[a].pose[j]) * k;
        const e = Math.abs(poses[i].pose[j] - lin);
        if (e > d) d = e;
      }
      if (d > worst) { worst = d; at = i; }
    }
    if (worst > tolDeg) { keep[at] = 1; stack.push([a, at], [at, b]); }
  }
  const idx = [];
  for (let i = 0; i < n; i++) if (keep[i]) idx.push(i);
  return idx;
}

/** Search a tolerance that lands the knot count in [minK, maxK]. */
function reduceToFrames(poses, minK, maxK, startTol) {
  let tol = startTol, idx = rdp(poses, tol), guard = 0;
  while (idx.length > maxK && guard++ < 60) { tol *= 1.35; idx = rdp(poses, tol); }
  while (idx.length < minK && tol > 0.05 && guard++ < 120) { tol /= 1.35; idx = rdp(poses, tol); }
  if (idx.length > maxK) idx = idx.filter((_, i) => i === 0 || i === idx.length - 1 || i % Math.ceil(idx.length / maxK) === 0);
  return { idx, tol: r2(tol) };
}

/** Knot indices -> a move object in `moves.js` shape. A joint under `eps` is omitted. */
function buildMove(poses, idx, meta) {
  const t0 = poses[0].t, t1 = poses[poses.length - 1].t;
  const span = t1 - t0 || 1;
  const eps = 0.5;
  const frames = idx.map((i, k) => {
    const f = { t: k === 0 ? 0 : k === idx.length - 1 ? 1 : +(((poses[i].t - t0) / span)).toFixed(3) };
    for (const j of JOINTS) {
      const v = poses[i].pose[j];
      if (Math.abs(v) >= eps) f[j] = r1(v);        /* omitted IS zero — rig.js rest rule */
    }
    return f;
  });
  /* strictly increasing */
  for (let i = 1; i < frames.length; i++) if (frames[i].t <= frames[i - 1].t) frames[i].t = +(frames[i - 1].t + 0.001).toFixed(3);
  frames[frames.length - 1].t = 1;
  return Object.assign({
    id: meta.id, name: meta.name, dur: meta.dur, frames
  });
}

/**
 * Residual after reduction, measured THROUGH anim.sample — i.e. through the
 * smoothstep easing the game will actually apply, not through the linear fit
 * RDP used to pick the knots. This is the number that says whether the move
 * still looks like the take. CONTRACT §5.
 */
function residual(poses, move) {
  const t0 = poses[0].t, span = (poses[poses.length - 1].t - t0) || 1;
  const per = {};
  for (const j of JOINTS) per[j] = { max: 0, sse: 0 };
  const out = restPose();
  for (const p of poses) {
    anim.sampleInto(move, (p.t - t0) / span, 1, out);
    for (const j of JOINTS) {
      const e = Math.abs(out[j] - p.pose[j]);
      if (e > per[j].max) per[j].max = e;
      per[j].sse += e * e;
    }
  }
  let worstJ = JOINTS[0], worst = 0, sse = 0;
  for (const j of JOINTS) {
    per[j].rms = r1(Math.sqrt(per[j].sse / poses.length));
    per[j].max = r1(per[j].max);
    sse += per[j].sse;
    if (per[j].max > worst) { worst = per[j].max; worstJ = j; }
  }
  return { per, worstJoint: worstJ, worstDeg: r1(worst), rmsDeg: r1(Math.sqrt(sse / (poses.length * JOINTS.length))) };
}

/* -------------------------------------------------------------------------- */
/* THE REAL RETARGETER, IF IT IS THERE                                         */
/* -------------------------------------------------------------------------- */

/**
 * `retarget.js` is written in parallel with this file, so the driver probes for
 * it rather than assuming a name. Any of these shapes is accepted:
 *   fn(take, opts) -> { poses:[{t,pose}] }              (preferred)
 *   fn(take, opts) -> [{t, ...twelve joints}]
 *   fn(take, opts) -> { move:{frames}, ... } / { frames }
 * Anything else falls through to the builtin, loudly.
 */
async function loadRetargeter(want) {
  if (want === 'builtin') return null;
  let mod;
  try { mod = await import('./retarget.js'); }
  catch (e) {
    if (want === 'retarget') throw new Error('--engine retarget, but ./retarget.js will not import:\n  ' + e.message);
    return null;
  }
  const names = ['retarget', 'retargetTake', 'takeToPoses', 'toPoses', 'takeToMove',
    'toMove', 'convert', 'retargetToMove', 'buildMove', 'default'];
  for (const n of names) if (typeof mod[n] === 'function') return { fn: mod[n], name: n, mod };
  if (want === 'retarget') throw new Error('retarget.js exports no recognised entry point; saw: ' + Object.keys(mod).join(', '));
  return null;
}

/** Normalise whatever the real retargeter returned into `[{t, pose}]`. */
function adaptPoses(res, fallbackTimes) {
  const cand = Array.isArray(res) ? res
    : res && Array.isArray(res.poses) ? res.poses
      : res && Array.isArray(res.frames) ? res.frames
        : res && res.move && Array.isArray(res.move.frames) ? res.move.frames
          : null;
  if (!cand || !cand.length) return null;
  return cand.map((row, i) => {
    const src = row.pose || row;
    const pose = {};
    let seen = 0;
    for (const j of JOINTS) {
      const v = src[j];
      if (typeof v === 'number' && isFinite(v)) { pose[j] = v; seen++; } else pose[j] = 0;
    }
    if (!seen) return null;
    const t = typeof row.t === 'number' ? row.t : (fallbackTimes[i] ?? i);
    return { t, pose };
  }).filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* THE PIPELINE — one path, shared by `convert` and `sheet`                     */
/* -------------------------------------------------------------------------- */
/*
 * Everything downstream reads ONE normalised shape, whichever engine produced
 * it:
 *
 *   { take, facing[], from, to, dense[], move, clamp{}, resid{},
 *     verdict, reasons[], reportLines[], moveText, engineName }
 *
 * `dense` is the clamped retargeted pose for every frame of the phrase, so the
 * sheet can draw the pre-reduction pose as a ghost. `from`/`to` index into
 * `take.frames`, so the SOURCE panel and the RIG panel are guaranteed to be
 * showing the same instant — which is the entire point of the sheet.
 */

function rtOpts(args) {
  return {
    id: args.id, name: args.name, cat: args.cat,
    sides: args.sides, rot: args.rot, elbow: args.elbow, bob: args.bob,
    pick: args.pick,
    phrase: args.phrase ? String(args.phrase).split(',').map(Number) : null,
    tol: args.tol != null ? Number(args.tol) : undefined,
    maxKnots: args.max != null ? Number(args.max) : undefined,
    smoothMs: args.smooth != null ? Number(args.smooth) : undefined,
    upperOnly: !!args['upper-only'] || !!args.upperOnly
  };
}

async function pipeline(spec, args) {
  const take = await loadTake(spec, { label: args.label });
  const build = figureBuild(args.seed || 'mocap');
  const rt = await loadRetargeter(args.engine);

  /* ---- the real retargeter ------------------------------------------- */
  if (rt && rt.mod.takeToMove) {
    const res = rt.mod.takeToMove(take, rtOpts(args));
    const facing = Array.from(res.track.facing);
    const lines = (rt.mod.formatReport ? rt.mod.formatReport(res) : '').split('\n');

    if (!res.ok) {
      return {
        take, build, facing, ok: false, verdict: res.verdict, reasons: res.reasons,
        reportLines: lines, engineName: 'retarget.js', res
      };
    }

    const dense = rt.mod.clampTrack
      ? rt.mod.clampTrack(res.track, res.phrase.from, res.phrase.to)
      : null;
    const clamp_ = {};
    for (const j of JOINTS) clamp_[j] = { pct: res.stats[j].pctClamped, worstDeg: res.stats[j].maxOvershoot };
    const resid = { per: res.reduction.residual, worstJoint: res.reduction.worstJoint, worstDeg: res.reduction.worst };
    /* which rig side the subject's LEFT drives — retarget publishes the map */
    const sides = res.ctx.sides || { L: 'r', R: 'l' };
    const srcLeftRigSide = sides.L === 'l' ? 'L' : 'R';

    return {
      take, build, facing, ok: true, verdict: res.verdict, reasons: res.reasons,
      warnings: res.warnings, from: res.phrase.from, to: res.phrase.to, dense,
      move: res.move, dur: res.move.dur, clamp: clamp_, resid,
      reportLines: lines,
      moveText: rt.mod.formatMove ? rt.mod.formatMove(res) : JSON.stringify(res.move, null, 2),
      engineName: 'retarget.js (' + res.ctx.sideKey + ' sides, elbow=' + res.ctx.elbowMode +
        ', rot=' + res.ctx.rotMode + ', bob=' + res.ctx.bobMode + ')',
      srcLeftRigSide, res, spec
    };
  }

  /* ---- fallback ------------------------------------------------------- */
  const note = args.engine === 'builtin'
    ? 'builtin fallback requested with --engine builtin'
    : 'retarget.js is absent or exports nothing this driver recognises — BUILTIN FALLBACK. ' +
      'These numbers are cli.js\'s own arithmetic, not the real retargeter.';
  const facing = facingTrace(take);
  const dur = Math.round(clamp(num(args.dur, 1800), 1400, 2200));
  const win = chooseWindow(take, facing, dur, args.start != null ? num(args.start, 0) : null);
  const bi = retargetBuiltin(take, win, { build, nomirror: args.nomirror });
  const clamp_ = clampReport(bi.poses);
  const clamped = applyClamp(bi.poses);
  const red = reduceToFrames(clamped, num(args.min, 4), num(args.max, 7), num(args.tol, 1.5));
  const move = buildMove(clamped, red.idx, {});
  move.id = args.id || ('mocap_' + String(take.source).replace(/[^\w]+/g, '_'));
  move.name = args.name || String(take.label || 'untitled').toUpperCase();
  move.dur = dur;
  move.provenance = take.source;
  const resid = residual(clamped, move);

  /* The verdict has to read the clamp table, not just the facing. An earlier
     revision flagged only on off-axis frames and printed a confident OK over a
     sheet whose knees were on the range wall for a quarter of the phrase. Same
     25% threshold retarget.js uses, so the two engines agree on what "flagged"
     means. */
  const heavy = JOINTS.filter(j => clamp_[j].pct >= 25);
  const reasons = [];
  if (heavy.length) reasons.push('CLAMPED: ' + heavy.map(j => j + ' ' + clamp_[j].pct + '%').join(', ') +
    ' — flattened onto the range wall, not converted.');
  if (win.offAxisPct >= 25) reasons.push('OFF-AXIS: ' + win.offAxisPct + '% of the phrase is past ±' +
    FACING_LIMIT + '° of camera.');

  const R = {
    take, build, facing, ok: true,
    verdict: (heavy.length || win.offAxisPct >= 25) ? 'FLAGGED' : 'OK',
    reasons, warnings: [note],
    from: win.lo, to: win.hi, dense: clamped.map(p => p.pose),
    move, dur, clamp: clamp_, resid, win, red,
    engineName: 'builtin (fallback)', engineNote: note,
    srcLeftRigSide: bi.mirror ? 'R' : 'L', spec
  };
  R.reportLines = builtinReport(R);
  R.moveText = moveSource(R);
  return R;
}

/* -------------------------------------------------------------------------- */
/* THE THREE NUMBERS — clamp, facing, residual (fallback formatting only)      */
/* -------------------------------------------------------------------------- */

function sparkline(vals, lo, hi) {
  const ch = '▁▂▃▄▅▆▇█';
  return vals.map(v => ch[clamp(Math.round((clamp(v, lo, hi) - lo) / (hi - lo) * 7), 0, 7)]).join('');
}

function builtinReport(R) {
  const L = [];
  const W = R.win;
  L.push('SOURCE    ' + R.take.source + '   "' + (R.take.label || '?') + '"   ' +
    R.take.frames.length + ' frames @ ' + R.take.fps + 'fps   units ' + R.take.units);
  L.push('ENGINE    ' + R.engineName + '   ⚠ ' + R.engineNote);
  L.push('PHRASE    frames ' + R.from + '..' + R.to + '  (' +
    r2(R.take.frames[R.to].t - R.take.frames[R.from].t) + 's of source, dur ' + R.dur + 'ms)');
  L.push('');
  L.push('CLAMP  (fraction of phrase frames outside JOINT_RANGE — CONTRACT §3)');
  const rows = JOINTS.map(j => [j, R.clamp[j]]).filter(([, c]) => c.pct > 0).sort((a, b) => b[1].pct - a[1].pct);
  if (!rows.length) L.push('   nothing clamped.');
  for (const [j, c] of rows) {
    L.push('   ' + j.padEnd(5) + String(c.pct).padStart(5) + '%  worst ' + String(c.worstDeg).padStart(6) + '°  ' +
      ('█'.repeat(Math.round(c.pct / 4))) + (c.pct >= 25 ? '  ⛔ FLATTENED' : c.pct >= 8 ? '  ⚠' : ''));
  }
  L.push('');
  L.push('FACING (degrees off camera; past ±' + FACING_LIMIT + '° the front projection means nothing)');
  const trace = R.facing.slice(R.from, R.to + 1);
  const step = Math.max(1, Math.floor(trace.length / 60));
  L.push('   phrase  ' + sparkline(trace.filter((_, i) => i % step === 0), -90, 90));
  L.push('   mean |' + W.meanAbs + '°|  max |' + W.maxAbs + '°|  off-axis ' + W.offAxisPct +
    '% of phrase   longest front-facing run ' + W.runFrames + ' frames (' + W.runSec + 's)');
  if (W.offAxisPct >= 25) L.push('   ⛔ REJECT-GRADE: a quarter of this phrase is turned away from camera.');
  L.push('');
  L.push('RESIDUAL after reduction to ' + R.move.frames.length + ' keyframes (RDP tol ' + R.red.tol + '°)');
  L.push('   worst ' + R.resid.worstDeg + '° on ' + R.resid.worstJoint + '   rms ' + R.resid.rmsDeg +
    '°  — through anim.sample(), i.e. the game\'s own easing');
  L.push('   ' + JOINTS.map(j => j + ' ' + R.resid.per[j].max + '°').join('   '));
  L.push('');
  L.push('VERDICT   ' + R.verdict);
  for (const r of R.reasons) L.push('  ! ' + r);
  for (const w of R.warnings) L.push('  ⚠ ' + w);
  return L;
}

/** Fallback move printer. `retarget.js:formatMove` is preferred when present. */
function moveSource(R) {
  const m = R.move;
  const L = [];
  L.push('/* PROPOSED — a human reviews this before it goes near moves.js.');
  L.push(' * Retargeted from ' + m.provenance + ' by the cli.js BUILTIN FALLBACK.');
  L.push(' * CMU Graphics Lab Motion Capture Database — mocap.cs.cmu.edu — credit');
  L.push(' * required wherever this motion ships. CONTRACT.md §1. */');
  L.push('{');
  L.push("  id: '" + m.id + "',  name: '" + m.name + "',  dur: " + m.dur + ',');
  L.push('  frames: [');
  for (const f of m.frames) {
    const parts = ['t: ' + f.t];
    for (const j of JOINTS) if (f[j] !== undefined) parts.push(j + ': ' + f[j]);
    L.push('    { ' + parts.join(', ') + ' },');
  }
  L.push('  ]');
  L.push('}');
  return L.join('\n');
}

async function cmdConvert(args) {
  const R = await pipeline(args._[0], args);
  console.log(R.reportLines.join('\n'));
  if (!R.ok) {
    console.log('\nREJECTED — nothing was emitted. That is the correct outcome for a take that');
    console.log('turns away from camera; a front-projected turn is limbs collapsing to nothing.');
    console.log('Options:  --phrase a,b (seconds)   --pick motion   or pick another trial.');
    process.exitCode = 2;
    return;
  }
  console.log('');
  console.log('PROPOSED MOVE — output for a human, never appended to moves.js by this tool:');
  console.log('');
  console.log(R.moveText);
  if (args.out) {
    const p = path.resolve(String(args.out));
    fs.writeFileSync(p, R.moveText + '\n');
    console.log('\nwritten to ' + p);
  }
  console.log('\nLOOK AT IT:  node tools/mocap/cli.js sheet ' + args._[0]);
  if (R.verdict === 'FLAGGED') process.exitCode = 1;
}

/* -------------------------------------------------------------------------- */
/* CONTACT SHEET — the deliverable                                             */
/* -------------------------------------------------------------------------- */
/*
 * Two rows per column, same instant in both.
 *
 *   TOP     the SOURCE: the TAKE's fifteen canonical points with Z dropped.
 *           Literally what the front projection sees, before anything is
 *           fitted to anything.
 *   BOTTOM  the REAL RIG: `figureMarkup()` out of src/engine/rig.js, posed by
 *           `anim.sample()` on the reduced move — so what is on the sheet is
 *           what will play in the game, easing included — with the dense
 *           pre-reduction pose behind it as a ghost, so the cost of dropping
 *           120fps to five keyframes is visible instead of argued about.
 *
 * The coloured wrist dots are the mirror test. The subject's LEFT hand is blue
 * in BOTH rows. If the blue dots sit on opposite sides of the two panels, the
 * retarget is mirrored — and a mirrored dance still looks like dancing, which
 * is exactly why it needs a dot and not an opinion.
 */

const C = {
  bg: '#0C0A14', panel: '#15122099', line: '#2B2340', ink: '#E8E2F2', dim: '#8B82A6',
  src: '#6FD9CC', ghost: '#4A3E6B', rigc: '#FF9E64', warn: '#F2C14E', bad: '#F2555A',
  left: '#59B8FF', right: '#FF6FA5'
};

const SRC_BONES = [
  ['root', 'neck'], ['neck', 'head'], ['lsho', 'rsho'], ['lhip', 'rhip'],
  ['root', 'lhip'], ['root', 'rhip'], ['neck', 'lsho'], ['neck', 'rsho'],
  ['lsho', 'lelb'], ['lelb', 'lwri'], ['rsho', 'relb'], ['relb', 'rwri'],
  ['lhip', 'lkne'], ['lkne', 'lank'], ['rhip', 'rkne'], ['rkne', 'rank']
];

/** Rotate (0, L) clockwise by `deg` in SVG screen space. */
function limb(deg, L) { const a = deg / R2D; return [-L * Math.sin(a), L * Math.cos(a)]; }
function add(p, d) { return [p[0] + d[0], p[1] + d[1]]; }
function rotAbout(p, deg, cx, cy) {
  const a = deg / R2D, c = Math.cos(a), s = Math.sin(a), x = p[0] - cx, y = p[1] - cy;
  return [cx + c * x - s * y, cy + s * x + c * y];
}

/**
 * Where the rig's hands and feet actually END UP for a pose. Mirrors the group
 * nesting in `rig.js:figureMarkup` exactly — static wrappers included, because
 * a build's `hang` and `stance` are part of where a limb points even though
 * they are not part of the pose. Used only to place the wrist dots.
 */
function rigFK(b, pose) {
  const O = [b.hipX, b.hipY + (pose.bob || 0)];
  const phi = b.poise + (pose.lean || 0);
  const out = {};
  for (const side of ['L', 'R']) {
    const dir = side === 'L' ? -1 : 1;
    const sh = rotAbout(add(O, [dir * b.shoulderX, b.shoulderY]), phi, O[0], O[1]);
    const th = phi + (-dir * b.hang) + (pose['s' + side] || 0);
    const el = add(sh, limb(th, b.upperArm));
    out['wri' + side] = add(el, limb(th + (pose['e' + side] || 0), b.foreArm));
    const hipA = add(O, [dir * b.legX, 0]);
    const tl = (-dir * b.stance) + (pose['h' + side] || 0);
    const kn = add(hipA, limb(tl, b.thigh));
    out['ank' + side] = add(kn, limb(tl + (pose['k' + side] || 0), b.shin));
  }
  if (pose.rot) for (const k of Object.keys(out)) out[k] = rotAbout(out[k], pose.rot, b.groundX, b.groundY);
  return out;
}

/** figureMarkup + a pose, as a nested <svg> ready to drop into the sheet. */
function posedFigure(build, pose, box, opts = {}) {
  let m = figureMarkup({
    build, id: opts.id || ('f' + Math.random().toString(36).slice(2, 8)),
    color: opts.color, glow: !!opts.glow, className: 'rf'
  });
  const tf = poseTransforms(pose);
  m = m.replace(/data-joint="(\w+)" transform="[^"]*"/g,
    (s, n) => tf[n] ? 'data-joint="' + n + '" transform="' + tf[n] + '"' : s);
  const attrs = ' x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"' +
    (opts.opacity != null ? ' opacity="' + opts.opacity + '"' : '');
  return m.replace('<svg ', '<svg' + attrs + ' ');
}

/** rig-space point -> sheet-space, for a nested svg with xMidYMax meet. */
function rigToSheet(b, box, p) {
  const k = Math.min(box.w / b.viewW, box.h / b.viewH);
  const ox = box.x + (box.w - b.viewW * k) / 2;
  const oy = box.y + (box.h - b.viewH * k);
  return [ox + p[0] * k, oy + (p[1] - b.viewY) * k];
}

function txt(x, y, s, o = {}) {
  return '<text x="' + x + '" y="' + y + '" fill="' + (o.fill || C.ink) + '" font-size="' + (o.size || 13) +
    '" font-family="' + (o.mono ? 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' : 'system-ui,-apple-system,Segoe UI,sans-serif') +
    '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') +
    (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') +
    ' xml:space="preserve">' + esc(s) + '</text>';
}

/** Wrap a monospace line to `cpl` characters, hanging the continuations under
 *  the text rather than under the bullet. The first sheet ran every VERDICT
 *  reason straight off the right edge of the image, which is a fine way to lose
 *  the sentence that explains the verdict. */
function wrapMono(line, cpl) {
  if (line.length <= cpl) return [line];
  const indent = ' '.repeat(Math.min(12, (line.match(/^\s*!?\s*/) || [''])[0].length + 4));
  const words = line.split(' ');
  const out = [];
  let cur = '';
  for (const w of words) {
    const pre = out.length ? indent : '';
    if (cur && (cur + ' ' + w).length > cpl - (out.length ? indent.length : 0)) { out.push(pre + cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) out.push((out.length ? indent : '') + cur);
  return out;
}

function sheetSVG(R, cols) {
  const PAD = 24, LAB = 78, CW = 200, GAP = 10, SRCH = 250, RIGH = 250;
  const W = Math.max(PAD * 2 + LAB + cols * CW + (cols - 1) * GAP, 1180);
  const HEAD = 158;   /* the legend row sat ON the first panel's border at 132 */
  const rep = R.reportLines;
  const FOOT = 34 + rep.reduce((n, l) => n + wrapMono(l, Math.floor((Math.max(PAD * 2 + LAB + cols * CW + (cols - 1) * GAP, 1180) - PAD * 2) / 7.25)).length, 0) * 15.5 + 130;
  const H = Math.ceil(HEAD + SRCH + GAP + RIGH + FOOT + PAD);

  const F = R.take.frames, b = R.build;
  const idxs = [];
  for (let c = 0; c < cols; c++) idxs.push(R.from + Math.round((R.to - R.from) * (cols === 1 ? 0 : c / (cols - 1))));

  /* one scale for every source panel, so motion is comparable across the row */
  let floorY = Infinity, topY = -Infinity;
  for (let i = R.from; i <= R.to; i++) {
    const p = F[i].p;
    floorY = Math.min(floorY, p.lank[1], p.rank[1]);
    topY = Math.max(topY, p.head[1]);
  }
  /* 30px of sky so a raised head is not clipped by the panel border, which is
     what the first sheet did on every column. */
  const s = (SRCH - 62) / Math.max(1, topY - floorY);

  const out = [];
  out.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H +
    '" viewBox="0 0 ' + W + ' ' + H + '">');
  out.push('<rect width="' + W + '" height="' + H + '" fill="' + C.bg + '"/>');

  /* ---- header --------------------------------------------------------- */
  const vcol = R.verdict === 'OK' ? C.src : R.verdict === 'FLAGGED' ? C.warn : C.bad;
  out.push(txt(PAD, PAD + 22, 'MOCAP CONTACT SHEET — ' + R.take.source + '  ·  "' + (R.take.label || '?') + '"', { size: 22, weight: 700 }));
  out.push(txt(W - PAD, PAD + 22, R.verdict, { size: 22, weight: 700, anchor: 'end', fill: vcol }));
  out.push(txt(PAD, PAD + 46, 'engine ' + R.engineName, { size: 13, fill: C.dim }));
  out.push(txt(PAD, PAD + 66, 'phrase frames ' + R.from + '..' + R.to + '   ·   dur ' + R.dur + 'ms   ·   ' +
    R.move.frames.length + ' keyframes   ·   the subject\'s LEFT side drives the rig\'s s' + R.srcLeftRigSide +
    '/e' + R.srcLeftRigSide + '/h' + R.srcLeftRigSide + '/k' + R.srcLeftRigSide + ' joints', { size: 13, fill: C.dim }));
  out.push(txt(PAD, PAD + 86, 'CMU Graphics Lab Motion Capture Database — mocap.cs.cmu.edu — credit required wherever this motion ships (CONTRACT §1).', { size: 12, fill: C.dim }));
  out.push(txt(PAD, PAD + 108, '● subject LEFT hand', { size: 12, fill: C.left }) +
    txt(PAD + 148, PAD + 108, '● subject RIGHT hand', { size: 12, fill: C.right }) +
    txt(PAD + 310, PAD + 108, '▬ ghost = retargeted pose BEFORE keyframe reduction', { size: 12, fill: C.ghost }) +
    txt(PAD + 660, PAD + 108, '▬ rig = anim.sample() on the reduced move', { size: 12, fill: C.rigc }));

  const rowY = HEAD, rigY = HEAD + SRCH + GAP;
  out.push(txt(PAD, rowY + SRCH / 2, 'SOURCE', { size: 14, weight: 700, fill: C.src }));
  out.push(txt(PAD, rowY + SRCH / 2 + 18, 'XY, Z dropped', { size: 11, fill: C.dim }));
  out.push(txt(PAD, rigY + RIGH / 2, 'RIG', { size: 14, weight: 700, fill: C.rigc }));
  out.push(txt(PAD, rigY + RIGH / 2 + 18, '12 joints', { size: 11, fill: C.dim }));

  for (let c = 0; c < cols; c++) {
    const x0 = PAD + LAB + c * (CW + GAP);
    const fi = idxs[c];
    const t01 = cols === 1 ? 0 : c / (cols - 1);
    const p = F[fi].p;
    const face = R.facing[fi];
    const hot = Math.abs(face) > FACING_LIMIT;

    /* --- source --- */
    out.push('<rect x="' + x0 + '" y="' + rowY + '" width="' + CW + '" height="' + SRCH +
      '" rx="8" fill="' + C.panel + '" stroke="' + (hot ? C.bad : C.line) + '"/>');
    const cx = x0 + CW / 2, baseY = rowY + SRCH - 18;
    const X = q => cx + (q[0] - p.root[0]) * s;
    const Y = q => baseY - (q[1] - floorY) * s;
    out.push('<line x1="' + x0 + '" y1="' + baseY + '" x2="' + (x0 + CW) + '" y2="' + baseY +
      '" stroke="' + C.line + '" stroke-dasharray="3 4"/>');
    for (const [a, z] of SRC_BONES) {
      const cross = (a[0] === 'l' && z[0] === 'r') || (a[0] === 'r' && z[0] === 'l');
      const col = cross ? C.src : a[0] === 'l' || z[0] === 'l' ? C.left : a[0] === 'r' || z[0] === 'r' ? C.right : C.src;
      out.push('<line x1="' + r1(X(p[a])) + '" y1="' + r1(Y(p[a])) + '" x2="' + r1(X(p[z])) + '" y2="' + r1(Y(p[z])) +
        '" stroke="' + col + '" stroke-width="3" stroke-linecap="round" opacity="0.92"/>');
    }
    out.push('<circle cx="' + r1(X(p.head)) + '" cy="' + r1(Y(p.head)) + '" r="' + r1(Math.max(5, 10 * s)) +
      '" fill="none" stroke="' + C.src + '" stroke-width="2.5"/>');
    out.push('<circle cx="' + r1(X(p.lwri)) + '" cy="' + r1(Y(p.lwri)) + '" r="5" fill="' + C.left + '"/>');
    out.push('<circle cx="' + r1(X(p.rwri)) + '" cy="' + r1(Y(p.rwri)) + '" r="5" fill="' + C.right + '"/>');
    out.push(txt(x0 + 8, rowY + 18, 'f' + fi + '  t' + t01.toFixed(2), { size: 12, mono: true, fill: C.dim }));
    out.push(txt(x0 + CW - 8, rowY + 18, (face >= 0 ? '+' : '') + r1(face) + '° off',
      { size: 12, mono: true, anchor: 'end', fill: hot ? C.bad : C.dim }));

    /* --- rig: ghost (pre-reduction) then the reduced move --- */
    const box = { x: x0, y: rigY, w: CW, h: RIGH };
    out.push('<rect x="' + x0 + '" y="' + rigY + '" width="' + CW + '" height="' + RIGH +
      '" rx="8" fill="' + C.panel + '" stroke="' + C.line + '"/>');
    const gp = rigToSheet(b, box, [0, b.groundY]);
    out.push('<line x1="' + x0 + '" y1="' + r1(gp[1]) + '" x2="' + (x0 + CW) + '" y2="' + r1(gp[1]) +
      '" stroke="' + C.line + '" stroke-dasharray="3 4"/>');
    const ghost = R.dense ? R.dense[clamp(fi - R.from, 0, R.dense.length - 1)] : null;
    const posed = anim.sample(R.move, t01, 1);
    if (ghost) out.push(posedFigure(b, ghost, box, { color: C.ghost, glow: false, opacity: 0.9, id: 'g' + c }));
    out.push(posedFigure(b, posed, box, { color: C.rigc, glow: true, id: 'r' + c }));

    const fk = rigFK(b, posed);
    const pl = rigToSheet(b, box, fk['wri' + R.srcLeftRigSide]);
    const pr = rigToSheet(b, box, fk['wri' + (R.srcLeftRigSide === 'L' ? 'R' : 'L')]);
    out.push('<circle cx="' + r1(pl[0]) + '" cy="' + r1(pl[1]) + '" r="5" fill="' + C.left + '"/>');
    out.push('<circle cx="' + r1(pr[0]) + '" cy="' + r1(pr[1]) + '" r="5" fill="' + C.right + '"/>');

    const near = R.move.frames.reduce((m, f) => Math.min(m, Math.abs(f.t - t01)), 9);
    const isKey = near < 0.5 / Math.max(1, cols - 1);
    out.push(txt(x0 + 8, rigY + 18, 't' + t01.toFixed(2) + (isKey ? '  ●key' : ''),
      { size: 12, mono: true, fill: isKey ? C.rigc : C.dim }));
  }

  /* ---- footer: the numbers that turn "looks ok" into a decision -------- */
  let fy = rigY + RIGH + 36;
  out.push('<line x1="' + PAD + '" y1="' + (fy - 18) + '" x2="' + (W - PAD) + '" y2="' + (fy - 18) + '" stroke="' + C.line + '"/>');
  const cpl = Math.floor((W - PAD * 2) / 7.25);      /* 12px monospace ≈ 7.25px/char */
  for (const line of rep) {
    const bad = /⛔|REJECT|NOT MET|FLATTENED|!/.test(line), warn = /⚠|FLAGGED/.test(line);
    const fill = bad ? C.bad : warn ? C.warn : /^[A-Z]{4}/.test(line) ? C.ink : C.dim;
    for (const seg of wrapMono(line, cpl)) {
      out.push(txt(PAD, fy, seg, { size: 12, mono: true, fill }));
      fy += 15.5;
    }
  }

  /* facing over the WHOLE take, with the cut phrase lit */
  fy += 22;
  const gw = W - PAD * 2, gh = 72;
  out.push(txt(PAD, fy - 7, 'FACING TRACE — whole take, ±90°;  teal band is the ±' + FACING_LIMIT +
    '° front window;  lit span is the phrase that was cut', { size: 12, fill: C.dim }));
  out.push('<rect x="' + PAD + '" y="' + fy + '" width="' + gw + '" height="' + gh + '" fill="#12101C" stroke="' + C.line + '"/>');
  const fx = i => PAD + gw * i / Math.max(1, R.facing.length - 1);
  const fyy = v => fy + gh / 2 - clamp(v, -90, 90) / 90 * (gh / 2 - 3);
  out.push('<rect x="' + PAD + '" y="' + r1(fyy(FACING_LIMIT)) + '" width="' + gw + '" height="' +
    r1(fyy(-FACING_LIMIT) - fyy(FACING_LIMIT)) + '" fill="#6FD9CC" opacity="0.09"/>');
  if (R.from != null) {
    out.push('<rect x="' + r1(fx(R.from)) + '" y="' + fy + '" width="' + Math.max(2, r1(fx(R.to) - fx(R.from))) +
      '" height="' + gh + '" fill="#FF9E64" opacity="0.16"/>');
  }
  const step = Math.max(1, Math.floor(R.facing.length / 1600));
  const pts = [];
  for (let i = 0; i < R.facing.length; i += step) pts.push(r1(fx(i)) + ',' + r1(fyy(R.facing[i])));
  out.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + C.src + '" stroke-width="1.4"/>');
  out.push(txt(PAD + 4, fy + 12, '+90° turned', { size: 10, fill: C.dim }));
  out.push(txt(PAD + 4, fy + gh - 4, '−90° turned', { size: 10, fill: C.dim }));

  out.push('</svg>');
  return { svg: out.join(''), w: W, h: H };
}

/** Optional: make it a PNG so it opens anywhere. puppeteer is dev-only. */
async function rasterise(svg, w, h, pngPath) {
  let puppeteer;
  try { puppeteer = (await import('puppeteer')).default; }
  catch { return null; }
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: Math.ceil(w), height: Math.ceil(h), deviceScaleFactor: 1 });
    await page.setContent('<body style="margin:0;background:' + C.bg + '">' + svg + '</body>', { waitUntil: 'load' });
    await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: Math.ceil(w), height: Math.ceil(h) } });
    return pngPath;
  } finally { await browser.close(); }
}

async function cmdSheet(args) {
  const R = await pipeline(args._[0], args);
  console.log(R.reportLines.join('\n'));
  if (!R.ok) {
    console.log('\nNO SHEET. This take was REJECTED before a move existed, so there is nothing');
    console.log('to look at — which is the honest outcome, not a failure of the renderer.');
    console.log('Force a window with --phrase a,b (seconds) if you want to see it fail.');
    process.exitCode = 2;
    return;
  }
  const cols = clamp(num(args.cols, 7) | 0, 2, 14);
  const { svg, w, h } = sheetSVG(R, cols);

  const stem = args.out ? String(args.out).replace(/\.(svg|png)$/i, '')
    : path.join(CACHE, 'sheet-' + String(R.take.source).replace(/[^\w]+/g, '_'));
  fs.mkdirSync(path.dirname(path.resolve(stem)), { recursive: true });
  const svgPath = path.resolve(stem + '.svg');
  fs.writeFileSync(svgPath, svg);

  console.log('\nSHEET  ' + svgPath);
  const png = await rasterise(svg, w, h, path.resolve(stem + '.png'));
  console.log(png ? 'PNG    ' + png + '   (' + w + '×' + h + ')'
    : 'PNG    skipped — puppeteer did not resolve; the SVG opens in any browser.');
  console.log('\nNow OPEN IT. A green run is not a look.');
  if (R.verdict === 'FLAGGED') process.exitCode = 1;
}

/* -------------------------------------------------------------------------- */
/* MAIN                                                                        */
/* -------------------------------------------------------------------------- */

const HELP = `AURA OFF — mocap bridge (tools/mocap/cli.js)

  fetch <subject> [trial...]   download + cache from CMU, one file at a time
  list                         what is cached, with labels
  convert <take> [--out f]     TAKE -> proposed move, printed for a human
  sheet <take> [--out stem]    CONTACT SHEET: source beside rig, svg + png

  <take> is a cached name (60_01) or a path to an .amc / .bvh.

  RETARGET (passed through to retarget.js)
  --sides screen|anatomical  which mocap side drives the rig's L   (default screen)
  --rot body|off             whole-body roll about the feet
  --elbow signed|hinge       true projected angle vs one-way hinge
  --bob budget|raw           clamp hip drop to the foot budget
  --phrase a,b               window in SECONDS; otherwise picked automatically
  --pick loop|motion         phrase objective                     (default loop)
  --tol <deg> --max <knots> --smooth <ms>
  --upper-only               emit a 100/0 move, lower joints dropped
  --id --name --cat --label

  SHEET
  --cols <n>                 columns (default 7)
  --seed <s>                 which body to render on (default "mocap")

  --engine auto|retarget|builtin   default auto: retarget.js if it imports, else
                             cli.js's own fallback arithmetic, loudly labelled.

exit 0 = usable   1 = FLAGGED (converted, but look at why)   2 = REJECTED

Motion from mocap.cs.cmu.edu is free to use and modify commercially, but must be
CREDITED wherever it ships and may never be resold as data. CONTRACT.md §1.
This tool never writes into src/. A converted move is a proposal for a human.`;

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const args = parseArgs(argv.slice(1));
  switch (cmd) {
    case 'fetch': return cmdFetch(args);
    case 'list': return cmdList();
    case 'convert': return cmdConvert(args);
    case 'sheet': return cmdSheet(args);
    case 'help': case '--help': case '-h': case undefined: console.log(HELP); return;
    default: console.log(HELP); process.exitCode = 2;
  }
}

main().catch(e => {
  console.error('\n' + (e && e.message ? e.message : e));
  if (process.env.MOCAP_DEBUG) console.error(e);
  process.exitCode = 1;
});
