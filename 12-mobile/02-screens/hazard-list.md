# Mobile Screen — Hazard List

**Components:** `mobile/src/components/HazardFiltersNative.tsx`,
`mobile/src/components/HazardCardNative.tsx`,
`mobile/src/components/HazardSkeletonNative.tsx`

The primary data surface. A filterable feed of community hazard reports.

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ AppHeaderNative                                               │
├──────────────────────────────────────────────────────────────┤
│  [All Hazards (12)] [Flooding] [Pothole] [Blocked] …         │  ← horizontal scroll
│  Status: [All] [Reported] [Under Review] [Confirmed] …       │  ← horizontal scroll
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Flooding]              [COMMUNITY CONFIRMED]          │  │
│  │ 📍 Lekki-Epe Expressway, KM 14                          │  │
│  │ Heavy flash flood covering both inner lanes…            │  │
│  │ ─────────────────────────────────────────────────────  │  │
│  │ 🕐 14:30, 18 Oct                    [👍 14]              │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ …                                                      │  │
├──────────────────────────────────────────────────────────────┤
│  Map          (+) Report          Hazards                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Filter bar

`HazardFiltersNative` — background `theme.surface`, `borderBottomWidth: 1`,
`theme.border`, `paddingVertical: 10`.

### Category pills

A horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`,
`paddingHorizontal: 16`, `gap: 8`.

| Element | Value |
|---|---|
| Pill padding | `14` horizontal, `6` vertical |
| Radius | `20` (fully rounded) |
| Border | `1px` |
| Label | `fontSize: 12`, `fontWeight: '600'` |

| State | Background | Border | Text |
|---|---|---|---|
| "All Hazards" active | `theme.teal` | `theme.tealDark` | white |
| Category active | `cat.color` | `cat.color` | white |
| Category inactive (light) | `cat.lightBg` | `#CBD5E1` | `#142B3B` |
| Category inactive (dark) | `cat.darkBg` | `#2E4C66` | `#E2E8F0` |

The first pill reads **"All Hazards (N)"** with the live count, matching the web's
"All categories (N)".

> **Difference from the web:** the web's filter chips are all uniform slate, with the
> category colour appearing only in badges. The mobile version tints each pill with its
> category colour when unselected. This is more colourful but arguably less consistent —
> the category colour now carries two meanings (type and filter state).

### Status pills

A second horizontal `ScrollView` below the category row, preceded by a "Status:" label.

| Element | Value |
|---|---|
| Label | `fontSize: 11`, `fontWeight: '600'`, `theme.textMuted` |
| Pill padding | `10` horizontal, `3` vertical |
| Radius | `12` |
| Pill gap | `6` |

| State | Background | Border | Text |
|---|---|---|---|
| Active (light) | `#E6F4F6` | `theme.teal` | `theme.teal` |
| Active (dark) | `#1C3144` | `theme.teal` | `theme.teal` |
| Inactive | `transparent` | `theme.borderSubtle` | `theme.textMuted` |

Active also raises weight from `400` to `700`.

> **Difference from the web:** the web uses a native `<select>` for status; mobile uses
> pills. Pills are the correct native choice — a select dropdown is slow and hard to hit
> on a phone.

---

## Hazard card

`HazardCardNative` — the whole card is one `TouchableOpacity` with `activeOpacity={0.8}`.

| Property | Value |
|---|---|
| Padding | `14` |
| Radius | `12` |
| Border | `1px`, `theme.border` |
| Margin-bottom | `12` |
| Background | `theme.surfaceCard` |
| Elevation | `2`, shadow `0, 1` at `0.1` opacity, radius `3` |

### Row 1 — category badge and status badge

```
[💧 Flooding]                    [COMMUNITY CONFIRMED]
```

**Category badge**

| Property | Value |
|---|---|
| Layout | Icon + label, `gap: 5` |
| Padding | `8` horizontal, `4` vertical |
| Radius | `12` |
| Border | `1px`, `cat.color` |
| Icon | `13px`, `cat.color` |
| Label | `fontSize: 11`, `fontWeight: '700'` |
| Fill | `cat.lightBg` (light) · `cat.darkBg` (dark) |
| Text | `#142B3B` (light) · `#E2E8F0` (dark) |

| Category | Icon |
|---|---|
| Flooding | `Droplets` |
| Pothole | `CircleDot` |
| Blocked road | `TriangleAlert` |
| Fallen tree | `TreePine` |
| Other | `CircleHelp` |

**Status badge**

| Property | Value |
|---|---|
| Padding | `7` horizontal, `2` vertical |
| Radius | `8` |
| Border | `1px`, `statusColors.border` |
| Fill | `statusColors.bg` |
| Label | `fontSize: 9`, `fontWeight: '700'`, `letterSpacing: 0.4` |
| Text | `statusColors.text` |

The label is `hazard.status.replace('_', ' ').toUpperCase()` — so `community_confirmed`
renders as `COMMUNITY CONFIRMED`.

### Row 2 — location

```
📍 Lekki-Epe Expressway, KM 14
```

| Property | Value |
|---|---|
| Icon | `MapPin` at `14`, `theme.teal` |
| Label | `fontSize: 13`, `fontWeight: '700'`, `theme.textPrimary` |
| Gap | `5` |
| Truncation | `numberOfLines={1}` |

