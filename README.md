# Balaji Medical Store — E-Commerce & Healthcare Platform

A modern full-stack web application for online pharmaceutical retail, diagnostic lab test bookings, prescription verification, and comprehensive pharmacy administration.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and dual backend capability (**Firebase Firestore / Secure In-Memory Data Layer**).

---

## 📑 Features

### 🛍️ Storefront & Customer Portal
- **Catalog & Discovery**: Multi-tier categorization (Medicines, Wellness, Healthcare Devices, Ayurveda, Personal Care), brand filtering, and real-time search.
- **Diagnostic Lab Tests**: Browse full-body checkups, specialized diagnostic profiles, and automated home collection booking.
- **Prescription Workflow**: Seamless upload & digital prescription verification mechanism during checkout.
- **Cart & Dynamic Checkout**: State-persistent cart via React 19 external store sync, discount calculations, free delivery threshold evaluation, and multiple payment modes (Cash on Delivery, UPI, Cards).
- **Customer Account**: Order tracking, prescription vault, booking management, and profile customization.

### 🛡️ Administration & Operations Portal
- **Executive Dashboard**: Real-time sales analytics, revenue trends, top-selling inventory velocity, and operational alerts.
- **Catalog Management**: Granular product creation with dosage formulations, composition salts, therapeutic classes, variants, and image gallery uploads (Cloudflare R2 S3-compatible storage).
- **Order Fulfillment**: Dedicated pipelines for Medicine orders and Lab test sample collection appointments with lifecycle state transitions.
- **Inventory & Restock Controls**: Real-time stock status monitoring, low-stock threshold triggers, and SKU management.
- **Customer Care & Auditing**: Support ticketing triage, financial transaction tracking, user access management, and global system configuration.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, Modern OKLCH Color Design System |
| **Icons & Typography** | Google Material Symbols, Geist Sans / Mono, Manrope |
| **Data Access Layer** | Unified Repository Pattern (`src/lib/store/repo.ts`) |
| **Database** | Firebase Firestore (Production) / In-Memory Mock Store (Local Dev) |
| **Storage** | Cloudflare R2 / AWS S3 SDK for Prescriptions & Media Assets |
| **Feedback & Notifications** | Sonner Toast System |

---

## 📂 Project Structure

```
├── public/                     # Static media & optimized imagery
├── src/
│   ├── app/                    # Next.js App Router (Storefront + Admin)
│   │   ├── (storefront)/       # Customer pages (products, lab-tests, cart, checkout)
│   │   ├── admin/              # Management workspace
│   │   └── api/                # Edge & Node runtime REST API endpoints
│   ├── components/
│   │   ├── admin/              # Admin CRUD pages, tables, forms, stat widgets
│   │   ├── layout/             # Responsive headers, bottom nav, footers
│   │   ├── store/              # Product cards, carousels, review components
│   │   └── ui/                 # Core atom components (Accordion, Icon, Sonner)
│   ├── hooks/                  # Custom React hooks (useCrud, useMobile, useToast)
│   ├── lib/
│   │   ├── auth/               # Session & authentication management
│   │   ├── firebase/           # Firebase Admin & Client configuration
│   │   ├── r2/                 # S3/R2 Cloud storage adapters
│   │   ├── store/              # Unified DAL, Firestore repository & in-memory driver
│   │   ├── security.ts         # Rate limiter & payload sanitization
│   │   └── cart-context.tsx    # Reactive client-side cart provider
│   └── types/                  # Single source of truth domain models
└── tailwind.config.ts          # Tailwind theme configurations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm, pnpm, or bun

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` or configure `.env`:

```env
# Optional Firebase Production Config (Fallback to internal memory store if omitted)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudflare R2 Object Storage (Optional for file uploads)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-domain.r2.dev
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Code Standards

- **Payload Sanitization**: Server-side XSS and script stripping on all input payloads.
- **In-Memory Rate Limiting**: Built-in sliding-window protection across public endpoints.
- **Role-Based Access Control**: Route protection and admin auth token verification.

---

## 📜 License
Copyright © Balaji Medical Store. All rights reserved.
