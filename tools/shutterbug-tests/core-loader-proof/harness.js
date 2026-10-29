'use strict';
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const CORE_RE = /^<script id="(core-[a-z]+)" data-core>\n([\s\S]*?)\n<\/script>/gm;
const blocks = []; let m;
while ((m = CORE_RE.exec(html))) blocks.push({ id: m[1], src: m[2], index: m.index });
if (blocks.map(b => b.id).join() !== 'core-rng,core-sim') throw new Error('block order ' + blocks.map(b => b.id));
for (const b of blocks) if (b.src.includes('</script')) throw new Error(b.id + ' contains </script');
const ctx = vm.createContext({});
const POISON = `Math.random = function () { throw new Error('core touched Math.random'); };
Object.defineProperty(globalThis, 'Date', { get() { throw new Error('core touched Date'); } });`;
new vm.Script(POISON, { filename: 'poison.js' }).runInContext(ctx);
for (const b of blocks) {
  const lineOffset = html.slice(0, b.index).split('\n').length;
  new vm.Script(b.src, { filename: 'index.html#' + b.id, lineOffset }).runInContext(ctx);
}
const SB = ctx.SB;
const out = SB.sim.step({ seed: 42 }), out2 = SB.sim.step({ seed: 42 });
console.log('deterministic:', out[0] === out2[0], 'value', out[0], 'typed array realm differs:', !(out instanceof Uint8Array), 'length', out.length);
for (const f of ['bad', 'worse', 'dom']) { try { SB.sim[f](); console.log(f, 'DID NOT THROW'); } catch (e) { console.log(f, '->', e.constructor.name + ': ' + e.message.split('\n')[0]); } }
try { new vm.Script("(function(){ 'use strict'; return nope.x; })()", { filename: 'index.html#core-x', lineOffset: 7 }).runInContext(ctx); } catch (e) { console.log('stack points at', e.stack.split('\n')[1].trim()); }
console.log('CORE LOADER OK');
