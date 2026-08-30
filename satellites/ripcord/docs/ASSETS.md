# RIPCORD — Asset List

**Drive copy:** https://docs.google.com/document/d/1poGxv8ypFCOq9SOvqCGrcMdtjIEYhvOsro_wK1a9sGU/edit

My Drive → stevie weedseed → business materials → Github → Ripcord.
Regenerate it with `node tools/assets.js --drive` and paste the result in.

Generated from the parts catalogue in `sim2.js`. Counts below are exact.

## 0. What Ripcord needs painted today

**Nothing.** The game ships with no image assets at all: every pixel in it is
drawn by code, including the tops, the dish, the twelve decals, the six
launchers and the four stadiums. The only bitmaps in the whole build are the
three app icons and the portal thumbnail, and a script generates those.

So this is not a queue. It is the list for the 3D build, which the brief puts
last and gates on the workshop already being fun, plus a short wants list at
the bottom if you would rather hand paint something sooner.

## 1. The common mount

Every part must interchange with every other part. One skeleton, N runtime
attachments. Fix these dimensions before anyone models anything — a part that
does not honour the mount is not an asset, it is a bug.

```
  axis            vertical, +Y up, origin at the FLOOR CONTACT POINT
  core socket     bayonet, 3 lugs at 120 deg, boss dia 8.0mm, top face Y = 26mm
  blade boss      bayonet ring dia 22.0mm, underside face Y = 18mm
  assist clip     same bayonet, seats 3.0mm below the blade underside
  ratchet thread  M16 x 1.0 into the blade underside, teeth ring dia 14.0mm
  ratchet heights 30 / 40 / 50 / 60 / 70 / 80 / 90  (name encodes it)
  bit shaft       press fit, dia 9.0mm, insertion depth 6.0mm
  weight holes    12 blind holes, dia 3.5mm, depth 4.0mm, on the blade underside
                  inner ring at 0.42 x blade radius, outer ring at 0.80
                  6 per ring, 60 deg apart, hole 0 at +X
```

Model every part at real scale in millimetres, Y up, origin at the mount
face rather than the mesh centre. The renderer stacks parts by mount face, so
a mis-placed origin shows up as a floating blade.

## 2. Part meshes

| Slot | Count | Tri budget each | Notes |
|---|---|---|---|
| Core (lock chip) | 22 | 300 | Sits on top; carries the ability tell. Readable from directly above. |
| Blade (weapon) | 22 | 1200 | The silhouette. Tooth count must read as sharpness at a glance. |
| Assist (sub-blade) | 22 | 600 | Seen edge-on under the blade. One of them is the empty slot and needs no mesh. |
| Ratchet | 20 | 500 | Seven heights; teeth count visible on the ring. |
| Bit (tip) | 24 | 400 | Small but always in contact — the wear point. |
| Weight | 3 | 120 | Three masses, one mesh each, scaled to fit both rings. |

**113 part meshes total.** A fully dressed top is about 3480 triangles
with four weights fitted; two tops and a stadium should sit near 9k, which is
comfortable on a mid-range phone at 60fps and leaves room for the trail effects.

## 3. Individual parts

### Cores — 22

*A core sits on top and is seen from directly above, so whatever tells you which move it carries has to read at 40px while the top is spinning.*

