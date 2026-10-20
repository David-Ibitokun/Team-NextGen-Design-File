# Media & Photo Uploads

Photographic evidence is optional but central to RouteX: a photo is often the difference
between a credible report and a vague one. The upload pipeline is therefore optimised for
the constraint that matters most — **contributors are usually on mobile data**.

---

## Upload specification

| Property | Value |
|---|---|
| Field | `photo` on `HazardReport` |
| Storage path | `hazards/%Y/%m/` — year and month sharded |
| Optional | ✅ Yes — a report is valid without a photo |
| Max size | `MAX_UPLOAD_SIZE_MB` env var, default **5 MB** |
| Allowed extensions | `jpg`, `jpeg`, `png`, `webp` |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Output format | **WebP** (always) |

### Accepted client-side

The report form's file input accepts:

```
image/jpeg, image/png, image/webp, image/heic, image/*
```

`image/heic` is accepted by the browser picker because iPhones capture HEIC — but the
backend only allows jpeg/png/webp extensions. A HEIC file would pass the picker and fail
server validation, or fail client-side conversion first (the `catch` in `handlePhotoChange`
falls back to the original file, which the server then rejects).

> **Recommendation:** either add HEIC conversion server-side via Pillow, or remove
> `image/heic` from the input's `accept` attribute so users are not offered a format that
> cannot succeed.

---

## Validation

`validate_hazard_photo` in `hazards/validators.py` runs three checks.

### 1. Size

```python
max_mb = getattr(settings, "MAX_UPLOAD_SIZE_MB", 5)
max_bytes = max_mb * 1024 * 1024
if file_obj.size > max_bytes:
    raise ValidationError(f"Photo file size cannot exceed {max_mb} MB.")
```

### 2. Extension

```python
ext = file_obj.name.split(".")[-1].lower() if "." in file_obj.name else ""
if ext not in ALLOWED_IMAGE_EXTENSIONS:
    raise ValidationError(
        f"Unsupported file format '.{ext}'. Allowed formats: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}.")
```

### 3. Genuine image content

```python
try:
    image = Image.open(file_obj)
    image.verify()
except Exception:
    raise ValidationError("The uploaded file is not a valid or readable image.")
finally:
    if hasattr(file_obj, "seek"):
        file_obj.seek(0)
```

`Image.verify()` checks the file header and structure, so a `.png`-named text file is
rejected. The `finally` block rewinds the pointer — essential, since validation leaves the
file at EOF and the subsequent save would write zero bytes.

> **Note:** `image.verify()` invalidates the image object, so the file must be re-opened for
> the actual processing in `convert_image_to_webp`. The `seek(0)` makes that possible.

---

## WebP conversion

### Server-side — guaranteed

Performed in `HazardReport.save()`:

```python
def save(self, *args, **kwargs):
    if self.photo and hasattr(self.photo, "file") and not getattr(self, "_webp_processed", False):
        ext = os.path.splitext(self.photo.name)[1].lower()
        if ext != ".webp":
            converted = convert_image_to_webp(self.photo)
            if converted:
                self.photo = converted
        self._webp_processed = False  # set to True after
    super().save(*args, **kwargs)
```

| Guard | Purpose |
|---|---|
| `_webp_processed` instance flag | Prevents re-converting on every subsequent save |
| Extension check | An already-`.webp` file is skipped |

**The server guarantees the invariant** regardless of what the client did. This is the right
layer for it — a client-side-only implementation could be bypassed by any HTTP client.

### `convert_image_to_webp`

| Parameter | Value |
|---|---|
| `max_size` | `(1600, 1600)` |
| `quality` | `82` |
| `method` | `6` — slowest, best compression |
| Resampling | `Image.Resampling.LANCZOS` |

#### Downscaling

```python
if img.width > max_size[0] or img.height > max_size[1]:
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
```

`thumbnail()` preserves aspect ratio and only shrinks — a small image is never upscaled.

#### Colour mode handling

```python
if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
    converted = img.convert("RGBA")
else:
    converted = img.convert("RGB")
```

WebP supports alpha, so transparent PNGs are preserved as RGBA. Palette-mode images with a
transparency table are detected and promoted to RGBA, because a naive `RGB` conversion would
render transparency as black.

#### In-memory processing

```python
buffer = io.BytesIO()
converted.save(buffer, format="WEBP", quality=quality, method=6)
buffer.seek(0)
return ContentFile(buffer.getvalue(), name=f"{base_name}.webp")
```

The original file name is preserved with a `.webp` extension, so a report remains traceable
to its upload.

#### Graceful fallback

```python
except Exception:
    if hasattr(image_field, "seek"):
        image_field.seek(0)
    return image_field
```

Any failure returns the original file. A compression failure must never block a hazard
report — the user's safety information matters more than file size.

---

## Client-side compression

Performed in `ReportHazardForm` **before upload**, using `convertToWebP` from
`frontend/src/utils/imageOptimizer.js`.

| Parameter | Value |
|---|---|
| `maxWidth` | 1600 |
| `maxHeight` | 1600 |
| `quality` | 0.82 |

