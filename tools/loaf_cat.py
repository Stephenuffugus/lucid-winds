#!/usr/bin/env python3
"""LOAF cat authoring pipeline — run under headless Blender:

    blender -b -P tools/loaf_cat.py -- assets/loaf

Builds the base cat as fused organic volumes (voxel remesh over primitive
blobs), rigs it, adds a CHONK shape key, authors starter animation clips,
exports cat.glb, and renders a 4-angle turntable for the LOOK pass.
Every proportion is a parameter: this script IS the asset.
+Y is forward. Units are metres-ish; the cat is ~2.4 long.
"""
import bpy, math, os, sys, mathutils

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'assets/loaf'
os.makedirs(OUT, exist_ok=True)

# ---------------- proportions (the cuteness dials) ----------------
# v4: a STANDING cat. Real legs, smooth rising tail. "Loaf" is now an
# ANIMATION (legs tuck, body settles), because a loaf-shaped mesh cannot walk.
BODY_C   = (0, -0.10, 0.98)
HEAD_C   = (0, 1.00, 1.78)
HEAD_R   = 0.62
EAR_R, EAR_H = 0.26, 0.30
# smooth rising S-curve behind - sampled densely so the remesh fuses a TUBE
TAIL_PTS = [(0, -1.02, 1.02), (0.06, -1.38, 1.18), (0.10, -1.58, 1.52),
            (0.05, -1.50, 1.94), (0.00, -1.44, 2.18)]
LEG_X_F, LEG_Y_F = 0.30, 0.68
LEG_X_B, LEG_Y_B = 0.36, -0.78
VOXEL    = 0.05

def sphere(loc, r, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=16)
    o = bpy.context.object
    o.scale = scale
    return o

# ---------------- clean scene ----------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# ---------------- the body blob ----------------
parts = []
parts.append(sphere(BODY_C, 0.78, (0.82, 1.30, 0.72)))          # torso
parts.append(sphere((0, 0.62, 1.06), 0.56, (0.80, 0.80, 0.76))) # chest
parts.append(sphere((0, 0.82, 1.42), 0.34, (0.8, 0.8, 1.0)))     # neck
parts.append(sphere((0, -0.80, 1.00), 0.60, (0.92, 0.80, 0.86))) # haunches
parts.append(sphere(HEAD_C, HEAD_R, (1.08, 0.90, 0.86)))         # skull: wide, flat-front
parts.append(sphere((-0.33, 1.22, 1.64), 0.20, (1.1, 0.9, 0.95)))# cheek L
parts.append(sphere(( 0.33, 1.22, 1.64), 0.20, (1.1, 0.9, 0.95)))# cheek R
parts.append(sphere((-0.13, 1.50, 1.58), 0.145))                 # muzzle pouch L
parts.append(sphere(( 0.13, 1.50, 1.58), 0.145))                 # muzzle pouch R
parts.append(sphere((0, 1.52, 1.47), 0.12))                      # chin
# ears: squashed cones
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cone_add(radius1=0.32, depth=0.50, vertices=12,
        location=(sx * 0.36, 0.96, 2.32))
    e = bpy.context.object
    e.rotation_euler = (math.radians(-8), math.radians(sx * 22), 0)
    e.scale = (1.0, 0.52, 1.02)
    parts.append(e)
# tail: chain of blobs
# beads at <=0.07 spacing with a GRADUAL taper fuse into one smooth tube -
# 0.11 spacing was the ball-of-dough look
import mathutils as _mu
_total = sum((_mu.Vector(TAIL_PTS[i + 1]) - _mu.Vector(TAIL_PTS[i])).length
             for i in range(len(TAIL_PTS) - 1))
_done = 0.0
for i in range(len(TAIL_PTS) - 1):
    a2, b2 = _mu.Vector(TAIL_PTS[i]), _mu.Vector(TAIL_PTS[i + 1])
    seg = (b2 - a2).length
    steps = max(3, int(seg / 0.06))
    for k in range(steps):
        q = a2.lerp(b2, k / steps)
        frac = (_done + seg * k / steps) / _total
        parts.append(sphere(tuple(q), 0.150 - 0.075 * frac))
    _done += seg
