/**
 * The Ringer referee. A pure state machine: it never touches physics, never
 * touches the DOM, and never draws anything. `game/ringer.js` runs the world and
 * feeds it what happened; this decides what that means.
 *
 * Real Ringer, with the house rules of DESIGN 8.3. Thirteen mibs in a cross,
 * first to pocket seven wins. Knock one out and you shoot again, which is the
 * rule that makes a good break worth a whole turn.
 *
 * A draw is impossible and that is arithmetic, not luck: thirteen mibs, seven to
 * win, and 7 + 7 is fourteen. Somebody gets there. The only way a game ends
 * without a winner is abandonment, which the pot returns from.
 */
import { clamp, sin, cos } from './dmath.js?v=20260904d';

export const PHASE = { LAG: 'lag', TURN: 'turn', SHOT: 'shot', RESOLVE: 'resolve', OVER: 'over' };

export const DEFAULT_HOUSE_RULES = {
  keepsies: true,
  slips: true,
  bombing: false,
  poison: false,
  ringSizeFt: 10,
  formation: 'cross'
};

/**
 * @param {{ringRadius:number, mibs:string[], players:{name:string,tawUid:string,ai?:object}[],
 *   houseRules?:object, skipLag?:boolean}} setup
 */
export function createMatch(setup) {
  const hr = Object.assign({}, DEFAULT_HOUSE_RULES, setup.houseRules || {});
  return {
    phase: PHASE.LAG,
    ringRadius: setup.ringRadius,
    houseRules: hr,
    mibs: setup.mibs.slice(),
    startingMibs: setup.mibs.length,
    toWin: setup.toWin || 7,
    players: setup.players.map((p, i) => ({
      index: i, name: p.name, tawUid: p.tawUid, ai: p.ai || null,
      pocketed: [], slipsLeft: hr.slips ? 1 : 0, poisonedOut: false,
      tawInside: false, placedThisTurn: false
    })),
    turn: 0,
    shotNumber: 0,
    firstShotOfTurn: true,
    shootAgain: false,
    winner: null,
    abandoned: false,
    log: []
  };
}

function say(M, type, data) {
  M.log.push(Object.assign({ type, turn: M.turn, shot: M.shotNumber }, data || {}));
  return M.log[M.log.length - 1];
}

/** The player whose turn it is. */
export function shooter(M) { return M.players[M.turn]; }

/** The other one. Two player Ringer only at launch. */
export function opponent(M) { return M.players[(M.turn + 1) % M.players.length]; }

/**
 * Lagging. Both roll at a line beyond the ring; closest to it WITHOUT crossing
 * shoots first. Crossing is worse than being short, which is the real rule and
 * the reason The Lag is a named technique worth earning.
 * @param {number[]} distances signed distance from the line, negative is short
 */
export function resolveLag(M, distances) {
  if (M.phase !== PHASE.LAG) throw new Error('ringer: lag out of phase (' + M.phase + ')');
  let best = -1, bestScore = -Infinity;
  for (let i = 0; i < distances.length; i++) {
    // short of the line scores by how close; past it is out of the lag entirely
    const s = distances[i] > 0 ? -Infinity : distances[i];
    if (s > bestScore) { bestScore = s; best = i; }
  }
  if (best < 0) best = 0;
  const margin = distances.length === 2 ? Math.abs(Math.abs(distances[0]) - Math.abs(distances[1])) : 0;
  M.turn = best;
  M.phase = PHASE.TURN;
  M.firstShotOfTurn = true;
  say(M, 'lag', { winner: best, distances: distances.slice(), margin });
  return best;
}

/** Skip the lag: the seeded match stream decides, which is still not a coin the player flips. */
export function skipLag(M, rng) {
  if (M.phase !== PHASE.LAG) throw new Error('ringer: lag out of phase (' + M.phase + ')');
  M.turn = rng.int(M.players.length);
  M.phase = PHASE.TURN;
  M.firstShotOfTurn = true;
  say(M, 'lag', { winner: M.turn, skipped: true });
  return M.turn;
}

/**
 * May this player place their taw on the ring edge before shooting? Yes on the
 * first shot of a turn, and yes any time their taw is not inside the ring: a taw
 * that rolled out on its own shot comes back to the edge, no penalty. That is
 * the real rule and it is why a hard break is not a punishment.
 */
export function mayPlace(M, playerIndex) {
  const p = M.players[playerIndex == null ? M.turn : playerIndex];
  return M.phase === PHASE.TURN && (M.firstShotOfTurn || !p.tawInside);
}

/** Record where the taw was put. `inside` is for the case where it never left. */
export function placeTaw(M, pos) {
  if (!mayPlace(M)) throw new Error('ringer: this taw may not be placed now');
  const p = shooter(M);
  p.placedThisTurn = true;
  p.tawInside = false;
  say(M, 'place', { player: p.index, x: pos.x, z: pos.z });
}

/**
 * The player let go. `aim` is the AimSource. A slip is DECLARED BY THE GAME, not
 * pressed by the player: the input layer sets `slipped` when the pointer left
 * the canvas during the sample window, which is a thumb sliding off the edge of
 * the screen and is the honest digital cousin of a knuckle slipping in the dirt.
 * If the house rule is on and the player has one left, the turn is handed back
 * and nothing was shot. It is pre commitment, there is no button, and it can
 * never be used to take back a shot that simply went badly.
 * @returns {{slipped:boolean, spentSlip:boolean}}
 */
