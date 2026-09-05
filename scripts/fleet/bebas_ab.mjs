/* Bebas Neue before/after on the heaviest users, WITHOUT touching the tree: "before" aborts
   the Google Fonts request for Bebas so the fallback renders; "after" lets it load.
   Measures every element whose computed font-family resolves to Bebas: does its text now
   overflow, underflow, or clip its box? Then shoots both for eyes. */
import puppeteer from "puppeteer";
import { createServer } from "http"; import { readFileSync, existsSync, statSync, mkdirSync } from "fs"; import { join, extname } from "path";
const ROOT = "/workspaces/lucid-winds", OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const M = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
const s = createServer((q, r) => { const u = decodeURIComponent(q.url.split("?")[0]); const p = join(ROOT, u.endsWith("/") ? u + "index.html" : u);
  if (!existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); } r.writeHead(200, { "content-type": M[extname(p)] || "application/octet-stream" }); r.end(readFileSync(p)); });
await new Promise(r => s.listen(8893, "127.0.0.1", r));
const GAMES = ["pollen", "petalmatch", "dailybloom", "mosaic", "battleship", "recall", "bowergarden", "gardenlines"];
const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu", "--mute-audio"] });
const report = {};
for (const cond of ["before", "after"]) {
  for (const id of GAMES) {
    const pg = await b.newPage(); await pg.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); localStorage.setItem("sws_dir_" + location.pathname.split("/").pop().replace(".html", ""), "1"); } catch (e) {} });
    await pg.setRequestInterception(true);
    pg.on("request", rq => { if (cond === "before" && /Bebas/i.test(rq.url())) rq.abort(); else rq.continue(); });
    try {
      await pg.goto(`http://127.0.0.1:8893/play/${id}.html`, { waitUntil: "networkidle2", timeout: 40000 });
      await new Promise(r => setTimeout(r, 2500));
      await pg.evaluate(() => { const o = document.getElementById("shell-dir"); if (o) { const btn = [...o.querySelectorAll("button")].pop(); if (btn) btn.click(); } });
      await new Promise(r => setTimeout(r, 900));
      const m = await pg.evaluate(() => {
        const w = t => { const e = document.createElement("span"); e.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:48px " + t; e.textContent = "ENTER"; document.body.appendChild(e); const r = e.getBoundingClientRect().width; e.remove(); return r; };
        const loaded = Math.abs(w("'Bebas Neue',sans-serif") - w("sans-serif")) > 1;
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          if (!/bebas/i.test(cs.fontFamily)) continue;
          if (!el.textContent || !el.textContent.trim() || el.children.length > 0) continue;
          const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
          const rng = document.createRange(); rng.selectNodeContents(el); const t = rng.getBoundingClientRect();
          const over = Math.max(0, t.right - r.right, r.left - t.left);
          const clipped = cs.overflow !== "visible" && t.width > r.width + 0.5;
          if (over > 1.5 || clipped || t.right > innerWidth + 0.5) out.push({ t: el.textContent.trim().slice(0, 18), over: Math.round(over * 10) / 10, clipped, offscreen: t.right > innerWidth + 0.5 });
        }
        return { loaded, n: document.querySelectorAll("body *").length, faults: out.slice(0, 6), sideScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      report[id] = report[id] || {}; report[id][cond] = m;
      await pg.screenshot({ path: `${OUT}/${id}-${cond}.png` });
    } catch (e) { report[id] = report[id] || {}; report[id][cond] = { err: String(e).slice(0, 80) }; }
    await pg.close();
  }
}
console.log("game         | before: loaded faults side | after: loaded faults side");
for (const id of GAMES) { const a = report[id].before || {}, z = report[id].after || {};
  console.log(id.padEnd(12), "|", String(a.loaded).padEnd(6), String((a.faults || []).length).padEnd(6), String(a.sideScroll ?? "?").padEnd(4), "|", String(z.loaded).padEnd(6), String((z.faults || []).length).padEnd(6), String(z.sideScroll ?? "?"));
  for (const f of (z.faults || [])) console.log("      AFTER fault:", JSON.stringify(f));
  for (const f of (a.faults || [])) if (!(z.faults || []).some(g => g.t === f.t)) console.log("      fixed by font:", JSON.stringify(f));
}
await b.close(); s.close();
