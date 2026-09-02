/* MUSIC INTAKE — run this after dropping the music zip in _music-drop/.
     node scripts/music_intake.mjs

   ⛔ THE WHOLE POINT: audio never stays on /workspaces and never enters git.
   /workspaces is 91% full (2.8GB free) and the repo is PUBLIC and already
   3.7GB. /tmp is a different disk with 38GB free. So the first thing this
   does is MOVE the zip off this disk, before unzipping anything.

   It produces docs/music-intake.json — filenames, durations, bitrates and
   sizes. Names and numbers only. No audio is ever copied into the repo.
*/
import { readdirSync, existsSync, statSync, mkdirSync, renameSync, copyFileSync, unlinkSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join, basename, extname } from "path";

const DROP = "_music-drop";
const WORK = "/tmp/music-intake";
const AUD  = /\.(mp3|wav|flac|m4a|aac|ogg|opus|webm)$/i;

const sh = (c) => { try { return execSync(c, {encoding:"utf8", maxBuffer:64*1024*1024}).trim(); } catch { return ""; } };
const mb = (b) => (b/1048576).toFixed(1);

/* ---- 1. find the zip ---------------------------------------------------- */
if (!existsSync(DROP)) { console.error("no " + DROP + " folder. Nothing to do."); process.exit(1); }
const zips = readdirSync(DROP).filter(f => /\.zip$/i.test(f));
if (!zips.length) {
  console.error("No zip found in " + DROP + "/.");
  console.error("Drag the music zip into that folder in the VS Code file tree, then run this again.");
  process.exit(1);
}

mkdirSync(WORK, {recursive:true});
for (const z of zips) {
  const from = join(DROP, z), to = join(WORK, z);
  const size = statSync(from).size;
  console.log("moving " + z + " (" + mb(size) + " MB) off /workspaces -> " + WORK);
  /* rename fails across devices, so fall back to copy+unlink */
  try { renameSync(from, to); } catch { copyFileSync(from, to); unlinkSync(from); }
  console.log("  unzipping...");
  const out = sh(`cd ${WORK} && unzip -o -q "${z}" 2>&1 | tail -3`);
  if (out) console.log("  " + out);
}

/* ---- 2. walk the tree: <root>/<game folder>/<songs> ---------------------- */
function walk(dir, out=[]) {
  for (const e of readdirSync(dir, {withFileTypes:true})) {
    if (e.name.startsWith(".") || e.name === "__MACOSX") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (AUD.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk(WORK).filter(f => !/\.zip$/i.test(f));
if (!files.length) { console.error("Unzipped, but found no audio files. Check the zip."); process.exit(1); }

/* the game folder is the LAST directory component above the file, unless the
   file sits directly in the archive root */
const rootDepth = WORK.split("/").length;
const games = {};
for (const f of files) {
  const parts = f.split("/");
  const rel = parts.slice(rootDepth);
  const folder = rel.length > 1 ? rel[rel.length - 2] : "(loose)";
  (games[folder] ||= []).push(f);
}

/* ---- 3. probe every file ------------------------------------------------ */
console.log("\nprobing " + files.length + " files with ffprobe...");
const rows = [];
let totalBytes = 0, totalSecs = 0, probed = 0;
for (const [game, list] of Object.entries(games)) {
  for (const f of list) {
    const size = statSync(f).size;
    const info = sh(`ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,channels,sample_rate -of default=nw=1 "${f}"`);
    const get = (k) => (info.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1] || "";
    const dur = parseFloat(get("duration")) || 0;
    totalBytes += size; totalSecs += dur; probed++;
    if (probed % 25 === 0) process.stdout.write("  " + probed + "/" + files.length + "\r");
    rows.push({
      game, file: basename(f), ext: extname(f).slice(1).toLowerCase(),
      title: basename(f, extname(f)).replace(/[_-]+/g," ").replace(/\s+/g," ").trim(),
      bytes: size, mb: +mb(size), seconds: Math.round(dur),
      kbps: Math.round((parseInt(get("bit_rate"))||0)/1000),
      codec: get("codec_name"), channels: +get("channels")||0, rate: +get("sample_rate")||0,
    });
  }
}

mkdirSync("docs", {recursive:true});
writeFileSync("docs/music-intake.json", JSON.stringify({workDir: WORK, games: Object.keys(games).length, tracks: rows.length, rows}, null, 1));

/* ---- 4. the report ------------------------------------------------------ */
const byGame = Object.entries(games).map(([g,l]) => [g, l.length]).sort((a,b)=>b[1]-a[1]);
const fmt = {};
for (const r of rows) fmt[r.ext + " " + (r.kbps?r.kbps+"k":"?")] = (fmt[r.ext+" "+(r.kbps?r.kbps+"k":"?")]||0)+1;

console.log("\n" + "=".repeat(58));
console.log("GAME FOLDERS   " + byGame.length);
console.log("TRACKS         " + rows.length);
console.log("TOTAL SIZE     " + (totalBytes/1073741824).toFixed(2) + " GB");
console.log("TOTAL RUNTIME  " + Math.round(totalSecs/60) + " min   (avg " + (totalSecs/rows.length/60).toFixed(1) + " min/track)");
console.log("\nFORMATS");
for (const [k,v] of Object.entries(fmt).sort((a,b)=>b[1]-a[1])) console.log("  " + String(v).padStart(4) + "  " + k);
console.log("\nWEB TIER if transcoded to 128k mp3: " + ((totalSecs/60)*0.96/1024).toFixed(2) + " GB");
console.log("                        at 96k mp3: " + ((totalSecs/60)*0.72/1024).toFixed(2) + " GB");
console.log("\nTRACKS PER GAME FOLDER");
for (const [g,n] of byGame) console.log("  " + String(n).padStart(3) + "  " + g);
console.log("\nwrote docs/music-intake.json  (names and numbers only, no audio)");
console.log("audio stays at " + WORK + " — off this disk, out of git.");
