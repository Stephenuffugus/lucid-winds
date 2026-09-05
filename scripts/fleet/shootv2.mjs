/* Boot + a REAL play frame of every carded game at 375x667.
   Advances through how-to-play / menu overlays until a playfield is reached, and
   records HOW it got there, so a sparse shot is never misread as "this game is empty".
   node shootv2.mjs <outdir> <catalog.json> <port> <startIdx> <stride> */
import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, appendFileSync } from "fs";
import { join, extname } from "path";

const ROOT = "/workspaces/lucid-winds";
const OUT = process.argv[2], CAT = process.argv[3], PORT = +process.argv[4], START = +process.argv[5], STRIDE = +process.argv[6];
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".txt": "text/plain", ".csv": "text/csv", ".webp": "image/webp" };

const srv = createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]);
  const p = join(ROOT, u.endsWith("/") ? u + "index.html" : u);
  if (!existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); return r.end("404"); }
  r.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream", "cache-control": "no-store" });
  r.end(readFileSync(p));
});
await new Promise(r => srv.listen(PORT, "127.0.0.1", r));

const all = JSON.parse(readFileSync(CAT, "utf8"));
const mine = all.filter((g, i) => i % STRIDE === START);
const slugOf = g => g.kind === "satellite" ? (g.dir || ("ext-" + g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) : ("play-" + g.id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Best "advance past this screen" control that is genuinely on top.
   elementFromPoint at the centre, so a covered control is never tapped. */
const FIND_ADVANCE = () => {
  const HARD = /^(begin|start|play|play now|new game|continue|got it|okay|ok|close|skip|enter|deal|go|next|resume|start game|dismiss|let's play|×|✕|x)\b/i;
  const SOFT = /\b(begin|start|play|new game|got it|continue|deal|enter|dive|descend|launch|classic|normal|easy)\b/i;
  const vis = e => { const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0.15 && r.width > 36 && r.height > 18; };
  const cands = [...document.querySelectorAll("button,a,[onclick],[role=button],.btn,.button,input[type=button],input[type=submit]")].filter(vis);
  /* "How to play" contains the word play but goes the WRONG WAY - it opens the
     instructions we are trying to get past. Same for rules/about/help/settings. */
  const AWAY = /how to play|how it works|instructions|the rules|^rules\b|^about|^help|^settings|^options|^credits|^back|all games|leaderboard/i;
  const ranked = cands.map(e => {
    const t = (e.textContent || e.value || "").trim();
    let s = -1;
    if (t && t.length <= 40 && !AWAY.test(t)) { if (HARD.test(t)) s = 3; else if (SOFT.test(t)) s = 2; }
    return { e, s, t: t.slice(0, 30) };
  }).filter(o => o.s > 0).sort((a, b) => b.s - a.s);
  let blockedBy = null;
  for (const o of ranked) {
    o.e.scrollIntoView({ block: "center" });
    const r = o.e.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    if (hit && (hit === o.e || o.e.contains(hit) || hit.contains(o.e))) return { x, y, t: o.t };
    /* Something is on top of the real control - an intro/story overlay. Never tap
       through it (that would be a fake click). Tap the OVERLAY's own centre, and only
       when it really is an overlay (covers most of the viewport), so we advance the
       intro instead of poking a random point that may be a back link. */
    if (hit && !blockedBy && !hit.closest("a[href]")) {   /* never tap a link out of the game */
      const hr = hit.getBoundingClientRect();
      blockedBy = { blocked: true, x: hr.left + hr.width / 2, y: hr.top + hr.height / 2,
        t: "dismiss:" + hit.tagName + "." + String(hit.className || "").split(" ")[0] };
    }
  }
  return blockedBy;
};

/* Playfield or prose? */
const PLAY_STATE = () => {
  const txt = (document.body.innerText || "").replace(/\s+/g, " ").trim();
  const cvs = [...document.querySelectorAll("canvas")].filter(c => {
    const r = c.getBoundingClientRect();
    return r.width > 180 && r.height > 180 && getComputedStyle(c).display !== "none";
  });
  const overlay = !!document.querySelector("#shell-dir, .shell-dir");
  const instructional = overlay || /how to play|instructions|how it works|the rules|tutorial|welcome to/i.test(txt);
  return { chars: txt.length, canvas: cvs.length, instructional, txt: txt.slice(0, 240) };
};

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu", "--mute-audio", "--disable-dev-shm-usage"] });
for (const g of mine) {
  const slug = slugOf(g);
  const rec = { slug, name: g.name, kind: g.kind, cat: g.cat, gated: g.gated, url: g.url };
  if (/^https?:/i.test(g.url)) { rec.skip = "external"; appendFileSync(join(OUT, `log-${START}.jsonl`), JSON.stringify(rec) + "\n"); console.log(slug, "EXTERNAL"); continue; }
  const pg = await br.newPage();
  await pg.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await pg.setUserAgent("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36");
  /* 27 cards are workbench-gated (dev-gate.js). It short-circuits on this flag, so set it
     before any page script runs - otherwise every gated game photographs as the same
     "IN DEVELOPMENT" card and reads as 27 identical broken games. */
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
  const errs = [], bad = [];
  pg.on("pageerror", e => errs.push(String(e).slice(0, 160)));
  pg.on("requestfailed", r => bad.push("FAIL " + r.url().replace(`http://127.0.0.1:${PORT}`, "").slice(0, 80)));
  pg.on("response", r => { if (r.status() >= 400) bad.push(r.status() + " " + r.url().replace(`http://127.0.0.1:${PORT}`, "").slice(0, 80)); });
  try {
    const sep = g.url.includes("?") ? "&" : "?";
    /* the game's own page(s): a satellite owns its folder, a native owns its shell file */
    const basePath = `http://127.0.0.1:${PORT}` + (g.kind === "satellite" ? g.url.split("?")[0].replace(/[^/]*$/, "") : g.url.split("?")[0]);
    await pg.goto(`http://127.0.0.1:${PORT}${g.url}${sep}dev=1`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await sleep(3600);
    await pg.screenshot({ path: `${OUT}/${slug}-1boot.png` });
    rec.boot = await pg.evaluate(PLAY_STATE);

    rec.taps = [];
    for (let round = 0; round < 6; round++) {
      const st = await pg.evaluate(PLAY_STATE);
      if (st.canvas > 0 && !st.instructional) { rec.reached = "canvas"; break; }
      if (!st.instructional && st.chars < 260 && round > 0) { rec.reached = "sparse-ui"; break; }
      const a = await pg.evaluate(FIND_ADVANCE);
      if (!a) { rec.reached = round === 0 ? "no-control" : "no-more-controls"; break; }
      if (round > 2 && rec.taps[rec.taps.length - 1] === a.t) { rec.reached = "stuck-on:" + a.t; break; }
      rec.taps.push(a.t);
      await pg.touchscreen.tap(a.x, a.y);
      await sleep(1500);
      /* Guard: several games carry an arcade exit, and a tap that lands on it drops
         you on the portal. A portal screenshot filed under a game's name would read
         as "this game is a wall of text". Detect it, go back, stop advancing. */
      if (!pg.url().split("?")[0].startsWith(basePath)) {
        rec.navAway = (rec.navAway || []).concat(pg.url().replace(`http://127.0.0.1:${PORT}`, ""));
        await pg.goto(`http://127.0.0.1:${PORT}${g.url}${sep}dev=1`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await sleep(3000);
        rec.reached = "nav-away-recovered";
        break;
      }
    }
    rec.reached = rec.reached || "max-rounds";

    for (let i = 0; i < 5; i++) { await pg.touchscreen.tap(187 + (i % 3 - 1) * 85, 360 + (i % 2) * 80); await sleep(360); }
    await pg.touchscreen.tap(187, 300);
    for (const k of ["Space", "ArrowRight", "ArrowUp", "ArrowLeft", "KeyW", "Enter"]) { await pg.keyboard.press(k).catch(() => {}); await sleep(200); }
    await sleep(1400);
    if (!pg.url().split("?")[0].startsWith(basePath)) {   /* a poke landed on an exit */
      rec.navAway = (rec.navAway || []).concat("during-play:" + pg.url().replace(`http://127.0.0.1:${PORT}`, ""));
      await pg.goto(`http://127.0.0.1:${PORT}${g.url}${sep}dev=1`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await sleep(3200);
    }
    await pg.screenshot({ path: `${OUT}/${slug}-2play.png` });
    rec.play = await pg.evaluate(PLAY_STATE);
    await sleep(2600);
    await pg.screenshot({ path: `${OUT}/${slug}-3later.png` });
    rec.errs = errs.slice(0, 3); rec.bad = [...new Set(bad)].slice(0, 6);
    console.log(slug, "->", rec.reached, "| taps:", rec.taps.join(">") || "-", errs.length ? "ERR:" + errs[0].slice(0, 50) : "");
  } catch (e) { rec.fatal = String(e).slice(0, 160); console.log(slug, "FATAL", rec.fatal); }
  appendFileSync(join(OUT, `log-${START}.jsonl`), JSON.stringify(rec) + "\n");
  await pg.close().catch(() => {});
}
await br.close(); srv.close();
console.log("worker", START, "done", mine.length);
