import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateProjectApproval } from "@/lib/project-store";

export const runtime = "nodejs";

type ApprovalRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function POST(request: Request, { params }: ApprovalRouteProps) {
  const authenticated = await isAdminAuthenticated();
  const { guestToken } = await params;

  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const formData = await request.formData();

  await updateProjectApproval({
    guestToken,
    designApproved: formData.get("designApproved") === "true",
    clientApprovedPreview: formData.get("clientApprovedPreview") === "true"
  });

  return NextResponse.redirect(
    new URL(request.headers.get("referer") ?? "/admin", request.url),
    303
  );
}
