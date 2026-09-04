/**
 * KEEPSIES mutation harness — the gate's own gate.
 *
 * The build plan's rule: "a gate you have not personally watched FAIL at least
 * once is decoration." That was kept all night by hand, which means it is a claim
 * only the builder can vouch for. This file makes it a RE RUNNABLE ARTIFACT that
 * a reviewer can execute without trusting anybody.
 *
 * Each mutant breaks exactly one mechanic in a scratch COPY of the satellite,
 * runs the gate that is supposed to notice, and records what happened.
 *
 *   KILLED   the gate went red. It is real.
 *   SURVIVED the mechanic was broken and every assertion still passed. That names
 *            a decorative test. Fix the TEST, not the mutant.
 *
 * ⛔ THE REAL TREE IS NEVER WRITTEN TO. A scratch copy is made once under the
 * system temp directory and every mutation happens there, so an interrupted run
 * cannot leave a broken source file behind. The builder spent the night mutating
 * files in place and restoring them by hand, which worked and was one Ctrl+C away
 * from not working.
 *
 * ⛔ ONLY THE PURE GATES. The four browser gates take three minutes each and a
 * mutation sweep would take two hours. They are covered by their own watched
 * failures, written up in the ledger, and by `playthrough` running every night.
 * A sweep that nobody will wait for is not a sweep.
 *
 *   node test/mutants.js            run them all
 *   node test/mutants.js ransom     run the ones whose id matches
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILTER = process.argv[2] || '';

/**
 * Each mutant names the file it breaks, an anchor that must match EXACTLY ONCE,
 * what it becomes, the mechanic it destroys, and the gate that should notice.
 *
 * ⛔ The anchor is asserted to match exactly once, for the same reason every patch
 * in this build asserts its anchor: a mutant whose anchor silently missed is a
 * mutant that proves nothing while reporting KILLED for some unrelated reason.
 */
