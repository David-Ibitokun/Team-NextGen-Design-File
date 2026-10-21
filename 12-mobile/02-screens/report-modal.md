# Mobile Screen — Report Modal

**Component:** `mobile/src/components/ReportModalNative.tsx`

The mobile contribution flow. Unlike the web form — which requires tapping a map to place
a pin — the native app offers **preset corridors**, making reporting a two-tap action.

---

## Layout

A native `Modal` with a scrollable form.

```
┌──────────────────────────────────────────────────────────────┐
│  [logo]  Report a Road Hazard                          [ ✕ ]  │  ← sticky header
├──────────────────────────────────────────────────────────────┤
│  Share timely road conditions to help fellow road users.      │
│                                                              │
│  Hazard category *                                           │
│  ┌────────┐ ┌────────┐ ┌────────┐                            │
│  │💧 Flood│ │⊙ Poth. │ │⚠ Block│                            │
│  └────────┘ └────────┘ └────────┘                            │
│  ┌────────┐ ┌────────┐                                      │
│  │🌲 Tree │ │? Other │                                      │
│  └────────┘ └────────┘                                      │
│                                                              │
│  Location *                                                   │
│  [ Lekki-Epe      ] [Ikeja / Maryland ] [Victoria Island]   │  ← corridor chips
│  [ Third Mainland ] [Surulere ]                             │
│  📍 6.442800, 3.483900                                      │
│                                                              │
│  Description *                              0/1000          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Optional photo evidence                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📷  Select or capture a photo                       │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                          [Cancel]  [Submit report]           │  ← sticky footer
└──────────────────────────────────────────────────────────────┘
```

---

## The corridor picker — the key mobile decision

The web requires tapping a map to place a pin. That is a poor interaction on a phone:
precise tapping is hard with a thumb, and the embedded map is a scroll hazard.

The native app instead offers **five preset Lagos corridors**:

| Corridor | Latitude | Longitude | Landmark |
|---|---|---|---|
| Lekki-Epe | `6.4428` | `3.4839` | Lekki-Epe Expressway near Chevron |
| Ikeja / Maryland | `6.5721` | `3.3672` | Ikorodu Road, Maryland Underpass |
| Victoria Island | `6.4355` | `3.4211` | Ozumba Mbadiwe Avenue near Civic Centre |
| Third Mainland | `6.4674` | `3.3982` | Third Mainland Bridge, Adeniji Adele Ramp |
| Surulere | `6.5012` | `3.3582` | Western Avenue, Ojuelegba Flyover |

Selecting a corridor sets the coordinates **and** pre-fills the location name with its
landmark — but only if the field is still empty, so a user's own text is never
overwritten.

**Design rationale:** a commuter reporting a hazard on Third Mainland Bridge does not
need to drop a pin — they need to say *which* corridor, and the app fills in the
coordinates. This removes the single hardest step in the web flow.

> **Limitation:** this is Lagos-specific. The platform's architecture is
> coordinate-based and city-agnostic, but the corridor presets are hardcoded. A
> city-agnostic version would need corridors fetched from the API, or a hybrid of
> presets plus an optional manual picker.

---

## Category selection

A grid of tiles, one per category.

| Property | Value |
|---|---|
| Icon | `16px` |
| Icon colour | `theme.teal` when selected · `#94A3B8` / `#64748B` when not |
| Default | `flooding` |

| Category | Icon |
|---|---|
| Flooding | `Droplets` |
| Pothole | `CircleDot` |
| Blocked road | `TriangleAlert` |
| Fallen tree | `TreePine` |
| Other | `CircleHelp` |

The web form uses the same five icons in the report form — the mobile and web report
flows use **identical category icons**, which is a good consistency win.

---

## Photo capture

Uses **`expo-image-picker`** with a native action sheet.

### Source selection

```ts
Alert.alert('Attach Photo Evidence', 'Take a new photo or select from your camera roll:', [
  { text: 'Camera', onPress: ... },
  { text: 'Photo Library', onPress: ... },
  { text: 'Cancel', style: 'cancel' },
]);
```

