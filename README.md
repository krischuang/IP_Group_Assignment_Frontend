# UTSFE — Frontend

UTSFE (UTS Frontend Engineering) is a content-publishing platform where users can browse and read articles, manage their profile, and reset their password via email OTP. Administrators get a dedicated dashboard for publishing articles and managing user accounts. This repository contains the **Next.js frontend**.

**Problem it solves:** Delivers a seamless, single-page-application experience on top of the UTSFE backend API — handling JWT-based authentication, live client-side search, RSA-encrypted password submission, Cloudflare Turnstile bot protection, and real-time AI summary progress polling.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| UI library | [React 18](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + SASS (global styles) |
| Bot protection | Cloudflare Turnstile (`@marsidev/react-turnstile`) |
| Route protection | Next.js `middleware.ts` (JWT decode + role check) |
| Server Actions | Next.js Server Actions (auth, article mutations, admin operations) |
| BFF proxies | Next.js Route Handlers under `/bff/*` (forward public reads to backend) |
| Date utilities | `date-fns` |

**Node.js version:** 18+

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd IP_Group_Assignment_Frontend
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
cp .env .env.local
```

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the UTSFE backend API | `http://localhost:8000` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile **site** key (public, safe to expose) | `0x4AAAA...` |

> The backend API URL is read by both the browser (for public article fetches via BFF) and Next.js Server Actions (for authenticated mutations). Make sure it is reachable from both contexts.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile and optimise for production |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint and auto-fix warnings |

---

## Key Features

- **Single-page application** — Next.js App Router handles all navigation client-side; no full page reloads.
- **JWT authentication** — Tokens are stored as HTTP-only cookies and decoded in `middleware.ts` for route protection.
- **Role-based access control** — Admin-only routes (`/admin/*`) are blocked in middleware before rendering.
- **Live search** — The articles listing and admin user table filter in real-time as the user types.
- **RSA-encrypted passwords** — Passwords are encrypted with the server's public key before being transmitted.
- **Forgot-password flow** — Three-step OTP process: request → verify code → set new password.
- **AI summary panel** — Article detail page polls the backend job endpoint every 3 seconds and renders a live progress bar until the AI summary is ready.
- **Loading skeletons** — Every data-fetching view shows an animated skeleton placeholder while loading.
- **Accessible** — Skip-to-content link, ARIA labels on interactive elements, semantic HTML throughout.

---

## Folder Structure

```
IP_Group_Assignment_Frontend/
│
├── app/                            # Next.js App Router — all pages and API routes
│   ├── layout.tsx                  # Root layout: wraps every page with Header and Footer
│   ├── home/
│   │   └── page.tsx                # Public home page — hero, featured article, recent articles list
│   ├── sign-in/
│   │   └── page.tsx                # Sign-in form with Turnstile, forgot-password modal trigger
│   ├── sign-up/
│   │   └── page.tsx                # Registration form with Turnstile and password strength meter
│   ├── forgot-password/
│   │   └── page.tsx                # Standalone forgot-password page
│   ├── profile/
│   │   └── page.tsx                # Authenticated user profile — edit name/bio, reset password
│   ├── articles/
│   │   ├── page.tsx                # Public article listing with live client-side search
│   │   └── [id]/
│   │       └── page.tsx            # Article detail — markdown renderer, AI summary panel with polling
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard — stats cards and quick-action links
│   │   ├── articles/
│   │   │   └── page.tsx            # Admin article management — create / edit / delete table
│   │   └── users/
│   │       └── page.tsx            # Admin user management — search, change role, delete
│   ├── api/                        # Next.js Route Handlers (internal API consumed by Server Actions)
│   │   ├── articles/route.ts       # GET /api/articles, POST /api/articles
│   │   ├── articles/[id]/route.ts  # GET /api/articles/[id], PUT, DELETE
│   │   ├── categories/route.ts     # GET /api/categories
│   │   └── admin/
│   │       ├── users/route.ts      # GET /api/admin/users — admin user list proxy
│   │       └── stats/route.ts      # GET /api/admin/stats — admin stats proxy
│   └── bff/                        # Backend-for-Frontend proxies (public, no auth required)
│       ├── articles/route.ts           # Proxies GET /articles/ from the backend and normalises shapes
│       ├── articles/[id]/route.ts      # Proxies GET /articles/{id} from the backend
│       └── ai-tools/summary/jobs/
│           └── [job_id]/route.ts       # Proxies GET /ai-tools/summary/jobs/{job_id}
│
├── actions/                        # Next.js Server Actions — run on the server, called from client
│   ├── auth.ts                     # signInWithPassword, signUpWithEmail, signOut
│   ├── user.ts                     # getCurrentUser (calls GET /auth/me with cookie token)
│   ├── articles.ts                 # createArticleAction, updateArticleAction, deleteArticleAction
│   ├── admin.ts                    # listAdminUsersAction, updateAdminUserAction, deleteAdminUserAction, getAdminStatsAction
│   └── password-reset.ts           # forgotPassword, validateResetToken, resetPassword
│
├── components/                     # Shared React components
│   ├── header/
│   │   ├── header.tsx              # Site header — logo, nav links, auth state (sign in / sign out)
│   │   └── header.sass             # Header styles
│   ├── footer/
│   │   ├── footer.tsx              # Site footer
│   │   └── footer.sass             # Footer styles
│   └── ForgotPasswordModal.tsx     # Three-step modal: request OTP → verify → set new password
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts                  # useUser() — fetches and caches the current user; exposes isAdmin, logout
│   └── useUser.ts                  # updateUser() — calls POST /auth/me to update profile fields
│
├── util/
│   └── api/
│       ├── client.ts               # Exports API_BASE URL constant
│       ├── backend.ts              # Field normalisation helpers (backend snake_case → frontend camelCase)
│       ├── backendErrors.ts        # Extracts human-readable error messages from backend error responses
│       └── publicArticles.ts       # fetchPublicArticlesList / fetchPublicArticleById via BFF proxies
│
├── styles/
│   ├── main.css                    # Tailwind CSS directives and global utility class definitions
│   └── global.sass                 # Base reset, typography, and layout globals
│
├── middleware.ts                   # Route protection: redirects unauthenticated users; blocks non-admins from /admin/*
├── public/
│   ├── fonts/                      # Self-hosted Lato and Nunito variable fonts
│   ├── favicon.svg                 # SVG favicon
│   └── favicon.ico                 # Legacy .ico favicon
│
├── next.config.js                  # Next.js configuration (rewrites, image domains)
├── tailwind.config.js              # Tailwind theme extensions (brand colours, custom utilities)
├── tsconfig.json                   # TypeScript compiler options
├── package.json                    # Dependencies and npm scripts
└── README.md                       # This file
```

---

## Authentication Flow

1. User submits email + RSA-encrypted password + Turnstile token via a Server Action.
2. Server Action forwards the request to `POST /auth/login` on the backend.
3. On success, the JWT is stored in an HTTP-only cookie (`auth_token`).
4. `middleware.ts` decodes the JWT from the cookie on every request — no round-trip to the backend needed for most routes.
5. Admin routes additionally verify the `role` claim; if absent in the token, middleware re-fetches `GET /auth/me`.

## Routing

| Path | Access | Description |
|---|---|---|
| `/home` | Public | Landing page |
| `/articles` | Public | Article listing with live search |
| `/articles/[id]` | Public | Article detail with AI summary |
| `/sign-in` | Public | Sign-in page |
| `/sign-up` | Public | Registration page |
| `/forgot-password` | Public | Forgot-password page |
| `/profile` | Authenticated | User profile and settings |
| `/admin` | Admin only | Dashboard |
| `/admin/articles` | Admin only | Article management |
| `/admin/users` | Admin only | User management |
