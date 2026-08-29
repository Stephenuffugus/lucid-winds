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
 * THE CROWD IS ONE SYSTEM, AND IT IS THE POINT
 * ---------------------------------------------------------------------------
 * Aldama's whole reading of this phenomenon, and CONTRACT §15, is that the
 * GATHERING is the point. The winner of the real Bellas Artes battle was a
 * sixteen-year-old who said he does it to have a good time and take his mind
 * off things at home. So `#crowd` is built as PEOPLE, not as a percentage:
 *
 *   - one DOM node per person, and the number of nodes is the number of people
 *     who actually came out. It grows because your reputation grew and because
 *     of WHERE you are — the banned town is four cars and three judges; the
 *     capital esplanade is several hundred phones.
 *   - every person gets a DETERMINISTIC profile from their index: own width,
 *     height, head size, head TURN, depth, and the gap before them. Person 7 is
 *     the same person every time, and no two neighbours are the same size. A
 *     crowd built out of one repeated glyph reads as a texture — or worse, as a
 *     loading placeholder — and that is what this replaced.
 *   - they stand in CLUMPS. Tight shoulder-to-shoulder groups of three to five
 *     with real space between the groups, because that is what people who came
 *     with their friends do. Nobody stands on an even grid.
 *   - some face the fight and some face each other (`--hx` moves the head off
 *     centre, which is a turn), and about one in five is FILMING: a raised arm
 *     and a lit screen, not a dot. Everyone films. That is the documented
 *     mechanism by which the street feeds the networks and the networks fill
 *     the street, so it is the mechanism by which this crowd grows.
 *   - they REACT, and to different things differently. A big turn bounces a
 *     share of them and flashes a handful in the colour of whoever did it. A
 *     roar puts every phone up. A whiff makes the whole ring sink an inch and
 *     go quiet. A repeat gets almost nothing — a shuffle, a look away — which
 *     is the game teaching freshness without a tutorial.
 *
 * The near side of the same ring is `#arena::after` in the stylesheet, built
 * from the same glyph at the same proportions, near-black because it is two
 * metres away. Far side and near side are one crowd seen from inside it.
 *
 * Every reaction is a `transform`/`opacity` Web Animation with a stagger, so
 * fifty people cost one compositor pass and never touch layout. Under
 * `prefers-reduced-motion` the reactions simply do not run — the crowd is
 * still there, still the right size, still filming.
 */

import { mcLine, roundLine, SPECIAL_LINES } from '../data/mc.js';
/* The clip loop needs the TRUE reputation step the last battle caused, and
   `src/ui/save.js` is the only file allowed to know it (CONTRACT §1). This is
   a read of a number, not a second store. */
import { takeReach } from './save.js';

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

/* -------------------------------------------------------------------------- */
/* ONE PERSON                                                                 */
/* -------------------------------------------------------------------------- */

