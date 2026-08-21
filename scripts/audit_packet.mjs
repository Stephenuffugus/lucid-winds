#!/usr/bin/env node
/* ONE GAME, ONE PASTE — packets for a second-opinion pass by an outside model.
     node scripts/audit_packet.mjs <slug>          one packet
     node scripts/audit_packet.mjs --batch 5       the next five, priority order
     node scripts/audit_packet.mjs --list          what is queued and why
     node scripts/audit_packet.mjs --done <slug>   mark one reviewed

   ⛔ THE BOTTLENECK IS STEPHEN. He is the transport between here and ChatGPT or
   Grok, so the only thing worth optimising is HIS clicks: one copy out, one
   paste back. Everything here is shaped around that, not around what would be
   nice to send.

   ⛔ WHAT WE DO NOT ASK THEM. Correctness. They cannot run the game, and on
   2026-08-21 a name collision in games/_cards.js blanked six solitaires' card
   backs while every file parsed and every game ran — nothing readable in the
   source said it was wrong, only a screenshot did. A model reading code will
   hand back plausible bugs that cost more to disprove than to have found here.
   ⛔ AND NOT: anything with his real name, keys, or player data.

   ⭐ WHAT THEY ARE ACTUALLY GOOD AT, and all this asks for:
     1. cold read — would you tap it, and is it obvious what you do
     2. rules clarity — does the how-to make sense to someone who has never seen it
     3. copy — anything that reads generic, AI written, or off brand
     4. store listing — does the title and blurb earn a tap in its category
     5. POLICY RISK — the highest value one. Pattern matching a listing against
        store policy is exactly what a second model is good at, and it is the
        thing that can cost a developer account. */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { runInNewContext } from "vm";
import { catalog } from "./catalog.mjs";

const STATE = "scripts/.audit_packet_state.json";
const load = () => existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { done: [] };
const save = s => writeFileSync(STATE, JSON.stringify(s, null, 1));

/* the shell's per-game directions: a goal, a how, and the controls. The single
   richest thing we have for "is this understandable cold", and it is already
   written for every native game. */
function directions() {
  const src = readFileSync("play/shell.js", "utf8");
  const i = src.indexOf("var DIRECTIONS");
  if (i < 0) return {};
  const start = src.indexOf("{", i);
  let d = 0, j = start;
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (!d) { j++; break; } } }
  try { return runInNewContext("(" + src.slice(start, j) + ")"); } catch (e) { return {}; }
}

/* ⛔ STRIP COMMENTS BEFORE SCANNING SOURCE. The first run of this flagged
   Jumping Jimothy as "shows ads" — because the file has a comment explaining
   that a host with AdMob could show one, and the stub grants the reward for
   free precisely so it never claims a video it cannot play. A false policy
   signal is worse than none: it sends Stephen off to fix something that is not
   broken, on the word of an outside model that was fed a lie by us. Same
   lesson scripts/catalog.mjs already learned the hard way. */
const decomment = h => h.replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[\s;{}()])\/\/[^\n]*/g, "$1 ");

const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ")
  .replace(/\s+/g, " ").trim();

/* Signals a store reviewer would look for. Presence, not judgement — the packet
   states what is in the file and lets the outside model weigh it. */
