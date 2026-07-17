<!-- GRUBTRAP SKINS — art direction + skin system design (Stephen 7/17: "a good idea for themed skins people can unlock and play with") -->

# Grubtrap skins — design

## The system
Grubtrap is our Rodent's Revenge: a field mouse shoves stone planters to pen garden grubs. A SKIN restyles the five stage actors — mouse, planter block, grub, curled seedball, floor tile — and nothing else. Rules, grid, physics untouched.

- One skin = ONE small sheet (3 cols x 2 rows, 512px cells, 1536x1024 master, magenta #FF00FF knockout, floor tile full-bleed).
- Cell order everywhere: 1 mouse · 2 planter block · 3 grub · 4 seedball (penned grub) · 5 floor tile light (full-bleed) · 6 floor tile dark (full-bleed).
- Unlocks are KNOWN and play-earned (no boxes): Snow Day = clear ground 5 · Tide Pool = clear ground 10 · Lantern Night = clear ground 15 · Clockwork = pen 200 lifetime grubs. Classic Garden is the default everyone has.
- Skin picker: a small SKINS row on the title screen using the deck-toggle pattern from the card shelf.
- Cut to satellites/grubtrap/assets/skins/<slug>/{mouse,block,grub,seedball,tile-light,tile-dark}.png, each ≤60KB.

## Readability laws
Mouse must read as the hero at 48px; block reads HEAVY and square; grub reads round and wiggly; seedball is clearly a curled, harmless version of the grub (same colors, closed eyes); tiles stay quiet and low-contrast so actors pop.
