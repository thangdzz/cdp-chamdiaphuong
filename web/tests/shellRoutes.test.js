// Khung trang A2: thanh đáy hiện/ẩn đúng trang (không bao giờ chồng 2 thanh), mục đang mở đúng, nhóm lõi giữ
// thứ tự cố định dù Admin đổi ô "thứ tự".

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CORE_NAVIGATION_KEYS,
  FESTIVAL_ARCHIVE_LINK,
  isNavItemActive,
  secondaryNavigation,
  showsBottomNav,
  splitNavigation,
} from "../lib/shellRoutes.js";

test("thanh đáy hiện ở trang cấp đầu, màn phụ, Sổ/Lộ trình chi tiết (Q2)", () => {
  for (const path of [
    "/",
    "/tim",
    "/so",
    "/so/bnwr7tvn",
    "/lo-trinh",
    "/lo-trinh/6ucdn9t6",
    "/lo-trinh/xem/2qrh8qcca4",
    "/ghi-chu",
    "/gioi-thieu",
    "/le-hoi-thanh-tuyen",
    "/trung-thu-2026",
  ]) {
    assert.equal(showsBottomNav(path), true, path);
  }
});

test("thanh đáy ẩn ở trang đã có thanh bám đáy riêng và ở /admin", () => {
  for (const path of [
    "/dia-diem/an-01",
    "/dia-diem/an-01/",
    "/so/bnwr7tvn/sua",
    "/lo-trinh/6ucdn9t6/sua",
    "/admin",
    "/admin/navigation",
  ]) {
    assert.equal(showsBottomNav(path), false, path);
  }
});

test("đường dẫn lạ không làm mất thanh đáy", () => {
  assert.equal(showsBottomNav(undefined), true);
  assert.equal(showsBottomNav("/dia-diem"), true);
  assert.equal(showsBottomNav("/administrator"), true);
});

test("mục đang mở: Trang chủ chỉ ở '/', mục khác gồm cả trang con", () => {
  assert.equal(isNavItemActive("/", "/"), true);
  assert.equal(isNavItemActive("/", "/tim"), false);
  assert.equal(isNavItemActive("/tim", "/tim"), true);
  assert.equal(isNavItemActive("/so", "/so/bnwr7tvn"), true);
  assert.equal(isNavItemActive("/lo-trinh", "/lo-trinh/xem/abc"), true);
  assert.equal(isNavItemActive("/so", "/so-tay"), false);
  assert.equal(isNavItemActive("/so", undefined), false);
});

test("nhóm lõi theo thứ tự cố định, bỏ mục Admin tắt; nhóm phụ giữ thứ tự cấu hình", () => {
  const navigation = [
    { key: "notes", enabled: true },
    { key: "routes", enabled: true },
    { key: "about", enabled: true },
    { key: "notebooks", enabled: false },
    { key: "search", enabled: true },
    { key: "explore", enabled: true },
  ];
  const { core, secondary } = splitNavigation(navigation);
  assert.deepEqual(core.map((item) => item.key), ["explore", "search", "routes"]);
  assert.deepEqual(secondary.map((item) => item.key), ["notes", "about"]);
  assert.deepEqual(CORE_NAVIGATION_KEYS, ["explore", "search", "notebooks", "routes"]);
  assert.deepEqual(splitNavigation(undefined), { core: [], secondary: [] });
});

test("Menu: mục phụ theo cấu hình + Lễ hội cuối cùng, không có mục lõi", () => {
  const navigation = [
    { key: "explore", enabled: true },
    { key: "about", enabled: true },
    { key: "notes", enabled: true },
    { key: "search", enabled: true },
  ];
  assert.deepEqual(secondaryNavigation(navigation).map((item) => item.key), ["about", "notes", "festival"]);
  assert.equal(FESTIVAL_ARCHIVE_LINK.href, "/le-hoi-thanh-tuyen");
  assert.equal(isNavItemActive(FESTIVAL_ARCHIVE_LINK.href, "/le-hoi-thanh-tuyen"), true);
});
