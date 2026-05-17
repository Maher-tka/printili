import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TemplatePreviewImage } from "@/components/template-preview-image";
import { categories } from "@/data/seed-templates";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { templateMakerCanvasHref } from "@/lib/admin-tool-links";
import {
  createAdminTemplateCategory,
  getAdminTemplateCatalog,
  getAdminTemplateCategories,
  getPublicTemplateEditorLayout,
  setPublicTemplateVisibility,
  updateTemplateAdminMetadata,
  type AdminTemplateCategory,
  type AdminTemplateRecord
} from "@/lib/public-template-store";
import { getTemplateQualityReport, type TemplateQualityReport } from "@/lib/template-quality";
import {
  categoryLabels,
  formatPhotoCountRange,
  formatSheetSizeCm,
  productTypeLabels
} from "@/lib/templates";

type TemplatesAdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TemplateGroup = {
  category: AdminTemplateCategory;
  templates: AdminTemplateRecord[];
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin Templates",
  description: "Manage Printili template categories, pricing, descriptions, and maker links."
};

export default async function AdminTemplatesPage({ searchParams }: TemplatesAdminPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const [{ saved, removed, restored, category }, templates, adminCategories] = await Promise.all([
    normalizeSearchParams(searchParams),
    getAdminTemplateCatalog(),
    getAdminTemplateCategories()
  ]);
  const qualityReports = await buildTemplateQualityReports(templates);
  const activeTemplates = templates.filter((template) => !template.isHidden);
  const hiddenTemplates = templates.filter((template) => template.isHidden);
  const groups = groupTemplatesByCategory(activeTemplates, adminCategories);
  const templatesNeedingPrice = activeTemplates.filter((template) => !template.priceLabel).length;
  const savedTemplates = activeTemplates.filter((template) => template.source === "saved").length;
  const templatesNeedingReview = activeTemplates.filter(
    (template) => qualityReports.get(template.slug)?.level !== "ready"
  ).length;

  return (
    <section className="page-shell py-10 sm:py-14" aria-labelledby="templates-admin-heading">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            className="focus-ring inline-flex rounded-sm text-sm font-semibold text-charcoal-soft transition hover:text-charcoal"
            href="/admin"
          >
            Back to dashboard
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Admin library
          </p>
          <h1 id="templates-admin-heading" className="mt-3 font-display text-4xl sm:text-6xl">
            Templates
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-charcoal-soft sm:text-base sm:leading-7">
            Manage the public catalog, keep extracted templates tidy, add commercial copy, and jump
            straight into the maker when a layout needs correction.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal"
            href="/admin/template-ai"
          >
            Template extractor
          </Link>
          <a
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-charcoal px-5 text-sm font-semibold text-charcoal"
            href={templateMakerCanvasHref}
          >
            Template maker
          </a>
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
            href="/templates"
          >
            Public templates
          </Link>
        </div>
      </div>

      <AdminNotice category={category} removed={removed} restored={restored} saved={saved} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Live templates" value={activeTemplates.length} />
        <StatTile label="Saved from maker" value={savedTemplates} />
        <StatTile label="Need price" value={templatesNeedingPrice} />
        <StatTile label="Need QA review" value={templatesNeedingReview} />
        <StatTile label="Removed" value={hiddenTemplates.length} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form action={createCategoryAction} className="soft-card p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Add category
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Create a catalog group</h2>
          <p className="mt-2 text-sm leading-6 text-charcoal-soft">
            Use this for seasonal offers, new product ideas, or special customer collections.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-[0.9fr_1.1fr_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Name
              <input
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-medium"
                name="name"
                placeholder="Mother's Day"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-charcoal">
              Description
              <input
                className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-medium"
                name="description"
                placeholder="Seasonal gift templates"
              />
            </label>
            <button className="focus-ring min-h-11 rounded-full bg-charcoal px-5 text-sm font-semibold text-paper">
              Add
            </button>
          </div>
        </form>

        <div className="soft-card p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
            Category map
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Browse by section</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {groups.map((group) => (
              <a
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2 text-sm font-semibold text-charcoal"
                href={`#category-${group.category.id}`}
                key={group.category.id}
              >
                {group.category.name}
                <span className="rounded-full bg-cream px-2 py-0.5 text-xs text-charcoal-soft">
                  {group.templates.length}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-7">
        {groups.map((group) => (
          <section
            aria-labelledby={`category-${group.category.id}-heading`}
            id={`category-${group.category.id}`}
            key={group.category.id}
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id={`category-${group.category.id}-heading`} className="text-2xl font-semibold">
                  {group.category.name}
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-charcoal-soft">
                  {group.category.description}
                </p>
              </div>
              <p className="text-sm font-semibold text-charcoal-soft">
                {group.templates.length} template{group.templates.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.24)] bg-[#fffdf8]/94">
              {group.templates.map((template) => (
                <TemplateAdminRow
                  adminCategories={adminCategories}
                  key={template.slug}
                  quality={qualityReports.get(template.slug)}
                  template={template}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {hiddenTemplates.length > 0 ? (
        <section className="mt-10" aria-labelledby="removed-templates-heading">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="removed-templates-heading" className="text-2xl font-semibold">
                Removed templates
              </h2>
              <p className="mt-1 text-sm leading-6 text-charcoal-soft">
                These are hidden from the public website and maker list until restored.
              </p>
            </div>
            <p className="text-sm font-semibold text-charcoal-soft">
              {hiddenTemplates.length} hidden
            </p>
          </div>
          <div className="overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.24)] bg-paper">
            {hiddenTemplates.map((template) => (
              <TemplateAdminRow
                adminCategories={adminCategories}
                isHiddenList
                key={template.slug}
                quality={qualityReports.get(template.slug)}
                template={template}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function TemplateAdminRow({
  adminCategories,
  isHiddenList = false,
  quality,
  template
}: {
  adminCategories: AdminTemplateCategory[];
  isHiddenList?: boolean;
  quality?: TemplateQualityReport;
  template: AdminTemplateRecord;
}) {
  const selectedCategory = adminCategories.some(
    (category) => category.id === template.adminCategoryId
  )
    ? template.adminCategoryId
    : template.categoryId;
  const makerHref = `${templateMakerCanvasHref}?template=${encodeURIComponent(template.slug)}`;

  return (
    <form
      action={saveTemplateDetailsAction}
      className="grid gap-4 border-t border-[rgb(199_163_95_/_0.18)] p-4 first:border-t-0 lg:grid-cols-[104px_minmax(190px,0.8fr)_minmax(310px,1.2fr)_170px] lg:items-start"
      id={template.slug}
    >
      <input name="slug" type="hidden" value={template.slug} />
      <div className="relative aspect-square w-24 overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.24)] bg-cream-strong">
        <TemplatePreviewImage
          alt={template.previewAlt}
          className={isHiddenList ? "object-cover grayscale" : "object-cover"}
          src={template.previewImage}
          sizes="104px"
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-charcoal">
            {template.source === "saved" ? "Saved" : "Seed"}
          </span>
          <span className="rounded-full bg-rose-soft px-2.5 py-1 text-xs font-semibold text-charcoal">
            {categoryLabels[template.categoryId]}
          </span>
          {template.priceLabel ? (
            <span className="rounded-full bg-charcoal px-2.5 py-1 text-xs font-semibold text-paper">
              {template.priceLabel}
            </span>
          ) : (
            <span className="rounded-full border border-rose/40 px-2.5 py-1 text-xs font-semibold text-rose">
              Needs price
            </span>
          )}
          {quality ? (
            <span
              className={
                quality.level === "ready"
                  ? "rounded-full bg-[rgb(34_128_91_/_0.12)] px-2.5 py-1 text-xs font-semibold text-[rgb(25_96_68)]"
                  : quality.level === "review"
                    ? "rounded-full bg-[rgb(199_163_95_/_0.2)] px-2.5 py-1 text-xs font-semibold text-charcoal"
                    : "rounded-full bg-rose-soft px-2.5 py-1 text-xs font-semibold text-charcoal"
              }
            >
              QA {quality.score}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug">{template.name}</h3>
        <p className="mt-1 break-words text-xs font-semibold text-charcoal-soft">{template.slug}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-charcoal-soft">
          <div>
            <dt className="font-semibold text-charcoal">Photos</dt>
            <dd className="mt-1">
              {formatPhotoCountRange(template.minPhotos, template.maxPhotos)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal">Type</dt>
            <dd className="mt-1">{productTypeLabels[template.productType]}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-semibold text-charcoal">Print size</dt>
            <dd className="mt-1">{formatSheetSizeCm(template.sheetSize, template.orientation)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal">Slots</dt>
            <dd className="mt-1">{quality?.slotCount ?? "?"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal">QA state</dt>
            <dd className="mt-1 capitalize">{quality?.level.replace("_", " ") ?? "Unknown"}</dd>
          </div>
        </dl>
        {quality?.issues.length ? (
          <div className="mt-3 grid gap-1">
            {quality.issues.map((issue) => (
              <p
                className={
                  issue.tone === "danger"
                    ? "text-xs font-semibold text-rose"
                    : "text-xs font-semibold text-charcoal-soft"
                }
                key={issue.id}
              >
                {issue.label}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-charcoal sm:col-span-2">
          Description
          <textarea
            className="focus-ring min-h-24 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2 text-sm font-medium leading-6"
            defaultValue={template.description}
            name="description"
            rows={3}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Price
          <input
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-medium"
            defaultValue={template.priceLabel ?? ""}
            name="priceLabel"
            placeholder="From 35 TND"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Button
          <input
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-medium"
            defaultValue={template.ctaLabel ?? ""}
            name="ctaLabel"
            placeholder="Start design"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-charcoal sm:col-span-2">
          Category
          <select
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-medium"
            defaultValue={selectedCategory}
            name="adminCategoryId"
          >
            {adminCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 lg:flex-col">
        {isHiddenList ? (
          <button
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
            formAction={restoreTemplateAction}
          >
            Restore
          </button>
        ) : (
          <>
            <button className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full bg-charcoal px-4 text-sm font-semibold text-paper">
              Save
            </button>
            <a
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-charcoal px-4 text-sm font-semibold text-charcoal"
              href={makerHref}
            >
              Edit in maker
            </a>
            <Link
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-4 text-sm font-semibold text-charcoal"
              href={`/template/${template.slug}`}
            >
              Preview
            </Link>
            <button
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-rose/50 px-4 text-sm font-semibold text-rose"
              formAction={removeTemplateAction}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="soft-card p-4">
      <p className="text-sm font-semibold text-charcoal-soft">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-charcoal">{value}</p>
    </div>
  );
}

function AdminNotice({
  category,
  removed,
  restored,
  saved
}: {
  category?: string;
  removed?: string;
  restored?: string;
  saved?: string;
}) {
  const message = saved
    ? "Template details saved."
    : removed
      ? "Template removed from the public catalog."
      : restored
        ? "Template restored to the public catalog."
        : category
          ? "Category added."
          : null;

  if (!message) {
    return null;
  }

  return (
    <div className="mt-6 rounded-[8px] border border-[rgb(199_163_95_/_0.28)] bg-cream px-4 py-3 text-sm font-semibold text-charcoal">
      {message}
    </div>
  );
}

function groupTemplatesByCategory(
  templates: AdminTemplateRecord[],
  adminCategories: AdminTemplateCategory[]
): TemplateGroup[] {
  const templatesByCategory = new Map<string, AdminTemplateRecord[]>();

  for (const template of templates) {
    const categoryId = template.adminCategoryId || template.categoryId;
    const categoryTemplates = templatesByCategory.get(categoryId) ?? [];
    categoryTemplates.push(template);
    templatesByCategory.set(categoryId, categoryTemplates);
  }

  return adminCategories
    .map((category) => ({
      category,
      templates: templatesByCategory.get(category.id) ?? []
    }))
    .filter((group) => group.templates.length > 0);
}

async function buildTemplateQualityReports(templates: AdminTemplateRecord[]) {
  const entries = await Promise.all(
    templates.map(async (template) => {
      const layout = await getPublicTemplateEditorLayout(template.slug);

      return [template.slug, getTemplateQualityReport(template, layout)] as const;
    })
  );

  return new Map(entries);
}

async function normalizeSearchParams(
  searchParams: TemplatesAdminPageProps["searchParams"]
): Promise<Record<string, string | undefined>> {
  const params = (await searchParams) ?? {};

  return {
    saved: getQueryValue(params.saved),
    removed: getQueryValue(params.removed),
    restored: getQueryValue(params.restored),
    category: getQueryValue(params.category)
  };
}

async function createCategoryAction(formData: FormData) {
  "use server";

  await ensureAdminAuthenticated();
  const name = getText(formData, "name");

  if (!name) {
    redirect("/admin/templates");
  }

  const category = await createAdminTemplateCategory({
    name,
    description: getText(formData, "description")
  });

  revalidateTemplatePages();
  redirect(`/admin/templates?category=${encodeURIComponent(category.id)}`);
}

async function saveTemplateDetailsAction(formData: FormData) {
  "use server";

  await ensureAdminAuthenticated();
  const slug = getText(formData, "slug");
  const adminCategoryId = getText(formData, "adminCategoryId");
  const adminCategories = await getAdminTemplateCategories();
  const selectedCategory = adminCategories.find((category) => category.id === adminCategoryId);
  const categoryId = selectedCategory?.publicCategoryId ?? "custom";

  await updateTemplateAdminMetadata({
    slug,
    adminCategoryId: selectedCategory?.id ?? categoryId,
    categoryId,
    description: getText(formData, "description"),
    priceLabel: getText(formData, "priceLabel"),
    ctaLabel: getText(formData, "ctaLabel")
  });

  revalidateTemplatePages(slug);
  redirect(`/admin/templates?saved=${encodeURIComponent(slug)}`);
}

async function removeTemplateAction(formData: FormData) {
  "use server";

  await ensureAdminAuthenticated();
  const slug = getText(formData, "slug");

  await setPublicTemplateVisibility(slug, true);
  revalidateTemplatePages(slug);
  redirect(`/admin/templates?removed=${encodeURIComponent(slug)}`);
}

async function restoreTemplateAction(formData: FormData) {
  "use server";

  await ensureAdminAuthenticated();
  const slug = getText(formData, "slug");

  await setPublicTemplateVisibility(slug, false);
  revalidateTemplatePages(slug);
  redirect(`/admin/templates?restored=${encodeURIComponent(slug)}`);
}

async function ensureAdminAuthenticated() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }
}

function revalidateTemplatePages(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/templates");
  revalidatePath("/templates");

  if (slug) {
    revalidatePath(`/template/${slug}`);
  }

  for (const category of categories) {
    revalidatePath(`/templates/${category.slug}`);
  }
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