# REAL legs: columns of overlapping beads from shoulder/hip to paw
def leg(x, y, top_z, top_r):
    z = top_z
    while z > 0.16:
        rr = top_r - (top_z - z) * 0.05
        parts.append(sphere((x, y, z), max(0.115, rr)))
        z -= 0.10
    parts.append(sphere((x, y + 0.06, 0.13), 0.155, (1, 1.35, 0.75)))   # paw
for sx in (-1, 1):
    leg(sx * LEG_X_F, LEG_Y_F, 0.95, 0.17)
    parts.append(sphere((sx * 0.42, LEG_Y_B, 0.95), 0.30, (0.9, 1.0, 1.1)))  # thigh mass
    leg(sx * LEG_X_B, LEG_Y_B, 0.80, 0.16)

for o in parts:
    o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
body = bpy.context.object
body.name = 'CatBody'

# fuse into one organic volume, then relax
body.data.remesh_voxel_size = VOXEL
bpy.ops.object.voxel_remesh()
sm = body.modifiers.new('Smooth', 'SMOOTH')
sm.factor = 0.9
sm.iterations = 12
bpy.ops.object.modifier_apply(modifier='Smooth')

# phone budget: the remesh emits ~50k quads; collapse toward ~9.5k tris.
# Must happen BEFORE any shape key exists - modifiers cannot apply over keys.
dec = body.modifiers.new('Dec', 'DECIMATE')
dec.ratio = min(1.0, 4800.0 / max(1, len(body.data.polygons)))
bpy.ops.object.modifier_apply(modifier='Dec')
bpy.ops.object.shade_smooth()

# UVs for the runtime coat painter. Patterns are computed in BODY SPACE from a
# position map baked in the viewer, so islands never need to be pretty - they
# only need to not overlap. Smart project guarantees that.
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.03)
bpy.ops.object.mode_set(mode='OBJECT')

mat = bpy.data.materials.new('Coat')
mat.use_nodes = True
b = mat.node_tree.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = (0.62, 0.28, 0.09, 1)   # warm ginger (linear), runtime-textured later
b.inputs['Roughness'].default_value = 0.85
body.data.materials.append(mat)

# ---------------- crisp add-ons (post-remesh so they stay sharp) ----------------
def glossy(name, rgb, rough=0.15):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes['Principled BSDF']
    n.inputs['Base Color'].default_value = (*rgb, 1)
    n.inputs['Roughness'].default_value = rough
    return m

eyemat = glossy('Eye', (0.85, 0.85, 0.85), 0.12)
nosemat = glossy('Nose', (0.75, 0.35, 0.42), 0.4)
# Eyes and nose stay SEPARATE meshes (v5): the runtime sets iris colour on the
# Eye material without touching the coat texture, and Phase 2 look-at needs
# eye bones that rotate pupils without dragging face skin.
eyeL = sphere((-0.205, 1.445, 1.87), 0.105); eyeL.name = 'EyeL'
eyeL.data.materials.append(eyemat)
eyeR = sphere(( 0.205, 1.445, 1.87), 0.105); eyeR.name = 'EyeR'
eyeR.data.materials.append(eyemat)
noseO = sphere((0, 1.655, 1.635), 0.042, (1, 0.62, 0.72)); noseO.name = 'Nose'
noseO.data.materials.append(nosemat)
bpy.ops.object.select_all(action='DESELECT')
for o in (eyeL, eyeR, noseO):
    o.select_set(True)
bpy.context.view_layer.objects.active = eyeL
bpy.ops.object.shade_smooth()

# ---------------- shape keys (the tuner's sculpting handles) ----------------
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.shape_key_add(from_mix=False)          # Basis
chonk = body.shape_key_add(name='chonk', from_mix=False)
bx, by, bz = BODY_C
for i, v in enumerate(body.data.vertices):
    co = v.co
    d = math.sqrt((co.x - bx) ** 2 + ((co.y - by) / 1.5) ** 2 + ((co.z - bz) / 0.9) ** 2)
    w = max(0.0, 1.0 - d / 0.95)
    if w > 0 and co.z < 1.45:                          # belly and flanks, not the face
        k = chonk.data[i]
        k.co = (co.x * (1 + 0.30 * w), co.y, co.z - 0.12 * w)

