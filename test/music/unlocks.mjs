/* GATE P3 — music-unlocks.js, in node's vm with a fake browser. Every guarantee
   in HANDOFF-MUSIC section 6.8 asserted BY NAME. No real browser, no timers, no
   network: the harness owns the clock, the day, storage and the DOM, so every
   rung can be reached in milliseconds and every "never" can be spied.
   Run:  node test/music/unlocks.mjs         Exit 1 on any failure. */
import { readFileSync, existsSync } from "fs";
import { runInNewContext } from "vm";

let pass = 0, fail = 0;
const t = (name, ok, detail) => { if (ok) { pass++; console.log("  ok    " + name); } else { fail++; console.log("  FAIL  " + name + (detail ? "   <- " + detail : "")); } };
const done = () => { console.log("\nunlocks gate: " + pass + " ok, " + fail + " failed"); process.exit(fail ? 1 : 0); };

const MOD = process.env.MUSIC_MODULE || "music-unlocks.js";       // mutants.mjs points this at a mutated copy
const CAT = "/tmp/music-fixture/music-catalog.js";
t("fixture catalog exists", existsSync(CAT)); if (!existsSync(CAT)) done();
t("module file exists: " + MOD, existsSync(MOD)); if (!existsSync(MOD)) done();
const SRC = readFileSync(MOD, "utf8"), CATSRC = readFileSync(CAT, "utf8");

