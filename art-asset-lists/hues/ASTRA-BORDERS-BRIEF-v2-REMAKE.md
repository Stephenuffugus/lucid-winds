Google Doc (the delivered copy, 012Assets/Hues): https://docs.google.com/document/d/1OoZIU8BRP-ngW6NmafOmN_6-om2ki75hg3sOCv67_Ig/edit

HUES, Astra brief v2: THE BORDER REMAKE (21 Oct 2026). Replaces the 20 Oct brief.

FOR STEPHEN (read this part, do not paste it)

What went wrong, measured, not guessed. I drew all 112 current frames exactly the way the game draws them and
measured each one. Every single frame paints its rails on top of the color. The game stretches a frame so the
color fills the middle 82 percent of the picture, but the cut frames have a window of only 44 to 75 percent, so
the rails always land on the swatch. That is a spec fault, not a painting fault: the first brief gave Astra a
size but never said WHERE the window is, and the cutter then cropped every frame to its own edges, which shrank
the window further. On top of that, 77 of the 112 carry a magenta halo from the knockout (the "bleed"), and the
corner critters spill outside the frame, which is why the right frog sits on the left swatch in your screenshot.
Pictures: https://lucidwinds.com/docs/briefs/hues/hues-fault-closeup.jpg and the whole pack at
https://lucidwinds.com/docs/briefs/hues/hues-fault-sheet-all-112.jpg

The fix is a TEMPLATE. Astra paints on a sheet that already has the window and the cell edges marked in colors
we cut away. Nothing is cropped any more: a cell is the frame. A script (satellites/hues/borders/check.py)
measures every delivered frame against the same template, so a bad frame is caught before it is cut, and the
pass is machine checked, not eyeballed. Run on the current pack it goes 0 of 112, which is the proof it has teeth.

YOUR CALLS (defaults filled in; change them in the paste or tell me):
1. Which families. Default: SIX families of 8 = 48 borders, plus one EARNED sheet of 8 trophies = 56. The six are
   the ones that read best as a thin rail: Clay Crew, Sticker Book, Pressed Garden, Foil Arcade, Neon, Moss.
   Retired: Crayon Box, Patchwork, Embroidery, Woodblock, Medals, Season Stickers, Clockwork, Fable (they can
   come back later on the same template).
2. The order. Default: Clay Crew first (the critters are the stars and the hardest to get right), then Sticker,
   Pressed Garden, Foil, Neon, Moss, Earned.
3. Attach to your message: the template diagram, the template sheet, and the fault close up (links in the paste).

HOW IT RUNS: one sheet per message from Astra. Drop each sheet in this folder or the chat. I run the gate, cut
it, wire it, and come back with a pass or fail per frame. A failed frame is repainted in its own cell only.

PASTE EVERYTHING BELOW THIS LINE TO ASTRA

You are remaking the picture frame borders for Hues, a phone game by Sky Wolf Studio. The first set did not fit
the game, so this time every frame is painted on an exact template and checked by a script before it is used.
Please follow the template and the rules exactly; the creative part is everything inside the band.

WHAT HUES IS
A target color appears. The player slides a saturation pad and a hue strip until their own swatch matches it,
then locks it in. The two swatches, Target and Yours, sit side by side on every play screen and a border frames
each of them. The look of the game is quiet on purpose: near black, chalk white, one brass accent. The two colors
being matched must be the loudest thing on screen, and the border must never, ever cover them.

THE TEMPLATE (download it, paint on it, never resize it, never move or crop a cell)
Sheet, 4 by 2 cells, 2112 by 832 pixels:
  https://lucidwinds.com/docs/briefs/hues/template/hues-border-sheet-2112x832.png
If your tool works at a larger size, use the double, 4224 by 1664, and keep it exactly that size:
  https://lucidwinds.com/docs/briefs/hues/template/hues-border-sheet-4224x1664.png
The diagram of one cell, with measurements:
  https://lucidwinds.com/docs/briefs/hues/template/hues-border-template-diagram.png
What went wrong last time, so you can see the fault beside the fix:
  https://lucidwinds.com/docs/briefs/hues/hues-fault-closeup.jpg

One cell is 528 by 416 pixels. Inside it:
  the GREEN rectangle, 400 by 288 pixels in the middle, is the WINDOW. That is where the player's color shows.
  the MAGENTA band around it, 64 pixels wide on all four sides, is where the frame is painted.
  the CYAN line is the edge of the cell. The frame ends before it.
The three guide colors are cut away by the script: whatever is still magenta, green or cyan becomes transparent.
So leave them untouched wherever you do not paint. Deliver the whole sheet as one PNG at exactly the template's
size, no transparency, no JPEG.

THE RULES, each with the reason, each one checked by the script
1. NOTHING ON THE GREEN. Not a leaf tip, not a shadow, not a glow, not a highlight. The green is the color the
   player is trying to match; anything painted there sits on top of it in the game. The script allows 1 percent
   of the window for antialiasing and fails the frame above that.
2. NOTHING PAST THE CYAN. The cell is the whole frame. Anything that crosses the cell edge is cut off, and in the
   game it would land on the neighbouring swatch. Zero tolerance.
3. THE FRAME TOUCHES ALL FOUR SIDES. Each rail runs the full length of its side of the window, at least 24 pixels
   thick, and keeps an EVEN thickness along the straight run. The game stretches the straight runs on the shared
   result card, so a rail that changes thickness or carries a one off ornament in the middle will stretch badly.
   Repeating pattern along a rail (coils, stitches, beads, tube segments) is fine; a single centred ornament is not.
