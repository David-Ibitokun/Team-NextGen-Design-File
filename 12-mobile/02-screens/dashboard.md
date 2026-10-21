# Mobile Screen — Dashboard

**Component:** `mobile/src/components/DashboardScreenNative.tsx`

A role-scoped dashboard with four tabs. Reached from the header's "Dashboard" button.

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ AppHeaderNative                                               │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │  (avatar)  Citizen Contributor  [✓ Verified]           │  │
│  │             @citizen · Community Guardian              │  │
│  │  ┌──────────────────┐  ┌──────────────────┐             │  │
│  │  │ ＋ New Report    │  │ 📍 Live Map      │             │  │
│  │  └──────────────────┘  └──────────────────┘             │  │
│  └────────────────────────────────────────────────────────┘  │
│  [Citizen Overview] [My Reports (12)] [Moderator] [Admin]    │  ← scrollable
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Total Reports    │  │ Confirmations    │                 │
│  │ 12               │  │ 14               │                 │
│  │ Community hazards│  │ Verified by...   │                 │
│  └──────────────────┘  └──────────────────┘                 │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Active Alerts    │  │ Resolved         │                 │
│  │ 7                │  │ 3                │                 │
│  │ Currently alert..│  │ Roadways cleared │                 │
│  └──────────────────┘  └──────────────────┘                 │
├──────────────────────────────────────────────────────────────┤
│  Map          (+) Report          Hazards                  │
└──────────────────────────────────────────────────────────────┘
```

A `ScrollView` with `padding: 16`, `paddingBottom: 32`, `gap: 16`.

---

## Profile card

| Property | Value |
|---|---|
| Radius | `16` |
| Border | `1px`, `theme.border` |
| Padding | `18` |
| Background | `theme.surface` |
| Elevation | `2`, shadow `0, 2` at `0.08` |

### Avatar

| Property | Value |
|---|---|
| Size | `52 × 52` |
| Radius | `16` |
| Icon | `User` at `28`, `theme.teal` |
| Fill | `#E6F4F6` (light) · `#13353A` (dark) |

The avatar is a **generic `User` glyph in a teal tile**, not a photo or an initial. The web
uses a coloured initial; the mobile uses an icon. Both avoid requiring avatar uploads.

### Identity

| Element | Value |
|---|---|
| Name | `fontSize: 16`, `fontWeight: '800'` — "Citizen Contributor" |
| Handle | `fontSize: 12`, `theme.textMuted` — "@citizen · Community Guardian" |

> **The identity is hardcoded.** There is no session, no auth context, and no
> `/api/v1/auth/me/` call in the mobile app. "Citizen Contributor" and "@citizen" are
> literal strings.

### Verified pill

| Property | Value |
|---|---|
| Layout | `ShieldCheck` at `12` + "Verified", `gap: 4` |
| Padding | `7` horizontal, `2` vertical |
| Radius | `10` |
| Border | `1px`, `theme.green` |
| Fill | `#EAF6F0` (light) · `#0F3826` (dark) |
| Text | `theme.green`, `fontSize: 10`, `fontWeight: '700'` |

### Quick actions

Two buttons in a row, `gap: 10`.

| Button | Background | Border | Icon | Label |
|---|---|---|---|---|
| **New Report** | `theme.teal` | — | `PlusCircle` at `15`, white | "New Report", white |
| **Live Map** | `theme.surfaceSubtle` | `theme.border` | `MapPin` at `15`, `theme.teal` | "Live Map", `theme.textPrimary` |

Both `flex: 1`. The primary is a solid teal fill; the secondary is a subtle surface with
a hairline border — the same hierarchy as the web.

---

## Role tabs

A horizontal `ScrollView` of four pills.

| Property | Value |
|---|---|
| Padding | `14` horizontal, `7` vertical |
| Radius | `18` |
| Border | `1px` |
| Label | `fontSize: 12`, `fontWeight: '700'` |

| Tab | Label |
|---|---|
| `overview` | "Citizen Overview" |
| `my_reports` | "My Reports (N)" |
| `moderator` | "Moderator Queue" |
| `admin` | "Admin Control" |

| State | Background | Border | Text |
|---|---|---|---|
| Active | `theme.teal` | `theme.teal` | white |
| Inactive | `theme.surface` | `theme.border` | `theme.textPrimary` |

### A significant design decision

**All four role tabs are always visible**, regardless of the user's actual role. A citizen
can open "Admin Control" and "Moderator Queue".

What they see is a **read-only summary** with an action button that opens an `Alert`:

| Tab | Action | Alert message |
|---|---|---|
| Moderator | "Launch Moderator Workbench" | "All pending reports are synced with the live verification queue." |
| Admin | "Open Full Admin Portal" | "System parameters are synchronized with the RouteX platform." |

The admin tab shows two read-only parameters:

