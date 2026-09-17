// TUMBLE state machine (DESIGN 3, 10, 13.5):
//   room (menu) -> drying (atlas + pre-sim) -> dump -> play -> sweep -> results -> room

import * as THREE from 'three';
import { initPhysics, Physics } from './physics.js';
import { Renderer } from './render.js';
import { Table } from './table.js';
import { Input } from './input.js';
import { Play } from './play.js';
import { Session } from './session.js';
import { Atlas } from './atlas.js';
import { loadSilhouettes } from './geo.js';
import { generateLoad } from './loadgen.js';
import { decode } from '../engine/sockgen.js';
import { SILHOUETTES } from './silhouettes.js';
import { PHYS, HELD, BASKET, ODDBIN, VERSION } from './config.js';
import { rng32 } from './mathx.js';
import { Debug } from './debug.js';

export const DEFAULT_SETTINGS = {
  cvd: 'normal',            // normal | deutan | protan | tritan (DESIGN 12)
  patternFirst: false,
  warmHands: false,         // accessibility default for the Warm hands peg
  reduceMotion: false,
  sound: true,
  music: true,
  haptics: true,
  rain: false,
  radio: null,
  tapShots: true,
};

export class Game {
  constructor(root, params) {
    this.root = root;
    this.params = params;
    this.canvas = root.querySelector('#stage');
    this.state = 'boot';
    this.acc = 0;
    this.last = 0;
    this.stepMs = 0;
    this.frame = 0;
    this.timers = [];
    this.gameTime = 0;
    this.settings = { ...DEFAULT_SETTINGS };
    this.comforts = new Set();     // clothesline comfort keys the player has earned
    this.heroDefs = [];
    this.session = null;
    this.load = null;
    this.hooks = {};               // ui / audio / save attach here
  }

  async boot(progress = () => {}) {
    progress('Warming up the dryer');
    await initPhysics();
    const sils = await loadSilhouettes(this.params.get('base') || './');
    this.sils = sils;
    progress('Folding the table');
    this.physics = new Physics();
    this.render = new Renderer(this.canvas, { preserve: this.params.has('shots'), lowShadows: this.params.has('low') });
    this.render.init(sils);
    this.atlas = new Atlas(this.render, sils.map((g) => g.mask));
    this.table = new Table(this.physics, this.render);
    this.play = new Play(this);
    this.input = new Input(this.canvas, this._handlers());
    this.debug = this.params.get('debug') === '1' ? new Debug(this.root) : null;
    const ro = () => this.resize();
    window.addEventListener('resize', ro);
    window.visualViewport?.addEventListener('resize', ro);
    this.resize();
    const cam = this.params.get('cam');
    if (cam) {
      const v = cam.split(',').map(Number);
      this.render.camOverride = { pos: v.slice(0, 3), look: v.slice(3, 6), fov: v[6] || 40 };
      this.render._applyPose(this.render.camOverride);
    }
    this.state = 'idle';
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const vv = window.visualViewport;
    const w = Math.round(vv ? vv.width : window.innerWidth);
    const h = Math.round(vv ? vv.height : window.innerHeight);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.render.resize(w, h);
    this.hooks.resize?.(w, h);
  }

