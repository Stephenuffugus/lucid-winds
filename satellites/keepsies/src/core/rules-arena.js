/**
 * The Arena referee. DESIGN 9.
 *
 * A pure state machine, exactly like the Ringer one: it never touches physics,
 * never touches the DOM and never draws anything. `game/arena.js` runs the world
 * and feeds it what happened; this decides what that means.
 *
 * Turn based one against one. You win by SHATTERING all three of their marbles,
 * or by leaving them with no legal marble to play. Rung out marbles come back,
 * shattered ones do not, and those are the two win textures of DESIGN 9.7.
 *
 * ⛔ THE ARENA IS A DEVELOPING SITUATION. Positions, integrity, floor states and
 * hazard counters all persist between turns (DESIGN 9.1). Nothing resets at the
 * top of a turn except whose turn it is, which is why a hazard indicator can
 * promise "piston fires in 1 turn" and be believed.
 *
 * ⛔ HAZARDS ARE TURN CYCLE DETERMINISTIC, NEVER WALL CLOCK. DESIGN 9.2 says so
 * twice. A hazard that fires on a timer cannot be read, and a hazard that cannot
 * be read is not a decision, it is weather.
 *
 * ⛔ ONE POSITIONING ACT PER TURN, AND IT COSTS. Swap brings a benched marble in
 * with no attack momentum this turn, and DESIGN 9.2 is explicit that this IS the
 * cost. Re perch shifts the rack a slot and changes where you enter later.
 */
import { tierOf, applyHit, ringOut, chargeFor, addCharge } from './damage.js?v=20260904c';
import { shouldFire } from './specials.js?v=20260904c';

export const PHASE = { READ: 'read', ACT: 'act', SHOT: 'shot', RESOLVE: 'resolve', OVER: 'over' };
export const ACT = { NONE: 'none', SWAP: 'swap', REPERCH: 'reperch' };

/**
 * @param {{players:{name:string,ai?:object,bag:object[]}[], arena:string,
 *   rackSlots?:number, ranked?:boolean, tuning:object}} setup
 */
export function createMatch(setup) {
  if (!setup.tuning) throw new Error('arena: createMatch needs the tuning, every number lives there');
  const M = {
    tuning: setup.tuning,
    arena: setup.arena || 'ring',
    ranked: !!setup.ranked,
    phase: PHASE.READ,
    turn: 0,
    turnNumber: 1,
    log: [],
    hazardCycle: 0,
    players: setup.players.map((p, i) => ({
      index: i,
      name: p.name,
      ai: p.ai || null,
      bag: p.bag,                       // three marbles, from damage.freshMarble
      active: null,                     // the uid in the arena right now
      rackSlot: 0,                      // where a swapped marble enters
      actedThisTurn: ACT.NONE,
      enteredThisTurn: false,
      shatteredThisMatch: 0
    })),
    winner: null,
    over: false
  };
  // each side rolls its first marble in before anybody shoots
  for (const p of M.players) enter(M, p, p.bag[0].uid, { first: true });
  return M;
}

const say = (M, kind, data) => { M.log.push(Object.assign({ kind: kind, turn: M.turnNumber }, data)); };

export function player(M, i) { return M.players[i]; }
export function shooter(M) { return M.players[M.turn]; }
export function foe(M) { return M.players[(M.turn + 1) % M.players.length]; }
export function marbleOf(p, uid) { return p.bag.find(m => m.uid === uid) || null; }
export function activeOf(M, p) { return p.active ? marbleOf(p, p.active) : null; }

/** Marbles that could still be played: not shattered. Rung out ones count. */
export function legalMarbles(p) { return p.bag.filter(m => !m.shattered); }

/**
 * Roll a marble into the arena.
 * ⛔ It enters with NO ATTACK MOMENTUM this turn, which DESIGN 9.2 names as the
 * cost of a swap. The flag is read by the shot, not by this.
 */
function enter(M, p, uid, opts) {
  const m = marbleOf(p, uid);
  if (!m || m.shattered) return false;
  if (p.active) {
    const out = marbleOf(p, p.active);
    if (out) out.benched = true;
  }
  m.benched = false;
  m.justEntered = true;
  p.active = uid;
  p.enteredThisTurn = !(opts && opts.first);
  say(M, 'enter', { player: p.index, uid: uid, first: !!(opts && opts.first) });
  return true;
}

/**
 * The optional positioning act. One per turn, and only in the ACT phase.
 * @returns {{ok:boolean, reason:string}}
 */
