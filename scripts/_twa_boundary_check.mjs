/* ⛔ I ADDED A POLICY BOUNDARY AND SHIPPED IT WITHOUT WATCHING IT WORK.
   Inside a Trusted Web Activity the arcade exit must be unreachable, because it
   leads to portal/index.html which carries a live buy.stripe.com checkout. This
   drives the real page in three states and asserts the boundary in each.

   It carries its own positive control: the PORTAL case MUST show the button. If
   every case came back "hidden", the check would be passing for the wrong
   reason — the element could simply not exist — and would prove nothing. */
import p from "puppeteer";
const BASE = "http://127.0.0.1:8777/satellites/bandits-box/";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await p.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });

async function probe(label, { referrer, standalone, android }) {
  const ctx = await b.createBrowserContext();
  const pg = await ctx.newPage();
  await pg.setViewport({ width: 430, height: 932 });
  if (android) await pg.setUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel 9) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36");
  /* ⛔ puppeteer's emulateMediaFeatures rejects display-mode ("Unsupported
     media feature"), so stub matchMedia for that one query instead. Testing the
     REAL guard either way — the app calls matchMedia('(display-mode: standalone)')
     and this makes that call answer the way it does inside an installed app. */
  if (standalone) await pg.evaluateOnNewDocument(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = q => /display-mode:\s*standalone/.test(q)
      ? { matches: true, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }
      : real(q);
  });
  await pg.evaluateOnNewDocument(r => {
    try { localStorage.clear(); } catch (e) {}
    if (r !== null) Object.defineProperty(document, "referrer", { get: () => r, configurable: true });
  }, referrer);
  await pg.goto(BASE, { waitUntil: "domcontentloaded", timeout: 40000 });
  await sleep(2600);

  const r = await pg.evaluate(() => {
    const el = document.getElementById("swsBack");
    const visible = !!el && getComputedStyle(el).display !== "none";
    const before = location.href;
    let threw = null;
    try { window.SWS_EXIT && window.SWS_EXIT(); } catch (e) { threw = String(e).slice(0, 60); }
    return { visible, before, after: location.href, threw, referrer: document.referrer };
  });
  await sleep(700);
  const navigated = await pg.evaluate(() => location.href).catch(() => "gone");
  const leftApp = !navigated.includes("/bandits-box/");
  await ctx.close();
  return { label, ...r, navigated, leftApp };
}

const cases = [
  ["inside a TWA (android-app referrer)", { referrer: "android-app://com.skywolfstudio.banditsbox", standalone: false, android: true }],
  ["inside a TWA (standalone + Android)", { referrer: "", standalone: true, android: true }],
  ["opened from the portal (web)",        { referrer: "https://lucidwinds.com/portal/", standalone: false, android: false }],
  ["plain web, typed in",                 { referrer: "", standalone: false, android: false }]
];

const out = [];
for (const [label, opts] of cases) out.push(await probe(label, opts));
await b.close();

let bad = 0;
for (const r of out) {
  const isTWA = r.label.includes("TWA");
  const isPortal = r.label.includes("portal");
  // TWA: must be hidden AND must not navigate away. Portal: must be VISIBLE (control).
  const ok = isTWA ? (!r.visible && !r.leftApp) : isPortal ? r.visible : true;
  if (!ok) bad++;
  console.log(` ${ok ? "ok  " : "⛔  "} ${r.label.padEnd(36)} button:${r.visible ? "SHOWN" : "hidden"}  left the app:${r.leftApp ? "YES" : "no"}`);
}
console.log(bad
  ? `\n⛔ ${bad} case(s) wrong — the boundary does not hold`
  : `\n✅ boundary holds: unreachable in a TWA, and the portal control proves the button can still show`);
process.exit(bad ? 1 : 0);
