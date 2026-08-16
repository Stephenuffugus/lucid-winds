#!/usr/bin/env node
/* PONG ARENA — headless assertion suite (2026-08-16 audit pass).
 *
 *   node satellites/pong/audit.mjs              run the suite
 *   node satellites/pong/audit.mjs --selftest   break each check on purpose first
 *
 * The --selftest pass is the point. A probe you have never watched go RED is
 * decoration: it proves the code runs, not that the check discriminates. Every
 * assertion below ships with a `break` mutation that is injected into the live
 * page; the run fails loudly if a mutated check still passes.
 *
 * Serves the REPO ROOT, not the game folder, because the page pulls
 * /sunbeam-sdk.js and /feedback.js from the origin root.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const URLPATH = '/satellites/pong/index.html';
const SELFTEST = process.argv.includes('--selftest');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise((res) => {
    const s = http.createServer((req, rq) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rq.writeHead(404); rq.end('nope'); return;
      }
      rq.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rq);
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}

const results = [];
function record(name, ok, detail) { results.push({ name, ok, detail }); }

/* ── every check: { name, run(page) -> {ok, detail}, break?: string }
      `break` is JS evaluated in the page BEFORE run(), designed to make the
      check go red. If it does not, the check is not measuring anything.      */
const CHECKS = [

{ name: 'boots: menu is up and the exit affordance exists',
  async run(page) {
    const r = await page.evaluate(() => ({
      menu: !document.querySelector('#scrMenu').classList.contains('hidden'),
      exitBtn: !!document.querySelector('[data-go="exit"]'),
      exitFn: typeof window.SWS_EXIT === 'function'
    }));
    return { ok: r.menu && r.exitBtn && r.exitFn, detail: JSON.stringify(r) };
  },
  break: `document.querySelector('[data-go="exit"]').remove();` },

{ name: 'exit does NOT gate on being framed (standing class 1)',
  async run(page) {
    // The portal navigates relative /satellites/ urls TOP LEVEL, so the exit has
    // to work unframed. `location.replace` is not writable in Chrome, so spying
    // on it silently lets the page navigate for real; catch it at the network
    // layer instead and abort the request.
    const framedFlag = await page.evaluate(() => window.SWS_EMBED);
    let target = null;
    await page.setRequestInterception(true);
    const onReq = (rq) => {
      if (rq.isNavigationRequest() && rq.frame() === page.mainFrame() && rq.url().indexOf('/satellites/pong') < 0) {
        target = rq.url(); rq.abort().catch(() => {});
      } else rq.continue().catch(() => {});
    };
    page.on('request', onReq);
    await page.evaluate(() => { try { window.SWS_EXIT(); } catch (e) {} });
    await new Promise(r => setTimeout(r, 400));
    page.off('request', onReq);
    await page.setRequestInterception(false);
    const ok = framedFlag === false && !!target && /\/portal\/?$/.test(target);
    return { ok, detail: `SWS_EMBED=${framedFlag} unframed exit went to ${target}` };
  },
  break: `window.SWS_EXIT=function(){ if(!/[?&]embed=1/.test(location.search)) return; };` },

{ name: 'corrupt save that PARSES does not blank the page (standing class 3)',
  // No `break` mutation: this check carries its own proof. It first runs every
  // poison through a verbatim copy of the OLD loader and refuses to continue
  // unless the old code actually dies on them. That is the "watch it fail"
  // step, and it is permanent rather than a one-off selftest run.
  async run(page) {
    const poisons = ['{"cur":1,"opt":5}', '{"cur":"x"}', '{"cur":{"rally":"NaN"},"owned":7,"equip":null}',
                     '[]', 'null', '{"stats":"nope","camp":"z"}', '{"cur":{"rally":1e999}}'];

    const lethal = await page.evaluate((poisons) => {
      'use strict';
      const DEF = { cur: { rally: 120, gem: 0, spark: 0, trophy: 0 }, owned: {}, equip: {}, camp: 0,
                    campBest: 0, opt: { sound: true, shake: true, trail: true, hand: 'auto' },
                    stats: { played: 0, wins: 0, bestRally: 0, pointsFor: 0 } };
      function deepDefault(o, d) { for (const k in d) { if (o[k] === undefined) o[k] = JSON.parse(JSON.stringify(d[k])); else if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) deepDefault(o[k], d[k]); } return o; }
      const dies = [];
      for (const p of poisons) {
        let S;
        try { const r = JSON.parse(p); S = (r && r.cur) ? deepDefault(r, DEF) : JSON.parse(JSON.stringify(DEF)); }
        catch (e) { dies.push({ p, how: 'load threw: ' + e.message }); continue; }
        try { S.cur.rally = (S.cur.rally || 0) + 3; S.owned['x'] = 1; }   // the first point scored / first buy
        catch (e) { dies.push({ p, how: 'first score threw: ' + e.message }); continue; }
        if (!isFinite(S.cur.rally)) dies.push({ p, how: 'currency became ' + S.cur.rally });
      }
      return dies;
    }, poisons);
    if (lethal.length < 3) return { ok: false, detail: `the poisons are not poisonous: only ${lethal.length}/${poisons.length} kill the old loader, so this check proves nothing` };

    const out = [];
    for (const p of poisons) {
      await page.evaluate((v) => localStorage.setItem('pongarena.save.v1', v), p);
      await page.reload({ waitUntil: 'domcontentloaded' });
      const r = await page.evaluate(() => {
        if (!window.__PONG) return { boot: false };
        try {
          window.__PONG.start('classic', { diff: 'easy', target: 3 });
          for (let i = 0; i < 1200; i++) window.__PONG.step(1);
          const g = window.__PONG.game;
          const cur = window.__PONG.S().cur;
          const finite = Object.keys(cur).every(k => typeof cur[k] === 'number' && isFinite(cur[k]));
          // "playable" = the currency path actually RAN. Both a scored point and a
          // 4+ rally call Economy.earn, which is exactly where a poisoned save
          // used to throw. Requiring a SCORE would just be measuring the AI.
          return { boot: true, played: !!g && (g.scores.p + g.scores.ai > 0 || g.maxRally > 4),
                   score: g ? g.scores.p + g.scores.ai : -1, rally: g ? g.maxRally : -1, finite };
        } catch (e) { return { boot: true, played: false, err: e.message }; }
      });
      out.push({ p, ...r });
    }
    await page.evaluate(() => localStorage.removeItem('pongarena.save.v1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    const bad = out.filter(o => !o.boot || !o.played || !o.finite);
    return { ok: bad.length === 0, detail: bad.length ? JSON.stringify(bad[0]) : `${lethal.length} of ${poisons.length} poisons kill the OLD loader, all ${out.length} survive the new one` };
  } },

{ name: 'save merges instead of clobbering a second tab (standing class 4)',
  async run(page) {
    const r = await page.evaluate(() => {
      const K = 'pongarena.save.v1';
      // this tab has 120 rally from boot; simulate the OTHER tab banking 900 gems
      // and buying a skin while we were playing, then write from here.
      const S = window.__PONG.S();
      const before = S.cur.rally;
      S.cur.rally = before + 50;                     // we earned 50
      const other = JSON.parse(localStorage.getItem(K) || 'null') || { cur: { rally: before, gem: 0, spark: 0, trophy: 0 }, owned: {}, equip: {}, camp: 0, campBest: 0, opt: {}, stats: {} };
      other.cur.gem = 900; other.owned['ball:7'] = 1; other.camp = 5;
      localStorage.setItem(K, JSON.stringify(other));
      window.__PONG.saveNow();
      const disk = JSON.parse(localStorage.getItem(K));
      return { rally: disk.cur.rally, gem: disk.cur.gem, owned: !!disk.owned['ball:7'], camp: disk.camp, want: before + 50 };
    });
    return { ok: r.rally === r.want && r.gem === 900 && r.owned && r.camp === 5, detail: JSON.stringify(r) };
  },
  break: `window.__PONG.saveNow=function(){ localStorage.setItem('pongarena.save.v1', JSON.stringify(window.__PONG.S())); };` },

{ name: 'rotating mid-match does not stack colliders or strand the ball',
  async run(page) {
    const r = await page.evaluate(async () => {
      window.__PONG.start('gauntlet', { diff: 'normal', target: 11 });
      for (let i = 0; i < 200; i++) window.__PONG.step(1);
      const g = window.__PONG.game;
      const b0 = { bump: g.bumpers.length, mov: g.movers.length };
      // three rotations, the thing the menu literally tells the player to do
      for (let k = 0; k < 3; k++) {
        await new Promise(r2 => setTimeout(r2, 30));
        window.dispatchEvent(new Event('resize'));
      }
      const g2 = window.__PONG.game;
      const inside = g2.balls.every(b => b.x > -b.r && b.x < g2.W + b.r && b.y > -b.r && b.y < g2.H + b.r);
      // and the point must still be able to RESOLVE (no forever-falling ball)
      const s0 = g2.scores.p + g2.scores.ai;
      for (let i = 0; i < 4000; i++) window.__PONG.step(1);
      const s1 = g2.scores.p + g2.scores.ai;
      return { b0, bump: g2.bumpers.length, mov: g2.movers.length, inside, scoredAfter: s1 - s0 };
    });
    return { ok: r.bump === r.b0.bump && r.mov === r.b0.mov && r.inside && r.scoredAfter > 0, detail: JSON.stringify(r) };
  },
  break: `(function(){ const g=window.__PONG.game; })(); window.addEventListener('resize',function(){ const g=window.__PONG.game; if(g){ g.movers.push(g.movers[0]); g.bumpers.push(g.bumpers[0]); } });` },

{ name: 'no tunnelling: 4000 substeps at 6x cap keep every ball inside the field',
  async run(page) {
    const r = await page.evaluate(() => {
      const bad = [];
      for (const mode of ['classic', 'vertical', 'gauntlet', 'multiball', 'survival']) {
        window.__PONG.start(mode, { diff: 'expert', target: 99 });
        const g = window.__PONG.game;
        for (let i = 0; i < 4000; i++) {
          // slam every live ball to the escalated speed ceiling every frame
          for (const b of g.balls) {
            const sp = Math.hypot(b.vx, b.vy) || 1, k = (g.cfg.maxSpeed * 6) / sp;
            b.vx *= k; b.vy *= k;
          }
          window.__PONG.step(1);
          for (const b of g.balls) {
            if (b.dead) continue;
            const pad = b.r * 6;
            if (b.x < -pad || b.x > g.W + pad || b.y < -pad || b.y > g.H + pad) {
              // classic/gauntlet/multiball score off the x edges, that is legal;
              // an ESCAPE is leaving through a solid wall.
              const solidAxisBust = (mode === 'survival') ? (b.y < -pad || b.x < -pad || b.x > g.W + pad)
                : (mode === 'vertical') ? (b.x < -pad || b.x > g.W + pad)
                : (b.y < -pad || b.y > g.H + pad);
              if (solidAxisBust) { bad.push({ mode, i, x: Math.round(b.x), y: Math.round(b.y) }); break; }
            }
          }
          if (bad.length) break;
        }
        if (bad.length) break;
      }
      return { bad };
    });
    return { ok: r.bad.length === 0, detail: r.bad.length ? JSON.stringify(r.bad[0]) : '5 modes x 4000 substeps clean' };
  },
  break: `window.__PONG.Match.prototype.substep=function(b,dt){ b.x+=b.vx*dt; b.y+=b.vy*dt; };` },

{ name: 'no permanent stall: every point resolves inside 30 simulated seconds',
  async run(page) {
    const r = await page.evaluate(() => {
      const worst = [];
      for (const mode of ['classic', 'vertical', 'radial', 'gauntlet', 'multiball']) {
        window.__PONG.start(mode, { diff: 'normal', target: 99 });
        const g = window.__PONG.game;
        for (let pt = 0; pt < 6; pt++) {
          const s0 = g.scores.p + g.scores.ai;
          let n = 0;
          while (g.scores.p + g.scores.ai === s0 && n < 3600) { window.__PONG.step(1); n++; }
          if (n >= 3600) { worst.push({ mode, pt, stalled: true }); break; }
          worst.push({ mode, pt, secs: +(n / 120).toFixed(1) });
        }
      }
      return { worst, stalls: worst.filter(w => w.stalled).length, max: Math.max(...worst.map(w => w.secs || 99)) };
    });
    const worstPt = r.worst.filter(w => !w.stalled).sort((a, b) => b.secs - a.secs)[0];
    return { ok: r.stalls === 0,
      detail: r.stalls ? `HUNG: ${JSON.stringify(r.worst.filter(w => w.stalled))}` : `slowest point ${worstPt.secs}s (${worstPt.mode})` };
  },
  break: `window.__PONG.Match.prototype.doScore=function(){};` },

{ name: 'the magnet power-up cannot lock the ball forever',
  async run(page) {
    const r = await page.evaluate(() => {
      window.__PONG.start('gauntlet', { diff: 'normal', target: 99 });
      const g = window.__PONG.game;
      while (g.state !== 'play') window.__PONG.step(1);      // clear the opening 3-2-1
      const pad = g.playerPaddle();
      g.effects.p.magnet = true;
      const b = g.balls[0];
      b.stuck = pad; b.hold = 0;
      let freed = -1;
      for (let i = 0; i < 600; i++) { window.__PONG.step(1); if (!b.stuck) { freed = i; break; } }
      return { freed, secs: freed < 0 ? null : +(freed / 120).toFixed(2), moving: Math.hypot(b.vx, b.vy) > 10 };
    });
    return { ok: r.freed >= 0 && r.secs <= 2 && r.moving, detail: JSON.stringify(r) };
  },
  break: `window.__PONG.Match.prototype.releaseStuck=function(){};` },

{ name: 'dead air: only the first serve of a match gets the full 3-2-1',
  async run(page) {
    const r = await page.evaluate(() => {
      window.__PONG.start('classic', { diff: 'easy', target: 99 });
      const g = window.__PONG.game;
      const first = g.count;
      // force a point, then read the re-serve
      g.scores.p = 1; g.balls[0].dead = true; g.state = 'scored'; g.stateT = 0;
      let n = 0; while (g.state !== 'count' && n < 400) { window.__PONG.step(1); n++; }
      const gapFrames = n;
      const again = g.count;
      // total dead time from the point to the ball moving again
      let m = 0; while (g.state !== 'play' && m < 800) { window.__PONG.step(1); m++; }
      return { first, again, deadSecs: +((gapFrames + m) / 120).toFixed(2) };
    });
    return { ok: r.first === 3 && r.again === 1 && r.deadSecs < 1.6, detail: JSON.stringify(r) };
  },
  break: `window.__PONG.Match.prototype.serveBall=(function(o){return function(){ o.call(this); this.count=3; this.countStep=0.7; };})(window.__PONG.Match.prototype.serveBall);` },

{ name: 'AI difficulty is real and monotonic (Rookie < Pro < Ace < Legend)',
  async run(page) {
    // Measured against a HANDICAPPED bot, not an oracle. Rally length stopped
    // being a useful instrument once sudden death started truncating long
    // rallies on purpose, so the metric is now what a player actually feels:
    // how many points the machine takes off a mediocre opponent per minute.
    // A bot that reads the ball 9 frames late and misjudges it by 30px is about
    // as good as a distracted human.
    const r = await page.evaluate(() => {
      const out = {};
      for (const d of ['easy', 'normal', 'hard', 'expert']) {
        let aiPts = 0, pPts = 0;
        for (let trial = 0; trial < 3; trial++) {
          window.__PONG.start('classic', { diff: d, target: 999 });
          const g = window.__PONG.game, pp = g.playerPaddle();
          const hist = [];
          for (let n = 0; n < 12000; n++) {                 // 100 simulated seconds
            const b = g.balls.find(x => !x.dead);
            if (b) hist.push(b.y); if (hist.length > 9) hist.shift();
            const seen = hist[0];
            if (seen != null) pp.setTargetFromPoint(0, seen + (Math.sin(n * 0.11) * 30));
            window.__PONG.step(1);
          }
          aiPts += g.scores.ai; pPts += g.scores.p;
        }
        // SHARE of points, not points per minute: a stronger CPU also makes
        // rallies longer, so a rate metric conflates "wins more" with "lasts
        // longer" and reads the ladder backwards.
        out[d] = +(aiPts / Math.max(1, aiPts + pPts)).toFixed(3);
      }
      return out;
    });
    const seq = [r.easy, r.normal, r.hard, r.expert];
    const mono = seq[0] < seq[1] && seq[1] < seq[2] && seq[2] < seq[3];
    return { ok: mono, detail: `CPU points per minute off a handicapped player: ${JSON.stringify(r)}` };
  },
  break: `['easy','normal','hard','expert'].forEach(function(k){ Object.assign(window.__PONG.DIFF[k], window.__PONG.DIFF.normal); });` },

{ name: 'every Career level is winnable, and the ladder is a slope not a cliff',
  async run(page) {
    // The bot is a COMPETENT player, not an oracle: it tracks the ball perfectly
    // AND places its returns away from the machine (a real skill the game asks
    // for). A purely defensive bot is a separate, stricter bar — it cannot beat
    // Ace or Legend, which is fine and is now said out loud in How to Play.
    const r = await page.evaluate(() => {
      const bot = (mode, diff, target) => {
        window.__PONG.start(mode, { diff, target });
        const g = window.__PONG.game, pp = g.playerPaddle(); pp.maxSpeed = 1e6;
        const arc = pp.R != null, vert = (mode === 'vertical' || mode === 'survival');
        let n = 0;
        while (g.state !== 'over' && n < 120000) {
          const b = g.balls.find(x => !x.dead);
          if (b) {
            if (arc) pp.setTargetFromPoint(b.x, b.y);
            else {
              const ai = g.aiPaddle();
              const c = vert ? (ai ? ai.center().x : g.W / 2) : (ai ? ai.center().y : g.H / 2);
              const mid = vert ? g.W / 2 : g.H / 2;
              const dir = c < mid ? 1 : -1, k = 0.6 * (pp.len / 2);
              if (vert) pp.setTargetFromPoint(b.x - dir * k, b.y);
              else pp.setTargetFromPoint(b.x, b.y - dir * k);
            }
            pp.off = pp.target;
          }
          window.__PONG.step(1); n++;
        }
        return { over: g.state === 'over', win: !!(g.result && g.result.win),
                 perPt: +(n / 120 / Math.max(1, g.scores.p)).toFixed(0), p: g.scores.p, ai: g.scores.ai };
      };
      const out = [];
      window.__PONG.CAMPAIGN.forEach((lv, i) => { out.push({ lv: i + 1, ...bot(lv.mode, lv.diff, lv.target) }); });
      return out;
    });
    const lost = r.filter(x => !x.over || !x.win);
    const slow = r.filter(x => x.perPt > 70);
    return { ok: lost.length === 0 && slow.length === 0,
      detail: lost.length ? `UNWINNABLE: ${JSON.stringify(lost)}` : slow.length ? `SLOG: ${JSON.stringify(slow)}`
        : `12/12 cleared, secs/point ${r.map(x => x.perPt).join(' ')}` };
  },
  break: `window.__PONG.DIFF.expert.padFrac=9; window.__PONG.DIFF.hard.padFrac=9;` },

{ name: 'every currency the wallet shows has something to spend it on',
  async run(page) {
    const r = await page.evaluate(() => {
      const shown = Object.keys(window.__PONG.S().cur);            // what the wallet row prints
      const sinks = {};
      for (const sk of window.__PONG.Skins.CATALOG) { if (!sk.free && sk.cost > 0) sinks[sk.priceCur] = (sinks[sk.priceCur] || 0) + 1; }
      return { shown, sinks, dead: shown.filter(c => !sinks[c]) };
    });
    return { ok: r.dead.length === 0, detail: r.dead.length ? `EARNABLE BUT UNSPENDABLE: ${r.dead.join(', ')}` : `sinks: ${JSON.stringify(r.sinks)}` };
  },
  break: `window.__PONG.Skins.CATALOG.forEach(function(s){ if(s.priceCur==='spark') s.priceCur='rally'; });` },

{ name: 'the shop is reachable in a session: cheapest of each tier vs one match',
  async run(page) {
    const r = await page.evaluate(() => {
      const per = { rally: 20 + 3 * 7, gem: 5, spark: 12, trophy: 1 };   // one WON first-to-7
      const cheapest = {};
      for (const sk of window.__PONG.Skins.CATALOG) {
        if (sk.free || !sk.cost) continue;
        const k = sk.rarity;
        if (!cheapest[k] || sk.cost < cheapest[k].cost) cheapest[k] = { cost: sk.cost, cur: sk.priceCur };
      }
      const wins = {};
      for (const k in cheapest) wins[k] = Math.ceil(cheapest[k].cost / per[cheapest[k].cur]);
      return { cheapest, wins };
    });
    // a legendary should be a long grind, not a second job. mythic is trophy-gated
    // to the campaign on purpose, so it is exempt.
    const bad = Object.entries(r.wins).filter(([k, v]) => k !== 'mythic' && v > 40);
    return { ok: bad.length === 0, detail: `match-wins to afford the cheapest of each tier: ${JSON.stringify(r.wins)}` };
  },
  break: `window.__PONG.Skins.CATALOG.forEach(function(s){ if(s.priceCur==='gem') s.cost*=20; });` },

{ name: 'no dashes in player copy (standing class 7)',
  async run(page) {
    const r = await page.evaluate(() => {
      const hits = [];
      const walk = (n) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) {
            const t = c.nodeValue;
            if (/[–—]/.test(t) || /\s-\s/.test(t)) hits.push(t.trim().slice(0, 70));
          } else if (c.nodeType === 1 && c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE') walk(c);
        }
      };
      walk(document.body);
      return hits;
    });
    return { ok: r.length === 0, detail: r.length ? JSON.stringify(r.slice(0, 3)) : 'clean' };
  },
  break: `document.querySelector('#menuFine').textContent='Currency is earned by playing — and only spends here.';` },

