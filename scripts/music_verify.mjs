/* MUSIC VERIFY — every catalog URL answers with audio, or exit 1.
     node scripts/music_verify.mjs --catalog <music-catalog.js> --base <url> [--local <web tier dir>]

   HEAD each track (GET with Range: bytes=0-0 if HEAD is refused). Require
   status 200 (206 for a range), content-type starting audio/, and, when
   --local is given, content-length equal to the local file. Prints every
   miss. This is the gate Fable runs against the live host before flipping
   live:true (HANDOFF-MUSIC section 7.4, LAW 6, LAW 7: check res.ok, never
   trust a bare fetch). */
import { statSync, existsSync } from "fs";
import { join } from "path";
import { readExisting } from "./music_manifest.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const CATALOG = arg("--catalog", "music-catalog.js"), BASE = arg("--base", null), LOCAL = arg("--local", null);
if (!BASE) { console.error("--base <url> is required"); process.exit(1); }
const cat = readExisting(CATALOG);
if (!cat) { console.error("could not read a catalog from " + CATALOG); process.exit(1); }

const jobs = [];
for (const s of cat.shelves) for (const t of s.tracks) jobs.push({ url: BASE.replace(/\/$/, "") + cat.base + s.slug + "/" + t.file, rel: s.slug + "/" + t.file });

async function check(j) {
  let res;
  try { res = await fetch(j.url, { method: "HEAD" }); if (res.status === 405 || res.status === 501) res = await fetch(j.url, { headers: { Range: "bytes=0-0" } }); }
  catch (e) { return j.rel + "  network: " + e.message; }
  if (!(res.status === 200 || res.status === 206)) return j.rel + "  status " + res.status;
  const ct = res.headers.get("content-type") || "";
  if (!/^audio\//.test(ct)) return j.rel + "  content-type " + JSON.stringify(ct);
  if (LOCAL && res.status === 200) {
    const p = join(LOCAL, "music", "v1", j.rel);
    if (!existsSync(p)) return j.rel + "  no local file at " + p;
    const len = Number(res.headers.get("content-length") || -1);
    if (len !== statSync(p).size) return j.rel + "  content-length " + len + " != local " + statSync(p).size;
  }
  return null;
}
const misses = []; let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => { while (i < jobs.length) { const m = await check(jobs[i++]); if (m) misses.push(m); } }));
for (const m of misses.sort()) console.log("  MISS  " + m);
console.log("verify " + BASE + ": " + (jobs.length - misses.length) + "/" + jobs.length + " ok" + (misses.length ? ", " + misses.length + " MISSING" : ""));
process.exit(misses.length ? 1 : 0);
