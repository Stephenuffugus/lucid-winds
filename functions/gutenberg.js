/**
 * gutenbergText — the Saccade reader's relay for Project Gutenberg plain text.
 *
 * gutenberg.org serves its books without CORS headers, so a page on
 * skywolfstudio.com cannot read them directly. This forwards ONE kind of URL
 * (a Gutenberg plain text file, by its id), adds CORS, and caches hard.
 * Nothing about the reader or the person is stored or logged: no ids, no
 * addresses, no cookies. The only thing that crosses is the book's own URL.
 *
 *   GET /gutenbergText?url=https://www.gutenberg.org/cache/epub/1342/pg1342.txt
 *
 * Anything else answers 403. Astra's spec (SACCADE HANDOFF v0.2, Appendix B)
 * wrote this as a Cloudflare Worker; it lives here instead because this
 * project already deploys functions from this box without a new token.
 */
import { onRequest } from 'firebase-functions/v2/https'

const ALLOW = /^https:\/\/www\.gutenberg\.org\/(cache\/epub\/\d+\/pg\d+\.txt|files\/\d+\/\d+(-0)?\.txt|ebooks\/\d+\.txt\.utf-8)$/
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

export const gutenbergText = onRequest(
  { region: 'us-central1', memory: '256MiB', timeoutSeconds: 30, maxInstances: 5, cors: false },
  async (req, res) => {
    res.set(CORS)
    if (req.method === 'OPTIONS') { res.status(204).send(''); return }
    if (req.method !== 'GET') { res.status(405).send('GET only'); return }
    const url = String(req.query.url || '')
    if (!ALLOW.test(url)) { res.status(403).send('forbidden'); return }
    try {
      const up = await fetch(url, { headers: { 'User-Agent': 'Saccade reader (Sky Wolf Studio), one book at a time' } })
      if (!up.ok) { res.status(up.status).send('upstream ' + up.status); return }
      const text = await up.text()
      res.set('Content-Type', 'text/plain; charset=utf-8')
      res.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000')
      res.status(200).send(text)
    } catch (e) {
      res.status(502).send('unreachable')
    }
  }
)
