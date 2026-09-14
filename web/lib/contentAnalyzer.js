import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { CONTENT_INPUT_TYPE } from "./contentInbox.js";
import { eventLocalDate, TIME_PRECISION, VERIFICATION } from "./events.js";

const FETCH_TIMEOUT_MS = 8000;
const DNS_TIMEOUT_MS = 2500;
const MAX_FETCH_BYTES = 750000;
const MAX_URLS_TO_FETCH = 5;

function plainText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(html) {
  const title = decodeHtml(
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
      ""
  ).trim();
  const body = decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
  return title ? `${title}\n${body}` : body;
}

function privateIpv4(address) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return true;
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] >= 224
  );
}

function privateAddress(address) {
  if (isIP(address) === 4) return privateIpv4(address);
  if (isIP(address) !== 6) return true;
  const normalized = address.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

async function assertPublicUrl(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("URL không được hỗ trợ.");
  if (url.username || url.password || url.port) throw new Error("URL không an toàn để đọc tự động.");
  const addresses = await Promise.race([
    lookup(url.hostname, { all: true, verbatim: true }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Quá thời gian tìm địa chỉ nguồn.")), DNS_TIMEOUT_MS);
    }),
  ]);
  if (addresses.length === 0 || addresses.some(({ address }) => privateAddress(address))) {
    throw new Error("URL trỏ tới mạng nội bộ nên không được đọc.");
  }
  return url;
}

async function fetchPublicText(value) {
  let current = value;
  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    const safeUrl = await assertPublicUrl(current);
    const response = await fetch(safeUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "ChamDiaPhuong-ContentInbox/1.0" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Nguồn thiếu địa chỉ chuyển tiếp.");
      current = new URL(location, safeUrl).toString();
      continue;
    }
    if (!response.ok) throw new Error(`Nguồn trả về mã ${response.status}.`);
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new Error("Link không phải trang chữ có thể phân tích.");
    }
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_FETCH_BYTES) {
      throw new Error("Trang nguồn quá lớn để đọc tự động.");
    }
    const body = (await response.text()).slice(0, MAX_FETCH_BYTES);
    return { url: safeUrl.toString(), text: contentType.includes("html") ? htmlToText(body) : body };
  }
  throw new Error("Link chuyển tiếp quá nhiều lần.");
}

function dateParts(text) {
  const match = text.match(/(?:ngày\s*)?([0-3]?\d)[\/-]([01]?\d)[\/-](20\d{2})/i);
  if (!match) return { date: null, dateText: null };
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (parsed.getUTCDate() !== day || parsed.getUTCMonth() + 1 !== month) {
    return { date: null, dateText: match[0] };
  }
  return { date, dateText: match[0] };
}

