"use client";

/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/cn";
import { getEffectivePlacementControls } from "@/lib/placement-fit";
import { getPhotoSource } from "@/lib/photo-url";
import type {
  EditableFitMode,
  ProjectPlacementSummary,
  UploadedProjectPhoto
} from "@/lib/project-store";
import type {
  TemplateEditorLayout,
  TemplateSeed,
  TemplateSlotSeed,
  TemplateTextFieldSeed
} from "@/types/templates";

type MontagePreviewProps = {
  template: TemplateSeed;
  layout: TemplateEditorLayout;
  photos: UploadedProjectPhoto[];
  placements: ProjectPlacementSummary[];
  textValues: Record<string, string>;
  selectedSlotId?: string;
  protectedPreview?: boolean;
  showCutGuides?: boolean;
  watermarkText?: string;
  className?: string;
  showSlotLabels?: boolean;
  onSlotSelect?: (slotId: string) => void;
};

type VisualFitMode = "cover" | "contain_blur" | "smart_crop";

export function MontagePreview({
  template,
  layout,
  photos,
  placements,
  textValues,
  selectedSlotId,
  protectedPreview = false,
  showCutGuides = template.hasCutGuides,
  watermarkText = "PREVIEW",
  className,
  showSlotLabels = false,
  onSlotSelect
}: MontagePreviewProps) {
  const photoById = createPhotoMap(photos);
  const aspectRatio = template.orientation === "landscape" ? "297 / 210" : "210 / 297";
  const renderedSlots = layout.slots.map((slot, index) => ({
    slot,
    placement: placements.find((placement) => placement.slotId === slot.id) ?? placements[index]
  }));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.3)] bg-paper",
        className
      )}
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(241_215_216_/_0.52),transparent_34%),linear-gradient(180deg,#fffaf3,#fbf4e8)]" />
      {showCutGuides ? <CutGuideOverlay templateSlug={template.slug} /> : null}
      {renderedSlots.map(({ slot, placement }, index) => (
        <PhotoSlot
          key={slot.id}
          isSelected={slot.id === selectedSlotId}
          photo={placement ? photoById.get(placement.photoId) : undefined}
          placement={placement}
          lowRes={protectedPreview}
          slot={slot}
          slotNumber={index + 1}
          showSlotLabels={showSlotLabels}
          templateSlug={template.slug}
          templateName={template.name}
          onSelect={onSlotSelect ? () => onSlotSelect(slot.id) : undefined}
        />
      ))}
      {layout.textFields.map((field) => (
        <PreviewText
          key={field.id}
          field={field}
          value={textValues[field.key] ?? field.defaultValue ?? field.placeholder ?? ""}
        />
      ))}
      {protectedPreview ? <ProtectedWatermark projectLabel={watermarkText} /> : null}
    </div>
  );
}

function PhotoSlot({
  slot,
  placement,
  lowRes,
  photo,
  templateName,
  templateSlug,
  slotNumber,
  showSlotLabels,
  isSelected,
  onSelect
}: {
  slot: TemplateSlotSeed;
  placement?: ProjectPlacementSummary;
  lowRes: boolean;
  photo?: UploadedProjectPhoto;
  templateName: string;
  templateSlug: string;
  slotNumber: number;
  showSlotLabels: boolean;
  isSelected: boolean;
  onSelect?: () => void;
}) {
  const photoSource = photo ? getPhotoSource(photo.originalUrl, { lowRes }) : "";
  const fitMode = placement?.fitMode ?? "cover";
  const visualFitMode = getVisualFitMode(fitMode);
  const isCircle = slot.shape === "circle";
  const isPolaroidCell = templateSlug === "a4-9-polaroid-cut-sheet";
  const slotClassName = cn(
    "absolute overflow-hidden border border-paper/80 bg-cream-strong text-left shadow-[0_8px_18px_rgb(45_41_38_/_0.12)] transition",
    onSelect && "focus-ring cursor-pointer hover:ring-2 hover:ring-rose/60",
    isSelected && "ring-2 ring-rose ring-offset-2 ring-offset-paper"
  );
  const slotStyle = {
    left: `${slot.x * 100}%`,
    top: `${slot.y * 100}%`,
    width: `${slot.width * 100}%`,
    height: `${slot.height * 100}%`,
    borderRadius: isCircle ? "9999px" : `${slot.borderRadius * 100}%`,
    zIndex: slot.zIndex
  };

  const content =
    photo && placement ? (
      <PlacedPhoto
        fitMode={visualFitMode}
        isPolaroidCell={isPolaroidCell}
        photo={photo}
        photoFileName={photo.fileName}
        photoSource={photoSource}
        placement={placement}
        slot={slot}
        templateName={templateName}
      />
    ) : (
      <span className="flex h-full w-full items-center justify-center break-all px-1 text-center text-[9px] font-semibold uppercase leading-tight text-charcoal-soft sm:text-[10px]">
        {showSlotLabels ? slot.id : "Photo"}
      </span>
    );
  const slotBadge = onSelect ? (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-1 top-1 z-20 grid size-5 place-items-center rounded-full text-[10px] font-semibold shadow-[0_4px_12px_rgb(45_41_38_/_0.16)]",
        isSelected ? "bg-rose text-paper" : "bg-paper/90 text-charcoal"
      )}
    >
      {slotNumber}
    </span>
  ) : null;

  if (onSelect) {
    return (
      <button
        aria-label={`Edit photo slot ${slotNumber}`}
        className={slotClassName}
        data-slot-shape={slot.shape}
        onClick={onSelect}
        style={slotStyle}
        type="button"
      >
        {content}
        {slotBadge}
      </button>
    );
  }

  return (
    <div
      aria-label={`Photo slot ${slotNumber}`}
      className={slotClassName}
      data-slot-shape={slot.shape}
      role="img"
      style={slotStyle}
    >
      {content}
      {slotBadge}
    </div>
  );
}

