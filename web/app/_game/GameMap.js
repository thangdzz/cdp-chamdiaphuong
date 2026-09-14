"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { FALLBACK_MAP_STYLE, GAME_MAP_STYLE_URL } from "@/lib/game/mapStyle";

// Primitive "Map Layer" phía giao diện: một bản đồ MapLibre + OSM nhận danh sách marker chung
// chung ({id, lat, lng, icon, ...}). Không biết gì về đèn Trung thu — mùa khác, lớp khác
// (heatmap, fog of war) gắn thêm vào đây sau (NOTE-04 §6).
//
// Hai chế độ: xem marker (mặc định) và `picker` — ghim cố định giữa bản đồ, người dùng kéo bản
// đồ để đặt vị trí (NOTE-04 §8 step 2, dùng khi không có GPS).

const MARKER_TONE = {
  normal: "ring-[#c8553d]",
  high: "ring-[#e0a526]",
  mystery: "ring-zinc-400",
};

function buildMarkerElement(marker) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "group relative flex cursor-pointer flex-col items-center focus:outline-none";
  el.innerHTML = `
    <span data-role="pulse" class="pointer-events-none absolute left-1/2 top-0 hidden h-11 w-11 -translate-x-1/2 rounded-full bg-[#e0a526]/50"></span>
    <span data-role="bubble" class="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[24px] leading-none shadow-md ring-2 transition-transform duration-150 group-active:scale-95"></span>
    <span class="-mt-1 h-2.5 w-2.5 rotate-45 bg-white shadow-sm"></span>
  `;
  return el;
}

function paintMarkerElement(el, marker) {
  const bubble = el.querySelector('[data-role="bubble"]');
  bubble.textContent = marker.icon;
  bubble.className = bubble.className.replace(/ring-\[[^\]]+\]|ring-zinc-400/g, "").trim();
  bubble.classList.add(...(MARKER_TONE[marker.tone] ?? MARKER_TONE.normal).split(" "));
  el.style.opacity = marker.faded ? "0.72" : "1";
  el.setAttribute("aria-label", marker.label);
}

export function GameMap({
  center,
  zoom = 14,
  markers = [],
  onMarkerClick,
  focus,
  picker = false,
  onPick,
  showLocate = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const libRef = useRef(null);
  const markerRefs = useRef(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);
  const onPickRef = useRef(onPick);
  const initialView = useRef({ center, zoom });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
    onPickRef.current = onPick;
  });

  useEffect(() => {
    let cancelled = false;
    let resizeObserver = null;
    const markerMap = markerRefs.current;

    import("maplibre-gl")
      .then((mod) => {
        if (cancelled || !containerRef.current) return;
        const maplibregl = mod.default ?? mod;
        libRef.current = maplibregl;
        const { center: c, zoom: z } = initialView.current;
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: GAME_MAP_STYLE_URL,
          center: [c.lng, c.lat],
          zoom: z,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
          cooperativeGestures: false,
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        if (showLocate) {
          map.addControl(
            new maplibregl.GeolocateControl({
              positionOptions: { enableHighAccuracy: true },
              trackUserLocation: false,
              showAccuracyCircle: false,
            }),
            "top-right"
          );
        }

        // Chỉ báo vị trí khi CHÍNH người dùng kéo/zoom — lần di chuyển do code (GPS vừa về) đã
        // được báo riêng, tránh ghi đè nguồn "gps" thành "map".
        let userMoving = false;
        const markUser = (event) => {
          if (event.originalEvent) userMoving = true;
        };
        map.on("dragstart", markUser);
        map.on("zoomstart", markUser);
        map.on("moveend", () => {
          if (!userMoving) return;
          userMoving = false;
          const { lat, lng } = map.getCenter();
          onPickRef.current?.({ lat, lng });
        });
        map.on("load", () => {
          if (cancelled) return;
          setReady(true);
          // Điện thoại: dòng ghi công OSM mở sẵn che mất góc bản đồ — thu về nút "i" (vẫn bấm
          // xem được). Màn rộng thì để nguyên.
          if (window.innerWidth < 640) {
            containerRef.current
              ?.querySelector(".maplibregl-ctrl-attrib")
              ?.classList.remove("maplibregl-compact-show");
          }
        });
        // Style chính không tải được (chưa có style nào) thì đổi sang tile OSM dự phòng một lần.
        // Lỗi lẻ tẻ của từng tile sau khi style đã chạy thì bỏ qua.
        let fellBack = false;
        map.on("error", () => {
          if (fellBack || map.isStyleLoaded()) return;
          fellBack = true;
          map.setStyle(FALLBACK_MAP_STYLE);
        });

        mapRef.current = map;
        // Map nằm trong tab có thể đang ẩn (display:none) — hiện ra thì phải đo lại kích thước.
        resizeObserver = new ResizeObserver(() => map.resize());
        resizeObserver.observe(containerRef.current);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      markerMap.forEach(({ marker }) => marker.remove());
      markerMap.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [showLocate]);

  // Đồng bộ marker: thêm mới (có hiệu ứng nếu `isNew`), sửa nội dung, gỡ cái đã hết hạn.
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = libRef.current;
    if (!ready || !map || !maplibregl) return;
    const current = markerRefs.current;
    const nextIds = new Set(markers.map((m) => m.id));

    for (const [id, entry] of current) {
      if (!nextIds.has(id)) {
        entry.marker.remove();
        current.delete(id);
      }
    }

    for (const data of markers) {
      let entry = current.get(data.id);
      if (!entry) {
        const el = buildMarkerElement(data);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onMarkerClickRef.current?.(data.id);
        });
        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([data.lng, data.lat])
          .addTo(map);
        entry = { marker, el };
        current.set(data.id, entry);
        if (data.isNew) {
          const bubble = el.querySelector('[data-role="bubble"]');
          bubble.classList.add("cdp-game-marker-enter");
          const pulse = el.querySelector('[data-role="pulse"]');
          pulse.classList.remove("hidden");
          pulse.classList.add("cdp-game-pulse");
          pulse.addEventListener("animationend", () => pulse.classList.add("hidden"), { once: true });
        }
      } else {
        entry.marker.setLngLat([data.lng, data.lat]);
      }
      paintMarkerElement(entry.el, data);
    }
  }, [markers, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !focus) return;
    map.easeTo({
      center: [focus.lng, focus.lat],
      zoom: Math.max(map.getZoom(), focus.zoom ?? 16),
      duration: picker ? 0 : 600,
    });
  }, [focus, ready, picker]);

  return (
    <div className={`relative overflow-hidden bg-[#efe9df] ${className}`}>
      {/* maplibre-gl.css ép .maplibregl-map về position:relative, nên KHÔNG dùng absolute inset-0
          ở đây (khung sẽ cao 0) — cho khung ăn đủ chiều cao khối cha. */}
      <div ref={containerRef} className="h-full w-full" />
      {picker && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
          <div className="flex flex-col items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8553d] text-lg text-white shadow-lg">
              📍
            </span>
            <span className="-mt-1 h-3 w-3 rotate-45 bg-[#c8553d]" />
          </div>
        </div>
      )}
      {!ready && !failed && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
          Đang tải bản đồ…
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-zinc-500">
          Chưa tải được bản đồ. Kiểm tra mạng rồi mở lại trang.
        </div>
      )}
    </div>
  );
}