| id | name | tier | move | spin | what it is |
|---|---|---|---|---|---|
| ember | Ember | Stock | surge | right | A warm brass chip that fills at an ordinary pace and hands you back a hard shove of spin when it goes. |
| frost | Frost | Stock | anchor | right | Heavy enough to feel at the centre and slow to fill, and when it does it stands you up and roots you where you are. |
| gale | Gale | Stock | overdrive | left | Almost nothing at the axis and quick to fill, and it doubles how far you travel for two and a half seconds. |
| iron | Iron | Stock | rebound | right | The heaviest stock chip in the case, which loads the tip, and it hands the next strike back half again as hard. |
| hollow | Hollow | Stock | reversal | left | A cored out chip that fills faster than anything else stock and flips your spin direction outright. |
| moth | Moth | Stock | shed | left | The lightest chip made and slow to fill, and it drops every counterweight you fitted the moment it goes. |
| burr | Burr | Stock | burrow | right | Heavy at the centre and unhurried; it digs the tip in and stops you travelling for nearly three seconds. |
| lash | Lash | Stock | lash | left | A middling chip that turns your next three strikes into biters. |
| lodest | Lodestone | Stock | lunge | right | Weighted and quick to fill, and it throws you straight at them once. |
| quench | Quench | Stock | brake | left | Light and slow to fill, and it trades everything left of your travel for spin. |
| ballast | Trim | Forged | scatter | right | A dense trim chip that shuffles your counterweights back into true without giving up a single gram of the mass you paid for. |
| granite | Granite | Forged | stoneskin | right | Solid mineral stock that sits heavy on the axis and hardens you against three seconds of punishment, if it ever fills. |
| windlas | Windlass | Forged | windup | left | A geared winding chip that stalls you at half travel for a second and a half, then throws you forward at nearly double. |
| vise | Pincer | Forged | bite | left | Heavy jaws at the centre that clamp both rims together for two seconds and strip spin off whatever you are touching. |
| kite | Kite | Forged | tether | left | A hollowed chip that weighs almost nothing and fills early enough to hold you out on the rail while the bowl tries to pull you home. |
| reel | Reel | Forged | backspin | left | A light spooled chip that fills early and flips your rim friction for two and a half seconds without turning your travel around. |
| tinder | Tinder | Forged | kindle | left | Almost no metal at the centre, so it catches long before a heavier chip would have, and then simply refuses to slow down for four seconds. |
| wren | Wren | Forged | burrow | left | The lightest stock chip in the case, quick to fill and quick to dig in, though the whole top rides light and shoves easily. |
| bell | Bell | Relic | rebound | left | A thick resonant chip that returns the next strike with half again the force, cut onto teeth so shallow that one solid blow can pop the top apart. |
| magpie | Magpie | Relic | echo | left | A hoarding chip that fills faster than anything ever built and throws the last ability used on you straight back, but it will never grind out a win on spin alone. |
| flint | Flint | Relic | overdrive | right | Barely there at the axis and sullen off the launch, it runs hot for the rest of the round and doubles your travel when it fires. |
| millst | Cairn | Relic | pitch | right | The heaviest chip in the game grinds spin off everything it touches and can spend a quarter of its own to hurl itself outward. |

### Blades — 22

*The blade is the silhouette, and its tooth count has to read as sharpness at a glance from across a dish.*

| id | name | tier | sharp | radius mm | what it is |
|---|---|---|---|---|---|
| cleaver | Cleaver | Stock | 1.00 | 20.8 | The sharpest stock edge on a narrow heavy disc; it cuts, and it feels every hit it takes. Few deep teeth and a hard shadow line. |
| sabre | Sabre | Stock | 0.78 | 22.2 | A long curved edge with real reach, sharp enough to matter and light enough to move. Few deep teeth and a hard shadow line. |
| orbit | Orbit | Stock | 0.22 | 24.2 | A wide smooth ring with nothing to catch on, built to turn for a very long time. Continuous rim, no catch points. |
| bulwark | Bulwark | Stock | 0.34 | 24.6 | Wide, heavy and blunt; it shrugs off far more than it deals out. Shallow scallops. |
| talon | Talon | Stock | 0.88 | 22.4 | A light hooked edge with the most rim grip in the case, made to catch a rim and drag its spin across. Few deep teeth and a hard shadow line. |
| wheel | Wheel | Stock | 0.45 | 23.8 | An honest disc with a modest edge that does nothing badly and nothing brilliantly. Shallow scallops. |
| shard | Shard | Stock | 0.96 | 20.4 | The lightest and nearly the sharpest blade there is, and it takes recoil worse than anything else in the case. Few deep teeth and a hard shadow line. |
| anvil | Anvil | Stock | 0.52 | 22.6 | The heaviest stock blade, dull and dead, made to absorb rather than answer. Shallow scallops. |
| halo | Halo | Stock | 0.18 | 25.8 | The widest stock ring, smooth the whole way round, and it takes less from a hit than anything else made. Continuous rim, no catch points. |
| crest | Crest | Stock | 0.64 | 23.2 | A ridged disc with a usable edge and no particular weakness. Shallow scallops. |
| broadaxe | Broadaxe | Forged | 1.26 | 20.8 | A single deep edge that cuts further into a rim than any stock blade and hands most of the shock straight back up the shaft. Few deep teeth and a hard shadow line. |
| chisel | Chisel | Forged | 1.30 | 18.8 | Every gram is gathered into one narrow point, so it cuts deeper than anything in the stock box and has almost no rim left to carry it. Few deep teeth and a hard shadow line. |
| millstone | Millstone | Forged | 0.48 | 18.8 | A short heavy stone of a wheel that shoulders other tops aside and gives up its reach to do it. Shallow scallops. |
| ploughshare | Ploughshare | Forged | 0.14 | 22.8 | The heaviest plate the mount will carry, ground smooth so it shoves tops off their line instead of cutting them. Continuous rim, no catch points. |
| cartwheel | Cartwheel | Forged | 0.14 | 26.4 | The widest ring the mount will take, with almost no edge left on it; it turns for a very long time and could not hurt anybody. Continuous rim, no catch points. |
| roundel | Roundel | Forged | 0.10 | 21.0 | A packed rim that swallows a hit instead of returning it, with no edge left to answer one. Continuous rim, no catch points. |
| rasp | Rasp | Forged | 0.90 | 22.0 | A file rather than a knife, it grips a passing rim and drags the spin off it instead of throwing it clear. Few deep teeth and a hard shadow line. |
| hailstone | Hailstone | Forged | 0.70 | 23.0 | Hard and polished, it kicks away from every contact it makes and never grips long enough to trade spin. Shallow scallops. |
| shrike | Shrike | Relic | 1.62 | 20.2 | The deepest edge ever fitted to a mount, hung on a blade so light and thin that it begins to give once the spin is gone. Few deep teeth and a hard shadow line. |
| sledge | Sledge | Relic | 1.10 | 21.4 | A hardened face that turns one clean contact into a single enormous blow and never lands another like it. Few deep teeth and a hard shadow line. |
| ingot | Ingot | Relic | 0.46 | 20.6 | A dense billet with barely any rim to it, slow to get moving and then very hard to move. Shallow scallops. |
| hookbill | Hookbill | Relic | 0.70 | 23.0 | A rim cut into meshing teeth that tears spin off whatever it touches and burns through its own doing it. Shallow scallops. |

