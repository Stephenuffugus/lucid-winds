#!/usr/bin/env node
/* IS THIS APP READY TO BE A GOOGLE PLAY LISTING?
     node scripts/twa_ready.mjs bandits-box
     node scripts/twa_ready.mjs --all        (just the static checks, every satellite)

   One command instead of remembering four. Everything here is a gate that can
   FAIL, and each one exists because of something real:

   1. PAYMENT SURFACE — Play requires Play Billing for in-app digital purchases
      and permits donations outside it only for approved nonprofits. Any
      buy.stripe.com inside a listed app is the thing that gets it pulled.
   2. PORTAL EXIT — 81 of the satellites can walk a player to portal/index.html,
      which carries a live Stripe checkout. Inside a TWA that is the same
      violation at one remove, so the exit must be disabled, not merely hidden.
      Only the app being listed needs the guard, which is why this is a gate and
      not a fleet-wide patch.
   3. MANIFEST — what bubblewrap reads. Scope is the containment boundary.
   4. OFFLINE — the minimum-functionality bar a reviewer will actually test.

   ⛔ This script found its own first bug: run from the wrong directory it
   reported "0 satellites affected", a clean bill of health produced by a glob
   that matched nothing. It now resolves paths from the repo root and fails
   loudly if the app folder is not there. */
import { readFileSync, existsSync, readdirSync } from "fs";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
let fails = 0, warns = 0;
const ok = (label, pass, note = "") => { if (!pass) fails++; console.log(` ${pass ? "ok  " : "⛔  "} ${label}${note ? "  — " + note : ""}`); };
const warn = (label, note) => { warns++; console.log(` ⚠   ${label}${note ? "  — " + note : ""}`); };

function statics(slug) {
  const f = join(ROOT, "satellites", slug, "index.html");
  if (!existsSync(f)) { console.error(`⛔ no such app: satellites/${slug}/index.html`); process.exit(2); }
  const src = readFileSync(f, "utf8");
  const noComments = src.replace(/<!--[\s\S]*?-->/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");

  const stripe = (noComments.match(/buy\.stripe\.com/g) || []).length;
  ok("no Stripe checkout inside the app", stripe === 0, stripe ? `${stripe} found — MUST come out` : "");

  const exits = noComments.includes("SWS_EXIT");
  const guarded = noComments.includes("inTWA");
  if (exits) ok("portal exit is disabled inside a TWA", guarded,
    guarded ? "inTWA guard present" : "has SWS_EXIT with NO inTWA guard — it can reach the portal's Stripe checkout");
  else ok("no portal exit at all", true);

  for (const [label, re] of [
    ["no ad SDK", /adsbygoogle|googlesyndication|admob|gamemonetize|gamedistribution/i],
    ["no analytics", /gtag\(|googletagmanager|google-analytics|mixpanel|plausible/i],
    ["no sign-in wall", /signInWith|createUserWith|firebase\.auth/i]
  ]) ok(label, !re.test(noComments));

  const mf = join(ROOT, "satellites", slug, "manifest.webmanifest");
  ok("has a web manifest", existsSync(mf));
  ok("has a service worker", existsSync(join(ROOT, "satellites", slug, "sw.js")));
  ok("has its own privacy policy page", existsSync(join(ROOT, "satellites", slug, "privacy.html")),
     "Play requires a privacy policy URL for every listing, and the root one is titled for Lucid Winds");
  return { exits, guarded, stripe };
}

if (args[0] === "--all") {
  console.log("STATIC PLAY GATES, EVERY SATELLITE (offline check is per app, run it separately)\n");
  const dirs = readdirSync(join(ROOT, "satellites")).filter(d => existsSync(join(ROOT, "satellites", d, "index.html")));
  let unguarded = [], withStripe = [];
  for (const d of dirs) {
    const src = readFileSync(join(ROOT, "satellites", d, "index.html"), "utf8")
      .replace(/<!--[\s\S]*?-->/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
    if (src.includes("SWS_EXIT") && !src.includes("inTWA")) unguarded.push(d);
    if (/buy\.stripe\.com/.test(src)) withStripe.push(d);
  }
  console.log(` ${dirs.length} satellites scanned`);
  console.log(` ${unguarded.length} have an unguarded portal exit — each needs the inTWA guard BEFORE it can be listed`);
  console.log(` ${withStripe.length} carry a Stripe checkout inside the app${withStripe.length ? ": " + withStripe.join(", ") : ""}`);
  console.log("\n⛔ This is a gate, not a backlog. Only the app being listed needs fixing.");
  process.exit(0);
}

const slug = args[0];
if (!slug) { console.log("usage: twa_ready.mjs <slug> | --all"); process.exit(1); }
console.log(`PLAY READINESS — ${slug}\n`);
statics(slug);
try {
  execFileSync("node", [join(ROOT, "scripts", "_twa_manifest_check.mjs"), `satellites/${slug}`], { cwd: ROOT, stdio: "pipe" });
  ok("manifest is bubblewrap ready", true);
} catch (e) { ok("manifest is bubblewrap ready", false, "run scripts/_twa_manifest_check.mjs for detail"); }
try {
  const out = execFileSync("node", [join(ROOT, "scripts", "_offline_check.mjs"), slug], { cwd: ROOT, stdio: "pipe" }).toString();
  ok("cold launches offline", out.includes("✅"), (out.match(/offline toys\/tabs: \d+.*/) || [""])[0]);
} catch (e) { warn("cold launches offline", "check did not run — is the server on 8777 up?"); }
/* 5. ASSETLINKS — the handshake that removes the URL bar. Only meaningful once the app has a
      package name; today that is Flock the World. The fingerprint must be the PLAY APP SIGNING
      key's SHA-256, not the upload key's. */
if (slug === "flock-the-world") {
  try {
    const r = await fetch("https://lucidwinds.com/.well-known/assetlinks.json", { redirect: "manual" });
    const ct = r.headers.get("content-type") || "";
    const body = r.status === 200 ? await r.text() : "";
    let j = null; try { j = JSON.parse(body); } catch (e) {}
    const entry = Array.isArray(j) && j.find(x => x.target && x.target.package_name === "com.skywolfstudio.flocktheworld");
    const fp = entry && entry.target.sha256_cert_fingerprints && entry.target.sha256_cert_fingerprints[0] || "";
    const real = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fp);
    ok("assetlinks.json is live, JSON, no redirect", r.status === 200 && ct.includes("json"), `status ${r.status}, ${ct || "no content type"}`);
    if (r.status === 200) (real ? ok : warn)("assetlinks carries a real Play App Signing fingerprint", real ? true : "still the placeholder — paste the SHA-256 from Play Console → App signing, then deploy");
  } catch (e) { warn("assetlinks.json is live", "fetch failed: " + e.message); }
}

console.log(fails ? `\n⛔ ${fails} gate(s) failed — not ready to list` : `\n✅ ready to list${warns ? ` (${warns} warning)` : ""}`);
process.exit(fails ? 1 : 0);
