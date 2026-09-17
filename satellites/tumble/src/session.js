// The rules of one Load in play (DESIGN 3, 4). Pure: no DOM, no physics, no three.js,
// so Node can drive a whole Load (DESIGN 15.5) exactly the way the table does.

import { decode, specKey } from '../engine/sockgen.js';

export const RUSH = {
  perPairBase: 6,      // Timed: 6 s per pair for Regular (DESIGN 4.2)
  perPairStep: 0.3,    // minus 0.3 s per tier
  perPairFloor: 3,
  perOdd: 3,           // a little time for each odd sock
  endlessStart: 40,
  endlessBonus: 4,     // each basketed pair +4 s
  feedEvery: 5,        // the dryer feeds 2 socks per 5 s
  streakStep: 3,       // +1 multiplier per 3 consecutive correct pairs
  maxMult: 5,
  dotEvery: 5,         // 1 power dot per 5 streak
  maxDots: 8,
  longShot: 0.75,      // m: a shot from beyond this counts as long (+25%)
  powers: { static: 2, dryerSheet: 2, sockPuppet: 4, spinCycle: 3 },
  tipAt: 1,            // Basket Balance tips at |tilt| >= 1
};

export class Session {
  constructor(load, opts = {}) {
    this.load = load;
    this.mode = load.mode || 'laundry';
    this.sub = opts.sub || (this.mode === 'rush' ? 'timed' : null);
    this.socks = new Map();
    this.balls = new Map();
    this.phase = 'play';
    this.nextBall = 100000;
    this.events = [];
    this.stats = {
      matches: 0, mismatches: 0, shotsMade: 0, shotsMissed: 0, tapShots: 0, longShots: 0,
      flips: 0, binned: 0, wrongBins: 0, reunions: [], unflippedBalled: 0, insideOutTotal: 0,
      swept: 0, strays: 0, cleanLoad: false, pairsBasketed: 0, rushPoints: 0, powersUsed: 0, fed: 0,
    };
    // Rush state
    this.streak = 0;        // consecutive correct pairs
    this.bestStreak = 0;
    this.mult = 1;
    this.dots = 0;
    this.tilt = 0;          // Basket Balance
    this.tips = 0;
    this.timeLeft = 0;
    this.elapsed = 0;
    this.puppet = 0;        // Sock Puppet pairs left
    this.fogCleared = false;
  }

  // ---------- setup ----------
  addSock(id, s) {
    const spec = decode(s.seed);
    const rec = { id, seed: s.seed, key: specKey(spec), pair: s.pair, odd: s.odd, reunion: !!s.reunion, hero: s.hero || null, insideOut: !!s.insideOut, wasInsideOut: !!s.insideOut, flipped: false, state: 'table' };
    if (rec.insideOut) this.stats.insideOutTotal++;
    this.socks.set(id, rec);
    return rec;
  }

  startClock() {
    if (this.mode !== 'rush') return;
    const pairs = this.load.pairs.length, odd = this.load.odd.length;
    if (this.sub === 'endless') this.timeLeft = RUSH.endlessStart;
    else {
      const per = Math.max(RUSH.perPairFloor, RUSH.perPairBase - RUSH.perPairStep * this.load.tier);
      this.timeLeft = pairs * per + odd * RUSH.perOdd;
    }
    this.timeTotal = this.timeLeft;
  }

  // ---------- queries ----------
  sock(id) { return this.socks.get(id); }
  ball(id) { return this.balls.get(id); }
  unresolvedSocks() { let n = 0; for (const s of this.socks.values()) if (s.state !== 'balled' && s.state !== 'binned') n++; return n; }
  pairsLeft() {
    const keys = new Set();
    for (const s of this.socks.values()) if (s.pair !== null && s.pair !== undefined && s.state !== 'balled') keys.add(s.key);
    return keys.size;
  }
  oddLeft() { let n = 0; for (const s of this.socks.values()) if ((s.odd !== null && s.odd !== undefined) && s.state !== 'binned' && s.state !== 'balled') n++; return n; }
  ballsLoose() { let n = 0; for (const b of this.balls.values()) if (b.state !== 'basket') n++; return n; }
  strays() { return [...this.balls.values()].filter((b) => b.state === 'table'); }
  // mate of a sock still somewhere on the table (Static Cling, Odd eye, hints)
  mateOf(id) {
    const s = this.socks.get(id);
    if (!s) return null;
    for (const o of this.socks.values()) if (o.id !== id && o.key === s.key && (o.state === 'table')) return o.id;
    return null;
  }
  isPlayDone() {
    if (this.phase !== 'play') return false;
    if (this.mode === 'rush' && this.sub === 'endless') return this.timeLeft <= 0;
    if (this.mode === 'rush' && this.timeLeft <= 0) return true;
    if (this.unresolvedSocks() > 0) return false;
    for (const b of this.balls.values()) if (b.state === 'hand' || b.state === 'flying') return false;
    return true;
  }

