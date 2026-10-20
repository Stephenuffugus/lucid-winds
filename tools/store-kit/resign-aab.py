#!/usr/bin/env python3
"""Re-sign a Bubblewrap AAB the way Play accepted it (Tumble, 7 Oct 2026; Fretwork, 18 Oct):
   rewrite the zip without META-INF/MANIFEST.MF, *.SF, *.RSA and directory entries (external_attr=0),
   then sign with JDK 21 jarsigner (Play rejected a JDK 25 signed bundle), verify, print the fingerprint.
   usage: resign-aab.py <in.aab> <out.aab> <keystore> <alias> <password-file>"""
import sys, zipfile, subprocess, os
src, dst, ks, alias, pwf = sys.argv[1:6]
J = '/usr/local/sdkman/candidates/java/21.0.12+1-ms/bin/'
tmp = dst + '.unsigned'
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
    for info in zi.infolist():
        n = info.filename
        if n.endswith('/'): continue
        if n.startswith('META-INF/') and (n == 'META-INF/MANIFEST.MF' or n.endswith(('.SF', '.RSA', '.DSA', '.EC'))): continue
        ni = zipfile.ZipInfo(n, date_time=info.date_time); ni.compress_type = info.compress_type; ni.external_attr = 0
        zo.writestr(ni, zi.read(n))
pw = open(pwf).read().strip()
subprocess.run([J + 'jarsigner', '-keystore', ks, '-storepass', pw, '-keypass', pw, '-sigalg', 'SHA256withRSA',
                '-digestalg', 'SHA-256', '-sigfile', 'UPLOAD', '-signedjar', dst, tmp, alias], check=True, stdout=subprocess.DEVNULL)
os.remove(tmp)
v = subprocess.run([J + 'jarsigner', '-verify', dst], capture_output=True, text=True).stdout.strip().splitlines()[-1]
fp = [l for l in subprocess.run([J + 'keytool', '-printcert', '-jarfile', dst], capture_output=True, text=True).stdout.splitlines() if 'SHA256:' in l]
print(v); print(fp[0].strip() if fp else 'NO FINGERPRINT'); print(os.path.getsize(dst), 'bytes')
