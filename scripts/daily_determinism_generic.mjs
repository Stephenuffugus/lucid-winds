#!/usr/bin/env node
/* IS THIS GAME'S DAILY REALLY THE SAME PUZZLE FOR EVERYONE?
   node scripts/daily_determinism_generic.mjs <slug> [slug...] [--base URL]

   Written for the Listdle submissions. Any game whose copy says "the same board
   for everyone today" has to actually be that, and Nectar Drop is the reason
   this is not taken on trust: its board generator WAS seeded, and pegSwap() on
   top of it was not, so two players on the identical daily board ended up with
   different power blooms. Invisible unless you compare two players, which
   nothing did.

   The nine Listdle candidates have nine unrelated dev surfaces (LL_DEV, SS_DEV,
   PVX_DEV... different methods in each), so this drives them the way a player
   does — taps and keys at fixed positions — and compares what the SCREEN shows.
   That works on all of them and it measures the thing a reviewer would see.

   ⛔⛔ A COMPARISON THAT ALWAYS RETURNS "EQUAL" PASSES THE MAIN CLAIM TRIVIALLY
   AND PROVES NOTHING. So there are three runs, and two of them MUST come back
   different or the result is thrown out:

     A  today,    input sequence 1
     B  today,    input sequence 1   -> MUST EQUAL A     (the claim)
     C  tomorrow, input sequence 1   -> MUST DIFFER      (the daily is date seeded)
     D  today,    input sequence 2   -> MUST DIFFER      (the inputs reach the game
                                                          and the snapshot notices)

   If C matches A the daily is not keyed to the date. If D matches A the harness
   is blind to gameplay and the A==B result is worth nothing, so it is reported
   as INCONCLUSIVE rather than a pass. */
import p from "puppeteer";
import { createHash } from "crypto";
import { writeFileSync } from "fs";

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const BASE = baseIdx >= 0 ? args[baseIdx + 1] : "http://127.0.0.1:8777";
/* with no --base, baseIdx is -1 and baseIdx+1 is 0, which silently ate the
   first slug on the argv line. Only skip the value slot when the flag is there. */
const SLUGS = args.filter((a, i) => !a.startsWith("--") && !(baseIdx >= 0 && i === baseIdx + 1));
if (!SLUGS.length) { console.error("usage: daily_determinism_generic.mjs <slug> [slug...] [--base URL]"); process.exit(2); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const md5 = s => createHash("md5").update(s).digest("hex").slice(0, 12);
/* a fixed wall clock day, so "today" is the same day in every context and the
   tomorrow run is exactly one day later. Time still FLOWS from there, because
   games that compute a frame delta from Date.now() stall if it is frozen. */
const DAY0 = Date.UTC(2026, 7, 21, 15, 0, 0);

/* two input sequences. Fractions of the viewport, so they land on the board
   whatever its size. Keys cover the games driven by arrows or letters. */
const SEQ1 = [["t",.50,.55],["t",.35,.45],["k","ArrowRight"],["t",.65,.45],["k","ArrowDown"],
              ["t",.50,.35],["t",.30,.62],["k","Enter"],["t",.70,.62],["t",.50,.50]];
const SEQ2 = [["t",.22,.30],["k","ArrowLeft"],["t",.78,.70],["t",.44,.66],["k","ArrowUp"],
              ["t",.60,.28],["t",.20,.55],["k","Enter"],["t",.80,.40],["t",.36,.38]];

const browser = await p.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"] });

async function snapshot(pg) {
  return await pg.evaluate(() => {
    const out = { canv: [], text: "" };
    for (const c of document.querySelectorAll("canvas")) {
      try { out.canv.push(c.width + "x" + c.height + ":" + c.toDataURL("image/png").length + ":" + c.toDataURL("image/png").slice(-2000)); }
      catch (e) { out.canv.push("ERR"); }
    }
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const parts = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.children.length || !vis(el)) continue;
      const t = (el.textContent || "").trim();
      if (t) parts.push(t);
    }
    out.text = parts.join("|");
    return out;
  });
}
/* countdowns to the next daily legitimately tick between two runs taken seconds
   apart; nothing else time shaped should be in a puzzle board */
