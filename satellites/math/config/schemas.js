/* The games a teacher can make a link for (00-CORE-handoff 2.9; plans/math/HANDOFF-CORE.md P3 step 3).
   Each game registers the SAME schema its own page hands to parseConfig, plus a label for the
   teacher, so a control here can only offer what the game will accept. A game adds itself when it
   ships. Until SPAN exists its entry is a draft (core/docs/DECISIONS.md): two keys, and no control
   that would switch off its mix of standard and nonstandard equations. */
export const GAMES = Object.freeze({
  demo: Object.freeze({
    label: 'Core demo',
    path: '../core/demo/',
    schema: Object.freeze({
      seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915, label: 'Seed' })
    })
  }),
  span: Object.freeze({
    label: 'Span',
    path: '../span/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['judge', 'blank', 'relational']), default: 'blank', label: 'Mode',
        names: Object.freeze({ judge: 'True or not', blank: 'The blank', relational: 'Relational' })
      }),
      count: Object.freeze({ type: 'int', min: 5, max: 40, default: 10, label: 'Items in a run' })
    })
  })
});
