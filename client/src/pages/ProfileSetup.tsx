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
import { Eye } from "lucide-react";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
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

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profiliniz başarıyla oluşturuldu!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Profil oluşturulurken hata oluştu: " + error.message);
    },
  });

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

