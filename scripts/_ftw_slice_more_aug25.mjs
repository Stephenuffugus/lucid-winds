/* FTW "More assets" drop (Aug 25 late): three win-door ending backgrounds +
   three Kesh-arc plates + the vendor desk. Three images carry real-world
   flags/seals; the Art 11 guardrail (no real flags, insignia, seals) crops
   them out here rather than trusting a dimming layer to hide them. */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const SRC = "/workspaces/lucid-winds/assets/ftw-more-staging/More assets ";
const FTW = "/workspaces/lucid-winds/satellites/flock-the-world";

/* file -> {out, w, crop:[x0,x1] in source px or null} */
const JOBS = [
  /* endings (820w webp like the existing bg_end_*) */
  { f: "file_00000000497481f799a2a60b26b278c2.png", out: "art/bg/bg_end_win_glove.webp", w: 820 },
  { f: "file_000000007ac081f79a3c796c7476071f.png", out: "art/bg/bg_end_win_fist.webp", w: 820 },
  /* hearing room: US flag + eagle seal live in the left 420px — cropped out */
  { f: "file_00000000c22c81f7a448cb6ca576c729.png", out: "art/bg/bg_end_win_econ.webp", w: 820, crop: [420, 1536] },
  /* event plates (820w, same as art/event/) */
  { f: "file_00000000416c81f78dde278ec306c4b2.png", out: "art/event/fd_ministry.webp", w: 820 },
  /* Kesh at the certificate printer: UN-like flags in the left 330px — cropped out */
  { f: "file_00000000d06081f79217310033dbc0d3.png", out: "art/event/fd_certificates.webp", w: 820, crop: [330, 1536] },
  { f: "file_0000000014a081f782fb5e4db29112e1.png", out: "art/event/fd_vendor_desk.webp", w: 820 },
  /* committee chamber: flags near both edges — cropped to the centre */
  { f: "file_0000000000fc81f782097e3f46a84112.png", out: "art/event/fd_committee.webp", w: 820, crop: [300, 1240] },
];

const br = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await br.newPage();
for (const job of JOBS) {
  const b64 = fs.readFileSync(path.join(SRC, job.f)).toString("base64");
  const url = await p.evaluate(async (b64, job) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const x0 = job.crop ? job.crop[0] : 0;
    const x1 = job.crop ? job.crop[1] : img.width;
    const sw = x1 - x0;
    const w = job.w, h = Math.round(img.height * (w / sw));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(img, x0, 0, sw, img.height, 0, 0, w, h);
    return c.toDataURL("image/webp", 0.85);
  }, b64, job);
  const buf = Buffer.from(url.split(",")[1], "base64");
  fs.writeFileSync(path.join(FTW, job.out), buf);
  console.log("wrote", job.out, (buf.length / 1024).toFixed(0) + "KB" + (job.crop ? "  (cropped " + job.crop.join("-") + ")" : ""));
}
await br.close();
console.log("DONE");
