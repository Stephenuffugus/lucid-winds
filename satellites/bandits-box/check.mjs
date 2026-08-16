/* Bandit's Box static check.
 *
 *   node check.mjs [dir]
 *
 * There is no browser in this lane, so this reads the source and proves what
 * source can prove. Every check below was watched FAILING against a
 * deliberately broken copy before it was trusted — a check nobody has seen go
 * red is decoration.
 *
 * What it proves:
 *   1  every script block parses (real JS parse, not a brace count)
 *   2  no literal </script> inside a JS string (truncates the block silently)
 *   3  every toy in TOYS has a section, a pointer handler and a sound
 *   4  no toy region is a stub
 *   5  every sound name spoken exists in V and has a ripple colour
 *   6  every SFX_MANIFEST name, live or commented, is a real voice
 *   7  no dash characters in player facing copy
 *   8  the service worker only ever deletes its own caches
 *   9  SHELL_VERSION and the registration ?v= move in lockstep
 *  10  the 48px floor for the controls it knows about
 *  11  window.storage (the artifact sandbox API) is gone
 *
 * What it CANNOT prove: that anything feels right, that a gesture works, that
 * a toy is fun, or that a control is reachable in the layout as rendered.
 * That is what fingers and screenshots are for.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const DIR = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));
const fail = [];
const warn = [];
const note = (a, m) => a.push(m);

const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const sw   = fs.readFileSync(path.join(DIR, 'sw.js'), 'utf8');

/* ---------- 1. every script block parses ---------- */
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!blocks.length) note(fail, 'no script blocks found at all');
blocks.forEach((src, i) => {
  try { new vm.Script(src); }
  catch (e) { note(fail, `script block ${i + 1} does not parse: ${e.message}`); }
});
const js = blocks.join('\n');

/* ---------- 2. no literal </script> inside a string ----------
   A "</script>" inside a JS string ends the block where the browser is
   concerned. The regex above would have swallowed it too, which is exactly how
   this hides: the checker and the browser agree on the wrong answer. Look for
   the close tag anywhere the source is not actually ending a block. */
const closeTags = [...html.matchAll(/<\/script\s*>/gi)].length;
const openTags  = [...html.matchAll(/<script[\s>]/gi)].length;
if (closeTags !== openTags)
  note(fail, `${openTags} <script> opens vs ${closeTags} closes: a </script> is hiding in a string`);

/* ---------- strip comments, so essays about the code are not read as code ---------- */
const stripComments = s => s
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"\\])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
const jsCode = stripComments(js);

