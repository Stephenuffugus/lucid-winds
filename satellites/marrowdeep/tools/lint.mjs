#!/usr/bin/env node
/* The studio laws, checked against the SHIPPED file.
 *
 *   node tools/lint.mjs
 *
 * A brace counter cannot read index.html: the CSS carries braces and parens,
 * the SVG symbols carry both, and the script carries regexes. So the syntax
 * check is `vm.createScript` over the real script block and nothing else. That
 * is the fleet's oldest scar: a stray `);` in dead code inside lucid winds
 * killed eleven thousand lines of a working game and every brace counter in the
 * repo called the file balanced.
 *
 * What it asserts, each one watched red before it counted:
 *   1.  the script block parses
 *   2.  nothing loaded at runtime is a .mjs (this host serves .mjs as text/plain)
 *   3.  every local asset the page pulls carries a ?v= stamp
 *   4.  the six places the stamp lives are one string: the three stamped links
 *       in the head, the music include, `var STAMP`, and sw.js SHELL_VERSION
 *   5.  the service worker only ever deletes marrowdeep-* caches
 *   6.  no dash and no exclamation point in anything a player reads, which for
 *       this game means three separate populations: every string inside the
 *       DATA block, every text node in the body, and the strings the game
 *       COMPOSES (the card templates rendered, and the ui label table)
 *   7.  the brand is Sky Wolf Studio, singular
 *   8.  no shadowBlur
 *   9.  no CSS font under 0.7 rem, which is 11.2 px at a 16 px root
 *   10. no object literal declares the same key twice, in the code's own
 *       literals (see the note at rule 10 for the half it cannot read)
 *   11. a `.screen` rule that scrolls does not also centre on the cross axis
 *
 * ⛔ WHAT THIS GATE CANNOT SEE, so that nobody reads a green here as a green
 * everywhere:
 *   - Relic names and character names are GENERATED (three word lists and two
 *     name banks run through the engine), so no grep can read them. They are
 *     checked by `node sim.js --data`, which generates a thousand of each and
 *     applies this same copy law to the results. This file checks what is
 *     written down; that one checks what comes out of the generator.
 *   - A font size in px, inherited from a shrunken parent, or scaled by a
 *     transform is invisible to rule 9. The measured half of that law is
 *     `test/layout.mjs`, which reads getComputedStyle on every element with a
 *     text node at 375x667 and 320x568 (HANDOFF section 2: the grep is HALF a
 *     gate and Marrowdeep would otherwise inherit only the weak half).
 *   - `Math.random`, `Date` and the DOM inside the SIM export are refused by
 *     sim.js at extract time, not here.
 */
import { readFileSync } from 'node:fs';
import { dupKeys } from '../../../tools/dupkeys.mjs';
import { createScript, createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
const SW = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
const lineOf = i => HTML.slice(0, i).split('\n').length;

/* ---------- 1. the script parses ---------- */
const sOpen = HTML.indexOf('<script>', HTML.indexOf('</style>'));
const sEnd = HTML.lastIndexOf('</script>');
const JS = HTML.slice(sOpen + 8, sEnd);
let parsed = true, why = '';
try { createScript(JS, { filename: 'marrowdeep-inline.js' }); }
catch (e) { parsed = false; why = String(e && e.message || e); }
say(parsed, 'the script block parses' + (parsed ? ' (' + JS.split('\n').length + ' lines)' : ': ' + why));

/* ---------- 2. no .mjs at runtime ----------
   The host serves .mjs as text/plain, so an import of one is a blank screen
   with nothing in the console but a MIME refusal. Node tools are .mjs, runtime
   modules are .js, and the service worker's shell list counts as runtime. */
const runtimeMjs = (HTML.match(/(?:src|href)\s*=\s*"[^"]*\.mjs/g) || [])
  .concat(SW.match(/"[^"]*\.mjs"/g) || []);
say(runtimeMjs.length === 0, 'nothing loaded at runtime is a .mjs'
  + (runtimeMjs.length ? ': ' + runtimeMjs.join(', ') : ' (page and worker both clean)'));

/* ---------- 3. every local asset carries a stamp ----------
   This host edge pins a bare URL for days. An unstamped one comes back stale
   after a deploy and the player runs half of yesterday's game. */
const urls = [...HTML.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)].map(m => m[1])
  .filter(u => !/^https?:|^data:|^#/.test(u));
const unstamped = urls.filter(u => u.indexOf('?v=') < 0);
say(unstamped.length === 0, 'every local asset carries a ?v= stamp'
  + (unstamped.length ? ': ' + unstamped.join(', ') : ' (' + urls.length + ' of them)'));

/* ---------- 4. one stamp, six places ----------
   ⛔ A COUNT IS NOT A LAW. This does not assert "there are exactly six": the
   day a fourth stamped link joins the head the law is unchanged and a count
   would go red over nothing. It asserts that every stamp sighting in the two
   files reads the same string, and it NAMES the six the plan lists so that a
   place going missing is visible in the printout rather than passing by being
   absent. The registration is a seventh sighting and cannot drift, because it
   is built as './sw.js?v=' + STAMP; it is asserted anyway, because the day
   someone types the stamp there as a literal is the day it starts drifting. */
const seen = [];
const HEAD = HTML.slice(0, HTML.indexOf('</head>'));
for (const m of HEAD.matchAll(/(?:src|href)\s*=\s*"([^"]*)\?v=([^"&]+)"/g)) {
  seen.push({ where: 'head ' + m[1] + ' (line ' + lineOf(m.index) + ')', v: m[2] });
}
const music = HTML.match(/src\s*=\s*"[^"]*music-unlocks\.js\?v=([^"&]+)"/);
if (music) seen.push({ where: 'the music include', v: music[1] });
const stampM = JS.match(/var STAMP = '([^']+)'/);
if (stampM) seen.push({ where: 'var STAMP', v: stampM[1] });
const shellM = SW.match(/const SHELL_VERSION = "marrowdeep-shell-([^"]+)"/);
if (shellM) seen.push({ where: 'sw.js SHELL_VERSION', v: shellM[1] });

