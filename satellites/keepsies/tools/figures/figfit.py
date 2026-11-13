#!/usr/bin/env python3
# KEEPSIES m5, THE FIGURES: makes one raw Meshy sculpt a game figure. Blender 4.0, headless, one at a time.
#
#   blender -b --factory-startup -P satellites/keepsies/tools/figures/figfit.py -- --in RAW_DIR --out WORK_DIR [--only a,b]
#
# Driven by tools/figures/fit.sh (which then packs with gltfpack and writes assets/figures/manifest.json).
# The RAW GLBs are Stephen's paid originals and never enter the repo (the repo is public); only the fitted files do.
#
# What it does, in order (the approach of satellites/dewball/tools/forge/dewfit.py, read, not imported):
#  1. import with merge_vertices, join to ONE mesh, weld by 1e-5 of the diagonal (a decimate on an unwelded
#     triangle soup shreds it).
#  2. NORMALISE: one uniform scale so the height is 1, the origin at the centre of the BASE (the bounding centre
#     of the lowest 8% of the height, so a figure that leans still stands over its collider), +Y up in the file.
#     Facing: Meshy's front is the glTF +Z (the reference camera), kept as is: every figure faces +Z.
#  3. decimate (collapse) to the budget (statues 4,000 triangles, grails 5,000), triangulate, normalise AGAIN.
#  4. smooth shading, 40 degree auto smooth, imported split normals cleared.
#  5. ONE material, base colour only, capped at 512 px, metallic 0, rough 0.85; JPEG.
#  6. measure what the game fits by: the half extents of the LOW BAND (game y under 0.3 and under 0.15),
#     because a marble on the dirt only ever touches a figure's lowest third.
import bpy, bmesh, json, math, os, sys, argparse

BUDGETS = {}
GRAILS = {'koi', 'the_astronomer', 'the_drowned_knight', 'the_ember_dragon'}


