// Sheets over the board: rule cards, Night result, the Lapidary, Eclipse rewards, run summary.
import { cardHTML } from './hud.js';
import { SYS_ICONS, ARCH_ICONS, CUT_ICONS } from './icons.js';
import { fmt } from './format.js';
import { sameKind } from '../sim/gems.js';
import { boardThumb } from './thumb.js';
import { modifiers } from '../sim/run.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const glint = (n) => `<span class="price">${SYS_ICONS.glint}${n}</span>`;
const TIER = ['Rough', 'Cut', 'Brilliant', 'Radiant'];
const RANK = { common: 0, uncommon: 1, rare: 2 };

function bind(panel, sel, fn) { panel.querySelectorAll(sel).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); fn(b, e); })); }

export function ruleCardGem(hud, data, gm, back = null) {
  const cut = data.cut[gm.cut], stone = data.stone[gm.stone];
  const inc = gm.inclusion ? data.inclusion[gm.inclusion] : null;
  const panel = hud.openSheet(`<div class="rulecard"><div class="row"><div class="card" style="width:70px;height:98px;flex:0 0 70px">${cardHTML(data, gm, { showStone: false })}</div>
    <div><div class="big">${esc(gm.name || `${stone.name} ${cut.name}`)}</div><div class="muted">${TIER[gm.tier || 0]} ${stone.name} ${cut.name}</div></div></div>
    <p>${esc(cut.rule)}</p>${inc ? `<p><b>${esc(inc.name)}:</b> ${esc(inc.rule)}</p>` : ''}
    <div class="row end"><button class="btn small close">${back ? 'Back' : 'Close'}</button></div></div>`);
  bind(panel, '.close', () => (back ? back() : hud.closeSheet()));
}

export function ruleCardSetting(hud, data, id, back = null) {
  const s = data.setting[id];
  const panel = hud.openSheet(`<div class="rulecard"><div class="row"><span style="width:28px;height:28px;color:var(--brass)">${ARCH_ICONS[s.archetype]}</span><div class="big">${esc(s.name)}</div></div>
    <p>${esc(s.rule)}</p><p class="muted">${s.archetype[0].toUpperCase() + s.archetype.slice(1)} Setting</p><div class="row end"><button class="btn small close">${back ? 'Back' : 'Close'}</button></div></div>`);
  bind(panel, '.close', () => (back ? back() : hud.closeSheet()));
}

export function ruleCardCell(hud, state, data, cell) {
  const n = state.n, b = n.board;
  const lines = [];
  if (b.walls.includes(cell)) lines.push(['Wall', 'Blocks light; cannot hold a gem.']);
  if (b.lanterns.some((l) => l.cell === cell)) lines.push([data.lantern[state.lantern].name + ' Lantern', data.lantern[state.lantern].rule]);
  const ap = n.apertures.find((a) => a.cell === cell);
  if (ap) lines.push(['Aperture', ap.color === 7 ? 'Light that reaches it scores Intensity x Focus.' : 'Coloured: counts only the matching colours of the light.']);
  const fx = b.fixed.find((f) => f.cell === cell);
  if (fx) lines.push([`Set ${data.cut[fx.cut].name}`, 'A clear gem set into the board. It cannot be moved or turned.']);
  if (b.dark.includes(cell)) lines.push(['Dark cell', 'Light loses 2 Intensity crossing it.']);
  if (b.bright.includes(cell)) lines.push(['Bright cell', 'A gem placed here gains a tier.']);
  if (b.fog.includes(cell)) lines.push(['Fog', 'Hides the preview beam beyond it.']);
  const p = n.placed.find((x) => x.cell === cell);
  if (p) { ruleCardGem(hud, data, state.gems[p.uid]); return; }
  if (!lines.length) return;
  const panel = hud.openSheet(`<div class="rulecard">${lines.map(([h, t]) => `<div class="big">${esc(h)}</div><p>${esc(t)}</p>`).join('')}<div class="row end"><button class="btn small close">Close</button></div></div>`);
  bind(panel, '.close', () => hud.closeSheet());
}

export function tutorialDone(hud, state, cb) {
  const last = state.tutorial.index >= 4;
  const panel = hud.openSheet(`<h2>${last ? 'Dawn' : fmt(state.n.lux) + ' Lux'}</h2><div class="row end"><button class="btn next">${last ? 'Begin' : 'Next'}</button></div>`);
  bind(panel, '.next', () => cb.next());
}

