# Dark Mode

RouteX implements dark mode as a **designed theme**, not an automatic inversion.

---

## Mechanism

A `.dark` class on `<html>` activates the Tailwind custom variant:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

`ThemeContext` manages the class:

| Behaviour | Detail |
|---|---|
| Initial read | `localStorage.getItem("routex-theme")` |
| Fallback | `window.matchMedia("(prefers-color-scheme: dark)")` |
| Default | `"light"` |
| Toggle | Adds/removes the `dark` class on `document.documentElement` |
| Persist | `localStorage.setItem("routex-theme", theme)` |

Respecting `prefers-color-scheme` on first visit means a user who has expressed a system
preference is never asked to restate it.

### Colour transition

```css
:root {
  color: #142B3B;
  background-color: #F7F9FA;
  transition: background-color 0.15s ease, color 0.15s ease;
}

html.dark {
  color: #F1F5F9;
  background-color: #0B161E;
}
```

A 150ms cross-fade prevents a harsh flash when toggling.

### Toggle control

| Theme | Icon | Icon colour |
|---|---|---|
| Dark (tap to go light) | `Sun` | `#F2B544` |
| Light (tap to go dark) | `Moon` | `slate-200` |

`aria-label` states the **action**, not the state: *"Switch to dark mode"* when light is
active. It lives in the header at all viewports.

---

## Palette

### Light

| Token | Hex | Role |
|---|---|---|
| `--color-routex-navy` | `#142B3B` | Ink, header |
| `--color-routex-teal` | `#087F8C` | Accent |
| `--color-routex-offwhite` | `#F7F9FA` | Page background |
| `--color-routex-white` | `#FFFFFF` | Card surface |
| `--color-routex-amber` | `#F2B544` | Warning |
| `--color-routex-red` | `#D64545` | Danger |
| `--color-routex-green` | `#27865B` | Success |
| `--color-routex-slate` | `#667784` | Secondary text |
| `--color-routex-border` | `#DCE4E8` | Hairline |

### Dark

| Token | Hex | Role |
|---|---|---|
| `--color-dark-bg` | `#0B161E` | Page background |
| `--color-dark-card` | `#142533` | Card surface |
| `--color-dark-surface` | `#1B3142` | Raised controls, inputs, chips |
| `--color-dark-border` | `#284459` | Hairline |
| `--color-dark-text` | `#F1F5F9` | Primary text |
| `--color-dark-muted` | `#94A3B8` | Secondary text |

---

## Four-step surface scale

Dark mode uses **four distinct surfaces** rather than one dark colour, so cards, inputs, and
borders remain distinguishable:

```
#0B161E   page background
   └─ #142533   card / panel surface
         └─ #1B3142   raised control: inputs, chips, hover
               └─ #284459   border / divider
```

The light-mode equivalent is `#F7F9FA` → `#FFFFFF` → `#F7F9FA` → `#DCE4E8`, but dark mode
gains an extra step because low-light interfaces rely more heavily on borders to convey
surface boundaries.

---

## Surface mapping

| Element | Light | Dark |
|---|---|---|
| Page | `#F7F9FA` | `#0B161E` |
| Cards | `#FFFFFF` | `#142533` |
| Selected card | `#FFFFFF` | `#182C3A` |
| Inputs / selects | `#F7F9FA` | `#1B3142` |
| Input focus | `#FFFFFF` | `#152735` |
| Header | `#142B3B`/90 | `#0B161E`/90 |
| Footer | `#0B161E` | `#0B161E` |
| Hero / CTA sections | `#142B3B` | `#142B3B` |
| Feature band | `#FFFFFF` | `#101F2B` |
| Pulse / safety band | `slate-50` | `#0E1A24` |
| Safety cards band | `slate-100/70` | `#0E1A24` |

Note that `#142B3B` is used as a dark section background in **both** themes — it is a
stable brand surface, not a light-mode colour that inverts.

---

## Text

| Role | Light | Dark |
|---|---|---|
| Primary | `#142B3B` | `#F1F5F9` / white |
| Secondary | `#667784` | `slate-300` / `#94A3B8` |
| Tertiary / caption | `#667784` | `slate-400` |
| On navy | white | white |

### Accent text must lighten

`#087F8C` is not used as body text on dark surfaces. It is replaced by a lighter teal:

| Context | Light | Dark |
|---|---|---|
| Links | `#087F8C` | `teal-400` |
| Eyebrows | `#087F8C` | `teal-400` |
| Active nav | `#087F8C` | `teal-400` |
| Icons | `#087F8C` | `teal-400` |

`#087F8C` on `#0B161E` does not reach WCAG AA for body text; `teal-400` does.

### Amber text must darken

