// Câu hỏi bấm chọn + đồng thuận (Chặng 2) — SPEC-chang-2.md §4, §5. Đọc-cả-mảng-rồi-ghi-lại
// KHÔNG dùng ở đây (thao tác của khách, nhiều người bấm cùng lúc) — mỗi thao tác là 1-2 lệnh
// Redis nguyên tử theo field, giống nguyên tắc đã áp dụng ở lib/checkins.js (Chặng 1).

import { redis } from "./redis.js";
import { getQuestion, getQuestionsForType } from "./questions.js";
import { trySpendDailyPoints } from "./pointsCap.js";
import { addContributorPoints } from "./contributors.js";

const CONSENSUS_KEY = "place_answers:consensus";

const DAILY_QUESTION_CAP = 5;
const DAILY_QUESTION_TTL_SECONDS = 48 * 60 * 60;
const SKIP_TTL_SECONDS = 30 * 24 * 60 * 60;

const SIX_MONTHS_DAYS = 182;
const TWELVE_MONTHS_DAYS = 365;

function votesKey(placeId) {
  return `place_answers:votes:${placeId}`;
}

function countKey(anonId, placeId, dateStr) {
  return `answers:count:${anonId}:${placeId}:${dateStr}`;
}

function skipKey(anonId, placeId, questionId) {
  return `answers:skip:${anonId}:${placeId}:${questionId}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getAllConsensus() {
  const data = await redis.hgetall(CONSENSUS_KEY);
  return data ?? {};
}

export async function getVotesForPlace(placeId) {
  const data = await redis.hgetall(votesKey(placeId));
  return data ?? {};
}

export async function hasSkippedRecently(anonId, placeId, questionId) {
  const exists = await redis.exists(skipKey(anonId, placeId, questionId));
  return exists === 1;
}

export async function hasReachedDailyCap(anonId, placeId) {
  const count = await redis.get(countKey(anonId, placeId, todayStr()));
  return (count ?? 0) >= DAILY_QUESTION_CAP;
}

export async function skipQuestion({ anonId, placeId, questionId }) {
  if (!anonId || !placeId || !questionId) return { ok: false };
  await redis.set(skipKey(anonId, placeId, questionId), 1, { ex: SKIP_TTL_SECONDS });
  return { ok: true };
}

// Trọng số theo tuổi phiếu (§5.1) — cơ chế tự dọn rác, tính lúc chốt đồng thuận, không cron.
function voteWeight(atIso) {
  const ageDays = (Date.now() - new Date(atIso).getTime()) / 86400000;
  if (ageDays < SIX_MONTHS_DAYS) return 1;
  if (ageDays < TWELVE_MONTHS_DAYS) return 0.5;
  return 0.1;
}

// votes: mảng {anonId, answer, at, awarded} của ĐÚNG 1 câu hỏi tại 1 chỗ.
function computeConsensus(question, votes) {
  if (votes.length === 0) return null;

  if (question.multi) {
    const weight = {};
    for (const v of votes) {
      for (const opt of v.answer ?? []) weight[opt] = (weight[opt] ?? 0) + voteWeight(v.at);
    }
    const accepted = Object.keys(weight).filter((opt) => weight[opt] >= 2);
    if (accepted.length === 0) return null;
    return { value: accepted, votes: votes.length, weak: false };
  }

  const weight = {};
  for (const v of votes) weight[v.answer] = (weight[v.answer] ?? 0) + voteWeight(v.at);
  const entries = Object.entries(weight).sort((a, b) => b[1] - a[1]);
  if (entries.length > 1 && entries[0][1] === entries[1][1]) return null; // hoà -> không hiện gì
  const [value, topWeight] = entries[0];
  const matchingCount = votes.filter((v) => v.answer === value).length;
  return { value, votes: matchingCount, weak: topWeight < 2 };
}

function sameAnswerValue(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    const setA = new Set(Array.isArray(a) ? a : [a]);
    const setB = new Set(Array.isArray(b) ? b : [b]);
    return setA.size === setB.size && [...setA].every((v) => setB.has(v));
  }
  return a === b;
}

function isCredited(question, consensus, vote) {
  if (!consensus) return false;
  if (question.multi) return (vote.answer ?? []).some((a) => consensus.value.includes(a));
  return vote.answer === consensus.value;
}

// Chọn đúng 1 câu để hỏi (§3.2). Chỉ chạy khi khách bung 1 thẻ cụ thể (không chạy cho mọi
// chỗ lúc tải trang) — 1 HGETALL (phiếu) + 1 HGET (đồng thuận) + 1 pipeline EXISTS (đã bấm
// "Không rõ" chưa, gộp N lệnh độc lập vào 1 lượt gọi mạng) cho mỗi lần khách bung thẻ.
export async function getNextQuestion({ type, placeId, anonId }) {
  if (await hasReachedDailyCap(anonId, placeId)) return null;

  const questions = getQuestionsForType(type);
  const [votes, placeConsensus] = await Promise.all([
    getVotesForPlace(placeId),
    redis.hget(CONSENSUS_KEY, placeId),
  ]);
  const consensus = placeConsensus ?? {};

  const unanswered = questions.filter((q) => !votes[`${q.id}:${anonId}`]);
  if (unanswered.length === 0) return null;

  const pipeline = redis.pipeline();
  for (const q of unanswered) pipeline.exists(skipKey(anonId, placeId, q.id));
  const skipResults = await pipeline.exec();

  const candidates = [];
  unanswered.forEach((q, i) => {
    if (skipResults[i] === 1) return; // đã bấm "Không rõ" cho câu này trong 30 ngày

    const questionVotes = Object.entries(votes)
      .filter(([k]) => k.startsWith(`${q.id}:`))
      .map(([, v]) => v);

    const qConsensus = consensus[q.id];
    if (qConsensus && questionVotes.length > 0) {
      const newestAt = questionVotes.reduce(
        (max, v) => (new Date(v.at) > new Date(max) ? v.at : max),
        questionVotes[0].at
      );
      const ageDays = (Date.now() - new Date(newestAt).getTime()) / 86400000;
      if (ageDays < SIX_MONTHS_DAYS) return; // đồng thuận còn mới (dưới 6 tháng), bỏ qua
    }

    const votesCount = questionVotes.length;
    const priority = votesCount === 0 ? 1 : votesCount === 1 ? 2 : 3;
    const oldestAt = questionVotes.reduce(
      (min, v) => (new Date(v.at) < new Date(min) ? v.at : min),
      questionVotes[0]?.at ?? new Date().toISOString()
    );

    candidates.push({ question: q, priority, oldestAt });
  });

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.priority - b.priority || new Date(a.oldestAt) - new Date(b.oldestAt));
  return candidates[0].question;
}

// Thứ tự bắt buộc (giống Chặng 1: chặn trước, tính điểm sau):
// 1. Trần 5 câu/chỗ/ngày — vượt thì từ chối ngay, KHÔNG ghi phiếu.
// 2. Ghi phiếu (HSET theo field, nguyên tử, không đụng phiếu người khác).
// 3. Tính lại đồng thuận CHỈ cho câu vừa bấm, ghi vào bảng đã tính sẵn.
// 4. Thưởng điểm hồi tố cho các phiếu vừa đủ đồng thuận, có xin phép trần chung 30đ/ngày.
export async function submitAnswer({ anonId, placeId, questionId, answer, text }) {
  const question = getQuestion(questionId);
  if (!question || !anonId || !placeId || answer == null) return { ok: false };

  // Server Action luôn gọi được trực tiếp bất kể giao diện — tự kiểm tra khuôn dạng, không
  // tin dữ liệu từ client (đúng khuyến nghị Next.js §data-security).
  const validValues = new Set(question.options.map((o) => o.value));
  const answerValid = question.multi
    ? Array.isArray(answer) && answer.length > 0 && answer.every((a) => validValues.has(a))
    : !Array.isArray(answer) && validValues.has(answer);
  if (!answerValid) return { ok: false };

  const date = todayStr();
  const cKey = countKey(anonId, placeId, date);
  const count = await redis.incr(cKey);
  if (count === 1) await redis.expire(cKey, DAILY_QUESTION_TTL_SECONDS);
  if (count > DAILY_QUESTION_CAP) return { ok: false, capped: true };

  const vKey = votesKey(placeId);
  const field = `${questionId}:${anonId}`;
  const existing = await redis.hget(vKey, field);
  const at = existing?.at ?? new Date().toISOString(); // đổi ý không mất mốc "người đầu tiên"
  // §6 quy tắc 1: bấm lại ĐÚNG đáp án cũ không phải "đổi ý" — giữ nguyên awarded để không
  // cộng điểm lần hai. Chỉ reset awarded khi đáp án thực sự đổi (cần tính lại đồng thuận).
  const awarded = existing && sameAnswerValue(existing.answer, answer) ? existing.awarded : false;
  await redis.hset(vKey, { [field]: { answer, at, text: text ?? null, awarded } });

  const allVotes = await redis.hgetall(vKey);
  const votesForQuestion = Object.entries(allVotes ?? {})
    .filter(([k]) => k.startsWith(`${questionId}:`))
    .map(([k, v]) => ({ anonId: k.slice(questionId.length + 1), ...v }));

  const consensus = computeConsensus(question, votesForQuestion);

  const placeConsensus = (await redis.hget(CONSENSUS_KEY, placeId)) ?? {};
  if (consensus) placeConsensus[questionId] = consensus;
  else delete placeConsensus[questionId];
  await redis.hset(CONSENSUS_KEY, { [placeId]: placeConsensus });

  // §5.3: chỉ cộng điểm khi đồng thuận đạt ĐỦ 2 phiếu thật trở lên. Với câu 1 đáp án,
  // consensus vẫn được ghi (và hiện mờ) ngay từ phiếu đầu tiên (weak: true, §3.3) — nhưng
  // đó là để HIỂN THỊ, không phải để trả điểm. Câu nhiều đáp án tự nhiên đã đúng vì 1 phiếu
  // không bao giờ đủ trọng số (tối đa 1.0) để vượt ngưỡng 2 của computeConsensus ở trên.
  let pointsAwardedToCaller = 0;
  if (consensus && consensus.votes >= 2) {
    const firstVote = votesForQuestion.reduce((a, b) => (new Date(a.at) <= new Date(b.at) ? a : b));
    const newlyCredited = votesForQuestion.filter((v) => !v.awarded && isCredited(question, consensus, v));

    for (const v of newlyCredited) {
      const amount = v.anonId === firstVote.anonId ? 3 : 1; // +1 thường, +2 thêm cho người đầu tiên
      const allowed = await trySpendDailyPoints(v.anonId, amount);
      if (allowed) await addContributorPoints(v.anonId, amount);
      await redis.hset(vKey, { [`${questionId}:${v.anonId}`]: { ...v, awarded: true } });
      if (v.anonId === anonId && allowed) pointsAwardedToCaller = amount;
    }
  }

  return { ok: true, capped: false, consensusReached: !!consensus, pointsAwarded: pointsAwardedToCaller > 0 };
}

export async function removePlaceAnswers(placeId) {
  await redis.hdel(CONSENSUS_KEY, placeId);
  await redis.del(votesKey(placeId));
}