/* ---------- the fake browser ---------- */
function browser(o = {}) {
  const REAL = Date.now(); let dayOffset = 0;
  const store = new Map();
  const ls = o.throwing ? new Proxy({}, { get() { return () => { throw new Error("SecurityError"); }; } }) : {
    getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); }, key: (i) => [...store.keys()][i] || null, get length() { return store.size; } };
  const timers = []; let tid = 1;                                     // {id, fn, ms, kind}
  const listeners = {};
  const body = { children: [], appendChild(el) { el.parentNode = body; body.children.push(el); return el; }, removeChild(el) { body.children = body.children.filter(c => c !== el); el.parentNode = null; } };
  const head = { appendChild(el) { el.parentNode = head;
    if (el.tagName === "STYLE") { spies.styles++; return el; }
    if (el.tagName !== "SCRIPT") return el;
    if (/music-catalog\.js/.test(el.src)) { if (o.noCatalog) { el.onerror && el.onerror(); } else { runInNewContext(CATSRC, sb); if (o.notLive) sb.window.LW_MUSIC_CATALOG.live = false; if (o.ladder) Object.assign(sb.window.LW_MUSIC_CATALOG.ladder, o.ladder); el.onload && el.onload(); } return el; }
    /* the shared manifest: fold the ledger into LW_TRACKS the way music-tracks.js does (ids, same array reference) */
    if (/music-tracks\.js/.test(el.src)) { spies.tracksLoads++; sb.LW_TRACKS = JSON.parse(store.get("sws_game_unlocks") || "[]").map(e => ({ id: e.id, title: e.title, cat: e.game, src: e.src })); sb.LW_TRACK_CATS = []; sb.LW_FOLD_GAME_UNLOCKS = function () { spies.fold++; const have = {}; sb.LW_TRACKS.forEach(t => have[t.id] = 1); JSON.parse(store.get("sws_game_unlocks") || "[]").forEach(e => { if (!have[e.id]) sb.LW_TRACKS.push({ id: e.id, title: e.title, cat: e.game, src: e.src }); }); }; el.onload && el.onload(); return el; }
    /* the shared player: init once, expose the control API, remember what was played and opened */
    if (/music-player\.js/.test(el.src)) { spies.playerLoads++; sb.SWSPlayer = { init(cfg) { if (sb.SWS_MUSIC) return sb.SWS_MUSIC; spies.initButton = cfg && cfg.button; sb.SWS_MUSIC = { play(i) { spies.played.push(i); }, open() { spies.opened++; }, close() {}, pause() {}, resume() {} }; return sb.SWS_MUSIC; } }; el.onload && el.onload(); return el; }
    return el; } };
  const mk = (tag) => { const el = { tagName: String(tag).toUpperCase(), id: "", className: "", style: {}, _text: "", attrs: {}, parentNode: null, children: [], listeners: {},
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k]; },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }, removeChild(c) { this.children = this.children.filter(x => x !== c); c.parentNode = null; },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }, click() { (this.listeners.click || []).forEach(f => f({ preventDefault() {}, stopPropagation() {} })); },
    querySelector(sel) { const m = /^#([\w-]+)$/.exec(sel); const walk = (n) => { for (const c of n.children) { if (m && c.id === m[1]) return c; const r = walk(c); if (r) return r; } return null; }; return walk(this); },
    getBoundingClientRect() { return { top: 12, height: 40, left: 100, width: 175 }; } };
    Object.defineProperty(el, "textContent", { get() { return this._text + this.children.map(c => c.textContent).join(""); }, set(v) { this._text = String(v); this.children = []; } });
    return el; };
  const findId = (n, id) => { for (const c of n.children) { if (c.id === id) return c; const r = findId(c, id); if (r) return r; } return null; };
  if (o.shellButton) body.children.push(Object.assign(mk("button"), { id: "shell-music-btn" }));
  const doc = { hidden: false, readyState: o.readyState || "complete", body: o.noBody ? null : body, head, documentElement: {},
    createElement: mk, getElementById: (id) => findId(body, id), elementsFromPoint: () => [body], elementFromPoint: () => body,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); }, removeEventListener() {}, querySelectorAll: () => [], dispatchEvent(ev) { spies.events.push({ type: ev.type, detail: ev.detail }); return true; } };
  const spies = { raf: 0, audio: 0, actx: 0, fold: 0, errors: 0, styles: 0, tracksLoads: 0, playerLoads: 0, played: [], opened: 0, initButton: null, events: [] };
  class FakeDate extends Date { constructor(...a) { a.length ? super(...a) : super(REAL + dayOffset * 86400000); } static now() { return REAL + dayOffset * 86400000; } }
  const win = { document: doc, localStorage: ls, location: { pathname: o.pathname || "/satellites/deepwell/", search: o.search || "" }, innerWidth: 375, innerHeight: 667, getComputedStyle: () => ({ backgroundImage: "none", backgroundColor: "transparent" }),
    setInterval(fn, ms) { const id = tid++; timers.push({ id, fn, ms, kind: "i" }); return id; }, clearInterval(id) { const i = timers.findIndex(x => x.id === id); if (i >= 0) timers.splice(i, 1); },
    setTimeout(fn, ms) { const id = tid++; timers.push({ id, fn, ms, kind: "t" }); return id; }, clearTimeout(id) { const i = timers.findIndex(x => x.id === id); if (i >= 0) timers.splice(i, 1); },
    requestAnimationFrame() { spies.raf++; return 1; }, CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; }, Audio: function () { spies.audio++; }, AudioContext: function () { spies.actx++; }, webkitAudioContext: function () { spies.actx++; },
    matchMedia: () => ({ matches: !!o.reducedMotion }), addEventListener(type, fn) { (listeners[type] ||= []).push(fn); }, removeEventListener() {},
    LW_FOLD_GAME_UNLOCKS() { spies.fold++; }, Date: FakeDate, JSON, Math, String, Number, Array, Object, Error, parseInt, parseFloat, isNaN, encodeURIComponent,
    console: { log() {}, debug() {}, warn() {}, error() { spies.errors++; } } };
  if (o.LW_PLAY) win.LW_PLAY = o.LW_PLAY;
  win.window = win; win.self = win; win.top = win;
  const sb = runInNewContext("this", {}); Object.assign(sb, win); sb.window = sb; sb.self = sb; sb.top = sb; sb.globalThis = sb;
  if (o.catalogInline) { runInNewContext(CATSRC, sb); if (o.notLive) sb.LW_MUSIC_CATALOG.live = false; }
  const h = {
    sb, spies, store, doc, timers,
    load() { runInNewContext(SRC, sb, { filename: MOD }); return sb.SWSMusic; },
    fire(type, ev) { for (const f of listeners[type] || []) f(ev || {}); },
    /* advance time: run every interval whose period divides ms, and every due timeout, once per period */
    advance(ms) { for (const tm of [...timers]) { if (tm.kind === "t" && tm.ms <= ms) { this.sb.clearTimeout(tm.id); tm.fn(); } else if (tm.kind === "i") { for (let k = 0; k < Math.floor(ms / tm.ms); k++) tm.fn(); } } },
    day(n) { dayOffset = n; },
    ledger() { try { return JSON.parse(store.get("sws_game_unlocks") || "[]"); } catch { return []; } },
    progress() { try { return JSON.parse(store.get("sws_music_progress") || "{}"); } catch { return {}; } },
    toast() { return body.children.find(c => c.id === "sws-music-toast") || null; },
    card() { return body.children.find(c => c.id === "sws-music-card") || null; },
    chip() { return body.children.find(c => c.id === "sws-music-chip") || null; },
    pending() { try { return JSON.parse(store.get("sws_music_pending_reveal") || "[]"); } catch { return []; } },
    press(id) { const el = findId(body, id); if (!el) return false; el.click(); return true; },
    find(id) { return findId(body, id); },
  };
  return h;
}
const has = (h, id) => h.ledger().some(e => e.id === id);
const entry = (h, id) => h.ledger().find(e => e.id === id);

