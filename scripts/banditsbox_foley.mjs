#!/usr/bin/env node
/* Bandit's Box — foley pipeline check.

   The app prefers a recording over its synth voice: feel() looks in SAMPLES
   first and only falls back to V. Nothing about that path had ever been run,
   because SFX_MANIFEST shipped empty. This generates throwaway WAVs, points
   the manifest at them, and proves the whole chain:

     manifest -> fetch -> decode -> SAMPLES -> feel() plays the recording
     -> repeats vary -> the bank label updates -> missing files change nothing

   Scratch files are written into satellites/bandits-box/sfx/ and removed
   afterwards, so real recordings can live in that folder later untouched.

   Serve the app first:
     python3 -m http.server 8942 -d satellites/bandits-box
     node scripts/banditsbox_foley.mjs */
import puppeteer from "puppeteer";
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "fs";

const BASE = process.env.BB_URL || "http://127.0.0.1:8942/";
const SFX_DIR = "satellites/bandits-box/sfx";
let pass = 0, fail = 0;
const ok = (c, l, d) => { if (c) { pass++; console.log("  ok  " + l); } else { fail++; console.log("  RED " + l + (d ? "  -- " + d : "")); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- a minimal 16 bit mono WAV, so the test needs no fixtures on disk ---- */
function wav(freq, ms, sr = 48000) {
  const n = Math.floor(sr * ms / 1000);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const env = Math.exp(-i / (sr * 0.03));            // short percussive decay
    const s = Math.sin(2 * Math.PI * freq * i / sr) * env * 0.7;
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, s * 32767)), 44 + i * 2);
  }
  return buf;
}

const preexisting = existsSync(SFX_DIR) ? readdirSync(SFX_DIR) : null;
if (preexisting && preexisting.length) {
  console.log("NOTE: sfx/ already holds " + preexisting.length + " files — leaving them alone.");
}
mkdirSync(SFX_DIR, { recursive: true });
const scratch = ["__scratch-01.wav", "__scratch-02.wav", "__scratch-03.wav"];
scratch.forEach((f, i) => writeFileSync(SFX_DIR + "/" + f, wav(420 + i * 190, 120)));

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"]
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667 });
const errs = [];
page.on("pageerror", e => errs.push(e.message));
await page.goto(BASE, { waitUntil: "networkidle2" });
await page.mouse.move(187, 400); await page.mouse.down(); await page.mouse.up();
await sleep(900);

console.log("FOLEY PIPELINE  " + BASE);

/* ---------- the staged manifest is real and reachable ---------- */
console.log("[manifest]");
const staged = await page.evaluate(() => {
  // every name the app can speak, from the synth registry
  const voices = Object.keys(window.V);
  return { voices, manifestKeys: Object.keys(window.SFX_MANIFEST) };
});
ok(staged.voices.includes("click") && staged.voices.includes("clack"),
  "the wall's two switch voices exist in the registry", JSON.stringify(staged.voices.slice(-4)));
ok(staged.manifestKeys.length === 0,
  "manifest ships empty, so the app runs on synth until recordings land",
  JSON.stringify(staged.manifestKeys));

/* ---------- a bank loads and takes over from the synth ---------- */
console.log("[recordings override the synth]");
await page.evaluate(files => {
  window.__played = { sample: 0, synth: 0, rates: [] };
  // count which branch feel() takes, without changing feel itself
  const realPlaySample = window.playSample;
  window.playSample = function (name, pan, semi) {
    const r = realPlaySample.apply(this, arguments);
    if (r) window.__played.sample++;
    return r;
  };
  const realPop = window.V.pop;
  window.V.pop = function () { window.__played.synth++; return realPop.apply(this, arguments); };
  window.SFX_MANIFEST.pop = files;
  window.loadSamples();
}, scratch);
await sleep(1500);

const loaded = await page.evaluate(() => ({
  banks: Object.keys(window.SAMPLES),
  takes: (window.SAMPLES.pop || []).length,
  label: (document.getElementById("bankSub") || {}).textContent
}));
ok(loaded.takes === 3, "all three takes decoded into the bank", JSON.stringify(loaded));
ok(/3 recorded sounds/.test(loaded.label || ""),
  "the settings label reports the recorded bank", String(loaded.label));

