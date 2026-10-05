import json,os
SP=os.environ['SP']
L=json.load(open(SP+'/doc-lists.json'))
c=L['counts']
def lst(xs): return ', '.join(xs)
flag_lines='\n'.join(f'- **{n}:** {d}' for n,d in L['flagged'])
front=f'''# Sky Wolf Studio: every game, what it is, and where it stands

**As of 5 October 2026.** Built from the live arcade's own catalog (the card list on `lucidwinds.com/portal/`, lucid-winds `main` at `c86ef7f2`), every game folder, and the automated audits run that day. Each game's description is its arcade card's own sentence, word for word. Nothing here is a judgment of how fun a game is: that is Stephen's call, made by playing it.

## 1. What this document is for

Over the next couple of months every game gets worked into a better version of itself. This is the map: what each game is, where its code lives, whether players can see it, and what the automated checks say about it. Use it to pick the next game, to point Claude Code at the right folder, and to know before an edit whether a game is a copy of something that lives elsewhere.

## 2. The studio in one page

- **Sky Wolf Studio** (always singular). Stephen directs and decides every design and economy call. Jessie plays every game as a new player. Claude builds.
- **The arcade** is `lucidwinds.com/portal/`: {c['all']} cards. One is the flagship, **Lucid Winds**. {c['sats']} are **satellite games** (each a folder `satellites/<name>/` in the lucid-winds repo). Two are **page cards** (LOAF, the cat app, and Whack Box, the party game). {c['native']} are **Lucid Winds' own mini games**, each with a standalone page. **{c['open']} are open to players**; the rest are dev-gated (hidden behind the tester gate) or marked "soon".
- **Lucid Winds** is the garden app at the centre: play mini games, earn **Sunbeams**, and every 30 Sunbeams grows a one of one plant (procedural art, its own haiku). It has four tabs: Game, Greenhouse, Nursery, Wild (a real world map).
- **Sunbeams are shared.** Satellite games earn them through `sunbeam-sdk.js` and they land in the player's garden, so the arcade is one economy.
- **Hosting:** the lucid-winds repo's `main` branch is the live site (lucidwinds.com and www.lucidwinds.com, two origins). A push to `main` is a deploy.
- **Store apps are the live site.** A Google Play app here is a Trusted Web Activity: it opens the game's live page, so every deploy of that game reaches paying players at once. Steam's Jumping Jimothy is a vendored build.
- **Where code lives:** most games are folders in lucid-winds. Three are build outputs of their own repos (Pixel Petri from the private `tiny-world`, LUMEN from the private `lumen`, PixelMeba from its own): edit the repo, never the folder. Twelve games are **vendored** from their own GitHub repos (13 cards): fix them upstream and re-vendor, never hand-edit the copy.

## 3. The games that make money or are listed

| Game | Where | State |
|---|---|---|
| **Flock the World** | Google Play, $0.99 | Live since 17 Sep 2026. A Steam package is prepared (`store/ftw-steam`), not live. |
| **Pixel Petri** (folder `tiny-world`) | Google Play | Published 4 Oct 2026. Its design 19 build is finishing now (5 Oct): live `20261005a` carries his first notes since the sale. |
| **Jumping Jimothy** (folder `stream-hop`) | Steam | v9.4 live since 18 Sep 2026. itch and Play folders prepared. |
| **TUMBLE** | Google Play | Submission prepared; waiting on Stephen's Play Console steps. |
| **Tally**, **Hues** | Listdle (daily puzzles) | Listed. |

## 4. The bar every game is held to

When directing an improvement, these are the studio's standing rules, not suggestions:

1. **Readable fonts** that fit the game's style; correct grammar and punctuation.
2. **No dashes of any kind** in anything a player reads.
3. **One concise sentence** for the card description.
4. **Directions, rules and the objective shown before play starts.**
5. **Touch targets at least 48 px**, measured as rendered at phone size.
6. **A way back to the arcade** from inside the game (the arcade's exit contract, `window.SWS_EXIT`).
7. **Installable games work offline**, and a game's service worker never touches another game's cache.
8. **Saves survive**: a damaged or old save never breaks the game.
9. **Looked at on a phone before it is called done.** A passing test is not a look.
10. Feedback is taken **word for word first**, then sorted: a fault, a taste call (Stephen's), or already known.

## 5. Where the games stand: the worklists

These come from automated checks, so read them as leads, not verdicts. "Built well enough to play" cannot be read from files; it takes a person playing.

**Dev-gated: built, not yet graduated to players ({len(L['gated'])}).** {lst(L['gated'])}.

**Marked "soon" ({len(L['soon'])}):** {lst(L['soon'])}.

**No way back to the arcade except the browser's back button ({len(L['stranded'])}).** {lst(L['stranded'])}. (Pixel Petri and TUMBLE are store apps, where an arcade exit may not belong: Stephen's call.)

**Relying on the arcade's injected exit button, nothing of their own ({len(L['graft'])}).** {lst(L['graft'])}.

**A way back that works but is off contract ({len(L['partial'])}).** {lst(L['partial'])}.

**Automated audit flags ({len(L['flagged'])} games).** "parse-without-validation" means saved data is read without checking it, so a damaged save could break the game; "exit-gated-on-frame" means the exit only appears inside a frame; "fetch-without-ok-check" means a network answer is used without checking it succeeded.

{flag_lines}

**Vendored copies have drifted.** All twelve vendored games carry edits made in the copy (three fleet-wide passes, 27 Aug to 6 Sep 2026: SEO tags, the no-dashes sweep, the brand sweep). The next re-vendor would overwrite them unless they go upstream first.

**Folders with no card:** `satellites/math/` (a source folder) and `satellites/slice-master/` (a built game with its own audit notes, not on the arcade).

**Every game's own notes come first.** Many folders hold an `AUDIT-NOTES.md`, `HANDOFF.md` or design notes (listed under each game below). Read them before calling any work outstanding: several audits are already done.

'''
open(SP+'/doc-front.md','w').write(front)
print('front chars',len(front))
