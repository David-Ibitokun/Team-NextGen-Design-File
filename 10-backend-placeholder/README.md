# Backend Design — Placeholder

This folder is reserved for **backend and API design documentation**.

It is intentionally empty. The frontend design system is fully documented; the backend
documentation will be added once the Django source is available for review.

---

## Planned contents

| File | Covers |
|---|---|
| `api-overview.md` | REST architecture, base URLs, versioning, content negotiation |
| `endpoints.md` | Every endpoint: method, path, purpose, access level, request and response shape |
| `authentication.md` | Session and CSRF handling, the four account tiers, permission classes |
| `data-model.md` | Entities, fields, types, constraints, and relationships |
| `status-lifecycle.md` | Hazard status transitions and the rules governing them |
| `permissions.md` | The permission matrix per role per action |
| `moderation-model.md` | Flags, moderation actions, rationale, and audit logging |
| `platform-settings.md` | Operational settings, ranges, defaults, and who may change them |
| `error-handling.md` | Error response format, status codes, and rate limiting |
| `openapi.md` | Swagger UI, ReDoc, and the raw schema endpoint |

---

## Context already established by the frontend

The following facts are established from frontend code and are documented in
[`../04-screen-specs/support-screens.md`](../04-screen-specs/support-screens.md) and
[`../05-user-flows/`](../05-user-flows/). They constrain the backend design.

### Base URLs

| Purpose | URL |
|---|---|
| API root | `http://127.0.0.1:8000/api/v1/` |
| Swagger UI | `http://127.0.0.1:8000/api/docs/` (also `/api/v1/docs/`) |
| ReDoc | `http://127.0.0.1:8000/api/redoc/` |
| Raw OpenAPI schema | `http://127.0.0.1:8000/api/schema/` |
| Health check | `http://127.0.0.1:8000/api/v1/health/` |
| Media (uploads) | Proxied through `/media` in dev |

The Vite dev server proxies `/api` and `/media` to `http://127.0.0.1:8000`, so the
frontend uses same-origin relative paths in development.

### Endpoints referenced by the frontend

| Method | Path | Frontend consumer |
|---|---|---|
| `POST` | `/api/v1/auth/register/` | `RegisterPage` |
| `POST` | `/api/v1/auth/login/` | `LoginPage` |
| `POST` | `/api/v1/auth/logout/` | `AuthContext.logout` |
| `GET` | `/api/v1/auth/me/` | `AuthContext` session bootstrap |
| `PATCH` | `/api/v1/auth/profile/` | Dashboard settings tab |
| `GET` | `/api/v1/auth/dashboard-summary/` | Dashboard metric tiles |
| `GET` | `/api/v1/hazards/` | Map, landing, dashboard lists |
| `POST` | `/api/v1/hazards/` | `ReportHazardForm` (multipart) |
| `POST` | `/api/v1/hazards/{id}/confirm/` | `HazardDetailsPanel` |
| `POST` | `/api/v1/hazards/{id}/flags/` | `HazardDetailsPanel` |
| `GET` | `/api/v1/moderation/stats/` | Moderator tiles |
| `GET` | `/api/v1/moderation/reports/` | Moderation queue |
| `POST` | `/api/v1/moderation/reports/{id}/action/` | Moderation action modal |
| `GET` | `/api/v1/moderation/history/` | Decision history |
| `GET` | `/api/v1/admin/stats/` | Admin metric tiles |
| `GET` | `/api/v1/admin/users/` | Admin users tab |
| `PATCH` | `/api/v1/admin/users/{id}/role/` | Admin role modal |
| `GET`/`PATCH` | `/api/v1/admin/settings/` | Admin settings tab |
| `GET` | `/api/v1/admin/audit-logs/` | Admin audit trail |

### Field names consumed by the frontend

`Hazard` fields referenced in components:

| Field | Type | Notes |
|---|---|---|
| `id` | integer | |
| `category` | enum | `flooding` · `pothole` · `blocked_road` · `fallen_tree` · `other` |
| `status` | enum | `reported` · `under_review` · `community_confirmed` · `resolved` · `rejected` |
| `status_display` | string | Human-readable label for badges |
| `location_label` | string, nullable | Falls back to coordinates in the UI |
| `description` | string, max 1000 | |
| `latitude` / `longitude` | decimal | 6dp |
| `photo_url` | string, nullable | |
| `created_at` | datetime | |
| `confirmations_count` | integer | |
| `flags_count` | integer | |
| `freshness` | object | `{ label, is_stale }` |
| `freshness_info` | object | Alternate shape used in the landing live pulse |
| `is_demo` | boolean | Triggers demo badges and banner |

**Note:** `freshness` and `freshness_info` appear to be two shapes of the same concept.
`FreshnessBadge` accepts `freshness` and `createdAt`, while the landing live pulse passes
`freshness_info`. This is an inconsistency to resolve — a single canonical field would be
cleaner.

**Note:** responses are handled defensively as either `{ results: [...] }` (paginated) or a
bare array, so the API should return a consistent shape — ideally always paginated.

### Platform settings

| Field | Range | Default | Consumed by |
|---|---|---|---|
| `confirmation_threshold` | 1–20 | 3 | Auto-confirmation logic |
| `freshness_hours` | 1–168 | 24 | Stale marking |
| `max_upload_size_mb` | 1–25 | 5 | Photo upload validation |

### Rate limits observed

| Action | Limit |
|---|---|
| Registration | 5 / hour |
| Login | 10 / minute |

### Domain rules surfaced by the UI

| Rule | Where it appears in the design |
|---|---|
| Public registration always assigns `role="citizen"` | Register screen copy |
| Role elevation only via `PATCH /admin/users/{id}/role/` | Admin flow |
| One confirmation per user per hazard | Confirmation action locks after success |
| One flag per user per report | Flag action locks after success |
| Self-confirmation prevented | Confirmation flow |
| Moderation rationale mandatory | Moderation action modal |
| Self-demotion prevented | Admin role modal |
| Self-deletion prevented | Admin users tab |
| Every privileged action audit-logged | Admin audit trail |
| Photo optional on reports | Report form |

---

## Status

**Awaiting backend source.** Once the Django files are provided, this folder will be filled
with the API reference, data model, permission matrix, and status-lifecycle documentation
matching what the frontend already consumes.
