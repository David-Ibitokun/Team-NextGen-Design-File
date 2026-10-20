# Data Model

Seven models across three apps, extending Django's built-in `User`.

---

## Entity relationship overview

```
┌──────────────────────────────┐
│  auth.User  (Django built-in)│
│  ───────────────────────────│
│  id, username, email,        │
│  password, is_staff,         │
│  is_superuser, is_active,    │
│  date_joined, last_login     │
└───┬──────────────────────┬───┘
    │ 1:1 profile           │ 1:N hazard_reports
    │ SET_NULL on delete    │ SET_NULL on delete
    ▼                      ▼
┌────────────────────────┐  ┌────────────────────────────────┐
│  UserProfile           │  │  HazardReport                  │
│  ────────────────────  │  │  ────────────────────────────  │
│  user (OneToOne)       │  │  category      ENUM(5)         │
│  display_name  (80)    │  │  status        ENUM(5)         │
│  role  ENUM(3)         │  │  location_label (150, blank)   │
│  created_at            │  │  description   TEXT (1000)     │
│  updated_at            │  │  latitude      DECIMAL(9,6)    │
└────────────────────────┘  │  longitude     DECIMAL(9,6)    │
                            │  photo    ImageField nullable  │
                            │  reporter      FK User NULL    │
                            │  confirmations_count  INT      │
                            │  flags_count          INT      │
                            │  is_demo        BOOLEAN         │
                            │  created_at / updated_at        │
                            └───┬──────────┬─────────────┬───┘
                                │ 1:N      │ 1:N         │ 1:N
                                ▼          ▼             ▼
                    ┌──────────────┐  ┌──────────┐  ┌──────────────────┐
                    │ Confirmation │  │HazardFlag│  │ ModerationAction │
                    │ ──────────── │  │──────────│  │────────────────── │
                    │ report   FK  │  │ report FK│  │ report      FK   │
                    │ user    FK   │  │ reporter FK│  │ moderator  FK   │
                    │            NULL│  │ reason ENUM(5)│ │ action  ENUM(4)│
                    │ session_key   │  │ notes (500) │  │ reason  (500)  │
                    │ (64, blank)  │  │ status (20) │  │ created_at      │
                    │ created_at    │  │ created_at  │  └──────────────────┘
                    └──────────────┘  └──────────┘
                                          (moderation app)

┌────────────────────────────────┐        ┌────────────────────────────────┐
│  PlatformSettings  [SINGLETON] │        │  SystemAuditLog                │
│  ─────────────────────────────  │        │  ────────────────────────────  │
│  confirmation_threshold   = 3  │        │  actor       FK User NULL      │
│  freshness_hours          = 24 │        │  action_type ENUM(5)           │
│  max_upload_size_mb       = 5  │        │  target_id   (100)             │
│  allow_anonymous_map_view = ✓  │        │  details     TEXT (1000)       │
│  emergency_notice_enabled = ✓  │        │  created_at                    │
│  updated_at                    │        └────────────────────────────────┘
│  updated_by  FK User NULL      │
└────────────────────────────────┘
```

---

## `UserProfile`

Extends Django's `User` with the platform's role model. One-to-one, created at
registration.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BigAutoField | PK | |
| `user` | `OneToOneField(User)` | `on_delete=CASCADE`, `related_name="profile"` | |
| `display_name` | `CharField` | `max_length=80`, `blank=True` | Public name; falls back to `username` |
| `role` | `CharField` | `max_length=20`, choices, `default="citizen"` | |
| `created_at` | `DateTimeField` | `auto_now_add` | |
| `updated_at` | `DateTimeField` | `auto_now` | |

### Role choices

| Value | Label |
|---|---|
| `citizen` | Citizen |
| `moderator` | Moderator |
| `admin` | Administrator |

`__str__` returns `"{display_name or username} ({role})"`.

---

## `HazardReport`

