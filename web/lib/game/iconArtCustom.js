// Hình hero CDP tự vẽ (viewBox 512) cho chỗ game-icons.net không có hình đúng nghĩa (NOTE-07 §10).
// Viết tay, sửa trực tiếp được. Cùng khuôn với ICON_ART trong iconArt.js.

function circle(cx, cy, r) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
}

function star(cx, cy, points, outer, inner, rotate = -Math.PI / 2) {
  const coords = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotate + (i * Math.PI) / points;
    coords.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${coords.join("L")}z`;
}

// Vành răng cưa giữa hai vòng tròn — gợi các vành hoa văn trên mặt trống.
function toothRing(cx, cy, count, rInner, rOuter) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const a0 = (i / count) * Math.PI * 2;
    const a1 = ((i + 0.5) / count) * Math.PI * 2;
    const a2 = ((i + 1) / count) * Math.PI * 2;
    const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    parts.push(`M${p(rInner, a0)}L${p(rOuter, a1)}L${p(rInner, a2)}z`);
  }
  return parts.join("");
}

export const CUSTOM_ICON_ART = {
  // Mặt trống đồng Đông Sơn nhìn chính diện: ngôi sao nhiều cánh ở tâm + các vành hoa văn.
  "bronze-drum-face": {
    paths: [
      `${circle(256, 256, 236)}${circle(256, 256, 214)}`,
      `${circle(256, 256, 196)}${circle(256, 256, 184)}`,
      toothRing(256, 256, 28, 150, 176),
      `${circle(256, 256, 138)}${circle(256, 256, 128)}`,
      star(256, 256, 14, 112, 42),
    ],
    fillRule: "evenodd",
    author: "CDP",
    url: null,
  },
  // Bí ẩn: đèn lồng có dấu hỏi khoét rỗng (NOTE-06 §10, NOTE-07 §6 "Unknown").
  "mystery-lantern": {
    paths: [
      "M248 40h16v66h-16z",
      "M190 100h132a10 10 0 0 1 10 10v18H180v-18a10 10 0 0 1 10-10z",
      "M180 404h152v18a10 10 0 0 1-10 10H190a10 10 0 0 1-10-10z",
      "M246 432h20v34l14 14h-48l14-14z",
      // Thân đèn + dấu hỏi khoét (evenodd).
      "M256 136c140 0 172 66 172 134s-32 134-172 134S84 338 84 270s32-134 172-134z" +
        "M254 186c-44 0-72 26-74 64h44c2-16 12-26 30-26 18 0 30 11 30 26 0 13-7 22-24 33-24 15-34 32-34 60v10h42v-6c0-17 7-26 26-39 26-17 38-36 38-62 0-38-32-60-78-60z" +
        "M230 344h46v44h-46z",
    ],
    fillRule: "evenodd",
    author: "CDP",
    url: null,
  },
};