const MUTANTS = [
  /* ---------------------------------------------------------- the economy */
  { id: 'clay-regen-per-call', gate: 'clay_regen',
    why: 'the clay pool refills on every call instead of once a day',
    file: 'src/meta/economy.js',
    from: '        if (s.clayPool.lastRegen !== day) {',
    to: '        if (true) {' },

  { id: 'spend-partial', gate: 'clay_regen',
    why: 'spending more than you have still takes what there is',
    file: 'src/meta/economy.js',
    from: '        if (s.wallet.sunbeams < amount) return;',
    to: '        if (false) return;' },

  { id: 'pity-ceiling', gate: 'pity_math',
    why: 'pity claws back what it gave, by capping the tier it just guaranteed',
    file: 'src/meta/drops.js',
    from: "      tier = 'rare'; pitied = 'rare';",
    to: "      tier = 'common'; pitied = 'rare';" },

  /* ------------------------------------------------------- the words ladder */
  { id: 'weight-ladder-collapse', gate: 'words',
    why: 'the weight vocabulary collapses onto one rung',
    file: 'src/meta/words.js',
    from: "  if (g >= 4.5) return 'the usual heft';",
    to: "  if (g >= 0.1) return 'the usual heft';" },

  /* ------------------------------------------------------------ the escrow */
  { id: 'escrow-no-remove', gate: 'escrow_crash',
    why: 'staking does not remove the marble from the inventory, so it exists twice',
    file: 'src/game/match.js',
    from: '    s.inventory = s.inventory.filter((i) => {',
    to: '    s.inventory = s.inventory.slice().filter((i) => { taken.push(i); return true; }) && s.inventory.filter((i) => {' },

  { id: 'loss-returns-marble', gate: 'escrow_crash',
    why: 'losing quietly hands the marble back, which makes the whole game meaningless',
    file: 'src/game/match.js',
    from: '      out.lost = pot.mine.slice();',
    to: '      out.lost = pot.mine.slice(); for (const m of pot.mine) s.inventory.push(m);' },

  { id: 'boot-forgets-pot', gate: 'escrow_crash',
    why: 'a crash mid match eats the staked marble, because the next boot ignores the pot',
    file: 'src/game/match.js',
    from: '    for (const m of pot.mine) { s.inventory.push(m); recovered++; }',
    to: '    recovered += 0;' },

  /* ------------------------------------------------------------ the ransom */
  { id: 'ransom-on-a-common', gate: 'ransom',
    why: 'a clay common gets a price on it, which turns the free tier into a trap',
    file: 'src/meta/ransom.js',
    from: '    if (!price) continue;',
    to: '    if (false) continue;' },

  { id: 'ransom-window-never-closes', gate: 'ransom',
    why: 'the 24 hour window never actually closes',
    file: 'src/meta/ransom.js',
    from: "    if (r.lapsed || now >= r.expires) { out.reason = r.from + ' kept it. The window closed.'; return; }",
    to: '    if (false) { return; }' },

  { id: 'ransom-pay-twice', gate: 'ransom',
    why: 'buying the same marble back twice duplicates it',
    file: 'src/meta/ransom.js',
    from: "    if (r.paid) { out.reason = 'You already bought that one back.'; return; }",
    to: '    if (false) { return; }' },

  { id: 'ransom-deletes-lapsed', gate: 'ransom',
    why: 'a lapsed offer deletes itself, so a marble vanishes with no record',
    file: 'src/meta/ransom.js',
    from: '      r.lapsed = true;\n      gone.push(r);',
    to: '      s.ransoms = s.ransoms.filter(x => x.uid !== r.uid);' },

  /* -------------------------------------------------------- the progression */
  { id: 'levelup-pays-once', gate: 'progression',
    why: 'a multi level jump pays only the last level',
    file: 'src/meta/progression.js',
    from: '  for (const lv of out.levels) {',
    to: '  for (const lv of out.levels.slice(-1)) {' },

  { id: 'cap-eats-xp', gate: 'progression',
    why: 'XP earned at the level cap is silently binned',
    file: 'src/meta/progression.js',
    from: '    p.xp = (p.xp || 0) + gain;',
    to: '    p.xp = (p.level >= cap) ? 0 : (p.xp || 0) + gain;' },

  { id: 'ungated-key-closed', gate: 'progression',
    why: 'a feature nobody gated is treated as locked',
    file: 'src/meta/progression.js',
    from: '  if (need == null) return true;',
    to: '  if (need == null) return false;' },

  /* --------------------------------------------------------- the onboarding */
  { id: 'any-event-advances', gate: 'onboarding',
    why: 'any event advances a beat, so a double tap skips one',
    file: 'src/meta/beats.js',
    from: "      if (b.waitsFor !== event) return { advanced: false, from: b.id, to: b.id };",
    to: '      if (false) return { advanced: false, from: b.id, to: b.id };' },

  { id: 'skip-before-the-break', gate: 'onboarding',
    why: 'the skip is offered on the hook itself, before the game has taught anything',
    file: 'src/meta/beats.js',
    from: '      return !!(b && b.skippable);',
    to: '      return !!b;' },

  { id: 'skip-past-the-tin', gate: 'onboarding',
    why: 'skipping jumps past the tin, so an experienced player loses their starters',
    file: 'src/meta/beats.js',
    from: "          if (b.id === 'tin') break;",
    to: "          if (b.id === 'firstKeepsies') break;" },

  /* -------------------------------------------------------------- the arena */
  { id: 'hardness-multiplies', gate: 'damage',
    why: 'hardness multiplies damage instead of dividing it, so armour hurts you',
    file: 'src/core/damage.js',
    from: '  return clamp(over * hit.attackerMassKg * a.damageScale / hard, 0, a.damageCap);',
    to: '  return clamp(over * hit.attackerMassKg * a.damageScale * hard, 0, a.damageCap);' },

  { id: 'burn-every-call', gate: 'damage',
    why: 'burn ticks on every call, so its damage scales with the frame rate',
    file: 'src/core/damage.js',
    from: '  if (state.lastBurn != null && now - state.lastBurn < a.burnTickSeconds) return 0;',
    to: '  if (false) return 0;' },

  { id: 'active-without-meter', gate: 'damage',
    why: 'an active fires on its condition alone, so the public meter means nothing',
    file: 'src/core/specials.js',
    from: "  if (marble.charge < tuning.arena.charge.full) return { fires: false, why: 'the meter is not full' };",
    to: '  if (false) return { fires: false, why: 0 };' },

  { id: 'overkill-pays-the-roll', gate: 'damage',
    why: 'charge is earned on the damage rolled rather than the damage that landed',
    file: 'src/core/damage.js',
    from: "  const aCharge = addCharge(attacker, chargeFor('dealt', applied, !!o.attackerAlone, tuning), tuning);",
    to: "  const aCharge = addCharge(attacker, chargeFor('dealt', dmg, !!o.attackerAlone, tuning), tuning);" },

  { id: 'friendly-fire', gate: 'arena',
    why: 'your own marbles damage each other',
    file: 'src/core/rules-arena.js',
    from: '    if (A.pl.index === B.pl.index) continue;',
    to: '    if (false) continue;' },

  { id: 'ringout-heals', gate: 'arena',
    why: 'a rung out marble comes back healed, so damage never accumulates',
    file: 'src/core/rules-arena.js',
    from: '    ringOut(R.m);',
    to: '    ringOut(R.m); R.m.integrity = 100;' },

  { id: 'two-acts-a-turn', gate: 'arena',
    why: 'a player can reposition as many times as they like in one turn',
    file: 'src/core/rules-arena.js',
    from: "  if (p.actedThisTurn !== ACT.NONE) return { ok: false, reason: 'One move a turn.' };",
    to: '  if (false) return { ok: false, reason: 0 };' },

  { id: 'rungout-is-a-loss', gate: 'arena',
    why: 'having all three marbles merely rung out counts as losing',
    file: 'src/core/rules-arena.js',
    from: '    if (legalMarbles(pl).length === 0) {',
    to: '    if (pl.bag.every(m => m.benched)) {' },

  { id: 'settle-never-steps', gate: 'arena',
    why: 'the settle loop never turns the world over, so no shot ever goes anywhere',
    file: 'src/game/arena.js',
    from: '    const dt = T.physics.fixedStep;\n    let n = 0;\n    const cap = maxSteps || Math.round(T.arena.settleCapSeconds / dt);',
    to: '    const dt = 1 / T.physics.hz;\n    let n = 0;\n    const cap = maxSteps || Math.round(T.arena.settleCapSeconds * T.physics.hz);' },

  { id: 'contacts-as-ids', gate: 'arena',
    why: 'contact events are read as uids when they carry physics ids, so nothing registers as a hit',
    file: 'src/game/arena.js',
    from: '      const ua = uidOf(e.a), ub = uidOf(e.b);',
    to: '      const ua = e.a, ub = e.b;' },

  /* --------------------------------------------------------------- the save */
  { id: 'merge-clobbers-inventory', gate: 'save',
    why: 'a merge replaces the inventory instead of unioning it, so two tabs eat each other',
    file: 'src/meta/save.js',
    from: '      for (const m of partial.inventory) if (!have.has(m.uid)) s.inventory.push(m);',
    to: '      s.inventory = partial.inventory.slice();' },

  /* ------------------------------------------------------------- the referee */
  { id: 'poison-with-the-rule-off', gate: 'ringer_rules',
    why: 'a knockout counts even when the poison house rule is off',
    file: 'src/core/rules-ringer.js',
    from: 'if (M.houseRules.poison',
    to: 'if (true' }
];

