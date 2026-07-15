// Chạy thủ công (hoặc qua cron) luồng quét dữ liệu hằng ngày.
//   node --env-file=.env.local scripts/run-daily-ingest.mjs
//   node --env-file=.env.local scripts/run-daily-ingest.mjs --include-stale-scan
//
// Không bao giờ ghi vào places:live — chỉ ghi vào review_queue (Redis) để duyệt ở /admin.

import { runDailyIngest } from "../lib/ingestion/runDailyIngest.js";

const includeStaleScan = process.argv.includes("--include-stale-scan");

const result = await runDailyIngest({ includeStaleScan });

console.log("Kết quả quét dữ liệu hằng ngày:");
console.log(JSON.stringify(result, null, 2));
