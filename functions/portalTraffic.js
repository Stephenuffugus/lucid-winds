/**
 * portalTraffic — a hit counter that counts visits and nothing else.
 *
 * Stephen 2026-08-21: "I'd like to not track people but I'd like to be able
 * to know how much traffic the portal is getting. I've been putting some
 * stickers out and about... with a QR code to the studio."
 *
 * The whole privacy posture, so nobody has to re-derive it later:
 *  - NOTHING identifying is stored. No IP, no user agent, no cookie, no id.
 *    The Firestore documents hold integers and a date string, full stop.
 *  - The client pings once per browser session (sessionStorage flag that
 *    never leaves the device) so the numbers mean "visits", not "paints".
 *  - `src` labels where a visit came from (the sticker QR points at
 *    /portal/?from=sticker). It is sanitized to [a-z0-9-]{1,24} and only
 *    ever increments a counter named after itself.
 *
 * Data shape:
 *   portalStats/{YYYY-MM-DD}  { hits: N, src: { sticker: N, direct: N, ... } }
 *   portalStats/_total        { hits: N, since: '2026-08-21' }
 *
 * Two endpoints:
 *   portalPing   — GET/POST, the counter. Returns 204 always (even on error;
 *                  a counter must never break a page).
 *   portalStats  — GET, a small readable HTML table of the last 60 days.
 *                  Aggregate integers only, safe to leave public.
 */
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'

function dayKey() {
  return new Date().toISOString().slice(0, 10)
}
function cleanSrc(raw) {
  const s = String(raw || 'direct').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24)
  return s || 'direct'
}

export const portalPing = onRequest(
  { region: 'us-central1', cors: true, maxInstances: 3 },
  async (req, res) => {
    try {
      const src = cleanSrc(req.query.src || (req.body && req.body.src))
      const db = getFirestore()
      const day = dayKey()
      const inc = FieldValue.increment(1)
      await Promise.all([
        db.collection('portalStats').doc(day).set(
          { d: day, hits: inc, src: { [src]: inc } }, { merge: true }),
        db.collection('portalStats').doc('_total').set(
          { hits: inc, since: '2026-08-21' }, { merge: true }),
      ])
    } catch (e) {
      logger.warn('[portalPing] swallowed: %s', e && e.message)
    }
    res.status(204).send('')
  },
)

export const portalStats = onRequest(
  { region: 'us-central1', cors: true, maxInstances: 2 },
  async (req, res) => {
    try {
      const db = getFirestore()
      const snap = await db.collection('portalStats')
        .orderBy('d', 'desc').limit(60).get()
      const total = await db.collection('portalStats').doc('_total').get()
      const rows = []
      const srcTotals = {}
      snap.forEach((doc) => {
        const v = doc.data()
        if (!v.d) return
        const srcs = v.src || {}
        for (const k in srcs) srcTotals[k] = (srcTotals[k] || 0) + srcs[k]
        rows.push({ d: v.d, hits: v.hits || 0, src: srcs })
      })
      const allSrcs = Object.keys(srcTotals).sort((a, b) => srcTotals[b] - srcTotals[a])
      let h = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<title>Portal traffic</title>'
        + '<style>body{font-family:system-ui,sans-serif;background:#0d100c;color:#e8dcc8;padding:20px;max-width:640px;margin:0 auto}'
        + 'h1{color:#c8a84b;font-size:20px;letter-spacing:.08em}table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}'
        + 'td,th{padding:6px 10px;border-bottom:1px solid #2a331f;text-align:right;font-size:14px}'
        + 'td:first-child,th:first-child{text-align:left}th{color:#8a9178;font-weight:600;font-size:12px;letter-spacing:.06em}'
        + '.tot{color:#c8a84b;font-weight:700}p{color:#8a9178;font-size:13px;line-height:1.5}</style>'
        + '<h1>PORTAL TRAFFIC</h1>'
        + '<p>Visits, counted once per browser session. Nothing about the visitor is stored: no address, no device, no cookie. '
        + 'The sticker column is everyone who came in through a QR code.</p>'
        + '<p class="tot">All time: ' + ((total.exists && total.data().hits) || 0) + ' visits</p>'
        + '<table><tr><th>day</th><th>visits</th>'
      for (const s of allSrcs) h += '<th>' + s + '</th>'
      h += '</tr>'
      for (const r of rows) {
        h += '<tr><td>' + r.d + '</td><td>' + r.hits + '</td>'
        for (const s of allSrcs) h += '<td>' + (r.src[s] || '') + '</td>'
        h += '</tr>'
      }
      h += '</table>'
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(h)
    } catch (e) {
      logger.error('[portalStats] %s', e && e.message)
      res.status(500).send('stats unavailable')
    }
  },
)