The core dataset. Every field maps to something the frontend renders.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BigAutoField | PK | |
| `category` | `CharField` | `max_length=30`, choices | `HazardCategory` enum |
| `location_label` | `CharField` | `max_length=150`, `blank=True` | Optional landmark/street |
| `description` | `TextField` | `max_length=1000` | Required, 5–1000 chars |
| `latitude` | `DecimalField` | `max_digits=9, decimal_places=6`, `validate_latitude` | −90.0 to 90.0 |
| `longitude` | `DecimalField` | `max_digits=9, decimal_places=6`, `validate_longitude` | −180.0 to 180.0 |
| `status` | `CharField` | `max_length=30`, choices, `default=REPORTED` | `HazardStatus` enum |
| `photo` | `ImageField` | `upload_to="hazards/%Y/%m/"`, null, `validate_hazard_photo` | Optional, converted to WebP |
| `reporter` | `ForeignKey(User)` | `on_delete=SET_NULL`, null, blank, `related_name="hazard_reports"` | Null for anonymous |
| `confirmations_count` | `PositiveIntegerField` | `default=0` | Denormalised from `Confirmation` |
| `flags_count` | `PositiveIntegerField` | `default=0` | Denormalised from `HazardFlag` |
| `is_demo` | `BooleanField` | `default=False` | Seeded sample data flag |
| `created_at` | `DateTimeField` | `auto_now_add` | |
| `updated_at` | `DateTimeField` | `auto_now` | |

### Ordering and indexes

```python
ordering = ["-created_at"]

indexes = [
    models.Index(fields=["status", "category"]),
    models.Index(fields=["latitude", "longitude"]),
    models.Index(fields=["created_at"]),
]
```

| Index | Serves |
|---|---|
| `(status, category)` | The map's combined filter — the hottest query path |
| `(latitude, longitude)` | Bounding-box viewport queries |
| `(created_at`)` | Default newest-first ordering |

This index set maps directly onto the three filter modes the frontend uses, which is why
no additional indexes exist.

### Enum definitions

```python
class HazardCategory(models.TextChoices):
    FLOODING     = "flooding",     "Flooding / Standing Water"
    POTHOLE      = "pothole",      "Pothole / Road Damage"
    BLOCKED_ROAD = "blocked_road", "Blocked Road / Obstruction"
    FALLEN_TREE  = "fallen_tree",  "Fallen Tree / Debris"
    OTHER        = "other",        "Other Hazard"

class HazardStatus(models.TextChoices):
    REPORTED            = "reported",            "Reported"
    UNDER_REVIEW        = "under_review",        "Under Review"
    COMMUNITY_CONFIRMED = "community_confirmed", "Community Confirmed"
    RESOLVED            = "resolved",            "Resolved"
    REJECTED            = "rejected",            "Rejected / Inaccurate"
```

Note `TextChoices` values are the lowercase keys used by the frontend; the labels are
the human-readable `*_display` strings rendered in status badges.

### `save()` override — automatic WebP conversion

```python
def save(self, *args, **kwargs):
    if self.photo and hasattr(self.photo, "file") and not getattr(self, "_webp_processed", False):
        ext = os.path.splitext(self.photo.name)[1].lower()
        if ext != ".webp":
            converted = convert_image_to_webp(self.photo)
            if converted:
                self.photo = converted
        self._webp_processed = True
    super().save(*args, **kwargs)
