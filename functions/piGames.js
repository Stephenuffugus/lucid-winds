/**
 * piGames — the Pi Network lane for the satellite games (TUMBLE first; Flock the World and Pixel Petri follow).
 * Plan: plans/pi/PI-GAMES-PLAN-OCT08.md.
 *
 * Each game is its OWN Pi app in the Developer Portal, on its own subdomain, with its own server API key held as
 * a Firebase secret. Prices live here, never on the client. There is no Firebase login in these games and Pi's
 * listing rules forbid any login but Pi's, so none of these calls needs request.auth:
 *   - approve/complete: the paymentId is the credential. Pi created it for THIS app, for ONE Pi user, and the
 *     server re reads it from Pi before every step (amount, metadata, user). Completing a stranger's payment only
 *     finishes the purchase that stranger already paid for.
 *   - status: the Pi access token is the credential, verified at GET /v2/me.
 *
 * Firestore (no client rule for either, so clients can neither read nor write them):
 *   piGamePayments/{paymentId}         { game, paymentId, piUid, sku, amount, memo, status, txid, ... }
 *   piGameOwners/{game}_{piUid}        { game, piUid, skus: { full: { paymentId, txid, at } }, updatedAt }
 *
 * Client protocol: plain fetch to the onCall URL with { data: {...} }; the answer is { result: {...} } or
 * { error: { message, status } }.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const PI_API = 'https://api.minepi.com'
const REGION = 'us-central1'

// One entry per Pi app. `secret` is the Firebase secret that holds that app's server API key
// (firebase functions:secrets:set PI_KEY_TUMBLE). Only ACTIVE games are deployed: a secret named in a function's
// options must exist before the deploy, so a game joins ACTIVE in the same change that sets its key.
export const GAMES = {
  tumble: { secret: 'PI_KEY_TUMBLE', name: 'TUMBLE', skus: { full: 8 } },
  flocktheworld: { secret: 'PI_KEY_FTW', name: 'Flock the World', skus: { full: 8 } },
  petri: { secret: 'PI_KEY_PETRI', name: 'Pixel Petri', skus: { full: 8 } },
}
export const ACTIVE = ['tumble']
const SECRETS = [...new Set(ACTIVE.map((k) => GAMES[k].secret))]
const OPTS = { region: REGION, cors: true, secrets: SECRETS, maxInstances: 5 }

const str = (v, max = 256) => (typeof v === 'string' && v.length > 0 && v.length <= max ? v : '')

function gameOf(data) {
  const key = str(data && data.game, 40)
  const g = GAMES[key]
  if (!g || !ACTIVE.includes(key)) throw new HttpsError('invalid-argument', 'Unknown game.')
  const apiKey = process.env[g.secret] || ''
  if (!apiKey) throw new HttpsError('failed-precondition', `Pi key for ${key} not configured.`)
  return { key, name: g.name, skus: g.skus, apiKey }
}

async function piCall(auth, path, method = 'GET', body) {
  const init = { method, headers: { Authorization: auth, 'Content-Type': 'application/json' } }
  if (body !== undefined) init.body = JSON.stringify(body)
  let res
  try {
    res = await fetch(PI_API + path, init)
  } catch (err) {
    throw new HttpsError('internal', `Pi network error: ${err.message}`)
  }
  const text = await res.text()
  let payload = {}
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = { raw: text } }
  }
  if (!res.ok) {
    const detail = payload.error_message || payload.error || payload.raw || ''
    const code = res.status === 404 ? 'not-found' : res.status === 401 ? 'unauthenticated' : 'internal'
    throw new HttpsError(code, `Pi ${method} ${path} → ${res.status} ${detail}`.trim())
  }
  return payload
}

const piGet = (g, path) => piCall(`Key ${g.apiKey}`, path)
const piPost = (g, path, body) => piCall(`Key ${g.apiKey}`, path, 'POST', body || {})
const payPath = (id) => `/v2/payments/${encodeURIComponent(id)}`

// The payment as Pi holds it, checked against THIS game's price table. Throws on any mismatch; an unapproved
// payment never moves a Pi, so a rejection here costs the player nothing.
async function checkedPayment(g, paymentId) {
  let p
  try {
    p = await piGet(g, payPath(paymentId))
  } catch (err) {
    logger.error('[piGames] Pi GET failed', g.key, paymentId, err.message)
    throw new HttpsError('not-found', 'Pi does not know this payment.')
  }
  const md = p.metadata || {}
  if (md.game !== g.key) throw new HttpsError('invalid-argument', 'This payment is for another app.')
  const price = g.skus[md.sku]
  if (price == null) throw new HttpsError('invalid-argument', `Nothing for sale called ${md.sku}.`)
  if (p.direction && p.direction !== 'user_to_app') throw new HttpsError('invalid-argument', 'Wrong payment direction.')
  // 1e-9 of slop: Pi amounts are decimals
  if (!(Number(p.amount) + 1e-9 >= price)) throw new HttpsError('failed-precondition', 'Payment amount is below the price.')
  if (!p.user_uid) throw new HttpsError('failed-precondition', 'Payment has no user.')
  return { p, sku: md.sku, price }
}

/** Phase I: the dialog is open on the phone, Pi waits for our yes. */
export const piGameApprove = onCall(OPTS, async (request) => {
  const g = gameOf(request.data)
  const paymentId = str(request.data && request.data.paymentId)
  if (!paymentId) throw new HttpsError('invalid-argument', 'paymentId is required.')
  const { p, sku } = await checkedPayment(g, paymentId)
  const db = getFirestore()
  const ref = db.collection('piGamePayments').doc(paymentId)
  // the record goes down BEFORE Pi is told yes: a lost record after an approve would strand the payment
  await ref.set(
    {
      game: g.key, paymentId, piUid: p.user_uid, sku, amount: p.amount ?? null, memo: p.memo ?? null,
      network: p.network ?? null, status: 'approved', createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
  try {
    await piPost(g, payPath(paymentId) + '/approve')
  } catch (err) {
    logger.error('[piGames] approve failed', g.key, paymentId, err.message)
    await ref.set({ status: 'approve_failed', errorAt: FieldValue.serverTimestamp() }, { merge: true })
    throw new HttpsError('internal', 'Pi approve failed; please try again.')
  }
  logger.info('[piGames] approved %s %s uid=%s sku=%s', g.key, paymentId, p.user_uid, sku)
  return { ok: true, paymentId }
})

/** Phase III: the player signed and sent the Pi. Pi verifies the chain in /complete; only a 200 there grants. */
export const piGameComplete = onCall(OPTS, async (request) => {
  const g = gameOf(request.data)
  const paymentId = str(request.data && request.data.paymentId)
  const txidIn = str(request.data && request.data.txid, 128)
  if (!paymentId) throw new HttpsError('invalid-argument', 'paymentId is required.')
  const db = getFirestore()
  const ref = db.collection('piGamePayments').doc(paymentId)
  const doc = await ref.get()
  let rec = doc.exists ? doc.data() : null
  if (rec && rec.game !== g.key) throw new HttpsError('permission-denied', 'This payment belongs to another app.')
  if (rec && rec.status === 'completed') return { ok: true, paymentId, alreadyCompleted: true, owned: [rec.sku] }
  // the payment as Pi holds it now: checked again, and it is where the txid lives if the client lost it
  const { p, sku } = await checkedPayment(g, paymentId)
  if (!rec) {
    // approved on Pi (an incomplete payment found at sign in) but our record never landed: rebuild it from Pi
    if (!(p.status && p.status.developer_approved)) throw new HttpsError('failed-precondition', 'Payment was never approved.')
    rec = { game: g.key, paymentId, piUid: p.user_uid, sku, amount: p.amount ?? null, memo: p.memo ?? null, status: 'approved' }
    await ref.set({ ...rec, createdAt: FieldValue.serverTimestamp(), rebuilt: true }, { merge: true })
  }
  if (rec.status !== 'approved') throw new HttpsError('failed-precondition', `Payment is ${rec.status}; expected approved.`)
  const chainTx = p.transaction && p.transaction.txid
  const txid = txidIn || chainTx || ''
  if (!txid) throw new HttpsError('failed-precondition', 'No transaction yet.')
  if (chainTx && txidIn && chainTx !== txidIn) throw new HttpsError('invalid-argument', 'Transaction id does not match.')
  await ref.set({ txid }, { merge: true })
  try {
    await piPost(g, payPath(paymentId) + '/complete', { txid })
  } catch (err) {
    logger.error('[piGames] complete failed', g.key, paymentId, err.message)
    throw new HttpsError('internal', 'Pi complete failed; please try again.')
  }
  const ownerRef = db.collection('piGameOwners').doc(`${g.key}_${rec.piUid}`)
  await db.runTransaction(async (tx) => {
    const cur = await tx.get(ref)
    if (cur.exists && cur.data().status === 'completed') return
    tx.set(
      ownerRef,
      { game: g.key, piUid: rec.piUid, skus: { [sku]: { paymentId, txid, at: FieldValue.serverTimestamp() } }, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    )
    tx.set(ref, { status: 'completed', completedAt: FieldValue.serverTimestamp() }, { merge: true })
  })
  logger.info('[piGames] completed %s %s uid=%s sku=%s', g.key, paymentId, rec.piUid, sku)
  return { ok: true, paymentId, alreadyCompleted: false, owned: [sku] }
})

/** What this Pi user owns in this game. The token is verified with Pi; the uid is app scoped. */
export const piGameStatus = onCall(OPTS, async (request) => {
  const g = gameOf(request.data)
  const token = str(request.data && request.data.accessToken, 4096)
  if (!token) throw new HttpsError('invalid-argument', 'accessToken is required.')
  let me
  try {
    me = await piCall(`Bearer ${token}`, '/v2/me')
  } catch (err) {
    logger.warn('[piGames] /me failed', g.key, err.message)
    throw new HttpsError('unauthenticated', 'Pi did not accept that sign in.')
  }
  if (!me || !me.uid) throw new HttpsError('unauthenticated', 'Pi returned no user.')
  const doc = await getFirestore().collection('piGameOwners').doc(`${g.key}_${me.uid}`).get()
  const owned = doc.exists ? Object.keys(doc.data().skus || {}) : []
  return { ok: true, owned, username: me.username || null, prices: g.skus }
})
