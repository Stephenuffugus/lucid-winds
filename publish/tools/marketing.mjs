/* PUB1 step 3: the marketing sizes both networks ask for, rendered from the game's own
   art and a real frame of it being played.

   node publish/tools/marketing.mjs <slug> [<slug>...]        one game at a time
   node publish/tools/marketing.mjs --sheet                   contact sheet of everything

   Sizes: 512x384, 512x512, 200x120 (mandatory) and 1280x720, 1280x550 (optional).
   Sources, and nothing else:
     - portal-assets/thumbs/<slug>.(png|jpg), the painted 480x480 card art
     - a live frame from the BUILT publisher ZIP, captured by driving the game with the
       same recipe the verifier uses, so the frame is real play and not a menu
   ⛔ Never a debug overlay, never a price, never a date. A capsule with a date on it is
   wrong the day after it ships. */
import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, rmSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join, extname, resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { catalog } from "../../scripts/catalog.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(REPO, "publish", "marketing");
const TMP = "/tmp/claude-1000/-workspaces-lucid-winds/948f2b8c-5802-4123-8a71-bee14fc0e11f/scratchpad/pub1/mkt";
const SIZES = [[512, 384, "square"], [512, 512, "square"], [200, 120, "square"], [1280, 720, "banner"], [1280, 550, "banner"]];
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png",
  ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".svg":"image/svg+xml", ".webp":"image/webp",
  ".json":"application/json", ".mp3":"audio/mpeg", ".ogg":"audio/ogg", ".wav":"audio/wav", ".woff2":"font/woff2",
  ".ttf":"font/ttf", ".glb":"model/gltf-binary", ".mp4":"video/mp4", ".txt":"text/plain" };

const cat = catalog(join(REPO, "portal/index.html"));
const meta = {};
for (const s of cat.sats) if (s.dir) meta[s.dir] = { name: s.name };
/* the one line under the title comes from the portal card, so the copy the player reads
   on our own site and the copy a network reads are never two different promises */
{
  const src = readFileSync(join(REPO, "portal/index.html"), "utf8");
  const i = src.indexOf("var FEATURED ="), start = src.indexOf("[", i);
  let depth = 0, inStr = null, k = start;
  for (; k < src.length; k++) {
    const c = src[k], prev = src[k-1], next = src[k+1];
    if (inStr) { if (c === inStr && prev !== "\\") inStr = null; continue; }
    if (c === "/" && next === "*") { const e = src.indexOf("*/", k+2); k = e < 0 ? src.length : e+1; continue; }
    if (c === "/" && next === "/") { const e = src.indexOf("\n", k+2); k = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "[") depth++; else if (c === "]") { depth--; if (!depth) { k++; break; } }
  }
  const { runInNewContext } = await import("vm");
  for (const o of runInNewContext("(" + src.slice(start, k) + ")")) {
    const d = (String(o.url || "").match(/^\/satellites\/([a-z0-9-]+)\//) || [])[1];
    if (d && meta[d]) { meta[d].ds = o.ds || ""; meta[d].thumb = o.thumb || null; }
  }
}

const dataURI = (p) => "data:" + (MIME[extname(p).toLowerCase()] || "image/png") + ";base64," +
  readFileSync(p).toString("base64");

function serve(root) {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const p = join(root, url === "/" ? "index.html" : url);
    if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "content-type": MIME[extname(p).toLowerCase()] || "application/octet-stream" });
    res.end(readFileSync(p));
  });
  return server;
}

