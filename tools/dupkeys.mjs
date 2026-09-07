/* A KEY DECLARED TWICE IN ONE OBJECT LITERAL. THE SECOND SILENTLY WINS.
 *
 *   import { dupKeys } from '<root>/tools/dupkeys.mjs'
 *   node tools/dupkeys.mjs            (sweeps the twelve)
 *
 * ⛔ WHY THIS EXISTS. It cost two separate debugging rounds in two days and
 * neither the file, the syntax check, the lint nor the browser console said one
 * word either time:
 *   Wardian, 2026-09-07: WARDIAN_TEST carried `mist` twice. The hook a new
 *   assertion needed was the FIRST one, so it was never called and the
 *   assertion could not be made to fail no matter what was mutated. Three
 *   rounds were spent blaming the game.
 *   Gerplunk, 2026-09-07: CONFIG carried DAILY_THROWS twice. Harmless only
 *   because both read 5; an edit to the first would have vanished.
 * Duplicate keys are LEGAL in modern JavaScript, even in strict mode, so no
 * parser will ever complain. This is the only thing that will.
 *
 * It reports a duplicate only when the two are on different lines, because a
 * generated one liner repeating a key is a different animal and this has never
 * seen one.
 */
import { readFileSync, existsSync } from 'node:fs';

/* comments and string bodies blanked, length and newlines kept, so a key hunt
   cannot find ghosts inside prose and the line numbers still mean something */
function strip(src) {
  const o = src.split('');
  let i = 0; const n = o.length;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') o[i++] = ' '; }
    else if (c === '/' && src[i + 1] === '*') {
      o[i] = o[i + 1] = ' '; i += 2;
      while (i + 1 < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] !== '\n') o[i] = ' '; i++; }
      if (i + 1 < n) { o[i] = o[i + 1] = ' '; i += 2; }
    } else if (c === '"' || c === "'" || c === '`') {
      const q = c; o[i] = ' '; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { if (src[i] !== '\n') o[i] = ' '; i++; }
        if (i < n && src[i] !== '\n') o[i] = ' '; i++;
      }
      if (i < n) { o[i] = ' '; i++; }
    } else i++;
  }
  return o.join('');
}

const OPENER = /(?:^|\n)[ \t]*(?:var|let|const|window\.)?[ \t]*([A-Za-z_$][\w$.]*)[ \t]*=[ \t]*\{/g;
const KEY = /^([A-Za-z_$][\w$]*)[ \t\r\n]*:/;

/* returns [{ name, key, lines }], and { unclosed } counts literals whose braces
   never balanced, which would be a hole in the sweep rather than a clean pass */
export function dupKeys(raw) {
  const src = strip(raw);
  const nl = []; for (let k = 0; k < raw.length; k++) if (raw[k] === '\n') nl.push(k);
  const lineAt = (pos) => { let lo = 0, hi = nl.length; while (lo < hi) { const m = (lo + hi) >> 1; if (nl[m] < pos) lo = m + 1; else hi = m; } return lo + 1; };
  const out = []; let lits = 0, unclosed = 0;
  OPENER.lastIndex = 0;
  let m;
  while ((m = OPENER.exec(src))) {
    const name = m[1], openAt = m.index + m[0].length - 1;
    lits++;
    let depth = 0, i = openAt, prev = '', closed = false, guard = 0;
    const keys = new Map();
    while (i < src.length && guard++ < 500000) {
      const ch = src[i];
      if (ch === '{' || ch === '[' || ch === '(') { depth++; prev = ch; i++; continue; }
      if (ch === '}' || ch === ']' || ch === ')') { depth--; if (depth === 0) { closed = true; break; } prev = ch; i++; continue; }
      if (depth === 1 && (prev === '{' || prev === ',')) {
        const km = KEY.exec(src.slice(i, i + 80));
        if (km) { const a = keys.get(km[1]) || []; a.push(lineAt(i)); keys.set(km[1], a); i += km[0].length; prev = ':'; continue; }
      }
      if (!/\s/.test(ch)) prev = ch;
      i++;
    }
    if (!closed) { unclosed++; continue; }
    for (const [k, v] of keys) { const u = [...new Set(v)]; if (u.length > 1) out.push({ name, key: k, lines: u }); }
  }
  return { dups: out, literals: lits, unclosed };
}

/* the fleet sweep, run on its own */
if (import.meta.url === `file://${process.argv[1]}`) {
  const GAMES = 'fathom asterism swell wardian doohickey airworthy windup inkswing gerplunk whistlestop updraft strata'.split(' ');
  let total = 0, lits = 0, unc = 0;
  for (const g of GAMES) {
    const p = `/workspaces/lucid-winds/satellites/${g}/index.html`;
    if (!existsSync(p)) continue;
    const r = dupKeys(readFileSync(p, 'utf8'));
    lits += r.literals; unc += r.unclosed; total += r.dups.length;
    for (const d of r.dups) console.log(`  FAIL  ${g}: ${d.name} declares '${d.key}' on lines ${d.lines.join(' and ')}, and the last one silently wins`);
  }
  console.log(`\n${total} duplicate key(s) in ${lits} object literals across ${GAMES.length} games (${unc} unclosed)`);
  if (total || unc) process.exit(1);
  console.log('DUPKEYS OK');
}
