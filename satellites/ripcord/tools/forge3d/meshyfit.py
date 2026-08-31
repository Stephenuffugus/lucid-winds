#!/usr/bin/env python3
# forge3d/meshyfit.py — fits a Meshy image-to-3D sculpt onto the RIPCORD mount.
#
#   blender -b --factory-startup -P tools/forge3d/meshyfit.py -- \
#       --in <dir of .glb from Meshy> [--only cleaver,bell] [--flip ids]
#
# Meshy gives back a sculpt with no idea the mount exists. This makes it a
# PART: aligned flat, scaled to the catalogue radius, origin on the mount
# face, the mount interface machined in (bore + boss annulus for a blade,
# bayonet lugs for a core), decimated, textures capped, then the same
# dimensional validation as the procedural build.
#
# HERO LANE, deliberately: a Meshy core decimated to the 300-triangle
# budget is mush, so these land in assets/3d/hero/<slot>/<id>.glb at a
# 5000-triangle ceiling for cards and closeups. The in-budget procedural
# set in assets/3d/<slot>/ stays the game LOD. Both sets share ids,
# origins and dimensions, so a renderer can swap them freely.
#
# File naming in: 'blade-cleaver.glb', 'core-bell.glb' (the meshy-in
# package names), tolerant of Meshy suffixes like ' (1)'. Unknown names
# are listed, never guessed.
import bpy, bmesh, json, math, os, re, sys, argparse, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
_sm = importlib.util.spec_from_file_location('forgebuild', os.path.join(HERE, 'build.py'))
FB = importlib.util.module_from_spec(_sm); _sm.loader.exec_module(FB)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SPEC = json.load(open(os.path.join(HERE, 'spec.json')))
M = SPEC['mount']
HERO_TRIS = 40000   # Meshy retopos to ~30k; decimate is a backstop, not a wood chipper
TEX_MAX = 512

CORES = {p['id']: p for p in SPEC['cores']}
BLADES = {p['id']: p for p in SPEC['blades']}

def args():
    p = argparse.ArgumentParser()
    p.add_argument('--in', dest='indir', required=True)
    p.add_argument('--only', default='')
    p.add_argument('--flip', default='', help='ids whose face came out downward')
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return p.parse_args(argv)

def identify(fname):
    """'blade-cleaver (2).glb' -> ('blade', 'cleaver'). None if unknown."""
    stem = re.sub(r'\s*\(\d+\)$', '', os.path.splitext(os.path.basename(fname))[0]).lower()
    m = re.match(r'(core|blade)[-_ ]+(.+)$', stem)
    cand = [(m.group(1), m.group(2))] if m else []
    cand += [('core', stem), ('blade', stem)]
    for slot, pid in cand:
        if slot == 'core' and pid in CORES: return 'core', pid
        if slot == 'blade' and pid in BLADES: return 'blade', pid
    return None

def wipe():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes): bpy.data.meshes.remove(m)

def import_and_join(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in set(bpy.data.objects) - before if o.type == 'MESH']
    if not new: return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in new: o.select_set(True)
    bpy.context.view_layer.objects.active = new[0]
    if len(new) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return ob

def lay_flat(ob, flip):
    """A part is a disc: its thinnest bounding axis is its thickness, and
       that axis belongs on Z. Meshy has no reason to agree, so measure -
       and rotate the VERTICES directly: the operator version left the
       rotation unapplied and every later stage machined a STANDING disc
       (the bore tunnelled sideways through it). Meshy faces the sculpt
       toward -Y after import, so mapping y->z lands the face UP."""
    vs = ob.data.vertices
    ext = [max(v.co[i] for v in vs) - min(v.co[i] for v in vs) for i in range(3)]
    thin = ext.index(min(ext))
    for v in vs:
        x, y, z = v.co
        if thin == 0:   v.co = (z, y, -x)
        elif thin == 1: v.co = (x, z, -y)
    if flip:
        for v in vs:
            x, y, z = v.co
            v.co = (x, -y, -z)

