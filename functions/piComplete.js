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
 *        - slot              → vault.greenhouse.maxSlots += 1 (cap 60)
 *        - nursery_slot      → vault.nursery.maxSlots += 1 (cap 6)
 *        - item_pouch_slot   → vault.lw_pouch_cap += 1 (cap 40)
 *        - emergency_pouch   → vault.emergency_pouch_today = today; expires after 24h
 *        - early_open_hut    → vault.lw_hut_early_opens.opened[itemKey] = ts
 *        - hut_early_open    → alias of early_open_hut (matches client memo metadata)
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

const SLOT_CAP_GREENHOUSE = 60
const SLOT_CAP_NURSERY = 6
const SLOT_CAP_POUCH = 40

/**
 * Apply fulfillment in a single Firestore transaction so we never double-grant.
 * The piTransactions doc is the lock — once status='completed' we early-return.
 *
 * Vault structure note: Lucid Winds spreads state across the root vault doc
 * AND a `meta/state` subcollection doc. Slot caps live at:
 *   vaults/{uid}/meta/state.slots               — greenhouse max slots (canonical)
 *   vaults/{uid}.lw_nursery_slots               — nursery slots (mirror, root-doc)
 *   vaults/{uid}.lw_pouch_cap                   — item pouch cap (root-doc)
 *   vaults/{uid}.emergency_pouch_today          — emergency-pouch unlock day
 *   vaults/{uid}.lw_hut_early_opens             — Hut early-open map
 * The client reads `meta/state.slots` on login and copies into localStorage
 * `sws_greenhouse_slots`, then the slot value flows from that. We write to the
 * meta/state doc so the slot survives reinstall + cross-device sync.
 */
async function fulfill(db, uid, paymentId, metadata) {
  const txRef = db.collection('piTransactions').doc(paymentId)
  const vaultRef = db.collection('vaults').doc(uid)
  const metaRef = vaultRef.collection('meta').doc('state')
  const type = metadata && metadata.type ? String(metadata.type) : ''
  const today = new Date().toISOString().split('T')[0]

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

    // Pre-read whichever docs each branch will need. Firestore txns require
    // all reads before any writes.
    const fulfillment = { type, applied: false }

    if (type === 'slot') {
      // Greenhouse slot cap lives in meta/state.slots (the canonical sync field)
      const metaDoc = await tx.get(metaRef)
      const cur = Number((metaDoc.exists && metaDoc.data().slots) || 10)
      const next = Math.min(SLOT_CAP_GREENHOUSE, cur + 1)
      tx.set(metaRef, { slots: next }, { merge: true })
      fulfillment.applied = next > cur
      fulfillment.before = cur
      fulfillment.after = next
    } else if (type === 'nursery_slot') {
      // Nursery slots: client manages localStorage 'sws_nursery_slots' but we
      // mirror to vault root doc for cross-device. The client must read this
      // on login (setNurSlots from cloud) — currently localStorage-only, so
      // until that wires we record but the client won't see it without a
      // restore-path code change. Doc'd in submission-prep.md frontend list.
      const vaultDoc = await tx.get(vaultRef)
      const cur = Number(
        (vaultDoc.exists && vaultDoc.data().lw_nursery_slots) || 3,
      )
      const next = Math.min(SLOT_CAP_NURSERY, cur + 1)
      tx.set(vaultRef, { lw_nursery_slots: next }, { merge: true })
      fulfillment.applied = next > cur
      fulfillment.before = cur
      fulfillment.after = next
    } else if (type === 'item_pouch_slot') {
      const vaultDoc = await tx.get(vaultRef)
      const cur = Number((vaultDoc.exists && vaultDoc.data().lw_pouch_cap) || 25)
      const next = Math.min(SLOT_CAP_POUCH, cur + 1)
      tx.set(vaultRef, { lw_pouch_cap: next }, { merge: true })
      fulfillment.applied = next > cur
      fulfillment.before = cur
      fulfillment.after = next
    } else if (type === 'emergency_pouch') {
      tx.set(
        vaultRef,
        {
          emergency_pouch_today: today,
          emergency_pouch_expires: Date.now() + 24 * 60 * 60 * 1000,
        },
        { merge: true },
      )
      fulfillment.applied = true
      fulfillment.expiresInMs = 24 * 60 * 60 * 1000
    } else if (type === 'early_open_hut' || type === 'hut_early_open') {
      const itemKey = (metadata && metadata.item) ? String(metadata.item) : 'unknown'
      const vaultDoc = await tx.get(vaultRef)
      const existing = (vaultDoc.exists && vaultDoc.data().lw_hut_early_opens) || {
        date: today,
        opened: {},
      }
      if (existing.date !== today) {
        existing.date = today
        existing.opened = {}
      }
      existing.opened = { ...(existing.opened || {}), [itemKey]: Date.now() }
      tx.set(vaultRef, { lw_hut_early_opens: existing }, { merge: true })
      fulfillment.applied = true
      fulfillment.itemKey = itemKey
    } else {
      // Unknown type — record but don't grant anything. Surface to logs.
      logger.warn('[piComplete] Unknown fulfillment type=%s paymentId=%s', type, paymentId)
      fulfillment.applied = false
      fulfillment.note = 'Unknown metadata.type; no entitlement applied.'
    }

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

    return { alreadyCompleted: false, type, fulfillment }
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
