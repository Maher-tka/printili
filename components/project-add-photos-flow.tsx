"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPhotoSource } from "@/lib/photo-url";
import { mergeUniqueFiles, removeFileAtIndex } from "@/components/start-upload-flow";

type UploadState = "idle" | "uploading" | "success" | "error";
type ReturnTarget = "suggestions" | "editor";

type ExistingPhoto = {
  fileName: string;
  originalUrl: string;
  qualityWarnings: string[];
};

type ProjectAddPhotosFlowProps = {
  existingPhotos: ExistingPhoto[];
  guestToken: string;
  neededPhotoCount?: number;
  projectCode: string;
  returnTo: ReturnTarget;
};

const maxPhotoSizeBytes = 12 * 1024 * 1024;
const maxProjectPhotoCount = 40;

export function ProjectAddPhotosFlow({
  existingPhotos,
  guestToken,
  neededPhotoCount,
  projectCode,
  returnTo
}: ProjectAddPhotosFlowProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const existingFileNames = useMemo(
    () => new Set(existingPhotos.map((photo) => photo.fileName.toLowerCase())),
    [existingPhotos]
  );
  const duplicateNames = useMemo(
    () =>
      files
        .filter((file) => existingFileNames.has(file.name.toLowerCase()))
        .map((file) => file.name),
    [existingFileNames, files]
  );
  const totalProjectPhotoCount = existingPhotos.length + files.length;
  const remainingPhotoSlots = Math.max(0, maxProjectPhotoCount - existingPhotos.length);
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

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

  function updateSelectedFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    setProgress(0);
    setStatus("idle");
    setMessage(validateFiles(nextFiles, existingPhotos.length, neededPhotoCount));
  }

  function clearPhotoCarousel() {
    setFiles([]);
    setProgress(0);
    setStatus("idle");
    setMessage(null);
  }

  function removeFile(indexToRemove: number) {
    updateSelectedFiles(removeFileAtIndex(files, indexToRemove));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateFiles(files, existingPhotos.length, neededPhotoCount);

    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    const body = new FormData();
    body.set("returnTo", returnTo);
    files.forEach((file) => body.append("photos", file));

    const request = new XMLHttpRequest();
    request.open("POST", `/api/projects/${guestToken}/photos`);

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
      setMessage(response?.message ?? "We could not add those photos. Please try again.");
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

  return (
    <form className="grid min-w-0 max-w-full gap-6 overflow-x-hidden" onSubmit={handleSubmit}>
      <div className="soft-card min-w-0 max-w-full overflow-hidden p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
              Project {projectCode}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Photos already in your project</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              New uploads are added to this private project. Nothing is replaced unless you remove
              it later in the editor.
            </p>
          </div>
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-charcoal-soft">
            {existingPhotos.length} saved / {maxProjectPhotoCount} max
          </span>
        </div>

        <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto pb-2">
          <ol className="flex w-max gap-3">
            {existingPhotos.slice(0, 16).map((photo, index) => (
              <li
                className="w-24 shrink-0 overflow-hidden rounded-[10px] border border-[rgb(199_163_95_/_0.24)] bg-paper"
                key={`${photo.originalUrl}-${index}`}
              >
                <span
                  className="block aspect-square bg-cream-strong"
                  style={{
                    backgroundImage: `url("${getPhotoSource(photo.originalUrl, { lowRes: true })}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover"
                  }}
                />
                <span className="block truncate px-2 py-2 text-xs font-semibold text-charcoal-soft">
                  {photo.fileName}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section
        className="soft-card min-w-0 max-w-full overflow-hidden p-5 sm:p-6"
        aria-labelledby="add-photos-heading"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-rose">Add more photos</p>
            <h2 id="add-photos-heading" className="mt-1 text-2xl font-semibold">
              Choose the extra photos
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">
              Original files stay saved for print quality. You can upload {remainingPhotoSlots} more
              photo{remainingPhotoSlots === 1 ? "" : "s"} in this project.
            </p>
          </div>
          {neededPhotoCount ? (
            <span className="rounded-full bg-rose-soft px-3 py-1 text-xs font-semibold text-charcoal">
              {neededPhotoCount} more needed
            </span>
          ) : null}
        </div>

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
                ? "Add more to this upload"
                : "Choose photos from your device"}
          </span>
          <span className="mt-2 text-sm leading-6 text-charcoal-soft">
            Drag and drop or browse. Up to 12 MB each.
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
          <div className="mt-5 min-w-0 overflow-hidden rounded-[var(--radius-card)] bg-cream p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold">New photo carousel</p>
                <p className="mt-1 text-xs leading-5 text-charcoal-soft">
                  {files.length} new photo{files.length === 1 ? "" : "s"} selected. Project will
                  have {totalProjectPhotoCount}.
                </p>
              </div>
              <button
                className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-rose/35 bg-paper px-3 text-xs font-semibold text-rose transition hover:bg-rose-soft"
                onClick={clearPhotoCarousel}
                type="button"
              >
                <TrashIcon />
                Clear carousel
              </button>
            </div>

            {duplicateNames.length > 0 ? (
              <p className="mt-3 rounded-[8px] bg-paper px-3 py-2 text-xs leading-5 text-charcoal-soft">
                Same name already exists: {duplicateNames.slice(0, 3).join(", ")}. We will still
                keep the new file because it may be a different photo.
              </p>
            ) : null}

            <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3">
              <ol aria-label="New photo carousel" className="flex w-max gap-3 px-1">
                {files.map((file, index) => (
                  <li
                    className="relative flex w-[13.5rem] shrink-0 flex-col overflow-hidden rounded-[18px] border border-[rgb(199_163_95_/_0.24)] bg-paper shadow-[0_14px_34px_rgb(67_44_24_/_0.08)]"
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  >
                    <span
                      className="relative block aspect-[4/3] w-full bg-cream-strong"
                      style={{
                        backgroundImage: `url("${previewUrls[index]}")`,
                        backgroundPosition: "center",
                        backgroundSize: "cover"
                      }}
                    >
                      <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-bold text-charcoal shadow-[0_8px_20px_rgb(45_41_38_/_0.12)]">
                        {existingPhotos.length + index + 1}
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
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-1 text-xs leading-5 text-charcoal-soft">
              Swipe or scroll sideways to review only the new photos.
            </p>
          </div>
        ) : null}

        {status === "uploading" ? (
          <div className="mt-5" aria-live="polite">
            <div className="h-3 overflow-hidden rounded-full bg-cream-strong">
              <div
                className="h-full rounded-full bg-rose transition-all"
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium text-charcoal-soft">
              Adding photos and checking print size... {progress}%
            </p>
          </div>
        ) : null}

        {message ? (
          <p
            className={`mt-5 rounded-[var(--radius-card)] p-4 text-sm font-medium ${
              status === "error" ? "bg-rose-soft text-charcoal" : "bg-cream text-charcoal-soft"
            }`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="focus-ring min-h-14 rounded-full bg-charcoal px-6 text-base font-semibold text-paper shadow-[0_16px_35px_rgb(45_41_38_/_0.18)] transition hover:bg-[rgb(62_55_51)] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={status === "uploading"}
          type="submit"
        >
          {status === "uploading" ? "Adding photos..." : "Add Photos To Project"}
        </button>
        <Link
          className="focus-ring inline-flex min-h-14 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.45)] bg-paper px-6 text-base font-semibold text-charcoal transition hover:bg-cream"
          href={
            returnTo === "editor"
              ? `/project/${guestToken}/editor`
              : `/project/${guestToken}/suggestions`
          }
        >
          Back without changes
        </Link>
      </div>
    </form>
  );
}

function validateFiles(files: File[], existingPhotoCount: number, neededPhotoCount?: number) {
  if (files.length === 0) {
    return "Choose at least one photo to add.";
  }

  if (neededPhotoCount && files.length < neededPhotoCount) {
    const missing = neededPhotoCount - files.length;

    return `Add ${missing} more photo${missing === 1 ? "" : "s"} for that design.`;
  }

  if (existingPhotoCount + files.length > maxProjectPhotoCount) {
    const remaining = Math.max(0, maxProjectPhotoCount - existingPhotoCount);

    return remaining === 0
      ? `This project already has ${maxProjectPhotoCount} photos.`
      : `Add ${remaining} photo${remaining === 1 ? "" : "s"} or fewer for now.`;
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

function TrashIcon() {
  return (
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
  );
}
