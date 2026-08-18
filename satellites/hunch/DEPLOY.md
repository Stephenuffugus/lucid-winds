# HUNCH — Deploy (make it standalone, runs with the Codespace closed)

The frontend is static; the AI proxy (`/api/*`) runs as serverless functions.
Vercel hosts both for free and keeps your API key server-side. ~5 minutes.

## Option A — Vercel via GitHub (recommended, no CLI)
The repo is already on GitHub. Once it's pushed:

1. Go to **https://vercel.com** → sign in with **GitHub**.
2. **Add New… → Project** → import **Stephenuffugus/Hunch**.
3. Framework preset: **Other**. Root directory: **/** (default). Build command: **none**. Output: leave default. (It's static + `api/` functions — Vercel detects the functions automatically.)
4. **Environment Variables** → add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key (the working one)
5. **Deploy.** In ~30s you get a URL like `https://hunch-xxxx.vercel.app`.
6. Open it on your phone → play. Works with the Codespace closed. ✅
7. (Optional) **Settings → Domains** → point one of your SWS domains at it.

Every future `git push` to `main` auto-redeploys.

## Option B — Vercel CLI (from any terminal)
```
npm i -g vercel
vercel login
vercel link        # create/link the project
vercel env add ANTHROPIC_API_KEY    # paste your key when asked (Production)
vercel --prod
```

## After deploy — verify
- Open the URL, play a full round (draw → guess → score).
- In the browser **Network tab**, confirm `/api/claude` is called and your key is **never** in the client (it's only in Vercel's env). 
- Check Vercel **→ Logs** for the `[HUNCH cost]` lines to watch real spend.

## Notes
- `.env.local` (your key) is git-ignored and is **not** pushed — the key lives only in Vercel's env settings. Rotate the key before public launch.
- Rate limiting is in-memory per instance (soft-launch guard). For real scale, move it to Vercel KV / Upstash (noted in `api/claude.js`).
- Model IDs are allow-listed in `api/claude.js` (`claude-sonnet-4-6` guess, `claude-haiku-4-5-20251001` judge), validated against your account.
