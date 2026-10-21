# Mobile Screens — System States

Three screens that handle the app's non-happy paths: connecting, failed, and misconfigured.

**Components:** `mobile/src/components/LoadingScreen.tsx`,
`ErrorScreen.tsx`, `ConfigMissingScreen.tsx`

All three share a common structure: a centred card on `COLORS.offWhite`, a large radius,
a soft shadow, and a single full-width action.

---

## Loading screen

Shown while the app establishes its connection to the RouteX platform.

### Layout

```
        ┌────────────────────────┐
        │         [R]            │  ← navy monogram badge
        │       RouteX            │
        │   Know the Road Ahead.  │
        │        ( ◍ )            │  ← ActivityIndicator
        │  Connecting to RouteX... │
        │                        │
        │ Community-powered road  │
        │         safety          │
        └────────────────────────┘
```

| Property | Value |
|---|---|
| Container | `flex: 1`, `COLORS.offWhite`, centred, `padding: 24` |
| Card | `maxWidth: 340`, `COLORS.white`, `radius 16`, `padding 28` |
| Shadow | `COLORS.navy` at `0, 4` offset, `0.08` opacity, radius `12` |
| Elevation | `3` |
| Border | `1px`, `COLORS.border` |

### Monogram badge

| Property | Value |
|---|---|
| Size | `56 × 56` |
| Radius | `14` |
| Background | `COLORS.navy` |
| Text | "R", white, `fontSize: 32`, `fontWeight: '800'` |

### Text

| Element | Value |
|---|---|
| Title | `fontSize: 22`, `700`, `COLORS.navy` |
| Tagline | `fontSize: 13`, `500`, `COLORS.slate` |
| Message | `fontSize: 14`, `500`, `COLORS.navy` |
| Footer | `fontSize: 11`, `COLORS.slate` — "Community-powered road safety" |

### Accessibility

```tsx
<View accessibilityRole="progressbar" accessibilityLabel={message}>
```

The whole container is announced as a progress bar with the current message.

---

## Error screen

A recoverable failure with diagnostics and a retry action.

### Layout

```
        ┌────────────────────────┐
        │         (!)            │  ← red circle
        │  Unable to Load RouteX  │
        │  Could not establish a  │
        │  connection to the      │
        │  RouteX platform.      │
        │  ┌────────────────────┐ │
        │  │ Target Address:    │ │
        │  │ http://10.0.2.2... │ │
        │  └────────────────────┘ │
        │  ┌────────────────────┐ │
        │  │ Troubleshooting…   │ │
        │  └────────────────────┘ │
        │  [  Retry Connection  ] │
        └────────────────────────┘
```

| Property | Value |
|---|---|
| Card | `maxWidth: 380` |
| Icon circle | `52 × 52`, `radius 26`, `COLORS.redLight` fill, `2px` `COLORS.red` border |
| Icon glyph | "!", `COLORS.red`, `fontSize: 26`, bold |
| Title | `fontSize: 18`, `700`, `COLORS.navy` |
| Description | `fontSize: 14`, `lineHeight: 20`, `COLORS.slate` |

### Target address box

Only rendered when `targetUrl` is provided.

| Property | Value |
|---|---|
| Background | `COLORS.offWhite` |
| Radius | `8` |
| Padding | `10` |
| Border | `1px`, `COLORS.border` |
| Label | `fontSize: 11`, `600`, `COLORS.slate` |
| Value | `fontSize: 12`, monospace, `COLORS.navy`, `numberOfLines={2}` |

Showing the exact URL is genuinely useful for a developer testing on a LAN.

### Troubleshooting box

`COLORS.amberLight` fill, `radius 10`, `padding 14`, border
`rgba(242, 181, 68, 0.4)`.

| Tip | Detail |
|---|---|
| **Internet connection** | "Ensure Wi-Fi or mobile data is active." |
| **Android Emulator** | "Use `http://10.0.2.2:5173` instead of localhost to reach your computer." |
| **Physical Device** | "Use your computer's LAN IP (e.g. `http://192.168.1.X:5173`) on the same Wi-Fi." |
| **Web Server** | "Verify the Vite development server is running (`run_frontend.bat`)." |

Inline code uses `fontFamily: 'monospace'`, `fontWeight: '600'`.

> **Note:** the fourth tip references `run_frontend.bat`, a Windows script. On macOS or
> Linux this instruction is not actionable. A platform-neutral phrasing — "verify the
> Vite dev server is running on port 5173" — would work everywhere.

### Retry action

