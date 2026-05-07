import Image from "next/image";
import Link from "next/link";
import { featuredTemplates } from "@/data/seed-templates";

const previewPhotos = featuredTemplates.slice(2, 8);

export function EditorPreview() {
  return (
    <section
      className="printili-shell py-8 sm:py-10"
      id="editor-preview"
      aria-labelledby="editor-preview-heading"
    >
      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <h2
            id="editor-preview-heading"
            className="font-display text-3xl leading-tight text-charcoal"
          >
            A Powerful Editor. Made Simple.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal-soft">
            Printili gives customers the controls they expect: upload photos, pick the slot, zoom,
            move, blur-fill, preview, and submit the order.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-rose px-6 text-sm font-bold text-paper shadow-[0_16px_30px_rgb(191_127_134_/_0.28)]"
              href="/start"
            >
              Create Yours Now
            </Link>
            <Link
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-[rgb(199_163_95_/_0.42)] bg-white/56 px-6 text-sm font-bold text-charcoal"
              href="/templates"
            >
              Browse Templates
            </Link>
          </div>
        </div>

        <div
          className="printili-editor-mock"
          role="img"
          aria-label="Printili editor preview mockup"
        >
          <aside className="printili-editor-mock__sidebar">
            {["Templates", "Photos", "Elements", "Text", "Stickers"].map((item, index) => (
              <span className={index === 1 ? "is-active" : ""} key={item}>
                {item}
              </span>
            ))}
          </aside>

          <div className="printili-editor-mock__photos">
            <button>Add Photos</button>
            <div className="grid grid-cols-2 gap-2">
              {previewPhotos.map((template) => (
                <Image
                  src={template.previewImage}
                  alt={`${template.name} uploaded thumbnail`}
                  width={96}
                  height={112}
                  className="aspect-[4/5] rounded-[7px] object-cover"
                  key={template.id}
                />
              ))}
            </div>
          </div>

          <div className="printili-editor-mock__canvas">
            <div className="printili-editor-mock__poster">
              <div className="grid grid-cols-2 gap-2">
                {previewPhotos.slice(0, 4).map((template) => (
                  <Image
                    src={template.previewImage}
                    alt=""
                    width={120}
                    height={130}
                    className="aspect-square rounded-[6px] object-cover"
                    key={template.slug}
                  />
                ))}
              </div>
              <p>
                You & Me <span>Always & Forever</span>
              </p>
            </div>
          </div>

          <aside className="printili-editor-mock__inspector">
            <div className="flex items-center justify-between gap-3">
              <strong>Edit Photo</strong>
              <span>A4</span>
            </div>
            <label>
              Zoom
              <input defaultValue={42} type="range" />
            </label>
            <div className="grid grid-cols-3 gap-2 text-center">
              <button>Left</button>
              <button>Up</button>
              <button>Right</button>
            </div>
            <label>
              Fit mode
              <select defaultValue="contain_blur">
                <option value="cover">Cover</option>
                <option value="contain_blur">Blur-fill background</option>
              </select>
            </label>
            <button className="preview">Preview</button>
            <button className="submit">Submit Order</button>
          </aside>
        </div>
      </div>
    </section>
  );
}
