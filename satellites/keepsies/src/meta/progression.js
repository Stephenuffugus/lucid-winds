/**
 * XP, levels and what they open.
 *
 * DESIGN 20: "XP → level, from any match win or lose, For Fair included (win 100
 * / loss 40 / boss win 300; Ringer and Arena equal). Curve: level N needs 120×N
 * XP. Cap 30 at launch." And: "Every level-up pays sunbeams (level×20)."
 *
 * ⛔ LOSING PAYS. Forty XP for a loss is not a consolation, it is the rule that
 * makes the ladder survivable, and it pairs with DESIGN 12's "progression never
 * requires keepsies": a player who never stakes anything still levels.
 *
 * ⛔ ONE LEVEL UP CAN BE SEVERAL. A boss win at 300 XP can cross two levels at
 * once, and each crossed level pays its own bonus exactly once. Paying only the
 * final level, or paying the same level twice on a re award, are the two ways
 * this goes wrong and both are gated.
 *
 * ⛔ AT THE CAP THE XP IS KEPT, NOT DROPPED. A player at 30 keeps banking it, so
 * raising the cap later hands them the levels they already earned rather than
 * nothing. Silently discarding XP is the kind of thing nobody notices until the
 * cap moves and everybody is furious.
 *
 * ⛔ AN UNLOCK IS A QUESTION, NEVER A COPY OF THE NUMBER. Every gate in the game
 * asks `unlocked('pouches')`, and the level lives in `tuning.json` only. The
 * moment a screen writes `level >= 2` the table has two homes.
 */
import * as SAVE from './save.js?v=20260904c';

/**
 * What ONE level up costs, leaving `level`. DESIGN writes "level N needs 120×N",
 * read as the cost of the N to N+1 step: see DECISIONS for why the cumulative
 * reading was rejected (it maxes the game in 36 wins).
 */
export function costOfLevel(level, tuning) {
  return tuning.progression.xpPerLevel * Math.max(1, level);
}

/** XP for a match. `kind` is 'win', 'loss' or 'bossWin'. */
export function xpFor(kind, tuning) {
  return tuning.progression.xp[kind] || 0;
}

/** Where the player is, without changing anything. */
export function snapshot(tuning) {
  const p = SAVE.load().profile;
  const level = p.level || 1;
  const into = p.xp || 0;
  const cap = tuning.progression.levelCap;
  const need = level >= cap ? 0 : costOfLevel(level, tuning);
  return {
    level: level,
    xp: into,
    needed: need,
    toNext: need ? Math.max(0, need - into) : 0,
    fraction: need ? Math.min(1, into / need) : 1,
    atCap: level >= cap,
    cap: cap
  };
}

/**
 * Award XP and take every level up it earns.
 *
 * @param {number} amount
 * @param {string} reason
 * @param {object} tuning
 * @param {{earn:(n:number,reason:string)=>number}} econ
 * @returns {{gained:number, levels:number[], paid:number, level:number}}
 */
export function award(amount, reason, tuning, econ) {
  const gain = Math.max(0, Math.round(amount));
  const out = { gained: gain, levels: [], paid: 0, level: 1 };
  if (!gain) { out.level = snapshot(tuning).level; return out; }
  const cap = tuning.progression.levelCap;

  SAVE.update((s) => {
    const p = s.profile;
    p.level = p.level || 1;
    p.xp = (p.xp || 0) + gain;
    s.stats.xp = (s.stats.xp || 0) + gain;
    // ⛔ a loop, not an if: 300 XP can cross two levels, and each one is real
    let guard = 0;
    while (p.level < cap && p.xp >= costOfLevel(p.level, tuning) && guard++ < 64) {
      p.xp -= costOfLevel(p.level, tuning);
      p.level += 1;
      out.levels.push(p.level);
    }
    out.level = p.level;
  });

  /* the bonus is paid AFTER the save write and once per level crossed, through
     the economy rather than by touching the wallet here, so it shows up in the
     wallet's own change feed like every other earn */
  for (const lv of out.levels) {
    out.paid += econ.earn(lv * tuning.progression.levelUpSunbeams, 'reached level ' + lv);
  }
  return out;
}

/** Award for a finished match. For Fair pays the same as keepsies (DESIGN 12). */
export function awardMatch(won, tuning, econ, opts) {
  const boss = !!(opts && opts.boss);
  const kind = won ? (boss ? 'bossWin' : 'win') : 'loss';
  return award(xpFor(kind, tuning), kind, tuning, econ);
}

/** Is this part of the game open yet? */
export function unlocked(key, tuning) {
  const need = tuning.progression.unlocks[key];
  if (need == null) return true;                  // nothing gates what nobody gated
  return snapshot(tuning).level >= need;
}

/** What level opens it, for a line of copy that says so. */
export function unlockLevel(key, tuning) {
  const need = tuning.progression.unlocks[key];
  return need == null ? 1 : need;
}

/**
 * Everything opening at this level.
 *
 * ⛔ ONLY WHAT EXISTS. DESIGN 20's table is the design and stays whole, but a
 * level up card that says "keepsies against people now open" in a build with no
 * online sends a player looking for a screen that is not there. `announce` in
 * tuning is the list of keys this build can actually show, and the day a thing
 * ships its key goes on the list. Pass `{all: true}` for the design's full table.
 */
export function unlocksAt(level, tuning, opts) {
  const table = tuning.progression.unlocks;
  const keys = Object.keys(table).filter(k => table[k] === level);
  if (opts && opts.all) return keys;
  const live = tuning.progression.announce;
  return live ? keys.filter(k => live.indexOf(k) >= 0) : keys;
}
