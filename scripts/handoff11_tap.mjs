#!/usr/bin/env node
/* Touch target probe: 48px minimum, measured as RENDERED pixels at 375x667,
   and every control must actually be reachable at its own centre.

   Two separate failures this catches, both of which have shipped here before:
     SIZE  a control that measures 72 CSS px in the stylesheet but renders at
           44.6 real px once a transform or a media query gets involved.
     HIT   a control that is the right size but has something on top of it.
           el.click() would pass anyway, because it skips hit testing. So this
           asks document.elementFromPoint at the control's centre, the way a
           thumb does.

   Serve the repo root first:
     python3 -m http.server 8951
     node scripts/handoff11_tap.mjs deepwell

   --selftest injects a too small button and an overlay to prove both gates go
   red. A gate nobody has watched fail is decoration. */
import puppeteer from "puppeteer";

const id = process.argv[2];
if (!id) { console.log("usage: node scripts/handoff11_tap.mjs <gameid> [--selftest]"); process.exit(1); }

const BASE = process.env.LW_URL || "http://127.0.0.1:8951";
const MIN = 48;
const selftest = process.argv.includes("--selftest");
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
await page.goto(BASE + "/satellites/" + id + "/?probe=" + Math.floor(Math.random() * 1e9), { waitUntil: "domcontentloaded" });
await sleep(1500);

if (selftest) {
  await page.evaluate(() => {
    const tiny = document.createElement("button");
    tiny.id = "__tiny"; tiny.textContent = "x";
    tiny.style.cssText = "position:fixed;left:10px;top:300px;width:20px;height:20px;z-index:5";
    document.body.appendChild(tiny);
    const under = document.createElement("button");
    under.id = "__covered"; under.textContent = "covered";
    under.style.cssText = "position:fixed;left:120px;top:300px;width:90px;height:60px;z-index:5";
    document.body.appendChild(under);
    const lid = document.createElement("div");
    lid.style.cssText = "position:fixed;left:100px;top:280px;width:150px;height:110px;z-index:99;background:rgba(255,0,0,.2)";
    document.body.appendChild(lid);
  });
}

const report = await page.evaluate(min => {
  const SEL = 'button, [role="button"], a[href], input, select, [onclick], .btn, .key, [data-tap]';
  const out = [];
  for (const el of document.querySelectorAll(SEL)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;                 // not rendered
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;  // offscreen
    const label = (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string"
      ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "") ||
      el.tagName.toLowerCase() + ":" + (el.textContent || "").trim().slice(0, 14);
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
    const hit = document.elementFromPoint(cx, cy);
    const reachable = !!hit && (hit === el || el.contains(hit) || hit.contains(el));
    out.push({
      label, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      small: r.width < min || r.height < min,
      reachable,
      blocker: reachable ? "" : (hit ? (hit.id ? "#" + hit.id : hit.tagName.toLowerCase()) : "nothing")
    });
  }
  return out;
}, MIN);

console.log("TAP PROBE  " + id + "  at 375x667, minimum " + MIN + "px rendered");
const small = report.filter(r => r.small);
const blocked = report.filter(r => !r.reachable);
for (const r of report) {
  const flags = [r.small ? "SMALL" : "", !r.reachable ? "BLOCKED by " + r.blocker : ""].filter(Boolean).join(" ");
  if (flags) console.log("  FAIL  " + r.label + "  " + r.w + "x" + r.h + "  " + flags);
}
console.log("  " + report.length + " visible controls, " + small.length + " undersized, " + blocked.length + " unreachable");

if (selftest) {
  const caughtSmall = small.some(r => r.label.includes("__tiny"));
  const caughtBlocked = blocked.some(r => r.label.includes("__covered"));
  console.log("  SELFTEST size gate: " + (caughtSmall ? "RED as expected" : "DID NOT FAIL"));
  console.log("  SELFTEST hit gate:  " + (caughtBlocked ? "RED as expected" : "DID NOT FAIL"));
  await browser.close();
  process.exit(caughtSmall && caughtBlocked ? 0 : 2);
}

await browser.close();
process.exit(small.length + blocked.length ? 1 : 0);
