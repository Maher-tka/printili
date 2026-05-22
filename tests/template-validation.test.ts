import { describe, expect, it } from "vitest";
import { validatePublicTemplate } from "@/lib/template-validation";
import { featuredTemplates } from "@/data/seed-templates";
import { getTemplateEditorLayout } from "@/data/template-layouts";

describe("template validation", () => {
  it("accepts the seeded public templates", () => {
    for (const template of featuredTemplates) {
      const result = validatePublicTemplate({
        template,
        layout: getTemplateEditorLayout(template.slug)
      });

      expect(result.errors).toEqual([]);
    }
  });

  it("rejects invalid slots and photo ranges", () => {
    const template = {
      ...featuredTemplates[0],
      minPhotos: 3,
      maxPhotos: 2
    };
    const result = validatePublicTemplate({
      template,
      layout: {
        slots: [
          {
            id: "bad-slot",
            x: 0.9,
            y: 0.9,
            width: 0.2,
            height: 0.2,
            shape: "rect",
            role: "supporting",
            zIndex: 1,
            borderRadius: 0,
            allowBlurFill: true,
            allowSmartCrop: true
          }
        ],
        textFields: []
      }
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Template max photos must be greater than or equal to min photos."
    );
    expect(result.errors).toContain("Slot bad-slot must stay inside the template canvas.");
  });
});
