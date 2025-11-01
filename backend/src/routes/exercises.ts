import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { exerciseSessions, dailyUsage } from '../db/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';

export const exercisesRouter = router({
  // Save exercise session
  saveSession: protectedProcedure
    .input(
      z.object({
        exerciseType: z.enum([
          'blink',
          'close',
          'rectangle',
          'star',
          'horizontal',
          'vertical',
          'diagonal',
          'circle',
          'focus',
          'rest',
        ]),
        duration: z.number().positive(), // seconds
        blinkCount: z.number().default(0),
        completed: z.boolean().default(true),
        eyeData: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId;

      // Save exercise session
      const [session] = await db
        .insert(exerciseSessions)
        .values({
          userId,
          exerciseType: input.exerciseType,
          duration: input.duration,
          blinkCount: input.blinkCount,
          completed: input.completed,
          eyeData: input.eyeData,
        })
        .returning();

      // Update daily usage
      const today = new Date().toISOString().split('T')[0];

      const existingUsage = await db
        .select()
        .from(dailyUsage)
        .where(and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, today)))
        .limit(1);

      if (existingUsage.length > 0) {
        // Update existing record
        await db
          .update(dailyUsage)
          .set({
            totalExerciseTime: sql`${dailyUsage.totalExerciseTime} + ${input.duration}`,
            exerciseCount: sql`${dailyUsage.exerciseCount} + 1`,
            totalBlinkCount: sql`${dailyUsage.totalBlinkCount} + ${input.blinkCount}`,
            lastActivity: new Date(),
          })
          .where(eq(dailyUsage.id, existingUsage[0].id));
      } else {
        // Create new record
        await db.insert(dailyUsage).values({
          userId,
          date: today,
          totalExerciseTime: input.duration,
          exerciseCount: 1,
          totalBlinkCount: input.blinkCount,
        });
      }

      return {
        success: true,
        session,
      };
    }),

  // Get recent sessions
  getRecentSessions: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const sessions = await db
        .select()
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, ctx.user.userId))
        .orderBy(desc(exerciseSessions.timestamp))
        .limit(input.limit);

      return sessions;
    }),

  // Get daily usage
  getDailyUsage: protectedProcedure
    .input(
      z.object({
        date: z.string().optional(), // YYYY-MM-DD format
      })
    )
    .query(async ({ ctx, input }) => {
      const targetDate = input.date || new Date().toISOString().split('T')[0];

      const usage = await db
        .select()
        .from(dailyUsage)
        .where(
          and(
            eq(dailyUsage.userId, ctx.user.userId),
            eq(dailyUsage.date, targetDate)
          )
        )
        .limit(1);

      return usage[0] || null;
    }),

  // Get weekly statistics
  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const weeklyUsage = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, ctx.user.userId),
          gte(dailyUsage.date, weekAgoStr)
        )
      )
      .orderBy(dailyUsage.date);

    const totalExerciseTime = weeklyUsage.reduce(
      (sum, day) => sum + (day.totalExerciseTime || 0),
      0
    );
    const totalExerciseCount = weeklyUsage.reduce(
      (sum, day) => sum + (day.exerciseCount || 0),
      0
    );
    const totalBlinkCount = weeklyUsage.reduce(
      (sum, day) => sum + (day.totalBlinkCount || 0),
      0
    );

    return {
      dailyStats: weeklyUsage,
      summary: {
        totalExerciseTime,
        totalExerciseCount,
        totalBlinkCount,
        averageExerciseTime: weeklyUsage.length > 0 ? totalExerciseTime / weeklyUsage.length : 0,
      },
    };
  }),
});
