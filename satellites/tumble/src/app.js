// App: data, save, audio and UI around the Game (DESIGN 9, 10, 11, 12).

import * as THREE from 'three';
import { Game, silIndex, DEFAULT_SETTINGS } from './game.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Store, exportJSON, importJSON, freshSave } from './save.js';
import { applyResults, comfortsOf, sizesUnlocked, tierNow, ownedHeroes, owns, buy, canBuy } from './economy.js';
import { SIZES, SIZE_NAMES, dailyLoad, localDateString, generateLoad, tierParams } from './loadgen.js';
import { decode, sockName, specKey, paint } from '../engine/sockgen.js';

export const THUMB = 96;
import { sha256 } from '../engine/sha256.js';
import { renderFlat } from '../engine/flat.js';
import { RUSH } from './session.js';
import { BASKET, TABLE, PHYS } from './config.js';
import { rng32 } from './mathx.js';
import { Screens } from './screens.js';

const POWERS = [
  { key: 'static', name: 'Static Cling', icon: 'static', peg: 'powerStatic' },
  { key: 'dryerSheet', name: 'Dryer Sheet', icon: 'sheet', peg: 'powerDryerSheet' },
  { key: 'sockPuppet', name: 'Sock Puppet', icon: 'puppet', peg: 'powerSockPuppet' },
  { key: 'spinCycle', name: 'Spin Cycle', icon: 'spin', peg: 'powerSpinCycle' },
];

async function getJSON(url, fallback) {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn('TUMBLE: could not load', url, e.message);
    return fallback;
  }
}

export class App {
  constructor(root, params) {
    this.root = root;
    this.params = params;
    this.game = new Game(root, params);
    this.audio = new Audio();
    this.store = new Store();
    this.data = { heroes: [], packs: [], lore: { pages: [] }, unlocks: { items: [] }, clothesline: { pegs: [] } };
    this.fog = [];
  }

