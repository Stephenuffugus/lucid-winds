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
  const head = { appendChild(el) { el.parentNode = head; if (el.tagName === "SCRIPT" && /music-catalog\.js/.test(el.src)) { if (o.noCatalog) { el.onerror && el.onerror(); } else { runInNewContext(CATSRC, sb); if (o.notLive) sb.window.LW_MUSIC_CATALOG.live = false; if (o.ladder) Object.assign(sb.window.LW_MUSIC_CATALOG.ladder, o.ladder); el.onload && el.onload(); } } return el; } };
  const mk = (tag) => ({ tagName: String(tag).toUpperCase(), id: "", className: "", style: {}, textContent: "", attrs: {}, parentNode: null,
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k]; },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }, appendChild(c) { c.parentNode = this; return c; },
    getBoundingClientRect() { return { top: 12, height: 40, left: 100, width: 175 }; } });
  const doc = { hidden: false, readyState: o.readyState || "complete", body: o.noBody ? null : body, head, documentElement: {},
    createElement: mk, getElementById: (id) => body.children.find(c => c.id === id) || null,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); }, removeEventListener() {}, querySelectorAll: () => [] };
  const spies = { raf: 0, audio: 0, actx: 0, fold: 0, errors: 0 };
  class FakeDate extends Date { constructor(...a) { a.length ? super(...a) : super(REAL + dayOffset * 86400000); } static now() { return REAL + dayOffset * 86400000; } }
  const win = { document: doc, localStorage: ls, location: { pathname: o.pathname || "/satellites/deepwell/", search: o.search || "" },
    setInterval(fn, ms) { const id = tid++; timers.push({ id, fn, ms, kind: "i" }); return id; }, clearInterval(id) { const i = timers.findIndex(x => x.id === id); if (i >= 0) timers.splice(i, 1); },
    setTimeout(fn, ms) { const id = tid++; timers.push({ id, fn, ms, kind: "t" }); return id; }, clearTimeout(id) { const i = timers.findIndex(x => x.id === id); if (i >= 0) timers.splice(i, 1); },
    requestAnimationFrame() { spies.raf++; return 1; }, Audio: function () { spies.audio++; }, AudioContext: function () { spies.actx++; }, webkitAudioContext: function () { spies.actx++; },
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
  };
  return h;
}
const has = (h, id) => h.ledger().some(e => e.id === id);
const entry = (h, id) => h.ledger().find(e => e.id === id);

/* ---------- source-level "never" (LAW: never plays audio; ES5; no rAF) ---------- */
t("source: never constructs Audio / AudioContext / <audio> / .play(", !/new\s+Audio\b|AudioContext|<audio|\.play\s*\(/.test(SRC));
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
  t("no toast BEFORE the first interaction (the grant is already in the ledger)", !h.toast());
  h.fire("pointerdown");
  const toast = h.toast();
  t("toast present with the song title, no dashes", toast && /♫ New song: Shaft Song/.test(toast.textContent) && !/[-–—]/.test(toast.textContent));
  t("toast is inert: pointer-events none, fixed, top", toast && toast.style.pointerEvents === "none" && toast.style.position === "fixed");
  t("toast is the only element the module added to body", h.doc.body.children.every(c => c.id === "sws-music-toast"));
  h.advance(3500);
  t("toast removes itself within 3.5s", !h.toast());
  t("no rAF, no Audio, no AudioContext at runtime", h.spies.raf === 0 && h.spies.audio === 0 && h.spies.actx === 0);
  t("no console.error", h.spies.errors === 0); }

/* rung 1 by ticks, visibility, sessions */
{ const h = browser(); h.load(); h.fire("pointerdown"); h.advance(3500);
  t("tick is a 5s interval, exactly one", h.timers.filter(x => x.kind === "i").length === 1 && h.timers.find(x => x.kind === "i").ms === 5000);
  h.advance(55000); t("55s visible: secs 55, sessions still 0", h.progress().deepwell.secs === 55 && h.progress().deepwell.sessions === 0);
  h.advance(5000);  t("60s visible: sessions becomes 1, once", h.progress().deepwell.sessions === 1);
  h.advance(60000); t("120s: rung 1 unlocked by ticks (track 2), sessions still 1", has(h, "m-deepwell-deep-water") && h.progress().deepwell.sessions === 1);
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
  t("catalog.ladder.secsPer=60: track 2 opens at 60s instead of 120s", has(h, "m-deepwell-deep-water")); }
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
{ const h = browser(); h.store.set("sws_game_unlocks", JSON.stringify([{ id: "m-deepwell-shaft-song", title: "Old", artist: "Stephen", src: "/old/path.mp3", game: "Old Shelf" }, { id: "jimothy-x", title: "Keep", artist: "Stephen", src: "/keep.mp3", game: "Jimothy" }])); h.load();
  const e = entry(h, "m-deepwell-shaft-song"), k = entry(h, "jimothy-x");
  t("stale ledger entry refreshed from catalog: title, src, game", e && e.title === "Shaft Song" && e.src === "/music/v1/deepwell/shaft-song.mp3" && e.game === "Deepwell");
  t("entry not in catalog left exactly as it was", k && k.title === "Keep" && k.src === "/keep.mp3" && k.game === "Jimothy");
  h.fire("pointerdown");
  t("no toast for an entry that was already in the ledger", !h.toast() || !/Shaft Song/.test(h.toast().textContent)); }

{ const h = browser(); h.load(); h.fire("keydown");
  t("a key press also opens the toast gate", !!h.toast()); }
{ const h = browser(); h.load(); h.fire("pointerdown"); h.fire("pointerdown");
  t("interaction listeners are removed after the first (second event does not re-show)", h.doc.body.children.filter(c => c.id === "sws-music-toast").length === 1); }

/* Tier 1 hook, reduced motion, no body */
{ const h = browser(); const m = h.load(); h.fire("pointerdown"); h.advance(3500); m.unlock("deepwell", "m-deepwell-echo-chamber");
  t("unlock(shelf, id): Tier 1 hook grants an arbitrary catalog track and toasts", has(h, "m-deepwell-echo-chamber") && h.toast() && /Echo Chamber/.test(h.toast().textContent));
  const n = h.ledger().length; m.unlock("deepwell", "m-deepwell-not-a-track");
  t("unlock() with an unknown id is a no-op", h.ledger().length === n); }
{ const h = browser({ reducedMotion: true }); h.load(); h.fire("pointerdown"); const toast = h.toast();
  t("prefers-reduced-motion: no transition/animation on the toast", toast && !toast.style.transition && !toast.style.animation); }
{ const h = browser({ noBody: true }); let threw = false; try { h.load(); h.advance(5000); } catch (e) { threw = true; }
  t("no document.body: still grants, never throws", !threw && has(h, "m-deepwell-shaft-song")); }

done();
