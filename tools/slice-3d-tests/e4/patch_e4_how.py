# How to play: one sentence for the bosses (the Free Fall paragraph), after the Clean Slice one.
import io
p='/workspaces/lucid-winds/satellites/slice-3d/index.html'
s=io.open(p,encoding='utf-8').read()
a="land on the floor to earn the Clean Slice badge. "
assert s.count(a)==1
b=a+'Every fifth level ends at a <b style="color:var(--gold)">boss</b> over a net: fall onto it blade first and keep the blade down, and each time it hops the net lobs you back onto it (the net aims for you, so steer lightly). Three hits and it opens. Cut a rope or miss three lobs to skip it, which costs the Clean Slice. '
s=s.replace(a,b)
io.open(p,'w',encoding='utf-8').write(s); print('How sentence added')
