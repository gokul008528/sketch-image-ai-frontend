# Sketch2Real — Frontend

React + Vite frontend for the Sketch-to-Real image generator. Ships fully
functional against a **local mock API** so it can be developed and demoed
before the backend exists, then switches to the real backend with one env
variable.

## Stack

- React 18 + React Router
- Tailwind CSS, themeable via CSS variables — **light "professional" theme is
  now the default**, with dark and system-follow available from the header
  toggle (see `src/styles/theme.css` for the palette tokens)
- Plain `fetch`-based API client with JWT access/refresh token handling
- Firebase Auth (client SDK only) for the "Continue with Google" button —
  see "Google Sign-In setup" below

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

By default `.env` has `VITE_USE_MOCK_API=true`, so signup/login/history/
generation all work immediately using `localStorage` as a fake database —
no backend required. Refresh the page and your session, and generation
history, persist.

## What's new

- **Left sidebar** (History, Profile, Logout) for authenticated routes —
  `src/components/layout/Sidebar.jsx`. Desktop only for now; mobile keeps
  these in the existing hamburger menu.
- **Header theme toggle** — System / Light / Dark, in `Navbar`. Persists to
  `localStorage` (`s2r_theme_preference`) and defaults to **Light**. No
  flash-of-wrong-theme: `index.html` resolves and applies the theme before
  first paint.
- **Light theme is now the professional default.** Dark mode still exists
  and looks the same as before — pick it from the header toggle.
- **Forgot / reset password** pages (`/forgot-password`, `/reset-password`).
- **Google sign-in / sign-up** button on Login and Register — needs Firebase
  config, see below. Works against the mock API out of the box (no Firebase
  needed) if you just want to click through the UI locally — see note below.
- **Profile page** (`/profile`) — edit display name.

### Trying Google sign-in against the mock API without Firebase

`GoogleSignInButton` shows a console warning and a friendly inline error if
`VITE_FIREBASE_*` env vars aren't set — it won't silently pretend to work.
To actually click through the Google flow locally before Firebase is wired
up, either fill in a real (even a throwaway) Firebase project's config, or
stub `firebaseAuth`/`signInWithPopup` in a local branch — this repo doesn't
fake Firebase itself, since that popup + token flow is the one part worth
testing for real.

## Studio: Draw or Upload

The Studio page has two input modes, switched with a tab:

- **Draw** — a full drawing canvas (`src/components/DrawingCanvas.jsx`) with
  pen, eraser, line/rectangle/circle shapes, fill bucket, adjustable brush
  size and color, multiple layers (add/hide/delete), undo/redo per layer,
  and zoom. Clicking "Use this drawing" flattens all visible layers to a
  PNG and hands it to the same generation flow as an upload.
- **Upload** — the original drag-and-drop file picker.

Both modes converge on the same `file` state, so the generation settings
and "Generate realistic image" button work identically regardless of which
mode produced the image.

## Google Sign-In setup (for whoever owns Firebase/GCP)

