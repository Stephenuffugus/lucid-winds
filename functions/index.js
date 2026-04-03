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
var admin = require('firebase-admin');
var https = require('https');
var ethers = require('ethers');

admin.initializeApp();
var db = admin.firestore();

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

// ══════════════════════════════════════════════════════════════════════
// NFT MINT SIGNING — Polygon
// ══════════════════════════════════════════════════════════════════════
//
// Flow:
// 1. Player clicks "Mint to Polygon" in game
// 2. Client sends Firebase auth token + plant hash + wallet address
// 3. This function verifies the player owns the plant in Firestore
// 4. Signs a voucher (walletAddress, plantHash, nonce, chainId)
// 5. Player submits voucher + signature to the smart contract
//
// Set signer key: firebase functions:config:set nft.signerkey="0x..."
// Set chain ID:   firebase functions:config:set nft.chainid="80002" (amoy testnet)
//                 firebase functions:config:set nft.chainid="137"   (polygon mainnet)
// ══════════════════════════════════════════════════════════════════════

function getNftSignerKey() {
  return functions.config().nft ? functions.config().nft.signerkey : '';
}

function getNftChainId() {
  var cid = functions.config().nft ? functions.config().nft.chainid : '80002';
  return parseInt(cid, 10);
}

exports.nftSignMint = functions.https.onRequest(function(req, res) {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).send('POST only'); return; }

  // Extract Firebase auth token
  var authHeader = req.headers.authorization || '';
  var idToken = '';
  if (authHeader.startsWith('Bearer ')) {
    idToken = authHeader.substring(7);
  }
  if (!idToken) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }

  var plantHash = req.body.plantHash;     // 64-char hex string
  var walletAddr = req.body.walletAddress; // 0x... Ethereum address
  var nonce = req.body.nonce;              // Current nonce from contract

  if (!plantHash || !walletAddr || nonce === undefined) {
    res.status(400).json({ error: 'Missing plantHash, walletAddress, or nonce' });
    return;
  }

  // Validate hex hash format
  if (!/^[0-9a-f]{64}$/i.test(plantHash)) {
    res.status(400).json({ error: 'Invalid plant hash format' });
    return;
  }

  // Validate wallet address
  if (!ethers.isAddress(walletAddr)) {
    res.status(400).json({ error: 'Invalid wallet address' });
    return;
  }

  var signerKey = getNftSignerKey();
  if (!signerKey) {
    console.error('[NFT] Signer key not configured');
    res.status(500).json({ error: 'Server not configured for minting' });
    return;
  }

  var chainId = getNftChainId();

  // Verify Firebase auth
  admin.auth().verifyIdToken(idToken)
    .then(function(decoded) {
      var uid = decoded.uid;
      console.log('[NFT] Mint request from uid:', uid, 'hash:', plantHash.substring(0, 16) + '...');

      // Verify the player actually owns this plant in their vault
      return db.collection('vaults').doc(uid).get().then(function(doc) {
        if (!doc.exists) {
          res.status(403).json({ error: 'No vault found' });
          return;
        }

        var vault = doc.data();
        var greenhouse = vault.greenhouse || [];
        var found = false;
        for (var i = 0; i < greenhouse.length; i++) {
          if (greenhouse[i] && greenhouse[i].hash === plantHash) {
            found = true;
            break;
          }
        }

        if (!found) {
          console.warn('[NFT] Plant not found in vault:', uid, plantHash.substring(0, 16));
          res.status(403).json({ error: 'Plant not in your greenhouse' });
          return;
        }

        // Check if already minted (prevent double-mint server-side too)
        return db.collection('nftMints').doc(plantHash).get().then(function(mintDoc) {
          if (mintDoc.exists) {
            res.status(409).json({ error: 'Plant already minted as NFT' });
            return;
          }

          // Sign the mint voucher
          var plantHashBytes = '0x' + plantHash;
          var packed = ethers.solidityPacked(
            ['address', 'bytes32', 'uint256', 'uint256'],
            [walletAddr, plantHashBytes, nonce, chainId]
          );
          var digest = ethers.keccak256(packed);
          var signingKey = new ethers.SigningKey(signerKey);
          var sig = signingKey.sign(ethers.hashMessage(ethers.getBytes(digest)));
          var signature = ethers.Signature.from(sig).serialized;

          // Record the mint to prevent double-minting
          return db.collection('nftMints').doc(plantHash).set({
            uid: uid,
            walletAddress: walletAddr,
            chainId: chainId,
            signedAt: admin.firestore.FieldValue.serverTimestamp(),
            tokenId: null // Updated after on-chain confirmation
          }).then(function() {
            console.log('[NFT] Signed voucher for:', plantHash.substring(0, 16), 'wallet:', walletAddr);
            res.status(200).json({
              ok: true,
              signature: signature,
              plantHash: plantHashBytes,
              nonce: nonce,
              chainId: chainId
            });
          });
        });
      });
    })
    .catch(function(err) {
      console.error('[NFT] Auth error:', err);
      res.status(401).json({ error: 'Invalid auth token' });
    });
});
