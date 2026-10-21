# Mobile Design System — Colour

The mobile token system is richer than the web's. It defines **25 semantic roles per
theme** as TypeScript objects rather than CSS variables, because React Native has no CSS
cascade.

**Source of truth:** `mobile/src/theme/colors.ts`

---

## Raw palette

```ts
export const COLORS = {
  navy:       '#142B3B',
  navyDark:   '#0D1E2A',
  teal:       '#087F8C',
  tealLight:  '#E6F4F6',
  offWhite:   '#F7F9FA',
  white:      '#FFFFFF',
  amber:      '#F2B544',
  amberLight: '#FEF7E6',
  red:        '#D64545',
  redLight:   '#FDF0F0',
  green:      '#27865B',
  greenLight: '#EAF6F0',
  slate:      '#667784',
  slateLight: '#94A3B8',
  border:     '#DCE4E8',
};
```

The brand cores — navy `#142B3B`, teal `#087F8C`, off-white `#F7F9FA` — are **identical to
the web app**, so the two platforms read as one product.

---

## Semantic token comparison

| Role | Light | Dark | Web equivalent |
|---|---|---|---|
| `background` | `#F7F9FA` | `#0B161E` | ✅ Same |
| `surface` | `#FFFFFF` | `#142533` | ✅ Same |
| `surfaceCard` | `#FFFFFF` | `#12202C` | Mobile-only |
| `surfaceSubtle` | `#F0F4F7` | `#1C3144` | Mobile-only |
| `border` | `#DCE4E8` | `#2A4356` | Mobile-only |
| `borderSubtle` | `#E2E8F0` | `#1F3445` | Mobile-only |
| `textPrimary` | `#142B3B` | `#F1F5F9` | ✅ Same |
| `textSecondary` | `#4A5D6E` | `#94A3B8` | Mobile-only |
| `textMuted` | `#667784` | `#64748B` | Mobile-only |
| `headerBg` | `#142B3B` | `#081118` | Mobile-only |
| `headerText` | `#FFFFFF` | `#FFFFFF` | ✅ Same |
| `teal` | `#087F8C` | `#2DD4BF` | Lightened in dark |
| `tealDark` | `#06626C` | `#087F8C` | Mobile-only |
| `tealLight` | `#E6F4F6` | `#13353A` | Mobile-only |
| `navy` | `#142B3B` | `#142B3B` | ✅ Same |
| `navyDark` | `#0D1E2A` | `#070D12` | Mobile-only |
| `amber` | `#F2B544` | `#FBBF24` | Lightened in dark |
| `amberLight` | `#FEF7E6` | `#3D3114` | Mobile-only |
| `red` | `#D64545` | `#F87171` | Lightened in dark |
| `redLight` | `#FDF0F0` | `#3B1818` | Mobile-only |
| `green` | `#27865B` | `#34D399` | Lightened in dark |
| `greenLight` | `#EAF6F0` | `#133827` | Mobile-only |
| `slate` | `#667784` | `#94A3B8` | Mobile-only |
| `white` | `#FFFFFF` | `#FFFFFF` | ✅ Same |
| `cardShadow` | `rgba(20,43,59,0.08)` | `rgba(0,0,0,0.4)` | Mobile-only |
| `tabBarBg` | `#FFFFFF` | `#0E1C27` | Mobile-only |
| `tabBarBorder` | `#DCE4E8` | `#1E3342` | Mobile-only |

### The three-step surface scale

```
Light                          Dark
──────────────────────        ──────────────────────
surfaceCard  #FFFFFF          surfaceCard  #12202C
surface      #FFFFFF          surface      #142533
surfaceSubtle #F0F4F7         surfaceSubtle #1C3144
```

The mobile app adds a **third** surface step the web does not have, because cards sit on
cards far more often in a scrolling native feed. `surfaceCard` (`#12202C`) is slightly
darker than `surface` (`#142533`) in dark mode so a card reads as raised.

---

## Dark mode accent lightening

The web lightens the accent to `teal-400`. Mobile uses a **different, warmer teal**:

| Token | Light | Dark | Note |
|---|---|---|---|
| Accent | `#087F8C` | `#2DD4BF` | Teal-400, not the Tailwind `teal-400` (`#2DD4BF` — same value) |
| Warning | `#F2B544` | `#FBBF24` | Amber-400 |
| Danger | `#D64545` | `#F87171` | Red-400 |
| Success | `#27865B` | `#34D399` | Emerald-400 |

All four are the Tailwind 400 step — a consistent rule: **in dark mode, every saturated
token lightens to the 400 step.**

---

## Hazard category colours

Defined in `mobile/src/constants/hazardTypes.ts`, with explicit light and dark badge fills —
the web derives these from Tailwind classes at build time, so the mobile version is the
source of truth for native.