export function nightResult(hud, state, data, cb) {
  const h = state.history[state.history.length - 1];
  const p = h.pay;
  const items = [['Night cleared', p.clear], ['Unused casts', p.unused], ['Overkill', p.overkill], ['Rainbow Tax', p.rainbow], ['Interest', p.interest], ['From casts', p.casts]].filter(([, v]) => v);
  const panel = hud.openSheet(`<h2>${h.cleared ? `Night ${h.night} cleared` : 'The light fails'}</h2>
    <p>${fmt(h.lux)} Lux of ${fmt(h.target)}${h.castLux.length ? ` <span class="muted">(${h.castLux.map(fmt).join(' + ')})</span>` : ''}</p>
    ${items.length ? `<h3>Glints</h3>${items.map(([k, v]) => `<div class="row"><span style="flex:1">${k}</span>${glint('+' + v)}</div>`).join('')}` : ''}
    <div class="row end" style="margin-top:14px"><button class="btn next">Continue</button></div>`);
  bind(panel, '.next', () => cb.next());
}

export function reward(hud, state, data, cb) {
  const offers = state.reward.offers;
  const panel = hud.openSheet(`<h2>The Eclipse passes</h2><p class="muted">Choose one gem with an Inclusion.</p>
    ${offers.map((o, i) => `<div class="offer"><div class="card">${cardHTML(data, o, { showStone: false })}</div><div class="info"><b>${esc(o.name)}</b>
      <div>${esc(data.inclusion[o.inclusion].name)}: ${esc(data.inclusion[o.inclusion].rule)}</div></div><button class="btn small pick" data-i="${i}">Take</button></div>`).join('')}
    <div class="row end"><button class="btn small skip">Skip</button></div>`);
  bind(panel, '.pick', (b) => cb.pick(Number(b.dataset.i)));
  bind(panel, '.skip', () => cb.skip());
}

