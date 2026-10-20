# Permissions & Access Matrix

## The full matrix

Every endpoint, every role.

**Key:** ✅ allowed · 🔵 conditional · ❌ `403 Forbidden`

---

## Hazards

| Endpoint | Anonymous | Citizen | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| `GET /hazards/` | ✅ | ✅ | ✅ | ✅ |
| `GET /hazards/{id}/` | ✅ | ✅ | ✅ | ✅ |
| `POST /hazards/` | ❌ | ✅ | ✅ | ✅ |
| `POST /hazards/{id}/confirm/` | ❌ | ✅ | ✅ | ✅ |
| `POST /hazards/{id}/flags/` | ❌ | ✅ | ✅ | ✅ |

Enforced by `IsAuthenticatedOrReadOnly` on the ViewSet, overridden to `IsAuthenticated`
on both custom actions.

### Read access is fully public

Anyone — signed in or not — can browse the entire hazard dataset and read full report
details. This is a deliberate civic-transparency decision: road hazard information is
public-safety data, and gating it behind registration would defeat the purpose.

### Write actions require authentication

Reporting, confirming, and flagging all require a session. Authentication is what makes
one-confirmation-per-user and one-flag-per-user enforceable, which is the mechanism
protecting the dataset's integrity.

---

## Auth

