/**
 * Integrity, damage and the charge meter. DESIGN 9.3, 9.4, 9.6 and 9.7.
 *
 * ⛔ THE MARBLE IS THE HEALTH BAR. There is no floating HP anywhere in this game;
 * `integrity` is 0 to 100 per marble per MATCH and never persists to the
 * collection, because DESIGN 9.3 is final on it: an owned marble is never
 * permanently damaged. A marble you lose at keepsies is gone; a marble you shatter
 * in the Arena is back on the shelf, whole, the moment the match ends.
 *
 * ⛔ NO DOM, NO THREE, NO RAPIER. This is the referee's arithmetic, so it runs
 * unchanged in Node and the whole matrix can be swept without a browser.
 *
 * ⛔ DEFENDERS CHARGE FASTER, AND THAT IS THE ONLY COMEBACK MECHANIC THAT TOUCHES
 * NUMBERS. DESIGN 9.6 forbids rubber banding aim or damage outright. Twelve
 * charge per ten damage taken against eight per ten dealt, plus the last marble's
 * durability, is the whole of it: a player behind gets to act sooner, not to hit
 * harder or aim better.
 */

const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));

/** The tier a marble reads at, which is also what it looks like. DESIGN 9.3. */
export function tierOf(integrity, tuning) {
  const a = tuning.arena;
  if (integrity <= 0) return 'shattered';
  if (integrity < a.tierCracked) return 'cracked';
  if (integrity < a.tierChipped) return 'chipped';
  return 'pristine';
}

/**
 * Damage for one impact. DESIGN 9.3:
 *   dmg = clamp((relSpeed - 1.2) x attackerMassKg x 55 / defenderHardness, 0, 35)
 *
 * @param {{relSpeed:number, attackerMassKg:number, defenderHardness:number}} hit
 * @returns {number}
 */
export function damageFor(hit, tuning) {
  const a = tuning.arena;
  const over = hit.relSpeed - a.damageSpeedFloor;
  if (over <= 0) return 0;
  const hard = hit.defenderHardness > 0 ? hit.defenderHardness : 1;
  return clamp(over * hit.attackerMassKg * a.damageScale / hard, 0, a.damageCap);
}

/**
 * Does this hit finish a cracked marble, and did the SHATTER BONUS do it?
 *
 * DESIGN 9.7: any hit above a modest threshold can finish a cracked marble, and
 * glass gets +40 percent on that bonus against cracked targets. The second half
 * of the return matters for the camera: "if lethality came from the shatter bonus
 * rather than raw damage, play the glass fracture cam", so every kill reads as
 * either overwhelm or a placed killshot.
 *
 * @returns {{lethal:boolean, byBonus:boolean, effective:number}}
 */
export function shatterCheck(integrity, dmg, attackerClass, tuning) {
  const a = tuning.arena;
  const cracked = integrity > 0 && integrity < a.tierCracked;
  let effective = dmg;
  let byBonus = false;
  if (cracked && attackerClass === 'glass') {
    effective = dmg * (1 + a.glassShatterBonusPercent / 100);
    // it counts as a placed killshot only when the raw hit would NOT have done it
    byBonus = dmg < integrity && effective >= integrity;
  }
  return { lethal: effective >= integrity, byBonus: byBonus, effective: effective };
}

/**
 * Burn, which ticks at most once every half second per marble. DESIGN 9.3.
 *
 * ⛔ THE CLOCK IS THE CALLER'S. Nothing here reads `Date`, so the harness can
 * sweep a whole match in a millisecond and a real match ticks on its own step.
 *
 * @param {{lastBurn:number}} state mutated: the time this marble last burned
 * @returns {number} damage to apply, 0 when it is too soon
 */
export function burnTick(state, now, tuning) {
  const a = tuning.arena;
  if (state.lastBurn != null && now - state.lastBurn < a.burnTickSeconds) return 0;
  state.lastBurn = now;
  return a.burnPerContactSecond * a.burnTickSeconds;
}

