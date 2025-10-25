import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { db, users, sessions } from '../db';
import { eq, and } from 'drizzle-orm';
import {
  hashPassword,
  comparePassword,
  validatePassword,
} from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateToken,
} from '../utils/email';

export const authRouter = router({
  // Register new user with email/password
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        age: z.number().min(1).max(120).optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate password
      const passwordValidation = validatePassword(input.password);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: passwordValidation.error,
        });
      }

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Generate email verification token
      const emailVerificationToken = generateToken();

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          name: input.name,
          age: input.age,
          gender: input.gender,
          loginMethod: 'email',
          emailVerificationToken,
        })
        .returning();

      // Send verification email
      try {
        await sendVerificationEmail(input.email, emailVerificationToken);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Don't fail registration if email fails
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Save refresh token to database
      await db.insert(sessions).values({
        userId: user.id,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        userAgent: ctx.req.headers['user-agent'],
        ipAddress:
          (ctx.req.headers['x-forwarded-for'] as string) ||
          ctx.req.socket.remoteAddress,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      };
    }),

  // Login with email/password
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(
        input.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });
      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Save refresh token
      await db.insert(sessions).values({
        userId: user.id,
        refreshToken,
        expiresAt: getRefreshTokenExpiry(),
        userAgent: ctx.req.headers['user-agent'],
        ipAddress:
          (ctx.req.headers['x-forwarded-for'] as string) ||
          ctx.req.socket.remoteAddress,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      };
    }),

  // Refresh access token
  refresh: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify refresh token
        const payload = verifyRefreshToken(input.refreshToken);

        // Check if session exists
        const session = await db.query.sessions.findFirst({
          where: and(
            eq(sessions.refreshToken, input.refreshToken),
            eq(sessions.userId, payload.userId)
          ),
        });

        if (!session) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token',
          });
        }

        // Check if session expired
        if (session.expiresAt < new Date()) {
          // Delete expired session
          await db
            .delete(sessions)
            .where(eq(sessions.id, session.id));

          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Refresh token expired',
          });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
          userId: payload.userId,
          email: payload.email,
        });

        return {
          accessToken,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid refresh token',
        });
      }
    }),

  // Logout
  logout: protectedProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Delete session
      await db
        .delete(sessions)
        .where(
          and(
            eq(sessions.refreshToken, input.refreshToken),
            eq(sessions.userId, ctx.user.userId)
          )
        );

      return { success: true };
    }),

  // Verify email
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.emailVerificationToken, input.token),
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid verification token',
        });
      }

      // Update user
      await db
        .update(users)
        .set({
          isEmailVerified: true,
          emailVerificationToken: null,
        })
        .where(eq(users.id, user.id));

      return { success: true };
    }),

  // Request password reset
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (!user) {
        // Don't reveal if user exists
        return { success: true };
      }

      // Generate reset token
      const resetToken = generateToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user
      await db
        .update(users)
        .set({
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        })
        .where(eq(users.id, user.id));

      // Send reset email
      try {
        await sendPasswordResetEmail(input.email, resetToken);
      } catch (error) {
        console.error('Failed to send reset email:', error);
      }

      return { success: true };
    }),

  // Reset password
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      // Validate password
      const passwordValidation = validatePassword(input.newPassword);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: passwordValidation.error,
        });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.resetPasswordToken, input.token),
      });

      if (!user || !user.resetPasswordExpires) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        });
      }

      // Check if token expired
      if (user.resetPasswordExpires < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reset token expired',
        });
      }

      // Hash new password
      const passwordHash = await hashPassword(input.newPassword);

      // Update user
      await db
        .update(users)
        .set({
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        })
        .where(eq(users.id, user.id));

      // Delete all sessions (force re-login)
      await db.delete(sessions).where(eq(sessions.userId, user.id));

      return { success: true };
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.userId),
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
      loginMethod: user.loginMethod,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn,
    };
  }),
});
