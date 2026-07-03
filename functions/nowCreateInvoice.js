/**
 * Lucid Winds — WEB crypto rail: create a NOWPayments invoice.
 *
 * This is the open-web / installed-PWA counterpart to the Pi rail. A signed-in
 * web visitor (NOT in Pi Browser) taps "Buy", we price the product in USD
 * SERVER-SIDE, open a webOrders/{orderId} record, ask NOWPayments to create a
 * hosted invoice (payable in ~300 coins at the live USD rate), and hand the
 * checkout URL back to the client. Fulfillment happens later, asynchronously,
 * in nowIpn (the HMAC-verified webhook) — never here.
 *
 * Client flow (httpsCallable, v2 onCall):
 *   const fn = firebase.functions().httpsCallable('nowCreateInvoice')
 *   const { data } = await fn({ type:'slot', tier:null, qty:1 })
 *   // data = { ok:true, orderId, invoiceUrl, usd:'1.00' }
 *   window.open(data.invoiceUrl, '_blank')   // then poll webOrders/{orderId}
 *
 * Security:
 *   - Auth required; uid comes from request.auth (never the client body).
 *   - USD price is recomputed from ./fulfill.js LW_WEB_PRICES; the client
 *     cannot set its own price.
 *   - The order is created server-side with status:'created' before the
 *     invoice call; the IPN later flips it to 'completed' under HMAC.
 *
 * Errors:
 *   unauthenticated   — no Firebase auth
 *   invalid-argument  — unknown product / bad tier / qty out of range
 *   internal          — NOWPayments unreachable or returned no invoice URL
 *
 * Secret: NOWPAYMENTS_API_KEY (set via `firebase functions:secrets:set`).
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { resolveWebPrice, LW_WEB_PRICES } from './fulfill.js'

const NOW_API = 'https://api.nowpayments.io/v1'
// Public HTTPS endpoint of the nowIpn function. Region + project are fixed for
// this app (focus-grove-fffa8 / us-central1); override via env for emulator.
const IPN_CALLBACK_URL =
  process.env.NOW_IPN_URL ||
  'https://us-central1-focus-grove-fffa8.cloudfunctions.net/nowIpn'

export const nowCreateInvoice = onCall(
  { region: 'us-central1', secrets: ['NOWPAYMENTS_API_KEY'] },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in to buy.')
    }
    const uid = request.auth.uid
    const d = request.data || {}
    const type = d.type ? String(d.type) : ''
    const tier = d.tier ? String(d.tier) : null

    const db = getFirestore()

    // Per-slot escalating products (nursery / clipping) are priced by the
    // buyer's ACTUAL next slot, derived from the vault here — never from a
    // client-claimed slot number (which could undercut the escalation).
    const spec = LW_WEB_PRICES[type]
    let slotIndex = null
    if (spec && spec.perSlot) {
      const vaultDoc = await db.collection('vaults').doc(uid).get()
      const cur = Number((vaultDoc.exists && vaultDoc.data()[spec.countField]) || spec.base)
      slotIndex = cur + 1
    }

    // Bloom bundles: ownership is server-derived from the vault. Owning full
    // blocks both; owning half re-prices full to the $5 completion.
    let halfOwned = false
    if (type === 'half_bloom' || type === 'full_bloom') {
      const vaultDoc = await db.collection('vaults').doc(uid).get()
      const vd = (vaultDoc.exists && vaultDoc.data()) || {}
      if (vd.lw_full_bloom) {
        throw new HttpsError('failed-precondition', 'You already own the Full Bloom upgrade.')
      }
      if (type === 'half_bloom' && vd.lw_half_bloom) {
        throw new HttpsError('failed-precondition', 'You already own the Half Bloom upgrade.')
      }
      halfOwned = !!vd.lw_half_bloom
    }

    // SERVER-SIDE price resolution. Throws on bad input / already-maxed slot.
    const priced = resolveWebPrice(type, { tier, slotIndex, halfOwned })
    const usd = (priced.cents / 100).toFixed(2)

    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) {
      logger.error('[nowCreateInvoice] NOWPAYMENTS_API_KEY not set')
      throw new HttpsError('failed-precondition', 'Web payments are not configured yet.')
    }

    const orderRef = db.collection('webOrders').doc()
    const orderId = orderRef.id

    // metadata mirrors exactly what applyFulfillment expects.
    const metadata = { type: priced.type || type }
    if (priced.tier) metadata.tier = priced.tier
    if (priced.qty && priced.qty > 1) metadata.qty = priced.qty

    await orderRef.set({
      uid,
      type: metadata.type,
      metadata,
      usdCents: priced.cents,
      usd,
      status: 'created',
      createdAt: FieldValue.serverTimestamp(),
    })

    // Create the hosted invoice. order_id ties the IPN back to our doc.
    let resp
    let body
    try {
      resp = await fetch(`${NOW_API}/invoice`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_amount: priced.cents / 100,
          price_currency: 'usd',
          order_id: orderId,
          order_description: priced.label + (priced.qty > 1 ? ` ×${priced.qty}` : ''),
          ipn_callback_url: IPN_CALLBACK_URL,
          is_fee_paid_by_user: true,
        }),
      })
      body = await resp.json().catch(() => ({}))
    } catch (err) {
      logger.error('[nowCreateInvoice] NOWPayments fetch failed', err)
      await orderRef.set({ status: 'invoice_failed' }, { merge: true })
      throw new HttpsError('internal', 'Payment processor unreachable. Try again.')
    }

    if (!resp.ok || !body || !body.invoice_url) {
      logger.error('[nowCreateInvoice] NOWPayments error status=%s body=%j', resp && resp.status, body)
      await orderRef.set({ status: 'invoice_failed' }, { merge: true })
      throw new HttpsError('internal', 'Could not create the invoice. Try again.')
    }

    await orderRef.set(
      { status: 'invoiced', invoiceId: String(body.id || ''), invoiceUrl: String(body.invoice_url) },
      { merge: true },
    )

    logger.info('[nowCreateInvoice] uid=%s order=%s type=%s usd=%s', uid, orderId, metadata.type, usd)

    return { ok: true, orderId, invoiceUrl: body.invoice_url, usd }
  },
)
