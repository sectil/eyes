import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Camera, CheckCircle2, AlertCircle, X, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { getEyeTracker, type EyeData } from "@/lib/advancedEyeTracking";
import { initWebcam, stopWebcam } from "@/lib/eyeTracking";
import AnimatedEyeOverlay from "@/components/AnimatedEyeOverlay";
import { speak, playTickSound, playSuccessSound, setAudioEnabled, isAudioEnabled, WARMUP_VOICE_INSTRUCTIONS } from "@/lib/audioHelper";
import { useRef, useState, useEffect } from "react";

interface CalibrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type CalibrationStep = "setup" | "face-detection" | "eye-detection" | "calibration" | "complete";

// Helper function to calculate Eye Aspect Ratio (EAR)
function calculateEyeAspectRatio(
  keypoints: Array<{ x?: number; y?: number; z?: number }>,
  eye: 'left' | 'right'
): number {
  const indices = eye === 'left'
    ? [33, 160, 158, 133, 153, 144]
    : [362, 387, 385, 263, 380, 373];

  const [p1, p2, p3, p4, p5, p6] = indices.map(i => keypoints[i]);

  if (!p1?.x || !p2?.x || !p3?.x || !p4?.x || !p5?.x || !p6?.x) {
    return 1.0;
  }

  const vertical1 = Math.sqrt(
    Math.pow((p2.x - p6.x), 2) + Math.pow((p2.y! - p6.y!), 2)
  );
  const vertical2 = Math.sqrt(
    Math.pow((p3.x - p5.x), 2) + Math.pow((p3.y! - p5.y!), 2)
  );

  const horizontal = Math.sqrt(
    Math.pow((p1.x - p4.x), 2) + Math.pow((p1.y! - p4.y!), 2)
  );

  return (vertical1 + vertical2) / (2 * horizontal);
}

