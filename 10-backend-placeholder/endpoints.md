# Endpoint Reference

All endpoints are prefixed with `/api/v1/`.

---

## Access level key

| Level | Meaning |
|---|---|
| 🟢 **Public** | No authentication required |
| 🔵 **Citizen** | Any authenticated user (citizen, moderator, or admin) |
| 🟣 **Moderator** | Moderator or admin |
| 🔴 **Admin** | Administrator or Django superuser only |

---

## `system` — 2 endpoints

### 🟢 GET `/api/v1/`

Discovery document. Returns absolute URIs built from the request.

```json
{
  "name": "RouteX API",
  "tagline": "Know the Road Ahead.",
  "team": "NextGen",
  "version": "v1",
  "documentation": {
    "swagger_ui": "http://127.0.0.1:8000/api/docs/",
    "redoc": "http://127.0.0.1:8000/api/redoc/",
    "openapi_schema": "http://127.0.0.1:8000/api/schema/"
  },
  "endpoints": {
    "hazards": ".../api/v1/hazards/",
    "auth": ".../api/v1/auth/",
    "moderation": ".../api/v1/moderation/",
    "admin": ".../api/v1/admin/",
    "health": ".../api/v1/health/"
  }
}
```

### 🟢 GET `/api/v1/health/`

```json
{
  "status": "healthy",
  "service": "routex-backend",
  "version": "1.0.0",
  "edition": "Community Edition"
}
```

---

## `hazards` — 4 endpoints

Router-generated from `HazardReportViewSet` at the empty path prefix.

**Permissions:** `IsAuthenticatedOrReadOnly` — anyone may read, only authenticated users
may write.
**Methods allowed:** `get`, `post`, `head`, `options` (no PUT/PATCH/DELETE — reports are
immutable after creation).

### 🟢 GET `/api/v1/hazards/`

List hazard reports. **Paginated** at 20 per page.

#### Query parameters

| Parameter | Type | Description |
|---|---|---|
| `category` | enum | `flooding` · `pothole` · `blocked_road` · `fallen_tree` · `other` |
| `status` | enum | `reported` · `under_review` · `community_confirmed` · `resolved` · `rejected` |
| `demo` | bool | Filter by seeded sample data |
| `bbox` | string | `west,south,east,north` |
| `min_lat` | decimal | Individual bound |
| `max_lat` | decimal | Individual bound |
| `min_lng` | decimal | Individual bound |
| `max_lng` | decimal | Individual bound |

Individual bounds apply only when **all four** are supplied. A malformed `bbox` is
swallowed silently (the `try/except` passes), so an invalid bbox returns the unfiltered
list rather than an error.