### Assists — 22

*An assist is only ever seen edge on, in the shadow under the blade. One of them is the empty slot and needs no mesh.*

| id | name | tier | rim friction | what it is |
|---|---|---|---|---|
| none | None | Stock | 1.00 | No sub blade at all, which costs nothing and adds nothing. Neutral profile. |
| jag | Jag | Stock | 1.45 | Teeth under the rim that grip and hit harder, bought with the cushion you give up. Toothed, with a visible knurl. |
| guard | Guard | Stock | 0.70 | A smooth heavy skirt that soaks up a hit and blunts yours in the same breath. Neutral profile. |
| slick | Slick | Stock | 0.38 | Polished until almost nothing catches on it, so contacts glance instead of grabbing. Smooth, a polished band. |
| hook | Hook | Stock | 1.69 | The grippiest sub blade there is, made to mesh with a rim turning the other way. Toothed, with a visible knurl. |
| wing | Wing | Stock | 1.00 | A flared skirt that reaches out and cushions what it catches. Neutral profile. |
| rake | Rake | Stock | 1.60 | Coarse teeth that add reach and real smash, and almost no cushion at all. Toothed, with a visible knurl. |
| collar | Collar | Stock | 0.52 | The heaviest sub blade made, smooth and deep, and it swallows more than anything else stock. Smooth, a polished band. |
| vane | Vane | Stock | 0.94 | Barely there at all, and what little it adds is cushion. Neutral profile. |
| shim | Shim | Stock | 0.90 | A thin packing plate that firms the rim up without changing its shape. Neutral profile. |
| cornice | Cornice | Forged | 0.62 | A broad steel ledge that reaches further than any other assist, with no edge on it at all. Smooth, a polished band. |
| longspur | Longspur | Forged | 1.38 | All the reach of a wide rim on a light frame, with nothing left over to cushion what comes back. Toothed, with a visible knurl. |
| teasel | Teasel | Forged | 2.15 | A ring of fine hooked teeth that mesh with whatever they touch and pass every jolt straight to the tip. Toothed, with a visible knurl. |
| sprocket | Sprocket | Forged | 2.15 | A deep toothed collar that grinds spin off a rival but has no edge left to finish anyone. Toothed, with a visible knurl. |
| lacquer | Lacquer | Forged | 0.28 | A mirror rim that gives a rival nothing to grip and gives you nothing to hide behind. Smooth, a polished band. |
| bolster | Bolster | Forged | 0.66 | A thick fibre pad that swallows a blow whole, and swallows yours as well. Smooth, a polished band. |
| gutta | Gutta | Forged | 2.35 | A soft damping ring that shrugs off impacts and grips everything it meets, so every touch trades spin. Toothed, with a visible knurl. |
| barb | Barb | Forged | 0.34 | A heavy blunt wedge that hits like a hammer and drags the heavy side of the top flat. Smooth, a polished band. |
| eaves | Eaves | Relic | 0.64 | A deep skirt that swallows almost everything thrown at it, bolted on so loosely that one clean blow opens the whole top. Smooth, a polished band. |
| nettle | Nettle | Relic | 3.00 | Teeth like a coarse file that tear spin off anything they touch and burn through your own. Toothed, with a visible knurl. |
| bushing | Bushing | Relic | 0.58 | A soft sleeve that damps every blow and never lets the threads seat tight. Smooth, a polished band. |
| chert | Chert | Relic | 0.22 | A knapped stone edge that lands one devastating blow and is blunt for the rest of the round. Smooth, a polished band. |

