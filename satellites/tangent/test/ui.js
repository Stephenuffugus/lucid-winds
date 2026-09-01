// TANGENT UI probe — the checks that only a real layout engine can answer.
// smoke.js runs the simulation headless with a stubbed DOM, so it can say
// nothing about rendered sizes or clipped text. This drives a real browser.
//
//   node test/ui.js            checks 375x667 and 320x568
//   node test/ui.js --size 60  raise the touch floor, to watch the gate fail
//
// House laws enforced here:
//   - interactive controls are at least 48 CSS px as RENDERED, at 375 width
//   - no dash characters in player-facing copy
//   - nothing the player must read is clipped by its own box
const puppeteer = require("/workspaces/lucid-winds/node_modules/puppeteer");
const path = require("path");

const argSize = process.argv.indexOf("--size");
const MIN = argSize > 0 ? Number(process.argv[argSize + 1]) : 48;
// TANGENT_HTML points the probe at a mutated scratch copy, so these checks can
// be proven able to fail without ever writing to the real game file.
const URL = "file://" + (process.env.TANGENT_HTML || path.join(__dirname, "..", "index.html"));
const VIEWPORTS = [{ w: 375, h: 667 }, { w: 320, h: 568 }];

let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + extra : "")));

(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  for(const vp of VIEWPORTS){
    console.log(`\n[${vp.w}x${vp.h}]`);
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    page.on("console", m => { if(m.type() === "error") errors.push(m.text()); });
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: true, hasTouch: true });
    await page.goto(URL);
    await new Promise(r => setTimeout(r, 700));

    // build phase, then spin phase, so both control strips get measured
    for(const phase of ["build", "spin"]){
      if(phase === "spin") { await page.evaluate(() => startSpin()); await new Promise(r => setTimeout(r, 400)); }
      const found = await page.evaluate(() => {
        const vis = el => { const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
        const ctrls = [...document.querySelectorAll("button, .tool")].filter(vis).map(el => {
          const r = el.getBoundingClientRect();
          return { name: (el.id || el.className.split(" ")[0]) + " " + (el.textContent || "").trim().slice(0, 16).replace(/\s+/g, " "),
                   w: +r.width.toFixed(1), h: +r.height.toFixed(1),
                   right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1) };
        });
        const clipped = [...document.querySelectorAll(".tool b, .tool span, .chip")]
          .filter(e => vis(e) && e.scrollWidth > e.clientWidth + 0.5)
          .map(e => e.textContent.trim());
        // every string the player can actually read right now
        const copy = [...document.querySelectorAll("#top, #bottom, .card")]
          .filter(vis).map(e => e.innerText).join("\n");
        return { ctrls, clipped, copy, vw: window.innerWidth };
      });

      for(const c of found.ctrls)
        ok(`${phase}: target ${c.w}x${c.h} ${c.name}`,
           c.w >= MIN && c.h >= MIN, `needs ${MIN}px`);
      ok(`${phase}: nothing overflows its own box`,
         found.clipped.length === 0, found.clipped.join(" | "));
      ok(`${phase}: no control runs off the right edge`,
         found.ctrls.every(c => c.right <= found.vw + 0.5),
         found.ctrls.filter(c => c.right > found.vw + 0.5).map(c => c.name).join(" | "));
      // A dash BETWEEN words is punctuation and banned; inside-a-word hyphens
      // (ui-sans-serif) never reach the player, so only spaced forms count.
      const dashes = (found.copy.match(/—|–|\s-\s/g) || []);
      ok(`${phase}: no dashes in player copy`, dashes.length === 0,
         dashes.length ? JSON.stringify(found.copy.slice(0, 200)) : "");
    }
    ok("no page errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // Controls must be reachable, not merely present. A control can be the right
  // size and still be covered by an overlay, so ask the document what is
  // actually on top at the control's own centre. Never el.click().
  {
    console.log("\n[reachability at 375x667]");
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(URL);
    await new Promise(r => setTimeout(r, 700));
    const topAt = id => page.evaluate(i => {
      const el = document.getElementById(i);
      if(!el) return "missing";
      const r = el.getBoundingClientRect();
      if(r.width < 1 || r.height < 1) return "zero size";
      const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if(!t) return "nothing";
      return (t === el || el.contains(t) || t.contains(el)) ? "ok"
           : "covered by " + (t.id || t.className || t.tagName);
    }, id);
    for(const id of ["spinbtn", "clearbtn"]){
      const r = await topAt(id); ok(`build control ${id} is on top at its centre`, r === "ok", r);
    }
    await page.evaluate(() => startSpin());
    await new Promise(r => setTimeout(r, 300));
    for(const id of ["throttle", "release"]){
      const r = await topAt(id); ok(`spin control ${id} is on top at its centre`, r === "ok", r);
    }
    await page.evaluate(() => doRelease("probe"));
    await new Promise(r => setTimeout(r, 300));
    {
      const r = await topAt("abortbtn");
      ok("flight control abortbtn is on top at its centre", r === "ok", r);
    }

    // Two separate things, and only one of them is ours.
    // 1. Does hiding the tab set the flag? That is the listener, and a real tab
    //    switch is the only honest way to ask.
    await page.evaluate(() => { loadLevel(0); startSpin(); holding = true; });
    await new Promise(r => setTimeout(r, 300));
    const other = await browser.newPage();
    await other.bringToFront();
    await new Promise(r => setTimeout(r, 500));
    const flag = await page.evaluate(() => paused);
    ok("hiding the tab sets the paused flag", flag === true, "paused=" + flag);
    await other.close();
    await page.bringToFront();
    await new Promise(r => setTimeout(r, 300));
    ok("showing the tab clears the paused flag",
       (await page.evaluate(() => paused)) === false);

    // 2. Does the flag actually stop the simulation? Measuring this by hiding
    //    the tab proves nothing, because a hidden tab stops getting animation
    //    frames anyway: the check passed even against a build with the guard
    //    removed. So drive the loop by hand with the tab visible, which tests
    //    our guard rather than the browser's frame policy.
    const g = await page.evaluate(() => {
      loadLevel(0); startSpin(); holding = true;
      const base = performance.now();
      paused = false; last = 0;
      for(let i = 0; i < 30; i++) frame(base + i * 16);
      const ran = runT;
      paused = true;
      for(let i = 0; i < 30; i++) frame(base + 500 + i * 16);
      const held = runT;
      paused = false; last = 0;
      for(let i = 0; i < 30; i++) frame(base + 1500 + i * 16);
      return { ran: ran, held: held, resumed: runT };
    });
    ok("the loop advances the run clock when not paused", g.ran > 0.1, `ran=${g.ran.toFixed(3)}`);
    ok("the paused guard freezes the simulation", g.held === g.ran,
       `ran=${g.ran.toFixed(3)} held=${g.held.toFixed(3)}`);
    ok("clearing the guard resumes the simulation", g.resumed > g.held + 0.1,
       `held=${g.held.toFixed(3)} resumed=${g.resumed.toFixed(3)}`);
    await page.close();
  }
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed  (touch floor ${MIN}px)`);
  process.exit(fail ? 1 : 0);
})();
