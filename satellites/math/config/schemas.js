/* The games a teacher can make a link for (00-CORE-handoff 2.9; plans/math/HANDOFF-CORE.md P3 step 3).
   Each game registers the SAME schema its own page hands to parseConfig, plus a label for the
   teacher, so a control here can only offer what the game will accept. A game adds itself when it
   ships. SPAN's two entries mirror satellites/span/config.js, and SPAN's test/config.mjs holds them
   equal: no control switches off its mix of standard and nonstandard equations, and a run's length
   is whole blocks of five. */
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
        type: 'enum', values: Object.freeze(['blank', 'judge', 'relational']), default: 'blank', label: 'Mode',
        names: Object.freeze({ blank: 'The blank', judge: 'True or not', relational: 'Relational' })
      }),
      count: Object.freeze({
        type: 'enum', values: Object.freeze(['5', '10', '15', '20', '25', '30', '35', '40']), default: '20', label: 'Items in a run'
      })
    })
  }),
  spanScreen: Object.freeze({
    label: 'Span screener',
    path: '../span/screen/',
    schema: Object.freeze({
      minutes: Object.freeze({ type: 'int', min: 1, max: 10, default: 3, label: 'Minutes' })
    })
  })
});
