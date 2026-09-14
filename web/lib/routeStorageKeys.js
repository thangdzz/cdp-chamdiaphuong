// Production không đặt namespace nên giữ nguyên key lịch sử. Test UI có thể đặt namespace
// để tạo/copy/xoá route mà tuyệt đối không chạm route thật trong Redis dùng chung.
export function routeStorageKey(key) {
  const namespace = process.env.CDP_ROUTE_NAMESPACE?.trim();
  return namespace ? `${namespace}:${key}` : key;
}
