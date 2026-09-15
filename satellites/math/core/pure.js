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
