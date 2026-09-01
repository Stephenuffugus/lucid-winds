// CONDUIT screenshot tool.
//
// HANDOFF-CONDUIT rule 11: a visual change is not done until it has been looked
// at, from where the player stands, at the sizes a player holds. This shoots the
// running game at four viewports and writes them to docs/shots/.
//
//   node test/shots.js <tag>              the four standard viewports
//   node test/shots.js <tag> --scene flow enter Flow before shooting
//   node test/shots.js <tag> --only 844x390
//
// Every shot drives the game through real pointer events on the canvas. Nothing
// here reaches into game state to pose a screenshot: what is in the frame is
// what a player would have on screen after doing the same things.
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join("/workspaces/lucid-winds", "node_modules", "puppeteer"));

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "shots");
const URL = "file://" + path.join(ROOT, "index.html");

const VIEWPORTS = [
  { w: 320,  h: 568, mobile: true,  note: "smallest phone still in the wild" },
  { w: 375,  h: 667, mobile: true,  note: "the touch target reference size" },
  { w: 844,  h: 390, mobile: true,  note: "phone landscape, the primary pose" },
  { w: 1280, h: 800, mobile: false, note: "desktop" },
];

const tag = process.argv[2] || "shot";
const argv = process.argv.slice(3);
const arg = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const scene = arg("--scene", "play");
const only = arg("--only", null);

// A touch drag on the canvas: this is how the player moves.
async function drag(page, from, to, ms) {
  await page.touchscreen.touchStart(from[0], from[1]);
  const steps = Math.max(2, Math.round(ms / 32));
  for (let i = 1; i <= steps; i++) {
    const k = i / steps;
    await page.touchscreen.touchMove(from[0] + (to[0] - from[0]) * k,
                                     from[1] + (to[1] - from[1]) * k);
    await new Promise(r => setTimeout(r, 32));
  }
}
async function release(page) { await page.touchscreen.touchEnd(); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"],
  });
  const written = [];
  for (const vp of VIEWPORTS) {
    const name = `${vp.w}x${vp.h}`;
    if (only && only !== name) continue;
    const page = await browser.newPage();
    const errs = [];
    page.on("pageerror", e => errs.push(String(e)));
    page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1,
                             isMobile: vp.mobile, hasTouch: true });
    await page.goto(URL, { waitUntil: "load" });

    // the title screen, before anything is dismissed
    await new Promise(r => setTimeout(r, 250));
    await page.screenshot({ path: path.join(OUT, `${tag}-title-${name}.png`) });
    written.push(`${tag}-title-${name}.png`);

    // enter through the real button, at its real centre
    const go = await page.evaluate(() => {
      const b = document.getElementById("go"); if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (!go) throw new Error("no start button found");
    await page.mouse.click(go.x, go.y);
    await new Promise(r => setTimeout(r, 400));

    // walk out of the entry room so the frame has some site in it
    await drag(page, [vp.w * 0.22, vp.h * 0.55], [vp.w * 0.34, vp.h * 0.30], 1400);
    await release(page);
    await new Promise(r => setTimeout(r, 250));

    if (scene === "flow") {
      const fb = await page.evaluate(() => {
        const b = ((globalThis.CONDUIT && globalThis.CONDUIT.btns) || [])
          .find(b => b.id === "flow");
        return b ? { x: b.x + b.w / 2, y: b.y + b.h / 2 } : null;
      });
      if (fb) { await page.touchscreen.tap(fb.x, fb.y); await new Promise(r => setTimeout(r, 900)); }
    }

    await page.screenshot({ path: path.join(OUT, `${tag}-${scene}-${name}.png`) });
    written.push(`${tag}-${scene}-${name}.png`);
    if (errs.length) console.log(`  ! ${name} console errors: ${errs.slice(0, 3).join(" | ")}`);
    console.log(`  ${name.padEnd(9)} ${vp.note}`);
    await page.close();
  }
  await browser.close();
  console.log("\nwrote:\n  " + written.join("\n  ") + "\n");
})().catch(e => { console.error(e); process.exit(1); });
