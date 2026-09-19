// The tray: tabs, the two-row item scroller, and the pinned eraser (prototype layout).
import { url, terrIcon } from '../art/sprites.js';
import { str, fill } from './text.js';

// guard: wraps a handler that touches the sim so its error cannot escape (main.js).
export function createTray({ data, status, getSim, guard = (fn) => fn }) {
  const tabsEl = document.getElementById('tabs'), itemsEl = document.getElementById('items');
  const hint = (a, b) => str('hint.' + a) || str('hint.' + b);
  const safeName = () => {
    const sim = getSim();
    return fill(str('ui.safe'), { state: str(!sim || sim.w.safe ? 'ui.on' : 'ui.off') });
  };

  // Resolve every tab's items to {id, name, icon} once.
  const src = {
    terrain: (k) => ({ id: k, name: data.terrain[k].name, icon: () => terrIcon(k, data.terrain[k].cols) }),
    creatures: (k) => { const s = data.creatures[k]; return { id: k, name: s.name, icon: () => url(s.spr || k, s.over) }; },
    weapons: (k) => { const s = data.weapons[k]; return { id: k, name: s.name, icon: () => url(s.spr, s.over) }; },
    gear: (k) => { const g = data.gear.find((g) => g.id === k); return { id: k, name: g.name, icon: () => url(g.spr, g.over) }; },
    buildings: (k) => { const s = data.buildings[k]; return { id: k, name: s.name, icon: () => url(s.spr, s.over) }; },
    powers: (k) => {
      const p = data.powers[k];
      return { id: k, name: p.name, use: p.use, icon: () => url(p.icon, p.iconOver) };
    },
  };
  const CATS = data.tray.tabs.map((t) => ({ id: t.id, name: str('tab.' + t.id), items: t.items.map(src[t.source]) }));
  let cat = CATS.find((c) => c.id === data.tray.default.tab);
  let tool = { cat: cat.id, id: data.tray.default.item };

  function mkItem(cls, icon, text, fn) {
    const b = document.createElement('button');
    b.className = cls;
    const im = new Image();
    im.src = icon;
    im.alt = '';
    b.appendChild(im);
    b.appendChild(document.createTextNode(text));
    b.onclick = fn;
    return b;
  }

  function build() {
    tabsEl.innerHTML = '';
    itemsEl.innerHTML = '';
    for (const c of CATS) {
      const b = document.createElement('button');
      b.className = 'tab' + (c === cat ? ' on' : '');
      b.textContent = c.name;
      b.onclick = () => {
        cat = c;
        tool = { cat: c.id, id: c.items[0].id };
        build();
        itemsEl.scrollLeft = 0;
        status.post(hint(c.id, tool.id));
      };
      tabsEl.appendChild(b);
    }
    const on = tool.id === 'erase';
    itemsEl.appendChild(mkItem('item erase' + (on ? ' on' : ''), url('erase'), str(on ? 'ui.erasing' : 'ui.erase'), () => {
      tool = on ? { cat: cat.id, id: cat.items[0].id } : { cat: 'power', id: 'erase' };
      refresh();
      status.post(on ? hint(tool.cat, tool.id) : str('hint.erase'));
    }));
    for (const it of cat.items) {
      const name = it.use === 'toggle' ? safeName() : it.name;
      itemsEl.appendChild(mkItem('item' + (tool.cat === cat.id && tool.id === it.id ? ' on' : ''), it.icon(), name, guard(() => {
        const sim = getSim();
        if (it.use === 'toggle') { if (sim) sim.command({ t: 'setting', key: 'safe', value: !sim.w.safe }); refresh(); return; }
        if (it.use === 'instant') { if (sim) sim.command({ t: 'power', id: it.id }); return; }
        tool = { cat: cat.id, id: it.id };
        refresh();
        status.post(hint(cat.id, it.id));
      })));
    }
  }
  function refresh() {
    const sl = itemsEl.scrollLeft;
    build();
    itemsEl.scrollLeft = sl;
  }

  return { build, get tool() { return tool; } };
}
