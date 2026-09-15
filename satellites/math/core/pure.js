/* CORE, the pure half (plans/math/HANDOFF-CORE.md 3.2).
 *
 * Everything the nine games share that can be computed without a screen lives
 * here, and Node imports this very file for the gates, so a law in
 * test/pure.mjs is a law about what a Chromebook runs.
 *
 * ⛔ Nothing in this file names document, window, Date, performance,
 * Math.random or setTimeout. tools/lint.mjs refuses it. Randomness is always an
 * rng handed in, so a gate can replay any round from its seed.
 */

/* ---- rng ---- */
/* mulberry32, the fleet's stream (satellites/wardian/index.html, makeRNG). Same
   seed, same draws, in Node and in the browser. */
export function rng(seed) {
  let a = seed >>> 0;
  const r = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = n => Math.floor(r() * n);
  r.range = (lo, hi) => lo + r() * (hi - lo);
  r.state = () => a >>> 0;
  return r;
}

/* ---- store: the schema step ---- */
/* One record per game under lw:<gameId>:save, shaped { v, collect, adapt, settings }.
   The handoff's rule, kept exactly: on a version mismatch, never crash, keep the
   collectibles and discard the adaptive state, because a child losing a shelf to a
   bad migration is a real harm and a tier relearned in two rounds is not.
   ⛔ Nothing is dropped on a matching version: a whitelist merge drops the fields
   a later build adds (the fleet's save scar), so unknown keys ride along. */
const plainObject = o => !!o && typeof o === 'object' && !Array.isArray(o);
export function migrate(record, schema) {
  const fresh = schema.fresh();
  if (!plainObject(record)) return fresh;
  const settings = Object.assign({}, fresh.settings, plainObject(record.settings) ? record.settings : {});
  if (record.v === schema.v) {
    const out = Object.assign({}, fresh, record);
    out.settings = settings;
    if (!Array.isArray(out.collect)) out.collect = fresh.collect;
    if (!plainObject(out.adapt)) out.adapt = fresh.adapt;
    return out;
  }
  return Object.assign({}, fresh, {
    collect: Array.isArray(record.collect) ? record.collect.slice() : fresh.collect,
    settings: settings
  });
}

/* ---- adapt (2.3) ---- */
/* The tolerance band ladder: `up` right answers in a row climb one tier, `down`
   wrong in a row step one back, and nothing ever goes under the floor. A child at
   the floor succeeds, and the game never says so. */
export function adaptTier(history, config) {
  const top = config.tiers - 1, floor = Math.max(0, config.floor || 0);
  let tier = Math.min(top, Math.max(floor, config.start || floor)), right = 0, wrong = 0;
  for (const ok of history) {
    if (ok) {
      right++; wrong = 0;
      if (right >= config.up) { tier = Math.min(top, tier + 1); right = 0; }
    } else {
      wrong++; right = 0;
      if (wrong >= config.down) { tier = Math.max(floor, tier - 1); wrong = 0; }
    }
  }
  return tier;
}

/* Two down one up (Levitt): `down` right in a row makes it harder by one step,
   `up` wrong in a row makes it easier by one, inside [min, max]. It settles where
   two rights in a row are as likely as not, which is 70.7 percent right. The level
   is whatever the game says harder means (for a flash, a SHORTER exposure, so
   harder is a lower number). */
export function adaptStaircase(history, config) {
  const up = config.up || 1;
  let level = config.start, right = 0, wrong = 0, lastDir = 0, reversals = 0;
  for (const ok of history) {
    let dir = 0;
    if (ok) {
      right++; wrong = 0;
      if (right >= config.down) { level -= config.step; right = 0; dir = -1; }
    } else {
      wrong++; right = 0;
      if (wrong >= up) { level += config.step; wrong = 0; dir = 1; }
    }
    level = Math.min(config.max, Math.max(config.min, level));
    if (dir) { if (lastDir && dir !== lastDir) reversals++; lastDir = dir; }
  }
  return { level, reversals };
}

/* ---- adapt.classify (2.3): patterns, not scores ---- */
/* A response is { item, answer }; each rule is a function from an item to the answer
   it would give. A child is matched against each rule only on the DISCRIMINATING
   items, where the rules do not all agree, because on the rest every rule and the
   truth answer alike. Below `minItems` answers or `minDiscriminating` of those items
   nothing is said. `above` is every rule at or over the threshold, best first, and
   `code` names a rule only when it is the one above: what two rules above at once
   means (GAUGE's apparent expert) is the game's to say. Never rendered to a child. */
export function adaptClassify(responses, config) {
  const names = Object.keys(config.rules);
  const disc = responses.filter(({ item }) => {
    const first = config.rules[names[0]](item);
    return names.some(n => config.rules[n](item) !== first);
  });
  const matches = {};
  for (const n of names) {
    const hit = disc.filter(({ item, answer }) => config.rules[n](item) === answer).length;
    matches[n] = disc.length ? hit / disc.length : 0;
  }
  const enough = responses.length >= config.minItems && disc.length >= config.minDiscriminating;
  const ranked = names.slice().sort((a, b) => matches[b] - matches[a]);
  const above = enough ? ranked.filter(n => matches[n] >= config.threshold) : [];
  return {
    enough,
    matches,
    above,
    code: above.length === 1 ? above[0] : null,
    confidence: enough && ranked.length ? matches[ranked[0]] : 0
  };
}

