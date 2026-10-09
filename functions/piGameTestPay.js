/**
 * piGameTestPay — App to User payments of TEST Pi from a game's Testnet app to the Pioneers who signed in there.
 * Plan: plans/pi/PI-GAMES-PLAN-OCT08.md §11.
 *
 * Why it exists: Pi grants a Mainnet app wallet only after "the paired Testnet app" has made App to User
 * transactions to 5 unique wallets. A solo developer cannot clear that with one phone, so the Testnet copy of the
 * game (tumble-test.lucidwinds.com) records every Pioneer who signs in (piGames.js, piGameTesters) and this
 * function pays each of them a little test Pi, once. Test Pi has no value; the wallet it comes from holds nothing
 * else.
 *
 * Trigger: a POST with the shared admin token (never from the game), e.g. from Stephen's terminal:
 *   curl -s -X POST https://us-central1-focus-grove-fffa8.cloudfunctions.net/piGameTestPay \
 *     -H 'content-type: application/json' \
 *     -d '{"data":{"token":"<PI_ADMIN_TOKEN>","game":"tumble-test","amount":1}}'
 *
 * Secrets (firebase functions:secrets:set ...):
 *   PI_KEY_TUMBLE_TEST     the TESTNET app's server API key (App Configuration → API Key on the Testnet app)
 *   PI_TEST_WALLET_SEED    the generated app wallet's secret: either its S... secret key or its 24 word passphrase
 *                          (Tumble's Testnet app; Pixel Petri's is PI_TEST_WALLET_SEED_PETRI: GAMES[*].seedSecret)
 *   PI_ADMIN_TOKEN         any long random string; the trigger must carry it
 *
 * Safety: the seed is turned into a keypair and its PUBLIC key must equal the wallet address Pi showed in the portal
 * (GAMES[game].wallet). A wrong seed or a wrong derivation path pays nobody and says so.
 *
 * The Pi flow (pi-backend, Pi's own library): createPayment (Pi reserves it and names the recipient's address)
 * → submitPayment (we sign and send the transaction on Pi Testnet; the library picks the network from the payment)
 * → completePayment. The paymentId is stored BEFORE the submit, as Pi's README says, so a crash never pays twice.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { timingSafeEqual } from 'node:crypto'
import piBackend from 'pi-backend'
import * as bip39 from 'bip39'
import hdKey from 'ed25519-hd-key'
import StellarSdk from 'stellar-sdk'
import { GAMES } from './piGames.js'

const PiNetwork = piBackend.default || piBackend
const { Keypair } = StellarSdk
const PI_WALLET_PATH = "m/44'/314159'/0'"   // Pi's wallet derivation path (314159 is Pi's coin type)
// one API key and one app wallet seed per Testnet app (GAMES[*].secret / .seedSecret), plus the admin token
const SECRETS = ['PI_KEY_TUMBLE_TEST', 'PI_TEST_WALLET_SEED', 'PI_KEY_PETRI_TEST', 'PI_TEST_WALLET_SEED_PETRI', 'PI_ADMIN_TOKEN']

function sameToken(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''))
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y)
}

/** An S... secret key, or a 12/24 word passphrase, to a Stellar keypair. */
export function keypairFromSeed(seed) {
  const s = String(seed || '').trim()
  if (/^S[A-Z2-7]{55}$/.test(s)) return Keypair.fromSecret(s)
  const words = s.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length !== 12 && words.length !== 24) throw new Error('The wallet seed is neither an S key nor a 12 or 24 word passphrase.')
  const mnemonic = words.join(' ')
  if (!bip39.validateMnemonic(mnemonic)) throw new Error('The passphrase is not a valid word list.')
  const hex = bip39.mnemonicToSeedSync(mnemonic).toString('hex')
  const { key } = hdKey.derivePath(PI_WALLET_PATH, hex)
  return Keypair.fromRawEd25519Seed(key)
}

