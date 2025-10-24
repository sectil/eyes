import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  subscription: router({
    // Get all active subscription plans
    getPlans: publicProcedure.query(async () => {
      return await db.getActiveSubscriptionPlans();
    }),

    // Get user's active subscription
    getMySubscription: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserActiveSubscription(ctx.user.id);
    }),

    // Create a new subscription
    subscribe: protectedProcedure
      .input(z.object({
        planId: z.number(),
        paymentMethod: z.string().optional(),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const plan = await db.getActiveSubscriptionPlans();
        const selectedPlan = plan.find(p => p.id === input.planId);
        
        if (!selectedPlan) {
          throw new Error("Plan not found");
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + selectedPlan.durationDays);

        await db.createUserSubscription({
          userId: ctx.user.id,
          planId: input.planId,
          status: "active",
          startDate,
          endDate,
          paymentMethod: input.paymentMethod,
          transactionId: input.transactionId,
        });

        return { success: true, endDate };
      }),
  }),

  profile: router({
    // Get user's eye profile
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEyeProfile(ctx.user.id);
    }),

    // Create or update eye profile
    upsert: protectedProcedure
      .input(z.object({
        age: z.number().min(1).max(120),
        gender: z.enum(["male", "female", "other"]).optional(),
        occupation: z.string().optional(),
        dailyScreenTime: z.number().min(0).optional(),
        dailyOutdoorTime: z.number().min(0).optional(),
        sleepHours: z.number().min(0).max(24).optional(),
        usesGlasses: z.number().min(0).max(1).optional(),
        rightEyeDiopter: z.string().optional(),
        leftEyeDiopter: z.string().optional(),
        hasAstigmatism: z.number().min(0).max(1).optional(),
        astigmatismDegree: z.string().optional(),
        familyHistory: z.string().optional(),
        lastEyeExam: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUserEyeProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  tests: router({
    // Save a new test result
    save: protectedProcedure
      .input(z.object({
        testType: z.enum(["snellen", "contrast", "color", "astigmatism", "convergence", "symptom"]),
        rightEyeScore: z.string().optional(),
        leftEyeScore: z.string().optional(),
        binocularScore: z.string().optional(),
        rawData: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createEyeTestResult({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // Get test history
    getHistory: protectedProcedure
      .input(z.object({
        testType: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserTestHistory(ctx.user.id, input.testType);
      }),

    // Get latest test result for a specific type
    getLatest: protectedProcedure
      .input(z.object({
        testType: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getLatestTestResult(ctx.user.id, input.testType);
      }),
  }),

  fatigue: router({
    // Log eye fatigue
    log: protectedProcedure
      .input(z.object({
        timeOfDay: z.enum(["morning", "afternoon", "evening"]),
        fatigueScore: z.number().min(0).max(10),
        screenTime: z.number().min(0).optional(),
        symptoms: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createEyeFatigueLog({
          userId: ctx.user.id,
          logDate: new Date(),
          ...input,
        });
        return { success: true };
      }),

    // Get fatigue logs
    getLogs: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserFatigueLogs(ctx.user.id, input.startDate, input.endDate);
      }),

    // Get fatigue stats
    getStats: protectedProcedure
      .input(z.object({
        days: z.number().default(7),
      }))
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const logs = await db.getUserFatigueLogs(ctx.user.id, startDate, endDate);

        if (logs.length === 0) {
          return {
            averageScore: 0,
            logsCount: 0,
            trend: "stable" as const,
          };
        }

        const avgScore = logs.reduce((sum, log) => sum + log.fatigueScore, 0) / logs.length;

        // Calculate trend (comparing first half vs second half)
        const midPoint = Math.floor(logs.length / 2);
        const firstHalf = logs.slice(0, midPoint);
        const secondHalf = logs.slice(midPoint);

        const firstAvg = firstHalf.reduce((sum, log) => sum + log.fatigueScore, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, log) => sum + log.fatigueScore, 0) / secondHalf.length;

        let trend: "improving" | "worsening" | "stable" = "stable";
        if (secondAvg < firstAvg - 0.5) trend = "improving";
        else if (secondAvg > firstAvg + 0.5) trend = "worsening";

        return {
          averageScore: Math.round(avgScore * 10) / 10,
          logsCount: logs.length,
          trend,
        };
      }),
  }),

  exercises: router({
    // Get all active exercises
    getAll: publicProcedure.query(async () => {
      return await db.getActiveExercisePrograms();
    }),

    // Get exercise by ID
    getById: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getExerciseProgramById(input.id);
      }),

    // Log completed exercise
    logCompletion: protectedProcedure
      .input(z.object({
        exerciseId: z.number(),
        durationMinutes: z.number().min(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createUserExerciseLog({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // Get exercise logs
    getLogs: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserExerciseLogs(ctx.user.id, input.startDate, input.endDate);
      }),

    // Get exercise stats
    getStats: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserExerciseStats(ctx.user.id, input.days);
      }),
  }),

  simulation: router({
    // Get latest simulation
    getLatest: protectedProcedure
      .input(z.object({
        simulationType: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserLatestSimulation(ctx.user.id, input.simulationType);
      }),

    // Get simulation history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSimulationHistory(ctx.user.id);
    }),

    // Generate new simulation
    generate: protectedProcedure
      .input(z.object({
        simulationType: z.enum(["myopia", "hyperopia", "astigmatism", "fatigue"]),
        severity: z.number().min(0).max(10),
        parameters: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement actual image generation logic
        await db.createEyeSimulation({
          userId: ctx.user.id,
          ...input,
          imageUrl: null, // Will be populated after image generation
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

