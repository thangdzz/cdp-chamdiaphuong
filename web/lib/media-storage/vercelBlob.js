import { del, head, put } from "@vercel/blob";

export const VercelBlobStorage = {
  async upload(buffer, { storageKey, mimeType }) {
    const blob = await put(storageKey, buffer, {
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
      contentType: mimeType,
    });
    return {
      storageKey: blob.pathname,
      url: blob.url,
      providerMeta: { downloadUrl: blob.downloadUrl },
    };
  },

  async delete(storageKey) {
    if (storageKey) await del(storageKey);
  },

  async publicUrl(storageKey) {
    if (!storageKey) return null;
    const blob = await head(storageKey);
    return blob?.url ?? null;
  },
};
