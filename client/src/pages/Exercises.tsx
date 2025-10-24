import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Eye, Clock, Target, CheckCircle2, Play } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Exercises() {
  const { isAuthenticated } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [exerciseTime, setExerciseTime] = useState(0);

  const { data: exercises, isLoading } = trpc.exercises.getAll.useQuery();
  const logExercise = trpc.exercises.logCompletion.useMutation({
    onSuccess: () => {
      toast.success("Egzersiz başarıyla kaydedildi!");
      setIsExercising(false);
      setExerciseTime(0);
      setSelectedExercise(null);
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Başlangıç";
      case "intermediate":
        return "Orta";
      case "advanced":
        return "İleri";
      default:
        return difficulty;
    }
  };

  const startExercise = (exercise: any) => {
    if (!isAuthenticated) {
      toast.error("Egzersiz yapmak için giriş yapmalısınız");
      return;
    }
    setSelectedExercise(exercise);
    setIsExercising(true);
    setExerciseTime(0);

    // Simulate exercise timer
    const interval = setInterval(() => {
      setExerciseTime((prev) => {
        if (prev >= exercise.durationMinutes * 60) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const completeExercise = () => {
    if (selectedExercise) {
      logExercise.mutate({
        exerciseId: selectedExercise.id,
        durationMinutes: Math.ceil(exerciseTime / 60),
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VisionCare</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/tests">
              <Button variant="ghost">Testler</Button>
            </Link>
            <Link href="/exercises">
              <Button variant="default">Egzersizler</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Göz Egzersizleri</h1>
          <p className="text-muted-foreground mt-2">
            Bilimsel olarak kanıtlanmış göz egzersizleri ile göz sağlığınızı koruyun
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises?.map((exercise) => {
            const instructions = exercise.instructions ? JSON.parse(exercise.instructions) : [];

            return (
              <Card key={exercise.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <Badge className={getDifficultyColor(exercise.difficulty || "beginner")}>
                      {getDifficultyLabel(exercise.difficulty || "beginner")}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {exercise.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{exercise.durationMinutes} dakika</span>
                    </div>
                    {exercise.targetCondition && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span className="line-clamp-1">{exercise.targetCondition}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full gap-2"
                      onClick={() => startExercise(exercise)}
                    >
                      <Play className="h-4 w-4" />
                      Egzersize Başla
                    </Button>
                    <Dialog>
                      <Button variant="outline" className="w-full" onClick={() => setSelectedExercise(exercise)}>
                        Detayları Gör
                      </Button>
                      {selectedExercise?.id === exercise.id && !isExercising && (
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{exercise.name}</DialogTitle>
                            <DialogDescription>{exercise.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{exercise.durationMinutes} dakika</span>
                              </div>
                              <Badge className={getDifficultyColor(exercise.difficulty || "beginner")}>
                                {getDifficultyLabel(exercise.difficulty || "beginner")}
                              </Badge>
                            </div>

                            {exercise.targetCondition && (
                              <div>
                                <h4 className="font-semibold mb-2">Hedef Durum:</h4>
                                <p className="text-sm text-muted-foreground">{exercise.targetCondition}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-2">Talimatlar:</h4>
                              <ol className="list-decimal list-inside space-y-2">
                                {instructions.map((instruction: string, index: number) => (
                                  <li key={index} className="text-sm text-muted-foreground">
                                    {instruction}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <Button className="w-full gap-2" onClick={() => startExercise(exercise)}>
                              <Play className="h-4 w-4" />
                              Egzersize Başla
                            </Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Exercise in Progress Dialog */}
        {isExercising && selectedExercise && (
          <Dialog open={isExercising} onOpenChange={setIsExercising}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedExercise.name}</DialogTitle>
                <DialogDescription>Egzersizi tamamlayın</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary">
                    {formatTime(exerciseTime)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Hedef: {selectedExercise.durationMinutes} dakika
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Talimatlar:</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {(selectedExercise.instructions ? JSON.parse(selectedExercise.instructions) : []).map(
                      (instruction: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {instruction}
                        </li>
                      )
                    )}
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 gap-2"
                    onClick={completeExercise}
                    disabled={logExercise.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {logExercise.isPending ? "Kaydediliyor..." : "Egzersizi Tamamla"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsExercising(false);
                      setExerciseTime(0);
                    }}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}

