# Native Platform — Navigation Security Policy

The RouteX mobile container treats the WebView as a **strict security boundary**. A user
authenticated inside the WebView must not be able to navigate that authenticated context
to an untrusted origin.

**Source:** `mobile/src/navigation/urlPolicy.ts`
**Tests:** `mobile/scripts/test_mobile_policy.js` (10 assertions, all passing)

---

## The threat model

The WebView holds a live session cookie for the RouteX origin. If a link inside the app
could navigate that WebView to an attacker's domain, the attacker's page would inherit
the session context — a classic session-riding vulnerability.

The policy prevents that by classifying every navigation request.

---

## Decision table

`evaluateNavigation(targetUrl, allowedOrigin)` returns:

```ts
{
  allowInWebView: boolean;     // may load inside the authenticated WebView
  handledExternally: boolean;  // delegate to the device's system handler
  reason: string;              // human-readable explanation
}
```

| Input | `allowInWebView` | `handledExternally` | Reason |
|---|:---:|:---:|---|
| Empty URL | ❌ | ❌ | "Empty URL" |
| `about:blank` / `about:blank#` | ✅ | ❌ | "Internal blank initialization" |
| `javascript:` | ❌ | ❌ | "Blocked unsafe protocol: javascript:" |
| `file:` | ❌ | ❌ | "Blocked unsafe protocol: file:" |
| `data:` | ❌ | ❌ | "Blocked unsafe protocol: data:" |
| `vbscript:` | ❌ | ❌ | "Blocked unsafe protocol: vbscript:" |
| `tel:` | ❌ | ✅ | "Delegated to system application: tel:" |
| `mailto:` | ❌ | ✅ | "Delegated to system application: mailto:" |
| `sms:` | ❌ | ✅ | "Delegated to system application: sms:" |
| Any other non-HTTP(S) | ❌ | ❌ | "Blocked non-web protocol: {protocol}" |
| Same origin as `allowedOrigin` | ✅ | ❌ | "Allowed RouteX origin navigation" |
| In `APPROVED_AUTH_ORIGINS` | ✅ | ❌ | "Allowed approved authentication origin" |
| Any other HTTP(S) origin | ❌ | ✅ | "External web link redirected to system browser" |
| Malformed URL | ❌ | ❌ | "Malformed URL rejected: {message}" |

### The two key rules

1. **Only the approved origin may load in the WebView.** Everything else is either
   blocked outright or handed to the system browser.
2. **Insecure schemes are never executed.** `javascript:`, `file:`, `data:`, and
   `vbscript:` are refused — they are the classic vectors for script injection into a
   privileged context.

### Intent schemes are delegated, not blocked

`tel:`, `mailto:`, and `sms:` are handed to the device's handler via `Linking.openURL()`.
Blocking them would break legitimate functions — a road-safety app may well want a
telephone link to an emergency service or a transport authority.

---

## Approved auth origins

```ts
const APPROVED_AUTH_ORIGINS: string[] = [];
```

Currently **empty**, because RouteX uses same-origin session authentication — there is no
OAuth redirect to allow. The escape hatch exists for a future identity provider.

---

## Comparison with the web app

| Concern | Web (PWA) | Mobile |
|---|---|---|
| Authentication | Session cookie + CSRF token | Session cookie (in the WebView) |
| CSRF | Explicit token, sent on every mutation | Not applicable to native calls |
| Origin restriction | `CSRF_TRUSTED_ORIGINS` | `allowedOrigin` from `EXPO_PUBLIC_WEB_URL` |
| Third-party cookies | Not applicable | `thirdPartyCookiesEnabled={false}` |
| Storage isolation | Same origin | `domStorageEnabled` scoped to the origin |
| Mixed content | Browser default | `mixedContentMode="never"` (documented) |

---

## WebView hardening

The documented configuration for the container:

| Setting | Value | Purpose |
|---|---|---|
| `originWhitelist` | The approved RouteX origin | Only that origin may load |
| `thirdPartyCookiesEnabled` | `false` | No cross-site cookies |
| `domStorageEnabled` | `true` | Local storage for the app's own origin |
| `mixedContentMode` | `never` | No HTTP inside HTTPS |
| `allowFileAccess` | `false` | No local file reads |
| `allowUniversalAccessFromFileURLs` | `false` | No cross-origin file access |
| `geolocationEnabled` | `true` | The map's location picker |

> **Important distinction:** the table above is the **documented policy** in
> `mobile/README.md`. The `NativeMapScreen` component's WebView uses a **different,
> looser** configuration, because it hosts an in-memory HTML document rather than the
> RouteX web app:
>
> ```tsx
> originWhitelist={['*']}
> allowFileAccess={true}
> allowUniversalAccessFromFileURLs={true}
> mixedContentMode="always"
> ```
>
> That WebView is not authenticated, so the session-riding risk does not apply — but the
> `*` whitelist is still broader than it needs to be. The `RouteXWebView` component
> (legacy) carries the correct hardened settings.

---

## The test suite

`npm test` runs `scripts/test_mobile_policy.js` — a plain Node script using `assert`,
with no test framework dependency.

| # | Test | Asserts |
|---|---|---|
| 1 | Empty URL | Invalid, handled safely |
| 2 | Unsupported protocol | `ftp://` rejected |
| 3 | Valid URL | Parsed, trailing slashes stripped, origin correct |
| 4 | Internal origin | Allowed in the WebView, not external |
| 5 | `about:blank` | Allowed for initialization |
| 6 | `javascript:` | Blocked |
| 7 | `file:` | Blocked |
| 8 | `tel:` | Delegated externally |
| 9 | External web link | Not loaded in the authenticated WebView; redirected to the system browser |
| 10 | Malformed URL | Rejected |

The test file **re-implements the policy logic** rather than importing it. The tests
therefore verify a copy of the logic, not the shipped implementation — so the two could
drift apart.

> **Recommendation:** import `evaluateNavigation` and `getWebUrlConfig` from
> `src/navigation/urlPolicy.ts` and `src/config/env.ts` into the test script. The
> duplication is the only thing making this suite meaningful today.

---

## Configuration validation

`getWebUrlConfig()` in `src/config/env.ts` validates `EXPO_PUBLIC_WEB_URL`:

| Condition | Valid | `errorMessage` |
|---|:---:|---|
| Empty or whitespace | ❌ | "Missing EXPO_PUBLIC_WEB_URL configuration" |
| Protocol is not HTTP(S) | ❌ | `Unsupported URL protocol: "{protocol}"` |
| No hostname | ❌ | "Invalid URL hostname" |
| Malformed URL | ❌ | `Malformed URL: {message}` |
| Valid | ✅ | — |

On success it returns `origin` (protocol + host + port) and `normalizedUrl` (trailing
slashes removed).

The `origin` is what the navigation policy compares against — so a misconfigured URL
fails at startup rather than silently allowing an unexpected origin.

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| Tests re-implement the policy | The suite can pass while the shipped code breaks | Import the real functions |
| `APPROVED_AUTH_ORIGINS` is empty but hardcoded | No config path for a future IdP | Make it configurable |
| `NativeMapScreen` uses `originWhitelist={['*']}` | Broader than necessary | Restrict to the CDN origins the map needs |
| `mixedContentMode="always"` on the map WebView | Permits HTTP inside HTTPS | Use `"never"` where the map allows it |
| `allowFileAccess` and `allowUniversalAccessFromFileURLs` enabled on the map WebView | Unnecessary local-file access | Disable both |
| `APPROVED_AUTH_ORIGINS` has no comment in the built output | — | — |
| No test for `mailto:` / `sms:` / `vbscript:` / `data:` | Coverage gaps | Add cases for every branch |
| No test for an approved auth origin | The escape hatch is untested | Add a case with a non-empty allowlist |