// now play the sound the way the app does
await page.evaluate(() => {
  window.__played.sample = 0; window.__played.synth = 0;
  for (let i = 0; i < 12; i++) feel("pop", 100 + i * 8, 300);
});
await sleep(400);
const routed = await page.evaluate(() => window.__played);
ok(routed.sample === 12 && routed.synth === 0,
  "feel() plays the recording and never falls back to the synth", JSON.stringify(routed));

/* ---------- repeats actually vary ---------- */
console.log("[variation]");
const variation = await page.evaluate(() => {
  const picks = {}, rates = new Set();
  const AC = window.AC;
  const realCreate = AC.createBufferSource.bind(AC);
  AC.createBufferSource = function () {
    const s = realCreate();
    const realStart = s.start.bind(s);
    s.start = function () {
      try {
        if (s.buffer && window.SAMPLES.pop && window.SAMPLES.pop.indexOf(s.buffer) >= 0) {
          picks[window.SAMPLES.pop.indexOf(s.buffer)] = 1;
          rates.add(s.playbackRate.value.toFixed(4));
        }
      } catch (e) {}
      return realStart.apply(this, arguments);
    };
    return s;
  };
  for (let i = 0; i < 40; i++) feel("pop", 150, 300);
  AC.createBufferSource = realCreate;
  return { distinctTakes: Object.keys(picks).length, distinctRates: rates.size };
});
ok(variation.distinctTakes >= 2, "repeats draw from more than one take",
  JSON.stringify(variation));
ok(variation.distinctRates >= 5, "repeats are pitch jittered, not stamped",
  JSON.stringify(variation));

/* ---------- the wall's rows pitch a recording ---------- */
/* Let the voice budget recover first: slot() caps concurrent voices at 34 and
   releases them 420ms later, and the variation test above just fired 40. A
   saturated budget makes playSample bail before it ever creates a source, and
   the check below would read as a failure of the app instead of the test. */
await sleep(1200);
console.log("[wall rows pitch the sample]");
const rowPitch = await page.evaluate(() => {
  window.SFX_MANIFEST.click = window.SFX_MANIFEST.pop;
  window.SAMPLES.click = window.SAMPLES.pop;   // same takes, different name
  const AC = window.AC, rates = [];
  const realCreate = AC.createBufferSource.bind(AC);
  AC.createBufferSource = function () {
    const s = realCreate();
    const realStart = s.start.bind(s);
    s.start = function () { try { rates.push(s.playbackRate.value); } catch (e) {} return realStart.apply(this, arguments); };
    return s;
  };
  // row 0 versus row 8, the top and bottom of the wall
  feel("click", 150, 300, 0, 0);
  feel("click", 150, 300, -0.48 * 8, 8);
  AC.createBufferSource = realCreate;
  return { top: rates[0], bottom: rates[1] };
});
ok(rowPitch.bottom < rowPitch.top,
  "a switch lower down the wall plays its recording lower", JSON.stringify(rowPitch));

/* ---------- a missing file breaks nothing ---------- */
console.log("[missing files]");
const missing = await page.evaluate(async () => {
  window.SAMPLES.tap = undefined;
  window.SFX_MANIFEST.tap = ["nope-01.wav", "nope-02.wav"];
  window.loadSamples();
  await new Promise(r => setTimeout(r, 900));
  window.__played.synth = 0;
  const realTap = window.V.tap;
  window.V.tap = function () { window.__played.synth++; return realTap.apply(this, arguments); };
  feel("tap", 150, 300);
  return { bank: window.SAMPLES.tap ? window.SAMPLES.tap.length : 0, synth: window.__played.synth };
});
ok(missing.bank === 0 && missing.synth === 1,
  "a 404'd bank silently falls back to the synth", JSON.stringify(missing));
ok(errs.length === 0, "no page errors anywhere in the pipeline", errs.slice(0, 2).join(" | "));

await browser.close();

/* ---------- clean up the scratch files ---------- */
scratch.forEach(f => { try { rmSync(SFX_DIR + "/" + f); } catch (e) {} });
if (!preexisting || !preexisting.length) { try { rmSync(SFX_DIR, { recursive: true }); } catch (e) {} }
console.log("  (scratch wavs removed)");

console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
