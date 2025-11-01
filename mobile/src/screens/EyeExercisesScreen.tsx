import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Animated, ScrollView } from 'react-native';
import { Text, Button, Card, Surface, IconButton, ProgressBar, List } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Egzersiz tipleri
const EXERCISES = [
  {
    id: 1,
    title: 'Göz Kırpma',
    description: '10 kez göz kırpma yapın',
    duration: 30,
    type: 'blink',
    icon: 'eye-outline',
    instructions: 'Gözlerinizi yavaşça 10 kez açıp kapatın',
  },
  {
    id: 2,
    title: 'Gözleri Kapatma',
    description: 'Gözlerinizi 10 saniye kapalı tutun',
    duration: 10,
    type: 'close',
    icon: 'eye-off-outline',
    instructions: 'Gözlerinizi rahatça kapatın ve 10 saniye bekleyin',
  },
  {
    id: 3,
    title: 'Dikdörtgen Hareket',
    description: 'Göz bebeklerinizi dikdörtgen köşelerinde gezdirin',
    duration: 40,
    type: 'rectangle',
    icon: 'crop-square',
    instructions: 'Sol üst → Sağ üst → Sağ alt → Sol alt köşelere bakın',
  },
  {
    id: 4,
    title: 'Yıldız Hareket',
    description: 'Göz bebeklerinizi yıldız şeklinde gezdirin',
    duration: 45,
    type: 'star',
    icon: 'star-outline',
    instructions: '5 köşeli yıldız çizerek göz bebeklerinizi hareket ettirin',
  },
  {
    id: 5,
    title: 'Yatay Hareket',
    description: 'Sağa sola bakma egzersizi',
    duration: 30,
    type: 'horizontal',
    icon: 'arrow-left-right',
    instructions: 'Başınızı sabit tutarak sağa ve sola bakın',
  },
  {
    id: 6,
    title: 'Dikey Hareket',
    description: 'Yukarı aşağı bakma egzersizi',
    duration: 30,
    type: 'vertical',
    icon: 'arrow-up-down',
    instructions: 'Başınızı sabit tutarak yukarı ve aşağı bakın',
  },
  {
    id: 7,
    title: 'Çapraz Hareket',
    description: 'Çapraz köşelere bakma',
    duration: 35,
    type: 'diagonal',
    icon: 'arrow-top-right',
    instructions: 'Sol üst → Sağ alt, Sağ üst → Sol alt bakın',
  },
  {
    id: 8,
    title: 'Dairesel Hareket',
    description: 'Göz bebeklerinizi daire çizerek hareket ettirin',
    duration: 40,
    type: 'circle',
    icon: 'circle-outline',
    instructions: 'Saat yönünde ve ters yönde daire çizin',
  },
  {
    id: 9,
    title: 'Yakın-Uzak Odaklanma',
    description: 'Yakın ve uzak nesnelere odaklanın',
    duration: 45,
    type: 'focus',
    icon: 'eye-settings-outline',
    instructions: 'Parmağınıza sonra uzağa bakarak odaklanın',
  },
  {
    id: 10,
    title: 'Dinlenme',
    description: 'Gözlerinizi dinlendirin',
    duration: 20,
    type: 'rest',
    icon: 'sleep',
    instructions: 'Gözlerinizi kapatın ve rahatça nefes alın',
  },
];

// Dikdörtgen köşe pozisyonları
const RECTANGLE_POINTS = [
  { x: 20, y: 20 },  // Sol üst
  { x: 80, y: 20 },  // Sağ üst
  { x: 80, y: 80 },  // Sağ alt
  { x: 20, y: 80 },  // Sol alt
];

// Yıldız noktaları (5 köşeli)
const STAR_POINTS = [
  { x: 50, y: 10 },  // Üst
  { x: 75, y: 75 },  // Sağ alt
  { x: 15, y: 35 },  // Sol orta
  { x: 85, y: 35 },  // Sağ orta
  { x: 25, y: 75 },  // Sol alt
];

