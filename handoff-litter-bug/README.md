# Litter Bug

> A cozy collection game where you forage trash and hatch procedurally unique insects from it.

Single-file vanilla JS / HTML5. No build step. Open `index.html` in a browser and it runs.

## Quick start

```bash
# Run the local game (any modern browser):
open index.html        # macOS
xdg-open index.html    # Linux
# or just double-click it

# Run the safety smoke harness:
npm install            # one-time, pulls jsdom
npm run smoke
```

You should see `16 pass, 0 fail`. If anything fails, the engine is broken — don't ship.

## For Claude Code

If you are an AI agent picking this up: read `CLAUDE.md` first, then `HANDOFF.md`. Together they tell you what this project is, what is already built, what to build next, and the rules of the road.

The short version: the SHA-256 hash pipeline, the layered SVG compositor, and the smoke harness are all working. You are extending art layers and building UI on top of a battle-tested engine inherited from a sibling project.

## For humans

`HANDOFF.md` has the game vision, design pillars, build phases, and decisions still open. Start there.

## Project structure

```
index.html                          # the entire client
CLAUDE.md                           # AI agent instructions
HANDOFF.md                          # project context for fresh sessions
README.md                           # this file
api/
  create-checkout-session.php       # Stripe Checkout backend
  stripe-config.example.php         # template (real file lives on server)
assets/                             # art (add as you ship)
games/                              # mini-game modules (build as you go)
scripts/
  smoke.js                          # jsdom safety harness
```

## License

TBD — talk to Stephen.