const norm = s => String(s).replace(/\d{1,2}:\d{2}(:\d{2})?/g, "#T#").replace(/\d+\s*[hms]\b/gi, "#D#");
const digest = (snap, textOnly) => textOnly ? ("text/" + md5(norm(snap.text)))
                                            : (md5(snap.canv.join("~")) + "/" + md5(norm(snap.text)));

/* Does this game animate with nothing touching it?
   ⛔ 700ms was not long enough. loop-warden passed the drift check and then
   "failed" the daily comparison, and a text only diff of the same two runs came
   back identical at every step: the divergence was a canvas animation slower
   than the sample window. Sample across ~2.6s instead, and treat ANY movement
   as animation. A slow drift is still fatal to comparing two contexts that
   started seconds apart. */
async function idleDrift(slug) {
  const { pg, ctx } = await open(slug, 0);
  const shots = [await snapshot(pg)];
  for (const gap of [500, 800, 1300]) { await sleep(gap); shots.push(await snapshot(pg)); }
  await ctx.close();
  const moved = k => shots.some(s => (k === "canv" ? s.canv.join("~") : norm(s.text))
                                  !== (k === "canv" ? shots[0].canv.join("~") : norm(shots[0].text)));
  return { canvas: moved("canv"), text: moved("text") };
}

