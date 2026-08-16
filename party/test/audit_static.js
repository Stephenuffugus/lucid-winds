/* WHACK BOX static gate. Node only, no browser.
 *
 * ⛔ WHY THIS EXISTS ALONGSIDE test/drive.js. The driver is the real gate: it
 * runs a title start to podium in real tabs. It also needs a browser and four
 * hundred seconds a title, and this box has two cores. This proves the things
 * that a browser cannot prove any better than a parser can, in a second, so a
 * broken wire is caught before anybody spends four hundred seconds on it.
 *
 * ⛔⛔ EVERY CHECK IN HERE WAS WATCHED FAIL ON PURPOSE. A gate you have not seen
 * go red is decoration. What each one caught when deliberately broken:
 *
 *   FILES        renamed games/bearing/player.js       -> missing module file
 *   BANK GLOBAL  renamed window.BEARING_BANK           -> host reads a bank nothing sets
 *   IDS          deleted id="wm-qin" from the markup   -> host writes to a missing element
 *   PHASES       renamed the 'guess' case in samesoil  -> phone ignores a phase the host sets
 *   COMPLETE     commented out PartyShell.gameComplete -> a game that can never end
 *   DASHES       put an em dash in a catalogue blurb   -> house rule breach in player copy
 *   BANK DUPES   copied one mothlight entry            -> the same fact twice in one night
 *   IDENTITY     collapsed the tab marker to one key   -> the practice-room-of-one bug returns
 *   PRESENCE     put order.length back in the early end -> the room waits on somebody who left
 *   EXITS        removed mothlight's Another game      -> a podium with no way out
 *
 * Usage: node test/audit_static.js   (from party/)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const has = f => fs.existsSync(path.join(ROOT, f));

const fails = [];
const notes = [];
function fail(check, why) { fails.push(check.padEnd(9) + ' ' + why); }

/* the catalogue is the single list, so everything else is measured against it */
const catBox = { window: {} };
new vm.Script(R('catalogue.js')).runInNewContext(catBox);
const CAT = catBox.window.WHACKBOX_CATALOGUE || [];
if (!CAT.length) fail('CATALOGUE', 'window.WHACKBOX_CATALOGUE is empty');

/* ---------- 1. every referenced module file exists ---------- */
const NEEDED = ['host.js', 'player.js', 'game.css', 'content.js'];
CAT.forEach(c => {
  NEEDED.forEach(f => {
    if (!has(`games/${c.slug}/${f}`)) fail('FILES', `${c.slug} has no ${f}`);
  });
  if (!(c.min >= 2 && c.max >= c.min && c.mins > 0))
    fail('FILES', `${c.slug} has a nonsense player count or length`);
});

/* ---------- 2. the bank global a host reads is the one content.js sets ---------- */
CAT.forEach(c => {
  const host = R(`games/${c.slug}/host.js`);
  const content = R(`games/${c.slug}/content.js`);
  const wants = [...host.matchAll(/window\.([A-Z][A-Z0-9_]+)/g)].map(m => m[1]);
  const sets = new Set([...content.matchAll(/window\.([A-Z][A-Z0-9_]+)\s*=/g)].map(m => m[1]));
  wants.forEach(w => {
    if (!sets.has(w)) fail('BANK', `${c.slug}/host.js reads window.${w}, which no content.js sets`);
  });
  if (!wants.length) fail('BANK', `${c.slug}/host.js reads no bank global at all`);
});

/* ---------- 3. every element id a module reads is an id something writes ----------
   The shell owns some ids; a module owns the rest, in the innerHTML it writes at
   load. An id read but never written is a silent null crash the first time that
   line runs, which on a party night is somebody's whole round. */
const SHELL_IDS = new Set();
[R('host.html'), R('play.html'), R('shell/host.js'), R('shell/player.js')]
  .forEach(src => {
    [...src.matchAll(/id="([a-z0-9-]+)"/g)].forEach(m => SHELL_IDS.add(m[1]));
    [...src.matchAll(/id='([a-z0-9-]+)'/g)].forEach(m => SHELL_IDS.add(m[1]));
  });
