# HUNCH — API setup & cost test (step by step)

## Which API
**The Anthropic Claude API.** That's the only paid service HUNCH needs. The game makes two calls per round through our own proxy (`api/claude.js`), which holds the key:
- **Guess** (vision) → `claude-sonnet-4-6`
- **Judge** (score) → `claude-haiku-4-5-20251001` (cheap)

The proxy now logs the real token usage + an estimated dollar cost for **every call**, so once you add a key we can measure the true cost per round and finalize the economics.

> ⚠️ Verify the model IDs before spending: open https://docs.claude.com and confirm the exact current model strings. If `claude-sonnet-4-6` / `claude-haiku-4-5-20251001` aren't valid, tell me the right ones and I'll update the allow-list in `api/claude.js`.

---

## Step 1 — Get an Anthropic API key
1. Go to **https://console.anthropic.com** and sign in (or create an account).
2. Left sidebar → **API Keys** → **Create Key**. Name it `hunch-dev`.
3. **Copy the key now** (starts with `sk-ant-...`) — you can't see it again later.
4. Left sidebar → **Billing** (or **Plans & Billing**) → add a payment method and buy a small amount of credit (even **$5** is plenty for testing — each round costs a fraction of a cent).

## Step 2 — Put the key in the project
In the terminal (here in the Codespace), from the repo root, type this with **your** key — the `!` runs it in our session so I can see it worked, but it will **not** print your key:

```
! printf 'ANTHROPIC_API_KEY=%s\n' 'sk-ant-PASTE-YOURS' > .env.local && echo "key written ($(wc -c < .env.local) bytes)"
```

`.env.local` is git-ignored, so the key never gets committed.

## Step 3 — Run the game locally with the key
```
! set -a && . ./.env.local && set +a && PORT=3000 npm run serve
```
You should see: `HUNCH dev server -> http://localhost:3000  (API key set)`
(If it says `API key MISSING`, the key didn't load — re-check Step 2.)

## Step 4 — Open it
In a Codespace, VS Code pops a **"Open in Browser"** / **Ports** prompt for port 3000 — click it (or go to the **Ports** tab and open the 3000 forwarded URL). Play a few full rounds: draw → Submit → see the guess + score.

## Step 5 — Read the real cost
Watch the terminal while you play. Every AI call prints a line like:
```
[HUNCH cost] model=claude-sonnet-4-6 in=512 out=140 cacheRead=0 call=$0.00318 | runningCalls=6 runningCost=$0.0119 avg/call=$0.00198
```
- A **round = 2 calls** (guess + judge). Add the two `call=$...` lines for cost per round.
- `runningCost` is the total so far this session; `avg/call` is the rolling average.

Play ~10 rounds and tell me the `runningCost` and `runningCalls` — that gives us the true **cost per round**, which is the number the whole monetization model hinges on. I'll plug it into the ad/subscription math and we lock the economics.

---

## Troubleshooting
- **`API key MISSING`** → Step 3's `. ./.env.local` didn't run from the repo root, or `.env.local` is empty.
- **`upstream_error` / 400 / 404 from the API** → almost always a bad model ID; verify the strings (see the warning above) and I'll fix the allow-list.
- **`429 rate_limited`** → our proxy's per-IP guard (40 calls/min). Wait a minute; it's there to stop runaway bills.
- **Can't open the port** → in the **Ports** tab, set port 3000 visibility to **Public** (or just use the Codespace-provided forwarded URL).

When you've got the cost number, I'll keep building — next up is the AI "art-critic" persona and the Capacitor/AdMob shell.
