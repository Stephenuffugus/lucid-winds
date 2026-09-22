// The Laundry Room (home = menu, DESIGN 9.1) and its screens: the Drawer (9.2), the Odd Bin and
// its lore (9.3, 9.6), the Clothesline (9.4) and the shop behind the door (9.5).

import * as THREE from 'three';
import { ICONS as I, esc } from './ui.js';
import { decode, sockName, FAMILY_NAMES, FAMILIES } from '../engine/sockgen.js';
import { SILHOUETTES } from './silhouettes.js';
import { buy, canBuy, owns, requirementMet } from './economy.js';
import { setMembers, comfortsFrom } from './finds.js';
import { buildRoom } from './room.js';

// shop swatch icons for room decor, drawn in translucent ink so they read on any colour
const INK = 'stroke="#4a3a2c" stroke-opacity=".62" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const DECOR_ICON = {
  rug: `<svg viewBox="0 0 24 24" fill="none" ${INK}><ellipse cx="12" cy="13" rx="10" ry="6.5" fill="rgba(255,255,255,.3)"/><ellipse cx="12" cy="13" rx="6" ry="3.5"/></svg>`,
  window: `<svg viewBox="0 0 24 24" fill="none" ${INK}><rect x="4.5" y="3" width="15" height="18" rx="1.5" fill="rgba(255,255,255,.45)"/><path d="M12 3v18M4.5 12h15"/></svg>`,
  frame: `<svg viewBox="0 0 24 24" fill="none" ${INK}><rect x="4" y="3" width="16" height="18" rx="1.5"/><rect x="7.5" y="6.5" width="9" height="11" fill="rgba(255,255,255,.5)"/></svg>`,
  plant: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M8 15h8l-1 6H9z" fill="rgba(255,255,255,.4)"/><path d="M12 15V9M12 11c-3-1-5-4-5-6 3 0 5 2 5 6zM12 10c2-2 5-3 6-2-1 2-3 4-6 4"/></svg>`,
  lamp: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M10 3h4l3 13H7z" fill="rgba(255,255,255,.45)"/><circle cx="12" cy="11" r="1.6"/><path d="M8 16h8l-1 5H9z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" ${INK}><rect x="4" y="5" width="16" height="15" rx="2" fill="rgba(255,255,255,.45)"/><path d="M4 9.5h16M8 3v4M16 3v4"/><circle cx="12" cy="14.5" r="2.4"/></svg>`,
  shelf: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M3 15h18"/><circle cx="7.5" cy="12" r="3" fill="rgba(255,255,255,.45)"/><circle cx="14" cy="12" r="3" fill="rgba(255,255,255,.45)"/><path d="M6 15v3M18 15v3"/></svg>`,
  cat: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M5 17c0-5 3-8 7-8s7 3 7 8H5z" fill="rgba(255,255,255,.35)"/><path d="M8 10 7 6l3 2.5M16 10l1-4-3 2.5M9.5 14h.01M14.5 14h.01"/></svg>`,
  mug: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M5 8h11v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="rgba(255,255,255,.4)"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3c0 1.5 1.5 1.5 1.5 3M12 3c0 1.5 1.5 1.5 1.5 3"/></svg>`,
  garland: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M2 7c6 6 14 6 20 0"/><circle cx="6" cy="11" r="1.8" fill="rgba(255,255,255,.7)"/><circle cx="12" cy="12.6" r="1.8" fill="rgba(255,255,255,.7)"/><circle cx="18" cy="11" r="1.8" fill="rgba(255,255,255,.7)"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" ${INK}><circle cx="12" cy="12" r="8.5" fill="rgba(255,255,255,.45)"/><path d="M12 7v5l3 2"/></svg>`,
  poster: `<svg viewBox="0 0 24 24" fill="none" ${INK}><rect x="5" y="3" width="14" height="18" rx="1" fill="rgba(255,255,255,.35)"/><circle cx="12" cy="10" r="3.2"/><path d="M8 16h8M9 18.5h6"/></svg>`,
};
const REUNION_ICON = {
  lore: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M6 3h9l4 4v14H6z" fill="rgba(255,255,255,.55)"/><path d="M9 10h7M9 13.5h7M9 17h4"/></svg>`,
  frame: DECOR_ICON.frame,
  oddEye: DECOR_ICON.lamp,
};

