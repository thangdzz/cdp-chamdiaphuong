import { getQuestionsForType } from "@/lib/questions";

function formatValue(question, value) {
  if (question.multi) {
    return value
      .map((v) => question.options.find((o) => o.value === v)?.label ?? v)
      .join(" · ");
  }
  return question.options.find((o) => o.value === value)?.label ?? value;
}

// Khối "thuộc tính" đúc từ đồng thuận (SPEC-chang-2.md §3.3) — thuần hiển thị, không cần
// "use client". consensus = 1 field của place_answers:consensus (đã đọc sẵn ở page.js).
export function PlaceFacts({ type, consensus }) {
  if (!consensus) return null;

  const rows = getQuestionsForType(type)
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
          <span>{formatValue(question, c.value)}</span>
          {c.weak && (
            <span className="ml-1.5 text-xs text-zinc-400">({c.votes} người cho biết)</span>
          )}
        </div>
      ))}
    </div>
  );
}
