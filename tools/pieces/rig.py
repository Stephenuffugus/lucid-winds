#!/usr/bin/env python3
"""tools/pieces/rig.py — THE arcade piece rig.

    blender -b --factory-startup -P tools/pieces/rig.py -- --set dice
    blender -b --factory-startup -P tools/pieces/rig.py -- --list

Why this exists
---------------
The Sep 04 fleet audit found ~261 "props, pieces and tiles" wanted across the arcade,
and the recurring complaint was not that any single piece looked bad — it was that
nothing looked like it came from the same world. Twenty-odd games draw physical objects
(dice, discs, tokens, tiles, rings, stones) as flat CSS shapes or emoji, each invented
separately.

So the fix is not 261 drawings. It is ONE rig: a locked camera, a fixed three-point
light, one material set, one output size. Anything that goes through it comes out
looking like it was photographed on the same shelf, whether the mesh was built here
procedurally or sculpted elsewhere and imported.

⚖️ Procedural vs Meshy, and why dice are built here rather than bought:
a d6 is a rounded cube with pip holes — Blender makes it exactly, free, in seconds, and
the pip count is *correct* rather than approximately right. Meshy's credits are worth
spending on organic and ornate shapes that are genuinely expensive to model by hand
(creature pawns, carved tokens, sculpted showpieces). Both routes render through THIS
rig, so they still match. Import a Meshy GLB with --glb and it gets the same treatment.

House style it renders to (CLAUDE.md): midnight greenhouse — deep near-black grounds,
sage green, warm gold, cream, a touch of rose. Warm key, cool fill, soft rim.

Output: tools/pieces/out/<set>/<name>.png, transparent, square, 512px.
"""
import bpy, bmesh, sys, os, math, json
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')

# ── house palette (CLAUDE.md CSS variables) ────────────────────────────────────
# ⛔ Blender's Base Color wants LINEAR values, but a CSS hex is sRGB. Feeding sRGB
# straight in lightens everything: the first pass rendered house sage #7ab356 as a
# pale mint that did not read as the brand colour at all, and I mistook it for the
# key light being too hot. Convert, then light. Sep 04 2026.
def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def srgb(r, g, b, a=1.0):
    """CSS hex components (0-1 sRGB) -> Blender linear RGBA."""
    return (_lin(r), _lin(g), _lin(b), a)

PAL = {
    'bg':    srgb(0.051, 0.063, 0.047),   # --bg    #0d100c
    'sage':  srgb(0.478, 0.702, 0.337),   # --sage  #7ab356
    'gold':  srgb(0.784, 0.659, 0.294),   # --gold  #c8a84b
    'cream': srgb(0.910, 0.863, 0.784),   # --cream #e8dcc8
    'rose':  srgb(0.831, 0.510, 0.549),   #         #d4828c
    'dark':  srgb(0.086, 0.098, 0.078),   #         #161914
    'stone': srgb(0.435, 0.451, 0.420),
    'wood':  srgb(0.361, 0.243, 0.153),
}

RES = 512


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgba, rough=0.45, metal=0.0, emit=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = rgba
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'Emission Color' in b.inputs:
        b.inputs['Emission Color'].default_value = rgba
        b.inputs['Emission Strength'].default_value = emit
    return m


