import { getQuestionsForType } from "@/lib/questions";

function optionLabel(question, value) {
  return question.options.find((o) => o.value === value)?.label ?? value;
}

// `showCounts` (hiện chỉ bật cho "Loại xe") kèm số người xác nhận SAU TỪNG giá trị, đúng ý
// NOTE-06 §8: "4 chỗ → 3 xác nhận, 7 chỗ → 5 xác nhận". Không bật mặc định cho mọi câu nhiều
// lựa chọn vì "Tiền mặt (3) · Chuyển khoản (2)" chỉ làm thẻ rối chứ không giúp quyết định gì.
function formatValue(question, consensus) {
  const { value, counts } = consensus;
  if (!question.multi) return optionLabel(question, value);
  return value
    .map((v) => {
      const label = optionLabel(question, v);
      const n = question.showCounts ? counts?.[v] : null;
      return n ? `${label} (${n})` : label;
    })
    .join(" · ");
}

// Khối "thuộc tính" đúc từ đồng thuận (SPEC-chang-2.md §3.3) — thuần hiển thị, không cần
// "use client". consensus = 1 field của place_answers:consensus (đã đọc sẵn ở page.js).
export function PlaceFacts({ type, consensus, subtype = null, filledFields = [], family = undefined }) {
  if (!consensus) return null;

  const rows = getQuestionsForType(type, subtype, filledFields, family)
    .map((question) => {
      const c = consensus[question.id];
      if (!c || !c.value || (Array.isArray(c.value) && c.value.length === 0)) return null;
      return { question, consensus: c };
    })
    .filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 text-sm text-zinc-700">
      {rows.map(({ question, consensus: c }) => (
        <div key={question.id} className={c.weak ? "opacity-60" : ""}>
          <span className="mr-1">{question.icon}</span>
          <span className="text-zinc-500">{question.label}: </span>
          <span>{formatValue(question, c)}</span>
          {c.weak && (
            <span className="ml-1.5 text-xs text-zinc-400">({c.votes} người cho biết)</span>
          )}
        </div>
      ))}
    </div>
  );
}
