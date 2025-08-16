# Doc Scheduler

A demo medical appointment and prescription management app built with Next.js 14 and TypeScript. It showcases a doctor and patient workflow with mock APIs, centralized types, and shared in-memory data stores. The UI uses Tailwind CSS.

## Features
- **Doctor flows**: Dashboard, Calendar, Patients list, Patient medical history, Prescriptions CRUD, Reviews listing with filters.
- **Patient flows**: Booking, Records, and a new Profile page at `/profile` with quick stats.
- **APIs**: Mock Next.js API routes for Appointments, Diagnoses, Prescriptions, Reviews.
- **Centralized types**: Shared TypeScript interfaces under `src/types/`.
- **Shared stores**: In-memory stores per entity encapsulating CRUD logic.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript, React 18
- **Styling**: Tailwind CSS
- **Build**: Node.js + npm

## Project Structure
```
src/
  app/
    api/
      appointments/
        route.ts         # GET/POST
        store.ts         # appointmentStore
      diagnoses/
        route.ts         # GET/POST
        store.ts         # diagnosisStore
      prescriptions/
        [id]/route.ts    # GET/PUT/DELETE
        route.ts         # GET/POST
        store.ts         # prescriptionStore
      reviews/
        [id]/route.ts    # GET/PATCH/DELETE
        route.ts         # GET/POST (filters, sorting, pagination, stats)
        store.ts         # reviewStore
    components/          # Reusable UI components
    doctor/              # Doctor-facing pages
    patient/             # Patient landing
    profile/             # Patient profile page (client-only)
  types/
    appointment.ts
    diagnosis.ts
    prescription.ts
    review.ts
```

## Architecture & Design
- **Centralized types**: `src/types/*` (e.g., `Prescription`, `Appointment`, `Diagnosis`, `Review`) used by both API routes and UI components.
- **Shared in-memory stores**: Each API folder has a `store.ts` (e.g., `reviewStore`) exposing `all`, `findById`, `create`, `update`, `remove`. This avoids duplicated arrays and inconsistent data between routes.
- **Consistent APIs**: CRUD patterns across entities; Reviews include filtering, sorting, pagination, and rating stats.
- **Mock data**: Stores initialize with example data for demo purposes.

## Getting Started
### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
# App runs at http://localhost:3000
```

### Build
```bash
npm run build
npm run start
```

## Key Pages & Flows
- **Home**: `/`
- **Doctor**:
  - Login: `/doctor/login`
  - Dashboard: `/doctor/dashboard`
  - Calendar: `/doctor/calendar`
  - Patients: `/doctor/patients`
  - Patient History: `/doctor/patients/[patientId]/history` (aggregates appointments, diagnoses, prescriptions)
  - Prescriptions: `/doctor/prescriptions` (full CRUD)
  - Reviews: `/doctor/reviews` (filters, sorting, rating distribution)
- **Patient**:
  - Profile: `/profile` (edit basic info, quick stats via APIs)
  - Booking: `/booking`
  - Records: `/records`

## API Overview (Mock)
All routes return JSON with `{ success: boolean, data?: any, error?: string }` plus entity-specific fields.

### Prescriptions
- `GET /api/prescriptions` — Query by `doctorId`, `patientId`, etc.
- `POST /api/prescriptions` — Create with validation.
- `GET /api/prescriptions/[id]`
- `PUT /api/prescriptions/[id]`
- `DELETE /api/prescriptions/[id]`

### Appointments
- `GET /api/appointments` — Filter by `patientId` or `doctorId`.
- `POST /api/appointments` — Validates `patientId`, `doctorId`, `date`, `reason`.

### Diagnoses
- `GET /api/diagnoses` — Filter by `patientId` or `doctorId`.
- `POST /api/diagnoses` — Validates `patientId`, `doctorId`, `diagnosis`, `date`.

### Reviews
- `GET /api/reviews` — Filters: `doctorId`, `patientId`, `appointmentId`, `ratingMin`, `ratingMax`; sorting: `newest|oldest|highest|lowest`; pagination: `page`, `pageSize`. Responds with stats: `total`, `average`, `distribution`.
- `POST /api/reviews` — Validates `rating` (1-5).
- `GET /api/reviews/[id]`
- `PATCH /api/reviews/[id]` — 24h edit window enforced.
- `DELETE /api/reviews/[id]` — 24h delete window enforced.

## Development Notes
- **Types in UI**: Components import shared types from `src/types/*` (e.g., `import type { Review } from 'src/types/review'`).
- **Consistency**: All CRUD routes operate on the centralized store; no duplicate arrays in route files.
- **Validation**: Basic input validation in POST routes for appointments, diagnoses, prescriptions, and reviews.
- **Styling**: Tailwind utility classes; feel free to extend.

## Testing Ideas
- Unit-test stores (pure CRUD behavior).
- API integration tests for query parameters and error cases.
- E2E tests for flows: create/edit/delete a prescription; filter/sort/paginate reviews; patient profile edit and persistence.

## Future Enhancements
- **Authentication & Authorization** (doctor vs patient roles; route guards).
- **Persistent Database** (replace in-memory stores with a real DB + ORM like Prisma).
- **Search & Pagination** across more entities (prescriptions, diagnoses, appointments).
- **Advanced Validation** (Zod/Yup schemas shared between client and server).
- **Notifications** and email/SMS reminders for appointments.
- **File uploads** (attachments to records/prescriptions).
- **Accessibility** and i18n.
- **CI/CD & Linting** improvements; align ESLint/Next versions as needed.

## Scripts
```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run start   # Start production server
```

## License
MIT (for demo purposes). Replace with your organization’s license as needed.