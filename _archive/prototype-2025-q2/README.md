# Prototype Archive — 2025 Q2

This folder preserves the original vaïvae landing-page prototype that was deployed on Vercel before the monorepo rebuild. It is **frozen, untracked by app builds, and excluded from production deploys**. It exists for one reason:

> **Design reference for rebuilding the home page in `apps/storefront/`.**

The prototype is **not** to be edited. When the new storefront's home page is built, the look, feel, motion choreography, and copy from `live/` should be **faithfully replicated** in React + Tailwind + Motion + GSAP/Lenis.

---

## Contents

### `live/` — what was actually deployed

The static site that was live on Vercel until the monorepo rebuild. **This is the source of truth for visual design.**

| File | Role |
|---|---|
| `index.html` | Page structure: loader, header, hero, video stage, scroll-triggered editorial sections, CTA |
| `styles.css` | Brand tokens (`--bg-light: #efe9df`, `--accent-red: #c8321c`, etc.), typography (`Fraunces` + `Inter Tight`), animations |
| `app.js` | Lenis smooth scroll + GSAP/ScrollTrigger choreography, frame-capture video scrubbing on canvas, marquee, cursor lens |
| `hero.mp4` | Hero video (5MB, AI-generated cinematic clip) |

External libraries used (loaded from CDN):

- `lenis@1` — momentum/smooth scroll
- `gsap@3` + `ScrollTrigger` — timeline + scroll-driven animation

### `experiments/` — unused JSX from the prototype

These were created during exploration but are **not part of the deployed home page** (`.vercelignore` excluded `*.jsx`). Kept only for reference; do not port without explicit instruction.

| File | What it explored |
|---|---|
| `app.jsx` | Earlier React version of the home page |
| `muse.jsx` | "AI muse" component experiments |
| `tweaks-panel.jsx` | Dev tweaks UI for tuning animation values |
| `image-slot.js` | Image slot helper |

### `v1/` — earlier iteration

The first version of the prototype before the current `live/` revision.

### `source-assets/` — raw media used during the prototype

| File | Notes |
|---|---|
| `dreamina-slow-motion.mp4` | Source AI-generated cinematic footage (Dreamina) |
| `dreamina-tracking-shot.mp4` | Alternate cinematic source |
| `SKILL.md` | Notes captured during prototype build |

### `vercel-config/` — old Vercel project linkage

The `.vercel/` and `.vercelignore` files from the prototype's deploy. Kept for reference only — the new storefront deploys from `apps/storefront/`.

---

## Design Reference Notes (for the rebuild)

The following choreography from `live/app.js` is the **canonical scroll specification** for the new home page:

```
Master scroll envelope (0 → 1):
  0.000 – 0.020   Hero settled, video clip-path = circle(0%)
  0.020 – 0.080   Hero fades out + circle-wipe expands 0 → 82%   (synchronized)
  0.080 – 0.120   Pure video breath (no text)
  0.100 – 0.920   Editorial marquee visible (slides horizontally)
  0.120 – 0.270   01 Formation     (side-strip detail, bottom-left)
  0.270 – 0.420   02 Terracotta    (side-strip detail, bottom-right)
  0.420 – 0.570   03 Glacial       (bottom-left)
  0.570 – 0.720   04 Coral         (bottom-right)
  0.720 – 0.890   05 Linen         (bottom-left)
  0.890 – 1.000   06 CTA           (centred stack, data-persist)
```

**Brand tokens** (`live/styles.css`):

```css
--bg-light: #efe9df;        /* cream */
--bg-warm: #1a0a06;         /* deep oxblood */
--bg-dark: #0a0606;
--text-on-light: #1a0f08;
--text-on-dark: #f6f1ea;
--accent-red: #c8321c;
--accent-orange: #e87421;
--accent-gold: #f3b03a;
--font-display: 'Fraunces', serif;
--font-body: 'Inter Tight', system-ui, sans-serif;
```

**Key effects to replicate**:

1. **Loader** — branded "vaïvae — The Living Runway — loading" with progress bar, fades out.
2. **Hero** — 100vh standalone with serif heading using italic emphasis (`<em>` on key words like "living").
3. **Circle-wipe transition** — `clip-path: circle()` on the video reveals it from center as user scrolls into the editorial section.
4. **Frame-capture video scrubbing** — the hero video is scrubbed to a canvas via `requestAnimationFrame`, decoupling playback from scroll position.
5. **Editorial marquee** — horizontally moving large-format text behind/over the editorial sections, persistent across the scroll.
6. **Side-strip detail layout** — alternating left/right placement of section text (Formation / Terracotta / Glacial / Coral / Linen).
7. **Cursor lens** — custom magnifying-style cursor element.
8. **Final CTA** — centered, persists at the end of the scroll envelope.

When the new home page is built:

- Replace Lenis CDN script with `lenis@1.x` npm package.
- Replace GSAP CDN scripts with `gsap@3.x` + `gsap/ScrollTrigger` npm packages (note: GSAP 3.13+ moved everything to MIT in 2025).
- Keep frame-capture canvas approach for hero video — do **not** use `<video>` autoplay alone.
- Tailwind `@theme` directive should declare the brand tokens above as design tokens.
- Use `motion@12.x` for component-level micro-interactions; keep GSAP for the scroll-timeline orchestration.
- Hero video must be a Mux asset in production (per architecture doc §6.5.5), not bundled as a static MP4.

---

## Deploy Status

The prototype's Vercel project (linked in `vercel-config/.vercel/`) should be **disconnected and deleted** once the new storefront is live. Until then, the prototype URL may still resolve — that is intentional, so the brand has *something* live during the rebuild.

> **Do not deploy from this folder.** Deploys come from `apps/storefront/`.
