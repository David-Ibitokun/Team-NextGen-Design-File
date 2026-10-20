# Authentication & Access Control

## Four access tiers

| Tier | Backend enforcement | Frontend mirror |
|---|---|---|
| **Anonymous visitor** | `AllowAny` / `IsAuthenticatedOrReadOnly` | No session; browse freely |
| **Registered citizen** | `IsCitizen` | `isAuthenticated` |
| **Moderator** | `IsModeratorUser` / `IsModeratorOrAdmin` | `isModerator` |
| **Administrator** | `IsPlatformAdmin` | `isAdmin` |

**The backend is the only security boundary.** The frontend's route guards redirect
unauthorised users for UX, but every endpoint independently enforces its own permission
class — a user editing the JavaScript bundle still receives `403`.

---

## Why session cookies, not JWT

| Property | Session cookie (chosen) | JWT (rejected) |
|---|---|---|
| Revocation | ✅ Server-side flush is immediate | ❌ Valid until expiry |
| Stolen token recovery | ✅ Admin can invalidate the session | ❌ No revocation mechanism |
| Storage | HttpOnly cookie, invisible to JS | Usually `localStorage`, XSS-readable |
| CSRF protection | ✅ Required and implemented | N/A (header-based) |
| Horizontal scaling | Needs shared session store | Stateless |
| Expiry control | ✅ `logout()` destroys server state | Fixed `exp` claim |

RouteX is a civic accountability platform: the ability to revoke a moderator's or citizen's
access immediately after a compromise outweighs statelessness. The trade-off — a shared
cache or sticky sessions for multi-instance deployment — is the correct one here.

---

## CSRF protection

Every state-changing request (POST, PATCH, DELETE) requires a CSRF token.

### Flow

```
  1. GET /api/v1/auth/csrf/
        │
        ▼  Sets csrftoken cookie + returns { csrfToken }
  2. POST /api/v1/auth/login/
        X-CSRFToken: <token>
        Cookie: csrftoken=<token>
        │
        ▼
  3. Session cookie set; subsequent mutations reuse both
```

The frontend's Axios client has a CSRF interceptor that reads the token and attaches it
automatically.

### Why it matters here

Session cookies are sent automatically by the browser, so without CSRF protection **any
site a user visits could submit hazard reports, confirm hazards, or — critically — perform
admin role changes on their behalf**. For a platform with moderation authority, that is a
serious attack surface.

### Trusted origins

```python
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:8000",  "http://127.0.0.1:8000",
]
```

Under `DEBUG=True`, wildcard patterns are added for LAN subnets (`192.168.*`, `10.*`,
`172.16–31.*`) and `*.local`, plus any explicit `LAN_IP` — so a developer can test on a
phone. **This is development-only and must not ship.**

---

## Session lifecycle

### Registration → auto-login

```python
user = serializer.save()
login(request, user)
```

A successful registration **starts a session immediately** — no separate login call is
needed. The `201` response body is the user object, and the session cookie is set.

### Login

Two-step credential resolution:

```python
user = authenticate(request, username=username_or_email, password=password)
if user is None and "@" in username_or_email:
    matched_user = User.objects.get(email__iexact=username_or_email)
    user = authenticate(request, username=matched_user.username, password=password)
```

Django's `authenticate` only matches usernames, so an email lookup is attempted as a
fallback. `User.DoesNotExist` and `User.MultipleObjectsReturned` are both caught — a
duplicate-email database would fail the login rather than raise a `500`.

### Session resolution

`GET /auth/me/` resolves the current session. The frontend treats a failure as an expected
guest state, not an error — anonymous browsing is the default and must not raise an error
banner.

### Logout

```python
logout(request)
return Response({"detail": "Successfully logged out."})
```

Django's `logout()` flushes the session server-side and deletes the cookie. The frontend
additionally clears local state regardless of network outcome, so a user who requests sign
out always ends up signed out on their device.

---

## Rate limiting

Anonymous throttles, applied per IP.

| Endpoint | Class | Rate | Scope |
|---|---|---|---|
| `POST /auth/login/` | `LoginRateThrottle` | **10 / minute** | `login` |
| `POST /auth/register/` | `RegisterRateThrottle` | **5 / hour** | `register` |
| `POST /auth/password-reset/` | `PasswordResetRateThrottle` | **10 / minute** | `password_reset` |

All three extend `AnonRateThrottle`, so authenticated users are not limited on these
endpoints.