// The Lapidary (section 11): the next Night's board thumbnail and Eclipse warning on top, then three
// shelves (gems, Settings, services). A service opens the pouch as a sheet grouped by cut to pick from.
export function shop(hud, state, data, cb) {
  const s = state.shop;
  const m = modifiers(state, data);
  const next = s.nextEclipse ? data.eclipse[s.nextEclipse] : null;
  const rerollCost = data.prices.reroll.base + data.prices.reroll.step * s.rerolls;
  const svc = data.prices.services;
  const freeSvc = m.freeService && !s.freeUsed;
  const full = state.pouch.length >= data.rules.run.pouchCap;
  const loaned = state.pouch.filter((u) => state.gems[u].loaned).length;
  const canLoan = cb.loanable && (m.loans ?? data.rules.run.loans) > loaned && cb.loanable().length > 0;
  const panel = hud.openSheet(`
    <div class="row" style="justify-content:space-between"><h2>The Lapidary</h2><div class="glints" style="font-size:18px">${SYS_ICONS.glint}<span>${state.glints}</span></div></div>
    ${cb.intro ? `<p class="introline">${esc(cb.intro)}</p>` : ''}
    <div class="nextnight">${boardThumb(s.nextBoard)}<div><div class="big" style="font-family:var(--serif);font-size:18px">Night ${state.night + 1}</div>
      <div>Target ${fmt(s.nextTarget)} Lux</div>${next ? `<div class="eclipse"><b>Eclipse: ${esc(next.name)}.</b> ${esc(next.rule)}</div>` : ''}</div></div>
    <h3>Gems</h3>
    <div class="shelf">${s.gems.map((o, i) => `<div class="item"><div class="card">${cardHTML(data, o, { showStone: false })}</div><b>${esc(o.name)}</b>
      <div class="desc">${esc(data.cut[o.cut].rule)}${o.inclusion ? ` <b style="font-size:14px">${esc(data.inclusion[o.inclusion].name)}:</b> ${esc(data.inclusion[o.inclusion].rule)}` : ''}</div>
      <button class="btn small buygem" data-i="${i}" ${o.sold || o.price > state.glints || full ? 'disabled' : ''}>${o.sold ? 'Sold' : glint(o.price)}</button></div>`).join('')}</div>
    <h3>Settings <span class="muted" style="text-transform:none;letter-spacing:0">(${state.settings.length}/${data.rules.run.maxSettings})</span></h3>
    <div class="shelf">${s.settings.map((o, i) => { const st = data.setting[o.id]; return `<div class="item setting-item"><span class="aicon">${ARCH_ICONS[st.archetype]}</span><b>${esc(st.name)}</b><div class="desc">${esc(st.rule)}</div>
      <button class="btn small buyset" data-i="${i}" ${o.sold || o.price > state.glints ? 'disabled' : ''}>${o.sold ? 'Taken' : glint(o.price)}</button></div>`; }).join('') || '<p class="muted">No new Settings.</p>'}</div>
    <h3>Services <span class="muted" style="text-transform:none;letter-spacing:0">(pouch ${state.pouch.length}/${data.rules.run.pouchCap})</span></h3>
    <div class="svcs">
      <button class="btn small svc" data-k="fuse">Fuse ${glint(svc.fuse)}</button>
      <button class="btn small svc" data-k="recut">Recut ${freeSvc ? 'free' : glint(svc.recut)}</button>
      <button class="btn small svc" data-k="dye">Dye ${freeSvc ? 'free' : glint(svc.dye)}</button>
      <button class="btn small svc" data-k="remove">Remove ${glint(svc.remove)}</button>
      <button class="btn small svc" data-k="sell">Sell</button>
      <button class="btn small svc" data-k="view">Pouch</button>
      ${canLoan ? '<button class="btn small loan">Loan a gem</button>' : ''}
    </div>
    <div class="row end" style="margin-top:16px"><button class="btn small reroll" ${rerollCost > state.glints ? 'disabled' : ''}>Reroll ${glint(rerollCost)}</button><button class="btn leave">Leave</button></div>`);
  bind(panel, '.buygem', (b) => cb.act({ type: 'buyGem', index: Number(b.dataset.i) }));
  // The shelf shows four lines of a rule; a tap on the item reads all of it.
  panel.querySelectorAll('.shelf .item').forEach((it, k) => it.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    const gi = it.querySelector('.buygem'), si = it.querySelector('.buyset');
    if (gi) ruleCardGem(hud, data, s.gems[Number(gi.dataset.i)], () => shop(hud, state, data, cb));
    else if (si) ruleCardSetting(hud, data, s.settings[Number(si.dataset.i)].id, () => shop(hud, state, data, cb));
    void k;
  }));
  bind(panel, '.buyset', (b) => {
    const i = Number(b.dataset.i);
    if (state.settings.length >= data.rules.run.maxSettings) {
      const p2 = hud.openSheet(`<h2>Replace a Setting</h2>${state.settings.map((id) => `<div class="offer"><div class="info"><b>${esc(data.setting[id].name)}</b><div>${esc(data.setting[id].rule)}</div></div><button class="btn small rep" data-id="${id}">Replace</button></div>`).join('')}<div class="row end"><button class="btn small back">Back</button></div>`);
      bind(p2, '.rep', (x) => cb.act({ type: 'buySetting', index: i, replace: x.dataset.id }));
      bind(p2, '.back', () => shop(hud, state, data, cb));
      return;
    }
    cb.act({ type: 'buySetting', index: i });
  });
  bind(panel, '.reroll', () => cb.act({ type: 'reroll' }));
  bind(panel, '.leave', () => cb.leave());
  bind(panel, '.loan', () => {
    const list = cb.loanable();
    const p2 = hud.openSheet(`<h2>Loan a Cabinet gem</h2><p class="muted">Heirloom: one more gem joins this run. A loaned gem that is Fractured or sold is gone for good.</p>
      <div class="pouchgrid">${list.map((g) => `<div class="card lg" data-id="${g.cabinetId}">${cardHTML(data, g, { showStone: false })}</div>`).join('')}</div>
      <div class="row end" style="margin-top:12px"><button class="btn small back">Back</button></div>`);
    bind(p2, '.lg', (c) => { const g = list.find((x) => x.cabinetId === Number(c.dataset.id)); cb.act({ type: 'loan', gem: { ...g } }); });
    bind(p2, '.back', () => shop(hud, state, data, cb));
  });
  bind(panel, '.svc', (b) => pouchSheet(hud, state, data, cb, b.dataset.k));
}

const SERVICE = {
  fuse: { title: 'Fuse', need: 2, note: 'Pick two identical gems: they become one, a tier higher.' },
  recut: { title: 'Recut', need: 1, note: 'Pick a gem to recut into another cut of equal or lower rarity.' },
  dye: { title: 'Dye', need: 1, note: 'Pick a gem to dye another colour.' },
  remove: { title: 'Remove', need: 1, note: 'Pick a gem to take out of the pouch for good.' },
  sell: { title: 'Sell', need: 1, note: 'Pick a gem to sell for Glints.' },
  view: { title: 'Your pouch', need: 0, note: 'Tap a gem to read it.' },
};

