// Paints sock tiles off the main thread. Messages:
//   in:  { init: masks }  once, then { id, jobs: [{ slot, seed, recipe }], mode, size }
//   out: { id, tiles: [{ slot, seed, bytes }] }   (bytes transferred)
import { decode, paint } from './sockgen.js';

let masks = null;
self.onmessage = (ev) => {
  if (ev.data.init) { masks = ev.data.init; return; }
  const { id, jobs, mode, size } = ev.data;
  const tiles = [];
  const transfer = [];
  for (const j of jobs) {
    const spec = decode(j.seed);
    const sil = j.recipe && j.recipe.silhouette !== undefined ? j.recipe.silhouette : spec.silhouette;
    const bytes = paint(spec, masks ? masks[sil] : null, { size, mode, recipe: j.recipe });
    tiles.push({ slot: j.slot, seed: j.seed, bytes });
    transfer.push(bytes.buffer);
  }
  self.postMessage({ id, tiles }, transfer);
};
