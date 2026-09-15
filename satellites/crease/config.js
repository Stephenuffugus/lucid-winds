/* CREASE's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder once the modes it offers are built
   (P3; test/config.mjs will hold the two equal). A run is `count` rounds; `grade` holds the denominators to CCSS grade 3
   or 4 (C7); `extended` lets in the handoff's items outside both (docs/DECISIONS.md). */
export const CREASE_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915 }),
  count: Object.freeze({ type: 'enum', values: Object.freeze(['10', '20', '30']), default: '10' }),
  grade: Object.freeze({ type: 'enum', values: Object.freeze(['3', '4']), default: '3' }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['freehand', 'crease', 'halfway']), default: 'freehand' })
});
