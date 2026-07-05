/* Compile-only check of the inline <script>. Catches syntax errors without executing.
 * Usage: node test/syntax-check.js [path-to-html] */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { gameFilePath } = require('./harness-core');

const file = gameFilePath();
const html = fs.readFileSync(file, 'utf8');

let ok = true;
function check(name, cond) { console.log((cond ? '  ok  ' : ' FAIL ') + name); if (!cond) ok = false; }

check('exactly one <script> block', (html.match(/<script>/g) || []).length === 1 && (html.match(/<\/script>/g) || []).length === 1);
check('exactly one <style> block', (html.match(/<style>/g) || []).length === 1);
check('has <body> and </body>', /<body>/.test(html) && /<\/body>/.test(html));
check('no leaked heredoc markers', !/CHUNK_EOF|HARNESS_EOF/.test(html));

const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.log(' FAIL  no script to compile'); process.exit(1); }
try {
  new vm.Script(m[1], { filename: path.basename(file) + '#inline-script' });
  check('inline script compiles', true);
} catch (e) {
  check('inline script compiles', false);
  console.log('   -> ' + e.message);
}

console.log(ok ? '\n✅ syntax check passed' : '\n❌ syntax check FAILED');
process.exit(ok ? 0 : 1);
