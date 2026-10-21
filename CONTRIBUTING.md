# Contributing to the Design File Repository

Guidance for keeping this documentation accurate and useful.

---

## What belongs here

| Include | Exclude |
|---|---|
| Design tokens and their rationale | Application source code |
| Component specifications | Build configuration |
| Screen layouts and behaviour | API implementation |
| User flows and information architecture | Generated files |
| Brand identity and voice | Secrets, credentials, `.env` |
| Responsive, dark mode, accessibility rules | Binary assets other than brand icons |
| PWA and offline strategy | Screenshots in progress |

This repository documents **design**. The application repository contains **code**. Keep
the two in sync when either changes.

---

## Source of truth

### Frontend

| Token group | Authoritative file |
|---|---|
| Colour theme, reduced motion, Leaflet CSS | `frontend/src/index.css` |
| Hazard categories, statuses, badge styles | `frontend/src/utils/hazardConstants.js` |
| Scroll reveal behaviour | `frontend/src/components/common/RevealOnScroll.jsx` |
| Dark mode persistence | `frontend/src/context/ThemeContext.jsx` |

### Backend

| Concern | Authoritative file |
|---|---|
| All configuration | `backend/config/settings.py` |
| URL routing and API root | `backend/config/urls.py` |
| Permission classes | `backend/apps/accounts/permissions.py`, `backend/apps/moderation/views.py` |
| Hazard lifecycle and enums | `backend/apps/hazards/models.py` |
| User roles, settings, audit log | `backend/apps/accounts/models.py` |
| Moderation actions | `backend/apps/moderation/models.py` |
| Request/response shapes | `backend/apps/*/serializers.py` |

Specifications here are derived from these files. **When the code changes, update this
repository in the same commit.**

---

## Adding a component

1. Add the component to the inventory table in `03-components/README.md`.
2. Document it in the matching category file — or create a new one if it fits none.
3. Include: purpose, props, visual specification, all states, light **and** dark values,
   accessibility notes, and usage guidance.
4. Cross-link from any screen spec that uses it.

## Adding a screen

1. Add it to the inventory and route table in `04-screen-specs/`.
2. Document layout, sections in order, states, responsive behaviour, and auth requirements.
3. Add a flow document if the screen involves a user journey worth explaining.

## Adding a design token

1. Add it to the relevant file in `01-design-system/`.
2. Note the CSS variable name **and** the Tailwind class.
3. Document both light and dark values.
4. State the contrast requirement if it is a colour.

---

## Documentation standards

| Rule | Reason |
|---|---|
| Give **hex first**, then the token name | Hex is unambiguous across themes |
| Document light **and** dark values | A half-specified theme is a bug |
| Use tables for anything with three or more variants | Easier to scan and diff |
| Include a "why" for design decisions | Rationale outlives the decision |
| Mark inconsistencies explicitly rather than hiding them | Honest documentation is more useful than tidy documentation |
| Link rather than repeat | Single source of truth per fact |

---

## Versioning

This repository carries no version tags of its own. It tracks the application version
(`1.0.0-MVP`).

Significant design changes should be noted in the relevant document's changelog:

