// ─── Domain Types (single source of truth) ──────────────────────

export type Visibility = 'active' | 'hidden';
export type AdminRole = 'admin' | 'manager' | 'editor' | 'viewer';
export type UserRole = 'patient' | 'doctor' | 'lab_tech' | 'admin';
export type OrderStatus = 'Delivered' | 'In Transit' | 'Processing' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type OrderType = 'medicine' | 'lab';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Closed';
export type TicketPriority = 'High' | 'Medium' | 'Low';
export type TxnStatus = 'Completed' | 'Pending' | 'Refunded' | 'Failed';

// Product Types
export type ProductType =
  | 'Medicine'
  | 'OTC Medicine'
  | 'Vitamins & Supplements'
  | 'Ayurveda'
  | 'Homeopathy'
  | 'Healthcare Device'
  | 'Personal Care'
  | 'Skin Care'
  | 'Hair Care'
  | 'Sexual Wellness'
  | 'Diabetes Care'
  | 'Elderly Care'
  | 'Baby Care'
  | 'Health Food'
  | 'Other';

export type ProductStatus = 'Active' | 'Draft' | 'Inactive';
export type DosageForm =
  | 'Tablet' | 'Capsule' | 'Syrup' | 'Suspension' | 'Injection' | 'Drops'
  | 'Eye Drops' | 'Ear Drops' | 'Nasal Drops' | 'Cream' | 'Ointment' | 'Gel'
  | 'Lotion' | 'Powder' | 'Sachet' | 'Spray' | 'Inhaler' | 'Mouthwash'
  | 'Solution' | 'Oil' | 'Shampoo' | 'Soap' | 'Patch' | 'Suppository'
  | 'Granules' | 'Other';

export type PackUnit =
  | 'Tablet' | 'Capsule' | 'ml' | 'mg' | 'g' | 'kg' | 'Piece' | 'Bottle'
  | 'Strip' | 'Tube' | 'Box' | 'Vial' | 'Ampoule' | 'Sachet' | 'Pack';

export type RouteOfAdministration =
  | 'Oral' | 'Topical' | 'Injection' | 'Ophthalmic' | 'Otic' | 'Nasal'
  | 'Inhalation' | 'Rectal' | 'Other';

export type ScheduleType = 'Not Applicable' | 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'Other';

export type StorageCondition =
  | 'Room Temperature' | 'Refrigerated' | 'Frozen'
  | 'Protect from Light' | 'Protect from Moisture' | 'Other';

export interface Composition {
  salt: string;
  strength: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  dosageForm?: DosageForm;
  strengthValue?: string;
  strengthUnit?: string;
  packSize: number;
  packUnit: PackUnit;
  sku: string;
  barcode?: string;
  mrp: number;
  sellingPrice: number;
  purchasePrice?: number;
  tax?: number;
  weight?: number;
  image?: string;
  stock: number;
  reorderLevel?: number;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  brandId?: string;
  price: number;
  oldPrice?: number;
  note: string;
  badge?: string;
  categoryId?: string;
  subcategoryId?: string;
  status: Visibility;
  // New professional fields
  thumbnail?: string;
  gallery?: string[];
  productType?: ProductType;
  manufacturer?: string;
  marketer?: string;
  composition?: Composition[];
  dosageForm?: DosageForm;
  strengthValue?: string;
  strengthUnit?: string;
  routeOfAdministration?: RouteOfAdministration;
  therapeuticCategory?: string;
  drugClass?: string;
  schedule?: ScheduleType;
  shortDescription?: string;
  fullDescription?: string;
  highlights?: string[];
  variants?: ProductVariant[];
  searchKeywords?: string[];
  tags?: string[];
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug?: string;
  // Status flags
  productStatus?: ProductStatus;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  // Inventory
  stock: number;
  reorderLevel: number;
  sku: string;
  // Storage
  storageCondition?: StorageCondition;
  storageInstructions?: string;
  // Customer info
  uses?: string;
  benefits?: string;
  howToUse?: string;
  dosageInfo?: string;
  precautions?: string;
  warnings?: string;
  sideEffects?: string;
  // Legacy fields kept for backward compatibility with existing data
  icon?: string;
  tint?: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  prescriptionRequired?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  tint: string;
  /** Optional image URL (uploaded to R2). When set, takes precedence over icon+tint. */
  imageUrl?: string;
  productCount?: number;
  visibility: Visibility;
  updatedAt?: number;
}

export interface HealthConcern {
  id: string;
  name: string;
  icon: string;
  tint: string;
  /** Optional image URL (uploaded to R2). When set, takes precedence over icon+tint. */
  imageUrl?: string;
  visibility?: Visibility;
}

export interface Brand {
  id: string;
  name: string;
  /** Optional logo URL (uploaded to R2). When set, takes precedence over text name. */
  logo?: string;
  /** Optional banner/cover image URL (uploaded to R2). */
  imageUrl?: string;
  visibility: Visibility;
}

export interface Offer {
  id: string;
  text: string;
  code: string;
  visibility: Visibility;
}

export interface Banner {
  id: string;
  slot: 'hero' | 'prescription' | 'essentials' | 'call' | string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  note?: string;
  badge?: string;
  imageUrl?: string;
  visibility: Visibility;
}

export interface LabPackage {
  id: string;
  name: string;
  detail: string;
  price: number;
  icon: string;
  badge?: string;
  visibility: Visibility;
  imageUrl?: string;
}

export interface LabTest {
  id: string;
  name: string;
  detail: string;
  price: number;
  visibility: Visibility;
}

export interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: string;
  status: OrderStatus;
  type: OrderType;
  prescriptionVerified?: boolean;
  prescriptionUrl?: string;
  scheduledAt?: number;
  paymentMethod?: string;
  paymentStatus?: TxnStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'blocked' | 'pending';
  phone?: string;
  lastLogin?: number;
  address?: string;
  createdAt?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: 'Pharmacists' | 'Lab Technicians' | 'Delivery Partners' | 'Admin' | string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  phone?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  customerName: string;
  subject: string;
  message?: string;
  priority: TicketPriority;
  status: TicketStatus;
  response?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  method: string;
  amount: number;
  status: TxnStatus;
  createdAt: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  prescriptionDiscountPct: number;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  maintenanceMode: boolean;
  // Payment Gateway Settings
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayEnabled?: boolean;
  codEnabled?: boolean;
  upiEnabled?: boolean;
  cardEnabled?: boolean;
  // Lab Test Booking Settings
  labTestServiceStart?: string; // e.g. "09:00"
  labTestServiceEnd?: string; // e.g. "21:00"
  labTestMaxBookingsPerDay?: number; // max bookings per customer per day
}

// ─── Admin Data Kind (for shared table component) ───────────────
export type AdminDataKind =
  | 'users'
  | 'employees'
  | 'orders'
  | 'medicine'
  | 'lab-orders'
  | 'inventory'
  | 'categories'
  | 'transactions'
  | 'support';

// ─── Auth session ────────────────────────────────────────────────
export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole | AdminRole;
  status?: string;
}

// ─── Product Review ─────────────────────────────────────────────
export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  updatedAt?: number;
}
