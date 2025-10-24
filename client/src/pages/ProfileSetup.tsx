import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, Sparkles, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    occupation: "",
    dailyScreenTime: "",
    dailyOutdoorTime: "",
    sleepHours: "",
    usesGlasses: "0",
    rightEyeDiopter: "",
    leftEyeDiopter: "",
    hasAstigmatism: "0",
    astigmatismDegree: "",
    familyHistory: "",
  });

  const analyzeProfile = trpc.ai.analyzeProfile.useMutation({
    onSuccess: (data) => {
      try {
        // Try to parse as JSON
        let parsed;
        try {
          parsed = JSON.parse(data.analysis);
        } catch {
          // If not valid JSON, create a fallback structure
          parsed = {
            riskLevel: "orta",
            analysis: data.analysis,
            recommendations: ["Düzenli göz egzersizleri yapın", "Ekran molaları verin"],
            exerciseFrequency: "günde 2-3 kez",
            warnings: ["Uzun süreli ekran kullanımından kaçının"]
          };
        }
        setAiAnalysis(parsed);
        setShowAIAnalysis(true);
        toast.success("🤖 AI analizi tamamlandı!");
      } catch (error) {
        console.error("AI response parse error:", error);
        toast.error("AI analizi okunamadı");
      }
    },
    onError: (error) => {
      toast.error("AI analizi başarısız: " + error.message);
    },
  });

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profiliniz başarıyla oluşturuldu!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Profil oluşturulurken hata oluştu: " + error.message);
    },
  });

  const handleAIAnalysis = () => {
    if (!formData.age || !formData.occupation || !formData.dailyScreenTime) {
      toast.error("Lütfen yaş, meslek ve ekran süresi bilgilerini girin");
      return;
    }

    analyzeProfile.mutate({
      age: parseInt(formData.age),
      occupation: formData.occupation,
      screenTime: parseInt(formData.dailyScreenTime),
      hasGlasses: parseInt(formData.usesGlasses) === 1,
      symptoms,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.age) {
      toast.error("Lütfen yaşınızı girin");
      return;
    }

    upsertProfile.mutate({
      age: parseInt(formData.age),
      gender: formData.gender as "male" | "female" | "other" | undefined,
      occupation: formData.occupation || undefined,
      dailyScreenTime: formData.dailyScreenTime ? parseInt(formData.dailyScreenTime) : undefined,
      dailyOutdoorTime: formData.dailyOutdoorTime ? parseInt(formData.dailyOutdoorTime) : undefined,
      sleepHours: formData.sleepHours ? parseInt(formData.sleepHours) : undefined,
      usesGlasses: parseInt(formData.usesGlasses),
      rightEyeDiopter: formData.rightEyeDiopter || undefined,
      leftEyeDiopter: formData.leftEyeDiopter || undefined,
      hasAstigmatism: parseInt(formData.hasAstigmatism),
      astigmatismDegree: formData.astigmatismDegree || undefined,
      familyHistory: formData.familyHistory || undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-2">
          <Eye className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">VisionCare</span>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Göz Sağlığı Profili Oluştur</CardTitle>
            <CardDescription>
              Kişiselleştirilmiş öneriler ve egzersiz programları için bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Temel Bilgiler</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Yaş *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Cinsiyet</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Meslek</Label>
                  <Input
                    id="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => updateField("occupation", e.target.value)}
                    placeholder="Örn: Yazılım Geliştirici"
                  />
                </div>
              </div>

              {/* Yaşam Tarzı */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Yaşam Tarzı</h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenTime">Günlük Ekran Süresi (saat)</Label>
                    <Input
                      id="screenTime"
                      type="number"
                      min="0"
                      max="24"
                      value={formData.dailyScreenTime}
                      onChange={(e) => updateField("dailyScreenTime", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outdoorTime">Günlük Dış Mekan Süresi (saat)</Label>
                    <Input
                      id="outdoorTime"
                      type="number"
                      min="0"
                      max="24"
                      value={formData.dailyOutdoorTime}
                      onChange={(e) => updateField("dailyOutdoorTime", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleepHours">Günlük Uyku Süresi (saat)</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      min="0"
                      max="24"
                      value={formData.sleepHours}
                      onChange={(e) => updateField("sleepHours", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Göz Durumu */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Göz Durumu</h3>

                <div className="space-y-2">
                  <Label htmlFor="usesGlasses">Gözlük/Lens Kullanıyor musunuz?</Label>
                  <Select value={formData.usesGlasses} onValueChange={(value) => updateField("usesGlasses", value)}>
                    <SelectTrigger id="usesGlasses">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Hayır</SelectItem>
                      <SelectItem value="1">Evet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.usesGlasses === "1" && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rightEye">Sağ Göz Derecesi</Label>
                      <Input
                        id="rightEye"
                        type="text"
                        value={formData.rightEyeDiopter}
                        onChange={(e) => updateField("rightEyeDiopter", e.target.value)}
                        placeholder="Örn: -2.50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leftEye">Sol Göz Derecesi</Label>
                      <Input
                        id="leftEye"
                        type="text"
                        value={formData.leftEyeDiopter}
                        onChange={(e) => updateField("leftEyeDiopter", e.target.value)}
                        placeholder="Örn: -2.75"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="hasAstigmatism">Astigmat var mı?</Label>
                  <Select value={formData.hasAstigmatism} onValueChange={(value) => updateField("hasAstigmatism", value)}>
                    <SelectTrigger id="hasAstigmatism">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Hayır</SelectItem>
                      <SelectItem value="1">Evet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.hasAstigmatism === "1" && (
                  <div className="space-y-2">
                    <Label htmlFor="astigmatismDegree">Astigmat Derecesi</Label>
                    <Input
                      id="astigmatismDegree"
                      type="text"
                      value={formData.astigmatismDegree}
                      onChange={(e) => updateField("astigmatismDegree", e.target.value)}
                      placeholder="Örn: -1.00"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Aile Geçmişi</Label>
                  <Textarea
                    id="familyHistory"
                    value={formData.familyHistory}
                    onChange={(e) => updateField("familyHistory", e.target.value)}
                    placeholder="Ailenizde göz hastalığı öyküsü var mı? (Miyopi, katarakt, glokom vb.)"
                    rows={3}
                  />
                </div>
              </div>

              {/* Semptomlar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Yaşadığınız Semptomlar</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Göz yorgunluğu",
                    "Baş ağrısı",
                    "Bulanık görme",
                    "Kuru göz",
                    "Göz sulanması",
                    "Işığa hassasiyet",
                    "Görme alanında kısıtlama",
                    "Renk algısında değişiklik",
                  ].map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={symptoms.includes(symptom)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSymptoms([...symptoms, symptom]);
                          } else {
                            setSymptoms(symptoms.filter((s) => s !== symptom));
                          }
                        }}
                      />
                      <label htmlFor={symptom} className="text-sm cursor-pointer">
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analiz Butonu */}
              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAIAnalysis}
                  disabled={analyzeProfile.isPending}
                  className="w-full gap-2"
                >
                  {analyzeProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI ile Profil Analizi Yap
                    </>
                  )}
                </Button>
              </div>

              {/* AI Analiz Sonuçları */}
              {showAIAnalysis && aiAnalysis && (
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
                            {aiAnalysis.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.exerciseFrequency && (
                        <div>
                          <strong className="text-primary">Egzersiz Sıklığı:</strong>{" "}
                          <span className="text-sm">{aiAnalysis.exerciseFrequency}</span>
                        </div>
                      )}
                      {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
                        <div>
                          <strong className="text-red-600">Uyarılar:</strong>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1 text-red-600">
                            {aiAnalysis.warnings.map((warning: string, idx: number) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={upsertProfile.isPending} className="flex-1">
                  {upsertProfile.isPending ? "Kaydediliyor..." : "Profili Kaydet"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

