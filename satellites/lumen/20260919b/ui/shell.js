// The shell around the Nights (section 11): Title, Lantern select (Vigil and loans), the Cabinet (drawers
// by stone, Dust, Inclusion rerolls), achievements, settings (sound, beam patterns, reduced motion, save
// export and import) and the one-sentence first-contact intros. Full-screen DOM panels over the board,
// which plays attract-mode casts behind the Title.
import STRINGS from '../data/strings.json' with { type: 'json' };
import { DATA } from '../sim/data.js';
import { CABINET, ACHIEVEMENTS, LEGENDS, validLoans, grind, rerollInclusion, vigilAvailable } from '../sim/meta.js';
import { cardHTML } from './hud.js';
import { ARCH_ICONS, SYS_ICONS, CUT_ICONS } from './icons.js';
import { fmt } from './format.js';
import { exportJSON, importJSON } from '../state/save.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BEAM = { 1: '#ff5a4e', 2: '#58e07a', 4: '#5a8cff', 7: '#fff3d6' };
const T = STRINGS.title;

export function unlockText(u, data = DATA) {
  let t = STRINGS.unlocks[u.kind] || '';
  for (const [k, v] of Object.entries(u)) t = t.replace(`{${k}}`, k === 'archetype' ? v[0].toUpperCase() + v.slice(1) : v);
  void data;
  return t;
}