REUNION_ICON.impossible = `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M8 2h7v9l3 3a3.5 3.5 0 0 1-5 5l-5-5z" fill="rgba(255,255,255,.5)"/><path d="M8 5h7M19 2.5v3M17.5 4h3"/></svg>`;
REUNION_ICON.portal = `<svg viewBox="0 0 24 24" fill="none" ${INK}><circle cx="12" cy="12" r="9" fill="rgba(255,255,255,.35)"/><path d="M10.5 12a1.5 1.5 0 1 1 3 0a3 3 0 1 1-6 0a4.5 4.5 0 1 1 9 0"/></svg>`;
const RADIO_BG = { lofi: '#e6d9ef', rain: '#d3e2ee', jazz: '#f0dcc2', tv: '#dbe6d3', hold: '#f3e4ad', resonarc: '#d9d6f1' };
const RADIO_ICON = {
  lofi: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5" fill="rgba(255,255,255,.5)"/><rect x="17" y="14" width="4" height="7" rx="1.5" fill="rgba(255,255,255,.5)"/></svg>`,
  rain: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M7 14h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1A3.5 3.5 0 0 0 7 14z" fill="rgba(255,255,255,.5)"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>`,
  jazz: `<svg viewBox="0 0 24 24" fill="none" ${INK}><circle cx="12" cy="12" r="9" fill="rgba(40,30,24,.28)"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2" fill="rgba(255,255,255,.7)"/></svg>`,
  tv: `<svg viewBox="0 0 24 24" fill="none" ${INK}><rect x="3" y="7" width="18" height="12" rx="2" fill="rgba(255,255,255,.45)"/><path d="M9 3l3 4 3-4M8 22h8"/></svg>`,
  hold: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M5 4h3l2 5-2 1.5a11 11 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" fill="rgba(255,255,255,.45)"/></svg>`,
  resonarc: `<svg viewBox="0 0 24 24" fill="none" ${INK}><path d="M2 12h3l2-6 3 12 3-9 2 6 2-3h5"/></svg>`,
};
const BALL_ICON = {
  tight: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#c9a88a"/><path d="M12 7.5a4.5 4.5 0 1 0 4.5 4.5M12 10a2 2 0 1 0 2 2" stroke="#8a6a50" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  loose: '<svg viewBox="0 0 24 24"><path d="M5 13c-1-4 2-8 6-7 2-2 6-1 7 2 2 1 2 5 0 7 0 3-4 4-6 3-3 1-7-1-7-5z" fill="#c9a88a"/><path d="M8 11c2 1 4 0 6 1M9 15c2-1 4 0 5 1" stroke="#8a6a50" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
  tucked: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#c9a88a"/><path d="M4.3 10h15.4v4H4.3z" fill="#e8d6c2"/><path d="M4.3 10h15.4M4.3 14h15.4" stroke="#8a6a50" stroke-width="1.2"/></svg>',
  mom: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#c9a88a"/><path d="M12 16s-4-2.4-4-5a2 2 0 0 1 4-.8 2 2 0 0 1 4 .8c0 2.6-4 5-4 5z" fill="#e89a8c"/></svg>',
};
const TRAIL_ICON = {
  sparkle: '<svg viewBox="0 0 24 24" fill="#d9ad3c"><path d="M8 5l1.3 3.7L13 10l-3.7 1.3L8 15l-1.3-3.7L3 10l3.7-1.3z"/><path d="M17 12l.9 2.1L20 15l-2.1.9L17 18l-.9-2.1L14 15l2.1-.9z"/></svg>',
  dust: '<svg viewBox="0 0 24 24" fill="#b8a78c"><circle cx="8" cy="15" r="4"/><circle cx="13" cy="13" r="4.5"/><circle cx="17.5" cy="15.5" r="3.5"/><circle cx="5" cy="19" r="1.5" opacity=".6"/></svg>',
  hearts: '<svg viewBox="0 0 24 24" fill="#e89a8c"><path d="M8 18s-5-3-5-6.3A2.6 2.6 0 0 1 8 10.4a2.6 2.6 0 0 1 5 1.3C13 15 8 18 8 18z"/><path d="M17 11s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z"/></svg>',
};
const SLOT_NAMES = { rug: 'Rugs', window: 'Windows', frame: 'Frames', plant: 'Plants', lamp: 'Lamps', calendar: 'Calendar', shelf: 'Shelves', mug: 'Mugs', garland: 'Garlands', clock: 'Clocks', poster: 'Posters', cat: 'The cat' };

const SLOT_CAP = { rug: 1, window: 1, clock: 1, garland: 1, calendar: 1, cat: 1, frame: 4, plant: 4, poster: 3, lamp: 3, shelf: 3, mug: 5 };

export class Screens {
  constructor(app) {
    this.app = app;
    this.ui = app.ui;
    this.g = app.game;
    this.room = buildRoom(this.g.render, app);
    this.spots = this.ui.$('spots');
    this.roomOn = false;
    const tap = (id, fn) => this.ui.$(id).addEventListener('click', () => { app.audio.unlock(); app.audio.play('click'); fn(); });
    tap('dockPlay', () => app.openDryer());
    tap('dockDrawer', () => this.open('drawer'));
    tap('dockBin', () => this.open('oddbin'));
    tap('dockLine', () => this.open('clothesline'));
    tap('dockDoor', () => this.open('door'));
    this.filters = { sil: 'all', show: 'all', family: 'all' };
    this.page = 0;
    this.drawerTab = 'socks';     // socks | pockets (DESIGN-T2 2.3)
    this.doorTab = 'basket';
  }

  refresh() {
    this.room.update(this.app.save, this.app);
    if (this.roomOn) this._wallet();
  }

  // ---------- the room ----------
  showRoom(on) {
    this.roomOn = on;
    this.ui.$('roomTitle').hidden = !on;
    this.ui.$('roomWallet').hidden = !on;
    this.ui.$('dock').hidden = !on;
    this.spots.hidden = !on;
    if (on) {
      this.g.state = 'room';
      this.g.table.clear();
      this.g.render.setView('room');
      this.room.update(this.app.save, this.app);
      this._wallet();
      this._buildSpots();
      if (this.app.pendingShare) { const s = this.app.pendingShare; this.app.pendingShare = null; this.sockCard({ sockSeed: s }, true); }
    }
  }

  _wallet() {
    const e = this.app.save.economy;
    const sm = (svg) => svg.replace('<svg', '<svg style="width:26px;height:26px"');
    const cents = Math.max(0, Math.floor(e.cents || 0));
    const finds = (this.app.save.finds || []).length;
    // the glass jar on the dryer top shows the same cents as the chip does
    this.g.render.setJar && this.g.render.setJar(cents, 0);
    // the jar is always in the room, so the chip is always there, even at nothing in it (DESIGN-T2 1.5)
    this.ui.$('roomWallet').innerHTML = `<div class="chip">${sm(I.lint)}<span>${e.lint.toLocaleString()}</span><small>Lint</small></div>`
      + `<div class="chip">${sm(I.quarter)}<span>${e.quarters}</span><small>${e.quarters === 1 ? 'Quarter' : 'Quarters'}</small></div>`
      + `<div class="chip">${sm(I.jar)}<span>${cents}</span><small>${cents === 1 ? 'cent' : 'cents'}</small></div>`
      // The room CANNOT show the ledge's containers filling: at the settled room pose the whole ledge is about
      // 95 px wide and a thing in a container is a 3 px dot. Phase 1 reached the same answer for the coin jar
      // and gave it a chip; this is that answer again. It is only there once she has something.
      // the label is one short word, like the jar's "cents": phase 1 found that a wider third chip gave the
      // stack a ragged left edge, and "pocket find" put it straight back
      + (finds ? `<div class="chip">${sm(I.shelf)}<span>${finds}</span><small>found</small></div>` : '');
  }

