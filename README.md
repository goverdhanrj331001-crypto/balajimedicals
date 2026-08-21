# MediDemo — Enterprise Pharmacy & Lab Test Platform

A fully dynamic Next.js 16 + TypeScript application with admin-controlled storefront, Firebase Firestore (database), Firebase Auth (authentication), and Cloudflare R2 (file storage).

## What was built

The original static `medidemo-nextjs` project has been converted into a fully dynamic, enterprise-level application:

### Storefront (customer-facing)
- **Home page** — hero banner, prescription order CTA, popular categories, daily essentials banner, call-to-order banner, product bands, offers carousel, health concerns grid, featured brands
- **Products page** — search, category filter, sort by price/name
- **Product detail page** — image, price, stock status, prescription warning, quantity selector, add to cart
- **Categories page** — grid of all categories
- **Lab Tests page** — health packages + individual tests
- **Lab Tests / Packages** — full list view
- **Lab Tests / Schedule** — booking flow with date/time/address selection
- **Cart page** — quantity update, remove items, free-shipping threshold
- **Checkout** — contact info, shipping address, prescription upload (R2), payment method selection
- **Orders page** — order history with status badges
- **Profile page** — user info, order stats, recent orders, quick links
- **Login / Signup** — customer auth (Firebase or mock)
- **Prescriptions page** — upload prescriptions to R2

### Admin portal (fully working CRUD)
- **Dashboard** — real KPIs (revenue, orders, customers, pending actions), weekly sales trend chart, recent activity feed, recent orders table, top products bar chart, system status, quick actions
- **Products** — full CRUD with image upload, category selection, prescription flag, stock & reorder levels
- **Categories** — full CRUD
- **Brands** — full CRUD with logo upload
- **Health Concerns** — full CRUD
- **Offers** — full CRUD with coupon codes
- **Banners** — full CRUD for hero/prescription/essentials/call banners
- **Lab Packages** — full CRUD
- **Lab Tests** — full CRUD
- **Orders** — list + status update modal (Pending → Processing → Confirmed → In Transit → Delivered / Completed / Cancelled)
- **Medicine Orders** — filtered orders view
- **Lab Testing Orders** — filtered orders view
- **Transactions** — full CRUD
- **Support Tickets** — full CRUD with priority levels
- **Users** — full CRUD with role management (patient/doctor/lab_tech/admin)
- **Employees** — full CRUD with departments
- **Analytics & Reports** — KPIs, bar chart, top products, inventory health
- **System Settings** — site branding, contact info, commerce thresholds, backend status

## Tech stack
- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5**
- **Tailwind CSS 4** with custom MediDemo brand palette
- **Firebase** (Firestore + Auth) — configured via env vars
- **Cloudflare R2** (S3-compatible object storage) — for file/image uploads
- **Sonner** for toast notifications
- **Material Symbols** for icons
- **Modular component structure** — small, focused components in `src/components/{admin,layout,store,ui,common}/`

## Architecture

```
src/
├── app/
│   ├── (storefront pages)/         # Customer-facing pages
│   ├── admin/                      # Admin portal pages
│   ├── api/
│   │   ├── admin/                  # CRUD endpoints (auth-protected)
│   │   │   ├── _crud.ts            # Generic CRUD factory
│   │   │   ├── products/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── ... (14 collections)
│   │   │   ├── upload/route.ts     # R2 image upload
│   │   │   └── stats/route.ts      # Dashboard aggregation
│   │   ├── auth/                   # login, signup, logout, me
│   │   └── public/                 # catalog, orders, upload-prescription
├── components/
│   ├── admin/
│   │   ├── admin-layout.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-ui.tsx            # StatCard, SectionCard, AdminTable, Toolbar, Pagination
│   │   ├── crud-page.tsx           # Reusable generic CRUD page
│   │   ├── orders-page.tsx         # Orders admin with status update
│   │   └── ui/
│   │       ├── modal.tsx
│   │       ├── form.tsx            # Field, TextInput, Select, Textarea, Buttons
│   │       ├── image-upload.tsx    # R2 image upload widget
│   │       └── confirm-dialog.tsx
│   ├── layout/                     # StoreHeader, BottomNav
│   ├── store/                      # ProductCard, ProductBand
│   └── ui/                         # Icon, ProductArt
├── lib/
│   ├── firebase/
│   │   ├── config.ts               # Env loading + isFirebaseConfigured
│   │   ├── client.ts               # Client SDK (browser)
│   │   └── admin.ts                # Admin SDK (server, lazy)
│   ├── r2/storage.ts               # Cloudflare R2 upload/delete
│   ├── store/
│   │   ├── repo.ts                 # Unified CRUD interface
│   │   ├── mem-store.ts            # In-memory fallback store
│   │   ├── firestore-repo.ts       # Real Firestore backend
│   │   └── seed.ts                 # Initial demo data
│   ├── auth/
│   │   ├── session.ts              # getSessionUser, requireAdmin
│   │   ├── api.ts                  # loginWithEmail, signupWithEmail
│   │   └── auth-context.tsx        # React context provider
│   ├── cart-context.tsx            # Cart with useSyncExternalStore
│   └── utils.ts
├── hooks/
│   └── use-crud.ts                 # Generic CRUD hook with toast feedback
└── types/index.ts                  # All TypeScript domain types
```

