# Design Tokens — Typography

## Typeface

RouteX uses the **Tailwind `font-sans` stack** (the system UI sans-serif stack). No
webfont is downloaded, which keeps the PWA shell small and avoids a render-blocking
request on low-bandwidth connections.

Monospace is used selectively for **coordinates, counters, and technical metadata**
via `font-mono`, so numeric and machine-readable values read as data rather than prose.

## Roles

| Role | Weight | Typical size | Colour (light / dark) | Usage |
|---|---|---|---|---|
| Hero headline | `font-extrabold`, `tracking-tight`, `leading-[1.12]` | `text-4xl` → `lg:text-6xl` | `#142B3B` / white | Landing hero only |
| Section headline | `font-extrabold` | `text-2xl` → `sm:text-3xl` | `#142B3B` / white | Section titles |
| Card title | `font-bold` | `text-base` / `text-sm` | `#142B3B` / white | Card and panel headings |
| Body | `font-normal`, `leading-relaxed` | `text-sm` / `text-xs` | `#667784` / `slate-300` | Supporting copy |
| Eyebrow / section label | `font-bold`, `uppercase`, `tracking-widest` | `text-xs` | `#087F8C` / `teal-400` | Section kickers |
| Badge | `font-medium` | `text-xs` (`text-[11px]` for dense) | per category/status | Badges and chips |
| Button label | `font-semibold` | `text-xs` → `text-sm` | white on teal | Buttons |
| Metadata / caption | `font-medium` | `text-[11px]` / `text-[10px]` | `#667784` / `slate-400` | Timestamps, counts |
| Numeric step marker | `font-black`, `font-mono` | `text-4xl` | `#087F8C` @ 20% | "01 / 02 / 03" step numerals |
| Coordinate readout | `font-mono` | `text-[11px]` | `#142B3B` / `slate-100` | Lat/lng display |

## Scale (Tailwind defaults, as used)

`text-xs` 12px · `text-sm` 14px · `text-base` 16px · `text-lg` 18px ·
`text-xl` 20px · `text-2xl` 24px · `text-3xl` 30px · `text-4xl` 36px ·
`text-5xl` 48px · `text-6xl` 60px

The `text-[10px]` and `text-[11px]` arbitrary steps are used for dense metadata and are
part of the density language of dashboard and map surfaces.

## Hierarchy rules

- Only **one** `font-extrabold` element is visible per viewport region. Headline weight is
  reserved, not repeated.
- Supporting copy never drops below `#667784` in light mode, so it stays clearly secondary
  without becoming illegible.
- Uppercase is used **only** on short labels (eyebrows, badges, footer column headings).
  Never uppercase a sentence.
- `tracking-tight` is applied to headlines and the wordmark only, to tighten large sizes.

## Line length and measure

- Landing page sections use `max-w-2xl` or `max-w-xl` for centred text blocks.
- The FAQ section is constrained to `max-w-4xl`.
- Long-form body copy sits inside cards, so lines stay short.

## Writing tone

Copy is plain, civic, and non-alarmist. It avoids jargon and avoids overclaiming.

- Say: "Community-submitted reports."
- Do not say: "Verified road conditions."
- The disclaimer language is deliberate: RouteX is an **informational** awareness tool,
  not an official inspection or road authority.