Identical parameters to the server, so client-processed files pass through server
processing unchanged (caught by the `.webp` extension check).

### Why compress on both sides

| Layer | Benefit |
|---|---|
| **Client** | The user waits less — uploading 240 KB instead of 1.2 MB on a weak connection |
| **Server** | Guarantees the invariant; handles API clients that skip compression |

Double compression is not wasteful: a WebP from the client is detected and skipped by the
server.

### Visible to the user

The report form surfaces compression as a benefit rather than a hidden technical step:

| State | Presentation |
|---|---|
| Converting | Spinner — "Optimizing photo to lightweight WebP format..." |
| Complete | Emerald `Sparkles` chip — "WebP Optimized" |
| Result | "(was 1.2 MB, -80%)" with the saving in emerald |

Making the compression visible turns an invisible optimisation into something the user
understands and values — relevant when they are on metered mobile data.

---

## Serving media

### Development

```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

Django serves media itself under `DEBUG=True`.

### The `photo_url` field

```python
def get_photo_url(self, obj):
    if obj.photo:
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url
    return None
```

An absolute URI is built from the request when available, falling back to the relative path.
This keeps the frontend simple — it can use `photo_url` directly in an `<img src>`.

### Proxying in development

The Vite config proxies both paths to the backend:

```js
proxy: {
  "/api":    { target: "http://127.0.0.1:8000" },
  "/media":  { target: "http://127.0.0.1:8000" }
}
```

So in development the frontend and media are same-origin, and `MEDIA_URL` (`/media/`) works
unchanged.

### Production

| Concern | Requirement |
|---|---|
| Media serving | A reverse proxy (nginx) or CDN — **not** Django |
| `DEBUG` | Must be `False` |
| Storage | Local filesystem does not work across multiple instances |
| Uploads directory | Must be writable by the application process |
| Backup | `media/` must be included in backups |

### Service worker interaction

The service worker **explicitly excludes `/api/`** from caching:

```js
if (url.pathname.startsWith("/api/")) {
  return;
}
```

Hazard photos are served from `/media/`, so they are *not* covered by this exclusion.
However, the swizzle-while-revalidate strategy for images means a cached photo could briefly
render after a photo changes. Since photos are effectively immutable once uploaded, this is
acceptable.

> **Recommendation:** exclude `/media/` from caching too. Serving a stale photo of a hazard
> that has been resolved would be a safety-relevant inaccuracy, and storage savings from
> caching user uploads are minimal.

---

## Storage layout

```
backend/media/
└── hazards/
    ├── 2026/
    │   ├── 10/
    │   │   ├── flood_1a2b3c.webp
    │   │   ├── pothole_4d5e6f.webp
    │   │   └── blocked_7g8h9i.webp
    │   └── 11/
    └── 2027/
```

Django's `ImageField` appends a random suffix when a filename collides, so uploads never
overwrite each other. Date sharding keeps directory sizes manageable.

---

## Design rationale

### Why WebP

| Format | Typical phone photo (12 MP) | Browser support |
|---|---:|---|
| JPEG | 3–5 MB | Universal |
| PNG | 8–15 MB | Universal |
| **WebP @ q82** | **0.2–0.5 MB** | All modern browsers |

A typical 80–95% reduction after downscaling to 1600px. For a platform whose users report
hazards from phones on mobile data, this is the difference between a report that completes
and one that times out.

### Why cap at 1600px

| Dimension | Coverage |
|---|---|
| 1600px | Ample for a hazard photo viewed in a 400px detail panel, and for 2× zoom on a 400px display |
| Larger | Wasted bandwidth; no perceptible benefit in any RouteX view |

### Why `method=6`

The slowest and most effective WebP encoding effort. Compression happens once at upload and
the result is served many times, so the extra CPU cost is amortised almost immediately.

### Why photo is optional

Requiring a photo would exclude the highest-value contributors: **passengers and
pedestrians**. Someone crossing a road sees a dangerous pothole but has no hands free. The
design therefore permits a complete report from coordinates and description alone.

The landing page reinforces this in the pledge: *"Never report while driving."*

---

## Known issues

| Issue | Impact | Recommendation |
|---|---|---|
| `image/heic` accepted but unsupported server-side | iPhone users may be offered a format that fails | Add HEIC conversion, or remove it from the input's `accept` |
| Size limit defined in two places | The env var and `PlatformSettings.max_upload_size_mb` can disagree | Consolidate to one source of truth |
| `PlatformSettings.max_upload_size_mb` unenforced | The admin UI setting has no effect | Read the model field in `validate_hazard_photo` |
| No dimension cap at validation | A 50 MP image passes validation, then is downscaled | Reject or downscale before the size check to bound memory use |
| No EXIF stripping | GPS coordinates and device metadata persist in uploads | Strip EXIF, or deliberately keep and disclose it |
| Decompression-bomb risk | A small file declaring huge dimensions could exhaust memory | Set `Image.MAX_IMAGE_PIXELS` |
| `/media/` not excluded from SW caching | A stale photo could render briefly | Exclude `/media/` from the service worker |
| No thumbnail generation | Every list view could download a full-size image | Generate a thumbnail variant alongside the full image |