Falls back to coordinates when there is no `location_name`:
`Lat: 6.4428, Lng: 3.4839` — matching the web's 4-decimal fallback exactly.

### Row 3 — description

`fontSize: 12`, `lineHeight: 18`, `theme.textSecondary`, `numberOfLines={3}`, `marginBottom: 10`.

The web truncates to **2 lines**; mobile allows **3**. A taller card on a phone is
acceptable because the card is already the full width.

### Row 4 — footer

A hairline top border (`theme.borderSubtle`) separates the footer.

**Timestamp**

| Property | Value |
|---|---|
| Icon | `Clock` at `12`, `theme.textMuted` |
| Format | `toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })` |
| Fallback | "Recently" for an invalid date |
| Style | `fontSize: 11`, `theme.textMuted` |

The web uses `toLocaleString("en-GB")` with the full date, year, hour, and minute. The
mobile card is tighter, so it drops the year and seconds. `toLocaleTimeString` with an
empty locale array follows the **device** locale, which is better for a native app.

**Confirm chip**

| Property | Value |
|---|---|
| Layout | `ThumbsUp` at `12` + count, `gap: 5` |
| Padding | `9` horizontal, `4` vertical |
| Radius | `14` |
| Border | `1px`, `theme.teal` |
| Fill | `#E6F4F6` (light) · `#13353A` (dark) |
| Icon & text | `theme.teal` |
| Label | `fontSize: 11`, `fontWeight: '700'` |

The count defaults to `1` when `confirmations_count` is undefined: `{hazard.confirmations_count ?? 1}`.

> **Note:** the web shows the raw count (`0` when there are none). The mobile default of
> `1` means a brand-new report appears to have one confirmation. The web's behaviour is
> more honest.

> **Gap:** the mobile card has **no confirm action handler** wired to the API. `onConfirm`
> is passed from `App.tsx`, but `handleConfirm` there only increments the local count —
> it does not POST to `/api/v1/hazards/{id}/confirm/`. The web does call the API.

---

## States

### Loading — skeleton

`HazardListSkeletonNative count={4}`.

`HazardCardSkeletonNative` mirrors the real card's geometry exactly:

| Element | Size | Shape |
|---|---|---|
| Category pill | `90 × 22` | `radius 11` |
| Status badge | `65 × 18` | `radius 6` |
| Location icon | `14 × 14` | `radius 7` (circle) |
| Location bar | `70% × 14` | `radius 4` |
| Description line 1 | `100% × 11` | `radius 4` |
| Description line 2 | `85% × 11` | `radius 4` |
| Timestamp bar | `80 × 12` | `radius 4` |
| Confirm pill | `45 × 22` | `radius 11` |

A shared `Animated.Value` pulses all the blocks in unison between `0.30` and `0.85`
opacity over `850ms` each way, with `useNativeDriver: true`. The highlight colour is
`#E2E8F0` (light) · `#2E4354` (dark).

**One animation value drives every block** — a single pulse across the whole card reads
as one object loading, rather than many independent flickers.

### Empty

```tsx
<ShieldCheck size={44} color={theme.teal} style={{ marginBottom: 12 }} />
<Text style={styles.emptyTitle}>No Hazards Found</Text>
<Text style={styles.emptySubtitle}>…</Text>
```

| Element | Value |
|---|---|
| Icon | `ShieldCheck` at `44`, `theme.teal` |
| Title | `fontSize: 16`, `fontWeight: '800'`, `theme.textPrimary` |
| Subtitle | `fontSize: 13`, `lineHeight: 18`, `theme.textMuted`, centred |
| Container | `flex: 1`, centred, `padding: 32`, `marginTop: 40` |

The subtitle is context-aware:

| Condition | Copy |
|---|---|
| A filter is active | "No reports match the selected filters." |
| No filter | "Great news! All monitored routes are currently clear." |

> **Difference from the web:** the web's empty state offers a **"Report a hazard"** action
> button. The mobile empty state has no action. Adding one would close the loop —
> a user who finds no hazards should be able to report one immediately.

### Refreshing

`RefreshControl` with `refreshing`, `onRefresh`, `colors={[theme.teal]}` (Android),
`tintColor={theme.teal}` (iOS).

The skeleton is suppressed during a refresh (`loading && !refreshing`), so the existing
list stays visible while the spinner pulls down.

---

## List container

| Property | Value |
|---|---|
| Component | `FlatList` |
| Padding | `16` all round, `24` bottom |
| Item margin | `12` bottom |
| `keyExtractor` | `String(item.id)` |

A `FlatList` (not `ScrollView`) is the correct choice — it virtualises long hazard lists,
which matters on low-end Android devices.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Confirm does not call the API | The count increments locally only | Wire `handleConfirm` to the confirm endpoint |
| Confirmation count defaults to 1 | New reports appear to have a confirmation | Default to `0` |
| Empty state has no report action | The user must find the FAB themselves | Add a "Report a hazard" button |
| No demo-data indicator | Seeded data is indistinguishable from live | Add an `is_demo` badge as the web does |
| No freshness/stale indicator | The web marks reports older than 2 days as stale | Add a `FreshnessBadge` equivalent |
| Description truncates at 3 lines vs the web's 2 | Minor visual inconsistency | Align at 2 |
| `onPress` on the card is not wired | The card does nothing when tapped | Open a detail sheet |
| No image display | Hazards with photos look identical to those without | Show `photo_url` as a thumbnail |
