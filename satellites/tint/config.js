/* TINT's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder (test/config.mjs holds the two equal). `mode` is
   the door a link opens; `stage` two brings factors that are not whole and discretized recipes (T3, T9). */
export const TINT_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260916 }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['compare', 'fill', 'scales']), default: 'compare' }),
  stage: Object.freeze({ type: 'enum', values: Object.freeze(['one', 'two']), default: 'one' })
});
