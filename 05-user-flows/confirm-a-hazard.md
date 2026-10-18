# Flow — Confirm a Hazard

The action that keeps RouteX's data current. Confirmation means *"I was just there and it
is still present"* — not *"an inspector verified this"*.

**Entry:** `HazardDetailsPanel` on the map screen.

---

## Purpose and trust semantics

Confirmation is the mechanism that lets a community-maintained dataset self-correct for
decay. A pothole filled by a municipal crew is still listed until someone reports it is
gone.

The design must be unambiguous that this is **peer observation, not official inspection**.
This is enforced in three places:

| Location | Message |
|---|---|
| Landing FAQ (Q4) | "Does a community-confirmed report mean the road was officially inspected?" — **No.** |
| Safety and trust section | "They indicate recent activity, not an official inspection or engineering certification." |
| Inline near the action | Confirmation copy is framed as peer verification |

---

## Flow

```
  ┌──────────────────────────┐
  │ Open hazard detail panel │
  └────────────┬─────────────┘
               │
               ▼
  ┌──────────────────────────┐
  │ Read report: photo,      │
  │ description, timestamp,  │
  │ existing confirmations   │
  └────────────┬─────────────┘
               │
               ▼
  ┌──────────────────────────┐   not signed in
  │ "Confirm this hazard"    │──────────────────┐
  └────────────┬─────────────┘                  │
               │ signed in                      ▼
               │                     ┌─────────────────────┐
               ▼                     │ "Please sign in to  │
  ┌──────────────────────────┐      │  confirm this road  │
  │ Tap confirm              │      │  hazard."           │
  └────────────┬─────────────┘      └─────────────────────┘
               │
               ▼
  ┌──────────────────────────┐
  │ POST /hazards/{id}/      │
  │ confirm/                 │
  └────────────┬─────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   ┌─────────┐   ┌──────────┐
   │ Success │   │  Error   │
   └────┬────┘   └────┬─────┘
        │             │
        ▼             ▼
  ┌─────────────┐  ┌──────────────────┐
  │ Count +1    │  │ Inline message,  │
   │ in place    │  │ retry available  │
   │             │  └──────────────────┘
   │ If count ≥  │  (401/403 → sign-in prompt)
   │ threshold:  │  (other → generic retry)
   │ status      │
   │  → Community│
   │   Confirmed │
   └─────────────┘
```

---

## Design details

### State model

| State | Meaning |
|---|---|
| `confirming` | Request in flight — button shows a spinner and disables |
| `confirmed` | This user has already confirmed — the action is locked for them |
| `errorMessage` | Inline failure message, cleared on the next attempt |

### Success behaviour

The panel updates **in place** rather than refetching:

```jsx
onHazardUpdated({
  ...hazard,
  confirmations_count: res.confirmations_count,
  status: res.status || hazard.status,
  status_display: res.status === "community_confirmed"
    ? "Community Confirmed"
    : hazard.status_display,
})
```

Consequences:

| Observation | Result |
|---|---|
| Confirmation count below threshold | Count increments; status unchanged |
| Count reaches `confirmation_threshold` | Status becomes `community_confirmed`, badge turns teal |

The `confirmation_threshold` is an **admin-configurable platform setting** (default 3),
so the escalation point is an operational decision rather than a hardcoded constant.

### The "one per user" rule

A user may hold at most one active confirmation per hazard. The `confirmed` state locks
the action after success, so the UI reflects the server rule instead of letting a user
attempt an action that will be rejected.

### Confirmation display

| Context | Presentation |
|---|---|
| Landing map preview | `ThumbsUp` icon + "N confirmed" |
| Hazard card | `ThumbsUp` icon + bare number |
| Landing live pulse | "N confirmation(s)" with correct pluralisation |
| Detail panel | Count plus the confirm action |

The count is always accompanied by the icon, never colour-coded alone.

---

## Anti-abuse and eligibility

| Rule | Rationale |
|---|---|
| Authentication required | Prevents trivial mass-confirmation spam |
| One confirmation per user per hazard | Prevents inflating a single report |
| Only the submitting user is excluded | Prevents self-confirmation, which would be meaningless |
| Rate limiting | Login is limited to 10/min and registration to 5/hr, indicating the same defensive posture on write endpoints |

Community confirmation raises a report's status. Because that status is what other users
rely on, inflating it is the primary integrity risk — which is why the one-per-user rule
is surfaced in the UI rather than hidden in the API.

---

## Related flows

| Flow | Purpose |
|---|---|
| [Report a hazard](report-a-hazard.md) | Creates the report being confirmed |
| [Flag a report](flag-a-report.md) | The inverse action, for inaccurate or cleared reports |
| [Moderation](moderation.md) | Where confirmations combine into moderation outcomes |
