/* Will Bubblewrap get what it needs from this manifest, and will the icons
   survive the Play listing? Checked against the file and the actual PNGs, not
   against the manifest's own claims about them. */
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
const dir = process.argv[2] || "satellites/bandits-box";
const m = JSON.parse(readFileSync(`${dir}/manifest.webmanifest`, "utf8"));
let bad = 0;
const ok = (label, pass, note = "") => { if (!pass) bad++; console.log(` ${pass ? "ok  " : "⛔  "} ${label}${note ? "  — " + note : ""}`); };

ok("name present and under 30 chars", !!m.name && m.name.length <= 30, `"${m.name}" (${(m.name||"").length})`);
ok("short_name under 12 chars (Android launcher truncates past this)",
   !!m.short_name && m.short_name.length <= 12, `"${m.short_name}" (${(m.short_name||"").length})`);
ok("display is standalone or fullscreen", ["standalone","fullscreen"].includes(m.display), m.display);
ok("start_url inside scope", (m.start_url||"").startsWith(m.scope||"./") || m.start_url === "./", `start ${m.start_url} scope ${m.scope}`);
ok("scope confines the app to this folder", m.scope === "./",
   m.scope === "./" ? "the portal and its Stripe link are outside" : "SCOPE TOO WIDE");
ok("theme_color set (Android colours the status bar with it)", !!m.theme_color, m.theme_color);
ok("background_color set (splash screen)", !!m.background_color, m.background_color);
ok("has an id", !!m.id, m.id);

const need = { "192x192": false, "512x512": false, maskable: false };
for (const i of m.icons || []) {
  const p = `${dir}/${i.src}`;
  const there = existsSync(p);
  if (!there) { ok(`icon file exists: ${i.src}`, false); continue; }
  let dims = "?";
  try {
    const buf = readFileSync(p);
    dims = `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  } catch (e) {}
  const matches = dims === i.sizes;
  ok(`icon ${i.src} is really ${i.sizes}`, matches, `file is ${dims}`);
  if (matches) { if (need[i.sizes] !== undefined) need[i.sizes] = true; if ((i.purpose||"").includes("maskable")) need.maskable = true; }
}
ok("has a 192x192", need["192x192"]);
ok("has a 512x512 (Play requires one for the listing icon)", need["512x512"]);
ok("has a maskable icon (or Android crops the square one badly)", need.maskable);

console.log(bad ? `\n⛔ ${bad} problem(s) for Bubblewrap` : `\n✅ manifest is ready for bubblewrap init`);
process.exit(bad ? 1 : 0);
