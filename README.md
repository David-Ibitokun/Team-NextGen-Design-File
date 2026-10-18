# RouteX — Design File Repository

**Team:** NextGen
**Product:** RouteX
**Tagline:** *Know the Road Ahead.*
**Repository type:** Design artifacts & specifications (separated from application code)

---

## What is this repository?

This repository holds the **design record** for RouteX's frontend. It documents the
design system, brand identity, component library, screen specifications, user flows,
responsive behaviour, accessibility rules, and Progressive Web App (PWA) design.

It is intentionally **separate from the application code repository** so that:

- Designers and judges can review the design work without reading application source.
- Design tokens are documented as a contract the frontend implements.
- Screenshots, wireframes, and mockups have a home that is not rebuilt on every code push.

**Application code lives here:** `Team-NextGen-RouteX/`

---

## Repository contents

| Folder | Purpose |
|---|---|
| [`01-design-system/`](01-design-system/) | Design tokens: colour, typography, spacing, elevation, motion |
| [`02-brand/`](02-brand/) | Brand identity: logo, logo usage rules, colour palette reference |
| [`03-components/`](03-components/) | Per-component specifications and usage guidance |
| [`04-screen-specs/`](04-screen-specs/) | Screen-by-screen layout specifications |
| [`05-user-flows/`](05-user-flows/) | End-to-end user journeys and information architecture |
| [`06-patterns/`](06-patterns/) | Recurring UI patterns (map, badges, states, nav) |
| [`07-responsive/`](07-responsive/) | Breakpoints and responsive layout rules |
| [`08-accessibility/`](08-accessibility/) | Accessibility requirements and compliance notes |
| [`09-pwa/`](09-pwa/) | Progressive Web App manifest and offline strategy |
| [`10-backend-placeholder/`](10-backend-placeholder/) | Reserved for backend/API design documentation |

---

## Technology context

The design system is implemented with the following stack, which constrains what is
achievable and should be considered when extending the system.

| Concern | Choice | Version |
|---|---|---|
| UI framework | React | 18.3 |
| Build tool | Vite | 6.0 |
| Styling | Tailwind CSS | 4.0 |
| Icons | Lucide React | 0.469 |
| Maps | Leaflet + React Leaflet | 1.9 / 4.2 |
| Routing | React Router | 6.28 (data router / `createBrowserRouter`) |
| HTTP client | Axios | 1.7 |
| PWA | Native service worker (no framework) | — |

**Theme mode is implemented** via a `.dark` class variant on `<html>`, with user
preference persisted to `localStorage` under the key `routex-theme`.

---

## Design principles

1. **Safety before speed.** Road hazard data can be life-or-death. Every screen that
   presents hazard information shows freshness, provenance, and an explicit trust
   disclaimer. RouteX never claims official road authority.
2. **Map-first, not dashboard-first.** Hazards are geographic. The interactive map is the
   primary surface; all other screens support it.
3. **Civic transparency.** Four account tiers with strict role separation. The interface
   always makes clear whether a user is acting as a citizen, moderator, or administrator.
4. **Honest uncertainty.** Stale reports are visibly marked rather than hidden or deleted.
   Community confirmation is never presented as official inspection.
5. **Installable and lightweight.** The PWA shell works on low-bandwidth mobile
   connections, which is where road users actually encounter hazards.
6. **Safety pledge at the point of risk.** The interface explicitly tells users not to
   photograph or report hazards while driving.

---

## Target platforms

- Android phones (primary), iOS phones, tablets
- Desktop and laptop browsers
- Installed PWA mode on Android, iOS, macOS, and Windows

---

## Documentation conventions

- Colour values are given as **hex** (source of truth) plus the semantic Tailwind token name.
- Light and dark mode values are documented side by side.
- Spacing uses a **4px base grid**.
- Type sizes are documented in the Tailwind scale used by the codebase.

---

## Status

Frontend design is documented. Backend/API design documentation is pending and reserved
in `10-backend-placeholder/`.