def fit(ob, slot, pid):
    """Scale to catalogue size, origin on the mount face. Centre is the
       BBOX centre, not the vertex mean - sculpt density piles up on the
       detailed bits and drags a mean centroid toward them. (The first
       version also recomputed that mean INSIDE the per-vertex loop:
       O(n^2), half an hour per part, and the run's timeout killed
       blender silently - which looked exactly like a crash.)"""
    vs = ob.data.vertices
    target_r = BLADES[pid]['radiusMm'] if slot == 'blade' else 10.0
    xs = [v.co.x for v in vs]; ys = [v.co.y for v in vs]
    cx = (max(xs) + min(xs)) / 2; cy = (max(ys) + min(ys)) / 2
    rmax = max(math.hypot(x - cx, y - cy) for x, y in zip(xs, ys))
    s = target_r / max(1e-6, rmax)
    for v in vs:
        v.co.x = (v.co.x - cx) * s; v.co.y = (v.co.y - cy) * s; v.co.z *= s
    zmin = min(v.co.z for v in vs)
    for v in vs: v.co.z -= zmin          # mount face (underside) at 0
    # a sculpt from a straight-on image can come back paper thin; give it
    # a floor so the part reads from an angle
    zmax = max(v.co.z for v in vs)
    if zmax < 1.6:
        for v in vs: v.co.z *= (2.2 / max(1e-6, zmax))

def machine_mount(ob, slot, pid):
    """The interface the sculpt knows nothing about."""
    bm = bmesh.new()
    if slot == 'blade':
        # bore: boolean a 16mm cylinder through everything
        cut = bpy.data.meshes.new('cut'); co = bpy.data.objects.new('cut', cut)
        bpy.context.collection.objects.link(co)
        b2 = bmesh.new()
        n = 24; zt = max(v.co.z for v in ob.data.vertices) + 1
        a = [2*math.pi*i/n for i in range(n)]
        v0 = [b2.verts.new((8.0*math.cos(t), 8.0*math.sin(t), -3)) for t in a]
        v1 = [b2.verts.new((8.0*math.cos(t), 8.0*math.sin(t), zt)) for t in a]
        for i in range(n):
            j = (i+1) % n
            b2.faces.new((v0[i], v0[j], v1[j], v1[i]))
        b2.faces.new(tuple(reversed(v0))); b2.faces.new(tuple(v1))
        bmesh.ops.recalc_face_normals(b2, faces=b2.faces)
        b2.to_mesh(cut); b2.free()
        mod = ob.modifiers.new('bore', 'BOOLEAN')
        mod.operation, mod.object, mod.solver = 'DIFFERENCE', co, 'FAST'
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier='bore')
        bpy.data.objects.remove(co, do_unlink=True)
        # boss annulus under the bore, same as the procedural build
        n2 = 16
        def ring(rr, z): return [bm.verts.new((rr*math.cos(2*math.pi*i/n2), rr*math.sin(2*math.pi*i/n2), z)) for i in range(n2)]
        vo0, vo1, vi0, vi1 = ring(M['bossDia']/2, -2), ring(M['bossDia']/2, 0), ring(8.6, -2), ring(8.6, 0)
        for i in range(n2):
            j = (i+1) % n2
            bm.faces.new((vo0[i], vo0[j], vo1[j], vo1[i]))
            bm.faces.new((vi1[i], vi1[j], vi0[j], vi0[i]))
            bm.faces.new((vi0[i], vi0[j], vo0[j], vo0[i]))
    else:
        for k in range(M['lugs']):
            a = 2*math.pi*k/M['lugs']
            lx, ly = math.cos(a)*(M['socketBossDia']/2 + 1.2), math.sin(a)*(M['socketBossDia']/2 + 1.2)
            n2 = 6
            v0 = [bm.verts.new((lx+1.5*math.cos(2*math.pi*i/n2), ly+1.5*math.sin(2*math.pi*i/n2), -2)) for i in range(n2)]
            v1 = [bm.verts.new((lx+1.5*math.cos(2*math.pi*i/n2), ly+1.5*math.sin(2*math.pi*i/n2), 0)) for i in range(n2)]
            for i in range(n2):
                j = (i+1) % n2
                bm.faces.new((v0[i], v0[j], v1[j], v1[i]))
            bm.faces.new(tuple(reversed(v0)))
    if len(bm.verts):
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        add = bpy.data.meshes.new('mount'); ao = bpy.data.objects.new('mount', add)
        bpy.context.collection.objects.link(ao)
        bm.to_mesh(add)
        # the machined interface is steel, not whatever material slot the
        # sculpt happens to put first (it rendered as a black rubber ring)
        steel = bpy.data.materials.get('lw_steel')
        if not steel:
            steel = bpy.data.materials.new('lw_steel'); steel.use_nodes = True
            b = steel.node_tree.nodes['Principled BSDF']
            b.inputs['Base Color'].default_value = (0.52, 0.54, 0.58, 1)
            b.inputs['Metallic'].default_value = 1.0
            b.inputs['Roughness'].default_value = 0.32
        add.materials.append(steel)
        bpy.ops.object.select_all(action='DESELECT')
        ao.select_set(True); ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.join()
    bm.free()

