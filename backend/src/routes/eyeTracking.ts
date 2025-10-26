import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { aiServiceClient } from '../services/aiService';

export const eyeTrackingRouter = router({
  /**
   * Analyze face and eyes from camera frame
   */
  analyzeFace: publicProcedure
    .input(z.object({
      image: z.string(), // base64 encoded image
      timestamp: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const result = await aiServiceClient.detectFace(
        input.image,
        input.timestamp
      );

      return result;
    }),

  /**
   * Check AI service health
   */
  healthCheck: publicProcedure
    .query(async () => {
      const health = await aiServiceClient.healthCheck();
      return {
        available: health !== null,
        ...health
      };
    })
});
