/**
 * Quality tiers. K0 ships the detection and the table; the dynamic resolution
 * loop and the per tier feature switches land with the arenas in K3.
 *
 * Never sacrificed at any tier: input latency, physics determinism, and the
 * inspect turntable's beauty (DESIGN 20). The turntable is a static scene, so it
 * runs High materials even on a Medium device.
 */

/** @typedef {{name:'low'|'medium'|'high', resolutionScale:number, shadows:string, transmission:boolean, shotCam:boolean}} Tier */

let _tier = null;
let _forced = null;

/**
 * Pick a tier from what the device says about itself. The 2 second boot micro
 * bench of DESIGN 20 lands in K3 with the `budget` gate; until then this is
 * cores and pixel ratio, which is enough to keep a Pixel 4a off the High path.
 * @param {object} tuning
 * @returns {Tier}
 */
export function detectQuality(tuning) {
  if (_forced) return tierNamed(_forced, tuning);
  if (_tier) return _tier;
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  const mem = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4;
  let name = 'medium';
  if (cores <= 4 || mem <= 3) name = 'low';
  if (cores >= 8 && dpr >= 2 && mem >= 6) name = 'high';
  _tier = tierNamed(name, tuning);
  return _tier;
}

/** A tier by name, for the settings override. */
export function tierNamed(name, tuning) {
  const row = tuning.render.quality[name] || tuning.render.quality.medium;
  return Object.assign({ name }, row);
}

/** Settings sets this; null returns to detection. */
export function forceQuality(name) { _forced = name; _tier = null; }

/** What the renderer should multiply the CSS size by. */
export function renderScale(tier) {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  return Math.min(2, dpr) * tier.resolutionScale;
}