/* a real frame of the game being played, from the ZIP that will be uploaded */
async function playFrame(browser, slug) {
  const zip = join(REPO, "publish", "dist", `${slug}-gd.zip`);
  const root = join(TMP, slug);
  rmSync(root, { recursive: true, force: true }); mkdirSync(root, { recursive: true });
  execSync(`unzip -q ${JSON.stringify(zip)} -d ${JSON.stringify(root)}`);
  const server = serve(root);
  const port = 8790 + (Math.abs([...slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 3)) % 90);
  await new Promise(r => server.listen(port, "127.0.0.1", r));
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setRequestInterception(true);
  page.on("request", r => (r.url().includes(`:${port}`) || /^(data|blob):/.test(r.url())) ? r.continue() : r.abort());
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const h = {
    wait,
    tap: async (x, y) => { await page.touchscreen.tap(x, y); await wait(160); },
    tapSel: async (sel, i = 0) => {
      const b = await page.evaluate((s, n) => { const e = [...document.querySelectorAll(s)]
        .filter(x => x.getBoundingClientRect().width > 0)[n]; if (!e) return null;
        const r = e.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; }, sel, i);
      if (!b) throw new Error("tapSel " + sel); await page.touchscreen.tap(b.x, b.y); await wait(200);
    },
    tapText: async (re) => {
      const b = await page.evaluate((s, f) => { const rx = new RegExp(s, f);
        const e = [...document.querySelectorAll("button,a,[onclick],[role=button],.btn,div,span,li,label,p,h1,h2,h3,h4,td")]
          .filter(x => { const r = x.getBoundingClientRect(), st = getComputedStyle(x);
            return r.width > 8 && r.height > 8 && st.display !== "none" && st.visibility !== "hidden" &&
              +st.opacity > .05 && rx.test((x.textContent || "").trim()) &&
              ![...x.children].some(c => rx.test((c.textContent || "").trim())); })[0];
        if (!e) return null; const r = e.getBoundingClientRect();
        return { x: r.left + r.width/2, y: r.top + r.height/2 }; }, re.source, re.flags.replace("g", ""));
      if (!b) throw new Error("tapText " + re); await page.touchscreen.tap(b.x, b.y); await wait(240);
    },
    drag: async (x1,y1,x2,y2,st=12) => { await page.touchscreen.touchStart(x1,y1);
      for (let i=1;i<=st;i++) await page.touchscreen.touchMove(x1+(x2-x1)*i/st, y1+(y2-y1)*i/st);
      await page.touchscreen.touchEnd(); await wait(160); },
    shot: async () => {}
  };
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await wait(1800);
  /* ⭐ the frame comes from the game's OWN verified recipe, played for a few seconds and
     then photographed mid round. Guessing at a play button by its label put six of the
     ten menus in the banner instead of the game: every label carries an emoji, so
     /^play/ matched nothing. The recipe already knows how to start this game. */
  const rp = join(REPO, "publish", "recipes", slug + ".mjs");
  let how = "boot", frame = null;
  const r = existsSync(rp) ? await import(pathToFileURL(rp).href) : null;
  if (r && r.play) {
    const running = r.play(page, h).catch(() => {});
    /* ⛔ a fixed nine second timer put Bloom Breaker's BLACK launch screen in the banner
       and Nova Bloom's empty starfield beside it. A capsule that shows an empty
       rectangle is worse than no capsule. Wait for a frame with something IN it: read
       the game's own canvas and take the first one whose pixels have real structure. */
    const busy = async () => page.evaluate(() => {
      const cs = [...document.querySelectorAll("canvas")]
        .sort((a, b) => b.width * b.height - a.width * a.height);
      for (const c of cs) {
        try {
          const g = c.getContext("2d"); if (!g) continue;
          const w = Math.min(160, c.width), hh = Math.min(160, c.height);
          const d = g.getImageData(0, 0, w, hh).data;
          let n = 0, sum = 0, sq = 0;
          for (let i = 0; i < d.length; i += 16) {
            const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            sum += l; sq += l * l; n++;
          }
          if (!n) continue;
          const mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
          return { mean, sd };
        } catch (e) { /* a tainted or webgl canvas cannot be read: fall through */ }
      }
      return null;
    });
    /* ⛔ AND stop before the round does. The first pass ran to a thirty second cap, by
       which time Bloom Breaker was on GAME OVER, Pong Arena on DEFEAT and Nova Bloom on
       THE GARDEN RESTS: three of the ten banners were advertising the losing screen.
       Keep the previous frame and hand it back the moment the round ends. */
    /* ⛔ scoring the CANVAS was the wrong surface. Some of these games draw on several
       canvases and the biggest one by attribute is not always the one with the game on
       it, so Stop the Light and Pong Arena both scored a flat 1 and kept their first
       frame. Score the SCREENSHOT instead, which is the thing that actually goes in the
       banner: collect candidates across the round, then pick the busiest with PIL. */
    const cand = join(TMP, "_cand", slug);
    rmSync(cand, { recursive: true, force: true }); mkdirSync(cand, { recursive: true });
    const t0 = Date.now();
    let n = 0;
    while (Date.now() - t0 < 24000) {
      await wait(1500);
      if (r.isRoundOver && await r.isRoundOver(page).catch(() => false)) break;
      await page.screenshot({ path: join(cand, String(1000 + (n++)) + ".png") });
    }
    if (n) {
      const pick = execSync(`python3 ${JSON.stringify(join(REPO, "publish/tools/pick_frame.py"))} ${JSON.stringify(cand)}`)
        .toString().trim().split("\t");
      frame = readFileSync(pick[0]);
      how = `recipe, busiest of ${n} frames (${pick[1]})`;
    } else {
      frame = await page.screenshot();
      how = "recipe, round ended before a frame could be taken";
    }
    running.catch(() => {});
  } else {
    try { await h.tapText(/play|start|begin/i); await wait(2600); how = "play button"; } catch (e) {}
  }
  const dir = join(OUT, slug); mkdirSync(dir, { recursive: true });
  const shot = join(dir, "_play.png");
  if (frame) writeFileSync(shot, frame); else await page.screenshot({ path: shot });
  await page.close(); server.close(); rmSync(root, { recursive: true, force: true });
  return { shot, how };
}

