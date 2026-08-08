/* Content lint for every Whack Box bank.

   The house rules live in prose in each content.js header, and prose does not
   run. This does. It is the same posture as the merge scripts: a rule that only
   lives in a prompt is a rule that eventually ships broken, so every rule that
   CAN be checked mechanically is checked here and runs on demand.

   It cannot judge whether a fact is true or whether a prompt is kind. That is
   what the adversarial verify pass and a human reading are for. It catches the
   mechanical failures that slip past both.

   Usage: node test/bank_audit.js */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const GAMES = path.resolve(__dirname, '..', 'games');
const DASH = /[‐-―−]/;                 /* em, en and friends. A plain hyphen is
                                          flagged separately: it is far more
                                          common and usually a rewrite, not a bug */
const HYPHEN = /\w-\w/;
const SEMI = /;/;

/* ⛔ TWO LISTS, AND THE DIFFERENCE MATTERS. A lint that cries wolf gets ignored,
   which is worse than no lint at all. The first version of this flagged "the
   Dead Sea", "a murder of crows" and "octopuses have blue blood", and a reviewer
   who has to dismiss eight false alarms stops reading the ninth.

   HARD is for things that are never acceptable here and are unlikely to appear
   innocently. SOFT is for subjects worth a human glance, and it never fails the
   run. Mechanical rules (length, dashes, structure) are the ones this tool is
   actually authoritative about. */
const HARD = /\b(naked|sexy|divorce|salary|mortgage|obese|vodka|whisky|whiskey|drunk|beer|senator|republicans?|democrats?|election)\b/i;
const SOFT = /\b(killed by|was murdered|died of|weapon|gunfire|religion|pray|worship)\b/i;

function load(slug, globalName) {
  const src = fs.readFileSync(path.join(GAMES, slug, 'content.js'), 'utf8');
  const sb = { window: {} };
  new vm.Script(src).runInNewContext(sb);
  return sb.window[globalName] || [];
}

const problems = [];   /* fails the run */
const review = [];     /* for a human to glance at, never fails */
function flag(bank, id, why, text) { problems.push(`${bank} ${id}: ${why} — ${String(text).slice(0, 76)}`); }
function soft(bank, id, why, text) { review.push(`${bank} ${id}: ${why} — ${String(text).slice(0, 76)}`); }

function checkText(bank, id, text, maxLen) {
  if (DASH.test(text)) flag(bank, id, 'dash character', text);
  if (HYPHEN.test(text)) flag(bank, id, 'hyphen inside a word', text);
  if (SEMI.test(text)) flag(bank, id, 'semicolon', text);
  if (HARD.test(text)) flag(bank, id, 'subject that cannot ship', text);
  else if (SOFT.test(text)) soft(bank, id, 'worth a glance', text);
  if (maxLen && text.length > maxLen) flag(bank, id, `over ${maxLen} characters (${text.length})`, text);
}

const banks = [];

/* mothlight: true/false facts */
{
  const b = load('mothlight', 'MOTHLIGHT_BANK');
  const t = b.filter(e => e.answer).length;
  b.forEach(e => {
    checkText('mothlight', e.id, e.text, 110);
    if (typeof e.answer !== 'boolean') flag('mothlight', e.id, 'answer is not a boolean', e.text);
    if (!e.source) flag('mothlight', e.id, 'no source', e.text);
    if (!/[.]$/.test(e.text)) flag('mothlight', e.id, 'does not end in a full stop', e.text);
  });
  const skew = Math.abs(t - (b.length - t)) / b.length;
  if (skew > 0.15) flag('mothlight', 'BANK', `true/false skew ${(skew*100).toFixed(0)}%`, `${t} true / ${b.length-t} false`);
  banks.push(['mothlight', b.length, `${t} true / ${b.length - t} false`]);
}

/* firefly: yes/no prompts about yourself */
{
  const b = load('firefly', 'FIREFLY_BANK');
  b.forEach(e => {
    checkText('firefly', e.id, e.text, 80);
    if (!/\?$/.test(e.text)) flag('firefly', e.id, 'is not a question', e.text);
    if (!/^(Have|Do|Can|Did|Would)\b/.test(e.text)) flag('firefly', e.id, 'does not open Have/Do/Can/Did/Would', e.text);
    /* ⛔ A FORCED CHOICE CANNOT BE ANSWERED YES OR NO, and this game only has a
       YES and a NO button. "Do you like your toast barely warm or properly
       dark?" shipped and no button on the phone answers it. Machines cannot
       reliably tell an inclusive "a whale or a dolphin" from a forced choice,
       so every "or" is listed for a person to judge rather than failed. */
    if (/ or /.test(e.text)) soft('firefly', e.id, 'has an "or": check it still answers yes or no', e.text);
  });
  banks.push(['firefly', b.length, 'prompts']);
}

