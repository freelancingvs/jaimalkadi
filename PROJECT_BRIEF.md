# Project Brief — Dynamic Link Generator & Landing Page System

## Overview

This is a **single Next.js application** — one codebase, one Vercel deployment. No separate backend. No external database accounts. Everything is self-contained:

- **`/` route** → Public branded landing page (hero section, full viewport)
- **`/login` route** → Admin login page
- **`/dashboard` route** → Protected admin dashboard (only accessible when logged in)
- **`/s/[slug]` routes** → Public shareable pages generated per card
- **Next.js API routes** → Handle all data operations using Vercel KV and Vercel Blob

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (full-stack, App Router) |
| Hosting | Vercel |
| Database | Vercel KV (built-in Redis, no extra setup) |
| File Storage | Vercel Blob (built-in, for audio uploads) |
| Auth | Simple credential check via Next.js middleware (no third-party auth) |
| Styling | Tailwind CSS |

---

## Roles

### 1. Admin (You)
- Log in at `/login` with credentials
- Access dashboard to create, view, and manage cards
- Only logged-in admin can see the card list and Create button
- Sign out returns you to the landing page `/`

### 2. Visitor (Public)
- Sees only the landing page hero section at `/`
- No links, no navigation, no card list visible
- Can only access a card via its direct shareable URL `/s/[slug]`

---

## Dummy Credentials (for development)

```
Username: Admin
Password: @12345
```

Store these in a `.env.local` file:
```
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=@12345
```

---

## Page & Flow Breakdown

### 1. Landing Page `/`
- Full 100vh × 100vw hero section
- Branded design (visuals to be provided separately)
- **Top right corner:**
  - If NOT logged in → show **Login** link → goes to `/login`
  - If logged in → show **Sign Out** button + **Create** CTA button
- Logged-in admin also sees a **list of all created cards** displayed below the hero section
- Visitors see nothing below the hero — the card list is only visible to the admin

---

### 2. Login Page `/login`
- Simple centered login form
- Fields: Username, Password
- On successful credential match → redirect to `/` (landing page)
- On failure → show inline error message
- Auth is handled via a session cookie set by a Next.js API route

---

### 3. Dashboard Behaviour (on Landing Page when logged in)
- Top right corner shows: **[Create]** button + **[Sign Out]** link
- Below the hero section: list of all cards created so far (title, type, slug, copy link button)
- Sign Out clears the session cookie and keeps the user on `/`

---

### 4. Create Modal
- Triggered by clicking the **Create** CTA button
- Opens as a **modal overlay** on the landing page
- Shows 3 cards to choose from:

```
[ Event ]     [ Music ]     [ Promotion ]
```

- Clicking a card type opens the relevant form (within the same modal)

---

### 5. Forms (inside modal)

#### Event Form
| Field | Type |
|---|---|
| Title | Text input |
| Location | Text input |
| Map | Text input (Google Maps URL or embed link) |
| Message | Rich text editor (supports formatting + hyperlinks) |

#### Music Form
| Field | Type |
|---|---|
| Title | Text input |
| Upload Music | File upload (audio file → stored in Vercel Blob) |
| Message | Rich text editor (supports formatting + hyperlinks) |

#### Promotion Form
| Field | Type |
|---|---|
| Message | Rich text editor (supports formatting + hyperlinks) |

---

### 6. On Submitting a Form
- Click **Add** CTA inside the modal
- A unique slug is auto-generated (7 random alphanumeric characters via `nanoid`)
- Card data is saved to **Vercel KV**
- Audio file (if Music card) is uploaded to **Vercel Blob**
- A new shareable page is created at `/s/[slug]`
- Modal closes and the new card appears in the list below the hero on the landing page

---

## Shareable Pages `/s/[slug]`

Each card type renders a different branded landing page:

### Event Page
- Event title
- Location name
- Embedded map (via Google Maps embed URL)
- Rich text message rendered as HTML
- CTA: "Download the App for Full Details" → smart redirect (Play Store / App Store)

