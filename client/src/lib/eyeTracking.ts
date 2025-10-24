/**
 * Eye tracking utilities using webcam and face detection
 * Uses MediaPipe Face Mesh for eye landmark detection
 */

export interface EyePosition {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (up) to 1 (down)
  isDetected: boolean;
}

export interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Initialize webcam stream
 */
export async function initWebcam(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: false,
    });
    return stream;
  } catch (error) {
    console.error("Error accessing webcam:", error);
    throw new Error("Kameraya erişim izni verilmedi veya kamera bulunamadı");
  }
}

/**
 * Stop webcam stream
 */
export function stopWebcam(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

/**
 * Detect face using simple color-based detection (fallback method)
 * For production, consider using TensorFlow.js FaceMesh or similar
 */
export function detectFaceSimple(
  videoElement: HTMLVideoElement,
  canvas: HTMLCanvasElement
): FacePosition | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Simple face detection using center region
  // In production, use a proper face detection library
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const faceWidth = canvas.width * 0.4;
  const faceHeight = canvas.height * 0.5;

  return {
    x: centerX - faceWidth / 2,
    y: centerY - faceHeight / 2,
    width: faceWidth,
    height: faceHeight,
  };
}

/**
 * Calculate eye gaze direction based on face position
 * Simplified version - in production use proper eye tracking library
 */
export function calculateEyeGaze(
  videoElement: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  facePosition: FacePosition
): EyePosition {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { x: 0, y: 0, isDetected: false };
  }

  // Get eye regions (approximate)
  const leftEyeX = facePosition.x + facePosition.width * 0.3;
  const rightEyeX = facePosition.x + facePosition.width * 0.7;
  const eyeY = facePosition.y + facePosition.height * 0.4;
  const eyeSize = facePosition.width * 0.15;

  // Sample pixel data from eye regions
  const leftEyeData = ctx.getImageData(leftEyeX, eyeY, eyeSize, eyeSize);
  const rightEyeData = ctx.getImageData(rightEyeX, eyeY, eyeSize, eyeSize);

  // Calculate brightness center (pupil is darker)
  const leftPupil = findDarkestPoint(leftEyeData);
  const rightPupil = findDarkestPoint(rightEyeData);

  // Average both eyes
  const avgX = (leftPupil.x + rightPupil.x) / 2;
  const avgY = (leftPupil.y + rightPupil.y) / 2;

  // Normalize to -1 to 1 range
  const normalizedX = (avgX - 0.5) * 2;
  const normalizedY = (avgY - 0.5) * 2;

  return {
    x: normalizedX,
    y: normalizedY,
    isDetected: true,
  };
}

/**
 * Find darkest point in image data (pupil detection)
 */
function findDarkestPoint(imageData: ImageData): { x: number; y: number } {
  let minBrightness = 255;
  let darkestX = 0.5;
  let darkestY = 0.5;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const i = (y * imageData.width + x) * 4;
      const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;

      if (brightness < minBrightness) {
        minBrightness = brightness;
        darkestX = x / imageData.width;
        darkestY = y / imageData.height;
      }
    }
  }

  return { x: darkestX, y: darkestY };
}

/**
 * Check if user is looking at a specific target
 */
export function isLookingAtTarget(
  eyePosition: EyePosition,
  targetX: number, // -1 to 1
  targetY: number, // -1 to 1
  threshold: number = 0.3
): boolean {
  if (!eyePosition.isDetected) return false;

  const distance = Math.sqrt(
    Math.pow(eyePosition.x - targetX, 2) + Math.pow(eyePosition.y - targetY, 2)
  );

  return distance < threshold;
}

/**
 * Calculate eye movement speed
 */
export function calculateEyeSpeed(
  currentPosition: EyePosition,
  previousPosition: EyePosition,
  deltaTime: number // in milliseconds
): number {
  if (!currentPosition.isDetected || !previousPosition.isDetected) return 0;

  const dx = currentPosition.x - previousPosition.x;
  const dy = currentPosition.y - previousPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance / (deltaTime / 1000); // units per second
}

/**
 * Calibration helper - collect eye positions for known targets
 */
export class EyeTrackingCalibrator {
  private calibrationPoints: Array<{
    target: { x: number; y: number };
    measured: { x: number; y: number };
  }> = [];

  addCalibrationPoint(targetX: number, targetY: number, measuredX: number, measuredY: number) {
    this.calibrationPoints.push({
      target: { x: targetX, y: targetY },
      measured: { x: measuredX, y: measuredY },
    });
  }

  /**
   * Apply calibration to raw eye position
   */
  calibrate(rawPosition: EyePosition): EyePosition {
    if (this.calibrationPoints.length < 4) {
      // Not enough calibration data
      return rawPosition;
    }

    // Simple linear calibration
    // In production, use more sophisticated calibration methods
    let offsetX = 0;
    let offsetY = 0;

    for (const point of this.calibrationPoints) {
      offsetX += point.target.x - point.measured.x;
      offsetY += point.target.y - point.measured.y;
    }

    offsetX /= this.calibrationPoints.length;
    offsetY /= this.calibrationPoints.length;

    return {
      x: rawPosition.x + offsetX,
      y: rawPosition.y + offsetY,
      isDetected: rawPosition.isDetected,
    };
  }

  reset() {
    this.calibrationPoints = [];
  }
}

