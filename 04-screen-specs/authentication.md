# Screen — Authentication

Four related screens share one shell: **Login** (`/login`), **Register** (`/register`),
**Forgot Password** (`/forgot-password`), and **Reset Password** (`/reset-password`).

**Components:** `frontend/src/pages/LoginPage.jsx`, `RegisterPage.jsx`,
`ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`

---

## Shared layout

```
min-h-screen bg-[#F7F9FA] dark:bg-[#0B161E] flex flex-col
├── AppHeader
└── main — flex-1 flex items-center justify-center p-4 py-12
    └── div — w-full max-w-md
```

| Property | Value |
|---|---|
| Card width | `max-w-md` (448px) |
| Card style | `bg-white dark:bg-[#142533] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm` |
| Text | `#142B3B` / `slate-100` |

A single 448px column keeps the form to one short, scannable column. Wider forms would put
the action button far from the inputs on desktop.

## Shared card anatomy

1. **Logo** — centred, `RouteXLogo size="lg"`, `mb-3`
2. **Title** — `text-xl font-bold`, centred
3. **Subtitle** — `text-xs text-[#667784] dark:text-slate-400`, centred, `mt-1`
4. **Error alert** (conditional)
5. **Form** — `space-y-4`
6. **Footer links** — centred, `text-xs`

---

## Login (`/login`)

**Title:** "Sign in to RouteX"
**Subtitle:** "Access community reporting and manage your hazard submissions."

### Fields

| Field | Type | Placeholder | Attributes |
|---|---|---|---|
| Username or Email address | `text` | "e.g. adetola or user@example.com" | `autoComplete="username"`, `required` |
| Password | `password` | — | `required` |

Password visibility is toggled with `Eye` / `EyeOff` icons inside the field's right edge.

### Field styling

| Property | Value |
|---|---|
| Input | `w-full text-xs p-3 bg-[#F7F9FA] dark:bg-[#1B3142] border border-[#DCE4E8] dark:border-slate-700 rounded-lg` |
| Focus | `focus:border-[#087F8C] focus:bg-white dark:focus:bg-[#152735]` |
| Label | `text-xs font-semibold mb-1` |

### Redirect behaviour

`nextDestination = searchParams.get("next") || "/map"`

After a successful login the user is sent to `?next=` if present, otherwise `/map`. This
means a deep link into a gated flow resumes correctly — signing in from
`/login?next=/report` lands the user on the report form they were trying to reach.

### Validation and errors

| Condition | Message |
|---|---|
| Empty fields (client) | "Please enter your username (or email) and password." |
| API `detail` | Server message, displayed verbatim |
| Other failure | "Unable to sign in. Please verify your credentials and connection." |

Errors render as a red alert above the form:
`mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:text-[#D64545]
dark:text-red-800 dark:border-red-800 rounded-lg text-xs flex items-start gap-2`.

### Footer

A "Sign In" / "Register" pair appears in the mobile drawer when signed out. A back link
with `ArrowLeft` returns users toward the map.

---

## Register (`/register`)

**Title:** "Create your RouteX account"
**Subtitle:** "Join your community to report and confirm road hazards."

### Fields

| Field | Type | Notes |
|---|---|---|
| Username | `text` | `autoComplete="username"`, `required` |
| Email address | `email` | `autoComplete="email"`, `required`, format validation on blur |
| Password | `password` | `autoComplete="new-password"`, `required`, eye toggle |
| Confirm password | `password` | `autoComplete="new-password"`, `required`, eye toggle |

Client-side checks cover required fields, email format, password presence, and password
match before submission.

### Trust note

The register card explains what an account enables — reporting, confirming, and flagging —
plus the platform's moderation model, since a new user is making a judgement about
handing over personal data.

### Server contract

Registration always assigns `role="citizen"`. Role elevation is only possible through the
protected admin API. This is worth stating in the UI so users understand that creating an
account never grants elevated access.

---

## Forgot Password (`/forgot-password`)

**Title:** "Reset your password"
**Subtitle:** "Enter the email or username linked to your RouteX account."

A single input plus a submit action. On success the card replaces itself with a
confirmation state that **does not reveal whether the account exists** — this prevents
account enumeration.

The neutral confirmation reads approximately: *"If an account matches those details, a
reset link has been sent. Check your inbox."*

A back link returns to login.

---

## Reset Password (`/reset-password`)

**Title:** "Choose a new password"
**Subtitle:** "Your new password will be used the next time you sign in."

| Field | Type | Notes |
|---|---|---|
| New password | `password` | `autoComplete="new-password"`, eye toggle |
| Confirm new password | `password` | `autoComplete="new-password"`, eye toggle |

A guidance note recommends a strong, unique password. On success the user is returned to
the login screen with a confirmation.

---

## Shared interaction patterns

### Password visibility toggle

`Eye` / `EyeOff` icons in a button at the field's right edge, with an `aria-label`
stating the action. Toggling preserves the field's value and focus.

### Submit loading state

The submit button replaces its label with a `Loader2 animate-spin` spinner and disables
itself (`disabled:opacity-50`). The label text changes from the action verb to a gerund
("Signing in…", "Creating account…", "Sending reset link…").

### Field validation timing

Errors appear on submit rather than on every keystroke, then clear as soon as the field
becomes valid. Validating per-keystroke is noisy while a user is still typing a username
or email.

### Error differentiation

Three classes of error are treated distinctly:

| Class | Presentation |
|---|---|
| Field validation | Inline red text beneath the field |
| Form-level (auth, rate limit) | Red alert above the form |
| Unexpected / network | Generic reassurance copy with a retry path |

---

## Accessibility notes

| Requirement | Implementation |
|---|---|
| Labels | Every input has a real `<label htmlFor>` |
| Required fields | `required` attribute plus a visible red `*` |
| Autofill | Correct `autoComplete` tokens on every field |
| Focus | Visible teal focus border on every field |
| Password visibility | Toggle button with an `aria-label` |
| Errors | Announced with `AlertCircle` icons, not colour alone |
| Minimum target | All controls are comfortably above 44 × 44px on touch |
