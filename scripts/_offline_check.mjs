/* ⛔ MINIMUM FUNCTIONALITY IS THE THING THAT GETS TWAs REJECTED, and a reviewer
   WILL test it offline. So test it the way they will: load once so the service
   worker installs, then cut the network completely and COLD LAUNCH — new page,
   no warm memory cache — and see whether the app is actually there. */
import p from "puppeteer";
const slug = process.argv[2] || "bandits-box";
const base = `http://127.0.0.1:8777/satellites/${slug}/`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await p.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
const ctx = await b.createBrowserContext();

const warm = await ctx.newPage();
await warm.goto(base, { waitUntil: "networkidle2", timeout: 45000 });
await sleep(3500);
const sw = await warm.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration();
  const keys = await caches.keys();
  const n = keys.length ? (await (await caches.open(keys[0])).keys()).length : 0;
  return { active: !!(r && r.active), scope: r ? r.scope : null, caches: keys, entries: n };
});
console.log(" service worker active:", sw.active, "| caches:", sw.caches.join(",") || "none", "| precached:", sw.entries);
await warm.close();

/* now pull the plug */
const cold = await ctx.newPage();
await cold.setOfflineMode(true);
const errs = [];
cold.on("pageerror", e => errs.push(String(e).slice(0, 120)));
let failed = false;
try { await cold.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 }); }
catch (e) { failed = true; console.log(" ⛔ OFFLINE NAVIGATION FAILED:", String(e.message).slice(0, 90)); }
await sleep(4000);
const state = await cold.evaluate(() => ({
  title: document.title,
  toys: (window.TOYS && window.TOYS.length) || document.querySelectorAll('[data-toy],.strip button').length,
  bodyText: (document.body.innerText || "").slice(0, 90).replace(/\s+/g, " "),
  canvasOrSvg: document.querySelectorAll("svg,canvas").length
})).catch(() => ({}));
await cold.screenshot({ path: `scratch/shots/${slug}_offline.png` });
console.log(" offline title:", JSON.stringify(state.title));
console.log(" offline toys/tabs:", state.toys, "| svg+canvas:", state.canvasOrSvg);
console.log(" offline first words:", JSON.stringify(state.bodyText));
if (errs.length) console.log(" page errors:", [...new Set(errs)].slice(0, 3).join(" | "));
const ok = !failed && state.canvasOrSvg > 0 && (state.toys > 0);
console.log(ok ? "\n ✅ COLD LAUNCH OFFLINE: the app is there" : "\n ⛔ COLD LAUNCH OFFLINE: FAILED");
await b.close();
process.exit(ok ? 0 : 1);
