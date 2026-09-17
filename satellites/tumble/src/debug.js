// ?debug=1 overlay: FPS, frame time, physics step time, bodies, draw calls (OPUS_PROMPT step 1).

export class Debug {
  constructor(root) {
    const el = document.createElement('pre');
    el.id = 'debug';
    el.setAttribute('aria-hidden', 'true');
    root.appendChild(el);
    this.el = el;
    this.frames = [];
    this.acc = 0;
    this.worst = 0;
  }

  update(dt, g) {
    const now = performance.now();
    this.frames.push(now);
    while (this.frames.length && now - this.frames[0] > 1000) this.frames.shift();
    if (this.lastNow) this.worst = Math.max(this.worst * 0.98, now - this.lastNow);
    this.lastNow = now;
    this.acc += dt;
    if (this.acc < 0.25) return;
    this.acc = 0;
    const c = g.physics.counts();
    const info = g.render.info();
    const fps = this.frames.length;
    const ld = g.lastDump;
    this.stats = { fps, frameMs: 1000 / Math.max(1, fps), worstMs: this.worst, stepMs: g.stepMs, bodies: c.total, awake: c.awake, calls: info.calls, tris: info.tris };
    this.el.textContent =
      `fps ${fps}  frame ${(1000 / Math.max(1, fps)).toFixed(1)} ms  worst ${this.worst.toFixed(0)} ms\n` +
      `physics ${g.stepMs.toFixed(2)} ms/step  bodies ${c.total}  awake ${c.awake}\n` +
      `draw calls ${info.calls}  tris ${(info.tris / 1000).toFixed(0)}k  state ${g.state}\n` +
      (ld ? `dump ${ld.n} socks  presim ${ld.simMs.toFixed(0)} ms  settled ${ld.settledAt > 0 ? ld.settledAt.toFixed(2) + ' s' : 'no'}\n` : '') +
      // flick tuning on a real phone (HANDOFF next task 1): try ?shotgain=1.3&rangeassist=0.8
      (g.play && g.play.lastFlick ? flickLine(g.play.lastFlick) : '');
  }
}

function flickLine(f) {
  const ratio = f.ideal ? (f.raw / f.ideal).toFixed(2) : 'off aim';
  return `last flick ${Math.round(f.px)} px/s  raw ${f.raw.toFixed(2)} m/s  ideal ${f.ideal ? f.ideal.toFixed(2) : '-'}  x${ratio}  launch ${f.launch.toFixed(2)}`;
}