# earSize: scale each ear about its own centroid + a gentle lift
earK = body.shape_key_add(name='earSize', from_mix=False)
for sx in (-1, 1):
    ec = mathutils.Vector((sx * 0.33, 0.94, 2.42))
    for i, v in enumerate(body.data.vertices):
        d = (v.co - ec).length
        w = max(0.0, 1.0 - d / 0.48)
        if w > 0:
            k = earK.data[i]
            k.co = ec + (v.co - ec) * (1 + 0.55 * w)
            k.co.z += 0.10 * w

# muzzleLength: push the muzzle/chin zone forward. Radius kept BELOW the eye
# sockets (eyes at z1.90 are separate meshes that do not ride morphs - at
# r0.46 the cheeks swallowed them whole)
muzK = body.shape_key_add(name='muzzle', from_mix=False)
mc = mathutils.Vector((0, 1.56, 1.56))
for i, v in enumerate(body.data.vertices):
    if v.co.z > 1.76: continue                        # never touch the eye line
    d = (v.co - mc).length
    w = max(0.0, 1.0 - d / 0.36)
    if w > 0:
        muzK.data[i].co = v.co + mathutils.Vector((0, 0.30 * w * w, 0.02 * w))

# floof: inflate along the normal - silhouette puff. The face is spared HARD
# (inflation near the eye line sank the separate eye meshes), paws stay
# grounded, and the amount is gentle enough not to crease the spine.
flK = body.shape_key_add(name='floof', from_mix=False)
fc = mathutils.Vector((0, 1.52, 1.78))
for i, v in enumerate(body.data.vertices):
    if v.co.z < 0.25: continue
    face = max(0.0, 1.0 - (v.co - fc).length / 0.75)
    amt = 0.07 * max(0.0, 1.0 - face * 1.8)
    if v.co.y < -1.0: amt += 0.05                     # tail plume
    if amt > 0:
        flK.data[i].co = v.co + v.normal * amt

# ---------------- armature ----------------
bpy.ops.object.armature_add(location=(0, 0, 0))
arm = bpy.context.object
arm.name = 'CatRig'
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
root = eb[0]; root.name = 'root'
root.head = (0, -0.5, 0.98); root.tail = (0, -0.1, 1.0)

def bone(name, head, tail, parent):
    b2 = eb.new(name)
    b2.head = head; b2.tail = tail; b2.parent = parent
    return b2

spine  = bone('spine', (0, -0.1, 1.0), (0, 0.45, 1.05), root)
neck   = bone('neck',  (0, 0.45, 1.05), (0, 0.85, 1.50), spine)
head_b = bone('head',  (0, 0.85, 1.50), (0, 1.35, 1.85), neck)
bone('earL', (-0.30, 0.92, 2.05), (-0.36, 0.92, 2.42), head_b)
bone('earR', ( 0.30, 0.92, 2.05), ( 0.36, 0.92, 2.42), head_b)
# eye bones: Phase 2 look-at rotates these; the eye MESHES bind to them 1.0
bone('eyeL', (-0.205, 1.445, 1.87), (-0.205, 1.585, 1.87), head_b)
bone('eyeR', ( 0.205, 1.445, 1.87), ( 0.205, 1.585, 1.87), head_b)
tp = (0, -0.95, 1.0)
tprev = root
for i, p in enumerate(TAIL_PTS[1:]):
    tprev = bone('tail%d' % (i + 1), tp, p, tprev)
    tp = p
# two-segment legs: upper (shoulder/hip -> knee) and lower (knee -> paw)
for nm, sx, x, y, topz in (('FL', -1, LEG_X_F, LEG_Y_F, 0.95), ('FR', 1, LEG_X_F, LEG_Y_F, 0.95),
                            ('BL', -1, LEG_X_B, LEG_Y_B, 0.90), ('BR', 1, LEG_X_B, LEG_Y_B, 0.90)):
    up = bone('leg%s_up' % nm, (sx * x, y, topz), (sx * x, y, 0.48), spine if y > 0 else root)
    bone('leg%s_lo' % nm, (sx * x, y, 0.48), (sx * x, y + 0.06, 0.08), up)
bpy.ops.object.mode_set(mode='OBJECT')

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
# auto-weights spread face skin onto the eye bones - strip those groups so a
# Phase 2 eye look-at moves pupils, never cheeks
for gname in ('eyeL', 'eyeR'):
    vg = body.vertex_groups.get(gname)
    if vg: body.vertex_groups.remove(vg)
