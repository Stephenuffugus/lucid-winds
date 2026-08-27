/* Generate sitemap.xml from the portal catalog + the real files on disk.
   Replaces the hand-maintained file so it cannot go stale again.
   ⛔ Uses scripts/catalog.mjs, which bracket-matches the arrays out of
   portal/index.html. Never regex a parseable structure.
   ⛔ Decides gating from the FILE (dev-gate.js in head), never the card flag:
   the card's beta:true is a display state; the script tag is the real gate.
   Spec: PUB-SEO-AUDIT.md §9.1. */
import { readFileSync, writeFileSync, statSync, existsSync, readdirSync } from 'fs'
import { catalog } from './catalog.mjs'

const ORIGIN = 'https://lucidwinds.com'

// Real pages (not games). priority is informational; Google ignores it.
const STATIC = [
  ['/',                 1.0],
  ['/portal/',          0.9],
  ['/portal/apps.html', 0.8],
  ['/jimothy/',         0.9],   // keep until /jimothy/ becomes a 301 (SEO §3.1)
  ['/links.html',       0.7],
  ['/support.html',     0.6],
  ['/privacy.html',     0.4],
  ['/terms.html',       0.4],
  ['/studio.html',      0.6],
  ['/hire.html',        0.5],
]

function gated(rel) {
  return existsSync(rel) && readFileSync(rel, 'utf8').includes('dev-gate.js')
}
function lastmod(rel) {
  try { return statSync(rel).mtime.toISOString().slice(0, 10) } catch { return null }
}

const rows = []
for (const [p, pri] of STATIC) {
  const rel = p === '/' ? 'index.html' : p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1)
  if (!existsSync(rel)) continue
  rows.push({ loc: ORIGIN + p, pri, mod: lastmod(rel) })
}

// Satellites from the catalog, deduped by directory, gated ones skipped.
const seen = new Set()
for (const s of catalog().sats) {
  if (!s.dir || seen.has(s.dir)) continue
  seen.add(s.dir)
  const rel = `satellites/${s.dir}/index.html`
  if (!existsSync(rel) || gated(rel)) continue
  rows.push({ loc: `${ORIGIN}/satellites/${s.dir}/`, pri: 0.6, mod: lastmod(rel) })
}

// The /play/ card+puzzle shells — highest-intent evergreen lane (SEO §11.3).
let plays = 0
if (existsSync('play')) {
  for (const f of readdirSync('play').filter(f => f.endsWith('.html')).sort()) {
    const rel = `play/${f}`
    if (gated(rel)) continue
    rows.push({ loc: `${ORIGIN}/play/${f}`, pri: 0.5, mod: lastmod(rel) })
    plays++
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...rows.map(r =>
    `  <url><loc>${r.loc}</loc>` +
    (r.mod ? `<lastmod>${r.mod}</lastmod>` : '') +
    `<priority>${r.pri}</priority></url>`),
  '</urlset>', '',
].join('\n')

writeFileSync('sitemap.xml', xml)
console.log(`sitemap.xml: ${rows.length} urls (${seen.size} satellites, ${plays} play shells)`)
