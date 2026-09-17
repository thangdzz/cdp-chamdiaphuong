"use client";

import { useEffect, useState } from "react";
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
    title: "iPhone · Safari — cách chắc ăn nhất",
    // Đi đường Cài đặt máy chứ KHÔNG đi đường menu trong Safari: nút mở menu đó đổi hình theo đời
    // iOS (xưa là chữ "aA", nay là biểu tượng mấy gạch ngang cạnh địa chỉ, và thanh địa chỉ có máy
    // ở trên có máy ở dưới) — tả kiểu gì cũng có người không tìm thấy. Đường Cài đặt thì mọi đời
    // iOS đều giống nhau, và nó xoá luôn cái "đã từ chối" mà Safari nhớ cho riêng trang này.
    lines: [
      "Mở Cài đặt (Settings) trên iPhone → kéo tìm Safari",
      "Kéo xuống mục Cài đặt cho trang web → bấm Vị trí",
      "Chọn Hỏi (Ask) hoặc Cho phép (Allow)",
      "Quay lại Safari và tải lại trang",
    ],
    note: "Đang mở Safari thì nhanh hơn: bấm biểu tượng ≡ ngay bên trái địa chỉ web (thanh địa chỉ có thể ở trên hoặc dưới màn hình — máy iOS đời cũ hiện chữ aA) → Cài đặt trang web → Vị trí → Cho phép. Dòng Vị trí chỉ hiện ra sau khi bạn đã bấm nút 📍 trên bản đồ ít nhất một lần.",
  },
  {
    title: "iPhone · vẫn không lên chấm xanh",
    lines: [
      "Cài đặt → Quyền riêng tư & Bảo mật → Dịch vụ định vị: bật mục này",
      "Kéo xuống chọn Safari → Khi dùng ứng dụng",
      "Bật thêm Vị trí chính xác",
    ],
    note: "Tắt Vị trí chính xác thì vẫn có quyền nhưng sai số hàng trăm mét — lúc báo đèn web sẽ báo vị trí còn lệch.",
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

/** Trình duyệt tự khai đang để quyền vị trí ở mức nào — để khỏi phải đoán khi có người báo lỗi. */
function usePermissionState(open) {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!open) return;
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => setState(result.state))
      .catch(() => setState("không đọc được"));
  }, [open]);
  return state;
}

const PERMISSION_LABEL = {
  granted: "đã cho phép",
  denied: "đang chặn",
  prompt: "chưa hỏi lần nào",
};

export function LocationHelpSheet({ open, onClose, blocked = false }) {
  const permission = usePermissionState(open);
  return (
    <BottomSheet open={open} onClose={onClose} title="Cách bật vị trí">
      <h2 className="text-lg font-medium tracking-tight text-zinc-900">Cách bật vị trí</h2>
      {/* Mở lên vì vừa BỊ CHẶN thì phải nói ngay vì sao trình duyệt không hỏi — không có câu này,
          người dùng tưởng nút vị trí bị nối nhầm vào tờ hướng dẫn. Và nếu chính trình duyệt khai là
          ĐÃ CHO PHÉP thì lời nhắn phải khác hẳn: lỗi khi đó nằm ở Dịch vụ định vị của máy, bảo họ
          vào sửa quyền cho trang là chỉ sai chỗ. */}
      {blocked ? (
        <p className="mt-2 rounded-xl bg-[#fdf0e6] p-3 text-[13px] leading-5 text-[#8a3b28]">
          {permission === "granted" ? (
            <>
              Trang này <strong>đã được cho phép</strong> lấy vị trí, nhưng máy vẫn không trả vị trí
              về. Gần như chắc chắn là <strong>Dịch vụ định vị của máy đang tắt cho Safari</strong> —
              làm theo ô “vẫn không lên chấm xanh” bên dưới, không cần sửa gì ở ô đầu.
            </>
          ) : (
            <>
              Trình duyệt đang chặn vị trí cho trang này, nên nó <strong>sẽ không hỏi lại</strong> nữa
              dù bạn bấm bao nhiêu lần. Máy đã từng bấm “Không cho phép” cho trang này rồi — phải mở
              bằng tay một lần theo các bước dưới đây, sau đó thì không phải làm lại nữa.
            </>
          )}
        </p>
      ) : (
        <p className="mt-1 text-[13px] leading-5 text-zinc-500">
          Bật vị trí thì chấm xanh của bạn mới hiện trên bản đồ. Không bật vẫn chơi được — lúc báo đèn
          bạn tự ghim chỗ đứng trên bản đồ.
        </p>
      )}
      {/* Để NGAY ĐẦU chứ không nhét cuối trang: đây là câu trả lời của chính trình duyệt, ai báo lỗi
          chỉ cần đọc dòng này là biết máy đang ở mức nào, khỏi đoán. */}
      {permission && (
        <p className="mt-2 text-[11px] leading-4 text-zinc-400">
          Trình duyệt đang báo quyền vị trí: {PERMISSION_LABEL[permission] ?? permission}
        </p>
      )}

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