  // ---------- small services used by Play ----------
  later(sec, fn) { this.timers.push({ at: this.gameTime + sec, fn }); }
  sfx(name, p) { this.hooks.sfx?.(name, p); }
  haptic(ms) { if (this.settings.haptics && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* not allowed */ } } }
  comfort(key) {
    if (key === 'warmHands' && this.settings.warmHands) return true;
    return this.comforts.has(key);
  }
  hint(text) { this.hooks.hint?.(text); }
  arcPreview(L) { this.hooks.arc?.(L); }
  settleBasket() { this.hooks.settle?.(); }
  fadeReshuffle(pts) { this.hooks.fadeReshuffle?.(pts); }
  looseSort(pts) { this.hooks.looseSort?.(pts); }
  onMatch(r, be) { this.hooks.match?.(r, be); }
  onMismatch(a, b) { this.hooks.mismatch?.(a, b); }
  onFlip(e) { this.hooks.flip?.(e); }
  onBinned(e, r) { this.hooks.binned?.(e, r); }
  onShot(id, made, res, p) { this.hooks.shot?.(id, made, res, p); }

  // ---------- a Load ----------
  // opts: { mode, sub, size, tier, seed, oddBin, heroes, load (pre-built), basketScale }
  async startLoad(opts = {}) {
    this.cancelTimers();
    this.state = 'drying';
    this.hooks.state?.('drying');
    const load = opts.load || generateLoad({
      seed: opts.seed || `load|${Date.now()}|${Math.random()}`,
      mode: opts.mode || 'laundry',
      size: opts.size || 'regular',
      tier: opts.tier || 0,
      oddBin: opts.oddBin || [],
      heroes: opts.heroes || [],
      patternFirst: this.settings.patternFirst,
      sizeCount: opts.sizeCount,
      portalHero: opts.portalHero,
    });
    load.mode = opts.mode || load.mode;
    this.load = load;
    this.loadOpts = opts;
    this.play.hand = null;
    this.table.clear();
    this.physics.free();
    const radius = this.comfort('biggerBasket') ? BASKET.bigRadius : BASKET.radius;
    this.physics = new Physics({ basketRadius: radius * (opts.basketScale || 1) });
    this.table.P = this.physics;
    this.play.P = this.physics;
    this.render.setBasketRadius(this.physics.basketRadius);
    this.render.setBasketTilt(0, 0);
    this.table.heldScale = this.comfort('warmHands') ? HELD.warmHandsScale : HELD.scale;
    const session = new Session(load, { sub: opts.sub });
    this.session = session;
    // atlas: heroes paint from their recipes
    const heroById = new Map(this.heroDefs.map((h) => [h.id, h]));
    for (const seed of load.tiles) {
      const sp = decode(seed);
      if (sp.hero && heroById.has(sp.hero)) {
        const h = heroById.get(sp.hero);
        this.atlas.recipes.set(seed, { ...h.recipe, silhouette: silIndex(h.silhouette) });
      }
    }
    await this.atlas.setMode(this.settings.cvd);
    const { map, ready } = this.atlas.assign(load.tiles, { reset: true });
    const r = rng32(parseInt(String(load.seed).slice(0, 8), 16) || 7);
    const socks = [];
    for (const s of load.socks) {
      const id = this.table.newId();
      const sp = decode(s.seed);
      const hero = sp.hero && heroById.get(sp.hero);
      const silId = hero ? silIndex(hero.silhouette) : sp.silhouette;
      const reunion = s.odd !== null && s.odd !== undefined && load.odd[s.odd] && load.odd[s.odd].reunion;
      socks.push({ id, seed: s.seed, silId, scale: sp.size === 1 && !sp.hero ? 0.82 : 1, tile: map.get(s.seed), insideOut: s.insideOut, spec: sp, hero: hero || null });
      session.addSock(id, { ...s, reunion });
    }
    this.hooks.drying?.(load);
    const t0 = performance.now();
    await Promise.all([ready, this._dryerSpin(0.9)]);
    this.paintMs = performance.now() - t0;
    this.play.begin(session);
    const pb = this.table.dump(socks, (r() * 1e9) | 0, { fromAbove: !!opts.dropFromAbove });
    this.lastDump = { n: socks.length, simMs: pb.simMs, settledAt: pb.settledAt, paintMs: this.paintMs };
    if (this.params.has('skipdump')) pb.t = pb.end;
    this.state = 'dump';
    this.hooks.state?.('dump');
    this.sfx('doorOpen');
    return load;
  }

  // the dryer "finishes" while tiles paint (a short wait that looks intentional)
  _dryerSpin(sec) {
    if (this.params.has('skipdump')) return Promise.resolve();
    this.render.pilotMat.emissiveIntensity = 2.2;
    this.render.drumSocks.visible = true;
    this.render.setDryerDoor(0);
    this.sfx('dryerEnd');
    return new Promise((res) => this.later(sec, () => { this.render.pilotMat.emissiveIntensity = 0; this.render.drumSocks.visible = false; this.sfx('ding'); res(); }));
  }

  // step 1 smoke pile: n random socks, every one of them "odd", so there are no rules to finish
  smokePile(n, seed = 1) {
    const r = rng32(seed);
    const tiles = [];
    const socks = [];
    for (let i = 0; i < n; i++) {
      const s = Array.from({ length: 8 }, () => Math.floor(r() * 4294967295).toString(16).padStart(8, '0')).join('');
      if (tiles.length < 64) tiles.push(s);
      socks.push({ seed: tiles[i % 64], pair: null, odd: i, insideOut: r() < 0.15 });
    }
    const load = { seed: 'smoke' + seed, mode: 'laundry', tier: 0, pairs: [], odd: socks.map(() => ({ reunion: false })), socks, tiles };
    return this.startLoad({ load });
  }

  cancelTimers() { this.timers.length = 0; }

  // ---------- loop ----------
  loop(tms) {
    requestAnimationFrame((t) => this.loop(t));
    // ?turbo=1 (gates on the software renderer): let a slow frame carry more game time
    const turbo = this.turbo || (this.turbo = this.params.has('turbo') ? 1 : 0);
    const dt = this.last ? Math.min(turbo ? 0.25 : 0.05, (tms - this.last) / 1000) : 1 / 60;
    this.last = tms;
    this.frame++;
    this.gameTime += dt;
    if (this.timers.length) {
      const due = this.timers.filter((t) => t.at <= this.gameTime);
      if (due.length) {
        this.timers = this.timers.filter((t) => t.at > this.gameTime);
        for (const t of due) t.fn();
      }
    }
    const P = this.physics, T = this.table;
    if (this.paused) {
      T.draw(0, this.acc / P.dt);
      this.render.render(0);
      return;
    }
    if (this.state === 'dump') {
      const pb = T.playback;
      const door = Math.min(1, (pb ? pb.t : 1) / 0.35);
      this.render.setDryerDoor(door);
      this.render.dryerGlow.intensity = 1.6 * door;
      if (T.playbackDone()) {
        T.finishPlayback();
        this.state = 'play';
        this.session.startClock();
        this.hooks.state?.('play');
      }
    } else if (this.state !== 'drying') {
      this.acc += dt;
      let n = 0;
      const t0 = performance.now();
      const maxSteps = turbo ? 16 : PHYS.maxStepsPerFrame;
      while (this.acc >= P.dt && n < maxSteps) {
        this._beforeStep();
        try { P.step(); } catch (err) {
          // a physics panic poisons the world for good: say so once and leave the Load instead of freezing
          console.error('physics step failed', err);
          this.acc = 0;
          this.abandonLoad();
          this.hooks.fault?.(err);
          break;
        }
        T.afterStep();
        this.play.step(P.dt);
        this.hooks.step?.(P.dt);
        this.acc -= P.dt;
        n++;
      }
      if (n) this.stepMs = (performance.now() - t0) / n;
      if (n === maxSteps) this.acc = 0;
      const door = this.render.dryerDoor.rotation.y;
      if (door < 0) this.render.setDryerDoor(Math.max(0, -door / 1.9 - dt * 1.5));
      this.render.dryerGlow.intensity = Math.max(0, this.render.dryerGlow.intensity - dt * 2);
    }
    if (this.state === 'play' && this.session) {
      this.session.tick(dt);
      if (this.session.isPlayDone() && this.play.busy <= 0 && (!this.play.hand || this.session.timeLeft <= 0 && this.session.mode === 'rush')) this.beginSweep();
    }
    if (this.state === 'sweep') {
      this.sweepT += dt;
      if (this.sweepT > 3 && !this.sweepAuto) this.autoSweep();
      if (this.sweepAuto && this.gameTime > this.sweepDoneAt) this.finishLoad();
    }
    this.play.frame(dt);
    this.hooks.frame?.(dt);
    T.draw(dt, this.acc / P.dt);
    this.render.render(dt);
    if (this.debug) this.debug.update(dt, this);
  }

  _beforeStep() {
    const h = this.play.hand;
    if (h && h.mode === 'drag' && this.physics.has(h.id)) {
      const p = this.render.planePoint(h.ptr.x, h.ptr.y, PHYS.holdHeight);
      if (p) this.physics.setHoldTarget(h.id, p.x, p.z);
    }
  }

  beginSweep() {
    const S = this.session;
    if (!S || S.phase !== 'play') return;
    // a Rush clock can run out with something in the hand: it is set down
    if (this.play.hand) {
      // a ball still in the hand at the buzzer is a stray (it never reached the basket)
      if (this.play.hand.kind === 'ball') S.dropBall(this.play.hand.id);
      else S.setState(this.play.hand.id, 'table');
      const pt = { x: 0, y: 0.12, z: 0.1 };
      this.play.putDown(pt);
    }
    const strays = S.startSweep();
    this.state = 'sweep';
    this.sweepT = 0;
    this.sweepAuto = false;
    this.hooks.state?.('sweep', { strays: strays.length });
    if (!strays.length) { this.sweepAuto = true; this.sweepDoneAt = this.gameTime + 0.6; }
  }

  autoSweep() {
    this.sweepAuto = true;
    const strays = this.session.strays();
    strays.forEach((b, i) => this.later(i * 0.18, () => this.play.sweepOne(b.id)));
    this.sweepDoneAt = this.gameTime + strays.length * 0.18 + 0.8;
  }

  // leave a Load without results (pause menu): nothing is saved, the table is cleared
  abandonLoad() {
    this.cancelTimers();
    this.play.hand = null;
    this.play.shots.clear();
    this.play.watch.clear();
    this.play.busy = 0;
    this.play.gen++;
    if (this.session) this.session.phase = 'abandoned';
    this.table.clear();
    this.state = 'room';
    this.hooks.state?.('room');
  }

  finishLoad() {
    if (this.state !== 'sweep') return;
    this.session.finish();
    this.state = 'results';
    this.hooks.state?.('results', { session: this.session, load: this.load });
  }

  // ---------- input ----------
  _handlers() {
    const P = () => this.play;
    return {
      down: (p) => P().down(p),
      dragStart: (p) => P().dragStart(p),
      drag: (p) => P().drag(p),
      release: (p, v, still) => P().release(p, still),
      tap: (p) => P().tap(p),
      doubleTap: (p) => P().doubleTap(p),
      secondTap: (p) => P().secondTap(p),
      shake: (path, dir) => P().shake(path, dir),
      cancel: (p) => P().cancel(p),
    };
  }

  // ---------- dev hooks for gates ----------
  devApi() {
    const g = this;
    return {
      version: VERSION,
      get state() { return g.state; },
      counts: () => g.physics.counts(),
      lastDump: () => g.lastDump,
      screenOf: (id) => {
        const e = g.table.ents.get(id);
        const p = e && (e.drawn || g.physics.pose(id));
        return p ? g.render.project(p) : null;
      },
      pose: (id) => g.physics.pose(id),
      ids: () => [...g.table.ents.keys()],
      tableIds: () => [...g.table.ents.values()].filter((e) => e.state === 'table').map((e) => e.id),
      hand: () => (g.play.hand ? { id: g.play.hand.id, kind: g.play.hand.kind, mode: g.play.hand.mode } : null),
      entState: (id) => { const e = g.table.ents.get(id); return e ? e.state : null; },
      smoke: (n, seed) => g.smokePile(n, seed),
      start: (o) => { g.startLoad(o); return true; },
      stepMs: () => g.stepMs,
      pickAt: (x, y) => { const e = g.play.pickAt(x, y); return e ? e.id : null; },
      heldScreen: () => { const h = g.play.hand; const e = h && g.table.ents.get(h.id); return e && e.viewPose ? g.render.project(e.viewPose) : null; },
      session: () => g.session && { phase: g.session.phase, stats: JSON.parse(JSON.stringify(g.session.stats)), pairsLeft: g.session.pairsLeft(), oddLeft: g.session.oddLeft(), unresolved: g.session.unresolvedSocks(), tidy: g.session.tidy(), streak: g.session.streak, mult: g.session.mult, dots: g.session.dots, timeLeft: g.session.timeLeft, balls: [...g.session.balls.values()].map((b) => ({ id: b.id, state: b.state })) },
      sock: (id) => { const s = g.session && g.session.sock(id); return s ? { ...s } : null; },
      busy: () => g.play.busy,
      // table socks (or balls) whose centre is on screen and is what a finger there would pick
      findPickable: (filter, margin = 60) => {
        const out = [];
        for (const e of g.table.ents.values()) {
          if (e.state !== 'table' || e.inBin) continue;
          if (filter === 'ball' ? e.kind !== 'ball' : e.kind !== 'sock') continue;
          const s = g.render.project(g.physics.pose(e.id));
          if (s.x < margin || s.x > g.render.w - margin || s.y < margin * 2 || s.y > g.render.h * 0.7) continue;
          const got = g.play.pickAt(s.x, s.y);
          const rec = g.session && g.session.sock(e.id);
          if (got && got.id === e.id) out.push({ id: e.id, x: s.x, y: s.y, key: rec ? rec.key : null, odd: rec ? rec.odd : null, insideOut: rec ? rec.insideOut : null });
        }
        return out;
      },
      spots: () => ({
        basket: g.render.project({ x: BASKET.x, y: BASKET.height * 0.6, z: BASKET.z }),
        bin: g.render.project({ x: ODDBIN.x, y: ODDBIN.height * 0.6, z: ODDBIN.z }),
        pocket: g.play.pocketPoint(),
      }),
      mateOf: (id) => g.session && g.session.mateOf(id),
      setTime: (t) => { if (g.session) g.session.timeLeft = t; return true; },
      addComfort: (k) => { g.comforts.add(k); return true; },
      fogVisible: () => (g.render.fogGroup ? g.render.fogGroup.children.filter((s) => s.visible).length : 0),
      basketTilt: () => g.render.basketGroup.rotation.z,
      matchPair: () => {
        const S = g.session;
        const byKey = new Map();
        for (const s of S.socks.values()) if (s.state === 'table' && s.pair !== null) byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
        const pair = [...byKey.values()].find((v) => v.length === 2);
        if (!pair) return null;
        const r = S.match(pair[0], pair[1]);
        const tile = g.table.ents.get(pair[0]).sock.tile;
        g.table.remove(pair[0]); g.table.remove(pair[1]);
        const be = g.table.addBallEntity({ id: r.ball, tile, key: S.ball(r.ball).key });
        g.physics.addBall(r.ball, { pos: { x: 0, y: 0.2, z: 0.3 } });
        be.state = 'table';
        S.dropBall(r.ball);
        return r.ball;
      },
      lobBall: (id) => { const e = g.table.ents.get(id); if (!e) return false; g.session.pickUpBall(id); g.play.lob(e); return true; },
      tapPoint: (id) => { const p = g.physics.pose(id); return p ? g.render.project(p) : null; },
      // a point on the table where a tap hits no sock and is not the hand or the bin/basket
      emptySpot: () => {
        const P = g.play;
        for (let y = g.render.h * 0.72; y > g.render.h * 0.35; y -= 11) {
          for (let x = 40; x < g.render.w - 40; x += 11) {
            const p = { x, y };
            if (P.hitPocket(p) || P.hitBin(p) || P.hitBasket(p)) continue;
            const pt = g.render.planePoint(x, y, 0.12);
            if (!pt || Math.abs(pt.x) > 0.36 || pt.z < -0.38 || pt.z > 0.54) continue;
            // the same test a finger gets (pickAt includes the fat finger ring), plus a margin
            if (P.pickAt(x, y) || P.pickAt(x + 10, y) || P.pickAt(x - 10, y)) continue;
            return p;
          }
        }
        return null;
      },
      cheatSolve: (leaveOdd) => cheatSolve(g, leaveOdd),
    };
  }
}

