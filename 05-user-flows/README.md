# User Flows

End-to-end journeys through RouteX, from first impression to privileged action.

## Contents

| Flow | Covers |
|---|---|
| [`report-a-hazard.md`](report-a-hazard.md) | The core contribution loop — entry points, five fields, validation, success, error paths |
| [`confirm-a-hazard.md`](confirm-a-hazard.md) | Sustaining a report through peer confirmation and threshold escalation |
| [`flag-a-report.md`](flag-a-report.md) | Correcting the record, structured flag reasons, escalation to moderation |
| [`moderation.md`](moderation.md) | The moderator queue, four actions, mandatory rationale, decision history |
| [`admin-operations.md`](admin-operations.md) | Role management, user deletion, operational settings, audit trail |
| [`authentication.md`](authentication.md) | All four access tiers, session lifecycle, `?next=` contract, rate limits |
| [`information-architecture.md`](information-architecture.md) | Route map, navigation model, audience segmentation, trust surfaces |

---

## The contribution loop

RouteX's flows form a closed loop rather than a linear funnel. This is what makes a
community-maintained dataset self-correcting for decay — the property a hazard map
actually needs.

```
        ┌──────────────────────────────────────────────┐
        │                                              │
        ▼                                              │
   ┌─────────┐   confirmations ≥ threshold             │
   │reported │──────────────────────────▶ community_confirmed
   └────┬────┘                                       │
        │                                            │
        │ flagged                                    │
        ▼                                            │
   ┌──────────────────┐                              │
   │ moderation queue │──── resolved ────────────────┤
   └────┬───────┬─────┘                              │
        │       │ reject / dismiss                   │
        │       ▼                                     │
        │  ┌─────────┐   cleared (community)         │
        │  │rejected │───────────────────────────────┘
        │  └─────────┘
        │       ▲
        │       │ moderator action
        └───┘
```

### Loop properties

| Property | Mechanism |
|---|---|
| Starts with a contribution | Any signed-in user can report, anonymously visible to all |
| Self-corrects for decay | Anyone can confirm a hazard is *gone* by flagging it as `cleared` |
| Trust escalates with evidence | Confirmations accumulate to an admin-configurable threshold |
| No silent deletion | Reports change status; every change is recorded |
| Human decides, never automation | Flags escalate to a moderator; nothing auto-removes |

### The three sustaining actions

| Action | Meaning | Effect | Limit |
|---|---|---|---|
| **Confirm** | "It is still there" | `confirmations_count += 1`; auto-confirms at threshold | One per user per report |
| **Flag** | "This is wrong or cleared" | `flags_count += 1`; enters moderation queue | One per user per report |
| **Moderate** | "I reviewed it" | Status transition with mandatory rationale | Moderator/admin only |

Both sustaining actions are authenticated and rate-limited to one per user per report.
That constraint matters: confirmation count is what other road users trust, so inflating
it would undermine the entire dataset.

---

## Flow design principles

| Principle | Where it appears |
|---|---|
| **Never lose user work** | Errors retain field values and typed rationale |
| **Confirm in place** | Confirming updates the count and status without a refetch; submitting selects the new hazard automatically |
| **Preserve context** | Report opens as a modal over the map; auth redirects honour `?next=`; filters live in the URL |
| **Explain before asking** | Trust caveats sit adjacent to the CTA they qualify |
| **Degrade, never block** | Geolocation failure falls back to map tapping; photo conversion failure falls back to the original file |
| **Require reasons for power** | Mandatory rationale on moderation actions *and* admin role changes |
| **Say what the data is not** | Demo banners, freshness badges, "not an official inspection" wording |
| **Prevent self-lockout** | Administrators cannot demote themselves |

---

## Onboarding sequence

A new visitor's expected first session:

```
  1.  /                      Understand the product, see a live map, read the trust
                             section and the "when not to use RouteX" advisory
        │
        ▼
  2.  Explore the map        Browse without an account — no gate on public information
        │
        ▼
  3.  Tap "Report a hazard" → /login?next=/report
        │
        ▼
  4.  Register or sign in    Resumes at the report form
        │
        ▼
  5.  /report                Submit — success state, then map flies to the new hazard
        │
        ▼
  6.  /dashboard             Track the submission; see community impact
        │
        ▼
  7.  Return to the map      Confirm others' reports, flag resolved ones
```

Step 2 is significant: browsing requires no account, so a visitor can evaluate the
dataset's usefulness before being asked to register. Requiring an account before showing
value is the most common cause of abandonment in citizen-reporting tools.

---

## Related documentation

- [`../04-screen-specs/`](../04-screen-specs/) — screen layouts behind each flow
- [`../03-components/`](../03-components/) — component specifications
- [`../06-patterns/`](../06-patterns/) — recurring implementation patterns
