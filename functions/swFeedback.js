/**
 * swFeedback — anonymous player feedback drop-box for Sky Wolf satellite games.
 *
 * Public HTTP endpoint (no auth: testers should never need an account to tell
 * us something is broken). Writes to the `feedback` collection via the Admin
 * SDK, so no Firestore rules changes are needed and clients can never read
 * each other's messages. Hard caps on field sizes keep abuse boring.
 */
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'

const MAX_MSG = 2000
const MAX_META = 600
const MAX_CONTACT = 200

// Stephen's existing feedback channel — same webhook the main game's feedback
// button uses (index.html LW_FEEDBACK_WEBHOOK). Delivery is fire-and-forget:
// Discord being down must never lose the Firestore copy.
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1493357288147390574/XaFvrgDn3JhFfT3VxdNfiGAd_GY0LCbd-Qb1ve5Cxl9dXPZ-dBdMUbQgySqeaEdifC3w'

function pingDiscord(doc) {
  const lines = ['**' + doc.game + '** feedback', doc.msg]
  if (doc.contact) lines.push('_reply to: ' + doc.contact + '_')
  if (doc.meta) lines.push('`' + doc.meta + '`')
  return fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n').slice(0, 1900) }),
  }).catch((e) => logger.warn('[swFeedback] discord ping failed', e))
}

export const swFeedback = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only' }); return }
  try {
    const b = req.body || {}
    const msg = String(b.msg || '').slice(0, MAX_MSG).trim()
    if (!msg) { res.status(400).json({ ok: false, error: 'Empty message' }); return }
    const doc = {
      game: String(b.game || 'unknown').slice(0, 40),
      msg,
      contact: String(b.contact || '').slice(0, MAX_CONTACT),
      meta: String(b.meta || '').slice(0, MAX_META),
      ua: String(req.get('user-agent') || '').slice(0, 300),
      at: FieldValue.serverTimestamp(),
    }
    await getFirestore().collection('feedback').add(doc)
    await pingDiscord(doc)
    logger.info('[swFeedback] %s: %s', doc.game, msg.slice(0, 120))
    res.json({ ok: true })
  } catch (e) {
    logger.error('[swFeedback] failed', e)
    res.status(500).json({ ok: false, error: 'Server error' })
  }
})
