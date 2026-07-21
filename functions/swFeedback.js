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
    logger.info('[swFeedback] %s: %s', doc.game, msg.slice(0, 120))
    res.json({ ok: true })
  } catch (e) {
    logger.error('[swFeedback] failed', e)
    res.status(500).json({ ok: false, error: 'Server error' })
  }
})
