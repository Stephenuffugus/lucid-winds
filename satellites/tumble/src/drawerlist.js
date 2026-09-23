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
// `heroes` (the catalogue) is optional: with it each pack also says how many heroes it holds (`total`), so a chip can
// read "Cursed 3 of 10" (Stephen, 23 Sep: "I don't know how many socks are in each hero pack")
export function drawerPacks(drawer, heroById, packs, heroes) {
  const n = new Map();
  for (const d of drawer) { const h = d.heroId ? heroById(d.heroId) : null; if (h) n.set(h.pack, (n.get(h.pack) || 0) + 1); }
  // a pack's heroes: the ones it sells and the one that comes through the portal (Cursed); Reunion gifts are not a pack's
  const total = (id) => (heroes || []).filter((h) => h.pack === id && h.source !== 'reunion').length;
  return (packs || []).filter((p) => n.has(p.id)).map((p) => ({ id: p.id, name: p.name, n: n.get(p.id), ...(heroes ? { total: total(p.id) } : {}) }));
}

// the heroes of a pack she has NOT found yet, in catalogue order: shown in shadow under the pack's socks, so she can
// see what is still to turn up (Stephen, 23 Sep: "able to see stuff they will unlock")
export function packMissing(drawer, heroes, packId) {
  const have = new Set(drawer.filter((d) => d.heroId).map((d) => d.heroId));
  return (heroes || []).filter((h) => h.pack === packId && h.source !== 'reunion' && !have.has(h.id));
}
