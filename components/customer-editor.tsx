"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MontagePreview } from "@/components/montage-preview";
import { cn } from "@/lib/cn";
import { getPhotoSource } from "@/lib/photo-url";
import type {
  EditableFitMode,
  GuestProjectSummary,
  ProjectPlacementSummary
} from "@/lib/project-store";
import { formatSheetSizeCm } from "@/lib/templates";
import type { TemplateEditorLayout, TemplateSeed, TemplateTextFieldSeed } from "@/types/templates";

type CustomerEditorProps = {
  project: GuestProjectSummary;
  template: TemplateSeed;
  layout: TemplateEditorLayout;
  adminMode?: boolean;
};

type SaveState = "saved" | "saving" | "error";

const fitModeLabels: Record<EditableFitMode, string> = {
  cover: "Fill slot",
  contain_blur: "Fit with blur",
  smart_crop: "Smart crop (soon)",
  face_priority: "Face priority (soon)",
  subject_priority: "Subject priority (soon)"
};

const quickEmojis = [
  { label: "heart", value: "\u2665" },
  { label: "sparkle", value: "\u2728" },
  { label: "gift", value: "\u{1F381}" },
  { label: "star", value: "\u2B50" },
  { label: "flower", value: "\u{1F338}" },
  { label: "smile", value: "\u{1F60A}" }
];

const editorTopTools = ["Templates", "Photos", "Text", "Emoji", "Layout", "Effects"];

