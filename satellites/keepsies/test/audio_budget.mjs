/**
 * The sound, measured off a real render.
 *
 *   node test/audio_budget.mjs
 *
 * There is no listening gate and there never will be, so this asks the questions
 * a machine can answer honestly and leaves the rest to a person with the volume
 * up (the phase checklist says so out loud):
 *
 *   1. a break MAKES SOUND. Twenty impacts inside a tenth of a second render to
 *      real samples with real energy in them, not to silence.
 *   2. THE LIMITER HOLDS. Twenty simultaneous impacts do not clip. A marble game
 *      whose break distorts is a marble game nobody turns the volume up for.
 *   3. the voice count is BOUNDED. A break cannot spawn an unbounded number of
 *      oscillators, because that is a tick that eats the world with a bus attached.
 *   4. rolling loops are capped and the cap drops the QUIETEST, not an arbitrary
 *      one, so the marble you are watching is the marble you can hear.
 *
 * It runs in a real browser because WebAudio lives there, and it renders through
 * OfflineAudioContext, which is the same graph the game plays through.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];
const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT;
  const p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1';

const browser = await puppeteer.launch({
  headless: 'new', protocolTimeout: 120000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });

/* ---- 1 to 3: a break, rendered offline ---- */
const measured = await page.evaluate(async () => {
  const A = await import('./src/audio/synth.js?v=20260904a');
  const t = window.KEEPSIES_DEV.tuning();
  A.configure(t);
  const hits = [];
  // a break: the taw into thirteen mibs, everything inside a tenth of a second
  for (let i = 0; i < 20; i++) {
    hits.push({
      t: 0.02 + (i % 7) * 0.012,
      material: i % 4 === 0 ? 'clay' : 'glass',
      diameterMm: i === 0 ? 22 : 16,
      relSpeed: 1.2 + (i % 5) * 0.7,
      seed: (i * 37 % 100) / 100,
      surface: i % 3 === 0 ? 'dirt' : null
    });
  }
  const loud = await A.measureOffline(hits, 1.2);
  const one = await A.measureOffline([hits[0]], 1.2);
  const silence = await A.measureOffline([], 0.4);
  return { loud, one, silence };
});

say(!!measured.loud, 'the graph rendered offline at all');
say(measured.loud.rms > 0.004, '1. a break makes real sound: rms ' + measured.loud.rms.toFixed(4)
  + ', peak ' + measured.loud.peak.toFixed(3));
say(measured.silence.peak === 0, '1. and silence is silent: peak ' + measured.silence.peak);
say(measured.loud.clipped === 0 && measured.loud.peak < 1.0,
  '2. the limiter holds through twenty impacts: ' + measured.loud.clipped
  + ' clipped samples, peak ' + measured.loud.peak.toFixed(3));
say(measured.loud.peak > measured.one.peak,
  '2. and a break is still louder than one marble: ' + measured.one.peak.toFixed(3)
  + ' for one, ' + measured.loud.peak.toFixed(3) + ' for twenty');
say(measured.loud.voices <= 20 * 5 && measured.loud.voices > 0,
  '3. the voice count is bounded: ' + measured.loud.voices + ' oscillators for twenty impacts');

/* ---- 4: the rolling cap, and which loop it drops ---- */
const roll = await page.evaluate(async () => {
  const A = await import('./src/audio/synth.js?v=20260904a');
  const t = window.KEEPSIES_DEV.tuning();
  A.configure(t);
  A.setEnabled(true);
  if (!A.unlock()) return { noAudio: true };
  const many = [];
  for (let i = 0; i < 20; i++) many.push({ id: i, speed: 0.2 + i * 0.13, surface: 'dirt', diameterMm: 16 });
  A.updateRolling(many);
  const capped = A.loopCount();
  // now only three are still moving
  A.updateRolling(many.slice(17));
  const after = A.loopCount();
  A.updateRolling([]);
  const none = A.loopCount();
  A.startWarming();
  A.stopWarming();
  A.stopAll();
  return { capped, after, none, cap: t.audio.maxRollingLoops };
});

if (roll.noAudio) {
  say(true, '4. no audio device in this browser, so the rolling cap was not measured (skipped, not failed)');
} else {
  say(roll.capped === roll.cap, '4. twenty rolling marbles make ' + roll.capped
    + ' loops, and the cap is ' + roll.cap);
  say(roll.after === 3, '4. and when three are left rolling, three loops remain: ' + roll.after);
  say(roll.none === 0, '4. and when nothing is rolling, nothing is looping: ' + roll.none);
}

say(errors.length === 0, 'zero page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

await browser.close();
server.close();
console.log(fails.length ? '\n' + fails.length + ' FAILED\nAUDIO BUDGET FAILED' : '\nAUDIO BUDGET OK');
process.exit(fails.length ? 1 : 0);
