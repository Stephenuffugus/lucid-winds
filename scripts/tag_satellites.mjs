#!/usr/bin/env node
/* Give every satellite a category.

   The arcade's category tabs only ever filtered the 67 in-repo games, because
   renderGarden sets sats = [] for anything that is not All, New, Favorites or
   In Development. So 113 games, including every flagship, could not be reached
   by any tab. This writes a cat: field onto each FEATURED entry so they can be.

   Keys are the granular ones the in-repo games already use (card, board, dice,
   pattern...) plus two the studio needed and did not have: action and party.
   Display grouping happens in the portal, not here, so regrouping later is a
   one line change rather than a re-tag.

     node scripts/tag_satellites.mjs        report what would change
     node scripts/tag_satellites.mjs --write
*/
import { readFileSync, writeFileSync } from "fs";

const CAT = {
  // action and arcade: reflex, dodge, run, land, aim
  "Tomato Man": "action", "Stop the Light": "action", "Skyshot": "action",
  "Moon Claw": "action", "Burrow Bowl": "action", "Sweet Spot": "action",
  "Skitterlings": "action", "Litter Bug": "action",
  "Super Slice 3D": "action", "Super Slice Wall Climb": "action",
  "Super Slice 3D Free Fall": "action", "Super Slice Endless Fall": "action",
  "Super Slice": "action", "Rabbit Samurai": "action", "Picnic Panic": "action",
  "Pollen Panic": "action", "Vinewinder": "action", "Vine Runner": "action",
  "Pit Bike Rally": "action", "Bloom Breaker": "action", "Pong Arena": "action",
  "Budburst": "action", "Burr Blast": "action", "Sproing": "action",
  "Petal Plunge": "action", "Bramblewick": "action", "Bubblenaut": "action",
  "Nectar Drop": "action", "Jumping Jimothy": "action", "Petal Slice": "action",
  "Blobworks": "action", "Dewball": "action", "Berry Vine": "action",
  "Cosmic Cadets": "action", "Think Fast": "action", "Flatulence Fighter": "action",
  "Tempo Grove": "action", "Sled Vine": "action", "Spore Drift": "action",
  "Nova Bloom": "action", "Orb Orchard": "action", "Frost Watch": "action",

  // puzzle: think, fit, route, solve
  "Glyph Forge": "puzzle", "Flock the World": "puzzle", "Hues": "puzzle",
  "Sunforge": "puzzle", "Pop N Lock": "puzzle", "Mouse Trap": "puzzle",
  "Garden Guard": "puzzle", "Rootbound": "puzzle", "OriVex": "puzzle",
  "Hedgerow": "puzzle", "Inkbound": "puzzle", "Hexa Hive": "puzzle",
  "No Pain, No Gain": "puzzle", "Seed Pot": "puzzle", "Dew Snip": "puzzle",
  "Tetroku": "puzzle", "Meadow Weave": "puzzle", "Plot Bloom": "puzzle",
  "Impossible Garden": "puzzle", "Star Field": "puzzle", "Line Loom": "puzzle",
  "Rule Root": "puzzle", "Pollinator Paths": "puzzle", "Root Weave": "puzzle",
  "Bridgevine": "puzzle", "Lamplighter": "puzzle", "Tinker Loft": "puzzle",
  "Acorn Drop": "puzzle", "Shell Shuffle": "pattern",

  // cards, boards and dice
  "Tarot Run": "card", "Sixfold": "card", "Dragon Philosophy": "card",
  "Bramble Court": "card", "Season Sway": "card", "Loop Warden": "card",
  "Snakes & Ladders": "board", "Garden Estates": "board", "Garden Path": "board",
  "Fence Off": "board", "Mosaic Draft": "board", "Jade Garden": "board",
  "Sprout Dice": "dice", "Seed Reel": "dice",

  // words
  "Letter Launch": "word", "Fox & Basket": "word", "Blooming Words": "word",
  "Word Lightning": "word", "Cipher Bloom": "word", "Root Groups": "word",
  "Mini Crossword": "word",

  // numbers
  "Merge & Blast": "math", "Times Table Quest": "math", "Tally": "math",

  // making things, keeping things, no fail state
  "The Attic": "creative", "LOAF": "creative", "Aura Farm": "creative",
  "Create A Critter": "creative", "Bandit's Box": "creative",
  "Wild Wardens": "creative", "HUNCH": "creative", "Flipbook": "creative",
  "Doodle Pad": "creative", "Stop Motion": "creative", "Power Scalers": "creative",
  "Petal Alchemy": "creative", "First Sprout": "creative", "Silt": "creative",

  // more than one person
  "Abduct a Chameleon": "party", "Abduct a Chameleon 3D": "party",
  "Twin Lanterns": "party", "Whack Box": "party"
};

const FILE = "portal/index.html";
let src = readFileSync(FILE, "utf8");

const entry = /\{nm:"((?:[^"\\]|\\.)*)",\s*ds:"(?:[^"\\]|\\.)*"[^}]*\}/g;
const found = [...src.matchAll(entry)].filter(m => !/hub:\s*true/.test(m[0]));
const names = found.map(m => m[1]);

const missing = names.filter(n => !CAT[n]);
const unknown = Object.keys(CAT).filter(n => !names.includes(n));
const already = found.filter(m => /\bcat:"/.test(m[0])).length;

console.log(found.length + " satellites, " + already + " already tagged");
if (missing.length) { console.log("NO CATEGORY for: " + missing.join(" | ")); }
if (unknown.length) { console.log("in the map but not on the portal: " + unknown.join(" | ")); }

const tally = {};
names.forEach(n => { const c = CAT[n]; if (c) tally[c] = (tally[c] || 0) + 1; });
console.log("would tag: " + JSON.stringify(tally));

if (!process.argv.includes("--write")) { console.log("\n(dry run, pass --write)"); process.exit(missing.length ? 1 : 0); }
if (missing.length) { console.log("\nrefusing to write with games uncategorised"); process.exit(1); }

/* insert cat: right after ds:, so the shape stays readable and diffs stay small */
let wrote = 0;
src = src.replace(entry, block => {
  if (/hub:\s*true/.test(block) || /\bcat:"/.test(block)) return block;
  const m = block.match(/^\{nm:"((?:[^"\\]|\\.)*)",\s*ds:"((?:[^"\\]|\\.)*)"/);
  if (!m) return block;
  const c = CAT[m[1]];
  if (!c) return block;
  wrote++;
  return block.replace(/^(\{nm:"(?:[^"\\]|\\.)*",\s*ds:"(?:[^"\\]|\\.)*",)/, '$1 cat:"' + c + '",');
});
writeFileSync(FILE, src);
console.log("tagged " + wrote + " satellites");
