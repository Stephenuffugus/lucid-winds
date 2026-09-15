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
  }),
  /* YONDER mirrors satellites/yonder/config.js, and YONDER's test/config.mjs holds them equal; MILEPOSTS is the routing's
     to serve, never a link's, so the modes are the road and the squares */
  yonder: Object.freeze({
    label: 'Yonder',
    path: '../yonder/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['flag', 'race']), default: 'flag', label: 'Mode',
        names: Object.freeze({ flag: 'The road', race: 'The squares' })
      }),
      road: Object.freeze({
        type: 'enum', values: Object.freeze(['10', '20', '100', '1000', '10000']), default: '10', label: 'Road to start on',
        names: Object.freeze({ '10': '0 to 10', '20': '0 to 20', '100': '0 to 100', '1000': '0 to 1000', '10000': '0 to 10000' })
      }),
      count: Object.freeze({
        type: 'enum', values: Object.freeze(['10', '20', '30']), default: '10', label: 'Rounds in a run'
      })
    })
  }),
  /* CREASE mirrors satellites/crease/config.js, and CREASE's test/config.mjs holds them equal */
  crease: Object.freeze({
    label: 'Crease',
    path: '../crease/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['freehand', 'crease', 'halfway']), default: 'freehand', label: 'Mode',
        names: Object.freeze({ freehand: 'Place the clip', crease: 'Fold the strip', halfway: 'Less or more than half' })
      }),
      grade: Object.freeze({
        type: 'enum', values: Object.freeze(['3', '4']), default: '3', label: 'Fractions for grade',
        names: Object.freeze({ '3': 'Grade 3: halves, thirds, fourths, sixths, eighths', '4': 'Grade 4: fifths, tenths, twelfths too' })
      }),
      count: Object.freeze({
        type: 'enum', values: Object.freeze(['10', '20', '30']), default: '10', label: 'Rounds in a run'
      })
    })
  }),
  /* BRIM mirrors satellites/brim/config.js, and BRIM's test/config.mjs holds them equal */
  brim: Object.freeze({
    label: 'Brim',
    path: '../brim/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['matching', 'half', 'brim', 'level']), default: 'matching', label: 'Mode',
        names: Object.freeze({ matching: 'Which glass is fuller', half: 'More or less than half', brim: 'Nearer the brim', level: 'The same level' })
      }),
      grade: Object.freeze({
        type: 'enum', values: Object.freeze(['3', '4', '5']), default: '4', label: 'Fractions for grade',
        names: Object.freeze({ '3': 'Grade 3: the same numerator or the same denominator', '4': 'Grade 4: any two, up to twelfths', '5': 'Grade 5: sevenths, ninths and elevenths too' })
      }),
      count: Object.freeze({
        type: 'enum', values: Object.freeze(['12', '24', '36']), default: '12', label: 'Rounds in a run'
      })
    })
  }),
  /* GLIMPSE mirrors satellites/glimpse/config.js, and GLIMPSE's test/config.mjs holds them equal; Mode 4 is parked and not
     offered */
  glimpse: Object.freeze({
    label: 'Glimpse',
    path: '../glimpse/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['flash', 'groups', 'frame', 'spread']), default: 'flash', label: 'Mode',
        names: Object.freeze({ flash: 'How many fireflies', groups: 'Two groups', frame: 'Fill the ten frame', spread: 'The same or more' })
      }),
      flash: Object.freeze({
        type: 'enum', values: Object.freeze(['auto', '250', '400', '600', 'long']), default: 'auto', label: 'How long the fireflies show',
        names: Object.freeze({ auto: 'By the count', '250': 'Quarter of a second', '400': 'Under half a second', '600': 'Over half a second', long: 'Long Look, a counting game' })
      }),
      count: Object.freeze({
        type: 'enum', values: Object.freeze(['12', '24', '36']), default: '12', label: 'Rounds in a run'
      })
    })
  }),
  /* NOTCH mirrors satellites/notch/config.js, and NOTCH's test/config.mjs holds them equal; the names are for the teacher, the
     child's page shows no numerals (N7) */
  notch: Object.freeze({
    label: 'Notch',
    path: '../notch/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['turn', 'find']), default: 'turn', label: 'Mode',
        names: Object.freeze({ turn: 'Turn a piece into its notch', find: 'Find the piece in the carving' })
      }),
      stage: Object.freeze({
        type: 'enum', values: Object.freeze(['auto', 'one', 'two']), default: 'auto', label: 'Where TURN starts',
        names: Object.freeze({ auto: 'Where this device left off', one: 'Turning in place', two: 'With mirror pieces that never fit' })
      })
    })
  }),
  /* TINT mirrors satellites/tint/config.js, and TINT's test/config.mjs holds them equal */
  tint: Object.freeze({
    label: 'Tint',
    path: '../tint/',
    schema: Object.freeze({
      mode: Object.freeze({
        type: 'enum', values: Object.freeze(['compare', 'fill', 'scales']), default: 'compare', label: 'Mode',
        names: Object.freeze({ compare: 'Same colour', fill: 'Fill the vat', scales: 'Does it scale' })
      }),
      stage: Object.freeze({
        type: 'enum', values: Object.freeze(['one', 'two']), default: 'one', label: 'Stage',
        names: Object.freeze({ one: 'Whole number factors, continuous', two: 'Factors that are not whole, and jugs to count' })
      })
    })
  })
});