### Ratchets — 20

*The name IS the geometry. The number before the dash is the tooth count on the ring and the one after it is the height in millimetres; both have to match the model.*

| name | tier | height mm | lock | what it is |
|---|---|---|---|---|
| 0-70 | Stock | 70 | 0.50 | No teeth worth the name at seventy millimetres, and the lightest ratchet made; it strikes high and it will come apart if you let it get hit. |
| 3-60 | Stock | 60 | 0.80 | Three teeth at sixty millimetres, the plain middle of the case. |
| 5-60 | Stock | 60 | 1.00 | Five teeth at sixty millimetres, the same height with more holding it together. |
| 9-60 | Stock | 60 | 1.28 | Nine teeth at sixty millimetres, most of the lock available at an ordinary height. |
| 4-80 | Stock | 80 | 0.88 | Four teeth at eighty millimetres; it strikes well above the other top's rim and precesses fast for it. |
| 7-40 | Stock | 40 | 1.12 | Seven teeth at forty millimetres, low and tight and hard to reach over a wide blade. |
| 1-90 | Stock | 90 | 0.62 | One tooth at ninety millimetres, the tallest strike plane in the stock case and the easiest thing here to pop apart. |
| 6-50 | Stock | 50 | 1.06 | Six teeth at fifty millimetres, a low steady seat with plenty of lock. |
| 2-70 | Stock | 70 | 0.72 | Two teeth at seventy millimetres, tall and only lightly held. |
| 8-30 | Stock | 30 | 1.20 | Eight teeth at thirty millimetres, the heaviest and lowest ratchet made, so nothing tips it and nothing it hits is high. |
| 0-90 | Forged | 90 | 0.38 | A smooth toothless collar with the strike ring flared out at the crown, so it lands higher than anything else in the box and starts coming apart the moment somebody lands one back. |
| 11-80 | Forged | 80 | 1.46 | Eleven teeth on a tall skeleton body, so it hits high and nothing will burst it, but there is almost no metal left in it to soak up a hit. |
| 11-30 | Forged | 30 | 1.40 | Eleven teeth in a short heavy collar that simply will not come apart, fitted with a strike face buried so far under the blade that it can barely bother anybody. |
| 0-40 | Forged | 40 | 0.29 | A solid slug of a collar that shrugs off shoves and sits low, held on a plain thread with no detents in it at all. |
| 6-30 | Forged | 30 | 1.04 | The heaviest short collar in the workshop, lovely to grind behind and completely unable to reach over anybody. |
| 11-60 | Forged | 60 | 1.46 | A fine eleven tooth ring cut into a drilled out body, unburstable and so light that every hit moves it. |
| 0-60 | Forged | 60 | 0.30 | A thick cast sleeve at normal height that takes a shove like a wall and comes apart on one clean strike. |
| 14-30 | Relic | 30 | 1.70 | Fourteen coarse teeth in a collar that never seats fully, so it rides very low and very steady while the play in the thread lets it pop. |
| 2-90 | Relic | 90 | 1.38 | A flared crown that strikes above its own height and rings every one of those blows straight back through its own teeth. |
| 0-50 | Relic | 50 | 0.20 | A dead weight of a collar on a thread worn smooth, putting everything it has into the first strike it lands and almost nothing into the rest. |

### Bits — 24

*The bit is small and always in contact, so it is the wear point and the one part that is never hidden.*

