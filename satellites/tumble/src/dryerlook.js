// THE DRYER'S LOOK DRIVES THE MACHINE (DESIGN-T2 6.1). Pure: no three.js, so tests/dryers.test.mjs can hold it.
//
// Before 6.1 a dryer was a colour table and two material numbers inside render.setDryerLook, keyed by the model's
// name, and what a dryer DID (bigger Loads, one sock at a time, portal Loads) was keyed by the same names in app.js.
// Now a dryer's `look` in data/unlocks.json carries every part the renderer paints, and `loads` says what it does.
// render.setDryerLook reads dryerLook(); app.js reads dryerLoads(). A look that carries only a model name still
// resolves to what that model always drew (LEGACY), so nothing a save points at can come out blank.

// what the renderer can paint on a body, and the small plates it can put on the machine
export const BODY_MAPS = ['woodgrain', 'galvanised'];
export const DECALS = ['badge', 'grille', 'display', 'coin'];

// the parts the old code never changed: a chrome ring and handle, the top slab in the body's own enamel
const BASE = {
  body: '#b0d6c4', bodyMetal: 0, bodyRough: 0.32, bodyMap: null,
  ring: '#dedbd2', ringMetal: 1, ringRough: 0.22, ringTube: 0.024, ringGlow: '#000000', ringGlowK: 0,
  strip: '#f1ead8', stripRough: 0.4,
  decal: null, radio: false,
};

// the five machines exactly as render.js drew them before 6.1 (tests/dryers.test.mjs writes the old numbers out)
const LEGACY = {
  standard: { body: '#b0d6c4', loads: 'regular' },
  avocado: { body: '#a3ad5a', strip: '#6b5a3a', loads: 'regular' },
  industrial: { body: '#c9ccce', bodyMetal: 0.75, bodyRough: 0.35, loads: 'bigger' },
  clothesline: { body: '#e7d2b4', loads: 'oneAtATime' },
  portal: { body: '#3a3f5c', bodyMetal: 0.4, strip: '#20233a', ringGlow: '#5fd3ff', ringGlowK: 1.6, loads: 'portal' },
};
const LOADS = ['regular', 'bigger', 'oneAtATime', 'portal'];

const HEX = /^#[0-9a-f]{6}$/;
const num = (v, lo, hi, d) => (typeof v === 'number' && v >= lo && v <= hi ? v : d);
const col = (v, d) => (typeof v === 'string' && HEX.test(v) ? v : d);

export function dryerLook(look) {
  const L = look || {};
  const leg = LEGACY[L.model] || (L.body ? {} : LEGACY.standard);
  const src = { ...BASE, ...leg, ...L };
  const body = col(src.body, BASE.body);
  const bodyMetal = num(src.bodyMetal, 0, 1, 0), bodyRough = num(src.bodyRough, 0, 1, BASE.bodyRough);
  return {
    body, bodyMetal, bodyRough,
    bodyMap: BODY_MAPS.includes(src.bodyMap) ? src.bodyMap : null,
    // the top slab and the front's bevel: the body's own enamel unless the look names a trim
    trim: col(src.trim, body), trimMetal: num(src.trimMetal, 0, 1, bodyMetal), trimRough: num(src.trimRough, 0, 1, bodyRough),
    ring: col(src.ring, BASE.ring), ringMetal: num(src.ringMetal, 0, 1, BASE.ringMetal), ringRough: num(src.ringRough, 0, 1, BASE.ringRough),
    ringTube: num(src.ringTube, 0.018, 0.04, BASE.ringTube),
    ringGlow: col(src.ringGlow, BASE.ringGlow), ringGlowK: num(src.ringGlowK, 0, 3, 0),
    strip: col(src.strip, BASE.strip), stripRough: num(src.stripRough, 0, 1, BASE.stripRough),
    decal: src.decal && DECALS.includes(src.decal.kind)
      ? { kind: src.decal.kind, color: col(src.decal.color, '#2b2724'), ink: col(src.decal.ink, '#f1ead8'), text: typeof src.decal.text === 'string' ? src.decal.text.slice(0, 12) : '' }
      : null,
    radio: src.radio === true,
  };
}

// HOW its heap arrives (DESIGN-T2 6.2, src/arrivals.js): out of the door, down from above (the clothesline), the
// hotel cart or the chute. Only the arrival differs: every one of them ends on the same heap.
const ARRIVAL_KINDS = ['door', 'above', 'cart', 'chute'];
export function dryerArrival(look) {
  const L = look || {};
  if (ARRIVAL_KINDS.includes(L.arrival)) return L.arrival;
  return dryerLoads(L) === 'oneAtATime' ? 'above' : 'door';
}

// what a dryer DOES: regular, bigger Loads, one sock at a time from above, or portal Loads
export function dryerLoads(look) {
  const L = look || {};
  if (LOADS.includes(L.loads)) return L.loads;
  return (LEGACY[L.model] || LEGACY.standard).loads;
}
