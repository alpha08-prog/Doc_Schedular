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

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

The default values in `.env.example` work for local development — no changes needed to run the app.

### 3. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL for the app |
| `NEXT_PUBLIC_APP_NAME` | `"Doc Scheduler"` | App display name |
| `AUTH_SECRET` | — | Secret for cookie signing (set for production) |
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
npm run validate     # Full check: type-check + lint + format:check
```

---

## Authentication Flow

The app uses a **structured session cookie** (`session=<base64(JSON)>`) set server-side on login.

| Endpoint | Sets cookie | Role |
|---|---|---|
| `POST /api/login` | `session` + `auth` | patient |
| `POST /api/auth/doctor-login` | `session` + `auth` | doctor |

`middleware.ts` reads the `session` cookie and enforces role-based route protection:

- **Doctor portal** (`/doctor/dashboard`, `/doctor/appointments`, etc.) → requires `role === 'doctor'`
- **Patient routes** (`/booking`, `/patient/*`, `/profile`, `/records`) → requires any authenticated user
- **Public routes** (`/`, `/login`, `/otp`, `/doctor/login`, `/doctors`) → no auth needed

Login with any email/password in demo mode — credentials are not validated.

**Patient login:** `/login`
**Doctor login:** `/doctor/login`

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
type-check → lint → format:check → build
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

All data is **in-memory** — it resets on server restart. Mock seed data uses dates in 2026 so that the "upcoming" appointment filters work correctly.

To add persistent storage, replace the store files in `src/app/api/*/store.ts` with Prisma + a real database. The Zod schemas in `src/lib/validations/` are already defined for all entities and can be reused for server-side validation.
