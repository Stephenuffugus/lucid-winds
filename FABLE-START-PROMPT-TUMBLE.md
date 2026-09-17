# Prompt to start Fable on TUMBLE (paste the block below as the first message)

```
Fable, this is a fresh codespace. Take over TUMBLE, the cozy 3D sock sorting game Opus built overnight on Sep 17
and then polished. It is live and on the portal (Test Lab, In Development). I am testing it on my Pixel 9 and other
people are testing it too.

Do this first, in order:
1. Restore memory: clone Stephenuffugus/sws-memory into ~/.claude/projects/-workspaces-lucid-winds/memory
   (see the top line of MEMORY.md), then read /workspaces/lucid-winds/START-HERE.md top to bottom.
2. Read /workspaces/lucid-winds/HANDOFF-FABLE-TUMBLE-SEP17.md completely. It is your guide: what was built, how it
   is deployed, the version stamp rule, the gate list, the changes Opus is least sure of, and the known gaps.
3. Set up: cd satellites/tumble && npm install && npm test (11 suites should pass).

Then check Opus's work, honestly and adversarially, against satellites/tumble/DESIGN.md (the contract) and
satellites/tumble/docs/OPUS_PROMPT.md (the brief):
- Rerun the browser gates one at a time (sh dev/run-gates.sh, about an hour; two cores, never two browsers at once).
  All nine passed on the final build before shutdown; confirm that yourself.
- Make the screenshot tour (node tools/tour.mjs dev/out/tour3) and LOOK at every shot. A green gate is not a look.
- Check the live site (node dev/probe-live.mjs and node dev/probe-portal.mjs).
- Read the code paths in the handoff's "least sure" table and try to break them.
- Tell me what is wrong in one ranked list: faults first, then taste calls for me, then anything that is fine.

Rules while you do it:
- Fix faults, gate each fix (watch the gate fail first), and deploy with git push origin add-sproing-jumper:main,
  after checking git log HEAD..origin/main. Every code deploy bumps the version in satellites/tumble/sw.js,
  src/config.js and index.html together, and the ?v= on the TUMBLE card in portal/index.html.
- Taste calls, names, prices and the shape of the game are mine: recommend, do not build them unasked.
- When I bring phone notes, write them down verbatim first, then sort each into fault, taste, or already known,
  and tell me which.
- No dashes in anything a player reads. The studio is Sky Wolf Studio. Touch targets at least 48 px.
- Do not touch Jimothy (it releases on Steam Friday Sep 18) or any other game unless I ask.
- Commit and push after every change, and keep START-HERE.md, the handoff and memory current in the same turn.
```
