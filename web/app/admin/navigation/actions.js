"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { navigationFromFormData, setNavigationConfig } from "@/lib/navigation";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");
}

export async function saveNavigation(formData) {
  await requireAdmin();

  // Server tự dựng lại bốn item từ definition cố định. key/href giả mạo trong request bị bỏ qua.
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
