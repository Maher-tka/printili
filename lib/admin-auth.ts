import { cookies } from "next/headers";

const adminCookieName = "photo_montage_admin";

export async function isAdminAuthenticated() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return true;
  }

  const cookieStore = await cookies();

  return cookieStore.get(adminCookieName)?.value === password;
}

export function getAdminCookieName() {
  return adminCookieName;
}
