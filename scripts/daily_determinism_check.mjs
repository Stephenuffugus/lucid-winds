#!/usr/bin/env node
/* IS THE DAILY REALLY THE SAME BOARD FOR EVERYONE?
   node scripts/daily_determinism_check.mjs [baseurl]     (server on the REPO ROOT)

   Nectar Drop's own copy promises "one seeded board, same for everyone, once a
   day", and it is the claim every daily-puzzle directory cares about. Listdle
   lists games on exactly that basis.

   The board generator WAS seeded. What was not was pegSwap(), the Thistle
   Hedgehog ability, which picked three blooms to upgrade with unseeded
   Math.random(). Two players taking identical shots on the identical Daily board
   therefore ended up with different power blooms, and power blooms are worth
   nectar. Invisible unless you compare two players, which nothing did.

   So this compares two players: two isolated browser contexts, the same
   companion equipped, the same fixed shot sequence, and every observable after
   every shot. Identical or it fails.

   ⛔ IT CARRIES ITS OWN POSITIVE CONTROL. A comparison that always returns
   "equal" passes this trivially and proves nothing, so it also runs a NON daily
   level through the same machinery and requires that one to DIFFER from the
   daily. If both come back equal, the comparison is broken, not the game. */
import p from "puppeteer";
const BASE = process.argv[2] || "http://127.0.0.1:8777";
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const t = (n, ok, extra) => ok ? (pass++, console.log("  ok   " + n))
                              : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + String(extra).slice(0, 150) : "")));

/* A fixed sequence. Nothing here may depend on time, order or chance. */
const SHOTS = [-0.9, -0.45, -0.1, 0.2, 0.55, 0.95, -0.7, 0.35];

const browser = await p.launch({ headless: "new", args: ["--no-sandbox"] });

async function play(daily) {
  const ctx = await browser.createBrowserContext();
  const pg = await ctx.newPage();
  await pg.setViewport({ width: 390, height: 844 });
  await pg.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
  await pg.goto(BASE + "/satellites/nectar-drop/?ndtest=1", { waitUntil: "domcontentloaded" });
  await pg.waitForFunction("window.ND_DEV && typeof ND_DEV.start === 'function'", { timeout: 30000 });

  const out = await pg.evaluate((SHOTS, daily) => {
    /* the ability that fires pegSwap: this is the code path under test */
    ND_DEV.equip("thistle_hedgehog");
    const lvl = daily ? ND_DEV.dailyLevel() : ND_DEV.levels[0];
    ND_DEV.start(lvl);
    const trace = [{ step: "start", pegs: ND_DEV.pegCounts() }];
    for (const a of SHOTS) {
      const st = ND_DEV.state();
      if (!st || st.phase === "over" || st.ballsLeft <= 0) break;
      const r = ND_DEV.fireAt(a);
      /* fire the ability deterministically too, so pegSwap is definitely exercised */
      ND_DEV.firePowerHere();
      trace.push({ a: a, score: r.score, reds: r.redsLeft, balls: r.ballsLeft,
                   minX: r.minX, maxX: r.maxX, pegs: ND_DEV.pegCounts() });
    }
    return { equipped: ND_DEV.character(), trace: trace };
  }, SHOTS, daily);

  await pg.close(); await ctx.close();
  return out;
}

console.log("\nNECTAR DROP — the Daily, played twice by two separate 'players'");
const a = await play(true);
const b = await play(true);
t("the pegSwap companion is actually equipped", a.equipped === "thistle_hedgehog", a.equipped);
t("both runs got the same number of shots in", a.trace.length === b.trace.length, `${a.trace.length} vs ${b.trace.length}`);
const A = JSON.stringify(a.trace), B = JSON.stringify(b.trace);
if (A === B) t(`identical across ${a.trace.length - 1} shots: score, reds, balls, ball path and every bloom colour`, true);
else {
  const i = a.trace.findIndex((s, n) => JSON.stringify(s) !== JSON.stringify(b.trace[n]));
  t("the Daily is the same board for everyone", false,
    `diverged at step ${i}: ${JSON.stringify(a.trace[i])} vs ${JSON.stringify(b.trace[i])}`);
}

console.log("\nthe positive control: a NON daily level must not match the Daily");
const c = await play(false);
t("the comparison can actually see a difference", JSON.stringify(c.trace) !== A,
  "a non-daily level produced an identical trace, so this checker compares nothing");

await browser.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
