// Danh sách sự kiện ghi nhận hoạt động ẩn danh (NOTE-08 §8). File thuần — trình duyệt và server
// cùng đọc, để một tên sự kiện chỉ được định nghĩa ở MỘT chỗ.
//
// page_view gửi kèm đường dẫn (top nội dung); các sự kiện còn lại chỉ gửi SỐ LẦN trong một đợt gửi
// (sound_play có thể vài chục lần một tối — gom thành một con số, không ghi từng lần).

export const ANALYTICS_EVENTS = [
  "page_view",
  "game_open",
  "model_open",
  "sighting_start",
  "sighting_submit",
  "photo_upload",
  "display_name_change",
  "collection_unlock",
  "sound_play",
  // vNext — luồng Home → Search → Place → Save (SCOPE-vNext "OUTCOME"). Chỉ đếm số lần theo ngày,
  // không kèm nội dung gõ hay địa điểm nào: đủ để thấy khách rơi ở bước nào.
  "search_use", // gõ tìm (tối đa 1 lần mỗi lượt mở trang) hoặc gửi ô tìm ở trang chủ
  "category_pick", // chọn một nhóm Ăn/Chơi/Ngủ/Đi lại
  "place_open", // xem chi tiết một chỗ (trang /dia-diem, hoặc bung thẻ ở trang chủ cũ)
  "notebook_save", // lưu một chỗ vào Sổ thành công
];

// Không hoạt động quá chừng này thì lần quay lại tính là phiên (session) mới — cùng mốc phổ biến
// của các công cụ đo truy cập.
export const SESSION_GAP_MS = 30 * 60 * 1000;

// Chặn gói gửi bất thường (lỗi vòng lặp hay cố tình spam) trước khi tới Redis.
export const MAX_PATHS_PER_BATCH = 30;
export const MAX_COUNT_PER_EVENT = 100;

export const VISITOR_ID_PATTERN = /^v-[0-9a-f-]{36}$/;
