import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  jsonb,
  decimal,
  pgEnum,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const loginMethodEnum = pgEnum('login_method', [
  'email',
  'apple',
  'google',
]);
export const testTypeEnum = pgEnum('test_type', [
  'snellen',
  'contrast',
  'color',
  'astigmatism',
  'convergence',
  'symptom',
]);
export const timeOfDayEnum = pgEnum('time_of_day', [
  'morning',
  'afternoon',
  'evening',
]);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
  gender: genderEnum('gender'),
  loginMethod: loginMethodEnum('login_method').notNull().default('email'),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastSignedIn: timestamp('last_signed_in'),
});

// Eye Profiles Table
export const eyeProfiles = pgTable('eye_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  occupation: varchar('occupation', { length: 255 }),
  dailyScreenTime: decimal('daily_screen_time', { precision: 4, scale: 1 }), // hours
  dailyOutdoorTime: decimal('daily_outdoor_time', { precision: 4, scale: 1 }), // hours
  sleepHours: decimal('sleep_hours', { precision: 3, scale: 1 }), // hours
  usesGlasses: boolean('uses_glasses').notNull().default(false),
  rightEyeDiopter: varchar('right_eye_diopter', { length: 50 }),
  leftEyeDiopter: varchar('left_eye_diopter', { length: 50 }),
  hasAstigmatism: boolean('has_astigmatism').notNull().default(false),
  astigmatismDegree: varchar('astigmatism_degree', { length: 50 }),
  familyHistory: text('family_history'),
  lastEyeExam: date('last_eye_exam'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Calibration Data Table
export const calibrationData = pgTable('calibration_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  calibrationPoints: jsonb('calibration_points').notNull(), // Array of {x, y} points
  calibrationMatrix: jsonb('calibration_matrix').notNull(), // Transformation matrix
  accuracy: decimal('accuracy', { precision: 5, scale: 2 }).notNull(), // 0-100%
  isValid: boolean('is_valid').notNull().default(true),
  deviceInfo: jsonb('device_info'), // Device and screen info
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Eye Test Results Table
export const eyeTestResults = pgTable('eye_test_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  calibrationId: uuid('calibration_id').references(() => calibrationData.id),
  testType: testTypeEnum('test_type').notNull(),
  rightEyeScore: varchar('right_eye_score', { length: 100 }),
  leftEyeScore: varchar('left_eye_score', { length: 100 }),
  binocularScore: varchar('binocular_score', { length: 100 }),
  rawData: jsonb('raw_data'), // Detailed test data
  notes: text('notes'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Health Logs Table
export const healthLogs = pgTable('health_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  timeOfDay: timeOfDayEnum('time_of_day').notNull(),
  fatigueScore: integer('fatigue_score').notNull(), // 0-10
  screenTime: decimal('screen_time', { precision: 4, scale: 1 }), // hours
  symptoms: text('symptoms'),
  notes: text('notes'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Sessions Table (for refresh tokens)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: varchar('refresh_token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 50 }),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  eyeProfile: one(eyeProfiles, {
    fields: [users.id],
    references: [eyeProfiles.userId],
  }),
  calibrations: many(calibrationData),
  testResults: many(eyeTestResults),
  healthLogs: many(healthLogs),
  sessions: many(sessions),
}));

export const eyeProfilesRelations = relations(eyeProfiles, ({ one }) => ({
  user: one(users, {
    fields: [eyeProfiles.userId],
    references: [users.id],
  }),
}));

export const calibrationDataRelations = relations(
  calibrationData,
  ({ one, many }) => ({
    user: one(users, {
      fields: [calibrationData.userId],
      references: [users.id],
    }),
    testResults: many(eyeTestResults),
  })
);

export const eyeTestResultsRelations = relations(eyeTestResults, ({ one }) => ({
  user: one(users, {
    fields: [eyeTestResults.userId],
    references: [users.id],
  }),
  calibration: one(calibrationData, {
    fields: [eyeTestResults.calibrationId],
    references: [calibrationData.id],
  }),
}));

export const healthLogsRelations = relations(healthLogs, ({ one }) => ({
  user: one(users, {
    fields: [healthLogs.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