### Music Page
- Soundtrack title
- Inline audio player (plays the uploaded audio)
- Rich text message rendered as HTML
- CTA: "Download the App to Listen to the Full Track" → smart redirect

### Promotion Page
- Rich text message rendered as HTML
- CTA: "Download the App" → smart redirect

---

## Smart Redirect Logic (App Store / Play Store)

On every shareable page, detect device OS:

```js
const ua = navigator.userAgent;
if (/android/i.test(ua)) {
  window.location.href = PLAY_STORE_URL;
} else if (/iPad|iPhone|iPod/.test(ua)) {
  window.location.href = APP_STORE_URL;
} else {
  // Show both buttons side by side
}
```

---

## Data Structure (Vercel KV)

Each card is stored as a JSON object under the key `card:[slug]`:

```json
{
  "slug": "abc123",
  "type": "event" | "music" | "promotion",
  "title": "Card Title",
  "location": "Location Name (event only)",
  "mapUrl": "Google Maps URL (event only)",
  "audioUrl": "Vercel Blob URL (music only)",
  "message": "Rich text HTML string",
  "createdAt": "ISO timestamp"
}
```

A separate index key `cards:all` stores an array of all slugs for listing on the dashboard.

---

## URL Structure

| Route | Who sees it |
|---|---|
| `/` | Everyone (hero) + Admin (card list below hero) |
| `/login` | Everyone |
| `/s/[slug]` | Everyone (via shared link) |

---

## Open Graph Meta Tags

Each `/s/[slug]` page must render dynamic OG meta tags for rich previews on WhatsApp:

```html
<meta property="og:title" content="[Card Title]" />
<meta property="og:description" content="[Short text from message]" />
<meta property="og:url" content="https://yourdomain.com/s/[slug]" />
```

These must be rendered **server-side** (using Next.js `generateMetadata`) so WhatsApp and iMessage can read them.

---

## FlutterFlow Share Integration

The generated URL from each card is used in FlutterFlow's Share action. Share text per type:

**Event:**
```
[Event Title] — 📍 [Location]
[Map URL]
Download the app for full details: https://yourdomain.com/s/[slug]
```

**Music:**
```
🎵 [Soundtrack Title]
Preview: https://yourdomain.com/s/[slug]
Download the app to hear the full track!
```

**Promotion:**
```
https://yourdomain.com/s/[slug]
```

---

## Auth Implementation

- On login form submit → POST to `/api/auth/login`
- API route checks credentials against `.env.local` values
- On match → set a signed **HttpOnly session cookie**
- On mismatch → return 401 error
- Middleware at `middleware.ts` checks for the session cookie on any protected API routes
- Sign out → POST to `/api/auth/logout` → clears the cookie → redirect to `/`

---

## Notes for Antigravity (AI Coding Assistant)

- Use **Next.js App Router** (not Pages Router)
- Use **Vercel KV** (`@vercel/kv`) for all card data storage — no Supabase, no external DB
- Use **Vercel Blob** (`@vercel/blob`) for audio file uploads — no Supabase Storage
- Use **Tailwind CSS** for all styling
- Admin auth via simple `.env.local` credential check + HttpOnly cookie — no third-party auth library needed
- Rich text editor: use **TipTap** (lightweight, headless, React-compatible)
- Visitor pages (`/s/[slug]`) must use `generateMetadata` in Next.js for server-side OG tag rendering
- Card list on landing page: fetch only when session cookie is present (server component conditional render)
- Keep all card type forms as separate components: `EventForm.tsx`, `MusicForm.tsx`, `PromotionForm.tsx`
- Modal component should be reusable and handle all three card type flows internally
- Slug generation: use `nanoid` with length 7
- The landing page card list and Create/Sign Out buttons are rendered conditionally — visitors must never see them

---

## Out of Scope (for now)

- Branded visual design for landing page and shareable pages (to be provided separately)
- Audio preview trimming UI (upload full file for now)
- Analytics or click tracking
- Multiple admin accounts
- Mobile app itself (handled in FlutterFlow)
