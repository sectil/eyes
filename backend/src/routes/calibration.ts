import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

// Kalibrasyon verisi schema
const calibrationPointSchema = z.object({
  screenX: z.number(),
  screenY: z.number(),
  pupilX: z.number(),
  pupilY: z.number(),
});

const calibrationDataSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
  points: z.array(calibrationPointSchema),
  userId: z.string().optional(),
});

// In-memory storage (production'da database kullanın)
const calibrationStorage = new Map<string, any>();

export const calibrationRouter = router({
  // Kalibrasyon kaydet
  saveCalibration: publicProcedure
    .input(z.object({
      calibrationData: calibrationDataSchema,
      userId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const userId = input.userId || 'default';

      // Kalibrasyon verisini kaydet
      calibrationStorage.set(userId, {
        ...input.calibrationData,
        savedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Calibration saved successfully',
        userId,
      };
    }),

  // Kalibrasyon getir
  getCalibration: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const userId = input.userId || 'default';
      const calibration = calibrationStorage.get(userId);

      if (!calibration) {
        return {
          success: false,
          message: 'No calibration found',
          calibration: null,
        };
      }

      return {
        success: true,
        calibration,
      };
    }),

  // Kalibrasyon sil
  deleteCalibration: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const userId = input.userId || 'default';
      const existed = calibrationStorage.has(userId);

      if (existed) {
        calibrationStorage.delete(userId);
      }

      return {
        success: true,
        message: existed ? 'Calibration deleted' : 'No calibration to delete',
      };
    }),

  // Tüm kalibrasyonları listele (admin için)
  listCalibrations: publicProcedure
    .query(async () => {
      const calibrations = Array.from(calibrationStorage.entries()).map(
        ([userId, data]) => ({
          userId,
          savedAt: data.savedAt,
          pointsCount: data.points.length,
        })
      );

      return {
        success: true,
        count: calibrations.length,
        calibrations,
      };
    }),
});
