# Hazard Status Lifecycle

## The five statuses

Defined as a Django `TextChoices` enum on `HazardReport`.

| Value | Display label | Meaning | Frontend colour |
|---|---|---|---|
| `reported` | Reported | A new claim, awaiting corroboration | Slate `#667784` |
| `under_review` | Under Review | A moderator is inspecting it | Amber `#F2B544` |
| `community_confirmed` | Community Confirmed | Corroborated by peer observations | Teal `#087F8C` |
| `resolved` | Resolved | The hazard has genuinely been fixed | Green `#27865B` |
| `rejected` | Rejected / Inaccurate | The report is false or out of scope | Red `#D64545` |

The enum values are the lowercase keys the frontend filters on; the labels are the
`*_display` strings rendered in status badges.

---

## Transition map

```
                            ┌──────────────┐
                            │              │
                            ▼              │
                     ┌─────────────┐       │
        submit ─────▶│  reported   │       │
                     └──────┬──────┘       │
                            │              │
          ┌─────────────────┼──────────────┘
          │                 │
   3+ peer confirmations   moderator
          │                 │
          ▼                 │
  ┌──────────────────┐      │      ┌───────────────┐
  │community_        │◀─────┴─────▶│ moderator:    │
  │  confirmed       │              │   review      │
  └────────┬─────────┘              └───────┬───────┘
           │                                │
           │            moderator           │
           │         ┌──────────────┐        │
           └────────▶│  resolved    │◀───────┘
                       └──────────────┘
           
  Any state ──moderator: reject──▶ ┌──────────┐
                                    │ rejected │
                                    └──────────┘
```

---

## How each transition happens

### `reported` — the entry state

Set by the model default:

```python
status = models.CharField(..., default=HazardStatus.REPORTED)
```

Reached by `POST /hazards/`. **Read-only at the API level** — `status` is in the
serializer's `read_only_fields`, so no client can set it directly.

### `reported` → `community_confirmed` (automatic)

Triggered by community confirmations reaching the threshold:

```python
new_count = report.confirmations.count()
report.confirmations_count = new_count
if new_count >= CONFIRMATION_THRESHOLD and report.status == HazardStatus.REPORTED:
    report.status = HazardStatus.COMMUNITY_CONFIRMED
```

Two guards: the count must reach the threshold, **and** the report must still be
`reported`. A resolved or rejected report cannot be silently re-promoted by a late
confirmation.

> ⚠️ `CONFIRMATION_THRESHOLD` is hardcoded to `3` rather than reading
> `PlatformSettings.confirmation_threshold`. See
> [platform-settings.md](platform-settings.md).

### Moderator transitions

All four are applied by `POST /moderation/reports/{id}/action/`:

```python
action_status_map = {
    "review":  HazardStatus.UNDER_REVIEW,
    "confirm": HazardStatus.COMMUNITY_CONFIRMED,
    "resolve": HazardStatus.RESOLVED,
    "reject":  HazardStatus.REJECTED,
}
```

| Action | Result | Use when |
|---|---|---|
| `review` | `under_review` | Credible but needs further inspection |
| `confirm` | `community_confirmed` | Accurate and genuinely present |
| `resolve` | `resolved` | Genuinely fixed or no longer exists |
| `reject` | `rejected` | False, spam, or out of scope |

### No transition validation

**There is no state machine.** The view applies whatever action is requested regardless of
the current status. A report can move `resolved → reported`-style round trips, and the same
action can be applied repeatedly.

The audit trail (`ModerationAction` rows) preserves the full sequence, so the history
remains accurate even though the current status is simply the last action applied.

**Design note:** this keeps the moderation surface forgiving — a moderator can correct
their own mistake by applying the right action — at the cost of allowing a
moderator-driven status ping-pong. Given the mandatory rationale and full decision history,
recoverability was judged the better trade-off.

---

## The three paths to `resolved`

`resolved` is the terminal "good" state, reached three ways:

| Path | Trigger |
|---|---|
| **Community** | A user flags it as `cleared` → a moderator confirms |
| **Moderator** | Direct `resolve` action with rationale |
| **Implied** | Administrative settings change? No — status is never auto-resolved |

The design deliberately requires a human for every resolution. A flag can indicate that a
hazard was cleared, but only a moderator decides that the record should say so.

---

## Rejected vs resolved

Both mean "this hazard is not a current problem", but they carry different meanings about
the report's credibility.

| | `resolved` | `rejected` |
|---|---|---|
| Hazard was real | ✅ Yes | ❌ No |
| Hazard is fixed/gone | ✅ Yes | N/A |
| Reporter was accurate | ✅ | ❌ |
| Display colour | Green | Red |
| Meaning | Good news | The report was wrong |

Conflating them would misrepresent whether a community member's observation was useful.
Keeping them distinct preserves the reputation of honest reporters.

---

