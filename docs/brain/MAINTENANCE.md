# 🧠 Brain maintenance — how it stays polished & up to date

> The brain is only worth having if it doesn't rot. This is the discipline.
> It's short on purpose. Follow it and the index stays true.

## The one rule

**One source of truth per fact.** A number, a rule, a rate lives in exactly
one canonical file. Everywhere else *points* at it — never copies it. The
moment a fact is copied into two files, they drift, and the brain is lying.

When you find the same fact stated in two places, that's a bug. Pick the
canonical home (see `INDEX.md` domains), keep it there, and replace the other
copy with a pointer.

## Where each thing lives (boundaries)

- **`CLAUDE.md`** — operating rules, glossary, non-negotiable numbers, the
  source-of-truth pointers. It's auto-loaded, so it's the *map*. Push deep
  detail down into a domain file and link it; don't let CLAUDE.md grow into
  the encyclopedia.
- **`docs/brain/` + domain files** — the depth. The thing you read before
  changing a system.
- **`.claude/.../memory/`** — what *happened* and how to *work* (sessions,
  feedback, user). Not durable spec. If a memory note states a spec fact,
  the spec file wins.

## Triggers — when you change X, update Y (same commit)

| You changed… | Also update… |
|---|---|
| A rarity / economy / drop number in code | `CLAUDE.md` table **and** `STALENESS.md` if a doc still shows the old value |
| The sunbeam SDK or earn amounts | `SUNBEAM_SDK.md`, `EARN_AUDIT.md`, `NEW_GAME_PROMPT.md`, `play/shell.js` |
| Added/retired a game | `GAMES_MANIFEST.md` + portal `GAMES`/`FEATURED` arrays |
| Added/retired a doc | The matching domain block in `INDEX.md` |
| Onboarded a satellite | `portal/index.html` `FEATURED`, and the game's own `GAME_CARD.md` |
| Resolved a `STALENESS.md` entry | Delete that entry; drop the ⚠️ in `INDEX.md` |

## Marks (keep them honest)

- 🔒 **pinned** — file is served at a live URL or deploy path. Do **not**
  move/rename. (`SUNBEAM_SDK.md`, `PARTNER_INTEGRATION.md`, `sunbeam-sdk.js`, `CLAUDE.md`.)
- ✍️ **draft** — not live yet. Don't cite it as fact.
- ⚠️ **stale** — has a known-drift entry in `STALENESS.md`.

## Cadence

- **Per change:** honor the trigger table above. This is 90% of staying current.
- **Per session wrap:** if the session touched a system, glance at that
  domain block — still accurate? Fix or flag.
- **Periodic sweep:** when `STALENESS.md` grows past ~6 entries, do a pass and
  burn it back down. Stale facts are worse than missing ones.

## Don't

- Don't add a new doc when an existing one is the right home — extend it.
- Don't copy a number "for convenience." Link.
- Don't move a 🔒 file.
- Don't let `MEMORY.md` exceed its size limit — keep index lines to one line
  each; push detail into topic files.