/** mulberry32, seeded off the index. Person 7 is person 7 forever. */
function personRng(i) {
  let a = (Math.imul(i + 1, 2654435761) ^ 0x5F3A7B21) >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const _profiles = [];

/**
 * The person standing in slot `i`: how big they are, how far back, which way
 * they are facing, whether they are filming, and where the clump they came
 * with breaks.
 *
 * Deterministic, cached, and computed once — `setCrowd` only ever appends, so
 * growing the crowd never re-rolls anybody who is already standing there.
 *
 * @param {number} i
 * @returns {{css: string, film: boolean, warm: boolean}}
 */
function personProfile(i) {
  if (_profiles[i]) return _profiles[i];
  const r = personRng(i);

  /* DEPTH IS CONTINUOUS, not two ranks. `far` is how deep into the crowd this
     person is standing, and it drives size, brightness and how far up the kerb
     they are all at once — which is the whole of what "further away" means on
     a flat screen. Two discrete ranks gave a comb of two heights; a field
     gives a crowd. On top of that, people are just different sizes: a plaza on
     a Tuesday has nine-year-olds and grandmothers in it. */
  /* Depth RAMPS WITH INDEX, and that is load-bearing. `#crowd` wraps backwards
     (`flex-wrap:wrap-reverse`), so once the bottom line is full the next people
     start a rank BEHIND it — and a person at the back who is bigger and
     brighter than the front row is not a person at the back, it is a bug you
     can see from across the room. Tying depth to arrival order fixes the
     perspective and tells the truth at the same time: whoever turns up later
     stands further back. */
  const far = clamp(i / 21 * 0.55 + r() * 0.45, 0, 1);
  const size = (1.14 - far * 0.44) * (0.72 + r() * 0.54);
  const h = Math.round(37 * size);
  const w = Math.round(20 * size);
  const hr = Math.round(5.9 * size * 10) / 10;
  /* shoulders wider than the head by a lot — that ratio is what reads as a
     person rather than a pawn, and it is the ratio the near crowd uses too */
  const sw = Math.round((w * 0.5 - 0.3) * 10) / 10;
  const sh = Math.max(8, Math.round(h - hr * 2 - 2));
  const o = Math.round(Math.max(0.09, 0.50 - far * 0.36 + (r() - 0.5) * 0.09) * 100) / 100;
  const up = Math.round(far * 24 + r() * 4);

  /* Clumps. Most people are shoulder to shoulder with whoever they came with —
     overlapping, because a crowd is not a row of bottles — and every fourth-ish
     person starts a new group. The gap in front of them is the only thing
     separating one group of friends from the next, and it is the single cue
     that stops this reading as an even comb. */
  const opens = r() < 0.26;
  const pre = opens ? 7 + Math.round(r() * 13) : Math.round(-5 + r() * 4);

  /* Which way they are facing. Most watch the fight; a fifth are mid-
     conversation with the person they came with. The head can only move as far
     as its own radius or the background clips it against the box edge. */
  const t = r();
  const turn = t < 0.62 ? 0 : t < 0.81 ? -1 : 1;
  const hx = Math.round(clamp(w / 2 + turn * (w / 2 - hr - 0.4), hr, w - hr) * 10) / 10;

  const film = r() < 0.21;
  const warm = r() < 0.13;
  const parm = Math.round((-16 + r() * 14) * 10) / 10;

  const p = {
    film: film,
    warm: warm,
    css: '--w:' + w + 'px;--h:' + h + 'px;--hr:' + hr + 'px;--hy:' + (hr + 1.2).toFixed(1) +
      'px;--sw:' + sw + 'px;--sh:' + sh + 'px;--hx:' + hx + 'px;--o:' + o +
      ';--up:' + up + 'px;--pre:' + pre + 'px;--px:' + Math.round(w * 0.74) +
      'px;--parm:' + parm + 'deg'
  };
  _profiles[i] = p;
  return p;
}

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
  /** The people currently wearing somebody else's colour. */
  const lit = [];
  /** The roar class waiting to come off `#crowd`. */
  let roarTimer = 0;

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
   * Put `n` people in the ring, adding or removing only the difference. Person
   * `i` always gets `personProfile(i)`, so growing the crowd never reshuffles
   * anybody who was already standing there — new people simply arrive at the
   * back and everyone else stays exactly where they were.
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
        const i = people.length;
        const prof = personProfile(i);
        const p = doc.createElement('i');
        p.style.cssText = prof.css;
        if (prof.film) p.className = prof.warm ? 'film warm' : 'film';
        else if (prof.warm) p.className = 'warm';
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
      anim(people[i],
        [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'none' });
    }
  }

  /**
   * Take the borrowed colour back off everyone. Flashes are CLASSES, never an
   * inline `color`: every person already carries their own tone inline, and an
   * inline flash would overwrite it and never come back.
   */
  function clearFlashes() {
    if (flashTimer) { clearTimeout(flashTimer); flashTimer = 0; }
    for (let i = 0; i < lit.length; i++) {
      lit[i].classList.remove('lit-you');
      lit[i].classList.remove('lit-them');
    }
    lit.length = 0;
  }

  /**
   * The square responds. Five different things it can do, because a crowd that
   * does the same bounce at everything is a light, not a gathering.
   *
   *   cheer  somebody did something good — a share of them react
   *   roar   the whole square, and every phone goes up
   *   laugh  self-directed clowning landed — they fold, they do not jump
   *   gasp   a whiff. Everybody sinks an inch and nobody laughs
   *   flat   a repeat. A shuffle, a look away, and that is all you get
   *
   * @param {Object}  r
   * @param {'cheer'|'roar'|'laugh'|'gasp'|'flat'|'quiet'} r.kind
   * @param {number}  [r.strength=0.5]   0…1
   * @param {'you'|'them'|null} [r.side] whose colour a few of them flash
   */
  function react(r) {
    const c = r || {};
    const kind = c.kind || 'cheer';
    const strength = clamp(typeof c.strength === 'number' ? c.strength : 0.5, 0, 1);

    /* The colour flash is not an animation, so it still happens for a player
       who asked for reduced motion — they should still be able to see who the
       square is looking at. */
    if (c.side === 'you' || c.side === 'them') {
      clearFlashes();
      const cls = c.side === 'you' ? 'lit-you' : 'lit-them';
      const want = Math.min(people.length, 2 + Math.round(strength * 5));
      for (let i = 0; i < want; i++) {
        const p = people[(Math.random() * people.length) | 0];
        if (p && lit.indexOf(p) < 0) { p.classList.add(cls); lit.push(p); }
      }
      flashTimer = setTimeout(clearFlashes, 620);
    }

    if (!canAnimate || !people.length || kind === 'quiet') return;

    if (kind === 'gasp') {
      // Everybody sinks an inch. Nobody laughs. It is the most human thing
      // the crowd does and it costs one animation per person.
      for (let i = 0; i < people.length; i++) {
        anim(people[i],
          [{ transform: 'translateY(0)', opacity: 1 },
           { transform: 'translateY(2.5px)', opacity: 0.55, offset: 0.35 },
           { transform: 'translateY(0)', opacity: 1 }],
          { duration: 620, delay: (i % 7) * 14, easing: 'ease-out', fill: 'none' });
      }
      return;
    }

    if (kind === 'flat') {
      // A repeat. Almost nothing happens, and the almost-nothing is the point:
      // a quarter of them shift their weight, one or two turn to their friend,
      // and the square gets very slightly quieter. Freshness, taught by the
      // room rather than by a tooltip.
      for (let i = 0; i < people.length; i++) {
        if (Math.random() > 0.28) continue;
        const dx = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.6);
        anim(people[i],
          [{ transform: 'translateX(0)', opacity: 1 },
           { transform: 'translateX(' + dx.toFixed(1) + 'px)', opacity: 0.82, offset: 0.5 },
           { transform: 'translateX(0)', opacity: 1 }],
          { duration: 900 + Math.random() * 400, delay: Math.random() * 300, easing: 'ease-in-out', fill: 'none' });
      }
      return;
    }

    if (kind === 'laugh') {
      // Laughing is not jumping. They fold forward and come back up, out of
      // time with each other, which is what a laugh looks like from across a
      // square.
      for (let i = 0; i < people.length; i++) {
        if (Math.random() > 0.35 + 0.5 * strength) continue;
        const d = (2 + Math.random() * 3.5).toFixed(1);
        anim(people[i],
          [{ transform: 'translateY(0) scaleY(1)' },
           { transform: 'translateY(' + d + 'px) scaleY(.93)', offset: 0.3 },
           { transform: 'translateY(-1px) scaleY(1.02)', offset: 0.62 },
           { transform: 'translateY(0) scaleY(1)' }],
          { duration: 520 + Math.random() * 320, delay: Math.random() * 260,
            easing: 'cubic-bezier(.3,.9,.4,1)', fill: 'none' });
      }
      return;
    }

    const all = kind === 'roar';
    const share = all ? 1 : 0.22 + 0.55 * strength;
    const lift = (all ? 9 : 4) + 7 * strength;

    if (all && el.crowd) {
      // Every phone in the square goes up at once. One class, one CSS
      // animation on a pseudo-element — no per-person work at all.
      el.crowd.classList.add('roar');
      if (roarTimer) clearTimeout(roarTimer);
      roarTimer = setTimeout(function () {
        if (el.crowd) el.crowd.classList.remove('roar');
        roarTimer = 0;
      }, 900);
    }

    for (let i = 0; i < people.length; i++) {
      if (!all && Math.random() > share) continue;
      anim(people[i],
        [{ transform: 'translateY(0)' },
         { transform: 'translateY(-' + (lift * (0.6 + Math.random() * 0.6)).toFixed(1) + 'px)', offset: 0.38 },
         { transform: 'translateY(0)' }],
        {
          duration: 460 + Math.random() * 260,
          delay: Math.random() * (all ? 150 : 220),
          easing: 'cubic-bezier(.3,.9,.4,1)',
          fill: 'none'
        });
    }
  }

  /** `Element.animate` where it exists, and a shrug where it does not. */
  function anim(node, frames, opts) {
    try { node.animate(frames, opts); }
    catch (e) { /* an unanimatable node is still a person */ }
  }


  /* ---------------------------------------------------------------------- */
  /* THE CLIP LOOP                                                          */
  /* ---------------------------------------------------------------------- */
  /*
   * Yahoo's account of this phenomenon is the sharpest structural thing in the
   * whole research corpus, and AURA-CULTURE §4 records it: THE STREET FEEDS
   * THE NETWORKS AND THE NETWORKS FILL THE STREET. Every battle makes fresh
   * video, and that video recruits the crowd for the next one.
   *
   * The mechanism was already wired — `save.reputation()` → `turnoutFor()` →
   * `setCrowd()` — and completely invisible. The square was simply bigger next
   * time and nobody noticed it happen. This is the beat where the player
   * WATCHES it: a phone in the front row flares, the clip lifts off it, the
   * clip breaks apart into people, and those people walk into the ring while
   * the head count goes up.
   *
   * THREE RULES IT IS BUILT UNDER.
   *
   * 1. IT IS THE SAME CROWD, NOT A CUTSCENE. The figures that arrive are
   *    `personProfile(i)` for the exact indices that will be standing in
   *    `#crowd` next fight, drawn by the same stylesheet rules off the same
   *    custom properties. And `setCrowd(after)` is applied to the real ring
   *    SYNCHRONOUSLY, before a single frame plays — so the beat is a report of
   *    something that already happened, and no timer of ours can ever land on
   *    the next battle's crowd and stamp on it.
   *
   * 2. IF REPUTATION DID NOT GROW, NOTHING PLAYS. A rematch with somebody
   *    already beaten, a loss, a second tab that recorded the win first: gain
   *    is zero and `clipOut` returns false without touching the screen. There
   *    is no consolation version of this.
   *
   * 3. SECONDS, NOT A CEREMONY. Euronews notes organisers deliberately keep
   *    these battles fast-paced to echo the short video that spreads them
   *    (AURA-CULTURE §4), and a slow victory animation is the fastest way to
   *    make a good game annoying. The whole beat is about two seconds, it
   *    scales DOWN when only one person turned up, and a tap anywhere kills it
   *    instantly.
   */

  /**
   * The line under the number. Warm, deadpan, Argentine register per
   * `src/data/mc.js` — and it never explains the mechanism, it just says what
   * happened. Lives here rather than in `mc.js` only because `mc.js` is not
   * this file's to write; moving it there is a one-line change and the right
   * end state.
   *
   * SHORT, because the window is short: the line lands about 1.2 seconds into
   * a beat that is over at about 2.4, and eight words do not get read in that
   * time. They get half-read, which is worse than four.
   */
  const CLIP_NOTES = [
    'Somebody’s cousin saw it.',
    'The phone went to the street.',
    'Nobody organised that.',
    'That is how a square fills.'
  ];

  const CLIP = {
    root: null, ring: null, count: null, delta: null, note: null, sr: null,
    timers: [], people: [], open: false, done: null
  };

  function clipTimer(fn, ms) {
    const id = setTimeout(function () { fn(); }, ms);
    CLIP.timers.push(id);
    return id;
  }

  function clipClearTimers() {
    for (let i = 0; i < CLIP.timers.length; i++) clearTimeout(CLIP.timers[i]);
    CLIP.timers.length = 0;
  }

  function mk(tag, cls, parent) {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  /** Build the overlay once, lazily. Classes only — no new ids (CONTRACT §11). */
  function clipBuild() {
    if (CLIP.root) return CLIP.root;
    if (!doc.body) return null;

    const root = mk('div', 'aoclip');
    const inner = mk('div', 'aoclip-in', root);
    inner.setAttribute('aria-hidden', 'true');

    const stack = mk('div', 'aoclip-stack', inner);
    mk('div', 'aoclip-kicker', stack).textContent = 'Somebody filmed it';

    /* The clip and the head count share one box. The clip breaks apart and the
       number is standing where it was, so the eye never travels to follow the
       thing turning into the other thing. */
    const slot = mk('div', 'aoclip-slot', stack);
    const card = mk('div', 'aoclip-card', slot);
    mk('i', 'aoclip-fig you', card);
    mk('i', 'aoclip-fig them', card);

    const num = mk('div', 'aoclip-num', slot);
    CLIP.count = mk('div', 'aoclip-count', num);
    CLIP.delta = mk('div', 'aoclip-delta', num);
    CLIP.note = mk('div', 'aoclip-note', stack);

    /* The ring the new people walk into. Same flex box, same glyph rules, same
       per-person custom properties as `#crowd` — see the grouped selectors in
       the stylesheet. */
    CLIP.ring = mk('div', 'aoclip-ring', inner);

    /* The person who shot it, standing in the front row of THIS crowd. Their
       screen is what flares, and the clip lifts off it. No caption explains
       that, and none should. */
    mk('i', 'aoclip-filmer', inner);
    mk('div', 'aoclip-near', inner);

    /* One sentence, once, for a screen reader. The visuals above are hidden
       from the tree; this is the only thing that speaks. */
    CLIP.sr = mk('p', 'aoclip-sr', root);
    CLIP.sr.setAttribute('role', 'status');

    root.addEventListener('click', function () { clipEnd(); });
    doc.body.appendChild(root);
    CLIP.root = root;
    return root;
  }

  /** Empty the clip's own ring. Never touches `#crowd`. */
  function clipRingClear() {
    if (CLIP.ring) CLIP.ring.textContent = '';
    CLIP.people.length = 0;
  }

  /** Put person `i` in the clip's ring, using the one shared profile. */
  function clipPerson(i) {
    const prof = personProfile(i);
    const p = doc.createElement('i');
    p.style.cssText = prof.css;
    if (prof.film) p.className = prof.warm ? 'film warm' : 'film';
    else if (prof.warm) p.className = 'warm';
    CLIP.people.push(p);
    return p;
  }

  /**
   * Close the beat. Idempotent, and safe to call from a tap, from a timer,
   * from `reset()` or from the watchdog.
   * @param {boolean} [immediate] skip the fade
   */
  function clipEnd(immediate) {
    clipClearTimers();
    if (!CLIP.open) return;
    CLIP.open = false;
    const root = CLIP.root;
    const done = CLIP.done;
    CLIP.done = null;
    const shut = function () {
      if (!root) return;
      root.classList.remove('on');
      root.classList.remove('flare');
      root.classList.remove('out');
      root.classList.remove('static');
      root.classList.remove('breaking');
      clipRingClear();
    };
    if (immediate || !canAnimate) shut();
    else {
      if (root) root.classList.add('out');
      setTimeout(shut, 240);      // deliberately NOT on CLIP.timers: this one
                                  // must survive a second clipEnd() call
    }
    if (typeof done === 'function') { try { done(); } catch (e) { /* the beat is over either way */ } }
  }

  /**
   * THE BEAT. Call it after a win, before the next fight.
   *
   * @param {Object} o
   * @param {string} [o.actId]      which square, for `turnoutFor`
   * @param {number} [o.repBefore]  reputation before the win
   * @param {number} [o.repAfter]   reputation after it
   * @param {string} [o.note]       override the line under the number
   * @param {Function} [o.onDone]   called when the beat is finished or skipped
   * @returns {boolean} true if a beat actually played
   */
  function clipOut(o) {
    const opts = o || {};
    const actId = opts.actId || 'plaza';

    /* Spend the reputation step whether or not it is used, so a second call
       for the same fight can never replay the arrival. */
    const step = takeReach();

    let repBefore = opts.repBefore;
    let repAfter = opts.repAfter;
    if (typeof repBefore !== 'number' || typeof repAfter !== 'number') {
      if (!step || !step.won || step.gain <= 0) return false;
      repBefore = step.from;
      repAfter = step.to;
    }

    const before = turnoutFor(repBefore, actId);
    const after = turnoutFor(repAfter, actId);
    const gain = after - before;

    /* Rule 2. Nothing grew, so nothing is shown.
       This is ALSO the ceiling. `turnoutFor` clamps at `CROWD_MAX`, because
       past 54 the stylesheet starts a third rank it cannot hold — so once a
       square is full, another name on the sheet stops adding a body and this
       beat correctly stops firing. On the current numbers that is roughly
       reputation 9 in the capital, 17 upriver and 18 in the bracket: the back
       half of the campaign has no clip loop left to show. Whether that reads
       as "the square is full" or as the feature quietly dying is a Director
       call about `turnoutFor` and `CROWD_MAX`, not something to paper over
       here with a number nobody can see on screen. */
    if (gain <= 0) return false;

    /* Rule 1. The real ring is grown NOW, synchronously, before any frame of
       this plays. Everything below is a report. */
    setCrowd(after);

    const root = clipBuild();
    if (!root) return false;
    if (CLIP.open) clipEnd(true);

    CLIP.open = true;
    CLIP.done = typeof opts.onDone === 'function' ? opts.onDone : null;

    /* The people who were already here. */
    clipRingClear();
    const seated = doc.createDocumentFragment();
    for (let i = 0; i < before; i++) seated.appendChild(clipPerson(i));
    CLIP.ring.appendChild(seated);

    const note = opts.note || CLIP_NOTES[after % CLIP_NOTES.length];
    CLIP.count.textContent = String(before);
    CLIP.delta.textContent = '+' + gain;
    CLIP.note.textContent = note;
    if (CLIP.sr) {
      CLIP.sr.textContent = 'Somebody filmed it. ' +
        (gain === 1 ? 'One more person' : gain + ' more people') +
        ' will be in the square next time. ' + after + ' in all.';
    }

    root.classList.remove('out');
    root.classList.add('on');

    /* ---- the static version ------------------------------------------- */
    /* No Web Animations, or the player asked for reduced motion. Everyone is
       already standing there, the number is already the new number, and the
       beat is a held frame rather than a sequence. Nothing is lost except the
       motion. */
    if (!canAnimate) {
      root.classList.add('static');
      const rest = doc.createDocumentFragment();
      for (let i = before; i < after; i++) {
        const q = clipPerson(i);
        // Still lit. The newcomer is the entire point of the frame, and an
        // unlit one in a crowd of twenty cannot be found without the motion.
        q.className = (q.className ? q.className + ' ' : '') + 'arriving';
        rest.appendChild(q);
      }
      CLIP.ring.appendChild(rest);
      CLIP.count.textContent = String(after);
      /* Longer than the animated version, not shorter: there is no sequence
         to watch, so the whole of it has to be READ, and the reduced-motion
         rule strips the durations but leaves every animation-DELAY in place —
         which is how the first cut of this shipped a note that appeared with
         three hundred milliseconds left to live. `.static` zeroes them. */
      clipTimer(function () { clipEnd(true); }, 2200);
      return true;
    }

    /* ---- the sequence ------------------------------------------------- */
    /* Budget, in ms from the tap that ended the battle:
         0    CUT to the square, over the result screen
         90   the phone in the front row flares
         300  the clip lifts off that phone and opens
         880  the clip breaks apart
         880+ the people it brought walk in, and the count follows them
       A single arrival is the common case (a win is worth one name, and one
       name is worth about one person), so the stagger is CLAMPED WIDE at the
       bottom: one person arriving still gets a beat of their own rather than
       a flicker. */
    const stagger = clamp(560 / gain, 55, 150);
    const T_FLARE = 90;
    const T_BREAK = 880;
    const land = T_BREAK + 140 + gain * stagger;

    clipTimer(function () { root.classList.add('flare'); }, T_FLARE);

    clipTimer(function () {
      if (!CLIP.open) return;
      root.classList.add('breaking');
      for (let k = 0; k < gain; k++) {
        (function (k) {
          clipTimer(function () {
            if (!CLIP.open) return;
            const p = clipPerson(before + k);
            p.className = (p.className ? p.className + ' ' : '') + 'arriving';
            CLIP.ring.appendChild(p);
            /* They come TOWARDS the square, not straight up out of the
               ground: a short walk-in from slightly near and slightly low,
               settling at the exact size their profile says they are. */
            anim(p,
              [{ opacity: 0, transform: 'translateY(11px) scale(1.45)' },
               { opacity: 1, transform: 'none' }],
              { duration: 520, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'none' });
            CLIP.count.textContent = String(before + k + 1);
            anim(CLIP.count,
              [{ transform: 'scale(1)' }, { transform: 'scale(1.13)', offset: 0.3 }, { transform: 'scale(1)' }],
              { duration: 320, easing: 'ease-out', fill: 'none' });
            /* The lamp stays on them for the rest of the beat. Taking it off
               early hides the one thing the beat is about, and the ring is
               emptied on close anyway. */
          }, 140 + k * stagger);
        }(k));
      }
    }, T_BREAK);

    /* Hold on the finished square. Long enough to find one new person in a
       crowd of twenty, short enough that nobody taps through it. */
    clipTimer(function () { clipEnd(); }, land + 1200);
    /* Watchdog. If any of the above throws, the player must not be sealed out
       of the result screen behind an overlay that never closes. */
    clipTimer(function () { clipEnd(true); }, land + 2600);
    return true;
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
    /* THE ONE HOOK THAT ALREADY EXISTED AFTER A WIN.
       `game.js` closes a battle with `sayCue(won ? 'win' : 'loss', ctx)`, and
       `mcCue()` in `engine/battle.js` never returns 'win' — the cue reaches
       this function from exactly one place in the codebase, `finishBattle()`,
       and only when the player took the fight. So the clip loop rides it
       rather than waiting on a wire that has not been run yet.
       `clipOut()` is a no-op unless the win actually added a name, so a
       rematch, a loss or a double call shows nothing.
       When `game.js` calls `clipOut()` explicitly, this fires first, spends
       the step, and the explicit call quietly returns false. Either way the
       square fills up exactly once. */
    if (cue === 'win') clipOut({ actId: ctx && ctx.act });
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

    // Who the square is reacting to, and how. The order below is the order of
    // what a crowd actually notices: a whiff, then a chain, then a joke that
    // landed, then a repeat, then everything else.
    const lead = you.score - them.score;
    const strength = clamp(Math.max(you.score, them.score) / 2600, 0.15, 1);
    const loud = lead >= 0 ? you : them;
    const side = lead > 0 ? 'you' : lead < 0 ? 'them' : null;
    const landed = loud.band === 'perfect' || loud.band === 'clean';
    const fresh = loud.factors ? loud.factors.freshness : 1;

    if (you.band === 'whiff' && them.band !== 'whiff') {
      react({ kind: 'gasp' });
    } else if (result.mcCue === 'pattern' || result.mcCue === 'finisher' || result.mcCue === 'flawless') {
      react({ kind: 'roar', strength: 1, side: lead >= 0 ? 'you' : 'them' });
    } else if (loud.cat === 'BAIT' && landed) {
      // BAIT is self-directed clowning (CONTRACT §7). The square does not
      // cheer that, it laughs at it, and those are different bodies.
      react({ kind: 'laugh', strength: strength, side: side });
    } else if (fresh < 0.9 && strength < 0.75) {
      // Somebody is repeating themselves. Nobody claps for that.
      react({ kind: 'flat' });
    } else if (Math.abs(lead) < 120) {
      react({ kind: 'cheer', strength: strength * 0.7, side: null });
    } else {
      react({ kind: 'cheer', strength: strength, side: side });
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
    /* A new fight is starting. Whatever the last one earned has been shown,
       skipped, or is no longer wanted — and a clip beat still holding the
       screen while round one opens behind it is a bug, not a flourish. */
    clipEnd(true);
    clearArena();
    clearFlashes();
    setMeter(50);
    say('');
    setPrompt('');
  }

  function destroy() {
    clearFlashes();
    clipEnd(true);
    if (CLIP.root && CLIP.root.parentNode) CLIP.root.parentNode.removeChild(CLIP.root);
    CLIP.root = null;
    CLIP.ring = null;
    CLIP.count = null;
    CLIP.delta = null;
    CLIP.note = null;
    CLIP.sr = null;
    if (roarTimer) { clearTimeout(roarTimer); roarTimer = 0; }
    if (el.crowd) el.crowd.classList.remove('roar');
  }

  return {
    // crowd
    setCrowd: setCrowd,
    crowdSize: crowdSize,
    turnoutFor: turnoutFor,
    drawIn: drawIn,
    react: react,
    clipOut: clipOut,
    clipEnd: clipEnd,
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
