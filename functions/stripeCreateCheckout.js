/**
 * stripeCreateCheckout — card checkout for the $3 Studio Supporter Pack.
 *
 * Mirrors nowCreateInvoice: auth required, server-priced, writes a webOrders
 * doc the client watches, returns a hosted checkout URL. Fulfillment lands via
 * stripeWebhook into the SAME sw_supporter flag the crypto rail uses.
 * Talks to Stripe with plain fetch (form-encoded) — no SDK dependency.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'

export const stripeCreateCheckout = onCall(
  { region: 'us-central1', secrets: ['STRIPE_SECRET_KEY'] },
  async (request) => {
    if (!request.auth || !request.auth.uid) {
      throw new HttpsError('unauthenticated', 'Sign in to buy.')
    }
    const uid = request.auth.uid
    const db = getFirestore()

    const vaultDoc = await db.collection('vaults').doc(uid).get()
    if (vaultDoc.exists && vaultDoc.data().sw_supporter) {
      throw new HttpsError('failed-precondition', 'You are already a supporter. Thank you!')
    }

    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      logger.error('[stripeCreateCheckout] STRIPE_SECRET_KEY not set')
      throw new HttpsError('failed-precondition', 'Card payments are not configured yet.')
    }

    const orderRef = db.collection('webOrders').doc()
    const orderId = orderRef.id
    const metadata = { type: 'supporter_pack' }
    await orderRef.set({
      uid,
      type: 'supporter_pack',
      metadata,
      usdCents: 300,
      usd: '3.00',
      gateway: 'stripe',
      status: 'created',
      createdAt: FieldValue.serverTimestamp(),
    })

    const form = new URLSearchParams()
    form.set('mode', 'payment')
    form.set('client_reference_id', orderId)
    form.set('line_items[0][quantity]', '1')
    form.set('line_items[0][price_data][currency]', 'usd')
    form.set('line_items[0][price_data][unit_amount]', '300')
    form.set('line_items[0][price_data][product_data][name]', 'Studio Supporter Pack')
    form.set('line_items[0][price_data][product_data][description]',
      'Every Jimothy costume and the full original soundtrack, on every device you sign into.')
    form.set('metadata[orderId]', orderId)
    form.set('metadata[uid]', uid)
    form.set('metadata[type]', 'supporter_pack')
    form.set('success_url', 'https://lucidwinds.com/satellites/stream-hop/?paid=1')
    form.set('cancel_url', 'https://lucidwinds.com/satellites/stream-hop/?paycancel=1')

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    })
    const sess = await resp.json()
    if (!resp.ok || !sess.url) {
      logger.error('[stripeCreateCheckout] session create failed: %j', sess.error || sess)
      await orderRef.set(
        { status: 'failed', error: (sess.error && sess.error.message) || 'session create failed' },
        { merge: true },
      )
      throw new HttpsError('internal', 'Could not start card checkout.')
    }

    await orderRef.set({ status: 'invoiced', sessionId: sess.id }, { merge: true })
    logger.info('[stripeCreateCheckout] order=%s uid=%s session=%s', orderId, uid, sess.id)
    return { ok: true, orderId, url: sess.url, usd: '3.00' }
  },
)