function policySignals(rawHtml) {
  const html = decomment(rawHtml);
  const has = re => re.test(html);
  return {
    "shows ads": has(/adsbygoogle|googlesyndication|admob|gamemonetize|gamedistribution/i),
    "takes payment": has(/stripe|checkout\.session|nowpayments|createPayment|Pi\.createPayment/i),
    "asks for an account": has(/signInWith|createUserWith|firebase\.auth|signup|sign in/i),
    "sends data off device": has(/fetch\(\s*['"`]https?:\/\/(?!localhost)/i),
    "stores data locally": has(/localStorage|indexedDB/i),
    "links off site": has(/<a[^>]+href=["']https?:\/\//i),
    "uses the camera or mic": has(/getUserMedia|MediaRecorder/i),
    "asks for location": has(/geolocation/i),
    "a random reward (loot, gacha, prize pull, crate, spin)":
      has(/loot|gacha|jackpot|slot machine|spin to win|mystery box|prize bin|binPull|randomReward|\bcrate\b|card pack/i),
    "names a real brand": has(/nintendo|pokemon|disney|marvel|minecraft|wordle|tetris/i)
  };
}

function packet(entry, dirs) {
  const slug = entry.dir || (entry.url || "").split("/").filter(Boolean).pop() || entry.name;
  const paths = [`satellites/${slug}/index.html`, `play/${slug}.html`, `games/${slug}.js`];
  const path = paths.find(existsSync);
  let html = "", title = "", desc = "";
  if (path) {
    html = readFileSync(path, "utf8");
    title = (html.match(/<title>([^<]*)<\/title>/i) || [, ""])[1].trim();
    /* ⛔ was content=["']([^"']*) — which stops at the first quote of EITHER
       kind, so "Seattle's roundest raccoon" truncated to "Seattle". Match the
       quote character that actually opened the attribute. */
    const md = html.match(/<meta[^>]+name=["']description["'][^>]+content=(["'])([\s\S]*?)\1/i);
    desc = md ? md[2].replace(/\s+/g, " ").trim() : "";
  }
  const d = dirs[slug] || {};
  const sig = policySignals(html);
  const on = Object.entries(sig).filter(([, v]) => v).map(([k]) => k);

  return `--- PACKET: ${entry.name} ---
NAME              ${entry.name}
CATEGORY          ${entry.cat || "(none set)"}
STATUS            ${entry.gated ? "dev gated, not public" : "live, anyone can open it"}
PLAY              ${entry.url || "/" + slug + "/"}

PAGE TITLE        ${title || "(none)"}
PAGE DESCRIPTION  ${desc || "(none)"}

THE GOAL          ${d.g || (entry.kind === "satellite"
    ? "(satellite: carries its own onboarding, not in the shell's directions map)"
    : "⚠ NO DIRECTIONS WRITTEN — a first time player is told nothing")}
HOW IT IS PLAYED  ${d.h || "(none)"}
CONTROLS          ${(d.c || []).join(" / ") || "(none listed)"}

WHAT A KEYWORD SCAN OF THE FILE FOUND
  ${on.length ? on.join("; ") : "none of the things it looks for"}
  ⚠ This scan is keyword based and NOT exhaustive. It missed a random-reward
  mechanic in one game because that game calls it a "Prize Bin". Treat a thing
  it did not list as UNKNOWN, not as absent, and if the description implies
  something it did not catch, say so.

FIRST WORDS A PLAYER SEES
${(strip(html).slice(0, 420) || "(could not read the file)")}
--- END PACKET ---`;
}

const PROMPT = `You are giving a second opinion on a small independent web game before it
goes on a store. You cannot run it, so do not guess at bugs or code quality —
that is covered elsewhere and wrong guesses cost us more than they are worth.

Answer only these five, briefly, in this order and this shape:

1. COLD READ — from the name, category and description alone, would you tap it?
   What do you assume it is? If that assumption is wrong, say so.
2. RULES CLARITY — after reading THE GOAL and HOW IT IS PLAYED, could you play
   it without being shown? Name the first thing that would confuse you.
3. COPY — quote anything that reads generic, machine written, or like every
   other listing in its category. Suggest a replacement in the same voice.
4. LISTING — does the title plus description earn a tap next to the other games
   in that category? If not, what is the one change with the most effect?
5. POLICY RISK — given WHAT IS IN THE FILE, flag anything that could trip
   Google Play or Apple review: undisclosed data collection, chance mechanics
   that read as gambling, a trademark in a name, missing privacy disclosure,
   anything aimed at children without the matching declarations. Say "nothing I
   can see" if that is the honest answer. Do not invent risk.

Then one line: SHIP / SHIP WITH THE COPY FIX / HOLD, and why in under 20 words.`;

/* Priority: what is going on a store soonest, then what a stranger can open,
   then the rest. Gated games are last because a reviewer cannot even see them. */
function ranked(all) {
  const FLAGSHIP = ["stream-hop", "loaf", "litter-bug", "attic", "parallel", "blackout", "deepwell"];
  return all.slice().sort((a, b) => {
    const s = e => {
      const slug = e.dir || (e.url || "").split("/").filter(Boolean).pop() || "";
      if (FLAGSHIP.includes(slug)) return 0;
      if (e.gated) return 3;
      if (!e.cat) return 2;
      return 1;
    };
    return s(a) - s(b) || a.name.localeCompare(b.name);
  });
}

const args = process.argv.slice(2);
const c = catalog();
const dirs = directions();
const st = load();
const queue = ranked(c.all).filter(e => !st.done.includes(e.name));

if (args[0] === "--list") {
  console.log(`${st.done.length} reviewed, ${queue.length} to go\n`);
  queue.slice(0, 30).forEach((e, i) => console.log(
    String(i + 1).padStart(3) + "  " + e.name.padEnd(28) + (e.gated ? "[gated] " : "        ") + (e.cat || "")));
} else if (args[0] === "--done") {
  st.done.push(...args.slice(1)); save(st);
  console.log("marked reviewed:", args.slice(1).join(", "), "|", queue.length - args.slice(1).length, "left");
} else if (args[0] === "--batch") {
  const n = +(args[1] || 5);
  console.log(PROMPT + "\n\nThere are " + n + " games below. Answer the five questions for each, separately.\n");
  queue.slice(0, n).forEach(e => console.log(packet(e, dirs) + "\n"));
} else if (args[0]) {
  const e = c.all.find(x => (x.dir === args[0]) || x.name.toLowerCase() === args.join(" ").toLowerCase()
    || (x.url || "").includes("/" + args[0] + "/"));
  if (!e) { console.error("no game matching " + args[0] + " — try --list"); process.exit(1); }
  console.log(PROMPT + "\n\n" + packet(e, dirs));
} else {
  console.log("usage: audit_packet.mjs <slug> | --batch N | --list | --done <name...>");
}
