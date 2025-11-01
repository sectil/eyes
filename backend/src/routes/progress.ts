import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { dailyUsage, exerciseSessions, eyeTestResults } from '../db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export const progressRouter = router({
  // Get overall progress dashboard
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;
    const today = new Date().toISOString().split('T')[0];

    // Get today's usage
    const todayUsage = await db
      .select()
      .from(dailyUsage)
      .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
      .limit(1);

    // Get this week's usage (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const weeklyUsage = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, userId),
          gte(dailyUsage.date, weekAgoStr)
        )
      )
      .orderBy(dailyUsage.date);

    // Get this month's usage
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];

    const monthlyUsage = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, userId),
          gte(dailyUsage.date, monthAgoStr)
        )
      );

    // Get recent exercise sessions
    const recentExercises = await db
      .select()
      .from(exerciseSessions)
      .where(eq(exerciseSessions.userId, userId))
      .orderBy(desc(exerciseSessions.timestamp))
      .limit(10);

    // Get recent test results
    const recentTests = await db
      .select()
      .from(eyeTestResults)
      .where(eq(eyeTestResults.userId, userId))
      .orderBy(desc(eyeTestResults.timestamp))
      .limit(10);

    // Calculate summaries
    const weeklyTotalExerciseTime = weeklyUsage.reduce(
      (sum, day) => sum + (day.totalExerciseTime || 0),
      0
    );
    const weeklyTotalTestTime = weeklyUsage.reduce(
      (sum, day) => sum + (day.totalTestTime || 0),
      0
    );
    const weeklyTotalExerciseCount = weeklyUsage.reduce(
      (sum, day) => sum + (day.exerciseCount || 0),
      0
    );
    const weeklyTotalBlinkCount = weeklyUsage.reduce(
      (sum, day) => sum + (day.totalBlinkCount || 0),
      0
    );

    const monthlyTotalExerciseTime = monthlyUsage.reduce(
      (sum, day) => sum + (day.totalExerciseTime || 0),
      0
    );
    const monthlyTotalTestTime = monthlyUsage.reduce(
      (sum, day) => sum + (day.totalTestTime || 0),
      0
    );

    return {
      today: todayUsage[0] || null,
      weekly: {
        dailyStats: weeklyUsage,
        summary: {
          totalExerciseTime: weeklyTotalExerciseTime,
          totalTestTime: weeklyTotalTestTime,
          totalExerciseCount: weeklyTotalExerciseCount,
          totalBlinkCount: weeklyTotalBlinkCount,
          activeDays: weeklyUsage.length,
        },
      },
      monthly: {
        summary: {
          totalExerciseTime: monthlyTotalExerciseTime,
          totalTestTime: monthlyTotalTestTime,
          activeDays: monthlyUsage.length,
        },
      },
      recentExercises,
      recentTests,
    };
  }),

  // Get daily usage by date range
  getDailyUsageRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      const usage = await db
        .select()
        .from(dailyUsage)
        .where(
          and(
            eq(dailyUsage.userId, ctx.user.userId),
            gte(dailyUsage.date, input.startDate),
            sql`${dailyUsage.date} <= ${input.endDate}`
          )
        )
        .orderBy(dailyUsage.date);

      return usage;
    }),

  // Get exercise statistics by type
  getExerciseStatsByType: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const sessions = await db
        .select()
        .from(exerciseSessions)
        .where(
          and(
            eq(exerciseSessions.userId, ctx.user.userId),
            gte(exerciseSessions.timestamp, startDate)
          )
        );

      // Group by exercise type
      const statsByType: Record<
        string,
        {
          count: number;
          totalDuration: number;
          totalBlinks: number;
          completionRate: number;
        }
      > = {};

      sessions.forEach((session) => {
        const type = session.exerciseType;
        if (!statsByType[type]) {
          statsByType[type] = {
            count: 0,
            totalDuration: 0,
            totalBlinks: 0,
            completionRate: 0,
          };
        }

        statsByType[type].count += 1;
        statsByType[type].totalDuration += session.duration || 0;
        statsByType[type].totalBlinks += session.blinkCount || 0;
        if (session.completed) {
          statsByType[type].completionRate += 1;
        }
      });

      // Calculate completion rates
      Object.keys(statsByType).forEach((type) => {
        statsByType[type].completionRate =
          (statsByType[type].completionRate / statsByType[type].count) * 100;
      });

      return statsByType;
    }),

  // Get usage trends (for charts)
  getUsageTrends: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const usage = await db
        .select()
        .from(dailyUsage)
        .where(
          and(
            eq(dailyUsage.userId, ctx.user.userId),
            gte(dailyUsage.date, startDateStr)
          )
        )
        .orderBy(dailyUsage.date);

      // Fill in missing dates with zero values
      const allDates: Record<string, any> = {};
      for (let i = 0; i < input.days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        allDates[dateStr] = {
          date: dateStr,
          totalExerciseTime: 0,
          totalTestTime: 0,
          exerciseCount: 0,
          testCount: 0,
          totalBlinkCount: 0,
        };
      }

      // Fill in actual data
      usage.forEach((day) => {
        allDates[day.date] = {
          date: day.date,
          totalExerciseTime: day.totalExerciseTime || 0,
          totalTestTime: day.totalTestTime || 0,
          exerciseCount: day.exerciseCount || 0,
          testCount: day.testCount || 0,
          totalBlinkCount: day.totalBlinkCount || 0,
        };
      });

      return Object.values(allDates).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    }),

  // Check if daily limit reached
  checkDailyLimit: protectedProcedure
    .input(
      z.object({
        maxExerciseTime: z.number().default(1200), // 20 minutes default
        maxTestTime: z.number().default(600), // 10 minutes default
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0];

      const todayUsage = await db
        .select()
        .from(dailyUsage)
        .where(
          and(eq(dailyUsage.userId, ctx.user.userId), eq(dailyUsage.date, today))
        )
        .limit(1);

      if (!todayUsage[0]) {
        return {
          exerciseLimitReached: false,
          testLimitReached: false,
          exerciseTimeLeft: input.maxExerciseTime,
          testTimeLeft: input.maxTestTime,
        };
      }

      const exerciseTimeUsed = todayUsage[0].totalExerciseTime || 0;
      const testTimeUsed = todayUsage[0].totalTestTime || 0;

      return {
        exerciseLimitReached: exerciseTimeUsed >= input.maxExerciseTime,
        testLimitReached: testTimeUsed >= input.maxTestTime,
        exerciseTimeLeft: Math.max(0, input.maxExerciseTime - exerciseTimeUsed),
        testTimeLeft: Math.max(0, input.maxTestTime - testTimeUsed),
        usage: todayUsage[0],
      };
    }),
});
