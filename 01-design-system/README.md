# Design System — Overview

The RouteX design system is token-driven. Every colour, type style, spacing step, radius,
elevation, and motion value used by the frontend is recorded in this folder.

## Contents

| Document | Covers |
|---|---|
| [`colour.md`](colour.md) | Brand palette, dark mode palette, category colours, status colours, contrast rules, map tile treatment |
| [`typography.md`](typography.md) | Typeface strategy, type roles and scale, hierarchy rules, tone of voice |
| [`spacing-and-layout.md`](spacing-and-layout.md) | 4px grid, container widths, elevation scale, radius scale, layout primitives, z-index scale |
| [`motion.md`](motion.md) | Scroll reveal, stagger patterns, micro-interactions, component entrances, reduced motion |

## Source of truth in code

| Token group | File |
|---|---|
| Colour theme, reduced motion, Leaflet + marker CSS | `frontend/src/index.css` |
| Hazard categories, statuses, badge styles | `frontend/src/utils/hazardConstants.js` |
| Scroll reveal behaviour | `frontend/src/components/common/RevealOnScroll.jsx` |
| Dark mode persistence | `frontend/src/context/ThemeContext.jsx` |

## Core decisions

**One accent, one ink.** The interface uses a single teal accent (`#087F8C`) for all
primary action and a single ink navy (`#142B3B`) for text and chrome. Semantic colour
(amber / green / red) is reserved for data meaning — hazard severity, report status,
freshness — and is never used decoratively. This is what keeps a map dense with markers
from becoming visually noisy.

**Dark mode is a first-class theme, not an inversion.** Dark surfaces use four distinct
elevation steps (`#0B161E` → `#142533` → `#1B3142` → `#284459`) rather than a single
dark colour, so cards, inputs, and borders remain distinguishable.

**Data colour is separated from UI colour.** Marker and badge colours come from
`hazardConstants.js`; UI chrome colours come from the `@theme` block. Changing a category
colour never affects the interface, and vice versa.

**4px grid, Tailwind defaults.** No custom spacing scale is introduced, so the design
system and the utility classes stay in direct correspondence.
