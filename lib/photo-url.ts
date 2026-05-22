export function getPhotoSource(
  originalUrl: string,
  {
    lowRes = false,
    preview
  }: {
    lowRes?: boolean;
    preview?: "editor" | "low";
  } = {}
) {
  if (!originalUrl.startsWith("local://")) {
    return originalUrl;
  }

  const uploadPath = `/api/uploads/${originalUrl
    .replace("local://", "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;

  const previewMode = preview ?? (lowRes ? "low" : undefined);

  return previewMode ? `${uploadPath}?preview=${previewMode}` : uploadPath;
}
