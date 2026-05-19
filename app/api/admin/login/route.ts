import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminCookieName,
  getAdminCookieOptions,
  matchesAdminPassword
} from "@/lib/admin-auth";
import { getConfiguredAdminPassword } from "@/lib/runtime-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  let expectedPassword: string | null;

  try {
    expectedPassword = getConfiguredAdminPassword();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin authentication is not configured.";

    return NextResponse.json({ message }, { status: 500 });
  }

  if (!expectedPassword) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  if (typeof password === "string" && matchesAdminPassword(password, expectedPassword)) {
    const cookieStore = await cookies();
    cookieStore.set(
      getAdminCookieName(),
      createAdminSessionToken(expectedPassword),
      getAdminCookieOptions()
    );

    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  return NextResponse.redirect(new URL("/admin?error=1", request.url), 303);
}