// The pouch as a bottom sheet, grouped by cut; a service picks from it.
function pouchSheet(hud, state, data, cb, kind) {
  const k = SERVICE[kind];
  const pouch = state.pouch.map((u) => state.gems[u]);
  const eligible = (g) => {
    if (kind === 'fuse') return pouch.some((h) => h.uid !== g.uid && sameKind(h, g));
    if (kind === 'recut') return data.cuts.some((c) => c.id !== g.cut && RANK[c.rarity] <= RANK[data.cut[g.cut].rarity]);
    return true;
  };
  const groups = data.cuts.map((c) => ({ c, gems: pouch.filter((g) => g.cut === c.id) })).filter((x) => x.gems.length);
  const panel = hud.openSheet(`<h2>${k.title}</h2><p class="muted">${k.note}</p>
    ${groups.map(({ c, gems }) => `<div class="cutgroup"><h4>${CUT_ICONS[c.id]}${esc(c.name)} <span class="muted">${gems.length}</span></h4>
      <div class="pouchgrid">${gems.map((g) => `<div class="card pg ${eligible(g) ? '' : 'dim'}" data-uid="${g.uid}">${cardHTML(data, g, { showStone: false })}</div>`).join('')}</div></div>`).join('')}
    <div class="row end" style="margin-top:14px">${kind === 'fuse' ? '<button class="btn small dofuse" disabled>Fuse</button>' : ''}<button class="btn small back">Back</button></div>`);
  bind(panel, '.back', () => shop(hud, state, data, cb));
  const sel = [];
  panel.querySelectorAll('.pg').forEach((c) => c.addEventListener('click', () => {
    const gm = state.gems[Number(c.dataset.uid)];
    if (kind === 'view') { ruleCardGem(hud, data, gm, () => pouchSheet(hud, state, data, cb, 'view')); return; }
    if (c.classList.contains('dim')) { hud.toast(kind === 'fuse' ? 'Needs an identical twin' : 'Nothing to do with this gem'); return; }
    if (kind === 'fuse') {
      const i = sel.indexOf(gm.uid);
      if (i >= 0) { sel.splice(i, 1); c.classList.remove('sel'); }
      else {
        if (sel.length && !sameKind(state.gems[sel[0]], gm)) { for (const u of sel.splice(0)) panel.querySelector(`.pg[data-uid="${u}"]`).classList.remove('sel'); }
        sel.push(gm.uid); c.classList.add('sel');
        if (sel.length > 2) { const x = sel.shift(); panel.querySelector(`.pg[data-uid="${x}"]`).classList.remove('sel'); }
      }
      panel.querySelector('.dofuse').disabled = sel.length !== 2;
      return;
    }
    if (kind === 'remove') return cb.act({ type: 'remove', uid: gm.uid });
    if (kind === 'sell') return cb.act({ type: 'sell', uid: gm.uid });
    if (kind === 'recut') {
      const cuts = data.cuts.filter((x) => x.id !== gm.cut && RANK[x.rarity] <= RANK[data.cut[gm.cut].rarity]);
      const p2 = hud.openSheet(`<h2>Recut ${esc(gm.name)}</h2><div class="row">${cuts.map((x) => `<button class="btn small to" data-c="${x.id}">${esc(x.name)}</button>`).join('')}</div><div class="row end"><button class="btn small back">Back</button></div>`);
      bind(p2, '.to', (x) => cb.act({ type: 'recut', uid: gm.uid, cut: x.dataset.c }));
      bind(p2, '.back', () => pouchSheet(hud, state, data, cb, kind));
      return;
    }
    if (kind === 'dye') {
      const p2 = hud.openSheet(`<h2>Dye ${esc(gm.name)}</h2><div class="row">${data.shop.dyeStones.filter((x) => x !== gm.stone).map((x) => `<button class="btn small to" data-s="${x}" style="border-color:${data.stone[x].hex}">${esc(data.stone[x].name)}</button>`).join('')}</div><div class="row end"><button class="btn small back">Back</button></div>`);
      bind(p2, '.to', (x) => cb.act({ type: 'dye', uid: gm.uid, stone: x.dataset.s }));
      bind(p2, '.back', () => pouchSheet(hud, state, data, cb, kind));
    }
  }));
  bind(panel, '.dofuse', () => { if (sel.length === 2) cb.act({ type: 'fuse', uids: sel.slice() }); });
}

