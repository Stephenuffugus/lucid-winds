/* Merge round two workflow output into the shipping banks.

   Same posture as merge_banks.js and for the same reason: everything here was
   already adversarially checked, and this script still re-enforces every house
   rule in code, because a rule that only lives in a prompt is a rule that
   eventually ships broken.

   On top of the exact-match dedupe it runs a SIMILARITY pass, because
   "Can you fold a paper plane that flies straight" and "Can you fold a paper
   aeroplane that actually flies straight" are not equal strings and are
   obviously the same question.

   Usage: node test/merge_round2.js <workflowOutput.json> */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const GAMES = path.resolve(__dirname, '..', 'games');
const DASH = /[‐-―−\-]/;
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

const STOP = new Set(('a an the you your ever do did can have would is are it of in on to and or that ' +
  'with for at as by be been was were one more than so not if they them their i me my out up down all ' +
  'any some from when what which who how').split(' '));
const toks = s => new Set(norm(s).split(' ').filter(w => w && !STOP.has(w)));
function jaccard(a, b) { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); }

function loadBank(slug, globalName) {
  const file = path.join(GAMES, slug, 'content.js');
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  new vm.Script(src).runInNewContext(sandbox);
  return { file, src, bank: sandbox.window[globalName] };
}
function nextId(bank, prefix, pad) {
  let max = 0;
  bank.forEach(e => { const m = String(e.id).match(/(\d+)$/); if (m) max = Math.max(max, +m[1]); });
  return n => prefix + String(max + n).padStart(pad, '0');
}
function writeBank(file, src, globalName, lines, count) {
  const marker = `window.${globalName} = [`;
  const i = src.indexOf(marker);
  if (i < 0) throw new Error('could not find ' + marker);
  let head = src.slice(0, i + marker.length);
  head = head.replace(/Bank at [0-9-]+: \d+ entries\./, `Bank at 2026-08-08: ${count} entries.`);
  fs.writeFileSync(file, head + '\n' + lines.join(',\n') + '\n];\n');
}

const out = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const R = out.result || out;
const report = [];

/* ---- LIFTING FOG ---- */
{
  const incoming = (R.liftingfog && R.liftingfog.kept) || [];
  const { file, src, bank } = loadBank('liftingfog', 'LIFTINGFOG_BANK');
  const seen = new Set(bank.map(e => norm(e.options[0])));
  const sets = bank.map(e => toks(e.clues.join(' ')));
  const id = nextId(bank, 'lf-', 4);
  const kept = []; const cut = { dash: 0, len: 0, dupe: 0, shape: 0, sameopt: 0, similar: 0 };
  incoming.forEach(q => {
    if (!q || !q.options || q.options.length !== 4 || !q.clues || q.clues.length !== 4) { cut.shape++; return; }
    if (q.clues.some(c => DASH.test(c)) || q.options.some(o => DASH.test(o))) { cut.dash++; return; }
    if (q.clues.some(c => c.length > 95)) { cut.len++; return; }
    if (new Set(q.options.map(norm)).size !== 4) { cut.sameopt++; return; }
    if (seen.has(norm(q.options[0]))) { cut.dupe++; return; }
    const t = toks(q.clues.join(' '));
    if (sets.some(s => jaccard(t, s) > 0.62)) { cut.similar++; return; }
    seen.add(norm(q.options[0])); sets.push(t); kept.push(q);
  });
  const fmt = e => `  {id:'${e.id}', category:${JSON.stringify(e.category)},\n` +
    `   options:${JSON.stringify(e.options)},\n` +
    `   clues:[${e.clues.map(c => JSON.stringify(c)).join(',\n          ')}]}`;
  const lines = bank.map(fmt);
  kept.forEach((e, i) => lines.push(fmt({ ...e, id: id(i + 1) })));
  writeBank(file, src, 'LIFTINGFOG_BANK', lines, bank.length + kept.length);
  report.push(`liftingfog: ${bank.length} -> ${bank.length + kept.length} (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
}

/* ---- SAME SOIL ---- */
{
  const incoming = (R.samesoil && R.samesoil.kept) || [];
  const { file, src, bank } = loadBank('samesoil', 'SAMESOIL_BANK');
  const seen = new Set(bank.map(e => norm(e.a) + '|' + norm(e.b)));
  const sets = bank.map(e => toks(e.a + ' ' + e.b));
  const id = nextId(bank, 'ss-', 4);
  const kept = []; const cut = { dash: 0, len: 0, dupe: 0, shape: 0, similar: 0 };
  incoming.forEach(p => {
    if (!p || !p.a || !p.b) { cut.shape++; return; }
    if (DASH.test(p.a) || DASH.test(p.b)) { cut.dash++; return; }
    if (p.a.length > 22 || p.b.length > 22) { cut.len++; return; }
    const k = norm(p.a) + '|' + norm(p.b), rev = norm(p.b) + '|' + norm(p.a);
    if (seen.has(k) || seen.has(rev)) { cut.dupe++; return; }
    const t = toks(p.a + ' ' + p.b);
    if (sets.some(s => jaccard(t, s) > 0.7)) { cut.similar++; return; }
    seen.add(k); sets.push(t); kept.push(p);
  });
  const fmt = e => `  {id:'${e.id}', a:${JSON.stringify(e.a)}, b:${JSON.stringify(e.b)}, category:${JSON.stringify(e.category)}}`;
  const lines = bank.map(fmt);
  kept.forEach((e, i) => lines.push(fmt({ ...e, id: id(i + 1) })));
  writeBank(file, src, 'SAMESOIL_BANK', lines, bank.length + kept.length);
  report.push(`samesoil: ${bank.length} -> ${bank.length + kept.length} (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
}

/* ---- FIRST FROST ---- */
{
  const incoming = (R.firstfrost && R.firstfrost.kept) || [];
  const { file, src, bank } = loadBank('firstfrost', 'FIRSTFROST_BANK');
  const seen = new Set(bank.map(e => norm(e.q)));
  const sets = bank.map(e => toks(e.q + ' ' + e.options[0]));
  const id = nextId(bank, 'ff-t', 3);
  const kept = []; const cut = { dash: 0, len: 0, dupe: 0, shape: 0, sameopt: 0, similar: 0 };
  incoming.forEach(q => {
    if (!q || !q.q || !q.options || q.options.length !== 4 || !q.source) { cut.shape++; return; }
    if (DASH.test(q.q) || q.options.some(o => DASH.test(o))) { cut.dash++; return; }
    if (q.q.length > 95 || q.options.some(o => o.length > 30)) { cut.len++; return; }
    if (new Set(q.options.map(norm)).size !== 4) { cut.sameopt++; return; }
    if (seen.has(norm(q.q))) { cut.dupe++; return; }
    const t = toks(q.q + ' ' + q.options[0]);
    if (sets.some(s => jaccard(t, s) > 0.7)) { cut.similar++; return; }
    seen.add(norm(q.q)); sets.push(t); kept.push(q);
  });
  const fmt = e => `  {id:'${e.id}', q:${JSON.stringify(e.q)}, options:${JSON.stringify(e.options)}, category:${JSON.stringify(e.category)}, source:${JSON.stringify(e.source)}}`;
  const lines = bank.map(fmt);
  kept.forEach((e, i) => lines.push(fmt({ ...e, id: id(i + 1) })));
  writeBank(file, src, 'FIRSTFROST_BANK', lines, bank.length + kept.length);
  report.push(`firstfrost: ${bank.length} -> ${bank.length + kept.length} (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
}

console.log(report.join('\n'));
