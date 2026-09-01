/* Concatenates the sources into the single shipping file, satellites/ripcord/index.html.
 * Runs from anywhere: every path is resolved against this file, never the cwd.
 *   node tools/bundle.js
 * The build stamp it writes is what a live-site grep checks for. A 200 on the
 * URL proves nothing; the stamp proves the deploy carried THIS bundle.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');

const stamp = process.env.RIPCORD_STAMP || require(path.join(ROOT, 'src', 'version.json')).build;

const out = src('play-shell.html')
  .replace('/*__LADDER__*/', () => src('ladder.json'))
  .replace('/*__SIM__*/',    () => src('sim2.js'))
  .replace('/*__WIND__*/',   () => src('wind.js'))
  .replace('/*__RIGS__*/',   () => src('rigs.js'))
  .replace('/*__AUDIO__*/',  () => src('audio.js'))
  .replace('/*__STORE__*/',  () => src('store.js'))
  .replace('/*__BATTLE3D__*/', () => src('battle3d.js'))
  .replace(/__BUILD__/g,     stamp);

if (out.indexOf('__BUILD__') >= 0) { console.error('bundle: build stamp did not substitute'); process.exit(1); }
for (const slot of ['__SIM__', '__WIND__', '__LADDER__', '__RIGS__', '__AUDIO__', '__STORE__',
                    '__BATTLE3D__'])
  if (out.indexOf('/*' + slot + '*/') >= 0) { console.error('bundle: slot ' + slot + ' never filled'); process.exit(1); }

fs.writeFileSync(path.join(ROOT, 'index.html'), out);
console.log('index.html ' + out.length + ' bytes  build ' + stamp);
