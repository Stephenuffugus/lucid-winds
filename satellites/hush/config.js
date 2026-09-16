/* HUSH's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder (test/config.mjs holds the two equal). `count` is
   a run's trials; `fork` is Quick or Careful for the whole room, or the child's own choice. Nothing here is shown to a child. */
export const HUSH_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260916 }),
  count: Object.freeze({ type: 'enum', values: Object.freeze(['40', '60', '80']), default: '40' }),
  fork: Object.freeze({ type: 'enum', values: Object.freeze(['child', 'quick', 'careful']), default: 'child' })
});
