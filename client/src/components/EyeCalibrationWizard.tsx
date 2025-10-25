import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Camera, CheckCircle2, AlertCircle, X, Volume2, VolumeX, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { getEyeTracker, disposeEyeTracker, type EyeData } from "@/lib/advancedEyeTracking";
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
  
  // Eye health analysis states
  const [glassesDetected, setGlassesDetected] = useState<boolean | null>(null);
  const [eyeHealthData, setEyeHealthData] = useState<{
    redness: number;
    fatigue: number;
    alignment: number;
    lightSensitivity: number;
    focusQuality: number;
  }>({ redness: 0, fatigue: 0, alignment: 50, lightSensitivity: 50, focusQuality: 50 });
  const [healthWarnings, setHealthWarnings] = useState<string[]>([]);
  
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
    setCameraReady(true);
    
    const setup = async () => {
      try {
        const tracker = await getEyeTracker();
        trackerRef.current = tracker;
      } catch (error: any) {
        console.error("Eye tracker init error:", error);
      }
    };

    setup();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Clear calibration interval
      if (calibrationIntervalRef.current) {
        clearInterval(calibrationIntervalRef.current);
      }
      
      // Dispose singleton tracker instance
      disposeEyeTracker();
      trackerRef.current = null;
    };
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

  // Blink detection during warmup and calibration
  useEffect(() => {
    if ((step !== "warmup" && step !== "calibration-points") || !videoRef.current || !trackerRef.current) return;

    let detectionFrameId: number;
    let previousEAR = 1.0;
    let isActive = true;
    const EAR_THRESHOLD = 0.2;

    const detectBlinks = async () => {
      if (!isActive || !videoRef.current || !trackerRef.current) return;
      
      // Check if video is ready
      if (videoRef.current.readyState < 2) {
        detectionFrameId = requestAnimationFrame(detectBlinks);
        return;
      }

      try {
        const eyes = await trackerRef.current.extractEyeData(videoRef.current);
        if (eyes) {
          // Calculate average EAR from both eyes
          const avgEAR = (eyes.left.ear + eyes.right.ear) / 2;
          
          console.log(`👁️ EAR: ${avgEAR.toFixed(3)} | Threshold: ${EAR_THRESHOLD} | Previous: ${previousEAR.toFixed(3)}`);

          // Detect blink: EAR drops below threshold
          if (previousEAR > EAR_THRESHOLD && avgEAR < EAR_THRESHOLD) {
            console.log(`✅ BLINK DETECTED! Count: ${blinkCount + 1}`);
            setBlinkDetected(true);
            setBlinkCount(prev => prev + 1);
            playTickSound();
            setTimeout(() => setBlinkDetected(false), 300);
          }

          previousEAR = avgEAR;
        } else {
          console.warn('⚠️ extractEyeData returned null');
        }
      } catch (error) {
        console.error("Blink detection error:", error);
      }

      detectionFrameId = requestAnimationFrame(detectBlinks);
    };

    detectBlinks();

    return () => {
      isActive = false;
      if (detectionFrameId) cancelAnimationFrame(detectionFrameId);
    };
  }, [step]);

  // Face detection
  useEffect(() => {
    if (step !== "face-detection" || !videoRef.current || !trackerRef.current) return;

    let detectionFrameId: number;
    let isActive = true;

    const detectFace = async () => {
      if (!isActive || !videoRef.current || !trackerRef.current) return;
      
      // Check if video is ready
      if (videoRef.current.readyState < 2) {
        detectionFrameId = requestAnimationFrame(detectFace);
        return;
      }

      try {
        const isFaceDetected = await trackerRef.current.detectFace(videoRef.current);
        setFaceDetected(isFaceDetected);

        if (isFaceDetected) {
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

    return () => {
      isActive = false;
      if (detectionFrameId) cancelAnimationFrame(detectionFrameId);
    };
  }, [step]);

  // Eye detection
  useEffect(() => {
    if (step !== "eye-detection" || !videoRef.current || !trackerRef.current) return;

    let detectionFrameId: number;
    let eyesDetectedCount = 0;
    let isActive = true;

    const detectEyes = async () => {
      if (!isActive || !videoRef.current || !trackerRef.current) return;
      
      // Check if video is ready
      if (videoRef.current.readyState < 2) {
        detectionFrameId = requestAnimationFrame(detectEyes);
        return;
      }

      try {
        const eyes = await trackerRef.current.extractEyeData(videoRef.current);
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
      } catch (error) {
        console.error("Eye detection error:", error);
      }

      detectionFrameId = requestAnimationFrame(detectEyes);
    };

    detectEyes();

    return () => {
      isActive = false;
      if (detectionFrameId) cancelAnimationFrame(detectionFrameId);
    };
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

  // Validation step - automatically validate when entering validation step
  useEffect(() => {
    if (step === "validation" && calibrationSuccess === null) {
      // Wait a bit for UI to render, then validate
      const timer = setTimeout(() => {
        validateCalibration();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Gaze data collection during calibration
  useEffect(() => {  if (step !== "calibration-points" || !videoRef.current || !trackerRef.current) return;

    let collectionFrameId: number;
    let isActive = true;
    const currentPointData: Array<{ x: number; y: number; pupilSize: number; timestamp: number }> = [];

    const collectGazeData = async () => {
      if (!isActive || !videoRef.current || !trackerRef.current) return;
      
      // Check if video is ready
      if (videoRef.current.readyState < 2) {
        collectionFrameId = requestAnimationFrame(collectGazeData);
        return;
      }

      try {
        const isFaceDetected = await trackerRef.current.detectFace(videoRef.current);
        if (isFaceDetected) {
          const eyes = await trackerRef.current.extractEyeData(videoRef.current);
          if (eyes && eyes.gaze) {
            currentPointData.push({
              x: eyes.gaze.x || 0,
              y: eyes.gaze.y || 0,
              pupilSize: eyes.pupilSize || 0,
              timestamp: Date.now(),
            });
            
            console.log(`📊 Gaze data collected: Point ${currentCalibrationPoint}, Total: ${currentPointData.length}`);
            
            // Analyze eye health in real-time
            const faceData = eyes.faceLandmarks ? { keypoints: eyes.faceLandmarks } : null;
            analyzeEyeHealth(faceData, eyes);
          } else {
            console.warn('⚠️ Eyes not detected or gaze data missing');
          }
        } else {
          console.warn('⚠️ Face not detected');
        }
      } catch (error) {
        console.error("Gaze data collection error:", error);
      }

      collectionFrameId = requestAnimationFrame(collectGazeData);
    };

    collectGazeData();

    return () => {
      isActive = false;
      if (collectionFrameId) cancelAnimationFrame(collectionFrameId);
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

  // Analyze eye health from face and eye data
  const analyzeEyeHealth = (face: any, eyes: any) => {
    const warnings: string[] = [];
    
    // Detect glasses (simple heuristic based on face landmarks)
    const hasGlasses = detectGlasses(face);
    if (glassesDetected === null) {
      setGlassesDetected(hasGlasses);
    }
    
    // Calculate eye fatigue based on blink rate and pupil size
    const avgPupilSize = eyes.pupilSize || 0;
    const fatigue = blinkCount < 5 ? 70 : (blinkCount > 20 ? 30 : 50);
    
    // Eye alignment check (distance between eyes)
    const alignment = 50; // Placeholder - would need more complex calculation
    
    // Light sensitivity (based on pupil size changes)
    const lightSensitivity = avgPupilSize < 3 ? 70 : (avgPupilSize > 6 ? 30 : 50);
    
    // Focus quality (based on gaze stability)
    const focusQuality = 50; // Placeholder
    
    setEyeHealthData({
      redness: 0, // Would need color analysis
      fatigue,
      alignment,
      lightSensitivity,
      focusQuality,
    });
    
    // Generate warnings
    if (fatigue > 60) {
      warnings.push("⚠️ Gözleriniz yorgun görünüyor. Mola vermeniz önerilir.");
    }
    if (lightSensitivity > 60) {
      warnings.push("💡 Işık hassasiyeti yüksek. Ekran parlaklığını azaltın.");
    }
    if (blinkCount < 3 && currentCalibrationPoint > 3) {
      warnings.push("👁️ Göz kırpma oranı düşük. Daha sık göz kırpın.");
    }
    
    if (warnings.length > 0) {
      setHealthWarnings(warnings);
    }
  };
  
  // Detect glasses using face landmarks and eye analysis
  const detectGlasses = (face: any): boolean => {
    if (!face || !face.keypoints) return false;
    
    try {
      // Get eye landmarks from face
      const leftEye = face.keypoints.getLeftEye();
      const rightEye = face.keypoints.getRightEye();
      
      if (!leftEye || !rightEye || leftEye.length === 0 || rightEye.length === 0) {
        return false;
      }
      
      // Calculate eye aspect ratio for both eyes
      const leftEAR = calculateEyeAspectRatio(leftEye);
      const rightEAR = calculateEyeAspectRatio(rightEye);
      
      // Glasses detection heuristics:
      // 1. EAR values are more consistent (less variation) with glasses
      // 2. Eye region appears larger due to lens magnification
      // 3. Bridge of nose landmarks are affected by glasses frame
      
      const earDifference = Math.abs(leftEAR - rightEAR);
      
      // Calculate eye widths
      const leftEyeWidth = calculateDistance(leftEye[0], leftEye[3]);
      const rightEyeWidth = calculateDistance(rightEye[0], rightEye[3]);
      const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
      
      // Heuristic: If EAR difference is very small and eye width is larger than normal
      // it might indicate glasses (magnification effect)
      const hasGlasses = earDifference < 0.02 && avgEyeWidth > 20;
      
      return hasGlasses;
    } catch (error) {
      console.error('Glasses detection error:', error);
      return false;
    }
  };
  
  // Helper function to calculate Eye Aspect Ratio
  const calculateEyeAspectRatio = (eyePoints: Array<{ x: number; y: number }>): number => {
    if (eyePoints.length < 6) return 0.3;
    
    const vertical1 = calculateDistance(eyePoints[1], eyePoints[5]);
    const vertical2 = calculateDistance(eyePoints[2], eyePoints[4]);
    const horizontal = calculateDistance(eyePoints[0], eyePoints[3]);
    
    return (vertical1 + vertical2) / (2.0 * horizontal);
  };
  
  // Helper function to calculate distance between two points
  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const validateCalibration = () => {
    console.log(`🔍 Validating calibration...`);
    console.log(`📦 Total calibration data points: ${calibrationData.length}`);
    calibrationData.forEach((d, i) => {
      console.log(`  Point ${i}: ${d.gazeData.length} gaze samples`);
    });
    
    // Simple validation: check if we have enough data points
    const validPoints = calibrationData.filter(d => d.gazeData.length > 10);
    const score = Math.round((validPoints.length / CALIBRATION_POINTS.length) * 100);
    
    console.log(`✅ Valid points: ${validPoints.length}/${CALIBRATION_POINTS.length}`);
    console.log(`📊 Calibration score: ${score}%`);
    
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
              
              {/* Eye Health Warnings */}
              {healthWarnings.length > 0 && (
                <div className="space-y-2 mt-4">
                  {healthWarnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">{warning}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Glasses Detection Alert */}
              {glassesDetected !== null && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  glassesDetected 
                    ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200' 
                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200'
                }`}>
                  <div className="text-2xl">{glassesDetected ? '👓' : '👁️'}</div>
                  <p className="text-sm">
                    {glassesDetected 
                      ? 'Gözlük tespit edildi. Kalibrasyon gözlüklü olarak kaydedilecek.' 
                      : 'Gözlük tespit edilmedi. Kalibrasyon gözlüksüz olarak kaydedilecek.'}
                  </p>
                </div>
              )}
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
                  
                  {/* Eye Health Summary */}
                  {calibrationSuccess && (
                    <div className="mt-4 space-y-2 text-left">
                      <p className="font-semibold text-green-900 dark:text-green-100">Göz Sağlığı Analizi:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Yorgunluk: {eyeHealthData.fatigue < 50 ? 'Düşük' : eyeHealthData.fatigue > 60 ? 'Yüksek' : 'Orta'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Işık Hassasiyeti: {eyeHealthData.lightSensitivity < 50 ? 'Düşük' : 'Normal'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span>Göz Kırpma: {blinkCount} kez</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span>Gözlük: {glassesDetected ? 'Var' : 'Yok'}</span>
                        </div>
                      </div>
                    </div>
                  )}
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
                {/* Debug: Show button state */}
                {calibrationSuccess === null && (
                  <p className="text-xs text-muted-foreground">Validation in progress...</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

