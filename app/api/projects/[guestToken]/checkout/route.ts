import { NextResponse } from "next/server";
import { createOrder, type SampleUseConsentId } from "@/lib/order-store";
import {
  calculateOrderPrice,
  getDeliveryCityLabel,
  getProductOption,
  normalizeDeliveryCity,
  normalizeProductOption
} from "@/lib/pricing";
import { getGuestProject, updateProjectApproval } from "@/lib/project-store";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout
} from "@/lib/public-template-store";

export const runtime = "nodejs";

type CheckoutRouteProps = {
  params: Promise<{ guestToken: string }>;
};

const consentValues: SampleUseConsentId[] = ["private", "blur_faces", "show_public"];

export async function POST(request: Request, { params }: CheckoutRouteProps) {
  const { guestToken } = await params;
  const formData = await request.formData();
  const project = await getGuestProject(guestToken);

  if (!project) {
    return NextResponse.json({ message: "Project was not found." }, { status: 404 });
  }

  const template = project.chosenTemplateSlug
    ? await getPublicTemplateBySlug(project.chosenTemplateSlug)
    : null;
  const layout = template ? await getPublicTemplateEditorLayout(template.slug) : null;
  const readinessError = getReadinessError({
    formData,
    project,
    layout,
    requiredPhotoCount: template?.minPhotos ?? 1
  });

  if (readinessError) {
    return NextResponse.json({ message: readinessError }, { status: 400 });
  }

  const clientName = getRequiredValue(formData, "clientName");
  const whatsapp = getRequiredValue(formData, "whatsapp");
  const deliveryAddress = getRequiredValue(formData, "deliveryAddress");
  const cityInput = getRequiredValue(formData, "city");

  if (!clientName || !whatsapp || !deliveryAddress || !cityInput) {
    return NextResponse.json(
      { message: "Please complete the required delivery fields." },
      { status: 400 }
    );
  }

  const sampleUseConsent = getValue(formData, "sampleUseConsent");
  const quantity = normalizeQuantity(getValue(formData, "quantity"));
  const productOption = normalizeProductOption(getValue(formData, "productOption"), template);
  const productOptionDetails = getProductOption(productOption, template);
  const addFrame =
    productOptionDetails.includedAddOns?.frame === true || formData.get("addFrame") === "true";
  const giftWrap =
    productOptionDetails.includedAddOns?.giftWrap === true || formData.get("giftWrap") === "true";
  const premiumPaper = formData.get("premiumPaper") === "true";
  const finish = getValue(formData, "finish") === "glossy" ? "glossy" : "matte";
  const urgentOrder = formData.get("urgentOrder") === "true";
  const deliveryCityId = normalizeDeliveryCity(cityInput);
  const city = getDeliveryCityLabel(deliveryCityId);
  const price = calculateOrderPrice({
    template,
    quantity,
    productOption,
    addFrame,
    giftWrap,
    premiumPaper,
    finish,
    urgentOrder,
    city: deliveryCityId
  });
  const order = await createOrder({
    guestToken,
    clientName,
    whatsapp,
    deliveryAddress,
    city,
    deliveryNotes: getValue(formData, "deliveryNotes"),
    quantity,
    productOption,
    addFrame,
    giftWrap,
    premiumPaper,
    finish,
    urgentOrder,
    deliveryFee: price.deliveryFee,
    totalPrice: price.total,
    sampleUseConsent: consentValues.includes(sampleUseConsent as SampleUseConsentId)
      ? (sampleUseConsent as SampleUseConsentId)
      : "private"
  });

  if (!order) {
    return NextResponse.json({ message: "Project was not found." }, { status: 404 });
  }

  await updateProjectApproval({
    guestToken,
    clientApprovedPreview: true
  });

  return NextResponse.redirect(new URL(`/project/${guestToken}/confirmation`, request.url), 303);
}

function getReadinessError({
  formData,
  project,
  layout,
  requiredPhotoCount
}: {
  formData: FormData;
  project: Awaited<ReturnType<typeof getGuestProject>>;
  layout: Awaited<ReturnType<typeof getPublicTemplateEditorLayout>> | null;
  requiredPhotoCount: number;
}) {
  if (!project) {
    return "Project was not found.";
  }

  if (layout) {
    const filledSlotIds = new Set(project.placements.map((placement) => placement.slotId));
    const missingRequiredPhotos = layout.slots
      .slice(0, Math.min(requiredPhotoCount, layout.slots.length))
      .filter((slot) => !filledSlotIds.has(slot.id));

    if (missingRequiredPhotos.length > 0) {
      return "Please fill every required photo spot before checkout.";
    }

    const missingRequiredText = layout.textFields.find(
      (field) => field.isRequired && !project.textValues[field.key]?.trim()
    );

    if (missingRequiredText) {
      return `Please complete ${missingRequiredText.label} before checkout.`;
    }
  }

  const hasWarnings = project.photos.some((photo) => photo.qualityWarnings.length > 0);

  if (hasWarnings && formData.get("acknowledgeQualityWarnings") !== "true") {
    return "Please acknowledge the photo quality warnings before checkout.";
  }

  if (formData.get("previewApproved") !== "true") {
    return "Please approve the preview before checkout.";
  }

  return null;
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
