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
const URL = "file://" + path.join(__dirname, "..", "index.html");
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
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed  (touch floor ${MIN}px)`);
  process.exit(fail ? 1 : 0);
})();
