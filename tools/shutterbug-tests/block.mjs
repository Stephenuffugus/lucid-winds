#!/usr/bin/env node
/* Read or replace the body of one tagged script block of satellites/shutterbug/index.html by its id.
 *
 *   node tools/shutterbug-tests/block.mjs get <id>            print the body
 *   node tools/shutterbug-tests/block.mjs set <id> <file>     replace the body with the file's text
 *   node tools/shutterbug-tests/block.mjs lines               every block id with its first and last line
 *
 * A body runs from the line after `<script id="<id>" ...>` to the line before the first `</script>` at column zero
 * after it, which is exactly what CORE_RE extracts for a core block. The tag lines themselves are never touched. */
import { readFileSync, writeFileSync } from 'node:fs';

const PAGE = process.env.SB_PAGE_FILE || '/workspaces/lucid-winds/satellites/shutterbug/index.html';
const [cmd, id, file] = process.argv.slice(2);
const html = readFileSync(PAGE, 'utf8');

function find(id) {
  const open = new RegExp('^<script id="' + id + '"[^>]*>\\n', 'm').exec(html);
  if (!open) throw new Error('no block ' + id);
  const start = open.index + open[0].length;
  const end = html.indexOf('\n</script>', start - 1);
  if (end < 0) throw new Error('block ' + id + ' does not close at column zero');
  return { start, end };
}

if (cmd === 'get') { const b = find(id); process.stdout.write(html.slice(b.start, b.end) + '\n'); }
else if (cmd === 'set') {
  const b = find(id);
  const body = readFileSync(file, 'utf8').replace(/\s+$/, '');
  writeFileSync(PAGE, html.slice(0, b.start) + body + html.slice(b.end));
  console.log('set ' + id + ': ' + body.split('\n').length + ' lines');
} else if (cmd === 'lines') {
  const re = /^<script id="([a-z-]+)"[^>]*>$/gm; let m;
  while ((m = re.exec(html))) {
    const first = html.slice(0, m.index).split('\n').length + 1;
    const end = html.indexOf('\n</script>', m.index);
    console.log(m[1].padEnd(16) + first + '..' + html.slice(0, end).split('\n').length);
  }
} else { console.error('usage: block.mjs get|set|lines'); process.exit(2); }
