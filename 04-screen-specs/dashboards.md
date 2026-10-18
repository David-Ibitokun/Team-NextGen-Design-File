# Screen — Dashboards

Three role-specific dashboards, all sharing one shell: a **metric strip** followed by a
**tab bar** with a single visible panel.

| Dashboard | Route | Aliases | Component |
|---|---|---|---|
| Citizen | `/dashboard` | `/my-reports` | `CustomerDashboardPage.jsx` |
| Moderator | `/moderator` | `/moderation` | `ModerationPage.jsx` |
| Administrator | `/admin-dashboard` | `/admin` | `AdminDashboardPage.jsx` |

## Shared shell

| Property | Value |
|---|---|
| Page | `bg-[#F7F9FA] dark:bg-[#0B161E] text-[#142B3B] dark:text-slate-100` |
| Header | Standard `AppHeader` |
| Container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Cards | `bg-white dark:bg-[#142533] rounded-2xl border border-slate-200 dark:border-slate-800` |

### Metric tiles

| Property | Value |
|---|---|
| Layout | `grid grid-cols-2 lg:grid-cols-4 gap-4` |
| Tile | `p-5 rounded-2xl border` |
| Icon | `w-5 h-5` in a `w-10 h-10 rounded-xl` teal-tinted container |
| Value | `text-2xl sm:text-3xl font-extrabold` |
| Label | `text-xs text-[#667784] dark:text-slate-400` |

### Tab bar

Full-width row with a hairline bottom border. Active tab: teal text with a 2px teal
underline. Inactive: `#667784`. Icons at `w-3.5 h-3.5` precede labels.

Each tab switches local state (`activeTab`) and triggers its own data fetch, so switching
tabs loads fresh data rather than showing stale content.

### Shared states

All three dashboards handle loading (`LoadingState`), error (`ErrorState` with retry), and
empty (`EmptyState` with an action) for their panels.

---

## Citizen Dashboard (`/dashboard`)

### Tabs

| Tab | Key | Purpose |
|---|---|---|
| My Reports | `reports` | The user's own submissions with status filters |
| Community Impact | `impact` | Contribution metrics and road safety guidance |
| Settings | `settings` | Display name and email editing |

### Metric tiles

| Tile | Icon | Meaning |
|---|---|---|
| Total submissions | `FileText` | Lifetime reports contributed |
| Confirmations received | `ThumbsUp` | Peer confirmations on the user's reports |
| Active alerts | `Activity` | The user's reports still open |
| Cleared hazards | `CheckCircle2` | The user's reports marked resolved |

### Tab 1 — My Reports

A status filter row mirrors the map's filter chips:

| Filter | Label |
|---|---|
| All | Every report |
| Reported | Freshly submitted |
| Confirmed | Community-confirmed |
| Resolved | Closed |

Reports render as `HazardCard`s in a responsive grid. Each card links to the map at the
hazard's coordinates and provides status-specific actions.

### Tab 2 — Community Impact

| Section | Contents |
|---|---|
| Impact statistics | Verification rate, contribution rank, and aggregate community metrics |
| Observer badges | Milestone badges recognising sustained contribution |
| Road safety guidelines | Short practical guidance for reporting responsibly |

This tab reframes reporting from a one-off action into ongoing civic participation — the
core retention mechanism for a contribution platform.

### Tab 3 — Account & Profile Settings

| Field | Notes |
|---|---|
| Display name | Inline editor, saved via `PATCH /api/v1/auth/profile/` |
| Email address | Inline editor |

A `Save` button with a `Check` icon commits changes; a success state replaces the form
briefly. The styling matches citizen-facing forms rather than the admin aesthetic,
because this is a self-service action.

---

## Moderator Queue (`/moderator`)

Role-gated: `isModerator` or `isAdmin`. Non-authorised users are redirected.

### Tabs

| Tab | Key | Purpose |
|---|---|---|
| Review Queue | `queue` | Flagged reports awaiting a decision |
| Decision History | `history` | Chronological log of all moderation decisions |

### Queue summary tiles

| Tile | Icon | Meaning |
|---|---|---|
| Pending reports | `ShieldAlert` | Awaiting review |
| Flagged | `Flag` | Reports requiring attention |
| Active hazards | `AlertTriangle` | Currently open hazards |

