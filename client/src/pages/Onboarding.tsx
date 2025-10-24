import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Sparkles, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EyeCalibrationWizard from "@/components/EyeCalibrationWizard";

type OnboardingStep = "welcome" | "profile" | "ai-analysis" | "calibration" | "tests" | "ai-report" | "complete";

interface ProfileData {
  age: string;
  gender: string;
  occupation: string;
  dailyScreenTime: string;
  usesGlasses: string;
  symptoms: string[];
}

interface TestResult {
  testType: string;
  score: number;
  duration: number;
  accuracy: number;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [profileData, setProfileData] = useState<ProfileData>({
    age: "",
    gender: "",
    occupation: "",
    dailyScreenTime: "",
    usesGlasses: "0",
    symptoms: [],
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [finalReport, setFinalReport] = useState<any>(null);

  const analyzeProfile = trpc.ai.analyzeProfile.useMutation({
    onSuccess: (data) => {
      try {
        const parsed = JSON.parse(data.analysis);
        setAiAnalysis(parsed);
        toast.success("🤖 AI profil analizi tamamlandı!");
        setStep("calibration");
      } catch (error) {
        console.error("AI parse error:", error);
        toast.error("AI analizi okunamadı");
      }
    },
  });

  const analyzeTests = trpc.ai.analyzeTestResults.useMutation({
    onSuccess: (data) => {
      try {
        const parsed = JSON.parse(data.analysis);
        setFinalReport(parsed);
        toast.success("🎯 Test sonuçları analiz edildi!");
        setStep("complete");
      } catch (error) {
        console.error("AI parse error:", error);
        toast.error("Test analizi okunamadı");
      }
    },
  });

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profiliniz kaydedildi!");
    },
  });

  // Eye profile will be saved via profile router

  const getStepProgress = () => {
    const steps: OnboardingStep[] = ["welcome", "profile", "ai-analysis", "calibration", "tests", "ai-report", "complete"];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const handleProfileSubmit = () => {
    if (!profileData.age || !profileData.occupation || !profileData.dailyScreenTime) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    // Save profile
    upsertProfile.mutate({
      age: parseInt(profileData.age),
      gender: profileData.gender as "male" | "female" | "other" | undefined,
      occupation: profileData.occupation,
      dailyScreenTime: parseInt(profileData.dailyScreenTime),
      usesGlasses: parseInt(profileData.usesGlasses),
    });

    // Analyze with AI
    setStep("ai-analysis");
    analyzeProfile.mutate({
      age: parseInt(profileData.age),
      occupation: profileData.occupation,
      screenTime: parseInt(profileData.dailyScreenTime),
      hasGlasses: parseInt(profileData.usesGlasses) === 1,
      symptoms: profileData.symptoms,
    });
  };

  const handleCalibrationComplete = () => {
    toast.success("✅ Kalibrasyon tamamlandı!");
    setStep("tests");
  };

  const handleTestComplete = (result: TestResult) => {
    const newResults = [...testResults, result];
    setTestResults(newResults);
    
    if (currentTestIndex < 2) {
      setCurrentTestIndex(currentTestIndex + 1);
    } else {
      // All tests completed, analyze with AI
      setStep("ai-report");
      
      // Calculate overall score
      const avgScore = newResults.reduce((sum, r) => sum + r.score, 0) / newResults.length;
      const avgAccuracy = newResults.reduce((sum, r) => sum + r.accuracy, 0) / newResults.length;
      const totalDuration = newResults.reduce((sum, r) => sum + r.duration, 0);
      
      analyzeTests.mutate({
        testType: "İlk Değerlendirme",
        score: avgScore,
        duration: totalDuration,
        accuracy: avgAccuracy,
      });
    }
  };

  const handleComplete = () => {
    // Profile and test results are already saved
    toast.success("✅ Kurulum tamamlandı! Dashboard'a yönlendiriliyorsunuz...");
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1000);
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (symptom: string) => {
    setProfileData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-2">
          <Eye className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">VisionCare - İlk Kurulum</span>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <Progress value={getStepProgress()} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Adım {["welcome", "profile", "ai-analysis", "calibration", "tests", "ai-report", "complete"].indexOf(step) + 1} / 7
          </p>
        </div>

        {/* Welcome Step */}
        {step === "welcome" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">VisionCare'e Hoş Geldiniz!</CardTitle>
              <CardDescription className="text-base mt-4">
                Göz sağlığınızı takip etmek ve iyileştirmek için kişiselleştirilmiş bir yolculuğa başlıyorsunuz.
                İlk kurulum yaklaşık 10-15 dakika sürecek.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Profil Oluşturma</h4>
                    <p className="text-sm text-muted-foreground">Yaşam tarzınız ve göz sağlığınız hakkında bilgi verin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">AI Analizi</h4>
                    <p className="text-sm text-muted-foreground">Yapay zeka profilinizi analiz edip öneriler sunacak</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Göz Kalibrasyonu</h4>
                    <p className="text-sm text-muted-foreground">Hassas göz takibi için kalibrasyon yapılacak</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Temel Testler</h4>
                    <p className="text-sm text-muted-foreground">Göz sağlığınızı değerlendirmek için basit testler</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Kişisel Rapor</h4>
                    <p className="text-sm text-muted-foreground">AI test sonuçlarınızı analiz edip özel rapor hazırlayacak</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep("profile")} className="w-full gap-2" size="lg">
                Başlayalım <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Step */}
        {step === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileriniz</CardTitle>
              <CardDescription>
                Size en uygun önerileri sunabilmemiz için birkaç soru yanıtlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Yaşınız *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={profileData.age}
                    onChange={(e) => updateProfileField("age", e.target.value)}
                    placeholder="Örn: 28"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Cinsiyet</Label>
                  <Select value={profileData.gender} onValueChange={(value) => updateProfileField("gender", value)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Erkek</SelectItem>
                      <SelectItem value="female">Kadın</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Mesleğiniz *</Label>
                  <Input
                    id="occupation"
                    value={profileData.occupation}
                    onChange={(e) => updateProfileField("occupation", e.target.value)}
                    placeholder="Örn: Yazılım Geliştirici"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenTime">Günlük Ekran Süresi (saat) *</Label>
                  <Input
                    id="screenTime"
                    type="number"
                    min="0"
                    max="24"
                    value={profileData.dailyScreenTime}
                    onChange={(e) => updateProfileField("dailyScreenTime", e.target.value)}
                    placeholder="Örn: 8"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="usesGlasses">Gözlük/Lens Kullanıyor musunuz?</Label>
                  <Select value={profileData.usesGlasses} onValueChange={(value) => updateProfileField("usesGlasses", value)}>
                    <SelectTrigger id="usesGlasses">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Hayır</SelectItem>
                      <SelectItem value="1">Evet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Yaşadığınız Semptomlar</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Göz yorgunluğu",
                    "Baş ağrısı",
                    "Bulanık görme",
                    "Kuru göz",
                    "Göz sulanması",
                    "Işığa hassasiyet",
                  ].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={profileData.symptoms.includes(symptom)}
                        onCheckedChange={() => toggleSymptom(symptom)}
                      />
                      <label htmlFor={symptom} className="text-sm cursor-pointer">
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setStep("welcome")} variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Geri
                </Button>
                <Button onClick={handleProfileSubmit} disabled={upsertProfile.isPending} className="flex-1 gap-2">
                  {upsertProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      Devam Et <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Step */}
        {step === "ai-analysis" && (
          <Card>
            <CardHeader className="text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <CardTitle>AI Profilinizi Analiz Ediyor...</CardTitle>
              <CardDescription>
                Yapay zeka, bilgilerinizi değerlendirip size özel öneriler hazırlıyor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyzeProfile.isPending && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="text-muted-foreground">Bu birkaç saniye sürebilir...</p>
                </div>
              )}

              {aiAnalysis && (
                <Alert className="bg-primary/5 border-primary/20">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3 mt-2">
                      <div>
                        <strong className="text-primary">Risk Seviyesi:</strong>{" "}
                        <span className={
                          aiAnalysis.riskLevel === "yüksek" ? "text-red-600 font-semibold" :
                          aiAnalysis.riskLevel === "orta" ? "text-yellow-600 font-semibold" :
                          "text-green-600 font-semibold"
                        }>
                          {aiAnalysis.riskLevel?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <strong className="text-primary">Analiz:</strong>
                        <p className="text-sm mt-1">{aiAnalysis.analysis}</p>
                      </div>
                      {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                        <div>
                          <strong className="text-primary">Öneriler:</strong>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            {aiAnalysis.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Calibration Step */}
        {step === "calibration" && (
          <EyeCalibrationWizard
            onComplete={handleCalibrationComplete}
            onCancel={() => setStep("profile")}
          />
        )}

        {/* Tests Step */}
        {step === "tests" && (
          <Card>
            <CardHeader>
              <CardTitle>Temel Göz Testleri ({currentTestIndex + 1}/3)</CardTitle>
              <CardDescription>
                Göz sağlığınızı değerlendirmek için basit testler yapacağız
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Simple test implementation */}
              <div className="text-center py-12">
                <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {currentTestIndex === 0 && "Görme Keskinliği Testi"}
                  {currentTestIndex === 1 && "Kontrast Duyarlılığı Testi"}
                  {currentTestIndex === 2 && "Renk Görme Testi"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Test {currentTestIndex + 1} hazırlanıyor...
                </p>
                <Button
                  onClick={() => {
                    // Simulate test completion
                    handleTestComplete({
                      testType: ["Görme Keskinliği", "Kontrast", "Renk Görme"][currentTestIndex],
                      score: 70 + Math.random() * 30,
                      duration: 30 + Math.random() * 30,
                      accuracy: 75 + Math.random() * 25,
                    });
                  }}
                  size="lg"
                >
                  Testi Başlat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Report Step */}
        {step === "ai-report" && (
          <Card>
            <CardHeader className="text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <CardTitle>Test Sonuçlarınız Analiz Ediliyor...</CardTitle>
              <CardDescription>
                AI, test sonuçlarınızı değerlendirip kişisel raporunuzu hazırlıyor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyzeTests.isPending && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="text-muted-foreground">Sonuçlarınız analiz ediliyor...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === "complete" && finalReport && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle className="text-3xl">Kurulum Tamamlandı!</CardTitle>
              <CardDescription className="text-base mt-4">
                Göz sağlığı profiliniz başarıyla oluşturuldu. İşte kişisel raporunuz:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3 mt-2">
                    <div>
                      <strong className="text-primary">Genel Performans:</strong>{" "}
                      <span className="font-semibold">{finalReport.performance?.toUpperCase()}</span>
                    </div>
                    <div>
                      <strong className="text-primary">Geri Bildirim:</strong>
                      <p className="text-sm mt-1">{finalReport.feedback}</p>
                    </div>
                    {finalReport.suggestions && finalReport.suggestions.length > 0 && (
                      <div>
                        <strong className="text-primary">Öneriler:</strong>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          {finalReport.suggestions.map((sug: string, idx: number) => (
                            <li key={idx}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {finalReport.nextSteps && finalReport.nextSteps.length > 0 && (
                      <div>
                        <strong className="text-primary">Sonraki Adımlar:</strong>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          {finalReport.nextSteps.map((step: string, idx: number) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <Button onClick={handleComplete} className="w-full gap-2" size="lg">
                Dashboard'a Git <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