```

The `_webp_processed` instance flag prevents re-converting on every subsequent save — an
existing `.webp` is also skipped by extension check. The server therefore guarantees the
WebP invariant regardless of what the client did.

### `freshness_info` property

A read-only computed property producing the freshness object:

| Age | Returned |
|---|---|
| < 60s | `{"label": "Just now", "is_stale": false, "minutes_ago": 0}` |
| < 1h | `{"label": "Reported N minute(s) ago", "is_stale": false, "minutes_ago": N}` |
| < 24h | `{"label": "Reported N hour(s) ago", "is_stale": false, "hours_ago": N}` |
| ≥ 24h | `{"label": "Reported N day(s) ago", "is_stale": N >= 2, "days_ago": N}` |

Note the shape varies — `minutes_ago`, `hours_ago`, or `days_ago` appear depending on the
bucket, so a consumer cannot rely on a single numeric field being present.

Stale is hardcoded at `days >= 2` rather than reading `PlatformSettings.freshness_hours`.

---

## `Confirmation`

Records that a user confirmed a hazard is still present.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BigAutoField | PK | |
| `report` | `ForeignKey(HazardReport)` | `on_delete=CASCADE`, `related_name="confirmations"` | |
| `user` | `ForeignKey(User)` | `on_delete=SET_NULL`, null, blank | |
| `session_key` | `CharField` | `max_length=64`, `blank=True` | Guest dedup hash |
| `created_at` | `DateTimeField` | `auto_now_add` | |

### Unique constraint

```python
models.UniqueConstraint(
    fields=["report", "user"],
    condition=models.Q(user__isnull=False),
    name="unique_user_report_confirmation",
)
```

A **conditional** unique constraint — it only applies to rows with a non-null `user`.
This is what prevents one person inflating a report's confirmation count, while still
allowing guest confirmations to be recorded.

`session_key` is defined for guest deduplication but is not currently written by the view;
the confirm action requires authentication.

---

## `HazardFlag`

Records a community correction request against a report.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BigAutoField | PK | |
| `report` | `ForeignKey(HazardReport)` | `on_delete=CASCADE`, `related_name="flags"` | |
| `reporter` | `ForeignKey(User)` | `on_delete=SET_NULL`, null, blank | |
| `reason` | `CharField` | `max_length=40`, choices | |
| `notes` | `TextField` | `max_length=500`, `blank=True` | Accepted by the API; not sent by the frontend |
| `status` | `CharField` | `max_length=20`, `default="pending"` | Never updated by current code |
| `created_at` | `DateTimeField` | `auto_now_add` | |

### Reason choices

| Value | Label |
|---|---|
| `cleared` | Hazard has been cleared / is no longer present |
| `inaccurate` | Inaccurate location or details |
| `duplicate` | Duplicate of another report |
| `spam` | Spam, offensive, or abuse |
| `other` | Other reason |

The frontend defaults to `cleared` because it is the most common case — a hazard fixed by
municipal crews.

### Duplicate prevention

Enforced in the view rather than by a constraint:

```python
if HazardFlag.objects.filter(report=report, reporter=request.user, status="pending").exists():
    return 400 "You have already submitted a pending flag for this report."
```

Because `status` never changes, this is effectively "one flag per user per report, ever."

---

## `ModerationAction`

The audit record for every editorial decision. Lives in the `moderation` app.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BigAutoField | PK | |
| `report` | `ForeignKey("hazards.HazardReport")` | `on_delete=CASCADE`, `related_name="moderation_actions"` | |
| `moderator` | `ForeignKey(User)` | `on_delete=SET_NULL`, null, blank, `related_name="moderation_actions"` | |
| `action` | `CharField` | `max_length=30`, choices | |
| `reason` | `TextField` | `max_length=500` | **Not nullable — rationale is mandatory** |
| `created_at` | `DateTimeField` | `auto_now_add` | |

### Action choices

| Value | Label | Resulting status |
|---|---|---|
| `review` | Mark Under Review | `under_review` |
| `confirm` | Mark Community Confirmed | `community_confirmed` |
| `resolve` | Mark Resolved | `resolved` |
| `reject` | Reject / Mark Inaccurate | `rejected` |

`reason` has no `blank=True` and the serializer enforces `min_length=3`, so a moderation
action **cannot exist without an explanation**. This is enforced at both the model and
serializer layers.

---

## `PlatformSettings`

A singleton holding operational parameters. Lives in the `accounts` app.

| Field | Type | Default | Validated range |
|---|---|---|---|
| `id` | BigAutoField | — | Fixed to 1 by `get_settings()` |
| `confirmation_threshold` | `PositiveIntegerField` | `3` | 1–20 |
| `freshness_hours` | `PositiveIntegerField` | `24` | 1–168 |
| `max_upload_size_mb` | `PositiveIntegerField` | `5` | 1–25 |
| `allow_anonymous_map_view` | `BooleanField` | `True` | — |
| `emergency_notice_enabled` | `BooleanField` | `True` | — |
| `updated_at` | `DateTimeField` | `auto_now` | — |
| `updated_by` | `ForeignKey(User)` | `SET_NULL`, null, `related_name="settings_updates"` | — |

### Singleton pattern

```python
@classmethod
def get_settings(cls):
    obj, _ = cls.objects.get_or_create(id=1)
    return obj
