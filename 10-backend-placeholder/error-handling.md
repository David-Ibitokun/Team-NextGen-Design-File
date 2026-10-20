# Error Handling & Validation

---

## Response formats

| Status | Format | Meaning |
|---|---|---|
| `400` | Field-keyed object, or `{"detail": "..."}` | Validation failed or business rule violated |
| `401` | `{"detail": "...", "code": "not_authenticated"}` | No valid session |
| `403` | `{"detail": "...", "code": "permission_denied"}` | Authenticated but insufficient role |
| `404` | `{"detail": "..."}` | Resource does not exist |
| `429` | `{"detail": "...", "retry_after": N}` | Rate limited or cooldown active |
| `500` | Django debug page or DRF default | Unhandled server error |

### Two error shapes

**Serializer validation** — field-keyed, suitable for inline form errors:

```json
{
  "username":   ["This username is already taken."],
  "password":   ["This password is too common."],
  "description": ["Please provide at least 5 characters describing the road hazard."]
}
```

The frontend maps these keys directly to fields. `ReportHazardForm` sets
`setErrors(err.response.data)`, which places each array value under its field.

**Hand-written responses** — `{"detail": "..."}`, used by custom `api_view` functions:

```json
{ "detail": "You have already confirmed this hazard report." }
```

The frontend reads `err.response?.data?.detail` for these, falling back to a generic
message.

---

## Validation messages

### Registration — `UserRegistrationSerializer`

| Field | Message |
|---|---|
| `username` | "This username is already taken." |
| `email` | "An account with this email already exists." |
| `password` | Django validator messages (common, numeric, too similar, too short) |
| `password_confirm` | "Passwords do not match." |
| `username` length | "Ensure this field has at least 3 characters." |

Uniqueness checks are **case-insensitive** (`username__iexact`, `email__iexact`); email is
lowercased before storage.

### Login — `UserLoginSerializer`

| Condition | Status | Message |
|---|:---:|---|
| Missing field | `400` | "This field is required." |
| Wrong credentials | `401` | "Invalid credentials. Please check your username/email and password." |

The credential failure is deliberately vague — confirming which of username or password was
wrong would help an attacker.

### Password reset

| Condition | Status | Message |
|---|:---:|---|
| Any email | `200` | "If an account with that email address exists, a password reset link has been sent to your inbox." |
| Invalid email format | `400` | "Enter a valid email address." |
| Cooldown active | `429` | "Please wait N seconds before requesting another reset email." + `retry_after` |
| Invalid/expired token | `400` | "This password reset link is invalid or has expired. Please request a new one." |
| Mismatched passwords | `400` | `{"new_password_confirm": "Passwords do not match."}` |

### Hazard report — `HazardReportSerializer`

| Field | Message |
|---|---|
| `category` | "Invalid category 'x'. Choose from: flooding, pothole, blocked_road, fallen_tree, other." |
| `description` (< 5) | "Please provide at least 5 characters describing the road hazard." |
| `description` (> 1000) | "Description cannot exceed 1000 characters." |
| `location_label` (> 150) | "Location label cannot exceed 150 characters." |
| `latitude` | "Latitude must be between -90.0 and 90.0 degrees." / "Latitude must be a valid decimal number." |
| `longitude` | "Longitude must be between -180.0 and 180.0 degrees." |
| `photo` | See [media-and-uploads.md](media-and-uploads.md) |

The category message enumerates valid values, which is helpful for API consumers and
harmless since the frontend uses fixed tiles.

Descriptions and location labels are **stripped** before validation, so whitespace-only input
fails the 5-character minimum rather than passing it.

### Confirm

| Condition | Status | Message |
|---|:---:|---|
| Already confirmed | `400` | "You have already confirmed this hazard report." |
| Not authenticated | `401` | "Authentication credentials were not provided." |

### Flag

| Condition | Status | Message |
|---|:---:|---|
| Pending flag exists | `400` | "You have already submitted a pending flag for this report." |

`reason` defaults to `"other"` when omitted, so flagging never fails for a missing reason.

### Moderation action

| Condition | Status | Message |
|---|:---:|---|
| Short reason | `400` | `{"reason": ["Ensure this field has at least 3 characters."]}` |
| Invalid action | `400` | `{"action": ['"x" is not a valid choice."]}` |
| Report not found | `404` | "Report not found." |

### Platform settings

| Field | Message |
|---|---|
| `confirmation_threshold` | "Confirmation threshold must be between 1 and 20." |
| `freshness_hours` | "Freshness threshold must be between 1 and 168 hours (7 days)." |
| `max_upload_size_mb` | "Max upload size must be between 1 and 25 MB." |

