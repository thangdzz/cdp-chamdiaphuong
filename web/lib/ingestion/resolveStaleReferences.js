// Khi 1 mục "nghi trùng với mục KHÁC đang chờ duyệt" (duplicateOfCandidates trỏ vào 1
// review item khác, không phải chỗ đã công khai — xem match.js dòng ~125) mà mục được trỏ
// tới đó được xử lý xong trước (duyệt/từ chối), tham chiếu cũ sẽ hỏng: nếu mục kia được
// đăng công khai thì mã cũ không còn tồn tại nữa; nếu bị từ chối thì không có gì để trỏ tới.
// Gọi hàm này ngay sau khi 1 review item rời trạng thái "pending", để các mục còn lại
// không bị treo tham chiếu chết (xem STATUS.md 2026-08-19 — sự cố "Nhà Hàng Ba Chữ Lồng").
export function resolveStaleReferences(reviewQueue, resolvedId, resultingLiveId) {
  for (const item of reviewQueue) {
    if (!item.duplicateOfCandidates?.includes(resolvedId)) continue;
    item.duplicateOfCandidates = resultingLiveId
      ? item.duplicateOfCandidates.map((id) => (id === resolvedId ? resultingLiveId : id))
      : item.duplicateOfCandidates.filter((id) => id !== resolvedId);
  }
}
