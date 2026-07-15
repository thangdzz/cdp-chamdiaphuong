import { NextResponse } from "next/server";
import { runDailyIngest } from "@/lib/ingestion/runDailyIngest";

// Endpoint để Vercel Cron gọi mỗi ngày (CHƯA bật lịch trong vercel.json — xem TODO ở
// docs). Bảo vệ tối giản bằng 1 secret dùng chung, đúng tinh thần "không làm auth phức
// tạp" đã yêu cầu — nâng cấp cùng lúc với Giai đoạn 5b nếu cần.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailyIngest({ includeStaleScan: false });
  return NextResponse.json(result);
}
