// MOCK adapter — nguồn "công khai" thật sự CHƯA được nối (không có API tìm kiếm/Google
// Places đã duyệt ngân sách). Adapter này đọc các file JSON trong data/ingestion-inbox/,
// mô phỏng đúng hình dạng dữ liệu mà một scraper/API thật sẽ trả về mỗi ngày.
//
// Thay bằng nguồn thật sau này: viết adapter khác cùng interface fetch() -> { sourceId,
// sourceType, records }[], rồi thêm vào sources/index.js — không cần đổi gì ở
// normalize/match/store.

import fs from "fs/promises";
import path from "path";

const INBOX_DIR = path.join(process.cwd(), "data", "ingestion-inbox");

export const inboxSource = {
  id: "manual_inbox",
  type: "manual_inbox",

  async fetch() {
    let files;
    try {
      files = await fs.readdir(INBOX_DIR);
    } catch {
      return [];
    }

    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const batches = [];

    for (const file of jsonFiles) {
      const fullPath = path.join(INBOX_DIR, file);
      try {
        const raw = await fs.readFile(fullPath, "utf-8");
        const records = JSON.parse(raw);
        if (!Array.isArray(records)) continue;
        batches.push({
          sourceId: `manual_inbox:${file}`,
          sourceType: "manual_inbox",
          records,
        });
      } catch (err) {
        // Không để 1 file lỗi làm hỏng cả lần chạy — ghi nhận và bỏ qua.
        batches.push({
          sourceId: `manual_inbox:${file}`,
          sourceType: "manual_inbox",
          records: [],
          error: String(err.message ?? err),
        });
      }
    }

    return batches;
  },
};
