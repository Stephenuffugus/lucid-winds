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
 *  - Discord ping budget: per-lane, 24/hour for humans and 6/hour for automated
 *    boot diagnostics, so machine chatter can never starve a real bug report;
 *    overflow still lands in Firestore, Stephen's channel never floods
 *  - every ping's outcome is written back to the doc as `ping` — a report that
 *    never reached Discord is now visible in the data instead of invisible
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

/* ⛔ SEPARATE BUDGETS (2026-07-31). One shared counter meant machine chatter
   (boot diagnostics) and a real player's bug report drew from the same 24/hr
   pool — the diagnostics could starve the thing Stephen actually reads. Each
   lane now has its own window, so a flood of boot reports can never silence a
   human. */
const pingWindows = { human: 0, bootlog: 0 }
const pingCounts = { human: 0, bootlog: 0 }
const PING_CAP = { human: 24, bootlog: 6 }

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

function pingBudgetOk(lane) {
  const now = Date.now()
  if (now - pingWindows[lane] > 60 * 60 * 1000) { pingWindows[lane] = now; pingCounts[lane] = 0 }
  return ++pingCounts[lane] <= PING_CAP[lane]
}

/* A redemption is not feedback, so it gets its own collection and its own line. Stephen
   asked for this to see WHICH channel a code came from: give every promo code its own
   word, post one per platform, and the pings tell you which platform actually converts. */
function isCode(b) { return String(b.kind || '') === 'code' }

/* Boot diagnostics are posted BY THE GAME, not by a person. They belong in their own
   drawer for the same reason redemptions do: Stephen triages `feedback` by hand and a
   machine report is not a player telling him something. */
function isBootlog(b) {
  return /bootlog/i.test(String(b.meta || '')) || /^BOOTLOG\b/.test(String(b.msg || ''))
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* \u26D4 THE SILENT HOLE (fixed 2026-07-31). This used to be a bare `fetch(...).catch()`.
   fetch does NOT reject on 4xx/5xx \u2014 so a dead webhook, a revoked token, or a 429
   resolved happily and the function logged plain success. Stephen lost a real bug
   report that way: the doc was in Firestore, the log said OK, and Discord never saw
   it, leaving nothing to debug from. Now: status is checked, failures are LOUD, 429
   and 5xx are retried, and the verdict is written back onto the document so the
   question "did this reach Discord?" is answerable months later. */
async function pingDiscord(doc) {
  const hook = process.env.DISCORD_FEEDBACK_WEBHOOK || ''
  if (!hook.startsWith('https://discord.com/api/webhooks/')) {
    logger.error('[swFeedback] DISCORD_FEEDBACK_WEBHOOK missing/malformed \u2014 ping skipped, report stored only')
    return 'no-webhook'
  }
  const lane = doc.kind === 'bootlog' ? 'bootlog' : 'human'
  if (!pingBudgetOk(lane)) {
    logger.warn('[swFeedback] %s ping budget spent this hour; stored only', lane)
    return 'budget-spent'
  }
  const lines = doc.kind === 'code'
    ? ['\uD83C\uDF9F **' + doc.code + '** redeemed in **' + doc.game + '** \u2192 ' + doc.msg]
    : doc.kind === 'bootlog'
      ? ['\uD83E\uDD7E **' + doc.game + '** boot diagnostic (automated)', doc.msg]
      : ['**' + doc.game + '** feedback', doc.msg]
  if (doc.contact) lines.push('_reply to: ' + doc.contact + '_')
  if (doc.meta) lines.push('`' + doc.meta + '`')
  const body = JSON.stringify({ content: lines.join('\n').slice(0, 1900) })

  for (let attempt = 1; attempt <= 3; attempt++) {
    let r
    try {
      r = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    } catch (e) {
      logger.warn('[swFeedback] discord ping network error (attempt %d): %s', attempt, e && e.message)
      if (attempt === 3) return 'network-error'
      await sleep(400 * attempt)
      continue
    }
    if (r.status >= 200 && r.status < 300) return 'ok'
    const text = await r.text().catch(() => '')
    if (r.status === 429) {
      // Discord tells us exactly how long to wait; respect it once, then give up.
      let waitMs = 1000
      try { const j = JSON.parse(text); if (j.retry_after) waitMs = Math.ceil(j.retry_after * 1000) } catch (e) {}
      logger.warn('[swFeedback] discord rate-limited, waiting %dms (attempt %d)', waitMs, attempt)
      if (attempt === 3) return 'rate-limited'
      await sleep(Math.min(waitMs, 5000))
      continue
    }
    if (r.status >= 500) {
      logger.warn('[swFeedback] discord %d (attempt %d)', r.status, attempt)
      if (attempt === 3) return 'discord-5xx'
      await sleep(500 * attempt)
      continue
    }
    // 4xx that is not a rate limit means the webhook is wrong/revoked. Shout \u2014 this is
    // the failure mode that silently ate a report, and it needs a human to fix it.
    logger.error('[swFeedback] discord REJECTED ping: %d %s', r.status, text.slice(0, 300))
    return 'http-' + r.status
  }
  return 'failed'
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
      const boot = !code && isBootlog(b)
      const doc = {
        game: String(b.game || 'unknown').slice(0, 40),
        msg,
        contact: String(b.contact || '').slice(0, MAX_CONTACT),
        meta: String(b.meta || '').slice(0, MAX_META),
        ua: String(req.get('user-agent') || '').slice(0, 300),
        at: FieldValue.serverTimestamp(),
      }
      if (code) { doc.kind = 'code'; doc.code = code }
      if (boot) doc.kind = 'bootlog'
      /* ⛔ Redemptions and boot diagnostics do NOT go in `feedback`. Stephen triages that
         collection by hand; burying a bug report under a hundred machine pings would be a
         bad trade for a counter. Same endpoint, same abuse armour, different drawer. */
      const collection = code ? 'codeRedemptions' : boot ? 'bootlog' : 'feedback'
      const ref = await getFirestore().collection(collection).add(doc)
      const ping = await pingDiscord(doc)
      // Written back so "did Stephen actually see this?" is answerable from the data alone.
      await ref.update({ ping, pingedAt: FieldValue.serverTimestamp() }).catch(() => {})
      logger.info('[swFeedback] %s %s [discord:%s]: %s', collection, doc.game, ping, msg.slice(0, 120))
      res.json({ ok: true })
    } catch (e) {
      logger.error('[swFeedback] failed', e)
      res.status(500).json({ ok: false, error: 'Server error' })
    }
  },
)
