#!/usr/bin/env node
/* Mark what is actually new.

   The New tab showed every satellite, because when the rule was written the
   satellites WERE the new games. There are 113 of them now and 84 shipped in
   a single month, so New meant nothing: it was a second copy of All.

   Ship dates come from git, the date the game's index.html first appeared,
   rather than from anyone's memory. The most recent COUNT of them get new:true.
   Re-run this after shipping something.

     node scripts/tag_new.mjs            report
     node scripts/tag_new.mjs --write
*/
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const COUNT = Number(process.env.NEW_COUNT || 12);
const FILE = "portal/index.html";
let src = readFileSync(FILE, "utf8");

/* When did this game appear on the shelf? Ask git when its card first showed
   up in the portal, not when its folder appeared: fifteen of these are hosted
   on github.io and have no folder here at all, and several of those are among
   the newest things the studio has made. The card is the thing a visitor sees,
   so the card's birthday is the honest date. */
function addedOn(name) {
  try {
    const out = execSync(
      "git log -S" + JSON.stringify(name) + " --format=%as --reverse -- portal/index.html",
      { encoding: "utf8", maxBuffer: 8 << 20 }).trim();
    return out ? out.split("\n")[0] : null;
  } catch (e) { return null; }
}

const entry = /\{nm:"((?:[^"\\]|\\.)*)"[^}]*\}/g;
const blocks = [...src.matchAll(entry)].filter(m => !/hub:\s*true/.test(m[0]));

const dated = [];
for (const m of blocks) {
  const d = addedOn(m[1]);
  dated.push({ nm: m[1], date: d });
}
const withDate = dated.filter(d => d.date).sort((a, b) => (a.date < b.date ? 1 : -1));
const noDate = dated.filter(d => !d.date);

console.log(withDate.length + " cards dated from git, " + noDate.length + " undatable");
const winners = new Set(withDate.slice(0, COUNT).map(d => d.nm));
console.log("newest " + COUNT + ":");
withDate.slice(0, COUNT).forEach(d => console.log("   " + d.date + "  " + d.nm));
if (noDate.length) console.log("no date found, left alone: " + noDate.map(d => d.nm).join(", "));

if (!process.argv.includes("--write")) { console.log("\n(dry run, pass --write)"); process.exit(0); }

let added = 0, cleared = 0;
src = src.replace(entry, block => {
  if (/hub:\s*true/.test(block)) return block;
  const nm = block.match(/^\{nm:"((?:[^"\\]|\\.)*)"/)[1];
  let out = block.replace(/,\s*fresh:true/, "");
  if (out !== block) cleared++;
  if (winners.has(nm)) {
    out = out.replace(/\}$/, ", fresh:true}");
    added++;
  }
  return out;
});
writeFileSync(FILE, src);
console.log("marked " + added + " as new (cleared " + cleared + " stale marks)");
