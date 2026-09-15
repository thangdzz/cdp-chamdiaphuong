// Cấu hình mùa game "Săn đèn Thành Tuyên 2026" (NOTE-04, NOTE-05). Đây là DỮ LIỆU, không phải
// code riêng cho Trung thu: mùa khác (chợ phiên, mùa hoa...) chỉ cần thêm một file cùng khuôn rồi
// đăng ký trong lib/game/registry.js. Không có `if model == ...` ở bất kỳ đâu — icon, bộ sưu tập,
// âm thanh đều sinh từ các khoá/tag khai báo dưới đây (NOTE-05 §22).

export const THANH_TUYEN_2026 = {
  id: "thanh-tuyen-2026",
  slug: "thanh-tuyen-2026",
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
  },

  // Không hard-code tổng số mô hình (NOTE-03 §1): con số dưới đây chỉ là thông tin tham khảo có
  // nguồn, KHÔNG dùng làm mẫu số của bộ sưu tập (mẫu số = số mô hình CDP đang biết).
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
  ],

  // "Bản đồ tối nay" hiện lượt báo trong khoảng này. Mô hình di chuyển nên dữ liệu cũ hơn vài
  // giờ không còn giúp ai đi tìm.
  recentWindowMinutes: 180,

  // Nhóm hiển thị (một mô hình một nhóm) + màu nền icon theo nhóm.
  categories: [
    { id: "linh-vat", label: "Linh vật & muông thú", icon: "🐉", tint: "#fdefd8" },
    { id: "truyen-thuyet", label: "Truyện & truyền thuyết", icon: "🌕", tint: "#efe9fb" },
    { id: "lich-su", label: "Lịch sử", icon: "⚔️", tint: "#fbe5df" },
    { id: "van-hoa", label: "Văn hóa Việt", icon: "🥁", tint: "#e8f2e0" },
    { id: "hien-dai", label: "Hiện đại & công nghệ", icon: "🚀", tint: "#e3effa" },
    { id: "dong-hanh", label: "Doanh nghiệp đồng hành", icon: "🤝", tint: "#eceff3" },
    { id: "khac", label: "Khác", icon: "🏮", tint: "#fbf3e6" },
  ],

  // Bộ icon: khoá → hình chính + hình phụ (NOTE-05 §12). Chỉ dùng emoji Unicode ≤ 13 để máy cũ
  // không hiện ô trống. Mô hình khó vẽ thì ghép hình gần nghĩa nhất (tiến sĩ giấy + robot...).
  iconSet: {
    "dragon-gather": { glyph: "🐲", badge: "✨" },
    "banyan-gate": { glyph: "🌳", badge: "🏘️" },
    "paper-scholar-ai": { glyph: "🎓", badge: "🤖" },
    "dragon-gold": { glyph: "🐉", badge: "💡" },
    phoenix: { glyph: "🦚", badge: "🔥" },
    "war-elephant": { glyph: "🐘", badge: "⚔️" },
    "turtle-giant": { glyph: "🐢", badge: "🌿" },
    horses: { glyph: "🐎", badge: "🌈" },
    "jade-rabbit": { glyph: "🐇", badge: "🦋" },
    "reed-flag": { glyph: "🐃", badge: "🚩" },
    "trung-sisters": { glyph: "🐘", badge: "👑" },
    "saint-giong": { glyph: "🐴", badge: "🎋" },
    "sword-lake": { glyph: "🐢", badge: "🗡️" },
    "orange-flag": { glyph: "🍊", badge: "🚩" },
    "mouse-wedding": { glyph: "🐭", badge: "💐" },
    "toad-sky": { glyph: "🐸", badge: "⛈️" },
    watermelon: { glyph: "🍉", badge: "🏝️" },
    "carp-leap": { glyph: "🐟", badge: "🐉" },
    "hundred-eggs": { glyph: "🥚", badge: "🐉" },
    "thach-sanh": { glyph: "⚔️", badge: "👹" },
    cricket: { glyph: "🦗", badge: "🍃" },
    "mountain-water": { glyph: "⛰️", badge: "🌊" },
    "bronze-drum": { glyph: "🥁", badge: "✨" },
    "cuoi-moon": { glyph: "🌕", badge: "🌳" },
    "dragon-water": { glyph: "🐉", badge: "💧" },
    "lac-bird": { glyph: "🕊️", badge: "✨" },
    tiger: { glyph: "🐅", badge: "⛰️" },
    "nine-carp": { glyph: "🎏", badge: "🌸" },
    "nghe-pearl": { glyph: "🦁", badge: "🔮" },
    "farm-boat": { glyph: "⛵", badge: "🌾" },
    "satellite-turtle": { glyph: "🛰️", badge: "🐢" },
    rocket: { glyph: "🚀", badge: "⭐" },
    diamond: { glyph: "💎", badge: "✨" },
    "dragon-lotus": { glyph: "🐉", badge: "🌸" },
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

  // Mốc của bộ chính (NOTE-05 §8). `complete` = gặp đủ mọi mô hình đang biết.
  milestones: [
    { count: 5, title: "5 mô hình rồi!", body: "Khởi động ngon lành đấy 🎉" },
    { count: 10, title: "10 mô hình rồi!", body: "Bạn đang đi nhanh hơn mình nghĩ đấy 😄" },
    { count: 20, title: "20 mô hình!", body: "Mắt bạn tinh thật, phố Tuyên chạy đâu cho thoát 👀" },
    { count: 30, title: "30 mô hình!", body: "Sắp thuộc lòng cả mùa đèn rồi 🏮" },
    { count: "complete", title: "Trọn bộ Thành Tuyên 2026!", body: "Bạn đã gặp đủ mọi mô hình CDP đang biết 🎊" },
  ],

  // 34 mô hình từ danh sách chủ dự án cung cấp (data/MoHinhTrungThuTuyenQuang.md, 15/9/2026).
  // Chưa đối chiếu nguồn chính thức nên để `unverified`; phường/tổ chưa có. Admin sửa ở /admin/game.
  objects: [
    ["mang-long-tu-hoi", "Mãng long tụ hội", "linh-vat", ["animal", "dragon", "traditional"], "dragon-gather", "animal", "dragon",
      "Mô hình rồng hoành tráng, thiết kế tinh xảo đại diện cho sức mạnh và sự quần tụ."],
    ["cay-da-cong-lang", "Cây đa, cổng làng Đường Lâm", "van-hoa", ["culture", "traditional"], "banyan-gate", "traditional", "bamboo",
      "Tái hiện không gian văn hóa đồng bằng Bắc Bộ, tôn vinh nét đẹp kiến trúc và hồn quê Việt Nam xưa."],
    ["tien-si-giay-ai", "Ông Tiến sĩ Giấy AI", "hien-dai", ["technology", "culture", "kids"], "paper-scholar-ai", "technology", "digital-blip",
      "Kết hợp biểu tượng hiếu học truyền thống với kỷ nguyên công nghệ số, trí tuệ nhân tạo."],
    ["rong-vang", "Rồng vàng khổng lồ", "linh-vat", ["animal", "dragon"], "dragon-gold", "animal", "dragon",
      "Linh vật truyền thống nâng cấp với LED rực rỡ và cơ khí chuyển động ở các khớp nối."],
    ["phuong-hoang", "Phượng hoàng vỗ cánh", "linh-vat", ["animal", "bird"], "phoenix", "animal", "bird",
      "Hiệu ứng ánh sáng trải dài phần đuôi và cơ cấu đập cánh nhịp nhàng khi diễu hành."],
    ["voi-chien", "Hình tượng Voi chiến", "lich-su", ["animal", "history"], "war-elephant", "animal", "elephant",
      "Cảm hứng từ lịch sử chống giặc ngoại xâm, đậm tinh thần thượng võ của dân tộc."],
    ["rua-khong-lo", "Rùa khổng lồ", "linh-vat", ["animal", "water", "folklore"], "turtle-giant", "animal", "turtle",
      "Rùa thần trong truyền thuyết dân gian, thông điệp hòa bình và trường thọ."],
    ["dan-ngua", "Đàn ngựa nhiều màu sắc", "linh-vat", ["animal"], "horses", "animal", "horse",
      "Cụm mô hình có tính động cao, màu sắc rực rỡ, không khí nhộn nhịp trên phố."],
    ["con-trung-tho-ngoc", "Côn trùng, thỏ ngọc", "truyen-thuyet", ["animal", "mid_autumn", "kids"], "jade-rabbit", "animal", "rabbit",
      "Cụm mô hình sinh động, bám sát ý nghĩa Tết Trung thu dành cho thiếu nhi."],
    ["dinh-bo-linh", "Đinh Bộ Lĩnh cờ lau tập trận", "lich-su", ["history", "hero", "kids"], "reed-flag", "history", "drum",
      "Tuổi thơ hào hùng của Đinh Tiên Hoàng với đám trẻ chăn trâu và cờ lau."],
    ["hai-ba-trung", "Hai Bà Trưng cưỡi voi", "lich-su", ["history", "hero", "animal"], "trung-sisters", "history", "heroic",
      "Hai nữ anh hùng dân tộc cưỡi voi chiến uy nghi, cơ khí chuyển động linh hoạt."],
    ["thanh-giong", "Thánh Gióng nhổ tre ngà", "lich-su", ["history", "hero", "legend"], "saint-giong", "history", "heroic",
      "Biểu tượng sức mạnh chống giặc, ngựa sắt phun khói và đèn LED đỏ rực."],
    ["su-tich-ho-guom", "Sự tích Hồ Gươm", "truyen-thuyet", ["legend", "folklore", "water", "animal"], "sword-lake", "folklore", "magic",
      "Rùa thần ngậm gươm báu nhô lên mặt nước, kết hợp hiệu ứng phun nước."],
    ["tran-quoc-toan", "Trần Quốc Toản bóp nát quả cam", "lich-su", ["history", "hero"], "orange-flag", "history", "drum",
      "Khí phách tuổi trẻ với lá cờ \"Phá cường địch, báo hoàng ân\"."],
    ["dam-cuoi-chuot", "Đám cưới chuột", "van-hoa", ["culture", "folklore", "animal", "traditional"], "mouse-wedding", "traditional", "wood",
      "Dòng tranh dân gian Đông Hồ tái hiện sống động, trào phúng và vui nhộn."],
    ["coc-kien-troi", "Cóc kiện trời", "truyen-thuyet", ["folklore", "legend", "animal"], "toad-sky", "folklore", "wooden-chime",
      "Các con vật cùng tiến lên thiên đình, mây khói cuộn trào sinh động."],
    ["su-tich-dua-hau", "Sự tích quả dưa hấu", "truyen-thuyet", ["folklore", "legend"], "watermelon", "folklore", "magic",
      "Mai An Tiêm cùng gia đình trên đảo hoang, quả dưa hấu khổng lồ tách mở được."],
    ["ca-chep-vuot-vu-mon", "Cá chép vượt vũ môn", "linh-vat", ["animal", "water", "dragon", "legend"], "carp-leap", "animal", "fish",
      "Cá chép hóa rồng, vảy làm bằng vật liệu phản quang lấp lánh ban đêm."],
    ["lac-long-quan-au-co", "Lạc Long Quân - Âu Cơ", "truyen-thuyet", ["legend", "folklore", "dragon", "bird"], "hundred-eggs", "folklore", "magic",
      "50 người con lên rừng, 50 người con xuống biển cùng bọc trăm trứng khổng lồ."],
    ["thach-sanh", "Thạch Sanh chém chằn tinh", "truyen-thuyet", ["folklore", "hero"], "thach-sanh", "folklore", "heroic",
      "Hiệu ứng âm thanh, ánh sáng mạnh tại khu vực chằn tinh phun lửa."],
    ["de-men", "Dế Mèn phiêu lưu ký", "truyen-thuyet", ["animal", "kids", "literature"], "cricket", "animal", "insect",
      "Chú dế mèn khổng lồ cưỡi lá tre, mô hình giáo dục cho thiếu nhi."],
    ["son-tinh-thuy-tinh", "Sơn Tinh - Thủy Tinh", "truyen-thuyet", ["legend", "folklore", "water", "animal"], "mountain-water", "folklore", "magic",
      "Cuộc chiến giữa voi chín ngà, gà chín cựa và thủy quái."],
    ["trong-dong-dong-son", "Trống đồng Đông Sơn", "van-hoa", ["culture", "history", "traditional"], "bronze-drum", "traditional", "small-drum",
      "Trống khổng lồ xoay tròn, bề mặt khắc họa chi tiết họa tiết chim Lạc."],
    ["chu-cuoi", "Chú Cuội ngồi gốc cây đa", "truyen-thuyet", ["folklore", "mid_autumn", "kids"], "cuoi-moon", "folklore", "magic",
      "Mô hình tĩnh đậm chất thơ Trung thu, vầng trăng tỏa sáng dịu."],
    ["long-cuon-thuy", "Long cuốn thủy", "linh-vat", ["animal", "dragon", "water"], "dragon-water", "animal", "dragon",
      "Rồng thiêng hút nước, bơm nước tuần hoàn tạo hiệu ứng thị giác độc đáo."],
    ["chim-lac", "Chim Lạc vươn cao", "van-hoa", ["culture", "bird", "animal", "history"], "lac-bird", "animal", "bird",
      "Đôi chim Lạc sải cánh rộng, ánh sáng chạy dọc lông tơ nhịp nhàng."],
    ["ho-vang", "Hổ vàng hạ sơn", "linh-vat", ["animal"], "tiger", "animal", "tiger",
      "Chúa sơn lâm oai phong, mắt gắn đèn pha công suất lớn."],
    ["cuu-ngu-quan-hoi", "Cửu ngư quần hội", "linh-vat", ["animal", "water", "traditional"], "nine-carp", "animal", "fish",
      "Chín con cá chép bơi quanh đài sen, biểu tượng no ấm, sung túc."],
    ["nghe-than", "Nghê thần chầu ngọc", "linh-vat", ["animal", "traditional", "culture"], "nghe-pearl", "traditional", "bell",
      "Linh vật thuần Việt chạm trổ tỉ mỉ, bảo vệ viên ngọc sáng giữa trời."],
    ["tam-nong-agribank", "Tam nông phát triển - Agribank", "dong-hanh", ["sponsor", "technology"], "farm-boat", "traditional", "bamboo",
      "Con thuyền chở đầy nông sản và máy móc hiện đại, hướng tới tương lai."],
    ["canh-song-viettel", "Cánh sóng vươn xa - Viettel", "dong-hanh", ["sponsor", "technology", "animal"], "satellite-turtle", "technology", "synth-sparkle",
      "Kết hợp rùa thần truyền thống và các trạm vệ tinh công nghệ cao."],
    ["ket-noi-khong-gian-vnpt", "Kết nối không gian - VNPT", "dong-hanh", ["sponsor", "technology"], "rocket", "technology", "digital-blip",
      "Chuyến tàu vũ trụ mang cờ đỏ sao vàng vút bay lên dải ngân hà."],
    ["vung-buoc-tien-phong-bidv", "Vững bước tiên phong - BIDV", "dong-hanh", ["sponsor", "technology"], "diamond", "technology", "synth-sparkle",
      "Khối kim cương khổng lồ xoay quanh trục, tỏa ánh sáng laser nhiều màu."],
    ["hao-khi-dat-viet-xuan-truong", "Hào khí đất Việt - Xuân Trường", "dong-hanh", ["sponsor", "dragon", "animal", "culture"], "dragon-lotus", "animal", "dragon",
      "Rồng vàng cuộn mình quanh đài hoa sen, biểu tượng vươn mình mạnh mẽ."],
  ].map(([slug, name, category, tags, icon, soundFamily, soundKey, description]) => ({
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
  })),
};
