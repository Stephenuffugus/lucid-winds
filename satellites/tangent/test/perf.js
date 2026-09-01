// TANGENT frame budget probe. Rendering is the thing most likely to quietly
// get expensive, and the spin phase is the worst case: predictor, ferrofluid
// outlines, chevrons and the deck all in one frame.
//
//   node test/perf.js            4x CPU throttle (a mid phone, roughly)
//   node test/perf.js --rate 1   no throttle
//   node test/perf.js --budget 33
//
// Reports median and 95th percentile frame time.
//
// ⚠️ This machine has two cores. With anything else running (another agent
// driving a browser, a sweep) the throttled numbers swing by a factor of two
// and A/B comparisons come out backwards: features switched OFF measured
// SLOWER than the same build with them on. So this probe REPORTS by default
// and only fails with --strict, and a number from it is only worth quoting
// when nothing else is running. Unthrottled numbers are far more stable.
const puppeteer = require("/workspaces/lucid-winds/node_modules/puppeteer");
const path = require("path");

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i > 0 ? Number(process.argv[i + 1]) : d; };
const RATE = arg("rate", 4), BUDGET = arg("budget", 33), FRAMES = arg("frames", 140);
const URL = "file://" + (process.env.TANGENT_HTML || path.join(__dirname, "..", "index.html"));

(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const cdp = await page.target().createCDPSession();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });
  await page.goto(URL);
  await new Promise(r => setTimeout(r, 800));

  const phases = {};
  for(const [name, setup] of [
    ["spin",   () => { loadLevel(4); startSpin(); holding = true; }],          // most bodies + gates
    ["flight", () => { loadLevel(4); startSpin(); holding = true; setTimeout(() => doRelease("perf"), 400); }],
  ]){
    await page.evaluate(setup);
    await new Promise(r => setTimeout(r, 700));
    const times = await page.evaluate(n => new Promise(res => {
      const t = []; let last = performance.now();
      const tick = () => {
        const now = performance.now(); t.push(now - last); last = now;
        if(t.length < n) requestAnimationFrame(tick); else res(t);
      };
      requestAnimationFrame(tick);
    }), FRAMES);
    const s = times.slice(5).sort((a, b) => a - b);           // drop warm-up
    phases[name] = { p50: s[Math.floor(s.length * 0.5)], p95: s[Math.floor(s.length * 0.95)] };
  }
  await browser.close();

  const strict = process.argv.includes("--strict");
  let over = 0;
  console.log(`frame budget at ${RATE}x CPU throttle, budget ${BUDGET}ms${strict ? " (strict)" : " (reporting only)"}:`);
  for(const k in phases){
    const p = phases[k];
    const bad = p.p50 > BUDGET;
    if(bad) over++;
    console.log(`  ${bad ? (strict ? "FAIL" : "over") : "ok  "} ${k.padEnd(7)} p50 ${p.p50.toFixed(1)}ms  p95 ${p.p95.toFixed(1)}ms  (${(1000 / p.p50).toFixed(0)} fps)`);
  }
  process.exit(strict && over ? 1 : 0);
})();
