# Native Platform — Configuration

How the RouteX mobile app is configured at the platform level: `app.json`, permissions,
app icons, and the build setup.

**Source:** `mobile/app.json`, `mobile/package.json`, `mobile/tsconfig.json`

---

## App identity

| Field | Value |
|---|---|
| `name` | RouteX |
| `slug` | routex |
| `version` | 1.0.0 |
| `orientation` | `portrait` |
| `icon` | `./assets/icon.png` (1024 × 1024) |
| `userInterfaceStyle` | `light` |
| `backgroundColor` | `#142B3B` |

> **Issue:** `userInterfaceStyle` is `"light"`, which tells iOS the app is light-only.
> The app ships a full dark theme with a working toggle, but the iOS system chrome
> (keyboard, status bar, pickers) will not follow it. Setting this to `"automatic"` would
> let iOS adapt its own chrome to the system scheme.

---

## Platform configuration

### iOS

| Field | Value |
|---|---|
| `supportsTablet` | `true` |
| `bundleIdentifier` | `org.routex.app` |
| `infoPlist.NSLocationWhenInUseUsageDescription` | "RouteX uses your location to place and view nearby road hazard reports accurately." |
| `infoPlist.NSCameraUsageDescription` | "RouteX uses the camera to allow capturing photographic evidence of road hazards." |
| `infoPlist.NSPhotoLibraryUsageDescription` | "RouteX uses your photo library to attach photos to road hazard reports." |

All three usage descriptions are **plain, specific, and honest** — they say what the data
is used for, not just that access is requested. This matters for App Store review and for
user trust.

### Android

| Field | Value |
|---|---|
| `package` | `org.routex.app` |
| `adaptiveIcon.backgroundColor` | `#142B3B` |
| `adaptiveIcon.foregroundImage` | `./assets/android-icon-foreground.png` |
| `adaptiveIcon.backgroundImage` | `./assets/android-icon-background.png` |
| `adaptiveIcon.monochromeImage` | `./assets/android-icon-monochrome.png` |
| `predictiveBackGestureEnabled` | `false` |

#### Permissions

| Permission | Purpose |
|---|---|
| `ACCESS_FINE_LOCATION` | Precise GPS for the map and location picker |
| `ACCESS_COARSE_LOCATION` | Approximate location fallback |
| `CAMERA` | Capturing photographic evidence |
| `READ_EXTERNAL_STORAGE` | Reading photos from the device gallery |

> **Gap:** `expo-image-picker` is a dependency and the app calls
> `launchImageLibraryAsync` and `launchCameraAsync`, but `expo-image-picker` is **not
> listed in the `android.permissions` array**. Expo's config plugin normally injects the
> required permissions, but this should be verified in an actual build.
>
> `READ_EXTERNAL_STORAGE` is also deprecated on recent Android versions in favour of
> `READ_MEDIA_IMAGES` — the scoped media permissions introduced in Android 13.

#### Predictive back

`predictiveBackGestureEnabled: false` opts out of the Android 14 predictive back gesture.

This is a **deliberate** choice: the app implements its own `BackHandler` hierarchy
(modal → list tab → exit confirmation). Opting out of the system gesture avoids a
conflict between the two.

### Web

| Field | Value |
|---|---|
| `favicon` | `./assets/favicon.png` (48 × 48) |

---

## Dependencies

| Package | Version | Role |
|---|---|---|
| `expo` | `~57.0.30` | Framework |
| `react` | `19.2.3` | UI runtime |
| `react-native` | `0.86.3` | Native runtime |
| `react-native-safe-area-context` | `^5.10.1` | Safe area insets |
| `react-native-svg` | `^15.16.0` | The brand logo mark and SVG icons |
| `react-native-webview` | `^14.0.1` | The Leaflet map host |
| `expo-image-picker` | `~57.0.20` | Camera and gallery capture |
| `expo-status-bar` | `~57.0.1` | Status bar control |
| `lucide-react-native` | `^1.59.0` | Icon library |

### Dev dependencies

| Package | Version |
|---|---|
| `typescript` | `~6.0.3` |
| `eslint` | `^9.39.5` |
| `eslint-config-expo` | `^58.0.4` |
| `@types/react` | `~19.2.0` |

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `start` | `expo start` | Dev server |
| `android` | `expo start --android` | Launch on Android |
| `ios` | `expo start --ios` | Launch on iOS |
| `web` | `expo start --web` | Launch on web |
| `type-check` | `tsc --noEmit` | TypeScript validation |
| `lint` | `eslint .` | Lint |
| `lint:fix` | `eslint . --fix` | Autofix |
| `test` | `node scripts/test_mobile_policy.js` | Security and navigation policy tests |

The test script is a **plain Node script using `assert`** — no Jest, no test runner. It
runs 10 assertions covering the URL config parser and the navigation security policy. See
[`navigation-security.md`](navigation-security.md).

---

## Environment configuration

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_WEB_URL` | The RouteX web app URL the container loads |
| `EXPO_PUBLIC_API_URL` | The Django API base URL |
| `EXPO_PUBLIC_CARTO_API_KEY` | Optional CartoDB basemap key |
| `CARTO_API_KEY` | Fallback for the Carto key |

The `EXPO_PUBLIC_` prefix means these are **inlined into the JavaScript bundle** and are
visible to anyone who unzips the app. None of them should hold a secret.

### Target values

| Environment | `EXPO_PUBLIC_WEB_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:5173` |
| Physical device on LAN | `http://192.168.1.X:5173` |
| Staging / production | `https://routex.app` |

`10.0.2.2` is the emulator's alias for the host machine's loopback — `localhost` inside
an emulator points at the emulator itself, which is the single most common cause of a
blank screen.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| `userInterfaceStyle: "light"` | iOS chrome does not follow the app's dark mode | Set to `"automatic"` |
| `expo-image-picker` permissions not declared | iOS/Android capture may fail | Add via the Expo config plugin or `app.json` |
| `READ_EXTERNAL_STORAGE` is deprecated | Fails on Android 13+ | Use `READ_MEDIA_IMAGES` |
| `predictiveBackGestureEnabled: false` | Loses the Android 14 predictive back gesture | Re-enable once the custom `BackHandler` is reconciled |
| No `splash` configuration | The splash icon asset is unused | Add the `splash` block to `app.json` |
| `adaptiveIcon.backgroundImage` and `monochromeImage` are present but the artwork is the default template | The app icon is not RouteX-branded | Replace with the RouteX mark — see [`../assets/README.md`](../assets/README.md) |
| `EXPO_PUBLIC_API_URL` defaults to a hardcoded LAN IP | The app breaks on any other network | Use a relative path or a configurable default |
| No `eas.json` | EAS builds are not configured | Add a project ID and build profiles for release |
| No `eas` config in the repo | Over-the-air updates are unavailable | Add `eas.json` when OTA is needed |
