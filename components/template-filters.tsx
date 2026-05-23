import Link from "next/link";
import { categories } from "@/data/seed-templates";
import { productTypeLabels } from "@/lib/templates";
import type { DeliveryType } from "@/lib/templates";
import type { ProductType, SheetSize, TemplateCategoryId } from "@/types/templates";

type TemplateFiltersProps = {
  selectedCategory?: TemplateCategoryId;
  selectedSheetSize?: SheetSize;
  selectedProductType?: ProductType;
  selectedPhotoCount?: number;
  selectedDeliveryType?: DeliveryType;
  selectedPricedOnly?: boolean;
};

const sheetSizes: SheetSize[] = ["A4", "A3", "custom"];
const productTypes: ProductType[] = [
  "poster",
  "cut_sheet",
  "framed_gift",
  "digital_printable",
  "label",
  "sticker"
];

const quickChips: Array<{
  label: string;
  href: string;
  categoryId?: TemplateCategoryId;
}> = [
  { label: "All", href: "/templates" },
  { label: "Photo Collage", href: "/templates?productType=poster" },
  {
    label: "Polaroid / Cut Sheets",
    href: "/templates?category=cut_sheet",
    categoryId: "cut_sheet"
  },
  { label: "Graduation", href: "/templates?category=graduation", categoryId: "graduation" },
  { label: "Baby", href: "/templates?category=baby", categoryId: "baby" },
  { label: "Birthday", href: "/templates?category=birthday", categoryId: "birthday" },
  { label: "Wedding", href: "/templates?category=wedding", categoryId: "wedding" },
  { label: "Family", href: "/templates?category=family", categoryId: "family" }
];

export function TemplateFilters({
  selectedCategory,
  selectedSheetSize,
  selectedProductType,
  selectedPhotoCount,
  selectedDeliveryType,
  selectedPricedOnly
}: TemplateFiltersProps) {
  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedSheetSize ||
    selectedProductType ||
    selectedPhotoCount ||
    selectedDeliveryType ||
    selectedPricedOnly
  );

  return (
    <div className="grid gap-4">
      <nav aria-label="Quick template categories" className="printili-template-chips">
        {quickChips.map((chip) => {
          const isActive =
            chip.label === "All"
              ? !hasActiveFilters
              : chip.categoryId
                ? selectedCategory === chip.categoryId
                : selectedProductType === "poster";

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className="focus-ring"
              href={chip.href}
              key={chip.label}
            >
              {chip.label}
            </Link>
          );
        })}
      </nav>

      <form action="/templates" className="printili-template-filters">
        <label className="printili-template-filters__field">
          Occasion
          <select
            className="focus-ring printili-template-filters__control"
            defaultValue={selectedCategory ?? ""}
            name="category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="printili-template-filters__field">
          Sheet size
          <select
            className="focus-ring printili-template-filters__control"
            defaultValue={selectedSheetSize ?? ""}
            name="sheetSize"
          >
            <option value="">Any size</option>
            {sheetSizes.map((sheetSize) => (
              <option key={sheetSize} value={sheetSize}>
                {sheetSize}
              </option>
            ))}
          </select>
        </label>

        <label className="printili-template-filters__field">
          Format
          <select
            className="focus-ring printili-template-filters__control"
            defaultValue={selectedProductType ?? ""}
            name="productType"
          >
            <option value="">Any product</option>
            {productTypes.map((productType) => (
              <option key={productType} value={productType}>
                {productTypeLabels[productType]}
              </option>
            ))}
          </select>
        </label>

        <label className="printili-template-filters__field">
          Photo count
          <input
            className="focus-ring printili-template-filters__control"
            defaultValue={selectedPhotoCount ?? ""}
            min="1"
            name="photoCount"
            placeholder="Any"
            type="number"
          />
        </label>

        <label className="printili-template-filters__field">
          Delivery
          <select
            className="focus-ring printili-template-filters__control"
            defaultValue={selectedDeliveryType ?? ""}
            name="deliveryType"
          >
            <option value="">Any delivery</option>
            <option value="physical">Printed delivery</option>
            <option value="digital">Digital file</option>
          </select>
        </label>

        <div className="printili-template-filters__action">
          <button className="focus-ring">Filter</button>
        </div>

        <div className="printili-template-filters__footer">
          <label>
            <input
              className="size-4 accent-rose"
              defaultChecked={selectedPricedOnly}
              name="pricedOnly"
              type="checkbox"
              value="1"
            />
            Show priced templates only
          </label>
          {hasActiveFilters ? (
            <Link href="/templates">Clear filters</Link>
          ) : (
            <span>Not sure? Upload your photos first and we will suggest the best designs.</span>
          )}
        </div>
      </form>
    </div>
  );
}
