// A3: một quy tắc chọn ảnh cho mọi nơi — ảnh menu không bao giờ làm ảnh đại diện (DESIGN §5, PM Q1 A3),
// chỗ không có ảnh phù hợp ra minh họa đúng nhóm với alt theo DESIGN.

import { test } from "node:test";
import assert from "node:assert/strict";
import { placeCoverMedia, placeMenuMedia } from "../lib/media.js";
import { notebookCover, placeCover } from "../lib/cover.js";
import {
  ILLUSTRATION_LABEL,
  ILLUSTRATION_LEGEND,
  PHOTO_ERROR_LABEL,
  placeIllustration,
  placePhoto,
  placePhotoAlt,
} from "../lib/placeImage.js";

const BLOB = "https://x.public.blob.vercel-storage.com/place-media";

test("ưu tiên ảnh có vai trò bìa, rồi ảnh thường đầu tiên theo thứ tự", () => {
  const place = {
    media: [
      { url: `${BLOB}/a.webp`, roles: ["general"], order: 0 },
      { url: `${BLOB}/b.webp`, roles: ["general", "cover"], order: 1, width: 1200, height: 800 },
    ],
  };
  assert.equal(placeCoverMedia(place).url, `${BLOB}/b.webp`);
  assert.deepEqual(placePhoto(place), { url: `${BLOB}/b.webp`, width: 1200, height: 800 });
  assert.equal(placeCoverMedia({ media: [{ url: `${BLOB}/a.webp`, roles: ["general"] }] }).url, `${BLOB}/a.webp`);
});

test("ảnh menu không bao giờ làm ảnh đại diện, kể cả khi đứng đầu hoặc là ảnh duy nhất", () => {
  const menuFirst = {
    media: [
      { url: `${BLOB}/menu.webp`, roles: ["menu"], order: 0 },
      { url: `${BLOB}/quan.webp`, roles: ["general"], order: 1 },
    ],
  };
  assert.equal(placeCoverMedia(menuFirst).url, `${BLOB}/quan.webp`);

  const menuOnly = { media: [{ url: `${BLOB}/menu.webp`, roles: ["menu"] }] };
  assert.equal(placeCoverMedia(menuOnly), null);
  assert.equal(placePhoto(menuOnly), null);
  assert.equal(placeCover(menuOnly), null); // ảnh xem trước chia sẻ → nơi gọi rơi về ảnh mặc định
  // Ảnh menu vẫn còn cho khối thực đơn.
  assert.equal(placeMenuMedia(menuOnly).length, 1);

  // Ảnh menu lỡ bị gắn cả vai trò bìa vẫn không được chọn.
  const menuMarkedCover = { media: [{ url: `${BLOB}/menu.webp`, roles: ["menu", "cover"] }] };
  assert.equal(placeCoverMedia(menuMarkedCover), null);
});

test("dữ liệu ảnh kiểu cũ (photos / coverPhoto / menuPhotos) đọc đúng, không lấy ảnh menu", () => {
  assert.equal(placeCoverMedia({ menuPhotos: [`${BLOB}/menu.jpg`] }), null);
  assert.equal(placeCoverMedia({ menuPhotos: [`${BLOB}/menu.jpg`], coverPhoto: `${BLOB}/menu.jpg` }), null);
  const legacy = { photos: [`${BLOB}/1.jpg`, `${BLOB}/2.jpg`], coverPhoto: `${BLOB}/2.jpg`, menuPhotos: [`${BLOB}/m.jpg`] };
  assert.deepEqual(placePhoto(legacy), { url: `${BLOB}/2.jpg`, width: null, height: null });
});

test("không có ảnh nào → null; dữ liệu hỏng không làm lỗi", () => {
  assert.equal(placePhoto({}), null);
  assert.equal(placePhoto(null), null);
  assert.equal(placePhoto({ media: [{ url: "" }, null, { roles: ["general"] }] }), null);
});

test("bìa Sổ bỏ qua chỗ chỉ có ảnh menu", () => {
  const items = [
    { place: { media: [{ url: `${BLOB}/menu.webp`, roles: ["menu"] }] } },
    { place: { media: [{ url: `${BLOB}/quan.webp`, roles: ["general"] }] } },
  ];
  assert.deepEqual(notebookCover({}, items), { mode: "single", photos: [`${BLOB}/quan.webp`] });
});

test("minh họa đúng nhóm, alt theo DESIGN §5; nhóm lạ / Chỗ quen gọi → khac.svg", () => {
  const cases = {
    an: ["/minh-hoa/an.svg", "Hình minh họa nhóm Ăn, chưa có ảnh thực tế"],
    choi: ["/minh-hoa/choi.svg", "Hình minh họa nhóm Chơi, chưa có ảnh thực tế"],
    ngu: ["/minh-hoa/ngu.svg", "Hình minh họa nhóm Ngủ, chưa có ảnh thực tế"],
    dilai: ["/minh-hoa/dilai.svg", "Hình minh họa nhóm Đi lại, chưa có ảnh thực tế"],
    moc: ["/minh-hoa/khac.svg", "Hình minh họa, chưa có ảnh thực tế"],
    "nhom-la": ["/minh-hoa/khac.svg", "Hình minh họa, chưa có ảnh thực tế"],
  };
  for (const [type, [src, alt]] of Object.entries(cases)) {
    assert.deepEqual(placeIllustration(type), { src, alt }, type);
  }
  assert.equal(placeIllustration(undefined).src, "/minh-hoa/khac.svg");
  // Mọi alt minh họa đều nói rõ đây là minh họa, không phải ảnh thật.
  for (const type of ["an", "choi", "ngu", "dilai", "moc"]) {
    assert.match(placeIllustration(type).alt, /^Hình minh họa.*chưa có ảnh thực tế$/);
  }
});

test("alt ảnh thật đứng riêng và câu chữ nhãn theo DESIGN §5", () => {
  assert.equal(placePhotoAlt("Phở Cô Lan"), "Ảnh Phở Cô Lan");
  assert.equal(placePhotoAlt("  "), "Ảnh địa điểm");
  assert.equal(ILLUSTRATION_LABEL, "Hình minh họa · Chưa có ảnh thực tế");
  assert.equal(ILLUSTRATION_LEGEND, "✎ = hình minh họa, chưa có ảnh thực tế");
  assert.equal(PHOTO_ERROR_LABEL, "Ảnh chưa tải được · đang hiện minh họa");
});
