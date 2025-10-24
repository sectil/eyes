import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  subscriptionPlans, InsertSubscriptionPlan,
  userSubscriptions, InsertUserSubscription,
  userEyeProfiles, InsertUserEyeProfile,
  eyeTestResults, InsertEyeTestResult,
  eyeFatigueLogs, InsertEyeFatigueLog,
  exercisePrograms, InsertExerciseProgram,
  userExerciseLogs, InsertUserExerciseLog,
  eyeSimulations, InsertEyeSimulation
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Subscription Plans
export async function getActiveSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, 1));
}

export async function createSubscriptionPlan(plan: InsertSubscriptionPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptionPlans).values(plan);
}

// User Subscriptions
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const now = new Date();
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, "active"),
        gte(userSubscriptions.endDate, now)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createUserSubscription(subscription: InsertUserSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userSubscriptions).values(subscription);
}

export async function updateSubscriptionStatus(subscriptionId: number, status: "active" | "expired" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userSubscriptions)
    .set({ status, updatedAt: new Date() })
    .where(eq(userSubscriptions.id, subscriptionId));
}

// User Eye Profiles
export async function getUserEyeProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(userEyeProfiles).where(eq(userEyeProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserEyeProfile(profile: InsertUserEyeProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserEyeProfile(profile.userId);
  
  if (existing) {
    await db.update(userEyeProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userEyeProfiles.userId, profile.userId));
  } else {
    await db.insert(userEyeProfiles).values(profile);
  }
}

// Eye Test Results
export async function createEyeTestResult(result: InsertEyeTestResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eyeTestResults).values(result);
}

export async function getUserTestHistory(userId: number, testType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(eyeTestResults.userId, userId)];
  if (testType) {
    conditions.push(eq(eyeTestResults.testType, testType as any));
  }
  
  return db.select().from(eyeTestResults)
    .where(and(...conditions))
    .orderBy(desc(eyeTestResults.testDate))
    .limit(50);
}

export async function getLatestTestResult(userId: number, testType: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(eyeTestResults)
    .where(and(
      eq(eyeTestResults.userId, userId),
      eq(eyeTestResults.testType, testType as any)
    ))
    .orderBy(desc(eyeTestResults.testDate))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// Eye Fatigue Logs
export async function createEyeFatigueLog(log: InsertEyeFatigueLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eyeFatigueLogs).values(log);
}

export async function getUserFatigueLogs(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(eyeFatigueLogs.userId, userId)];
  if (startDate) conditions.push(gte(eyeFatigueLogs.logDate, startDate));
  if (endDate) conditions.push(lte(eyeFatigueLogs.logDate, endDate));
  
  return db.select().from(eyeFatigueLogs)
    .where(and(...conditions))
    .orderBy(desc(eyeFatigueLogs.logDate));
}

// Exercise Programs
export async function getActiveExercisePrograms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exercisePrograms).where(eq(exercisePrograms.isActive, 1));
}

export async function getExerciseProgramById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(exercisePrograms).where(eq(exercisePrograms.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createExerciseProgram(program: InsertExerciseProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(exercisePrograms).values(program);
}

// User Exercise Logs
export async function createUserExerciseLog(log: InsertUserExerciseLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userExerciseLogs).values(log);
}

export async function getUserExerciseLogs(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(userExerciseLogs.userId, userId)];
  if (startDate) conditions.push(gte(userExerciseLogs.completedAt, startDate));
  if (endDate) conditions.push(lte(userExerciseLogs.completedAt, endDate));
  
  return db.select().from(userExerciseLogs)
    .where(and(...conditions))
    .orderBy(desc(userExerciseLogs.completedAt));
}

export async function getUserExerciseStats(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return { totalExercises: 0, totalMinutes: 0, uniqueDays: 0 };
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await getUserExerciseLogs(userId, startDate);
  
  const totalExercises = logs.length;
  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const uniqueDays = new Set(logs.map(log => log.completedAt.toDateString())).size;
  
  return { totalExercises, totalMinutes, uniqueDays };
}

// Eye Simulations
export async function createEyeSimulation(simulation: InsertEyeSimulation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(eyeSimulations).values(simulation);
}

export async function getUserLatestSimulation(userId: number, simulationType?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const conditions = [eq(eyeSimulations.userId, userId)];
  if (simulationType) {
    conditions.push(eq(eyeSimulations.simulationType, simulationType as any));
  }
  
  const result = await db.select().from(eyeSimulations)
    .where(and(...conditions))
    .orderBy(desc(eyeSimulations.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getUserSimulationHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(eyeSimulations)
    .where(eq(eyeSimulations.userId, userId))
    .orderBy(desc(eyeSimulations.createdAt))
    .limit(20);
}

