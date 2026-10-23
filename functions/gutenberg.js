/**
 * gutenbergText — the Saccade reader's door to Project Gutenberg.
 *
 * gutenberg.org serves its books and its catalogue without CORS headers, and
 * Gutendex (the third party search API the first demo used) sits behind a
 * Cloudflare challenge that refuses a page's fetch outright. So this one
 * endpoint does the whole library, straight from gutenberg.org:
 *
 *   ?url=<gutenberg text url>   the book's plain text (allowlisted URLs only)
 *   ?top=1|7|30                 the Top 100 most downloaded, yesterday / 7 days / 30 days
 *   ?q=<words>                  search titles and authors in the official catalogue feed
 *   ?topic=<subject>            books whose subjects or bookshelves mention it
 *
 * The catalogue feed (pg_catalog.csv, ~21 MB, refreshed by Gutenberg weekly)
 * is fetched once per warm instance and kept in memory as a compact list of
 * English text books. Nothing about the reader is stored or logged: no ids,
 * no addresses, no cookies. Only the book's own URL or the words typed cross.
 */
import { onRequest } from 'firebase-functions/v2/https'

const ALLOW = /^https:\/\/www\.gutenberg\.org\/(cache\/epub\/\d+\/pg\d+\.txt|files\/\d+\/\d+(-0)?\.txt|ebooks\/\d+\.txt\.utf-8)$/
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400' }
const UA = { 'User-Agent': 'Saccade reader (Sky Wolf Studio), one request at a time' }
const CATALOG_URL = 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv'
const TOP_URL = 'https://www.gutenberg.org/browse/scores/top'

/* ---------- the catalogue ---------- */
let CATALOG = null, catalogAt = 0, catalogPromise = null
const CATALOG_TTL = 7 * 24 * 3600 * 1000

/** A real CSV parser: quoted fields, doubled quotes, newlines inside quotes (titles have them). */
export function parseCsv(text) {
  const rows = []; let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

/** "Austen, Jane, 1775-1817; Shelley, Mary" → "Jane Austen, Mary Shelley" */
export function authorsOf(raw) {
  return String(raw || '').split(';').map((a) => {
    const parts = a.split(',').map((x) => x.trim()).filter(Boolean)
    if (!parts.length) return ''
    const last = parts[0]; const first = parts[1] && !/^\d{3,4}\??-|^-?\d{3,4}$|^\[/.test(parts[1]) ? parts[1] : ''
    return (first ? first + ' ' + last : last).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
  }).filter(Boolean).slice(0, 3).join(', ')
}

/** The feed as a compact list of English text books: { id, t, a, s (subjects + bookshelves, lowercased), k (title+author, lowercased) } */
export function compactCatalog(csvText) {
  const rows = parseCsv(csvText); const out = []
  const H = rows[0] || []; const col = (n) => H.indexOf(n)
  const cId = col('Text#'), cType = col('Type'), cTitle = col('Title'), cLang = col('Language'), cAuth = col('Authors'), cSub = col('Subjects'), cShelf = col('Bookshelves')
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r || r.length < 5) continue
    if (r[cType] !== 'Text' || r[cLang] !== 'en') continue
    const id = parseInt(r[cId], 10); if (!id) continue
    const t = String(r[cTitle] || '').split('\n')[0].trim(); if (!t) continue
    const a = authorsOf(r[cAuth])
    const s = (String(r[cSub] || '') + '; ' + String(r[cShelf] || '')).toLowerCase().replace(/category: /g, '')
    out.push({ id, t, a, s, k: (t + ' ' + a).toLowerCase() })
  }
  return out
}

async function catalog() {
  if (CATALOG && Date.now() - catalogAt < CATALOG_TTL) return CATALOG
  if (!catalogPromise) catalogPromise = (async () => {
    const r = await fetch(CATALOG_URL, { headers: UA }); if (!r.ok) throw new Error('catalog ' + r.status)
    CATALOG = compactCatalog(await r.text()); catalogAt = Date.now(); return CATALOG
  })().finally(() => { catalogPromise = null })
  return catalogPromise
}

