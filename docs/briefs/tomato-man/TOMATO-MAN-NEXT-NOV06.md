# Tomato Man, what is next (6 Nov 2026, for Stephen's pick)

His notes, 6 Nov: "runs super slow and laggy, the levels need to be a lot better. i may need a level creator for it
because some of the levels you just start out dying which is dumb. the stars can only be gotten when they are in the
sun and not in the shade, the awnings are sitting on the ground. it needs some serious improvement, conceptual ideas
built in and some real gameplay. maybe he needs an attack or something."

## Done today (one deploy line, in START-HERE)
- Nine levels started in the sun (every Tide Pools and Eclipse level, and The Long Dark's last checkpoint). Each now
  starts under an awning, the way worlds 0, 1 and 3 do. Checked in node against the real shade over the whole sun swing.
- Stars (aloe) are grabbed in the shade too. The sun only makes them glow.
- Awnings stand on two poles with the canopy lifted off the sand (wilting ones too while they stand).
- The sun wash is drawn from a small image instead of a fresh full screen gradient every frame, on top of Opus's two
  draw fixes (the ground as tiles, the shade as one path). About twice the frame rate on this box; the Pixel decides.
- THE LEVEL LAB. Open https://lucidwinds.com/satellites/tomato-man/?lab=1 on the Pixel. A LAB button sits under the
  HUD. Tap it: the game pauses and the level opens as a map with the shade drawn at a time you scrub. Move anything by
  dragging (awnings resize from their bottom right corner), add awnings, umbrellas, stars and checkpoints with the
  tool buttons, delete the selected one, drag the start and the flag, tune the sun with four sliders. Play it tests
  the edit at once. Save here keeps it on that phone (the campaign plays your version). Shipped reverts. Copy JSON or
  Share sends the level back: paste it to me and it goes into LEVELS for everyone.

## His pick: what "real gameplay" is
The game has one verb, move, and one enemy, the sun. An attack needs something to hit. Three shapes, pick one:

1. THE SEED TOSS (an attack and a tool in one). Tap to throw a seed in the facing direction. Where it lands a sapling
   sprouts for three seconds and casts a small round shade. Thrown into the Angry Sun's lunge ring it bursts the lunge
   (the sun pants, two seconds of calm). Three seeds a level, refilled at checkpoints. Art: the seed, the sapling's
   sprout and wilt, the burst.
2. SUN CRITTERS. Things that live in the light and chase you across it: a sand scorpion that runs the sun lanes
   between awnings, a heat mirage that copies your last move. You cannot hurt them; you lose them by reaching shade,
   and the SEED TOSS (if both are picked) pins one for two seconds. Art: two critters with run, pin and sink frames.
3. THE SQUIRT. A water pistol with a short range that cools one hot sand patch into walkable ground for five seconds
   and pushes a wilting awning back open. Three squirts a level. Art: the pistol arc, the cooled patch, the splash.

My order: 1, then 2. Both need an Astra round; the brief is written the day he picks.
