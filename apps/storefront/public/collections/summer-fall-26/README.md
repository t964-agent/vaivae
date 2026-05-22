# Summer Fall 26 — Runway Imagery

Ten editorial frames for the `/collections/summer-fall-26` page.

## Replacing the placeholders

The page at `apps/storefront/src/app/(site)/collections/summer-fall-26/page.tsx`
expects ten WebP files in this directory, named `01.webp` through `10.webp`.

Drop the final IHAB runway photos here using those exact filenames. The layout
will pick them up automatically — aspect ratios are enforced by CSS so the
page never reflows when you swap an image.

## Recommended source aspect ratios

The page renders each photo inside a fixed-aspect container, but supplying
source files at — or close to — the target ratios avoids cropping surprises.

| File      | Layout slot                      | Aspect ratio |
| --------- | -------------------------------- | ------------ |
| `01.webp` | Opening — full-width hero banner | 16:10        |
| `02.webp` | Two-up pair, left                | 4:5          |
| `03.webp` | Two-up pair, right               | 4:5          |
| `04.webp` | Solo centered portrait           | 3:4          |
| `05.webp` | Two-up pair, left                | 4:5          |
| `06.webp` | Two-up pair, right               | 4:5          |
| `07.webp` | Full-width landscape banner      | 16:10        |
| `08.webp` | Three-up grid, left              | 3:4          |
| `09.webp` | Three-up grid, center            | 3:4          |
| `10.webp` | Three-up grid, right — closing   | 3:4          |

## File format

- Use **WebP** (or update the imports if you prefer JPG/AVIF).
- Recommended max width per file:
  - Banners (`01`, `07`): ~2200px wide
  - Portraits (`02`–`06`): ~1600px wide
  - Trio (`08`–`10`): ~1200px wide
- Compress with `cwebp -q 78` or equivalent.

## Alt text

Alt strings are authored in `page.tsx` under `RUNWAY_FRAMES`. Update them
there if the imagery changes meaningfully.

## Current state

The files in this directory are temporary placeholders cloned from the
homepage hero poster. They are intentionally identical so it is obvious
during development that they have not yet been replaced.
