"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkRouteOwnership } from "./routeActions";
import { checkNotebookOwnership } from "./notebookActions";
import { loadLocalContributor } from "./ContributionPanel";

const TARGETS = {
  route: { check: checkRouteOwnership, href: "/lo-trinh", label: "Lộ trình của tôi" },
  notebook: { check: checkNotebookOwnership, href: "/so", label: "Sổ của tôi" },
};

// Link quay về danh sách của chính mình, đầu trang xem lộ trình/sổ. Chỉ chủ mới thấy: trang xem
// cũng mở được từ link người khác gửi, mà "← Sổ của tôi" dẫn người nhận về danh sách (có thể
// trống) của họ thì dễ hiểu nhầm. Đợi biết chắc là chủ mới hiện, cùng cách *OwnerActions làm.
export function OwnerBackLink({ kind, slug }) {
  const [isOwner, setIsOwner] = useState(false);
  const target = TARGETS[kind];

  useEffect(() => {
    const local = loadLocalContributor();
    target.check({ anonId: local?.anonId, slug }).then((res) => setIsOwner(res.isOwner));
  }, [target, slug]);

  if (!isOwner) return null;

  return (
    <Link href={target.href} className="mb-3 inline-block text-sm text-zinc-400 underline">
      ← {target.label}
    </Link>
  );
}
