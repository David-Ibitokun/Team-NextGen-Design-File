# Screens — Support

Supporting screens that complete the route table.

---

## Not Found (`*`)

Catch-all route rendered by the router for any unmatched path.

| Element | Specification |
|---|---|
| Icon | Large muted `MapPin` in a `w-12 h-12 rounded-full` teal-tinted circle |
| Headline | `text-2xl sm:text-3xl font-extrabold` — "Page not found" |
| Body | `text-sm text-[#667784]` — explains the address does not match any RouteX page |
| Primary action | "Explore the map" → `/map` |
| Secondary | Link back to the landing page |

The standard `AppHeader`, background, and page container are retained, so a mistyped URL
still feels like part of the product rather than a broken deployment. The primary action
returns users to the map, which is where nearly all sessions are headed.

---

## Home (`/`)

> **Router note:** the current router maps `/` to `LandingPage`. The `HomePage` component
> still exists in the codebase and renders the map application shell.

`HomePage` is the simpler of the two map screens: identical layout and components to
`MapPage`, but **without** URL parameter synchronisation or an auth check.

| Behaviour | Detail |
|---|---|
| Filters | Local `useState` only — no query-string reflection |
| Selection | Selecting a hazard opens the detail panel and flies the map |
| Report flow | Modal, with the new hazard prepended and auto-selected |
| Auth | Uses the `onReportClick` handler from `AppHeader`; confirm/flag errors surface auth prompts inline |

Use this as the reference implementation for the map shell. `MapPage` extends it with
shareable filter state.

Full specification:
[`map-and-discovery.md`](map-and-discovery.md).

---

## Route table

Complete routing map from `frontend/src/app/router.jsx`, using `createBrowserRouter`.

| Path | Component | Purpose | Access |
|---|---|---|---|
| `/` | `LandingPage` | Public marketing and trust surface | Public |
| `/map` | `MapPage` | Map, filters, report, confirm, flag | Public (actions gated) |
| `/report` | `ReportHazardPage` | Full-page hazard report form | Authenticated |
| `/login` | `LoginPage` | Sign in | Public |
| `/register` | `RegisterPage` | Create account | Public |
| `/forgot-password` | `ForgotPasswordPage` | Request reset link | Public |
| `/reset-password` | `ResetPasswordPage` | Set a new password | Token required |
| `/dashboard` | `CustomerDashboardPage` | Citizen dashboard | Citizen |
| `/my-reports` | `CustomerDashboardPage` | Alias for the citizen dashboard | Citizen |
| `/moderator` | `ModerationPage` | Moderation queue | Moderator |
| `/moderation` | `ModerationPage` | Alias for the moderation queue | Moderator |
| `/admin` | `AdminDashboardPage` | Administrator portal | Admin |
| `/admin-dashboard` | `AdminDashboardPage` | Alias for the admin portal | Admin |
| `*` | `NotFoundPage` | Catch-all | Public |

### Alias strategy

Each dashboard is reachable under two paths — a descriptive (`/dashboard`) and a short
(`/admin`). Aliases render the same component, and the header highlights the correct nav
item by matching **both** paths. This keeps URLs shareable and memorable without
duplicating components.

### Provider hierarchy

```
ThemeProvider
└── AuthProvider
    └── RouterProvider (router)
```

`ThemeProvider` must wrap everything so `dark:` variants resolve. `AuthProvider` must wrap
the router so role-gated navigation items and route guards can read the session.

### Route guard behaviour

Moderator and admin screens read `useAuth()` and redirect unauthorised users to `/`. This
is a **UX convenience only** — the real security boundary is the Django REST Framework
permission layer on the server. Every privileged endpoint enforces its own permission
class, so bypassing the frontend guard grants no access.
