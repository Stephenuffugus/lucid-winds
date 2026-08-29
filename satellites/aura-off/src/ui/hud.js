/**
 * AURA OFF — src/ui/hud.js
 *
 * The crowd, the meter, the MC bar, the callouts, the move names, the status
 * chips, the hype bar. CONTRACT.md §11.
 *
 * This file RENDERS. It does not decide. Every number it paints arrived on a
 * `TurnResult` or a `matchSnapshot`, and if it ever needs one that did not,
 * the fix is in `battle.js`, not here (CONTRACT §0).
 *
 * ---------------------------------------------------------------------------
 * THE CROWD IS NOT A METER
 * ---------------------------------------------------------------------------
 * Aldama's whole reading of this phenomenon, and CONTRACT §15, is that the
 * GATHERING is the point. The winner of the real Bellas Artes battle was a
 * sixteen-year-old who said he does it to have a good time and take his mind
 * off things at home. So `#crowd` is built as people, not as a percentage:
 *
 *   - one DOM node per person, and the number of nodes is the number of people
 *     who actually came out. It grows because your reputation grew and because
 *     of WHERE you are — the banned town is four cars and three judges; the
 *     capital esplanade is several hundred phones.
 *   - the stylesheet already gives them uneven heights, uneven spacing and
 *     phone flashes on three co-prime cycles, so the row never tiles and never
 *     reads as a progress bar.
 *   - they REACT. A big turn bounces a share of them, staggered, and flashes a
 *     handful in the colour of whoever just did it. A whiff makes the whole
 *     ring sink an inch and go quiet. That is a public square responding to a
 *     person, which is the only feedback loop this game actually has.
 *
 * Every reaction is a `transform`/`opacity` Web Animation with a stagger, so
 * fifty people cost one compositor pass and never touch layout. Under
 * `prefers-reduced-motion` the reactions simply do not run — the crowd is
 * still there, still the right size, still lit.
 */

import { mcLine, roundLine, SPECIAL_LINES } from '../data/mc.js';

/** The most people the ring can hold before the stylesheet clips a third rank. */
const CROWD_MAX = 54;
const CROWD_MIN = 5;

/**
 * How full a square gets, by act. Not decoration — this is the story:
 * the bracket is two hundred entrants, the banned town has no crowd to play
 * to at all, the esplanade is several hundred phones, and upriver there are
 * sixty rowers behind you whether they are watching or not.
 */
const ACT_TURNOUT = Object.freeze({
  plaza: 1.00,
  bracket: 1.30,
  banned: 0.26,
  capital: 1.65,
  upriver: 1.35
});

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/**
 * Build the HUD over the shipped DOM.
 *
 * @param {Object}   [opts]
 * @param {Document} [opts.doc]
 * @returns {Object} the HUD controller
 */
