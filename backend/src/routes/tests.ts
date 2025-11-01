import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { eyeTestResults, dailyUsage } from '../db/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';

export const testsRouter = router({
  // Save test result
  saveTestResult: protectedProcedure
    .input(
      z.object({
        testType: z.enum([
          'snellen',
          'contrast',
          'color',
          'astigmatism',
          'convergence',
          'symptom',
        ]),
        rightEyeScore: z.string().optional(),
        leftEyeScore: z.string().optional(),
        binocularScore: z.string().optional(),
        rawData: z.any().optional(),
        notes: z.string().optional(),
        calibrationId: z.string().optional(),
        duration: z.number().optional(), // seconds for daily usage tracking
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      // Save test result
      const [testResult] = await db
        .insert(eyeTestResults)
        .values({
          userId,
          testType: input.testType,
          rightEyeScore: input.rightEyeScore,
          leftEyeScore: input.leftEyeScore,
          binocularScore: input.binocularScore,
          rawData: input.rawData,
          notes: input.notes,
          calibrationId: input.calibrationId,
        })
        .returning();

      // Update daily usage if duration provided
      if (input.duration) {
        const today = new Date().toISOString().split('T')[0];

        const existingUsage = await db
          .select()
          .from(dailyUsage)
          .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
          .limit(1);

        if (existingUsage.length > 0) {
          await db
            .update(dailyUsage)
            .set({
              totalTestTime: sql`${dailyUsage.totalTestTime} + ${input.duration}`,
              testCount: sql`${dailyUsage.testCount} + 1`,
              lastActivity: new Date(),
            })
            .where(eq(dailyUsage.id, existingUsage[0].id));
        } else {
          await db.insert(dailyUsage).values({
            userId,
            date: today,
            totalTestTime: input.duration,
            testCount: 1,
          });
        }
      }

      return {
        success: true,
        testResult,
      };
    }),

  // Get test history
  getTestHistory: protectedProcedure
    .input(
      z.object({
        testType: z
          .enum([
            'snellen',
            'contrast',
            'color',
            'astigmatism',
            'convergence',
            'symptom',
          ])
          .optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = [eq(eyeTestResults.userId, ctx.user.userId)];

      if (input.testType) {
        whereConditions.push(eq(eyeTestResults.testType, input.testType));
      }

      const results = await db
        .select()
        .from(eyeTestResults)
        .where(and(...whereConditions))
        .orderBy(desc(eyeTestResults.timestamp))
        .limit(input.limit);

      return results;
    }),

  // Get test result by ID
  getTestById: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await db
        .select()
        .from(eyeTestResults)
        .where(
          and(
            eq(eyeTestResults.id, input.testId),
            eq(eyeTestResults.userId, ctx.user.userId)
          )
        )
        .limit(1);

      return result[0] || null;
    }),

  // Get test statistics
  getTestStatistics: protectedProcedure
    .input(
      z.object({
        testType: z.enum([
          'snellen',
          'contrast',
          'color',
          'astigmatism',
          'convergence',
          'symptom',
        ]),
        days: z.number().default(30), // Last N days
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      const startDateStr = startDate.toISOString();

      const results = await db
        .select()
        .from(eyeTestResults)
        .where(
          and(
            eq(eyeTestResults.userId, ctx.user.userId),
            eq(eyeTestResults.testType, input.testType),
            gte(eyeTestResults.timestamp, new Date(startDateStr))
          )
        )
        .orderBy(eyeTestResults.timestamp);

      return {
        testType: input.testType,
        count: results.length,
        results,
      };
    }),

  // Get all test types summary
  getTestsSummary: protectedProcedure.query(async ({ ctx }) => {
    const allTests = await db
      .select()
      .from(eyeTestResults)
      .where(eq(eyeTestResults.userId, ctx.user.userId))
      .orderBy(desc(eyeTestResults.timestamp));

    const testCounts: Record<string, number> = {};
    const latestTests: Record<string, any> = {};

    allTests.forEach((test) => {
      const type = test.testType;
      testCounts[type] = (testCounts[type] || 0) + 1;

      if (!latestTests[type]) {
        latestTests[type] = test;
      }
    });

    return {
      totalTests: allTests.length,
      testCounts,
      latestTests,
    };
  }),
});
