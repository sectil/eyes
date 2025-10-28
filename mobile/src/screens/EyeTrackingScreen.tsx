import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type EyeTrackingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EyeTracking'
>;

export default function EyeTrackingScreen() {
  const navigation = useNavigation<EyeTrackingScreenNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [eyeData, setEyeData] = useState<any>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);
  const isAnalyzingRef = useRef(false);

  const startTracking = async () => {
    console.log('[Eye Tracking] Starting AI tracking...');
    setIsTracking(true);

    trackingIntervalRef.current = setInterval(async () => {
      await captureAndAnalyze();
    }, 1000);
  };

  const stopTracking = () => {
    console.log('[Eye Tracking] Stopping...');
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setIsTracking(false);
    setEyeData(null);
    isAnalyzingRef.current = false;
  };

  const captureAndAnalyze = async () => {
    if (isAnalyzingRef.current || !cameraRef.current || !isCameraReady) {
      return;
    }

    try {
      isAnalyzingRef.current = true;
      const startTime = Date.now();

      // SDK 54: Use takePictureAsync method
      if (!cameraRef.current.takePictureAsync) {
        console.error('[Eye Tracking] takePictureAsync not available');
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
        skipProcessing: true,
      });

      if (!photo?.base64) return;

      console.log('[Eye Tracking] Analyzing...');

      // Simple TRPC format - no batching
      const response = await fetch('http://192.168.1.12:3000/trpc/eyeTracking.analyzeFace?batch=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "0": {
            image: `data:image/jpeg;base64,${photo.base64}`,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      const data = await response.json();
      
      // TRPC batch response: [{ result: { data: ... } }]
      const result = data[0]?.result?.data;
      
      if (result?.success && result?.face_detected) {
        console.log('[Eye Tracking] ✓ FACE!');
        setEyeData(result.analysis);
        setLastAnalysisTime(Date.now() - startTime);
      } else {
        setEyeData(null);
      }
    } catch (error: any) {
      console.error('[Eye Tracking] Error:', error.message);
    } finally {
      isAnalyzingRef.current = false;
    }
  };

  React.useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Camera Permission Required
        </Text>
        <Text style={styles.errorText}>
          VisionCare needs camera access.
        </Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          Grant Permission
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
          Go Back
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
          onPress={() => navigation.goBack()}
          iconColor="#fff"
        />
        <Text variant="headlineSmall" style={styles.title}>
          AI Eye Tracking
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type="front"
          onCameraReady={() => {
            console.log('[Eye Tracking] Camera ready with takePictureAsync');
            setIsCameraReady(true);
          }}
        />

        <View style={styles.overlay}>
          <View style={[styles.statusIndicator, isTracking && styles.statusActive]}>
            <Text style={styles.statusText}>
              {isTracking ? '● TRACKING' : '○ STOPPED'}
            </Text>
          </View>

          {eyeData && (
            <View style={styles.dataContainer}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Eyes:</Text>
                <Text style={styles.dataValue}>
                  {eyeData.eyes.both_open ? '👀 Open' : '👁 Closed'}
                </Text>
              </View>

              {eyeData.eyes.blinking && (
                <Text style={[styles.dataValue, styles.blinking]}>👁️ Blinking</Text>
              )}

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Gaze:</Text>
                <Text style={styles.dataValue}>{eyeData.gaze.direction}</Text>
              </View>

              {eyeData.glasses.detected && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Glasses:</Text>
                  <Text style={styles.dataValue}>👓 Yes</Text>
                </View>
              )}

              <Text style={styles.qualityText}>
                ✓ {eyeData.face_quality.landmarks_count} landmarks • {lastAnalysisTime}ms
              </Text>
            </View>
          )}

          {!eyeData && isTracking && (
            <View style={styles.noFaceContainer}>
              <Text style={styles.noFaceText}>👤 Scanning...</Text>
            </View>
          )}

          <View style={styles.controls}>
            <Button 
              mode="contained" 
              onPress={isTracking ? stopTracking : startTracking} 
              style={isTracking ? styles.stopButton : styles.startButton}
            >
              {isTracking ? 'Stop' : 'Start AI Tracking'}
            </Button>
          </View>
        </View>
      </View>

      <Surface style={styles.infoCard} elevation={2}>
        <Text style={styles.infoTitle}>🤖 MediaPipe AI • 478 Landmarks</Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 10, paddingHorizontal: 10, backgroundColor: '#6200ee' },
  title: { color: '#fff', fontWeight: 'bold' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 20 },
  statusIndicator: { alignSelf: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusActive: { backgroundColor: 'rgba(0, 255, 0, 0.3)' },
  statusText: { color: '#fff', fontWeight: 'bold' },
  dataContainer: { backgroundColor: 'rgba(0, 0, 0, 0.85)', borderRadius: 12, padding: 16, marginTop: 60 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dataLabel: { color: '#aaa', fontSize: 14 },
  dataValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  blinking: { color: '#ff6b6b', marginBottom: 8 },
  qualityText: { color: '#2ecc71', fontSize: 11, marginTop: 8 },
  noFaceContainer: { alignItems: 'center', marginTop: 100 },
  noFaceText: { color: '#fff', fontSize: 18 },
  controls: { alignItems: 'center', marginBottom: 20 },
  startButton: { backgroundColor: '#4ecdc4' },
  stopButton: { backgroundColor: '#ff6b6b' },
  infoCard: { backgroundColor: '#6200ee', padding: 12, alignItems: 'center' },
  infoTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  errorTitle: { color: '#d32f2f', marginBottom: 16, textAlign: 'center' },
  errorText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  button: { marginTop: 12, minWidth: 200 },
});