/* ---- numberline geometry (2.4, N1) ---- */
/* The line's width and left offset change every round, so a child learns
   magnitude and not a spot on the glass. The handoff's ranges (72 to 94 percent
   wide, up to 8 percent in) can run a line 2 percent past its container, so the
   offset is capped at what is left (DECISIONS). */
export function lineGeometry(r) {
  const widthPct = 0.72 + r() * 0.22;
  return { widthPct, offsetPct: r() * Math.min(0.08, 1 - widthPct) };
}
export function fromNormalized(x, g, containerPx) { return containerPx * (g.offsetPct + x * g.widthPct); }
export function toNormalized(px, g, containerPx) { return (px / containerPx - g.offsetPct) / g.widthPct; }

/* ---- schedule (2.5, S1) ---- */
/* Called on every animation frame of a flash: hide on this frame when it is
   nearer the deadline than the next frame would be. No timer anywhere; the
   frame is the only clock a child sees. */
export function hideNow(now, deadline, interval) { return now + interval / 2 >= deadline; }

/* ---- collect (2.11) ---- */
/* One of each on the shelf. A new list every time, so a caller holding the old
   shelf never sees it change underneath it. */
export function collectOnce(shelf, item) {
  const list = Array.isArray(shelf) ? shelf.slice() : [];
  if (list.indexOf(item) < 0) list.push(item);
  return list;
}

/* ---- session (2.10) ---- */
/* The run controller, with time handed in and never read. Events are
   { type: 'start' | 'round' | 'tick', at } in milliseconds. A session ends when its
   run length is played ('done') or when the hard cap passes ('cap'), and once it has
   ended nothing changes it: a cap ends the session, it does not offer one more. */
export function sessionStep(state, event, config) {
  const st = state ? Object.assign({}, state)
    : { started: false, startedAt: 0, rounds: 0, ended: false, reason: null, endedAt: null };
  if (st.ended) return st;
  if (!st.started) { st.started = true; st.startedAt = event.at; }
  if (event.type === 'start') return st;
  if (config.capMs && event.at - st.startedAt >= config.capMs) {
    st.ended = true; st.reason = 'cap'; st.endedAt = event.at;
    return st;
  }
  if (event.type === 'round') {
    st.rounds++;
    if (config.runLength && st.rounds >= config.runLength) { st.ended = true; st.reason = 'done'; st.endedAt = event.at; }
  }
  return st;
}

/* ---- buildQuery: the other half of a teacher's link (2.9) ---- */
/* parseConfig's inverse. It carries only what differs from a key's default, in the
   schema's order, and never a value or a key the schema would refuse, so a link a
   teacher makes can only ask a game for something the game accepts. A link of
   nothing but defaults is the bare game (an empty string). */
export function buildQuery(values, schema) {
  const parts = [];
  for (const key of Object.keys(schema)) {
    const rule = schema[key], v = values ? values[key] : undefined;
    if (v === undefined || v === rule.default) continue;
    let text = null;
    if (rule.type === 'enum' && rule.values.indexOf(v) >= 0) text = v;
    else if (rule.type === 'bool' && typeof v === 'boolean') text = v ? '1' : '0';
    else if (rule.type === 'int' && Number.isInteger(v) && v >= rule.min && v <= rule.max) text = String(v);
    if (text !== null) parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(text));
  }
  return parts.length ? '?' + parts.join('&') : '';
}

/* ---- urlconfig: what a teacher's bookmark asks for ---- */
/* parse(search, schema) reads a query string against a schema of
     { key: { type: 'enum', values: [...], default } | { type: 'bool', default }
            | { type: 'int', min, max, default } }
   and returns every schema key: the asked for value when it is valid, the default
   when it is missing or wrong. Unknown keys are ignored, a bad value never throws,
   and nothing is ever read from the page's own location here: the caller hands the
   string in, so a gate can feed it a table. */
export function parseConfig(search, schema) {
  const asked = {};
  String(search || '').replace(/^\?/, '').split('&').forEach(pair => {
    if (!pair) return;
    const at = pair.indexOf('=');
    const rawKey = at < 0 ? pair : pair.slice(0, at), rawVal = at < 0 ? '' : pair.slice(at + 1);
    let k, v;
    try { k = decodeURIComponent(rawKey.replace(/\+/g, ' ')); v = decodeURIComponent(rawVal.replace(/\+/g, ' ')); }
    catch (e) { return; }
    asked[k] = v;
  });
  const out = {};
  for (const key of Object.keys(schema)) {
    const rule = schema[key], v = asked[key];
    let val = rule.default;
    if (v !== undefined) {
      if (rule.type === 'enum' && rule.values.indexOf(v) >= 0) val = v;
      else if (rule.type === 'bool' && (v === '1' || v === '0' || v === 'true' || v === 'false')) val = v === '1' || v === 'true';
      else if (rule.type === 'int' && /^-?\d+$/.test(v)) {
        const n = parseInt(v, 10);
        if (n >= rule.min && n <= rule.max) val = n;
      }
    }
    out[key] = val;
  }
  return out;
}
