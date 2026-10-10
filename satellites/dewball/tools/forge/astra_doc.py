#!/usr/bin/env python3
"""Dewball forge ASTRA DOC: one world's paste ready picture prompt for his Astra (ChatGPT), the format that
came back right first time for Night Garden (10 Oct: all 16 pictures usable, nothing redone).

    python3 satellites/dewball/tools/forge/astra_doc.py --world w4 [--out file.txt]

Reads <world>-sheets.json (which kinds go in which picture: landmarks alone, then 2x2 sheets in reading
order, then any picture alone; "-" = an empty quarter) and recipes.json (each kind's shape line and colour
line, the world's picture style). Prints the doc text; he selects all, copies and pastes it into Astra,
which hands back one zip of picture-01.png and on. sheetcut.py then cuts each picture with the same plan.
"""
import argparse, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
NAMES = {k['id']: k['name'] for k in json.load(open(os.path.join(HERE, 'manifest.json')))['kinds']}
CORNERS = ['Top left', 'Top right', 'Bottom left', 'Bottom right']


def pic(r):
    """a kind's picture lines: 'picture'/'pictureColours' when written for Astra (a remake keeps its old text to 3D
    prompt beside them, which the ledger still names), else the prompt and texture lines"""
    return {'prompt': r.get('picture') or r['prompt'], 'texture': r.get('pictureColours') or r['texture']}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--world', required=True)
    p.add_argument('--out', default='')
    a = p.parse_args()
    S = json.load(open(os.path.join(HERE, '%s-sheets.json' % a.world)))
    R = json.load(open(os.path.join(HERE, 'recipes.json')))
    D = S['doc']
    NAMES.update(S.get('labels', {}))   # a kind drawn under another name in the picture (w4 hookah: a brass ewer)
    alone = [{'picture': i + 1, 'title': NAMES[k], 'kinds': [k]} for i, k in enumerate(S['landmarks'])] + S.get('alone', [])
    pics = sorted(alone + S['sheets'], key=lambda x: x['picture'])
    n = len(pics)
    if [x['picture'] for x in pics] != list(range(1, n + 1)):
        sys.exit('pictures are not numbered 1 to %d without a gap' % n)
    for x in pics:
        for k in x['kinds']:
            if k != '-' and k not in R['kinds']:
                sys.exit('no prompt in recipes.json for ' + k)

    def nums(xs):
        xs = [x['picture'] for x in xs]
        runs, s = [], xs[0]
        for i in range(1, len(xs) + 1):
            if i == len(xs) or xs[i] != xs[i - 1] + 1:
                e = xs[i - 1]
                runs.append(str(s) if s == e else ('%d and %d' if e == s + 1 else '%d to %d') % (s, e))
                if i < len(xs): s = xs[i]
        return ' and '.join(runs)

    singles = [x for x in pics if len(x['kinds']) == 1]
    grids = [x for x in pics if len(x['kinds']) == 4]
    side = [x['picture'] for x in grids if 'facing right' in x['title']]
    L = []
    L.append('You are making %d pictures for a phone game called Dewball, for its world %s, %s. I will cut each object out '
             'of your pictures and turn it into a 3D model, so every picture must follow these rules exactly.' % (n, D['world'], D['blurb']))
    L += ['', 'RULES FOR EVERY PICTURE', '', '1. A square image.']
    L.append('2. Pictures %s: ONE object alone, centred, whole, with wide empty space around it. Pictures %s: a two by two grid '
             'of four separate objects, each alone and centred in its own quarter, with wide empty space around each one, nothing '
             'touching and nothing crossing the middle of the picture.' % (nums(singles), nums(grids)))
    L.append('3. Background: plain flat mid grey everywhere. No floor, no shadow on the ground, no scene, no grid lines drawn.')
    L.append('4. Every object whole and not cropped, seen from the front and a little above.'
             + (' In picture %s each creature is seen from the side, facing right, standing low.' % ' and '.join(map(str, side)) if side else ''))
    L.append('5. No text, no letters, no numbers, no logos anywhere, not even on labels, books, clocks or signs.')
    L.append('6. Style for every object: ' + D['style'] + ' Each object must read at a glance as its name.')
    L.append('7. Nothing may look like a famous character, a brand, a real product design, a national flag or a religious symbol.')
    L += ['', 'HOW TO WORK', '']
    L.append('Make the pictures one at a time, in order, each as its own image. Before each image write one short line: Picture N: '
             'its title. If you have to stop, stop after a finished picture; when I say continue, carry on with the next one. After '
             'picture %d, list any picture you think broke a rule so I can ask for a redo. Then, if you are able to, give me one zip '
             'file of all %d images named picture-01.png to picture-%02d.png so I can download them in one click; if you cannot make '
             'a zip, just say so.' % (n, n, n))
    L += ['', 'THE %d PICTURES' % n]
    for x in pics:
        L.append('')
        if len(x['kinds']) == 1:
            k = x['kinds'][0]; r = pic(R['kinds'][k])
            L.append('Picture %d, %s, one object alone: %s Colours: %s' % (x['picture'], NAMES[k] if x['title'] == NAMES[k] else x['title'], r['prompt'], r['texture']))
        else:
            L.append('Picture %d, %s, a two by two grid:' % (x['picture'], x['title']))
            for c, k in zip(CORNERS, x['kinds']):
                if k == '-':
                    L.append('%s: leave this quarter empty.' % c)
                else:
                    r = pic(R['kinds'][k])
                    L.append('%s: %s. %s Colours: %s' % (c, NAMES[k], r['prompt'], r['texture']))
    text = '\n'.join(L) + '\n'
    if a.out:
        open(a.out, 'w').write(text)
    else:
        sys.stdout.write(text)
    print('%s: %d pictures, %d kinds' % (a.world, n, sum(1 for x in pics for k in x['kinds'] if k != '-')), file=sys.stderr)


main()
