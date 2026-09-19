// Boot: load the save, then the stage, the game controller, the shell and the render loop.
// A first launch goes straight into Night 0 and then Night 1 with the Candle (section 5); later launches
// open on the Title. Every action of a run is saved as it happens (the run is its options plus its action
// log), so a killed tab resumes exactly, even mid-cast.
//   ?seed=abc      run seed for New run (default: random)   ?skipTutorial   straight into a Candle run
//   ?tutorial=N    start Night 0 at board N (1-5)            ?replay=...     play a shared cast
//   ?low           low-power materials                       ?nopost         no post-processing
import STRINGS from '../data/strings.json' with { type: 'json' };
import { DATA } from '../sim/data.js';
import { createStage } from '../render/scene.js';
import { createGame } from './game.js';
import { createShell } from './shell.js';
import { newRun, replay as replayRun } from '../sim/run.js';
import { applyRun, ACHIEVEMENTS, validLoans } from '../sim/meta.js';
import { createPost } from '../render/post.js';
import { setQuality } from '../render/materials.js';
import { createAudio } from '../audio/synth.js';
import { load as loadSave, save as writeSave, flushed, emptySave, exportJSON } from '../state/save.js';

document.title = STRINGS.displayName;
const params = new URLSearchParams(location.search);

let profile = await loadSave();
// the older loose flag from the greybox build
try { if (localStorage.getItem('lumen.tutorialDone')) profile.profile.tutorialDone = true; } catch { /* private mode */ }
const persist = () => writeSave(profile);

const stage = createStage(document.getElementById('scene'));
const prefs = profile.profile.prefs;
const systemReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = { reducedMotion: prefs.reducedMotion || systemReduced, patterns: prefs.patterns };
if (params.has('low') || prefs.lowPower) setQuality('low');
const post = params.has('nopost') ? null : createPost(stage, { reducedMotion: motion.reducedMotion, lockQuality: params.has('lockQuality') });

// A short clip of a replay (MediaRecorder on the canvas) where the browser supports it.
function startClip() {
  try {
    if (!window.MediaRecorder || !stage.renderer.domElement.captureStream) return null;
    const stream = stage.renderer.domElement.captureStream(30);
    const type = ['video/webm;codecs=vp9', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
    if (!type) return null;
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2500000 });
    const chunks = [];
    let resolve;
    const ready = new Promise((r) => { resolve = r; });
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => resolve(chunks.length ? new Blob(chunks, { type }) : null);
    rec.start();
    return { ready, stop: () => { try { rec.stop(); } catch { resolve(null); } } };
  } catch { return null; }
}

function randomSeed() {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return a[0].toString(36) + a[1].toString(36);
}

const audio = createAudio();
// One mute setting: the save's. Any mute change (Settings, pause sheet) is written back to it.
const setMutedRaw = audio.setMuted.bind(audio);
audio.setMuted = (on) => { setMutedRaw(on); if (profile.profile.prefs.muted !== !!on) { profile.profile.prefs.muted = !!on; persist(); } };
audio.setMuted(prefs.muted);
const uiRoot = document.getElementById('ui');
const shellRoot = document.getElementById('shell');

function saveRun(state, castPending) {
  profile.currentRun = { opts: state.opts, log: state.log, castPending: !!castPending, night: state.night, phase: state.phase };
  persist();
}

const game = createGame(stage, uiRoot, {
  post, prefs: motion, startClip,
  sound: (kind, payload) => audio.handle(kind, payload),
  // Saved after every action of a real run; a cast is marked pending until its playback ends.
  onAction(state, a, mode) { if (mode === 'run') saveRun(state, a && a.type === 'cast'); },
  onCastEnd(state, mode) { if (mode === 'run' && profile.currentRun) saveRun(state, false); },
  onTutorialComplete() {
    const first = !profile.profile.tutorialDone;
    profile.profile.tutorialDone = true;
    persist();
    if (first) startRun({ lantern: 'candle' }); else toTitle();
  },
  finishRun(state) {
    if (!profile.currentRun) return null; // already folded in
    const out = applyRun(profile, state, DATA, Date.now());
    profile.currentRun = null;
    persist();
    return out;
  },
  achievement: (id) => ACHIEVEMENTS.achievements.find((a) => a.id === id),
  loanable(state) {
    const loaned = state.pouch.map((u) => state.gems[u]).filter((g) => g.loaned);
    const inRun = new Set(loaned.map((g) => g.cabinetId));
    return profile.cabinet.filter((g) => !inRun.has(g.cabinetId) && !validLoans([...loaned, g], Infinity));
  },
  intro: (key, inline) => shell.intro(key, inline),
  onTitle: () => toTitle(),
  onNewRun: () => { toTitle(); shell.lanternSelect(); },
  onPause() {
    const panel = game.hud.openSheet(`<h2>Paused</h2><div class="row"><button class="btn resume">Resume</button><button class="btn small mute">${audio.muted ? 'Sound off' : 'Sound on'}</button><button class="btn small totitle">Title</button></div>
      <p class="muted">Your run is saved after every move.</p>`);
    panel.querySelector('.resume').onclick = () => game.hud.closeSheet();
    panel.querySelector('.mute').onclick = (e) => { audio.setMuted(!audio.muted); e.currentTarget.textContent = audio.muted ? 'Sound off' : 'Sound on'; };
    panel.querySelector('.totitle').onclick = () => { game.hud.closeSheet(); toTitle(); };
  },
});

