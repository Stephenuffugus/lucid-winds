<?php
/**
 * api/create-tip-session.php
 *
 * Creates a Stripe Checkout Session with a customer-chosen amount and
 * returns the hosted checkout URL. The tip-jar frontend posts an
 * amount in cents to this endpoint; we call Stripe's REST API and hand
 * back the session URL for a 303 redirect on the client.
 *
 * The Stripe secret key is read from stripe-config.php, which lives
 * one level above the api/ directory and is NEVER committed to git.
 * Stephen drops that file in via the Hostinger file manager.
 */

header('Content-Type: application/json');
// Same-origin POSTs from lucidwinds.com — still set CORS for safety.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// ── Load secret key from config ────────────────────────────────────
$configPath = __DIR__ . '/../stripe-config.php';
if (!file_exists($configPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'Server config missing. Contact support.']);
  exit;
}
$config = require $configPath;
$secretKey = isset($config['secret']) ? $config['secret'] : '';
if (!$secretKey || strpos($secretKey, 'sk_') !== 0) {
  http_response_code(500);
  echo json_encode(['error' => 'Server config invalid.']);
  exit;
}

// ── Read + validate amount ─────────────────────────────────────────
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$dollars = isset($input['amount']) ? floatval($input['amount']) : 0;
// Convert to integer cents, floor to whole cents
$cents = intval(round($dollars * 100));
if ($cents < 100) {
  http_response_code(400);
  echo json_encode(['error' => 'Minimum tip is $1.']);
  exit;
}
if ($cents > 10000000) {
  http_response_code(400);
  echo json_encode(['error' => 'Amount too large.']);
  exit;
}

// ── Build Stripe API request ───────────────────────────────────────
$origin = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://')
        . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'lucidwinds.com');

$fields = [
  'mode' => 'payment',
  'submit_type' => 'donate',
  'line_items[0][price_data][currency]' => 'usd',
  'line_items[0][price_data][product_data][name]' => 'Support Lucid Winds',
  'line_items[0][price_data][product_data][description]' => 'A tip for the hermit who made this.',
  'line_items[0][price_data][product_data][images][]' => $origin . '/assets/stripe-tip-image.jpg',
  'line_items[0][price_data][unit_amount]' => $cents,
  'line_items[0][quantity]' => 1,
  'success_url' => $origin . '/?tip=success',
  'cancel_url' => $origin . '/?tip=cancel',
  'payment_method_types[]' => 'card',
  'billing_address_collection' => 'auto',
];

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $secretKey . ':');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($err) {
  http_response_code(502);
  echo json_encode(['error' => 'Network error: ' . $err]);
  exit;
}

$data = json_decode($resp, true);
if ($code !== 200 || !isset($data['url'])) {
  $msg = isset($data['error']['message']) ? $data['error']['message'] : 'Stripe error';
  http_response_code($code >= 400 ? $code : 502);
  echo json_encode(['error' => $msg]);
  exit;
}

echo json_encode(['url' => $data['url']]);