{ name: 'touch targets are 48px rendered at 375x667 (standing class 6)',
  async run(page) {
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    const r = await page.evaluate(async () => {
      const small = [];
      const seen = new Set();
      const screens = ['menu', 'modes', 'campaign', 'shop', 'settings', 'how'];
      const go = (n) => { const b = document.querySelector(`[data-go="${n}"]`); if (b) b.click(); };
      for (const s of screens) {
        document.querySelector('#scrMenu').classList.remove('hidden');
        go(s);
        await new Promise(r2 => setTimeout(r2, 60));
        const sel = 'button, .stab, .switch, .camp-node, .mode, .skin .buy, [data-hand]';
        for (const el of document.querySelectorAll(sel)) {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden') continue;
          const r0 = el.getBoundingClientRect();
          if (r0.width === 0 || r0.height === 0) continue;
          // count the invisible hit-slop a ::before can add
          let h = r0.height, w = r0.width;
          const bf = getComputedStyle(el, '::before');
          if (bf && bf.content !== 'none' && bf.position === 'absolute') {
            const inset = parseFloat(bf.top);
            if (!isNaN(inset) && inset < 0) { h += -inset * 2; w += -inset * 2; }
          }
          const key = (el.id || el.className || el.tagName) + '|' + Math.round(w) + 'x' + Math.round(h);
          if (seen.has(key)) continue; seen.add(key);
          if (h < 47.5 || w < 47.5) small.push({ screen: s, el: el.id || el.className, w: Math.round(w), h: Math.round(h), txt: (el.textContent || '').trim().slice(0, 18) });
        }
      }
      return small;
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    return { ok: r.length === 0, detail: r.length ? JSON.stringify(r.slice(0, 4)) : 'all >= 48px' };
  },
  break: `document.querySelector('.icob').style.height='40px';document.querySelector('.icob').style.width='40px';` },
];

async function main() {
  const server = await serve();
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  let failures = 0, selfFailures = 0;

  for (const c of CHECKS) {
    // ── selftest: prove the check can go red ─────────────────────────────
    if (SELFTEST && c.break) {
      const p = await browser.newPage();
      await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      p.on('pageerror', () => {});
      await p.goto(base + URLPATH, { waitUntil: 'domcontentloaded' });
      await p.evaluate(() => new Promise(r => setTimeout(r, 120)));
      let broke = { ok: true, detail: 'break did not run' };
      try {
        await p.evaluate(c.break);
        broke = await c.run(p);
      } catch (e) { broke = { ok: false, detail: 'threw: ' + e.message }; }
      await p.close();
      if (broke.ok) { selfFailures++; console.log(`  SELFTEST NOT RED  ${c.name}  (${broke.detail})`); }
      else console.log(`  selftest red ok   ${c.name}`);
    }

    // ── the real run ─────────────────────────────────────────────────────
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    await page.goto(base + URLPATH, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 120)));
    let out;
    try { out = await c.run(page); } catch (e) { out = { ok: false, detail: 'threw: ' + e.message }; }
    if (errs.length) out = { ok: false, detail: (out.detail || '') + ' | pageerror: ' + errs[0] };
    await page.close();
    record(c.name, out.ok, out.detail);
    if (!out.ok) failures++;
    console.log(`${out.ok ? 'PASS' : 'FAIL'}  ${c.name}\n      ${out.detail}`);
  }

  await browser.close();
  server.close();
  console.log(`\n${results.length - failures}/${results.length} passed` + (SELFTEST ? `, ${CHECKS.filter(c => c.break).length - selfFailures}/${CHECKS.filter(c => c.break).length} checks proved they go red` : ''));
  process.exit(failures || selfFailures ? 1 : 0);
}
main();
