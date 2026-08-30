# RIPCORD — Asset List

Generated from the parts catalogue in `sim2.js`. Counts below are exact.

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
| Core (lock chip) | 10 | 300 | Sits on top; carries the ability tell. Readable from directly above. |
| Blade (weapon) | 10 | 1200 | The silhouette. Tooth count must read as sharpness at a glance. |
| Assist (sub-blade) | 10 | 600 | Seen edge-on under the blade. Nine models plus one empty. |
| Ratchet | 10 | 500 | Seven heights; teeth count visible on the ring. |
| Bit (tip) | 10 | 400 | Small but always in contact — the wear point. |
| Weight | 3 | 120 | Three masses, one mesh each, scaled to fit both rings. |

**53 part meshes total.** A fully dressed top is about 3480 triangles
with four weights fitted; two tops and a stadium should sit near 9k, which is
comfortable on a mid-range phone at 60fps and leaves room for the trail effects.

## 3. Individual parts

### Cores — 10

| id | name | ability | spin | design note |
|---|---|---|---|---|
| ember | Ember | surge | right | Ability tell must be legible at 40px while spinning. |
| frost | Frost | anchor | right | Ability tell must be legible at 40px while spinning. |
| gale | Gale | overdrive | left | Ability tell must be legible at 40px while spinning. |
| iron | Iron | rebound | right | Ability tell must be legible at 40px while spinning. |
| hollow | Hollow | reversal | left | Ability tell must be legible at 40px while spinning. |
| moth | Moth | shed | left | Ability tell must be legible at 40px while spinning. |
| burr | Burr | burrow | right | Ability tell must be legible at 40px while spinning. |
| lash | Lash | lash | left | Ability tell must be legible at 40px while spinning. |
| lodest | Lodestone | lunge | right | Ability tell must be legible at 40px while spinning. |
| quench | Quench | brake | left | Ability tell must be legible at 40px while spinning. |

### Blades — 10

| id | name | sharp | radius mm | design note |
|---|---|---|---|---|
| cleaver | Cleaver | 1.00 | 20.8 | Aggressive: few deep teeth, hard shadow line. |
| sabre | Sabre | 0.78 | 22.2 | Aggressive: few deep teeth, hard shadow line. |
| orbit | Orbit | 0.22 | 24.2 | Round: continuous rim, no catch points. |
| bulwark | Bulwark | 0.34 | 24.6 | Mixed: shallow scallops. |
| talon | Talon | 0.88 | 21.6 | Aggressive: few deep teeth, hard shadow line. |
| wheel | Wheel | 0.45 | 23.8 | Mixed: shallow scallops. |
| shard | Shard | 0.96 | 20.4 | Aggressive: few deep teeth, hard shadow line. |
| anvil | Anvil | 0.52 | 22.6 | Mixed: shallow scallops. |
| halo | Halo | 0.18 | 25.8 | Round: continuous rim, no catch points. |
| crest | Crest | 0.64 | 23.2 | Mixed: shallow scallops. |

### Assists — 10

| id | name | rim friction | design note |
|---|---|---|---|
| none | None | 1.00 | Neutral profile. |
| jag | Jag | 1.45 | Toothed, bites — visible knurl. |
| guard | Guard | 0.70 | Neutral profile. |
| slick | Slick | 0.38 | Smooth, sheds contact — polished band. |
| hook | Hook | 1.80 | Toothed, bites — visible knurl. |
| wing | Wing | 1.00 | Neutral profile. |
| rake | Rake | 1.60 | Toothed, bites — visible knurl. |
| collar | Collar | 0.52 | Smooth, sheds contact — polished band. |
| vane | Vane | 1.15 | Neutral profile. |
| shim | Shim | 0.90 | Neutral profile. |

### Ratchets — 10

| id | height mm | lock teeth | design note |
|---|---|---|---|
| 0-70 | 70 | 0.55 | Teeth count on the ring must match the name. |
| 3-60 | 60 | 0.80 | Teeth count on the ring must match the name. |
| 5-60 | 60 | 1.00 | Teeth count on the ring must match the name. |
| 9-60 | 60 | 1.28 | Teeth count on the ring must match the name. |
| 4-80 | 80 | 0.88 | Teeth count on the ring must match the name. |
| 7-40 | 40 | 1.12 | Teeth count on the ring must match the name. |
| 1-90 | 90 | 0.62 | Teeth count on the ring must match the name. |
| 6-50 | 50 | 1.06 | Teeth count on the ring must match the name. |
| 2-70 | 70 | 0.72 | Teeth count on the ring must match the name. |
| 8-30 | 30 | 1.20 | Teeth count on the ring must match the name. |

### Bits — 10

| id | name | rail gear | design note |
|---|---|---|---|
| flat | Flat | 1.45 | Geared: visible cogs that catch the rail. |
| rush | Rush | 1.55 | Geared: visible cogs that catch the rail. |
| needle | Needle | 0.35 | Sharp or narrow: no rail engagement. |
| ball | Ball | 0.55 | Rounded. |
| point | Point | 0.45 | Sharp or narrow: no rail engagement. |
| gearf | Gear Flat | 1.85 | Geared: visible cogs that catch the rail. |
| taper | Taper | 0.40 | Sharp or narrow: no rail engagement. |
| dome | Dome | 0.62 | Rounded. |
| claw | Claw | 1.62 | Geared: visible cogs that catch the rail. |
| spool | Spool | 0.95 | Rounded. |

## 4. Cosmetics

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

Cosmetic combinations per top: **672**.

## 5. Stadiums

Four, one per mode, all sharing the dish/ridge/pocket topology the physics
already assumes. The rail is the loudest feature and needs to read as a
machined surface distinct from the dish floor.

| Stadium | Mode | Needs |
|---|---|---|
| Chalk Ring | Pangkah (default duel) | dish, rail, 3 pockets, chalk-on-dirt floor |
| The Post | Uri (endurance) | dish plus a raised centre post to transfer onto |
| Taya Circle | Taya (loser pinned as target) | flat ground ring, target marker, no rail |
| Long Range | Tuj lub (target range) | lane, distance markers at 10-70 units |

Each needs: floor albedo + roughness (1024), rail metal trim, pocket lip
geometry, one ambient dust card, and a shadow-catcher plane.

## 6. Effects

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
| Ability tell | ability id | 10 distinct, each under 0.4s, never blocks view |

Ability tells needed: surge, anchor, overdrive, rebound, reversal, shed, burrow, lash, lunge, brake.

## 7. Audio

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

## 8. UI art

The play field is the product. Chrome collapses during a round; the arena is
edge to edge and nothing overlays it but the score.

| Item | Count | Notes |
|---|---|---|
| Part icons | 53 | 96px silhouettes, generated from the meshes at build time |
| Slot glyphs | 6 | core, blade, assist, ratchet, bit, weight |
| Trigger glyphs | 5 | charged, lowSpin, thirdHit, onRidge, behind |
| Finish result cards | 5 | spinout, ringout, knockout, burst, double |
| Grade letters | 6 | S A B C D E, one typeface weight |


## 9. Totals

- **53 part meshes** + 6 launchers + 4 stadiums
- **11 decal masks**, 6 trail ramps, 8 material presets
- **10 ability tells**, 7 physics-driven effects, 22 audio cues

That set of 53 meshes yields **100,000 chassis**, **46,666 weight configurations**, and **4,666,600,000 functionally distinct tops** before a single cosmetic is applied.

Which is the argument for building the workshop first. If 53 meshes cannot be made to feel like billions of choices, the problem is not
the art budget.
