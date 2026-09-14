import { redis } from "./redis.js";

const ABOUT_PAGE_KEY = "site_content:about";

export const ABOUT_PAGE_LIMITS = {
  label: 80,
  title: 140,
  short: 300,
  body: 2400,
  source: 400,
};

export const DEFAULT_ABOUT_PAGE = {
  version: 1,
  hero: {
    label: "CDP là gì?",
    title: "Chạm Địa Phương là gì?",
    slogan: "Gom chỗ hay. Chia sẻ dễ dàng.",
    subheadline: "Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.",
  },
  what: {
    title: "CDP là gì?",
    body: "Chạm Địa Phương giúp bạn tìm những chỗ đang có ở địa phương, gom chúng thành một Sổ hoặc Lộ trình rồi gửi cho bạn bè bằng một link. Không cần cài ứng dụng và người nhận không cần đăng nhập chỉ để xem.",
  },
  why: {
    title: "Cụ thể là?",
    body: "Khi cần chọn chỗ ăn, đi chơi hoặc lên lịch cho một nhóm bạn, thông tin thường nằm rải rác ở nhiều nơi. Người địa phương lại biết nhiều chi tiết thực tế mà danh bạ thông thường không thể hiện rõ: chỗ gửi xe, lối vào, giờ đông, cách đặt xe hay những thay đổi chỉ mới xảy ra.\n\nCDP gom những dữ liệu đó thành một cấu trúc dễ dùng và dễ chia sẻ.",
  },
  how: {
    title: "CDP hoạt động như thế nào?",
    steps: [
      {
        title: "CDP gợi ý địa điểm",
        body: "Danh bạ giúp bạn bắt đầu nhanh, thay vì phải nhập lại mọi nơi từ đầu.",
      },
      {
        title: "Người dùng cập nhật dữ liệu sống",
        body: "Các thông tin chọn sẵn có thể được cộng đồng xác nhận. Mẹo dạng chữ phải qua admin duyệt trước khi công khai.",
      },
      {
        title: "Bạn tạo Sổ hoặc Lộ trình",
        body: "Gom các địa điểm, thêm ghi chú riêng nếu muốn rồi gửi một link cho người khác. Người nhận có thể lưu thành Sổ của họ và chỉnh tiếp.",
      },
    ],
  },
  not: {
    title: "CDP không phải gì?",
    body: "CDP không phải trang review, không có chấm sao, bình luận hay diễn đàn. Nội dung công khai tập trung vào thông tin có cấu trúc, độ mới và các mẹo thực tế đã qua kiểm soát.",
  },
  sources: {
    title: "Dữ liệu CDP đến từ đâu?",
    items: [
      "Dữ liệu công khai được CDP tổng hợp.",
      "Thông tin do CDP hoặc admin nhập và cập nhật.",
      "Các lựa chọn được người dùng xác nhận.",
      "Địa điểm mới do người dùng đề xuất và chờ CDP kiểm tra.",
      "Mẹo người dùng nhập vào và qua admin duyệt trước khi công khai.",
    ],
  },
  freshness: {
    title: "Độ mới và độ trễ",
    body: "Thông tin trên Chạm Địa Phương được tổng hợp từ dữ liệu công khai, CDP và đóng góp của người dùng. Một số thông tin như giờ mở cửa, giá, số điện thoại hoặc tình trạng hoạt động có thể thay đổi trước khi CDP kịp cập nhật. Hãy xem thời điểm cập nhật và mức xác nhận của từng thông tin khi sử dụng.",
    detail: "Một địa điểm mới mở hoặc vừa đóng cửa có thể cần thời gian để được người dùng hoặc CDP xác nhận. CDP ưu tiên hiển thị trạng thái cập nhật và tín hiệu xác nhận thay vì giả định dữ liệu luôn đúng.",
  },
  ownership: {
    title: "Sổ, Lộ trình và danh bạ",
    highlight: "Sổ và Lộ trình thuộc về người tạo; danh bạ công khai thuộc về CDP.",
    body: "Bạn có thể lưu địa điểm CDP, thêm ghi chú riêng, thêm điểm riêng hoặc đề xuất địa điểm mới. Địa điểm đề xuất chưa duyệt không tự trở thành địa điểm công khai; mẹo dạng chữ cũng không tự công khai. Dữ liệu công khai vẫn đi theo cơ chế xác nhận hoặc duyệt hiện có của CDP.",
  },
  ctas: {
    primaryLabel: "Tạo một Sổ địa phương",
    secondaryLabel: "Khám phá địa điểm",
  },
};