def args():
    p = argparse.ArgumentParser()
    p.add_argument('--in', dest='indir', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--only', default='')
    p.add_argument('--tex', type=int, default=512)
    p.add_argument('--q', type=int, default=80, help='JPEG quality')
    p.add_argument('--budget', default='', help='id=triangles,... overrides (a figure whose UV atlas splits more vertices gets fewer triangles to stay near 200 KB)')
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return p.parse_args(argv)


def load(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path, merge_vertices=True)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for o in list(bpy.context.scene.objects):
        if o is not ob:
            bpy.data.objects.remove(o, do_unlink=True)
    return ob


def bounds(ob):
    vs = ob.data.vertices
    return [min(v.co[i] for v in vs) for i in range(3)], [max(v.co[i] for v in vs) for i in range(3)]


def weld(ob):
    mn, mx = bounds(ob)
    diag = math.sqrt(sum((mx[i] - mn[i]) ** 2 for i in range(3)))
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    if 0 < diag < 1e-3:
        for v in bm.verts:
            v.co *= 1.0 / diag
        diag = 1.0
    before = len(bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=max(1e-7, diag * 1e-5))
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    after = len(bm.verts)
    bm.to_mesh(ob.data)
    bm.free()
    return {'vertsIn': before, 'vertsWelded': after}


def normalise(ob):
    """Blender Z up maps to game +Y; Blender -Y maps to game +Z. Height 1, base centre at the origin."""
    mn, mx = bounds(ob)
    h = max(1e-9, mx[2] - mn[2])
    band = [v.co for v in ob.data.vertices if v.co[2] <= mn[2] + 0.08 * h]
    bx = (min(c[0] for c in band) + max(c[0] for c in band)) / 2
    by = (min(c[1] for c in band) + max(c[1] for c in band)) / 2
    s = 1.0 / h
    for v in ob.data.vertices:
        x, y, z = v.co
        v.co = ((x - bx) * s, (y - by) * s, (z - mn[2]) * s)


def tris(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def decimate(ob, budget):
    t0 = tris(ob)
    bpy.context.view_layer.objects.active = ob
    for _ in range(3):
        t = tris(ob)
        if t <= budget * 1.02:
            break
        m = ob.modifiers.new('dec', 'DECIMATE')
        m.decimate_type = 'COLLAPSE'
        m.ratio = budget / t
        m.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier='dec')
    ob.modifiers.new('tri', 'TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier='tri')
    return t0, tris(ob)


def shade(ob):
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    try:
        bpy.ops.mesh.customdata_custom_splitnormals_clear()
    except Exception:
        pass
    for p in ob.data.polygons:
        p.use_smooth = True
    # no auto smooth: a split normal is a split vertex, and Meshy's fragmented UV atlas already splits plenty (the
    # first pack ran 2.5 vertices a triangle and 250 KB a figure); the 512 px texture carries the creases
    ob.data.use_auto_smooth = False


def material(ob, fid, cap):
    mats = [s.material for s in ob.material_slots if s.material]
    info = {'materials': len(mats), 'texture': None}
    if not mats:
        return info
    keep = mats[0]
    keep.name = 'kp_' + fid
    while len(ob.material_slots) > 1:
        ob.active_material_index = len(ob.material_slots) - 1
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.material_slot_remove()
    if keep.use_nodes:
        nt = keep.node_tree
        bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf:
            for name in ('Normal', 'Metallic', 'Roughness', 'Emission Color', 'Emission', 'Alpha'):
                inp = bsdf.inputs.get(name)
                if inp:
                    for l in list(inp.links):
                        nt.links.remove(l)
            bsdf.inputs['Metallic'].default_value = 0.0
            bsdf.inputs['Roughness'].default_value = 0.85
            bc = bsdf.inputs.get('Base Color')
            if bc and bc.links and bc.links[0].from_node.type == 'TEX_IMAGE':
                img = bc.links[0].from_node.image
                if img:
                    w, h = img.size
                    if max(w, h) > cap:
                        img.scale(cap, max(1, int(round(h * cap / w))))
                    info['texture'] = list(img.size)
    return info


def measure(ob):
    """In GAME axes (x = x, y = Blender z, z = -Blender y): the whole bounds and the low bands' half extents."""
    vs = [(v.co[0], v.co[2], -v.co[1]) for v in ob.data.vertices]
    mn = [min(c[i] for c in vs) for i in range(3)]
    mx = [max(c[i] for c in vs) for i in range(3)]
    out = {'min': [round(x, 4) for x in mn], 'max': [round(x, 4) for x in mx]}
    for name, top in (('low30', 0.30), ('low15', 0.15)):
        b = [c for c in vs if c[1] <= top]
        out[name] = {'hx': round(max(abs(c[0]) for c in b), 4), 'hz': round(max(abs(c[2]) for c in b), 4),
                     'r': round(max(math.hypot(c[0], c[2]) for c in b), 4)}
    return out


def export(ob, path, q=80):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True,
                              export_yup=True, export_image_format='JPEG', export_image_quality=q,
                              export_materials='EXPORT', export_normals=True, export_texcoords=True,
                              export_colors=False, export_attributes=False, export_tangents=False,
                              export_animations=False, export_cameras=False, export_lights=False,
                              export_extras=False, export_skins=False, export_morph=False)


def main():
    a = args()
    only = set(x for x in a.only.split(',') if x)
    global BUDGETS
    BUDGETS = dict((p.split('=')[0], int(p.split('=')[1])) for p in a.budget.split(',') if '=' in p)
    os.makedirs(a.out, exist_ok=True)
    rp = os.path.join(a.out, 'fit-report.json')
    report = {}
    if os.path.exists(rp):
        report = json.load(open(rp))
    for f in sorted(os.listdir(a.indir)):
        if not f.endswith('.glb'):
            continue
        fid = f[:-4]
        if only and fid not in only:
            continue
        ob = load(os.path.join(a.indir, f))
        if not ob:
            print('figfit %s: no mesh' % fid, flush=True)
            continue
        w = weld(ob)
        normalise(ob)
        budget = BUDGETS.get(fid) or (5000 if fid in GRAILS else 4000)
        t_in, t_out = decimate(ob, budget)
        normalise(ob)
        shade(ob)
        m = material(ob, fid, a.tex)
        out = os.path.join(a.out, 'fit', fid + '.glb')
        export(ob, out, a.q)
        report[fid] = {'id': fid, 'grail': fid in GRAILS, 'trisIn': t_in, 'triangles': t_out, 'budget': budget,
                       'weld': w, 'texture': m['texture'], 'materials': m['materials'], 'bounds': measure(ob)}
        json.dump(report, open(rp, 'w'), indent=1)
        print('figfit %-20s tris %7d -> %5d tex %s' % (fid, t_in, t_out, m['texture']), flush=True)
    print('figfit: done', flush=True)


main()
