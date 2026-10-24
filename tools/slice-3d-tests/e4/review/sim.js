// chamber review helpers: the REAL build and step (world.js on the E4 page), with popups, sounds and the boss's
// drawn side (bossDraw per step, as fight2.js does) recorded
process.env.SRCF = process.env.SRCF || '/tmp/claude-1000/ssb/e4/e4_full.html';
var W = require('./world.js');
var ctx = W.ctx;
var LOG = [];
ctx.popup = function (txt, x, y) { LOG.push({ k: 'pop', txt: txt, x: +(+x).toFixed(2), y: +(+y).toFixed(2), t: ctx.G ? +ctx.G.t.toFixed(3) : 0 }); };
var SND = {};
ctx.SFX = new Proxy({}, { get: function (t, k) { return function () { SND[k] = (SND[k] || 0) + 1; }; } });
ctx.fatalMark = function (x, y, why) { LOG.push({ k: 'fatal', why: why, x: x, y: y }); };
function reset() { LOG.length = 0; for (var k in SND) delete SND[k]; }
// run a dive from a given state; hold(n,g,b) -> -1/0/1; draw: call bossDraw each step with dt (frame rate emulation)
function run(o) {
  var g = W.dive(o.lvl || 5, o.seed == null ? 77 : o.seed), b = g.world.boss;
  reset();
  if (o.setup) o.setup(g, b);
  var maxN = o.maxN || 120 * 120, ev = [], pops = 0, maxAbsX = 0, frameEvery = o.frameEvery || 1;
  for (var n = 0; n < maxN && !g.done; n++) {
    var l0 = b ? b.lobs : 0, h0 = b ? b.hits : 0, rc0 = b ? b.ropeCut : false, net0 = b ? b.netOn : false, w0 = SND.wood || 0;
    var hd = o.hold ? o.hold(n, g, b) : 0;
    W.step(g, 1, hd);
    if (b && (n % frameEvery) === 0) ctx.bossDraw(frameEvery / 120);
    if (Math.abs(g.x) > maxAbsX) maxAbsX = Math.abs(g.x);
    if (b) {
      if (b.lobs > l0) ev.push('lob@' + g.x.toFixed(1) + '>' + b.tx);
      if (b.hits > h0) ev.push('HIT' + b.hits + '@' + g.x.toFixed(1) + ',' + (g.y - b.y).toFixed(1));
      if (b.ropeCut && !rc0) ev.push('ROPE@' + g.x.toFixed(1) + ',' + (g.y - b.y).toFixed(1));
      if (net0 && !b.netOn && !b.ropeCut && !b.cleared) ev.push('GIVEWAY');
    }
    if (o.each) o.each(n, g, b);
  }
  // finish the end wobble so finishLevel would be called (not needed: done is the end of play)
  return { g: g, b: b, ev: ev, n: n, t: +g.t.toFixed(2), done: g.done, failed: !!g.failed, mult: g.mult, maxAbsX: maxAbsX,
    hits: b ? b.hits : null, cleared: b ? b.cleared : null, skipped: b ? b.skipped : null, ropeCut: b ? b.ropeCut : null,
    pops: SND.wood || 0, log: LOG.slice(), snd: Object.assign({}, SND), forfeit: !!g.cleanForfeit, bossDown: !!g.bossDown };
}
module.exports = { W: W, ctx: ctx, run: run, LOG: LOG, SND: SND, reset: reset };
