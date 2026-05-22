# Print Export Notes

The print export pipeline generates a 300 DPI raster composition and embeds it into a PDF for admin-only download.

Current behavior:

- Customer previews remain low-resolution and watermarked.
- Admin exports have no watermark.
- A4/A3 physical page sizes are respected.
- Custom product dimensions are supported when templates define `widthMm` and `heightMm`.
- Cut-sheet templates include cutting guide lines.
- Exports validate required photo slots, local source paths, and template dimensions before writing files.
- Generated files are stored under `.local-storage/exports/{orderNumber}`.
- Successful exports write:
  - `print.pdf`
  - `preview-watermark.jpg`
  - `production-summary.json`
- Admin download routes expose the PDF, preview JPG, and production summary separately.

Known limitations:

- Crop math is production-ready for `cover`, `contain_blur`, and orientation-aware `smart_crop`; face/subject priority modes still fall back to cover until detection metadata exists.
- PDF output embeds a high-quality JPEG raster rather than editable vector layers.
- Non-local storage providers will need a resolver before export can read remote originals.
- Bleed and safe-area visualization are still basic cut-guide behavior, not a full prepress proofing system.
