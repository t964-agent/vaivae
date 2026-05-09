export default function NotFound() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-cream px-6 text-on-light"
      id="main-content"
    >
      <section className="max-w-xl text-center">
        <p className="mb-6 text-xs font-medium tracking-[0.32em] text-accent-red uppercase">404</p>
        <h1 className="font-display text-6xl font-light tracking-[-0.05em] italic sm:text-8xl">
          Not on this runway.
        </h1>
        <p className="mt-6 text-sm leading-6 text-on-light/70">
          The page you requested is not part of this storefront shell.
        </p>
      </section>
    </main>
  );
}
