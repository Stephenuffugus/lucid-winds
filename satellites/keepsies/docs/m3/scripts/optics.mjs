// Pinhole numbers for a 375 x 667 CSS portrait screen, fov 28 vertical (tuning.render.ringerCam.fov)
const H = 667, fovV = 28 * Math.PI / 180, f = (H / 2) / Math.tan(fovV / 2);
console.log('focal length', f.toFixed(0), 'CSS px');
// camera looking at ground point L at distance d, elevation e. Project a ground point at distance a ahead of L along view axis.
function proj(d, eDeg, a, lateral = 0) {
  const e = eDeg * Math.PI / 180;
  const cy = d * Math.sin(e), cz = -d * Math.cos(e);           // camera at (0, cy, cz), looking at origin
  const fwd = [0, -Math.sin(e), Math.cos(e)], up = [0, Math.cos(e), Math.sin(e)];
  const v = [lateral, -cy, a - cz];
  const zc = v[0] * fwd[0] + v[1] * fwd[1] + v[2] * fwd[2];
  const yc = v[0] * up[0] + v[1] * up[1] + v[2] * up[2];
  return { y: H / 2 - f * yc / zc, x: 187.5 + f * lateral / zc, depth: zc };
}
// 1. the shooter (22 mm) and a mib (16 mm) at the brace camera
const C = { spanAdd: 1.9, elev: 30 };
for (const d of [2.0, 2.7, 3.4, 4.5]) {
  const taw = proj(d, 30, -0.5 * 1.525);   // shooter half a span before the look point (targetBias 0.5)
  const rpx = 0.011 * f / taw.depth;
  const r = Math.max(16, rpx * 1.35), grab = 1.6 * r, ret = grab * (0.70 + 1.5 * 0.16);
  const mib = proj(d, 30, 0.5 * 1.525); const mibPx = 0.016 * f / mib.depth;
  console.log(`camera ${d} m: shooter drawn ${(2 * rpx).toFixed(1)} px wide at y ${taw.y.toFixed(0)}; grab disc ${(2 * grab).toFixed(0)} px; settled reticle ${(2 * ret).toFixed(0)} px; a mib at the cross ${mibPx.toFixed(1)} px`);
}
// 2. calibration camera 0.42 m at 17 deg: where a target lands D metres ahead of the shooter
for (const D of [0.25, 0.35, 0.5, 0.7, 1.0]) {
  const c = proj(0.42, 17, D), n = proj(0.42, 17, D - 0.12), fr = proj(0.42, 17, D + 0.12), side = proj(0.42, 17, D, 0.12);
  console.log(`calib cam 0.42 m/17 deg, target ${D} m ahead: centre y ${c.y.toFixed(0)} of 667, ellipse ${(2 * (side.x - 187.5)).toFixed(0)} x ${(n.y - fr.y).toFixed(0)} px`);
}
// 3. calibration target at a raised calib cam (illustration): 0.9 m at 35 deg
for (const D of [0.5, 0.7, 1.0]) {
  const c = proj(0.9, 35, D - 0.3), n = proj(0.9, 35, D - 0.3 - 0.12), fr = proj(0.9, 35, D - 0.3 + 0.12), side = proj(0.9, 35, D - 0.3, 0.12);
  console.log(`calib cam 0.9 m/35 deg looking 0.3 m ahead of the shooter, target ${D} m ahead: centre y ${c.y.toFixed(0)}, ellipse ${(2 * (side.x - 187.5)).toFixed(0)} x ${(n.y - fr.y).toFixed(0)} px`);
}
// 4. aim dash strip: 24 unit tile, ink 1.8 units thick
for (const h of [12, 16, 24, 32, 40]) console.log(`aim strip ${h} px tall: ink ${(1.8 * h / 24).toFixed(2)} px thick, dash ${(10 * h / 24 + 1.8 * h / 24).toFixed(1)} px long (with round caps), period ${h} px`);
// 5. chalk stroke around the rings
for (const [ft, r] of [[7, 1.0668], [10, 1.525], [13, 1.9812]]) {
  const Cm = 2 * Math.PI * r * 1000, across = 52 / 40;
  const N = Math.max(1, Math.round(Cm / (2048 * across)));
  console.log(`${ft} ft ring: circumference ${(Cm / 1000).toFixed(2)} m; N=${N} repeats -> ${(Cm / (2048 * N)).toFixed(2)} mm/texel along, ${across.toFixed(2)} across (strip 83 mm wide for the 52 mm line); breaks ${3 * N} around, ${(4 * Cm / (2048 * N)).toFixed(0)} to ${(7 * Cm / (2048 * N)).toFixed(0)} mm wide`);
}
// 6. placement view footprints (ring refit into Astra's world_viewport 375 x 421 CSS)
const s = 375 / (2 * 1.525 * 1000 + 100);
for (const [n, r] of [['column', 20], ['orb', 22], ['arch', 38], ['loaf', 52]]) console.log(`placement view ~${s.toFixed(3)} px/mm: ${n} footprint ${(2 * r * s).toFixed(1)} px across; decal stroke ${(7 / 216 * 2 * r * s).toFixed(2)} px; reach circle (609.6 mm) ${(2 * 609.6 * s).toFixed(0)} px across`);
