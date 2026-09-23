// THE DRAWER'S FILTERS (DESIGN 9.2; DESIGN-T2 4.3: "the Drawer needs to be searchable at 103 socks: large tap
// filters by pack and by found lately; it remembers where she was. One thumb, no typing"). Pure, so Node can hold
// the rules; src/screens.js draws them.
import { decode } from '../engine/sockgen.js';
import { SILHOUETTES } from './silhouettes.js';

// "found lately" is the last this many designs she folded away, whenever that was: a player back after two weeks
// still has something under it, which "the last seven days" would not give her
export const LATELY = 24;

// the Drawer's entries, newest first, narrowed by the filters.
//   f: { show: 'all'|'lately'|'hero'|'odd', sil: 'all'|'<silhouette index>', family: 'all'|<family>, pack: 'all'|<pack id> }
export function drawerList(drawer, f, heroById) {
  const entries = drawer.slice().sort((a, b) => (b.foundAt || 0) - (a.foundAt || 0));
  const lately = new Set(entries.slice(0, LATELY));
  return entries.filter((d) => {
    if (f.show === 'lately' && !lately.has(d)) return false;
    if (f.show === 'hero' && !d.heroId) return false;
    if (f.show === 'odd' && !d.odd) return false;
    const hero = d.heroId ? heroById(d.heroId) : null;
    // the pack row only exists under Heroes, so it only narrows there: a pack chosen once never hides the rest
    if (f.show === 'hero' && f.pack && f.pack !== 'all' && (!hero || hero.pack !== f.pack)) return false;
    const sp = decode(d.heroId ? 'hero:' + d.heroId : d.sockSeed);
    const sil = hero ? String(SILHOUETTES.findIndex((x) => x.key === hero.silhouette)) : String(sp.silhouette);
    if (f.sil !== 'all' && sil !== f.sil) return false;
    // heroes have no pattern family, and under Heroes the pattern row is not shown, so it does not apply there
    if (f.show !== 'hero' && f.family !== 'all' && (hero || sp.family !== f.family)) return false;
    return true;
  });
}

// the packs she has hero socks from, in catalogue order, with how many of each are in her Drawer
export function drawerPacks(drawer, heroById, packs) {
  const n = new Map();
  for (const d of drawer) { const h = d.heroId ? heroById(d.heroId) : null; if (h) n.set(h.pack, (n.get(h.pack) || 0) + 1); }
  return (packs || []).filter((p) => n.has(p.id)).map((p) => ({ id: p.id, name: p.name, n: n.get(p.id) }));
}