# eyes and nose ride their bones rigidly: explicit single-group binding
for ob, bn in ((eyeL, 'eyeL'), (eyeR, 'eyeR'), (noseO, 'head')):
    vg = ob.vertex_groups.new(name=bn)
    vg.add(list(range(len(ob.data.vertices))), 1.0, 'REPLACE')
    mod = ob.modifiers.new('Arm', 'ARMATURE')
    mod.object = arm
    ob.parent = arm

# ---------------- animation clips ----------------
FPS = 24
bpy.context.scene.render.fps = FPS

def clip(name, length, poser):
    act = bpy.data.actions.new(name)
    arm.animation_data_create()
    arm.animation_data.action = act
    for f in range(0, length + 1, 4):
        t = f / length
        bpy.context.scene.frame_set(f)
        poser(t, f)
        for pb in arm.pose.bones:
            pb.keyframe_insert('rotation_quaternion', frame=f)
            # scale and location channels stay UNKEYED except where a clip
            # truly uses them (spine breath, root drops) - every other bone's
            # scale belongs to the RUNTIME SCULPTOR: leg length, tail length,
            # eye size and kitten-head are bone scales the mixer must not own
            if pb.name == 'spine':
                pb.keyframe_insert('scale', frame=f)
            if pb.name == 'root':
                pb.keyframe_insert('location', frame=f)
    track = arm.animation_data.nla_tracks.new()
    track.strips.new(act.name, 1, act)
    arm.animation_data.action = None
    return act

import mathutils
def reset_pose():
    for pb in arm.pose.bones:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.scale = (1, 1, 1)
        pb.location = (0, 0, 0)

def E(x=0, y=0, z=0):
    return mathutils.Euler((math.radians(x), math.radians(y), math.radians(z))).to_quaternion()

def idle(t, f):
    reset_pose()
    br = 1 + 0.03 * math.sin(t * 2 * math.pi)
    arm.pose.bones['spine'].scale = (br, 1, br)
    arm.pose.bones['head'].rotation_quaternion = E(3 * math.sin(t * 2 * math.pi), 0,
                                                    2 * math.sin(t * 4 * math.pi))
    if 0.55 < t < 0.7:   # ear twitch
        arm.pose.bones['earL'].rotation_quaternion = E(0, -18 * math.sin((t - 0.55) / 0.15 * math.pi), 0)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(0, 0, 6 * math.sin(t * 2 * math.pi + i * 0.9))

