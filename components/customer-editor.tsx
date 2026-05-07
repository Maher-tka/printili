"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MontagePreview } from "@/components/montage-preview";
import { cn } from "@/lib/cn";
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

  useEffect(() => {
    if (!selectedPlacement) {
      return;
    }

    const payload = serializePlacement(selectedPlacement);

    if (savedPlacementPayloadsRef.current.get(selectedPlacement.id) === payload) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setPlacementSaveState("saving");

      try {
        const response = await fetch(`/api/projects/${project.guestToken}/placements`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: payload
        });

        if (!response.ok) {
          throw new Error("Placement autosave failed.");
        }

        savedPlacementPayloadsRef.current.set(selectedPlacement.id, payload);
        setPlacementSaveState("saved");
      } catch {
        setPlacementSaveState("error");
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [project.guestToken, selectedPlacement]);

  useEffect(() => {
    const changedFields = Object.entries(textValues).filter(
      ([key, value]) => savedTextValuesRef.current.get(key) !== value
    );

    if (changedFields.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setTextSaveState("saving");

      try {
        await Promise.all(
          changedFields.map(([fieldKey, value]) =>
            fetch(`/api/projects/${project.guestToken}/text`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ fieldKey, value })
            }).then((response) => {
              if (!response.ok) {
                throw new Error("Text autosave failed.");
              }
            })
          )
        );

        changedFields.forEach(([fieldKey, value]) => {
          savedTextValuesRef.current.set(fieldKey, value);
        });
        setTextSaveState("saved");
      } catch {
        setTextSaveState("error");
      }
    }, 550);

    return () => window.clearTimeout(timeoutId);
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
    updateSelectedPlacement({ photoId });
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
              Tap a photo, then use the simple controls to make every crop feel right. Print size:{" "}
              <span className="font-semibold text-charcoal">
                {formatSheetSizeCm(template.sheetSize, template.orientation)}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-5 text-sm font-semibold text-charcoal transition hover:bg-cream"
              href={`/project/${project.guestToken}/preview`}
            >
              Preview
            </Link>
            {!adminMode ? (
              <Link
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper shadow-[0_16px_35px_rgb(45_41_38_/_0.18)] transition hover:bg-[rgb(62_55_51)]"
                href={`/project/${project.guestToken}/checkout`}
              >
                Submit Order
              </Link>
            ) : null}
          </div>
        </div>

        <div className="editor-command-bar mt-6">
          <span className="hidden text-xs font-semibold text-paper/65 sm:inline">New project</span>
          <span className="hidden h-6 w-px bg-paper/15 sm:inline" aria-hidden="true" />
          <span className="rounded-full bg-paper/10 px-3 py-1 text-xs font-semibold text-paper">
            {formatSheetSizeCm(template.sheetSize, template.orientation)}
          </span>
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
          <SaveBadge state={placementSaveState === "saved" ? textSaveState : placementSaveState} />
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
              showCutGuides={showCutGuides}
              adminMode={adminMode}
              placementSaveState={placementSaveState}
              selectedPlacement={selectedPlacement}
              selectedSlotIndex={selectedSlotIndex}
              textSaveState={textSaveState}
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
              onZoomChange={(zoom) => updateSelectedPlacement({ zoom })}
            />
            <div className="mt-4">
              <SaveDesignPanel project={project} />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 max-h-[72vh] overflow-y-auto border-t border-[rgb(199_163_95_/_0.25)] bg-paper/95 px-4 py-3 shadow-[0_-18px_45px_rgb(45_41_38_/_0.12)] backdrop-blur lg:hidden">
        <EditorControls
          layout={layout}
          photos={project.photos}
          showCutGuides={showCutGuides}
          adminMode={adminMode}
          placementSaveState={placementSaveState}
          selectedPlacement={selectedPlacement}
          selectedSlotIndex={selectedSlotIndex}
          textSaveState={textSaveState}
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
  selectedSlotIndex,
  placementSaveState,
  textSaveState,
  layout,
  photos,
  showCutGuides,
  adminMode,
  textValues,
  onZoomChange,
  onNudge,
  onFitModeChange,
  onPhotoChange,
  onReset,
  onTextChange,
  onEmojiInsert,
  onToggleCutGuides
}: {
  selectedPlacement?: ProjectPlacementSummary;
  selectedSlotIndex: number;
  placementSaveState: SaveState;
  textSaveState: SaveState;
  layout: TemplateEditorLayout;
  photos: GuestProjectSummary["photos"];
  showCutGuides: boolean;
  adminMode: boolean;
  textValues: Record<string, string>;
  onZoomChange: (zoom: number) => void;
  onNudge: (axis: "offsetX" | "offsetY", amount: number) => void;
  onFitModeChange: (fitMode: EditableFitMode) => void;
  onPhotoChange: (photoId: string) => void;
  onReset: () => void;
  onTextChange: (field: TemplateTextFieldSeed, value: string) => void;
  onEmojiInsert: (field: TemplateTextFieldSeed, emoji: string) => void;
  onToggleCutGuides: (showCutGuides: boolean) => void;
}) {
  const isContainBlur = selectedPlacement?.fitMode === "contain_blur";
  const canCrop = Boolean(selectedPlacement && !isContainBlur);

  return (
    <div className="editor-inspector max-h-[46vh] overflow-y-auto p-4 lg:max-h-none lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
            Slot {selectedSlotIndex + 1}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {selectedPlacement ? "Photo crop" : "Choose a filled slot"}
          </p>
        </div>
        <SaveBadge state={placementSaveState === "saved" ? textSaveState : placementSaveState} />
      </div>

      <div className="mt-4 grid gap-4">
        <DesignToolsPanel />

        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Zoom
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

        <label className="flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.25)] bg-paper px-3 text-sm font-semibold text-charcoal">
          Show cut guides
          <input
            checked={showCutGuides}
            className="size-4 accent-rose"
            onChange={(event) => onToggleCutGuides(event.target.checked)}
            type="checkbox"
          />
        </label>

        {adminMode && selectedPlacement ? (
          <label className="grid gap-2 text-sm font-semibold text-charcoal">
            Swap photo
            <select
              className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm text-charcoal"
              onChange={(event) => onPhotoChange(event.target.value)}
              value={selectedPlacement.photoId}
            >
              {photos.map((photo, index) => (
                <option key={photo.id ?? index} value={photo.id ?? `local-photo-${index + 1}`}>
                  Photo {index + 1}: {photo.fileName}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="grid gap-2 text-sm font-semibold text-charcoal">
          Fit
          <select
            className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm text-charcoal"
            disabled={!selectedPlacement}
            onChange={(event) => onFitModeChange(event.target.value as EditableFitMode)}
            value={selectedPlacement?.fitMode ?? "cover"}
          >
            {Object.entries(fitModeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
            className="focus-ring min-h-11 rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-4 text-sm font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedPlacement}
            onClick={onReset}
            type="button"
          >
            Reset crop
          </button>
          <button
            className="min-h-11 rounded-full border border-[rgb(199_163_95_/_0.28)] bg-cream px-4 text-sm font-semibold text-charcoal-soft opacity-75"
            disabled
            type="button"
          >
            Replace photo
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