1. Create (or reuse) a Firebase project at https://console.firebase.google.com.
2. Authentication → Sign-in method → enable **Google**.
3. Project settings → General → Your apps → add a Web app → copy the config.
4. Fill in `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
5. Add your local dev origin (e.g. `localhost`) to Firebase's authorized
   domains if the popup is blocked.

Frontend never mints its own session from the Google ID token — it POSTs
the token to `/api/auth/google`, and the backend verifies it and returns
this app's normal `accessToken`/`refreshToken` pair. See "Notes for the
backend teammate" below for exactly what that endpoint needs to do.

## Plugging in the real backend

Once your teammate's backend is ready:

1. Set `VITE_USE_MOCK_API=false` in `.env`.
2. Set `VITE_API_BASE_URL` to the backend's base URL (or leave it as `/api`
   and configure `VITE_API_PROXY_TARGET` in `vite.config.js` for local dev
   proxying).
3. Confirm the backend matches the contract documented at the top of
   `src/api/client.js` — endpoints, request/response shapes, and auth
   header format (`Authorization: Bearer <token>`). If the backend's shape
   differs, that file is the **only** place that needs to change; no
   component imports it directly.

### Expected endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account, returns user + tokens |
| POST | `/api/auth/login` | – | Returns user + tokens |
| POST | `/api/auth/google` | – | Body: `{ idToken }` (Firebase/Google ID token). Verify server-side, upsert the user, return user + tokens exactly like login/register. |
| POST | `/api/auth/forgot-password` | – | Body: `{ email }`. Always return 204 regardless of whether the email exists (avoid account enumeration); send a reset email with a link to `/reset-password?token=...` if it does. |
| POST | `/api/auth/reset-password` | – | Body: `{ token, newPassword }`. Validate token, update password, return 204. |
| POST | `/api/auth/refresh` | – | Exchanges refresh token for a new access token |
| POST | `/api/auth/logout` | ✓ | Invalidate session |
| GET | `/api/auth/me` | ✓ | Current user, used to restore session on load |
| PATCH | `/api/auth/me` | ✓ | Body: `{ name }`. Used by the new Profile page. |
| POST | `/api/generations` | ✓ | Multipart upload: sketch file + style/palette/quality/variations |
| GET | `/api/generations` | ✓ | Paginated history |
| GET | `/api/generations/:id` | ✓ | Single generation detail |
| DELETE | `/api/generations/:id` | ✓ | Remove a generation |

Full request/response shapes are documented as comments in
`src/api/client.js`.

## Project structure

```
src/
  api/
    client.js          # real backend calls (documented contract at the top)
    mockClient.js       # in-memory fake, used when VITE_USE_MOCK_API=true
    firebase.js          # Firebase init, used only for Google sign-in
    index.js            # picks real vs mock based on env
  components/
    layout/
      Navbar.jsx          # top bar: logo, Studio link, theme toggle, mobile menu
      Sidebar.jsx          # left rail: History, Profile, Logout (auth'd routes)
      AppShell.jsx         # wraps Navbar + Sidebar + routed page content
    auth/
      AuthLayout.jsx        # shared card wrapper for auth pages
      GoogleSignInButton.jsx
    ui/
      ThemeToggle.jsx       # System / Light / Dark control
      Spinner.jsx
    CompareSlider.jsx, SketchDropzone.jsx, DrawingCanvas.jsx,
    GenerationControls.jsx, ResultsGrid.jsx   # unchanged from before
  context/
    AuthContext.jsx     # login/register/loginWithGoogle/forgot+reset password/logout/session restore
    ThemeContext.jsx     # theme preference + persistence
  styles/
    theme.css            # CSS variable tokens for light (default) + dark themes
  pages/
    LandingPage.jsx, LoginPage.jsx, RegisterPage.jsx,
    ForgotPasswordPage.jsx, ResetPasswordPage.jsx,
    StudioPage.jsx, HistoryPage.jsx, ProfilePage.jsx
  __tests__/
    components/, pages/    # Vitest + React Testing Library
```

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Vitest + React Testing Library, configured in `vite.config.js` /
`src/__tests__/setup.js`. Coverage so far: theme persistence/default,
sidebar auth-gating, and the forgot-password always-succeeds behavior.
Add more as new components/pages land.

## Notes for the backend teammate

- The frontend expects **JWT access + refresh tokens** returned on
  login/register/google, and will automatically retry a request once with a
  refreshed token if it gets a 401.
- File uploads are sent as `multipart/form-data` with the field name
  `sketch`.
- Errors are surfaced from `message` or `error` fields on non-2xx JSON
  responses — return one of those for validation/auth errors so they show
  up in the UI correctly.
- `/api/auth/google` must **verify the ID token server-side** (Firebase
  Admin SDK or Google's token verification endpoint) rather than trusting
  the frontend's claims about who the user is.
- `/api/auth/forgot-password` should respond identically (204) whether or
  not the email exists, to avoid leaking which emails have accounts.
