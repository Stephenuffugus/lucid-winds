#!/bin/bash
set -e
cd /workspaces/lucid-winds
S="$(cd "$(dirname "$0")" && pwd)"   # t1..t3.txt, caption600.ttf, endcard.png sit beside this script; output lands here too
FONT=$S/caption600.ttf
T1="Hop the roundest\nraccoon in Seattle"; T2="100 levels across\nthe rainy city"; T3="Collect bottlecaps,\nunlock 45 critters"
time ffmpeg -v error -y -i "${IN:-assets/preview.mp4}" -framerate 30 -loop 1 -t 38.2 -i $S/endcard.png -filter_complex "
[0:v]crop=856:1501:112:240,split=2[gcrop][gbg];
[gbg]scale=192:108,gblur=sigma=3,scale=1920:1080:flags=fast_bilinear,eq=brightness=-0.2:saturation=0.8[bg];
[gcrop]scale=-2:1080[fg];
[bg][fg]overlay=(W-w)/2:0:shortest=1[base];
[base]drawtext=fontfile=$FONT:textfile=$S/t1.txt:fontcolor=0xe8dcc8:fontsize=58:line_spacing=12:x=84:y=(h-text_h)/2:shadowcolor=black@0.8:shadowx=3:shadowy=3:enable='between(t,1.0,4.7)':alpha='if(lt(t,1.5),(t-1.0)/0.5,if(lt(t,4.2),1,(4.7-t)/0.5))',
drawtext=fontfile=$FONT:textfile=$S/t2.txt:fontcolor=0xe8dcc8:fontsize=58:line_spacing=12:x=w-text_w-84:y=(h-text_h)/2:shadowcolor=black@0.8:shadowx=3:shadowy=3:enable='between(t,12.0,15.7)':alpha='if(lt(t,12.5),(t-12.0)/0.5,if(lt(t,15.2),1,(15.7-t)/0.5))',
drawtext=fontfile=$FONT:textfile=$S/t3.txt:fontcolor=0xe8dcc8:fontsize=58:line_spacing=12:x=84:y=(h-text_h)/2:shadowcolor=black@0.8:shadowx=3:shadowy=3:enable='between(t,22.0,25.7)':alpha='if(lt(t,22.5),(t-22.0)/0.5,if(lt(t,25.2),1,(25.7-t)/0.5))'[capt];
[1:v]format=rgba,fade=t=in:st=35.0:d=0.8:alpha=1[end];
[capt][end]overlay=0:0:shortest=1:enable='gte(t,35.0)',format=yuv420p[v];
[0:a]afade=t=out:st=37.0:d=1.1[a]" -map "[v]" -map "[a]" -r 30 -c:v libx264 -preset veryfast -crf 19 -profile:v high -level 4.0 -movflags +faststart -c:a aac -b:a 192k -shortest $S/jimothy_trailer_1080p.mp4
ls -la $S/jimothy_trailer_1080p.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of default=nw=1 $S/jimothy_trailer_1080p.mp4 | tr '\n' ' '; echo
for t in 0.5 2.5 6 10 13.5 18 23.5 30 33; do ffmpeg -v error -y -ss $t -i $S/jimothy_trailer_1080p.mp4 -frames:v 1 $S/o_$t.png; done
python3 - <<PY
from PIL import Image
S='$S'; ts=['0.5','2.5','8','13.5','18','23.5','30','35.8','37.5']; ims=[Image.open(S+'/o_%s.png'%t) for t in ts]
tw,th=640,360; sheet=Image.new('RGB',(tw*3+8*4, th*3+8*4),(25,25,25))
for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),(8+(i%3)*(tw+8),8+(i//3)*(th+8)))
sheet.save(S+'/o_sheet.png'); print('sheet ok')
PY
