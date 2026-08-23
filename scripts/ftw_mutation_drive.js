/* Mutation driver for Flock the World.
 *   node scripts/ftw_mutation_drive.js <mutations.json> [--keep]
 *
 * A check that never goes red when the code it guards is broken is decoration.
 * For each mutation this applies a single realistic defect to a COPY of
 * index.html, runs the real suite against that copy via FTW_FILE, and asks one
 * question: did the check that claims to guard this go red?
 *
 * BITES      the named check failed. The check is real.
 * WRONG      something failed, but not the named check. Mis-attributed guard.
 * VACUOUS    the whole suite stayed green. Nothing guards this line.
 * BADMUT     the find string was absent or not unique; mutation not applied.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = path.join(__dirname, '..', 'satellites', 'flock-the-world');
const SRC = path.join(DIR, 'index.html');
const CHECK = path.join(DIR, 'check.js');
const TMP = path.join(DIR, '.mut');
const muts = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const keep = process.argv.includes('--keep');
const base = fs.readFileSync(SRC, 'utf8');

fs.mkdirSync(TMP, { recursive: true });
function runSuite(file) {
  try {
    const out = execFileSync(process.execPath, [CHECK], {
      env: Object.assign({}, process.env, { FTW_FILE: file }),
      encoding: 'utf8', cwd: DIR, timeout: 120000,
    });
    return { code: 0, out: out };
  } catch (e) {
    return { code: e.status == null ? -1 : e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}
const failedNames = out => out.split('\n')
  .filter(l => l.startsWith('  FAIL '))
  .map(l => l.slice(7).split(' :: ')[0].trim());

/* sanity: the unmutated file must be green, or every verdict below is noise */
const clean = runSuite(SRC);
if (clean.code !== 0) { console.error('HARNESS: baseline is not green, aborting.'); process.exit(2); }
console.log('baseline green.\n');

const rows = [];
muts.forEach((m, i) => {
  const n = base.split(m.find).length - 1;
  let verdict, detail = '';
  if (n !== 1) {
    verdict = 'BADMUT'; detail = 'find occurs ' + n + ' times';
  } else {
    const file = path.join(TMP, 'm' + String(i).padStart(3, '0') + '.html');
    fs.writeFileSync(file, base.replace(m.find, m.replace));
    const r = runSuite(file);
    const F = failedNames(r.out);
    if (r.code === 2) { verdict = 'BADMUT'; detail = 'harness refused the mutated file'; }
    else if (F.length === 0) { verdict = 'VACUOUS'; detail = 'suite stayed green'; }
    else if (F.some(f => f === m.checkName)) { verdict = 'BITES'; detail = F.length + ' check(s) red'; }
    else { verdict = 'WRONG'; detail = 'red instead: ' + F.slice(0, 3).join(' | '); }
    if (!keep) fs.unlinkSync(file);
  }
  rows.push({ id: m.id, group: m.group, check: m.checkName, verdict, detail, why: m.why });
  console.log(
    verdict.padEnd(8) + m.id.padEnd(30) + '[' + m.group + '] ' + detail
  );
});
if (!keep) { try { fs.rmdirSync(TMP); } catch (e) {} }

const tally = {};
rows.forEach(r => { tally[r.verdict] = (tally[r.verdict] || 0) + 1; });
console.log('\n== tally ==');
Object.entries(tally).sort().forEach(([k, v]) => console.log('  ' + k.padEnd(8) + v));
const bad = rows.filter(r => r.verdict === 'VACUOUS' || r.verdict === 'WRONG');
if (bad.length) {
  console.log('\n== checks that did not bite ==');
  bad.forEach(r => console.log('  [' + r.verdict + '] ' + r.group + ' :: ' + r.check + '\n      mutation: ' + r.why + '\n      ' + r.detail));
}
fs.writeFileSync(path.join(DIR, '.mutation-report.json'), JSON.stringify(rows, null, 1));
console.log('\nreport: satellites/flock-the-world/.mutation-report.json');