export function createHud(opts) {
  const o = opts || {};
  const doc = o.doc || (typeof document !== 'undefined' ? document : null);
  if (!doc) throw new Error('createHud needs a document');

  const el = {
    crowd: doc.getElementById('crowd'),
    meter: doc.getElementById('meterFill'),
    mcbar: doc.getElementById('mcbar'),
    round: doc.getElementById('roundLabel'),
    foe: doc.getElementById('foeLabel'),
    prompt: doc.getElementById('prompt'),
    hype: doc.getElementById('hypeFill'),
    blend: doc.getElementById('blendBtn'),
    you: {
      callout: doc.getElementById('calloutYou'),
      name: doc.getElementById('nameYou'),
      status: doc.getElementById('statusYou')
    },
    them: {
      callout: doc.getElementById('calloutThem'),
      name: doc.getElementById('nameThem'),
      status: doc.getElementById('statusThem')
    }
  };

  const view = doc.defaultView || (typeof window !== 'undefined' ? window : null);

  const reduced = (function () {
    try { return !!(view && view.matchMedia && view.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (e) { return false; }
  }());

  const canAnimate = !reduced && typeof Element !== 'undefined' &&
    Element.prototype && typeof Element.prototype.animate === 'function';

  /** People currently in the ring. */
  let people = [];
  /** Colour flashes waiting to be cleared. */
  let flashTimer = 0;

  /* ---------------------------------------------------------------------- */
  /* THE CROWD                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * How many people turn out: your reputation, then the room.
   * @param {number} rep      opponents you have actually beaten (0…25)
   * @param {string} actId
   * @returns {number}
   */
  function turnoutFor(rep, actId) {
    // Nineteen on a Tuesday with nobody having heard of you, fifty once you
    // have taken the whole circuit. Below about eighteen the stylesheet's
    // co-prime height and spacing cycles have too few people to break up and
    // the row starts to read as a comb of identical dots, which is the exact
    // thing the crowd must never look like.
    const base = 19 + clamp(rep, 0, 25) * 1.25;
    const mult = ACT_TURNOUT[actId] != null ? ACT_TURNOUT[actId] : 1;
    return Math.round(clamp(base * mult, CROWD_MIN, CROWD_MAX));
  }

  /**
   * Put `n` people in the ring, adding or removing only the difference so the
   * stylesheet's nth-child rhythm survives and nothing re-rasterises.
   * @param {number} n
   */
  function setCrowd(n) {
    if (!el.crowd) return;
    const want = Math.round(clamp(n, CROWD_MIN, CROWD_MAX));
    while (people.length > want) {
      const gone = people.pop();
      if (gone && gone.parentNode) gone.parentNode.removeChild(gone);
    }
    if (people.length < want) {
      const frag = doc.createDocumentFragment();
      while (people.length < want) {
        const p = doc.createElement('i');
        people.push(p);
        frag.appendChild(p);
      }
      el.crowd.appendChild(frag);
    }
  }

  /** Current head count. */
  function crowdSize() { return people.length; }

  /**
   * Someone new arrives mid-battle. Used when a turn is loud enough that the
   * square notices — word travels, which is the documented mechanism.
   * @param {number} n
   */
  function drawIn(n) {
    const add = Math.round(n);
    if (add <= 0 || people.length >= CROWD_MAX) return;
    setCrowd(people.length + add);
    if (!canAnimate) return;
    for (let i = people.length - add; i < people.length; i++) {
      try {
        people[i].animate(
          [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'none' }
        );
      } catch (e) { /* an unanimatable node is still a person */ }
    }
  }

  function clearFlashes() {
    if (flashTimer) { clearTimeout(flashTimer); flashTimer = 0; }
    for (let i = 0; i < people.length; i++) people[i].style.color = '';
  }

  /**
   * The square responds.
   *
   * @param {Object}  r
   * @param {'cheer'|'roar'|'gasp'|'quiet'} r.kind
   * @param {number}  [r.strength=0.5]   0…1
   * @param {'you'|'them'|null} [r.side] whose colour a few of them flash
   */
  function react(r) {
    const c = r || {};
    const kind = c.kind || 'cheer';
    const strength = clamp(typeof c.strength === 'number' ? c.strength : 0.5, 0, 1);
    if (!canAnimate || !people.length) return;

    if (kind === 'quiet') return;

    if (kind === 'gasp') {
      // Everybody sinks an inch. Nobody laughs. It is the most human thing
      // the crowd does and it costs one animation per person.
      for (let i = 0; i < people.length; i++) {
        try {
          people[i].animate(
            [{ transform: 'translateY(0)', opacity: 1 },
             { transform: 'translateY(2.5px)', opacity: 0.55, offset: 0.35 },
             { transform: 'translateY(0)', opacity: 1 }],
            { duration: 620, delay: (i % 7) * 14, easing: 'ease-out', fill: 'none' }
          );
        } catch (e) { /* skip */ }
      }
      return;
    }

    const all = kind === 'roar';
    const share = all ? 1 : 0.22 + 0.55 * strength;
    const lift = (all ? 9 : 4) + 7 * strength;

    for (let i = 0; i < people.length; i++) {
      if (!all && Math.random() > share) continue;
      try {
        people[i].animate(
          [{ transform: 'translateY(0)' },
           { transform: 'translateY(-' + (lift * (0.6 + Math.random() * 0.6)).toFixed(1) + 'px)', offset: 0.38 },
           { transform: 'translateY(0)' }],
          {
            duration: 460 + Math.random() * 260,
            delay: Math.random() * (all ? 150 : 220),
            easing: 'cubic-bezier(.3,.9,.4,1)',
            fill: 'none'
          }
        );
      } catch (e) { /* skip */ }
    }

    // A handful catch the light of whoever just did that. Locked palette only.
    if (c.side === 'you' || c.side === 'them') {
      clearFlashes();
      const tint = c.side === 'you' ? 'var(--you)' : 'var(--them)';
      const lit = Math.min(people.length, 2 + Math.round(strength * 5));
      for (let i = 0; i < lit; i++) {
        const p = people[(Math.random() * people.length) | 0];
        if (p) p.style.color = tint;
      }
      flashTimer = setTimeout(clearFlashes, 620);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* THE METER — a tug of war, not a health bar                             */
  /* ---------------------------------------------------------------------- */

  /** @param {number} v 0…100, where 50 is level */
  function setMeter(v) {
    if (!el.meter) return;
    el.meter.style.width = clamp(v, 0, 100).toFixed(2) + '%';
  }

  /* ---------------------------------------------------------------------- */
  /* THE MC                                                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Say something. The stylesheet animates `.mcbar:not(:empty)`, and a CSS
   * animation only restarts when the selector match does — so the bar is
   * emptied, the layout is flushed, and the new line goes in. That is one
   * forced reflow per exchange, which is cheap and buys the line an entrance.
   *
   * `null` is a legitimate thing for an announcer to say. The bar is allowed
   * to be empty.
   *
   * @param {string|null} text
   */
  function say(text) {
    if (!el.mcbar) return;
    const next = text == null ? '' : String(text);
    if (el.mcbar.textContent === next) return;
    el.mcbar.textContent = '';
    if (next) {
      void el.mcbar.offsetWidth;   // flush, so the entrance animation re-runs
      el.mcbar.textContent = next;
    }
  }

  /**
   * Say whatever `src/data/mc.js` has for this moment. The engine names the
   * moment; the voice lives in the data file; this just carries it.
   *
   * @param {string|null} cue  from `resolveExchange().mcCue`
   * @param {Object} [ctx]     `{ act, round, seed }`
   */
  function sayCue(cue, ctx) {
    say(mcLine(cue, ctx));
  }

  /** The line for the top of a round, before anyone has moved. */
  function sayRound(round, seed) {
    say(roundLine(round, seed));
  }

  /* ---------------------------------------------------------------------- */
  /* LABELS                                                                 */
  /* ---------------------------------------------------------------------- */

  function setRound(round, total) {
    if (!el.round) return;
    el.round.textContent = round > total ? 'Final' : ('Round ' + round);
  }

  function setFoe(name) {
    if (el.foe) el.foe.textContent = name || 'Rival';
  }

  /** The move name floating over a fighter. */
  function setMove(side, text) {
    const s = el[side];
    if (!s || !s.name) return;
    const next = text == null ? '' : String(text);
    if (s.name.textContent === next) return;
    s.name.textContent = '';
    if (next) { void s.name.offsetWidth; s.name.textContent = next; }
  }

  /**
   * The chips above a fighter. The stylesheet shows at most two, so the order
   * this list arrives in is the order of importance — and what hurt comes
   * before what helped, because the player has to be able to see WHY they lost
   * a turn.
   *
   * @param {'you'|'them'} side
   * @param {Array<{key: string, label: string}>} chips
   */
  function setStatus(side, chips) {
    const s = el[side];
    if (!s || !s.status) return;
    s.status.textContent = '';
    if (!chips || !chips.length) return;
    const frag = doc.createDocumentFragment();
    for (let i = 0; i < chips.length && i < 2; i++) {
      const c = chips[i];
      if (!c || !c.label) continue;
      const b = doc.createElement('span');
      b.textContent = c.label;
      if (c.key) b.setAttribute('data-k', c.key);
      if (c.title) b.title = c.title;
      frag.appendChild(b);
    }
    s.status.appendChild(frag);
  }

  /**
   * The score popup, in the culture's own register — `+1000 AURA`, `+10.000`,
   * `AURA 100%`, `PERDIÓ AURA`, `AURA INFINITA`. The string arrives already
   * built by `scoring.callout()`; never invent a unit here (CONTRACT §12).
   *
   * @param {'you'|'them'} side
   * @param {string} text
   * @param {'big'|'clean'|'miss'|null} [tone]
   */
  function callout(side, text, tone) {
    const s = el[side];
    if (!s || !s.callout) return;
    const node = s.callout;
    node.textContent = '';
    if (tone) node.setAttribute('data-tone', tone);
    else node.removeAttribute('data-tone');
    if (text == null || text === '') return;
    void node.offsetWidth;          // restart `.callout:not(:empty)`
    node.textContent = String(text);
  }

  /**
   * Pick the tone for a callout from the turn that produced it.
   * @param {Object} turn a `SideTurn` from `resolveExchange`
   * @returns {'big'|'clean'|'miss'|null}
   */
  function toneFor(turn) {
    if (!turn) return null;
    if (turn.band === 'whiff') return 'miss';
    if (turn.callout === '+10.000' || turn.callout === 'AURA INFINITA') return 'big';
    if (turn.score >= 2600) return 'big';
    if (turn.band === 'perfect') return 'clean';
    return null;
  }

  /** Clear every floating label. Between battles, and before a new round. */
  function clearArena() {
    callout('you', '');
    callout('them', '');
    setMove('you', '');
    setMove('them', '');
    setStatus('you', null);
    setStatus('them', null);
  }

  /* ---------------------------------------------------------------------- */
  /* HYPE + BLEND                                                           */
  /* ---------------------------------------------------------------------- */

  /**
   * The hype bar reads as DISTANCE TO A BLEND, not as an abstract resource,
   * because the only thing hype does is buy one. Full bar means the button is
   * live; the button says so in words as well.
   *
   * @param {number} hype
   * @param {number} cost      `TUNING.blendCost`
   * @param {boolean} enabled  from `canBlend(match)`
   * @param {boolean} [armed]  the player is mid-blend selection
   */
  function setHype(hype, cost, enabled, armed) {
    const c = cost > 0 ? cost : 100;
    if (el.hype) el.hype.style.width = (clamp(hype / c, 0, 1) * 100).toFixed(1) + '%';
    if (!el.blend) return;
    el.blend.disabled = !enabled && !armed;
    el.blend.textContent = armed
      ? 'Cancel blend'
      : enabled ? 'Blend · ready' : ('Blend · ' + Math.floor(clamp(hype, 0, c)) + '/' + c + ' hype');
    if (armed) el.blend.setAttribute('aria-pressed', 'true');
    else el.blend.removeAttribute('aria-pressed');
  }

  /**
   * The line above the deck. It carries the breakdown of the turn that just
   * happened while the player picks the next one — which is the moment they
   * are actually reading it.
   * @param {string} text
   */
  function setPrompt(text) {
    if (el.prompt) el.prompt.textContent = text == null ? '' : String(text);
  }

  /* ---------------------------------------------------------------------- */
  /* ONE CALL PER EXCHANGE                                                  */
  /* ---------------------------------------------------------------------- */

  /**
   * Everything the crowd, the meter and the announcer do about one turn.
   * Called by `game.js` at the moment the pose peaks, not at the moment the
   * numbers were computed — the square reacts to the body, not to the maths.
   *
   * @param {Object} result a full `TurnResult`
   * @param {Object} [ctx]  `{ act, round, seed }` for the MC
   */
  function showExchange(result, ctx) {
    if (!result) return;
    setMeter(result.meterAfter);

    const you = result.you;
    const them = result.them;

    callout('you', you.callout, toneFor(you));
    callout('them', them.callout, toneFor(them));
    setStatus('you', chipsFor(you));
    setStatus('them', chipsFor(them));

    // Who the square is reacting to, and how hard.
    const lead = you.score - them.score;
    const strength = clamp(Math.max(you.score, them.score) / 2600, 0.15, 1);

    if (you.band === 'whiff' && them.band !== 'whiff') react({ kind: 'gasp' });
    else if (result.mcCue === 'pattern' || result.mcCue === 'finisher' || result.mcCue === 'flawless') {
      react({ kind: 'roar', strength: 1, side: lead >= 0 ? 'you' : 'them' });
    } else if (Math.abs(lead) < 120) {
      react({ kind: 'cheer', strength: strength * 0.7, side: null });
    } else {
      react({ kind: 'cheer', strength: strength, side: lead > 0 ? 'you' : 'them' });
    }

    // Word travels. A loud turn brings people over from the bus stop.
    if (you.score >= 1800 || result.mcCue === 'pattern' || result.mcCue === 'finisher') drawIn(1 + (you.score >= 3200 ? 2 : 0));

    sayCue(result.mcCue, ctx);
  }

  /**
   * Turn a `SideTurn` into at most two chips, penalties first.
   *
   * FRESHNESS IS THE LESSON. Repeating yourself is the losing strategy
   * (CONTRACT §14) and the player has to see that without being told, so a
   * `REPEATED` chip outranks everything except being cut off or guarded.
   *
   * @param {Object} turn
   * @returns {Array<{key: string, label: string, title?: string}>}
   */
  function chipsFor(turn) {
    const out = [];
    if (!turn) return out;
    const seen = Object.create(null);
    const push = function (key, label, title) {
      if (!label || seen[key]) return;
      seen[key] = 1;
      out.push({ key: key, label: label, title: title || '' });
    };

    // 1. what was done TO them
    const status = turn.status || [];
    for (let i = 0; i < status.length; i++) {
      const s = status[i];
      if (s.key === 'guarded' || s.key === 'interrupted' || s.key === 'debuffed' || s.key === 'punished') {
        push(s.key, s.label);
      }
    }

    // 2. what cost them, worst first
    const mults = turn.multipliers || [];
    const hurt = mults.filter(function (m) { return m.value < 0.999; })
      .sort(function (a, b) { return a.value - b.value; });
    for (let i = 0; i < hurt.length; i++) push(hurt[i].key, hurt[i].label);

    // 3. what earned them it, best first
    const helped = mults.filter(function (m) { return m.value > 1.001; })
      .sort(function (a, b) { return b.value - a.value; });
    for (let i = 0; i < helped.length; i++) push(helped[i].key, helped[i].label);

    // 4. the special that fired, with its narration on the tooltip
    if (turn.special && turn.special.fired) {
      push('special', turn.special.label, SPECIAL_LINES[turn.special.key] || turn.special.detail || '');
    }

    // 5. anything else the engine flagged
    for (let i = 0; i < status.length; i++) push(status[i].key, status[i].label);

    return out;
  }

/**
   * How loudly a factor deserves to be heard, on top of how far it moved the
   * number. Sorting on raw magnitude alone is nearly right and wrong in one
   * specific, visible way: a named three-move chain is ×1.5, which ties with a
   * plain category advantage, so the most interesting thing a player can do in
   * nine rounds kept losing a coin flip and vanishing from the breakdown while
   * the announcer was busy shouting about it. Freshness gets a lift for the
   * same reason in reverse — repeating yourself is the losing strategy, and
   * the line above the deck is where that gets taught.
   */
  const FACTOR_WEIGHT = Object.freeze({
    pattern: 3.0,
    blend: 1.6,
    freshness: 1.5,
    timing: 1.2,
    guard: 1.2,
    special: 1.1,
    matchup: 1.0,
    composure: 1.0,
    combo: 1.0
  });

  /**
   * The one-line breakdown that goes above the deck: the three factors that
   * mattered most, in the order they read.
   * @param {Object} turn
   * @returns {string}
   */
  function whyLine(turn) {
    if (!turn) return '';
    const mults = (turn.multipliers || []).slice();
    if (!mults.length) return turn.bandLabel || '';
    mults.sort(function (a, b) {
      const wa = (FACTOR_WEIGHT[a.key] || 1) * Math.abs(Math.log(a.value || 1));
      const wb = (FACTOR_WEIGHT[b.key] || 1) * Math.abs(Math.log(b.value || 1));
      return wb - wa;
    });
    const parts = [];
    for (let i = 0; i < mults.length && parts.length < 3; i++) {
      const m = mults[i];
      parts.push(m.label + ' ×' + trimNum(m.value));
    }
    return parts.join(' · ');
  }

  function trimNum(v) {
    const n = Math.round(v * 100) / 100;
    return String(n);
  }

  /* ---------------------------------------------------------------------- */

  function reset() {
    clearArena();
    clearFlashes();
    setMeter(50);
    say('');
    setPrompt('');
  }

  function destroy() {
    clearFlashes();
  }

  return {
    // crowd
    setCrowd: setCrowd,
    crowdSize: crowdSize,
    turnoutFor: turnoutFor,
    drawIn: drawIn,
    react: react,
    // hud
    setMeter: setMeter,
    setRound: setRound,
    setFoe: setFoe,
    setHype: setHype,
    setPrompt: setPrompt,
    // arena
    setMove: setMove,
    setStatus: setStatus,
    callout: callout,
    toneFor: toneFor,
    clearArena: clearArena,
    // voice
    say: say,
    sayCue: sayCue,
    sayRound: sayRound,
    // per turn
    showExchange: showExchange,
    chipsFor: chipsFor,
    whyLine: whyLine,
    reset: reset,
    destroy: destroy,
    reducedMotion: reduced
  };
}

export default createHud;