  _log(type, data) { this.events.push({ type, t: this.elapsed, ...data }); }

  // ---------- actions ----------
  setState(id, state) { const s = this.socks.get(id) || this.balls.get(id); if (s) s.state = state; }

  flip(id) {
    const s = this.socks.get(id);
    if (!s || !s.insideOut) return false;
    s.insideOut = false;
    s.flipped = true;
    this.stats.flips++;
    this._log('flip', { id });
    return true;
  }

  // Two socks meet in the hand (DESIGN 3.1, 3.2).
  match(a, b, opts = {}) {
    const A = this.socks.get(a), B = this.socks.get(b);
    if (!A || !B || a === b || A.state === 'balled' || B.state === 'balled' || A.state === 'binned') return { ok: false, reason: 'gone' };
    if (A.key !== B.key) {
      this.stats.mismatches++;
      this._breakStreak('mismatch');
      this._log('mismatch', { a, b });
      return { ok: false, reason: 'mismatch' };
    }
    A.state = 'balled'; B.state = 'balled';
    const unflipped = (A.insideOut ? 1 : 0) + (B.insideOut ? 1 : 0);
    this.stats.unflippedBalled += unflipped;
    this.stats.matches++;
    const reunion = A.reunion || B.reunion || opts.reunion;
    if (reunion) this._reunion(A.reunion ? A : B, opts.binSeed);
    const id = this.nextBall++;
    const ball = { id, key: A.key, seed: A.seed, hero: A.hero, socks: [a, b], state: 'hand', shots: 0, auto: !!opts.auto };
    this.balls.set(id, ball);
    this._correctPair();
    this._log('match', { a, b, ball: id, reunion: !!reunion });
    return { ok: true, ball: id, reunion: !!reunion };
  }

  // A sock goes to the Odd Bin (DESIGN 9.3). Only socks with no mate on the table belong there.
  bin(id) {
    const s = this.socks.get(id);
    if (!s || s.state === 'balled' || s.state === 'binned') return { ok: false, reason: 'gone' };
    if (s.odd === null || s.odd === undefined) {
      this.stats.wrongBins++;
      this._breakStreak('wrongBin');
      this._log('wrongBin', { id });
      return { ok: false, reason: 'hasMate' };
    }
    s.state = 'binned';
    if (s.insideOut) this.stats.unflippedBalled++;
    this.stats.binned++;
    if (s.reunion) {
      // its mate was already waiting in the Bin: they meet (DESIGN 9.3)
      this._reunion(s);
      this._log('bin', { id, reunion: true });
      return { ok: true, reunion: true };
    }
    this._log('bin', { id, reunion: false });
    return { ok: true, reunion: false };
  }

  _reunion(s) {
    if (this.stats.reunions.some((r) => r.seed === s.seed)) return;
    this.stats.reunions.push({ seed: s.seed, hero: s.hero });
  }

  // A ball leaves the hand (flick or tap). The table reports how it ended with shotResult.
  shoot(ballId, { tap = false, distance = 0 } = {}) {
    const b = this.balls.get(ballId);
    if (!b) return;
    b.state = 'flying';
    b.shots++;
    b.tap = tap;
    b.distance = distance;
  }

  shotResult(ballId, made) {
    const b = this.balls.get(ballId);
    if (!b || b.state !== 'flying') return null;
    if (made) {
      b.state = 'basket';
      this.stats.shotsMade++;
      this.stats.pairsBasketed++;
      if (b.tap) this.stats.tapShots++;
      const long = !b.tap && b.distance >= RUSH.longShot;
      b.long = long;
      if (long) this.stats.longShots++;
      if (this.mode === 'rush') {
        const pts = Math.round(100 * this.mult * (long ? 1.25 : 1));
        this.stats.rushPoints += pts;
        b.points = pts;
        if (this.sub === 'endless') this.timeLeft += RUSH.endlessBonus;
      }
      this._log('made', { ball: ballId, long });
      return { made: true, long };
    }
    b.state = 'table';
    this.stats.shotsMissed++;
    this._breakStreak('miss');
    this._log('missed', { ball: ballId });
    return { made: false };
  }