  _buildSpots() {
    const defs = [
      // the dryer needs no tag (the big dock button says Open the dryer); its label stays for screen readers
      { id: 'dryer', label: 'Dryer, tap to play', tag: 'bare', act: () => this.app.openDryer() },
      { id: 'drawer', label: 'Drawer', act: () => this.open('drawer') },
      { id: 'radio', label: 'Radio', tag: 'top', act: () => this.open('radio') },
      { id: 'door', label: 'Door', act: () => this.open('door') },
      { id: 'bin', label: 'Odd Bin', tag: 'left', act: () => this.open('oddbin') },
      { id: 'line', label: 'Clothesline', tag: 'top', act: () => this.open('clothesline') },
      // the finds ledge only exists once something has turned up (DESIGN-T2 2.3)
      ...((this.app.save.finds || []).length ? [{ id: 'ledge', label: 'The ledge', tag: 'left', act: () => { this.drawerTab = 'pockets'; this.drawer(); } }] : []),
    ];
    this.spots.innerHTML = defs.map((d) => `<button class="hotspot ${d.tag || ''}" data-spot="${d.id}" aria-label="${esc(d.label)}"><span class="tag">${esc(d.label)}</span></button>`).join('');
    this.spots.querySelectorAll('.hotspot').forEach((b) => {
      const d = defs.find((x) => x.id === b.dataset.spot);
      b.addEventListener('click', () => { this.app.audio.unlock(); this.app.audio.play('click'); d.act(); });
    });
    this._placeSpots();
  }

