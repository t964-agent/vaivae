export default function Loading() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-cream px-6 text-on-light"
      id="main-content"
    >
      <div aria-label="Loading" className="h-px w-48 overflow-hidden bg-on-light/15" role="status">
        <div className="h-full w-24 bg-gradient-to-r from-accent-red via-accent-orange to-accent-gold" />
      </div>
    </main>
  );
}
