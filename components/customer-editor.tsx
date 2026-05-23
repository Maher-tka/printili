"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MontagePreview } from "@/components/montage-preview";
import { cn } from "@/lib/cn";
import { normalizeEditableFitModeForSlot } from "@/lib/placement-fit";
import { getPhotoSource } from "@/lib/photo-url";
import {
  calculateSmartPhotoPlacement,
  detectFaceFocusFromImageUrl,
  isNeutralPlacement,
  shouldRepairUnsafePolaroidRotation
} from "@/lib/smart-photo-fit";
import {
  POLAROID_TEMPLATE_SLUG,
  getEditableTextStyle,
  getPolaroidCaptionStyleScope,
  getPolaroidCaptionTextKey,
  getTextStyleValueKey,
  handwritingFontOptions,
  textColorOptions,
  type TextStyleProperty
} from "@/lib/text-style-options";
import type {
  GuestProjectSummary,
  ImplementedFitMode,
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
type EditorPanel = "photos" | "adjust" | "text" | "more";

type EditorHistorySnapshot = {
  placements: ProjectPlacementSummary[];
  textValues: Record<string, string>;
};

const fitModeOptions: Array<{
  value: ImplementedFitMode;
  label: string;
  description: string;
}> = [
  {
    value: "smart_crop",
    label: "Smart Fix",
    description: "Protects faces and fixes the crop automatically."
  },
  {
    value: "cover",
    label: "Fill frame",
    description: "Fill the photo spot edge to edge."
  },
  {
    value: "contain",
    label: "Fit full photo",
    description: "Show the whole photo without cropping."
  },
  {
    value: "contain_blur",
    label: "Blur background",
    description: "Show the full photo with a soft background fill."
  }
];

const quickEmojis = [
  { label: "heart", value: "\u2665" },
  { label: "sparkle", value: "\u2728" },
  { label: "gift", value: "\u{1F381}" },
  { label: "star", value: "\u2B50" },
  { label: "flower", value: "\u{1F338}" },
  { label: "smile", value: "\u{1F60A}" }
];

type QuickEmoji = (typeof quickEmojis)[number];

const editorPanelTabs: Array<{ value: EditorPanel; label: string }> = [
  { value: "photos", label: "Photos" },
  { value: "adjust", label: "Adjust" },
  { value: "text", label: "Text" },
  { value: "more", label: "More" }
];

export function CustomerEditor({
  project,
  template,
  layout,
  adminMode = false
}: CustomerEditorProps) {
  const initialPlacements = useMemo(
    () =>
      project.placements.map((placement, index) =>
        normalizePlacementForEditor(
          placement,
          layout.slots.find((slot) => slot.id === placement.slotId) ?? layout.slots[index]
        )
      ),
    [layout.slots, project.placements]
  );
  const initialTextValues = useMemo(
    () => getInitialTextValues(layout.textFields, project.textValues),
    [layout.textFields, project.textValues]
  );
  const [placements, setPlacements] = useState<ProjectPlacementSummary[]>(initialPlacements);
  const [textValues, setTextValues] = useState<Record<string, string>>(initialTextValues);
  const [selectedSlotId, setSelectedSlotId] = useState(layout.slots[0]?.id ?? "");
  const [activePanel, setActivePanel] = useState<EditorPanel>("photos");
  const [placementSaveState, setPlacementSaveState] = useState<SaveState>("saved");
  const [textSaveState, setTextSaveState] = useState<SaveState>("saved");
  const [historyPast, setHistoryPast] = useState<EditorHistorySnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorHistorySnapshot[]>([]);
  const [showCutGuides, setShowCutGuides] = useState(template.hasCutGuides);
  const placementSaveVersionRef = useRef(0);
  const textSaveVersionRef = useRef(0);
  const smartFitAppliedRef = useRef(new Set<string>());
  const dragHistorySlotRef = useRef<string | null>(null);
  const savedPlacementPayloadsRef = useRef(
    new Map(initialPlacements.map((placement) => [placement.id, serializePlacement(placement)]))
  );
  const savedTextValuesRef = useRef(new Map(Object.entries(initialTextValues)));
  const renderedSlots = useMemo(
    () =>
      layout.slots.map((slot) => ({
        slot,
        placement: placements.find((placement) => placement.slotId === slot.id)
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
  const canUndo = historyPast.length > 0;
  const canRedo = historyFuture.length > 0;

  function getEditorSnapshot(): EditorHistorySnapshot {
    return {
      placements: placements.map((placement) => ({ ...placement })),
      textValues: { ...textValues }
    };
  }

  function pushHistory() {
    const snapshot = getEditorSnapshot();

    setHistoryPast((currentHistory) => [...currentHistory.slice(-49), snapshot]);
    setHistoryFuture([]);
  }

  function applyHistorySnapshot(snapshot: EditorHistorySnapshot) {
    setPlacements(snapshot.placements.map((placement) => ({ ...placement })));
    setTextValues({ ...snapshot.textValues });
  }

  function undoEditorChange() {
    if (!historyPast.length) {
      return;
    }

    const previousSnapshot = historyPast[historyPast.length - 1];
    setHistoryFuture((currentHistory) => [getEditorSnapshot(), ...currentHistory].slice(0, 50));
    setHistoryPast((currentHistory) => currentHistory.slice(0, -1));
    applyHistorySnapshot(previousSnapshot);
  }

  function redoEditorChange() {
    if (!historyFuture.length) {
      return;
    }

    const nextSnapshot = historyFuture[0];
    setHistoryPast((currentHistory) => [...currentHistory.slice(-49), getEditorSnapshot()]);
    setHistoryFuture((currentHistory) => currentHistory.slice(1));
    applyHistorySnapshot(nextSnapshot);
  }

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
      setPlacementSaveState("saved");
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
      setTextSaveState("saved");
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

  useEffect(() => {
    let cancelled = false;
    const photoMap = createCustomerPhotoMap(project.photos);
    const smartFitCandidates = placements.filter((placement) => {
      const slot = layout.slots.find((currentSlot) => currentSlot.id === placement.slotId);
      const photo = photoMap.get(placement.photoId);
      const key = getSmartFitKey(placement);

      return Boolean(
        slot &&
          photo &&
          (isNeutralPlacement(placement) ||
            shouldRepairUnsafePolaroidRotation({
              photo,
              placement,
              slot,
              templateSlug: template.slug
            })) &&
          !smartFitAppliedRef.current.has(key)
      );
    });

    if (smartFitCandidates.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    smartFitCandidates.forEach((placement) => smartFitAppliedRef.current.add(getSmartFitKey(placement)));
    setPlacements((currentPlacements) =>
      currentPlacements.map((placement) => {
        if (!smartFitCandidates.some((candidate) => candidate.id === placement.id)) {
          return placement;
        }

        const slot = layout.slots.find((currentSlot) => currentSlot.id === placement.slotId);
        const photo = photoMap.get(placement.photoId);

        if (!slot || !photo) {
          return placement;
        }

        return {
          ...placement,
          ...calculateSmartPhotoPlacement({
            photo,
            slot,
            templateSlug: template.slug
          })
        };
      })
    );

    smartFitCandidates.forEach((placement) => {
      const slot = layout.slots.find((currentSlot) => currentSlot.id === placement.slotId);
      const photo = photoMap.get(placement.photoId);

      if (!slot || !photo) {
        return;
      }

      void detectFaceFocusFromImageUrl(getPhotoSource(photo.originalUrl, { lowRes: false })).then(
        (faceFocus) => {
          if (!faceFocus || cancelled) {
            return;
          }

          setPlacements((currentPlacements) =>
            currentPlacements.map((currentPlacement) =>
              currentPlacement.id === placement.id
                ? {
                    ...currentPlacement,
                    ...calculateSmartPhotoPlacement({
                      faceFocus,
                      photo,
                      slot,
                      templateSlug: template.slug
                    })
                  }
                : currentPlacement
            )
          );
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [layout.slots, placements, project.photos, template.slug]);

  useEffect(() => {
    function handleEditorShortcut(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const usesModifier = event.ctrlKey || event.metaKey;

      if (usesModifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoEditorChange();
        } else {
          undoEditorChange();
        }
        return;
      }

      if (usesModifier && key === "y") {
        event.preventDefault();
        redoEditorChange();
        return;
      }

      if (!selectedPlacement) {
        return;
      }

      const nudgeAmount = event.shiftKey ? 10 : 3;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgePlacement("offsetY", -nudgeAmount);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgePlacement("offsetY", nudgeAmount);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgePlacement("offsetX", -nudgeAmount);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgePlacement("offsetX", nudgeAmount);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        updateSelectedPlacement({ zoom: clamp(selectedPlacement.zoom + 0.05, 1, 2.8) });
      } else if (event.key === "-") {
        event.preventDefault();
        updateSelectedPlacement({ zoom: clamp(selectedPlacement.zoom - 0.05, 1, 2.8) });
      } else if (key === "r") {
        event.preventDefault();
        updateSelectedPlacement({ rotation: clamp(selectedPlacement.rotation + 5, -90, 90) });
      } else if (event.key === "0") {
        event.preventDefault();
        void resetSelectedSmartPosition();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        void clearSelectedSlotPhoto();
      }
    }

    window.addEventListener("keydown", handleEditorShortcut);

    return () => window.removeEventListener("keydown", handleEditorShortcut);
  });

  function updateSelectedPlacement(patch: Partial<ProjectPlacementSummary>) {
    if (!selectedPlacement) {
      return;
    }

    pushHistory();
    setPlacements((currentPlacements) =>
      currentPlacements.map((placement) =>
        placement.id === selectedPlacement.id ? { ...placement, ...patch } : placement
      )
    );
  }

  async function refinePlacementWithFaceFocus({
    cancelled,
    photo,
    placementId,
    slot
  }: {
    cancelled: () => boolean;
    photo: GuestProjectSummary["photos"][number];
    placementId: string;
    slot: TemplateEditorLayout["slots"][number];
  }) {
    const faceFocus = await detectFaceFocusFromImageUrl(
      getPhotoSource(photo.originalUrl, { lowRes: false })
    );

    if (!faceFocus || cancelled()) {
      return;
    }

    setPlacements((currentPlacements) =>
      currentPlacements.map((placement) => {
        if (placement.id !== placementId) {
          return placement;
        }

        return {
          ...placement,
          ...calculateSmartPhotoPlacement({
            faceFocus,
            photo,
            slot,
            templateSlug: template.slug
          })
        };
      })
    );
  }

  async function resetSelectedSmartPosition() {
    if (!selectedPlacement || !selectedRenderedSlot) {
      return;
    }

    const photo = findPhotoById(project.photos, selectedPlacement.photoId);

    if (!photo) {
      return;
    }

    pushHistory();
    const basePlacement = calculateSmartPhotoPlacement({
      photo,
      slot: selectedRenderedSlot.slot,
      templateSlug: template.slug
    });
    setPlacements((currentPlacements) =>
      currentPlacements.map((placement) =>
        placement.id === selectedPlacement.id ? { ...placement, ...basePlacement } : placement
      )
    );

    await refinePlacementWithFaceFocus({
      cancelled: () => false,
      photo,
      placementId: selectedPlacement.id,
      slot: selectedRenderedSlot.slot
    });
  }

  function dragPlacement(slotId: string, deltaX: number, deltaY: number) {
    const placement = placements.find((currentPlacement) => currentPlacement.slotId === slotId);

    if (!placement) {
      return;
    }

    if (dragHistorySlotRef.current !== slotId) {
      pushHistory();
      dragHistorySlotRef.current = slotId;
    }

    setSelectedSlotId(slotId);
    setPlacements((currentPlacements) =>
      currentPlacements.map((currentPlacement) =>
        currentPlacement.slotId === slotId
          ? {
              ...currentPlacement,
              offsetX: clamp(currentPlacement.offsetX + deltaX, -80, 80),
              offsetY: clamp(currentPlacement.offsetY + deltaY, -80, 80)
            }
          : currentPlacement
      )
    );
  }

  function endPlacementDrag() {
    dragHistorySlotRef.current = null;
  }

  function nudgePlacement(axis: "offsetX" | "offsetY", amount: number) {
    if (!selectedPlacement) {
      return;
    }

    updateSelectedPlacement({
      [axis]: clamp(selectedPlacement[axis] + amount, -80, 80)
    });
  }

  function updateTextValue(fieldKey: string, value: string, maxLength = 500) {
    const trimmedValue = value.slice(0, maxLength);

    pushHistory();
    setTextValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: trimmedValue
    }));
  }

  function updateTextField(field: TemplateTextFieldSeed, value: string) {
    updateTextValue(field.key, value, field.maxLength ?? 500);
  }

  function insertEmoji(field: TemplateTextFieldSeed, emoji: string) {
    updateTextField(field, `${textValues[field.key] ?? ""}${emoji}`);
  }

  function updateTextStyle(scope: string, property: TextStyleProperty, value: string) {
    updateTextValue(getTextStyleValueKey(scope, property), value, 120);
  }

  function changeFitMode(fitMode: ImplementedFitMode) {
    const selectedSlot = selectedRenderedSlot?.slot;

    if (fitMode === "contain_blur" && selectedSlot?.allowBlurFill === false) {
      return;
    }

    if (fitMode === "smart_crop" && selectedSlot?.allowSmartCrop === false) {
      return;
    }

    if (fitMode === "smart_crop") {
      void resetSelectedSmartPosition();
      return;
    }

    if (fitMode === "contain_blur" || fitMode === "contain") {
      updateSelectedPlacement({
        fitMode,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        blurBackground: fitMode === "contain_blur"
      });
      return;
    }

    updateSelectedPlacement({ fitMode, blurBackground: false });
  }

  async function changeSelectedPhoto(photoId: string) {
    if (!selectedPlacement || selectedPlacement.photoId === photoId) {
      return;
    }

    const selectedSlot = selectedRenderedSlot?.slot;
    const photo = findPhotoById(project.photos, photoId);

    if (!selectedSlot || !photo) {
      return;
    }

    pushHistory();
    const smartPlacement = calculateSmartPhotoPlacement({
      photo,
      slot: selectedSlot,
      templateSlug: template.slug
    });
    setPlacements((currentPlacements) =>
      currentPlacements.map((placement) =>
        placement.id === selectedPlacement.id
          ? {
              ...placement,
              photoId,
              ...smartPlacement
            }
          : placement
      )
    );

    await refinePlacementWithFaceFocus({
      cancelled: () => false,
      photo,
      placementId: selectedPlacement.id,
      slot: selectedSlot
    });
  }

  function toggleBlurBackground(enabled: boolean) {
    if (!selectedPlacement) {
      return;
    }

    if (enabled) {
      changeFitMode("contain_blur");
      return;
    }

    if (selectedPlacement.fitMode === "contain_blur") {
      changeFitMode("contain");
      return;
    }

    updateSelectedPlacement({
      blurBackground: false
    });
  }

  function resetManualCrop() {
    updateSelectedPlacement({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      focusX: 50,
      focusY: 50,
      blurBackground: false,
      fitMode: "cover"
    });
  }

  async function clearSelectedSlotPhoto() {
    if (!selectedPlacement) {
      return;
    }

    pushHistory();
    setPlacements((currentPlacements) =>
      currentPlacements.filter((placement) => placement.id !== selectedPlacement.id)
    );
    setPlacementSaveState("saving");

    try {
      const response = await fetch(`/api/projects/${project.guestToken}/placements`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          placementId: selectedPlacement.id,
          slotId: selectedPlacement.slotId
        })
      });

      if (!response.ok) {
        throw new Error("Clear slot failed.");
      }

      savedPlacementPayloadsRef.current.delete(selectedPlacement.id);
      setPlacementSaveState("saved");
    } catch {
      setPlacementSaveState("error");
    }
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
              {adminMode ? "Admin design check" : "Make it print-ready"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-charcoal-soft sm:text-base">
              Drag a photo to move it, use Smart Fix when faces look cut, and preview before
              ordering. Your changes save automatically. Print size:{" "}
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
          <div className="flex flex-1 flex-wrap items-center justify-center gap-2 text-xs font-semibold text-paper/78">
            {adminMode ? (
              <span className="rounded-full bg-paper/10 px-3 py-1">Admin production view</span>
            ) : null}
            <span className="rounded-full bg-paper/10 px-3 py-1">{project.photos.length} photos</span>
            <span className="rounded-full bg-paper/10 px-3 py-1">{unusedPhotoCount} unused</span>
            <span className="rounded-full bg-paper/10 px-3 py-1">
              {filledSlotCount}/{layout.slots.length} spots filled
            </span>
          </div>
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
                  onSlotDrag={dragPlacement}
                  onSlotDragEnd={endPlacementDrag}
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
              activePanel={activePanel}
              adminMode={adminMode}
              selectedPlacement={selectedPlacement}
              selectedSlotId={selectedSlotId}
              selectedSlotIndex={selectedSlotIndex}
              textValues={textValues}
              templateSlug={template.slug}
              canRedo={canRedo}
              canUndo={canUndo}
              onFitModeChange={changeFitMode}
              onPanelChange={setActivePanel}
              onClearSlotPhoto={clearSelectedSlotPhoto}
              onPhotoChange={changeSelectedPhoto}
              onRedo={redoEditorChange}
              onUndo={undoEditorChange}
              onNudge={nudgePlacement}
              onReset={resetManualCrop}
              onResetSmart={() => void resetSelectedSmartPosition()}
              onBlurBackgroundChange={toggleBlurBackground}
              onTextChange={updateTextField}
              onTextStyleChange={updateTextStyle}
              onTextValueChange={updateTextValue}
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
          activePanel={activePanel}
          adminMode={adminMode}
          selectedPlacement={selectedPlacement}
          selectedSlotId={selectedSlotId}
          selectedSlotIndex={selectedSlotIndex}
          textValues={textValues}
          templateSlug={template.slug}
          canRedo={canRedo}
          canUndo={canUndo}
          onFitModeChange={changeFitMode}
          onPanelChange={setActivePanel}
          onClearSlotPhoto={clearSelectedSlotPhoto}
          onPhotoChange={changeSelectedPhoto}
          onRedo={redoEditorChange}
          onUndo={undoEditorChange}
          onNudge={nudgePlacement}
          onReset={resetManualCrop}
          onResetSmart={() => void resetSelectedSmartPosition()}
          onBlurBackgroundChange={toggleBlurBackground}
          onTextChange={updateTextField}
          onTextStyleChange={updateTextStyle}
          onTextValueChange={updateTextValue}
          onEmojiInsert={insertEmoji}
          onToggleCutGuides={setShowCutGuides}
          onRotationChange={(rotation) => updateSelectedPlacement({ rotation })}
          onSlotSelect={setSelectedSlotId}
          onZoomChange={(zoom) => updateSelectedPlacement({ zoom })}
        />
      </div>
    </section>
  );
}

function EditorControls({
  activePanel,
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
  templateSlug,
  onZoomChange,
  onRotationChange,
  onNudge,
  onFitModeChange,
  onPanelChange,
  onPhotoChange,
  onReset,
  onResetSmart,
  onBlurBackgroundChange,
  onTextChange,
  onTextStyleChange,
  onTextValueChange,
  onEmojiInsert,
  onSlotSelect,
  onToggleCutGuides,
  canRedo,
  canUndo,
  onClearSlotPhoto,
  onRedo,
  onUndo
}: {
  activePanel: EditorPanel;
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
  templateSlug: string;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onNudge: (axis: "offsetX" | "offsetY", amount: number) => void;
  onFitModeChange: (fitMode: ImplementedFitMode) => void;
  onPanelChange: (panel: EditorPanel) => void;
  onPhotoChange: (photoId: string) => void;
  onReset: () => void;
  onResetSmart: () => void;
  onBlurBackgroundChange: (enabled: boolean) => void;
  onTextChange: (field: TemplateTextFieldSeed, value: string) => void;
  onTextStyleChange: (scope: string, property: TextStyleProperty, value: string) => void;
  onTextValueChange: (fieldKey: string, value: string, maxLength?: number) => void;
  onEmojiInsert: (field: TemplateTextFieldSeed, emoji: string) => void;
  onSlotSelect: (slotId: string) => void;
  onToggleCutGuides: (showCutGuides: boolean) => void;
  canRedo: boolean;
  canUndo: boolean;
  onClearSlotPhoto: () => void;
  onRedo: () => void;
  onUndo: () => void;
}) {
  const selectedSlot = selectedSlotIndex >= 0 ? layout.slots[selectedSlotIndex] : undefined;
  const availableFitOptions = fitModeOptions.filter((option) => {
    if (option.value === "contain_blur") {
      return selectedSlot?.allowBlurFill !== false;
    }

    if (option.value === "smart_crop") {
      return selectedSlot?.allowSmartCrop !== false;
    }

    return true;
  });
  const canCrop = Boolean(selectedPlacement);
  const zoomPercent = Math.round((selectedPlacement?.zoom ?? 1) * 100);
  const rotationDegrees = Math.round(selectedPlacement?.rotation ?? 0);
  const selectedPhoto = selectedPlacement
    ? findPhotoById(photos, selectedPlacement.photoId)
    : undefined;
  const isPolaroidTemplate = templateSlug === POLAROID_TEMPLATE_SLUG;
  const nextBestAction = getNextBestAction({
    filledSlotCount,
    saveState,
    selectedPlacement: Boolean(selectedPlacement),
    selectedSlotIndex,
    totalSlots: layout.slots.length
  });
  const hasTextTools = Boolean(
    layout.textFields.length > 0 || (isPolaroidTemplate && selectedSlot)
  );

  return (
    <div className="editor-inspector min-w-0 overflow-x-hidden p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
            {selectedPlacement ? `Editing spot ${selectedSlotIndex + 1}` : "Choose a photo spot"}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {selectedPlacement ? (selectedPhoto?.fileName ?? "Photo crop") : "Tap a spot to begin"}
          </p>
        </div>
        <SaveBadge state={saveState} />
      </div>

      <NextBestActionCard action={nextBestAction} />
      <EditorPanelTabs activePanel={activePanel} hasTextTools={hasTextTools} onPanelChange={onPanelChange} />

      <div className="mt-4 grid gap-4">
        <SlotQuickPicker
          filledSlotCount={filledSlotCount}
          layout={layout}
          photos={photos}
          placements={placements}
          selectedSlotId={selectedSlotId}
          onSlotSelect={onSlotSelect}
        />

        {activePanel === "photos" ? (
          <PhotoPanel
            photoUsageById={photoUsageById}
            photos={photos}
            selectedPhotoId={selectedPlacement?.photoId}
            selectedSlotIndex={selectedSlotIndex}
            unusedPhotoCount={unusedPhotoCount}
            onClearSlotPhoto={onClearSlotPhoto}
            onPhotoChange={onPhotoChange}
          />
        ) : null}

        {activePanel === "adjust" ? (
          <AdjustPanel
            canCrop={canCrop}
            selectedPlacement={selectedPlacement}
            selectedSlot={selectedSlot}
            zoomPercent={zoomPercent}
            onBlurBackgroundChange={onBlurBackgroundChange}
            onFitModeChange={onFitModeChange}
            onResetSmart={onResetSmart}
            onZoomChange={onZoomChange}
          />
        ) : null}

        {activePanel === "text" ? (
          <TextPanel
            isPolaroidTemplate={isPolaroidTemplate}
            layout={layout}
            quickEmojis={quickEmojis}
            selectedSlot={selectedSlot}
            selectedSlotIndex={selectedSlotIndex}
            textValues={textValues}
            onEmojiInsert={onEmojiInsert}
            onTextChange={onTextChange}
            onTextStyleChange={onTextStyleChange}
            onTextValueChange={onTextValueChange}
          />
        ) : null}

        {activePanel === "more" ? (
          <MorePanel
            adminMode={adminMode}
            availableFitOptions={availableFitOptions}
            canCrop={canCrop}
            canRedo={canRedo}
            canUndo={canUndo}
            rotationDegrees={rotationDegrees}
            selectedPlacement={selectedPlacement}
            showCutGuides={showCutGuides}
            onClearSlotPhoto={onClearSlotPhoto}
            onFitModeChange={onFitModeChange}
            onNudge={onNudge}
            onRedo={onRedo}
            onReset={onReset}
            onRotationChange={onRotationChange}
            onToggleCutGuides={onToggleCutGuides}
            onUndo={onUndo}
          />
        ) : null}
      </div>
    </div>
  );
}

function NextBestActionCard({
  action
}: {
  action: {
    title: string;
    body: string;
    tone: "good" | "warn" | "neutral";
  };
}) {
  return (
    <div
      className={cn(
        "mt-4 rounded-[8px] border px-3 py-3 text-sm leading-6",
        action.tone === "warn"
          ? "border-rose/25 bg-rose-soft/35 text-charcoal"
          : action.tone === "good"
            ? "border-[rgb(199_163_95_/_0.28)] bg-cream text-charcoal"
            : "border-[rgb(199_163_95_/_0.22)] bg-paper text-charcoal"
      )}
    >
      <p className="font-semibold">{action.title}</p>
      <p className="mt-1 text-xs leading-5 text-charcoal-soft">{action.body}</p>
    </div>
  );
}

function EditorPanelTabs({
  activePanel,
  hasTextTools,
  onPanelChange
}: {
  activePanel: EditorPanel;
  hasTextTools: boolean;
  onPanelChange: (panel: EditorPanel) => void;
}) {
  return (
    <div
      aria-label="Editor tools"
      className="mt-4 grid grid-cols-4 gap-1 rounded-full bg-cream p-1"
      role="tablist"
    >
      {editorPanelTabs.map((tab) => {
        const isActive = activePanel === tab.value;
        const isDisabled = tab.value === "text" && !hasTextTools;

        return (
          <button
            aria-controls={`editor-panel-${tab.value}`}
            aria-disabled={isDisabled}
            aria-selected={isActive}
            className={cn(
              "focus-ring min-h-10 rounded-full px-2 text-xs font-semibold transition",
              isActive
                ? "bg-charcoal text-paper shadow-[0_8px_18px_rgb(45_41_38_/_0.16)]"
                : "text-charcoal-soft hover:bg-paper hover:text-charcoal",
              isDisabled && "cursor-not-allowed opacity-45"
            )}
            key={tab.value}
            onClick={() => {
              if (!isDisabled) {
                onPanelChange(tab.value);
              }
            }}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function PhotoPanel({
  photoUsageById,
  photos,
  selectedPhotoId,
  selectedSlotIndex,
  unusedPhotoCount,
  onClearSlotPhoto,
  onPhotoChange
}: {
  photoUsageById: Map<string, number[]>;
  photos: GuestProjectSummary["photos"];
  selectedPhotoId?: string;
  selectedSlotIndex: number;
  unusedPhotoCount: number;
  onClearSlotPhoto: () => void;
  onPhotoChange: (photoId: string) => void;
}) {
  return (
    <section aria-labelledby="editor-panel-photos-title" id="editor-panel-photos" role="tabpanel">
      <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-paper p-3">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-rose"
          id="editor-panel-photos-title"
        >
          Photos
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          Pick a photo to replace the selected spot. Unused photos are highlighted so they are easy
          to find.
        </p>
      </div>

      {selectedPhotoId ? (
        <div className="mt-3 grid gap-3">
          <PhotoLibraryCarousel
            photos={photos}
            photoUsageById={photoUsageById}
            selectedPhotoId={selectedPhotoId}
            selectedSlotIndex={selectedSlotIndex}
            unusedPhotoCount={unusedPhotoCount}
            onPhotoChange={onPhotoChange}
          />
          <button
            className="focus-ring min-h-11 rounded-full border border-rose/35 bg-paper px-4 text-sm font-semibold text-rose transition hover:bg-rose-soft"
            onClick={onClearSlotPhoto}
            type="button"
          >
            Remove photo from this spot
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-cream p-3 text-sm leading-6 text-charcoal-soft">
          Tap a filled photo spot on the preview, then choose the replacement photo here.
        </div>
      )}
    </section>
  );
}

function AdjustPanel({
  canCrop,
  selectedPlacement,
  selectedSlot,
  zoomPercent,
  onBlurBackgroundChange,
  onFitModeChange,
  onResetSmart,
  onZoomChange
}: {
  canCrop: boolean;
  selectedPlacement?: ProjectPlacementSummary;
  selectedSlot?: TemplateEditorLayout["slots"][number];
  zoomPercent: number;
  onBlurBackgroundChange: (enabled: boolean) => void;
  onFitModeChange: (fitMode: ImplementedFitMode) => void;
  onResetSmart: () => void;
  onZoomChange: (zoom: number) => void;
}) {
  return (
    <section aria-labelledby="editor-panel-adjust-title" id="editor-panel-adjust" role="tabpanel">
      <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-paper p-3">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-rose"
          id="editor-panel-adjust-title"
        >
          Adjust photo
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          Drag the photo inside the frame, or use Smart Fix if a face or important detail is cut.
        </p>
      </div>

      <div className="mt-3 grid gap-3">
        <button
          className="focus-ring min-h-12 rounded-full bg-charcoal px-4 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedPlacement || selectedSlot?.allowSmartCrop === false}
          onClick={onResetSmart}
          type="button"
        >
          Smart Fix
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="focus-ring min-h-11 rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-3 text-sm font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedPlacement}
            onClick={() => onFitModeChange("contain")}
            type="button"
          >
            Fit full photo
          </button>
          <button
            className="focus-ring min-h-11 rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-3 text-sm font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedPlacement}
            onClick={() => onFitModeChange("cover")}
            type="button"
          >
            Fill frame
          </button>
        </div>

        <label className="flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.25)] bg-paper px-3 text-sm font-semibold text-charcoal">
          Blur background
          <input
            checked={selectedPlacement?.blurBackground ?? false}
            className="size-4 accent-rose"
            disabled={!selectedPlacement || selectedSlot?.allowBlurFill === false}
            onChange={(event) => onBlurBackgroundChange(event.target.checked)}
            type="checkbox"
          />
        </label>

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
            min={1}
            onChange={(event) => onZoomChange(Number(event.target.value))}
            step={0.05}
            type="range"
            value={selectedPlacement?.zoom ?? 1}
          />
        </label>
      </div>
    </section>
  );
}

function TextPanel({
  isPolaroidTemplate,
  layout,
  quickEmojis,
  selectedSlot,
  selectedSlotIndex,
  textValues,
  onEmojiInsert,
  onTextChange,
  onTextStyleChange,
  onTextValueChange
}: {
  isPolaroidTemplate: boolean;
  layout: TemplateEditorLayout;
  quickEmojis: QuickEmoji[];
  selectedSlot?: TemplateEditorLayout["slots"][number];
  selectedSlotIndex: number;
  textValues: Record<string, string>;
  onEmojiInsert: (field: TemplateTextFieldSeed, emoji: string) => void;
  onTextChange: (field: TemplateTextFieldSeed, value: string) => void;
  onTextStyleChange: (scope: string, property: TextStyleProperty, value: string) => void;
  onTextValueChange: (fieldKey: string, value: string, maxLength?: number) => void;
}) {
  const hasPolaroidCaption = isPolaroidTemplate && selectedSlot;

  if (!hasPolaroidCaption && layout.textFields.length === 0) {
    return (
      <section id="editor-panel-text" role="tabpanel">
        <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-cream p-3 text-sm leading-6 text-charcoal-soft">
          This template does not need text. You can keep editing photos or preview your design.
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="editor-panel-text-title" id="editor-panel-text" role="tabpanel">
      <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-paper p-3">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-rose"
          id="editor-panel-text-title"
        >
          Text
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          Add a short message, choose a handwriting style, and keep the text readable for print.
        </p>
      </div>

      <div className="mt-3 grid gap-3">
        {hasPolaroidCaption ? (
          <PolaroidCaptionControls
            selectedSlotIndex={selectedSlotIndex}
            slotId={selectedSlot.id}
            textValues={textValues}
            onTextStyleChange={onTextStyleChange}
            onTextValueChange={onTextValueChange}
          />
        ) : null}

        {layout.textFields.length > 0 ? (
          <TemplateTextFieldControls
            layout={layout}
            quickEmojis={quickEmojis}
            textValues={textValues}
            onEmojiInsert={onEmojiInsert}
            onTextChange={onTextChange}
            onTextStyleChange={onTextStyleChange}
          />
        ) : null}
      </div>
    </section>
  );
}

function MorePanel({
  adminMode,
  availableFitOptions,
  canCrop,
  canRedo,
  canUndo,
  rotationDegrees,
  selectedPlacement,
  showCutGuides,
  onClearSlotPhoto,
  onFitModeChange,
  onNudge,
  onRedo,
  onReset,
  onRotationChange,
  onToggleCutGuides,
  onUndo
}: {
  adminMode: boolean;
  availableFitOptions: typeof fitModeOptions;
  canCrop: boolean;
  canRedo: boolean;
  canUndo: boolean;
  rotationDegrees: number;
  selectedPlacement?: ProjectPlacementSummary;
  showCutGuides: boolean;
  onClearSlotPhoto: () => void;
  onFitModeChange: (fitMode: ImplementedFitMode) => void;
  onNudge: (axis: "offsetX" | "offsetY", amount: number) => void;
  onRedo: () => void;
  onReset: () => void;
  onRotationChange: (rotation: number) => void;
  onToggleCutGuides: (showCutGuides: boolean) => void;
  onUndo: () => void;
}) {
  return (
    <section aria-labelledby="editor-panel-more-title" id="editor-panel-more" role="tabpanel">
      <div className="rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-paper p-3">
        <p
          className="text-xs font-semibold uppercase tracking-[0.12em] text-rose"
          id="editor-panel-more-title"
        >
          More controls
        </p>
        <p className="mt-2 text-sm leading-6 text-charcoal-soft">
          Fine-tune only when needed. Most customers can finish with Photos, Adjust, and Text.
        </p>
      </div>

      {adminMode ? (
        <div className="mt-3 rounded-[8px] border border-charcoal/10 bg-charcoal p-3 text-sm leading-6 text-paper">
          Admin-only production view. Use these controls for final print checks and cleanup.
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          className="focus-ring min-h-10 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-xs font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canUndo}
          onClick={onUndo}
          type="button"
        >
          Undo
        </button>
        <button
          className="focus-ring min-h-10 rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-xs font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canRedo}
          onClick={onRedo}
          type="button"
        >
          Redo
        </button>
        <button
          className="focus-ring min-h-10 rounded-full border border-rose/35 bg-paper px-3 text-xs font-semibold text-rose transition hover:bg-rose-soft disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!selectedPlacement}
          onClick={onClearSlotPhoto}
          type="button"
        >
          Clear
        </button>
      </div>

      <div className="mt-3 grid gap-3">
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
            max={90}
            min={-90}
            onChange={(event) => onRotationChange(Number(event.target.value))}
            step={1}
            type="range"
            value={selectedPlacement?.rotation ?? 0}
          />
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

        <div className="grid gap-2 text-sm font-semibold text-charcoal">
          <span>Exact fit mode</span>
          <div className="grid gap-2" role="group" aria-label="Photo fit mode">
            {availableFitOptions.map((option) => {
              const isActive = selectedPlacement?.fitMode === option.value;

              return (
                <button
                  aria-pressed={isActive}
                  className={cn(
                    "focus-ring min-h-14 rounded-[10px] border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                    isActive
                      ? "border-rose bg-rose-soft text-charcoal shadow-[0_10px_24px_rgb(191_127_134_/_0.16)]"
                      : "border-[rgb(199_163_95_/_0.32)] bg-paper text-charcoal hover:border-rose/70 hover:bg-cream"
                  )}
                  disabled={!selectedPlacement}
                  key={option.value}
                  onClick={() => onFitModeChange(option.value)}
                  type="button"
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs font-normal leading-5 text-charcoal-soft">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.25)] bg-paper px-3 text-sm font-semibold text-charcoal">
          Show cut guides
          <input
            checked={showCutGuides}
            className="size-4 accent-rose"
            onChange={(event) => onToggleCutGuides(event.target.checked)}
            type="checkbox"
          />
        </label>

        <button
          className="focus-ring min-h-11 rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-4 text-sm font-semibold text-charcoal transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedPlacement}
          onClick={onReset}
          type="button"
        >
          Reset manual edits
        </button>
      </div>
    </section>
  );
}

function TemplateTextFieldControls({
  layout,
  quickEmojis,
  textValues,
  onEmojiInsert,
  onTextChange,
  onTextStyleChange
}: {
  layout: TemplateEditorLayout;
  quickEmojis: QuickEmoji[];
  textValues: Record<string, string>;
  onEmojiInsert: (field: TemplateTextFieldSeed, emoji: string) => void;
  onTextChange: (field: TemplateTextFieldSeed, value: string) => void;
  onTextStyleChange: (scope: string, property: TextStyleProperty, value: string) => void;
}) {
  return (
    <div className="grid gap-3">
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
          <TextStyleControls
            defaultFontSize={field.fontSize}
            maxFontSize={72}
            minFontSize={10}
            scope={field.key}
            textValues={textValues}
            onTextStyleChange={onTextStyleChange}
          />
        </label>
      ))}
    </div>
  );
}

function PolaroidCaptionControls({
  selectedSlotIndex,
  slotId,
  textValues,
  onTextStyleChange,
  onTextValueChange
}: {
  selectedSlotIndex: number;
  slotId: string;
  textValues: Record<string, string>;
  onTextStyleChange: (scope: string, property: TextStyleProperty, value: string) => void;
  onTextValueChange: (fieldKey: string, value: string, maxLength?: number) => void;
}) {
  const captionKey = getPolaroidCaptionTextKey(slotId);
  const captionScope = getPolaroidCaptionStyleScope(slotId);
  const captionValue = textValues[captionKey] ?? "";

  return (
    <section
      aria-label={`Caption tools for photo spot ${selectedSlotIndex + 1}`}
      className="rounded-[8px] border border-[rgb(199_163_95_/_0.25)] bg-paper p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose">
          Caption text
        </p>
        <span className="rounded-full bg-cream px-2 py-1 text-xs font-semibold text-charcoal-soft">
          Spot {selectedSlotIndex + 1}
        </span>
      </div>
      <label className="mt-3 grid gap-2 text-sm font-semibold text-charcoal">
        Write under photo
        <input
          className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-normal text-charcoal"
          maxLength={42}
          onChange={(event) => onTextValueChange(captionKey, event.target.value, 42)}
          placeholder="Our adventure"
          value={captionValue}
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Caption emoji tools">
        {quickEmojis.map((emoji) => (
          <button
            aria-label={`Add ${emoji.label}`}
            className="focus-ring flex size-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.35)] bg-cream text-sm transition hover:bg-rose-soft"
            key={emoji.label}
            onClick={() => onTextValueChange(captionKey, `${captionValue}${emoji.value}`, 42)}
            type="button"
          >
            {emoji.value}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <TextStyleControls
          defaultFontSize={18}
          maxFontSize={32}
          minFontSize={10}
          scope={captionScope}
          textValues={textValues}
          onTextStyleChange={onTextStyleChange}
        />
      </div>
    </section>
  );
}

function TextStyleControls({
  defaultFontSize,
  maxFontSize,
  minFontSize,
  scope,
  textValues,
  onTextStyleChange
}: {
  defaultFontSize: number;
  maxFontSize: number;
  minFontSize: number;
  scope: string;
  textValues: Record<string, string>;
  onTextStyleChange: (scope: string, property: TextStyleProperty, value: string) => void;
}) {
  const style = getEditableTextStyle({
    defaultFontSize,
    scope,
    textValues
  });

  return (
    <div className="grid gap-3 rounded-[8px] border border-[rgb(199_163_95_/_0.2)] bg-cream p-3">
      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        Font
        <select
          className="focus-ring min-h-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper px-3 text-sm font-medium text-charcoal"
          onChange={(event) => onTextStyleChange(scope, "fontFamily", event.target.value)}
          value={style.fontFamily}
        >
          {handwritingFontOptions.map((font) => (
            <option key={font.family} value={font.family}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <div
        className="min-h-12 rounded-[8px] border border-[rgb(199_163_95_/_0.24)] bg-paper px-3 py-2 text-center text-lg leading-tight text-charcoal"
        style={{
          color: style.color,
          fontFamily: style.fontStack,
          fontStyle: style.isItalic ? "italic" : "normal",
          fontWeight: style.isBold ? 700 : 400,
          textAlign: style.align
        }}
      >
        Memories forever
      </div>

      <div className="grid grid-cols-5 gap-2" aria-label="Text style controls">
        <StyleToggleButton
          active={style.isBold}
          label="Bold"
          onClick={() => onTextStyleChange(scope, "bold", style.isBold ? "0" : "1")}
        >
          B
        </StyleToggleButton>
        <StyleToggleButton
          active={style.isItalic}
          label="Italic"
          onClick={() => onTextStyleChange(scope, "italic", style.isItalic ? "0" : "1")}
        >
          I
        </StyleToggleButton>
        <StyleToggleButton
          active={style.align === "left"}
          label="Align left"
          onClick={() => onTextStyleChange(scope, "align", "left")}
        >
          L
        </StyleToggleButton>
        <StyleToggleButton
          active={style.align === "center"}
          label="Align center"
          onClick={() => onTextStyleChange(scope, "align", "center")}
        >
          C
        </StyleToggleButton>
        <StyleToggleButton
          active={style.align === "right"}
          label="Align right"
          onClick={() => onTextStyleChange(scope, "align", "right")}
        >
          R
        </StyleToggleButton>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-charcoal">
        <span className="flex items-center justify-between gap-3">
          <span>Size</span>
          <span className="rounded-full bg-paper px-2 py-1 text-xs text-charcoal-soft">
            {Math.round(style.fontSize)} px
          </span>
        </span>
        <input
          className="accent-rose"
          max={maxFontSize}
          min={minFontSize}
          onChange={(event) => onTextStyleChange(scope, "fontSize", event.target.value)}
          step={1}
          type="range"
          value={style.fontSize}
        />
      </label>

      <div className="grid gap-2 text-sm font-semibold text-charcoal">
        Color
        <div className="flex flex-wrap items-center gap-2">
          {textColorOptions.map((color) => (
            <button
              aria-label={`Use text color ${color}`}
              aria-pressed={style.color === color}
              className={cn(
                "focus-ring size-8 rounded-full border transition",
                style.color === color
                  ? "border-charcoal ring-2 ring-rose/35"
                  : "border-[rgb(199_163_95_/_0.45)]"
              )}
              key={color}
              onClick={() => onTextStyleChange(scope, "color", color)}
              style={{ backgroundColor: color }}
              type="button"
            />
          ))}
          <input
            aria-label="Custom text color"
            className="focus-ring h-8 w-11 rounded-[8px] border border-[rgb(199_163_95_/_0.35)] bg-paper p-1"
            onChange={(event) => onTextStyleChange(scope, "color", event.target.value)}
            type="color"
            value={style.color}
          />
        </div>
      </div>
    </div>
  );
}

function StyleToggleButton({
  active,
  children,
  label,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "focus-ring flex aspect-square min-h-10 items-center justify-center rounded-[8px] border text-sm font-bold transition",
        active
          ? "border-rose bg-rose-soft text-charcoal"
          : "border-[rgb(199_163_95_/_0.35)] bg-paper text-charcoal hover:bg-cream"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
          const placement = placements.find(
            (currentPlacement) => currentPlacement.slotId === slot.id
          );
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

function getNextBestAction({
  filledSlotCount,
  saveState,
  selectedPlacement,
  selectedSlotIndex,
  totalSlots
}: {
  filledSlotCount: number;
  saveState: SaveState;
  selectedPlacement: boolean;
  selectedSlotIndex: number;
  totalSlots: number;
}) {
  if (saveState === "error") {
    return {
      title: "Keep this page open",
      body: "We could not save the latest change yet. Your editor will keep retrying before checkout.",
      tone: "warn" as const
    };
  }

  if (saveState === "saving") {
    return {
      title: "Saving your change...",
      body: "Wait a moment before previewing or submitting so the print file stays current.",
      tone: "neutral" as const
    };
  }

  if (!selectedPlacement) {
    return {
      title: "Tap a photo spot to edit it",
      body: `${filledSlotCount}/${totalSlots} spots are filled. Choose any spot on the preview or the strip below.`,
      tone: "neutral" as const
    };
  }

  return {
    title: `Editing spot ${selectedSlotIndex + 1}`,
    body: "Drag the photo to move it. Use Smart Fix if faces, hair, or important details look cut.",
    tone: "good" as const
  };
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
    focusX: placement.focusX,
    focusY: placement.focusY,
    blurBackground: placement.blurBackground,
    fitMode: placement.fitMode
  });
}

function normalizePlacementForEditor(
  placement: ProjectPlacementSummary,
  slot?: TemplateEditorLayout["slots"][number]
): ProjectPlacementSummary {
  const fitMode = normalizeEditableFitModeForSlot(placement.fitMode, slot);

  return {
    ...placement,
    fitMode,
    zoom: clamp(placement.zoom, 1, 2.8),
    offsetX: clamp(placement.offsetX, -80, 80),
    offsetY: clamp(placement.offsetY, -80, 80),
    rotation: clamp(placement.rotation, -90, 90),
    focusX: clamp(placement.focusX, 0, 100),
    focusY: clamp(placement.focusY, 0, 100),
    blurBackground: placement.blurBackground || fitMode === "contain_blur"
  };
}

function getSmartFitKey(placement: ProjectPlacementSummary) {
  return `${placement.id}:${placement.photoId}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}
