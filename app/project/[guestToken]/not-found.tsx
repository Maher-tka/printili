import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <section className="page-shell py-16 sm:py-24" aria-labelledby="project-not-found-heading">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-rose">
          Project unavailable
        </p>
        <h1
          id="project-not-found-heading"
          className="mt-3 font-display text-4xl leading-tight sm:text-6xl"
        >
          Project not found or expired
        </h1>
        <p className="mt-5 text-base leading-7 text-charcoal-soft">
          The private magic link may be incorrect, expired, or already removed. You can start a new
          design without creating an account.
        </p>
        <Link
          className="focus-ring mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-charcoal px-5 text-sm font-semibold text-paper"
          href="/start"
        >
          Start a new design
        </Link>
      </div>
    </section>
  );
}