def walk(t, f):
    # TRUE walk: 4-beat lateral sequence (Muybridge plate 717 shows the trot;
    # the walk order is LH, LF, RH, RF at quarter-phase offsets). Each leg
    # swings 30% of the cycle and sweeps back the other 70%.
    reset_pose()
    ph = t * 2 * math.pi
    for nm, off in (('BL', 0.0), ('FL', 0.25), ('BR', 0.5), ('FR', 0.75)):
        lt = (t - off) % 1.0
        if lt < 0.3:                                   # swing: lift + reach
            k = lt / 0.3
            up = 20 - 34 * k
            lo = -42 * math.sin(k * math.pi)
        else:                                          # stance: sweep back
            k = (lt - 0.3) / 0.7
            up = -14 + 34 * k
            lo = -4
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(up, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(lo, 0, 0)
    arm.pose.bones['root'].location = (0, 0, 0.025 * math.sin(2 * ph))
    arm.pose.bones['spine'].rotation_quaternion = E(1.5 * math.sin(2 * ph), 3 * math.sin(ph), 2 * math.sin(ph))
    arm.pose.bones['head'].rotation_quaternion = E(2 * math.sin(ph * 2), 0, 0)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(0, 0, 9 * math.sin(ph + i * 0.7))

def trot(t, f):
    # diagonal pairs - what plate 717 actually documents. The old "walk".
    reset_pose()
    ph = t * 2 * math.pi
    for nm, off in (('FL', 0), ('BR', 0), ('FR', math.pi), ('BL', math.pi)):
        sw = 26 * math.sin(ph + off)
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(sw, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(max(0, -0.9 * sw), 0, 0)
    arm.pose.bones['root'].location = (0, 0, 0.05 * abs(math.sin(ph)))
    arm.pose.bones['spine'].rotation_quaternion = E(0, 0, 3 * math.sin(ph))
    arm.pose.bones['head'].rotation_quaternion = E(2 * math.sin(ph * 2), 0, 0)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(0, 0, 9 * math.sin(ph + i * 0.7))

def gallop(t, f):
    # rotary gallop from Muybridge plate 720: spine arch on the gather,
    # full-stretch flight, fronts land ~0.45 after the hinds, hinds overtake.
    # The SPINE oscillation is the signature - legs alone read as a toy.
    reset_pose()
    tp = 2 * math.pi * t
    spineX = 5 + 19 * math.cos(tp)                     # +20 gather, -12 flight
    arm.pose.bones['spine'].rotation_quaternion = E(spineX, 0, 0)
    arm.pose.bones['neck'].rotation_quaternion = E(-0.55 * spineX, 0, 0)
    arm.pose.bones['head'].rotation_quaternion = E(-0.25 * spineX, 0, 0)
    arm.pose.bones['root'].location = (0, 0, -0.02 + 0.20 * math.cos(2 * math.pi * (t - 0.35)))
    for nm, off in (('BL', 0.0), ('BR', 0.08), ('FL', 0.45), ('FR', 0.53)):
        lt = t - off
        up = 42 * math.sin(2 * math.pi * (lt + 0.1))
        lo = -60 * max(0.0, math.sin(2 * math.pi * (lt - 0.5)))
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(up, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(lo, 0, 0)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(
            8 * math.cos(tp) - 4 * i, 0, 4 * math.sin(tp + i * 0.5))

def pounce(t, f):
    # one-shot: coil deep, explode up and forward, land soft. The launch
    # phase borrows plate 720's frames 11-15 (extension out of the gather).
    reset_pose()
    if t < 0.35:                                       # coil
        k = t / 0.35; k = k * k * (3 - 2 * k)
        arm.pose.bones['root'].location = (0, 0, -0.44 * k)
        arm.pose.bones['spine'].rotation_quaternion = E(22 * k, 0, 0)
        for nm in ('BL', 'BR'):
            arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(65 * k, 0, 0)
            arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-105 * k, 0, 0)
        for nm in ('FL', 'FR'):
            arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(28 * k, 0, 0)
            arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-40 * k, 0, 0)
        arm.pose.bones['head'].rotation_quaternion = E(-16 * k, 0, 0)
        for i in range(1, 5):
            arm.pose.bones['tail%d' % i].rotation_quaternion = E(0, 0, 14 * k * math.sin(i + t * 30))
    elif t < 0.6:                                      # launch + flight
        k = (t - 0.35) / 0.25; k = k * k * (3 - 2 * k)
        arm.pose.bones['root'].location = (0, 0, -0.44 + 0.85 * k)
        arm.pose.bones['spine'].rotation_quaternion = E(22 - 40 * k, 0, 0)
        for nm in ('BL', 'BR'):
            arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(65 - 108 * k, 0, 0)
            arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-105 + 98 * k, 0, 0)
        for nm in ('FL', 'FR'):
            arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(28 - 66 * k, 0, 0)
            arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-40 + 22 * k, 0, 0)
        arm.pose.bones['neck'].rotation_quaternion = E(8 * k, 0, 0)
    else:                                              # land + settle
        k = (t - 0.6) / 0.4; k = k * k * (3 - 2 * k)
        arm.pose.bones['root'].location = (0, 0, 0.41 - 0.47 * k + 0.10 * math.sin(k * math.pi))
        arm.pose.bones['spine'].rotation_quaternion = E(-18 + 18 * k, 0, 0)
        for nm in ('FL', 'FR'):
            arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(-38 + 38 * k, 0, 0)
            arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-18 + 18 * k, 0, 0)
        for nm in ('BL', 'BR'):
            arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(-43 + 43 * k, 0, 0)
            arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-7 + 7 * k, 0, 0)

