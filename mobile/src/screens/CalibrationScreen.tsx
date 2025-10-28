import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Animated } from 'react-native';
import { Text, Button, Surface, IconButton, ProgressBar } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

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

  const startCalibration = () => {
    setIsCalibrating(true);
    setCurrentPointIndex(0);
    setSamplesCollected(0);
    setCalibrationData([]);
    setProgress(0);

    // İlk nokta için bekleme
    setTimeout(() => {
      collectSamplesForPoint(0);
    }, 1000);
  };

  const collectSamplesForPoint = async (pointIndex: number) => {
    if (pointIndex >= CALIBRATION_POINTS) {
      completeCalibration();
      return;
    }

    isCollecting.current = true;
    const point = CALIBRATION_POSITIONS[pointIndex];
    const samples: any[] = [];

    for (let i = 0; i < SAMPLES_PER_POINT; i++) {
      if (!isCollecting.current) return;

      try {
        const sample = await captureAndAnalyze();

        if (sample && sample.eyes && sample.eyes.both_open) {
          const avgPupilX = (sample.eyes.left.pupil.x + sample.eyes.right.pupil.x) / 2;
          const avgPupilY = (sample.eyes.left.pupil.y + sample.eyes.right.pupil.y) / 2;

          samples.push({
            screenX: point.x,
            screenY: point.y,
            pupilX: avgPupilX,
            pupilY: avgPupilY,
            timestamp: Date.now(),
          });

          setSamplesCollected(samples.length);
          const totalSamples = (pointIndex * SAMPLES_PER_POINT) + samples.length;
          setProgress(totalSamples / (CALIBRATION_POINTS * SAMPLES_PER_POINT));
        }

        await new Promise(resolve => setTimeout(resolve, SAMPLE_INTERVAL));
      } catch (error) {
        console.error('Sample error:', error);
      }
    }

    // Bu noktanın ortalama değerini al
    if (samples.length > 0) {
      const avgPupilX = samples.reduce((sum, s) => sum + s.pupilX, 0) / samples.length;
      const avgPupilY = samples.reduce((sum, s) => sum + s.pupilY, 0) / samples.length;

      setCalibrationData(prev => [
        ...prev,
        {
          screenX: point.x,
          screenY: point.y,
          pupilX: avgPupilX,
          pupilY: avgPupilY,
        },
      ]);
    }

    // Bir sonraki nokta
    setCurrentPointIndex(pointIndex + 1);
    setSamplesCollected(0);

    if (pointIndex + 1 < CALIBRATION_POINTS) {
      setTimeout(() => {
        collectSamplesForPoint(pointIndex + 1);
      }, 1000);
    } else {
      completeCalibration();
    }
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || !isCameraReady) {
      console.log('[Calibration] Camera not ready yet');
      return null;
    }

    try {
      console.log('[Calibration] Capturing camera view screenshot...');

      // Capture the camera view as an image
      const uri = await captureRef(cameraRef, {
        format: 'jpg',
        quality: 0.3,
      });

      console.log('[Calibration] Screenshot captured, reading file...');

      // Read the image as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64) {
        console.log('[Calibration] Failed to read base64');
        return null;
      }

      console.log('[Calibration] Sending to AI backend...');
      const response = await fetch('http://192.168.1.12:3000/trpc/eyeTracking.analyzeFace?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "0": {
            image: `data:image/jpeg;base64,${base64}`,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      const data = await response.json();
      const result = data[0]?.result?.data;

      if (result?.success && result?.face_detected) {
        console.log('[Calibration] ✓ Face detected!');
        return result.analysis;
      } else {
        console.log('[Calibration] No face detected');
      }

      return null;
    } catch (error) {
      console.error('[Calibration] Analysis error:', error);
      return null;
    }
  };

  const completeCalibration = async () => {
    isCollecting.current = false;
    setIsCalibrating(false);
    setCurrentPointIndex(-1);

    if (calibrationData.length >= 5) {
      // Kalibrasyonu kaydet (AsyncStorage ve Backend)
      const calibration = {
        version: '1.0',
        timestamp: Date.now(),
        points: calibrationData,
      };

      try {
        // Local storage'a kaydet
        await AsyncStorage.setItem('calibration_data', JSON.stringify(calibration));

        // Backend'e kaydet
        await fetch('http://192.168.1.12:3000/trpc/calibration.saveCalibration?batch=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "0": {
              calibrationData: calibration,
              userId: 'default',
            }
          }),
        });

        alert('✅ Kalibrasyon başarıyla kaydedildi!\n\nArtık Eye Tracking ekranında bakış takibi yapabilirsiniz.');
        navigation.goBack();
      } catch (error) {
        console.error('Save error:', error);
        alert('⚠️ Kalibrasyon tamamlandı ama kaydedilirken hata oluştu.');
      }
    } else {
      alert('❌ Kalibrasyon başarısız!\nYeterli veri toplanamadı. Tekrar deneyin.');
    }
  };

  const cancelCalibration = () => {
    isCollecting.current = false;
    setIsCalibrating(false);
    setCurrentPointIndex(-1);
    navigation.goBack();
  };

  if (!permission) {
    return <View style={styles.centerContainer}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>Kalibrasyon için kamera gerekli</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          Grant Permission
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
          Cancel
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={cancelCalibration}
          iconColor="#fff"
        />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Kalibrasyon
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      {!isCalibrating && (
        <View style={styles.instructionsContainer}>
          <Text variant="headlineMedium" style={styles.instructionTitle}>
            🎯 9 Noktalı Kalibrasyon
          </Text>
          <Text style={styles.instructionText}>
            Ekranda görünen yeşil noktalara sırayla bakın.
          </Text>
          <Text style={styles.instructionText}>
            Her nokta için başınızı sabit tutun.
          </Text>
          <Text style={styles.instructionText}>
            Her noktada 5 örnek toplanacak.
          </Text>

          <Button
            mode="contained"
            onPress={startCalibration}
            style={styles.startButton}
            icon="target"
          >
            Kalibrasyonu Başlat
          </Button>
        </View>
      )}

      <View
        style={styles.cameraContainer}
        ref={cameraRef}
        collapsable={false}
      >
        <CameraView
          style={styles.camera}
          facing="front"
          onCameraReady={() => {
            console.log('[Calibration] ✓ Camera ready for screenshot capture!');
            setIsCameraReady(true);
          }}
        />

        {isCalibrating && (
          <View style={styles.calibrationOverlay}>
            {/* 9 Kalibrasyon Noktası */}
            {CALIBRATION_POSITIONS.map((pos, index) => {
              const isActive = index === currentPointIndex;
              const isCompleted = index < currentPointIndex;

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.calibrationPoint,
                    {
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      backgroundColor: isCompleted ? '#2196F3' : isActive ? '#4CAF50' : '#fff',
                      borderColor: isActive ? '#fff' : '#6200ee',
                      transform: isActive ? [{ scale: scaleAnim }] : [{ scale: 1 }],
                    },
                  ]}
                />
              );
            })}

            {/* İlerleme */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Nokta {currentPointIndex + 1} / {CALIBRATION_POINTS} • Örnek {samplesCollected} / {SAMPLES_PER_POINT}
              </Text>
              <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />
            </View>

            <Button mode="contained" onPress={cancelCalibration} style={styles.cancelButton}>
              İptal
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#6200ee',
  },
  headerTitle: { color: '#fff', fontWeight: 'bold' },
  instructionsContainer: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  instructionTitle: { marginBottom: 16, textAlign: 'center', color: '#6200ee' },
  instructionText: { marginBottom: 8, textAlign: 'center', fontSize: 16 },
  startButton: { marginTop: 20, backgroundColor: '#4CAF50' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  calibrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
  },
  calibrationPoint: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    marginLeft: -15,
    marginTop: -15,
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressText: { color: '#fff', fontSize: 16, marginBottom: 12, textAlign: 'center' },
  progressBar: { height: 8, borderRadius: 4 },
  cancelButton: { backgroundColor: '#ff6b6b' },
  title: { color: '#6200ee', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#666' },
  button: { marginTop: 12, minWidth: 200 },
});