| Source | Permission requested | Launcher |
|---|---|---|
| Camera | `ImagePicker.requestCameraPermissionsAsync()` | `launchCameraAsync({ allowsEditing: true, quality: 0.8 })` |
| Library | `ImagePicker.requestMediaLibraryPermissionsAsync()` | `launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })` |

Permission denial produces a clear `Alert`:

> **Permission Denied** — Camera permission is required to capture photos.
> **Permission Denied** — Media library permission is required to select photos.

> **Note:** `expo-image-picker` is listed in `package.json` but **not** in the `app.json`
> `ios.infoPlist` or `android.permissions` blocks. The iOS camera and photo-library usage
> descriptions *are* declared (for the WebView path), but `expo-image-picker` normally
> requires its own `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` entries
> plus an iOS `Info.plist` key. Expo config plugins usually inject these automatically,
> but this should be verified with a real iOS build.

### Photo quality

`quality: 0.8` at capture time. The web app compresses to WebP at quality `0.82` after
downscaling to 1600px; the native path relies on the picker for compression.

> **Gap:** the native app does **not** convert to WebP client-side, unlike the web. The
> filename defaults to `hazard_capture.webp` but the underlying file may still be JPEG.
> The server converts on save, so the invariant holds — but the upload is larger than it
> needs to be.

---

## Validation and submission

### Client-side validation

Only one rule is enforced before submitting:

```
description.trim().length < 5
  → "Please describe what road condition commuters should avoid (minimum 5 characters)."
```

> **Difference from the web:** the web validates category, description length (5–1000),
> location label length, and coordinates. The mobile app validates the description only —
> the 1000-character maximum, the 150-character location limit, and the coordinate
> requirement are all unvalidated.

### Submit

```ts
await submitHazard({
  category,
  description: description.trim(),
  location_name: locationName.trim() || 'Reported Location',
  latitude,
  longitude,
  photoUri: photoUri || undefined,
});
```

`location_name` falls back to `'Reported Location'` when empty, so the API never receives
a blank location.

### Success state

```ts
setIsSuccess(true);
setTimeout(() => { resetForm(); onSuccess(); }, 1400);
```

The success state renders for **1400ms** before the modal closes and the list reloads.
The web uses 1200ms. Both use a delay so the confirmation is perceived before the view
changes.

---

## Error handling

| Condition | Message |
|---|---|
| Network or server failure | "We could not save the report right now. Please check your network and try again." |
| Description too short | "Please describe what road condition commuters should avoid (minimum 5 characters)." |

Failures never clear the form — the user's category, corridor, description, and photo all
survive so a correction does not mean re-entering anything.

---

## Form reset

`resetForm()` restores every field to its initial state:

| Field | Reset value |
|---|---|
| Category | `flooding` |
| Location name | `''` |
| Description | `''` |
| Latitude | `6.4531` |
| Longitude | `3.3958` |
| Active corridor | `null` |
| Photo | `null` |
| Server error | `''` |
| Success | `false` |

It is called on close and on successful submission.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Only the description is validated | Over-length descriptions and labels reach the server | Mirror the web's validation rules |
| No character counter | The 1000-character limit is invisible | Add a live counter as the web does |
| No WebP conversion | Larger uploads than the web | Convert client-side, as `imageOptimizer.js` does |
| No map picker fallback | A user outside Lagos cannot place a custom point | Add a manual coordinate entry or an API-driven corridor list |
| `expo-image-picker` permissions not declared in `app.json` | iOS builds may fail on capture | Verify the config plugin injects the usage strings |
| No `KeyboardAvoidingView` | The keyboard can cover the description field | Wrap the scroll body |
| Modal has no explicit `animationType` | Platform default | Consider `slide` for a bottom-sheet feel |
| No demo-data guard | A demo submission would be indistinguishable | The API assigns `is_demo=false` for real submissions |
