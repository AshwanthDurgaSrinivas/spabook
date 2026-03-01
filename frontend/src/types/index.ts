// =====================================================
// SpaBook Pro - TypeScript Type Definitions
// =====================================================

// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  preferredLanguage: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  lastLoginAt?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId?: string;
  businessId: string;
  customerCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  segment: 'vip' | 'regular' | 'new' | 'dormant' | 'at-risk';
  lifetimeValue: number;
  totalVisits: number;
  totalSpent: number;
  averageOrderValue: number;
  firstVisitDate?: string;
  lastVisitDate?: string;
  preferredEmployee?: string;
  preferences: Record<string, any>;
  allergies?: string;
  medicalConditions?: string;
  skinType?: string;
  hairType?: string;
  notes?: string;
  tags: string[];
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId?: string;
  businessId: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  hireDate?: string;
  department?: string;
  designation?: string;
  specializationTags: string[];
  bio?: string;
  skills: Record<string, any>;
  certifications: any[];
  licenseNumber?: string;
  licenseExpiry?: string;
  commissionRate: number;
  isVipTherapist: boolean;
  priorityScore: number;
  maxDailyBookings: number;
  breakDurationMinutes: number;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  rating?: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export interface ServiceCategory {
  id: string;
  businessId: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories?: ServiceCategory[];
}

export interface Service {
  id: string;
  businessId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  benefits: string[];
  contraindications: string[];
  prerequisites?: string;
  aftercareInstructions?: string;
  durationMinutes: number;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  basePrice: number;
  costPrice?: number;
  taxRate: number;
  maxCapacity: number;
  minAge?: number;
  genderRestriction?: 'male' | 'female' | 'any';
  imageUrls: string[];
  videoUrl?: string;
  isPackage: boolean;
  isAddon: boolean;
  isRecurringAvailable: boolean;
  requiresConsultation: boolean;
  popularityScore: number;
  displayOrder: number;
  status: 'active' | 'inactive' | 'draft';
  category?: ServiceCategory;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  bookingNumber: string;
  businessId: string;
  locationId?: string;
  customerId?: string;
  employeeId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  source: 'web' | 'phone' | 'walk_in' | 'app' | 'api';
  bookingType: 'single' | 'package' | 'recurring' | 'group';
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  notes?: string;
  internalNotes?: string;
  specialRequests?: string;
  isVipBooking: boolean;
  priority: number;
  qrCode?: string;
  checkedInAt?: string;
  completedAt?: string;
  customer?: Customer;
  services: BookingService[];
  pointsEarned?: number;
  pointsRedeemed?: number;
  totalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  employeeId?: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  totalPrice: number;
  employeeCommission: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  service?: Service;
  employee?: Employee;
  room?: Room;
}

