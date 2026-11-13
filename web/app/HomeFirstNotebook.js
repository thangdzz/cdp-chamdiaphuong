"use client";

import { useEffect, useState } from "react";
import { getMyNotebooks } from "./notebookActions";
import { loadLocalContributor } from "./ContributionPanel";

// Thẻ “Bắt đầu Sổ đầu tiên” cho người mới ở Trang chủ (A4-c, DESIGN §7, SPEC-A4 §3.2).
//
// Người mới = thiết bị CHƯA CÓ SỔ NÀO (PM chốt Q3 = A):
//   - không có mã ẩn danh trong máy → hiện, không gọi mạng;
//   - có mã → đọc danh sách Sổ bằng hàm đọc sẵn có (getMyNotebooks, trang /so cũng dùng), 0 Sổ → hiện;
//   - có Sổ → ẩn (đợt A chưa có khối “Sổ gần đây”; họ dùng thanh đáy “Sổ”);
//   - đang tải hoặc lỗi mạng → ẩn, để không nói sai với người đã có Sổ.
// Không ghi mã ẩn danh ra log. Câu cuối khớp quy tắc cố định Sổ/thiết bị (DECISIONS 2026-11-12): không hứa đồng bộ.
//
// Chống nhảy bố cục: máy chủ dựng sẵn khung thẻ ở trạng thái VÔ HÌNH (visibility: hidden — mắt và trình đọc màn
// hình đều không thấy, đúng Q3 “đang tải → ẩn”) để giữ chỗ. Người mới: chỉ đổi sang hiện, bố cục đứng yên. Có Sổ hoặc
// lỗi: gỡ khung (phần bên dưới dịch lên một lần). Đo 13/11: thẻ chèn sau làm footer nhảy, CLS 0,067 ở 320×568.
export function HomeFirstNotebook() {
  const [status, setStatus] = useState("pending"); // "pending" | "show" | "hide"

  useEffect(() => {
    let cancelled = false;
    const anonId = loadLocalContributor()?.anonId;
    const isNewcomer = anonId
      ? getMyNotebooks(anonId).then((notebooks) => Array.isArray(notebooks) && notebooks.length === 0)
      : Promise.resolve(true);
    isNewcomer
      .then((value) => {
        if (!cancelled) setStatus(value ? "show" : "hide");
      })
      .catch(() => {
        if (!cancelled) setStatus("hide"); // lỗi mạng / máy chủ: ẩn
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "hide") return null;
  const pending = status === "pending";

  return (
    <section
      id={pending ? undefined : "home-first-notebook"}
      aria-labelledby={pending ? undefined : "home-first-notebook-title"}
      aria-hidden={pending || undefined}
      data-first-notebook={status}
      className={`mt-6 rounded-xl border border-line bg-surface p-4 shadow-card ${pending ? "invisible" : ""}`}
    >
      <h2 id={pending ? undefined : "home-first-notebook-title"} className="text-base font-semibold text-ink">
        Bắt đầu Sổ đầu tiên
      </h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.9375rem] leading-relaxed text-ink-2 marker:text-ink-2">
        <li>Tìm hoặc chọn một nhóm ở trên</li>
        <li>
          Mở chỗ bạn thích, bấm <strong className="font-semibold text-ink">Lưu vào Sổ</strong>
        </li>
        <li>Ghép các chỗ đã lưu thành Lộ trình</li>
      </ol>
      <p className="mt-3 text-[0.8125rem] leading-snug text-ink-2">Không cần đăng nhập. Sổ gắn với thiết bị này.</p>
    </section>
  );
}
