/* Look at a built publisher ZIP and print what a recipe can grab hold of:
   every screen-ish container with an id, every visible control, and the text on it.

   node publish/tools/scout.mjs <slug> ["tap sequence"] ...
   Each extra argument is a step: "sel:#btnPlay", "text:PLAY", "xy:187,480", "wait:1200".
   After the steps it prints the DOM again, so you can walk a menu one step at a time. */
import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, existsSync, statSync, mkdirSync, rmSync } from "fs";
import { execSync } from "child_process";
import { join, extname, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TMP = "/tmp/claude-1000/-workspaces-lucid-winds/948f2b8c-5802-4123-8a71-bee14fc0e11f/scratchpad/pub1/scout";
const MIME = { ".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",".gif":"image/gif",".svg":"image/svg+xml",".webp":"image/webp",".json":"application/json",
  ".mp3":"audio/mpeg",".ogg":"audio/ogg",".wav":"audio/wav",".woff2":"font/woff2",".ttf":"font/ttf",".mp4":"video/mp4" };

const slug = process.argv[2];
const steps = process.argv.slice(3);
const root = join(TMP, slug);
rmSync(root, { recursive: true, force: true }); mkdirSync(root, { recursive: true });
execSync(`unzip -q ${JSON.stringify(join(REPO, "publish/dist", slug + "-gd.zip"))} -d ${JSON.stringify(root)}`);
const server = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  const p = join(root, u === "/" ? "index.html" : u);
  if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": MIME[extname(p).toLowerCase()] || "application/octet-stream" });
  res.end(readFileSync(p));
});
const PORT = 8850 + (Math.abs([...slug].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,5)) % 40);
await new Promise(r => server.listen(PORT, "127.0.0.1", r));
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--mute-audio"] });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
await page.setRequestInterception(true);
page.on("request", r => (r.url().includes(`:${PORT}`) || /^(data|blob):/.test(r.url())) ? r.continue() : r.abort());
const errs = []; page.on("pageerror", e => errs.push(String(e).slice(0,150)));
const wait = ms => new Promise(r => setTimeout(r, ms));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle2", timeout: 40000 });
await wait(1800);

const dump = () => page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; };
  const ided = [...document.querySelectorAll("[id]")].map(e => {
    const r = e.getBoundingClientRect();
    return { id: e.id, tag: e.tagName, vis: vis(e), w: Math.round(r.width), h: Math.round(r.height),
      cls: (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || "").toString().slice(0, 40) };
  });
  const ctl = [...document.querySelectorAll('button,[onclick],a,[role="button"],.btn,.key,canvas')].filter(vis).map(e => {
    const r = e.getBoundingClientRect();
    return { id: e.id || "", tag: e.tagName, t: (e.textContent || "").trim().replace(/\s+/g," ").slice(0, 34),
      x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2), w: Math.round(r.width), h: Math.round(r.height) };
  });
  return { visibleIds: ided.filter(e => e.vis).map(e => `#${e.id}(${e.tag} ${e.w}x${e.h})`),
           hiddenIds: ided.filter(e => !e.vis).map(e => "#" + e.id), ctl,
           body: (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 300) };
});
const show = (tag, d) => {
  console.log(`\n---- ${tag} ----`);
  console.log("VISIBLE :", d.visibleIds.join(" "));
  console.log("HIDDEN  :", d.hiddenIds.join(" "));
  console.log("CONTROLS:");
  for (const c of d.ctl) console.log(`   ${(c.id ? "#" + c.id : c.tag).padEnd(18)} ${String(c.w).padStart(4)}x${String(c.h).padStart(3)} @${c.x},${c.y}  "${c.t}"`);
  console.log("TEXT    :", d.body);
};
show("boot", await dump());

for (const s of steps) {
  const [kind, arg] = [s.slice(0, s.indexOf(":")), s.slice(s.indexOf(":") + 1)];
  try {
    if (kind === "wait") await wait(+arg);
    else if (kind === "xy") { const [x, y] = arg.split(",").map(Number); await page.touchscreen.tap(x, y); await wait(400); }
    else if (kind === "sel" || kind === "text") {
      const box = await page.evaluate((k, a) => {
        const vis = e => { const r = e.getBoundingClientRect(), st = getComputedStyle(e);
          return r.width > 4 && r.height > 4 && st.visibility !== "hidden" && st.display !== "none" && +st.opacity > .05; };
        let e;
        if (k === "sel") e = [...document.querySelectorAll(a)].filter(vis)[0];
        else { const rx = new RegExp(a, "i");
          e = [...document.querySelectorAll("button,a,[onclick],[role=button],.btn,div,span,li,label,p,h1,h2,h3,h4,td")]
            .filter(x => vis(x) && rx.test((x.textContent||"").trim()) && ![...x.children].some(c => rx.test((c.textContent||"").trim())))[0]; }
        if (!e) return null; const r = e.getBoundingClientRect();
        return { x: r.left + r.width/2, y: r.top + r.height/2 };
      }, kind, arg);
      if (!box) { console.log(`\n!! step ${s}: nothing matched`); continue; }
      await page.touchscreen.tap(box.x, box.y); await wait(600);
    }
    show("after " + s, await dump());
  } catch (e) { console.log(`\n!! step ${s} threw: ${String(e).slice(0,140)}`); }
}
await page.screenshot({ path: join(TMP, slug + ".png") });
console.log("\nshot:", join(TMP, slug + ".png"), errs.length ? "PAGEERRORS: " + errs.slice(0,2).join(" | ") : "");
await browser.close(); server.close(); rmSync(root, { recursive: true, force: true });
