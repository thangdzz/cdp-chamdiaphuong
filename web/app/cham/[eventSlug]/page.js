import { notFound } from "next/navigation";
import { eventPhase, getGameEvent, publicEventConfig } from "@/lib/game/registry";
import { mergeCatalog } from "@/lib/game/catalog";
import { getGameSnapshot } from "@/lib/game/store";
import { GameExperience } from "@/app/_game/GameExperience";

// Marker "tối nay" và tiến độ cộng đồng đổi liên tục — đọc Redis mỗi lượt mở.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { eventSlug } = await params;
  const event = getGameEvent(eventSlug);
  if (!event) return { title: "Không tìm thấy — Chạm Địa Phương" };
  return {
    title: `${event.name} — Chạm Địa Phương`,
    description: `${event.copy.tagline} Báo ${event.copy.objectNoun} bạn vừa thấy, sưu tầm và cùng cộng đồng vẽ bản đồ tối nay.`,
  };
}

// Route chung cho mọi mùa game (NOTE-04 §28: không code riêng một trò Trung thu).
export default async function GameEventPage({ params, searchParams }) {
  const [{ eventSlug }, query] = await Promise.all([params, searchParams]);
  const event = getGameEvent(eventSlug);
  if (!event) notFound();

  let snapshot;
  try {
    snapshot = await getGameSnapshot(event);
  } catch (error) {
    // Redis tạm lỗi: vẫn mở được game với danh mục seed, chỉ thiếu dữ liệu cộng đồng.
    console.error("[game] snapshot failed", error);
    snapshot = {
      generatedAt: new Date().toISOString(),
      phase: eventPhase(event),
      catalog: mergeCatalog(event.objects, {}, event.id),
      objectStats: {},
      markers: [],
      tonight: {},
      firsts: {},
      quests: [],
      totalSightings: 0,
    };
  }

  return (
    <GameExperience
      event={publicEventConfig(event)}
      initialSnapshot={snapshot}
      openReportOnLoad={query?.bao === "1"}
    />
  );
}
