import { NextResponse } from "next/server";
import { updateProjectApproval } from "@/lib/project-store";

export const runtime = "nodejs";

type ApprovalRouteProps = {
  params: Promise<{ guestToken: string }>;
};

export async function POST(request: Request, { params }: ApprovalRouteProps) {
  const { guestToken } = await params;
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
