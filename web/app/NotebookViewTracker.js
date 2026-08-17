"use client";

import { useEffect, useRef } from "react";
import { logNotebookView } from "./notebookActions";

// Không render gì — chỉ báo "có người thật mở trang" (SPEC-chang-4.md §7). Đặt trong Client
// Component vì bot quét link tạo preview (Zalo, Facebook...) không chạy JavaScript, nên
// không vô tình bị tính là 1 lượt mở.
export function NotebookViewTracker({ slug }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    logNotebookView(slug);
  }, [slug]);

  return null;
}