export default function SnakeGameCalibration({ onComplete, onCancel }: CalibrationWizardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastEyeDataRef = useRef<EyeData | null>(null);

  const [step, setStep] = useState<CalibrationStep>("setup");
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyesDetected, setEyesDetected] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [warmupStep, setWarmupStep] = useState(0);
  const [warmupCountdown, setWarmupCountdown] = useState(5);
  const [isModelLoading, setIsModelLoading] = useState(false);
  
  // Snake game states
  const [snakeGameActive, setSnakeGameActive] = useState(false);
  const [snakeBody, setSnakeBody] = useState<Array<{x: number, y: number}>>([{x: 5, y: 5}]);
  const [food, setFood] = useState<{x: number, y: number}>({x: 10, y: 10});
  const [snakeDirection, setSnakeDirection] = useState<{x: number, y: number}>({x: 1, y: 0});
  const [nextDirection, setNextDirection] = useState<{x: number, y: number}>({x: 1, y: 0});
  const [snakeScore, setSnakeScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [audioEnabled, setAudioEnabledState] = useState(true);
  const [gaze, setGaze] = useState<{x: number, y: number}>({x: 10, y: 10});
  const GRID_SIZE = 20;
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 400;
  const CELL_SIZE = GAME_WIDTH / GRID_SIZE;

  const WARMUP_EXERCISES = [
    { text: "Sol gözünüzü kırpın 👁️", duration: 5, icon: "👈" },
    { text: "Sağ gözünüzü kırpın 👁️", duration: 5, icon: "👉" },
    { text: "Her iki gözünüzü birlikte kırpın 👀", duration: 4, icon: "⬇️" },
    { text: "Gözlerinizi kapalı tutun 😴", duration: 3, icon: "🚫" },
    { text: "Gözlerinizi açın ve kameraya bakın 👀", duration: 3, icon: "✅" },
  ];

  // Initialize eye tracker
  useEffect(() => {
    const setup = async () => {
      try {
        const tracker = await getEyeTracker();
        trackerRef.current = tracker;
        setCameraReady(true);
      } catch (error: any) {
        toast.error("Göz takibi başlatılamadı");
      }
    };

    setup();
  }, []);

  // Snake game loop
  useEffect(() => {
    if (!snakeGameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnakeBody(prevBody => {
        const head = prevBody[0];
        const newHead = {
          x: (head.x + snakeDirection.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + snakeDirection.y + GRID_SIZE) % GRID_SIZE,
        };

        // Check if hit food
        if (newHead.x === food.x && newHead.y === food.y) {
          playSuccessSound();
          setSnakeScore(prev => prev + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          });
          return [newHead, ...prevBody];
        }

        // Check if hit self
        if (prevBody.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          toast.error("Oyun bitti! Yılan kendisine çarptı");
          return prevBody;
        }

        return [newHead, ...prevBody.slice(0, -1)];
      });
    }, 200); // Game speed

    return () => clearInterval(gameLoop);
  }, [snakeGameActive, snakeDirection, food, gameOver]);

  // Eye tracking for snake direction
  useEffect(() => {
    if (!snakeGameActive || !videoRef.current || !trackerRef.current) return;

    let trackingFrameId: number;

    const trackEyes = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        if (faces.length > 0) {
          const eyes = trackerRef.current.extractEyeData(faces[0]);
          if (eyes) {
            lastEyeDataRef.current = eyes;
            const calibratedGaze = trackerRef.current.calibrateGaze(eyes.gaze);

            // Convert gaze to grid coordinates
            const gridX = Math.floor(((calibratedGaze.x + 1) / 2) * GRID_SIZE);
            const gridY = Math.floor(((calibratedGaze.y + 1) / 2) * GRID_SIZE);

            setGaze({ x: gridX, y: gridY });

            // Determine direction based on gaze
            const head = snakeBody[0];
            const dx = gridX - head.x;
            const dy = gridY - head.y;

            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0 && snakeDirection.x === 0) setNextDirection({ x: 1, y: 0 });
              if (dx < 0 && snakeDirection.x === 0) setNextDirection({ x: -1, y: 0 });
            } else {
              if (dy > 0 && snakeDirection.y === 0) setNextDirection({ x: 0, y: 1 });
              if (dy < 0 && snakeDirection.y === 0) setNextDirection({ x: 0, y: -1 });
            }
          }
        }
      } catch (error) {
        console.error("Eye tracking error:", error);
      }

      trackingFrameId = requestAnimationFrame(trackEyes);
    };

    trackEyes();

    return () => cancelAnimationFrame(trackingFrameId);
  }, [snakeGameActive, snakeBody]);

  // Update direction
  useEffect(() => {
    if (!snakeGameActive) return;
    setSnakeDirection(nextDirection);
  }, [nextDirection, snakeGameActive]);

  // Warmup countdown
  useEffect(() => {
    if (!isModelLoading || warmupStep >= WARMUP_EXERCISES.length) return;

    const timer = setInterval(() => {
      setWarmupCountdown(prev => {
        if (prev <= 1) {
          if (warmupStep < WARMUP_EXERCISES.length - 1) {
            setWarmupStep(prev => prev + 1);
            setWarmupCountdown(WARMUP_EXERCISES[warmupStep + 1].duration);
          } else {
            setIsModelLoading(false);
            setStep("face-detection");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModelLoading, warmupStep]);

  // Warmup voice instructions
  useEffect(() => {
    if (isModelLoading && warmupStep < WARMUP_EXERCISES.length) {
      const instruction = WARMUP_EXERCISES[warmupStep].text;
      if (audioEnabled) {
        speak(instruction);
      }
    }
  }, [warmupStep, isModelLoading, audioEnabled]);

  // Face detection
  useEffect(() => {
    if (step !== "face-detection" || !videoRef.current || !trackerRef.current) return;

    let detectionFrameId: number;

    const detectFace = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        setFaceDetected(faces.length > 0);

        if (faces.length > 0) {
          setTimeout(() => {
            setStep("eye-detection");
          }, 1500);
        }
      } catch (error) {
        console.error("Face detection error:", error);
      }

      detectionFrameId = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => cancelAnimationFrame(detectionFrameId);
  }, [step]);

  // Eye detection
  useEffect(() => {
    if (step !== "eye-detection" || !videoRef.current || !trackerRef.current) return;

    let detectionFrameId: number;

    const detectEyes = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        if (faces.length > 0) {
          const eyes = trackerRef.current.extractEyeData(faces[0]);
          lastEyeDataRef.current = eyes;
          setEyesDetected(!!eyes);
        }
      } catch (error) {
        console.error("Eye detection error:", error);
      }

      detectionFrameId = requestAnimationFrame(detectEyes);
    };

    detectEyes();

    return () => cancelAnimationFrame(detectionFrameId);
  }, [step]);

  const handleStartWarmup = () => {
    setIsModelLoading(true);
    setWarmupStep(0);
    setWarmupCountdown(WARMUP_EXERCISES[0].duration);
    if (audioEnabled) {
      speak(WARMUP_EXERCISES[0].text);
    }
  };

  const handleStartCalibration = async () => {
    try {
      if (!videoRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setStep("setup");
    } catch (error) {
      toast.error("Kamera erişimi başarısız");
    }
  };

  const handleStartSnakeGame = () => {
    setSnakeGameActive(true);
    setSnakeBody([{ x: 5, y: 5 }]);
    setFood({ x: 10, y: 10 });
    setSnakeScore(0);
    setGameOver(false);
    setSnakeDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
  };

  const handleCompleteCalibration = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onComplete();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Göz Kalibrasyonu</CardTitle>
            <CardDescription>Yılan oyunu ile göz takibi kalibrasyonu</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAudioEnabledState(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(step === "setup" ? 25 : step === "face-detection" ? 50 : step === "eye-detection" ? 75 : 100)} />

          {step === "setup" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Camera className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Kamerayı Etkinleştir</p>
                    <p className="text-sm text-muted-foreground">Başlamak için kamera erişimi gereklidir</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStartCalibration} className="flex-1">
                    Kamerayı Aç
                  </Button>
                  <Button onClick={onCancel} variant="outline">
                    <X className="h-4 w-4" /> İptal
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "face-detection" && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black/10"
              />
              <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                {faceDetected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">{faceDetected ? "Yüz Algılandı ✓" : "Yüzünüzü Kameraya Gösterin"}</p>
                  <p className="text-sm text-muted-foreground">
                    {faceDetected ? "Göz tespitine geçiliyor..." : "Lütfen kameranın karşısına oturun"}
                  </p>
                </div>
              </div>
            </>
          )}

          {step === "eye-detection" && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black/10"
              />
              {!snakeGameActive ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                    {eyesDetected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">{eyesDetected ? "Gözler Algılandı ✓" : "Gözlerinizi Açık Tutun"}</p>
                      <p className="text-sm text-muted-foreground">
                        {eyesDetected ? "Yılan oyunu başlatmaya hazır" : "Lütfen gözlerinizi açık tutun"}
                      </p>
                    </div>
                  </div>
                  {eyesDetected && (
                    <>
                      {!isModelLoading ? (
                        <Button onClick={handleStartWarmup} className="w-full">
                          Isınma Egzersizlerine Başla
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-4xl mb-2">{WARMUP_EXERCISES[warmupStep].icon}</div>
                            <p className="font-medium">{WARMUP_EXERCISES[warmupStep].text}</p>
                            <p className="text-2xl font-bold text-primary mt-2">{warmupCountdown}</p>
                          </div>
                          <Progress value={(warmupStep / WARMUP_EXERCISES.length) * 100} />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Snake Game */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Yılan Oyunu</h3>
                      <p className="text-lg font-bold text-primary">Puan: {snakeScore}</p>
                    </div>
                    
                    <div
                      className="relative mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-primary/30"
                      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
                    >
                      {/* Snake */}
                      {snakeBody.map((segment, i) => (
                        <div
                          key={i}
                          className={`absolute transition-all duration-75 rounded-sm ${
                            i === 0 ? 'bg-green-600 shadow-lg' : 'bg-green-500'
                          }`}
                          style={{
                            left: segment.x * CELL_SIZE,
                            top: segment.y * CELL_SIZE,
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2,
                          }}
                        />
                      ))}

                      {/* Food */}
                      <div
                        className="absolute bg-red-500 rounded-full animate-pulse"
                        style={{
                          left: food.x * CELL_SIZE + CELL_SIZE / 4,
                          top: food.y * CELL_SIZE + CELL_SIZE / 4,
                          width: CELL_SIZE / 2,
                          height: CELL_SIZE / 2,
                        }}
                      />

                      {/* Gaze indicator */}
                      <div
                        className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-50"
                        style={{
                          left: gaze.x * CELL_SIZE + CELL_SIZE / 2 - 1,
                          top: gaze.y * CELL_SIZE + CELL_SIZE / 2 - 1,
                        }}
                      />
                    </div>

                    {gameOver && (
                      <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
                        <p className="font-semibold text-red-900 dark:text-red-100">Oyun Bitti!</p>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">Final Puan: {snakeScore}</p>
                      </div>
                    )}

                    {gameOver && (
                      <Button
                        onClick={handleCompleteCalibration}
                        className="w-full"
                      >
                        Testlere Devam Et
                      </Button>
                    )}
                    {!gameOver && (
                      <Button
                        onClick={handleCompleteCalibration}
                        className="w-full"
                      >
                        Kalibrasyonu Tamamla
                      </Button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

