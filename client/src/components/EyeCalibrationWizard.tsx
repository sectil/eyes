import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Camera, Target, CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { getEyeTracker, type EyeData } from "@/lib/advancedEyeTracking";
import { initWebcam, stopWebcam } from "@/lib/eyeTracking";
import AnimatedEyeOverlay from "@/components/AnimatedEyeOverlay";

interface CalibrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type CalibrationStep = "setup" | "face-detection" | "eye-detection" | "calibration" | "complete";

// Helper function to calculate Eye Aspect Ratio (EAR)
// Used to detect if eyes are open or closed
function calculateEyeAspectRatio(
  keypoints: Array<{ x?: number; y?: number; z?: number }>,
  eye: 'left' | 'right'
): number {
  // MediaPipe eye landmark indices
  const indices = eye === 'left'
    ? [33, 160, 158, 133, 153, 144] // Left eye: outer, top1, top2, inner, bottom2, bottom1
    : [362, 387, 385, 263, 380, 373]; // Right eye

  const [p1, p2, p3, p4, p5, p6] = indices.map(i => keypoints[i]);

  // Check if all points are valid
  if (!p1?.x || !p2?.x || !p3?.x || !p4?.x || !p5?.x || !p6?.x) {
    return 1.0; // Default to "open"
  }

  // Calculate vertical distances
  const vertical1 = Math.sqrt(
    Math.pow((p2.x - p6.x), 2) + Math.pow((p2.y! - p6.y!), 2)
  );
  const vertical2 = Math.sqrt(
    Math.pow((p3.x - p5.x), 2) + Math.pow((p3.y! - p5.y!), 2)
  );

  // Calculate horizontal distance
  const horizontal = Math.sqrt(
    Math.pow((p1.x - p4.x), 2) + Math.pow((p1.y! - p4.y!), 2)
  );

  // Eye Aspect Ratio
  const ear = (vertical1 + vertical2) / (2.0 * horizontal);
  return ear;
}

const CALIBRATION_POINTS = [
  { x: 0.5, y: 0.5, label: "Merkez" },      // Center
  { x: 0.1, y: 0.1, label: "Sol Üst" },     // Top-left
  { x: 0.9, y: 0.1, label: "Sağ Üst" },     // Top-right
  { x: 0.1, y: 0.9, label: "Sol Alt" },     // Bottom-left
  { x: 0.9, y: 0.9, label: "Sağ Alt" },     // Bottom-right
  { x: 0.5, y: 0.1, label: "Üst Merkez" },  // Top-center
  { x: 0.5, y: 0.9, label: "Alt Merkez" },  // Bottom-center
  { x: 0.1, y: 0.5, label: "Sol Merkez" },  // Left-center
  { x: 0.9, y: 0.5, label: "Sağ Merkez" },  // Right-center
];

