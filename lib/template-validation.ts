import { categories } from "@/data/seed-templates";
import type { TemplateEditorLayout, TemplateSeed } from "@/types/templates";

export type TemplateValidationResult = {
  isValid: boolean;
  errors: string[];
};

const categoryIds = new Set(categories.map((category) => category.id));

export function validatePublicTemplate({
  template,
  layout
}: {
  template: TemplateSeed;
  layout?: TemplateEditorLayout;
}): TemplateValidationResult {
  const errors: string[] = [];

  if (!categoryIds.has(template.categoryId)) {
    errors.push("Template category is not public.");
  }

  if (template.minPhotos < 1) {
    errors.push("Template must require at least one photo.");
  }

  if (template.maxPhotos < template.minPhotos) {
    errors.push("Template max photos must be greater than or equal to min photos.");
  }

  if (!template.previewImage.trim()) {
    errors.push("Template preview image is required.");
  }

  if (template.sheetSize === "custom" && (!template.widthMm || !template.heightMm)) {
    errors.push("Custom templates need widthMm and heightMm.");
  }

  for (const slot of layout?.slots ?? []) {
    if (slot.width <= 0 || slot.height <= 0) {
      errors.push(`Slot ${slot.id} must have a positive size.`);
    }

    if (slot.x < 0 || slot.y < 0 || slot.x + slot.width > 1 || slot.y + slot.height > 1) {
      errors.push(`Slot ${slot.id} must stay inside the template canvas.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function assertValidPublicTemplate(input: {
  template: TemplateSeed;
  layout?: TemplateEditorLayout;
}) {
  const result = validatePublicTemplate(input);

  if (!result.isValid) {
    throw new Error(result.errors.join(" "));
  }
}
