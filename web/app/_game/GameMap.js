"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_MAP_STYLE, loadGameMapStyle } from "@/lib/game/mapStyle";
import { venueBounds, venueFeatureCollection, venueLabelPoint } from "@/lib/game/venues";
import { badgeHtml } from "@/lib/game/badge";
import { ACCURACY_WARN_M } from "@/lib/game/riskLimits";

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

// Máy trạng thái định vị — MỘT nguồn sự thật duy nhất (chốt 2026-09-17).
//
// Trước đây nút vị trí tự giữ trạng thái bên trong control MapLibre, sinh ra ba lỗi người chơi
// nhìn thấy: (1) bấm trong lúc đang đo thì không có gì xảy ra, nút như chết; (2) tắt rồi mà lần đo
// cũ về sau vẫn dựng lại chấm xanh; (3) chấm xanh đứng nguyên ở lần đo ĐẦU TIÊN mãi mãi — nhìn như
// đang bật nhưng thật ra không còn theo dõi vị trí nữa. Giờ React giữ trạng thái, control chỉ còn
// là cái nút cộng một hàm đổi hình.
export const LOCATE = {
  IDLE: "idle", // chưa bấm lần nào
  REQUESTING: "requesting", // đang đo
  ACTIVE: "active", // đang theo dõi, có chấm xanh
  OFF: "off", // người chơi tự tắt
  DENIED: "denied", // trình duyệt chặn quyền
  UNAVAILABLE: "unavailable", // có quyền nhưng không bắt được tín hiệu
  INSECURE: "insecure", // trang mở bằng http
};

const LOCATE_TITLE = {
  [LOCATE.REQUESTING]: "Đang lấy vị trí — bấm để huỷ",
  [LOCATE.ACTIVE]: "Đang hiện vị trí của bạn — bấm để tắt",
  [LOCATE.DENIED]: "Trình duyệt đang chặn vị trí — bấm để thử lại",
};

// Nút "vị trí của tôi" tự viết thay GeolocateControl của MapLibre: control gốc KHOÁ VĨNH VIỄN nút
// (icon gạch chéo) sau một lần trình duyệt từ chối quyền — kể cả khi người dùng cho phép lại, phải
// tải lại trang mới bấm được. Nút này luôn bấm lại được. Dùng lại class CSS của MapLibre để giữ
// đúng icon và hiệu ứng nhấp nháy lúc đang đo.
function createLocateControl(onToggle) {
  let container = null;
  let button = null;

  return {
    // React gọi hàm này mỗi lần trạng thái đổi — nút không tự đoán mình đang bật hay tắt.
    setVisual(state) {
      if (!button) return;
      button.classList.toggle("maplibregl-ctrl-geolocate-waiting", state === LOCATE.REQUESTING);
      button.classList.toggle("maplibregl-ctrl-geolocate-active", state === LOCATE.ACTIVE);
      button.setAttribute("aria-pressed", state === LOCATE.ACTIVE ? "true" : "false");
      const title = LOCATE_TITLE[state] ?? "Vị trí của tôi";
      button.title = title;
      button.setAttribute("aria-label", title);
    },
    onAdd() {
      container = document.createElement("div");
      container.className = "maplibregl-ctrl maplibregl-ctrl-group";
      button = document.createElement("button");
      button.type = "button";
      button.className = "maplibregl-ctrl-geolocate";
      button.title = "Vị trí của tôi";
      button.setAttribute("aria-label", "Vị trí của tôi");
      const icon = document.createElement("span");
      icon.className = "maplibregl-ctrl-icon";
      icon.setAttribute("aria-hidden", "true");
      button.append(icon);
      button.addEventListener("click", onToggle);
      container.append(button);
      return container;
    },
    onRemove() {
      container?.remove();
      container = null;
      button = null;
    },
  };
}