def setup_rig():
    """The locked camera + lights. NOTHING per-piece may change these — that is the
       whole point. A piece that needs a different angle gets a different SET."""
    scn = bpy.context.scene
    scn.render.engine = 'CYCLES'
    # This Blender is built without OpenImageDenoiser, so buy the clean image with
    # samples instead of denoising it. 160 is where the pip shadows stop fizzing at 512px.
    scn.cycles.samples = 160
    try:
        scn.cycles.use_denoising = False
        scn.cycles.device = 'CPU'
    except Exception:
        pass
    scn.render.resolution_x = RES
    scn.render.resolution_y = RES
    scn.render.film_transparent = True          # sprites drop onto any board
    scn.render.image_settings.file_format = 'PNG'
    scn.render.image_settings.color_mode = 'RGBA'

    # camera: a gentle three-quarter look-down. High enough to read the top face,
    # low enough that the object still has a side and therefore weight.
    cam_data = bpy.data.cameras.new('rig_cam')
    cam_data.type = 'ORTHO'                     # ortho: a token is a token at any position
    cam_data.ortho_scale = 1.55
    cam = bpy.data.objects.new('rig_cam', cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = Vector((1.6, -1.9, 1.5))
    cam.rotation_euler = (math.radians(55), 0, math.radians(40))
    scn.camera = cam

    def lamp(name, kind, energy, loc, size=2.0, color=(1, 1, 1)):
        d = bpy.data.lights.new(name, kind)
        d.energy = energy
        d.color = color
        if kind == 'AREA':
            d.size = size
        o = bpy.data.objects.new(name, d)
        o.location = Vector(loc)
        bpy.context.collection.objects.link(o)
        # aim at origin
        do = o.location.normalized()
        o.rotation_euler = do.to_track_quat('Z', 'Y').to_euler()
        return o

    # Warm key upper-left, cool fill right, soft rim behind — the house "warm rim light".
    # ⚠️ Key energy is deliberately modest. The first pass ran it at 320 and every piece
    # came out pastel: house sage #7ab356 rendered as pale mint and stopped reading as the
    # brand colour at all. Light for SHAPE, let the material carry the hue.
    lamp('key',  'AREA', 140, (-2.0,  -2.2, 3.0), size=3.0, color=(1.00, 0.90, 0.74))
    lamp('fill', 'AREA',  45, ( 2.6,  -1.4, 1.2), size=3.5, color=(0.74, 0.86, 1.00))
    lamp('rim',  'AREA', 110, ( 0.4,   2.6, 1.8), size=2.0, color=(0.85, 1.00, 0.78))

    # A contact shadow, caught on an invisible floor. Without it every sprite floats and
    # reads as pasted onto the board instead of sitting on it. shadow_catcher keeps the
    # PNG transparent everywhere the shadow is not.
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, -0.5))
    floor = bpy.context.object
    floor.name = 'shadow_floor'
    floor.is_shadow_catcher = True

    world = bpy.data.worlds.new('rig_world')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (0.03, 0.04, 0.03, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = 0.35
    scn.world = world
    return cam


def shade_smooth(ob, angle=math.radians(32)):
    for p in ob.data.polygons:
        p.use_smooth = True
    mod = ob.modifiers.new('bevel', 'BEVEL')
    mod.width = 0.012
    mod.segments = 3
    mod.limit_method = 'ANGLE'
    mod.angle_limit = angle


# ── the pieces ────────────────────────────────────────────────────────────────
PIPS = {
    1: [(0, 0)],
    2: [(-.42, -.42), (.42, .42)],
    3: [(-.42, -.42), (0, 0), (.42, .42)],
    4: [(-.42, -.42), (-.42, .42), (.42, -.42), (.42, .42)],
    5: [(-.42, -.42), (-.42, .42), (0, 0), (.42, -.42), (.42, .42)],
    6: [(-.42, -.45), (-.42, 0), (-.42, .45), (.42, -.45), (.42, 0), (.42, .45)],
}
# opposite faces sum to 7, like a real die — a detail nobody names but everybody feels
FACES = [
    (1, ( 0,  0,  1), ( 0, 0, 0)),
    (6, ( 0,  0, -1), (math.pi, 0, 0)),
    (2, ( 1,  0,  0), (0, math.radians(90), 0)),
    (5, (-1,  0,  0), (0, math.radians(-90), 0)),
    (3, ( 0, -1,  0), (math.radians(-90), 0, 0)),
    (4, ( 0,  1,  0), (math.radians(90), 0, 0)),
]


def make_die(body_col, pip_col, label):
    """A real d6: rounded cube, pips inset on all six faces, 7-sum opposites."""
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    die = bpy.context.object
    die.name = 'die_' + label
    b = die.modifiers.new('round', 'BEVEL')
    b.width = 0.085
    b.segments = 6
    b.limit_method = 'ANGLE'
    die.data.materials.append(mat('die_body_' + label, body_col, rough=0.36))
    for p in die.data.polygons:
        p.use_smooth = True

    # Pips are RECESSED and DARK. First pass made them cream spheres sitting proud of the
    # face: on a sage die they read as blobs of icing, not pips, and at sprite size the
    # count was unreadable. A real pip is a drilled hollow — so sink the sphere below the
    # surface so only a shallow dished cap shows, and give it a dark, matte material that
    # holds its own shadow.
    pip_m = mat('die_pip_' + label, pip_col, rough=0.62)
    pips = []
    SINK = 0.46          # < 0.5 = below the face plane, so the pip reads as a hollow
    for n, normal, rot in FACES:
        for (u, v) in PIPS[n]:
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.10, segments=24, ring_count=14)
            s = bpy.context.object
            nx, ny, nz = normal
            # Flatten along THE FACE'S OWN normal, not always world Z. The first pass
            # scaled every pip (1,1,0.55), so pips on the four side faces were flattened
            # across the wrong axis and bulged out of the die by their full radius.
            if nz:
                s.location = (u * 0.5, v * 0.5, nz * SINK)
                s.scale = (1, 1, 0.55)
            elif nx:
                s.location = (nx * SINK, u * 0.5, v * 0.5)
                s.scale = (0.55, 1, 1)
            else:
                s.location = (u * 0.5, ny * SINK, v * 0.5)
                s.scale = (1, 0.55, 1)
            s.data.materials.append(pip_m)
            for p in s.data.polygons:
                p.use_smooth = True
            pips.append(s)
    return [die] + pips


