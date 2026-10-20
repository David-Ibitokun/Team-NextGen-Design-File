# Platform Settings

Operational parameters an administrator can tune without a code change. These are the
platform's most consequential dials — they change how aggressively RouteX escalates a
hazard and how quickly it declares information out of date.

---

## The model

`PlatformSettings` lives in the `accounts` app.

| Field | Type | Default | Range | Purpose |
|---|---|---|---|---|
| `confirmation_threshold` | `PositiveIntegerField` | **3** | 1–20 | Peer confirmations needed to auto-confirm |
| `freshness_hours` | `PositiveIntegerField` | **24** | 1–168 | Age after which a report is stale |
| `max_upload_size_mb` | `PositiveIntegerField` | **5** | 1–25 | Maximum photo size |
| `allow_anonymous_map_view` | `BooleanField` | **True** | — | Permit unauthenticated map reads |
| `emergency_notice_enabled` | `BooleanField` | **True** | — | Show emergency advisories in reporting flows |
| `updated_at` | `DateTimeField` | `auto_now` | — | Last change |
| `updated_by` | `ForeignKey(User)` | `SET_NULL`, null | — | Who made the change |

---

## Singleton pattern

```python
@classmethod
def get_settings(cls):
    obj, _ = cls.objects.get_or_create(id=1)
    return obj
```

`id=1` is hardcoded, guaranteeing a single row. The row is created lazily on first access,
so no migration or seed step is required.

> **Gap:** there is **no database-level constraint** enforcing single-row-ness. Code calling
> `PlatformSettings.objects.create()` outside the helper would break the invariant. A
> `CheckConstraint(id=1)` would close this.

---

## Range validation

Enforced in `PlatformSettingsSerializer`:

```python
def validate_confirmation_threshold(self, value):
    if value < 1 or value > 20:
        raise serializers.ValidationError(
            "Confirmation threshold must be between 1 and 20.")

def validate_freshness_hours(self, value):
    if value < 1 or value > 168:
        raise serializers.ValidationError(
            "Freshness threshold must be between 1 and 168 hours (7 days).")

def validate_max_upload_size_mb(self, value):
    if value < 1 or value > 25:
        raise serializers.ValidationError(
            "Max upload size must be between 1 and 25 MB.")
```

### Why the ranges are bounded

The bounds are not arbitrary — they prevent configurations that would make the platform
misleading or useless.

| Setting | Minimum risk | Maximum risk | Default rationale |
|---|---|---|---|
| `confirmation_threshold` | **1** — every report auto-confirms instantly, destroying the signal | **20** — requires a crowd that rarely assembles | **3** balances credibility against reach |
| `freshness_hours` | **1** — almost everything goes stale, constant warnings | **168** (7 days) — genuinely dangerous stale reports persist | **24** matches daily road-condition rhythms |
| `max_upload_size_mb` | **1** — photos too small to be useful | **25** — strains mobile data | **5** fits a high-resolution phone photo post-compression |

---

## API

### Read

```
GET /api/v1/admin/settings/     🔴 Admin only
```

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

`updated_at` and `updated_by_username` are read-only.

### Update

```
PATCH /api/v1/admin/settings/   🔴 Admin only
```

Partial update — only supplied keys change.

```json
{ "confirmation_threshold": 5 }
```

Sets `updated_by` to the requesting user and writes a `SETTINGS_UPDATE` audit entry.

**Errors:** `400` with a field-keyed validation message when a value is out of range.

---

## ⚠️ Enforcement status

This is the most important section in this document. **Three of the five settings are
admin-editable but not actually wired to behaviour.**

| Setting | Enforced? | Evidence |
|---|:---:|---|
| `confirmation_threshold` | ❌ | `views.py` hardcodes `CONFIRMATION_THRESHOLD = 3` |
| `freshness_hours` | ❌ | `models.py` hardcodes 1 day / 2 days in `freshness_info` |
| `max_upload_size_mb` | ⚠️ Partial | The validator reads `settings.MAX_UPLOAD_SIZE_MB` — the **env var**, not this model field |
| `allow_anonymous_map_view` | ❌ | No view reads it; the hazard list is unconditionally public |
| `emergency_notice_enabled` | ❌ | No view reads it; advisories are frontend-only |

### Consequence