Amber fills stay light in both themes, but the **text** on them darkens:

| | Fill | Text |
|---|---|---|
| Light | `bg-amber-100` | `#855B09` |
| Dark | `dark:bg-amber-950/60` | `dark:text-amber-300` |

`#F2B544` is never used directly as text on white or on dark — it is a fill and border
colour only.

---

## Borders

| Context | Light | Dark |
|---|---|---|
| Standard | `#DCE4E8` | `slate-800` |
| Elevated | `slate-300` | `slate-700` |
| Strong | `#087F8C` | `#087F8C` |
| Header | `slate-700/80` | `slate-800` |
| Map popup | — | `1px solid #284459` |

Borders carry more structural weight in dark mode, so they are slightly more present than
in light mode where shadows do more of the work.

---

## Map dark mode

### Tile filter

```css
.dark .leaflet-tile-pane {
  filter: brightness(0.65) invert(1) contrast(3) hue-rotate(200deg) saturate(0.25);
}
```

Light tiles are inverted, brightened, and desaturated into a cool slate palette — **no
third-party dark tile API or key required**. The `hue-rotate(200deg)` is what shifts the
result blue-grey rather than an inverted brown.

### Control restyling (required)

The filter affects only the tile pane. All Leaflet chrome needs explicit treatment:

| Element | Background | Text | Border |
|---|---|---|---|
| Popup wrapper + tip | `#142533` | `#F1F5F9` | `#284459` |
| Popup shadow | `0 4px 14px rgba(0,0,0,0.5)` | — | — |
| Zoom control | `#142533` | `#F1F5F9` | `#284459` |
| Zoom hover | `#1B3142` | `#0AA3B3` | — |
| Attribution bar | `rgba(14,27,36,0.85)` | `#94A3B8` | — |
| Attribution link | — | `#0AA3B3` | — |

Skipping this leaves bright white controls floating on a dark map — the single most
common dark-mode map bug.

### Tile remount keying

```jsx
<TileLayer key={`${activeLayer}-${isDark ? "dark" : "light"}`} />
```

Keying on theme forces a remount so the filter applies cleanly. Without it, switching
theme leaves light tiles behind the filter.

---

## Component specifics

| Component | Dark behaviour |
|---|---|
| Brand nav | Teal pill becomes `teal-900/60 text-teal-300 border-teal-800` |
| Step numerals | `#087F8C` @ 20% becomes `teal-400` @ 25%, 40% on hover |
| Feature card icon | `text-[#087F8C]` becomes `dark:text-teal-400` |
| Trust-strip icon tile | `bg-teal-50` → `bg-teal-950/60`, border `teal-200` → `teal-900/60` |
| Category badge | Colours unchanged — badge fills are light in both themes for legibility |
| Status badge | Colours unchanged |
| Freshness badge | `bg-slate-100` → `dark:bg-slate-700`-family |
| Demo badge | `bg-amber-100` → `bg-amber-950/60` |
| Role badge | Unchanged (already dark-surface fills) |
| Advisory box | `bg-amber-50` → `bg-amber-950/30` |
| Error alert | `bg-red-50` → `bg-red-950/50` |
| Skeleton | `bg-slate-200` → `bg-slate-700` |
| Select option | `text-[#142B3B]` → `text-slate-100` |
| Selected card | `ring-2 ring-[#087F8C]/20` — accent retained in both themes |

Category, status, and role badge fills stay identical across themes because they are
already dark-surface fills designed to sit on light chrome.

---

## Transitions

| Element | Duration |
|---|---|
| Body background / colour | `150ms ease` |
| Component surfaces | `transition-colors` |

Colour transitions are kept short — a slow cross-fade across a large landing page reads as
sluggish.

Under `prefers-reduced-motion`, all transitions collapse to `0.01ms` via the global media
query.

---

## Persistence and SSR

`ThemeContext` guards its initial read:

```js
if (typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) { ... }
```

The `window` guard prevents a crash if the provider is evaluated outside a browser
context.

---

## Adding a dark variant

When extending the design system:

1. Add `dark:` variants for **every** colour, not just backgrounds.
2. Lighten accent colours used as **text** (`#087F8C` → `teal-400`).
3. Use the four-step surface scale rather than a single dark colour.
4. Give borders slightly more weight than in light mode.
5. Check `index.html`'s `<meta name="theme-color">` if the page chrome colour changes.
6. Verify the map: tile filter **and** control restyling.

### Known gap

`<meta name="theme-color" content="#142B3B">` in `index.html` is static. The PWA manifest
declares `background_color: #142B3B` and `theme_color: #087F8C`, so the installed app's
status bar does not follow the in-app theme toggle.
