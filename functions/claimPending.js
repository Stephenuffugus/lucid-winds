/**
 * Lucid Winds — Server-authoritative pendingRewards claim.
 *
 * Why this exists:
 *   pendingRewards/{rewardId} sit under vaults/{uid}/pendingRewards/ and are
 *   created by OTHER players (harvest rewards when they tend or harvest your
 *   wild plant). The owner can read + delete them per firestore-rules-7.txt
 *   lines 226-236, but the credit-to-hashLedger step is server-only because
 *   hashLedger is locked by vaultServerFieldsImmutable() (rules-7 line 117).
 *
 *   Without this function, a claim flow requires the client to write into a
 *   field it cannot legally write. With this function, the client just calls
 *   claimPending() and the server atomically:
 *     1. Reads every pendingRewards doc owned by the caller.
 *     2. Sums hash + dew amounts (by type).
 *     3. Credits vaults/{uid}.hashLedger.earned and (future) dewLedger.earned.
 *     4. Deletes the consumed reward docs.
 *     5. Returns a summary so the client UI can toast.
 *
 *   The same atomic transaction prevents double-claim races between two
 *   devices the player has open.
 *
 * Client flow:
 *   const fn = httpsCallable(functions, 'claimPending')
 *   const res = await fn()                        // no input args
 *   // res.data === {
 *   //   ok: true,
 *   //   credited: { hashes: 12, dew: 4 },
 *   //   count: 3,                                 // claimed reward docs
 *   //   items: [                                  // detail for UI toast
 *   //     { type: 'hashes', amount: 8, plantName: 'Crimson Tide', grade: 'Rare' },
 *   //     { type: 'hashes', amount: 4, plantName: 'Foxglove Moon', grade: 'Common' },
 *   //     { type: 'dew',    amount: 4, plantName: 'Foxglove Moon', grade: 'Common' },
 *   //   ],
 *   //   balance: { earned: 1259, spent: 900 }     // new server-side ledger
 *   // }
 *
 * Errors:
 *   unauthenticated      — caller has no auth context
 *   resource-exhausted   — claim rate exceeds anti-automation heuristic
 *   internal             — Firestore transaction failed
 *
 * Notes:
 *   - amount cap per reward is 40 (enforced by Firestore rules on create);
 *     this function trusts rules to have already validated incoming docs.
 *   - dew credit is wired but the vault.dewLedger shape is still
 *     localStorage-canonical on the client. Server dew ledger lands when the
 *     Cloud Function migration plan ships earnDew / spendDew. Until then the
 *     dew portion is recorded in the result so the client can credit its
 *     local ledger, and the server stub increments the same field shape so
 *     the future migration is a no-op.
 *   - "unknown" type rewards are skipped (not deleted) so a typo doesn't
 *     burn a reward. They'll surface in a future audit pass.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const CLAIM_COOLDOWN_MS = 2 * 1000      // 2s between claim calls per uid — UI-tolerable, blocks scripted spam
const MAX_REWARDS_PER_CLAIM = 200       // safety ceiling; legit player rarely above ~20
const MAX_CREDIT_PER_CLAIM = 8000       // 200 rewards × 40 cap = 8000; mirrors rules-7 amount<=40

export const claimPending = onCall(
  { region: 'us-central1' },
  async (request) => {
    // 1. Auth
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.')
    }
    const uid = request.auth.uid

    const db = getFirestore()
    const vaultRef = db.collection('vaults').doc(uid)
    const pendingCol = vaultRef.collection('pendingRewards')

    // 2. Cooldown gate (best-effort; the real lock is the atomic transaction)
    try {
      const snap = await vaultRef.get()
      const vault = snap.exists ? (snap.data() || {}) : {}
      const lastClaimAt = vault.lastClaimAt || 0
      if (Date.now() - lastClaimAt < CLAIM_COOLDOWN_MS) {
        throw new HttpsError(
          'resource-exhausted',
          'Slow down — try again in a moment.',
        )
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err
      // Read failure is non-fatal; the atomic txn below is the real guard.
    }

    // 3. Read all pending rewards. We do this OUTSIDE the txn first because
    // Firestore transactions don't support collection queries (only doc-level
    // reads). The txn then re-fetches each doc to verify it still exists at
    // commit time, so a race with a concurrent delete is detected.
    let pendingDocs
    try {
      const pendingSnap = await pendingCol.limit(MAX_REWARDS_PER_CLAIM + 1).get()
      pendingDocs = pendingSnap.docs
    } catch (err) {
      logger.error('[claimPending] uid=%s pending query failed', uid, err)
      throw new HttpsError('internal', 'Could not read pending rewards.')
    }

    if (pendingDocs.length === 0) {
      return { ok: true, credited: { hashes: 0, dew: 0 }, count: 0, items: [], balance: null }
    }

    if (pendingDocs.length > MAX_REWARDS_PER_CLAIM) {
      // Process the first MAX; the remainder claims on next call. Better than
      // a hard error — a backed-up player should not be locked out.
      pendingDocs = pendingDocs.slice(0, MAX_REWARDS_PER_CLAIM)
    }

    // 4. Atomic transaction: re-read each doc to confirm it still exists,
    // sum the credits, write the ledger, delete the docs. If any doc has
    // been deleted/altered since the query, that doc is skipped and the
    // others still commit (idempotent claim).
    let result
    try {
      result = await db.runTransaction(async (tx) => {
        const items = []
        let hashCredit = 0
        let dewCredit = 0
        const toDelete = []

        for (const docSnap of pendingDocs) {
          const ref = pendingCol.doc(docSnap.id)
          const fresh = await tx.get(ref)
          if (!fresh.exists) continue   // raced with another claim/delete; skip

          const data = fresh.data() || {}
          const type = (data.type === 'hashes' || data.type === 'sunbeams') ? 'hashes'
                     : (data.type === 'dew') ? 'dew'
                     : 'unknown'
          if (type === 'unknown') continue  // leave for human audit

          const amount = Number(data.amount)
          if (!Number.isFinite(amount) || amount <= 0 || amount > 40) continue

          items.push({
            type,
            amount,
            plantName: typeof data.plantName === 'string' ? data.plantName.slice(0, 80) : '',
            grade: typeof data.grade === 'string' ? data.grade.slice(0, 32) : '',
          })
          if (type === 'hashes') hashCredit += amount
          else if (type === 'dew') dewCredit += amount
          toDelete.push(ref)
        }

        if (hashCredit + dewCredit > MAX_CREDIT_PER_CLAIM) {
          throw new HttpsError(
            'resource-exhausted',
            'Claim too large; contact support.',
          )
        }

        const vaultSnap = await tx.get(vaultRef)
        const vault = vaultSnap.exists ? (vaultSnap.data() || {}) : {}
        const ledger = vault.hashLedger || { earned: 0, spent: 0 }
        const dewLedger = vault.dewLedger || { earned: 0, spent: 0 }

        const newEarned = (ledger.earned || 0) + hashCredit
        const newDewEarned = (dewLedger.earned || 0) + dewCredit

        const balance = newEarned - (ledger.spent || 0)

        tx.set(
          vaultRef,
          {
            hashLedger: { earned: newEarned, spent: ledger.spent || 0 },
            dewLedger: { earned: newDewEarned, spent: dewLedger.spent || 0 },
            lastClaimAt: Date.now(),
            lastClaimCount: toDelete.length,
            lastClaimHashes: hashCredit,
            lastClaimDew: dewCredit,
          },
          { merge: true },
        )

        for (const ref of toDelete) tx.delete(ref)

        return {
          credited: { hashes: hashCredit, dew: dewCredit },
          count: toDelete.length,
          items,
          balance: { earned: newEarned, spent: ledger.spent || 0 },
          dewBalance: { earned: newDewEarned, spent: dewLedger.spent || 0 },
        }
      })
    } catch (err) {
      if (err instanceof HttpsError) throw err
      logger.error('[claimPending] uid=%s txn failed', uid, err)
      throw new HttpsError('internal', 'Claim failed; please retry.')
    }

    logger.info(
      '[claimPending] uid=%s count=%d hashes=%d dew=%d',
      uid, result.count, result.credited.hashes, result.credited.dew,
    )
    return { ok: true, ...result }
  },
)