```markdown
## Changelog

### 1.1.0 — 2026-11-02
- Added `danger` status treatment
- Darkened secondary text from `#667784` to `#5A6B77` for AA contrast
```

---

## Known inconsistencies to resolve

Tracked in the documents where they occur.

### Frontend

| Issue | Location |
|---|---|
| Admin badge uses `purple-*` in the header chip but `indigo-*` in navigation | [`06-patterns/badge-pattern.md`](06-patterns/badge-pattern.md) |
| Hazard freshness appears as both `freshness` and `freshness_info` | [`10-backend-placeholder/status-lifecycle.md`](10-backend-placeholder/status-lifecycle.md) |
| List responses may be paginated or a bare array | [`10-backend-placeholder/api-overview.md`](10-backend-placeholder/api-overview.md) |
| `HomePage` exists but `/` routes to `LandingPage` | [`04-screen-specs/support-screens.md`](04-screen-specs/support-screens.md) |
| User zoom is disabled, conflicting with WCAG 1.4.4 | [`08-accessibility/README.md`](08-accessibility/README.md) |
| Static `<meta name="theme-color">` does not follow the theme toggle | [`07-responsive/dark-mode.md`](07-responsive/dark-mode.md) |

### Backend — behaviour-affecting

| Issue | Impact | Location |
|---|---|---|
| `confirmation_threshold` hardcoded to 3 in the view | The admin setting has **no effect** on auto-confirmation | [`10-backend-placeholder/platform-settings.md`](10-backend-placeholder/platform-settings.md) |
| `freshness_hours` hardcoded to 2 days in the model | The admin setting has **no effect** on stale marking | [`10-backend-placeholder/status-lifecycle.md`](10-backend-placeholder/status-lifecycle.md) |
| `max_upload_size_mb` vs the `MAX_UPLOAD_SIZE_MB` env var | Two sources of truth for the same limit | [`10-backend-placeholder/media-and-uploads.md`](10-backend-placeholder/media-and-uploads.md) |
| `allow_anonymous_map_view` not enforced | The setting cannot restrict public reads | [`10-backend-placeholder/permissions.md`](10-backend-placeholder/permissions.md) |
| `emergency_notice_enabled` not enforced | The setting cannot change behaviour | [`10-backend-placeholder/platform-settings.md`](10-backend-placeholder/platform-settings.md) |
| Role-change `reason` is optional server-side | The mandatory-rationale rule is UI-only | [`10-backend-placeholder/authentication.md`](10-backend-placeholder/authentication.md) |
| `IsModeratorOrAdmin` duplicates `IsModeratorUser` | Two copies of one rule can drift | [`10-backend-placeholder/permissions.md`](10-backend-placeholder/permissions.md) |
| `HazardFlag.status` never changes | Flags stay `pending` forever | [`10-backend-placeholder/moderation-model.md`](10-backend-placeholder/moderation-model.md) |
| `HazardFlag` rows are never exposed to moderators | Moderators see `flags_count` but not who or why | [`10-backend-placeholder/moderation-model.md`](10-backend-placeholder/moderation-model.md) |
| Settings audit records keys, not values | Before/after comparison is unrecoverable | [`10-backend-placeholder/moderation-model.md`](10-backend-placeholder/moderation-model.md) |
| `image/heic` accepted client-side, unsupported server-side | iPhone users may be offered a failing format | [`10-backend-placeholder/media-and-uploads.md`](10-backend-placeholder/media-and-uploads.md) |

### Mobile

| Issue | Impact | Location |
|---|---|---|
| **App icons are the default Expo template artwork** | The home screen and store listing show a blue "A", not RouteX | [`12-mobile/assets/README.md`](12-mobile/assets/README.md) |
| Moderator and Admin dashboard tabs are visible to everyone | Implies privileged access that does not exist | [`12-mobile/02-screens/dashboard.md`](12-mobile/02-screens/dashboard.md) |
| "My Reports" shows every hazard, not the user's | The tab label does not match the content | [`12-mobile/02-screens/dashboard.md`](12-mobile/02-screens/dashboard.md) |
| User identity is hardcoded | Every user sees "Citizen Contributor" | [`12-mobile/02-screens/dashboard.md`](12-mobile/02-screens/dashboard.md) |
| Confirm action does not call the API | The count increments locally only | [`12-mobile/02-screens/hazard-list.md`](12-mobile/02-screens/hazard-list.md) |
| Theme choice is not persisted | Resets to the system scheme on every launch | [`12-mobile/01-design-system/colour.md`](12-mobile/01-design-system/colour.md) |
| `userInterfaceStyle: "light"` | iOS chrome does not follow the app's dark mode | [`12-mobile/04-native-platform/README.md`](12-mobile/04-native-platform/README.md) |
| `expo-image-picker` permissions not declared | iOS/Android capture may fail | [`12-mobile/04-native-platform/README.md`](12-mobile/04-native-platform/README.md) |
| Policy tests re-implement the logic | The suite can pass while the shipped code breaks | [`12-mobile/04-native-platform/navigation-security.md`](12-mobile/04-native-platform/navigation-security.md) |
| `README.md` / `AGENTS.md` describe the legacy WebView architecture | Docs contradict the code | [`12-mobile/README.md`](12-mobile/README.md) |
| `RouteXHeader` and `RouteXWebView` are unreferenced | Dead code that still ships | [`12-mobile/03-components/README.md`](12-mobile/03-components/README.md) |
| Category badge fills differ between web and mobile | The same category looks different per platform | [`12-mobile/01-design-system/colour.md`](12-mobile/01-design-system/colour.md) |
