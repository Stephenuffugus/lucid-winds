// DOM HUD over the canvas (section 11 layout): status bar, Settings rail, Eclipse banner, the hand of gem
// cards with placement pips and the redraw button, and the full-width Cast button with casts-left flames.
import { CUT_ICONS, SYS_ICONS, ARCH_ICONS, channelGlyph } from './icons.js';
import { fmt } from './format.js';

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

export function cardHTML(data, gm, opts = {}) {
  const stone = data.stone[gm.stone];
  const cut = data.cut[gm.cut];
  const tier = gm.tier ? '<span class="tier">' + '◆'.repeat(gm.tier) + '</span>' : '';
  const incl = gm.inclusion ? `<span class="incl" title="${data.inclusion[gm.inclusion].name}"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z"/></svg></span>` : '';
  return `<div class="gem" style="background: radial-gradient(circle at 35% 30%, #fff8, ${stone.hex} 45%, #0008 100%)">${CUT_ICONS[gm.cut]}</div>
    <div class="nm">${cut.name}${opts.showStone === false ? '' : `<br><span style="color:${stone.hex}">${stone.name}</span>`}</div>
    <div class="meta">${tier}<span style="color:${stone.hex}">${channelGlyph(stone.channels)}</span></div>${incl}`;
}

export function createHUD(root, data) {
  root.innerHTML = '';
  const status = el('header', '', '');
  status.id = 'status';
  const night = el('div', 'night', 'Night');
  const luxbar = el('div', 'luxbar', '<div class="fill"></div><div class="txt"><span class="lux">0</span>&nbsp;/&nbsp;<span class="target">0</span></div>');
  const glints = el('div', 'glints', `${SYS_ICONS.glint}<span>0</span>`);
  const pause = el('button', 'iconbtn hit', SYS_ICONS.pause);
  const replayBtn = el('button', 'iconbtn hit replay', SYS_ICONS.replay);
  replayBtn.setAttribute('aria-label', 'Replay the last cast');
  pause.setAttribute('aria-label', 'Pause');
  status.append(night, luxbar, glints, pause);
  const rail = el('div', ''); rail.id = 'rail';
  const banner = el('div', ''); banner.id = 'banner';
  const verb = el('div', ''); verb.id = 'verb';
  const castTotal = el('div', ''); castTotal.id = 'castTotal';
  const handzone = el('section', ''); handzone.id = 'handzone';
  const pips = el('div', 'pips');
  const redraw = el('button', 'iconbtn redraw hit', SYS_ICONS.redraw);
  redraw.setAttribute('aria-label', 'Redraw');
  const hand = el('div', 'hand');
  handzone.append(pips, redraw, replayBtn, hand);
  const actionbar = el('footer', ''); actionbar.id = 'actionbar';
  const cast = el('button', 'hit', '<span class="hold"></span><span class="lbl">CAST</span><span class="flames"></span>');
  cast.id = 'cast';
  actionbar.append(cast);
  const sheet = el('div', ''); sheet.id = 'sheet';
  root.append(status, rail, banner, verb, castTotal, handzone, actionbar, sheet);

  let displayedLux = 0;
  let roll = null;
  function rollTo(node, from, to) {
    if (roll) cancelAnimationFrame(roll.raf);
    if (to <= from || to - from < 2) { node.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = Math.min(450, 120 + 40 * Math.log2(1 + to - from));
    const stepf = (now) => { const k = Math.min(1, (now - t0) / dur); node.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) roll = { raf: requestAnimationFrame(stepf) }; else roll = null; };
    roll = { raf: requestAnimationFrame(stepf) };
  }
  const hud = {
    root, status, rail, banner, verb, hand, handzone, pips, redraw, cast, sheet, pause, castTotal, replayBtn,
    showReplay(on) { replayBtn.style.visibility = on ? 'visible' : 'hidden'; },
    get displayedLux() { return displayedLux; },
    setNight(label) { night.textContent = label; },
    setLux(lux, target) {
      // displayedLux is the exact number; the digits roll up to it (section 8 juice).
      const from = displayedLux;
      displayedLux = lux;
      rollTo(luxbar.querySelector('.lux'), from, lux);
      luxbar.querySelector('.target').textContent = fmt(target);
      luxbar.querySelector('.fill').style.width = `${Math.min(100, target ? (100 * lux) / target : 0)}%`;
      luxbar.classList.toggle('crossed', target > 0 && lux >= target);
      luxbar.dataset.lux = String(lux);
    },
    setGlints(n) { glints.querySelector('span').textContent = String(n); },
    setSettings(ids) {
      rail.innerHTML = '';
      for (const id of ids) {
        const s = data.setting[id];
        const b = el('button', 'setting hit', `${ARCH_ICONS[s.archetype]}<b>${s.name.split(' ').map((w) => w[0]).join('')}</b>`);
        b.dataset.setting = id;
        b.setAttribute('aria-label', s.name);
        rail.append(b);
      }
    },
    pulseSetting(id) { const b = rail.querySelector(`[data-setting="${id}"]`); if (b) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); } },
    setBanner(text) { banner.textContent = text || ''; banner.classList.toggle('on', !!text); },
    setVerb(text) { verb.textContent = text || ''; verb.classList.toggle('on', !!text); },
    setHand(state, opts = {}) {
      hand.innerHTML = '';
      const uids = state.n.hand;
      const n = uids.length;
      uids.forEach((uid, i) => {
        const gm = state.gems[uid];
        const c = el('div', 'card', cardHTML(data, gm, { showStone: false }));
        c.dataset.uid = String(uid);
        const a = n > 1 ? (i - (n - 1) / 2) * 5 : 0;
        c.style.transform = `rotate(${a}deg) translateY(${Math.abs(a) * 0.9}px)`;
        if (opts.marked && opts.marked.has(uid)) c.classList.add('marked');
        if (opts.hint && opts.hint === uid) c.classList.add('hint');
        hand.append(c);
      });
    },
    setPips(left, total) {
      pips.innerHTML = '';
      for (let k = 0; k < total; k++) pips.append(el('span', 'pip' + (k < left ? ' full' : '')));
    },
    setCasts(left, total, enabled) {
      const f = cast.querySelector('.flames');
      f.innerHTML = '';
      for (let k = 0; k < total; k++) f.append(el('span', k < left ? '' : 'out', SYS_ICONS.flame));
      cast.disabled = !enabled;
    },
    showCastTotal(text) { castTotal.textContent = text; castTotal.classList.add('on'); },
    hideCastTotal() { castTotal.classList.remove('on'); },
    pop(x, y, text) {
      const p = el('div', 'pop', text);
      p.style.left = `${x}px`; p.style.top = `${y}px`;
      root.append(p);
      setTimeout(() => p.remove(), 1200);
    },
    toast(msg) {
      const t = el('div', 'toast', msg);
      root.append(t);
      setTimeout(() => t.remove(), 2300);
    },
    // Re-rendering the same sheet (a purchase in the Lapidary) keeps its scroll and does not slide in again.
    openSheet(html) {
      const old = sheet.classList.contains('on') ? sheet.firstChild : null;
      const oldHead = old && old.querySelector('h2') ? old.querySelector('h2').textContent : null;
      const top = old ? old.scrollTop : 0;
      sheet.innerHTML = `<div class="panel">${html}</div>`;
      sheet.classList.add('on');
      const panel = sheet.firstChild;
      if (old) panel.style.animation = 'none';
      const head = panel.querySelector('h2');
      if (old && head && head.textContent === oldHead) panel.scrollTop = top;
      return panel;
    },
    closeSheet() { sheet.classList.remove('on'); sheet.innerHTML = ''; },
    get sheetOpen() { return sheet.classList.contains('on'); },
  };
  return hud;
}
