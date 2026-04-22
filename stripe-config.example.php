<?php
/**
 * stripe-config.example.php
 *
 * Copy this file to `stripe-config.php` (same folder, without `.example`)
 * on the server via Hostinger's File Manager. The real `stripe-config.php`
 * is in .gitignore and will NEVER be committed to the repo.
 *
 * Paste your Stripe LIVE secret key in the value below. Retrieve it at
 * https://dashboard.stripe.com/apikeys (click "Reveal live key").
 *
 * This file is read by api/create-tip-session.php when a tipper opens
 * the support flow.
 */

return [
  'secret' => 'sk_live_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY',
];
