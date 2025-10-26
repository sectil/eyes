import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
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
  const [isReady, setIsReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Simulate model loading for demo purposes
    // In production, you would initialize TensorFlow.js here
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleFaceDetection = (data: any) => {
    // This is a placeholder for face detection
    // In production, you would process camera frames with TensorFlow.js
    if (data && data.faces && data.faces.length > 0) {
      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    // Implement calibration logic here
    setTimeout(() => {
      setFaceDetected(true);
    }, 1000);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading...</Text>
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
          VisionCare needs camera access for eye tracking and calibration tests.
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

  if (!isReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Initializing eye tracking...</Text>
        <Text style={styles.subText}>This may take a moment</Text>
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
          Eye Tracking Calibration
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        />

        <View style={styles.overlay}>
          <Surface style={styles.statusCard} elevation={3}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, faceDetected && styles.statusDotActive]} />
              <Text style={styles.statusText}>
                {faceDetected ? 'Face detected' : 'No face detected'}
              </Text>
            </View>

            {faceDetected && (
              <View style={styles.eyeInfo}>
                <Text style={styles.eyeInfoText}>Left Eye: ✓</Text>
                <Text style={styles.eyeInfoText}>Right Eye: ✓</Text>
              </View>
            )}
          </Surface>

          {!faceDetected && (
            <Surface style={styles.instructionCard} elevation={2}>
              <Text style={styles.instructionTitle}>Position your face</Text>
              <Text style={styles.instructionText}>
                • Look directly at the camera{'\n'}
                • Ensure good lighting{'\n'}
                • Keep your face in the frame
              </Text>
            </Surface>
          )}
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.infoText}>
          {faceDetected
            ? 'Great! Your eyes are being tracked. Follow the on-screen instructions.'
            : 'Position your face in front of the camera to begin.'}
        </Text>

        {!isCalibrating && (
          <Button mode="contained" onPress={startCalibration} style={styles.calibrateButton}>
            {faceDetected ? 'Start Calibration' : 'Position Your Face'}
          </Button>
        )}
        {isCalibrating && faceDetected && (
          <Surface style={styles.calibrationCard} elevation={3}>
            <Text style={styles.calibrationTitle}>Calibration in Progress</Text>
            <Text style={styles.calibrationText}>
              Follow the dot with your eyes as it moves around the screen
            </Text>
            <ActivityIndicator size="small" color="#6200ee" style={{ marginTop: 12 }} />
          </Surface>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#6200ee',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight * 0.6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff5252',
    marginRight: 12,
  },
  statusDotActive: {
    backgroundColor: '#4caf50',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eyeInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  eyeInfoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  instructionCard: {
    backgroundColor: 'rgba(98, 0, 238, 0.95)',
    padding: 20,
    borderRadius: 12,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  calibrateButton: {
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorTitle: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 12,
    minWidth: 200,
  },
  calibrationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  calibrationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  calibrationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
