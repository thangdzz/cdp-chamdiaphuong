import Anthropic from "@anthropic-ai/sdk";

// Lớp 3 (SPEC-chang-5.md §3) — AI đọc 1 lượt, hỏi đúng 1 việc: đúng câu hỏi + lành mạnh
// không. Dùng Haiku 4.5 — việc chỉ là phân loại OK/LOẠI 1 câu ngắn, không cần model mạnh.
const MODEL = "claude-haiku-4-5";

function buildPrompt(question, text) {
  return `Câu hỏi: "${question}"
Câu trả lời của người dùng: "${text}"

Câu trả lời này có đang trả lời đúng câu hỏi trên không, và có phải nội dung
lành mạnh về một địa điểm ở Tuyên Quang không?
Trả lời đúng 1 từ: OK hoặc LOAI`;
}

// Gọi AI lỗi/hết hạn mức -> cho qua vào hàng chờ (verdict "OK"), admin vẫn duyệt ở lớp 4.
// Không được để lỗi AI chặn người dùng thật (SPEC §3, chi tiết lớp 3).
export async function checkNoteWithAi({ question, text }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { verdict: "OK" };
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 10,
      messages: [{ role: "user", content: buildPrompt(question, text) }],
    });
    const answer = response.content
      .find((block) => block.type === "text")
      ?.text?.trim()
      .toUpperCase();
    return { verdict: answer?.startsWith("LOAI") ? "LOAI" : "OK" };
  } catch {
    return { verdict: "OK" };
  }
}
