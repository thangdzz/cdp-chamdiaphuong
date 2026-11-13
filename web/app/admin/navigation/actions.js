"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { navigationFromFormData, setNavigationConfig } from "@/lib/navigation";
import { HOME_TITLE_KEY, validateHomeTitle } from "@/lib/homeTitle";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");
}

export async function saveNavigation(formData) {
  await requireAdmin();

  // A4: tiêu đề Trang chủ tối đa 60 ký tự — kiểm lại ở máy chủ (form Admin đã khóa nút Lưu, nhưng trình duyệt tắt JS
  // hoặc request gửi thẳng vẫn tới được đây). Quá giới hạn thì không lưu gì, báo đúng số ký tự.
  const homeTitle = validateHomeTitle(formData.get(`pageTitle_${HOME_TITLE_KEY}`)?.toString());
  if (!homeTitle.ok) {
    redirect(
      homeTitle.length === 0
        ? "/admin/navigation?error=invalid"
        : `/admin/navigation?error=home_title&length=${homeTitle.length}`
    );
  }

  // Server tự dựng lại các item từ definition cố định. key/href giả mạo trong request bị bỏ qua.
  const navigation = navigationFromFormData(formData);
  if (!navigation) redirect("/admin/navigation?error=invalid");

  try {
    await setNavigationConfig(navigation);
  } catch {
    redirect("/admin/navigation?error=save");
  }

  // Config nằm ở Root Layout nên làm mới layout để menu và pageTitle đổi cùng một lượt.
  revalidatePath("/", "layout");
  redirect("/admin/navigation?saved=1");
}
