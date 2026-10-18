# Flow — Flag a Report

The corrective counterpart to confirmation. Flagging routes an inaccurate, cleared, or
abusive report into the moderation queue.

**Entry:** `HazardDetailsPanel` on the map screen.

---

## Purpose

Confirmation keeps a valid report alive. Flagging is how the community corrects the
record when a report is no longer accurate — the pothole was filled, the tree was already
removed, the location is wrong, or the submission is abuse.

Both actions share the same entry point, same authentication requirement, and the same
"one action per user per report" discipline. They are deliberately symmetrical: the
community should find it as easy to correct the record as to sustain it.

---

## Flow

```
  ┌──────────────────────────┐
  │ Open hazard detail panel │
  └────────────┬─────────────┘
               │
               ▼
  ┌──────────────────────────┐
  │ Tap "Flag this report"   │
  └────────────┬─────────────┘
               │
               ▼
  ┌──────────────────────────┐
  │ Flag form expands        │
  │ (showFlagForm = true)    │
  └────────────┬─────────────┘
               │
               ▼
  ┌──────────────────────────┐   not signed in
  │ Choose a reason          │──────────────────┐
  │  ┌────────────────────┐  │                  ▼
  │  │ ▸ Cleared          │  │      ┌─────────────────────┐
  │  │ ▸ Inaccurate       │  │      │ "Please sign in to  │
  │  │ ▸ Duplicate        │  │      │  flag a report."    │
  │  │ ▸ Abuse / spam     │  │      └─────────────────────┘
  │  └────────────────────┘  │
  └────────────┬─────────────┘
               │ default: "cleared"
               ▼
  ┌──────────────────────────┐
  │ POST /hazards/{id}/flags/│
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
  │ flag count  │  │ Inline message,  │
  │ +1 in place │  │ retry available  │
  │ form closes │  └──────────────────┘
  └──────┬──────┘
         │
         ▼
  ┌──────────────────────────┐
  │ Report enters the        │
  │ moderation queue         │
  └──────────────────────────┘
```

---

## Design details

### Flag reasons

The default is `cleared`, because the most common reason a hazard report is inaccurate is
that the condition has been resolved. Defaulting to the most frequent case reduces the
effort of the most common action.

| Reason | Typical trigger |
|---|---|
| `cleared` | Municipal crews fixed it; the tree was removed; the flood drained |
| `inaccurate` | Wrong location, wrong category, or a misleading description |
| `duplicate` | The same hazard is already listed nearby |
| `abuse` | Spam, harassment, or a submission unrelated to road safety |

The reason is **structured, not free text**. This lets moderators triage by reason and
lets administrators detect abuse patterns — free text would make both impossible.

### State model

| State | Meaning |
|---|---|
| `flagging` | Request in flight |
| `flagged` | This user has already flagged — action locked |
| `showFlagForm` | Whether the reason selector is expanded |
| `flagReason` | Currently selected reason |
| `errorMessage` | Inline failure message |

### Success behaviour

```jsx
onHazardUpdated({
  ...hazard,
  flags_count: (hazard.flags_count || 0) + 1,
});
```

The flag form collapses and the action becomes permanently disabled for this user. The
panel shows the updated flag count so the user understands their report registered.

### Discoverability

The flag action lives in the **detail panel**, not on the marker popup. The popup stays
thin (title, description, "View details"), so flagging requires deliberately opening the
full record — an appropriate friction level for an action that escalates to moderation.

---

## Escalation to moderation

Flagging does not change report status directly. It adds a flag, which surfaces the report
in the moderator queue where a human decides.

```
  user flags report
        │
        ▼
  POST /hazards/{id}/flags/
        │
        ▼
  flags_count += 1
        │
        ▼
  report appears in /moderator queue
        │
        ▼
  moderator reviews + decides with mandatory rationale
```

See [moderation.md](moderation.md).

---

## Anti-abuse

| Rule | Rationale |
|---|---|
| Authentication required | Prevents trivial mass-flagging, which could bury legitimate reports |
| One flag per user per report | Prevents count inflation |
| Structured reason required | Makes triage and abuse detection possible |
| Moderator review required | No automatic removal — a human always decides |
| Full audit trail | Every moderation decision is recorded with rationale |

Because a flag escalates to a human rather than auto-removing a report, flagging is a
low-risk action for honest users while still being significant enough that spam is
detectable.

---

## Related flows

| Flow | Purpose |
|---|---|
| [Report a hazard](report-a-hazard.md) | Creates the report being flagged |
| [Confirm a hazard](confirm-a-hazard.md) | The sustaining action, opposite of flagging |
| [Moderation](moderation.md) | Where flagged reports are resolved |