An administrator who raises `confirmation_threshold` to 10 in the admin UI sees the new
value returned by the API and in `GET /admin/stats/` — **but reports will still auto-confirm
at 3**. The UI implies a control that does not exist.

### Fixes

```python
# confirm() in hazards/views.py
from apps.accounts.models import PlatformSettings

CONFIRMATION_THRESHOLD = PlatformSettings.get_settings().confirmation_threshold
```

```python
# freshness_info in hazards/models.py
from apps.accounts.models import PlatformSettings

stale_hours = PlatformSettings.get_settings().freshness_hours
is_stale = total_seconds >= stale_hours * 3600
```

```python
# validate_hazard_photo in hazards/validators.py
from apps.accounts.models import PlatformSettings

max_mb = PlatformSettings.get_settings().max_upload_size_mb
```

```python
# HazardReportViewSet.get_queryset in hazards/views.py
from apps.accounts.models import PlatformSettings

if not PlatformSettings.get_settings().allow_anonymous_map_view:
    if not self.request.user.is_authenticated:
        queryset = queryset.none()
```

The other two settings either need frontend wiring (the advisories are static landing-page
content) or removal if they are not genuinely configurable.

---

## Related configuration

`PlatformSettings` is not the only source of operational configuration. Some values live in
environment variables instead.

| Value | Source | Overridable at runtime? |
|---|---|:---:|
| Photo size limit | `MAX_UPLOAD_SIZE_MB` env var | ❌ Restart required |
| Photo size limit | `PlatformSettings.max_upload_size_mb` | ✅ Admin UI |
| Media URL prefix | `MEDIA_URL` env var | ❌ |
| Database | `USE_POSTGRES`, `DB_*` env vars | ❌ |
| Email backend | `EMAIL_*` env vars | ❌ |
| Reset token lifetime | `PASSWORD_RESET_TIMEOUT` env var | ❌ |
| Frontend base URL | `FRONTEND_URL` env var | ❌ |

Having the photo limit defined in **both** places is the confusing part — an administrator
setting 10 MB in the UI would still hit a 5 MB ceiling from the env var. These should be
consolidated to one source of truth.

---

## Audit trail

Every patch writes an entry:

```python
SystemAuditLog.objects.create(
    actor=request.user,
    action_type="SETTINGS_UPDATE",
    target_id="1",
    details=f"Updated platform operational settings: {changed_keys}."
)
```

`target_id` is always `"1"` — the singleton's primary key.

> **Gap:** only the changed **keys** are recorded, not their previous and new values. A
> reader cannot tell what `confirmation_threshold` was before it became 5. Storing
> before/after pairs would make the trail genuinely auditable.

`updated_at` and `updated_by_username` on the settings object provide a coarse "who last
touched this" signal, but not per-change attribution.

---

## Frontend presentation

The admin dashboard's Platform Settings tab renders numeric inputs with the documented
ranges:

| Field | Range | Control |
|---|---|---|
| `confirmation_threshold` | 1–20 | Number input + `Save` |
| `freshness_hours` | 1–168 | Number input + `Save` |
| `max_upload_size_mb` | 1–25 | Number input + `Save` |

Each save confirms inline rather than via a toast. The tab also documents the effect of
each setting, so an administrator understands the consequence before changing it.

`GET /admin/stats/` echoes the current values into the `settings` block, so the admin
dashboard metric area can display the active configuration.

---

## Default configuration

```json
{
  "confirmation_threshold": 3,
  "freshness_hours": 24,
  "max_upload_size_mb": 5,
  "allow_anonymous_map_view": true,
  "emergency_notice_enabled": true
}
```

These defaults define RouteX's escalation behaviour: three peers corroborate a hazard,
reports go stale after a day, and photos stay under 5 MB. The seeded demo accounts in the
README rely on the threshold of 3.

---

## Deployment notes

| Concern | Recommendation |
|---|---|
| Migration seed | Not needed — `get_settings()` creates the row lazily |
| Audit retention | `SystemAuditLog` grows on every settings patch; consider archival |
| Concurrency | Singleton row means concurrent patches race; `select_for_update` would serialise |
| Cache | Settings are read per request, not cached — consider caching if `get_settings()` becomes hot |
| Audit completeness | Store before/after value pairs in the audit detail |
