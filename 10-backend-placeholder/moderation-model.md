# Moderation & Audit Model

The accountability layer. Every editorial decision and every privileged action is recorded
with a mandatory written rationale.

---

## The two log tables

| Model | App | Scope | Written by |
|---|---|---|---|
| `ModerationAction` | `moderation` | Editorial decisions on hazards | Moderators |
| `SystemAuditLog` | `accounts` | Administrative actions on the platform | Administrators |

They are deliberately separate: a citizen should be able to see *why a report's status
changed* without also seeing *which admin promoted which moderator*.

---

## `ModerationAction`

The record of every editorial decision.

| Field | Type | Constraints |
|---|---|---|
| `id` | BigAutoField | PK |
| `report` | `ForeignKey("hazards.HazardReport")` | `CASCADE`, `related_name="moderation_actions"` |
| `moderator` | `ForeignKey(User)` | `SET_NULL`, null, blank |
| `action` | `CharField(30)` | choices |
| `reason` | `TextField(500)` | **Not nullable, no `blank=True`** |
| `created_at` | `DateTimeField` | `auto_now_add` |

`ordering = ["-created_at"]`

### Actions

| Value | Label | Resulting status |
|---|---|---|
| `review` | Mark Under Review | `under_review` |
| `confirm` | Mark Community Confirmed | `community_confirmed` |
| `resolve` | Mark Resolved | `resolved` |
| `reject` | Reject / Mark Inaccurate | `rejected` |

---

## Mandatory rationale — enforced at three layers

This is the single most important integrity rule in the platform.

### Layer 1 — Model

```python
reason = models.TextField(max_length=500)
```

No `null=True`, no `blank=True`. The database cannot store a moderation action without a
reason.

### Layer 2 — Serializer

```python
reason = serializers.CharField(min_length=3, max_length=500)
```

Required, and at least 3 characters — so `""`, `" "`, and `"x"` are all rejected. A
`ValidationError` naming the field is returned with `400`.

### Layer 3 — Frontend

The action modal blocks submission until a rationale is supplied, and displays the error
server-side (`roleModalError`) without discarding the text.

### What this prevents

Without mandatory rationale, moderation becomes a series of silent clicks, and:

| Risk | Prevention |
|---|---|
| Arbitrary suppression of a legitimate hazard warning | Every rejection carries a stated justification |
| Unreviewable decisions | History shows *why*, not just *what* |
| Arbitrary moderator behaviour | Written reasoning is attributable |
| Inconsistent rulings | Precedent is visible and reviewable |

For a road-safety platform, the ability to suppress a genuine flood warning is a
life-safety risk. Mandatory rationale is the structural answer.

---

## Applying an action

`POST /moderation/reports/{id}/action/`

```json
{
  "action": "resolve",
  "reason": "Municipal crews cleared the drainage on 17 Oct; verified by photo."
}
```

### Response — both the record and the update

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

Returning both objects means the client updates the queue row and its decision history in
**one round trip**, with no refetch and no risk of the UI disagreeing with the server.

### Ordering

Status is updated first, then the audit record is created, then both are serialised. The
status change and the audit entry are therefore always consistent — there is no path where
a status changes without a corresponding record.

---

## `moderator_name` resolution

```python
def get_moderator_name(self, obj):
    if not obj.moderator:
        return "System / Anonymous"
    return obj.moderator.profile.display_name or obj.moderator.username
```

Prefers the public display name, falls back to the username, and handles a deleted moderator
via the `SET_NULL` foreign key by returning "System / Anonymous".

**`on_delete=SET_NULL` is critical**: deleting a moderator must not erase the record of what
they decided. The decision remains attributable to a former account.

---

## Querying decision history

| Endpoint | Scope | Limit |
|---|---|---|
| `GET /moderation/reports/{id}/actions/` | One report | None |
| `GET /moderation/history/` | Platform-wide | 50 most recent |

Both are ordered newest-first and both are readable by moderators — not just admins.
Moderators can see precedent, which is how consistency is maintained.

The platform-wide endpoint hardcodes `[:50]` with no pagination, so older decisions are
unreachable through the API. `select_related("report", "moderator")` prevents N+1 queries.

---

## Moderation queue ordering

