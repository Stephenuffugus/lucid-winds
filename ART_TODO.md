# Art & Asset TODO List

Running list of every custom asset needed across the game. When you batch in Midjourney, pull from here and check off as you go.

Each item: `[ ] filename — prompt` (or description)

---

## GAMES

### Cribbage (Garden Crib)
- [ ] `assets/games/thumbs/cribbage.png` — ornate cribbage peg board with four cardinal pegs and a hand of playing cards fanning out, dark black background, gold accents, flat icon, top-down view --s 250 --ar 1:1
- [ ] `assets/games/cribbage/pegboard-bg.png` (optional polish) — warm wood S-curve pegging board texture, drilled holes, vintage tavern feel, dark background --s 250 --ar 5:2
- [ ] Score breakdown animation art (optional) — leaves/particles for +2 +4 floaters

### Bower Garden (Euchre)
- [ ] `assets/games/thumbs/bowergarden.png` — four playing card Jacks fanning out, bower/arbor archway background, dark black, gold accents, flat icon --s 250 --ar 1:1
- [ ] Table felt background (optional) — green velvet card table texture, dark, subtle, tileable

---

## KEEPER BAR / HUD (all DONE but listed for reference)
- [x] `assets/btn-sunbeams.png` — gold radiant sun
- [x] `assets/btn-dew.png` — golden water droplet
- [x] `assets/btn-slots.png` — botanical slot machine
- [x] `assets/btn-weather.png` — storm cloud + lightning
- [x] `assets/btn-mystery.png` — gold chest with botanicals
- [x] `assets/btn-install.png` — neon seedling pot
- [x] `assets/btn-compendium.png` — leather spellbook
- [x] `assets/compass-main.png` — gold/green botanical compass

---

## COMPASS SKINS (future unlockables)
- [ ] `assets/compasses/compass-autumn.png` — copper + burnt orange, autumn leaves
- [ ] `assets/compasses/compass-winter.png` — silver + ice blue, pine + frost
- [ ] `assets/compasses/compass-spring.png` — rose gold + pink, cherry blossoms
- [ ] `assets/compasses/compass-cosmic.png` — deep purple + gold, starfield

---

## CARD DECK SKINS (future unlockables)
Each themed deck = 52 card faces + 1 back + preview thumbnail

- [ ] Classic Grove (default) — sage/gold botanical
- [ ] Autumn deck — copper + fallen leaves
- [ ] Winter Frost — silver + pine
- [ ] Spring Bloom — rose gold + cherry blossoms
- [ ] Midnight Mycelium — deep purple + glowing spores
- [ ] Desert Bloom — sandstone + terracotta
- [ ] Ocean — teal + coral + seaweed

Deck prompt template:
> minimalist playing card, [SUIT] emblem centered, [RANK] number in corners, dark black background, [THEME] palette, ornate border --ar 2:3 --s 150

---

## BOOK OF SECRETS SECTIONS
- [ ] Wild Events art per tier (optional polish) — small emblems for each discovery
- [ ] Tier dividers — colored leaf/branch separators
- [ ] Locked entry icon — sealed parchment or ? emblem

---

## COMPANION ART AUDIT (previously paused at #49)
- [ ] Resume at idx 49 and walk through remaining 33 companions
- [ ] Each needs a 120x120 SVG-ready sprite
- [ ] Sessions of ~5 companions at a time

---

## SYSTEMS STILL NEEDING ART
- [ ] Anti-farming warning toast icon
- [ ] Pi SDK payment modal styling (launch blocker)
- [ ] Daily quest icons per category

---

## PLAYTEST CHECKLIST (every new game)
- [ ] Plays on desktop browser
- [ ] Plays on mobile (Chrome/Safari)
- [ ] Plays on iPad (perf-lite target)
- [ ] Touch targets ≥ 48px
- [ ] Text ≥ 0.65rem
- [ ] Hash rewards fire correctly
- [ ] GAMES back button works
- [ ] Doesn't leak timers/audio after exit

---

## WORKFLOW
1. Stephen uploads new game → Claude adds entries here
2. When batch art time comes, Stephen pulls list, makes in Midjourney
3. Drop assets in correct folders → Claude wires them up
4. Playtest session → check items off the playtest checklist
5. Commit and move to next
