/* THE SHARED ASSERTIONS (00-CORE-handoff section 3; plans/math/HANDOFF-CORE.md P3).
 *
 * The nine games import these into their own gates instead of writing nine copies:
 *   import { assertNoNetworkAfterLoad, ... } from '../../math/core/test/shared.mjs';
 *
 * Every assertion returns { ok, detail } and asserts nothing about a game it was not
 * handed: a page opened with this folder's harness (`open` returns { page, requests }),
 * or a folder on disk. Each is proved red on a planted fault and green on the live demo by
 * test/shared-proof.mjs, so a game importing one is importing something that can fail.
 *
 * What this box cannot measure is not pretended here: sixty frames a second on a school
 * Chromebook (plan 3.5) is Stephen's, so the handoff's assertFrameRate is replaced by
 * assertTimingPicksNearest, which checks that a flash lands on its duration at the frame
 * rate the page actually ran.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const RUNTIME = ['.js', '.html', '.css', '.json', '.webmanifest'];
const SKIP = new Set(['test', 'tools', 'docs', 'node_modules']);
function runtimeFiles(folder, out = []) {
  for (const name of readdirSync(folder)) {
    const p = join(folder, name), st = statSync(p);
    if (st.isDirectory()) { if (!SKIP.has(name)) runtimeFiles(p, out); }
    else if (name !== 'package.json' && RUNTIME.includes(extname(p))) out.push(p);
  }
  return out;
}

/* G2: nothing fetched after load, through a stated quiet window (the layout gate's scar:
   counted at the instant a control answered, a fetch a moment later slipped by) */
export async function assertNoNetworkAfterLoad(opened, { quietMs = 1500 } = {}) {
  await sleep(quietMs);
  const n = opened.requests.length;
  return { ok: n === 0, detail: n + ' requests after load and ' + quietMs + ' ms of quiet' + (n ? ': ' + opened.requests.slice(0, 2).join(', ') : '') };
}

/* G4: no camera and no microphone, anywhere a browser loads */
export function assertNoGetUserMedia(folder) {
  const hits = runtimeFiles(folder).filter(p => /getUserMedia/.test(readFileSync(p, 'utf8'))).map(p => relative(folder, p));
  return { ok: hits.length === 0, detail: hits.length ? 'getUserMedia in ' + hits.join(', ') : 'none in ' + folder };
}

/* G13 and the catalog plan's addition, anywhere in a file a browser loads. */
export const FORBIDDEN = [[/\bIQ\b/, 'IQ'], [/brain[\s-]?train/i, 'brain train'], [/smarter/i, 'smarter'],
  [/cognitive enhance/i, 'cognitive enhance'], [/brain power/i, 'brain power']];

/* What a person reads: the text of a page (scripts, styles, comments and tags taken out) and every string literal
   in its code with the comments taken out. Identifiers and comments are not copy. */
function stripJsComments(src) {
  let out = '', i = 0, q = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (q) { out += c; if (c === '\\') { out += n || ''; i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    out += c; i++;
  }
  return out;
}
const literals = code => Array.from(stripJsComments(code).matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)).map(m => m[2]);
function readable(path) {
  const t = readFileSync(path, 'utf8');
  if (extname(path) === '.js') return literals(t).join('\n');
  if (extname(path) === '.html') {
    const scripts = Array.from(t.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)).map(m => literals(m[1]).join('\n'));
    const text = t.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, '\n');
    return text + '\n' + scripts.join('\n');
  }
  return '';
}

/* The catalog's forbidden words in any runtime file, and a game's own words (SPAN passes answer, solve, equals)
   in what a person reads. ⛔ The first version matched a game's words in raw source too, and its own green case went
   red on a comment in core/pure.js ("the answer it would give"): SPAN's rule is about words a child reads, and code
   is allowed to call a field `answer`. */
