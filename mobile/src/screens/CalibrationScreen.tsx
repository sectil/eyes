import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Animated } from 'react-native';
import { Text, Button, Surface, IconButton, ProgressBar } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CALIBRATION_POINTS = 9; // 3x3 grid
const SAMPLES_PER_POINT = 5;
const SAMPLE_INTERVAL = 250; // ms - Balanced for reliability and responsiveness

// 9 kalibrasyon noktası pozisyonları (%)
const CALIBRATION_POSITIONS = [
  { x: 15, y: 20 },   // Top-left
  { x: 50, y: 20 },   // Top-center
  { x: 85, y: 20 },   // Top-right
  { x: 15, y: 50 },   // Middle-left
  { x: 50, y: 50 },   // Center
  { x: 85, y: 50 },   // Middle-right
  { x: 15, y: 80 },   // Bottom-left
  { x: 50, y: 80 },   // Bottom-center
  { x: 85, y: 80 },   // Bottom-right
];

export default function CalibrationScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(-1);
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [calibrationData, setCalibrationData] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [eyeTrackingData, setEyeTrackingData] = useState<any>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const cameraRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isCollecting = useRef(false);
  const trackingIntervalRef = useRef<any>(null);
  const isTakingPictureRef = useRef(false); // Lock to prevent concurrent camera access
  const lastHapticTimeRef = useRef(0); // To prevent haptic spam
  const isAlignedRef = useRef(false); // Track if eyes are aligned

  // Pulse animasyonu
  useEffect(() => {
    if (isCalibrating && currentPointIndex >= 0) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isCalibrating, currentPointIndex]);

  const captureAndAnalyze = async () => {
    // Prevent concurrent camera access
    if (isTakingPictureRef.current) {
      console.log('[Calibration] Skipping - camera busy');
      return null;
    }

    if (!cameraRef.current || !isCameraReady) {
      console.log('[Calibration] Camera not ready yet');
      return null;
    }

    try {
      isTakingPictureRef.current = true;
      console.log('[Calibration] Taking picture...');

      // Take photo with Camera - Optimized quality for performance
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      if (!photo.base64) {
        console.log('[Calibration] No base64 data in photo');
        return null;
      }

      console.log('[Calibration] Photo captured, analyzing...');

      // Send to AI backend
      const response = await fetch('http://192.168.1.12:3000/trpc/eyeTracking.analyzeFace?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "0": {
            image: `data:image/jpeg;base64,${photo.base64}`,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      const data = await response.json();
      console.log('[Calibration] AI Response:', JSON.stringify(data).substring(0, 200));

      const result = data[0]?.result?.data;

      if (result?.success && result?.face_detected) {
        console.log('[Calibration] ✓ Face detected!');
        console.log('[Calibration] Eyes data:', JSON.stringify(result.analysis?.eyes, null, 2));
        console.log('[Calibration] Pupils data:', JSON.stringify(result.analysis?.pupils, null, 2));
        console.log('[Calibration] Gaze data:', JSON.stringify(result.analysis?.gaze, null, 2));
        return result.analysis;
      }

      console.log('[Calibration] No face detected in image');
      return null;
    } catch (error) {
      console.error('[Calibration] Analysis error:', error);
      return null;
    } finally {
      isTakingPictureRef.current = false;
    }
  };

  // Check if gaze is aligned with calibration point and trigger haptic feedback
  const checkGazeAlignment = (analysis: any) => {
    if (!analysis?.gaze || currentPointIndex < 0) return;

    const currentPoint = CALIBRATION_POSITIONS[currentPointIndex];

    // Convert calibration point (0-100%) to normalized coordinates (-1 to 1)
    // Screen center is (50%, 50%) = (0, 0) in normalized coords
    const targetX = (currentPoint.x - 50) / 50; // Convert 0-100% to -1 to 1
    const targetY = (currentPoint.y - 50) / 50; // Convert 0-100% to -1 to 1

    // Get current gaze position (-1 to 1)
    const gazeX = analysis.gaze.x;
    const gazeY = analysis.gaze.y;

    // Calculate distance between gaze and target
    const distance = Math.sqrt(
      Math.pow(targetX - gazeX, 2) +
      Math.pow(targetY - gazeY, 2)
    );

    // Debug: Log alignment data
    console.log('[Calibration] Alignment check:', {
      point: currentPointIndex + 1,
      targetPos: { x: currentPoint.x + '%', y: currentPoint.y + '%' },
      targetNorm: { x: targetX.toFixed(2), y: targetY.toFixed(2) },
      gazeNorm: { x: gazeX.toFixed(2), y: gazeY.toFixed(2) },
      distance: distance.toFixed(2),
      aligned: distance < 0.5 ? '✓ YES' : '✗ NO'
    });

    // Threshold for alignment (more lenient for testing)
    const ALIGNMENT_THRESHOLD = 0.5; // Increased for easier alignment
    const isAligned = distance < ALIGNMENT_THRESHOLD;

    // Trigger haptic feedback when alignment changes from not-aligned to aligned
    if (isAligned && !isAlignedRef.current) {
      const now = Date.now();
      // Prevent haptic spam (at most once every 500ms)
      if (now - lastHapticTimeRef.current > 500) {
        console.log('[Calibration] 🎯 ALIGNED! Triggering haptic...');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        lastHapticTimeRef.current = now;
      }
    }

    isAlignedRef.current = isAligned;
  };

  const collectSampleForPoint = async () => {
    if (isCollecting.current) return;
    isCollecting.current = true;

    const analysis = await captureAndAnalyze();

    if (analysis) {
      // Check gaze alignment and trigger haptic feedback
      checkGazeAlignment(analysis);

      const currentPoint = CALIBRATION_POSITIONS[currentPointIndex];
      const newSample = {
        pointIndex: currentPointIndex,
        screenX: (currentPoint.x / 100) * screenWidth,
        screenY: (currentPoint.y / 100) * screenHeight,
        eyeData: analysis,
        timestamp: new Date().toISOString(),
      };

      setCalibrationData(prev => [...prev, newSample]);
      setSamplesCollected(prev => prev + 1);
      setProgress((currentPointIndex * SAMPLES_PER_POINT + samplesCollected + 1) / (CALIBRATION_POINTS * SAMPLES_PER_POINT));
    }

    isCollecting.current = false;
  };

  useEffect(() => {
    if (!isCalibrating || currentPointIndex < 0) return;

    const interval = setInterval(() => {
      if (samplesCollected < SAMPLES_PER_POINT) {
        collectSampleForPoint();
      }
    }, SAMPLE_INTERVAL);

    return () => clearInterval(interval);
  }, [isCalibrating, currentPointIndex, samplesCollected]);

  useEffect(() => {
    if (samplesCollected >= SAMPLES_PER_POINT && currentPointIndex < CALIBRATION_POINTS - 1) {
      // Move to next point
      setCurrentPointIndex(prev => prev + 1);
      setSamplesCollected(0);
      isAlignedRef.current = false; // Reset alignment for new point
    } else if (samplesCollected >= SAMPLES_PER_POINT && currentPointIndex === CALIBRATION_POINTS - 1) {
      // Calibration complete
      finishCalibration();
    }
  }, [samplesCollected]);

  // Real-time eye tracking for visual feedback (only when NOT calibrating)
  useEffect(() => {
    if (!isCameraReady || isCalibrating) {
      // Stop tracking if calibration starts
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      return;
    }

    // Start continuous eye tracking only when NOT calibrating
    trackingIntervalRef.current = setInterval(async () => {
      const analysis = await captureAndAnalyze();
      if (analysis) {
        setEyeTrackingData(analysis);
        setFaceDetected(true);
      } else {
        setFaceDetected(false);
      }
    }, 300); // Update every 300ms - balanced for stability

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, [isCameraReady, isCalibrating]);

  const startCalibration = () => {
    console.log('[Calibration] Starting calibration...');
    setIsCalibrating(true);
    setCurrentPointIndex(0);
    setSamplesCollected(0);
    setCalibrationData([]);
    setProgress(0);
    // Clear eye tracking overlay during calibration
    setEyeTrackingData(null);
    setFaceDetected(false);
    // Reset haptic feedback state
    isAlignedRef.current = false;
    lastHapticTimeRef.current = 0;
  };

  const finishCalibration = async () => {
    console.log('[Calibration] Calibration complete!', {
      totalSamples: calibrationData.length,
      expectedSamples: CALIBRATION_POINTS * SAMPLES_PER_POINT,
    });

    // Save calibration data
    await AsyncStorage.setItem('calibrationData', JSON.stringify(calibrationData));
    await AsyncStorage.setItem('isCalibrated', 'true');

    setIsCalibrating(false);
    setCurrentPointIndex(-1);

    // Navigate back or show success
    alert('Calibration completed successfully!');
    navigation.goBack();
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need camera access for eye tracking</Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  const currentPoint = currentPointIndex >= 0 ? CALIBRATION_POSITIONS[currentPointIndex] : null;

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        enableTorch={false}
        onCameraReady={() => {
          console.log('[Calibration] Camera ready');
          setIsCameraReady(true);
        }}
      />

      {/* Overlay with calibration points */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Header */}
        <Surface style={styles.header} elevation={4}>
          <IconButton icon="close" onPress={() => navigation.goBack()} />
          <View style={styles.headerContent}>
            <Text variant="titleMedium">Eye Calibration</Text>
            {isCalibrating && (
              <Text variant="bodySmall">
                Point {currentPointIndex + 1}/{CALIBRATION_POINTS} - Sample {samplesCollected}/{SAMPLES_PER_POINT}
              </Text>
            )}
          </View>
        </Surface>

        {/* Progress bar */}
        {isCalibrating && (
          <ProgressBar progress={progress} style={styles.progressBar} />
        )}

        {/* Calibration points */}
        {isCalibrating && currentPoint && (
          <Animated.View
            style={[
              styles.calibrationPoint,
              {
                left: `${currentPoint.x}%`,
                top: `${currentPoint.y}%`,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
        )}

        {/* Start button */}
        {!isCalibrating && (
          <View style={styles.startContainer}>
            <Text variant="headlineSmall" style={styles.instructions}>
              Look at each point as it appears on screen
            </Text>
            <Text variant="bodyMedium" style={styles.subInstructions}>
              Keep your face steady and look directly at the dots
            </Text>
            <Button
              mode="contained"
              onPress={startCalibration}
              style={styles.startButton}
              disabled={!isCameraReady}
            >
              {isCameraReady ? 'Start Calibration' : 'Camera loading...'}
            </Button>
          </View>
        )}

        {/* Real-time Eye Tracking Overlay (hidden during calibration) */}
        {eyeTrackingData && faceDetected && !isCalibrating && (
          <View style={styles.eyeTrackingOverlay}>
            <View style={styles.eyeStatusCard}>
              <Text style={styles.eyeStatusTitle}>👁 Göz Takibi Aktif</Text>

              <View style={styles.eyeRow}>
                <Text style={styles.eyeLabel}>Sol Göz:</Text>
                <Text style={[styles.eyeValue, eyeTrackingData.eyes.left_open && styles.eyeOpen]}>
                  {eyeTrackingData.eyes.left_open ? '👁 Açık' : '😑 Kapalı'}
                </Text>
              </View>

              <View style={styles.eyeRow}>
                <Text style={styles.eyeLabel}>Sağ Göz:</Text>
                <Text style={[styles.eyeValue, eyeTrackingData.eyes.right_open && styles.eyeOpen]}>
                  {eyeTrackingData.eyes.right_open ? '👁 Açık' : '😑 Kapalı'}
                </Text>
              </View>

              {eyeTrackingData.eyes.blinking && (
                <Text style={styles.blinkingText}>👁️ Göz Kırpma Tespit Edildi</Text>
              )}

              <View style={styles.eyeRow}>
                <Text style={styles.eyeLabel}>Bakış:</Text>
                <Text style={styles.eyeValue}>{eyeTrackingData.gaze.direction}</Text>
              </View>

              {eyeTrackingData.pupils && (
                <>
                  <View style={styles.eyeRow}>
                    <Text style={styles.eyeLabel}>Sol Pupil:</Text>
                    <Text style={styles.eyeValue}>
                      ({eyeTrackingData.pupils.left.x.toFixed(2)}, {eyeTrackingData.pupils.left.y.toFixed(2)})
                    </Text>
                  </View>
                  <View style={styles.eyeRow}>
                    <Text style={styles.eyeLabel}>Sağ Pupil:</Text>
                    <Text style={styles.eyeValue}>
                      ({eyeTrackingData.pupils.right.x.toFixed(2)}, {eyeTrackingData.pupils.right.y.toFixed(2)})
                    </Text>
                  </View>
                </>
              )}

              <Text style={styles.landmarksText}>
                ✓ {eyeTrackingData.face_quality?.landmarks_count || 0} yüz noktası tespit edildi
              </Text>
            </View>
          </View>
        )}

        {!faceDetected && isCameraReady && (
          <View style={styles.noFaceWarning}>
            <Text style={styles.noFaceText}>⚠️ Yüz tespit edilemedi</Text>
            <Text style={styles.noFaceSubtext}>Lütfen kameraya doğrudan bakın</Text>
          </View>
        )}

        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Camera: {isCameraReady ? '✓' : '✗'} | Face: {faceDetected ? '✓' : '✗'} | Samples: {calibrationData.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  headerContent: {
    flex: 1,
  },
  progressBar: {
    height: 4,
  },
  calibrationPoint: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    marginLeft: -15,
    marginTop: -15,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000, // Ensure calibration point always stays on top
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  instructions: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subInstructions: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  startButton: {
    paddingHorizontal: 32,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeTrackingOverlay: {
    position: 'absolute',
    top: 80,
    right: 10,
    maxWidth: '50%',
  },
  eyeStatusCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  eyeStatusTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  eyeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  eyeLabel: {
    color: '#aaa',
    fontSize: 12,
  },
  eyeValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eyeOpen: {
    color: '#4CAF50',
  },
  blinkingText: {
    color: '#ff9800',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 4,
    fontWeight: 'bold',
  },
  landmarksText: {
    color: '#4CAF50',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  noFaceWarning: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    width: 200,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noFaceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  noFaceSubtext: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
