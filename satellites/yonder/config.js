/* YONDER's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder once the modes it offers are built
   (P3; test/config.mjs will hold the two equal). A run is `count` rounds; `road` is where a session starts, and a link
   that names it starts there on every load. */
export const YONDER_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915 }),
  count: Object.freeze({ type: 'enum', values: Object.freeze(['10', '20', '30']), default: '10' }),
  road: Object.freeze({ type: 'enum', values: Object.freeze(['10', '20', '100', '1000', '10000']), default: '10' })
});
