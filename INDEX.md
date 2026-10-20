# Team NextGen — Design File Repository

This repository contains the **complete design documentation for RouteX's frontend**.

It is the companion to the application code repository, and is organised so that a judge,
reviewer, or new team member can understand the design system, screens, flows, and
decisions **without reading application source code**.

| | |
|---|---|
| **Project** | RouteX — Community-Powered Road Hazard Reporting & Awareness Platform |
| **Team** | NextGen |
| **Tagline** | *Know the Road Ahead.* |
| **Version** | 1.0.0-MVP |
| **Scope** | Frontend design (React + Vite + Tailwind CSS) |

---

## Start here

| If you want to… | Read |
|---|---|
| Understand the design system in 5 minutes | [`01-design-system/README.md`](01-design-system/README.md) |
| See the colour palette and type scale | [`01-design-system/colour.md`](01-design-system/colour.md), [`typography.md`](01-design-system/typography.md) |
| Browse the component library | [`03-components/README.md`](03-components/README.md) |
| Review a specific screen | [`04-screen-specs/README.md`](04-screen-specs/README.md) |
| Follow a user journey | [`05-user-flows/README.md`](05-user-flows/README.md) |
| Review accessibility | [`08-accessibility/README.md`](08-accessibility/README.md) |
| Review the PWA strategy | [`09-pwa/README.md`](09-pwa/README.md) |
| See the brand assets | [`02-brand/README.md`](02-brand/README.md) |
| Browse the icon set | [`02-brand/icons/index.html`](02-brand/icons/index.html) — visual gallery |

---

## Documentation map

```
routex-design/
│
├── README.md                        ← you are here
├── INDEX.md                         ← full documentation map
├── CONTRIBUTING.md                  ← maintenance guidance
│
├── 01-design-system/                Design tokens
│   ├── README.md                    Overview & core decisions
│   ├── colour.md                    Brand palette, dark mode, category & status colours
│   ├── typography.md                Type roles, scale, hierarchy
│   ├── spacing-and-layout.md        4px grid, containers, elevation, radius, z-index
│   └── motion.md                    Scroll reveal, stagger, micro-interactions
│
├── 02-brand/                        Brand identity
│   ├── README.md                    Logo, iconography, terminology
│   ├── logo.md                      Mark construction & usage rules
│   ├── identity-and-voice.md        Positioning, personality, voice, terminology
│   ├── assets/                      routex-logo.svg, favicon.svg
│   └── icons/                       71 Lucide SVGs + gallery + sprite + manifest
│       ├── README.md                Full icon reference
│       ├── index.html               Visual gallery
│       ├── sprite.svg               One <symbol> per icon
│       ├── manifest.json            Machine-readable index
│       └── *.svg                    71 standalone icons
│
├── 03-components/                   Component library (18 components)
│   ├── README.md                    Index & inventory
│   ├── common.md                    RouteXLogo, RevealOnScroll, composition rules
│   ├── buttons-and-controls.md      Buttons, chips, selects, tab bars, inputs
│   ├── badges-and-chips.md          Category, status, freshness, role, demo badges
│   ├── cards-and-panels.md          Cards, detail panel, advisory boxes, modals
│   ├── forms.md                     Report form, location picker, photo upload
│   ├── navigation.md                Header, dropdown, drawer, bottom nav, footer
│   ├── map-and-markers.md           Tiles, markers, popups, map helpers
│   └── states-and-feedback.md       Loading, error, empty, success
│
├── 04-screen-specs/                 Screen specifications
│   ├── README.md                    Inventory & cross-screen patterns
│   ├── landing-page.md              9 sections, fully specified
│   ├── map-and-discovery.md         Map shell, filters, detail panel
│   ├── report-hazard.md             The contribution flow
│   ├── authentication.md            Login, register, password flows
│   ├── dashboards.md                Citizen, moderator, admin
│   └── support-screens.md           404, home, full route table
│
├── 05-user-flows/                   End-to-end journeys
│   ├── README.md                    The contribution loop & principles
│   ├── report-a-hazard.md           Core value flow
│   ├── confirm-a-hazard.md          Peer confirmation
│   ├── flag-a-report.md             Community correction
│   ├── moderation.md                Moderator decisions & rationale
│   ├── admin-operations.md          Roles, settings, audit
│   ├── authentication.md            Session lifecycle & access tiers
│   └── information-architecture.md  Route map & navigation model
│
├── 06-patterns/                     Recurring implementation patterns
│   ├── README.md                    Pattern principles & anti-patterns
│   ├── map-pattern.md               Map rendering & lifecycle
│   ├── badge-pattern.md             Badge families & colour semantics
│   ├── state-pattern.md             Loading/error/empty/populated consistency
│   └── nav-pattern.md               Header, bottom nav, tab bars
│
├── 07-responsive/                   Responsive & theming
│   ├── README.md                    Breakpoints & per-screen behaviour
│   └── dark-mode.md                 Dark theme specification
│
├── 08-accessibility/                Accessibility
│   └── README.md                    Requirements, compliance, gaps
│
├── 09-pwa/                          Progressive Web App
│   └── README.md                    Manifest, service worker, install strategy
│
└── 10-backend-placeholder/          Backend & API design
    ├── README.md                    Architecture, app structure, design decisions
    ├── api-overview.md              URL map, versioning, pagination, CORS, config
    ├── data-model.md                7 models, fields, constraints, ER diagram
    ├── endpoints.md                 All 28 endpoints with request/response shapes
    ├── authentication.md            Session + CSRF, 4 access tiers, rate limits, reset
    ├── permissions.md               Permission classes, full role × action matrix
    ├── status-lifecycle.md          The 5 statuses and every transition
    ├── moderation-model.md          Flags, actions, mandatory rationale, audit log
    ├── platform-settings.md         Operational tunables, ranges, enforcement gaps
    ├── error-handling.md            Response formats, validation messages, silent failures
    ├── media-and-uploads.md         Photo validation, WebP pipeline, storage layout
    └── email-templates.md           Password reset email design & branding
```

