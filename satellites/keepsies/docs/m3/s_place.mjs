// SCENARIO A: the start of every turn is the PLACE phase. One thumb drags sideways, off the shooter, to turn the aim.
import { makeGame, playTouch } from './harness.mjs';
const D = 180 / Math.PI;
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
function run(label, phase, path, dur, opt) {
  const g = makeGame({ w: 412, h: 839, phase });
  const rows = [];
  let prevAim = null, maxJump = 0, jumps = 0, offscreen = 0;
  playTouch(g, path, dur, Object.assign({ touchHz: 120, fps: 60, postFrames: 60, each: ({ t, game, post }) => {
    const st = game.rig.state;
    const aim = wrap(st.azimuth + Math.PI);
    const tawAng = Math.atan2(game.world.taw.x, game.world.taw.z);
    const ts = game.tawOnScreen();
    if (!ts) offscreen++;
    if (prevAim !== null) { const j = Math.abs(wrap(aim - prevAim)) * D; if (j > 10) jumps++; if (j > maxJump) maxJump = j; }
    prevAim = aim;
    rows.push({ t: +t.toFixed(1), post: !!post, aimDeg: +(aim * D).toFixed(1), camAz: +(st.azimuth * D).toFixed(1), wantAz: +(st.wantAzimuth * D).toFixed(1),
      userAz: +((st.userAz || 0) * D).toFixed(1), tawRingDeg: +(tawAng * D).toFixed(1), tawScreen: ts ? [Math.round(ts.x), Math.round(ts.y)] : null, phase: game.world.phase });
  } }, opt || {}));
  console.log('\n=== ' + label + ' ===');
  for (let i = 0; i < rows.length; i += (rows.length > 40 ? 3 : 1)) console.log(JSON.stringify(rows[i]));
  console.log('frames', rows.length, 'aim jumps >10deg in one frame:', jumps, 'largest', maxJump.toFixed(1), 'deg; frames with the shooter OFF screen:', offscreen,
    '; final aim', rows[rows.length - 1].aimDeg, 'final taw ring angle', rows[rows.length - 1].tawRingDeg);
  return rows;
}
// a slow drag 60 px to the left over 500 ms, starting right of centre, mid screen (off the shooter)
run('PLACE phase: slow one-thumb drag 60 px left, from (300,500)', 'place', (t) => ({ x: 300 - 60 * Math.min(1, t / 500), y: 500 }), 500);
run('AIM phase: the SAME drag', 'aim', (t) => ({ x: 300 - 60 * Math.min(1, t / 500), y: 500 }), 500);
