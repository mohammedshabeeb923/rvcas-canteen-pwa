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
  studentType?: 'day_scholar' | 'hosteller';
  hostelRoom?: string;
  department?: string;
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

// ==========================================
// HOSTELLER MEAL REQUIREMENT & PLANNING TYPES
// ==========================================

export type MealType = 'BREAKFAST' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER';

export type HostellerResponseState = 'NEED_MEAL' | 'DONT_NEED_MEAL' | 'NOT_RESPONDED';

export type SpecialDateType = 'WEEKEND' | 'HOLIDAY' | 'VACATION' | 'SPECIAL_DAY' | 'OTHER';

export interface SpecialMealDate {
  id: string;
  date: string; // YYYY-MM-DD
  name?: string;
  title?: string;
  type?: SpecialDateType;
  dateType?: SpecialDateType;
  description?: string;
  breakfastEnabled?: boolean;
  lunchEnabled?: boolean;
  eveningSnackEnabled?: boolean;
  dinnerEnabled?: boolean;
  mealsIncluded?: MealType[];
  deadline?: string; // ISO date-time string
  responseDeadline?: string; // ISO date-time string
  status?: 'OPEN' | 'CLOSED' | 'FINALIZED';
  isActive?: boolean;
  isFinalized?: boolean;
  finalizedAt?: string;
  finalizedBy?: string;
  finalizedCounts?: {
    BREAKFAST?: number;
    LUNCH?: number;
    EVENING_SNACK?: number;
    DINNER?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface HostellerMealResponse {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  response: HostellerResponseState;
  submittedAt: string;
  updatedAt: string;
}

export interface MealCountSummary {
  need: number;
  dontNeed: number;
  notResponded: number;
  prepare: number;
  mealType?: MealType;
}

export interface HostellerMealSummary {
  date: string;
  specialDate?: SpecialMealDate;
  totalHostellers: number;
  respondedHostellers?: number;
  notRespondedHostellers?: number;
  meals: Record<MealType, MealCountSummary>;
  status?: 'OPEN' | 'CLOSED' | 'FINALIZED';
  isFinalized?: boolean;
  finalizedAt?: string;
  finalizedBy?: string;
  deadlinePassed?: boolean;
}

export interface StudentMealDetail {
  student?: Student;
  studentId?: string;
  name: string;
  studentIdCode: string;
  department: string;
  hostelRoom?: string;
  mealType?: MealType;
  response: HostellerResponseState | 'NOT_RESPONDED';
  mealResponses?: Record<MealType, HostellerResponseState>;
  submittedAt?: string;
  updatedAt?: string;
}

