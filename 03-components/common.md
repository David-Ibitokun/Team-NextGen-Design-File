# Components — Common

## RouteXLogo

The brand lockup. See [`../02-brand/logo.md`](../02-brand/logo.md) for the full
specification.

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `size` | `sm` \| `md` \| `lg` \| `xl` | `md` | Mark dimensions |
| `showText` | boolean | `false` | Show wordmark beside the mark |
| `showTagline` | boolean | `false` | Add the tagline line (requires `showText`) |
| `className` | string | `""` | Appended to the flex wrapper |

Wrapper: `flex items-center gap-2.5`. The mark is `shrink-0`. The inline SVG carries
`role="img"` and `aria-label="RouteX Logo"`.

**Usage guidance:** use `showText={false}` inside coloured chrome (navy header, footer)
where the wordmark is provided separately; use `showText showTagline` in the footer.

## RevealOnScroll

A reusable scroll-triggered entrance animation built on `IntersectionObserver`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | node | — | Content to reveal |
| `className` | string | `""` | Extra classes on the wrapper |
| `direction` | `up` \| `down` \| `left` \| `right` \| `fade` \| `scale` | `up` | Entrance direction |
| `delay` | number | `0` | Delay in ms |
| `duration` | number | `700` | Duration in ms |
| `threshold` | number | `0.12` | Fraction visible before triggering |
| `triggerOnce` | boolean | `false` | Unobserve after the first reveal |

### Transform table

| Direction | Hidden | Visible |
|---|---|---|
| `up` | `translate-y-10 opacity-0` | `translate-x-0 translate-y-0 opacity-100` |
| `down` | `-translate-y-10 opacity-0` | `translate-x-0 translate-y-0 opacity-100` |
| `left` | `translate-x-10 opacity-0` | `translate-x-0 translate-y-0 opacity-100` |
| `right` | `-translate-x-10 opacity-0` | `translate-x-0 translate-y-0 opacity-100` |
| `scale` | `scale-95 opacity-0` | `scale-100 opacity-100` |
| `fade` | `opacity-0` | `opacity-100` |

Wrapper classes: `transition-all cubic-bezier(0.16, 1, 0.3, 1) transform
will-change-transform`, with `transitionDuration` and `transitionDelay` set inline.

### Observation window

`rootMargin: "0px 0px -40px 0px"` fires the reveal slightly before the element reaches
the viewport bottom, so content is already settled by the time it is read.

### Defaults and usage notes

- **`triggerOnce` defaults to `false`** so elements re-animate when scrolled back into
  view. Use `triggerOnce` for content where re-animation would be distracting.
- **`scale` must be used for large panels** (hero previews, showcase cards) — translate
  motion on a full-width panel reads as a slide glitch.
- **Transitions use `translate-x-0 translate-y-0` in the visible state** even for `scale`,
  so a direction change never leaves a residual transform.
- `will-change-transform` is applied to promote the element to its own layer during the
  animation.

See [`../01-design-system/motion.md`](../01-design-system/motion.md) for stagger patterns
used across the landing page.

## Component inventory

| Category | Component | File |
|---|---|---|
| common | `RouteXLogo` | `components/common/RouteXLogo.jsx` |
| common | `RevealOnScroll` | `components/common/RevealOnScroll.jsx` |
| layout | `AppHeader` | `components/layout/AppHeader.jsx` |
| layout | `MobileBottomNavigation` | `components/layout/MobileBottomNavigation.jsx` |
| map | `HazardMap` | `components/map/HazardMap.jsx` |
| map | `HazardMarker` | `components/map/HazardMarker.jsx` |
| map | `LocationPickerMap` | `components/map/LocationPickerMap.jsx` |
| hazards | `HazardCard` | `components/hazards/HazardCard.jsx` |
| hazards | `HazardFilters` | `components/hazards/HazardFilters.jsx` |
| hazards | `HazardDetailsPanel` | `components/hazards/HazardDetailsPanel.jsx` |
| hazards | `CategoryBadge` | `components/hazards/CategoryBadge.jsx` |
| hazards | `FreshnessBadge` | `components/hazards/FreshnessBadge.jsx` |
| hazards | `ReportHazardModal` | `components/hazards/ReportHazardModal.jsx` |
| forms | `ReportHazardForm` | `components/forms/ReportHazardForm.jsx` |
| feedback | `LoadingState` (+ `HazardCardSkeleton`) | `components/feedback/LoadingState.jsx` |
| feedback | `EmptyState` | `components/feedback/EmptyState.jsx` |
| feedback | `ErrorState` | `components/feedback/ErrorState.jsx` |
| feedback | `DemoDataBanner` | `components/feedback/DemoDataBanner.jsx` |

## Composition rules

1. **Layer order.** `ThemeProvider` → `AuthProvider` → `RouterProvider`. Theme must wrap
   everything so `dark:` variants resolve; auth must wrap routes so role-gated
   navigation renders correctly.

2. **Badges compose, they do not nest.** A `CategoryBadge` and a `StatusBadge` sit
   **side by side** in a flex row — never one inside the other.

3. **Detail panels are overlays, not layouts.** `HazardDetailsPanel` and
   `ReportHazardModal` both anchor over existing content. Neither removes the map or list
   from the DOM, so context is never lost.

4. **Every async surface takes all four states.** If a component fetches data, it must
   handle loading, error, empty, and populated — see
   [`states-and-feedback.md`](states-and-feedback.md).

5. **Data-derived styling comes from constants.** Category and status colours are read
   from `hazardConstants.js`, never hardcoded at a call site.

6. **Icons always inherit `currentColor`.** Lucide icons take their colour from the
   surrounding text class, which is what allows a single badge definition to work in both
   themes.