export function aboutPageKey() {
  const namespace = process.env.CDP_SITE_CONTENT_NAMESPACE?.trim();
  return namespace ? `${namespace}:${ABOUT_PAGE_KEY}` : ABOUT_PAGE_KEY;
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

function cleanPair(value, limits = {}) {
  const title = cleanText(value?.title, limits.title ?? ABOUT_PAGE_LIMITS.title);
  const body = cleanText(value?.body, limits.body ?? ABOUT_PAGE_LIMITS.body);
  return title && body ? { title, body } : null;
}

/**
 * Redis không được coi là dữ liệu render tin cậy. Trang public chỉ nhận đúng cấu trúc P0;
 * link CTA vẫn do code kiểm soát và React chỉ render chuỗi chữ, không render HTML tự do.
 */
export function normalizeAboutPage(value) {
  if (!value || typeof value !== "object" || value.version !== 1) return null;

  const hero = {
    label: cleanText(value.hero?.label, ABOUT_PAGE_LIMITS.label),
    title: cleanText(value.hero?.title, ABOUT_PAGE_LIMITS.title),
    slogan: cleanText(value.hero?.slogan, ABOUT_PAGE_LIMITS.short),
    subheadline: cleanText(value.hero?.subheadline, ABOUT_PAGE_LIMITS.short),
  };
  if (Object.values(hero).some((item) => !item)) return null;

  const what = cleanPair(value.what);
  const why = cleanPair(value.why);
  const not = cleanPair(value.not);
  if (!what || !why || !not) return null;

  const howTitle = cleanText(value.how?.title, ABOUT_PAGE_LIMITS.title);
  if (!howTitle || !Array.isArray(value.how?.steps) || value.how.steps.length !== 3) return null;
  const steps = value.how.steps.map((step) => cleanPair(step));
  if (steps.some((step) => !step)) return null;

  const sourcesTitle = cleanText(value.sources?.title, ABOUT_PAGE_LIMITS.title);
  if (!sourcesTitle || !Array.isArray(value.sources?.items) || value.sources.items.length !== 5) {
    return null;
  }
  const sourceItems = value.sources.items.map((item) => cleanText(item, ABOUT_PAGE_LIMITS.source));
  if (sourceItems.some((item) => !item)) return null;

  const freshnessTitle = cleanText(value.freshness?.title, ABOUT_PAGE_LIMITS.title);
  const freshnessBody = cleanText(value.freshness?.body, ABOUT_PAGE_LIMITS.body);
  const freshnessDetail = cleanText(value.freshness?.detail, ABOUT_PAGE_LIMITS.body);
  if (!freshnessTitle || !freshnessBody || !freshnessDetail) return null;

  const ownershipTitle = cleanText(value.ownership?.title, ABOUT_PAGE_LIMITS.title);
  const ownershipHighlight = cleanText(value.ownership?.highlight, ABOUT_PAGE_LIMITS.short);
  const ownershipBody = cleanText(value.ownership?.body, ABOUT_PAGE_LIMITS.body);
  if (!ownershipTitle || !ownershipHighlight || !ownershipBody) return null;

  const primaryLabel = cleanText(value.ctas?.primaryLabel, ABOUT_PAGE_LIMITS.label);
  const secondaryLabel = cleanText(value.ctas?.secondaryLabel, ABOUT_PAGE_LIMITS.label);
  if (!primaryLabel || !secondaryLabel) return null;

  return {
    version: 1,
    hero,
    what,
    why,
    how: { title: howTitle, steps },
    not,
    sources: { title: sourcesTitle, items: sourceItems },
    freshness: { title: freshnessTitle, body: freshnessBody, detail: freshnessDetail },
    ownership: { title: ownershipTitle, highlight: ownershipHighlight, body: ownershipBody },
    ctas: { primaryLabel, secondaryLabel },
  };
}

function formText(formData, name) {
  return formData.get(name)?.toString() ?? "";
}

export function aboutPageFromFormData(formData) {
  const candidate = {
    version: 1,
    hero: {
      label: formText(formData, "heroLabel"),
      title: formText(formData, "heroTitle"),
      slogan: formText(formData, "heroSlogan"),
      subheadline: formText(formData, "heroSubheadline"),
    },
    what: { title: formText(formData, "whatTitle"), body: formText(formData, "whatBody") },
    why: { title: formText(formData, "whyTitle"), body: formText(formData, "whyBody") },
    how: {
      title: formText(formData, "howTitle"),
      steps: [1, 2, 3].map((number) => ({
        title: formText(formData, `step${number}Title`),
        body: formText(formData, `step${number}Body`),
      })),
    },
    not: { title: formText(formData, "notTitle"), body: formText(formData, "notBody") },
    sources: {
      title: formText(formData, "sourcesTitle"),
      items: [1, 2, 3, 4, 5].map((number) => formText(formData, `source${number}`)),
    },
    freshness: {
      title: formText(formData, "freshnessTitle"),
      body: formText(formData, "freshnessBody"),
      detail: formText(formData, "freshnessDetail"),
    },
    ownership: {
      title: formText(formData, "ownershipTitle"),
      highlight: formText(formData, "ownershipHighlight"),
      body: formText(formData, "ownershipBody"),
    },
    ctas: {
      primaryLabel: formText(formData, "primaryCtaLabel"),
      secondaryLabel: formText(formData, "secondaryCtaLabel"),
    },
  };
  return normalizeAboutPage(candidate);
}

export async function getAboutPageContent() {
  try {
    const stored = normalizeAboutPage(await redis.get(aboutPageKey()));
    return stored ?? DEFAULT_ABOUT_PAGE;
  } catch {
    // Trang giới thiệu vẫn phải mở được khi Redis tạm lỗi; bản deploy là lưới an toàn.
    return DEFAULT_ABOUT_PAGE;
  }
}

export async function setAboutPageContent(value) {
  const normalized = normalizeAboutPage(value);
  if (!normalized) throw new Error("Nội dung trang Giới thiệu không hợp lệ.");
  await redis.set(aboutPageKey(), normalized);
  return normalized;
}
