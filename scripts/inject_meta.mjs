/* Inject the missing SEO head tags into satellite pages, adding only what is
   absent and touching nothing that is present. Spec: PUB-SEO-AUDIT.md §9.2.

   Per page (satellites/<dir>/index.html), when the tag is MISSING:
     - <meta name="description">  from the portal FEATURED blurb (.ds)
     - <link rel="canonical">     https://lucidwinds.com/satellites/<dir>/
     - <h1 class="visually-hidden"> from the <title>, studio suffix stripped
   ⛔ Never a gated game (dev-gate.js in head). ⛔ Never overwrite a present tag.
   ⛔ Parse FEATURED by bracket match, never regex. Verify each file still
   parses (node --check on the largest script block) after editing.
   Run:  node scripts/inject_meta.mjs         (report)
         node scripts/inject_meta.mjs --write (apply) */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { execSync } from 'child_process'

const WRITE = process.argv.includes('--write')
const ORIGIN = 'https://lucidwinds.com'

// FEATURED, with the blurb, via bracket match (catalog.mjs drops .ds).
function loadFeatured() {
  const src = readFileSync('portal/index.html', 'utf8')
  const start = src.indexOf('var FEATURED =')
  const b = src.indexOf('[', start)
  let d = 0, i = b
  for (; i < src.length; i++) { if (src[i] === '[') d++; else if (src[i] === ']') { d--; if (d === 0) break } }
  // eslint-disable-next-line no-eval
  return eval(src.slice(b, i + 1))
}
const FEATURED = loadFeatured()
const blurbFor = dir => {
  const row = FEATURED.find(x => x.url && x.url.includes(`/satellites/${dir}/`))
  return row && row.ds ? row.ds : null
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// Largest <script> block, node --check'd, per CLAUDE.md rule 15.
function scriptOk(html, file) {
  let i = 0, best = ''
  for (;;) {
    const a = html.indexOf('<script', i); if (a < 0) break
    const gt = html.indexOf('>', a), e = html.indexOf('</script>', gt); if (e < 0) break
    const body = html.slice(gt + 1, e); if (body.length > best.length) best = body
    i = e + 9
  }
  if (!best.trim()) return true
  const tmp = `/tmp/_injchk_${file.replace(/\W/g, '_')}.js`
  writeFileSync(tmp, best)
  try { execSync(`node --check ${tmp}`, { stdio: 'pipe' }); return true } catch { return false }
}

let touched = 0, skipped = 0, nowrite = 0
const dirs = readdirSync('satellites').filter(d => existsSync(`satellites/${d}/index.html`))
for (const dir of dirs) {
  const file = `satellites/${dir}/index.html`
  let html = readFileSync(file, 'utf8')
  if (html.includes('dev-gate.js')) { skipped++; continue }   // gated: leave alone

  const head = html.slice(0, html.indexOf('</head>') + 1)
  const adds = []

  if (!/<meta\s+name=["']description["']/i.test(head)) {
    const b = blurbFor(dir)
    if (b) adds.push(`<meta name="description" content="${esc(b)}">`)
  }
  if (!/<link\s+rel=["']canonical["']/i.test(head)) {
    adds.push(`<link rel="canonical" href="${ORIGIN}/satellites/${dir}/">`)
  }

  // insert head tags before </head>
  if (adds.length) {
    html = html.replace('</head>', adds.join('\n') + '\n</head>')
  }

  // hidden h1 as first body child, only if the page has no <h1> at all
  let addedH1 = false
  if (!/<h1[\s>]/i.test(html)) {
    const title = (html.match(/<title>([^<]*)<\/title>/i) || [, dir])[1]
      .replace(/\s*[—|·-]\s*(Sky Wolf Studio.?|Lucid Winds).*$/i, '').trim()
    const bodyM = html.match(/<body[^>]*>/i)
    if (bodyM) {
      // ⛔ inline style, not a class: most satellite pages have no
      // .visually-hidden rule, and a classed h1 would render as visible text
      // atop the game. This is a real hidden-h1 pattern, not display:none
      // (which search engines discount).
      const hide = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0'
      html = html.replace(bodyM[0], `${bodyM[0]}\n<h1 style="${hide}">${esc(title)}</h1>`)
      addedH1 = true
    }
  }

  if (!adds.length && !addedH1) { continue }

  if (!scriptOk(html, dir)) { console.log(`  ⛔ SKIP ${dir}: script no longer parses after edit`); nowrite++; continue }

  if (WRITE) writeFileSync(file, html)
  touched++
  console.log(`  ${WRITE ? 'wrote' : 'would write'} ${dir}: ${adds.length} head tag(s)${addedH1 ? ' + h1' : ''}`)
}
console.log(`\n${WRITE ? 'wrote' : 'dry run'}: ${touched} pages, ${skipped} gated skipped, ${nowrite} refused (parse guard)`)
if (!WRITE) console.log('re-run with --write to apply')
