/**
 * Lucid Winds — thin wrapper over the Pi Platform API.
 *
 * Auth: every call sends `Authorization: Key <PI_SERVER_KEY>` where PI_SERVER_KEY
 * is a Firebase Functions v2 secret. Set it once with:
 *
 *   firebase functions:secrets:set PI_SERVER_KEY
 *
 * (then paste the developer-portal server API key — NEVER commit this).
 *
 * Functions that import piGet/piPost must declare PI_SERVER_KEY in their
 * onCall options:  { secrets: ['PI_SERVER_KEY'] }
 *
 * Base URL: https://api.minepi.com
 */

import { HttpsError } from 'firebase-functions/v2/https'

const PI_API_BASE = 'https://api.minepi.com'

export function getPiServerKey() {
  const key = process.env.PI_SERVER_KEY || ''
  if (!key) {
    throw new HttpsError(
      'failed-precondition',
      'Pi server key not configured. Run: firebase functions:secrets:set PI_SERVER_KEY',
    )
  }
  return key
}

async function piRequest(path, method, body) {
  const url = PI_API_BASE + path
  const headers = {
    Authorization: `Key ${getPiServerKey()}`,
    'Content-Type': 'application/json',
  }
  const init = { method, headers }
  if (body !== undefined && body !== null) init.body = JSON.stringify(body)

  let res
  try {
    res = await fetch(url, init)
  } catch (err) {
    throw new HttpsError('internal', `Pi network error: ${err.message}`)
  }

  let payload = null
  const text = await res.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { raw: text }
    }
  }

  if (!res.ok) {
    const detail = payload && (payload.error_message || payload.error || payload.raw)
    const code = res.status === 404 ? 'not-found' : 'internal'
    throw new HttpsError(code, `Pi ${method} ${path} → ${res.status} ${detail || ''}`.trim())
  }
  return payload || {}
}

export function piGet(path) {
  return piRequest(path, 'GET', null)
}

export function piPost(path, body) {
  return piRequest(path, 'POST', body || {})
}