def make_disc(col, rim_col, label, height=0.16, bevel=True):
    """A counter/token: the c4, checkers, reversi, mancala family."""
    bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=height, vertices=64)
    d = bpy.context.object
    d.name = 'disc_' + label
    d.data.materials.append(mat('disc_' + label, col, rough=0.34))
    if bevel:
        m = d.modifiers.new('round', 'BEVEL')
        m.width = 0.028
        m.segments = 4
        m.limit_method = 'ANGLE'
    for p in d.data.polygons:
        p.use_smooth = True
    # a raised inner boss so the token reads as moulded, not as a flat circle
    bpy.ops.mesh.primitive_cylinder_add(radius=0.31, depth=height * 1.22, vertices=48)
    boss = bpy.context.object
    boss.name = 'discboss_' + label
    boss.data.materials.append(mat('discboss_' + label, rim_col, rough=0.42))
    m2 = boss.modifiers.new('round', 'BEVEL')
    m2.width = 0.02
    m2.segments = 3
    m2.limit_method = 'ANGLE'
    for p in boss.data.polygons:
        p.use_smooth = True
    return [d, boss]


def make_ring(col, label, major=0.42, minor=0.13):
    """Hanoi disks / ring-stacker."""
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=64, minor_segments=20)
    t = bpy.context.object
    t.name = 'ring_' + label
    t.scale = (1, 1, 0.62)
    t.data.materials.append(mat('ring_' + label, col, rough=0.33))
    for p in t.data.polygons:
        p.use_smooth = True
    return [t]


