import zlib,struct,sys
def read(p):
    b=open(p,'rb').read(); i=8; w=h=ct=bd=None; idat=b''; pal=None; trns=None
    while i<len(b):
        n=struct.unpack('>I',b[i:i+4])[0]; t=b[i+4:i+8]; d=b[i+8:i+8+n]; i+=12+n
        if t==b'IHDR': w,h,bd,ct,_,_,il=struct.unpack('>IIBBBBB',d)
        elif t==b'IDAT': idat+=d
        elif t==b'PLTE': pal=d
        elif t==b'tRNS': trns=d
    raw=zlib.decompress(idat); ch={0:1,2:3,3:1,4:2,6:4}[ct]; st=ch*bd//8; bpl=(w*ch*bd+7)//8
    rows=[]; prev=bytearray(bpl); k=0
    for y in range(h):
        f=raw[k]; k+=1; line=bytearray(raw[k:k+bpl]); k+=bpl
        for x in range(bpl):
            a=line[x-st] if x>=st else 0; c=prev[x-st] if x>=st else 0; u=prev[x]
            if f==1: line[x]=(line[x]+a)&255
            elif f==2: line[x]=(line[x]+u)&255
            elif f==3: line[x]=(line[x]+(a+u)//2)&255
            elif f==4:
                p0=a+u-c; pa=abs(p0-a); pb=abs(p0-u); pc=abs(p0-c)
                pr=a if pa<=pb and pa<=pc else (u if pb<=pc else c)
                line[x]=(line[x]+pr)&255
        rows.append(line); prev=line
    def px(x,y):
        l=rows[y]
        if ct==6: return tuple(l[x*4:x*4+4])
        if ct==2: return tuple(l[x*3:x*3+3])+(255,)
        if ct==3:
            v=l[x]*bd//8 if bd==8 else 0
            idx=l[x] if bd==8 else (l[x*bd//8]>>(8-bd-(x*bd%8)))&((1<<bd)-1)
            al=trns[idx] if trns and idx<len(trns) else 255
            return (pal[idx*3],pal[idx*3+1],pal[idx*3+2],al)
        return tuple(l[x*ch:x*ch+ch])
    return w,h,ct,bd,px
import json,os
OUT=sys.argv[1]
for shot in json.load(open(OUT+'/points.json')):
    w,h,ct,bd,px=read(OUT+'/'+shot['name']+'.png'); k=w/412
    print('==',shot['name'],(w,h))
    for label,(x,y) in shot['list']:
        # a small median around the point, in device pixels
        X,Y=int(round(x*k)),int(round(y*k)); vals=[]
        for dy in range(-2,3):
            for dx in range(-2,3):
                if 0<=X+dx<w and 0<=Y+dy<h: vals.append(px(X+dx,Y+dy)[:3])
        vals.sort(key=lambda v:sum(v)); m=vals[len(vals)//2] if vals else None
        print('  %-40s %6.1f,%6.1f  %s'%(label,x,y,m))
