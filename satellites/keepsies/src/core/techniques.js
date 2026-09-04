/**
 * The game names what it saw.
 *
 * DESIGN 6.3: discovered names. Nothing here is a quest, nothing is listed
 * before you do it, and an unearned one shows as a silhouette with no hint. The
 * first time a player pulls one off the game freezes for four tenths of a second
 * and tells them what it was called, which is how a technique becomes a thing
 * they meant to do the second time.
 *
 * Detection reads the referee's LOG and the shot outcome. It never reads the
 * world, never reads a score, and never asks the renderer anything, so a
 * technique earned in the Practice Ring is the same technique earned in a match.
 */

/** The Ringer set. The Arena five arrive in K3. */
export const RINGER_TECHNIQUES = {
  sticking: {
    id: 'sticking', name: 'Sticking',
    blurb: 'Backspin, and the shooter sat down right where the mib had been.'
  },
  bombing: {
    id: 'bombing', name: 'Bombing',
    blurb: 'Dropped it straight down on them, and it was legal.'
  },
  dirtyEnglish: {
    id: 'dirtyEnglish', name: 'Dirty English',
    blurb: 'A wild one that took two out at once. Nobody saw that coming, you included.'
  },
  theLag: {
    id: 'theLag', name: 'The Lag',
    blurb: 'Won the lag by less than the width of a marble.'
  },
  knuckledDown: {
    id: 'knuckledDown', name: 'Knuckled Down',
    blurb: 'Second finger planted on every single shot, and it won.'
  },
  cleanSweep: {
    id: 'cleanSweep', name: 'Clean Sweep',
    blurb: 'Four out of the ring in one turn.'
  },
  poisonPen: {
    id: 'poisonPen', name: 'Poison Pen',
    blurb: 'Took the shooter out and took one of theirs with it.'
  }
};

/**
 * What just happened, in a word.
 * @param {object} M the referee state
 * @param {{aim:object, outcome:object}} ctx the shot that just resolved
 * @returns {string[]} technique ids first earned by this shot
 */
export function detect(M, ctx) {
  const out = [];
  const log = M.log;
  const last = log[log.length - 1];
  const shot = lastOfType(log, 'shot');
  const resolve = lastOfType(log, 'resolve');
  if (!resolve) return out;

  const aim = ctx.aim || {};
  const pocketedNow = resolve.pocketedThisShot || 0;

  // Sticking: backspin, it struck a mib, and the shooter stopped on the mark
  if (aim.contactOffset && aim.contactOffset.y < -0.2
    && resolve.firstStruckUid
    && resolve.tawRestDistanceToStruck != null
    && resolve.tawRestDistanceToStruck <= 0.1) out.push('sticking');

  // Bombing: a legal drop shot that pocketed
  if (aim.bomb && M.houseRules.bombing && pocketedNow > 0) out.push('bombing');

  // Dirty English: a wild flick that took two or more
  if ((aim.wildness01 || 0) >= 0.5 && pocketedNow >= 2) out.push('dirtyEnglish');

  // The Lag: won it by under two centimetres
  const lag = lastOfType(log, 'lag');
  if (lag && !lag.skipped && lag.margin != null && lag.margin < 0.02
    && lag.winner === (shot ? shot.player : -1)) out.push('theLag');

  // Clean Sweep: four or more out in one turn, which may be several shots
  if (turnPocketCount(log) >= 4) out.push('cleanSweep');

  // Poison Pen: the win came through a poison steal
  if (last && last.type === 'over') {
    const poisoned = log.some(l => l.type === 'poison' && l.by === last.winner);
    if (poisoned) out.push('poisonPen');
    // Knuckled Down: every shot this player took had the second finger planted
    const theirs = log.filter(l => l.type === 'shot' && l.player === last.winner);
    if (theirs.length >= 3 && theirs.every(s => s.knuckledDown)) out.push('knuckledDown');
  }

  return out;
}

function lastOfType(log, type) {
  for (let i = log.length - 1; i >= 0; i--) if (log[i].type === type) return log[i];
  return null;
}

/** How many this player has pocketed since the turn last passed to them. */
function turnPocketCount(log) {
  let n = 0;
  for (let i = log.length - 1; i >= 0; i--) {
    const l = log[i];
    if (l.type === 'turnPassed' || l.type === 'lag') break;
    if (l.type === 'pocket') n += l.count;
  }
  return n;
}