export default function EyeExercisesScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [eyeData, setEyeData] = useState<any>(null);
  const [blinkCount, setBlinkCount] = useState(0);

  const pointAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);
  const isTakingPictureRef = useRef(false);
  const lastBlinkStateRef = useRef(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Göz takibi ve analiz
  const captureAndAnalyze = async () => {
    if (isTakingPictureRef.current || !cameraRef.current || !isCameraReady) {
      return null;
    }

    try {
      isTakingPictureRef.current = true;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      if (!photo.base64) return null;

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
      const result = data[0]?.result?.data;

      if (result?.success && result?.face_detected) {
        return result.analysis;
      }

      return null;
    } catch (error) {
      console.error('[Exercise] Analysis error:', error);
      return null;
    } finally {
      isTakingPictureRef.current = false;
    }
  };

  // Göz kırpma algılama
  const detectBlink = (analysis: any) => {
    if (!analysis?.eyes) return;

    const isBlinking = analysis.eyes.blinking;

    // Göz kırpma tespit edildiğinde
    if (isBlinking && !lastBlinkStateRef.current) {
      console.log('[Exercise] 👁 Blink detected!');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setBlinkCount(prev => prev + 1);
    }

    lastBlinkStateRef.current = isBlinking;
  };

  // Real-time göz takibi (egzersiz sırasında)
  useEffect(() => {
    if (!isExercising || !isCameraReady) {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      return;
    }

    trackingIntervalRef.current = setInterval(async () => {
      const analysis = await captureAndAnalyze();
      if (analysis) {
        setEyeData(analysis);
        detectBlink(analysis);
      }
    }, 300);

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, [isExercising, isCameraReady]);

  // Nokta animasyonu
  useEffect(() => {
    if (isExercising) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pointAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pointAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isExercising]);

  // Egzersiz zamanlayıcı
  useEffect(() => {
    if (isExercising && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishExercise();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isExercising, timeLeft]);

  // Pattern points değişimi (dikdörtgen, yıldız)
  useEffect(() => {
    if (isExercising && (selectedExercise?.type === 'rectangle' || selectedExercise?.type === 'star')) {
      const pointInterval = setInterval(() => {
        setCurrentPoint(prev => {
          const points = selectedExercise.type === 'rectangle' ? RECTANGLE_POINTS : STAR_POINTS;
          return (prev + 1) % points.length;
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, selectedExercise.type === 'rectangle' ? 3000 : 3500);

      return () => clearInterval(pointInterval);
    }
  }, [isExercising, selectedExercise]);

  const startExercise = (exercise: any) => {
    console.log('[Exercise] Starting:', exercise.title);
    console.log('[Exercise] Real-time tracking and haptic feedback ENABLED ✓');
    setSelectedExercise(exercise);
    setIsExercising(true);
    setTimeLeft(exercise.duration);
    setCurrentPoint(0);
    setBlinkCount(0);
    setEyeData(null);
    lastBlinkStateRef.current = false;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const finishExercise = () => {
    console.log('[Exercise] Completed:', selectedExercise?.title);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (selectedExercise && !completedExercises.includes(selectedExercise.id)) {
      setCompletedExercises(prev => [...prev, selectedExercise.id]);
    }

    setIsExercising(false);
    setSelectedExercise(null);
    setTimeLeft(0);
  };

  const stopExercise = () => {
    console.log('[Exercise] Stopped');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsExercising(false);
    setSelectedExercise(null);
    setTimeLeft(0);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text>Kamera izni yükleniyor...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Kamera İzni Gerekli
        </Text>
        <Text style={styles.errorText}>
          Göz egzersizleri için kamera erişimi gereklidir
        </Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          İzin Ver
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
          Geri Dön
        </Button>
      </View>
    );
  }

  if (isExercising && selectedExercise) {
    const points = selectedExercise.type === 'rectangle' ? RECTANGLE_POINTS :
                   selectedExercise.type === 'star' ? STAR_POINTS : null;

    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          onCameraReady={() => {
            console.log('[Exercise] Camera ready');
            setIsCameraReady(true);
          }}
        />

        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Header */}
          <Surface style={styles.exerciseHeader} elevation={4}>
            <IconButton icon="close" onPress={stopExercise} iconColor="#fff" />
            <View style={styles.headerContent}>
              <Text variant="titleMedium" style={styles.headerTitle}>
                {selectedExercise.title}
              </Text>
              <Text variant="bodySmall" style={styles.headerSubtitle}>
                {selectedExercise.instructions}
              </Text>
            </View>
          </Surface>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
            <ProgressBar
              progress={(selectedExercise.duration - timeLeft) / selectedExercise.duration}
              style={styles.progressBar}
              color="#4CAF50"
            />
          </View>

          {/* Pattern points (Rectangle or Star) */}
          {points && points.map((point, index) => (
            <Animated.View
              key={index}
              style={[
                styles.patternPoint,
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: [{ scale: currentPoint === index ? pointAnim : 1 }],
                  backgroundColor: currentPoint === index ? '#4CAF50' : '#fff',
                  opacity: currentPoint === index ? 1 : 0.4,
                },
              ]}
            />
          ))}

          {/* Center instruction for other exercises */}
          {!points && (
            <View style={styles.centerInstruction}>
              <Text style={styles.instructionText}>
                {selectedExercise.instructions}
              </Text>
            </View>
          )}

          {/* Eye Status Feedback */}
          {eyeData && (
            <View style={styles.eyeFeedback}>
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackLabel}>👁 Göz Kırpma:</Text>
                <Text style={styles.feedbackValue}>{blinkCount} kez</Text>
              </View>
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackLabel}>Sol Göz:</Text>
                <Text style={[styles.feedbackValue, eyeData.eyes.left_open && styles.eyeOpenStatus]}>
                  {eyeData.eyes.left_open ? '✓ Açık' : '✗ Kapalı'}
                </Text>
              </View>
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackLabel}>Sağ Göz:</Text>
                <Text style={[styles.feedbackValue, eyeData.eyes.right_open && styles.eyeOpenStatus]}>
                  {eyeData.eyes.right_open ? '✓ Açık' : '✗ Kapalı'}
                </Text>
              </View>
              {eyeData.eyes.blinking && (
                <Text style={styles.blinkingIndicator}>👁️ Göz Kırpıyor!</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="headlineSmall" style={styles.title}>
          Göz Egzersizleri
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      {/* Progress Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium">İlerleme</Text>
          <Text variant="bodyLarge" style={styles.progressText}>
            {completedExercises.length} / {EXERCISES.length} Egzersiz Tamamlandı
          </Text>
          <ProgressBar
            progress={completedExercises.length / EXERCISES.length}
            style={styles.summaryProgress}
            color="#4CAF50"
          />
        </Card.Content>
      </Card>

      {/* Exercises List */}
      <ScrollView style={styles.scrollView}>
        {EXERCISES.map(exercise => (
          <Card
            key={exercise.id}
            style={[
              styles.exerciseCard,
              completedExercises.includes(exercise.id) && styles.completedCard
            ]}
          >
            <Card.Content>
              <View style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <List.Icon icon={exercise.icon} color="#6200ee" />
                  <View style={styles.exerciseText}>
                    <Text variant="titleMedium">{exercise.title}</Text>
                    <Text variant="bodySmall" style={styles.exerciseDesc}>
                      {exercise.description}
                    </Text>
                    <Text variant="bodySmall" style={styles.exerciseDuration}>
                      ⏱ {exercise.duration} saniye
                    </Text>
                  </View>
                </View>
                <Button
                  mode={completedExercises.includes(exercise.id) ? "outlined" : "contained"}
                  onPress={() => startExercise(exercise)}
                  icon={completedExercises.includes(exercise.id) ? "check" : "play"}
                >
                  {completedExercises.includes(exercise.id) ? "Tekrar" : "Başla"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  progressText: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryProgress: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  exerciseCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  completedCard: {
    backgroundColor: '#f0f8f0',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  exerciseText: {
    flex: 1,
    marginLeft: 8,
  },
  exerciseDesc: {
    color: '#666',
    marginTop: 4,
  },
  exerciseDuration: {
    color: '#999',
    marginTop: 2,
  },
  camera: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: 'rgba(98, 0, 238, 0.95)',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 6,
    marginTop: 8,
  },
  patternPoint: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -20,
    marginTop: -20,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  centerInstruction: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
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
  eyeFeedback: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feedbackLabel: {
    color: '#aaa',
    fontSize: 14,
  },
  feedbackValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  eyeOpenStatus: {
    color: '#4CAF50',
  },
  blinkingIndicator: {
    color: '#ff9800',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});