  _placeSpots() {
    if (!this.roomOn) return;
    const R = this.g.render;
    // the tags wait for the camera: mid flight they would slide across the title and the wallet
    this.spots.classList.toggle('moving', !!R.camAnim);
    for (const b of this.spots.querySelectorAll('.hotspot')) {
      const box = this.room.anchors[b.dataset.spot];
      if (!box) continue;
      // project the anchor box to a screen rectangle, at least 48 px each way
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of box) { const s = R.project(p); x0 = Math.min(x0, s.x); x1 = Math.max(x1, s.x); y0 = Math.min(y0, s.y); y1 = Math.max(y1, s.y); }
      const w = Math.max(48, x1 - x0), h = Math.max(48, y1 - y0);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      b.style.left = Math.round(Math.max(0, cx - w / 2)) + 'px';
      b.style.top = Math.round(Math.max(0, cy - h / 2)) + 'px';
      b.style.width = Math.round(w) + 'px';
      b.style.height = Math.round(h) + 'px';
    }
  }

  frame(dt) {
    this.room.frame(dt, this.roomOn);
    if (this.roomOn) this._placeSpots();
  }

  open(name, arg) {
    if (name === 'drawer') return this.drawer();
    if (name === 'oddbin') return this.oddBin();
    if (name === 'clothesline') return this.clothesline();
    if (name === 'door') return this.door(arg);
    if (name === 'radio') return this.door('radio');
    if (name === 'shop') return this.door(arg || 'basket');
    if (name === 'lore') return this.lorePage(arg);
  }

  // ---------- the Drawer (DESIGN 9.2) and its Pockets page (DESIGN-T2 2.3) ----------
  drawer() {
    this._recall();
    if (this.drawerTab === 'pockets') return this.pockets();
    const s = this.app.save;
    const f = this.filters;
    const entries = s.drawer.slice().sort((a, b) => (b.foundAt || 0) - (a.foundAt || 0));
    const heroCount = entries.filter((d) => d.heroId).length;
    const oddCount = entries.filter((d) => d.odd).length;
    const html = `
      ${this._drawerTabs(s)}
      <p class="lead">${entries.length ? `${entries.length} ${entries.length === 1 ? 'design' : 'designs'} folded away. Tap one to look closer.` : 'Empty for now. Every pair you put away lands here.'}</p>
      <div class="tabs" id="dShow">${[['all', 'All'], ['hero', `Heroes ${heroCount}`], ['odd', `Missing a mate ${oddCount}`]].map(([k, n]) => `<button data-show="${k}" aria-pressed="${f.show === k}">${n}</button>`).join('')}</div>
      <div class="tabs" id="dSil">${[['all', 'Every shape'], ...SILHOUETTES.map((x) => [String(x.id), x.name])].map(([k, n]) => `<button data-sil="${k}" aria-pressed="${f.sil === k}">${esc(n)}</button>`).join('')}</div>
      <div class="tabs" id="dFam">${[['all', 'Every pattern'], ...FAMILIES.map((x) => [x, FAMILY_NAMES[x]])].map(([k, n]) => `<button data-fam="${k}" aria-pressed="${f.family === k}">${esc(n)}</button>`).join('')}</div>
      <div class="grid" id="dGrid"></div>
      <div class="btnrow" id="dMore" hidden><button class="btn soft" id="dMoreBtn">Show more</button></div>`;
    const body = this.ui.openSheet('The Drawer', html, { tall: entries.length > 0 });
    this._wireDrawerTabs(body);
    this.ui.centerTabs(body);
    const grid = body.querySelector('#dGrid');
    const list = entries.filter((d) => {
      if (f.show === 'hero' && !d.heroId) return false;
      if (f.show === 'odd' && !d.odd) return false;
      const seed = d.heroId ? 'hero:' + d.heroId : d.sockSeed;
      const hero = d.heroId ? this.app.heroById(d.heroId) : null;
      const sp = decode(seed);
      const sil = hero ? String(SILHOUETTES.findIndex((x) => x.key === hero.silhouette)) : String(sp.silhouette);
      if (f.sil !== 'all' && sil !== f.sil) return false;
      if (f.family !== 'all' && (hero || sp.family !== f.family)) return false;
      return true;
    });
    // two designs can share a name (a decoy of the same colour): number them in the order they were found
    const nm = (d) => (d.heroId ? ((this.app.heroById(d.heroId) || {}).name || '') : sockName(decode(d.sockSeed)));
    const ord = new Map(), tally = new Map();
    for (const d of s.drawer.slice().sort((a, b) => (a.foundAt || 0) - (b.foundAt || 0))) { const n = nm(d); const k = (tally.get(n) || 0) + 1; tally.set(n, k); ord.set(d, k); }
    let shown = 0;
    const more = () => {
      const chunk = list.slice(shown, shown + 30);
      shown += chunk.length;
      for (const d of chunk) grid.appendChild(this._cell(d, ord.get(d) || 1));
      body.querySelector('#dMore').hidden = shown >= list.length;
    };
    more();
    body.querySelector('#dMoreBtn').addEventListener('click', more);
    const setF = (k, v) => { const y = this.ui.$('sheetBody').scrollTop; this.filters[k] = v; this.app.rememberUI({ filters: { ...this.filters } }); this.drawer(); this.ui.$('sheetBody').scrollTop = y; };
    body.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => setF('show', b.dataset.show)));
    body.querySelectorAll('[data-sil]').forEach((b) => b.addEventListener('click', () => setF('sil', b.dataset.sil)));
    body.querySelectorAll('[data-fam]').forEach((b) => b.addEventListener('click', () => setF('family', b.dataset.fam)));
    if (!list.length && entries.length) grid.innerHTML = '<p class="lead">Nothing matches those filters yet.</p>';
  }

  // The Hair Tie (DESIGN-T2 2.5): the sheets open where she left them, across sessions. Read once per open,
  // so a hook she does not own can never put a filter back on her.
  _recall() {
    if (this._recalled) return;
    this._recalled = true;
    const u = this.app.recallUI();
    if (u.drawerTab === 'socks' || u.drawerTab === 'pockets') this.drawerTab = u.drawerTab;
    if (u.doorTab && typeof u.doorTab === 'string' && /^[a-z]+$/.test(u.doorTab)) this.doorTab = u.doorTab;
    if (u.filters && typeof u.filters === 'object') {
      for (const k of ['sil', 'show', 'family']) if (typeof u.filters[k] === 'string' && u.filters[k].length < 20) this.filters[k] = u.filters[k];
    }
  }

  _drawerTabs(s) {
    const n = (s.finds || []).length;
    return `<div class="tabs" id="dTop">`
      + `<button data-top="socks" aria-pressed="${this.drawerTab === 'socks'}">Socks</button>`
      + `<button data-top="pockets" aria-pressed="${this.drawerTab === 'pockets'}">Pockets${n ? ' ' + n : ''}</button>`
      + `</div>`;
  }

  _wireDrawerTabs(body) {
    body.querySelectorAll('[data-top]').forEach((b) => b.addEventListener('click', () => {
      if (this.drawerTab === b.dataset.top) return;
      this.drawerTab = b.dataset.top;
      this.app.audio.play('click');
      this.app.rememberUI({ drawerTab: this.drawerTab });
      this.drawer();
    }));
  }

  // THE POCKETS PAGE (DESIGN-T2 2.3): big tiles, the flavor line, the set each belongs to, and silhouettes
  // for the ones still missing from a set she has STARTED. Never a count of what is missing overall: she is
  // not being shown a scoreboard of things she does not have.
  pockets() {
    this._recall();
    const s = this.app.save;
    const F = this.app.data.finds || { items: [], sets: [], comforts: [] };
    const have = new Set(s.finds || []);
    const doneSets = new Set(s.sets || []);
    let html = this._drawerTabs(s);
    if (!have.size) {
      html += `<p class="lead">Nothing yet. Things turn up in the drum, in the lint trap, in a cuff and under the pile, and they stay here when they do.</p>`;
      const body = this.ui.openSheet('The Drawer', html, { tall: false });
      this._wireDrawerTabs(body);
      this.ui.centerTabs(body);
      return;
    }
    html += `<p class="lead">${have.size} ${have.size === 1 ? 'thing has' : 'things have'} come out of the wash. Tap one to read it.</p><div class="pockets" id="pk">`;
    for (const set of F.sets) {
      const members = setMembers(F, set.id);
      const mine = members.filter((id) => have.has(id));
      if (!mine.length) continue;                       // a set she has not started is not shown at all
      const complete = doneSets.has(set.id) || (members.length && mine.length === members.length);
      html += `<div class="${complete ? 'done' : ''}"><h4>${esc(set.name)}${complete ? '' : `<small>${mine.length} of ${members.length}</small>`}</h4>`;
      if (complete) html += `<div class="label">${esc(set.label || '')}</div>`;
      html += '<div class="pgrid">';
      for (const id of members) {
        const f = this.app.findById(id);
        if (!f) continue;
        html += have.has(id)
          ? `<button class="pc" data-find="${esc(id)}"><span>${esc(f.name)}</span></button>`
          : `<div class="pc miss" data-sil="${esc(id)}" aria-label="Not found yet"><span>Not yet</span></div>`;
      }
      html += '</div></div>';
    }
    html += '</div>';
    const shown = (F.sets || []).reduce((n, st) => n + (setMembers(F, st.id).some((id) => have.has(id)) ? setMembers(F, st.id).length : 0), 0);
    const body = this.ui.openSheet('The Drawer', html, { tall: shown > 9 });
    this._wireDrawerTabs(body);
    this.ui.centerTabs(body);
    for (const b of body.querySelectorAll('[data-find]')) {
      b.prepend(this.ui.findCanvas(b.dataset.find, 62));
      b.addEventListener('click', () => { this.app.audio.play('click'); this.findCard(b.dataset.find); });
    }
    // a silhouette is the OBJECT'S shape in shadow, not a blank disc: five identical blank discs say only
    // "five missing", which is the count the design said never to show her
    for (const b of body.querySelectorAll('[data-sil]')) b.prepend(this.ui.findCanvas(b.dataset.sil, 62, true));
  }

  // one find, big, with what it is and where it came from
  findCard(id, back = true) {
    const f = this.app.findById(id);
    if (!f) return;
    const set = this.app.setById(f.set);
    const comfort = (this.app.data.finds.comforts || []).find((c) => c.id === f.help);
    const WHERE = {
      door: 'It came out of the drum when the door opened.',
      flip: 'It was in a cuff, the wrong way out.',
      trap: 'It was sitting in the lint trap.',
      pull: 'It came up from under the pile.',
      clean: 'It turned up at the end of a Clean Load.',
      spotless: 'It turned up at the end of a Spotless Load.',
      allFlipped: 'It turned up once every sock was the right way out.',
      reunion: 'It turned up beside a Reunion.',
      big: 'It came out of a big Load.',
    };
    const body = this.ui.openSheet(f.name, `
      <div style="display:flex;justify-content:center;margin:6px 0 10px"><div id="fcHost"></div></div>
      <p>${esc(f.flavor)}</p>
      <p class="lead">${esc(WHERE[f.comesOut] || '')}${set ? ` One of ${esc(set.name)}.` : ''}</p>
      ${comfort ? `<div class="note"><b>${esc(comfort.name)}.</b> ${esc(comfort.effect)} <span class="lead">Laundry Day only. Switch it off on the Clothesline.</span></div>` : ''}
      ${set && (this.app.save.sets || []).includes(set.id) ? `<div class="note gold">${esc(set.name)} is complete. Its things sit together on the ledge now, with a label that reads ${esc(set.label || '')}.</div>` : ''}
      ${back ? '<div class="btnrow"><button class="btn soft" id="fcBack">Back to the pockets</button></div>' : ''}
    `);
    const host = body.querySelector('#fcHost');
    if (host) host.appendChild(this.ui.findCanvas(f.id, 150));
    // closing a find used to drop her out to the room, so reading two of them meant walking back in twice
    body.querySelector('#fcBack')?.addEventListener('click', () => { this.app.audio.play('click'); this.drawerTab = 'pockets'; this.drawer(); });
  }

  _cell(d, k = 1) {
    const seed = d.heroId ? 'hero:' + d.heroId : d.sockSeed;
    const hero = d.heroId ? this.app.heroById(d.heroId) : null;
    const b = document.createElement('button');
    b.className = 'cell' + (hero ? ' ' + (hero.rarity === 'rare' || hero.rarity === 'odd' ? 'rare' : hero.rarity === 'uncommon' ? 'uncommon' : '') : '') + (d.odd ? ' oddone' : '');
    b.appendChild(this.ui.sockCanvas(seed, { hero }));
    const name = document.createElement('span');
    name.textContent = (hero ? hero.name : sockName(decode(seed))) + (k > 1 ? ` No. ${k}` : '');
    b.appendChild(name);
    if (d.count > 1) { const c = document.createElement('i'); c.className = 'count'; c.textContent = 'x' + d.count; b.appendChild(c); }
    b.addEventListener('click', () => this.sockCard(d, false, k));
    return b;
  }

  sockCard(d, fromLink = false, k = 1) {
    const seed = d.heroId ? 'hero:' + d.heroId : d.sockSeed;
    let sp;
    try { sp = decode(seed); } catch (e) { this.ui.hint('That sock link is not one TUMBLE recognizes.'); return; }
    const hero = d.heroId ? this.app.heroById(d.heroId) : sp.hero ? this.app.heroById(sp.hero) : null;
    const name = (hero ? hero.name : sockName(sp)) + (k > 1 ? ` No. ${k}` : '');
    const sil = hero ? SILHOUETTES.find((x) => x.key === hero.silhouette) : SILHOUETTES[sp.silhouette];
    const COND_TEXT = { lint: 'a little linty', hole: 'one small hole', pilled: 'a bit pilled' };
    const packName = hero ? ((this.app.data.packs.find((p) => p.id === hero.pack) || {}).name || hero.pack) : '';
    const origin = !hero ? '' : hero.source === 'reunion' ? 'a gift from the Odd Bin' : hero.source === 'portal' ? 'from the back of the dryer' : `from the ${packName} pack`;
    const facts = hero
      ? `${esc(hero.flavor)}<br><span class="lead">${esc(sil ? sil.name : '')}, ${esc(hero.rarity)}, ${esc(origin)}.</span>`
      : `<span class="lead">${esc(sil.name)}, ${esc(FAMILY_NAMES[sp.family])}${sp.kid ? ', kid size' : ''}${sp.condition ? ', ' + esc(COND_TEXT[sp.cond] || sp.cond) : ''}.</span>`;
    const body = this.ui.openSheet(name, `
      <div style="display:flex;justify-content:center"><div id="spinHost" style="width:200px;height:250px;position:relative"></div></div>
      <p>${facts}</p>
      ${d.odd ? '<div class="note">Its twin has not turned up yet. It waits in the Odd Bin.</div>' : ''}
      ${Number(d.count) ? `<p class="lead">Put away ${Number(d.count)} ${Number(d.count) === 1 ? 'time' : 'times'}${d.foundAt ? `, first on ${new Date(d.foundAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}.</p>` : ''}
      ${fromLink ? '<p class="lead">Someone shared this sock with you.</p>' : ''}
      <div class="btnrow"><button class="btn soft" id="scShare">${I.share.replace('<svg', '<svg style="width:20px;height:20px;vertical-align:-4px"')} Share this sock</button></div>
    `, { onClose: () => this.stopSpin() });
    this.spin(seed, hero, body.querySelector('#spinHost'));
    body.querySelector('#scShare').addEventListener('click', async () => {
      const url = location.origin + location.pathname + '#sock=' + encodeURIComponent(seed);
      try {
        if (navigator.share) await navigator.share({ title: 'A TUMBLE sock', text: name, url });
        else { await navigator.clipboard.writeText(url); this.ui.hint('Link copied.'); }
      } catch (e) { /* cancelled */ }
    });
  }

  // a sock turning in 3D: a flat card that flips between its faces (cheap, no second WebGL context)
  spin(seed, hero, host) {
    this.stopSpin();
    const face = 'position:absolute;inset:0;width:100%;height:100%;backface-visibility:hidden;border-radius:22px;background:radial-gradient(ellipse at 50% 38%,#fffaf0,#efe4cf);box-shadow:inset 0 0 0 2px #e6d9bf,0 10px 24px rgba(74,58,44,.18)';
    const front = this.ui.sockCanvas(seed, { w: 200, h: 250, hero });
    front.style.cssText = face;
    const back = this.ui.sockCanvas(seed, { w: 200, h: 250, hero });
    back.style.cssText = face + ';transform:rotateY(180deg) scaleX(-1)';
    const card = document.createElement('div');
    card.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;will-change:transform';
    card.append(front, back);
    host.style.perspective = '700px';
    host.appendChild(card);
    let a = 0, drag = null, last = performance.now();
    const reduce = this.app.game.settings.reduceMotion;
    const tick = () => {
      // 30 degrees a second whatever the screen's refresh rate
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag && !reduce) a += dt * 30;
      card.style.transform = `rotateY(${a}deg) rotateZ(${Math.sin(a / 40) * 4}deg)`;
      this.spinRaf = requestAnimationFrame(tick);
    };
    host.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, a }; host.setPointerCapture(e.pointerId); });
    host.addEventListener('pointermove', (e) => { if (drag) a = drag.a + (e.clientX - drag.x) * 0.8; });
    host.addEventListener('pointerup', () => { drag = null; });
    tick();
  }

  stopSpin() { if (this.spinRaf) cancelAnimationFrame(this.spinRaf); this.spinRaf = 0; }

  // ---------- the Odd Bin (DESIGN 9.3, 9.6) ----------
  oddBin() {
    const s = this.app.save, L = this.app.data.lore;
    const pages = L.pages || [];
    const next = pages.find((p) => !s.lore.includes(p.id));
    const need = next ? next.at - s.economy.reunions : 0;
    const html = `
      <p class="lead">${esc(L.binIntro || 'Socks without a twin wait here. Some of them are patient about it.')}</p>
      <div class="earn"><div>${I.reunion}<span><b>${s.economy.reunions}</b><small>${s.economy.reunions === 1 ? 'Reunion' : 'Reunions'}</small></span></div><div>${I.odd.replace('<svg', '<svg style="width:30px;height:30px"')}<span><b>${s.oddBin.length}</b><small>waiting</small></span></div></div>
      ${s.oddBin.length ? '<p><b>Waiting</b></p><div class="grid" id="obGrid"></div>' : ''}
      <p style="margin-top:14px"><b>Pages from the Bin</b></p>
      <div id="obPages"></div>
      ${next ? `<p class="lock">${esc((L.locked || '{n} more Reunions and someone in here will say something.').replace('{n}', need))}</p>` : ''}
    `;
    const body = this.ui.openSheet('The Odd Bin', html);
    const grid = body.querySelector('#obGrid');
    if (grid) {
      for (const e of s.oddBin.slice().sort((a, b) => b.loadsWaited - a.loadsWaited).slice(0, 60)) {
        const cell = this._cell({ sockSeed: e.sockSeed, heroId: e.sockSeed.startsWith('hero:') ? e.sockSeed.slice(5) : null, odd: true });
        const w = document.createElement('span');
        w.textContent = e.loadsWaited === 0 ? 'just arrived' : `waited ${e.loadsWaited} ${e.loadsWaited === 1 ? 'Load' : 'Loads'}`;
        w.style.color = 'var(--ink-soft)';
        cell.appendChild(w);
        grid.appendChild(cell);
      }
    }
    const list = body.querySelector('#obPages');
    for (const p of pages) {
      const got = s.lore.includes(p.id);
      const b = document.createElement('button');
      b.className = 'btn soft';
      b.style.cssText = 'width:100%;margin:4px 0;text-align:left;flex:none' + (got ? '' : ';opacity:1;background:transparent;box-shadow:none;border:2px dashed #d8cbb2;color:var(--ink-soft)');
      b.textContent = got ? `${p.id}. ${p.title}` : `${p.id}. Arrives at ${p.at} ${p.at === 1 ? 'Reunion' : 'Reunions'}`;
      b.disabled = !got;
      b.addEventListener('click', () => this.lorePage(p.id, () => this.oddBin()));
      list.appendChild(b);
    }
  }

  lorePage(id, back) {
    const p = (this.app.data.lore.pages || []).find((x) => x.id === id);
    if (!p) return;
    const body = this.ui.openSheet(`Page ${p.id}`, `
      <div class="page"><h3>${esc(p.title)}</h3>${p.speaker ? `<div class="who">${esc(p.speaker)}</div>` : ''}${(p.body || []).map((t) => `<p>${esc(t)}</p>`).join('')}</div>
      <div class="btnrow"><button class="btn" id="lpBack">Back</button></div>`, { onClose: () => back && back() });
    body.querySelector('#lpBack').addEventListener('click', () => { this.ui.closeSheet(); });
  }

  // ---------- the Clothesline (DESIGN 9.4) ----------
  clothesline() {
    const s = this.app.save, pegs = this.app.data.clothesline.pegs || [];
    const got = new Set(s.clothesline);
    const html = `
      <p class="lead">Pegs hang here as you play. Nothing to buy and nothing to undo; each one is a small comfort that stays.</p>
      <div class="line"><div class="pegs" id="clPegs"><i class="rope" aria-hidden="true"></i></div></div>
      <div id="clDetail"></div>`;
    const body = this.ui.openSheet('The Clothesline', html);
    const row = body.querySelector('#clPegs');
    const detail = body.querySelector('#clDetail');
    const drawer = s.drawer.filter((d) => !d.odd);
    const show = (p) => {
      const have = got.has(p.id);
      const cur = p.earn ? (s.stats[p.earn.stat] || 0) : 0;
      const progress = p.earn && p.comfort !== 'blank' ? ` (${Math.min(cur, p.earn.gte)} of ${p.earn.gte})` : '';
      detail.innerHTML = `<div class="note ${have ? 'gold' : ''}"><b>${esc(p.name || '')}</b><br>${esc(p.effect || '')}<br><span class="lead">${have ? 'Yours.' : esc(p.hint || '') + progress}</span></div>`;
    };
    const buttons = [];
    pegs.forEach((p, i) => {
      const have = got.has(p.id);
      const b = document.createElement('button');
      b.className = 'peg' + (have ? ' got' : '') + (p.rush ? ' rushpeg' : '') + (p.comfort === 'blank' ? ' blank' : '');
      const cur = p.earn ? Math.min(1, (s.stats[p.earn.stat] || 0) / Math.max(1, p.earn.gte)) : 0;
      b.innerHTML = `<div class="pin"></div><div class="card"><div class="pic"></div><span>${p.comfort === 'blank' ? 'Soon' : esc(p.name)}</span>${!have && p.comfort !== 'blank' ? `<i class="bar"><i style="width:${Math.round(cur * 100)}%"></i></i>` : ''}</div>`;
      // an earned peg holds a sock from the Drawer, like the line in the room
      if (have && p.comfort !== 'blank' && drawer.length) {
        const d = drawer[i % drawer.length];
        const seed = d.heroId ? 'hero:' + d.heroId : d.sockSeed;
        b.querySelector('.pic').appendChild(this.ui.sockCanvas(seed, { w: 56, h: 64, hero: this.app.heroOf(seed) }));
      }
      b.setAttribute('aria-label', `${p.comfort === 'blank' ? 'An empty peg' : p.name}, ${have ? 'earned' : 'not yet'}`);
      b.addEventListener('click', () => { buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); show(p); });
      buttons.push(b);
      row.appendChild(b);
    });
    const first = pegs.find((p) => !got.has(p.id) && p.comfort !== 'blank') || pegs[0];
    if (first) {
      show(first);
      const fb = buttons[pegs.indexOf(first)];
      fb.setAttribute('aria-pressed', 'true');
      requestAnimationFrame(() => { const line = body.querySelector('.line'); if (line) line.scrollLeft = Math.max(0, fb.offsetLeft - 60); });
    }
  }

  // ---------- behind the door: shop and settings (DESIGN 9.5, 10) ----------
  door(tab) {
    this._recall();
    if (tab === undefined) tab = this.doorTab || 'basket';
    this.doorTab = tab;
    this.app.rememberUI({ doorTab: tab });
    const s = this.app.save;
    const cats = [['basket', 'Baskets'], ['dryer', 'Dryers'], ['decor', 'Room'], ['radio', 'Radio'], ['ball', 'Ball styles'], ['trail', 'Shot trails'], ['pack', 'Hero packs'], ['reunion', 'Reunion gifts']];
    const html = `
      <div class="btnrow" style="margin-top:0"><button class="btn soft" id="drSettings">${I.gear.replace('<svg', '<svg style="width:20px;height:20px;vertical-align:-4px"')} Settings</button></div>
      <div class="wallet" style="margin:10px 0">${this.ui.$('roomWallet').innerHTML}</div>
      ${this._hooks()}
      <div class="tabs">${cats.map(([k, n]) => `<button data-tab="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div>
      <div id="shopList"></div>`;
    const body = this.ui.openSheet('Behind the door', html, { tall: true });
    this._wireHooks(body, tab);
    this.ui.centerTabs(body);
    body.querySelector('#drSettings').addEventListener('click', () => this.app.openSettings(() => this.door(tab)));
    body.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.door(b.dataset.tab)));
    const list = body.querySelector('#shopList');
    const items = this.app.itemsOf(tab);
    if (!items.length) list.innerHTML = '<p class="lead">Nothing here yet.</p>';
    // room decor comes in little groups: Rugs, Windows, Frames...
    let slot = null;
    for (const it of items) {
      const sl = tab === 'decor' && it.look ? it.look.slot : null;
      if (sl && sl !== slot) { slot = sl; const h = document.createElement('p'); h.className = 'shophead'; h.textContent = SLOT_NAMES[sl] || ''; list.appendChild(h); }
      list.appendChild(this._shopRow(it, tab));
    }
  }

  // THE ROOM KEY (DESIGN-T2 2.6): two hooks by the door, each holding a whole room look. Put one up, take it
  // down again. Nothing is bought here and nothing is spent: a hook holds what she already owns.
  LOOK_SLOTS = ['dryer', 'basket', 'radio', 'ball', 'trail', 'wallpaper', 'floor', 'curtains', 'tabletop'];

  _hooks() {
    if (!this.app.game.comfort('roomKey')) return '';
    const looks = this.app.save.looks || [null, null];
    const cell = (i) => {
      const L = looks[i];
      const n = L ? (L.decor || []).length : 0;
      return `<div class="hook"><b>Hook ${i === 0 ? 'one' : 'two'}</b>`
        + `<span>${L ? `${n} ${n === 1 ? 'thing' : 'things'} in the room` : 'Empty'}</span>`
        + `<div class="hookrow"><button class="btn soft" data-hook="save" data-i="${i}">${L ? 'Replace' : 'Hang it up'}</button>`
        + (L ? `<button class="btn soft" data-hook="wear" data-i="${i}">Put it up</button>` : '') + '</div></div>';
    };
    return `<div class="hooks"><p class="lead" style="margin:0 0 6px">Two hooks by the door. Each one holds the whole room as it is now.</p>${cell(0)}${cell(1)}</div>`;
  }

  _wireHooks(body, tab) {
    const s = this.app.save;
    body.querySelectorAll('[data-hook]').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      this.app.audio.play('click');
      if (!Array.isArray(s.looks)) s.looks = [null, null];
      if (b.dataset.hook === 'save') {
        const e = s.equipped;
        const L = { decor: (e.decor || []).slice() };
        for (const k of this.LOOK_SLOTS) if (e[k]) L[k] = e[k];
        s.looks[i] = L;
        this.ui.hint('The room as it is now is on that hook.');
      } else {
        const L = s.looks[i];
        if (!L) return;
        // only what she still owns goes up: a hook is not a way to wear something she has not got
        s.equipped.decor = (L.decor || []).filter((id) => s.unlocks.includes(id));
        for (const k of this.LOOK_SLOTS) {
          const id = L[k];
          if (id && s.unlocks.includes(id)) s.equipped[k] = id;
          else if (Object.prototype.hasOwnProperty.call(L, k)) s.equipped[k] = null;
        }
        this.ui.hint('That look is up.');
      }
      this.app.store.save();
      this.app.screens.refresh();
      this.app._applyLook && this.app._applyLook();
      this.door(tab);
    }));
  }

  _shopRow(it, tab) {
    const s = this.app.save;
    const row = document.createElement('div');
    row.className = 'shopitem';
    const has = owns(s, it);
    const eqKey = { basket: 'basket', dryer: 'dryer', radio: 'radio', ball: 'ball', trail: 'trail' }[it.cat];
    const equipped = eqKey ? s.equipped[eqKey] === it.id : it.cat === 'decor' ? s.equipped.decor.includes(it.id) : false;
    const c = it.cost || {};
    let label = has ? (eqKey || it.cat === 'decor' ? (equipped ? (it.cat === 'decor' ? 'Placed' : 'In use') : (it.cat === 'decor' ? 'Place' : 'Use')) : 'Yours') : c.reunions !== undefined ? `${c.reunions} ${c.reunions === 1 ? 'Reunion' : 'Reunions'}` : c.quarters !== undefined ? `${c.quarters} ${c.quarters === 1 ? 'Quarter' : 'Quarters'}` : c.lint !== undefined ? `${c.lint} Lint` : 'Free';
    if (!has && it.requires && !requirementMet(s, it.requires)) label = 'Locked';
    const sw = this._swatch(it);
    const locked = !has && it.requires && !requirementMet(s, it.requires);
    const lockWhy = locked && /^lore:(\d+)$/.test(it.requires) ? `Opens with page ${it.requires.split(':')[1]} from the Odd Bin.` : locked ? 'Not yet.' : '';
    // Reunion gifts are never bought: say where an earned one is, and how far away the next one is
    const kind = it.cat === 'reunion' && it.look ? it.look.kind : '';
    if (has && kind) label = kind === 'lore' ? 'Read' : kind === 'impossible' ? 'In the Drawer' : 'In the room';
    const need = Math.max(1, (c.reunions || 0) - s.economy.reunions);
    const soonWhy = !has && !locked && c.reunions !== undefined ? `${need} more ${need === 1 ? 'Reunion' : 'Reunions'} and it arrives on its own.` : '';
    row.innerHTML = `<div class="swatch" style="background:${sw.bg}">${sw.icon}</div><div class="txt"><b>${esc(it.name)}</b><small>${esc(it.desc || '')}</small>${lockWhy ? `<small class="why">${esc(lockWhy)}</small>` : ''}${soonWhy ? `<small class="soon">${esc(soonWhy)}</small>` : ''}</div>`;
    // a hero pack shows one of its socks; an impossible sock you have shows itself
    const heroes = this.app.data.heroes || [];
    const heroSw = it.cat === 'pack' && it.look && it.look.pack ? heroes.find((h) => h.pack === it.look.pack && h.source !== 'reunion')
      : has && it.cat === 'reunion' && it.look && it.look.kind === 'impossible' ? heroes.find((h) => h.source === 'reunion' && h.reunions === c.reunions) : null;
    if (heroSw) {
      const sc = row.querySelector('.swatch');
      sc.innerHTML = '';
      sc.appendChild(this.ui.sockCanvas('hero:' + heroSw.id, { w: 44, h: 50, hero: heroSw }));
    }
    const btn = document.createElement('button');
    btn.className = 'price' + (has ? (equipped ? ' equipped' : ' owned') : '');
    btn.textContent = label;
    const can = canBuy(s, it);
    // an unaffordable or not yet earned item still answers a tap, with the reason
    if (!has && (!can.ok || c.reunions !== undefined)) { btn.classList.add('off'); btn.setAttribute('aria-disabled', 'true'); }
    btn.addEventListener('click', () => {
      if (has && kind === 'lore') { this.lorePage(Number(it.look.ref), () => this.door('reunion')); return; }
      if (has && kind) { this.ui.hint(kind === 'impossible' ? 'It is in your Drawer.' : 'It is already in your room.'); return; }
      if (!has) {
        const r = buy(s, it);
        if (!r.ok) {
          const soon = `This one arrives on its own at ${c.reunions} ${c.reunions === 1 ? 'Reunion' : 'Reunions'}.`;
          this.ui.hint({ lint: 'Not enough Lint yet.', quarters: 'Not enough Quarters yet.', reunion: locked ? lockWhy : soon, locked: lockWhy || 'Not yet.' }[r.why] || 'Not yet.');
          return;
        }
        this.app.audio.play('coin', { kind: 'quarter' });
        if (eqKey) s.equipped[eqKey] = it.id;
        if (it.cat === 'decor') this._place(it);
      } else if (eqKey) {
        s.equipped[eqKey] = equipped && (eqKey === 'radio' || eqKey === 'trail') ? null : it.id;
      } else if (it.cat === 'decor') {
        if (equipped) s.equipped.decor = s.equipped.decor.filter((x) => x !== it.id);
        else this._place(it);
      }
      this.app.store.save();
      this.app._refreshComforts();
      this.app._beds();
      this.refresh();
      const y = this.ui.$('sheetBody').scrollTop;
      this.door(tab);
      this.ui.$('sheetBody').scrollTop = y;
    });
    row.appendChild(btn);
    return row;
  }

  // Each room spot holds so many things: a second rug replaces the first, a fifth frame takes the oldest frame's nail.
  _place(it) {
    const s = this.app.save;
    const slot = it.look && it.look.slot;
    const cap = SLOT_CAP[slot] || 3;
    const same = s.equipped.decor.filter((id) => { const o = this.app.item(id); return o && o.look && o.look.slot === slot; });
    const drop = new Set(same.slice(0, Math.max(0, same.length - cap + 1)));
    s.equipped.decor = [...s.equipped.decor.filter((id) => !drop.has(id)), it.id];
  }

  _swatch(it) {
    const L = it.look || {};
    const tint = (it.cat === 'radio' && RADIO_BG[L.station]) || (it.cat === 'reunion' && L.kind === 'portal' && '#dcd6f0') || '#efe5d2';
    const c1 = L.color || tint, c2 = L.color2 || c1;
    const special = (it.cat === 'decor' && DECOR_ICON[L.slot]) || (it.cat === 'reunion' && REUNION_ICON[L.kind]) || (it.cat === 'radio' && RADIO_ICON[L.station]) || (it.cat === 'ball' && BALL_ICON[L.roll]) || (it.cat === 'trail' && TRAIL_ICON[L.trail]);
    if (special) return { bg: `linear-gradient(135deg, ${c1}, ${c2})`, icon: special };
    const icon = { basket: I.basket, dryer: I.dryer, radio: '<svg viewBox="0 0 24 24" fill="none" stroke="#4a3a2c" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="15" cy="14" r="3"/><path d="M7 12h4M7 16h4M8 8l8-5"/></svg>', ball: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#c9a88a"/><path d="M5 10c4 3 10 3 14 0" stroke="#8a6a50" stroke-width="2" fill="none"/></svg>', trail: '<svg viewBox="0 0 24 24" fill="#e7c46a"><circle cx="6" cy="16" r="2"/><circle cx="11" cy="11" r="2.5"/><circle cx="17" cy="6" r="3"/></svg>', pack: I.sock, reunion: I.reunion }[it.cat] || '';
    return { bg: `linear-gradient(135deg, ${c1}, ${c2})`, icon };
  }
}
