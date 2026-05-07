import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword || password === expectedPassword) {
    const cookieStore = await cookies();
    cookieStore.set(getAdminCookieName(), String(password ?? expectedPassword ?? "dev-admin"), {
      httpOnly: true,
      sameSite: "lax",
      path: "/admin"
    });

    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  return NextResponse.redirect(new URL("/admin?error=1", request.url), 303);
}
