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
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G = window._G;
  var _e = G.e, _play = G.play, _playWin = G.playWin,
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

  // ── createDeck (verbatim from index.html:13813-13826) ──
  function createDeck() {
    var d = [];
    var shapes = SHAPE_SETS[activeShapeSet];
    for (var c = 0; c < 3; c++)
      for (var s = 0; s < 3; s++)
        for (var n = 0; n < 3; n++)
          for (var sh = 0; sh < 3; sh++)
            d.push({ color: c, shape: shapes[s], number: NUMBERS[n], shading: SHADINGS[sh] });
    for (var i = d.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = d[i]; d[i] = d[j]; d[j] = tmp;
    }
    return d;
  }

  // ── Mount function (registered as window._gameFns.set) ──
  window._gameFns = window._gameFns || {};
  window._gameFns.set = function GSET(container) {
    // Build the SET-game DOM inside the container the shell hands us.
    ms(container,
      '<span>Trios: <strong id="s-found">0</strong></span> · ' +
      '<span>Deck: <strong id="s-remain">81</strong></span>'
    );
    mm(container);

    // Card grid host
    var gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'max-width:540px;margin:8px auto;padding:0 8px;';
    var grid = document.createElement('div');
    grid.id = 'card-grid';
    grid.style.cssText = 'display:grid;gap:8px;grid-template-columns:repeat(3,1fr);';
    gridWrap.appendChild(grid);
    container.appendChild(gridWrap);

    // Controls (new game + add 3)
    mc(container).innerHTML =
      '<button class="gb-new" onclick="window._setNew()" style="margin-right:8px;">↻ NEW GAME</button>' +
      '<button class="gb-new" onclick="window._setHint()">+3 CARDS</button>';

    // Game state lives inside the mount closure (not on window) so a
    // page-level reload starts fresh.
    var deck = [], board = [], selected = [], phenosFound = 0;
    var locked = false;  // brief lock during animations

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

      // End check: no pheno + empty deck → game_win
      if (!findPheno(board) && deck.length === 0) {
        _e('game_win');
        _playWin();
        sm('🌿 Board cleared. ' + phenosFound + ' trios found.');
        _sr('set', { w: true, s: phenosFound });
      } else if (!findPheno(board) && deck.length > 0) {
        // No pheno on board but deck has more — auto +3 like LW does.
        window._setHint();
      }
    }

    function selectCard(idx) {
      if (locked) return;
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
          sm('🌱 Pheno found. Well seen.');
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

    window._setNew = function() {
      deck = createDeck();
      board = [];
      selected = [];
      phenosFound = 0;
      locked = false;
      var sf = document.getElementById('s-found');
      if (sf) sf.textContent = '0';
      for (var i = 0; i < 12; i++) board.push(deck.pop());
      renderBoard();
      sm('Find 3 cards where each trait is all-same or all-different.');
    };

    window._setHint = function() {
      if (deck.length === 0) { sm('Deck is empty.'); return; }
      for (var i = 0; i < 3 && deck.length > 0; i++) board.push(deck.pop());
      selected = [];
      renderBoard();
      sm('+3 cards added. ' + deck.length + ' remaining.');
    };

    // Boot
    window._setNew();
  };
})();
