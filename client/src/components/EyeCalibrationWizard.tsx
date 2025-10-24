import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Camera, Target, CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { getEyeTracker, type EyeData } from "@/lib/advancedEyeTracking";
import { initWebcam, stopWebcam } from "@/lib/eyeTracking";

interface CalibrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type CalibrationStep = "setup" | "face-detection" | "eye-detection" | "calibration" | "complete";

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
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [eyeData, setEyeData] = useState<EyeData | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Initialize camera and eye tracker
  useEffect(() => {
    const setup = async () => {
      try {
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

        toast.success("Kamera ve göz takibi hazır!");
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
          } else {
            setEyesDetected(false);
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
          // Capture calibration point
          if (eyeData && trackerRef.current) {
            const point = CALIBRATION_POINTS[currentPointIndex];
            trackerRef.current.addCalibrationPoint(point.x, point.y, eyeData);

            if (currentPointIndex < CALIBRATION_POINTS.length - 1) {
              setCurrentPointIndex(currentPointIndex + 1);
              setCalibrationProgress(((currentPointIndex + 1) / CALIBRATION_POINTS.length) * 100);
              return 3;
            } else {
              // Calibration complete
              setStep("complete");
              toast.success("Kalibrasyon tamamlandı!");
            }
          }
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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
            {step === "eye-detection" && (
              <div className="absolute inset-0 pointer-events-none">
                {eyeData ? (
                  <>
                    {/* Draw eye positions */}
                    <div
                      className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"
                      style={{
                        left: `${eyeData.left.iris.x}px`,
                        top: `${eyeData.left.iris.y}px`,
                        transform: "translate(-50%, -50%) scaleX(-1)",
                      }}
                    />
                    <div
                      className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"
                      style={{
                        left: `${eyeData.right.iris.x}px`,
                        top: `${eyeData.right.iris.y}px`,
                        transform: "translate(-50%, -50%) scaleX(-1)",
                      }}
                    />
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Gözler Algılandı! ✓
                    </div>
                  </>
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
                <Button className="w-full" onClick={() => setStep("face-detection")}>
                  Kalibrasyona Başla
                </Button>
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
                <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">Adım 2: Göz Tespiti</p>
                    <p className="text-sm text-muted-foreground">
                      Gözlerinizi açıp kapatın, sonra kameraya bakın
                    </p>
                  </div>
                  {eyesDetected && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                </div>
                <Button
                  className="w-full"
                  onClick={startEyeDetection}
                  disabled={!eyesDetected}
                >
                  {eyesDetected ? "Kalibrasyona Geç" : "Gözler Bekleniyor..."}
                </Button>
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

