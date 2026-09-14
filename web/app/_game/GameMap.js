"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { FALLBACK_MAP_STYLE, loadGameMapStyle } from "@/lib/game/mapStyle";
import { venueBounds, venueFeatureCollection, venueLabelPoint } from "@/lib/game/venues";

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

const VENUE_SOURCE = "cdp-venues";

// Lớp điểm tổ chức (quảng trường, phố đi bộ) nằm DƯỚI nhãn tên đường của nền bản đồ và dưới
// marker mô hình — là bối cảnh để định hướng, không tranh chú ý với lượt báo.
function addVenueLayers(map, maplibregl, venues, { labels = true } = {}) {
  if (!venues?.length || map.getSource(VENUE_SOURCE)) return [];
  map.addSource(VENUE_SOURCE, { type: "geojson", data: venueFeatureCollection(venues) });
  const beforeId = map.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
  const isArea = ["==", ["get", "kind"], "area"];
  const isRoute = ["==", ["get", "kind"], "route"];
  map.addLayer(
    { id: "cdp-venue-area-fill", type: "fill", source: VENUE_SOURCE, filter: isArea,
      paint: { "fill-color": "#e0a526", "fill-opacity": 0.22 } },
    beforeId
  );
  map.addLayer(
    { id: "cdp-venue-area-outline", type: "line", source: VENUE_SOURCE, filter: isArea,
      paint: { "line-color": "#c8553d", "line-width": 1.5, "line-opacity": 0.65 } },
    beforeId
  );
  map.addLayer(
    { id: "cdp-venue-route-casing", type: "line", source: VENUE_SOURCE, filter: isRoute,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ffffff", "line-width": ["interpolate", ["linear"], ["zoom"], 13, 6, 17, 16] } },
    beforeId
  );
  map.addLayer(
    { id: "cdp-venue-route", type: "line", source: VENUE_SOURCE, filter: isRoute,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#c8553d",
        "line-opacity": 0.8,
        "line-width": ["interpolate", ["linear"], ["zoom"], 13, 3, 17, 10],
      } },
    beforeId
  );

  if (!labels) return [];
  // Nhãn là HTML (không dùng lớp chữ của style) để vẫn hiện khi phải dùng nền tile dự phòng
  // không có font. Không nhận chạm để không che marker mô hình.
  return venues
    .map((venue) => {
      const point = venueLabelPoint(venue);
      if (!point) return null;
      const el = document.createElement("div");
      el.className =
        "pointer-events-none flex max-w-[180px] items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium leading-4 text-[#8a3b28] shadow-sm ring-1 ring-[#c8553d]/30";
      const icon = document.createElement("span");
      icon.textContent = venue.icon ?? "📍";
      const label = document.createElement("span");
      label.className = "truncate";
      label.textContent = venue.shortName ?? venue.name;
      el.append(icon, label);
      el.setAttribute("title", venue.name);
      return new maplibregl.Marker({ element: el, anchor: venue.kind === "route" ? "bottom" : "center",
        offset: venue.kind === "route" ? [0, -8] : [0, 0] })
        .setLngLat([point.lng, point.lat])
        .addTo(map);
    })
    .filter(Boolean);
}

function buildMarkerElement(marker) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "group relative flex cursor-pointer flex-col items-center focus:outline-none";
  el.innerHTML = `
    <span data-role="pulse" class="pointer-events-none absolute left-1/2 top-0 hidden h-11 w-11 -translate-x-1/2 rounded-full bg-[#e0a526]/50"></span>
    <span data-role="bubble" class="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[24px] leading-none shadow-md ring-2 transition-transform duration-150 group-active:scale-95"></span>
    <span data-role="count" class="pointer-events-none absolute -right-2.5 -top-1.5 hidden min-w-[26px] rounded-full bg-[#c8553d] px-1.5 py-px text-center text-[11px] font-medium leading-4 text-white shadow ring-2 ring-white"></span>
    <span class="-mt-1 h-2.5 w-2.5 rotate-45 bg-white shadow-sm"></span>
  `;
  return el;
}

// Chữ ký nội dung marker: chỉ chạm DOM khi thứ hiển thị thật sự đổi. Trước đây mỗi lần parent
// render lại (đồng hồ 30 giây, làm mới dữ liệu) đều gỡ/gắn lại class → trình duyệt tính lại
// style cho mọi marker nằm trên canvas WebGL, góp phần gây nháy khi cuộn.
function markerSignature(marker) {
  return [marker.icon, marker.tone, marker.faded ? 1 : 0, marker.label, marker.count ?? 1].join("|");
}