// Một dòng trạng thái MỎNG ở mép trên bản đồ: tối đa hai dòng chữ, đóng được, và dải chứa nó đã
// chừa sẵn lề phải cho nút zoom/vị trí. Thay cho hộp thông báo cũ nằm giữa bản đồ — hộp đó cao
// bốn dòng và che mất nhãn tuyến rước lẫn marker (ảnh test trên iPhone 17/9).
function MapNotice({ tone = "info", children, onClose }) {
  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-full items-start gap-1 rounded-xl px-2.5 py-1.5 text-[12px] leading-[17px] shadow-sm ring-1 ${
        tone === "warn"
          ? "bg-[#fdf0e6] text-[#8a3b28] ring-[#c8553d]/25"
          : "bg-white/95 text-zinc-700 ring-black/5"
      }`}
    >
      <span className="line-clamp-2 min-w-0 flex-1">{children}</span>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={onClose}
        className="-mr-0.5 flex h-[17px] w-4 shrink-0 cursor-pointer items-center justify-center text-[11px] opacity-50"
      >
        ✕
      </button>
    </div>
  );
}

function HelpLink({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer font-medium underline underline-offset-2">
      Cách bật vị trí
    </button>
  );
}

// Trạng thái GPS nói bằng MỘT câu, và chỉ nói khi người chơi cần làm gì đó — đang chạy tốt thì im
// lặng. Hướng dẫn dài ("bấm aA → Cài đặt trang web → Vị trí") nằm trong sheet riêng sau nút
// "Cách bật vị trí", không nhồi lên bản đồ.
//
// Đây là trạng thái CỦA MÁY, tách hẳn khỏi trạng thái DỮ LIỆU GAME ("chưa có đèn rước"): hai thứ
// không liên quan nhau, gộp chung một hộp làm người chơi tưởng chưa tới giờ nên mới không có vị trí.
function locateNotice(locate, onHelp) {
  switch (locate.state) {
    case LOCATE.REQUESTING:
      return { tone: "info", body: <>📍 Đang lấy vị trí của bạn…</> };
    case LOCATE.ACTIVE:
      return locate.accuracy && locate.accuracy > ACCURACY_WARN_M
        ? {
            tone: "warn",
            body: <>📍 Vị trí còn lệch khoảng {Math.round(locate.accuracy)} m — ra chỗ thoáng hơn.</>,
          }
        : null;
    case LOCATE.DENIED:
      return {
        tone: "warn",
        body: (
          <>
            📍 Chưa có quyền vị trí{onHelp ? <> · <HelpLink onClick={() => onHelp("denied")} /></> : null}
          </>
        ),
      };
    case LOCATE.UNAVAILABLE:
      // Mã lỗi này vừa có nghĩa "chưa bắt được sóng" vừa có nghĩa "Dịch vụ định vị của máy đang
      // tắt" — không phân biệt được, nên nói cả hai đường.
      return {
        tone: "warn",
        body: (
          <>
            📍 Chưa bắt được vị trí — ra chỗ thoáng rồi bấm lại
            {onHelp ? <> · <HelpLink onClick={onHelp} /></> : null}
          </>
        ),
      };
    case LOCATE.INSECURE:
      return { tone: "warn", body: <>📍 Trang đang mở bằng http nên trình duyệt không cho lấy vị trí.</> };
    default:
      return null;
  }
}

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
  // Tuyến vẽ nét liền (chỗ đi bộ, đứng xem) hay NÉT ĐỨT (đường đoàn rước đi qua rồi lại đi tiếp)
  // do dữ liệu mùa quyết định. Phải tách hai lớp: `line-dasharray` không nhận biểu thức theo dữ liệu.
  const dashed = ["==", ["get", "dashed"], true];
  const routePaint = {
    "line-color": "#c8553d",
    "line-opacity": 0.8,
    "line-width": ["interpolate", ["linear"], ["zoom"], 13, 3, 17, 10],
  };
  map.addLayer(
    { id: "cdp-venue-route", type: "line", source: VENUE_SOURCE, filter: ["all", isRoute, ["!", dashed]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: routePaint },
    beforeId
  );
  map.addLayer(
    // Vạch dài — khoảng trống ngắn: đọc ra "đường đi", không lẫn với viền vùng. Đơn vị dash là LẦN
    // bề rộng nét nên vạch tự to nhỏ theo mức phóng, không phải chỉnh riêng.
    { id: "cdp-venue-route-dashed", type: "line", source: VENUE_SOURCE, filter: ["all", isRoute, dashed],
      layout: { "line-cap": "butt", "line-join": "round" },
      paint: { ...routePaint, "line-dasharray": [1.8, 1.1] } },
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
    <span data-role="bubble" class="relative flex h-11 w-11 items-center justify-center rounded-full ring-2 transition-transform duration-150 group-active:scale-95"></span>
    <span data-role="count" class="pointer-events-none absolute -right-2.5 -top-1.5 hidden min-w-[26px] rounded-full bg-[#c8553d] px-1.5 py-px text-center text-[11px] font-medium leading-4 text-white shadow ring-2 ring-white"></span>
    <span class="-mt-1 h-2.5 w-2.5 rotate-45 bg-white shadow-sm"></span>
  `;
  return el;
}

