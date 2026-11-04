# Meshy handoff

The PNG files are individual image-to-3D references, not GLB models. The outer marble is always a true sphere built by the game. Do not ask Meshy to reconstruct glass, reflections or a complete marble from a glossy picture.

1. Upload one figure reference at a time. Generate the insert only. Keep the supplied name and ID.
2. Inspect all sides. One view cannot guarantee the back, hidden hands or watertight geometry. Remove stray islands, fill holes and join touching parts where needed.
3. Reduce to a proposed 2500 triangle LOD0 and 800 triangle LOD1. Use matte material and at most two material slots; prefer a shared palette atlas. Test the eye and pose at 140 px.
4. Center the complete insert at its enclosing sphere center. Scale the furthest vertex to radius at most 0.0077 m: 70 percent of the 0.011 m outer sphere radius. This is spherical fit, not merely a bounding-box height fit. Do not enlarge after applying transforms.
5. Export GLB with meters, Y up, transforms applied. Keep outer sphere, collider, abilities and physics in game code. The insert never has a separate physical collider.
6. Expected original output paths: assets/models/grails/the_drowned_knight.glb, the_astronomer.glb, koi.glb, the_ember_dragon.glb. Expansion IDs are in catalog/expansion.json. Only connect them after registration and save migration.
7. Use the existing meshyfit pipeline named by the handoff if it exists in the real repository. It is not included here and has not been executed. Reuse persisted task IDs to resume failed work; do not restart paid generations blindly.
8. Check front, rear, left, right and top at 140 px, low tier fake glass and high tier transmission. No clipping, floating prop, unreadable silhouette or detached antenna. A source image is not proof that the generated mesh passes.

The Astronomer's handheld lens and Koi's thick fins need special cleanup. Every new figure is cosmetic until a balanced gameplay kit is deliberately assigned. The First Marble uses concentric code-built spheres and receives no Meshy image.

## Acceptance table
| Test | Pass |
|---|---|
| Shape | Recognizable in monochrome at 140 px |
| Fit | All vertices inside 7.7 mm radius after centering |
| Topology | No loose islands or paper-thin floating details |
| Runtime | LOD0 and LOD1 exported, triangle and material counts recorded |
| Scale | Outer game sphere stays 22 mm; no physics changes |
| Save | New catalog ID does not replace any existing ID or UID |
| Loading | Asset fetched only when needed, no missing offline fallback |

No Meshy jobs, account charges or GLB validation were performed in this delivery.
