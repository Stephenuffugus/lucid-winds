// Runs every tests/*.test.mjs in its own process and reports.
import { readdirSync } from 'fs';
import { spawnSync } from 'child_process';
const dir = new URL('.', import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort();
let bad = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [dir + f], { encoding: 'utf8' });
  const last = (r.stdout.trim().split('\n').pop() || '');
  const fails = (r.stdout.match(/^\s+FAIL\s.*$/gm) || []);
  console.log(`${r.status === 0 ? 'ok  ' : 'FAIL'}  ${f.padEnd(26)} ${last}`);
  for (const l of fails) console.log('      ' + l.trim());
  if (r.status !== 0) { bad++; if (r.stderr) console.log(r.stderr.split('\n').slice(0, 8).join('\n')); }
}
console.log(bad ? `${bad} suite(s) failed` : `all ${files.length} suites passed`);
process.exitCode = bad ? 1 : 0;
