"""Flock the World Steam capsules, every Valve size, from two shipped files:
   art/bg/wordmark.webp (the title, 900x450, transparent) and art/bg/bg_menu.webp (the
   surveillance pyramid over the city, 820x461).  python3 capsules/build.py
Rules baked in (the ones that bounced Jimothy): capsules carry the TITLE ONLY, the library
hero carries NO title, the library logo is transparent and title only, no tagline anywhere.
The background is 820 px wide, so the 3840 hero is an upscale: soft on purpose, darkened, with
the city held in the lower third. Replace bg_menu with a wider render when one exists."""
import os
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__)); GAME=os.path.join(HERE,'..','..','..','satellites','flock-the-world'); OUT=os.path.join(HERE,'out'); os.makedirs(OUT,exist_ok=True)
BG=Image.open(os.path.join(GAME,'art','bg','bg_menu.webp')).convert('RGB')
WM=Image.open(os.path.join(GAME,'art','bg','wordmark.webp')).convert('RGBA')
ICON=Image.open(os.path.join(GAME,'play-icon-512.png')).convert('RGBA')
def cover(img,w,h,anchor=0.55):
    """scale to cover w x h, crop with the vertical anchor (0 top, 1 bottom)"""
    s=max(w/img.width,h/img.height); im=img.resize((round(img.width*s)+1,round(img.height*s)+1),Image.LANCZOS)
    x=(im.width-w)//2; y=int((im.height-h)*anchor); return im.crop((x,y,x+w,y+h))
def plate(w,h,anchor=0.55,dark=0.82,blur=0):
    im=cover(BG,w,h,anchor)
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    im=ImageEnhance.Brightness(im).enhance(dark)
    # vignette so the title always sits on something quiet
    v=Image.new('L',(w,h),0); d=ImageDraw.Draw(v); d.ellipse((-w*0.2,-h*0.3,w*1.2,h*1.35),fill=255); v=v.filter(ImageFilter.GaussianBlur(max(w,h)*0.12))
    dark_layer=Image.new('RGB',(w,h),(0,0,0)); im=Image.composite(im,dark_layer,v.point(lambda p:int(120+p*0.53)))
    return im.convert('RGBA')
def title(im,frac_w,cy_frac):
    tw=int(im.width*frac_w); wm=WM.resize((tw,int(WM.height*tw/WM.width)),Image.LANCZOS)
    glow=Image.new('RGBA',im.size,(0,0,0,0)); g=wm.split()[3].point(lambda a:int(a*0.55)); shadow=Image.new('RGBA',wm.size,(0,0,0,0)); shadow.putalpha(g)
    x=(im.width-wm.width)//2; y=int(im.height*cy_frac-wm.height/2)
    glow.paste(shadow,(x+4,y+8)); glow=glow.filter(ImageFilter.GaussianBlur(12)); im.alpha_composite(glow); im.alpha_composite(wm,(x,y)); return im
def save(im,name):
    p=os.path.join(OUT,name); im.convert('RGB').save(p,quality=95) if name.endswith('.jpg') else im.save(p); print(' ',name,im.size)
# capsules: title on a quiet plate. Small one gets the biggest title (it is drawn tiny everywhere).
save(title(plate(462,174,0.35,0.7,1.2),0.86,0.5),'small_capsule_462x174.png')
save(title(plate(920,430,0.4,0.8),0.72,0.47),'header_capsule_920x430.png')
save(title(plate(1232,706,0.42,0.85),0.66,0.44),'main_capsule_1232x706.png')
save(title(plate(748,896,0.5,0.85),0.9,0.36),'vertical_capsule_748x896.png')
save(title(plate(600,900,0.5,0.85),0.92,0.34),'library_capsule_600x900.png')
# hero: no title at all (Valve draws the logo over it)
save(plate(3840,1240,0.62,0.9),'library_hero_3840x1240.png')
# logo: transparent, title only
logo=Image.new('RGBA',(1280,720),(0,0,0,0)); logo=title(logo,0.86,0.5); save(logo,'library_logo_1280x720.png')
# page background: soft and dark, nothing to read
save(plate(1438,810,0.6,0.55,2.5),'page_background_1438x810.png')
# client icons
ICON.resize((256,256),Image.LANCZOS).save(os.path.join(OUT,'icon_256.png'))
ICON.convert('RGB').resize((184,184),Image.LANCZOS).save(os.path.join(OUT,'app_icon_184.jpg'),quality=92)
ICON.save(os.path.join(OUT,'ftw.ico'),sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
print('  icons: icon_256.png app_icon_184.jpg ftw.ico')
# contact sheet for the eye
names=['small_capsule_462x174.png','header_capsule_920x430.png','main_capsule_1232x706.png','vertical_capsule_748x896.png','library_capsule_600x900.png','library_hero_3840x1240.png','library_logo_1280x720.png','page_background_1438x810.png']
sheet=Image.new('RGB',(1600,1000),(30,30,34)); pos=[(10,10,462,174),(490,10,600,280),(1100,10,490,281),(10,300,300,359),(320,300,240,360),(570,300,1020,330),(10,680,560,315),(590,680,560,315)]
for n,(x,y,w,h) in zip(names,pos): im=Image.open(os.path.join(OUT,n)).convert('RGB'); im.thumbnail((w,h)); sheet.paste(im,(x,y))
sheet.save(os.path.join(OUT,'_contact_sheet.png')); print('  _contact_sheet.png')
