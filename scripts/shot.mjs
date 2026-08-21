/* Generic satellite/page screenshot at Stephen's phone size.
   node scripts/shot.mjs <path> <out.png> [waitMs] [--tap=selector-or-text]
   Server assumed at 127.0.0.1:8777 (repo root). domcontentloaded, never networkidle. */
import puppeteer from "puppeteer";
const [target, out, waitMs = "5000", ...rest] = process.argv.slice(2);
const PORT = process.env.PORT || 8777;
const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const p = await br.newPage();
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem("sws_dev_ok", "1"); } catch (e) {} });
const isFile = /\.html?$/i.test(target);
const url = `http://127.0.0.1:${PORT}/${target.replace(/^\/+/, "")}${isFile ? "" : "/"}?probe=` + Math.random();
const errs = [];
p.on("pageerror", e => errs.push(String(e).slice(0, 160)));
await p.goto(url, { waitUntil: "domcontentloaded" });
await new Promise(r => setTimeout(r, +waitMs));
for (const a of rest) {
  if (!a.startsWith("--tap=")) continue;
  const want = a.slice(6);
  const hit = await p.evaluate((w) => {
    const els = [...document.querySelectorAll("button,.btn,[role=button],a,div")];
    const el = document.querySelector(w) || els.find(e => (e.textContent || "").trim().toLowerCase().includes(w.toLowerCase()));
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2, t: (el.textContent || "").trim().slice(0, 30) };
  }, want);
  if (hit) { await p.touchscreen.tap(hit.x, hit.y); await new Promise(r => setTimeout(r, 2500)); console.log("tapped:", hit.t); }
  else console.log("tap target NOT FOUND:", want);
}
await p.screenshot({ path: out });
console.log("shot ->", out, errs.length ? "| pageerrors: " + errs.join(" ; ") : "| no page errors");
await br.close();
