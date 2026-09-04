/* Boots the real Electron shell (vendored app + preload + steam bridge) under
   xvfb, no Steam client present, and asserts: the shell reaches did-finish-load,
   the bridge is in the page, Steam failed SOFT (on:false with a reason), and an
   unlock call without Steam returns false instead of throwing. This is the half
   that can be proven here; the other half (an unlock that Steam records) needs
   Steam running, which means Stephen's machine.  Usage: node test/electron_boot.mjs */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const HERE = new URL('.', import.meta.url).pathname;
if (!existsSync(HERE + '../app/index.html')) { console.log('FAIL: run ./vendor.sh first'); process.exit(1); }
const r = spawnSync('xvfb-run', ['-a', 'npx', 'electron', '.', '--no-sandbox', '--disable-gpu', '--test-boot'],
  { cwd: HERE + '..', encoding: 'utf8', timeout: 90000, env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: '1' } });
const out = (r.stdout || '') + (r.stderr || '');
const line = out.split('\n').find(l => l.startsWith('TEST_BOOT'));
const steamLine = out.split('\n').find(l => l.startsWith('steam:'));
console.log(steamLine || '(no steam line)');
if (!line) { console.log('FAIL: shell never reported. Output tail:\n' + out.slice(-1500)); process.exit(1); }
if (line.startsWith('TEST_BOOT_ERROR')) { console.log('FAIL: ' + line); process.exit(1); }
const j = JSON.parse(line.slice('TEST_BOOT '.length));
console.log(JSON.stringify(j));
const bad = [];
if (j.bridge !== 'object') bad.push('bridge missing from the page');
if (!j.status || typeof j.status.on !== 'boolean') bad.push('status did not answer');
if (j.status && j.status.on === false && !j.status.why) bad.push('steam off without a reason');
if (j.unlockNoSteam !== false) bad.push('unlock without Steam should be false, got ' + j.unlockNoSteam);
if (j.title !== 'Jumping Jimothy') bad.push('title is ' + j.title);
if (bad.length) { console.log('FAIL: ' + bad.join('; ')); process.exit(1); }
console.log('ELECTRON BOOT OK');
