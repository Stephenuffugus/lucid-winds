/* Harder run at the PLAY state, then photograph the fab footprint with the
   chip hidden. Reports whether play was actually reached, because "nothing
   under the chip on a menu" is not evidence about the game.
   node scripts/fab_play_probe.mjs <outdir> <slug> [slug...]                   */
import puppeteer from "puppeteer"; import fs from "fs";
const [outdir, ...slugs] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const PORT = process.env.PORT || 8777, W = 412, H = 915, PAD = 46;
const ENTRY = /^(play|start|begin|new game|new|tap to start|let'?s play|start game|go|quick play|continue|classic|normal|easy|medium|level 1|1|endless|solo|practice|resume)\b/i;
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const out = [];
for (const slug of slugs) {
  const p = await br.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  const rec = { slug, taps: [] };
  try {
    await p.goto(`http://127.0.0.1:${PORT}/satellites/${slug}/?probe=` + Math.random(), { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 4000));
    for (let i = 0; i < 5; i++) {
      const hit = await p.evaluate((rx) => {
        const re = new RegExp(rx.slice(1, rx.lastIndexOf("/")), "i");
        for (const el of document.querySelectorAll("button,.btn,[role=button],a,li,.opt,.card")) {
          const t = (el.textContent || "").trim(); if (t.length > 24 || !re.test(t)) continue;
          const b = el.getBoundingClientRect(); if (b.width < 12 || b.height < 12) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
          if (/lwfb/.test(el.className || "")) continue;
          return { x: b.x + b.width / 2, y: b.y + b.height / 2, t: t.slice(0, 20) };
        } return null; }, ENTRY.toString());
      if (!hit) break;
      await p.touchscreen.tap(hit.x, hit.y); rec.taps.push(hit.t);
      await new Promise(r => setTimeout(r, 2000));
    }
    /* many canvas games start on a tap anywhere */
    const c = await p.evaluate(() => { const k = document.querySelector("canvas"); if (!k) return null; const b = k.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height * 0.45 }; });
    if (c) { await p.touchscreen.tap(c.x, c.y); rec.taps.push("canvas"); await new Promise(r => setTimeout(r, 2500)); }
    /* "in play" heuristic: a canvas is painting AND no full-screen DOM sheet covers it */
    rec.state = await p.evaluate(() => {
      const k = document.querySelector("canvas");
      let sheet = null;
      for (const el of document.querySelectorAll("div,section")) {
        const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (b.width > innerWidth * 0.8 && b.height > innerHeight * 0.6 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.5 && (el.textContent || "").trim().length > 30) { sheet = (el.id || el.className || "div").toString().slice(0, 28); break; }
      }
      return { hasCanvas: !!k, coveringSheet: sheet };
    });
    const r = await p.evaluate(() => {
      const f = document.querySelector(".lwfb-fab"); if (!f) return null;
      const b = f.getBoundingClientRect();
      document.querySelectorAll(".lwfb-fab,.lwfb-fab-x").forEach(e => e.style.setProperty("display", "none", "important"));
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    });
    if (r) {
      rec.fab = { x: Math.round(r.x), y: Math.round(r.y) };
      await new Promise(res => setTimeout(res, 350));
      await p.screenshot({ path: `${outdir}/${slug}.png`, clip: { x: Math.max(0, r.x - PAD), y: Math.max(0, r.y - PAD), width: Math.min(W, r.w + PAD * 2), height: Math.min(H, r.h + PAD * 2) } });
    } else rec.err = "no fab";
  } catch (e) { rec.err = String(e).slice(0, 90); }
  console.log(`${slug.padEnd(22)} taps=[${rec.taps.join("|")}] canvas=${rec.state?.hasCanvas} sheet=${rec.state?.coveringSheet || "none"} fab=${JSON.stringify(rec.fab)}${rec.err ? " ERR " + rec.err : ""}`);
  out.push(rec); await p.close();
}
fs.writeFileSync(`${outdir}/_play.json`, JSON.stringify(out, null, 1));
await br.close();
