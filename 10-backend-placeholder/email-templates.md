# Email Templates

RouteX sends transactional email for password resets. The template carries the full brand
identity into an environment where the application chrome does not exist.

**Source files:**
- `backend/templates/emails/password_reset.html` — HTML alternative
- `backend/templates/emails/password_reset.txt` — plain-text alternative

---

## Why two alternatives

```python
msg = EmailMultiAlternatives(subject, text_content, from_email, [user.email])
msg.attach_alternative(html_content, "text/html")
```

`EmailMultiAlternatives` sends a **MIME multipart** message with both representations.
Clients that block HTML — or users who prefer plain text — get the text version; everything
else gets the branded HTML.

The plain-text version is not optional for a security email: some corporate mail filters
strip or penalise HTML-only messages, which risks a password reset landing in spam.

---

## Branding

The email reuses the application's design tokens exactly.

| Element | Value | Source token |
|---|---|---|
| Page background | `#0E1A24` | `--dark-surface` from the dark mode palette |
| Card background | `#FFFFFF` | `--color-routex-white` |
| Card border | `#1E3445` | Navy family |
| Header background | `#142B3B` | `--color-routex-navy` |
| Wordmark | `#FFFFFF`, 24px, `font-weight: 800`, `letter-spacing: -0.5px` | Header lockup |
| Tagline | `#8BA2B2`, 11px, `font-weight: 600`, `letter-spacing: 1.5px`, uppercase | Header tagline |
| CTA background | `linear-gradient(135deg, #0AA3B3 0%, #087F8C 100%)` | Primary teal hover gradient |
| CTA shadow | `0 4px 14px rgba(8, 127, 140, 0.35)` | Teal at 35% |
| H1 | `#142B3B`, 20px, `font-weight: 700` | Section headline role |
| Body text | `#334A5B` / `#4A5D6B` | Navy family |
| Muted text | `#667784` | `--color-routex-slate` |
| Alert icon bg | `#E6F6F8` with `#087F8C` glyph | Teal tint |
| Link colour | `#087F8C` | `--color-routex-teal` |
| Container | 580px max-width, 20px radius | Auth card width |

**Every colour is drawn from the design system.** The email is the same brand as the
application, not a separate marketing design.

---

## Logo — three-tier fallback

The template resolves the logo through three paths, in order:

```django
{% if logo_cid %}
  <img src="cid:{{ logo_cid }}" />              ← 1. Inline CID attachment
{% elif logo_base64 %}
  <img src="data:image/png;base64,{{ logo_base64 }}" />  ← 2. Embedded data URI
{% elif logo_url %}
  <img src="{{ logo_url }}" />                  ← 3. Remote URL
{% else %}
  <svg width="48" height="48" viewBox="0 0 48 48">…</svg>   ← 4. Inline SVG
{% endif %}
```

And the view populates the context:

```python
logo_path = os.path.join(settings.BASE_DIR, "static", "routex-email-logo.png")
if os.path.exists(logo_path):
    with open(logo_path, "rb") as f:
        logo_bytes = f.read()
        logo_b64 = base64.b64encode(logo_bytes).decode("ascii")

context = {
    "logo_cid": "routex_logo" if logo_bytes else "",
    "logo_base64": logo_b64,
    "logo_url": f"{frontend_url}/routex-logo.png",
}
```

With the MIME attachment:

```python
mime_img = MIMEImage(logo_bytes, _subtype="png")
mime_img.add_header("Content-ID", "<routex_logo>")
mime_img.add_header("Content-Disposition", "inline", filename="routex-logo.png")
msg.attach(mime_img)
```

| Tier | Mechanism | Why |
|---|---|---|
| 1. CID attachment | `Content-ID: <routex_logo>` | Referenced as `cid:routex_logo` — no external request, blocked by no privacy filter |
| 2. Base64 data URI | `data:image/png;base64,…` | Survives clients that strip CID references |
| 3. Remote URL | `{frontend_url}/routex-logo.png` | Last resort before inline |
| 4. **Inline SVG** | The exact brand mark paths | **Always works**, even with no logo file present |

The fourth tier embeds the same SVG paths as `RouteXLogo.jsx` — the identical pin, road
stroke, lane dashes, and waypoint circles. **The brand mark can never fail to render.**

---

## Content structure

| Section | Content |
|---|---|
| Logo | The brand mark, centred, 56×56 |
| Wordmark | "RouteX" with the "Know the Road Ahead" tagline |
| H1 | "Password Reset Request" |
| Greeting | "Hello **{user_name}**," |
| Body | "We received a request to reset the password for your RouteX account linked to **{user_email}**…" |
| CTA | "Reset My Password →" — teal gradient button |
| Fallback | "Button not working? Copy and paste this URL into your browser:" + monospace link |
| Security note | 24-hour expiry |
| Reassurance | "Didn't request this? You can safely ignore this email. Your current password remains secure and will not change." |
| Footer | "RouteX • Community Road Hazard Intelligence" · "Team NextGen • Know the Road Ahead" · "This is an automated security notification. Replies are not monitored." |

### Greeting fallback

```python
display_name = user.profile.display_name  # may not exist
user_name = display_name or user.username or "there"
```

Three-level fallback ensures the greeting is never blank.

---

## Security messaging

### Expiry is stated

