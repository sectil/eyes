/**
 * VisionCare AI Service Integration Example for Node.js Backend
 *
 * This file shows how to integrate the Python AI microservice
 * with your Node.js/Express backend using TRPC.
 */

// ============================================================================
// 1. Install Required Dependencies
// ============================================================================
// npm install axios

// ============================================================================
// 2. Create AI Service Client
// ============================================================================

import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

export class AIServiceClient {
  /**
   * Check if AI service is healthy and available
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('AI Service health check failed:', error.message);
      return null;
    }
  }

  /**
   * Detect face and analyze eyes from base64 image
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} timestamp - ISO timestamp
   * @returns {Promise<Object>} Analysis results
   */
  async detectFace(imageBase64, timestamp = new Date().toISOString()) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/detect-face`,
        {
          image: imageBase64,
          timestamp: timestamp
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI face detection error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send calibration data to AI service
   * @param {Array} calibrationPoints - Array of calibration point data
   * @returns {Promise<Object>} Calibration result
   */
  async calibrate(calibrationPoints) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/calibrate`,
        {
          calibration_points: calibrationPoints
        },
        {
          timeout: 10000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI calibration error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// ============================================================================
// 3. TRPC Router Integration
// ============================================================================

import { router, publicProcedure } from './trpc'; // Your TRPC setup
import { z } from 'zod';

const aiServiceClient = new AIServiceClient();

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
      // Forward request to Python AI service
      const result = await aiServiceClient.detectFace(
        input.image,
        input.timestamp
      );

      if (!result.success) {
        throw new Error(`AI service error: ${result.error}`);
      }

      // Return analysis to mobile app
      return result.data;
    }),

  /**
   * Submit calibration data
   */
  calibrate: publicProcedure
    .input(z.object({
      calibrationPoints: z.array(z.object({
        x: z.number(),
        y: z.number(),
        pupilData: z.any()
      }))
    }))
    .mutation(async ({ input }) => {
      const result = await aiServiceClient.calibrate(input.calibrationPoints);

      if (!result.success) {
        throw new Error(`Calibration error: ${result.error}`);
      }

      return result.data;
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

// ============================================================================
// 4. Add to Main Router
// ============================================================================

// In your main routes/index.ts file:
/*
import { eyeTrackingRouter } from './eyeTracking';

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  eyeTracking: eyeTrackingRouter, // Add this line
});
*/

// ============================================================================
// 5. Environment Variables
// ============================================================================

/*
Add to your .env file:

# Python AI Service
AI_SERVICE_URL=http://localhost:5000

# For production/network access:
# AI_SERVICE_URL=http://192.168.1.12:5000
*/

// ============================================================================
// 6. Mobile App Usage Example
// ============================================================================

/*
// In your React Native component:

import { trpc } from '../services/trpc';
import { Camera } from 'expo-camera';

async function captureAndAnalyze(cameraRef) {
  try {
    // Capture photo
    const photo = await cameraRef.current.takePictureAsync({
      base64: true,
      quality: 0.7,
      skipProcessing: true
    });

    // Send to backend (which forwards to AI service)
    const result = await trpc.eyeTracking.analyzeFace.mutate({
      image: `data:image/jpeg;base64,${photo.base64}`,
      timestamp: new Date().toISOString()
    });

    if (result.success && result.face_detected) {
      const { eyes, gaze, glasses } = result.analysis;

      console.log('Eyes:', eyes.both_open ? 'Open' : 'Closed');
      console.log('Blinking:', eyes.blinking);
      console.log('Gaze direction:', gaze.direction);
      console.log('Wearing glasses:', glasses.detected);

      // Update UI with results
      setEyeState({
        leftOpen: eyes.left.open,
        rightOpen: eyes.right.open,
        blinking: eyes.blinking,
        gazeDirection: gaze.direction,
        hasGlasses: glasses.detected
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
  }
}
*/

// ============================================================================
// 7. Error Handling Best Practices
// ============================================================================

export class AIServiceError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AIServiceError';
  }
}

// Wrapper with retry logic
export async function detectFaceWithRetry(imageBase64, maxRetries = 3) {
  const client = new AIServiceClient();
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.detectFace(imageBase64);

      if (result.success) {
        return result.data;
      }

      lastError = new AIServiceError(
        'AI service returned error',
        'SERVICE_ERROR',
        result.error
      );
    } catch (error) {
      lastError = error;

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new AIServiceError(
    'AI service failed after retries',
    'MAX_RETRIES_EXCEEDED',
    lastError
  );
}

// ============================================================================
// 8. Performance Monitoring
// ============================================================================

export class AIServiceMonitor {
  constructor() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalLatency = 0;
  }

  async track(fn) {
    const startTime = Date.now();
    this.requestCount++;

    try {
      const result = await fn();
      const latency = Date.now() - startTime;
      this.totalLatency += latency;

      console.log(`AI request completed in ${latency}ms`);
      return result;
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }

  getStats() {
    return {
      totalRequests: this.requestCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0
        ? ((this.requestCount - this.errorCount) / this.requestCount) * 100
        : 0,
      averageLatency: this.requestCount > 0
        ? this.totalLatency / this.requestCount
        : 0
    };
  }
}

// Usage:
// const monitor = new AIServiceMonitor();
// const result = await monitor.track(() => client.detectFace(image));

// ============================================================================
// 9. Startup Check
// ============================================================================

export async function verifyAIService() {
  console.log('Checking AI service availability...');

  const client = new AIServiceClient();
  const health = await client.healthCheck();

  if (health) {
    console.log('✓ AI Service connected successfully');
    console.log(`  Service: ${health.service}`);
    console.log(`  Version: ${health.version}`);
    console.log(`  Capabilities: ${health.capabilities.join(', ')}`);
    return true;
  } else {
    console.warn('⚠ AI Service not available');
    console.warn('  Make sure the Python AI service is running:');
    console.warn('  cd ai-service && source venv/bin/activate && python app.py');
    return false;
  }
}

// Add to your backend startup (index.ts):
/*
app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Server running on port ${PORT}`);

  // Verify AI service connection
  await verifyAIService();
});
*/
