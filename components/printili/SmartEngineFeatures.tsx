const features = [
  {
    title: "Smart matching",
    description: "Find a layout that suits your photos, occasion, and final print."
  },
  {
    title: "Easy placement",
    description: "Arrange every memory in the order that tells the story best."
  },
  {
    title: "Move and zoom",
    description: "Keep faces, details, and favorite moments framed beautifully."
  },
  {
    title: "Natural fill",
    description: "Keep full photos visible while soft backgrounds fill the page."
  },
  {
    title: "Print-safe checks",
    description: "Keep size, margins, bleed, and sharpness under control."
  },
  {
    title: "Protected preview",
    description: "Approve the look before the clean print file is prepared."
  }
];

export function SmartEngineFeatures() {
  return (
    <section className="printili-home-panel" aria-labelledby="smart-engine-heading">
      <div className="mb-5">
        <h2 id="smart-engine-heading" className="font-display text-3xl leading-tight text-charcoal">
          Smart tools. Beautiful results.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-charcoal-soft">
          Everything stays simple for the customer while the print details are handled quietly in
          the background.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <article className="printili-feature-card" key={feature.title}>
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
