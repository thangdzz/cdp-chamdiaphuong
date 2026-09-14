import crypto from "crypto";
import { VercelBlobStorage } from "./media-storage/vercelBlob.js";

// Chỉ file adapter biết SDK của nhà cung cấp. Khi đổi R2/S3/GCS, domain model và UI vẫn gọi
// bốn hàm này; không mang tên vendor vào place.media.
const storage = VercelBlobStorage;

export function generateMediaKey({ placeId, extension = "webp" }) {
  const safePlaceId = String(placeId ?? "unknown").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `place-media/${safePlaceId}/${crypto.randomUUID()}.${extension}`;
}

export async function uploadMedia(buffer, options) {
  const storageKey = options.storageKey ?? generateMediaKey(options);
  return storage.upload(buffer, { ...options, storageKey });
}

export async function deleteMedia(storageKey) {
  return storage.delete(storageKey);
}

export async function getPublicUrl(storageKey) {
  return storage.publicUrl(storageKey);
}
