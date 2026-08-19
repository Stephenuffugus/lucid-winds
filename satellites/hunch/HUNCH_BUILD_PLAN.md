# HUNCH — Build & Launch Plan (Claude Code Handoff)

Owner: Stephen / SWS Strategic Media
Goal: take the working prototype (`hunch.html`) to a deployed, public web app **this week**.

---

## 0. TL;DR for whoever picks this up

`hunch.html` is a **complete, working frontend** for a drawing-guessing game. The game loop, AI guess/judge logic, prompt system, scoring, streaks, tools, and gallery are all done and good. Two things stand between it and launch:

1. **The AI calls must move to a backend.** Right now the app POSTs directly to `api.anthropic.com` with no key — that only works inside Claude's artifact sandbox (which injects auth). On a real domain that call fails. Fix = a tiny serverless proxy that holds the API key. Code is in §6.
2. **The canvas height needs a real page.** The "box won't get bigger" problem was the artifact iframe never giving the layout a height. On a normal page this is a 5-line CSS-grid fix. Code is in §5.

Everything else is polish. You can have a working deployed version end-to-end on Day 1.

---

## 1. The concept (don't lose this)

You're shown something to draw — concrete (`a thunderstorm`), emotional (`homesickness`), or absurd (`the number 7, but smug`). You get ~50–60 seconds. Then a **real AI vision model looks at your drawing and guesses, blind** (it never sees the prompt). It then grades how close its guess landed. Hit 50+ → your streak grows and multiplies your score. Miss → streak resets. The AI's wrong guesses are the shareable comedy; its right guesses feel like telepathy.

