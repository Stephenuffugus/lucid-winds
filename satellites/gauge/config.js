/* GAUGE's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder (test/config.mjs holds the two equal). `mode` is
   the door a link opens: WHICH IS MORE, ZOOM or SAME VALUE. The values are for the teacher's page; nothing here is shown to a
   child, and no rule's code is ever a value (GA7). */
export const GAUGE_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260916 }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['compare', 'zoom', 'same']), default: 'compare' })
});
