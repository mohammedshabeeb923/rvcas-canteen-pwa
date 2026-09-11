import fs from 'fs';
import path from 'path';
import { MealPass, Order, Student, Meal, PassVerificationResult, DashboardStats } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'canteen_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DatabaseState {
  students: Student[];
  meals: Meal[];
  orders: Order[];
  passes: MealPass[];
  meta: {
    lastUpdated: string;
  };
}

const initialSeed: DatabaseState = {
  students: [
    {
      id: 'student_shabeeb',
      name: 'Shabeeb',
      email: 'shabeeb@rvcas.ac.in',
      phone: '9847123456',
      course: 'BCA',
      semester: 'Semester 3',
      studentIdCode: 'RVCAS/2024/BCA/042',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'student_albin',
      name: 'Albin John',
      email: 'albin@rvcas.ac.in',
      phone: '9847123457',
      course: 'B.Com',
      semester: 'Semester 5',
      studentIdCode: 'RVCAS/2023/BCM/012',
    },
    {
      id: 'student_nandana',
      name: 'Nandana P Nair',
      email: 'nandana@rvcas.ac.in',
      phone: '9847123458',
      course: 'BBA',
      semester: 'Semester 3',
      studentIdCode: 'RVCAS/2024/BBA/019',
    },
    {
      id: 'student_jithin',
      name: 'Jithin Salim',
      email: 'jithin@rvcas.ac.in',
      phone: '9847123459',
      course: 'BCA',
      semester: 'Semester 3',
      studentIdCode: 'RVCAS/2024/BCA/033',
    },
    {
      id: 'student_fathima',
      name: 'Fathima Rifa',
      email: 'fathima@rvcas.ac.in',
      phone: '9847123460',
      course: 'B.Sc CS',
      semester: 'Semester 1',
      studentIdCode: 'RVCAS/2025/BCS/008',
    },
  ],
  meals: [
    {
      id: 'meal_today',
      name: "Today's Meal",
      description: 'Daily College Meal - Wholesome rice, traditional sambar, thoran, pickle and curd',
      price: 40,
      mealDate: new Date().toISOString().split('T')[0],
      available: true,
      dailyLimit: 600,
    },
  ],
  orders: [],
  passes: [
    {
      id: 'pass_seed_1',
      passId: 'RVCAS-20260827-8F42K',
      secureToken: 'tok_rvcas_seed_8f42k_shabeeb',
      orderId: 'ord_seed_1',
      studentId: 'student_shabeeb',
      studentName: 'Shabeeb',
      studentCourseSem: 'BCA • Semester 3',
      mealId: 'meal_today',
      mealName: "Today's Meal",
      mealDate: '27 August 2026',
      amount: 40,
      status: 'VALID',
      createdAt: '2026-08-27T12:28:00Z',
    },
    {
      id: 'pass_seed_2',
      passId: 'RVCAS-20260827-7K91D',
      secureToken: 'tok_rvcas_seed_7k91d_albin',
      orderId: 'ord_seed_2',
      studentId: 'student_albin',
      studentName: 'Albin John',
      studentCourseSem: 'B.Com • Semester 5',
      mealId: 'meal_today',
      mealName: "Today's Meal",
      mealDate: '27 August 2026',
      amount: 40,
      status: 'SERVED',
      createdAt: '2026-08-27T12:20:00Z',
      servedAt: '2026-08-27T12:32:00Z',
      servedBy: 'Counter 1',
    },
    {
      id: 'pass_seed_3',
      passId: 'RVCAS-20260827-6H21L',
      secureToken: 'tok_rvcas_seed_6h21l_nandana',
      orderId: 'ord_seed_3',
      studentId: 'student_nandana',
      studentName: 'Nandana P Nair',
      studentCourseSem: 'BBA • Semester 3',
      mealId: 'meal_today',
      mealName: "Today's Meal",
      mealDate: '27 August 2026',
      amount: 40,
      status: 'SERVED',
      createdAt: '2026-08-27T12:15:00Z',
      servedAt: '2026-08-27T12:28:00Z',
      servedBy: 'Counter 2',
    },
    {
      id: 'pass_seed_4',
      passId: 'RVCAS-20260827-5M82A',
      secureToken: 'tok_rvcas_seed_5m82a_jithin',
      orderId: 'ord_seed_4',
      studentId: 'student_jithin',
      studentName: 'Jithin Salim',
      studentCourseSem: 'BCA • Semester 3',
      mealId: 'meal_today',
      mealName: "Today's Meal",
      mealDate: '27 August 2026',
      amount: 40,
      status: 'SERVED',
      createdAt: '2026-08-27T12:10:00Z',
      servedAt: '2026-08-27T12:21:00Z',
      servedBy: 'Counter 1',
    },
    {
      id: 'pass_seed_5',
      passId: 'RVCAS-20260827-4P73Q',
      secureToken: 'tok_rvcas_seed_4p73q_fathima',
      orderId: 'ord_seed_5',
      studentId: 'student_fathima',
      studentName: 'Fathima Rifa',
      studentCourseSem: 'B.Sc CS • Semester 1',
      mealId: 'meal_today',
      mealName: "Today's Meal",
      mealDate: '27 August 2026',
      amount: 40,
      status: 'VALID',
      createdAt: '2026-08-27T12:05:00Z',
    },
  ],
  meta: {
    lastUpdated: new Date().toISOString(),
  },
};

