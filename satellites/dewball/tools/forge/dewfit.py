#!/usr/bin/env python3
# Dewball forge: makes a Meshy sculpt a Dewball PROP. Blender 4.0, headless, one at a time.
#
#   blender -b --factory-startup -P satellites/dewball/tools/forge/dewfit.py -- \
#       --in satellites/dewball/tools/forge/meshy-out --out satellites/dewball/tools/forge/pilot \
#       [--only cakestand.t2,teapot.std] [--yaw ant=90,teapot=180] [--largest ant]
#
# File names in: <kind>.<arm>.glb (meshy_api.py's names) or <kind>.glb. Unknown names are
# LISTED, never guessed. Out: <out>/<arm>/<kind>.glb (or <out>/<kind>.glb without an arm)
# plus <out>/fit-report.json.
#
# What it does, in order, and why:
#  1. import with merge_vertices (Meshy GLBs are triangle soups; Blender keeps UVs per loop,
#     so welding positions never tears a UV seam) and weld again by 1e-5 of the diagonal:
#     a decimate on an unwelded soup shreds the mesh (the Tumble scar).
#  2. join everything into ONE mesh (the game reads one mesh per file) and report how many
#     separate pieces it holds; --largest keeps only the biggest (a stray tube once came
#     back beside a sock). Off by default: a cherry on a cake is a separate piece too.
#  3. --yaw turns it about up. Movers walk along the game's +Z (stepMovers: velocity is
#     (sin rot, cos rot) and rotation.y = rot), so a creature's head goes to game +Z.
#  4. FIT: one uniform scale so the model's largest bounding extent equals its PRIMITIVE's
#     largest extent (manifest.json bbox), x and z centred, the lowest point on y = 0.
#     ⚖️ Not the catalogue size s: physics reads s and never geometry, and s is not the
#     visible size (max extent / s runs 0.45 to 2.0). Matching the primitive keeps every
#     prop exactly as big on screen as players know it, so eye and physics agree as today.
#  5. decimate (collapse) to the kind's triangle budget when over it, then triangulate.
#  6. smooth shading with a 40 degree auto smooth, custom split normals cleared (the
#     imported ones describe a mesh that no longer exists after the weld and decimate).
#  7. cap the base colour texture to the tier's size; drop any other maps; one material,
#     named dw_<kind>. JPEG out (no alpha in these props).
#  8. export glTF binary, +Y up, selection only, no animation, camera, light or extras.
import bpy, bmesh, json, math, os, sys, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
MAN = {k['id']: k for k in json.load(open(os.path.join(HERE, 'manifest.json')))['kinds']}


def args():
    p = argparse.ArgumentParser()
    p.add_argument('--in', dest='indir', required=True)
    p.add_argument('--out', required=True)
    p.add_argument('--only', default='')
    p.add_argument('--yaw', default='', help='kind=degrees,... turn about up before the fit')
    p.add_argument('--largest', default='', help='kinds that keep only their biggest piece')
    p.add_argument('--tex', type=int, default=0, help='override the texture cap (px)')
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return p.parse_args(argv)


def identify(fname):
    stem = os.path.basename(fname)
    if not stem.lower().endswith('.glb'):
        return None
    parts = stem[:-4].split('.')
    if parts[0] not in MAN:
        return None
    return parts[0], (parts[1] if len(parts) > 1 else None)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def load(path):
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
    mn = [min(v.co[i] for v in vs) for i in range(3)]
    mx = [max(v.co[i] for v in vs) for i in range(3)]
    return mn, mx


def weld_and_pieces(ob, keep_largest):
    mn, mx = bounds(ob)
    diag = math.sqrt(sum((mx[i] - mn[i]) ** 2 for i in range(3)))
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    before = len(bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=max(1e-7, diag * 1e-5))
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    # connected pieces, by face adjacency through shared verts
    bm.faces.ensure_lookup_table()
    seen, pieces = set(), []
    for f in bm.faces:
        if f.index in seen:
            continue
        stack, comp = [f], []
        seen.add(f.index)
        while stack:
            g = stack.pop()
            comp.append(g)
            for v in g.verts:
                for h in v.link_faces:
                    if h.index not in seen:
                        seen.add(h.index)
                        stack.append(h)
        pieces.append(comp)
    pieces.sort(key=len, reverse=True)
    total = sum(len(c) for c in pieces) or 1
    info = {'vertsIn': before, 'vertsWelded': len(bm.verts), 'pieces': len(pieces),
            'largestShare': round(len(pieces[0]) / total, 3) if pieces else 0}
    if keep_largest and len(pieces) > 1:
        drop = [g for c in pieces[1:] for g in c]
        bmesh.ops.delete(bm, geom=drop, context='FACES')
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
        info['keptLargestOnly'] = True
    bm.to_mesh(ob.data)
    bm.free()
    return info


def yaw(ob, deg):
    if not deg:
        return
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    for v in ob.data.vertices:
        x, y, z = v.co
        v.co = (x * c - y * s, x * s + y * c, z)


