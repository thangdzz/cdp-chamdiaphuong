// Dựng thư viện âm thanh game từ nguồn CC0 (NOTE-06 §5, §12). Chạy tay trên máy Mac khi thêm/đổi
// âm thanh — KHÔNG chạy lúc build Next.js:
//
//   node web/scripts/game-sounds/build.mjs            # dựng lại tất cả
//   node web/scripts/game-sounds/build.mjs tiger-roar # chỉ một mẫu
//
// Mỗi mẫu trong sources.json: tải bản preview của Freesound (cùng giấy phép với bản gốc) → cắt đoạn
// `trim` → chuẩn hoá âm lượng (RMS phần có tiếng) → limiter chặn đỉnh → fade → mã hoá AAC mono
// (.m4a, Safari/Chrome đều giải mã được) → web/public/game-sounds/. Nguồn, tác giả, giấy phép
// được chép sang web/lib/game/soundSamples.js (sinh tự động, không sửa tay) để app và admin đọc.
//
// Cần `afconvert` (có sẵn trên macOS) để giải mã MP3 và mã hoá AAC.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "../..");
const outDir = path.join(webRoot, "public/game-sounds");
const manifestPath = path.join(webRoot, "lib/game/soundSamples.js");
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-game-sounds-"));

const RATE = 44100;
// Âm lượng mục tiêu cho phần có tiếng (-18 dBFS). Rồng/voi không át, thỏ/dế không lọt thỏm; độ
// to tương đối giữa các lớp chỉnh bằng `gain` trong soundSet của mùa, không chỉnh ở đây.
const TARGET_RMS = 0.126;
const PEAK_CEILING = 0.89; // -1 dBFS
const MAX_GAIN = 40; // ~+32 dB — mẫu gốc quá nhỏ thì chấp nhận nhỏ hơn thay vì khuếch đại nhiễu
const BITRATE = 48000;

function readWav(file) {
  const b = fs.readFileSync(file);
  let offset = 12;
  let fmt;
  let data;
  while (offset < b.length) {
    const id = b.toString("ascii", offset, offset + 4);
    const size = b.readUInt32LE(offset + 4);
    if (id === "fmt ") fmt = { channels: b.readUInt16LE(offset + 10), rate: b.readUInt32LE(offset + 12) };
    if (id === "data") data = b.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  const frames = data.length / 2 / fmt.channels;
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let sum = 0;
    for (let c = 0; c < fmt.channels; c++) sum += data.readInt16LE((i * fmt.channels + c) * 2);
    samples[i] = sum / fmt.channels / 32768;
  }
  return { rate: fmt.rate, samples };
}

function writeWav(file, samples) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + samples.length * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  }
  fs.writeFileSync(file, b);
}

function activeRms(samples) {
  const frame = Math.round(RATE * 0.02);
  const frames = [];
  for (let i = 0; i < samples.length; i += frame) {
    let sum = 0;
    const end = Math.min(samples.length, i + frame);
    for (let j = i; j < end; j++) sum += samples[j] ** 2;
    frames.push(sum / (end - i));
  }
  const loudest = Math.max(...frames);
  // Chỉ tính phần có tiếng (trong 20 dB so với khung to nhất) — khoảng lặng không kéo mẫu lên quá to.
  const active = frames.filter((power) => power >= loudest * 0.01);
  return Math.sqrt(active.reduce((sum, power) => sum + power, 0) / active.length);
}

// Limiter nhìn trước 5 ms: hạ gain trước khi đỉnh tới, nhả dần 80 ms — tránh méo vỡ tiếng.
function limit(samples) {
  const lookahead = Math.round(RATE * 0.005);
  const release = Math.exp(-1 / (RATE * 0.08));
  const wanted = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const level = Math.abs(samples[i]);
    wanted[i] = level > PEAK_CEILING ? PEAK_CEILING / level : 1;
  }
  const out = new Float32Array(samples.length);
  let gain = 1;
  for (let i = 0; i < samples.length; i++) {
    let target = 1;
    for (let j = i; j < Math.min(samples.length, i + lookahead); j++) target = Math.min(target, wanted[j]);
    gain = target < gain ? target : 1 - (1 - gain) * release;
    out[i] = samples[i] * Math.min(gain, wanted[i]);
  }
  return out;
}

