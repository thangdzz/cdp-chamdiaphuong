import "server-only";

// Giữ kết quả một lượt ĐỌC Redis trong bộ nhớ máy chủ vài giây (PLAN-dem-18-9-redis §5 B1).
// Upstash tính TỪNG lệnh, nên thứ gì đọc lại ở MỌI lượt mở trang mà cả ngày mới đổi một lần
// (menu, nội dung trang tĩnh) không nên hỏi Redis mỗi lần: bao nhiêu người mở trang trong khoảng
// TTL cũng chỉ tốn một lệnh — trên mỗi máy chủ Vercel.
//
// Chỉ dùng cho luồng ĐỌC công khai. Luồng ghi (admin lưu) gọi `forget()` để chính máy chủ vừa lưu
// thấy ngay; máy chủ khác chờ hết TTL — chấp nhận được với dữ liệu kiểu cấu hình.
//
// Ghi chú: `lib/game/store.js` có bản sao riêng của cùng logic này (hàm `sharedRead`). Chưa gộp vì
// không đụng vào luồng game ngay sát đêm hội 18/9 — gộp sau, xem TASKS "Nợ kỹ thuật".

export function createSharedRead(ttlMs) {
  const entries = new Map();

  function read(key, load) {
    const now = Date.now();
    const hit = entries.get(key);
    if (hit && now - hit.at < ttlMs) return hit.promise;
    const promise = load();
    entries.set(key, { at: now, promise });
    // Lỗi thì bỏ khỏi bộ đệm ngay — lượt sau đọc lại, không giữ lỗi suốt TTL.
    promise.catch(() => {
      if (entries.get(key)?.promise === promise) entries.delete(key);
    });
    return promise;
  }

  read.forget = (key) => {
    if (key === undefined) entries.clear();
    else entries.delete(key);
  };

  return read;
}
