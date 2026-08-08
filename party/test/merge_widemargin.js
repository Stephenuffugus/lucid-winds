/* Merge the verified percentage output into the Wide Margin bank.

   Stricter than the other merges, because this is the one bank where a player
   cannot tell a bad entry from a good one. A wrong trivia answer is arguable
   from the sofa. A wrong percentage just looks like a fact.

   Fixes on the way in, rather than rejecting for them: a missing question mark,
   and a source carrying a parenthetical working note ("NOAA (USGS gives 96.5)"),
   because both are formatting rather than substance.

   Rejects: wrong shape, out of range, over length, dash characters, and
   duplicates including near duplicates. The verifiers produced "the air you
   breathe is nitrogen" AND "dry air in Earth's atmosphere is nitrogen", which
   are not equal strings and are the same question.

   Usage: node test/merge_widemargin.js <workflowOutput.json> */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'games', 'widemargin', 'content.js');
const DASH = /[‐-―−]/;
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const STOP = new Set('what percentage of the a an is are in on to and or that by its'.split(' '));
const toks = s => new Set(norm(s).split(' ').filter(w => w && !STOP.has(w)));
function jac(a, b) { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); }

const src0 = fs.readFileSync(FILE, 'utf8');
const sb = { window: {} };
new vm.Script(src0).runInNewContext(sb);
const bank = sb.window.WIDEMARGIN_BANK;

const out = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const incoming = (out.result && out.result.kept) || out.kept || [];

let max = 0;
bank.forEach(e => { const m = String(e.id).match(/(\d+)$/); if (m) max = Math.max(max, +m[1]); });

const seen = new Set(bank.map(e => norm(e.q)));
const sets = bank.map(e => toks(e.q));
const kept = [];
const cut = { shape: 0, range: 0, len: 0, dash: 0, dupe: 0, similar: 0 };

incoming.forEach(f => {
  if (!f || !f.q || !f.source) { cut.shape++; return; }
  let q = String(f.q).trim();
  if (!/^What percentage of/.test(q)) { cut.shape++; return; }
  if (!/\?$/.test(q)) q += '?';                        /* formatting, not substance */
  if (DASH.test(q) || /;/.test(q)) { cut.dash++; return; }
  if (q.length > 105) { cut.len++; return; }
  const a = Number(f.answer);
  if (!Number.isInteger(a) || a < 0 || a > 100) { cut.range++; return; }

  const k = norm(q);
  if (seen.has(k)) { cut.dupe++; return; }
  const t = toks(q);
  if (sets.some(s => jac(t, s) > 0.62)) { cut.similar++; return; }

  /* a source is a name, not a working note */
  let source = String(f.source).split(' (')[0].trim().slice(0, 46);

  seen.add(k); sets.push(t);
  kept.push({ q, answer: a, source, category: String(f.category || 'world').slice(0, 20) });
});

const fmt = e => `  {id:'${e.id}', q:${JSON.stringify(e.q)}, answer:${e.answer}, source:${JSON.stringify(e.source)}, category:${JSON.stringify(e.category)}}`;
const lines = bank.map(fmt);
kept.forEach((e, i) => lines.push(fmt({ ...e, id: 'wm-' + String(max + i + 1).padStart(4, '0') })));

const marker = 'window.WIDEMARGIN_BANK = [';
const idx = src0.indexOf(marker);
let head = src0.slice(0, idx + marker.length);
head = head.replace(/Launch bank [0-9-]+: \d+ entries, every one hand checked\./,
  `Bank at 2026-08-08: ${bank.length + kept.length} entries. The first 34 were hand\n   checked; the rest came through a generate then verify pipeline where every\n   figure was checked against a source and anything unconfirmed was dropped.`);
fs.writeFileSync(FILE, head + '\n' + lines.join(',\n') + '\n];\n');

console.log(`widemargin: ${bank.length} -> ${bank.length + kept.length} (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
