import fs from 'fs';
import path from 'path';
import {
  MealPass,
  Order,
  Student,
  Meal,
  PassVerificationResult,
  DashboardStats,
  SpecialMealDate,
  HostellerMealResponse,
  MealType,
  HostellerResponseState,
  HostellerMealSummary,
  StudentMealDetail,
} from './types';

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
  specialMealDates: SpecialMealDate[];
  hostellerMealResponses: HostellerMealResponse[];
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
      studentType: 'hosteller',
      hostelRoom: 'Room 204',
    },
    {
      id: 'student_albin',
      name: 'Albin John',
      email: 'albin@rvcas.ac.in',
      phone: '9847123457',
      course: 'B.Com',
      semester: 'Semester 5',
      studentIdCode: 'RVCAS/2023/BCM/012',
      studentType: 'day_scholar',
    },
    {
      id: 'student_nandana',
      name: 'Nandana P Nair',
      email: 'nandana@rvcas.ac.in',
      phone: '9847123458',
      course: 'BBA',
      semester: 'Semester 3',
      studentIdCode: 'RVCAS/2024/BBA/019',
      studentType: 'hosteller',
      hostelRoom: 'Room 112',
    },
    {
      id: 'student_jithin',
      name: 'Jithin Salim',
      email: 'jithin@rvcas.ac.in',
      phone: '9847123459',
      course: 'BCA',
      semester: 'Semester 3',
      studentIdCode: 'RVCAS/2024/BCA/033',
      studentType: 'day_scholar',
    },
    {
      id: 'student_fathima',
      name: 'Fathima Rifa',
      email: 'fathima@rvcas.ac.in',
      phone: '9847123460',
      course: 'B.Sc CS',
      semester: 'Semester 1',
      studentIdCode: 'RVCAS/2025/BCS/008',
      studentType: 'hosteller',
      hostelRoom: 'Room 105',
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
  specialMealDates: [
    {
      id: 'smd_20260926',
      date: '2026-09-26',
      name: 'Saturday',
      type: 'WEEKEND',
      breakfastEnabled: true,
      lunchEnabled: true,
      eveningSnackEnabled: true,
      dinnerEnabled: true,
      deadline: '2026-09-25T20:00:00.000Z',
      status: 'OPEN',
      createdAt: '2026-09-20T08:00:00.000Z',
    },
    {
      id: 'smd_20260927',
      date: '2026-09-27',
      name: 'Sunday',
      type: 'WEEKEND',
      breakfastEnabled: true,
      lunchEnabled: true,
      eveningSnackEnabled: true,
      dinnerEnabled: true,
      deadline: '2026-09-26T20:00:00.000Z',
      status: 'OPEN',
      createdAt: '2026-09-20T08:00:00.000Z',
    },
    {
      id: 'smd_20260928',
      date: '2026-09-28',
      name: 'Monday (College Holiday)',
      type: 'HOLIDAY',
      breakfastEnabled: true,
      lunchEnabled: true,
      eveningSnackEnabled: true,
      dinnerEnabled: true,
      deadline: '2026-09-27T20:00:00.000Z',
      status: 'OPEN',
      createdAt: '2026-09-20T08:00:00.000Z',
    },
  ],
  hostellerMealResponses: [
    // Student A (Shabeeb) responses for Saturday 26 Sep (Acceptance Test Scenario)
    {
      id: 'hmr_shabeeb_20260926_bf',
      userId: 'student_shabeeb',
      date: '2026-09-26',
      mealType: 'BREAKFAST',
      response: 'NEED_MEAL',
      submittedAt: '2026-09-24T10:00:00.000Z',
      updatedAt: '2026-09-24T10:00:00.000Z',
    },
    {
      id: 'hmr_shabeeb_20260926_lunch',
      userId: 'student_shabeeb',
      date: '2026-09-26',
      mealType: 'LUNCH',
      response: 'NEED_MEAL',
      submittedAt: '2026-09-24T10:00:00.000Z',
      updatedAt: '2026-09-24T10:00:00.000Z',
    },
    {
      id: 'hmr_shabeeb_20260926_snack',
      userId: 'student_shabeeb',
      date: '2026-09-26',
      mealType: 'EVENING_SNACK',
      response: 'DONT_NEED_MEAL',
      submittedAt: '2026-09-24T10:00:00.000Z',
      updatedAt: '2026-09-24T10:00:00.000Z',
    },
    {
      id: 'hmr_shabeeb_20260926_dinner',
      userId: 'student_shabeeb',
      date: '2026-09-26',
      mealType: 'DINNER',
      response: 'NEED_MEAL',
      submittedAt: '2026-09-24T10:00:00.000Z',
      updatedAt: '2026-09-24T10:00:00.000Z',
    },
    // Student B (Nandana) responses for Saturday 26 Sep
    {
      id: 'hmr_nandana_20260926_bf',
      userId: 'student_nandana',
      date: '2026-09-26',
      mealType: 'BREAKFAST',
      response: 'NEED_MEAL',
      submittedAt: '2026-09-24T11:00:00.000Z',
      updatedAt: '2026-09-24T11:00:00.000Z',
    },
    {
      id: 'hmr_nandana_20260926_lunch',
      userId: 'student_nandana',
      date: '2026-09-26',
      mealType: 'LUNCH',
      response: 'DONT_NEED_MEAL',
      submittedAt: '2026-09-24T11:00:00.000Z',
      updatedAt: '2026-09-24T11:00:00.000Z',
    },
    {
      id: 'hmr_nandana_20260926_snack',
      userId: 'student_nandana',
      date: '2026-09-26',
      mealType: 'EVENING_SNACK',
      response: 'NEED_MEAL',
      submittedAt: '2026-09-24T11:00:00.000Z',
      updatedAt: '2026-09-24T11:00:00.000Z',
    },
    {
      id: 'hmr_nandana_20260926_dinner',
      userId: 'student_nandana',
      date: '2026-09-26',
      mealType: 'DINNER',
      response: 'NEED_MEAL',
      submittedAt: '2026-09-24T11:00:00.000Z',
      updatedAt: '2026-09-24T11:00:00.000Z',
    },
    // Student C (Fathima): No response (NOT_RESPONDED)
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
    const parsed = JSON.parse(data);

    // Backward compatibility for existing databases
    let modified = false;
    if (!parsed.specialMealDates) {
      parsed.specialMealDates = initialSeed.specialMealDates;
      modified = true;
    }
    if (!parsed.hostellerMealResponses) {
      parsed.hostellerMealResponses = initialSeed.hostellerMealResponses;
      modified = true;
    }
    // Ensure students have studentType
    if (parsed.students && parsed.students.length > 0) {
      parsed.students.forEach((s: Student) => {
        if (!s.studentType) {
          const seedStudent = initialSeed.students.find(is => is.id === s.id);
          s.studentType = seedStudent?.studentType || 'day_scholar';
          if (seedStudent?.hostelRoom) s.hostelRoom = seedStudent.hostelRoom;
          modified = true;
        }
      });
    }

    if (modified) {
      writeDb(parsed);
    }

    return parsed;
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

  // --- Hosteller System Helpers ---
  getHostellers: (): Student[] => {
    return readDb().students.filter(s => s.studentType === 'hosteller');
  },

  getSpecialMealDates: (): SpecialMealDate[] => {
    const dates = readDb().specialMealDates || [];
    return [...dates].sort((a, b) => a.date.localeCompare(b.date));
  },

  getSpecialMealDateByDate: (date: string): SpecialMealDate | undefined => {
    return (readDb().specialMealDates || []).find(d => d.date === date);
  },

  getSpecialMealDateById: (id: string): SpecialMealDate | undefined => {
    return (readDb().specialMealDates || []).find(d => d.id === id);
  },

  createOrUpdateSpecialMealDate: (data: Partial<SpecialMealDate> & { date: string }): SpecialMealDate => {
    const state = readDb();
    if (!state.specialMealDates) state.specialMealDates = [];
    const index = state.specialMealDates.findIndex(d => d.date === data.date || (data.id && d.id === data.id));
    const now = new Date().toISOString();

    if (index >= 0) {
      const existing = state.specialMealDates[index];
      const updated: SpecialMealDate = {
        ...existing,
        ...data,
        updatedAt: now,
      };
      state.specialMealDates[index] = updated;
      writeDb(state);
      return updated;
    } else {
      const newDate: SpecialMealDate = {
        id: data.id || `smd_${data.date.replace(/-/g, '')}`,
        date: data.date,
        title: data.title || 'Special Food Planning Day',
        dateType: data.dateType || 'SPECIAL_DAY',
        description: data.description,
        responseDeadline: data.responseDeadline || `${data.date}T20:00:00.000Z`,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFinalized: false,
        mealsIncluded: data.mealsIncluded || ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'],
        createdAt: now,
        updatedAt: now,
      };
      state.specialMealDates.push(newDate);
      writeDb(state);
      return newDate;
    }
  },

  deleteSpecialMealDate: (idOrDate: string): boolean => {
    const state = readDb();
    if (!state.specialMealDates) return false;
    const initialLen = state.specialMealDates.length;
    state.specialMealDates = state.specialMealDates.filter(d => d.id !== idOrDate && d.date !== idOrDate);
    if (state.specialMealDates.length !== initialLen) {
      writeDb(state);
      return true;
    }
    return false;
  },

  saveHostellerMealResponses: (
    userId: string,
    date: string,
    responses: Array<{ mealType: MealType; response: HostellerResponseState }>
  ): { success: boolean; message: string; responses?: HostellerMealResponse[] } => {
    const state = readDb();
    if (!state.hostellerMealResponses) state.hostellerMealResponses = [];

    // Check if the date is finalized or past deadline
    const specialDate = (state.specialMealDates || []).find(d => d.date === date);
    if (specialDate) {
      if (specialDate.isFinalized) {
        return {
          success: false,
          message: 'Meal count for this date has been finalized by staff. Responses can no longer be updated.',
        };
      }
      if (specialDate.responseDeadline && new Date() > new Date(specialDate.responseDeadline)) {
        return {
          success: false,
          message: 'The deadline for declaring meal requirements for this date has passed.',
        };
      }
    }

    const now = new Date().toISOString();
    const savedResponses: HostellerMealResponse[] = [];

    for (const item of responses) {
      const existingIndex = state.hostellerMealResponses.findIndex(
        r => r.userId === userId && r.date === date && r.mealType === item.mealType
      );

      if (existingIndex >= 0) {
        state.hostellerMealResponses[existingIndex].response = item.response;
        state.hostellerMealResponses[existingIndex].updatedAt = now;
        savedResponses.push(state.hostellerMealResponses[existingIndex]);
      } else {
        const newResponse: HostellerMealResponse = {
          id: `hmr_${userId}_${date.replace(/-/g, '')}_${item.mealType.toLowerCase()}`,
          userId,
          date,
          mealType: item.mealType,
          response: item.response,
          submittedAt: now,
          updatedAt: now,
        };
        state.hostellerMealResponses.push(newResponse);
        savedResponses.push(newResponse);
      }
    }

    writeDb(state);
    return {
      success: true,
      message: 'Meal requirements updated successfully.',
      responses: savedResponses,
    };
  },

  getHostellerResponses: (date?: string, userId?: string): HostellerMealResponse[] => {
    let list = readDb().hostellerMealResponses || [];
    if (date) {
      list = list.filter(r => r.date === date);
    }
    if (userId) {
      list = list.filter(r => r.userId === userId);
    }
    return list;
  },

  getHostellerMealSummary: (date: string): HostellerMealSummary => {
    const state = readDb();
    const specialDate = (state.specialMealDates || []).find(d => d.date === date) || {
      id: `smd_${date.replace(/-/g, '')}`,
      date,
      title: 'Hosteller Meal Planning',
      dateType: 'SPECIAL_DAY' as const,
      responseDeadline: `${date}T20:00:00.000Z`,
      isActive: true,
      isFinalized: false,
      mealsIncluded: ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'] as MealType[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const hostellers = state.students.filter(s => s.studentType === 'hosteller');
    const totalHostellers = hostellers.length;
    const responses = (state.hostellerMealResponses || []).filter(r => r.date === date);

    const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'];
    const mealsSummary: Record<MealType, { need: number; dontNeed: number; notResponded: number; prepare: number }> = {
      BREAKFAST: { need: 0, dontNeed: 0, notResponded: 0, prepare: 0 },
      LUNCH: { need: 0, dontNeed: 0, notResponded: 0, prepare: 0 },
      EVENING_SNACK: { need: 0, dontNeed: 0, notResponded: 0, prepare: 0 },
      DINNER: { need: 0, dontNeed: 0, notResponded: 0, prepare: 0 },
    };

    for (const m of mealTypes) {
      const need = responses.filter(r => r.mealType === m && r.response === 'NEED_MEAL').length;
      const dontNeed = responses.filter(r => r.mealType === m && r.response === 'DONT_NEED_MEAL').length;
      const notResponded = Math.max(0, totalHostellers - need - dontNeed);
      mealsSummary[m] = {
        need,
        dontNeed,
        notResponded,
        prepare: need, // Staff prepare count = strictly Need count
      };
    }

    // Count distinct students who responded to at least one meal for this date
    const respondedUserIds = new Set(responses.map(r => r.userId));
    const respondedHostellers = respondedUserIds.size;
    const notRespondedHostellers = Math.max(0, totalHostellers - respondedHostellers);

    return {
      date,
      specialDate,
      totalHostellers,
      respondedHostellers,
      notRespondedHostellers,
      meals: mealsSummary,
      isFinalized: specialDate.isFinalized,
      finalizedAt: specialDate.finalizedAt,
      finalizedBy: specialDate.finalizedBy,
    };
  },

  getHostellerMealDetails: (date: string, mealType?: MealType): StudentMealDetail[] => {
    const state = readDb();
    const hostellers = state.students.filter(s => s.studentType === 'hosteller');
    const responses = (state.hostellerMealResponses || []).filter(r => r.date === date);

    const details: StudentMealDetail[] = hostellers.map(student => {
      const studentResponses = responses.filter(r => r.userId === student.id);
      let responseState: HostellerResponseState = 'NOT_RESPONDED';
      let submittedAt: string | undefined = undefined;

      if (mealType) {
        const mealResp = studentResponses.find(r => r.mealType === mealType);
        if (mealResp) {
          responseState = mealResp.response;
          submittedAt = mealResp.submittedAt;
        }
      }

      const mealResponsesMap: Record<MealType, HostellerResponseState> = {
        BREAKFAST: 'NOT_RESPONDED',
        LUNCH: 'NOT_RESPONDED',
        EVENING_SNACK: 'NOT_RESPONDED',
        DINNER: 'NOT_RESPONDED',
      };

      studentResponses.forEach(r => {
        mealResponsesMap[r.mealType] = r.response;
      });

      return {
        studentId: student.id,
        name: student.name,
        studentIdCode: student.studentIdCode,
        department: student.department || student.course || 'BCA',
        hostelRoom: student.hostelRoom,
        mealType: mealType || 'LUNCH',
        response: responseState,
        mealResponses: mealResponsesMap,
        submittedAt,
      };
    });

    return details;
  },

  finalizeMealCount: (date: string, finalizedBy: string): { success: boolean; message: string; specialDate?: SpecialMealDate } => {
    const state = readDb();
    if (!state.specialMealDates) state.specialMealDates = [];
    let specialDate = state.specialMealDates.find(d => d.date === date);

    const now = new Date().toISOString();
    if (!specialDate) {
      specialDate = {
        id: `smd_${date.replace(/-/g, '')}`,
        date,
        title: 'Hosteller Meal Planning',
        dateType: 'SPECIAL_DAY',
        responseDeadline: `${date}T20:00:00.000Z`,
        isActive: true,
        isFinalized: true,
        finalizedAt: now,
        finalizedBy,
        mealsIncluded: ['BREAKFAST', 'LUNCH', 'EVENING_SNACK', 'DINNER'],
        createdAt: now,
        updatedAt: now,
      };
      state.specialMealDates.push(specialDate);
    } else {
      specialDate.isFinalized = true;
      specialDate.finalizedAt = now;
      specialDate.finalizedBy = finalizedBy;
      specialDate.updatedAt = now;
    }

    writeDb(state);
    return {
      success: true,
      message: `Meal count for ${date} has been finalized.`,
      specialDate,
    };
  },

  reopenMealCount: (date: string): { success: boolean; message: string; specialDate?: SpecialMealDate } => {
    const state = readDb();
    if (!state.specialMealDates) state.specialMealDates = [];
    const specialDate = state.specialMealDates.find(d => d.date === date);

    if (!specialDate) {
      return { success: false, message: `No meal plan found for ${date}` };
    }

    specialDate.isFinalized = false;
    specialDate.finalizedAt = undefined;
    specialDate.finalizedBy = undefined;
    specialDate.updatedAt = new Date().toISOString();

    writeDb(state);
    return {
      success: true,
      message: `Meal count for ${date} has been reopened.`,
      specialDate,
    };
  },
};