/* ---------- 3 + 4. toys ---------- */
const toyIds = [...js.matchAll(/\{\s*id:'([a-z]+)'\s*,\s*label:/g)].map(m => m[1]);
if (toyIds.length < 20) note(fail, `only ${toyIds.length} toys parsed out of TOYS`);

const sections = {};
for (const m of html.matchAll(/<section class="toy[^"]*" id="toy-([a-z]+)"([\s\S]*?)<\/section>/g))
  sections[m[1]] = m[2];

/* JS split into per toy regions by the TOY banners.
   The LAST region has to stop at the TOYS array, not run to the end of the
   file: everything after it is the picker, the settings and the boot, which
   are full of listeners and sounds. Without this line the last toy in the box
   passes the stub test on other people's code. Found by watching the test go
   green against a coin toy whose handlers had been renamed away. */
const tail = js.indexOf('var TOYS=[');
const banners = [...js.matchAll(/TOY \d+ [—-] [A-Z ]+/g)].map(m => m.index);
const regions = banners.map((start, i) => {
  let end = banners[i + 1] ?? js.length;
  if (tail > start && tail < end) end = tail;
  return js.slice(start, end);
});

const SOUND = /(feel\(|voice\(|V\.[a-z]+\(|tone\(|noiseHit\(|Friction\(|Stretch\()/;
const TOUCH = /addEventListener\(\s*'(pointerdown|click)'/;

for (const id of toyIds) {
  const sec = sections[id];
  if (!sec) { note(fail, `toy "${id}" is in TOYS with no <section id="toy-${id}">`); continue; }

  const secIds = [...sec.matchAll(/\bid="([A-Za-z][\w-]*)"/g)].map(m => m[1]);
  const secCls = new Set([...sec.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
  if (!secIds.length && !secCls.size)
    note(fail, `toy "${id}" section is empty: nothing to touch`);

  // the region that owns this toy is the one naming one of its elements
  const owner = regions.find(r =>
    secIds.some(eid => r.includes(`#${eid}`)) ||
    [...secCls].some(c => r.includes(`.${c}'`) || r.includes(`'.${c}`)));
  if (!owner) { note(fail, `toy "${id}" has a section but no code region that touches it: STUB`); continue; }
  if (!TOUCH.test(owner)) note(fail, `toy "${id}" has no pointerdown or click handler: STUB`);
  if (!SOUND.test(owner)) note(fail, `toy "${id}" makes no sound: STUB`);
  if (owner.replace(/\s/g, '').length < 400) note(fail, `toy "${id}" region is ${owner.length} chars: STUB`);
}

/* ---------- 5. every sound name spoken exists ---------- */
const vBody = js.slice(js.indexOf('var V = {'), js.indexOf('/* ---------- SAMPLE BANK'));
const voices = new Set([...vBody.matchAll(/^\s{2}([a-z]+)\s*:\s*function/gm)].map(m => m[1]));
if (voices.size < 15) note(fail, `only ${voices.size} voices parsed from V: the parse is wrong`);

const ripBody = js.slice(js.indexOf('var RIPCOLOR='), js.indexOf('var BUZZ_MS='));
const ripNames = new Set([...ripBody.matchAll(/([a-z]+)\s*:\s*'#/g)].map(m => m[1]));

const spoken = new Set([
  ...[...jsCode.matchAll(/\bfeel\(\s*'([a-z]+)'/g)].map(m => m[1]),
  ...[...jsCode.matchAll(/\bvoice\(\s*'([a-z]+)'/g)].map(m => m[1]),
]);
// the wall speaks two names through one call site
if (/feel\(on\?'clack':'click'/.test(jsCode.replace(/\s/g, ''))) { spoken.add('click'); spoken.add('clack'); }
for (const nm of spoken) {
  if (!voices.has(nm)) note(fail, `feel('${nm}') has no voice in V: silent call`);
  if (!ripNames.has(nm)) note(fail, `feel('${nm}') has no RIPCOLOR: the sound leaves no mark`);
}

/* ---------- 6. the foley manifest can only name real voices ---------- */
const manBody = js.slice(js.indexOf('var SFX_MANIFEST={'), js.indexOf('function loadSamples'));
for (const m of manBody.matchAll(/^\s*(?:\/\/\s*)?([a-z]+)\s*:\s*\[/gm))
  if (!voices.has(m[1])) note(fail, `SFX_MANIFEST names "${m[1]}", which is not a voice: recordings would never play`);

/* ---------- 7. no dashes in player facing copy ---------- */
const DASH = /[\u2010-\u2015\u2212]|&[mn]dash;|&#82(11|12);|(^| ) - ( |$)/;
const visible = html
  .replace(/<script>[\s\S]*?<\/script>/g, '')
  .replace(/<style>[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '');
for (const line of visible.split('\n')) {
  const text = line.replace(/<[^>]*>/g, ' ');            // element text
  const attrs = [...line.matchAll(/(?:aria-label|title|alt|placeholder)="([^"]*)"/g)].map(m => m[1]);
  for (const s of [text, ...attrs])
    if (DASH.test(s)) note(fail, `dash in player facing copy: ${s.trim().slice(0, 70)}`);
}
// player facing strings set from JS
for (const m of jsCode.matchAll(/\.(textContent|innerHTML)\s*=\s*'([^']{4,})'/g))
  if (DASH.test(m[2])) note(fail, `dash in copy set from JS: ${m[2].slice(0, 70)}`);

/* ---------- 8. the worker only deletes its own caches ---------- */
const PREFIX = 'banditsbox-';
if (!sw.includes(PREFIX)) note(fail, 'sw.js never mentions the banditsbox- prefix');
for (const m of sw.matchAll(/caches\.delete/g)) {
  // the guard has to be in the same statement, within the filter above it
  const before = sw.slice(Math.max(0, m.index - 400), m.index);
  if (!before.includes(PREFIX))
    note(fail, 'a caches.delete in sw.js is not guarded by the banditsbox- prefix: ORIGIN WIDE WIPE');
}
for (const name of sw.matchAll(/(?:const|let|var)\s+\w+\s*=\s*"([^"]*)"/g))
  if (/cache|shell|sfx/i.test(name[1]) && !name[1].startsWith(PREFIX))
    note(fail, `sw.js cache name "${name[1]}" does not start with ${PREFIX}`);

/* ---------- 9. SHELL_VERSION and the registration move together ---------- */
const shellV = (sw.match(/SHELL_VERSION\s*=\s*"banditsbox-shell-v(\d+)"/) || [])[1];
const regV   = (html.match(/register\('\.\/sw\.js\?v=(\d+)'\)/) || [])[1];
if (!shellV) note(fail, 'no SHELL_VERSION in sw.js');
else if (!regV) note(fail, 'the service worker registration has no ?v= stamp');
else if (shellV !== regV)
  note(fail, `SHELL_VERSION is v${shellV} but the registration asks for ?v=${regV}: the update will never be seen`);

/* ---------- 10. the 48px floor ---------- */
// comments out first: a rule preceded by an essay is still a rule
const css = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1]
  .replace(/\/\*[\s\S]*?\*\//g, '\n}\n');
const rulesFor = sel => [...css.matchAll(
  new RegExp('(^|[,{}])\\s*' + sel.replace(/[.#]/g, c => '\\' + c) + '\\s*(?=[,{])[^{]*\\{([^}]*)\\}', 'g'))]
  .map(m => m[2]);
const px = (body, prop) => {
  const hits = [...body.matchAll(new RegExp(prop + '\\s*:\\s*(\\d+(?:\\.\\d+)?)px', 'g'))];
  return hits.length ? Math.max(...hits.map(h => +h[1])) : 0;
};
/* Controls a finger has to find. A new one added later will NOT appear here on
   its own — this list is maintained by hand, which is a real limitation and
   the reason the audit notes say to measure new controls when you add them. */
const CONTROLS = ['.tab', '.iconbtn', '.testbtn', '.sizes button', '.weights button',
  '.slimebar button', '.sandbar button', '.flavbar button', '.mini', '.swatch',
  '.chip', '.ball', '.bead', '.sw', '.tgl', '.snap', '.push', '#exitBig', '#bigHome'];
for (const sel of CONTROLS) {
  const bodies = rulesFor(sel);
  if (!bodies.length) { note(warn, `no CSS rule found for control ${sel}`); continue; }
  let reach = Math.max(...bodies.map(b => Math.max(px(b, 'height'), px(b, 'min-height'))));
  const pseudo = rulesFor(sel + '::before').concat(rulesFor(sel + '::after'));
  for (const p of pseudo) {
    const outs = [...p.matchAll(/(?:top|bottom|left|right|inset)\s*:\s*-(\d+(?:\.\d+)?)px/g)]
      .map(m => +m[1]);
    if (outs.length) reach += Math.max(...outs) * 2;
  }
  if (reach < 48) note(fail, `${sel} reaches ${reach}px: under the 48px floor`);
}

/* ---------- 11. the artifact sandbox API is gone ---------- */
if (/window\.storage/.test(jsCode)) note(fail, 'window.storage is back: settings will silently never persist');
if (!/localStorage\.setItem\('bandit-set'/.test(jsCode)) note(fail, 'settings are not written to localStorage');

/* ---------- 12. it boots ----------
   The main block is one IIFE-shaped run of top level code: a single typo in an
   element id gives null.addEventListener, which kills EVERY function below it
   and the app is a dead screen. Nothing static catches that, so run the real
   source against a DOM that knows exactly which ids and classes this HTML has
   and returns null for anything else, exactly as a browser would.

   AudioContext is deliberately absent, so this also walks house rule 1: the
   screen must come up with no audio at all. */
{
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  const classes = new Set([...html.matchAll(/\sclass="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
  const seen = new Set();
  const node = () => {
    const o = {
      style: new Proxy({}, { get: () => '', set: () => true }),
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      children: [], firstChild: null, firstElementChild: null,
      value: '', textContent: '', innerHTML: '', disabled: false, scrollLeft: 0,
      clientWidth: 300, clientHeight: 300, scrollWidth: 300,
      addEventListener() {}, removeEventListener() {}, setAttribute() {},
      getAttribute: () => '0', removeAttribute() {}, appendChild() {}, insertBefore() {},
      remove() {}, closest: () => null, setPointerCapture() {}, focus() {},
      scrollIntoView() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 400 }),
      querySelector: sel => q(sel), querySelectorAll: () => [],
      getContext: () => null, click() {},
    };
    return o;
  };
  const q = sel => {
    if (!sel) return null;
    seen.add(sel);
    const id = sel.match(/^#([\w-]+)$/);
    if (id) return ids.has(id[1]) ? node() : null;
    const cls = sel.match(/^\.([\w-]+)$/);
    if (cls) return classes.has(cls[1]) ? node() : null;
    return node();                       // compound selectors: assume present
  };
  const sandbox = {
    console: { warn() {}, log() {}, error() {} },
    document: {
      body: node(), head: node(), documentElement: node(), hidden: false,
      querySelector: q, querySelectorAll: () => [],
      getElementById: id => (ids.has(id) ? node() : null),
      createElement: node, createElementNS: node,
      addEventListener() {}, createDocumentFragment: node, referrer: '',
    },
    navigator: { vibrate: () => true, serviceWorker: { register() {} } },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    innerWidth: 375, innerHeight: 667, visualViewport: { height: 667 },
    location: { protocol: 'https:', href: '', replace() {} },
    history: { length: 1, back() {} }, parent: null,
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    Blob: function () {}, URL: { createObjectURL: () => 'blob:x' },
    addEventListener() {}, Promise, Math, JSON, Object, Array, String, Number, Date,
    isNaN, parseInt, parseFloat,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  try {
    vm.createContext(sandbox);
    for (const src of blocks) new vm.Script(src).runInContext(sandbox, { timeout: 5000 });
  } catch (e) {
    note(fail, `the app throws while booting with no audio: ${e.message}`);
  }
}

/* ---------- report ---------- */
const toys = toyIds.length;
if (fail.length) {
  console.log(`FAIL (${fail.length})`);
  fail.forEach(f => console.log('  x ' + f));
}
warn.forEach(w => console.log('  ? ' + w));
if (!fail.length)
  console.log(`PASS  ${toys} toys, ${voices.size} voices, ${blocks.length} script blocks, worker v${shellV}`);
process.exit(fail.length ? 1 : 0);
