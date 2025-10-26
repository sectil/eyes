import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { db, users, eyeProfiles } from '../db';
import { eq } from 'drizzle-orm';

export const profileRouter = router({
  // Get user profile
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.userId),
      with: {
        eyeProfile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      eyeProfile: user.eyeProfile,
    };
  }),

  // Update basic profile
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        age: z.number().min(1).max(120).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.userId))
        .returning();

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        age: updatedUser.age,
        gender: updatedUser.gender,
      };
    }),

  // Get eye profile
  getEyeProfile: protectedProcedure.query(async ({ ctx }) => {
    const eyeProfile = await db.query.eyeProfiles.findFirst({
      where: eq(eyeProfiles.userId, ctx.user.userId),
    });

    return eyeProfile;
  }),

  // Create or update eye profile
  updateEyeProfile: protectedProcedure
    .input(
      z.object({
        occupation: z.string().optional(),
        dailyScreenTime: z.number().min(0).max(24).optional(),
        dailyOutdoorTime: z.number().min(0).max(24).optional(),
        sleepHours: z.number().min(0).max(24).optional(),
        usesGlasses: z.boolean().optional(),
        rightEyeDiopter: z.string().optional(),
        leftEyeDiopter: z.string().optional(),
        hasAstigmatism: z.boolean().optional(),
        astigmatismDegree: z.string().optional(),
        familyHistory: z.string().optional(),
        lastEyeExam: z.string().optional(), // ISO date string
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if profile exists
      const existingProfile = await db.query.eyeProfiles.findFirst({
        where: eq(eyeProfiles.userId, ctx.user.userId),
      });

      const profileData = {
        ...input,
        lastEyeExam: input.lastEyeExam ? input.lastEyeExam : undefined,
        updatedAt: new Date(),
      };

      if (existingProfile) {
        // Update existing profile
        const [updated] = await db
          .update(eyeProfiles)
          .set(profileData)
          .where(eq(eyeProfiles.id, existingProfile.id))
          .returning();

        return updated;
      } else {
        // Create new profile
        const [created] = await db
          .insert(eyeProfiles)
          .values({
            userId: ctx.user.userId,
            ...profileData,
          })
          .returning();

        return created;
      }
    }),

  // Delete account
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // This will cascade delete all related data
    await db.delete(users).where(eq(users.id, ctx.user.userId));

    return { success: true };
  }),
});
