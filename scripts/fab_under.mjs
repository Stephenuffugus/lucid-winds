/* What is UNDERNEATH the feedback fab? The DOM hit-test cannot see a control
   painted on a canvas (see FAB YIELD in feedback.js), so this hides the chip
   and photographs its exact footprint plus a 40px margin. A painted button in
   that frame is a real collision; empty background is not.
   node scripts/fab_under.mjs <outdir> <slug> [slug...]                        */
import puppeteer from "puppeteer";
import fs from "fs";
const [outdir, ...slugs] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const PORT = process.env.PORT || 8777, W = 412, H = 915, PAD = 40;
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const out = [];
for (const slug of slugs) {
  const p = await br.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  const rec = { slug };
  try {
    await p.goto(`http://127.0.0.1:${PORT}/satellites/${slug}/?probe=` + Math.random(), { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 4000));
    for (let i = 0; i < 2; i++) {
      const hit = await p.evaluate(() => {
        const re = /^(play|start|begin|new game|tap to start|let'?s play|start game|go|quick play|continue|classic|normal)\b/i;
        for (const el of document.querySelectorAll("button,.btn,[role=button],a")) {
          const t = (el.textContent || "").trim(); if (t.length > 30 || !re.test(t)) continue;
          const b = el.getBoundingClientRect(); if (b.width < 8 || b.height < 8) continue;
          const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
          return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
        } return null; });
      if (!hit) break;
      await p.touchscreen.tap(hit.x, hit.y); await new Promise(r => setTimeout(r, 2500));
    }
    const r = await p.evaluate(() => {
      const f = document.querySelector(".lwfb-fab"); if (!f) return null;
      const b = f.getBoundingClientRect();
      document.querySelectorAll(".lwfb-fab,.lwfb-fab-x").forEach(e => e.style.setProperty("display", "none", "important"));
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    });
    if (!r) { rec.err = "no fab"; }
    else {
      await new Promise(res => setTimeout(res, 400));
      const clip = { x: Math.max(0, r.x - PAD), y: Math.max(0, r.y - PAD), width: Math.min(W, r.w + PAD * 2), height: Math.min(H, r.h + PAD * 2) };
      await p.screenshot({ path: `${outdir}/${slug}.png`, clip });
      rec.rect = { x: Math.round(r.x), y: Math.round(r.y) };
    }
  } catch (e) { rec.err = String(e).slice(0, 90); }
  out.push(rec); await p.close();
}
fs.writeFileSync(`${outdir}/_under.json`, JSON.stringify(out, null, 1));
console.log("done", out.filter(o => o.err).map(o => o.slug + ":" + o.err).join(" | ") || "no errors");
await br.close();
