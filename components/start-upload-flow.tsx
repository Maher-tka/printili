"use client";

import { useMemo, useState } from "react";
import { categories } from "@/data/seed-templates";
import type { TemplateCategoryId } from "@/types/templates";

const maxPhotoSizeBytes = 12 * 1024 * 1024;

type UploadState = "idle" | "uploading" | "success" | "error";

type StartUploadFlowProps = {
  initialCategory?: TemplateCategoryId;
  initialTemplateSlug?: string;
  initialTemplateName?: string;
  initialTemplateSizeLabel?: string;
};

export function StartUploadFlow({
  initialCategory = "baby",
  initialTemplateSlug,
  initialTemplateName,
  initialTemplateSizeLabel
}: StartUploadFlowProps) {
  const [category, setCategory] = useState<TemplateCategoryId>(initialCategory);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const validationMessage = validateFiles(selectedFiles);

    setFiles(selectedFiles);
    setProgress(0);
    setStatus("idle");
    setMessage(validationMessage);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateFiles(files);

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

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
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

        {files.length > 0 && (
          <div className="mt-5 rounded-[var(--radius-card)] bg-cream p-4">
            <p className="text-sm font-semibold">
              {files.length} photo{files.length === 1 ? "" : "s"} selected /{" "}
              {formatFileSize(totalSize)}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-charcoal-soft">
              {files.slice(0, 5).map((file) => (
                <li className="truncate" key={`${file.name}-${file.size}`}>
                  {file.name} / {formatFileSize(file.size)}
                </li>
              ))}
              {files.length > 5 && <li>{files.length - 5} more photo files</li>}
            </ul>
          </div>
        )}

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

function validateFiles(files: File[]) {
  if (files.length === 0) {
    return "Add at least one photo to start your project.";
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