```

Hardcoding `id=1` guarantees a single row. Note this means the model has **no database-level
uniqueness constraint** protecting it — a direct `PlatformSettings.objects.create()` outside
the helper would break the invariant.

### Effective enforcement

| Setting | Enforced? |
|---|---|
| `confirmation_threshold` | ❌ Not read — `confirm()` hardcodes 3 |
| `freshness_hours` | ❌ Not read — `freshness_info` hardcodes 2 days |
| `max_upload_size_mb` | ⚠️ Partially — the validator reads `settings.MAX_UPLOAD_SIZE_MB` (env var), not this field |
| `allow_anonymous_map_view` | ❌ Not read by any view |
| `emergency_notice_enabled` | ❌ Not read |

The settings are admin-editable and surfaced in the API, but only partially wired to
behaviour. See [`platform-settings.md`](platform-settings.md).

---

## `SystemAuditLog`

Records administrative actions. Lives in the `accounts` app.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BigAutoField | PK | |
| `actor` | `ForeignKey(User)` | `on_delete=SET_NULL`, null, blank, `related_name="admin_actions"` | Null renders as "System" |
| `action_type` | `CharField` | `max_length=30`, choices | |
| `target_id` | `CharField` | `max_length=100`, `blank=True` | Stringified primary key |
| `details` | `TextField` | `max_length=1000` | Human-readable summary |
| `created_at` | `DateTimeField` | `auto_now_add` | |

`ordering = ["-created_at"]` — newest first.

### Action types

| Value | Label | Written by |
|---|---|---|
| `ROLE_CHANGE` | User Role Change | ✅ `admin_user_role_update_view` |
| `SETTINGS_UPDATE` | Platform Settings Update | ✅ `admin_settings_view` |
| `USER_SUSPENSION` | User Account Status Update | ❌ Never written |
| `USER_DELETION` | User Account Deletion | ✅ `admin_user_delete_view` |
| `HAZARD_OVERRIDE` | Administrative Hazard Override | ❌ Never written |

`target_id` is a `CharField` rather than a FK because the audit log must survive deletion
of its target — a foreign key would be erased by the very deletion it needs to record.

### Audit detail format

| Event | `details` string |
|---|---|
| Role change | `Changed role of user '{username}' (ID #{pk}) from '{old}' to '{new}'.` + ` Reason: {reason}` |
| Settings update | `Updated platform operational settings: {keys}.` |
| Deletion | `Permanently deleted user account '{username}' (ID #{pk}, Email: {email}).` |

The settings log records only the **changed keys**, not their previous and new values, so
the before/after comparison the frontend design implies is not actually recoverable from
the log.

---

## Deletion semantics

| Relationship | `on_delete` | Rationale |
|---|---|---|
| `UserProfile → User` | `CASCADE` | Profile has no meaning without a user |
| `HazardReport → User` (reporter) | **`SET_NULL`** | **Deleting a user must never delete road hazard data** |
| `Confirmation → User` | `SET_NULL` | Same — preservation of public data |
| `Confirmation → HazardReport` | `CASCADE` | Confirmation is meaningless without its report |
| `HazardFlag → User` | `SET_NULL` | Preserve the flag signal |
| `ModerationAction → User` | `SET_NULL` | **The audit record must survive moderator deletion** |
| `SystemAuditLog → User` | `SET_NULL` | Same — the audit trail is permanent |
| `PlatformSettings → User` | `SET_NULL` | Preserve who changed settings |

This pattern is deliberate and consistent: **anything describing public road data or
accountability survives account deletion; only dependent decoration cascades.**

When a user is deleted, their hazard reports remain but `reporter` becomes `null`. The
frontend never displays a reporter, so the visible effect is nil — but the data remains
queryable for platform statistics.

---

## Schema notes

| Concern | Approach | Rationale |
|---|---|---|
| Coordinates | `DecimalField(9, 6)` | Avoids float rounding on geo comparisons; 6dp ≈ 10cm precision |
| Counters | Denormalised `PositiveIntegerField` | Avoids a `COUNT` on every list render |
| Enum values | `TextChoices` | Readable in the DB, self-documenting in code |
| Photo sharding | `hazards/%Y/%m/` | Directory sizes stay manageable |
| Soft delete | None | Reports change status instead of being deleted |
| Multi-tenancy | None | Single global dataset, coordinate-scoped rather than city-scoped |
