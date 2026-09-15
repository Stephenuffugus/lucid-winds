/* GLIMPSE's link schema: what a teacher's link may ask of the game. The page hands it to CORE's parseConfig, and
   satellites/math/config/schemas.js registers the same keys for the link builder once the modes are built (P3;
   test/config.mjs will hold the two equal). A run is `count` rounds in sessions of twelve; `flash` is the flash length the
   settings offer (the handoff's section 2), `long` being Long Look, a counting game; `mode` is the door a link opens. Mode 4
   MORE is parked and not offered (plans/glimpse/HANDOFF-GLIMPSE.md 3.3, 3.14). */
export const GLIMPSE_SCHEMA = Object.freeze({
  seed: Object.freeze({ type: 'int', min: 1, max: 2147483647, default: 20260915 }),
  count: Object.freeze({ type: 'enum', values: Object.freeze(['12', '24', '36']), default: '12' }),
  flash: Object.freeze({ type: 'enum', values: Object.freeze(['auto', '250', '400', '600', 'long']), default: 'auto' }),
  mode: Object.freeze({ type: 'enum', values: Object.freeze(['flash', 'groups', 'frame', 'spread']), default: 'flash' })
});
