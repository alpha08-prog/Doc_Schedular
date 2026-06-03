# Doc Scheduler

A production-grade doctor–patient appointment scheduling platform built with Next.js 14, TypeScript, and Tailwind CSS. Features a full component library, role-based authentication, and a two-sided portal for patients and doctors.

## Features

**Patient Portal**
- Browse and search doctors by name or specialty
- Book appointments with date/time slot selection
- View appointment history (upcoming / past)
- Access medical records: diagnoses and prescriptions
- Patient profile with health stats

**Doctor Portal**
- Dashboard with live stats (today's appointments, unique patients, upcoming)
- Appointment management: confirm / cancel with real-time updates
- Patient list derived from appointment history
- Full prescription CRUD (create, edit, delete)
- Review management with filtering, sorting, and rating distribution
- Patient medical history timeline
- Calendar view with drag-and-drop rescheduling

**Infrastructure**
- Role-based auth middleware (patient routes vs. doctor routes)
- Structured session cookie (`base64(JSON)`) set server-side on login
- Centralized `AuthContext` with session restore on page refresh
- Global and portal-scoped error boundaries
- Toast notification system (`useNotification()`)
- Production `npm run validate` pipeline (type-check + lint + format)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5, React 18 |
| Styling | Tailwind CSS 3.4 |
| Validation | Zod 3 |
| Class merging | clsx + tailwind-merge |
| Calendar | react-big-calendar + moment.js |
| Forms | react-hook-form |
| CI/CD | GitHub Actions (`.github/workflows/ci.yml`) |

---

## Project Structure

```
src/
├── app/
│   ├── (patient)/            # Route group — patient pages (BottomNavBar layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Landing / home
│   │   ├── login/
│   │   ├── otp/
│   │   ├── doctors/          # Browse doctors
│   │   ├── booking/          # My appointments
│   │   ├── patient/          # Patient dashboard + appointment review
│   │   ├── profile/
│   │   ├── records/          # Diagnoses + prescriptions
│   │   └── doctor/[id]/      # Doctor detail + booking flow
│   ├── (doctor)/             # Route group — doctor portal (DoctorNavBar layout)
│   │   ├── layout.tsx
│   │   ├── doctor/
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   ├── calendar/
│   │   │   ├── patients/
│   │   │   ├── prescriptions/
│   │   │   ├── reviews/
│   │   │   └── profile/
│   │   ├── error.tsx         # Doctor portal error boundary
│   │   └── loading.tsx
│   ├── doctor/               # Auth pages (no nav layout)
│   │   ├── login/
│   │   ├── signup/
│   │   └── logout/
│   ├── api/                  # Next.js API routes (in-memory stores)
│   │   ├── appointments/     # GET, POST, [id] PATCH/DELETE
│   │   ├── auth/doctor-login/
│   │   ├── booking/
│   │   ├── diagnoses/
│   │   ├── doctors/
│   │   ├── login/
│   │   ├── prescriptions/    # Full CRUD
│   │   └── reviews/          # Filtering, sorting, pagination, stats
│   ├── components/           # Legacy shared components (being migrated to src/components/)
│   ├── error.tsx             # Global error boundary
│   ├── layout.tsx            # Root layout (Providers wrapper)
│   ├── Providers.tsx         # AuthProvider + NotificationProvider
│   └── globals.css
│
├── components/
│   ├── ui/                   # Design system primitives
│   │   ├── Button.tsx        # 5 variants × 3 sizes, loading, icons
│   │   ├── Input.tsx         # label, error, hint, addons
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx          # default | interactive | ghost
│   │   ├── Badge.tsx         # success | warning | danger | info | neutral
│   │   ├── Modal.tsx         # accessible, Escape/click-outside close
│   │   ├── Toast.tsx         # auto-dismiss, 4 types
│   │   ├── Skeleton.tsx      # shimmer loading states
│   │   ├── Avatar.tsx        # image + initials fallback
│   │   ├── EmptyState.tsx
│   │   ├── StarRating.tsx    # interactive + readonly
│   │   └── index.ts          # barrel export
│   └── appointment/
│       └── AppointmentCard.tsx
│
├── contexts/
│   ├── AuthContext.tsx        # useAuth() — user, role, login, logout
│   └── NotificationContext.tsx # useNotification() — notify(message, type)
│
├── lib/
│   ├── utils.ts              # cn(), formatDate(), formatTime(), getInitials()
│   ├── api-client.ts         # apiClient.get/post/put/patch/delete + ApiError
│   ├── constants.ts          # ROUTES, APPOINTMENT_TYPES, SPECIALTIES
│   └── validations/          # Zod schemas for all entities
│       ├── appointment.schema.ts
│       ├── prescription.schema.ts
│       ├── review.schema.ts
│       └── auth.schema.ts
│
├── types/                    # Shared TypeScript interfaces
│   ├── appointment.ts        # Appointment + AppointmentStatus/Type
│   ├── api.ts                # ApiResponse<T>, PaginatedResponse<T>
│   ├── diagnosis.ts
│   ├── doctor.ts
│   ├── prescription.ts
│   ├── review.ts
│   └── user.ts               # PatientUser | DoctorUser, UserRole
│
└── data/
    ├── doctors.json          # 5 seed doctors
    └── timeslots.json
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+
- PostgreSQL (a local install, a hosted DB, or Docker — see step 3)

### 1. Install dependencies

```bash
npm install   # also runs `prisma generate`
```

### 2. Create environment file

```bash
cp .env.example .env
```

You must set `DATABASE_URL` (PostgreSQL) and `AUTH_SECRET` (≥ 32 chars). Generate a secret with `openssl rand -base64 48`.

### 3. Start the database

Easiest — Docker (matches the default `DATABASE_URL`, runs on port 5433):

```bash
docker compose up -d
```

Or point `DATABASE_URL` at your own PostgreSQL instance / a hosted DB (Neon, Supabase, Railway).

### 4. Run migrations and seed

```bash
npm run db:migrate   # apply schema (creates the database if needed)
npm run db:seed      # load demo doctors, patients, and data
```

### 5. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

**Demo accounts** (all use password `password123`):
- Patient: `john@example.com` (also `jane@example.com`, `sarah@example.com`)
- Doctor: `priya@clinic.com` (also `rahul@`, `anjali@`, `prakash@`, `sneha@clinic.com`)

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL for the app |
| `NEXT_PUBLIC_APP_NAME` | `"Doc Scheduler"` | App display name |
| `DATABASE_URL` | Docker Postgres on `:5433` | PostgreSQL connection string (required) |
| `AUTH_SECRET` | — | **Required.** ≥ 32-char secret used to sign session JWTs |
| `NODE_ENV` | `development` | Runtime environment |

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all src files
npm run format:check # Prettier format check (used in CI)
npm run type-check   # TypeScript compile check (no emit)
npm run test         # Run the Vitest suite
npm run validate     # Full check: type-check + lint + format:check + test
npm run db:migrate   # Apply Prisma migrations (dev)
npm run db:deploy    # Apply migrations (production/CI)
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

---

## Authentication Flow

Real authentication backed by PostgreSQL:

- Passwords are hashed with **bcrypt** (`src/lib/auth/password.ts`).
- On login the server issues a **signed JWT** (`jose`, HS256, signed with `AUTH_SECRET`) stored in an
  **httpOnly** `session` cookie (`src/lib/auth/session.ts` / `cookies.ts`) — not readable by client JS.
- The client `AuthContext` hydrates from `GET /api/auth/me` on mount (since the cookie is httpOnly).

| Endpoint | Purpose |
|---|---|
| `POST /api/login` | Patient login |
| `POST /api/auth/doctor-login` | Doctor login |
| `POST /api/auth/signup` | Patient registration (auto-login) |
| `POST /api/auth/doctor-signup` | Doctor registration |
| `GET /api/auth/me` | Current user (session hydration) |
| `POST /api/auth/logout` | Clear session |

`src/middleware.ts` verifies the JWT on the Edge runtime and enforces role-based protection:

- **Doctor portal** (`/doctor/dashboard`, `/doctor/appointments`, …) → requires `role === 'doctor'`
- **Patient routes** (`/booking`, `/patient/*`, `/profile`, `/records`) → requires any authenticated user
- **Public routes** (`/`, `/login`, `/signup`, `/doctor/login`, `/doctor/signup`, `/doctors`) → no auth

> Note: with a `src/` directory, Next.js loads middleware from **`src/middleware.ts`** (a root
> `middleware.ts` is silently ignored).

**Patient login:** `/login`  ·  **Doctor login:** `/doctor/login`

---

## API Reference

All endpoints return `{ success: boolean, data?: T, error?: string }`.

### Appointments — `/api/appointments`
| Method | Path | Description |
|---|---|---|
| GET | `/api/appointments?patientId=` | Patient's appointments |
| GET | `/api/appointments?doctorId=` | Doctor's appointments |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/[id]` | Single appointment |
| PATCH | `/api/appointments/[id]` | Update status/notes |
| DELETE | `/api/appointments/[id]` | Soft-cancel |

### Prescriptions — `/api/prescriptions`
Full CRUD: `GET`, `POST`, `GET /[id]`, `PUT /[id]`, `DELETE /[id]`

### Reviews — `/api/reviews`
| Query param | Values |
|---|---|
| `doctorId` | Filter by doctor |
| `ratingMin` / `ratingMax` | Rating range (1–5) |
| `sort` | `newest` \| `oldest` \| `highest` \| `lowest` |
| `page` / `pageSize` | Pagination (default 10) |

Response includes `total`, `average`, and `distribution` stats.

### Diagnoses — `/api/diagnoses`
`GET` (filter by `patientId`/`doctorId`), `POST`

---

## CI/CD

GitHub Actions runs on every push to `main` / `develop` and on pull requests:

```
type-check → lint → format:check → test → build
```

See `.github/workflows/ci.yml`.

---

## Deployment

### Docker / Node.js server (recommended)
The app uses `output: 'standalone'` in `next.config.js` which generates a self-contained server bundle:

```bash
npm run build
node .next/standalone/server.js
```

### Netlify
Requires `@netlify/plugin-nextjs` for SSR support. See `netlify.toml` for instructions.

---

## Data Notes

All data is persisted in **PostgreSQL via Prisma** (`prisma/schema.prisma`, client at `src/lib/prisma.ts`).
Seed data (`prisma/seed.ts`) loads 5 doctors (from `src/data/doctors.json`), 3 demo patients, and sample
appointments/prescriptions/reviews/diagnoses with dates in 2026 so the "upcoming" filters work.

Every API route validates input with the Zod schemas in `src/lib/validations/` and derives the acting
user's identity from the session (never from request bodies), so a patient can only read/modify their own
records and a doctor only their own.

The doctor **calendar** (`src/app/(doctor)/doctor/calendar`) still uses a separate in-memory mock
(`src/app/services/appointmentService.ts`) and is not yet Prisma-backed.
