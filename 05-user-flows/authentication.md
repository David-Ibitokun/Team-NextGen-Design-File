# Flow — Authentication

Session lifecycle for all four account tiers.

**Screens:** `/login`, `/register`, `/forgot-password`, `/reset-password`

---

## Tiers

RouteX enforces four access levels on the server, enforced by Django REST Framework
permission classes. The frontend mirrors these as a UX convenience — **never** as the
security boundary.

| Tier | Capabilities |
|---|---|
| **Anonymous visitor** | Browse the landing page and live map, filter, inspect report details |
| **Registered citizen** | Everything above, plus submit reports, confirm hazards (1 per report), flag reports, access the citizen dashboard |
| **Moderator** | Everything above, plus the moderation queue and decision history |
| **Administrator** | Everything above, plus user and role management, operational settings, audit logs |

Client-side derivation in `AuthContext`:

```js
isAuthenticated = Boolean(user)
isAdmin         = user && (user.is_superuser || user.role === "admin")
isModerator     = user && (user.is_superuser || user.is_staff
                           || role === "moderator" || role === "admin")
isCitizen       = Boolean(user)
```

Note that an administrator is treated as a moderator — the moderator surface is a subset
of the admin surface, so admins can moderate without holding a second role.

---

## Flow — Sign in

```
  ┌──────────────────────┐
  │ Gated action or nav  │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────────────────┐
  │ /login?next=<intended destination│
  └──────────┬───────────────────────┘
             │
             ▼
  ┌──────────────────────┐
  │ Username or email +  │
  │ password             │
  └──────────┬───────────┘
             │ submit
             ▼
  ┌──────────────────────┐
  │ POST /auth/login/    │
  │ (session cookie)     │
  └──────────┬───────────┘
             │
        ┌────┴─────┐
        ▼          ▼
   ┌────────┐  ┌──────────┐
   │ Success│  │  Error   │
   └────┬───┘  └────┬─────┘
        │           │
        ▼           ▼
  ┌───────────┐  ┌────────────────────┐
  │ Navigate  │  │ Red alert, values  │
  │ to ?next  │  │ retained           │
  │ else /map │  └────────────────────┘
  └───────────┘
```

### The `?next=` contract

The login screen reads `searchParams.get("next")` and defaults to `/map`. Every gated
entry point supplies a destination, so signing in always resumes the intended task rather
than dumping the user on a generic home screen.

| Entry point | Destination |
|---|---|
| Header "Sign In" | `/map` |
| Landing CTA while signed out | `/login?next=/report` |
| Deep link to a gated surface | `/login?next=<that surface>` |

Password fields use Django session authentication. Cookies are set by the server; the
frontend holds no token.

---

## Flow — Register

```
  ┌──────────────────────┐
  │ /register            │
  └──────────┬───────────┘
             ▼
  ┌──────────────────────┐
  │ Username             │
  │ Email                │
  │ Password             │
  │ Confirm password     │
  └──────────┬───────────┘
             │ client validation:
             │   required · email format · password match
             ▼
  ┌──────────────────────┐
  │ POST /auth/register/ │
  │ → role = "citizen"   │  ← always, server-enforced
  └──────────┬───────────┘
             │
        ┌────┴─────┐
        ▼          ▼
   ┌────────┐  ┌──────────┐
   │ Success│  │  Error   │
   └────┬───┘  └────┬─────┘
        │           │
        ▼           ▼
  ┌───────────┐  ┌────────────────────┐
  │ Session   │  │ Server `detail`,   │
  │ created,  │  │ or field errors    │
  │ user set  │  │                    │
  └─────┬─────┘  └────────────────────┘
        │
        ▼
  ┌──────────────────────┐
  │ Header updates:      │
  │ nav → dashboard,    │
  │ Sign In → avatar +  │
  │ role chip           │
  └──────────────────────┘
```

**`role = "citizen"` is always assigned by the server.** Public registration can never
grant moderator or admin. Elevation is only possible through
`PATCH /api/v1/admin/users/{id}/role/`. The register screen states this, so a user
understands that creating an account never confers elevated access.

**Rate limit:** 5 registrations per hour.

---

## Flow — Password reset

```
  ┌──────────────────────┐
  │ /forgot-password     │
  │ email or username    │
  └──────────┬───────────┘
             ▼
  ┌──────────────────────────────────────┐
  │ Submit                               │
  │ ALWAYS the same response, whether    │
  │ or not the account exists            │
  └──────────┬───────────────────────────┘
             │
             ▼
  ┌──────────────────────────────────────┐
  │ "If an account matches those         │
  │  details, a reset link has been      │
  │  sent."                              │
  └──────────────────────────────────────┘
```

The response is deliberately **identical in both cases**. Confirming or denying which
addresses are registered would let anyone enumerate valid accounts, so the UI never
reveals account existence.

Reset link → `/reset-password`

```
  ┌──────────────────────┐
  │ /reset-password      │
  │ new password         │
  │ confirm new password │
  └──────────┬───────────┘
             ▼
  ┌──────────────────────┐
  │ Success → /login     │
  └──────────────────────┘
```

---

## Session state

`AuthProvider` resolves the session once on mount via `GET /auth/me/`.

| Outcome | State |
|---|---|
| Authenticated | `user` populated, `loading` false |
| Unauthenticated | `user` null, `loading` false |

A failed `/auth/me/` is treated as an expected guest state, not an error — anonymous
browsing is the default, so it must not surface an error banner.

### Sign out

```
  User dropdown → Sign Out
        │
        ▼
  POST /auth/logout/   (flush session, clear cookies)
        │
        ▼
  user = null  ──▶  navigate("/")
```

A network failure during logout is swallowed and local state is cleared regardless — a
user who asks to sign out must always end up signed out on the device.

---

## Role-gated navigation

The header renders different navigation depending on session state and role. See
[`../03-components/navigation.md`](../03-components/navigation.md).

| Visitor | Citizen | Moderator | Admin |
|---|---|---|---|
| How it works | Citizen Dashboard | Citizen Dashboard | Citizen Dashboard |
| Features | Explore Map | Moderator Queue | Moderator Queue |
| Safety & Trust | — | Explore Map | Admin Portal |
| Explore Map | — | — | Explore Map |
| — | — | — | — |
| Sign In | avatar + role chip | avatar + role chip | avatar + role chip |
| Report a Hazard | Report a Hazard | Report a Hazard | Report a Hazard |

A signed-out visitor is shown the persuasion sections; a signed-in user is shown their work
surfaces. The header adapts to intent rather than presenting a fixed menu.

### Route guards

`ModerationPage` and `AdminDashboardPage` read `useAuth()` and redirect unauthorised users
to `/`.

This is convenience only. Every privileged API endpoint enforces its own permission class,
so bypassing the frontend guard grants no access — a user editing the frontend bundle
still receives 403 from the server.

---

## Anti-abuse measures visible in the UI

| Measure | Value | Surface |
|---|---|---|
| Registration rate limit | 5 / hour | Server-enforced |
| Login rate limit | 10 / minute | Server-enforced |
| One confirmation per report | Per user | Error surfaced inline |
| One flag per report | Per user | Action locks after success |
| Mandatory moderation rationale | Always | Submit blocked until supplied |
| Audit logging | Every privileged action | Admin audit trail |
| Self-demotion safeguard | Prevented | UI and server both enforce |

---

## Related documentation

- [`../04-screen-specs/authentication.md`](../04-screen-specs/authentication.md) — screen layouts
- [`../03-components/forms.md`](../03-components/forms.md) — form control specs
- [`../08-accessibility/`](../08-accessibility/) — form accessibility requirements
