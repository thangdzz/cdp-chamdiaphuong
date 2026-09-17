"use client";

import { BottomSheet } from "./BottomSheet";

// Hướng dẫn bật quyền vị trí — tách hẳn khỏi bản đồ (chốt 2026-09-17).
//
// Trước đây đoạn "bấm aA → Cài đặt trang web → Vị trí…" nằm ngay trong hộp thông báo trên bản đồ:
// hộp cao bốn dòng, che mất nhãn tuyến rước và marker. Giờ bản đồ chỉ nói MỘT câu, ai cần mới mở
// sheet này.
//
// Sheet phải do trang cha dựng, KHÔNG dựng bên trong GameMap: khung bản đồ có
// `transform: translateZ(0)` (chống nháy canvas trên Safari) nên nó trở thành gốc toạ độ của mọi
// phần tử `position: fixed` bên trong — sheet sẽ bị nhốt trong khung bản đồ.

const STEPS = [
  {
    title: "iPhone · Safari",
    // Bước 1 nghe thừa nhưng KHÔNG thừa: Safari chỉ thêm dòng "Vị trí" vào menu Cài đặt trang web
    // sau khi trang đã hỏi xin vị trí ít nhất một lần. Chưa bấm nút thì mở aA sẽ không thấy gì để
    // chỉnh, và người dùng tưởng máy hỏng.
    lines: [
      "Bấm nút 📍 trên bản đồ một lần (để Safari biết trang này cần vị trí)",
      "Bấm chữ aA ở đầu thanh địa chỉ",
      "Chọn Cài đặt trang web → Vị trí → Cho phép",
      "Tải lại trang (Safari chỉ nhận quyền mới sau khi tải lại)",
    ],
    note: "Không thấy dòng Vị trí, hoặc đã cho phép mà vẫn không được? Vào Cài đặt máy → Quyền riêng tư & Bảo mật → Dịch vụ định vị: bật mục này, kéo xuống chọn Safari → Khi dùng ứng dụng, và bật cả Vị trí chính xác.",
  },
  {
    title: "Android · Chrome, Cốc Cốc, Samsung Internet",
    lines: [
      "Bấm hình ổ khoá 🔒 cạnh địa chỉ web",
      "Chọn Quyền (Permissions) → Vị trí → Cho phép",
      "Tải lại trang",
    ],
    note: "Vẫn không được? Kiểm tra Cài đặt máy → Vị trí đã bật chưa.",
  },
];

export function LocationHelpSheet({ open, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Cách bật vị trí">
      <h2 className="text-lg font-medium tracking-tight text-zinc-900">Cách bật vị trí</h2>
      <p className="mt-1 text-[13px] leading-5 text-zinc-500">
        Bật vị trí thì chấm xanh của bạn mới hiện trên bản đồ. Không bật vẫn chơi được — lúc báo đèn
        bạn tự ghim chỗ đứng trên bản đồ.
      </p>

      {STEPS.map((step) => (
        <div key={step.title} className="mt-4 rounded-xl bg-white p-3 ring-1 ring-black/5">
          <p className="text-[13px] font-medium text-zinc-900">{step.title}</p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[13px] leading-5 text-zinc-600">
            {step.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p className="mt-2 text-[12px] leading-4 text-zinc-400">{step.note}</p>
        </div>
      ))}

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 min-h-11 w-full cursor-pointer rounded-xl bg-[#c8553d] px-4 text-sm font-medium text-white"
      >
        Tải lại trang
      </button>
    </BottomSheet>
  );
}
