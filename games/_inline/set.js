// ═══ LUCID WINDS — Three Sisters (standalone, the painted deck) ═══
// 25 Oct 2026, Part 1 of the Three Sisters rebuild from Astra's Seed Catalogue return (vault-20261025-three-sisters-astra,
// cut by scripts/cut_set_pack.py into assets/games/set/t1). The rules, the deck, Classic, the Daily and the share line are
// the engine that was here before; the rendering is her deck on her table: a painted card with a fixed colour seal in its
// header (the second colour channel), one to three glyphs on a quiet paper backing, a check and a border when selected,
// a wrong trio explained by the trait that failed (never shaken, never red, never charged), the fx frames as extra
// feedback only, four cues made in the page (her WAVs are the reference), and the display settings she specified: inks,
// plain surfaces, larger cards, full labels, reduced motion, sound. The hub's inline copy (index.html Block 12) is Part 2.
(function(){
  'use strict';
  var G = window._G;
  var _e = G.e, _playWin = G.playWin, _st = G.st, ms = G.ms, mm = G.mm, mc = G.mc, sm = G.sm, _sr = G.sr;

  var BUILD = 't1.0';                                   // shown in Settings; every art URL carries it
  var ART = '/assets/games/set/t1/';
  var art = function(rel){ return ART + rel + '?v=' + BUILD; };
  var SHAPES = ['corn', 'bean', 'squash'];              // the stable trait IDs: shape 0..2
  var COLOURS = ['blue', 'gold', 'rose'];               // colour 0..2, the order the saved Daily records always used (B G R)
  var SEALS = { blue: 'wave', gold: 'sun', rose: 'leaf' };
  var SHADINGS = ['solid', 'striped', 'empty'];
  var NUMBERS = [1, 2, 3];
  var TRAIT_NAMES = { shape: 'shape', color: 'colour', shading: 'fill', number: 'count' };
  var DAILY_TARGET = 10;

  // ── the rules (unchanged) ──
  function isPheno(a, b, c) {
    function check(p) { var v = [a[p], b[p], c[p]]; var allSame = (v[0] === v[1] && v[1] === v[2]); var allDiff = (v[0] !== v[1] && v[1] !== v[2] && v[0] !== v[2]); return allSame || allDiff; }
    return check('color') && check('shape') && check('number') && check('shading');
  }
  function failedTraits(a, b, c) {   // the traits where two match and one differs: what the player is told
    var out = [], ps = ['shape', 'color', 'shading', 'number'];
    for (var i = 0; i < ps.length; i++) { var p = ps[i], v = [a[p], b[p], c[p]]; var same = (v[0] === v[1] && v[1] === v[2]), diff = (v[0] !== v[1] && v[1] !== v[2] && v[0] !== v[2]); if (!same && !diff) out.push(TRAIT_NAMES[p]); }
    return out;
  }
  function findPheno(board) {
    for (var i = 0; i < board.length - 2; i++) for (var j = i + 1; j < board.length - 1; j++) for (var k = j + 1; k < board.length; k++) if (isPheno(board[i], board[j], board[k])) return [i, j, k];
    return null;
  }
  function createDeck(rng) {
    var rand = rng || Math.random, d = [];
    for (var c = 0; c < 3; c++) for (var s = 0; s < 3; s++) for (var n = 0; n < 3; n++) for (var sh = 0; sh < 3; sh++) d.push({ color: c, shape: s, number: NUMBERS[n], shading: SHADINGS[sh] });
    for (var i = d.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var tmp = d[i]; d[i] = d[j]; d[j] = tmp; }
    return d;
  }
  function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function dayNum(){ var now=new Date(); return Math.floor(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())/86400000) - 20000; }
  function todayKey(){ var d=new Date(); return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate(); }
  function dailyLoad(){ try{ var r=JSON.parse(localStorage.getItem('lw_set_daily')||'null'); return (r&&r.day===todayKey())?r:null; }catch(e){ return null; } }
  function dailySave(rec){ try{ localStorage.setItem('lw_set_daily',JSON.stringify(rec)); }catch(e){} }
  function fmtSecs(s){ var m=Math.floor(s/60),r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }
  function shareResult(text,url){
    try{ if(navigator.share){ navigator.share({text:text,url:url})['catch'](function(){}); return; } }catch(e){}
    try{ navigator.clipboard.writeText(text+'\n'+url).then(function(){ sm('Copied to the clipboard.'); },function(){}); return; }catch(e){}
    sm('Long press to copy: '+text);
  }
  function describe(card) {   // the accessible name, count spoken explicitly, colour with its seal
    return card.number + ' ' + SHAPES[card.shape] + (card.number > 1 ? ' shapes' : '') + ', ' + COLOURS[card.color] + ' (' + SEALS[COLOURS[card.color]] + ' seal), ' + card.shading + ' fill';
  }

  // ── the display settings (free, before the first puzzle, never earned) ──
  var SET_KEY = 'lw_set_display_v1';
  var SET = { v: 1, inks: 'botanical', plain: false, larger: false, labels: false, motion: 'auto', sound: true };
  function loadSettings(){ try{ var d = JSON.parse(localStorage.getItem(SET_KEY) || 'null'); if (!d || typeof d !== 'object') return;
    if (['botanical','clear','mono'].indexOf(d.inks) >= 0) SET.inks = d.inks; SET.plain = d.plain === true; SET.larger = d.larger === true; SET.labels = d.labels === true;
    if (['auto','off','on'].indexOf(d.motion) >= 0) SET.motion = d.motion; SET.sound = d.sound !== false; }catch(e){} }
  function saveSettings(){ try{ localStorage.setItem(SET_KEY, JSON.stringify(SET)); }catch(e){} }
  function motionOff(){ if (SET.motion === 'off') return true; if (SET.motion === 'on') return false; try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } }

  // ── the cues: Astra's four WAVs measured (select 440 Hz 80 ms, deal 380 to 540 Hz 180 ms, trio 520 to 780 Hz 540 ms, daily 520 to 1036 Hz 900 ms); no wrong sound by design ──
  var SFX = { ctx: null, created: 0, started: 0,
    ensure: function(){ if (this.ctx) return this.ctx; try{ var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; this.ctx = new AC(); this.created++; }catch(e){ return null; } return this.ctx; },
    tone: function(f0, f1, ms, type, gain, when){ if (!SET.sound || !this.ctx) return; var c = this.ctx; if (c.state === 'suspended') { try{ c.resume(); }catch(e){} }   // the context is only ever made by the first gesture; the boot deal is silent
      var t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + ms / 1000);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 0.12, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + ms / 1000 + 0.02); this.started++; },
    select: function(){ this.tone(440, 440, 80, 'sine', 0.1); },
    deal: function(){ this.tone(380, 540, 180, 'triangle', 0.08); },
    trio: function(){ this.tone(520, 780, 540, 'triangle', 0.1); },
    daily: function(){ this.tone(520, 1036, 900, 'triangle', 0.1); }
  };
  var _firstGesture = function(){ document.removeEventListener('pointerdown', _firstGesture, true); document.removeEventListener('keydown', _firstGesture, true); if (SET.sound) { var c = SFX.ensure(); if (c && c.state === 'suspended') { try{ c.resume(); }catch(e){} } } };
  document.addEventListener('pointerdown', _firstGesture, true); document.addEventListener('keydown', _firstGesture, true);

  // ── the look (her plates, her sizes) ──
  var CSS = [
    '.ts-table{position:relative;max-width:560px;margin:0 auto;padding:10px 10px 18px;border-radius:18px;background:#17251d url("' + art('table/table_main.webp') + '") center top/cover no-repeat;overflow:hidden}',
    '.ts-table:before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(10,18,14,.58),rgba(10,18,14,.58));pointer-events:none}',
    '.ts-table>*{position:relative}',
    '.ts-modes{display:flex;justify-content:center;gap:8px;margin:4px auto 8px}',
    '.ts-pill{min-height:48px;min-width:120px;padding:10px 18px;border:none;border-radius:24px;background:#f3e6c9 url("' + art('ui/button_pill.webp') + '") center/100% 100% no-repeat;color:#16271e;font-family:Georgia,serif;font-weight:700;font-size:.78rem;letter-spacing:.05em;cursor:pointer}',
    '.ts-pill.quiet{background-image:url("' + art('ui/button_pill_quiet.webp') + '");color:#e8dcc8}',
    '.ts-pill.on{box-shadow:0 0 0 3px rgba(200,168,75,.75)}',
    '.ts-piles{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin:0 6px 2px;color:#e8dcc8;font-family:Georgia,serif;font-size:.85rem}',
    '.ts-pile{display:flex;align-items:flex-end;gap:6px}.ts-pile img{width:48px;height:64px;object-fit:contain;filter:drop-shadow(0 3px 5px rgba(0,0,0,.5))}.ts-pile b{color:#c8a84b;font-size:1.05rem}',
    '.ts-timer{font-variant-numeric:tabular-nums}',
    '.ts-matwrap{position:relative;margin:2px 0 4px}',
    '.ts-mat{position:absolute;left:50%;top:50%;width:min(100%,520px);height:70px;transform:translate(-50%,-50%);background:url("' + art('table/mat.webp') + '") center/100% 100% no-repeat;opacity:.9;pointer-events:none}',
    '.ts-board{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:8px 2px}',
    '.ts-board.large{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.ts-card{position:relative;min-width:0;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:36px 8px 16px;border:3px solid transparent;border-radius:16px;color:#18291f;background:transparent url("' + art('cards/card_face.webp') + '") center/100% 100% no-repeat;box-shadow:0 3px 0 #b89a6a,0 8px 14px rgba(0,0,0,.45);touch-action:manipulation;transition:transform 120ms ease,box-shadow 120ms ease;isolation:isolate;cursor:pointer;font:inherit}',
    '.ts-card[aria-pressed="true"]{background-image:url("' + art('cards/card_selected.webp') + '");border-color:#f6e7c6;box-shadow:0 0 0 2px #17231d,0 6px 0 #b89a6a,0 14px 20px rgba(0,0,0,.5);transform:translateY(-4px) perspective(600px) rotateX(3deg)}',
    '.ts-nomotion .ts-card,.ts-nomotion .ts-card[aria-pressed="true"]{transition:none;transform:none}',
    '.ts-seal{position:absolute;left:13px;top:11px;width:26px;height:26px;background:#fff7e7;border-radius:5px;padding:2px}',
    '.ts-check{display:none;position:absolute;right:11px;top:9px;width:26px;height:26px;background:#fff7e7;border-radius:5px;padding:2px}',
    '.ts-card[aria-pressed="true"] .ts-check{display:block}',
    '.ts-symbols{display:flex;flex-direction:column;align-items:center;gap:2px;padding:3px;background:#fff7e7;border-radius:8px}',
    '.ts-symbols img{display:block;width:40px;height:40px;flex-shrink:0}',
    '.ts-board.large .ts-card{min-height:230px}.ts-board.large .ts-symbols img{width:48px;height:48px}',
    '.ts-board.plain .ts-card{background:#fff7e7;border-color:#77664c;box-shadow:none}.ts-board.plain .ts-card[aria-pressed="true"]{border:4px double #17231d}.ts-board.plain .ts-symbols{background:transparent}',
    '.ts-label{max-width:100%;font:13px/1.35 system-ui,sans-serif;background:#fff7e7;padding:6px 8px;border-radius:4px;overflow-wrap:anywhere;text-align:center}',
    '.ts-card.found{filter:brightness(1.12)}.ts-card.flying{transition:transform 260ms ease-in,opacity 260ms ease-in;opacity:.2;pointer-events:none}',
    '.ts-fx{position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;z-index:4}',
    '.ts-line{min-height:22px;margin:4px 8px 0;text-align:center;color:#e8dcc8;font-family:Georgia,serif;font-size:.95rem;font-weight:700}',
    '.ts-line.why{color:#f5c451}',
    '.ts-card:focus-visible,.ts-pill:focus-visible,.ts-tg:focus-visible{outline:3px solid #fff;outline-offset:3px}',
    '.ts-sheet{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(8,14,10,.78);backdrop-filter:blur(6px);padding:16px}',
    '.ts-sheet.open{display:flex}',
    '.ts-sheet-in{width:100%;max-width:440px;max-height:92vh;overflow-y:auto;background:#17251d;border:1px solid rgba(200,168,75,.35);border-radius:18px;padding:16px;color:#e8dcc8;font-family:Georgia,serif}',
    '.ts-sheet h2{margin:0 0 10px;font-size:1.3rem;color:#c8a84b}',
    '.ts-row{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:56px;padding:6px 6px 6px 12px;background:rgba(255,255,255,.06);border-radius:14px;margin-bottom:8px;font-weight:700}',
    '.ts-tg{min-width:84px;min-height:48px;padding:0 14px;border-radius:24px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:#e8dcc8;font:inherit;font-weight:700;cursor:pointer}',
    '.ts-tg[aria-pressed="true"]{background:linear-gradient(180deg,#ffe08a,#f5c451);color:#3a230a;border-color:transparent}',
    '.ts-tg.wide{min-width:150px}',
    '.ts-note{color:#8a9178;font-size:.85rem;margin:8px 4px 0;line-height:1.4}',
    '.ts-results{position:relative;width:min(92vw,360px);aspect-ratio:450/550;margin:0 auto;background:url("' + art('ui/results_card.webp') + '") center/100% 100% no-repeat;display:flex;flex-direction:column;align-items:center;padding:18% 10% 8%;box-sizing:border-box;color:#e8dcc8;text-align:center}',
    '.ts-results h3{margin:0;font-size:1.45rem;color:#c8a84b;font-family:Georgia,serif}',
    '.ts-results .big{font-size:2.2rem;font-weight:700;color:#fff;margin:6px 0 2px}',
    '.ts-results .sub{color:#8a9178;font-size:.9rem;margin-bottom:auto}',
    '.ts-results .btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}',
    '.ts-confetti{position:fixed;left:50%;top:50%;width:min(100vw,450px);aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;z-index:61}'
  ].join('\n');

  // ── the mount (window._gameFns.set, the shell hands us a container) ──
  window._gameFns = window._gameFns || {};
  window._gameFns.set = function GSET(container) {
    ms(container); mm(container);
    loadSettings();
    if (!document.getElementById('ts-style')) { var st = document.createElement('style'); st.id = 'ts-style'; st.textContent = CSS; document.head.appendChild(st); }

    var table = document.createElement('div'); table.className = 'ts-table';
    table.innerHTML =
      '<div class="ts-modes">' +
        '<button class="ts-pill" id="ts-mode-classic">CLASSIC</button>' +
        '<button class="ts-pill quiet" id="ts-mode-daily">DAILY TRIO #' + dayNum() + '</button>' +
      '</div>' +
      '<div class="ts-piles">' +
        '<div class="ts-pile"><img src="' + art('table/deck_pile.webp') + '" alt=""><span>Deck <b id="ts-remain">81</b></span></div>' +
        '<div class="ts-timer" id="ts-timerwrap" style="display:none">Time <b id="ts-timer">0:00</b></div>' +
        '<div class="ts-pile"><span>Trios <b id="ts-found">0</b></span><img src="' + art('table/found_pile.webp') + '" alt=""></div>' +
      '</div>' +
      '<div class="ts-matwrap"><div class="ts-mat"></div><div class="ts-board" id="ts-board" role="group" aria-label="The cards on the table"></div></div>' +
      '<div class="ts-line" id="ts-line" role="status" aria-live="polite"></div>';
    container.appendChild(table);
    var grid = table.querySelector('#ts-board'), line = table.querySelector('#ts-line');
    var controls = mc(container);

    // the settings sheet and the results sheet
    var sheet = document.createElement('div'); sheet.className = 'ts-sheet'; sheet.id = 'ts-settings'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', 'Display and sound settings');
    sheet.innerHTML = '<div class="ts-sheet-in"><h2>Settings</h2>' +
      '<div class="ts-row"><span>Inks</span><button class="ts-tg wide" id="ts-inks"></button></div>' +
      '<div class="ts-row"><span>Plain surfaces</span><button class="ts-tg" id="ts-plain"></button></div>' +
      '<div class="ts-row"><span>Larger cards</span><button class="ts-tg" id="ts-larger"></button></div>' +
      '<div class="ts-row"><span>Full labels</span><button class="ts-tg" id="ts-labels"></button></div>' +
      '<div class="ts-row"><span>Motion</span><button class="ts-tg wide" id="ts-motion"></button></div>' +
      '<div class="ts-row"><span>Sound</span><button class="ts-tg" id="ts-sound"></button></div>' +
      '<p class="ts-note">Every setting is free and never changes a result. The seal in each card\'s corner names its colour: sun for gold, wave for blue, leaf for rose. Build ' + BUILD + '</p>' +
      '<button class="ts-pill" id="ts-close" style="width:100%;margin-top:6px">Done</button></div>';
    document.body.appendChild(sheet);
    var results = document.createElement('div'); results.className = 'ts-sheet'; results.id = 'ts-results'; results.setAttribute('role', 'dialog'); results.setAttribute('aria-label', 'Round over');
    results.innerHTML = '<div class="ts-results"><h3 id="ts-r-title"></h3><div class="big" id="ts-r-big"></div><div class="sub" id="ts-r-sub"></div>' +
      '<div class="btns"><button class="ts-pill" id="ts-r-share">Share</button><button class="ts-pill quiet" id="ts-r-again">Play again</button></div></div>';
    document.body.appendChild(results);

    // game state in the mount closure
    var deck = [], board = [], selected = [], found = 0, locked = false, won = false, mode = 'classic', startAt = 0, timerIv = 0, dailyTarget = DAILY_TARGET;

    function stopTimer(){ if (timerIv) { clearInterval(timerIv); timerIv = 0; } }
    function startTimer(){ stopTimer(); startAt = Date.now(); table.querySelector('#ts-timerwrap').style.display = ''; var tt = table.querySelector('#ts-timer'); timerIv = setInterval(function(){ tt.textContent = fmtSecs((Date.now() - startAt) / 1000); }, 500); }
    function say(t, why){ line.textContent = t; line.className = 'ts-line' + (why ? ' why' : ''); }
    function paintModes(){ var bc = table.querySelector('#ts-mode-classic'), bd = table.querySelector('#ts-mode-daily'); bc.className = 'ts-pill' + (mode === 'classic' ? ' on' : ' quiet'); var rec = dailyLoad(); bd.className = 'ts-pill' + (mode === 'daily' ? ' on' : ' quiet'); bd.textContent = 'DAILY TRIO #' + dayNum() + (rec && rec.done ? ' ✓' : ''); }
    function applySettings(){
      grid.className = 'ts-board' + (SET.larger ? ' large' : '') + (SET.plain ? ' plain' : '');
      container.classList.toggle('ts-nomotion', motionOff());
      var inks = { botanical: 'Botanical', clear: 'Alternate', mono: 'Monochrome' }, mo = { auto: 'Follows the phone', off: 'Reduced', on: 'Full' };
      sheet.querySelector('#ts-inks').textContent = inks[SET.inks]; sheet.querySelector('#ts-motion').textContent = mo[SET.motion];
      var tg = function(id, on, label){ var b = sheet.querySelector(id); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.textContent = label || (on ? 'On' : 'Off'); };
      tg('#ts-plain', SET.plain); tg('#ts-larger', SET.larger); tg('#ts-labels', SET.labels); tg('#ts-sound', SET.sound);
    }
    function glyph(card){ return art('glyphs/' + SET.inks + '/' + SHAPES[card.shape] + '_' + COLOURS[card.color] + '_' + card.shading + '.webp'); }
    function makeCard(card, idx){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ts-card'; b.dataset.idx = idx;
      b.setAttribute('aria-label', 'Card ' + (idx + 1) + ': ' + describe(card)); b.setAttribute('aria-pressed', selected.indexOf(idx) >= 0 ? 'true' : 'false');
      var h = '<img class="ts-seal" src="' + art('ui/seal_' + COLOURS[card.color] + '.webp') + '" alt="" draggable="false">' +
              '<img class="ts-check" src="' + art('ui/check.webp') + '" alt="" draggable="false"><span class="ts-symbols" aria-hidden="true">';
      for (var n = 0; n < card.number; n++) h += '<img src="' + glyph(card) + '" alt="" width="40" height="40" draggable="false">';
      h += '</span>' + (SET.labels ? '<span class="ts-label" aria-hidden="true">' + describe(card) + '</span>' : '');
      b.innerHTML = h; b.onclick = function(){ selectCard(idx); };
      return b;
    }
    function renderBoard(){
      grid.innerHTML = '';
      for (var i = 0; i < board.length; i++) grid.appendChild(makeCard(board[i], i));
      table.querySelector('#ts-remain').textContent = deck.length;
      table.querySelector('#ts-found').textContent = found;
      if (!findPheno(board) && deck.length === 0) { if (won) return; if (mode === 'daily') { finishDaily(); return; } finishClassic(); }
      else if (!findPheno(board) && deck.length > 0) { window._setHint(); }
    }
    function frames(el, name, n, ms){   // extra feedback only; never under reduced motion
      if (motionOff()) return; var img = document.createElement('img'); img.className = 'ts-fx'; img.alt = ''; img.draggable = false; var i = 1; img.src = art('fx/' + name + '_01.webp'); el.appendChild(img);
      var t = setInterval(function(){ i++; if (i > n) { clearInterval(t); if (img.parentNode) img.parentNode.removeChild(img); return; } img.src = art('fx/' + name + '_' + (i < 10 ? '0' + i : i) + '.webp'); }, ms);
    }
    function selectCard(idx){
      if (locked || won) return;
      var cards = grid.querySelectorAll('.ts-card'), el = cards[idx]; if (!el) return;
      if (selected.length === 3) { selected.forEach(function(i){ if (cards[i]) cards[i].setAttribute('aria-pressed', 'false'); }); selected = []; say(''); }   // a kept wrong trio clears on the next tap
      var pos = selected.indexOf(idx);
      if (pos > -1) { selected.splice(pos, 1); el.setAttribute('aria-pressed', 'false'); return; }
      selected.push(idx); el.setAttribute('aria-pressed', 'true'); SFX.select();
      if (selected.length < 3) return;
      var a = board[selected[0]], b = board[selected[1]], c = board[selected[2]];
      if (isPheno(a, b, c)) {
        found++; table.querySelector('#ts-found').textContent = found; _e('pheno'); SFX.trio();
        say(mode === 'daily' ? found + ' of ' + dailyTarget + '.' : 'A trio. Well seen.');
        locked = true;
        var picked = selected.slice();
        picked.forEach(function(i){ if (cards[i]) { cards[i].classList.add('found'); frames(cards[i], 'trio_found', 6, 70); } });
        var pile = table.querySelector('.ts-pile:last-child img').getBoundingClientRect();
        setTimeout(function(){
          if (!motionOff()) picked.forEach(function(i){ var e = cards[i]; if (!e) return; var r = e.getBoundingClientRect(); e.classList.add('flying'); e.style.transform = 'translate(' + (pile.left - r.left) + 'px,' + (pile.top - r.top) + 'px) scale(.3)'; });
          setTimeout(function(){
            var removed = picked.slice().sort(function(x, y){ return y - x; });
            if (board.length <= 12) removed.forEach(function(i){ if (deck.length > 0) board[i] = deck.pop(); else board.splice(i, 1); });
            else removed.forEach(function(i){ board.splice(i, 1); });
            selected = []; locked = false;
            if (mode === 'daily' && found >= dailyTarget) { finishDaily(); return; }
            renderBoard(); SFX.deal();
            var first = grid.querySelector('.ts-card'); if (first) first.focus({ preventScroll: true });
          }, motionOff() ? 150 : 280);
        }, 100);
      } else {
        var bad = failedTraits(a, b, c);   // kept on the table, inspectable, explained; no shake, no red, nothing charged
        say('Check ' + bad.join(' and ') + ': two match and one differs.', true);
        selected.forEach(function(i){ if (cards[i]) frames(cards[i], 'wrong', 3, 90); });
      }
    }
    function openResults(title, big, sub, again){
      results.querySelector('#ts-r-title').textContent = title; results.querySelector('#ts-r-big').textContent = big; results.querySelector('#ts-r-sub').textContent = sub;
      results.querySelector('#ts-r-again').onclick = function(){ results.classList.remove('open'); again(); };
      results.classList.add('open'); results.querySelector('#ts-r-again').focus();
    }
    function finishDaily(){
      stopTimer(); won = true;
      var secs = Math.max(1, Math.round((Date.now() - startAt) / 1000)), rec = dailyLoad(), first = !(rec && rec.done);
      if (first) dailySave({ day: todayKey(), num: dayNum(), secs: secs, trios: found, done: true });
      var text = 'Three Sisters Daily #' + dayNum() + ': ' + found + ' trios in ' + fmtSecs(secs) + '. Can you beat my time?';
      results.querySelector('#ts-r-share').onclick = function(){ shareResult(text, 'https://lucidwinds.com/play/set.html'); };
      _e('game_win'); _playWin(); _sr('set', { w: true, s: found }); SFX.daily(); paintModes();
      if (!motionOff()) { var cf = document.createElement('img'); cf.className = 'ts-confetti'; cf.alt = ''; document.body.appendChild(cf); var i = 1; cf.src = art('fx/daily_done_01.webp'); var t = setInterval(function(){ i++; if (i > 6) { clearInterval(t); cf.remove(); return; } cf.src = art('fx/daily_done_0' + i + '.webp'); }, 90); }
      openResults('Daily Trio #' + dayNum(), found + ' trios in ' + fmtSecs(secs), first ? 'Locked in. Come back tomorrow.' : 'A practice run. Today already counted.', window._setDaily);
      say('Daily done: ' + found + ' trios in ' + fmtSecs(secs) + (first ? ', locked in.' : ' (practice).'));
    }
    function finishClassic(){
      won = true; _e('game_win'); _playWin(); _sr('set', { w: true, s: found }); SFX.daily();
      results.querySelector('#ts-r-share').onclick = function(){ shareResult('Three Sisters: the whole deck, ' + found + ' trios found.', 'https://lucidwinds.com/play/set.html'); };
      openResults('Board cleared', found + ' trios found', 'The whole deck, well seen.', window._setNew);
      say('Board cleared. ' + found + ' trios found.');
    }
    function startRound(m){
      mode = m; deck = (m === 'daily') ? createDeck(mulberry32(dayNum() + 77001)) : createDeck();
      board = []; selected = []; found = 0; locked = false; won = false;
      if (_st) _st();
      for (var i = 0; i < 12; i++) board.push(deck.pop());
      if (m === 'daily') startTimer(); else { stopTimer(); table.querySelector('#ts-timerwrap').style.display = 'none'; }
      paintModes(); renderBoard(); SFX.deal();
    }
    function renderControls(){
      controls.innerHTML = '';
      var mk = function(label, fn, quiet){ var b = document.createElement('button'); b.className = 'ts-pill' + (quiet ? ' quiet' : ''); b.style.margin = '4px'; b.textContent = label; b.onclick = fn; controls.appendChild(b); return b; };
      mk('Restart', function(){ window._setRestart(); }, true);
      mk('+3 cards', function(){ window._setHint(); });
      mk('Settings', function(){ applySettings(); sheet.classList.add('open'); sheet.querySelector('#ts-close').focus(); }, true);
    }

    window._setNew = function(){ startRound('classic'); say('Find three cards where each trait is all the same or all different.'); };
    window._setDaily = function(){ startRound('daily'); var rec = dailyLoad(); say(rec && rec.done ? 'A practice run. Today is locked in at ' + fmtSecs(rec.secs) + '.' : 'The same deck for everyone today. Find ' + dailyTarget + ' trios, fast.'); };
    window._setRestart = function(){ if (mode === 'daily') window._setDaily(); else window._setNew(); };
    window._setHint = function(){ if (deck.length === 0) { say('The deck is empty.'); return; } for (var i = 0; i < 3 && deck.length > 0; i++) board.push(deck.pop()); selected = []; renderBoard(); SFX.deal(); say('Three cards added. ' + deck.length + ' remain.'); };

    table.querySelector('#ts-mode-classic').onclick = function(){ window._setNew(); };
    table.querySelector('#ts-mode-daily').onclick = function(){ window._setDaily(); };
    sheet.querySelector('#ts-close').onclick = function(){ sheet.classList.remove('open'); };
    sheet.querySelector('#ts-inks').onclick = function(){ SET.inks = SET.inks === 'botanical' ? 'clear' : SET.inks === 'clear' ? 'mono' : 'botanical'; saveSettings(); applySettings(); renderBoard(); };
    sheet.querySelector('#ts-plain').onclick = function(){ SET.plain = !SET.plain; saveSettings(); applySettings(); };
    sheet.querySelector('#ts-larger').onclick = function(){ SET.larger = !SET.larger; saveSettings(); applySettings(); };
    sheet.querySelector('#ts-labels').onclick = function(){ SET.labels = !SET.labels; saveSettings(); applySettings(); renderBoard(); };
    sheet.querySelector('#ts-motion').onclick = function(){ SET.motion = SET.motion === 'auto' ? 'off' : SET.motion === 'off' ? 'on' : 'auto'; saveSettings(); applySettings(); };
    sheet.querySelector('#ts-sound').onclick = function(){ SET.sound = !SET.sound; saveSettings(); applySettings(); if (SET.sound) SFX.select(); };
    [sheet, results].forEach(function(s){ s.addEventListener('click', function(e){ if (e.target === s) s.classList.remove('open'); }); });

    if (/[?&]sstest=1(&|$)/.test(location.search)) {
      window.__ts = { board: function(){ return board.slice(); }, trio: function(){ return findPheno(board); }, state: function(){ return { found: found, deck: deck.length, mode: mode, won: won, selected: selected.slice(), locked: locked }; },
        settings: function(){ return SET; }, setDailyTarget: function(n){ dailyTarget = n; }, audio: function(){ return { created: SFX.created, started: SFX.started }; }, failed: function(i, j, k){ return failedTraits(board[i], board[j], board[k]); } };
    }
    applySettings(); renderControls(); window._setNew();
  };
})();
