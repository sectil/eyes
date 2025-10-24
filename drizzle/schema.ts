import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Subscription Plans
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["trial", "monthly", "quarterly", "yearly"]).notNull(),
  durationDays: int("durationDays").notNull(),
  price: int("price").notNull().default(0),
  features: text("features"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// User Subscriptions
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// User Eye Profiles
export const userEyeProfiles = mysqlTable("userEyeProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  age: int("age").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  occupation: varchar("occupation", { length: 100 }),
  dailyScreenTime: int("dailyScreenTime").default(0),
  dailyOutdoorTime: int("dailyOutdoorTime").default(0),
  sleepHours: int("sleepHours").default(7),
  usesGlasses: int("usesGlasses").default(0),
  rightEyeDiopter: varchar("rightEyeDiopter", { length: 20 }),
  leftEyeDiopter: varchar("leftEyeDiopter", { length: 20 }),
  hasAstigmatism: int("hasAstigmatism").default(0),
  astigmatismDegree: varchar("astigmatismDegree", { length: 20 }),
  familyHistory: text("familyHistory"),
  lastEyeExam: timestamp("lastEyeExam"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserEyeProfile = typeof userEyeProfiles.$inferSelect;
export type InsertUserEyeProfile = typeof userEyeProfiles.$inferInsert;

// Eye Test Results
export const eyeTestResults = mysqlTable("eyeTestResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  testType: mysqlEnum("testType", ["snellen", "contrast", "color", "astigmatism", "convergence", "symptom"]).notNull(),
  rightEyeScore: varchar("rightEyeScore", { length: 50 }),
  leftEyeScore: varchar("leftEyeScore", { length: 50 }),
  binocularScore: varchar("binocularScore", { length: 50 }),
  rawData: text("rawData"),
  notes: text("notes"),
  testDate: timestamp("testDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EyeTestResult = typeof eyeTestResults.$inferSelect;
export type InsertEyeTestResult = typeof eyeTestResults.$inferInsert;

// Daily Eye Fatigue Logs
export const eyeFatigueLogs = mysqlTable("eyeFatigueLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: timestamp("logDate").notNull(),
  timeOfDay: mysqlEnum("timeOfDay", ["morning", "afternoon", "evening"]).notNull(),
  fatigueScore: int("fatigueScore").notNull(),
  screenTime: int("screenTime").default(0),
  symptoms: text("symptoms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EyeFatigueLog = typeof eyeFatigueLogs.$inferSelect;
export type InsertEyeFatigueLog = typeof eyeFatigueLogs.$inferInsert;

// Exercise Programs
export const exercisePrograms = mysqlTable("exercisePrograms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  durationMinutes: int("durationMinutes").notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  targetCondition: varchar("targetCondition", { length: 100 }),
  instructions: text("instructions"),
  videoUrl: varchar("videoUrl", { length: 500 }),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExerciseProgram = typeof exercisePrograms.$inferSelect;
export type InsertExerciseProgram = typeof exercisePrograms.$inferInsert;

// User Exercise Logs
export const userExerciseLogs = mysqlTable("userExerciseLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserExerciseLog = typeof userExerciseLogs.$inferSelect;
export type InsertUserExerciseLog = typeof userExerciseLogs.$inferInsert;

// AI Eye Simulations
export const eyeSimulations = mysqlTable("eyeSimulations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  simulationType: mysqlEnum("simulationType", ["myopia", "hyperopia", "astigmatism", "fatigue"]).notNull(),
  severity: int("severity").notNull(),
  parameters: text("parameters"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EyeSimulation = typeof eyeSimulations.$inferSelect;
export type InsertEyeSimulation = typeof eyeSimulations.$inferInsert;