| id | name | tier | rail gear | what it is |
|---|---|---|---|---|
| flat | Flat | Stock | 1.45 | A broad flat face that travels hard and takes the rail, and burns its spin doing it. Visible cogs that catch the rail. |
| rush | Rush | Stock | 1.55 | Cut for the rail more than the floor, quick to reach it and quick to run out. Visible cogs that catch the rail. |
| needle | Needle | Stock | 0.35 | A fine point that barely touches anything, so it turns for a very long time and goes nowhere. Sharp or narrow, with no rail engagement. |
| ball | Ball | Stock | 0.55 | A rolling ball that keeps its feet under a hit and never chases anybody. Rounded. |
| point | Point | Stock | 0.45 | A plain sharp tip, long spinning and slow moving, and the lightest thing you can stand a top on. Sharp or narrow, with no rail engagement. |
| gearf | Gear Flat | Stock | 1.85 | A geared flat with the most rail bite in the stock case, and the shortest spin to show for it. Visible cogs that catch the rail. |
| taper | Taper | Stock | 0.58 | A tapered tip that turns nearly as long as a needle and can still cross the dish. Rounded. |
| dome | Dome | Stock | 0.62 | A wide dome, the hardest stock tip to knock off its feet. Rounded. |
| claw | Claw | Stock | 1.62 | Toothed and hungry, the fastest travelling tip made and the least stable. Visible cogs that catch the rail. |
| spool | Spool | Stock | 1.02 | A knurled drum that does a little of everything, the rail included. Rounded. |
| bradawl | Bradawl | Forged | 0.35 | A hardened point no wider than a pin, ground for the longest spin in the game and almost no travel at all. Sharp or narrow, with no rail engagement. |
| stillpin | Still Pin | Forged | 0.35 | It parks where you launch it and turns for a very long time; it will not chase anybody and it cannot reach the rail. Sharp or narrow, with no rail engagement. |
| spur | Spur | Forged | 1.55 | The foot is ground on a slant so friction turns into travel, and every jolt it earns goes straight up the thin shank into the teeth. Visible cogs that catch the rail. |
| rowel | Rowel | Forged | 2.32 | A toothed wheel of a tip that hooks the rail harder than anything stock, on a contact ring too small to right itself. Visible cogs that catch the rail. |
| sabot | Sabot | Forged | 0.60 | A broad wooden shoe of a foot that nothing tips over, seated in a soft collar that hands every shock to the lock teeth. Rounded. |
| ferrule | Ferrule | Forged | 0.72 | A long steel collar driven deep into the shaft so no impact reaches the teeth, standing on a foot too narrow to hold you up. Rounded. |
| cleat | Cleat | Forged | 2.20 | A knurled stud that takes the rail on an ordinary top, bought with a shank that pops apart under one solid blow. Visible cogs that catch the rail. |
| plumb | Plumb | Forged | 0.35 | All the metal is in the foot, so shoves barely move it and the loaded tip grinds its spin into the floor. Sharp or narrow, with no rail engagement. |
| agate | Agate | Forged | 0.35 | A polished stone pivot with almost no friction at all, so it turns for a very long time and gets nowhere. Sharp or narrow, with no rail engagement. |
| corundum | Corundum | Relic | 0.35 | A jewelled pivot that runs longer than anything else, seated so loosely that one clean blow takes the whole top apart. Sharp or narrow, with no rail engagement. |
| caltrop | Caltrop | Relic | 2.75 | Coarse cut teeth that bite the rail like nothing in the catalogue, on a top that slides out of the dish at speeds anything else survives. Visible cogs that catch the rail. |
| cobble | Cobble | Relic | 0.35 | A wide flat stone of a foot that will not be tipped over, sitting so loose in the seat that one connected blow pops it apart. Sharp or narrow, with no rail engagement. |
| pintle | Pintle | Relic | 0.35 | The shank goes the full depth of the shaft so nothing bursts it, and it fills so fast that it will fall over rather than outlast you. Sharp or narrow, with no rail engagement. |
| jasper | Jasper | Relic | 0.35 | So slick it barely travels at all, and cold enough off the launcher that the first two seconds are wasted. Sharp or narrow, with no rail engagement. |

## 4. If you want to paint something sooner

None of this is needed and none of it is blocked on anybody. In rough order
of what would show most:

  1. The four stadium floors. They are drawn as chalk on dirt and would take a
     painted texture well, one per mode, 1024 square, seen from straight above.
  2. The twelve decals as painted 256px alpha masks instead of the drawn marks,
     which would let them carry far more detail than four strokes of canvas.
  3. A menu backdrop. The menu currently plays a live round behind itself, which
     is doing the job, so this is the least useful of the three.

What is deliberately NOT on this list: the tops themselves. They are drawn from
their own stats, so a Cleaver has ten teeth because its sharpness is 1.00 and a
Halo has three because its sharpness is 0.18. A painted sprite would have to be
drawn a hundred and ten times and would still be lying about the numbers.

