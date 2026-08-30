# ✨ Influstore

<div align="center">

<img src="https://img.shields.io/badge/Influstore-Social%20Commerce-fuchsia?style=for-the-badge&logo=shopping-bag&logoColor=white" />

### 🛍️ Discover. Influence. Shop.

A modern **social-commerce platform** that brings creators, trends, products, and shopping together in one immersive experience.

<br />

<img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-PostgreSQL-3982CE?style=flat-square&logo=prisma&logoColor=white" />

<br /><br />

<a href="#-about-influstore">About</a> •
<a href="#-phase-1-architecture">Phase 1 Architecture</a> •
<a href="#-phase-2-social-feed--posts">Phase 2: Social Feed & Posts</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-getting-started">Getting Started</a> •
<a href="#-database--prisma">Database & Prisma</a> •
<a href="#-environment-variables">Environment Variables</a> •
<a href="#-pending-aws-configuration">Pending AWS Configuration</a>

</div>

---

## 🌟 About Influstore

**Influstore** is a next-generation social-commerce web application combining an Instagram-style social discovery network with a multi-vendor ecommerce marketplace.

> **Discover what inspires you.  
> Follow the people who influence you.  
> Shop what you love.**

The platform is engineered across 10 progressive phases. **Phase 1** establishes the scalable foundation, database schema, secure authentication engine, and user profile management.

---

## 🏗️ Phase 1 Architecture

Phase 1 provides an end-to-end foundation:
- **Authentication**: Secure registration, login, session persistence, and logout using signed HTTP-only JWT cookies (`jose`), server-side Zod validation, and bcrypt password hashing.
- **Database Layer**: Prisma ORM configured for PostgreSQL / Amazon RDS with `User`, `Profile`, `Role`, and `AccountType` models.
- **User Profiles**: Dynamic public profiles (`/profile/[username]`), honest zero-states for non-implemented post/store modules, and full profile editing (`/settings/profile`) with username uniqueness checks and avatar previews.
- **Theme Engine**: Seamless Light, Dark, and System mode switching (`next-themes`) with Tailwind CSS v4 variables.
- **Storage Abstraction**: Media storage interface (`src/lib/storage/`) prepared for AWS S3 without hardcoded secrets.
- **Route Protection**: Next.js App Router middleware verifying sessions for protected routes (`/settings/*`, `/api/profile`).

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Validates credentials & sets JWT cookie
│   │   │   ├── register/route.ts    # Creates User + Profile in transaction
│   │   │   ├── logout/route.ts      # Clears session cookie
│   │   │   └── me/route.ts          # Retrieves current authenticated user
│   │   ├── profile/route.ts         # GET / PATCH authenticated user's profile
│   │   └── users/[username]/route.ts# GET public user profile
│   ├── (auth)/
│   │   ├── login/page.tsx           # Modern responsive login
│   │   ├── register/page.tsx        # Registration with account type selection
│   │   └── signup/page.tsx          # Redirects to /register
│   ├── profile/
│   │   ├── [username]/page.tsx      # Public profile with zero-state tabs
│   │   └── page.tsx                 # Redirects to current user's profile
│   ├── settings/
│   │   ├── profile/page.tsx         # Edit profile form
│   │   └── page.tsx                 # Appearance, theme, notification settings
│   ├── globals.css                  # Theme CSS variables (light/dark)
│   ├── layout.tsx                   # ThemeProvider & AuthProvider
│   └── page.tsx                     # Landing page
├── components/
│   ├── auth/                        # LoginForm, RegisterForm, AuthCard
│   ├── layout/                      # Navbar, UserMenu, Footer, Providers
│   ├── profile/                     # ProfileHeader, ProfileTabs, EditProfileForm
│   └── ui/                          # Button, Input, Textarea, Avatar, Badge, ThemeToggle, Card
├── features/auth/                   # AuthContext & hooks
├── lib/
│   ├── auth/                        # Session management & bcrypt password utils
│   ├── db/                          # Prisma client singleton
│   ├── storage/                     # Storage service abstraction (S3 ready)
│   ├── validations/                 # Zod auth & profile validation schemas
│   └── utils/                       # cn helper
├── types/                           # Strongly-typed user, profile, auth models
└── middleware.ts                    # Edge-compatible session verification
```

---

## 📸 Phase 2: Social Feed & Posts

Phase 2 completes the first full social-content vertical: create a post → see it in the feed → like, comment, reply, save, share → view it on your profile → edit or delete it.

**Database models added** (`prisma/schema.prisma`): `Post`, `PostMedia`, `Like`, `Comment` (with a self-relation `parentId` for one-level-deep reply threading), `CommentLike`, `SavedPost`. Likes/saves/comment-likes are enforced unique per `(userId, postId)` / `(userId, commentId)` at the database level, and deleting a post cascades to its media, likes, comments, and saves.

**Media & storage**: production uploads follow the browser → presigned-URL → S3 flow described in [Pending AWS Configuration](#-pending-aws-configuration). While `AWS_*` env vars are empty, `getStorageService()` (`src/lib/storage/index.ts`) transparently falls back to `LocalStorageService`, which writes real files to `public/uploads/` (gitignored) so image posts work end-to-end in local development — no fake URLs, no base64 in Postgres. Switching to S3 in production requires only setting the `AWS_*` variables; no application code changes.

**Feed & pagination**: `/api/feed` and `/api/users/[username]/posts` are cursor-paginated (`?cursor=`, capped `limit`), returning `{ posts, nextCursor }`. The home feed shows recent public posts newest-first — a deliberately simple Phase 2 strategy (`src/lib/services/feed.service.ts`) that Phase 3's following-based ranking can replace without touching the UI or API contract. The feed and saved-posts pages use `IntersectionObserver`-driven infinite scroll with a loading skeleton, retry-on-failure, and an end-of-feed state.

**New routes**: `/create-post` (image upload, multi-photo carousel, caption with live character count), `/post/[postId]` (desktop split media|comments layout, mobile stacked, 404 for unknown/deleted posts), `/saved` (private — only ever queries the session owner's own saved posts, never exposed on another user's public profile), and a real posts grid on `/profile/[username]`.

**New API endpoints**: `POST /api/posts`, `GET/PATCH/DELETE /api/posts/[postId]`, `POST/DELETE /api/posts/[postId]/like`, `POST/DELETE /api/posts/[postId]/save`, `GET/POST /api/posts/[postId]/comments`, `DELETE /api/comments/[commentId]`, `POST/DELETE /api/comments/[commentId]/like`, `GET /api/comments/[commentId]/replies`, `GET /api/feed`, `GET /api/saved`, `GET /api/users/[username]/posts`, and the two-step media upload `POST /api/posts/media/presign` + `POST /api/posts/media/local-upload`.

**Authorization**: every mutation re-derives the author from the session (never trusts a client-supplied `userId`); edit/delete require `post.authorId === session.userId`; a post's owner may additionally delete comments left on their own post (documented moderation policy — see `src/lib/services/comment.service.ts`); uploaded media keys are verified to live under the authenticated user's own folder before a post can reference them.

**Seed data**: `npm run prisma:seed` now also creates 7 demo posts (single-image and carousel) across the three Phase 1 users, with comments, one-level replies, comment likes, post likes, and saved-post relationships. The social portion of the script clears and recreates itself on every run, so it's safe to re-seed.

**Not in Phase 2** (by design — see the roadmap): Follow/Unfollow, a personalized following feed, hashtag search/discovery, Explore recommendations, Reels/video posts, and full report/moderation tooling. The "Report" post-menu action and hashtag styling are UI-only stubs prepared for the phases that implement them.

---

## 💻 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM 6](https://www.prisma.io/)
- **Authentication**: [Jose JWT](https://github.com/panva/jose) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: [Zod](https://zod.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v20+ or v22+
- **PostgreSQL**: Local PostgreSQL server, Docker, Supabase, Neon, or Amazon RDS instance.

### 2. Installation

```bash
# Clone repository
git clone https://github.com/sDivyabanu/Influ-Store.git
cd Influ-Store