  pickUpBall(ballId) {
    const b = this.balls.get(ballId);
    if (b && b.state === 'table') b.state = 'hand';
  }

  dropBall(ballId) {
    const b = this.balls.get(ballId);
    if (b && (b.state === 'hand' || b.state === 'flying')) b.state = 'table';
  }

  // ---------- streaks, multiplier, power dots (DESIGN 4.2) ----------
  _correctPair() {
    if (this.mode !== 'rush') return;
    this.streak++;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.mult = Math.min(RUSH.maxMult, 1 + Math.floor(this.streak / RUSH.streakStep));
    // dots count their own run, so settling the basket (which lowers the streak) never pays twice
    this.dotRun = (this.dotRun || 0) + 1;
    if (this.dotRun >= RUSH.dotEvery) { this.dotRun = 0; this.dots = Math.min(RUSH.maxDots, this.dots + 1); }
  }

  _breakStreak(why) {
    if (this.mode !== 'rush') return;
    if (this.streak > 0) this._log('streakBroken', { why, was: this.streak });
    this.streak = 0;
    this.dotRun = 0;
    this.mult = 1;
  }

  canPower(name) { return this.mode === 'rush' && this.dots >= RUSH.powers[name]; }

  usePower(name) {
    if (!this.canPower(name)) return false;
    this.dots -= RUSH.powers[name];
    this.stats.powersUsed++;
    if (name === 'sockPuppet') this.puppet += 3;
    if (name === 'dryerSheet') this.fogCleared = true;
    this._log('power', { name });
    return true;
  }

  // Basket Balance (DESIGN 4.2): each ball adds tilt biased by where it landed.
  addTilt(offsetX) {
    const k = 0.08 + Math.min(0.5, Math.abs(offsetX) * 3.2);
    this.tilt += Math.sign(offsetX || (Math.random() - 0.5)) * k;
    if (Math.abs(this.tilt) >= RUSH.tipAt) { this.tips++; this.tilt = 0; this._breakStreak('tipped'); return true; }
    return false;
  }

  settleBasket() {
    if (this.streak > 0) this.streak--;
    this.mult = Math.min(RUSH.maxMult, 1 + Math.floor(this.streak / RUSH.streakStep));
    this.tilt *= 0.15;
    this._log('settle', {});
  }

  // A tipped basket: its balls spill and must be shot again.
  spill(ids) {
    for (const id of ids) {
      const b = this.balls.get(id);
      if (b && b.state === 'basket') {
        b.state = 'table';
        this.stats.pairsBasketed--;
        this.stats.shotsMade--;
        this.stats.shotsMissed++;
        // a spilled ball is scored again when it goes back in, so its first score comes off
        this.stats.rushPoints -= b.points || 0;
        if (b.tap) this.stats.tapShots--;
        if (b.long) this.stats.longShots--;
        b.points = 0;
      }
    }
  }

  tick(dt) {
    this.elapsed += dt;
    if (this.mode === 'rush' && this.phase === 'play') this.timeLeft = Math.max(0, this.timeLeft - dt);
  }

  // ---------- sweep and results (DESIGN 3.3) ----------
  startSweep() {
    this.phase = 'sweep';
    const strays = this.strays();
    this.stats.strays = strays.length;
    this.stats.cleanLoad = strays.length === 0 && this.stats.pairsBasketed > 0;
    // anything still unresolved when a Rush clock ran out stays where it is
    return strays.map((b) => b.id);
  }

  sweep(ballId) {
    const b = this.balls.get(ballId);
    if (!b || b.state !== 'table') return false;
    b.state = 'basket';
    this.stats.swept++;
    return true;
  }

  finish() {
    this.phase = 'results';
    for (const b of this.balls.values()) if (b.state === 'table' || b.state === 'hand' || b.state === 'flying') { b.state = 'basket'; this.stats.swept++; }
  }

  // Tidy rating (DESIGN 4.1): zero misses, and every inside out sock flipped.
  tidy() {
    const noMiss = this.stats.shotsMissed === 0;
    const allFlipped = this.stats.unflippedBalled === 0;
    if (noMiss && allFlipped) return 'spotless';
    if (noMiss || allFlipped) return 'tidy';
    return 'lived-in';
  }

  pairsCompleted() { return this.stats.matches; }
}
