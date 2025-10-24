/**
 * Advanced Eye Tracking using TensorFlow.js FaceMesh
 * Provides accurate eye pupil detection and calibration
 */

import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

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
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private calibrationPoints: CalibrationPoint[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set TensorFlow backend
      await tf.setBackend("webgl");
      await tf.ready();

      // Create face detector
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
        refineLandmarks: true, // Enable iris landmarks
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      console.log("✅ Eye tracker initialized");
    } catch (error) {
      console.error("Failed to initialize eye tracker:", error);
      throw error;
    }
  }

  async detectFace(video: HTMLVideoElement): Promise<faceLandmarksDetection.Face[]> {
    if (!this.detector) {
      throw new Error("Eye tracker not initialized");
    }

    const faces = await this.detector.estimateFaces(video, {
      flipHorizontal: false,
    });

    return faces;
  }

  /**
   * Extract eye data from face landmarks
   */
  extractEyeData(face: faceLandmarksDetection.Face): EyeData | null {
    if (!face.keypoints) return null;

    const keypoints = face.keypoints;

    // Left eye indices (MediaPipe)
    const leftEyeIndices = [33, 133, 160, 159, 158, 157, 173, 144];
    const leftIrisIndices = [468, 469, 470, 471, 472]; // Iris landmarks

    // Right eye indices
    const rightEyeIndices = [362, 263, 387, 386, 385, 384, 398, 373];
    const rightIrisIndices = [473, 474, 475, 476, 477];

    // Calculate left eye center
    const leftEyePoints = leftEyeIndices.map((i) => keypoints[i]);
    const leftEyeCenter = this.calculateCenter(leftEyePoints);

    // Calculate right eye center
    const rightEyePoints = rightEyeIndices.map((i) => keypoints[i]);
    const rightEyeCenter = this.calculateCenter(rightEyePoints);

    // Get iris positions (pupil approximation)
    const leftIris = leftIrisIndices.length > 0 ? keypoints[leftIrisIndices[0]] : leftEyeCenter;
    const rightIris = rightIrisIndices.length > 0 ? keypoints[rightIrisIndices[0]] : rightEyeCenter;

    // Calculate gaze direction
    const leftGaze = {
      x: (leftIris.x - leftEyeCenter.x) / 10, // Normalize
      y: (leftIris.y - leftEyeCenter.y) / 10,
    };

    const rightGaze = {
      x: (rightIris.x - rightEyeCenter.x) / 10,
      y: (rightIris.y - rightEyeCenter.y) / 10,
    };

    // Average both eyes
    const avgGaze = {
      x: (leftGaze.x + rightGaze.x) / 2,
      y: (leftGaze.y + rightGaze.y) / 2,
    };

    return {
      left: {
        center: leftEyeCenter,
        pupil: { x: leftIris.x, y: leftIris.y },
        iris: { x: leftIris.x, y: leftIris.y },
      },
      right: {
        center: rightEyeCenter,
        pupil: { x: rightIris.x, y: rightIris.y },
        iris: { x: rightIris.x, y: rightIris.y },
      },
      gaze: avgGaze,
    };
  }

  private calculateCenter(points: Array<{ x?: number; y?: number; z?: number }>): { x: number; y: number } {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (const point of points) {
      if (point.x !== undefined && point.y !== undefined) {
        sumX += point.x;
        sumY += point.y;
        count++;
      }
    }

    return {
      x: count > 0 ? sumX / count : 0,
      y: count > 0 ? sumY / count : 0,
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
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
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