---

## Backend at a glance

| | |
|---|---|
| **Stack** | Django 5.1 · DRF 3.15 · drf-spectacular 0.28 · Python 3.13+ |
| **Auth** | Session cookies with CSRF — revocable, unlike JWT |
| **Database** | SQLite (dev) · PostgreSQL (prod) |
| **Endpoints** | 28 routes + 3 aliases across 5 tags |
| **Models** | 7 across 3 apps |
| **Pagination** | 20/page on `/hazards/` only |
| **Rate limits** | Login 10/min · Register 5/hr · Reset 10/min |
| **Apps** | `accounts` · `hazards` · `moderation` · `common` |

### Core integrity guarantees

| Guarantee | Mechanism |
|---|---|
| One confirmation per user per report | `UniqueConstraint` (database level) |
| One flag per user per report | Checked in the view |
| Every moderation action has a rationale | Non-nullable model field + serializer `min_length=3` |
| Role changes are audited | `SystemAuditLog` entry on every write |
| Self-lockout impossible | Three independent guards |
| Road data survives user deletion | `on_delete=SET_NULL` on reporter and moderator |

---

## Design at a glance

### Core principle

> Road hazard data can be life-or-death. Every screen that presents hazard information
> shows freshness, provenance, and an explicit trust disclaimer. RouteX never claims
> official road authority.

### Six design principles

| # | Principle |
|---|---|
| 1 | **Safety before speed** — freshness and provenance always visible |
| 2 | **Map-first, not dashboard-first** — hazards are geographic |
| 3 | **Civic transparency** — the user's permission tier is always clear |
| 4 | **Honest uncertainty** — stale reports are marked, never deleted |
| 5 | **Installable and lightweight** — designed for low-bandwidth mobile use |
| 6 | **Safety pledge at the point of risk** — never report while driving |

### The palette at a glance

| | Light | Dark |
|---|---|---|
| **Ink** | `#142B3B` | `#F1F5F9` |
| **Accent** | `#087F8C` | `#0AA3B3` (hover) |
| **Surface** | `#F7F9FA` | `#0B161E` |
| **Card** | `#FFFFFF` | `#142533` |
| **Warning** | `#F2B544` | `amber-300` / `amber-400` |
| **Success** | `#27865B` | `emerald-300` |
| **Danger** | `#D64545` | `red-400` |
| **Muted** | `#667784` | `#94A3B8` |
| **Border** | `#DCE4E8` | `#284459` |

### The five hazard categories

| Category | Marker | Badge | Icon |
|---|---|---|---|
| Flooding | `#087F8C` | blue | `Droplets` |
| Pothole | `#F2B544` | amber | `CircleAlert` |
| Blocked road | `#D64545` | red | `ShieldAlert` |
| Fallen tree | `#27865B` | emerald | `Trees` |
| Other | `#667784` | slate | `AlertCircle` |

### Technology

React 18 · Vite 6 · Tailwind CSS 4 · Lucide React · Leaflet / React Leaflet · React
Router 6 (data router) · Axios

---

## Scope

| Included | Deferred |
|---|---|
| Complete design token system | Backend tests (`apps/*/tests.py`) |
| Brand identity and logo | High-fidelity Figma source file |
| 18 component specifications | Exported screenshot set |
| 11 screen specifications |  |
| 7 user flow documents |  |
| 4 implementation patterns |  |
| Responsive breakpoints & behaviour |  |
| Dark mode specification |  |
| Accessibility requirements |  |
| PWA & offline strategy |  |
| **Backend API reference & data model** |  |

**Note:** the specifications in this repository are derived from the implemented source, so
they document the design and API *as built*. Where the code contains an inconsistency, it is
flagged inline — for example, the `purple`/`indigo` admin badge, the dual `freshness` field
shape, and the three platform settings that are admin-editable but not enforced.

---

## Relationship to the code repository

| Concern | This repository | Application repository |
|---|---|---|
| Design tokens & rationale | ✅ Authoritative | Implements them |
| Component specifications | ✅ Authoritative | Implements them |
| Screen layouts | ✅ Authoritative | Implements them |
| API contract & data model | ✅ Authoritative | Implements it |
| Application logic | — | ✅ Authoritative |
| Deployment configuration | — | ✅ Authoritative |

When these disagree, the **code** is authoritative for behaviour and this repository is
authoritative for design intent. Discrepancies should be resolved by updating both.
