# Accessibility

Accessibility requirements and current implementation status.

---

## Principles

| # | Principle | Application |
|---|---|---|
| 1 | **Never rely on colour alone** | Every status, category, and selection state also carries text, an icon, a ring, or a border change |
| 2 | **Support keyboard operation** | All interactive elements are natively focusable; focus is visible on every one |
| 3 | **Support reduced motion** | A global media query collapses all animation |
| 4 | **Support screen readers** | Landmarks, `aria-label`s, and status roles throughout |
| 5 | **Support low vision** | AA contrast in both themes; no text below 10px in critical paths |
| 6 | **Support motor impairment** | ≥44px touch targets; no hover-only affordances |
| 7 | **Support the actual use context** | Usable one-handed, outdoors, in bright sun, on poor connectivity |

---

## Colour and contrast

| Requirement | Status |
|---|---|
| Body text ≥ 4.5:1 | ✅ `#142B3B` on `#F7F9FA`; `#F1F5F9` on `#0B161E` |
| Large text ≥ 3:1 | ✅ Headings and button labels |
| Accent text | ✅ Darkened amber (`#855B09`) on amber fills; lightened teal (`teal-400`) on dark surfaces |
| Interactive borders ≥ 3:1 | ✅ Teal `#087F8C` borders on inputs and chips |
| Focus indicators | ✅ `focus:ring-2 focus:ring-teal-400` on buttons; teal border on inputs |

### Rules enforced

| Rule | Reason |
|---|---|
| Never use `#F2B544` as text | Fails contrast on white; use `#855B09` |
| Never use `#087F8C` as text on dark | Use `teal-400` |
| Never remove a border to save space | Light mode's contrast depends partly on borders |

---

## Colour independence

Colour is never the sole carrier of meaning anywhere in RouteX.

| Meaning | Colour | Also conveyed by |
|---|---|---|
| Hazard category | Category colour | **Category initial** on the marker; icon + **text label** on badges |
| Report status | Status colour | **Text label** ("Community Confirmed") |
| Stale data | Amber fill | **Clock icon** + age text + explanatory `title` |
| Demo data | Amber | **"Demo"** / **"Demo Mode"** text |
| Selected card | Teal border | **2px ring** + background change + shadow |
| Selected form tile | Teal border | **Ring** + tint + icon colour change |
| Role | Purple / amber / teal | **Text label** ("Admin", "Mod", "Citizen") |
| Active nav item | Teal / amber / indigo | **Font weight** + background chip |
| Error | Red | **Alert icon** + text message |
| Success | Green | **Check icon** + title |

The map marker is the most important case: a category-coloured circle with a **category
initial letter** is readable without perceiving hue at all.

---

## Keyboard

| Element | Behaviour |
|---|---|
| All buttons and links | Natively focusable |
| Primary buttons | `focus:outline-none focus:ring-2 focus:ring-teal-400` |
| Form inputs | `focus:border-[#087F8C] focus:bg-white` |
| Selects | `focus:outline-none focus:border-[#087F8C]` |
| Report modal | **Escape closes** — keydown listener active only while open |
| FAQ accordion | `<button>` with `aria-expanded` |
| Filter chips | `<button>` elements in a horizontal scroll row |
| Theme toggle | Native button with `aria-label` |
| Mobile menu | Native button with `aria-expanded` |
| FAQ / filter / category tiles | Native `<button type="button">`, never clickable `<div>` |

No custom keyboard handlers are needed because all controls are native elements. No
`tabIndex` is set on non-interactive elements.

---

## Screen readers

### Landmarks

| Element | Attribute |
|---|---|
| Header nav | `aria-label="Main Navigation"` |
| Mobile bottom nav | `aria-label="Mobile navigation"` |
| Map screen sidebar | `aria-label="Hazard list and filters"` |
| Map area | `aria-label="Interactive map"` |
| Detail panel | `aria-label="Hazard details"` |
| Demo banner | `aria-label="Demo data notice"` |
| Report modal | `role="dialog" aria-modal="true" aria-labelledby="report-hazard-title"` |
| User dropdown | `role="menu"` |
| Skeleton | `role="status" aria-label="Loading hazard details"` + `sr-only` "Loading..." |

### Labels

| Control | `aria-label` |
|---|---|
| Theme toggle | "Switch to dark mode" / "Switch to light mode" — states the **action** |
| Mobile menu | "Toggle navigation menu" |
| Close details | "Close details" |
| Close dialog | "Close dialog" |
| Remove photo | "Remove photo" |
| Logo SVG | `role="img" aria-label="RouteX Logo"` |

### State

| Element | Attribute |
|---|---|
| FAQ buttons | `aria-expanded` |
| Mobile menu toggle | `aria-expanded` |
| User dropdown trigger | `aria-expanded` |

