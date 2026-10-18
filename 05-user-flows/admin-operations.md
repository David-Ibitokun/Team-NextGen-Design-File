# Flow — Administrator Operations

Privileged actions: role management, user deletion, operational settings, and audit
trail review.

**Entry:** `/admin-dashboard` (admin only)
**Navigation:** header "Admin Portal" item, indigo `Sliders` icon

---

## Design stakes

Administrator actions can silently change who holds power over a civic platform. An
accidental promotion grants moderation authority; an accidental deletion erases someone's
civic contributions.

Two design rules govern every screen here:

1. **Every privileged action requires a written reason.** Mirroring moderation, so the
   platform has one consistent accountability rule.
2. **Destructive actions are confirmed and logged.** Nothing irreversible happens in a
   single click, and everything lands in the audit trail.

RouteX also enforces a **self-demotion safeguard** — an administrator cannot strip their
own privileges, preventing self-lockout. This is implemented on both the UI and the
server.

---

## Flow — Role management

```
  ┌──────────────────────┐
  │ Users & Roles tab    │
  └──────────┬───────────┘
             │ search by username/email · filter by role
             ▼
  ┌──────────────────────┐
  │ Select a user row    │
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │ Promote / Demote     │
  │ (UserCheck / UserX)  │
  └──────────┬───────────┘
             │
             ▼
  ┌────────────────────────────────┐
  │ Role change modal              │
  │ · target user summary         │
  │ · target role select          │
  │ · MANDATORY reason            │
  └──────────┬─────────────────────┘
             │ reason required
             ▼
  ┌────────────────────────────────┐
  │ PATCH /admin/users/{id}/role/  │
  │ { role, reason }               │
  └──────────┬─────────────────────┘
             │
        ┌────┴─────┐
        ▼          ▼
   ┌────────┐  ┌──────────┐
   │ Success│  │  Error   │
   └────┬───┘  └────┬─────┘
        │           │
        ▼           ▼
  ┌───────────┐  ┌────────────────────┐
  │ Row badge │  │ roleModalError     │
  │ updates,  │  │ in red, rationale  │
  │ audit log │  │ retained           │
  │ entry     │  └────────────────────┘
  └───────────┘
```

### Design details

| Element | Specification |
|---|---|
| Target user | Read-only summary — the admin cannot change a role without seeing exactly who |
| Target role | `<select>` — citizen / moderator / admin |
| Reason | Textarea, **mandatory**; submit blocked while empty |
| Error | `roleModalError` rendered beneath the field |

The role change is irreversible through the UI. The mandatory reason plus an explicit
confirmation is the only safeguard against accidental privilege escalation, and it
guarantees that every role change in the audit trail has a human explanation attached.

On success the row's `RoleBadge` updates in place — purple for admin, amber for moderator,
teal for citizen — so the change is immediately visible without a refetch.

---

## Flow — User deletion

A distinct destructive flow with its own error state (`deleteModalError`), deliberately
separated from the role-change modal so the two cannot be confused.

```
  Select user ──▶ Trash2 ──▶ Destructive confirm modal
                                 │
                                 ├─ Cancel ──▶ dismissed, no change
                                 └─ Confirm ──▶ DELETE ──▶ audit log entry
```

Destructive confirmations use red styling (`text-red-600 dark:text-red-400`) rather than
the teal primary action colour, so a destructive action never looks like a safe one.

Deletion removes a user account. The audit trail retains the record of the deletion itself,
so the action remains attributable after the target is gone.

---

## Flow — Operational settings

Three live platform parameters, each with a range, a description, and a `Save` action.

```
  ┌──────────────────────┐
  │ Platform Settings tab│
  └──────────┬───────────┘
             │
             ▼
  ┌────────────────────────────────────────┐
  │ confirmation_threshold    [  3  ]  1–20│
  │ freshness_hours           [ 24  ]  1–168│
  │ max_upload_size_mb        [  5  ]  1–25│
  └──────────┬─────────────────────────────┘
             │ change + Save
             ▼
  ┌────────────────────────────────────────┐
  │ PATCH /admin/settings/                 │
  └──────────┬─────────────────────────────┘
             │
             ▼
  ┌──────────────────────┐
  │ Success confirmation │
  │ + audit log entry    │
  └──────────────────────┘
```

### What each setting governs

| Setting | Range | Default | Effect |
|---|---|---|---|
| `confirmation_threshold` | 1–20 | **3** | Peer confirmations required before a report auto-confirms |
| `freshness_hours` | 1–168 | **24** | Report age after which it is marked stale |
| `max_upload_size_mb` | 1–25 | **5** | Maximum photo upload size |

### Why these ranges matter

| Setting | Design implication |
|---|---|
| `confirmation_threshold` | **1** makes every report community-confirmed instantly, which destroys the signal. **20** requires a crowd that will rarely assemble. **3** balances credibility against reach. |
| `freshness_hours` | **1h** would mark almost everything stale; **168h** (a week) would let genuinely dangerous stale reports persist. **24h** matches the daily rhythm of road conditions. |
| `max_upload_size_mb` | Large uploads strain mobile data on the low-bandwidth connections this platform targets. **5 MB** after WebP compression accommodates a high-resolution phone photo without being abusive. |

These are the platform's most consequential operational dials — they change how
aggressively the system escalates a hazard and how quickly it declares information
outdated. The ranges are deliberately bounded so no configuration can render the platform
useless or misleading.

Controls use `Save` and `RefreshCw` (`Refresh` to discard) actions, and each save confirms
inline rather than via a toast.

---

## Flow — Audit trail

```
  ┌──────────────────────┐
  │ Audit Trail tab      │──▶ GET /admin/audit-logs/
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────────────────┐
  │ Chronological list of events     │
  │ · acting administrator          │
  │ · target user / object           │
  │ · previous value → new value     │
  │ · timestamp                      │
  └──────────────────────────────────┘
```

Recorded events include role promotions and demotions, user deletions, and every
operational settings change — with the acting administrator, the affected target, both the
previous and new values, and a timestamp.

This satisfies the admin requirement to "inspect system-wide audit logs" and makes every
privileged action attributable. It is the accountability counterpart to the mandatory
rationale in the action modals: rationale captures the reasoning at the time, the audit
log preserves the fact of it permanently.

---

## Role identity

Administrator surfaces use **indigo**, distinct from teal (citizen) and amber
(moderator). The colour appears in the header nav icon, the active nav label, and the role
badge, so an administrator's context is identifiable at a glance.

| Role | Nav icon | Active colour | Badge |
|---|---|---|---|
| Citizen | `LayoutDashboard` | `teal-400` | `bg-teal-900/60 text-teal-300` |
| Moderator | `Shield` | `amber-400` | `bg-amber-900/60 text-amber-300` |
| Administrator | `Sliders` | `indigo-400` | `bg-purple-900/60 text-purple-300` |

---

## Related documentation

- [`../04-screen-specs/dashboards.md`](../04-screen-specs/dashboards.md) — admin screen layout
- [`../03-components/forms.md`](../03-components/forms.md) — role-change modal spec
- [moderation.md](moderation.md) — the accountability rule this flow mirrors
