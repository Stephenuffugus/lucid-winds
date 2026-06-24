/**
 * Lucid Winds — WEB crypto rail: NOWPayments IPN (webhook).
 *
 * NOWPayments POSTs payment-status updates here. We:
 *   1. Verify the x-nowpayments-sig HMAC-SHA512 over the sorted JSON body
 *      (their documented scheme) against NOWPAYMENTS_IPN_SECRET. Reject
 *      anything unsigned or mismatched — this is the trust boundary.
 *   2. Load webOrders/{order_id}.
 *   3. On a terminal-success status (finished / confirmed), in ONE Firestore
 *      transaction: guard against underpayment, call the SHARED
 *      applyFulfillment(tx, db, uid, metadata) — same entitlement logic the
 *      Pi rail uses — and stamp the order 'completed'. Idempotent: a re-fired
 *      IPN on an already-completed order is a no-op.
 *   4. On non-terminal statuses, record the latest status for audit and 200.
 *
 * We ALWAYS return 200 on a validly-signed request we understood (even if we
 * chose not to fulfill, e.g. underpaid/expired) so NOWPayments doesn't retry
 * forever; we return 4xx/5xx only on bad signature, missing order, or an
 * actual server error (which SHOULD be retried).
 *
 * Transaction ordering: read order doc → applyFulfillment reads+writes the
 * vault doc → write order doc. All reads precede all writes. Valid.
 *
 * Secret: NOWPAYMENTS_IPN_SECRET (set via `firebase functions:secrets:set`).
 */

import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import crypto from 'node:crypto'
import { applyFulfillment } from './fulfill.js'

// Statuses NOWPayments uses; we fulfill only on these terminal-success ones.
const SUCCESS_STATUSES = ['finished', 'confirmed']

/**
 * NOWPayments HMAC scheme: recursively sort object keys, JSON.stringify, then
 * HMAC-SHA512 with the IPN secret. Arrays keep order; only object keys sort.
 *
 * VERIFIED 2026-06-24 against NOWPayments' official docs (IPN setup help center):
 * their Node.js reference is
 *   crypto.createHmac('sha512', key).update(JSON.stringify(sortObject(params))).digest('hex')
 * and their Python reference uses json.dumps(msg, separators=(',',':'), sort_keys=True).
 * This matches us exactly: recursive key-sort + JSON.stringify (no spaces) + SHA-512 hex.
 * IPN payloads are flat scalar objects, so array handling never differs in practice.
 */
function sortDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortDeep)
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortDeep(obj[k])
        return acc
      }, {})
  }
  return obj
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch (e) {
    return false
  }
}

export const nowIpn = onRequest(
  { region: 'us-central1', secrets: ['NOWPAYMENTS_IPN_SECRET'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed')
      return
    }

    const secret = process.env.NOWPAYMENTS_IPN_SECRET
    if (!secret) {
      logger.error('[nowIpn] NOWPAYMENTS_IPN_SECRET not set')
      res.status(500).send('not configured')
      return
    }

    const sig = req.headers['x-nowpayments-sig']
    const payload = req.body || {}

    // Verify HMAC over the sorted JSON of the payload.
    const expected = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(sortDeep(payload)))
      .digest('hex')
    if (!timingSafeEqualHex(String(sig || ''), expected)) {
      logger.warn('[nowIpn] bad signature; order=%s', payload && payload.order_id)
      res.status(401).send('bad signature')
      return
    }

    const orderId = payload.order_id
    const status = String(payload.payment_status || '')
    if (!orderId) {
      res.status(400).send('missing order_id')
      return
    }

    const db = getFirestore()
    const orderRef = db.collection('webOrders').doc(String(orderId))

    try {
      await db.runTransaction(async (tx) => {
        const doc = await tx.get(orderRef)
        if (!doc.exists) {
          // Unknown order — signed but we have no record. Don't 500 (no retry
          // will help); log and accept.
          logger.warn('[nowIpn] order not found order=%s', orderId)
          return
        }
        const data = doc.data()
        if (data.status === 'completed') {
          // Idempotent: already fulfilled.
          return
        }

        const audit = {
          lastStatus: status,
          coin: payload.pay_currency || data.coin || null,
          amountCrypto: payload.actually_paid != null ? payload.actually_paid : (data.amountCrypto || null),
          updatedAt: FieldValue.serverTimestamp(),
        }

        if (SUCCESS_STATUSES.indexOf(status) !== -1) {
          // Underpayment guard: if NOWPayments reports an actually-paid amount
          // short of what was owed, do NOT fulfill — record and move on.
          const paid = Number(payload.actually_paid)
          const owed = Number(payload.pay_amount)
          if (owed && paid && paid < owed * 0.98) {
            logger.warn('[nowIpn] underpaid order=%s paid=%s owed=%s', orderId, paid, owed)
            tx.set(orderRef, { ...audit, status: 'underpaid' }, { merge: true })
            return
          }

          const fulfillment = await applyFulfillment(tx, db, data.uid, data.metadata || { type: data.type })
          tx.set(
            orderRef,
            { ...audit, status: 'completed', fulfillment, completedAt: FieldValue.serverTimestamp() },
            { merge: true },
          )
          logger.info('[nowIpn] fulfilled order=%s uid=%s type=%s', orderId, data.uid, data.type)
        } else {
          // Non-terminal (waiting/confirming/sending) or failure
          // (failed/expired/refunded): record status, don't grant.
          const failed = ['failed', 'expired', 'refunded'].indexOf(status) !== -1
          tx.set(orderRef, { ...audit, status: failed ? status : data.status }, { merge: true })
        }
      })
    } catch (err) {
      logger.error('[nowIpn] transaction error order=%s', orderId, err)
      res.status(500).send('error')
      return
    }

    res.status(200).send('ok')
  },
)
