import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Camera, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  initWebcam,
  stopWebcam,
  detectFaceSimple,
  calculateEyeGaze,
  isLookingAtTarget,
  type EyePosition,
} from "@/lib/eyeTracking";

interface TargetPosition {
  x: number; // -1 to 1
  y: number; // -1 to 1
  id: number;
}

const TEST_TARGETS: TargetPosition[] = [
  { x: 0, y: 0, id: 1 }, // Center
  { x: -0.6, y: -0.6, id: 2 }, // Top-left
  { x: 0.6, y: -0.6, id: 3 }, // Top-right
  { x: -0.6, y: 0.6, id: 4 }, // Bottom-left
  { x: 0.6, y: 0.6, id: 5 }, // Bottom-right
  { x: 0, y: -0.6, id: 6 }, // Top-center
  { x: 0, y: 0.6, id: 7 }, // Bottom-center
  { x: -0.6, y: 0, id: 8 }, // Left-center
  { x: 0.6, y: 0, id: 9 }, // Right-center
];

export default function EyeTrackingTest() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [testState, setTestState] = useState<"setup" | "calibration" | "testing" | "complete">("setup");
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [eyePosition, setEyePosition] = useState<EyePosition>({ x: 0, y: 0, isDetected: false });
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState<number[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [targetStartTime, setTargetStartTime] = useState<number>(0);
  const [cameraReady, setCameraReady] = useState(false);

  const saveTest = trpc.tests.save.useMutation({
    onSuccess: () => {
      toast.success("Test sonuçları kaydedildi!");
      setLocation("/dashboard");
    },
  });

  // Initialize camera
  useEffect(() => {
    let animationFrameId: number;

    const setupCamera = async () => {
      try {
        const stream = await initWebcam();
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          toast.success("Kamera hazır!");

          // Start eye tracking loop
          const trackEyes = () => {
            if (videoRef.current && canvasRef.current && testState !== "setup") {
              const face = detectFaceSimple(videoRef.current, canvasRef.current);
              if (face) {
                const gaze = calculateEyeGaze(videoRef.current, canvasRef.current, face);
                setEyePosition(gaze);

                // Check if looking at current target
                if (testState === "testing" && currentTargetIndex < TEST_TARGETS.length) {
                  const target = TEST_TARGETS[currentTargetIndex];
                  if (isLookingAtTarget(gaze, target.x, target.y, 0.25)) {
                    handleTargetHit();
                  }
                }
              }
            }
            animationFrameId = requestAnimationFrame(trackEyes);
          };

          trackEyes();
        }
      } catch (error: any) {
        toast.error(error.message || "Kamera başlatılamadı");
      }
    };

    setupCamera();

    return () => {
      if (streamRef.current) {
        stopWebcam(streamRef.current);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [testState, currentTargetIndex]);

  const startTest = () => {
    if (!cameraReady) {
      toast.error("Lütfen kameranın hazır olmasını bekleyin");
      return;
    }
    setTestState("testing");
    setCurrentTargetIndex(0);
    setScore(0);
    setAccuracy([]);
    setReactionTimes([]);
    setTargetStartTime(Date.now());
  };

  const handleTargetHit = () => {
    const reactionTime = Date.now() - targetStartTime;
    const accuracyScore = 100; // Simplified - in production, calculate based on precision

    setScore((prev) => prev + accuracyScore);
    setAccuracy((prev) => [...prev, accuracyScore]);
    setReactionTimes((prev) => [...prev, reactionTime]);

    if (currentTargetIndex < TEST_TARGETS.length - 1) {
      setCurrentTargetIndex((prev) => prev + 1);
      setTargetStartTime(Date.now());
      toast.success(`Hedef ${currentTargetIndex + 1} tamamlandı!`);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    setTestState("complete");
    const avgAccuracy = accuracy.reduce((a, b) => a + b, 0) / accuracy.length;
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;

    saveTest.mutate({
      testType: "convergence",
      binocularScore: `${Math.round(avgAccuracy)}/100`,
      rawData: JSON.stringify({
        accuracy,
        reactionTimes,
        avgReactionTime,
        totalScore: score,
      }),
      notes: `Ortalama tepki süresi: ${Math.round(avgReactionTime)}ms`,
    });
  };

  const convertToScreenCoords = (x: number, y: number) => {
    // Convert -1 to 1 range to screen percentage
    return {
      left: `${(x + 1) * 50}%`,
      top: `${(y + 1) * 50}%`,
    };
  };

  if (testState === "complete") {
    const avgAccuracy = accuracy.reduce((a, b) => a + b, 0) / accuracy.length;
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VisionCare</span>
          </div>
        </header>

        <main className="container py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Test Tamamlandı!
              </CardTitle>
              <CardDescription>Göz takibi ve konverjans test sonuçlarınız</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Toplam Puan</p>
                    <p className="text-sm text-muted-foreground">{score} / {TEST_TARGETS.length * 100}</p>
                  </div>
                  <span className="text-3xl font-bold text-primary">{Math.round((score / (TEST_TARGETS.length * 100)) * 100)}%</span>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Ortalama Doğruluk</p>
                    <p className="text-sm text-muted-foreground">Hedeflere odaklanma hassasiyeti</p>
                  </div>
                  <span className="font-semibold text-primary">{Math.round(avgAccuracy)}%</span>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Ortalama Tepki Süresi</p>
                    <p className="text-sm text-muted-foreground">Göz hareketlerinin hızı</p>
                  </div>
                  <span className="font-semibold text-primary">{Math.round(avgReactionTime)}ms</span>
                </div>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Değerlendirme:</h4>
                <p className="text-sm text-muted-foreground">
                  {avgAccuracy >= 80 && avgReactionTime < 1000 && "Mükemmel! Göz hareketleriniz hızlı ve hassas."}
                  {avgAccuracy >= 60 && avgAccuracy < 80 && "İyi! Göz koordinasyonunuz normal seviyede."}
                  {avgAccuracy < 60 && "Göz hareketlerinde zorluk yaşıyorsunuz. Düzenli egzersizler yapmanızı öneriyoruz."}
                </p>
              </div>

              <Link href="/tests">
                <Button className="w-full">Testlere Dön</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VisionCare</span>
          </div>
          <Link href="/tests">
            <Button variant="outline">Testi İptal Et</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        {testState === "setup" && (
          <Card>
            <CardHeader>
              <CardTitle>Göz Takibi Testi - Hazırlık</CardTitle>
              <CardDescription>Kamera tabanlı göz hareketi ve konverjans testi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                      <p>Kamera başlatılıyor...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Talimatlar:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Ekrandan yaklaşık 50-60 cm uzakta oturun</li>
                      <li>Başınızı sabit tutun, sadece gözlerinizi hareket ettirin</li>
                      <li>Ekranda beliren hedeflere göz bebeklerinizle bakın</li>
                      <li>Her hedefe 1-2 saniye odaklanın</li>
                      <li>İyi aydınlatma altında test yapın</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={startTest}
                  disabled={!cameraReady}
                >
                  <Target className="h-4 w-4" />
                  {cameraReady ? "Teste Başla" : "Kamera Bekleniyor..."}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {testState === "testing" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Göz Takibi Testi</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Hedef {currentTargetIndex + 1} / {TEST_TARGETS.length}
                  </div>
                </div>
                <Progress value={(currentTargetIndex / TEST_TARGETS.length) * 100} />
              </CardHeader>
            </Card>

            <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 overflow-hidden">
              {/* Video feed (small preview) */}
              <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-primary z-10">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Eye position indicator */}
              {eyePosition.isDetected && (
                <div
                  className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                  style={{
                    left: `${(eyePosition.x + 1) * 50}%`,
                    top: `${(eyePosition.y + 1) * 50}%`,
                  }}
                />
              )}

              {/* Current target */}
              {currentTargetIndex < TEST_TARGETS.length && (
                <div
                  className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2"
                  style={convertToScreenCoords(
                    TEST_TARGETS[currentTargetIndex].x,
                    TEST_TARGETS[currentTargetIndex].y
                  )}
                >
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-0 bg-primary rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-6 py-3 rounded-lg">
                <p className="text-sm text-center">
                  Başınızı sabit tutun, sadece gözlerinizle hedefe bakın
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{score}</p>
                    <p className="text-sm text-muted-foreground">Puan</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{accuracy.length}</p>
                    <p className="text-sm text-muted-foreground">Tamamlanan</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {eyePosition.isDetected ? "✓" : "✗"}
                    </p>
                    <p className="text-sm text-muted-foreground">Göz Algılandı</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

