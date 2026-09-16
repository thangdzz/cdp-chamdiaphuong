// Cấu hình mùa game "Săn đèn Thành Tuyên 2026" (NOTE-04, NOTE-05). Đây là DỮ LIỆU, không phải
// code riêng cho Trung thu: mùa khác (chợ phiên, mùa hoa...) chỉ cần thêm một file cùng khuôn rồi
// đăng ký trong lib/game/registry.js. Không có `if model == ...` ở bất kỳ đâu — icon, bộ sưu tập,
// âm thanh đều sinh từ các khoá/tag khai báo dưới đây (NOTE-05 §22).

export const THANH_TUYEN_2026 = {
  id: "thanh-tuyen-2026",
  // Đường dẫn công khai: chamdiaphuong.io.vn/san-den-thanh-tuyen-2026 (DECISIONS 2026-09-16).
  // KHÁC `id` — khoá Redis dựng từ `id`, nên đổi slug không đụng dữ liệu.
  slug: "san-den-thanh-tuyen-2026",
  name: "Săn đèn Thành Tuyên 2026",
  shortName: "Săn đèn Thành Tuyên",
  year: 2026,
  // Trang game mở từ đây; trước `gameLiveAt` là pre-game (chơi thử, không nhận lượt báo thật).
  startAt: "2026-09-10T00:00:00+07:00",
  // Tối thứ Sáu 18/9 bắt đầu rước đèn (NOTE-05 §1, §4). Admin đổi được ở /admin/game, không cần deploy.
  gameLiveAt: "2026-09-18T19:00:00+07:00",
  // Hết mùa thì game chỉ còn xem lại, dữ liệu giữ nguyên (NOTE-03 §2.8).
  endAt: "2026-09-30T23:59:59+07:00",
  postHref: "/le-hoi-thanh-tuyen",
  postTitle: "Lễ hội Thành Tuyên 2026",

  copy: {
    objectNoun: "mô hình",
    tagline: "Tối nay bạn gặp được bao nhiêu mô hình?",
    collectionTitle: "Bộ sưu tập Thành Tuyên 2026",
    reportCta: "Bạn vừa thấy mô hình nào?",
    reportIcon: "🏮",
    preGameBanner: "Game chính thức bắt đầu tối thứ Sáu 18/9",
    preGameMap: "Chưa có đèn rước — bản đồ mở tối 18/9",
    preGameDismiss: "Được rồi, thứ Sáu gặp lại",
    preGameHint: "Giờ bạn vẫn xem được bộ sưu tập và bấm báo thử — nhưng chưa ghi nhận thật đâu 😉",
    liveBanner: "Đèn bắt đầu rước rồi! Ra phố Chạm mô hình đầu tiên nào",
    // Lần thử 1, 2, 3 (từ lần 4 lặp câu cuối) — NOTE-05 §2.
    preGameTrolls: [
      { emoji: "🤣", text: "Bạn điêu thật, hôm nay làm gì có mô hình nào rước mà bạn bảo nhìn thấy 🤣" },
      { emoji: "🤔", text: "Thật không bạn để tôi còn đi đồn? 🤔" },
      { emoji: "😆", text: "Tôi xin lỗi bạn, thứ 6 tôi mới làm việc cơ 😆" },
    ],
    // Nút của thẻ game nổi trang chủ (NOTE-08 §1).
    bannerCta: "Vào chơi ngay",
  },

  // Huy hiệu đại diện game ở thẻ nổi trang chủ (NOTE-08 §1): lấy con GIỮA danh sách còn hiển thị
  // (hiện là Rồng vàng). Id bị ẩn/ghép thì tự bỏ qua.
  bannerObjectIds: [
    "tt26-hai-ba-trung",
    "tt26-chu-cuoi",
    "tt26-rong-vang",
    "tt26-trong-dong-dong-son",
    "tt26-ket-noi-khong-gian-vnpt",
  ],

  // Nguồn của con số 45. Mẫu số bộ sưu tập không đọc từ đây mà đếm số slot trong `objects` bên dưới
  // (34 mô hình có tên + 11 slot chưa xác định = 45, NOTE-06 §1) — thêm/bớt slot là đổi mẫu số.
  catalogNote: {
    text: "Đêm hội 20/9 dự kiến có 45 mô hình diễn diễu.",
    source: "Kế hoạch 246/KH-UBND tỉnh Tuyên Quang",
    updatedAt: "2026-06-27",
  },

  map: {
    // Giữa Quảng trường Nguyễn Tất Thành và tuyến phố đi bộ — mở ra thấy cả hai điểm tổ chức.
    center: { lat: 21.8196, lng: 105.2125 },
    zoom: 15,
    // Tỉnh Tuyên Quang (sau sáp nhập) + biên. Lượt báo ngoài khung này bị từ chối.
    bounds: [
      [104.2, 21.4],
      [106.0, 23.5],
    ],
  },

  // Điểm tổ chức chính — lớp nền cố định trên bản đồ, không phải object để sưu tầm. Toạ độ lấy
  // từ OpenStreetMap ngày 15/9/2026 (không tự vẽ tay); `source` ghi rõ để đối chiếu khi OSM đổi.
  venues: [
    {
      id: "quang-truong-nguyen-tat-thanh",
      kind: "area",
      name: "Quảng trường Nguyễn Tất Thành",
      shortName: "Quảng trường Nguyễn Tất Thành",
      icon: "🏮",
      source: "OSM way 772332585",
      coordinates: [
        [105.2163434, 21.8210839], [105.2161395, 21.8209967], [105.2152705, 21.8193583],
        [105.2153134, 21.819174], [105.2157056, 21.818935], [105.2163154, 21.8198189],
        [105.2175257, 21.8190159], [105.2176362, 21.8191441], [105.2182907, 21.8186685],
        [105.2187628, 21.8192188], [105.2187735, 21.819413], [105.2177435, 21.82018],
        [105.2166223, 21.8209967], [105.2163434, 21.8210839],
      ],
    },
    {
      id: "pho-di-bo-nguyen-van-linh",
      kind: "route",
      name: "Tuyến phố đi bộ — đường Nguyễn Văn Linh (Hà Huy Tập → Đinh Tiên Hoàng, khu hồ Tân Quang)",
      shortName: "Phố đi bộ",
      icon: "🚶",
      // Đoạn đường Nguyễn Văn Linh (OSM way 309132178) giữa nút giao Hà Huy Tập (node 3144504132)
      // và nút giao Đinh Tiên Hoàng (node 10562260409).
      source: "OSM way 309132178, node 3144504132 → 10562260409",
      coordinates: [
        [105.2067636, 21.8201602], [105.2073137, 21.8198625], [105.2079478, 21.8195309],
        [105.2083073, 21.8193268], [105.2084682, 21.8191973], [105.2085862, 21.819018],
        [105.2087579, 21.8187192], [105.2090836, 21.8182784],
      ],
    },
    {
      id: "tuyen-ruoc-den",
      kind: "route",
      // Chủ dự án tả ngày 16/9/2026: đoàn mô hình đi vòng này và lặp lại liên tục cả tối.
      name: "Tuyến rước đèn — Ngã 8 → Bình Thuận → Đại lộ Tân Trào → Phan Thiết → Quang Trung → Ngã 8",
      shortName: "Tuyến rước đèn",
      icon: "🏮",
      // Nét đứt: đây là đường đoàn ĐI QUA rồi lại đi tiếp, khác tuyến phố đi bộ (chỗ đứng xem).
      dashed: true,
      // Bám đúng tim đường theo OpenStreetMap ngày 16/9/2026 (không vẽ tay), vòng khép kín ~3,3 km.
      // ĐỪNG rút gọn bớt điểm cho "gọn file": bùng binh Ngã 8 bán kính chỉ ~13m, bỏ vài điểm là
      // cung tròn thành đường thẳng cắt ngang bùng binh (đã vấp 16/9). Sai số đang giữ dưới 0,4m.
      // ĐI ĐÚNG CHIỀU XE CHẠY (chủ dự án nhắc 16/9): Tân Trào là đường đôi một chiều, nên hết
      // Bình Thuận phải vòng qua xuyến Di tích thành nhà Mạc mới sang được làn đối diện; cuối
      // Tân Trào cũng vòng một xuyến nữa. Hết Tân Trào đường đổi tên thành 17/8 khoảng 130m rồi
      // mới tới ngã rẽ Phan Thiết — đoàn đi thẳng qua đoạn đó.
      // Mọi bùng binh chạy NGƯỢC kim đồng hồ (xe VN đi bên phải). Lưu ý: vòng xuyến Ngã 8 trong
      // OpenStreetMap (way 1431622682) bị vẽ ngược chiều — dựng tuyến phải theo luật, đừng tin
      // chiều vẽ trong dữ liệu (đã vấp 16/9). Vòng bắt đầu/kết thúc ngay tại lối ra Bình Thuận
      // trên xuyến để tuyến chỉ chạy qua xuyến đúng một lần, không vẽ chồng lên chính nó.
      source:
        "OSM: Bình Thuận (741065202, 741065205) · xuyến 309132108 · Tân Trào chiều TB (896940866) · " +
        "xuyến 772332570 · 17/8 (914987540, 772332569) · Phan Thiết (309132172) · " +
        "Quang Trung (741065203, 1425591299); nút Ngã 8 6937972553",
      coordinates: [
        [105.2128875, 21.8152726], [105.2129444, 21.8153984], [105.2129538, 21.8154379],
        [105.2129389, 21.8155929], [105.2132984, 21.8162701], [105.2139200, 21.8174087],
        [105.2145991, 21.8186282], [105.2148663, 21.8190927], [105.2149112, 21.8190745],
        [105.2149595, 21.8190673], [105.2150083, 21.8190714], [105.2150544, 21.8190865],
        [105.2150950, 21.8191119], [105.2151276, 21.8191458], [105.2151529, 21.8191934],
        [105.2151622, 21.8192458], [105.2151548, 21.8192985], [105.2151313, 21.8193470],
        [105.2150938, 21.8193870], [105.2150362, 21.8194188], [105.2149705, 21.8194307],
        [105.2149313, 21.8194278], [105.2148935, 21.8194177], [105.2148586, 21.8194008],
        [105.2119345, 21.8211941], [105.2113169, 21.8215271], [105.2103803, 21.8219475],
        [105.2101535, 21.8220413], [105.2096221, 21.8222839], [105.2087025, 21.8226575],
        [105.2086682, 21.8226825], [105.2079669, 21.8229663], [105.2067516, 21.8235524],
        [105.2067309, 21.8235947], [105.2066973, 21.8236290], [105.2066509, 21.8236530],
        [105.2065987, 21.8236616], [105.2065463, 21.8236538], [105.2064996, 21.8236306],
        [105.2064714, 21.8236047], [105.2061143, 21.8237277], [105.2059218, 21.8237632],
        [105.2052927, 21.8240644], [105.2045728, 21.8228474], [105.2038385, 21.8217667],
        [105.2035856, 21.8213572], [105.2030865, 21.8205733], [105.2038700, 21.8200990],
        [105.2043226, 21.8198603], [105.2053013, 21.8193089], [105.2079069, 21.8178944],
        [105.2082909, 21.8176752], [105.2101430, 21.8166540], [105.2117014, 21.8158063],
        [105.2124710, 21.8154037], [105.2126644, 21.8152960], [105.2126462, 21.8152671],
        [105.2126373, 21.8152370], [105.2126369, 21.8152058], [105.2126450, 21.8151756],
        [105.2126625, 21.8151464], [105.2126878, 21.8151227], [105.2127190, 21.8151062],
        [105.2127538, 21.8150981], [105.2127954, 21.8151000], [105.2128343, 21.8151139],
        [105.2128666, 21.8151383], [105.2128891, 21.8151708], [105.2128992, 21.8152044],
        [105.2128986, 21.8152393], [105.2128875, 21.8152726],
      ],
    },
  ],

  // "Bản đồ tối nay" hiện lượt báo trong khoảng này. Mô hình di chuyển nên dữ liệu cũ hơn vài
  // giờ không còn giúp ai đi tìm.
  recentWindowMinutes: 180,

  // Nhóm hiển thị (một mô hình một nhóm). `frame` = khung huy hiệu trong lib/game/badge.js
  // (NOTE-07 §9): linh vật sắc cạnh, lịch sử khiên, truyền thuyết vành mềm, văn hoá bát giác,
  // công nghệ/đồng hành lục giác, bí ẩn tròn.
  categories: [
    { id: "linh-vat", label: "Linh vật & muông thú", icon: "🐉", tint: "#fdefd8", frame: "creature" },
    { id: "truyen-thuyet", label: "Truyện & truyền thuyết", icon: "🌕", tint: "#efe9fb", frame: "legend" },
    { id: "lich-su", label: "Lịch sử", icon: "⚔️", tint: "#fbe5df", frame: "heroic" },
    { id: "van-hoa", label: "Văn hóa Việt", icon: "🥁", tint: "#e8f2e0", frame: "folk" },
    { id: "hien-dai", label: "Hiện đại & công nghệ", icon: "🚀", tint: "#e3effa", frame: "tech" },
    { id: "dong-hanh", label: "Doanh nghiệp đồng hành", icon: "🤝", tint: "#eceff3", frame: "sponsor" },
    { id: "khac", label: "Khác", icon: "🏮", tint: "#fbf3e6", frame: "mystery" },
  ],

  // Bộ icon: khoá → MỘT hình hero (NOTE-07 §4.2) + emoji dự phòng cho chỗ chỉ hiện chữ (ô chọn admin).
  // `art` là tên hình trong lib/game/iconArt.js (game-icons.net, CC BY 3.0) hoặc iconArtCustom.js.
  // Cùng họ phải khác hình: 4 con rồng 4 dáng, hổ ≠ nghê, cá chép ≠ cửu ngư (NOTE-07 §2.3, §10).
  iconSet: {
    "dragon-gather": { art: "spiked-dragon-head", emoji: "🐲" },
    "dragon-gold": { art: "dragon-head", emoji: "🐉" },
    "dragon-water": { art: "sea-dragon", emoji: "🐉" },
    "dragon-lotus": { art: "dragon-spiral", emoji: "🐉" },
    tiger: { art: "tiger-head", emoji: "🐅" },
    "nghe-pearl": { art: "lion", emoji: "🦁" },
    phoenix: { art: "fire-tail", emoji: "🦚" },
    "lac-bird": { art: "heron", emoji: "🕊️" },
    "war-elephant": { art: "elephant", emoji: "🐘" },
    "turtle-giant": { art: "tortoise", emoji: "🐢" },
    horses: { art: "horse-head", emoji: "🐴" },
    "jade-rabbit": { art: "rabbit", emoji: "🐇" },
    "carp-leap": { art: "fish-escape", emoji: "🐟" },
    "nine-carp": { art: "circling-fish", emoji: "🎏" },
    cricket: { art: "cricket", emoji: "🦗" },
    "reed-flag": { art: "flying-flag", emoji: "🚩" },
    "trung-sisters": { art: "queen-crown", emoji: "👑" },
    "saint-giong": { art: "bamboo", emoji: "🎋" },
    "orange-flag": { art: "orange", emoji: "🍊" },
    "sword-lake": { art: "broadsword", emoji: "🗡️" },
    "toad-sky": { art: "frog", emoji: "🐸" },
    watermelon: { art: "watermelon", emoji: "🍉" },
    "hundred-eggs": { art: "egg-clutch", emoji: "🥚" },
    "thach-sanh": { art: "ogre", emoji: "👹" },
    "mountain-water": { art: "mountains", emoji: "⛰️" },
    "cuoi-moon": { art: "moon", emoji: "🌕" },
    "mouse-wedding": { art: "seated-mouse", emoji: "🐭" },
    "bronze-drum": { art: "bronze-drum-face", emoji: "🥁" },
    "banyan-gate": { art: "willow-tree", emoji: "🌳" },
    "paper-scholar-ai": { art: "graduate-cap", emoji: "🎓" },
    "farm-boat": { art: "wheat", emoji: "🌾" },
    "satellite-turtle": { art: "satellite-communication", emoji: "🛰️" },
    rocket: { art: "rocket", emoji: "🚀" },
    diamond: { art: "cut-diamond", emoji: "💎" },
    // Slot chưa rõ tên: đèn lồng + dấu hỏi (NOTE-06 §10, NOTE-07 §6).
    "mystery-slot": { art: "mystery-lantern", emoji: "🏮" },
  },

  // Sound identity (NOTE-06 §2–§4, §6): khoá → các lớp [âm, lúc bắt đầu (s), độ to, tốc độ phát].
  // Âm thật (CC0, xem lib/game/soundSamples.js) làm lõi, "synth:*" thêm cảm giác game. Mỗi công
  // thức 0,7–2 giây. Đổi tiếng một mô hình = đổi `soundKey` của nó ở /admin/game, không sửa component.
  soundSet: {
    // Rồng — mỗi con một sắc thái để nghe là phân biệt.
    // Rồng vàng: uy nghi, sáng, "showpiece" — giọng gầm sáng hơn, ít trầm, lấp lánh vàng.
    "dragon-roar": { label: "Rồng vàng: gầm uy nghi + đập cánh + lấp lánh", layers: [["dragon-roar-bright", 0, 0.95], ["wing-flap-heavy", 0.2, 0.65], ["synth:regal-shimmer", 0.55, 0.8]] },
    // Mãng long = boss: giọng gầm trầm nhất, dài nhất, nhiều lớp gầm chồng ("tụ hội"), rung ngực,
    // nổ trầm và luồng khí đẩy — to và nặng hơn Rồng vàng rõ rệt (NOTE-07 §2.2).
    "dragon-gather": { label: "Mãng long (boss): gầm trầm nhiều lớp + rung ngực + nổ trầm + luồng khí", layers: [["dragon-roar", 0, 1, 0.88], ["boss-roar", 0, 0.6], ["dragon-snarl", 0.35, 0.22, 1.12], ["low-rumble", 0, 0.6, 0.9], ["sub-boom", 0.1, 0.85, 0.8], ["big-swoosh", 0.55, 0.55, 0.85]] },
    "dragon-water": { label: "Long cuốn thủy: gầm gằn + nước dâng + sóng vỗ", layers: [["dragon-snarl", 0, 0.85], ["ocean-wave", 0.05, 0.65], ["water-splash", 0.5, 0.7], ["bubbles", 0.8, 0.35]] },
    "dragon-ceremony": { label: "Hào khí: tiếng rồng trầm + chiêng + chuông nghi lễ", layers: [["dino-dragon-roar", 0, 0.8, 0.95], ["gong", 0.25, 0.45, 1.1], ["synth:ceremonial-chime", 0.7, 0.8]] },
    // Muông thú
    "elephant-trumpet": { label: "Voi rống + rung trầm", layers: [["elephant-trumpet"], ["low-rumble", 0, 0.45]] },
    // Hổ vàng hạ sơn: chúa sơn lâm — hổ gầm dài hơi + sư tử gầm ngực + nổ trầm + vang đuôi (NOTE-07 §2.1).
    "tiger-roar": { label: "Hổ gầm dài + gầm ngực + nổ trầm + vang đuôi", layers: [["tiger-roar-long", 0, 1], ["lion-roar-big", 0.05, 0.55, 0.92], ["sub-boom", 0.12, 0.7, 0.85], ["tiger-roar-long", 0.28, 0.18, 0.95]] },
    "horse-neigh": { label: "Ngựa hí + vó ngựa", layers: [["horse-neigh"], ["horse-gallop", 0.15, 0.5]] },
    phoenix: { label: "Chim hót + vỗ cánh + lửa bùng", layers: [["peacock-call"], ["wing-flap", 0.05, 0.8], ["fire-whoosh", 0.45, 0.5]] },
    "lac-bird": { label: "Tiếng chim hạc + vỗ cánh", layers: [["crane-call"], ["wing-flap", 0.3, 0.8], ["wing-flap", 0.65, 0.6, 1.1]] },
    "carp-leap": { label: "Cá chép: vút lên + quẫy nước mạnh + lấp lánh", layers: [["synth:rise-sweep", 0, 0.9], ["big-swoosh", 0.05, 0.5, 1.15], ["water-splash", 0.35, 1], ["synth:magic-shimmer", 0.9, 0.8]] },
    "nine-carp": { label: "Cửu ngư: nhiều gợn nước nhỏ hội tụ + chuông sen", layers: [["water-splash-small", 0, 0.95], ["water-splash-small", 0.18, 0.85, 1.2], ["water-splash-small", 0.36, 0.8, 0.9], ["water-splash-small", 0.55, 0.75, 1.3], ["bubbles", 0.1, 0.55], ["singing-bowl", 0.15, 0.4]] },
    "turtle-shell": { label: "Mai rùa miết đá + nước", layers: [["stone-scrape", 0, 0.9], ["water-splash-small", 0.6, 0.7], ["bubbles", 0.7, 0.4]] },
    // Nghê: gằn ngắn của linh thú + chuông đồng — không gầm như hổ.
    "nghe-growl-bell": { label: "Nghê: gằn ngắn + chuông đồng + ngân linh thú", layers: [["lion-growl", 0, 0.9, 1.08], ["temple-bell", 0.3, 0.5], ["synth:ceremonial-chime", 0.5, 0.35]] },
    "rabbit-hop": { label: "Thỏ nhảy lá xào xạc + kêu khẽ", layers: [["leaves-rustle", 0, 0.7], ["rabbit-thump", 0.08, 0.9], ["rabbit-thump", 0.36, 0.7, 1.15], ["squeak-soft", 0.55, 0.8], ["cricket-chirp", 0.45, 0.35]] },
    cricket: { label: "Dế gáy + lá tre", layers: [["cricket-chirp"], ["leaves-rustle", 0.3, 0.6]] },
    // Lịch sử
    "elephant-war-drum": { label: "Voi rống + trống trận", layers: [["elephant-trumpet"], ["big-tom", 0.45, 0.8], ["big-tom", 0.7, 0.65, 1.15]] },
    "iron-horse": { label: "Ngựa hí + vó + tiếng sắt", layers: [["horse-neigh"], ["horse-gallop", 0, 0.45], ["anvil", 0.9, 0.5]] },
    "reed-flag-drum": { label: "Trống trận nhỏ + cờ bay", layers: [["big-tom", 0, 0.8, 1.25], ["big-tom", 0.3, 0.7, 1.35], ["cloth-flap", 0.2, 0.8], ["cloth-flap", 0.75, 0.6]] },
    "drum-sword": { label: "Trống + rút gươm", layers: [["big-tom", 0, 0.85], ["sword-draw", 0.35, 0.9]] },
    // Truyện & truyền thuyết
    "sword-lake": { label: "Nước vỡ + âm trầm huyền bí", layers: [["water-splash", 0, 0.8], ["low-rumble", 0, 0.45], ["singing-bowl", 0.25, 0.5, 1.05]] },
    "toad-thunder": { label: "Cóc kêu + sấm", layers: [["frog-croak"], ["frog-croak", 0.4, 0.9, 0.92], ["thunder", 0.35, 0.55]] },
    "storm-water": { label: "Sấm + nước dâng + va chạm trầm", layers: [["thunder"], ["ocean-wave", 0.2, 0.6], ["big-tom", 0.4, 0.6, 0.9]] },
    "monster-sword": { label: "Chằn tinh gầm + chém gươm", layers: [["monster-growl", 0, 0.9], ["sword-clash", 0.7, 0.9]] },
    "dragon-fairy": { label: "Gió + nước + chuông nghi lễ", layers: [["wind-gust", 0, 0.7], ["ocean-wave", 0.1, 0.5], ["synth:ceremonial-chime", 0.5]] },
    "night-moon": { label: "Đêm dế kêu + mõ tre + chuông trăng", layers: [["crickets-night", 0, 0.6], ["wood-block", 0.35, 0.5], ["wood-block", 0.6, 0.4, 1.2], ["synth:ceremonial-chime", 0.8, 0.6]] },
    "island-melon": { label: "Sóng biển + gõ dưa + lấp lánh", layers: [["ocean-wave", 0, 0.55], ["wood-block", 0.4, 0.8, 0.8], ["wood-block", 0.62, 0.7, 0.8], ["synth:magic-shimmer", 0.9, 0.7]] },
    // Văn hoá
    "bronze-drum": { label: "Trống đồng", layers: [["gong", 0, 0.8, 0.95], ["big-tom", 0, 0.7, 0.9]] },
    "mouse-wedding": { label: "Chuột kêu + nhạc gõ dân gian", layers: [["mouse-squeak"], ["wood-block", 0.3, 0.7], ["wood-block", 0.5, 0.6, 1.2], ["squeak-soft", 0.7, 0.7], ["wood-block", 0.85, 0.6]] },
    "village-gate": { label: "Gà gáy làng quê + mõ tre", layers: [["rooster-crow", 0, 0.55], ["wood-block", 0.1, 0.7], ["wood-block", 0.35, 0.6, 1.2], ["wood-block", 0.6, 0.5]] },
    // Hiện đại & doanh nghiệp
    "paper-ai": { label: "Lật giấy + blip số", layers: [["paper-flip"], ["synth:digital-blip", 0.45]] },
    "rocket-launch": { label: "Tên lửa phóng + synth", layers: [["rocket-launch"], ["synth:digital-sweep", 0.5, 0.7]] },
    "signal-wave": { label: "Sóng radio + quét tín hiệu", layers: [["radio-static", 0, 0.45], ["synth:signal-pulse", 0.1], ["synth:digital-sweep", 0.5, 0.8]] },
    "farm-engine": { label: "Máy nông nghiệp + tiếng cơ khí", layers: [["tractor-engine", 0, 0.8], ["anvil", 0.75, 0.35]] },
    "crystal-pulse": { label: "Kính lấp lánh + nhịp điện ảnh", layers: [["glass-shimmer", 0, 0.8], ["synth:cinematic-pulse"]] },
    // Bí ẩn + mặc định theo nhóm
    mystery: { label: "Bí ẩn: vút gió + nốt hỏi", layers: [["whoosh", 0, 0.6], ["synth:question-tone", 0.2]] },
    "animal-soft": { label: "Mặc định muông thú", layers: [["leaves-rustle", 0, 0.8], ["synth:magic-shimmer", 0.25, 0.6]] },
    "war-drum": { label: "Mặc định lịch sử: trống trận", layers: [["big-tom", 0, 0.85], ["big-tom", 0.3, 0.7, 1.12]] },
    "legend-chime": { label: "Mặc định truyền thuyết: chuông huyền bí", layers: [["singing-bowl", 0, 0.55], ["synth:magic-shimmer", 0.1]] },
    "tech-blip": { label: "Mặc định công nghệ: blip số", layers: [["synth:digital-blip"], ["synth:digital-sweep", 0.2, 0.7]] },
    "village-wood": { label: "Mặc định truyền thống: mõ + chuông", layers: [["wood-block"], ["wood-block", 0.2, 0.7, 1.2], ["temple-bell", 0.35, 0.4]] },
  },

  // Nhóm nghe so sánh ở /admin/game (NOTE-07 §12): cùng họ phải nghe khác nhau.
  soundCompareGroups: [
    { label: "Hổ · Nghê · Rồng vàng · Mãng long", objectIds: ["tt26-ho-vang", "tt26-nghe-than", "tt26-rong-vang", "tt26-mang-long-tu-hoi"] },
    { label: "Họ rồng", objectIds: ["tt26-rong-vang", "tt26-mang-long-tu-hoi", "tt26-long-cuon-thuy", "tt26-hao-khi-dat-viet-xuan-truong"] },
    { label: "Họ cá", objectIds: ["tt26-ca-chep-vuot-vu-mon", "tt26-cuu-ngu-quan-hoi"] },
  ],

  // Mô hình chưa có âm riêng dùng khoá theo nhóm (NOTE-06 §6).
  soundFamilies: {
    animal: "animal-soft",
    history: "war-drum",
    folklore: "legend-chime",
    technology: "tech-blip",
    traditional: "village-wood",
    mystery: "mystery",
  },

  // Bộ sưu tập sinh từ luật tag (NOTE-05 §5–§7, §11). `hidden`: chỉ hiện khi gặp đủ `unlockAt`
  // mô hình thuộc bộ, và giấu mẫu số tới khi hoàn thành. `combo`: hoàn thành có hiệu ứng mạnh hơn.
  collections: [
    { id: "tron-bo", kind: "main", title: "Thành Tuyên 2026", icon: "🏮", rule: { all: true } },
    { id: "linh-vat", title: "Linh vật & muông thú", icon: "🐾", rule: { anyTags: ["animal"] } },
    { id: "chuyen-xua", title: "Chuyện xưa kể lại", icon: "📜", combo: true, rule: { anyTags: ["folklore", "legend"] } },
    {
      id: "su-viet",
      title: "Sử Việt",
      icon: "⚔️",
      combo: true,
      rule: { objectIds: ["tt26-dinh-bo-linh", "tt26-hai-ba-trung", "tt26-thanh-giong", "tt26-tran-quoc-toan"] },
    },
    { id: "van-hoa-viet", title: "Văn hóa Việt", icon: "🥁", rule: { anyTags: ["culture"] } },
    { id: "hien-dai", title: "Công nghệ & hiện đại", icon: "🚀", rule: { anyTags: ["technology"] } },
    { id: "dong-hanh", title: "Doanh nghiệp đồng hành", icon: "🤝", rule: { anyTags: ["sponsor"] } },
    { id: "long-hoi", title: "Long hội", icon: "🐲", combo: true, hidden: { unlockAt: 3 }, rule: { anyTags: ["dragon"] } },
    { id: "thuy-phu", title: "Thủy phủ", icon: "🌊", hidden: { unlockAt: 3 }, rule: { anyTags: ["water"] } },
  ],

  // Mốc của bộ chính (NOTE-05 §8, NOTE-06 §8). `complete` = gặp đủ mọi slot (45/45).
  milestones: [
    { count: 5, title: "5 mô hình rồi!", body: "Khởi động ngon lành đấy 🎉" },
    { count: 10, title: "10 mô hình rồi!", body: "Bạn đang đi nhanh hơn mình nghĩ đấy 😄" },
    { count: 20, title: "20 mô hình!", body: "Mắt bạn tinh thật, phố Tuyên chạy đâu cho thoát 👀" },
    { count: 30, title: "30 mô hình!", body: "Sắp thuộc lòng cả mùa đèn rồi 🏮" },
    { count: 40, title: "40 mô hình!", body: "Chỉ còn vài chiếc đèn nữa là trọn bộ 🔥" },
    { count: "complete", title: "Trọn bộ Thành Tuyên 2026!", body: "Bạn đã gặp đủ cả mùa đèn 🎊" },
  ],

  // 34 mô hình từ danh sách chủ dự án cung cấp (data/MoHinhTrungThuTuyenQuang.md, 15/9/2026).
  // Chưa đối chiếu nguồn chính thức nên để `unverified`; phường/tổ chưa có. Admin sửa ở /admin/game.
  objects: [
    ["mang-long-tu-hoi", "Mãng long tụ hội", "linh-vat", ["animal", "dragon", "traditional"], "dragon-gather", "animal", "dragon-gather",
      "Mô hình rồng hoành tráng, thiết kế tinh xảo đại diện cho sức mạnh và sự quần tụ."],
    ["cay-da-cong-lang", "Cây đa, cổng làng Đường Lâm", "van-hoa", ["culture", "traditional"], "banyan-gate", "traditional", "village-gate",
      "Tái hiện không gian văn hóa đồng bằng Bắc Bộ, tôn vinh nét đẹp kiến trúc và hồn quê Việt Nam xưa."],
    ["tien-si-giay-ai", "Ông Tiến sĩ Giấy AI", "hien-dai", ["technology", "culture", "kids"], "paper-scholar-ai", "technology", "paper-ai",
      "Kết hợp biểu tượng hiếu học truyền thống với kỷ nguyên công nghệ số, trí tuệ nhân tạo."],
    ["rong-vang", "Rồng vàng khổng lồ", "linh-vat", ["animal", "dragon"], "dragon-gold", "animal", "dragon-roar",
      "Linh vật truyền thống nâng cấp với LED rực rỡ và cơ khí chuyển động ở các khớp nối."],
    ["phuong-hoang", "Phượng hoàng vỗ cánh", "linh-vat", ["animal", "bird"], "phoenix", "animal", "phoenix",
      "Hiệu ứng ánh sáng trải dài phần đuôi và cơ cấu đập cánh nhịp nhàng khi diễu hành."],
    ["voi-chien", "Hình tượng Voi chiến", "lich-su", ["animal", "history"], "war-elephant", "animal", "elephant-trumpet",
      "Cảm hứng từ lịch sử chống giặc ngoại xâm, đậm tinh thần thượng võ của dân tộc."],
    ["rua-khong-lo", "Rùa khổng lồ", "linh-vat", ["animal", "water", "folklore"], "turtle-giant", "animal", "turtle-shell",
      "Rùa thần trong truyền thuyết dân gian, thông điệp hòa bình và trường thọ."],
    ["dan-ngua", "Đàn ngựa nhiều màu sắc", "linh-vat", ["animal"], "horses", "animal", "horse-neigh",
      "Cụm mô hình có tính động cao, màu sắc rực rỡ, không khí nhộn nhịp trên phố."],
    ["con-trung-tho-ngoc", "Côn trùng, thỏ ngọc", "truyen-thuyet", ["animal", "mid_autumn", "kids"], "jade-rabbit", "animal", "rabbit-hop",
      "Cụm mô hình sinh động, bám sát ý nghĩa Tết Trung thu dành cho thiếu nhi."],
    ["dinh-bo-linh", "Đinh Bộ Lĩnh cờ lau tập trận", "lich-su", ["history", "hero", "kids"], "reed-flag", "history", "reed-flag-drum",
      "Tuổi thơ hào hùng của Đinh Tiên Hoàng với đám trẻ chăn trâu và cờ lau."],
    ["hai-ba-trung", "Hai Bà Trưng cưỡi voi", "lich-su", ["history", "hero", "animal"], "trung-sisters", "history", "elephant-war-drum",
      "Hai nữ anh hùng dân tộc cưỡi voi chiến uy nghi, cơ khí chuyển động linh hoạt."],
    ["thanh-giong", "Thánh Gióng nhổ tre ngà", "lich-su", ["history", "hero", "legend"], "saint-giong", "history", "iron-horse",
      "Biểu tượng sức mạnh chống giặc, ngựa sắt phun khói và đèn LED đỏ rực."],
    ["su-tich-ho-guom", "Sự tích Hồ Gươm", "truyen-thuyet", ["legend", "folklore", "water", "animal"], "sword-lake", "folklore", "sword-lake",
      "Rùa thần ngậm gươm báu nhô lên mặt nước, kết hợp hiệu ứng phun nước."],
    ["tran-quoc-toan", "Trần Quốc Toản bóp nát quả cam", "lich-su", ["history", "hero"], "orange-flag", "history", "drum-sword",
      "Khí phách tuổi trẻ với lá cờ \"Phá cường địch, báo hoàng ân\"."],
    ["dam-cuoi-chuot", "Đám cưới chuột", "van-hoa", ["culture", "folklore", "animal", "traditional"], "mouse-wedding", "traditional", "mouse-wedding",
      "Dòng tranh dân gian Đông Hồ tái hiện sống động, trào phúng và vui nhộn."],
    ["coc-kien-troi", "Cóc kiện trời", "truyen-thuyet", ["folklore", "legend", "animal"], "toad-sky", "folklore", "toad-thunder",
      "Các con vật cùng tiến lên thiên đình, mây khói cuộn trào sinh động."],
    ["su-tich-dua-hau", "Sự tích quả dưa hấu", "truyen-thuyet", ["folklore", "legend"], "watermelon", "folklore", "island-melon",
      "Mai An Tiêm cùng gia đình trên đảo hoang, quả dưa hấu khổng lồ tách mở được."],
    ["ca-chep-vuot-vu-mon", "Cá chép vượt vũ môn", "linh-vat", ["animal", "water", "dragon", "legend"], "carp-leap", "animal", "carp-leap",
      "Cá chép hóa rồng, vảy làm bằng vật liệu phản quang lấp lánh ban đêm."],
    ["lac-long-quan-au-co", "Lạc Long Quân - Âu Cơ", "truyen-thuyet", ["legend", "folklore", "dragon", "bird"], "hundred-eggs", "folklore", "dragon-fairy",
      "50 người con lên rừng, 50 người con xuống biển cùng bọc trăm trứng khổng lồ."],
    ["thach-sanh", "Thạch Sanh chém chằn tinh", "truyen-thuyet", ["folklore", "hero"], "thach-sanh", "folklore", "monster-sword",
      "Hiệu ứng âm thanh, ánh sáng mạnh tại khu vực chằn tinh phun lửa."],
    ["de-men", "Dế Mèn phiêu lưu ký", "truyen-thuyet", ["animal", "kids", "literature"], "cricket", "animal", "cricket",
      "Chú dế mèn khổng lồ cưỡi lá tre, mô hình giáo dục cho thiếu nhi."],
    ["son-tinh-thuy-tinh", "Sơn Tinh - Thủy Tinh", "truyen-thuyet", ["legend", "folklore", "water", "animal"], "mountain-water", "folklore", "storm-water",
      "Cuộc chiến giữa voi chín ngà, gà chín cựa và thủy quái."],
    ["trong-dong-dong-son", "Trống đồng Đông Sơn", "van-hoa", ["culture", "history", "traditional"], "bronze-drum", "traditional", "bronze-drum",
      "Trống khổng lồ xoay tròn, bề mặt khắc họa chi tiết họa tiết chim Lạc."],
    ["chu-cuoi", "Chú Cuội ngồi gốc cây đa", "truyen-thuyet", ["folklore", "mid_autumn", "kids"], "cuoi-moon", "folklore", "night-moon",
      "Mô hình tĩnh đậm chất thơ Trung thu, vầng trăng tỏa sáng dịu."],
    ["long-cuon-thuy", "Long cuốn thủy", "linh-vat", ["animal", "dragon", "water"], "dragon-water", "animal", "dragon-water",
      "Rồng thiêng hút nước, bơm nước tuần hoàn tạo hiệu ứng thị giác độc đáo."],
    ["chim-lac", "Chim Lạc vươn cao", "van-hoa", ["culture", "bird", "animal", "history"], "lac-bird", "animal", "lac-bird",
      "Đôi chim Lạc sải cánh rộng, ánh sáng chạy dọc lông tơ nhịp nhàng."],
    ["ho-vang", "Hổ vàng hạ sơn", "linh-vat", ["animal"], "tiger", "animal", "tiger-roar",
      "Chúa sơn lâm oai phong, mắt gắn đèn pha công suất lớn."],
    ["cuu-ngu-quan-hoi", "Cửu ngư quần hội", "linh-vat", ["animal", "water", "traditional"], "nine-carp", "animal", "nine-carp",
      "Chín con cá chép bơi quanh đài sen, biểu tượng no ấm, sung túc."],
    ["nghe-than", "Nghê thần chầu ngọc", "linh-vat", ["animal", "traditional", "culture"], "nghe-pearl", "traditional", "nghe-growl-bell",
      "Linh vật thuần Việt chạm trổ tỉ mỉ, bảo vệ viên ngọc sáng giữa trời."],
    ["tam-nong-agribank", "Tam nông phát triển - Agribank", "dong-hanh", ["sponsor", "technology"], "farm-boat", "technology", "farm-engine",
      "Con thuyền chở đầy nông sản và máy móc hiện đại, hướng tới tương lai."],
    ["canh-song-viettel", "Cánh sóng vươn xa - Viettel", "dong-hanh", ["sponsor", "technology", "animal"], "satellite-turtle", "technology", "signal-wave",
      "Kết hợp rùa thần truyền thống và các trạm vệ tinh công nghệ cao."],
    ["ket-noi-khong-gian-vnpt", "Kết nối không gian - VNPT", "dong-hanh", ["sponsor", "technology"], "rocket", "technology", "rocket-launch",
      "Chuyến tàu vũ trụ mang cờ đỏ sao vàng vút bay lên dải ngân hà."],
    ["vung-buoc-tien-phong-bidv", "Vững bước tiên phong - BIDV", "dong-hanh", ["sponsor", "technology"], "diamond", "technology", "crystal-pulse",
      "Khối kim cương khổng lồ xoay quanh trục, tỏa ánh sáng laser nhiều màu."],
    ["hao-khi-dat-viet-xuan-truong", "Hào khí đất Việt - Xuân Trường", "dong-hanh", ["sponsor", "dragon", "animal", "culture"], "dragon-lotus", "animal", "dragon-ceremony",
      "Rồng vàng cuộn mình quanh đài hoa sen, biểu tượng vươn mình mạnh mẽ."],
  ]
    .map(([slug, name, category, tags, icon, soundFamily, soundKey, description]) => ({
      id: `tt26-${slug}`,
      slug,
      name,
      category,
      tags,
      icon,
      soundFamily,
      soundKey,
      description,
      kind: "model",
      eventYear: 2026,
      verificationStatus: "unverified",
      source: "cdp_owner_list_2026-09-15",
    }))
    // 11 slot còn lại tới đủ 45 (NOTE-06 §1, §9): chưa có tên nên chưa chọn được khi báo, hiện
    // "Mô hình chưa xác định #35…#45" trong bộ sưu tập. Biết tên thì admin sửa NGAY trên slot này
    // (tên, icon, tag, soundKey) — id giữ nguyên nên lượt báo/tiến độ cũ không mất. Bí ẩn người chơi
    // báo được ghép vào slot bằng "Ghép vào mô hình".
    .concat(
      Array.from({ length: 11 }, (_, i) => ({
        id: `tt26-slot-${35 + i}`,
        code: String(35 + i),
        name: null,
        category: "khac",
        tags: [],
        icon: "mystery-slot",
        soundFamily: "mystery",
        soundKey: "mystery",
        kind: "model",
        eventYear: 2026,
        verificationStatus: "unverified",
        source: "cdp_slot_2026-09-15",
      }))
    ),
};
