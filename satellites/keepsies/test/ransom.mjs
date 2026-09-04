/**
 * The 24 hour window, walked forward, backward and through a crash.
 *
 *   node test/ransom.mjs
 *
 * A ransom is the one place in the game where a marble is neither in an inventory
 * nor in a pot, so it is the one place a marble could quietly cease to exist. The
 * conservation rule is the same one `escrow_crash` holds: every uid that ever
 * existed is in exactly one of the inventory, the pot, or an open offer.
 *
 * Six things are asserted:
 *   1. THE PRICE IS THE DESIGN'S PRICE, and commons and uncommons are not ransomed
 *      at all, because the clay pool exists so playing for keeps can be free.
 *   2. AN OFFER SURVIVES A KILLED PROCESS with its deadline intact.
 *   3. PAYING RETURNS THE MARBLE EXACTLY ONCE and takes exactly the price.
 *   4. PAYING TWICE IS REFUSED, and the second refusal moves nothing.
 *   5. TOO POOR IS A REFUSAL WITH A REASON, and nothing moves.
 *   6. THE WINDOW CLOSES ONCE. A lapsed offer cannot be paid, cannot lapse twice,
 *      and does not delete itself, because an offer that vanishes silently is
 *      indistinguishable from a bug that ate a marble.
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const dir = mkdtempSync(join(tmpdir(), 'keepsies-ransom-'));
const STORE = join(dir, 'save.json');
const T0 = 1757000000000;                       // a fixed clock, so the test is not a race
const HOUR = 3600000;

const CHILD = `
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const FILE = ${JSON.stringify(STORE)};
const disk = () => { try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch (e) { return {}; } };
globalThis.localStorage = {
  getItem: (k) => { const d = disk(); return k in d ? d[k] : null; },
  setItem: (k, v) => { const d = disk(); d[k] = String(v); writeFileSync(FILE, JSON.stringify(d)); },
  removeItem: (k) => { const d = disk(); delete d[k]; writeFileSync(FILE, JSON.stringify(d)); }
};
const SAVE = await import(${JSON.stringify(join(ROOT, 'src/meta/save.js'))} + '?v=20260904b');
const R = await import(${JSON.stringify(join(ROOT, 'src/meta/ransom.js'))} + '?v=20260904b');
const T = JSON.parse(readFileSync(${JSON.stringify(join(ROOT, 'src/data/tuning.json'))}, 'utf8'));
const T0 = ${T0}, HOUR = ${HOUR};
const mode = process.argv[2];
const at = T0 + parseFloat(process.argv[3] || '0') * HOUR;

const shot = () => {
  const s = SAVE.load();
  return {
    inventory: s.inventory.map(i => i.uid).sort(),
    wallet: s.wallet.sunbeams,
    offers: (s.ransoms || []).map(r => ({ uid: r.uid, price: r.price, lapsed: !!r.lapsed, paid: !!r.paid }))
  };
};

if (mode === 'seed') {
  SAVE.wipe();
  SAVE.merge({ inventory: [{ uid: 'u1', id: 'bloodstone_aggie', tier: 'rare' }], wallet: { sunbeams: 1000 } });
  console.log(JSON.stringify(shot()));
} else if (mode === 'prices') {
  console.log(JSON.stringify({
    common: R.priceFor('common', T), uncommon: R.priceFor('uncommon', T),
    rare: R.priceFor('rare', T), epic: R.priceFor('epic', T), grail: R.priceFor('grail', T),
    hours: T.economy.ransom.windowHours
  }));
} else if (mode === 'lose-and-die') {
  // the settle already took it out of the inventory; the offer is written next
  SAVE.update((s) => { s.inventory = s.inventory.filter(i => i.uid !== 'u1'); });
  const made = R.offerFor([{ uid: 'u1', id: 'bloodstone_aggie', tier: 'rare', name: 'Bloodstone Aggie' }],
    'Dusty Coyle', T, at);
  console.log(JSON.stringify({ made: made.length, expires: made[0] && made[0].expires, snap: shot() }));
  process.kill(process.pid, 'SIGKILL');
} else if (mode === 'lose-common') {
  SAVE.update((s) => { s.inventory = s.inventory.filter(i => i.uid !== 'u9'); });
  const made = R.offerFor([{ uid: 'u9', id: 'dirt_plain', tier: 'common', name: 'Dirt Plain' }],
    'Dusty Coyle', T, at);
  console.log(JSON.stringify({ made: made.length, offers: shot().offers.length }));
} else if (mode === 'open') {
  const open = R.openOffers(at);
  console.log(JSON.stringify({
    open: open.length, price: open[0] && open[0].price, words: open[0] && R.timeLeftWords(open[0].msLeft),
    snap: shot()
  }));
} else if (mode === 'pay') {
  const r = R.pay('u1', at);
  console.log(JSON.stringify({ ok: r.ok, reason: r.reason, paid: r.paid, snap: shot() }));
} else if (mode === 'poor') {
  SAVE.update((s) => { s.wallet.sunbeams = 10; });
  const r = R.pay('u1', at);
  console.log(JSON.stringify({ ok: r.ok, reason: r.reason, snap: shot() }));
} else if (mode === 'boot') {
  const sw = R.sweepOnBoot(at);
  console.log(JSON.stringify({ lapsed: sw.lapsed, snap: shot(), history: R.history().length }));
}
`;
const CHILD_FILE = join(dir, 'child.mjs');
writeFileSync(CHILD_FILE, CHILD);

const run = (mode, hours) => {
  try {
    const out = execFileSync('node', [CHILD_FILE, mode, String(hours || 0)], { encoding: 'utf8' });
    return JSON.parse(out.trim().split('\n').pop());
  } catch (e) {
    const out = ((e.stdout || '') + '').trim();
    return out ? Object.assign(JSON.parse(out.split('\n').pop()), { killed: true, signal: e.signal })
      : { killed: true, signal: e.signal, empty: true };
  }
};

/* ---- 1: the price is the design's price ---- */
const p = run('prices');
say(p.rare === 400 && p.epic === 1500 && p.grail === 5000,
  '1. the prices are the design\'s: rare ' + p.rare + ', epic ' + p.epic + ', grail ' + p.grail);
