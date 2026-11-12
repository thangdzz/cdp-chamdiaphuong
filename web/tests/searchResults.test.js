// A3: dữ liệu thẻ /tim có trường `photo` gọn (url + kích thước), không bao giờ là ảnh menu, không lộ thông tin
// nội bộ của ảnh (người tải, nguồn, vai trò, dung lượng).

import { test } from "node:test";
import assert from "node:assert/strict";
import { toResultItem } from "../lib/searchResults.js";

const BLOB = "https://x.public.blob.vercel-storage.com/place-media";
const base = { id: "an-99", name: "Phở Thử", type: "an", ward: "Minh Xuân" };

test("chỗ có ảnh thường: photo = url + kích thước, ưu tiên ảnh bìa", () => {
  const item = toResultItem({
    ...base,
    media: [
      { url: `${BLOB}/a.webp`, roles: ["general"], order: 0, width: 800, height: 600 },
      { url: `${BLOB}/b.webp`, roles: ["general", "cover"], order: 1, width: 1200, height: 900 },
    ],
  });
  assert.deepEqual(item.photo, { url: `${BLOB}/b.webp`, width: 1200, height: 900 });
});

test("ảnh không ghi kích thước: width/height = null (thẻ dùng khung cố định)", () => {
  const item = toResultItem({ ...base, photos: [`${BLOB}/cu.jpg`] });
  assert.deepEqual(item.photo, { url: `${BLOB}/cu.jpg`, width: null, height: null });
});

test("chỉ có ảnh menu hoặc chưa có ảnh: photo = null", () => {
  assert.equal(toResultItem({ ...base, media: [{ url: `${BLOB}/menu.webp`, roles: ["menu"] }] }).photo, null);
  assert.equal(toResultItem({ ...base, menuPhotos: [`${BLOB}/menu.jpg`] }).photo, null);
  assert.equal(toResultItem(base).photo, null);
});

test("photo chỉ có url/width/height — không gửi người tải, nguồn, vai trò, dung lượng", () => {
  const item = toResultItem({
    ...base,
    media: [
      {
        url: `${BLOB}/a.webp`,
        roles: ["general", "cover"],
        width: 800,
        height: 600,
        bytes: 200000,
        source: "user",
        uploadedBy: "anon-123",
        providerMeta: { downloadUrl: "https://example.com/x" },
      },
    ],
  });
  assert.deepEqual(Object.keys(item.photo).sort(), ["height", "url", "width"]);
  assert.equal(JSON.stringify(item).includes("anon-123"), false);
  assert.equal(JSON.stringify(item).includes("downloadUrl"), false);
});