### Loading announcement

```jsx
<div role="status" aria-label="Loading hazard details" ...>
  ...
  <span className="sr-only">Loading...</span>
</div>
```

### Emoji / decorative icons

All icons are Lucide SVGs inheriting `currentColor`, with text labels adjacent. None carry
information alone. The `sr-only` class provides visually-hidden text where needed.

---

## Motion

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

This covers `RevealOnScroll` entrances, `animate-ping`, `animate-pulse`, `animate-spin`,
the Leaflet `flyTo` transition, and `scroll-behavior: smooth` — the scroll-reveal pattern
would otherwise leave content permanently invisible for users with reduced motion set.

---

## Forms

| Requirement | Implementation |
|---|---|
| Real labels | Every input has `<label htmlFor>` |
| Required indicator | Red `*` plus the `required` attribute |
| Error association | Errors sit directly beneath their field |
| Error non-colour | `AlertCircle` icon plus text |
| Error timing | On submit, then cleared live as fields become valid |
| Autofill | Correct `autoComplete` tokens |
| Input modes | `type="email"`, `type="password"` for mobile keyboards |
| Character counter | Live `text-xs font-mono` count |
| Fieldset grouping | Category tiles sit under a visible label |
| Focus | Visible teal border on every field |

### Password visibility

Toggle buttons with `aria-label` inside the field's right edge, preserving the value and
focus.

---

## Touch targets

| Control | Size |
|---|---|
| Primary/secondary buttons | `py-2` to `py-3.5` — ≥ 36px, most ≥ 48px |
| Filter chips | `py-1.5 text-xs` — ≥ 30px |
| Icon buttons | `p-1.5` with `w-5 h-5` icon — ≥ 28px |
| Mobile nav items | Full-height flex column |
| Map markers | 32px (38px selected) — exceeds the 24px minimum |
| Marker hover | `scale(1.1)` — enlarges the touch area |

> **Note:** the smallest controls (icon buttons at ~28px) fall below the 44×44px
> recommendation. The frequently-used actions (map markers, bottom nav, primary CTAs) meet
> or exceed it. Icon-only buttons could be padded further.

---

## Zoom and reflow

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

| Requirement | Status |
|---|---|
| Reflow at 320px | ✅ No horizontal scroll |
| Pinch zoom | ⚠️ **Disabled** by `maximum-scale=1.0, user-scalable=no` |
| Text-only zoom | ✅ Layouts use relative units |

> **Recommendation:** disabling user zoom prevents magnification for low-vision users. It
> is a common PWA pattern aimed at preventing accidental double-tap zoom on the map, but
> WCAG 1.4.4 requires text to be resizable to 200%. Consider removing `maximum-scale=1.0`
> and `user-scalable=no`.

---

## Content clarity

RouteX writes for clarity as an accessibility measure.

| Practice | Example |
|---|---|
| Plain language | "Check the latest updates" not "Refresh status metadata" |
| Explicit rather than idiomatic | "Dial 112 / 911" not "contact authorities" |
| Uncertainty stated | "may be out of date" — never implying false precision |
| Limits disclosed | "not an official inspection" stated wherever confirmation is described |
| Action-verb buttons | "Report a hazard", "Submit report", "Try again" |
| No jargon | "Community-confirmed", not "flagged-positive" |

Dates use `en-GB` with explicit day, month, year, hour, and minute — unambiguous
internationally, unlike ambiguous numeric formats.

---

## Images

| Requirement | Implementation |
|---|---|
| Alt text on content images | `alt="Hazard photo preview"` |
| Decorative icons | No `alt`; paired with adjacent text |
| Logo | `role="img" aria-label="RouteX Logo"` |
| Icons with no text | Always accompanied by a visible label |

---

## Testing status

| Check | Status |
|---|---|
| Keyboard traversal | ✅ Native elements, visible focus |
| Contrast (light) | ✅ AA |
| Contrast (dark) | ✅ AA, with lightened accents |
| Reduced motion | ✅ Global media query |
| Screen reader labels | ✅ Landmarks and `aria-label`s present |
| Colour independence | ✅ Every meaning has a non-colour cue |
| Touch targets | ⚠️ Some icon buttons below 44px |
| Zoom / reflow | ⚠️ User zoom disabled |

### Recommended follow-ups

| Priority | Action |
|---|---|
| High | Remove `maximum-scale=1.0, user-scalable=no` so text can be zoomed to 200% |
| Medium | Pad icon buttons to ≥44px |
| Medium | Add `aria-live="polite"` to the hazard list so filtered results are announced |
| Low | Unify the admin badge colour (`purple-*` vs `indigo-*`) |
| Low | Add focus trapping to the report modal for full keyboard containment |
