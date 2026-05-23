"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getGenericRecommendationCategories } from "@/lib/templates";
import type { TemplateCategoryId } from "@/types/templates";

const maxPhotoSizeBytes = 12 * 1024 * 1024;

type UploadState = "idle" | "uploading" | "success" | "error";

type StartUploadFlowProps = {
  initialCategory?: TemplateCategoryId;
  initialTemplateSlug?: string;
  initialTemplateName?: string;
  initialTemplateSizeLabel?: string;
  initialTemplateMinPhotos?: number;
  initialTemplateMaxPhotos?: number;
  initialTemplateIsExplicitIntent?: boolean;
};

export function StartUploadFlow({
  initialCategory = "custom",
  initialTemplateSlug,
  initialTemplateName,
  initialTemplateSizeLabel,
  initialTemplateMinPhotos,
  initialTemplateMaxPhotos,
  initialTemplateIsExplicitIntent = false
}: StartUploadFlowProps) {
  const genericCategories = useMemo(() => getGenericRecommendationCategories(), []);
  const initialGenericCategory = genericCategories.some((item) => item.id === initialCategory)
    ? initialCategory
    : "custom";
  const [category, setCategory] = useState<TemplateCategoryId>(
    initialTemplateSlug ? initialCategory : initialGenericCategory
  );
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  const requirement = getPhotoRequirement(
    files.length,
    initialTemplateMinPhotos,
    initialTemplateMaxPhotos
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    updateSelectedFiles(mergeUniqueFiles(files, selectedFiles));
    event.currentTarget.value = "";
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingPhotos(false);

    const selectedFiles = Array.from(event.dataTransfer.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    updateSelectedFiles(mergeUniqueFiles(files, selectedFiles));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateFiles(files, initialTemplateMinPhotos);

    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    const body = new FormData();
    body.set("category", category);
    if (initialTemplateSlug) {
      body.set("templateSlug", initialTemplateSlug);
    }
    files.forEach((file) => body.append("photos", file));

    const request = new XMLHttpRequest();
    request.open("POST", "/api/projects/start");

    request.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      } else {
        setProgress(35);
      }
    };

    request.onload = () => {
      const response = parseUploadResponse(request.responseText);

      if (request.status >= 200 && request.status < 300 && response?.redirectTo) {
        setStatus("success");
        setProgress(100);
        window.location.href = response.redirectTo;
        return;
      }

      setStatus("error");
      setMessage(response?.message ?? "We could not upload those photos. Please try again.");
    };

    request.onerror = () => {
      setStatus("error");
      setMessage("The upload was interrupted. Please check your connection and try again.");
    };

    setStatus("uploading");
    setMessage(null);
    setProgress(5);
    request.send(body);
  }

  function moveFile(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= files.length) {
      return;
    }

    setFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      const [movedFile] = nextFiles.splice(fromIndex, 1);
      nextFiles.splice(toIndex, 0, movedFile);
      return nextFiles;
    });
  }

  function removeFile(indexToRemove: number) {
    updateSelectedFiles(removeFileAtIndex(files, indexToRemove));
  }

  function clearPhotoCarousel() {
    updateSelectedFiles([], { showValidation: false });
  }

  function updateSelectedFiles(
    nextFiles: File[],
    options: {
      showValidation?: boolean;
    } = {}
  ) {
    setFiles(nextFiles);
    setProgress(0);
    setStatus("idle");
    setMessage(
      options.showValidation === false ? null : validateFiles(nextFiles, initialTemplateMinPhotos)
    );
  }

  return (
    <form className="grid min-w-0 max-w-full gap-8 overflow-x-hidden" onSubmit={handleSubmit}>
      <div className="soft-card grid gap-3 p-4 sm:grid-cols-3">
        {[
          ["1", initialTemplateName ? "Product chosen" : "Choose gift type"],
          ["2", "Arrange photos"],
          ["3", "Create project"]
        ].map(([step, label], index) => (
          <div className="flex items-center gap-3" key={label}>
            <span
              className={`inline-flex size-9 items-center justify-center rounded-full text-sm font-bold ${
                index === 0 || files.length > 0
                  ? "bg-charcoal text-paper"
                  : "bg-cream text-charcoal-soft"
              }`}
            >
              {step}
            </span>
            <span className="text-sm font-semibold text-charcoal">{label}</span>
          </div>
        ))}
      </div>

      <section className="soft-card p-5 sm:p-6" aria-labelledby="category-step-heading">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-rose">Step 1</p>
            <h2 id="category-step-heading" className="mt-1 text-2xl font-semibold">
              {initialTemplateName ? "Confirm selected product" : "What are you making?"}
            </h2>
          </div>
        </div>

        {initialTemplateName ? (
          <div className="mt-5 rounded-[8px] bg-cream p-4">
            <p className="text-sm font-semibold text-charcoal">
              {initialTemplateIsExplicitIntent ? "Selected product" : "Selected design"}
            </p>
            <p className="mt-1 text-base font-semibold">{initialTemplateName}</p>
            {initialTemplateSizeLabel ? (
              <p className="mt-1 text-sm text-charcoal-soft">{initialTemplateSizeLabel}</p>
            ) : null}
            {initialTemplateIsExplicitIntent ? (
              <p className="mt-3 text-sm leading-6 text-charcoal-soft">
                This product is selected by size and occasion. After upload, you will edit the name,
                year, school or class, colors, message, and optional photo.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {genericCategories.map((item) => (
                <label
                  className="focus-within:ring-2 focus-within:ring-champagne rounded-[var(--radius-card)]"
                  key={item.id}
                >
                  <input
                    checked={category === item.id}
                    className="peer sr-only"
                    name="category"
                    onChange={() => setCategory(item.id)}
                    type="radio"
                    value={item.id}
                  />
                  <span className="block min-h-24 rounded-[var(--radius-card)] border border-[rgb(199_163_95_/_0.28)] bg-paper p-4 transition peer-checked:border-rose peer-checked:bg-rose-soft/70">
                    <span className="block text-base font-semibold text-charcoal">{item.name}</span>
                    <span className="mt-2 block text-sm leading-5 text-charcoal-soft">
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-[var(--radius-card)] border border-[rgb(216_115_85_/_0.22)] bg-rose-soft/50 p-4">
              <p className="text-base font-semibold text-charcoal">
                Making Graduation labels or stickers?
              </p>
              <p className="mt-2 text-sm leading-6 text-charcoal-soft">
                Choose the product first so Printili uses the correct size and shape before upload.
              </p>
              <Link
                className="focus-ring mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-charcoal px-4 text-sm font-semibold text-paper transition hover:bg-[rgb(62_55_51)]"
                href="/categories/graduation"
              >
                View Graduation products
              </Link>
            </div>
          </>
        )}
      </section>

      <section
        className="soft-card min-w-0 max-w-full overflow-x-hidden p-5 sm:p-6"
        aria-labelledby="upload-step-heading"
      >
        <p className="text-sm font-semibold text-rose">Step 2</p>
        <h2 id="upload-step-heading" className="mt-1 text-2xl font-semibold">
          Upload photos
        </h2>
        <p className="mt-3 text-sm leading-6 text-charcoal-soft">
          Your photos stay private and are used only for your order. Original files are kept for
          print quality, and you can add extra photos without losing the current carousel.
        </p>

        {initialTemplateName && initialTemplateMinPhotos ? (
          <div className="mt-4 rounded-[8px] border border-[rgb(199_163_95_/_0.24)] bg-paper p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-charcoal">Photo target</p>
                <p className="mt-1 text-sm text-charcoal-soft">
                  {formatRequiredPhotoRange(initialTemplateMinPhotos, initialTemplateMaxPhotos)}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  requirement.tone === "ready"
                    ? "bg-[rgb(34_128_91_/_0.12)] text-[rgb(25_96_68)]"
                    : "bg-rose-soft text-charcoal"
                }`}
              >
                {requirement.label}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-strong">
              <div
                className="h-full rounded-full bg-rose transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((files.length / initialTemplateMinPhotos) * 100)
                  )}%`
                }}
              />
            </div>
          </div>
        ) : null}

        <label
          className={`mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed px-5 py-8 text-center transition ${
            isDraggingPhotos
              ? "border-rose bg-rose-soft"
              : "border-[rgb(199_163_95_/_0.55)] bg-paper hover:bg-cream"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingPhotos(true);
          }}
          onDragLeave={() => setIsDraggingPhotos(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleFileDrop}
        >
          <span className="text-lg font-semibold">
            {isDraggingPhotos
              ? "Drop photos here"
              : files.length > 0
                ? "Add more photos to the carousel"
                : "Choose photos from your device"}
          </span>
          <span className="mt-2 text-sm leading-6 text-charcoal-soft">
            Drag and drop or browse. New uploads are added to your current photos. Up to 12 MB each.
          </span>
          <input
            accept="image/*"
            className="sr-only"
            multiple
            name="photos"
            onChange={handleFileChange}
            type="file"
          />
        </label>

        {files.length > 0 ? (
          <div className="mt-5 w-full min-w-0 max-w-full overflow-hidden rounded-[var(--radius-card)] bg-cream p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Selected photo carousel</p>
                <p className="mt-1 text-xs leading-5 text-charcoal-soft">
                  {files.length} photo{files.length === 1 ? "" : "s"} selected /{" "}
                  {formatFileSize(totalSize)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {initialTemplateMinPhotos ? (
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-charcoal-soft">
                    {formatRequiredPhotoRange(initialTemplateMinPhotos, initialTemplateMaxPhotos)}
                  </span>
                ) : null}
                <button
                  className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-rose/35 bg-paper px-3 text-xs font-semibold text-rose transition hover:bg-rose-soft"
                  onClick={clearPhotoCarousel}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                  Clear carousel
                </button>
              </div>
            </div>

            <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3">
              <ol
                aria-label="Selected photo carousel"
                className="flex w-max max-w-none snap-x gap-3 px-1"
              >
                {files.map((file, index) => (
                  <li
                    className="relative flex w-[13.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-[18px] border border-[rgb(199_163_95_/_0.24)] bg-paper shadow-[0_14px_34px_rgb(67_44_24_/_0.08)]"
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  >
                    <span
                      className="relative block aspect-[4/3] w-full bg-cream-strong"
                      style={
                        previewUrls[index]
                          ? {
                              backgroundImage: `url("${previewUrls[index]}")`,
                              backgroundPosition: "center",
                              backgroundSize: "cover"
                            }
                          : undefined
                      }
                    >
                      <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-bold text-charcoal shadow-[0_8px_20px_rgb(45_41_38_/_0.12)]">
                        {index + 1}
                      </span>
                      <button
                        aria-label={`Remove ${file.name}`}
                        className="focus-ring absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-paper/92 text-lg font-semibold text-rose shadow-[0_8px_20px_rgb(45_41_38_/_0.14)] transition hover:bg-rose-soft"
                        onClick={() => removeFile(index)}
                        type="button"
                      >
                        &times;
                      </button>
                    </span>
                    <span className="min-w-0 p-3">
                      <span className="block truncate text-sm font-semibold text-charcoal">
                        {file.name}
                      </span>
                      <span className="mt-1 block text-xs text-charcoal-soft">
                        {formatFileSize(file.size)}
                      </span>
                      <span className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          aria-label={`Move ${file.name} earlier`}
                          className="focus-ring inline-flex min-h-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.35)] bg-cream px-3 text-sm font-semibold text-charcoal transition hover:bg-rose-soft disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={index === 0}
                          onClick={() => moveFile(index, index - 1)}
                          type="button"
                        >
                          &#8592;
                        </button>
                        <button
                          aria-label={`Move ${file.name} later`}
                          className="focus-ring inline-flex min-h-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.35)] bg-cream px-3 text-sm font-semibold text-charcoal transition hover:bg-rose-soft disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={index === files.length - 1}
                          onClick={() => moveFile(index, index + 1)}
                          type="button"
                        >
                          &#8594;
                        </button>
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-1 text-xs leading-5 text-charcoal-soft">
              Swipe or scroll sideways to review photos. The carousel order becomes the first layout
              order.
            </p>
          </div>
        ) : null}

        {status === "uploading" && (
          <div className="mt-5" aria-live="polite">
            <div className="h-3 overflow-hidden rounded-full bg-cream-strong">
              <div
                className="h-full rounded-full bg-rose transition-all"
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-charcoal-soft">
              We are checking photo size and preparing design suggestions... {progress}%
            </p>
          </div>
        )}

        {message && (
          <p
            className={`mt-5 rounded-[var(--radius-card)] p-4 text-sm font-medium ${
              status === "error" ? "bg-rose-soft text-charcoal" : "bg-cream text-charcoal-soft"
            }`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        )}
      </section>

      <button
        className="focus-ring min-h-14 rounded-full bg-charcoal px-6 text-base font-semibold text-paper shadow-[0_16px_35px_rgb(45_41_38_/_0.18)] transition hover:bg-[rgb(62_55_51)] disabled:cursor-not-allowed disabled:opacity-55"
        disabled={status === "uploading"}
        type="submit"
      >
        {status === "uploading" ? "Creating your project..." : "Create My Private Project"}
      </button>
    </form>
  );
}

function validateFiles(files: File[], minimumPhotoCount?: number) {
  if (files.length === 0) {
    return "Add at least one photo to start your project.";
  }

  if (minimumPhotoCount && files.length < minimumPhotoCount) {
    const missing = minimumPhotoCount - files.length;

    return `Add ${missing} more photo${missing === 1 ? "" : "s"} to fill this design before editing.`;
  }

  const nonImage = files.find((file) => !file.type.startsWith("image/"));

  if (nonImage) {
    return `${nonImage.name} is not an image file. Please upload photos only.`;
  }

  const oversized = files.find((file) => file.size > maxPhotoSizeBytes);

  if (oversized) {
    return `${oversized.name} is larger than 12 MB. Please choose a smaller photo.`;
  }

  return null;
}

export function mergeUniqueFiles(currentFiles: File[], selectedFiles: File[]) {
  const knownFiles = new Set(currentFiles.map(getFileKey));

  return [
    ...currentFiles,
    ...selectedFiles.filter((file) => {
      const fileKey = getFileKey(file);

      if (knownFiles.has(fileKey)) {
        return false;
      }

      knownFiles.add(fileKey);
      return true;
    })
  ];
}

export function removeFileAtIndex(files: File[], indexToRemove: number) {
  return files.filter((_, index) => index !== indexToRemove);
}

function getFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

function getPhotoRequirement(
  selectedCount: number,
  minimumPhotoCount?: number,
  maximumPhotoCount?: number
) {
  if (!minimumPhotoCount) {
    return {
      tone: "ready" as const,
      label: `${selectedCount} selected`
    };
  }

  if (selectedCount < minimumPhotoCount) {
    const missing = minimumPhotoCount - selectedCount;

    return {
      tone: "attention" as const,
      label: `${missing} more needed`
    };
  }

  if (maximumPhotoCount && selectedCount > maximumPhotoCount) {
    return {
      tone: "ready" as const,
      label: `${selectedCount - maximumPhotoCount} extra kept`
    };
  }

  return {
    tone: "ready" as const,
    label: "Ready to continue"
  };
}

function formatRequiredPhotoRange(minimumPhotoCount: number, maximumPhotoCount?: number) {
  if (!maximumPhotoCount || minimumPhotoCount === maximumPhotoCount) {
    return `${minimumPhotoCount} photo${minimumPhotoCount === 1 ? "" : "s"} required`;
  }

  return `${minimumPhotoCount}-${maximumPhotoCount} photos recommended`;
}

function parseUploadResponse(
  responseText: string
): { message?: string; redirectTo?: string } | null {
  try {
    return JSON.parse(responseText) as { message?: string; redirectTo?: string };
  } catch {
    return null;
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
