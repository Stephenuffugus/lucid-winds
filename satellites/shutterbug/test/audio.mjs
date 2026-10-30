/* Browser gate `audio` (BUILD-PLAN.md T1.7): after a REAL tap the AudioContext runs; a jump schedules exactly one voice
 * and a dive landing two (the dive and the land), counted through SB_DEV.audioEvents(); ten asks of one name inside
 * 100 ms schedule four; with the sound setting off nothing is scheduled (the setting's own call, SB.audio.setSound,
 * until T1.10's toggle); the page holds no <audio> element and asks for no audio file.
 *
 * Watched red by LAND_EVERY_FRAME (a land voice every grounded step), SETTING_IGNORED (sound off still schedules) and
 * AUDIO_FILE_REQUEST (a file asked for). */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, step } from './harness.mjs';

const R = reporter('AUDIO');
const srv = await serve();
const browser = await launch();
try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  const media = [];
  page.on('request', req => { const u = req.url(); if (req.resourceType() === 'media' || /\.(mp3|ogg|oga|wav|m4a|aac|flac|opus|weba)(\?|$)/i.test(u)) media.push(u); });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample');
  let state = 'none';
  for (let k = 0; k < 30 && state !== 'running'; k++) { await new Promise(r => setTimeout(r, 100)); state = await page.evaluate(() => window.SB_DEV.audioState()); }
  R.say(state === 'running', 'after a real tap the AudioContext runs (' + state + ')');
  await page.evaluate(() => { for (let k = 0; k < 120 && !window.SB_DEV.state().hero.ground; k++) window.SB_DEV.step(1); window.SB_DEV.step(2); });
  const events = () => page.evaluate(() => window.SB_DEV.audioEvents());

  /* a jump: one voice */
  const j0 = (await events()).length;
  await tap(page, '#btnA'); await step(page, 1);
  const jev = (await events()).slice(j0), jumped = await page.evaluate(() => !window.SB_DEV.state().hero.ground);
  R.say(jumped && jev.length === 1 && jev[0].name === 'jump', 'a jump schedules exactly one voice (' + jev.map(e => e.name).join(', ') + ')');

  /* a dive in the air, then its landing: two voices, the dive and the land */
  await step(page, 3);
  const d0 = (await events()).length;
  await tap(page, '#btnB');
  await page.evaluate(() => { for (let k = 0; k < 120; k++) { window.SB_DEV.step(1); if (window.SB_DEV.state().hero.ground) break; } window.SB_DEV.step(6); });
  const dev = (await events()).slice(d0);
  R.say(dev.map(e => e.name).join() === 'dive,land', 'a dive landing schedules two voices, the dive and the land (' + dev.map(e => e.name).join(', ') + ')');

  /* the voice limit: ten asks of one name in the same instant schedule four */
  await new Promise(r => setTimeout(r, 250));
  const lim = await page.evaluate(() => { const n0 = window.SB_DEV.audioEvents().length; for (let k = 0; k < 10; k++) window.SB.audio.play('pickup'); return window.SB_DEV.audioEvents().length - n0; });
  R.say(lim === 4, 'ten asks of one sound in the same instant schedule four voices (' + lim + ')');

  /* sound off: nothing scheduled, though the jump is asked for */
  await page.evaluate(() => { window.SB.audio.setSound(false); for (let k = 0; k < 60; k++) { window.SB_DEV.step(1); if (window.SB_DEV.state().hero.ground) break; } window.SB_DEV.step(2); });
  const o0 = (await events()).length, asked0 = await page.evaluate(() => window.SB_DEV.audioPlayed().jump || 0);
  await tap(page, '#btnA'); await step(page, 1);
  const off = (await events()).length - o0, asked1 = await page.evaluate(() => window.SB_DEV.audioPlayed().jump || 0);
  R.say(off === 0 && asked1 === asked0 + 1, 'with the sound off a jump is asked for and nothing is scheduled (' + off + ' voices)');
  await page.evaluate(() => window.SB.audio.setSound(true));

  const audioEls = await page.evaluate(() => document.querySelectorAll('audio').length);
  R.say(audioEls === 0 && media.length === 0, 'no <audio> element (' + audioEls + ') and no audio file asked for (' + (media.join(', ') || 'none') + ')');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
} finally { await browser.close(); await srv.close(); }
R.finish();
