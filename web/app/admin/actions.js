"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  checkPassword,
  createSessionToken,
  verifySessionToken,
} from "@/lib/adminAuth";
import {
  getLivePlaces,
  getPendingPlaces,
  setLivePlaces,
  setPendingPlaces,
} from "@/lib/redis";
import { placeFromFormData } from "@/lib/placeForm";
import { removeLatestCheckin } from "@/lib/checkins";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Chưa đăng nhập hoặc phiên đã hết hạn");
  }
}

export async function login(formData) {
  "use server";
  const password = formData.get("password")?.toString() ?? "";

  if (!checkPassword(password)) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin");
}

export async function addPending(formData) {
  "use server";
  await requireAdmin();

  const place = placeFromFormData(formData);
  place.id = `pending-${crypto.randomUUID()}`;

  const pending = await getPendingPlaces();
  pending.push(place);
  await setPendingPlaces(pending);

  revalidatePath("/admin");
}

export async function approvePending(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const pending = await getPendingPlaces();
  const item = pending.find((p) => p.id === id);
  if (!item) return;

  const remainingPending = pending.filter((p) => p.id !== id);
  const live = await getLivePlaces();
  live.push(item);

  await setPendingPlaces(remainingPending);
  await setLivePlaces(live);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectPending(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const pending = await getPendingPlaces();
  await setPendingPlaces(pending.filter((p) => p.id !== id));

  revalidatePath("/admin");
}

export async function updateLive(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const updates = placeFromFormData(formData);

  const live = await getLivePlaces();
  const next = live.map((p) => (p.id === id ? { ...p, ...updates, id } : p));
  await setLivePlaces(next);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteLive(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id")?.toString();

  const live = await getLivePlaces();
  await setLivePlaces(live.filter((p) => p.id !== id));
  await removeLatestCheckin(id);

  revalidatePath("/admin");
  revalidatePath("/");
}
