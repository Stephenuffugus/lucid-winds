# Hunch — "See how others drew it" gallery (NEEDS STEPHEN'S SIGN-OFF)

**Request:** Jessie — "at the bottom, there should be an option to see how other people have drawn the prompt, so they can see how far off or close they were."

**Why this is parked, not shipped:** it's public user-generated IMAGES in a kid-facing game. Names already go through server-side moderation (api/_badwords.js); drawings need the equivalent before anyone else sees them. That's a policy call + a small ongoing cost call, so it waits for Stephen.

## Recommended design (uses only infra Hunch already has)
1. **Moderation for free:** the vision call that already judges every drawing (api/claude.js) gets ONE extra field in its prompt/response: `shareable: true/false` (flag anything sexual/violent/hateful/text-heavy/personal-info). Zero extra API calls, zero extra credits.
2. **Storage:** the same Upstash Redis behind the leaderboard. Per prompt-day key `gallery:<day>:<promptId>` → LPUSH small PNGs (256px, ~8-15KB base64), LTRIM to ~60, EXPIRE 72h. Cost: trivial.
3. **Gallery UI:** after a round, a "See how others drew it" row (Jessie's exact placement) → horizontal scroll of cleared drawings with their scores. Player's own drawing uploads only if `shareable` AND they tap "share mine" (opt-in, no names attached).
4. **Safety net:** long-press → report (api/report.js exists); N reports hides the image (same pattern the leaderboard names use).

## Costs / decisions for Stephen
- Storage is pennies; the vision flag is free. The real decisions: is opt-in + AI-flag + report-to-hide moderation ENOUGH for our audience? And do drawings stay anonymous (recommended)?
- If yes to both, this is roughly a one-session build across Hunch's client + the two API files.
