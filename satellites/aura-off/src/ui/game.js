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
 * TWO STAGES, ONE STATE MACHINE
 * ---------------------------------------------------------------------------
 * A fight is EL FARMEO and then LA BATALLA. The farmeo is a `createQualifier()`
 * match — same engine, same deck, same needle, same `resolveExchange()`, with
 * nobody standing opposite — so `S.match` simply points at whichever one is
 * running and every function below works on both without asking which. The only
 * places that branch are the ones where there is literally a second body to
 * paint: `playExchange`, `showSolo`, and the end of a stage.
 *
 * The reason there is a stage at all: AURA-CULTURE §8.2 documents competitors
 * registering in advance and elimination rounds, and the farmeo is where that
 * lands. With no opponent there is no category to answer, so the matchup
 * triangle is off the board and what is left is the needle and the mark — the
 * exact pair the culture rewards, and the exact pair a new player has no room
 * to notice while somebody is throwing things at them.
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
  legalMoves, previewMove, canBlend, getMove, TUNING,
  qualifyFor, createQualifier, qualifySummary
} from '../engine/battle.js?v=20260829b';
import { blendMove } from '../engine/scoring.js?v=20260829b';
import { sampleInto, blend as blendPose, lerpPose, settleWeight } from '../engine/anim.js?v=20260829b';
import { restPose, mountFigure } from '../engine/rig.js?v=20260829b';

