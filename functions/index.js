/**
 * Lucid Winds — Pi Network Payment Cloud Functions
 *
 * Two endpoints required by Pi SDK:
 * 1. piApprove — called when payment is created, approves it on Pi's server
 * 2. piComplete — called when user signs the transaction, completes it
 *
 * Deploy: firebase deploy --only functions
 * Set API key: firebase functions:config:set pi.apikey="YOUR_PI_API_KEY"
 */

var functions = require('firebase-functions');
var https = require('https');

var PI_API_BASE = 'api.minepi.com';

// Get Pi API key from Firebase config
function getApiKey() {
  return functions.config().pi ? functions.config().pi.apikey : '';
}

// Make a POST request to Pi API
function piApiPost(path, body, callback) {
  var data = body ? JSON.stringify(body) : '';
  var options = {
    hostname: PI_API_BASE,
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + getApiKey(),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  var req = https.request(options, function(res) {
    var chunks = [];
    res.on('data', function(chunk) { chunks.push(chunk); });
    res.on('end', function() {
      var responseBody = Buffer.concat(chunks).toString();
      try {
        callback(null, JSON.parse(responseBody), res.statusCode);
      } catch(e) {
        callback(null, responseBody, res.statusCode);
      }
    });
  });

  req.on('error', function(e) { callback(e); });
  req.write(data);
  req.end();
}

// ── APPROVE PAYMENT ──
// Client sends { paymentId } after Pi.createPayment
exports.piApprove = functions.https.onRequest(function(req, res) {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  if (req.method !== 'POST') { res.status(405).send('POST only'); return; }

  var paymentId = req.body.paymentId;
  if (!paymentId) { res.status(400).json({ error: 'Missing paymentId' }); return; }

  console.log('[Pi] Approving payment:', paymentId);

  piApiPost('/v2/payments/' + paymentId + '/approve', null, function(err, data, status) {
    if (err) {
      console.error('[Pi] Approve error:', err);
      res.status(500).json({ error: 'Pi API error' });
      return;
    }
    console.log('[Pi] Approve response:', status, data);
    res.status(200).json({ ok: true, piStatus: status });
  });
});

// ── COMPLETE PAYMENT ──
// Client sends { paymentId, txid } after user signs blockchain tx
exports.piComplete = functions.https.onRequest(function(req, res) {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  if (req.method !== 'POST') { res.status(405).send('POST only'); return; }

  var paymentId = req.body.paymentId;
  var txid = req.body.txid;
  if (!paymentId) { res.status(400).json({ error: 'Missing paymentId' }); return; }

  console.log('[Pi] Completing payment:', paymentId, 'txid:', txid);

  piApiPost('/v2/payments/' + paymentId + '/complete', { txid: txid }, function(err, data, status) {
    if (err) {
      console.error('[Pi] Complete error:', err);
      res.status(500).json({ error: 'Pi API error' });
      return;
    }
    console.log('[Pi] Complete response:', status, data);
    res.status(200).json({ ok: true, piStatus: status });
  });
});