| Property | Value |
|---|---|
| Size | Full width, `height: 46` |
| Background | `COLORS.teal` |
| Radius | `10` |
| Label | `fontSize: 15`, `700`, white — "Retry Connection" |
| Accessibility | `accessibilityRole="button"`, `accessibilityLabel="Retry connecting to RouteX"` |

---

## Configuration missing screen

Shown when `EXPO_PUBLIC_WEB_URL` is unset or malformed. This is a **developer-facing**
screen, not an end-user one.

### Layout

```
        ┌────────────────────────┐
        │         ⚙️              │  ← teal badge
        │  Configuration Required │
        │  Missing Web App URL    │
        │  The mobile container…  │
        │  ┌────────────────────┐ │
        │  │ Setup Instructions: │ │
        │  │ 1. Copy .env…      │ │
        │  │ 2. Set URL:        │ │
        │  │ ┌────────────────┐ │ │
        │  │ │# Emulator:     │ │ │
        │  │ │EXPO_PUBLIC_…   │ │ │
        │  │ └────────────────┘ │ │
        │  │ 3. Restart Expo    │ │
        │  └────────────────────┘ │
        │ [ Check Configuration  ] │
        │        Again            │
        └────────────────────────┘
```

| Property | Value |
|---|---|
| Card | `maxWidth: 400` |
| Badge | `48 × 48`, `radius 24`, `COLORS.tealLight` |
| Badge glyph | "⚙️" emoji, `fontSize: 24` |
| Title | `fontSize: 18`, `700`, `COLORS.navy` |
| Subtitle | `fontSize: 13`, `600`, `COLORS.red` |
| Helper | `fontSize: 13`, `lineHeight: 18`, `COLORS.slate` |

The subtitle is **red** — a configuration error is a hard failure, not a soft warning.

### Code block

| Property | Value |
|---|---|
| Background | `COLORS.offWhite` |
| Radius | `10` |
| Padding | `14` |
| Border | `1px`, `COLORS.border` |
| Title | `fontSize: 12`, `700`, `COLORS.navy` |
| Step text | `fontSize: 12`, `lineHeight: 18`, `COLORS.navy` |
| Inline code | monospace, `700`, `COLORS.teal` |

### Snippet block

| Property | Value |
|---|---|
| Background | `COLORS.navy` |
| Radius | `6` |
| Padding | `10` |
| Comment | `fontSize: 10`, monospace, `COLORS.slateLight` |
| Snippet | `fontSize: 11`, monospace, `#80E5FF` |

```
# Android Emulator (default):
EXPO_PUBLIC_WEB_URL=http://10.0.2.2:5173
# Physical Phone on LAN:
EXPO_PUBLIC_WEB_URL=http://192.168.1.X:5173
# Production / Staging deployment:
EXPO_PUBLIC_WEB_URL=https://routex.app
```

The snippet colour `#80E5FF` (cyan-300) is chosen for contrast on navy — it is not part
of the brand palette, but a monospace syntax-highlight colour is a reasonable exception
in a code block.

### Action

Full width, `height: 46`, `COLORS.teal`, `radius 10`, label "Check Configuration Again"
at `fontSize: 14` / `700`.

---

## The configuration contract

`mobile/src/config/env.ts` → `getWebUrlConfig()`.

| Condition | `errorMessage` |
|---|---|
| Empty or missing | "Missing EXPO_PUBLIC_WEB_URL configuration" |
| Non-HTTP(S) protocol | `Unsupported URL protocol: "{protocol}"` |
| No hostname | "Invalid URL hostname" |
| Malformed URL | `Malformed URL: {message}` |

On success it returns `origin` (protocol + host + port) and `normalizedUrl` (trailing
slashes stripped). The origin is what the navigation policy compares against.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Error screen is developer-facing | End users see emulator IP instructions | Detect a production build and show simpler copy |
| Error tips reference `run_frontend.bat` | Unactionable on macOS and Linux | Use platform-neutral phrasing |
| Config screen is always developer-facing | It should never be reachable by an end user | Confirm it only appears in dev builds |
| ⚙️ emoji on Android | Renders inconsistently across OEMs | Use a Lucide icon, as the other screens do |
| The three screens use `COLORS` directly | They ignore `ThemeContext` and never adapt to dark mode | Migrate to `useTheme()` |
| No "Open Settings" deep link | The user must leave the app to fix the issue | Link to the app settings on Android |
| No error code or correlation id | Hard to diagnose from a screenshot | Add a short reference code |
