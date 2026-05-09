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
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl items-end px-6 py-8 sm:px-10 lg:px-14">
        <RegionSmokeTest state={regionSmokeState} />
      </section>
    </main>
  );
}
