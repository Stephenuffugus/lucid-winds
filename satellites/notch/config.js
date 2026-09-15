/* NOTCH's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder (test/config.mjs holds the two equal). `mode` is
   the door a link opens (TURN or FIND); `stage` starts TURN at the device's own stage, or at stage 1 (in plane) or stage 2 (with
   mirror foils). The values are for the teacher's page; nothing here is shown to a child (N7). */
export const NOTCH_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260916 }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['turn', 'find']), default: 'turn' }),
  stage: Object.freeze({ type: 'enum', values: Object.freeze(['auto', 'one', 'two']), default: 'auto' })
});
