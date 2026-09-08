import random
DICE=[4,6,8,10,12]; W=[.35,.30,.20,.10,.05]
def roll(d,rng):
    t=0
    while True:
        x=rng.randint(1,d); t+=x
        if x!=d: return t
def fight(rng,strike,tough,hp,tns,mode,armor=0,start_strain=0):
    party=[{'d':rng.choices(DICE,W)[0],'s':start_strain,'a':armor} for _ in range(3)]
    asp=[{'hp':h,'tn':t,'hit':[]} for h,t in zip(hp,tns)]
    for _ in range(25):
        alive=[c for c in party if c['s']<tough]
        if not alive: return 'wipe',party
        if not [a for a in asp if a['hp']>0]: return 'win',party
        for c in alive:
            un=[a for a in asp if a['hp']>0]
            if not un: return 'win',party
            a=min(un,key=lambda x:x['hp'])
            push = c['s']<=tough-2
            if push: c['s']+=1
            if c['s']>=tough: continue
            r=roll(c['d'],rng)+(2 if push else 0)
            ok = r>=a['tn']
            if ok: a['hp']-=max(1,r-a['tn'])
            a['hit'].append((c,ok))
        if not [a for a in asp if a['hp']>0]: return 'win',party
        for a in asp:
            if a['hp']>0:
                for c,ok in a['hit']:
                    if c['s']>=tough: continue
                    if mode=='onfail' and ok: continue
                    dmg=strike
                    if c['a']>0:
                        used=min(c['a'],dmg); c['a']-=used; dmg-=used
                    c['s']+=dmg
            a['hit']=[]
    return 'timeout',party
def run(label,**kw):
    rng=random.Random(4242); N=4000; wins=d1=wipes=chd=0
    for _ in range(N):
        r,p=fight(rng,**kw)
        d=sum(1 for c in p if c['s']>=kw['tough']); chd+=d
        if d: d1+=1
        if d==3: wipes+=1
        if r=='win': wins+=1
    print('%-42s win %5.1f%%  per-char %5.1f%%  >=1 %5.1f%%  wipe %5.1f%%'%(label,100*wins/N,100*chd/(3*N),100*d1/N,100*wipes/N))
run('strike1 T4 hp10 all-attackers',strike=1,tough=4,hp=(3,3,4),tns=(5,5,4),mode='all')
run('strike1 T4 hp7  all-attackers',strike=1,tough=4,hp=(2,2,3),tns=(5,5,4),mode='all')
run('strike1 T4 hp6  all-attackers',strike=1,tough=4,hp=(2,2,2),tns=(5,5,4),mode='all')
run('strike2 T4 hp10 ON FAIL only',strike=2,tough=4,hp=(3,3,4),tns=(5,5,4),mode='onfail')
run('strike1 T4 hp10 ON FAIL only',strike=1,tough=4,hp=(3,3,4),tns=(5,5,4),mode='onfail')
run('strike2 T4 hp7  ON FAIL only',strike=2,tough=4,hp=(2,2,3),tns=(5,5,4),mode='onfail')
run('strike1 T4 hp10 +2 armor',strike=1,tough=4,hp=(3,3,4),tns=(5,5,4),mode='all',armor=2)
run('strike1 T6 hp10 all (T6=spec+2)',strike=1,tough=6,hp=(3,3,4),tns=(5,5,4),mode='all')
run('strike1 T4 hp7 start-strain1',strike=1,tough=4,hp=(2,2,3),tns=(5,5,4),mode='all',start_strain=1)
