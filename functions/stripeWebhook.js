/**
 * stripeWebhook — Stripe event receiver for card purchases.
 *
 * Verifies the Stripe-Signature header (HMAC SHA-256 over `${t}.${rawBody}`
 * with the endpoint's whsec secret, constant-time compare, 10 min tolerance),
 * then on checkout.session.completed runs the SAME idempotent transaction
 * shape as nowIpn: load webOrders/{orderId}, applyFulfillment, stamp
 * completed. A replayed webhook is a no-op.
 */
import crypto from 'node:crypto'
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { applyFulfillment } from './fulfill.js'

function verifySig(rawBody, header, secret) {
  if (!header || !secret) return false
  const parts = { v1: [] }
  for (const kv of header.split(',')) {
    const i = kv.indexOf('=')
    if (i <= 0) continue
    const k = kv.slice(0, i).trim()
    const v = kv.slice(i + 1).trim()
    if (k === 'v1') parts.v1.push(v)
    else parts[k] = v
  }
  if (!parts.t || !parts.v1.length) return false
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 600) return false
  const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex')
  return parts.v1.some((v) => {
    try { return crypto.timingSafeEqual(Buffer.from(v), Buffer.from(expected)) } catch { return false }
  })
}

export const stripeWebhook = onRequest(
  { region: 'us-central1', secrets: ['STRIPE_WEBHOOK_SECRET'] },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('POST only'); return }
    const raw = req.rawBody ? req.rawBody.toString('utf8') : ''
    if (!verifySig(raw, req.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)) {
      logger.warn('[stripeWebhook] bad signature')
      res.status(400).send('bad signature')
      return
    }

    let event
    try { event = JSON.parse(raw) } catch { res.status(400).send('bad json'); return }
    if (event.type !== 'checkout.session.completed') { res.json({ received: true }); return }

    const sess = (event.data && event.data.object) || {}
    const orderId = (sess.metadata && sess.metadata.orderId) || sess.client_reference_id
    if (!orderId || sess.payment_status !== 'paid') { res.json({ received: true }); return }

    const db = getFirestore()
    const ref = db.collection('webOrders').doc(orderId)
    try {
      await db.runTransaction(async (tx) => {
        const doc = await tx.get(ref)
        if (!doc.exists) { logger.warn('[stripeWebhook] unknown order %s', orderId); return }
        const data = doc.data()
        if (data.status === 'completed') return // replayed webhook: no-op
        const fulfillment = await applyFulfillment(tx, db, data.uid, data.metadata)
        tx.set(ref, {
          status: 'completed',
          fulfillment,
          completedAt: FieldValue.serverTimestamp(),
          stripeEventId: event.id,
        }, { merge: true })
      })
      logger.info('[stripeWebhook] completed order=%s', orderId)
      res.json({ received: true })
    } catch (e) {
      logger.error('[stripeWebhook] transaction failed for %s', orderId, e)
      res.status(500).send('retry') // Stripe retries on 5xx
    }
  },
)
