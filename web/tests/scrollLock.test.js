// Hai lớp phủ chồng nhau (bộ chọn địa điểm → form đề xuất) đóng cùng một lượt thì trang nền
// phải cuộn lại được. Lỗi thật gặp 21/9: gửi đề xuất xong trang lộ trình đứng im.
//
// Không nạp app/useScrollLock.js vì nó dính React. Chép đúng phép đếm của nó, và giữ luôn cách
// làm CŨ bên cạnh để test chứng minh được vì sao phải đổi.

import { test } from "node:test";
import assert from "node:assert/strict";

function taoBody() {
  return { style: { overflow: "" } };
}

// Cách CŨ: mỗi lớp tự nhớ giá trị lúc mở, tự trả lại lúc đóng.
function khoaKieuCu(body) {
  const truoc = body.style.overflow;
  body.style.overflow = "hidden";
  return () => {
    body.style.overflow = truoc;
  };
}

// Cách MỚI: đếm số lớp đang mở, chỉ lớp cuối cùng mới mở khoá.
function taoKhoaDem() {
  let dangMo = 0;
  let daLuu = "";
  return (body) => {
    if (dangMo === 0) {
      daLuu = body.style.overflow;
      body.style.overflow = "hidden";
    }
    dangMo += 1;
    return () => {
      dangMo -= 1;
      if (dangMo === 0) body.style.overflow = daLuu;
    };
  };
}

function chay(khoa, thuTuGo) {
  const body = taoBody();
  const goBoChon = khoa(body); // bộ chọn mở trước
  const goForm = khoa(body); // form đề xuất mở chồng lên
  if (thuTuGo === "bộ chọn trước") {
    goBoChon();
    goForm();
  } else {
    goForm();
    goBoChon();
  }
  return body.style.overflow;
}

test("cách cũ làm trang đơ — đúng lỗi đã gặp", () => {
  // React gỡ component anh em theo thứ tự trong cây: bộ chọn nằm trên nên gỡ trước.
  assert.equal(chay(khoaKieuCu, "bộ chọn trước"), "hidden");
});

test("cách mới mở khoá được, gỡ theo thứ tự nào cũng vậy", () => {
  assert.equal(chay(taoKhoaDem(), "bộ chọn trước"), "");
  assert.equal(chay(taoKhoaDem(), "form trước"), "");
});

test("chỉ mở một lớp rồi đóng thì vẫn trả lại đúng", () => {
  const body = taoBody();
  const khoa = taoKhoaDem();
  khoa(body)();
  assert.equal(body.style.overflow, "");
});
