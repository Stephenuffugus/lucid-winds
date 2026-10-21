# Remaining work after the character chunk

The user requested smaller chunks to manage plan limits. Do not regenerate completed characters. The 60 delivered source images remain the starting point. No estimate of remaining account allowance is available.

## Suggested next chunks

| Chunk | Images | Scope |
|---|---:|---|
| A | 4 | Pop, escape, dust and glint effects |
| B | 7 | Two pickup sheets and five world tile/object sheets |
| C | 5 | One base background per world |
| D | 3 | Title art, store banner and app icon |

A–C support gameplay presentation. D can wait until the game art has been integrated. The optional 20 extra room backgrounds and bonus features are outside the 79-image main list.

## Exact missing files

- `effects/fx_pop.png`
- `effects/fx_escape.png`
- `effects/fx_dust.png`
- `effects/fx_glint.png`
- `pieces/pieces_treasures_a.png`
- `pieces/pieces_treasures_b.png`
- `pieces/pieces_moss_moon.png`
- `pieces/pieces_crystal_caverns.png`
- `pieces/pieces_rust_belt.png`
- `pieces/pieces_frost_ring.png`
- `pieces/pieces_magma_core.png`
- `backgrounds/bg_moss_moon.png`
- `backgrounds/bg_crystal_caverns.png`
- `backgrounds/bg_rust_belt.png`
- `backgrounds/bg_frost_ring.png`
- `backgrounds/bg_magma_core.png`
- `promo/title_art.png`
- `promo/store_banner.png`
- `promo/app_icon.png`

## Resume without repeated work

Use the saved prompts, frame order, references and suggested timing in production-plan.json. The first missing item is fx_pop. Preserve all completed named masters. Generated images used the built-in image tool. Current canonical prompts are recorded for the queue; small corrective generation instructions may only appear in the conversation.

For each next chunk: generate its missing images, visually inspect them, update the measurements/status and archive, then deliver the checkpoint. Do not start an additional chunk merely to fill a tool window.

## Developer work remains

Remove green/magenta key fields with tolerance and edge despill; normalize body scale; align semantic roots across action changes; pack equal runtime cells; wire state transitions to actual game events; test at gameplay size. Airborne sheets may contain vertical pose displacement that must not double the physics jump arc. Measured foreground bounds are extraction aids, not anchor or collider definitions.

The 25-room design document is a construction plan only. No maps, collision code, level geometry or playtest results were produced.