## 5. Cosmetics

None of these touch the simulation. They are the reward currency, and they
are cheap: finishes are two material sliders rather than textures, so the
whole cosmetic layer costs a handful of kilobytes.

| Type | Count | Delivery |
|---|---|---|
| Finishes | 8 | metalness + roughness pair, no texture |
| Decals | 11 | 256px alpha mask, projected onto the blade |
| Spin trails | 6 | gradient ramp, 64x4 |
| Launcher skins | 6 | full mesh, 400 tris, seen only on the wind screen |

Finish list: Raw Steel, Anodised, Matte Black, Brass, Enamel, Weathered, Chrome, Fired Clay.

Decal list: stripe, sunburst, koi, tiger, wave, circuit, moth, flame, crane, chalk, knot.

Cosmetic combinations per top: **4,032**, launchers included.

## 6. Stadiums

Four, one per mode, all sharing the dish/ridge/pocket topology the physics
already assumes. The rail is the loudest feature and needs to read as a
machined surface distinct from the dish floor.

| Stadium | Mode | Needs |
|---|---|---|
| Chalk Ring | Pangkah (default duel) | dish, rail, 3 pockets, chalk-on-dirt floor |
| The Posts | Uri (endurance) | dish plus TWO raised posts, one per top, and no pockets |
| Taya Circle | Taya (loser pinned as target) | the dish with a target mark stood in the middle of it |
| Long Range | Tuj lub (target range) | a 340mm dish marked in five distance bands, no pockets |

Each needs: floor albedo + roughness (1024), rail metal trim, pocket lip
geometry, one ambient dust card, and a shadow-catcher plane.

## 7. Effects

Hard rule from the competitor review: **no canned cutscenes**. Every effect
is driven by a live simulation value, never a triggered animation.

| Effect | Driven by | Notes |
|---|---|---|
| Spin blur ring | `abs(w) / launchSpin` | thickness IS remaining spin |
| Wobble marker | `imb`, `phase` | the heavy side, visible before it lands |
| Clash spark | collision impulse | three tiers by magnitude, not three animations |
| Rail streak | dash event + speed | length scales with the actual boost |
| Burst pop | wear crossing 1.0 | parts scatter using the real part meshes |
| Scrape dust | tip speed on floor | continuous, not triggered |
| Ability tell | ability id | 19 distinct, each under 0.4s, never blocks view |

Ability tells needed, one per distinct move: **19** — surge, anchor, overdrive, rebound, reversal, shed, burrow, lash, lunge, brake, scatter, stoneskin, windup, bite, tether, backspin, kindle, echo, pitch.

## 8. Audio

| Cue | Variants | Notes |
|---|---|---|
| Wind / draw | 3 | pitch rises with drawing speed |
| Launch | 3 | by launch power band |
| Sustain hum | 1 loop | pitch follows spin, the whole match |
| Clash | 5 | by impulse, plus a distinct metal-on-metal for sharp blades |
| Rail grind | 1 loop | only while on the rail |
| Burst | 2 | the payoff sound; must be the loudest thing in the game |
| Ring out | 2 | includes the pocket exit |
| Spin down | 1 | the wobble-and-die, pitch falls with spin |
| Crowd | 4 beds | idle, tense, roar, disappointment |

## 9. UI art

The play field is the product. Chrome collapses during a round; the arena is
edge to edge and nothing overlays it but the score.

| Item | Count | Notes |
|---|---|---|
| Part icons | 113 | 96px silhouettes, generated from the meshes at build time |
| Slot glyphs | 6 | core, blade, assist, ratchet, bit, weight |
| Trigger glyphs | 9 | charged, lowSpin, thirdHit, onRidge, behind, firstBlood, cornered, mirror, late |
| Finish result cards | 6 | spinout, ringout, knockout, burst, double, worn |
| Grade letters | 6 | S A B C D E, one typeface weight |


## 10. Totals

- **113 part meshes** + 6 launchers + 4 stadiums
- **11 decal masks**, 6 trail ramps, 8 material presets
- **19 ability tells**, 7 physics-driven effects, 22 audio cues

That set of 113 meshes yields **5,111,040 chassis**, **46,666 weight configurations**, and **238,511,792,640 functionally distinct tops** before a single cosmetic is applied.

Which is the argument for building the workshop first. If 113 meshes cannot be made to feel like billions of choices, the problem is not
the art budget.