### Rationale

| Endpoint | Attack prevented |
|---|---|
| Login 10/min | Credential stuffing and brute force |
| Register 5/hr | Automated account creation and spam reporting |
| Reset 10/min | Reset-email flooding / mail bombing a victim |

### Password reset cooldown

An additional per-email cooldown enforced via the Django cache:

```python
PASSWORD_RESET_COOLDOWN_SECONDS = 120
cache_key = f"pwd_reset_cooldown_{email}"
```

While active, the endpoint returns `429` with `{"detail": "Please wait N seconds...", "retry_after": N}`.
This is **per email address** rather than per IP, because IP throttling alone cannot stop
an attacker rotating IPs to flood one victim's inbox.

---

## Password policy

Enforced by four Django validators, applied at registration and reset:

| Validator | Rule |
|---|---|
| `UserAttributeSimilarityValidator` | Password must not resemble the username or email |
| `MinimumLengthValidator` | Minimum length |
| `CommonPasswordValidator` | Blocks commonly-used passwords |
| `NumericPasswordValidator` | Blocks entirely numeric passwords |

Serializer-level minimum: **8 characters** for both `password` and `new_password`.

---

## Password reset

### Request

```
POST /auth/password-reset/  { "email": "user@example.com" }
```

1. Validate the email format
2. Check the 2-minute per-email cooldown → `429` if active
3. Set the cooldown
4. Look up active users by case-insensitive email
5. For each match, generate a signed token and send the email
6. Return a **uniform** `200`

### Anti-enumeration

The response is identical whether or not the account exists:

> "If an account with that email address exists, a password reset link has been sent to
> your inbox."

Distinguishing the two cases would let anyone enumerate registered addresses — a privacy
leak in a platform where users are identifiable by location.

### Token

```python
uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
token  = default_token_generator.make_token(user)
reset_url = f"{frontend_url}/reset-password?uid={uidb64}&token={token}"
```

Django's `default_token_generator` produces a signed, time-limited, one-time token. Its
validity is `PASSWORD_RESET_TIMEOUT` (default **86400s = 24 hours**), matching the 24-hour
window stated in the reset email.

### Validate then confirm

Two separate endpoints so the frontend can check the link before showing the new-password
form:

| Endpoint | Purpose |
|---|---|
| `POST|GET /auth/password-reset/validate/` | Check the token without consuming it |
| `POST /auth/password-reset/confirm/` | Apply the new password |

Both return `400` with `"This password reset link is invalid or has expired. Please request
a new one."` for an invalid uid, an unknown user, an inactive user, or a bad token.

On success the confirm endpoint calls `set_password()`, which re-hashes — the raw password
is never stored.

---

## Password reset email

Sent as `EmailMultiAlternatives` with both a plain-text and an HTML alternative, so it
renders correctly in clients that block HTML.

### Branding

| Element | Treatment |
|---|---|
| Logo | Inline CID attachment when `static/routex-email-logo.png` exists, else base64 data URI, else an inline SVG fallback of the exact brand mark |
| Header | `#142B3B` with white "RouteX" at 24px/800 and the "Know the Road Ahead" tagline at 11px uppercase |
| CTA | Teal gradient `linear-gradient(135deg, #0AA3B3, #087F8C)` with a teal shadow |
| Container | 580px, 20px radius, dark page background `#0E1A24` |
| Responsive | `@media (max-width: 600px)` collapses the CTA to full width |

**Three-tier logo fallback** is notable engineering: the CID attachment works in most
clients, base64 covers the rest, and the inline SVG guarantees the brand mark always
appears even when the logo file is absent.

### Security messaging

The email states the 24-hour expiry and explicitly reassures recipients:

> "Didn't request this? You can safely ignore this email. Your current password remains
> secure and will not change."

This is important for a civic platform — an unexpected password-reset email should not
alarm someone into thinking their account is being attacked.

### Mailer defaults

| Environment | Backend |
|---|---|
| Test | `locmem.EmailBackend` |
| `DEBUG=True` | `console.EmailBackend` — printed to the terminal |
| Production | Configured SMTP (Brevo relay by default) |

---

## Role assignment

### Registration

```python
UserProfile.objects.create(user=user, display_name=display_name, role="citizen")
```

**Hardcoded.** Public registration can never create a moderator or admin. Privilege
escalation is only possible through the admin endpoint, which requires admin rights and
writes an audit entry.

