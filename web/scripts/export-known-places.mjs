// Xuất danh sách tên chỗ đang có (đang công khai) ra 1 file JSON gọn trong repo, để routine
// quét hằng ngày ĐỌC được (nó chỉ đọc được file trong repo, không đọc được Redis — xem
// DECISIONS.md 2026-07-15). Mục đích: routine biết chỗ nào đã có, tránh tìm lại mỗi ngày.
//
//   node --env-file=.env.local scripts/export-known-places.mjs
//
// Chạy xong nhớ commit + push file này lên GitHub thì routine ngày mai mới đọc được.

import fs from "fs/promises";
import path from "path";
import { getLivePlaces } from "../lib/redis.js";

const OUT_PATH = path.join(process.cwd(), "data", "known-places-snapshot.json");

const live = await getLivePlaces();
const snapshot = live
  .map((p) => ({ name: p.name, type: p.type }))
  .sort((a, b) => a.name.localeCompare(b.name, "vi"));

await fs.writeFile(OUT_PATH, JSON.stringify(snapshot, null, 2) + "\n", "utf-8");
console.log(`Đã ghi ${snapshot.length} chỗ vào ${OUT_PATH}`);