function PlacedPhoto({
  fitMode,
  isPolaroidCell,
  photo,
  photoFileName,
  photoSource,
  placement,
  slot,
  templateName
}: {
  fitMode: VisualFitMode;
  isPolaroidCell: boolean;
  photo: UploadedProjectPhoto;
  photoFileName: string;
  photoSource: string;
  placement: ProjectPlacementSummary;
  slot: TemplateSlotSeed;
  templateName: string;
}) {
  if (fitMode === "contain_blur") {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          isPolaroidCell && "bg-white p-[6%] pb-[18%]"
        )}
      >
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-75 blur-xl brightness-75 saturate-90"
          src={photoSource}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-charcoal/10" />
        <img
          alt={`${photoFileName} placed in ${templateName}`}
          className={cn(
            "absolute left-1/2 top-1/2 max-w-none object-contain drop-shadow-[0_10px_20px_rgb(45_41_38_/_0.16)]",
            isPolaroidCell ? "h-[76%] w-[88%]" : "h-full w-full"
          )}
          src={photoSource}
          style={{
            transform: "translate(-50%, -50%)"
          }}
        />
      </div>
    );
  }

  const targetAspectRatio = isPolaroidCell ? (slot.width * 0.88) / (slot.height * 0.76) : undefined;
  const controls = getEffectivePlacementControls({
    placement: {
      ...placement,
      fitMode
    },
    photo,
    slot,
    targetAspectRatio
  });

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        isPolaroidCell && "bg-white p-[6%] pb-[18%]"
      )}
    >
      <img
        alt={`${photoFileName} placed in ${templateName}`}
        className={cn(
          "absolute left-1/2 top-1/2 max-w-none object-cover",
          isPolaroidCell ? "h-[76%] w-[88%]" : "h-full w-full"
        )}
        src={photoSource}
        style={{
          transform: `translate(-50%, -50%) translate(${controls.offsetX}%, ${controls.offsetY}%) scale(${controls.zoom}) rotate(${controls.rotation}deg)`
        }}
      />
    </div>
  );
}

function getVisualFitMode(fitMode: EditableFitMode): VisualFitMode {
  if (fitMode === "contain_blur") {
    return "contain_blur";
  }

  if (fitMode === "smart_crop") {
    return "smart_crop";
  }

  return "cover";
}

function PreviewText({ field, value }: { field: TemplateTextFieldSeed; value: string }) {
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center overflow-hidden px-1 text-center font-display leading-tight text-charcoal"
      style={{
        left: `${field.x * 100}%`,
        top: `${field.y * 100}%`,
        width: `${field.width * 100}%`,
        height: `${field.height * 100}%`,
        fontSize: `${Math.max(9, field.fontSize * 0.38)}px`,
        zIndex: field.zIndex,
        whiteSpace: field.height > 0.07 ? "pre-wrap" : "nowrap"
      }}
    >
      {value}
    </div>
  );
}

function CutGuideOverlay({ templateSlug }: { templateSlug: string }) {
  const isLandscapeCutSheet = templateSlug === "a4-8-landscape-cut-sheet";
  const columns = isLandscapeCutSheet ? 2 : 3;
  const rows = isLandscapeCutSheet ? 4 : 3;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 opacity-55">
      {Array.from({ length: columns - 1 }, (_, index) => (
        <span
          key={`v-${index}`}
          className="absolute top-0 h-full w-px bg-charcoal/55"
          style={{ left: `${((index + 1) / columns) * 100}%` }}
        />
      ))}
      {Array.from({ length: rows - 1 }, (_, index) => (
        <span
          key={`h-${index}`}
          className="absolute left-0 h-px w-full bg-charcoal/55"
          style={{ top: `${((index + 1) / rows) * 100}%` }}
        />
      ))}
    </div>
  );
}

function ProtectedWatermark({ projectLabel }: { projectLabel: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-50 grid grid-cols-3 content-center gap-y-8 overflow-hidden opacity-25"
    >
      {Array.from({ length: 24 }, (_, index) => (
        <span
          key={index}
          className="-rotate-12 select-none text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal-soft"
        >
          {projectLabel}
        </span>
      ))}
    </div>
  );
}

function createPhotoMap(photos: UploadedProjectPhoto[]) {
  const photoMap = new Map<string, UploadedProjectPhoto>();

  photos.forEach((photo, index) => {
    photoMap.set(photo.id ?? `local-photo-${index + 1}`, photo);
  });

  return photoMap;
}
