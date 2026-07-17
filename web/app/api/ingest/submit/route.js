import { NextResponse } from "next/server";
import { ingestBatch } from "@/lib/ingestion/ingestBatch";

// Endpoint để phiên AI đặt lịch (claude.ai routine) gọi thẳng, thay vì phải ghi Redis/
// GitHub (2 việc đã bị chặn quyền ở môi trường cloud của nó — xem DECISIONS.md 2026-07-15).
// Web chạy trên Vercel gọi Upstash bình thường, nên chỉ cần routine gọi được TỚI đây là đủ.
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body phải là JSON hợp lệ" }, { status: 400 });
  }

  if (!Array.isArray(body?.records)) {
    return NextResponse.json({ error: "Thiếu mảng 'records'" }, { status: 400 });
  }

  const summary = await ingestBatch({
    sourceId: "cloud-agent-routine",
    sourceType: "manual_inbox",
    records: body.records,
  });

  return NextResponse.json({ ok: true, ...summary });
}