Why it works: **creative** (no "correct" way to draw a feeling), **smart** (a live intelligence is the opponent), **original** (Pictionary inverted — you read the machine's mind, it reads yours), **addictive** (timer + streak multiplier + variable, funny reward).

---

## 2. What's already built (in `hunch.html`)

- **Full game state machine**: start → round → thinking → result screens.
- **Canvas drawing**: pointer/touch, pen, eraser, **bucket fill** (flood fill), 15-color palette + custom color picker, size slider, undo, clear.
- **Timer**: animated ring countdown, auto-submit at 0.
- **AI guess** (`aiGuess`): sends the drawing, model returns `{observation, guesses[3], quip}`. It observes first, then guesses — this is what fixed the "random guesses" problem.
- **Image cropping** (`exportForAI`): auto-crops to the drawn content so the subject fills the frame before sending (huge accuracy boost).
- **AI judge** (`aiJudge`): given the secret target + the guesses, returns `{score 0-100, verdict}`.
- **Scoring/streaks**: hit threshold, streak multiplier, best-streak tracking.
- **Difficulty tiers**: prompts escalate as you land hits.
- **Prompt deck**: ~190 prompts across 3 tiers, no-repeat logic, + background AI top-up so it never dries up.
- **Results screen**: shows your drawing, what the AI "saw," its 3 guesses, the quip, big animated score, verdict, streak.
- **Hunch log**: a running gallery of past rounds (thumbnail + target + top guess + score).
- **Share**: copy-result-to-clipboard.

`hunch.html` is the source of truth for the frontend. Copy it into the repo as the starting point.

---

## 3. Recommended stack (fastest path to launch)

Keep it boring and fast. Do **not** rebuild in a framework this week.

- **Frontend**: the existing single static HTML file (optionally split into `index.html` + `app.js` + `styles.css` later; not required for launch).
- **Backend**: one serverless function (`/api/claude`) that proxies to Anthropic and holds the key.
- **Host**: **Vercel** (free tier, deploys static root + `/api` functions automatically, custom domain in minutes). Cloudflare Pages + Functions or Netlify Functions are fine equivalents.
- **No database needed for MVP.** Use `localStorage` for best streak / daily state. Add a DB later only if you want global leaderboards.

### Repo structure
```
hunch/
├── index.html            # the game (was hunch.html) — change one function, see §4
├── api/
│   └── claude.js         # serverless proxy to Anthropic (holds the key)
├── package.json
├── vercel.json           # optional; routing is automatic, included for clarity
├── .env.local            # ANTHROPIC_API_KEY=...  (never commit)
├── .gitignore            # node_modules, .env*, .vercel
└── README.md
```

---

## 4. The ONE required frontend change

In `index.html`, find `callClaude(...)`. It currently fetches `https://api.anthropic.com/...` directly. Replace the whole function with a call to your own backend:

```js
async function callClaude(messages, system, temperature){
  const resp = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system, temperature, model: "claude-sonnet-4-6" })
  });
  if(!resp.ok) throw new Error("status " + resp.status);
  const data = await resp.json();
  return data.text || "";
}
```

That's it. `aiGuess`, `aiJudge`, and `topUpPrompts` all call `callClaude` and keep working unchanged. The model string moves server-side (allow-listed) so the client can't abuse it.

---

## 5. The canvas-height fix (works on a real page)

The frustration was the artifact iframe never having a real height. On a normal page, switch the round screen to **CSS grid** so the canvas gets `1fr`, then let the existing `fitCanvas()` read the real `clientWidth/clientHeight`.

CSS — make the page own the viewport and the round a 3-row grid:
```css
html, body { height: 100%; margin: 0; }
.app { min-height: 100dvh; }

/* round screen fills the app; canvas takes all leftover space */
#scRound { display: grid; grid-template-rows: auto 1fr auto; min-height: 0; }
#scRound .canvas-wrap { height: auto; min-height: 0; }   /* grid 1fr controls it */
```

JS — simplify `fitCanvas()` to just measure the now-real box (drop the manual viewport math):
```js
function fitCanvas(){
  const wrap = pad.parentElement;
  const w = Math.max(260, Math.floor(wrap.clientWidth));
  const h = Math.max(220, Math.floor(wrap.clientHeight));
  if (w === pad.width && h === pad.height) return;
  let prev = null;
  if (pad.width && pad.height) { try { prev = document.createElement('canvas'); prev.width = pad.width; prev.height = pad.height; prev.getContext('2d').drawImage(pad, 0, 0); } catch(e){} }
  pad.width = w; pad.height = h;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  if (prev) ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, w, h);
}
```

Because the page now has a true height, `wrap.clientHeight` is correct and the canvas fills everything between the prompt and the toolbar. Hiding the score bar during a round (already in the code) gives even more room. If you want it edge-to-edge, drop the `.card` padding on the round screen too.

---

## 6. Backend proxy (full code)

`api/claude.js` (Vercel Node serverless function):
```js
// api/claude.js
const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-6",            // default: good vision + cost balance
  "claude-haiku-4-5-20251001",   // cheaper: fine for judging / prompt generation
  "claude-opus-4-8"              // max quality if you want it
]);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { messages, system, temperature, model } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: "messages[] required" });

    const chosen = ALLOWED_MODELS.has(model) ? model : "claude-sonnet-4-6";

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: chosen,
        max_tokens: 1000,
        ...(typeof temperature === "number" ? { temperature } : {}),
        ...(system ? { system } : {}),
        messages
      })
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(upstream.status).json({ error: "upstream_error", detail });
    }

    const data = await upstream.json();
    const text = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
```

`package.json`:
```json
{
  "name": "hunch",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  }
}
```
No dependencies needed — Vercel's Node runtime has global `fetch`.

`vercel.json` (optional — routing is automatic; included for explicitness):
```json
{
  "functions": { "api/*.js": { "maxDuration": 30 } }
}
```

`.gitignore`:
```
node_modules
.vercel
.env*
```

> Note on model strings: the prototype uses `claude-sonnet-4-20250514` (the artifact-sandbox model). Update to a current string server-side. Confirm the latest at `docs.claude.com` before launch — vision support and exact names matter. `claude-sonnet-4-6` is the recommended default for the guess (vision) call; use `claude-haiku-4-5-20251001` for the judge and prompt-generation calls to cut cost.

> Note on payload size: the cropped PNG sent for guessing is small (well under Vercel's ~4.5MB body limit). No action needed, but don't remove the `exportForAI` cropping — it both improves accuracy and keeps payloads tiny.

---

## 7. Deploy steps (Vercel, ~10 minutes)

1. `npm i -g vercel` (once).
2. In the repo: `vercel link` (create a new project).
3. Add the secret: Vercel dashboard → Project → Settings → Environment Variables → `ANTHROPIC_API_KEY`. (Also put it in `.env.local` for `vercel dev`.)
4. Local test: `vercel dev`, open the local URL, play a full round, confirm `/api/claude` returns guesses.
5. Ship: `vercel --prod`.
6. Add a custom domain in the dashboard (you already operate domains under SWS — point one at it).

---

## 8. Game internals reference (so nothing gets lost)

### 8a. Guess call — system prompt (verbatim)
> You are playing a drawing-guessing game. You are shown a human's hand drawing on a white background. You do NOT know the intended answer. Look carefully and reason ONLY from the marks actually present. Reply with ONLY raw JSON, no markdown: `{"observation":"one concrete sentence describing the shapes/lines/objects you literally see","guesses":["best","second","third"],"quip":"one short playful aside"}`. Fill 'observation' first and base every guess on it. Guesses are 1-6 words, sincere, best first. Never let the quip change your guesses — if it's hard to read, guess at the closest real thing the marks resemble rather than something random.

Temperature 0.4. The **observation-first** structure is the key fix for guesses feeling random — keep it.

### 8b. Judge call — system prompt (verbatim)
> You judge a drawing-guessing game. Given the SECRET concept the player drew and the guesser's guesses, score how well the guesser captured the concept. Scoring: exact or clear match=90-100; right idea / strong synonym=70-89; adjacent or partial=45-69; vaguely related=20-44; way off=0-19. Be fair but a little generous for abstract concepts. Reply with ONLY raw JSON: `{"score":<int 0-100>,"verdict":"<3-5 word verdict>"}`.

Temperature 0.2.

### 8c. Scoring formula
- `raw` = judge score, clamped 0–100.
- **Hit** if `raw >= 50`.
- Multiplier = `1 + streak * 0.15`.
- Points awarded on a hit = `round(raw * multiplier)`.
- On hit: `streak++`, `hits++`, `score += points`. On miss: `streak = 0`.
- `best = max(best, streak)`.

### 8d. Difficulty tiers
- `tier = hits >= 8 ? 3 : hits >= 4 ? 2 : 1`.
- Tier 1 = concrete, Tier 2 = emotional/abstract, Tier 3 = absurd/meta.
- Round time: 60s for tier 3, 50s otherwise.

### 8e. Image pipeline (`exportForAI`)
Scans the canvas for non-white pixels, computes the bounding box, pads it ~10%, scales the crop so its longest side ≈ 800px, redraws on white, returns base64 PNG. Don't skip this — a small drawing floating in white was the original cause of bad guesses.

### 8f. Prompt deck
~190 prompts in `DECK` (tiers 1/2/3). A `used` Set prevents repeats until a tier is exhausted, then it recycles. When a tier drops to ≤5 unused, `topUpPrompts(tier)` asks the model for 12 fresh ones and appends them. The deck is the source of replayability — keep growing it. (In production, consider moving top-up server-side and persisting the generated prompts to a file or KV store so the library grows permanently instead of per-session.)

---

## 9. Costs & guardrails

- **Per round** = 2 model calls: 1 vision (guess) + 1 text (judge). Plus an occasional 12-prompt generation when a tier runs low.
- **Cost control**: Sonnet for the vision guess (quality matters), Haiku for judge + prompt generation (cheap, plenty good). The proxy's model allow-list lets you tune this without touching the client.
- **Rate limiting** (add before public launch): in `api/claude.js`, cap requests per IP (e.g., Vercel KV or Upstash Redis, or a simple in-memory counter for a soft launch). Prevents a single user from running up the bill.
- **Abuse on prompts**: the deck is curated and the top-up prompt says "family-friendly," but add a quick allow/deny check if you open prompt generation to users.

---

## 10. Launch plan — this week

**MVP for launch = §4 + §5 + §6 + §7.** That's a deployed, playable game. Everything below Day 2 is polish that makes it stickier; cut from the bottom if time runs short.

- **Day 1 — Make it real.** New repo, drop in `index.html`, add `api/claude.js`, swap `callClaude` (§4), set the env var, `vercel dev`, confirm one full round works, deploy to a Vercel URL. *Exit criteria: you can play a round on a live URL from your phone.*
- **Day 2 — Fix the feel.** Apply the canvas grid fix (§5) so the box is huge on mobile. QA pen/fill/eraser/colors on a real device. Tune default pen thickness. Tighten layout so nothing scrolls mid-round.
- **Day 3 — Stickiness.** `localStorage` for best streak. A **Daily Challenge** (same seeded prompt for everyone each day → strong retention + share hook). Improve the share output to a generated image card (render the drawing + verdict + score to a canvas → PNG) instead of plain text.
- **Day 4 — Juice + tuning.** Score count-up, streak fire animation, hit/miss flashes, round-transition feel. Tune the judge generosity from real play. Expand the deck (and move top-up server-side so the prompt library grows permanently).
- **Day 5 — Hardening.** Rate limiting on `/api/claude`. Graceful error/loading states (already partially there). Test across iOS Safari, Android Chrome, desktop. Add a tiny analytics ping (Plausible/Umami) to see where people drop.
- **Day 6 — Ship.** Custom domain, OG/social preview tags, favicon, "share" copy. Final device pass.
- **Day 7 — Soft launch.** Post it, watch the first sessions, fix the top issue.

---

## 11. QA checklist before public launch

- [ ] A full round works on a deployed URL (not just localhost).
- [ ] API key is **only** server-side; never shipped to the client (check the network tab).
- [ ] Canvas fills the screen on a real phone; drawing maps exactly under the finger.
- [ ] Fill tool respects outlines; undo reverts fills.
- [ ] Custom color picker works on mobile.
- [ ] Timer auto-submits at 0; submitting mid-round stops the timer.
- [ ] AI failure shows a clean retry, never a blank/crash, and never loses the drawing.
- [ ] Prompts don't repeat within a session; top-up fires when low.
- [ ] Streak/score/best update correctly across hits and misses.
- [ ] Rate limiting active.
- [ ] Works on iOS Safari + Android Chrome + desktop.

---

## 12. Known issues / debt to carry over

- The prototype's direct `api.anthropic.com` call **does not work off-sandbox** — §4/§6 is the fix, not optional.
- No persistence yet (best streak resets on reload) — §10 Day 3.
- AI top-up is per-session only — make it server-side + persisted for a permanently growing library.
- No leaderboards (would need a DB) — post-launch.
- Single drawing tool set is intentional (skill = communication under pressure), but a "thicker marker" and shapes are easy adds if play-testing wants them.

---

## 13. First message to give Claude Code

Paste this to kick off the repo:

> I'm migrating a working drawing-game prototype to a deployable web app on Vercel. I have `index.html` (complete frontend) and a build plan (`HUNCH_BUILD_PLAN.md`). Read the plan, then:
> 1. Scaffold the repo per §3 (index.html at root, `api/claude.js`, package.json, vercel.json, .gitignore).
> 2. Make the §4 change to `callClaude` so the frontend calls `/api/claude`.
> 3. Add the §6 serverless proxy exactly, reading `ANTHROPIC_API_KEY` from env.
> 4. Apply the §5 canvas grid fix so the drawing area fills the viewport on mobile.
> 5. Get one full round working with `vercel dev`, then we deploy.
> Confirm the plan back to me, flag anything you'd do differently, then start with step 1.

If you're running parallel Claude Code instances: one instance owns frontend feel (§5, Day 2 polish), one owns backend + deploy (§6, §7, rate limiting), one owns content/retention (deck growth, daily challenge, share card). The plan's sections map cleanly to those lanes.

---

## 14. After launch (brief)

This is a web-native, share-driven game — its growth engine is the funny shareable result card and the daily challenge, not an app store. Wrap it as a PWA (installable, offline shell) early; it's nearly free given it's already one page. Keep the prompt library growing — that's the content treadmill that keeps people coming back. Monetization can wait until you see retention, but the cheapest lever is cosmetic (themes/brush packs) or a "pro" tier with unlimited rounds if you ever rate-limit free play.
