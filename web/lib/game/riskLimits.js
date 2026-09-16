// Ngưỡng cảnh báo dùng CHUNG cho điện thoại và server (tách khỏi lib/game/risk.js vì file đó
// dùng node:crypto — không nạp được vào component chạy trên trình duyệt).
// Tất cả đều là TÍN HIỆU để nhìn, không phải bản án: anonId đổi theo trình duyệt nên không tín
// hiệu nào ở đây đủ chắc để chặn một người.

/** Trên mức này thì nhắc người chơi đo lại trước khi gửi (chốt 2026-09-16). */
export const ACCURACY_WARN_M = 50;

// Hai tầng đếm, vì không tầng nào một mình đủ chắc:
//  - dấu máy (mạng + đời trình duyệt): cùng một trình duyệt trên cùng một mạng mà đẻ ra danh tính
//    thứ 3 trong ngày thì gần như chắc là ẩn danh / xoá dữ liệu trình duyệt.
//  - mạng: đổi hẳn sang trình duyệt khác thì dấu máy đổi theo, chỉ còn IP là chung. Nhưng cả nhà
//    chung wifi cũng ra một IP, nên ngưỡng phải nới rộng và CHỈ để nhìn, không để kết luận.
export const MANY_IDS_PER_RISK_KEY = 2;
export const MANY_IDS_PER_IP = 4;

/** Nhiều hơn ngần này lượt báo trong 10 phút từ cùng một dấu máy/mạng là đáng nhìn. */
export const BURST_PER_RISK_KEY = 25;

/** Cùng một người báo lại cùng một mô hình quá số lần này trong một tối là đáng nhìn. */
export const REPEAT_SAME_MODEL = 4;

/** Nhãn tiếng Việt cho trang admin. */
export const RISK_FLAGS = {
  many_ids: "Nhiều danh tính từ cùng một trình duyệt",
  many_ids_ip: "Nhiều danh tính từ cùng một mạng",
  burst: "Báo dồn dập từ cùng một máy/mạng",
  repeat_model: "Báo lại cùng một mô hình nhiều lần",
  low_accuracy: "Vị trí đo được sai số lớn",
  manual_location: "Vị trí do người chơi ghim tay",
};
