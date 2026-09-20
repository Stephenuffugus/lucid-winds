// The tray: tabs, the two-row item scroller, and the pinned column (design 14 §3): the one tool state, shown as a big
// icon (tap it: back to the Hand), and Erase under it. Hand is the default; tapping the selected item again goes back to
// the Hand; switching tabs never changes the tool.
import { url, terrIcon } from '../art/sprites.js';
import { str, fill } from './text.js';

// guard: wraps a handler that touches the sim so its error cannot escape (main.js).
export function createTray({ data, status, getSim, guard = (fn) => fn, onTool = () => {} }) {
  const tabsEl = document.getElementById('tabs'), itemsEl = document.getElementById('items');
  const hint = (a, b) => str('hint.' + a) || str('hint.' + b);
  // A toggle's state (design 14 §6): the world's setting, as the value its `states` list uses.
  const GENTLE = ['off', 'humans', 'everyone'];
  const stateOf = (p) => {
    const sim = getSim(), w = sim && sim.w;
    if (!w) return p.states[p.states.length - 1];
    return p.setting === 'gentle' ? GENTLE[w.gentle] : !!w[p.setting];
  };
  const stateWord = (p, st) => (p.setting === 'gentle' ? str('ui.gentle.' + st) : str(st ? 'ui.on' : 'ui.off'));
  const toggleName = (p) => fill(str('ui.' + p.setting), { state: stateWord(p, stateOf(p)) });

  // Resolve every tab's items to {id, name, icon} once.
  const src = {
    terrain: (k) => ({ id: k, name: data.terrain[k].name, icon: () => terrIcon(k, data.terrain[k].cols) }),
    creatures: (k) => { const s = data.creatures[k]; return { id: k, name: s.name, icon: () => url(s.spr || k, s.over) }; },
    weapons: (k) => { const s = data.weapons[k]; return { id: k, name: s.name, icon: () => url(s.spr, s.over) }; },
    gear: (k) => { const g = data.gear.find((g) => g.id === k); return { id: k, name: g.name, icon: () => url(g.spr, g.over) }; },
    buildings: (k) => { const s = data.buildings[k]; return { id: k, name: s.name, icon: () => url(s.spr, s.over) }; },
    // The village's two tools (14 §7 item 13): permission painted, and permission taken back.
    village: (k) => ({ id: k, name: str('village.' + k), icon: () => url('ui_' + k) }),
    powers: (k) => {
      const p = data.powers[k];
      if (p.use === 'toggle') return { id: k, name: p.name, use: p.use, p, icon: () => url(p.icons[String(stateOf(p))]) }; // the picture is the state
      return { id: k, name: p.name, use: p.use, icon: () => url(p.icon, p.iconOver) };
    },
  };
  // Tabs (design 14 §7 T7): each opens on its shelf of up to 12 items, with an Everything tile for the rest. Every item knows
  // its own tab (cat), so the ★ and Recent tabs can hold items of any tab.
  const CATS = data.tray.tabs.map((t) => ({ id: t.id, name: str('tab.' + t.id), shelf: t.shelf || null, items: t.items.map((k) => ({ ...src[t.source](k), cat: t.id })) }));
  const byKey = new Map(CATS.flatMap((c) => c.items.map((i) => [i.cat + ':' + i.id, i])));
  // ★ (hold an item to star it) and Recent (the last items taken up), per device; each tab shows only once it has something.
  const MEM = 'tw_tray', U = data.ui;
  let fav = new Set(), recent = [];
  try { const m = JSON.parse(localStorage.getItem(MEM) || '{}'); fav = new Set((m.fav || []).filter((k) => byKey.has(k))); recent = (m.recent || []).filter((k) => byKey.has(k)); } catch (e) { /* private mode */ }
  const remember = () => { try { localStorage.setItem(MEM, JSON.stringify({ fav: [...fav], recent })); } catch (e) { /* private mode: this session only */ } };
  const FAV = { id: 'fav', name: str('tab.fav'), list: () => [...fav].map((k) => byKey.get(k)) };
  const REC = { id: 'recent', name: str('tab.recent'), list: () => recent.map((k) => byKey.get(k)) };
  const tabs = () => [...(fav.size ? [FAV] : []), ...(recent.length ? [REC] : []), ...CATS];
  let cat = CATS.find((c) => c.id === data.tray.default.tab), expanded = false;
  const HAND = { cat: 'hand', id: 'hand' };
  let tool = HAND;
  const setTool = (t) => {
    tool = t;
    if (t.cat !== 'hand' && t.id !== 'erase') { const k = t.cat + ':' + t.id; recent = [k, ...recent.filter((x) => x !== k)].slice(0, U.recentMax); remember(); }
    refresh(); onTool(tool);
  };
  // The tool's picture and name for the pinned column.
  function toolFace() {
    if (tool.cat === 'hand') return [url('hand'), str('ui.hand')];
    if (tool.id === 'erase') return [url('erase'), str('ui.erasing')];
    const it = byKey.get(tool.cat + ':' + tool.id);
    return it ? [it.icon(), it.name] : [url('hand'), str('ui.hand')];
  }

  // hold: called after ui.starHoldMs of a still press; a scroll cancels it. The hold rebuilds the tray, so the tap that ends
  // the press lands on a new button: `swallow` (the tray's, not the button's) lets that one tap do nothing.
  let swallow = false;
  function mkItem(cls, icon, text, fn, hold = null) {
    const b = document.createElement('button');
    b.className = cls;
    const im = new Image();
    im.src = icon;
    im.alt = '';
    b.appendChild(im);
    b.appendChild(document.createTextNode(text));
    let timer = 0, at = null;
    b.addEventListener('pointerdown', () => { swallow = false; });
    if (hold) {
      const stop = () => { clearTimeout(timer); timer = 0; };
      b.addEventListener('pointerdown', (ev) => { at = [ev.clientX, ev.clientY]; stop(); timer = setTimeout(() => { timer = 0; swallow = true; hold(); }, U.starHoldMs); });
      b.addEventListener('pointermove', (ev) => { if (timer && at && Math.hypot(ev.clientX - at[0], ev.clientY - at[1]) > U.tapSlop) stop(); });
      for (const n of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(n, stop);
    }
    b.onclick = (ev) => { if (swallow) { swallow = false; return; } fn(ev); };
    return b;
  }

  function build() {
    tabsEl.innerHTML = '';
    itemsEl.innerHTML = '';
    const list = tabs();
    if (!list.includes(cat)) cat = CATS.find((c) => c.id === data.tray.default.tab); // the last star taken off while in ★
    for (const c of list) {
      const b = document.createElement('button');
      b.className = 'tab' + (c === cat ? ' on' : '') + (c === FAV ? ' star' : '');
      b.textContent = c.name;
      b.onclick = () => {
        cat = c; expanded = false;
        build();
        itemsEl.scrollLeft = 0;
      };
      tabsEl.appendChild(b);
    }
    const [face, faceName] = toolFace();
    const toolB = mkItem('item tool' + (tool.cat === 'hand' ? ' hand' : ''), face, faceName, () => {
      if (tool.cat !== 'hand') setTool(HAND);
      status.post(str('hint.hand'));
    });
    if (tool.cat !== 'hand') { const b = new Image(); b.src = url('hand'); b.alt = ''; b.className = 'badge'; toolB.appendChild(b); } // tap: back to the Hand
    toolB.setAttribute('aria-label', fill(str('ui.tool'), { name: faceName }));
    itemsEl.appendChild(toolB);
    const on = tool.id === 'erase';
    itemsEl.appendChild(mkItem('item erase' + (on ? ' on' : ''), url('erase'), str('ui.erase'), () => {
      setTool(on ? HAND : { cat: 'power', id: 'erase' });
      status.post(str(on ? 'hint.hand' : 'hint.erase'));
    }));
    const items = cat.list ? cat.list() : cat.shelf && !expanded ? cat.shelf.map((k) => byKey.get(cat.id + ':' + k)) : cat.items;
    for (const it of items) {
      const name = it.use === 'toggle' ? toggleName(it.p) : it.name, key = it.cat + ':' + it.id;
      itemsEl.appendChild(mkItem('item' + (tool.cat === it.cat && tool.id === it.id ? ' on' : '') + (fav.has(key) ? ' fav' : ''), it.icon(), name, guard(() => {
        const sim = getSim();
        if (it.use === 'toggle') { // the next of its states
          const p = it.p, i = p.states.indexOf(stateOf(p));
          if (sim) sim.command({ t: 'setting', key: p.setting, value: p.states[(i + 1) % p.states.length] });
          refresh();
          return;
        }
        if (it.use === 'instant') { if (sim) sim.command({ t: 'power', id: it.id }); return; }
        if (tool.cat === it.cat && tool.id === it.id) { setTool(HAND); status.post(str('hint.hand')); return; } // tapped again: the Hand
        setTool({ cat: it.cat, id: it.id });
        status.post(hint(it.cat, it.id));
      }), () => { // held: star it, or take its star off
        if (fav.has(key)) fav.delete(key); else fav.add(key);
        remember(); refresh();
        status.post(str(fav.has(key) ? 'hint.fav' : 'hint.unfav'));
      }));
    }
    if (cat.shelf) { // Everything / Fewer
      const t = mkItem('item more', url('ui_more'), str(expanded ? 'ui.fewer' : 'ui.everything'), () => { expanded = !expanded; refresh(); if (!expanded) itemsEl.scrollLeft = 0; });
      itemsEl.appendChild(t);
    }
  }
  // Columns at least ui.trayCol.min wide, as many whole ones as fit, and ui.trayCol.peek of the next one: a column that
  // ends exactly at the screen's edge hides that the tray scrolls (it did at 412 px, and Everything was out of sight).
  function fit() {
    const cs = getComputedStyle(itemsEl), gap = parseFloat(cs.columnGap) || 0, room = itemsEl.clientWidth - (parseFloat(cs.paddingLeft) || 0);
    if (!(room > 0)) return;
    const { min, peek } = U.trayCol, n = Math.max(1, Math.floor((room - peek * min) / (min + gap)));
    // Only write when the number actually changes, and write it on the next frame rather than inside the
    // observer's own delivery. Setting it there reflows the tray, which resizes the canvas above it, which
    // wakes the other observer in the same frame: the browser then logs "ResizeObserver loop completed with
    // undelivered notifications" (seen on the live 20260920e at 375 px, harmless but noisy, and our own
    // dev/live-look counts a console error as a failure).
    const width = ((room - n * gap) / (n + peek)).toFixed(2) + 'px';
    if (itemsEl.style.gridAutoColumns === width || fitPending) return;
    fitPending = true;
    requestAnimationFrame(() => { fitPending = false; itemsEl.style.gridAutoColumns = width; });
  }
  let fitPending = false;
  new ResizeObserver(fit).observe(itemsEl);
  function refresh() {
    const sl = itemsEl.scrollLeft;
    build();
    itemsEl.scrollLeft = sl;
  }

  return { build, get tool() { return tool; }, hand: () => setTool(HAND) };
}
