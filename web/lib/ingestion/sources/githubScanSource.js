// Đọc kết quả quét web mới nhất do phiên AI (đặt lịch trên claude.ai) commit lên GitHub.
//
// Vì sao cần adapter riêng thay vì đọc file cục bộ (inboxSource): phiên AI chạy trên cloud
// của Anthropic bị chặn gọi thẳng ra Upstash (chính sách mạng của môi trường đó), nên nó
// chỉ tìm dữ liệu rồi commit file JSON lên GitHub — nơi nó gọi được. Vercel (nơi web đang
// chạy, vẫn gọi Upstash bình thường) đọc file này qua HTTP lúc chạy (không phải lúc build),
// nên luôn thấy bản mới nhất mà không cần deploy lại.
const RAW_URL =
  "https://raw.githubusercontent.com/thangdzz/cdp-chamdiaphuong/main/web/data/ingestion-inbox/web-scan-latest.json";

export const githubScanSource = {
  id: "github_scan_latest",
  type: "manual_inbox", // cùng mức tin cậy với inbox thủ công cho tới khi có nguồn khác

  async fetch() {
    let response;
    try {
      response = await fetch(RAW_URL, { cache: "no-store" });
    } catch (err) {
      return [{ sourceId: "github_scan_latest", sourceType: "manual_inbox", records: [], error: String(err) }];
    }

    if (!response.ok) {
      // 404 = chưa có phiên nào commit file lần nào — không phải lỗi, chỉ chưa có dữ liệu.
      if (response.status === 404) return [];
      return [
        {
          sourceId: "github_scan_latest",
          sourceType: "manual_inbox",
          records: [],
          error: `HTTP ${response.status}`,
        },
      ];
    }

    let records;
    try {
      records = await response.json();
    } catch (err) {
      return [
        {
          sourceId: "github_scan_latest",
          sourceType: "manual_inbox",
          records: [],
          error: `JSON không hợp lệ: ${err.message}`,
        },
      ];
    }

    if (!Array.isArray(records)) return [];

    return [{ sourceId: "github_scan_latest", sourceType: "manual_inbox", records }];
  },
};
