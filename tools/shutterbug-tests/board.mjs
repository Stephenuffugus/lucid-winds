#!/usr/bin/env node
/* Write the Shutterbug night entry at the top of START-HERE.md without reading the 560 KB file into a model.
 *
 *   node tools/shutterbug-tests/board.mjs <entry.md>
 *
 * The entry file starts with its own level two heading line ("## 📷 30 Oct 02:10 UTC (Opus) SHUTTERBUG ...").
 * If the first entry of START-HERE.md is already an Opus Shutterbug entry (its heading holds "(Opus) SHUTTERBUG"),
 * it is replaced in place, so the night keeps ONE live entry that is rewritten as tasks ship; otherwise the entry is
 * inserted after the file's first line, above everything else (BUILD-PLAN.md section 5.11's prepend). Prints the
 * byte counts before and after so a slip that ate the file is visible at once. */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '/workspaces/lucid-winds/START-HERE.md';
const entryPath = process.argv[2];
if (!entryPath) { console.error('usage: board.mjs <entry.md>'); process.exit(2); }
const entry = readFileSync(entryPath, 'utf8').trim() + '\n';
if (!entry.startsWith('## ') || !entry.includes('(Opus) SHUTTERBUG')) {
  console.error('the entry must start with "## " and its heading must hold "(Opus) SHUTTERBUG"'); process.exit(2);
}
const s = readFileSync(FILE, 'utf8');
const first = s.indexOf('\n') + 1;                 // after "# START HERE"
const h1 = s.indexOf('\n## ', first - 1) + 1;      // the first entry's heading
if (h1 <= 0) { console.error('no entry heading found'); process.exit(1); }
const headEnd = s.indexOf('\n', h1);
const heading = s.slice(h1, headEnd);
let out;
if (heading.includes('(Opus) SHUTTERBUG')) {
  const next = s.indexOf('\n## ', headEnd);      // the second entry's heading
  out = s.slice(0, h1) + entry + '\n' + s.slice(next + 1);
  console.log('replaced the live Opus Shutterbug entry');
} else {
  out = s.slice(0, first) + '\n' + entry + s.slice(first);   // s.slice(first) begins with the blank line
  console.log('inserted a new entry at the top');
}
writeFileSync(FILE, out);
console.log(`START-HERE.md ${s.length} -> ${out.length} chars`);