### Admin role change

`PATCH /admin/users/{id}/role/` with an optional `reason`, which:

1. Refuses self-demotion (`400`)
2. Sets `profile.role`
3. Syncs `is_staff = True` for moderator/admin, `False` for citizen
4. Writes a `ROLE_CHANGE` audit entry

> ⚠️ The API declares `reason` as `required=False, allow_blank=True`, while the frontend
> design makes it mandatory. The accountability guarantee is currently UI-only.

---

## Role resolution

Two layers must agree: what the API returns, and what the frontend infers.

### Backend (`UserPublicSerializer.get_role`)

```python
if obj.is_superuser:
    return "admin"
try:
    role = obj.profile.role
    if role in ["admin", "moderator", "citizen"]:
        return role
    if obj.is_staff:
        return "moderator"
    return "citizen"
except UserProfile.DoesNotExist:
    return "moderator" if obj.is_staff else "citizen"
```

Precedence: `is_superuser` → explicit `profile.role` → `is_staff` → default `citizen`.
Missing profiles degrade gracefully rather than raising.

### Frontend (`AuthContext`)

```js
isAdmin     = user && (user.is_superuser || user.role === "admin")
isModerator = user && (user.is_superuser || user.is_staff
                       || role === "moderator" || role === "admin")
isCitizen   = Boolean(user)
```

### Comparison

Both treat superuser as admin and staff as at-least-moderator, and the frontend treats an
admin as also a moderator — matching the backend, where `IsModeratorUser` returns `True`
for `profile.role == "admin"`.

---

## Permission classes

### `IsCitizen`

```python
return bool(request.user and request.user.is_authenticated)
```

Any authenticated user passes. Denies anonymous visitors.

### `IsModeratorUser`

```python
if not (request.user and request.user.is_authenticated): return False
if request.user.is_superuser or request.user.is_staff: return True
return request.user.profile.role in ["moderator", "admin"]
```

Three paths to moderator access — superuser, Django staff, or explicit profile role.

### `IsPlatformAdmin`

```python
if not (request.user and request.user.is_authenticated): return False
if request.user.is_superuser: return True
return request.user.profile.role == "admin"
```

Deliberately stricter than `IsModeratorUser`: **staff status alone is not sufficient.**
A Django staff user who is not a superuser and has no admin profile role is denied.

### `IsModeratorOrAdmin` (in `moderation/views.py`)

```python
if request.user.is_staff or request.user.is_superuser: return True
return request.user.profile.role in ["moderator", "admin"]
```

Logically identical to `IsModeratorUser`. **Duplicated implementation** — see
[known issues](permissions.md#known-issues).

---

## Self-protection safeguards

| Safeguard | Guard | Message |
|---|---|---|
| Self-demotion | `target_user.pk == request.user.pk and new_role != "admin"` | "You cannot remove administrative privileges from your own active session." |
| Self-deletion | `target_user.pk == request.user.pk` | "You cannot delete your own active administrative account." |
| Last superuser | `superuser_count <= 1` | "Cannot delete the sole remaining superuser account." |

Three independent locks against an administrator locking themselves — and therefore the
whole platform — out of administration. Defence in depth: the frontend prevents the UI
action, and the backend enforces it regardless.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| `IsModeratorOrAdmin` duplicates `IsModeratorUser` | Two implementations of the same rule can drift | Consolidate into one class |
| Role-change `reason` is optional server-side | The mandatory-rationale accountability rule is UI-only | Set `required=True` on the serializer |
| `Confirmation.session_key` is never populated | Guest confirmation deduplication is unimplemented | Either populate it or remove the field |
| `allow_anonymous_map_view` is not enforced | An admin can disable anonymous browsing, but reads stay public | Gate `HazardReportViewSet` on the setting, or remove it |
| Throttles apply only to anonymous users | An authenticated user can call login/register unmetered | Add `UserRateThrottle` or scope these with `ScopedRateThrottle` |
| Password reset uses a local-memory cache by default | The cooldown is per-process, so multi-instance deploys get inconsistent enforcement | Configure a shared cache backend |
| `DEBUG=True` sets `CORS_ALLOW_ALL_ORIGINS = True` | Insecure by design | Ensure `DEBUG=False` in every deployed environment |
| A default `SECRET_KEY` is present in source | Anyone with the repo can forge signed tokens in a deployment that forgets to set the variable | Require the env var at startup when `DEBUG=False` |