def fit(ob, kind):
    """Blender is Z up; the game (glTF) is Y up, mapped by the exporter: game x = x,
       game y = Blender z, game z = -Blender y. The largest extent is the same either way."""
    target = max(MAN[kind]['bbox'])
    mn, mx = bounds(ob)
    ext = [mx[i] - mn[i] for i in range(3)]
    s = target / max(1e-9, max(ext))
    cx, cy, z0 = (mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, mn[2]
    for v in ob.data.vertices:
        x, y, z = v.co
        v.co = ((x - cx) * s, (y - cy) * s, (z - z0) * s)
    mn, mx = bounds(ob)
    return s, [round(mx[0] - mn[0], 2), round(mx[2] - mn[2], 2), round(mx[1] - mn[1], 2)]   # game x, y, z


def tris(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def decimate(ob, budget):
    t0 = tris(ob)
    bpy.context.view_layer.objects.active = ob
    for _ in range(2):
        t = tris(ob)
        if t <= budget * 1.02:
            break
        m = ob.modifiers.new('dec', 'DECIMATE')
        m.decimate_type = 'COLLAPSE'
        m.ratio = budget / t
        m.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier='dec')
    m = ob.modifiers.new('tri', 'TRIANGULATE')
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
    ob.data.use_auto_smooth = True
    ob.data.auto_smooth_angle = math.radians(40)


def material(ob, kind, cap):
    mats = [s.material for s in ob.material_slots if s.material]
    info = {'materials': len(mats), 'texture': None}
    if not mats:
        return info
    keep = mats[0]
    keep.name = 'dw_' + kind
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
            bsdf.inputs['Roughness'].default_value = 1.0
            bc = bsdf.inputs.get('Base Color')
            if bc and bc.links and bc.links[0].from_node.type == 'TEX_IMAGE':
                img = bc.links[0].from_node.image
                if img:
                    w, h = img.size
                    if max(w, h) > cap:
                        img.scale(cap, max(1, int(round(h * cap / w))))
                    info['texture'] = list(img.size)
    return info


def export(ob, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True,
                              export_yup=True, export_image_format='JPEG', export_image_quality=88,
                              export_materials='EXPORT', export_normals=True, export_texcoords=True,
                              export_colors=False, export_attributes=False, export_tangents=False,
                              export_animations=False, export_cameras=False, export_lights=False,
                              export_extras=False, export_skins=False, export_morph=False)


def tex_cap(kind):
    k = MAN[kind]
    return k['budgetTex'] or 256


def main():
    a = args()
    only = set(x for x in a.only.split(',') if x)
    yaws = dict((p.split('=')[0], float(p.split('=')[1])) for p in a.yaw.split(',') if '=' in p)
    largest = set(x for x in a.largest.split(',') if x)
    files = sorted(f for f in os.listdir(a.indir) if f.lower().endswith('.glb'))
    report, unknown = [], []
    for f in files:
        ident = identify(f)
        if not ident:
            unknown.append(f)
            continue
        kind, arm = ident
        name = kind + ('.' + arm if arm else '')
        if only and name not in only and kind not in only:
            continue
        reset()
        ob = load(os.path.join(a.indir, f))
        if not ob:
            report.append({'name': name, 'ok': False, 'why': 'no mesh in file'})
            continue
        w = weld_and_pieces(ob, kind in largest)
        yaw(ob, yaws.get(kind, 0))
        scale, ext = fit(ob, kind)
        budget = MAN[kind]['budgetTris'] or 300
        t_in, t_out = decimate(ob, budget)
        shade(ob)
        cap = a.tex or tex_cap(kind)
        m = material(ob, kind, cap)
        out = os.path.join(a.out, arm, kind + '.glb') if arm else os.path.join(a.out, kind + '.glb')
        export(ob, out)
        want = max(MAN[kind]['bbox'])
        checks = {'size matches primitive (1%)': abs(max(ext) - want) <= want * 0.01,
                  'tris within budget (+2%)': t_out <= budget * 1.02,
                  'one material': m['materials'] == 1,
                  'has a texture': bool(m['texture'])}
        report.append({'name': name, 'kind': kind, 'arm': arm, 'ok': all(checks.values()), 'checks': checks,
                       'trisIn': t_in, 'tris': t_out, 'budget': budget, 'extentGame': ext, 'primBbox': MAN[kind]['bbox'],
                       'fitScale': round(scale, 4), 'yaw': yaws.get(kind, 0), 'weld': w, 'texture': m['texture'],
                       'out': os.path.relpath(out, HERE), 'bytes': os.path.getsize(out)})
        print('dewfit %-16s tris %6d -> %5d (budget %d) extent %s vs prim %s pieces %d tex %s %s'
              % (name, t_in, t_out, budget, ext, MAN[kind]['bbox'], w['pieces'], m['texture'],
                 'OK' if all(checks.values()) else 'CHECK ' + ','.join(k for k, v in checks.items() if not v)), flush=True)
    os.makedirs(a.out, exist_ok=True)
    rp = os.path.join(a.out, 'fit-report.json')
    old = []
    if os.path.exists(rp):
        try:
            old = [r for r in json.load(open(rp)) if r.get('name') not in set(x['name'] for x in report)]
        except Exception:
            old = []
    json.dump(old + report, open(rp, 'w'), indent=1)
    print('dewfit: %d fitted, %d clean' % (len(report), sum(1 for r in report if r.get('ok'))))
    for f in unknown:
        print('  UNKNOWN FILE (not fitted): %s' % f)


main()