CAT.forEach(c => {
  ['host.js', 'player.js'].forEach(which => {
    const src = R(`games/${c.slug}/${which}`);
    const written = new Set(SHELL_IDS);
    [...src.matchAll(/id="([a-z0-9-]+)"/g)].forEach(m => written.add(m[1]));
    /* ids built at runtime from a loop variable cannot be checked and are not
       used anywhere in this pack; a template literal would show up here */
    [...src.matchAll(/\$\('([a-z0-9-]+)'\)/g)].forEach(m => {
      if (!written.has(m[1])) fail('IDS', `${c.slug}/${which} reads #${m[1]}, which nothing writes`);
    });
  });
});

/* ---------- 4. the phase machine: host and phone agree, and nothing is orphaned ---------- */
CAT.forEach(c => {
  const host = R(`games/${c.slug}/host.js`);
  const player = R(`games/${c.slug}/player.js`);
  const set = new Set([...host.matchAll(/setPhase\('([a-z]+)'/g)].map(m => m[1]));
  const handled = new Set([...player.matchAll(/name==='([a-z]+)'/g)].map(m => m[1]));
  set.forEach(p => {
    if (!handled.has(p)) fail('PHASES', `${c.slug} host sets phase '${p}' and the phone ignores it`);
  });
  /* 'over' is the shell's own terminal message and every phone must render it,
     or a finished game leaves the room staring at the last question */
  if (!handled.has('over')) fail('PHASES', `${c.slug}/player.js never handles 'over'`);
  handled.forEach(p => {
    if (p !== 'over' && !set.has(p))
      notes.push(`${c.slug}/player.js handles '${p}', which its host never sets`);
  });
});

/* ---------- 5. every title can actually end ---------- */
CAT.forEach(c => {
  const host = R(`games/${c.slug}/host.js`);
  if (!/PartyShell\.gameComplete\(/.test(host))
    fail('COMPLETE', `${c.slug} never calls gameComplete, so the room can never finish`);
  if (!/document\.addEventListener\('party-started'/.test(host))
    fail('COMPLETE', `${c.slug} never listens for party-started, so it can never begin`);
});

/* ---------- 6. no dash characters in player facing copy ----------
   House rule, and the banks are already covered by bank_audit.js. This is the
   half nobody was checking: the copy baked into the modules and the catalogue. */
const DASH = /[‐-―−]/;
const COPY_FILES = ['catalogue.js', 'host.html', 'play.html', 'shell/host.js', 'shell/player.js']
  .concat(CAT.flatMap(c => [`games/${c.slug}/host.js`, `games/${c.slug}/player.js`]));
COPY_FILES.forEach(f => {
  R(f).split('\n').forEach((line, i) => {
    if (DASH.test(line)) fail('DASHES', `${f}:${i + 1} has a dash character`);
  });
});

/* ---------- 7. no duplicate entries in any bank ---------- */
const BANK_GLOBAL = {
  mothlight: 'MOTHLIGHT_BANK', firefly: 'FIREFLY_BANK', liftingfog: 'LIFTINGFOG_BANK',
  firstfrost: 'FIRSTFROST_BANK', samesoil: 'SAMESOIL_BANK', widemargin: 'WIDEMARGIN_BANK',
  bearing: 'BEARING_BANK', understudy: 'UNDERSTUDY_BANK', moongraft: 'MOONGRAFT_LAYERS'
};
function bankKey(slug, e) {
  if (e.text) return String(e.text).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (e.q) return String(e.q).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (e.clues) return e.clues.join('|').toLowerCase();
  if (e.a && e.b) return [String(e.a).toLowerCase(), String(e.b).toLowerCase()].sort().join(' / ');
  return e.key || JSON.stringify(e);
}
let bankTotal = 0;
CAT.forEach(c => {
  const g = BANK_GLOBAL[c.slug];
  if (!g) return fail('BANK', `${c.slug} is not in this checker's bank map`);
  const sb = { window: {} };
  new vm.Script(R(`games/${c.slug}/content.js`)).runInNewContext(sb);
  const b = sb.window[g] || [];
  bankTotal += b.length;
  if (!b.length) fail('BANK', `${c.slug} bank is empty`);
  if (b.length < c.min * 2) notes.push(`${c.slug} bank is only ${b.length} entries`);
  const ids = new Set(), keys = new Map();
  b.forEach(e => {
    const id = e.id || e.key;
    if (ids.has(id)) fail('DUPES', `${c.slug} has two entries with id ${id}`);
    ids.add(id);
    const k = bankKey(c.slug, e);
    if (keys.has(k)) fail('DUPES', `${c.slug} ${id} repeats ${keys.get(k)}: ${k.slice(0, 50)}`);
    keys.set(k, id);
  });
});

/* ---------- 8. one identity per TAB, not per browser ----------
   This is the bug that capped a practice room at one player: a single
   localStorage key meant every tab of the same browser reported the same id.
   Two things have to stay true at once and this asserts both, so the fix cannot
   quietly regress into either half. */
{
  const t = R('shell/transport.js');
  if (!/sessionStorage\.(getItem|setItem)\('party_tab'/.test(t))
    fail('IDENTITY', 'transport.js no longer keys the player id off a per tab sessionStorage marker');
  if (!/localStorage\.getItem\(key\)/.test(t))
    fail('IDENTITY', 'transport.js no longer persists the id, so a reload cannot rejoin as the same player');
}

/* ---------- 9. the early end waits for the ROOM, never for the start roster ----------
   Five titles end a round when everybody has acted. Measured against the roster
   captured at kick off, one person leaving makes the whole room sit out the full
   clock on every remaining round, which is the exact thing the brief says never
   to do. */
CAT.forEach(c => {
  const host = R(`games/${c.slug}/host.js`);
  const early = /stopTimer\(\);\s*phase(Reveal|Guess)\(\)/.test(host);
  if (!early) return;
  const lines = host.split('\n');
  lines.forEach((line, i) => {
    if (!/stopTimer\(\);\s*phase(Reveal|Guess)\(\)/.test(line)) return;
    const cond = lines.slice(Math.max(0, i - 2), i + 1).join(' ');
    if (/order\.length/.test(cond))
      fail('PRESENCE', `${c.slug}:${i + 1} ends a round early against order.length, not against who is present`);
  });
  if (!/PartyShell\.presentPlayers\(\)/.test(host))
    fail('PRESENCE', `${c.slug} ends rounds early but never asks the shell who is present`);
});

/* ---------- 10. a podium always offers a way out of the room ---------- */
CAT.forEach(c => {
  const host = R(`games/${c.slug}/host.js`);
  if (!/backToPicker\(\)/.test(host))
    fail('EXITS', `${c.slug} has no Another game control, so the room cannot change titles`);
  if (!/closeRoom\(\)/.test(host))
    fail('EXITS', `${c.slug} has no End night control`);
});
/* and the lobby, which is where a title with an unreachable minimum traps a room */
if (!/id="ps-lobby-back"/.test(R('host.html')))
  fail('EXITS', 'the lobby has no way back to the picker, so an unmet minimum is a dead end');
/* and the phone, which reads host silence as a drop unless it is told otherwise */
if (!/'bye'/.test(R('shell/player.js')) || !/t:'bye'/.test(R('shell/host.js')))
  fail('EXITS', 'closing the room does not say goodbye, so every phone waits forever for a dead host');

/* ---------- report ---------- */
console.log(`WHACK BOX static gate: ${CAT.length} titles, ${bankTotal} bank entries`);
if (notes.length) {
  console.log(`\nWORTH A GLANCE (${notes.length}, not failures)`);
  notes.forEach(n => console.log('  ' + n));
}
if (!fails.length) { console.log('\nSTATIC: clean'); process.exit(0); }
console.log(`\nSTATIC: ${fails.length} problems`);
fails.forEach(f => console.log('  ' + f));
process.exit(1);
