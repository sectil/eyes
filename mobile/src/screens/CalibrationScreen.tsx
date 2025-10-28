import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Animated } from 'react-native';
import { Text, Button, Surface, IconButton, ProgressBar } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CALIBRATION_POINTS = 9; // 3x3 grid
const SAMPLES_PER_POINT = 5;
const SAMPLE_INTERVAL = 200; // ms

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
  const cameraRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isCollecting = useRef(false);

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
    if (!cameraRef.current || !isCameraReady) {
      console.log('[Calibration] Camera not ready yet');
      return null;
    }

    try {
      console.log('[Calibration] Taking picture...');

      // Take photo with Camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
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
        return result.analysis;
      }

      console.log('[Calibration] No face detected in image');
      return null;
    } catch (error) {
      console.error('[Calibration] Analysis error:', error);
      return null;
    }
  };

  const collectSampleForPoint = async () => {
    if (isCollecting.current) return;
    isCollecting.current = true;

    const analysis = await captureAndAnalyze();

    if (analysis) {
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
    } else if (samplesCollected >= SAMPLES_PER_POINT && currentPointIndex === CALIBRATION_POINTS - 1) {
      // Calibration complete
      finishCalibration();
    }
  }, [samplesCollected]);

  const startCalibration = () => {
    console.log('[Calibration] Starting calibration...');
    setIsCalibrating(true);
    setCurrentPointIndex(0);
    setSamplesCollected(0);
    setCalibrationData([]);
    setProgress(0);
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

        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Camera: {isCameraReady ? '✓' : '✗'} | Samples: {calibrationData.length}
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
});