async function open(slug, dayOffset) {
  const ctx = await browser.createBrowserContext();
  const pg = await ctx.newPage();
  await pg.setViewport({ width: 390, height: 844 });
  await pg.evaluateOnNewDocument(shift => {
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
    /* shift the clock onto a fixed day, but let it keep running from there */
    const RealDate = Date, t0 = RealDate.now(), off = shift - t0;
    const D = function (...a) { return a.length ? new RealDate(...a) : new RealDate(RealDate.now() + off); };
    D.now = () => RealDate.now() + off;
    D.parse = RealDate.parse; D.UTC = RealDate.UTC; D.prototype = RealDate.prototype;
    window.Date = D;
  }, DAY0 + dayOffset * 86400000);

  const errs = [];
  pg.on("pageerror", e => errs.push(String(e).slice(0, 120)));
  await pg.goto(BASE + "/satellites/" + slug + "/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await sleep(2600);
  /* Get into the DAILY, and prove we got there.
     ⛔ The first version clicked a generic start button first and only then
     looked for "daily". On lamplighter the generic pass hit Play, which starts
     the walk campaign, and the daily click then found nothing — so the harness
     compared a fixed campaign level across two days, saw it was the same, and
     reported "the puzzle is not keyed to the date" about a daily it never
     opened. lamplighter's seed is Math.imul(dayCodeUTC(),...): it was fine.
     So: reach for the daily FIRST, only fall back to a start button if there is
     no daily control on screen, and refuse to give a verdict at all unless the
     word shows up on the running screen afterwards. */
  const clickText = async pat => await pg.evaluate(ps => {
    const re = new RegExp(ps, "i");
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const el = Array.from(document.querySelectorAll("button,.btn,[role=button],a,div"))
      .filter(vis).find(e => !e.children.length && re.test((e.textContent || "").trim()));
    if (el) { el.click(); return (el.textContent || "").trim().slice(0, 40); } return null;
  }, pat);
  let entered = await clickText("daily");
  if (!entered) {
    await clickText("^(tap to start|start|play|begin|continue|ok|got it)$");
    await sleep(1200);
    entered = await clickText("daily");
  }
  await sleep(1200);
  await clickText("^(continue|ok|got it|begin|start)$");     // a briefing card, if there is one
  await sleep(1100);
  /* is the word actually on the screen we ended up on? */
  const inDaily = await pg.evaluate(() => /daily/i.test(document.body.innerText || ""));
  await sleep(600);
  return { pg, ctx, errs, entered, inDaily };
}

async function run(slug, dayOffset, seq, textOnly) {
  const { pg, ctx, errs, entered, inDaily } = await open(slug, dayOffset);
  const trace = [digest(await snapshot(pg), textOnly)];
  for (const step of seq) {
    if (step[0] === "t") { const b = await pg.evaluate(() => [innerWidth, innerHeight]);
      await pg.mouse.click(Math.round(b[0] * step[1]), Math.round(b[1] * step[2])); }
    else { await pg.keyboard.press(step[1]); }
    await sleep(430);
    trace.push(digest(await snapshot(pg), textOnly));
  }
  await ctx.close();
  return { trace, errs: [...new Set(errs)], entered, inDaily };
}

const report = [];
for (const slug of SLUGS) {
  process.stdout.write("\n" + slug + "\n");
  let A, B, C, D, drift;
  try {
    drift = await idleDrift(slug);
    if (drift.canvas) console.log("  (this game animates on its own; comparing visible text, not canvas pixels)");
    if (drift.canvas && drift.text) console.log("  (its TEXT drifts too, so even the text comparison is suspect here)");
    const textOnly = drift.canvas;
    A = await run(slug, 0, SEQ1, textOnly);
    B = await run(slug, 0, SEQ1, textOnly);
    C = await run(slug, 1, SEQ1, textOnly);
    D = await run(slug, 0, SEQ2, textOnly);
  } catch (e) {
    console.log("  ERROR " + String(e.message || e).slice(0, 140));
    report.push({ slug, verdict: "ERROR", why: String(e.message || e).slice(0, 200) });
    continue;
  }
  const eq = (x, y) => x.trace.join(",") === y.trace.join(",");
  const firstDiff = (x, y) => x.trace.findIndex((v, i) => v !== y.trace[i]);
  const sameDay = eq(A, B), dateCtl = !eq(A, C), inputCtl = !eq(A, D);
  let verdict, why;
  /* Clicking a control labelled "Daily Loop" IS evidence of entry; loop-warden
     simply never prints the word again once the run starts, and requiring it on
     screen turned a good entry into a refusal. Only a control we never FOUND
     means we cannot claim to have tested a daily. */
  if (!A.entered) { verdict = "DAILY NOT REACHED"; why = "no control matching /daily/i was found on any screen this harness could get to, so nothing below is about this game's daily. It needs a per game entry hook via its own *_DEV surface"; }
  else if (!dateCtl && !inputCtl) { verdict = "BLIND"; why = "neither control moved: the snapshot sees nothing this game does, so A==B means nothing"; }
  else if (!inputCtl) { verdict = "INCONCLUSIVE"; why = "the input control did not diverge: taps and keys are not reaching the board, so only the STARTING position is under test" + (dateCtl ? " (the date control did hold, so the start IS date seeded)" : ""); }
  else if (!dateCtl) { verdict = "FAIL"; why = "tomorrow produced the identical daily: the puzzle is not keyed to the date"; }
  else if (!sameDay) { verdict = "FAIL"; why = "two players on the same day diverged at step " + firstDiff(A, B) + " of " + A.trace.length + ": something in the daily path is unseeded"; }
  else verdict = "PASS";
  console.log("  entered daily via  " + (A.entered ? JSON.stringify(A.entered) : "NOTHING FOUND")
    + (A.entered && !A.inDaily ? "   (entry taken from the control label; the word is not on screen after)" : ""));
  console.log("  A==B same day    " + (sameDay ? "yes" : "NO, diverges at step " + firstDiff(A, B)));
  console.log("  control: tomorrow differs   " + (dateCtl ? "yes" : "NO"));
  console.log("  control: other inputs differ " + (inputCtl ? "yes" : "NO"));
  if (A.errs.length) console.log("  page errors: " + A.errs.join(" ; ").slice(0, 200));
  console.log("  => " + verdict + (why ? "  (" + why + ")" : ""));
  if (drift.canvas && drift.text && verdict === "FAIL")
    { verdict = "INCONCLUSIVE"; why = "the game's own text changes with no input touching it, so a difference between two contexts cannot be attributed to the daily"; }
  report.push({ slug, verdict, why: why || null, steps: A.trace.length,
    sameDay, dateControl: dateCtl, inputControl: inputCtl,
    animates: drift.canvas, textDrifts: drift.text, enteredVia: A.entered, inDaily: A.inDaily, pageErrors: A.errs });
}
await browser.close();
writeFileSync("/tmp/listdle_daily_report.json", JSON.stringify(report, null, 1));
const bad = report.filter(r => r.verdict === "FAIL" || r.verdict === "ERROR");
console.log("\n" + report.filter(r => r.verdict === "PASS").length + "/" + report.length + " PASS"
  + (bad.length ? ";  FAIL/ERROR: " + bad.map(r => r.slug).join(", ") : ""));
process.exit(bad.length ? 1 : 0);
