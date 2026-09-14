import crypto from "crypto";
import sharp from "sharp";

export const MAX_CUSTOMER_MEDIA_PER_UPLOAD = 5;
export const MAX_ADMIN_MEDIA_PER_UPLOAD = 10;
export const MAX_MEDIA_INPUT_BYTES = 8 * 1024 * 1024;

const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif", "tiff"]);

export async function processMediaFile(file, { maxDimension = 1600, quality = 80 } = {}) {
  if (!(file instanceof File) || file.size <= 0) throw new Error("Ảnh không hợp lệ.");
  if (file.size > MAX_MEDIA_INPUT_BYTES) {
    throw new Error(`Ảnh “${file.name}” quá lớn, tối đa 8 MB.`);
  }

  const input = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(input, { failOn: "warning", limitInputPixels: 40_000_000 });
  const metadata = await pipeline.metadata();
  if (!SUPPORTED_FORMATS.has(metadata.format)) {
    throw new Error(`Ảnh “${file.name}” không thuộc định dạng được hỗ trợ.`);
  }

  const output = await pipeline
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    bytes: output.info.size,
    mimeType: "image/webp",
    contentHash: crypto.createHash("sha256").update(input).digest("hex"),
  };
}
