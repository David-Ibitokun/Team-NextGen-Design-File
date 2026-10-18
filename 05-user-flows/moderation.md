# Flow — Moderation

Where community flags become editorial decisions. This is the flow with the highest
stakes in the product.

**Entry:** `/moderator` (moderator or admin only)
**Navigation:** header "Moderator Queue" item, amber `Shield` icon

---

## Design stakes

Moderation determines which hazards other road users see and trust. A platform that lets
reports be suppressed without accountability is not a civic tool — it is a censorship
mechanism.

Three design rules follow from this, and they govern every screen in this flow:

1. **Mandatory rationale.** No moderation action can be submitted without a written
   justification.
2. **Visible history.** Every decision is recorded and displayed to moderators and admins.
3. **No silent deletion.** Reports move between statuses; they are not quietly removed.

---

## Flow

```
  ┌────────────────────┐
  │ /moderator         │
  │ role guard         │
  └─────────┬──────────┘
            │
            ▼
  ┌────────────────────┐   GET /moderation/reports/
  │ Review Queue tab   │◀──────────────────────┐
  │ sorted by priority │                        │
  └─────────┬──────────┘                        │
            │                                   │
            ▼                                   │
  ┌────────────────────┐                        │
  │ Inspect report     │                        │
  │ · photo evidence   │                        │
  │ · description      │                        │
  │ · flag reason      │                        │
  │ · flag count       │                        │
  │ · reporter + time  │                        │
  └─────────┬──────────┘                        │
            │                                   │
            ▼                                   │
  ┌────────────────────┐                        │
  │ Choose an action   │                        │
  └─────────┬──────────┘                        │
            │                                   │
            ▼                                   │
  ┌────────────────────┐   rationale empty      │
  │ Action modal       │◀─── submit blocked ────┘
  │ + rationale field  │
  └─────────┬──────────┘
            │ rationale supplied
            ▼
  ┌────────────────────┐
  │ Confirm            │
  └─────────┬──────────┘
            │
            ▼
  ┌────────────────────────────────┐
  │ POST /moderation/reports/      │
  │ {id}/action/                   │
  │ { action, rationale }          │
  └─────────┬──────────────────────┘
            │
            ▼
  ┌────────────────────┐
  │ Status transitions │──▶ recorded in Decision History
  └────────────────────┘
```

---

## Queue screen

### Summary tiles

| Tile | Icon | Meaning |
|---|---|---|
| Pending reports | `ShieldAlert` | Awaiting a decision |
| Flagged | `Flag` | Reports raised for review |
| Active hazards | `AlertTriangle` | Currently open hazards |

### Queue ordering

Reports are sorted by **priority, highest first**. The most consequential decisions
surface first, so a moderator working a limited session affects the highest-impact
reports.

### Report presentation

| Element | Purpose |
|---|---|
| Photo evidence | Photographic proof, when supplied |
| Description + landmark | The reporter's own account |
| Coordinates | Verify the location against the described landmark |
| `CategoryBadge` / `StatusBadge` / `FreshnessBadge` | Context at a glance |
| Flag reason and count | Why it was escalated, and by how many |
| Reporter and timestamp | Accountability and age |

The photo is central to this screen: moderators are judging whether an image matches its
description and location, which is not possible from text alone.

---

## Actions

Four decisions, each changing the report's status:

| Action | Resulting status | Use when |
|---|---|---|
| **Confirm Hazard** | `community_confirmed` | The report is accurate and the hazard is genuinely present |
| **Mark Under Review** | `under_review` | The report is credible but needs further inspection |
| **Mark Resolved** | `resolved` | The hazard has genuinely been fixed or no longer exists |
| **Reject / Dismiss** | `rejected` | The report is false, spam, or out of scope |

### Action modal

| Element | Specification |
|---|---|
| Header | The action verb, stated plainly |
| Body | Short reminder of what the action does |
| **Rationale** | Textarea — **mandatory**, cannot be empty |
| Confirm | Primary teal button, disabled until rationale is present |
| Cancel | Secondary button |
| Error | `roleModalError` in red beneath the field |

### Why rationale is mandatory

A rationale turns each moderation decision into an auditable record. It serves three
purposes:

| Purpose | How |
|---|---|
| Accountability | A moderator's reasoning is permanently attached to their decision |
| Consistency | History lets a moderator see how similar cases were handled before |
| Abuse deterrence | A written justification makes arbitrary decisions harder to justify later |

This is mirrored in the admin role-change flow, so the platform has one consistent rule:
**every privileged action is explained.**

---

## Decision history

A chronological, platform-wide log, available on the second tab and to moderators as well
as admins.

| Column | Content |
|---|---|
| Timestamp | When the decision was made |
| Report | Reference to the affected hazard |
| Action | Which of the four decisions was applied |
| Moderator | Who made it |
| Rationale | The recorded justification |

Making history visible to moderators — not only to admins — reinforces that decisions are
observable, and lets moderators stay consistent with precedent. It also allows legitimate
disagreement to be surfaced rather than argued in private.

---

## Error handling

| Condition | Response |
|---|---|
| Empty rationale | Submit blocked; the field is the gate |
| Unauthorised | Redirect to `/` (the server enforces the real permission boundary) |
| API failure | Inline error in the modal; the form retains the entered rationale so nothing is lost |
| Missing record | `ErrorState` with retry |

Errors never discard a moderator's written justification — losing that text would force
retyping under time pressure.

---

## Related flows

| Flow | Purpose |
|---|---|
| [Flag a report](flag-a-report.md) | How reports reach the queue |
| [Confirm a hazard](confirm-a-hazard.md) | How community confidence accumulates |
| [Admin operations](admin-operations.md) | Where platform thresholds are set |

---

## Trust rules

RouteX publishes four integrity principles, surfaced in the landing safety section and the
README:

| Rule | Design manifestation |
|---|---|
| Community confirmations indicate recent activity, **not** official inspection | Wording used in the FAQ, safety cards, and confirmation UI |
| Report age matters; stale reports are **marked, not deleted** | `FreshnessBadge` turns amber at ≥2 days |
| Flagged reports enter a dedicated queue for resolution | The moderation queue exists as a first-class screen |
| RouteX never claims to certify road safety | The amber "Honest Safety Notice" on the landing page |