## Freshness — the orthogonal dimension

Status describes the moderation state; **freshness describes time-based uncertainty**. A
report can be `community_confirmed` *and* stale.

### `freshness_info` property

Computed at serialization time, never stored:

| Age | Label | `is_stale` | Extra key |
|---|---|:---:|---|
| < 60s | "Just now" | `false` | `minutes_ago: 0` |
| < 1 hour | "Reported N minute(s) ago" | `false` | `minutes_ago: N` |
| < 24 hours | "Reported N hour(s) ago" | `false` | `hours_ago: N` |
| ≥ 24 hours | "Reported N day(s) ago" | `days >= 2` | `days_ago: N` |

**Stale at 2 days**, hardcoded.

### Shape is not uniform

The returned object has a **different key set per bucket** — `minutes_ago`, `hours_ago`, or
`days_ago`. Consumers must handle all three. The frontend's `FreshnessBadge` only reads
`label` and `is_stale`, which is the correct defensive approach.

### Stale is never deleted

A stale report stays in the dataset with an amber badge. Marking preserves the record;
deleting it would hide the fact that a hazard was once reported, which reduces the
information value of the dataset.

> ⚠️ `PlatformSettings.freshness_hours` exists and is admin-editable, but
> `freshness_info` hardcodes 1 day / 2 days. The setting has no effect.

---

## Status filter support

Every status value is filterable:

```
GET /hazards/?status=reported
GET /hazards/?status=community_confirmed
```

And combinable with category:

```
GET /hazards/?category=flooding&status=reported
```

Served by the composite index `(status, category)` — the hottest query path in the
application.

The moderation queue adds two more filters:

| Parameter | Effect |
|---|---|
| `?status=` | Same values |
| `?flagged_only=true` | Only `flags_count > 0` |

### Priority ordering

```python
HazardReport.objects.all().order_by("-flags_count", "-created_at")
```

Most-flagged first, then newest — the backend implementation of "highest priority first"
in the moderator queue.

---

## Status colour mapping in the UI

`getStatusBadgeStyle()` on the frontend mirrors the enum:

| Status | Background | Text | Border |
|---|---|---|---|
| `community_confirmed` | `#087F8C` @ 15% | `#087F8C` | `#087F8C` @ 30% |
| `under_review` | `#F2B544` @ 20% | `#855B09` | `#F2B544` @ 40% |
| `resolved` | `#27865B` @ 15% | `#27865B` | `#27865B` @ 30% |
| `rejected` | `#D64545` @ 15% | `#D64545` | `#D64545` @ 30% |
| `reported` | `#667784` @ 15% | `#142B3B` | `#667784` @ 30% |

`community_confirmed` wears the brand teal because corroboration is the most valuable state
in the dataset — scanning a list for high-confidence reports should be instant.

---

## Design rationale

### Why read-only at the API level

`status` is in `read_only_fields`. A client cannot set a report to `resolved` or
`community_confirmed` by crafting a request. Status changes only through:

1. Confirmation counts (system)
2. Moderation actions (privileged, audited)

This prevents a citizen from self-confirming their own report or marking their own bad
report as resolved.

### Why no deletion

`http_method_names = ["get", "post", "head", "options"]` — there is no `DELETE`.

Road hazard records persist. A wrong report becomes `rejected` with a rationale, not a
deleted row. This preserves the dataset's history and makes moderation decisions
reviewable.

### Why flags never auto-change status

```python
# POST /hazards/{id}/flags/ only increments flags_count
report.flags_count = report.flags.count()
report.save(update_fields=["flags_count"])
```

A flag is a **signal**, not a verdict. If flags could auto-reject a report, a coordinated
flag campaign could suppress a genuine hazard warning — dangerous for a road-safety
platform. Escalation to a human is essential.

### Why the threshold guards on current status

```python
if new_count >= THRESHOLD and report.status == HazardStatus.REPORTED:
```

Without the status check, a report a moderator had marked `resolved` could be silently
re-promoted to `community_confirmed` by a late confirmation — contradicting a deliberate
human decision.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Threshold hardcoded to `3` | The admin `confirmation_threshold` setting has no effect | Read `PlatformSettings.get_settings().confirmation_threshold` |
| Stale boundary hardcoded to 2 days | The admin `freshness_hours` setting has no effect | Use the setting as the boundary |
| No transition validation | Any status can follow any status; repeated identical actions are allowed | Consider validating transitions if stricter control is needed |
| `HazardFlag.status` never changes | Flags remain `pending` forever; "already flagged" is permanent | Set `resolved`/`dismissed` when a moderation action lands |
| `freshness_info` shape varies by bucket | Consumers must handle three different key sets | Return a consistent shape with all numeric fields nullable |
| Landing page reads `freshness_info` from the API | The serializer only exposes `freshness`, so live-pulse cards show default copy | Align the frontend field name |
