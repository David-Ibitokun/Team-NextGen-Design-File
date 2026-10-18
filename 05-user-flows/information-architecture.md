# Information Architecture

How RouteX's screens, routes, and navigation fit together.

---

## Route map

```
RouteX
│
├── Public
│   ├── /                      LandingPage        9-section marketing + trust surface
│   ├── /map                   MapPage            Map, filters, list, details  ★ core
│   ├── /login                 LoginPage
│   ├── /register              RegisterPage
│   ├── /forgot-password       ForgotPasswordPage
│   ├── /reset-password        ResetPasswordPage
│   └── *                      NotFoundPage
│
├── Citizen            (authenticated)
│   ├── /report                ReportHazardPage   Also available as a map modal
│   ├── /dashboard             CustomerDashboardPage
│   └── /my-reports            CustomerDashboardPage   (alias)
│
├── Moderator          (moderator | admin)
│   ├── /moderator             ModerationPage
│   └── /moderation            ModerationPage          (alias)
│
└── Administrator      (admin)
    ├── /admin-dashboard       AdminDashboardPage
    └── /admin                 AdminDashboardPage      (alias)
```

★ The map is the product. `/` currently routes to `LandingPage`; the map application shell
also exists as `HomePage`, and `MapPage` adds URL-synced filters.

---

## Navigation model

RouteX uses **two navigation systems**, chosen by screen type.

| System | Used on | Rationale |
|---|---|---|
| **Top header** (+ mobile drawer) | Landing, map, all dashboards, auth | Standard web navigation with role-aware items |
| **Fixed bottom navigation** | Map, mobile only | Map and list cannot coexist on a phone; a persistent thumb-reached toggle beats a hidden control |
| **Tab bar** | All three dashboards | One work surface per role; tabs keep three dense areas from becoming one endless page |

### Access matrix

| Navigation | Anonymous | Citizen | Moderator | Admin |
|---|---|---|---|---|
| How it works · Features · Safety & Trust | ✅ | — | — | — |
| Explore Map | ✅ | ✅ | ✅ | ✅ |
| Report a Hazard | → login | ✅ | ✅ | ✅ |
| Citizen Dashboard | → login | ✅ | ✅ | ✅ |
| Moderator Queue | — | — | ✅ | ✅ |
| Admin Portal | — | — | — | ✅ |
| API Docs | ✅ (`xl`+) | ✅ | ✅ | ✅ |
| Theme toggle | ✅ | ✅ | ✅ | ✅ |
| Install App | ✅ when available | ✅ | ✅ | ✅ |

The signed-out header shows persuasion sections; the signed-in header shows work
surfaces. Adapting the menu to intent means a visitor is guided toward understanding and a
user is routed to their work.

---

## Screen groups by audience

### Everyone

| Screen | Purpose |
|---|---|
| Landing | Understand the product, trust it, enter the map |
| Map | Explore and contribute hazards |
| Auth screens | Manage a session |
| Not Found | Recover from a bad URL |

### Citizen

| Screen | Purpose |
|---|---|
| Report | Contribute a hazard |
| Citizen Dashboard | Track personal submissions and impact, edit profile |

The dashboard has three tabs — My Reports, Community Impact, Settings — because a citizen
needs both transactional tracking (what did I report?) and motivational context (does it
matter?). Road safety guidelines sit in the impact tab to reinforce responsible reporting.

### Moderator

| Screen | Purpose |
|---|---|
| Moderation Queue | Review flagged reports, apply actions with rationale |
| Decision History | Review all moderation decisions for consistency |

Queue and history are the only two tabs — a moderator's entire job is deciding and
remaining consistent with prior decisions.

### Administrator

| Screen | Purpose |
|---|---|
| Users & Roles | Search, promote, demote, delete accounts |
| Platform Settings | Tune confirmation threshold, freshness window, upload limit |
| Audit Trail | Inspect every privileged action |

Three tabs map exactly onto the three administrative capabilities in the permission
matrix: manage roles, configure parameters, inspect audit logs.

---

## Cross-cutting concerns

### Trust surfaces

Certain screens exist to communicate limits rather than provide function. This is a
deliberate architectural choice, not filler.

| Surface | Location | Purpose |
|---|---|---|
| Emergency advisory | Landing §5.5 | Teaches when **not** to use RouteX |
| Citizen observer pledge | Landing §5.5 | Four reporting principles |
| Honest safety notice | Landing §6 | Explicit non-guarantee of road safety |
| Integrity & governance | Landing §6 | Four trust principles |
| FAQ (esp. Q4) | Landing §7 | Pre-empts the "community-confirmed = officially verified" misreading |
| Demo data banner | Map screen | Prevents seeded data being read as live road closures |
| Freshness badges | Everywhere | Marks uncertain information rather than hiding it |

### Context preservation

| Pattern | Implementation |
|---|---|
| Report as modal on the map | `ReportHazardModal` keeps map position and filters |
| Deep links with `?next=` | Auth redirects resume the intended destination |
| Shareable filter URLs | `?category=` / `?status=` reflected in `MapPage` |
| Deep-link coordinates | `/map?lat=…&lng=…` from the landing live pulse |
| Slide-over not navigation | `HazardDetailsPanel` overlays the map |

RouteX is designed so a user rarely loses where they were.

---

## Provider hierarchy

```
ThemeProvider                 ← must wrap everything: dark: variants
└── AuthProvider              ← must wrap router: role-gated nav + guards
    └── RouterProvider
```

---

## Alias strategy

Each dashboard is reachable under a descriptive and a short path (`/dashboard` +
`/my-reports`, `/moderator` + `/moderation`, `/admin-dashboard` + `/admin`). Both render
the same component, and the header highlights the correct nav item by matching both paths.

This keeps URLs memorable and shareable without duplicating components.