| Parameter | Value | Source |
|---|---|---|
| Confirmation Threshold | "3 votes (Auto-confirm)" | **Hardcoded** |
| Report Freshness Window | "24 hours" | **Hardcoded** |

### Security assessment

This is **not a privilege escalation** — the mobile app has no session, so it holds no
credentials, and the alerts perform no privileged action. The backend enforces the real
permission boundary regardless.

But it **misrepresents the product**. A judge who taps "Admin Control" sees an
admin-looking panel with working parameters and an "Open Full Admin Portal" button that
only shows an alert. The user is told admin functionality exists, and the control is a
stub.

> **Recommendation:** either (a) hide the moderator and admin tabs unless a real session
> establishes the role, or (b) label them clearly as previews — for example, a
> "Preview" badge on each and copy that says the full workbench lives on the web portal.
> Option (b) keeps the scope visible for a hackathon demo while being honest.

---

## Tab 1 — Citizen Overview

Four metric cards in a 2 × 2 grid.

| Metric | Value | Icon | Icon colour | Subtitle |
|---|---|---|---|---|
| Total Reports | `hazards.length` | `AlertTriangle` at `15` | `#F2B544` | "Community hazards shared" |
| Confirmations | `sum(confirmations_count)` | `HeartHandshake` at `15` | `theme.teal` | "Verified by commuters" |
| Active Alerts | `status === 'reported' \|\| 'community_confirmed'` | `Clock` at `15` | `#FB923C` | "Currently alerting drivers" |
| Resolved | `status === 'resolved'` | `CheckCircle2` at `15` | `theme.green` | "Roadways cleared" |

| Property | Value |
|---|---|
| Background | `theme.surface` |
| Border | `1px`, `theme.border` |
| Radius | `12` |
| Padding | `14` |
| Gap | `10` |

Each card stacks a label + icon header, a large value, and a subtitle.

> **Inconsistency:** the icon colours here are raw hex (`#F2B544`, `#FB923C`) while
> everything else uses theme tokens. `#FB923C` (orange-400) does not exist anywhere else
> in the system — the theme's amber is `#F2B544` in light and `#FBBF24` in dark.

> **Data caveat:** "Total Reports" counts *all* hazards fetched for the current filter,
> not the user's own submissions. The web computes these from
> `/api/v1/auth/dashboard-summary/`, which is scoped to the authenticated user. The
> mobile figures are community-wide, not personal — while the tab is labelled "My
> Reports".

---

## Tab 2 — My Reports

A section title and a stack of `HazardCardNative` components.

| Element | Value |
|---|---|
| Title | "Submitted Ground Reports", `fontSize: 15`, `fontWeight: '800'`, `theme.textPrimary` |
| Cards | `HazardCardNative` for every hazard |

> **Both problems in one tab.** The heading says "Submitted" and the tab says "My
> Reports", but the list is the same `hazards` array used by the main feed — every hazard
> currently loaded, not the user's submissions. There is no reporter filter.

---

## Tab 3 — Moderator Queue

A card with a header, description, two stat rows, and an outline button.

| Element | Value |
|---|---|
| Header icon | `Sliders` at `18`, `theme.teal` |
| Title | "Moderator Review Queue", `fontSize: 14`, `800` |
| Description | "Review pending and flagged reports to ensure road safety data accuracy across the network." |
| Stat row | Hairline top border, label left, count right |
| Button | Outline, `theme.teal` border and text |

| Stat | Value | Colour |
|---|---|---|
| Pending Review | `status === 'under_review'` count + " items" | `#F2B544` |
| Community Confirmed | confirmed count + " items" | `theme.teal` |

---

## Tab 4 — Platform Administration

A card with a header, description, two parameter boxes, and an outline button.

| Element | Value |
|---|---|
| Header icon | `Settings` at `18`, `theme.teal` |
| Title | "Platform Administration", `fontSize: 14`, `800` |
| Description | "Manage operational parameters, threshold triggers, and system audit trails." |
| Parameter box | `theme.surfaceSubtle`, radius `8` |
| Button | Outline with `ExternalLink` at `14` |

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Identity is hardcoded | Every user sees "Citizen Contributor" | Add a session and fetch `/api/v1/auth/me/` |
| "My Reports" shows all hazards | The tab label does not match the content | Filter by reporter |
| Metric figures are community-wide | Presented as personal dashboard metrics | Use the dashboard-summary endpoint |
| Role tabs are visible to everyone | Implies access that does not exist | Hide by role, or label as previews |
| Action buttons are `Alert` stubs | Dead-end interactions | Route to the web portal, or implement natively |
| Threshold and freshness values are hardcoded | Cannot reflect actual platform settings | Fetch `/api/v1/admin/settings/` |
| Raw hex icon colours | Breaks the token system | Use `theme.amber`, `theme.teal`, `theme.green` |
| `#FB923C` is not a system colour | An orphan orange | Replace with the theme's amber |
| No admin tab indicator of actual permission | A user cannot tell what they may do | Add a role chip from the session |
