const features = [
  {
    title: "Smart template matching",
    description: "We suggest layouts from your occasion, photo count, and photo orientation."
  },
  {
    title: "Drag & drop placement",
    description: "Move photos into the right story order without complex design software."
  },
  {
    title: "Move & zoom inside slot",
    description: "Fine-tune every face, detail, and memory inside its printed frame."
  },
  {
    title: "Blur-fill background",
    description: "Keep full photos visible while naturally filling empty areas."
  },
  {
    title: "Auto photo enhancement",
    description: "A production-ready placeholder for color, brightness, and clarity checks."
  },
  {
    title: "Shape collage masks",
    description: "Heart, number, silhouette, and custom shape layouts are ready to grow."
  },
  {
    title: "A4/A3 print validation",
    description: "Templates carry size, margins, bleed, and DPI rules for print confidence."
  },
  {
    title: "Protected preview",
    description: "Customers see a beautiful proof while final clean files stay private."
  }
];

export function SmartEngineFeatures() {
  return (
    <section className="printili-shell py-8 sm:py-10" aria-labelledby="smart-engine-heading">
      <div className="mb-5">
        <h2 id="smart-engine-heading" className="font-display text-3xl leading-tight text-charcoal">
          Smart Engine. Beautiful Results.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal-soft">
          The platform feels simple for clients, but keeps practical print logic underneath every
          recommendation and preview.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <article
            className="rounded-[8px] border border-[rgb(199_163_95_/_0.2)] bg-white/68 p-4 shadow-[0_14px_34px_rgb(45_41_38_/_0.06)]"
            key={feature.title}
          >
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-rose-soft text-sm font-black text-rose">
              {index + 1}
            </span>
            <h3 className="mt-3 text-sm font-extrabold text-charcoal">{feature.title}</h3>
            <p className="mt-2 text-xs leading-5 text-charcoal-soft">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
