#!/usr/bin/env node
/**
 * AURA OFF — tools/stamp.js
 *
 * Stamps the BUILD onto every URL the browser fetches, so a deploy cannot serve
 * a mixed build. Run it after bumping BUILD; it is idempotent.
 *
 *   node tools/stamp.js            # stamp everything with the current BUILD
 *   node tools/stamp.js --check    # exit 1 if anything is unstamped or stale
 *   node tools/stamp.js --bump     # roll BUILD to today's date + next letter
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS — the host caching law, learned the hard way on this domain
 * ---------------------------------------------------------------------------
 * `.htaccess` DOES deploy here, but the host OVERRIDES Cache-Control on static
 * assets regardless of what it says: js and css are forced to max-age=14400,
 * HTML to max-age=300 with stale-while-revalidate=86400. So you cannot fix this
 * with a cache header. A versioned URL is the only lever that works.
 *
 * Measured on this game, 2026-08-29, minutes after a deploy: the live HTML
 * carried the new build stamp while `src/ui/style.css` — requested bare —
 * came back as the OLD file from the edge. New page, old stylesheet, and the
 * fix for the control Stephen had just reported broken never reached his phone.
 *
 * Three traps this closes:
 *
 * 1. ES MODULE IMPORTS ARE SEPARATE URLS. A query string on the entry point
 *    does NOT propagate to `import './game.js'` — each specifier is its own
 *    request with its own 4-hour cache. Every relative specifier has to carry
 *    the stamp itself, which is why this rewrites source rather than wrapping
 *    a build step. (This project ships with no build step and should stay that
 *    way; the stamp is committed, readable, and greppable.)
 *
 * 2. A BARE `sw.js` REGISTRATION IS EDGE-PINNED FOR SEVEN DAYS. Measured
 *    elsewhere on this domain at max-age=604800, serving a ten-day-old worker.
 *    The registration URL must be versioned and bumped in lockstep with the
 *    worker's own cache name, or old installs never re-point.
 *
 * 3. FORGETTING THE BUMP IS THE DOCUMENTED FAILURE MODE, so `--check` makes it
 *    a failing command instead of a thing somebody remembers.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'index.html');
const SW = join(ROOT, 'sw.js');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const BUMP = args.includes('--bump');

/* ---- the single source of the version: sw.js's BUILD --------------------- */

const swSrc = readFileSync(SW, 'utf8');
const buildMatch = swSrc.match(/var BUILD = '([^']+)'/);
if (!buildMatch) { console.error('stamp: no `var BUILD = ...` in sw.js'); process.exit(1); }
let BUILD = buildMatch[1];

if (BUMP) {
  const d = new Date();
  const today = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const prev = BUILD.startsWith(today) ? BUILD.slice(today.length) : '';
  const next = prev ? String.fromCharCode(prev.charCodeAt(0) + 1) : 'a';
  BUILD = today + next;
  writeFileSync(SW, swSrc.replace(/var BUILD = '[^']+'/, `var BUILD = '${BUILD}'`));
  console.log(`stamp: BUILD -> ${BUILD}`);
}

/* ---- walk src/ ----------------------------------------------------------- */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

const stale = [];
let touched = 0;

/* Every relative specifier: `from './x.js'` and `import('./x.js')`. Strip any
   existing stamp first so this is idempotent and a bump rewrites cleanly. */
const SPEC = /(from\s+|import\()(['"])(\.[^'"?]+\.js)(\?v=[^'"]*)?\2/g;

for (const file of walk(join(ROOT, 'src'))) {
  const src = readFileSync(file, 'utf8');
  const next = src.replace(SPEC, (m, kw, q, path, existing) => {
    if (existing === `?v=${BUILD}`) return m;
    stale.push(`${relative(ROOT, file)}  ${path}${existing || ' (unstamped)'}`);
    return `${kw}${q}${path}?v=${BUILD}${q}`;
  });
  if (next !== src && !CHECK) { writeFileSync(file, next); touched++; }
}

/* ---- index.html: stylesheet, entry module, and the worker registration ---- */

let html = readFileSync(INDEX, 'utf8');
const before = html;

html = html
  .replace(/href="(src\/ui\/style\.css)(\?v=[^"]*)?"/g, (m, p, e) => {
    if (e !== `?v=${BUILD}`) stale.push(`index.html  ${p}${e || ' (unstamped)'}`);
    return `href="${p}?v=${BUILD}"`;
  })
  .replace(/src="(src\/main\.js)(\?v=[^"]*)?"/g, (m, p, e) => {
    if (e !== `?v=${BUILD}`) stale.push(`index.html  ${p}${e || ' (unstamped)'}`);
    return `src="${p}?v=${BUILD}"`;
  })
  // ⛔ A BARE sw.js REGISTRATION IS EDGE-PINNED FOR SEVEN DAYS.
  .replace(/register\((['"])(sw\.js)(\?v=[^'"]*)?\1/g, (m, q, p, e) => {
    if (e !== `?v=${BUILD}`) stale.push(`index.html  register('${p}')${e || ' (unstamped)'}`);
    return `register(${q}${p}?v=${BUILD}${q}`;
  })
  .replace(/<meta name="build" content="[^"]*">/, `<meta name="build" content="${BUILD}">`);

if (html !== before && !CHECK) { writeFileSync(INDEX, html); touched++; }

/* ---- report -------------------------------------------------------------- */

if (CHECK) {
  if (stale.length) {
    console.error(`stamp --check: ${stale.length} URL(s) not stamped at ${BUILD}:`);
    for (const s of stale) console.error('  ' + s);
    console.error('\nRun `node tools/stamp.js` before deploying, or the host serves a mixed build.');
    process.exit(1);
  }
  console.log(`stamp --check: every fetched URL is stamped ${BUILD}`);
} else {
  console.log(`stamp: ${BUILD} — ${touched} file(s) rewritten, ${stale.length} URL(s) stamped`);
}
