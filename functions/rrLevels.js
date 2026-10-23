/**
 * rrLevels — Rabbit Ronin's hand made dojos (the level editor, 2026-10-23).
 *
 * Stephen: "i may want to create a level editor so i can hand sculpt each level". The editor
 * (satellites/rabbit-samurai/editor.js) saves his drafts here so they survive a cleared browser and
 * follow him from the laptop to the phone; PUBLISH puts a dojo in front of every player.
 *
 *   GET  ?pub=1                    → { levels: { "<dojo index>": <hand level>, ... }, at }   public, the game reads it
 *   POST { key, op:'list' }        → { dojos: { "<i>": { draftAt, pubAt } } }
 *   POST { key, op:'get', li }     → { draft, pub }
 *   POST { key, op:'save', li, level }      stores the draft
 *   POST { key, op:'publish', li }          the draft goes live (the old live one is kept in history)
 *   POST { key, op:'unpublish', li }        the dojo goes back to the game's generator
 *
 * The editor key is checked against its SHA-256 (this repo is PUBLIC; only the hash lives here).
 * Levels are stored as JSON TEXT: Firestore cannot hold arrays of arrays, and the format is full of them.
 * Admin SDK writes, so no Firestore rules change: no client can touch the rrLevels collection directly.
 */
import crypto from 'node:crypto'
import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const KEY_HASH = 'e7ab0ce4dca0aa33400b83c2af7bcc90f15e3885538c4d99067b9af451e710c9'
const MAX_LEVEL = 300 * 1024
const LEVELS = 24
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }

const misses = new Map()   // ip -> [timestamps] of wrong keys
function blocked(ip) { const now = Date.now(); const m = (misses.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000); misses.set(ip, m); return m.length >= 10 }
function miss(ip) { const m = misses.get(ip) || []; m.push(Date.now()); misses.set(ip, m); if (misses.size > 5000) misses.clear() }
function keyOk(k) {
  if (typeof k !== 'string' || k.length > 200) return false
  const h = crypto.createHash('sha256').update(k.trim().toLowerCase()).digest()
  return crypto.timingSafeEqual(h, Buffer.from(KEY_HASH, 'hex'))
}
/* the shape the game's fromHand() needs; anything else is refused before it can reach a player */
function validLevel(h) {
  if (!h || typeof h !== 'object' || h.v !== 1) return 'not a dojo'
  const W = h.W
  if (!Number.isInteger(W) || W < 30 || W > 2000) return 'bad length'
  if (!Array.isArray(h.rows) || h.rows.length !== 24) return 'needs 24 rows'
  for (const r of h.rows) { if (typeof r !== 'string' || r.length !== W || /[^.#=]/.test(r)) return 'bad row' }
  const pt = (a) => Array.isArray(a) && a.length >= 2 && a.every((v) => typeof v === 'number' && Number.isFinite(v))
  if (!pt(h.spawn) || !pt(h.diamond)) return 'needs a start and a diamond'
  for (const k of ['posts', 'carrots', 'cells', 'spikes', 'bounces', 'cannons', 'spits', 'porcs', 'hogs', 'crows', 'gusts', 'segs']) {
    if (h[k] == null) continue
    if (!Array.isArray(h[k]) || h[k].length > 2000 || !h[k].every(pt)) return 'bad ' + k
  }
  return null
}
const doc = (li) => getFirestore().collection('rrLevels').doc('d' + li)

export const rrLevels = onRequest(
  { region: 'us-central1', cors: false, maxInstances: 3, memory: '256MiB' },
  async (req, res) => {
    res.set(CORS)
    if (req.method === 'OPTIONS') { res.status(204).send(''); return }
    try {
      if (req.method === 'GET') {
        const snap = await getFirestore().collection('rrLevels').get()
        const levels = {}; let at = 0
        snap.forEach((d) => { const x = d.data(); if (x.pub) { levels[d.id.slice(1)] = JSON.parse(x.pub); at = Math.max(at, x.pubAt ? x.pubAt.toMillis() : 0) } })
        res.set('Cache-Control', 'public, max-age=60')
        res.json({ levels, at }); return
      }
      if (req.method !== 'POST') { res.status(405).json({ error: 'GET or POST' }); return }
      const ip = String(req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim()
      if (blocked(ip)) { res.status(429).json({ error: 'too many wrong keys, wait ten minutes' }); return }
      const b = req.body || {}
      if (!keyOk(b.key)) { miss(ip); res.status(403).json({ error: 'that editor key is not right' }); return }
      const op = b.op
      if (op === 'list') {
        const snap = await getFirestore().collection('rrLevels').get(); const dojos = {}
        snap.forEach((d) => { const x = d.data(); dojos[d.id.slice(1)] = { draftAt: x.draftAt ? x.draftAt.toMillis() : 0, pubAt: x.pub && x.pubAt ? x.pubAt.toMillis() : 0 } })
        res.json({ dojos }); return
      }
      const li = b.li
      if (!Number.isInteger(li) || li < 0 || li >= LEVELS) { res.status(400).json({ error: 'which dojo?' }); return }
      if (op === 'get') {
        const s = await doc(li).get(); const x = s.exists ? s.data() : {}
        res.json({ draft: x.draft ? JSON.parse(x.draft) : null, pub: x.pub ? JSON.parse(x.pub) : null, draftAt: x.draftAt ? x.draftAt.toMillis() : 0, pubAt: x.pubAt ? x.pubAt.toMillis() : 0 }); return
      }
      if (op === 'save') {
        const text = JSON.stringify(b.level || null)
        if (text.length > MAX_LEVEL) { res.status(413).json({ error: 'too big' }); return }
        const bad = validLevel(b.level); if (bad) { res.status(400).json({ error: bad }); return }
        await doc(li).set({ draft: text, draftAt: FieldValue.serverTimestamp() }, { merge: true })
        res.json({ ok: true }); return
      }
      if (op === 'publish') {
        const ref = doc(li)
        const out = await getFirestore().runTransaction(async (tx) => {
          const s = await tx.get(ref); const x = s.exists ? s.data() : {}
          if (!x.draft) return { error: 'nothing saved for this dojo yet' }
          const bad = validLevel(JSON.parse(x.draft)); if (bad) return { error: bad }
          if (x.pub) tx.set(ref.collection('history').doc(String(Date.now())), { pub: x.pub, pubAt: x.pubAt || null })
          tx.set(ref, { pub: x.draft, pubAt: FieldValue.serverTimestamp() }, { merge: true })
          return { ok: true }
        })
        res.status(out.error ? 400 : 200).json(out); return
      }
      if (op === 'unpublish') {
        const ref = doc(li); const s = await ref.get(); const x = s.exists ? s.data() : {}
        if (x.pub) await ref.collection('history').doc(String(Date.now())).set({ pub: x.pub, pubAt: x.pubAt || null, unpublished: true })
        await ref.set({ pub: FieldValue.delete(), pubAt: FieldValue.delete() }, { merge: true })
        res.json({ ok: true }); return
      }
      res.status(400).json({ error: 'unknown op' })
    } catch (e) {
      res.status(500).json({ error: 'server: ' + (e && e.message ? e.message : String(e)) })
    }
  })
