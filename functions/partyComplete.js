/**
 * Whack Box — server-authoritative Sunbeam mint for a finished party game.
 *
 * Why this exists:
 *   Party games run on a HOST SCREEN that is just another browser. If the host
 *   could tell the server "give these six people sunbeams", then anybody with a
 *   host page could mint for anyone. So the host does not report amounts, and it
 *   does not report other people's earnings either. Each PLAYER'S OWN phone
 *   calls this for itself, with the room code and the game slug, and the server
 *   decides the amount.
 *
 * Client flow (from the shell, once cloud rooms are on):
 *   const fn = httpsCallable(functions, 'partyComplete')
 *   await fn({ code: 'AB3D', game: 'mothlight', place: 2, players: 5 })
 *
 * What this does:
 *   1. Verify Firebase Auth (anonymous is fine, that is what guests get).
 *   2. Validate the room code, the game slug against the shipped catalogue, and
 *      the room size.
 *   3. Refuse a second mint for the same player in the same room and game, which
 *      is what stops a phone replaying the call.
 *   4. Pay a FLAT participation amount to everybody, plus a small placing bonus.
 *      ⭐ Everybody is paid, winner and last alike. This is a social product and
 *      losers who get nothing do not come back. WHACKBOX_PLAN says this in as
 *      many words and it is not a tuning knob.
 *   5. Enforce a per-day party ceiling so a room left running all night is not
 *      an income stream.
 *
 * ⚠ NOT YET REACHABLE. Cloud rooms are dormant until the console setup in
 * PARTY_CLOUD_SETUP.md is done, so nothing calls this in production today. It is
 * written and deployable now so that switch-on is a five minute job rather than
 * a build. It has not been exercised against a live room.
 *
 * ⚖ AMOUNTS ARE STEPHEN'S CALL. The numbers below are a first proposal sized
 * against the fleet policy of 30 sunbeams per day per game, NOT an approved
 * economy. They are in one block at the top so changing them is one edit.
 *
 * Errors:
 *   unauthenticated    — no auth context
 *   invalid-argument   — bad code / unknown game / implausible room size
 *   already-exists     — this player already claimed this room and game
 *   resource-exhausted — daily party ceiling reached
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

/* ⚖ PROPOSAL, not approved economy. One block, one edit. */
const PLAY_AWARD = 12          // everybody who was in the room at the end
const PLACE_BONUS = [6, 4, 2]  // 1st, 2nd, 3rd, on top of PLAY_AWARD
const MAX_PARTY_PER_DAY = 60   // ceiling across ALL party titles in one day
const DAY_MS = 24 * 60 * 60 * 1000

/* The shipped catalogue. Kept here deliberately rather than trusted from the
   client: an unknown slug is a sign of a forged call, not a new game. Adding a
   title means adding it here too, and that is the intended friction. */
const GAMES = new Set([
  'mothlight', 'firefly', 'liftingfog', 'firstfrost', 'moongraft', 'samesoil'
])

export const partyComplete = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.')
    }
    const uid = request.auth.uid
    const data = request.data || {}

    const code = String(data.code || '').toUpperCase()
    if (!/^[A-Z0-9]{4}$/.test(code)) {
      throw new HttpsError('invalid-argument', 'code must be the four character room code.')
    }
    const game = String(data.game || '')
    if (!GAMES.has(game)) {
      throw new HttpsError('invalid-argument', 'unknown game.')
    }
    const players = Number(data.players)
    if (!Number.isInteger(players) || players < 2 || players > 8) {
      throw new HttpsError('invalid-argument', 'players must be between 2 and 8.')
    }
    const place = Number(data.place)
    if (!Number.isInteger(place) || place < 1 || place > players) {
      throw new HttpsError('invalid-argument', 'place must be a position in the room.')
    }

    const award = PLAY_AWARD + (PLACE_BONUS[place - 1] || 0)
    const db = getFirestore()
    const vaultRef = db.collection('vaults').doc(uid)
    /* one claim doc per player per room per game: the id IS the idempotency key,
       so a replayed call collides instead of paying twice */
    const claimRef = db.collection('vaults').doc(uid)
      .collection('partyClaims').doc(`${code}_${game}`)

    let result = null
    try {
      result = await db.runTransaction(async (tx) => {
        const claimSnap = await tx.get(claimRef)
        if (claimSnap.exists) {
          throw new HttpsError('already-exists', 'This room has already been claimed.')
        }

        const vaultSnap = await tx.get(vaultRef)
        const vault = vaultSnap.exists ? vaultSnap.data() : {}
        const ledger = vault.hashLedger || {}
        const now = Date.now()

        const dayStart = ledger.partyDayStart || 0
        const freshDay = now - dayStart > DAY_MS
        const spentToday = freshDay ? 0 : (ledger.partyDayTotal || 0)
        if (spentToday + award > MAX_PARTY_PER_DAY) {
          throw new HttpsError('resource-exhausted',
            'That is the party sunbeam ceiling for today. The games still play.')
        }

        tx.set(claimRef, {
          game, code, place, players, award,
          at: FieldValue.serverTimestamp()
        })
        tx.set(vaultRef, {
          hashLedger: {
            earned: FieldValue.increment(award),
            partyDayStart: freshDay ? now : dayStart,
            partyDayTotal: spentToday + award
          }
        }, { merge: true })

        return { award, dayTotal: spentToday + award }
      })
    } catch (err) {
      if (err instanceof HttpsError) throw err
      logger.error('partyComplete failed', { uid, code, game, err: String(err) })
      throw new HttpsError('internal', 'Could not record the party result.')
    }

    logger.info('partyComplete', { uid, code, game, place, players, award: result.award })
    return { ok: true, award: result.award, partyToday: result.dayTotal }
  }
)
