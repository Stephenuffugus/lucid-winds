/* Build GAME_CATALOG.json for the ARCADE_UX_AUDIT_PACKAGE.
   Parses the portal registry with the SAME bracket-walk vm technique as
   scripts/catalog.mjs (never regex a structure you can parse), merges
   portal/catalog-tags.json heuristic tags, and stamps real last-commit dates
   from git. Unknown = null or "unknown", never invented. */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { runInNewContext } from "vm";
import { execSync } from "child_process";

const OUT = process.argv[2] || "ARCADE_UX_AUDIT_PACKAGE/GAME_CATALOG.json";
const src = readFileSync("portal/index.html", "utf8");

function grabArray(src, decl) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error("missing " + decl);
  const start = src.indexOf("[", i);
  let depth = 0, inStr = null, k = start;
  for (; k < src.length; k++) {
    const c = src[k], prev = src[k - 1], next = src[k + 1];
    if (inStr) { if (c === inStr && prev !== "\\") inStr = null; continue; }
    if (c === "/" && next === "*") { const e = src.indexOf("*/", k + 2); k = e < 0 ? src.length : e + 1; continue; }
    if (c === "/" && next === "/") { const e = src.indexOf("\n", k + 2); k = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { k++; break; } }
  }
  return runInNewContext("(" + src.slice(start, k) + ")");
}

const FEATURED = grabArray(src, "var FEATURED =");
const GAMES = grabArray(src, "var GAMES =");
const EXT = grabArray(src.replace("var EXT = {", "var EXT = [{").replace(/stonegarden:"webp"\};/, 'stonegarden:"webp"}];'), "var EXT = ") [0] || {};

const tagsFile = JSON.parse(readFileSync("portal/catalog-tags.json", "utf8"));
const tagByName = {};
for (const g of tagsFile.games || []) tagByName[g.name.toLowerCase()] = g.tags;

function gitDate(path) {
  try {
    if (!existsSync(path)) return null;
    const d = execSync(`git log -1 --format=%cs -- "${path}"`, { encoding: "utf8" }).trim();
    return d || null;
  } catch (e) { return null; }
}

function tagVal(tags, key) {
  if (!tags || !tags[key]) return null;
  return { value: tags[key].value, confident: !!tags[key].firm };
}

const records = [];

for (const g of FEATURED) {
  if (g.hub) continue;
  const dir = (String(g.url || "").match(/^\/satellites\/([a-z0-9-]+)\//) || [])[1] || null;
  const tags = tagByName[(g.nm || "").toLowerCase()] || null;
  records.push({
    internal_id: dir || g.url || g.nm,
    public_title: g.nm,
    url: g.url,
    kind: g.url && g.url.startsWith("/satellites/") ? "satellite (iframed same-origin app)"
        : g.url && g.url.startsWith("http") ? "external site" : "internal page",
    description: g.ds || null,
    category: g.cat || null,
    icon_emoji: g.ic || null,
    thumbnail: g.thumb || null,
    status: g.beta ? "testing (dev-gated: tester key required to launch)" : "released",
    recently_shipped_badge: !!g.fresh,
    ships_own_music: !!g.ownMusic,
    favorites_support: true,
    control_method: tagVal(tags, "hands"),
    keyboard_support: "unknown",
    mouse_support: "unknown",
    touch_support: "unknown (fleet standard is mobile-first; per-game not verified here)",
    players: tagVal(tags, "company"),
    approx_session_length_minutes: tagVal(tags, "length"),
    difficulty: "unknown",
    mechanic_think_vs_reflex: tagVal(tags, "brain"),
    genre: g.cat || null,
    reading_load: tagVal(tags, "reading"),
    session_structure: tagVal(tags, "restart"),
    instructions_required: "unknown",
    high_score_support: "unknown",
    daily_challenge: "unknown",
    achievements: "unknown",
    lucid_winds_integration: "varies per game; see PORTAL_TECHNICAL_MAP.md (sunbeam earn bridge is opt-in per game)",
    analytics: "GA4 portal_game_open fires on card click; no per-game play counts stored",
    last_repo_update: dir ? gitDate("satellites/" + dir) : null
  });
}

for (const g of GAMES) {
  const [id, title, cat, desc, soon, extUrl, extThumb] = g;
  const tags = tagByName[(title || "").toLowerCase()] || null;
  const external = !!extUrl;
  records.push({
    internal_id: id,
    public_title: title,
    url: external ? extUrl : "/play/" + id + ".html",
    kind: external ? "external site (opens new tab)" : "native (/play/ shell page)",
    description: desc || null,
    category: cat || null,
    icon_emoji: null,
    thumbnail: external ? (extThumb || null)
      : "/portal-assets/screenshots/" + id + "." + (EXT[id] || "png"),
    status: soon === "soon" ? "coming soon (card shows toast, not launchable)" : "released",
    recently_shipped_badge: false,
    ships_own_music: false,
    favorites_support: true,
    control_method: tagVal(tags, "hands"),
    keyboard_support: "unknown",
    mouse_support: "unknown",
    touch_support: "unknown (fleet standard is mobile-first; per-game not verified here)",
    players: tagVal(tags, "company"),
    approx_session_length_minutes: tagVal(tags, "length"),
    difficulty: "unknown",
    mechanic_think_vs_reflex: tagVal(tags, "brain"),
    genre: cat || null,
    reading_load: tagVal(tags, "reading"),
    session_structure: tagVal(tags, "restart"),
    instructions_required: "unknown",
    high_score_support: "unknown",
    daily_challenge: "unknown",
    achievements: "unknown",
    lucid_winds_integration: external ? "none (external origin)"
      : "runs in the /play/ shell which shows the sunbeam wallet; per-game earn wiring varies",
    analytics: "GA4 portal_game_open fires on card click; no per-game play counts stored",
    last_repo_update: external ? null : gitDate("play/" + id + ".html")
  });
}

const out = {
  _meta: {
    generated: new Date().toISOString().slice(0, 10),
    source: "portal/index.html registries (FEATURED + GAMES), parsed with the same vm bracket-walk as scripts/catalog.mjs",
    counts_authority: "node scripts/catalog.mjs -> 119 satellite + 67 native = 186 carded, 162 openable by a visitor",
    tag_provenance: "control/players/length/brain/reading/restart come from portal/catalog-tags.json, an auto-generated heuristic pass; confident:false means a machine guessed and a human has not checked. That file predates the Aug 18 vendoring, so its URLs may be stale, but names match.",
    honesty: "Fields marked unknown are unknown. Nothing here is invented.",
    display_name_warning: "Public titles differ from folder slugs (e.g. stream-hop ships as Jumping Jimothy, bowergarden is Euchre). Always use public_title in player-facing copy."
  },
  games: records
};

writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log("wrote", OUT, "with", records.length, "records",
  "(", records.filter(r => r.kind.startsWith("satellite")).length, "satellite,",
  records.filter(r => r.kind.startsWith("native")).length, "native,",
  records.filter(r => r.kind.startsWith("external")).length, "external )");