/* Composition, decided by what each size is FOR and by what the two networks that
   publish these say about them:
     - 512x512 is a square catalogue tile: the painted card fills it exactly, no crop.
     - 512x384 and 200x120 are wider than the art. The first version CONTAINED the art
       over a blur of itself so nothing was cropped; on the contact sheet that read as a
       mistake, and at 200x120 the painting held only the middle 120 px with blurred
       wings either side, which is most of the tile spent on nothing. A network tile is
       a poster, not an archive: cover crop and fill it.
     - No title text on the mandatory sizes. GameDistribution prints the game's name
       under the tile itself, and Poki's thumbnail guide is explicit: "avoid text
       entirely, it quickly becomes unreadable on smaller tiles". At 200x120 a title
       would be four pixels tall and would only make the art smaller.
     - The two optional 1280 sizes ARE banners, where a name and a line are expected.
       Those carry the title, the portal's own one-line description, a real frame of
       the game being played, and the studio signature. */
const TPL = (o) => `<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${o.w}px;height:${o.h}px;overflow:hidden;background:#0d100c;
    font-family:"DejaVu Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .stage{position:relative;width:${o.w}px;height:${o.h}px;overflow:hidden}
  .ground{position:absolute;inset:-${Math.round(o.w*0.06)}px;
    background:url("${o.art}") center/cover no-repeat;
    filter:blur(${Math.round(Math.max(10, o.w*0.028))}px) saturate(.8) brightness(.4)}
  .cover{position:absolute;inset:0;background:url("${o.art}") center/cover no-repeat}
  .fit{position:absolute;inset:0;background:url("${o.art}") center/contain no-repeat}
  .card{position:absolute;left:${o.pad}px;top:50%;transform:translateY(-50%);
    width:${o.card}px;height:${o.card}px;border-radius:${Math.round(o.card*0.07)}px;
    background:url("${o.art}") center/cover no-repeat;
    box-shadow:0 18px 60px rgba(0,0,0,.75),0 0 0 2px rgba(200,168,75,.35)}
  .phone{position:absolute;right:${o.pad}px;top:50%;transform:translateY(-50%);
    height:${o.phoneH}px;width:${Math.round(o.phoneH*375/667)}px;
    border-radius:${Math.round(o.phoneH*0.045)}px;
    background:url("${o.play}") center/cover no-repeat #0d100c;
    box-shadow:0 18px 55px rgba(0,0,0,.8),0 0 0 3px rgba(232,220,200,.14)}
  .copy{position:absolute;left:${Math.round(o.pad*1.6) + o.card}px;
    right:${Math.round(o.pad*1.6) + Math.round(o.phoneH*375/667)}px;
    top:50%;transform:translateY(-50%);color:#e8dcc8}
  .rule{width:${Math.round(o.fs*1.4)}px;height:4px;border-radius:2px;background:#c8a84b;
    margin-bottom:${Math.round(o.fs*0.3)}px;box-shadow:0 0 14px rgba(200,168,75,.55)}
  .copy h1{font-size:${o.fs}px;font-weight:800;line-height:1.02;letter-spacing:.5px;
    text-shadow:0 3px 16px rgba(0,0,0,.9)}
  .copy p{margin-top:14px;font-size:${Math.round(o.fs*0.30)}px;font-weight:500;
    color:#bdb49f;line-height:1.42;max-width:${Math.round(o.w*0.34)}px}
  .studio{position:absolute;right:${o.pad}px;bottom:${Math.round(o.pad*0.55)}px;
    font-size:${Math.round(o.fs*0.19)}px;letter-spacing:3px;color:#8a9178;font-weight:700}
</style><div class="stage">
${o.mode === "banner" ? `
  <div class="ground"></div><div class="card"></div><div class="phone"></div>
  <div class="copy"><div class="rule"></div><h1>${o.name}</h1><p>${o.ds}</p></div>
  <div class="studio">SKY WOLF STUDIO</div>`
  : o.mode === "square" ? `<div class="cover"></div>`
  : `<div class="ground"></div><div class="fit"></div>`}
</div>`;