export const piGameTestPay = onCall({ region: 'us-central1', cors: true, secrets: SECRETS, maxInstances: 1, timeoutSeconds: 540 }, async (request) => {
  const d = request.data || {}
  if (!sameToken(d.token, process.env.PI_ADMIN_TOKEN)) throw new HttpsError('permission-denied', 'No.')
  const key = typeof d.game === 'string' ? d.game : ''
  const g = GAMES[key]
  if (!g || !g.testnet || !g.wallet || !g.seedSecret) throw new HttpsError('invalid-argument', 'Not a Testnet game with an app wallet.')
  const apiKey = process.env[g.secret] || ''
  if (!apiKey) throw new HttpsError('failed-precondition', `${g.secret} is not set.`)
  const amount = Number.isFinite(Number(d.amount)) && Number(d.amount) > 0 ? Math.min(Number(d.amount), 5) : 1
  const dryRun = d.dryRun === true

  let kp
  try { kp = keypairFromSeed(process.env[g.seedSecret]) } catch (e) { throw new HttpsError('failed-precondition', e.message) }
  if (kp.publicKey() !== g.wallet) {
    logger.error('[piGameTestPay] seed does not match the app wallet: derived %s, expected %s', kp.publicKey(), g.wallet)
    throw new HttpsError('failed-precondition', `The seed derives ${kp.publicKey()}, not the app wallet ${g.wallet}. Nobody was paid.`)
  }

  const db = getFirestore()
  const col = db.collection('piGameTesters')
  let targets
  if (Array.isArray(d.uids) && d.uids.length) {
    targets = d.uids.filter((u) => typeof u === 'string' && u.length < 128).map((uid) => ({ id: `${key}_${uid}`, uid }))
  } else {
    const snap = await col.where('game', '==', key).get()
    targets = snap.docs.filter((x) => !(x.data().paid)).map((x) => ({ id: x.id, uid: x.data().uid, username: x.data().username }))
  }
  const report = { game: key, wallet: g.wallet, amount, dryRun, paid: [], skipped: [], failed: [] }
  if (dryRun) { report.skipped = targets.map((t) => t.uid); return report }

  const pi = new PiNetwork(apiKey, kp.secret())
  // Pi allows one open App to User payment at a time: settle any leftover first
  try {
    const open = await pi.getIncompleteServerPayments()
    for (const p of open || []) {
      if (p.transaction && p.transaction.txid) await pi.completePayment(p.identifier, p.transaction.txid)
      else await pi.cancelPayment(p.identifier)
      logger.warn('[piGameTestPay] settled a leftover payment %s', p.identifier)
    }
  } catch (e) { logger.warn('[piGameTestPay] incomplete check failed: %s', e.message) }

  for (const t of targets) {
    const ref = col.doc(t.id)
    try {
      const cur = await ref.get()
      if (cur.exists && cur.data().paid) { report.skipped.push(t.uid); continue }
      const paymentId = await pi.createPayment({ amount, memo: 'Thank you for testing TUMBLE', metadata: { game: key, kind: 'tester' }, uid: t.uid })
      await ref.set({ game: key, uid: t.uid, paymentId, paying: true, payStartedAt: FieldValue.serverTimestamp() }, { merge: true })
      const txid = await pi.submitPayment(paymentId)
      await ref.set({ txid }, { merge: true })
      const dto = await pi.completePayment(paymentId, txid)
      const ok = !!(dto && dto.status && dto.status.developer_completed)
      await ref.set({ paid: ok, paying: false, paidAt: FieldValue.serverTimestamp(), toAddress: dto && dto.to_address ? dto.to_address : null }, { merge: true })
      if (ok) report.paid.push({ uid: t.uid, txid, to: dto.to_address || null })
      else report.failed.push({ uid: t.uid, why: 'not marked completed by Pi' })
      logger.info('[piGameTestPay] paid %s %s tx %s', key, t.uid, txid)
    } catch (e) {
      logger.error('[piGameTestPay] %s failed: %s', t.uid, e.message)
      report.failed.push({ uid: t.uid, why: String(e.message || e).slice(0, 200) })
      await ref.set({ paying: false, lastError: String(e.message || e).slice(0, 300) }, { merge: true }).catch(() => {})
    }
  }
  return report
})