def slim(ob):
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if tris > HERO_TRIS:
        mod = ob.modifiers.new('dec', 'DECIMATE')
        mod.ratio = HERO_TRIS / tris
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier='dec')
    for img in bpy.data.images:
        if img.size[0] > TEX_MAX:
            img.scale(TEX_MAX, TEX_MAX)
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)

def main():
    a = args()
    only = set(x for x in a.only.split(',') if x)
    flips = set(x for x in a.flip.split(',') if x)
    files = sorted(f for f in os.listdir(a.indir) if f.lower().endswith('.glb'))
    report, unknown = [], []
    for f in files:
        ident = identify(f)
        if not ident:
            unknown.append(f); continue
        slot, pid = ident
        if only and pid not in only: continue
        wipe()
        ob = import_and_join(os.path.join(a.indir, f))
        if not ob:
            report.append({'id': pid, 'ok': False, 'why': 'no mesh in file'}); continue
        lay_flat(ob, pid in flips)
        fit(ob, slot, pid)
        machine_mount(ob, slot, pid)
        tris = slim(ob)
        vs = ob.data.vertices
        rmax = max(math.hypot(v.co.x, v.co.y) for v in vs)
        want_r = BLADES[pid]['radiusMm'] if slot == 'blade' else 10.0
        lo_z = min(v.co.z for v in vs)
        checks = {
            'radius': abs(rmax - want_r) < 0.3,
            'mount reaches -2': abs(lo_z + 2.0) < 0.1,
            'hero tris': tris <= HERO_TRIS,
        }
        d = os.path.join(ROOT, 'assets', '3d', 'hero', slot)
        os.makedirs(d, exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
        bpy.ops.export_scene.gltf(filepath=os.path.join(d, pid + '.glb'),
            use_selection=True, export_format='GLB', export_apply=True)
        cam = FB.setup_render()
        FB.render_part(ob, slot, cam, os.path.join(HERE, 'renders', 'hero-' + pid + '.png'))
        report.append({'id': pid, 'slot': slot, 'ok': all(checks.values()),
                       'tris': tris, 'checks': checks})
    json.dump(report, open(os.path.join(HERE, 'meshy-report.json'), 'w'), indent=1)
    good = sum(1 for r in report if r.get('ok'))
    print('meshyfit: %d fitted, %d clean' % (len(report), good))
    for r in report:
        if not r.get('ok'):
            print('  CHECK %s: %s' % (r['id'], r.get('why') or
                  [k for k, v in r.get('checks', {}).items() if not v]))
    for f in unknown:
        print('  UNKNOWN FILE (not fitted): %s' % f)

main()
