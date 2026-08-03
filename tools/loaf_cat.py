#!/usr/bin/env python3
"""LOAF cat authoring pipeline — run under headless Blender:

    blender -b -P tools/loaf_cat.py -- assets/loaf

Builds the base cat as fused organic volumes (voxel remesh over primitive
blobs), rigs it, adds a CHONK shape key, authors starter animation clips,
exports cat.glb, and renders a 4-angle turntable for the LOOK pass.
Every proportion is a parameter: this script IS the asset.
+Y is forward. Units are metres-ish; the cat is ~2.4 long.
"""
import bpy, math, os, sys

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'assets/loaf'
os.makedirs(OUT, exist_ok=True)

# ---------------- proportions (the cuteness dials) ----------------
BODY_C   = (0, -0.15, 0.60)
HEAD_C   = (0, 1.02, 1.16)
HEAD_R   = 0.74            # big head = cute
EAR_R, EAR_H = 0.30, 0.34
# the tail hugs the floor and wraps around the right flank - classic loaf
TAIL_PTS = [(0.42, -1.10, 0.28), (0.72, -0.85, 0.24), (0.86, -0.40, 0.22),
            (0.90, 0.05, 0.22), (0.86, 0.45, 0.24)]
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
parts.append(sphere(BODY_C, 1.0, (0.86, 1.18, 0.64)))          # loaf mass
parts.append(sphere((0, 0.55, 0.70), 0.62, (0.80, 0.85, 0.74))) # chest
parts.append(sphere((0, -0.92, 0.58), 0.68, (0.9, 0.8, 0.78)))  # haunches
parts.append(sphere(HEAD_C, HEAD_R, (1.0, 0.94, 0.92)))          # head, slightly wide
parts.append(sphere((-0.30, 1.56, 0.98), 0.17))                  # muzzle pouch L
parts.append(sphere(( 0.30, 1.56, 0.98), 0.17))                  # muzzle pouch R
parts.append(sphere((0, 1.58, 0.90), 0.15))                      # chin
# ears: squashed cones
for sx in (-1, 1):
    bpy.ops.mesh.primitive_cone_add(radius1=EAR_R, depth=EAR_H, vertices=10,
        location=(sx * 0.42, 0.94, 1.98))
    e = bpy.context.object
    e.rotation_euler = (math.radians(-8), math.radians(sx * 22), 0)
    e.scale = (0.85, 0.45, 1.25)
    parts.append(e)
# tail: chain of blobs
# overlapping beads so the remesh fuses one continuous tail
import mathutils as _mu
for i in range(len(TAIL_PTS) - 1):
    a2, b2 = _mu.Vector(TAIL_PTS[i]), _mu.Vector(TAIL_PTS[i + 1])
    steps = max(2, int((b2 - a2).length / 0.11))
    for k in range(steps):
        q = a2.lerp(b2, k / steps)
        parts.append(sphere(tuple(q), 0.19 - 0.012 * i))
# stubby legs / paws
for sx in (-1, 1):
    parts.append(sphere((sx * 0.34, 0.98, 0.16), 0.17, (1, 1.35, 0.9)))  # front paws peeking
    parts.append(sphere((sx * 0.52, -0.80, 0.18), 0.20, (1, 1.25, 1)))    # haunch paws

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
bpy.ops.object.shade_smooth()

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

eyemat = glossy('Eye', (0.03, 0.03, 0.035), 0.08)
nosemat = glossy('Nose', (0.75, 0.35, 0.42), 0.4)
extras = []
for sx in (-1, 1):
    e = sphere((sx * 0.23, 1.64, 1.28), 0.155)   # big glossy eyes on the face front
    e.data.materials.append(eyemat)
    extras.append(e)
n = sphere((0, 1.74, 1.04), 0.055, (1, 0.7, 0.8))
n.data.materials.append(nosemat)
extras.append(n)
for o in extras:
    o.select_set(True)
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
bpy.ops.object.shade_smooth()

