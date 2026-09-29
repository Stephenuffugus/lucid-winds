// A creature as one plain object with every field, plus its slot and handle. For the UI, tools and tests.
// It allocates, so nothing else in src/sim may call it (lint-sim checks).
import { FIELDS, BOOL_FIELDS } from './ents.js';

export function view(w, i) {
  const E = w.E, o = { slot: i, h: w.slotH[i] };
  for (const f of FIELDS) o[f] = E[f][i];
  for (const f of BOOL_FIELDS) o[f] = o[f] === 1; // stored as 0/1
  return o;
}

// Every live creature, in spawn order.
export function views(w) {
  const out = [];
  for (let k = 0; k < w.count; k++) out.push(view(w, w.order[k]));
  return out;
}
