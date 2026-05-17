"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "@/data/seed-templates";
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
};

export function StartUploadFlow({
  initialCategory = "baby",
  initialTemplateSlug,
  initialTemplateName,
  initialTemplateSizeLabel,
  initialTemplateMinPhotos,
  initialTemplateMaxPhotos
}: StartUploadFlowProps) {
  const [category, setCategory] = useState<TemplateCategoryId>(initialCategory);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

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

  function updateSelectedFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    setProgress(0);
    setStatus("idle");
    setMessage(validateFiles(nextFiles, initialTemplateMinPhotos));
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
      <div className="soft-card grid gap-3 p-4 sm:grid-cols-3">
        {[
          ["1", initialTemplateName ? "Design chosen" : "Choose category"],
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
              {initialTemplateName ? "Confirm selected design" : "Choose a category"}
            </h2>
          </div>
        </div>

        {initialTemplateName ? (
          <div className="mt-5 rounded-[8px] bg-cream p-4">
            <p className="text-sm font-semibold text-charcoal">Selected design</p>
            <p className="mt-1 text-base font-semibold">{initialTemplateName}</p>
            {initialTemplateSizeLabel ? (
              <p className="mt-1 text-sm text-charcoal-soft">{initialTemplateSizeLabel}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => (
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
        )}
      </section>

      <section className="soft-card p-5 sm:p-6" aria-labelledby="upload-step-heading">
        <p className="text-sm font-semibold text-rose">Step 2</p>
        <h2 id="upload-step-heading" className="mt-1 text-2xl font-semibold">
          Upload photos
        </h2>
        <p className="mt-3 text-sm leading-6 text-charcoal-soft">
          Your photos stay private and are used only for your order. Print size is chosen by the
          template you select next.
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

        <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[rgb(199_163_95_/_0.55)] bg-paper px-5 py-8 text-center transition hover:bg-cream">
          <span className="text-lg font-semibold">Choose photos from your device</span>
          <span className="mt-2 text-sm leading-6 text-charcoal-soft">
            Upload multiple image files, up to 12 MB each.
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
          <div className="mt-5 rounded-[var(--radius-card)] bg-cream p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {files.length} photo{files.length === 1 ? "" : "s"} selected /{" "}
                  {formatFileSize(totalSize)}
                </p>
                <p className="mt-1 text-xs leading-5 text-charcoal-soft">
                  The order here becomes the first layout order, so put the strongest photo first.
                </p>
              </div>
              {initialTemplateMinPhotos ? (
                <span className="text-xs font-semibold text-charcoal-soft">
                  {formatRequiredPhotoRange(initialTemplateMinPhotos, initialTemplateMaxPhotos)}
                </span>
              ) : null}
            </div>

            <ol className="mt-4 grid gap-2">
              {files.map((file, index) => (
                <li
                  className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-[8px] bg-paper p-2"
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                >
                  <span
                    aria-hidden="true"
                    className="block aspect-square overflow-hidden rounded-[6px] bg-cream-strong"
                    style={
                      previewUrls[index]
                        ? {
                            backgroundImage: `url("${previewUrls[index]}")`,
                            backgroundPosition: "center",
                            backgroundSize: "cover"
                          }
                        : undefined
                    }
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-charcoal">
                      {index + 1}. {file.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-charcoal-soft">
                      {formatFileSize(file.size)}
                    </span>
                  </span>
                  <span className="flex gap-1">
                    <button
                      aria-label={`Move ${file.name} earlier`}
                      className="focus-ring inline-flex size-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper text-sm font-semibold text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={index === 0}
                      onClick={() => moveFile(index, index - 1)}
                      type="button"
                    >
                      &#8593;
                    </button>
                    <button
                      aria-label={`Move ${file.name} later`}
                      className="focus-ring inline-flex size-9 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.35)] bg-paper text-sm font-semibold text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={index === files.length - 1}
                      onClick={() => moveFile(index, index + 1)}
                      type="button"
                    >
                      &#8595;
                    </button>
                    <button
                      aria-label={`Remove ${file.name}`}
                      className="focus-ring inline-flex size-9 items-center justify-center rounded-full border border-rose/35 bg-paper text-lg font-semibold text-rose transition hover:bg-rose-soft"
                      onClick={() => removeFile(index)}
                      type="button"
                    >
                      &times;
                    </button>
                  </span>
                </li>
              ))}
            </ol>
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
              Uploading and preparing your private project... {progress}%
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
