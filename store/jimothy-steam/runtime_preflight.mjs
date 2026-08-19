#!/usr/bin/env node
/* CAN A PLAYER REACH A PAYMENT SURFACE IN THE VENDORED STEAM BUILD?
   node store/jimothy-steam/runtime_preflight.mjs [baseurl]
   (needs a static server on the REPO ROOT; defaults to :8777)

   WHY THIS EXISTS, IN THE PROJECT'S OWN WORDS. From STEAM_SUBMIT.md:

     "The vendor script already had a step that *looked* like it did this. It did
      not. It swapped two HTML comment markers that do not exist in the game, and
      set a flag named window.STEAM_BUILD that nothing in the game ever read. The
      strip was a no-op and the build would have gone to review with a live Stripe
      checkout inside it."

   capsules/preflight.js checks the FLAG IS PRESENT and set before the game reads
   it. Necessary, and not this: a flag nothing acts on passes it. Valve does not
   review flags, they open the game and click things.

   ⛔ WHAT THIS MEASURES, AND WHY IT IS NOT "IS THE BUTTON HIDDEN".
   Three earlier versions of this file were wrong, each differently:
     1. Gated on getBoundingClientRect().width > 4. Every element reported 0x0,
        because a child of a display:none parent HAS NO BOX. That silenced every
        detection: the Steam build "passed" while proving nothing.
     2. Forced every .screen visible at once. That stacks them, and it also starts
        the screen entrance animation, which begins at opacity 0 — so the one
        element that WAS visible got rejected as "transparent". A measurement
        racing a CSS animation.
     3. Read the upsell elements directly. They are display:none in BOTH builds by
        default, because SUP.render() paints them and only runs when a player
        navigates there. Nothing forced from CSS can ever see them.

   So it measures the thing that actually matters: THE DOORS. Every route a player
   has into the payment screen, reached by real navigation, no forcing. The web
   build must have at least one open door, or this checker is blind. The Steam
   build must have none. */
import p from "puppeteer";
const BASE = process.argv[2] || "http://127.0.0.1:8777";
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fail = 0, pass = 0;
const ok  = m => { pass++; console.log("  PASS  " + m); };
const bad = m => { fail++; console.log("* FAIL  " + m); };

/* Every route into the money screen. id, the screen it lives on, and how to get
   to that screen from the title. */
const DOORS = [
  ["b-support", "the title screen",     null],
  ["mus-sup",   "the soundtrack screen", /^music$/i],
  ["bin-sup",   "the Prize Bin",         /prize bin/i],
];

const browser = await p.launch({ headless: "new", args: ["--no-sandbox"] });