export function act(M, kind, arg) {
  if (M.phase !== PHASE.READ && M.phase !== PHASE.ACT) {
    return { ok: false, reason: 'You can only reposition before the shot.' };
  }
  const p = shooter(M);
  if (p.actedThisTurn !== ACT.NONE) return { ok: false, reason: 'One move a turn.' };
  if (kind === ACT.SWAP) {
    const target = marbleOf(p, arg);
    if (!target) return { ok: false, reason: 'That marble is not in your bag.' };
    if (target.shattered) return { ok: false, reason: 'That one is gone.' };
    if (target.uid === p.active) return { ok: false, reason: 'That one is already out there.' };
    enter(M, p, target.uid);
    p.actedThisTurn = ACT.SWAP;
    M.phase = PHASE.ACT;
    return { ok: true, reason: '' };
  }
  if (kind === ACT.REPERCH) {
    const slots = 3;
    p.rackSlot = ((arg == null ? p.rackSlot + 1 : arg) % slots + slots) % slots;
    p.actedThisTurn = ACT.REPERCH;
    M.phase = PHASE.ACT;
    say(M, 'reperch', { player: p.index, slot: p.rackSlot });
    return { ok: true, reason: '' };
  }
  return { ok: false, reason: 'That is not a move.' };
}

/** The shot is taken. The referee only notes that it happened. */
export function fireShot(M) {
  if (M.phase === PHASE.OVER) throw new Error('arena: a shot after the match ended');
  const p = shooter(M);
  const m = activeOf(M, p);
  if (!m) return { ok: false, reason: 'You have nothing in the arena.' };
  M.phase = PHASE.SHOT;
  return { ok: true, reason: '', noMomentum: p.enteredThisTurn };
}

/**
 * What the physics saw. `outcome` carries the contacts in the order they
 * happened, any ring outs, and any hazard damage, and this turns that into
 * integrity, charge, actives and a winner.
 *
 * @param {object} M
 * @param {{contacts:{attacker:string,defender:string,relSpeed:number}[],
 *          rails:number, ringOuts:string[], hazard:{uid:string,dmg:number}[],
 *          nearest:Object<string,number>}} outcome
 */
export function resolveShot(M, outcome) {
  if (M.phase !== PHASE.SHOT) throw new Error('arena: resolve out of phase (' + M.phase + ')');
  M.phase = PHASE.RESOLVE;
  const p = shooter(M);
  const o = foe(M);
  const events = [];

  const find = (uid) => {
    for (const pl of M.players) { const m = marbleOf(pl, uid); if (m) return { pl: pl, m: m }; }
    return null;
  };
  const alone = (pl) => legalMarbles(pl).length === 1;

  for (const c of (outcome.contacts || [])) {
    const A = find(c.attacker), B = find(c.defender);
    if (!A || !B || B.m.shattered) continue;
    if (A.pl.index === B.pl.index) continue;          // your own marbles do not damage each other
    B.m.enemyContacts = (B.m.enemyContacts || 0) + 1;
    A.m.enemyContacts = (A.m.enemyContacts || 0) + 1;
    const r = applyHit(A.m, B.m, c.relSpeed, {
      attackerAlone: alone(A.pl), defenderAlone: alone(B.pl)
    }, M.tuning);
    events.push({ kind: 'hit', attacker: A.m.uid, defender: B.m.uid, dmg: r.dmg,
      tier: r.tierAfter, shattered: r.shattered, byBonus: r.byBonus });
    if (r.shattered) {
      B.pl.shatteredThisMatch += 1;
      // vengeance is a plan, so a bagmate's death is a fact the others can read
      for (const mate of B.pl.bag) if (mate.uid !== B.m.uid) mate.bagmateShattered = true;
      if (B.pl.active === B.m.uid) B.pl.active = null;
      say(M, 'shatter', { player: B.pl.index, uid: B.m.uid, byBonus: r.byBonus });
    }
  }

  for (let i = 0; i < (outcome.rails || 0); i++) {
    const m = activeOf(M, p);
    if (m) addCharge(m, chargeFor('rail', 0, alone(p), M.tuning), M.tuning);
  }

  for (const h of (outcome.hazard || [])) {
    const H = find(h.uid);
    if (!H || H.m.shattered) continue;
    H.m.integrity = Math.max(0, H.m.integrity - h.dmg);
    if (H.m.integrity <= 0) {
      H.m.shattered = true;
      H.pl.shatteredThisMatch += 1;
      if (H.pl.active === H.m.uid) H.pl.active = null;
      say(M, 'shatter', { player: H.pl.index, uid: H.m.uid, hazard: true });
    }
    events.push({ kind: 'hazard', uid: h.uid, dmg: h.dmg, tier: tierOf(H.m.integrity, M.tuning) });
  }

  /* ⛔ A RUNG OUT MARBLE KEEPS ITS INTEGRITY and a fresh one enters immediately at
     full, which is what makes ring out the safer and less permanent texture. */
  for (const uid of (outcome.ringOuts || [])) {
    const R = find(uid);
    if (!R || R.m.shattered) continue;
    ringOut(R.m);
    say(M, 'ringout', { player: R.pl.index, uid: uid, integrity: R.m.integrity });
    if (R.pl.active === uid) {
      R.pl.active = null;
      const fresh = R.pl.bag.find(m => !m.shattered && m.uid !== uid && m.integrity === 100);
      const any = fresh || R.pl.bag.find(m => !m.shattered && m.uid !== uid);
      if (any) enter(M, R.pl, any.uid, { first: true });
    }
  }

  // the actives, after everything else, because they read the state they land in
  for (const pl of M.players) {
    const m = activeOf(M, pl);
    if (!m) continue;
    const facts = {
      integrity: m.integrity,
      charge: m.charge,
      enemyContacts: m.enemyContacts || 0,
      touchedRail: (outcome.rails || 0) > 0 && pl.index === p.index,
      nearestEnemyM: (outcome.nearest && outcome.nearest[m.uid] != null) ? outcome.nearest[m.uid] : 99,
      bagmateShattered: !!m.bagmateShattered,
      justEntered: !!m.justEntered,
      tier: tierOf(m.integrity, M.tuning)
    };
    const fire = shouldFire(m, facts, M.tuning);
    if (fire.fires) {
      m.firedActive = true;
      m.charge = 0;
      events.push({ kind: 'active', uid: m.uid, why: fire.why });
      say(M, 'active', { player: pl.index, uid: m.uid, why: fire.why });
    }
  }

  checkOver(M);
  if (!M.over) endTurn(M);
  return { events: events, over: M.over, winner: M.winner };
}

