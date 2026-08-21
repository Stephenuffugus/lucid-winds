/* Feedback-fab collision sweep.
   The fab is fixed bottom-right (x = W-90..W-12, y = H-174..H-96) and, per the
   FAB YIELD notes in feedback.js, it CANNOT see controls painted on a canvas.
   So DOM controls are already handled; this hunts the canvas case.
   For each game: reach the play state, hit-test the fab footprint, and crop the
   fab's neighbourhood so a human can look at it.
   node scripts/fab_sweep.mjs <outdir> <slug> [slug...]                        */
import puppeteer from "puppeteer";
import fs from "fs";
const [outdir, ...slugs] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const PORT = process.env.PORT || 8777;
const W = 412, H = 915;
const CROP = { w: 180, h: 260 };                       // fab neighbourhood, css px
const PLAY_RX = /^(play|start|begin|new game|tap to start|let'?s play|start game|go|quick play|continue)\b/i;

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const results = [];
for (const slug of slugs) {
  const p = await br.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  const rec = { slug, taps: [], err: null };
  try {
    await p.goto(`http://127.0.0.1:${PORT}/satellites/${slug}/?probe=` + Math.random(), { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 4000));
    /* reach play: up to two play-ish DOM taps, else one canvas-centre tap */
    for (let i = 0; i < 2; i++) {
      const hit = await p.evaluate((rx) => {
        const re = new RegExp(rx.slice(1, rx.lastIndexOf("/")), "i");
        const cands = [...document.querySelectorAll("button,.btn,[role=button],a")];
        for (const el of cands) {
          const t = (el.textContent || "").trim();
          if (!re.test(t)) continue;
          const b = el.getBoundingClientRect();
          if (b.width < 8 || b.height < 8) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
          return { x: b.x + b.width / 2, y: b.y + b.height / 2, t: t.slice(0, 24) };
        }
        return null;
      }, PLAY_RX.toString());
      if (!hit) break;
      await p.touchscreen.tap(hit.x, hit.y);
      rec.taps.push(hit.t);
      await new Promise(r => setTimeout(r, 2500));
    }
    if (!rec.taps.length) {                                  /* canvas tap-to-start */
      const c = await p.evaluate(() => { const k = document.querySelector("canvas"); if (!k) return null; const b = k.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
      if (c) { await p.touchscreen.tap(c.x, c.y); rec.taps.push("canvas-centre"); await new Promise(r => setTimeout(r, 2500)); }
    }
    Object.assign(rec, await p.evaluate(() => {
      const fab = document.querySelector(".lwfb-fab");
      const out = { fab: !!fab, canvasCount: document.querySelectorAll("canvas").length };
      if (!fab) return out;
      const b = fab.getBoundingClientRect();
      const cs = getComputedStyle(fab);
      out.fabRect = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
      out.faded = cs.opacity === "0" || cs.visibility === "hidden" || cs.display === "none";
      out.moved = Math.round(b.x) < 200 || Math.round(b.y) < 400;   /* yielded away from home */
      const ours = e => { for (let n = e; n; n = n.parentElement) { const c = n.className; if (c && String(c).indexOf("lwfb") >= 0) return true; } return false; };
      const pts = [[b.left + 6, b.top + 6], [b.right - 6, b.top + 6], [b.left + 6, b.bottom - 6], [b.right - 6, b.bottom - 6], [b.left + b.width / 2, b.top + b.height / 2]];
      const under = pts.map(([x, y]) => { const e = document.elementsFromPoint(x, y).filter(z => !ours(z))[0]; return e ? e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") : "none"; });
      out.under = [...new Set(under)];
      out.onCanvas = out.under.every(u => u.startsWith("canvas"));
      return out;
    }));
    await p.screenshot({ path: `${outdir}/${slug}.png`, clip: { x: W - CROP.w, y: H - CROP.h, width: CROP.w, height: CROP.h } });
  } catch (e) { rec.err = String(e).slice(0, 120); }
  results.push(rec);
  console.log(`${slug.padEnd(22)} under=${(rec.under || ["?"]).join(",").padEnd(22)} canvas=${rec.canvasCount ?? "?"} taps=[${rec.taps.join("|")}]${rec.faded ? " FADED" : ""}${rec.moved ? " MOVED" : ""}${rec.err ? " ERR:" + rec.err : ""}`);
  await p.close();
}
fs.writeFileSync(`${outdir}/_results.json`, JSON.stringify(results, null, 1));
await br.close();