/* ---------- the Top 100 ---------- */
let TOP = {}, topAt = 0
const TOP_TTL = 6 * 3600 * 1000
export function parseTop(html) {
  const out = {}
  for (const [key, id] of [['1', 'books-last1'], ['7', 'books-last7'], ['30', 'books-last30']]) {
    const m = html.split('id="' + id + '"')[1]; if (!m) { out[key] = []; continue }
    const list = m.split('</ol>')[0]; const items = []
    const re = /<li><a href="\/ebooks\/(\d+)">(.*?) by (.*?) \((\d+)\)<\/a><\/li>|<li><a href="\/ebooks\/(\d+)">(.*?) \((\d+)\)<\/a><\/li>/g
    let x; while ((x = re.exec(list))) {
      if (x[1]) items.push({ id: +x[1], t: unesc(x[2]), a: unesc(x[3]), n: +x[4] })
      else items.push({ id: +x[5], t: unesc(x[6]), a: '', n: +x[7] })
    }
    out[key] = items
  }
  return out
}
function unesc(s) { return String(s).replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>') }
async function top() {
  if (topAt && Date.now() - topAt < TOP_TTL) return TOP
  const r = await fetch(TOP_URL, { headers: UA }); if (!r.ok) throw new Error('top ' + r.status)
  TOP = parseTop(await r.text()); topAt = Date.now(); return TOP
}

/* ---------- search and subjects ---------- */
export function search(list, q, popular, limit = 40) {
  const words = String(q).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6); if (!words.length) return []
  const hits = []
  for (const b of list) {
    let ok = true; for (const w of words) if (b.k.indexOf(w) < 0) { ok = false; break }
    if (!ok) continue
    let score = 0; const tl = b.t.toLowerCase()
    if (tl === words.join(' ')) score += 100
    if (tl.startsWith(words[0])) score += 20
    if (popular.has(b.id)) score += 40
    score -= Math.min(10, b.t.length / 20)
    hits.push([score, b])
  }
  hits.sort((x, y) => y[0] - x[0] || x[1].t.localeCompare(y[1].t))
  return hits.slice(0, limit).map((h) => h[1])
}
export function byTopic(list, topic, popular, limit = 60) {
  const t = String(topic).toLowerCase().trim(); if (!t) return []
  const hits = []
  for (const b of list) if (b.s.indexOf(t) >= 0) hits.push([popular.has(b.id) ? 1 : 0, b])
  hits.sort((x, y) => y[0] - x[0] || x[1].t.localeCompare(y[1].t))
  return hits.slice(0, limit).map((h) => h[1])
}
const slim = (b) => ({ id: b.id, t: b.t, a: b.a })

export const gutenbergText = onRequest(
  { region: 'us-central1', memory: '512MiB', timeoutSeconds: 60, maxInstances: 5, cors: false },
  async (req, res) => {
    res.set(CORS)
    if (req.method === 'OPTIONS') { res.status(204).send(''); return }
    if (req.method !== 'GET') { res.status(405).send('GET only'); return }
    const Q = req.query
    try {
      if (Q.url !== undefined) {
        const url = String(Q.url || '')
        if (!ALLOW.test(url)) { res.status(403).send('forbidden'); return }
        const up = await fetch(url, { headers: UA })
        if (!up.ok) { res.status(up.status).send('upstream ' + up.status); return }
        res.set('Content-Type', 'text/plain; charset=utf-8'); res.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000')
        res.status(200).send(await up.text()); return
      }
      if (Q.top !== undefined) {
        const T = await top(); const key = ['1', '7', '30'].includes(String(Q.top)) ? String(Q.top) : '30'
        res.set('Cache-Control', 'public, max-age=21600'); res.json({ books: T[key] || [], days: +key }); return
      }
      if (Q.q !== undefined || Q.topic !== undefined) {
        const [list, T] = await Promise.all([catalog(), top().catch(() => ({ '30': [] }))])
        const popular = new Set((T['30'] || []).map((b) => b.id))
        const books = Q.q !== undefined ? search(list, String(Q.q).slice(0, 80), popular) : byTopic(list, String(Q.topic).slice(0, 60), popular)
        res.set('Cache-Control', 'public, max-age=86400'); res.json({ books: books.map(slim), count: books.length, of: list.length }); return
      }
      res.status(400).send('ask for ?url=, ?top=, ?q= or ?topic=')
    } catch (e) {
      res.status(502).send('unreachable')
    }
  }
)