/** Warming charge, the hazard cycle, and the turn passing. */
export function endTurn(M) {
  const p = shooter(M);
  const m = activeOf(M, p);
  if (m) addCharge(m, chargeFor('warm', 0, legalMarbles(p).length === 1, M.tuning), M.tuning);
  for (const pl of M.players) {
    for (const b of pl.bag) {
      if (b.benched && !b.shattered && b.bioluminous) {
        addCharge(b, chargeFor('benchedBioluminous', 0, false, M.tuning), M.tuning);
      }
      b.justEntered = false;
    }
    pl.actedThisTurn = ACT.NONE;
    pl.enteredThisTurn = false;
  }
  /* ⛔ NOBODY EVER STANDS IN AN EMPTY ARENA. DESIGN 9.1 gives each player one
     active marble, and when that marble shatters the next legal one rolls in by
     itself: the CHOICE of which marble is the swap, not whether to have one. The
     gate found this by shattering an active and then asking that player to shoot,
     which threw rather than played. It enters with no attack momentum, the same
     as any other entry, because it did not choose to be there either. */
  for (const pl of M.players) {
    if (pl.active) continue;
    const next = pl.bag.find(b => !b.shattered);
    if (next) enter(M, pl, next.uid);
  }
  M.turn = (M.turn + 1) % M.players.length;
  if (M.turn === 0) { M.turnNumber += 1; M.hazardCycle += 1; }
  M.phase = PHASE.READ;
}

/**
 * ⛔ TWO WAYS TO LOSE, AND ONLY TWO. All three shattered, or no legal marble to
 * play. A player whose marbles are all rung out has NOT lost, because rung out
 * marbles come back: that is the whole difference between the textures.
 */
export function checkOver(M) {
  for (const pl of M.players) {
    if (legalMarbles(pl).length === 0) {
      M.over = true;
      M.phase = PHASE.OVER;
      M.winner = (pl.index + 1) % M.players.length;
      say(M, 'over', { winner: M.winner, loser: pl.index });
      return true;
    }
  }
  return false;
}

/** How many turns a hazard has before it fires again, for the indicator. */
export function hazardIn(M, everyTurns) {
  const n = everyTurns || 2;
  return n - (M.hazardCycle % n);
}

export function summary(M) {
  return {
    winner: M.winner,
    turns: M.turnNumber,
    arena: M.arena,
    players: M.players.map(p => ({
      name: p.name,
      shattered: p.shatteredThisMatch,
      left: legalMarbles(p).length,
      integrity: p.bag.map(m => Math.round(m.integrity))
    }))
  };
}