const headCount = seen.filter(s => s.where.indexOf('head ') === 0).length;
say(headCount >= 3 && !!music && !!stampM && !!shellM,
  'the stamp is written in all six of its places'
  + ' (head links ' + headCount + ', music include ' + (music ? 'yes' : 'MISSING')
  + ', var STAMP ' + (stampM ? 'yes' : 'MISSING')
  + ', sw.js SHELL_VERSION ' + (shellM ? 'yes' : 'MISSING') + ')');
const odd = seen.filter(s => s.v !== (seen[0] && seen[0].v));
say(seen.length > 0 && odd.length === 0, 'and all of them read one string'
  + (odd.length ? ': ' + odd.map(s => s.where + ' says ' + s.v).join(', ') + ', against ' + seen[0].v
    : ': ' + (seen[0] ? seen[0].v : 'nothing') + ' in ' + seen.length + ' places'));
say(/register\('\.\/sw\.js\?v=' \+ STAMP\)/.test(JS),
  'and the worker registration is built from STAMP rather than typed again');

/* ---------- 5. the worker's blast radius ----------
   caches.keys() is ORIGIN wide. A worker that deletes what it does not
   recognise wipes every other satellite on lucidwinds.com. */
const deletes = [...SW.matchAll(/indexOf\("([^"]+)"\)\s*===\s*0/g)].map(m => m[1]);
say(deletes.length > 0 && deletes.every(p => p.indexOf('marrowdeep-') === 0),
  'the worker only ever deletes marrowdeep-* caches'
  + (deletes.length ? ' (filters on ' + deletes.join(', ') + ')' : ': it filters on nothing'));
say(SW.indexOf('fathom-') < 0 && SW.indexOf('deepwell') < 0 && SW.indexOf('keepsies') < 0,
  'and it carries no other satellite name, which is how a copied worker gets caught');

/* ---------- 6. the copy law ----------
   No dash of any kind and no exclamation point in anything a player reads.
   Every character the studio law names, spelled out so a reader can check the
   list: hyphen minus, hyphen, non breaking hyphen, figure dash, en dash, em
   dash, horizontal bar, minus sign. */
const DASH = /[-‐‑‒–—―−]/;
const copy = [];                                   /* { src, s } */
const add = (src, s) => { if (typeof s === 'string' && s.trim().length > 1) copy.push({ src, s }); };

/* 6a. every text node in the body. Comments come out FIRST and by themselves:
   prose is allowed its dashes and a comment that reached this pool would make
   the gate cry on code that is already correct, which teaches a reader to
   ignore it just as surely as a gate that never fires. */
const body = HTML.slice(HTML.indexOf('<body>'))
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ');
for (const t of body.replace(/<[^>]*>/g, '\n').split('\n').map(t => t.trim())) {
  if (t.length > 1 && !/^&#\d+;$/.test(t)) add('a text node in the body', t);
}

/* 6b. the strings the script hands the screen directly. VIEW reads its copy out
   of DATA.lines, which is the law (R10.7), so this pool should stay small; it
   exists to catch the line somebody types straight into the page in a hurry.
   ⛔ The closing paren is NOT part of these matches: toast('...', 3600) carries
   a length after the string, and a regex that wanted `') let a dash walk
   through this gate in a sibling game on Sep 08. */
for (const m of JS.matchAll(/textContent\s*=\s*'([^']*)'/g)) add('a textContent literal', m[1]);
for (const m of JS.matchAll(/toast\('([^']*)'/g)) add('a toast', m[1]);
for (const m of JS.matchAll(/hintLine\('([^']*)'/g)) add('a hint line', m[1]);
for (const m of JS.matchAll(/line\('[^']*',\s*'([^']*)'/g)) add('a line() fallback', m[1]);

/* 6c. THE COMPOSED ONES. The DATA block is loaded, not grepped, because what a
   player reads is the VALUE after the generator has been at it. Three
   populations come out of it: every string in the banks; the ui label table,
   whose KEYS are labels too (`ui()` falls back to the key when the table has no
   entry, so a key is a player string whether the author meant it or not); and
   the card templates RENDERED, because a template only becomes a sentence once
   it has a record in it. */
const dStart = HTML.indexOf('// ---- DATA_START ----');
const dEnd = HTML.indexOf('// ---- DATA_END ----');
let BANKS = null, dataWhy = '';
if (dStart < 0 || dEnd < 0) dataWhy = 'the DATA markers are not in index.html';
else {
  try {
    const box = {};
    createContext(box);
    runInContext(HTML.slice(dStart, dEnd) + '\n;__banks = DATA_BANKS;', box, { filename: 'marrowdeep-data.js' });
    BANKS = box.__banks;
  } catch (e) { dataWhy = String(e && e.message || e); }
}
say(!!BANKS, 'the DATA block loads as a literal' + (BANKS ? '' : ': ' + dataWhy));

let bankStrings = 0, rendered = 0, uiLabels = 0;
if (BANKS) {
  const walk = (v, path) => {
    if (typeof v === 'string') { bankStrings++; add('DATA ' + path, v); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, path + '[' + i + ']')); return; }
    if (v && typeof v === 'object') { for (const k of Object.keys(v)) walk(v[k], path + '.' + k); }
  };
  walk(BANKS, 'banks');

  const ui = (BANKS.lines && BANKS.lines.ui) || {};
  for (const k of Object.keys(ui)) { uiLabels++; add('a ui label key', k); }

  /* One plausible record, every field a real one and every value clean, so the
     gate can only go red on the templates and never on its own fixture. */
  const RECORD = {
    name: 'Vessa Corr', origin: 'Ashwalker', calling: 'Vanguard',
    cause: 'went down at the Choir of the Sunk', quests: 4,
    renown: 12, marrow: 3, depth: 'Hollows', stat: 'NERVE', tn: 5,
    relic: 'Salt Bitten Vambrace'
  };
  const cards = (BANKS.lines && BANKS.lines.cards) || {};
  const missing = [];
  for (const k of Object.keys(cards)) {
    if (typeof cards[k] !== 'string') continue;
    rendered++;
    add('the ' + k + ' card, rendered', cards[k].replace(/\{(\w+)\}/g, (m, f) => {
      if (f in RECORD) return String(RECORD[f]);
      missing.push(k + '.{' + f + '}');
      return m;
    }));
  }
  /* A placeholder with nobody to fill it is a brace on the player's screen.
     The renderer that fills them for real is the game's; this only says that
     every field a template asks for is a field somebody supplies. */
  say(missing.length === 0, 'every placeholder in a card template has a value'
    + (missing.length ? ', these have none: ' + missing.join(', ')
      : ' (' + rendered + ' templates rendered)'));

  /* Every ui() call site has an entry. The fallback prints the raw key, which
     looks like a label and is not one, so a missing entry is invisible by eye. */
  const calls = [...JS.matchAll(/\bui\('([^']+)'\)/g)].map(m => m[1]);
  const orphan = [...new Set(calls)].filter(k => !(k in ui));
  say(orphan.length === 0, 'every ui() the page calls is in the label table'
    + (orphan.length ? ': ' + orphan.join(', ') : ' (' + calls.length + ' calls, ' + uiLabels + ' labels)'));
}

const dashed = copy.filter(c => DASH.test(c.s));
const banged = copy.filter(c => c.s.indexOf('!') >= 0);
const show = list => list.slice(0, 4).map(c => c.src + ': ' + JSON.stringify(c.s.slice(0, 70))).join('\n          ');
say(dashed.length === 0, 'no dash in anything a player reads'
  + (dashed.length ? ', ' + dashed.length + ' of them:\n          ' + show(dashed)
    : ' (' + copy.length + ' strings: ' + bankStrings + ' in the banks, ' + uiLabels
      + ' ui labels, ' + rendered + ' rendered cards, the rest in the body)'));
say(banged.length === 0, 'no exclamation point either'
  + (banged.length ? ', ' + banged.length + ' of them:\n          ' + show(banged) : ''));

/* ---------- 7. the brand ---------- */
say(HTML.indexOf('Studios') < 0 && HTML.indexOf('Sky Walk') < 0 && HTML.indexOf('SkyWolf') < 0,
  'the brand is Sky Wolf Studio, singular');
/* The title screen's brand line lands with the rest of the title furniture in
   P1. Until it does this prints as a note and not as a failure, because a gate
   that is red on purpose for a week is a gate everyone learns to walk past. */
console.log('  note    ' + (HTML.indexOf('SKY WOLF STUDIO') >= 0
  ? 'and the title screen says so'
  : 'the title screen does not carry the brand line yet (P1 adds it); turn this note into an assertion then'));

/* ---------- 8 and 9. the two rendering laws ----------
   THE COMMENTS COME OUT FIRST. A sentence in a header saying "no shadowBlur
   anywhere" made this gate red on correct code in a sibling game. */
const CODE = JS.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
const blur = CODE.match(/shadowBlur/g);
say(!blur, 'no shadowBlur in the code' + (blur ? ' (' + blur.length + ' of them)' : ''));

/* 0.7 rem at a 16 px root is 11.2 px, so both units are read against the same
   floor. Only sizes written down are visible here; see the header for what is
   not, and for the gate that measures the rest. */
/* the CSS with its comments taken out, once, for both of the rules that read
   it: a commented out size and a comment sitting above a selector both used to
   land in the printout, and the second one printed a rule's name as the prose
   above it. */
const CSS = HTML.slice(HTML.indexOf('<style>'), HTML.indexOf('</style>'))
  .replace(/\/\*[\s\S]*?\*\//g, ' ');
const sizes = [];
for (const m of CSS.matchAll(/font-size:\s*([0-9]*\.?[0-9]+)(rem|px)\b/g)) {
  sizes.push({ px: m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]), raw: m[1] + m[2] });
}
const tiny = sizes.filter(s => s.px < 11.2);
say(tiny.length === 0, 'no text under 0.7 rem, which is 11.2 px at a 16 px root'
  + (tiny.length ? ': ' + tiny.map(s => s.raw).join(', ')
    : ' (' + sizes.length + ' sizes, smallest ' + Math.min.apply(null, sizes.map(s => s.px)) + ' px)'));

/* ---------- 10. duplicate keys ----------
   ⛔ A key declared twice in one object literal is legal, the second silently
   wins, and no parser, strict mode or console says a word. It cost two
   debugging rounds in one day across this fleet: a test hook that could not be
   made to fail, and a config number that would have vanished on edit.
   ⛔ KNOW WHAT IT READS. dupKeys blanks every string body first, and its key
   pattern is a BARE identifier, so it reads the code's own literals (MD_DEV,
   BALANCE, the module returns) and is BLIND to a quoted key. The DATA block is
   quoted throughout, so this line says nothing whatever about it, and a comment
   here once claimed the opposite. The DATA block's duplicates die upstream
   instead: tools/data.mjs refuses two records with one id, JSON.parse collapses
   a repeated key before the block is ever written, and `tools/data.mjs --check`
   (the `data` gate) refuses a hand edit of the block. Watched red by declaring
   `stamp` twice in MD_DEV. */
const dk = dupKeys(HTML);
say(dk.dups.length === 0, 'no object literal declares the same key twice'
  + (dk.dups.length ? ': ' + dk.dups.map(d => d.name + '.' + d.key + ' on lines ' + d.lines.join(' and ')).join('; ')
    : ' (' + dk.literals + ' literals read)'));
say(dk.unclosed === 0, 'and every literal the sweep opened it could close, so the sweep has no hole in it'
  + (dk.unclosed ? ' (' + dk.unclosed + ' unclosed)' : ''));

/* ---------- 11. the screens scroll, they do not centre ----------
   `justify-content:center` on a rule that also scrolls CLIPS ITS OWN TOP on a
   short phone: the overflow goes off the top edge where no scroll can reach it,
   and four fleet games shipped that way on Sep 06. `.spacer{flex:1 1 auto}`
   does the centring instead. Read on the rule and not on the selector, so it
   also catches whatever a later phase names the panel. */
const rules = [...CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2] }));
const clipping = rules.filter(r =>
  /justify-content:\s*center/.test(r.body)
  && /overflow(-y)?:\s*(auto|scroll)/.test(r.body)
  && (/flex-direction:\s*column/.test(r.body) || r.sel.indexOf('.screen') >= 0));
say(clipping.length === 0, 'no rule both scrolls and centres on the axis it scrolls'
  + (clipping.length ? ': ' + clipping.map(r => r.sel).join(', ')
    : ' (' + rules.length + ' rules read)'));

console.log('');
if (fails.length) { console.log(fails.length + ' LINT FAILURE(S)'); process.exit(1); }
console.log('LINT OK');