## Backend strategy (zero-config ready)

The app uses a **dual-backend pattern** so it runs out of the box without any external credentials, but swaps to real Firebase/R2 the moment env vars are present:

| Layer | Mock mode (default) | Production mode |
|---|---|---|
| Database | In-memory store (`mem-store.ts`) seeded with demo data | Firebase Firestore |
| Auth | Cookie-based mock auth with seeded users | Firebase Auth (email/password + custom claims for roles) |
| File storage | Local `/public/uploads/` directory | Cloudflare R2 (S3 SDK) |

All API routes call `repo.list/get/create/update/delete` which transparently routes to whichever backend is active. The admin UI never knows which one is in use — same shapes, same methods, same behavior.

## Demo credentials (mock mode)

### Admin
- Email: `admin@medidemo.com`
- Password: `admin123`
- URL: `/admin/login`

### Customer
- Email: `user@medidemo.com`
- Password: `user123`
- URL: `/login`

## Going to production (real Firebase + R2)

Set these environment variables in your hosting provider (Vercel/Cloudflare/Netlify):

```bash
# Firebase (client + admin)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=medidemo
R2_PUBLIC_URL=https://cdn.medidemo.com
```

The moment `NEXT_PUBLIC_FIREBASE_API_KEY` + `NEXT_PUBLIC_FIREBASE_PROJECT_ID` + `NEXT_PUBLIC_FIREBASE_APP_ID` are all set, the app automatically switches from mock mode to real Firebase. Same for R2.

### Initial Firebase setup
1. Create a Firebase project
2. Enable **Authentication** → **Email/Password**
3. Enable **Firestore Database** (production mode)
4. Create the admin user in Auth, then set custom claims:
   ```bash
   firebase firestore:rules  # see below
   firebase functions:shell
   > await admin.auth().setCustomUserClaims('UID_HERE', { role: 'admin', status: 'active' })
   ```
5. Create a Cloudflare R2 bucket and API token with Object Read & Write permissions

### Firestore security rules (recommended)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for active catalog
    match /products/{id} { allow read: if resource.data.status == 'active'; }
    match /categories/{id} { allow read: if resource.data.visibility == 'active'; }
    match /brands/{id} { allow read: if resource.data.visibility == 'active'; }
    match /offers/{id} { allow read: if resource.data.visibility == 'active'; }
    match /banners/{id} { allow read: if resource.data.visibility == 'active'; }
    match /lab_packages/{id} { allow read: if resource.data.visibility == 'active'; }
    match /lab_tests/{id} { allow read: if resource.data.visibility == 'active'; }
    match /health_concerns/{id} { allow read: if true; }
    match /settings/{id} { allow read: if true; }

    // Users can read/update their own records
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.role in ['admin', 'manager']);
      allow create: if request.auth != null;
    }
    match /transactions/{id} {
      allow read: if request.auth != null && request.auth.token.role in ['admin', 'manager'];
    }

    // Everything else (employees, support_tickets): admin-only
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.role in ['admin', 'manager'];
    }
  }
}
```

## Scripts

```bash
bun run dev      # Start dev server (port 3000)
bun run lint     # ESLint check
bun run build    # Production build
```

## Verified workflows

The following user flows have been tested end-to-end with Agent Browser:

1. **Admin login** → dashboard loads with real stats from `/api/admin/stats`
2. **Admin adds product** → modal opens, form submits, product appears in table
3. **Customer login** → redirects to home
4. **Customer browses product** → detail page loads with stock info
5. **Customer adds to cart** → cart page shows item
6. **Customer places order** → order created, cart cleared, order appears in `/orders`
7. **Admin updates order status** → modal opens, status saved, table updates
8. **All 30 routes return 200** (storefront + admin + APIs)
