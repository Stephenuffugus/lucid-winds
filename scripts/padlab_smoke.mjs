#!/usr/bin/env node
/* PadLab smoke: boot past splash, start a groove, switch every view,
   assert transport runs and zero console errors. Screenshots to scratchpad
   (or $PADLAB_SHOTS) for the LOOKING pass. Serve padlab/ before running,
   e.g.:  python3 -m http.server 8931 -d padlab  */
import puppeteer from "puppeteer";

const BASE = process.env.PADLAB_URL || "http://127.0.0.1:8931/";
const SHOTS = process.env.PADLAB_SHOTS || "/tmp/claude-1000/-workspaces-lucid-winds/8920c4cb-388b-4ccf-bab1-3c245821805c/scratchpad";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream"]
});
const page = await browser.newPage();
await page.setViewport({
  width: +(process.env.PADLAB_W || 412),
  height: +(process.env.PADLAB_H || 915),
  deviceScaleFactor: 2
});

// pre-unlock the shared wolfden dev gate so smoke tests exercise the app itself
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });

const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));

let pass = 0, fail = 0;
const t = (name, ok, detail) => {
  console.log((ok ? "  ✅ " : "  ❌ ") + name + (detail ? " — " + detail : ""));
  ok ? pass++ : fail++;
};

await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
await page.screenshot({ path: `${SHOTS}/padlab-1-splash.png` });

// splash → app (real click at element centre, not el.click())
const btn = await page.$("#startBtn");
t("splash shows the start button", !!btn);
const bb = await btn.boundingBox();
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await page.waitForSelector("#app.on", { timeout: 10000 });
t("app shell appears after start", true);
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: `${SHOTS}/padlab-2-beats.png` });

// tap the first groove → transport should light
const g = await page.$("#grooves > *");
t("grooves rendered", !!g);
if (g) {
  const gb = await g.boundingBox();
  await page.mouse.click(gb.x + gb.width / 2, gb.y + gb.height / 2);
  await new Promise(r => setTimeout(r, 900));
  const playing = await page.$eval("#playBtn", el => el.classList.contains("on"));
  t("tapping a groove starts the transport", playing);
  const audioState = await page.evaluate(() => window.__plAC ? window.__plAC.state : "n/a");
  await page.screenshot({ path: `${SHOTS}/padlab-3-groove-playing.png` });
}

// keys view
const keysTab = await page.$('.tab[data-view="keys"]');
const kb = await keysTab.boundingBox();
await page.mouse.click(kb.x + kb.width / 2, kb.y + kb.height / 2);
await new Promise(r => setTimeout(r, 700));
t("keys view has a keyboard", !!(await page.$("#keyboard")));
await page.screenshot({ path: `${SHOTS}/padlab-4-keys.png` });

// sample view
const sampTab = await page.$('.tab[data-view="sample"]');
const sb = await sampTab.boundingBox();
await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `${SHOTS}/padlab-5-sample.png` });

// MPK map sheet: opens from the MIDI pill, renders 8 knobs + 8 pads
const pill = await page.$("#midiPill");
const pb = await pill.boundingBox();
await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
await new Promise(r => setTimeout(r, 500));
const mpk = await page.evaluate(() => ({
  open: document.getElementById("mpkSheet").classList.contains("on"),
  knobs: document.querySelectorAll("#mkKnobs .mk-knob").length,
  pads: document.querySelectorAll("#mkPads .mk-pad").length
}));
t("MPK map opens with 8 knobs + 8 pads", mpk.open && mpk.knobs === 8 && mpk.pads === 8, JSON.stringify(mpk));
await page.screenshot({ path: `${SHOTS}/padlab-6-mpkmap.png` });
// tap first knob -> assign chips appear
const knob = await page.$("#mkKnobs .mk-knob");
const kb2 = await knob.boundingBox();
await page.mouse.click(kb2.x + kb2.width / 2, kb2.y + kb2.height / 2);
await new Promise(r => setTimeout(r, 300));
const chips = await page.evaluate(() => document.querySelectorAll("#mkAssign [data-t]").length);
t("knob assignment chips render", chips === 9, chips + " chips");
await page.screenshot({ path: `${SHOTS}/padlab-7-knob-assign.png` });
await page.evaluate(() => document.querySelectorAll(".sheet-bg").forEach(s => s.classList.remove("on")));

// service worker registered? (only meaningful when served over http)
const swState = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return "unsupported";
  const regs = await navigator.serviceWorker.getRegistrations();
  return regs.length ? (regs[0].active ? "active" : "installing") : "none";
});
console.log("  service worker: " + swState);

// touch-target audit: every visible button ≥44px rendered (48 is the studio bar,
// report anything under 44 as fail, 44-47 as warning)
const small = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("button").forEach(b => {
    const r = b.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return; // hidden
    const m = Math.min(r.width, r.height);
    if (m < 48) out.push(`${b.id || b.className || b.textContent.slice(0, 14)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  return out;
});
t("touch targets ≥48px rendered", small.length === 0, small.length ? small.slice(0, 12).join(" | ") + (small.length > 12 ? ` (+${small.length - 12} more)` : "") : "");

t("zero console/page errors", errors.length === 0, errors.slice(0, 5).join(" ; "));

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
