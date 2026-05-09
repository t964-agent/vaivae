import { getDefaultRegion } from "@/medusa/regions";

type RegionSmokeState =
  | { currencyCode: string; regionName: string; status: "ready" }
  | { status: "pending" };

async function getRegionSmokeState(): Promise<RegionSmokeState> {
  try {
    const region = await getDefaultRegion();
    const currencyCode = region.currency_code?.toUpperCase() ?? "USD";

    return { currencyCode, regionName: region.name, status: "ready" };
  } catch {
    return { status: "pending" };
  }
}

function RegionSmokeTest({ state }: { state: RegionSmokeState }) {
  const label =
    state.status === "ready"
      ? `Region: ${state.regionName} · ${state.currencyCode}`
      : "Region pending · Medusa unavailable";

  return (
    <div className="border-t border-on-light/10 pt-6 text-xs tracking-[0.24em] text-on-light/55 uppercase">
      {label}
    </div>
  );
}

export default async function HomePage() {
  const regionSmokeState = await getRegionSmokeState();

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
        <RegionSmokeTest state={regionSmokeState} />
      </section>
    </main>
  );
}
