/* Headless harness for Power Scalers.
   Loads the REAL game script out of index.html into a vm context with a
   minimal DOM, so every check below runs the shipping code, not a mirror.
   (Hand-mirrored simulators have drifted from live code twice on this
   project — see the rarity_sim lesson. Never again.) */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const GAME_PATH = path.join(HERE, "..", "index.html");

/* The game body is the LAST inline <script> block that is not the feedback fab.
   We locate it by its opening marker instead of counting tags, because a
   regex tag-counter lies the moment a string contains "</script>". */
export function extractGameScript(html) {
  const startMark = "/* Fleet earn standard";
  const si = html.indexOf(startMark);
  if (si < 0) throw new Error("harness: game script start marker not found");
  const open = html.lastIndexOf("<script>", si);
  const bodyStart = open + "<script>".length;
  const end = html.indexOf("</script>", si);
  if (end < 0) throw new Error("harness: game script end not found");
  const src = html.slice(bodyStart, end);
  if (src.length < 50000) throw new Error("harness: extracted script suspiciously short: " + src.length);
  return src;
}

function el() {
  const e = {
    innerHTML: "", textContent: "", style: {}, dataset: {},
    className: "", children: [],
    appendChild(c) { this.children.push(c); return c; },
    remove() {}, setAttribute() {}, removeAttribute() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 360 }),
    addEventListener() {}, closest: () => null,
    classList: { contains: () => false, add() {}, remove() {} },
    querySelector: () => null, querySelectorAll: () => [],
  };
  return e;
}

export function makeStore() {
  const map = new Map();
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: k => map.delete(k),
    _map: map,
  };
}

/* Boot the game in a fresh sandbox. Returns {ctx, T} where T is the internal
   binding bag exposed by the epilogue (top-level `const` is invisible to the
   vm global object, so we hand them out explicitly). */
export function boot(opts = {}) {
  const html = fs.readFileSync(GAME_PATH, "utf8");
  const src = extractGameScript(html);
  const localStorage = opts.localStorage || makeStore();
  const doc = {
    getElementById: () => el(),
    createElement: () => el(),
    querySelector: () => null,
    addEventListener: () => {},
    head: el(),
    referrer: opts.referrer || "",
  };
  const sandbox = {
    console,
    document: doc,
    localStorage,
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: cb => setTimeout(() => cb(Date.now()), 0),
    performance: { now: () => Date.now() },
    location: { search: opts.search || "", replace() {} },
    scrollTo() {}, scrollY: 0, addEventListener() {}, postMessage() {},
    history: { length: 1, back() {} },
    confirm: () => true,
    Math, Date, JSON,
  };
  sandbox.window = sandbox;
  sandbox.parent = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);

  const epilogue = `
;globalThis.__T={STAT_KEYS,RACES,POWERS,AUGMENTS,JEWELS,RARITY,TIERS,ENEMIES,TREE,
  ASCENDANCIES,ASC_BY_KEY,ASC_NODE_BY_ID,state,STARTER_AUGMENTS,STARTER_JEWELS,
  simulate,deriveCombat,computeFinal,migrateOC,loadState,persist,Store,SAVE_KEY,
  raceByKey,powerByKey,augByKey,ocGrade,ocGradeScore,xpNeeded,pointsTotal,pointsAvail,
  grantXP,battleRewards,runGauntlet,render,goto,handleAct,screenHome,screenBattle,
  screenGauntlet,screenTourney,screenSheet,screenAlliances,screenCreate,
  finalizeOC,newDraft,rollStatsData,uid,clamp,tierMult,prepEnemy,gauntletCleared,
  learnCostG,augCost,jewelCost,montageCostG,trainStatCostG,respecCost,openHelp,
  allocNode,refundNode,canRefund,rollGrade,enrichProc,hitDamage,toast,SWS_EXIT};
`;
  vm.runInContext(src + epilogue, ctx, { filename: "power-scalers.game.js" });
  return { ctx, T: ctx.__T, localStorage };
}

/* Build a plausible player character the way the game's own creation flow does,
   so the numbers below are numbers a real player can actually have. */
export function makeOC(T, opts = {}) {
  const race = opts.race || "human";
  const r = T.raceByKey(race);
  const lvl = opts.level || 1;
  const mid = opts.statRoll == null ? 40 : opts.statRoll;
  const base = {};
  for (const k of T.STAT_KEYS) base[k] = T.clamp(mid + (r.mods[k] || 0), 1, 140);
  const oc = {
    id: "t_" + Math.random().toString(36).slice(2, 8),
    name: opts.name || "Tester",
    race, emoji: r.emoji, art: "",
    baseStats: base,
    powers: opts.powers || [],
    level: lvl, xp: 0, record: { w: 0, l: 0 },
    tree: { allocated: [], jewels: {} },
    ascendancy: { key: null, allocated: [] },
  };
  return T.migrateOC(oc);
}