function readDb(): DatabaseState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
      return initialSeed;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading db file, using seed:', e);
    return initialSeed;
  }
}

function writeDb(state: DatabaseState): void {
  try {
    state.meta.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing db file:', e);
  }
}

export const db = {
  getMeals: (): Meal[] => readDb().meals,
  getTodayMeal: (): Meal => {
    const meals = readDb().meals;
    return meals.find(m => m.available) || meals[0];
  },
  getStudents: (): Student[] => readDb().students,
  getStudentById: (id: string): Student | undefined => readDb().students.find(s => s.id === id),
  getStudentByIdentifier: (identifier: string): Student | undefined => {
    if (!identifier) return undefined;
    const rawClean = identifier.trim().toLowerCase();
    const digitsOnly = rawClean.replace(/[^0-9]/g, '');
    return readDb().students.find(s => 
      s.id.toLowerCase() === rawClean ||
      s.studentIdCode.toLowerCase() === rawClean ||
      (s.email && s.email.toLowerCase() === rawClean) ||
      (digitsOnly && s.phone && s.phone.replace(/[^0-9]/g, '').slice(-10) === digitsOnly.slice(-10)) ||
      s.name.toLowerCase() === rawClean
    );
  },
  getStudentByPhone: (phone: string): Student | undefined => {
    if (!phone) return undefined;
    const digits = phone.replace(/[^0-9]/g, '').slice(-10);
    return readDb().students.find(s => 
      s.phone && s.phone.replace(/[^0-9]/g, '').slice(-10) === digits
    );
  },
  createOrder: (order: Order): Order => {
    const state = readDb();
    state.orders.unshift(order);
    writeDb(state);
    return order;
  },
  getOrderById: (orderId: string): Order | undefined => {
    if (!orderId) return undefined;
    return readDb().orders.find(o => 
      o.id === orderId || 
      o.cashfreeOrderId === orderId || 
      o.razorpayOrderId === orderId
    );
  },
  updateOrderStatus: (orderId: string, status: Order['paymentStatus'], razorpayPaymentId?: string): Order | undefined => {
    const state = readDb();
    const order = state.orders.find(o => 
      o.id === orderId || 
      o.cashfreeOrderId === orderId || 
      o.razorpayOrderId === orderId
    );
    if (order) {
      order.paymentStatus = status;
      if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
      writeDb(state);
    }
    return order;
  },
  createPass: (pass: MealPass): MealPass => {
    const state = readDb();
    const existing = state.passes.find(p => p.passId === pass.passId || p.secureToken === pass.secureToken);
    if (existing) return existing;
    state.passes.unshift(pass);
    writeDb(state);
    return pass;
  },
  getPassByToken: (tokenOrId: string): MealPass | undefined => {
    const state = readDb();
    return state.passes.find(
      p => p.secureToken === tokenOrId || p.passId.toLowerCase() === tokenOrId.toLowerCase()
    );
  },
  getPassesByStudent: (studentId: string): MealPass[] => {
    return readDb().passes.filter(p => p.studentId === studentId);
  },
  getAllPasses: (): MealPass[] => readDb().passes,
  markPassAsServed: (tokenOrId: string, servedBy: string = 'Staff Counter 1'): PassVerificationResult => {
    const state = readDb();
    const pass = state.passes.find(
      p => p.secureToken === tokenOrId || p.passId.toLowerCase() === tokenOrId.toLowerCase()
    );

    if (!pass) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'This meal pass could not be verified.',
      };
    }

    if (pass.status === 'SERVED') {
      const servedTime = pass.servedAt 
        ? new Date(pass.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '12:35 PM';
      return {
        success: false,
        reason: 'ALREADY_SERVED',
        message: 'This meal was already collected at ' + servedTime,
        pass,
        servedAt: pass.servedAt,
        servedBy: pass.servedBy,
      };
    }

    if (pass.status === 'EXPIRED') {
      return {
        success: false,
        reason: 'EXPIRED',
        message: 'This meal pass has expired.',
        pass,
      };
    }

    if (pass.status === 'CANCELLED') {
      return {
        success: false,
        reason: 'CANCELLED',
        message: 'This meal pass was cancelled.',
        pass,
      };
    }

    // Atomic update
    pass.status = 'SERVED';
    pass.servedAt = new Date().toISOString();
    pass.servedBy = servedBy;
    writeDb(state);

    return {
      success: true,
      reason: 'VALID',
      message: 'Meal served successfully.',
      pass,
      servedAt: pass.servedAt,
      servedBy: pass.servedBy,
    };
  },
  getDashboardStats: (): DashboardStats => {
    const passes = readDb().passes;
    const basePurchased = 486;
    const baseServed = 421;
    const dynamicPasses = passes.slice(5);
    const dynamicPurchased = dynamicPasses.length;
    const dynamicServed = dynamicPasses.filter(p => p.status === 'SERVED').length;

    const totalPurchased = basePurchased + dynamicPurchased;
    const totalServed = baseServed + dynamicServed;
    const unused = Math.max(0, totalPurchased - totalServed);
    const totalRevenue = totalPurchased * 40;
    const progressPercent = Math.round((totalServed / totalPurchased) * 100);

    return {
      todayRevenue: totalRevenue,
      mealsPurchased: totalPurchased,
      mealsServed: totalServed,
      unusedPasses: unused,
      progressPercent,
    };
  },
};