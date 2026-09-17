// The Laundry Room (home = menu, DESIGN 9.1) and its screens: the Drawer (9.2), the Odd Bin and
// its lore (9.3, 9.6), the Clothesline (9.4) and the shop behind the door (9.5).

import * as THREE from 'three';
import { ICONS as I, esc } from './ui.js';
import { decode, sockName, FAMILY_NAMES, FAMILIES } from '../engine/sockgen.js';
import { SILHOUETTES } from './silhouettes.js';
import { buy, canBuy, owns, requirementMet } from './economy.js';
import { buildRoom } from './room.js';

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
    this.ui.$('roomWallet').innerHTML = `<div class="chip">${I.lint.replace('<svg', '<svg style="width:26px;height:26px"')}<span>${e.lint.toLocaleString()}</span><small>Lint</small></div><div class="chip">${I.quarter.replace('<svg', '<svg style="width:26px;height:26px"')}<span>${e.quarters}</span><small>Quarters</small></div>`;
  }

  _buildSpots() {
    const defs = [
      { id: 'dryer', label: 'Dryer, tap to play', tag: 'top', act: () => this.app.openDryer() },
      { id: 'drawer', label: 'Drawer', act: () => this.open('drawer') },
      { id: 'bin', label: 'Odd Bin', tag: 'left', act: () => this.open('oddbin') },
      { id: 'radio', label: 'Radio', tag: 'top', act: () => this.open('radio') },
      { id: 'door', label: 'Door', act: () => this.open('door') },
      { id: 'line', label: 'Clothesline', tag: 'top', act: () => this.open('clothesline') },
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

  // ---------- the Drawer (DESIGN 9.2) ----------
  drawer() {
    const s = this.app.save;
    const f = this.filters;
    const entries = s.drawer.slice().sort((a, b) => (b.foundAt || 0) - (a.foundAt || 0));
    const heroCount = entries.filter((d) => d.heroId).length;
    const oddCount = entries.filter((d) => d.odd).length;
    const html = `
      <p class="lead">${entries.length ? `${entries.length} designs folded away. Tap one to look closer.` : 'Empty for now. Every pair you put away lands here.'}</p>
      <div class="tabs" id="dShow">${[['all', 'All'], ['hero', `Heroes ${heroCount}`], ['odd', `Missing a mate ${oddCount}`]].map(([k, n]) => `<button data-show="${k}" aria-pressed="${f.show === k}">${n}</button>`).join('')}</div>
      <div class="tabs" id="dSil">${[['all', 'Every shape'], ...SILHOUETTES.map((x) => [String(x.id), x.name])].map(([k, n]) => `<button data-sil="${k}" aria-pressed="${f.sil === k}">${esc(n)}</button>`).join('')}</div>
      <div class="tabs" id="dFam">${[['all', 'Every pattern'], ...FAMILIES.map((x) => [x, FAMILY_NAMES[x]])].map(([k, n]) => `<button data-fam="${k}" aria-pressed="${f.family === k}">${esc(n)}</button>`).join('')}</div>
      <div class="grid" id="dGrid"></div>
      <div class="btnrow" id="dMore" hidden><button class="btn soft" id="dMoreBtn">Show more</button></div>`;
    const body = this.ui.openSheet('The Drawer', html);
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
    let shown = 0;
    const more = () => {
      const chunk = list.slice(shown, shown + 30);
      shown += chunk.length;
      for (const d of chunk) grid.appendChild(this._cell(d));
      body.querySelector('#dMore').hidden = shown >= list.length;
    };
    more();
    body.querySelector('#dMoreBtn').addEventListener('click', more);
    const setF = (k, v) => { this.filters[k] = v; this.drawer(); };
    body.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => setF('show', b.dataset.show)));
    body.querySelectorAll('[data-sil]').forEach((b) => b.addEventListener('click', () => setF('sil', b.dataset.sil)));
    body.querySelectorAll('[data-fam]').forEach((b) => b.addEventListener('click', () => setF('family', b.dataset.fam)));
    if (!list.length && entries.length) grid.innerHTML = '<p class="lead">Nothing matches those filters yet.</p>';
  }

  _cell(d) {
    const seed = d.heroId ? 'hero:' + d.heroId : d.sockSeed;
    const hero = d.heroId ? this.app.heroById(d.heroId) : null;
    const b = document.createElement('button');
    b.className = 'cell' + (hero ? ' ' + (hero.rarity === 'rare' || hero.rarity === 'odd' ? 'rare' : hero.rarity === 'uncommon' ? 'uncommon' : '') : '') + (d.odd ? ' oddone' : '');
    b.appendChild(this.ui.sockCanvas(seed, { hero }));
    const name = document.createElement('span');
    name.textContent = hero ? hero.name : sockName(decode(seed));
    b.appendChild(name);
    if (d.count > 1) { const c = document.createElement('i'); c.className = 'count'; c.textContent = 'x' + d.count; b.appendChild(c); }
    b.addEventListener('click', () => this.sockCard(d));
    return b;
  }

  sockCard(d, fromLink = false) {
    const seed = d.heroId ? 'hero:' + d.heroId : d.sockSeed;
    let sp;
    try { sp = decode(seed); } catch (e) { this.ui.hint('That sock link is not one TUMBLE recognises.'); return; }
    const hero = d.heroId ? this.app.heroById(d.heroId) : sp.hero ? this.app.heroById(sp.hero) : null;
    const name = hero ? hero.name : sockName(sp);
    const sil = hero ? SILHOUETTES.find((x) => x.key === hero.silhouette) : SILHOUETTES[sp.silhouette];
    const facts = hero
      ? `${esc(hero.flavor)}<br><span class="lead">${esc(sil ? sil.name : '')}, ${esc(hero.rarity)}, from the ${esc((this.app.data.packs.find((p) => p.id === hero.pack) || {}).name || hero.pack)} pack.</span>`
      : `<span class="lead">${esc(sil.name)}, ${esc(FAMILY_NAMES[sp.family])}${sp.kid ? ', kid size' : ''}${sp.condition ? ', ' + sp.cond : ''}.</span>`;
    const body = this.ui.openSheet(name, `
      <div style="display:flex;justify-content:center"><div id="spinHost" style="width:220px;height:250px;position:relative"></div></div>
      <p>${facts}</p>
      ${d.odd ? '<div class="note">Its twin has not turned up yet. It waits in the Odd Bin.</div>' : ''}
      ${Number(d.count) ? `<p class="lead">Put away ${Number(d.count)} ${Number(d.count) === 1 ? 'time' : 'times'}${d.foundAt ? `, first on ${new Date(d.foundAt).toLocaleDateString()}` : ''}.</p>` : ''}
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
    const front = this.ui.sockCanvas(seed, { w: 220, h: 250, hero });
    front.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;backface-visibility:hidden';
    const back = this.ui.sockCanvas(seed, { w: 220, h: 250, hero });
    back.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;backface-visibility:hidden;transform:rotateY(180deg) scaleX(-1)';
    const card = document.createElement('div');
    card.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;will-change:transform';
    card.append(front, back);
    host.style.perspective = '700px';
    host.appendChild(card);
    let a = 0, drag = null;
    const reduce = this.app.game.settings.reduceMotion;
    const tick = () => {
      if (!drag && !reduce) a += 0.7;
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
        w.textContent = `waited ${e.loadsWaited} ${e.loadsWaited === 1 ? 'Load' : 'Loads'}`;
        w.style.color = 'var(--ink-soft)';
        cell.appendChild(w);
        grid.appendChild(cell);
      }
    }
    const list = body.querySelector('#obPages');
    for (const p of pages) {
      const got = s.lore.includes(p.id);
      const b = document.createElement('button');
      b.className = 'btn ' + (got ? 'soft' : 'soft');
      b.style.cssText = 'width:100%;margin:4px 0;text-align:left;flex:none' + (got ? '' : ';opacity:.5');
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
      <div class="line"><div class="pegs" id="clPegs"></div></div>
      <div id="clDetail"></div>`;
    const body = this.ui.openSheet('The Clothesline', html);
    const row = body.querySelector('#clPegs');
    const detail = body.querySelector('#clDetail');
    const show = (p) => {
      const have = got.has(p.id);
      const cur = p.earn ? (s.stats[p.earn.stat] || 0) : 0;
      const progress = p.earn && p.comfort !== 'blank' ? ` (${Math.min(cur, p.earn.gte)} of ${p.earn.gte})` : '';
      detail.innerHTML = `<div class="note ${have ? 'gold' : ''}"><b>${esc(p.name || '')}</b><br>${esc(p.effect || '')}<br><span class="lead">${have ? 'Yours.' : esc(p.hint || '') + progress}</span></div>`;
    };
    pegs.forEach((p) => {
      const b = document.createElement('button');
      b.className = 'peg' + (got.has(p.id) ? ' got' : '') + (p.rush ? ' rushpeg' : '') + (p.comfort === 'blank' ? ' blank' : '');
      b.innerHTML = `<div class="pin"></div><div class="card">${esc(p.name)}</div>`;
      b.setAttribute('aria-label', `${p.name}, ${got.has(p.id) ? 'earned' : 'not yet'}`);
      b.addEventListener('click', () => show(p));
      row.appendChild(b);
    });
    const first = pegs.find((p) => !got.has(p.id) && p.comfort !== 'blank') || pegs[0];
    if (first) show(first);
  }

  // ---------- behind the door: shop and settings (DESIGN 9.5, 10) ----------
  door(tab = 'basket') {
    const s = this.app.save;
    const cats = [['basket', 'Baskets'], ['dryer', 'Dryers'], ['decor', 'Room'], ['radio', 'Radio'], ['ball', 'Ball styles'], ['trail', 'Shot trails'], ['pack', 'Hero packs'], ['reunion', 'Reunion gifts']];
    const html = `
      <div class="btnrow" style="margin-top:0"><button class="btn soft" id="drSettings">${I.gear.replace('<svg', '<svg style="width:20px;height:20px;vertical-align:-4px"')} Settings</button></div>
      <div class="wallet" style="margin:10px 0">${this.ui.$('roomWallet').innerHTML}</div>
      <div class="tabs">${cats.map(([k, n]) => `<button data-tab="${k}" aria-pressed="${k === tab}">${n}</button>`).join('')}</div>
      <div id="shopList"></div>`;
    const body = this.ui.openSheet('Behind the door', html);
    body.querySelector('#drSettings').addEventListener('click', () => this.app.openSettings(() => this.door(tab)));
    body.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => this.door(b.dataset.tab)));
    const list = body.querySelector('#shopList');
    const items = this.app.itemsOf(tab);
    if (!items.length) list.innerHTML = '<p class="lead">Nothing here yet.</p>';
    for (const it of items) list.appendChild(this._shopRow(it, tab));
  }

  _shopRow(it, tab) {
    const s = this.app.save;
    const row = document.createElement('div');
    row.className = 'shopitem';
    const has = owns(s, it);
    const eqKey = { basket: 'basket', dryer: 'dryer', radio: 'radio', ball: 'ball', trail: 'trail' }[it.cat];
    const equipped = eqKey ? s.equipped[eqKey] === it.id : it.cat === 'decor' ? s.equipped.decor.includes(it.id) : false;
    const c = it.cost || {};
    let label = has ? (eqKey || it.cat === 'decor' ? (equipped ? (it.cat === 'decor' ? 'Placed' : 'In use') : (it.cat === 'decor' ? 'Place' : 'Use')) : 'Yours') : c.reunions !== undefined ? `${c.reunions} ${c.reunions === 1 ? 'Reunion' : 'Reunions'}` : c.quarters !== undefined ? `${c.quarters} Q` : c.lint !== undefined ? `${c.lint} Lint` : 'Free';
    if (!has && it.requires && !requirementMet(s, it.requires)) label = 'Locked';
    const sw = this._swatch(it);
    row.innerHTML = `<div class="swatch" style="background:${sw.bg}">${sw.icon}</div><div class="txt"><b>${esc(it.name)}</b><small>${esc(it.desc || '')}</small></div>`;
    const btn = document.createElement('button');
    btn.className = 'price' + (has ? (equipped ? ' equipped' : ' owned') : '');
    btn.textContent = label;
    const can = canBuy(s, it);
    if (!has && !can.ok) btn.disabled = true;
    if (!has && c.reunions !== undefined) btn.disabled = true;
    btn.addEventListener('click', () => {
      if (!has) {
        const r = buy(s, it);
        if (!r.ok) { this.ui.hint(r.why === 'lint' ? 'Not enough Lint yet.' : r.why === 'quarters' ? 'Not enough Quarters yet.' : 'Not yet.'); return; }
        this.app.audio.play('coin');
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
      this.door(tab);
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
    const c1 = L.color || '#efe5d2', c2 = L.color2 || c1;
    const icon = { basket: I.basket, dryer: I.dryer, radio: '<svg viewBox="0 0 24 24" fill="none" stroke="#4a3a2c" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="15" cy="14" r="3"/><path d="M7 12h4M7 16h4M8 8l8-5"/></svg>', ball: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#c9a88a"/><path d="M5 10c4 3 10 3 14 0" stroke="#8a6a50" stroke-width="2" fill="none"/></svg>', trail: '<svg viewBox="0 0 24 24" fill="#e7c46a"><circle cx="6" cy="16" r="2"/><circle cx="11" cy="11" r="2.5"/><circle cx="17" cy="6" r="3"/></svg>', pack: I.sock, reunion: I.reunion }[it.cat] || '';
    return { bg: `linear-gradient(135deg, ${c1}, ${c2})`, icon };
  }
}
