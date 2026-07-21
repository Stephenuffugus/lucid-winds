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
    const kind = (request.data && request.data.kind) === 'donation' ? 'donation' : 'supporter_pack'
    // gift tiers are a server-side whitelist — the client never names its own price
    const DONATION_TIERS = [500, 1000, 2500]
    let donationCents = 500
    if (kind === 'donation') {
      const c = Math.floor(Number(request.data && request.data.cents))
      if (DONATION_TIERS.indexOf(c) !== -1) donationCents = c
    }

    if (kind === 'supporter_pack') {
      const vaultDoc = await db.collection('vaults').doc(uid).get()
      if (vaultDoc.exists && vaultDoc.data().sw_supporter) {
        throw new HttpsError('failed-precondition', 'You are already a supporter. Thank you!')
      }
    }

    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      logger.error('[stripeCreateCheckout] STRIPE_SECRET_KEY not set')
      throw new HttpsError('failed-precondition', 'Card payments are not configured yet.')
    }

    const orderRef = db.collection('webOrders').doc()
    const orderId = orderRef.id
    const metadata = { type: kind }
    await orderRef.set({
      uid,
      type: kind,
      metadata,
      usdCents: kind === 'donation' ? donationCents : 300,
      usd: kind === 'donation' ? (donationCents / 100).toFixed(2) : '3.00',
      gateway: 'stripe',
      status: 'created',
      createdAt: FieldValue.serverTimestamp(),
    })

    const form = new URLSearchParams()
    form.set('mode', 'payment')
    form.set('client_reference_id', orderId)
    form.set('line_items[0][quantity]', '1')
    form.set('line_items[0][price_data][currency]', 'usd')
    if (kind === 'donation') {
      // preset gift tiers (custom_unit_amount needs a saved Price + extra key perms;
      // fixed inline amounts ride the already-working path). $3+ also grants the
      // Supporter Pack in the webhook.
      form.set('line_items[0][price_data][unit_amount]', String(donationCents))
      form.set('line_items[0][price_data][product_data][name]', 'Gift to Sky Wolf Studios')
      form.set('line_items[0][price_data][product_data][description]',
        'A direct thank-you to the one-person studio behind Jimothy. Gifts of $3 or more also unlock the Supporter Pack.')
      form.set('submit_type', 'donate')
    } else {
      form.set('line_items[0][price_data][unit_amount]', '300')
      form.set('line_items[0][price_data][product_data][name]', 'Studio Supporter Pack')
      form.set('line_items[0][price_data][product_data][description]',
        'Every Jimothy costume and the full original soundtrack, on every device you sign into.')
    }
    form.set('metadata[orderId]', orderId)
    form.set('metadata[uid]', uid)
    form.set('metadata[type]', kind)
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
    logger.info('[stripeCreateCheckout] kind=%s order=%s uid=%s session=%s', kind, orderId, uid, sess.id)
    return { ok: true, orderId, url: sess.url, usd: kind === 'donation' ? null : '3.00' }
  },
)