#### Response

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/v1/hazards/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "category": "flooding",
      "category_display": "Flooding / Standing Water",
      "location_label": "Lekki-Epe Expressway by Jakande Roundabout",
      "description": "Deep standing water across both lanes...",
      "latitude": "6.453100",
      "longitude": "3.395800",
      "status": "reported",
      "status_display": "Reported",
      "photo": "http://127.0.0.1:8000/media/hazards/2026/10/flood.webp",
      "photo_url": "http://127.0.0.1:8000/media/hazards/2026/10/flood.webp",
      "confirmations_count": 0,
      "flags_count": 0,
      "is_demo": false,
      "created_at": "2026-10-18T09:12:33.482913Z",
      "updated_at": "2026-10-18T09:12:33.482913Z",
      "freshness": {
        "label": "Reported 3 hours ago",
        "is_stale": false,
        "hours_ago": 3
      }
    }
  ]
}
```

`photo` and `photo_url` are both present and identical — `photo` is the raw storage path,
`photo_url` is the absolute URI built from the request context.

**Read-only fields:** `id`, `status`, `status_display`, `category_display`,
`confirmations_count`, `flags_count`, `is_demo`, `created_at`, `updated_at`, `photo_url`,
`freshness`. A client cannot set status or counters directly — only through the confirm,
flag, and moderation endpoints.

### 🔵 POST `/api/v1/hazards/`

Submit a hazard report. Requires authentication.

**Content-Type:** `multipart/form-data` (for photo) or JSON.

| Field | Type | Required | Constraints |
|---|---|---|---|
| `category` | enum | ✅ | One of the five categories |
| `description` | string | ✅ | 5–1000 chars after stripping |
| `latitude` | decimal | ✅ | −90.0 to 90.0 |
| `longitude` | decimal | ✅ | −180.0 to 180.0 |
| `location_label` | string | ❌ | ≤ 150 chars, stripped |
| `photo` | file | ❌ | JPEG/PNG/WebP, ≤ `MAX_UPLOAD_SIZE_MB` |

`reporter` is set from `request.user` server-side — a client cannot submit on behalf of
another user.

**Responses:** `201` with the created report · `400` validation · `401`/`403` not
authenticated

**Automatic behaviour:** the photo is converted to WebP during `save()`, and `status` is
set to `reported` with `is_demo=False`.

### 🟢 GET `/api/v1/hazards/{id}/`

Retrieve one report. Public. Returns a single object (not wrapped).

**Responses:** `200` · `404` not found

### 🔵 POST `/api/v1/hazards/{id}/confirm/`

Confirm that a hazard is still present. Requires authentication.

**Request:** no body (`request=None` in the schema).

**Response:**

```json
{
  "message": "Hazard presence confirmed.",
  "confirmations_count": 3,
  "status": "community_confirmed"
}
```

**Rules:**
- Duplicate confirmation by the same user → `400` "You have already confirmed this hazard report."
- Creates a `Confirmation` row
- Recomputes `confirmations_count` from `report.confirmations.count()`
- If the count reaches the threshold **and** status is still `reported`, promotes to
  `community_confirmed`

> ⚠️ The threshold is hardcoded to `3` in the view and does **not** read
> `PlatformSettings.confirmation_threshold`. See
> [`platform-settings.md`](platform-settings.md).

### 🔵 POST `/api/v1/hazards/{id}/flags/`

Flag a report for moderator review. Requires authentication.

| Field | Type | Required | Notes |
|---|---|---|---|
| `reason` | enum | ❌ | `cleared` · `inaccurate` · `duplicate` · `spam` · `other` — defaults to `other` |
| `notes` | string | ❌ | ≤ 500 chars |

**Response:** `201` with the created flag

```json
{
  "id": 1,
  "report": 42,
  "reason": "cleared",
  "notes": "",
  "created_at": "2026-10-18T10:04:11Z"
}
```

**Rules:**
- An existing pending flag by the same user → `400` "You have already submitted a pending flag for this report."
- Increments `flags_count` from `report.flags.count()`
- Does **not** change report status — escalation is to a human moderator

---

## `auth` — 11 endpoints

### 🟢 GET `/auth/csrf/`

Sets a CSRF cookie and returns the token. Must be called before any state-changing
request.

```json
{ "csrfToken": "abc123..." }
```

Decorated with `@ensure_csrf_cookie`.

### 🟢 POST `/auth/register/`

Create a citizen account. **Throttled to 5/hour per IP.**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `username` | string | ✅ | 3–150 chars, unique case-insensitively |
| `email` | string | ✅ | ≤ 254, unique case-insensitively, lowercased |
| `password` | string | ✅ | Min 8, Django validators, write-only |
| `password_confirm` | string | ❌ | Must match if provided |
| `display_name` | string | ❌ | ≤ 80 |

**Response:** `201` with `UserPublicSerializer` — **and the session is started
automatically** (`login(request, user)`), so no separate login call is needed.

The created profile is **always** `role="citizen"`.

**Validation errors:**
- "This username is already taken."
- "An account with this email already exists."
- `password_confirm`: "Passwords do not match."
- Django password validator messages

### 🟢 POST `/auth/login/`

Authenticate. **Throttled to 10/min per IP.**

| Field | Type | Required |
|---|---|---|
| `username` | string | ✅ — accepts a username **or** an email address |
| `password` | string | ✅ |

**Response:** `200` with `UserPublicSerializer` and a session cookie set.

Login attempts the literal username first, then — if it contains `@` — looks up a
case-insensitive email match and retries with the resolved username. `MultipleObjectsReturned`
is caught, so duplicate emails fail rather than 500.

**Errors:** `400` missing fields · `401` "Invalid credentials. Please check your
username/email and password."

### 🔵 POST `/auth/logout/`

Ends the session, flushes it, and clears cookies.

```json
{ "detail": "Successfully logged out." }
```

### 🔵 GET `/auth/me/`

Returns the authenticated user. The frontend calls this once on mount to resolve the
session; a failure is treated as an expected guest state.

```json
{
  "id": 1,
  "username": "citizen",
  "email": "citizen@example.com",
  "display_name": "Citizen",
  "role": "citizen",
  "date_joined": "2026-10-01T08:00:00Z",
  "is_staff": false,
  "is_superuser": false
}
```

### 🔵 GET `/auth/me/reports/`

All hazard reports submitted by the current user, newest first. **Not paginated** — returns
a bare array.

### 🔵 GET `/auth/dashboard-summary/`

Citizen dashboard metrics plus the five most recent reports.

```json
{
  "metrics": {
    "total_reports": 12,
    "active_reports": 4,
    "confirmed_reports": 5,
    "resolved_reports": 3,
    "confirmations_received": 17
  },
  "recent_reports": [ /* up to 5 HazardReportSerializer objects */ ]
}
```

`confirmations_received` is `SUM(confirmations_count)` across the user's reports.

### 🔵 PATCH `/auth/profile/`

Update the current user's profile.

| Field | Type | Constraints |
|---|---|---|
| `display_name` | string | ≤ 80, optional |
| `email` | string | ≤ 254, must not belong to another account |

**Response:** `200` with the updated `UserPublicSerializer`

The profile is created via `get_or_create` if absent, so this endpoint also self-heals a
user who somehow lacks a profile.

### 🟢 POST `/auth/password-reset/`

Request a reset link. **Throttled to 10/min per IP**, plus a **2-minute cooldown per email
address** cached by email.

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |

**Response — always `200`, regardless of whether the account exists:**

```json
{
  "detail": "If an account with that email address exists, a password reset link has been sent to your inbox.",
  "retry_after": 120
}
```

This uniform response prevents account enumeration. The frontend design mirrors this.

**Cooldown response:** `429` with `{"detail": "Please wait N seconds before requesting another reset email.", "retry_after": N}`

The reset URL is `{FRONTEND_URL}/reset-password?uid={uidb64}&token={token}`, pointing at
the **frontend**, not the backend.

### 🟢 POST|GET `/auth/password-reset/validate/`

Verify a reset token without consuming it. Accepts both methods for convenience.

**Response — valid:**

```json
{ "valid": true, "username": "citizen" }
```

**Response — invalid:** `400` with
`{"valid": false, "detail": "This password reset link is invalid or has expired. Please request a new one."}`

### 🟢 POST `/auth/password-reset/confirm/`

Apply a new password.

| Field | Type | Required | Constraints |
|---|---|---|---|
| `uid` | string | ✅ | Base64-encoded user id |
| `token` | string | ✅ | Signed reset token |
| `new_password` | string | ✅ | Min 8, Django validators, write-only |
| `new_password_confirm` | string | ✅ | Must match, min 8 |

**Response:** `200` `{"detail": "Your password has been successfully reset. You can now sign in with your new password."}`

**Errors:** `400` invalid token, or `{"new_password_confirm": "Passwords do not match."}`

Token validity is governed by `PASSWORD_RESET_TIMEOUT` (default 86400s = 24 hours).

---

## `moderation` — 5 endpoints + 3 aliases

**Permissions:** `IsModeratorOrAdmin`

### 🟣 GET `/moderation/stats/`

```json
{
  "pending_flags": 6,
  "under_review": 2,
  "active_reported": 18,
  "confirmed": 11,
  "resolved": 24,
  "total_actions": 37
}
```

### 🟣 GET `/moderation/reports/`

Reports for review, ordered by `["-flags_count", "-created_at"]` — **most-flagged first**,
which is how "highest priority first" is implemented.

| Parameter | Type | Description |
|---|---|---|
| `status` | enum | Filter by status |
| `flagged_only` | bool | Only reports with `flags_count > 0` |

**Not paginated** — returns a bare array.

### 🟣 POST `/moderation/reports/{id}/action/`

Apply a moderation action. **Rationale is mandatory.**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `action` | enum | ✅ | `review` · `confirm` · `resolve` · `reject` |
| `reason` | string | ✅ | **3–500 characters** |

**Response:**

```json
{
  "message": "Report marked as Resolved.",
  "report": { /* full HazardReportSerializer */ },
  "action": {
    "id": 7,
    "report": 42,
    "moderator": 2,
    "moderator_name": "Moderator",
    "action": "resolve",
    "reason": "Municipal crews cleared the drainage on 17 Oct; verified by photo.",
    "created_at": "2026-10-18T11:20:00Z"
  }
}
```

Returns both the updated report and the new audit record, so the client needs one round
trip to update the UI and its decision history.

**Errors:** `400` invalid action or short reason · `404` report not found

### 🟣 GET `/moderation/reports/{id}/actions/`

All moderation actions on one report, newest first.

### 🟣 GET `/moderation/history/`

Platform-wide decision log, newest first, **limited to the 50 most recent**.

### Alias routes

| Alias | Maps to |
|---|---|
| `GET /moderation/hazards/` | `moderation_reports_list` |
| `POST /moderation/hazards/{id}/action/` | `moderation_report_action` |
| `GET /moderation/hazards/{id}/actions/` | `moderation_report_history` |

Provided because the underlying objects are hazards; the frontend uses the `reports/` form.

---

## `admin` — 6 endpoints

**Permissions:** `IsPlatformAdmin` — strict. Moderators receive `403`.

### 🔴 GET `/admin/stats/`

Platform-wide metrics across users, hazards, moderation, settings, and system health.

```json
{
  "users":  { "total": 148, "citizens": 141, "moderators": 5, "admins": 2 },
  "hazards": { "total": 312, "active": 88, "confirmed": 96, "under_review": 7,
               "resolved": 118, "flagged": 9, "demo": 24 },
  "moderation": { "total_actions": 37, "pending_flags": 9 },
  "settings": { "confirmation_threshold": 3, "freshness_hours": 24,
                "max_upload_size_mb": 5, "allow_anonymous_map_view": true },
  "system":  { "status": "healthy", "server_time": "2026-10-18T12:00:00+00:00",
               "framework": "Django 5.1 / DRF" }
}
```

`citizens` is derived as `total - admins - moderators` and floored at 0, so the three
buckets always sum to the total.

### 🔴 GET `/admin/users/`

All users, newest-joined first, with `reports_count` and `confirmations_count`.

| Parameter | Description |
|---|---|
| `q` | Case-insensitive substring match on username or email |
| `role` | `citizen` · `moderator` · `admin` |

**Not paginated.**

Role filtering applies the same conditions as role resolution — superusers always count as
`admin`, and staff without an admin profile role counts as `moderator`.

### 🔴 PATCH `/admin/users/{id}/role/`

Promote or demote a user.

| Field | Type | Required | Constraints |
|---|---|---|---|
| `role` | enum | ✅ | `citizen` · `moderator` · `admin` |
| `reason` | string | ❌ | ≤ 300 chars, appended to the audit detail |

**Self-demotion safeguard:**

```python
if target_user.pk == request.user.pk and new_role != "admin":
    return 400 "You cannot remove administrative privileges from your own active session."
