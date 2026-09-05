#!/usr/bin/env node
/* The recorder, end to end.
 *
 *   node test/record.mjs
 *
 * What it asserts, each watched to fail:
 *   1. REC starts a recording and says so on the button, with the seconds
 *   2. a three second hold while recording yields a real Blob, over 20 KB
 *   3. whose type is one this app asked for
 *   4. the sheet comes up with the filename, and the name carries the mood and
 *      the date so a phone full of them is still readable
 *   5. the sheet SAYS which way it will hand the file over, share or download,
 *      and takes that way when pressed
 *   6. and nothing is stored: the app keeps no list of recordings
 *
 * ⛔ The Blob arrives in onstop, never on stop(). A gate that reads it straight
 * after pressing REC reads nothing.
 */
import { serve, open, reporter, tap, centre, sleep, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

const mid = await dev(() => ({ x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight * 0.55) }));
const press = () => dev((x, y) => document.getElementById('stage').dispatchEvent(new PointerEvent('pointerdown',
  { pointerId: 4, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), mid.x, mid.y);
const lift = () => dev((x, y) => document.getElementById('stage').dispatchEvent(new PointerEvent('pointerup',
  { pointerId: 4, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), mid.x, mid.y);

const bRec = await centre(page, '#btnRec');
say(!!bRec && bRec.w >= 56 && bRec.h >= 56 && bRec.onTop, 'REC is ' + (bRec ? bRec.w.toFixed(0) + 'x' + bRec.h.toFixed(0) : 'missing') + ' px and a tap at its centre lands on it');

/* the engine has to be open before there is a stream to record */
await press();
await page.waitForFunction(() => window.SWELL_DEV.state() === 'held', { timeout: 10000 });
await tap(page, '#btnRec');
await sleep(400);
say(await dev(() => window.SWELL_DEV.recording()), 'REC starts a recording');
const label = await dev(() => document.getElementById('recLabel').textContent);
say(/^\d+$/.test(label), 'and the button counts the seconds: ' + JSON.stringify(label));
say(await dev(() => document.getElementById('btnRec').classList.contains('on')), 'and it says it is on');

await sleep(3000);
await lift();
await page.waitForFunction(() => window.SWELL_DEV.state() !== 'held', { timeout: 10000 }).catch(() => {});
await tap(page, '#btnRec');
/* ⛔ the Blob arrives in onstop */
const got = await page.waitForFunction(() => window.SWELL_DEV.lastRecording(), { timeout: 20000 })
  .then(() => dev(() => window.SWELL_DEV.lastRecording())).catch(() => null);
say(!!got, 'stopping it produces a file');
if (got) {
  say(got.size > 20000, 'and it is a real recording, ' + Math.round(got.size / 1024) + ' KB');
  say(/^audio\/(webm|mp4)/.test(got.type), 'of a type this app asked for: ' + got.type);
  say(/^swell-dawn-\d{8}-\d{4}\.(webm|m4a)$/.test(got.name), 'named so a phone full of them is readable: ' + got.name);
  say(!(await dev(() => window.SWELL_DEV.recording())), 'and the recorder is off again');
  const sheet = await dev(() => ({
    on: document.getElementById('scrSaved').classList.contains('on'),
    text: document.getElementById('savedName').textContent
  }));
  say(sheet.on, 'the sheet comes up');
  say(sheet.text.indexOf(got.name) >= 0 && /KB/.test(sheet.text), 'and it says what it is: ' + JSON.stringify(sheet.text));
  await centre(page, '#btnSavedShare').then(c => say(!!c && c.h >= 48 && c.onTop, 'SHARE IT is reachable'));
  await centre(page, '#btnSavedDone').then(c => say(!!c && c.h >= 48 && c.onTop, 'and DONE is too'));

  /* 5. it takes a path and says which. Headless has no navigator.share, so the
        download path is the one it must take, and it must say so. */
  await tap(page, '#btnSavedShare');
  await sleep(600);
  const path = await dev(() => window.SWELL_DEV.lastRecording().path);
  say(path === 'share' || path === 'download', 'and it hands the file over one definite way: ' + path);
  const said = await dev(() => document.getElementById('toast').textContent);
  say(path !== 'download' || /downloads/i.test(said), 'and it tells the player which way it went: ' + JSON.stringify(said));

  /* 6. nothing is stored */
  const saved = await dev(() => { try { return localStorage.getItem('lw_swell_v1') || ''; } catch (e) { return ''; } });
  say(saved.indexOf(got.name) < 0 && !/webm|mp4|blob/i.test(saved), 'and nothing about the recording is kept in the save');
}

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' RECORD FAILURE(S)'); process.exit(1); }
console.log('RECORD OK');
