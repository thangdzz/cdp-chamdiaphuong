// 10 lĩnh vực người góp ý có thể chọn, mỗi lĩnh vực 5 bậc danh hiệu theo điểm tích luỹ.
// Chốt cùng anh 2026-07-18 — xem docs/DECISIONS.md nếu cần đổi tên/thêm bớt sau này.

export const CATEGORIES = [
  {
    id: "tho-dia",
    label: "Thổ địa Tuyên Quang",
    icon: "map",
    tiers: [
      "Khách lạ mới ghé",
      "Người quen mặt phố",
      "Thổ địa khu phố",
      "Thổ địa Thành Tuyên",
      "Huyền thoại Thổ địa Tuyên Quang",
    ],
  },
  {
    id: "nhiep-anh",
    label: "Nhiếp ảnh",
    icon: "camera",
    tiers: [
      "Người mới cầm máy",
      "Tay máy phố cổ",
      "Tay máy Thành Tuyên",
      "Nhiếp ảnh gia Thành Tuyên",
      "Bậc thầy ống kính xứ Tuyên",
    ],
  },
  {
    id: "am-thuc",
    label: "Mê ẩm thực",
    icon: "bowl",
    tiers: [
      "Người mới ăn thử",
      "Tín đồ ẩm thực phố Tuyên",
      "Food reviewer Thành Tuyên",
      "Vua/Nữ hoàng đầu bếp Thành Tuyên",
      "Huyền thoại ẩm thực xứ Tuyên",
    ],
  },
  {
    id: "xe-dich",
    label: "Mê xê dịch",
    icon: "suitcase",
    tiers: [
      "Khách ghé thăm",
      "Người dẫn đường nghiệp dư",
      "Nhà thám hiểm Thành Tuyên",
      "Đại sứ du lịch Thành Tuyên",
      "Huyền thoại xê dịch xứ Tuyên",
    ],
  },
  {
    id: "hoc-sinh",
    label: "Học sinh - Sinh viên",
    icon: "graduationCap",
    tiers: [
      "Tân binh học đường",
      "Cây bút lớp",
      "Đại sứ trường học",
      "Ngôi sao học đường Thành Tuyên",
      "Huyền thoại học đường xứ Tuyên",
    ],
  },
  {
    id: "tai-xe",
    label: "Xe ôm - Tài xế công nghệ",
    icon: "motorbike",
    tiers: [
      "Tài mới vào nghề",
      "Tài quen đường",
      "Tài rành phố Tuyên",
      "Tài xế thổ địa Thành Tuyên",
      "Huyền thoại vô-lăng xứ Tuyên",
    ],
  },
  {
    id: "noi-tro",
    label: "Gia đình - Nội trợ",
    icon: "home",
    tiers: [
      "Người mới góp ý",
      "Nội trợ đảm đang",
      "Cố vấn gia đình phố Tuyên",
      "Nội trợ thông thái Thành Tuyên",
      "Huyền thoại tề gia xứ Tuyên",
    ],
  },
  {
    id: "yeu-thanh-tuyen",
    label: "Người yêu Thành Tuyên",
    icon: "banyanTree",
    tiers: [
      "Người mới yêu Thành Tuyên",
      "Fan cứng đèn lồng",
      "Sứ giả ánh trăng Thành Tuyên",
      "Đại sứ Thành Tuyên Festival",
      "Huyền thoại Thành Tuyên",
    ],
  },
  {
    id: "cong-nghe",
    label: "Công nghệ - Sáng tạo",
    icon: "chip",
    tiers: [
      "Người mới thử nghiệm",
      "Thợ rà lỗi dữ liệu",
      "Kỹ sư dữ liệu Thành Tuyên",
      "Kiến trúc sư trải nghiệm Thành Tuyên",
      "Huyền thoại công nghệ xứ Tuyên",
    ],
  },
  {
    id: "kinh-doanh",
    label: "Kinh doanh địa phương",
    icon: "storefront",
    tiers: [
      "Người mới góp sức",
      "Đối tác thân thiện",
      "Người bạn đồng hành phố Tuyên",
      "Đại sứ kinh doanh Thành Tuyên",
      "Huyền thoại đồng hành xứ Tuyên",
    ],
  },
];

// Ngưỡng điểm cho 5 bậc (0-4: bậc 1, 5-19: bậc 2, 20-49: bậc 3, 50-99: bậc 4, 100+: bậc 5).
export const TIER_THRESHOLDS = [0, 5, 20, 50, 100];

// Màu theo bậc: mộc → đồng → bạc → vàng → ánh trăng (bậc huyền thoại).
export const TIER_COLORS = ["#8b5e3c", "#b08d57", "#a8a8a8", "#d4af37", "#a78bfa"];

export const POINTS = {
  correction: 5,
  photo: 10,
};

export function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) ?? null;
}

export function getTierIndex(points) {
  let tier = 0;
  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    if (points >= TIER_THRESHOLDS[i]) tier = i;
  }
  return tier;
}

// legendaryBonus: số lần góp ý được duyệt SAU KHI đã đạt bậc 5 — chỉ có ý nghĩa hiển thị
// khi đang ở đúng bậc 5 (xem addContributorPoints trong contributors.js).
export function getBadge(categoryId, points, legendaryBonus = 0) {
  const category = getCategory(categoryId);
  if (!category) return null;
  const tierIndex = getTierIndex(points);
  const nextThreshold = TIER_THRESHOLDS[tierIndex + 1] ?? null;
  const isLegendary = tierIndex === TIER_THRESHOLDS.length - 1;
  return {
    categoryId,
    categoryLabel: category.label,
    icon: category.icon,
    tierIndex,
    tierName: category.tiers[tierIndex],
    pointsToNextTier: nextThreshold !== null ? nextThreshold - points : null,
    bonusCount: isLegendary ? legendaryBonus : 0,
  };
}
