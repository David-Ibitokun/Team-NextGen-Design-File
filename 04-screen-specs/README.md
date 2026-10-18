# Screen Specs — README

Per-screen layout, hierarchy, behaviour, and responsive notes for every route in the
RouteX frontend.

## Contents

| Document | Covers |
|---|---|
| [`landing-page.md`](landing-page.md) | `/` — all 9 sections: hero, trust strip, how it works, features, live pulse, categories, emergency advisory & pledge, safety and trust, FAQ, PWA install, CTA, footer |
| [`map-and-discovery.md`](map-and-discovery.md) | Map application shell — sidebar, filters, list, detail slide-over, URL state, responsive behaviour |
| [`report-hazard.md`](report-hazard.md) | `/report` — the five-field contribution form, validation, photo compression, success state |
| [`authentication.md`](authentication.md) | Login, register, forgot password, reset password |
| [`dashboards.md`](dashboards.md) | Citizen dashboard, moderator queue, administrator portal |
| [`support-screens.md`](support-screens.md) | Not-found (404), Home, complete route table, provider hierarchy |

## Screen inventory

| Screen | Route | Complexity | Primary audience |
|---|---|---|---|
| Landing | `/` | High — 9 sections | Prospective and anonymous users |
| Map & Discovery | `/map`, `/` | High — split layout, live data | Everyone |
| Report Hazard | `/report` | Medium — 5 fields, map picker | Citizens |
| Login | `/login` | Low | Everyone |
| Register | `/register` | Medium | New users |
| Forgot Password | `/forgot-password` | Low | Locked-out users |
| Reset Password | `/reset-password` | Low | Users with a reset token |
| Citizen Dashboard | `/dashboard`, `/my-reports` | Medium — 3 tabs | Citizens |
| Moderator Queue | `/moderator`, `/moderation` | High — 3 tabs, action modals | Moderators, admins |
| Admin Portal | `/admin-dashboard`, `/admin` | High — 3 tabs, destructive actions | Admins |
| Not Found | `*` | Low | Anyone |

## Cross-screen patterns

| Pattern | Where it appears |
|---|---|
| Teal primary CTA | Every screen — landing, map, dashboards, auth |
| Metric tile strip | All three dashboards |
| Tab bar with one visible panel | All three dashboards |
| Loading / error / empty trio | Every data-backed screen |
| Mandatory rationale on privileged actions | Moderator actions, admin role changes |
| Demo data disclosure | Map, landing live pulse, map preview |
| Install prompt | Header, landing PWA section, mobile drawer |

## Two-axis density model

RouteX deliberately runs at two densities, and choosing the right one per surface is a
design decision rather than an inconsistency.

| Density | Surfaces | Characteristics |
|---|---|---|
| **Marketing** | Landing, auth, 404 | Generous `py-16`/`py-24` section rhythm, `text-base`–`text-6xl` type, wide measures, scroll reveal |
| **Operational** | Map, form, dashboards | Compressed `p-3.5` cards, `text-xs` type, tight grids, fixed viewports, no page scroll |

Both densities share identical colour, iconography, badge, and component definitions — so
the app reads as one system whether a user is being persuaded or working.

## Design decision notes

**Landing is nine sections, not a scroll marathon.** Each section answers one question:
what is this, why trust it, how does it work, what can it do, what is happening near me,
what can I report, when should I *not* use it, why is it honest, questions, how do I
install it. The trust sections are interleaved with the promotional ones rather than
pushed to the end.

**The emergency advisory sits mid-page, not in the footer.** Telling users when to dial
112 instead of using RouteX is placed alongside the hazard categories, where someone
selecting a hazard type is most likely to be mid-decision.

**Three dashboards, one shell.** Rather than three bespoke admin layouts, all three share
metric tiles plus tabs. A moderator and an administrator work with the same mental model,
so the difference is content and authority, not navigation.

**Report form is one component, two hosts.** The `isModal` prop lets `/report` and the
map modal share a single implementation, guaranteeing the mobile page and desktop dialog
cannot drift apart.
