/**
 * Lucid Winds — Pi payment COMPLETE handler.
 *
 * Client flow (Pi SDK v2):
 *   Pi.createPayment(...).onReadyForServerCompletion = (paymentId, txid) => callComplete
 *
 * Client call (httpsCallable, v2 onCall):
 *   const fn = httpsCallable(functions, 'piComplete')
 *   await fn({ paymentId, txid })
 *
 * What this does:
 *   1. Verify Firebase Auth context
 *   2. Read piTransactions/{paymentId}; require status='approved' and uid match
 *   3. Re-fetch the payment from Pi to double-check amount/memo/metadata vs what was approved
 *   4. POST /v2/payments/{paymentId}/complete with { txid }
 *   5. Apply fulfillment to vaults/{uid} based on metadata.type:
 *        - slot                  → vault.greenhouse.maxSlots += 1 (cap 60)
 *        - nursery_slot          → vault.nursery.maxSlots += 1 (cap 6)
 *        - nursery_clipping_slot → vault.lw_nur_clipping_slots += 1 (cap 5)
 *        - item_pouch_slot       → vault.lw_pouch_cap += 1 (cap 40)
 *        - seed_pouch_slot       → vault.backpack.unlocks.{seed15|seed20} = true
 *        - emergency_pouch       → vault.emergency_pouch_today = today; expires after 24h
 *        - early_open_hut        → vault.lw_hut_early_opens.opened[itemKey] = ts
 *        - hut_early_open        → alias of early_open_hut (matches client memo metadata)
 *   6. Stamp piTransactions/{paymentId} as { status: 'completed', txid, completedAt }
 *   7. Return { ok: true, paymentId, fulfillment }
 *
 * Idempotency: a re-run on an already-completed paymentId returns ok without
 * double-granting (we early-return if status === 'completed').
 *
 * Errors:
 *   - unauthenticated      — no Firebase auth
 *   - permission-denied    — uid mismatch with approved record
 *   - failed-precondition  — payment not approved yet, or Pi server key missing
 *   - not-found            — paymentId never recorded in piTransactions
 *   - internal             — Pi complete POST failed (transaction stays approved, retry-safe)
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { piGet, piPost, getPiServerKey } from './piClient.js'
import { applyFulfillment } from './fulfill.js'

/**
 * Apply fulfillment in a single Firestore transaction so we never double-grant.
 * The piTransactions doc is the lock — once status='completed' we early-return.
 *
 * The per-type vault writes + caps live in the SHARED ./fulfill.js
 * applyFulfillment() so the Pi rail and the web (NOWPayments) rail can never
 * drift. This function only owns the Pi-specific idempotency lock: read the
 * piTransactions lock doc, call the shared fulfillment, stamp it 'completed'.
 *
 * Vault structure note: Lucid Winds spreads state across the root vault doc
 * AND a `meta/state` subcollection doc. Greenhouse slot cap is the canonical
 * meta/state.slots field; other entitlements live on the root vault doc. See
 * ./fulfill.js for the exact field map.
 */
async function fulfill(db, uid, paymentId, metadata) {
  const txRef = db.collection('piTransactions').doc(paymentId)

  return db.runTransaction(async (tx) => {
    const txDoc = await tx.get(txRef)
    if (!txDoc.exists) {
      throw new HttpsError('not-found', 'Transaction record vanished mid-flight.')
    }
    const txData = txDoc.data()
    if (txData.status === 'completed') {
      // Already fulfilled — return what was granted previously
      return {
        alreadyCompleted: true,
        type: txData.metadata?.type,
        fulfillment: txData.fulfillment || null,
      }
    }
    if (txData.uid !== uid) {
      throw new HttpsError('permission-denied', 'Transaction belongs to another user.')
    }

    // Shared entitlement logic. Reads the vault/meta doc its branch needs and
    // writes it — all before we stamp the lock doc below (reads-before-writes).
    const fulfillment = await applyFulfillment(tx, db, uid, metadata)

    tx.set(
      txRef,
      {
        status: 'completed',
        txid: txData.txid || null,
        fulfillment,
        completedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return { alreadyCompleted: false, type: fulfillment.type, fulfillment }
  })
}

export const piComplete = onCall(
  { region: 'us-central1', secrets: ['PI_SERVER_KEY'] },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required to complete a Pi payment.')
    }
    const uid = request.auth.uid

    const paymentId = request.data && request.data.paymentId
    const txid = request.data && request.data.txid
    if (!paymentId || typeof paymentId !== 'string') {
      throw new HttpsError('invalid-argument', 'paymentId is required.')
    }

    getPiServerKey()

    logger.info('[piComplete] uid=%s paymentId=%s txid=%s', uid, paymentId, txid || 'none')

    const db = getFirestore()

    // Read the approval record
    const txDoc = await db.collection('piTransactions').doc(paymentId).get()
    if (!txDoc.exists) {
      throw new HttpsError('not-found', 'No approval record for this payment.')
    }
    const txData = txDoc.data()
    if (txData.uid !== uid) {
      throw new HttpsError('permission-denied', 'This payment is not yours.')
    }

    // Idempotency early-out: a completed transaction is fine to re-call (sometimes Pi
    // calls onReadyForServerCompletion twice on retries). Just confirm and return.
    if (txData.status === 'completed') {
      return {
        ok: true,
        paymentId,
        alreadyCompleted: true,
        fulfillment: txData.fulfillment || null,
      }
    }

    if (txData.status !== 'approved') {
      throw new HttpsError(
        'failed-precondition',
        `Payment is in state ${txData.status}; expected 'approved'.`,
      )
    }

    // Defense-in-depth: re-fetch from Pi to confirm amount/memo/metadata weren't tampered
    let piPayment
    try {
      piPayment = await piGet(`/v2/payments/${encodeURIComponent(paymentId)}`)
    } catch (err) {
      logger.error('[piComplete] Pi GET failed', err)
      throw new HttpsError('internal', 'Could not verify payment with Pi server.')
    }

    // Stamp txid before calling complete — if complete fails we still know the txid
    if (txid) {
      await db.collection('piTransactions').doc(paymentId).set({ txid }, { merge: true })
    }

    // Tell Pi to finalize
    try {
      await piPost(`/v2/payments/${encodeURIComponent(paymentId)}/complete`, { txid })
    } catch (err) {
      logger.error('[piComplete] Pi complete POST failed', err)
      throw new HttpsError('internal', 'Pi complete failed; please retry.')
    }

    // Apply fulfillment with Pi-verified metadata (not what client claimed)
    const result = await fulfill(db, uid, paymentId, piPayment.metadata || txData.metadata || {})

    return {
      ok: true,
      paymentId,
      alreadyCompleted: result.alreadyCompleted,
      fulfillment: result.fulfillment,
    }
  },
)