async function visible(pg, id) {
  return pg.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return { there: false };
    const r = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    return { there: true, w: Math.round(r.width), h: Math.round(r.height),
             display: c.display, opacity: +c.opacity,
             shown: c.display !== "none" && c.visibility !== "hidden" && +c.opacity > 0.05 && r.width > 4 && r.height > 4 };
  }, id);
}
async function tapLabel(pg, rx) {
  const hit = await pg.evaluate((src) => {
    const re = new RegExp(src, "i");
    const el = [...document.querySelectorAll("button,.btn,[onclick]")].find(e => {
      const r = e.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && getComputedStyle(e).display !== "none" &&
        (re.test((e.textContent || "").trim()) || re.test(e.id));
    });
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, rx.source);
  if (!hit) return false;
  await pg.mouse.click(hit.x, hit.y); await sleep(1400); return true;
}

async function openDoors(url, label) {
  const pg = await browser.newPage();
  await pg.setViewport({ width: 390, height: 844 });
  const external = [];
  pg.on("request", r => { const u = r.url();
    if (/^https?:\/\//.test(u) && !u.startsWith(BASE)) external.push(u.split("?")[0]); });
  const errs = [];
  pg.on("pageerror", e => errs.push(String(e).split("\n")[0].slice(0, 110)));
  await pg.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(3800);

  /* ⛔ one click does not dismiss the splash; it holds for a minimum time */
  for (let i = 0; i < 10; i++) {
    const on = await pg.evaluate(() => { const e = document.getElementById("s-splash");
      return !!(e && e.classList.contains("on")); });
    if (!on) break;
    await pg.mouse.click(195, 422); await sleep(700);
  }
  await sleep(700);
  await tapLabel(pg, /^later$/);           /* any daily claim popup */

  /* ⛔ REPORT WHETHER THE ROUTE WAS ACTUALLY WALKED. "not shown" on a screen we
     never opened is a VACUOUS PASS, not evidence, and it looks identical to a
     real one. Each door comes back reached:true/false and the caller refuses to
     count an unreached door as shut. */
  const open = [], unreached = [];
  for (const [id, where, route] of DOORS) {
    let reached = true;
    if (route) {
      /* ⛔ NOT the arcade exit. The title screen's own back-ish control is
         "◄ Sky Wolf Studios Arcade", which LEAVES THE GAME, so matching on it
         navigated away to the portal and every later route failed. On the web
         build that cost two of three doors and made the Steam run look like the
         more thorough one. Go home by screen id, never by a label. */
      await pg.evaluate(() => {
        document.querySelectorAll(".screen.on").forEach(s2 => { if (s2.id !== "s-title") s2.classList.remove("on"); });
        const t = document.getElementById("s-title"); if (t) t.classList.add("on");
      });
      await sleep(700);
      reached = await tapLabel(pg, route);
      if (reached) {
        /* did the screen the door lives on actually come up? */
        reached = await pg.evaluate((id) => {
          const el = document.getElementById(id); const scr = el && el.closest(".screen");
          return !!(scr && scr.classList.contains("on"));
        }, id);
      }
    }
    if (!reached) { unreached.push(`${id} (${where})`); continue; }
    const v = await visible(pg, id);
    if (v.shown) open.push(`${id} ${v.w}x${v.h} on ${where}`);
  }
  const payHosts = [...new Set(external.filter(u => /stripe|checkout|nowpayments|paypal/i.test(u)))];
  await pg.close();
  return { open, unreached, external: [...new Set(external)], payHosts, errs };
}

console.log("\n=== THE WEB BUILD: the positive control. At least one door MUST be open ===");
const web = await openDoors(BASE + "/satellites/stream-hop/index.html", "web");
/* ⛔ Keep the else attached to its own if. Inserting the unreached line between
   them orphaned it onto the wrong condition, and the run then printed BOTH
   "3 open doors" and "no open doors" in the same breath. */
if (web.open.length) {
  ok(`${web.open.length} open door(s), so this checker can see them`);
  web.open.forEach(d => console.log("          " + d));
} else {
  bad("no open door on the WEB build either — this checker is blind and proves nothing");
}
if (web.unreached.length) web.unreached.forEach(d => console.log("          unreached on web: " + d));

console.log("\n=== THE VENDORED STEAM BUILD: every door must be shut ===");
const steam = await openDoors(BASE + "/store/jimothy-steam/app/index.html", "steam");
if (steam.open.length) steam.open.forEach(d => bad("a player can still reach payment: " + d));
else ok(`no open door on the ${DOORS.length - steam.unreached.length} route(s) this run actually walked`);
if (steam.unreached.length) steam.unreached.forEach(d =>
  bad("UNVERIFIED, the run never reached it, so it is not evidence: " + d));
if (steam.payHosts.length) steam.payHosts.forEach(u => bad("payment host contacted: " + u));
else ok("no payment host contacted");
if (steam.external.length) steam.external.forEach(u => bad("Steam build reached OFF MACHINE: " + u));
else ok("no external request at all (a Valve review machine may be offline)");
if (steam.errs.length) steam.errs.slice(0, 3).forEach(e => bad("page error: " + e));
else ok("boots with no page errors");

await browser.close();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
