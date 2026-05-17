import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MontagePreview } from "@/components/montage-preview";
import { categories } from "@/data/seed-templates";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { templateMakerCanvasHref } from "@/lib/admin-tool-links";
import {
  getPublicTemplateBySlug,
  getPublicTemplateEditorLayout,
  savePublicTemplate
} from "@/lib/public-template-store";
import {
  categoryLabels,
  formatSheetSizeCm,
  getCategoryById,
  productTypeLabels,
  sheetSizeLabels
} from "@/lib/templates";
import type {
  PageOrientation,
  ProductType,
  SheetSize,
  TemplateCategoryId,
  TemplateSlotRole,
  TemplateSlotShape
} from "@/types/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Review Extracted Template",
  description: "Private admin review and correction screen for extracted Printili templates."
};

type ReviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const productTypes: ProductType[] = ["poster", "cut_sheet", "framed_gift", "digital_printable"];
const sheetSizes: SheetSize[] = ["A4", "A3", "custom"];
const orientations: PageOrientation[] = ["portrait", "landscape"];
const slotShapes: TemplateSlotShape[] = [
  "rect",
  "circle",
  "heart",
  "silhouette",
  "number",
  "custom"
];
const slotRoles: TemplateSlotRole[] = ["hero", "supporting", "thumbnail", "shape_tile"];

