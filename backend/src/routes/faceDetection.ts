import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { detectFace, initializeFaceDetection } from '../utils/faceDetectionService';

// AI modelini başlangıçta yükle
initializeFaceDetection().catch(console.error);

export const faceDetectionRouter = router({
  detectFace: publicProcedure
    .input(
      z.object({
        image: z.string(), // Base64 encoded image
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log('[AI Route] Processing face detection request...');
        const result = await detectFace(input.image);
        console.log('[AI Route] Face detected:', result.detected);
        return result;
      } catch (error: any) {
        console.error('[AI Route] Error:', error);
        throw new Error(`Face detection failed: ${error.message}`);
      }
    }),
});