// The Lantern's light as a small glyph: one ray per beam in its colour.
function lampGlyph(L) {
  const beams = L.emitters.flat();
  const n = beams.length;
  const rays = beams.map((b, i) => {
    const a = (-90 + (n > 1 ? (i - (n - 1) / 2) * 34 : 0)) * (Math.PI / 180);
    const w = 1.2 + Math.log10(1 + b.intensity) * 1.6;
    return `<line x1="32" y1="40" x2="${(32 + Math.cos(a) * 26).toFixed(1)}" y2="${(40 + Math.sin(a) * 26).toFixed(1)}" stroke="${BEAM[b.color] || '#fff'}" stroke-width="${w.toFixed(1)}" stroke-linecap="round"/>`;
  }).join('');
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="lg-${L.id}"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#fff3c400"/></radialGradient></defs>
    <circle cx="32" cy="40" r="20" fill="url(#lg-${L.id})" opacity="0.5"/>${rays}<circle cx="32" cy="40" r="7" fill="#1b1510" stroke="#caa35a" stroke-width="1.6"/><circle cx="32" cy="40" r="3" fill="#ffd98a"/></svg>`;
}

function flameRow(cleared) {
  // Highest Vigil cleared as a flame colour (section 10); none cleared = no flame.
  if (cleared === undefined) return '';
  return `<span class="vflame" style="color:${CABINET.vigilFlames[Math.min(cleared, CABINET.vigilFlames.length - 1)]}">${SYS_ICONS.flame}</span><span class="vtxt">Vigil ${cleared}</span>`;
}

export function createShell(root, ctx, data = DATA) {
  root.innerHTML = '';
  let current = null;
  const P = () => ctx.profile();

  function mount(cls, html) {
    root.innerHTML = `<div class="scr ${cls}">${html}</div>`;
    root.classList.add('on');
    current = cls;
    const el = root.firstChild;
    el.querySelectorAll('.back').forEach((b) => b.addEventListener('click', () => title()));
    return el;
  }
  function hide() { root.classList.remove('on'); root.innerHTML = ''; current = null; }
  const on = (el, sel, fn) => el.querySelectorAll(sel).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); fn(b, e); }));
  const header = (h, extra = '') => `<header class="shead"><button class="iconbtn back" aria-label="Back">${SYS_ICONS.back}</button><h2>${h}</h2>${extra}</header>`;

  // ------------------------------------------------------------------ Title
  function title() {
    const p = P();
    const run = p.currentRun;
    const nAch = Object.keys(p.achievements).length;
    const el = mount('title', `
      <div class="logo"><h1>${esc(STRINGS.displayName)}</h1><p>${esc(STRINGS.tagline)}</p></div>
      <div class="menu">
        ${run ? `<button class="btn primary cont">${T.continue}<small>Night ${run.night || 1} · ${esc(data.lantern[run.opts.lantern].name)}${run.opts.vigil ? ` · Vigil ${run.opts.vigil}` : ''}</small></button>` : ''}
        <button class="btn ${run ? '' : 'primary'} play">${run ? T.newRun : T.play}</button>
        <div class="two"><button class="btn cab">${T.cabinet}<small>${p.cabinet.length}/${CABINET.capacity}</small></button><button class="btn ach">${T.achievements}<small>${nAch}/${ACHIEVEMENTS.achievements.length}</small></button></div>
        <div class="two"><button class="btn n0">${T.night0}</button><button class="btn set">${T.settings}</button></div>
      </div>`);
    on(el, '.cont', () => { hide(); ctx.resume(); });
    on(el, '.play', () => lanternSelect());
    on(el, '.cab', () => cabinet());
    on(el, '.ach', () => achievements());
    on(el, '.n0', () => { hide(); ctx.startTutorial(); });
    on(el, '.set', () => settings());
    ctx.onTitle && ctx.onTitle();
  }

  // ------------------------------------------------------------------ Lantern select
  function lanternSelect(pick = {}) {
    const p = P();
    const unlocked = new Set(p.unlocks.lanterns);
    const sel = { lantern: pick.lantern && unlocked.has(pick.lantern) ? pick.lantern : p.profile.lastLantern && unlocked.has(p.profile.lastLantern) ? p.profile.lastLantern : 'candle', vigil: 0, loans: [] };
    const el = mount('lanterns', `${header('Choose a Lantern')}
      <div class="lcards">${data.lanterns.map((L) => {
        const open = unlocked.has(L.id);
        return `<div role="button" tabindex="0" class="lcard ${open ? '' : 'locked'}" data-id="${L.id}" ${open ? '' : 'aria-disabled="true"'}>
          <div class="lamp">${lampGlyph(L)}</div><h3>${esc(L.name)}</h3><p>${esc(L.rule)}</p>
          <div class="vrow">${open ? flameRow(p.unlocks.vigil[L.id]) : `<span class="lock">${esc(unlockText(L.unlock))}</span>`}</div></div>`;
      }).join('')}</div>
      <section class="vigil"><h3>Vigil</h3><div class="vchips"></div><ul class="vlist"></ul></section>
      <section class="loans"><h3>Loans <span class="lcount"></span></h3><p class="muted lnote"></p><div class="lgrid"></div></section>
      <div class="go"><button class="btn primary start">Light the Lantern</button></div>`);
    const loanLimit = data.rules.run.loans;
    function render() {
      el.querySelectorAll('.lcard').forEach((c) => c.classList.toggle('sel', c.dataset.id === sel.lantern));
      const avail = vigilAvailable(p, sel.lantern);
      if (sel.vigil > avail) sel.vigil = avail;
      el.querySelector('.vchips').innerHTML = Array.from({ length: avail + 1 }, (_, v) => `<button class="vchip ${v === sel.vigil ? 'sel' : ''}" data-v="${v}" aria-label="Vigil ${v}"><span style="color:${v ? CABINET.vigilFlames[v] : '#6f6656'}">${SYS_ICONS.flame}</span>${v}</button>`).join('');
      el.querySelector('.vlist').innerHTML = sel.vigil ? data.vigils.levels.filter((r) => r.level <= sel.vigil).map((r) => `<li>${esc(r.text)}</li>`).join('') : `<li class="muted">${avail ? 'No Vigil: the plain run.' : 'Win a run with this Lantern to light Vigil 1.'}</li>`;
      el.querySelectorAll('.vchip').forEach((b) => b.addEventListener('click', () => { sel.vigil = Number(b.dataset.v); render(); }));
      const cab = p.cabinet;
      el.querySelector('.lcount').textContent = `(${sel.loans.length}/${loanLimit})`;
      el.querySelector('.lnote').textContent = cab.length ? 'Lend Cabinet gems to this run. A loaned gem that is Fractured or sold is gone for good.' : 'Inclusion gems you end a run with are kept in the Cabinet; lend them to later runs.';
      el.querySelector('.lgrid').innerHTML = cab.map((g) => `<div class="card lg ${sel.loans.includes(g.cabinetId) ? 'sel' : ''}" data-id="${g.cabinetId}">${cardHTML(data, g, { showStone: false })}</div>`).join('');
      el.querySelectorAll('.lg').forEach((c) => c.addEventListener('click', () => {
        const id = Number(c.dataset.id);
        const i = sel.loans.indexOf(id);
        if (i >= 0) sel.loans.splice(i, 1);
        else {
          const next = [...sel.loans, id];
          const err = validLoans(next.map((x) => cab.find((g) => g.cabinetId === x)), loanLimit);
          if (err) { ctx.toast(err[0].toUpperCase() + err.slice(1)); return; }
          sel.loans = next;
        }
        render();
      }));
      el.querySelector('.start').textContent = `Light the ${data.lantern[sel.lantern].name}`;
    }
    el.querySelectorAll('.lcard').forEach((c) => c.addEventListener('click', () => {
      if (c.classList.contains('locked')) { ctx.toast(unlockText(data.lantern[c.dataset.id].unlock)); return; }
      sel.lantern = c.dataset.id; sel.vigil = 0; render();
    }));
    on(el, '.start', () => {
      const loans = sel.loans.map((id) => ({ ...p.cabinet.find((g) => g.cabinetId === id) }));
      p.profile.lastLantern = sel.lantern;
      hide();
      ctx.startRun({ lantern: sel.lantern, vigil: sel.vigil, loans });
    });
    render();
    const selCard = el.querySelector('.lcard.sel');
    if (selCard) selCard.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  // ------------------------------------------------------------------ Cabinet
  function cabinet(stone = null) {
    const p = P();
    const first = intro('cabinet', true);
    const cab = p.cabinet;
    const stones = data.stones.filter((s) => !s.neutral);
    const pairs = new Set(cab.map((g) => `${g.cut}:${g.stone}`)).size;
    const incl = new Set(cab.map((g) => g.inclusion).filter(Boolean)).size;
    const legends = new Set(cab.filter((g) => g.legend).map((g) => g.legend)).size;
    const el = mount('cabinet', `${header('The Cabinet', `<div class="dust" title="Dust"><span>${SYS_ICONS.dust}</span>${fmt(p.dust)}</div>`)}
      ${first ? `<p class="introline">${esc(first)}</p>` : ''}
      <div class="goals">
        <div><b>${cab.length}</b><span>of ${CABINET.capacity} gems</span></div>
        <div><b>${pairs}</b><span>of ${data.cuts.length * stones.length} pairs</span></div>
        <div><b>${incl}</b><span>of ${data.inclusions.length} Inclusions</span></div>
        <div><b>${legends}</b><span>of ${LEGENDS.legends.length} Legends</span></div>
      </div>
      <nav class="dtabs">${stones.map((s) => `<button class="dtab" data-s="${s.id}" aria-label="${esc(s.name)}"><i style="background:${s.hex}"></i></button>`).join('')}</nav>
      <div class="drawers">${stones.map((s) => {
        const gems = cab.filter((g) => g.stone === s.id);
        return `<section class="drawer" data-s="${s.id}"><h3><i style="background:${s.hex}"></i>${esc(s.name)} <span class="muted">${gems.length}</span></h3>
          ${gems.length ? `<div class="dgrid">${gems.map((g) => `<div class="card cg" data-id="${g.cabinetId}">${cardHTML(data, g, { showStone: false })}</div>`).join('')}</div>` : '<p class="muted empty">Empty drawer.</p>'}
          <div class="pairs">${data.cuts.map((c) => `<span class="pair ${cab.some((g) => g.stone === s.id && g.cut === c.id) ? 'got' : ''}" title="${esc(c.name)}">${CUT_ICONS[c.id]}</span>`).join('')}</div></section>`;
      }).join('')}</div>`);
    const dr = el.querySelector('.drawers');
    const tabs = el.querySelectorAll('.dtab');
    const markTab = () => { const i = Math.round(dr.scrollLeft / Math.max(1, dr.clientWidth)); tabs.forEach((t, k) => t.classList.toggle('sel', k === i)); };
    dr.addEventListener('scroll', markTab, { passive: true });
    tabs.forEach((t, k) => t.addEventListener('click', () => dr.scrollTo({ left: k * dr.clientWidth, behavior: 'smooth' })));
    if (stone) { const k = stones.findIndex((s) => s.id === stone); if (k >= 0) dr.scrollLeft = k * dr.clientWidth; }
    markTab();
    on(el, '.cg', (c) => gemDetail(Number(c.dataset.id)));
  }

  function gemDetail(cabinetId) {
    const p = P();
    const g = p.cabinet.find((x) => x.cabinetId === cabinetId);
    if (!g) return;
    const inc = g.inclusion ? data.inclusion[g.inclusion] : null;
    const sheet = document.createElement('div');
    sheet.className = 'ssheet';
    sheet.innerHTML = `<div class="panel"><div class="row"><div class="card" style="width:70px;height:98px;flex:0 0 70px">${cardHTML(data, g, { showStone: false })}</div>
      <div><div class="big">${esc(g.name)}</div><div class="muted">No. ${g.gemId}${g.legend ? ' · Legend' : ''}</div>
      <div class="muted">From run ${esc(String(g.fromRun || '?'))}${g.lantern ? ` (${esc(data.lantern[g.lantern] ? data.lantern[g.lantern].name : g.lantern)})` : ''}</div>
      <div class="muted">Best cast: ${fmt(g.bestLux || 0)} Lux</div></div></div>
      <p>${esc(data.cut[g.cut].rule)}</p>${inc ? `<p><b>${esc(inc.name)}:</b> ${esc(inc.rule)}</p>` : ''}
      <div class="row end"><button class="btn small grind">Grind +${CABINET.dustPerGem} Dust</button><button class="btn small reroll" ${p.dust < CABINET.rerollCost ? 'disabled' : ''}>Reroll Inclusion ${CABINET.rerollCost}</button><button class="btn small close">Close</button></div></div>`;
    root.firstChild.append(sheet);
    const close = () => sheet.remove();
    sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
    on(sheet, '.close', close);
    on(sheet, '.grind', (b) => {
      if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'Tap again to grind'; return; }
      grind(p, cabinetId); ctx.persist(); cabinet(g.stone);
    });
    on(sheet, '.reroll', () => { if (rerollInclusion(p, cabinetId, data)) { ctx.persist(); cabinet(g.stone); gemDetail(cabinetId); } });
  }

  // ------------------------------------------------------------------ achievements
  function achievements() {
    const p = P();
    const got = ACHIEVEMENTS.achievements.filter((a) => p.achievements[a.id]).length;
    mount('achs', `${header('Achievements', `<div class="dust">${got}/${ACHIEVEMENTS.achievements.length}</div>`)}
      <ul class="alist">${ACHIEVEMENTS.achievements.map((a) => `<li class="${p.achievements[a.id] ? 'got' : ''}"><span class="star">${SYS_ICONS.star}</span><div><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></div></li>`).join('')}</ul>`);
  }

  // ------------------------------------------------------------------ settings
  function settings() {
    const p = P();
    const prefs = p.profile.prefs;
    const toggle = (k, label, note) => `<label class="tog"><div><b>${label}</b><span>${note}</span></div><input type="checkbox" data-k="${k}" ${prefs[k] ? 'checked' : ''}><i></i></label>`;
    const el = mount('settings', `${header('Settings')}
      <div class="tlist">
        ${toggle('muted', 'Mute', 'Silence music and light notes.')}
        ${toggle('patterns', 'Beam patterns', 'Red solid, green dashed, blue dotted.')}
        ${toggle('reducedMotion', 'Reduced motion', 'No bloom swells, shake or pulses.')}
        ${toggle('lowPower', 'Low power', 'Simpler gem glass for older phones.')}
      </div>
      <h3>Save</h3>
      <p class="muted">Everything lives on this device. Export a copy to move it or keep it safe.</p>
      <div class="row"><button class="btn small export">Export save</button><button class="btn small import">Import save</button><input type="file" accept="application/json,.json" class="file" hidden></div>
      <p class="muted small ver">${esc(STRINGS.displayName)} · save v${p.v}</p>`);
    el.querySelectorAll('input[type=checkbox]').forEach((c) => c.addEventListener('change', () => { prefs[c.dataset.k] = c.checked; ctx.persist(); ctx.applyPrefs(); }));
    on(el, '.export', () => {
      const text = exportJSON(p);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = `${STRINGS.codeName}-save.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      ctx.toast('Save exported');
    });
    const file = el.querySelector('.file');
    on(el, '.import', () => file.click());
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      try { ctx.replaceProfile(importJSON(await f.text())); ctx.toast('Save imported'); title(); } catch (err) { ctx.toast(`Not a save file (${err.message})`); }
    });
  }

  // ------------------------------------------------------------------ first contact
  let introEl = null;
  // inline: mark it seen and return the sentence for the caller to place in its own layout.
  function intro(key, inline = false) {
    const p = P();
    if (p.profile.seen[key] || !STRINGS.intros[key]) return false;
    p.profile.seen[key] = 1;
    ctx.persist();
    if (inline) return STRINGS.intros[key];
    if (introEl) introEl.remove();
    introEl = document.createElement('div');
    introEl.className = 'intro';
    introEl.innerHTML = `<span>${esc(STRINGS.intros[key])}</span>`;
    document.getElementById('app').append(introEl);
    const el = introEl;
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 400); };
    el.addEventListener('pointerdown', kill);
    setTimeout(kill, 5200);
    return true;
  }

  return { title, lanternSelect, cabinet, achievements, settings, hide, intro, get current() { return current; } };
}