def wiggle(t, f):
    # the pre-pounce butt wiggle: crouched front, hips sway, tail high.
    reset_pose()
    sway = math.sin(t * 3 * 2 * math.pi)
    arm.pose.bones['root'].location = (0, 0, -0.16)
    arm.pose.bones['root'].rotation_quaternion = E(0, 10 * sway, 0)
    arm.pose.bones['spine'].rotation_quaternion = E(6, -9 * sway, 0)
    for nm in ('FL', 'FR'):
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(22, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-30, 0, 0)
    for nm in ('BL', 'BR'):
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(30, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-42, 0, 0)
    arm.pose.bones['head'].rotation_quaternion = E(-8, 0, 2 * sway)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(
            10 + 6 * i * 0.5, 0, 18 * math.sin(t * 6 * math.pi + i * 0.9))

def loafsettle(t, f):
    # one-shot: stand -> loaf. Legs fold under, body drops, tail wraps.
    reset_pose()
    k = min(1.0, t * 1.25)                 # settle by 80%, hold after
    e2 = k * k * (3 - 2 * k)               # smoothstep
    for nm in ('FL', 'FR', 'BL', 'BR'):
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(85 * e2, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-125 * e2, 0, 0)
    arm.pose.bones['root'].location = (0, 0, -0.52 * e2)
    arm.pose.bones['neck'].rotation_quaternion = E(14 * e2, 0, 0)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(0, 0, (18 + 10 * i) * e2)

def tailplay(t, f):
    reset_pose()
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(
            10 * math.sin(t * 4 * math.pi + i * 1.2), 0,
            22 * math.sin(t * 2 * math.pi + i * 0.8))

def bellyup(t, f):
    # one-shot: roll onto the back, paws loosely up, held for bean access.
    # Root Y is the roll axis (the bone runs along her body).
    reset_pose()
    k = min(1.0, t * 1.6); e2 = k * k * (3 - 2 * k)
    arm.pose.bones['root'].rotation_quaternion = E(0, 168 * e2, 0)
    arm.pose.bones['root'].location = (0, 0, -0.34 * e2)
    for nm in ('FL', 'FR', 'BL', 'BR'):
        arm.pose.bones['leg%s_up' % nm].rotation_quaternion = E(38 * e2, 0, 0)
        arm.pose.bones['leg%s_lo' % nm].rotation_quaternion = E(-55 * e2, 0, 0)
    arm.pose.bones['neck'].rotation_quaternion = E(-10 * e2, 0, 0)
    arm.pose.bones['head'].rotation_quaternion = E(-16 * e2, 0, 3 * e2)
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = E(0, 0, (10 + 7 * i) * e2)

clip('Idle', 48, idle)
clip('BellyUp', 36, bellyup)
clip('Walk', 40, walk)
clip('Trot', 24, trot)
clip('Gallop', 22, gallop)
clip('Pounce', 44, pounce)
clip('Wiggle', 32, wiggle)
clip('LoafSettle', 40, loafsettle)
clip('TailPlay', 60, tailplay)
reset_pose()

# ---------------- export ----------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'cat.glb'),
                          export_format='GLB', export_animations=True, export_yup=True)
print('wrote', os.path.join(OUT, 'cat.glb'))

# ---------------- turntable renders for the LOOK pass ----------------
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 96
sc.cycles.use_denoising = False   # this apt build ships without OpenImageDenoise
sc.render.resolution_x = sc.render.resolution_y = 640
world = bpy.data.worlds['World']
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.09, 0.06, 0.12, 1)

sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
sun.data.energy = 3.5
sun.rotation_euler = (math.radians(50), math.radians(-20), math.radians(30))
sc.collection.objects.link(sun)
fill = bpy.data.objects.new('Fill', bpy.data.lights.new('Fill', 'AREA'))
fill.data.energy = 120; fill.data.size = 6
fill.location = (-3, 2, 3)
sc.collection.objects.link(fill)

cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))
sc.collection.objects.link(cam)
sc.camera = cam
bpy.context.scene.frame_set(12)
for i, ang in enumerate((160, 205, 90, 340)):
    a = math.radians(ang)
    cam.location = (4.6 * math.sin(a), -4.6 * math.cos(a), 1.9)
    d = mathutils.Vector((0, 0.3, 1.1)) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(OUT, 'turntable-%d.png' % i)
    bpy.ops.render.render(write_still=True)
    print('rendered', sc.render.filepath)