// Room Types
export interface Room {
  id: string;
  businessId: string;
  locationId?: string;
  name: string;
  code?: string;
  roomType: 'single' | 'double' | 'couple' | 'group' | 'vip';
  capacity: number;
  description?: string;
  amenities: string[];
  features: Record<string, any>;
  images: string[];
  basePricePremium: number;
  colorCode?: string;
  isActive: boolean;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId?: string;
  customerId?: string;
  paymentMethodId?: string;
  invoiceId?: string;
  amount: number;
  tipAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  paymentType: 'full' | 'partial' | 'deposit' | 'installment';
  gateway: string;
  gatewayTransactionId?: string;
  failureReason?: string;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId?: string;
  customerId?: string;
  businessId: string;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  notes?: string;
  terms?: string;
  pdfUrl?: string;
  sentAt?: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

// Inventory Types
export interface Product {
  id: string;
  businessId: string;
  categoryId?: string;
  sku?: string;
  name: string;
  description?: string;
  barcode?: string;
  unitOfMeasure: string;
  purchasePrice?: number;
  sellingPrice?: number;
  taxRate: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderLevel: number;
  reorderQuantity: number;
  expiryTrackingEnabled: boolean;
  batchTrackingEnabled: boolean;
  isSellable: boolean;
  isConsumable: boolean;
  isActive: boolean;
  stockQuantity: number;
  category?: ProductCategory;
}

export interface ProductCategory {
  id: string;
  businessId: string;
  parentId?: string;
  name: string;
  description?: string;
  isActive: boolean;
}

// Membership Types
export interface MembershipPlan {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  planType: 'time_based' | 'visit_based' | 'credit_based';
  durationMonths?: number;
  totalVisits?: number;
  totalCredits?: number;
  price: number;
  signupFee: number;
  isAutoRenewal: boolean;
  renewalPrice?: number;
  benefits: Record<string, any>;
  isFamilyPlan: boolean;
  maxFamilyMembers: number;
  isActive: boolean;
  services: MembershipPlanService[];
}

export interface MembershipPlanService {
  id: string;
  membershipPlanId: string;
  serviceId: string;
  includedVisits?: number;
  discountPercent: number;
  service?: Service;
}

export interface CustomerMembership {
  id: string;
  customerId: string;
  membershipPlanId: string;
  membershipNumber?: string;
  startDate: string;
  endDate?: string;
  totalVisitsAllowed?: number;
  visitsUsed: number;
  totalCredits?: number;
  creditsUsed: number;
  isAutoRenewal: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'frozen';
  membershipPlan?: MembershipPlan;
}

// Loyalty Types
export interface LoyaltyTier {
  id: string;
  businessId?: string;
  name: string;
  level: number;
  minPoints: number;
  pointsMultiplier: number;
  discountPercent: number;
  benefits: Record<string, any>;
  isActive: boolean;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  currentPoints: number;
  lifetimePoints: number;
  redeemedPoints: number;
  currentTierId?: string;
  tierAchievedAt?: string;
  pointsExpiryDate?: string;
  currentTier?: LoyaltyTier;
}

export interface Coupon {
  id: string;
  businessId: string;
  code: string;
  name?: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  applicableServices: string[];
  applicableCategories: string[];
  usageLimitTotal?: number;
  usageLimitPerCustomer: number;
  usageCount: number;
  validFrom: string;
  validUntil?: string;
  isFirstTimeOnly: boolean;
  isReferralCoupon: boolean;
  status: 'active' | 'inactive' | 'expired';
}


// Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  newCustomers: number;
  customersChange: number;
  averageRating: number;
  ratingChange: number;
  todayRevenue: number;
  totalRefunds: number;
  todayBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface ServicePerformance {
  serviceId: string;
  serviceName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  popularityScore: number;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShows: number;
  totalRevenue: number;
  totalCommission: number;
  averageRating: number;
  utilizationRate: number;
}

// Marketing Types
export interface EmailTemplate {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables: string[];
  isActive: boolean;
}

export interface MarketingCampaign {
  id: string;
  businessId: string;
  name: string;
  campaignType: 'email' | 'sms' | 'push' | 'whatsapp';
  description?: string;
  segmentCriteria: Record<string, any>;
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
}

export interface MarketingAutomation {
  id: string;
  name: string;
  trigger: string;
  description?: string;
  isActive: boolean;
  totalSends: number;
  totalOpens: number;
  totalClicks: number;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Report Types
export interface SavedReport {
  id: string;
  businessId: string;
  name: string;
  reportType: string;
  filters: Record<string, any>;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  scheduleDay?: number;
  scheduleTime?: string;
  emailRecipients: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
}

// Integration Types
export interface Integration {
  id: string;
  businessId: string;
  integrationType: string;
  provider: string;
  name?: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'payment' | 'marketing' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

// Settings Types
export interface BusinessSettings {
  general: {
    businessName: string;
    email: string;
    phone: string;
    website?: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  booking: {
    minAdvanceBooking: number;
    maxAdvanceBooking: number;
    allowSameDayBooking: boolean;
    defaultBookingDuration: number;
    bufferTimeBetweenBookings: number;
    enableWaitlist: boolean;
    enableGuestCheckout: boolean;
  };
  cancellation: {
    allowCancellation: boolean;
    cancellationDeadline: number;
    refundPolicy: 'full' | 'partial' | 'none';
    refundPercentage: number;
    noShowPenalty: boolean;
    noShowPenaltyAmount: number;
  };
  notifications: {
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    reminderTime: number;
    postServiceFollowUp: boolean;
    marketingEmails: boolean;
  };
  payments: {
    defaultPaymentGateway: string;
    acceptedPaymentMethods: string[];
    requireDeposit: boolean;
    depositPercentage: number;
    enableTips: boolean;
    taxRate: number;
  };
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  locationId?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  checkInPhotoUrl?: string;
  checkOutPhotoUrl?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  lateMinutes: number;
  earlyExitMinutes: number;
  overtimeMinutes: number;
  notes?: string;
  employee?: Employee;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'multiselect' | 'date' | 'time' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
