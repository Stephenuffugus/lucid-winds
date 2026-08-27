/**
 * Lucid Winds — Pi payment APPROVE handler.
 *
 * Client flow (Pi SDK v2):
 *   Pi.createPayment(...).onReadyForServerApproval = (paymentId) => callApprove
 *
 * Client call (httpsCallable, v2 onCall):
 *   const fn = httpsCallable(functions, 'piApprove')
 *   await fn({ paymentId })
 *
 * What this does:
 *   1. Verify Firebase Auth context (v2 onCall does this automatically — request.auth)
 *   2. Look up the payment on Pi's server (GET /v2/payments/{paymentId}) to confirm it exists
 *      and to read its metadata (server-side source of truth, not client-trusted)
 *   3. Create / update piTransactions/{paymentId} in Firestore as { uid, paymentId, amount,
 *      memo, metadata, status: 'approved', createdAt }
 *   4. POST /v2/payments/{paymentId}/approve to Pi's API with the server key
 *   5. Return { ok: true, paymentId } to client
 *
 * Errors:
 *   - unauthenticated      — caller has no Firebase auth context
 *   - failed-precondition  — Pi server key not configured
 *   - not-found            — Pi server does not know this paymentId
 *   - internal             — Pi API call failed
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { piGet, piPost, getPiServerKey } from './piClient.js'
import { piExpectedPrice } from './fulfill.js'

export const piApprove = onCall(
  { region: 'us-central1', secrets: ['PI_SERVER_KEY'] },
  async (request) => {
    // 1. Auth check — onCall populates request.auth from the Firebase ID token
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required to approve a Pi payment.')
    }
    const uid = request.auth.uid

    const paymentId = request.data && request.data.paymentId
    if (!paymentId || typeof paymentId !== 'string') {
      throw new HttpsError('invalid-argument', 'paymentId is required.')
    }

    // 2. Ensure server key configured (will throw failed-precondition if not)
    getPiServerKey()

    logger.info('[piApprove] uid=%s paymentId=%s', uid, paymentId)

    // 3. Look up payment on Pi's server (source of truth for amount/memo/metadata)
    let piPayment
    try {
      piPayment = await piGet(`/v2/payments/${encodeURIComponent(paymentId)}`)
    } catch (err) {
      logger.error('[piApprove] Pi GET failed', err)
      throw new HttpsError('not-found', `Pi payment ${paymentId} not found.`)
    }

    // 3b. PRICE CHECK — the hole was here: a payment's amount and metadata are
    //     chosen by the client, and this handler used to approve ANY amount for
    //     ANY product. Reject an unknown product, and reject a payment below the
    //     SERVER-DERIVED price, BEFORE approving (an unapproved payment never
    //     moves a single Pi, so the player is never charged for a rejection).
    //     Escalating slot tiers price off the vault, never the client's claim,
    //     so paying a cheap tier's price for an expensive slot is rejected too.
    const db = getFirestore()
    const md = piPayment.metadata || {}
    let vaultData = {}
    if (md.type === 'nursery_slot' || md.type === 'nursery_clipping_slot') {
      try {
        const vdoc = await db.collection('vaults').doc(uid).get()
        if (vdoc.exists) vaultData = vdoc.data() || {}
      } catch (e) { /* fall back to base counts (cheapest tier) on a read miss */ }
    }
    const expected = piExpectedPrice(md.type, md, vaultData)
    if (expected == null) {
      logger.warn('[piApprove] unknown/unsellable/maxed uid=%s type=%s tier=%s', uid, md.type, md.tier)
      throw new HttpsError('invalid-argument', `Product not available on Pi: ${md.type}`)
    }
    const paid = Number(piPayment.amount)
    // 1e-9 float slop — Pi amounts are decimals (Pi's own docs use 3.1415).
    if (!(paid + 1e-9 >= expected)) {
      logger.warn('[piApprove] underpay uid=%s type=%s paid=%s expected=%s', uid, md.type, paid, expected)
      throw new HttpsError('failed-precondition', 'Payment amount is below the product price.')
    }

    // 4. Write the approval record BEFORE calling Pi approve. If approve fails we still
    //    have a record we can reconcile against; if Firestore fails we never approved
    //    spuriously. (idempotent — set with merge so re-runs are safe.)
    await db.collection('piTransactions').doc(paymentId).set(
      {
        uid,
        paymentId,
        amount: piPayment.amount ?? null,
        memo: piPayment.memo ?? null,
        metadata: piPayment.metadata ?? {},
        status: 'approved',
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    // 5. Approve on Pi
    try {
      await piPost(`/v2/payments/${encodeURIComponent(paymentId)}/approve`, {})
    } catch (err) {
      logger.error('[piApprove] Pi approve POST failed', err)
      // Roll the doc back to a recognizable state so the client retry is clean
      await db.collection('piTransactions').doc(paymentId).set(
        { status: 'approve_failed', errorAt: FieldValue.serverTimestamp() },
        { merge: true },
      )
      throw new HttpsError('internal', 'Pi approve failed; please retry.')
    }

    return { ok: true, paymentId }
  },
)
