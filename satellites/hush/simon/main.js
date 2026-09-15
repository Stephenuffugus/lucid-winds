/* HUSH's Mode 5, SIMON (plans/hush/HANDOFF-HUSH.md 3.7): thirty commands, three seconds each; a child acts only when the command
 * begins with the signal word. The game shows the command, speaks it when Sound is on and a voice exists on this device, and
 * waits. IT SCORES NOTHING: no answer, no result, no store written by this file (the lint and test/simon.mjs hold that). No
 * camera, no microphone, no motion sensor (H5). The order is dealSimon's, H1's share of "Hush says" with three before every
 * other.
 */
import { settings, tokens, SETTINGS_DEFAULTS, rng } from '../../math/core/core.js?v=20260916d';
import { dealSimon } from '../engine.js?v=20260916d';
import { COPY, SIGNAL_WORD, PALETTE_TOKENS } from '../content.js?v=20260916d';

const HOLD_MS = 3000;
const SCHEMA = { v: 1, fresh: () => ({ v: 1, collect: [], adapt: { runs: [], steps: 0, forked: false }, settings: Object.assign({ quick: false }, SETTINGS_DEFAULTS) }) };
const Q = new URLSearchParams(location.search);
const SEED = /^\d+$/.test(Q.get('seed') || '') ? Number(Q.get('seed')) : Math.floor(Math.random() * 1e9);

tokens.inject(PALETTE_TOKENS);
/* the shared panel, for Sound; this file itself never writes the store */
const panel = settings.mount({ gameId: 'hush', schema: SCHEMA });

const el = id => document.getElementById(id);
el('how').textContent = COPY.simonHow;
el('simon-go').textContent = COPY.simonGo;
el('again').textContent = COPY.again;
el('home').textContent = COPY.home;

/* a wait on animation frames against a measured deadline, never a timer */
const waitMs = ms => new Promise(resolve => { const t0 = performance.now(); const tick = t => (t - t0 >= ms ? resolve(t) : requestAnimationFrame(tick)); requestAnimationFrame(tick); });

const r = rng(SEED >>> 0);
const shown = [], spoken = [];
let phase = 'idle', session = -1;

/* speech, guarded: a device with no voice, or one that throws, still shows every command */
function speak(text) {
  if (panel.get().muted) return;
  try {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance !== 'function') return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    spoken.push(text);
  } catch (e) { /* no voice; the command is on the screen */ }
}

async function play() {
  session++;
  phase = 'playing';
  el('simon-go').hidden = true;
  el('again').hidden = true;
  const commands = dealSimon(r);
  for (let i = 0; i < commands.length; i++) {
    const c = commands[i];
    el('say').textContent = c.says ? SIGNAL_WORD : '';
    el('command').textContent = c.command;
    shown.push({ session, i, says: c.says, command: c.command, at: performance.now() });
    speak((c.says ? SIGNAL_WORD + ', ' : '') + c.command);
    await waitMs(HOLD_MS);
  }
  el('say').textContent = '';
  el('command').textContent = '';
  phase = 'done';
  el('again').hidden = false;
  el('again').focus();
}

el('simon-go').addEventListener('click', play);
el('again').addEventListener('click', play);
el('home').addEventListener('click', () => { location.href = '../index.html' + location.search; });

window.SIMON = {
  ready: true,
  phase: () => phase,
  shown: () => shown.map(x => Object.assign({}, x)),
  spoken: () => spoken.slice(),
  holdMs: HOLD_MS
};
