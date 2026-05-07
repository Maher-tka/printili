const trustItems = [
  {
    title: "Privacy protected",
    description: "Your photos stay private and previews are watermarked."
  },
  {
    title: "Premium print quality",
    description: "A4/A3 templates are prepared for crisp 300 DPI output."
  },
  {
    title: "Cash on delivery",
    description: "Pay only when your order arrives at your doorstep."
  },
  {
    title: "WhatsApp confirmation",
    description: "We confirm details and approval before printing."
  }
];

export function TrustBar() {
  return (
    <section
      className="printili-shell pb-10 pt-8 sm:pb-14"
      id="trust"
      aria-label="Printili trust and payment promises"
    >
      <div className="grid overflow-hidden rounded-[8px] border border-[rgb(199_163_95_/_0.22)] bg-white/72 shadow-[0_18px_44px_rgb(45_41_38_/_0.08)] sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <article
            className="border-b border-[rgb(199_163_95_/_0.16)] p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
            key={item.title}
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-cream text-rose">
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3 20 7v5c0 5-3.3 8.2-8 9-4.7-.8-8-4-8-9V7l8-4Z" />
                <path d="m8.5 12 2.2 2.2 4.8-5" />
              </svg>
            </span>
            <h2 className="mt-3 text-base font-extrabold text-charcoal">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-soft">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
