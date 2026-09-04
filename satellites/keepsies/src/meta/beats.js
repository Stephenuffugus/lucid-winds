/**
 * The first four minutes, as a state machine.
 *
 * DESIGN 16 gives six beats and a target: four minutes to a real match. This
 * module owns WHICH beat you are on, what it says, and what it is waiting for.
 *
 * ⛔ IT IS `beats.js` AND NOT `onboarding.js` BECAUSE THAT NAME WAS TAKEN. DESIGN
 * names one file for the whole of section 16, and the calibration shipped into it
 * in K1; writing the beat machine over the top cost a boot. Two files, two jobs:
 * `onboarding.js` measures a thumb, `beats.js` runs the script.
 * It owns no DOM and no scene, the way every other `meta/` module owns none, so
 * the beats can be walked in Node and asserted without a browser.
 *
 * ⛔ A BEAT IS WAITING FOR ONE THING. Every beat names the single event that
 * finishes it, and nothing else advances it. An onboarding that can be advanced
 * two ways is an onboarding that skips a beat the first time somebody taps twice.
 *
 * ⛔ IT IS SKIPPABLE AFTER BEAT 2, NOT BEFORE. DESIGN 16 puts the "I have played
 * marbles before" link after the break, because the break is where the game
 * teaches the one control it has, and a player who skips it has no idea what a
 * snap is. Skipping jumps to the tin, which is where the marbles are: nobody
 * should lose their starters for being experienced.
 *
 * ⛔ THE STATE IS IN THE SAVE, NOT IN A VARIABLE. A player who closes the tab in
 * beat 3 comes back to beat 3, not to the title screen with half a collection.
 */
import * as SAVE from './save.js?v=20260904b';

/**
 * The beats, in order. `waitsFor` is the ONE event that finishes each one, and
 * the copy lives here so it can be read and counted without a browser.
 */
export const BEATS = [
  {
    id: 'calibrate', n: 1, waitsFor: 'calibrated', skippable: false,
    title: 'Show me your hardest snap',
    lines: ['Three of them. As hard as you can.']
  },
  {
    id: 'break', n: 2, waitsFor: 'brokeTheCross', skippable: false,
    title: 'The cross',
    lines: [
      'Thirteen mibs in a cross, and a ring around it.',
      'Hold your thumb on your shooter until it settles, then flick up through it.'
    ]
  },
  {
    id: 'sticking', n: 2.5, waitsFor: 'stuck', skippable: false,
    title: 'Stick it',
    lines: [
      'Flick from BELOW the marble and it comes back with you.',
      'That is a stick, and it is how you shoot twice from the same spot.'
    ]
  },
  {
    id: 'dusty', n: 3, waitsFor: 'playedDusty', skippable: true,
    title: 'Dusty Coyle',
    lines: ['Somebody is watching. He has a coffee tin under his arm.']
  },
  {
    id: 'tin', n: 4, waitsFor: 'tookTheTin', skippable: true,
    title: 'The tin',
    lines: [
      'Dusty rattles it. "Take some. Then play me for real ones."',
      'Ten clay, six cat\'s eyes, a bearing and a swirl. And one of these three.'
    ]
  },
  {
    id: 'firstKeepsies', n: 5, waitsFor: 'playedForKeeps', skippable: true,
    title: 'For real ones',
    lines: ['One clay each. Winner keeps both.']
  }
];

/** Dusty's chat, one line a turn, spare and funny (DESIGN 16.3). */
export const DUSTY_LINES = [
  'You go first. I like watching.',
  'Coffee tin says you miss this one.',
  'Hm.',
  'My cousin shoots like that.',
  'That one counted, I saw it.',
  'Do that again and I will start trying.',
  'Wind picked up. That was the wind.',
  'Good. Good. Fine.',
  'I have had this taw since I was seven.',
  'Nearly. Nearly is a word losers use.'
];

/** What Dusty says on the turn numbered `turn`, wrapping rather than running out. */
export function dustyLine(turn) {
  return DUSTY_LINES[Math.abs(turn | 0) % DUSTY_LINES.length];
}

/**
 * The onboarding, over the save.
 *
 * @param {object} tuning
 * @returns {object}
 */
export function createOnboarding(tuning) {
  const api = {
    /** Is the player still in the first four minutes? */
    active() {
      const s = SAVE.load();
      return !s.seen.onboarded;
    },

    /** Which beat, as its record, or null when it is over. */
    beat() {
      if (!api.active()) return null;
      const done = SAVE.load().seen.beats || [];
      for (const b of BEATS) if (done.indexOf(b.id) < 0) return b;
      return null;
    },

    /** How far along, for a progress line that says "2 of 6". */
    position() {
      const done = (SAVE.load().seen.beats || []).length;
      return { done: done, total: BEATS.length };
    },

    /**
     * Finish the current beat, but ONLY if `event` is the one it waits for.
     * @returns {{advanced:boolean, from:string|null, to:string|null}}
     */
    fire(event) {
      const b = api.beat();
      if (!b) return { advanced: false, from: null, to: null };
      if (b.waitsFor !== event) return { advanced: false, from: b.id, to: b.id };
      SAVE.update((s) => {
        s.seen.beats = (s.seen.beats || []).concat([b.id]);
      });
      const next = api.beat();
      if (!next) api.finish();
      return { advanced: true, from: b.id, to: next ? next.id : null };
    },

    /**
     * "I have played marbles before". Only after the break, and it lands on the
     * tin rather than past it, because nobody should lose their starters for
     * being experienced.
     */
    canSkip() {
      const b = api.beat();
      return !!(b && b.skippable);
    },

    skip() {
      if (!api.canSkip()) return { skipped: false, to: (api.beat() || {}).id || null };
      SAVE.update((s) => {
        const done = (s.seen.beats || []).slice();
        for (const b of BEATS) {
          if (b.id === 'tin') break;
          if (done.indexOf(b.id) < 0) done.push(b.id);
        }
        s.seen.beats = done;
      });
      return { skipped: true, to: (api.beat() || {}).id || null };
    },

    /** Beat 4's heirloom: one of three rares, and the other two are not lost. */
    heirlooms(catalog) {
      const ids = ['bloodstone_aggie', 'lutz', 'mercury'];
      return ids
        .map(id => catalog.marbles.find(m => m.id === id))
        .filter(Boolean);
    },

    finish() {
      SAVE.update((s) => { s.seen.onboarded = true; });
      return true;
    },

    /** For a fresh start in dev, and for the gate. */
    reset() {
      SAVE.update((s) => { s.seen.onboarded = false; s.seen.beats = []; });
    }
  };
  return api;
}
