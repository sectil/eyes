/**
 * AI Service Client - Connects to Python AI microservice
 */
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

export interface EyeData {
  open: boolean;
  aspect_ratio: number;
  pupil: {
    x: number;
    y: number;
    center: [number, number];
  };
}

export interface FaceAnalysis {
  eyes: {
    left: EyeData;
    right: EyeData;
    both_open: boolean;
    blinking: boolean;
  };
  gaze: {
    direction: 'center' | 'left' | 'right' | 'up' | 'down';
    x: number;
    y: number;
  };
  glasses: {
    detected: boolean;
    confidence: number;
  };
  face_quality: {
    landmarks_count: number;
    has_iris_tracking: boolean;
    detection_confidence: number;
  };
}

export interface FaceDetectionResult {
  success: boolean;
  face_detected: boolean;
  timestamp?: string;
  analysis?: FaceAnalysis;
  message?: string;
}

export class AIServiceClient {
  async healthCheck() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error: any) {
      console.error('AI Service health check failed:', error.message);
      return null;
    }
  }

  async detectFace(imageBase64: string, timestamp?: string): Promise<FaceDetectionResult> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/detect-face`,
        {
          image: imageBase64,
          timestamp: timestamp || new Date().toISOString()
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('AI face detection error:', error.message);
      throw new Error(`AI service error: ${error.message}`);
    }
  }
}

export const aiServiceClient = new AIServiceClient();
