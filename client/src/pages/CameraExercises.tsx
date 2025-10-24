import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, Play, RotateCw, Zap, Target } from "lucide-react";
import { toast } from "sonner";

interface ExerciseResult {
  name: string;
  score: number;
  maxScore: number;
  duration: number;
  timestamp: Date;
}

const EXERCISES = [
  {
    id: "eye-tracking",
    name: "Hızlı Göz Takip",
    description: "Ekranda hareket eden topları gözünüzle takip edin",
    duration: 120,
    icon: Target,
  },
  {
    id: "eye-rotation",
    name: "Göz Rotasyonu",
    description: "4 köşeye sırayla bakın",
    duration: 120,
    icon: RotateCw,
  },
  {
    id: "focus",
    name: "Yakın-Uzak Odaklanma",
    description: "Yakın ve uzak nesnelere odaklanın",
    duration: 120,
    icon: Eye,
  },
  {
    id: "stability",
    name: "Göz Stabilite",
    description: "Sabit noktaya bakışınızı ölçün",
    duration: 120,
    icon: Zap,
  },
];

export default function CameraExercises() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [cameraReady, setCameraReady] = useState(false);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch (error) {
        toast.error("Kamera erişimi başarısız");
      }
    };

    if (selectedExercise) {
      initCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedExercise]);

  // Exercise timer
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          completeExercise();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startExercise = (exerciseId: string) => {
    const exercise = EXERCISES.find(e => e.id === exerciseId);
    if (!exercise) return;

    setSelectedExercise(exerciseId);
    setTimeLeft(exercise.duration);
    setScore(0);
    setMaxScore(100);
    setIsRunning(true);
  };

  const completeExercise = () => {
    const exercise = EXERCISES.find(e => e.id === selectedExercise);
    if (!exercise) return;

    const result: ExerciseResult = {
      name: exercise.name,
      score,
      maxScore,
      duration: exercise.duration,
      timestamp: new Date(),
    };

    setResults([...results, result]);
    toast.success(`✅ ${exercise.name} tamamlandı! Puan: ${score}/${maxScore}`);
    setSelectedExercise(null);
    setIsRunning(false);
  };

  const skipExercise = () => {
    setSelectedExercise(null);
    setIsRunning(false);
  };

  // Simulate score increase
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setScore(prev => Math.min(prev + Math.random() * 5, maxScore));
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, maxScore]);

  if (selectedExercise && isRunning) {
    const exercise = EXERCISES.find(e => e.id === selectedExercise);
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{exercise?.name}</CardTitle>
              <CardDescription>{exercise?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Camera Feed */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-96 object-cover"
                />
                
                {/* Exercise Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {selectedExercise === "eye-tracking" && (
                    <div className="animate-pulse">
                      <div className="w-8 h-8 bg-red-500 rounded-full" />
                    </div>
                  )}
                  {selectedExercise === "eye-rotation" && (
                    <div className="grid grid-cols-3 gap-8 w-48 h-48">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full transition-all ${
                            i === 4 ? "bg-blue-500 scale-150" : "bg-gray-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {selectedExercise === "focus" && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-2" />
                        <p className="text-white text-sm">Yakın</p>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2" />
                        <p className="text-white text-sm">Uzak</p>
                      </div>
                    </div>
                  )}
                  {selectedExercise === "stability" && (
                    <div className="text-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto animate-pulse" />
                      <p className="text-white text-sm mt-2">Sabit noktaya bakın</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timer and Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Kalan Süre</p>
                  <p className="text-3xl font-bold text-primary">{timeLeft}s</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Puan</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(score)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Progress value={(score / maxScore) * 100} />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(score)}/{maxScore}
                </p>
              </div>

              {/* Controls */}
              <Button onClick={skipExercise} variant="outline" className="w-full">
                Atla
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Göz Egzersizleri</h1>
          <p className="text-muted-foreground">
            Kamera ile gerçek zamanlı göz egzersizleri yapın. Her egzersiz maksimum 2 dakika sürer.
          </p>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <Zap className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Bugün {results.length} egzersiz tamamladınız! Toplam puan: {results.reduce((sum, r) => sum + r.score, 0)}
            </AlertDescription>
          </Alert>
        )}

        {/* Exercises Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {EXERCISES.map(exercise => {
            const Icon = exercise.icon;
            const completed = results.some(r => r.name === exercise.name);
            const lastResult = results.find(r => r.name === exercise.name);

            return (
              <Card key={exercise.id} className={completed ? "border-green-500 bg-green-50" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {exercise.name}
                      </CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </div>
                    {completed && <div className="text-2xl">✅</div>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Süre: {exercise.duration}s</span>
                    {lastResult && (
                      <span className="text-green-600 font-semibold">
                        Son Puan: {Math.round(lastResult.score)}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => startExercise(exercise.id)}
                    className="w-full gap-2"
                    disabled={isRunning}
                  >
                    <Play className="h-4 w-4" />
                    Başla
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Results History */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Egzersiz Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString("tr-TR")}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{Math.round(result.score)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