```

**Staff sync:** assigning `moderator` or `admin` sets `is_staff = True`; assigning
`citizen` sets `is_staff = False`.

**Response:** `200` with the updated `AdminUserSerializer`

**Audit:** a `ROLE_CHANGE` entry is written with the old role, new role, and the supplied
reason.

> ⚠️ `reason` is **optional** at the API level (`required=False, allow_blank=True`), while
> the frontend design makes it mandatory. The backend does not enforce the accountability
> rule the UI presents.

### 🔴 DELETE `/admin/users/{id}/`

Permanently delete a user account.

**Two safeguards:**

| Guard | Message |
|---|---|
| Cannot delete yourself | "You cannot delete your own active administrative account." |
| Cannot delete the last superuser | "Cannot delete the sole remaining superuser account." |

**Audit ordering:** the `USER_DELETION` log entry is written **before** `delete()` is
called, so the record survives its own subject.

**Data preservation:** hazard reports and confirmations use `on_delete=SET_NULL`, so
deleting a user removes the account but **preserves all road hazard data**. The inline
comment states this intent explicitly.

**Response:** `200` `{"detail": "User account @username has been permanently deleted."}`

### 🔴 GET|PATCH `/admin/settings/`

Read or update operational settings. `PATCH` is **partial** — only supplied keys change.

Valid ranges are enforced in the serializer:

| Field | Range | Error message |
|---|---|---|
| `confirmation_threshold` | 1–20 | "Confirmation threshold must be between 1 and 20." |
| `freshness_hours` | 1–168 | "Freshness threshold must be between 1 and 168 hours (7 days)." |
| `max_upload_size_mb` | 1–25 | "Max upload size must be between 1 and 25 MB." |

Read-only: `updated_at`, `updated_by_username`

```json
{
  "confirmation_threshold": 3,
  "freshness_hours": 24,
  "max_upload_size_mb": 5,
  "allow_anonymous_map_view": true,
  "emergency_notice_enabled": true,
  "updated_at": "2026-10-18T12:00:00Z",
  "updated_by_username": "admin"
}
```

**Audit:** a `SETTINGS_UPDATE` entry listing the changed **keys** (not values) is written
on every patch.

### 🔴 GET `/admin/audit-logs/`

The 100 most recent administrative audit entries, newest first. **Not paginated.**

```json
[
  {
    "id": 12,
    "actor_username": "admin",
    "action_type": "ROLE_CHANGE",
    "target_id": "7",
    "details": "Changed role of user 'chidi_okonkwo' (ID #7) from 'citizen' to 'moderator'. Reason: Volunteer moderator, verified references.",
    "created_at": "2026-10-18T11:45:00Z"
  }
]
```

A null actor renders as `"System"`.

---

## Endpoint count

| Tag | Endpoints | Access |
|---|---|---|
| `system` | 2 | 🟢 |
| `hazards` | 4 | 🟢 read · 🔵 write |
| `auth` | 11 | Mixed |
| `moderation` | 5 + 3 aliases | 🟣 |
| `admin` | 6 | 🔴 |
| **Total** | **28 + 3 aliases** | |

Plus 5 documentation routes (`/api/schema/`, `/api/docs/`, `/api/redoc/`, and the two
versioned aliases).
