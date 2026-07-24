#!/usr/bin/env node
/* Build a self-contained Jimothy bundle for itch.io (or any static host / iframe embed).
 *
 *   node scripts/build-itch.mjs
 *
 * Produces build-itch/ : index.html + assets/ + sw.js + sunbeam-sdk.js, ready to zip and
 * upload to itch as an HTML5 game ("This file will be played in the browser").
 *
 * What it changes vs the deployed game, and WHY:
 *  1. The one root-absolute path (/sunbeam-sdk.js) -> relative, because itch serves from a
 *     subpath (html-classic.itch.zone/html/<id>/) where "/" is not the game.
 *  2. ITCH_BUILD flag = true, which hides the in-game Supporter Pack's card/crypto
 *     checkout. itch has its own donation rail and rules about external payment; the pack
 *     lives on the website. Accounts + costumes still work; only the paid button is gone.
 *
 * What it deliberately does NOT do: recompress the art (Stephen's call), touch game logic,
 * or bundle Firebase (it lazy-loads from gstatic, which works in any iframe).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const GAME = dirname(HERE)                       // satellites/stream-hop
const OUT = join(GAME, 'build-itch')

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

// 1. index.html, with the two edits
let html = readFileSync(join(GAME, 'index.html'), 'utf8')

const before = html
html = html.replace('src="/sunbeam-sdk.js?v=4"', 'src="sunbeam-sdk.js?v=4"')
if (html === before) throw new Error('did not find the /sunbeam-sdk.js path to relativise — check the source')

// flip the ITCH build flag on. The game reads window.__ITCH_BUILD before its main script.
html = html.replace('<head>', '<head>\n<script>window.__ITCH_BUILD=true;</script>')

writeFileSync(join(OUT, 'index.html'), html)

// 2. the SDK + service worker, verbatim
cpSync(join(GAME, '..', '..', 'sunbeam-sdk.js'), join(OUT, 'sunbeam-sdk.js'))
if (existsSync(join(GAME, 'sw.js'))) cpSync(join(GAME, 'sw.js'), join(OUT, 'sw.js'))

// 3. the art. Everything the game fetches at runtime lives under assets/.
cpSync(join(GAME, 'assets'), join(OUT, 'assets'), { recursive: true })

// a tiny manifest so the PWA identity still works if someone adds it to their home screen
if (existsSync(join(GAME, 'manifest.webmanifest'))) cpSync(join(GAME, 'manifest.webmanifest'), join(OUT, 'manifest.webmanifest'))

console.log('built ->', OUT)
console.log('zip it:  (cd build-itch && zip -qr ../jimothy-itch.zip .)')
console.log('itch:    upload jimothy-itch.zip, tick "This file will be played in the browser",')
console.log('         set the viewport to 412 x 915 and "Mobile friendly" + "Fullscreen".')
