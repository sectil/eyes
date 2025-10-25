/**
 * Advanced Eye Tracking using Face-api
 * Provides accurate eye detection and calibration
 */

import * as faceapi from '@vladmandic/face-api';

export interface EyeData {
  left: {
    center: { x: number; y: number };
    pupil: { x: number; y: number };
    iris: { x: number; y: number };
  };
  right: {
    center: { x: number; y: number };
    pupil: { x: number; y: number };
    iris: { x: number; y: number };
  };
  gaze: {
    x: number; // -1 (left) to 1 (right)
    y: number; // -1 (up) to 1 (down)
  };
}

export interface CalibrationPoint {
  screen: { x: number; y: number }; // Screen coordinates (0-1)
  eye: { x: number; y: number }; // Eye gaze coordinates
}

export class AdvancedEyeTracker {
  private calibrationPoints: CalibrationPoint[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load Face-api models from CDN
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      this.isInitialized = true;
      console.log("✅ Eye tracker initialized");
    } catch (error) {
      console.error("Failed to initialize eye tracker:", error);
      throw error;
    }
  }

  async detectFace(video: HTMLVideoElement): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Eye tracker not initialized");
    }

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      return !!detection;
    } catch (error) {
      console.error("Face detection error:", error);
      return false;
    }
  }

  /**
   * Extract eye data from face landmarks
   */
  async extractEyeData(video: HTMLVideoElement): Promise<EyeData | null> {
    if (!this.isInitialized) return null;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!detection) return null;

      const landmarks = detection.landmarks;
      
      // Eye landmarks (Face-api uses 68-point landmarks)
      // Left eye: points 36-41
      // Right eye: points 42-47
      const leftEyePoints = landmarks.getLeftEye();
      const rightEyePoints = landmarks.getRightEye();

      if (leftEyePoints.length === 0 || rightEyePoints.length === 0) {
        return null;
      }

      // Calculate eye centers
      const leftEyeCenter = this.calculateCenter(leftEyePoints);
      const rightEyeCenter = this.calculateCenter(rightEyePoints);

      // Approximate pupil position (center of eye region)
      const leftPupil = leftEyePoints[3]; // Center point
      const rightPupil = rightEyePoints[3]; // Center point

      // Calculate gaze direction
      const leftGaze = {
        x: (leftPupil.x - leftEyeCenter.x) / 5,
        y: (leftPupil.y - leftEyeCenter.y) / 5,
      };

      const rightGaze = {
        x: (rightPupil.x - rightEyeCenter.x) / 5,
        y: (rightPupil.y - rightEyeCenter.y) / 5,
      };

      // Average both eyes
      const avgGaze = {
        x: (leftGaze.x + rightGaze.x) / 2,
        y: (leftGaze.y + rightGaze.y) / 2,
      };

      return {
        left: {
          center: leftEyeCenter,
          pupil: { x: leftPupil.x, y: leftPupil.y },
          iris: { x: leftPupil.x, y: leftPupil.y },
        },
        right: {
          center: rightEyeCenter,
          pupil: { x: rightPupil.x, y: rightPupil.y },
          iris: { x: rightPupil.x, y: rightPupil.y },
        },
        gaze: avgGaze,
      };
    } catch (error) {
      console.error("Eye data extraction error:", error);
      return null;
    }
  }

  private calculateCenter(points: Array<{ x: number; y: number }>): { x: number; y: number } {
    let sumX = 0;
    let sumY = 0;

    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    }

    return {
      x: sumX / points.length,
      y: sumY / points.length,
    };
  }

  /**
   * Add calibration point
   */
  addCalibrationPoint(screenX: number, screenY: number, eyeData: EyeData) {
    const point = {
      screen: { x: screenX, y: screenY },
      eye: { x: eyeData.gaze.x, y: eyeData.gaze.y },
    };
    this.calibrationPoints.push(point);
    console.log(`🎯 Kalibrasyon noktası ${this.calibrationPoints.length} eklendi:`, {
      ekran: `(${screenX.toFixed(2)}, ${screenY.toFixed(2)})`,
      göz: `(${eyeData.gaze.x.toFixed(3)}, ${eyeData.gaze.y.toFixed(3)})`,
      toplam: this.calibrationPoints.length
    });
  }

  /**
   * Apply calibration to raw gaze data
   */
  calibrateGaze(rawGaze: { x: number; y: number }): { x: number; y: number } {
    if (this.calibrationPoints.length < 4) {
      // Not enough calibration points, return raw data
      return rawGaze;
    }

    // Simple linear regression calibration
    let offsetX = 0;
    let offsetY = 0;
    let scaleX = 1;
    let scaleY = 1;

    // Calculate average offset
    for (const point of this.calibrationPoints) {
      offsetX += point.screen.x - point.eye.x;
      offsetY += point.screen.y - point.eye.y;
    }

    offsetX /= this.calibrationPoints.length;
    offsetY /= this.calibrationPoints.length;

    // Calculate scale (simplified)
    const rangeEyeX = Math.max(...this.calibrationPoints.map((p) => p.eye.x)) - 
                      Math.min(...this.calibrationPoints.map((p) => p.eye.x));
    const rangeScreenX = Math.max(...this.calibrationPoints.map((p) => p.screen.x)) - 
                         Math.min(...this.calibrationPoints.map((p) => p.screen.x));

    if (rangeEyeX > 0) {
      scaleX = rangeScreenX / rangeEyeX;
    }

    const rangeEyeY = Math.max(...this.calibrationPoints.map((p) => p.eye.y)) - 
                      Math.min(...this.calibrationPoints.map((p) => p.eye.y));
    const rangeScreenY = Math.max(...this.calibrationPoints.map((p) => p.screen.y)) - 
                         Math.min(...this.calibrationPoints.map((p) => p.screen.y));

    if (rangeEyeY > 0) {
      scaleY = rangeScreenY / rangeEyeY;
    }

    return {
      x: (rawGaze.x * scaleX) + offsetX,
      y: (rawGaze.y * scaleY) + offsetY,
    };
  }

  /**
   * Reset calibration
   */
  resetCalibration() {
    this.calibrationPoints = [];
  }

  /**
   * Get calibration quality (0-1)
   */
  getCalibrationQuality(): number {
    if (this.calibrationPoints.length < 9) {
      return this.calibrationPoints.length / 9;
    }
    return 1;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.isInitialized = false;
  }
}

/**
 * Singleton instance
 */
let trackerInstance: AdvancedEyeTracker | null = null;

export async function getEyeTracker(): Promise<AdvancedEyeTracker> {
  if (!trackerInstance) {
    trackerInstance = new AdvancedEyeTracker();
    await trackerInstance.initialize();
  }
  return trackerInstance;
}

/**
 * Dispose the singleton tracker instance
 */
export function disposeEyeTracker() {
  if (trackerInstance) {
    trackerInstance.dispose();
    trackerInstance = null;
    console.log('✅ Eye tracker disposed');
  }
}

