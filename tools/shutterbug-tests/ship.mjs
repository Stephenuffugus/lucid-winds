#!/usr/bin/env node
/* The bookkeeping of a shipped Shutterbug task, in one call (BUILD-ORDER-OCT29 "Every task": the State block,
 * PROGRESS.md and START-HERE.md updated in the turn a task ships).
 *
 *   node tools/shutterbug-tests/ship.mjs --row "<| T0.1 | shipped | ... |>" --progress <file> --state <file> --board <file>
 *
 *   --row       one markdown row appended to the State table (BUILD-PLAN.md section 0), after its last row
 *   --progress  a file appended to satellites/shutterbug/PROGRESS.md (one entry, section 5.11's template)
 *   --state     a file whose lines replace the "> " State blockquote at the top of plans/BUILD-ORDER-OCT29.md
 *   --board     a file written as the live Opus entry at the top of START-HERE.md (board.mjs)
 * Any subset may be given. Never reads more of START-HERE.md than the replace needs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const R = '/workspaces/lucid-winds';
const a = process.argv.slice(2);
const opt = k => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : null; };

const row = opt('row');
if (row) {
  const p = R + '/satellites/shutterbug/BUILD-PLAN.md';
  const s = readFileSync(p, 'utf8');
  const start = s.indexOf('\n## 0. State');
  const end = s.indexOf('\nStatus is one of', start);
  if (start < 0 || end < 0) throw new Error('State section not found');
  const sec = s.slice(start, end);
  const lines = sec.split('\n');
  let last = -1;
  for (let i = 0; i < lines.length; i++) if (/^\| T\d/.test(lines[i])) last = i;   // task rows; the header is "| Task"
  if (last < 0) throw new Error('no task row in the State table');
  lines.splice(last + 1, 0, row.trim());
  writeFileSync(p, s.slice(0, start) + lines.join('\n') + s.slice(end));
  console.log('State row appended');
}

const prog = opt('progress');
if (prog) {
  const p = R + '/satellites/shutterbug/PROGRESS.md';
  const s = readFileSync(p, 'utf8');
  writeFileSync(p, s.replace(/\s*$/, '\n') + '\n' + readFileSync(prog, 'utf8').trim() + '\n');
  console.log('PROGRESS entry appended');
}

const st = opt('state');
if (st) {
  const p = R + '/plans/BUILD-ORDER-OCT29.md';
  const s = readFileSync(p, 'utf8');
  const lines = s.split('\n');
  const i0 = lines.findIndex(l => l.startsWith('> **STATE'));
  if (i0 < 0) throw new Error('State blockquote not found');
  let i1 = i0; while (i1 < lines.length && lines[i1].startsWith('>')) i1++;
  const body = readFileSync(st, 'utf8').trim().split('\n').map(l => l.startsWith('>') ? l : '> ' + l);
  if (!body[0].startsWith('> **STATE')) throw new Error('the state file must begin with "**STATE"');
  lines.splice(i0, i1 - i0, ...body);
  writeFileSync(p, lines.join('\n'));
  console.log('build order State block rewritten');
}

const bd = opt('board');
if (bd) console.log(execFileSync('node', [R + '/tools/shutterbug-tests/board.mjs', bd], { encoding: 'utf8' }).trim());
