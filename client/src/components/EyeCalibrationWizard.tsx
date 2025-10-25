import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Camera, CheckCircle2, AlertCircle, X, Volume2, VolumeX, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { getEyeTracker, type EyeData } from "@/lib/advancedEyeTracking";
import { speak, playTickSound, playSuccessSound, setAudioEnabled, isAudioEnabled } from "@/lib/audioHelper";
import { useRef, useState, useEffect } from "react";

interface CalibrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type CalibrationStep = "setup" | "face-detection" | "eye-detection" | "warmup" | "calibration-points" | "validation" | "complete";

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

export default function EyeCalibrationWizard({ onComplete, onCancel }: CalibrationWizardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastEyeDataRef = useRef<EyeData | null>(null);
  const calibrationIntervalRef = useRef<number | null>(null);

  const [step, setStep] = useState<CalibrationStep>("setup");
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyesDetected, setEyesDetected] = useState(false);
  const [warmupStep, setWarmupStep] = useState(0);
  const [warmupCountdown, setWarmupCountdown] = useState(5);
  const [isModelLoading, setIsModelLoading] = useState(false);
  
  // Calibration states
  const [audioEnabled, setAudioEnabledState] = useState(true);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [currentCalibrationPoint, setCurrentCalibrationPoint] = useState(0);
  const [pointCountdown, setPointCountdown] = useState(3);
  const [calibrationData, setCalibrationData] = useState<Array<{
    point: { x: number; y: number };
    gazeData: Array<{ x: number; y: number; pupilSize: number; timestamp: number }>;
    blinkCount: number;
  }>>([]);
  const [calibrationSuccess, setCalibrationSuccess] = useState<boolean | null>(null);
  const [validationScore, setValidationScore] = useState(0);
  
  // Calibration points (9-point grid)
  const CALIBRATION_POINTS = [
    { x: 10, y: 10 },   // Top-left
    { x: 50, y: 10 },   // Top-center
    { x: 90, y: 10 },   // Top-right
    { x: 10, y: 50 },   // Middle-left
    { x: 50, y: 50 },   // Center
    { x: 90, y: 50 },   // Middle-right
    { x: 10, y: 90 },   // Bottom-left
    { x: 50, y: 90 },   // Bottom-center
    { x: 90, y: 90 },   // Bottom-right
  ];
  
  const POINT_DURATION = 3; // 3 seconds per point

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

  // Warmup countdown
  useEffect(() => {
    if (!isModelLoading || warmupStep >= WARMUP_EXERCISES.length) return;

    const timer = setInterval(() => {
      setWarmupCountdown((prev) => {
        if (prev <= 1) {
          if (warmupStep < WARMUP_EXERCISES.length - 1) {
            setWarmupStep(prev => prev + 1);
            setWarmupCountdown(WARMUP_EXERCISES[warmupStep + 1].duration);
          } else {
            setIsModelLoading(false);
            setStep("calibration-points");
            toast.success("Kalibrasyon noktalarına geçiliyor...");
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

  // Blink detection during warmup
  useEffect(() => {
    if (!isModelLoading || !videoRef.current || !trackerRef.current) return;

    let detectionFrameId: number;
    let previousEAR = 1.0;
    const EAR_THRESHOLD = 0.2;

    const detectBlinks = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        if (faces.length > 0 && faces[0].keypoints) {
          const leftEAR = calculateEyeAspectRatio(faces[0].keypoints, 'left');
          const rightEAR = calculateEyeAspectRatio(faces[0].keypoints, 'right');
          const avgEAR = (leftEAR + rightEAR) / 2;

          if (previousEAR > EAR_THRESHOLD && avgEAR < EAR_THRESHOLD) {
            setBlinkDetected(true);
            setBlinkCount(prev => prev + 1);
            playTickSound();
            setTimeout(() => setBlinkDetected(false), 300);
          }

          previousEAR = avgEAR;
        }
      } catch (error) {
        console.error("Blink detection error:", error);
      }

      detectionFrameId = requestAnimationFrame(detectBlinks);
    };

    detectBlinks();

    return () => cancelAnimationFrame(detectionFrameId);
  }, [isModelLoading]);

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
    let eyesDetectedCount = 0;

    const detectEyes = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        if (faces.length > 0) {
          const eyes = trackerRef.current.extractEyeData(faces[0]);
          lastEyeDataRef.current = eyes;
          if (eyes) {
            eyesDetectedCount++;
            setEyesDetected(true);
            
            // Auto-start warmup after 1 second of stable eye detection
            if (eyesDetectedCount > 30 && !isModelLoading) {
              setTimeout(() => {
                handleStartWarmup();
              }, 500);
              return;
            }
          } else {
            eyesDetectedCount = 0;
            setEyesDetected(false);
          }
        }
      } catch (error) {
        console.error("Eye detection error:", error);
      }

      detectionFrameId = requestAnimationFrame(detectEyes);
    };

    detectEyes();

    return () => cancelAnimationFrame(detectionFrameId);
  }, [step, isModelLoading]);

  // Calibration point countdown and data collection
  useEffect(() => {
    if (step !== "calibration-points") return;

    const timer = setInterval(() => {
      setPointCountdown((prev) => {
        if (prev <= 1) {
          // Move to next point
          if (currentCalibrationPoint < CALIBRATION_POINTS.length - 1) {
            setCurrentCalibrationPoint(prev => prev + 1);
            setPointCountdown(POINT_DURATION);
            playTickSound();
          } else {
            // All points completed
            setStep("validation");
            validateCalibration();
          }
          return POINT_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, currentCalibrationPoint]);

  // Collect gaze data during calibration
  useEffect(() => {
    if (step !== "calibration-points" || !videoRef.current || !trackerRef.current) return;

    let collectionFrameId: number;
    const currentPointData: Array<{ x: number; y: number; pupilSize: number; timestamp: number }> = [];

    const collectGazeData = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        if (faces.length > 0) {
          const eyes = trackerRef.current.extractEyeData(faces[0]);
          if (eyes) {
            currentPointData.push({
              x: eyes.gaze.x,
              y: eyes.gaze.y,
              pupilSize: eyes.pupilSize || 0,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        console.error("Gaze data collection error:", error);
      }

      collectionFrameId = requestAnimationFrame(collectGazeData);
    };

    collectGazeData();

    return () => {
      cancelAnimationFrame(collectionFrameId);
      // Save collected data for current point
      if (currentPointData.length > 0) {
        setCalibrationData(prev => [...prev, {
          point: CALIBRATION_POINTS[currentCalibrationPoint],
          gazeData: currentPointData,
          blinkCount: blinkCount,
        }]);
      }
    };
  }, [step, currentCalibrationPoint]);

  const handleStartCalibration = async () => {
    if (!videoRef.current || !trackerRef.current) {
      toast.error("Kamera hazır değil");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStep("face-detection");
          toast.success("Kamera açıldı");
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Kamera erişimi reddedildi");
    }
  };

  const handleStartWarmup = () => {
    setIsModelLoading(true);
    setWarmupStep(0);
    setWarmupCountdown(WARMUP_EXERCISES[0].duration);
    if (audioEnabled) {
      speak(WARMUP_EXERCISES[0].text);
    }
  };

  const validateCalibration = () => {
    // Simple validation: check if we have enough data points
    const validPoints = calibrationData.filter(d => d.gazeData.length > 10);
    const score = Math.round((validPoints.length / CALIBRATION_POINTS.length) * 100);
    
    setValidationScore(score);
    setCalibrationSuccess(score >= 70); // 70% threshold
    
    if (score >= 70) {
      playSuccessSound();
      toast.success("Kalibrasyon başarılı!");
      if (audioEnabled) {
        speak("Kalibrasyon başarıyla tamamlandı");
      }
    } else {
      toast.error("Kalibrasyon başarısız. Lütfen tekrar deneyin.");
      if (audioEnabled) {
        speak("Kalibrasyon başarısız. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleRestartCalibration = () => {
    setStep("setup");
    setCurrentCalibrationPoint(0);
    setPointCountdown(POINT_DURATION);
    setCalibrationData([]);
    setCalibrationSuccess(null);
    setValidationScore(0);
    setBlinkCount(0);
    setWarmupStep(0);
    setIsModelLoading(false);
    toast.info("Kalibrasyon yeniden başlatılıyor...");
  };

  const handleCompleteCalibration = () => {
    // Clean up
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onComplete();
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabledState(newState);
    setAudioEnabled(newState);
  };

  const getProgress = () => {
    if (step === "setup") return 10;
    if (step === "face-detection") return 25;
    if (step === "eye-detection") return 40;
    if (step === "warmup") return 55;
    if (step === "calibration-points") {
      return 55 + (currentCalibrationPoint / CALIBRATION_POINTS.length) * 30;
    }
    if (step === "validation") return 90;
    return 100;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              <CardTitle>Göz Kalibrasyonu</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleAudio}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            AI'nin gözlerinizi tanıması ve öğrenmesi için kalibrasyon yapılıyor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={getProgress()} />
          
          {/* Hidden video element for camera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={step === "setup" ? "hidden" : "w-full rounded-lg bg-black/10"}
          />

          {/* Setup Step */}
          {step === "setup" && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Camera className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Kamera Erişimi</p>
                    <p className="text-sm text-muted-foreground">
                      Göz takibi için kameranıza erişim gerekiyor
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Kalibrasyon Adımları:</p>
                  <ul className="space-y-1 ml-4 list-disc text-muted-foreground">
                    <li>Yüz ve göz algılama</li>
                    <li>Isınma egzersizleri (göz kırpma)</li>
                    <li>9 noktaya bakarak kalibrasyon</li>
                    <li>Doğrulama ve sonuç</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleStartCalibration} 
                  disabled={!cameraReady}
                  className="w-full gap-2"
                >
                  {!cameraReady ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Hazırlanıyor...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Kamerayı Aç
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Face Detection Step */}
          {step === "face-detection" && (
            <>
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

          {/* Eye Detection Step */}
          {step === "eye-detection" && (
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
                    {eyesDetected ? "Isınma egzersizlerine geçiliyor..." : "Lütfen gözlerinizi açık tutun"}
                  </p>
                </div>
              </div>
              {eyesDetected && !isModelLoading && (
                <Button onClick={handleStartWarmup} className="w-full">
                  Isınma Egzersizlerine Başla
                </Button>
              )}
              {isModelLoading && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{WARMUP_EXERCISES[warmupStep].icon}</div>
                    <p className="font-medium">{WARMUP_EXERCISES[warmupStep].text}</p>
                    <p className="text-2xl font-bold text-primary mt-2">{warmupCountdown}</p>
                    
                    {/* Blink indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full transition-all ${
                        blinkDetected ? 'bg-green-500 scale-125' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        Göz kırpma: {blinkCount}
                      </span>
                    </div>
                  </div>
                  <Progress value={((warmupStep + 1) / WARMUP_EXERCISES.length) * 100} />
                </div>
              )}
            </>
          )}

          {/* Calibration Points Step */}
          {step === "calibration-points" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-semibold text-lg mb-2">
                  Nokta {currentCalibrationPoint + 1} / {CALIBRATION_POINTS.length}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ekrandaki noktaya bakın ve gözlerinizi sabit tutun
                </p>
                <p className="text-3xl font-bold text-primary">{pointCountdown}</p>
              </div>

              {/* Calibration point display */}
              <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div
                  className="absolute w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"
                  style={{
                    left: `${CALIBRATION_POINTS[currentCalibrationPoint].x}%`,
                    top: `${CALIBRATION_POINTS[currentCalibrationPoint].y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                </div>
              </div>

              <Progress value={(currentCalibrationPoint / CALIBRATION_POINTS.length) * 100} />
            </div>
          )}

          {/* Validation Step */}
          {step === "validation" && (
            <div className="space-y-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="font-semibold">Kalibrasyon Doğrulanıyor...</p>
              <p className="text-sm text-muted-foreground">
                Toplanan veriler analiz ediliyor
              </p>
              {calibrationSuccess !== null && (
                <div className={`p-4 rounded-lg ${
                  calibrationSuccess 
                    ? 'bg-green-50 dark:bg-green-950 border border-green-200' 
                    : 'bg-red-50 dark:bg-red-950 border border-red-200'
                }`}>
                  <p className={`font-semibold ${
                    calibrationSuccess ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                  }`}>
                    {calibrationSuccess ? '✓ Kalibrasyon Başarılı!' : '✗ Kalibrasyon Başarısız'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    calibrationSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    Başarı Skoru: {validationScore}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!calibrationSuccess && calibrationSuccess !== null && (
                  <Button onClick={handleRestartCalibration} variant="outline" className="flex-1 gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Tekrar Dene
                  </Button>
                )}
                {calibrationSuccess && (
                  <Button onClick={handleCompleteCalibration} className="flex-1">
                    Tamamla
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

