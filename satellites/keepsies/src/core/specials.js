/**
 * The programmed actives. DESIGN 9.5.
 *
 * ⛔ ACTIVES NEVER HAVE BUTTONS. Before the match a player picks ONE condition per
 * marble, and the active fires by itself when the meter is full AND the condition
 * is met. The meter is public and the condition is secret, so the whole mind game
 * is watching a marble overglow and guessing what it is waiting for.
 *
 * ⛔ SIX SHIP, NOT SEVEN. DESIGN 9.5 lists seven and says so in its own margin:
 * "cut `on rail` OR `Nth contact` if playtest shows condition-guessing is too
 * diffuse; ship max 6." `onRail` is the one held back, because it is the only one
 * a player cannot deliberately arrange for their opponent to walk into: `Nth
 * contact` is the aggressive read, `close range` is the positional one, and both
 * reward a plan. The seventh is written here, marked, and not in `SHIPPED`.
 *
 * ⛔ A CONDITION IS A PURE PREDICATE OVER A FACT SHEET. It never reads the world,
 * never reads a clock and never mutates anything, so `condition_matrix` can sweep
 * every condition against every event without a physics step.
 */

/**
 * @typedef {object} ArenaFacts
 * @property {number} integrity        the marble's own integrity, 0 to 100
 * @property {number} charge           its meter, 0 to 100
 * @property {number} enemyContacts    how many times it has touched an enemy this match
 * @property {boolean} touchedRail     did the shot just now touch a rail or bumper
 * @property {number} nearestEnemyM    metres to the nearest enemy marble
 * @property {boolean} bagmateShattered has one of its bagmates shattered this match
 * @property {boolean} justEntered     did it enter the arena on this turn
 * @property {string} tier             pristine, chipped, cracked
 */

export const CONDITIONS = {
  whenCracked: {
    id: 'whenCracked', name: 'When it cracks',
    blurb: 'Fires the moment this marble is down to its last fifth.',
    test: (f) => f.tier === 'cracked'
  },
  onFull: {
    id: 'onFull', name: 'The moment it fills',
    blurb: 'No waiting. The meter fills and it goes.',
    test: () => true
  },
  nthContact: {
    id: 'nthContact', name: 'On the Nth touch', param: { key: 'n', min: 1, max: 3, def: 2 },
    blurb: 'Counts enemy marbles it has touched, and goes on the one you name.',
    test: (f, p) => f.enemyContacts >= (p && p.n ? p.n : 2)
  },
  closeRange: {
    id: 'closeRange', name: 'Close in',
    blurb: 'Fires with an enemy inside a hand span.',
    test: (f, p, tuning) => f.nearestEnemyM <= tuning.arena.closeRangeM
  },
  vengeance: {
    id: 'vengeance', name: 'Vengeance',
    blurb: 'Waits for a bagmate to shatter, then answers for it.',
    test: (f) => !!f.bagmateShattered
  },
  onEntering: {
    id: 'onEntering', name: 'Coming in',
    blurb: 'Fires the turn it rolls into the arena. An ambush, if you can time it.',
    test: (f) => !!f.justEntered
  },
  /* ⛔ NOT SHIPPED. The seventh of DESIGN 9.5's seven, held back to its own cap of
     six. Kept here so the cut is visible and reversible rather than forgotten. */
  onRail: {
    id: 'onRail', name: 'Off the rail', shipped: false,
    blurb: 'Fires on a rail or bumper touch.',
    test: (f) => !!f.touchedRail
  }
};

/** The six that ship, in the order a picker should offer them. */
export const SHIPPED = ['onFull', 'whenCracked', 'nthContact', 'closeRange', 'onEntering', 'vengeance'];

/** Every condition a player may choose, as records. */
export function choosable() {
  return SHIPPED.map(id => CONDITIONS[id]);
}

/**
 * Should this marble's active fire right now?
 *
 * ⛔ BOTH HALVES, ALWAYS. Full meter AND condition met. A marble that fires on a
 * full meter alone has no secret, and one that fires on the condition alone has
 * no meter to watch.
 *
 * @param {{charge:number, condition:{id:string,params:object}|null, firedActive:boolean}} marble
 * @param {ArenaFacts} facts
 * @returns {{fires:boolean, why:string}}
 */
export function shouldFire(marble, facts, tuning) {
  if (!marble.condition) return { fires: false, why: 'no condition was set' };
  if (marble.firedActive) return { fires: false, why: 'its active has already gone' };
  const c = CONDITIONS[marble.condition.id];
  if (!c) return { fires: false, why: 'unknown condition ' + marble.condition.id };
  if (marble.charge < tuning.arena.charge.full) return { fires: false, why: 'the meter is not full' };
  if (!c.test(facts, marble.condition.params, tuning)) {
    return { fires: false, why: c.name + ' has not happened' };
  }
  return { fires: true, why: c.name };
}

/**
 * The Almanac grail reveals the CATEGORY only, never the condition. DESIGN 9.5.
 * Three categories: what touches it, where it is, and what state it is in.
 */
export const CATEGORY = {
  whenCracked: 'state', onFull: 'state', vengeance: 'state',
  nthContact: 'contact', onRail: 'contact',
  closeRange: 'position', onEntering: 'position'
};

export function categoryOf(conditionId) {
  return CATEGORY[conditionId] || 'state';
}