export function silIndex(key) {
  const i = SILHOUETTES.findIndex((s) => s.key === key);
  return i < 0 ? 1 : i;
}

// Tests only: resolve every pair through the session and drop the balls on the table.
function cheatSolve(g, leaveOdd) {
  const S = g.session;
  const byKey = new Map();
  for (const s of S.socks.values()) {
    if (s.state !== 'table') continue;
    if (s.odd !== null && s.odd !== undefined) { if (!leaveOdd) { const e = g.table.ents.get(s.id); if (e) g.play.toBin(e); } continue; }
    byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
  }
  let n = 0;
  for (const ids of byKey.values()) {
    if (ids.length !== 2) continue;
    const r = S.match(ids[0], ids[1]);
    if (!r.ok) continue;
    const tile = g.table.ents.get(ids[0]).sock.tile;
    g.table.remove(ids[0]); g.table.remove(ids[1]);
    const be = g.table.addBallEntity({ id: r.ball, tile, key: S.ball(r.ball).key });
    g.physics.addBall(r.ball, { pos: { x: (n % 5) * 0.12 - 0.24, y: 0.15 + (n % 3) * 0.1, z: 0.1 + ((n / 5) | 0) * 0.08 } });
    be.state = 'table';
    S.dropBall(r.ball);
    g.play.watchItem(r.ball);
    n++;
  }
  return n;
}
