/* SPAN's link schemas: what a teacher's link may ask of the game and of its screener. The game's page and the
   screener hand these to CORE's parseConfig, and satellites/math/config/schemas.js registers the same keys, types,
   values or bounds and defaults for the link builder; test/config.mjs holds the two equal. A run is whole blocks of
   five (S1), so its length is a choice, never a free number the page would have to round. */
export const SPAN_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915 }),
  count: Object.freeze({ type: 'enum', values: Object.freeze(['5', '10', '15', '20', '25', '30', '35', '40']), default: '20' }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['blank', 'judge', 'relational']), default: 'blank' })
});

export const SCREEN_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915 }),
  minutes: Object.freeze({ type: 'int', min: 1, max: 10, default: 3 })
});