export function assertForbiddenStrings(folder, extra = []) {
  const own = extra.map(w => [new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'), w]);
  const hits = [];
  for (const p of runtimeFiles(folder)) {
    const raw = readFileSync(p, 'utf8');
    for (const [re, word] of FORBIDDEN) if (re.test(raw)) hits.push(relative(folder, p) + ' says ' + word);
    if (own.length) {
      const copy = readable(p);
      for (const [re, word] of own) if (re.test(copy)) hits.push(relative(folder, p) + ' shows ' + word);
    }
  }
  return { ok: hits.length === 0, detail: hits.length ? hits.join(', ') : 'none of ' + (FORBIDDEN.length + own.length) + ' words in ' + folder };
}

/* G11: a mode completed by keys alone. `steps` are key names or { key, times } or
   { key: 'Tab', until: selector } (Tab until that element has focus, at most 20). `done` is
   a page function string or function that is true once the mode is complete. A visible
   focus ring has to have been seen on the way. The page should be opened with no touch. */
export async function assertKeyboardCompletable(page, steps, done) {
  let ring = false;
  const look = async () => {
    const f = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const cs = getComputedStyle(a);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    if (f && f.style !== 'none' && f.width >= 2) ring = true;
  };
  for (const step of steps) {
    const s = typeof step === 'string' ? { key: step } : step;
    if (s.until) {
      for (let i = 0; i < 20; i++) {
        if (await page.evaluate(sel => !!document.activeElement && document.activeElement.matches(sel), s.until)) break;
        await page.keyboard.press(s.key);
      }
    } else {
      for (let i = 0; i < (s.times || 1); i++) await page.keyboard.press(s.key);
    }
    await look();
  }
  await sleep(200);
  const complete = await page.waitForFunction(done, { timeout: 15000 }).then(() => true, () => false);
  return { ok: complete && ring, detail: (complete ? 'completed by keys' : 'NOT completed by keys') + (ring ? ', a focus ring seen' : ', no focus ring seen') };
}

/* 2.1: every element that shows a digit shows tabular lining figures */
export async function assertTabularNumerals(page) {
  const bad = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('');
      if (!/\d/.test(own)) continue;
      const v = getComputedStyle(el).fontVariantNumeric;
      if (!/tabular-nums/.test(v) || !/lining-nums/.test(v)) out.push((el.id || el.className || el.tagName) + ': ' + v);
    }
    return out;
  });
  return { ok: bad.length === 0, detail: bad.length ? bad.slice(0, 3).join(' | ') : 'every digit bearing element is tabular and lining' };
}

/* N1: the line moves every round. `next` is a page function that starts a new round and `line`
   the line's selector; its left and width are measured on the page each round. */
export async function assertLineRandomization(page, { next, line, rounds = 100 }) {
  const m = await page.evaluate(async (nextSrc, sel, rounds) => {
    const go = new Function('return (' + nextSrc + ')')();
    const lefts = [], widths = [];
    let repeats = 0;
    for (let i = 0; i < rounds; i++) {
      await go();
      const el = document.querySelector(sel), host = el.parentElement.getBoundingClientRect(), r = el.getBoundingClientRect();
      const L = (r.left - host.left) / host.width, W = r.width / host.width;
      if (lefts.length && Math.abs(L - lefts[lefts.length - 1]) < 1e-6 && Math.abs(W - widths[widths.length - 1]) < 1e-6) repeats++;
      lefts.push(L); widths.push(W);
    }
    const sd = a => { const mu = a.reduce((p, c) => p + c, 0) / a.length; return Math.sqrt(a.reduce((p, c) => p + (c - mu) * (c - mu), 0) / a.length); };
    return { sdLeft: sd(lefts), sdWidth: sd(widths), repeats };
  }, String(next), line, rounds);
  const ok = m.sdWidth > 0.03 && m.sdLeft > 0.01 && m.repeats === 0;
  return { ok, detail: rounds + ' rounds: spread of width ' + m.sdWidth.toFixed(3) + ', of offset ' + m.sdLeft.toFixed(3) + ', ' + m.repeats + ' repeats' };
}

/* S1 as far as this box can see it: a flash lands on its duration, to within 25 ms or 0.6 of the
   frame interval the page measured, at each duration. `flash` is a page function taking
   { durationMs } and resolving { shownAt, hiddenAt, interval }. */
export async function assertTimingPicksNearest(page, { flash, durations = [100, 400, 750] }) {
  const rows = [];
  let ok = true;
  for (const d of durations) {
    const f = await page.evaluate(async (src, d) => new Function('return (' + src + ')')()({ durationMs: d }), String(flash), d);
    const shown = f.hiddenAt - f.shownAt, bound = Math.max(25, 0.6 * f.interval);
    if (!(Math.abs(shown - d) <= bound)) ok = false;
    rows.push(d + ' ms shown ' + shown.toFixed(0));
  }
  return { ok, detail: rows.join(', ') };
}
