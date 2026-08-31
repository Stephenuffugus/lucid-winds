#!/usr/bin/env python3
"""forge3d/topdown.py - renders every hero sculpt from STRAIGHT ABOVE for
the gameplay sprites. The dish is a top-down view; a flat painted card in
it reads as a sticker, a lit render of the actual sculpt reads as a top.

    blender -b --factory-startup -P tools/forge3d/topdown.py -- [--only id,id]

Outputs raw PNGs to tools/forge3d/renders/topdown/<slot>-<id>.png.
Post-process to assets/topdown/ is tools/forge3d/topdown_post.py (PIL is
not available inside this distro blender, so the two stages are separate).

Camera is exactly 90 degrees: the sprite gets ROTATED every frame in the
dish, so any off-axis perspective would wobble as it turns. Depth comes
from the studio lighting on the sculpt's own relief.

The softboxes are meshes, and straight above the part one of them IS in
frame - visible_camera=False keeps them out of the picture while they
keep lighting the speculars, which is the whole reason steel reads as
steel (the grey-soap law).
"""
import importlib.util, math, os, sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(HERE, 'renders', 'topdown')

_sm = importlib.util.spec_from_file_location('forge_build', os.path.join(HERE, 'build.py'))
FB = importlib.util.module_from_spec(_sm); _sm.loader.exec_module(FB)


def main():
    only = set()
    if '--' in sys.argv:
        rest = sys.argv[sys.argv.index('--') + 1:]
        if '--only' in rest:
            only = set(rest[rest.index('--only') + 1].split(','))
    os.makedirs(OUT, exist_ok=True)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    cam = FB.setup_render()
    for o in bpy.context.collection.objects:
        if o.name.startswith('sb_'):
            o.visible_camera = False
    sc = bpy.context.scene
    sc.render.resolution_x = sc.render.resolution_y = 512

    done = 0
    for slot in ('blade', 'core'):
        d = os.path.join(ROOT, 'assets', '3d', 'hero', slot)
        for f in sorted(os.listdir(d)):
            if not f.endswith('.glb'):
                continue
            pid = f[:-4]
            if only and pid not in only and (slot + '-' + pid) not in only:
                continue
            # resume: the harness kills long batches, relaunching must not
            # start over. --only overrides for a deliberate re-render.
            if not only and os.path.exists(os.path.join(OUT, slot + '-' + pid + '.png')):
                continue
            before = set(bpy.data.objects)
            bpy.ops.import_scene.gltf(filepath=os.path.join(d, f))
            fresh = [o for o in bpy.data.objects if o not in before]
            meshes = [o for o in fresh if o.type == 'MESH']
            if not meshes:
                print('NO MESH in', f); continue
            ob = meshes[0]
            # frame by bounding sphere, straight down
            vs = [ob.matrix_world @ v.co for v in ob.data.vertices]
            lo = [min(v[i] for v in vs) for i in range(3)]
            hi = [max(v[i] for v in vs) for i in range(3)]
            ctr = [(lo[i] + hi[i]) / 2 for i in range(3)]
            rad = math.sqrt(sum((hi[i] - lo[i]) ** 2 for i in range(3))) / 2
            fov = 2 * math.atan(18.0 / cam.data.lens)
            FB.aim(cam, ctr, (rad * 1.12) / math.sin(fov / 2), 89.9)
            for other in bpy.context.collection.objects:
                if other.type == 'MESH' and not other.name.startswith('sb_'):
                    other.hide_render = other is not ob
            sc.render.filepath = os.path.join(OUT, slot + '-' + pid + '.png')
            bpy.ops.render.render(write_still=True)
            for o in fresh:
                bpy.data.objects.remove(o, do_unlink=True)
            done += 1
            print('rendered', slot, pid)
    print('topdown renders:', done)


main()
