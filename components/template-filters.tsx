import { categories } from "@/data/seed-templates";
import { productTypeLabels } from "@/lib/templates";
import type { ProductType, SheetSize, TemplateCategoryId } from "@/types/templates";

type TemplateFiltersProps = {
  selectedCategory?: TemplateCategoryId;
  selectedSheetSize?: SheetSize;
  selectedProductType?: ProductType;
  selectedPhotoCount?: number;
};

const sheetSizes: SheetSize[] = ["A4", "A3"];
const productTypes: ProductType[] = ["poster", "cut_sheet", "framed_gift", "digital_printable"];

export function TemplateFilters({
  selectedCategory,
  selectedSheetSize,
  selectedProductType,
  selectedPhotoCount
}: TemplateFiltersProps) {
  return (
    <form
      action="/templates"
      className="soft-card grid gap-4 bg-[#fffdf8]/94 p-4 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr_auto]"
    >
      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        Category
        <select
          className="focus-ring min-h-12 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-4 text-sm font-medium text-charcoal shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75)]"
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

      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        Sheet size
        <select
          className="focus-ring min-h-12 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-4 text-sm font-medium text-charcoal shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75)]"
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

      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        Product type
        <select
          className="focus-ring min-h-12 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-4 text-sm font-medium text-charcoal shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75)]"
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

      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        Photo count
        <input
          className="focus-ring min-h-12 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-4 text-sm font-medium text-charcoal shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75)]"
          defaultValue={selectedPhotoCount ?? ""}
          min="1"
          name="photoCount"
          placeholder="Any"
          type="number"
        />
      </label>

      <div className="flex items-end gap-2">
        <button className="focus-ring min-h-12 w-full rounded-full bg-charcoal px-5 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]">
          Filter
        </button>
      </div>
    </form>
  );
}
