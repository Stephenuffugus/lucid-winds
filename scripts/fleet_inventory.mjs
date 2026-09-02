/* FLEET INVENTORY — the evidence base for the untested-games audit.
   node scripts/fleet_inventory.mjs            prints a table
   node scripts/fleet_inventory.mjs --json     writes docs/fleet-inventory.json

   ⛔ Reads the catalog through scripts/catalog.mjs (the one counter) so the
   game list can never disagree with the portal. Everything else here is a
   STATIC signal: file sizes, greps, git dates. No browser, no agents, no
   guessing. A static signal cannot tell you a game is FUN; it can tell you
   which games have no test, no sound, no exit and no save, which is where the
   rot is. Boot-checking is a separate, slower pass.
*/
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { catalog } from "./catalog.mjs";

const sh = (c) => { try { return execSync(c, {encoding:"utf8", maxBuffer:64*1024*1024}).trim(); } catch { return ""; } };

/* recursive file walk, skipping the noise dirs */
const SKIP = new Set(["node_modules",".git","music-drop","dist","stage"]);
function walk(dir, out=[]) {
  let ents; try { ents = readdirSync(dir, {withFileTypes:true}); } catch { return out; }
  for (const e of ents) {
    if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const IMG = /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i;
const AUD = /\.(mp3|ogg|m4a|wav|opus)$/i;

/* read every source file once, then ask all the questions of one string */
function probe(files) {
  let src = "", srcBytes = 0, loc = 0;
  for (const f of files) {
    if (!/\.(html|js|mjs|css)$/i.test(f)) continue;
    if (/\/test\//.test(f)) continue;
    let t = ""; try { t = readFileSync(f, "utf8"); } catch { continue; }
    src += "\n" + t; srcBytes += t.length; loc += t.split("\n").length;
  }
  return { src, srcBytes, loc };
}

const count = (s, re) => (s.match(re) || []).length;

function scoreOne(name, dir, kind, extraFiles = []) {
  const files = (dir && existsSync(dir) ? walk(dir) : []).concat(extraFiles.filter(existsSync));
  const { src, srcBytes, loc } = probe(files);

  const imgs  = files.filter(f => IMG.test(f));
  const auds  = files.filter(f => AUD.test(f) && !/\/sfx\//.test(f));
  const sfx   = files.filter(f => AUD.test(f) &&  /\/sfx\//.test(f));
  const bytes = files.reduce((a,f) => { try { return a + statSync(f).size; } catch { return a; } }, 0);

  const testDir = dir ? join(dir, "test") : null;
  const testFiles = testDir && existsSync(testDir) ? walk(testDir).filter(f => /\.(mjs|js)$/.test(f)) : [];
  let asserts = 0;
  for (const f of testFiles) { try { asserts += count(readFileSync(f,"utf8"), /\b(assert|ok|eq|expect)\s*\(/g); } catch {} }

  const gitPath = dir || extraFiles[0] || "";
  const first  = gitPath ? sh(`git log --diff-filter=A --format=%ad --date=short -- "${gitPath}" | tail -1`) : "";
  const commits= gitPath ? Number(sh(`git rev-list --count HEAD -- "${gitPath}"`) || 0) : 0;

  return {
    name, dir, kind,
    loc, kb: Math.round(bytes/1024), srcKb: Math.round(srcBytes/1024),
    first, commits,
    /* TESTED? */
    tests: testFiles.length, asserts,
    audit: dir && existsSync(join(dir,"AUDIT-NOTES.md")) ? 1 : 0,
    /* SOUND? */
    ownMusic: auds.length, ownSfx: sfx.length,
    webAudio: /AudioContext/.test(src) ? 1 : 0,
    sharedPlayer: /music-player\.js|LW_TRACKS|SWSPlayer/.test(src) ? 1 : 0,
    musicUnlock: /sws_game_unlocks/.test(src) ? 1 : 0,
    muteToggle: /\b(mute|sound\s*(on|off)|SET\.music|audioOn|sfxOn)\b/i.test(src) ? 1 : 0,
    /* ART? */
    imgs: imgs.length, inlineSvg: count(src, /<svg[\s>]/gi),
    /* SHELL HYGIENE */
    exit: /(sws[- ]?exit|back-to-arcade|href=["']\/portal|href=["']\/["']|goHome|exitToPortal|↩|← *ARCADE)/i.test(src) ? 1 : 0,
    save: count(src, /localStorage\.(getItem|setItem)/g),
    /* DEBT MARKERS */
    todo: count(src, /\b(TODO|FIXME|XXX|HACK|placeholder|PLACEHOLDER|stub)\b/g),
  };
}

const c = catalog();
const rows = [];
const seen = new Set();

for (const g of c.sats) {
  if (!g.dir) continue;
  seen.add(g.dir);
  const r = scoreOne(g.name, "satellites/" + g.dir, "satellite");
  r.slug = g.dir; r.gated = g.gated ? 1 : 0; r.cat = g.cat;
  rows.push(r);
}
for (const g of c.nat) {
  const r = scoreOne(g.name, null, "native", ["play/" + g.id + ".html", "games/" + g.id + ".js"]);
  r.slug = g.id; r.gated = g.gated ? 1 : 0; r.cat = g.cat;
  rows.push(r);
}
/* satellites on disk that no card points at */
for (const d of readdirSync("satellites", {withFileTypes:true})) {
  if (!d.isDirectory() || seen.has(d.name)) continue;
  const r = scoreOne(d.name + " (UNCARDED)", "satellites/" + d.name, "satellite");
  r.slug = d.name; r.gated = 2; r.cat = "";
  rows.push(r);
}

rows.sort((a,b) => (b.first||"").localeCompare(a.first||"") || a.name.localeCompare(b.name));

if (process.argv.includes("--json")) {
  mkdirSync("docs", {recursive:true});
  writeFileSync("docs/fleet-inventory.json", JSON.stringify({generated:"static", rows}, null, 1));
  console.log("wrote docs/fleet-inventory.json  (" + rows.length + " games)");
} else {
  const pad = (s,n) => String(s).padEnd(n).slice(0,n);
  const lpad= (s,n) => String(s).padStart(n);
  console.log(pad("GAME",26)+pad("BORN",11)+lpad("LOC",7)+lpad("MB",6)+lpad("TEST",6)+lpad("ASRT",6)+lpad("MUS",5)+lpad("SFX",5)+lpad("WA",4)+lpad("IMG",5)+lpad("EXIT",5)+lpad("SAVE",5)+lpad("TODO",5)+"  GATE");
  console.log("-".repeat(112));
  for (const r of rows) {
    console.log(
      pad(r.name,26)+pad(r.first||"?",11)+lpad(r.loc,7)+lpad((r.kb/1024).toFixed(1),6)+
      lpad(r.tests||"-",6)+lpad(r.asserts||"-",6)+lpad(r.ownMusic||"-",5)+lpad(r.ownSfx||"-",5)+
      lpad(r.webAudio?"Y":"-",4)+lpad(r.imgs||"-",5)+lpad(r.exit?"Y":"·",5)+lpad(r.save||"-",5)+
      lpad(r.todo||"-",5)+"  "+(r.gated===2?"UNCARDED":r.gated?"dev":"")
    );
  }
  const n = rows.length;
  const s = (f) => rows.filter(f).length;
  console.log("\n" + "=".repeat(60));
  console.log("TOTAL GAMES                 " + n);
  console.log("with ANY automated test     " + s(r=>r.tests>0) + "   (" + Math.round(100*s(r=>r.tests>0)/n) + "%)");
  console.log("with an AUDIT-NOTES.md      " + s(r=>r.audit));
  console.log("with ANY music of their own " + s(r=>r.ownMusic>0));
  console.log("with ANY sfx of their own   " + s(r=>r.ownSfx>0));
  console.log("using WebAudio synth        " + s(r=>r.webAudio));
  console.log("wired to the shared player  " + s(r=>r.sharedPlayer));
  console.log("exporting music unlocks     " + s(r=>r.musicUnlock));
  console.log("with a mute/sound setting   " + s(r=>r.muteToggle));
  console.log("SILENT (no sfx, no WebAudio)" + s(r=>!r.ownSfx&&!r.webAudio&&!r.ownMusic));
  console.log("no visible exit affordance  " + s(r=>!r.exit));
  console.log("no localStorage save at all " + s(r=>!r.save));
  console.log("carrying TODO/placeholder   " + s(r=>r.todo>0));
}