  async boot(progress) {
    const [save] = await Promise.all([this.store.load(), this._loadData(), this.game.boot(progress)]);
    this.save = save;
    this.ui = new UI(this.root, this);
    this.screens = new Screens(this);
    this._applySettings();
    this._wireGame();
    this._refreshComforts();
    this.game.heroDefs = this.data.heroes;
    const unlock = () => { this.audio.unlock(); this._beds(); };
    this.root.addEventListener('pointerdown', unlock, { capture: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.game.state === 'play') this.pause(); });
    // a shared sock link opens its card
    const m = /sock=([^&]+)/.exec(location.hash);
    if (m) this.pendingShare = decodeURIComponent(m[1]);
    window.addEventListener('pagehide', () => { this.store.save(); try { this.game.render.r.forceContextLoss(); } catch (e) { /* gone */ } });
    window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
    return this;
  }

  async _loadData() {
    const [heroFile, lore, unlocks, clothesline] = await Promise.all([
      getJSON('data/hero-socks.json', { heroes: [], packs: [] }),
      getJSON('data/lore.json', { pages: [] }),
      getJSON('data/unlocks.json', { items: [] }),
      getJSON('data/clothesline.json', { pegs: [] }),
    ]);
    this.data = { heroes: heroFile.heroes || [], packs: heroFile.packs || [], lore, unlocks, clothesline };
  }

  // ---------- helpers used by the UI ----------
  tileBytes(seed) {
    const sp = decode(seed);
    if (sp.hero) {
      const h = this.heroById(sp.hero);
      if (h) this.game.atlas.recipes.set(seed, { ...h.recipe, silhouette: silIndex(h.silhouette) });
    }
    return this.game.atlas.tileBytes(seed);
  }
  // a small tile for 2D thumbnails (Drawer, clothesline, cards): 96 px paints about 7 times faster
  thumbTile(seed) {
    if (!this.thumbCache) this.thumbCache = new Map();
    const mode = this.game.settings.cvd || 'normal';
    const key = seed + '|' + mode;
    if (this.thumbCache.has(key)) return this.thumbCache.get(key);
    const sp = decode(seed);
    const hero = sp.hero ? this.heroById(sp.hero) : null;
    if (sp.hero) sp.silhouette = hero ? silIndex(hero.silhouette) : 1;
    const bytes = paint(sp, this.game.atlas.masks[sp.silhouette], { size: THUMB, mode, recipe: hero ? hero.recipe : null });
    if (this.thumbCache.size > 400) this.thumbCache.clear();
    this.thumbCache.set(key, bytes);
    return bytes;
  }
  heroById(id) { return this.data.heroes.find((h) => h.id === id) || null; }
  heroOf(seed) { const sp = decode(seed); return sp.hero ? this.heroById(sp.hero) : null; }
  nameOf(seed) { const h = this.heroOf(seed); return h ? h.name : sockName(decode(seed)); }
  powerDefs() { return POWERS.map((p) => ({ ...p, cost: RUSH.powers[p.key] })); }
  powerOwned(key) { const p = POWERS.find((x) => x.key === key); return !!p && this.game.comfort(p.peg); }
  powerReady(key) { return this.powerOwned(key) && this.game.session && this.game.session.canPower(key) && this.game.state === 'play'; }
  item(id) { return (this.data.unlocks.items || []).find((i) => i.id === id) || null; }
  itemsOf(cat) { return (this.data.unlocks.items || []).filter((i) => i.cat === cat); }
  equippedItem(cat) { return this.item(this.save.equipped[cat]); }

  _refreshComforts() {
    this.game.comforts = comfortsOf(this.save, this.data.clothesline);
    // hero packs owned through the unlock catalogue
    this.ownedPacks = new Set(this.itemsOf('pack').filter((i) => this.save.unlocks.includes(i.id)).map((i) => i.look && i.look.pack));
  }

  ownedHeroDefs() { return this.data.heroes.filter((h) => this.ownedPacks.has(h.pack)); }

  _applySettings() {
    const s = { ...DEFAULT_SETTINGS, ...(this.save.profile.settings || {}) };
    this.game.settings = s;
    this.audio.setEnabledPre = s.sound;
    this.audio.enabled = s.sound;
    this.audio.musicOn = s.music;
    this.game.input.samples = PHYS.releaseSamples;
  }

  setSetting(key, v) {
    this.game.settings[key] = v;
    this.save.profile.settings = { ...this.save.profile.settings, [key]: v };
    this.store.save();
    if (key === 'sound') this.audio.setEnabled(v);
    if (key === 'music') { this.audio.setMusic(v); this._beds(); }
    if (key === 'cvd') this.game.atlas.setMode(v);
    if (key === 'warmHands') this.game.table.heldScale = this.game.comfort('warmHands') ? 1.95 : 1.55;
    if (key === 'rain') this._beds();
  }

  _beds() {
    const g = this.game, A = this.audio;
    if (!A.ctx) return;
    const inLoad = ['drying', 'dump', 'play', 'sweep'].includes(g.state);
    const rush = inLoad && g.session && g.session.mode === 'rush';
    A.hum(A.musicOn && !rush, g.comfort('theHum'));
    A.pulse(A.musicOn && rush && g.state === 'play', g.session ? g.session.mult - 1 : 0);
    const station = this.save.equipped.radio;
    const look = station && this.item(station) && this.item(station).look;
    const want = A.musicOn && look ? look.station : null;
    // the Steady Rain station and the Rainy day setting share one rain bed; either keeps it running
    const rainSetting = !!(g.settings.rain && g.comfort('rain'));
    A.keepRain = rainSetting;
    A.rain(A.musicOn && (rainSetting || want === 'rain'));
    if (want !== A.station) A.radio(want);
  }

  // ---------- game hooks ----------
  _wireGame() {
    const g = this.game, ui = this.ui, A = this.audio;
    g.hooks.sfx = (n, p) => A.play(n, p);
    g.hooks.hint = (t) => ui.hint(t);
    g.hooks.state = (s, info) => this._onState(s, info);
    g.hooks.frame = (dt) => this._frame(dt);
    g.hooks.step = (dt) => this._step(dt);
    g.hooks.arc = (L) => g.render.setArc(L);
    g.hooks.settle = () => this.settleBasket();
    g.hooks.fault = () => { this.ui.hint('The pile got tangled, so this Load was put away. Open the dryer for a fresh one.', 5000); };
    g.hooks.fadeReshuffle = () => this.fadeReshuffle();
    g.hooks.looseSort = (pts) => this.looseSort(pts);
    g.hooks.match = (r, be) => {
      const wp = be.viewPose || g.physics.pose(be.id) || { x: 0, y: 0, z: 0 };
      const s = g.render.project(wp);
      if (!g.settings.reduceMotion) g.render.puff(wp, { color: 0xfff1d0, count: 16, speed: 0.22, size: 34 });
      if (r.reunion) { A.play('reunion'); ui.popup('Reunion!', s.x, s.y - 40); }
      if (g.session.mode === 'rush') ui.popup('x' + g.session.mult, s.x, s.y - 30);
      if (g.session.puppet > 0) this._puppetNext();
    };
    g.hooks.mismatch = () => { if (g.session.mode === 'laundry' && !this.save.seen.mismatchHint) { this.save.seen.mismatchHint = true; ui.hint('Not quite twins. Look at the cuff, the heel and the pattern.'); } };
    g.hooks.flip = () => {};
    g.hooks.binned = (e, r) => {
      const s = g.render.project(g.physics.pose(e.id) || { x: -0.27, y: 0.1, z: -0.74 });
      if (r.reunion) { A.play('reunion'); ui.popup('Reunion!', s.x, s.y - 30); }
      else ui.popup('Odd Bin', s.x, s.y - 20);
    };
    g.hooks.shot = (id, made, res, p) => {
      const s = g.render.project(p);
      if (made) {
        A.play('basket');
        g.haptic(25);
        g.render.bumpBasket();
        if (!g.settings.reduceMotion) g.render.puff({ x: p.x, y: p.y + 0.05, z: p.z }, { color: 0xf3e6cc, count: 12, speed: 0.3, size: 70 });
        if (res && res.long) ui.popup('Long shot', s.x, s.y - 30);
        else if (g.session.mode === 'laundry' && Math.random() < 0.35) ui.popup(['Nice', 'In', 'Swish', 'Tidy'][Math.floor(Math.random() * 4)], s.x, s.y - 30);
        if (g.session.sub === 'balance') this._balanceLanded(id, p);
      } else {
        A.play('land');
        if (g.session.mode === 'laundry' && !this.save.seen.missHint) { this.save.seen.missHint = true; ui.hint('Missed balls stay on the table. Pick one up and try again, or tap the basket.'); }
      }
      this._beds();
    };
  }

  _onState(s, info) {
    const g = this.game, ui = this.ui;
    if (s === 'drying' || s === 'dump') { ui.showHUD(false); this.screens.showRoom(false); }
    if (s === 'play') {
      ui.showHUD(true, g.session.mode);
      g.render.setView('table');
      if (g.session.mode === 'laundry' && !this.save.seen.firstTapHint) { this.save.seen.firstTapHint = true; ui.hint('Tap a sock to pick it up, then tap its twin.', 4200); }
      this._setupFog();
      if (g.session.sub === 'endless') this.feedT = 0;
    }
    if (s === 'sweep') {
      if (info && info.strays) ui.hint(`${info.strays} ${info.strays === 1 ? 'ball is' : 'balls are'} still on the table. Tap to pop them in.`, 2800);
    }
    if (s === 'results') { this._clearFog(); this._results(); }
    if (s === 'room') {
      // leaving a Load (pause menu, or a fault): the table HUD and its effects go with it
      ui.showHUD(false);
      ui.$('handGlow').classList.remove('on');
      this._clearFog();
      this.tipping = false;
    }
    this._beds();
  }

  _clearFog() { this.fog = []; this.game.render.setFog([]); }

  _frame(dt) {
    const g = this.game, S = g.session;
    if (S && (g.state === 'play' || g.state === 'sweep')) this.ui.updateHUD(S, { pocket: g.play.hand && g.play.hand.mode === 'pocket' });
    if (S && S.sub === 'balance') {
      const t = S.tilt * 0.35;
      this.tiltVis = (this.tiltVis || 0) + (t - (this.tiltVis || 0)) * Math.min(1, dt * 6);
      if (!this.tipping) g.render.setBasketTilt(0, this.tiltVis);
    }
    // fog puffs drift
    if (this.fog.length) {
      for (const f of this.fog) { f.x += f.vx * dt; f.z += f.vz * dt; if (Math.abs(f.x) > 0.32) f.vx *= -1; if (f.z < -0.3 || f.z > 0.45) f.vz *= -1; }
      g.render.setFog(S && S.fogCleared ? [] : this.fog);
    }
    // shot trails follow balls in the air
    if (g.render.trailKind && g.play.shots.size) {
      for (const id of g.play.shots.keys()) {
        const p = g.physics.pose(id);
        if (!p) continue;
        const v = g.physics.velocity(id);
        if (Math.hypot(v.x, v.y, v.z) > 0.6) { g.render.emitTrail(p, v); if (Math.random() < 0.5) g.render.emitTrail(p, v); }
      }
    }
    this.screens.frame(dt);
  }

  _step(dt) {
    const g = this.game, S = g.session;
    if (!S || g.state !== 'play') return;
    if (S.sub === 'endless') {
      this.feedT = (this.feedT || 0) + dt;
      if (this.feedT >= RUSH.feedEvery) { this.feedT = 0; this._feed(); }
    }
    if (S.sub === 'balance' && !this.tipping) g.physics.setBasketTilt(0, this.tiltVis || 0);
  }

  // ---------- starting Loads ----------
  showRoom() { this.screens.showRoom(true); }

  openDryer() {
    const s = this.save;
    if (!s.profile.seenHowTo) {
      this.ui.howTo(() => { s.profile.seenHowTo = true; this.store.save(); this.start({ mode: 'laundry', size: 'small' }); }, 'Start my first Load', { onCancel: () => this.showRoom() });
      return;
    }
    const unlocked = sizesUnlocked(s, this.data.clothesline);
    const next = ['regular', 'heavy', 'mountain'].find((k) => !unlocked.includes(k));
    const hintFor = { regular: 'Regular Loads hang on the Clothesline after 5 Loads.', heavy: 'Heavy Loads arrive after 20 Loads.', mountain: 'Mountain Loads arrive after 50 Loads.' };
    const today = localDateString();
    this.ui.modes({
      sizes: Object.keys(SIZES).map((k) => ({ key: k, name: SIZE_NAMES[k], pairs: SIZES[k] })),
      unlockedSizes: unlocked,
      sizeHints: next ? hintFor[next] : 'Every Load size is yours.',
      dailyPlayed: s.daily.date === today && s.daily.played,
      rushOpen: s.stats.loads >= 1,
      lastSize: s.profile.lastSize || 'regular',
    }, (pick) => this.start(pick));
  }

  start(pick) {
    const s = this.save, g = this.game;
    // directions before play (studio standard): each Rush variant explains itself once
    const howKey = pick.mode === 'rush' ? 'rushHow-' + (pick.daily ? 'daily' : pick.sub || 'timed') : null;
    if (howKey && !s.seen[howKey] && !this.params.has('load')) {
      this.ui.rushHow(pick.daily ? 'daily' : pick.sub || 'timed', () => { s.seen[howKey] = true; this.store.save(); this.start(pick); }, () => this.openDryer());
      return null;
    }
    this.lastPick = pick;
    s.profile.lastSize = pick.size;
    this.store.save();
    this.screens.showRoom(false);
    this.ui.closeSheet();
    this.fog = [];
    this.tipping = false;
    this.tiltVis = 0;
    g.render.setFog([]);
    const mode = pick.mode;
    let opts;
    if (pick.daily) {
      const date = localDateString();
      const load = dailyLoad(date, mode, { patternFirst: g.settings.patternFirst });
      opts = { load, mode, sub: pick.sub || null, daily: date };
      if (mode === 'rush') { s.daily = { ...s.daily, date, played: true, rushScore: null }; this.store.save(); }
    } else if (pick.sub === 'endless') {
      const seed = `endless|${Date.now()}|${Math.random()}`;
      const tier = tierNow(s, this.data.clothesline, 'rush');
      const pool = generateLoad({ seed, mode, sizeCount: 40, tier, heroes: this.ownedHeroDefs(), patternFirst: g.settings.patternFirst });
      // start with 12 pairs; the dryer feeds the rest two socks at a time
      const first = new Set(pool.pairs.slice(0, 12).map((p) => p.seed));
      const load = { ...pool, pairs: pool.pairs.slice(0, 12), socks: pool.socks.filter((x) => x.pair === null || x.pair < 12), tiles: [...first, ...pool.odd.map((o) => o.seed)] };
      this.endlessQueue = pool.pairs.slice(12).map((p, i) => ({ ...p, index: 12 + i }));
      opts = { load, mode, sub: 'endless' };
    } else {
      const tier = pick.tier !== undefined ? pick.tier : tierNow(s, this.data.clothesline, mode);
      opts = { mode, sub: pick.sub || null, size: pick.size || 'regular', tier, seed: pick.seed, oddBin: s.oddBin, heroes: this.ownedHeroDefs() };
    }
    const basket = this.equippedItem('basket');
    opts.basketScale = basket && basket.look && basket.look.radius ? basket.look.radius : 1;
    g.render.setBasketStyle(basket && basket.look);
    const ball = this.equippedItem('ball'), trail = this.equippedItem('trail');
    g.render.setBallStyle(ball && ball.look ? ball.look.roll : 'tight');
    g.render.setTrail(trail && trail.look ? trail.look.trail : null);
    // dryer models (DESIGN 9.5): the industrial one takes bigger Loads, the clothesline drops socks from
    // above one at a time, the portal dryer brings portal Loads once lore page 8 has been read
    const dryer = this.equippedItem('dryer');
    const model = dryer && dryer.look ? dryer.look.model : 'standard';
    opts.dropFromAbove = model === 'clothesline';
    if (!opts.load && !pick.daily) {
      if (model === 'industrial') opts.sizeCount = (SIZES[opts.size] || 20) + 5;
      if (model === 'portal' && s.lore.includes(8)) {
        const third = this.data.heroes.find((h) => h.source === 'portal');
        if (third) opts.portalHero = third.id;
      }
    }
    this.currentOpts = opts;
    g.render.setView('table');
    return g.startLoad(opts);
  }

  // ---------- results ----------
  _results() {
    const g = this.game, S = g.session, s = this.save;
    this.ui.showHUD(false);
    this.audio.duck(true);
    this.audio.play('results');
    const daily = this.currentOpts && this.currentOpts.daily;
    const out = applyResults(s, S, { now: Date.now(), clothesline: this.data.clothesline, lore: this.data.lore, heroes: this.data.heroes, unlocks: this.data.unlocks, daily: !!daily });
    if (daily && S.mode === 'rush') {
      s.daily.rushScore = S.stats.rushPoints;
      s.dailyHistory = [{ date: daily, score: S.stats.rushPoints, rare: rarest(S.load, 3) }, ...s.dailyHistory.filter((d) => d.date !== daily)].slice(0, 30);
    }
    if (daily && S.mode === 'laundry') s.daily.laundryPlays = (s.daily.date === daily ? s.daily.laundryPlays : 0) + 1;
    if (daily) s.dailyDays = [daily, ...(s.dailyDays || []).filter((d) => d !== daily)].slice(0, 400);
    this.store.save();
    this._refreshComforts();
    for (const p of out.pegs) { this.audio.play('peg'); }
    const title = (daily ? 'Daily Load, ' + prettyDate(daily) + '. ' : '') + (S.mode === 'laundry' ? `A ${SIZE_NAMES[S.load.size] || ''} Load, all put away.` : `Rush, ${({ timed: 'Timed', endless: 'Endless', balance: 'Basket Balance' })[S.sub] || 'Timed'}.`);
    this.lastResults = { out, title };
    this.ui.results({ session: S, out, title, daily: daily && S.mode === 'rush' }, {
      onAgain: () => { this.audio.duck(false); if (daily && S.mode === 'rush') this.start({ mode: 'laundry', size: 'regular' }); else this.start(this.lastPick || { mode: 'laundry', size: 'regular' }); },
      onRoom: () => { this.audio.duck(false); this.showRoom(); },
      onShare: () => this.shareDaily(S, daily),
      onLore: (id) => this.screens.lorePage(id, () => this._results2()),
    });
  }

  _results2() {
    // return from a lore page to the room (the results have been applied already)
    this.audio.duck(false);
    this.showRoom();
  }

  // ---------- pause ----------
  pause() {
    const g = this.game;
    if (g.state !== 'play' && g.state !== 'sweep') return;
    g.paused = true;
    this.ui.pauseMenu({
      onResume: () => { g.paused = false; },
      onLeave: () => { g.paused = false; g.abandonLoad(); this.showRoom(); },
      onSettings: () => this.openSettings(() => this.pause()),
      onHow: () => this.ui.howTo(() => { g.paused = false; }, 'Back to the table', { onCancel: () => { g.paused = false; } }),
    });
  }

  openSettings(after) {
    this.ui.settings(this.game.settings, {
      onChange: (k, v) => this.setSetting(k, v),
      onExport: () => exportJSON(this.save),
      onImport: async (text) => {
        const d = importJSON(text);
        this.save = await this.store.replace(d);
        this._afterSaveSwap();
        // the open sheet shows the imported settings (the status line is set by the caller after this returns)
        this.ui.onClose = null;
        this.openSettings(after);
      },
      onReset: async () => {
        const g = this.game;
        // a Load in progress ends without results, and the reset room is where the player lands
        if (g.state === 'play' || g.state === 'sweep' || g.state === 'dump' || g.state === 'drying') { g.paused = false; g.abandonLoad(); }
        const fresh = freshSave();
        // settings are about the player, not the progress: they stay
        fresh.profile.settings = { ...g.settings };
        fresh.profile.seenHowTo = this.save.profile.seenHowTo;
        this.save = await this.store.replace(fresh);
        this._afterSaveSwap();
        this.ui.onClose = null;
        this.ui.closeSheet();
        this.showRoom();
      },
      onClose: () => { if (after) after(); },
    });
  }

  _afterSaveSwap() {
    this._applySettings();
    const st = this.game.settings;
    this.audio.setEnabled(st.sound);
    this.audio.setMusic(st.music);
    this.game.atlas.setMode(st.cvd);
    this._refreshComforts();
    this.game.table.heldScale = this.game.comfort('warmHands') ? 1.95 : 1.55;
    this._beds();
    this.screens.refresh();
  }

  spreadButton() {
    const g = this.game;
    if (g.state !== 'play') return;
    const pts = [];
    for (let i = 0; i < 9; i++) pts.push({ x: -0.3 + i * 0.075, y: 0, z: -0.1 + Math.sin(i) * 0.25 });
    if (g.settings.reduceMotion) { this.fadeReshuffle(); return; }
    const n = g.physics.shake(pts, { x: 0.3, z: 0.2 }, 0.9);
    this.audio.play('shuffle', { bodies: n });
  }

  // reduce motion: the pile fades and reappears loosened, with no throw
  fadeReshuffle() {
    const g = this.game, P = g.physics;
    const socks = [...g.table.ents.values()].filter((e) => e.kind === 'sock' && e.state === 'table' && !e.inBin);
    const items = socks.map((e) => ({ id: e.id, silId: e.sock.silId, scale: e.sock.scale }));
    const obstacles = [];
    for (const e of g.table.ents.values()) {
      if (e.kind !== 'ball' || e.state !== 'table' || e.packed) continue;
      const p = P.pose(e.id);
      if (p && !P.inBasket(p, 0.02)) obstacles.push({ x: p.x, z: p.z, r: PHYS.ball.radius, h: p.y + PHYS.ball.radius });
    }
    for (const e of socks) { P.remove(e.id); g.play.unwatch(e.id); }
    P.dump(items, { seed: (Math.random() * 1e9) | 0, record: false, obstacles });
    for (const e of socks) { g.table.snapshotOne(e.id); e.fade = 1; }
    this.audio.play('shuffle', { bodies: 6 });
  }

  // Sorting by feel: a shake nudges look alike colours toward each other
  looseSort(pts) {
    const g = this.game, P = g.physics;
    const socks = [...g.table.ents.values()].filter((e) => e.kind === 'sock' && e.state === 'table' && !e.inBin);
    for (const e of socks) {
      const rec = P.get(e.id);
      if (!rec || rec.frozen) continue;
      const hue = decode(e.sock.seed).hue / 64;
      const tx = -0.3 + hue * 0.6;
      const t = rec.rb.translation();
      rec.rb.applyImpulse({ x: (tx - t.x) * rec.rb.mass() * 0.9, y: 0, z: 0 }, true);
    }
    void pts;
  }

  // ---------- Rush powers (DESIGN 4.2) ----------
  usePower(key) {
    const g = this.game, S = g.session, P = g.play;
    if (!this.powerReady(key)) { this.ui.hint('Not enough power dots yet. Every 5 pairs in a row earns one.'); return; }
    if (key === 'static') {
      const h = P.hand;
      if (!h || h.kind !== 'sock') { this.ui.hint('Pick up a sock first, then Static Cling pulls its twin out.'); return; }
      const mate = S.mateOf(h.id);
      if (mate === null) { this.ui.hint('This one has no twin on the table.'); return; }
      S.usePower('static');
      P.bringToHand(g.table.ents.get(mate));
    } else if (key === 'dryerSheet') {
      if (!this.fog.length || S.fogCleared) { this.ui.hint('There is no lint fog to clear.'); return; }
      S.usePower('dryerSheet');
    } else if (key === 'sockPuppet') {
      S.usePower('sockPuppet');
      this._puppetNext();
    } else if (key === 'spinCycle') {
      S.usePower('spinCycle');
      this.spinCycle();
    }
    this.audio.play('power');
  }

  // Sock Puppet: the next three pairs pair themselves and hop into the basket
  _puppetNext() {
    const g = this.game, S = g.session;
    if (S.puppet <= 0 || g.state !== 'play') return;
    const byKey = new Map();
    for (const s of S.socks.values()) if (s.state === 'table' && s.pair !== null) byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
    const pair = [...byKey.values()].find((v) => v.length === 2);
    if (!pair) { S.puppet = 0; return; }
    S.puppet--;
    const [a, b] = pair.map((id) => g.table.ents.get(id));
    for (const e of [a, b]) { g.physics.setGhost(e.id, true); g.play.unwatch(e.id); S.setState(e.id, 'hand'); }
    const mid = { x: 0, y: 0.35, z: 0.05, qx: 0, qy: 0, qz: 0, qw: 1, scale: 0.4 };
    let n = 0;
    const done = () => {
      if (++n < 2) return;
      const r = S.match(a.id, b.id, { auto: true });
      if (!r.ok) return;
      g.table.remove(a.id); g.table.remove(b.id);
      const be = g.table.addBallEntity({ id: r.ball, tile: a.sock.tile, key: S.ball(r.ball).key });
      g.physics.addBall(r.ball, { pos: { x: 0, y: 0.35, z: 0.05 } });
      be.state = 'table';
      be.pop = 1;
      this.audio.play('thwip');
      g.play.lob(be);
      g.later(0.5, () => this._puppetNext());
    };
    for (const e of [a, b]) g.play.flyBusy(e, { ...(e.drawn || g.physics.pose(e.id)), scale: 1 }, () => mid, 0.45, () => { e.state = 'held'; e.viewPose = mid; done(); }, { arc: 0.15 });
  }

  // Spin Cycle: the pile lifts and settles sorted by colour
  spinCycle() {
    const g = this.game, P = g.physics;
    const socks = [...g.table.ents.values()].filter((e) => e.kind === 'sock' && e.state === 'table' && !e.inBin);
    socks.sort((a, b) => (decode(a.sock.seed).hue - decode(b.sock.seed).hue) || a.sock.seed.localeCompare(b.sock.seed));
    // two columns of socks lying across the table, rows a sock's width apart, a second layer on top for big piles
    const rows = Math.max(1, Math.floor((TABLE.front - TABLE.playBack - 0.1) / 0.12));
    const perLayer = rows * 2;
    socks.forEach((e, i) => {
      const layer = Math.floor(i / perLayer), k = i % perLayer;
      const c = k % 2, r = Math.floor(k / 2);
      const target = { x: -0.19 + c * 0.38, y: 0.02 + layer * 0.035, z: TABLE.playBack + 0.06 + r * 0.12 + layer * 0.05, qx: 0, qy: 0, qz: 0, qw: 1, scale: 1 };
      P.setGhost(e.id, true);
      g.play.flyBusy(e, { ...(e.drawn || P.pose(e.id)), scale: 1 }, () => target, 0.9 + i * 0.01, () => {
        P.place(e.id, target, { x: target.qx, y: target.qy, z: target.qz, w: target.qw });
        P.setGhost(e.id, false);
        e.state = 'table';
        g.table.snapshotOne(e.id);
      }, { arc: 0.25 });
    });
  }

  // ---------- Basket Balance ----------
  _balanceLanded(id, p) {
    const g = this.game, S = g.session;
    if (this.tipping) return;
    const off = (p.x - BASKET.x) / g.physics.basketRadius;
    const tipped = S.addTilt(off);
    if (tipped) this.tipBasket();
    else if (Math.abs(S.tilt) > 0.6) this.ui.hint('The basket is leaning. Tap it to settle it (costs a streak point).');
  }

  settleBasket() {
    const S = this.game.session;
    if (!S || S.sub !== 'balance') return;
    S.settleBasket();
    this.audio.play('click');
  }

  tipBasket() {
    const g = this.game, S = g.session;
    this.tipping = true;
    this.audio.play('tip');
    this.ui.hint('The basket tipped over. Shoot those again.');
    g.play.unpackAll();
    const inside = [...S.balls.values()].filter((b) => b.state === 'basket').map((b) => b.id);
    const dir = Math.sign(this.tiltVis || 1);
    let t = 0;
    const anim = () => {
      t += 1 / 30;
      // keep the spilled balls awake while the basket turns over, so they fall out instead of riding it
      if (t < 1.4) for (const id of inside) g.physics.thaw(id);
      const a = t < 0.5 ? (t / 0.5) * 1.35 : t < 1.4 ? 1.35 : Math.max(0, 1.35 - (t - 1.4) * 2);
      g.render.setBasketTilt(0, dir * a);
      g.physics.setBasketTilt(0, dir * a);
      if (t < 2.2) g.later(1 / 30, anim);
      else { this.tipping = false; this.tiltVis = 0; }
    };
    anim();
    for (const id of inside) { g.physics.thaw(id); g.play.watchItem(id); }
    S.spill(inside);
  }

  // ---------- lint fog (DESIGN 4.2, 5: Rush tier 6 and up) ----------
  _setupFog() {
    const S = this.game.session;
    this.fog = [];
    if (!S || S.mode !== 'rush' || !S.load.fog) return;
    const r = rng32(7);
    for (let i = 0; i < 6; i++) this.fog.push({ x: (r() - 0.5) * 0.6, y: 0.14, z: -0.3 + r() * 0.75, s: 0.16 + r() * 0.08, vx: (r() - 0.5) * 0.02, vz: (r() - 0.5) * 0.02 });
    this.ui.hint('Lint fog drifts over the pile. A Dryer Sheet clears it.');
  }

  // ---------- Endless feed ----------
  _feed() {
    const g = this.game, S = g.session;
    if (!this.endlessQueue || !this.endlessQueue.length) return;
    if (g.physics.counts().total >= PHYS.bodyBudget) return;
    const p = this.endlessQueue.shift();
    const loadSock = { seed: p.seed, pair: p.index, odd: null, insideOut: false, hero: p.hero };
    // tiles: everything on the table and the balls you can still see in the basket keep theirs. Only when the
    // atlas is full does a packed ball (deep in the basket) give its tile up; it borrows a visible ball's look.
    const live = new Set([...S.socks.values()].filter((x) => x.state !== 'balled').map((x) => x.seed));
    for (const b of S.balls.values()) {
      const e = g.table.ents.get(b.id);
      if (b.state !== 'basket' || (e && !e.packed)) live.add(b.seed);
    }
    // (the atlas holds 64 designs: with that many in view, the dryer waits)
    if (live.size >= 63 && !live.has(p.seed)) { this.endlessQueue.unshift(p); return; }
    const { map } = g.atlas.assign([...live, p.seed]);
    const shown = [...S.balls.values()].map((b) => g.table.ents.get(b.id)).find((e) => e && !e.packed && g.atlas.slots[e.ball.tile] === S.ball(e.id).seed);
    for (const e of g.table.ents.values()) {
      if (e.kind !== 'ball' || !e.packed) continue;
      if (g.atlas.slots[e.ball.tile] !== S.ball(e.id).seed) e.ball.tile = shown ? shown.ball.tile : map.get(p.seed);
    }
    const sp = decode(p.seed);
    const hero = sp.hero && this.heroById(sp.hero);
    for (let k = 0; k < 2; k++) {
      const id = g.table.newId();
      S.addSock(id, loadSock);
      const sock = { id, seed: p.seed, silId: hero ? silIndex(hero.silhouette) : sp.silhouette, scale: sp.size === 1 && !sp.hero ? 0.82 : 1, tile: map.get(p.seed), insideOut: false, spec: sp };
      const e = g.table.addSockEntity(sock);
      g.physics.dropSock(id, sock.silId, { scale: sock.scale, rand: Math.random });
      e.state = 'table';
      g.table.snapshotOne(id);
      g.play.watchItem(id);
    }
    S.stats.fed += 2;
    this.audio.play('fly');
  }

  // ---------- Daily share card (DESIGN 9.7) ----------
  async shareDaily(S, date) {
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 1350;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 1350);
    g.addColorStop(0, '#f6eddc'); g.addColorStop(1, '#e9dcc0');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = '#4a3a2c';
    x.textAlign = 'center';
    x.font = '700 110px Fraunces, Georgia, serif';
    x.fillText('TUMBLE', 540, 190);
    x.font = '700 44px Nunito, sans-serif';
    x.fillText('Daily Rush, ' + prettyDate(date), 540, 270);
    x.font = '700 190px Fraunces, Georgia, serif';
    x.fillText(S.stats.rushPoints.toLocaleString(), 540, 520);
    x.font = '700 42px Nunito, sans-serif';
    x.fillStyle = '#7a6552';
    x.fillText(`${S.stats.matches} pairs, best streak ${S.bestStreak}`, 540, 600);
    x.fillText("The day's three rarest socks", 540, 760);
    const rare = rarest(S.load, 3);
    rare.forEach((seed, i) => {
      const sp = decode(seed);
      const f = renderFlat(this.tileBytes(seed), 256, sp.silhouette, { w: 260, h: 300 });
      const id = new ImageData(f.rgba, f.w, f.h);
      const tmp = document.createElement('canvas'); tmp.width = f.w; tmp.height = f.h;
      tmp.getContext('2d').putImageData(id, 0, 0);
      x.save();
      x.translate(210 + i * 330, 1000);
      x.rotate((i - 1) * 0.12);
      x.fillStyle = '#fbf5e9';
      x.fillRect(-150, -170, 300, 340);
      x.drawImage(tmp, -130, -150);
      x.restore();
    });
    x.font = '700 36px Nunito, sans-serif';
    x.fillStyle = '#7a6552';
    x.fillText('Sky Wolf Studio', 540, 1290);
    const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
    const file = new File([blob], `tumble_daily_${date.replace(/\D/g, '')}.png`, { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'TUMBLE Daily', text: `TUMBLE Daily, ${prettyDate(date)}: ${S.stats.rushPoints}` }); return; }
    } catch (e) { /* cancelled */ }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    this.ui.hint('Share card saved.');
  }

  devApi() {
    const api = this.game.devApi();
    const app = this;
    api.app = {
      save: () => JSON.parse(JSON.stringify(app.save)),
      data: () => ({ heroes: app.data.heroes.length, lore: app.data.lore.pages.length, unlocks: app.data.unlocks.items.length, pegs: app.data.clothesline.pegs.length }),
      openDryer: () => app.openDryer(),
      start: (p) => { app.start(p); return true; },
      grant: (what) => { Object.assign(app.save.economy, what.economy || {}); for (const u of what.unlocks || []) if (!app.save.unlocks.includes(u)) app.save.unlocks.push(u); for (const p of what.pegs || []) if (!app.save.clothesline.includes(p)) app.save.clothesline.push(p); Object.assign(app.save.stats, what.stats || {}); if (what.seenHowTo) app.save.profile.seenHowTo = true; app._refreshComforts(); app.store.save(); app.screens.refresh(); return true; },
      screen: (name, arg) => { app.screens.open(name, arg); return true; },
      ui: () => ({ sheetOpen: !!app.ui.open, title: app.ui.$('sheetTitle').textContent, hint: app.ui.$('hint').textContent }),
      powerReady: (k) => app.powerReady(k),
      usePower: (k) => { app.usePower(k); return true; },
      state: () => app.game.state,
    };
    return api;
  }
}

// '2026-09-17' -> 'September 17, 2026' (the ISO date is a key, never shown)
export function prettyDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

// rarity of a design for share cards: heroes first, then the fussier patterns and shapes
export function rarity(seed) {
  const sp = decode(seed);
  if (sp.hero) return 100;
  const fam = { solid: 1, stripe: 1, gradient: 2, polka: 2, heelToe: 2, chevron: 3, plaid: 3, argyle: 4, motifScatter: 4, fairIsle: 5 }[sp.family] || 1;
  const sil = { 3: 3, 7: 3, 5: 2, 4: 2, 6: 1 }[sp.silhouette] || 0;
  return fam * 3 + sil + (sp.condition ? 1 : 0) + (sp.cuffStyle >= 4 ? 1 : 0) + (sp.kid ? 1 : 0);
}

export function rarest(load, n) {
  const seeds = [...new Set(load.pairs.map((p) => p.seed))];
  return seeds.sort((a, b) => rarity(b) - rarity(a) || a.localeCompare(b)).slice(0, n);
}

export { sha256, specKey, owns, buy, canBuy, ownedHeroes, tierParams, THREE };