// Run summary (section 11): total Lux, the best cast (watch it, share it as a seed link), gems found, and
// what the run did to the save: gems into the Cabinet, loans lost, Lanterns and Vigils, achievements.
export function summary(hud, state, data, cb) {
  const st = state.stats;
  const cleared = state.history.filter((h) => h.cleared).length;
  const found = st.inclusionGems.map((u) => state.gems[u]).filter(Boolean);
  const o = cb.outcome;
  const won = state.phase === 'won' || state.endless;
  const lines = [];
  if (o) {
    for (const id of o.unlocked) lines.push(['star', `New Lantern: <b>${esc(data.lantern[id].name)}</b>. ${esc(data.lantern[id].rule)}`]);
    if (o.vigilCleared !== null && o.vigilCleared !== undefined) lines.push(['flame', `Vigil ${o.vigilCleared} cleared with the ${esc(data.lantern[state.lantern].name)}.`]);
    if (o.added.length) lines.push(['glint', `${o.added.length} gem${o.added.length === 1 ? '' : 's'} into the Cabinet${o.ground ? `, ${o.ground} ground to Dust (the Cabinet is full)` : ''}.`]);
    if (o.lost.length) lines.push(['close', `${o.lost.length} loaned gem${o.lost.length === 1 ? ' is' : 's are'} gone for good.`, 'lost']);
    for (const id of o.earned) { const a = cb.achievement(id); if (a) lines.push(['star', `<b>${esc(a.name)}</b>: ${esc(a.desc)}`]); }
  }
  const panel = hud.openSheet(`<h2>${cb.pendingWin ? 'Dawn over the last Night' : won ? 'The run is won' : 'The run ends'}</h2>
    <div class="bigstat"><div><b>${fmt(st.totalLux)}</b><span>Lux in total</span></div><div><b>${cleared}</b><span>Night${cleared === 1 ? '' : 's'} cleared</span></div>${st.bestCast ? `<div><b>${fmt(st.bestCast.lux)}</b><span>best cast</span></div>` : ''}</div>
    ${st.eclipsesBeaten || st.dawns ? `<p class="muted">${st.eclipsesBeaten ? `${st.eclipsesBeaten} Eclipse${st.eclipsesBeaten === 1 ? '' : 's'} beaten. ` : ''}${st.dawns ? `${st.dawns} Dawn${st.dawns === 1 ? '' : 's'}.` : ''}</p>` : ''}
    ${st.bestCast ? `<div class="row"><button class="btn small watch">${SYS_ICONS.replay.replace('<svg', '<svg style="width:18px;height:18px;vertical-align:-3px"')} Watch best cast</button><button class="btn small share">Share it</button></div>` : ''}
    ${found.length ? `<h3>Gems found</h3><div class="pouchgrid">${found.map((g) => `<div class="card">${cardHTML(data, g, { showStone: false })}</div>`).join('')}</div>` : ''}
    ${lines.length ? `<div class="outcome">${lines.map(([ic, t, cls]) => `<div class="line ${cls || ''}">${SYS_ICONS[ic] || ''}<span>${t}</span></div>`).join('')}</div>` : ''}
    <div class="row end" style="margin-top:16px">${cb.pendingWin ? '<button class="btn small endless">Keep going</button><button class="btn finish">Finish the run</button>' : '<button class="btn small totitle">Title</button><button class="btn newrun">New run</button>'}</div>`);
  bind(panel, '.watch', () => cb.watch());
  bind(panel, '.share', () => cb.share());
  bind(panel, '.endless', () => cb.endless());
  bind(panel, '.finish', () => cb.finish());
  bind(panel, '.totitle', () => cb.title());
  bind(panel, '.newrun', () => cb.newRun());
}

// After a replay: share the cast as a seed link, and as a short clip where the browser can record one.
export function replayShare(hud, { link, clip }) {
  const panel = hud.openSheet(`<h2>Share this cast</h2><p class="muted">The link rebuilds the run from its seed and every move, then plays this cast.</p>
    <div class="row"><button class="btn small copy">Copy link</button>${clip ? '<button class="btn small clip" disabled>Clip...</button>' : ''}<button class="btn small close">Close</button></div>`);
  panel.querySelector('.copy').addEventListener('click', async () => {
    try { if (navigator.share) await navigator.share({ url: link }); else await navigator.clipboard.writeText(link); hud.toast('Link ready'); } catch { hud.toast('Copy failed'); }
  });
  panel.querySelector('.close').addEventListener('click', () => hud.closeSheet());
  if (clip) {
    const b = panel.querySelector('.clip');
    clip.ready.then((blob) => {
      if (!blob) { b.remove(); return; }
      b.disabled = false; b.textContent = 'Save clip';
      b.addEventListener('click', async () => {
        const file = new File([blob], 'cast.webm', { type: blob.type });
        try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; } } catch { /* fall back to a download */ }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cast.webm'; a.click();
      });
    });
  }
}