// Chữ ký nội dung marker: chỉ chạm DOM khi thứ hiển thị thật sự đổi. Trước đây mỗi lần parent
// render lại (đồng hồ 30 giây, làm mới dữ liệu) đều gỡ/gắn lại class → trình duyệt tính lại
// style cho mọi marker nằm trên canvas WebGL, góp phần gây nháy khi cuộn.
function markerSignature(marker) {
  return [marker.icon?.key, marker.tone, marker.faded ? 1 : 0, marker.label, marker.count ?? 1].join("|");
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
  // Marker tròn, bên trong là huy hiệu của mô hình (NOTE-07 §7); vòng ngoài báo mức tin cậy.
  bubble.innerHTML = badgeHtml(marker.icon, { size: 44, shape: "circle" });
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
  // Trạng thái DỮ LIỆU của game (ví dụ "chưa có đèn rước") — một dòng riêng, không dính gì tới GPS.
  statusNote = null,
  // Đang mở màn báo đèn: bản đồ nhường cảm biến cho màn đó (xem ghi chú ở effect bên dưới).
  pauseLocate = false,
  // Mở sheet hướng dẫn bật quyền vị trí. Sheet phải do trang cha dựng: khung bản đồ có
  // `transform: translateZ(0)` nên mọi thứ `position: fixed` bên trong đều bị cắt gọn trong khung.
  onLocationHelp = null,
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const libRef = useRef(null);
  const markerRefs = useRef(new Map());
  const onMarkerClickRef = useRef(onMarkerClick);
  const onPickRef = useRef(onPick);
  const onLocationHelpRef = useRef(onLocationHelp);
  const initialView = useRef({ center, zoom, venues, picker });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [locate, setLocate] = useState({ state: LOCATE.IDLE, accuracy: null });
  const [noteHidden, setNoteHidden] = useState(false);
  const [gpsNoticeHidden, setGpsNoticeHidden] = useState(false);
  const controlRef = useRef(null);
  const toggleRef = useRef(null);
  const watchRef = useRef(null);
  const dotRef = useRef(null);
  const stateRef = useRef(LOCATE.IDLE);
  // Người chơi VỪA CHỦ ĐỘNG bấm nút (khác với lúc bản đồ tự bật vì đã có quyền sẵn). Chỉ khi họ tự
  // bấm mà bị trình duyệt chặn thì mới bật hướng dẫn lên — tự bật mà chặn thì im lặng.
  const userAskedRef = useRef(false);
  // Mỗi lần bật/tắt tăng số đếm này. Lần đo cũ trả kết quả về sau khi người chơi đã tắt sẽ thấy số
  // không khớp và tự bỏ đi — đây chính là chỗ trước kia làm chấm xanh sống lại sau khi tắt.
  const seqRef = useRef(0);

  // Dừng HẲN: huỷ mọi lần đo đang bay, tắt watch, gỡ chấm xanh. Sau lời gọi này chắc chắn không
  // còn gì chạy nền (yêu cầu §6).
  const stopLocating = useCallback((next, accuracy = null) => {
    seqRef.current += 1;
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    dotRef.current?.remove();
    dotRef.current = null;
    stateRef.current = next;
    setLocate({ state: next, accuracy });
  }, []);

  const startLocating = useCallback(() => {
    if (!window.isSecureContext || !navigator.geolocation) {
      stopLocating(LOCATE.INSECURE);
      return;
    }
    seqRef.current += 1;
    const seq = seqRef.current;
    stateRef.current = LOCATE.REQUESTING;
    setLocate({ state: LOCATE.REQUESTING, accuracy: null });
    // `watchPosition` chứ không phải `getCurrentPosition`: bật rồi thì chấm xanh phải ĐI THEO người
    // chơi, không đứng yên ở lần đo đầu. `maximumAge: 0` — mỗi lần bật lại là một lần đo mới, không
    // nhận lại toạ độ cũ trình duyệt còn giữ.
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (seq !== seqRef.current) return; // người chơi đã tắt trong lúc chờ
        const map = mapRef.current;
        const maplibregl = libRef.current;
        if (!map || !maplibregl) return;
        const lngLat = [position.coords.longitude, position.coords.latitude];
        const accuracy = Number(position.coords.accuracy) || null;
        if (dotRef.current) {
          dotRef.current.setLngLat(lngLat);
        } else {
          const element = document.createElement("div");
          element.className =
            "h-4 w-4 rounded-full border-[3px] border-white bg-[#2f7de1] shadow-[0_0_0_6px_rgba(47,125,225,0.22)]";
          element.setAttribute("aria-label", "Vị trí của bạn");
          dotRef.current = new maplibregl.Marker({ element }).setLngLat(lngLat).addTo(map);
          // Chỉ kéo khung về ở lần đo ĐẦU; những lần cập nhật sau chỉ dời chấm, không giật chỗ
          // người chơi đang xem.
          map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 16), duration: 600 });
        }
        stateRef.current = LOCATE.ACTIVE;
        userAskedRef.current = false;
        // Giữ nguyên object cũ khi không có gì đổi: mỗi nhịp GPS mà render lại là bản đồ nháy.
        setLocate((prev) =>
          prev.state === LOCATE.ACTIVE && Math.round(prev.accuracy ?? -1) === Math.round(accuracy ?? -1)
            ? prev
            : { state: LOCATE.ACTIVE, accuracy }
        );
      },
      (error) => {
        if (seq !== seqRef.current) return;
        const denied = error.code === 1;
        stopLocating(denied ? LOCATE.DENIED : LOCATE.UNAVAILABLE);
        // Tự bấm mà bị chặn thì mở luôn hướng dẫn — không bắt bấm thêm một nhịp nữa. Vẫn thử đo
        // trước rồi mới mở (thay vì thấy "đã chặn" là chặn luôn): người vừa mở quyền trong Cài đặt
        // xong quay lại thì lần đo này chạy được, không ai phải đọc hướng dẫn thừa.
        if (denied && userAskedRef.current) onLocationHelpRef.current?.("denied");
        userAskedRef.current = false;
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [stopLocating]);

  // idle/off/denied/unavailable → bấm là đo lại; requesting/active → bấm là tắt. Không có trạng
  // thái nào mà bấm xong không có gì xảy ra.
  const toggleLocate = useCallback(() => {
    setGpsNoticeHidden(false); // vừa chủ động bấm thì được quyền nói lại vì sao chưa có vị trí
    const state = stateRef.current;
    if (state === LOCATE.ACTIVE || state === LOCATE.REQUESTING) {
      stopLocating(LOCATE.OFF);
      return;
    }
    userAskedRef.current = true;
    startLocating();
  }, [startLocating, stopLocating]);

  useEffect(() => {
    toggleRef.current = toggleLocate;
  }, [toggleLocate]);

  useEffect(() => {
    controlRef.current?.setVisual(locate.state);
  }, [locate.state]);

  // Rời trang giữa chừng: tắt watch, không để GPS chạy nền.
  useEffect(
    () => () => {
      seqRef.current += 1;
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    },
    []
  );

  // Trong lúc mở màn báo đèn thì bản đồ NGỪNG theo dõi vị trí (chốt 2026-09-17).
  //
  // Màn báo đèn tự đo một phép đo riêng, bắt buộc mới tinh (`maximumAge: 0`). Để hai bên cùng đòi
  // cảm biến một lúc thì phép đo mới phải xếp hàng sau luồng theo dõi đang chạy — đo thật trên trình
  // duyệt thấy nó chờ hết 15 giây rồi báo quá giờ, người chơi đứng nhìn "Đang đo vị trí…" mãi không
  // xong. Đóng màn báo thì bản đồ tự theo dõi lại đúng như cũ. Bản đồ lúc này nằm sau màn báo, không
  // ai nhìn, nên tắt đi cũng không mất gì mà còn đỡ tốn pin.
  const resumeRef = useRef(false);
  useEffect(() => {
    if (!showLocate) return undefined;
    // Hoãn một nhịp để không đổi state ngay trong thân effect.
    const timer = setTimeout(() => {
      if (pauseLocate) {
        if (stateRef.current === LOCATE.ACTIVE || stateRef.current === LOCATE.REQUESTING) {
          resumeRef.current = true;
          stopLocating(LOCATE.IDLE);
        }
      } else if (resumeRef.current) {
        resumeRef.current = false;
        startLocating();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pauseLocate, showLocate, startLocating, stopLocating]);

  // Ai ĐÃ cho phép từ trước thì hiện chấm xanh ngay, không bắt bấm lại (chốt 2026-09-17).
  //
  // Hỏi qua Permissions API nên KHÔNG bật hộp thoại xin quyền — chỉ người đã đồng ý rồi mới tự bật.
  // Người chưa từng được hỏi thì để họ bấm nút: bật hộp thoại xin quyền ngay lúc mở trang, khi người
  // ta chưa hiểu vì sao lại hỏi, rất dễ bị bấm "Không cho phép" — mà trên iPhone lựa chọn đó DÍNH
  // LUÔN cho cả trang, chặn nốt cả lúc báo đèn về sau. Lúc báo đèn thì ReportSheet tự hỏi, vì khi ấy
  // người chơi đã biết mình đang khai chỗ đứng.
  useEffect(() => {
    if (!showLocate || !ready) return undefined;
    let stopped = false;
    let status = null;

    const apply = (value) => {
      if (stopped) return;
      if (value === "granted" && stateRef.current === LOCATE.IDLE) startLocating();
      // Vào cài đặt gỡ quyền giữa chừng: tắt luôn, không để chấm xanh đứng lại nói dối.
      else if (value === "denied" && stateRef.current === LOCATE.ACTIVE) stopLocating(LOCATE.DENIED);
    };
    const onChange = () => apply(status?.state);

    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => {
        if (stopped) return;
        status = result;
        apply(result.state);
        // Bật quyền trong cài đặt rồi quay lại tab: Chrome bắn sự kiện này nên chấm xanh hiện luôn.
        // Safari chưa bắn — vẫn phải tải lại trang, nên sheet hướng dẫn có sẵn nút "Tải lại trang".
        result.addEventListener("change", onChange);
      })
      // Trình duyệt cũ không có Permissions API (hoặc không nhận tên "geolocation"): bỏ qua, nút
      // vị trí vẫn bấm được như thường.
      .catch(() => {});

    return () => {
      stopped = true;
      status?.removeEventListener("change", onChange);
      status = null;
    };
  }, [ready, showLocate, startLocating, stopLocating]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
    onPickRef.current = onPick;
    onLocationHelpRef.current = onLocationHelp;
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
          // Nút chỉ báo "người dùng vừa bấm"; toàn bộ quyết định nằm ở toggleLocate phía trên.
          controlRef.current = createLocateControl(() => toggleRef.current?.());
          map.addControl(controlRef.current, "top-right");
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
      controlRef.current = null;
      dotRef.current = null;
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

  const gameNote = Boolean(statusNote) && !noteHidden;
  const gpsNotice = gpsNoticeHidden ? null : locateNotice(locate, onLocationHelp);

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
      {/* Dải trạng thái ở MÉP TRÊN bản đồ: tối đa hai dòng độc lập (dữ liệu game / GPS), mỗi dòng
          cao nhất hai dòng chữ, chừa sẵn lề phải cho nút zoom và nút vị trí. `pointer-events-none` ở
          khung ngoài để phần trống hai bên vẫn kéo được bản đồ. Đóng rồi thì không hiện lại nữa
          trong suốt lần xem này — GameMap không bị dựng lại khi đổi tab nên state ở đây là đủ. */}
      {(gameNote || gpsNotice) && (
        <div className="pointer-events-none absolute left-2 right-14 top-2 z-20 flex flex-col items-start gap-1.5">
          {gameNote && (
            <MapNotice onClose={() => setNoteHidden(true)}>🌙 {statusNote}</MapNotice>
          )}
          {gpsNotice && (
            <MapNotice tone={gpsNotice.tone} onClose={() => setGpsNoticeHidden(true)}>
              {gpsNotice.body}
            </MapNotice>
          )}
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
