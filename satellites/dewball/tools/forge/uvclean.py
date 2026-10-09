#!/usr/bin/env python3
# Dewball forge UV CLEAN: a second, CLEAN UV layout on every fitted model. Blender 4.0, headless.
#
#   blender -b --factory-startup -P satellites/dewball/tools/forge/uvclean.py -- \
#       --in satellites/dewball/tools/forge/fitted --out satellites/dewball/tools/forge/clean --only teacup.t2,ladybird.t2
#
# Why: Meshy's smart topology texture is a mosaic of hundreds of tiny islands, often ONE TRIANGLE each,
# packed edge to edge with unrelated colours (the teacup's tea triangles touch its cream cup triangles).
# Shrunk 16x into a 128 px atlas square every island bleeds into its neighbours and the model wears a
# web of pale lines (the w1 teacup and ladybird, the look panel's "crazing", 9 Oct). Filling empty
# texels cannot help: there are none.
# What: import the FITTED glb, add a UV map "clean" by Smart UV Project (islands along the shape's own
# faces, 66 degrees, a margin between them), export with BOTH maps: TEXCOORD_0 is Meshy's (it still
# reads the raw picture), TEXCOORD_1 the clean one. atlas.py then paints each triangle from the raw
# picture into the clean layout itself (supersampled, island by island, margins filled), because
# Cycles BAKING RETURNS BLACK in this headless build (a plain red emission cube baked to 0 of 16384
# texels, 9 Oct): only the unwrap is Blender's.
import bpy, json, math, os, sys, argparse

HERE = os.path.dirname(os.path.abspath(__file__))


def args():
    p = argparse.ArgumentParser()
    p.add_argument('--in', dest='indir', required=True, help='fitted root: <in>/<arm>/<kind>.glb')
    p.add_argument('--out', required=True)
    p.add_argument('--only', required=True, help='kind.arm,...')
    p.add_argument('--angle', type=float, default=66.0)
    p.add_argument('--margin', type=float, default=0.03)
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return p.parse_args(argv)


def one(src, out, angle, margin):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # ⛔ merge_vertices: the fitted file splits EVERY triangle apart (Meshy's per triangle UV islands
    # force a seam on every edge), so without the weld the unwrap sees 600 loose triangles and makes
    # 600 islands, 2.4% of the square (the first try, 9 Oct). UVs live per face corner: welding
    # positions keeps Meshy's map intact for the paint step.
    bpy.ops.import_scene.gltf(filepath=src, merge_vertices=True)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if len(meshes) != 1:
        return 'expected one mesh, found %d' % len(meshes)
    ob = meshes[0]
    for o in bpy.context.scene.objects:
        o.select_set(o is ob)
    bpy.context.view_layer.objects.active = ob
    me = ob.data
    if len(me.uv_layers) != 1:
        return 'expected one UV map, found %d' % len(me.uv_layers)
    new = me.uv_layers.new(name='clean')
    me.uv_layers.active = new
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    diag = max(ob.dimensions) or 1.0
    bpy.ops.mesh.remove_doubles(threshold=diag * 1e-5)
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=margin, area_weight=0.0, scale_to_bounds=False)
    # Smart UV Project's own packing filled 22 to 38% of the square (the first clean teacup and ladybird);
    # Blender 4.0's packer, rotating islands and packing by their real outline, fills far more of it
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=True, scale=True, margin_method='SCALED', margin=margin * 0.3, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')
    me.uv_layers.active = me.uv_layers[0]          # Meshy's stays TEXCOORD_0
    os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_image_format='JPEG',
                              export_jpeg_quality=92, export_animations=False, export_cameras=False, export_lights=False)
    return None


def main():
    a = args()
    bad = 0
    for name in [x for x in a.only.split(',') if x]:
        kind, arm = name.split('.', 1)
        src = os.path.join(a.indir, arm, kind + '.glb')
        out = os.path.join(a.out, arm, kind + '.glb')
        why = 'no fitted file ' + src if not os.path.exists(src) else None
        if not why:
            try:
                why = one(src, out, a.angle, a.margin)
            except Exception as e:
                why = repr(e)[:300]
        if why:
            bad += 1
        print('uvclean %-18s %s' % (name, 'FAILED ' + why if why else 'ok'), flush=True)
    print('uvclean: %d failed' % bad)
    if bad:
        sys.exit(1)


main()
