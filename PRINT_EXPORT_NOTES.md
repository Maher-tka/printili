# Print Export Notes

This first print export implementation generates a 300 DPI raster composition and embeds it into a PDF for admin-only download.

Current behavior:

- Customer previews remain low-resolution and watermarked.
- Admin exports have no watermark.
- A4/A3 physical page sizes are respected.
- Cut-sheet templates include cutting guide lines.
- Generated files are stored under `.local-storage/exports`.

Known limitations:

- Crop math is production-ready for `cover`, `contain_blur`, and orientation-aware `smart_crop`; face/subject priority modes still fall back to cover until detection metadata exists.
- PDF output embeds a high-quality JPEG raster rather than editable vector layers.
- Non-local storage providers will need a resolver before export can read remote originals.