const shell = createShell(shellRoot, {
  profile: () => profile,
  persist,
  toast: (m) => game.hud.toast(m),
  startRun,
  resume: resumeRun,
  startTutorial: () => { enterGame(); game.startTutorial(0); },
  applyPrefs,
  replaceProfile(p) { profile = p; persist(); applyPrefs(); },
});

let lowPref = null;
function applyPrefs() {
  const p = profile.profile.prefs;
  audio.setMuted(p.muted);
  motion.reducedMotion = p.reducedMotion || systemReduced;
  game.setPatterns(!!p.patterns);
  game.setReducedMotion(motion.reducedMotion);
  // Only a change of the preference switches quality, so the automatic fallback is never undone.
  const low = !!p.lowPower || params.has('low');
  if (low !== lowPref) { if (lowPref !== null || low) setQuality(low ? 'low' : 'high'); lowPref = low; }
  document.body.classList.toggle('reduced', motion.reducedMotion);
}

function enterGame() {
  shell.hide();
  uiRoot.classList.remove('hidehud');
}

function toTitle() {
  game.hud.closeSheet();
  uiRoot.classList.add('hidehud');
  game.attract(true);
  shell.title();
}

function startRun(opts = {}) {
  enterGame();
  const seed = opts.seed || params.get('seed') || randomSeed();
  const s = newRun({ seed, lantern: opts.lantern || 'candle', vigil: opts.vigil | 0, loans: opts.loans || [] });
  game.load(s, 'run');
  saveRun(s, false);
}

function resumeRun() {
  const r = profile.currentRun;
  if (!r) return toTitle();
  enterGame();
  try { game.resume(r.opts, r.log, r.castPending); } catch (err) {
    console.warn('saved run could not be rebuilt', err);
    profile.currentRun = null; persist(); toTitle();
  }
}

// A shared cast link: rebuild the run from its seed and moves, then play that cast.
function openReplay(b64) {
  try {
    const json = decodeURIComponent(escape(atob(b64.replace(/-/g, '+').replace(/_/g, '/'))));
    const { seed, lantern, vigil, loans, log } = JSON.parse(json);
    const last = log[log.length - 1];
    const s = replayRun({ seed, lantern, vigil, loans }, last && last.type === 'cast' ? log.slice(0, -1) : log);
    enterGame();
    game.playView(s, () => {
      const panel = game.hud.openSheet(`<h2>A shared cast</h2><p class="muted">Seed ${seed}. Play the same boards and shop yourself.</p>
        <div class="row end"><button class="btn small totitle">Title</button><button class="btn playseed">Play this seed</button></div>`);
      panel.querySelector('.totitle').onclick = () => toTitle();
      panel.querySelector('.playseed').onclick = () => startRun({ seed, lantern, vigil });
    });
    return true;
  } catch (err) { console.warn('bad replay link', err); return false; }
}

applyPrefs();
if (params.has('replay') && openReplay(params.get('replay'))) { /* playing a shared cast */ }
else if (params.has('tutorial')) { enterGame(); game.startTutorial(Math.max(0, Math.min(4, (Number(params.get('tutorial')) || 1) - 1))); }
else if (params.has('skipTutorial')) { profile.profile.tutorialDone = true; startRun({ lantern: 'candle' }); }
else if (!profile.profile.tutorialDone) { enterGame(); game.startTutorial(0); }
else toTitle();

let last = performance.now();
const perf = { frames: 0, jsMs: 0, maxJsMs: 0 };
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = performance.now();
  game.update(dt);
  const s = game.state;
  const mood = shell.current === 'cabinet' ? 'cabinet' : shell.current || !s ? 'title' : s.phase === 'shop' || s.phase === 'reward' ? 'lapidary' : s.n && s.n.eclipse ? 'eclipse' : s.phase === 'night' ? 'night' : 'title';
  audio.setMood(mood, (s && s.night) || 0);
  if (post) post.render(dt, (now - (window.__lumen.lastNow || now)) || 16); else stage.renderer.render(stage.scene, stage.camera);
  window.__lumen.lastNow = now;
  const ms = performance.now() - t;
  perf.frames++; perf.jsMs += ms; perf.maxJsMs = Math.max(perf.maxJsMs, ms);
  window.__lumen.perf = { avgMs: +(perf.jsMs / perf.frames).toFixed(2), maxMs: +perf.maxJsMs.toFixed(1), frames: perf.frames };
  window.__lumen.frames++;
  requestAnimationFrame(frame);
}
window.__lumen = {
  stage, game, post, audio, shell, ready: true, frames: 0, startRun, toTitle, resume: resumeRun,
  get profile() { return profile; }, exportSave: () => exportJSON(profile), flushed, emptySave,
};
requestAnimationFrame(frame);
