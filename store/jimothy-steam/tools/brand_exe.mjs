/* Brand the packaged exe: Jimothy's icon + version strings, in pure Node.
   electron-builder's own step (rcedit) needs wine AND a 32-bit wine, which this
   box does not have (wine64 alone fails with c0000135 on rcedit-ia32), so
   `signAndEditExecutable` stays false and this runs after the dir build instead.
   Usage: node tools/brand_exe.mjs "<dist>/win-unpacked/Jumping Jimothy.exe" capsules/out/jimothy.ico
   Verify: wrestool -x -t 14 -o /tmp/x.ico "<exe>" then LOOK at it. */
import fs from 'node:fs';
import * as ResEdit from 'resedit';
import * as PELib from 'pe-library';
const [exePath, icoPath] = process.argv.slice(2);
const exe = PELib.NtExecutable.from(fs.readFileSync(exePath));
const res = PELib.NtExecutableResource.from(exe);
const ico = ResEdit.Data.IconFile.from(fs.readFileSync(icoPath));
// replace the icon group electron ships (id 1, lang 1033) with ours
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, 1, 1033, ico.icons.map(i => i.data));
// version strings
const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0] || ResEdit.Resource.VersionInfo.createEmpty();
vi.setFileVersion(1, 0, 0, 0, 1033); vi.setProductVersion(1, 0, 0, 0, 1033);
vi.setStringValues({ lang: 1033, codepage: 1200 }, {
  FileDescription: 'Jumping Jimothy', ProductName: 'Jumping Jimothy', CompanyName: 'Sky Wolf Studio',
  LegalCopyright: 'Copyright 2026 Sky Wolf Studio', InternalName: 'Jumping Jimothy', OriginalFilename: 'Jumping Jimothy.exe', FileVersion: '1.0.0', ProductVersion: '1.0.0' });
vi.outputToResourceEntries(res.entries);
res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
console.log('branded', exePath);
