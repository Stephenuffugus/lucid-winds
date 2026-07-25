#!/usr/bin/env node
/* MASTER_CHECKLIST auditor.
 *
 * WHY THIS EXISTS
 *   Stephen, 2026-07-25: "it's infuriating to give you a list of stuff and not
 *   have it done when I'm assuming it is and you say it is, and then later I
 *   find things not done after I've crossed the whole list off."
 *
 *   That happened because "done" was a CLAIM. I wrote [x] and he believed it.
 *   Twice the claim was wrong: items marked done on the Jul 20 list had never
 *   been verified, and two whole source lists were never merged at all.
 *
 *   So [x] is no longer allowed to be an opinion. This script fails the build
 *   if any item is marked done without evidence attached. A promise I can break
 *   silently is worthless; a check that fails is not.
 *
 * THE RULE
 *   [ ]  not started
 *   [~]  in progress
 *   [?]  blocked on Stephen (no evidence required, it is not done)
 *   [x]  done AND deployed AND evidenced. MUST contain one of:
 *          - a commit hash (7+ hex chars), or
 *          - the word "verified" / "VERIFIED", or
 *          - a test result like "40/40" or "66 pass"
 *
 * RUN
 *   node scripts/checklist_audit.js          report + fail on unevidenced [x]
 *   node scripts/checklist_audit.js --list   also print every open item
 */
const fs = require('fs');

const FILE = 'MASTER_CHECKLIST.md';
const EVIDENCE = [
  /\b[0-9a-f]{7,40}\b/,          // commit hash
  /verified/i,
  /\b\d+\s*\/\s*\d+\b/,          // 40/40
  /\b\d+\s+pass\b/i,             // 66 pass
];

function main() {
  if (!fs.existsSync(FILE)) {
    console.error('MISSING ' + FILE + ' — the checklist IS the system. Restore it.');
    process.exit(1);
  }
  const lines = fs.readFileSync(FILE, 'utf8').split('\n');

  const counts = { open: 0, wip: 0, blocked: 0, done: 0 };
  const unevidenced = [];
  const open = [];
  let section = '(top)';

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (/^#{2,3}\s/.test(line)) section = line.replace(/^#+\s*/, '');
    const m = line.match(/^-\s*\[([ x~?])\]\s*(.+)$/);
    if (!m) return;
    const mark = m[1], text = m[2];

    if (mark === 'x') {
      counts.done++;
      // The evidence may be on this line or the wrapped lines under it.
      let blob = text;
      for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) blob += ' ' + lines[j];
      if (!EVIDENCE.some((re) => re.test(blob))) {
        unevidenced.push({ line: i + 1, section, text: text.slice(0, 90) });
      }
    } else if (mark === '~') { counts.wip++; open.push({ mark, section, text: text.slice(0, 90) }); }
    else if (mark === '?') { counts.blocked++; open.push({ mark, section, text: text.slice(0, 90) }); }
    else { counts.open++; open.push({ mark, section, text: text.slice(0, 90) }); }
  });

  const total = counts.open + counts.wip + counts.blocked + counts.done;
  console.log('MASTER_CHECKLIST — ' + total + ' tracked items');
  console.log('  [ ] not started   ' + counts.open);
  console.log('  [~] in progress   ' + counts.wip);
  console.log('  [?] needs Stephen ' + counts.blocked);
  console.log('  [x] done          ' + counts.done);
  console.log('  STILL OPEN        ' + (counts.open + counts.wip + counts.blocked));

  if (process.argv.indexOf('--list') >= 0) {
    console.log('\nOPEN ITEMS');
    let cur = null;
    open.forEach((o) => {
      if (o.section !== cur) { cur = o.section; console.log('\n  ' + cur); }
      console.log('    [' + o.mark + '] ' + o.text);
    });
  }

  if (unevidenced.length) {
    console.log('\n⛔ ' + unevidenced.length + ' item(s) marked DONE with no evidence.');
    console.log('   A [x] needs a commit hash, "verified", or a test result.');
    console.log('   Unevidenced done is exactly how Stephen crossed things off that were not done.\n');
    unevidenced.forEach((u) => console.log('   line ' + u.line + '  ' + u.text));
    process.exit(1);
  }
  console.log('\n✓ every [x] carries evidence');
}

main();
