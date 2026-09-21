"use client";

import { useEffect } from "react";

// Khoá cuộn trang nền khi một lớp phủ toàn màn hình đang mở (bộ chọn địa điểm, form đề xuất).
//
// ĐẾM SỐ LỚP đang mở, thay vì để mỗi lớp tự nhớ giá trị cũ rồi tự trả lại. Cách cũ hỏng khi hai
// lớp CHỒNG NHAU và cùng đóng một lượt: bộ chọn mở trước nhớ "", form đề xuất mở sau nhớ đúng
// cái "hidden" mà bộ chọn vừa đặt. Lúc gửi đề xuất xong cả hai cùng đóng — bộ chọn trả lại ""
// trước, form trả lại "hidden" sau, và trang đứng im, cuộn không được nữa.
//
// Đếm thì chỉ lớp CUỐI CÙNG đóng mới mở khoá, không phụ thuộc thứ tự React gỡ component.
let openCount = 0;
let savedOverflow = "";

export function useScrollLock() {
  useEffect(() => {
    if (openCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openCount += 1;
    return () => {
      openCount -= 1;
      if (openCount === 0) document.body.style.overflow = savedOverflow;
    };
  }, []);
}

// Chỉ dùng cho test: đọc/đặt lại bộ đếm giữa các lần chạy.
export function __scrollLockState() {
  return { openCount, savedOverflow };
}
