import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Eye, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const SNELLEN_CHART = [
  { size: "6xl", letters: "E", distance: "6/60", score: 20 },
  { size: "5xl", letters: "F P", distance: "6/36", score: 40 },
  { size: "4xl", letters: "T O Z", distance: "6/24", score: 50 },
  { size: "3xl", letters: "L P E D", distance: "6/18", score: 60 },
  { size: "2xl", letters: "P E C F D", distance: "6/12", score: 75 },
  { size: "xl", letters: "E D F C Z P", distance: "6/9", score: 85 },
  { size: "lg", letters: "F E L O P Z D", distance: "6/6", score: 100 },
  { size: "base", letters: "D E F P O T E C", distance: "6/5", score: 120 },
];

export default function SnellenTest() {
  const [, setLocation] = useLocation();
  const [currentEye, setCurrentEye] = useState<"right" | "left" | "both">("right");
  const [currentLine, setCurrentLine] = useState(0);
  const [scores, setScores] = useState({ right: 0, left: 0, both: 0 });
  const [testComplete, setTestComplete] = useState(false);

  const saveTest = trpc.tests.save.useMutation({
    onSuccess: () => {
      toast.success("Test sonuçları kaydedildi!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Test kaydedilirken hata: " + error.message);
    },
  });

  const handleCanRead = () => {
    if (currentLine < SNELLEN_CHART.length - 1) {
      setCurrentLine(currentLine + 1);
    } else {
      completeEyeTest(SNELLEN_CHART[currentLine].score);
    }
  };

  const handleCannotRead = () => {
    const score = currentLine > 0 ? SNELLEN_CHART[currentLine - 1].score : 0;
    completeEyeTest(score);
  };

  const completeEyeTest = (score: number) => {
    const newScores = { ...scores };

    if (currentEye === "right") {
      newScores.right = score;
      setScores(newScores);
      setCurrentEye("left");
      setCurrentLine(0);
      toast.info("Sağ göz testi tamamlandı! Şimdi sol gözünüzü test edin.");
    } else if (currentEye === "left") {
      newScores.left = score;
      setScores(newScores);
      setCurrentEye("both");
      setCurrentLine(0);
      toast.info("Sol göz testi tamamlandı! Şimdi her iki gözle test edin.");
    } else {
      newScores.both = score;
      setScores(newScores);
      setTestComplete(true);
    }
  };

  const handleSaveResults = () => {
    saveTest.mutate({
      testType: "snellen",
      rightEyeScore: `${scores.right}/120`,
      leftEyeScore: `${scores.left}/120`,
      binocularScore: `${scores.both}/120`,
      rawData: JSON.stringify(scores),
    });
  };

  const getEyeInstruction = () => {
    switch (currentEye) {
      case "right":
        return "Sol gözünüzü kapatın, sadece sağ gözünüzle okuyun";
      case "left":
        return "Sağ gözünüzü kapatın, sadece sol gözünüzle okuyun";
      case "both":
        return "Her iki gözünüzle okuyun";
    }
  };

  const getScoreInterpretation = (score: number) => {
    if (score >= 100) return { label: "Mükemmel", color: "text-green-600" };
    if (score >= 75) return { label: "İyi", color: "text-blue-600" };
    if (score >= 50) return { label: "Orta", color: "text-yellow-600" };
    if (score >= 25) return { label: "Zayıf", color: "text-orange-600" };
    return { label: "Çok Zayıf", color: "text-red-600" };
  };

  if (testComplete) {
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
              <CardDescription>Snellen görme keskinliği test sonuçlarınız</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Sağ Göz</p>
                    <p className="text-sm text-muted-foreground">{scores.right}/120 puan</p>
                  </div>
                  <span className={`font-semibold ${getScoreInterpretation(scores.right).color}`}>
                    {getScoreInterpretation(scores.right).label}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Sol Göz</p>
                    <p className="text-sm text-muted-foreground">{scores.left}/120 puan</p>
                  </div>
                  <span className={`font-semibold ${getScoreInterpretation(scores.left).color}`}>
                    {getScoreInterpretation(scores.left).label}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Her İki Göz</p>
                    <p className="text-sm text-muted-foreground">{scores.both}/120 puan</p>
                  </div>
                  <span className={`font-semibold ${getScoreInterpretation(scores.both).color}`}>
                    {getScoreInterpretation(scores.both).label}
                  </span>
                </div>
              </div>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Önemli Not:</h4>
                <p className="text-sm text-muted-foreground">
                  Bu test profesyonel bir göz muayenesinin yerini tutmaz. Düşük skorlar aldıysanız 
                  veya görme problemleri yaşıyorsanız lütfen bir göz doktoruna başvurun.
                </p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" onClick={handleSaveResults} disabled={saveTest.isPending}>
                  {saveTest.isPending ? "Kaydediliyor..." : "Sonuçları Kaydet"}
                </Button>
                <Link href="/tests">
                  <Button variant="outline">Testlere Dön</Button>
                </Link>
              </div>
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

      <main className="container py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Snellen Görme Keskinliği Testi</CardTitle>
            <CardDescription>{getEyeInstruction()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Progress */}
            <div className="flex justify-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${currentEye === "right" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                Sağ Göz
              </div>
              <div className={`px-4 py-2 rounded-lg ${currentEye === "left" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                Sol Göz
              </div>
              <div className={`px-4 py-2 rounded-lg ${currentEye === "both" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                Her İki Göz
              </div>
            </div>

            {/* Chart Display */}
            <div className="bg-white p-12 rounded-lg border-2 min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-center space-y-8">
                <p className="text-sm text-muted-foreground">
                  {SNELLEN_CHART[currentLine].distance}
                </p>
                <div className={`font-mono font-bold text-${SNELLEN_CHART[currentLine].size} tracking-wider`}>
                  {SNELLEN_CHART[currentLine].letters}
                </div>
                <p className="text-xs text-muted-foreground">
                  Satır {currentLine + 1} / {SNELLEN_CHART.length}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-accent/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Talimatlar:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Ekrandan yaklaşık 2-3 metre uzaklaşın</li>
                <li>{getEyeInstruction()}</li>
                <li>Harfleri net olarak okuyabiliyorsanız "Okuyabiliyorum" butonuna basın</li>
                <li>Harfleri net okuyamıyorsanız "Okuyamıyorum" butonuna basın</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1 gap-2"
                variant="outline"
                onClick={handleCannotRead}
              >
                <ArrowLeft className="h-4 w-4" />
                Okuyamıyorum
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleCanRead}
              >
                Okuyabiliyorum
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

