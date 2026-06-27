<?php
/**
 * api/feedback.php
 *
 * Receives the in-game "Found a bug or have an idea?" form (feedback.js)
 * and emails it to the designated address from feedback-config.php. No
 * database — keeps player notes out of Firebase and in a normal inbox
 * where Hostinger rules can auto-sort by the subject tag.
 *
 * Config (the destination address) lives in ../feedback-config.php, one
 * level above api/, NEVER committed. Stephen drops it in via the Hostinger
 * File Manager — same pattern as stripe-config.php.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// ── Load config (destination address) ──────────────────────────────
$configPath = __DIR__ . '/../feedback-config.php';
if (!file_exists($configPath)) {
  http_response_code(500);
  echo json_encode(['error' => 'Feedback is not set up yet. Please try again later.']);
  exit;
}
$config = require $configPath;
$to    = isset($config['to'])   ? trim($config['to'])   : '';
$from  = isset($config['from']) ? trim($config['from']) : '';
$token = isset($config['token'])? (string)$config['token'] : '';
if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
  http_response_code(500);
  echo json_encode(['error' => 'Feedback delivery is misconfigured.']);
  exit;
}
if (!$from || !filter_var($from, FILTER_VALIDATE_EMAIL)) { $from = $to; }

// ── Read input ─────────────────────────────────────────────────────
$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) { $in = []; }

// Honeypot: real users never fill the hidden "website" field. Bots do.
// Pretend success so the bot doesn't retry, but send nothing.
if (!empty($in['website'])) { echo json_encode(['ok' => true]); exit; }

// Optional shared token gate.
if ($token !== '') {
  $sent = isset($in['token']) ? (string)$in['token'] : '';
  if (!hash_equals($token, $sent)) {
    http_response_code(403);
    echo json_encode(['error' => 'Rejected.']);
    exit;
  }
}

// ── Validate + sanitize ────────────────────────────────────────────
function fb_clean($v, $max) {
  $v = is_string($v) ? $v : '';
  $v = trim($v);
  // Strip CR/LF from short header-bound fields to prevent header injection.
  $v = str_replace(array("\r", "\n"), ' ', $v);
  if (strlen($v) > $max) { $v = substr($v, 0, $max); }
  return $v;
}

$type    = strtolower(fb_clean(isset($in['type']) ? $in['type'] : '', 20));
if ($type !== 'bug' && $type !== 'improvement') { $type = 'feedback'; }
$game    = fb_clean(isset($in['game']) ? $in['game'] : '', 60);
$name    = fb_clean(isset($in['name']) ? $in['name'] : '', 80);
$contact = fb_clean(isset($in['contact']) ? $in['contact'] : '', 120);
$version = fb_clean(isset($in['version']) ? $in['version'] : '', 30);
$surface = fb_clean(isset($in['surface']) ? $in['surface'] : '', 30);
$account = fb_clean(isset($in['account']) ? $in['account'] : '', 120);
$uid     = fb_clean(isset($in['uid']) ? $in['uid'] : '', 60);

// Details is the one multi-line field; keep newlines, just bound length.
$details = is_string(isset($in['details']) ? $in['details'] : '') ? trim($in['details']) : '';
if (strlen($details) > 4000) { $details = substr($details, 0, 4000); }
if (strlen($details) < 6) {
  http_response_code(400);
  echo json_encode(['error' => 'Please add a little more detail.']);
  exit;
}

// ── Light per-IP rate limit (file-based; best-effort on shared hosting) ──
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0';
$rlPath = sys_get_temp_dir() . '/lw_fb_' . md5($ip) . '.txt';
$now = time();
$recent = array();
if (is_readable($rlPath)) {
  $recent = array_filter(array_map('intval', explode(',', (string)@file_get_contents($rlPath))));
}
// Keep only timestamps from the last hour.
$recent = array_values(array_filter($recent, function($t) use ($now) { return $t > $now - 3600; }));
if (count($recent) >= 1 && $recent[count($recent)-1] > $now - 20) {
  http_response_code(429);
  echo json_encode(['error' => 'You just sent one — give it a moment.']);
  exit;
}
if (count($recent) >= 20) {
  http_response_code(429);
  echo json_encode(['error' => "That's a lot of notes today — thank you. Try again tomorrow."]);
  exit;
}
$recent[] = $now;
@file_put_contents($rlPath, implode(',', $recent));

// ── Build + send the email ─────────────────────────────────────────
$typeTag = strtoupper($type);
$gameTag = $game !== '' ? $game : 'app';
$snippet = fb_clean(substr($details, 0, 60), 60);
$subject = '[LW][' . $typeTag . '][' . $gameTag . '] ' . $snippet;

$lines = array();
$lines[] = 'Type:     ' . $type;
$lines[] = 'Game:     ' . ($game !== '' ? $game : '(not specified)');
$lines[] = 'From:     ' . ($name !== '' ? $name : '(anonymous)');
$lines[] = 'Contact:  ' . ($contact !== '' ? $contact : '(none given)');
$lines[] = 'Surface:  ' . ($surface !== '' ? $surface : '(unknown)');
$lines[] = 'Account:  ' . ($account !== '' ? $account : '(signed out / n/a)');
$lines[] = 'UID:      ' . ($uid !== '' ? $uid : '(n/a)');
$lines[] = 'Version:  ' . ($version !== '' ? $version : '(unknown)');
$lines[] = 'IP:       ' . $ip;
$lines[] = 'When:     ' . gmdate('Y-m-d H:i:s') . ' UTC';
$lines[] = '';
$lines[] = '--- DETAILS ---';
$lines[] = $details;
$lines[] = '';
$lines[] = '(Reply-to is set to the contact above when they left a real email.)';
$body = implode("\r\n", $lines);

$headers = array();
$headers[] = 'From: Lucid Winds Feedback <' . $from . '>';
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
// If the player left an email as contact, make Reply hit them directly.
if ($contact !== '' && filter_var($contact, FILTER_VALIDATE_EMAIL)) {
  $headers[] = 'Reply-To: ' . $contact;
}

$ok = @mail($to, $subject, $body, implode("\r\n", $headers));
if (!$ok) {
  http_response_code(502);
  echo json_encode(['error' => "We couldn't send that just now. Please try again later."]);
  exit;
}

echo json_encode(['ok' => true]);