### Tab 1 — Review Queue

Reports sorted by **priority**, highest first, so the most consequential decisions surface
first.

Each queue item presents:

| Element | Specification |
|---|---|
| Header | `CategoryBadge` + `StatusBadge` + `FreshnessBadge` |
| Photo | Attached evidence, presented for inspection |
| Description | Reporter's text and location label |
| Metadata | Coordinates, reporter, timestamp, flag reason, flag count |
| Actions | Confirm Hazard · Mark Under Review · Mark Resolved · Reject / Dismiss |
| Rationale | **Mandatory** free-text justification |

### Moderation action modal

| Property | Value |
|---|---|
| Trigger | Any action button |
| Rationale | Required textarea — the action cannot be submitted empty |
| Confirmation | Explicit confirm step |
| Error | `roleModalError` / `deleteModalError` in red beneath the field |

**Design rationale:** making rationale mandatory converts moderation from a series of
silent clicks into an auditable record. This is the single most important interaction in
the entire product — it is what prevents the platform from becoming a tool for suppressing
unfavourable reports.

### Tab 2 — Decision History

A chronological, platform-wide log of every moderation decision: action taken, report
reference, moderator, timestamp, and the recorded rationale.

Making history visible to moderators (not just admins) reinforces accountability and lets
moderators stay consistent with prior decisions.

---

## Administrator Portal (`/admin-dashboard`)

Role-gated: `isAdmin` only.

### Tabs

| Tab | Key | Purpose |
|---|---|---|
| Users & Roles | `users` | Search, filter, promote, demote, delete |
| Platform Settings | `settings` | Live operational parameters |
| Audit Trail | `audit` | System-wide administrative events |

Navigation identity for this role is **indigo** (`indigo-400` icon and active text), which
distinguishes it from the amber moderator surface and teal citizen surface.

### Metric tiles

| Tile | Icon |
|---|---|
| Total users | `Users` |
| Reports | `FileText` |
| Moderation actions | `Activity` |
| Confirmed hazards | `CheckCircle2` |

### Tab 1 — Users & Roles

| Control | Specification |
|---|---|
| Search | `Search` icon input filtering by username or email |
| Role filter | `<select>` — all / citizen / moderator / admin |
| User row | Avatar, display name, `@username`, email, `RoleBadge`, joined date |
| Actions | `UserCheck` promote, `UserX` demote, `Trash2` delete |

#### Role change modal

| Element | Specification |
|---|---|
| Target user | Read-only summary |
| Target role | Select — citizen / moderator / admin |
| Reason | Textarea, **mandatory** |
| Error | Rendered in red beneath the field |

Role changes are irreversible via the UI, so the mandatory reason plus an explicit
confirmation step is the only safeguard against accidental privilege escalation.

#### Delete confirmation

A separate destructive flow with its own `deleteModalError` state, keeping the failure
message for the delete action distinct from the role-change error.

#### Self-demotion safeguard

The UI prevents an administrator from stripping their own privileges — mirrored by the
server-side guard. A user cannot lock themselves out of the portal.

### Tab 2 — Platform Settings

Live operational parameters, each with a numeric input, a description, and a `Save` action.

| Setting | Range | Default | Effect |
|---|---|---|---|
| `confirmation_threshold` | 1–20 | 3 | Confirmations needed to auto-confirm a hazard |
| `freshness_hours` | 1–168 | 24 | Age after which a report is marked stale |
| `max_upload_size_mb` | 1–25 | 5 | Maximum photo upload size |

Controls render as `Sliders`-adjacent numeric fields with `Save` and `RefreshCw` buttons.
A success state confirms each save.

These three settings are the platform's most consequential operational dials — they change
how aggressively the system escalates a hazard and how quickly it flags reports as
outdated.

### Tab 3 — Audit Trail

A chronological record of every administrative event: role promotions and demotions,
deletions, and settings changes, each with the acting admin, the affected target, the
previous and new values, and a timestamp.

This satisfies the "inspect system-wide audit logs" requirement of the admin role and makes
every privileged action attributable.