export default function EyeCalibrationWizard({ onComplete, onCancel }: CalibrationWizardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<Awaited<ReturnType<typeof getEyeTracker>> | null>(null);
  const animationFrameRef = useRef<number>(0);

  const [step, setStep] = useState<CalibrationStep>("setup");
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyesDetected, setEyesDetected] = useState(false);
  const [leftEyeOpen, setLeftEyeOpen] = useState(true);
  const [rightEyeOpen, setRightEyeOpen] = useState(true);
  const [lastEyeData, setLastEyeData] = useState<EyeData | null>(null);
  const lastEyeDataRef = useRef<EyeData | null>(null);
  const [videoScale, setVideoScale] = useState({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 });
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [eyeData, setEyeData] = useState<EyeData | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [warmupStep, setWarmupStep] = useState(0);
  const [warmupCountdown, setWarmupCountdown] = useState(5);
  const [isModelLoading, setIsModelLoading] = useState(false);
  
  // Eye tracking game states
  const [eyeGameActive, setEyeGameActive] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<{x: number, y: number} | null>(null);
  const [targetStartTime, setTargetStartTime] = useState<number>(0);
  const [targetsCompleted, setTargetsCompleted] = useState(0);
  const [gameMetrics, setGameMetrics] = useState<Array<{reactionTime: number, accuracy: number, stability: number}>>([]);
  const [isLookingAtTarget, setIsLookingAtTarget] = useState(false);
  const [lookDuration, setLookDuration] = useState(0);
  const TOTAL_TARGETS = 10;
  const LOOK_DURATION_REQUIRED = 2; // seconds

  const WARMUP_EXERCISES = [
    { text: "Sol gözünüzü kırpın 👁️", duration: 5, icon: "👈" },
    { text: "Sağ gözünüzü kırpın 👁️", duration: 5, icon: "👉" },
    { text: "Her iki gözünüzü birlikte kırpın 👀", duration: 4, icon: "⬇️" },
    { text: "Gözlerinizi kapalı tutun 😴", duration: 3, icon: "🚫" },
    { text: "Gözlerinizi açın ve kameraya bakın 👀", duration: 3, icon: "✅" },
  ];

  // Eye tracking game - spawn new target
  useEffect(() => {
    if (!eyeGameActive || targetsCompleted >= TOTAL_TARGETS) return;
    
    if (!currentTarget) {
      // Spawn new target at random position
      const newTarget = {
        x: Math.random() * 70 + 15, // 15-85%
        y: Math.random() * 60 + 15, // 15-75%
      };
      setCurrentTarget(newTarget);
      setTargetStartTime(Date.now());
      setLookDuration(0);
      setIsLookingAtTarget(false);
    }
  }, [eyeGameActive, currentTarget, targetsCompleted, TOTAL_TARGETS]);

  // Eye tracking game - check if looking at target (using interval instead of useEffect)
  useEffect(() => {
    if (!eyeGameActive || !currentTarget) return;

    const interval = setInterval(() => {
      const eyeData = lastEyeDataRef.current;
      if (!eyeData) {
        console.log('⚠️ Göz verisi yok');
        return;
      }

      // Calculate gaze position (average of both eyes)
      const gazeX = (eyeData.left.center.x + eyeData.right.center.x) / 2;
      const gazeY = (eyeData.left.center.y + eyeData.right.center.y) / 2;

      // Convert target position to pixels
      const targetX = (currentTarget.x / 100) * (videoRef.current?.clientWidth || 640);
      const targetY = (currentTarget.y / 100) * (videoRef.current?.clientHeight || 480);

      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(gazeX - targetX, 2) + Math.pow(gazeY - targetY, 2)
      );

      // Check if within threshold (80 pixels)
      const isLooking = distance < 80;
      
      console.log('👁️ Göz:', { gazeX: gazeX.toFixed(0), gazeY: gazeY.toFixed(0) });
      console.log('🎯 Hedef:', { targetX: targetX.toFixed(0), targetY: targetY.toFixed(0) });
      console.log('📏 Mesafe:', distance.toFixed(0), 'px', isLooking ? '✅ Bakıyor' : '❌ Bakmıyor');
      
      setIsLookingAtTarget(isLooking);
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [eyeGameActive, currentTarget]);

  // Eye tracking game - track look duration
  useEffect(() => {
    if (!eyeGameActive || !isLookingAtTarget) return;

    const interval = setInterval(() => {
      setLookDuration(prev => {
        const newDuration = prev + 0.1;
        
        // Target completed!
        if (newDuration >= LOOK_DURATION_REQUIRED) {
          const reactionTime = (Date.now() - targetStartTime) / 1000;
          const accuracy = 100; // Simplified for now
          const stability = 100; // Simplified for now
          
          setGameMetrics(prev => [...prev, { reactionTime, accuracy, stability }]);
          setTargetsCompleted(prev => prev + 1);
          setCurrentTarget(null);
          
          return 0;
        }
        
        return newDuration;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [eyeGameActive, isLookingAtTarget, targetStartTime, LOOK_DURATION_REQUIRED]);

  // Warmup countdown timer
  useEffect(() => {
    if (!isModelLoading || warmupStep >= WARMUP_EXERCISES.length) return;

    const timer = setInterval(() => {
      setWarmupCountdown((prev) => {
        if (prev <= 1) {
          // Move to next exercise
          const nextStep = warmupStep + 1;
          if (nextStep < WARMUP_EXERCISES.length) {
            setWarmupStep(nextStep);
            return WARMUP_EXERCISES[nextStep].duration;
          } else {
            // Warmup complete, move to face detection
            setIsModelLoading(false);
            setStep("face-detection");
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModelLoading, warmupStep, WARMUP_EXERCISES]);

  // Initialize camera and eye tracker
  useEffect(() => {
    const setup = async () => {
      try {
        toast.loading("🔄 Kamera ve AI modeli yüklen iyor...", { id: "setup" });
        
        // Initialize webcam
        const stream = await initWebcam();
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Initialize eye tracker
        const tracker = await getEyeTracker();
        trackerRef.current = tracker;
        tracker.resetCalibration();

        toast.success("✅ Hazır! Göz takibi aktif.", { id: "setup" });
      } catch (error: any) {
        toast.error(error.message || "Başlatma hatası");
      }
    };

    setup();

    return () => {
      if (streamRef.current) {
        stopWebcam(streamRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Eye tracking loop
  useEffect(() => {
    if (!videoRef.current || !trackerRef.current) return;

    const trackEyes = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);

        if (faces.length > 0) {
          setFaceDetected(true);
          const face = faces[0];
          const eyes = trackerRef.current.extractEyeData(face);

          if (eyes) {
            setEyesDetected(true);
            setEyeData(eyes);
            
            // Calculate video scaling
            if (videoRef.current) {
              const video = videoRef.current;
              const videoWidth = video.videoWidth;
              const videoHeight = video.videoHeight;
              const displayWidth = video.clientWidth;
              const displayHeight = video.clientHeight;
              
              // object-cover scaling
              const videoAspect = videoWidth / videoHeight;
              const displayAspect = displayWidth / displayHeight;
              
              let scaleX, scaleY, offsetX = 0, offsetY = 0;
              
              if (videoAspect > displayAspect) {
                // Video is wider - height matches, width is cropped
                scaleY = displayHeight / videoHeight;
                scaleX = scaleY;
                const scaledWidth = videoWidth * scaleX;
                offsetX = (displayWidth - scaledWidth) / 2;
              } else {
                // Video is taller - width matches, height is cropped
                scaleX = displayWidth / videoWidth;
                scaleY = scaleX;
                const scaledHeight = videoHeight * scaleY;
                offsetY = (displayHeight - scaledHeight) / 2;
              }
              
              setVideoScale({ scaleX, scaleY, offsetX, offsetY });
              
              // Scale eye coordinates
              const scaledEyes: EyeData = {
                left: {
                  center: {
                    x: displayWidth - (eyes.left.center.x * scaleX + offsetX), // Mirror X
                    y: eyes.left.center.y * scaleY + offsetY
                  },
                  pupil: {
                    x: displayWidth - (eyes.left.pupil.x * scaleX + offsetX),
                    y: eyes.left.pupil.y * scaleY + offsetY
                  },
                  iris: {
                    x: displayWidth - (eyes.left.iris.x * scaleX + offsetX),
                    y: eyes.left.iris.y * scaleY + offsetY
                  }
                },
                right: {
                  center: {
                    x: displayWidth - (eyes.right.center.x * scaleX + offsetX),
                    y: eyes.right.center.y * scaleY + offsetY
                  },
                  pupil: {
                    x: displayWidth - (eyes.right.pupil.x * scaleX + offsetX),
                    y: eyes.right.pupil.y * scaleY + offsetY
                  },
                  iris: {
                    x: displayWidth - (eyes.right.iris.x * scaleX + offsetX),
                    y: eyes.right.iris.y * scaleY + offsetY
                  }
                },
                gaze: eyes.gaze
              };
              
              setLastEyeData(scaledEyes);
              lastEyeDataRef.current = scaledEyes;
            }

            // Detect if eyes are open or closed based on eye aspect ratio
            // Calculate eye aspect ratio (EAR) for better detection
            if (face.keypoints) {
              const leftEyeAR = calculateEyeAspectRatio(face.keypoints, 'left');
              const rightEyeAR = calculateEyeAspectRatio(face.keypoints, 'right');
              
              // Threshold: EAR < 0.2 means closed, >= 0.2 means open
              setLeftEyeOpen(leftEyeAR >= 0.18);
              setRightEyeOpen(rightEyeAR >= 0.18);
            } else {
              setLeftEyeOpen(true);
              setRightEyeOpen(true);
            }
          } else {
            setEyesDetected(false);
            // Eyes might be closed
            setLeftEyeOpen(false);
            setRightEyeOpen(false);
          }
        } else {
          setFaceDetected(false);
          setEyesDetected(false);
        }
      } catch (error) {
        console.error("Eye tracking error:", error);
      }

      animationFrameRef.current = requestAnimationFrame(trackEyes);
    };

    trackEyes();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [step]);

  // Countdown for calibration points
  useEffect(() => {
    if (step !== "calibration") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next point or complete
          setCurrentPointIndex((currentIdx) => {
            if (currentIdx < CALIBRATION_POINTS.length - 1) {
              setCalibrationProgress(((currentIdx + 1) / CALIBRATION_POINTS.length) * 100);
              return currentIdx + 1;
            } else {
              // Calibration complete
              setStep("complete");
              toast.success("Kalibrasyon tamamlandı!");
              return currentIdx;
            }
          });
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Capture calibration data when countdown hits 1
  useEffect(() => {
    if (step === "calibration" && countdown === 1 && eyeData && trackerRef.current) {
      const point = CALIBRATION_POINTS[currentPointIndex];
      trackerRef.current.addCalibrationPoint(point.x, point.y, eyeData);
      console.log(`Kalibrasyon noktası ${currentPointIndex + 1} kaydedildi:`, point.label);
    }
  }, [step, countdown, currentPointIndex, eyeData]);

  const startFaceDetection = () => {
    if (!faceDetected) {
      toast.error("Lütfen yüzünüzü kameraya gösterin");
      return;
    }
    setStep("eye-detection");
  };

  const startEyeDetection = () => {
    if (!eyesDetected) {
      toast.error("Gözleriniz algılanamadı");
      return;
    }
    setStep("calibration");
    setCurrentPointIndex(0);
    setCountdown(3);
  };

  const finishCalibration = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Göz Takibi Kalibrasyonu</CardTitle>
              <CardDescription>
                Hassas göz takibi için kalibrasyon yapın
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={
            step === "setup" ? 0 :
            step === "face-detection" ? 25 :
            step === "eye-detection" ? 50 :
            step === "calibration" ? 50 + (calibrationProgress / 2) :
            100
          } />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Camera Feed */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Face detection overlay */}
            {step === "face-detection" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-dashed border-primary w-80 h-96 rounded-2xl flex items-center justify-center">
                  {faceDetected ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-2" />
                      <p className="text-white text-lg font-semibold">Yüz Algılandı!</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Eye className="h-20 w-20 text-primary animate-pulse mx-auto mb-2" />
                      <p className="text-white text-lg font-semibold">Yüzünüzü Çerçeveye Yerleştirin</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Eye detection overlay */}
            {step === "eye-detection" && lastEyeData && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Animated eye overlays */}
                <AnimatedEyeOverlay
                  x={lastEyeData.left.center.x}
                  y={lastEyeData.left.center.y}
                  isOpen={leftEyeOpen}
                  side="left"
                />
                <AnimatedEyeOverlay
                  x={lastEyeData.right.center.x}
                  y={lastEyeData.right.center.y}
                  isOpen={rightEyeOpen}
                  side="right"
                />
                
                {/* Status message */}
                {eyesDetected ? (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Gözler Algılandı! ✓
                  </div>
                ) : (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold animate-pulse">
                    Gözlerinizi Açıp Kapatın
                  </div>
                )}
              </div>
            )}

            {/* Calibration points */}
            {step === "calibration" && (
              <div className="absolute inset-0 pointer-events-none">
                {CALIBRATION_POINTS.map((point, index) => (
                  <div
                    key={index}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
                      index === currentPointIndex ? "z-10 opacity-100" : index < currentPointIndex ? "opacity-50" : "opacity-30"
                    }`}
                    style={{
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                    }}
                  >
                    {index === currentPointIndex ? (
                      <div className="relative">
                        <div className="absolute inset-0 w-20 h-20 -left-2 -top-2 bg-primary rounded-full animate-ping opacity-75" />
                        <div className="relative w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-white">
                          {countdown}
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {point.label}
                        </div>
                      </div>
                    ) : index < currentPointIndex ? (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            {step === "setup" && (
              <div className="space-y-4">
                {!isModelLoading ? (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold">Kalibrasyon Adımları:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Yüzünüzü kameraya gösterin ve çerçeveye yerleştirin</li>
                          <li>Gözlerinizi açıp kapatarak göz algılamayı doğrulayın</li>
                          <li>Ekranda beliren 9 noktaya sırayla bakın</li>
                          <li>Her nokta için 3 saniye bekleyin</li>
                        </ol>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setIsModelLoading(true);
                        setWarmupStep(0);
                        setWarmupCountdown(WARMUP_EXERCISES[0].duration);
                      }}
                    >
                      Kalibrasyona Başla
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Warmup Exercise Display */}
                    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-primary/10 to-accent/20 rounded-lg border-2 border-primary/30">
                      <div className="text-6xl animate-pulse">
                        {WARMUP_EXERCISES[warmupStep]?.icon}
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-bold text-primary">
                          {WARMUP_EXERCISES[warmupStep]?.text}
                        </p>
                        <div className="text-5xl font-bold text-primary/80 tabular-nums">
                          {warmupCountdown}
                        </div>
                      </div>
                      <div className="w-full">
                        <Progress 
                          value={(warmupStep / WARMUP_EXERCISES.length) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Egzersiz {warmupStep + 1} / {WARMUP_EXERCISES.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        AI modeli arka planda yüklen iyor... Egzersizlere devam edin!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === "face-detection" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Camera className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">Adım 1: Yüz Tespiti</p>
                    <p className="text-sm text-muted-foreground">
                      Yüzünüzü çerçeveye yerleştirin
                    </p>
                  </div>
                  {faceDetected && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                </div>
                <Button
                  className="w-full"
                  onClick={startFaceDetection}
                  disabled={!faceDetected}
                >
                  {faceDetected ? "Devam Et" : "Yüz Bekleniyor..."}
                </Button>
              </div>
            )}

            {step === "eye-detection" && (
              <div className="space-y-4">
                {!eyeGameActive ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                      <Eye className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">Adım 2: Göz Tespiti</p>
                        <p className="text-sm text-muted-foreground">
                          Eğlenceli bir mini oyun ile göz algılamasını tamamlayın!
                        </p>
                      </div>
                      {eyesDetected && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        console.log('🎮 Oyun başlatılıyor...');
                        setEyeGameActive(true);
                        setTargetsCompleted(0);
                        setGameMetrics([]);
                        setCurrentTarget(null);
                        
                        setTimeout(() => {
                          const firstTarget = {
                            x: Math.random() * 70 + 15,
                            y: Math.random() * 60 + 15,
                          };
                          console.log('🎯 İlk hedef:', firstTarget);
                          setCurrentTarget(firstTarget);
                          setTargetStartTime(Date.now());
                          setLookDuration(0);
                          setIsLookingAtTarget(false);
                        }, 500);
                      }}
                      disabled={!eyesDetected}
                    >
                      {eyesDetected ? "🎮 Oyuna Başla" : "Gözler Bekleniyor..."}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Eye Tracking Game UI */}
                    <div className="relative h-64 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 rounded-lg border-2 border-primary/30 overflow-hidden">
                      {/* Target */}
                      {currentTarget && (
                        <div
                          className="absolute"
                          style={{
                            left: `${currentTarget.x}%`,
                            top: `${currentTarget.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          {/* Outer ring - progress indicator */}
                          <div className="relative w-16 h-16">
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="4"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke={isLookingAtTarget ? "#10b981" : "#3b82f6"}
                                strokeWidth="4"
                                strokeDasharray={`${(lookDuration / LOOK_DURATION_REQUIRED) * 175.93} 175.93`}
                                className="transition-all duration-100"
                              />
                            </svg>
                            {/* Inner target */}
                            <div className={`absolute inset-0 m-3 rounded-full transition-all duration-200 ${
                              isLookingAtTarget ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                            } flex items-center justify-center`}>
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Game instructions */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                        🎯 Hedefe göz bebeklerin izle takip et!
                      </div>
                      
                      {/* Targets completed */}
                      <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                        🎯 {targetsCompleted}/{TOTAL_TARGETS}
                      </div>
                      
                      {/* Average reaction time */}
                      {gameMetrics.length > 0 && (
                        <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                          ⏱️ {(gameMetrics.reduce((sum, m) => sum + m.reactionTime, 0) / gameMetrics.length).toFixed(1)}s
                        </div>
                      )}
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hedef Tamamlama</span>
                        <span className="font-bold text-primary">{targetsCompleted}/{TOTAL_TARGETS}</span>
                      </div>
                      <Progress value={(targetsCompleted / TOTAL_TARGETS) * 100} className="h-3" />
                    </div>
                    
                    {/* Continue button */}
                    {targetsCompleted >= TOTAL_TARGETS && (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setEyeGameActive(false);
                          startEyeDetection();
                        }}
                      >
                        ✅ Kalibrasyona Geç (Ortalama: {(gameMetrics.reduce((sum, m) => sum + m.reactionTime, 0) / gameMetrics.length).toFixed(1)}s)
                      </Button>
                    )}
                    
                    {targetsCompleted < TOTAL_TARGETS && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Target className="h-4 w-4 text-blue-500 animate-pulse" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {isLookingAtTarget ? "👀 Hedefe bakıyorsunuz! Sabit kalın..." : "🔍 Hedefe göz bebeklerin izle bakın..."}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === "calibration" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">Adım 3: Kalibrasyon</p>
                    <p className="text-sm text-muted-foreground">
                      {CALIBRATION_POINTS[currentPointIndex].label} noktasına bakın
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {currentPointIndex + 1} / {CALIBRATION_POINTS.length}
                  </span>
                </div>
                <Progress value={calibrationProgress} />
              </div>
            )}

            {step === "complete" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Kalibrasyon Tamamlandı!</p>
                    <p className="text-sm text-green-700">
                      Göz takibi artık kullanıma hazır
                    </p>
                  </div>
                </div>
                <Button className="w-full" onClick={finishCalibration}>
                  Oyuna Başla
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