> **Link Expiry:** This password reset link is time-sensitive and valid for **24 hours**.
> After that, you will need to request a new link.

Matches `PASSWORD_RESET_TIMEOUT` (default 86400s). A stated window reduces support requests
and makes the token's time-bounded nature explicit.

### Reassurance for unexpected requests

> **Didn't request this?** You can safely ignore this email. Your current password remains
> secure and will not change.

This is a meaningful piece of copy for a civic platform. Users are identifiable by
location, so an unexpected password-reset email could otherwise alarm someone into thinking
their account is under attack. The copy reassures without weakening security — the token is
inert unless used.

### Non-interactive notice

> "This is an automated security notification. Replies are not monitored."

Sets expectations and reduces replies to an unmonitored address.

---

## Responsive design

```css
@media only screen and (max-width: 600px) {
  .responsive-table   { width: 100% !important; max-width: 100% !important; }
  .responsive-padding { padding: 24px 20px !important; }
  .header-padding     { padding: 28px 20px !important; }
  .btn-container      { width: 100% !important; }
  .btn-link           { display: block !important; padding: 14px 20px !important; }
}
```

| Class | Desktop | Mobile |
|---|---|---|
| `.responsive-table` | 580px max | 100% |
| `.responsive-padding` | 40px 44px | 24px 20px |
| `.header-padding` | 36px 40px | 28px 20px |
| `.btn-container` | Intrinsic | 100% width |
| `.btn-link` | Inline | Block, full width |

### Email CSS compatibility

```css
body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td           { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img                 { -ms-interpolation-mode: bicubic; border: 0; outline: none; }
```

These prevent iOS text inflation and Outlook.com table spacing artefacts — the two most
common email rendering problems.

### Table layout

The entire email uses nested `<table role="presentation">`. Outlook does not support
`display: flex` or `grid`, and table-based layout is the only reliably supported approach.

### Colour scheme hints

```html
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
```

These let a client in dark mode apply native dark treatment. The email is designed for light
mode, so this is an enhancement rather than a requirement.

---

## Delivery configuration

| Environment | Backend | Behaviour |
|---|---|---|
| Test | `locmem.EmailBackend` | Captured in `django.core.mail.outbox` for assertions |
| `DEBUG=True` | `console.EmailBackend` | Printed to the terminal |
| Production | Configured SMTP | Brevo relay by default |

| Setting | Default |
|---|---|
| `EMAIL_HOST` | `smtp-relay.brevo.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USE_TLS` | `True` (STARTTLS) |
| `EMAIL_USE_SSL` | `False` |
| `EMAIL_TIMEOUT` | `30` seconds |
| `DEFAULT_FROM_EMAIL` | `EMAIL_HOST_USER` or `noreply@routex.org` |

Port 587 with STARTTLS rather than 465 with implicit SSL — the more widely supported
configuration for transactional relays.

---

## Delivery logging

| Outcome | Level | Message |
|---|:---:|---|
| Success | INFO | "Password reset email successfully dispatched to {username} ({email})" |
| Failure | ERROR | "Failed to send password reset email to {email}: {exc}" |

Failures are caught per-recipient so one bad address does not abort the whole request, and
the endpoint still returns the uniform `200` — preserving account non-enumeration.

---

## The reset URL

```python
reset_url = f"{frontend_url}/reset-password?uid={uidb64}&token={token}"
```

| Component | Value |
|---|---|
| `frontend_url` | `FRONTEND_URL` env var, default `http://localhost:5173`, `.rstrip("/")` applied |
| Path | `/reset-password` — a **frontend** route, not a backend one |
| `uid` | `urlsafe_base64_encode(force_bytes(user.pk))` |
| `token` | `default_token_generator.make_token(user)` |

Pointing at the frontend means the user lands on a styled RouteX screen rather than a raw
API response — the reset form is part of the application, not a server page.

The token is signed and time-limited by Django, valid for `PASSWORD_RESET_TIMEOUT`.

---

## Design principles applied

| Principle | Implementation |
|---|---|
| Brand consistency | Every colour and the exact logo SVG come from the design system |
| Works without images | Four-tier logo fallback ending in inline SVG |
| Works without HTML | Multipart with a plain-text alternative |
| Works without CSS | Table layout, inline styles, mobile overrides |
| Security is explained | Expiry stated; unexpected-request reassurance |
| Never reveals account existence | Uniform `200` regardless of delivery outcome |

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| `EMAIL_BACKEND` must be set explicitly in production | Without it, `DEBUG=False` defaults to SMTP with empty credentials and all mail fails silently | Document and validate at startup |
| Email addresses written to logs | Privacy consideration under a platform where users are location-identifiable | Redact or adopt a structured logging policy |
| `TEST_RESET_EMAIL` is defined but unused | A documented override that does nothing | Implement or remove |
| No unsubscribe or preference link | Not required for transactional mail, but worth documenting | Add a privacy notice link to the footer |
| Static `color-scheme` hint vs dark-native rendering | Dark-mode clients may invert a light-designed email | Test in Outlook and Apple Mail dark mode |
| No plain-text copy of the security note confirmed | The text alternative should carry the same reassurance | Verify `password_reset.txt` includes expiry and reassurance |
| Deleted users receive no notice | An email to a deactivated address is attempted then fails silently | Filter on `is_active=True` (already done) and log |
