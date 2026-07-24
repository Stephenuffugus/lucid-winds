/**
 * swFeedback — anonymous drop-box for Sky Wolf games: player feedback, and (since
 * 2026-07-24) redeem-code pings.
 *
 * Public HTTP endpoint (testers should never need an account to report a bug).
 * Writes to the `feedback` collection via the Admin SDK — no Firestore rules
 * changes, clients can never read each other's messages.
 *
 * Abuse posture (this repo is PUBLIC, so assume the endpoint is known):
 *  - per-IP throttle: 4 posts per 10 minutes (in-memory per instance — a
 *    determined attacker can rotate IPs, but the casual spammer is boring)
 *  - duplicate drop: identical message from the same IP within an hour is
 *    swallowed silently (returns ok so scripts learn nothing)
 *  - Discord ping budget: 24 pings/hour globally; overflow still lands in
 *    Firestore, Stephen's channel never floods
 *  - the webhook URL lives ONLY in Secret Manager (the old one was hardcoded
 *    client-side + in this public repo and had to be rotated — never again)
 */
import crypto from 'node:crypto'
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'

const MAX_MSG = 2000
const MAX_META = 600
const MAX_CONTACT = 200

const ipHits = new Map()      // ip -> [timestamps]
const seen = new Map()        // hash(ip+msg) -> timestamp
let pingWindow = 0
let pingCount = 0

function throttled(ip) {
  const now = Date.now()
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  if (hits.length >= 4) { ipHits.set(ip, hits); return true }
  hits.push(now); ipHits.set(ip, hits)
  if (ipHits.size > 5000) ipHits.clear()   // bounded memory, coarse reset is fine
  return false
}

function isDuplicate(ip, msg) {
  const now = Date.now()
  const key = crypto.createHash('sha1').update(ip + '|' + msg).digest('hex')
  const last = seen.get(key)
  seen.set(key, now)
  if (seen.size > 5000) seen.clear()
  return last && now - last < 60 * 60 * 1000
}

function pingBudgetOk() {
  const now = Date.now()
  if (now - pingWindow > 60 * 60 * 1000) { pingWindow = now; pingCount = 0 }
  return ++pingCount <= 24
}

/* A redemption is not feedback, so it gets its own collection and its own line. Stephen
   asked for this to see WHICH channel a code came from: give every promo code its own
   word, post one per platform, and the pings tell you which platform actually converts. */
function isCode(b) { return String(b.kind || '') === 'code' }

function pingDiscord(doc) {
  const hook = process.env.DISCORD_FEEDBACK_WEBHOOK || ''
  if (!hook.startsWith('https://discord.com/api/webhooks/')) return Promise.resolve()
  if (!pingBudgetOk()) { logger.info('[swFeedback] ping budget spent; stored only'); return Promise.resolve() }
  const lines = doc.kind === 'code'
    ? ['\uD83C\uDF9F **' + doc.code + '** redeemed in **' + doc.game + '** \u2192 ' + doc.msg]
    : ['**' + doc.game + '** feedback', doc.msg]
  if (doc.contact) lines.push('_reply to: ' + doc.contact + '_')
  if (doc.meta) lines.push('`' + doc.meta + '`')
  return fetch(hook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n').slice(0, 1900) }),
  }).catch((e) => logger.warn('[swFeedback] discord ping failed', e))
}

export const swFeedback = onRequest(
  { region: 'us-central1', cors: true, secrets: ['DISCORD_FEEDBACK_WEBHOOK'] },
  async (req, res) => {
    if (req.method === 'OPTIONS') { res.status(204).send(''); return }
    if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return }
    try {
      const ip = String(req.headers['x-forwarded-for'] || req.ip || '?').split(',')[0].trim()
      const b = req.body || {}
      const msg = String(b.msg || '').slice(0, MAX_MSG).trim()
      if (msg.length < 2) { res.status(400).json({ ok: false, error: 'Empty message' }); return }
      if (throttled(ip)) { res.status(429).json({ ok: false, error: 'Slow down a little.' }); return }
      if (isDuplicate(ip, msg)) { res.json({ ok: true }); return }   // swallowed, silently
      const code = isCode(b) ? String(b.code || '').slice(0, 40).toUpperCase() : ''
      const doc = {
        game: String(b.game || 'unknown').slice(0, 40),
        msg,
        contact: String(b.contact || '').slice(0, MAX_CONTACT),
        meta: String(b.meta || '').slice(0, MAX_META),
        ua: String(req.get('user-agent') || '').slice(0, 300),
        at: FieldValue.serverTimestamp(),
      }
      if (code) { doc.kind = 'code'; doc.code = code }
      /* ⛔ Redemptions do NOT go in `feedback`. Stephen triages that collection by hand;
         burying a bug report under a hundred code pings would be a bad trade for a
         counter. Same endpoint, same abuse armour, different drawer. */
      await getFirestore().collection(code ? 'codeRedemptions' : 'feedback').add(doc)
      await pingDiscord(doc)
      logger.info('[swFeedback] %s %s: %s', code ? 'code' : 'feedback', doc.game, msg.slice(0, 120))
      res.json({ ok: true })
    } catch (e) {
      logger.error('[swFeedback] failed', e)
      res.status(500).json({ ok: false, error: 'Server error' })
    }
  },
)
