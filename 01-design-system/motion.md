# Design Tokens — Motion

## Motion principle

Motion in RouteX is used to **preserve orientation**, not for decoration. Animations are
subtle, GPU-accelerated, and fully disabled when the user requests reduced motion.

## Scroll reveal

Sections and cards animate in as they enter the viewport, implemented by the
`RevealOnScroll` component with `IntersectionObserver`.

| Property | Value |
|---|---|
| Trigger threshold | `0.12` (12% of the element visible) |
| Root margin | `0px 0px -40px 0px` (fires slightly before the element reaches the bottom) |
| Default duration | `700ms` |
| Default delay | `0ms` (per-element delays are authored explicitly) |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` — decisive deceleration |
| `will-change` | `transform` |

### Supported directions

| Direction | Hidden transform | Used by |
|---|---|---|
| `up` | `translate-y-10 opacity-0` | Default for stacked sections and cards |
| `down` | `-translate-y-10 opacity-0` | Rare |
| `left` | `translate-x-10 opacity-0` | Content entering from the right-hand column |
| `right` | `-translate-x-10 opacity-0` | Content entering from the left-hand column |
| `scale` | `scale-95 opacity-0` | Product previews and hero panels |
| `fade` | `opacity-0` | Fade only |

Distance is **40px** (Tailwind `-10`) or **scale 0.95** — deliberately small so entrance
never feels floaty.

### Stagger pattern

Siblings stagger by index to create a left-to-right or top-to-bottom cascade:

- Feature cards: `delay={100}` + `100ms` per index
- Steps: `delay={100}`, `200`, `300`
- Incident stream cards: `delay={idx * 150}`
- FAQ items: `delay={idx * 60}`
- Trust strip: `delay={50}`, `150`, `250`

## Reduced motion

A global media query collapses all animation and transition duration, which also covers
the Leaflet and Tailwind transitions:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`scroll-behavior: smooth` is applied to `:root` and explicitly disabled under reduced motion.

## Micro-interactions

| Interaction | Transform | Duration | Easing |
|---|---|---|---|
| Primary button press | `active:scale-[0.99]` | default | ease |
| Landing CTA press | `active:scale-95` | default | ease |
| Card hover lift | `hover:-translate-y-1` (features) / `hover:-translate-y-1.5` (categories) | default | ease |
| Icon hover pop (category tiles) | `group-hover:scale-110` | default | ease |
| Icon rotate on report CTA | `group-hover:rotate-90` | `200ms` | ease |
| Marker hover | `scale(1.1)` | `150ms` ease-in-out | ease-in-out |
| Arrow nudge in cards | `group-hover:translate-x-1` | default | ease |
| Live ping dot | `animate-ping` | loop | linear |
| Install button emphasis | `animate-pulse` | loop | linear |
| Spinner (submit/optimize) | `Loader2` with `animate-spin` | loop | linear |
| Theme colour transition | `150ms ease` on background and colour | `150ms` | ease |

## Component entrances

| Component | Animation |
|---|---|
| Report modal | `fade-in` + `duration-150`, backdrop `bg-black/65` with `backdrop-blur-xs` |
| Detail slide-over | `slide-in-from-right`, `duration-200` |
| User dropdown | `fade-in zoom-in-95`, `duration-100` |
| Mobile drawer | `slide-in-from-top`, `duration-150` |
| Floating hazard card | `fade-in slide-in-from-bottom-2`, `duration-200` |
| FAQ answer | `fade-in`, `duration-150` |
| FAQ chevron | `rotate-180`, `duration-200` |

## Map motion

| Behaviour | Detail |
|---|---|
| Fly to selected hazard | `map.flyTo(coords, max(currentZoom, 14), { duration: 1 })` |
| Layer switch | Tile layer is keyed on `layer` **and** `isDark`, so swapping layers remounts tiles |
| Map resize | `invalidateSize()` on mount, again after `250ms`, and on window resize |

## Success confirmation

After a successful hazard submission the success state renders immediately and the
callback fires after a **1200ms** delay, letting the confirmation state register visually
before the modal closes or the map updates.
