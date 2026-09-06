/* The film. A short run recorded off the canvas has to come back as a real
   blob of a real type.
   ⛔ the blob arrives in onstop, never after stop() returns, so this waits for
   it rather than reading it straight back. */
import { serve, open, reporter, waitFrames, sleep, tap, centre } from './harness.mjs';

const s = await serve();
const { browser, page, errors } = await open(s.base, { width: 667, height: 375, deviceScaleFactor: 1 });
const { fails, say } = reporter();

const can = await page.evaluate(() => ({
  capture: typeof document.createElement('canvas').captureStream === 'function',
  rec: typeof MediaRecorder !== 'undefined'
}));
say(can.capture && can.rec, 'this browser can film at all (captureStream ' + can.capture
  + ', MediaRecorder ' + can.rec + ')');

await page.evaluate(() => { DOOHICKEY_TEST.start(0); DOOHICKEY_TEST.solution(); });
await waitFrames(page, 2);
/* a gesture first, so the audio context is open and its track is real */
await tap(page, '#btnGo');
await sleep(200);
await page.evaluate(() => DOOHICKEY_TEST.stop());
await waitFrames(page, 2);

const started = await page.evaluate(() => DOOHICKEY_TEST.startFilm());
say(started === true, 'the camera starts');
await page.evaluate(() => DOOHICKEY_TEST.go());
await sleep(5000);
await page.evaluate(() => DOOHICKEY_TEST.stopFilm());

let film = null;
const t0 = Date.now();
while (Date.now() - t0 < 6000) {
  film = await page.evaluate(() => {
    const f = DOOHICKEY_TEST.film();
    return f.blob ? { size: f.blob.size, type: f.blob.type, on: f.on } : null;
  });
  if (film) break;
  await sleep(150);
}
say(!!film, 'and a blob comes back from onstop, not from stop()');
say(!!film && film.size > 50 * 1024, 'and it is a real film (' + (film ? (film.size / 1024).toFixed(0) : 0) + ' KB)');
say(!!film && /^video\/(webm|mp4)/.test(film.type), 'of a type from the list (' + (film ? film.type : '?') + ')');
say(!!film && film.on === false, 'and the camera stopped itself');

/* the button that starts it is a real target */
const btn = await centre(page, '#btnFilm');
say(!!btn, 'and the button that starts it exists on the win card');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' FILM FAILURE(S)'); process.exit(1); }
console.log('\nFILM OK');
