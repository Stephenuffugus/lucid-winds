/* PART 1 item 5 of HANDOFF-OPUS-AUG24: LOOK at Flock the World.
   Walks the real UI and ASSERTS the expected screen after every navigation,
   because a script that logs "tapped" without checking is a probe that cannot
   fail. Shoots portrait 412x915 and landscape 915x412, dsf2, touch, fab hidden. */
import puppeteer from "puppeteer";
const OUT = "/workspaces/lucid-winds/portal-assets/review/ftw-morning-aug24";
const P = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const L = { width: 915, height: 412, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await br.newPage();
const errs = [];
p.on("pageerror", e => errs.push("pageerror: " + String(e).slice(0, 180)));
p.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160)); });
await p.evaluateOnNewDocument(() => {
  try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {}
  const hide = () => { const s = document.createElement("style"); s.textContent = ".lwfb-fab,#lwfb-fab,[id*=lwfb]{display:none !important}"; document.head.appendChild(s); };
  if (document.head) hide(); else document.addEventListener("DOMContentLoaded", hide);
});
const liveScreen = () => p.evaluate(() => {
  const on = [...document.querySelectorAll(".screen")].filter(e => e.classList.contains("on")).map(e => e.id);
  return on.length ? on.join(",") : "(game)";
});
async function shot(name, vp) {
  await p.setViewport(vp); await sleep(800);
  await p.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  shot ${name}  ${vp.width}x${vp.height}  screen=${await liveScreen()}`);
}
async function step(label, fn, expect) {
  await fn();
  await sleep(1600);
  const got = await liveScreen();
  if (expect && got !== expect) { problems.push(`${label}: expected screen "${expect}" got "${got}"`); console.log(`  !! ${label} -> ${got} (wanted ${expect})`); }
  else console.log(`  ok ${label} -> ${got}`);
  return got;
}
await p.setViewport(P);
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe=" + Math.random(), { waitUntil: "domcontentloaded" });
await sleep(3000);
await shot("01_menu_portrait", P);
await shot("02_menu_landscape", L);
await p.setViewport(L); await sleep(600);
await step("open for business", () => p.evaluate(() => document.getElementById("startBtn").click()), "pick");
await shot("03_briefing_landscape", L);
await shot("04_briefing_portrait", P);
await p.setViewport(L); await sleep(600);
// select a country by real tap on the map canvas, then name the vendor
let picked = false;
for (const [fx, fy] of [[0.50, 0.45], [0.30, 0.40], [0.62, 0.50], [0.45, 0.35]]) {
  const box = await p.evaluate((fx, fy) => { const c = document.getElementById("pickMap"); const b = c.getBoundingClientRect(); return { x: b.x + b.width * fx, y: b.y + b.height * fy }; }, fx, fy);
  await p.touchscreen.tap(box.x, box.y); await sleep(700);
  if (await p.evaluate(() => !document.getElementById("beginBtn").disabled)) { picked = true; break; }
}
if (!picked) problems.push("could not select a country by tapping the pick map");
await p.evaluate(() => { const i = document.getElementById("coInput"); i.value = "Vigil Systems"; i.dispatchEvent(new Event("input", { bubbles: true })); });
await sleep(500);
await shot("05_briefing_named_landscape", L);
await step("deploy first unit", () => p.evaluate(() => document.getElementById("beginBtn").click()), "(game)");
await sleep(2500);
await shot("06_game_landscape", L);
await shot("07_game_portrait", P);
// tabs
const TABS = [["dep", "08_tree_deployment"], ["cap", "09_tree_watchlist"], ["war", "10_world"], ["log", "11_feed"], ["reg", "12_regions"]];
for (const [t, label] of TABS) {
  const found = await p.evaluate(t => { const b = document.querySelector(`.nb[data-tab="${t}"]`); if (!b) return false; b.click(); return true; }, t);
  if (!found) { problems.push(`tab ${t} not found`); continue; }
  await sleep(1700);
  await shot(label + "_landscape", L);
  await shot(label + "_portrait", P);
  await p.setViewport(L); await sleep(400);
}
// the Ledger, opened the way a player opens it: the Watched odometer
await p.evaluate(() => { const e = document.getElementById("ledline"); if (e) e.click(); });
await sleep(1600);
await shot("13_ledger_landscape", L);
await shot("14_ledger_portrait", P);
await p.evaluate(() => { if (typeof closeSheet === "function") closeSheet(); else document.querySelectorAll(".sheet.on,#sheet.on").forEach(e => e.classList.remove("on")); });
await sleep(800);
// an event modal, forced rather than waited for
const gotEvent = await p.evaluate(() => { try { for (let i = 0; i < 300; i++) { maybeEvent(S); const m = document.querySelector("#modal.on,.modal.on"); if (m) return true; } } catch (e) { return "threw: " + e.message; } return false; });
await sleep(1200);
if (gotEvent === true) { await shot("15_event_modal_landscape", L); await shot("16_event_modal_portrait", P); }
else { problems.push("no event modal could be forced: " + gotEvent); console.log("  !! event modal: " + gotEvent); }
// endings
for (const [won, why, label] of [[false, "refusal", "17_ending_refusal"], [true, "win", "18_ending_win"]]) {
  const r = await p.evaluate((w, y) => { try { finish(w, y); return true; } catch (e) { return "threw: " + e.message; } }, won, why);
  await sleep(2200);
  if (r === true) { await shot(label + "_landscape", L); await shot(label + "_portrait", P); }
  else { problems.push(`${label}: ${r}`); console.log("  !! " + label + ": " + r); }
}
console.log("\n--- page errors ---");
console.log(errs.length ? [...new Set(errs)].slice(0, 8).join("\n") : "none");
console.log("--- navigation problems ---");
console.log(problems.length ? problems.join("\n") : "none");
await br.close();
