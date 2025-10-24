import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Camera, Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getEyeTracker, type EyeData } from "@/lib/advancedEyeTracking";
import EyeCalibrationWizard from "@/components/EyeCalibrationWizard";

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  color: string;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = GAME_WIDTH / BRICK_COLS - 5;
const BRICK_HEIGHT = 25;

export default function EyeBreakoutGame() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [cameraReady, setCameraReady] = useState(false);
  const [gameState, setGameState] = useState<"calibration" | "setup" | "playing" | "paused" | "gameover" | "won">("calibration");
  const [showCalibration, setShowCalibration] = useState(true);
  const [eyeData, setEyeData] = useState<EyeData | null>(null);
  const trackerRef = useRef<Awaited<ReturnType<typeof getEyeTracker>> | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const ballRef = useRef<Ball>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    dx: 3,
    dy: -3,
    radius: BALL_RADIUS,
  });

  const paddleRef = useRef<Paddle>({
    x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: GAME_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const bricksRef = useRef<Brick[]>([]);

  const saveExercise = trpc.exercises.logCompletion.useMutation({
    onSuccess: () => {
      toast.success("Oyun sonuçları kaydedildi!");
    },
  });

  // Initialize bricks
  const initBricks = () => {
    const bricks: Brick[] = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + 5) + 2.5,
          y: row * (BRICK_HEIGHT + 5) + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          visible: true,
          color: colors[row % colors.length],
        });
      }
    }

    bricksRef.current = bricks;
  };

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

  // Eye tracking loop
  useEffect(() => {
    if (!videoRef.current || !trackerRef.current || gameState !== "playing") return;

    let eyeTrackingFrameId: number;

    const trackEyes = async () => {
      if (!videoRef.current || !trackerRef.current) return;

      try {
        const faces = await trackerRef.current.detectFace(videoRef.current);
        if (faces.length > 0) {
          const eyes = trackerRef.current.extractEyeData(faces[0]);
          if (eyes) {
            setEyeData(eyes);

            // Apply calibration
            const calibratedGaze = trackerRef.current.calibrateGaze(eyes.gaze);

            // Update paddle position
            const paddleX = ((calibratedGaze.x + 1) / 2) * GAME_WIDTH;
            paddleRef.current.x = Math.max(
              0,
              Math.min(GAME_WIDTH - PADDLE_WIDTH, paddleX - PADDLE_WIDTH / 2)
            );
          }
        }
      } catch (error) {
        console.error("Eye tracking error:", error);
      }

      eyeTrackingFrameId = requestAnimationFrame(trackEyes);
    };

    trackEyes();

    return () => {
      if (eyeTrackingFrameId) {
        cancelAnimationFrame(eyeTrackingFrameId);
      }
    };
  }, [gameState]);

  // Initial canvas draw for setup state
  useEffect(() => {
    if (gameState === "setup") {
      const gameCanvas = gameCanvasRef.current;
      if (!gameCanvas) return;
      const ctx = gameCanvas.getContext("2d");
      if (!ctx) return;
      
      // Initialize game objects
      initBricks();
      resetBall();
      
      // Draw initial state
      drawGame(ctx);
    }
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameCanvas = gameCanvasRef.current;
    if (!gameCanvas) return;

    const ctx = gameCanvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Update ball position
      const ball = ballRef.current;
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Ball collision with walls
      if (ball.x + ball.radius > GAME_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Ball collision with paddle
      const paddle = paddleRef.current;
      if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
      ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI * 0.6; // Max 54 degrees
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
      }

      // Ball falls below paddle
      if (ball.y + ball.radius > GAME_HEIGHT) {
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState("gameover");
            saveGameResults(false);
          } else {
            toast.warning(`Can kaybettiniz! Kalan: ${newLives}`);
            resetBall();
          }
          return newLives;
        });
      }

      // Ball collision with bricks
      const bricks = bricksRef.current;
      for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (!brick.visible) continue;

        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          ball.dy = -ball.dy;
          brick.visible = false;
          setScore((prev) => prev + 10);
        }
      }

      // Check win condition
      if (bricks.every((brick) => !brick.visible)) {
        setGameState("won");
        saveGameResults(true);
      }

      // Draw everything
      drawGame(ctx);

      if (gameState === "playing") {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw bricks
    bricksRef.current.forEach((brick) => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = "#1e293b";
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle with glow effect
    const paddle = paddleRef.current;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#06b6d4";
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;

    // Draw ball with glow effect
    const ball = ballRef.current;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#f59e0b";
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw eye position indicator
    if (eyeData && trackerRef.current) {
      const calibratedGaze = trackerRef.current.calibrateGaze(eyeData.gaze);
      const eyeX = ((calibratedGaze.x + 1) / 2) * GAME_WIDTH;
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
      ctx.fillRect(eyeX - 2, 0, 4, GAME_HEIGHT);
    }
  };

  const resetBall = () => {
    ballRef.current = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 100,
      dx: 3 * (Math.random() > 0.5 ? 1 : -1),
      dy: -3,
      radius: BALL_RADIUS,
    };
  };

  const startGame = () => {
    if (!cameraReady) {
      toast.error("Lütfen kameranın hazır olmasını bekleyin");
      return;
    }

    // Check calibration
    if (trackerRef.current) {
      const calibrationQuality = trackerRef.current.getCalibrationQuality();
      console.log("Kalibrasyon kalitesi:", calibrationQuality);
      
      if (calibrationQuality < 0.3) {
        toast.warning("Kalibrasyon kalitesi düşük. Daha iyi sonuçlar için tekrar kalibrasyon yapabilirsiniz.");
      } else {
        console.log("✅ Kalibrasyon başarılı!");
      }
    }

    initBricks();
    resetBall();
    setScore(0);
    setLives(3);
    setGameState("playing");
    lastTimeRef.current = 0;
    toast.success("Oyun başladı! Gözlerinizi hareket ettirin.");
  };

  const pauseGame = () => {
    setGameState("paused");
  };

  const resumeGame = () => {
    setGameState("playing");
    lastTimeRef.current = 0;
  };

  const saveGameResults = (won: boolean) => {
    const duration = Math.floor(score / 10); // Rough estimate
    saveExercise.mutate({
      exerciseId: 1, // Eye tracking exercise
      durationMinutes: Math.max(1, duration),
    });
  };

  return (
    <>
    {showCalibration && (
      <EyeCalibrationWizard
        onComplete={() => {
          setShowCalibration(false);
          setGameState("setup");
          toast.success("Kalibrasyon tamamlandı! Oyuna başlayabilirsiniz.");
        }}
        onCancel={() => {
          setShowCalibration(false);
          setGameState("setup");
        }}
      />
    )}
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VisionCare - Göz Oyunu</span>
          </div>
          <Link href="/exercises">
            <Button variant="outline">Egzersizlere Dön</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          {/* Game Area */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Göz Kontrollü Breakout Oyunu</CardTitle>
                <CardDescription>
                  Gözlerinizi sağa-sola hareket ettirerek çubuğu kontrol edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={gameCanvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    className="w-full border-2 border-primary rounded-lg bg-slate-900"
                  />

                  {/* Game Over Overlay */}
                  {(gameState === "gameover" || gameState === "won") && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white space-y-4">
                        {gameState === "won" ? (
                          <>
                            <Trophy className="h-16 w-16 mx-auto text-yellow-400" />
                            <h2 className="text-4xl font-bold">Tebrikler!</h2>
                            <p className="text-xl">Tüm blokları kırdınız!</p>
                          </>
                        ) : (
                          <>
                            <Eye className="h-16 w-16 mx-auto text-red-400" />
                            <h2 className="text-4xl font-bold">Oyun Bitti</h2>
                            <p className="text-xl">Canlarınız tükendi</p>
                          </>
                        )}
                        <p className="text-2xl font-semibold">Puan: {score}</p>
                        <Button onClick={startGame} className="gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Yeniden Başla
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Paused Overlay */}
                  {gameState === "paused" && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white space-y-4">
                        <Pause className="h-16 w-16 mx-auto" />
                        <h2 className="text-3xl font-bold">Duraklatıldı</h2>
                        <Button onClick={resumeGame} className="gap-2">
                          <Play className="h-4 w-4" />
                          Devam Et
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Game Controls */}
                <div className="flex gap-4 mt-4">
                  {gameState === "setup" && (
                    <Button onClick={startGame} disabled={!cameraReady} className="flex-1 gap-2">
                      <Play className="h-4 w-4" />
                      {cameraReady ? "Oyuna Başla" : "Kamera Bekleniyor..."}
                    </Button>
                  )}
                  {gameState === "playing" && (
                    <Button onClick={pauseGame} variant="outline" className="flex-1 gap-2">
                      <Pause className="h-4 w-4" />
                      Duraklat
                    </Button>
                  )}
                  {(gameState === "playing" || gameState === "paused") && (
                    <Button onClick={startGame} variant="outline" className="flex-1 gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Yeniden Başla
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Nasıl Oynanır?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>🎯 <strong>Amaç:</strong> Tüm renkli blokları kırmak</p>
                <p>👁️ <strong>Kontrol:</strong> Gözlerinizi sağa-sola hareket ettirerek çubuğu yönlendirin</p>
                <p>⚡ <strong>Mekanik:</strong> Top çubuğa çarptığında geri sekecek ve blokları kıracak</p>
                <p>❤️ <strong>Canlar:</strong> Top yere düşerse can kaybedersiniz (3 can)</p>
                <p>💡 <strong>İpucu:</strong> Başınızı sabit tutun, sadece gözlerinizi hareket ettirin</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Camera Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Kamera Görüntüsü
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Başlatılıyor...</p>
                      </div>
                    </div>
                  )}
                  {eyeData && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Göz Algılandı ✓
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Score */}
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Puan</span>
                  <span className="text-2xl font-bold text-primary">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Canlar</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${
                          i < lives ? "bg-red-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Seviye</span>
                  <span className="text-xl font-semibold">{level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Kalan Blok</span>
                  <span className="text-xl font-semibold">
                    {bricksRef.current.filter((b) => b.visible).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Göz Sağlığı Faydaları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Göz kaslarını güçlendirir</p>
                <p>✓ Odaklanma yeteneğini geliştirir</p>
                <p>✓ Göz koordinasyonunu artırır</p>
                <p>✓ Eğlenceli egzersiz deneyimi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

