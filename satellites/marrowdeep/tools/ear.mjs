#!/usr/bin/env node
/* THE LOUD MINUTE, FOR HIS EAR.
 *
 *   node tools/ear.mjs        (under the gate lock: it opens a browser)
 *
 * Renders the same minute test/audio.mjs measures, through MD_DEV.renderAudio,
 * which plays the game's own VOICES through its own 0.7 master into an
 * OfflineAudioContext, and writes docs/shots/p3-loud-minute.wav as 16 bit mono.
 *
 * ⛔ NOT NORMALISED. What is in the file is what leaves the phone, so a quiet
 * file means a quiet game. And the file is for listening only: no gate ever
 * measures a wav, because a render tool that normalises hands back its own peak
 * and not the game's (a sibling game measured 0.86 off a wav while clipping).
 * Rerun after any change to a voice, the master or the loud minute's score.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT } from '../test/harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const m = await page.evaluate(() => window.MD_DEV.renderAudio(60, { pcm: true }));
await browser.close();
close();
if (!m || !m.pcm16) {
  console.log('EAR FAILED: no samples came back' + (errors.length ? ': ' + errors.join(' | ') : ''));
  process.exit(1);
}

const pcm = Buffer.from(m.pcm16, 'base64'), sr = m.sampleRate;
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8);
head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22);
head.writeUInt32LE(sr, 24); head.writeUInt32LE(sr * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34);
head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
const out = join(ROOT, 'docs', 'shots', 'p3-loud-minute.wav');
writeFileSync(out, Buffer.concat([head, pcm]));
console.log('EAR WRITTEN  docs/shots/p3-loud-minute.wav  ' + (pcm.length / 2 / sr).toFixed(1) + ' s at ' + sr +
  ' Hz, peak ' + m.peak.toFixed(3) + ', rms ' + m.rms.toFixed(4) + (errors.length ? ', console: ' + errors.join(' | ') : ''));