| Category | Colour | Light fill | Dark fill | Icon |
|---|---|---|---|---|
| `flooding` | `#087F8C` | `#E0F2FE` | `#0C2E42` | `Droplets` |
| `pothole` | `#F2B544` | `#FEF3C7` | `#3F2C0B` | `CircleDot` |
| `blocked_road` | `#D64545` | `#FEE2E2` | `#441414` | `TriangleAlert` |
| `fallen_tree` | `#27865B` | `#D1FAE5` | `#0E3B24` | `TreePine` |
| `other` | `#667784` | `#F1F5F9` | `#1E293B` | `CircleHelp` |

The **marker colours are identical to the web**, but the badge fills differ: mobile uses
explicit hex values (Tailwind 100/200-equivalent) while the web uses Tailwind utility
classes like `bg-blue-100`. The hues are close but not identical — worth reconciling.

---

## Report status colours

`getStatusColor(status, isDark)` returns a `{ bg, text, border }` triple per theme.

| Status | Light bg | Light text | Light border | Dark bg | Dark text | Dark border |
|---|---|---|---|---|---|---|
| `community_confirmed` | `#E6F4F6` | `#087F8C` | `#B2E2E8` | `#0C353B` | `#2DD4BF` | `#115E59` |
| `under_review` | `#FEF7E6` | `#B45309` | `#FDE68A` | `#3D2F12` | `#FBBF24` | `#78350F` |
| `resolved` | `#EAF6F0` | `#27865B` | `#A7F3D0` | `#113524` | `#34D399` | `#065F46` |
| `rejected` | `#FDF0F0` | `#D64545` | `#FECACA` | `#3B1515` | `#F87171` | `#7F1D1D` |
| `reported` | `#F1F5F9` | `#475569` | `#CBD5E1` | `#1E293B` | `#94A3B8` | `#334155` |

Each status gets a **three-stop treatment** — tinted background, saturated text, and a
mid-tone border. The border is what makes the badge legible on a busy card.

### The amber contrast fix

`under_review` uses `#B45309` in light mode, not the raw `#F2B544`. The same rule the web
follows: **amber is a fill colour, never a text colour on light surfaces.**

---

## Status badge rendering

```tsx
<Text style={[styles.statusText, { color: statusColors.text }]}>
  {(hazard.status || 'reported').replace('_', ' ').toUpperCase()}
</Text>
```

The status is uppercased and the underscore replaced with a space, so `community_confirmed`
renders as `COMMUNITY CONFIRMED`. The web uses the server's `status_display` string
instead — a small divergence in how the same data is presented.

| | Web | Mobile |
|---|---|---|
| Source | `hazard.status_display` (server) | `hazard.status` (client-transformed) |
| Case | Title case | UPPERCASE |
| Style | Tinted pill with border | Tinted pill with border |

---

## Brand tokens

```ts
export const BRAND = {
  name: 'RouteX',
  tagline: 'Know the Road Ahead.',
  team: 'NextGen',
};
```

The wordmark and tagline are **not hardcoded in components** — they are read from `BRAND`.
The web, by contrast, hardcodes the tagline string in several places. The mobile approach
is cleaner and should be adopted on the web.

---

## Where tokens are used

| Pattern | Tokens |
|---|---|
| Card surface | `surfaceCard`, `border`, `cardShadow` |
| Chip / pill | `surfaceSubtle`, `borderSubtle` |
| Bottom nav | `tabBarBg`, `tabBarBorder` |
| Header | `headerBg`, `headerText`, `border` |
| Primary button | `teal` on white text |
| Category badge | category `color` + `lightBg`/`darkBg` |
| Status badge | `getStatusColor()` |
| Confirmation chip | `tealLight` fill, `teal` border and text |
| Error surface | `red` on `redLight` |
| Advisory surface | `amber` on `amberLight` |

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Theme choice is not persisted | Resets to the system scheme on every launch | Persist to `AsyncStorage` or `expo-secure-store` |
| Category badge fills differ from the web | The same category looks slightly different on each platform | Derive both from one shared token file |
| Status label casing differs | `Community Confirmed` (web) vs `COMMUNITY CONFIRMED` (mobile) | Pick one casing |
| Status label source differs | Web uses server `status_display`; mobile transforms the raw value | Use `status_display` on both |
| Some colours are hardcoded inline | e.g. `isDark ? '#1C3144' : '#1D3B50'` in `AppHeaderNative` | Replace with theme tokens |
| `navyDark` `#0D1E2A` is unused in themes | Raw palette drift | Remove or apply |
| `COLORS` raw palette is only used by legacy components | New components use `theme.*` | Migrate the legacy screens |