say(p.common === 0 && p.uncommon === 0,
  '   and a common or an uncommon is never ransomed, because the clay pool has to stay free');
say(p.hours === 24, '   and the window is ' + p.hours + ' hours');

run('seed');
const skipped = run('lose-common', 0);
say(skipped.made === 0 && skipped.offers === 0,
  '   losing a common opens no offer at all: ' + skipped.offers + ' on the books');

/* ---- 2: it survives a killed process ---- */
run('seed');
const died = run('lose-and-die', 0);
say(died.made === 1, '2. losing a rare opens exactly one offer');
say(died.killed === true && died.signal === 'SIGKILL', '   and then the process was killed outright');
say(died.snap.inventory.length === 0,
  '   the marble had already left the inventory, and it is not in it now: ' + JSON.stringify(died.snap.inventory));

const open1 = run('open', 1);
say(open1.open === 1 && open1.price === 400,
  '   the offer survived the crash with its price: ' + open1.price + ' sunbeams');
say(open1.words === '23 hours left', '   and its deadline came through the crash intact: ' + open1.words);

/* ---- 3 and 4: paying, once ---- */
const paid = run('pay', 2);
say(paid.ok === true && paid.paid === 400, '3. paying costs exactly the price: ' + paid.paid);
say(paid.snap.inventory.join(',') === 'u1',
  '   and the marble comes home exactly once: ' + paid.snap.inventory.join(','));
say(paid.snap.wallet === 600, '   and the wallet went 1000 to ' + paid.snap.wallet);

const again = run('pay', 3);
say(again.ok === false, '4. paying twice is refused: ' + again.reason);
say(again.snap.inventory.join(',') === 'u1' && again.snap.wallet === 600,
  '   and the second refusal moved nothing: ' + again.snap.inventory.join(',') + ', ' + again.snap.wallet);

/* ---- 5: too poor ---- */
run('seed');
run('lose-and-die', 0);
const poor = run('poor', 1);
say(poor.ok === false && poor.reason.indexOf('400') >= 0,
  '5. too poor is a refusal that says the number: ' + poor.reason);
say(poor.snap.inventory.length === 0 && poor.snap.wallet === 10,
  '   and nothing moved: wallet ' + poor.snap.wallet + ', inventory ' + poor.snap.inventory.length);

/* ---- 6: the window closes once ---- */
const late = run('open', 25);
say(late.open === 0, '6. past 24 hours the offer is gone from the open list: ' + late.open);
const lapsedPay = run('pay', 26);
say(lapsedPay.ok === false && lapsedPay.reason.indexOf('window closed') >= 0,
  '   and it cannot be paid: ' + lapsedPay.reason);
const boot1 = run('boot', 27);
say(boot1.lapsed === 0, '   it had already lapsed, so a boot lapses nothing more: ' + boot1.lapsed);
say(boot1.history === 1,
  '   and the offer is KEPT rather than deleted, because a marble that vanishes silently '
  + 'looks like a bug: ' + boot1.history + ' in the history');
say(boot1.snap.inventory.length === 0 && boot1.snap.wallet === 10,
  '   and the lapse took nothing extra: wallet ' + boot1.snap.wallet);

rmSync(dir, { recursive: true, force: true });
console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nRANSOM FAILED'); process.exit(1); }
console.log('RANSOM OK');
