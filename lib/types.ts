export type PassStatus = 'PAID' | 'VALID' | 'SERVED' | 'CANCELLED' | 'EXPIRED';

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  course: string;
  semester: string;
  studentIdCode: string;
  profilePhoto?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  mealDate: string;
  available: boolean;
  dailyLimit: number;
}

export interface Order {
  id: string;
  studentId: string;
  mealId: string;
  quantity: number;
  amount: number;
  paymentProvider: 'razorpay' | 'cashfree';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paymentSessionId?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  idempotencyKey?: string;
  createdAt: string;
}

export interface MealPass {
  id: string;
  passId: string; // e.g. RVCAS-20260909-A82K7
  secureToken: string; // e.g. 32-char cryptographically secure token
  orderId: string;
  studentId: string;
  studentName: string;
  studentCourseSem: string;
  mealId: string;
  mealName: string;
  mealDate: string;
  amount: number;
  status: PassStatus;
  createdAt: string;
  servedAt?: string | null;
  servedBy?: string | null;
}

export interface PassVerificationResult {
  success: boolean;
  reason?: 'VALID' | 'ALREADY_SERVED' | 'EXPIRED' | 'CANCELLED' | 'NOT_FOUND';
  message: string;
  pass?: MealPass;
  servedAt?: string | null;
  servedBy?: string | null;
}

export interface DashboardStats {
  todayRevenue: number;
  mealsPurchased: number;
  mealsServed: number;
  unusedPasses: number;
  progressPercent: number;
}
