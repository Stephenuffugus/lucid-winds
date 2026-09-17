// The per-Load texture atlas (DESIGN 13.3): 8 x 8 tiles of 256 px in one 2048 texture.
// Tiles are painted by engine/sockgen.js in a worker when one is available, cached by
// seed and colour mode, and written into the GPU texture one tile at a time.

import * as THREE from 'three';
import { decode, paint, TILE } from '../engine/sockgen.js';

export const N = 8;

export class Atlas {
  constructor(renderer, masks) {
    this.R = renderer;
    this.masks = masks;          // RGBA bytes per silhouette id
    this.size = TILE;
    this.W = N * TILE;
    this.data = new Uint8Array(this.W * this.W * 4);
    this.tex = new THREE.DataTexture(this.data, this.W, this.W, THREE.RGBAFormat);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.flipY = false;
    this.tex.generateMipmaps = true;
    this.tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.tex.magFilter = THREE.LinearFilter;
    this.tex.needsUpdate = true;
    this.slots = new Array(N * N).fill(null); // seed per slot
    this.cache = new Map();      // seed|mode -> bytes
    this.mode = 'normal';
    this.pending = new Map();
    this.jobId = 0;
    this.workers = [];
    const n = Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 2) - 1));
    try {
      for (let i = 0; i < n; i++) {
        const w = new Worker(new URL('../engine/atlas-worker.js', import.meta.url), { type: 'module' });
        w.onmessage = (ev) => this._done(ev.data);
        w.onerror = (e) => { console.warn('TUMBLE: atlas worker failed, painting on the main thread', e.message); this.workers = []; this._drainOnMain(); };
        w.postMessage({ init: masks });
        this.workers.push(w);
      }
    } catch (e) { this.workers = []; }
    renderer.setAtlas(this.tex);
    this.recipes = new Map();    // hero seed -> recipe
  }

  setMode(mode) {
    if (mode === this.mode) return Promise.resolve();
    this.mode = mode;
    const seeds = this.slots.map((s, i) => (s ? { slot: i, seed: s } : null)).filter(Boolean);
    return this._paint(seeds, true);
  }

  // Assign slots for a list of seeds (re-using slots already holding them). Returns seed -> slot.
  assign(seeds, { reset = false } = {}) {
    if (reset) this.slots.fill(null);
    const map = new Map();
    const want = [...new Set(seeds)];
    if (want.length > N * N) throw new Error(`a Load asked for ${want.length} tiles; the atlas holds ${N * N}`);
    for (const s of want) { const i = this.slots.indexOf(s); if (i >= 0) map.set(s, i); }
    const jobs = [];
    for (const s of want) {
      if (map.has(s)) continue;
      let i = this.slots.indexOf(null);
      if (i < 0) i = this.slots.findIndex((x) => !want.includes(x));
      this.slots[i] = s;
      map.set(s, i);
      jobs.push({ slot: i, seed: s });
    }
    return { map, ready: this._paint(jobs) };
  }

  release(seed) {
    const i = this.slots.indexOf(seed);
    if (i >= 0) this.slots[i] = null;
  }

  _paint(jobs, force = false) {
    const todo = [];
    for (const j of jobs) {
      const hit = !force && this.cache.get(j.seed + '|' + this.mode);
      if (hit) this._write(j.slot, hit); else todo.push({ ...j, recipe: this.recipes.get(j.seed) || null });
    }
    if (!todo.length) { this._upload(); return Promise.resolve(); }
    if (!this.workers.length) {
      for (const j of todo) this._write(j.slot, this._paintOne(j));
      this._upload();
      return Promise.resolve();
    }
    // split the batch across the workers
    const parts = this.workers.map(() => []);
    todo.forEach((j, i) => parts[i % parts.length].push(j));
    return Promise.all(parts.map((part, wi) => {
      if (!part.length) return null;
      const id = ++this.jobId;
      return new Promise((resolve) => {
        this.pending.set(id, { resolve, todo: part });
        this.workers[wi].postMessage({ id, jobs: part, mode: this.mode, size: this.size });
      });
    }));
  }

  _paintOne(j) {
    const spec = decode(j.seed);
    const sil = j.recipe && j.recipe.silhouette !== undefined ? j.recipe.silhouette : spec.silhouette;
    const bytes = paint(spec, this.masks ? this.masks[sil] : null, { size: this.size, mode: this.mode, recipe: j.recipe });
    this.cache.set(j.seed + '|' + this.mode, bytes);
    return bytes;
  }

  _drainOnMain() {
    for (const [id, p] of this.pending) {
      for (const j of p.todo) this._write(j.slot, this._paintOne(j));
      this._upload();
      p.resolve();
      this.pending.delete(id);
    }
  }

  _done({ id, tiles }) {
    const p = this.pending.get(id);
    for (const t of tiles) {
      this.cache.set(t.seed + '|' + this.mode, t.bytes);
      if (this.slots[t.slot] === t.seed) this._write(t.slot, t.bytes);
    }
    this._upload();
    if (p) { this.pending.delete(id); p.resolve(); }
  }

  _write(slot, bytes) {
    const s = this.size, W = this.W;
    const tx = (slot % N) * s, ty = Math.floor(slot / N) * s;
    for (let y = 0; y < s; y++) this.data.set(bytes.subarray(y * s * 4, (y + 1) * s * 4), ((ty + y) * W + tx) * 4);
    this.dirty = true;
  }

  _upload() {
    if (!this.dirty) return;
    this.dirty = false;
    this.tex.needsUpdate = true;
  }

  // RGBA bytes of one tile, for 2D thumbnails (drawer, results cards)
  tileBytes(seed) {
    const hit = this.cache.get(seed + '|' + this.mode);
    if (hit) return hit;
    return this._paintOne({ seed, recipe: this.recipes.get(seed) || null });
  }
}
