# Mobile Assets — App Icons & Splash

The six image assets the RouteX native app ships with.

**Source:** `mobile/assets/`

---

## Inventory

| File | Dimensions | Size | Referenced by | Purpose |
|---|---|---|---|---|
| `icon.png` | 1024 × 1024 | 384 KB | `app.json` → `expo.icon` | The main app icon |
| `android-icon-foreground.png` | 512 × 512 | 76 KB | `app.json` → `android.adaptiveIcon.foregroundImage` | Android adaptive foreground |
| `android-icon-background.png` | 512 × 512 | 17 KB | `app.json` → `android.adaptiveIcon.backgroundImage` | Android adaptive background |
| `android-icon-monochrome.png` | 432 × 432 | 4 KB | `app.json` → `android.adaptiveIcon.monochromeImage` | Android themed-icon layer |
| `favicon.png` | 48 × 48 | 1 KB | `app.json` → `web.favicon` | Web build favicon |
| `splash-icon.png` | 1024 × 1024 | 17 KB | **not referenced** | Unused splash artwork |

### Android adaptive icon layers

Android renders an adaptive icon from up to three layers:

```
┌─────────────────────────┐
│  backgroundImage        │  ← full-bleed 512×512
│    ┌───────────────┐    │
│    │  foreground   │    │  ← 512×512, must keep content
│    │   (the mark)  │    │     inside the 66% safe zone
│    └───────────────┘    │
│  monochromeImage        │  ← 432×432, alpha-only, themed by the OS
└─────────────────────────┘
```

The monochrome layer is tinted by the user's system theme, so it must be a **single-colour
shape on transparency** — no gradients, no colour.

---

## Brand alignment — the assets are not RouteX-branded

**This is the most significant finding in the mobile documentation.**

All six assets are the **default Expo starter template artwork** — a blue arrow-like
"A" glyph on geometric grid backgrounds. They carry:

- ❌ The RouteX teal/navy palette
- ❌ The map-pin-and-road mark
- ❌ The "Know the Road Ahead." tagline
- ❌ Any RouteX identity at all

They are the placeholder icons the Expo template ships with.

### Why this matters

| Surface | Who sees it |
|---|---|
| Home screen | Every user, every launch, on the most visible surface of the device |
| App switcher | Every app switch |
| Android recents | Every app switch |
| Play Store / App Store listing | **Every potential judge and reviewer** |
| Android themed icons | Users who have themed their system |
| Share sheet | Anyone the user shares a link with |
| Web favicon | Browser tabs |

For a hackathon where the app icon is often the first thing a judge sees, shipping the
default Expo template is a meaningful missed opportunity.

---

## Recommended replacements

### The mark

The RouteX mark already exists in vector form and needs no redrawing:

- [`../../02-brand/assets/routex-logo.svg`](../../02-brand/assets/routex-logo.svg) — the teal gradient pin with the white road
- [`../../02-brand/assets/favicon.svg`](../../02-brand/assets/favicon.svg) — the solid teal pin

`RouteXLogoMark.tsx` already reproduces this mark exactly with `react-native-svg`, so the
design work is done — it just needs to be rasterised for the app icons.

### Specification

| Asset | Recommendation |
|---|---|
| `icon.png` | The RouteX mark centred on the `#142B3B` navy, filling ~80% of the canvas |
| `android-icon-foreground.png` | The mark at ~60% scale, with generous transparent padding so Android's mask can crop freely |
| `android-icon-background.png` | Solid `#142B3B` — a flat brand field, matching `adaptiveIcon.backgroundColor` |
| `android-icon-monochrome.png` | The mark's silhouette in solid black on transparency, for OS theming |
| `favicon.png` | The mark at 48 × 48, matching the web PWA's `favicon.svg` |
| `splash-icon.png` | The mark on the navy `#142B3B` background — and actually reference it in `app.json` |

### The foreground safe zone

Android crops adaptive icons to a circle, squircle, or rounded square, and applies
parallax on some launchers. The mark must sit inside the **centre 66%** of the canvas, or
the road detail will be clipped.

The mark is a vertical teardrop — taller than it is wide — so it should be scaled to fit
the safe zone by its **height**, with the tip pointing down toward the viewer.

---

## Other observations

### `splash-icon.png` is unreferenced

`app.json` has no `splash` block, so this file is dead weight in the repo. Either wire it
up or remove it.

```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#142B3B"
}
```

### `icon.png` is unusually large

384 KB for a 1024 × 1024 PNG is heavy for an app icon. iOS re-encodes it during
processing, so this is mostly a repository-size cost rather than a runtime one. A
lossless-optimised PNG or a high-quality JPEG at the same dimensions would be materially
smaller.

### `favicon.png` duplicates the web

The web PWA uses `favicon.svg` (a vector, 964 bytes). The mobile web build uses a
48 × 48 PNG of the default template. Both should be the RouteX mark.

### `backgroundColor` is already correct

`app.json` sets `backgroundColor: "#142B3B"` and `adaptiveIcon.backgroundColor:
"#142B3B"` — both the brand navy. The background layer is therefore the right colour
already; only the foreground and background **images** are wrong.

---

## Regenerating the assets

The RouteX mark is a plain SVG with a single linear gradient. Rasterising it needs no
special tooling:

```bash
# 1024×1024 app icon: mark centred on navy
npx sharp-cli -i routex-logo.svg -o icon.png resize 1024 1024 \
  --background '#142B3B'

# Android monochrome: black silhouette on transparency
npx sharp-cli -i routex-logo.svg -o android-icon-monochrome.png resize 432 432 \
  --background none --flatten false
```

Alternatively, open the SVG in a design tool, set the artboard, and export.

The exact command depends on the team's toolchain — the key point is that the source
vector already exists and no redrawing is required.

---

## Checklist

- [ ] Replace all six assets with RouteX-branded artwork
- [ ] Keep the mark inside Android's 66% safe zone in the foreground layer
- [ ] Make the monochrome layer a single-colour silhouette
- [ ] Add the `splash` block to `app.json` and reference `splash-icon.png`
- [ ] Compress `icon.png` — 384 KB is larger than necessary
- [ ] Match `favicon.png` to the web PWA's `favicon.svg`
- [ ] Verify the icon on a real device, in both light and dark system themes
