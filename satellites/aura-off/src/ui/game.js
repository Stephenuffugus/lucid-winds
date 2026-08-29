/**
 * AURA OFF — src/ui/game.js
 *
 * The screen state machine, the deck, the campaign flow, and the loop that
 * drives two twelve-joint figures through whatever the engine just decided.
 *
 * CONTRACT.md §11 (the DOM), §10 (the campaign), §0 (the one architectural
 * rule).
 *
 * ---------------------------------------------------------------------------
 * THIS FILE NEVER SCORES ANYTHING
 * ---------------------------------------------------------------------------
 * `resolveExchange()` returns the callout string, the multiplier list with
 * display labels, the status chips, the matchup label, the hype before and
 * after and both running totals. Every number on screen came off that object
 * or off `matchSnapshot()`. Legality is `previewMove().legal`; affordability
 * is `canBlend()`. If this file ever needs a rule it does not have, the rule
 * belongs in `battle.js`.
 *
 * The one engine import here that is not `battle.js` is `scoring.blendMove()`,
 * and it is used ONLY to describe a pending blend to the timing panel — the
 * hybrid's name, its duration and its ideal amplitude, before any turn exists
 * to read them off. Calling the engine's own constructor is what stops the
 * white mark on the amplitude bar from drifting away from the curve that
 * actually scores it. It computes no score and its result is never summed.
 *
 * ---------------------------------------------------------------------------
 * THE SHAPE OF A TURN
 * ---------------------------------------------------------------------------
 *   ready      the deck is live. Cards carry category, freshness and legality.
 *   timing     `ui/timing.js` owns the thumb. The deck is out of the way.
 *   resolving  one rAF loop plays both clips; at the peak the crowd, the
 *              meter, the callouts and the MC all land together.
 *   over       nine rounds are done. The result screen follows.
 *
 * Under two seconds from tap to feedback, every time: the timing panel opens
 * instantly, the clip is the move's own authored duration, and the callout
 * fires at 58% of it — while the body is still moving, not after it has
 * stopped.
 */

import {
  createMatch, resolveExchange, matchSnapshot, matchSummary,
  legalMoves, previewMove, canBlend, getMove, TUNING
} from '../engine/battle.js';
import { blendMove } from '../engine/scoring.js';
import { sampleInto, blend as blendPose, lerpPose, settleWeight } from '../engine/anim.js';
import { restPose, mountFigure } from '../engine/rig.js';

import { createHud } from './hud.js';
import { createTiming } from './timing.js';
import * as save from './save.js';

/* -------------------------------------------------------------------------- */
/* PACING — the only numbers in this file, and none of them touch a score      */
/* -------------------------------------------------------------------------- */

const PACE = Object.freeze({
  /** Fraction of the longer clip at which the score lands. Early on purpose:
   *  the callout should arrive while the body is still moving. */
  peak: 0.55,
  /** Beat after both clips finish, before the next round opens. */
  hold: 520,
  /** The stylesheet's `aoCallout` runs 1.25s and ends at zero opacity. A short
   *  clip would otherwise be swept off the screen by the next round while its
   *  own score was still climbing, so the round never ends before the callout
   *  has finished saying it. */
  calloutMs: 1250,
  /** Beat after the last exchange, before the result screen. */
  toResult: 1000,
  /** Ease out of rest into the opening frame. */
  easeIn: 0.07,
  /** Ease back to rest over the tail of a clip, so nobody pops. */
  settleTail: 0.14,
  /** Idle sway period. */
  breathe: 2600
});

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function buzz(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) { /* a blocked vibrator is not an error */ }
}

/* -------------------------------------------------------------------------- */
/* HOW IT SCORES — the rules, in the culture's own words                      */
/* -------------------------------------------------------------------------- */

const HOW = Object.freeze([
  'THE TRIANGLE — Flex beats Bait. Bait beats Flow. Flow beats Flex. Reading it right is worth half again as much.',
  'THE LIGHT — Release the hold when the needle is on the white. Perfect doubles it. Clean is most of it. Late is a whiff, and a whiff is PERDIÓ AURA.',
  'THE MARK — Holding longer makes the move bigger. The white mark on the bar is the size the crowd rewards. Bigger is not better, and going over the mark costs you more than stopping short of it.',
  'SAY SOMETHING NEW — The second time you throw a move it is worth about two thirds. The third, under half. Repeating yourself is how you lose.',
  'ARMS AND LEGS ARE SEPARATE JOBS — Blend takes the arms of one move and the legs of another. A real split scores. Two of a kind does not.',
  'THE ROOM — A crowd rewards laughing and surprise. A panel rewards composure and something they have not seen. Some nights you have both, and they want opposite things.',
  'NINE ROUNDS — The bar at the top is a tug of war, not a health bar. Whoever it is leaning towards at the end took it.'
]);