| Endpoint | Anonymous | Citizen | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| `GET /auth/csrf/` | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/register/` | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/login/` | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/logout/` | ❌ | ✅ | ✅ | ✅ |
| `GET /auth/me/` | ❌ | ✅ | ✅ | ✅ |
| `GET /auth/me/reports/` | ❌ | ✅ | ✅ | ✅ |
| `GET /auth/dashboard-summary/` | ❌ | ✅ | ✅ | ✅ |
| `PATCH /auth/profile/` | ❌ | ✅ | ✅ | ✅ |
| `POST /auth/password-reset/` | ✅ | ✅ | ✅ | ✅ |
| `POST\|GET /auth/password-reset/validate/` | ✅ | ✅ | ✅ | ✅ |
| `POST /auth/password-reset/confirm/` | ✅ | ✅ | ✅ | ✅ |

Registration, login, and all three password-reset endpoints are deliberately public —
they are how a user *becomes* authenticated. `logout` requires a session because there is
nothing to log out from otherwise.

---

## Moderation

| Endpoint | Anonymous | Citizen | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| `GET /moderation/stats/` | ❌ | ❌ | ✅ | ✅ |
| `GET /moderation/reports/` | ❌ | ❌ | ✅ | ✅ |
| `POST /moderation/reports/{id}/action/` | ❌ | ❌ | ✅ | ✅ |
| `GET /moderation/reports/{id}/actions/` | ❌ | ❌ | ✅ | ✅ |
| `GET /moderation/history/` | ❌ | ❌ | ✅ | ✅ |
| `GET /moderation/hazards/` *(alias)* | ❌ | ❌ | ✅ | ✅ |
| `POST /moderation/hazards/{id}/action/` *(alias)* | ❌ | ❌ | ✅ | ✅ |
| `GET /moderation/hazards/{id}/actions/` *(alias)* | ❌ | ❌ | ✅ | ✅ |

Enforced by `IsModeratorOrAdmin`.

**Citizens receive `403` even though they can flag reports.** Flagging is a *signal*;
deciding is a *privileged act*. Keeping these separate is what prevents a report flood from
becoming a moderation flood.

**Admins have implicit moderator access** — `IsModeratorOrAdmin` accepts
`profile.role == "admin"`, so admins can moderate without holding a second role.

---

## Admin

| Endpoint | Anonymous | Citizen | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| `GET /admin/stats/` | ❌ | ❌ | ❌ | ✅ |
| `GET /admin/users/` | ❌ | ❌ | ❌ | ✅ |
| `DELETE /admin/users/{id}/` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /admin/users/{id}/role/` | ❌ | ❌ | ❌ | ✅ |
| `GET /admin/settings/` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /admin/settings/` | ❌ | ❌ | ❌ | ✅ |
| `GET /admin/audit-logs/` | ❌ | ❌ | ❌ | ✅ |

Enforced by `IsPlatformAdmin`.

### Moderators are strictly denied

Unlike the moderator surface, staff status is **not** sufficient here:

```python
if request.user.is_superuser: return True
return request.user.profile.role == "admin"
```

A Django staff user without an `admin` profile role receives `403`. Role elevation is
itself privileged — otherwise any moderator could promote themselves.

---

## Permission matrix by capability

| Capability | Anonymous | Citizen | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse the live map | ✅ | ✅ | ✅ | ✅ |
| Filter and inspect reports | ✅ | ✅ | ✅ | ✅ |
| View full report details | ✅ | ✅ | ✅ | ✅ |
| Submit a hazard report | ❌ | ✅ | ✅ | ✅ |
| Confirm a hazard | ❌ | ✅ | ✅ | ✅ |
| Flag a report | ❌ | ✅ | ✅ | ✅ |
| View own submissions | ❌ | ✅ | ✅ | ✅ |
| View own dashboard | ❌ | ✅ | ✅ | ✅ |
| Edit own profile | ❌ | ✅ | ✅ | ✅ |
| View moderation queue | ❌ | ❌ | ✅ | ✅ |
| Apply moderation actions | ❌ | ❌ | ✅ | ✅ |
| View decision history | ❌ | ❌ | ✅ | ✅ |
| View platform statistics | ❌ | ❌ | ❌ | ✅ |
| List all users | ❌ | ❌ | ❌ | ✅ |
| Promote / demote roles | ❌ | ❌ | ❌ | ✅ |
| Delete user accounts | ❌ | ❌ | ❌ | ✅ |
| Change platform settings | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |

This matrix matches the permission table published in the project README exactly — the
frontend design and the backend enforcement agree.

---

## Permission class reference

| Class | File | Grants |
|---|---|---|
| `AllowAny` | DRF built-in | Everyone |
| `IsAuthenticated` | DRF built-in | Any authenticated user |
| `IsAuthenticatedOrReadOnly` | DRF built-in | Read public, write authenticated |
| `IsCitizen` | `accounts/permissions.py` | Any authenticated user |
| `IsModeratorUser` | `accounts/permissions.py` | Moderator or admin |
| `IsPlatformAdmin` | `accounts/permissions.py` | Admin or superuser only |
| `IsModeratorOrAdmin` | `moderation/views.py` | Moderator or admin (duplicate) |

### Decision logic comparison

| Condition | `IsModeratorUser` | `IsModeratorOrAdmin` | `IsPlatformAdmin` |
|---|:---:|:---:|:---:|
| Not authenticated | ❌ | ❌ | ❌ |
| `is_superuser` | ✅ | ✅ | ✅ |
| `is_staff` | ✅ | ✅ | ❌ |
| `profile.role == "moderator"` | ✅ | ✅ | ❌ |
| `profile.role == "admin"` | ✅ | ✅ | ✅ |
| `profile.role == "citizen"` | ❌ | ❌ | ❌ |

The only meaningful difference between the two moderator classes is that
`IsModeratorOrAdmin` omits an explicit authentication guard before checking
`is_staff` — behaviourally equivalent, since anonymous users are never `is_staff`.

---

## Defense in depth

Permission enforcement exists at four independent layers.

| Layer | Mechanism | Protects against |
|---|---|---|
| **1. Route guard** | Frontend redirects unauthorised users | Accidental access, confusing UX |
| **2. Navigation hiding** | Role-conditional header items | Users seeing actions they cannot perform |
| **3. API permission class** | DRF permission checks | **The actual security boundary** |
| **4. Model constraints** | Unique constraints, `on_delete` rules | Data integrity regardless of caller |

Layers 1 and 2 are **UX only**. Editing the frontend bundle defeats them entirely and
grants nothing, because layer 3 independently re-checks every request.

### Layer 4 examples

| Constraint | Effect |
|---|---|
| `UniqueConstraint(report, user)` on `Confirmation` | One confirmation per user per report, enforced at the database level |
| `on_delete=SET_NULL` on `HazardReport.reporter` | Road hazard data survives user deletion |
| `on_delete=SET_NULL` on `ModerationAction.moderator` | The audit record survives moderator deletion |
| `reason` non-nullable on `ModerationAction` | A moderation decision cannot exist without a rationale |

The database is the final arbiter — even a bug in application code cannot produce a
duplicate confirmation or an unreasoned moderation action.

---

## Error responses

### Unauthenticated → `401`

```json
{
  "detail": "Authentication credentials were not provided.",
  "code": "not_authenticated"
}
```

### Authenticated but insufficient → `403`

```json
{
  "detail": "You do not have permission to perform this action.",
  "code": "permission_denied"
}
```

The distinction matters: `401` means "sign in", `403` means "signing in will not help."

### Frontend handling

| Status | UI response |
|---|---|
| `401` | "Please sign in to confirm this road hazard." |
| `403` | Same — the action is unavailable regardless of auth state |
| `404` | `ErrorState` with retry |

---

## Safeguards

| Safeguard | Scope | Message |
|---|---|---|
| Self-demotion blocked | `PATCH /admin/users/{id}/role/` | "You cannot remove administrative privileges from your own active session." |
| Self-deletion blocked | `DELETE /admin/users/{id}/` | "You cannot delete your own active administrative account." |
| Last superuser protected | `DELETE /admin/users/{id}/` | "Cannot delete the sole remaining superuser account." |
| Duplicate confirmation blocked | `POST /hazards/{id}/confirm/` | "You have already confirmed this hazard report." |
| Duplicate flag blocked | `POST /hazards/{id}/flags/` | "You have already submitted a pending flag for this report." |
| Mandatory rationale | `POST /moderation/reports/{id}/action/` | Field-level validation error |
| Registration role locked | `POST /auth/register/` | Always creates `citizen` |
| Reporter not spoofable | `POST /hazards/` | `reporter` set from `request.user` |

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| `IsModeratorOrAdmin` duplicates `IsModeratorUser` | Two copies of the same rule can drift apart | Consolidate to one class in `accounts/permissions.py` |
| Role-change `reason` optional server-side | Mandatory-rationale accountability is UI-only | Set `required=True` in `UserRoleUpdateSerializer` |
| `allow_anonymous_map_view` not enforced | The setting cannot actually restrict public reads | Gate the ViewSet's list/retrieve, or remove the setting |
| `emergency_notice_enabled` not enforced | The setting cannot actually change behaviour | Check it in the report flow, or remove it |
| `HazardFlag.notes` unused by the frontend | Moderators never see the richer context | Surface it in the moderation queue |
| `HazardFlag.status` never changes | Flags stay `pending` forever, so "already flagged" is permanent | Resolve flags when a moderation action lands |
| `SystemAuditLog` action types unused | `USER_SUSPENSION` and `HAZARD_OVERRIDE` are declared but never written | Implement or remove |
| `confirmation_threshold` not read by the view | Admin has no real control over auto-confirmation | Read from `PlatformSettings.get_settings()` |
| `freshness_hours` not read by the model | Admin has no real control over stale marking | Use it as the stale boundary in `freshness_info` |