import { createHud } from './hud.js?v=20260829b';
import { createTiming } from './timing.js?v=20260829b';
import * as save from './save.js?v=20260829b';

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
  'THE TRIANGLE · Flex beats Bait. Bait beats Flow. Flow beats Flex. Reading it right is worth half again as much.',
  'THE LIGHT · Release the hold when the needle is on the white. Perfect doubles it. Clean is most of it. Late is a whiff, and a whiff is PERDIÓ AURA.',
  'THE MARK · Holding longer makes the move bigger. The white mark on the bar is the size the crowd rewards. Bigger is not better, and going over the mark costs you more than stopping short of it.',
  'SAY SOMETHING NEW · The second time you throw a move it is worth about two thirds. The third, under half. Repeating yourself is how you lose.',
  'ARMS AND LEGS ARE SEPARATE JOBS · Blend takes the arms of one move and the legs of another. A real split scores. Two of a kind does not.',
  'THE ROOM · A crowd rewards laughing and surprise. A panel rewards composure and something they have not seen. Some nights you have both, and they want opposite things.',
  'NINE ROUNDS · The bar at the top is a tug of war, not a health bar. Whoever it is leaning towards at the end took it.',
  'EL FARMEO · Almost every fight starts with you going up on your own. No rival means no triangle, so it is only the light and the mark. Clear the bar and you start the battle level or better; fall short and you start behind. You always get in.'
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
    queueLine: doc.getElementById('queueLine'),
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
    resultMode: 'battle',   // 'battle' | 'how' | 'qualify'
    /** Which stage of the fight is running: EL FARMEO, or LA BATALLA. */
    stage: 'battle',        // 'qualify' | 'battle'
    match: null,
    opponent: null,
    act: null,
    /** `qualifyFor()` for the fight being set up, or null when it has no farmeo. */
    plan: null,
    /** What the farmeo bought: `{ meterStart, crowd }`. Consumed by startBattle. */
    opening: null,
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

  /**
   * Nobody is standing opposite during EL FARMEO, so nobody is drawn there.
   *
   * `visibility` rather than `display`: the fighter keeps its box, so the floor
   * and the arena do not reflow between the two stages of one fight, and
   * `#calloutThem` / `#nameThem` / `#statusThem` stay in the document exactly
   * where CONTRACT §11 requires them. This is an inline style because the
   * stylesheet is not this file's to write.
   *
   * @param {boolean} on
   */
  function showRival(on) {
    if (!el.them) return;
    el.them.style.visibility = on ? '' : 'hidden';
    /* The stage is also a LAYOUT fact, not just a visibility one. With the rival
       hidden, the performer was still standing in their duel position with the
       empty rival slot beside them, so half the arena read as dead space —
       exactly the void this arena was rebuilt to remove. A separate attribute
       from `data-state` (ready|timing|resolving|over), which it does not clash
       with; the stylesheet centres the performer off it. */
    try { doc.body.dataset.stage = on ? 'duel' : 'farmeo'; } catch (e) { /* ignore */ }
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
      const ctx = {
        act: S.act && S.act.id,
        round: turn.result.round,
        seed: (S.opponent ? S.opponent.id : '') +
          (turn.result.solo ? ':farmeo:' : ':') + turn.result.round
      };
      if (turn.result.solo) showSolo(turn.result, ctx);
      else hud.showExchange(turn.result, ctx);
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

  /**
   * EL FARMEO's version of `hud.showExchange` — the same HUD calls in the same
   * order, minus everything about a second person.
   *
   * `hud.showExchange` cannot be reused: it paints `result.them`, and in a solo
   * `result.them` is null on purpose so that a consumer which forgot the stage
   * exists fails loudly instead of quietly writing a score over an empty patch
   * of concrete. Nothing here is computed — the meter reading, the callout, the
   * chips and the cue all came off the engine's result.
   *
   * The room still reacts, because the room is the entire opposition. A whiff
   * with nobody to blame is the loudest silence in the game.
   *
   * @param {Object} result a solo TurnResult
   * @param {Object} ctx    `{ act, round, seed }` for the MC
   */
  function showSolo(result, ctx) {
    const you = result.you;

    hud.setMeter(result.meterAfter);          // progress towards the bar
    hud.callout('you', you.callout, hud.toneFor(you));
    hud.setStatus('you', hud.chipsFor(you));
    hud.callout('them', '');
    hud.setStatus('them', null);

    const landed = you.band === 'perfect' || you.band === 'clean';
    const strength = clamp(you.score / 2600, 0.15, 1);
    const fresh = you.factors ? you.factors.freshness : 1;

    if (you.band === 'whiff') hud.react({ kind: 'gasp' });
    else if (you.cat === 'BAIT' && landed) hud.react({ kind: 'laugh', strength: strength, side: 'you' });
    else if (fresh < 0.9) hud.react({ kind: 'flat' });
    else hud.react({ kind: 'cheer', strength: strength, side: 'you' });

    // Word travels, exactly as it does in a battle. It is the documented
    // mechanism and it does not wait for a fight to start.
    if (you.score >= 1800) hud.drawIn(1);

    // `null` is a legitimate thing for an announcer to say, and in a solo it is
    // most of what the engine hands over — the MC's duel lines are about two
    // people. Leaving the standing line up is better than describing a rival
    // who is not there.
    if (result.mcCue) hud.sayCue(result.mcCue, ctx);
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

  /** One band off the ladder `qualifyFor()` handed over. */
  function bandOf(plan, key) {
    for (let i = 0; i < plan.bands.length; i++) {
      if (plan.bands[i].key === key) return plan.bands[i];
    }
    return plan.bands[plan.bands.length - 1];
  }

  /** One rung of the queue ladder: the number, and what it buys. */
  function queueRow(value, label, lit) {
    const row = doc.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.gap = '12px';
    row.style.lineHeight = '1.6';
    if (!lit) row.style.opacity = '0.62';
    const v = doc.createElement('span');
    v.textContent = value;
    const l = doc.createElement('span');
    l.textContent = label;
    row.appendChild(v);
    row.appendChild(l);
    return row;
  }

  /**
   * What the farmeo is going to ask for, said BEFORE the player commits.
   *
   * A qualifier whose price you find out afterwards is a trap, so the whole
   * ladder is on this screen — and it is a LADDER, not a paragraph. The first
   * draft was twelve lines of prose with three numbers buried in it, and at
   * 375×667 it pushed the heading off the top of the screen and the button off
   * the bottom. Three rows in the same shape as the fit tiles underneath fit,
   * and let the numbers be compared at a glance instead of parsed.
   *
   * Every rung says "in". That is the message: you always get in, and the only
   * question is what you walk in on. There is no dead end here to be afraid of.
   *
   * The act's own account of what the queue looks like is deliberately NOT
   * here — it would say the same thing twice. It lands on the MC bar a second
   * later, at the top of the farmeo itself, which is where it belongs.
   */
  function renderQueueLine() {
    if (!el.queueLine) return;
    el.queueLine.textContent = '';

    // The one fight with no farmeo gets no block, and no stray rule above the
    // fit tiles where a block used to be.
    if (!S.plan) {
      el.queueLine.style.display = 'none';
      if (el.fitGo) el.fitGo.textContent = 'Step up';
      return;
    }
    el.queueLine.style.display = '';

    const p = S.plan;
    const frag = doc.createDocumentFragment();

    const head = doc.createElement('div');
    head.style.marginBottom = '6px';
    head.textContent = 'EL FARMEO · ' + p.turns + ' moves, on your own';
    frag.appendChild(head);

    frag.appendChild(queueRow(bandOf(p, 'straight').needText, 'straight in, ahead', false));
    frag.appendChild(queueRow(p.targetText, 'in, level', true));
    frag.appendChild(queueRow(bandOf(p, 'late').needText, 'in, from behind', false));

    el.queueLine.appendChild(frag);

    if (el.fitGo) el.fitGo.textContent = 'Take your turn';
  }

  function goFit() {
    S.opponent = nextOpponent();
    S.act = actFor(S.opponent.act);
    S.plan = qualifyFor(S.act, S.opponent);
    S.opening = null;
    S.pendingFit = S.fitId;
    renderFit();
    renderQueueLine();
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
    // In EL FARMEO the thing opposite you is the bar, so the slot that names
    // the rival names the bar instead. It is the honest use of that label:
    // it is what you are up against, and on a Tuesday it is a number.
    hud.setFoe(snap.solo ? snap.targetText + ' de aura' : snap.opponent);
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
    let line;
    if (snap.round === 1) line = promptOpener();
    else line = S.lastWhy || promptOpener();
    // A farmeo is two or three moves long, so the running tally has to ride
    // along with the breakdown rather than take turns with it — there is no
    // later round to read it on.
    if (snap.solo && snap.round > 1 && S.lastWhy) line = line + ' · ' + soloTail(snap);
    hud.setPrompt(line);
    setState('ready');
  }

  /** How far off the bar you are, in the register the callouts already use. */
  function soloTail(snap) {
    if (snap.overBar) return 'over the bar with ' + turnsLeft(snap) + ' to go';
    return snap.remainingText + ' short, ' + turnsLeft(snap) + ' to go';
  }

  function turnsLeft(snap) {
    const n = Math.max(0, snap.rounds - snap.round + 1);
    return n === 1 ? 'one move' : n + ' moves';
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
    // EL FARMEO. There is no triangle to read and no chain worth building over
    // two or three moves, so the opener names the only two dials that are left,
    // which is the whole reason the stage is worth playing.
    if (snap.solo) {
      if (snap.round === 1) {
        return 'Nobody opposite. Hold the mark, land the light, and say ' +
          snap.rounds + ' different things.';
      }
      return soloTail(snap);
    }
    if (snap.reveal) return 'They are going ' + snap.reveal.category + ' · answer it';
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
      hud.setPrompt('Now the LEGS · pick the move you take the bottom half from');
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
    hud.setPrompt('Blend, pick the move you take the ARMS from');
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
      // stage ended under us. Fall through to whichever result screen this
      // stage owns rather than stranding the player in `timing`.
      endStage();
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
    hud.setMove('them', result.them ? labelFor(result.them) : '');

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
      setTimeout(endStage, PACE.toResult);
      return;
    }
    beginRound();
  }

  /** Whichever stage just finished gets to write its own result screen. */
  function endStage() {
    if (S.stage === 'qualify') finishQualifier();
    else finishBattle();
  }

  /* ------------------------------------------------------------------ */
  /* THE BATTLE                                                         */
  /* ------------------------------------------------------------------ */

  /** The deck the player actually owns, never empty. */
  function ownedDeck() {
    const deck = S.progress.deck.filter(function (id) { return !!byId[id]; });
    return deck.length ? deck : CAMP.startingKit.slice();
  }

  /**
   * EL FARMEO. You go up alone, the room decides, and what it decides is the
   * meter you open the battle on.
   *
   * Everything below is `startBattle` with the rival taken out: the same deck,
   * the same needle, the same crowd, the same `S.match` that every function in
   * this file already knows how to drive.
   */
  function startQualifier() {
    const opponent = S.opponent || nextOpponent();
    const act = S.act || actFor(opponent.act);
    const plan = S.plan || qualifyFor(act, opponent);

    S.stage = 'qualify';
    S.opponent = opponent;
    S.act = act;
    S.plan = plan;
    S.opening = null;
    S.lastWhy = '';
    S.turn = null;
    S.blendStep = 0;
    S.blendA = null;

    S.match = createQualifier({
      moves: MOVES,
      opponent: opponent,
      act: act,
      plan: plan,
      deck: ownedDeck()
    });

    mountYou(S.fitId);
    showRival(false);

    hud.reset();
    hud.setCrowd(hud.turnoutFor(save.reputation(S.progress), act.id));
    buildDeck();
    syncHud();
    showScreen(null);
    setState('ready');
    hud.setPrompt(promptOpener());
    // The act's own account of what the queue looks like here. The MC's cue
    // banks are written about two people, so the farmeo gets this instead.
    hud.say(plan.line);
  }

  function startBattle() {
    const opponent = S.opponent || nextOpponent();
    const act = S.act || actFor(opponent.act);
    const fit = fitFor(S.fitId);

    // Whatever the farmeo bought, spent once and then gone. A fight with no
    // farmeo opens level, exactly as it always did.
    const opening = S.opening;
    S.opening = null;

    S.stage = 'battle';
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
      deck: ownedDeck(),
      fit: fit,
      rounds: CAMP.rounds || TUNING.rounds,
      meterStart: opening ? opening.meterStart : undefined
    });

    mountYou(S.fitId);
    mountThem(opponent);
    showRival(true);

    hud.reset();
    hud.setCrowd(hud.turnoutFor(save.reputation(S.progress), act.id) +
      (opening ? opening.crowd : 0));
    buildDeck();
    syncHud();
    showScreen(null);
    setState('ready');
    hud.setPrompt(promptOpener());
    hud.sayCue('start', { act: act.id, round: 1, seed: opponent.id + ':start' });
  }

  /**
   * The end of a farmeo. Nothing is saved — the verdict is spent on the battle
   * that starts the moment the player taps through, and a qualifier that
   * outlived its own fight would be a second, invisible progression system.
   */
  function finishQualifier() {
    if (!S.match) { showScreen('map'); return; }
    const summary = qualifySummary(S.match);
    S.opening = { meterStart: summary.meterStart, crowd: summary.crowd };
    renderQualifyResult(summary);
    showScreen('result');
    hud.say(summary.note);
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

  /**
   * The farmeo's verdict, on the screen the battle result already uses.
   *
   * The bar and the number you actually farmed go on the same line so the
   * distance between them is the first thing read, and the band's note says in
   * words what that distance just cost. There is no failure state to render,
   * because there is no failure state.
   */
  function renderQualifyResult(s) {
    S.resultMode = 'qualify';
    if (el.resultTitle) el.resultTitle.textContent = s.title;
    if (el.resultUnlock) el.resultUnlock.textContent = s.note;

    if (el.resultLog) {
      el.resultLog.textContent = '';
      const frag = doc.createDocumentFragment();

      frag.appendChild(logRow('You farmed ' + s.auraText + ' de aura. The bar was ' +
        s.targetText + '.'));
      frag.appendChild(logRow('Different things said: ' + s.distinctMoves +
        ' of ' + s.rounds));

      if (s.bestTurn) {
        frag.appendChild(logRow('Best of it: ' + s.bestTurn.you.moveName +
          ' · ' + s.bestTurn.you.callout));
      }

      for (let i = 0; i < s.lines.length; i++) frag.appendChild(logRow(s.lines[i]));
      el.resultLog.appendChild(frag);
      el.resultLog.scrollTop = 0;
    }

    if (el.againBtn) el.againBtn.textContent = 'Into the circle';
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
    // The farmeo does not end anything. Whatever the room made of it, the
    // next tap is the battle — that is the promise the fit screen made.
    if (S.resultMode === 'qualify') {
      startBattle();
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
      ? act.name + ' · you beat ' + names.join(', ') + '.'
      : act.name + ' — ' + act.setting + '.';
  }

  function renderMap() {
    const next = nextOpponent();
    const act = actFor(next.act);

    if (el.mapSub) {
      const allDone = isBeaten(next.id);
      el.mapSub.textContent = allDone
        ? 'That is the whole circuit. The square is still there on Tuesday.'
        : 'Next · ' + next.name + '. ' + next.line;
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
    if (S.plan) startQualifier();
    else startBattle();
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
    showRival(true);
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
