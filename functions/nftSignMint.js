/**
 * Lucid Winds — NFT mint voucher signer (Polygon, legacy).
 *
 * Preserved from v1 functions. Verifies a Firebase auth token, confirms the
 * caller owns the plant in vaults/{uid}.greenhouse, then signs a voucher
 * (walletAddress, plantHash, nonce, chainId) for the on-chain mint contract.
 *
 * Endpoint: POST https://us-central1-focus-grove-fffa8.cloudfunctions.net/nftSignMint
 *   Headers: Authorization: Bearer <Firebase ID token>
 *   Body:    { plantHash, walletAddress, nonce }
 *
 * Required secrets:
 *   NFT_SIGNER_KEY   — 0x… private key for the signer (paymaster wallet)
 *   NFT_CHAIN_ID     — "137" (Polygon mainnet) or "80002" (Amoy testnet)
 */

import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import {
  isAddress,
  solidityPacked,
  keccak256,
  hashMessage,
  getBytes,
  SigningKey,
  Signature,
} from 'ethers'

export const nftSignMint = onRequest(
  {
    region: 'us-central1',
    cors: true,
    secrets: ['NFT_SIGNER_KEY', 'NFT_CHAIN_ID'],
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST only' })
      return
    }

    const authHeader = req.headers.authorization || ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!idToken) {
      res.status(401).json({ error: 'Missing auth token' })
      return
    }

    const { plantHash, walletAddress, nonce } = req.body || {}
    if (!plantHash || !walletAddress || nonce === undefined) {
      res.status(400).json({ error: 'Missing plantHash, walletAddress, or nonce' })
      return
    }
    if (!/^[0-9a-f]{64}$/i.test(plantHash)) {
      res.status(400).json({ error: 'Invalid plant hash format' })
      return
    }
    if (!isAddress(walletAddress)) {
      res.status(400).json({ error: 'Invalid wallet address' })
      return
    }

    const signerKey = process.env.NFT_SIGNER_KEY || ''
    if (!signerKey) {
      logger.error('[NFT] Signer key not configured')
      res.status(500).json({ error: 'Server not configured for minting' })
      return
    }
    const chainId = parseInt(process.env.NFT_CHAIN_ID || '80002', 10)

    let decoded
    try {
      decoded = await getAuth().verifyIdToken(idToken)
    } catch (err) {
      logger.error('[NFT] Auth error', err)
      res.status(401).json({ error: 'Invalid auth token' })
      return
    }
    const uid = decoded.uid
    logger.info('[NFT] Mint request uid=%s hash=%s', uid, plantHash.slice(0, 16))

    const db = getFirestore()
    const vaultDoc = await db.collection('vaults').doc(uid).get()
    if (!vaultDoc.exists) {
      res.status(403).json({ error: 'No vault found' })
      return
    }
    const greenhouse = vaultDoc.data().greenhouse || []
    const owns = Array.isArray(greenhouse)
      ? greenhouse.some((p) => p && p.hash === plantHash)
      : Object.values(greenhouse).some((p) => p && p.hash === plantHash)
    if (!owns) {
      logger.warn('[NFT] Plant not in vault uid=%s', uid)
      res.status(403).json({ error: 'Plant not in your greenhouse' })
      return
    }

    const mintRef = db.collection('nftMints').doc(plantHash)
    const mintDoc = await mintRef.get()
    if (mintDoc.exists) {
      res.status(409).json({ error: 'Plant already minted as NFT' })
      return
    }

    // Sign voucher
    const plantHashBytes = '0x' + plantHash
    const packed = solidityPacked(
      ['address', 'bytes32', 'uint256', 'uint256'],
      [walletAddress, plantHashBytes, nonce, chainId],
    )
    const digest = keccak256(packed)
    const signing = new SigningKey(signerKey)
    const sig = signing.sign(hashMessage(getBytes(digest)))
    const signature = Signature.from(sig).serialized

    await mintRef.set({
      uid,
      walletAddress,
      chainId,
      signedAt: FieldValue.serverTimestamp(),
      tokenId: null,
    })

    logger.info('[NFT] Signed voucher hash=%s wallet=%s', plantHash.slice(0, 16), walletAddress)
    res.status(200).json({ ok: true, signature, plantHash: plantHashBytes, nonce, chainId })
  },
)
