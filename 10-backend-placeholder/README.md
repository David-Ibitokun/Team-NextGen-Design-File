# Backend Design — README

RouteX's backend is a **Django 5.1 + Django REST Framework** JSON API enforcing the
platform's four-tier permission model.

| | |
|---|---|
| **Framework** | Django 5.1 · DRF 3.15 · drf-spectacular 0.28 |
| **Language** | Python 3.13+ |
| **Auth** | Django session cookies with CSRF protection |
| **Database** | SQLite (development) · PostgreSQL (production) |
| **Media** | Local filesystem, WebP conversion via Pillow |
| **Documentation** | OpenAPI 3.0 — Swagger UI, ReDoc, raw schema |
| **API base** | `http://127.0.0.1:8000/api/v1/` |

---

## Contents

| Document | Covers |
|---|---|
| [`api-overview.md`](api-overview.md) | Architecture, URL map, versioning, pagination, CORS, configuration, deployment targets |
| [`data-model.md`](data-model.md) | All seven models, fields, constraints, indexes, relationships, ER diagram |
| [`endpoints.md`](endpoints.md) | Every endpoint: method, path, permission, request, response, status codes |
| [`authentication.md`](authentication.md) | Session + CSRF flow, the four access tiers, rate limits, password reset |
| [`permissions.md`](permissions.md) | Permission classes, the full role × action matrix, role resolution |
| [`status-lifecycle.md`](status-lifecycle.md) | The five hazard statuses, allowed transitions, auto-confirmation rules |
| [`moderation-model.md`](moderation-model.md) | Flags, moderation actions, mandatory rationale, audit logging |
| [`platform-settings.md`](platform-settings.md) | Operational settings, ranges, defaults, the singleton pattern |
| [`error-handling.md`](error-handling.md) | Response formats, status codes, validation messages, upload validation |
| [`media-and-uploads.md`](media-and-uploads.md) | Photo validation, WebP pipeline, client+server compression |
| [`email-templates.md`](email-templates.md) | Password reset email design, branding, deliverability notes |

---

## Application structure

```
backend/
├── manage.py
├── requirements.txt
├── db.sqlite3
├── config/
│   ├── settings.py              All configuration
│   ├── urls.py                  Root URL conf + API root + health check
│   ├── asgi.py / wsgi.py
├── apps/
│   ├── common/                  Shared utilities (email backend)
│   ├── accounts/                Users, profiles, roles, auth, password reset
│   │   ├── models.py            UserProfile, PlatformSettings, SystemAuditLog
│   │   ├── serializers.py
│   │   ├── permissions.py       IsCitizen, IsModeratorUser, IsPlatformAdmin
│   │   ├── views.py             Auth endpoints
│   │   ├── views_admin.py       Admin endpoints
│   │   ├── urls.py              /api/v1/auth/
│   │   └── urls_admin.py        /api/v1/admin/
│   ├── hazards/                 Hazard reports, confirmations, flags
│   │   ├── models.py            HazardReport, Confirmation, HazardFlag
│   │   ├── serializers.py
│   │   ├── views.py             ViewSet + confirm/flag actions
│   │   ├── validators.py        Latitude, longitude, photo
│   │   ├── image_utils.py       WebP conversion
│   │   ├── admin.py
│   │   └── urls.py              /api/v1/hazards/
│   └── moderation/              Moderation actions and history
│       ├── models.py            ModerationAction
│       ├── serializers.py
│       ├── views.py
│       └── urls.py              /api/v1/moderation/
├── templates/emails/            password_reset.html / .txt
└── media/hazards/YYYY/MM/       Uploaded photos
```

---

## Design decisions

| Decision | Rationale |
|---|---|
| **Session cookies, not JWT** | Sessions allow immediate server-side revocation — an admin can invalidate a compromised session. A stolen JWT cannot be withdrawn. |
| **Server-side permissions are the boundary** | The frontend role guard is convenience only. Every endpoint enforces its own permission class, so bypassing the UI grants nothing. |
| **Registration always yields `citizen`** | Privilege escalation must go through the audit-logged admin endpoint, never through a public path. |
| **Mandatory moderation rationale** | Turns every editorial decision into an auditable record. This is what separates a civic tool from a censorship mechanism. |
| **`on_delete=SET_NULL` on hazard ownership** | Deleting a user must never delete road hazard data — the dataset has public safety value independent of the reporter. |
| **Confirmed by distinct users only** | A `UniqueConstraint` prevents one person inflating a report's confirmation count. |
| **Stale is marked, never deleted** | Age uncertainty is expressed as amber state, not as data removal. |
| **WebP conversion on both client and server** | Contributors on mobile data get small uploads; the server guarantees the invariant regardless of client. |
| **`DecimalField` for coordinates** | Avoids float rounding on geospatial comparisons and bounding-box filters. |
| **Audit log for every privileged action** | Accountability is structural, not optional. |

---

## Endpoint summary

| Tag | Endpoints | Access |
|---|---|---|
| `system` | 2 | Public |
| `auth` | 11 | Mixed |
| `hazards` | 4 | Read public, write authenticated |
| `moderation` | 5 (+3 aliases) | Moderator / Admin |
| `admin` | 6 | Admin only |

**31 endpoint routes** in total, plus 3 moderation aliases and 2 documentation aliases.

See [`endpoints.md`](endpoints.md) for the full reference.

---

## Documentation scope

This documentation is derived from the implemented Django source and reflects the API
**as built**. Inconsistencies found during review are documented rather than hidden — see
[`api-overview.md`](api-overview.md#known-inconsistencies).

**Tests** (`apps/*/tests.py`, 28 passing) were not provided and are therefore not
documented here.