export function fireShot(M, aim) {
  if (M.phase !== PHASE.TURN) throw new Error('ringer: shot out of phase (' + M.phase + ')');
  const p = shooter(M);
  if (aim && aim.slipped && M.houseRules.slips && p.slipsLeft > 0) {
    p.slipsLeft--;
    say(M, 'slip', { player: p.index, slipsLeft: p.slipsLeft });
    return { slipped: true, spentSlip: true };
  }
  M.phase = PHASE.SHOT;
  M.shotNumber++;
  say(M, 'shot', {
    player: p.index,
    power01: aim ? aim.power01 : null,
    offsetY: aim && aim.contactOffset ? aim.contactOffset.y : 0,
    offsetX: aim && aim.contactOffset ? aim.contactOffset.x : 0,
    wildness01: aim ? aim.wildness01 : 0,
    bomb: !!(aim && aim.bomb),
    knuckledDown: !!(aim && aim.knuckledDown),
    warmed: !!(aim && aim.warmed),
    slipped: !!(aim && aim.slipped),
    assist: aim ? aim.assist || null : null
  });
  return { slipped: !!(aim && aim.slipped), spentSlip: false };
}

/**
 * The physics stopped. Tell the referee what it left behind.
 * @param {{pocketed:string[], taws:{uid:string, inside:boolean, x:number, z:number}[],
 *   firstStruckUid?:string|null, tawRestDistanceToStruck?:number|null}} outcome
 */
export function resolveShot(M, outcome) {
  if (M.phase !== PHASE.SHOT) throw new Error('ringer: resolve out of phase (' + M.phase + ')');
  M.phase = PHASE.RESOLVE;
  const p = shooter(M);
  const foe = opponent(M);

  for (const t of outcome.taws) {
    const owner = M.players.find(pl => pl.tawUid === t.uid);
    if (owner) owner.tawInside = !!t.inside;
  }

  const pocketed = (outcome.pocketed || []).filter(uid => M.mibs.indexOf(uid) >= 0);
  for (const uid of pocketed) {
    M.mibs.splice(M.mibs.indexOf(uid), 1);
    p.pocketed.push(uid);
  }
  if (pocketed.length) say(M, 'pocket', { player: p.index, uids: pocketed.slice(), count: pocketed.length });

  // poison: knock the enemy taw out and it is out for the game, and you take one
  // of the mibs they had already pocketed
  let stolen = null;
  if (M.houseRules.poison && !foe.poisonedOut) {
    const foeTaw = outcome.taws.find(t => t.uid === foe.tawUid);
    if (foeTaw && !foeTaw.inside && wasKnockedOut(outcome, foe.tawUid)) {
      foe.poisonedOut = true;
      if (foe.pocketed.length) {
        stolen = foe.pocketed.pop();
        p.pocketed.push(stolen);
      }
      say(M, 'poison', { by: p.index, victim: foe.index, stolen });
    }
  }

  say(M, 'resolve', {
    player: p.index,
    pocketedThisShot: pocketed.length,
    firstStruckUid: outcome.firstStruckUid || null,
    tawRestDistanceToStruck: outcome.tawRestDistanceToStruck == null ? null : outcome.tawRestDistanceToStruck,
    mibsLeft: M.mibs.length
  });

  // win check before shoot again: pocketing the seventh ends it there and then
  for (const pl of M.players) {
    if (pl.pocketed.length >= M.toWin) {
      M.winner = pl.index;
      M.phase = PHASE.OVER;
      say(M, 'over', { winner: pl.index, pocketed: pl.pocketed.length });
      return { shootAgain: false, over: true, winner: pl.index };
    }
  }
  if (foe.poisonedOut && !M.mibs.length) {
    M.winner = p.pocketed.length >= foe.pocketed.length ? p.index : foe.index;
    M.phase = PHASE.OVER;
    say(M, 'over', { winner: M.winner, reason: 'ring empty' });
    return { shootAgain: false, over: true, winner: M.winner };
  }

  M.shootAgain = pocketed.length > 0;
  if (M.shootAgain) {
    M.phase = PHASE.TURN;
    M.firstShotOfTurn = false;
    say(M, 'shootAgain', { player: p.index });
  } else {
    passTurn(M);
  }
  return { shootAgain: M.shootAgain, over: false, winner: null };
}

/** The struck taw left the ring on somebody else's shot, which is what poison needs. */
function wasKnockedOut(outcome, uid) {
  if (!outcome.knockedOut) return true; // the caller did not distinguish; the taw is out, take it
  return outcome.knockedOut.indexOf(uid) >= 0;
}

function passTurn(M) {
  let n = M.turn;
  for (let i = 0; i < M.players.length; i++) {
    n = (n + 1) % M.players.length;
    if (!M.players[n].poisonedOut) break;
  }
  M.turn = n;
  M.firstShotOfTurn = true;
  M.shootAgain = false;
  M.phase = PHASE.TURN;
  for (const p of M.players) p.placedThisTurn = false;
  say(M, 'turnPassed', { player: M.turn });
}

/** Abandon. The pot returns; nobody wins. */
export function abandon(M) {
  M.phase = PHASE.OVER;
  M.abandoned = true;
  M.winner = null;
  say(M, 'abandon', {});
}

/** A one line summary for the results card and for the CSV. */
export function summary(M) {
  return {
    winner: M.winner,
    abandoned: M.abandoned,
    shots: M.shotNumber,
    pocketed: M.players.map(p => p.pocketed.length),
    slipsLeft: M.players.map(p => p.slipsLeft),
    poisonedOut: M.players.map(p => p.poisonedOut),
    mibsLeft: M.mibs.length
  };
}

/** Where on the ring edge a taw may be placed, given an angle. Used by both the UI drag and the AI. */
export function edgePosition(M, angleRad) {
  return { x: sin(angleRad) * M.ringRadius, z: cos(angleRad) * M.ringRadius };
}

/** How many more this player needs. Shown as sockets, never as a number alone. */
export function needed(M, playerIndex) {
  return clamp(M.toWin - M.players[playerIndex].pocketed.length, 0, M.toWin);
}
