/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Three Sisters / SET (standalone shell copy)
 *
 * Copy of the SET-game logic from index.html (constants + renderShape
 * at 13720-13807, deck/board state at 13810, createDeck at 13813,
 * isPheno at 13829, findPheno at 13839, renderBoard at 13847,
 * selectCard at 13937, newGame at 14029, addCards at 14052).
 *
 * Built as a clean self-contained mount instead of a verbatim function
 * extraction because SET's live logic is interleaved with LW's
 * dashboard/streak/tutorial/celebration systems (FG_Audio, FG_Data,
 * updateFocusPlant, _showStreakMilestone, exitDemo, clearHint, par
 * tracking, attention payloads, mint-progress modals). Each LW-only
 * dependency is either stubbed or replaced with the shell-friendly
 * equivalent below.
 *
 * DUPLICATE, NEVER MOVE. The LW main file's SET implementation is the
 * live source of truth for the in-LW play surface. If Stephen tunes
 * the SET game logic in index.html (rule changes, scoring tweaks,
 * shape-set additions), this file goes stale until manually re-synced.
 * No drift watchdog covers it (the SET logic doesn't sit in one
 * contiguous block the way the other inline games do).
 *
 * Same rules as LW:
 *   - 81-card deck, 4 traits × 3 values each
 *   - Tap 3 cards; valid pheno = every trait all-same or all-different
 *   - Removed cards refill from deck (unless board > 12 already from +3)
 *   - +3 button adds three more cards from the deck
 *   - When deck empties and no pheno remains → game_win
 *
 * What the shell intentionally OMITS vs LW:
 *   - The color picker (#cc1/#cc2/#cc3) — uses LW's default trio colors
 *   - The shape-set picker — uses 'grow' (the LW default)
 *   - Streak/par/record overlays — sm() prints simple status messages
 *   - The mint-progress celebration modal — game_win + simple message
 *   - FG_Audio.playChime chord — uses _G.play()/playWin() sound effects
 *
 * What the shell ADDS vs LW (2026-07-16, Stephen greenlight):
 *   - DAILY TRIO — date-seeded deck (same order for every player), race to
 *     10 trios, one counted lock-in per day (replays are practice), share
 *     text result. Exists ONLY here (the /play + portal surface — it is
 *     what game directories list); LW's in-app SET stays classic.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G = window._G;
  var _e = G.e, _play = G.play, _playWin = G.playWin, _st = G.st,
      ms = G.ms, mm = G.mm, mc = G.mc, sm = G.sm, _sr = G.sr;

  // ── Constants (copy from index.html:13727-13737) ──
  var SHADINGS = ['solid','striped','empty'];
  var NUMBERS = [1,2,3];
  var SHAPE_SETS = {
    grow:    ['clover','pot','droplet'],
    classic: ['diamond','oval','squiggle'],
    geo:     ['triangle','circle','square'],
    arcane:  ['crescent','rune','star8']
  };
  var activeShapeSet = 'grow';

  // Shell doesn't ship the LW color-picker UI. Use the trio colors LW
  // defaults to (cc1/cc2/cc3 initial values in index.html:7523/7525/7527):
  // blue, gold, rose. Picked specifically for high mutual contrast
  // (green + yellow read too close together for trait recognition).
  var DEFAULT_COLORS = ['#5b8fb9', '#c8a84b', '#c07070'];
  function getColors(){ return DEFAULT_COLORS.slice(); }

  // ── renderShape (verbatim from index.html:13746-13807) ──
  function renderShape(shape, color, shading, size) {
    var s = size || 56;
    var patternId = 'p_' + Math.random().toString(36).substr(2,6);
    var fill, extra = '';

    if (shading === 'solid') fill = color;
    else if (shading === 'empty') fill = 'none';
    else {
      fill = 'url(#' + patternId + ')';
      extra = '<defs><pattern id="'+patternId+'" patternUnits="userSpaceOnUse" width="'+s+'" height="4"><line x1="0" y1="0" x2="'+s+'" y2="0" stroke="'+color+'" stroke-width="1.5" /></pattern></defs>';
    }

    var path = '';
    var shapes = SHAPE_SETS[activeShapeSet];
    var idx = shapes.indexOf(shape);

    if (activeShapeSet === 'grow') {
      if (idx === 0)      path = '<path d="M16 11 C14 7 8 5 6 9 C4 13 8 15 12 14 C9 15 4 17 5 22 C6 26 12 25 14 21 C14 24 16 28 19 28 C22 28 24 24 22 20 C25 23 30 22 30 18 C30 14 25 12 21 14 C24 12 24 7 20 6 C17 5 15 7 16 11Z" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5" stroke-linejoin="round"/>';
      else if (idx === 1) path = '<path d="M5 8 L27 8 L23 28 L9 28 Z" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5" stroke-linejoin="round"/>';
      else                path = '<path d="M16 3 C16 3 6 16 6 21 C6 26.5 10.5 30 16 30 C21.5 30 26 26.5 26 21 C26 16 16 3 16 3Z" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5" stroke-linejoin="round"/>';
    }
    else if (activeShapeSet === 'classic') {
      if (idx === 0)      path = '<polygon points="16,4 28,16 16,28 4,16" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5"/>';
      else if (idx === 1) path = '<ellipse cx="16" cy="16" rx="10" ry="12" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5"/>';
      else                path = '<path d="M8 6 C16 2 24 10 24 16 C24 22 16 30 8 26 C14 22 14 10 8 6Z" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5"/>';
    }
    else if (activeShapeSet === 'geo') {
      if (idx === 0)      path = '<polygon points="16,4 28,28 4,28" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5"/>';
      else if (idx === 1) path = '<circle cx="16" cy="16" r="12" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5"/>';
      else                path = '<rect x="4" y="4" width="24" height="24" rx="2" fill="'+fill+'" stroke="'+color+'" stroke-width="1.5"/>';
    }
    else if (activeShapeSet === 'arcane') {
      if (idx === 0)      path = '<path d="M22,4 C13,4 6,10 6,18 C6,26 13,32 22,32 C17,30 14,25 14,18 C14,11 17,6 22,4Z" fill="'+fill+'" stroke="'+color+'" stroke-width="1.2" stroke-linejoin="round"/>';
      else if (idx === 1) path = '<rect x="7" y="3" width="18" height="26" rx="3" fill="'+fill+'" stroke="'+color+'" stroke-width="1.4"/>' +
                                  '<line x1="16" y1="8" x2="16" y2="18" stroke="'+color+'" stroke-width="1" stroke-linecap="round" opacity="0.7"/>' +
                                  '<line x1="11" y1="12" x2="21" y2="12" stroke="'+color+'" stroke-width="1" stroke-linecap="round" opacity="0.7"/>' +
                                  '<path d="M12,20 C14,17 18,17 20,20" fill="none" stroke="'+color+'" stroke-width="0.9" opacity="0.6"/>';
      else                path = '<polygon points="16,3 18.5,12.5 28,10 21.5,17 28,24 18.5,21.5 16,31 13.5,21.5 4,24 10.5,17 4,10 13.5,12.5" fill="'+fill+'" stroke="'+color+'" stroke-width="1.2" stroke-linejoin="round"/>';
    }
    return '<svg class="shape-svg" viewBox="0 0 32 32" width="'+s+'" height="'+s+'">'+extra+path+'</svg>';
  }

  // ── isPheno + findPheno (verbatim from index.html:13829-13845) ──
  function isPheno(a, b, c) {
    function check(p) {
      var v = [a[p], b[p], c[p]];
      var allSame = (v[0] === v[1] && v[1] === v[2]);
      var allDiff = (v[0] !== v[1] && v[1] !== v[2] && v[0] !== v[2]);
      return allSame || allDiff;
    }
    return check('color') && check('shape') && check('number') && check('shading');
  }
  function findPheno(board) {
    for (var i = 0; i < board.length - 2; i++)
      for (var j = i + 1; j < board.length - 1; j++)
        for (var k = j + 1; k < board.length; k++)
          if (isPheno(board[i], board[j], board[k])) return [i, j, k];
    return null;
  }

  // ── createDeck (from index.html:13813-13826; + optional seeded rng for Daily) ──
  function createDeck(rng) {
    var rand = rng || Math.random;
    var d = [];
    var shapes = SHAPE_SETS[activeShapeSet];
    for (var c = 0; c < 3; c++)
      for (var s = 0; s < 3; s++)
        for (var n = 0; n < 3; n++)
          for (var sh = 0; sh < 3; sh++)
            d.push({ color: c, shape: shapes[s], number: NUMBERS[n], shading: SHADINGS[sh] });
    for (var i = d.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = d[i]; d[i] = d[j]; d[j] = tmp;
    }
    return d;
  }

  // ── Daily Trio helpers ──
  function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0;
    var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296; }; }
  // Local-date day number (players' "today" is their own today, same as Hues).
  function dayNum(){ var now=new Date();
    return Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate()) - new Date(2026,0,1))/864e5); }
  function todayKey(){ var d=new Date();
    return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function dailyLoad(){ try{ var r=JSON.parse(localStorage.getItem('lw_set_daily')||'null');
    return (r && r.day===todayKey()) ? r : null; }catch(e){ return null; } }
  function dailySave(rec){ try{ localStorage.setItem('lw_set_daily',JSON.stringify(rec)); }catch(e){} }
  function fmtSecs(s){ var m=Math.floor(s/60),r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }
  function shareResult(text,url){
    try{ if(navigator.share){ navigator.share({text:text,url:url})['catch'](function(){}); return; } }catch(e){}
    try{ navigator.clipboard.writeText(text+'\n'+url).then(function(){ sm('Copied to clipboard.'); },function(){}); return; }catch(e){}
    sm('Long-press to copy: '+text);
  }
  var DAILY_TARGET = 10;   // trios to finish the Daily

  // ── Mount function (registered as window._gameFns.set) ──
  window._gameFns = window._gameFns || {};
  window._gameFns.set = function GSET(container) {
    // Build the SET-game DOM inside the container the shell hands us.
    // 2026-07-04 audit: the gu-bar is display:none shell-wide, so the
    // Trios/Deck counters live in a visible score row below instead.
    ms(container);
    mm(container);

    // Colorblind support: every card ships a .cb-marker badge but
    // shared.css only reveals them under .cb-on (opacity .6 — designed
    // subtle). Nothing in the shell ever added the class; do it here.
    container.classList.add('cb-on');

    // Mode row — CLASSIC (the full-deck original) vs DAILY TRIO (seeded sprint)
    var modeRow = document.createElement('div');
    modeRow.style.cssText = 'display:flex;justify-content:center;gap:8px;max-width:540px;margin:8px auto 0;padding:0 10px;';
    var mbStyle = 'flex:1;max-width:210px;min-height:48px;padding:8px 10px;font-family:Georgia,serif;font-weight:700;font-size:0.72rem;letter-spacing:0.06em;border-radius:8px;cursor:pointer;color:#f5ebd0;';
    modeRow.innerHTML =
      '<button id="s-mode-classic" style="'+mbStyle+'background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1.5px solid rgba(122,179,86,0.55);">CLASSIC</button>' +
      '<button id="s-mode-daily" style="'+mbStyle+'background:rgba(200,168,75,0.12);border:1.5px solid rgba(200,168,75,0.4);">DAILY TRIO #'+dayNum()+'</button>';
    container.appendChild(modeRow);

    // Visible score row (replaces the hidden gu-bar counters)
    var scoreRow = document.createElement('div');
    scoreRow.style.cssText = 'display:flex;justify-content:center;gap:22px;max-width:540px;margin:10px auto 0;padding:4px 10px;font-family:Georgia,serif;font-size:0.8rem;color:#e8dcc8;';
    scoreRow.innerHTML =
      '<span>Trios: <strong id="s-found" style="color:#c8a84b;">0</strong></span>' +
      '<span>Deck: <strong id="s-remain" style="color:#7ab356;">81</strong></span>' +
      '<span id="s-timerwrap" style="display:none;">⏱ <strong id="s-timer" style="color:#e8dcc8;">0:00</strong></span>';
    container.appendChild(scoreRow);

    // Card grid host
    var gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'max-width:540px;margin:8px auto;padding:10px 8px;background:#b6bcb2;border-radius:14px;box-shadow:inset 0 1px 8px rgba(0,0,0,0.22);';
    var grid = document.createElement('div');
    grid.id = 'card-grid';
    grid.style.cssText = 'display:grid;gap:8px;grid-template-columns:repeat(3,1fr);';
    gridWrap.appendChild(grid);
    container.appendChild(gridWrap);

    // Controls render via classicControls() below (NOT class gb-new —
    // shared.css defines .gb-new as an image-button wrapper that collapsed
    // text buttons to 15px tall, 2026-07-04 audit). mc() APPENDS a new
    // node per call, so grab the container exactly once and reuse it.
    var controls = mc(container);

    // Game state lives inside the mount closure (not on window) so a
    // page-level reload starts fresh.
    var deck = [], board = [], selected = [], phenosFound = 0;
    var locked = false;  // brief lock during animations
    var won = false;     // latched on board-clear; makes leftover cards inert
    var mode = 'classic';            // 'classic' | 'daily'
    var startAt = 0, timerIv = 0;    // Daily Trio clock

    function stopTimer(){ if(timerIv){ clearInterval(timerIv); timerIv=0; } }
    function startTimer(){
      stopTimer(); startAt = Date.now();
      var tw = document.getElementById('s-timerwrap'), tt = document.getElementById('s-timer');
      if (tw) tw.style.display = '';
      timerIv = setInterval(function(){
        if (tt) tt.textContent = fmtSecs((Date.now()-startAt)/1000);
      }, 500);
    }
    function paintModeButtons(){
      var bc = document.getElementById('s-mode-classic'), bd = document.getElementById('s-mode-daily');
      var onBg = 'linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4))', onBd = '1.5px solid rgba(122,179,86,0.55)';
      var offBg = 'rgba(200,168,75,0.12)', offBd = '1.5px solid rgba(200,168,75,0.4)';
      if (bc){ bc.style.background = (mode==='classic')?onBg:offBg; bc.style.border=(mode==='classic')?onBd:offBd; }
      if (bd){ bd.style.background = (mode==='daily')?onBg:offBg; bd.style.border=(mode==='daily')?onBd:offBd;
        var rec = dailyLoad();
        bd.textContent = 'DAILY TRIO #'+dayNum()+(rec&&rec.done?' ✓':'');
      }
    }
    function classicControls(){
      controls.innerHTML =
        '<button onclick="window._setRestart()" style="min-height:48px;padding:12px 20px;margin-right:8px;font-family:Georgia,serif;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1.5px solid rgba(122,179,86,0.55);color:#f5ebd0;border-radius:8px;cursor:pointer;">↻ NEW GAME</button>' +
        '<button onclick="window._setHint()" style="min-height:48px;padding:12px 20px;font-family:Georgia,serif;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;background:linear-gradient(180deg,rgba(200,168,75,0.28),rgba(160,130,55,0.38));border:1.5px solid rgba(200,168,75,0.55);color:#f5ebd0;border-radius:8px;cursor:pointer;">+3 CARDS</button>';
    }
    function finishDaily(){
      stopTimer(); won = true;
      var secs = Math.max(1, Math.round((Date.now()-startAt)/1000));
      var rec = dailyLoad(), first = !(rec && rec.done);
      if (first) dailySave({ day: todayKey(), num: dayNum(), secs: secs, trios: phenosFound, done: true });
      var shareText = 'Three Sisters Daily #'+dayNum()+'\n'+phenosFound+' trios · '+fmtSecs(secs)+' ⏱🌱\nCan you beat my time?';
      window._setShareDaily = function(){ shareResult(shareText, 'https://lucidwinds.com/play/set.html'); };
      controls.innerHTML =
        '<button onclick="window._setShareDaily()" style="min-height:48px;padding:12px 20px;margin-right:8px;font-family:Georgia,serif;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;background:linear-gradient(180deg,rgba(200,168,75,0.28),rgba(160,130,55,0.38));border:1.5px solid rgba(200,168,75,0.55);color:#f5ebd0;border-radius:8px;cursor:pointer;">📤 SHARE RESULT</button>' +
        '<button onclick="window._setNew()" style="min-height:48px;padding:12px 20px;font-family:Georgia,serif;font-weight:700;font-size:0.75rem;letter-spacing:0.05em;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1.5px solid rgba(122,179,86,0.55);color:#f5ebd0;border-radius:8px;cursor:pointer;">PLAY CLASSIC</button>';
      _e('game_win');
      _playWin();
      _sr('set', { w: true, s: phenosFound });
      paintModeButtons();
      if (window._lwGameEnd) window._lwGameEnd({
        won: true,
        title: 'DAILY TRIO #'+dayNum(),
        line: phenosFound+' trios in '+fmtSecs(secs),
        sub: first ? 'locked in — come back tomorrow' : 'practice run — today already counted',
        retry: window._setDaily
      });
      sm('🌿 Daily done: '+phenosFound+' trios in '+fmtSecs(secs)+(first?' — locked in.':' (practice).'));
    }

    function renderBoard() {
      var colors = getColors();
      grid.innerHTML = '';
      if (board.length > 12)      grid.style.gridTemplateColumns = 'repeat(5,1fr)';
      else if (board.length > 9)  grid.style.gridTemplateColumns = 'repeat(4,1fr)';
      else                        grid.style.gridTemplateColumns = 'repeat(3,1fr)';

      board.forEach(function(card, idx) {
        var el = document.createElement('div');
        el.className = 'grove-card';
        el.dataset.idx = idx;
        el.dataset.color = card.color;
        el.onclick = function() { selectCard(idx); };

        var cbMarkers = ['■ B','● G','▲ R'];
        var marker = document.createElement('div');
        marker.className = 'cb-marker';
        marker.textContent = cbMarkers[card.color];
        el.appendChild(marker);

        var shapesHtml = '';
        for (var n = 0; n < card.number; n++) {
          shapesHtml += renderShape(card.shape, colors[card.color], card.shading);
        }
        var row = document.createElement('div');
        row.className = 'shape-row';
        row.innerHTML = shapesHtml;
        el.appendChild(row);
        grid.appendChild(el);
      });

      var sr = document.getElementById('s-remain');
      if (sr) sr.textContent = deck.length;

      // End check: no pheno + empty deck → game_win. Latched via `won` —
      // renderBoard is structurally unreachable post-win (selectCard's
      // success branch needs a pheno, _setHint bails on empty deck) but
      // the flag makes that explicit and keeps leftover cards inert.
      if (!findPheno(board) && deck.length === 0) {
        if (won) return;
        if (mode === 'daily') { finishDaily(); return; }  // deck ran dry pre-target (near-impossible) — count what was found
        won = true;
        _e('game_win');
        _playWin();
        sm('🌿 Board cleared. ' + phenosFound + ' trios found.');
        _sr('set', { w: true, s: phenosFound });
        if (window._lwGameEnd) window._lwGameEnd({
          won: true,
          title: 'BOARD CLEARED',
          line: phenosFound + ' trios found',
          sub: 'the whole deck, well seen',
          retry: window._setNew
        });
      } else if (!findPheno(board) && deck.length > 0) {
        // No pheno on board but deck has more — auto +3 like LW does.
        window._setHint();
      }
    }

    function selectCard(idx) {
      if (locked || won) return;
      var cards = grid.querySelectorAll('.grove-card');
      var el = cards[idx];
      if (!el) return;

      var pos = selected.indexOf(idx);
      if (pos > -1) {
        selected.splice(pos, 1);
        el.classList.remove('selected');
        return;
      }
      selected.push(idx);
      el.classList.add('selected');
      _play('flip');

      if (selected.length === 3) {
        var a = board[selected[0]], b = board[selected[1]], c = board[selected[2]];
        if (isPheno(a, b, c)) {
          phenosFound++;
          var sf = document.getElementById('s-found');
          if (sf) sf.textContent = phenosFound;
          _e('pheno');
          _play('match');
          selected.forEach(function(i) { if (cards[i]) cards[i].classList.add('correct'); });
          sm(mode === 'daily'
             ? '🌱 ' + phenosFound + ' of ' + DAILY_TARGET + '.'
             : '🌱 Pheno found. Well seen.');
          locked = true;
          setTimeout(function() {
            // Remove found cards from the board; refill from deck unless
            // the board is already > 12 (from a prior +3).
            var removed = selected.slice().sort(function(a,b){return b-a;});
            if (board.length <= 12) {
              removed.forEach(function(i) {
                if (deck.length > 0) board[i] = deck.pop();
                else                 board.splice(i, 1);
              });
            } else {
              removed.forEach(function(i) { board.splice(i, 1); });
            }
            selected = [];
            locked = false;
            if (mode === 'daily' && phenosFound >= DAILY_TARGET) { finishDaily(); return; }
            renderBoard();
          }, 600);
        } else {
          _play('buzz');
          selected.forEach(function(i) { if (cards[i]) cards[i].classList.add('wrong'); });
          sm("Not quite — one trait doesn't align.");
          locked = true;
          setTimeout(function() {
            selected.forEach(function(i) {
              if (cards[i]) {
                cards[i].classList.remove('wrong');
                cards[i].classList.remove('selected');
              }
            });
            selected = [];
            locked = false;
          }, 700);
        }
      }
    }

    function startRound(m) {
      mode = m;
      // Daily deck: seeded by the day number — the SAME shuffle for every
      // player on Earth today. Classic keeps true random.
      deck = (m === 'daily') ? createDeck(mulberry32(dayNum() + 77001)) : createDeck();
      board = [];
      selected = [];
      phenosFound = 0;
      locked = false;
      won = false;
      if (_st) _st();  // start the session clock (anti-farm 6s gate + ⏱)
      var sf = document.getElementById('s-found');
      if (sf) sf.textContent = '0';
      for (var i = 0; i < 12; i++) board.push(deck.pop());
      if (m === 'daily') { startTimer(); }
      else {
        stopTimer();
        var tw = document.getElementById('s-timerwrap');
        if (tw) tw.style.display = 'none';
      }
      classicControls();
      paintModeButtons();
      renderBoard();
    }

    window._setNew = function() {
      startRound('classic');
      sm('Find 3 cards where each trait is all-same or all-different.');
    };
    window._setDaily = function() {
      startRound('daily');
      var rec = dailyLoad();
      sm(rec && rec.done
         ? 'Practice run — today already locked in at ' + fmtSecs(rec.secs) + '.'
         : 'Same deck for everyone today. Find ' + DAILY_TARGET + ' trios, fast.');
    };
    window._setRestart = function() {
      if (mode === 'daily') window._setDaily(); else window._setNew();
    };

    window._setHint = function() {
      if (deck.length === 0) { sm('Deck is empty.'); return; }
      for (var i = 0; i < 3 && deck.length > 0; i++) board.push(deck.pop());
      selected = [];
      renderBoard();
      sm('+3 cards added. ' + deck.length + ' remaining.');
    };

    // Mode buttons
    var mbc = document.getElementById('s-mode-classic');
    var mbd = document.getElementById('s-mode-daily');
    if (mbc) mbc.onclick = function(){ window._setNew(); };
    if (mbd) mbd.onclick = function(){ window._setDaily(); };

    // Boot
    window._setNew();
  };
})();
