"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { aboutPageFromFormData, setAboutPageContent } from "@/lib/aboutPage";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");
}

export async function saveAboutPage(formData) {
  await requireAdmin();

  const content = aboutPageFromFormData(formData);
  if (!content) {
    redirect("/admin/gioi-thieu?error=invalid");
  }

  try {
    await setAboutPageContent(content);
  } catch {
    redirect("/admin/gioi-thieu?error=save");
  }

  revalidatePath("/gioi-thieu");
  revalidatePath("/admin/gioi-thieu");
  redirect("/admin/gioi-thieu?saved=1");
}
