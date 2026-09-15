/* BRIM's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder once the modes are built (P3;
   test/config.mjs will hold the two equal). A run is `count` rounds in sessions of twelve; `grade` holds the pairs to CCSS
   grade 3, 4 or 5 (plans/brim/HANDOFF-BRIM.md 3.5); `mode` is the door a link opens. */
export const BRIM_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915 }),
  count: Object.freeze({ type: 'enum', values: Object.freeze(['12', '24', '36']), default: '12' }),
  grade: Object.freeze({ type: 'enum', values: Object.freeze(['3', '4', '5']), default: '4' }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['matching', 'half', 'brim', 'level']), default: 'matching' })
});
