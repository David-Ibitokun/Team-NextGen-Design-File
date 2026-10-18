# Brand — Identity & Voice

## Positioning

RouteX is a **civic-tech, community-powered road hazard reporting and awareness platform**.

> Know the Road Ahead.

The tagline is used verbatim across the app header, the landing hero context, the
footer, and the app manifest description. It is intentionally short, active, and forward
looking — it promises *knowledge*, not safety guarantees.

## Personality

| Attribute | We are | We are not |
|---|---|---|
| Trustworthy | Transparent about where data comes from and how fresh it is | Authoritative — we hold no road authority |
| Practical | Built around real commute decisions | Alarmist or dramatic |
| Civic | Community-owned, community-observed | Commercial or engagement-gated |
| Calm | Plain, matter-of-fact copy | Urgent, shouty, fear-based |
| Honest | Marks uncertainty rather than hiding it | Overconfident |

## Voice principles

1. **Never claim official authority.** RouteX does not inspect roads. Community
   confirmation means *peer observation*, not certification. This distinction appears in
   the FAQ, the safety section, and inline on confirmation counts.

2. **Always surface uncertainty.** Stale reports are labelled, not deleted. Timestamps
   are visible everywhere a report appears.

3. **Warn about the user's physical safety.** The interface explicitly tells users not to
   photograph or drop a pin while driving, and tells them when to call emergency services
   instead of using the app.

4. **Say what the data is not.** A demo-data banner is shown whenever seeded sample
   hazards are present, and demo markers are individually badged on the map and in cards.

5. **Respect the reader's time.** Button labels are verbs ("Report a hazard", "Submit
   report", "Try again"), not abstractions.

## Terminology

Use these terms consistently in UI copy and documentation.

| Use | Avoid |
|---|---|
| Hazard | Issue, problem, incident (in citizen-facing copy) |
| Community-confirmed | Verified, official, validated |
| Report | Submission, ticket |
| Moderator | Admin, editor (for the moderation role) |
| Administrator | Superuser, owner |
| Freshness / report age | TTL, expiry |
| Explore the map | View map, open map |

## Voice examples

| Context | Copy |
|---|---|
| Loading | "Fetching road hazards..." |
| Empty | "No reports match these filters." |
| Error | "We could not load road hazards. Check your connection or try again." |
| Success | "Report Submitted" — "Thank you for helping road users know what lies ahead." |
| Confirmation caveat | "Confirmations indicate that other registered commuters verified the hazard's presence. They indicate recent activity, not an official inspection." |
| Stale data | "This report may be out of date. Check the latest updates." |
| Auth wall | "You must be signed in to submit a hazard report. Please sign in and try again." |
| Demo data | "Demo data active: Showing illustrative hazards for development. These are not real-time road closures." |

## Demographics and contexts

| Context | Design consequence |
|---|---|
| Commuters checking a route before leaving | Map-first landing, freshness always visible |
| Driver/cyclist/pedestrian reporting in real time | Large tap targets, one-handed bottom nav, camera-first report flow |
| Low-connectivity commuter | PWA offline shell, WebP photo compression, install prompt |
| Night driving | Dark mode with a full dark surface scale |
| Non-native English reader | Plain language, `en-GB` date formatting, short sentences |

## Accessibility commitment

The interface is designed to be operable by keyboard, on a low-end phone, and by users
who are colour-blind — colour is never the sole carrier of meaning; every status and
category is also labelled in text.