4. THE CORNERS CARRY THE PERSONALITY. A critter, a bloom, a badge lives in a corner, inside the band. It may
   spread along the rails, it may be bigger than the rail, it may never cross into the green or past the cyan.
   One or two corners per frame, never all four heavy.
5. NO GUIDE COLORS IN THE ART. No magenta, hot pink or pink purple; no pure green or lime; no cyan or aqua.
   If a family needs pink, use a dusty rose like #E59AA8 or a warm coral like #E0584A; if it needs green, use a
   leaf #74B862 or a moss #5E7A3F; if it needs blue, a sky #6FB5E0 or a navy. The script measures leftover guide
   color in the cut art and fails a frame above 0.3 percent.
6. HARD EDGES AGAINST THE GUIDE COLORS. No soft glow, haze, blur, mist or drop shadow falling onto the magenta or
   the green. A shadow belongs ON the frame (the inner lip of a rail, the underside of a critter), never beside it.
   Neon tubes are drawn as solid tubes with a bright core; their glow is painted as a tight, solid halo that stops
   at a hard edge, not a fade.
7. READABLE AT ONE THIRD SIZE. On a phone the band is about 30 pixels tall. Big simple shapes, strong silhouettes,
   few details, no fine filigree, no thin lines. If a frame only works when you zoom in, it does not work.
8. ONE LIGHT, UPPER LEFT. No text, letters, numbers, logos or watermarks anywhere.
9. ONE FAMILY PER SHEET, eight frames that share one material and one light so they read as a set in the shop.
10. THE WINDOW'S INNER EDGE. In the game the color has rounded corners (about 36 pixels at template scale). Your
    frame's inner edge may be square or rounded up to that; both look right. It must not be wavy or irregular
    anywhere, or the color shows through unevenly.

THE FAMILIES, ONE SHEET EACH, IN THIS ORDER. Each sheet: 8 frames, left to right, top row then bottom row.
Reuse the names given; if you have a better subject for a slot, say so in the assembly note.

SHEET 1, CLAY CREW. Hand squished plasticine, thumbprints, fingernail dents, sausage rolled coils, matte with the
faintest waxy sheen, warm studio light. One clay critter per frame, in a corner, eyes looking in at the color.
  1 Frog Prince (butter and leaf rails, fat frog top left)   2 Inchworm Inn (terracotta, plum worm arched over a corner)
  3 Slow Loop (cream, snail bottom right)   4 Lucky Spots (leaf green, ladybug top right)
  5 Wall Gecko (sky blue, yellow gecko down the left rail)   6 Blob Buddies (rails of squished blob faces)
  7 Clay Chomp (plum, a toothy mouth along the bottom rail)   8 Golden Chameleon (gold clay, chameleon top right, the showpiece)

SHEET 2, STICKER BOOK. Glossy die cut stickers with a thick white outline, slightly overlapping along the rails,
one always half peeling. Collectible energy.
  1 Fruit Stand   2 Space Pack   3 Bug Jar   4 Dino Day   5 Butterfly Pack   6 Summer Shells   7 Snack Time   8 Holo Star Pack

SHEET 3, PRESSED GARDEN. Herbarium flowers and leaves pressed flat, gold leaf edges, watercolor paper. The elegant
set for players who do not want critters.
  1 Fern Press   2 Pansy Press   3 Rose and Thorn   4 Olive Branch   5 Wildflower Meadow   6 Maple Fall   7 Lavender Rows   8 Gilded Laurel

SHEET 4, FOIL ARCADE. Holographic trading card foils and chrome, the chase tier. Solid rendered shine, no haze.
  1 Rainbow Foil   2 Chrome Comet   3 Prism Grid   4 Black Gold   5 Oil Slick   6 Starfield Foil   7 Crown Foil   8 Trophy Foil

SHEET 5, NEON. Glass tube signs in one or two colors per frame, bright solid core, tight hard edged halo, dark
metal clips at the corners.
  1 Coral Tube   2 Mint Tube   3 Hummingbird   4 Dragonfly   5 Octopus Coil   6 Sea Serpent   7 Butterfly Sign   8 Cat Sign

SHEET 6, MOSS. Mossed stones, ferns, mushrooms, crystals, a snail; a terrarium wall. Deep greens and greys, a
little mist painted ON the moss only.
  1 Stone and Moss   2 Mushroom Ring   3 Fern Grotto   4 Crystal Moss   5 Deep Moss   6 Snail Garden   7 Terrarium   8 Lantern Moss

SHEET 7, EARNED (trophies, never bought). Quieter and finer than the shop families: brass, slate, enamel.
  1 Seven Day Streak   2 Thirty Day Streak   3 Hundred Day Streak   4 Perfect Daily (five perfect matches)
  5 Stage Fifteen   6 Stage Thirty   7 Versus Winner   8 First Perfect Match

ASSEMBLY NOTE, at the end of every reply: the sheet's family name; then one line per cell, 1 to 8: its name,
one short description, and which corner carries the character. If you made a second "alive" frame for a critter
(eyes blinking, a wiggle), deliver it as a second full sheet with every frame in the same cell, and say which
cells changed.

WHAT HAPPENS NEXT. We run each sheet through the checker the moment it arrives and reply with a pass or fail per
cell and the reason. A failed cell is repainted on its own, in its own cell, on the same template.
