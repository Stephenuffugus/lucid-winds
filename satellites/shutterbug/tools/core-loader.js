'use strict';
/* The one Node loader of the Shutterbug core (BUILD-PLAN.md section 1.3), used by harness.js, tools/redwatch.js and
 * every gate that needs the core in Node. The mechanism is the committed proof in
 * tools/shutterbug-tests/core-loader-proof/: read index.html as text, extract every core block with ONE regular
 * expression in document order, assert the order and that no block holds "</script", and run each block as its own
 * vm.Script (with lineOffset, so a stack trace points at the real line of the page) in ONE fresh context that a poison
 * prelude has made hostile. In the browser the same blocks are ordinary classic scripts; nothing is extracted there.
 *
 *   const { loadCore } = require('./tools/core-loader.js');
 *   const SB = loadCore('index.html');           // ctx.SB after the last block ran
 *
 * Realm note: typed arrays made inside the context belong to another realm (instanceof Uint8Array is false out
 * here); compare by length and bytes. Fixtures go in as JSON rows and SB.record.fromJSON builds the arrays inside. */
const fs = require('node:fs'), vm = require('node:vm');

/* The marker, byte identical in harness.js's loader (this file) and fixtures/make.html (T0.5b; the lint compares). */
const CORE_RE = /^<script id="(core-[a-z]+)" data-core>\n([\s\S]*?)\n<\/script>/gm;
const ORDER = ['core-ns', 'core-rng', 'core-palette', 'core-record', 'core-pipeline', 'core-reach', 'core-features', 'core-sim'];

/* Impurity is a run time failure, not a review opinion. A fresh context does have Math.random, Date and console
   (V8 supplies console; verified 2026-10-30), so the prelude is not optional. */
const POISON = `
Math.random = function () { throw new Error('core touched Math.random'); };
for (const f of ['sin','cos','tan','asin','acos','atan','atan2','exp','expm1','log','log1p','log2','log10','pow','cbrt','hypot','sinh','cosh','tanh','asinh','acosh','atanh'])
  Math[f] = function () { throw new Error('core touched Math.' + f + ' (not correctly rounded, differs across engines)'); };
Object.defineProperty(globalThis, 'Date', { get() { throw new Error('core touched Date'); } });
Object.defineProperty(globalThis, 'Intl', { get() { throw new Error('core touched Intl'); } });
Object.defineProperty(globalThis, 'console', { get() { throw new Error('core touched console'); } });
`;

function extract(html) {
  const re = new RegExp(CORE_RE.source, 'gm');
  const blocks = []; let m;
  while ((m = re.exec(html))) blocks.push({ id: m[1], src: m[2], index: m.index });
  if (!blocks.length) throw new Error('no core block matched: LF line endings and column zero tags required');
  const ids = blocks.map(b => b.id).join(', ');
  if (ids !== ORDER.join(', ')) throw new Error('core block order is [' + ids + '], want [' + ORDER.join(', ') + ']');
  for (const b of blocks) if (b.src.toLowerCase().includes('</script')) throw new Error(b.id + ' contains "</script"');
  return blocks;
}

function loadCoreFull(pagePath) {
  const html = fs.readFileSync(pagePath, 'utf8');
  const blocks = extract(html);
  const ctx = vm.createContext({});
  new vm.Script(POISON, { filename: 'poison.js' }).runInContext(ctx);
  for (const b of blocks) {
    const lineOffset = html.slice(0, b.index).split('\n').length;
    new vm.Script(b.src, { filename: 'index.html#' + b.id, lineOffset }).runInContext(ctx);
  }
  if (!ctx.SB) throw new Error('the core ran but left no SB on the context');
  return { SB: ctx.SB, ctx, blocks, html };
}

function loadCore(pagePath) { return loadCoreFull(pagePath).SB; }

module.exports = { loadCore, loadCoreFull, extract, CORE_RE, ORDER, POISON };