def make_stone(col, label, seed=0):
    """Stone Garden / cairn pebble — an ico sphere pushed out of round."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.5)
    s = bpy.context.object
    s.name = 'stone_' + label
    s.scale = (1.0, 0.82, 0.58)
    me = s.data
    bm = bmesh.new(); bm.from_mesh(me)
    import random
    random.seed(seed + 7)
    for v in bm.verts:
        v.co += v.normal * random.uniform(-0.055, 0.055)
    bm.to_mesh(me); bm.free()
    s.data.materials.append(mat('stone_' + label, col, rough=0.72))
    for p in me.polygons:
        p.use_smooth = True
    m = s.modifiers.new('smooth', 'SUBSURF')
    m.levels = 1
    m.render_levels = 2
    return [s]


def make_tile(col, face_col, label):
    """Mahjong / mosaic / gardenlines tile: a slab with a recessed face."""
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    t = bpy.context.object
    t.name = 'tile_' + label
    t.scale = (0.40, 0.52, 0.20)
    b = t.modifiers.new('round', 'BEVEL')
    b.width = 0.055
    b.segments = 5
    b.limit_method = 'ANGLE'
    t.data.materials.append(mat('tile_' + label, col, rough=0.30))
    for p in t.data.polygons:
        p.use_smooth = True
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    f = bpy.context.object
    f.name = 'tileface_' + label
    f.scale = (0.32, 0.43, 0.19)
    f.location = (0, 0, 0.03)
    fb = f.modifiers.new('round', 'BEVEL')
    fb.width = 0.03
    fb.segments = 3
    fb.limit_method = 'ANGLE'
    f.data.materials.append(mat('tileface_' + label, face_col, rough=0.5))
    for p in f.data.polygons:
        p.use_smooth = True
    return [t, f]


# ── sets ──────────────────────────────────────────────────────────────────────
SETS = {
    # Pips are dark on every light body: at 48px on a board the pip COUNT is the only
    # thing a player needs to read, and cream-on-sage does not carry it.
    'dice': [
        ('die-sage',  lambda: make_die(PAL['sage'],  PAL['dark'],  'sage')),
        ('die-gold',  lambda: make_die(PAL['gold'],  PAL['dark'],  'gold')),
        ('die-cream', lambda: make_die(PAL['cream'], PAL['dark'],  'cream')),
        ('die-rose',  lambda: make_die(PAL['rose'],  PAL['dark'],  'rose')),
        ('die-dark',  lambda: make_die(PAL['dark'],  PAL['gold'],  'dark')),
    ],
    'discs': [
        ('disc-sage',  lambda: make_disc(PAL['sage'],  PAL['cream'], 'sage')),
        ('disc-gold',  lambda: make_disc(PAL['gold'],  PAL['cream'], 'gold')),
        ('disc-rose',  lambda: make_disc(PAL['rose'],  PAL['cream'], 'rose')),
        ('disc-cream', lambda: make_disc(PAL['cream'], PAL['sage'],  'cream')),
        ('disc-dark',  lambda: make_disc(PAL['dark'],  PAL['gold'],  'dark')),
    ],
    'rings': [
        ('ring-1', lambda: make_ring(PAL['sage'],  'a', 0.24, 0.085)),
        ('ring-2', lambda: make_ring(PAL['gold'],  'b', 0.31, 0.095)),
        ('ring-3', lambda: make_ring(PAL['rose'],  'c', 0.38, 0.105)),
        ('ring-4', lambda: make_ring(PAL['cream'], 'd', 0.45, 0.115)),
    ],
    'stones': [
        ('stone-1', lambda: make_stone(PAL['stone'], 'a', 1)),
        ('stone-2', lambda: make_stone(PAL['stone'], 'b', 2)),
        ('stone-3', lambda: make_stone((0.36, 0.38, 0.35, 1), 'c', 3)),
        ('stone-4', lambda: make_stone((0.50, 0.49, 0.45, 1), 'd', 4)),
    ],
    'tiles': [
        ('tile-sage',  lambda: make_tile(PAL['cream'], PAL['sage'],  'sage')),
        ('tile-gold',  lambda: make_tile(PAL['cream'], PAL['gold'],  'gold')),
        ('tile-rose',  lambda: make_tile(PAL['cream'], PAL['rose'],  'rose')),
        ('tile-dark',  lambda: make_tile(PAL['cream'], PAL['dark'],  'dark')),
    ],
}


def render_one(name, build, outdir):
    # A finished piece is not re-rendered unless --force: a set that gets killed by a
    # timeout part way through (it happened on the discs with two browser gates on the
    # other core) resumes from where it stopped instead of paying for the first three again.
    dst0 = os.path.join(outdir, name + '.png')
    if os.path.exists(dst0) and '--force' not in sys.argv:
        print('  %-14s already rendered, skipping (--force to redo)' % name)
        return dst0
    clear()
    setup_rig()
    obs = build()
    # frame consistently: scale the group so its longest axis is 1.0, then the ortho
    # camera means every piece in every set is photographed at the same distance.
    mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
    for ob in obs:
        for c in ob.bound_box:
            w = ob.matrix_world @ Vector(c)
            mn = Vector((min(mn[i], w[i]) for i in range(3)))
            mx = Vector((max(mx[i], w[i]) for i in range(3)))
    size = max((mx - mn)[i] for i in range(3)) or 1.0
    ctr = (mn + mx) / 2
    for ob in obs:
        ob.location = (ob.location - ctr) / size
        ob.scale = [s / size for s in ob.scale]
    os.makedirs(outdir, exist_ok=True)
    dst = os.path.join(outdir, name + '.png')
    bpy.context.scene.render.filepath = dst
    bpy.ops.render.render(write_still=True)
    kb = os.path.getsize(dst) // 1024
    print('  %-14s -> %s (%dKB)' % (name, os.path.relpath(dst, HERE), kb))
    return dst


def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if '--list' in argv:
        for k, v in SETS.items():
            print('%-8s %d pieces: %s' % (k, len(v), ', '.join(n for n, _ in v)))
        return
    want = None
    if '--set' in argv:
        want = argv[argv.index('--set') + 1]
    names = [want] if want else list(SETS)
    made = []
    for s in names:
        if s not in SETS:
            sys.exit('unknown set %r. --list to see them.' % s)
        print('set: %s' % s)
        for name, build in SETS[s]:
            made.append(render_one(name, build, os.path.join(OUT, s)))
    print('\n%d sprites in %s' % (len(made), os.path.relpath(OUT, HERE)))


main()