/* -------------------------------------------------------------------------- */

/**
 * Build the game over the shipped DOM.
 *
 * @param {Object}   cfg
 * @param {Array}    cfg.moves      the whole move library (src/data/moves.js)
 * @param {Object}   cfg.campaign   src/data/campaign.js CAMPAIGN
 * @param {Document} [cfg.doc]
 * @returns {{start: Function, stop: Function}}
 */
export function createGame(cfg) {
  const c = cfg || {};
  const doc = c.doc || (typeof document !== 'undefined' ? document : null);
  if (!doc) throw new Error('createGame needs a document');
  if (!Array.isArray(c.moves) || !c.moves.length) throw new Error('createGame needs the move library');
  if (!c.campaign) throw new Error('createGame needs the campaign');

  const MOVES = c.moves;
  const CAMP = c.campaign;
  const ACTS = CAMP.acts;
  const OPPONENTS = CAMP.opponents;
  const FITS = CAMP.fits;

  const byId = Object.create(null);
  for (let i = 0; i < MOVES.length; i++) byId[MOVES[i].id] = MOVES[i];

  const el = {
    body: doc.body,
    you: doc.getElementById('you'),
    them: doc.getElementById('them'),
    grid: doc.getElementById('grid'),
    blendBtn: doc.getElementById('blendBtn'),
    fitGrid: doc.getElementById('fitGrid'),
    fitGo: doc.getElementById('fitGo'),
    actList: doc.getElementById('actList'),
    mapSub: doc.getElementById('mapSub'),
    resultTitle: doc.getElementById('resultTitle'),
    resultUnlock: doc.getElementById('resultUnlock'),
    resultLog: doc.getElementById('resultLog'),
    againBtn: doc.getElementById('againBtn'),
    startBtn: doc.getElementById('startBtn'),
    howBtn: doc.getElementById('howBtn'),
    screens: {
      title: doc.getElementById('title'),
      fit: doc.getElementById('fit'),
      result: doc.getElementById('result'),
      map: doc.getElementById('map')
    }
  };

  const hud = createHud({ doc: doc });
  const timing = createTiming({ doc: doc });

  /* ------------------------------------------------------------------ */
  /* STATE                                                              */
  /* ------------------------------------------------------------------ */

  const S = {
    progress: save.read(),
    screen: 'title',
    resultMode: 'battle',   // 'battle' | 'how'
    match: null,
    opponent: null,
    act: null,
    fitId: null,
    pendingFit: null,
    cards: Object.create(null),
    cardOrder: [],
    blendStep: 0,           // 0 off, 1 pick arms, 2 pick legs
    blendA: null,
    lastWhy: '',
    previews: [],           // last `legalMoves()` read, so the prompt can be honest
    turn: null,             // the exchange currently being animated
    running: false
  };

  S.fitId = S.progress.fit;

  /* ------------------------------------------------------------------ */
  /* THE FIGURES                                                        */
  /* ------------------------------------------------------------------ */

  const REST = restPose();
  const poseYou = restPose();
  const poseThem = restPose();
  let figYou = null;
  let figThem = null;

  /**
   * Mount the player. The fit is the one thing that changes the silhouette,
   * which is why a judge could call a real winner on his shoes before he had
   * moved — so the headcloth fit visibly puts a headcloth on you.
   * @param {string} fitId
   */
  function mountYou(fitId) {
    if (!el.you) return;
    figYou = mountFigure(el.you, {
      doc: doc,
      id: 'aoYou',
      // Only the fit that is literally named for them puts them on. All-black
      // is "nothing to look at but the movement" — adding sunglasses to it was
      // an invention, and the wrong one.
      headcloth: fitId === 'headcloth',
      shades: fitId === 'headcloth',
      ariaLabel: 'You'
    });
    figYou.apply(REST);
  }

  /**
   * Mount the rival, facing in. The only figure that carries a headcloth by
   * character is the Togak Luan — the boat-dancer role that all of this came
   * from, and the one silhouette in the game that is not a costume choice.
   * @param {Object} opponent
   */
  function mountThem(opponent) {
    if (!el.them) return;
    figThem = mountFigure(el.them, {
      doc: doc,
      id: 'aoThem',
      flip: true,
      headcloth: !!opponent && opponent.id === 'togakluan',
      ariaLabel: (opponent && opponent.name) || 'Rival'
    });
    figThem.apply(REST);
  }

  /* ------------------------------------------------------------------ */
  /* THE LOOP                                                           */
  /* ------------------------------------------------------------------ */

  let raf = 0;
  let clipStart = 0;

  /**
   * A resting body is not a still body. A hair of sway, a hair of breath, at
   * a fraction of a degree — enough that two people standing in a square look
   * like two people rather than two diagrams.
   */
  function idlePose(now, phase, out) {
    const t = now / PACE.breathe + phase;
    const a = Math.sin(t * Math.PI * 2);
    const b = Math.sin(t * Math.PI * 4 + 0.7);
    out.rot = 0;
    out.bob = 1.0 + b * 0.7;
    out.lean = a * 1.1;
    out.head = Math.sin(t * Math.PI * 2 + 1.1) * 1.5;
    out.sL = a * 2.0;
    out.sR = -a * 2.0;
    out.eL = -1.2 - b * 0.9;
    out.eR = -1.2 - b * 0.9;
    out.hL = 0; out.kL = 0; out.hR = 0; out.kR = 0;
    return out;
  }

  /**
   * Build the thing that gets animated for one side of an exchange.
   *
   * A BLEND'S SYNTHETIC MOVE HAS `frames: null` ON PURPOSE. Never feed
   * `result.you` into the sampler — a blend animates through `anim.blend()`
   * with its two real parents, each keeping its own follow-through lag, which
   * is what makes a genuine split read as one performance instead of two.
   *
   * @param {Object} turn a SideTurn from `resolveExchange`
   */
  function clipFor(turn) {
    if (!turn) return null;
    if (turn.blend) {
      const a = byId[turn.blend.a];
      const b = byId[turn.blend.b];
      if (a && b) return { a: a, b: b, amp: turn.amp, dur: turn.dur || 1600 };
    }
    const m = byId[turn.moveId];
    if (!m) return null;
    return { move: m, amp: turn.amp, dur: turn.dur || m.dur || 1600 };
  }

  /**
   * Sample a clip at a wall-clock offset, eased out of rest at the top and
   * settled back into it at the tail.
   */
  function poseAt(clip, ms, out) {
    const t = clamp(ms / clip.dur, 0, 1);
    if (clip.a) blendPose(clip.a, clip.b, t, clip.amp, out);
    else sampleInto(clip.move, t, clip.amp, out);

    const w = settleWeight(t, PACE.settleTail);
    if (w > 0) lerpPose(out, REST, w, out, true);
    if (t < PACE.easeIn) lerpPose(REST, out, t / PACE.easeIn, out);
    return out;
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);

    const turn = S.turn;

    if (!turn) {
      if (figYou) figYou.apply(idlePose(now, 0, poseYou));
      if (figThem) figThem.apply(idlePose(now, 0.37, poseThem));
      return;
    }

    const t = now - clipStart;

    if (turn.clipYou && t < turn.clipYou.dur) poseAt(turn.clipYou, t, poseYou);
    else idlePose(now, 0, poseYou);
    if (turn.clipThem && t < turn.clipThem.dur) poseAt(turn.clipThem, t, poseThem);
    else idlePose(now, 0.37, poseThem);

    if (figYou) figYou.apply(poseYou);
    if (figThem) figThem.apply(poseThem);

    if (!turn.shown && t >= turn.peakAt) {
      turn.shown = true;
      hud.showExchange(turn.result, {
        act: S.act && S.act.id,
        round: turn.result.round,
        seed: (S.opponent ? S.opponent.id : '') + ':' + turn.result.round
      });
      S.lastWhy = hud.whyLine(turn.result.you);
      hud.setPrompt(S.lastWhy);
      buzz(turn.result.you.band === 'whiff' ? 0 : turn.result.you.band === 'perfect' ? [0, 12, 40, 22] : 12);
    }

    if (!turn.finished && t >= turn.endAt) {
      turn.finished = true;
      endExchange(turn.result);
    }
  }

  function startLoop() {
    if (raf) return;
    raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  /* ------------------------------------------------------------------ */
  /* SCREENS                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Show one full-screen panel, or `null` for the arena underneath.
   * The animation loop only runs when the arena is actually visible.
   * @param {'title'|'fit'|'result'|'map'|null} name
   */
  function showScreen(name) {
    S.screen = name;
    for (const key in el.screens) {
      const node = el.screens[key];
      if (!node) continue;
      if (key === name) node.classList.add('on');
      else node.classList.remove('on');
    }
    if (name) { stopLoop(); timing.cancel(); }
    else startLoop();
  }

  /** `<body data-state>` — ready | timing | resolving | over. */
  function setState(state) {
    if (el.body) el.body.setAttribute('data-state', state);
  }

  /* ------------------------------------------------------------------ */
  /* CAMPAIGN POSITION                                                  */
  /* ------------------------------------------------------------------ */

  function isBeaten(id) { return S.progress.beaten.indexOf(id) !== -1; }

  /**
   * The next person in the queue: the first opponent in campaign order who has
   * not been beaten. Once the circuit is complete the last one stays available
   * — the square does not close because you finished it.
   * @returns {Object}
   */
  function nextOpponent() {
    for (let i = 0; i < OPPONENTS.length; i++) {
      if (!isBeaten(OPPONENTS[i].id)) return OPPONENTS[i];
    }
    return OPPONENTS[OPPONENTS.length - 1];
  }

  function actFor(id) {
    for (let i = 0; i < ACTS.length; i++) if (ACTS[i].id === id) return ACTS[i];
    return ACTS[0];
  }

  function fitFor(id) {
    for (let i = 0; i < FITS.length; i++) if (FITS[i].id === id) return FITS[i];
    return FITS[FITS.length - 1];
  }

  function actProgress(actId) {
    let total = 0, done = 0;
    for (let i = 0; i < OPPONENTS.length; i++) {
      if (OPPONENTS[i].act !== actId) continue;
      total++;
      if (isBeaten(OPPONENTS[i].id)) done++;
    }
    return { done: done, total: total };
  }

  function moveName(id) { return byId[id] ? byId[id].name : id; }

  /* ------------------------------------------------------------------ */
  /* THE FIT CHECK                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * The fit line: what each one is actually worth, in plain words. It sets the
   * meter once before round one and then shuts up — a judge called a real
   * winner on his shoes before he had moved, and then the fight happened.
   */
  function fitLine(fit) {
    const bits = [];
    if (fit.crowd) bits.push((fit.crowd > 0 ? '+' : '−') + Math.abs(fit.crowd) + ' crowd');
    if (fit.judges) bits.push((fit.judges > 0 ? '+' : '−') + Math.abs(fit.judges) + ' panel');
    return bits.length ? bits.join(' · ') : 'Nothing to live up to';
  }

  function renderFit() {
    if (!el.fitGrid) return;
    el.fitGrid.textContent = '';
    S.pendingFit = S.pendingFit || S.fitId || fitFor(null).id;
    const frag = doc.createDocumentFragment();

    for (let i = 0; i < FITS.length; i++) {
      const fit = FITS[i];
      const b = doc.createElement('button');
      b.type = 'button';
      b.setAttribute('data-fit', fit.id);
      b.setAttribute('aria-pressed', fit.id === S.pendingFit ? 'true' : 'false');

      const n = doc.createElement('span');
      n.textContent = fit.name;
      const s = doc.createElement('span');
      s.textContent = fitLine(fit);
      b.appendChild(n);
      b.appendChild(s);

      b.addEventListener('click', function () {
        S.pendingFit = fit.id;
        const all = el.fitGrid.children;
        for (let k = 0; k < all.length; k++) {
          all[k].setAttribute('aria-pressed', all[k].getAttribute('data-fit') === fit.id ? 'true' : 'false');
        }
        buzz(8);
      });
      frag.appendChild(b);
    }
    el.fitGrid.appendChild(frag);
  }

  function goFit() {
    S.opponent = nextOpponent();
    S.act = actFor(S.opponent.act);
    S.pendingFit = S.fitId;
    renderFit();
    hud.say(S.act.blurb || '');
    showScreen('fit');
  }

  /* ------------------------------------------------------------------ */
  /* THE DECK                                                           */
  /* ------------------------------------------------------------------ */

  /** Plain words for a move's upper/lower split — the thing blends are made of. */
  function splitWord(p) {
    if (p.up >= 0.9) return 'ALL ARMS';
    if (p.up >= 0.7) return 'ARMS';
    if (p.lo >= 0.9) return 'ALL LEGS';
    if (p.lo >= 0.7) return 'LEGS';
    return 'ARMS + LEGS';
  }

  /**
   * The one sub-line under a move name. Whatever is most decision-relevant
   * right now wins the slot, and a worn move ALWAYS shows what it has decayed
   * to — the freshness rule models the verified win condition, so the cost of
   * repeating has to be legible before the tap, not after it.
   */
  function subLine(p) {
    if (!p.legal) return p.reason || 'Not now';
    let head;
    if (p.matchup === 'advantage') head = 'ADVANTAGE';
    else if (p.matchup === 'disadvantage') head = 'DISADVANTAGE';
    else if (p.wouldPattern) head = p.wouldPattern.name;
    else if (p.specialInfo) head = p.specialInfo.label;
    else head = splitWord(p);
    return p.uses > 0 ? head + ' · ×' + p.freshness : head;
  }

  /** Build the cards once per battle; `refreshDeck` keeps them current. */
  function buildDeck() {
    if (!el.grid) return;
    el.grid.textContent = '';
    S.cards = Object.create(null);
    S.cardOrder = [];
    const previews = legalMoves(S.match);
    const frag = doc.createDocumentFragment();

    for (let i = 0; i < previews.length; i++) {
      const p = previews[i];
      const b = doc.createElement('button');
      b.type = 'button';
      b.setAttribute('data-id', p.id);
      b.setAttribute('data-cat', p.cat);

      const name = doc.createElement('span');
      name.textContent = p.name;
      const sub = doc.createElement('span');
      b.appendChild(name);
      b.appendChild(sub);

      b.addEventListener('click', function () { onCard(p.id); });

      S.cards[p.id] = { btn: b, sub: sub };
      S.cardOrder.push(p.id);
      frag.appendChild(b);
    }
    el.grid.appendChild(frag);
    refreshDeck();
  }

  /** Re-read every card's outlook from the engine. Once per round. */
  function refreshDeck() {
    if (!S.match) return;
    const previews = legalMoves(S.match);
    S.previews = previews;
    for (let i = 0; i < previews.length; i++) {
      const p = previews[i];
      const card = S.cards[p.id];
      if (!card) continue;
      card.btn.setAttribute('data-uses', String(Math.min(9, p.uses)));
      card.sub.textContent = subLine(p);

      const blocked = !p.legal;
      if (blocked) card.btn.setAttribute('disabled', '');
      else card.btn.removeAttribute('disabled');

      if (S.blendStep && S.blendA === p.id) card.btn.setAttribute('aria-pressed', 'true');
      else card.btn.removeAttribute('aria-pressed');

      const bits = [p.name, p.cat];
      if (p.specialInfo) bits.push(p.specialInfo.blurb);
      if (p.hint) bits.push(p.hint);
      if (p.uses > 0) bits.push('already thrown ' + p.uses + (p.uses === 1 ? ' time' : ' times'));
      if (blocked && p.reason) bits.push(p.reason);
      card.btn.setAttribute('aria-label', bits.join('. '));
    }
  }

  /* ------------------------------------------------------------------ */
  /* THE ROUND                                                          */
  /* ------------------------------------------------------------------ */

  function snapshot() { return matchSnapshot(S.match); }

  function syncHud() {
    const snap = snapshot();
    hud.setMeter(snap.meter);
    hud.setRound(snap.round, snap.rounds);
    hud.setFoe(snap.opponent);
    hud.setHype(snap.hype, snap.blendCost, snap.canBlend, S.blendStep > 0);
  }

  function beginRound() {
    if (!S.match || S.match.over) return;
    S.turn = null;
    S.blendStep = 0;
    S.blendA = null;
    hud.clearArena();
    refreshDeck();
    syncHud();

    const snap = snapshot();
    if (snap.round === 1) {
      hud.setPrompt(promptOpener());
    } else {
      hud.setPrompt(S.lastWhy || promptOpener());
    }
    setState('ready');
  }

  /**
   * The line above the deck when nothing has happened yet.
   *
   * `finisherOpen` is true for most of a close battle, so mentioning it is
   * only ever useful when the player is actually CARRYING a finisher and it is
   * legal right now. Announcing a door the player has no key to is worse than
   * saying nothing — it was doing exactly that on round one of the first
   * fight, before the deck contained a single finisher.
   */
  function promptOpener() {
    const snap = snapshot();
    if (snap.reveal) return 'They are going ' + snap.reveal.category + ' — answer it';
    // Not on round one. The meter is close because nobody has moved yet, so
    // announcing a finisher there is urgency about nothing.
    if (snap.round > 1 && snap.finisherOpen && hasLiveFinisher()) return 'The meter is close. You can end it.';
    if (snap.links >= 2) return 'Two linked. Land another.';
    return 'Pick your move';
  }

  /** Does the deck hold a finisher that is legal this turn? */
  function hasLiveFinisher() {
    const list = S.previews || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].special === 'finisher' && list[i].legal) return true;
    }
    return false;
  }

  /**
   * A card was tapped. Either it is one half of a blend, or it is the move.
   * @param {string} id
   */
  function onCard(id) {
    if (!S.match || S.match.over) return;
    if (S.turn || timing.active()) return;

    if (S.blendStep === 1) {
      S.blendA = id;
      S.blendStep = 2;
      refreshDeck();
      hud.setPrompt('Now the LEGS — pick the move you take the bottom half from');
      hud.setHype(snapshot().hype, TUNING.blendCost, true, true);
      buzz(8);
      return;
    }

    if (S.blendStep === 2) {
      if (id === S.blendA) {                 // the same move twice is a stack
        hud.setPrompt('Two of the same is a stack, not a split. Pick a different one.');
        return;
      }
      const a = byId[S.blendA];
      const b = byId[id];
      if (!a || !b) { S.blendStep = 0; S.blendA = null; refreshDeck(); return; }
      openTiming(blendMove(a, b), { a: a.id, b: b.id });
      return;
    }

    const m = byId[id];
    if (!m) return;
    openTiming(m, null);
  }

  function onBlendButton() {
    if (!S.match || S.match.over || S.turn || timing.active()) return;
    if (S.blendStep) {
      S.blendStep = 0;
      S.blendA = null;
      refreshDeck();
      syncHud();
      hud.setPrompt(S.lastWhy || promptOpener());
      return;
    }
    if (!canBlend(S.match)) return;
    S.blendStep = 1;
    S.blendA = null;
    refreshDeck();
    hud.setHype(snapshot().hype, TUNING.blendCost, true, true);
    hud.setPrompt('Blend — pick the move you take the ARMS from');
    buzz(8);
  }

  /**
   * Hand the thumb over to `ui/timing.js`.
   *
   * The state flips to `timing` BEFORE the panel starts, because the panel is
   * `display:none` until it does and a hidden element measures as zero — the
   * needle's scoring zones are read back off the stylesheet rather than
   * hardcoded, and they have to be readable when they are read.
   *
   * @param {Object} move           a real move, or a synthetic blend
   * @param {{a: string, b: string}|null} blendPair
   */
  function openTiming(move, blendPair) {
    const snap = snapshot();
    setState('timing');
    timing.start({
      title: move.name,
      hint: blendPair
        ? 'Arms from one, legs from the other. Same size, one landing.'
        : move.hint,
      idealAmp: move.idealAmp,
      needleSpeedMult: snap.needleSpeedMult,
      unstable: snap.unstable,
      onCommit: function (input) {
        const action = { moveId: move.id, amp: input.amp, band: input.band };
        if (blendPair) action.blend = { a: blendPair.a, b: blendPair.b };
        commit(action);
      }
    });
  }

  /**
   * THE ONE CALL THAT DECIDES A TURN. Everything after this animates what
   * came back and computes nothing.
   * @param {Object} action `{ moveId, amp, band, blend? }`
   */
  function commit(action) {
    if (!S.match || S.match.over) return;
    let result;
    try {
      result = resolveExchange(S.match, action);
    } catch (e) {
      // The engine only throws on an already-finished match, which means the
      // battle ended under us. Fall through to the result screen rather than
      // stranding the player in `timing`.
      finishBattle();
      return;
    }
    S.blendStep = 0;
    S.blendA = null;
    playExchange(result);
  }

  /** Start the two clips. */
  function playExchange(result) {
    setState('resolving');
    hud.setHype(result.you.hypeAfter, TUNING.blendCost, false, false);

    const clipYou = clipFor(result.you);
    const clipThem = clipFor(result.them);
    const longest = Math.max(clipYou ? clipYou.dur : 0, clipThem ? clipThem.dur : 0, 800);

    hud.setMove('you', labelFor(result.you));
    hud.setMove('them', labelFor(result.them));

    S.turn = {
      result: result,
      clipYou: clipYou,
      clipThem: clipThem,
      peakAt: longest * PACE.peak,
      endAt: Math.max(longest + PACE.hold, longest * PACE.peak + PACE.calloutMs),
      shown: false,
      finished: false
    };
    clipStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    startLoop();
  }

  function labelFor(turn) {
    if (turn.blend) return turn.blend.aName + ' × ' + turn.blend.bName;
    return turn.moveName;
  }

  function endExchange(result) {
    S.turn = null;
    if (result.over) {
      setState('over');
      setTimeout(finishBattle, PACE.toResult);
      return;
    }
    beginRound();
  }

  /* ------------------------------------------------------------------ */
  /* THE BATTLE                                                         */
  /* ------------------------------------------------------------------ */

  function startBattle() {
    const opponent = S.opponent || nextOpponent();
    const act = S.act || actFor(opponent.act);
    const fit = fitFor(S.fitId);
    const deck = S.progress.deck.filter(function (id) { return !!byId[id]; });

    S.opponent = opponent;
    S.act = act;
    S.lastWhy = '';
    S.turn = null;
    S.blendStep = 0;
    S.blendA = null;

    S.match = createMatch({
      moves: MOVES,
      opponent: opponent,
      act: act,
      deck: deck.length ? deck : CAMP.startingKit.slice(),
      fit: fit,
      rounds: CAMP.rounds || TUNING.rounds
    });

    mountYou(S.fitId);
    mountThem(opponent);

    hud.reset();
    hud.setCrowd(hud.turnoutFor(save.reputation(S.progress), act.id));
    buildDeck();
    syncHud();
    showScreen(null);
    setState('ready');
    hud.setPrompt(promptOpener());
    hud.sayCue('start', { act: act.id, round: 1, seed: opponent.id + ':start' });
  }

  function finishBattle() {
    if (!S.match) { showScreen('map'); return; }
    const summary = matchSummary(S.match);
    const won = summary.winner === 'you';

    S.progress = save.recordBattle({
      opponentId: S.opponent.id,
      won: won,
      flawless: summary.flawless,
      drop: won ? summary.drop : null,
      aura: summary.you.aura,
      meter: summary.meter
    });

    renderResult(summary, won);
    showScreen('result');
    hud.sayCue(won ? 'win' : 'loss', { act: S.act.id, round: 9, seed: S.opponent.id + ':end' });
  }

  /* ------------------------------------------------------------------ */
  /* RESULT                                                             */
  /* ------------------------------------------------------------------ */

  function logRow(text) {
    const d = doc.createElement('div');
    d.textContent = text;
    return d;
  }

  function renderResult(summary, won) {
    S.resultMode = 'battle';
    if (el.resultTitle) el.resultTitle.textContent = summary.title;

    if (el.resultUnlock) {
      el.resultUnlock.textContent = won && summary.drop
        ? 'You learned ' + moveName(summary.drop)
        : won ? 'Nothing left to take from them.' : '';
    }

    if (el.resultLog) {
      el.resultLog.textContent = '';
      const frag = doc.createDocumentFragment();

      frag.appendChild(logRow('You ' + summary.you.text + ' · ' +
        S.opponent.name + ' ' + summary.them.text));

      if (S.act.scoring === 'both') {
        frag.appendChild(logRow('Crowd ' + summary.you.crowd + ' · Panel ' + summary.you.judges));
      }

      frag.appendChild(logRow('Different things said: ' + summary.distinctMoves +
        ' of ' + summary.rounds));

      if (summary.bestTurn) {
        frag.appendChild(logRow('Best of the night: ' + summary.bestTurn.you.moveName +
          ' · ' + summary.bestTurn.you.callout));
      }

      for (let i = 0; i < summary.lines.length; i++) frag.appendChild(logRow(summary.lines[i]));
      el.resultLog.appendChild(frag);
      el.resultLog.scrollTop = 0;
    }

    if (el.againBtn) el.againBtn.textContent = won ? 'The circuit' : 'Go again';
  }

  function renderHow() {
    S.resultMode = 'how';
    if (el.resultTitle) el.resultTitle.textContent = 'How it scores';
    if (el.resultUnlock) el.resultUnlock.textContent = 'Reference everything. Repeat nothing. Never look like you are trying.';
    if (el.resultLog) {
      el.resultLog.textContent = '';
      const frag = doc.createDocumentFragment();
      for (let i = 0; i < HOW.length; i++) frag.appendChild(logRow(HOW[i]));
      el.resultLog.appendChild(frag);
      el.resultLog.scrollTop = 0;
    }
    if (el.againBtn) el.againBtn.textContent = 'Back';
    S.progress = save.markSeen('seenHow');
    showScreen('result');
  }

  function onAgain() {
    if (S.resultMode === 'how') {
      showScreen('title');
      return;
    }
    const won = S.match && S.match.winner === 'you';
    if (won) renderMap();
    else goFit();
  }

  /* ------------------------------------------------------------------ */
  /* MAP                                                                */
  /* ------------------------------------------------------------------ */

  /** Who you beat in a finished act, read back into `#mapSub`. */
  function showRoster(act) {
    if (!el.mapSub) return;
    const names = [];
    for (let i = 0; i < OPPONENTS.length; i++) {
      if (OPPONENTS[i].act === act.id && isBeaten(OPPONENTS[i].id)) names.push(OPPONENTS[i].name);
    }
    el.mapSub.textContent = names.length
      ? act.name + ' — you beat ' + names.join(', ') + '.'
      : act.name + ' — ' + act.setting + '.';
  }

  function renderMap() {
    const next = nextOpponent();
    const act = actFor(next.act);

    if (el.mapSub) {
      const allDone = isBeaten(next.id);
      el.mapSub.textContent = allDone
        ? 'That is the whole circuit. The square is still there on Tuesday.'
        : 'Next — ' + next.name + '. ' + next.line;
    }

    if (el.actList) {
      el.actList.textContent = '';
      const frag = doc.createDocumentFragment();
      let unlocked = true;

      for (let i = 0; i < ACTS.length; i++) {
        const a = ACTS[i];
        const prog = actProgress(a.id);
        const done = prog.done >= prog.total;
        const current = a.id === act.id;
        const playable = unlocked;

        const b = doc.createElement('button');
        b.type = 'button';
        b.setAttribute('data-act', a.id);

        const n = doc.createElement('span');
        n.textContent = a.name;
        const setting = doc.createElement('span');
        setting.textContent = a.setting;
        const stat = doc.createElement('span');
        stat.textContent = prog.done + ' / ' + prog.total + ' · ' +
          (playable ? (current ? a.teaches : a.scoringNote) : 'Not yet');
        b.appendChild(n);
        b.appendChild(setting);
        b.appendChild(stat);

        if (done) b.setAttribute('data-done', '');

        if (!playable) {
          // Locked: the circuit is a queue, and the stylesheet dims it.
          b.setAttribute('data-locked', '');
          b.setAttribute('aria-disabled', 'true');
          b.disabled = true;
        } else if (current) {
          b.setAttribute('aria-current', 'step');
          b.addEventListener('click', function () { goFit(); });
        } else {
          // Finished, and behind you. Not dimmed — a square you have already
          // stood in is not a locked door. Tapping it reads back who was there,
          // which is the only reason the roster would ever be worth showing.
          b.addEventListener('click', function () { showRoster(a); });
        }

        frag.appendChild(b);
        // The circuit is a queue, not a menu: the next act opens only once the
        // one in front of it is finished.
        if (!done) unlocked = false;
      }
      el.actList.appendChild(frag);
    }

    showScreen('map');
  }

  /* ------------------------------------------------------------------ */
  /* BOOT                                                               */
  /* ------------------------------------------------------------------ */

  function onFitGo() {
    S.fitId = S.pendingFit || S.fitId;
    S.progress = save.setFit(S.fitId);
    startBattle();
  }

  function onStart() {
    if (S.progress.beaten.length > 0) renderMap();
    else goFit();
  }

  function wire() {
    if (el.startBtn) el.startBtn.addEventListener('click', onStart);
    if (el.howBtn) el.howBtn.addEventListener('click', renderHow);
    if (el.fitGo) el.fitGo.addEventListener('click', onFitGo);
    if (el.againBtn) el.againBtn.addEventListener('click', onAgain);
    if (el.blendBtn) el.blendBtn.addEventListener('click', onBlendButton);
  }

  /**
   * Boot. Wires the four buttons, stands two figures in the arena so it is
   * already a square the moment the title screen lifts, sizes the crowd from
   * saved reputation, and waits.
   */
  function start() {
    if (S.running) return;
    S.running = true;

    wire();
    mountYou(S.fitId);
    mountThem(nextOpponent());
    hud.setCrowd(hud.turnoutFor(save.reputation(S.progress), 'plaza'));
    hud.setMeter(50);
    hud.setRound(1, CAMP.rounds || TUNING.rounds);
    hud.setFoe(nextOpponent().name);
    hud.setHype(0, TUNING.blendCost, false, false);
    setState('ready');
    showScreen('title');
  }

  function stop() {
    S.running = false;
    stopLoop();
    timing.destroy();
    hud.destroy();
  }

  return { start: start, stop: stop, _state: S };
}

export default createGame;