function eventTime(text) {
  const exact = text.match(/(?:\b|lúc\s+)([01]?\d|2[0-3])(?:\s*(?:h|giờ|:))\s*([0-5]\d)?\b/i);
  if (exact) {
    const hour = Number(exact[1]);
    const minute = Number(exact[2] ?? 0);
    return { timePrecision: TIME_PRECISION.EXACT, timeText: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
  }
  if (/\b(buổi\s+)?tối\b/i.test(text)) return { timePrecision: TIME_PRECISION.EVENING, timeText: "Buổi tối" };
  if (/\b(buổi\s+)?chiều\b/i.test(text)) return { timePrecision: TIME_PRECISION.AFTERNOON, timeText: "Buổi chiều" };
  if (/\b(buổi\s+)?sáng\b/i.test(text)) return { timePrecision: TIME_PRECISION.MORNING, timeText: "Buổi sáng" };
  if (/\bcả ngày\b/i.test(text)) return { timePrecision: TIME_PRECISION.DAY, timeText: "Cả ngày" };
  return { timePrecision: TIME_PRECISION.UNKNOWN, timeText: null };
}

function meaningfulTitle(text) {
  const lines = text.split(/\r?\n/).map(plainText).filter((line) => line.length >= 8);
  const labelled = lines.find((line) => /^(?:tiêu đề|sự kiện|chương trình)\s*:/i.test(line));
  const candidate = labelled?.replace(/^[^:]+:\s*/, "") ?? lines[0] ?? "";
  return candidate.replace(/^(?:thông báo|tin mới)\s*[:\-–]\s*/i, "").slice(0, 180) || null;
}

function labelledValue(text, labels) {
  const expression = new RegExp(`(?:^|\\n)\\s*(?:${labels})\\s*[:\\-–]\\s*([^\\n]+)`, "im");
  return plainText(text.match(expression)?.[1]).slice(0, 220) || null;
}

function locationOf(text) {
  const labelled = labelledValue(text, "địa điểm|địa chỉ|khu vực");
  if (labelled) return labelled;
  const match = text.match(/\b(?:tại|ở)\s+([^.;\n]{5,180})/i);
  return plainText(match?.[1]).slice(0, 180) || null;
}

function sourceOf(text, sourceUrls) {
  const labelled = labelledValue(text, "nguồn|đơn vị tổ chức|đơn vị đăng");
  if (labelled) return labelled;
  if (sourceUrls.length > 0) {
    try {
      return new URL(sourceUrls[0]).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }
  const official = text.match(/\b(UBND\s+[^.;\n]{3,100})/i);
  return plainText(official?.[1]).slice(0, 120) || null;
}

function topicOf(text) {
  if (/trung thu|thành tuyên|mô hình đèn|rước đèn/i.test(text)) return "Trung thu / Lễ hội Thành Tuyên";
  if (/lễ hội|đêm hội|khai mạc|bế mạc|hội chợ/i.test(text)) return "Lễ hội / sự kiện";
  return "Chưa xác định";
}

function regionOf(text) {
  const candidates = ["Nông Tiến", "Tuyên Quang", "Mỹ Lâm", "Minh Xuân", "An Tường"];
  const found = candidates.filter((name) => text.toLocaleLowerCase("vi").includes(name.toLocaleLowerCase("vi")));
  return found.length > 0 ? found.join(", ") : labelledValue(text, "khu vực");
}

function normalizedWords(value) {
  return new Set(
    plainText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 3)
  );
}

function compareEvent(candidate, events) {
  if (!candidate) return { changeType: "needs_review", matchedEventId: null, note: "Chưa đủ dữ liệu để so sánh lịch." };
  const candidateWords = normalizedWords(candidate.title);
  let best = null;
  for (const event of events) {
    const eventWords = normalizedWords(event.title);
    const shared = [...candidateWords].filter((word) => eventWords.has(word)).length;
    const titleScore = shared / Math.max(1, Math.min(candidateWords.size, eventWords.size));
    const sameDate = Boolean(candidate.date && candidate.date === eventLocalDate(event));
    const score = titleScore + (sameDate ? 0.5 : 0);
    if (!best || score > best.score) best = { event, score, sameDate };
  }
  if (best && best.score >= 0.85) {
    return {
      changeType: "possible_update",
      matchedEventId: best.event.id,
      matchedEventTitle: best.event.title,
      note: best.sameDate ? "Có thể trùng một mốc cùng ngày; cần duyệt phần khác biệt." : "Có thể là cập nhật cho một mốc đang có.",
    };
  }
  return { changeType: "new_event", matchedEventId: null, note: "Chưa thấy mốc đủ giống trong lịch hiện tại." };
}

function extractPreview(text, sourceUrls, events) {
  const { date, dateText } = dateParts(text);
  const { timePrecision, timeText } = eventTime(text);
  const eventLike = /sự kiện|lễ hội|đêm hội|chương trình|khai mạc|bế mạc|hội chợ|thi mô hình|rước đèn|văn nghệ/i.test(text);
  const title = meaningfulTitle(text);
  const location = locationOf(text);
  const sourceName = sourceOf(text, sourceUrls);
  const warnings = [];
  if (!eventLike) warnings.push("Chưa chắc đây là nội dung sự kiện.");
  if (!date) warnings.push(dateText ? "Ngày ghi trong nguồn không hợp lệ." : "Chưa tìm thấy ngày có đủ năm; hệ thống không tự đoán năm.");
  if (!location) warnings.push("Chưa tìm thấy địa điểm rõ ràng.");
  if (timePrecision === TIME_PRECISION.UNKNOWN) warnings.push("Chưa tìm thấy giờ hoặc buổi diễn ra.");
  let confidence = 25;
  if (eventLike) confidence += 20;
  if (title) confidence += 10;
  if (date) confidence += 20;
  if (location) confidence += 10;
  if (sourceName) confidence += 10;
  const candidate = eventLike
    ? {
        title,
        date,
        dateText,
        timePrecision,
        timeText,
        location,
        verificationStatus: /dự kiến|kế hoạch|tạm thời/i.test(text) ? VERIFICATION.TENTATIVE : VERIFICATION.UPDATING,
        sourceName,
      }
    : null;
  return {
    method: "rules",
    detectedType: eventLike ? "event" : "unknown",
    topic: topicOf(text),
    region: regionOf(text),
    relatedPostSlug: /trung thu|thành tuyên|mô hình đèn|rước đèn/i.test(text) ? "le-hoi-thanh-tuyen" : null,
    relatedPostTitle: /trung thu|thành tuyên|mô hình đèn|rước đèn/i.test(text) ? "Lễ hội Thành Tuyên 2026" : null,
    candidate,
    comparison: compareEvent(candidate, events),
    confidence: Math.min(confidence, 95),
    warnings,
  };
}

export async function analyzeContentInboxInput(parsed, events = []) {
  let text = parsed.inputType === CONTENT_INPUT_TYPE.TEXT ? parsed.rawContent : "";
  const fetchedSources = [];
  const fetchWarnings = [];
  if (parsed.sourceUrls.length > 0) {
    const urls = parsed.sourceUrls.slice(0, MAX_URLS_TO_FETCH);
    const results = await Promise.allSettled(urls.map(fetchPublicText));
    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      if (result.status === "fulfilled") {
        fetchedSources.push({ url: result.value.url, fetched: true });
        text += `\n${result.value.text}`;
      } else {
        fetchedSources.push({ url: urls[index], fetched: false });
        fetchWarnings.push(`Không đọc được ${new URL(urls[index]).hostname}; hãy dán nội dung bài nếu cần phân tích đủ.`);
      }
    }
    if (parsed.sourceUrls.length > MAX_URLS_TO_FETCH) {
      fetchWarnings.push(`Lần này chỉ đọc ${MAX_URLS_TO_FETCH} link đầu để tránh chờ quá lâu.`);
    }
  }
  const usableText = plainText(text);
  if (!usableText) {
    return {
      method: "rules",
      detectedType: "unknown",
      topic: "Chưa xác định",
      region: null,
      relatedPostSlug: null,
      relatedPostTitle: null,
      candidate: null,
      comparison: { changeType: "needs_content", matchedEventId: null, note: "Chưa lấy được nội dung để so sánh." },
      confidence: 0,
      warnings: fetchWarnings,
      fetchedSources,
    };
  }
  const preview = extractPreview(text, parsed.sourceUrls, events);
  return { ...preview, warnings: [...fetchWarnings, ...preview.warnings], fetchedSources };
}
