export const CUSTOMER_UPLOAD_LIMIT = 5;
export const ADMIN_UPLOAD_LIMIT = 10;

// Nén trước khi gửi để nhiều ảnh điện thoại vẫn nằm trong giới hạn request của Vercel.
// Server vẫn đọc lại và resize bằng sharp; bước trình duyệt chỉ giảm băng thông upload.
export async function compressImageForUpload(file, { maxDim = 1600, quality = 0.82 } = {}) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}