# Switch to the Phase 2 branch (includes all Phase 1 functionality)
git checkout phase-2-social-posts

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Configure your `DATABASE_URL` and `AUTH_SECRET`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/influstore?schema=public"
AUTH_SECRET="your-32-character-secret-key-goes-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🗄️ Database & Prisma

### Initialize Database Schema

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema directly to database (development)
npm run prisma:push

# Or run migrations
npm run prisma:migrate
```

### Seed Development Data

Seed demo users (`mayacarter`, `priya`, `alexm` with password `Password123!`):

```bash
npm run prisma:seed
```

---

## 🛠️ Development & Build Commands

```bash
# Start local development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔑 Environment Variables

| Variable | Description | Phase 1 Status |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | Active |
| `AUTH_SECRET` | Secret key for signing session tokens | Active |
| `NEXT_PUBLIC_APP_URL` | Public URL of the web application | Active |
| `AWS_REGION` | AWS S3 region (e.g. `us-east-1`) | Pending Activation |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | Pending Activation |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | Pending Activation |
| `AWS_S3_BUCKET_NAME` | AWS S3 Bucket for avatars & media | Pending Activation |

---

## ☁️ Pending AWS Configuration

- **Amazon RDS PostgreSQL**: When AWS activation is complete, update `DATABASE_URL` in `.env.local` / production environment to your RDS connection string and run `npm run prisma:migrate`.
- **Amazon S3**: When S3 credentials become available, supply `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET_NAME`. `S3StorageService` (`src/lib/storage/s3-storage.service.ts`) uses `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` to generate real presigned upload URLs — the browser uploads image bytes directly to S3, never through our server. Until these variables are set, `getStorageService()` automatically uses `LocalStorageService` instead (writes to `public/uploads/`, uploaded through a server route since a browser can't write to disk directly) — both implement the exact same `IStorageService` interface, so enabling S3 requires **no application code changes**, only setting these four variables.

---

## 🗺️ Roadmap (Phases 2-10)

- **Phase 2** ✅: Social Feed, Posts, Likes, Comments & Replies, Saved Posts
- **Phase 3**: Follow System, Personalized Feed Ranking, Hashtag Search, Notifications
- **Phase 4**: Explore, Search, Discovery Algorithm
- **Phase 5**: Multi-Vendor Seller Stores & Product Catalog
- **Phase 6**: Product Tagging inside Posts & Reels
- **Phase 7**: Cart, Checkout, Stripe Payments & Orders
- **Phase 8**: Direct Messaging & Creator Chat
- **Phase 9**: Seller Dashboard, Analytics, Reviews
- **Phase 10**: Admin Moderation & AWS Production Deployment