const slugs = process.argv.slice(2).filter(a => !a.startsWith("--"));
const browser = await puppeteer.launch({ headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--mute-audio", "--font-render-hinting=none"] });

for (const slug of slugs) {
  /* ⛔ the thumb is named by the CARD, not by the folder. Pong Arena lives in
     satellites/pong/ and its art is thumbs/pong-arena.jpg, so a filename guess off the
     slug silently skipped it. Take the path the portal itself uses. */
  const carded = (meta[slug] || {}).thumb;
  const thumb = (carded && existsSync(join(REPO, carded.replace(/^\//, "").split("?")[0])))
    ? join(REPO, carded.replace(/^\//, "").split("?")[0])
    : readdirSync(join(REPO, "portal-assets", "thumbs"))
        .filter(f => f.replace(/\.[a-z]+$/, "") === slug)
        .map(f => join(REPO, "portal-assets", "thumbs", f))[0];
  if (!thumb) { console.log(`${slug}: NO THUMB, skipped`); continue; }
  const { shot, how } = await playFrame(browser, slug);
  const art = dataURI(thumb), play = dataURI(shot);
  const m = meta[slug] || { name: slug, ds: "" };
  const dir = join(OUT, slug); mkdirSync(dir, { recursive: true });
  const page = await browser.newPage();
  for (const [w, h2, mode] of SIZES) {
    const o = { w, h: h2, mode, art, play, name: m.name, ds: m.ds || "",
      pad: mode === "banner" ? Math.round(w * 0.038) : Math.round(w * 0.055),
      /* ⛔ 0.058 of 1280 is a 74 px title, and "Bloom Breaker" at 74 px did not fit the
         pinched middle column, so every banner broke its own name over two lines and the
         one line description ran eight lines deep. Smaller type, narrower card, smaller
         phone: the words get the middle third they need. */
      fs: mode === "banner" ? Math.round(w * 0.042) : Math.round(w * 0.088),
      card: Math.round(h2 * 0.62), phoneH: Math.round(h2 * 0.72) };
    await page.setViewport({ width: w, height: h2, deviceScaleFactor: 1 });
    await page.setContent(TPL(o), { waitUntil: "load" });
    await new Promise(r => setTimeout(r, 260));
    await page.screenshot({ path: join(dir, `${w}x${h2}.png`) });
  }
  await page.close();
  console.log(`${slug.padEnd(15)} 5 sizes from ${m.name}  (play frame: ${how})`);
}
await browser.close();