/* ---------------------------------------------------------------- the run */

const scratch = mkdtempSync(join(tmpdir(), 'keepsies-mutants-'));
const COPY = join(scratch, 'keepsies');
console.log('scratch copy at ' + COPY + '\n');
for (const dir of ['src', 'test', 'sim', 'lib', 'tools']) {
  if (existsSync(join(ROOT, dir))) cpSync(join(ROOT, dir), join(COPY, dir), { recursive: true });
}
for (const f of ['index.html', 'package.json', 'manifest.json']) {
  if (existsSync(join(ROOT, f))) cpSync(join(ROOT, f), join(COPY, f));
}

const chosen = MUTANTS.filter(m => !FILTER || m.id.indexOf(FILTER) >= 0 || m.gate.indexOf(FILTER) >= 0);
const killed = [], survived = [], broken = [];

for (const m of chosen) {
  const path = join(COPY, m.file);
  const original = readFileSync(path, 'utf8');
  const hits = original.split(m.from).length - 1;
  if (hits !== 1) {
    broken.push(m.id + ': its anchor matched ' + hits + ' times in ' + m.file + ', not once');
    console.log('  ANCHOR  ' + m.id.padEnd(28) + 'matched ' + hits + ' times, not once');
    continue;
  }
  writeFileSync(path, original.replace(m.from, m.to));
  let red = false, note = '';
  try {
    execFileSync('node', [join('test', m.gate + '.mjs')], {
      cwd: COPY, encoding: 'utf8', stdio: 'pipe', timeout: 180000,
      env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' })
    });
  } catch (e) {
    red = true;
    const out = ((e.stdout || '') + '').split('\n').filter(l => l.indexOf('FAIL') >= 0);
    note = out.length ? out[0].trim().slice(0, 78) : 'the gate exited non zero';
  }
  writeFileSync(path, original);
  if (red) { killed.push(m); console.log('  KILLED  ' + m.id.padEnd(28) + m.gate.padEnd(14) + note); }
  else { survived.push(m); console.log('  SURVIVED ' + m.id.padEnd(27) + m.gate.padEnd(14) + m.why); }
}

rmSync(scratch, { recursive: true, force: true });

console.log('\n' + killed.length + ' killed, ' + survived.length + ' survived, '
  + broken.length + ' anchors missed, of ' + chosen.length + ' mutants');
if (survived.length) {
  console.log('\nDECORATIVE GATES. Each of these mechanics was broken and every assertion still passed:');
  for (const m of survived) console.log('  ' + m.gate + ': ' + m.why + '  (' + m.file + ')');
}
if (broken.length) {
  console.log('\nMUTANTS THAT DID NOT APPLY, which prove nothing either way:');
  for (const b of broken) console.log('  ' + b);
}
if (survived.length || broken.length) { console.log('\nMUTANTS FAILED'); process.exit(1); }
console.log('\nMUTANTS OK');
