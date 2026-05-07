export function getPhotoSource(originalUrl: string, { lowRes = false }: { lowRes?: boolean } = {}) {
  if (!originalUrl.startsWith("local://")) {
    return originalUrl;
  }

  const uploadPath = `/api/uploads/${originalUrl
    .replace("local://", "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;

  return lowRes ? `${uploadPath}?preview=low` : uploadPath;
}
