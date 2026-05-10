import type { CSSProperties, ReactElement } from "react";

export const OG_SIZE = {
  height: 630,
  width: 1200,
} as const;

export const TWITTER_SIZE = {
  height: 600,
  width: 1200,
} as const;

type BrandOgImageInput = {
  eyebrow?: string | null | undefined;
  height?: number | undefined;
  imageAlt?: string | null | undefined;
  imageUrl?: string | null | undefined;
  subtitle?: string | null | undefined;
  title: string;
};

const COLORS = {
  accentGold: "#f3b03a",
  accentRed: "#c8321c",
  cream: "#efe9df",
  ink: "#0a0606",
  oxblood: "#1a0a06",
  onDark: "#f6f1ea",
} as const;

function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function getTitleSize(title: string): number {
  if (title.length > 86) {
    return 62;
  }

  if (title.length > 58) {
    return 74;
  }

  if (title.length > 36) {
    return 88;
  }

  return 108;
}

function getTrustedImageUrl(imageUrl: string | null | undefined): string | undefined {
  const value = clean(imageUrl);

  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function createBrandOgImage({
  eyebrow,
  height = OG_SIZE.height,
  imageAlt,
  imageUrl,
  subtitle,
  title,
}: BrandOgImageInput): ReactElement {
  const safeTitle = clean(title) ?? "vaïvae";
  const safeSubtitle = clean(subtitle);
  const safeEyebrow = clean(eyebrow);
  const trustedImageUrl = getTrustedImageUrl(imageUrl);
  const hasImage = Boolean(trustedImageUrl);
  const foreground = hasImage ? COLORS.onDark : COLORS.oxblood;
  const muted = hasImage ? "rgba(246,241,234,0.68)" : "rgba(26,10,6,0.62)";
  const titleSize = getTitleSize(safeTitle);
  const contentBottom = Math.max(76, Math.round(height * 0.13));
  const rootStyle: CSSProperties = {
    background: hasImage ? COLORS.ink : COLORS.cream,
    color: foreground,
    display: "flex",
    height: "100%",
    overflow: "hidden",
    position: "relative",
    width: "100%",
  };

  return (
    <div style={rootStyle}>
      {trustedImageUrl ? (
        <div
          aria-label={clean(imageAlt) ?? undefined}
          role={clean(imageAlt) ? "img" : undefined}
          style={{
            backgroundImage: `url("${trustedImageUrl}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            height: "100%",
            left: 0,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
      ) : null}
      {hasImage ? (
        <div
          style={{
            background:
              "linear-gradient(90deg, rgba(10,6,6,0.88), rgba(10,6,6,0.52) 54%, rgba(10,6,6,0.24))",
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      ) : (
        <>
          <div
            style={{
              background: COLORS.oxblood,
              borderRadius: 999,
              height: 520,
              opacity: 0.08,
              position: "absolute",
              right: -120,
              top: -160,
              width: 520,
            }}
          />
          <div
            style={{
              background: COLORS.accentGold,
              borderRadius: 999,
              bottom: -180,
              height: 420,
              left: 220,
              opacity: 0.14,
              position: "absolute",
              width: 420,
            }}
          />
        </>
      )}
      <div
        style={{
          alignItems: "center",
          display: "flex",
          left: 72,
          position: "absolute",
          top: 58,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: hasImage ? COLORS.onDark : COLORS.oxblood,
            color: hasImage ? COLORS.oxblood : COLORS.cream,
            display: "flex",
            fontFamily: "Georgia, serif",
            fontSize: 30,
            fontStyle: "italic",
            height: 46,
            justifyContent: "center",
            letterSpacing: "-0.08em",
            width: 46,
          }}
        >
          v
        </div>
        <div
          style={{
            color: foreground,
            fontFamily: "Georgia, serif",
            fontSize: 34,
            fontStyle: "italic",
            letterSpacing: "-0.05em",
            marginLeft: 18,
          }}
        >
          vaïvae
        </div>
      </div>
      <div
        style={{
          bottom: contentBottom,
          display: "flex",
          flexDirection: "column",
          left: 72,
          maxWidth: 880,
          position: "absolute",
        }}
      >
        {safeEyebrow ? (
          <div
            style={{
              color: muted,
              fontFamily: "Arial, sans-serif",
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "0.22em",
              marginBottom: 24,
              textTransform: "uppercase",
            }}
          >
            {safeEyebrow}
          </div>
        ) : null}
        <div
          style={{
            color: foreground,
            fontFamily: "Georgia, serif",
            fontSize: titleSize,
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: "-0.065em",
            lineHeight: 0.94,
          }}
        >
          {safeTitle}
        </div>
        {safeSubtitle ? (
          <div
            style={{
              color: muted,
              fontFamily: "Arial, sans-serif",
              fontSize: 28,
              letterSpacing: "0.01em",
              lineHeight: 1.25,
              marginTop: 30,
              maxWidth: 700,
            }}
          >
            {safeSubtitle}
          </div>
        ) : null}
      </div>
      <div
        style={{
          background: COLORS.accentRed,
          bottom: 0,
          height: 4,
          left: 0,
          position: "absolute",
          right: 0,
        }}
      />
    </div>
  );
}
