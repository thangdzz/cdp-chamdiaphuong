// Lấy hình hero cho huy hiệu sưu tập từ game-icons.net (NOTE-07 §4). Chạy tay khi thêm/đổi hình:
//
//   node web/scripts/game-icons/build.mjs
//
// Danh sách hình + thư mục tác giả nằm ở icons.json (tác giả tra theo repo github.com/game-icons/icons).
// Script tải gói @iconify-json/game-icons từ npm, chỉ lấy đúng các hình trong danh sách, giữ lại dữ
// liệu path rồi ghi web/lib/game/iconArt.js (sinh tự động, không sửa tay). Giấy phép CC BY 3.0: bắt
// buộc ghi công tác giả — trang game hiện dòng ghi công, admin hiện từng hình.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PACKAGE = "@iconify-json/game-icons";
const here = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(here, "../../lib/game/iconArt.js");
const wanted = JSON.parse(fs.readFileSync(path.join(here, "icons.json"), "utf8"));
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-game-icons-"));

const version = execFileSync("npm", ["view", PACKAGE, "version"], { encoding: "utf8" }).trim();
const tarball = execFileSync("npm", ["view", PACKAGE, "dist.tarball"], { encoding: "utf8" }).trim();
const archive = path.join(workDir, "icons.tgz");
fs.writeFileSync(archive, Buffer.from(await (await fetch(tarball)).arrayBuffer()));
execFileSync("tar", ["xzf", archive, "-C", workDir]);
const set = JSON.parse(fs.readFileSync(path.join(workDir, "package/icons.json"), "utf8"));

const titleCase = (slug) => slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
const art = {};
for (const [name, authorSlug] of Object.entries(wanted)) {
  const icon = set.icons[name];
  if (!icon) throw new Error(`Không có hình "${name}" trong ${PACKAGE}@${version}`);
  const size = icon.width ?? set.width ?? 512;
  if (size !== 512) throw new Error(`${name}: viewBox ${size} khác 512`);
  const paths = [...icon.body.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
  art[name] = {
    paths,
    author: titleCase(authorSlug),
    url: `https://game-icons.net/1x1/${authorSlug}/${name}.html`,
  };
}

fs.writeFileSync(
  outFile,
  `// SINH TỰ ĐỘNG bởi scripts/game-icons/build.mjs từ ${PACKAGE}@${version} — đừng sửa tay.\n` +
    `// Hình hero (viewBox 512) cho huy hiệu sưu tập (NOTE-07). Giấy phép CC BY 3.0: phải ghi công tác giả.\n\n` +
    `export const ICON_ART_LICENSE = { name: "CC BY 3.0", url: "https://creativecommons.org/licenses/by/3.0/", source: "game-icons.net" };\n\n` +
    `export const ICON_ART = ${JSON.stringify(art, null, 2)};\n`
);
fs.rmSync(workDir, { recursive: true, force: true });
console.log(`${Object.keys(art).length} hình → ${path.relative(process.cwd(), outFile)} (${fs.statSync(outFile).size} B)`);
