import { NextResponse } from "next/server";
import { createOrder, type SampleUseConsentId } from "@/lib/order-store";

export const runtime = "nodejs";

type CheckoutRouteProps = {
  params: Promise<{ guestToken: string }>;
};

const consentValues: SampleUseConsentId[] = ["private", "blur_faces", "show_public"];

export async function POST(request: Request, { params }: CheckoutRouteProps) {
  const { guestToken } = await params;
  const formData = await request.formData();
  const clientName = getRequiredValue(formData, "clientName");
  const whatsapp = getRequiredValue(formData, "whatsapp");
  const deliveryAddress = getRequiredValue(formData, "deliveryAddress");
  const city = getRequiredValue(formData, "city");

  if (!clientName || !whatsapp || !deliveryAddress || !city) {
    return NextResponse.json(
      { message: "Please complete the required delivery fields." },
      { status: 400 }
    );
  }

  const sampleUseConsent = getValue(formData, "sampleUseConsent");
  const order = await createOrder({
    guestToken,
    clientName,
    whatsapp,
    deliveryAddress,
    city,
    deliveryNotes: getValue(formData, "deliveryNotes"),
    quantity: normalizeQuantity(getValue(formData, "quantity")),
    productOption: getValue(formData, "productOption") || "print_only",
    addFrame: formData.get("addFrame") === "true",
    giftWrap: formData.get("giftWrap") === "true",
    premiumPaper: formData.get("premiumPaper") === "true",
    finish: getValue(formData, "finish") === "glossy" ? "glossy" : "matte",
    urgentOrder: formData.get("urgentOrder") === "true",
    deliveryFee: normalizeOptionalNumber(getValue(formData, "deliveryFee")),
    sampleUseConsent: consentValues.includes(sampleUseConsent as SampleUseConsentId)
      ? (sampleUseConsent as SampleUseConsentId)
      : "private"
  });

  if (!order) {
    return NextResponse.json({ message: "Project was not found." }, { status: 404 });
  }

  return NextResponse.redirect(new URL(`/project/${guestToken}/confirmation`, request.url), 303);
}

function getRequiredValue(formData: FormData, key: string) {
  return getValue(formData, key).trim();
}

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function normalizeQuantity(value: string) {
  const quantity = Number(value);

  return Number.isFinite(quantity) && quantity > 0 ? Math.min(Math.floor(quantity), 99) : 1;
}

function normalizeOptionalNumber(value: string) {
  const numeric = Number(value);

  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}