### Admin role change and deletion

| Condition | Status | Message |
|---|:---:|---|
| Self-demotion | `400` | "You cannot remove administrative privileges from your own active session." |
| Self-deletion | `400` | "You cannot delete your own active administrative account." |
| Last superuser | `400` | "Cannot delete the sole remaining superuser account." |
| User not found | `404` | "User not found." |
| Duplicate email on profile update | `400` | "This email is already in use by another account." |

---

## Silent error handling

Some failures are deliberately swallowed rather than surfaced.

### Malformed `bbox`

```python
if bbox:
    try:
        parts = [p.strip() for p in bbox.split(",")]
        if len(parts) == 4:
            west, south, east, north = [Decimal(p) for p in parts]
            queryset = queryset.filter(...)
    except Exception:
        pass
```

A malformed bounding box returns the **unfiltered** list rather than a `400`. The map would
otherwise break entirely when given a bad viewport parameter. The tradeoff: a typo silently
widens the result set instead of erroring.

### Incomplete coordinate bounds

```python
if all(v is not None for v in [min_lat, max_lat, min_lng, max_lng]):
    queryset = queryset.filter(...)
```

Individual bounds apply only when **all four** are present. Supplying three is silently
ignored — safer than applying a partial filter that would produce a wrong map region.

### Password reset email delivery

```python
try:
    msg.send(fail_silently=False)
except Exception as exc:
    logger.error("Failed to send password reset email to %s: %s", user.email, exc)
```

A mail-send failure is logged but the endpoint still returns the uniform `200`. This
**preserves account non-enumeration** — returning an error only when the account exists
would defeat the entire purpose of the uniform response.

### WebP conversion

```python
except Exception:
    return image_field
```

If conversion fails, the original file is used. A compression failure must never block a
hazard report.

### Profile creation

```python
profile, _ = UserProfile.objects.get_or_create(user=user)
```

Self-heals a user missing a profile rather than raising `DoesNotExist`.

---

## Rate limiting

| Endpoint | Rate | Scope | Status on breach |
|---|---|---|:---:|
| `POST /auth/login/` | 10/min | `login` | `429` |
| `POST /auth/register/` | 5/hour | `register` | `429` |
| `POST /auth/password-reset/` | 10/min | `password_reset` | `429` |

DRF returns `{"detail": "Request was throttled. Expected available in N seconds."}` on the
standard throttle responses.

The password-reset cooldown adds a `429` with `retry_after` before the IP throttle is even
consulted, since it is the more specific protection.

---

## Frontend error handling

| Status | UI response |
|---|---|
| `400` (serializer) | Field-keyed errors set inline; clears as fields become valid |
| `400` (detail) | `err.response.data.detail` displayed in the form alert |
| `400` (other) | "Please correct the highlighted fields and try submitting again." |
| `401` / `403` | Action-specific prompt, e.g. "Please sign in to confirm this road hazard." |
| `404` | `ErrorState` with retry |
| Network failure | "We could not load road hazards. Check your connection or try again." |
| `429` | Not yet handled in the frontend — the `retry_after` body is ignored |

### Three error classes treated distinctly

| Class | Presentation |
|---|---|
| Field validation | Inline red text beneath the field |
| Form-level (auth, business rule) | Red alert above the form with an icon |
| Network / unexpected | Generic reassurance copy with a retry path |

Naming the specific problem is more useful than a generic failure — a user who was signed
out knows to sign in; a user on a train knows to wait.

---

## Logging

| Event | Level | Message |
|---|:---:|---|
| Reset email sent | INFO | "Password reset email successfully dispatched to {username} ({email})" |
| Reset email failed | ERROR | "Failed to send password reset email to {email}: {exc}" |
| Reset completed | INFO | "Password reset successfully completed for user {username}" |

Using `logger = logging.getLogger(__name__)` gives module-scoped loggers. Email
delivery failures are logged with the recipient address — note that this writes an email
address to logs, which may warrant redaction under a privacy policy.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| `429` not handled in the frontend | A throttled login or registration shows a generic error | Surface `retry_after` with a countdown |
| Malformed `bbox` silently ignored | A typo widens results rather than erroring | Log the parse failure at debug level |
| Incomplete bounds silently ignored | Three of four bounds does nothing | Return `400` listing the missing parameter |
| Account existence inferable via timing | The uniform response is constant, but email-send time varies | Queue emails asynchronously, or send at a fixed delay |
| Email addresses in logs | Privacy consideration | Redact or use a structured logger with a policy |
| Unhandled `MultipleObjectsReturned` on login | Caught, but silently — a duplicate-email DB fails all logins by that address | Enforce email uniqueness at the database level |
