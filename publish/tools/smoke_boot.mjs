/* PUB1 step 1 evidence: boot each candidate satellite headless at 375x667 and
   report what a player would actually meet. Never trusts a grep for "it works".

   node publish/tools/smoke_boot.mjs <slug> [<slug>...]        (serial, one at a time)
   Requires a static server on 8777 rooted at the repo, so /sunbeam-sdk.js and the
   other same-origin shell files resolve exactly as they do in production. */
import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "fs";

import { tmpdir as _tmpdir } from "os";
const OUT = process.env.PUB_TMP ? (process.env.PUB_TMP + "/smoke") : (_tmpdir() + "/pub1-smoke");
mkdirSync(OUT, { recursive: true });
const slugs = process.argv.slice(2);
const results = [];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
});

for (const slug of slugs) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = [], failed = [], reqs = [];
  page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
  page.on("pageerror", e => errs.push("PAGEERROR: " + String(e).slice(0, 200)));
  page.on("requestfailed", r => failed.push(r.url().replace("http://localhost:8777", "") + " :: " + (r.failure() || {}).errorText));
  page.on("response", r => { if (r.status() >= 400) failed.push(r.url().replace("http://localhost:8777", "") + " :: HTTP " + r.status()); });
  page.on("request", r => reqs.push(r.url()));
  let rec = { slug, ok: false };
  try {
    await page.goto(`http://localhost:8777/satellites/${slug}/`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));
    rec = await page.evaluate(() => {
      /* every element a thumb could plausibly hit, measured in RENDERED px */
      const tappable = [...document.querySelectorAll('button,[onclick],a,[role="button"],input,select,.btn,.key')]
        .filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
          return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"; });
      const small = tappable.filter(e => { const r = e.getBoundingClientRect(); return r.width < 48 || r.height < 48; });
      return {
        title: document.title,
        bodyText: (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 400),
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        scrollW: document.documentElement.scrollWidth,
        canvases: document.querySelectorAll("canvas").length,
        tappable: tappable.length,
        under48: small.length,
        under48sample: small.slice(0, 6).map(e => {
          const r = e.getBoundingClientRect();
          return (e.id || e.className || e.tagName) + " " + Math.round(r.width) + "x" + Math.round(r.height);
        })
      };
    });
    rec.slug = slug;
    rec.ok = true;
    await page.screenshot({ path: `${OUT}/${slug}.png` });
  } catch (e) {
    rec.err = String(e).slice(0, 200);
  }
  rec.consoleErrors = errs.slice(0, 5);
  rec.nConsoleErrors = errs.length;
  rec.failed = failed.slice(0, 6);
  rec.nFailed = failed.length;
  rec.external = [...new Set(reqs.filter(u => !u.startsWith("http://localhost:8777") && !u.startsWith("data:") && !u.startsWith("blob:")))];
  results.push(rec);
  console.log(`${slug.padEnd(22)} boot=${rec.ok ? "OK " : "ERR"} err=${rec.nConsoleErrors} 404=${rec.nFailed} canv=${rec.canvases ?? "-"} tap=${rec.tappable ?? "-"} under48=${rec.under48 ?? "-"} overflowX=${rec.overflowX ?? "-"}`);
  await page.close();
}
await browser.close();
writeFileSync(`${OUT}/smoke.json`, JSON.stringify(results, null, 1));
console.log(`\nwrote ${OUT}/smoke.json for ${results.length} games`);
