# Brand — Logo

## Mark

The RouteX mark is a **map pin containing a road**, which encodes both halves of the
product: location awareness and the road surface itself.

### Construction

| Element | Specification |
|---|---|
| Canvas | `viewBox="0 0 48 48"`, 48 × 48 |
| Pin body | Teardrop path, `fill="url(#routex-logo-grad)"` |
| Road stroke | White, `stroke-width="5.6"`, `stroke-linecap="round"`, an S-curve running from the pin tip upward |
| Lane dashes | Teal `#087F8C`, `stroke-width="1.2"`, `stroke-dasharray="2.4 2.2"` — drawn over the white road to read as centre-line markings |
| Destination waypoint | White filled circle `r="3.6"` with a teal inner dot `r="1.6"`, at `cx="24.4" cy="11"` |

### Gradient

A linear gradient at 135° across the pin gives the flat mark a small amount of depth
without introducing a second hue into the brand.

| Stop | Offset | Colour |
|---|---|---|
| Start | 0% | `#0AA3B3` |
| End | 100% | `#087F8C` |

### Sizes

| Token | Dimensions | Usage |
|---|---|---|
| `sm` | `w-6 h-6` (24px) | Dense inline contexts |
| `md` | `w-8 h-8` (32px) | **Default** — app header, form headers, footer |
| `lg` | `w-10 h-10` (40px) | Auth pages (login, register, password reset) |
| `xl` | `w-12 h-12` (48px) | Reserved for large empty/hero placements |

The mark is `shrink-0` at all sizes and always paired with a `gap-2.5` (10px) from
adjacent text.

## Wordmark

The wordmark is **not** a separate asset — it is set in type so it stays crisp and
localised:

| Part | Specification |
|---|---|
| "RouteX" | `font-extrabold text-base tracking-tight` |
| Tagline | `text-[10px]` — *"Know the Road Ahead."* |
| Header context | White on navy header |
| Light context | `#142B3B`, tagline `#667784` |

Lockup options exposed by the `RouteXLogo` component:

| Prop | Behaviour |
|---|---|
| `showText` | `false` (mark only), `true` (mark + wordmark) |
| `showTagline` | Adds the tagline line; requires `showText` |
| `size` | `sm` \| `md` \| `lg` \| `xl` |
| `className` | Appended to the flex wrapper for alignment overrides |

## Accessibility

The inline SVG carries `role="img"` and `aria-label="RouteX Logo"`. The favicon is
linked as both `rel="icon"` and `rel="apple-touch-icon"` so iOS home-screen installs
receive a proper icon rather than a screenshot.

## Do / Don't

**Do**
- Keep clear space of at least one pin-width around the mark.
- Use `md` or larger whenever the logo sits in a header or authentication card.
- Keep the gradient definition id (`routex-logo-grad`) stable if the SVG is inlined more
  than once on a page.

**Don't**
- Recolour the pin. The teal gradient is the brand.
- Remove the white road stroke — it is what makes the mark legible at 24px.
- Place the mark on a mid-tone photographic background; it needs a flat navy, white, or
  off-white field.
- Replace the road with a straight line; the S-curve is the differentiator.