# ---------------- CHONK shape key ----------------
bpy.ops.object.shape_key_add(from_mix=False)          # Basis
chonk = body.shape_key_add(name='chonk', from_mix=False)
bx, by, bz = BODY_C
for i, v in enumerate(body.data.vertices):
    co = v.co
    d = math.sqrt((co.x - bx) ** 2 + ((co.y - by) / 1.4) ** 2 + (co.z - bz) ** 2)
    w = max(0.0, 1.0 - d / 1.15)
    if w > 0 and co.z < 1.1:                           # belly and flanks, not the face
        k = chonk.data[i]
        k.co = (co.x * (1 + 0.28 * w), co.y, co.z + (0.04 * w if co.z > bz else -0.10 * w))

# ---------------- armature ----------------
bpy.ops.object.armature_add(location=(0, 0, 0))
arm = bpy.context.object
arm.name = 'CatRig'
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
root = eb[0]; root.name = 'root'
root.head = (0, -0.6, 0.62); root.tail = (0, -0.2, 0.66)

def bone(name, head, tail, parent):
    b2 = eb.new(name)
    b2.head = head; b2.tail = tail; b2.parent = parent
    return b2

spine  = bone('spine', (0, -0.2, 0.66), (0, 0.35, 0.72), root)
neck   = bone('neck',  (0, 0.35, 0.72), (0, 0.75, 0.95), spine)
head_b = bone('head',  (0, 0.75, 0.95), (0, 1.35, 1.15), neck)
bone('earL', (-0.34, 0.86, 1.35), (-0.42, 0.86, 1.72), head_b)
bone('earR', ( 0.34, 0.86, 1.35), ( 0.42, 0.86, 1.72), head_b)
tp = (0.2, -1.0, 0.5)
tprev = root
for i, p in enumerate(TAIL_PTS):
    tprev = bone('tail%d' % (i + 1), tp, p, tprev)
    tp = p
for nm, sx, y in (('legFL', -1, 0.55), ('legFR', 1, 0.55), ('legBL', -1, -0.85), ('legBR', 1, -0.85)):
    bone(nm, (sx * 0.44, y, 0.5), (sx * 0.44, y, 0.06), spine if y > 0 else root)
bpy.ops.object.mode_set(mode='OBJECT')

body.select_set(True)
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')

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
            pb.keyframe_insert('scale', frame=f)
    track = arm.animation_data.nla_tracks.new()
    track.strips.new(act.name, 1, act)
    arm.animation_data.action = None
    return act

import mathutils
def reset_pose():
    for pb in arm.pose.bones:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.scale = (1, 1, 1)

def idle(t, f):
    reset_pose()
    br = 1 + 0.03 * math.sin(t * 2 * math.pi)
    arm.pose.bones['spine'].scale = (br, 1, br)
    arm.pose.bones['head'].rotation_quaternion = mathutils.Euler(
        (math.radians(3 * math.sin(t * 2 * math.pi)), 0,
         math.radians(2 * math.sin(t * 4 * math.pi)))).to_quaternion()
    if 0.55 < t < 0.7:   # ear twitch
        arm.pose.bones['earL'].rotation_quaternion = mathutils.Euler(
            (0, math.radians(-18 * math.sin((t - 0.55) / 0.15 * math.pi)), 0)).to_quaternion()
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = mathutils.Euler(
            (0, 0, math.radians(6 * math.sin(t * 2 * math.pi + i * 0.9)))).to_quaternion()

def tailplay(t, f):
    reset_pose()
    for i in range(1, 5):
        arm.pose.bones['tail%d' % i].rotation_quaternion = mathutils.Euler(
            (math.radians(10 * math.sin(t * 4 * math.pi + i * 1.2)), 0,
             math.radians(22 * math.sin(t * 2 * math.pi + i * 0.8)))).to_quaternion()

clip('Idle', 48, idle)
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
    cam.location = (4.3 * math.sin(a), -4.3 * math.cos(a), 1.7)
    d = mathutils.Vector((0, 0.35, 0.85)) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(OUT, 'turntable-%d.png' % i)
    bpy.ops.render.render(write_still=True)
    print('rendered', sc.render.filepath)
