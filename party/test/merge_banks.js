/* Merge verified workflow output into the shipping content banks.

   Everything the content workflows produced went through an adversarial check
   before it got here, but this script is the last gate and it is deliberately
   suspicious: it re-enforces every house rule in code, because a rule that only
   lives in a prompt is a rule that eventually ships broken.

   Rejects, per bank: dash characters of any kind, over length, duplicates
   against what already ships, duplicates within the incoming batch, missing
   fields, and for the quiz banks a wrong option that repeats the answer.

   Usage: node test/merge_banks.js <mothlightOutput.json> <partyOutput.json> */
const fs = require('fs');
const path = require('path');

const GAMES = path.resolve(__dirname, '..', 'games');
const DASH = /[‐-―−\-]/;      /* every dash shape, including plain hyphen */
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

function loadBank(slug, globalName) {
  const file = path.join(GAMES, slug, 'content.js');
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  new (require('vm').Script)(src).runInNewContext(sandbox);
  return { file, src, bank: sandbox.window[globalName] };
}

function nextId(bank, prefix, pad) {
  let max = 0;
  bank.forEach(e => {
    const m = String(e.id).match(/(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return n => prefix + String(max + n).padStart(pad, '0');
}

/* rewrite the array literal in place, keeping the header comment intact */
function writeBank(file, src, globalName, lines) {
  const marker = `window.${globalName} = [`;
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('could not find ' + marker);
  const head = src.slice(0, start + marker.length);
  fs.writeFileSync(file, head + '\n' + lines.join(',\n') + '\n];\n');
}

const report = [];

/* ---------------- MOTHLIGHT ---------------- */
function mothlight(outPath) {
  const out = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const incoming = (out.result && out.result.kept) || out.kept || [];
  const { file, src, bank } = loadBank('mothlight', 'MOTHLIGHT_BANK');
  const seen = new Set(bank.map(e => norm(e.text)));
  const id = nextId(bank, 'ml-', 4);
  const kept = [];
  const cut = { dash: 0, len: 0, dupe: 0, bad: 0 };

  incoming.forEach(f => {
    if (!f || !f.text || typeof f.answer !== 'boolean' || !f.source) { cut.bad++; return; }
    if (DASH.test(f.text)) { cut.dash++; return; }
    if (f.text.length > 110) { cut.len++; return; }
    const k = norm(f.text);
    if (seen.has(k)) { cut.dupe++; return; }
    seen.add(k);
    kept.push(f);
  });

  /* keep the bank near even so selection never has to fight the pool */
  const t = bank.filter(e => e.answer).length, fCount = bank.length - t;
  const trues = kept.filter(e => e.answer), falses = kept.filter(e => !e.answer);
  const take = Math.min(trues.length, falses.length) * 2;
  const balanced = [];
  for (let i = 0; i < take / 2; i++) { balanced.push(trues[i]); balanced.push(falses[i]); }
  const spare = (trues.length > falses.length ? trues : falses).slice(take / 2);

  const lines = bank.map(e =>
    `  {id:'${e.id}', text:${JSON.stringify(e.text)}, answer:${e.answer ? 'true, ' : 'false,'} source:${JSON.stringify(e.source)}, category:${JSON.stringify(e.category)}}`);
  balanced.forEach((e, i) =>
    lines.push(`  {id:'${id(i + 1)}', text:${JSON.stringify(e.text)}, answer:${e.answer ? 'true, ' : 'false,'} source:${JSON.stringify(e.source)}, category:${JSON.stringify(e.category)}}`));

  writeBank(file, src, 'MOTHLIGHT_BANK', lines);
  const nt = t + balanced.filter(e => e.answer).length;
  report.push(`mothlight: ${bank.length} -> ${bank.length + balanced.length} (${nt} true / ${bank.length + balanced.length - nt} false)`);
  report.push(`  incoming ${incoming.length}, cut: ${JSON.stringify(cut)}, held back for balance: ${spare.length}`);
}

/* ---------------- the three party banks ---------------- */
function party(outPath) {
  const out = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const R = out.result || out;

  /* firefly: yes or no prompts */
  {
    const incoming = (R.firefly && R.firefly.kept) || [];
    const { file, src, bank } = loadBank('firefly', 'FIREFLY_BANK');
    const seen = new Set(bank.map(e => norm(e.text)));
    const id = nextId(bank, 'ff-', 4);
    const kept = []; const cut = { dash: 0, len: 0, dupe: 0 };
    incoming.forEach(p => {
      if (!p || !p.text) return;
      if (DASH.test(p.text)) { cut.dash++; return; }
      if (p.text.length > 80) { cut.len++; return; }
      const k = norm(p.text);
      if (seen.has(k)) { cut.dupe++; return; }
      seen.add(k); kept.push(p);
    });
    const lines = bank.map(e => `  {id:'${e.id}', text:${JSON.stringify(e.text)}, category:${JSON.stringify(e.category)}}`);
    kept.forEach((e, i) => lines.push(`  {id:'${id(i + 1)}', text:${JSON.stringify(e.text)}, category:${JSON.stringify(e.category)}}`));
    writeBank(file, src, 'FIREFLY_BANK', lines);
    report.push(`firefly: ${bank.length} -> ${bank.length + kept.length} prompts (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
  }

  /* liftingfog: 4 clues, options[0] correct */
  {
    const incoming = (R.liftingfog && R.liftingfog.kept) || [];
    const { file, src, bank } = loadBank('liftingfog', 'LIFTINGFOG_BANK');
    const seen = new Set(bank.map(e => norm(e.options[0])));
    const id = nextId(bank, 'lf-', 4);
    const kept = []; const cut = { dash: 0, len: 0, dupe: 0, shape: 0, sameopt: 0 };
    incoming.forEach(q => {
      if (!q || !q.options || q.options.length !== 4 || !q.clues || q.clues.length !== 4) { cut.shape++; return; }
      if (q.clues.some(c => DASH.test(c)) || q.options.some(o => DASH.test(o))) { cut.dash++; return; }
      if (q.clues.some(c => c.length > 95)) { cut.len++; return; }
      /* a wrong option repeating the answer makes the question unanswerable */
      const opts = q.options.map(norm);
      if (new Set(opts).size !== 4) { cut.sameopt++; return; }
      const k = norm(q.options[0]);
      if (seen.has(k)) { cut.dupe++; return; }
      seen.add(k); kept.push(q);
    });
    const fmt = e => `  {id:'${e.id}', category:${JSON.stringify(e.category)},\n` +
      `   options:${JSON.stringify(e.options)},\n` +
      `   clues:[${e.clues.map(c => JSON.stringify(c)).join(',\n          ')}]}`;
    const lines = bank.map(fmt);
    kept.forEach((e, i) => lines.push(fmt({ ...e, id: id(i + 1) })));
    writeBank(file, src, 'LIFTINGFOG_BANK', lines);
    report.push(`liftingfog: ${bank.length} -> ${bank.length + kept.length} questions (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
  }

  /* firstfrost: multiple choice, options[0] correct */
  {
    const incoming = (R.firstfrost && R.firstfrost.kept) || [];
    const { file, src, bank } = loadBank('firstfrost', 'FIRSTFROST_BANK');
    const seen = new Set(bank.map(e => norm(e.q)));
    const id = nextId(bank, 'ff-t', 3);
    const kept = []; const cut = { dash: 0, len: 0, dupe: 0, shape: 0, sameopt: 0 };
    incoming.forEach(q => {
      if (!q || !q.q || !q.options || q.options.length !== 4 || !q.source) { cut.shape++; return; }
      if (DASH.test(q.q) || q.options.some(o => DASH.test(o))) { cut.dash++; return; }
      if (q.q.length > 95 || q.options.some(o => o.length > 30)) { cut.len++; return; }
      if (new Set(q.options.map(norm)).size !== 4) { cut.sameopt++; return; }
      const k = norm(q.q);
      if (seen.has(k)) { cut.dupe++; return; }
      seen.add(k); kept.push(q);
    });
    const fmt = e => `  {id:'${e.id}', q:${JSON.stringify(e.q)}, options:${JSON.stringify(e.options)}, category:${JSON.stringify(e.category)}, source:${JSON.stringify(e.source)}}`;
    const lines = bank.map(fmt);
    kept.forEach((e, i) => lines.push(fmt({ ...e, id: id(i + 1) })));
    writeBank(file, src, 'FIRSTFROST_BANK', lines);
    report.push(`firstfrost: ${bank.length} -> ${bank.length + kept.length} questions (incoming ${incoming.length}, cut ${JSON.stringify(cut)})`);
  }
}

if (process.argv[2]) mothlight(process.argv[2]);
if (process.argv[3]) party(process.argv[3]);
console.log(report.join('\n'));
