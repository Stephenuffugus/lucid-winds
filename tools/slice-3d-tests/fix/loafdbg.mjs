import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
const r = await p.evaluate(() => { const S = window._S3; window._S3skiprender = true; S.salt(77); S.newFF(11); const v = S.verbs()[0], G = S.g(), out = [];
  out.push({ loaf: { x: v.x, y: v.y, w: v.w, h: v.h, meshX: v.mesh.position.x, meshY: v.mesh.position.y, inScene: !!v.mesh.parent } });
  for (let i = 0; i < 30; i++) { G.x = v.x; G.y = v.y + 6; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
  G.x = v.x; G.y = v.y + 6;
  for (let i = 0; i < 60; i++) { S.stepN(1, 1000 / 120); if (i % 4 === 0 || v.done) out.push({ i, x: +G.x.toFixed(3), y: +(G.y - v.y).toFixed(2), vx: +G.vx.toFixed(2), vy: +G.vy.toFixed(2), ang: +G.ang.toFixed(2), inside: v.inside, done: !!v.done, gdone: G.done }); if (v.done) break; }
  S.salt(null); return out; });
console.log(JSON.stringify(r));
await b.close();