export default async function ReviewExtractedTemplatePage({
  params,
  searchParams
}: ReviewPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const [{ slug }, query] = await Promise.all([
    params,
    (searchParams ?? Promise.resolve({})) as Promise<Record<string, string | string[] | undefined>>
  ]);
  const template = await getPublicTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const layout = await getPublicTemplateEditorLayout(template.slug);
  const category = getCategoryById(template.categoryId);
  const categoryHref = category ? `/templates/${category.slug}` : "/templates";
  const savedQuery = getSingleQueryValue(query.saved);
  const reviewQuery = getSingleQueryValue(query.review);
  const saved = savedQuery === "1" || reviewQuery === "saved";

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="review-template-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="text-sm font-semibold text-rose" href="/admin/template-ai">
          Back to extractor
        </Link>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <a className="text-rose" href={`${templateMakerCanvasHref}?template=${template.slug}`}>
            Open in maker
          </a>
          <Link className="text-rose" href={`/template/${template.slug}`}>
            Public preview
          </Link>
          <Link className="text-rose" href={categoryHref}>
            Public category
          </Link>
        </div>
      </div>

      {saved ? (
        <div className="soft-card mt-6 border border-[rgb(191_127_134_/_0.28)] p-4 text-sm font-semibold text-charcoal">
          Saved. The corrected template is available on the public website in{" "}
          {categoryLabels[template.categoryId]}.
        </div>
      ) : null}

      <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)] xl:items-start">
        <aside className="grid gap-5 xl:sticky xl:top-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
              Extracted template review
            </p>
            <h1
              id="review-template-heading"
              className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
            >
              Correct before customers see it
            </h1>
            <p className="mt-4 text-base leading-7 text-charcoal-soft">
              Check the extracted photo boxes, remove wrong detections, adjust normalized geometry,
              then save back into the selected public category.
            </p>
          </div>

          <div className="soft-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{template.name}</h2>
                <p className="mt-2 text-sm leading-6 text-charcoal-soft">
                  {categoryLabels[template.categoryId]} / {productTypeLabels[template.productType]}{" "}
                  / {formatSheetSizeCm(template.sheetSize, template.orientation)}
                </p>
              </div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-charcoal-soft">
                {layout.slots.length} slots
              </span>
            </div>
            <div className="mt-5">
              <MontagePreview
                className="shadow-soft"
                layout={layout}
                photos={[]}
                placements={[]}
                showSlotLabels
                showCutGuides={template.hasCutGuides}
                template={template}
                textValues={{}}
              />
            </div>
          </div>
        </aside>

        <form action={saveReviewedTemplate} className="soft-card grid gap-6 p-5 sm:p-6">
          <input name="slug" type="hidden" value={template.slug} />
          <input name="slotCount" type="hidden" value={layout.slots.length} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-charcoal sm:col-span-2">
              Template name
              <input
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                defaultValue={template.name}
                name="name"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Category
              <select
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                defaultValue={template.categoryId}
                name="categoryId"
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Product type
              <select
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                defaultValue={template.productType}
                name="productType"
              >
                {productTypes.map((productType) => (
                  <option key={productType} value={productType}>
                    {productTypeLabels[productType]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Sheet size
              <select
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                defaultValue={template.sheetSize}
                name="sheetSize"
              >
                {sheetSizes.map((sheetSize) => (
                  <option key={sheetSize} value={sheetSize}>
                    {sheetSizeLabels[sheetSize]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Orientation
              <select
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal"
                defaultValue={template.orientation}
                name="orientation"
              >
                {orientations.map((orientation) => (
                  <option key={orientation} value={orientation}>
                    {orientation}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-charcoal sm:col-span-2">
              Description
              <textarea
                className="focus-ring min-h-24 resize-y rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2 text-sm font-normal"
                defaultValue={template.description}
                name="description"
              />
            </label>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Detected photo slots</h2>
                <p className="mt-2 text-sm leading-6 text-charcoal-soft">
                  Values are normalized from 0 to 1. Uncheck bad detections before saving.
                </p>
              </div>
              <button
                className="focus-ring min-h-11 rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
                type="submit"
              >
                Save corrected template
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[8px] border border-[rgb(199_163_95_/_0.22)]">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-[0.08em] text-charcoal-soft">
                  <tr>
                    {["Keep", "Slot", "X", "Y", "Width", "Height", "Shape", "Role", "Z"].map(
                      (heading) => (
                        <th className="px-3 py-3 font-semibold" key={heading}>
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {layout.slots.map((slot, index) => (
                    <tr className="border-t border-[rgb(199_163_95_/_0.18)]" key={slot.id}>
                      <td className="px-3 py-3">
                        <input
                          className="size-4 accent-rose"
                          defaultChecked
                          name={`slot-${index}-keep`}
                          type="checkbox"
                          value="true"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          className="focus-ring min-h-10 w-32 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-2 text-sm"
                          defaultValue={slot.id}
                          name={`slot-${index}-id`}
                        />
                      </td>
                      {(["x", "y", "width", "height"] as const).map((field) => (
                        <td className="px-3 py-3" key={field}>
                          <input
                            className="focus-ring min-h-10 w-24 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-2 text-sm"
                            defaultValue={slot[field].toFixed(4)}
                            max="1"
                            min="0"
                            name={`slot-${index}-${field}`}
                            step="0.0001"
                            type="number"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-3">
                        <select
                          className="focus-ring min-h-10 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-2 text-sm"
                          defaultValue={slot.shape}
                          name={`slot-${index}-shape`}
                        >
                          {slotShapes.map((shape) => (
                            <option key={shape} value={shape}>
                              {shape}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          className="focus-ring min-h-10 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-2 text-sm"
                          defaultValue={slot.role}
                          name={`slot-${index}-role`}
                        >
                          {slotRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          className="focus-ring min-h-10 w-16 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-2 text-sm"
                          defaultValue={slot.zIndex}
                          min="1"
                          name={`slot-${index}-zIndex`}
                          type="number"
                        />
                        <input
                          name={`slot-${index}-borderRadius`}
                          type="hidden"
                          value={slot.borderRadius}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

async function saveReviewedTemplate(formData: FormData) {
  "use server";

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const slug = getText(formData, "slug");
  const existingTemplate = slug ? await getPublicTemplateBySlug(slug) : null;

  if (!existingTemplate) {
    redirect("/admin/template-ai?review=missing");
  }

  const existingLayout = await getPublicTemplateEditorLayout(existingTemplate.slug);
  const slotCount = getNumber(formData, "slotCount", existingLayout.slots.length);
  const frames = Array.from({ length: slotCount }, (_, index) => {
    if (getText(formData, `slot-${index}-keep`) !== "true") {
      return null;
    }

    const width = clampUnit(getNumber(formData, `slot-${index}-width`, 0));
    const height = clampUnit(getNumber(formData, `slot-${index}-height`, 0));
    const borderRadius = getNumber(formData, `slot-${index}-borderRadius`, 0);

    if (width <= 0 || height <= 0) {
      return null;
    }

    return {
      id: getText(formData, `slot-${index}-id`) || `photo_${String(index + 1).padStart(2, "0")}`,
      x: clampUnit(getNumber(formData, `slot-${index}-x`, 0)),
      y: clampUnit(getNumber(formData, `slot-${index}-y`, 0)),
      width,
      height,
      shape: normalizeSlotShape(getText(formData, `slot-${index}-shape`)),
      role: normalizeSlotRole(getText(formData, `slot-${index}-role`), index),
      zIndex: Math.max(1, Math.round(getNumber(formData, `slot-${index}-zIndex`, index + 1))),
      radius: borderRadius * Math.max(width, height)
    };
  }).filter((frame): frame is NonNullable<typeof frame> => Boolean(frame));

  const saved = await savePublicTemplate({
    slug: existingTemplate.slug,
    name: getText(formData, "name") || existingTemplate.name,
    categoryId: normalizeCategoryId(getText(formData, "categoryId"), existingTemplate.categoryId),
    productType: normalizeProductType(
      getText(formData, "productType"),
      existingTemplate.productType
    ),
    sheetSize: normalizeSheetSize(getText(formData, "sheetSize"), existingTemplate.sheetSize),
    orientation: normalizeOrientation(
      getText(formData, "orientation"),
      existingTemplate.orientation
    ),
    minPhotos: frames.length || existingTemplate.minPhotos,
    maxPhotos: frames.length || existingTemplate.maxPhotos,
    description: getText(formData, "description") || existingTemplate.description,
    tags: existingTemplate.tags,
    previewImage: existingTemplate.previewImage,
    previewAlt: existingTemplate.previewAlt,
    frames,
    textFields: existingLayout.textFields
  });

  const category = getCategoryById(saved.template.categoryId);

  revalidatePath("/templates");
  revalidatePath(`/template/${saved.template.slug}`);

  if (category) {
    revalidatePath(`/templates/${category.slug}`);
  }

  redirect(`/admin/template-ai/review/${saved.template.slug}?saved=1`);
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(getText(formData, key));

  return Number.isFinite(value) ? value : fallback;
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeCategoryId(value: string, fallback: TemplateCategoryId): TemplateCategoryId {
  return categories.some((category) => category.id === value)
    ? (value as TemplateCategoryId)
    : fallback;
}

function normalizeProductType(value: string, fallback: ProductType): ProductType {
  return productTypes.includes(value as ProductType) ? (value as ProductType) : fallback;
}

function normalizeSheetSize(value: string, fallback: SheetSize): SheetSize {
  return sheetSizes.includes(value as SheetSize) ? (value as SheetSize) : fallback;
}

function normalizeOrientation(value: string, fallback: PageOrientation): PageOrientation {
  return orientations.includes(value as PageOrientation) ? (value as PageOrientation) : fallback;
}

function normalizeSlotShape(value: string): TemplateSlotShape {
  return slotShapes.includes(value as TemplateSlotShape) ? (value as TemplateSlotShape) : "rect";
}

function normalizeSlotRole(value: string, index: number): TemplateSlotRole {
  return slotRoles.includes(value as TemplateSlotRole)
    ? (value as TemplateSlotRole)
    : index === 0
      ? "hero"
      : "supporting";
}