/* liftingfog: four ordered clues, options[0] correct */
{
  const b = load('liftingfog', 'LIFTINGFOG_BANK');
  b.forEach(e => {
    if (!e.options || e.options.length !== 4) return flag('liftingfog', e.id, 'not four options', e.options);
    if (!e.clues || e.clues.length !== 4) return flag('liftingfog', e.id, 'not four clues', '');
    e.clues.forEach((c, i) => checkText('liftingfog', e.id + ' clue' + (i + 1), c, 95));
    e.options.forEach(o => checkText('liftingfog', e.id, o, 40));
    if (new Set(e.options.map(o => o.toLowerCase())).size !== 4)
      flag('liftingfog', e.id, 'duplicate options', e.options.join(' / '));
    /* the answer appearing inside its own last clue gives it away */
    const ans = e.options[0].toLowerCase().replace(/^(the|a|an) /, '');
    if (ans.length > 3 && e.clues[3].toLowerCase().includes(ans))
      flag('liftingfog', e.id, 'clue 4 contains the answer', e.clues[3]);
  });
  banks.push(['liftingfog', b.length, 'four clue questions']);
}

/* firstfrost: multiple choice, options[0] correct */
{
  const b = load('firstfrost', 'FIRSTFROST_BANK');
  b.forEach(e => {
    checkText('firstfrost', e.id, e.q, 95);
    if (!e.options || e.options.length !== 4) return flag('firstfrost', e.id, 'not four options', e.q);
    e.options.forEach(o => checkText('firstfrost', e.id, o, 30));
    if (new Set(e.options.map(o => o.toLowerCase())).size !== 4)
      flag('firstfrost', e.id, 'duplicate options', e.options.join(' / '));
    if (!e.source) flag('firstfrost', e.id, 'no source', e.q);
    if (!/\?$/.test(e.q)) flag('firstfrost', e.id, 'is not a question', e.q);
  });
  banks.push(['firstfrost', b.length, 'questions']);
}

/* samesoil: either/or pairs */
{
  const b = load('samesoil', 'SAMESOIL_BANK');
  b.forEach(e => {
    checkText('samesoil', e.id, e.a, 22);
    checkText('samesoil', e.id, e.b, 22);
    if (String(e.a).toLowerCase() === String(e.b).toLowerCase())
      flag('samesoil', e.id, 'both sides are the same', e.a);
    /* the real constraint is the 22 character limit, which is what has to fit on
       a TV and on a phone button. "Rain on a roof" is four short words and is
       completely fine; counting words was measuring the wrong thing. */
    if (String(e.a).split(' ').length > 5 || String(e.b).split(' ').length > 5)
      flag('samesoil', e.id, 'too many words a side', e.a + ' / ' + e.b);
  });
  banks.push(['samesoil', b.length, 'pairs']);
}

/* moongraft: layer briefs */
{
  const b = load('moongraft', 'MOONGRAFT_LAYERS');
  b.forEach(e => {
    checkText('moongraft', e.key, e.brief, 45);
    checkText('moongraft', e.key, e.hint, 70);
    const z = e.zone || [];
    if (z.length !== 4) flag('moongraft', e.key, 'zone is not four numbers', z.join(','));
    else if (z[0] < 0 || z[1] < 0 || z[0] + z[2] > 1.001 || z[1] + z[3] > 1.001)
      flag('moongraft', e.key, 'zone falls outside the card', z.join(','));
  });
  banks.push(['moongraft', b.length, 'layers']);
}

console.log('BANKS');
banks.forEach(([n, c, note]) => console.log(`  ${n.padEnd(12)} ${String(c).padStart(4)}  ${note}`));
console.log('  ' + 'TOTAL'.padEnd(12) + String(banks.reduce((a, b) => a + b[1], 0)).padStart(4) + '  entries');
console.log();
if (review.length) {
  console.log('FOR A HUMAN TO GLANCE AT (' + review.length + ', not failures)');
  review.slice(0, 25).forEach(p => console.log('  ' + p));
  if (review.length > 25) console.log('  ...and ' + (review.length - 25) + ' more');
  console.log();
}
if (!problems.length) { console.log('AUDIT: clean'); process.exit(0); }
console.log('AUDIT: ' + problems.length + ' problems');
problems.slice(0, 60).forEach(p => console.log('  ' + p));
if (problems.length > 60) console.log('  ...and ' + (problems.length - 60) + ' more');
process.exit(1);