export function CustomerEditor({
  project,
  template,
  layout,
  adminMode = false
}: CustomerEditorProps) {
  const initialTextValues = useMemo(
    () => getInitialTextValues(layout.textFields, project.textValues),
    [layout.textFields, project.textValues]
  );
  const [placements, setPlacements] = useState<ProjectPlacementSummary[]>(project.placements);
  const [textValues, setTextValues] = useState<Record<string, string>>(initialTextValues);
  const [selectedSlotId, setSelectedSlotId] = useState(layout.slots[0]?.id ?? "");
  const [placementSaveState, setPlacementSaveState] = useState<SaveState>("saved");
  const [textSaveState, setTextSaveState] = useState<SaveState>("saved");
  const [showCutGuides, setShowCutGuides] = useState(template.hasCutGuides);
  const placementSaveVersionRef = useRef(0);
  const textSaveVersionRef = useRef(0);
  const savedPlacementPayloadsRef = useRef(
    new Map(project.placements.map((placement) => [placement.id, serializePlacement(placement)]))
  );
  const savedTextValuesRef = useRef(new Map(Object.entries(initialTextValues)));
  const renderedSlots = useMemo(
    () =>
      layout.slots.map((slot, index) => ({
        slot,
        placement: placements.find((placement) => placement.slotId === slot.id) ?? placements[index]
      })),
    [layout.slots, placements]
  );
  const selectedSlotIndex = renderedSlots.findIndex(({ slot }) => slot.id === selectedSlotId);
  const selectedRenderedSlot = selectedSlotIndex >= 0 ? renderedSlots[selectedSlotIndex] : null;
  const selectedPlacement = selectedRenderedSlot?.placement;
  const filledSlotCount = renderedSlots.filter(({ placement }) => Boolean(placement)).length;
  const photoUsageById = useMemo(
    () => createPhotoUsageMap(renderedSlots, project.photos),
    [project.photos, renderedSlots]
  );
  const unusedPhotoCount = project.photos.filter(
    (photo, index) => (photoUsageById.get(getCustomerPhotoId(photo, index))?.length ?? 0) === 0
  ).length;
  const combinedSaveState = placementSaveState === "saved" ? textSaveState : placementSaveState;

  useEffect(() => {
    const changedPlacements = placements
      .map((placement) => ({
        placement,
        payload: serializePlacement(placement)
      }))
      .filter(
        ({ placement, payload }) => savedPlacementPayloadsRef.current.get(placement.id) !== payload
      );

    if (changedPlacements.length === 0) {
      return;
    }

    const saveVersion = ++placementSaveVersionRef.current;
    const abortController = new AbortController();
    setPlacementSaveState("saving");

    const timeoutId = window.setTimeout(async () => {
      try {
        await Promise.all(
          changedPlacements.map(({ payload }) =>
            fetch(`/api/projects/${project.guestToken}/placements`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: payload,
              signal: abortController.signal
            }).then((response) => {
              if (!response.ok) {
                throw new Error("Placement autosave failed.");
              }
            })
          )
        );

        if (abortController.signal.aborted || saveVersion !== placementSaveVersionRef.current) {
          return;
        }

        changedPlacements.forEach(({ placement, payload }) => {
          savedPlacementPayloadsRef.current.set(placement.id, payload);
        });
        setPlacementSaveState("saved");
      } catch {
        if (abortController.signal.aborted || saveVersion !== placementSaveVersionRef.current) {
          return;
        }

        setPlacementSaveState("error");
      }
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [placements, project.guestToken]);

  useEffect(() => {
    const changedFields = Object.entries(textValues).filter(
      ([key, value]) => savedTextValuesRef.current.get(key) !== value
    );

    if (changedFields.length === 0) {
      return;
    }

    const saveVersion = ++textSaveVersionRef.current;
    const abortController = new AbortController();
    setTextSaveState("saving");

    const timeoutId = window.setTimeout(async () => {
      try {
        await Promise.all(
          changedFields.map(([fieldKey, value]) =>
            fetch(`/api/projects/${project.guestToken}/text`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ fieldKey, value }),
              signal: abortController.signal
            }).then((response) => {
              if (!response.ok) {
                throw new Error("Text autosave failed.");
              }
            })
          )
        );

        if (abortController.signal.aborted || saveVersion !== textSaveVersionRef.current) {
          return;
        }

        changedFields.forEach(([fieldKey, value]) => {
          savedTextValuesRef.current.set(fieldKey, value);
        });
        setTextSaveState("saved");
      } catch {
        if (abortController.signal.aborted || saveVersion !== textSaveVersionRef.current) {
          return;
        }

        setTextSaveState("error");
      }
    }, 550);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [project.guestToken, textValues]);

  function updateSelectedPlacement(patch: Partial<ProjectPlacementSummary>) {
    if (!selectedPlacement) {
      return;
    }

    setPlacements((currentPlacements) =>
      currentPlacements.map((placement) =>
        placement.id === selectedPlacement.id ? { ...placement, ...patch } : placement
      )
    );
  }

  function nudgePlacement(axis: "offsetX" | "offsetY", amount: number) {
    if (!selectedPlacement) {
      return;
    }

    updateSelectedPlacement({
      [axis]: clamp(selectedPlacement[axis] + amount, -80, 80)
    });
  }

  function updateTextField(field: TemplateTextFieldSeed, value: string) {
    const trimmedValue = field.maxLength ? value.slice(0, field.maxLength) : value;

    setTextValues((currentValues) => ({
      ...currentValues,
      [field.key]: trimmedValue
    }));
  }

  function insertEmoji(field: TemplateTextFieldSeed, emoji: string) {
    updateTextField(field, `${textValues[field.key] ?? ""}${emoji}`);
  }

  function changeFitMode(fitMode: EditableFitMode) {
    if (isFutureFitMode(fitMode)) {
      return;
    }

    if (fitMode === "contain_blur") {
      updateSelectedPlacement({
        fitMode,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0
      });
      return;
    }

    updateSelectedPlacement({ fitMode });
  }

  function changeSelectedPhoto(photoId: string) {
    if (!selectedPlacement || selectedPlacement.photoId === photoId) {
      return;
    }

    updateSelectedPlacement({
      photoId,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      fitMode: selectedPlacement.fitMode === "contain_blur" ? "contain_blur" : "cover"
    });
  }

  return (
    <section className="editor-workspace pb-44 lg:pb-12" aria-labelledby="editor-heading">
      <div className="page-shell py-5 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
              Project {project.projectCode}
            </p>
            <h1
              id="editor-heading"
              className="mt-2 font-display text-3xl leading-tight sm:text-5xl"
            >
              {adminMode ? "Admin design tools" : "Adjust your design"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-charcoal-soft sm:text-base">
              All uploaded photos stay saved in this project, including extras. Print size:{" "}
              <span className="font-semibold text-charcoal">
                {formatSheetSizeCm(template.sheetSize, template.orientation)}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <EditorNavigationLink
              href={`/project/${project.guestToken}/preview`}
              saveState={combinedSaveState}
              variant="secondary"
            >
              Preview
            </EditorNavigationLink>
            {!adminMode ? (
              <EditorNavigationLink
                href={`/project/${project.guestToken}/checkout`}
                saveState={combinedSaveState}
                variant="primary"
              >
                Submit Order
              </EditorNavigationLink>
            ) : null}
          </div>
        </div>

        <div className="editor-command-bar mt-6">
          <span className="rounded-full bg-paper/10 px-3 py-1 text-xs font-semibold text-paper">
            {formatSheetSizeCm(template.sheetSize, template.orientation)}
          </span>
          {adminMode ? (
            <>
              <span className="hidden text-xs font-semibold text-paper/65 sm:inline">
                New project
              </span>
              <span className="hidden h-6 w-px bg-paper/15 sm:inline" aria-hidden="true" />
              <div className="flex flex-1 flex-wrap justify-center gap-1.5">
                {editorTopTools.map((tool, index) => (
                  <button
                    aria-pressed={index === 1}
                    className={cn("editor-command-bar__button", index === 1 && "is-active")}
                    key={tool}
                    type="button"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-wrap items-center justify-center gap-2 text-xs font-semibold text-paper/78">
              <span className="rounded-full bg-paper/10 px-3 py-1">
                {project.photos.length} photos
              </span>
              <span className="rounded-full bg-paper/10 px-3 py-1">{unusedPhotoCount} unused</span>
            </div>
          )}
          <SaveBadge state={combinedSaveState} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="editor-canvas-shell">
            <div className="mx-auto w-full max-w-[430px] sm:max-w-[520px] lg:max-w-[580px]">
              <div className="editor-canvas-frame">
                <MontagePreview
                  layout={layout}
                  photos={project.photos}
                  placements={placements}
                  selectedSlotId={selectedSlotId}
                  showCutGuides={showCutGuides}
                  template={template}
                  textValues={textValues}
                  onSlotSelect={setSelectedSlotId}
                />
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <EditorControls
              layout={layout}
              photos={project.photos}
              photoUsageById={photoUsageById}
              placements={placements}
              showCutGuides={showCutGuides}
              saveState={combinedSaveState}
              filledSlotCount={filledSlotCount}
              unusedPhotoCount={unusedPhotoCount}
              adminMode={adminMode}
              selectedPlacement={selectedPlacement}
              selectedSlotId={selectedSlotId}
              selectedSlotIndex={selectedSlotIndex}
              textValues={textValues}
              onFitModeChange={changeFitMode}
              onPhotoChange={changeSelectedPhoto}
              onNudge={nudgePlacement}
              onReset={() =>
                updateSelectedPlacement({
                  zoom: 1,
                  offsetX: 0,
                  offsetY: 0,
                  rotation: 0,
                  fitMode: "cover"
                })
              }
              onTextChange={updateTextField}
              onEmojiInsert={insertEmoji}
              onToggleCutGuides={setShowCutGuides}
              onRotationChange={(rotation) => updateSelectedPlacement({ rotation })}
              onSlotSelect={setSelectedSlotId}
              onZoomChange={(zoom) => updateSelectedPlacement({ zoom })}
            />
            <div className="mt-4">
              <SaveDesignPanel project={project} />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 max-h-[72vh] overflow-y-auto overflow-x-hidden border-t border-[rgb(199_163_95_/_0.25)] bg-paper/95 px-4 py-3 shadow-[0_-18px_45px_rgb(45_41_38_/_0.12)] backdrop-blur lg:hidden">
        <EditorControls
          layout={layout}
          photos={project.photos}
          photoUsageById={photoUsageById}
          placements={placements}
          showCutGuides={showCutGuides}
          saveState={combinedSaveState}
          filledSlotCount={filledSlotCount}
          unusedPhotoCount={unusedPhotoCount}
          adminMode={adminMode}
          selectedPlacement={selectedPlacement}
          selectedSlotId={selectedSlotId}
          selectedSlotIndex={selectedSlotIndex}
          textValues={textValues}
          onFitModeChange={changeFitMode}
          onPhotoChange={changeSelectedPhoto}
          onNudge={nudgePlacement}
          onReset={() =>
            updateSelectedPlacement({
              zoom: 1,
              offsetX: 0,
              offsetY: 0,
              rotation: 0,
              fitMode: "cover"
            })
          }
          onTextChange={updateTextField}
          onEmojiInsert={insertEmoji}
          onToggleCutGuides={setShowCutGuides}
          onRotationChange={(rotation) => updateSelectedPlacement({ rotation })}
          onSlotSelect={setSelectedSlotId}
          onZoomChange={(zoom) => updateSelectedPlacement({ zoom })}
        />
        <div className="mt-3">
          <SaveDesignPanel project={project} />
        </div>
      </div>
    </section>
  );
}

function EditorControls({
  selectedPlacement,
  selectedSlotId,
  selectedSlotIndex,
  saveState,
  filledSlotCount,
  unusedPhotoCount,
  layout,
  photos,
  photoUsageById,
  placements,
  showCutGuides,
  adminMode,
  textValues,
  onZoomChange,
  onRotationChange,
  onNudge,
  onFitModeChange,
  onPhotoChange,
  onReset,
  onTextChange,
  onEmojiInsert,
  onSlotSelect,
  onToggleCutGuides
}: {
  selectedPlacement?: ProjectPlacementSummary;
  selectedSlotId: string;
  selectedSlotIndex: number;
  saveState: SaveState;
  filledSlotCount: number;
  unusedPhotoCount: number;
  layout: TemplateEditorLayout;
  photos: GuestProjectSummary["photos"];
  photoUsageById: Map<string, number[]>;
  placements: ProjectPlacementSummary[];
  showCutGuides: boolean;
  adminMode: boolean;
  textValues: Record<string, string>;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onNudge: (axis: "offsetX" | "offsetY", amount: number) => void;
  onFitModeChange: (fitMode: EditableFitMode) => void;
  onPhotoChange: (photoId: string) => void;
  onReset: () => void;
  onTextChange: (field: TemplateTextFieldSeed, value: string) => void;
  onEmojiInsert: (field: TemplateTextFieldSeed, emoji: string) => void;
  onSlotSelect: (slotId: string) => void;
  onToggleCutGuides: (showCutGuides: boolean) => void;
}) {
  const isContainBlur = selectedPlacement?.fitMode === "contain_blur";
  const canCrop = Boolean(selectedPlacement && !isContainBlur);
  const zoomPercent = Math.round((selectedPlacement?.zoom ?? 1) * 100);
  const rotationDegrees = Math.round(selectedPlacement?.rotation ?? 0);
  const selectedPhoto = selectedPlacement
    ? findPhotoById(photos, selectedPlacement.photoId)
    : undefined;

  return (
    <div className="editor-inspector min-w-0 overflow-x-hidden p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
            {selectedPlacement ? `Photo spot ${selectedSlotIndex + 1}` : "Photo spots"}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {selectedPlacement ? (selectedPhoto?.fileName ?? "Photo crop") : "Choose a filled slot"}
          </p>
        </div>
        <SaveBadge state={saveState} />
      </div>

      <div className="mt-4 grid gap-4">
        <SlotQuickPicker
          filledSlotCount={filledSlotCount}
          layout={layout}
          photos={photos}
          placements={placements}
          selectedSlotId={selectedSlotId}
          onSlotSelect={onSlotSelect}
        />

        {selectedPlacement ? (
          <PhotoLibraryCarousel
            photos={photos}
            photoUsageById={photoUsageById}
            selectedPhotoId={selectedPlacement.photoId}
            selectedSlotIndex={selectedSlotIndex}
            unusedPhotoCount={unusedPhotoCount}
            onPhotoChange={onPhotoChange}
          />
        ) : null}

        {adminMode ? <DesignToolsPanel /> : null}

        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          <span className="flex items-center justify-between gap-3">
            <span>Zoom</span>
            <span className="rounded-full bg-cream px-2 py-1 text-xs text-charcoal-soft">
              {zoomPercent}%
            </span>
          </span>
          <input
            className="accent-rose"
            disabled={!canCrop}
            max={2.8}
            min={0.5}
            onChange={(event) => onZoomChange(Number(event.target.value))}
            step={0.05}
            type="range"
            value={selectedPlacement?.zoom ?? 1}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          <span className="flex items-center justify-between gap-3">
            <span>Rotate</span>
            <span className="rounded-full bg-cream px-2 py-1 text-xs text-charcoal-soft">
              {rotationDegrees} deg
            </span>
          </span>
          <input
            className="accent-rose"
            disabled={!canCrop}
            max={45}
            min={-45}
            onChange={(event) => onRotationChange(Number(event.target.value))}
            step={1}
            type="range"
            value={selectedPlacement?.rotation ?? 0}
          />
        </label>

        <label className="flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.25)] bg-paper px-3 text-sm font-semibold text-charcoal">
          Show cut guides
          <input
            checked={showCutGuides}
            className="size-4 accent-rose"
            onChange={(event) => onToggleCutGuides(event.target.checked)}
            type="checkbox"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Fit
          <select
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm text-charcoal"
            disabled={!selectedPlacement}
            onChange={(event) => onFitModeChange(event.target.value as EditableFitMode)}
            value={selectedPlacement?.fitMode ?? "cover"}
          >
            {Object.entries(fitModeLabels).map(([value, label]) => {
              const fitMode = value as EditableFitMode;

              return (
                <option disabled={isFutureFitMode(fitMode)} key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <span className="text-xs font-normal leading-5 text-charcoal-soft">
            Blur background keeps the full photo visible and fills empty space naturally.
          </span>
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div />
          <IconButton disabled={!canCrop} label="Move up" onClick={() => onNudge("offsetY", -3)}>
            &#8593;
          </IconButton>
          <div />
          <IconButton disabled={!canCrop} label="Move left" onClick={() => onNudge("offsetX", -3)}>
            &#8592;
          </IconButton>
          <IconButton disabled={!canCrop} label="Move down" onClick={() => onNudge("offsetY", 3)}>
            &#8595;
          </IconButton>
          <IconButton disabled={!canCrop} label="Move right" onClick={() => onNudge("offsetX", 3)}>
            &#8594;
          </IconButton>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="focus-ring col-span-2 min-h-11 rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-4 text-sm font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedPlacement}
            onClick={onReset}
            type="button"
          >
            Reset crop
          </button>
        </div>
      </div>

      {layout.textFields.length > 0 ? (
        <div className="mt-5 border-t border-[rgb(199_163_95_/_0.25)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">Text</p>
          <div className="mt-3 grid gap-3">
            {layout.textFields.map((field) => (
              <label key={field.id} className="grid gap-2 text-sm font-semibold text-charcoal">
                {field.label}
                {field.maxLength && field.maxLength > 90 ? (
                  <textarea
                    className="focus-ring min-h-20 resize-none rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 py-2 text-sm font-normal text-charcoal"
                    maxLength={field.maxLength}
                    onChange={(event) => onTextChange(field, event.target.value)}
                    placeholder={field.placeholder}
                    value={textValues[field.key] ?? ""}
                  />
                ) : (
                  <input
                    className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal text-charcoal"
                    maxLength={field.maxLength}
                    onChange={(event) => onTextChange(field, event.target.value)}
                    placeholder={field.placeholder}
                    value={textValues[field.key] ?? ""}
                  />
                )}
                <div className="flex flex-wrap gap-2" aria-label={`Emoji tools for ${field.label}`}>
                  {quickEmojis.map((emoji) => (
                    <button
                      aria-label={`Add ${emoji.label}`}
                      className="focus-ring flex size-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.35)] bg-cream text-sm transition hover:bg-rose-soft"
                      key={emoji.label}
                      onClick={() => onEmojiInsert(field, emoji.value)}
                      type="button"
                    >
                      {emoji.value}
                    </button>
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SlotQuickPicker({
  filledSlotCount,
  layout,
  photos,
  placements,
  selectedSlotId,
  onSlotSelect
}: {
  filledSlotCount: number;
  layout: TemplateEditorLayout;
  photos: GuestProjectSummary["photos"];
  placements: ProjectPlacementSummary[];
  selectedSlotId: string;
  onSlotSelect: (slotId: string) => void;
}) {
  const photoById = createCustomerPhotoMap(photos);

  return (
    <div className="min-w-0 rounded-[8px] border border-[rgb(199_163_95_/_0.2)] bg-cream p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">Photo spots</p>
        <span className="text-xs font-semibold text-charcoal-soft">
          {filledSlotCount}/{layout.slots.length} filled
        </span>
      </div>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {layout.slots.map((slot, index) => {
          const placement =
            placements.find((currentPlacement) => currentPlacement.slotId === slot.id) ??
            placements[index];
          const photo = placement ? photoById.get(placement.photoId) : undefined;
          const isSelected = selectedSlotId === slot.id;

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "focus-ring flex min-w-[4.6rem] flex-col items-center gap-1 rounded-[8px] border bg-paper p-1.5 text-xs font-semibold transition",
                isSelected
                  ? "border-rose text-charcoal shadow-[0_8px_18px_rgb(191_127_134_/_0.2)]"
                  : "border-[rgb(199_163_95_/_0.25)] text-charcoal-soft hover:border-rose/60"
              )}
              key={slot.id}
              onClick={() => onSlotSelect(slot.id)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="grid aspect-square w-full place-items-center overflow-hidden rounded-[6px] bg-cream-strong text-[11px]"
                style={
                  photo
                    ? {
                        backgroundImage: `url("${getPhotoSource(photo.originalUrl, {
                          lowRes: true
                        })}")`,
                        backgroundPosition: "center",
                        backgroundSize: "cover"
                      }
                    : undefined
                }
              >
                {photo ? null : index + 1}
              </span>
              <span>Spot {index + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PhotoLibraryCarousel({
  photos,
  photoUsageById,
  selectedPhotoId,
  selectedSlotIndex,
  unusedPhotoCount,
  onPhotoChange
}: {
  photos: GuestProjectSummary["photos"];
  photoUsageById: Map<string, number[]>;
  selectedPhotoId: string;
  selectedSlotIndex: number;
  unusedPhotoCount: number;
  onPhotoChange: (photoId: string) => void;
}) {
  const selectedPhoto = findPhotoById(photos, selectedPhotoId);

  return (
    <section
      aria-label="My photos"
      className="min-w-0 rounded-[8px] border border-[rgb(199_163_95_/_0.25)] bg-paper p-3"
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">My photos</p>
        <span className="text-xs font-semibold text-charcoal-soft">{unusedPhotoCount} unused</span>
      </div>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {photos.map((photo, index) => {
          const photoId = getCustomerPhotoId(photo, index);
          const isSelected = photoId === selectedPhotoId;
          const usedInSlots = photoUsageById.get(photoId) ?? [];
          const statusLabel = getPhotoUsageLabel(usedInSlots);

          return (
            <button
              aria-label={`Use photo ${index + 1}: ${photo.fileName}`}
              aria-pressed={isSelected}
              className={cn(
                "focus-ring relative flex min-w-[5.35rem] flex-col gap-1 rounded-[8px] border bg-paper p-1.5 text-left transition",
                isSelected
                  ? "border-rose ring-2 ring-rose/35"
                  : "border-[rgb(199_163_95_/_0.3)] hover:border-rose/70"
              )}
              key={photoId}
              onClick={() => onPhotoChange(photoId)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="relative block aspect-square w-full overflow-hidden rounded-[6px] bg-cream-strong"
                style={{
                  backgroundImage: `url("${getPhotoSource(photo.originalUrl, { lowRes: true })}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }}
              >
                <span className="absolute left-1 top-1 rounded-full bg-paper/90 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal">
                  {index + 1}
                </span>
                {photo.qualityWarnings.length > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 right-1 size-2 rounded-full bg-rose"
                  />
                ) : null}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-center text-[10px] font-semibold",
                  usedInSlots.length === 0
                    ? "bg-rose-soft text-charcoal"
                    : "bg-cream text-charcoal-soft",
                  isSelected && "bg-charcoal text-paper"
                )}
              >
                {isSelected ? `In spot ${selectedSlotIndex + 1}` : statusLabel}
              </span>
            </button>
          );
        })}
      </div>
      {selectedPhoto ? (
        <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-charcoal-soft">
          {selectedPhoto.fileName}
        </p>
      ) : null}
    </section>
  );
}

function DesignToolsPanel() {
  const tools = ["Select", "Text", "Emoji", "Move", "Align", "Layers"];

  return (
    <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.18)] bg-charcoal p-3 text-paper">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-soft">
        Design tools
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {tools.map((tool, index) => (
          <button
            aria-pressed={index === 0}
            className={cn(
              "focus-ring min-h-10 rounded-full px-3 text-xs font-semibold transition",
              index === 0
                ? "bg-paper text-charcoal"
                : "border border-paper/15 bg-paper/8 text-paper hover:bg-paper/14"
            )}
            key={tool}
            type="button"
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
}

function SaveDesignPanel({ project }: { project: GuestProjectSummary }) {
  const magicPath = `/project/${project.guestToken}/editor`;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const magicLink = `${origin}${magicPath}`;
  const message = encodeURIComponent(
    `My photo montage project ${project.projectCode}: ${magicLink}`
  );

  return (
    <div className="soft-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">Save my design</p>
      <p className="mt-2 text-sm leading-6 text-charcoal-soft">
        No account needed. This private magic link opens your design until{" "}
        {new Date(project.expiresAt).toLocaleDateString()}.
      </p>
      <div className="mt-3 rounded-[8px] bg-cream px-3 py-2 text-xs font-semibold text-charcoal">
        {project.projectCode}
      </div>
      <input
        className="focus-ring mt-3 min-h-10 w-full rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-xs text-charcoal"
        readOnly
        value={magicLink}
      />
      <a
        className="focus-ring mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-charcoal px-4 text-sm font-semibold text-paper"
        href={`https://wa.me/?text=${message}`}
        rel="noreferrer"
        target="_blank"
      >
        Send to WhatsApp
      </a>
    </div>
  );
}

function EditorNavigationLink({
  children,
  href,
  saveState,
  variant
}: {
  children: ReactNode;
  href: string;
  saveState: SaveState;
  variant: "primary" | "secondary";
}) {
  const canNavigate = saveState === "saved";
  const waitingLabel = saveState === "saving" ? "Saving edits..." : "Save issue";

  return (
    <Link
      aria-disabled={!canNavigate}
      className={cn(
        "focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-charcoal text-paper shadow-[0_16px_35px_rgb(45_41_38_/_0.18)] hover:bg-[rgb(62_55_51)]"
          : "border border-[rgb(199_163_95_/_0.45)] bg-paper text-charcoal hover:bg-cream",
        !canNavigate && "cursor-wait opacity-70"
      )}
      href={href}
      onClick={(event) => {
        if (!canNavigate) {
          event.preventDefault();
        }
      }}
    >
      {canNavigate ? children : waitingLabel}
    </Link>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  const label = state === "saving" ? "Saving" : state === "error" ? "Retrying" : "Saved";

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        state === "error"
          ? "bg-rose-soft text-charcoal"
          : "bg-[rgb(199_163_95_/_0.16)] text-charcoal-soft"
      )}
    >
      {label}
    </span>
  );
}

function isFutureFitMode(fitMode: EditableFitMode) {
  return fitMode !== "cover" && fitMode !== "contain_blur";
}

function getCustomerPhotoId(photo: GuestProjectSummary["photos"][number], index: number) {
  return photo.id ?? `local-photo-${index + 1}`;
}

function findPhotoById(photos: GuestProjectSummary["photos"], photoId: string) {
  return photos.find((photo, index) => getCustomerPhotoId(photo, index) === photoId);
}

function createCustomerPhotoMap(photos: GuestProjectSummary["photos"]) {
  const photoMap = new Map<string, GuestProjectSummary["photos"][number]>();

  photos.forEach((photo, index) => {
    photoMap.set(getCustomerPhotoId(photo, index), photo);
  });

  return photoMap;
}

function createPhotoUsageMap(
  renderedSlots: Array<{
    slot: TemplateEditorLayout["slots"][number];
    placement?: ProjectPlacementSummary;
  }>,
  photos: GuestProjectSummary["photos"]
) {
  const photoIds = new Set(photos.map((photo, index) => getCustomerPhotoId(photo, index)));
  const usageMap = new Map<string, number[]>();

  renderedSlots.forEach(({ placement }, index) => {
    if (!placement || !photoIds.has(placement.photoId)) {
      return;
    }

    const currentSlots = usageMap.get(placement.photoId) ?? [];
    usageMap.set(placement.photoId, [...currentSlots, index + 1]);
  });

  return usageMap;
}

function getPhotoUsageLabel(slotNumbers: number[]) {
  if (slotNumbers.length === 0) {
    return "Unused";
  }

  if (slotNumbers.length === 1) {
    return `Spot ${slotNumbers[0]}`;
  }

  return `${slotNumbers.length} spots`;
}

function IconButton({
  children,
  disabled,
  label,
  onClick
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="focus-ring flex aspect-square h-11 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.4)] bg-paper text-lg font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function getInitialTextValues(
  textFields: TemplateTextFieldSeed[],
  projectTextValues: Record<string, string>
) {
  return Object.fromEntries(
    textFields.map((field) => [field.key, projectTextValues[field.key] ?? field.defaultValue ?? ""])
  );
}

function serializePlacement(placement: ProjectPlacementSummary) {
  return JSON.stringify({
    placementId: placement.id,
    photoId: placement.photoId,
    slotId: placement.slotId,
    zoom: placement.zoom,
    offsetX: placement.offsetX,
    offsetY: placement.offsetY,
    rotation: placement.rotation,
    fitMode: placement.fitMode
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