```python
HazardReport.objects.all().order_by("-flags_count", "-created_at")
```

**Most-flagged first**, then newest. This is the backend implementation of "highest
priority first" — a report with eight community flags outranks one with a single flag.

### Filters

| Parameter | Effect |
|---|---|
| `?status=` | Filter by report status |
| `?flagged_only=true` | Only reports with `flags_count > 0` |

### Stats

`GET /moderation/stats/`

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

`pending_flags` counts reports with `flags_count > 0` — consistent with the queue's
`flagged_only` filter.

---

## `SystemAuditLog`

| Field | Type | Constraints |
|---|---|---|
| `id` | BigAutoField | PK |
| `actor` | `ForeignKey(User)` | `SET_NULL`, null, blank, `related_name="admin_actions"` |
| `action_type` | `CharField(30)` | choices |
| `target_id` | `CharField(100)` | `blank=True` |
| `details` | `TextField(1000)` | Required |
| `created_at` | `DateTimeField` | `auto_now_add` |

`ordering = ["-created_at"]`

### Action types

| Value | Label | Written by |
|---|---|---|
| `ROLE_CHANGE` | User Role Change | ✅ Role update view |
| `SETTINGS_UPDATE` | Platform Settings Update | ✅ Settings patch view |
| `USER_SUSPENSION` | User Account Status Update | ❌ Never written |
| `USER_DELETION` | User Account Deletion | ✅ Delete view |
| `HAZARD_OVERRIDE` | Administrative Hazard Override | ❌ Never written |

### Why `target_id` is a CharField, not a ForeignKey

```python
target_id = models.CharField(max_length=100, blank=True)
```

A foreign key would be **erased by the very deletion it needs to record** — or blocked by
`on_delete` rules. Storing a stringified identifier means the audit log survives its target
by design.

`USER_DELETION` demonstrates this: the log entry is written *before* `target_user.delete()`,
so the record of who was deleted outlives the account.

---

## Audit detail formats

| Event | Format |
|---|---|
| Role change | `Changed role of user '{username}' (ID #{pk}) from '{old}' to '{new}'. Reason: {reason}` |
| Settings update | `Updated platform operational settings: {keys}.` |
| Deletion | `Permanently deleted user account '{username}' (ID #{pk}, Email: {email}).` |

The role-change detail embeds the **before and after** values plus the reason, making the
record self-explanatory without needing to correlate multiple entries.

> **Gap:** the settings log records only the changed **keys**, not their previous and new
> values. The before/after comparison implied by the admin design is not recoverable.

---

## Querying the audit trail

`GET /admin/audit-logs/` returns the 100 most recent entries with `select_related("actor")`
and **no pagination**.

A deleted admin renders as `"System"`:

```python
def get_actor_username(self, obj):
    return obj.actor.username if obj.actor else "System"
```

---

## What is not audited

| Action | Audited? |
|---|---|
| Registration | ❌ |
| Login / logout | ❌ |
| Password reset | ❌ |
| Hazard submission | ❌ |
| Confirmation | ❌ |
| Flagging | ❌ |
| Moderation action | ✅ |
| Role change | ✅ |
| User deletion | ✅ |
| Settings change | ❌ — only keys recorded |

Reasonable scope: the log covers **privileged and editorial** actions. Routine citizen
activity is visible through the data itself (reports carry a reporter, confirmations carry a
user).

**Notable gap:** flags are not individually audited — only the aggregate count on the
report. When a moderator rejects a report, they can see `flags_count` but not *who* flagged
it or *why*. The `HazardFlag` rows exist with `reporter` and `reason`, but no moderation
endpoint exposes them. Adding a flag-detail view would materially improve moderator
context.

---

## Retention

Both tables grow without bound and are never pruned. `SystemAuditLog` is the more
long-lived record; `ModerationAction` is high-volume.

For a production deployment, a retention policy with archival would be advisable —
particularly for `SystemAuditLog`, where long-term retention is usually desirable but
indefinite growth is not.

---

## Related documentation

| Document | Covers |
|---|---|
| [`status-lifecycle.md`](status-lifecycle.md) | The five statuses and every transition |
| [`permissions.md`](permissions.md) | Who may perform which action |
| [`platform-settings.md`](platform-settings.md) | The tunables affecting escalation |
