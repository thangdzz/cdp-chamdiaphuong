"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "./GameProgress";
import { loadPlayerState } from "@/app/gameActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { computeProgress } from "@/lib/game/progress";

// Khối game đặt trong bài viết của sự kiện (NOTE-04 §3): một câu hỏi, một con số, hai nút —
// không bắt đọc hướng dẫn.
export function GameEntryCard({ event, href, teaser, live }) {
  const noun = event.copy.objectNoun;
  const [collection, setCollection] = useState({});

  useEffect(() => {
    const anonId = loadLocalContributor()?.anonId;
    if (!anonId) return;
    loadPlayerState({ slug: event.slug, anonId }).then((result) => {
      if (result.ok) setCollection(result.player.collection);
    });
  }, [event.slug]);

  const progress = useMemo(
    () => computeProgress({ catalog: teaser.catalog, collection, objectStats: teaser.objectStats }),
    [teaser, collection]
  );

  return (
    <section className="mt-4 overflow-hidden rounded-2xl bg-[#fbf3e6] p-4 shadow-sm ring-1 ring-[#f0e0c4]">
      <div className="flex items-start gap-3">
        <span className="text-4xl leading-none" aria-hidden="true">{event.copy.reportIcon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-medium tracking-tight text-zinc-900">{event.shortName}</h2>
          <p className="text-sm text-zinc-600">{event.copy.tagline}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm text-zinc-700">
          {progress.knownTotal > 0 ? (
            <>
              Bạn đã gặp{" "}
              <b className="text-xl font-medium text-zinc-900">
                {progress.metKnown} / {progress.knownTotal}
              </b>
            </>
          ) : (
            <>
              Bạn đã gặp <b className="text-xl font-medium text-zinc-900">{progress.metKnown}</b> {noun}
            </>
          )}
        </p>
        {progress.knownTotal > 0 && <ProgressBar ratio={progress.ratio} className="mt-2" />}
        {progress.communityKnown > 0 && (
          <p className="mt-2 text-[13px] text-zinc-500">
            Cộng đồng đã ghi nhận {progress.communityKnown} {noun} khác nhau
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          href={href}
          className="cdp-pressable flex min-h-12 items-center justify-center rounded-xl bg-white text-[15px] font-medium text-zinc-800 shadow-sm"
        >
          Xem bản đồ tối nay
        </Link>
        {live && (
          <Link
            href={`${href}?bao=1`}
            className="cdp-pressable flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-[#c8553d] text-[15px] font-medium text-white shadow-sm"
          >
            {event.copy.reportIcon} Tôi vừa thấy một {noun}
          </Link>
        )}
      </div>
    </section>
  );
}