/* ---------- source-level "never" (LAW: never plays audio; ES5; no rAF) ---------- */
t("source: never constructs Audio / AudioContext / <audio>, and the only .play( is the shared player's api.play(", !/new\s+Audio\b|AudioContext|<audio|(?<!api)\.play\s*\(/.test(SRC));
t("source: never uses requestAnimationFrame", !/requestAnimationFrame/.test(SRC));
/* strip comments and string literals before scanning, or the scanner reads its own prose (the catalog.mjs lesson) */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "").replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, '""');
t("source: ES5 only in CODE (no const/let/arrow/template/class), comments and strings excluded", !/\b(const|let|class)\b|=>|`/.test(CODE));
t("source: one IIFE guarded by if (window.SWSMusic) return", /if\s*\(\s*window\.SWSMusic\s*\)\s*return/.test(SRC));

/* ---------- guarantees ---------- */
{ const h = browser(); const a = h.load(); const b = h.load();
  t("idempotent on double load: second load keeps the first instance", a === b && a && a._instance === 1); }
{ const h = browser({ noCatalog: true }); h.load(); h.advance(5000);
  t("no catalog: does nothing (no ledger, no progress, no toast, no timers)", !h.store.has("sws_game_unlocks") && !h.store.has("sws_music_progress") && !h.toast() && h.timers.length === 0); }
{ const h = browser({ notLive: true }); h.load(); h.advance(5000);
  t("live:false: does nothing", !h.store.has("sws_game_unlocks") && !h.toast() && h.timers.length === 0); }
{ const h = browser({ pathname: "/portal/" }); h.load(); h.advance(5000);
  t("no identity (/portal/): does nothing", !h.store.has("sws_game_unlocks") && !h.store.has("sws_music_progress") && h.timers.length === 0); }
{ const h = browser({ search: "?nomusic=1" }); h.load(); h.advance(5000);
  t("?nomusic=1: does nothing", !h.store.has("sws_game_unlocks") && !h.toast()); }
{ const h = browser({ throwing: true }); let threw = false; try { const m = h.load(); h.advance(5000); m.rebuild(); m.unlock("deepwell", "m-deepwell-echo-chamber"); m.boot({ id: "cribbage" }); } catch (e) { threw = true; }
  t("throwing localStorage: nothing propagates, including explicit rebuild/unlock/boot calls", !threw); }
{ const h = browser({ pathname: "/satellites/no-such-game-here/" }); h.load(); h.advance(5000);
  t("identified but no shelf in catalog: no ledger entry, no toast, no timers", !h.toast() && h.ledger().length === 0 && h.timers.length === 0); }

/* rung 0 */
{ const h = browser(); h.load();
  const e = entry(h, "m-deepwell-shaft-song");
  t("rung 0 on boot: Deepwell track 1 in the ledger by id", !!e);
  t("ledger entry shape is exactly what the fold expects", e && e.title === "Shaft Song" && e.artist === "Stephen" && e.game === "Deepwell" && e.src === "/music/v1/deepwell/shaft-song.mp3");
  t("only rung 0 so far (track 2 locked)", !has(h, "m-deepwell-deep-water"));
  const p = h.progress().deepwell;
  t("progress written: first, days=[today], sessions 0, secs 0", p && p.first && Array.isArray(p.days) && p.days.length === 1 && p.sessions === 0 && p.secs === 0);
  t("a day is a local calendar date YYYY-MM-DD, not a timestamp", p && /^\d{4}-\d{2}-\d{2}$/.test(p.days[0]));
  t("fold hook called after rebuild", h.spies.fold >= 1);
  t("no toast at boot: the boot grant is a CARD (P11)", !h.toast() && !!h.card());
  h.press("sws-music-later");                                   // the card closes; interaction is now known
  h.sb.SWSMusic.unlock("deepwell", "m-deepwell-echo-chamber");   // a deliberate grant: this one toasts
  const toast = h.toast();
  t("toast present with the song title, no dashes", toast && /♫ New song: Echo Chamber/.test(toast.textContent) && !/[-–—]/.test(toast.textContent));
  t("toast is inert: pointer-events none, fixed, top", toast && toast.style.pointerEvents === "none" && toast.style.position === "fixed");
  t("the module added nothing to body but its toast, chip and card", h.doc.body.children.every(c => ["sws-music-toast", "sws-music-chip", "sws-music-card"].includes(c.id)));
  h.advance(3500);
  t("toast removes itself within 3.5s", !h.toast());
  t("no rAF, no Audio, no AudioContext at runtime", h.spies.raf === 0 && h.spies.audio === 0 && h.spies.actx === 0);
  t("no console.error", h.spies.errors === 0); }

/* rung 1 by ticks, visibility, sessions */
{ const h = browser(); h.load(); h.press("sws-music-later"); h.advance(3500);
  t("tick is a 5s interval, exactly one", h.timers.filter(x => x.kind === "i").length === 1 && h.timers.find(x => x.kind === "i").ms === 5000);
  h.advance(55000); t("55s visible: secs 55, sessions still 0", h.progress().deepwell.secs === 55 && h.progress().deepwell.sessions === 0);
  h.advance(5000);  t("60s visible: sessions becomes 1, once", h.progress().deepwell.sessions === 1);
  h.advance(420000); t("480s: rung 1 unlocked by ticks (track 2), sessions still 1", has(h, "m-deepwell-deep-water") && h.progress().deepwell.sessions === 1);
  t("toast fired for rung 1", h.toast() && /Deep Water/.test(h.toast().textContent));
  h.doc.hidden = true; h.fire("visibilitychange");
  t("hidden: interval cleared", h.timers.filter(x => x.kind === "i").length === 0);
  const s = h.progress().deepwell.secs; h.advance(30000);
  t("hidden: secs do not accrue", h.progress().deepwell.secs === s);
  h.doc.hidden = false; h.fire("visibilitychange");
  t("visible again: interval restarted", h.timers.filter(x => x.kind === "i").length === 1);
  h.doc.hidden = true; const s2 = h.progress().deepwell.secs; h.advance(30000);   // hidden but NO event delivered (some iframes)
  t("hidden without the event: the tick itself refuses to accrue", h.progress().deepwell.secs === s2);
  h.doc.hidden = false; }

/* rung 2, 3, 4 */
/* seed with TODAY: boot adds the current day to progress, so seeding an old date silently makes every "sessions" test a second-day test too */
const TODAY = (() => { const d = new Date(), m = d.getMonth() + 1, y = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (y < 10 ? "0" : "") + y; })();
{ const h = browser(); h.load(); h.advance(3500); h.day(1); h.load = null;
  const h2 = browser(); h2.store.set("sws_music_progress", h.store.get("sws_music_progress")); h2.store.set("sws_game_unlocks", h.store.get("sws_game_unlocks")); h2.day(1); h2.load();
  t("days: a second calendar day unlocks track 2 (index 1), not track 3", h2.progress().deepwell.days.length === 2 && has(h2, "m-deepwell-deep-water") && !has(h2, "m-deepwell-deep-water-2"));
  const h3 = browser(); h3.store.set("sws_music_progress", h2.store.get("sws_music_progress")); h3.day(2); h3.load();
  t("days: a third calendar day unlocks track 3 (index 2)", h3.progress().deepwell.days.length === 3 && has(h3, "m-deepwell-deep-water-2")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ deepwell: { first: 1, days: [TODAY], sessions: 2, secs: 0 } })); h.load();
  t("sessions: sessionsBase (2) alone opens nothing past track 1", !has(h, "m-deepwell-deep-water")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ deepwell: { first: 1, days: [TODAY], sessions: 3, secs: 0 } })); h.load();
  t("sessions: 3 sessions (base+1) opens track 2", has(h, "m-deepwell-deep-water") && !has(h, "m-deepwell-deep-water-2")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ deepwell: { first: 1, days: [TODAY], sessions: 5, secs: 0 } })); h.load();
  t("sessions: 5 (base+3) opens track 4 (Echo Chamber, file-name order) and not track 5", has(h, "m-deepwell-echo-chamber") && !has(h, "m-deepwell-the-long-climb")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ deepwell: { first: 1, days: [TODAY], sessions: 8, secs: 0 } })); h.load();
  t("sessions: 8 opens track 5 (The Long Climb)", has(h, "m-deepwell-the-long-climb")); }
/* the ladder is tunable from the catalog */
{ const h = browser({ ladder: { secsPer: 60 } }); h.load(); h.fire("pointerdown"); h.advance(3500); h.advance(60000);
  t("catalog.ladder.secsPer=60: track 2 opens at 60s instead of 480s", has(h, "m-deepwell-deep-water")); }
{ const h = browser({ ladder: { secsPer: 60 } }); h.load(); h.fire("pointerdown"); h.advance(3500); h.advance(55000);
  t("catalog.ladder.secsPer=60: and not at 55s", !has(h, "m-deepwell-deep-water")); }
/* family breadth: the more card games you try, the more you unlock */
{ const h = browser({ pathname: "/play/cribbage.html" }); h.store.set("sws_music_progress", JSON.stringify({ spider: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 }, klondike: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 }, freecell: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 } })); const m = h.load(); m.boot({ id: "cribbage" });
  const ct = ["m-card-table-dealers-choice", "m-card-table-last-trick", "m-card-table-shuffle-up"];
  t("breadth: three other card games opened + this one = 4 -> all three Card Table tracks", ct.every(id => has(h, id)));
  t("breadth: this game's own progress is still fresh (secs 0, sessions 0)", h.progress().cribbage.secs === 0 && h.progress().cribbage.sessions === 0); }
{ const h = browser({ pathname: "/play/cribbage.html" }); h.store.set("sws_music_progress", JSON.stringify({ spider: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 } })); const m = h.load(); m.boot({ id: "cribbage" });
  t("breadth: one other card game opened = 2 -> Card Table tracks 1 and 2, not 3", has(h, "m-card-table-dealers-choice") && has(h, "m-card-table-last-trick") && !has(h, "m-card-table-shuffle-up")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ spider: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 }, klondike: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 }, freecell: { first: 1, days: ["2026-01-01"], sessions: 0, secs: 0 } })); h.load();
  t("breadth applies to FAMILY shelves only: Deepwell (a game shelf) ignores other games", has(h, "m-deepwell-shaft-song") && !has(h, "m-deepwell-deep-water")); }

/* families */
{ const h = browser({ pathname: "/play/cribbage.html", LW_PLAY: { id: "cribbage", name: "Cribbage" } }); const m = h.load();
  t("native without shell boot: nothing yet (URL is not /satellites/)", h.ledger().length === 0);
  m.boot({ id: "cribbage", name: "Cribbage" });
  t("boot({id}) from the shell identifies a native", has(h, "m-card-table-dealers-choice") || has(h, "m-card-table-last-trick") || has(h, "m-card-table-shuffle-up"));
  t("a card game with no shelf of its own unlocks Card Table track 1 only", h.ledger().length === 1 && h.ledger()[0].game === "Card Table"); }
{ const h = browser({ pathname: "/satellites/tarot-run/" }); h.load();
  t("a card game WITH its own shelf unlocks both: tarot-run track 1 and Card Table track 1", has(h, "m-tarot-run-cups") && h.ledger().some(e => e.game === "Card Table")); }
{ const h = browser({ pathname: "/satellites/deepwell/", readyState: "loading" }); const m = h.load();
  m.boot({ id: "cribbage", name: "Cribbage" }); h.fire("DOMContentLoaded");
  t("explicit boot({id}) wins over the URL", h.ledger().every(e => e.game === "Card Table") && h.ledger().length === 1); }

/* idempotency, two tabs, backfill, refresh */
{ const h = browser(); const m = h.load(); h.advance(3500); const one = h.store.get("sws_game_unlocks");
  for (let i = 0; i < 100; i++) m.rebuild();
  t("rebuild 100x: ledger byte-identical after run 1", h.store.get("sws_game_unlocks") === one); }
{ const h = browser(); const m = h.load();
  const other = h.ledger(); other.push({ id: "jimothy-x", title: "Keep", artist: "Stephen", src: "/keep.mp3", game: "Jimothy" }); h.store.set("sws_game_unlocks", JSON.stringify(other));
  m.rebuild();
  t("another tab's entry written between reads survives rebuild (merge, never clobber)", has(h, "jimothy-x") && has(h, "m-deepwell-shaft-song")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ deepwell: { first: 1, days: ["2026-01-01", "2026-01-02"], sessions: 5, secs: 300 } })); h.load();
  t("wiped ledger + kept progress: boot restores tracks 1 to 4, not 5", ["shaft-song", "deep-water", "deep-water-2", "echo-chamber"].every(x => has(h, "m-deepwell-" + x)) && !has(h, "m-deepwell-the-long-climb")); }
{ const h = browser(); h.store.set("sws_music_progress", JSON.stringify({ deepwell: { first: 1, days: ["2026-01-01", "2026-01-02"], sessions: 5, secs: 300 } }));
  h.store.set("sws_music_revealed", JSON.stringify(["m-deepwell-shaft-song", "m-deepwell-deep-water", "m-deepwell-deep-water-2", "m-deepwell-echo-chamber"])); h.load(); h.advance(700);
  t("wiped ledger, songs come back as fresh, but every one was already dismissed: NO card (cloud restore must not re-congratulate)", has(h, "m-deepwell-shaft-song") && !h.card()); }
{ const h = browser(); h.store.set("sws_game_unlocks", JSON.stringify([{ id: "m-deepwell-shaft-song", title: "Old", artist: "Stephen", src: "/old/path.mp3", game: "Old Shelf" }, { id: "jimothy-x", title: "Keep", artist: "Stephen", src: "/keep.mp3", game: "Jimothy" }])); h.load();
  const e = entry(h, "m-deepwell-shaft-song"), k = entry(h, "jimothy-x");
  t("stale ledger entry refreshed from catalog: title, src, game", e && e.title === "Shaft Song" && e.src === "/music/v1/deepwell/shaft-song.mp3" && e.game === "Deepwell");
  t("entry not in catalog left exactly as it was", k && k.title === "Keep" && k.src === "/keep.mp3" && k.game === "Jimothy");
  h.press("sws-music-later"); h.fire("pointerdown");
  t("no toast and no card for an entry that was already in the ledger", (!h.toast() || !/Shaft Song/.test(h.toast().textContent)) && !h.card()); }

{ const h = browser(); h.load(); h.sb.SWSMusic.unlock("deepwell", "m-deepwell-echo-chamber");
  t("a toast queued before any interaction waits", !h.toast());
  h.fire("keydown");
  t("a key press also opens the toast gate", !!h.toast()); }
{ const h = browser(); h.load(); h.sb.SWSMusic.unlock("deepwell", "m-deepwell-echo-chamber"); h.fire("pointerdown"); h.fire("pointerdown");
  t("interaction listeners are removed after the first (second event does not re-show)", h.doc.body.children.filter(c => c.id === "sws-music-toast").length === 1); }

/* an app shelf (kind app, empty games[]) is never granted by any game */
{ const h = browser(); h.load(); h.fire("pointerdown"); h.advance(3500);
  h.sb.LW_MUSIC_CATALOG.shelves.push({ slug: "originals", name: "Originals", kind: "app", games: [], tracks: [{ id: "m-originals-x", title: "X", file: "x.mp3", seconds: 1, from: "x.mp3" }] });
  h.sb.SWSMusic.rebuild();
  t("an app shelf with empty games[] is never granted, even after rebuild", !has(h, "m-originals-x")); }

/* Tier 1 hook, reduced motion, no body */
{ const h = browser(); const m = h.load(); h.press("sws-music-later"); h.advance(3500); m.unlock("deepwell", "m-deepwell-echo-chamber");
  t("unlock(shelf, id): Tier 1 hook grants an arbitrary catalog track and toasts", has(h, "m-deepwell-echo-chamber") && h.toast() && /Echo Chamber/.test(h.toast().textContent));
  const n = h.ledger().length; m.unlock("deepwell", "m-deepwell-not-a-track");
  t("unlock() with an unknown id is a no-op", h.ledger().length === n); }
{ const h = browser({ reducedMotion: true }); h.load(); h.press("sws-music-later"); h.sb.SWSMusic.unlock("deepwell", "m-deepwell-echo-chamber"); const toast = h.toast();
  t("prefers-reduced-motion: no transition/animation on the toast", toast && !toast.style.transition && !toast.style.animation); }
{ const h = browser({ noBody: true }); let threw = false; try { h.load(); h.advance(5000); } catch (e) { threw = true; }
  t("no document.body: still grants, never throws", !threw && has(h, "m-deepwell-shaft-song")); }

/* ================= THE MOMENT (P11): the card, the chip, the pending reveal ================= */
/* the rung-0 toast at boot is REPLACED by the card; the toast is for mid-round unlocks only */
{ const h = browser(); h.load(); h.advance(700);
  const c = h.card();
  t("P11 at boot with a fresh song: the CARD is shown, before any interaction", !!c);
  t("P11 the card names the song, the shelf, and says Congratulations", c && /Congratulations/.test(c.textContent) && /Shaft Song/.test(c.textContent) && /Deepwell/.test(c.textContent));
  t("P11 the card has Listen now and Later", c && !!h.find("sws-music-listen") && !!h.find("sws-music-later"));
  t("P11 no toast at boot when the card is up", !h.toast());
  t("P11 the card is interactive (pointer-events not none) and fixed at the bottom", c && c.style.pointerEvents !== "none" && c.style.position === "fixed" && c.style.bottom === "0px");
  t("P11 no dash of any kind in the card copy", c && !/[-–—]/.test(c.textContent));
  t("P11 the card shows a glyph, not a fabricated image, when the track has no art", c && !h.find("sws-music-art"));
  h.press("sws-music-later");
  t("P11 Later closes the card and marks the song revealed (nothing pending)", !h.card() && h.pending().length === 0);
  const h2 = browser(); h2.store.set("sws_music_progress", h.store.get("sws_music_progress")); h2.store.set("sws_game_unlocks", h.store.get("sws_game_unlocks")); h2.store.set("sws_music_revealed", h.store.get("sws_music_revealed") || "[]"); h2.load(); h2.advance(700);
  t("P11 a song already revealed does not card again on the next boot", !h2.card()); }
/* Listen now: loads the shared manifest and player on demand, plays THAT track */
{ const h = browser(); h.load(); h.advance(700); h.press("sws-music-listen");
  t("P11 Listen now loads music-tracks.js then music-player.js once", h.spies.tracksLoads === 1 && h.spies.playerLoads === 1);
  const idx = h.sb.LW_TRACKS.findIndex(x => x.id === "m-deepwell-shaft-song");
  t("P11 Listen now plays the unlocked track by its index in LW_TRACKS", idx >= 0 && h.spies.played.length === 1 && h.spies.played[0] === idx);
  t("P11 Listen now before the settle delay still places the chip and inits the player with it", h.spies.initButton && h.spies.initButton.id === "sws-music-chip" && !!h.chip());
  t("P11 Listen now closes the card and marks it revealed", !h.card() && h.pending().length === 0); }
{ const h = browser({ shellButton: true }); h.load(); h.advance(700); h.press("sws-music-listen");
  t("P11 in a native shell, Listen now inits the player with the shell's own button", h.spies.initButton && h.spies.initButton.id === "shell-music-btn" && h.spies.played.length === 1); }
/* the chip: uniform, 48px, free corner, never bottom-right, opens the player; it waits ~900ms for the page to settle */
{ const h = browser(); h.load(); h.advance(700); h.press("sws-music-later");
  t("P11 the chip is NOT placed at boot (the HUD may not be drawn yet)", !h.chip());
  h.advance(1000);
  const chip = h.chip();
  t("P11 a uniform music chip is present in a game with a live catalog", !!chip);
  t("P11 the chip is 48px tall and labelled Music", chip && chip.style.height === "48px" && /Music/.test(chip.textContent) && !/[-–—]/.test(chip.textContent));
  t("P11 the chip never takes the bottom-right corner (the feedback fab's)", chip && !(/bottom/.test(chip.getAttribute("data-corner") || "") && /right/.test(chip.getAttribute("data-corner") || "")));
  chip.click();
  t("P11 tapping the chip loads the player and opens the drawer", h.spies.playerLoads === 1 && h.spies.opened === 1);
  t("P11 body gained nothing but the chip, the card, the toast", h.doc.body.children.every(c => ["sws-music-chip", "sws-music-card", "sws-music-toast"].includes(c.id))); }
{ const h = browser({ shellButton: true }); h.load(); h.advance(2000);
  t("P11 no chip when the native shell already has its music button", !h.chip()); }
{ const h = browser({ pathname: "/satellites/no-such-game-here/" }); h.load(); h.advance(2000);
  t("P11 a shelf-less game still gets the uniform chip, but no card when nothing is pending", !!h.chip() && !h.card()); }
/* mid-round: toast only, and the reveal waits for the next boot of ANY game */
{ const h = browser(); h.load(); h.advance(700); h.press("sws-music-later"); h.fire("pointerdown");
  h.advance(3500); h.advance(480000);
  t("P11 a mid-round unlock (480s) shows the toast, not the card", h.toast() && /Deep Water/.test(h.toast().textContent) && !h.card());
  t("P11 and is stored as pending, by id", h.pending().some(p => p.id === "m-deepwell-deep-water"));
  const h2 = browser({ pathname: "/satellites/no-such-game-here/" }); h2.store.set("sws_music_pending_reveal", h.store.get("sws_music_pending_reveal")); h2.store.set("sws_game_unlocks", h.store.get("sws_game_unlocks")); h2.load(); h2.advance(700);
  t("P11 the next boot of ANY game shows the card for the pending song", h2.card() && /Deep Water/.test(h2.card().textContent));
  h2.press("sws-music-later");
  t("P11 Later there clears it", h2.pending().length === 0); }
{ const h = browser(); h.load(); h.advance(700); h.press("sws-music-later"); h.fire("pointerdown"); h.advance(3500);
  const other = h.pending(); other.push({ id: "jimothy-x", title: "Keep", game: "Jimothy" }); h.store.set("sws_music_pending_reveal", JSON.stringify(other));
  h.advance(480000);
  t("P11 pending is read-modify-write: another tab's entry survives", h.pending().some(p => p.id === "jimothy-x") && h.pending().some(p => p.id === "m-deepwell-deep-water")); }
{ const h = browser(); h.load(); h.advance(700);
  t("P11 the module added exactly one style element to head", h.spies.styles === 1); }

/* ================= P12: milestones. A game reports its own breaks; a break is a rung and the moment. ================= */
{ const h = browser(); h.load(); h.advance(700); h.press("sws-music-later"); h.fire("pointerdown");
  t("P12 progress carries milestones 0 from the first write", h.progress().deepwell.milestones === 0);
  h.sb.SWSMusic.milestone(2);
  t("P12 milestone(2) with milestonePer 3 opens nothing past track 1", !has(h, "m-deepwell-deep-water") && h.progress().deepwell.milestones === 2);
  const n0 = h.spies.events.length;
  t("P12 the boot card also told the page: open, then close on Later", n0 === 2 && h.spies.events[0].detail.open === true && h.spies.events[1].detail.open === false);
  h.sb.SWSMusic.milestone(3);
  t("P12 milestone(3) opens track 2 (level 3 opens the second song)", has(h, "m-deepwell-deep-water") && !has(h, "m-deepwell-deep-water-2"));
  t("P12 a milestone is a break: the new song CARDS here, no toast; it stays pending until the card is answered", h.card() && /Deep Water/.test(h.card().textContent) && !h.toast() && h.pending().some(p => p.id === "m-deepwell-deep-water"));
  t("P12 the card says Play it now", h.find("sws-music-listen") && h.find("sws-music-listen").textContent === "Play it now");
  t("P12 the card told the page it opened (swsmusic:card open true)", h.spies.events.slice(n0).some(e => e.type === "swsmusic:card" && e.detail && e.detail.open === true));
  h.press("sws-music-later");
  t("P12 and that it closed (open false), after the open", (() => { const ev = h.spies.events.slice(n0).filter(e => e.type === "swsmusic:card"); return ev.length === 2 && ev[0].detail.open === true && ev[1].detail.open === false; })());
  t("P12 Later clears the pending entry", h.pending().length === 0);
  h.sb.SWSMusic.milestone(1);
  t("P12 the max is kept: milestone(1) after 3 stays 3", h.progress().deepwell.milestones === 3);
  h.sb.SWSMusic.milestone(); h.sb.SWSMusic.milestone(); h.sb.SWSMusic.milestone();
  t("P12 no argument counts up by one: three calls take 3 to 6 and open track 3", h.progress().deepwell.milestones === 6 && has(h, "m-deepwell-deep-water-2"));
  t("P12 no console.error", h.spies.errors === 0); }
{ const h = browser({ ladder: { milestonePer: 1 } }); h.load(); h.advance(700); h.press("sws-music-later"); h.sb.SWSMusic.milestone(1);
  t("P12 catalog.ladder.milestonePer=1: milestone(1) opens track 2", has(h, "m-deepwell-deep-water")); }
{ const h = browser({ ladder: { milestonePer: 0 } }); h.load(); h.advance(700); h.press("sws-music-later"); h.sb.SWSMusic.milestone(50);
  t("P12 milestonePer 0 disables the path (never opens everything at once)", !has(h, "m-deepwell-deep-water")); }
/* a song earned by TIME mid round stays a toast, and the next milestone is where its card lands */
{ const h = browser(); h.load(); h.advance(700); h.press("sws-music-later"); h.fire("pointerdown"); h.advance(3500); h.advance(480000);
  t("P12 time rung mid round: toast, pending, no card", h.pending().some(p => p.id === "m-deepwell-deep-water") && !h.card());
  h.advance(3500); h.sb.SWSMusic.milestone(1);
  t("P12 the next milestone (even one that opens nothing new) cards the pending song", h.card() && /Deep Water/.test(h.card().textContent) && h.pending().some(p => p.id === "m-deepwell-deep-water"));
  h.press("sws-music-later");
  t("P12 answering it clears the pending entry", h.pending().length === 0 && !h.card()); }
{ const h = browser({ noCatalog: true }); h.load();
  t("P12 milestone() with no catalog returns false and writes nothing", h.sb.SWSMusic.milestone(3) === false && !h.store.has("sws_music_progress")); }

done();
