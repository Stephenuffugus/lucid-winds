// Header (day, population chips) and the status line.
import { url } from '../art/sprites.js';
import { str, fill } from './text.js';

export function createHud({ data, status, news }) {
  const dayEl = document.getElementById('day'), countsEl = document.getElementById('counts');
  let lastCounts = '';
  const GEAR_WORDS = ['shield', 'armor', 'boots', 'amulet', 'wings', 'snorkel', 'crown'];

  // selected: a creature handle (0 for none); the info line reads it through sim.view.
  function update(sim, selected) {
    const w = sim.w, R = w.R, S = w.C.S, frac = (w.time % w.daySec) / w.daySec;
    dayEl.textContent = fill(str('ui.day'), { n: Math.floor(w.time / w.daySec) + 1, night: frac > R.nightFrac ? str('ui.night') : '' });
    const n = {};
    for (let k = 0; k < w.count; k++) { const kind = w.E.kind[w.order[k]]; n[kind] = (n[kind] || 0) + 1; }
    const sig = JSON.stringify(n);
    if (sig !== lastCounts) {
      lastCounts = sig;
      countsEl.innerHTML = '';
      for (const k of Object.keys(n)) {
        const s = document.createElement('span'), im = new Image();
        im.src = url(S[k].spr || k, S[k].over);
        im.alt = S[k].name;
        s.appendChild(im);
        s.appendChild(document.createTextNode(n[k]));
        countsEl.appendChild(s);
      }
    }
    status.sync(w);
    const e = selected ? sim.view(selected) : null;
    if (e && !e.dead) {
      const G = e.gear, sp = S[e.kind];
      const g = [G.weapon && data.weapons[G.weapon].name.toLowerCase()];
      for (const k of GEAR_WORDS) g.push(G[k] && str('gear.' + k));
      const list = g.filter(Boolean);
      const state = e.inside ? str(e.inside < 0 ? 'info.ufo' : 'info.home') : e.perch ? str('info.perch') : e.alt > 0 ? str('info.chute') : '';
      news.pin(fill(str('info.line'), {
        who: e.name ? fill(str('info.named'), { name: e.name, kind: sp.name.toLowerCase() }) : sp.name,
        days: ((w.time - e.born) / w.daySec).toFixed(1),
        hp: Math.ceil(e.hp), max: sp.hp, hunger: Math.round(e.hunger), state,
        gear: list.length ? fill(str('info.gear'), { list: list.join(str('info.listSep')) }) : '',
      }));
    } else news.unpin(); // nothing is being looked at: the news has the line back (15 A3)
  }
  return { update };
}
