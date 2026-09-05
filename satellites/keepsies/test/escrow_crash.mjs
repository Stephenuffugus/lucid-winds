/**
 * A marble is never in two places, and never in none.
 *
 *   node test/escrow_crash.mjs
 *
 * Keepsies is real property to the player, so the escrow is the one piece of
 * this game where a bug is not a bug, it is a theft. DESIGN 12.1.3 asks for a
 * harness test that kills a match mid flight and proves the pot survives, and
 * this is it: a REAL child process is started, told to stake, and KILLED with
 * SIGKILL between the escrow write and the first turn. Then the save it left on
 * disk is loaded in this process and counted.
 *
 * Four things are asserted:
 *   1. staking REMOVES from the inventory and puts it in the pot, in one write
 *   2. a process killed after that write leaves every uid recoverable
 *   3. the next boot returns them, exactly once each, and never twice
 *   4. a win, a loss and a draw each move exactly what they should and no more
 *
 * The count that matters is the CONSERVATION count: at every point in the run,
 * every uid that ever existed is in exactly one of the inventory or the pot.
 */
import { writeFileSync, readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* A file backed store, so a killed process really does leave state behind. The
   save module picks localStorage, sessionStorage or memory; in Node it lands on
   memory, so the child is given a file backed shim through globalThis. */
const dir = mkdtempSync(join(tmpdir(), 'keepsies-escrow-'));
const STORE = join(dir, 'save.json');

const CHILD = `
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const FILE = ${JSON.stringify(STORE)};
const disk = () => { try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch (e) { return {}; } };
globalThis.localStorage = {
  getItem: (k) => { const d = disk(); return k in d ? d[k] : null; },
  setItem: (k, v) => { const d = disk(); d[k] = String(v); writeFileSync(FILE, JSON.stringify(d)); },
  removeItem: (k) => { const d = disk(); delete d[k]; writeFileSync(FILE, JSON.stringify(d)); }
};
const SAVE = await import(${JSON.stringify(join(ROOT, 'src/meta/save.js'))} + '?v=20260905a');
const M = await import(${JSON.stringify(join(ROOT, 'src/game/match.js'))} + '?v=20260905a');
const mode = process.argv[2];

if (mode === 'seed') {
  SAVE.wipe();
  SAVE.merge({ inventory: [
    { uid: 'u1', id: 'bloodstone_aggie', tier: 'rare' },
    { uid: 'u2', id: 'lutz', tier: 'rare' },
    { uid: 'u3', id: 'dirt_plain', tier: 'common' }
  ]});
  console.log(JSON.stringify({ inventory: SAVE.load().inventory.length }));
} else if (mode === 'stake-and-die') {
  const inv = SAVE.load().inventory;
  const mine = [{ uid: 'u1', id: 'bloodstone_aggie', tier: 'rare' }];
  const theirs = [{ id: 'onionskin', name: 'Onionskin', tier: 'rare' }];
  const ok = M.escrow(mine, theirs, 'Dusty Coyle');
  if (!ok) { console.log(JSON.stringify({ escrowed: false })); process.exit(3); }
  console.log(JSON.stringify({ escrowed: true, potUp: M.potUp() }));
  // ⛔ and now the phone dies, right here, between the escrow and the first turn
  process.kill(process.pid, 'SIGKILL');
} else if (mode === 'boot') {
  const before = SAVE.load();
  const rec = M.recoverOnBoot();
  const after = SAVE.load();
  console.log(JSON.stringify({
    potWasUp: !!(before.pot && before.pot.inMatch),
    recovered: rec.recovered,
    inventory: after.inventory.map(i => i.uid).sort(),
    potNow: !!(after.pot && after.pot.inMatch)
  }));
} else if (mode === 'win' || mode === 'lose' || mode === 'draw') {
  M.escrow([{ uid: 'u2', id: 'lutz', tier: 'rare' }],
           [{ id: 'clambroth', name: 'Clambroth', tier: 'rare' }], 'Dusty Coyle');
  const r = M.settle(mode === 'win' ? 0 : (mode === 'lose' ? 1 : null));
  const s = SAVE.load();
  console.log(JSON.stringify({
    won: r.won.length, lost: r.lost.length, returned: r.returned.length,
    inventory: s.inventory.map(i => i.uid).sort(),
    ids: s.inventory.map(i => i.id).sort(),
    potNow: !!(s.pot && s.pot.inMatch)
  }));
}
`;
const CHILD_FILE = join(dir, 'child.mjs');
writeFileSync(CHILD_FILE, CHILD);

const run = (mode) => {
  try {
    const out = execFileSync('node', [CHILD_FILE, mode], { encoding: 'utf8' });
    return JSON.parse(out.trim().split('\n').pop());
  } catch (e) {
    const out = ((e.stdout || '') + '').trim();
    return out ? Object.assign(JSON.parse(out.split('\n').pop()), { killed: true, signal: e.signal })
      : { killed: true, signal: e.signal, empty: true };
  }
};

/* ---- 1 and 2: stake, then die ---- */
const seeded = run('seed');
say(seeded.inventory === 3, 'a player starts with three marbles: ' + seeded.inventory);

const died = run('stake-and-die');
say(died.escrowed === true, 'staking one of them succeeded');
say(died.potUp === true, 'and the pot went up BEFORE anything was played');
say(died.killed === true && died.signal === 'SIGKILL',
  'and then the process was killed outright: ' + died.signal);

/* ---- 3: the next boot ---- */
const booted = run('boot');
say(booted.potWasUp === true, 'the save left on disk still had the pot up, which is the crash we wanted');
say(booted.recovered === 1, 'booting recovered exactly one marble: ' + booted.recovered);
say(booted.inventory.join(',') === 'u1,u2,u3',
  'and the inventory is whole again, every uid exactly once: ' + booted.inventory.join(','));
say(booted.potNow === false, 'and the pot is down');

const twice = run('boot');
say(twice.recovered === 0, 'booting a second time recovers nothing more: ' + twice.recovered);
say(twice.inventory.join(',') === 'u1,u2,u3',
  'and does NOT duplicate anything: ' + twice.inventory.join(','));

/* ---- 4: winning, losing and a draw ---- */
const won = run('win');
say(won.won === 1 && won.inventory.length === 4,
  'winning takes theirs and keeps yours: ' + won.inventory.length + ' marbles, ' + won.won + ' won');
say(won.ids.indexOf('clambroth') >= 0, 'and the marble you won is really in there');
say(won.potNow === false, 'and the pot is settled');

run('seed');
const lost = run('lose');
say(lost.lost === 1 && lost.inventory.join(',') === 'u1,u3',
  'losing really loses it, and it does not come back: ' + lost.inventory.join(','));

run('seed');
const drew = run('draw');
say(drew.returned === 1 && drew.inventory.join(',') === 'u1,u2,u3',
  'a draw returns everything: ' + drew.inventory.join(','));

rmSync(dir, { recursive: true, force: true });
console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nESCROW CRASH FAILED'); process.exit(1); }
console.log('ESCROW CRASH OK');
