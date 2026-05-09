"use client";

import { cn } from "@/lib/utils";

export function HomeLoader({ hidden, progress }: { hidden: boolean; progress: number }) {
  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-oxblood text-on-dark transition-opacity duration-700 ease-out",
        hidden && "pointer-events-none opacity-0",
      )}
      data-home-loader
    >
      <div className="font-display text-[clamp(3.75rem,10vw,8.75rem)] leading-none font-light tracking-[-0.04em] italic [text-shadow:0_0_28px_rgba(243,176,58,.14)]">
        vaïvae
      </div>
      <div className="text-[0.68rem] tracking-[0.32em] text-on-dark/50 uppercase">
        The Living Runway — loading
      </div>
      <div className="relative h-px w-60 bg-on-dark/15">
        <div
          className="absolute inset-y-0 left-0 bg-linear-to-r from-accent-red via-accent-orange to-accent-gold transition-[width] duration-[250ms] ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-[0.62rem] tracking-[0.24em] text-on-dark/60 uppercase">{percent}%</div>
    </div>
  );
}
