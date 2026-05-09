export default function HomePage() {
  return (
    <main className="min-h-dvh bg-cream text-on-light" id="main-content">
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-14">
        <p className="font-display text-2xl font-light tracking-[-0.04em] text-oxblood italic sm:text-3xl">
          vaïvae
        </p>
        <div className="max-w-4xl py-20">
          <p className="mb-8 text-xs font-medium tracking-[0.32em] text-accent-red uppercase">
            Storefront skeleton
          </p>
          <h1 className="font-display text-[clamp(4rem,12vw,11rem)] leading-[0.95] font-light tracking-[-0.055em] text-on-light italic">
            vaïvae <span className="text-accent-orange">—</span> The Living Runway
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 font-light text-on-light/70 sm:text-base">
          The cinematic home page is coming. This temporary shell only verifies the App Router,
          fonts, and brand tokens.
        </p>
      </section>
    </main>
  );
}
