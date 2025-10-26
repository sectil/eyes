/**
 * VisionCare AI Service Integration Example for React Native / Expo
 *
 * This file shows how to integrate the Python AI microservice
 * with your Expo mobile app for real-time eye tracking.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { trpc } from '../services/trpc';

// ============================================================================
// 1. Eye Tracking Screen Component
// ============================================================================

export default function EyeTrackingScreen() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [eyeData, setEyeData] = useState(null);
  const cameraRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const startTracking = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    setIsTracking(true);

    // Capture and analyze frames every 100ms (10 FPS)
    trackingIntervalRef.current = setInterval(async () => {
      await captureAndAnalyze();
    }, 100);
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setIsTracking(false);
  };

  const captureAndAnalyze = async () => {
    try {
      if (!cameraRef.current) return;

      // Capture photo with base64
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        skipProcessing: true,
      });

      // Send to backend AI service via TRPC
      const result = await trpc.eyeTracking.analyzeFace.mutate({
        image: `data:image/jpeg;base64,${photo.base64}`,
        timestamp: new Date().toISOString(),
      });

      if (result.success && result.face_detected) {
        setEyeData(result.analysis);
      } else {
        setEyeData(null);
      }
    } catch (error) {
      console.error('Eye tracking error:', error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.front}
        ratio="4:3"
      />

      {/* Eye Tracking Overlay */}
      <View style={styles.overlay}>
        {/* Status Indicator */}
        <View style={[styles.statusIndicator, isTracking && styles.statusActive]}>
          <Text style={styles.statusText}>
            {isTracking ? '● TRACKING' : '○ STOPPED'}
          </Text>
        </View>

        {/* Eye Data Display */}
        {eyeData && (
          <View style={styles.dataContainer}>
            {/* Eyes Status */}
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Eyes:</Text>
              <Text style={styles.dataValue}>
                {eyeData.eyes.both_open ? '👀 Open' : '👁 Closed'}
              </Text>
            </View>

            {/* Blinking */}
            {eyeData.eyes.blinking && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Status:</Text>
                <Text style={[styles.dataValue, styles.blinking]}>
                  👁️ Blinking
                </Text>
              </View>
            )}

            {/* Gaze Direction */}
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Gaze:</Text>
              <Text style={styles.dataValue}>
                {getGazeEmoji(eyeData.gaze.direction)} {eyeData.gaze.direction}
              </Text>
            </View>

            {/* Glasses Detection */}
            {eyeData.glasses.detected && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Glasses:</Text>
                <Text style={styles.dataValue}>
                  👓 Detected ({(eyeData.glasses.confidence * 100).toFixed(0)}%)
                </Text>
              </View>
            )}

            {/* Eye Aspect Ratios */}
            <View style={styles.earContainer}>
              <View style={styles.earBox}>
                <Text style={styles.earLabel}>Left EAR</Text>
                <Text style={styles.earValue}>
                  {eyeData.eyes.left.aspect_ratio.toFixed(3)}
                </Text>
              </View>
              <View style={styles.earBox}>
                <Text style={styles.earLabel}>Right EAR</Text>
                <Text style={styles.earValue}>
                  {eyeData.eyes.right.aspect_ratio.toFixed(3)}
                </Text>
              </View>
            </View>

            {/* Pupil Positions */}
            <View style={styles.pupilContainer}>
              <Text style={styles.pupilTitle}>Pupil Tracking</Text>
              <View style={styles.pupilRow}>
                <View style={styles.pupilBox}>
                  <Text style={styles.pupilLabel}>Left</Text>
                  <Text style={styles.pupilCoords}>
                    x: {eyeData.eyes.left.pupil.x.toFixed(2)}
                  </Text>
                  <Text style={styles.pupilCoords}>
                    y: {eyeData.eyes.left.pupil.y.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.pupilBox}>
                  <Text style={styles.pupilLabel}>Right</Text>
                  <Text style={styles.pupilCoords}>
                    x: {eyeData.eyes.right.pupil.x.toFixed(2)}
                  </Text>
                  <Text style={styles.pupilCoords}>
                    y: {eyeData.eyes.right.pupil.y.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Detection Quality */}
            <View style={styles.qualityContainer}>
              <Text style={styles.qualityText}>
                ✓ {eyeData.face_quality.landmarks_count} landmarks detected
              </Text>
              {eyeData.face_quality.has_iris_tracking && (
                <Text style={styles.qualityText}>✓ Iris tracking enabled</Text>
              )}
            </View>
          </View>
        )}

        {/* No Face Detected Message */}
        {!eyeData && isTracking && (
          <View style={styles.noFaceContainer}>
            <Text style={styles.noFaceText}>👤 No face detected</Text>
            <Text style={styles.noFaceSubtext}>
              Position your face in the camera view
            </Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controls}>
          {!isTracking ? (
            <TouchableOpacity style={styles.startButton} onPress={startTracking}>
              <Text style={styles.startButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
              <Text style={styles.stopButtonText}>Stop Tracking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// 2. Helper Functions
// ============================================================================

function getGazeEmoji(direction) {
  switch (direction) {
    case 'left':
      return '←';
    case 'right':
      return '→';
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'center':
      return '●';
    default:
      return '○';
  }
}

// ============================================================================
// 3. Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dataContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginTop: 60,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dataLabel: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  dataValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  blinking: {
    color: '#ff6b6b',
  },
  earContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  earBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  earLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  earValue: {
    color: '#4ecdc4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pupilContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  pupilTitle: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  pupilRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pupilBox: {
    alignItems: 'center',
  },
  pupilLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  pupilCoords: {
    color: '#f39c12',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  qualityContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  qualityText: {
    color: '#2ecc71',
    fontSize: 12,
    marginBottom: 4,
  },
  noFaceContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  noFaceText: {
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noFaceSubtext: {
    color: '#aaa',
    fontSize: 14,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 5,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// ============================================================================
// 4. Advanced Features
// ============================================================================

/**
 * Calibration Component
 * Show user 9 points on screen and collect pupil data for each
 */
export function CalibrationScreen() {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [calibrationData, setCalibrationData] = useState([]);

  const calibrationPoints = [
    { x: 0.5, y: 0.5 }, // center
    { x: 0.0, y: 0.0 }, // top-left
    { x: 1.0, y: 0.0 }, // top-right
    { x: 0.0, y: 1.0 }, // bottom-left
    { x: 1.0, y: 1.0 }, // bottom-right
    { x: 0.5, y: 0.0 }, // top-center
    { x: 0.5, y: 1.0 }, // bottom-center
    { x: 0.0, y: 0.5 }, // left-center
    { x: 1.0, y: 0.5 }, // right-center
  ];

  const collectPointData = async () => {
    // Capture and analyze current point
    const result = await trpc.eyeTracking.analyzeFace.mutate({
      image: '...', // captured image
      timestamp: new Date().toISOString(),
    });

    if (result.success && result.face_detected) {
      const newData = [
        ...calibrationData,
        {
          ...calibrationPoints[currentPoint],
          pupilData: result.analysis.eyes,
        },
      ];

      setCalibrationData(newData);

      if (currentPoint < calibrationPoints.length - 1) {
        setCurrentPoint(currentPoint + 1);
      } else {
        // Calibration complete, send to backend
        await trpc.eyeTracking.calibrate.mutate({
          calibrationPoints: newData,
        });
      }
    }
  };

  // Render calibration UI...
}

/**
 * Blink Detection Hook
 * Detect and count blinks over time
 */
export function useBlinkDetection(eyeData) {
  const [blinkCount, setBlinkCount] = useState(0);
  const [wasBlinking, setWasBlinking] = useState(false);

  useEffect(() => {
    if (!eyeData) return;

    const isBlinking = eyeData.eyes.blinking;

    // Detect blink transition (was not blinking -> now blinking)
    if (isBlinking && !wasBlinking) {
      setBlinkCount((prev) => prev + 1);
    }

    setWasBlinking(isBlinking);
  }, [eyeData]);

  return blinkCount;
}

/**
 * Gaze Tracking Hook
 * Track where user is looking on screen
 */
export function useGazeTracking(eyeData, screenDimensions) {
  const [gazePosition, setGazePosition] = useState(null);

  useEffect(() => {
    if (!eyeData || !screenDimensions) return;

    const { x, y } = eyeData.gaze;

    // Convert normalized coordinates to screen position
    const screenX = ((x + 1) / 2) * screenDimensions.width;
    const screenY = ((y + 1) / 2) * screenDimensions.height;

    setGazePosition({ x: screenX, y: screenY });
  }, [eyeData, screenDimensions]);

  return gazePosition;
}
