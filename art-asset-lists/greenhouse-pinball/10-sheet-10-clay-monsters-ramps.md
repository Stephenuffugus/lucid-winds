<!-- Blobworks · NEW Sheet 10 (Stephen 7/20): CLAY BLOB-MONSTER BUMPERS + MODULAR RAMPS -->
<!-- Redo the "purple monsters in the middle" as the game's namesake clay blobs; build ramps as snap-together pieces. -->

STYLE — "Blobworks Clay": hand-squished plasticine (Aardman), soft studio light from upper-left, visible thumbprints and fingernail dents, matte with a faint waxy sheen and one glossy channel where the ball rolls. Cozy, goofy, kid-thumbed, never scary. Sits on the midnight-greenhouse black #0d100c and leans the requested purples: grape #7a4fb0, orchid #b07fd0, plum #5e3b78, with gold-green #8fce6a + cream #efe6d4 accents and a rose #e58fa0 pop.

CUTOUT SPRITE SHEET. File 2048x2048, 4x4 grid, each cell 512x512, one item centered per cell. Flat magenta #FF00FF in EVERY cell for knockout — NO magenta inside the art. Top-down to match the table. Bold silhouettes readable at ~150px. Compress each cropped asset under 150KB.

CELLS (left to right, top to bottom):
1. blob_grape_idle — fat round grape-purple clay blob bumper from above, two big goofy googly eyes, a little grin, thumbprint dents; collision circle is the whole blob (~150px).
2. blob_orchid_idle — same silhouette, orchid-purple, eyes crossed the other way for variety.
3. blob_plum_idle — same, deep-plum, sleepy half-lidded eyes; the calm one.
4. blob_lit — STRUCK state: the blob squashed wide with a cream halo puff, eyes popped wide, a couple of clay droplets flying, brighter. (Engine swaps to this on hit for ~120ms.)
5. sling_blob_L — a smaller wedge-shaped clay blob slingshot for the left kicker (~90px), one eye, a taut "loaded" mouth.
6. sling_blob_R — mirror of cell 5 for the right kicker.
7. mini_blobling — a tiny clay blobling for scatter/idle table dressing (optional).
8. blob_king — an optional big boss blob for a bonus target (bigger, a crown of clay horns).
--- MODULAR RAMP PIECES (all the SAME channel width so the engine snaps them into any path) ---
9. ramp_straight — a straight clay gutter segment, warm bark-brown clay walls, a glossy sage-green channel down the middle; tiles seamlessly end-to-end with any other ramp piece.
10. ramp_curve_L — a 90 degree gentle left curve, same wall/channel, entry and exit openings aligned to the straight piece.
11. ramp_curve_R — mirror, right curve.
12. ramp_kicker — a steep up-kicker segment that launches the ball; a little clay spring detail.
13. ramp_mouth — the entry MOUTH of a ramp (a flared clay funnel lip) so the player can see where a ramp begins.
14. ramp_exit — the exit LIP where the ball drops back onto the table; a soft clay lip + shadow.
15. ramp_gate_idle / ramp_gate_lit — an optional one-way gate flap (draw idle; lit = just passed).
16. ramp_join_cap — a short connector/cap to hide the seam where two segments meet.

WIRE NOTES (engine, after art lands): swap the procedural flower bumpers for blob_*; on hit show blob_lit ~120ms then back. Build ramp paths by snapping ramp_mouth -> straight/curve segments -> ramp_exit along the existing ramp collision lines; keep every segment the same channel width so any path composes. Also queued (code, not art): shrink the top-left twin slime tube (too big); redo Blip's early "skippy" hop using the movement sheet Stephen provided.
