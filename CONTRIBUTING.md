# Contributing to the Design File Repository

Guidance for keeping this documentation accurate and useful.

---

## What belongs here

| Include | Exclude |
|---|---|
| Design tokens and their rationale | Application source code |
| Component specifications | Build configuration |
| Screen layouts and behaviour | API implementation |
| User flows and information architecture | Generated files |
| Brand identity and voice | Secrets, credentials, `.env` |
| Responsive, dark mode, accessibility rules | Binary assets other than brand icons |
| PWA and offline strategy | Screenshots in progress |

This repository documents **design**. The application repository contains **code**. Keep
the two in sync when either changes.

---

## Source of truth

| Token group | Authoritative file |
|---|---|
| Colour theme, reduced motion, Leaflet CSS | `frontend/src/index.css` |
| Hazard categories, statuses, badge styles | `frontend/src/utils/hazardConstants.js` |
| Scroll reveal behaviour | `frontend/src/components/common/RevealOnScroll.jsx` |
| Dark mode persistence | `frontend/src/context/ThemeContext.jsx` |

Specifications here are derived from these files. **When the code changes, update this
repository in the same commit.**

---

## Adding a component

1. Add the component to the inventory table in `03-components/README.md`.
2. Document it in the matching category file — or create a new one if it fits none.
3. Include: purpose, props, visual specification, all states, light **and** dark values,
   accessibility notes, and usage guidance.
4. Cross-link from any screen spec that uses it.

## Adding a screen

1. Add it to the inventory and route table in `04-screen-specs/`.
2. Document layout, sections in order, states, responsive behaviour, and auth requirements.
3. Add a flow document if the screen involves a user journey worth explaining.

## Adding a design token

1. Add it to the relevant file in `01-design-system/`.
2. Note the CSS variable name **and** the Tailwind class.
3. Document both light and dark values.
4. State the contrast requirement if it is a colour.

---

## Documentation standards

| Rule | Reason |
|---|---|
| Give **hex first**, then the token name | Hex is unambiguous across themes |
| Document light **and** dark values | A half-specified theme is a bug |
| Use tables for anything with three or more variants | Easier to scan and diff |
| Include a "why" for design decisions | Rationale outlives the decision |
| Mark inconsistencies explicitly rather than hiding them | Honest documentation is more useful than tidy documentation |
| Link rather than repeat | Single source of truth per fact |

---

## Versioning

This repository carries no version tags of its own. It tracks the application version
(`1.0.0-MVP`).

Significant design changes should be noted in the relevant document's changelog:

```markdown
## Changelog

### 1.1.0 — 2026-11-02
- Added `danger` status treatment
- Darkened secondary text from `#667784` to `#5A6B77` for AA contrast
```

---

## Known inconsistencies to resolve

Tracked in the documents where they occur:

| Issue | Location |
|---|---|
| Admin badge uses `purple-*` in the header chip but `indigo-*` in navigation | [`06-patterns/badge-pattern.md`](06-patterns/badge-pattern.md) |
| Hazard freshness appears as both `freshness` and `freshness_info` | [`10-backend-placeholder/README.md`](10-backend-placeholder/README.md) |
| List responses may be paginated or a bare array | [`10-backend-placeholder/README.md`](10-backend-placeholder/README.md) |
| `HomePage` exists but `/` routes to `LandingPage` | [`04-screen-specs/support-screens.md`](04-screen-specs/support-screens.md) |
| User zoom is disabled, conflicting with WCAG 1.4.4 | [`08-accessibility/README.md`](08-accessibility/README.md) |
| Static `<meta name="theme-color">` does not follow the theme toggle | [`07-responsive/dark-mode.md`](07-responsive/dark-mode.md) |