/** A marble's arena state at the start of a match. Never written to the save. */
export function freshMarble(entry, spec, tuning) {
  return {
    id: entry.id,
    uid: entry.uid || entry.id,
    name: entry.name,
    materialClass: spec.materialClass,
    massKg: spec.mass,
    hardness: (entry.arena && entry.arena.hardness != null) ? entry.arena.hardness : spec.hardness,
    integrity: 100,
    charge: 0,
    lastBurn: null,
    benched: true,
    shattered: false,
    ringOuts: 0,
    condition: null,
    firedActive: false
  };
}

/**
 * The last marble standing is harder to break and charges twice as fast.
 * DESIGN 9.6: "durability and inevitability, not damage."
 */
export function effectiveHardness(marble, aloneInBag, tuning) {
  const a = tuning.arena;
  return marble.hardness * (aloneInBag ? 1 + a.lastMarbleHardnessBonus : 1);
}

/** Charge earned, with the last marble's doubling folded in. */
export function chargeFor(kind, amount, aloneInBag, tuning) {
  const c = tuning.arena.charge;
  let gained = 0;
  if (kind === 'dealt') gained = (amount / 10) * c.perTenDealt;
  else if (kind === 'taken') gained = (amount / 10) * c.perTenTaken;
  else if (kind === 'rail') gained = c.perRailHit;
  else if (kind === 'warm') gained = c.perWarmTurn;
  else if (kind === 'benchedBioluminous') gained = c.benchedBioluminous;
  return gained * (aloneInBag ? tuning.arena.lastMarbleMeterMultiplier : 1);
}

/** Add charge, capped, and say whether the meter just filled (it is public). */
export function addCharge(marble, gained, tuning) {
  const full = tuning.arena.charge.full;
  const was = marble.charge;
  marble.charge = clamp(marble.charge + gained, 0, full);
  return { full: marble.charge >= full, justFilled: was < full && marble.charge >= full };
}

/**
 * Apply one impact end to end: damage, the shatter check, and both marbles'
 * charge. Returns everything a renderer or a gate needs and mutates nothing it
 * was not given.
 *
 * @returns {{dmg:number, tierBefore:string, tierAfter:string, shattered:boolean,
 *            byBonus:boolean, attackerCharge:object, defenderCharge:object}}
 */
export function applyHit(attacker, defender, relSpeed, opts, tuning) {
  const o = opts || {};
  const hard = effectiveHardness(defender, !!o.defenderAlone, tuning);
  const dmg = damageFor({
    relSpeed: relSpeed, attackerMassKg: attacker.massKg, defenderHardness: hard
  }, tuning);
  const tierBefore = tierOf(defender.integrity, tuning);
  const check = shatterCheck(defender.integrity, dmg, attacker.materialClass, tuning);
  const applied = check.lethal ? defender.integrity : dmg;
  defender.integrity = Math.max(0, defender.integrity - (check.lethal ? defender.integrity : dmg));
  if (defender.integrity <= 0) defender.shattered = true;

  /* ⛔ CHARGE IS EARNED ON THE DAMAGE THAT LANDED, not on the damage that was
     rolled. A hit that overkills a marble by thirty does not pay thirty. */
  const aCharge = addCharge(attacker, chargeFor('dealt', applied, !!o.attackerAlone, tuning), tuning);
  const dCharge = defender.shattered
    ? { full: false, justFilled: false }
    : addCharge(defender, chargeFor('taken', applied, !!o.defenderAlone, tuning), tuning);

  return {
    dmg: applied,
    rolled: dmg,
    tierBefore: tierBefore,
    tierAfter: tierOf(defender.integrity, tuning),
    shattered: defender.shattered,
    byBonus: check.byBonus,
    attackerCharge: aCharge,
    defenderCharge: dCharge
  };
}

/**
 * Ring out. DESIGN 9.7: the marble goes to your rack KEEPING ITS INTEGRITY and
 * can come back later by swap, and a fresh marble enters for you immediately at
 * full 100. It is the safer of the two win textures and the less permanent one.
 */
export function ringOut(marble) {
  marble.benched = true;
  marble.ringOuts += 1;
  return { integrityKept: marble.integrity };
}
