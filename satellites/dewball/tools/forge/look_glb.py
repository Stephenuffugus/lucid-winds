# Four view look at one model (front, three, side, back, top), 360 px each:
# blender -b --factory-startup -P look_glb.py -- <glb> <outprefix>   writes <outprefix>.<view>.png
import bpy, sys, math, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]
glb, outp = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
mn = mathutils.Vector((1e9,)*3); mx = mathutils.Vector((-1e9,)*3)
for o in objs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
ctr = (mn + mx) / 2; rad = (mx - mn).length / 2
sc = bpy.context.scene
# ⛔ Workbench aborts headless in this Blender 4.0.2: Cycles on the CPU, a sun and a grey sky
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 24
sc.cycles.use_denoising = False
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(30))
sc.render.resolution_x = sc.render.resolution_y = 360
sc.render.film_transparent = False
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs[0].default_value = (0.5, 0.5, 0.55, 1); sc.world.node_tree.nodes['Background'].inputs[1].default_value = 0.9
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 50; cam.data.clip_start = rad * 0.01; cam.data.clip_end = rad * 100
# glTF is +Y up; the picture's front is the viewer side (-Y in Blender after import is +Z glTF front)
for name, az, el in (('front', 0, 12), ('three', 45, 20), ('side', 90, 8), ('back', 180, 15), ('top', 30, 70)):
    a = math.radians(az); e = math.radians(el); d = rad * 3.2
    cam.location = ctr + mathutils.Vector((d * math.sin(a) * math.cos(e), -d * math.cos(a) * math.cos(e), d * math.sin(e)))
    cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = '%s.%s.png' % (outp, name)
    bpy.ops.render.render(write_still=True)