function shape(samples, { fadeIn = 0.005, fadeOut = 0.08 }) {
  const inN = Math.max(1, Math.round(fadeIn * RATE));
  const outN = Math.max(1, Math.round(fadeOut * RATE));
  for (let i = 0; i < Math.min(inN, samples.length); i++) samples[i] *= Math.sin((i / inN) * (Math.PI / 2));
  for (let i = 0; i < Math.min(outN, samples.length); i++) {
    samples[samples.length - 1 - i] *= Math.sin((i / outN) * (Math.PI / 2));
  }
  return samples;
}

async function buildSample(key, source) {
  const mp3 = path.join(workDir, `${key}.mp3`);
  const wav = path.join(workDir, `${key}.wav`);
  const processed = path.join(workDir, `${key}.out.wav`);
  const response = await fetch(source.previewUrl, { headers: { "User-Agent": "cdp-game-sounds/1.0" } });
  if (!response.ok) throw new Error(`${key}: tải preview lỗi ${response.status}`);
  fs.writeFileSync(mp3, Buffer.from(await response.arrayBuffer()));
  execFileSync("afconvert", ["-f", "WAVE", "-d", `LEI16@${RATE}`, "-c", "1", mp3, wav]);

  const { samples } = readWav(wav);
  const start = Math.round(source.trim.start * RATE);
  const end = Math.min(samples.length, start + Math.round(source.trim.length * RATE));
  let segment = samples.slice(start, end);
  const mean = segment.reduce((sum, v) => sum + v, 0) / segment.length;
  segment = segment.map((v) => v - mean);

  const gain = Math.min(MAX_GAIN, TARGET_RMS / activeRms(segment));
  segment = limit(segment.map((v) => v * gain));
  segment = shape(segment, source.trim);
  writeWav(processed, segment);

  const file = path.join(outDir, `${key}.m4a`);
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", String(BITRATE), processed, file]);
  return { duration: Number((segment.length / RATE).toFixed(3)), bytes: fs.statSync(file).size, gainDb: 20 * Math.log10(gain) };
}

const sources = JSON.parse(fs.readFileSync(path.join(here, "sources.json"), "utf8"));
const only = process.argv[2];
const manifest = fs.existsSync(manifestPath) ? { ...(await import(manifestPath)).SOUND_SAMPLES } : {};
fs.mkdirSync(outDir, { recursive: true });

for (const [key, source] of Object.entries(sources)) {
  if (only && key !== only) continue;
  const result = await buildSample(key, source);
  manifest[key] = {
    file: `/game-sounds/${key}.m4a`,
    duration: result.duration,
    sourceUrl: source.sourceUrl,
    license: source.license,
    author: source.author,
    originalFilename: source.originalFilename,
    downloadedAt: source.downloadedAt,
  };
  console.log(`${key.padEnd(20)} ${result.duration.toFixed(2)}s ${String(result.bytes).padStart(6)} B gain ${result.gainDb.toFixed(1)} dB`);
}

// Bỏ mẫu đã xoá khỏi sources.json để manifest không trỏ tới file không còn.
for (const key of Object.keys(manifest)) if (!sources[key]) delete manifest[key];
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(
  manifestPath,
  `// SINH TỰ ĐỘNG bởi scripts/game-sounds/build.mjs — đừng sửa tay, sửa sources.json rồi chạy lại.\n` +
    `// Mẫu âm thanh thật (CC0) cho game layer: file, độ dài (giây), nguồn + giấy phép (NOTE-06 §5).\n\n` +
    `export const SOUND_SAMPLES = ${JSON.stringify(sorted, null, 2)};\n`
);
fs.rmSync(workDir, { recursive: true, force: true });
