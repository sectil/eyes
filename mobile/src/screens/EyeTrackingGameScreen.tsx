import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import * as FileSystem from 'expo-file-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GAME_WIDTH = screenWidth;
const GAME_HEIGHT = screenHeight * 0.6; // Game area height
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 15;
const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_WIDTH = (GAME_WIDTH - 40) / BRICK_COLS;
const BRICK_HEIGHT = 25;

type Brick = {
  id: number;
  x: number;
  y: number;
  visible: boolean;
  color: string;
};

type EyeTrackingGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EyeTrackingGame'
>;

export default function EyeTrackingGameScreen() {
  const navigation = useNavigation<EyeTrackingGameScreenNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Paddle position (controlled by eye tracking)
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);

  // Ball state
  const [ballX, setBallX] = useState(GAME_WIDTH / 2);
  const [ballY, setBallY] = useState(GAME_HEIGHT - 100);
  const [ballVelX, setBallVelX] = useState(3);
  const [ballVelY, setBallVelY] = useState(-3);

  // Bricks
  const [bricks, setBricks] = useState<Brick[]>([]);

  const cameraRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);
  const gameLoopRef = useRef<any>(null);
  const isAnalyzingRef = useRef(false);

  // Initialize bricks
  useEffect(() => {
    const newBricks: Brick[] = [];
    const colors = ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB'];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          id: row * BRICK_COLS + col,
          x: col * BRICK_WIDTH + 20,
          y: row * BRICK_HEIGHT + 40,
          visible: true,
          color: colors[row % colors.length],
        });
      }
    }
    setBricks(newBricks);
  }, []);

  // Eye tracking for paddle control
  const startEyeTracking = async () => {
    console.log('[Eye Game] Starting eye tracking...');

    trackingIntervalRef.current = setInterval(async () => {
      await captureAndAnalyze();
    }, 100); // 100ms for responsive control
  };

  const stopEyeTracking = () => {
    console.log('[Eye Game] Stopping eye tracking...');
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    isAnalyzingRef.current = false;
  };

  const captureAndAnalyze = async () => {
    if (isAnalyzingRef.current || !cameraRef.current || !isCameraReady) {
      return;
    }

    let photoUri: string | null = null;

    try {
      isAnalyzingRef.current = true;

      // Take picture from CameraView
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: false,
        skipProcessing: true,
      });

      if (!photo?.uri) return;
      photoUri = photo.uri;

      // Read as base64
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64) return;

      // Analyze with AI
      const trpcResponse = await fetch('http://192.168.1.12:3000/trpc/eyeTracking.analyzeFace?batch=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "0": {
            image: `data:image/jpeg;base64,${base64}`,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      const data = await trpcResponse.json();
      const result = data[0]?.result?.data;

      if (result?.success && result?.face_detected && result?.analysis?.gaze) {
        // Map gaze direction to paddle position
        const gazeDirection = result.analysis.gaze.direction;
        const gazeX = result.analysis.gaze.horizontal_position || 0.5; // 0-1 range

        // Convert gaze position to paddle X coordinate
        const newPaddleX = Math.max(
          0,
          Math.min(
            GAME_WIDTH - PADDLE_WIDTH,
            gazeX * GAME_WIDTH - PADDLE_WIDTH / 2
          )
        );

        setPaddleX(newPaddleX);
      }
    } catch (error: any) {
      console.error('[Eye Game] Error:', error.message);
    } finally {
      // Clean up photo file
      if (photoUri) {
        try {
          await FileSystem.deleteAsync(photoUri, { idempotent: true });
        } catch (cleanupError) {
          console.log('[Eye Game] Photo cleanup warning:', cleanupError);
        }
      }
      isAnalyzingRef.current = false;
    }
  };

  // Game loop
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);

    // Reset ball
    setBallX(GAME_WIDTH / 2);
    setBallY(GAME_HEIGHT - 100);
    setBallVelX(3);
    setBallVelY(-3);

    // Reset bricks
    setBricks(prev => prev.map(b => ({ ...b, visible: true })));

    // Start eye tracking
    startEyeTracking();

    // Start game loop
    gameLoopRef.current = setInterval(() => {
      updateGame();
    }, 16); // ~60 FPS
  };

  const stopGame = () => {
    setIsPlaying(false);
    stopEyeTracking();
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  const updateGame = () => {
    setBallX(prev => {
      let newX = prev + ballVelX;

      // Wall collision
      if (newX <= 0 || newX >= GAME_WIDTH - BALL_SIZE) {
        setBallVelX(v => -v);
        newX = prev - ballVelX;
      }

      return newX;
    });

    setBallY(prev => {
      let newY = prev + ballVelY;

      // Top wall
      if (newY <= 0) {
        setBallVelY(v => -v);
        newY = 0;
      }

      // Bottom (lose life)
      if (newY >= GAME_HEIGHT) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            stopGame();
            setGameOver(true);
          } else {
            // Reset ball
            setTimeout(() => {
              setBallX(GAME_WIDTH / 2);
              setBallY(GAME_HEIGHT - 100);
              setBallVelX(3);
              setBallVelY(-3);
            }, 500);
          }
          return newLives;
        });
        return GAME_HEIGHT - 100;
      }

      // Paddle collision
      if (
        newY + BALL_SIZE >= GAME_HEIGHT - 50 &&
        newY + BALL_SIZE <= GAME_HEIGHT - 35 &&
        prev + ballVelY < GAME_HEIGHT - 50 &&
        ballX + BALL_SIZE >= paddleX &&
        ballX <= paddleX + PADDLE_WIDTH
      ) {
        setBallVelY(v => -Math.abs(v)); // Always bounce up

        // Add spin based on where ball hits paddle
        const hitPos = (ballX - paddleX) / PADDLE_WIDTH;
        setBallVelX(v => (hitPos - 0.5) * 6);

        newY = GAME_HEIGHT - 50 - BALL_SIZE;
      }

      return newY;
    });

    // Brick collision
    setBricks(prev => {
      let hitBrick = false;
      const newBricks = prev.map(brick => {
        if (!brick.visible) return brick;

        if (
          ballX + BALL_SIZE >= brick.x &&
          ballX <= brick.x + BRICK_WIDTH &&
          ballY + BALL_SIZE >= brick.y &&
          ballY <= brick.y + BRICK_HEIGHT
        ) {
          hitBrick = true;
          setScore(s => s + 10);
          return { ...brick, visible: false };
        }
        return brick;
      });

      if (hitBrick) {
        setBallVelY(v => -v);
      }

      // Check win condition
      const allDestroyed = newBricks.every(b => !b.visible);
      if (allDestroyed && isPlaying) {
        stopGame();
        setGameOver(true);
      }

      return newBricks;
    });
  };

  useEffect(() => {
    return () => {
      stopEyeTracking();
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
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
          Göz takibi oyunu için kamera erişimi gereklidir.
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

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => {
            stopGame();
            navigation.goBack();
          }}
          iconColor="#fff"
        />
        <Text variant="headlineSmall" style={styles.title}>
          👁️ Göz Takipli Oyun
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.statsBar}>
        <Text style={styles.statText}>Skor: {score}</Text>
        <Text style={styles.statText}>Can: {'❤️'.repeat(lives)}</Text>
      </View>

      {/* Camera for eye tracking (hidden) */}
      <View style={styles.hiddenCamera}>
        <CameraView
          ref={cameraRef}
          style={{ width: 100, height: 100 }}
          facing="front"
          onCameraReady={() => {
            console.log('[Eye Game] Camera ready');
            setIsCameraReady(true);
          }}
        />
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Bricks */}
        {bricks.map(brick => (
          brick.visible && (
            <View
              key={brick.id}
              style={[
                styles.brick,
                {
                  left: brick.x,
                  top: brick.y,
                  width: BRICK_WIDTH - 2,
                  height: BRICK_HEIGHT - 2,
                  backgroundColor: brick.color,
                }
              ]}
            />
          )
        ))}

        {/* Ball */}
        <View
          style={[
            styles.ball,
            {
              left: ballX,
              top: ballY,
              width: BALL_SIZE,
              height: BALL_SIZE,
            }
          ]}
        />

        {/* Paddle */}
        <View
          style={[
            styles.paddle,
            {
              left: paddleX,
              bottom: 50,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
            }
          ]}
        />

        {/* Game Over / Start Overlay */}
        {!isPlaying && (
          <View style={styles.overlay}>
            {gameOver && (
              <View style={styles.gameOverCard}>
                <Text variant="headlineLarge" style={styles.gameOverTitle}>
                  {bricks.every(b => !b.visible) ? '🎉 Kazandınız!' : '😢 Oyun Bitti'}
                </Text>
                <Text variant="titleLarge" style={styles.finalScore}>
                  Final Skor: {score}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={startGame}
              style={styles.startButton}
              icon="play"
            >
              {gameOver ? 'Tekrar Oyna' : 'Oyunu Başlat'}
            </Button>

            {!gameOver && (
              <Text style={styles.instructions}>
                👁️ Gözlerinizi hareket ettirerek çubuğu kontrol edin
              </Text>
            )}
          </View>
        )}
      </View>

      <Surface style={styles.infoCard} elevation={2}>
        <Text style={styles.infoTitle}>
          Göz takibi ile çubuğu hareket ettirin ve tuğlaları kırın!
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#6200ee'
  },
  title: { color: '#fff', fontWeight: 'bold' },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#333',
  },
  statText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hiddenCamera: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    width: 100,
    height: 100,
    opacity: 0,
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  brick: {
    position: 'absolute',
    borderRadius: 4,
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 100,
  },
  paddle: {
    position: 'absolute',
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  gameOverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  gameOverTitle: {
    color: '#fff',
    marginBottom: 16,
  },
  finalScore: {
    color: '#4ecdc4',
  },
  startButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 32,
  },
  instructions: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  infoCard: {
    backgroundColor: '#6200ee',
    padding: 12,
    alignItems: 'center'
  },
  infoTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center'
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20
  },
  button: { marginTop: 12, minWidth: 200 },
});