function paintMarkerElement(el, marker) {
  const count = el.querySelector('[data-role="count"]');
  // Cùng mô hình được báo nhiều lượt quanh một chỗ: 🐇 ×4 (lượt, không phải người).
  if ((marker.count ?? 1) > 1) {
    count.textContent = `×${marker.count}`;
    count.classList.remove("hidden");
  } else {
    count.classList.add("hidden");
  }
  const bubble = el.querySelector('[data-role="bubble"]');
  bubble.textContent = marker.icon;
  bubble.className = bubble.className.replace(/ring-\[[^\]]+\]|ring-zinc-400/g, "").trim();
  bubble.classList.add(...(MARKER_TONE[marker.tone] ?? MARKER_TONE.normal).split(" "));
  el.style.opacity = marker.faded ? "0.72" : "1";
  el.setAttribute("aria-label", (marker.count ?? 1) > 1 ? `${marker.label}, ${marker.count} lượt` : marker.label);
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
  venues = null,
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const libRef = useRef(null);
  const markerRefs = useRef(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);
  const onPickRef = useRef(onPick);
  const initialView = useRef({ center, zoom, venues, picker });
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
    let venueLabels = [];

    Promise.all([import("maplibre-gl"), loadGameMapStyle().catch(() => FALLBACK_MAP_STYLE)])
      .then(([mod, style]) => {
        if (cancelled || !containerRef.current) return;
        const maplibregl = mod.default ?? mod;
        libRef.current = maplibregl;
        const { center: c, zoom: z, venues: initialVenues, picker: isPicker } = initialView.current;
        const map = new maplibregl.Map({
          container: containerRef.current,
          style,
          center: [c.lng, c.lat],
          zoom: z,
          // Tắt nghe `window.resize` của MapLibre: Safari iOS bắn resize liên tục khi thanh địa
          // chỉ co/giãn lúc cuộn trang; mỗi lần MapLibre gán lại kích thước canvas là WebGL xoá
          // trắng một khung hình => nháy. Kích thước do ResizeObserver bên dưới lo, có chặn trùng.
          trackResize: false,
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
          // Bản đồ chọn vị trí chỉ vẽ vùng/tuyến, không nhãn — nhãn sẽ che ghim ở giữa.
          venueLabels = addVenueLayers(map, maplibregl, initialVenues, { labels: !isPicker });
          // Bản đồ chính: căn khung vừa mọi điểm tổ chức (điện thoại hẹp, zoom cố định bị cắt mất).
          const bounds = !isPicker && venueBounds(initialVenues ?? []);
          if (bounds && containerRef.current?.clientWidth > 0) {
            map.fitBounds(bounds, { padding: { top: 56, bottom: 36, left: 36, right: 60 }, maxZoom: 16, duration: 0 });
          }
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
        // Chỉ resize khi khung ĐỔI CỠ THẬT (làm tròn px) và gộp vào một frame.
        let lastSize = "";
        let frame = 0;
        resizeObserver = new ResizeObserver((entries) => {
          const box = entries[0]?.contentRect;
          if (!box || box.width === 0 || box.height === 0) return;
          const size = `${Math.round(box.width)}x${Math.round(box.height)}`;
          if (size === lastSize) return;
          lastSize = size;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => map.resize());
        });
        resizeObserver.observe(containerRef.current);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      venueLabels.forEach((label) => label.remove());
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
        entry = { marker, el, signature: null, lng: data.lng, lat: data.lat };
        current.set(data.id, entry);
        if (data.isNew) {
          const bubble = el.querySelector('[data-role="bubble"]');
          bubble.classList.add("cdp-game-marker-enter");
          const pulse = el.querySelector('[data-role="pulse"]');
          pulse.classList.remove("hidden");
          pulse.classList.add("cdp-game-pulse");
          pulse.addEventListener("animationend", () => pulse.classList.add("hidden"), { once: true });
        }
      } else if (entry.lng !== data.lng || entry.lat !== data.lat) {
        entry.marker.setLngLat([data.lng, data.lat]);
        entry.lng = data.lng;
        entry.lat = data.lat;
      }
      const signature = markerSignature(data);
      if (entry.signature !== signature) {
        paintMarkerElement(entry.el, data);
        entry.signature = signature;
      }
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
    // Lớp compositing riêng (translateZ + isolate): Safari hay nháy khi canvas WebGL nằm trong
    // khối bo góc + overflow:hidden cuộn dưới header sticky có backdrop-blur.
    <div className={`relative isolate overflow-hidden bg-[#f5f3ef] [transform:translateZ(0)] ${className}`}>
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
